import { useState, useCallback, useRef } from 'react'
import type { Quest, Session, CompletedEntry, GameSettings, HandCard, HandPowerupCard, HandQuestCard, StreakPowerup, PowerupCardType } from '../types'
import { STREAK_POWERUPS, POWERUP_CARDS } from '../types'
import { saveSession, getActiveSession, getQuests } from '../db/stores'
import { pickWeighted, updateWeightOnDiscard, resetWeightsIfCycleComplete } from '../utils/probability'
import { uid } from '../utils/uid'

const HAND_SIZE = 4

export function useGame() {
  const [hand, setHand] = useState<HandCard[]>([])
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

  const [streak, setStreak] = useState(0)
  const [powerupCooldowns, setPowerupCooldowns] = useState<Record<string, number>>({})
  const [doubleDownActive, setDoubleDownActive] = useState(false)
  const [timeFrozen, setTimeFrozen] = useState(false)
  const [timeFrozenUntil, setTimeFrozenUntil] = useState<number | null>(null)
  const [starBoostedCardIds, setStarBoostedCardIds] = useState<Set<string>>(new Set())
  const [mulliganPending, setMulliganPending] = useState(false)
  const [frozenTimeCompensationMs, setFrozenTimeCompensationMs] = useState(0)

  const sessionRef = useRef(session)
  sessionRef.current = session
  const scoreRef = useRef(score)
  scoreRef.current = score
  const completedRef = useRef(completedEntries)
  completedRef.current = completedEntries
  const handRef = useRef(hand)
  handRef.current = hand
  const starBoostedRef = useRef(starBoostedCardIds)
  starBoostedRef.current = starBoostedCardIds
  const doubleDownRef = useRef(doubleDownActive)
  doubleDownRef.current = doubleDownActive
  const usedPowerupKeysRef = useRef<Set<PowerupCardType>>(new Set())
  const poolRef = useRef(pool)
  poolRef.current = pool
  const weightsRef = useRef(weights)
  weightsRef.current = weights
  const drawnIdsRef = useRef(drawnIds)
  drawnIdsRef.current = drawnIds

  const persistSession = useCallback(async (s: Session) => {
    await saveSession(s)
  }, [])

  const isPowerupCardOnScreen = useCallback((h: HandCard[]) => h.some(c => c.type === 'powerup'), [])

  const buildPowerupCardData = useCallback((key: PowerupCardType): HandPowerupCard => {
    const def = POWERUP_CARDS.find(p => p.key === key)!
    const value = key === 'joker' ? Math.floor(Math.random() * 201) + 100 : 0
    return {
      id: uid(),
      flipped: false,
      type: 'powerup',
      powerupKey: key,
      title: def.label,
      description: def.description,
      emoji: def.emoji,
      value,
      color: '#9B59B6',
    }
  }, [])

  const pickAvailablePowerupKey = useCallback((handCards: HandCard[]): PowerupCardType | null => {
    const onScreenKeys = handCards.filter(c => c.type === 'powerup').map(c => (c as HandPowerupCard).powerupKey)
    const available = POWERUP_CARDS.filter(p => !usedPowerupKeysRef.current.has(p.key) && !onScreenKeys.includes(p.key))
    if (available.length === 0) return null
    return available[Math.floor(Math.random() * available.length)].key
  }, [])

  const replaceCard = useCallback((cardId: string) => {
    setHand(prev => {
      const permDiscard = gameSettings?.permanentDiscard ?? false
      const currentPool = poolRef.current
      const remainingPool = currentPool.length > 0 ? currentPool : []
      const discardFilteredPool = permDiscard
        ? remainingPool.filter(q => !(sessionRef.current?.discardedQuestIds ?? []).includes(q.id))
        : remainingPool
      const availableWeights = resetWeightsIfCycleComplete(weightsRef.current, [...drawnIdsRef.current, ...completedEntries.map(e => e.questId).filter(Boolean)], drawnIdsRef.current)

      let picked: Quest | null = pickWeighted(discardFilteredPool, availableWeights)

      if (!picked) {
        const newHand = prev.filter(c => c.id !== cardId)
        if (newHand.length === 0) {
          setGameOver(true)
        }
        return newHand
      }

      // Always consume the picked quest from pool/weights/drawnIds first (M1)
      const newPool = currentPool.filter(q => q.id !== picked.id)
      poolRef.current = newPool
      weightsRef.current = availableWeights
      drawnIdsRef.current = [...drawnIdsRef.current, picked.id]

      const powerupOnScreen = isPowerupCardOnScreen(prev)
      if (!powerupOnScreen && Math.random() < 0.05) {
        const availKey = pickAvailablePowerupKey(prev)
        if (availKey) {
          usedPowerupKeysRef.current.add(availKey)
          const pc = buildPowerupCardData(availKey)
          return prev.map(c => c.id === cardId ? pc : c)
        }
      }

      const newCycle = [...drawnIdsRef.current, picked.id]
      const allQuestIds = Object.keys(availableWeights)
      const allDrawn = allQuestIds.length > 0 &&
        [...new Set([...completedEntries.map(e => e.questId).filter(Boolean), ...newCycle])]
          .filter(id => allQuestIds.includes(id)).length >= allQuestIds.length
      if (allDrawn) {
        setDrawCycle(c => c + 1)
      }

      return prev.map(c => c.id === cardId ? { ...picked!, flipped: false } : c)
    })
  }, [completedEntries, gameSettings, isPowerupCardOnScreen, pickAvailablePowerupKey, buildPowerupCardData])

  const replaceCardSync = useCallback((cardId: string) => {
    replaceCard(cardId)
  }, [replaceCard])

  const completeQuest = useCallback((cardId: string) => {
    const card = hand.find(c => c.id === cardId)
    if (!card) return

    if (card.type === 'powerup') {
      const pc = card as HandPowerupCard
      if (pc.powerupKey === 'joker') {
        const newScore = scoreRef.current + pc.value
        setScore(newScore)
        if (sessionRef.current) {
          const updated: Session = {
            ...sessionRef.current,
            currentScore: newScore,
            usedPowerupCardIds: [...usedPowerupKeysRef.current],
          }
          sessionRef.current = updated
          persistSession(updated)
        }
        replaceCardSync(cardId)
      } else if (pc.powerupKey === 'starPower') {
        const currentIds = hand.filter(c => c.type !== 'powerup').map(c => c.id)
        setStarBoostedCardIds(new Set(currentIds))
        if (sessionRef.current) {
          const updated: Session = {
            ...sessionRef.current,
            starBoostedIds: currentIds,
            usedPowerupCardIds: [...usedPowerupKeysRef.current],
          }
          sessionRef.current = updated
          persistSession(updated)
        }
        replaceCardSync(cardId)
      } else if (pc.powerupKey === 'mulligan') {
        setMulliganPending(true)
      } else if (pc.powerupKey === 'shuffle') {
        const nonPowerupIds = hand.filter(c => c.type !== 'powerup').map(c => c.id)
        // Replace the shuffle card slot + all non-powerup cards in one batch
        const allToReplace = [...nonPowerupIds, cardId]
        const currentPool = poolRef.current
        const shuffledPool = [...currentPool].sort(() => Math.random() - 0.5)
        const replacements = shuffledPool.slice(0, allToReplace.length)
        const newPoolArr = shuffledPool.slice(replacements.length)

        setHand(prev => {
          const replaceIds = new Set(allToReplace)
          const iter = replacements[Symbol.iterator]()
          return prev.map(c => {
            if (replaceIds.has(c.id)) {
              const next = iter.next().value
              if (!next) return c
              return { ...next, flipped: false, type: 'quest' as const }
            }
            return c
          })
        })
        poolRef.current = newPoolArr as Quest[]
        setPool(newPoolArr as Quest[])

        if (sessionRef.current) {
          const updated: Session = {
            ...sessionRef.current,
            usedPowerupCardIds: [...usedPowerupKeysRef.current],
          }
          sessionRef.current = updated
          persistSession(updated)
        }
      }
      return
    }

    const q = card as HandQuestCard
    let value = q.value
    if (starBoostedCardIds.has(q.id)) {
      value += 50
    }
    if (doubleDownRef.current) {
      value *= 2
      setDoubleDownActive(false)
    }

    const entry: CompletedEntry = {
      questId: q.id,
      title: q.title,
      value,
      emoji: q.emoji,
      completedAt: Date.now(),
    }

    const newScore = scoreRef.current + value
    const newEntries = [...completedRef.current, entry]

    setScore(newScore)
    setCompletedEntries(newEntries)
    const newStreak = streak + 1
    setStreak(newStreak)

    // H2 — accumulate all expired cooldowns, single setState
    const newCooldowns = { ...powerupCooldowns }
    for (const sp of STREAK_POWERUPS) {
      if (sp.key in newCooldowns) {
        const usedAt = newCooldowns[sp.key]
        if (newStreak >= usedAt + sp.rechargeCount) {
          delete newCooldowns[sp.key]
        }
      }
    }
    setPowerupCooldowns(newCooldowns)

    setStarBoostedCardIds(prev => {
      const next = new Set(prev)
      next.delete(q.id)
      return next
    })

    if (sessionRef.current) {
      const updated: Session = {
        ...sessionRef.current,
        completedQuests: newEntries,
        currentScore: newScore,
        streak: newStreak,
        usedPowerupCardIds: [...usedPowerupKeysRef.current],
        starBoostedIds: [...starBoostedCardIds].filter(id => id !== q.id),
      }
      sessionRef.current = updated
      persistSession(updated)
    }

    replaceCardSync(cardId)
  }, [hand, replaceCardSync, persistSession, starBoostedCardIds, powerupCooldowns, streak])

  const handleMulliganSelect = useCallback((targetCardId: string) => {
    if (!sessionRef.current) return
    const lastDiscardedId = sessionRef.current.lastDiscardedQuest?.questId
    if (!lastDiscardedId) {
      setMulliganPending(false)
      return
    }

    getQuests(sessionRef.current.deckId).then(allQuests => {
      const recoveredQuest = allQuests.find(q => q.id === lastDiscardedId)
      if (!recoveredQuest) {
        setMulliganPending(false)
        return
      }
      const mulliganCard = handRef.current.find(
        c => c.type === 'powerup' && (c as HandPowerupCard).powerupKey === 'mulligan'
      )
      const mulliganId = mulliganCard?.id

      setHand(prev => {
        // Remove mulligan card, replace target with recovered discard
        const working = prev
          .map(c => c.id === targetCardId ? { ...recoveredQuest, flipped: false, type: 'quest' as const } : c)
          .filter(c => c.id !== mulliganId)

        // H3 — pick a replacement from pool for the freed mulligan slot
        const currentPool = poolRef.current
        const poolForPick = currentPool.filter(q => !working.some(h => h.id === q.id))
        const replacement = pickWeighted(poolForPick, weightsRef.current)
        if (replacement) {
          const newPool = poolForPick.filter(q => q.id !== replacement.id)
          poolRef.current = newPool
          const newWeights = { ...weightsRef.current }
          delete newWeights[replacement.id]
          weightsRef.current = newWeights
          working.push({ ...replacement, flipped: false, type: 'quest' as const })
        }

        return working
      })
      setMulliganPending(false)
    })
  }, [])

  const cancelMulligan = useCallback(() => {
    setMulliganPending(false)
  }, [])

  const discardQuest = useCallback((cardId: string) => {
    const card = hand.find(c => c.id === cardId)
    if (!card) return

    if (card.type === 'powerup') {
      return
    }

    setStreak(0)
    if (doubleDownRef.current) {
      setDoubleDownActive(false)
    }

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
      const updated: Session = {
        ...sessionRef.current,
        discardedQuestIds: [...(sessionRef.current.discardedQuestIds ?? []), cardId],
        streak: 0,
        lastDiscardedQuest: {
          questId: cardId,
          title: card.title,
          value: card.value,
          emoji: card.emoji,
          completedAt: Date.now(),
        },
      }
      sessionRef.current = updated
      persistSession(updated)
    }

    replaceCardSync(cardId)
  }, [hand, replaceCardSync, persistSession, gameSettings])

  const flipCard = useCallback((cardId: string) => {
    setHand(prev => prev.map(c => c.id === cardId ? { ...c, flipped: !c.flipped } : c))
  }, [])

  const activateStreakPowerup = useCallback((key: StreakPowerup) => {
    if (key === 'doubleDown') {
      setDoubleDownActive(true)
    } else     if (key === 'freezeTime') {
      setTimeFrozen(true)
      setTimeFrozenUntil(Date.now() + 300000)
    } else if (key === 'freshDraw') {
      const idsToReplace = handRef.current.filter(c => c.type !== 'powerup').map(c => c.id)
      const currentPool = poolRef.current
      const shuffledPool = [...currentPool].sort(() => Math.random() - 0.5)
      const replacements = shuffledPool.slice(0, idsToReplace.length)
      const newPoolArr = shuffledPool.slice(replacements.length)

      setHand(prev => {
        const replaceIds = new Set(idsToReplace)
        const iter = replacements[Symbol.iterator]()
        return prev.map(c => {
          if (replaceIds.has(c.id)) {
            const next = iter.next().value
            if (!next) return c
            return { ...next, flipped: false, type: 'quest' as const }
          }
          return c
        })
      })
      poolRef.current = newPoolArr as Quest[]
      setPool(newPoolArr as Quest[])
    }
    setPowerupCooldowns(prev => ({ ...prev, [key]: streak }))
  }, [streak])

  const addFrozenCompensation = useCallback((ms: number) => {
    setFrozenTimeCompensationMs(prev => prev + ms)
  }, [])

  const thawTime = useCallback(() => {
    setTimeFrozen(false)
    setTimeFrozenUntil(null)
  }, [])

  const canUseStreakPowerup = useCallback((key: StreakPowerup): boolean => {
    const def = STREAK_POWERUPS.find(s => s.key === key)!
    if (streak < def.unlockStreak) return false
    const usedAt = powerupCooldowns[key]
    if (usedAt === undefined) return true
    return streak >= usedAt + def.rechargeCount
  }, [streak, powerupCooldowns])

  const saveTimer = useCallback(async (elapsedSeconds: number) => {
    if (sessionRef.current) {
      sessionRef.current = { ...sessionRef.current, elapsedSeconds }
      await persistSession(sessionRef.current)
    }
  }, [persistSession])

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

      setHand(availableQuests.slice(0, HAND_SIZE).map(q => ({ ...q, flipped: false, type: 'quest' as const })))
      setPool(availableQuests.slice(HAND_SIZE))
      setScore(existing.currentScore)
      setCompletedEntries(existing.completedQuests)
      setDrawnIds(
        [...completedSet, ...discardedSet].filter(Boolean)
      )
      setDrawCycle(existing.drawCycle ?? 0)
      setTotalQuests(allQuests.length)
      setGameSettings(existing.gameSettings ?? settings ?? null)

      setStreak(existing.streak ?? 0)
      setPowerupCooldowns(existing.powerupCooldowns ?? {})
      setDoubleDownActive(existing.doubleDownActive ?? false)
      setTimeFrozen(existing.timeFrozen ?? false)
      setTimeFrozenUntil(existing.timeFrozenUntil ?? null)
      usedPowerupKeysRef.current = new Set((existing.usedPowerupCardIds ?? []).filter((k): k is PowerupCardType => POWERUP_CARDS.some(p => p.key === k)))
      setStarBoostedCardIds(new Set(existing.starBoostedIds ?? []))
      setMulliganPending(false)

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
    setGameOver(false)
    setStreak(0)
    setPowerupCooldowns({})
    setDoubleDownActive(false)
    setTimeFrozen(false)
    setTimeFrozenUntil(null)
    setStarBoostedCardIds(new Set())
    setMulliganPending(false)
    usedPowerupKeysRef.current = new Set()
    setFrozenTimeCompensationMs(0)

    const shuffled = [...allQuests].sort(() => Math.random() - 0.5)
    const dealt = shuffled.slice(0, Math.min(HAND_SIZE, shuffled.length))
    const remaining = shuffled.slice(Math.min(HAND_SIZE, shuffled.length))

    setHand(dealt.map(q => ({ ...q, flipped: false, type: 'quest' as const })))
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
    return newSession
  }, [])

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
    setWeights({})
    setDrawnIds([])
    setDrawCycle(0)
    setGameOver(false)
    setGameSettings(null)
    setStreak(0)
    setPowerupCooldowns({})
    setDoubleDownActive(false)
    setTimeFrozen(false)
    setTimeFrozenUntil(null)
    setStarBoostedCardIds(new Set())
    setMulliganPending(false)
    usedPowerupKeysRef.current = new Set()
    setFrozenTimeCompensationMs(0)
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
    streak,
    powerupCooldowns,
    doubleDownActive,
    timeFrozen,
    timeFrozenUntil,
    starBoostedCardIds,
    mulliganPending,
    frozenTimeCompensationMs,
    activateStreakPowerup,
    addFrozenCompensation,
    thawTime,
    canUseStreakPowerup,
    handleMulliganSelect,
    cancelMulligan,
  }
}
