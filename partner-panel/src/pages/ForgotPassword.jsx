import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import './password-recovery.css';

const PARTNER_RESET_REDIRECT_URL =
  process.env.REACT_APP_SUPABASE_PARTNER_PASSWORD_RESET_REDIRECT_URL ||
  process.env.REACT_APP_SUPABASE_PASSWORD_RESET_REDIRECT_URL ||
  'http://localhost:3000/partner/reset-password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Email address is required');
      return;
    }
    if (!EMAIL_RE.test(normalizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', {
        email: normalizedEmail,
        role: 'PARTNER',
        redirectUrl: PARTNER_RESET_REDIRECT_URL,
      });

      setSent(true);
      popup.success('Reset Link Sent', 'Check your email for the password reset link.');
    } catch (err) {
      popup.error(
        'Unable to Send Link',
        err.response?.data?.message || 'Please try again in a moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-recovery">
      <div className="partner-recovery__card">
        <h1>Forgot Password</h1>
        <p>Enter your partner account email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="partner-recovery__form" noValidate>
          <label htmlFor="partner-forgot-email">Email Address</label>
          <input
            id="partner-forgot-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError('');
            }}
            placeholder="partner@example.com"
            autoComplete="email"
          />
          {error && <span className="partner-recovery__error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {sent && (
          <p className="partner-recovery__note">
            If your email exists, a reset link has been sent.
          </p>
        )}

        <Link to="/login" className="partner-recovery__back">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
