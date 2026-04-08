import { Router } from 'express';
import crypto from 'crypto';
import { getGmail } from '../google.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

const CMS_EMAIL = process.env.CMS_EMAIL || 'antonio.perla.wedding@gmail.com';

/* In-memory OTP store: { code, expiresAt } */
let currentOtp = null;

/* Rate-limit: minimum 60 seconds between OTP requests */
let lastOtpSentAt = 0;

/* ── Send OTP ── */
router.post('/send-otp', async (_req, res) => {
  const now = Date.now();
  if (now - lastOtpSentAt < 60_000) {
    return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new code.' });
  }

  const code = crypto.randomInt(100000, 999999).toString();
  currentOtp = { code, expiresAt: now + 5 * 60 * 1000 };
  lastOtpSentAt = now;

  const gmail = getGmail();
  if (!gmail) {
    /* Fallback: log OTP to server console when Gmail isn't configured */
    console.log(`[OTP] Code for CMS access: ${code}`);
    return res.json({ ok: true, note: 'Gmail not configured — OTP printed to server console.' });
  }

  try {
    const subject = 'Your Wedding CMS Access Code';
    const html = `
      <div style="font-family:'Jost',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#1a2e14;color:#faf8f0;border-radius:8px">
        <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;text-align:center;color:#cc9e24;font-size:1.6rem;margin:0 0 8px">Wedding CMS</h2>
        <p style="text-align:center;font-size:0.82rem;color:rgba(250,248,240,0.5);letter-spacing:0.25em;margin:0 0 32px">ONE-TIME ACCESS CODE</p>
        <div style="text-align:center;background:rgba(204,158,36,0.1);border:1px solid rgba(204,158,36,0.3);border-radius:8px;padding:24px;margin:0 0 32px">
          <span style="font-family:'Cormorant Garamond',Georgia,serif;font-size:3rem;font-weight:400;letter-spacing:0.3em;color:#f9cc01">${code}</span>
        </div>
        <p style="text-align:center;font-size:0.78rem;color:rgba(250,248,240,0.4)">This code expires in 5 minutes.<br/>If you did not request this, please ignore this email.</p>
      </div>
    `;

    const raw = [
      `From: Wedding CMS <${CMS_EMAIL}>`,
      `To: ${CMS_EMAIL}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ].join('\r\n');

    const encoded = Buffer.from(raw).toString('base64url');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Gmail send error:', err.message);
    /* Still give the OTP via console so the user isn't locked out */
    console.log(`[OTP] Code for CMS access: ${code}`);
    return res.status(500).json({ error: 'Failed to send email. Check server logs for OTP.' });
  }
});

/* ── Verify OTP ── */
router.post('/verify-otp', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required.' });
  if (!currentOtp) return res.status(400).json({ error: 'No OTP was requested. Please send one first.' });
  if (Date.now() > currentOtp.expiresAt) {
    currentOtp = null;
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }
  if (code !== currentOtp.code) {
    return res.status(400).json({ error: 'Invalid code.' });
  }

  currentOtp = null; // consume
  const token = signToken();
  return res.json({ ok: true, token });
});

export default router;
