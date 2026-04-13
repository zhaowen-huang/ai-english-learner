export interface Vocabulary {
  id: string;
  userId: string;
  word: string;
  meaning: string;
  example?: string;
  contextSentence?: string; // 单词所在的句子上下文
  articleUrl?: string; // 文章地址
  articleId?: string;
  createdAt: string;
  reviewCount: number;
  lastReviewAt?: string;
  mastered: boolean;
}
