import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import QuickBitXLogo from '../components/QuickBitXLogo';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
const DELIVERY_IMAGE = '/delivery-rider.jpg';
const FALLBACK_SCENE = '/partner-login.png';

const ErrIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const ICONS = {
  mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3v.2l8 4.8 8-4.8V8l-8 4.8L4 8Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 1 0-6 0v3Zm3 3a2 2 0 0 0-1 3.7V18h2v-1.3a2 2 0 0 0-1-3.7Z',
  eye: 'M12 5c5.3 0 9.6 3.2 11 7-1.4 3.8-5.7 7-11 7S2.4 15.8 1 12c1.4-3.8 5.7-7 11-7Zm0 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  eyeOff:
    'm3.3 2 18.7 18.7-1.4 1.4-3.1-3.1A12.7 12.7 0 0 1 12 20c-5.3 0-9.6-3.2-11-7A12.9 12.9 0 0 1 7 6.2L1.9 1.4 3.3 0Zm8.7 6a4 4 0 0 1 3.9 5L11 8.1a3.6 3.6 0 0 1 1-.1Zm-5.1 1.2A9.7 9.7 0 0 0 3.1 13c1.2 3 4.7 5.5 8.9 5.5 1.4 0 2.7-.3 3.9-.8l-2.3-2.3a4 4 0 0 1-5.3-5.3L6.9 9.2Zm5.1-4.7c5.3 0 9.6 3.2 11 7a12.2 12.2 0 0 1-4.2 5.2l-2.1-2.1a9.4 9.4 0 0 0 4.2-3.6c-1.2-3-4.7-5.5-8.9-5.5-1 0-2 .1-2.9.4L7.9 4.8c1.3-.2 2.7-.3 4.1-.3Z',
  store: 'M4 4h16l1 4.4A2.7 2.7 0 0 1 18.4 12H18v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6h-.4A2.7 2.7 0 0 1 3 8.4L4 4Zm3.5 8V17h9v-5h-9ZM6 6l-.6 2.5c-.1.4.2.8.6.8h12c.4 0 .7-.4.6-.8L18 6H6Z',
  delivery:
    'M3 5h10a1 1 0 0 1 1 1v7h1.6l1.9-3.2a2 2 0 0 1 1.7-.8H21a1 1 0 0 1 1 1v4h-1.2a2.8 2.8 0 0 1-5.6 0H9.8a2.8 2.8 0 0 1-5.6 0H3V6a1 1 0 0 1 1-1Zm14.6 5L16.4 13H20v-3h-2.4ZM7 16.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm10.8 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z',
};

