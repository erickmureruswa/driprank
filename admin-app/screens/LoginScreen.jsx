import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native'
import { useAuthStore } from '../store/authStore'

export default function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const signIn  = useAuthStore(s => s.signIn)
  const profile = useAuthStore(s => s.profile)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    const error = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      Alert.alert('Login failed', error.message || 'Invalid credentials.')
      return
    }

    // Role check happens in App.jsx via profile.role
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.inner}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.bolt}>
            <Text style={s.boltIcon}>⚡</Text>
          </View>
          <Text style={s.logo}>DRIPRANK</Text>
          <Text style={s.sub}>Admin Console</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Sign In</Text>
          <Text style={s.hint}>Admin access only</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@driprank.com"
              placeholderTextColor="#333"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#333"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={s.btnText}>Sign In →</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>DRIPRANK · Admin Only</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#0D0D0D' },
  inner:     { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap:  { alignItems: 'center', marginBottom: 36 },
  bolt:      { width: 48, height: 48, backgroundColor: '#B6FF00', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  boltIcon:  { fontSize: 22 },
  logo:      { fontSize: 28, fontWeight: '900', color: '#F5F5F5', letterSpacing: 6 },
  sub:       { fontSize: 12, color: '#555', marginTop: 4, letterSpacing: 2 },
  card:      { backgroundColor: '#111', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 24 },
  title:     { fontSize: 22, fontWeight: '800', color: '#F5F5F5', marginBottom: 4 },
  hint:      { fontSize: 12, color: '#555', marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label:     { fontSize: 11, color: '#666', marginBottom: 8, letterSpacing: 0.5 },
  input:     { backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#F5F5F5', fontSize: 15 },
  btn:       { backgroundColor: '#B6FF00', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:   { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  footer:    { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 32, letterSpacing: 2 },
})
