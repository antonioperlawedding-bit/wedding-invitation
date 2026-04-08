import fs from 'fs';
import { Readable } from 'stream';
import { getDrive } from './google.js';
import { CONFIG_FILE, RSVP_FILE, SYNC_META_FILE, readJSON, writeJSON } from './utils.js';

const DRIVE_FOLDER_ID = process.env.CMS_DRIVE_FOLDER_ID || '1Ug_ZKIc3Yg12T-79vrLNIjFc-Qob2Rt_';

/**
 * Upload or update a file in the Drive folder.
 * Returns the Drive file ID.
 */
async function upsertFile(drive, localPath, fileName, meta) {
  const existingId = meta[fileName];
  const media = { mimeType: 'application/json', body: Readable.from(fs.readFileSync(localPath, 'utf-8')) };

  if (existingId) {
    try {
      await drive.files.update({ fileId: existingId, media });
      return existingId;
    } catch {
      /* file may have been deleted from Drive — fall through to create */
    }
  }

  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [DRIVE_FOLDER_ID], mimeType: 'application/json' },
    media,
    fields: 'id',
  });
  return res.data.id;
}

/**
 * Sync configs.json and rsvps.json up to Google Drive.
 */
export async function syncToDrive() {
  const drive = getDrive();
  if (!drive) throw new Error('Google Drive not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.');

  const meta = readJSON(SYNC_META_FILE);

  meta['configs.json'] = await upsertFile(drive, CONFIG_FILE, 'configs.json', meta);
  meta['rsvps.json'] = await upsertFile(drive, RSVP_FILE, 'rsvps.json', meta);
  meta.lastSyncedAt = new Date().toISOString();

  writeJSON(SYNC_META_FILE, meta);
  return meta;
}

/**
 * Pull a file from Drive and overwrite local copy.
 */
export async function pullFromDrive(fileName) {
  const drive = getDrive();
  if (!drive) throw new Error('Google Drive not configured.');

  const meta = readJSON(SYNC_META_FILE);
  const fileId = meta[fileName];

  if (!fileId) throw new Error(`No Drive file ID for ${fileName}. Sync up first.`);

  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });

  const localPath = fileName === 'configs.json' ? CONFIG_FILE : RSVP_FILE;
  fs.writeFileSync(localPath, typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2), 'utf-8');
  return true;
}
