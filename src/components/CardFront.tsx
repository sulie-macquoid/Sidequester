interface Props {
  emoji: string
  title: string
  description: string
  value: number
  color: string
  onFlip: () => void
}

export default function CardFront({ emoji, title, description, value, color, onFlip }: Props) {
  return (
    <div
      onClick={onFlip}
      className="w-full h-full rounded-2xl flex flex-col cursor-pointer relative overflow-hidden touch-none select-none"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 60%, ${color}20 100%)`,
        }}
      />

      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />

      <div className="flex items-center gap-3 pt-5 px-5 pb-2 shrink-0">
        <span className="text-3xl">{emoji}</span>
        <div
          className="px-3 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: color, color: 'white' }}
        >
          ★{value}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 min-h-0">
        <h3 className="text-xl font-bold leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-between text-[10px] px-5 pb-4 pt-2 shrink-0" style={{ color: 'var(--text-secondary)' }}>
        <span>Swipe ← to discard</span>
        <span>Swipe → to complete</span>
      </div>
    </div>
  )
}
