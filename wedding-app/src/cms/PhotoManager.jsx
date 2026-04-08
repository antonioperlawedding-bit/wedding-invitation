import { useEffect, useState, useRef } from 'react';
import { api } from './api';

const FOLDERS = [
  { key: 'perla', label: 'Bride (Perla)', desc: 'Profile photo displayed in the Couple section of the invitation. Upload a single portrait photo — it replaces the current one.', single: true },
  { key: 'antonio', label: 'Groom (Antonio)', desc: 'Profile photo displayed in the Couple section of the invitation. Upload a single portrait photo — it replaces the current one.', single: true },
  { key: 'memories', label: 'Memories Gallery', desc: 'Photos displayed in the Gallery section. The file name (without extension) becomes the caption shown on hover — rename files to set captions (e.g. "Our first date.jpg").', single: false },
];

function driveThumb(fileId, sz = 'w400') {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
}

function PhotoCard({ file, folder, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(file.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name === file.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await onRename(file.id, name.trim());
      setEditing(false);
    } catch { /* toast handled upstream */ }
    finally { setSaving(false); }
  };

  return (
    <div className="photo-card">
      <div className="photo-card-img">
        <img
          src={driveThumb(file.id)}
          alt={file.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div className="photo-card-info">
        {editing ? (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              className="cms-field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem', flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button className="cms-btn cms-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} disabled={saving} onClick={handleSave}>
              {saving ? '…' : '✓'}
            </button>
            <button className="cms-btn cms-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => { setName(file.name); setEditing(false); }}>
              ✕
            </button>
          </div>
        ) : (
          <p className="photo-card-name" title={file.name}>
            {file.name}
          </p>
        )}
        <div className="photo-card-actions">
          {!editing && (
            <button className="cms-btn-icon" title="Rename" onClick={() => setEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
          <button className="cms-btn-icon" title="Delete" onClick={() => onDelete(file.id, file.name)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function FolderSection({ folder }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setLoading(true);
    api.listPhotos(folder.key)
      .then((res) => setFiles(res.files || []))
      .catch(() => showToast('error', 'Failed to load photos'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [folder.key]);

  const handleUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;
    setUploading(true);

    for (const file of fileList) {
      try {
        const base64 = await fileToBase64(file);
        await api.uploadPhoto(folder.key, file.name, file.type, base64);
      } catch {
        showToast('error', `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    showToast('success', `Uploaded ${fileList.length} photo(s)`);
    load();
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRename = async (fileId, newName) => {
    try {
      await api.renamePhoto(folder.key, fileId, newName);
      setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, name: newName } : f));
      showToast('success', 'Renamed');
    } catch {
      showToast('error', 'Failed to rename');
      throw new Error();
    }
  };

  const handleDelete = async (fileId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.deletePhoto(folder.key, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast('success', 'Deleted');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const currentPhoto = folder.single && files.length > 0 ? files[0] : null;

  return (
    <details className="cms-section-card" open>
      <summary className="cms-section-header">
        <span>{folder.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.4, fontFamily: 'Jost, sans-serif' }}>
          {files.length} photo{files.length !== 1 ? 's' : ''}
        </span>
      </summary>
      <div className="cms-section-body">
        <p className="cms-card-desc" style={{ marginBottom: '1rem' }}>{folder.desc}</p>

        {toast && <div className={`cms-toast cms-toast-${toast.type}`} style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{toast.msg}</div>}

        {/* Current preview for single-photo folders */}
        {folder.single && !loading && (
          <div className="photo-current-preview" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(250,248,240,0.4)', marginBottom: '0.75rem' }}>
              Currently displayed in invitation
            </p>
            {currentPhoto ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(15,30,11,0.5)', border: '1px solid rgba(204,158,36,0.15)', borderRadius: '10px', padding: '1rem' }}>
                <img
                  src={driveThumb(currentPhoto.id, 'w300')}
                  alt={currentPhoto.name}
                  style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(204,158,36,0.2)' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#faf8f0', marginBottom: '0.25rem' }}>{currentPhoto.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(250,248,240,0.35)' }}>
                    {currentPhoto.size ? `${(parseInt(currentPhoto.size) / 1024).toFixed(0)} KB` : ''} · {currentPhoto.mimeType || 'image'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(15,30,11,0.5)', border: '1px dashed rgba(204,158,36,0.2)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(250,248,240,0.3)', fontStyle: 'italic' }}>No photo uploaded yet — showing initials placeholder in the invitation.</p>
              </div>
            )}
          </div>
        )}

        {/* Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={!folder.single}
            onChange={handleUpload}
            style={{ display: 'none' }}
            id={`upload-${folder.key}`}
          />
          <button
            className="cms-btn cms-btn-outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : `📷 ${folder.single ? 'Upload / Replace Photo' : 'Upload Photos'}`}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: 'rgba(250,248,240,0.4)' }}>Loading…</p>
        ) : files.length === 0 ? (
          <div className="cms-empty">No photos yet. Upload one to get started.</div>
        ) : (
          <div className={folder.single ? 'photo-grid photo-grid-single' : 'photo-grid'}>
            {files.map((f) => (
              <PhotoCard key={f.id} file={f} folder={folder.key} onRename={handleRename} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // strip data:image/...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoManager() {
  return (
    <>
      <h1 className="cms-page-title">Photos</h1>
      <p className="cms-page-subtitle">Manage wedding photos displayed in the invitation</p>

      {/* Info banner */}
      <div style={{
        background: 'rgba(204,158,36,0.06)',
        border: '1px solid rgba(204,158,36,0.18)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        fontSize: '0.82rem',
        color: 'rgba(250,248,240,0.6)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#cc9e24' }}>How it works:</strong> Photos are stored in your Google Drive folder.
        The <em>Bride</em> and <em>Groom</em> folders hold a single profile photo each (displayed in the Couple section).
        The <em>Memories</em> folder holds all gallery photos — <strong>file names become captions</strong> on hover (rename to set captions like "Our first date.jpg").
      </div>

      <div className="cms-sections">
        {FOLDERS.map((f) => (
          <FolderSection key={f.key} folder={f} />
        ))}
      </div>
    </>
  );
}
