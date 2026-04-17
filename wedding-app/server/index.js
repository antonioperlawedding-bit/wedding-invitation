import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import rsvpRoutes from './routes/rsvp.js';
import { ensureDataDir } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 7626;
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '20mb' }));

if (!IS_PROD) {
  app.use(cors({ origin: /localhost:\d+/, credentials: true }));
}

/* ── API Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/rsvp', rsvpRoutes);

/* ── Serve built frontend in production ── */
if (IS_PROD) {
  const distDir = path.resolve(__dirname, '../dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

/* ── Start ── */
ensureDataDir();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
