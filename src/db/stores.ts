import { getDB } from './index'
import type { Deck, Quest, Session, Settings, ErrorLogEntry } from '../types'

const SETTINGS_DEFAULTS: Settings = {
  backgroundColor: '#0F0F1A',
  theme: 'dark',
  customEmojis: [],
  disabledEmojis: [],
  deckOrder: [],
  seenUpdates: [],
}

async function safeDB<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    console.error('IndexedDB error:', e)
    return fallback
  }
}

export async function getSetting(key: string): Promise<any> {
  return safeDB(async () => {
    const db = await getDB()
    const entry = await db.get('settings', key)
    return entry?.value
  }, undefined)
}

export async function setSetting(key: string, value: any): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.put('settings', { key, value })
  }, undefined)
}

export async function getSettings(): Promise<Settings> {
  return safeDB(async () => {
    const db = await getDB()
    const all = await db.getAll('settings')
    const map = Object.fromEntries(all.map((e: any) => [e.key, e.value]))
    return { ...SETTINGS_DEFAULTS, ...map } as Settings
  }, { ...SETTINGS_DEFAULTS })
}

export async function getDecks(): Promise<Deck[]> {
  return safeDB(async () => {
    const db = await getDB()
    return db.getAll('decks')
  }, [])
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return safeDB(async () => {
    const db = await getDB()
    return db.get('decks', id)
  }, undefined)
}

export async function saveDeck(deck: Deck): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.put('decks', deck)
  }, undefined)
}

export async function deleteDeck(id: string): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    const tx = db.transaction(['decks', 'quests', 'sessions'], 'readwrite')
    await tx.objectStore('decks').delete(id)
    const questStore = tx.objectStore('quests')
    const questIndex = questStore.index('deckId')
    const quests = await questIndex.getAll(id)
    for (const q of quests) {
      await questStore.delete(q.id)
    }
    const sessionStore = tx.objectStore('sessions')
    const sessionIndex = sessionStore.index('deckId')
    const sessions = await sessionIndex.getAll(id)
    for (const s of sessions) {
      await sessionStore.delete(s.id)
    }
    await tx.done
  }, undefined)
}

export async function getQuests(deckId?: string): Promise<Quest[]> {
  return safeDB(async () => {
    const db = await getDB()
    if (deckId) {
      return db.getAllFromIndex('quests', 'deckId', deckId)
    }
    return db.getAll('quests')
  }, [])
}

export async function saveQuest(quest: Quest): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.put('quests', quest)
  }, undefined)
}

export async function deleteQuest(id: string): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.delete('quests', id)
  }, undefined)
}

export async function saveSession(session: Session): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.put('sessions', session)
  }, undefined)
}

export async function getActiveSession(deckId?: string): Promise<Session | undefined> {
  return safeDB(async () => {
    const db = await getDB()
    if (deckId) {
      const sessions = await db.getAllFromIndex('sessions', 'deckId', deckId)
      return sessions.find(s => s.isActive)
    }
    const all = await db.getAll('sessions')
    return all.find(s => s.isActive)
  }, undefined)
}

export async function getSession(id: string): Promise<Session | undefined> {
  return safeDB(async () => {
    const db = await getDB()
    return db.get('sessions', id)
  }, undefined)
}

export async function clearSession(id: string): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.delete('sessions', id)
  }, undefined)
}

export async function logError(entry: ErrorLogEntry): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    const tx = db.transaction('error_log', 'readwrite')
    const store = tx.objectStore('error_log')
    const count = await store.count()
    if (count >= 200) {
      const cursor = await store.openCursor()
      const toDelete: number[] = []
      for (let i = 0; i < 50 && cursor; i++) {
        toDelete.push(cursor.value.id ?? cursor.primaryKey as number)
        await cursor.continue()
      }
      for (const id of toDelete) {
        await store.delete(id)
      }
    }
    await store.add(entry)
    await tx.done
  }, undefined)
}

export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  return safeDB(async () => {
    const db = await getDB()
    const entries = await db.getAll('error_log')
    return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
  }, [])
}

export async function clearErrorLog(): Promise<void> {
  return safeDB(async () => {
    const db = await getDB()
    await db.clear('error_log')
  }, undefined)
}
