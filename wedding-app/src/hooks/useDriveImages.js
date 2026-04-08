import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const BASE = 'https://www.googleapis.com/drive/v3/files';

// Module-level cache so parallel calls to the same folder don't duplicate requests
const _cache = new Map();
const _inflight = new Map();

async function driveGet(url) {
  if (_cache.has(url)) return _cache.get(url);
  if (_inflight.has(url)) return _inflight.get(url);

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Drive API error ${res.status}`);
      return res.json();
    })
    .then(json => {
      _cache.set(url, json);
      _inflight.delete(url);
      return json;
    })
    .catch(err => {
      _inflight.delete(url);
      throw err;
    });

  _inflight.set(url, promise);
  return promise;
}

async function findSubfolderId(parentId, name) {
  const q = encodeURIComponent(
    `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const data = await driveGet(`${BASE}?q=${q}&fields=files(id)&key=${API_KEY}`);
  return data.files?.[0]?.id ?? null;
}

async function listImagesInFolder(folderId) {
  const q = encodeURIComponent(
    `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`
  );
  const data = await driveGet(
    `${BASE}?q=${q}&fields=files(id,name)&orderBy=name&key=${API_KEY}`
  );
  return data.files ?? [];
}

/**
 * Returns a Google-served thumbnail URL for a publicly shared Drive file.
 * sz examples: 'w800', 'w1200', 'w1600', 'w2000'
 */
export function driveThumbUrl(fileId, sz = 'w1600') {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
}

/**
 * Fetches all images from a named subfolder inside the given root Google Drive folder.
 *
 * Returns { images: [{id, name}, ...], loading, error }
 *
 * Requires VITE_GOOGLE_DRIVE_API_KEY to be set; silently returns empty array when not set.
 */
export function useDriveImages(rootFolderId, subfolderName, tick = 0) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(!!(rootFolderId && subfolderName && API_KEY));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rootFolderId || !subfolderName || !API_KEY) {
      setLoading(false);
      return;
    }

    // When tick changes, clear entire cache so both folder-lookup and
    // file-listing entries are invalidated (listing URLs use folder IDs,
    // not names, so name-based matching misses them).
    if (tick > 0) {
      _cache.clear();
    }

    let alive = true;

    async function load() {
      try {
        const folderId = await findSubfolderId(rootFolderId, subfolderName);
        if (!folderId) throw new Error(`Subfolder "${subfolderName}" not found in Drive`);
        const files = await listImagesInFolder(folderId);
        if (alive) setImages(files);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [rootFolderId, subfolderName, tick]);

  return { images, loading, error };
}
