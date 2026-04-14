import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useVocabularies } from '@/hooks';
import Loading from '@/components/Loading';
import type { Vocabulary } from '@/types/vocabulary';
import { useRouter } from 'expo-router';

export default function VocabularyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: allVocabularies = [], isLoading } = useVocabularies();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📖</Text>
        <Text style={styles.headerTitle}>生词本</Text>
      </View>
      
      <View style={styles.decorativeDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{allVocabularies.length} 个单词</Text>
      </View>

      {/* 开始复习按钮 */}
      {allVocabularies.length > 0 && (
        <TouchableOpacity 
          style={styles.startReviewButton}
          onPress={() => router.push('/(tabs)/review')}
          activeOpacity={0.7}
        >
          <Text style={styles.startReviewButtonText}>🎯 开始复习</Text>
        </TouchableOpacity>
      )}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {allVocabularies.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>暂无生词</Text>
              <Text style={styles.emptyDescription}>
                在阅读文章时点击单词即可收藏到生词本
              </Text>
            </View>
          ) : (
            allVocabularies.map((vocab) => (
              <TouchableOpacity 
                key={vocab.id} 
                style={styles.vocabCard}
                onPress={() => router.push(`/word/${encodeURIComponent(vocab.word)}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardWord}>{vocab.word}</Text>
                  {vocab.mastered && (
                    <View style={styles.masteredCheck}>
                      <Text style={styles.masteredCheckText}>✓</Text>
                    </View>
                  )}
                </View>
                
                {vocab.contextSentence && (
                  <View style={styles.contextBox}>
                    <Text style={styles.contextText}>"{vocab.contextSentence}"</Text>
                  </View>
                )}
                
                {vocab.articleUrl && (
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceLabel}>来自：{vocab.articleUrl}</Text>
                    {vocab.createdAt && (
                      <Text style={styles.dateText}>
                        {new Date(vocab.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 36,
    marginRight: 12,
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#2C2C2C',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  decorativeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C19A6B',
  },
  dividerText: {
    fontSize: 14,
    color: '#8B8680',
    marginLeft: 16,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  vocabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    padding: 20,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardWord: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  masteredCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C19A6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  masteredCheckText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contextBox: {
    borderLeftWidth: 2,
    borderLeftColor: '#E5E0D8',
    paddingLeft: 12,
    marginBottom: 16,
  },
  contextText: {
    fontSize: 15,
    color: '#5C5C5C',
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  sourceInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E0D8',
    paddingTop: 12,
  },
  sourceLabel: {
    fontSize: 13,
    color: '#8B8680',
    lineHeight: 20,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#A5A098',
  },
  startReviewButton: {
    backgroundColor: '#C19A6B',
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 8,
    alignItems: 'center',
  },
  startReviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5C5C5C',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8B8680',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
});
