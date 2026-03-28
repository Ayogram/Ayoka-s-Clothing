import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// This client has elevated permissions (Server-Only)
// DO NOT use on the client side
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key')
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any; // Return null if keys are missing to prevent early crash
