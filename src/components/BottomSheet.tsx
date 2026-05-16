import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function BottomSheet({ open, onClose, title, children, footer }: Props) {
  const [viewportHeight, setViewportHeight] = useState<number>(window.visualViewport?.height ?? window.innerHeight)

  useEffect(() => {
    if (!open) return
    const handler = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight)
    }
    window.visualViewport?.addEventListener('resize', handler)
    return () => window.visualViewport?.removeEventListener('resize', handler)
  }, [open])

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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[85vh] flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)', maxHeight: `${Math.min(viewportHeight * 0.85, 85)}vh` }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t shrink-0 flex gap-3" style={{ borderColor: 'var(--border)' }}>
            {footer}
          </div>
        )}
      </motion.div>
    </>
  )
}
