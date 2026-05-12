import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { logError } from './db/stores'

window.onerror = (message, _source, _lineno, _colno, error) => {
  logError({
    message: String(message),
    stack: error?.stack ?? '',
    timestamp: Date.now(),
    view: 'global',
    userAgent: navigator.userAgent,
  })
}

window.onunhandledrejection = (event) => {
  logError({
    message: event.reason?.message ?? String(event.reason),
    stack: event.reason?.stack ?? '',
    timestamp: Date.now(),
    view: 'global',
    userAgent: navigator.userAgent,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
