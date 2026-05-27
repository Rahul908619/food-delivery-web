import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import QuickBitXLogo from '../components/QuickBitXLogo';
import { useAuth } from '../context/AuthContext';
import {
  isAppleOAuthConfigured,
  isGoogleOAuthConfigured,
  signInWithApple,
  signInWithGoogle,
} from '../utils/socialAuth';
import {
  normalizeEmail,
  normalizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../utils/validation';
import './Register.css';

const ICONS = {
  flash: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.6-8 5.8 0 .7.6 1.2 1.2 1.2h13.6c.7 0 1.2-.5 1.2-1.2C20 16.6 16.4 14 12 14Z',
  mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3v.2l8 4.8 8-4.8V8l-8 4.8L4 8Z',
  phone: 'M6.6 2h3.1c.6 0 1.1.4 1.2 1l.8 3.8c.1.5-.1 1.1-.6 1.4L9 9.5a15 15 0 0 0 5.5 5.5l1.3-2.1c.3-.5.9-.7 1.4-.6l3.8.8c.6.1 1 .6 1 1.2v3.1c0 .7-.6 1.3-1.3 1.3h-.8C10 20 4 14 4 5.3v-.8C4 2.6 4.6 2 5.3 2h1.3Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 1 0-6 0v3Zm3 3a2 2 0 0 0-1 3.7V18h2v-1.3a2 2 0 0 0-1-3.7Z',
  eye: 'M12 5c5.3 0 9.6 3.2 11 7-1.4 3.8-5.7 7-11 7S2.4 15.8 1 12c1.4-3.8 5.7-7 11-7Zm0 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  eyeOff: 'm3.3 2 18.7 18.7-1.4 1.4-3.1-3.1A12.7 12.7 0 0 1 12 20c-5.3 0-9.6-3.2-11-7A12.9 12.9 0 0 1 7 6.2L1.9 1.4 3.3 0Zm8.7 6a4 4 0 0 1 3.9 5L11 8.1a3.6 3.6 0 0 1 1-.1Zm-5.1 1.2A9.7 9.7 0 0 0 3.1 13c1.2 3 4.7 5.5 8.9 5.5 1.4 0 2.7-.3 3.9-.8l-2.3-2.3a4 4 0 0 1-5.3-5.3L6.9 9.2Zm5.1-4.7c5.3 0 9.6 3.2 11 7a12.2 12.2 0 0 1-4.2 5.2l-2.1-2.1a9.4 9.4 0 0 0 4.2-3.6c-1.2-3-4.7-5.5-8.9-5.5-1 0-2 .1-2.9.4L7.9 4.8c1.3-.2 2.7-.3 4.1-.3Z',
  truck: 'M3 5h10a1 1 0 0 1 1 1v7h1.6l1.9-3.2a2 2 0 0 1 1.7-.8H21a1 1 0 0 1 1 1v4h-1.2a2.8 2.8 0 0 1-5.6 0H9.8a2.8 2.8 0 0 1-5.6 0H3V6a1 1 0 0 1 1-1Zm14.6 5L16.4 13H20v-3h-2.4ZM7 16.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm10.8 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z',
  clock: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6l5 3 .9-1.5-3.9-2.3V7Z',
  store: 'M4 4h16l1 4.4A2.7 2.7 0 0 1 18.4 12H18v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6h-.4A2.7 2.7 0 0 1 3 8.4L4 4Zm3.5 8V17h9v-5h-9ZM6 6l-.6 2.5c-.1.4.2.8.6.8h12c.4 0 .7-.4.6-.8L18 6H6Z',
  shield: 'm12 2 8 3v6c0 5.3-3.6 9.9-8 11-4.4-1.1-8-5.7-8-11V5l8-3Zm0 5.3-4 1.5v2.3c0 3.7 2.2 6.9 4 7.8 1.8-.9 4-4.1 4-7.8V8.8l-4-1.5Z',
  pin: 'M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  check: 'm9.4 16.6-4-4L4 14l5.4 5.3L20 8.8l-1.4-1.4-9.2 9.2Z',
  arrow: 'M4 11h11.2l-3.6-3.6L13 6l6 6-6 6-1.4-1.4 3.6-3.6H4v-2Z',
  error: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z',
};

const featureCards = [
  { title: 'Free Delivery', description: 'On first order', icon: 'truck', tone: 'orange' },
  { title: 'Real-time', description: 'Order tracking', icon: 'clock', tone: 'red' },
  { title: '1000+', description: 'Top restaurants', icon: 'store', tone: 'amber' },
  { title: 'Secure', description: 'Safe payments', icon: 'shield', tone: 'green' },
];

const trustPoints = ['Secure & Encrypted', 'Lightning Fast Service', 'Tasty & Quality Food'];

const Icon = ({ name, className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d={ICONS[name]} fill="currentColor" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
    <path d="M5.84 14.09A7.2 7.2 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l4.66-2.84Z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.98 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M16.7 12.4c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.7-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.8 0-1.9-.8-3.1-.8-1.6 0-3.2.9-4 2.3-1.7 2.9-.4 7.2 1.2 9.4.8 1.1 1.7 2.4 3 2.3 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.1 3-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-3.1-1.2-3.1-4Zm-2.2-6.5c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.8-.9 2.8 1 0 2-.5 2.6-1.2Z" fill="currentColor" />
  </svg>
);

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleOAuthReady = isGoogleOAuthConfigured();
  const appleOAuthReady = isAppleOAuthConfigured();

  const getContactErrors = (email, phone) => {
    const emailValue = email.trim();
    const phoneValue = normalizePhone(phone);

    if (!emailValue && !phoneValue) {
      return {
        email: 'Enter an email address or phone number',
        phone: 'Enter a phone number or email address',
      };
    }

    return {
      email: validateEmail(emailValue),
      phone: validatePhone(phoneValue),
    };
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value, { label: 'Full name' });
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const validateAll = () => {
    const contactErrors = getContactErrors(form.email, form.phone);
    const nextErrors = {};

    if (contactErrors.email) nextErrors.email = contactErrors.email;
    if (contactErrors.phone) nextErrors.phone = contactErrors.phone;

    ['name', 'password'].forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) nextErrors[field] = error;
    });

    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, password: true });
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    const nextValue = field === 'phone' ? normalizePhone(value) : value;
    const nextForm = { ...form, [field]: nextValue };
    setForm(nextForm);

    if (field === 'email' || field === 'phone') {
      if (touched.email || touched.phone) {
        setErrors((prev) => ({ ...prev, ...getContactErrors(nextForm.email, nextForm.phone) }));
      }
      return;
    }

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, nextValue) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'email' || field === 'phone') {
      setErrors((prev) => ({ ...prev, ...getContactErrors(form.email, form.phone) }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const body = { name: form.name.trim(), password: form.password, role: form.role };
      const email = normalizeEmail(form.email);
      const phone = normalizePhone(form.phone);
      if (email) body.email = email;
      if (phone) body.phone = phone;

      const response = await API.post('/auth/register', body);
      const { token, ...userData } = response.data.data;
      login(userData, token);
      popup.registerSuccess(userData.name);
      navigate('/');
    } catch (error) {
      popup.error('Registration Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
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
      popup.registerSuccess(userData.name || 'User');
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

  const fieldErr = (name) => Boolean(errors[name] && touched[name]);
  const normalizedEmailValue = normalizeEmail(form.email);
  const normalizedPhoneValue = normalizePhone(form.phone);
  const nameValid = Boolean(form.name.trim()) && !validateName(form.name, { label: 'Full name' });
  const hasAnyContact = Boolean(normalizedEmailValue || normalizedPhoneValue);
  const hasValidContact =
    (Boolean(normalizedEmailValue) && !validateEmail(normalizedEmailValue)) ||
    (Boolean(normalizedPhoneValue) && !validatePhone(normalizedPhoneValue));
  const passwordLongEnough = form.password.length >= 6;
  const accountStepReady = nameValid && hasValidContact;
  const finalStepReady = accountStepReady && passwordLongEnough;
  const stepProgress = finalStepReady ? 100 : accountStepReady ? 54 : hasAnyContact || form.name || form.password ? 14 : 0;
  const checks = [
    { label: 'At least 6 characters', valid: passwordLongEnough },
    { label: 'Full name looks valid', valid: nameValid },
    { label: 'One contact method added', valid: hasAnyContact },
    { label: 'Email or phone is valid', valid: hasValidContact },
  ];

  return (
    <div
      className="register-page"
      style={{ '--register-hero-bg': `url(${process.env.PUBLIC_URL}/hero-banner.png)` }}
    >
      <section className="register-left" aria-hidden="true">
        <div className="register-glow register-glow--orange" />
        <div className="register-glow register-glow--red" />
        <div className="register-glow register-glow--amber" />

        <div className="register-route">
          <div className="register-route-ring" />
          <div className="register-route-pin"><Icon name="pin" /></div>
        </div>

        <div className="register-left-content">
          <div className="register-brand">
            <div className="register-brand-icon">
              <QuickBitXLogo size={56} />
            </div>
            <div className="register-brand-text">
              <h1>Quick<span className="accent">Bit</span><span className="accent-x">X</span></h1>
              <p className="register-brand-tagline">Food. Fast. Everytime.</p>
            </div>
          </div>

          <div className="register-tag">
            <Icon name="flash" />
            <span>Fast . Fresh . Reliable</span>
          </div>

          <h2 className="register-hero-title">Good Food,<span> Great Mood!</span></h2>
          <p className="register-hero-text">Join thousands of happy foodies and enjoy fresh meals delivered fast to your doorstep.</p>

          <div className="register-feature-strip">
            {featureCards.map((item) => (
              <article key={item.title} className="register-feature-card">
                <div className={`register-feature-icon register-feature-icon--${item.tone}`}>
                  <Icon name={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="register-food-scene">
          <img src="/cat-burger.png" alt="" className="register-food register-food--burger" />
          <img src="/cat-biryani.png" alt="" className="register-food register-food--biryani" />
          <img src="/cat-pizza.png" alt="" className="register-food register-food--pizza" />
        </div>

        <div className="register-trust-row">
          {trustPoints.map((point) => <span key={point}>{point}</span>)}
        </div>
      </section>

      <section className="register-right">
        <div className="register-box">
          <div className="register-mobile-brand">
            <div className="register-brand-icon register-brand-icon--small">
              <QuickBitXLogo size={40} />
            </div>
            <div>
              <strong>Quick<span className="accent">Bit</span><span className="accent-x">X</span></strong>
              <span>Food. Fast. Everytime.</span>
            </div>
          </div>

          <div className="register-box-header">
            <h1>Create Your Account</h1>
            <p>Start your food journey with QuickBitX</p>
          </div>

          <div className="register-steps" style={{ '--register-progress': stepProgress }}>
            <div className="register-stepper">
              <div className="register-stepper-track" />
              <div className="register-stepper-fill" />
              <div className="register-step register-step--active">1</div>
              <div className={`register-step${accountStepReady ? ' register-step--active' : ''}`}>2</div>
              <div className={`register-step${finalStepReady ? ' register-step--active' : ''}`}>3</div>
            </div>
            <div className="register-step-labels">
              <span className="register-step-label register-step-label--active">Account Info</span>
              <span className={`register-step-label${accountStepReady ? ' register-step-label--active' : ''}`}>Verification</span>
              <span className={`register-step-label${finalStepReady ? ' register-step-label--active' : ''}`}>Complete</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="register-field">
              <label htmlFor="reg-name">Full Name <span>*</span></label>
              <div className={`register-input-box${fieldErr('name') ? ' register-input-box--error' : ''}`}>
                <span className="register-input-icon"><Icon name="user" /></span>
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  placeholder="Enter your full name"
                  maxLength={50}
                  autoComplete="name"
                  onChange={(event) => handleChange('name', event.target.value)}
                  onBlur={() => handleBlur('name')}
                />
              </div>
              {fieldErr('name') && <span className="register-field-error"><Icon name="error" />{errors.name}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="reg-email">Email Address</label>
              <div className={`register-input-box${fieldErr('email') ? ' register-input-box--error' : ''}`}>
                <span className="register-input-icon"><Icon name="mail" /></span>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  autoCapitalize="none"
                  onChange={(event) => handleChange('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                />
              </div>
              {fieldErr('email') && <span className="register-field-error"><Icon name="error" />{errors.email}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="reg-phone">Phone Number</label>
              <div className={`register-input-box${fieldErr('phone') ? ' register-input-box--error' : ''}`}>
                <span className="register-input-icon"><Icon name="phone" /></span>
                <input
                  id="reg-phone"
                  type="text"
                  value={form.phone}
                  placeholder="Enter your 10-digit phone number"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  onChange={(event) => handleChange('phone', event.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
              </div>
              {fieldErr('phone') && <span className="register-field-error"><Icon name="error" />{errors.phone}</span>}
            </div>

            <div className="register-field register-field--compact">
              <label htmlFor="reg-password">Password <span>*</span></label>
              <div className={`register-input-box${fieldErr('password') ? ' register-input-box--error' : ''}`}>
                <span className="register-input-icon"><Icon name="lock" /></span>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  maxLength={64}
                  onChange={(event) => handleChange('password', event.target.value)}
                  onBlur={() => handleBlur('password')}
                />
                <button
                  type="button"
                  className="register-eye-btn"
                  onClick={() => setShowPass((current) => !current)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} />
                </button>
              </div>
              {fieldErr('password') && <span className="register-field-error"><Icon name="error" />{errors.password}</span>}
            </div>

            <p className="register-contact-note">Use email, phone, or both. At least one contact method is required.</p>

            <div className="register-checks">
              {checks.map((item) => (
                <div key={item.label} className={`register-check-item${item.valid ? ' register-check-item--valid' : ''}`}>
                  <span className="register-check-icon"><Icon name="check" /></span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <button type="submit" className="register-submit-btn" disabled={loading || Boolean(socialLoading)}>
              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create My Account</span>
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </form>

          <div className="register-divider">
            <div className="register-divider-line" />
            <span>OR SIGN UP WITH</span>
            <div className="register-divider-line" />
          </div>

          <div className="register-socials">
            <button
              type="button"
              className="register-social-btn"
              onClick={() => handleSocialLogin('google')}
              disabled={Boolean(socialLoading) || !googleOAuthReady}
              title={googleOAuthReady ? 'Continue with Google' : 'Google sign-in not configured'}
            >
              <GoogleIcon />
              <span>
                {socialLoading === 'google'
                  ? 'Connecting...'
                  : googleOAuthReady
                    ? 'Google'
                    : 'Google Not Configured'}
              </span>
            </button>
            <button
              type="button"
              className="register-social-btn"
              onClick={() => handleSocialLogin('apple')}
              disabled={Boolean(socialLoading) || !appleOAuthReady}
              title={appleOAuthReady ? 'Continue with Apple' : 'Apple sign-in not configured'}
            >
              <AppleIcon />
              <span>
                {socialLoading === 'apple'
                  ? 'Connecting...'
                  : appleOAuthReady
                    ? 'Apple'
                    : 'Apple Not Configured'}
              </span>
            </button>
          </div>

          <p className="register-bottom-text">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
