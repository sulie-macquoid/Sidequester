import { getDecks, saveDeck, saveQuest } from './stores'
import type { Deck, Quest } from '../types'

function uid(): string {
  return crypto.randomUUID()
}

const TOKYO_DECK: Deck = {
  id: uid(),
  name: 'Tokyo',
  description: 'Ready to play',
  emoji: '🗼',
  color: '#DC143C',
  createdAt: Date.now(),
}

const TOKYO_QUESTS: Omit<Quest, 'id' | 'deckId' | 'createdAt'>[] = [
  { title: 'Talk to a stranger', description: 'Have a conversation with a local', value: 150, emoji: '🎯', color: '#DC143C' },
  { title: 'Eat at a random shop', description: 'Walk 10 min, pick the first place you see', value: 80, emoji: '🍜', color: '#FF6B6B' },
  { title: 'Ask for directions in Japanese', description: 'Ask someone for directions, even if you know the way', value: 200, emoji: '🗣️', color: '#FF9F43' },
  { title: 'Photograph a vending machine', description: 'Find the most unique vending machine', value: 50, emoji: '📸', color: '#FECA57' },
  { title: 'Visit a shrine', description: 'Spend 5 minutes at any shrine', value: 100, emoji: '⛩️', color: '#2ED573' },
  { title: 'Take the wrong train', description: 'Get on a train line you have never taken, ride 3 stops', value: 250, emoji: '🚃', color: '#20BF6B' },
  { title: 'Find an arcade', description: 'Play one game at any arcade', value: 75, emoji: '🎮', color: '#00D2D3' },
  { title: 'Try a convenience store snack', description: 'Buy something you have never seen before', value: 40, emoji: '🍡', color: '#54A0FF' },
  { title: 'Go to a 100-yen shop', description: 'Buy something useless but funny', value: 60, emoji: '🏪', color: '#5F27CD' },
  { title: 'Find a hidden garden', description: 'Locate a small park or garden not on the main map', value: 180, emoji: '🌸', color: '#A29BFE' },
  { title: 'Visit a themed café', description: 'Go to any café with a theme (cat, anime, etc.)', value: 120, emoji: '☕', color: '#FD79A8' },
  { title: 'Sprint across Shibuya crossing', description: 'Record yourself doing it', value: 90, emoji: '🏃', color: '#636E72' },
]

const AIRPORT_DECK: Deck = {
  id: uid(),
  name: 'Airport',
  description: 'Ready to play',
  emoji: '✈️',
  color: '#54A0FF',
  createdAt: Date.now(),
}

const AIRPORT_QUESTS: Omit<Quest, 'id' | 'deckId' | 'createdAt'>[] = [
  { title: 'Spot the plane', description: "Find your gate's plane from the window", value: 50, emoji: '✈️', color: '#54A0FF' },
  { title: 'Most expensive coffee', description: 'Buy the priciest coffee you can find', value: 100, emoji: '☕', color: '#FF9F43' },
  { title: 'Buy a useless souvenir', description: 'Something you will never use', value: 75, emoji: '🛍️', color: '#FF6B6B' },
  { title: 'Walk every terminal', description: 'Step foot in every terminal', value: 200, emoji: '🚶', color: '#2ED573' },
  { title: 'Find the weirdest traveler', description: 'Observe and describe in one note', value: 150, emoji: '🧳', color: '#A29BFE' },
  { title: 'Read a newspaper cover to cover', description: 'Find a free paper, read the whole thing', value: 180, emoji: '📰', color: '#636E72' },
  { title: 'People-watch for 10 min', description: 'Sit and observe, write down 3 stories', value: 120, emoji: '🎧', color: '#00D2D3' },
  { title: 'Eat the most expensive meal', description: 'Find the priciest food option', value: 90, emoji: '🍔', color: '#DC143C' },
]

export async function seedIfEmpty(): Promise<void> {
  const decks = await getDecks()
  if (decks.length > 0) return

  await saveDeck(TOKYO_DECK)
  for (const q of TOKYO_QUESTS) {
    await saveQuest({ ...q, id: uid(), deckId: TOKYO_DECK.id, createdAt: Date.now() })
  }

  await saveDeck(AIRPORT_DECK)
  for (const q of AIRPORT_QUESTS) {
    await saveQuest({ ...q, id: uid(), deckId: AIRPORT_DECK.id, createdAt: Date.now() })
  }
}
