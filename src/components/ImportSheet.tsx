import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Deck, ParsedQuestRow } from '../types'
import { POWERUP_CARDS } from '../types'
import EmojiPicker from './EmojiPicker'
import ColorSwatches from './ColorSwatches'
import { useDecks } from '../hooks/useDecks'

interface Props {
  open: boolean
  rows: ParsedQuestRow[]
  decks: Deck[]
  defaultDeckId?: string
  enabledPowerups?: string[]
  onClose: () => void
  onImported: () => void
}

export default function ImportSheet({ open, rows, decks, defaultDeckId, enabledPowerups, onClose, onImported }: Props) {
  const { createDeck, batchCreateQuests, updateDeck } = useDecks()

  const [target, setTarget] = useState<'new' | string>(defaultDeckId ?? 'new')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('Ready to play')
  const [newEmoji, setNewEmoji] = useState('📋')
  const [newColor, setNewColor] = useState('#636E72')
  const [importing, setImporting] = useState(false)

  const isNewDeck = target === 'new'
  const canImport = isNewDeck ? newName.trim().length > 0 : true

  const handleImport = useCallback(async () => {
    if (!canImport || importing) return
    setImporting(true)

    try {
      if (isNewDeck) {
        const deck = await createDeck({
          name: newName.trim(),
          description: newDesc.trim(),
          emoji: newEmoji,
          color: newColor,
          activePowerups: enabledPowerups ?? POWERUP_CARDS.map(p => p.key),
        })
        await batchCreateQuests(deck.id, rows)
      } else {
        if (enabledPowerups) {
          await updateDeck(target, { activePowerups: enabledPowerups })
        }
        await batchCreateQuests(target, rows)
      }
      onImported()
    } finally {
      setImporting(false)
    }
  }, [canImport, importing, isNewDeck, createDeck, newName, newDesc, newEmoji, newColor, batchCreateQuests, target, rows, onImported])

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
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            📥 Import {rows.length} Quest{rows.length !== 1 ? 's' : ''}
          </h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-lg space-y-1.5" style={{ backgroundColor: 'var(--bg)' }}>
            {rows.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <span>{r.emoji}</span>
                <span className="truncate flex-1">{r.title}</span>
                <span className="text-xs shrink-0" style={{ color: '#FECA57' }}>★{r.value}</span>
              </div>
            ))}
            {rows.length > 5 && (
              <div className="text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
                ...and {rows.length - 5} more
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Import into...</label>
            <div className="space-y-1">
              {!defaultDeckId && (
                <label
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isNewDeck ? 'outline-2 outline-[#54A0FF] outline' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg)',
                }}
                >
                  <input
                    type="radio"
                    name="importTarget"
                    checked={isNewDeck}
                    onChange={() => setTarget('new')}
                    className="accent-[#54A0FF]"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      ✨ New Deck...
                    </span>
                    {isNewDeck && (
                      <div className="mt-2 space-y-2">
                          <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Deck name"
                          className="w-full px-3 py-2 rounded-lg outline-none"
                          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '16px' }}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Ready to play"
                          className="w-full px-3 py-2 rounded-lg outline-none"
                          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '16px' }}
                        />
                        <EmojiPicker selected={newEmoji} onSelect={setNewEmoji} />
                        <ColorSwatches selected={newColor} onSelect={setNewColor} />
                      </div>
                    )}
                  </div>
                </label>
              )}

              {(defaultDeckId ? decks : decks.filter(d => d.id !== defaultDeckId)).map((deck) => (
                <label
                  key={deck.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  target === deck.id && !isNewDeck ? 'outline-2 outline-[#54A0FF] outline' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg)',
                }}
                >
                  <input
                    type="radio"
                    name="importTarget"
                    checked={target === deck.id}
                    onChange={() => setTarget(deck.id)}
                    className="accent-[#54A0FF]"
                  />
                  <span className="text-lg">{deck.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{deck.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t shrink-0 flex gap-3 min-h-[52px]" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px]"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport || importing}
            className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50 min-h-[44px]"
            style={{ backgroundColor: '#54A0FF', color: 'white' }}
          >
            {importing ? 'Importing...' : `Import ${rows.length} Quest${rows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </motion.div>
    </>
  )
}
