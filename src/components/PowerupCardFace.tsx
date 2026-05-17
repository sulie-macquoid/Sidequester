import type { PowerupCardType } from '../types'
import { POWERUP_CARDS } from '../types'

interface Props {
  powerupKey: PowerupCardType
  value: number
  onActivate: () => void
}

export default function PowerupCardFace({ powerupKey, value, onActivate }: Props) {
  const def = POWERUP_CARDS.find(p => p.key === powerupKey)!

  return (
    <div
      onClick={onActivate}
      className="w-full h-full rounded-2xl flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.97] transition-transform select-none"
      style={{
        backgroundColor: '#2D1B4E',
        touchAction: 'none',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 60%, rgba(155,89,182,0.3) 100%)',
        }}
      />

      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: '#9B59B6' }} />

      <div className="flex items-center gap-3 pt-5 px-5 pb-2 shrink-0">
        <span className="text-3xl">{def.emoji}</span>
        {powerupKey === 'joker' && (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: '#9B59B6', color: 'white' }}
          >
            ★{value}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-5 min-h-0">
        <h3 className="text-xl font-bold leading-snug mb-2" style={{ color: 'white' }}>
          {def.label}
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {def.description}
          </p>
        </div>
        <div className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-center" style={{ backgroundColor: 'rgba(155,89,182,0.3)', color: '#D4A5FF' }}>
          {def.label === 'Joker' ? 'Swipe right to claim!' :
           def.label === 'Mulligan' ? 'Tap to recover last discard' :
           def.label === 'Star Power' ? 'Swipe right to boost hand +50' :
           'Swipe right to shuffle hand'}
        </div>
      </div>

      <div className="flex justify-between text-[10px] px-5 pb-4 pt-2 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span>⚡ Powerup Card</span>
        <span>Swipe →</span>
      </div>
    </div>
  )
}
