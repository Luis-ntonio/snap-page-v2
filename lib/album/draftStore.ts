import type { AlbumDraft } from '@/types';

// Persistencia del álbum en edición en IndexedDB (soporta Blobs de fotos, a diferencia de sessionStorage).
// El borrador sobrevive recargas y la navegación a /register → el álbum se conserva si el usuario se registra.

const DB_NAME = 'snap-album';
const STORE = 'drafts';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'plantillaId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const store = db.transaction(STORE, mode).objectStore(STORE);
        const req = run(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function saveDraft(draft: AlbumDraft): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put({ ...draft, updatedAt: Date.now() }));
  } catch {
    // best-effort: si IndexedDB falla, el editor sigue funcionando en memoria.
  }
}

export async function loadDraft(plantillaId: string): Promise<AlbumDraft | null> {
  try {
    const result = await tx<AlbumDraft | undefined>('readonly', (s) => s.get(plantillaId));
    return result ?? null;
  } catch {
    return null;
  }
}

export async function clearDraft(plantillaId: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(plantillaId));
  } catch {
    // ignore
  }
}
