import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  preferFemaleVoice?: boolean;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  currentWordIndex: number;
  speak: (paragraphs: string[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSupported: boolean;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { rate = 0.9, pitch = 1.1, preferFemaleVoice = true } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const paragraphsRef = useRef<string[]>([]);
  const isStoppedRef = useRef(false);
  const isActiveRef = useRef(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const getFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('google us english female') ||
      (voice.name.includes('Google') && voice.lang.startsWith('en'))
    );
    
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    
    return femaleVoice || englishVoice || voices[0] || null;
  }, []);

  const speakParagraph = useCallback((index: number) => {
    if (isStoppedRef.current || !isActiveRef.current) {
      return;
    }
    
    if (index >= paragraphsRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
      setCurrentWordIndex(-1);
      isActiveRef.current = false;
      return;
    }

    const text = paragraphsRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (preferFemaleVoice) {
      const voice = getFemaleVoice();
      if (voice) utterance.voice = voice;
    }

    setCurrentParagraphIndex(index);
    setCurrentWordIndex(0);

    utterance.onboundary = (event) => {
      if (event.name === 'word' && !isStoppedRef.current) {
        const words = text.substring(0, event.charIndex).split(/\s+/);
        setCurrentWordIndex(words.length - 1);
      }
    };

    utterance.onend = () => {
      if (!isStoppedRef.current && isActiveRef.current) {
        speakParagraph(index + 1);
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.error('Speech error:', event.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, preferFemaleVoice, getFemaleVoice]);

  const speak = useCallback((paragraphs: string[]) => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    paragraphsRef.current = paragraphs;
    isStoppedRef.current = false;
    isActiveRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      const handleVoicesChanged = () => {
        if (isActiveRef.current && !isStoppedRef.current) {
          speakParagraph(0);
        }
        window.speechSynthesis.onvoiceschanged = null;
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    } else {
      speakParagraph(0);
    }
  }, [isSupported, speakParagraph]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    isStoppedRef.current = true;
    isActiveRef.current = false;
    window.speechSynthesis.cancel();
    window.speechSynthesis.onvoiceschanged = null;
    paragraphsRef.current = [];
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
    setCurrentWordIndex(-1);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      isActiveRef.current = false;
      window.speechSynthesis?.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentParagraphIndex,
    currentWordIndex,
    speak,
    pause,
    resume,
    stop,
    isSupported,
  };
}
