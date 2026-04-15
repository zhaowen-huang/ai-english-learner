import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 创建 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit', // 使用 implicit flow，无需邮件验证
  },
});

// 类型定义
export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          word_count: number;
          estimated_time: number;
          image_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          word_count: number;
          estimated_time: number;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          category?: string;
          word_count?: number;
          estimated_time?: number;
          image_url?: string;
          created_at?: string;
        };
      };
      vocabularies: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          meaning: string;
          example?: string;
          context_sentence?: string;
          article_url?: string;
          article_id?: string;
          created_at: string;
          review_count: number;
          last_review_at?: string;
          mastered: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          meaning: string;
          example?: string;
          context_sentence?: string;
          article_url?: string;
          article_id?: string;
          created_at?: string;
          review_count?: number;
          last_review_at?: string;
          mastered?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          meaning?: string;
          example?: string;
          context_sentence?: string;
          article_url?: string;
          article_id?: string;
          created_at?: string;
          review_count?: number;
          last_review_at?: string;
          mastered?: boolean;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          progress: number;
          time_spent: number;
          completed: boolean;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          progress?: number;
          time_spent?: number;
          completed?: boolean;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          progress?: number;
          time_spent?: number;
          completed?: boolean;
          last_read_at?: string;
        };
      };
      ai_cache: {
        Row: {
          id: string;
          content_type: string;
          content_hash: string;
          input_data: any;
          output_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_type: string;
          content_hash: string;
          input_data?: any;
          output_data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_type?: string;
          content_hash?: string;
          input_data?: any;
          output_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
