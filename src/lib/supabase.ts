import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseDatabase } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<SupabaseDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}