// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using localStorage fallback.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
})

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl && supabaseAnonKey)
}

// Database types (auto-generated from schema)
export type Database = {
    public: {
        Tables: {
            creatives: {
                Row: {
                    id: string
                    name: string
                    type: 'image' | 'video' | 'copy'
                    url: string | null
                    thumbnail_url: string | null
                    file_size: number | null
                    width: number | null
                    height: number | null
                    tags: string[]
                    used_in_ads: string[]
                    status: 'active' | 'archived'
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['creatives']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['creatives']['Insert']>
            }
            // Add other tables as needed
        }
    }
}
