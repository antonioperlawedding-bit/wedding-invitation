import { useEffect, useState } from 'react';
import { api } from './api';

export default function SyncPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(null); // filename being pulled
  const [toast, setToast] = useState(null);

  const loadStatus = () => {
    api.getSyncStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadStatus, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePush = async () => {
    setPushing(true);
    try {
      const res = await api.pushSync();
      setStatus(res.meta);
      showToast('success', 'Pushed to Google Drive ✓');
    } catch {
      showToast('error', 'Push failed — check Google credentials');
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async (filename) => {
    setPulling(filename);
    try {
      await api.pullSync(filename);
      showToast('success', `Pulled ${filename} from Drive`);
      loadStatus();
    } catch {
      showToast('error', `Failed to pull ${filename}`);
    } finally {
      setPulling(null);
    }
  };

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : 'Never');

  return (
    <>
      <h1 className="cms-page-title">Google Drive Sync</h1>
      <p className="cms-page-subtitle">Keep your data backed up to Google Drive</p>

      {toast && <div className={`cms-toast cms-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Push section */}
      <div className="cms-card" style={{ marginBottom: '2rem' }}>
        <h3 className="cms-card-title">Push to Drive</h3>
        <p className="cms-card-desc">
          Upload current <strong>configs.json</strong> and <strong>rsvps.json</strong> to your Google Drive folder.
        </p>
        <button className="cms-btn cms-btn-primary" disabled={pushing} onClick={handlePush}>
          {pushing ? 'Uploading…' : '☁️ Push to Drive'}
        </button>
      </div>

      {/* Pull section */}
      <div className="cms-card" style={{ marginBottom: '2rem' }}>
        <h3 className="cms-card-title">Pull from Drive</h3>
        <p className="cms-card-desc">
          Download a file from Google Drive and overwrite the local copy.
          <br />
          <em style={{ opacity: 0.6 }}>Use with caution — this replaces local data.</em>
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="cms-btn cms-btn-outline"
            disabled={!!pulling}
            onClick={() => handlePull('configs.json')}
          >
            {pulling === 'configs.json' ? 'Pulling…' : '⬇ Pull configs.json'}
          </button>
          <button
            className="cms-btn cms-btn-outline"
            disabled={!!pulling}
            onClick={() => handlePull('rsvps.json')}
          >
            {pulling === 'rsvps.json' ? 'Pulling…' : '⬇ Pull rsvps.json'}
          </button>
        </div>
      </div>

      {/* Sync history */}
      <div className="cms-card">
        <h3 className="cms-card-title">Sync History</h3>
        {loading ? (
          <p style={{ color: 'rgba(250,248,240,0.4)' }}>Loading…</p>
        ) : !status || Object.keys(status).length === 0 ? (
          <p className="cms-card-desc">No sync history yet. Push data to start.</p>
        ) : (
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Drive File ID</th>
                  <th>Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(status).map(([file, meta]) => (
                  <tr key={file}>
                    <td style={{ fontWeight: 500 }}>{file}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.7 }}>
                      {meta.driveFileId ? meta.driveFileId.slice(0, 16) + '…' : '—'}
                    </td>
                    <td>{fmtDate(meta.lastSynced)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
