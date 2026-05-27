import API from '../api/axios';

const GOOGLE_SCRIPT_ID = 'google-gsi-client';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const APPLE_SCRIPT_ID = 'apple-signin-client';
const APPLE_SCRIPT_SRC = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

const scriptCache = {};

function makeError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function firstConfigValue(...values) {
  for (const value of values) {
    if (!value) continue;
    const first = `${value}`.split(',').map((item) => item.trim()).find(Boolean);
    if (first) return first;
  }
  return '';
}

function buildAuthPayload(response) {
  const payload = response?.data?.data ?? response?.data ?? {};
  const token = payload?.token;
  if (!token) throw makeError('Token missing in auth response.', 'OAUTH_RESPONSE_INVALID');

  if (payload.user && typeof payload.user === 'object') {
    return { token, userData: payload.user };
  }

  const { token: ignored, ...userData } = payload;
  return { token, userData };
}

async function loadExternalScript(id, src) {
  if (scriptCache[id]) return scriptCache[id];

  scriptCache[id] = new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(makeError(`Unable to load script: ${src}`, 'OAUTH_SCRIPT_LOAD_FAILED'));
    document.head.appendChild(script);
  });

  return scriptCache[id];
}

async function exchangeIdToken(provider, { idToken, name, role = 'CUSTOMER' }) {
  const body = { idToken, role };
  if (name) body.name = name;
  const response = await API.post(`/auth/${provider}`, body);
  return buildAuthPayload(response);
}

function getGoogleClientId() {
  return firstConfigValue(process.env.REACT_APP_GOOGLE_CLIENT_ID, process.env.REACT_APP_GOOGLE_CLIENT_IDS);
}

function getAppleClientId() {
  return firstConfigValue(process.env.REACT_APP_APPLE_CLIENT_ID, process.env.REACT_APP_APPLE_CLIENT_IDS);
}

export function isGoogleOAuthConfigured() {
  return Boolean(getGoogleClientId());
}

export function isAppleOAuthConfigured() {
  return Boolean(getAppleClientId());
}

function getAppleRedirectUri() {
  return firstConfigValue(process.env.REACT_APP_APPLE_REDIRECT_URI) || window.location.origin;
}

function getAppleState() {
  return `quickbitx_${Date.now()}`;
}

function normalizeAppleName(user) {
  if (!user || typeof user !== 'object') return '';

  const firstName = user?.name?.firstName || '';
  const lastName = user?.name?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName;
}

export async function signInWithGoogle(role = 'CUSTOMER') {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw makeError(
      'Google client id missing. Set REACT_APP_GOOGLE_CLIENT_ID in user-app/.env.',
      'OAUTH_CONFIG_MISSING',
    );
  }

  await loadExternalScript(GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC);
  if (!window.google?.accounts?.id) {
    throw makeError('Google Sign-In SDK not available.', 'OAUTH_SDK_UNAVAILABLE');
  }

  const credential = await new Promise((resolve, reject) => {
    let settled = false;

    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    const timeout = window.setTimeout(() => {
      done(reject, makeError('Google sign-in timed out. Try again.', 'OAUTH_TIMEOUT'));
    }, 60000);

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          window.clearTimeout(timeout);
          if (response?.credential) {
            done(resolve, response.credential);
            return;
          }
          done(reject, makeError('Google did not return an id token.', 'OAUTH_TOKEN_MISSING'));
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (settled) return;
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          window.clearTimeout(timeout);
          done(reject, makeError('Google sign-in popup was closed or blocked.', 'OAUTH_CANCELLED'));
        }
      });
    } catch (error) {
      window.clearTimeout(timeout);
      done(reject, error);
    }
  });

  return exchangeIdToken('google', { idToken: credential, role });
}

export async function signInWithApple(role = 'CUSTOMER') {
  const clientId = getAppleClientId();
  if (!clientId) {
    throw makeError(
      'Apple client id missing. Set REACT_APP_APPLE_CLIENT_ID in user-app/.env.',
      'OAUTH_CONFIG_MISSING',
    );
  }

  await loadExternalScript(APPLE_SCRIPT_ID, APPLE_SCRIPT_SRC);
  if (!window.AppleID?.auth) {
    throw makeError('Apple Sign-In SDK not available.', 'OAUTH_SDK_UNAVAILABLE');
  }

  try {
    window.AppleID.auth.init({
      clientId,
      scope: 'name email',
      redirectURI: getAppleRedirectUri(),
      state: getAppleState(),
      usePopup: true,
    });

    const response = await window.AppleID.auth.signIn();
    const idToken = response?.authorization?.id_token;
    if (!idToken) {
      throw makeError('Apple did not return an id token.', 'OAUTH_TOKEN_MISSING');
    }

    const name = normalizeAppleName(response?.user);
    return exchangeIdToken('apple', { idToken, name, role });
  } catch (error) {
    if (error?.error === 'popup_closed_by_user') {
      throw makeError('Apple sign-in popup closed.', 'OAUTH_CANCELLED');
    }
    if (error?.message?.includes('popup')) {
      throw makeError(error.message, 'OAUTH_CANCELLED');
    }
    throw error;
  }
}
