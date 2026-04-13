import { supabase } from './supabase';
import type { User } from '@/types/user';

export const authService = {
  // 注册
  async signUp(email: string, password: string) {
    console.log('📡 Calling Supabase signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    console.log('📥 Supabase signUp response:', { data: !!data, error: error?.message });
    
    if (error) {
      console.error('❌ Supabase signUp error:', error);
      throw error;
    }

    // 注册成功后自动登录，确保获取 Session
    if (data.user && !data.session) {
      console.log('🔄 Auto sign-in after registration...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📥 Auto sign-in response:', { error: signInError?.message });
      
      if (signInError) throw signInError;
      
      // 写入用户资料到数据库
      if (signInData.user) {
        await this.createUserProfile(signInData.user);
      }
      return signInData;
    }
    
    // 写入用户资料到数据库
    if (data.user) {
      await this.createUserProfile(data.user);
    }

    return data;
  },

  // 创建用户资料
  async createUserProfile(user: any) {
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (error) {
      console.warn('创建用户资料失败（请检查 profiles 表是否存在）:', error);
    }
  },

  // 登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // 退出登录
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 重置密码
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};
