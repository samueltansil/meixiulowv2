import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Play, Zap, Timer } from "lucide-react";
import type { WhackGameConfig } from "@shared/schema";

interface WhackAWhizProps {
  config: WhackGameConfig;
  onComplete?: (points: number) => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  image: string;
  label: string;
}

export function WhackAWhiz({ config, onComplete }: WhackAWhizProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const areaRect = gameAreaRef.current.getBoundingClientRect();
    const targetSize = 60;
    const maxX = areaRect.width - targetSize;
    const maxY = areaRect.height - targetSize;
    
    const isTarget = Math.random() > 0.4;
    
    let image: string;
    let label: string;
    
    if (isTarget) {
      image = config.targetImage;
      label = config.targetLabel;
    } else {
      const randomIndex = Math.floor(Math.random() * config.distractorImages.length);
      image = config.distractorImages[randomIndex] || config.targetImage;
      label = config.distractorLabels[randomIndex] || "Wrong!";
    }
    
    const newTarget: Target = {
      id: targetIdRef.current++,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      isTarget,
      image,
      label,
    };
    
    setTargets(prev => [...prev, newTarget]);
    
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 1500);
  }, [config]);

  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState("finished");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    
    const spawnInterval = setInterval(() => {
      spawnTarget();
    }, 800);
    
    return () => clearInterval(spawnInterval);
  }, [gameState, spawnTarget]);

  useEffect(() => {
    if (gameState === "finished") {
      const basePoints = hits * 15;
      const penalty = misses * 5;
      const totalPoints = Math.max(0, basePoints - penalty);
      onComplete?.(totalPoints);
    }
  }, [gameState, hits, misses, onComplete]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(config.duration);
    setTargets([]);
    setHits(0);
    setMisses(0);
    targetIdRef.current = 0;
  };

  const handleTargetClick = (target: Target) => {
    setTargets(prev => prev.filter(t => t.id !== target.id));
    
    if (target.isTarget) {
      setScore(s => s + 10);
      setHits(h => h + 1);
    } else {
      setScore(s => Math.max(0, s - 5));
      setMisses(m => m + 1);
    }
  };

  const isImageUrl = (str: string) => {
    return str.startsWith("http") || str.startsWith("/") || str.startsWith("data:") || str.includes(".");
  };

  return (
    <Card className="w-full max-w-lg mx-auto" data-testid="game-whack-a-whiz">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 font-fredoka text-orange-500">
          <Zap className="w-6 h-6" />
          Whack-a-Whiz
        </CardTitle>
        <p className="text-sm text-gray-500 font-quicksand">
          Tap the {config.targetLabel}! Avoid the wrong answers!
        </p>
      </CardHeader>
      <CardContent>
        {gameState === "idle" && (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
                {isImageUrl(config.targetImage) ? (
                  <img src={config.targetImage} alt={config.targetLabel} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="text-4xl">{config.targetImage}</span>
                )}
              </div>
              <p className="font-quicksand text-gray-600">
                Look for: <span className="font-bold text-orange-600">{config.targetLabel}</span>
              </p>
            </div>
            <Button onClick={startGame} size="lg" className="bg-orange-500 hover:bg-orange-600" data-testid="button-start-whack">
              <Play className="w-5 h-5 mr-2" />
              Start Game ({config.duration}s)
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-lg font-fredoka">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>{score}</span>
              </div>
              <div className={`flex items-center gap-2 text-lg font-fredoka ${timeLeft <= 5 ? "text-red-500 animate-pulse" : ""}`}>
                <Timer className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>
            </div>
            
            <div 
              ref={gameAreaRef}
              className="relative h-64 bg-gradient-to-b from-blue-50 to-green-50 rounded-xl overflow-hidden border-2 border-gray-200"
              style={{
                backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <AnimatePresence>
                {targets.map((target) => (
                  <motion.button
                    key={target.id}
                    data-testid={`whack-target-${target.id}`}
                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer ${
                      target.isTarget 
                        ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg" 
                        : "bg-gradient-to-br from-red-400 to-red-600 shadow-lg"
                    }`}
                    style={{ left: target.x, top: target.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleTargetClick(target)}
                  >
                    {isImageUrl(target.image) ? (
                      <img src={target.image} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-2xl">{target.image}</span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-4 mt-4 text-sm">
              <span className="text-green-600">✓ Hits: {hits}</span>
              <span className="text-red-500">✗ Misses: {misses}</span>
            </div>
          </>
        )}

        {gameState === "finished" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="font-fredoka text-2xl text-orange-600 mb-2">
              Time's Up!
            </h2>
            <p className="text-4xl font-bold text-gray-800 mb-2">{score} points</p>
            <p className="font-quicksand text-gray-600 mb-4">
              {config.winMessage || (score >= 100 ? "Amazing reflexes!" : "Keep practicing!")}
            </p>
            <div className="flex justify-center gap-4 mb-4 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                ✓ {hits} hits
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                ✗ {misses} misses
              </span>
            </div>
            <Button onClick={startGame} className="bg-orange-500 hover:bg-orange-600" data-testid="button-replay-whack">
              Play Again
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
