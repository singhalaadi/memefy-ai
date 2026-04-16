import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-Firebase errors to avoid console spam
    if (!error?.message?.includes('Firebase') && !error?.message?.includes('index')) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full border border-white/20 dark:text-white text-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
              <p className="opacity-80 mb-6">
                There was an error loading the application. This is likely due to missing environment variables.
              </p>
              <div className="text-left bg-black/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-mono text-red-300">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary;