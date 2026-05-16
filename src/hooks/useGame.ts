import { useState, useCallback, useRef } from 'react'
import type { Quest, Session, CompletedEntry, GameSettings } from '../types'
import { saveSession, getActiveSession, getQuests } from '../db/stores'
import { pickWeighted, updateWeightOnDiscard, resetWeightsIfCycleComplete } from '../utils/probability'

function uid(): string {
  return crypto.randomUUID()
}

const HAND_SIZE = 4

export function useGame() {
  const [hand, setHand] = useState<(Quest & { flipped: boolean })[]>([])
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set())
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set())
  const [pool, setPool] = useState<Quest[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [drawnIds, setDrawnIds] = useState<string[]>([])
  const [_drawCycle, setDrawCycle] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [score, setScore] = useState(0)
  const [completedEntries, setCompletedEntries] = useState<CompletedEntry[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [totalQuests, setTotalQuests] = useState(0)
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)

  const sessionRef = useRef(session)
  sessionRef.current = session

  const persistSession = useCallback(async (s: Session) => {
    await saveSession(s)
  }, [])

  const startGame = useCallback(async (deckId: string, settings?: GameSettings) => {
    if (settings) setGameSettings(settings)

    const existing = await getActiveSession(deckId)
    if (existing) {
      const allQuests = await getQuests(deckId)
      const completedSet = new Set(existing.completedQuests.map(q => q.questId))
      const discardedSet = existing.discardedQuestIds ?? []
      const permDiscard = existing.gameSettings?.permanentDiscard ?? settings?.permanentDiscard ?? false
      const availableQuests = allQuests.filter(
        q => !completedSet.has(q.id) && !(permDiscard && discardedSet.includes(q.id))
      )

      setHand(availableQuests.slice(0, HAND_SIZE).map(q => ({ ...q, flipped: false })))
      setPool(availableQuests.slice(HAND_SIZE))
      setScore(existing.currentScore)
      setCompletedEntries(existing.completedQuests)
      setCompletedQuestIds(completedSet)
      setDrawnIds(
        [...completedSet, ...discardedSet].filter(Boolean)
      )
      setDrawCycle(existing.drawCycle ?? 0)
      setTotalQuests(allQuests.length)
      setGameSettings(existing.gameSettings ?? settings ?? null)

      const w: Record<string, number> = {}
      for (const q of allQuests) {
        w[q.id] = permDiscard && discardedSet.includes(q.id) ? 0 : discardedSet.includes(q.id) ? 0.5 : 1
      }
      setWeights(w)
      setSession(existing)
      setGameOver(false)
      return existing
    }

    const allQuests = await getQuests(deckId)
    setTotalQuests(allQuests.length)

    if (allQuests.length === 0) {
      setHand([])
      setPool([])
      setGameOver(true)
      return null
    }

    const w: Record<string, number> = {}
    for (const q of allQuests) {
      w[q.id] = 1
    }
    setWeights(w)
    setDrawnIds([])
    setDrawCycle(0)
    setScore(0)
    setCompletedEntries([])
    setCompletedQuestIds(new Set())
    setFlippedIds(new Set())

    const shuffled = [...allQuests].sort(() => Math.random() - 0.5)
    const dealt = shuffled.slice(0, Math.min(HAND_SIZE, shuffled.length))
    const remaining = shuffled.slice(Math.min(HAND_SIZE, shuffled.length))

    setHand(dealt.map(q => ({ ...q, flipped: false })))
    setPool(remaining)

    const newSession: Session = {
      id: uid(),
      deckId,
      startedAt: Date.now(),
      completedQuests: [],
      discardedQuestIds: [],
      drawCycle: 0,
      currentScore: 0,
      elapsedSeconds: 0,
      isActive: true,
      gameSettings: settings ?? undefined,
    }
    setSession(newSession)
    setGameOver(false)
    return newSession
  }, [])

  const replaceCard = useCallback((cardId: string) => {
    setHand(prev => {
      const permDiscard = gameSettings?.permanentDiscard ?? false
      const remainingPool = pool.length > 0 ? pool : []
      const discardFilteredPool = permDiscard
        ? remainingPool.filter(q => !(sessionRef.current?.discardedQuestIds ?? []).includes(q.id))
        : remainingPool
      const availableWeights = resetWeightsIfCycleComplete(weights, [...drawnIds, ...completedQuestIds], drawnIds)

      const picked = pickWeighted(discardFilteredPool, availableWeights)
      if (!picked) {
        const newHand = prev.filter(c => c.id !== cardId)
        if (newHand.length === 0) {
          setGameOver(true)
        }
        return newHand
      }

      setPool(p => p.filter(q => q.id !== picked.id))
      setWeights(availableWeights)
      setDrawnIds(prevIds => [...prevIds, picked.id])

      const newCycle = [...drawnIds, picked.id]
      const allDrawn = Object.keys(availableWeights).length > 0 &&
        [...completedQuestIds, ...newCycle].filter(
          (id, i, arr) => arr.indexOf(id) === i
        ).length >= Object.keys(availableWeights).length
      if (allDrawn) {
        setDrawCycle(c => c + 1)
      }

      return prev.map(c => c.id === cardId ? { ...picked, flipped: false } : c)
    })
  }, [pool, weights, drawnIds, completedQuestIds, gameSettings])

  const flipCard = useCallback((cardId: string) => {
    setFlippedIds(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
    setHand(prev => prev.map(c => c.id === cardId ? { ...c, flipped: !c.flipped } : c))
  }, [])

  const completeQuest = useCallback((cardId: string) => {
    const card = hand.find(c => c.id === cardId)
    if (!card) return

    const entry: CompletedEntry = {
      questId: card.id,
      title: card.title,
      value: card.value,
      emoji: card.emoji,
      completedAt: Date.now(),
    }

    setCompletedEntries(prev => {
      const next = [...prev, entry]
      if (sessionRef.current) {
        const updated = {
          ...sessionRef.current,
          completedQuests: next,
          currentScore: score + card.value,
          elapsedSeconds: Math.max(sessionRef.current.elapsedSeconds, 0),
        }
        persistSession(updated)
      }
      return next
    })

    setScore(s => s + card.value)
    setCompletedQuestIds(prev => {
      const next = new Set(prev)
      next.add(cardId)
      return next
    })

    if (sessionRef.current) {
      sessionRef.current = {
        ...sessionRef.current,
        completedQuests: [...completedEntries, entry],
        currentScore: score + card.value,
      }
    }

    replaceCard(cardId)
  }, [hand, score, completedEntries, replaceCard, persistSession])

  const discardQuest = useCallback((cardId: string) => {
    setWeights(prev => {
      const permDiscard = gameSettings?.permanentDiscard ?? false
      if (permDiscard) {
        const next = { ...prev }
        delete next[cardId]
        return next
      }
      return updateWeightOnDiscard(prev, cardId)
    })

    if (sessionRef.current) {
      const updated = {
        ...sessionRef.current,
        discardedQuestIds: [...(sessionRef.current.discardedQuestIds ?? []), cardId],
        elapsedSeconds: Math.max(sessionRef.current.elapsedSeconds, 0),
      }
      sessionRef.current = updated
      persistSession(updated)
    }

    replaceCard(cardId)
  }, [replaceCard, persistSession, gameSettings])

  const saveTimer = useCallback((elapsedSeconds: number) => {
    if (sessionRef.current) {
      sessionRef.current = { ...sessionRef.current, elapsedSeconds }
      persistSession(sessionRef.current)
    }
  }, [persistSession])

  const resetGame = useCallback(async () => {
    if (sessionRef.current) {
      await saveSession({
        ...sessionRef.current,
        isActive: false,
      })
    }
    setSession(null)
    setHand([])
    setPool([])
    setScore(0)
    setCompletedEntries([])
    setCompletedQuestIds(new Set())
    setFlippedIds(new Set())
    setWeights({})
    setDrawnIds([])
    setDrawCycle(0)
    setGameOver(false)
    setGameSettings(null)
  }, [saveSession])

  const endGame = useCallback(async () => {
    if (sessionRef.current) {
      await saveSession({
        ...sessionRef.current,
        isActive: false,
      })
    }
    setGameOver(true)
  }, [saveSession])

  return {
    hand,
    flippedIds,
    score,
    completedEntries,
    session,
    gameOver,
    totalQuests,
    gameSettings,
    startGame,
    flipCard,
    completeQuest,
    discardQuest,
    saveTimer,
    resetGame,
    endGame,
  }
}
