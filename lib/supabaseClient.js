// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// URLs do Supabase - usar valores válidos para build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'CONFIGURE_TOKEN_LOCALMENTE';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Testar conexão apenas no client-side 
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }
  });
}
