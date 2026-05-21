import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, RefreshControl, TextInput,
} from 'react-native'
import { useAdminStore } from '../store/adminStore'
import Badge from '../components/Badge'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered']

function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.created_at)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <View style={s.card}>
      <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.75}>
        <View style={s.thumb}>
          {order.designs?.image
            ? <Image source={{ uri: order.designs.image }} style={s.thumbImg} />
            : <Text style={s.thumbIcon}>📦</Text>
          }
        </View>
        <View style={s.info}>
          <Text style={s.designName} numberOfLines={1}>
            {order.designs?.name || order.design_id}
          </Text>
          <View style={s.row}>
            <Badge type={order.status} />
            <Text style={s.city}>{order.city} · {order.size}</Text>
          </View>
          <Text style={s.dateText}>{dateStr} · {timeStr}</Text>
        </View>
        <View style={s.priceCol}>
          {order.total_price
            ? <Text style={s.price}>${parseFloat(order.total_price).toFixed(2)}</Text>
            : null
          }
          <Text style={s.orderId}>#{order.id?.slice(0, 6)}</Text>
          <Text style={s.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={s.detail}>
          <Row label="Phone"    value={order.phone || '—'} />
          <Row label="City"     value={order.city} />
          <Row label="Size"     value={order.size} />
          <Row label="Quantity" value={order.quantity || 1} />
          <Row label="Design"   value={order.design_id} />

          <Text style={s.statusLabel}>Update Status:</Text>
          <View style={s.statusBtns}>
            {STATUSES.map(st => (
              <TouchableOpacity
                key={st}
                style={[s.statusBtn, order.status === st && s.statusBtnActive]}
                onPress={() => onStatusChange(order.id, st)}
              >
                <Text style={[s.statusBtnText, order.status === st && { color: '#B6FF00' }]}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function Row({ label, value }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{String(value)}</Text>
    </View>
  )
}

function SumChip({ label, value, color }) {
  return (
    <View style={[s.sumChip, { borderColor: color + '44', backgroundColor: color + '11' }]}>
      <Text style={[s.sumVal, { color }]}>{value}</Text>
      <Text style={s.sumLabel}>{label}</Text>
    </View>
  )
}

export default function SalesScreen() {
  const orders            = useAdminStore(s => s.orders)
  const updateOrderStatus = useAdminStore(s => s.updateOrderStatus)
  const fetchOrders       = useAdminStore(s => s.fetchOrders)
  const loading           = useAdminStore(s => s.loading)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search || o.design_id?.includes(search) ||
                        o.city?.toLowerCase().includes(search.toLowerCase()) ||
                        o.designs?.name?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalRevenue = filtered.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status)
  }

  return (
    <View style={s.root}>
      {/* Summary chips */}
      <View style={s.sumRow}>
        <SumChip label="Pending"   value={counts.pending}   color="#FF8C00" />
        <SumChip label="Confirmed" value={counts.confirmed} color="#00D1FF" />
        <SumChip label="Shipped"   value={counts.shipped}   color="#A855F7" />
        <SumChip label="Done"      value={counts.delivered} color="#B6FF00" />
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search orders…"
          placeholderTextColor="#444"
        />
      </View>

      {/* Filter tabs */}
      <View style={s.tabs}>
        {['all', ...STATUSES].map(f => (
          <TouchableOpacity
            key={f}
            style={[s.tab, filter === f && s.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.tabText, filter === f && s.tabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue line */}
      {filtered.length > 0 && (
        <View style={s.revRow}>
          <Text style={s.revCount}>{filtered.length} orders</Text>
          <Text style={s.revTotal}>${totalRevenue.toFixed(2)}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        renderItem={({ item }) => <OrderCard order={item} onStatusChange={handleStatus} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 40, gap: 8 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor="#B6FF00" />}
        ListEmptyComponent={<Text style={s.empty}>No orders found</Text>}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0D0D0D' },
  sumRow:       { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  sumChip:      { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: 'center' },
  sumVal:       { fontSize: 18, fontWeight: '900' },
  sumLabel:     { fontSize: 10, color: '#555', marginTop: 2 },
  searchWrap:   { paddingHorizontal: 16, paddingTop: 12 },
  search:       { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11, color: '#F5F5F5', fontSize: 14 },
  tabs:         { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, gap: 6, flexWrap: 'wrap' },
  tab:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tabActive:    { backgroundColor: 'rgba(182,255,0,0.1)', borderColor: 'rgba(182,255,0,0.3)' },
  tabText:      { fontSize: 11, color: '#555', fontWeight: '600' },
  tabTextActive:{ color: '#B6FF00' },
  revRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  revCount:     { fontSize: 12, color: '#444' },
  revTotal:     { fontSize: 16, fontWeight: '900', color: '#B6FF00' },
  card:         { backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  thumb:        { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1A1A1A', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbImg:     { width: '100%', height: '100%' },
  thumbIcon:    { fontSize: 18 },
  info:         { flex: 1 },
  designName:   { fontSize: 14, fontWeight: '700', color: '#F5F5F5', marginBottom: 4 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  city:         { fontSize: 11, color: '#555' },
  dateText:     { fontSize: 11, color: '#444' },
  priceCol:     { alignItems: 'flex-end' },
  price:        { fontSize: 15, fontWeight: '800', color: '#B6FF00' },
  orderId:      { fontSize: 10, color: '#444', marginTop: 2 },
  chevron:      { fontSize: 10, color: '#444', marginTop: 4 },
  detail:       { padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  detailLabel:  { fontSize: 12, color: '#555' },
  detailValue:  { fontSize: 12, color: '#F5F5F5', fontWeight: '600' },
  statusLabel:  { fontSize: 12, color: '#555', marginTop: 12, marginBottom: 8 },
  statusBtns:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  statusBtnActive: { borderColor: 'rgba(182,255,0,0.3)', backgroundColor: 'rgba(182,255,0,0.08)' },
  statusBtnText:{ fontSize: 12, color: '#666', fontWeight: '600' },
  empty:        { textAlign: 'center', color: '#333', fontSize: 14, marginTop: 60 },
})
