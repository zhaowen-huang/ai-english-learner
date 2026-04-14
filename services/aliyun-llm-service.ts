import axios from 'axios';
import { aiCacheService, AIContentType } from './ai-cache-service';
import { ALIYUN_API_KEY, ALIYUN_BASE_URL } from '@/constants/config';

export interface WordDetail {
  word: string;
  pronunciation: string;
  simpleExplanation: string;
  exampleSentences: string[];
  funMemory: string;
}

export const aliyunLLMService = {
  // 翻译文本（英文 -> 中文）
  async translateText(text: string): Promise<string> {
    try {
      // 先从数据库缓存中查找
      const cached = await aiCacheService.getFromCache(
        AIContentType.TRANSLATE_TEXT,
        text
      );
      if (cached) {
        return cached;
      }
      
      console.log('[LLM] 🔄 Cache miss, calling API for translateText');
      const response = await axios.post(
        `${ALIYUN_BASE_URL}/chat/completions`,
        {
          model: 'qwen-flash',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的中英翻译助手。请将英文翻译成流畅自然的中文。只返回翻译结果，不要添加任何其他文字。`
            },
            {
              role: 'user',
              content: `请将以下英文翻译成中文：\n\n${text}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${ALIYUN_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const result = response.data.choices[0].message.content;
      
      // 保存到数据库缓存
      await aiCacheService.saveToCache(
        AIContentType.TRANSLATE_TEXT,
        [text],
        result
      );
      
      return result;
    } catch (error) {
      console.error('Failed to translate text:', error);
      throw error;
    }
  },

  // 逐句翻译（返回句子数组的翻译结果）
  async translateSentences(sentences: string[]): Promise<string[]> {
    try {
      // 先从数据库缓存中查找
      const cached = await aiCacheService.getFromCache(
        AIContentType.TRANSLATE_SENTENCES,
        sentences
      );
      if (cached) {
        return cached;
      }
      
      console.log('[LLM] 🔄 Cache miss, calling API for translateSentences');
      const sentencesText = sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
      
      const response = await axios.post(
        `${ALIYUN_BASE_URL}/chat/completions`,
        {
          model: 'qwen-flash',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的中英翻译助手。请将每个英文句子翻译成流畅自然的中文。严格按照数字编号返回翻译结果，每行一个翻译，格式为：
1. 翻译1
2. 翻译2
...
只返回翻译结果，不要添加任何其他文字。`
            },
            {
              role: 'user',
              content: `请翻译以下句子：\n\n${sentencesText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${ALIYUN_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const translatedText = response.data.choices[0].message.content;
      // 解析翻译结果，提取每行的翻译
      const lines = translatedText.split('\n').filter((line: string) => line.trim());
      const translations = lines.map((line: string) => {
        // 移除行首的数字编号（如 "1. " 或 "1、"）
        return line.replace(/^\d+[\.、]\s*/, '').trim();
      });
      
      // 保存到数据库缓存
      await aiCacheService.saveToCache(
        AIContentType.TRANSLATE_SENTENCES,
        [sentences],
        translations
      );

      return translations;
    } catch (error) {
      console.error('Failed to translate sentences:', error);
      throw error;
    }
  },

  // 单词详情（不含上下文）
  async getWordDetail(word: string): Promise<WordDetail> {
    try {
      // 先从数据库缓存中查找
      const cached = await aiCacheService.getFromCache(
        AIContentType.WORD_DETAIL,
        word
      );
      if (cached) {
        return cached;
      }
      
      console.log('[LLM] 🔄 Cache miss, calling API for getWordDetail');
      const response = await axios.post(
        `${ALIYUN_BASE_URL}/chat/completions`,
        {
          model: 'qwen-flash',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的英语启蒙教师，专门教5岁小朋友学英语。

请为小朋友解释单词，要求：
1. 用最简单的英文单词（不超过5岁孩子的词汇量）
2. 解释要像讲故事一样有趣
3. 提供2-3个超简单的例句
4. 提供一个有趣的中文记忆方法

请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "word": "单词",
  "pronunciation": "音标",
  "simpleExplanation": "用5岁小孩能懂的简单英文解释",
  "exampleSentences": [
    "Super simple sentence 1.",
    "Super simple sentence 2."
  ],
  "funMemory": "有趣的中文记忆方法"
}`
            },
            {
              role: 'user',
              content: `请详细解释单词: ${word}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${ALIYUN_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      // 保存到数据库缓存
      await aiCacheService.saveToCache(
        AIContentType.WORD_DETAIL,
        [word],
        result
      );
      
      return result;
    } catch (error) {
      console.error('Failed to get word detail from Aliyun LLM:', error);
      throw error;
    }
  },

  // 根据上下文句子解释单词在原文中的含义
  async getWordDetailWithContext(sentence: string, word: string): Promise<WordDetail> {
    try {
      // 先从数据库缓存中查找（使用单词+句子作为key）
      const cached = await aiCacheService.getFromCache(
        AIContentType.WORD_DETAIL_WITH_CONTEXT,
        sentence,
        word
      );
      if (cached) {
        return cached;
      }
      
      console.log('[LLM] 🔄 Cache miss, calling API for getWordDetailWithContext');
      const response = await axios.post(
        `${ALIYUN_BASE_URL}/chat/completions`,
        {
          model: 'qwen-flash',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的英语启蒙教师，专门教5岁小朋友学英语。

请根据单词在句子中的上下文，为小朋友解释这个单词在原文中的具体含义。

要求：
1. 用最简单的英文单词（不超过5岁孩子的词汇量）
2. 解释要说明这个单词在句子中的具体意思
3. 提供2-3个超简单的例句
4. 提供一个有趣的中文记忆方法

请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "word": "单词",
  "pronunciation": "音标",
  "simpleExplanation": "用5岁小孩能懂的简单英文解释这个单词在句子中的意思",
  "exampleSentences": [
    "Super simple sentence 1.",
    "Super simple sentence 2."
  ],
  "funMemory": "有趣的中文记忆方法"
}`
            },
            {
              role: 'user',
              content: `在句子 "${sentence}" 中，单词 "${word}" 是什么意思？请用5岁小朋友能懂的方式解释。`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${ALIYUN_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      // 保存到数据库缓存
      await aiCacheService.saveToCache(
        AIContentType.WORD_DETAIL_WITH_CONTEXT,
        [sentence, word],
        result
      );
      
      return result;
    } catch (error) {
      console.error('Failed to get word detail with context from Aliyun LLM:', error);
      throw error;
    }
  },
};
