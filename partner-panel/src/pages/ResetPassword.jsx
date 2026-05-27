import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import popup from '../components/CustomToast';
import './password-recovery.css';

function parseRecoveryParams() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return {
    accessToken: query.get('access_token') || hash.get('access_token') || '',
    refreshToken: query.get('refresh_token') || hash.get('refresh_token') || '',
    token:
      query.get('token') ||
      query.get('code') ||
      hash.get('token') ||
      hash.get('code') ||
      hash.get('access_token') ||
      '',
    type: query.get('type') || hash.get('type') || '',
  };
}

function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'Password must be at least 6 characters';
  if (value.length > 64) return 'Password must be 64 characters or fewer';
  return '';
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const recovery = useMemo(parseRecoveryParams, []);
  const hasRecoveryToken = Boolean(recovery.token || recovery.accessToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasRecoveryToken) return;

    const passwordError = validatePassword(password);
    const confirmError =
      !confirmPassword
        ? 'Confirm password is required'
        : password !== confirmPassword
          ? 'Passwords do not match'
          : '';

    const nextErrors = {};
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        role: 'PARTNER',
        password,
        token: recovery.token,
        accessToken: recovery.accessToken,
        refreshToken: recovery.refreshToken,
        type: recovery.type,
      });

      popup.success('Password Updated', 'You can now login with your new password.');
      navigate('/login');
    } catch (err) {
      popup.error(
        'Reset Failed',
        err.response?.data?.message || 'Reset link is invalid or expired.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-recovery">
      <div className="partner-recovery__card">
        <h1>Reset Password</h1>
        <p>Set a new password for your partner account.</p>

        {!hasRecoveryToken && (
          <p className="partner-recovery__error">
            Missing or invalid reset token. Request a new reset link.
          </p>
        )}

        <form onSubmit={handleSubmit} className="partner-recovery__form" noValidate>
          <label htmlFor="partner-reset-password">New Password</label>
          <input
            id="partner-reset-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Enter new password"
            autoComplete="new-password"
            maxLength={64}
          />
          {errors.password && <span className="partner-recovery__error">{errors.password}</span>}

          <label htmlFor="partner-reset-confirm">Confirm Password</label>
          <input
            id="partner-reset-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="Confirm new password"
            autoComplete="new-password"
            maxLength={64}
          />
          {errors.confirmPassword && (
            <span className="partner-recovery__error">{errors.confirmPassword}</span>
          )}

          <button type="submit" disabled={loading || !hasRecoveryToken}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <Link to="/forgot-password" className="partner-recovery__back">
          Request New Reset Link
        </Link>
      </div>
    </div>
  );
}
