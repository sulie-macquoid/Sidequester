export interface Deck {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  createdAt: number
  activePowerups?: string[]
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
  streakEnabled?: boolean
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  timeConstraintEnabled: false,
  timeLimitSeconds: 1800,
  permanentDiscard: false,
  streakEnabled: true,
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
  streak?: number
  powerupCooldowns?: Record<string, number>
  usedPowerupCardIds?: string[]
  doubleDownActive?: boolean
  timeFrozen?: boolean
  timeFrozenUntil?: number
  starBoostedIds?: string[]
  lastDiscardedQuest?: CompletedEntry
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

export type StreakPowerup = 'doubleDown' | 'freezeTime' | 'freshDraw'

export type PowerupCardType = 'joker' | 'mulligan' | 'starPower' | 'shuffle'

export interface HandQuestCard {
  id: string
  flipped: boolean
  type?: 'quest'
  title: string
  description: string
  emoji: string
  value: number
  color: string
  questId?: string
}

export interface HandPowerupCard {
  id: string
  flipped: boolean
  type: 'powerup'
  powerupKey: PowerupCardType
  title: string
  description: string
  emoji: string
  value: number
  color: string
}

export type HandCard = HandQuestCard | HandPowerupCard

export const STREAK_POWERUPS: { key: StreakPowerup; label: string; icon: string; unlockStreak: number; rechargeCount: number; description: string }[] = [
  { key: 'doubleDown', label: 'Double Down', icon: '🔄', unlockStreak: 3, rechargeCount: 6, description: 'Next complete gives 2× points' },
  { key: 'freezeTime', label: 'Freeze Time', icon: '❄️', unlockStreak: 5, rechargeCount: 10, description: 'Pause timer for 5 minutes' },
  { key: 'freshDraw', label: 'Fresh Draw', icon: '♻️', unlockStreak: 7, rechargeCount: 14, description: 'Replace your entire hand' },
]

export const POWERUP_CARDS: { key: PowerupCardType; label: string; emoji: string; description: string; value: [number, number] }[] = [
  { key: 'joker', label: 'Joker', emoji: '🃏', description: 'Earn bonus points!', value: [100, 300] },
  { key: 'mulligan', label: 'Mulligan', emoji: '↩️', description: 'Recover your last discard', value: [0, 0] },
  { key: 'starPower', label: 'Star Power', emoji: '⭐', description: 'Boost all hand cards +50', value: [0, 0] },
  { key: 'shuffle', label: 'Shuffle', emoji: '🔀', description: 'Redraw your entire hand', value: [0, 0] },
]
