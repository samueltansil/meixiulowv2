import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, Brain } from "lucide-react";
import type { MatchGameConfig } from "@shared/schema";

interface FactMatchProps {
  config: MatchGameConfig;
  onComplete?: (points: number) => void;
}

interface MatchCard {
  id: string;
  pairId: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: "front" | "back";
}

export function FactMatch({ config, onComplete }: FactMatchProps) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  const initializeGame = useCallback(() => {
    const gameCards: MatchCard[] = [];
    
    config.pairs.forEach((pair) => {
      gameCards.push({
        id: `${pair.id}-front`,
        pairId: pair.id,
        content: pair.front,
        isFlipped: false,
        isMatched: false,
        type: "front",
      });
      gameCards.push({
        id: `${pair.id}-back`,
        pairId: pair.id,
        content: pair.back,
        isFlipped: false,
        isMatched: false,
        type: "back",
      });
    });
    
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
  }, [config.pairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (cardId: string) => {
    if (isChecking || isComplete) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    if (flippedCards.length >= 2) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(m => m + 1);
      
      const [first, second] = newFlipped;
      const firstCard = newCards.find(c => c.id === first)!;
      const secondCard = newCards.find(c => c.id === second)!;

      setTimeout(() => {
        if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
          const matchedCards = newCards.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c
          );
          setCards(matchedCards);
          const newMatches = matches + 1;
          setMatches(newMatches);
          
          if (newMatches === config.pairs.length) {
            setIsComplete(true);
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const basePoints = 100;
            const moveBonus = Math.max(0, config.pairs.length * 10 - moves * 2);
            const timeBonus = Math.max(0, 100 - elapsedSeconds);
            onComplete?.(basePoints + moveBonus + timeBonus);
          }
        } else {
          const resetCards = newCards.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          );
          setCards(resetCards);
        }
        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  const isImageUrl = (str: string) => {
    return str.startsWith("http") || str.startsWith("/") || str.startsWith("data:");
  };

  return (
    <Card className="w-full max-w-lg mx-auto" data-testid="game-fact-match">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 font-fredoka text-blue-600">
          <Brain className="w-6 h-6" />
          Fact Match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <span>Matches: {matches}/{config.pairs.length}</span>
          <span>Moves: {moves}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              data-testid={`match-card-${card.id}`}
              className={`aspect-square cursor-pointer rounded-lg overflow-hidden ${
                card.isMatched ? "pointer-events-none" : ""
              }`}
              onClick={() => handleCardClick(card.id)}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            >
              <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div 
                  className="absolute w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-lg shadow-md"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-3xl">❓</span>
                </div>
                <div 
                  className={`absolute w-full h-full flex items-center justify-center rounded-lg shadow-md p-1 ${
                    card.isMatched 
                      ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400" 
                      : "bg-white border-2 border-blue-200"
                  }`}
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)" 
                  }}
                >
                  {isImageUrl(card.content) ? (
                    <img 
                      src={card.content} 
                      alt="" 
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs font-quicksand text-center font-medium text-gray-700 leading-tight">
                      {card.content}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-green-100 rounded-lg text-center"
          >
            <Trophy className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
            <p className="font-fredoka text-lg text-green-600">
              {config.winMessage || "Amazing! You matched all the facts!"}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed in {moves} moves!</p>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={initializeGame}
            data-testid="button-reset-match"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
