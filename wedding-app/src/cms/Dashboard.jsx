import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRsvps(), api.getConfig()])
      .then(([r, c]) => { setRsvps(r); setConfig(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'rgba(250,248,240,0.4)' }}>Loading…</p>;

  const accepted = rsvps.filter((r) => r.attendance?.toLowerCase().includes('accept'));
  const declined = rsvps.filter((r) => r.attendance?.toLowerCase().includes('decline'));
  const totalGuests = accepted.reduce((sum, r) => sum + (r.guests || 1), 0);

  const weddingDate = config?.wedding?.dateFormatted || '—';
  const daysLeft = config?.wedding?.dateTime
    ? Math.max(0, Math.ceil((new Date(config.wedding.dateTime) - new Date()) / 86400000))
    : '—';

  return (
    <>
      <h1 className="cms-page-title">Dashboard</h1>
      <p className="cms-page-subtitle">Overview of your wedding details</p>

      <div className="cms-stats">
        <div className="cms-stat-card">
          <div className="cms-stat-value">{daysLeft}</div>
          <div className="cms-stat-label">Days Until Wedding</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{rsvps.length}</div>
          <div className="cms-stat-label">Total RSVPs</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{accepted.length}</div>
          <div className="cms-stat-label">Accepted</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{totalGuests}</div>
          <div className="cms-stat-label">Expected Guests</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{declined.length}</div>
          <div className="cms-stat-label">Declined</div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="cms-btn cms-btn-primary" onClick={() => navigate('/cms/rsvps')}>
          View All RSVPs →
        </button>
        <button className="cms-btn cms-btn-outline" onClick={() => navigate('/cms/content')}>
          Edit Content →
        </button>
        <button className="cms-btn cms-btn-outline" onClick={() => navigate('/cms/sync')}>
          Sync to Drive →
        </button>
      </div>

      {/* Recent RSVPs */}
      {rsvps.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '1.3rem', color: '#faf8f0', marginBottom: '1rem' }}>
            Recent RSVPs
          </h3>
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Guests</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.slice(-5).reverse().map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>
                      <span className={`cms-badge ${r.attendance?.toLowerCase().includes('accept') ? 'cms-badge-accept' : 'cms-badge-decline'}`}>
                        {r.attendance}
                      </span>
                    </td>
                    <td>{r.guests}</td>
                    <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
