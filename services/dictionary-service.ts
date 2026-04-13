/**
 * 词典服务
 * 提供单词查询、发音等功能
 */

export interface WordDefinition {
  word: string;
  phonetic: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export const dictionaryService = {
  // 查询单词释义（使用免费 API）
  async lookupWord(word: string): Promise<WordDefinition | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const entry = data[0];
        return {
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
          meanings: entry.meanings?.map((m: any) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: m.definitions?.slice(0, 2).map((d: any) => ({
              definition: d.definition,
              example: d.example,
            })) || [],
          })) || [],
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to lookup word:', error);
      return null;
    }
  },

  // 播放单词发音
  playPronunciation(word: string): void {
    try {
      // 使用 Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    }
  },
};
