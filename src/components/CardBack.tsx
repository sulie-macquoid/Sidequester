import { motion } from 'motion/react'

interface Props {
  emoji: string
  title: string
  value: number
  color: string
  index: number
  flipped: boolean
  onFlip: () => void
  isPowerup?: boolean
  showDoubleDownBadge?: boolean
  displayValue?: number
}

export default function CardBack({ emoji, title, value, color, index, flipped, onFlip, isPowerup, showDoubleDownBadge, displayValue }: Props) {
  const shownValue = displayValue ?? value

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      onClick={flipped ? undefined : onFlip}
      className="rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer relative overflow-hidden active:scale-[0.97] transition-transform"
      style={{
        backgroundColor: isPowerup ? '#2D1B4E' : 'var(--surface)',
        aspectRatio: '3/4',
      }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: isPowerup ? '#9B59B6' : color }}
      />

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <span className="text-2xl">{emoji}</span>
      </div>

      <div className="text-xs font-semibold text-center leading-tight max-w-full px-1 line-clamp-3" style={{ color: isPowerup ? 'white' : 'var(--text-primary)' }}>
        {title}
      </div>

      <div className="flex items-center gap-1 mt-2">
        {isPowerup ? (
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: '#9B59B6', color: 'white' }}
          >
            ⚡
          </div>
        ) : (
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {showDoubleDownBadge ? (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                2×
              </motion.span>
            ) : (
              <>★{shownValue}</>
            )}
          </div>
        )}
      </div>

      {isPowerup && (
        <div className="absolute bottom-1.5 left-0 right-0 text-center">
          <span className="text-[8px] font-medium" style={{ color: 'rgba(212,165,255,0.7)' }}>
            Powerup
          </span>
        </div>
      )}
    </motion.div>
  )
}
