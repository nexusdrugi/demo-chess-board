import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  onReset?: () => void
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Basic error logging; could be enhanced to report to a service
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) this.props.onReset()
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-4 bg-red-50 text-red-800 rounded border border-red-200">
          <div className="font-semibold mb-2">Something went wrong.</div>
          <div className="text-sm mb-3">
            An error occurred while rendering the chess board or processing a drag/drop action. You can try to recover.
          </div>
          <button
            type="button"
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={this.handleReset}
          >
            Reset
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

