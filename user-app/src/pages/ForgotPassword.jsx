import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import { normalizeEmail, validateEmail } from '../utils/validation';
import './AuthRecovery.css';

const USER_RESET_REDIRECT_URL =
  process.env.REACT_APP_SUPABASE_USER_PASSWORD_RESET_REDIRECT_URL ||
  process.env.REACT_APP_SUPABASE_PASSWORD_RESET_REDIRECT_URL ||
  'http://localhost:3000/reset-password';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const validationError = validateEmail(normalizedEmail, { required: true });
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    try {
      await API.post('/auth/forgot-password', {
        email: normalizedEmail,
        role: 'CUSTOMER',
        redirectUrl: USER_RESET_REDIRECT_URL,
      });

      setSent(true);
      popup.success(
        'Reset Link Sent',
        'Check your email inbox for the password reset link.',
      );
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
    <div className="auth-recovery">
      <div className="auth-recovery__card">
        <h1>Forgot Password</h1>
        <p>Enter your account email. We will send a reset link.</p>

        <form onSubmit={handleSubmit} className="auth-recovery__form" noValidate>
          <label htmlFor="forgot-email">Email Address</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError('');
            }}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {error && <span className="auth-recovery__error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {sent && (
          <p className="auth-recovery__note">
            If your email exists, you will receive the reset link shortly.
          </p>
        )}

        <Link to="/login" className="auth-recovery__back">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
