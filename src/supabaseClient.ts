import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cfmkrihszjfptnnqvfbw.supabase.co'
const supabaseKey = 'supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbWtyaWhzempmcHRubnF2ZmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MjI0NTcsImV4cCI6MjA1NjI5ODQ1N30.BdqbosyU8HTbGuihu9ZN3LuaNM0XlNfAn1uGz3Nfr7o'

export const supabase = createClient(supabaseUrl, supabaseKey)