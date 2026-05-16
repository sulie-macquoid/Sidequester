import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { Plus } from 'lucide-react'

const DEFAULT_EMOJIS = [
  '🎯', '🍜', '🗣️', '📸', '⛩️', '🚃', '🎮', '🍡', '🏪', '🌸', '☕', '🏃',
  '✈️', '🛍️', '🚶', '🧳', '📰', '🎧', '🍔', '🏙️', '🌧️', '🛫', '🐱', '🎨',
  '📚', '🎵', '🌊', '🏔️', '🔥', '💡', '🔍', '🎁', '🏆', '⭐', '💪', '🧘',
  '🎪', '🎭', '🎤', '🎸', '⚽', '🏀', '🚲', '🏄', '🧗', '🎣', '🦉', '🐺',
]

interface Props {
  selected: string
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ selected, onSelect }: Props) {
  const { settings, updateSettings } = useSettings()
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')

  const disabledEmojis = settings.disabledEmojis || []
  const allEmojis = [...DEFAULT_EMOJIS, ...(settings.customEmojis || [])]
    .filter(e => !disabledEmojis.includes(e))

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed) {
      updateSettings({
        customEmojis: [...(settings.customEmojis || []), trimmed],
      })
      onSelect(trimmed)
      setInput('')
      setAdding(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {allEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all shrink-0 focus:outline-none ${
              selected === emoji ? 'scale-110' : ''
            }`}
            style={{
              backgroundColor: selected === emoji ? '#54A0FF' : 'var(--bg)',
            }}
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-lg shrink-0 border border-dashed focus:outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Plus size={16} />
        </button>
      </div>
      {adding && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste an emoji..."
            className="flex-1 px-3 py-2 rounded-lg outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)', fontSize: '16px' }}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 min-h-[44px]"
            style={{ backgroundColor: '#54A0FF', color: 'white' }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}
