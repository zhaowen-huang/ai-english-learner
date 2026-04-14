import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAINewsArticles } from '@/hooks';
import { aiNewsService } from '@/services/ai-news-service';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import { formatDate, estimateReadTime } from '@/utils/format';
import { colors, textStyles, borderRadius, spacing } from '@/theme';
import type { AINewsArticle } from '@/services/ai-news-service';

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
      <Card 
        onPress={() => handleOpenArticle(item)}
        padding={spacing[5]}
        style={styles.card}
      >
        {/* 分类标签 */}
        <Badge label={item.category} variant="primary" size="sm" style={styles.badge} />
        
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
      </Card>
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
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📰"
            title="暂无文章"
            description="下拉刷新获取最新文章"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing[5],
  },
  card: {
    marginBottom: spacing[4],
  },
  badge: {
    marginBottom: spacing[3],
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  summary: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[3],
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[400],
    marginHorizontal: spacing[2],
  },
  readTime: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  arrow: {
    fontSize: 24,
    color: colors.primary.DEFAULT,
    fontWeight: textStyles.button.fontWeight,
  },
});
