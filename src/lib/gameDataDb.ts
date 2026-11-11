export type StoredGameRecord = {
  steamId: number;
  fetchedAt: number;
  entry?: unknown;
};

const DB_NAME = "blaeo-plus-game-data";
// Bump when adding a store
const DB_VERSION = 3;
const BULK_READ_THRESHOLD = 200;
export const STORES = ["hltb", "linux", "steamspy", "steamhunters", "steamos", "steammachine", "steamframe"] as const;

export type GameDataStore = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        for (const name of STORES) {
          if (!request.result.objectStoreNames.contains(name)) {
            request.result.createObjectStore(name, { keyPath: "steamId" }).createIndex("fetchedAt", "fetchedAt");
          }
        }
      };
      let gaveUp = false;
      request.onblocked = () => {
        console.warn("BLAEO+: the game data cache is being upgraded but is still open in another tab, continuing without it");
        gaveUp = true;
        resolve(null);
      };
      request.onsuccess = () => {
        const db = request.result;

        if (gaveUp) {
          db.close();
          return;
        }

        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        console.error("BLAEO+: can't open the game data cache, continuing without it", request.error);
        resolve(null);
      };
    } catch (error) {
      console.error("BLAEO+: IndexedDB is unavailable, continuing without the game data cache", error);
      resolve(null);
    }
  });

  return dbPromise;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function withStore<T>(name: GameDataStore, mode: IDBTransactionMode, fallback: T, work: (store: IDBObjectStore, transaction: IDBTransaction) => Promise<T>): Promise<T> {
  const db = await openDb();

  if (!db) {
    return fallback;
  }

  try {
    const transaction = db.transaction(name, mode);
    return await work(transaction.objectStore(name), transaction);
  } catch (error) {
    console.error(`BLAEO+: game data cache (${name}) operation failed`, error);
    return fallback;
  }
}

export function readRecords(name: GameDataStore, steamIds: number[]): Promise<StoredGameRecord[] | null> {
  return withStore<StoredGameRecord[] | null>(name, "readonly", null, async (store) => {
    if (steamIds.length > BULK_READ_THRESHOLD) {
      return requestResult<StoredGameRecord[]>(store.getAll());
    }

    const records = await Promise.all(steamIds.map((id) => requestResult<StoredGameRecord | undefined>(store.get(id))));
    return records.filter((record): record is StoredGameRecord => record !== undefined);
  });
}

export function writeRecords(name: GameDataStore, records: StoredGameRecord[]): Promise<void> {
  return withStore(name, "readwrite", undefined, async (store, transaction) => {
    for (const record of records) {
      store.put(record);
    }

    await transactionDone(transaction);
  });
}

export function countRecords(name: GameDataStore): Promise<number> {
  return withStore(name, "readonly", 0, (store) => requestResult(store.count()));
}

export function allStoredIds(name: GameDataStore): Promise<number[]> {
  return withStore(name, "readonly", [], async (store) => (await requestResult(store.getAllKeys())) as number[]);
}
