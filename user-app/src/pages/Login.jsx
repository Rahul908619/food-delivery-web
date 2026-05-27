import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import popup from '../components/CustomToast';
import {
  normalizeLoginIdentifier,
  validateLoginIdentifier,
  validatePassword,
} from '../utils/validation';
import {
  isAppleOAuthConfigured,
  isGoogleOAuthConfigured,
  signInWithApple,
  signInWithGoogle,
} from '../utils/socialAuth';
import './Login.css';

/* ────────────────────────────────────────────
   PREMIUM QUICKBITX LOGO — Reusable Component
   A hexagonal shield with fork + bolt fusion
   ──────────────────────────────────────────── */

const QuickBitXLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF6A00" />
        <stop offset="100%" stopColor="#EE0044" />
      </linearGradient>
      <linearGradient id="innerGrad" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="boltGrad" x1="50" y1="25" x2="70" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF" />
        <stop offset="100%" stopColor="#FFD4A8" />
      </linearGradient>
    </defs>

    {/* Outer rounded hexagon shape */}
    <path
      d="M60 6 L108 30 L108 90 L60 114 L12 90 L12 30 Z"
      fill="url(#logoGrad)"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1.5"
      rx="12"
    />

    {/* Inner subtle border ring */}
    <path
      d="M60 14 L102 34 L102 86 L60 106 L18 86 L18 34 Z"
      fill="none"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />

    {/* Fork prongs (left side — representing food) */}
    <g opacity="0.9">
      <rect x="34" y="28" width="3.5" height="22" rx="1.75" fill="url(#innerGrad)" />
      <rect x="42" y="28" width="3.5" height="22" rx="1.75" fill="url(#innerGrad)" />
      <rect x="50" y="28" width="3.5" height="22" rx="1.75" fill="url(#innerGrad)" />
      {/* Fork handle */}
      <path d="M35.5 50 Q35.5 55 42 55 Q48.5 55 48.5 50" fill="none" stroke="url(#innerGrad)" strokeWidth="3" strokeLinecap="round" />
      <rect x="40.5" y="54" width="3.5" height="14" rx="1.75" fill="url(#innerGrad)" />
    </g>

    {/* Lightning bolt (right side — representing speed) */}
    <g filter="url(#logoGlow)">
      <path
        d="M72 26 L62 56 L74 56 L64 94 L90 50 L76 50 L88 26 Z"
        fill="url(#boltGrad)"
        opacity="0.95"
      />
    </g>

    {/* Small speed lines */}
    <line x1="28" y1="76" x2="38" y2="76" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="83" x2="36" y2="83" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="90" x2="38" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ────────────────────────────────────────────
   Inline SVG Icons
   ──────────────────────────────────────────── */

const IconFire = () => (
  <svg viewBox="0 0 24 24"><path d="M12 23c-3.6 0-8-2.9-8-8.3C4 9.4 9.6 3.3 11.4 1.4c.3-.3.8-.3 1.1 0C14.4 3.3 20 9.4 20 14.7c0 5.4-4.4 8.3-8 8.3zm0-18.8C9.5 7 6 11.7 6 14.7 6 18.6 9 21 12 21s6-2.4 6-6.3c0-3-3.5-7.7-6-10.5z"/></svg>
);

const IconStore = () => (
  <svg viewBox="0 0 24 24"><path d="M4 7h16v2H4zm-1 4h18l-1.5 9H4.5zm2-8h14v2H5z"/></svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8-5-4.9 6.9-1z"/></svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
);

const IconEyeOpen = () => (
  <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>
);

