import { useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert, RefreshControl,
} from 'react-native'
import { useAdminStore } from '../store/adminStore'
import Badge from '../components/Badge'

const FILTERS = ['all', 'public', 'private', 'featured']

function DesignItem({ item, onToggleVisibility, onToggleFeatured, onDelete }) {
  return (
    <View style={s.item}>
      {/* Thumb */}
      <View style={s.thumb}>
        {item.image
          ? <Image source={{ uri: item.image }} style={s.thumbImg} />
          : <Text style={s.thumbPlaceholder}>?</Text>
        }
      </View>

      {/* Info */}
      <View style={s.info}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>{item.name}</Text>
          {item.featured && <Text style={s.star}>★</Text>}
        </View>
        <View style={s.badges}>
          <Badge type={item.visibility} />
          {item.price ? <Text style={s.price}>${item.price}</Text> : null}
        </View>
        <Text style={s.meta}>❤ {item.likes||0}  &nbsp;📦 {item.all_time_orders||0} orders</Text>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onToggleFeatured(item)}>
          <Text style={[s.actionIcon, item.featured && { color: '#B6FF00' }]}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => onToggleVisibility(item)}>
          <Text style={s.actionIcon}>{item.visibility === 'public' ? '👁' : '🔒'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => onDelete(item)}>
          <Text style={[s.actionIcon, { color: '#FF006E' }]}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function DesignsScreen() {
  const designs          = useAdminStore(s => s.designs)
  const updateDesign     = useAdminStore(s => s.updateDesign)
  const deleteDesign     = useAdminStore(s => s.deleteDesign)
  const fetchDesigns     = useAdminStore(s => s.fetchDesigns)
  const loading          = useAdminStore(s => s.loading)

  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  const filtered = designs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all'      ? true
                      : filter === 'featured' ? d.featured
                      : d.visibility === filter
    return matchSearch && matchFilter
  })

  const handleToggleVisibility = async (d) => {
    const next = d.visibility === 'public' ? 'private' : 'public'
    await updateDesign(d.id, { visibility: next })
  }

  const handleToggleFeatured = async (d) => {
    await updateDesign(d.id, { featured: !d.featured })
  }

  const handleDelete = (d) => {
    Alert.alert(
      'Delete Design',
      `Are you sure you want to delete "${d.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDesign(d.id) },
      ]
    )
  }

  return (
    <View style={s.root}>
      {/* Search */}
      <View style={s.header}>
        <TextInput
          style={s.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search designs…"
          placeholderTextColor="#444"
        />
      </View>

      {/* Filter chips */}
      <View style={s.chips}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <Text style={s.count}>{filtered.length} designs</Text>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <DesignItem
            item={item}
            onToggleVisibility={handleToggleVisibility}
            onToggleFeatured={handleToggleFeatured}
            onDelete={handleDelete}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDesigns} tintColor="#B6FF00" />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={s.empty}>No designs found</Text>}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0D0D0D' },
  header:         { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  search:         { backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: '#F5F5F5', fontSize: 14 },
  chips:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  chip:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive:     { backgroundColor: 'rgba(182,255,0,0.1)', borderColor: 'rgba(182,255,0,0.3)' },
  chipText:       { fontSize: 12, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#B6FF00' },
  count:          { paddingHorizontal: 16, fontSize: 11, color: '#444', marginBottom: 6 },
  item:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 12 },
  thumb:          { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1A1A1A', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  thumbImg:       { width: '100%', height: '100%' },
  thumbPlaceholder: { color: '#333', fontSize: 16 },
  info:           { flex: 1 },
  nameRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:           { fontSize: 14, fontWeight: '700', color: '#F5F5F5', flex: 1 },
  star:           { color: '#B6FF00', fontSize: 12 },
  badges:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price:          { fontSize: 11, color: '#B6FF00', fontWeight: '700' },
  meta:           { fontSize: 11, color: '#444', marginTop: 4 },
  actions:        { flexDirection: 'column', gap: 4 },
  actionBtn:      { padding: 6 },
  actionIcon:     { fontSize: 16, color: '#555' },
  empty:          { textAlign: 'center', color: '#333', fontSize: 14, marginTop: 60 },
})
