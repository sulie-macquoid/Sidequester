import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Plus, Upload, Trash2 } from 'lucide-react'
import type { Deck, Quest, ParsedQuestRow } from '../types'
import { parseCSVFile } from '../utils/csv'
import { resolveEmoji } from '../utils/formatters'
import { useSettings } from '../context/SettingsContext'
import BottomSheet from '../components/BottomSheet'
import EmojiPicker from '../components/EmojiPicker'
import ColorSwatches from '../components/ColorSwatches'
import ImportSheet from '../components/ImportSheet'
import PowerupToggleSheet from '../components/PowerupToggleSheet'

interface Props {
  deck: Deck
  quests: Quest[]
  onCreateQuest: (deckId: string, data: Omit<Quest, 'id' | 'deckId' | 'createdAt'>) => Promise<Quest>
  onUpdateQuest: (id: string, data: Partial<Quest>) => Promise<void>
  onDeleteQuest: (id: string) => void
  onUpdateDeck: (id: string, data: Partial<Deck>) => Promise<void>
  onBack: () => void
}

export default function DeckDetailScreen({ deck, quests, onCreateQuest, onUpdateQuest, onDeleteQuest, onUpdateDeck, onBack }: Props) {
  const { settings } = useSettings()
  const disabledEmojis = settings.disabledEmojis || []
  const deckEmoji = resolveEmoji(deck.emoji, disabledEmojis)
  const [createOpen, setCreateOpen] = useState(false)
  const [editQuest, setEditQuest] = useState<Quest | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showImportInfo, setShowImportInfo] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<ParsedQuestRow[]>([])
  const [importPowerups, setImportPowerups] = useState<string[] | undefined>(undefined)
  const [importError, setImportError] = useState<string | null>(null)
  const [powerupToggleOpen, setPowerupToggleOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formValue, setFormValue] = useState(50)
  const [pointInput, setPointInput] = useState('50')
  const [formEmoji, setFormEmoji] = useState('🎯')
  const [formColor, setFormColor] = useState('#636E72')

  const openCreate = () => {
    setFormTitle('')
    setFormDesc('')
    setFormValue(50)
    setPointInput('50')
    setFormEmoji('🎯')
    setFormColor('#636E72')
    setCreateOpen(true)
  }

  const openEdit = (q: Quest) => {
    setFormTitle(q.title)
    setFormDesc(q.description)
    setFormValue(q.value)
    setPointInput(String(q.value))
    setFormEmoji(q.emoji)
    setFormColor(q.color)
    setEditQuest(q)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) return
    if (editQuest) {
      await onUpdateQuest(editQuest.id, {
        title: formTitle.trim(),
        description: formDesc,
        value: formValue,
        emoji: formEmoji,
        color: formColor,
      })
      setEditQuest(null)
    } else {
      await onCreateQuest(deck.id, {
        title: formTitle.trim(),
        description: formDesc,
        value: formValue,
        emoji: formEmoji,
        color: formColor,
      })
      setCreateOpen(false)
    }
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
    setImportPowerups(result.enabledPowerups)
    setImportOpen(true)
    setImportError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 min-h-[52px]" style={{ backgroundColor: 'var(--bezel)' }}>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
              <ArrowLeft size={20} />
            </motion.button>
            <span className="font-semibold text-sm truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
              {deckEmoji} {deck.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowImportInfo(true)}
              className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <Upload size={18} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={openCreate}
              className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
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

        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: deck.color }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{quests.length} quests</span>
          </div>
          <button
            onClick={() => setPowerupToggleOpen(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg min-h-[36px]"
            style={{ backgroundColor: 'rgba(155,89,182,0.15)', color: '#9B59B6' }}
          >
            ⚡ Powerups
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {quests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                This deck is empty. Add some quests!
              </p>
            </div>
          )}

          {quests.map((q) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {deleteConfirmId === q.id ? (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                    Delete "{q.title}"?
                  </span>
                  <button
                    onClick={() => { onDeleteQuest(q.id); setDeleteConfirmId(null) }}
                    className="px-3 py-2 rounded-lg text-xs font-medium min-h-[44px]"
                    style={{ backgroundColor: '#DC143C', color: 'white' }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-2 rounded-lg text-xs font-medium min-h-[44px]"
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => openEdit(q)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: q.color }} />
                  <div className="text-lg shrink-0">{q.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{q.title}</div>
                    {q.description && (
                      <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{q.description}</div>
                    )}
                  </div>
                  <div className="text-sm font-semibold shrink-0" style={{ color: '#FECA57' }}>★{q.value}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(q.id) }}
                    className="p-2 rounded-lg ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="text-sm">✕</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <BottomSheet
        open={createOpen || !!editQuest}
        onClose={() => { setCreateOpen(false); setEditQuest(null) }}
        title={editQuest ? 'Edit Quest' : 'New Quest'}
        footer={
          <>
            <button
              onClick={() => { setCreateOpen(false); setEditQuest(null) }}
              className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            {editQuest && (
              <button
                onClick={() => { onDeleteQuest(editQuest.id); setEditQuest(null) }}
                className="py-3 px-4 rounded-xl text-sm font-medium min-h-[44px]"
                style={{ backgroundColor: '#DC143C', color: 'white' }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: '#54A0FF', color: 'white' }}
            >
              Save
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Emoji</label>
          <EmojiPicker selected={formEmoji} onSelect={setFormEmoji} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Title</label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Quest title"
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)', fontSize: '16px' }}
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="What to do"
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Point Value</label>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => {
                const v = Math.max(0, formValue - 10)
                setFormValue(v)
                setPointInput(String(v))
              }}
              className="w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0 min-w-[44px] min-h-[44px]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pointInput}
              onChange={(e) => {
                setPointInput(e.target.value)
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v)) setFormValue(Math.max(0, Math.min(500, v)))
              }}
              onBlur={() => {
                const v = parseInt(pointInput, 10)
                if (isNaN(v) || pointInput.trim() === '') {
                  setPointInput('10')
                  setFormValue(10)
                }
              }}
              min={0}
              max={500}
              className="flex-1 px-3 py-2 rounded-lg text-lg font-semibold text-center outline-none"
              style={{ backgroundColor: 'var(--bg)', color: '#FECA57', fontSize: '16px' }}
            />
            <button
              onClick={() => {
                const v = Math.min(500, formValue + 10)
                setFormValue(v)
                setPointInput(String(v))
              }}
              className="w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0 min-w-[44px] min-h-[44px]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>Color</label>
          <ColorSwatches selected={formColor} onSelect={setFormColor} />
        </div>
      </BottomSheet>

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
            onClick={() => { setShowImportInfo(false); setTimeout(() => fileInputRef.current?.click(), 300) }}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:opacity-80 transition-opacity min-h-[44px] flex flex-col items-center justify-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Choose a CSV file</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Tap to browse</p>
          </div>
        </div>
      </BottomSheet>

      <ImportSheet
        open={importOpen}
        rows={importRows}
        enabledPowerups={importPowerups}
        decks={[deck]}
        defaultDeckId={deck.id}
        onClose={() => { setImportOpen(false); setImportRows([]); setImportPowerups(undefined) }}
        onImported={() => setImportOpen(false)}
      />

      <PowerupToggleSheet
        open={powerupToggleOpen}
        deck={deck}
        onClose={() => setPowerupToggleOpen(false)}
        onUpdate={(deckId, activePowerups) => onUpdateDeck(deckId, { activePowerups })}
      />
    </>
  )
}
