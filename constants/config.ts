// Supabase 配置
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zxufnsnuvezbwechwjeh.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PHGuVhH5jaQIWo68B7Delg_g1OXwiOA';
export const SUPABASE_PSW = process.env.EXPO_PUBLIC_SUPABASE_PSW || 'nUEtu6JAUXDxzckS';

// Aliyun LLM API 配置
export const ALIYUN_API_KEY = process.env.EXPO_PUBLIC_ALIYUN_API_KEY || '';
export const ALIYUN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
export const ALIYUN_WANXIANG_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

// API 配置
export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
};

// TechCrunch AI News API 配置
export const TECHCRUNCH_AI_NEWS_API = {
  baseUrl: process.env.EXPO_PUBLIC_TECHCRUNCH_API_URL || 'http://120.79.1.150:8000',
  apiKey: process.env.EXPO_PUBLIC_TECHCRUNCH_API_KEY || 'sk-default-key-for-testing',
  defaultMaxArticles: 10,
};

// 应用配置
export const APP_CONFIG = {
  name: 'AI English Learner',
  version: '1.0.0',
};

