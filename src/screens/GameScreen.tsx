import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useGame } from '../hooks/useGame'
import { useTimer } from '../hooks/useTimer'
import { formatTime, triggerHaptic } from '../utils/formatters'
import type { GameSettings, HandPowerupCard } from '../types'
import CardBack from '../components/CardBack'
import CardFront from '../components/CardFront'
import PowerupCardFace from '../components/PowerupCardFace'
import StreakButton from '../components/StreakButton'
import CompletedPopup from '../components/CompletedPopup'
import BottomSheet from '../components/BottomSheet'

interface GameStats {
  score: number
  completedCount: number
  elapsedSeconds: number
  totalQuests: number
  timeLimitSeconds?: number
}

interface Props {
  deckId: string
  gameSettings: GameSettings | null
  onComplete: (stats: GameStats) => void
  onBack: () => void
}

function SwipeableCard({
  cardId, onDragUpdate, onDragEnd, children,
}: {
  cardId: string
  onDragUpdate: (x: number) => void
  onDragEnd: (info: PanInfo, cardId: string) => void
  children: React.ReactNode
}) {
  const dragX = useMotionValue(0)
  const dragRotate = useTransform(dragX, [-300, 0, 300], [-15, 0, 15])
  const wasDragged = useRef(false)

  return (
    <motion.div
      drag="x"
      dragElastic={0.6}
      dragSnapToOrigin
      dragMomentum={false}
      style={{ x: dragX, rotate: dragRotate, width: '100%', height: '100%' }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 10) wasDragged.current = true
        onDragUpdate(info.offset.x)
      }}
      onDragEnd={(_, info) => {
        wasDragged.current = true
        onDragEnd(info, cardId)
      }}
    >
      {React.cloneElement(children as React.ReactElement<any>, { dragging: wasDragged.current })}
    </motion.div>
  )
}

