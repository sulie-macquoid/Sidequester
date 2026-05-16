import { useState, useCallback, useRef } from 'react'
import type { View } from '../types'

export function useView() {
  const [view, setView] = useState<View>('menu')
  const [viewTransition, setViewTransition] = useState<'forward' | 'back'>('forward')
  const viewRef = useRef(view)
  viewRef.current = view

  const navigate = useCallback((to: View, direction?: 'forward' | 'back') => {
    setViewTransition(direction ?? 'forward')
    setView(to)
  }, [])

  const goBack = useCallback(() => {
    setViewTransition('back')
    switch (viewRef.current) {
      case 'deckSelect':
      case 'deckList':
        setView('menu')
        break
      case 'game':
        setView('deckSelect')
        break
      case 'deckDetail':
        setView('deckList')
        break
      case 'deckComplete':
        setView('menu')
        break
      default:
        setView('menu')
    }
  }, [])

  return { view, setView: navigate, goBack, viewTransition }
}
