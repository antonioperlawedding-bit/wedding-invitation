import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { syncToDrive, pullFromDrive } from '../drive-sync.js';
import { SYNC_META_FILE, readJSON } from '../utils.js';

const router = Router();

/* GET /api/sync — get sync status (auth required) */
router.get('/', requireAuth, (_req, res) => {
  try {
    const meta = readJSON(SYNC_META_FILE);
    res.json(meta);
  } catch {
    res.json({});
  }
});

/* POST /api/sync/push — upload to Drive (auth required) */
router.post('/push', requireAuth, async (_req, res) => {
  try {
    const meta = await syncToDrive();
    res.json({ ok: true, meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/sync/pull — download from Drive (auth required) */
router.post('/pull', requireAuth, async (req, res) => {
  try {
    const { file } = req.body; // 'configs.json' or 'rsvps.json'
    if (!file || !['configs.json', 'rsvps.json'].includes(file)) {
      return res.status(400).json({ error: 'Specify file: configs.json or rsvps.json' });
    }
    await pullFromDrive(file);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
