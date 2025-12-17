import { useEffect, useRef, useCallback } from 'react';

interface GameAudioOptions {
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
}

const SOUND_EFFECTS: Record<string, string> = {
  click: 'https://cdn.freesound.org/previews/588/588263_12517458-lq.mp3',
  success: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  error: 'https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3',
  move: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
  match: 'https://cdn.freesound.org/previews/270/270304_5123851-lq.mp3',
  complete: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
  fanfare: 'https://cdn.freesound.org/previews/320/320775_1661766-lq.mp3',
  correct: 'https://cdn.freesound.org/previews/220/220206_1015240-lq.mp3',
};

export type SoundEffectType = keyof typeof SOUND_EFFECTS;

const audioCache = new Map<string, HTMLAudioElement>();

function getOrCreateAudio(url: string): HTMLAudioElement {
  let audio = audioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audioCache.set(url, audio);
  }
  return audio;
}

export function useGameAudio(options: GameAudioOptions = {}) {
  const { backgroundMusicUrl, soundEffectsEnabled = true } = options;
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const musicStartedRef = useRef(false);

  // Start background music - call this after user interaction (e.g., Start Game button)
  const startBackgroundMusic = useCallback(() => {
    if (!backgroundMusicUrl || musicStartedRef.current) return;
    
    const audio = getOrCreateAudio(backgroundMusicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    backgroundMusicRef.current = audio;
    musicStartedRef.current = true;
    audio.play().catch(() => {});
  }, [backgroundMusicUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
        backgroundMusicRef.current = null;
      }
      musicStartedRef.current = false;
    };
  }, [backgroundMusicUrl]);

  const playSound = useCallback((type: SoundEffectType) => {
    if (!soundEffectsEnabled) return;

    const soundUrl = SOUND_EFFECTS[type];
    if (!soundUrl) return;

    const audio = getOrCreateAudio(soundUrl);
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [soundEffectsEnabled]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
    musicStartedRef.current = false;
  }, []);

  const resumeBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(() => {});
    }
  }, []);

  return {
    playSound,
    startBackgroundMusic,
    stopBackgroundMusic,
    resumeBackgroundMusic,
  };
}
