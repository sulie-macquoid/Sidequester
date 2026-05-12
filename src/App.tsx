import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SettingsProvider } from './context/SettingsContext'
import { ThemeProvider } from './components/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { seedIfEmpty } from './db/seed'
import { getActiveSession } from './db/stores'
import { useView } from './hooks/useView'
import { useDecks } from './hooks/useDecks'
import MenuScreen from './screens/MenuScreen'
import DeckSelectScreen from './screens/DeckSelectScreen'
import GameScreen from './screens/GameScreen'
import DeckListScreen from './screens/DeckListScreen'
import DeckDetailScreen from './screens/DeckDetailScreen'
import DeckCompleteScreen from './screens/DeckCompleteScreen'

const pageVariants = {
  forward: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  },
  back: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 60 },
  },
}

interface GameStats {
  score: number
  completedCount: number
  elapsedSeconds: number
  totalQuests: number
}

export default function App() {
  const { view, setView, goBack, viewTransition } = useView()
  const decksHook = useDecks()
  const [gameDeckId, setGameDeckId] = useState<string | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [finalStats, setFinalStats] = useState<GameStats | null>(null)

  useEffect(() => {
    seedIfEmpty()
  }, [])

  const handlePlayDeck = useCallback(async (deckId: string) => {
    await getActiveSession(deckId)
    setGameDeckId(deckId)
    setGameKey(prev => prev + 1)
    setView('game', 'forward')
  }, [setView])

  const handleGameComplete = useCallback((stats: GameStats) => {
    setFinalStats(stats)
    setView('deckComplete', 'forward')
  }, [setView])

  const handlePlayAgain = useCallback(() => {
    if (gameDeckId) {
      setGameKey(prev => prev + 1)
      setView('game', 'forward')
    }
  }, [gameDeckId, setView])

  const variants = pageVariants[viewTransition]

  return (
    <ErrorBoundary currentView={view}>
      <SettingsProvider>
      <ThemeProvider>
        <div className="flex-1 flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
          <AnimatePresence mode="wait">
            {view === 'menu' && (
              <motion.div
                key="menu"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <MenuScreen
                  onPlay={() => setView('deckSelect', 'forward')}
                  onEdit={() => setView('deckList', 'forward')}
                />
              </motion.div>
            )}

            {view === 'deckSelect' && (
              <motion.div
                key="deckSelect"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <DeckSelectScreen
                  decks={decksHook.decks}
                  onSelectDeck={handlePlayDeck}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {view === 'game' && gameDeckId && (
              <motion.div
                key={`game-${gameKey}`}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <GameScreen
                  deckId={gameDeckId}
                  onComplete={handleGameComplete}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {view === 'deckList' && (
              <motion.div
                key="deckList"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <DeckListScreen
                  decks={decksHook.decks}
                  onSelectDeck={(deckId) => {
                    decksHook.loadQuests(deckId)
                    setView('deckDetail', 'forward')
                  }}
                  onCreateDeck={decksHook.createDeck}
                  onUpdateDeck={decksHook.updateDeck}
                  onDeleteDeck={decksHook.removeDeck}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {view === 'deckDetail' && decksHook.selectedDeck && (
              <motion.div
                key="deckDetail"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <DeckDetailScreen
                  deck={decksHook.selectedDeck}
                  quests={decksHook.quests}
                  onCreateQuest={decksHook.createQuest}
                  onUpdateQuest={decksHook.updateQuest}
                  onDeleteQuest={decksHook.removeQuest}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {view === 'deckComplete' && finalStats && (
              <motion.div
                key="deckComplete"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                <DeckCompleteScreen
                  stats={finalStats}
                  onPlayAgain={handlePlayAgain}
                  onBackToMenu={() => setView('menu', 'back')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ThemeProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}
