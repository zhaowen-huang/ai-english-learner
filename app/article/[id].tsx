import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal as RNModal,
  Linking,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { guardianApiService } from '@/services/guardian-api-service';
import { aiNewsService } from '@/services/ai-news-service';
import { progressService } from '@/services/progress-service';
import { vocabularyService } from '@/services/vocabulary-service';
import { dictionaryService } from '@/services/dictionary-service';
import { aliyunLLMService } from '@/services/aliyun-llm-service';
import { useAuthStore } from '@/store/auth-store';
import { SuccessToast } from '@/components/SuccessToast';
import { useWordDefinition, useWordDetailWithContext, useToggleWordFavorite, useVocabularies } from '@/hooks';
import type { GuardianArticle } from '@/services/guardian-api-service';
import type { AINewsArticle } from '@/services/ai-news-service';
import type { WordDefinition } from '@/services/dictionary-service';

interface SimpleWordExplanation {
  simpleExplanation: string;
  exampleSentences: string[];
}

// 安全的日期格式化函数
function formatDate(dateString: string): string {
  if (!dateString) return '未知日期';
  
  try {
    const date = new Date(dateString);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('[Date] Invalid date string:', dateString);
      return '未知日期';
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('[Date] Failed to parse date:', dateString, error);
    return '未知日期';
  }
}

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
};

