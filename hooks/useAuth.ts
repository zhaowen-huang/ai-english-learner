import { useEffect, useCallback } from 'react';
import { useAuthStore, setupAuthListener } from '@/store/auth-store';
import { authService } from '@/services/auth-service';
import { validateLogin, validateRegister, getAuthErrorMessage } from '@/utils/validation';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/user';

export const useAuth = () => {
  const { 
    user, 
    session, 
    isAuthenticated, 
    isLoading, 
    error,
    setError,
    clearError,
    logout 
  } = useAuthStore();

  // 设置认证监听器
  useEffect(() => {
    const unsubscribe = setupAuthListener();
    return unsubscribe;
  }, []);

  /**
   * 用户登录
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    // 验证输入
    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      setError(validation.error || '验证失败');
      throw new Error(validation.error);
    }

    try {
      clearError();
      const result = await authService.signIn(email, password);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || '登录失败';
      setError(errorMessage);
      throw error;
    }
  }, [setError, clearError]);

  /**
   * 用户注册
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<AuthResponse> => {
    // 验证输入
    const validation = validateRegister(email, password, confirmPassword);
    if (!validation.isValid) {
      setError(validation.error || '验证失败');
      throw new Error(validation.error);
    }

    try {
      clearError();
      const result = await authService.signUp(email, password);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || '注册失败';
      setError(errorMessage);
      throw error;
    }
  }, [setError, clearError]);

  /**
   * 退出登录
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await logout();
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, [logout, setError]);

  /**
   * 重置密码
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      clearError();
      await authService.resetPassword(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, [setError, clearError]);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };
};
