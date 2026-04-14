export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

class SpeechService {
  /**
   * 使用 Web Speech API 播放单词发音（Web 平台）
   */
  speakWord(word: string, options: SpeechOptions = {}): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech Synthesis not supported');
      return;
    }

    // 取消之前的发音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;

    window.speechSynthesis.speak(utterance);
  }

  /**
   * 停止当前发音
   */
  stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * 检查是否支持语音合成
   */
  isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }
}

export const speechService = new SpeechService();
