import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'sidequest'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

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
}
