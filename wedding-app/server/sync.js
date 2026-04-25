import { Readable } from 'stream';
import { getDrive } from './google.js';
import { RSVP_FILE, SYNC_META_FILE, readJSON, writeJSON } from './utils.js';

const ENV = process.env.ENV || 'development';
export const DRIVE_FILENAME = `rsvps-${ENV}.json`;
const FOLDER_ID = process.env.CMS_DRIVE_FOLDER_ID;

function getMeta() {
  try { return readJSON(SYNC_META_FILE); } catch { return {}; }
}

/**
 * Union-merge two RSVP arrays by `id`.
 * Local version wins on conflict (so edits/deletes from the server take precedence).
 * Result is sorted by submittedAt ascending.
 */
function unionRsvps(local, remote) {
  const map = new Map();
  for (const r of remote) map.set(r.id, r);
  for (const r of local)  map.set(r.id, r); // local overwrites remote on same id
  return [...map.values()].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
  );
}

/**
 * Sync local rsvps.json ↔ Drive file (rsvps-{ENV}.json).
 *
 * Steps:
 *  1. Download Drive file (if it exists)
 *  2. Union-merge with local
 *  3. Write merged result back to local file
 *  4. Upload merged result to Drive (create or update)
 *
 * Safe to call fire-and-forget after every RSVP write.
 */
export async function syncRsvps() {
  const drive = getDrive();
  if (!drive || !FOLDER_ID) {
    console.warn('[sync] Drive not configured — skipping sync.');
    return;
  }

  try {
    const meta = getMeta();
    let fileId = meta[DRIVE_FILENAME];

    const local = readJSON(RSVP_FILE);
    let remote = [];

    if (fileId) {
      try {
        const res = await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'text' }
        );
        const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        remote = JSON.parse(raw);
        if (!Array.isArray(remote)) remote = [];
      } catch (err) {
        const status = err?.response?.status || err?.code;
        if (status === 404) {
          // File deleted from Drive — will be recreated below
          fileId = null;
          delete meta[DRIVE_FILENAME];
        } else {
          throw err;
        }
      }
    }

    const merged = unionRsvps(local, remote);

    // 3. Persist merged result locally
    writeJSON(RSVP_FILE, merged);

    // 4. Upload to Drive
    const content = JSON.stringify(merged, null, 2);
    const media = {
      mimeType: 'application/json',
      body: Readable.from([content]),
    };

    if (fileId) {
      await drive.files.update({ fileId, media });
    } else {
      const created = await drive.files.create({
        requestBody: {
          name: DRIVE_FILENAME,
          parents: [FOLDER_ID],
        },
        media,
        fields: 'id',
      });
      meta[DRIVE_FILENAME] = created.data.id;
      writeJSON(SYNC_META_FILE, meta);
    }

    console.log(`[sync] ✓ ${merged.length} RSVPs synced to Drive as "${DRIVE_FILENAME}"`);
  } catch (err) {
    console.error('[sync] Drive sync failed:', err.message);
  }
}
