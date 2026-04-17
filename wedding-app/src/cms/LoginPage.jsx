import { useState } from 'react';
import { api } from './api';

export default function LoginPage({ onAuth }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await api.sendOtp();
      setStep('otp');
      setInfo(res.note || 'A code has been sent to the admin email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return setError('Please enter the 6-digit code.');
    setLoading(true);
    setError('');
    try {
      const res = await api.verifyOtp(code);
      onAuth(res.token);
    } catch (err) {
      setError(err.message);
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

          {step === 'email' ? (
            <>
              <p style={{ fontSize: '0.88rem', color: 'rgba(58,46,34,0.5)', marginBottom: '2rem', lineHeight: 1.6 }}>
                A one-time access code will be sent to the admin email address.
              </p>
              <button
                className="cms-btn cms-btn-primary"
                onClick={handleSendOtp}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                {loading ? 'Sending...' : 'Send Access Code'}
              </button>
            </>
          ) : (
            <form onSubmit={handleVerify}>
              {info && (
                <p style={{ fontSize: '0.82rem', color: '#87A96B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {info}
                </p>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="cms-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '2rem',
                    letterSpacing: '0.5em',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    padding: '1rem',
                    color: '#3a2e22',
                  }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="cms-btn cms-btn-primary"
                disabled={loading || code.length !== 6}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(58,46,34,0.35)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginTop: '1.25rem',
                  letterSpacing: '0.1em',
                }}
              >
                Resend code
              </button>
            </form>
          )}

          {error && (
            <p style={{ color: '#C41E3A', fontSize: '0.82rem', marginTop: '1.25rem' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
