import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Heart, Eye, ShoppingBag } from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'

const CHART_STYLE = {
  cartesian:  { stroke: 'rgba(255,255,255,0.04)' },
  xAxis:      { stroke: '#333', tick: { fill: '#666', fontSize: 11 } },
  yAxis:      { stroke: '#333', tick: { fill: '#666', fontSize: 11 } },
}

function CustomTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[#888] text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-bold text-sm" style={{ color: p.color }}>
          {prefix}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
      <div className="mb-4">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-[#555] text-xs">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function DesignLeaderboard({ designs }) {
  if (!designs?.length) {
    return <div className="py-8 text-center text-[#555] text-sm">No data yet</div>
  }

  const max = Math.max(...designs.map(d => d.all_time_orders || 0), 1)

  return (
    <div className="space-y-3">
      {designs.slice(0, 8).map((d, i) => {
        const pct = ((d.all_time_orders || 0) / max) * 100
        return (
          <div key={d.id || i} className="flex items-center gap-3">
            <span className="text-[#555] text-xs font-mono w-4 flex-shrink-0">#{i + 1}</span>
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex-shrink-0 overflow-hidden border border-white/8">
              {d.image
                ? <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[#555] text-[10px]">?</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate mb-1">{d.name}</div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B6FF00] to-[#00D1FF] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-white font-bold text-xs">{d.all_time_orders || 0}</div>
              <div className="text-[#555] text-[10px]">orders</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/8`}>
      <Icon size={14} className={color} />
      <div>
        <div className="text-white font-bold text-sm">{value}</div>
        <div className="text-[#555] text-[10px]">{label}</div>
      </div>
    </div>
  )
}

export default function AnalyticsSection() {
  const analytics = useAdminStore(s => s.analytics)
  const designs   = useAdminStore(s => s.designs)
  const stats     = useAdminStore(s => s.stats)

  const topByLikes = [...designs]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 5)

  const topByOrders = [...designs]
    .sort((a, b) => (b.all_time_orders || 0) - (a.all_time_orders || 0))
    .slice(0, 5)

  const revenueData = analytics?.revenueData || []
  const salesData   = analytics?.salesData   || []
  const topDesigns  = analytics?.topDesigns  || []

  // Merge revenue + sales for combo chart
  const comboData = revenueData.map((r, i) => ({
    date:    r.date,
    revenue: r.value,
    sales:   salesData[i]?.value || 0,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Trend Analytics</h2>
        <p className="text-[#555] text-sm">30-day performance overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders  || 0} color="text-[#B6FF00]" />
        <StatPill icon={TrendingUp}  label="This Week"    value={stats?.weekOrders   || 0} color="text-[#00D1FF]" />
        <StatPill icon={Heart}       label="Total Likes"  value={designs.reduce((s, d) => s + (d.likes || 0), 0)} color="text-[#FF006E]" />
        <StatPill icon={Eye}         label="Designs"      value={stats?.totalDesigns || 0} color="text-purple-400" />
      </div>

      {/* Revenue chart */}
      <ChartCard title="Revenue (30 Days)" subtitle="Daily revenue in USD">
        {comboData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={comboData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#B6FF00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B6FF00" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_STYLE.cartesian} />
              <XAxis dataKey="date" {...CHART_STYLE.xAxis} interval="preserveStartEnd" />
              <YAxis {...CHART_STYLE.yAxis} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Area
                type="monotone" dataKey="revenue" name="Revenue ($)"
                stroke="#B6FF00" fill="url(#revenueGrad)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[#555] text-sm">No revenue data yet</div>
              <div className="text-[#333] text-xs mt-1">Orders will appear here once placed</div>
            </div>
          </div>
        )}
      </ChartCard>

      {/* Sales chart */}
      <ChartCard title="Sales Volume (30 Days)" subtitle="Number of orders per day">
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={salesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid {...CHART_STYLE.cartesian} />
              <XAxis dataKey="date" {...CHART_STYLE.xAxis} interval="preserveStartEnd" />
              <YAxis {...CHART_STYLE.yAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Orders" fill="#00D1FF" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-[#555] text-sm">
            No sales data yet
          </div>
        )}
      </ChartCard>

      {/* Top designs bar chart */}
      <ChartCard title="Top Designs by Orders" subtitle="All-time order rankings">
        {topDesigns.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={topDesigns.slice(0, 8).map(d => ({ name: d.name?.slice(0, 10), orders: d.all_time_orders || 0, revenue: d.revenue || 0 }))}
              layout="vertical"
              margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
            >
              <CartesianGrid {...CHART_STYLE.cartesian} />
              <XAxis type="number" {...CHART_STYLE.xAxis} />
              <YAxis dataKey="name" type="category" {...CHART_STYLE.yAxis} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#B6FF00" radius={[0, 4, 4, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <DesignLeaderboard designs={designs} />
        )}
      </ChartCard>

      {/* Two column: most liked + most ordered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Most Liked" subtitle="Top designs by hearts">
          <div className="space-y-2.5">
            {topByLikes.length > 0 ? topByLikes.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-[#555] text-xs w-4">#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] overflow-hidden border border-white/8 flex-shrink-0">
                  {d.image && <img src={d.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="flex-1 text-white text-xs truncate">{d.name}</span>
                <span className="text-[#FF006E] text-xs font-bold">❤ {d.likes}</span>
              </div>
            )) : <p className="text-[#555] text-xs">No like data yet</p>}
          </div>
        </ChartCard>

        <ChartCard title="Best Sellers" subtitle="Top designs by all-time orders">
          <div className="space-y-2.5">
            {topByOrders.length > 0 ? topByOrders.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-[#555] text-xs w-4">#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] overflow-hidden border border-white/8 flex-shrink-0">
                  {d.image && <img src={d.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="flex-1 text-white text-xs truncate">{d.name}</span>
                <span className="text-[#B6FF00] text-xs font-bold">{d.all_time_orders || 0} sold</span>
              </div>
            )) : <p className="text-[#555] text-xs">No order data yet</p>}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
