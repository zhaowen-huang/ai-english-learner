import axios from 'axios';

const GUARDIAN_API_KEY = 'f3db6e91-ffb6-42ad-b73c-7cc3fa08d37d';
const BASE_URL = 'https://content.guardianapis.com';

export interface GuardianArticle {
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
  section: string;
}

export const guardianApiService = {
  async fetchArticles(page: number = 1, pageSize: number = 30): Promise<GuardianArticle[]> {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          'api-key': GUARDIAN_API_KEY,
          'show-fields': 'headline,trailText,body,thumbnail,byline,publication',
          'show-blocks': 'body',
          'show-tags': 'keyword',
          'order-by': 'newest',
          'page-size': pageSize,
          page,
        },
      });

      console.log('Guardian API response:', response.data.response.results.length, 'articles');

      return response.data.response.results.map((article: any, index: number) => {
        const bodyContent = article.fields?.body || '';
        const trailText = article.fields?.trailText || article.webTitle || '';
        
        // 始终通过 cleanHtmlContent 处理，确保 HTML 实体被解码
        let content = '';
        if (bodyContent && bodyContent.length > 100) {
          content = this.cleanHtmlContent(bodyContent);
        } else if (trailText) {
          content = this.cleanHtmlContent(trailText);
        } else {
          content = article.webTitle || 'No content available';
        }
        
        const urlBasedId = article.webUrl
          .replace(/^https?:\/\//, '')
          .replace(/\//g, '-')
          .replace(/\./g, '_')
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .substring(0, 100);
        
        return {
          id: `g-${urlBasedId}`,
          title: article.fields?.headline || article.webTitle || 'No Title',
          description: trailText,
          content: content,
          url: article.webUrl || '',
          urlToImage: article.fields?.thumbnail || null,
          publishedAt: article.webPublicationDate || new Date().toISOString(),
          source: {
            id: 'the-guardian',
            name: 'The Guardian',
          },
          category: this.categorizeArticle(article.sectionName || '', trailText),
          section: article.sectionName || 'News',
        };
      });
    } catch (error) {
      console.error('Failed to fetch Guardian articles:', error);
      throw error;
    }
  },

  cleanHtmlContent(html: string): string {
    if (!html) return '';
    
    let text = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&ndash;/g, '-')
      .replace(/&mdash;/g, '\u2014')
      .replace(/&lsquo;/g, '\u2018')
      .replace(/&rsquo;/g, '\u2019')
      .replace(/&ldquo;/g, '\u201C')
      .replace(/&rdquo;/g, '\u201D')
      .replace(/&hellip;/g, '...')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    
    text = text.replace(/<[^>]*>/g, ' ');
    
    // 移除多余空格和制表符，但保留换行
    text = text.replace(/\s+/g, ' ').trim();
    
    if (text.length > 5000) {
      text = text.substring(0, 5000) + '...';
    }
    
    return text;
  },

  categorizeArticle(section: string, description: string): string {
    const text = `${section} ${description}`.toLowerCase();
    
    if (text.includes('technology') || text.includes('tech') || text.includes('digital') || 
        text.includes('ai') || text.includes('software') || text.includes('internet')) {
      return 'Technology';
    }
    if (text.includes('science') || text.includes('research') || text.includes('study') || 
        text.includes('discovery') || text.includes('space') || text.includes('nature')) {
      return 'Science';
    }
    if (text.includes('health') || text.includes('medical') || text.includes('disease') || 
        text.includes('hospital') || text.includes('nhs')) {
      return 'Health';
    }
    if (text.includes('business') || text.includes('economy') || text.includes('market') || 
        text.includes('stock') || text.includes('finance') || text.includes('trade')) {
      return 'Economy';
    }
    if (text.includes('sport') || text.includes('football') || text.includes('cricket') || 
        text.includes('tennis') || text.includes('olympics')) {
      return 'Sports';
    }
    if (text.includes('politic') || text.includes('government') || text.includes('election') || 
        text.includes('parliament') || text.includes('law')) {
      return 'Politics';
    }
    if (text.includes('environment') || text.includes('climate') || text.includes('weather') || 
        text.includes('pollution') || text.includes('energy') || text.includes('green')) {
      return 'Environment';
    }
    if (text.includes('culture') || text.includes('art') || text.includes('music') || 
        text.includes('movie') || text.includes('film') || text.includes('book') || 
        text.includes('literature')) {
      return 'Culture';
    }
    if (text.includes('education') || text.includes('school') || text.includes('university') || 
        text.includes('student')) {
      return 'Education';
    }
    if (text.includes('world') || text.includes('international') || text.includes('global')) {
      return 'World';
    }
    
    return section || 'News';
  },
};
