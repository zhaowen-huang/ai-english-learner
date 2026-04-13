import { supabase } from './supabase';
import type { Article } from '@/types/article';

export const articleService = {
  // 获取所有文章
  async getArticles(difficulty?: string) {
    let query = supabase.from('articles').select('*').order('created_at', { ascending: false });
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Article[];
  },

  // 获取单篇文章
  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Article;
  },

  // 搜索文章
  async searchArticles(keyword: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Article[];
  },

  // 获取推荐文章（随机）
  async getRecommendedArticles(limit = 5) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data as Article[];
  },
};
