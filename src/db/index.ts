import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'sidequest'
const DB_VERSION = 2

let dbInstance: IDBPDatabase | null = null
let dbUnavailable = false
const dbListeners: Set<(available: boolean) => void> = new Set()

export function onDBAvailabilityChange(cb: (available: boolean) => void): () => void {
  dbListeners.add(cb)
  return () => dbListeners.delete(cb)
}

export function isDBAvailable(): boolean {
  return !dbUnavailable
}

async function notifyListeners() {
  for (const cb of dbListeners) {
    try { cb(!dbUnavailable) } catch {}
  }
}

export async function getDB(): Promise<IDBPDatabase> {
  if (dbUnavailable) {
    throw new Error('IndexedDB is not available (private browsing or storage quota exceeded)')
  }
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        if (!db.objectStoreNames.contains('decks')) {
          db.createObjectStore('decks', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('quests')) {
          const store = db.createObjectStore('quests', { keyPath: 'id' })
          store.createIndex('deckId', 'deckId', { unique: false })
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' })
          store.createIndex('deckId', 'deckId', { unique: false })
        }
        if (!db.objectStoreNames.contains('error_log')) {
          const store = db.createObjectStore('error_log', { keyPath: 'id', autoIncrement: true })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      },
    })
    return dbInstance
  } catch (e) {
    const isIOSPB = e instanceof DOMException && (
      e.name === 'InvalidStateError' || e.name === 'SecurityError' || e.name === 'UnknownError'
    )
    if (isIOSPB || (e instanceof TypeError && e.message?.includes('IndexedDB'))) {
      console.warn('IndexedDB unavailable (likely private browsing or storage quota):', e)
    } else {
      console.error('Failed to open IndexedDB:', e)
    }
    dbUnavailable = true
    dbInstance = null
    await notifyListeners()
    throw new Error('IndexedDB is not available on this browser. The app requires IndexedDB to function.')
  }
}
