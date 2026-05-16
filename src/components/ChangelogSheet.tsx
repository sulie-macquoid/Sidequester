import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { CHANGELOG, type ReleaseEntry } from '../data/changelog'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ChangelogSheet({ open, onClose }: Props) {
  if (!open) return null

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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[85vh] flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Release History</h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {CHANGELOG.map((release) => (
            <ReleaseBlock key={release.version} release={release} />
          ))}
          <div className="h-4" />
        </div>
      </motion.div>
    </>
  )
}

function ReleaseBlock({ release }: { release: ReleaseEntry }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          v{release.version}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {release.label}
        </span>
      </div>
      <ul className="space-y-1.5">
        {release.items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
