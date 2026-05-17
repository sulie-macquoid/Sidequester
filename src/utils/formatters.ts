export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function resolveEmoji(emoji: string, disabledEmojis: string[]): string {
  return disabledEmojis.includes(emoji) ? '🇴🇲' : emoji
}

let audioCtx: AudioContext | null = null

export function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10)
    return
  }
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 60
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.04)
  } catch {}
}
