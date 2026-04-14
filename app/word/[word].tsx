import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Ionicons } from '@expo/vector-icons';
import Loading from '@/components/Loading';

export default function WordDetailScreen() {
  const { word } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: vocabulary, isLoading } = useVocabulary(word as string);

  if (isLoading) {
    return <Loading />;
  }

  if (!vocabulary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>单词不存在</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#2C2C2C" />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 单词标题 */}
        <View style={styles.wordSection}>
          <Text style={styles.word}>{vocabulary.word}</Text>
          <Text style={styles.meaning}>{vocabulary.meaning}</Text>
        </View>

        {/* 装饰性分割线 */}
        <View style={styles.divider} />

        {/* 上下文例句 */}
        {vocabulary.contextSentence && (
          <View style={styles.contextSection}>
            <Text style={styles.sectionLabel}>上下文</Text>
            <View style={styles.contextBox}>
              <Text style={styles.contextText}>"{vocabulary.contextSentence}"</Text>
            </View>
          </View>
        )}

        {/* 来源信息 */}
        {vocabulary.articleUrl && (
          <View style={styles.sourceSection}>
            <Text style={styles.sectionLabel}>来源</Text>
            <Text style={styles.sourceText}>{vocabulary.articleUrl}</Text>
            <Text style={styles.dateText}>
              {new Date(vocabulary.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}

        {/* 复习统计 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>学习进度</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vocabulary.reviewCount}</Text>
              <Text style={styles.statLabel}>复习次数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, vocabulary.mastered ? styles.masteredColor : styles.learningColor]}>
                {vocabulary.mastered ? '已掌握' : '学习中'}
              </Text>
              <Text style={styles.statLabel}>状态</Text>
            </View>
          </View>
        </View>
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
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#2C2C2C',
    marginLeft: 4,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  wordSection: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  word: {
    fontSize: 42,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  meaning: {
    fontSize: 18,
    color: '#8B8680',
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#C19A6B',
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C19A6B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  contextSection: {
    marginBottom: 32,
  },
  contextBox: {
    borderLeftWidth: 2,
    borderLeftColor: '#E5E0D8',
    paddingLeft: 16,
  },
  contextText: {
    fontSize: 16,
    color: '#5C5C5C',
    lineHeight: 26,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  sourceSection: {
    marginBottom: 32,
  },
  sourceText: {
    fontSize: 15,
    color: '#5C5C5C',
    lineHeight: 24,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#A5A098',
  },
  statsSection: {
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  masteredColor: {
    color: '#C19A6B',
  },
  learningColor: {
    color: '#8B8680',
  },
  statLabel: {
    fontSize: 13,
    color: '#8B8680',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E0D8',
    marginHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#8B8680',
    textAlign: 'center',
    marginTop: 40,
  },
});
