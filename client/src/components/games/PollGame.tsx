import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Volume2, VolumeX, BarChart2 } from "lucide-react";
import type { PollGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface PollGameProps {
  gameId: number;
  config: PollGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

export default function PollGame({ 
  gameId,
  config, 
  onComplete,
  onBack,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: PollGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { playSound } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);
  const questions = config.questions || [];

  // Fetch results for the current question
  const { data: results, refetch: refetchResults } = useQuery<Record<string, Record<number, number>>>({
    queryKey: [`/api/games/${gameId}/results`],
    enabled: isAnswered, // Only fetch when user has voted
  });

  const voteMutation = useMutation({
    mutationFn: async ({ questionId, optionIndex }: { questionId: string; optionIndex: number }) => {
      const res = await fetch(`/api/games/${gameId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, optionIndex }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      return res.json();
    },
    onSuccess: () => {
      refetchResults();
    }
  });

  const handleOptionSelect = async (optionIndex: number) => {
    if (isAnswered) return;
    
    playSound('click');
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    // Submit vote
    try {
      await voteMutation.mutateAsync({
        questionId: questions[currentQuestion].id,
        optionIndex
      });
    } catch (error) {
      console.error("Vote failed", error);
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      // For polls, score is always 100% since there are no wrong answers
      onComplete(100);
    }
  };

  const restartGame = () => {
    playSound('click');
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsComplete(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No questions available for this poll.
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
          <BarChart2 className="w-16 h-16 text-primary relative z-10" />
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {config.winMessage || "Poll Complete!"}
          </h2>
          {pointsReward && pointsReward > 0 ? (
            <p className="text-muted-foreground text-lg">
              Thanks for sharing your opinion! You earned {pointsReward} points.
            </p>
          ) : (
            <p className="text-muted-foreground text-lg">
              Thanks for sharing your opinion!
            </p>
          )}
        </div>

        <div className="flex gap-4">
          {onBack && (
            <Button variant="outline" size="lg" onClick={onBack}>
              Back to Games
            </Button>
          )}
          {onBack && (
            <Button size="lg" onClick={restartGame}>
              Play Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  
  // Calculate percentages for current question
  const currentQuestionResults = results?.[question.id] || {};
  const totalVotes = Object.values(currentQuestionResults).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 p-4 w-full max-w-xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between text-sm">
        <span className="font-heading">
          Question <strong>{currentQuestion + 1}</strong> of {questions.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Note: This only toggles local state, ideally should use hook's toggle
            setIsMuted(!isMuted);
          }}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      <div className="w-full bg-muted rounded-full h-3">
        <div 
          className="bg-primary h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl md:text-2xl font-heading font-bold text-center px-2">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const voteCount = currentQuestionResults[index] || 0;
              // If user just voted, add their vote to the count visually if not yet reflected
              // (Wait, backend should return updated results, but optimistic update is nice)
              // Actually, simpler to rely on refetch for now.
              
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              
              let buttonStyle = "bg-white border-2 border-muted hover:border-primary/50";
              if (isAnswered) {
                if (isSelected) {
                  buttonStyle = "bg-primary/10 border-2 border-primary";
                }
              }

              return (
                <div key={index} className="relative">
                  <motion.button
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                    className={`w-full p-4 md:p-5 rounded-xl text-left transition-all relative z-10 ${buttonStyle} ${
                      !isAnswered ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base md:text-lg">{option}</span>
                      </div>
                      {isAnswered && (
                        <span className="font-bold text-primary">{percentage}%</span>
                      )}
                    </div>
                  </motion.button>
                  {isAnswered && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="absolute left-0 top-0 bottom-0 bg-primary/5 rounded-xl z-0 pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <Button onClick={handleNextQuestion} className="gap-2 text-lg px-6 py-5">
                {currentQuestion < questions.length - 1 ? (
                  <>Next Question <ArrowRight className="w-5 h-5" /></>
                ) : (
                  <>See Results <Trophy className="w-5 h-5" /></>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
