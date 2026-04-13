import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// 创建 AsyncStorage 持久化器
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'react-query-cache',
  throttleTime: 1000, // 节流时间，避免频繁写入
});

// 缓存配置 - 定义不同查询的持久化策略
export const cacheConfig = {
  // 文章列表 - 10分钟
  articles: {
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60, // 1小时
  },
  
  // 单词定义 - 24小时（词典数据基本不变）
  wordDefinition: {
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7天
  },
  
  // 单词详情（带上下文）- 2小时
  wordDetailWithContext: {
    staleTime: 1000 * 60 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 24, // 24小时
  },
  
  // 翻译结果 - 1小时
  translation: {
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24, // 24小时
  },
  
  // 生词本 - 5分钟
  vocabularies: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30, // 30分钟
  },
  
  // 新闻头条 - 15分钟
  news: {
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60, // 1小时
  },
} as const;

// 查询键前缀（用于批量操作）
export const queryKeys = {
  articles: ['articles'],
  words: ['words'],
  vocabularies: ['vocabularies'],
  translations: ['translations'],
  news: ['news'],
} as const;

// 清除所有缓存
export const clearAllCache = async () => {
  try {
    await AsyncStorage.removeItem('react-query-cache');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

// 清除特定类型的缓存
export const clearCacheByPrefix = async (prefix: string) => {
  try {
    const cache = await AsyncStorage.getItem('react-query-cache');
    if (cache) {
      const parsed = JSON.parse(cache);
      const queries = parsed?.queries || [];
      
      // 过滤掉匹配前缀的查询
      const filteredQueries = queries.filter((query: any) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return !queryKey.some((key: any) => 
            typeof key === 'string' && key.startsWith(prefix)
          );
        }
        return true;
      });
      
      await AsyncStorage.setItem('react-query-cache', JSON.stringify({
        ...parsed,
        queries: filteredQueries,
      }));
    }
  } catch (error) {
    console.error('Failed to clear cache by prefix:', error);
  }
};

// 获取缓存统计信息
export const getCacheStats = async () => {
  try {
    const cache = await AsyncStorage.getItem('react-query-cache');
    if (cache) {
      const parsed = JSON.parse(cache);
      const queries = parsed?.queries || [];
      
      return {
        totalQueries: queries.length,
        totalSize: new Blob([cache]).size,
        queries: queries.map((q: any) => ({
          key: JSON.stringify(q.queryKey),
          dataLength: q.state?.data ? (Array.isArray(q.state.data) ? q.state.data.length : typeof q.state.data === 'string' ? q.state.data.length : Object.keys(q.state.data).length) : 0,
          fetchedAt: new Date(q.state?.dataUpdatedAt).toLocaleString(),
        })),
      };
    }
    return { totalQueries: 0, totalSize: 0, queries: [] };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { totalQueries: 0, totalSize: 0, queries: [] };
  }
};
