import { useState, useEffect, useCallback } from 'react'
import {
  getDecks,
  getDeck,
  saveDeck,
  deleteDeck,
  getQuests,
  saveQuest,
  deleteQuest,
} from '../db/stores'
import type { Deck, Quest } from '../types'
import { uid } from '../utils/uid'

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const loadDecks = useCallback(async () => {
    const d = await getDecks()
    setDecks(d)
    setLoaded(true)
  }, [])

  useEffect(() => {
    loadDecks()
  }, [loadDecks])

  const loadQuests = useCallback(async (deckId: string) => {
    const q = await getQuests(deckId)
    setQuests(q)
    setSelectedDeckId(deckId)
  }, [])

  const createDeck = useCallback(async (data: { name: string; description?: string; emoji: string; color: string }) => {
    const deck: Deck = {
      id: uid(),
      name: data.name,
      description: data.description || 'Ready to play',
      emoji: data.emoji,
      color: data.color,
      createdAt: Date.now(),
    }
    await saveDeck(deck)
    await loadDecks()
    return deck
  }, [loadDecks])

  const updateDeck = useCallback(async (id: string, data: Partial<Deck>) => {
    const deck = await getDeck(id)
    if (!deck) return
    const updated = { ...deck, ...data }
    await saveDeck(updated)
    await loadDecks()
  }, [loadDecks])

  const removeDeck = useCallback(async (id: string) => {
    await deleteDeck(id)
    await loadDecks()
    if (selectedDeckId === id) {
      setQuests([])
      setSelectedDeckId(null)
    }
  }, [loadDecks, selectedDeckId])

  const createQuest = useCallback(async (deckId: string, data: Omit<Quest, 'id' | 'deckId' | 'createdAt'>) => {
    const quest: Quest = {
      id: uid(),
      deckId,
      ...data,
      createdAt: Date.now(),
    }
    await saveQuest(quest)
    if (selectedDeckId === deckId) {
      setQuests(prev => [...prev, quest])
    }
    return quest
  }, [selectedDeckId])

  const updateQuest = useCallback(async (id: string, data: Partial<Quest>) => {
    const quests = await getQuests()
    const existing = quests.find(q => q.id === id)
    if (!existing) return
    const updated = { ...existing, ...data }
    await saveQuest(updated)
    if (selectedDeckId === existing.deckId) {
      setQuests(prev => prev.map(q => q.id === id ? updated : q))
    }
  }, [selectedDeckId])

  const removeQuest = useCallback(async (id: string) => {
    await deleteQuest(id)
    setQuests(prev => prev.filter(q => q.id !== id))
  }, [])

  const batchCreateQuests = useCallback(async (deckId: string, questData: Omit<Quest, 'id' | 'deckId' | 'createdAt'>[]) => {
    const created: Quest[] = []
    for (const data of questData) {
      const quest: Quest = {
        id: uid(),
        deckId,
        ...data,
        createdAt: Date.now(),
      }
      await saveQuest(quest)
      created.push(quest)
    }
    if (selectedDeckId === deckId) {
      setQuests(prev => [...prev, ...created])
    }
    return created
  }, [selectedDeckId])

  const selectedDeck = decks.find(d => d.id === selectedDeckId) ?? null

  return {
    decks,
    quests,
    selectedDeck,
    selectedDeckId,
    loaded,
    loadDecks,
    loadQuests,
    createDeck,
    updateDeck,
    removeDeck,
    createQuest,
    updateQuest,
    removeQuest,
    batchCreateQuests,
  }
}
