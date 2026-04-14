import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAINewsArticles } from '@/hooks';
import { aiNewsService } from '@/services/ai-news-service';
import Loading from '@/components/Loading';
import type { AINewsArticle } from '@/services/ai-news-service';

// 安全的日期格式化函数
function formatDate(dateString: string): string {
  if (!dateString) return '未知日期';
  
  try {
    if (dateString.includes('ago') || dateString.includes('minutes') || 
        dateString.includes('hours') || dateString.includes('days')) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}

// 估算阅读时间（假设平均阅读速度 200 词/分钟）
function estimateReadTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min`;
}

// 统一的 Article 类型
type UnifiedArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  sourceUrl: string;
  source: 'ai-news';
};

export default function ArticlesScreen() {
  const router = useRouter();

  const { 
    data: articles = [], 
    isLoading,
    refetch,
    isRefetching
  } = useAINewsArticles();

  const unifiedArticles: UnifiedArticle[] = articles.map(a => ({ ...a, source: 'ai-news' as const }));

  const onRefresh = async () => {
    aiNewsService.clearCache();
    await refetch();
  };

  const handleOpenArticle = (article: UnifiedArticle) => {
    const saveArticleToStorage = async () => {
      try {
        console.log(`💾 Saving article: ${article.title?.substring(0, 50)}...`);
        console.log(`   Content length: ${article.content?.length || 0} chars`);
        console.log(`   Summary length: ${article.summary?.length || 0} chars`);
        await AsyncStorage.setItem(`${article.source}-${article.id}`, JSON.stringify(article));
        router.push(`/article/${article.id}?source=${article.source}`);
      } catch (error) {
        console.error('Failed to save article:', error);
      }
    };
    saveArticleToStorage();
  };

  const renderArticle = ({ item }: { item: UnifiedArticle }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleOpenArticle(item)}
        activeOpacity={0.6}
      >
        {/* 分类标签 */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        
        {/* 标题 */}
        <Text style={styles.title} numberOfLines={3}>
          {item.title}
        </Text>
        
        {/* 摘要 */}
        <Text style={styles.summary} numberOfLines={3}>
          {item.summary}
        </Text>
        
        {/* 底部信息 */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.readTime}>
              {estimateReadTime(item.content || item.summary)}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* 文章列表 */}
      <FlatList
        data={unifiedArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={['#C19A6B']}
            tintColor="#C19A6B"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无文章</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C19A6B',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#C19A6B',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },
  summary: {
    fontSize: 15,
    color: '#5C5C5C',
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
    paddingTop: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#8B8680',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C0BA',
    marginHorizontal: 8,
  },
  readTime: {
    fontSize: 13,
    color: '#8B8680',
  },
  arrow: {
    fontSize: 20,
    color: '#C19A6B',
    fontWeight: '300',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B8680',
  },
});
