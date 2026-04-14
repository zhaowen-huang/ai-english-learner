import { useQuery } from '@tanstack/react-query';
import { aiNewsService } from '@/services/ai-news-service';
import { cacheConfig } from '@/lib/cache-config';

// AI News 文章列表 (TechCrunch)
export function useAINewsArticles(forceRefresh = false) {
  return useQuery({
    queryKey: ['ai-news-articles', forceRefresh],
    queryFn: () => aiNewsService.fetchArticles(forceRefresh),
    staleTime: cacheConfig.articles.staleTime,
    gcTime: cacheConfig.articles.gcTime,
  });
}
