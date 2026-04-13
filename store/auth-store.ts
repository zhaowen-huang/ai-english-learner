import { create } from 'zustand';
import type { AuthState, User } from '@/types/user';
import { authService } from '@/services/auth-service';
import { supabase } from '@/services/supabase';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  logout: async () => {
    await authService.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

// 初始化认证状态
export const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      useAuthStore.getState().setUser(session.user as any);
      useAuthStore.getState().setSession(session);
    }
  } catch (error) {
    // 没有会话是正常的，静默处理
    console.log('No active session found');
  } finally {
    useAuthStore.setState({ isLoading: false });
  }
};
