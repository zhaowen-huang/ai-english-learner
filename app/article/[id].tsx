import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWordDetailWithContext, useTranslateText } from '@/hooks/use-word';
import { useVocabularies, useToggleWordFavorite } from '@/hooks/use-vocabulary';
import { useSpeech } from '@/hooks/use-speech';
import { vocabularyService } from '@/services/vocabulary-service';
import { articleAudioService } from '@/services/article-audio-service';
import { useAuthStore } from '@/store/auth-store';
import Loading from '@/components/Loading';
import { formatDate, estimateReadTime, cleanWord, extractContextSentence } from '@/utils/format';
import type { WordDetail } from '@/services/aliyun-llm-service';
import { BookmarkPlus, BookmarkCheck, Check, X, AlertCircle, ArrowLeft, Volume2, Play, Pause, Loader } from 'lucide-react-native';
import { colors } from '@/theme';

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

export default function ArticleDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [article, setArticle] = useState<UnifiedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Translation state
  const [showTranslation, setShowTranslation] = useState(false);
  
  // Word popup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [contextSentence, setContextSentence] = useState<string>('');
  const [showWordPopup, setShowWordPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingFavorite, setAddingFavorite] = useState(false);

  // Speech synthesis for reading full article
  const { speak: speakText, stop: stopSpeaking, isSpeaking } = useSpeech({
    lang: 'en-US',
    rate: 0.85,
  });

  // Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get word detail with context
  const { data: wordDetail, isLoading: wordLoading, error: wordError, refetch: refetchWordDetail } = useWordDetailWithContext(
    selectedWord,
    contextSentence || null
  );

  // Refetch vocabularies to check if word is already saved
  const { data: vocabularies = [], refetch: refetchVocabularies } = useVocabularies();
  
  // Use mutation for adding to favorites
  const toggleFavoriteMutation = useToggleWordFavorite();

  // Check if word is already in vocabulary when popup opens
  useEffect(() => {
    if (selectedWord && vocabularies.length > 0) {
      const cleanedWord = cleanWord(selectedWord);
      const exists = vocabularies.some(v => v.word === cleanedWord);
      setIsFavorite(exists);
    }
  }, [selectedWord, vocabularies]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        console.log(`📖 Loading article: ${source}-${id}`);
        const stored = await AsyncStorage.getItem(`${source}-${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log(`   Article loaded: ${parsed.title?.substring(0, 50)}...`);
          console.log(`   Content length: ${parsed.content?.length || 0} chars`);
          setArticle(parsed);
        } else {
          console.log(`   ⚠️ No stored article found`);
        }
      } catch (error) {
        console.error('Failed to load article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, source]);

  const openSourceUrl = async () => {
    if (article?.sourceUrl) {
      try {
        const supported = await Linking.canOpenURL(article.sourceUrl);
        if (supported) {
          await Linking.openURL(article.sourceUrl);
        }
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  const handleWordPress = (word: string, paragraph: string) => {
    const cleaned = cleanWord(word);
    if (cleaned.length >= 2) {
      const sentence = extractContextSentence(paragraph, cleaned);
      setSelectedWord(cleaned);
      setContextSentence(sentence);
      setIsFavorite(false);
      setShowWordPopup(true);
    }
  };

  const handleAddToFavorites = async () => {
    if (!user || !selectedWord || !wordDetail) {
      Alert.alert('提示', '请先登录');
      return;
    }

    setAddingFavorite(true);
    try {
      await toggleFavoriteMutation.mutateAsync({
        word: selectedWord.toLowerCase(),
        meaning: wordDetail.simpleExplanation,
        example: wordDetail.exampleSentences?.[0],
        contextSentence: contextSentence,
        articleUrl: article?.sourceUrl,
      });
      
      setIsFavorite(true);
      Alert.alert('成功', `已添加 "${selectedWord}" 到生词本`);
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      Alert.alert('失败', '添加到生词本失败');
    } finally {
      setAddingFavorite(false);
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handleReadFullArticle = async () => {
    if (!article?.content) return;
    
    // If we already have generated audio, play/pause it
    if (audioUrl && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return;
    }
    
    // If currently generating, do nothing
    if (isGeneratingAudio) return;
    
    // If no source URL, fallback to browser speech
    if (!article.sourceUrl) {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        const cleanContent = article.content
          .split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .join('. ');
        speakText(cleanContent);
      }
      return;
    }
    
    // Generate audio from API
    setIsGeneratingAudio(true);
    try {
      const result = await articleAudioService.generateArticleAudio(article.sourceUrl);
      
      if (result.success && result.audio_file) {
        const url = articleAudioService.getAudioUrl(result.audio_file);
        console.log('[ArticlePage] Attempting to play audio from:', url);
        setAudioUrl(url);
        setAudioDuration(result.duration_seconds || null);
        
        // 先通过 fetch 下载音频为 blob，绕过 HTTP/HTTPS 混合内容问题
        console.log('[ArticlePage] Downloading audio as blob to bypass mixed content...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-API-Key': 'sk-default-key-for-testing',
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download audio: ${response.status}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log('[ArticlePage] Audio downloaded as blob, size:', blob.size, 'bytes');
        
        // Create and play audio from blob URL
        const audio = new Audio();
        audioRef.current = audio;
        audio.src = blobUrl;
        audio.preload = 'auto';
        
        // 监听加载事件
        audio.oncanplaythrough = () => {
          console.log('[ArticlePage] ✅ Audio loaded successfully from blob, starting playback');
          audio.play().catch(playError => {
            console.error('[ArticlePage] ❌ Play failed:', playError);
            Alert.alert('播放失败', '无法播放音频: ' + playError.message);
            setAudioUrl(null);
            audioRef.current = null;
            URL.revokeObjectURL(blobUrl);
          });
        };
        
        audio.onloadeddata = () => {
          console.log('[ArticlePage] Audio data loaded from blob');
        };
        
        audio.onerror = (e) => {
          console.error('[ArticlePage] ❌ Audio error event:', e);
          console.error('[ArticlePage] Audio error code:', audio.error?.code);
          console.error('[ArticlePage] Audio error message:', audio.error?.message);
          console.error('[ArticlePage] Audio networkState:', audio.networkState);
          console.error('[ArticlePage] Audio readyState:', audio.readyState);
          
          // 根据错误代码提供更详细的提示
          let errorMessage = '无法加载音频文件';
          if (audio.error) {
            switch (audio.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = '音频加载被中止';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = '网络错误，无法加载音频（可能是跨域问题）';
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = '音频解码失败，文件格式可能不支持';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = '音频源不支持（HTTP/HTTPS 混合内容或 CORS 问题）';
                break;
            }
          }
          
          Alert.alert(
            '加载失败', 
            `${errorMessage}\n\n` +
            `原因：服务器未配置 CORS 响应头\n\n` +
            `解决方案：请在服务器上添加 CORS 配置，允许跨域访问音频文件`  );
          setAudioUrl(null);
          audioRef.current = null;
          URL.revokeObjectURL(blobUrl);
        };
        
        audio.onended = () => {
          console.log('[ArticlePage] ✅ Audio playback ended');
          setAudioUrl(null);
          audioRef.current = null;
          URL.revokeObjectURL(blobUrl);
        };
        
        // 开始加载
        audio.load();
      } else {
        throw new Error(result.message || '生成音频失败');
      }
    } catch (error: any) {
      console.error('[ArticlePage] Failed to generate audio:', error);
      Alert.alert('生成失败', error?.message || '无法生成音频，请检查网络连接');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const renderContentWithWordClick = () => {
    if (!article?.content) return null;
    
    return article.content.split('\n\n').map((paragraph, pIndex) => {
      // 将段落分割成单词和标点的混合数组
      const tokens = paragraph.match(/[a-zA-Z]+|[^a-zA-Z]+/g) || [];
      
      return (
        <View key={pIndex} style={styles.paragraphWrapper}>
          {/* English paragraph */}
          <View style={styles.paragraphContainer}>
            {tokens.map((token, tIndex) => {
              // 如果是纯字母（单词），使其可点击
              if (/^[a-zA-Z]+$/.test(token) && token.length >= 2) {
                return (
                  <TouchableOpacity
                    key={tIndex}
                    activeOpacity={0.5}
                    onPress={() => handleWordPress(token, paragraph)}
                    style={styles.wordTouchable}
                  >
                    <Text style={styles.paragraphWord}>{token}</Text>
                  </TouchableOpacity>
                );
              }
              // 标点符号、数字等不可点击
              return <Text key={tIndex} style={styles.paragraph}>{token}</Text>;
            })}
          </View>
          
          {/* Chinese translation (if enabled) */}
          {showTranslation && (
            <ParagraphTranslation 
              paragraph={paragraph} 
              paragraphIndex={pIndex}
            />
          )}
        </View>
      );
    });
  };

  if (loading) {
    return (
      <Loading 
        message="加载文章中..." 
        style={{ paddingTop: insets.top }}
      />
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>Article not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.navActions}>
          {/* Read Aloud Button */}
          <TouchableOpacity 
            style={[
              styles.readAloudButton, 
              (isSpeaking || (audioUrl && audioRef.current && !audioRef.current.paused)) && styles.readAloudButtonActive,
              isGeneratingAudio && styles.readAloudButtonDisabled
            ]}
            onPress={handleReadFullArticle}
            disabled={isGeneratingAudio}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isGeneratingAudio ? (
                <> {/* @ts-ignore */}
                <Loader size={16} stroke={colors.text.secondary} />
                <Text style={styles.readAloudButtonText}>生成中...</Text>
                </>
              ) : (audioUrl && audioRef.current && !audioRef.current.paused) ? (
                <> {/* @ts-ignore */}
                <Pause size={16} stroke={colors.primary.DEFAULT} />
                <Text style={styles.readAloudButtonText}>暂停</Text>
                </>
              ) : (isSpeaking || (audioUrl && audioRef.current)) ? (
                <> {/* @ts-ignore */}
                <Play size={16} stroke={colors.primary.DEFAULT} />
                <Text style={styles.readAloudButtonText}>继续</Text>
                </>
              ) : (
                <> {/* @ts-ignore */}
                <Volume2 size={16} stroke={colors.primary.DEFAULT} />
                <Text style={styles.readAloudButtonText}>朗读</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
                    
          <TouchableOpacity 
            style={[styles.translateButton, showTranslation && styles.translateButtonActive]}
            onPress={toggleTranslation}
          >
            <Text style={[styles.translateButtonText, showTranslation && styles.translateButtonTextActive]}>
              {showTranslation ? '隐藏译文' : '显示译文'}
            </Text>
          </TouchableOpacity>
          
          {article.sourceUrl && (
            <TouchableOpacity 
              style={styles.sourceUrlButton}
              onPress={openSourceUrl}
            >
              <Text style={styles.sourceUrlButtonText}>Source ↗</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{article.title}</Text>
        </View>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <Text style={styles.dateText}>{formatDate(article.publishedAt)}</Text>
          <View style={styles.metaDivider} />
          <View style={styles.readTimeContainer}>
            <Text style={styles.readTimeIcon}>◷</Text>
            <Text style={styles.readTimeText}>
              {estimateReadTime(article.content || article.summary)}
            </Text>
          </View>
        </View>

        {/* Decorative Divider */}
        <View style={styles.decorativeDivider}>
          <View style={styles.diamondDecoration} />
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {renderContentWithWordClick()}
        </View>

        {/* Tip Box */}
        <View style={styles.tipContainer}>
          <View style={styles.tipContent}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Tip: Tap on any word to see its meaning and add to vocabulary
            </Text>
          </View>
        </View>

        {/* Word Detail Popup */}
        <Modal
          visible={showWordPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWordPopup(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowWordPopup(false)}
          >
            <View style={styles.popupContainer}>
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.popup}>
                  {/* Word and pronunciation */}
                  <Text style={styles.popupWord}>{selectedWord}</Text>
                  
                  {wordLoading ? (
                    <ActivityIndicator size="small" color="#C19A6B" style={{ marginTop: 16 }} />
                  ) : wordDetail ? (
                    <>
                      {/* Context sentence */}
                      {contextSentence && (
                        <View style={styles.contextBox}>
                          <Text style={styles.contextLabel}>Context</Text>
                          <Text style={styles.contextText}>
                            {contextSentence.replace(
                              new RegExp(`(${selectedWord})`, 'gi'),
                              (match) => `👉 ${match} 👈`
                            )}
                          </Text>
                        </View>
                      )}
                      
                      {/* English explanation */}
                      {wordDetail.simpleExplanation && (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationLabel}>Explanation</Text>
                          <Text style={styles.explanationText}>
                            {wordDetail.simpleExplanation}
                          </Text>
                        </View>
                      )}
                      
                      {/* Example sentences */}
                      {wordDetail.exampleSentences && wordDetail.exampleSentences.length > 0 && (
                        <View style={styles.examplesBox}>
                          <Text style={styles.examplesLabel}>Examples</Text>
                          {wordDetail.exampleSentences.map((example, idx) => (
                            <Text key={idx} style={styles.exampleText}>
                              • {example}
                            </Text>
                          ))}
                        </View>
                      )}
                      
                      {/* Fun memory tip */}
                      {wordDetail.funMemory && (
                        <View style={styles.memoryBox}>
                          <Text style={styles.memoryIcon}>🎯</Text>
                          <Text style={styles.memoryText}>{wordDetail.funMemory}</Text>
                        </View>
                      )}
                      
                      {/* Action buttons */}
                      <View style={styles.popupActions}>
                        <TouchableOpacity 
                          style={[
                            styles.favoriteButton,
                            isFavorite && styles.favoriteButtonActive
                          ]}
                          onPress={handleAddToFavorites}
                          disabled={addingFavorite}
                        >
                          {addingFavorite ? (
                            <ActivityIndicator size="small" color={isFavorite ? '#C19A6B' : '#FAF8F5'} />
                          ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              {/* @ts-ignore */}
                              {isFavorite ? <BookmarkCheck size={16} stroke={isFavorite ? '#C19A6B' : '#FAF8F5'} /> : <BookmarkPlus size={16} stroke={isFavorite ? '#C19A6B' : '#FAF8F5'} />}
                              <Text style={[
                                styles.favoriteButtonText,
                                isFavorite && styles.favoriteButtonTextActive
                              ]}>
                                {isFavorite ? '已添加' : '添加到生词本'}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.closeButton}
                          onPress={() => setShowWordPopup(false)}
                        >
                          <Text style={styles.closeButtonText}>关闭</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : wordError ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>加载失败</Text>
                      <Text style={styles.errorHint}>点击重试</Text>
                      <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => refetchWordDetail()}
                      >
                        <Text style={styles.retryButtonText}>重试</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
}

// Paragraph Translation Component
function ParagraphTranslation({ 
  paragraph, 
  paragraphIndex,
}: { 
  paragraph: string;
  paragraphIndex: number;
}) {
  // Use TanStack Query for translation with automatic caching
  const { data: translatedText, isLoading, error } = useTranslateText(paragraph);
  
  if (isLoading) {
    return (
      <View style={styles.translationContainer}>
        <ActivityIndicator size="small" color="#C19A6B" />
        <Text style={styles.translatingText}>翻译中...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.translationContainer}>
        <Text style={styles.translationError}>翻译失败</Text>
      </View>
    );
  }
  
  if (translatedText) {
    return (
      <View style={styles.translationContainer}>
        <Text style={styles.translationText}>{translatedText}</Text>
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FAF8F5',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readAloudButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C19A6B',
  },
  readAloudButtonActive: {
    backgroundColor: '#C19A6B',
  },
  readAloudButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C19A6B',
  },
  readAloudButtonTextActive: {
    color: '#FFFFFF',
  },
  readAloudButtonDisabled: {
    opacity: 0.5,
  },
  readAloudButtonTextDisabled: {
    color: '#999',
  },
  translateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C19A6B',
  },
  translateButtonActive: {
    backgroundColor: '#C19A6B',
  },
  translateButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C19A6B',
  },
  translateButtonTextActive: {
    color: '#FFFFFF',
  },
  backButton: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#5C5C5C',
  },
  sourceUrlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  sourceUrlButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C19A6B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C19A6B',
    backgroundColor: 'transparent',
  },
  categoryText: {
    fontSize: 18,
    color: '#C19A6B',
    fontWeight: '500',
    letterSpacing: 1,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2C2C2C',
    lineHeight: 58,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dateText: {
    fontSize: 18,
    color: '#8B8680',
    fontWeight: '400',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C0BA',
    marginHorizontal: 12,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeIcon: {
    fontSize: 18,
    marginRight: 4,
    color: '#8B8680',
  },
  readTimeText: {
    fontSize: 18,
    color: '#8B8680',
    fontWeight: '400',
  },
  decorativeDivider: {
    height: 1,
    backgroundColor: '#C19A6B',
    marginBottom: 32,
    position: 'relative',
  },
  diamondDecoration: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: '#C19A6B',
    transform: [{ rotate: '45deg' }],
  },
  contentSection: {
    marginBottom: 32,
  },
  paragraphWrapper: {
    marginBottom: 32,
  },
  paragraphContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  wordTouchable: {
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  paragraphWord: {
    fontSize: 30,
    color: '#3C3C3C',
    lineHeight: 44,
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  paragraph: {
    fontSize: 30,
    color: '#3C3C3C',
    lineHeight: 44,
    textAlignVertical: 'center',
    includeFontPadding: false,
    marginBottom: 0,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  popupWord: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  contextBox: {
    backgroundColor: '#F5F0EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C19A6B',
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8680',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 16,
    color: '#3C3C3C',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  explanationBox: {
    marginBottom: 16,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8680',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 17,
    color: '#2C2C2C',
    lineHeight: 26,
  },
  examplesBox: {
    marginBottom: 16,
  },
  examplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8680',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 15,
    color: '#5C5C5C',
    lineHeight: 24,
    marginBottom: 4,
  },
  memoryBox: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  memoryIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  memoryText: {
    flex: 1,
    fontSize: 15,
    color: '#8B7355',
    lineHeight: 22,
  },
  popupActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#C19A6B',
  },
  favoriteButtonText: {
    color: '#FAF8F5',
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#F5F0EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#5C5C5C',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorHint: {
    fontSize: 13,
    color: '#8B8680',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#C19A6B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  tipContainer: {
    backgroundColor: '#F5F0EB',
    padding: 20,
    marginTop: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#C19A6B',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 19,
    color: '#8B8680',
    lineHeight: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B8680',
    marginBottom: 24,
  },
  translationContainer: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E8E4DF',
    marginLeft: 8,
  },
  translatingText: {
    fontSize: 16,
    color: '#8B8680',
    marginTop: 4,
    fontStyle: 'italic',
  },
  translationError: {
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 4,
  },
  translationText: {
    fontSize: 24,
    color: '#5C5C5C',
    lineHeight: 36,
    fontFamily: Platform.select({
      ios: 'PingFang SC',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
});
