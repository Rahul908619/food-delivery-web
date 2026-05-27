import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import QuickBitXLogo from '../components/QuickBitXLogo';
import { useAuth } from '../context/AuthContext';
import './register-redesign.css';

const TERMS = `QuickBitX Partner Terms & Conditions

1. Eligibility
You must be 18+ years old to register as a partner.

2. Restaurant Owner Responsibilities
- Maintain accurate menu and pricing.
- Process orders promptly.
- Follow local food safety rules.

3. Delivery Partner Responsibilities
- Deliver orders safely and on time.
- Maintain professional conduct.

4. Payments and Commission
- Platform commission and payouts follow partner policy.

5. Account Suspension
QuickBitX can suspend accounts for fraud or policy violations.

6. Privacy
Your personal data is handled under our privacy policy.

By registering, you agree to these terms.`;

const ROLE_CONTENT = {
  RESTAURANT_OWNER: {
    hero: ['Let\'s Build', 'Something', 'Amazing Together.'],
    copy: 'Join thousands of restaurants growing their business with QuickBitX Partner Network.',
    mainImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
    cardImage:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1100&auto=format&fit=crop',
  },
  DELIVERY_PARTNER: {
    hero: ['Deliver Fast', 'Earn More', 'With QuickBitX.'],
    copy: 'Become a QuickBitX delivery partner and earn with flexible working hours.',
    mainImage: '/delivery-rider.jpg',
    cardImage: '/delivery-rider.jpg',
  },
};

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
  role: 'RESTAURANT_OWNER',
};

const PARTNER_TYPES = [
  {
    role: 'RESTAURANT_OWNER',
    title: 'Restaurant Partner',
    subtitle: 'Manage restaurant and orders',
    icon: 'store',
  },
  {
    role: 'DELIVERY_PARTNER',
    title: 'Delivery Partner',
    subtitle: 'Deliver orders and earn',
    icon: 'delivery',
  },
];

const LEFT_FEATURES = [
  { icon: 'partners', title: '5000+ Partners', desc: 'Growing stronger together' },
  { icon: 'growth', title: 'Business Growth', desc: 'Increase orders and revenue' },
  { icon: 'secure', title: 'Trusted & Secure', desc: 'Your data is protected' },
];

const TRUST_POINTS = [
  'Increase your reach and get more orders',
  'Real-time order management and tracking',
  'Secure payments and 24/7 support',
  'Grow your business with QuickBitX',
];

const FORM_FEATURES = [
  { icon: 'secure', title: 'Secure Registration', desc: 'Your data is protected' },
  { icon: 'quick', title: 'Quick Approval', desc: 'Get verified instantly' },
  { icon: 'support', title: '24/7 Support', desc: 'We are here to help' },
];

const ErrIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const ICONS = {
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.6-8 5.8 0 .7.6 1.2 1.2 1.2h13.6c.7 0 1.2-.5 1.2-1.2C20 16.6 16.4 14 12 14Z',
  mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3v.2l8 4.8 8-4.8V8l-8 4.8L4 8Z',
  phone: 'M6.6 2h3.1c.6 0 1.1.4 1.2 1l.8 3.8c.1.5-.1 1.1-.6 1.4L9 9.5a15 15 0 0 0 5.5 5.5l1.3-2.1c.3-.5.9-.7 1.4-.6l3.8.8c.6.1 1 .6 1 1.2v3.1c0 .7-.6 1.3-1.3 1.3h-.8C10 20 4 14 4 5.3v-.8C4 2.6 4.6 2 5.3 2h1.3Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 1 0-6 0v3Zm3 3a2 2 0 0 0-1 3.7V18h2v-1.3a2 2 0 0 0-1-3.7Z',
  eye: 'M12 5c5.3 0 9.6 3.2 11 7-1.4 3.8-5.7 7-11 7S2.4 15.8 1 12c1.4-3.8 5.7-7 11-7Zm0 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  eyeOff:
    'm3.3 2 18.7 18.7-1.4 1.4-3.1-3.1A12.7 12.7 0 0 1 12 20c-5.3 0-9.6-3.2-11-7A12.9 12.9 0 0 1 7 6.2L1.9 1.4 3.3 0Zm8.7 6a4 4 0 0 1 3.9 5L11 8.1a3.6 3.6 0 0 1 1-.1Zm-5.1 1.2A9.7 9.7 0 0 0 3.1 13c1.2 3 4.7 5.5 8.9 5.5 1.4 0 2.7-.3 3.9-.8l-2.3-2.3a4 4 0 0 1-5.3-5.3L6.9 9.2Zm5.1-4.7c5.3 0 9.6 3.2 11 7a12.2 12.2 0 0 1-4.2 5.2l-2.1-2.1a9.4 9.4 0 0 0 4.2-3.6c-1.2-3-4.7-5.5-8.9-5.5-1 0-2 .1-2.9.4L7.9 4.8c1.3-.2 2.7-.3 4.1-.3Z',
  gift: 'M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h16Zm-9 2H6v6h5v-6Zm7 0h-5v6h5v-6ZM9 3c1.7 0 3 1.3 3 3v1H9a3 3 0 0 1 0-6Zm6 0a3 3 0 0 1 0 6h-3V6c0-1.7 1.3-3 3-3ZM3 9h18v2H3V9Z',
  check: 'm9.4 16.6-4-4L4 14l5.4 5.3L20 8.8l-1.4-1.4-9.2 9.2Z',
  store: 'M4 4h16l1 4.4A2.7 2.7 0 0 1 18.4 12H18v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6h-.4A2.7 2.7 0 0 1 3 8.4L4 4Zm3.5 8V17h9v-5h-9ZM6 6l-.6 2.5c-.1.4.2.8.6.8h12c.4 0 .7-.4.6-.8L18 6H6Z',
  delivery:
    'M3 5h10a1 1 0 0 1 1 1v7h1.6l1.9-3.2a2 2 0 0 1 1.7-.8H21a1 1 0 0 1 1 1v4h-1.2a2.8 2.8 0 0 1-5.6 0H9.8a2.8 2.8 0 0 1-5.6 0H3V6a1 1 0 0 1 1-1Zm14.6 5L16.4 13H20v-3h-2.4ZM7 16.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm10.8 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z',
  secure: 'm12 2 8 3v6c0 5.3-3.6 9.9-8 11-4.4-1.1-8-5.7-8-11V5l8-3Zm0 5.3-4 1.5v2.3c0 3.7 2.2 6.9 4 7.8 1.8-.9 4-4.1 4-7.8V8.8l-4-1.5Z',
  quick: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  support:
    'M12 3a8 8 0 0 1 8 8v3a2 2 0 0 1-2 2h-2v-5h3a7 7 0 1 0-14 0h3v5H6a2 2 0 0 1-2-2v-3a8 8 0 0 1 8-8Zm-2 14h4a3 3 0 0 1-3 3h-1v-2Z',
  partners:
    'M16 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-8 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.4 1c-2.1 0-6.4 1-6.4 3v2h11v-2c0-2-4.3-3-4.6-3ZM8 13c-2.3 0-7 1.2-7 3.5V19h7v-3c0-1.1.6-2.1 1.7-2.9A7.8 7.8 0 0 0 8 13Z',
  growth: 'M4 17h4v-5H4v5Zm6 0h4V7h-4v10Zm6 0h4v-8h-4v8ZM3 21h18v2H3v-2Z',
};

