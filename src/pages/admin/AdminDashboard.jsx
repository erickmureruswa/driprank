import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  LayoutDashboard, Shirt, DollarSign, MessageCircle,
  ShoppingBag, BarChart2, Menu, X, LogOut, ChevronRight,
} from 'lucide-react'
import AdminGuard          from '../../components/admin/AdminGuard'
import AdminErrorBoundary from '../../components/admin/AdminErrorBoundary'
import { useAuthStore } from '../../store/authStore'
import { useAdminStore } from '../../store/adminStore'
import OverviewSection  from './sections/OverviewSection'
import DesignsSection   from './sections/DesignsSection'
import SalesSection     from './sections/SalesSection'
import SettingsSection  from './sections/SettingsSection'
import AnalyticsSection from './sections/AnalyticsSection'

const NAV = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'designs',    label: 'Designs',    icon: Shirt },
  { id: 'sales',      label: 'Sales',      icon: ShoppingBag },
  { id: 'analytics',  label: 'Analytics',  icon: BarChart2 },
  { id: 'settings',   label: 'Settings',   icon: DollarSign },
]

function Sidebar({ active, setActive, sidebarOpen, setSidebarOpen }) {
  const navigate  = useNavigate()
  const signOut   = useAuthStore(s => s.signOut)
  const profile   = useAuthStore(s => s.profile)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0f0f0f] border-r border-white/5 z-40 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[#B6FF00] font-black text-xl tracking-widest">DRIPRANK</div>
            <div className="text-[#888] text-xs mt-0.5">Admin Console</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#888] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#B6FF00]/10 border border-[#B6FF00]/30 flex items-center justify-center">
              <span className="text-[#B6FF00] text-xs font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{profile?.username || 'Admin'}</div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF00] animate-pulse" />
                <span className="text-[#B6FF00] text-xs font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${active === id
                  ? 'bg-[#B6FF00]/10 text-[#B6FF00] border border-[#B6FF00]/20'
                  : 'text-[#888] hover:bg-white/5 hover:text-white border border-transparent'
                }
              `}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {active === id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#888] hover:text-white hover:bg-white/5 transition-all"
          >
            <MessageCircle size={16} />
            View Site
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#FF006E]/70 hover:text-[#FF006E] hover:bg-[#FF006E]/5 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function TopBar({ active, setSidebarOpen }) {
  const currentNav = NAV.find(n => n.id === active)
  return (
    <header className="h-14 flex items-center px-4 lg:px-6 border-b border-white/5 bg-[#0D0D0D] sticky top-0 z-20">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-[#888] hover:text-white mr-3"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-white font-bold text-sm sm:text-base">
          {currentNav?.label}
        </h1>
        <p className="text-[#888] text-xs hidden sm:block">DRIPRANK Control Center</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse" />
        <span className="text-[#888] text-xs hidden sm:inline">Live</span>
      </div>
    </header>
  )
}

function BottomNav({ active, setActive }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f0f0f] border-t border-white/5 flex items-center z-30">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
            active === id ? 'text-[#B6FF00]' : 'text-[#555] hover:text-[#888]'
          }`}
        >
          <Icon size={18} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}

function DashboardContent({ active }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [active])

  return (
    <div ref={contentRef} className="p-4 lg:p-6 pb-24 lg:pb-6">
      {active === 'overview'  && <OverviewSection />}
      {active === 'designs'   && <DesignsSection />}
      {active === 'sales'     && <SalesSection />}
      {active === 'analytics' && <AnalyticsSection />}
      {active === 'settings'  && <SettingsSection />}
    </div>
  )
}

function AdminDashboardInner() {
  const [active, setActive]           = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initAdmin   = useAdminStore(s => s.initAdmin)
  const unsubscribe = useAdminStore(s => s.unsubscribe)

  useEffect(() => {
    initAdmin()
    return () => unsubscribe()
  }, [initAdmin, unsubscribe])

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar active={active} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1">
          <DashboardContent active={active} />
        </main>
      </div>

      <BottomNav active={active} setActive={setActive} />
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminErrorBoundary>
      <AdminGuard>
        <AdminDashboardInner />
      </AdminGuard>
    </AdminErrorBoundary>
  )
}
