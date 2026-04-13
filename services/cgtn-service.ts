/**
 * 英文新闻文章抓取服务
 * 从多个国际英文新闻源获取文章
 */

import { parseStringPromise } from 'xml2js';

// 纯英文国际新闻源 RSS feeds（按速度排序）
const NEWS_FEEDS = [
  // 21st Century (21世纪英文报) - 国内服务器，速度快
  'https://www.i21st.cn/rss/bilingual-news.xml',
  // NHK World (日本) - 亚洲服务器
  'https://www3.nhk.or.jp/nhkworld/en/rss.xml',
  // South China Morning Post (香港)
  'https://www.scmp.com/rss/91/feed',
  // DW News (德国之声)
  'https://rss.dw.com/xml/rss-en-all',
  // France 24 English
  'https://www.france24.com/en/rss',
];

export interface CGTNArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl: string;
}

// 缓存文章数据
let cachedArticles: CGTNArticle[] | null = null;

export const cgtnService = {
  // 获取缓存的文章
  getCachedArticles(): CGTNArticle[] | null {
    return cachedArticles;
  },
  
  // 获取新闻文章列表
  async fetchRSSArticles(forceRefresh = false): Promise<CGTNArticle[]> {
    // 如果已经有缓存且不强制刷新，直接返回缓存
    if (cachedArticles && !forceRefresh) {
      console.log('Using cached articles:', cachedArticles.length);
      return cachedArticles;
    }
    
    // 尝试所有 feed URL
    for (const feedUrl of NEWS_FEEDS) {
      try {
        console.log(`Trying to fetch: ${feedUrl}`);
        
        // 使用 AbortController 实现真正的超时控制（减少到2秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时
        
        const response = await fetch(feedUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log(`Feed ${feedUrl} returned ${response.status}, trying next...`);
          continue;
        }
        
        const xmlText = await response.text();
        
        if (!xmlText || xmlText.length < 100) {
          console.log(`Feed ${feedUrl} returned empty or invalid content`);
          continue;
        }
        
        console.log(`Successfully fetched ${feedUrl}, length: ${xmlText.length}`);
        const articles = await this.parseRSS(xmlText);
        
        if (articles.length > 0) {
          console.log(`Successfully loaded ${articles.length} articles from ${feedUrl}`);
          cachedArticles = articles; // 缓存结果
          return articles;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`Feed ${feedUrl} timed out (2s), trying next...`);
        } else {
          console.error(`Failed to fetch ${feedUrl}:`, error);
        }
        continue;
      }
    }
    
    // 如果所有 feed 都失败，返回示例数据
    console.warn('All news feeds failed, returning sample data');
    cachedArticles = this.getSampleArticles();
    return cachedArticles;
  },

  // 解析 RSS XML
  async parseRSS(xmlText: string): Promise<CGTNArticle[]> {
    try {
      const result = await parseStringPromise(xmlText);
      
      // 尝试多种 RSS 格式
      let items: any[] = [];
      
      // 标准 RSS 2.0
      if (result.rss?.channel?.[0]?.item) {
        items = result.rss.channel[0].item;
      }
      // Atom feed
      else if (result.feed?.entry) {
        items = result.feed.entry;
      }
      
      if (items.length === 0) {
        throw new Error('No items found in RSS feed');
      }
      
      console.log(`Parsed ${items.length} items from RSS feed`);
      
      const articles: CGTNArticle[] = [];
      
      for (const item of items) {
        // 标准 RSS
        const title = item.title?.[0] || item.title?._ || '';
        const description = item.description?.[0] || item.summary?.[0] || item.content?.[0]?._ || '';
        const link = item.link?.[0]?._ || item.link?.[0] || '';
        const pubDate = item.pubDate?.[0] || item.published?.[0] || item.updated?.[0] || '';
        const category = item.category?.[0]?._ || item.category?.[0] || 'News';
        
        // 提取图片 URL
        let imageUrl = '';
        if (item['media:content']?.[0]?.$?.url) {
          imageUrl = item['media:content'][0].$.url;
        } else if (item['media:thumbnail']?.[0]?.$?.url) {
          imageUrl = item['media:thumbnail'][0].$.url;
        } else if (item.enclosure?.[0]?.$?.url) {
          imageUrl = item.enclosure[0].$.url;
        }
        
        // 清理文本
        const plainText = this.cleanText(description);
        const plainTitle = this.cleanText(title);
        
        if (!plainTitle) continue; // 跳过没有标题的项
        
        // 简单估算字数
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        const estimatedTime = Math.ceil(wordCount / 200);
        
        articles.push({
          id: Math.random().toString(36).substr(2, 9),
          title: plainTitle,
          content: plainText,
          summary: plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText,
          category: this.cleanText(category),
          publishedAt: pubDate || new Date().toISOString(),
          imageUrl: imageUrl || undefined,
          sourceUrl: link,
        });
      }
      
      return articles;
    } catch (error) {
      console.error('Failed to parse RSS:', error);
      throw error;
    }
  },

  // 清理文本（移除 HTML 标签）
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

  // 示例数据（当 RSS 不可用时使用）
  getSampleArticles(): CGTNArticle[] {
    return [
      {
        id: 'sample1',
        title: 'China Successfully Launches New Communication Satellite',
        content: 'China has successfully launched a new communication satellite into orbit, marking another milestone in the country\'s space exploration program. The satellite was launched from the Jiuquan Satellite Launch Center using a Long March-2F carrier rocket. This mission aims to enhance communication capabilities and provide better coverage for remote areas. The satellite will undergo in-orbit testing before entering operational service, contributing to China\'s growing satellite constellation.',
        summary: 'China has successfully launched a new communication satellite into orbit, marking another milestone...',
        category: 'Science',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.cgtn.com',
      },
      {
        id: 'sample2',
        title: 'Global Leaders Meet at Climate Summit to Address Environmental Challenges',
        content: 'World leaders have gathered at the annual climate summit to discuss urgent environmental challenges and coordinate global efforts to combat climate change. The summit focuses on reducing carbon emissions, promoting renewable energy, and supporting developing nations in their transition to sustainable practices. Key agreements include commitments to achieve carbon neutrality by 2060 and increased funding for green technology initiatives. Environmental experts emphasize the importance of immediate action to prevent irreversible damage to the planet.',
        summary: 'World leaders have gathered at the annual climate summit to discuss urgent environmental challenges...',
        category: 'Environment',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.cgtn.com',
      },
      {
        id: 'sample3',
        title: 'Artificial Intelligence Revolutionizes Healthcare Industry',
        content: 'Artificial intelligence is transforming the healthcare industry with innovative applications in diagnosis, treatment planning, and patient care. AI-powered systems can now detect diseases earlier than traditional methods, analyze medical images with high accuracy, and predict patient outcomes. Major hospitals are implementing AI assistants to help doctors make more informed decisions. The technology is also being used to accelerate drug discovery and personalize treatment plans based on individual patient data. Healthcare professionals welcome these advancements while emphasizing the need for ethical AI implementation.',
        summary: 'Artificial intelligence is transforming the healthcare industry with innovative applications...',
        category: 'Technology',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.cgtn.com',
      },
      {
        id: 'sample4',
        title: 'Belt and Road Initiative Strengthens Global Economic Ties',
        content: 'The Belt and Road Initiative continues to strengthen economic ties between participating countries through infrastructure development and trade cooperation. Recent projects include new railway lines connecting major cities, modernized ports enhancing maritime trade, and energy infrastructure supporting sustainable development. The initiative has facilitated billions of dollars in investments and created thousands of jobs in partner countries. Economic experts note that the program promotes inclusive growth and mutual benefit, fostering stronger international partnerships.',
        summary: 'The Belt and Road Initiative continues to strengthen economic ties between participating countries...',
        category: 'Economy',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.cgtn.com',
      },
      {
        id: 'sample5',
        title: 'Cultural Exchange Programs Promote Understanding Between Nations',
        content: 'International cultural exchange programs are playing a vital role in promoting understanding and friendship between nations. Students, artists, and professionals participate in these programs to experience different cultures, share knowledge, and build lasting connections. Recent initiatives include language exchange programs, art exhibitions, music festivals, and academic conferences. Participants report that these experiences broaden their perspectives and help break down cultural barriers. Educational institutions worldwide are expanding their exchange programs to foster global citizenship.',
        summary: 'International cultural exchange programs are playing a vital role in promoting understanding...',
        category: 'Culture',
        publishedAt: new Date().toISOString(),
        imageUrl: undefined,
        sourceUrl: 'https://www.cgtn.com',
      },
    ];
  },
};
