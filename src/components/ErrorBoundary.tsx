import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logError } from '../db/stores'

interface Props {
  children: ReactNode
  currentView?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    logError({
      message: error.message,
      stack: error.stack ?? '',
      timestamp: Date.now(),
      view: this.props.currentView ?? 'unknown',
      userAgent: navigator.userAgent,
    }).catch(() => {
      console.error('Failed to log error to IndexedDB:', error)
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-dvh p-8"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl font-semibold text-sm min-h-[44px]"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            Restart
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
