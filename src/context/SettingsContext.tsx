import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getSettings, setSetting } from '../db/stores'
import type { Settings } from '../types'
import {
  calculateLuminance,
  getContrastColor,
  deriveSurfaceColor,
  deriveBezelColor,
} from '../utils/colors'

const DEFAULT_SETTINGS: Settings = {
  backgroundColor: '#0F0F1A',
  theme: 'dark',
  customEmojis: [],
  disabledEmojis: [],
  deckOrder: [],
}

interface SettingsContextValue {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  bg: string
  contrastColor: string
  surfaceColor: string
  bezelColor: string
  secondaryColor: string
  borderColor: string
  isDark: boolean
  loaded: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    getSettings().then((s) => {
      setSettingsState(s as Settings)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const all = await getSettings()
    const next = { ...all, ...patch } as Settings
    setSettingsState(next)
    for (const [key, value] of Object.entries(patch)) {
      await setSetting(key, value)
    }
  }, [])

  const bg = settings.backgroundColor || '#0F0F1A'
  const lum = calculateLuminance(bg)
  const contrastColor = getContrastColor(bg)
  const surfaceColor = deriveSurfaceColor(bg)
  const bezelColor = deriveBezelColor(bg)
  const secondaryColor = lum > 0.5 ? '#8C8C80' : '#8B8BA7'
  const borderColor = lum > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark)

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, bg, contrastColor, surfaceColor, bezelColor, secondaryColor, borderColor, isDark, loaded }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