export default function ArticleDetailScreen() {
  const { id, source } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // State declarations
  const [article, setArticle] = useState<GuardianArticle | AINewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWordCard, setShowWordCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedWordContext, setSelectedWordContext] = useState(''); // 保存单词所在的句子
  const [simpleExplanation, setSimpleExplanation] = useState<SimpleWordExplanation | null>(null);
  const [wordFavorited, setWordFavorited] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);
  const [loadingDifficultWords, setLoadingDifficultWords] = useState(false);
  const [showDifficultWords, setShowDifficultWords] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // TanStack Query hooks (must be called after all useState)
  const { data: wordDefinition, isLoading: loadingDefinition } = useWordDefinition(selectedWord || null);
  const { data: wordExplanation, isLoading: loadingExplanation } = useWordDetailWithContext(
    selectedWord || null,
    selectedWordContext || null
  );
  const toggleFavoriteMutation = useToggleWordFavorite();
  
  // 获取生词本列表用于检查收藏状态
  const { data: vocabularies = [] } = useVocabularies();
  
  // Computed values
  const loadingWord = loadingDefinition || loadingExplanation;

  useEffect(() => {
    const loadArticle = async () => {
      // 如果是 AI News 来源，从 AsyncStorage 加载
      if (source === 'ai-news') {
        try {
          const storedArticle = await AsyncStorage.getItem(`ai-news-${id}`);
          if (storedArticle) {
            let articleData: AINewsArticle = JSON.parse(storedArticle);
            
            // 总是尝试获取完整内容（除非已经有完整的 content）
            const hasFullContent = articleData.content && articleData.content.length > 500;
            
            if (!hasFullContent) {
              console.log('[AI News] 📖 Fetching full article content...');
              console.log('[AI News] Current content length:', articleData.content?.length || 0);
              
              // 设置一个超时，避免无限等待
              const fetchTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Fetch timeout')), 12000);
              });
              
              try {
                // race between fetch and timeout
                const detail = await Promise.race([
                  aiNewsService.fetchArticleDetail(articleData.sourceUrl),
                  fetchTimeout,
                ]) as { content: string; summary: string } | null;
                
                if (detail && detail.content) {
                  articleData = {
                    ...articleData,
                    content: detail.content,
                    summary: detail.summary || articleData.summary,
                  };
                  // 更新 AsyncStorage 中的文章
                  await AsyncStorage.setItem(`ai-news-${id}`, JSON.stringify(articleData));
                  console.log('[AI News] ✅ Full content loaded:', detail.content.length, 'chars');
                } else {
                  console.warn('[AI News] ⚠️ Could not fetch full content, using summary');
                }
              } catch (fetchError) {
                console.error('[AI News] ❌ Failed to fetch details:', fetchError);
                // 即使获取详情失败，也继续显示文章（使用摘要）
              }
            } else {
              console.log('[AI News] ✅ Already has full content, skipping fetch');
            }
            
            setArticle(articleData);
            setLoading(false); // 立即设置 loading 为 false，显示文章
            
            // 尝试从 AsyncStorage 加载缓存的翻译
            loadAndShowCachedTranslation(articleData.id);
            
            // 后台自动翻译（不阻塞 UI）
            autoTranslateArticleInBackground(articleData as any);
          } else {
            Alert.alert('提示', '文章可能已过期，请返回列表重新选择');
            router.back();
          }
        } catch (error) {
          console.error('Failed to load AI news article:', error);
          Alert.alert('错误', '加载文章失败');
          router.back();
        }
        return;
      }
      
      // 如果不是 AI News，显示错误
      Alert.alert('提示', '不支持的文章类型');
      router.back();
    };
    
    loadArticle();
  }, [id, source]);
  
  // 加载并显示缓存的翻译
  const loadAndShowCachedTranslation = async (articleId: string) => {
    const hasCache = await loadCachedTranslation(articleId);
    
    // 只有在有缓存的情况下才自动显示翻译
    if (hasCache) {
      setShowTranslation(true);
      console.log('[Translation] ✅ Loaded from cache, showing translations');
    }
    // 如果没有缓存，不自动翻译，等待用户点击按钮
  };
  
  // 后台自动翻译（不阻塞 UI，不显示 loading）
  const autoTranslateArticleInBackground = async (articleToTranslate: GuardianArticle | AINewsArticle | null) => {
    if (!articleToTranslate) return;
    
    // 检查是否已经翻译过
    if (Object.keys(translations).length > 0) {
      console.log('[Background Translation] ✅ Already translated, skipping');
      return;
    }
    
    // 注意：这里不设置 loadingTranslation，避免阻塞 UI
    console.log('[Background Translation] 🔄 Starting background translation...');
    
    try {
      // 按段落分割文章内容
      const paragraphs = articleToTranslate.content.split(/\n+/).filter(p => p.trim());
      
      console.log(`[Background Translation] 📝 Total ${paragraphs.length} paragraphs to translate`);
      
      // 分批翻译，每批 2 段
      const BATCH_SIZE = 2;
      const translationMap: Record<string, string> = {};
      
      for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
        const batchParagraphs = paragraphs.slice(i, i + BATCH_SIZE);
        const batchKeys = batchParagraphs.map((_, idx) => `${i + idx}`);
        
        console.log(`[Background Translation] 🔄 Translating batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
        
        // 翻译当前批次
        const batchTranslations = await aliyunLLMService.translateSentences(batchParagraphs);
        
        // 检查返回值是否为数组
        if (!batchTranslations || !Array.isArray(batchTranslations)) {
          console.error('[Background Translation] ❌ Invalid batchTranslations:', batchTranslations);
          continue;
        }
        
        // 立即更新 UI
        batchTranslations.forEach((trans, idx) => {
          if (batchKeys[idx]) {
            translationMap[batchKeys[idx]] = trans;
          }
        });
        
        // 实时更新 translations 状态
        setTranslations({ ...translationMap });
        
        console.log(`[Background Translation] ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} completed`);
      }
      
      console.log(`[Background Translation] ✅ All translations completed: ${Object.keys(translationMap).length} sentences`);
      
      // 保存到 AsyncStorage 缓存
      if (articleToTranslate.id) {
        saveCachedTranslation(articleToTranslate.id, translationMap);
      }
      
    } catch (error) {
      console.error('[Background Translation] ❌ Failed:', error);
    }
    // 注意：这里不设置 setLoadingTranslation(false)，因为从未设置为 true
  };
  
  // 从 AsyncStorage 加载缓存的翻译
  const loadCachedTranslation = async (articleId: string): Promise<boolean> => {
    try {
      const cacheKey = `translation_${articleId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedTranslations = JSON.parse(cached);
        console.log(`[Translation Cache] ✅ Loaded from AsyncStorage for article ${articleId}`);
        setTranslations(parsedTranslations);
        return true; // 有缓存
      }
      
      return false; // 没有缓存
    } catch (error) {
      console.error('[Translation Cache] Failed to load:', error);
      return false;
    }
  };
  
  // 保存翻译到 AsyncStorage
  const saveCachedTranslation = async (articleId: string, translationsData: Record<string, string>) => {
    try {
      const cacheKey = `translation_${articleId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(translationsData));
      console.log(`[Translation Cache] ✅ Saved to AsyncStorage for article ${articleId}`);
    } catch (error) {
      console.error('[Translation Cache] Failed to save:', error);
    }
  };
  
  // 从 AsyncStorage 加载缓存的难词
  const loadCachedDifficultWords = async (articleId: string): Promise<string[] | null> => {
    try {
      const cacheKey = `difficult_words_${articleId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`[Difficult Words Cache] ✅ Loaded from AsyncStorage for article ${articleId}`);
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('[Difficult Words Cache] Failed to load:', error);
      return null;
    }
  };
  
  // 保存难词到 AsyncStorage
  const saveCachedDifficultWords = async (articleId: string, words: string[]) => {
    try {
      const cacheKey = `difficult_words_${articleId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(words));
      console.log(`[Difficult Words Cache] ✅ Saved to AsyncStorage for article ${articleId}: ${words.length} words`);
    } catch (error) {
      console.error('[Difficult Words Cache] Failed to save:', error);
    }
  };
  
  // 自动翻译文章（流式渲染）
  const autoTranslateArticle = async (articleToTranslate: GuardianArticle | AINewsArticle | null) => {
    if (!articleToTranslate) return;
    
    // 检查是否已经翻译过（避免重复翻译）
    if (Object.keys(translations).length > 0) {
      console.log('[Translation] ✅ Already translated, skipping');
      return;
    }
    
    // 检查是否正在翻译中
    if (loadingTranslation) {
      console.log('[Translation] ⏳ Translation in progress, skipping');
      return;
    }
    
    try {
      setLoadingTranslation(true);
      console.log('[Translation] 🔄 Starting streaming translation...');
      
      // 按段落分割文章内容
      const paragraphs = articleToTranslate.content.split(/\n+/).filter(p => p.trim());
      
      console.log(`[Translation] 📝 Total ${paragraphs.length} paragraphs to translate`);
      
      // 分批翻译，每批 2 段
      const BATCH_SIZE = 2;
      const translationMap: Record<string, string> = {};
      
      for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
        const batchParagraphs = paragraphs.slice(i, i + BATCH_SIZE);
        const batchKeys = batchParagraphs.map((_, idx) => `${i + idx}`);
        
        console.log(`[Translation] 🔄 Translating batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchParagraphs.length} paragraphs)...`);
        
        // 翻译当前批次
        const batchTranslations = await aliyunLLMService.translateSentences(batchParagraphs);
        
        // 立即更新 UI
        batchTranslations.forEach((trans, idx) => {
          if (batchKeys[idx]) {
            translationMap[batchKeys[idx]] = trans;
          }
        });
        
        // 实时更新 translations 状态
        setTranslations({ ...translationMap });
        
        console.log(`[Translation] ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} completed, total: ${Object.keys(translationMap).length}`);
      }
      
      console.log(`[Translation] ✅ All translations completed: ${Object.keys(translationMap).length} paragraphs`);
      
      // 保存到 AsyncStorage 缓存
      if (articleToTranslate.id) {
        saveCachedTranslation(articleToTranslate.id, translationMap);
      }
      
    } catch (error) {
      console.error('[Translation] ❌ Failed to auto-translate:', error);
      // 静默失败，不影响用户体验
    } finally {
      setLoadingTranslation(false);
    }
  };

  // 监听单词卡片显示状态，触发动画并检查收藏状态
  useEffect(() => {
    if (showWordCard && selectedWord) {
      // 每次打开卡片时，从 React Query 缓存中检查收藏状态
      const cleanWord = selectedWord.replace(/[^\w]/g, '').toLowerCase();
      const isFavorited = vocabularies.some((v: any) => v.word === cleanWord);
      console.log('[WordCard] 检查收藏状态:', cleanWord, '已收藏:', isFavorited, '词库大小:', vocabularies.length);
      setWordFavorited(isFavorited);
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      scaleAnim.setValue(0.8);
    }
  }, [showWordCard, selectedWord, vocabularies]);



  const handleWordPress = async (word: string, context: string) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length > 0) {
      setSelectedWord(cleanWord);
      setSelectedWordContext(context); // 保存上下文句子
      setShowWordCard(true);
      // 收藏状态由 useEffect 自动检查
    }
  };

  const handleFavoriteWord = async () => {
    if (!user) {
      Alert.alert(
        '需要登录',
        '收藏单词需要先登录，是否前往登录页面？',
        [
          { text: '取消', style: 'cancel' },
          { text: '去登录', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }
    
    // 立即更新 UI 状态，避免卡顿
    const newFavoritedState = !wordFavorited;
    setWordFavorited(newFavoritedState);
    
    try {
      // 使用 LLM 生成的简单解释和例句，保留完整内容
      const meaning = wordExplanation?.simpleExplanation || 
                      wordDefinition?.meanings?.[0]?.definitions?.[0]?.definition || '';
      const example = wordExplanation?.exampleSentences?.join('\n') || 
                      wordDefinition?.meanings?.[0]?.definitions?.[0]?.example || '';
      
      // 异步执行 API 调用
      await toggleFavoriteMutation.mutateAsync({
        word: selectedWord,
        meaning,
        example,
        contextSentence: selectedWordContext,
        articleUrl: article ? ('url' in article ? article.url : article.sourceUrl) : undefined
      });
      
      // 如果 API 返回的状态与预期不符，进行修正
      if (toggleFavoriteMutation.data !== undefined && toggleFavoriteMutation.data !== newFavoritedState) {
        setWordFavorited(toggleFavoriteMutation.data);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // 失败时回滚 UI 状态
      setWordFavorited(!newFavoritedState);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const handleComplete = async () => {
    if (!user || !article) return;
    
    Alert.alert('恭喜！', '你已完成这篇文章的阅读');
  };

  const handleOpenSource = async () => {
    if (!article) return;
    const url = 'url' in article ? article.url : article.sourceUrl;
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('错误', '无法打开链接');
      }
    }
  };

  const handlePlayPronunciation = () => {
    dictionaryService.playPronunciation(selectedWord);
  };

  const handleTranslate = async () => {
    if (!article) return;
    
    // 如果已经有翻译数据，直接切换显示状态（不重新请求）
    if (Object.keys(translations).length > 0) {
      console.log('[Translation] 👁️ Toggle translation visibility');
      setShowTranslation(!showTranslation);
      return;
    }
    
    // 如果没有翻译数据，启动翻译（显示 loading）
    console.log('[Translation] 🚀 Start translation on user request');
    setShowTranslation(true);
    
    // 如果已经在翻译中，不重复触发
    if (loadingTranslation) {
      console.log('[Translation] ⏳ Already translating, waiting...');
      return;
    }
    
    // 用户主动点击，显示 loading 状态
    await autoTranslateArticle(article);
  };

  // 提取5岁小孩看不懂的单词
  const extractDifficultWords = async () => {
    if (!article) return;
    
    // 如果已经有缓存的难词，直接显示
    if (difficultWords.length > 0) {
      setShowDifficultWords(true);
      console.log('[Difficult Words] ✅ Using cached difficult words');
      return;
    }
    
    setLoadingDifficultWords(true);
    
    try {
      console.log('[Difficult Words] 🔄 Extracting difficult words for 5-year-old...');
      
      // 先从 AsyncStorage 加载缓存
      const cached = await loadCachedDifficultWords(article.id);
      if (cached && cached.length > 0) {
        setDifficultWords(cached);
        setShowDifficultWords(true);
        console.log('[Difficult Words] ✅ Loaded from cache:', cached.length, 'words');
        setLoadingDifficultWords(false);
        return;
      }
      
      // 调用阿里云 LLM 识别难词
      const prompt = `
