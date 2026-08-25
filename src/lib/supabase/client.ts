// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://gessmaeextlfvbhufncr.supabase.co'
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc3NtYWVleHRsZnZiaHVmbmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzMzMTgsImV4cCI6MjEwMjIwOTMxOH0.2NTiCBtgkD7QHR8Dh96xuQQVVhlYofuaLFuJGcJ9Zgw'

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
