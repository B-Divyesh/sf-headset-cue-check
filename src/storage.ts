import type { CheckSession } from './model';

const DB_NAME = 'headset-cue-check';
const DB_VERSION = 1;
const STORE = 'sessions';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local database could not be opened.'));
  });
}

export async function saveSession(session: CheckSession): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(session);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Session could not be saved.')); };
  });
}

export async function allSessions(): Promise<CheckSession[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => { db.close(); resolve((request.result as CheckSession[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); };
    request.onerror = () => { db.close(); reject(request.error ?? new Error('Saved checks could not be read.')); };
  });
}

export async function removeSession(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Saved check could not be removed.')); };
  });
}

export async function mergeSessions(imported: CheckSession[]): Promise<number> {
  const existing = new Map((await allSessions()).map(item => [item.id, item]));
  let changed = 0;
  for (const item of imported) {
    const old = existing.get(item.id);
    if (!old || item.updatedAt > old.updatedAt) { await saveSession(item); changed += 1; }
  }
  return changed;
}
