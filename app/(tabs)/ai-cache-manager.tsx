import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { aiCacheService } from '@/services/ai-cache-service';

interface CacheStats {
  total: number;
  byType: Record<string, number>;
}

const typeLabels: Record<string, string> = {
  word_detail: '📝 单词详情',
  word_detail_with_context: '📖 带上下文的单词详情',
  translate_text: '🌐 文本翻译',
  translate_sentences: '💬 句子翻译',
};

export default function AICacheManagerScreen() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await aiCacheService.getCacheStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      Alert.alert('错误', '加载缓存统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = (type?: string) => {
    const message = type
      ? `确定要清除"${typeLabels[type] || type}"的缓存吗？`
      : '确定要清除所有 AI 缓存吗？';

    Alert.alert('确认清除', message, [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: async () => {
          try {
            if (type) {
              await aiCacheService.clearCacheByType(type);
            } else {
              await aiCacheService.clearAllCache();
            }
            Alert.alert('成功', '缓存已清除');
            loadStats();
          } catch (error) {
            console.error('Failed to clear cache:', error);
            Alert.alert('错误', '清除缓存失败');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>AI 缓存管理</Text>
        <Text style={styles.subtitle}>
          管理所有 AI 生成的内容缓存，避免重复调用产生费用
        </Text>
      </View>

      {/* 总览卡片 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>总缓存数量</Text>
        <Text style={styles.summaryValue}>{stats?.total || 0}</Text>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={() => handleClearCache()}
        >
          <Text style={styles.clearAllButtonText}>清除所有缓存</Text>
        </TouchableOpacity>
      </View>

      {/* 各类型缓存统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>缓存详情</Text>
        
        {stats && Object.keys(stats.byType).length > 0 ? (
          Object.entries(stats.byType).map(([type, count]) => (
            <View key={type} style={styles.cacheItem}>
              <View style={styles.cacheInfo}>
                <Text style={styles.cacheType}>
                  {typeLabels[type] || type}
                </Text>
                <Text style={styles.cacheCount}>{count} 条</Text>
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleClearCache(type)}
              >
                <Text style={styles.clearButtonText}>清除</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无缓存数据</Text>
          </View>
        )}
      </View>

      {/* 说明信息 */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 缓存说明</Text>
        <Text style={styles.infoText}>
          • 首次查询时会调用 AI API 并保存结果到数据库{'\n'}
          • 相同内容的再次查询会直接使用缓存，无需调用 API{'\n'}
          • 这可以显著降低 API 费用并提高响应速度{'\n'}
          • 建议定期清理过期的缓存以节省存储空间
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667EEA',
    marginBottom: 16,
  },
  clearAllButton: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearAllButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cacheItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cacheInfo: {
    flex: 1,
  },
  cacheType: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  cacheCount: {
    fontSize: 14,
    color: '#999',
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  infoSection: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
