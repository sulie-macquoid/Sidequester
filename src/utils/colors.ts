function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/i.test(hex)
}

export function calculateLuminance(hex: string): number {
  if (!isValidHex(hex)) {
    console.warn(`Invalid hex color: "${hex}", defaulting to black`)
    return 0
  }
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255

  const toLinear = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function getContrastColor(hex: string): '#F0F0F5' | '#1A1A1A' {
  return calculateLuminance(hex) > 0.5 ? '#1A1A1A' : '#F0F0F5'
}

function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

export function shiftLightness(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex
  const c = hex.replace('#', '')
  let r = parseInt(c.substring(0, 2), 16)
  let g = parseInt(c.substring(2, 4), 16)
  let b = parseInt(c.substring(4, 6), 16)

  r = clampChannel(r + amount)
  g = clampChannel(g + amount)
  b = clampChannel(b + amount)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function deriveSurfaceColor(bg: string): string {
  const lum = calculateLuminance(bg)
  return lum > 0.5 ? shiftLightness(bg, -15) : shiftLightness(bg, 15)
}

export function deriveBezelColor(bg: string): string {
  const lum = calculateLuminance(bg)
  return lum > 0.5 ? shiftLightness(bg, -35) : shiftLightness(bg, 30)
}

export function desaturate(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex
  const c = hex.replace('#', '')
  let r = parseInt(c.substring(0, 2), 16)
  let g = parseInt(c.substring(2, 4), 16)
  let b = parseInt(c.substring(4, 6), 16)
  const gray = 0.299 * r + 0.587 * g + 0.114 * b

  r = clampChannel(r + (gray - r) * amount)
  g = clampChannel(g + (gray - g) * amount)
  b = clampChannel(b + (gray - b) * amount)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
