import { Router } from 'express';
import crypto from 'crypto';
import * as XLSX from 'xlsx';
import { requireAuth } from '../middleware/auth.js';
import { RSVP_FILE, readJSON, writeJSON } from '../utils.js';

const router = Router();

/* GET /api/rsvp — auth required */
router.get('/', requireAuth, (_req, res) => {
  try {
    const rsvps = readJSON(RSVP_FILE);
    res.json(rsvps);
  } catch {
    res.json([]);
  }
});

/* POST /api/rsvp — public (wedding guests submit) */
router.post('/', (req, res) => {
  try {
    const { name, phone, email, attendance, guests } = req.body;
    if (!name || !attendance) {
      return res.status(400).json({ error: 'Name and attendance are required.' });
    }

    // Normalize status regardless of display language.
    // Decline strings in all supported languages contain a common marker:
    // EN: "Declines", AR: "أعتذر"
    const isDecline = /declin|أعتذر/i.test(String(attendance));

    const rsvps = readJSON(RSVP_FILE);
    const entry = {
      id: crypto.randomUUID(),
      name: String(name).slice(0, 200),
      phone: phone ? String(phone).slice(0, 50) : '',
      email: email ? String(email).slice(0, 200) : '',
      attendance: String(attendance).slice(0, 100),
      status: isDecline ? 'declined' : 'accepted',
      guests: Math.min(Math.max(parseInt(guests, 10) || 1, 1), 20),
      submittedAt: new Date().toISOString(),
    };
    rsvps.push(entry);
    writeJSON(RSVP_FILE, rsvps);
    res.json({ ok: true, id: entry.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save RSVP.' });
  }
});

/* PUT /api/rsvp/:id — auth required */
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { name, phone, email, attendance, guests } = req.body;
    if (!name || !attendance) {
      return res.status(400).json({ error: 'Name and attendance are required.' });
    }
    const rsvps = readJSON(RSVP_FILE);
    const idx = rsvps.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'RSVP not found.' });

    const isDecline = /declin|أعتذر/i.test(String(attendance));
    rsvps[idx] = {
      ...rsvps[idx],
      name: String(name).slice(0, 200),
      phone: phone ? String(phone).slice(0, 50) : '',
      email: email ? String(email).slice(0, 200) : '',
      attendance: String(attendance).slice(0, 100),
      status: isDecline ? 'declined' : 'accepted',
      guests: Math.min(Math.max(parseInt(guests, 10) || 1, 1), 20),
    };
    writeJSON(RSVP_FILE, rsvps);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to update RSVP.' });
  }
});

/* DELETE /api/rsvp/:id — auth required */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const rsvps = readJSON(RSVP_FILE);
    const filtered = rsvps.filter((r) => r.id !== req.params.id);
    if (filtered.length === rsvps.length) {
      return res.status(404).json({ error: 'RSVP not found.' });
    }
    writeJSON(RSVP_FILE, filtered);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete RSVP.' });
  }
});

/* GET /api/rsvp/export?format=json|xlsx — auth required */
router.get('/export', requireAuth, (req, res) => {
  const fmt = req.query.format === 'xlsx' ? 'xlsx' : 'json';
  const rsvps = (() => { try { return readJSON(RSVP_FILE); } catch { return []; } })();

  if (fmt === 'json') {
    res.setHeader('Content-Disposition', 'attachment; filename="rsvps.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(rsvps, null, 2));
  }

  // Excel export
  const rows = rsvps.map((r) => ({
    Name: r.name || '',
    Phone: r.phone || '',
    Email: r.email || '',
    Attendance: r.attendance || '',
    Status: r.status || '',
    Guests: r.guests ?? '',
    'Submitted At': r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '',
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'RSVPs');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="rsvps.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buf);
});

/* POST /api/rsvp/import — auth required, body: { records: [...] } */
router.post('/import', requireAuth, (req, res) => {
  try {
    const incoming = req.body.records;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ error: 'No records provided.' });
    }

    const existing = (() => { try { return readJSON(RSVP_FILE); } catch { return []; } })();

    // Normalise phone: strip spaces, dashes, parens for comparison
    const normPhone = (p) => String(p || '').replace(/[\s\-().+]/g, '').toLowerCase();

    // Build phone → existing ids map for duplicate detection
    const existingPhoneMap = new Map();
    for (const r of existing) {
      const n = normPhone(r.phone);
      if (n) {
        if (!existingPhoneMap.has(n)) existingPhoneMap.set(n, []);
        existingPhoneMap.get(n).push(r.id);
      }
    }

    const added = [];
    const flagged = []; // { record, reason } — informational only, all are added

    for (const raw of incoming) {
      const isDecline = /declin|أعتذر/i.test(String(raw.attendance || raw.Attendance || ''));
      const entry = {
        id: crypto.randomUUID(),
        name: String(raw.name || raw.Name || '').slice(0, 200).trim(),
        phone: String(raw.phone || raw.Phone || '').slice(0, 50).trim(),
        email: String(raw.email || raw.Email || '').slice(0, 200).trim(),
        attendance: String(raw.attendance || raw.Attendance || 'Joyfully Accepts').slice(0, 100),
        status: isDecline ? 'declined' : 'accepted',
        guests: Math.min(Math.max(parseInt(raw.guests ?? raw.Guests ?? 1, 10) || 1, 1), 20),
        submittedAt: raw.submittedAt || new Date().toISOString(),
      };

      if (!entry.name) continue; // skip blank rows

      const np = normPhone(entry.phone);
      if (np && existingPhoneMap.has(np)) {
        entry.dupPhone = true;
        flagged.push({ record: entry, reason: `Phone "${entry.phone}" already exists in current data` });
      }
      // Always add — duplicates are flagged but still imported
      added.push(entry);
      if (np) {
        if (!existingPhoneMap.has(np)) existingPhoneMap.set(np, []);
        existingPhoneMap.get(np).push(entry.id);
      }
    }

    const merged = [...existing, ...added];
    writeJSON(RSVP_FILE, merged);

    res.json({ ok: true, added: added.length, flagged });
  } catch (err) {
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

export default router;
