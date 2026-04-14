import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAINewsArticles } from '@/hooks';
import { aiNewsService } from '@/services/ai-news-service';
import type { AINewsArticle } from '@/services/ai-news-service';

// 分类颜色映射
const categoryColors: Record<string, { bg: string; text: string }> = {
  'AI': { bg: '#E3F2FD', text: '#1976D2' },
  'Technology': { bg: '#F3E5F5', text: '#7B1FA2' },
  'Business': { bg: '#E8F5E9', text: '#388E3C' },
  'Science': { bg: '#FFF3E0', text: '#F57C00' },
  'AI News': { bg: '#FCE4EC', text: '#C2185B' },
};

export default function ArticlesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const router = useRouter();

  // 使用 TanStack Query 获取 AI 新闻文章
  const { 
    data: articles = [], 
    isLoading: loading,
    refetch,
    isRefetching
  } = useAINewsArticles();

  // 提取分类
  const categories = ['全部', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = selectedCategory !== '全部'
    ? articles.filter(a => a.category === selectedCategory)
    : articles;

  const onRefresh = async () => {
    // 清除服务缓存
    aiNewsService.clearCache();
    await refetch();
  };

  const getCategoryColors = (category: string) => {
    return categoryColors[category] || { bg: '#E3F2FD', text: '#1976D2' };
  };

  const handleOpenArticle = (article: AINewsArticle) => {
    // 将文章数据存储到 AsyncStorage，供详情页使用
    const saveArticleToStorage = async () => {
      try {
        await AsyncStorage.setItem(`ai-news-${article.id}`, JSON.stringify(article));
        // 导航到文章详情页
        router.push(`/article/${article.id}?source=ai-news`);
      } catch (error) {
        console.error('Failed to save article:', error);
      }
    };
    saveArticleToStorage();
  };

  const renderArticle = ({ item }: { item: AINewsArticle }) => {
    const colors = getCategoryColors(item.category);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleOpenArticle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* 分类标签 */}
          <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {item.category}
            </Text>
          </View>
          
          {/* 标题 */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* 摘要 */}
          <Text style={styles.summary} numberOfLines={3}>
            {item.summary}
          </Text>
          
          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.date}>
              {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>加载 AI 新闻中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 分类筛选 */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 文章列表 */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={['#667EEA']}
            tintColor="#667EEA"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={styles.emptyTitle}>暂无文章</Text>
            <Text style={styles.emptyDescription}>
              请稍后重试或检查网络连接
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  categoryButtonActive: {
    backgroundColor: '#667EEA',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
