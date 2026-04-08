import { Router } from 'express';
import crypto from 'crypto';
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
    const { name, email, attendance, guests } = req.body;
    if (!name || !attendance) {
      return res.status(400).json({ error: 'Name and attendance are required.' });
    }

    const rsvps = readJSON(RSVP_FILE);
    const entry = {
      id: crypto.randomUUID(),
      name: String(name).slice(0, 200),
      email: email ? String(email).slice(0, 200) : '',
      attendance: String(attendance).slice(0, 50),
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

export default router;
