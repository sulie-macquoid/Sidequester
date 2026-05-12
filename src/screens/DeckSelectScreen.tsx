import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { Deck } from '../types'
import { resolveEmoji } from '../utils/formatters'
import { useSettings } from '../context/SettingsContext'

interface Props {
  decks: Deck[]
  onSelectDeck: (deckId: string) => void
  onBack: () => void
}

export default function DeckSelectScreen({ decks, onSelectDeck, onBack }: Props) {
  const { settings } = useSettings()
  const disabledEmojis = settings.disabledEmojis || []
  const deckOrder = settings.deckOrder || []
  const deckEmoji = (e: string) => resolveEmoji(e, disabledEmojis)

  const sortedDecks = [...decks].sort((a, b) => {
    const ai = deckOrder.indexOf(a.id)
    const bi = deckOrder.indexOf(b.id)
    if (ai === -1 && bi === -1) return a.createdAt - b.createdAt
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex items-center px-4 py-3" style={{ backgroundColor: 'var(--bezel)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} style={{ color: 'var(--text-primary)' }}>
          <ArrowLeft size={20} />
        </motion.button>
        <span className="ml-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Choose a Deck</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {sortedDecks.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No decks yet. Create one in Edit mode.</p>
          </div>
        )}

        {sortedDecks.map((deck, i) => (
          <motion.button
            key={deck.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectDeck(deck.id)}
            className="w-full rounded-2xl flex flex-col items-center gap-2 p-6 shadow-xl text-center"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="text-7xl">{deckEmoji(deck.emoji)}</div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{deck.name}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {deck.description || 'Ready to play'}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
