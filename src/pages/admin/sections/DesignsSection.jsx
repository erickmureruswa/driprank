import { useState } from 'react'
import {
  Plus, Trash2, Eye, EyeOff, Star, StarOff,
  Edit3, Search, X, Check, AlertCircle,
} from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'
import { useToastStore }  from '../../../store/toastStore'

function VisibilityBadge({ v }) {
  return v === 'public'
    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B6FF00]/10 text-[#B6FF00] border border-[#B6FF00]/20">PUBLIC</span>
    : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#888] border border-white/10">PRIVATE</span>
}

function DesignRow({ design, onEdit, onDelete, onToggleVisibility, onToggleFeatured }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) { setDeleting(true); return }
    await onDelete(design.id)
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex-shrink-0 overflow-hidden border border-white/8">
        {design.image
          ? <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-[#555] text-xs">No img</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold text-sm truncate">{design.name}</span>
          {design.featured && <Star size={12} className="text-[#B6FF00] flex-shrink-0" />}
          <VisibilityBadge v={design.visibility} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-[#555] text-xs">
          <span>ID: {design.id}</span>
          <span>❤ {design.likes || 0}</span>
          <span>📦 {design.all_time_orders || 0} orders</span>
          {design.price && <span className="text-[#B6FF00]">${design.price}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onToggleFeatured(design)}
          title={design.featured ? 'Unfeature' : 'Feature'}
          className="p-1.5 rounded-lg text-[#555] hover:text-[#B6FF00] hover:bg-[#B6FF00]/10 transition-all"
        >
          {design.featured ? <Star size={14} /> : <StarOff size={14} />}
        </button>
        <button
          onClick={() => onToggleVisibility(design)}
          title={design.visibility === 'public' ? 'Make private' : 'Make public'}
          className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/8 transition-all"
        >
          {design.visibility === 'public' ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => onEdit(design)}
          className="p-1.5 rounded-lg text-[#555] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 transition-all"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={handleDelete}
          title={deleting ? 'Click again to confirm delete' : 'Delete'}
          className={`p-1.5 rounded-lg transition-all ${
            deleting
              ? 'bg-[#FF006E]/20 text-[#FF006E]'
              : 'text-[#555] hover:text-[#FF006E] hover:bg-[#FF006E]/10'
          }`}
        >
          {deleting ? <AlertCircle size={14} /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  )
}

function AddDesignModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    id: '', name: '', designer: '', image: '',
    price: '25', shirt_color: '#FFFFFF', visibility: 'public',
    color: '#B6FF00', hype: '🔥',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.designer) {
      setError('ID, name and designer are required.')
      return
    }
    setSaving(true)
    const { error } = await onAdd({
      ...form,
      price:    parseFloat(form.price) || 25,
      orders:   0, weekly_orders: 0, all_time_orders: 0,
      rank:     99, prev_rank: 99, drop: false, featured: false, views: 0,
    })
    if (error) { setError(error.message); setSaving(false) }
    else onClose()
  }

  const inputCls = 'w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#444]'

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h3 className="text-white font-bold">Add New Design</h3>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="bg-[#FF006E]/10 border border-[#FF006E]/20 rounded-xl px-3 py-2 text-[#FF006E] text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] text-xs mb-1 block">Design ID *</label>
              <input className={inputCls} placeholder="DR001" value={form.id} onChange={e => set('id', e.target.value)} />
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">Price ($) *</label>
              <input className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Design Name *</label>
            <input className={inputCls} placeholder="Urban Ghost" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Designer *</label>
            <input className={inputCls} placeholder="@designer" value={form.designer} onChange={e => set('designer', e.target.value)} />
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Image URL</label>
            <input className={inputCls} placeholder="https://..." value={form.image} onChange={e => set('image', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] text-xs mb-1 block">Visibility</label>
              <select className={inputCls} value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">Hype</label>
              <select className={inputCls} value={form.hype} onChange={e => set('hype', e.target.value)}>
                <option>🔥</option><option>⚡</option><option>💎</option><option>🌊</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-[#888] text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-[#B6FF00] text-black font-bold text-sm hover:bg-[#c8ff1a] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add Design'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditDesignModal({ design, onClose, onSave }) {
  const [form, setForm]   = useState({
    name:       design.name,
    designer:   design.designer,
    price:      design.price || 25,
    visibility: design.visibility,
    image:      design.image || '',
    featured:   design.featured || false,
  })
  const [saving, setSaving] = useState(false)

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = 'w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#444]'

  const handleSave = async () => {
    setSaving(true)
    await onSave(design.id, { ...form, price: parseFloat(form.price) || 25 })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h3 className="text-white font-bold">Edit Design</h3>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-[#888] text-xs mb-1 block">Design Name</label>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Designer</label>
            <input className={inputCls} value={form.designer} onChange={e => set('designer', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] text-xs mb-1 block">Price ($)</label>
              <input className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="text-[#888] text-xs mb-1 block">Visibility</label>
              <select className={inputCls} value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1 block">Image URL</label>
            <input className={inputCls} value={form.image} onChange={e => set('image', e.target.value)} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('featured', !form.featured)}
              className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-[#B6FF00]' : 'bg-white/10'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-white text-sm">Featured in Top Drip</span>
          </label>
        </div>

        <div className="p-5 border-t border-white/8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-[#888] text-sm">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-[#B6FF00] text-black font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DesignsSection() {
  const designs          = useAdminStore(s => s.designs)
  const addDesign        = useAdminStore(s => s.addDesign)
  const updateDesign     = useAdminStore(s => s.updateDesign)
  const deleteDesign     = useAdminStore(s => s.deleteDesign)
  const addToast         = useToastStore(s => s.addToast)

  const [showAdd,  setShowAdd]  = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  const filtered = designs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all'      ? true
                      : filter === 'public'   ? d.visibility === 'public'
                      : filter === 'private'  ? d.visibility === 'private'
                      : filter === 'featured' ? d.featured
                      : true
    return matchSearch && matchFilter
  })

  const handleDelete = async (id) => {
    const err = await deleteDesign(id)
    if (err) addToast('Failed to delete design', 'error')
    else addToast('Design deleted', 'success')
  }

  const handleToggleVisibility = async (d) => {
    const next = d.visibility === 'public' ? 'private' : 'public'
    await updateDesign(d.id, { visibility: next })
    addToast(`Design is now ${next}`, 'success')
  }

  const handleToggleFeatured = async (d) => {
    await updateDesign(d.id, { featured: !d.featured })
    addToast(d.featured ? 'Removed from Top Drip' : 'Added to Top Drip', 'success')
  }

  const handleSaveEdit = async (id, updates) => {
    const { error } = await updateDesign(id, updates)
    if (error) addToast('Failed to update design', 'error')
    else addToast('Design updated', 'success')
  }

  const handleAdd = async (data) => {
    const result = await addDesign(data)
    if (!result.error) addToast('Design added!', 'success')
    return result
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Design Management</h2>
          <p className="text-[#555] text-sm">{designs.length} total designs</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B6FF00] text-black font-bold text-sm rounded-xl hover:bg-[#c8ff1a] transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Design</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search designs…"
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#444]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {['all', 'public', 'private', 'featured'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[#B6FF00]/10 text-[#B6FF00] border border-[#B6FF00]/20'
                  : 'text-[#555] bg-white/5 border border-white/8 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Designs list */}
      <div className="rounded-2xl border border-white/8 bg-white/2 px-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[#555] text-sm">No designs found</div>
        ) : (
          filtered.map(d => (
            <DesignRow
              key={d.id}
              design={d}
              onEdit={setEditing}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onToggleFeatured={handleToggleFeatured}
            />
          ))
        )}
      </div>

      {showAdd && (
        <AddDesignModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
      {editing && (
        <EditDesignModal design={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />
      )}
    </div>
  )
}
