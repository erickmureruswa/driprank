import { View, Text, StyleSheet } from 'react-native'

const ACCENTS = {
  lime:    { border: '#B6FF00', bg: 'rgba(182,255,0,0.08)',   text: '#B6FF00' },
  cyan:    { border: '#00D1FF', bg: 'rgba(0,209,255,0.08)',   text: '#00D1FF' },
  magenta: { border: '#FF006E', bg: 'rgba(255,0,110,0.08)',   text: '#FF006E' },
  orange:  { border: '#FF8C00', bg: 'rgba(255,140,0,0.08)',   text: '#FF8C00' },
  purple:  { border: '#A855F7', bg: 'rgba(168,85,247,0.08)',  text: '#A855F7' },
  white:   { border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.04)', text: '#888' },
}

export default function StatCard({ label, value, sub, accent = 'white', icon }) {
  const c = ACCENTS[accent] || ACCENTS.white
  return (
    <View style={[s.card, { borderColor: c.border, backgroundColor: c.bg }]}>
      {icon && <Text style={s.icon}>{icon}</Text>}
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
      {sub ? <Text style={[s.sub, { color: c.text }]}>{sub}</Text> : null}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minWidth: '46%',
  },
  icon:  { fontSize: 18, marginBottom: 6 },
  value: { fontSize: 22, fontWeight: '900', color: '#F5F5F5', letterSpacing: -0.5 },
  label: { fontSize: 11, color: '#666', marginTop: 2 },
  sub:   { fontSize: 11, fontWeight: '600', marginTop: 4 },
})
