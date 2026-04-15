import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardianApiService } from '@/services/guardian-api-service';
import { cgtnService } from '@/services/cgtn-service';
import { newsApiService } from '@/services/news-api-service';
import { aiNewsService } from '@/services/ai-news-service';
import { cacheConfig } from '@/lib/cache-config';

// Guardian 文章列表
export function useGuardianArticles(page = 1, pageSize = 30) {
  return useQuery({
    queryKey: ['guardian-articles', page, pageSize],
    queryFn: () => guardianApiService.fetchArticles(page, pageSize),
    staleTime: cacheConfig.articles.staleTime,
    gcTime: cacheConfig.articles.gcTime,
  });
}

// CGTN 文章列表
export function useCgtnArticles(forceRefresh = false) {
  return useQuery({
    queryKey: ['cgtn-articles', forceRefresh],
    queryFn: () => cgtnService.fetchRSSArticles(forceRefresh),
    staleTime: cacheConfig.articles.staleTime,
    gcTime: cacheConfig.articles.gcTime,
  });
}

// NewsAPI 头条
export function useNewsHeadlines(country = 'us', pageSize = 30) {
  return useQuery({
    queryKey: ['news-headlines', country, pageSize],
    queryFn: () => newsApiService.fetchTopHeadlines(country, pageSize),
    staleTime: cacheConfig.news.staleTime,
    gcTime: cacheConfig.news.gcTime,
  });
}

// NewsAPI 所有新闻
export function useNewsEverything(sortBy = 'popularity', pageSize = 20) {
  return useQuery({
    queryKey: ['news-everything', sortBy, pageSize],
    queryFn: () => newsApiService.fetchEverything(sortBy, pageSize),
    staleTime: cacheConfig.news.staleTime,
    gcTime: cacheConfig.news.gcTime,
  });
}

// AI News 文章列表
export function useAINewsArticles(forceRefresh = false) {
  return useQuery({
    queryKey: ['ai-news-articles', forceRefresh],
    queryFn: () => aiNewsService.fetchArticles(forceRefresh),
    staleTime: cacheConfig.articles.staleTime,
    gcTime: cacheConfig.articles.gcTime,
  });
}
