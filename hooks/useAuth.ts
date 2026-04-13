import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth-service';

export const useAuth = () => {
  const { user, session, isAuthenticated, isLoading, setUser, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user as any);
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const data = await authService.signUp(email, password);
    return data;
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    signIn,
    signUp,
    logout,
  };
};
