import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

/* ---------- helpers ---------- */
const SECTION_LABELS = {
  wedding: 'Wedding Details',
  couple: 'Couple Information',
  honor: 'Honor Party',
  events: 'Events & Content',
  ui: 'UI Labels & Copy',
  navigation: 'Navigation Links',
  google_drive: 'Google Drive',
};

function InputField({ label, value, onChange, multiline }) {
  return (
    <div className="cms-field">
      <label className="cms-field-label">{label}</label>
      {multiline ? (
        <textarea className="cms-field-input" rows={4} value={value ?? ''} onChange={onChange} />
      ) : (
        <input className="cms-field-input" type="text" value={value ?? ''} onChange={onChange} />
      )}
    </div>
  );
}

function isLongText(v) {
  return typeof v === 'string' && v.length > 120;
}

/* Recursively render editable fields for an object tree */
function ObjectEditor({ data, path, onChange }) {
  if (data === null || data === undefined) return null;

  if (Array.isArray(data)) {
    return (
      <div className="cms-array-group">
        {data.map((item, i) => (
          <div key={i} className="cms-array-item">
            <span className="cms-array-index">#{i + 1}</span>
            {typeof item === 'object' ? (
              <ObjectEditor data={item} path={[...path, i]} onChange={onChange} />
            ) : (
              <InputField
                label={`Item ${i + 1}`}
                value={item}
                onChange={(e) => onChange([...path, i], e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className="cms-object-group">
        {Object.entries(data).map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            return (
              <details key={key} className="cms-nested-section" open>
                <summary className="cms-nested-title">{key}</summary>
                <ObjectEditor data={val} path={[...path, key]} onChange={onChange} />
              </details>
            );
          }
          if (typeof val === 'boolean') {
            return (
              <div className="cms-field" key={key}>
                <label className="cms-field-label" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => onChange([...path, key], e.target.checked)}
                  />
                  {key}
                </label>
              </div>
            );
          }
          return (
            <InputField
              key={key}
              label={key}
              value={val}
              multiline={isLongText(val)}
              onChange={(e) => onChange([...path, key], e.target.value)}
            />
          );
        })}
      </div>
    );
  }

  return null;
}

/* ---------- main component ---------- */
export default function ContentEditor() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.getConfig()
      .then(setConfig)
      .catch(() => setToast({ type: 'error', msg: 'Failed to load config' }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* Deep-set a value at a path like ["couple","bride","firstName"] */
  const handleChange = useCallback((path, value) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      let cursor = next;
      for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
      cursor[path[path.length - 1]] = value;
      return next;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveConfig(config);
      showToast('success', 'Configuration saved!');
    } catch {
      showToast('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'rgba(250,248,240,0.4)' }}>Loading…</p>;

  const sections = Object.keys(config || {});

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="cms-page-title">Content Editor</h1>
          <p className="cms-page-subtitle">Edit your wedding invitation content</p>
        </div>
        <button className="cms-btn cms-btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {toast && <div className={`cms-toast cms-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="cms-sections">
        {sections.map((key) => (
          <details key={key} className="cms-section-card" open>
            <summary className="cms-section-header">
              <span>{SECTION_LABELS[key] || key}</span>
            </summary>
            <div className="cms-section-body">
              <ObjectEditor data={config[key]} path={[key]} onChange={handleChange} />
            </div>
          </details>
        ))}
      </div>

      {/* Floating save button */}
      <div className="cms-fab">
        <button className="cms-btn cms-btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : '💾 Save'}
        </button>
      </div>
    </>
  );
}
