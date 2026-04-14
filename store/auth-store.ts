import { create } from 'zustand';
import type { AuthState, User, Session } from '@/types/user';
import { authService } from '@/services/auth-service';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
  }),
  
  setSession: (session) => set({ 
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
  }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  logout: async () => {
    try {
      await authService.signOut();
    } catch (error: any) {
      console.error('Logout error:', error.message);
    } finally {
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false,
        error: null,
      });
    }
  },
}));

/**
 * 初始化认证状态
 */
export const initializeAuth = async () => {
  try {
    const session = await authService.getCurrentSession();
    if (session?.user) {
      useAuthStore.getState().setSession(session);
    }
  } catch (error: any) {
    console.log('No active session found');
    useAuthStore.getState().setError(error.message);
  } finally {
    useAuthStore.setState({ isLoading: false });
  }
};

/**
 * 设置认证监听器
 */
export const setupAuthListener = () => {
  const { setSession, setError } = useAuthStore.getState();
  
  const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event);
    
    if (session) {
      setSession(session);
      setError(null);
    } else {
      setSession(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};
