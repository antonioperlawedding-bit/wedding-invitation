const API = '/api';

function authHeaders() {
  const token = localStorage.getItem('cms_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, opts = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts.headers },
      ...opts,
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the API server is running.');
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(res.ok ? 'Server returned an unexpected response.' : `Server error ${res.status} — API server may not be running.`);
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),

  getRsvps: () => request('/rsvp'),
  createRsvp: (data) => request('/rsvp', { method: 'POST', body: JSON.stringify(data) }),
  updateRsvp: (id, data) => request(`/rsvp/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRsvp: (id) => request(`/rsvp/${id}`, { method: 'DELETE' }),

  exportRsvps: (format) => {
    const token = localStorage.getItem('cms_token');
    const url = `/api/rsvp/export?format=${format}`;
    // Trigger browser download via anchor
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps.${format}`;
    // Fetch with auth header and create blob URL
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error('Export failed'); return r.blob(); })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      });
  },

  importRsvps: (records) => request('/rsvp/import', { method: 'POST', body: JSON.stringify({ records }) }),
};
