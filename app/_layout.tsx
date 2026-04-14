import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useAuthStore, initializeAuth, setupAuthListener } from '@/store/auth-store';
import { queryClient } from '@/lib/query-client';
import { asyncStoragePersister } from '@/lib/cache-config';
import Loading from '@/components/Loading';

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // 初始化认证状态
    initializeAuth();
    
    // 设置认证监听器
    const unsubscribe = setupAuthListener();
    
    return () => {
      unsubscribe();
    };
  }, []);

  // 等待初始化完成
  if (isLoading) {
    return <Loading message="初始化中..." />;
  }

  // 未登录则只显示登录注册页面
  if (!user) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    );
  }

  // 已登录则显示主应用
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="word/[word]" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
