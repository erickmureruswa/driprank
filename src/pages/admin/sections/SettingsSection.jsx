import { useState, useEffect } from 'react'
import { MessageCircle, DollarSign, Save, RefreshCw, Check } from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'
import { useToastStore }  from '../../../store/toastStore'

function SettingCard({ icon: Icon, title, description, children, accent = 'lime' }) {
  const colors = {
    lime:    { border: 'border-[#B6FF00]/15', bg: 'bg-[#B6FF00]/5',  icon: 'text-[#B6FF00]', iconBg: 'bg-[#B6FF00]/10 border-[#B6FF00]/20' },
    cyan:    { border: 'border-[#00D1FF]/15', bg: 'bg-[#00D1FF]/5',  icon: 'text-[#00D1FF]', iconBg: 'bg-[#00D1FF]/10 border-[#00D1FF]/20' },
    magenta: { border: 'border-[#FF006E]/15', bg: 'bg-[#FF006E]/5',  icon: 'text-[#FF006E]', iconBg: 'bg-[#FF006E]/10 border-[#FF006E]/20' },
  }
  const c = colors[accent]

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl border ${c.iconBg}`}>
          <Icon size={18} className={c.icon} />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <p className="text-[#555] text-xs">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SavedIndicator({ saved }) {
  if (!saved) return null
  return (
    <span className="flex items-center gap-1 text-[#B6FF00] text-xs font-medium animate-pulse">
      <Check size={12} />
      Saved
    </span>
  )
}

function WhatsAppSettings() {
  const settings     = useAdminStore(s => s.settings)
  const updateSetting = useAdminStore(s => s.updateSetting)
  const addToast      = useToastStore(s => s.addToast)

  const [number,  setNumber]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    if (settings.whatsapp_number) setNumber(settings.whatsapp_number)
  }, [settings.whatsapp_number])

  const handleSave = async () => {
    if (!number.trim()) return
    setSaving(true)
    const err = await updateSetting('whatsapp_number', number.trim())
    setSaving(false)
    if (err) addToast('Failed to update WhatsApp number', 'error')
    else {
      addToast('WhatsApp number updated!', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <SettingCard
      icon={MessageCircle}
      title="WhatsApp Contact"
      description="All 'Buy Now' buttons across the platform use this number"
      accent="lime"
    >
      <div className="space-y-3">
        <div>
          <label className="text-[#888] text-xs mb-1.5 block">WhatsApp Number</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">+</span>
            <input
              value={number}
              onChange={e => setNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="263771465624"
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#333]"
            />
          </div>
          <p className="text-[#444] text-xs mt-1.5">
            Format: country code + number (e.g. 263771465624 for Zimbabwe)
          </p>
        </div>

        {number && (
          <div className="bg-[#111] rounded-xl p-3 border border-white/8">
            <p className="text-[#555] text-xs mb-1">Preview link:</p>
            <p className="text-[#B6FF00] text-xs font-mono break-all">
              https://wa.me/{number}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !number.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#B6FF00] text-black font-bold text-sm rounded-xl hover:bg-[#c8ff1a] transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Number
          </button>
          <SavedIndicator saved={saved} />
        </div>
      </div>
    </SettingCard>
  )
}

function PricingSettings() {
  const settings      = useAdminStore(s => s.settings)
  const updateSetting  = useAdminStore(s => s.updateSetting)
  const updateDesign   = useAdminStore(s => s.updateDesign)
  const designs        = useAdminStore(s => s.designs)
  const addToast       = useToastStore(s => s.addToast)

  const [basePrice,    setBasePrice]    = useState('')
  const [premiumPrice, setPremiumPrice] = useState('')
  const [currency,     setCurrency]     = useState('USD')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [applyAll,     setApplyAll]     = useState(false)

  useEffect(() => {
    if (settings.base_price)    setBasePrice(settings.base_price)
    if (settings.premium_price) setPremiumPrice(settings.premium_price)
    if (settings.currency)      setCurrency(settings.currency)
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const errs = await Promise.all([
      updateSetting('base_price',    basePrice),
      updateSetting('premium_price', premiumPrice),
      updateSetting('currency',      currency),
    ])

    if (applyAll && designs.length > 0) {
      await Promise.all(
        designs.map(d => updateDesign(d.id, { price: parseFloat(basePrice) || 25 }))
      )
    }

    setSaving(false)
    if (errs.some(Boolean)) addToast('Some settings failed to save', 'error')
    else {
      addToast('Pricing updated!', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const inputCls = 'w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#333]'

  return (
    <SettingCard
      icon={DollarSign}
      title="Pricing Configuration"
      description="Set base and premium T-shirt prices across the platform"
      accent="cyan"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#888] text-xs mb-1.5 block">Base Price ($)</label>
            <input
              type="number"
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              placeholder="25"
              className={inputCls}
            />
            <p className="text-[#444] text-xs mt-1">Standard designs</p>
          </div>
          <div>
            <label className="text-[#888] text-xs mb-1.5 block">Premium Price ($)</label>
            <input
              type="number"
              value={premiumPrice}
              onChange={e => setPremiumPrice(e.target.value)}
              placeholder="35"
              className={inputCls}
            />
            <p className="text-[#444] text-xs mt-1">Featured / drops</p>
          </div>
        </div>

        <div>
          <label className="text-[#888] text-xs mb-1.5 block">Currency</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className={inputCls}
          >
            <option value="USD">USD ($)</option>
            <option value="ZWL">ZWL (Z$)</option>
            <option value="ZAR">ZAR (R)</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setApplyAll(a => !a)}
            className={`w-10 h-5 rounded-full transition-colors ${applyAll ? 'bg-[#00D1FF]' : 'bg-white/10'} relative flex-shrink-0`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${applyAll ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-[#888] text-sm">Apply base price to all existing designs ({designs.length})</span>
        </label>

        {applyAll && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 text-orange-400 text-xs">
            This will update the price of all {designs.length} designs to ${basePrice || 25}.
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#00D1FF] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Pricing
          </button>
          <SavedIndicator saved={saved} />
        </div>
      </div>
    </SettingCard>
  )
}

function PlatformInfo() {
  const settings      = useAdminStore(s => s.settings)
  const updateSetting  = useAdminStore(s => s.updateSetting)
  const addToast       = useToastStore(s => s.addToast)

  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    if (settings.platform_name) setName(settings.platform_name)
  }, [settings.platform_name])

  const handleSave = async () => {
    setSaving(true)
    const err = await updateSetting('platform_name', name)
    setSaving(false)
    if (err) addToast('Failed to save', 'error')
    else {
      addToast('Settings saved!', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <SettingCard
      icon={Save}
      title="Platform Settings"
      description="General platform configuration"
      accent="magenta"
    >
      <div className="space-y-3">
        <div>
          <label className="text-[#888] text-xs mb-1.5 block">Platform Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="DRIPRANK"
            className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#B6FF00]/40 placeholder-[#333]"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF006E] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
          <SavedIndicator saved={saved} />
        </div>
      </div>
    </SettingCard>
  )
}

export default function SettingsSection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Platform Settings</h2>
        <p className="text-[#555] text-sm">Configure WhatsApp, pricing and platform details</p>
      </div>
      <WhatsAppSettings />
      <PricingSettings />
      <PlatformInfo />
    </div>
  )
}
