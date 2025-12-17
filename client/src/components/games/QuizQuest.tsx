import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, HelpCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { QuizGameConfig } from "@shared/schema";

interface QuizQuestProps {
  config: QuizGameConfig;
  onComplete?: (points: number) => void;
}

export function QuizQuest({ config, onComplete }: QuizQuestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const question = config.questions[currentQuestion];
  const passingScore = config.passingScore ?? Math.ceil(config.questions.length * 0.6);
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const correct = index === question.correctIndex;
    if (correct) {
      setScore(s => s + 1);
    }
    setAnswers([...answers, correct]);
  };

  const handleNext = () => {
    if (currentQuestion < config.questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      const finalScore = score + (selectedAnswer === question.correctIndex ? 1 : 0);
      const basePoints = finalScore * 20;
      const perfectBonus = finalScore === config.questions.length ? 50 : 0;
      onComplete?.(basePoints + perfectBonus);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  };

  const finalScore = score + (isComplete && selectedAnswer === question?.correctIndex ? 0 : 0);
  const passed = answers.filter(Boolean).length >= passingScore;

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto" data-testid="game-quiz-quest">
        <CardContent className="pt-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? "text-yellow-500" : "text-gray-400"}`} />
            <h2 className="font-fredoka text-2xl mb-2 text-purple-600">
              Quiz Complete!
            </h2>
            <p className="text-4xl font-bold text-gray-800 mb-2">
              {answers.filter(Boolean).length}/{config.questions.length}
            </p>
            <p className={`font-quicksand text-lg ${passed ? "text-green-600" : "text-orange-500"}`}>
              {passed 
                ? config.winMessage || "Great job! You're a quiz champion!" 
                : "Keep learning! You'll do better next time!"}
            </p>
            
            <div className="flex gap-1 justify-center my-4">
              {answers.map((correct, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    correct ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {correct ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            <Button onClick={resetGame} className="mt-4" data-testid="button-retry-quiz">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="game-quiz-quest">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 font-fredoka text-purple-600">
          <HelpCircle className="w-6 h-6" />
          Quiz Quest
        </CardTitle>
        <div className="flex justify-center gap-1 mt-2">
          {config.questions.map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < currentQuestion 
                  ? answers[i] ? "bg-green-400" : "bg-red-400"
                  : i === currentQuestion 
                  ? "bg-purple-500" 
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-sm text-gray-500 mb-2">
              Question {currentQuestion + 1} of {config.questions.length}
            </p>
            <h3 className="font-quicksand text-lg font-semibold text-gray-800 mb-4">
              {question.question}
            </h3>

            <div className="space-y-2">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  data-testid={`quiz-option-${index}`}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all font-quicksand ${
                    showResult
                      ? index === question.correctIndex
                        ? "bg-green-100 border-green-400 text-green-700"
                        : selectedAnswer === index
                        ? "bg-red-100 border-red-400 text-red-700"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                      : selectedAnswer === index
                      ? "bg-purple-100 border-purple-400"
                      : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      showResult && index === question.correctIndex
                        ? "bg-green-500 text-white"
                        : showResult && selectedAnswer === index
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </span>
                </motion.button>
              ))}
            </div>

            {showResult && question.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg ${
                  isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                }`}
              >
                <p className="text-sm font-quicksand">
                  {isCorrect ? "✓ " : "💡 "}
                  {question.explanation}
                </p>
              </motion.div>
            )}

            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex justify-end"
              >
                <Button onClick={handleNext} data-testid="button-next-question">
                  {currentQuestion < config.questions.length - 1 ? (
                    <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    "See Results"
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
