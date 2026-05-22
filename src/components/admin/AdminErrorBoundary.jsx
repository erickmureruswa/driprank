import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertTriangle size={52} className="text-[#FF006E]" />
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-[#888] max-w-sm text-sm">
            {this.state.error?.message || 'An unexpected error occurred in the admin dashboard.'}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 flex items-center gap-2 px-5 py-2 bg-[#B6FF00] text-black font-bold rounded-full text-sm"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
