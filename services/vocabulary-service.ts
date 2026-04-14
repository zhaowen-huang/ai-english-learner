import { supabase } from './supabase';
import type { Vocabulary } from '@/types/vocabulary';
import { isValidUUID } from '@/utils/validation';

export const vocabularyService = {
  // 获取用户的所有生词
  async getVocabularies(userId: string) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Vocabulary[];
  },

  // 添加生词
  async addVocabulary(vocab: Omit<Vocabulary, 'id' | 'createdAt' | 'reviewCount' | 'mastered'>) {
    // article_id 可能不是 UUID（比如 CGTN 文章的 ID），所以只在有效时才传入
    const insertData: any = {
      user_id: vocab.userId,
      word: vocab.word,
      meaning: vocab.meaning,
      example: vocab.example,
      context_sentence: vocab.contextSentence,
      article_url: vocab.articleUrl,
    };
    
    // 只有 articleId 是有效的 UUID 时才添加
    if (vocab.articleId && isValidUUID(vocab.articleId)) {
      insertData.article_id = vocab.articleId;
    }
    
    const { data, error } = await supabase
      .from('vocabularies')
      .insert([insertData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Vocabulary;
  },

  // 更新生词
  async updateVocabulary(id: string, updates: Partial<Vocabulary>) {
    const { data, error } = await supabase
      .from('vocabularies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Vocabulary;
  },

  // 删除生词
  async deleteVocabulary(id: string) {
    const { error } = await supabase
      .from('vocabularies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 标记为生词已掌握
  async markAsMastered(id: string, mastered: boolean) {
    return this.updateVocabulary(id, { mastered });
  },

  // 增加复习次数
  async incrementReviewCount(id: string) {
    const vocab = await this.getVocabularyById(id);
    if (vocab) {
      return this.updateVocabulary(id, {
        reviewCount: vocab.reviewCount + 1,
        lastReviewAt: new Date().toISOString(),
      } as any);
    }
  },

  // 获取单个生词
  async getVocabularyById(id: string) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Vocabulary;
  },

  // 根据单词获取生词
  async getVocabularyByWord(userId: string, word: string) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .single();
    
    // PGRST116 表示没有找到记录，这是正常情况，返回 null
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data as Vocabulary | null;
  },

  // 检查单词是否已在生词本中
  async isWordInVocabulary(userId: string, word: string) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('id')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected
      throw error;
    }
    
    return !!data;
  },

  // 切换收藏状态（如果已存在则删除，否则添加）
  async toggleWordFavorite(
    userId: string, 
    word: string, 
    meaning?: string, 
    example?: string,
    contextSentence?: string,
    articleUrl?: string
  ) {
    const exists = await this.isWordInVocabulary(userId, word);
    
    if (exists) {
      // 删除
      await this.deleteByWord(userId, word);
      return false; // 未收藏
    } else {
      // 添加
      await this.addVocabulary({
        userId,
        word: word.toLowerCase(),
        meaning: meaning || '',
        example,
        contextSentence,
        articleUrl,
      });
      return true; // 已收藏
    }
  },

  // 根据单词删除
  async deleteByWord(userId: string, word: string) {
    const { error } = await supabase
      .from('vocabularies')
      .delete()
      .eq('user_id', userId)
      .eq('word', word.toLowerCase());
    
    if (error) throw error;
  },
};
