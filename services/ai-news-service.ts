/**
 * AI News 文章抓取服务
 * 从多个来源获取 AI 相关新闻文章
 */

// AI News 网站配置
const AI_NEWS_BASE_URL = 'https://www.artificialintelligence-news.com';
const ARTICLES_PER_PAGE = 20;

// CORS 代理（用于绕过 403 限制）
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// 备用新闻源
const FALLBACK_SOURCES = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/',
  },
];

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

export const aiNewsService = {
  // 清除缓存
  clearCache() {
    cachedArticles = null;
    console.log('AI News cache cleared');
  },
  
  // 获取缓存的文章
  getCachedArticles(): AINewsArticle[] | null {
    return cachedArticles;
  },
  
  // 获取 AI 新闻文章列表
  async fetchArticles(forceRefresh = false): Promise<AINewsArticle[]> {
    // 如果已经有缓存且不强制刷新，直接返回缓存
    if (cachedArticles && !forceRefresh) {
      console.log('Using cached AI news articles:', cachedArticles.length);
      return cachedArticles;
    }
    
    try {
      console.log(`Fetching articles from ${AI_NEWS_BASE_URL}`);
      
      // 尝试通过 CORS 代理获取
      let html = '';
      let fetchSuccess = false;
      
      for (const proxy of CORS_PROXIES) {
        try {
          console.log(`Trying proxy: ${proxy}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(proxy + encodeURIComponent(AI_NEWS_BASE_URL), {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            html = await response.text();
            if (html.length > 1000) {
              console.log(`✓ Successfully fetched via proxy: ${html.length} bytes`);
              fetchSuccess = true;
              break;
            }
          }
        } catch (error) {
          console.log(`✗ Proxy failed: ${proxy}`, error);
          continue;
        }
      }
      
      if (!fetchSuccess || html.length < 1000) {
        throw new Error('All proxies failed or returned insufficient data');
      }
      
      // 解析文章列表
      const articles = await this.parseArticleList(html);
      
      if (articles.length > 0) {
        console.log(`✓ Successfully parsed ${articles.length} articles`);
        
        // 获取每篇文章的完整内容（处理前10篇）
        const articlesToFetch = Math.min(articles.length, 10);
        for (let i = 0; i < articlesToFetch; i++) {
          const article = articles[i];
          console.log(`Fetching full content for article ${i + 1}/${articlesToFetch}...`);
          
          const fullContent = await this.fetchFullArticleContent(article.sourceUrl);
          if (fullContent) {
            article.content = fullContent;
            article.summary = fullContent.length > 200 ? fullContent.substring(0, 200) + '...' : fullContent;
            console.log(`✓ Article ${i + 1}: ${fullContent.length} chars`);
          } else {
            console.log(`✗ Article ${i + 1}: Using title as summary`);
            article.content = article.title;
            article.summary = article.title;
          }
        }
        
        cachedArticles = articles;
        return articles;
      }
      
      throw new Error('No articles found after parsing');
    } catch (error) {
      console.error('❌ Failed to fetch AI news articles:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      // 返回丰富的示例数据
      console.log('⚠️ Returning comprehensive sample articles as fallback');
      cachedArticles = this.getSampleArticles();
      return cachedArticles;
    }
  },

  // 解析文章列表
  async parseArticleList(html: string): Promise<AINewsArticle[]> {
    const articles: AINewsArticle[] = [];
    
    try {
      console.log('Starting to parse article list...');
      console.log(`HTML length: ${html.length} bytes`);
      
      // 查找文章卡片 - 尝试多种选择器
      const articlePatterns = [
        { name: 'article tag', regex: /<article[^>]*>([\s\S]*?)<\/article>/gi },
        { name: 'post class', regex: /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
        { name: 'article class', regex: /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
        { name: 'card class', regex: /<div[^>]*class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
      ];
      
      for (const pattern of articlePatterns) {
        const matches = Array.from(html.matchAll(pattern.regex));
        console.log(`Pattern "${pattern.name}": found ${matches.length} matches`);
        
        if (matches.length > 0) {
          console.log(`✓ Using pattern: ${pattern.name}`);
          
          for (const match of matches.slice(0, ARTICLES_PER_PAGE)) {
            const articleHtml = match[1] || match[0];
            
            // 提取标题
            const titleMatch = articleHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
            const title = titleMatch ? this.cleanText(titleMatch[1]) : '';
            
            // 提取链接
            const linkMatch = articleHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
            let link = linkMatch ? linkMatch[1] : '';
            if (link && !link.startsWith('http')) {
              link = AI_NEWS_BASE_URL + (link.startsWith('/') ? '' : '/') + link;
            }
            
            // 提取日期
            const dateMatch = articleHtml.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                             articleHtml.match(/<span[^>]*class="[^"]*date[^"]*"[^>]*>(.*?)<\/span>/i);
            const pubDate = dateMatch ? (dateMatch[1] || dateMatch[0]) : new Date().toISOString();
            
            // 提取分类
            const categoryMatch = articleHtml.match(/<a[^>]*class="[^"]*category[^"]*"[^>]*>(.*?)<\/a>/i) ||
                                 articleHtml.match(/<span[^>]*class="[^"]*cat[^"]*"[^>]*>(.*?)<\/span>/i);
            const category = categoryMatch ? this.cleanText(categoryMatch[1]) : 'AI News';
            
            // 提取图片
            const imgMatch = articleHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
            const imageUrl = imgMatch ? imgMatch[1] : undefined;
            
            if (title && link) {
              articles.push({
                id: Math.random().toString(36).substr(2, 9),
                title,
                content: '',
                summary: '',
                category,
                publishedAt: pubDate,
                imageUrl,
                sourceUrl: link,
              });
              console.log(`  - Added: "${title.substring(0, 50)}..."`);
            }
          }
          
          if (articles.length > 0) break;
        }
      }
      
      if (articles.length === 0) {
        console.warn('⚠️ Could not parse any articles from HTML');
        console.log('HTML preview (first 1000 chars):', html.substring(0, 1000));
      } else {
        console.log(`✓ Successfully parsed ${articles.length} articles`);
      }
      
      return articles;
    } catch (error) {
      console.error('Failed to parse article list:', error);
      return [];
    }
  },

  // 获取完整文章内容
  async fetchFullArticleContent(url: string): Promise<string | null> {
    if (!url) return null;
    
    try {
      console.log(`Fetching: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return null;
      }
      
      const html = await response.text();
      
      // 尝试多种方法提取文章内容
      let content = '';
      
      // 方法1: 查找 article 标签
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      if (articleMatch) {
        content = this.cleanText(articleMatch[1]);
      }
      
      // 方法2: 查找 post-content 或 entry-content
      if (!content || content.length < 300) {
        const contentMatch = html.match(/<div[^>]*class="[^"]*(?:post-content|entry-content|article-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (contentMatch) {
          content = this.cleanText(contentMatch[1]);
        }
      }
      
      // 方法3: 查找 main 标签
      if (!content || content.length < 300) {
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        if (mainMatch) {
          content = this.cleanText(mainMatch[1]);
        }
      }
      
      // 方法4: 合并所有段落
      if (!content || content.length < 300) {
        const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (paragraphs && paragraphs.length > 3) {
          content = paragraphs
            .map(p => this.cleanText(p))
            .filter(p => p.length > 20)
            .join('\n\n');
        }
      }
      
      return content && content.length > 300 ? content : null;
    } catch (error) {
      console.error('Failed to fetch article content:', error);
      return null;
    }
  },

  // 清理文本
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
