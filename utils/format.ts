import { Platform } from 'react-native';

/**
 * 安全的日期格式化函数
 */
export function formatDate(dateString: string, locale: string = 'zh-CN'): string {
  if (!dateString) return '未知日期';

  try {
    // 处理相对时间格式
    if (dateString.includes('ago') || dateString.includes('minutes') ||
        dateString.includes('hours') || dateString.includes('days')) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: locale === 'zh-CN' ? 'long' : 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.warn('Failed to format date:', error);
    return dateString;
  }
}

/**
 * 估算阅读时间（假设平均阅读速度 200 词/分钟）
 */
export function estimateReadTime(content: string): string {
  if (!content) return '0 min';
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min`;
}

/**
 * 清理单词，移除标点符号和非字母字符
 */
export function cleanWord(word: string): string {
  return word.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

/**
 * 从段落中提取包含指定单词的句子作为上下文
 */
export function extractContextSentence(paragraph: string, word: string): string {
  const sentences = paragraph.split(/[.!?]+/);
  const found = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
  return found ? found.trim() + '.' : '';
}

/**
 * 获取适合平台的字体族
 */
export function getPlatformFontFamily(): string {
  return Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  });
}

/**
 * 获取中文字体族
 */
export function getChineseFontFamily(): string {
  return Platform.select({
    ios: 'PingFang SC',
    android: 'sans-serif',
    default: 'sans-serif',
  });
}
