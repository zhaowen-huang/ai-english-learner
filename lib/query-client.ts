import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存 5 分钟
      staleTime: 1000 * 60 * 5,
      // 缓存数据保留 30 分钟
      gcTime: 1000 * 60 * 30,
      // 请求失败重试 2 次
      retry: 2,
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 突变失败重试 1 次
      retry: 1,
    },
  },
});
