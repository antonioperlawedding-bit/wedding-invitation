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

  getRsvps: () => request('/rsvp'),
  deleteRsvp: (id) => request(`/rsvp/${id}`, { method: 'DELETE' }),
};