const Icon = ({ name, className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d={ICONS[name]} fill="currentColor" />
  </svg>
);

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setForm({ identifier: '', password: '' });
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'identifier':
        if (!value.trim()) return 'Email or phone is required';
        if (value.trim().length < 3) return 'Must be at least 3 characters';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({ identifier: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setFocused('');
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const fieldErr = (name) => Boolean(errors[name] && touched[name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      const { token, ...userData } = res.data.data;

      if (userData.role === 'CUSTOMER' || userData.role === 'ADMIN') {
        popup.accessDenied('This panel is for Restaurant Owners and Delivery Partners only.');
        return;
      }

      login(userData, token);
      popup.partnerLogin(userData.name, userData.role);
      if (userData.role === 'RESTAURANT_OWNER') navigate('/owner/dashboard');
      else navigate('/delivery/dashboard');
    } catch (err) {
      popup.error('Login Failed', err.response?.data?.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-auth">
      <div className="partner-auth__glow partner-auth__glow--one" />
      <div className="partner-auth__glow partner-auth__glow--two" />

      <div className="partner-auth__shell">
        <aside className="partner-auth__visual partner-auth__visual--login">
          <div className="partner-auth__brand">
            <div className="partner-auth__brand-logo" aria-hidden="true">
              <QuickBitXLogo size={38} />
            </div>
            <div>
              <p className="partner-auth__brand-title">
                Quick<span>BitX</span>
              </p>
              <p className="partner-auth__brand-sub">Partner Network</p>
            </div>
          </div>

          <span className="partner-auth__tag">High performance partner portal</span>
          <h1 className="partner-auth__headline">Operate smarter. Deliver faster. Grow every day.</h1>
          <p className="partner-auth__copy">
            One place for restaurant operations and delivery execution with live visibility.
          </p>

          <div className="partner-auth__scene partner-auth__scene--login">
            <article className="scene-card scene-card--restaurant">
              <img
                src={RESTAURANT_IMAGE}
                alt="Restaurant kitchen and dining area"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_SCENE;
                }}
              />
              <div className="scene-card__overlay" />
              <div className="scene-card__meta">
                <h3>Restaurant Partners</h3>
                <p>Menu control, order queue, and ratings.</p>
              </div>
              <span className="scene-chip">Live Orders</span>
            </article>

            <article className="scene-card scene-card--delivery">
              <img
                src={DELIVERY_IMAGE}
                alt="Delivery partner on bike route"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_SCENE;
                }}
              />
              <div className="scene-card__overlay" />
              <div className="scene-card__meta">
                <h3>Delivery Partners</h3>
                <p>Route flow, pickups, and daily payouts.</p>
              </div>
              <span className="scene-bag-tag">QuickBitX</span>
              <span className="scene-chip">Route Ready</span>
            </article>
          </div>

          <div className="partner-auth__stats">
            <div className="partner-auth__stat">
              <strong>5,000+</strong>
              <span>Active Outlets</span>
            </div>
            <div className="partner-auth__stat">
              <strong>50,000+</strong>
              <span>Orders Daily</span>
            </div>
            <div className="partner-auth__stat">
              <strong>24/7</strong>
              <span>Operations</span>
            </div>
          </div>
        </aside>

        <main className="partner-auth__form-pane">
          <div className="partner-auth__form-card">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to QuickBitX partner panel.</p>

            <form onSubmit={handleSubmit} autoComplete="off" className="partner-login-form">
              <input
                className="partner-hidden-autofill"
                type="text"
                name="username"
                autoComplete="username"
                tabIndex="-1"
                aria-hidden="true"
              />
              <input
                className="partner-hidden-autofill"
                type="password"
                name="password"
                autoComplete="current-password"
                tabIndex="-1"
                aria-hidden="true"
              />

              <label className="partner-field" htmlFor="partner-identifier">
                <span className="partner-field__label">Email or Phone Number</span>
                <div
                  className={[
                    'partner-input',
                    focused === 'identifier' ? 'partner-input--focus' : '',
                    fieldErr('identifier') ? 'partner-input--error' : '',
                  ]
                    .join(' ')
                    .trim()}
                >
                  <span className="partner-input__icon">
                    <Icon name="mail" />
                  </span>
                  <input
                    id="partner-identifier"
                    type="text"
                    name="partner_login_identifier"
                    value={form.identifier}
                    placeholder="Enter email or phone"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    onFocus={() => setFocused('identifier')}
                    onBlur={() => handleBlur('identifier')}
                    onChange={(e) => handleChange('identifier', e.target.value)}
                  />
                </div>
                {fieldErr('identifier') && (
                  <span className="partner-field__error">
                    <ErrIcon />
                    {errors.identifier}
                  </span>
                )}
              </label>

              <label className="partner-field" htmlFor="partner-password">
                <span className="partner-field__label">Password</span>
                <div
                  className={[
                    'partner-input',
                    focused === 'password' ? 'partner-input--focus' : '',
                    fieldErr('password') ? 'partner-input--error' : '',
                  ]
                    .join(' ')
                    .trim()}
                >
                  <span className="partner-input__icon">
                    <Icon name="lock" />
                  </span>
                  <input
                    id="partner-password"
                    name="partner_login_password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    onFocus={() => setFocused('password')}
                    onBlur={() => handleBlur('password')}
                    onChange={(e) => handleChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="partner-input__toggle"
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPass ? 'eyeOff' : 'eye'} />
                  </button>
                </div>
                {fieldErr('password') && (
                  <span className="partner-field__error">
                    <ErrIcon />
                    {errors.password}
                  </span>
                )}
              </label>

              <div className="partner-auth__helper-row">
                <Link to="/forgot-password" className="partner-auth__forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="partner-submit" disabled={loading}>
                {loading ? (
                  <span className="partner-submit__loading">
                    <span className="partner-spinner" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In To Partner Panel'
                )}
              </button>
            </form>

            <div className="partner-divider">
              <div className="partner-divider__line" />
              <span>PARTNER ROLES</span>
              <div className="partner-divider__line" />
            </div>

            <div className="partner-role-grid">
              <div className="partner-role-card">
                <span className="partner-role-card__badge">
                  <Icon name="store" />
                </span>
                <div>
                  <h4>Restaurant Owner</h4>
                  <p>Manage menu, pricing, and orders.</p>
                </div>
              </div>
              <div className="partner-role-card">
                <span className="partner-role-card__badge">
                  <Icon name="delivery" />
                </span>
                <div>
                  <h4>Delivery Partner</h4>
                  <p>Accept deliveries and track earnings.</p>
                </div>
              </div>
            </div>

            <p className="partner-switch">
              New partner? <Link to="/register">Create account</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
