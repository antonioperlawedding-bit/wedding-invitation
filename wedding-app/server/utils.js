import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.resolve(__dirname, 'data');
const ENV = process.env.ENV || 'development';
export const RSVP_FILE = path.join(DATA_DIR, `rsvps-${ENV}.json`);
export const SYNC_META_FILE = path.join(DATA_DIR, 'sync-meta.json');
export const CONFIG_FILE = path.resolve(__dirname, '../configs.json');

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RSVP_FILE)) fs.writeFileSync(RSVP_FILE, '[]', 'utf-8');
  if (!fs.existsSync(SYNC_META_FILE)) fs.writeFileSync(SYNC_META_FILE, '{}', 'utf-8');
  console.log(`[data] Local RSVP file: ${RSVP_FILE}`);
}

export function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
