import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { useAdminStore } from '../store/adminStore'
import { useAuthStore }  from '../store/authStore'

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  )
}

function Field({ label, value, onChange, hint, keyboardType = 'default', prefix }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.inputWrap}>
        {prefix ? <Text style={s.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[s.input, prefix && { paddingLeft: 28 }]}
          value={String(value || '')}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholderTextColor="#333"
          selectionColor="#B6FF00"
        />
      </View>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  )
}

function SaveBtn({ onPress, loading, color = '#B6FF00', textColor = '#000', label = 'Save' }) {
  return (
    <TouchableOpacity
      style={[s.saveBtn, { backgroundColor: color }, loading && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[s.saveBtnText, { color: textColor }]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

function WhatsAppSection() {
  const settings      = useAdminStore(s => s.settings)
  const updateSetting = useAdminStore(s => s.updateSetting)
  const [number, setNumber] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings.whatsapp_number) setNumber(settings.whatsapp_number)
  }, [settings.whatsapp_number])

  const save = async () => {
    if (!number.trim()) return
    setSaving(true)
    const err = await updateSetting('whatsapp_number', number.trim())
    setSaving(false)
    if (err) Alert.alert('Error', 'Failed to update number.')
    else Alert.alert('Saved ✓', 'WhatsApp number updated.')
  }

  return (
    <Section title="💬  WhatsApp">
      <Field
        label="Contact Number"
        value={number}
        onChange={v => setNumber(v.replace(/\D/g, ''))}
        hint="All Buy Now buttons use this number. Format: 263771XXXXXX"
        keyboardType="phone-pad"
        prefix="+"
      />
      {number ? (
        <Text style={s.preview}>wa.me/{number}</Text>
      ) : null}
      <SaveBtn onPress={save} loading={saving} label="Update Number" />
    </Section>
  )
}

function PricingSection() {
  const settings       = useAdminStore(s => s.settings)
  const updateSetting  = useAdminStore(s => s.updateSetting)
  const designs        = useAdminStore(s => s.designs)
  const updateDesign   = useAdminStore(s => s.updateDesign)

  const [base,     setBase]     = useState('')
  const [premium,  setPremium]  = useState('')
  const [applyAll, setApplyAll] = useState(false)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    if (settings.base_price)    setBase(settings.base_price)
    if (settings.premium_price) setPremium(settings.premium_price)
  }, [settings])

  const save = async () => {
    setSaving(true)
    await Promise.all([
      updateSetting('base_price',    base),
      updateSetting('premium_price', premium),
    ])
    if (applyAll && designs.length) {
      await Promise.all(designs.map(d => updateDesign(d.id, { price: parseFloat(base) || 25 })))
    }
    setSaving(false)
    Alert.alert('Saved ✓', `Pricing updated${applyAll ? ` across ${designs.length} designs` : ''}.`)
  }

  return (
    <Section title="💰  Pricing">
      <View style={s.row2}>
        <View style={{ flex: 1 }}>
          <Field label="Base Price ($)" value={base} onChange={setBase} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Premium Price ($)" value={premium} onChange={setPremium} keyboardType="numeric" />
        </View>
      </View>
      <View style={s.toggleRow}>
        <Text style={s.toggleLabel}>Apply base price to all {designs.length} designs</Text>
        <Switch
          value={applyAll}
          onValueChange={setApplyAll}
          trackColor={{ false: '#222', true: 'rgba(0,209,255,0.4)' }}
          thumbColor={applyAll ? '#00D1FF' : '#444'}
        />
      </View>
      {applyAll && (
        <Text style={s.warn}>
          ⚠ Will set ${base || 25} as the price for all {designs.length} designs.
        </Text>
      )}
      <SaveBtn onPress={save} loading={saving} color="#00D1FF" label="Save Pricing" />
    </Section>
  )
}

function AccountSection() {
  const profile  = useAuthStore(s => s.profile)
  const signOut  = useAuthStore(s => s.signOut)

  return (
    <Section title="👤  Account">
      <View style={s.accountRow}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{profile?.username?.[0]?.toUpperCase() || 'A'}</Text>
        </View>
        <View>
          <Text style={s.username}>{profile?.username}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>⚡ ADMIN</Text>
          </View>
        </View>
      </View>
      <SaveBtn
        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ])}
        loading={false}
        color="#FF006E"
        textColor="#fff"
        label="Sign Out"
      />
    </Section>
  )
}

export default function SettingsScreen() {
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.heading}>Settings</Text>
      <Text style={s.sub}>Platform configuration</Text>
      <WhatsAppSection />
      <PricingSection />
      <AccountSection />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0D0D0D' },
  content:     { padding: 20, paddingBottom: 60 },
  heading:     { fontSize: 26, fontWeight: '900', color: '#F5F5F5', letterSpacing: -0.5 },
  sub:         { fontSize: 13, color: '#555', marginBottom: 20 },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 10, letterSpacing: 1 },
  card:        { backgroundColor: '#111', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18, gap: 14 },
  field:       { gap: 6 },
  fieldLabel:  { fontSize: 11, color: '#555', letterSpacing: 0.5 },
  inputWrap:   { position: 'relative' },
  prefix:      { position: 'absolute', left: 12, top: 14, color: '#555', fontSize: 15, zIndex: 1 },
  input:       { backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: '#F5F5F5', fontSize: 15 },
  hint:        { fontSize: 11, color: '#444' },
  preview:     { fontSize: 12, color: '#B6FF00', fontFamily: 'monospace', backgroundColor: 'rgba(182,255,0,0.06)', padding: 10, borderRadius: 10 },
  saveBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  row2:        { flexDirection: 'row', gap: 12 },
  toggleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 13, color: '#888', flex: 1, marginRight: 12 },
  warn:        { fontSize: 12, color: '#FF8C00', backgroundColor: 'rgba(255,140,0,0.08)', padding: 10, borderRadius: 10 },
  accountRow:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(182,255,0,0.1)', borderWidth: 1, borderColor: 'rgba(182,255,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: '#B6FF00', fontSize: 18, fontWeight: '900' },
  username:    { fontSize: 16, fontWeight: '700', color: '#F5F5F5' },
  roleBadge:   { backgroundColor: 'rgba(182,255,0,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  roleText:    { fontSize: 10, color: '#B6FF00', fontWeight: '800', letterSpacing: 0.5 },
})
