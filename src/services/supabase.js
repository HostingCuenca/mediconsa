// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkyvcqwmmmpesfpeyjzv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXZjcXdtbW1wZXNmcGV5anp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDMyNzAsImV4cCI6MjA2NTA3OTI3MH0.L9fuqmbfiLF5QiaYI9o9f9tLR4jpWcGcDvEjXV7vvSI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Sin confirmación de email
        flowType: 'implicit'
    }
})

// Configuración para desarrollo
if (process.env.NODE_ENV === 'development') {
    window.supabase = supabase // Para debug en consola
}