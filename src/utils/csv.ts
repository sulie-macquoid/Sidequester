import Papa from 'papaparse'
import type { ParsedQuestRow } from '../types'

export interface CSVParseResult {
  valid: boolean
  rows: ParsedQuestRow[]
  error?: string
  rowCount: number
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

  for (const row of result.data as any[]) {
    const title = (row.title?.trim() ?? '')
    if (!title) continue

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

  return { valid: true, rows, rowCount: rows.length }
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
    reader.readAsText(file)
  })
}
