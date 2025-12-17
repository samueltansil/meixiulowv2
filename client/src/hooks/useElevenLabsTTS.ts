import { useState, useCallback, useRef, useEffect } from 'react';

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface ParagraphAudio {
  audioUrl: string;
  words: WordTiming[];
  duration: number;
  hasWordTiming: boolean;
}

interface UseElevenLabsTTSReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  loadingProgress: number;
  currentParagraphIndex: number;
  currentWordIndex: number;
  progress: number;
  speak: (paragraphs: string[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  error: string | null;
  getCurrentWords: () => WordTiming[];
}

export function useElevenLabsTTS(): UseElevenLabsTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudio = useRef<(ParagraphAudio | null)[]>([]);
  const paragraphsRef = useRef<string[]>([]);
  const isStoppedRef = useRef(false);
  const isActiveRef = useRef(false);
  const wordUpdateIntervalRef = useRef<number | null>(null);

  const generateSpeech = useCallback(async (text: string, retries = 3): Promise<ParagraphAudio | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('TTS API error:', response.status, errorText);
          if (attempt < retries - 1) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error('Failed to generate speech');
        }

        const data = await response.json();
        
        if (!data.audio) {
          console.error('TTS returned no audio data');
          if (attempt < retries - 1) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          return null;
        }
        
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return {
          audioUrl,
          words: data.words || [],
          duration: data.duration || 0,
          hasWordTiming: data.hasWordTiming ?? (data.words && data.words.length > 0)
        };
      } catch (err) {
        console.error(`Error generating speech (attempt ${attempt + 1}):`, err);
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
    return null;
  }, []);

  const preloadAllAudio = useCallback(async (paragraphs: string[]): Promise<(ParagraphAudio | null)[]> => {
    const results: (ParagraphAudio | null)[] = new Array(paragraphs.length).fill(null);
    let completed = 0;
    const maxConcurrent = 2;
    
    for (let i = 0; i < paragraphs.length; i += maxConcurrent) {
      if (isStoppedRef.current) break;
      
      const batch = paragraphs.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(async (text, batchIndex) => {
        const actualIndex = i + batchIndex;
        const audio = await generateSpeech(text);
        completed++;
        setLoadingProgress(Math.round((completed / paragraphs.length) * 100));
        return { index: actualIndex, audio };
      });

      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        results[result.index] = result.audio;
      }
    }
    
    return results;
  }, [generateSpeech]);

  const updateCurrentWord = useCallback((audio: HTMLAudioElement, words: WordTiming[]) => {
    const currentTime = audio.currentTime;
    let wordIdx = -1;
    
    for (let i = 0; i < words.length; i++) {
      if (currentTime >= words[i].start && currentTime <= words[i].end) {
        wordIdx = i;
        break;
      }
      if (currentTime > words[i].end && (i === words.length - 1 || currentTime < words[i + 1].start)) {
        wordIdx = i;
        break;
      }
    }
    
    setCurrentWordIndex(wordIdx);
  }, []);

  const playParagraph = useCallback((index: number) => {
    if (isStoppedRef.current || !isActiveRef.current) {
      return;
    }

    if (wordUpdateIntervalRef.current) {
      clearInterval(wordUpdateIntervalRef.current);
      wordUpdateIntervalRef.current = null;
    }

    if (index >= paragraphsRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
      setCurrentWordIndex(-1);
      setProgress(0);
      isActiveRef.current = false;
      return;
    }

    setCurrentParagraphIndex(index);
    setCurrentWordIndex(-1);
    setError(null);

    const paragraphAudio = preloadedAudio.current[index];
    
    if (!paragraphAudio || !paragraphAudio.audioUrl) {
      console.error(`No audio available for paragraph ${index}, regenerating...`);
      generateSpeech(paragraphsRef.current[index]).then((newAudio) => {
        if (newAudio && !isStoppedRef.current && isActiveRef.current) {
          preloadedAudio.current[index] = newAudio;
          playParagraph(index);
        } else if (!isStoppedRef.current && isActiveRef.current) {
          setError(`Could not generate audio for paragraph ${index + 1}`);
          setTimeout(() => {
            if (!isStoppedRef.current && isActiveRef.current) {
              playParagraph(index + 1);
            }
          }, 500);
        }
      });
      return;
    }

    const audio = new Audio(paragraphAudio.audioUrl);
    audioRef.current = audio;

    wordUpdateIntervalRef.current = window.setInterval(() => {
      if (audio && !audio.paused && paragraphAudio.words.length > 0) {
        updateCurrentWord(audio, paragraphAudio.words);
      }
    }, 50);

    audio.onended = () => {
      if (wordUpdateIntervalRef.current) {
        clearInterval(wordUpdateIntervalRef.current);
        wordUpdateIntervalRef.current = null;
      }
      setCurrentWordIndex(-1);
      if (!isStoppedRef.current && isActiveRef.current) {
        // Add a natural pause between paragraphs (700ms)
        setTimeout(() => {
          if (!isStoppedRef.current && isActiveRef.current) {
            playParagraph(index + 1);
          }
        }, 700);
      }
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const paragraphProgress = (audio.currentTime / audio.duration) * 100;
        const overallProgress = ((index + paragraphProgress / 100) / paragraphsRef.current.length) * 100;
        setProgress(overallProgress);
      }
    };

    audio.onerror = (e) => {
      const errorDetails = audio.error ? {
        code: audio.error.code,
        message: audio.error.message
      } : 'unknown';
      console.error('Audio element error:', errorDetails, e);
      
      if (wordUpdateIntervalRef.current) {
        clearInterval(wordUpdateIntervalRef.current);
        wordUpdateIntervalRef.current = null;
      }
      
      if (!isStoppedRef.current && isActiveRef.current) {
        preloadedAudio.current[index] = null;
        playParagraph(index);
      }
    };

    const attemptPlay = async () => {
      try {
        await audio.play();
      } catch (err: unknown) {
        const error = err as Error & { name?: string };
        console.error('Error playing audio:', {
          name: error.name,
          message: error.message,
          audioError: audio.error?.message
        });
        
        if (error.name === 'NotAllowedError') {
          setError('Please click the Read Aloud button to start audio playback');
        } else if (error.name === 'NotSupportedError') {
          setError('Audio format not supported');
        } else {
          setError(`Playback failed: ${error.message}`);
        }
        
        if (wordUpdateIntervalRef.current) {
          clearInterval(wordUpdateIntervalRef.current);
          wordUpdateIntervalRef.current = null;
        }
        
        if (!isStoppedRef.current && isActiveRef.current) {
          setTimeout(() => {
            if (!isStoppedRef.current && isActiveRef.current) {
              playParagraph(index + 1);
            }
          }, 500);
        }
      }
    };

    attemptPlay();
  }, [generateSpeech, updateCurrentWord]);

  const speak = useCallback(async (paragraphs: string[]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (wordUpdateIntervalRef.current) {
      clearInterval(wordUpdateIntervalRef.current);
      wordUpdateIntervalRef.current = null;
    }

    for (const audio of preloadedAudio.current) {
      if (audio?.audioUrl) URL.revokeObjectURL(audio.audioUrl);
    }
    preloadedAudio.current = [];

    paragraphsRef.current = paragraphs;
    isStoppedRef.current = false;
    isActiveRef.current = true;
    setIsLoading(true);
    setLoadingProgress(0);
    setProgress(0);
    setError(null);
    setCurrentParagraphIndex(-1);
    setCurrentWordIndex(-1);
    
    const audioData = await preloadAllAudio(paragraphs);
    
    if (isStoppedRef.current || !isActiveRef.current) {
      for (const audio of audioData) {
        if (audio?.audioUrl) URL.revokeObjectURL(audio.audioUrl);
      }
      return;
    }
    
    preloadedAudio.current = audioData;
    setIsLoading(false);
    setIsPlaying(true);
    setIsPaused(false);
    
    playParagraph(0);
  }, [preloadAllAudio, playParagraph]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    isStoppedRef.current = true;
    isActiveRef.current = false;
    
    if (wordUpdateIntervalRef.current) {
      clearInterval(wordUpdateIntervalRef.current);
      wordUpdateIntervalRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    for (const audio of preloadedAudio.current) {
      if (audio?.audioUrl) URL.revokeObjectURL(audio.audioUrl);
    }
    preloadedAudio.current = [];
    
    paragraphsRef.current = [];
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setLoadingProgress(0);
    setCurrentParagraphIndex(-1);
    setCurrentWordIndex(-1);
    setProgress(0);
  }, []);

  const getCurrentWords = useCallback((): WordTiming[] => {
    if (currentParagraphIndex >= 0 && currentParagraphIndex < preloadedAudio.current.length) {
      return preloadedAudio.current[currentParagraphIndex]?.words || [];
    }
    return [];
  }, [currentParagraphIndex]);

  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      isActiveRef.current = false;
      if (wordUpdateIntervalRef.current) {
        clearInterval(wordUpdateIntervalRef.current);
        wordUpdateIntervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      for (const audio of preloadedAudio.current) {
        if (audio?.audioUrl) URL.revokeObjectURL(audio.audioUrl);
      }
      preloadedAudio.current = [];
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    isLoading,
    loadingProgress,
    currentParagraphIndex,
    currentWordIndex,
    progress,
    speak,
    pause,
    resume,
    stop,
    error,
    getCurrentWords,
  };
}
