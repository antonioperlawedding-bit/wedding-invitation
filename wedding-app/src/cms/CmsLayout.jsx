import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import ContentEditor from './ContentEditor';
import RsvpManager from './RsvpManager';
import SyncPanel from './SyncPanel';
import LiveEditor from './LiveEditor';

const NAV = [
  { key: '', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { key: 'content', label: 'Content', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { key: 'rsvps', label: 'RSVPs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { key: 'sync', label: 'Drive Sync', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2.5 12A10 10 0 0119.8 5.3L21.5 8"/><path d="M21.5 12A10 10 0 014.2 18.7L2.5 16"/></svg> },
  { key: 'preview', label: 'Preview', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg> },
];

export default function CmsLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = location.pathname.replace('/cms/', '').replace('/cms', '') || '';
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="cms-root">
      <div className="cms-layout">
        {/* Sidebar */}
        <aside className={`cms-sidebar ${collapsed ? 'cms-sidebar-collapsed' : ''}`}>
          <div className="cms-sidebar-top">
            <div className="cms-sidebar-logo">
              {collapsed ? 'W' : 'Wedding CMS'}
            </div>
            <button
              className="cms-sidebar-toggle"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                {collapsed
                  ? <><path d="M9 18l6-6-6-6" /></>
                  : <><path d="M15 18l-6-6 6-6" /></>
                }
              </svg>
            </button>
          </div>
          <nav className="cms-sidebar-nav">
            {NAV.map((item) => (
              <button
                key={item.key}
                className={`cms-nav-item ${currentKey === item.key ? 'active' : ''}`}
                onClick={() => navigate(`/cms/${item.key}`)}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="cms-sidebar-footer">
            <button className="cms-logout-btn" onClick={onLogout}>
              {collapsed ? '⏻' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="cms-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="content" element={<ContentEditor />} />
            <Route path="rsvps" element={<RsvpManager />} />
            <Route path="sync" element={<SyncPanel />} />
            <Route path="preview" element={<LiveEditor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
