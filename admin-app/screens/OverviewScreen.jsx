import { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { useAdminStore } from '../store/adminStore'
import StatCard from '../components/StatCard'

function fmt(n, prefix = '') {
  if (n === null || n === undefined) return '—'
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}k`
  return `${prefix}${typeof n === 'number' ? n.toLocaleString() : n}`
}

function PeriodRow({ label, orders, revenue }) {
  return (
    <View style={s.periodRow}>
      <Text style={s.periodLabel}>{label}</Text>
      <View style={s.periodRight}>
        <Text style={s.periodOrders}>{orders} orders</Text>
        <Text style={s.periodRevenue}>${revenue}</Text>
      </View>
    </View>
  )
}

export default function OverviewScreen() {
  const stats      = useAdminStore(s => s.stats)
  const loading    = useAdminStore(s => s.loading)
  const fetchStats = useAdminStore(s => s.fetchStats)

  const x = stats || {}

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={loading && !stats} onRefresh={fetchStats} tintColor="#B6FF00" />}
    >
      <Text style={s.heading}>Overview</Text>
      <Text style={s.sub}>Live platform metrics</Text>

      {/* Primary */}
      <View style={s.grid}>
        <StatCard label="Total Revenue"  value={fmt(x.totalRevenue, '$')} sub={`$${(x.weekRevenue||0).toFixed(0)} this week`} accent="lime"    icon="💰" />
        <StatCard label="Shirts Sold"    value={fmt(x.totalSold)}          sub={`${x.weekOrders||0} this week`}                accent="cyan"    icon="👕" />
      </View>
      <View style={s.grid}>
        <StatCard label="Total Orders"   value={fmt(x.totalOrders)}        sub={`${x.pendingOrders||0} pending`}               accent="orange"  icon="📦" />
        <StatCard label="Total Users"    value={fmt(x.totalUsers)}          accent="purple"  icon="👥" />
      </View>
      <View style={s.grid}>
        <StatCard label="Designs"        value={fmt(x.totalDesigns)}        sub={`${x.publicDesigns||0} public`}               accent="white"   icon="🎨" />
        <StatCard label="Featured"       value={fmt(x.featuredDesigns)}     sub="in Top Drip"                                  accent="lime"    icon="⭐" />
      </View>
      <View style={s.grid}>
        <StatCard label="Today Orders"   value={fmt(x.todayOrders)}         sub={`$${(x.todayRevenue||0).toFixed(0)} today`}   accent="cyan"    icon="📈" />
        <StatCard label="Shipped"        value={fmt(x.shippedOrders)}       sub="delivered/shipped"                            accent="magenta" icon="🚚" />
      </View>

      {/* Period breakdown */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Performance Breakdown</Text>
        <PeriodRow label="Today"          orders={x.todayOrders||0}  revenue={(x.todayRevenue||0).toFixed(2)} />
        <PeriodRow label="This Week (7d)" orders={x.weekOrders||0}   revenue={(x.weekRevenue||0).toFixed(2)} />
        <PeriodRow label="This Month"     orders={x.monthOrders||0}  revenue={(x.monthRevenue||0).toFixed(2)} />
        <PeriodRow label="All Time"       orders={x.totalOrders||0}  revenue={(x.totalRevenue||0).toFixed(2)} />
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0D0D0D' },
  content:       { padding: 20, paddingBottom: 40 },
  heading:       { fontSize: 26, fontWeight: '900', color: '#F5F5F5', letterSpacing: -0.5 },
  sub:           { fontSize: 13, color: '#555', marginBottom: 20 },
  grid:          { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card:          { backgroundColor: '#111', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18, marginTop: 6 },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: '#F5F5F5', marginBottom: 14 },
  periodRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  periodLabel:   { fontSize: 13, color: '#666' },
  periodRight:   { alignItems: 'flex-end' },
  periodOrders:  { fontSize: 12, color: '#888' },
  periodRevenue: { fontSize: 15, fontWeight: '800', color: '#B6FF00', marginTop: 2 },
})
