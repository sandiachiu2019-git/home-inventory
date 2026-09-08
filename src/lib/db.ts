import type { InventoryItem } from './types';

const DB_NAME = 'smart-home-inventory';
const DB_VERSION = 1;
const STORE_NAME = 'items';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (_event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('location', 'location', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = fn(store);

        if (result instanceof IDBRequest) {
          result.onsuccess = () => resolve(result.result);
          result.onerror = () => reject(result.error);
        } else {
          Promise.resolve(result).then(resolve, reject);
        }

        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export function getAllItems(): Promise<InventoryItem[]> {
  return withStore('readonly', (store) => store.getAll() as IDBRequest<InventoryItem[]>);
}

export function putItem(item: InventoryItem): Promise<IDBValidKey> {
  return withStore('readwrite', (store) => store.put(item) as IDBRequest<IDBValidKey>);
}

export function deleteItem(id: string): Promise<undefined> {
  return withStore('readwrite', (store) => store.delete(id) as IDBRequest<undefined>);
}

export function clearAllItems(): Promise<undefined> {
  return withStore('readwrite', (store) => store.clear() as IDBRequest<undefined>);
}

export function bulkPutItems(items: InventoryItem[]): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}
