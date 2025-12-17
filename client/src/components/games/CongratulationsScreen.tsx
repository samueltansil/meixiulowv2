import { motion } from "framer-motion";
import { Trophy, Star, RotateCcw, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface CongratulationsScreenProps {
  score: number;
  maxScore?: number;
  stats?: {
    label: string;
    value: string | number;
  }[];
  winMessage?: string;
  onPlayAgain: () => void;
  onBack?: () => void;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

export default function CongratulationsScreen({
  score,
  maxScore = 100,
  stats = [],
  winMessage = "Great job!",
  onPlayAgain,
  onBack,
  soundEffectsEnabled = true,
  pointsReward,
}: CongratulationsScreenProps) {
  const fanfareRef = useRef<HTMLAudioElement | null>(null);
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));
  
  const getGrade = () => {
    if (percentage >= 90) return { text: "AMAZING!", color: "text-yellow-500", stars: 3 };
    if (percentage >= 70) return { text: "GREAT!", color: "text-emerald-500", stars: 2 };
    if (percentage >= 50) return { text: "GOOD!", color: "text-blue-500", stars: 1 };
    return { text: "NICE TRY!", color: "text-purple-500", stars: 0 };
  };

  const grade = getGrade();

  useEffect(() => {
    if (soundEffectsEnabled) {
      const fanfare = new Audio('https://cdn.freesound.org/previews/320/320775_1661766-lq.mp3');
      fanfare.volume = 0.5;
      fanfareRef.current = fanfare;
      fanfare.play().catch(() => {});
      
      const cheering = new Audio('https://cdn.freesound.org/previews/462/462361_8337406-lq.mp3');
      cheering.volume = 0.4;
      setTimeout(() => cheering.play().catch(() => {}), 300);
      
      const confettiPop = new Audio('https://cdn.freesound.org/previews/397/397354_4284968-lq.mp3');
      confettiPop.volume = 0.3;
      confettiPop.play().catch(() => {});
    }
    
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    return () => {
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current = null;
      }
    };
  }, [soundEffectsEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="relative mb-6"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
          <Trophy className="w-16 h-16 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-32 h-32"
        >
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 left-1/2 -translate-x-1/2" />
          <Sparkles className="w-5 h-5 text-yellow-400 absolute top-1/2 -right-2 -translate-y-1/2" />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -bottom-2 left-1/2 -translate-x-1/2" />
          <Sparkles className="w-5 h-5 text-yellow-400 absolute top-1/2 -left-2 -translate-y-1/2" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-4xl font-heading font-bold ${grade.color} mb-2`}
      >
        {grade.text}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground mb-4"
      >
        {winMessage}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 mb-6"
      >
        {[1, 2, 3].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: starNum <= grade.stars ? 1 : 0.5, 
              rotate: 0,
              opacity: starNum <= grade.stars ? 1 : 0.3
            }}
            transition={{ delay: 0.6 + starNum * 0.1, type: "spring" }}
          >
            <Star
              className={`w-12 h-12 ${
                starNum <= grade.stars 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-300 text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 w-full"
      >
        <div className="text-5xl font-heading font-bold text-primary mb-2">
          {score}
        </div>
        <div className="text-sm text-muted-foreground">Score</div>
        {pointsReward !== undefined && pointsReward > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-4 pt-4 border-t border-primary/20"
          >
            <div className="text-2xl font-heading font-bold text-green-600">
              +{Math.round((score / 100) * pointsReward)} pts
            </div>
            <div className="text-sm text-green-600/80">You gained points!</div>
          </motion.div>
        )}
      </motion.div>

      {stats.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-4 w-full mb-6"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-muted/50 rounded-xl p-3">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex gap-3 w-full"
      >
        <Button
          onClick={onPlayAgain}
          className="flex-1 rounded-full gap-2"
          size="lg"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 rounded-full gap-2"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Games
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
