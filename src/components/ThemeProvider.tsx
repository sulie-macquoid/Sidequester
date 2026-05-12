import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { bg, contrastColor, surfaceColor, bezelColor, secondaryColor, borderColor, isDark, loaded } = useSettings()
  const rootRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loaded) return

    const root = document.documentElement
    root.style.setProperty('--bg', bg)
    root.style.setProperty('--surface', surfaceColor)
    root.style.setProperty('--bezel', bezelColor)
    root.style.setProperty('--text-primary', contrastColor)
    root.style.setProperty('--text-secondary', secondaryColor)
    root.style.setProperty('--border', borderColor)

    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.setAttribute('content', bg)

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    setReady(true)
  }, [bg, contrastColor, surfaceColor, bezelColor, secondaryColor, borderColor, isDark, loaded])

  if (!ready) {
    return (
      <div
        className="flex items-center justify-center min-h-dvh"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        <div className="text-2xl animate-pulse">⏳</div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="app-container" style={{ backgroundColor: 'var(--bg)' }}>
      {children}
    </div>
  )
}
