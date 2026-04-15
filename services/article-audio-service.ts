import { TECHCRUNCH_AI_NEWS_API } from '@/constants/config';

export interface AudioGenerationResponse {
  success: boolean;
  message: string;
  audio_file?: string;
  duration_seconds?: number;
  audio_size_bytes?: number;
  download_url?: string;  // 添加下载链接字段
}

class ArticleAudioService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = TECHCRUNCH_AI_NEWS_API.baseUrl;
    this.apiKey = TECHCRUNCH_AI_NEWS_API.apiKey;
  }

  /**
   * 生成文章音频
   * @param articleUrl 文章URL
   * @param voice 语音类型（默认 Katerina）
   */
  async generateArticleAudio(
    articleUrl: string,
    voice: string = 'Katerina'
  ): Promise<AudioGenerationResponse> {
    try {
      console.log('[ArticleAudio] Generating audio for URL:', articleUrl);
      console.log('[ArticleAudio] Base URL:', this.baseUrl);
      
      // 对 URL 进行编码
      const encodedUrl = encodeURIComponent(articleUrl);
      const requestUrl = `${this.baseUrl}/news/read?url=${encodedUrl}&voice=${voice}`;
      console.log('[ArticleAudio] Request URL:', requestUrl);
      
      const response = await fetch(
        requestUrl,
        {
          method: 'POST',
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[ArticleAudio] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ArticleAudio] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: AudioGenerationResponse = await response.json();
      console.log('[ArticleAudio] Response data:', JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('[ArticleAudio] Failed to generate article audio:', error);
      throw error;
    }
  }

  /**
   * 获取音频文件的完整URL
   * 根据 API 文档，音频文件需要通过 /audio/download 接口下载
   * @param audioFile 音频文件名
   */
  getAudioUrl(audioFile: string): string {
    // 使用 /audio/download 接口，需要传递 filename 参数
    const audioUrl = `${this.baseUrl}/audio/download?filename=${audioFile}`;
    console.log('[ArticleAudio] Generated audio URL:', audioUrl);
    return audioUrl;
  }
}

export const articleAudioService = new ArticleAudioService();
