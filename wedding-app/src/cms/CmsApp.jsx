import { useState, useEffect } from 'react';
import './cms.css';
import LoginPage from './LoginPage';
import RsvpManager from './RsvpManager';

export default function CmsApp() {
  const [token, setToken] = useState(() => localStorage.getItem('cms_token'));

  // CMS is always English LTR regardless of invitation language preference
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  const handleAuth = (newToken) => {
    localStorage.setItem('cms_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onAuth={handleAuth} />;
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