const Icon = ({ name, className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d={ICONS[name]} fill="currentColor" />
  </svg>
);

export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTnC, setShowTnC] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clearAutofill = () => {
      setForm((prev) => ({ ...INITIAL_FORM, role: prev.role || 'RESTAURANT_OWNER' }));
      const inputs = document.querySelectorAll('.qbxr-register-form input');
      inputs.forEach((input) => {
        if (input.type === 'checkbox' || input.type === 'hidden') return;
        input.value = '';
      });
    };

    clearAutofill();
    const t1 = setTimeout(clearAutofill, 120);
    const t2 = setTimeout(clearAutofill, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const validateField = (name, value, nextForm = form) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        if (value && !/^\d{10}$/.test(value.replace(/\s/g, ''))) return 'Phone must be exactly 10 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirm your password';
        if (value !== nextForm.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const nextErrors = {};
    ['name', 'email', 'phone', 'password', 'confirmPassword'].forEach((key) => {
      const error = validateField(key, form[key], form);
      if (error) nextErrors[key] = error;
    });
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);

    if (touched[field]) {
      const error = validateField(field, value, nextForm);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }

    if (field === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', nextForm.confirmPassword, nextForm);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field], form);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const fieldErr = (name) => Boolean(errors[name] && touched[name]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateAll()) return;

    if (!form.email && !form.phone) {
      popup.warning('Missing Contact', 'Please provide either an email or phone number.');
      return;
    }
    if (!agreed) {
      popup.warning('Terms Required', 'Please accept the Terms and Conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      const body = { name: form.name, password: form.password, role: form.role };
      if (form.email) body.email = form.email;
      if (form.phone) body.phone = form.phone;

      const res = await API.post('/auth/register', body);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      popup.registerSuccess(userData.name);
      if (userData.role === 'RESTAURANT_OWNER') navigate('/owner/dashboard');
      else navigate('/delivery/dashboard');
    } catch (err) {
      popup.error('Registration Failed', err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = ROLE_CONTENT[form.role];

  return (
    <div className="qbxr-page">
      <div className="qbxr-glow qbxr-glow-one" />
      <div className="qbxr-glow qbxr-glow-two" />
      <div className="qbxr-glow qbxr-glow-three" />

      <div className="qbxr-container">
        <section className="qbxr-left-panel">
          <div className="qbxr-logo-wrap">
            <div className="qbxr-logo-icon" aria-hidden="true">
              <QuickBitXLogo size={46} />
            </div>
            <div>
              <h2>
                Quick<span className="qbxr-bit">Bit</span><span className="qbxr-x">X</span>
              </h2>
              <p>PARTNER NETWORK</p>
            </div>
          </div>

          <div className="qbxr-hero-content">
            <h1>
              {roleMeta.hero[0]} <br />
              {roleMeta.hero[1]} <br />
              <span>{roleMeta.hero[2]}</span>
            </h1>
            <p>{roleMeta.copy}</p>
          </div>

          <div className="qbxr-main-image-wrap">
            <img
              src={ROLE_CONTENT.RESTAURANT_OWNER.mainImage}
              alt="Restaurant interior"
              className={`qbxr-main-image ${form.role === 'RESTAURANT_OWNER' ? 'active' : ''}`}
            />
            <img
              src={ROLE_CONTENT.DELIVERY_PARTNER.mainImage}
              alt="Delivery partner"
              className={`qbxr-main-image ${form.role === 'DELIVERY_PARTNER' ? 'active' : ''}`}
            />
            <span className={`qbxr-bag-tag qbxr-bag-tag-main ${form.role === 'DELIVERY_PARTNER' ? 'active' : ''}`}>
              QuickBitX
            </span>
            <div className="qbxr-overlay-card">
              <h3>5000+ Active Partners</h3>
              <p>Growing stronger every day</p>
            </div>
          </div>

          <div className="qbxr-feature-grid">
            {LEFT_FEATURES.map((item) => (
              <article key={item.title} className="qbxr-feature-card">
                <div className="qbxr-feature-icon">
                  <Icon name={item.icon} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>

          <div className="qbxr-why-wrap">
            <div className="qbxr-why-card">
              <h3>Why partner with us?</h3>
              <ul>
                {TRUST_POINTS.map((point) => (
                  <li key={point}>
                    <span />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="qbxr-cta-card">
              <h3>Partner with QuickBitX Today!</h3>
              <p>It is quick, easy and absolutely free.</p>
              <div className="qbxr-cta-arrow">GO</div>
            </div>
          </div>
        </section>

        <section className="qbxr-right-panel">
          <div className="qbxr-top-bar">
            <div className="qbxr-steps">
              <div className="qbxr-step active">
                <span>1</span>
                <p>Partner Type</p>
              </div>
              <div className="qbxr-step-line" />
              <div className="qbxr-step">
                <span>2</span>
                <p>Account Details</p>
              </div>
              <div className="qbxr-step-line" />
              <div className="qbxr-step">
                <span>3</span>
                <p>Complete</p>
              </div>
            </div>

            <div className="qbxr-help">
              <p>Need help?</p>
              <a href="mailto:support@quickbitx.com">support@quickbitx.com</a>
            </div>
          </div>

          <div className="qbxr-form-container">
            <h2>
              Create <span>Partner</span> Account
            </h2>
            <p className="qbxr-subtitle">Fill in the details below to get started.</p>

            <div className="qbxr-partner-select">
              {PARTNER_TYPES.map((partner) => {
                const active = form.role === partner.role;
                return (
                  <button
                    key={partner.role}
                    type="button"
                    className={`qbxr-partner-card ${active ? 'active' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, role: partner.role }))}
                    aria-pressed={active}
                  >
                    <div className="qbxr-partner-image-wrap">
                      <img src={ROLE_CONTENT[partner.role].cardImage} alt={partner.title} />
                      {partner.role === 'DELIVERY_PARTNER' && (
                        <span className="qbxr-bag-tag qbxr-bag-tag-card">QuickBitX</span>
                      )}
                    </div>
                    <div className="qbxr-partner-card-body">
                      <div className="qbxr-partner-card-icon">
                        <Icon name={partner.icon} />
                      </div>
                      <div>
                        <h3>{partner.title}</h3>
                        <p>{partner.subtitle}</p>
                      </div>
                    </div>
                    {active && (
                      <div className="qbxr-card-check">
                        <Icon name="check" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" noValidate className="qbxr-register-form">
              <input className="qbxr-hidden-autofill" type="text" name="username" autoComplete="username" tabIndex="-1" aria-hidden="true" />
              <input className="qbxr-hidden-autofill" type="password" name="password" autoComplete="current-password" tabIndex="-1" aria-hidden="true" />

              <div className="qbxr-form-grid">
                <label className="qbxr-input-group">
                  <span>Full Name</span>
                  <div className={`qbxr-input-shell ${fieldErr('name') ? 'has-error' : ''}`}>
                    <span className="qbxr-input-icon">
                      <Icon name="user" />
                    </span>
                    <input
                      name="partner_full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      autoComplete="off"
                      onBlur={() => handleBlur('name')}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>
                  {fieldErr('name') && (
                    <small className="qbxr-error">
                      <ErrIcon />
                      {errors.name}
                    </small>
                  )}
                </label>

                <label className="qbxr-input-group">
                  <span>Email Address</span>
                  <div className={`qbxr-input-shell ${fieldErr('email') ? 'has-error' : ''}`}>
                    <span className="qbxr-input-icon">
                      <Icon name="mail" />
                    </span>
                    <input
                      name="partner_email_address"
                      type="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      autoComplete="off"
                      autoCapitalize="none"
                      onBlur={() => handleBlur('email')}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                  {fieldErr('email') && (
                    <small className="qbxr-error">
                      <ErrIcon />
                      {errors.email}
                    </small>
                  )}
                </label>

                <label className="qbxr-input-group">
                  <span>Phone Number</span>
                  <div className={`qbxr-input-shell ${fieldErr('phone') ? 'has-error' : ''}`}>
                    <span className="qbxr-input-icon">
                      <Icon name="phone" />
                    </span>
                    <span className="qbxr-country">+91</span>
                    <input
                      name="partner_phone_number"
                      type="text"
                      placeholder="Enter 10-digit number"
                      value={form.phone}
                      inputMode="numeric"
                      autoComplete="off"
                      onBlur={() => handleBlur('phone')}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  {fieldErr('phone') && (
                    <small className="qbxr-error">
                      <ErrIcon />
                      {errors.phone}
                    </small>
                  )}
                </label>

                <label className="qbxr-input-group">
                  <span>Password</span>
                  <div className={`qbxr-input-shell ${fieldErr('password') ? 'has-error' : ''}`}>
                    <span className="qbxr-input-icon">
                      <Icon name="lock" />
                    </span>
                    <input
                      name="partner_new_password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Create password"
                      value={form.password}
                      autoComplete="new-password"
                      onBlur={() => handleBlur('password')}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                    <button
                      type="button"
                      className="qbxr-show-btn"
                      onClick={() => setShowPass((prev) => !prev)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showPass ? 'eyeOff' : 'eye'} />
                    </button>
                  </div>
                  {fieldErr('password') && (
                    <small className="qbxr-error">
                      <ErrIcon />
                      {errors.password}
                    </small>
                  )}
                </label>

                <label className="qbxr-input-group">
                  <span>Confirm Password</span>
                  <div className={`qbxr-input-shell ${fieldErr('confirmPassword') ? 'has-error' : ''}`}>
                    <span className="qbxr-input-icon">
                      <Icon name="lock" />
                    </span>
                    <input
                      name="partner_confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      autoComplete="new-password"
                      onBlur={() => handleBlur('confirmPassword')}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      className="qbxr-show-btn"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      <Icon name={showConfirm ? 'eyeOff' : 'eye'} />
                    </button>
                  </div>
                  {fieldErr('confirmPassword') && (
                    <small className="qbxr-error">
                      <ErrIcon />
                      {errors.confirmPassword}
                    </small>
                  )}
                </label>

                <label className="qbxr-input-group">
                  <span>Referral Code (Optional)</span>
                  <div className="qbxr-input-shell">
                    <span className="qbxr-input-icon">
                      <Icon name="gift" />
                    </span>
                    <input
                      name="partner_referral_code"
                      type="text"
                      placeholder="Enter referral code"
                      value={form.referralCode}
                      autoComplete="off"
                      onChange={(e) => handleChange('referralCode', e.target.value)}
                    />
                  </div>
                </label>
              </div>

              <div className="qbxr-bottom-features">
                {FORM_FEATURES.map((item) => (
                  <article key={item.title} className="qbxr-small-card">
                    <div className="qbxr-small-icon">
                      <Icon name={item.icon} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="qbxr-checkbox-wrap">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <p>
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTnC(true)}>
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" onClick={() => setShowTnC(true)}>
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

              <button type="submit" className="qbxr-register-btn" disabled={loading || !agreed}>
                {loading ? 'Creating Account...' : 'Create Account & Get Started'}
              </button>

              <p className="qbxr-login-text">
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </form>
          </div>
        </section>
      </div>

      {showTnC && (
        <div className="qbxr-modal-backdrop" onClick={() => setShowTnC(false)}>
          <div className="qbxr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qbxr-modal-head">
              <h3>Terms and Conditions</h3>
              <button type="button" onClick={() => setShowTnC(false)}>
                Close
              </button>
            </div>
            <div className="qbxr-modal-body">
              <pre>{TERMS}</pre>
            </div>
            <div className="qbxr-modal-actions">
              <button
                type="button"
                className="agree"
                onClick={() => {
                  setAgreed(true);
                  setShowTnC(false);
                }}
              >
                I Agree
              </button>
              <button type="button" className="cancel" onClick={() => setShowTnC(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
