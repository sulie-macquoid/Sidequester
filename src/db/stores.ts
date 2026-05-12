import { getDB } from './index'
import type { Deck, Quest, Session, Settings, ErrorLogEntry } from '../types'

const SETTINGS_DEFAULTS: Settings = {
  backgroundColor: '#0F0F1A',
  theme: 'dark',
  customEmojis: [],
  disabledEmojis: [],
  deckOrder: [],
}

export async function getSetting(key: string): Promise<any> {
  const db = await getDB()
  const entry = await db.get('settings', key)
  return entry?.value
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB()
  const all = await db.getAll('settings')
  const map = Object.fromEntries(all.map((e: any) => [e.key, e.value]))
  return { ...SETTINGS_DEFAULTS, ...map } as Settings
}

export async function getDecks(): Promise<Deck[]> {
  const db = await getDB()
  return db.getAll('decks')
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const db = await getDB()
  return db.get('decks', id)
}

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await getDB()
  await db.put('decks', deck)
}

export async function deleteDeck(id: string): Promise<void> {
  const db = await getDB()
  const quests = await getQuests(id)
  const tx = db.transaction(['decks', 'quests', 'sessions'], 'readwrite')
  await tx.objectStore('decks').delete(id)
  for (const q of quests) {
    await tx.objectStore('quests').delete(q.id)
  }
  const sessions = await tx.objectStore('sessions').index('deckId').getAll(id)
  for (const s of sessions) {
    await tx.objectStore('sessions').delete(s.id)
  }
  await tx.done
}

export async function getQuests(deckId?: string): Promise<Quest[]> {
  const db = await getDB()
  if (deckId) {
    return db.getAllFromIndex('quests', 'deckId', deckId)
  }
  return db.getAll('quests')
}

export async function saveQuest(quest: Quest): Promise<void> {
  const db = await getDB()
  await db.put('quests', quest)
}

export async function deleteQuest(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('quests', id)
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getActiveSession(deckId?: string): Promise<Session | undefined> {
  const db = await getDB()
  if (deckId) {
    const sessions = await db.getAllFromIndex('sessions', 'deckId', deckId)
    return sessions.find(s => s.isActive)
  }
  const all = await db.getAll('sessions')
  return all.find(s => s.isActive)
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB()
  return db.get('sessions', id)
}

export async function clearSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('sessions', id)
}

export async function logError(entry: ErrorLogEntry): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('error_log', 'readwrite')
  const store = tx.objectStore('error_log')
  const count = await store.count()
  if (count >= 200) {
    const cursor = await store.openCursor()
    if (cursor) {
      await cursor.delete()
    }
  }
  await store.add(entry)
  await tx.done
}

export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  const db = await getDB()
  const entries = await db.getAll('error_log')
  return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
}

export async function clearErrorLog(): Promise<void> {
  const db = await getDB()
  await db.clear('error_log')
}
