import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  DollarSign, Shirt, Users, ShoppingBag, TrendingUp,
  Star, Eye, Activity,
} from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'

function fmt(n, prefix = '') {
  if (n === null || n === undefined) return '—'
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}k`
  return `${prefix}${typeof n === 'number' ? n.toLocaleString() : n}`
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, delay, ease: 'power3.out' }
    )
  }, [delay])

  const colors = {
    lime:    { bg: 'bg-[#B6FF00]/8',  border: 'border-[#B6FF00]/20',  icon: 'text-[#B6FF00]',  glow: 'shadow-[0_0_20px_rgba(182,255,0,0.08)]' },
    cyan:    { bg: 'bg-[#00D1FF]/8',  border: 'border-[#00D1FF]/20',  icon: 'text-[#00D1FF]',  glow: 'shadow-[0_0_20px_rgba(0,209,255,0.08)]' },
    magenta: { bg: 'bg-[#FF006E]/8',  border: 'border-[#FF006E]/20',  icon: 'text-[#FF006E]',  glow: 'shadow-[0_0_20px_rgba(255,0,110,0.08)]' },
    orange:  { bg: 'bg-orange-500/8', border: 'border-orange-500/20', icon: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(255,140,0,0.08)]' },
    purple:  { bg: 'bg-purple-500/8', border: 'border-purple-500/20', icon: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.08)]' },
    white:   { bg: 'bg-white/5',      border: 'border-white/10',      icon: 'text-white',      glow: '' },
  }
  const c = colors[color] || colors.white

  return (
    <div
      ref={ref}
      className={`rounded-2xl border p-5 backdrop-blur-sm ${c.bg} ${c.border} ${c.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="text-[#888] text-xs mt-1">{label}</div>
      {sub && <div className={`text-xs mt-1 font-medium ${c.icon}`}>{sub}</div>}
    </div>
  )
}

function PeriodRow({ label, orders, revenue }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-[#888] text-sm">{label}</span>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-white font-bold text-sm">{orders}</div>
          <div className="text-[#555] text-xs">orders</div>
        </div>
        <div className="text-right min-w-[64px]">
          <div className="text-[#B6FF00] font-bold text-sm">{revenue}</div>
          <div className="text-[#555] text-xs">revenue</div>
        </div>
      </div>
    </div>
  )
}

export default function OverviewSection() {
  const stats   = useAdminStore(s => s.stats)
  const loading = useAdminStore(s => s.loading)

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const s = stats || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-lg">Platform Overview</h2>
        <p className="text-[#555] text-sm">Real-time metrics across DRIPRANK</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue"    value={`$${fmt(s.totalRevenue)}`}   color="lime"    delay={0}    sub={`$${(s.weekRevenue || 0).toFixed(0)} this week`} />
        <StatCard icon={Shirt}      label="Shirts Sold"      value={fmt(s.totalSold)}             color="cyan"    delay={0.05} sub={`${s.weekOrders || 0} this week`} />
        <StatCard icon={ShoppingBag} label="Total Orders"   value={fmt(s.totalOrders)}            color="orange"  delay={0.1}  sub={`${s.pendingOrders || 0} pending`} />
        <StatCard icon={Users}      label="Total Users"      value={fmt(s.totalUsers)}             color="purple"  delay={0.15} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Star}     label="Designs"          value={fmt(s.totalDesigns)}            color="white"   delay={0.2}  sub={`${s.publicDesigns || 0} public`} />
        <StatCard icon={TrendingUp} label="Featured"       value={fmt(s.featuredDesigns)}         color="lime"    delay={0.25} sub="in Top Drip" />
        <StatCard icon={Activity} label="Today Orders"     value={fmt(s.todayOrders)}             color="cyan"    delay={0.3}  sub={`$${(s.todayRevenue || 0).toFixed(0)} today`} />
        <StatCard icon={Eye}      label="Shipped"          value={fmt(s.shippedOrders)}           color="magenta" delay={0.35} sub="delivered/shipped" />
      </div>

      {/* Period breakdown */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <h3 className="text-white font-bold text-sm mb-4">Performance Breakdown</h3>
        <PeriodRow
          label="Today"
          orders={s.todayOrders || 0}
          revenue={`$${(s.todayRevenue || 0).toFixed(2)}`}
        />
        <PeriodRow
          label="This Week (7d)"
          orders={s.weekOrders || 0}
          revenue={`$${(s.weekRevenue || 0).toFixed(2)}`}
        />
        <PeriodRow
          label="This Month (30d)"
          orders={s.monthOrders || 0}
          revenue={`$${(s.monthRevenue || 0).toFixed(2)}`}
        />
        <PeriodRow
          label="All Time"
          orders={s.totalOrders || 0}
          revenue={`$${(s.totalRevenue || 0).toFixed(2)}`}
        />
      </div>
    </div>
  )
}
