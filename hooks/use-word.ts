import { useQuery, useMutation } from '@tanstack/react-query';
import { dictionaryService } from '@/services/dictionary-service';
import { aliyunLLMService } from '@/services/aliyun-llm-service';
import { cacheConfig } from '@/lib/cache-config';

// 词典查询
export function useWordDefinition(word: string | null) {
  return useQuery({
    queryKey: ['word-definition', word],
    queryFn: () => dictionaryService.lookupWord(word!),
    enabled: !!word && word.length > 0,
    staleTime: cacheConfig.wordDefinition.staleTime,
    gcTime: cacheConfig.wordDefinition.gcTime,
  });
}

// LLM 单词详情（带上下文，上下文可选）
export function useWordDetailWithContext(word: string | null, context: string | null) {
  return useQuery({
    queryKey: ['word-detail-context', word, context || ''],
    queryFn: () => {
      if (!word) throw new Error('Word is required');
      // 如果没有上下文，使用空字符串
      return aliyunLLMService.getWordDetailWithContext(context || '', word);
    },
    enabled: !!word && word.length > 0,
    staleTime: cacheConfig.wordDetailWithContext.staleTime,
    gcTime: cacheConfig.wordDetailWithContext.gcTime,
  });
}

// LLM 翻译句子 (mutation)
export function useTranslateSentences() {
  return useMutation({
    mutationFn: (sentences: string[]) => aliyunLLMService.translateSentences(sentences),
  });
}

// LLM 翻译句子 (query - 用于缓存)
export function useTranslateSentencesQuery(sentences: string[] | null) {
  return useQuery({
    queryKey: ['translate-sentences', sentences],
    queryFn: () => {
      if (!sentences || sentences.length === 0) return [];
      return aliyunLLMService.translateSentences(sentences);
    },
    enabled: !!sentences && sentences.length > 0,
    staleTime: cacheConfig.translation.staleTime,
    gcTime: cacheConfig.translation.gcTime,
  });
}

// 单个文本翻译
export function useTranslateText(text: string | null) {
  return useQuery({
    queryKey: ['translate-text', text],
    queryFn: () => {
      if (!text) return '';
      return aliyunLLMService.translateText(text);
    },
    enabled: !!text && text.length > 0,
    staleTime: cacheConfig.translation.staleTime,
    gcTime: cacheConfig.translation.gcTime,
  });
}
