export interface Article {
  id: string;
  title: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  wordCount: number;
  estimatedTime: number; // 分钟
  createdAt: string;
  imageUrl?: string;
}

export interface ArticleProgress {
  articleId: string;
  userId: string;
  progress: number; // 0-100
  timeSpent: number; // 秒
  completed: boolean;
  lastReadAt: string;
}
