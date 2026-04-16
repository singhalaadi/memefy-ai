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
    // Console logs removed for production. 
    // In a full production environment, consider sending to a service like Sentry.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
          <div className="glass rounded-[2rem] p-10 max-w-md w-full border border-white/10 text-white text-center">
            <div className="text-6xl mb-6">🎭</div>
            <h1 className="text-2xl font-black italic gradient-text uppercase tracking-tight mb-4">
              Minor Glitch detected
            </h1>
            <p className="text-sm font-bold opacity-40 mb-8 leading-relaxed">
              The application encountered an unexpected error. This might be due to a connection issue or missing configuration.
            </p>
            
            <div className="text-left bg-black/40 rounded-2xl p-4 mb-8 border border-white/5">
              <p className="text-[10px] font-mono text-pink-400 break-words opacity-80">
                {this.state.error?.message || 'Unknown processing error'}
              </p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Restart Memefy
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary;