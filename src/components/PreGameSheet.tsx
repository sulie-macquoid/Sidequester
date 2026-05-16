import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X, RotateCcw, Play } from 'lucide-react'
import type { Session, GameSettings } from '../types'
import { DEFAULT_GAME_SETTINGS } from '../types'
import { getActiveSession } from '../db/stores'
import { useSettings } from '../context/SettingsContext'

interface Props {
  open: boolean
  deckId: string | null
  onClose: () => void
  onStart: (deckId: string, settings: GameSettings, continueSession?: boolean) => void
}

export default function PreGameSheet({ open, deckId, onClose, onStart }: Props) {
  const { settings, updateSettings } = useSettings()
  const [existingSession, setExistingSession] = useState<Session | null>(null)
  const [timeEnabled, setTimeEnabled] = useState(false)
  const [timeInput, setTimeInput] = useState('30')
  const [permanentDiscard, setPermanentDiscard] = useState(false)
  const [step, setStep] = useState<'session' | 'settings'>('session')

  const savedSettings = deckId ? settings.gameSettings?.[deckId] : null

  useEffect(() => {
    if (deckId) {
      getActiveSession(deckId).then(s => setExistingSession(s ?? null))
      const saved = savedSettings
      if (saved) {
        setTimeEnabled(saved.timeConstraintEnabled)
        setTimeInput(String(Math.floor(saved.timeLimitSeconds / 60)))
        setPermanentDiscard(saved.permanentDiscard)
      } else {
        setTimeEnabled(DEFAULT_GAME_SETTINGS.timeConstraintEnabled)
        setTimeInput(String(Math.floor(DEFAULT_GAME_SETTINGS.timeLimitSeconds / 60)))
        setPermanentDiscard(DEFAULT_GAME_SETTINGS.permanentDiscard)
      }
      setStep(existingSession ? 'session' : 'settings')
    }
  }, [deckId])

  if (!open || !deckId) return null

  const timeSeconds = (parseInt(timeInput, 10) || 30) * 60

  const handleContinue = async () => {
    const gameSettings: GameSettings = {
      timeConstraintEnabled: timeEnabled,
      timeLimitSeconds: timeSeconds,
      permanentDiscard,
    }
    await persistSettings(gameSettings)
    onStart(deckId, gameSettings, true)
  }

  const handleReset = () => {
    setStep('settings')
  }

  const handleStart = async () => {
    const gameSettings: GameSettings = {
      timeConstraintEnabled: timeEnabled,
      timeLimitSeconds: timeSeconds,
      permanentDiscard,
    }
    await persistSettings(gameSettings)
    onStart(deckId, gameSettings, false)
  }

  const persistSettings = async (gameSettings: GameSettings) => {
    await updateSettings({
      gameSettings: { ...(settings.gameSettings || {}), [deckId]: gameSettings },
    })
  }

  const parsedMinutes = parseInt(timeInput, 10)
  const timeValid = !isNaN(parsedMinutes) && parsedMinutes > 0 && parsedMinutes <= 999

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl flex flex-col max-w-md mx-auto"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {step === 'session' ? 'Continue Game?' : 'Game Settings'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 'session' && existingSession ? (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You have an unfinished game for this deck. What would you like to do?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#54A0FF', color: 'white' }}
                >
                  <Play size={16} />
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setPermanentDiscard(!permanentDiscard)}
                    className="w-10 h-6 rounded-full relative transition-colors shrink-0"
                    style={{ backgroundColor: permanentDiscard ? '#54A0FF' : 'var(--bg)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                      style={{
                        backgroundColor: 'white',
                        transform: permanentDiscard ? 'translateX(20px)' : 'translateX(4px)',
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Permanent Discard
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Discarded cards never reappear this session
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setTimeEnabled(!timeEnabled)}
                    className="w-10 h-6 rounded-full relative transition-colors shrink-0"
                    style={{ backgroundColor: timeEnabled ? '#54A0FF' : 'var(--bg)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                      style={{
                        backgroundColor: 'white',
                        transform: timeEnabled ? 'translateX(20px)' : 'translateX(4px)',
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Time Constraint
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Game ends when the timer runs out
                    </div>
                  </div>
                </label>
                {timeEnabled && (
                  <div className="flex items-center gap-2 mt-3 ml-[52px]">
                    <input
                      type="number"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      min={1}
                      max={999}
                      className="w-20 px-3 py-2 rounded-lg text-lg font-semibold text-center outline-none"
                      style={{ backgroundColor: 'var(--bg)', color: '#FECA57' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>minutes</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          {step === 'settings' && (
            <button
              onClick={handleStart}
              disabled={timeEnabled && !timeValid}
              className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#54A0FF', color: 'white' }}
            >
              Start Game
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}
