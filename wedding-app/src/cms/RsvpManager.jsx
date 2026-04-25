import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from './api';

const EMPTY_FORM = { name: '', phone: '', email: '', attendance: 'Joyfully Accepts', guests: 1 };

const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Newest first' },
  { value: 'date-asc',    label: 'Oldest first' },
  { value: 'name-asc',    label: 'Name A→Z' },
  { value: 'name-desc',   label: 'Name Z→A' },
  { value: 'guests-desc', label: 'Most guests' },
  { value: 'status-asc',  label: 'Accepted first' },
];

function normPhone(p) {
  return String(p || '').replace(/[\s\-().+]/g, '').toLowerCase();
}

export default function RsvpManager() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortKey, setSortKey] = useState('date-desc');
  const [showDupsOnly, setShowDupsOnly] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleDelete = (id, name) => setConfirmDelete({ id, name });

  const confirmDeleteNow = async () => {
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.deleteRsvp(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'RSVP removed');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('error', 'Name is required');
    setSaving(true);
    try {
      const saved = await api.createRsvp({ ...form, guests: parseInt(form.guests, 10) || 1 });
      await load();
      setForm(EMPTY_FORM);
      setShowForm(false);
      showToast('success', 'RSVP added');
    } catch (err) {
      showToast('error', err.message || 'Failed to add RSVP');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditForm({ name: r.name, phone: r.phone || '', email: r.email || '', attendance: r.attendance, guests: r.guests ?? 1 });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSaveEdit = async (id) => {
    if (!editForm.name?.trim()) return showToast('error', 'Name is required');
    setSaving(true);
    try {
      await api.updateRsvp(id, { ...editForm, guests: parseInt(editForm.guests, 10) || 1 });
      await load();
      setEditingId(null);
      setEditForm({});
      showToast('success', 'RSVP updated');
    } catch (err) {
      showToast('error', err.message || 'Failed to update RSVP');
    } finally {
      setSaving(false);
    }
  };

  /* ── Export ── */
  const handleExport = (fmt) => {
    api.exportRsvps(fmt).catch(() => showToast('error', 'Export failed'));
  };

  /* ── Import ── */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setImportResult(null);
    try {
      let records;
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        records = JSON.parse(text);
        if (!Array.isArray(records)) throw new Error('JSON must be an array of objects');
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        records = XLSX.utils.sheet_to_json(ws);
      }
      const result = await api.importRsvps(records);
      setImportResult(result);
      showToast('success', `Imported ${result.added} records${result.flagged.length ? ` (${result.flagged.length} with duplicate phones)` : ''}`);
      await load();
    } catch (err) {
      showToast('error', err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  // Backfill status for older entries that predate the status field
  const normalizedRsvps = rsvps.map((r) => ({
    ...r,
    status: r.status ?? (/declin|أعتذر/i.test(r.attendance || '') ? 'declined' : 'accepted'),
  }));

  /* ── Duplicate phone detection ── */
  const dupPhoneSet = (() => {
    const counts = new Map();
    for (const r of normalizedRsvps) {
      const n = normPhone(r.phone);
      if (n) counts.set(n, (counts.get(n) || 0) + 1);
    }
    const dups = new Set();
    for (const [n, c] of counts) if (c > 1) dups.add(n);
    return dups;
  })();

  const dupCount = normalizedRsvps.filter((r) => dupPhoneSet.has(normPhone(r.phone))).length;

  /* ── Sort + filter ── */
  const displayRsvps = (() => {
    let list = showDupsOnly
      ? normalizedRsvps.filter((r) => dupPhoneSet.has(normPhone(r.phone)))
      : [...normalizedRsvps];
    switch (sortKey) {
      case 'date-desc':   list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)); break;
      case 'date-asc':    list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)); break;
      case 'name-asc':    list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc':   list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'guests-desc': list.sort((a, b) => (b.guests || 0) - (a.guests || 0)); break;
      case 'status-asc':  list.sort((a, b) => (a.status === 'accepted' ? -1 : 1) - (b.status === 'accepted' ? -1 : 1)); break;
    }
    return list;
  })();

  const accepted = normalizedRsvps.filter((r) => r.status === 'accepted');
  const declined = normalizedRsvps.filter((r) => r.status === 'declined');
  const acceptedGuests = accepted.reduce((sum, r) => sum + (r.guests || 0), 0);
  const declinedGuests = declined.reduce((sum, r) => sum + (r.guests || 0), 0);

  return (
    <>
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#faf8f0', border: '1px solid rgba(139,115,85,0.2)', padding: '2rem', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#3a2e22' }}>Remove RSVP?</p>
            <p style={{ marginBottom: '1.5rem', color: 'rgba(58,46,34,0.6)', fontSize: '0.9rem' }}>{confirmDelete.name}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="cms-btn cms-btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="cms-btn cms-btn-sm" onClick={confirmDeleteNow} style={{ background: '#C41E3A', color: '#fff', borderColor: '#C41E3A' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="cms-page-title">RSVPs</h1>
      <p className="cms-page-subtitle">Manage guest responses</p>

      {toast && <div className={`cms-toast cms-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Stats */}
      <div className="cms-stats">
        <div className="cms-stat-card">
          <div className="cms-stat-value" style={{ color: '#87A96B' }}>{acceptedGuests}</div>
          <div className="cms-stat-label">Accepted Guests</div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-value" style={{ color: '#C41E3A' }}>{declinedGuests}</div>
          <div className="cms-stat-label">Declined Guests</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <button className={`cms-btn cms-btn-sm${showForm ? '' : ' cms-btn-primary'}`} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Guest'}
        </button>

        <select
          className="cms-input"
          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', letterSpacing: 0, minWidth: '130px' }}
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          className="cms-btn cms-btn-sm"
          onClick={() => setShowDupsOnly((v) => !v)}
          style={showDupsOnly ? { background: '#f5c518', borderColor: '#f5c518', color: '#3a2e22' } : {}}
          title="Show only entries with duplicate phone numbers"
        >
          {showDupsOnly ? `Showing ${dupCount} duplicates` : `Dup. phones${dupCount ? ` (${dupCount})` : ''}`}
        </button>

        <div style={{ flex: 1 }} />

        <button className="cms-btn cms-btn-sm" onClick={() => handleExport('json')}>↓ JSON</button>
        <button className="cms-btn cms-btn-sm" onClick={() => handleExport('xlsx')}>↓ Excel</button>
        <input ref={fileInputRef} type="file" accept=".json,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
        <button className="cms-btn cms-btn-sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'Importing…' : '↑ Import'}
        </button>
      </div>

      {/* Import result */}
      {importResult && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(250,248,240,0.8)', border: '1px solid rgba(139,115,85,0.2)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: importResult.flagged.length ? '0.75rem' : 0 }}>
            <span style={{ color: '#87A96B', fontWeight: 600 }}>✓ {importResult.added} records imported</span>
            {importResult.flagged.length > 0 && <span style={{ color: '#856404', fontWeight: 600 }}>⚠ {importResult.flagged.length} have duplicate phones (still added)</span>}
            <button className="cms-btn cms-btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setImportResult(null)}>✕</button>
          </div>
          {importResult.flagged.length > 0 && (
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ color: 'rgba(58,46,34,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <th style={{ textAlign: 'left', padding: '0.25rem 0.5rem' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '0.25rem 0.5rem' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: '0.25rem 0.5rem' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.flagged.map((f, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(139,115,85,0.1)' }}>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#3a2e22' }}>{f.record.name}</td>
                      <td style={{ padding: '0.3rem 0.5rem' }} dir="ltr">{f.record.phone}</td>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#C41E3A' }}>{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(250,248,240,0.6)', border: '1px solid rgba(139,115,85,0.15)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(58,46,34,0.5)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Name *</label>
            <input className="cms-input" style={{ textAlign: 'left', letterSpacing: 0 }} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(58,46,34,0.5)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Phone</label>
            <input className="cms-input" style={{ textAlign: 'left', letterSpacing: 0 }} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+961 ..." dir="ltr" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(58,46,34,0.5)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Email</label>
            <input className="cms-input" style={{ textAlign: 'left', letterSpacing: 0 }} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(58,46,34,0.5)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Status</label>
            <select className="cms-input" style={{ textAlign: 'left', letterSpacing: 0, cursor: 'pointer' }} value={form.attendance} onChange={(e) => setForm((f) => ({ ...f, attendance: e.target.value }))}>
              <option value="Joyfully Accepts">Joyfully Accepts</option>
              <option value="Regretfully Declines">Regretfully Declines</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(58,46,34,0.5)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Guests</label>
            <input className="cms-input" style={{ textAlign: 'left', letterSpacing: 0 }} type="number" min="1" max="20" value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="cms-btn cms-btn-primary cms-btn-sm" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Cards */}
      {loading ? (
        <p style={{ color: 'rgba(58,46,34,0.4)' }}>Loading…</p>
      ) : displayRsvps.length === 0 ? (
        <div className="cms-empty">{showDupsOnly ? 'No duplicate phone numbers found.' : 'No RSVPs yet.'}</div>
      ) : (
        <div className="cms-cards">
          {displayRsvps.map((r) => {
            const isEditing = editingId === r.id;
            const isDup = dupPhoneSet.has(normPhone(r.phone));
            return (
              <div
                key={r.id}
                className="cms-card"
                style={{
                  ...(isEditing ? { borderColor: 'rgba(135,169,107,0.35)', background: 'rgba(135,169,107,0.03)' } : {}),
                  ...(isDup && !isEditing ? { borderColor: 'rgba(245,197,24,0.6)', borderWidth: '1.5px' } : {}),
                }}
              >
                {isEditing ? (
                  <div className="cms-card-edit-form">
                    <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                    <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+961 ..." dir="ltr" />
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                    <select value={editForm.attendance} onChange={(e) => setEditForm((f) => ({ ...f, attendance: e.target.value }))} style={{ cursor: 'pointer' }}>
                      <option value="Joyfully Accepts">Joyfully Accepts</option>
                      <option value="Regretfully Declines">Regretfully Declines</option>
                    </select>
                    <input type="number" min="1" max="20" value={editForm.guests} onChange={(e) => setEditForm((f) => ({ ...f, guests: e.target.value }))} placeholder="Guests" />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p className="cms-card-name">{r.name}</p>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
                        {isDup && <span title="Duplicate phone" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(245,197,24,0.2)', border: '1px solid rgba(245,197,24,0.5)', color: '#856404', letterSpacing: '0.05em' }}>DUP</span>}
                        <span className={`cms-badge ${r.status === 'accepted' ? 'cms-badge-accept' : 'cms-badge-decline'}`}>{r.status === 'accepted' ? 'Accepted' : 'Declined'}</span>
                      </div>
                    </div>
                    {r.phone && <div className="cms-card-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg><span dir="ltr">{r.phone}</span></div>}
                    {r.email && <div className="cms-card-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg><span>{r.email}</span></div>}
                    <div className="cms-card-row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      <span>{r.guests} guest{r.guests !== 1 ? 's' : ''}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(58,46,34,0.35)' }}>{new Date(r.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
                <div className="cms-card-actions">
                  {isEditing ? (
                    <>
                      <button className="cms-btn-icon" title="Save" disabled={saving} onClick={() => handleSaveEdit(r.id)} style={{ borderColor: 'rgba(135,169,107,0.4)', color: '#87A96B' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      <button className="cms-btn-icon" title="Cancel" onClick={cancelEdit} style={{ borderColor: 'rgba(139,115,85,0.25)', color: 'rgba(58,46,34,0.4)' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="cms-btn-icon" title="Edit" onClick={() => startEdit(r)} style={{ borderColor: 'rgba(135,169,107,0.3)', color: '#87A96B' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="cms-btn-icon" title="Delete" onClick={() => handleDelete(r.id, r.name)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

