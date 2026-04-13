/**
 * 测试 TechCrunch AI News API 集成
 */

import { aiNewsService } from '@/services/ai-news-service';

async function testAINewsAPI() {
  console.log('🧪 Testing TechCrunch AI News API Integration\n');
  
  try {
    // 测试 1: 获取 5 篇文章
    console.log('📰 Test 1: Fetching 5 articles...');
    const articles1 = await aiNewsService.fetchArticles(true, 5);
    console.log(`✓ Successfully fetched ${articles1.length} articles`);
    
    if (articles1.length > 0) {
      console.log('\nFirst article:');
      console.log('  Title:', articles1[0].title);
      console.log('  Category:', articles1[0].category);
      console.log('  Date:', articles1[0].publishedAt);
      console.log('  URL:', articles1[0].sourceUrl);
      console.log('  Summary:', articles1[0].summary?.substring(0, 100) + '...');
    }
    
    // 测试 2: 使用缓存
    console.log('\n📦 Test 2: Testing cache...');
    const articles2 = await aiNewsService.fetchArticles(false, 5);
    console.log(`✓ Retrieved ${articles2.length} articles from cache`);
    
    // 测试 3: 清除缓存并重新获取
    console.log('\n🗑️  Test 3: Clearing cache and refetching...');
    aiNewsService.clearCache();
    const articles3 = await aiNewsService.fetchArticles(true, 3);
    console.log(`✓ Successfully refetched ${articles3.length} articles after cache clear`);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 运行测试
testAINewsAPI();
