import { openDB, type IDBPDatabase } from 'idb'
import type { PersistedKunuState } from '../types/models'

const DB_NAME = 'kunu-memory-v1'
const SNAPSHOT_KEY = 'primary'

interface KunuDBSchema {
  snapshot: {
    key: string
    value: unknown
  }
  photos: {
    key: string
    value: Blob
  }
}

let memorySnapshot: unknown = null
const memoryPhotos = new Map<string, Blob>()

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
    if (!db) return memorySnapshot as PersistedKunuState | null
    return ((await db.get('snapshot', SNAPSHOT_KEY)) as PersistedKunuState | undefined) ?? null
  } catch {
    return memorySnapshot as PersistedKunuState | null
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
  memoryPhotos.set(id, photo)
  const db = await database()
  if (db) await db.put('photos', photo, id)
}

export async function loadLocalPhoto(id: string): Promise<Blob | undefined> {
  const db = await database()
  return db ? (await db.get('photos', id)) ?? memoryPhotos.get(id) : memoryPhotos.get(id)
}

export async function deleteLocalPhoto(id: string): Promise<void> {
  memoryPhotos.delete(id)
  const db = await database()
  if (db) await db.delete('photos', id)
}

export async function clearKunuDatabase(): Promise<void> {
  memorySnapshot = null
  memoryPhotos.clear()
  if (!hasIndexedDB()) return
  const db = await database()
  if (!db) return
  await db.clear('snapshot')
  await db.clear('photos')
}
