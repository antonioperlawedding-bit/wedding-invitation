import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';
import baseConfig from '../../configs.json' with { type: 'json' };

const ENV = process.env.ENV || 'production';
const RSVP_KEY = `rsvps-${ENV}.json`;
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-cms-fallback-secret-change-me';

export const config = {
  path: '/api/*',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getRsvpStore() {
  return getStore({ name: 'wedding-rsvps', consistency: 'strong' });
}

async function readRsvps() {
  const raw = await getRsvpStore().get(RSVP_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

async function writeRsvps(rsvps) {
  await getRsvpStore().set(RSVP_KEY, JSON.stringify(rsvps, null, 2));
}

function signToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

function requireAuth(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return false;

  try {
    jwt.verify(header.slice(7), JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function normalizeRsvp(input, existing = {}) {
  const attendance = String(input.attendance || input.Attendance || 'Joyfully Accepts').slice(0, 100);
  const isDecline = /declin|أعتذر/i.test(attendance);

  return {
    ...existing,
    id: existing.id || crypto.randomUUID(),
    name: String(input.name || input.Name || '').slice(0, 200).trim(),
    phone: String(input.phone || input.Phone || '').slice(0, 50).trim(),
    email: String(input.email || input.Email || '').slice(0, 200).trim(),
    attendance,
    status: isDecline ? 'declined' : 'accepted',
    guests: Math.min(Math.max(parseInt(input.guests ?? input.Guests ?? 1, 10) || 1, 1), 20),
    song: input.song || input.Song ? String(input.song || input.Song).slice(0, 200) : '',
    submittedAt: existing.submittedAt || input.submittedAt || new Date().toISOString(),
  };
}

function downloadResponse(body, filename, contentType) {
  return new Response(body, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': contentType,
    },
  });
}

async function handleAuth(request, parts) {
  if (request.method !== 'POST' || parts[0] !== 'login') {
    return json({ error: 'Not found.' }, 404);
  }

  const { password } = await parseJson(request);
  if (!password) return json({ error: 'Password is required.' }, 400);

  const expected = process.env.CMS_PASSWORD;
  if (!expected) {
    console.error('[CMS] CMS_PASSWORD is not set in Netlify environment variables');
    return json({ error: 'Server misconfiguration.' }, 500);
  }

  if (password !== expected) {
    return json({ error: 'Incorrect password.' }, 401);
  }

  return json({ ok: true, token: signToken() });
}

async function handleConfig(request) {
  if (request.method === 'GET') return json(baseConfig);
  if (request.method !== 'PUT') return json({ error: 'Not found.' }, 404);
  if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);

  // Runtime config editing is intentionally not persisted on Netlify.
  return json({ error: 'Config editing is not available on the Netlify deployment.' }, 501);
}

async function handleRsvp(request, parts, url) {
  const id = parts[0];

  if (request.method === 'GET' && !id) {
    if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);
    return json(await readRsvps());
  }

  if (request.method === 'POST' && !id) {
    const input = await parseJson(request);
    if (!input.name || !input.attendance) {
      return json({ error: 'Name and attendance are required.' }, 400);
    }

    const rsvps = await readRsvps();
    const entry = normalizeRsvp(input);
    rsvps.push(entry);
    await writeRsvps(rsvps);
    return json({ ok: true, id: entry.id });
  }

  if (request.method === 'PUT' && id) {
    if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);
    const input = await parseJson(request);
    if (!input.name || !input.attendance) {
      return json({ error: 'Name and attendance are required.' }, 400);
    }

    const rsvps = await readRsvps();
    const idx = rsvps.findIndex((r) => r.id === id);
    if (idx === -1) return json({ error: 'RSVP not found.' }, 404);

    rsvps[idx] = normalizeRsvp(input, rsvps[idx]);
    await writeRsvps(rsvps);
    return json({ ok: true });
  }

  if (request.method === 'DELETE' && id) {
    if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);
    const rsvps = await readRsvps();
    const filtered = rsvps.filter((r) => r.id !== id);
    if (filtered.length === rsvps.length) return json({ error: 'RSVP not found.' }, 404);

    await writeRsvps(filtered);
    return json({ ok: true });
  }

  if (request.method === 'GET' && id === 'export') {
    if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);
    const format = url.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'json';
    const rsvps = await readRsvps();

    if (format === 'json') {
      return downloadResponse(JSON.stringify(rsvps, null, 2), 'rsvps.json', 'application/json');
    }

    const rows = rsvps.map((r) => ({
      Name: r.name || '',
      Phone: r.phone || '',
      Email: r.email || '',
      Attendance: r.attendance || '',
      Status: r.status || '',
      Guests: r.guests ?? '',
      Song: r.song || '',
      'Submitted At': r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'RSVPs');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return downloadResponse(buffer, 'rsvps.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  if (request.method === 'POST' && id === 'import') {
    if (!requireAuth(request)) return json({ error: 'Unauthorized' }, 401);
    const { records } = await parseJson(request);
    if (!Array.isArray(records) || records.length === 0) {
      return json({ error: 'No records provided.' }, 400);
    }

    const existing = await readRsvps();
    const normPhone = (phone) => String(phone || '').replace(/[\s\-().+]/g, '').toLowerCase();
    const existingPhoneMap = new Map();

    for (const rsvp of existing) {
      const phone = normPhone(rsvp.phone);
      if (!phone) continue;
      if (!existingPhoneMap.has(phone)) existingPhoneMap.set(phone, []);
      existingPhoneMap.get(phone).push(rsvp.id);
    }

    const added = [];
    const flagged = [];
    for (const raw of records) {
      const entry = normalizeRsvp(raw);
      if (!entry.name) continue;

      const phone = normPhone(entry.phone);
      if (phone && existingPhoneMap.has(phone)) {
        entry.dupPhone = true;
        flagged.push({ record: entry, reason: `Phone "${entry.phone}" already exists in current data` });
      }

      added.push(entry);
      if (phone) {
        if (!existingPhoneMap.has(phone)) existingPhoneMap.set(phone, []);
        existingPhoneMap.get(phone).push(entry.id);
      }
    }

    await writeRsvps([...existing, ...added]);
    return json({ ok: true, added: added.length, flagged });
  }

  return json({ error: 'Not found.' }, 404);
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const apiPath = url.pathname
      .replace(/^\/api\/?/, '')
      .replace(/^\/\.netlify\/functions\/api\/?/, '');
    const parts = apiPath.split('/').filter(Boolean);
    const resource = parts[0];

    if (resource === 'auth') return await handleAuth(request, parts.slice(1));
    if (resource === 'config') return await handleConfig(request);
    if (resource === 'rsvp') return await handleRsvp(request, parts.slice(1), url);

    return json({ error: 'Not found.' }, 404);
  } catch (err) {
    console.error('[api] Unhandled error:', err);
    return json({ error: 'Server error.' }, 500);
  }
}
