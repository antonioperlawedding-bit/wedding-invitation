import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './cms.css';
import LoginPage from './LoginPage';
import CmsLayout from './CmsLayout';

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
    <Routes>
      <Route path="/*" element={<CmsLayout onLogout={logout} />} />
      <Route path="*" element={<Navigate to="/cms" replace />} />
    </Routes>
  );
}
