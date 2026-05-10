import { useState } from 'react'
import { Package, Clock, CheckCircle, Truck, Search } from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'
import { useToastStore }  from '../../../store/toastStore'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  confirmed: { label: 'Confirmed', color: 'text-[#00D1FF]',  bg: 'bg-[#00D1FF]/10 border-[#00D1FF]/20' },
  shipped:   { label: 'Shipped',   color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  delivered: { label: 'Delivered', color: 'text-[#B6FF00]',  bg: 'bg-[#B6FF00]/10 border-[#B6FF00]/20' },
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.color}`}>
      {c.label.toUpperCase()}
    </span>
  )
}

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false)

  const date = new Date(order.created_at)
  const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className="flex items-center gap-3 py-3 cursor-pointer hover:bg-white/2 -mx-4 px-4 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex-shrink-0 overflow-hidden border border-white/8">
          {order.designs?.image
            ? <img src={order.designs.image} alt="" className="w-full h-full object-cover" />
            : <Package size={14} className="m-auto mt-2.5 text-[#555]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm truncate">
              {order.designs?.name || order.design_id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-[#555] text-xs mt-0.5">{order.city} · {order.size} · {timeStr}</div>
        </div>
        <div className="text-right flex-shrink-0">
          {order.total_price && (
            <div className="text-[#B6FF00] font-bold text-sm">${parseFloat(order.total_price).toFixed(2)}</div>
          )}
          <div className="text-[#555] text-xs">#{order.id?.slice(0, 6)}</div>
        </div>
      </div>

      {open && (
        <div className="pb-3 px-0 space-y-2">
          <div className="bg-white/3 rounded-xl p-3 space-y-1.5">
            <Row label="Order ID"   value={order.id} />
            <Row label="Phone"      value={order.phone || '—'} />
            <Row label="City"       value={order.city} />
            <Row label="Size"       value={order.size} />
            <Row label="Quantity"   value={order.quantity || 1} />
            <Row label="Design ID"  value={order.design_id} />
          </div>
          <div>
            <p className="text-[#555] text-xs mb-2">Update Status:</p>
            <div className="flex gap-1.5 flex-wrap">
              {Object.keys(STATUS_CONFIG).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order.id, s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    order.status === s
                      ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`
                      : 'border-white/10 text-[#555] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#555]">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const cls = {
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    cyan:   'text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    lime:   'text-[#B6FF00] bg-[#B6FF00]/10 border-[#B6FF00]/20',
  }[color]

  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${cls}`}>
      <Icon size={18} />
      <div>
        <div className="text-white font-black text-xl">{value}</div>
        <div className="text-[#888] text-xs">{label}</div>
      </div>
    </div>
  )
}

export default function SalesSection() {
  const orders           = useAdminStore(s => s.orders)
  const updateOrderStatus = useAdminStore(s => s.updateOrderStatus)
  const addToast          = useToastStore(s => s.addToast)

  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatus] = useState('all')

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.design_id?.toLowerCase().includes(search.toLowerCase()) ||
                        o.city?.toLowerCase().includes(search.toLowerCase()) ||
                        o.designs?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)

  const handleStatus = async (id, status) => {
    const err = await updateOrderStatus(id, status)
    if (err) addToast('Failed to update status', 'error')
    else addToast(`Order marked as ${status}`, 'success')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Sales Tracking</h2>
        <p className="text-[#555] text-sm">{orders.length} total orders</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={Clock}       label="Pending"   value={counts.pending}   color="orange" />
        <SummaryCard icon={CheckCircle} label="Confirmed" value={counts.confirmed} color="cyan"   />
        <SummaryCard icon={Truck}       label="Shipped"   value={counts.shipped}   color="purple" />
        <SummaryCard icon={Package}     label="Delivered" value={counts.delivered} color="lime"   />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#444]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-[#B6FF00]/10 text-[#B6FF00] border border-[#B6FF00]/20'
                  : 'text-[#555] bg-white/5 border border-white/8 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue summary */}
      {filtered.length > 0 && (
        <div className="rounded-2xl border border-[#B6FF00]/15 bg-[#B6FF00]/5 px-4 py-3 flex items-center justify-between">
          <span className="text-[#888] text-sm">{filtered.length} orders shown</span>
          <span className="text-[#B6FF00] font-black text-lg">${totalRevenue.toFixed(2)}</span>
        </div>
      )}

      {/* Orders list */}
      <div className="rounded-2xl border border-white/8 bg-white/2 px-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[#555] text-sm">No orders found</div>
        ) : (
          filtered.map(o => (
            <OrderRow key={o.id} order={o} onStatusChange={handleStatus} />
          ))
        )}
      </div>
    </div>
  )
}
