import { useState, useRef, useEffect } from 'react'
import { motion, Reorder } from 'motion/react'
import { Plus, ArrowLeft, Upload, Download, Trash2, Pen, GripVertical } from 'lucide-react'
import type { Deck, ParsedQuestRow } from '../types'
import { parseCSVFile, questsToCSV, downloadCSV } from '../utils/csv'
import { getQuests } from '../db/stores'
import { resolveEmoji } from '../utils/formatters'
import { useSettings } from '../context/SettingsContext'
import BottomSheet from '../components/BottomSheet'
import EmojiPicker from '../components/EmojiPicker'
import ColorSwatches from '../components/ColorSwatches'
import ImportSheet from '../components/ImportSheet'

interface Props {
  decks: Deck[]
  onSelectDeck: (deckId: string) => void
  onCreateDeck: (data: { name: string; description?: string; emoji: string; color: string }) => Promise<Deck>
  onUpdateDeck: (id: string, data: Partial<Deck>) => Promise<void>
  onDeleteDeck: (id: string) => void
  onBack: () => void
}

export default function DeckListScreen({ decks, onSelectDeck, onCreateDeck, onUpdateDeck, onDeleteDeck, onBack }: Props) {
  const { settings, updateSettings } = useSettings()
  const disabledEmojis = settings.disabledEmojis || []
  const deckEmoji = (e: string) => resolveEmoji(e, disabledEmojis)
  const deckOrder = settings.deckOrder || []
  const [createOpen, setCreateOpen] = useState(false)
  const [editDeck, setEditDeck] = useState<Deck | null>(null)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('Ready to play')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newColor, setNewColor] = useState('#54A0FF')
  const [showImportInfo, setShowImportInfo] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<ParsedQuestRow[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const sortDecks = (ds: Deck[]) => [...ds].sort((a, b) => {
    const ai = deckOrder.indexOf(a.id)
    const bi = deckOrder.indexOf(b.id)
    if (ai === -1 && bi === -1) return a.createdAt - b.createdAt
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const [orderedDecks, setOrderedDecks] = useState<Deck[]>(() => sortDecks(decks))
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOrderedDecks(sortDecks(decks))
  }, [decks, deckOrder])

  const dragOccurred = useRef(false)

  const handleReorder = (reordered: Deck[]) => {
    dragOccurred.current = true
    setOrderedDecks(reordered)
    updateSettings({ deckOrder: reordered.map(d => d.id) })
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    const deck = await onCreateDeck({ name: newName.trim(), description: newDesc.trim(), emoji: newEmoji, color: newColor })
    await updateSettings({ deckOrder: [...deckOrder, deck.id] })
    setCreateOpen(false)
    setNewName('')
    setNewDesc('Ready to play')
    setNewEmoji('🎯')
    setNewColor('#54A0FF')
  }

  const openEdit = (deck: Deck) => {
    setEditDeck(deck)
    setNewName(deck.name)
    setNewDesc(deck.description || 'Ready to play')
    setNewEmoji(deck.emoji)
    setNewColor(deck.color)
  }

  const handleEditSave = async () => {
    if (!editDeck || !newName.trim()) return
    await onUpdateDeck(editDeck.id, {
      name: newName.trim(),
      description: newDesc.trim(),
      emoji: newEmoji,
      color: newColor,
    })
    setEditDeck(null)
  }

  const handleEditDelete = async () => {
    if (!editDeck) return
    await onDeleteDeck(editDeck.id)
    await updateSettings({ deckOrder: deckOrder.filter(id => id !== editDeck.id) })
    setEditDeck(null)
  }

  const handleExport = async (deck: Deck) => {
    const quests = await getQuests(deck.id)
    const csv = questsToCSV(quests)
    downloadCSV(`${deck.name.replace(/[^a-zA-Z0-9]/g, '_')}_quests.csv`, csv)
  }

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await parseCSVFile(file)
    if (!result.valid) {
      setImportError(result.error ?? 'Invalid file')
      return
    }
    setImportRows(result.rows)
    setImportOpen(true)
    setShowImportInfo(false)
    setImportError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bezel)' }}>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} style={{ color: 'var(--text-primary)' }}>
              <ArrowLeft size={20} />
            </motion.button>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Edit Decks</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowImportInfo(true)}
              className="p-2 rounded-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              <Upload size={18} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCreateOpen(true)}
              className="p-2 rounded-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              <Plus size={18} />
            </motion.button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFilePick}
        />

        {importError && (
          <div className="px-4 py-2 text-sm" style={{ color: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.1)' }}>
            {importError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {decks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No decks yet. Create one or import a CSV.
              </p>
            </div>
          )}

          <Reorder.Group axis="y" values={orderedDecks} onReorder={handleReorder} className="space-y-3">
            {orderedDecks.map((deck) => (
              <Reorder.Item
                key={deck.id}
                value={deck}
                className="rounded-xl"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div
                  onClick={() => {
                    if (dragOccurred.current) { dragOccurred.current = false; return }
                    onSelectDeck(deck.id)
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="cursor-grab active:cursor-grabbing touch-none" style={{ color: 'var(--text-secondary)' }}>
                    <GripVertical size={18} />
                  </div>
                  <div className="text-2xl">{deckEmoji(deck.emoji)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{deck.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{deck.description || 'Ready to play'}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExport(deck) }}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(deck) }}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Pen size={16} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Deck"
        footer={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#54A0FF', color: 'white' }}
            >
              Save
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Deck name"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Subtext</label>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Ready to play"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Emoji</label>
          <EmojiPicker selected={newEmoji} onSelect={setNewEmoji} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Color</label>
          <ColorSwatches selected={newColor} onSelect={setNewColor} />
        </div>
      </BottomSheet>

      <BottomSheet
        open={!!editDeck}
        onClose={() => setEditDeck(null)}
        title={editDeck ? `Edit ${editDeck.name}` : ''}
        footer={
          <>
            <button
              onClick={() => setEditDeck(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditDelete}
              className="py-2.5 px-4 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#DC143C', color: 'white' }}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleEditSave}
              disabled={!newName.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#54A0FF', color: 'white' }}
            >
              Save
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Deck name"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Subtext</label>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Ready to play"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Emoji</label>
          <EmojiPicker selected={newEmoji} onSelect={setNewEmoji} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Color</label>
          <ColorSwatches selected={newColor} onSelect={setNewColor} />
        </div>
      </BottomSheet>

      <ImportSheet
        open={importOpen}
        rows={importRows}
        decks={decks}
        onClose={() => { setImportOpen(false); setImportRows([]) }}
        onImported={() => setImportOpen(false)}
      />

      <BottomSheet
        open={showImportInfo}
        onClose={() => setShowImportInfo(false)}
        title="Import Quests"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Import quests from a <strong style={{ color: 'var(--text-primary)' }}>.csv</strong> file.
            The CSV must have at least a <code style={{ color: '#FECA57' }}>title</code> column.
          </p>

          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Required columns:</div>
            <code className="block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              title,description,value,emoji,color
            </code>
            <div className="mt-2 space-y-1">
              <div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>title</span> <span style={{ color: 'var(--text-secondary)' }}>— Quest name (required)</span></div>
              <div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>description</span> <span style={{ color: 'var(--text-secondary)' }}>— What to do</span></div>
              <div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>value</span> <span style={{ color: 'var(--text-secondary)' }}>— Point value (default 50)</span></div>
              <div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>emoji</span> <span style={{ color: 'var(--text-secondary)' }}>— Icon emoji</span></div>
              <div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>color</span> <span style={{ color: 'var(--text-secondary)' }}>— Hex color</span></div>
            </div>
          </div>

          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Example:</div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Header row (column names):</div>
            <code className="block text-xs leading-relaxed" style={{ color: '#FECA57' }}>
              title,description,value,emoji,color
            </code>
            <div className="text-xs mt-2 mb-1" style={{ color: 'var(--text-secondary)' }}>Data row:</div>
            <code className="block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Go to Oman,Visit the greatest nation in the world,500,🇴🇲,#DC143C
            </code>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Choose a CSV file</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Tap to browse</p>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
