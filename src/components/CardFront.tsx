interface Props {
  emoji: string
  title: string
  description: string
  value: number
  color: string
  onFlip: () => void
  dragging?: boolean
  isPowerup?: boolean
  displayValue?: number
  showDoubleDownBadge?: boolean
}

export default function CardFront({ emoji, title, description, value, color, onFlip, dragging, isPowerup, displayValue, showDoubleDownBadge }: Props) {
  const shownValue = displayValue ?? value

  return (
    <div
      onClick={dragging ? undefined : onFlip}
      className="w-full h-full rounded-2xl flex flex-col relative overflow-hidden select-none"
      style={{
        backgroundColor: isPowerup ? '#2D1B4E' : 'var(--surface)',
        touchAction: 'none',
      }}
    >
      {isPowerup ? (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 60%, rgba(155,89,182,0.3) 100%)',
          }}
        />
      ) : (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 60%, ${color}20 100%)`,
          }}
        />
      )}

      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: isPowerup ? '#9B59B6' : color }} />

      <div className="flex items-center gap-3 pt-5 px-5 pb-2 shrink-0">
        <span className="text-3xl">{emoji}</span>
        {isPowerup ? (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: '#9B59B6', color: 'white' }}
          >
            ⚡
          </div>
        ) : (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {showDoubleDownBadge ? (
              <>2× <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>★{shownValue}</span> <span style={{ color: '#2ED573' }}>★{shownValue * 2}</span></>
            ) : (
              <>★{shownValue}</>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-5 min-h-0">
        <h3 className="text-xl font-bold leading-snug mb-2" style={{ color: isPowerup ? 'white' : 'var(--text-primary)' }}>
          {title}
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-sm leading-relaxed" style={{ color: isPowerup ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
            {isPowerup ? `${description}. Tap to activate.` : description}
          </p>
        </div>
      </div>

      <div className="flex justify-between text-[10px] px-5 pb-4 pt-2 shrink-0" style={{ color: isPowerup ? 'rgba(255,255,255,0.4)' : 'var(--text-secondary)' }}>
        {isPowerup ? (
          <>
            <span>⚡ Powerup Card</span>
            <span>Swipe →</span>
          </>
        ) : (
          <>
            <span>Swipe ← to discard</span>
            <span>Swipe → to complete</span>
          </>
        )}
      </div>
    </div>
  )
}
