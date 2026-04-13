import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export const progressService = {
  // 保存阅读进度到本地
  async saveProgressLocally(articleId: string, progress: number, timeSpent: number) {
    try {
      await AsyncStorage.setItem(
        `reading_${articleId}`,
        JSON.stringify({
          progress,
          timeSpent,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to save progress locally:', error);
    }
  },

  // 从本地获取阅读进度
  async getProgressLocally(articleId: string) {
    try {
      const data = await AsyncStorage.getItem(`reading_${articleId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get progress locally:', error);
      return null;
    }
  },

  // 同步进度到云端
  async syncProgressToCloud(userId: string, articleId: string, progress: number, timeSpent: number, completed: boolean = false) {
    try {
      // 检查 articleId 是否为有效 UUID
      const isValidUUID = articleId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      // Guardian API 等非 UUID 格式的文章 ID 不同步到云端（数据库只支持 UUID）
      // 本地进度仍会正常保存
      if (!isValidUUID) {
        console.log('Skipping cloud sync for non-UUID article ID (local storage still works)');
        return null;
      }
      
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          article_id: articleId,
          progress,
          time_spent: timeSpent,
          completed,
          last_read_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Failed to sync progress to cloud:', error);
      return null;
    }
  },

  // 获取用户的阅读进度
  async getUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return [];
    }
  },

  // 获取文章完成数量
  async getCompletedArticlesCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Failed to get completed articles count:', error);
      return 0;
    }
  },

  // 获取总阅读时长（秒）
  async getTotalReadingTime(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('time_spent')
        .eq('user_id', userId);

      if (error) throw error;
      
      const totalTime = data?.reduce((sum, item) => sum + (item.time_spent || 0), 0) || 0;
      return totalTime;
    } catch (error) {
      console.error('Failed to get total reading time:', error);
      return 0;
    }
  },
};
