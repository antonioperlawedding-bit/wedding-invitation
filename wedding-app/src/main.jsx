import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import CmsApp from './cms/CmsApp.jsx';
import './styles/globals.css';

// Remove the HTML preloader immediately on CMS routes
if (window.location.pathname.startsWith('/cms')) {
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.remove();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/cms/*" element={<CmsApp />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
