import { motion } from 'motion/react'
import { RotateCcw, Home, Clock, Star, CheckCircle, Share2 } from 'lucide-react'
import { formatTime } from '../utils/formatters'

interface Props {
  stats: {
    score: number
    completedCount: number
    elapsedSeconds: number
    totalQuests: number
  }
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export default function DeckCompleteScreen({ stats, onPlayAgain, onBackToMenu }: Props) {
  const handleShare = async () => {
    const text = `Sully's Sidequests\n\nScore: ${stats.score}\nCompleted: ${stats.completedCount}/${stats.totalQuests}\nTime: ${formatTime(stats.elapsedSeconds)}\n\nPlay at: ${window.location.origin}/Sidequester/`
    if (navigator.share) {
      try { await navigator.share({ title: "Sully's Sidequests", text }) } catch {}
    }
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-7xl mb-6"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Deck Complete!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xs space-y-3 mb-8"
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <Star size={20} style={{ color: '#FECA57' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Score</span>
          <span className="ml-auto font-bold text-lg" style={{ color: '#FECA57' }}>{stats.score}</span>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <CheckCircle size={20} style={{ color: '#2ED573' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</span>
          <span className="ml-auto font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.completedCount}/{stats.totalQuests}</span>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <Clock size={20} style={{ color: '#54A0FF' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Playtime</span>
          <span className="ml-auto font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{formatTime(stats.elapsedSeconds)}</span>
        </div>
      </motion.div>

      <div className="w-full max-w-xs space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg min-h-[60px]"
          style={{ backgroundColor: '#54A0FF', color: 'white' }}
        >
          <RotateCcw size={18} />
          Play Again
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 min-h-[60px]"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
        >
          <Share2 size={18} />
          Share Score
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToMenu}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 min-h-[60px]"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
        >
          <Home size={18} />
          Back to Menu
        </motion.button>
      </div>
    </div>
  )
}
