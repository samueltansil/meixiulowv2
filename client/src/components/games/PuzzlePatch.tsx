import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, Puzzle } from "lucide-react";
import type { PuzzleGameConfig } from "@shared/schema";

interface PuzzlePatchProps {
  config: PuzzleGameConfig;
  onComplete?: (points: number) => void;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
}

export function PuzzlePatch({ config, onComplete }: PuzzlePatchProps) {
  const gridSize = config.gridSize || 3;
  const totalPieces = gridSize * gridSize;
  
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const initializePuzzle = useCallback(() => {
    const initialPieces: PuzzlePiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      initialPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
      });
    }
    
    const shuffled = [...initialPieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempPos = shuffled[i].currentPosition;
      shuffled[i].currentPosition = shuffled[j].currentPosition;
      shuffled[j].currentPosition = tempPos;
    }
    
    setPieces(shuffled);
    setMoves(0);
    setIsComplete(false);
    setSelectedPiece(null);
    setStartTime(Date.now());
  }, [totalPieces]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const checkCompletion = useCallback((currentPieces: PuzzlePiece[]) => {
    const allCorrect = currentPieces.every(p => p.currentPosition === p.correctPosition);
    if (allCorrect && !isComplete) {
      setIsComplete(true);
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const basePoints = 100;
      const moveBonus = Math.max(0, 50 - moves);
      const timeBonus = Math.max(0, 100 - elapsedSeconds);
      const totalPoints = basePoints + moveBonus + timeBonus;
      onComplete?.(totalPoints);
    }
  }, [isComplete, startTime, moves, onComplete]);

  const handlePieceClick = (pieceId: number) => {
    if (isComplete) return;
    
    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else {
      const newPieces = [...pieces];
      const piece1 = newPieces.find(p => p.id === selectedPiece)!;
      const piece2 = newPieces.find(p => p.id === pieceId)!;
      
      const tempPos = piece1.currentPosition;
      piece1.currentPosition = piece2.currentPosition;
      piece2.currentPosition = tempPos;
      
      setPieces(newPieces);
      setMoves(m => m + 1);
      setSelectedPiece(null);
      checkCompletion(newPieces);
    }
  };

  const getPieceStyle = (piece: PuzzlePiece) => {
    const pieceWidth = 100 / gridSize;
    const row = Math.floor(piece.correctPosition / gridSize);
    const col = piece.correctPosition % gridSize;
    
    return {
      backgroundImage: `url(${config.imageUrl})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `${col * (100 / (gridSize - 1))}% ${row * (100 / (gridSize - 1))}%`,
      width: `${pieceWidth}%`,
      aspectRatio: "1",
    };
  };

  const sortedByPosition = [...pieces].sort((a, b) => a.currentPosition - b.currentPosition);

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="game-puzzle-patch">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 font-fredoka text-purple-600">
          <Puzzle className="w-6 h-6" />
          Puzzle Patch
        </CardTitle>
        {config.hintText && (
          <p className="text-sm text-gray-500 font-quicksand">{config.hintText}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <span>Moves: {moves}</span>
          <span>Grid: {gridSize}x{gridSize}</span>
        </div>
        
        <div 
          className="grid gap-1 bg-purple-100 p-2 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {sortedByPosition.map((piece) => (
            <motion.div
              key={piece.id}
              data-testid={`puzzle-piece-${piece.id}`}
              className={`cursor-pointer rounded overflow-hidden border-2 transition-all ${
                selectedPiece === piece.id 
                  ? "border-purple-500 ring-2 ring-purple-300" 
                  : piece.currentPosition === piece.correctPosition
                  ? "border-green-400"
                  : "border-white"
              }`}
              style={getPieceStyle(piece)}
              onClick={() => handlePieceClick(piece.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            />
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
              {config.winMessage || "Great job! You solved the puzzle!"}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed in {moves} moves!</p>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={initializePuzzle}
            data-testid="button-reset-puzzle"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
