export interface Deck {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  createdAt: number
}

export interface Quest {
  id: string
  deckId: string
  title: string
  description: string
  value: number
  color: string
  emoji: string
  createdAt: number
}

export interface CompletedEntry {
  questId: string
  title: string
  value: number
  emoji: string
  completedAt: number
}

export interface GameSettings {
  timeConstraintEnabled: boolean
  timeLimitSeconds: number
  permanentDiscard: boolean
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  timeConstraintEnabled: false,
  timeLimitSeconds: 1800,
  permanentDiscard: false,
}

export interface Session {
  id: string
  deckId: string
  startedAt: number
  completedQuests: CompletedEntry[]
  discardedQuestIds: string[]
  drawCycle: number
  currentScore: number
  elapsedSeconds: number
  isActive: boolean
  gameSettings?: GameSettings
}

export interface Settings {
  backgroundColor: string
  theme: 'dark' | 'light' | 'system'
  customEmojis: string[]
  disabledEmojis: string[]
  deckOrder: string[]
  gameSettings?: Record<string, GameSettings>
  seenUpdates?: string[]
}

export interface ErrorLogEntry {
  id?: number
  message: string
  stack: string
  timestamp: number
  view: string
  userAgent: string
}

export interface ParsedQuestRow {
  title: string
  description: string
  value: number
  emoji: string
  color: string
}

export type View = 'menu' | 'deckSelect' | 'game' | 'deckList' | 'deckDetail' | 'deckComplete'
