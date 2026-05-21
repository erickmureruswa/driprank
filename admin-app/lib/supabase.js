import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sjmxnvfhimoqxmbwfcsy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbXhudmZoaW1vcXhtYndmY3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzIxNTcsImV4cCI6MjA5MzY0ODE1N30.SQk6KPbKQLhaJwVepBX2zE_8D3F5OR7yqpxyEaU83K0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})
