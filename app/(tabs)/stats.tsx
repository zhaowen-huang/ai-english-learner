import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { progressService } from '@/services/progress-service';

export default function StatsScreen() {
  const { user } = useAuthStore();
  const [completedArticles, setCompletedArticles] = useState(0);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [learningDays, setLearningDays] = useState(0);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [completed, totalTime] = await Promise.all([
        progressService.getCompletedArticlesCount(user.id),
        progressService.getTotalReadingTime(user.id),
      ]);

      setCompletedArticles(completed);
      setTotalReadingTime(totalTime);
      
      // 计算学习天数（简化版）
      setLearningDays(completed > 0 ? Math.max(1, Math.floor(completed / 3)) : 0);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 顶部渐变标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>学习统计</Text>
        <Text style={styles.headerSubtitle}>追踪你的学习进度</Text>
      </View>

      {/* 统计卡片 */}
      <View style={styles.statsContainer}>
        {/* 已完成文章 */}
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>已完成文章</Text>
            <Text style={[styles.statValue, { color: '#667EEA' }]}>{completedArticles}</Text>
          </View>
          <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
            <Text style={styles.statIconText}>📚</Text>
          </View>
        </View>

        {/* 总阅读时长 */}
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>总阅读时长</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{formatTime(totalReadingTime)}</Text>
          </View>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statIconText}>⏱️</Text>
          </View>
        </View>

        {/* 学习天数 */}
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>学习天数</Text>
            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{learningDays}</Text>
          </View>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.statIconText}>📅</Text>
          </View>
        </View>
      </View>

      {/* 学习进度 */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>学习进度</Text>
        
        <View style={styles.progressCard}>
          {/* 本周目标 */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>本周目标</Text>
              <Text style={styles.progressCount}>{completedArticles}/7 文章</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (completedArticles / 7) * 100)}%`, backgroundColor: '#667EEA' }
                ]}
              />
            </View>
          </View>

          {/* 月度目标 */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>月度目标</Text>
              <Text style={styles.progressCount}>{completedArticles}/30 文章</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (completedArticles / 30) * 100)}%`, backgroundColor: '#10B981' }
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 激励消息 */}
      <View style={styles.motivationSection}>
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            {completedArticles === 0
              ? '🎯 开始你的第一篇阅读，迈出英语学习的第一步！'
              : completedArticles < 5
              ? '💪 很好的开始！继续保持，每天进步一点点。'
              : completedArticles < 10
              ? '🌟 太棒了！你已经建立了良好的学习习惯。'
              : '🏆 令人印象深刻！你是真正的英语学习者！'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  statIconText: {
    fontSize: 32,
  },
  progressSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  progressCount: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressBarBg: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 6,
  },
  motivationSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  motivationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  motivationText: {
    fontSize: 15,
    color: '#78350F',
    lineHeight: 24,
  },
});
