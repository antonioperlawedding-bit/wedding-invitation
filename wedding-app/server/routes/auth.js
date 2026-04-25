import { Router } from 'express';
import { signToken } from '../middleware/auth.js';

const router = Router();

/* POST /api/auth/login — verify CMS password and issue JWT */
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required.' });

  const expected = process.env.CMS_PASSWORD;
  if (!expected) {
    console.error('[CMS] CMS_PASSWORD is not set in .env');
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  if (password !== expected) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = signToken();
  return res.json({ ok: true, token });
});

export default router;
