import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useVocabularies, useMarkAsMastered } from '@/hooks';
import type { Vocabulary } from '@/types/vocabulary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15;

// 艾宾浩斯遗忘曲线间隔（单位：天）
const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30];

interface ReviewCardProps {
  vocab: Vocabulary;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

function ReviewCard({ vocab, onSwipe, isActive }: ReviewCardProps) {
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const flipAnim = useRef(new Animated.Value(0)).current; // 0 = 正面, 1 = 背面
  const [isFlipped, setIsFlipped] = useState(false);
  
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  // 翻转动画
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const handleFlip = () => {
    if (isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  // 入场动画 - 快速弹出效果
  useEffect(() => {
    // 重置翻转状态
    flipAnim.setValue(0);
    setIsFlipped(false);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
        friction: 4,
        tension: 150,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return isActive;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return isActive && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        // 不需要设置 offset，直接使用 setValue
      },
      onPanResponderMove: (_, gesture) => {
        if (!isActive) return;
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (!isActive) return;
        
        position.flattenOffset();
        
        if (gesture.dx > SWIPE_THRESHOLD) {
          // 右滑 - 不认识
          // 立即触发回调，让新卡片马上出现
          onSwipe('right');
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // 左滑 - 认识
          // 立即触发回调，让新卡片马上出现
          onSwipe('left');
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else {
          // 回弹
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        position.flattenOffset();
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const cardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }, { scale }],
    opacity,
  };

  const frontCardStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backCardStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <Animated.View 
      style={[styles.card, cardStyle]} 
      {...panResponder.panHandlers}
      collapsable={false}
    >
      {/* 滑动提示 */}
      {isActive && (
        <>
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.knowIndicator,
              { opacity: position.x.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
              })}
            ]}
          >
            <Text style={styles.swipeIndicatorText}>✓ 认识</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.unknownIndicator,
              { opacity: position.x.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
              })}
            ]}
          >
            <Text style={styles.swipeIndicatorText}>✗ 不认识</Text>
          </Animated.View>
        </>
      )}

      {/* 正面 - 只显示英文单词 */}
      <Animated.View 
        style={[styles.cardFace, styles.cardFront, frontCardStyle]}
        onTouchEnd={handleFlip}
      >
        <View style={styles.frontContent}>
          <Text style={styles.wordTextLarge}>{vocab.word}</Text>
          <Text style={styles.tapHint}>点击查看详情 👆</Text>
        </View>
      </Animated.View>

      {/* 背面 - 显示详细信息 */}
      <Animated.View 
        style={[styles.cardFace, styles.cardBack, backCardStyle]}
        onTouchEnd={handleFlip}
      >
        <View style={styles.cardContent}>
          <Text style={styles.wordText}>{vocab.word}</Text>
          <Text style={styles.meaningText}>{vocab.meaning}</Text>
          
          {vocab.example && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>例句：</Text>
              <Text style={styles.exampleText}>{vocab.example}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.reviewCount}>已复习 {vocab.reviewCount} 次</Text>
            <Text style={styles.hint}>← 左滑认识 | 右滑不认识 →</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function VocabularyReviewScreen() {
  const { user } = useAuthStore();
  const { data: allVocabularies = [], isLoading } = useVocabularies();
  const markMasteredMutation = useMarkAsMastered();
  
  const [reviewQueue, setReviewQueue] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'list' | 'review'>('list');

  // 根据艾宾浩斯曲线计算优先级
  const calculatePriority = (vocab: Vocabulary): number => {
    if (vocab.mastered) return 999; // 已掌握的排最后
    
    const now = new Date();
    const lastReview = vocab.lastReviewAt ? new Date(vocab.lastReviewAt) : new Date(vocab.createdAt);
    const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
    
    // 找到应该复习的间隔
    const reviewStage = Math.min(vocab.reviewCount, EBBINGHAUS_INTERVALS.length - 1);
    const expectedInterval = EBBINGHAUS_INTERVALS[reviewStage];
    
    //  overdue 天数越多，优先级越高（数值越小）
    const overdue = daysSinceReview - expectedInterval;
    return Math.max(0, overdue);
  };

  // 生成复习队列
  const generateReviewQueue = () => {
    const sorted = [...allVocabularies].sort((a, b) => {
      return calculatePriority(a) - calculatePriority(b);
    });
    setReviewQueue(sorted);
    setCurrentIndex(0);
    setMode('review');
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentVocab = reviewQueue[currentIndex];
    
    if (direction === 'left') {
      // 认识 - 标记为掌握或增加复习次数
      try {
        await markMasteredMutation.mutateAsync({ 
          id: currentVocab.id, 
          mastered: currentVocab.reviewCount >= 5 // 复习5次后自动标记掌握
        });
      } catch (error) {
        console.error('更新失败:', error);
      }
    } else {
      // 不认识 - 重置复习进度，提高优先级
      try {
        // 这里可以添加逻辑来重置复习计数或标记为需要重点复习
        await markMasteredMutation.mutateAsync({ 
          id: currentVocab.id, 
          mastered: false 
        });
      } catch (error) {
        console.error('更新失败:', error);
      }
    }

    // 移动到下一个
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 复习完成
      Alert.alert('复习完成', '太棒了！所有单词都复习完了', [
        { text: '返回列表', onPress: () => setMode('list') }
      ]);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  // 列表模式
  if (mode === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的生词本</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{allVocabularies.length}</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {allVocabularies.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>暂无生词</Text>
              <Text style={styles.emptyDescription}>
                在阅读文章时点击单词即可收藏到生词本
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.startReviewButton} onPress={generateReviewQueue}>
                <Text style={styles.startReviewButtonText}>🎯 开始复习 ({allVocabularies.length})</Text>
              </TouchableOpacity>
              
              <ScrollView style={styles.vocabList} showsVerticalScrollIndicator={false}>
                {allVocabularies.map((vocab) => (
                  <View key={vocab.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listWord}>{vocab.word}</Text>
                      <Text style={styles.listMeaning}>{vocab.meaning}</Text>
                      <Text style={styles.listMeta}>复习 {vocab.reviewCount} 次</Text>
                    </View>
                    {vocab.mastered && (
                      <View style={styles.masteredBadge}>
                        <Text style={styles.masteredText}>✓</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    );
  }

  // 复习模式
  return (
    <View style={styles.container}>
      <View style={styles.reviewHeader}>
        <TouchableOpacity onPress={() => setMode('list')}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {reviewQueue.length}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {currentIndex < reviewQueue.length ? (
          <ReviewCard
            key={reviewQueue[currentIndex].id}
            vocab={reviewQueue[currentIndex]}
            onSwipe={handleSwipe}
            isActive={true}
          />
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.completeIcon}>🎉</Text>
            <Text style={styles.completeTitle}>全部复习完成！</Text>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => setMode('list')}
            >
              <Text style={styles.completeButtonText}>返回列表</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 底部操作按钮 */}
      {currentIndex < reviewQueue.length && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.knowButton]}
            onPress={() => handleSwipe('left')}
          >
            <Text style={styles.actionButtonText}>✓ 认识</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.unknownButton]}
            onPress={() => handleSwipe('right')}
          >
            <Text style={styles.actionButtonText}>✗ 不认识</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  countBadge: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  startReviewButton: {
    backgroundColor: '#667EEA',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startReviewButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vocabList: {
    flex: 1,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  listItemContent: {
    flex: 1,
  },
  listWord: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  listMeaning: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  masteredBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  masteredText: {
    fontSize: 16,
    color: '#059669',
  },
  emptyList: {
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
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    borderRadius: 20,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    transform: [{ rotateY: '180deg' }],
  },
  frontContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  wordTextLarge: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  knowIndicator: {
    left: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    transform: [{ rotate: '-15deg' }],
  },
  unknownIndicator: {
    right: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    transform: [{ rotate: '15deg' }],
  },
  swipeIndicatorText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  meaningText: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  exampleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667EEA',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 15,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  footer: {
    marginTop: 'auto',
  },
  reviewCount: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  knowButton: {
    backgroundColor: '#10B981',
  },
  unknownButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
