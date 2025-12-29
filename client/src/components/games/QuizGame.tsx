import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle, XCircle, ArrowRight, Volume2, VolumeX } from "lucide-react";
import type { QuizGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import CongratulationsScreen from "./CongratulationsScreen";

interface QuizGameProps {
  config: QuizGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

export default function QuizGame({ 
  config, 
  onComplete,
  onBack,
  onTimeUpdate,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const { playSound, setBackgroundMusicMuted } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);
  const questions = config.questions || [];
  const passingScore = config.passingScore || Math.ceil(questions.length * 0.6);

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

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    playSound('click');
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    if (answerIndex === questions[currentQuestion].correctIndex) {
      playSound('correct');
      setCorrectAnswers(prev => prev + 1);
    } else {
      playSound('error');
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      const finalCorrect = correctAnswers + (selectedAnswer === questions[currentQuestion].correctIndex ? 1 : 0);
      const scorePercentage = finalCorrect / questions.length;
      const calculatedScore = Math.max(10, Math.min(100, Math.round(scorePercentage * 100)));
      setFinalScore(calculatedScore);
      onComplete(calculatedScore);
    }
  };

  const restartQuiz = () => {
    playSound('click');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setIsComplete(false);
    setGameTime(0);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No questions available for this quiz.
      </div>
    );
  }

  if (isComplete) {
    const finalCorrect = Math.min(questions.length, correctAnswers);
    
    return (
      <CongratulationsScreen
        score={finalScore}
        maxScore={100}
        stats={[
          { label: "Correct", value: `${finalCorrect}/${questions.length}` },
          { label: "Accuracy", value: `${Math.round((finalCorrect / questions.length) * 100)}%` },
          { label: "Time", value: `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}` },
          { label: "To Pass", value: `${passingScore}/${questions.length}` },
        ]}
        winMessage={finalCorrect >= passingScore ? (config.winMessage || "You passed!") : "Keep learning!"}
        onPlayAgain={restartQuiz}
        onBack={onBack}
        soundEffectsEnabled={soundEffectsEnabled}
        pointsReward={pointsReward}
      />
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;

  return (
    <div className="flex flex-col gap-6 p-4 w-full max-w-xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between text-sm">
        <span className="font-heading">
          Question <strong>{currentQuestion + 1}</strong> of {questions.length}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span>
            Score: <strong className="text-primary">{correctAnswers}</strong>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setBackgroundMusicMuted(!isMuted);
              setIsMuted(!isMuted);
            }}
            aria-label={isMuted ? "Unmute background music" : "Mute background music"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </span>
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
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctIndex;
              
              let buttonStyle = "bg-white border-2 border-muted hover:border-primary/50";
              if (isAnswered) {
                if (isCorrectAnswer) {
                  buttonStyle = "bg-green-50 border-2 border-green-500";
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = "bg-red-50 border-2 border-red-500";
                }
              } else if (isSelected) {
                buttonStyle = "bg-primary/10 border-2 border-primary";
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 md:p-5 rounded-xl text-left transition-all ${buttonStyle} ${
                    !isAnswered ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-base md:text-lg">{option}</span>
                    {isAnswered && isCorrectAnswer && (
                      <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectAnswer && (
                      <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {isAnswered && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}
            >
              <p className="text-sm md:text-base">
                <strong>{isCorrect ? "Correct! " : "Not quite. "}</strong>
                {question.explanation}
              </p>
            </motion.div>
          )}

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
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
