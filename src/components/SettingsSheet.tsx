import { useState } from 'react'
import { motion } from 'motion/react'
import { X, Plus } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import DebugSheet from './DebugSheet'
import ColorSwatches from './ColorSwatches'

const DEFAULT_EMOJIS = [
  '🎯', '🍜', '🗣️', '📸', '⛩️', '🚃', '🎮', '🍡', '🏪', '🌸', '☕', '🏃',
  '✈️', '🛍️', '🚶', '🧳', '📰', '🎧', '🍔', '🏙️', '🌧️', '🛫', '🐱', '🎨',
  '📚', '🎵', '🌊', '🏔️', '🔥', '💡', '🔍', '🎁', '🏆', '⭐', '💪', '🧘',
  '🎪', '🎭', '🎤', '🎸', '⚽', '🏀', '🚲', '🏄', '🧗', '🎣', '🦉', '🐺',
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsSheet({ open, onClose }: Props) {
  const { settings, updateSettings } = useSettings()
  const [debugOpen, setDebugOpen] = useState(false)
  const [emojiInput, setEmojiInput] = useState('')

  const addEmoji = () => {
    const trimmed = emojiInput.trim()
    if (trimmed && !DEFAULT_EMOJIS.includes(trimmed)) {
      updateSettings({
        customEmojis: [...(settings.customEmojis || []), trimmed],
      })
      setEmojiInput('')
    }
  }

  const [removing, setRemoving] = useState<string | null>(null)

  const handleEmojiClick = (emoji: string) => {
    if (removing === emoji) {
      const removed = settings.disabledEmojis || []
      updateSettings({ disabledEmojis: [...removed, emoji] })
      setRemoving(null)
    } else {
      setRemoving(emoji)
    }
  }

  const customEmojis = settings.customEmojis || []
  const removedEmojis = settings.disabledEmojis || []
  const allEmojis = [...DEFAULT_EMOJIS, ...customEmojis].filter(e => !removedEmojis.includes(e))

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
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>v1.3.0</div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>
              Background Color
            </label>
            <ColorSwatches
              selected={settings.backgroundColor}
              onSelect={(color) => {
                if (color === '#0F0F1A') {
                  updateSettings({ backgroundColor: color, theme: 'dark' })
                } else if (color === '#F5F3F0') {
                  updateSettings({ backgroundColor: color, theme: 'light' })
                } else {
                  updateSettings({ backgroundColor: color })
                }
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>
              Theme
            </label>
            <div className="flex gap-2">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    const bgForTheme = t === 'light' ? '#F5F3F0' : '#0F0F1A'
                    updateSettings({ theme: t, backgroundColor: bgForTheme })
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.theme === t ? 'outline-2 outline-[#54A0FF] outline' : ''
                  }`}
                  style={{
                    backgroundColor: settings.theme === t ? '#54A0FF' : 'var(--bg)',
                    color: settings.theme === t ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>
              Emoji Grid ({allEmojis.length}) — tap once to select, again to remove
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={emojiInput}
                onChange={(e) => setEmojiInput(e.target.value)}
                placeholder="Add an emoji..."
                className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => { if (e.key === 'Enter') addEmoji() }}
              />
              <button
                onClick={addEmoji}
                disabled={!emojiInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                style={{ backgroundColor: '#54A0FF', color: 'white' }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
              {allEmojis.map((emoji) => {
                const isSelected = removing === emoji
                return (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(220,20,60,0.25)' : 'var(--surface)',
                      outline: isSelected ? '2px solid #DC143C' : 'none',
                    }}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setDebugOpen(true)}
            className="text-xs font-mono w-full text-center py-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Debug
          </button>
        </div>
      </motion.div>

      <DebugSheet open={debugOpen} onClose={() => setDebugOpen(false)} />
    </>
  )
}
