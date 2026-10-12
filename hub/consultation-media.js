/* p8Work Consultation Manager media backup bridge.
 * Browser IndexedDB stores MAR image payloads; localStorage stores only keys.
 * The hub must include these images in encrypted Master Backups and restore them
 * before updating the client metadata. Other p8Work tools are unaffected.
 */
(function (global) {
  'use strict';
  const DB_NAME = 'p8work-consultation-media-v1';
  const STORE_NAME = 'medicationImages';
  const STATE_KEY = 'consultation-form-manager-state';
  let dbPromise = null;

  function openDb() {
    if (!global.indexedDB) return Promise.reject(new Error('Medication-image database is unavailable.'));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Medication-image database could not be opened.'));
      request.onblocked = () => reject(new Error('Close any other p8Work tabs and try again.'));
    }).catch(error => { dbPromise = null; throw error; });
    return dbPromise;
  }

  function walkMedications(root, visit) {
    const seen = new WeakSet();
    function walk(value) {
      if (!value || typeof value !== 'object' || seen.has(value)) return;
      seen.add(value);
      if (Array.isArray(value.medications)) for (const med of value.medications) {
        if (med && typeof med === 'object' && med.kind === 'image') visit(med);
      }
      if (Array.isArray(value)) value.forEach(walk);
      else for (const [key, child] of Object.entries(value)) {
        if (key !== 'imageData' && key !== 'sourceImage') walk(child);
      }
    }
    walk(root);
  }

  async function getImage(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : '');
      request.onerror = () => reject(request.error || new Error('Could not read a medication image.'));
    });
  }

  async function putAll(items) {
    if (!items.length) return;
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const { key, data } of items) store.put(data, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Could not restore medication images.'));
      tx.onabort = () => reject(tx.error || new Error('Medication-image restore was interrupted.'));
    });
  }

  function extract(entries) {
    const raw = entries && entries[STATE_KEY];
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && parsed.__p8riotStorage && parsed.value ? { wrapper: parsed, state: parsed.value } : { state: parsed };
    } catch (error) {
      throw new Error('Consultation Manager saved data is not valid JSON.');
    }
  }

  // Makes every MAR capture portable in the verified Master Backup.
  async function exportEntries(entries) {
    const parsed = extract(entries);
    if (!parsed) return entries;
    const requests = [];
    walkMedications(parsed.state, med => {
      if (!med.imageData && med.mediaKey) requests.push(med);
      else if (!med.imageData && !med.mediaKey) throw new Error('A MAR image has no saved image data. Backup stopped to prevent an incomplete backup.');
    });
    for (const med of requests) {
      med.imageData = await getImage(med.mediaKey);
      if (!med.imageData) throw new Error('A MAR image was missing from browser storage. Master Backup was stopped to avoid losing medication records.');
    }
    return { ...entries, [STATE_KEY]: JSON.stringify(parsed.wrapper || parsed.state) };
  }

  // All restored image values get new immutable keys, protecting saved undo
  // snapshots and existing records from accidental overwrite.
  async function prepareEntries(entries) {
    const parsed = extract(entries);
    if (!parsed) return entries;
    const items = [];
    const keys = new Map();
    walkMedications(parsed.state, med => {
      if (!med.imageData) {
        if (med.mediaKey) throw new Error('This backup contains only MAR-image references, not the image data. Restore was stopped.');
        return;
      }
      if (!/^data:image\/(png|jpeg|webp);base64,/.test(med.imageData)) throw new Error('The backup contains a damaged MAR image. Restore was stopped.');
      const identity = med.mediaKey || med.id || String(items.length);
      let key = keys.get(identity);
      if (!key) {
        key = `mar-image-restore-${global.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
        keys.set(identity, key);
        items.push({ key, data: med.imageData });
      }
      med.mediaKey = key;
      delete med.imageData;
    });
    await putAll(items);
    return { ...entries, [STATE_KEY]: JSON.stringify(parsed.wrapper || parsed.state) };
  }

  global.P8WORK_MAR_MEDIA = Object.freeze({ exportEntries, prepareEntries });
}(window));
