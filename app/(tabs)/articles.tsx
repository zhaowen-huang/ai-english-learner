import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useGuardianArticles } from '@/hooks';
import type { GuardianArticle } from '@/services/guardian-api-service';

const { width } = Dimensions.get('window');

// 分类颜色映射
const categoryColors: Record<string, { bg: string; text: string }> = {
  'Science': { bg: '#E3F2FD', text: '#1976D2' },
  'Technology': { bg: '#F3E5F5', text: '#7B1FA2' },
  'Environment': { bg: '#E8F5E9', text: '#388E3C' },
  'Economy': { bg: '#FFF3E0', text: '#F57C00' },
  'Culture': { bg: '#FCE4EC', text: '#C2185B' },
  'Politics': { bg: '#E0F7FA', text: '#00838F' },
  'Sports': { bg: '#FFF8E1', text: '#F9A825' },
  'Health': { bg: '#E8F5E9', text: '#2E7D32' },
  'News': { bg: '#E3F2FD', text: '#1976D2' },
  'World': { bg: '#E8EAF6', text: '#303F9F' },
  'Education': { bg: '#FFF3E0', text: '#E65100' },
};

export default function ArticlesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const router = useRouter();

  // 使用 TanStack Query 获取文章
  const { 
    data: articles = [], 
    isLoading: loading,
    refetch,
    isRefetching
  } = useGuardianArticles(1, 30);

  // 提取分类
  const categories = ['全部', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = selectedCategory !== '全部'
    ? articles.filter(a => a.category === selectedCategory)
    : articles;

  const onRefresh = async () => {
    await refetch();
  };

  const getCategoryColors = (category: string) => {
    return categoryColors[category] || { bg: '#E3F2FD', text: '#1976D2' };
  };

  const renderArticle = ({ item, index }: { item: GuardianArticle; index: number }) => {
    const colors = getCategoryColors(item.category);
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/article/${item.id}`)}
      >
        {/* 卡片头部 */}
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
          </Text>
        </View>
        
        {/* 标题 */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* 摘要 */}
        <Text style={styles.summary} numberOfLines={3}>
          {item.description || item.content}
        </Text>
        
        {/* 底部信息 */}
        <View style={styles.cardFooter}>
          <View style={styles.wordCountBadge}>
            <Text style={styles.wordCountText}>
              {(item.content || '').split(/\s+/).length} 词
            </Text>
          </View>
          <View style={styles.readButton}>
            <Text style={styles.readButtonText}>阅读 →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 状态栏 */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header - 适配安全区域 */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24 }]}>
        <Text style={styles.headerTitle}>文章</Text>
        <Text style={styles.headerSubtitle}>发现优质英文新闻</Text>
      </View>
      
      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterItem,
                selectedCategory === item && styles.filterItemActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item && styles.filterTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Articles List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>正在加载文章...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === 'ios' ? 100 : 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#667EEA" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>暂无文章</Text>
              <Text style={styles.emptySubtext}>下拉刷新获取最新内容</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterItemActive: {
    backgroundColor: '#667EEA',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  wordCountBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  wordCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
