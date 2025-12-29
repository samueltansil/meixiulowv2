import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import type { MatchGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import CongratulationsScreen from "./CongratulationsScreen";

interface MemoryMatchGameProps {
  config: MatchGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

interface Card {
  id: string;
  pairId: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'front' | 'back';
}

export default function MemoryMatchGame({ 
  config, 
  onComplete,
  onBack,
  onTimeUpdate,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [containerSize, setContainerSize] = useState(520);

  const { playSound, setBackgroundMusicMuted } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setContainerSize(Math.min(screenWidth - 32, 400));
      } else {
        setContainerSize(520);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const initializeGame = useCallback(() => {
    const newCards: Card[] = [];
    
    config.pairs.forEach(pair => {
      newCards.push({
        id: `${pair.id}-front`,
        pairId: pair.id,
        content: pair.front,
        isFlipped: false,
        isMatched: false,
        type: 'front'
      });
      newCards.push({
        id: `${pair.id}-back`,
        pairId: pair.id,
        content: pair.back,
        isFlipped: false,
        isMatched: false,
        type: 'back'
      });
    });

    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
    setGameTime(0);
  }, [config.pairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (isComplete) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => {
        onTimeUpdate?.(1);
        return prev + 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isComplete, onTimeUpdate]);

  useEffect(() => {
    if (matches === config.pairs.length && matches > 0) {
      setIsComplete(true);
      const baseScore = 100;
      const movesPenalty = Math.max(0, moves - config.pairs.length * 2) * 5;
      const timePenalty = Math.floor(gameTime / 20) * 2;
      const calculatedScore = Math.max(10, Math.min(100, baseScore - movesPenalty - timePenalty));
      setFinalScore(calculatedScore);
      onComplete(calculatedScore);
    }
  }, [matches, config.pairs.length, moves, gameTime, onComplete]);

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    playSound('click');
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        playSound('correct');
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        playSound('error');
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const isImageUrl = (content: string) => {
    return content.startsWith('http') || content.startsWith('/') || content.startsWith('data:');
  };

  const gridCols = Math.ceil(Math.sqrt(cards.length));
  const cardSize = Math.floor((containerSize - (gridCols + 1) * 12) / gridCols);

  if (isComplete) {
    return (
      <CongratulationsScreen
        score={finalScore}
        maxScore={100}
        stats={[
          { label: "Matches", value: `${matches}/${config.pairs.length}` },
          { label: "Moves", value: moves },
          { label: "Time", value: `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}` },
          { label: "Efficiency", value: `${Math.round((config.pairs.length * 2 / moves) * 100)}%` },
        ]}
        winMessage={config.winMessage || "All Matched!"}
        onPlayAgain={initializeGame}
        onBack={onBack}
        soundEffectsEnabled={soundEffectsEnabled}
        pointsReward={pointsReward}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-6 p-4">
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setBackgroundMusicMuted(!isMuted);
            setIsMuted(!isMuted);
          }}
          className="w-12 h-12"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>
      <div className="flex items-center gap-6 md:gap-8 text-base md:text-lg font-heading flex-wrap justify-center">
        <span>Matches: <strong className="text-primary">{matches}/{config.pairs.length}</strong></span>
        <span>Moves: <strong>{moves}</strong></span>
        <span>Time: <strong>{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</strong></span>
      </div>

      <div 
        className="grid gap-3 p-3"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, ${cardSize}px)`,
          width: 'fit-content'
        }}
      >
        {cards.map((card, index) => {
          const cardColors = [
            'from-pink-400 to-rose-500',
            'from-purple-400 to-indigo-500', 
            'from-blue-400 to-cyan-500',
            'from-emerald-400 to-teal-500',
            'from-yellow-400 to-orange-500',
            'from-red-400 to-pink-500',
          ];
          const colorIndex = index % cardColors.length;
          
          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`relative rounded-2xl transition-all duration-300 shadow-lg ${
                card.isMatched 
                  ? 'bg-gradient-to-br from-green-300 to-emerald-400 border-4 border-green-500 shadow-green-200' 
                  : card.isFlipped 
                    ? 'bg-gradient-to-br from-white to-slate-100 border-4 border-primary shadow-primary/30' 
                    : `bg-gradient-to-br ${cardColors[colorIndex]} border-4 border-white/50 hover:scale-105 hover:shadow-xl cursor-pointer`
              }`}
              style={{ width: `${cardSize}px`, height: `${cardSize}px` }}
              initial={{ rotateY: 0 }}
              animate={{ 
                rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                scale: card.isMatched ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                rotateY: { duration: 0.4 },
                scale: { duration: 0.5, times: [0, 0.5, 1] }
              }}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.08, rotate: 2 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            >
              {(card.isFlipped || card.isMatched) ? (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  {isImageUrl(card.content) ? (
                    <img 
                      src={card.content} 
                      alt="" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-sm md:text-base font-bold text-center leading-tight text-slate-700">
                      {card.content}
                    </span>
                  )}
                  {card.isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span 
                    className="text-3xl md:text-4xl drop-shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: index * 0.1 }}
                  >
                    ✨
                  </motion.span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
