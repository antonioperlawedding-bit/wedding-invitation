import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { CONFIG_FILE, readJSON, writeJSON } from '../utils.js';

const router = Router();

/* GET /api/config — public (frontend needs it) */
router.get('/', (_req, res) => {
  try {
    const config = readJSON(CONFIG_FILE);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config.' });
  }
});

/* PUT /api/config — auth required */
router.put('/', requireAuth, (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid config payload.' });
    }
    writeJSON(CONFIG_FILE, newConfig);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write config.' });
  }
});

export default router;
