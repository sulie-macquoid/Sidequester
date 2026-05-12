import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useGame } from '../hooks/useGame'
import { useTimer } from '../hooks/useTimer'
import { formatTime } from '../utils/formatters'
import CardBack from '../components/CardBack'
import CardFront from '../components/CardFront'
import CompletedPopup from '../components/CompletedPopup'
import BottomSheet from '../components/BottomSheet'

interface GameStats {
  score: number
  completedCount: number
  elapsedSeconds: number
  totalQuests: number
}

interface Props {
  deckId: string
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

  return (
    <div className="w-full h-full">
      <motion.div
        drag="x"
        dragElastic={0.7}
        dragSnapToOrigin
        style={{ x: dragX, rotate: dragRotate } as any}
        onDrag={(_, info) => onDragUpdate(info.offset.x)}
        onDragEnd={(_, info) => onDragEnd(info, cardId)}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function GameScreen({ deckId, onComplete, onBack }: Props) {
  const game = useGame()
  const timer = useTimer()
  const [showCompleted, setShowCompleted] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [started, setStarted] = useState(false)
  const [scoreAnim, setScoreAnim] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const timerRef = useRef(timer)
  timerRef.current = timer

  useEffect(() => {
    game.startGame(deckId)
    timer.reset()
  }, [deckId])

  useEffect(() => {
    if (game.session && !started) {
      setStarted(true)
      timer.setElapsed(game.session.elapsedSeconds)
      timer.start()
    }
  }, [game.session])

  useEffect(() => {
    if (game.gameOver && started) {
      timer.pause()
      setTimeout(() => onComplete({
        score: game.score,
        completedCount: game.completedEntries.length,
        elapsedSeconds: timer.elapsed,
        totalQuests: game.totalQuests,
      }), 600)
    }
  }, [game.gameOver])

  useEffect(() => {
    const interval = setInterval(() => {
      game.saveTimer(timerRef.current.elapsed)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const triggerScoreAnim = () => {
    setScoreAnim(true)
    setTimeout(() => setScoreAnim(false), 200)
  }

  const handleComplete = (cardId: string) => {
    game.completeQuest(cardId)
    triggerScoreAnim()
    setExpandedCardId(null)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const handleDiscard = (cardId: string) => {
    game.discardQuest(cardId)
    setExpandedCardId(null)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const handleDragEnd = (_: any, info: PanInfo, cardId: string) => {
    setDragX(0)
    if (info.offset.x > 150) {
      handleComplete(cardId)
    } else if (info.offset.x < -150) {
      handleDiscard(cardId)
    }
  }

  const handleCardClick = (cardId: string) => {
    setExpandedCardId(cardId)
  }

  const handleCollapse = () => {
    setExpandedCardId(null)
  }

  const handleReset = () => {
    game.resetGame()
    timer.reset()
    setShowResetConfirm(false)
    setStarted(false)
    setExpandedCardId(null)
    game.startGame(deckId)
    setTimeout(() => {
      setStarted(true)
      timer.start()
    }, 100)
  }

  const completedCount = game.completedEntries.length
  const expandedCard = expandedCardId ? game.hand.find(c => c.id === expandedCardId) : null

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bezel)' }}>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} style={{ color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </motion.button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <motion.span
            animate={scoreAnim ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="font-bold"
            style={{ color: '#FECA57' }}
          >
            {game.score}
          </motion.span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {completedCount}/{game.totalQuests}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatTime(timer.elapsed)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4 relative overflow-y-auto">
        <div
          className="fixed top-0 bottom-0 left-0 w-2 z-50 pointer-events-none transition-opacity duration-150"
          style={{
            background: 'linear-gradient(to right, rgba(220,20,60,0.5), transparent)',
            opacity: dragX < -20 ? Math.min(1, Math.abs(dragX) / 150) : 0,
          }}
        />
        <div
          className="fixed top-0 bottom-0 right-0 w-2 z-50 pointer-events-none transition-opacity duration-150"
          style={{
            background: 'linear-gradient(to left, rgba(46,213,115,0.5), transparent)',
            opacity: dragX > 20 ? Math.min(1, dragX / 150) : 0,
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
                  <CardBack
                    emoji={card.emoji}
                    title={card.title}
                    value={card.value}
                    color={card.color}
                    index={game.hand.indexOf(card)}
                    flipped={false}
                    onFlip={() => handleCardClick(card.id)}
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
                  />
                </SwipeableCard>
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

      <div className="px-4 pb-6 pt-1 flex justify-center gap-3">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl text-xs font-medium"
          style={{ backgroundColor: 'rgba(220,20,60,0.15)', color: '#DC143C' }}
        >
          <RotateCcw size={14} className="inline mr-1" />
          Reset Deck
        </button>
        <button
          onClick={() => setShowCompleted(true)}
          className="px-4 py-2 rounded-xl text-xs font-medium"
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
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
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

      <CompletedPopup
        open={showCompleted}
        entries={game.completedEntries}
        onClose={() => setShowCompleted(false)}
      />
    </div>
  )
}
