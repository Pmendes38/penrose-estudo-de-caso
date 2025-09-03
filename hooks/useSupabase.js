// Hook personalizado para usar Supabase apenas no client-side
import { useState, useEffect } from 'react';

export const useSupabase = () => {
  const [supabase, setSupabase] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Garantir que está no client-side
    setIsClient(true);
    
    // Importar Supabase dinamicamente apenas no client
    const initSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'CONFIGURE_TOKEN_LOCALMENTE';
        
        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(client);
        
        console.log('✅ Supabase inicializado no client-side');
      } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initSupabase();
    }
  }, []);

  return { supabase, isClient };
};