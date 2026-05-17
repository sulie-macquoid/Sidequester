import Papa from 'papaparse'
import type { ParsedQuestRow } from '../types'

export interface CSVParseResult {
  valid: boolean
  rows: ParsedQuestRow[]
  error?: string
  rowCount: number
  enabledPowerups?: string[]
}

const VALID_COLORS = [
  '#0F0F1A', '#F5F3F0', '#DC143C', '#FF6B6B',
  '#FF9F43', '#FECA57', '#2ED573', '#20BF6B',
  '#00D2D3', '#54A0FF', '#5F27CD', '#A29BFE',
  '#FD79A8', '#636E72',
]

function clampValue(v: number): number {
  return Math.max(10, Math.min(500, Math.round(v)))
}

function isValidHex(c: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(c)
}

function closestPaletteColor(hex: string): string {
  if (VALID_COLORS.includes(hex)) return hex
  if (isValidHex(hex)) return '#636E72'
  return '#636E72'
}

export function parseCSVText(text: string): CSVParseResult {
  const lines = text.split('\n')
  let enabledPowerups: string[] | undefined
  const firstLine = lines[0]?.trim()
  if (firstLine?.startsWith('#powerups:')) {
    const rest = firstLine.slice('#powerups:'.length).trim()
    enabledPowerups = rest.split(',').map(s => s.trim()).filter(Boolean)
    text = lines.slice(1).join('\n')
  }

  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    return { valid: false, rows: [], error: 'Could not parse CSV file', rowCount: 0 }
  }

  const fields = result.meta.fields?.map(f => f.toLowerCase()) ?? []
  if (!fields.includes('title')) {
    return { valid: false, rows: [], error: "Invalid CSV — must have a 'title' column", rowCount: 0 }
  }

  const rows: ParsedQuestRow[] = []
  let skippedCount = 0

  for (const row of result.data as any[]) {
    const title = (row.title?.trim() ?? '')
    if (!title) { skippedCount++; continue }

    const desc = (row.description?.trim() ?? row.desc?.trim() ?? '')
    const rawValue = parseInt(row.value ?? row.points ?? '50', 10)
    const emoji = (row.emoji ?? '📋').trim()
    const rawColor = (row.color ?? '#636E72').trim()

    rows.push({
      title,
      description: desc,
      value: clampValue(isNaN(rawValue) ? 50 : rawValue),
      emoji: emoji || '📋',
      color: closestPaletteColor(rawColor),
    })
  }

  if (rows.length === 0) {
    return { valid: false, rows: [], error: 'No quests found in file', rowCount: 0 }
  }

  const warning = skippedCount > 0 ? `${skippedCount} row${skippedCount !== 1 ? 's' : ''} skipped (missing title)` : undefined

  return { valid: true, rows, rowCount: rows.length, error: warning, enabledPowerups }
}

export function questsToCSV(quests: { title: string; description: string; value: number; emoji: string; color: string }[], powerups?: string[]): string {
  const header = 'title,description,value,emoji,color'
  const powerupLine = powerups && powerups.length > 0 ? `#powerups:${powerups.join(',')}\n` : ''
  const rows = quests.map(q =>
    `"${q.title.replace(/"/g, '""')}","${q.description.replace(/"/g, '""')}",${q.value},${q.emoji},${q.color}`
  )
  return powerupLine + [header, ...rows].join('\n')
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      resolve(parseCSVText(text))
    }
    reader.onerror = () => {
      resolve({ valid: false, rows: [], error: 'Failed to read file', rowCount: 0 })
    }
    reader.onabort = () => {
      resolve({ valid: false, rows: [], error: 'File read aborted', rowCount: 0 })
    }
    reader.readAsText(file)
  })
}
