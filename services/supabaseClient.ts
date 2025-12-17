import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (VPS: rv2ven.com)
const SUPABASE_URL = 'https://supabase-api.rv2ven.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2MnZlbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM5NjAzMjEwLCJleHAiOjIwNTUxNzkyMTB9.dc_X5iR_VP_qT0zsiyj_I_OZ2T9ftRU2BBNWN8Bu4GE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Mantiene la sesión activa si recargas la página
    autoRefreshToken: true,
  }
});