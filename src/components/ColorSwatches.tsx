import { Check } from 'lucide-react'

const PALETTE = [
  '#0F0F1A', '#F5F3F0', '#DC143C', '#FF6B6B',
  '#FF9F43', '#FECA57', '#2ED573', '#20BF6B',
  '#00D2D3', '#54A0FF', '#5F27CD', '#A29BFE',
  '#FD79A8', '#636E72',
]

interface Props {
  selected: string
  onSelect: (color: string) => void
}

export default function ColorSwatches({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ backgroundColor: color }}
        >
          {selected === color && <Check size={16} color={color === '#FECA57' || color === '#A29BFE' || color === '#F5F3F0' ? '#1A1A1A' : 'white'} />}
        </button>
      ))}
    </div>
  )
}
