import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { getLatestRelease } from '../data/changelog'

interface Props {
  open: boolean
  onClose: () => void
}

export default function UpdatePopup({ open, onClose }: Props) {
  if (!open) return null

  const latest = getLatestRelease()

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
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: 'var(--surface)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                New Updates
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                v{latest.version} — {latest.label}
              </p>
            </div>
            <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          <ul className="space-y-2 mb-5">
            {latest.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#54A0FF' }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#54A0FF', color: 'white' }}
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}
