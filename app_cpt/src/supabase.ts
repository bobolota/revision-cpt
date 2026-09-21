import { createClient } from '@supabase/supabase-js'

// On met directement les clés en dur (format texte) pour contourner le problème du .env
const supabaseUrl = "https://kvredjtsjthpxprgqepf.supabase.co" // 👈 Remplace par ton URL
const supabaseKey = "sb_publishable_Hyd3KChqAL85XeDIArPVsw_HUVMgrLa" // 👈 Remplace par ta vraie clé publique 'anon'

export const supabase = createClient(supabaseUrl, supabaseKey)