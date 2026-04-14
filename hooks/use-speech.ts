import { useState, useCallback, useRef } from 'react';

export interface UseSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((word: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // 如果正在发音，先停止
    if (isSpeaking && currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    
    // 创建新的语音实例
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    // 取消之前的发音
    window.speechSynthesis.cancel();
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, options.lang, options.rate, options.pitch]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, []);

  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
