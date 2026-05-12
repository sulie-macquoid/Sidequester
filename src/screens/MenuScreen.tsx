import { useState } from 'react'
import { motion } from 'motion/react'
import { Settings } from 'lucide-react'
import SettingsSheet from '../components/SettingsSheet'

interface Props {
  onPlay: () => void
  onEdit: () => void
}

export default function MenuScreen({ onPlay, onEdit }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <img src={`${import.meta.env.BASE_URL}cattt.webp`} alt="Sully" className="w-auto h-32 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>
            Sully's Sidequests
          </h1>
        </motion.div>

        <div className="w-full max-w-xs space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="w-full py-4 rounded-2xl font-semibold text-lg shadow-lg"
            style={{ backgroundColor: '#54A0FF', color: 'white' }}
          >
            PLAY
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="w-full py-4 rounded-2xl font-semibold text-lg"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            EDIT
          </motion.button>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute bottom-8 right-6 p-3 rounded-full"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={24} />
        </button>
      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
