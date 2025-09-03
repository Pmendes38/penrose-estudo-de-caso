import { supabase } from './supabaseClient';

// Sistema de autenticação que funciona 100% no frontend
export class AuthService {
  // Login direto via Supabase (sem depender de APIs locais)
  static async login(email, password) {
    try {
      console.log('🔐 Tentando login direto via Supabase...');
      
      // Verificar se é admin (hardcoded para funcionar sempre)
      if (email === 'contato@example.com' && password === '123456') {
        console.log('✅ Login de admin realizado com sucesso');
        
        // Salvar dados de admin no localStorage
        const adminUser = {
          id: 'admin-001',
          email: 'contato@example.com',
          role: 'admin',
          name: 'Administrador',
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          user: adminUser,
          role: 'admin',
          redirect: '/admin',
          message: 'Login de admin realizado com sucesso'
        };
      }
      
      // Caso contrário, tentar login via Supabase
      console.log('🔄 Tentando login via Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Erro no Supabase:', error);
        throw new Error('Credenciais inválidas');
      }
      
      console.log('✅ Login via Supabase bem-sucedido');
      
      // Salvar dados do usuário
      const user = {
        id: data.user.id,
        email: data.user.email,
        role: 'cliente',
        name: data.user.user_metadata?.name || 'Cliente',
        created_at: data.user.created_at
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', 'cliente');
      localStorage.setItem('isAuthenticated', 'true');
      
      return {
        success: true,
        user,
        role: 'cliente',
        redirect: '/cliente',
        message: 'Login realizado com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }
  
  // Verificar se o usuário está autenticado
  static isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
  
  // Obter usuário atual
  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Obter role do usuário
  static getUserRole() {
    return localStorage.getItem('userRole') || 'cliente';
  }
  
  // Logout
  static logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    
    // Logout do Supabase também
    supabase.auth.signOut();
  }
  
  // Verificar se é admin
  static isAdmin() {
    return this.getUserRole() === 'admin';
  }
}
