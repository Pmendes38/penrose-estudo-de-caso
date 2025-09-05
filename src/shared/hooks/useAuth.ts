import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../lib/auth';

interface LoginResult {
  success: boolean;
  user: any;
  role: string;
  redirect: string;
  message: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      const currentUser = AuthService.getCurrentUser();
      const authenticated = AuthService.isAuthenticated();
      setUser(currentUser);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const result = await AuthService.login(email, password);
      setUser(result.user as any);
      setIsAuthenticated(true);
      return result as LoginResult;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const isAdmin = () => AuthService.isAdmin();

  const requireAuth = (callback?: () => void) => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return false;
    }
    callback?.();
    return true;
  };

  const requireAdmin = (callback?: () => void) => {
    if (!loading && (!isAuthenticated || !isAdmin())) {
      router.push('/login');
      return false;
    }
    callback?.();
    return true;
  };

  return { user, loading, isAuthenticated, login, logout, isAdmin, checkAuth, requireAuth, requireAdmin };
};
