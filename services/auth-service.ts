import { supabase } from './supabase';
import type { User, Session, AuthResponse } from '@/types/user';
import { convertSupabaseUser } from '@/types/user';
import { getAuthErrorMessage } from '@/utils/validation';

export const authService = {
  /**
   * 注册新用户
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('📡 Calling Supabase signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase signUp error:', error);
        throw new Error(getAuthErrorMessage(error.message));
      }

      if (!data.user) {
        throw new Error('注册失败，请稍后重试');
      }

      // 创建用户资料
      await this.createUserProfile(data.user);

      // 如果自动登录成功，返回会话信息
      if (data.session) {
        return {
          user: convertSupabaseUser(data.user),
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at ?? 0,
            user: convertSupabaseUser(data.user),
          },
        };
      }

      // 如果没有会话（需要邮箱验证），尝试自动登录
      console.log('🔄 Auto sign-in after registration...');
      const signInResult = await this.signIn(email, password);
      return signInResult;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  /**
   * 创建用户资料
   */
  async createUserProfile(user: any): Promise<void> {
    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.warn('创建用户资料失败（请检查 profiles 表是否存在）:', error.message);
      }
    } catch (error: any) {
      console.warn('创建用户资料异常:', error.message);
    }
  },

  /**
   * 用户登录
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(getAuthErrorMessage(error.message));
      }

      if (!data.user || !data.session) {
        throw new Error('登录失败，请稍后重试');
      }

      return {
        user: convertSupabaseUser(data.user),
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at ?? 0,
          user: convertSupabaseUser(data.user),
        },
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  /**
   * 退出登录
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error('退出登录失败');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }
      return convertSupabaseUser(user);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * 获取当前会话
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        return null;
      }

      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? 0,
        user: convertSupabaseUser(session.user),
      };
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  },

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const convertedSession = session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? 0,
        user: convertSupabaseUser(session.user),
      } : null;

      callback(event, convertedSession);
    });
  },

  /**
   * 重置密码
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw new Error(getAuthErrorMessage(error.message));
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(updates: { username?: string; avatarUrl?: string }): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error || !user) {
        throw new Error('更新资料失败');
      }

      return convertSupabaseUser(user);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
