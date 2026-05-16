import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { CURRENT_VERSION } from '../data/changelog'
import UpdatePopup from './UpdatePopup'

export default function UpdateChecker() {
  const { settings, updateSettings, loaded } = useSettings()
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (!loaded) return
    const seen = settings.seenUpdates ?? []
    if (!seen.includes(CURRENT_VERSION)) {
      setShowUpdate(true)
    }
  }, [loaded])

  const handleClose = async () => {
    setShowUpdate(false)
    const seen = settings.seenUpdates ?? []
    if (!seen.includes(CURRENT_VERSION)) {
      await updateSettings({ seenUpdates: [...seen, CURRENT_VERSION] })
    }
  }

  return <UpdatePopup open={showUpdate} onClose={handleClose} />
}
