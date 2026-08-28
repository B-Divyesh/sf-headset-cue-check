import { isValidSession, type CheckSession } from './model';

const DB_VERSION = 1;
const STORE = 'sessions';
let dbName = 'headset-cue-check';

export type SessionLoad = { sessions: CheckSession[]; discarded: number };

export function useDemoStorage(enabled: boolean): void {
  dbName = enabled ? 'headset-cue-check-demo' : 'headset-cue-check';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);
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

export async function allSessions(): Promise<SessionLoad> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const sessions: CheckSession[] = [];
    let discarded = 0;
    const tx = db.transaction(STORE, 'readwrite');
    const request = tx.objectStore(STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (isValidSession(cursor.value)) sessions.push(cursor.value);
      else { discarded += 1; cursor.delete(); }
      cursor.continue();
    };
    tx.oncomplete = () => {
      db.close();
      sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      resolve({ sessions, discarded });
    };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Saved checks could not be read.')); };
  });
}

export async function clearSessions(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Saved checks could not be reset.')); };
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
  const existing = new Map((await allSessions()).sessions.map(item => [item.id, item]));
  let changed = 0;
  for (const item of imported) {
    const old = existing.get(item.id);
    if (!old || item.updatedAt > old.updatedAt) { await saveSession(item); changed += 1; }
  }
  return changed;
}
