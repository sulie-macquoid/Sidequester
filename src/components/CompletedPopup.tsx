import { motion } from 'motion/react'
import { X } from 'lucide-react'
import type { CompletedEntry } from '../types'
import { formatDate } from '../utils/formatters'

interface Props {
  open: boolean
  entries: CompletedEntry[]
  onClose: () => void
}

export default function CompletedPopup({ open, entries, onClose }: Props) {
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
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose() }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[70vh] flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Completed ({entries.length})
          </h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {entries.length === 0 && (
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              No quests completed yet
            </p>
          )}

          {entries.map((e, i) => (
            <motion.div
              key={e.questId + e.completedAt}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <span className="text-lg">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{e.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(e.completedAt)}
                </div>
              </div>
              <div className="text-sm font-semibold shrink-0" style={{ color: '#2ED573' }}>+{e.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
