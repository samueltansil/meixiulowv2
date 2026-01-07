import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX, CheckCircle, XCircle } from "lucide-react";
import type { WhackGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import CongratulationsScreen from "./CongratulationsScreen";

interface WhackAMoleGameProps {
  config: WhackGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

interface Mole {
  id: number;
  position: number;
  isTarget: boolean;
  imageUrl: string;
  label: string;
}

export default function WhackAMoleGame({ 
  config, 
  onComplete,
  onBack,
  onTimeUpdate,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: WhackAMoleGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration || 60);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [markers, setMarkers] = useState<{ id: number; position: number; isHit: boolean }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const moleIdRef = useRef(0);
  const markerIdRef = useRef(0);
  const playTimeRef = useRef(0);
  const [containerSize, setContainerSize] = useState(480);
  
  const { playSound, startBackgroundMusic, setBackgroundMusicMuted } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);

  const isImageUrl = (str?: string) => {
    if (!str) return false;
    return str.startsWith("http") || str.startsWith("/") || str.startsWith("data:") || str.includes(".");
  };

  const GRID_SIZE = 9;
  const MOLE_DURATION = 2200;
  const SPAWN_INTERVAL = 1400;

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setContainerSize(Math.min(screenWidth - 48, 400));
      } else {
        setContainerSize(480);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const startGame = () => {
    playSound('click');
    startBackgroundMusic();
    setGameStarted(true);
    setTimeLeft(config.duration || 60);
    setScore(0);
    setHits(0);
    setMisses(0);
    setMoles([]);
    setIsComplete(false);
    playTimeRef.current = 0;
  };

  const spawnMole = useCallback(() => {
    const isTarget = Math.random() > 0.35;
    const position = Math.floor(Math.random() * GRID_SIZE);
    
    const newMole: Mole = {
      id: moleIdRef.current++,
      position,
      isTarget,
      imageUrl: isTarget 
        ? config.targetImage 
        : config.distractorImages[Math.floor(Math.random() * config.distractorImages.length)] || config.targetImage,
      label: isTarget
        ? config.targetLabel
        : config.distractorLabels?.[Math.floor(Math.random() * (config.distractorLabels?.length || 1))] || "Wrong!"
    };

    setMoles(prev => [...prev.filter(m => m.position !== position), newMole]);

    setTimeout(() => {
      setMoles(prev => prev.filter(m => m.id !== newMole.id));
    }, MOLE_DURATION);
  }, [config]);

  useEffect(() => {
    if (!gameStarted || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsComplete(true);
          const calculatedScore = Math.min(100, Math.max(0, Math.round((hits / Math.max(1, hits + misses)) * 100)));
          setFinalScore(calculatedScore);
          onComplete(calculatedScore);
          return 0;
        }
        return prev - 1;
      });
      playTimeRef.current += 1;
      onTimeUpdate?.(1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isComplete, hits, misses, onComplete, onTimeUpdate]);

  useEffect(() => {
    if (!gameStarted || isComplete) return;

    const spawner = setInterval(spawnMole, SPAWN_INTERVAL);
    return () => clearInterval(spawner);
  }, [gameStarted, isComplete, spawnMole]);

  const handleMoleClick = (mole: Mole) => {
    if (mole.isTarget) {
      playSound('correct');
      setScore(prev => prev + 10);
      setHits(prev => prev + 1);
    } else {
      playSound('error');
      setScore(prev => Math.max(0, prev - 5));
      setMisses(prev => prev + 1);
    }
    setMoles(prev => prev.filter(m => m.id !== mole.id));
    const marker = { id: markerIdRef.current++, position: mole.position, isHit: mole.isTarget };
    setMarkers(prev => [...prev, marker]);
    setTimeout(() => {
      setMarkers(prev => prev.filter(m => m.id !== marker.id));
    }, 500);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="text-center">
          <h3 className="font-heading text-2xl font-bold mb-4">Tap the {config.targetLabel}!</h3>
          <p className="text-muted-foreground mb-2">
            You have {config.duration || 60} seconds to tap as many as you can.
          </p>
          <p className="text-sm text-muted-foreground">
            Avoid tapping the wrong ones - you'll lose points!
          </p>
        </div>
        
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              {isImageUrl(config.targetImage) ? (
                <img src={config.targetImage} alt={config.targetLabel} className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-5xl">{config.targetImage || "🎯"}</span>
              )}
            </div>
            <span className="text-green-600 font-medium">Tap me! +10</span>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              {isImageUrl(config.distractorImages?.[0]) ? (
                <img src={config.distractorImages?.[0] || ""} alt="Avoid" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-5xl">{config.distractorImages?.[0] || "❌"}</span>
              )}
            </div>
            <span className="text-red-500 font-medium">Avoid! -5</span>
          </div>
        </div>

        <Button onClick={startGame} size="lg" className="gap-2 text-lg px-8 py-6">
          <Play className="w-6 h-6" /> Start Game
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <CongratulationsScreen
        score={finalScore}
        maxScore={100}
        stats={[
          { label: "Hits", value: hits },
          { label: "Misses", value: misses },
          { label: "Accuracy", value: `${Math.round((hits / Math.max(1, hits + misses)) * 100)}%` },
          { label: "Time", value: `${config.duration || 60}s` },
        ]}
        winMessage={config.winMessage || "Great reflexes!"}
        onPlayAgain={startGame}
        onBack={onBack}
        soundEffectsEnabled={soundEffectsEnabled}
        pointsReward={pointsReward}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 text-lg font-heading">
        <span>Score: <strong className="text-primary">{score}</strong></span>
        <span className={`${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          Time: <strong>{timeLeft}s</strong>
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setBackgroundMusicMuted(!isMuted);
            setIsMuted(!isMuted);
          }}
          className="ml-2 w-12 h-12"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      <div 
        className="relative grid grid-cols-3 gap-3 p-4 rounded-2xl shadow-lg"
        style={{ 
          width: `${containerSize}px`, 
          height: `${containerSize}px`,
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundColor: config.backgroundImage ? undefined : '#d4edda'
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, index) => {
          const mole = moles.find(m => m.position === index);
          const cellSize = (containerSize - 32 - 24) / 3;
          
          return (
            <div
              key={index}
              className="relative bg-amber-800/40 rounded-full flex items-center justify-center overflow-hidden"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            >
              <div className="w-3/4 h-1/2 bg-amber-900/60 rounded-full absolute bottom-2" />
              
              <AnimatePresence>
                {mole && (
                  <motion.button
                    key={mole.id}
                    initial={{ y: cellSize * 0.5, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: cellSize * 0.5, opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => handleMoleClick(mole)}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  >
                    {mole.imageUrl && (mole.imageUrl.startsWith('http') || mole.imageUrl.startsWith('/')) ? (
                      <img 
                        src={mole.imageUrl} 
                        alt={mole.label}
                        className={`w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg ${mole.isTarget ? '' : 'grayscale'}`}
                      />
                    ) : (
                      <span className={`text-5xl md:text-6xl drop-shadow-lg ${mole.isTarget ? '' : 'grayscale'}`}>
                        {mole.imageUrl || (mole.isTarget ? '🎯' : '❌')}
                      </span>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {markers.filter(m => m.position === index).map((m) => (
                  <motion.div
                    key={`marker-${m.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    {m.isHit ? (
                      <CheckCircle className="w-12 h-12 text-green-500 drop-shadow-lg" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-500 drop-shadow-lg" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">Tap the {config.targetLabel}!</p>
    </div>
  );
}
