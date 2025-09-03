import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticação ao carregar
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Verificar se estamos no cliente
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const currentUser = AuthService.getCurrentUser();
      const authenticated = AuthService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await AuthService.login(email, password);
      
      // Atualizar estado
      setUser(result.user);
      setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Redirecionar para login após logout
    router.push('/login');
  };

  const isAdmin = () => {
    return AuthService.isAdmin();
  };

  // Função para proteger rotas
  const requireAuth = (callback) => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Função para proteger rotas de admin
  const requireAdmin = (callback) => {
    if (!loading && (!isAuthenticated || !isAdmin())) {
      router.push('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    isAdmin,
    checkAuth,
    requireAuth,
    requireAdmin
  };
};
