import { supabase } from './supabase';

export interface AICacheEntry {
  id: string;
  content_type: string;
  content_hash: string;
  input_data: any;
  output_data: any;
  created_at: string;
  updated_at: string;
}

// 简单哈希函数
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return Math.abs(hash).toString(36);
}

// 生成输入数据的哈希
function generateContentHash(contentType: string, ...args: any[]): string {
  const inputString = JSON.stringify({ type: contentType, args });
  return hashString(inputString);
}

export const aiCacheService = {
  // 根据内容类型和输入数据获取缓存
  async getFromCache(contentType: string, ...args: any[]): Promise<any | null> {
    try {
      const contentHash = generateContentHash(contentType, ...args);
      
      const { data, error } = await supabase
        .from('ai_cache')
        .select('output_data')
        .eq('content_type', contentType)
        .eq('content_hash', contentHash)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // 未找到记录
          return null;
        }
        throw error;
      }
      
      console.log(`[AI Cache] ✅ Cache hit for ${contentType}`);
      
      // output_data 在数据库中存储为 JSON 字符串，需要解析
      if (data?.output_data) {
        try {
          return typeof data.output_data === 'string' ? JSON.parse(data.output_data) : data.output_data;
        } catch (parseError) {
          console.error('[AI Cache] Failed to parse output_data:', parseError);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('[AI Cache] Failed to get from cache:', error);
      return null;
    }
  },

  // 保存 AI 生成结果到缓存
  async saveToCache(
    contentType: string,
    inputArgs: any[],
    outputData: any
  ): Promise<void> {
    try {
      const contentHash = generateContentHash(contentType, ...inputArgs);
      
      // 使用 upsert 避免重复插入
      const { error } = await supabase
        .from('ai_cache')
        .upsert(
          {
            content_type: contentType,
            content_hash: contentHash,
            input_data: JSON.stringify(inputArgs),
            output_data: JSON.stringify(outputData),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'content_type,content_hash',
          }
        );
      
      if (error) throw error;
      
      console.log(`[AI Cache] ✅ Saved to cache: ${contentType}`);
    } catch (error) {
      console.error('[AI Cache] Failed to save to cache:', error);
    }
  },

  // 检查缓存是否存在
  async existsInCache(contentType: string, ...args: any[]): Promise<boolean> {
    try {
      const contentHash = generateContentHash(contentType, ...args);
      
      const { count, error } = await supabase
        .from('ai_cache')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', contentType)
        .eq('content_hash', contentHash);
      
      if (error) throw error;
      
      return (count || 0) > 0;
    } catch (error) {
      console.error('[AI Cache] Failed to check cache:', error);
      return false;
    }
  },

  // 清除特定类型的缓存
  async clearCacheByType(contentType: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_cache')
        .delete()
        .eq('content_type', contentType);
      
      if (error) throw error;
      
      console.log(`[AI Cache] 🗑️ Cleared cache for: ${contentType}`);
    } catch (error) {
      console.error('[AI Cache] Failed to clear cache:', error);
    }
  },

  // 清除所有缓存
  async clearAllCache(): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      
      console.log('[AI Cache] 🗑️ Cleared all cache');
    } catch (error) {
      console.error('[AI Cache] Failed to clear all cache:', error);
    }
  },

  // 获取缓存统计信息
  async getCacheStats(): Promise<{ total: number; byType: Record<string, number> }> {
    try {
      // 获取总数
      const { count: totalCount, error: totalError } = await supabase
        .from('ai_cache')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // 获取各类型数量
      const { data: typeData, error } = await supabase
        .from('ai_cache')
        .select('content_type')
        .order('content_type');
      
      const byType: Record<string, number> = {};
      if (typeData) {
        typeData.forEach((item: any) => {
          byType[item.content_type] = (byType[item.content_type] || 0) + 1;
        });
      }
      
      return {
        total: totalCount || 0,
        byType,
      };
    } catch (error) {
      console.error('[AI Cache] Failed to get stats:', error);
      return { total: 0, byType: {} };
    }
  },
};

// 内容类型常量
export const AIContentType = {
  WORD_DETAIL: 'word_detail',
  WORD_DETAIL_WITH_CONTEXT: 'word_detail_with_context',
  TRANSLATE_TEXT: 'translate_text',
  TRANSLATE_SENTENCES: 'translate_sentences',
} as const;
