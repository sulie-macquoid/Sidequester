import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X, Trash2, Copy } from 'lucide-react'
import { getErrorLog, clearErrorLog } from '../db/stores'
import type { ErrorLogEntry } from '../types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DebugSheet({ open, onClose }: Props) {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([])

  useEffect(() => {
    if (open) {
      getErrorLog().then(setErrors)
    }
  }, [open])

  const handleClear = async () => {
    await clearErrorLog()
    setErrors([])
  }

  const handleCopy = () => {
    const text = errors.map((e) =>
      `[${new Date(e.timestamp).toISOString()}] [${e.view}] ${e.message}\n${e.stack}`
    ).join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
  }

  if (!open) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[70vh] flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Debug — Error Log</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
          >
            <Trash2 size={14} /> Clear
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
          >
            <Copy size={14} /> Copy
          </button>
          <div className="text-xs ml-auto self-center" style={{ color: 'var(--text-secondary)' }}>
            {errors.length} entries
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {errors.length === 0 && (
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>No errors logged</p>
          )}
          {errors.map((e, i) => (
            <div
              key={e.id ?? i}
              className="p-3 rounded-lg text-xs font-mono"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <div className="flex justify-between mb-1">
                <span style={{ color: '#FF6B6B' }}>{e.message}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                view: {e.view}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