export default function GameScreen({ deckId, gameSettings, onComplete, onBack }: Props) {
  const game = useGame()
  const timer = useTimer()
  const [showCompleted, setShowCompleted] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSettingsAfterReset, setShowSettingsAfterReset] = useState(false)
  const [started, setStarted] = useState(false)
  const [scoreAnim, setScoreAnim] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [resetTimeEnabled, setResetTimeEnabled] = useState(false)
  const [resetTimeInput, setResetTimeInput] = useState('30')
  const [resetPermanentDiscard, setResetPermanentDiscard] = useState(false)
  const [freezeStartedAt, setFreezeStartedAt] = useState<number | null>(null)
  const [freezeSavedElapsed, setFreezeSavedElapsed] = useState(0)
  const [mulliganSelecting, setMulliganSelecting] = useState(false)
  const timerRef = useRef(timer)
  timerRef.current = timer
  const startedRef = useRef(false)
  const gameOverHandled = useRef(false)

  const streakEnabled = gameSettings?.streakEnabled ?? true

  useEffect(() => {
    game.startGame(deckId, gameSettings ?? undefined)
    timer.reset()
  }, [deckId])

  useEffect(() => {
    if (game.session && !started) {
      setStarted(true)
      startedRef.current = true
      if (game.gameSettings?.timeConstraintEnabled && game.session.startedAt) {
        const endTime = game.session.startedAt + game.gameSettings.timeLimitSeconds * 1000
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        const elapsed = game.gameSettings.timeLimitSeconds - remaining
        timer.setElapsed(Math.max(elapsed, 0))
      } else {
        timer.setElapsed(game.session.elapsedSeconds)
      }
      timer.start()
    }
  }, [game.session])

  useEffect(() => {
    if (game.gameOver && started && !gameOverHandled.current) {
      gameOverHandled.current = true
      timer.pause()
      game.endGame()
      const timeout = setTimeout(() => onComplete({
        score: game.score,
        completedCount: game.completedEntries.length,
        elapsedSeconds: timer.elapsed,
        totalQuests: game.totalQuests,
        timeLimitSeconds: game.gameSettings?.timeConstraintEnabled ? game.gameSettings.timeLimitSeconds : undefined,
      }), 600)
      return () => clearTimeout(timeout)
    }
    if (!game.gameOver) {
      gameOverHandled.current = false
    }
  }, [game.gameOver])

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current.running) {
        game.saveTimer(timerRef.current.elapsed)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!game.gameSettings?.timeConstraintEnabled || !game.session?.startedAt || !started) return
    const rawEndTime = game.session.startedAt + game.gameSettings.timeLimitSeconds * 1000
    const check = setInterval(() => {
      const compensation = game.frozenTimeCompensationMs || 0
      const effectiveEndTime = rawEndTime + compensation
      const remaining = Math.floor((effectiveEndTime - Date.now()) / 1000)
      if (remaining <= 0) {
        if (!game.gameOver) {
          timer.pause()
          game.endGame()
        }
      }
    }, 1000)
    return () => clearInterval(check)
  }, [game.gameSettings?.timeConstraintEnabled, game.session?.startedAt, started, game.gameOver, game.frozenTimeCompensationMs])

  useEffect(() => {
    if (game.timeFrozen && !freezeStartedAt) {
      timer.pause()
      setFreezeSavedElapsed(timer.elapsed)
      setFreezeStartedAt(Date.now())
    }
    if (!game.timeFrozen && freezeStartedAt) {
      setFreezeStartedAt(null)
    }
  }, [game.timeFrozen])

  useEffect(() => {
    if (!freezeStartedAt) return
    const startedAt = freezeStartedAt
    const interval = setInterval(() => {
      if (Date.now() - startedAt >= 300000) {
        game.thawTime()
        if (game.gameSettings?.timeConstraintEnabled) {
          timer.start()
        } else {
          timer.setElapsed(freezeSavedElapsed)
          timer.start()
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [freezeStartedAt])

  const triggerScoreAnim = () => {
    setScoreAnim(true)
    setTimeout(() => setScoreAnim(false), 200)
  }

  const handleComplete = (cardId: string) => {
    game.completeQuest(cardId)
    triggerScoreAnim()
    setExpandedCardId(null)
    triggerHaptic()
  }

  const handleDiscard = (cardId: string) => {
    game.discardQuest(cardId)
    setExpandedCardId(null)
    triggerHaptic()
  }

  const handlePowerupActivate = (cardId: string) => {
    const card = game.hand.find(c => c.id === cardId)
    if (card?.type === 'powerup' && (card as HandPowerupCard).powerupKey === 'mulligan') {
      setMulliganSelecting(true)
      game.completeQuest(cardId)
      setExpandedCardId(null)
      return
    }
    game.completeQuest(cardId)
    setExpandedCardId(null)
    triggerHaptic()
  }

  const SWIPE_THRESHOLD = 80

  const handleDragEnd = (_: any, info: PanInfo, cardId: string) => {
    setDragX(0)
    const card = game.hand.find(c => c.id === cardId)
    if (!card) return

    if (card.type === 'powerup') {
      if (info.offset.x > SWIPE_THRESHOLD) {
        handlePowerupActivate(cardId)
      }
      return
    }

    if (info.offset.x > SWIPE_THRESHOLD) {
      handleComplete(cardId)
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleDiscard(cardId)
    }
  }

  const handleCardClick = (cardId: string) => {
    setExpandedCardId(cardId)
  }

  const handleCollapse = () => {
    setExpandedCardId(null)
  }

  const handleMulliganTap = (targetCardId: string) => {
    game.handleMulliganSelect(targetCardId)
    setMulliganSelecting(false)
    setExpandedCardId(null)
  }

  const handleMulliganCancel = () => {
    setMulliganSelecting(false)
    game.cancelMulligan()
  }

  const handleResetConfirm = () => {
    game.resetGame()
    timer.reset()
    setShowResetConfirm(false)
    setStarted(false)
    startedRef.current = false
    setExpandedCardId(null)
    setResetTimeEnabled(game.gameSettings?.timeConstraintEnabled ?? false)
    setResetTimeInput(String(Math.floor(game.gameSettings?.timeLimitSeconds ?? 1800) / 60))
    setResetPermanentDiscard(game.gameSettings?.permanentDiscard ?? false)
    setFreezeStartedAt(null)
    setShowSettingsAfterReset(true)
  }

  const handleApplySettings = () => {
    const newSettings: GameSettings = {
      timeConstraintEnabled: resetTimeEnabled,
      timeLimitSeconds: (parseInt(resetTimeInput, 10) || 30) * 60,
      permanentDiscard: resetPermanentDiscard,
      streakEnabled: game.gameSettings?.streakEnabled ?? true,
    }
    game.startGame(deckId, newSettings)
    setShowSettingsAfterReset(false)
  }

  const completedCount = game.completedEntries.length
  const expandedCard = expandedCardId ? game.hand.find(c => c.id === expandedCardId) : null

  const isTimeConstraint = game.gameSettings?.timeConstraintEnabled && game.session?.startedAt
  const rawEndTimeMs = isTimeConstraint
    ? game.session!.startedAt + game.gameSettings!.timeLimitSeconds * 1000
    : 0
  const effectiveEndTimeMs = isTimeConstraint
    ? rawEndTimeMs + (game.frozenTimeCompensationMs || 0)
    : 0
  const remainingSeconds = isTimeConstraint
    ? Math.max(0, Math.floor((effectiveEndTimeMs - Date.now()) / 1000))
    : 0

  const freezeRemainingMs = freezeStartedAt
    ? Math.max(0, 300000 - (Date.now() - freezeStartedAt))
    : 0
  const freezeRemainingSecs = Math.ceil(freezeRemainingMs / 1000)

  const GLOW_THRESHOLD = 80

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 min-h-[52px]" style={{ backgroundColor: 'var(--bezel)' }}>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
            <ArrowLeft size={20} />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {freezeStartedAt && (
            <motion.span
              className="font-bold text-sm font-mono"
              style={{ color: '#54A0FF' }}
              animate={{
                textShadow: ['0 0 4px rgba(84,160,255,0.3)', '0 0 12px rgba(0,255,255,0.6)', '0 0 4px rgba(84,160,255,0.3)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ❄️ {formatTime(freezeRemainingSecs)}
            </motion.span>
          )}
          <motion.span
            animate={scoreAnim ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="font-bold text-sm"
            style={{ color: '#FECA57' }}
          >
            {game.score}
          </motion.span>
          <span style={{ color: 'var(--text-secondary)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {completedCount}/{game.totalQuests}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {game.totalQuests - completedCount} left
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span
            className="font-mono"
            style={{ color: isTimeConstraint && remainingSeconds <= 60 ? '#DC143C' : 'var(--text-primary)' }}
          >
            {isTimeConstraint ? formatTime(remainingSeconds) : formatTime(timer.elapsed)}
          </span>
        </div>
      </div>

      {mulliganSelecting && (
        <motion.div
          className="fixed inset-0 z-30 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleMulliganCancel}
        >
          <div className="text-center px-6" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-medium mb-3" style={{ color: 'white' }}>
              Tap a card to swap with the recovered discard
            </p>
            <button
              onClick={handleMulliganCancel}
              className="px-4 py-2 rounded-lg text-xs min-h-[44px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col px-4 py-4 relative overflow-y-auto">
        <div
          className="fixed top-0 bottom-0 left-0 w-2 z-50 pointer-events-none transition-opacity duration-150"
          style={{
            background: 'linear-gradient(to right, rgba(220,20,60,0.5), transparent)',
            opacity: dragX < -10 ? Math.min(1, Math.abs(dragX) / GLOW_THRESHOLD) : 0,
          }}
        />
        <div
          className="fixed top-0 bottom-0 right-0 w-2 z-50 pointer-events-none transition-opacity duration-150"
          style={{
            background: 'linear-gradient(to left, rgba(46,213,115,0.5), transparent)',
            opacity: dragX > 10 ? Math.min(1, dragX / GLOW_THRESHOLD) : 0,
          }}
        />

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
          {game.hand.map(card => {
            const isExpanded = expandedCardId === card.id
            return (
              <motion.div
                key={card.id}
                layout="position"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.8 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative"
                style={{ aspectRatio: '3/4', pointerEvents: isExpanded ? 'none' : 'auto' }}
              >
                <div style={{ opacity: isExpanded ? 0 : 1 }}>
                  {mulliganSelecting && card.type !== 'powerup' ? (
                    <motion.div
                      className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: 'rgba(84,160,255,0.3)' }}
                      onClick={() => handleMulliganTap(card.id)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-xs font-bold" style={{ color: 'white' }}>TAP TO<br />SWAP</span>
                    </motion.div>
                  ) : null}
                  <CardBack
                    emoji={card.emoji}
                    title={card.title}
                    value={card.value}
                    color={card.color}
                    index={game.hand.indexOf(card as any)}
                    flipped={false}
                    onFlip={() => handleCardClick(card.id)}
                    isPowerup={card.type === 'powerup'}
                    showDoubleDownBadge={game.doubleDownActive && card.type !== 'powerup'}
                    displayValue={game.starBoostedCardIds.has(card.id) ? card.value + 50 : undefined}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence>
          {expandedCard && (
            <motion.div
              key="card-overlay"
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
              onClick={handleCollapse}
            >
              <motion.div
                className="w-[85vw] max-w-sm"
                style={{ aspectRatio: '3/4' }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
              >
                {expandedCard.type === 'powerup' ? (
                  <SwipeableCard
                    cardId={expandedCard.id}
                    onDragUpdate={setDragX}
                    onDragEnd={(info, id) => handleDragEnd(undefined, info, id)}
                  >
                    <PowerupCardFace
                      powerupKey={(expandedCard as HandPowerupCard).powerupKey}
                      value={expandedCard.value}
                      onActivate={() => handlePowerupActivate(expandedCard.id)}
                    />
                  </SwipeableCard>
                ) : (
                  <SwipeableCard
                    cardId={expandedCard.id}
                    onDragUpdate={setDragX}
                    onDragEnd={(info, id) => handleDragEnd(undefined, info, id)}
                  >
                    <CardFront
                      emoji={expandedCard.emoji}
                      title={expandedCard.title}
                      description={expandedCard.description}
                      value={expandedCard.value}
                      color={expandedCard.color}
                      onFlip={handleCollapse}
                      displayValue={game.starBoostedCardIds.has(expandedCard.id) ? expandedCard.value + 50 : undefined}
                      showDoubleDownBadge={game.doubleDownActive}
                    />
                  </SwipeableCard>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {game.hand.length === 0 && game.totalQuests === 0 && (
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This deck is empty. Add some quests!</p>
          </div>
        )}
      </div>

      {streakEnabled && !freezeStartedAt && (
        <div className="flex justify-center gap-2 px-4 pb-2">
          {game.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ backgroundColor: 'var(--surface)', color: '#54A0FF' }}>
              🔥 {game.streak}
            </div>
          )}
        </div>
      )}

      {streakEnabled && !freezeStartedAt && (
        <div className="flex justify-center gap-2 px-4 pb-3">
          {([{ key: 'doubleDown' as const }, { key: 'freezeTime' as const }, { key: 'freshDraw' as const }] as const).map(({ key }) => (
            <StreakButton
              key={key}
              powerupKey={key}
              streak={game.streak}
              canUse={game.canUseStreakPowerup(key)}
              usedAt={game.powerupCooldowns[key]}
              onActivate={() => game.activateStreakPowerup(key)}
            />
          ))}
        </div>
      )}

      <div className="px-4 pb-6 pt-1 flex justify-center gap-3">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-medium min-h-[44px]"
          style={{ backgroundColor: 'rgba(220,20,60,0.15)', color: '#DC143C' }}
        >
          <RotateCcw size={14} className="inline mr-1" />
          Reset Deck
        </button>
        <button
          onClick={() => setShowCompleted(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-medium min-h-[44px]"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
        >
          Show Completed ({completedCount})
        </button>
      </div>

      <BottomSheet
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Deck?"
        footer={
          <>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleResetConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px]"
              style={{ backgroundColor: '#DC143C', color: 'white' }}
            >
              Reset
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          This will reshuffle all cards and reset your score and timer.
        </p>
      </BottomSheet>

      <BottomSheet
        open={showSettingsAfterReset}
        onClose={() => setShowSettingsAfterReset(false)}
        title="Game Settings"
        footer={
          <button
            onClick={handleApplySettings}
            className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50 min-h-[44px]"
            style={{ backgroundColor: '#54A0FF', color: 'white' }}
          >
            Start Game
          </button>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setResetPermanentDiscard(!resetPermanentDiscard)}
                className="w-10 h-6 rounded-full relative transition-colors shrink-0"
                style={{ backgroundColor: resetPermanentDiscard ? '#54A0FF' : 'var(--bg)' }}
              >
                <div
                  className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    transform: resetPermanentDiscard ? 'translateX(20px)' : 'translateX(4px)',
                  }}
                />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Permanent Discard
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Discarded cards never reappear this session
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setResetTimeEnabled(!resetTimeEnabled)}
                className="w-10 h-6 rounded-full relative transition-colors shrink-0"
                style={{ backgroundColor: resetTimeEnabled ? '#54A0FF' : 'var(--bg)' }}
              >
                <div
                  className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    transform: resetTimeEnabled ? 'translateX(20px)' : 'translateX(4px)',
                  }}
                />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Time Constraint
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Game ends when the timer runs out
                </div>
              </div>
            </label>
            {resetTimeEnabled && (
              <div className="flex items-center gap-2 mt-3 ml-[52px]">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={resetTimeInput}
                  onChange={(e) => setResetTimeInput(e.target.value)}
                  min={1}
                  max={999}
                  className="w-20 px-3 py-2 rounded-lg text-lg font-semibold text-center outline-none"
                  style={{ backgroundColor: 'var(--bg)', color: '#FECA57', fontSize: '16px' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>minutes</span>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      <CompletedPopup
        open={showCompleted}
        entries={game.completedEntries}
        onClose={() => setShowCompleted(false)}
      />
    </div>
  )
}
