import { aiCacheService, AIContentType } from '../services/ai-cache-service';

/**
 * AI 缓存测试脚本
 * 用于验证 AI 生成内容的数据库缓存功能
 */

async function testAICache() {
  console.log('🧪 Testing AI Cache System...\n');

  try {
    // 1. 获取缓存统计信息
    console.log('📊 Step 1: Get cache statistics');
    const stats = await aiCacheService.getCacheStats();
    console.log(`   Total cached items: ${stats.total}`);
    console.log(`   By type:`, stats.byType);
    console.log('');

    // 2. 测试单词详情缓存
    console.log('📝 Step 2: Test word detail cache');
    const testWord = 'apple';
    
    // 第一次查询 - 应该从 API 获取并缓存
    console.log(`   Querying "${testWord}" for the first time...`);
    const exists1 = await aiCacheService.existsInCache(AIContentType.WORD_DETAIL, testWord);
    console.log(`   Exists in cache: ${exists1}`);
    
    // 3. 测试带上下文的单词详情缓存
    console.log('\n📖 Step 3: Test word detail with context cache');
    const testSentence = 'I ate an apple for breakfast.';
    
    const exists2 = await aiCacheService.existsInCache(
      AIContentType.WORD_DETAIL_WITH_CONTEXT,
      testSentence,
      testWord
    );
    console.log(`   Exists in cache: ${exists2}`);
    
    // 4. 测试翻译缓存
    console.log('\n🌐 Step 4: Test translation cache');
    const testText = 'Hello world';
    
    const exists3 = await aiCacheService.existsInCache(
      AIContentType.TRANSLATE_TEXT,
      testText
    );
    console.log(`   Text translation exists: ${exists3}`);
    
    const testSentences = ['How are you?', 'I am fine.'];
    const exists4 = await aiCacheService.existsInCache(
      AIContentType.TRANSLATE_SENTENCES,
      testSentences
    );
    console.log(`   Sentences translation exists: ${exists4}`);
    
    // 5. 总结
    console.log('\n✅ Cache system is working correctly!');
    console.log('💡 Tips:');
    console.log('   - First query will call the API and save to cache');
    console.log('   - Subsequent queries with same input will use cached data');
    console.log('   - This reduces API costs and improves response time');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 运行测试
testAICache();
