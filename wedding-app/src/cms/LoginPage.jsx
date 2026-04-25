import { useState } from 'react';
import { api } from './api';

export default function LoginPage({ onAuth }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return setError('Please enter the password.');
    setLoading(true);
    setError('');
    try {
      const res = await api.login(password);
      onAuth(res.token);
    } catch (err) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-root">
      <div className="cms-login">
        <div className="cms-login-card">
          <h1>CMS</h1>
          <p className="subtitle">Wedding Management</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="cms-input"
                style={{ textAlign: 'left', letterSpacing: '0.1em', paddingRight: '3rem' }}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(58,46,34,0.35)', padding: '0.25rem', lineHeight: 0 }}
                tabIndex={-1}
              >
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            <button
              type="submit"
              className="cms-btn cms-btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {error && (
            <p style={{ color: '#C41E3A', fontSize: '0.82rem', marginTop: '1.25rem' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
