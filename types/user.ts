import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * 应用用户接口
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 认证会话接口
 */
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * 登录凭据
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 注册凭据
 */
export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

/**
 * 将 Supabase User 转换为应用 User
 */
export function convertSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: supabaseUser.user_metadata?.username,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
}
