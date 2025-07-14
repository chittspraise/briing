import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto'; // required for React Native

const SUPABASE_URL = 'https://rjntkaamdisyykpgjezm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbnRrYWFtZGlzeXlrcGdqZXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjU3MjMsImV4cCI6MjA2NjcwMTcyM30.SnkV3sMLF_Mw38JZieZxocY-aAkCAO0-MLzmo_ZkpZk'; // keep this secure

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // usually false for mobile apps
  },
});
