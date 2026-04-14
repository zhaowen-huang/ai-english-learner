import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Pressable,
  StyleSheet, 
  ScrollView, 
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useVocabularies, useDeleteVocabulary } from '@/hooks';
import { useSpeech } from '@/hooks/use-speech';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import { colors, textStyles, borderRadius, spacing } from '@/theme';
import type { Vocabulary } from '@/types/vocabulary';

export default function VocabularyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: allVocabularies = [], isLoading, refetch } = useVocabularies();
  const deleteMutation = useDeleteVocabulary();
  
  // 批量选择模式
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🔒"
          title="请先登录"
          description="登录后才能查看生词本"
          action={
            <Button
              title="去登录"
              onPress={() => router.push('/auth/login' as any)}
              variant="primary"
            />
          }
        />
      </View>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  const handleDelete = (vocab: Vocabulary) => {
    console.log('🔔 handleDelete called for:', vocab.word, vocab.id);
    
    const doDelete = async () => {
      console.log('✅ 用户确认删除，开始执行删除操作');
      try {
        console.log('📤 调用 deleteMutation.mutateAsync:', vocab.id);
        await deleteMutation.mutateAsync(vocab.id);
        console.log('✅ 删除成功，单词已从列表中移除');
      } catch (error: any) {
        console.error('❌ 删除失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
        Alert.alert('删除失败', error?.message || '请稍后重试');
      }
    };
    
    // Web 端使用原生 confirm
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm(`确定要删除 "${vocab.word}" 吗？`);
      console.log('用户选择:', confirmed ? '确认' : '取消');
      if (confirmed) {
        // 使用 setTimeout 确保 confirm 对话框完全关闭后再执行
        setTimeout(() => {
          doDelete();
        }, 100);
      }
    } else {
      // 移动端使用 Alert
      Alert.alert(
        '删除单词',
        `确定要删除 "${vocab.word}" 吗？`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '删除', 
            style: 'destructive',
            onPress: doDelete
          },
        ]
      );
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      Alert.alert('提示', '请选择要删除的单词');
      return;
    }

    Alert.alert(
      '批量删除',
      `确定要删除选中的 ${selectedIds.size} 个单词吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 并行删除以提高速度
              await Promise.all(
                Array.from(selectedIds).map(id => deleteMutation.mutateAsync(id))
              );
              setSelectedIds(new Set());
              setIsSelectMode(false);
            } catch (error) {
              Alert.alert('删除失败', '部分单词删除失败，请重试');
            } finally {
              await refetch();
            }
          }
        },
      ]
    );
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const masteredCount = allVocabularies.filter(v => v.mastered).length;
  const learningCount = allVocabularies.length - masteredCount;

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📖</Text>
          <Text style={styles.headerTitle}>生词本</Text>
        </View>
        
        {allVocabularies.length > 0 && (
          <TouchableOpacity 
            style={styles.selectModeButton}
            onPress={toggleSelectMode}
          >
            <Text style={styles.selectModeButtonText}>
              {isSelectMode ? '完成' : '选择'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 统计信息 */}
      {allVocabularies.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allVocabularies.length}</Text>
            <Text style={styles.statLabel}>总单词</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary.DEFAULT }]}>{learningCount}</Text>
            <Text style={styles.statLabel}>学习中</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success.DEFAULT }]}>{masteredCount}</Text>
            <Text style={styles.statLabel}>已掌握</Text>
          </View>
        </View>
      )}

      {/* 批量操作栏 */}
      {isSelectMode && selectedIds.size > 0 && (
        <View style={styles.batchActionBar}>
          <Text style={styles.batchActionText}>
            已选择 {selectedIds.size} 个单词
          </Text>
          <View style={styles.batchActionButtons}>
            <Button
              title="取消全选"
              onPress={() => setSelectedIds(new Set())}
              variant="ghost"
              size="sm"
            />
            <Button
              title="删除选中"
              onPress={handleBatchDelete}
              variant="primary"
              size="sm"
            />
          </View>
        </View>
      )}

      {/* 开始复习按钮 */}
      {allVocabularies.length > 0 && !isSelectMode && (
        <View style={styles.actionBar}>
          <Button
            title="🎯 开始复习"
            onPress={() => router.push('/(tabs)/review')}
            variant="primary"
            fullWidth
          />
        </View>
      )}

      {/* 单词列表 */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {allVocabularies.length === 0 ? (
          <EmptyState
            icon="📝"
            title="暂无生词"
            description="在阅读文章时点击单词即可收藏到生词本"
          />
        ) : (
          <View style={styles.vocabList}>
            {allVocabularies.map((vocab) => (
              <VocabularyCard
                key={vocab.id}
                vocab={vocab}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(vocab.id)}
                onToggleSelect={() => toggleSelect(vocab.id)}
                onDelete={() => handleDelete(vocab)}
                onPress={() => {
                  if (isSelectMode) {
                    toggleSelect(vocab.id);
                  } else {
                    router.push(`/word/${encodeURIComponent(vocab.word)}`);
                  }
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// 单词卡片组件
function VocabularyCard({
  vocab,
  isSelectMode,
  isSelected,
  onToggleSelect,
  onDelete,
  onPress,
}: {
  vocab: Vocabulary;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onPress: () => void;
}) {
  const { speak, isSpeaking } = useSpeech();

  const handleSpeak = (e: any) => {
    e.stopPropagation();
    speak(vocab.word);
  };

  return (
    <Card
      onPress={onPress}
      padding={spacing[5]}
      style={isSelectMode && isSelected ? [styles.vocabCard, styles.selectedCard] : styles.vocabCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {isSelectMode && (
            <TouchableOpacity
              style={[
                styles.checkbox,
                isSelected && styles.checkboxChecked,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
          <Text style={styles.cardWord}>{vocab.word}</Text>
          {!isSelectMode && (
            <TouchableOpacity
              style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              onPress={handleSpeak}
              activeOpacity={0.7}
            >
              <Text style={styles.speakButtonText}>
                {isSpeaking ? '🔊' : '🔉'}
              </Text>
            </TouchableOpacity>
          )}
          {vocab.mastered && (
            <Badge label="已掌握" variant="success" size="sm" />
          )}
        </View>
        
        {!isSelectMode && (
          <Pressable
            style={[styles.deleteButton, { zIndex: 20, position: 'relative' }]}
            onPress={(e) => {
              console.log('🗑️ [DELETE] Pressable pressed');
              e?.stopPropagation?.();
              console.log('🗑️ [DELETE] Calling onDelete for:', vocab.word);
              onDelete();
            }}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </Pressable>
        )}
      </View>
      
      {vocab.contextSentence && (
        <View style={styles.contextBox}>
          <Text style={styles.contextText}>"{vocab.contextSentence}"</Text>
        </View>
      )}
      
      {/* 底部信息栏 */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          {vocab.articleUrl && (
            <Text style={styles.sourceText} numberOfLines={1}>
              📄 {vocab.articleUrl}
            </Text>
          )}
        </View>
        <View style={styles.footerRight}>
          {vocab.createdAt && (
            <View style={styles.dateBadge}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {new Date(vocab.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  headerTitle: {
    ...textStyles.h1,
    fontSize: 36,
  },
  selectModeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  selectModeButtonText: {
    ...textStyles.buttonSmall,
    color: colors.primary.DEFAULT,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    marginHorizontal: spacing[6],
    marginBottom: spacing[4],
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.h3,
    fontSize: 24,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  actionBar: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  batchActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.lighter,
    marginHorizontal: spacing[6],
    marginBottom: spacing[4],
    borderRadius: borderRadius.md,
  },
  batchActionText: {
    ...textStyles.bodySmall,
    color: colors.primary.darker,
    fontWeight: textStyles.button.fontWeight,
  },
  batchActionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  listContainer: {
    flex: 1,
  },
  vocabList: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  vocabCard: {
    marginBottom: spacing[3],
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.lighter,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  checkmark: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: textStyles.button.fontWeight,
  },
  cardWord: {
    ...textStyles.h3,
    fontSize: 22,
  },
  speakButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
  },
  speakButtonActive: {
    backgroundColor: colors.primary.lighter,
  },
  speakButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: spacing[2],
  },
  deleteButtonText: {
    fontSize: 18,
  },
  contextBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.neutral[200],
    paddingLeft: spacing[3],
    marginBottom: spacing[3],
  },
  contextText: {
    ...textStyles.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[3],
  },
  footerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  footerRight: {
    flexShrink: 0,
  },
  sourceText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  dateIcon: {
    fontSize: 12,
    marginRight: spacing[1],
  },
  dateText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});
