import { useEffect, useState } from 'react';
import { api } from './api';

export default function RsvpManager() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    api.getRsvps()
      .then(setRsvps)
      .catch(() => showToast('error', 'Failed to load RSVPs'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove RSVP from ${name}?`)) return;
    try {
      await api.deleteRsvp(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'RSVP removed');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const accepted = rsvps.filter((r) => r.attendance?.toLowerCase().includes('accept'));
  const declined = rsvps.filter((r) => r.attendance?.toLowerCase().includes('decline'));
  const totalGuests = accepted.reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <>
      <h1 className="cms-page-title">RSVPs</h1>
      <p className="cms-page-subtitle">Manage guest responses</p>

      {toast && <div className={`cms-toast cms-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Stats */}
      <div className="cms-stats">
        <div className="cms-stat-card">
          <div className="cms-stat-value">{rsvps.length}</div>
          <div className="cms-stat-label">Total</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{accepted.length}</div>
          <div className="cms-stat-label">Accepted</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{declined.length}</div>
          <div className="cms-stat-label">Declined</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value">{totalGuests}</div>
          <div className="cms-stat-label">Expected Guests</div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(250,248,240,0.4)' }}>Loading…</p>
      ) : rsvps.length === 0 ? (
        <div className="cms-empty">No RSVPs yet.</div>
      ) : (
        <div className="cms-table-wrap">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Guests</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...rsvps].reverse().map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td>{r.phone || '—'}</td>
                  <td>{r.email || '—'}</td>
                  <td>
                    <span className={`cms-badge ${r.attendance?.toLowerCase().includes('accept') ? 'cms-badge-accept' : 'cms-badge-decline'}`}>
                      {r.attendance}
                    </span>
                  </td>
                  <td>{r.guests ?? '—'}</td>
                  <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="cms-btn-icon"
                      title="Delete"
                      onClick={() => handleDelete(r.id, r.name)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
