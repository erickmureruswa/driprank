import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

import { useAuthStore }  from './store/authStore'
import { useAdminStore } from './store/adminStore'

import LoginScreen   from './screens/LoginScreen'
import OverviewScreen from './screens/OverviewScreen'
import DesignsScreen  from './screens/DesignsScreen'
import SalesScreen    from './screens/SalesScreen'
import SettingsScreen from './screens/SettingsScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const TAB_ICONS = {
  Overview: '📊',
  Designs:  '👕',
  Sales:    '📦',
  Settings: '⚙️',
}

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={tb.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index
        const onPress = () => {
          if (!focused) navigation.navigate(route.name)
        }
        return (
          <View key={route.key} style={tb.item}>
            <Text
              onPress={onPress}
              style={[tb.icon, focused && tb.iconActive]}
            >
              {TAB_ICONS[route.name]}
            </Text>
            <Text style={[tb.label, focused && tb.labelActive]}>
              {route.name}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

function AdminTabs() {
  const initAdmin   = useAdminStore(s => s.initAdmin)
  const unsubscribe = useAdminStore(s => s.unsubscribe)

  useEffect(() => {
    initAdmin()
    return () => unsubscribe()
  }, [])

  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerStyle:     { backgroundColor: '#0f0f0f' },
        headerTintColor: '#F5F5F5',
        headerTitleStyle:{ fontWeight: '800', letterSpacing: 1 },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#B6FF00' }} />
              <Text style={{ color: '#B6FF00', fontSize: 10, fontWeight: '700' }}>LIVE</Text>
            </View>
          </View>
        ),
      }}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="Designs"  component={DesignsScreen}  options={{ title: 'Designs' }} />
      <Tab.Screen name="Sales"    component={SalesScreen}    options={{ title: 'Sales' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  )
}

function AccessDenied({ onSignOut }) {
  return (
    <SafeAreaView style={[cs.center, { backgroundColor: '#0D0D0D' }]}>
      <Text style={{ fontSize: 48 }}>🛡</Text>
      <Text style={cs.denyTitle}>Access Denied</Text>
      <Text style={cs.denySub}>Admin role required.</Text>
      <Text onPress={onSignOut} style={cs.denyLink}>Sign out</Text>
    </SafeAreaView>
  )
}

function AuthGate() {
  const user    = useAuthStore(s => s.user)
  const profile = useAuthStore(s => s.profile)
  const loading = useAuthStore(s => s.loading)
  const signOut = useAuthStore(s => s.signOut)

  if (loading) {
    return (
      <View style={cs.center}>
        <View style={cs.bolt}><Text style={{ fontSize: 22 }}>⚡</Text></View>
        <ActivityIndicator color="#B6FF00" size="large" style={{ marginTop: 24 }} />
        <Text style={cs.loadText}>DRIPRANK ADMIN</Text>
      </View>
    )
  }

  if (!user) return null // Stack shows Login

  if (profile?.role !== 'admin') {
    return <AccessDenied onSignOut={signOut} />
  }

  return null // Stack shows Admin tabs
}

function injectPWA() {
  const head = document.head
  const set = (tag, attrs) => {
    const sel = Object.entries(attrs).filter(([k]) => k !== 'content' && k !== 'href').map(([k, v]) => `[${k}="${v}"]`).join('')
    if (!head.querySelector(`${tag}${sel}`)) {
      const el = document.createElement(tag)
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      head.appendChild(el)
    }
  }
  set('link', { rel: 'manifest', href: '/manifest.json' })
  set('meta', { name: 'theme-color', content: '#B6FF00' })
  set('meta', { name: 'mobile-web-app-capable', content: 'yes' })
  set('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' })
  set('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' })
  set('meta', { name: 'apple-mobile-web-app-title', content: 'DR Admin' })
  set('link', { rel: 'apple-touch-icon', href: '/icon.svg' })
  set('meta', { name: 'application-name', content: 'DripRank Admin' })
  set('meta', { name: 'msapplication-TileColor', content: '#B6FF00' })

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}

export default function App() {
  const init    = useAuthStore(s => s.init)
  const user    = useAuthStore(s => s.user)
  const profile = useAuthStore(s => s.profile)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => { init() }, [])
  useEffect(() => { if (Platform.OS === 'web') injectPWA() }, [])

  const isAdmin = user && profile?.role === 'admin'

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background:   '#0D0D0D',
            card:         '#0f0f0f',
            text:         '#F5F5F5',
            border:       'rgba(255,255,255,0.06)',
            notification: '#B6FF00',
            primary:      '#B6FF00',
          },
        }}
      >
        {loading ? (
          <View style={[cs.center, { backgroundColor: '#0D0D0D' }]}>
            <View style={cs.bolt}><Text style={{ fontSize: 22 }}>⚡</Text></View>
            <ActivityIndicator color="#B6FF00" size="large" style={{ marginTop: 24 }} />
            <Text style={cs.loadText}>DRIPRANK ADMIN</Text>
          </View>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : profile?.role !== 'admin' ? (
              <Stack.Screen
                name="Denied"
                children={() => <AccessDenied onSignOut={useAuthStore.getState().signOut} />}
              />
            ) : (
              <Stack.Screen name="Admin" component={AdminTabs} />
            )}
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const cs = StyleSheet.create({
  center:    { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  bolt:      { width: 56, height: 56, backgroundColor: '#B6FF00', alignItems: 'center', justifyContent: 'center' },
  loadText:  { color: '#333', fontSize: 12, letterSpacing: 4, marginTop: 16, fontWeight: '700' },
  denyTitle: { fontSize: 24, fontWeight: '800', color: '#F5F5F5', marginTop: 16 },
  denySub:   { fontSize: 14, color: '#555', marginTop: 8 },
  denyLink:  { fontSize: 14, color: '#FF006E', marginTop: 24, fontWeight: '700' },
})

const tb = StyleSheet.create({
  bar:        { flexDirection: 'row', backgroundColor: '#0f0f0f', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: 20, paddingTop: 10 },
  item:       { flex: 1, alignItems: 'center', gap: 3 },
  icon:       { fontSize: 20, opacity: 0.35 },
  iconActive: { opacity: 1 },
  label:      { fontSize: 10, color: '#444', fontWeight: '600' },
  labelActive:{ color: '#B6FF00' },
})
