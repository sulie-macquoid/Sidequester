import { motion } from 'motion/react'

interface Props {
  emoji: string
  title: string
  value: number
  color: string
  index: number
  flipped: boolean
  onFlip: () => void
}

export default function CardBack({ emoji, title, value, color, index, flipped, onFlip }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      onClick={flipped ? undefined : onFlip}
      className="rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer relative overflow-hidden active:scale-[0.97] transition-transform"
      style={{
        backgroundColor: 'var(--surface)',
        aspectRatio: '3/4',
      }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <span className="text-2xl">{emoji}</span>
      </div>

      <div className="text-xs font-semibold text-center leading-tight max-w-full px-1 line-clamp-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </div>

      <div
        className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ backgroundColor: color, color: 'white' }}
      >
        ★{value}
      </div>
    </motion.div>
  )
}
