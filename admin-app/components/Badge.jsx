import { View, Text, StyleSheet } from 'react-native'

const CONFIGS = {
  pending:   { bg: 'rgba(255,140,0,0.15)',  text: '#FF8C00',  label: 'PENDING'   },
  confirmed: { bg: 'rgba(0,209,255,0.15)',  text: '#00D1FF',  label: 'CONFIRMED' },
  shipped:   { bg: 'rgba(168,85,247,0.15)', text: '#A855F7',  label: 'SHIPPED'   },
  delivered: { bg: 'rgba(182,255,0,0.15)',  text: '#B6FF00',  label: 'DELIVERED' },
  public:    { bg: 'rgba(182,255,0,0.1)',   text: '#B6FF00',  label: 'PUBLIC'    },
  private:   { bg: 'rgba(255,255,255,0.06)',text: '#666',     label: 'PRIVATE'   },
  admin:     { bg: 'rgba(182,255,0,0.1)',   text: '#B6FF00',  label: 'ADMIN'     },
}

export default function Badge({ type }) {
  const c = CONFIGS[type] || CONFIGS.private
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={[s.text, { color: c.text }]}>{c.label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
})
