import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shuffle, Volume2, VolumeX } from "lucide-react";
import type { PuzzleGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import CongratulationsScreen from "./CongratulationsScreen";

interface PuzzleGameProps {
  config: PuzzleGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

interface PuzzlePiece {
  id: number;
  currentPos: number;
  correctPos: number;
}

export default function PuzzleGame({ 
  config, 
  onComplete,
  onBack,
  onTimeUpdate,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: PuzzleGameProps) {
  const gridSize = config.gridSize || 3;
  const totalPieces = gridSize * gridSize;
  
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showingComplete, setShowingComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(480);
  
  const { playSound, setBackgroundMusicMuted } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);

  const initializePuzzle = useCallback(() => {
    const initialPieces: PuzzlePiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      initialPieces.push({ id: i, currentPos: i, correctPos: i });
    }
    
    for (let i = initialPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempPos = initialPieces[i].currentPos;
      initialPieces[i].currentPos = initialPieces[j].currentPos;
      initialPieces[j].currentPos = tempPos;
    }
    
    setPieces(initialPieces);
    setMoves(0);
    setIsComplete(false);
    setShowingComplete(false);
    setSelectedPiece(null);
    setGameTime(0);
  }, [totalPieces]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

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

  useEffect(() => {
    if (isComplete) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev + 1;
        onTimeUpdate?.(1);
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isComplete, onTimeUpdate]);

  useEffect(() => {
    if (pieces.length === 0) return;
    
    const isSolved = pieces.every(piece => piece.currentPos === piece.correctPos);
    if (isSolved && !isComplete && !showingComplete) {
      setShowingComplete(true);
      playSound('correct');
      const baseScore = 100;
      const movesPenalty = Math.max(0, moves - totalPieces) * 3;
      const timePenalty = Math.floor(gameTime / 15) * 2;
      const calculatedScore = Math.max(10, Math.min(100, baseScore - movesPenalty - timePenalty));
      setFinalScore(calculatedScore);
      
      setTimeout(() => {
        setIsComplete(true);
        onComplete(calculatedScore);
      }, 3000);
    }
  }, [pieces, isComplete, showingComplete, moves, gameTime, totalPieces, onComplete, playSound]);

  const handlePieceClick = (pieceId: number) => {
    if (isComplete || showingComplete) return;
    
    playSound('click');
    
    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      playSound('move');
      setPieces(prev => {
        const newPieces = [...prev];
        const piece1 = newPieces.find(p => p.id === selectedPiece)!;
        const piece2 = newPieces.find(p => p.id === pieceId)!;
        const tempPos = piece1.currentPos;
        piece1.currentPos = piece2.currentPos;
        piece2.currentPos = tempPos;
        return newPieces;
      });
      setMoves(prev => prev + 1);
      setSelectedPiece(null);
    }
  };

  const pieceSize = 100 / gridSize;

  if (isComplete) {
    return (
      <CongratulationsScreen
        score={finalScore}
        maxScore={100}
        stats={[
          { label: "Moves", value: moves },
          { label: "Time", value: `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}` },
          { label: "Grid Size", value: `${gridSize}x${gridSize}` },
          { label: "Pieces", value: totalPieces },
        ]}
        winMessage={config.winMessage || "Puzzle Complete!"}
        onPlayAgain={initializePuzzle}
        onBack={onBack}
        soundEffectsEnabled={soundEffectsEnabled}
        pointsReward={pointsReward}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center gap-8 text-lg font-heading">
        <span>Moves: <strong>{moves}</strong></span>
        <span>Time: <strong>{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</strong></span>
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

      {config.hintText && (
        <p className="text-muted-foreground text-sm text-center max-w-md">{config.hintText}</p>
      )}

      <div 
        ref={containerRef}
        className="relative bg-muted rounded-xl overflow-hidden shadow-lg"
        style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
      >
        <img 
          src={config.imageUrl} 
          alt="Puzzle" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showingComplete ? 'opacity-100' : 'opacity-20'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!showingComplete && imageLoaded && pieces.map(piece => {
          const currentRow = Math.floor(piece.currentPos / gridSize);
          const currentCol = piece.currentPos % gridSize;
          const correctRow = Math.floor(piece.correctPos / gridSize);
          const correctCol = piece.correctPos % gridSize;
          
          return (
            <motion.div
              key={piece.id}
              layout
              onClick={() => handlePieceClick(piece.id)}
              className={`absolute cursor-pointer border-2 transition-all ${
                selectedPiece === piece.id 
                  ? 'border-primary ring-4 ring-primary/50 z-10' 
                  : 'border-white/40 hover:border-primary/50'
              } ${piece.currentPos === piece.correctPos ? 'border-green-400' : ''}`}
              style={{
                width: `${pieceSize}%`,
                height: `${pieceSize}%`,
                left: `${currentCol * pieceSize}%`,
                top: `${currentRow * pieceSize}%`,
                backgroundImage: `url(${config.imageUrl})`,
                backgroundSize: `${gridSize * 100}%`,
                backgroundPosition: `${-correctCol * 100}% ${-correctRow * 100}%`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            />
          );
        })}

        {showingComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <h3 className="font-heading text-2xl font-bold text-primary mb-2">
                Puzzle Complete!
              </h3>
              <p className="text-muted-foreground">
                Great job! Loading results...
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>

      {!showingComplete && (
        <Button onClick={() => { playSound('click'); initializePuzzle(); }} variant="outline" size="lg">
          <Shuffle className="w-5 h-5 mr-2" /> Shuffle
        </Button>
      )}
    </div>
  );
}
