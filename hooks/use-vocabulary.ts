import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabularyService } from '@/services/vocabulary-service';
import { useAuthStore } from '@/store/auth-store';
import { cacheConfig } from '@/lib/cache-config';
import { cleanWord } from '@/utils/format';
import type { Vocabulary } from '@/types/vocabulary';

// 获取用户生词本
export function useVocabularies() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['vocabularies', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return vocabularyService.getVocabularies(user.id);
    },
    enabled: !!user,
    staleTime: cacheConfig.vocabularies.staleTime,
    gcTime: cacheConfig.vocabularies.gcTime,
  });
}

// 获取单个生词（通过单词名）
export function useVocabulary(word: string | undefined) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['vocabulary', user?.id, word],
    queryFn: async () => {
      if (!user || !word) {
        throw new Error('User or word not provided');
      }
      const result = await vocabularyService.getVocabularyByWord(user.id, word);
      return result;
    },
    enabled: !!user && !!word,
    staleTime: cacheConfig.vocabularies.staleTime,
    gcTime: cacheConfig.vocabularies.gcTime,
    retry: false, // 不需要重试，因为如果单词不存在就是不存在
  });
}

// 切换收藏状态
export function useToggleWordFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: ({ word, meaning, example, contextSentence, articleUrl }: {
      word: string;
      meaning?: string;
      example?: string;
      contextSentence?: string;
      articleUrl?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return vocabularyService.toggleWordFavorite(
        user.id,
        word,
        meaning,
        example,
        contextSentence,
        articleUrl
      );
    },
    onMutate: async (variables) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['vocabularies', user?.id] });
      
      // 保存之前的值
      const previousVocabularies = queryClient.getQueryData(['vocabularies', user?.id]) as any[] | undefined;
      
      // 清理单词（与 handleWordPress 保持一致）
      const cleaned = cleanWord(variables.word);
      
      // 乐观更新：检查单词是否已在列表中
      const existingWord = previousVocabularies?.find((v) => v.word === cleaned);
      
      if (existingWord) {
        // 如果已存在，从列表中移除（取消收藏）
        queryClient.setQueryData(['vocabularies', user?.id], (old: any) => {
          if (!old) return old;
          return old.filter((v: any) => v.word !== cleaned);
        });
      } else {
        // 如果不存在，添加到列表（收藏）
        const newVocabulary = {
          id: `temp-${Date.now()}`, // 临时 ID
          userId: user?.id,
          word: cleaned,
          meaning: variables.meaning || '',
          example: variables.example || '',
          contextSentence: variables.contextSentence,
          articleUrl: variables.articleUrl,
          reviewCount: 0,
          mastered: false,
          createdAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData(['vocabularies', user?.id], (old: any) => {
          if (!old) return [newVocabulary];
          return [newVocabulary, ...old];
        });
      }
      
      return { previousVocabularies, wasExisting: !!existingWord };
    },
    onError: (err, variables, context) => {
      // 失败时回滚
      if (context?.previousVocabularies) {
        queryClient.setQueryData(['vocabularies', user?.id], context.previousVocabularies);
      }
    },
    onSettled: (data, error, variables) => {
      // 最终使缓存失效并重新获取真实数据
      queryClient.invalidateQueries({ queryKey: ['vocabularies', user?.id] });
    },
  });
}

// 删除生词
export function useDeleteVocabulary() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[DeleteVocabulary] Calling API to delete:', id);
      const result = await vocabularyService.deleteVocabulary(id);
      console.log('[DeleteVocabulary] API response:', result);
      return result;
    },
    onSuccess: async () => {
      console.log('[DeleteVocabulary] onSuccess - refetching data');
      // 直接重新获取数据，不使用乐观更新避免缓存冲突
      try {
        await queryClient.invalidateQueries({ queryKey: ['vocabularies', user?.id] });
      } catch (invalidateError) {
        console.warn('[DeleteVocabulary] invalidateQueries warning (non-critical):', invalidateError);
      }
    },
    onError: (err) => {
      console.error('[DeleteVocabulary] Error:', err);
      // 错误由调用方处理
    },
    // 禁用重试，避免重复删除
    retry: false,
  });
}

// 标记为已掌握
export function useMarkAsMastered() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: ({ id, mastered }: { id: string; mastered: boolean }) =>
      vocabularyService.markAsMastered(id, mastered),
    onMutate: async ({ id, mastered }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['vocabularies', user?.id] });
      
      // 保存之前的值
      const previousVocabularies = queryClient.getQueryData(['vocabularies', user?.id]);
      
      // 乐观更新：更新掌握状态
      queryClient.setQueryData(['vocabularies', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((v: any) => 
          v.id === id ? { ...v, mastered } : v
        );
      });
      
      return { previousVocabularies };
    },
    onError: (err, variables, context) => {
      // 失败时回滚
      if (context?.previousVocabularies) {
        queryClient.setQueryData(['vocabularies', user?.id], context.previousVocabularies);
      }
    },
    onSettled: () => {
      // 最终使缓存失效
      queryClient.invalidateQueries({ queryKey: ['vocabularies', user?.id] });
    },
  });
}

// 增加复习次数
export function useIncrementReviewCount() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (id: string) => vocabularyService.incrementReviewCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', user?.id] });
    },
  });
}
