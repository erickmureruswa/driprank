import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ShieldAlert } from 'lucide-react'

export default function AdminGuard({ children }) {
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const profile   = useAuthStore(s => s.profile)
  const loading   = useAuthStore(s => s.loading)

  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true })
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert size={56} className="text-[#FF006E]" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-[#888] max-w-xs">
          You need admin privileges to access this dashboard.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-[#B6FF00] text-black font-bold rounded-full text-sm"
        >
          Go Home
        </button>
      </div>
    )
  }

  return children
}
