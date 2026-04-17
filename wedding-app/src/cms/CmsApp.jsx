import { useState, useEffect } from 'react';
import './cms.css';
import LoginPage from './LoginPage';
import RsvpManager from './RsvpManager';

export default function CmsApp() {
  const [token, setToken] = useState(() => localStorage.getItem('cms_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('cms_token', token);
    } else {
      localStorage.removeItem('cms_token');
    }
  }, [token]);

  const logout = () => setToken(null);

  if (!token) {
    return <LoginPage onAuth={setToken} />;
  }

  return (
    <div className="cms-root">
      <header className="cms-header">
        <h2 className="cms-header-title">Wedding RSVP Monitor</h2>
        <button className="cms-btn cms-btn-sm" onClick={logout}>Logout</button>
      </header>
      <main className="cms-main">
        <RsvpManager />
      </main>
    </div>
  );
}
