import { motion } from 'motion/react'
import type { StreakPowerup } from '../types'
import { STREAK_POWERUPS } from '../types'

interface Props {
  powerupKey: StreakPowerup
  streak: number
  canUse: boolean
  usedAt?: number
  onActivate: () => void
}

export default function StreakButton({ powerupKey, streak, canUse, usedAt, onActivate }: Props) {
  const def = STREAK_POWERUPS.find(s => s.key === powerupKey)!

  const progress = Math.min(1, streak / def.unlockStreak)
  const isLocked = streak < def.unlockStreak
  const isCharged = canUse

  return (
    <motion.button
      whileTap={isCharged ? { scale: 0.92 } : undefined}
      onClick={isCharged ? onActivate : undefined}
      className="relative flex flex-col items-center justify-center gap-1 rounded-xl min-h-[60px] min-w-[60px] px-3 py-2"
      style={{
        backgroundColor: isCharged
          ? 'rgba(84,160,255,0.2)'
          : 'var(--bg)',
        opacity: isLocked ? 0.5 : 1,
        cursor: isCharged ? 'pointer' : 'default',
      }}
    >
      {isCharged && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            border: '1px solid rgba(84,160,255,0.4)',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <span className="text-lg">{def.icon}</span>
      <span
        className="text-[10px] font-semibold text-center leading-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {def.label}
      </span>

      {isLocked && (
        <div className="flex items-center gap-1">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ width: 24, backgroundColor: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: '#54A0FF',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            {streak}/{def.unlockStreak}
          </span>
        </div>
      )}

      {!isLocked && !isCharged && usedAt !== undefined && (
        <span className="text-[9px]" style={{ color: '#54A0FF' }}>
          {streak - usedAt}/{def.rechargeCount}
        </span>
      )}
    </motion.button>
  )
}
