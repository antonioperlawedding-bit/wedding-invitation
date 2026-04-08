import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from './api';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

/* ══════════════════════════════════════════════════════
   Live Editor — WYSIWYG preview of the wedding invitation
   with inline text editing and click-to-replace images.
   ══════════════════════════════════════════════════════ */

/* ── Deep path helpers ── */
function deepGet(obj, path) {
  return path.split('.').reduce((o, k) => o?.[Number.isInteger(+k) ? +k : k], obj);
}
function deepSet(obj, path, value) {
  const clone = structuredClone(obj);
  const keys = path.split('.');
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[Number.isInteger(+keys[i]) ? +keys[i] : keys[i]];
  cur[Number.isInteger(+keys.at(-1)) ? +keys.at(-1) : keys.at(-1)] = value;
  return clone;
}
const thumb = driveThumbUrl;

/* ── Editable Text ── */
function ET({ config, path, tag: Tag = 'span', style, onChange }) {
  const ref = useRef(null);
  const value = String(deepGet(config, path) ?? '');
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) ref.current.innerText = value;
  }, [value]);
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={() => {
        const v = ref.current?.innerText ?? '';
        if (v !== value) onChange(path, v);
      }}
      className="le-editable"
      style={style}
    />
  );
}

/* ── Editable Image (Drive) with drag-to-reposition ── */
function EI({ fileId, alt, style, folder, onUploaded, objectPosition = 'center center', onPositionChange, posKey, thumbSize = 'w1200' }) {
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, ox: 50, oy: 50 });
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  // Parse objectPosition to % values
  const parsePos = (pos) => {
    const parts = (pos || 'center center').split(/\s+/);
    const map = (v) => v === 'center' ? 50 : v === 'top' ? 0 : v === 'bottom' ? 100 : v === 'left' ? 0 : v === 'right' ? 100 : parseFloat(v) || 50;
    return { x: map(parts[0]), y: map(parts[1] || parts[0]) };
  };

  // Clear local preview once a new Drive fileId arrives after upload
  const prevFileId = useRef(fileId);
  useEffect(() => {
    if (localPreview && fileId && fileId !== prevFileId.current) {
      setLocalPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    }
    prevFileId.current = fileId;
  }, [fileId, localPreview]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploading(true);
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      await api.uploadPhoto(folder, file.name, file.type, b64);
      onUploaded();
    } finally {
      setUploading(false);
      inputRef.current.value = '';
    }
  };

  const onMouseDown = (e) => {
    if (!fileId || e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    const pos = parsePos(objectPosition);
    startPos.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPos.current.x) / rect.width) * -100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * -100;
    const nx = Math.min(100, Math.max(0, startPos.current.ox + dx));
    const ny = Math.min(100, Math.max(0, startPos.current.oy + dy));
    if (onPositionChange && posKey) onPositionChange(posKey, `${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const imgSrc = localPreview || (fileId ? thumb(fileId, thumbSize) : null);

  return (
    <div ref={wrapRef} className="le-img-wrap" style={style}>
      {imgSrc ? (
        <img src={imgSrc} alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', objectPosition: localPreview ? 'center center' : objectPosition, cursor: uploading ? 'default' : 'grab' }}
          onMouseDown={uploading ? undefined : onMouseDown}
          draggable={false} />
      ) : (
        <div className="le-img-empty"><span>📷</span><small>Click to add</small></div>
      )}
      {uploading && (
        <div className="le-upload-overlay">
          <div className="le-spinner" />
          <span className="le-upload-label">Uploading…</span>
        </div>
      )}
      {!uploading && <div className="le-img-overlay le-img-overlay-btn" onClick={() => inputRef.current?.click()}><span>📷 Change Photo</span></div>}
      {fileId && !uploading && <div className="le-img-hint">Drag to reposition</div>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

/* ── Shared style constants ── */
const SERIF = '"Cormorant Garamond", serif';
const SANS = '"Jost", sans-serif';
const CREAM = '#faf8f0';
const GOLD = '#cc9e24';
const TAG_STYLE = { fontFamily: SANS, fontWeight: 200, fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: GOLD };
const TITLE_STYLE = { fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(2rem,5vw,3.2rem)', color: CREAM, lineHeight: 1.2 };
const BODY_STYLE = { fontFamily: SANS, fontWeight: 300, fontSize: '0.85rem', color: 'rgba(250,248,240,0.6)', lineHeight: 1.7 };
const DIVIDER = <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg,transparent,#cc9e24,transparent)', margin: '1.5rem auto 0' }} />;

/* ═══════════════════════════════════════
   Section Previews
   ═══════════════════════════════════════ */

function SectionLabel({ label }) {
  return (
    <div className="le-section-label">
      <span>{label}</span>
    </div>
  );
}

/* ── Hero ── */
function HeroPreview({ config, onChange }) {
  return (
    <section className="le-section" style={{ background: '#1a2e14', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
      <SectionLabel label="Hero Section" />
      <div style={{ padding: '4rem 2rem', width: '100%', maxWidth: 700 }}>
        <ET config={config} path="ui.hero.tag" tag="p" style={TAG_STYLE} onChange={onChange} />
        <div style={{ margin: '2rem 0' }}>
          <ET config={config} path="couple.groom.firstName" tag="span"
            style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 'clamp(3rem,10vw,6rem)', color: CREAM, display: 'block', lineHeight: 1 }}
            onChange={onChange} />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.5rem,5vw,3rem)', color: GOLD, display: 'block', margin: '0.2em 0' }}>&amp;</span>
          <ET config={config} path="couple.bride.firstName" tag="span"
            style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 'clamp(3rem,10vw,6rem)', color: CREAM, display: 'block', lineHeight: 1 }}
            onChange={onChange} />
        </div>
        <div style={{ width: 120, height: 1, background: 'linear-gradient(90deg,transparent,#cc9e24,#f9cc01,#cc9e24,transparent)', margin: '1.5rem auto' }} />
        <ET config={config} path="couple.groom.parentsDisplay" tag="p"
          style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.3em', color: 'rgba(250,248,240,0.4)', marginBottom: '0.25rem' }}
          onChange={onChange} />
        <span style={{ color: GOLD, fontSize: '0.6rem', opacity: 0.4 }}>✦</span>
        <ET config={config} path="couple.bride.parentsDisplay" tag="p"
          style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.3em', color: 'rgba(250,248,240,0.4)', marginTop: '0.25rem' }}
          onChange={onChange} />
        <div style={{ marginTop: '2rem' }}>
          <ET config={config} path="wedding.dateFormatted" tag="p"
            style={{ fontFamily: SERIF, fontSize: '1rem', color: GOLD, letterSpacing: '0.2em' }}
            onChange={onChange} />
          <ET config={config} path="wedding.locationFull" tag="p"
            style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.25em', color: 'rgba(250,248,240,0.35)', marginTop: '0.5rem' }}
            onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

/* ── Couple ── matches real PersonCard layout exactly ── */
function CouplePreview({ config, photos, onChange, onPhotosRefresh, imagePositions, onPositionChange }) {
  const personCard = (role, side, photoFile) => {
    const person = deepGet(config, `couple.${role}`) || {};
    const prefix = `couple.${role}`;
    const folder = role === 'bride' ? 'perla' : 'antonio';
    const posKey = `couple_${role}`;
    const roleLabel = role === 'bride' ? 'Bride' : 'Groom';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: 480 }}>
        {/* Portrait frame — 3:4 with gold border + corner accents */}
        <div style={{ position: 'relative', aspectRatio: '3/4', maxHeight: 520, overflow: 'hidden' }}>
          {/* Gold border */}
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(204,158,36,0.5)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Corner accents */}
          {['tl','tr','bl','br'].map(c => (
            <div key={c} style={{
              position: 'absolute', width: 24, height: 24, borderColor: GOLD, borderStyle: 'solid',
              borderWidth: c.includes('t') ? '1px 0 0 0' : '0 0 1px 0',
              ...(c.includes('r') ? { borderRightWidth: '1px', right: -1 } : { borderLeftWidth: '1px', left: -1 }),
              ...(c.includes('t') ? { top: -1 } : { bottom: -1 }),
              zIndex: 3,
            }} />
          ))}
          {/* Photo */}
          <EI fileId={photoFile?.id} alt={person.firstName} folder={folder} onUploaded={onPhotosRefresh}
            objectPosition={imagePositions?.[posKey] || 'center top'} onPositionChange={onPositionChange} posKey={posKey}
            style={{ position: 'absolute', inset: 0 }} />
          {/* Role badge */}
          <div style={{
            position: 'absolute', bottom: '1.5rem',
            ...(side === 'left' ? { right: '1.5rem' } : { left: '1.5rem' }),
            padding: '0.4rem 1.2rem', background: 'rgba(204,158,36,0.9)', zIndex: 4,
          }}>
            <span style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.62rem', letterSpacing: '0.45em', color: '#1a2e14', textTransform: 'uppercase' }}>
              {roleLabel}
            </span>
          </div>
        </div>
        {/* Text */}
        <div style={{ paddingLeft: side === 'right' ? '0.5rem' : 0 }}>
          <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.65rem', letterSpacing: '0.45em', color: GOLD, textTransform: 'uppercase', marginBottom: '0.6rem' }}>{roleLabel}</p>
          <ET config={config} path={`${prefix}.firstName`} tag="h3"
            style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,2.8rem)', color: CREAM, lineHeight: 1.1, marginBottom: '0.3rem' }} onChange={onChange} />
          <ET config={config} path={`${prefix}.fullName`} tag="p"
            style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '1.05rem', color: 'rgba(250,248,240,0.5)', letterSpacing: '0.1em', marginBottom: '1.25rem' }} onChange={onChange} />
          <ET config={config} path={`${prefix}.bio`} tag="p"
            style={{ fontFamily: SANS, fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.85, color: 'rgba(250,248,240,0.55)', maxWidth: 420 }} onChange={onChange} />
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ height: 1, width: 40, background: 'rgba(204,158,36,0.4)' }} />
            <ET config={config} path={`${prefix}.parents`} tag="p"
              style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(204,158,36,0.6)' }} onChange={onChange} />
          </div>
        </div>
      </div>
    );
  };
  return (
    <section className="le-section" style={{ background: '#1e3216', padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)', position: 'relative', overflow: 'hidden' }}>
      <SectionLabel label="Couple Section" />
      {/* Watermark & */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: SERIF, fontSize: 'clamp(12rem,30vw,22rem)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(204,158,36,0.04)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>&amp;</div>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,5rem)' }}>
          <p style={{ ...TAG_STYLE, marginBottom: '0.75rem' }}>The Couple</p>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(2.2rem,6vw,4rem)', color: CREAM, lineHeight: 1.15 }}>Two Souls, One Story</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', gap: 'clamp(3rem,8vw,6rem)' }}>
          {personCard('bride', 'left', photos.perla)}
          {/* Center heart divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', paddingTop: '12rem', minWidth: 60 }}>
            <div style={{ width: 1, height: 80, background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4))' }} />
            <div style={{ width: 44, height: 44, border: '1px solid rgba(204,158,36,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: GOLD }}>♡</div>
            <div style={{ width: 1, height: 80, background: 'linear-gradient(to top, transparent, rgba(204,158,36,0.4))' }} />
          </div>
          {personCard('groom', 'right', photos.antonio)}
        </div>
      </div>
    </section>
  );
}

/* ── Events ── */
function EventsPreview({ config, onChange }) {
  const eventCard = (key, icon) => {
    const prefix = `events.${key}`;
    return (
      <div style={{ flex: 1, minWidth: 280, background: 'rgba(26,46,20,0.5)', border: '1px solid rgba(204,158,36,0.12)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>{icon}</span>
        <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.55rem', letterSpacing: '0.4em', color: GOLD, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{key}</p>
        <ET config={config} path={`${prefix}.venue`} tag="h4"
          style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '1.5rem', color: CREAM, marginBottom: '0.5rem' }} onChange={onChange} />
        <ET config={config} path={`${prefix}.time`} tag="p"
          style={{ fontFamily: SERIF, fontSize: '1.1rem', color: GOLD, letterSpacing: '0.15em', marginBottom: '0.75rem' }} onChange={onChange} />
        <ET config={config} path={`${prefix}.address`} tag="p"
          style={{ ...BODY_STYLE, fontSize: '0.78rem', marginBottom: '0.75rem' }} onChange={onChange} />
        <ET config={config} path={`${prefix}.description`} tag="p"
          style={{ ...BODY_STYLE, fontStyle: 'italic', fontSize: '0.82rem' }} onChange={onChange} />
      </div>
    );
  };
  return (
    <section className="le-section" style={{ background: '#1e3518' }}>
      <SectionLabel label="Events Section" />
      <div style={{ padding: '4rem 2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <ET config={config} path="ui.events.tag" tag="p" style={TAG_STYLE} onChange={onChange} />
        <ET config={config} path="ui.events.title" tag="h2" style={{ ...TITLE_STYLE, margin: '0.75rem 0' }} onChange={onChange} />
        <ET config={config} path="ui.events.subtitle" tag="p" style={{ ...BODY_STYLE, fontSize: '0.82rem', marginBottom: '2.5rem' }} onChange={onChange} />
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {eventCard('ceremony', '⛪')}
          {eventCard('reception', '🥂')}
        </div>
      </div>
    </section>
  );
}

/* ── Timeline ── */
function TimelinePreview({ config, onChange }) {
  const items = deepGet(config, 'events.timeline') || [];

  const addItem = () => {
    const updated = [...items, { time: '0:00 PM', title: 'New Event', description: 'Description here', icon: 'guests' }];
    onChange('events.timeline', updated);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange('events.timeline', updated);
  };

  const moveItem = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange('events.timeline', updated);
  };

  return (
    <section className="le-section" style={{ background: '#1a2e14' }}>
      <SectionLabel label="Timeline Section" />
      <div style={{ padding: '4rem 2rem', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <ET config={config} path="ui.timeline.tag" tag="p" style={TAG_STYLE} onChange={onChange} />
        <ET config={config} path="ui.timeline.title" tag="h2" style={{ ...TITLE_STYLE, margin: '0.75rem 0 3rem' }} onChange={onChange} />
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, background: 'rgba(204,158,36,0.2)' }} />
          {items.map((_, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: '2.5rem', paddingLeft: '1.5rem', textAlign: 'left' }}>
              {/* Dot */}
              <div style={{ position: 'absolute', left: '-2.35rem', top: '0.25rem', width: 10, height: 10, borderRadius: '50%', border: '1px solid #cc9e24', background: '#1a2e14' }} />
              <ET config={config} path={`events.timeline.${i}.time`} tag="p"
                style={{ fontFamily: SERIF, fontSize: '0.95rem', color: GOLD, letterSpacing: '0.15em', marginBottom: '0.25rem' }} onChange={onChange} />
              <ET config={config} path={`events.timeline.${i}.title`} tag="h4"
                style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '1.2rem', color: CREAM, marginBottom: '0.3rem' }} onChange={onChange} />
              <ET config={config} path={`events.timeline.${i}.description`} tag="p"
                style={BODY_STYLE} onChange={onChange} />
              {/* Item controls */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                {i > 0 && (
                  <button onClick={() => moveItem(i, -1)} style={{ background: 'rgba(204,158,36,0.15)', border: '1px solid rgba(204,158,36,0.3)', color: '#cc9e24', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.6rem', cursor: 'pointer' }}>▲ Up</button>
                )}
                {i < items.length - 1 && (
                  <button onClick={() => moveItem(i, 1)} style={{ background: 'rgba(204,158,36,0.15)', border: '1px solid rgba(204,158,36,0.3)', color: '#cc9e24', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.6rem', cursor: 'pointer' }}>▼ Down</button>
                )}
                <button onClick={() => removeItem(i)} style={{ background: 'rgba(200,50,50,0.15)', border: '1px solid rgba(200,50,50,0.3)', color: '#e55', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.6rem', cursor: 'pointer', marginLeft: 'auto' }}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>
        {/* Add button */}
        <button onClick={addItem} style={{ marginTop: '1rem', background: 'rgba(204,158,36,0.15)', border: '1px solid rgba(204,158,36,0.35)', color: '#cc9e24', borderRadius: '6px', padding: '0.5rem 1.2rem', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>+ Add Timeline Item</button>
      </div>
    </section>
  );
}

/* ── Confirm Delete Popup ── */
function ConfirmDeletePopup({ photoName, onConfirm, onCancel, deleting }) {
  return (
    <div className="le-confirm-overlay" onClick={!deleting ? onCancel : undefined}>
      <div className="le-confirm-popup" onClick={e => e.stopPropagation()}>
        <div className="le-confirm-icon">🗑️</div>
        <h3 className="le-confirm-title">Delete Photo</h3>
        <p className="le-confirm-text">
          Are you sure you want to delete<br/>
          <strong>{photoName}</strong>?
        </p>
        <p className="le-confirm-warning">This action cannot be undone.</p>
        <div className="le-confirm-actions">
          <button className="le-confirm-btn le-confirm-btn-cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="le-confirm-btn le-confirm-btn-delete" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Gallery ── resizable photo wall with predefined size presets ── */
function GalleryPreview({ config, photos, onPhotosRefresh, imagePositions, onPositionChange, onChange, onDeletedId, onToast }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadCount, setUploadCount] = useState(0);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadCount(files.length);
    for (const file of files) {
      const b64 = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.readAsDataURL(file);
      });
      await api.uploadPhoto('memories', file.name, file.type, b64).catch(() => {});
    }
    setUploading(false);
    setUploadCount(0);
    onPhotosRefresh();
    inputRef.current.value = '';
  };

  const handleDelete = async (fileId) => {
    setDeleting(true);
    try {
      await api.deletePhoto('memories', fileId);
      onDeletedId(fileId);
      onPhotosRefresh();
      onToast('success', 'Photo deleted successfully');
    } catch (err) {
      onToast('error', err.message || 'Failed to delete photo');
      onPhotosRefresh();
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleRename = async (fileId) => {
    if (!newName.trim()) { setRenaming(null); return; }
    await api.renamePhoto('memories', fileId, newName.trim()).catch(() => {});
    setRenaming(null);
    onPhotosRefresh();
  };

  const memories = photos.memories || [];

  const galleryLayout = config.galleryLayout || {};
  const galleryOrder = config.galleryOrder || [];
  const sorted = [...memories].sort((a, b) => {
    const ai = galleryOrder.indexOf(a.id);
    const bi = galleryOrder.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const getLayout = (fid) => galleryLayout[fid] || { cols: 3, aspect: '1/1' };
  const setItemLayout = (fid, key, val) => {
    onChange('galleryLayout', { ...galleryLayout, [fid]: { ...getLayout(fid), [key]: val } });
  };
  const moveImage = (fid, dir) => {
    const order = sorted.map(f => f.id);
    const idx = order.indexOf(fid);
    const ni = idx + dir;
    if (idx < 0 || ni < 0 || ni >= order.length) return;
    [order[idx], order[ni]] = [order[ni], order[idx]];
    onChange('galleryOrder', order);
  };

  const galleryTag = deepGet(config, 'ui.gallery.tag') || 'Gallery';
  const galleryTitle = deepGet(config, 'ui.gallery.title') || 'Our Story in Frames';
  const gallerySub = deepGet(config, 'ui.gallery.subtitle') || '';

  return (
    <section className="le-section" style={{ background: '#1e3518', padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)', position: 'relative', overflow: 'hidden' }}>
      <SectionLabel label="Gallery Section" />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,4.5rem)' }}>
          <p style={{ ...TAG_STYLE, marginBottom: '0.75rem' }}>{galleryTag}</p>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(2.2rem,6vw,4rem)', color: CREAM }}>{galleryTitle}</h2>
          <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.82rem', color: 'rgba(250,248,240,0.4)', marginTop: '0.75rem', letterSpacing: '0.15em' }}>{gallerySub}</p>
          <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.68rem', color: 'rgba(204,158,36,0.35)', marginTop: '0.4rem', letterSpacing: '0.1em' }}>Drag to reposition · Hover for size &amp; layout controls</p>
        </div>

        {/* 6-col photo wall — sizes driven by config.galleryLayout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          {sorted.map((f, i) => {
            const layout = getLayout(f.id);
            const posKey = `gallery_${f.id}`;
            const caption = f.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || `Memory ${i + 1}`;
            return (
              <div key={f.id} className="le-gallery-item" style={{
                gridColumn: `span ${layout.cols}`,
                aspectRatio: layout.aspect,
                position: 'relative',
                background: 'linear-gradient(135deg, #2a4a1e 0%, #3a5a28 60%, #1e3216 100%)',
                overflow: 'hidden',
              }}>
                <EI fileId={f.id} alt={caption} folder="memories" onUploaded={onPhotosRefresh}
                  objectPosition={imagePositions?.[posKey] || 'center center'}
                  onPositionChange={onPositionChange} posKey={posKey}
                  thumbSize={layout.cols >= 4 ? 'w1600' : 'w800'}
                  style={{ position: 'absolute', inset: 0 }} />
                {/* Top controls — size, aspect, reorder */}
                <div className="le-gallery-controls">
                  <div className="le-ctrl-group">
                    {[{ c: 2, l: 'S' }, { c: 3, l: 'M' }, { c: 4, l: 'L' }, { c: 6, l: 'XL' }].map(s => (
                      <button key={s.c} className={`le-ctrl-btn${layout.cols === s.c ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setItemLayout(f.id, 'cols', s.c); }}>{s.l}</button>
                    ))}
                  </div>
                  <div className="le-ctrl-sep" />
                  <div className="le-ctrl-group">
                    {[{ v: '1/1', l: '□' }, { v: '4/3', l: '4:3' }, { v: '16/9', l: '16:9' }, { v: '3/4', l: '▯' }].map(a => (
                      <button key={a.v} className={`le-ctrl-btn${layout.aspect === a.v ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setItemLayout(f.id, 'aspect', a.v); }}>{a.l}</button>
                    ))}
                  </div>
                  <div className="le-ctrl-sep" />
                  <div className="le-ctrl-group">
                    <button className="le-ctrl-btn" onClick={(e) => { e.stopPropagation(); moveImage(f.id, -1); }} disabled={i === 0}>◀</button>
                    <button className="le-ctrl-btn" onClick={(e) => { e.stopPropagation(); moveImage(f.id, 1); }} disabled={i === sorted.length - 1}>▶</button>
                  </div>
                </div>
                {/* Bottom action bar — doesn't block drag area */}
                <div className="le-gallery-actions">
                  {renaming === f.id ? (
                    <div style={{ display: 'flex', gap: '0.3rem', width: '100%', padding: '0 0.5rem' }} onClick={(e) => e.stopPropagation()}>
                      <input className="cms-field-input" value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(f.id)}
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', flex: 1 }} autoFocus />
                      <button className="cms-btn cms-btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} onClick={() => handleRename(f.id)}>✓</button>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.85rem', color: CREAM, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caption}</p>
                      <button className="le-gallery-btn" onClick={(e) => { e.stopPropagation(); setRenaming(f.id); setNewName(f.name); }}>Rename</button>
                      <button className="le-gallery-btn le-gallery-btn-del" onClick={(e) => { e.stopPropagation(); setConfirmDelete(f); }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {/* Upload spinner cards */}
          {uploading && Array.from({ length: uploadCount || 1 }).map((_, i) => (
            <div key={`uploading-${i}`} className="le-gallery-uploading" style={{ gridColumn: 'span 3', aspectRatio: '1/1' }}>
              <div className="le-spinner" />
              <span className="le-upload-label">Uploading…</span>
            </div>
          ))}
          {/* Add photo card */}
          <div className="le-gallery-add" onClick={uploading ? undefined : () => inputRef.current?.click()} style={{ gridColumn: 'span 3', aspectRatio: '1/1', opacity: uploading ? 0.4 : 1, pointerEvents: uploading ? 'none' : 'auto' }}>
            <span style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.3rem' }}>+</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>Add Photo</span>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
      </div>
      {confirmDelete && (
        <ConfirmDeletePopup
          photoName={confirmDelete.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'this photo'}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => !deleting && setConfirmDelete(null)}
          deleting={deleting}
        />
      )}
    </section>
  );
}

/* ── RSVP ── */
function RsvpPreview({ config, onChange }) {
  return (
    <section className="le-section" style={{ background: '#243a1c' }}>
      <SectionLabel label="RSVP Section" />
      <div style={{ padding: '4rem 2rem', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <ET config={config} path="ui.rsvp.tag" tag="p" style={TAG_STYLE} onChange={onChange} />
        <ET config={config} path="ui.rsvp.title" tag="h2" style={{ ...TITLE_STYLE, margin: '0.75rem 0' }} onChange={onChange} />
        {DIVIDER}
        <div style={{ marginTop: '2rem', opacity: 0.5 }}>
          <p style={BODY_STYLE}>Please respond by</p>
          <ET config={config} path="events.rsvp.deadline" tag="p"
            style={{ fontFamily: SERIF, fontSize: '1.1rem', color: GOLD, marginTop: '0.5rem' }} onChange={onChange} />
        </div>
        {/* Mock form (visual only) */}
        <div style={{ marginTop: '2rem', maxWidth: 400, margin: '2rem auto 0' }}>
          {['Full Name', 'Phone Number', 'Email (optional)', 'Attendance', 'Number of Guests'].map((lbl) => (
            <div key={lbl} style={{ borderBottom: '1px solid rgba(250,248,240,0.1)', padding: '1rem 0', textAlign: 'left' }}>
              <span style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.7rem', color: 'rgba(250,248,240,0.35)', letterSpacing: '0.15em' }}>{lbl}</span>
            </div>
          ))}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ background: 'rgba(204,158,36,0.15)', border: '1px solid rgba(204,158,36,0.3)', padding: '0.7rem 2rem', display: 'inline-block', color: GOLD, fontFamily: SANS, fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Send RSVP
            </div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', opacity: 0.4 }}>
          <p style={{ ...BODY_STYLE, fontSize: '0.72rem', marginBottom: '0.5rem' }}>Or contact us directly</p>
          <ET config={config} path="events.rsvp.email" tag="span" style={{ fontFamily: SANS, fontWeight: 300, fontSize: '0.78rem', color: GOLD }} onChange={onChange} />
          <span style={{ color: 'rgba(250,248,240,0.3)', margin: '0 0.75rem' }}>·</span>
          <ET config={config} path="events.rsvp.phone1" tag="span" style={{ fontFamily: SANS, fontWeight: 300, fontSize: '0.78rem', color: GOLD }} onChange={onChange} />
          <span style={{ color: 'rgba(250,248,240,0.3)', margin: '0 0.75rem' }}>·</span>
          <ET config={config} path="events.rsvp.phone2" tag="span" style={{ fontFamily: SANS, fontWeight: 300, fontSize: '0.78rem', color: GOLD }} onChange={onChange} />
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <ET config={config} path="ui.rsvp.successMessage" tag="p"
            style={{ ...BODY_STYLE, fontStyle: 'italic', fontSize: '0.8rem', maxWidth: 350, margin: '0 auto' }} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

/* ── Liste de Mariage ── */
function WishListPreview({ config, onChange }) {
  return (
    <section className="le-section" style={{ background: '#2e4a20' }}>
      <SectionLabel label="Wish List Section" />
      <div style={{ padding: '4rem 2rem', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <ET config={config} path="ui.listeDeMariage.tag" tag="p" style={TAG_STYLE} onChange={onChange} />
        <ET config={config} path="ui.listeDeMariage.title" tag="h2" style={{ ...TITLE_STYLE, margin: '0.75rem 0' }} onChange={onChange} />
        {DIVIDER}
        <ET config={config} path="ui.listeDeMariage.message" tag="p"
          style={{ ...BODY_STYLE, marginTop: '2rem', maxWidth: 480, margin: '2rem auto' }} onChange={onChange} />
        <div style={{ background: 'rgba(26,46,20,0.5)', border: '1px solid rgba(204,158,36,0.15)', borderRadius: 10, padding: '1.5rem', marginTop: '1.5rem', display: 'inline-block' }}>
          <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.6rem', letterSpacing: '0.35em', color: 'rgba(250,248,240,0.35)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <ET config={config} path="ui.listeDeMariage.accountLabel" tag="span" style={{ font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }} onChange={onChange} />
          </p>
          <ET config={config} path="ui.listeDeMariage.accountName" tag="p"
            style={{ fontFamily: SERIF, fontSize: '1.2rem', color: GOLD }} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function FooterPreview({ config, onChange }) {
  return (
    <section className="le-section" style={{ background: '#243a1c', textAlign: 'center' }}>
      <SectionLabel label="Footer Section" />
      <div style={{ padding: '4rem 2rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to right,transparent,rgba(204,158,36,0.4))' }} />
          <span style={{ color: GOLD, fontSize: '0.7rem', opacity: 0.7 }}>✦</span>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to left,transparent,rgba(204,158,36,0.4))' }} />
        </div>
        <ET config={config} path="ui.footer.quote" tag="blockquote"
          style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: '1.3rem', color: 'rgba(250,248,240,0.6)', lineHeight: 1.8, margin: '0 0 2rem' }} onChange={onChange} />
        <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '1.6rem', color: CREAM }}>
          {deepGet(config, 'couple.bride.firstName')} <span style={{ color: GOLD, fontStyle: 'italic' }}>&</span> {deepGet(config, 'couple.groom.firstName')}
        </p>
        <p style={{ fontFamily: SANS, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.3em', color: 'rgba(250,248,240,0.35)', marginTop: '0.5rem' }}>
          {deepGet(config, 'wedding.dateFormatted')}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Main LiveEditor Component
   ═══════════════════════════════════════ */
export default function LiveEditor() {
  const [config, setConfig] = useState(null);
  const [savedConfig, setSavedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [photoTick, setPhotoTick] = useState(0);
  const [deletedIds, setDeletedIds] = useState(new Set());

  const driveRoot = config?.google_drive?.root_folder_id;
  const { images: perlaImgs }   = useDriveImages(driveRoot, 'perla',   photoTick);
  const { images: antonioImgs } = useDriveImages(driveRoot, 'antonio', photoTick);
  const { images: memoryImgs }  = useDriveImages(driveRoot, 'memories', photoTick);

  const photos = {
    perla:    perlaImgs[0]  || null,
    antonio:  antonioImgs[0] || null,
    memories: memoryImgs.filter(f => !deletedIds.has(f.id)),
  };

  const [imagePositions, setImagePositions] = useState({});
  const [savedPositions, setSavedPositions] = useState({});

  const positionsDirty = JSON.stringify(imagePositions) !== JSON.stringify(savedPositions);
  const dirty = positionsDirty || (config && savedConfig && JSON.stringify(config) !== JSON.stringify(savedConfig));

  const handlePositionChange = useCallback((key, value) => {
    setImagePositions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load config */
  useEffect(() => {
    api.getConfig()
      .then((c) => {
        setConfig(c);
        setSavedConfig(c);
        const pos = c.imagePositions || {};
        setImagePositions(pos);
        setSavedPositions(pos);
      })
      .catch(() => showToast('error', 'Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const refreshPhotos = useCallback(() => setPhotoTick((t) => t + 1), []);

  const handleChange = useCallback((path, value) => {
    setConfig((prev) => deepSet(prev, path, value));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = { ...config, imagePositions };
      await api.saveConfig(toSave);
      setConfig(toSave);
      setSavedConfig(structuredClone(toSave));
      setSavedPositions(structuredClone(imagePositions));
      showToast('success', 'Changes saved! The live invitation is updated.');
    } catch {
      showToast('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'rgba(250,248,240,0.4)', padding: '2rem' }}>Loading preview…</p>;

  return (
    <div className="le-root">
      {/* Top toolbar */}
      <div className="le-toolbar">
        <div>
          <h1 className="cms-page-title" style={{ margin: 0, fontSize: '1.3rem' }}>Live Preview Editor</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dirty && <span style={{ fontSize: '0.7rem', color: '#f9cc01', opacity: 0.8 }}>● Unsaved changes</span>}
          <button className="cms-btn cms-btn-primary" disabled={saving || !dirty} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {toast && <div className={`cms-toast cms-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Preview container */}
      <div className="le-preview">
        <HeroPreview config={config} onChange={handleChange} />
        <CouplePreview config={config} photos={photos} onChange={handleChange} onPhotosRefresh={refreshPhotos} imagePositions={imagePositions} onPositionChange={handlePositionChange} />
        <EventsPreview config={config} onChange={handleChange} />
        <TimelinePreview config={config} onChange={handleChange} />
        <GalleryPreview config={config} photos={photos} onPhotosRefresh={refreshPhotos} imagePositions={imagePositions} onPositionChange={handlePositionChange} onChange={handleChange}
          onDeletedId={(id) => setDeletedIds(prev => new Set(prev).add(id))} onToast={showToast} />
        <RsvpPreview config={config} onChange={handleChange} />
        <WishListPreview config={config} onChange={handleChange} />
        <FooterPreview config={config} onChange={handleChange} />
      </div>
    </div>
  );
}
