import { View, Text, StyleSheet } from 'react-native'

export default function MiniBarChart({ data = [], color = '#B6FF00', height = 80 }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <View style={s.container}>
      <View style={[s.bars, { height }]}>
        {data.slice(-14).map((d, i) => {
          const pct = (d.value / max) * 100
          return (
            <View key={i} style={s.barWrap}>
              <View style={[s.bar, { height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }]} />
            </View>
          )
        })}
      </View>
      {data.length > 0 && (
        <View style={s.labels}>
          <Text style={s.label}>{data[0]?.date}</Text>
          <Text style={s.label}>{data[data.length - 1]?.date}</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { width: '100%' },
  bars:      { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barWrap:   { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar:       { width: '100%', borderRadius: 3, minHeight: 2 },
  labels:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label:     { fontSize: 10, color: '#444' },
})
