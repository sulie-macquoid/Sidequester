import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Deck } from '../types'
import { POWERUP_CARDS } from '../types'

interface Props {
  open: boolean
  deck: Deck | null
  onClose: () => void
  onUpdate: (deckId: string, activePowerups: string[]) => void
}

const ALL_POWERUP_KEYS = POWERUP_CARDS.map(p => p.key)

export default function PowerupToggleSheet({ open, deck, onClose, onUpdate }: Props) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(ALL_POWERUP_KEYS))

  useEffect(() => {
    if (deck) {
      setEnabled(new Set(deck.activePowerups ?? ALL_POWERUP_KEYS))
    }
  }, [deck])

  if (!open || !deck) return null

  const toggle = (key: string) => {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleSave = () => {
    onUpdate(deck.id, [...enabled])
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose() }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            ⚡ Active Powerup Cards
          </h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Choose which powerup cards may appear during gameplay (5% draw chance each slot replacement).
          </p>
          {POWERUP_CARDS.map(pc => (
            <label
              key={pc.key}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
              style={{ backgroundColor: enabled.has(pc.key) ? 'rgba(155,89,182,0.1)' : 'var(--bg)' }}
            >
              <div
                onClick={() => toggle(pc.key)}
                className="w-10 h-6 rounded-full relative transition-colors shrink-0"
                style={{ backgroundColor: enabled.has(pc.key) ? '#9B59B6' : 'var(--border)' }}
              >
                <div
                  className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    transform: enabled.has(pc.key) ? 'translateX(20px)' : 'translateX(4px)',
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pc.emoji}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {pc.label}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {pc.description}
                    </div>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t shrink-0 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-medium min-h-[44px]"
            style={{ backgroundColor: '#9B59B6', color: 'white' }}
          >
            Save Powerup Settings
          </button>
        </div>
      </motion.div>
    </>
  )
}
