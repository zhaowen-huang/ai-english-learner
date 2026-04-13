import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabularyService } from '@/services/vocabulary-service';
import { useAuthStore } from '@/store/auth-store';
import { cacheConfig } from '@/lib/cache-config';

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
      const cleanWord = variables.word.replace(/[^\w]/g, '').toLowerCase();
      
      // 乐观更新：检查单词是否已在列表中
      const existingWord = previousVocabularies?.find((v) => v.word === cleanWord);
      
      if (existingWord) {
        // 如果已存在，从列表中移除（取消收藏）
        queryClient.setQueryData(['vocabularies', user?.id], (old: any) => {
          if (!old) return old;
          return old.filter((v: any) => v.word !== cleanWord);
        });
      } else {
        // 如果不存在，添加到列表（收藏）
        const newVocabulary = {
          id: `temp-${Date.now()}`, // 临时 ID
          userId: user?.id,
          word: cleanWord,
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
    mutationFn: (id: string) => vocabularyService.deleteVocabulary(id),
    onMutate: async (id) => {
      // 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ['vocabularies', user?.id] });
      
      // 保存之前的值以便回滚
      const previousVocabularies = queryClient.getQueryData(['vocabularies', user?.id]);
      
      // 乐观更新：从列表中移除该单词
      queryClient.setQueryData(['vocabularies', user?.id], (old: any) => {
        if (!old) return old;
        return old.filter((v: any) => v.id !== id);
      });
      
      return { previousVocabularies };
    },
    onError: (err, id, context) => {
      // 失败时回滚
      if (context?.previousVocabularies) {
        queryClient.setQueryData(['vocabularies', user?.id], context.previousVocabularies);
      }
    },
    onSettled: () => {
      // 最终使缓存失效以确保同步
      queryClient.invalidateQueries({ queryKey: ['vocabularies', user?.id] });
    },
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
