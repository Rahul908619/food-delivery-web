import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import popup from '../components/CustomToast';

/* ── Inline error icon ── */
const ErrIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
);

const errMsgStyle = { display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, fontWeight: 500, color: '#EF4444', animation: 'fadeUp 0.25s ease' };
const errBorderStyle = { borderColor: '#EF4444', boxShadow: '0 0 16px rgba(239,68,68,0.08)' };

export default function Login() {
  const [form, setForm]       = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── Validation ── */
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

  const fieldErr = (name) => errors[name] && touched[name];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      const { token, ...userData } = res.data.data;
      if (userData.role !== 'ADMIN') {
        popup.accessDenied('Access restricted to admin accounts only.');
        return;
      }
      login(userData, token);
      popup.adminLogin();
      navigate('/dashboard');
    } catch (err) {
      popup.error('Login Failed', err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={{ ...s.orb, top: '-80px', left: '-60px', background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)' }} />
      <div style={{ ...s.orb, bottom: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)' }} />

      <div style={s.wrapper}>
        {/* Left Panel */}
        <div style={s.leftPanel}>
          <div style={s.leftContent}>
            <div style={s.brandRow}>
              <img src="/quickbitex_logo.png" alt="QuickBiteX" style={s.brandLogo} />
              <span style={s.brandName}>
                Quick<span style={{ color: '#f97316' }}>Bite</span><span style={{ color: '#6366f1' }}>X</span>
              </span>
            </div>

            <h1 style={s.heroTitle}>
              Manage Your<br />
              <span style={s.heroGradient}>Food Empire</span>
            </h1>
            <p style={s.heroSub}>
              Full control over restaurants, orders, deliveries, and revenue — all in one place.
            </p>

            <div style={s.statsRow}>
              {[
                { val: '10K+', label: 'Orders Daily' },
                { val: '500+', label: 'Restaurants' },
                { val: '99.9%', label: 'Uptime' },
              ].map((st, i) => (
                <div key={i} style={s.statItem}>
                  <span style={s.statVal}>{st.val}</span>
                  <span style={s.statLabel}>{st.label}</span>
                </div>
              ))}
            </div>

            <div style={s.featureList}>
              {['Real-time order tracking', 'Revenue analytics', 'Restaurant approvals', 'Partner management'].map((f, i) => (
                <div key={i} style={s.featureItem}>
                  <span style={s.featureTick}>✓</span>
                  <span style={s.featureText}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Login Card */}
        <div style={s.rightPanel}>
          <div style={s.card}>
            {/* Card Header */}
            <div style={s.cardHeader}>
              <div style={s.lockIcon}>🔐</div>
              <h2 style={s.cardTitle}>Admin Sign In</h2>
              <p style={s.cardSub}>Restricted to authorized personnel only</p>
            </div>

            <form onSubmit={handleSubmit} style={s.form} autoComplete="off">
              {/* Email Field */}
              <div style={s.field}>
                <label style={s.label}>EMAIL OR PHONE</label>
                <div style={{ ...s.inputWrap, ...(fieldErr('identifier') ? errBorderStyle : {}) }}>
                  <span style={s.inputIcon}>📧</span>
                  <input
                    type="text"
                    placeholder="Enter admin email or phone"
                    autoComplete="off"
                    value={form.identifier}
                    onChange={e => handleChange('identifier', e.target.value)}
                    onBlur={() => handleBlur('identifier')}
                    style={s.input}
                  />
                </div>
                {fieldErr('identifier') && <span style={errMsgStyle}><ErrIcon /> {errors.identifier}</span>}
              </div>

              {/* Password Field */}
              <div style={s.field}>
                <label style={s.label}>PASSWORD</label>
                <div style={{ ...s.inputWrap, ...(fieldErr('password') ? errBorderStyle : {}) }}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    style={{ ...s.input, paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={s.eyeBtn}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErr('password') && <span style={errMsgStyle}><ErrIcon /> {errors.password}</span>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
                {loading
                  ? <><span style={s.spinIcon}>⟳</span> Signing in...</>
                  : <><span>🚀</span> Access Admin Panel</>
                }
              </button>
            </form>

            {/* Security Note */}
            <div style={s.securityNote}>
              <span style={s.shieldIcon}>🛡️</span>
              <span>All sessions are encrypted & monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #060818 0%, #0a0f1e 50%, #0d0618 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: 960,
    minHeight: 580,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.5s ease',
  },

  /* Left panel */
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(145deg, #0d1117, #111827)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    padding: '48px 40px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: { position: 'relative', zIndex: 1 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 11,
    border: '1.5px solid rgba(249,115,22,0.3)',
    boxShadow: '0 0 16px rgba(249,115,22,0.2)',
  },
  brandName: { fontSize: 20, fontWeight: 800, color: '#f1f5f9' },
  heroTitle: {
    fontSize: 36,
    fontWeight: 900,
    color: '#f1f5f9',
    lineHeight: 1.2,
    marginBottom: 14,
    letterSpacing: '-0.5px',
  },
  heroGradient: {
    background: 'linear-gradient(90deg, #f97316, #6366f1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 32, maxWidth: 300 },
  statsRow: { display: 'flex', gap: 24, marginBottom: 32 },
  statItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { fontSize: 22, fontWeight: 900, color: '#f97316' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: 500 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 10 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10 },
  featureTick: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: 'rgba(249,115,22,0.15)',
    border: '1px solid rgba(249,115,22,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: '#f97316',
    fontWeight: 700,
    flexShrink: 0,
  },
  featureText: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },

  /* Right panel */
  rightPanel: {
    width: 400,
    background: '#0d1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 36px',
  },
  card: { width: '100%' },
  cardHeader: { textAlign: 'center', marginBottom: 32 },
  lockIcon: { fontSize: 36, display: 'block', marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 },
  cardSub: { fontSize: 12, color: '#64748b' },

  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center', transition: 'border-color 0.2s, box-shadow 0.2s' },
  inputIcon: { position: 'absolute', left: 14, fontSize: 14, pointerEvents: 'none' },
  input: {
    width: '100%',
    padding: '13px 14px 13px 40px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    fontSize: 14,
    color: '#f1f5f9',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    padding: 4,
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    border: 'none',
    borderRadius: 13,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 24px rgba(249,115,22,0.35)',
    transition: 'all 0.2s ease',
    marginTop: 4,
    fontFamily: 'Inter, sans-serif',
  },
  spinIcon: { display: 'inline-block', animation: 'spin 1s linear infinite' },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    fontSize: 11,
    color: '#475569',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '10px 16px',
  },
  shieldIcon: { fontSize: 13 },
};
