import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://giemkmiidvkupvyhpncu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZW1rbWlpZGJrdXB2eWhwbmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MzIzMDgsImV4cCI6MjA3MTQwODMwOH0.hv3nDXVkKNrNik9QjvauceBSntiFu1s13Ygw457TC5Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)