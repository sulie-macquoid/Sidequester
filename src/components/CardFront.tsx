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
      className="w-full h-full rounded-2xl flex flex-col p-4 cursor-pointer relative overflow-hidden touch-none select-none"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 60%, ${color}20 100%)`,
        }}
      />

      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: color, color: 'white' }}
          >
            ★{value}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>

      <div className="flex justify-between text-[10px] mt-auto pt-2" style={{ color: 'var(--text-secondary)' }}>
        <span>Swipe ← to discard</span>
        <span>Swipe → to complete</span>
      </div>
    </div>
  )
}