const IconEyeClosed = () => (
  <svg viewBox="0 0 24 24"><path d="M12 7c2.8 0 5 2.2 5 5 0 .6-.1 1.3-.4 1.8l2.9 2.9c1.5-1.3 2.7-2.9 3.5-4.7-1.7-4.4-6-7.5-11-7.5-1.4 0-2.7.3-4 .7l2.2 2.2c.5-.3 1.2-.4 1.8-.4zM2 4.3l2.3 2.3.4.4C3.1 8.3 1.9 10 1 12c1.7 4.4 6 7.5 11 7.5 1.6 0 3-.3 4.4-.8l.4.4 2.9 2.9 1.3-1.3L3.3 3 2 4.3zm5.5 5.5l1.6 1.6c0 .2-.1.4-.1.6 0 1.7 1.3 3 3 3 .2 0 .4 0 .6-.1l1.6 1.6c-.7.3-1.4.5-2.2.5-2.8 0-5-2.2-5-5 0-.8.2-1.5.5-2.2zm4.3-.8l3.1 3.1V12c0-1.7-1.3-3-3-3h-.1z"/></svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm0 10.99h7c-.5 4.2-3.3 7.9-7 9.01V12H5V6.3l7-3.1v8.79z"/></svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="#fff">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

/* ────────────────────────────────────────────
   LOGIN COMPONENT
   ──────────────────────────────────────────── */

/* Inline error icon */
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
);

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleOAuthReady = isGoogleOAuthConfigured();
  const appleOAuthReady = isAppleOAuthConfigured();

  /* ── Validation Rules ── */
  const validateField = (name, value) => {
    switch (name) {
      case 'identifier':
        return validateLoginIdentifier(value);
      case 'password':
        return validatePassword(value);
      default: return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({ identifier: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/login', {
        identifier: normalizeLoginIdentifier(form.identifier),
        password: form.password,
      });
      const { token, ...userData } = res.data.data;
      if (userData.role !== 'CUSTOMER') {
        popup.accessDenied('This app is for customers only. Use the Partner or Admin panel.');
        return;
      }
      login(userData, token);
      popup.loginSuccess(userData.name);
      navigate('/');
    } catch (err) {
      popup.error('Login Failed', err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const response = provider === 'google'
        ? await signInWithGoogle('CUSTOMER')
        : await signInWithApple('CUSTOMER');

      const { token, userData } = response;
      if (userData.role && userData.role !== 'CUSTOMER') {
        popup.accessDenied('This app is for customers only. Use the Partner or Admin panel.');
        return;
      }

      login(userData, token);
      popup.loginSuccess(userData.name || 'User');
      navigate('/');
    } catch (error) {
      if (error.code === 'OAUTH_CANCELLED') {
        popup.info('Sign-In Cancelled', 'Social sign-in was cancelled.');
      } else if (error.code === 'OAUTH_CONFIG_MISSING') {
        return;
      } else {
        popup.error(
          `${provider === 'google' ? 'Google' : 'Apple'} Sign-In Failed`,
          error.response?.data?.message || error.message || 'Unable to continue with social sign-in.',
        );
      }
    } finally {
      setSocialLoading('');
    }
  };

  return (
    <div className="login-page">

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div className="login-left">

        {/* Background image */}
        <img
          src="/login-food.png"
          alt=""
          className="login-left-bg"
        />

        {/* Glowing orbs */}
        <div className="login-glow login-glow--orange" />
        <div className="login-glow login-glow--red" />
        <div className="login-glow login-glow--amber" />

        {/* Floating particles */}
        <div className="login-particles">
          <div className="login-particle" />
          <div className="login-particle" />
          <div className="login-particle" />
          <div className="login-particle" />
          <div className="login-particle" />
          <div className="login-particle" />
        </div>

        <div className="login-left-content">

          {/* ── Premium Logo (Left Panel) ── */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <QuickBitXLogo size={56} />
            </div>
            <div className="login-logo-text">
              <h1>Quick<span className="accent">Bit</span><span className="accent-x">X</span></h1>
              <p className="login-logo-tagline">Food. Fast. Everytime.</p>
            </div>
          </div>

          {/* Tag pill */}
          <div className="login-tag">
            <IconFire />
            <span>Fast • Fresh • Reliable</span>
          </div>

          {/* Hero heading */}
          <h1 className="login-hero-title">
            Craving something<br />
            <span className="gradient">delicious?</span>
          </h1>

          <p className="login-hero-text">
            Order from your favorite restaurants and get fresh meals
            delivered to your doorstep in minutes.
          </p>

          {/* Stats */}
          <div className="login-stats">
            <div className="login-stat-card">
              <div className="login-stat-icon login-stat-icon--orange">
                <IconStore />
              </div>
              <h2>1000+</h2>
              <p>Restaurants</p>
            </div>
            <div className="login-stat-card">
              <div className="login-stat-icon login-stat-icon--red">
                <IconClock />
              </div>
              <h2>30 Min</h2>
              <p>Avg Delivery</p>
            </div>
            <div className="login-stat-card">
              <div className="login-stat-icon login-stat-icon--yellow">
                <IconStar />
              </div>
              <h2>4.9★</h2>
              <p>App Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div className="login-right">
        <div className="login-box">

          {/* ── Premium Logo (Right Panel Header) ── */}
          <div className="login-box-logo">
            <QuickBitXLogo size={44} />
            <span className="login-box-brand">
              Quick<span className="accent">Bit</span><span className="accent-x">X</span>
            </span>
          </div>

          {/* Header */}
          <div className="login-box-header">
            <h1>Welcome Back 👋</h1>
            <p>Sign in to continue your food journey</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Email / Phone */}
            <div className="login-field">
              <label htmlFor="login-email">Email or Phone</label>
              <div className={`login-input-box${errors.identifier && touched.identifier ? ' login-input-box--error' : ''}`}>
                <span className="login-input-icon">
                  <IconMail />
                </span>
                <input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email or phone"
                  autoComplete="off"
                  autoCapitalize="none"
                  value={form.identifier}
                  onChange={(e) => handleChange('identifier', e.target.value)}
                  onBlur={() => handleBlur('identifier')}
                />
              </div>
              {errors.identifier && touched.identifier && (
                <span className="login-field-error"><ErrorIcon /> {errors.identifier}</span>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className={`login-input-box${errors.password && touched.password ? ' login-input-box--error' : ''}`}>
                <span className="login-input-icon">
                  <IconLock />
                </span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  maxLength={64}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
              {errors.password && touched.password && (
                <span className="login-field-error"><ErrorIcon /> {errors.password}</span>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div className="login-row">
              <label className="login-remember" htmlFor="remember-check">
                <input
                  type="checkbox"
                  id="remember-check"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="login-checkbox-custom">
                  <IconCheck />
                </span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || Boolean(socialLoading)}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing In...
                </>
              ) : (
                <>Sign In To QuickBitX →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span>OR</span>
            <div className="login-divider-line" />
          </div>

          {/* Social buttons */}
          <div className="login-socials">
            <button
              type="button"
              className="login-social-btn"
              onClick={() => handleSocialLogin('google')}
              disabled={Boolean(socialLoading) || !googleOAuthReady}
              title={googleOAuthReady ? 'Continue with Google' : 'Google sign-in not configured'}
            >
              <GoogleIcon />
              {socialLoading === 'google'
                ? 'Connecting...'
                : googleOAuthReady
                  ? 'Continue with Google'
                  : 'Google Not Configured'}
            </button>
            <button
              type="button"
              className="login-social-btn"
              onClick={() => handleSocialLogin('apple')}
              disabled={Boolean(socialLoading) || !appleOAuthReady}
              title={appleOAuthReady ? 'Continue with Apple' : 'Apple sign-in not configured'}
            >
              <AppleIcon />
              {socialLoading === 'apple'
                ? 'Connecting...'
                : appleOAuthReady
                  ? 'Continue with Apple'
                  : 'Apple Not Configured'}
            </button>
          </div>

          {/* Bottom text */}
          <div className="login-bottom-text">
            New to QuickBitX?{' '}
            <Link to="/register">Create an account →</Link>
          </div>

          <div className="login-secure">
            <IconShield />
            Your data is safe and secure with us.
          </div>
        </div>
      </div>
    </div>
  );
}
