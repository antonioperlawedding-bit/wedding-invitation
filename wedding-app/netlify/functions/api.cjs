const crypto = require('node:crypto');
const { connectLambda, getStore } = require('@netlify/blobs');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const baseConfig = require('../../configs.json');

const ENV = process.env.ENV || 'production';
const RSVP_KEY = `rsvps-${ENV}.json`;
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-cms-fallback-secret-change-me';

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function getRsvpStore() {
  return getStore('wedding-rsvps');
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

function requireAuth(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) return false;

  try {
    jwt.verify(header.slice(7), JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function parseJson(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
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

function downloadResponse(body, filename, contentType, isBase64Encoded = false) {
  return {
    statusCode: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': contentType,
    },
    body,
    isBase64Encoded,
  };
}

async function handleAuth(event, parts) {
  if (event.httpMethod !== 'POST' || parts[0] !== 'login') {
    return json({ error: 'Not found.' }, 404);
  }

  const { password } = parseJson(event);
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

async function handleConfig(event) {
  if (event.httpMethod === 'GET') return json(baseConfig);
  if (event.httpMethod !== 'PUT') return json({ error: 'Not found.' }, 404);
  if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);

  return json({ error: 'Config editing is not available on the Netlify deployment.' }, 501);
}

async function handleRsvp(event, parts) {
  const id = parts[0];
  const params = event.queryStringParameters || {};

  if (event.httpMethod === 'GET' && !id) {
    if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);
    return json(await readRsvps());
  }

  if (event.httpMethod === 'POST' && !id) {
    const input = parseJson(event);
    if (!input.name || !input.attendance) {
      return json({ error: 'Name and attendance are required.' }, 400);
    }

    const rsvps = await readRsvps();
    const entry = normalizeRsvp(input);
    rsvps.push(entry);
    await writeRsvps(rsvps);
    return json({ ok: true, id: entry.id });
  }

  if (event.httpMethod === 'PUT' && id) {
    if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);
    const input = parseJson(event);
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

  if (event.httpMethod === 'DELETE' && id) {
    if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);
    const rsvps = await readRsvps();
    const filtered = rsvps.filter((r) => r.id !== id);
    if (filtered.length === rsvps.length) return json({ error: 'RSVP not found.' }, 404);

    await writeRsvps(filtered);
    return json({ ok: true });
  }

  if (event.httpMethod === 'GET' && id === 'export') {
    if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);
    const format = params.format === 'xlsx' ? 'xlsx' : 'json';
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
    return downloadResponse(
      buffer.toString('base64'),
      'rsvps.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      true
    );
  }

  if (event.httpMethod === 'POST' && id === 'import') {
    if (!requireAuth(event)) return json({ error: 'Unauthorized' }, 401);
    const { records } = parseJson(event);
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

exports.handler = async (event) => {
  try {
    connectLambda(event);

    const apiPath = (event.queryStringParameters && event.queryStringParameters.path)
      || event.path.replace(/^\/api\/?/, '').replace(/^\/\.netlify\/functions\/api\/?/, '');
    const parts = apiPath.split('/').filter(Boolean);
    const resource = parts[0];

    if (resource === 'auth') return await handleAuth(event, parts.slice(1));
    if (resource === 'config') return await handleConfig(event);
    if (resource === 'rsvp') return await handleRsvp(event, parts.slice(1));

    return json({ error: 'Not found.' }, 404);
  } catch (err) {
    console.error('[api] Unhandled error:', err);
    return json({ error: 'Server error.' }, 500);
  }
};
