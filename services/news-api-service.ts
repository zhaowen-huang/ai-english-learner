import axios from 'axios';

const NEWS_API_KEY = 'da52b83f1b3f409c95335b8983686da6';
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  category: string;
}

export const newsApiService = {
  // 获取热门头条（默认美国）
  async fetchTopHeadlines(country: string = 'us', pageSize: number = 30): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${BASE_URL}/top-headlines`, {
        params: {
          country,
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title || 'No Title',
        description: article.description || '',
        content: article.content || article.description || '',
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source || { id: null, name: 'Unknown' },
        category: this.categorizeArticle(article.title, article.description),
      }));
    } catch (error) {
      console.error('Failed to fetch top headlines:', error);
      throw error;
    }
  },

  // 获取所有新闻（按流行度排序）
  async fetchEverything(sortBy: string = 'popularity', pageSize: number = 20): Promise<NewsArticle[]> {
    try {
      const today = new Date();
      const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前
      
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          from: fromDate.toISOString().split('T')[0],
          sortBy,
          language: 'en',
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title || 'No Title',
        description: article.description || '',
        content: article.content || article.description || '',
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source || { id: null, name: 'Unknown' },
        category: this.categorizeArticle(article.title, article.description),
      }));
    } catch (error) {
      console.error('Failed to fetch everything:', error);
      throw error;
    }
  },

  // 根据标题和描述自动分类
  categorizeArticle(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('technology') || text.includes('tech') || text.includes('ai') || 
        text.includes('software') || text.includes('app') || text.includes('digital')) {
      return 'Technology';
    }
    if (text.includes('science') || text.includes('research') || text.includes('study') || 
        text.includes('discovery') || text.includes('space')) {
      return 'Science';
    }
    if (text.includes('health') || text.includes('medical') || text.includes('disease') || 
        text.includes('hospital') || text.includes('vaccine')) {
      return 'Health';
    }
    if (text.includes('business') || text.includes('economy') || text.includes('market') || 
        text.includes('stock') || text.includes('finance') || text.includes('trade')) {
      return 'Economy';
    }
    if (text.includes('sport') || text.includes('game') || text.includes('team') || 
        text.includes('player') || text.includes('championship')) {
      return 'Sports';
    }
    if (text.includes('politic') || text.includes('government') || text.includes('election') || 
        text.includes('president') || text.includes('law')) {
      return 'Politics';
    }
    if (text.includes('environment') || text.includes('climate') || text.includes('weather') || 
        text.includes('pollution') || text.includes('energy')) {
      return 'Environment';
    }
    if (text.includes('culture') || text.includes('art') || text.includes('music') || 
        text.includes('movie') || text.includes('film')) {
      return 'Culture';
    }
    
    return 'News';
  },
};
