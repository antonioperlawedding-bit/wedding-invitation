import { Router } from 'express';
import { Readable } from 'stream';
import { requireAuth } from '../middleware/auth.js';
import { getDrive } from '../google.js';
import { CONFIG_FILE, readJSON } from '../utils.js';

const router = Router();

function getRootFolder() {
  try {
    const config = readJSON(CONFIG_FILE);
    return config.google_drive?.root_folder_id;
  } catch { return null; }
}

/* ── helpers ── */

async function findOrCreateFolder(drive, parentId, name) {
  const q = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const list = await drive.files.list({ q, fields: 'files(id)', spaces: 'drive' });
  if (list.data.files.length) return list.data.files[0].id;
  const res = await drive.files.create({
    requestBody: { name, parents: [parentId], mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id',
  });
  return res.data.id;
}

async function listImages(drive, folderId) {
  const q = `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`;
  const res = await drive.files.list({
    q,
    fields: 'files(id,name,mimeType,size,createdTime)',
    orderBy: 'name',
    pageSize: 100,
  });
  return res.data.files || [];
}

/* ── GET /api/photos/:folder — list images in a subfolder ── */
router.get('/:folder', requireAuth, async (req, res) => {
  const folder = req.params.folder;
  if (!['perla', 'antonio', 'memories'].includes(folder)) {
    return res.status(400).json({ error: 'Folder must be perla, antonio, or memories' });
  }
  try {
    const drive = getDrive();
    if (!drive) return res.status(500).json({ error: 'Google Drive not configured' });
    const rootId = getRootFolder();
    if (!rootId) return res.status(500).json({ error: 'Drive root folder not configured in configs.json' });
    const folderId = await findOrCreateFolder(drive, rootId, folder);
    const files = await listImages(drive, folderId);
    res.json({ folderId, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/photos/:folder — upload an image (multipart/form-data via base64 JSON) ── */
router.post('/:folder', requireAuth, async (req, res) => {
  const folder = req.params.folder;
  if (!['perla', 'antonio', 'memories'].includes(folder)) {
    return res.status(400).json({ error: 'Folder must be perla, antonio, or memories' });
  }
  const { fileName, mimeType, data } = req.body; // data is base64 encoded
  if (!fileName || !data) return res.status(400).json({ error: 'fileName and data (base64) required' });

  try {
    const drive = getDrive();
    if (!drive) return res.status(500).json({ error: 'Google Drive not configured' });
    const rootId = getRootFolder();
    if (!rootId) return res.status(500).json({ error: 'Drive root folder not configured in configs.json' });
    const folderId = await findOrCreateFolder(drive, rootId, folder);

    // For person folders (perla/antonio), keep only one photo —
    // delete all existing images before uploading the new one.
    if (['perla', 'antonio'].includes(folder)) {
      const existing = await listImages(drive, folderId);
      for (const file of existing) {
        try { await drive.files.delete({ fileId: file.id }); } catch {
          try { await drive.files.update({ fileId: file.id, requestBody: { trashed: true } }); } catch {}
        }
      }
    }

    const buffer = Buffer.from(data, 'base64');
    const result = await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: mimeType || 'image/jpeg', body: Readable.from(buffer) },
      fields: 'id,name',
    });

    // Make publicly readable so the invitation can display it
    await drive.permissions.create({
      fileId: result.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    res.json({ ok: true, file: result.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/photos/:folder/:fileId — rename a file ── */
router.patch('/:folder/:fileId', requireAuth, async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: 'fileName required' });

  try {
    const drive = getDrive();
    if (!drive) return res.status(500).json({ error: 'Google Drive not configured' });
    await drive.files.update({ fileId: req.params.fileId, requestBody: { name: fileName } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/photos/:folder/:fileId — permanently delete a file ── */
router.delete('/:folder/:fileId', requireAuth, async (req, res) => {
  try {
    const drive = getDrive();
    if (!drive) return res.status(500).json({ error: 'Google Drive not configured' });
    await drive.files.delete({ fileId: req.params.fileId });
    res.json({ ok: true });
  } catch (err) {
    // If permanent delete fails (no ownership), try trashing instead
    try {
      const drive = getDrive();
      await drive.files.update({ fileId: req.params.fileId, requestBody: { trashed: true } });
      res.json({ ok: true });
    } catch (err2) {
      res.status(500).json({ error: err2.message });
    }
  }
});

export default router;
