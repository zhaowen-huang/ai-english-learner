/**
 * AI News 文章抓取服务
 * 从 TechCrunch AI News API 获取 AI 相关新闻文章
 */

import { TECHCRUNCH_AI_NEWS_API } from '@/constants/config';

export interface AINewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl: string;
  author?: string;
}

// 缓存文章数据
let cachedArticles: AINewsArticle[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const aiNewsService = {
  // 清除缓存
  clearCache() {
    cachedArticles = null;
    lastFetchTime = 0;
    console.log('AI News cache cleared');
  },
  
  // 获取缓存的文章
  getCachedArticles(): AINewsArticle[] | null {
    // 检查缓存是否过期
    if (cachedArticles && Date.now() - lastFetchTime < CACHE_DURATION) {
      console.log('Using cached AI news articles:', cachedArticles.length);
      return cachedArticles;
    }
    return null;
  },
  
  // 获取 AI 新闻文章列表
  async fetchArticles(forceRefresh = false, maxArticles = 10): Promise<AINewsArticle[]> {
    // 如果已经有缓存且不强制刷新，直接返回缓存
    const cached = this.getCachedArticles();
    if (cached && !forceRefresh) {
      return cached;
    }
    
    try {
      console.log(`Fetching ${maxArticles} articles from TechCrunch AI News API...`);
      
      const url = `${TECHCRUNCH_AI_NEWS_API.baseUrl}/news?max_articles=${maxArticles}&include_summary=true`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': TECHCRUNCH_AI_NEWS_API.apiKey,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✓ Successfully fetched articles from API:', data.articles?.length || 0);
      
      // 转换 API 响应格式为应用格式
      const articles: AINewsArticle[] = (data.articles || []).map((article: any) => ({
        id: article.id || Math.random().toString(36).substr(2, 9),
        title: article.title || 'Untitled',
        content: article.content || article.summary || '',
        summary: article.summary || article.content?.substring(0, 200) + '...' || '',
        category: article.category || 'AI News',
        publishedAt: article.date || article.published_at || article.publishedAt || new Date().toISOString(),
        imageUrl: article.image_url || article.imageUrl,
        sourceUrl: article.url || article.source_url || article.sourceUrl || '',
        author: article.author,
      }));
      
      if (articles.length > 0) {
        console.log(`✓ Successfully parsed ${articles.length} articles`);
        cachedArticles = articles;
        lastFetchTime = Date.now();
        return articles;
      }
      
      throw new Error('No articles returned from API');
    } catch (error) {
      console.error('❌ Failed to fetch AI news articles from API:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      // 如果有缓存，返回缓存数据
      if (cachedArticles) {
        console.log('⚠️ Returning cached articles as fallback');
        return cachedArticles;
      }
      
      // 否则返回示例数据
      console.log('⚠️ Returning sample articles as fallback');
      cachedArticles = this.getSampleArticles();
      lastFetchTime = Date.now();
      return cachedArticles;
    }
  },

  // 清理文本（保留用于示例数据）
  cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#[0-9]+;/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  // 示例数据
  getSampleArticles(): AINewsArticle[] {
    return [
      {
        id: 'ai-sample1',
        title: 'OpenAI Unveils GPT-5 with Revolutionary Reasoning Capabilities',
        content: 'OpenAI has announced the release of GPT-5, featuring breakthrough improvements in logical reasoning and problem-solving. The new model demonstrates unprecedented ability to handle complex mathematical proofs, scientific analysis, and multi-step reasoning tasks. Early tests show significant improvements over previous versions in accuracy and reliability. The model also introduces better context understanding and can maintain coherence across longer conversations. Industry experts predict this advancement will accelerate AI adoption in research, education, and professional services.',
        summary: 'OpenAI has announced the release of GPT-5, featuring breakthrough improvements in logical reasoning...',
        category: 'AI Technology',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.artificialintelligence-news.com',
      },
      {
        id: 'ai-sample2',
        title: 'Google DeepMind Achieves Breakthrough in Protein Folding Prediction',
        content: 'Google DeepMind researchers have made a major breakthrough in protein structure prediction, potentially revolutionizing drug discovery and biological research. The new AI system can predict protein structures with near-experimental accuracy, reducing the time needed for analysis from months to hours. This advancement could accelerate the development of new medicines and treatments for diseases. Pharmaceutical companies are already partnering with DeepMind to apply this technology to real-world medical challenges.',
        summary: 'Google DeepMind researchers have made a major breakthrough in protein structure prediction...',
        category: 'AI Research',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.artificialintelligence-news.com',
      },
      {
        id: 'ai-sample3',
        title: 'AI-Powered Autonomous Vehicles Complete First Cross-Country Journey',
        content: 'A fleet of AI-powered autonomous vehicles has successfully completed the first fully autonomous cross-country journey, marking a significant milestone in self-driving technology. The vehicles navigated diverse weather conditions, complex urban environments, and challenging highway scenarios without human intervention. Advanced machine learning algorithms enabled real-time decision-making and obstacle avoidance. Safety records showed zero incidents during the entire journey.',
        summary: 'A fleet of AI-powered autonomous vehicles has successfully completed the first fully autonomous cross-country journey...',
        category: 'Autonomous Driving',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.artificialintelligence-news.com',
      },
    ];
  },
};
