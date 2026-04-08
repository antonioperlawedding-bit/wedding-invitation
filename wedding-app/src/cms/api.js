const API = '/api';

function authHeaders() {
  const token = localStorage.getItem('cms_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts.headers },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  sendOtp: () => request('/auth/send-otp', { method: 'POST' }),
  verifyOtp: (code) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ code }) }),

  getConfig: () => request('/config'),
  saveConfig: (config) => request('/config', { method: 'PUT', body: JSON.stringify(config) }),

  getRsvps: () => request('/rsvp'),
  deleteRsvp: (id) => request(`/rsvp/${id}`, { method: 'DELETE' }),

  getSyncStatus: () => request('/sync'),
  pushSync: () => request('/sync/push', { method: 'POST' }),
  pullSync: (file) => request('/sync/pull', { method: 'POST', body: JSON.stringify({ file }) }),

  // Photos (Google Drive subfolders)
  listPhotos: (folder) => request(`/photos/${folder}`),
  uploadPhoto: (folder, fileName, mimeType, base64Data) =>
    request(`/photos/${folder}`, { method: 'POST', body: JSON.stringify({ fileName, mimeType, data: base64Data }) }),
  renamePhoto: (folder, fileId, fileName) =>
    request(`/photos/${folder}/${fileId}`, { method: 'PATCH', body: JSON.stringify({ fileName }) }),
  deletePhoto: (folder, fileId) =>
    request(`/photos/${folder}/${fileId}`, { method: 'DELETE' }),
};