请从以下英文文章中找出5岁小孩可能看不懂的单词。要求：
1. 只返回单词列表，用逗号分隔
2. 不要包含标点符号
3. 每个单词只出现一次
4. 选择较难的、不常见的单词
5. 最多返回20个单词

文章内容：
${article.content}

请直接返回单词列表：
`;
      
      const axios = require('axios');
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        {
          model: 'qwen-flash',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的英语教师助手。请从文章中识别出对5岁儿童来说较难的单词。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': 'Bearer sk-cd1ba98aecec49e4a61976e55c863965',
            'Content-Type': 'application/json',
          }
        }
      );
      
      const result = response.data.choices[0].message.content;
      
      // 解析返回的单词列表
      const wordsText = result.trim();
      const words: string[] = wordsText
        .split(/[\s,\n]+/)
        .map((w: string) => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
        .filter((w: string) => w.length > 0)
        .filter((w: string, i: number, arr: string[]) => arr.indexOf(w) === i); // 去重
      
      // 限制最多20个单词
      const limitedWords = words.slice(0, 20);
      
      setDifficultWords(limitedWords);
      setShowDifficultWords(true);
      
      // 保存到 AsyncStorage 缓存
      if (article.id) {
        saveCachedDifficultWords(article.id, limitedWords);
      }
      
      console.log(`[Difficult Words] ✅ Found ${limitedWords.length} difficult words:`, limitedWords);
    } catch (error) {
      console.error('[Difficult Words] ❌ Failed to extract:', error);
      Alert.alert('错误', '提取难词失败，请稍后重试');
    } finally {
      setLoadingDifficultWords(false);
    }
  };

  // 点击难词查看释义
  const handleDifficultWordPress = (word: string) => {
    setSelectedWord(word);
    setSelectedWordContext(''); // 难词没有上下文
    setShowWordCard(true);
    // 不再关闭难词列表，保持显示
    
    // 检查是否已收藏
    const isFavorited = vocabularies.some((v: any) => v.word === word);
    setWordFavorited(isFavorited);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>加载文章中...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>文章不存在</Text>
        </View>
      </View>
    );
  }

  const words = article.content.split(/\s+/);
  const colors = categoryColors[article.category] || { bg: '#E3F2FD', text: '#1976D2' };
  const wordCount = article.content.split(/\s+/).length;

  return (
    <View style={styles.container}>
      {/* 状态栏 */}
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* 顶部导航栏 */}
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        {/* 左侧：返回按钮 */}
        <TouchableOpacity 
          onPress={() => {
            try {
              router.back();
            } catch {
              router.replace('/(tabs)/articles' as any);
            }
          }} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        
        {/* 右侧：功能按钮组 */}
        <View style={styles.navBarActions}>
          <TouchableOpacity
            style={[
              styles.translateToggleButton, 
              showTranslation && styles.translateToggleActive,
              loadingTranslation && styles.translateToggleLoading
            ]}
            onPress={handleTranslate}
            activeOpacity={0.7}
            disabled={loadingTranslation}
          >
            {loadingTranslation ? (
              <View style={styles.translateToggleLoadingContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.translateToggleLoadingText}>翻译中...</Text>
              </View>
            ) : (
              <Text style={[styles.translateToggleText, showTranslation && styles.translateToggleTextActive]}>
                {showTranslation ? '隐藏译文' : '显示译文'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.difficultWordsButton,
              showDifficultWords && styles.difficultWordsButtonActive
            ]}
            onPress={extractDifficultWords}
            activeOpacity={0.7}
            disabled={loadingDifficultWords}
          >
            {loadingDifficultWords ? (
              <View style={styles.translateToggleLoadingContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.translateToggleLoadingText}>分析中...</Text>
              </View>
            ) : (
              <Text style={[styles.translateToggleText, showDifficultWords && styles.translateToggleTextActive]}>
                {difficultWords.length > 0 ? `难词 (${difficultWords.length})` : '识别难词'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 文章标题区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {article.title}
          </Text>
          
          {/* 元信息 */}
          <View style={styles.metaContainer}>
            <View style={[styles.metaItem, { backgroundColor: colors.bg }]}>
              <Text style={[styles.metaText, { color: colors.text }]}>{article.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>
                {formatDate(article.publishedAt)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📝</Text>
              <Text style={styles.metaText}>{wordCount} 词</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📰</Text>
              <Text style={styles.metaText}>
                {'source' in article ? article.source.name : 'AI News'}
              </Text>
            </View>
          </View>
          
          {/* 原文地址 */}
          {'sourceUrl' in article && article.sourceUrl && (
            <View style={styles.sourceUrlContainer}>
              <Text style={styles.sourceUrlLabel}>🔗 原文地址：</Text>
              <Text style={styles.sourceUrlText} numberOfLines={1}>
                {article.sourceUrl}
              </Text>
            </View>
          )}
        </View>

        {/* 分割线 */}
        <View style={styles.divider} />

        {/* 难词列表 - 放在最上面 */}
        {showDifficultWords && difficultWords.length > 0 && (
          <View style={styles.difficultWordsContainer}>
            <View style={styles.difficultWordsHeader}>
              <Text style={styles.difficultWordsTitle}>📚 可能看不懂的单词</Text>
              <TouchableOpacity
                onPress={() => setShowDifficultWords(false)}
                style={styles.difficultWordsCloseButton}
              >
                <Text style={styles.difficultWordsCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.difficultWordsList}>
              {difficultWords.map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.difficultWordItem}
                  onPress={() => handleDifficultWordPress(word)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.difficultWordText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 文章内容 */}
        <View style={styles.contentContainer}>
          <View style={styles.wordsContainer}>
              {(() => {
                // 按段落分割内容
                const paragraphs = article.content.split(/\n+/).filter(p => p.trim());
                
                return paragraphs.map((paragraph, paraIdx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  
                  // 按空格分词
                  const words = trimmed.split(/\s+/);
                  const translation = translations[`${paraIdx}`];
                  
                  if (words.length === 0) return null;
                  
                  return (
                    <View key={`para-${paraIdx}`} style={styles.paragraphBlock}>
                      {/* 英文段落 - 使用 flexWrap 实现自动换行 */}
                      <View style={styles.englishParagraph}>
                        {words.map((word, wordIdx) => {
                          // 清理单词用于查询
                          const cleanWord = word.replace(/[^a-zA-Z'-]/g, '');
                          const isPunctuation = !cleanWord;
                          
                          if (isPunctuation) {
                            return <Text key={wordIdx} style={styles.wordText}>{word} </Text>;
                          }
                          
                          return (
                            <TouchableOpacity
                              key={wordIdx}
                              onPress={() => handleWordPress(word, trimmed)}
                              activeOpacity={0.7}
                              style={styles.wordButton}
                            >
                              <Text style={styles.wordText}>{word} </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      
                      {/* 中文翻译 */}
                      {showTranslation && translation && (
                        <View style={styles.translationBlock}>
                          <Text style={styles.translationSentenceText}>{translation}</Text>
                        </View>
                      )}
                    </View>
                  );
                });
              })()}
            </View>
        </View>
        
        {/* 底部间距 - 适配安全区域 */}
        <View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
        <Text style={styles.bottomHint}>
          💡 点击任意单词可查看释义
        </Text>
      </View>

      {/* 单词卡片弹窗 */}
      <Modal
        isVisible={showWordCard}
        onBackdropPress={() => setShowWordCard(false)}
        propagateSwipe={true}
        style={{ margin: 0 }}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={150}
        animationOutTiming={150}
        useNativeDriver
        backdropOpacity={0.3}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[styles.wordCard, { transform: [{ scale: scaleAnim }] }]}
          >
            {/* 单词头部 */}
            <View style={styles.wordCardHeader}>
              <View style={styles.wordTitleRow}>
                <View style={styles.wordInfoContainer}>
                  <Text style={styles.wordCardWord}>
                    {selectedWord}
                  </Text>
                  {wordDefinition?.phonetic && (
                    <Text style={styles.wordCardPhonetic}>
                      {wordDefinition.phonetic}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowWordCard(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.wordActionsRow}>
                <TouchableOpacity
                  style={styles.pronunciationButton}
                  onPress={handlePlayPronunciation}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pronunciationIcon}>🔊</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pronunciationButton, wordFavorited && styles.favoriteButtonActive]}
                  onPress={handleFavoriteWord}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pronunciationIcon, wordFavorited && styles.favoriteIconActive]}>
                    {wordFavorited ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 单词内容 */}
            <ScrollView 
              style={styles.wordCardContent} 
              contentContainerStyle={styles.wordCardContentInner}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
            >
              {loadingWord ? (
                <View style={styles.loadingWordContainer}>
                  <ActivityIndicator size="small" color="#667EEA" />
                  <Text style={styles.loadingWordText}>查询中...</Text>
                </View>
              ) : (
                <>
                  {/* LLM 简单解释 */}
                  {wordExplanation && (
                    <View style={styles.simpleExplanationSection}>
                      <Text style={styles.simpleExplanationTitle}>🌟 简单理解</Text>
                      <Text style={styles.simpleExplanationText}>
                        {wordExplanation.simpleExplanation}
                      </Text>
                      {wordExplanation.exampleSentences && wordExplanation.exampleSentences.length > 0 && (
                        <View style={styles.exampleSentencesContainer}>
                          {wordExplanation.exampleSentences.map((sentence, idx) => (
                            <Text key={idx} style={styles.exampleSentenceText}>
                              • {sentence}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* 传统词典解释 */}
                  {wordDefinition && wordDefinition.meanings.length > 0 && (
                    <>
                      <View style={styles.wordCardDivider} />
                      <Text style={styles.traditionalTitle}>📖 词典释义</Text>
                      {wordDefinition.meanings.map((meaning, idx) => (
                        <View key={idx} style={styles.meaningSection}>
                          <View style={styles.partOfSpeechBadge}>
                            <Text style={styles.partOfSpeechText}>{meaning.partOfSpeech}</Text>
                          </View>
                          {meaning.definitions.map((def, defIdx) => (
                            <View key={defIdx} style={styles.definitionItem}>
                              <Text style={styles.definitionText}>
                                {defIdx + 1}. {def.definition}
                              </Text>
                              {def.example && (
                                <Text style={styles.exampleText}>例: {def.example}</Text>
                              )}
                            </View>
                          ))}
                        </View>
                      ))}
                    </>
                  )}
                  
                  {/* 如果都没有 */}
                  {!wordExplanation && (!wordDefinition || wordDefinition.meanings.length === 0) && (
                    <View style={styles.noDefinitionContainer}>
                      <Text style={styles.noDefinitionText}>😕</Text>
                      <Text style={styles.noDefinitionText}>暂无释义</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
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
    color: '#64748B',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryBadgeCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  navBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  translateToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateToggleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  translateToggleLoading: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    opacity: 0.8,
  },
  translateToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  translateToggleTextActive: {
    color: '#FFFFFF',
  },
  translateToggleLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  translateToggleLoadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  difficultWordsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  difficultWordsButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 32,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  sourceUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  sourceUrlLabel: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600',
  },
  sourceUrlText: {
    flex: 1,
    fontSize: 12,
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  progressSection: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 13,
    color: '#667EEA',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingTranslationContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingTranslationText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  loadingTranslationHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#94A3B8',
  },
  wordsContainer: {
  },
  paragraphBlock: {
    marginBottom: 25,
  },
  englishParagraph: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  translationBlock: {
    marginTop: 6,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  translationSentenceText: {
    fontSize: 16,
    color: '#10B981',
    lineHeight: 24,
  },
  difficultWordsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  difficultWordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultWordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  difficultWordsCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultWordsCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  difficultWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultWordItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  difficultWordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  wordButton: {
    marginRight: 2,
    marginBottom: 2,
  },
  wordText: {
    fontSize: 20,
    color: '#1E293B',
    lineHeight: 28,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  translateButtonFull: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  translateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalWord: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  modalButtons: {
    gap: 12,
  },
  modalPrimaryButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSecondaryButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  wordCardHeader: {
    padding: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 90,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wordActionsRow: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    gap: 12,
  },
  wordInfoContainer: {
    flex: 1,
    marginRight: 8,
    paddingBottom: 36,
  },
  wordButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordCardTitle: {
    flex: 1,
    marginRight: 8,
  },
  wordCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 160,
  },
  wordCardWord: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  wordCardPhonetic: {
    fontSize: 16,
    color: '#64748B',
  },
  pronunciationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  pronunciationIcon: {
    fontSize: 24,
  },
  favoriteIconActive: {
    fontSize: 24,
  },
  wordCardContent: {
    maxHeight: 400,
  },
  wordCardContentInner: {
    padding: 20,
  },
  loadingWordContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingWordText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  meaningSection: {
    marginBottom: 16,
  },
  partOfSpeechBadge: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  partOfSpeechText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  definitionItem: {
    marginBottom: 12,
  },
  definitionText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#667EEA',
    fontStyle: 'italic',
    lineHeight: 20,
    marginLeft: 8,
  },
  noDefinitionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDefinitionText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  simpleExplanationSection: {
    marginBottom: 20,
  },
  simpleExplanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  simpleExplanationText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#667EEA',
    marginBottom: 12,
  },
  exampleSentencesContainer: {
    marginTop: 8,
  },
  exampleSentenceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 6,
  },
  wordCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  traditionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  wordCardFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addVocabularyButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addVocabularyButtonSuccess: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  addVocabularyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addVocabularyButtonTextSuccess: {
    fontWeight: '700',
  },
  closeWordCardButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeWordCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  translationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  translationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeTranslationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTranslationButtonText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  translationContent: {
    padding: 20,
  },
  translationLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  translationLoadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  translationLoadingHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#94A3B8',
  },
  translationText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 28,
  },
});
