import { openDB, type IDBPDatabase } from 'idb'
import type { PersistedKunuState } from '../types/models'

const DB_NAME = 'kunu-memory-v1'
const SNAPSHOT_KEY = 'primary'

interface KunuDBSchema {
  snapshot: {
    key: string
    value: PersistedKunuState
  }
  photos: {
    key: string
    value: Blob
  }
}

let memorySnapshot: PersistedKunuState | null = null

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

async function database(): Promise<IDBPDatabase<KunuDBSchema> | null> {
  if (!hasIndexedDB()) return null

  return openDB<KunuDBSchema>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('snapshot')) db.createObjectStore('snapshot')
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos')
    },
  })
}

export async function loadSnapshot(): Promise<PersistedKunuState | null> {
  try {
    const db = await database()
    if (!db) return memorySnapshot
    return (await db.get('snapshot', SNAPSHOT_KEY)) ?? null
  } catch {
    return memorySnapshot
  }
}

export async function saveSnapshot(snapshot: PersistedKunuState): Promise<void> {
  memorySnapshot = structuredClone(snapshot)
  try {
    const db = await database()
    if (db) await db.put('snapshot', snapshot, SNAPSHOT_KEY)
  } catch {
    // The in-memory copy keeps the app functional when private browsing blocks IDB.
  }
}

export async function saveLocalPhoto(id: string, photo: Blob): Promise<void> {
  const db = await database()
  if (db) await db.put('photos', photo, id)
}

export async function loadLocalPhoto(id: string): Promise<Blob | undefined> {
  const db = await database()
  return db ? db.get('photos', id) : undefined
}

export async function clearKunuDatabase(): Promise<void> {
  memorySnapshot = null
  if (!hasIndexedDB()) return
  const db = await database()
  if (!db) return
  await db.clear('snapshot')
  await db.clear('photos')
}
