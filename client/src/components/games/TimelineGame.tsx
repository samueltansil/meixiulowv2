import { useState, useEffect, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowDown, Volume2, VolumeX } from "lucide-react";
import type { TimelineGameConfig } from "@shared/schema";
import { useGameAudio } from "@/hooks/useGameAudio";
import CongratulationsScreen from "./CongratulationsScreen";

interface TimelineGameProps {
  config: TimelineGameConfig;
  onComplete: (score: number) => void;
  onBack?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  backgroundMusicUrl?: string | null;
  soundEffectsEnabled?: boolean;
  pointsReward?: number;
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  image?: string;
  correctOrder: number;
}

export default function TimelineGame({ 
  config, 
  onComplete,
  onBack,
  onTimeUpdate,
  backgroundMusicUrl,
  soundEffectsEnabled = true,
  pointsReward 
}: TimelineGameProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const { playSound, setBackgroundMusicMuted } = useGameAudio({ backgroundMusicUrl, soundEffectsEnabled });
  const [isMuted, setIsMuted] = useState(false);

  const initializeGame = useCallback(() => {
    const shuffledEvents = config.events
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        image: event.image,
        correctOrder: event.order
      }))
      .sort(() => Math.random() - 0.5);
    
    setEvents(shuffledEvents);
    setIsSubmitted(false);
    setScore(0);
    setAttempts(0);
    setGameTime(0);
    setIsComplete(false);
  }, [config.events]);

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

  const checkOrder = () => {
    playSound('click');
    setAttempts(prev => prev + 1);
    setIsSubmitted(true);
    
    let correctCount = 0;
    events.forEach((event, index) => {
      if (event.correctOrder === index + 1) {
        correctCount++;
      }
    });

    const percentCorrect = correctCount / events.length;
    const calculatedScore = Math.round(percentCorrect * 100);
    setScore(calculatedScore);

    if (percentCorrect === 1) {
      playSound('correct');
      setIsComplete(true);
      const attemptPenalty = Math.max(0, (attempts) * 10);
      const timePenalty = Math.floor(gameTime / 20) * 5;
      const finalCalculatedScore = Math.max(10, Math.min(100, 100 - attemptPenalty - timePenalty));
      setFinalScore(finalCalculatedScore);
      onComplete(finalCalculatedScore);
    } else {
      playSound('error');
    }
  };

  const tryAgain = () => {
    playSound('click');
    setIsSubmitted(false);
  };

  const getPositionStatus = (event: TimelineEvent, index: number) => {
    if (!isSubmitted) return 'pending';
    return event.correctOrder === index + 1 ? 'correct' : 'incorrect';
  };

  if (isComplete) {
    return (
      <CongratulationsScreen
        score={finalScore}
        maxScore={100}
        stats={[
          { label: "Attempts", value: attempts },
          { label: "Time", value: `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}` },
          { label: "Events", value: events.length },
          { label: "First Try?", value: attempts === 1 ? "Yes!" : "No" },
        ]}
        winMessage={config.winMessage || "Perfect Order!"}
        onPlayAgain={initializeGame}
        onBack={onBack}
        soundEffectsEnabled={soundEffectsEnabled}
        pointsReward={pointsReward}
      />
    );
  }

  return (
    <div className="relative flex flex-col gap-6 p-4 w-full max-w-lg mx-auto overflow-x-hidden">
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
      <div className="text-center">
        <h3 className="font-heading text-xl font-bold mb-2">Put these events in order!</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop to arrange from first to last
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm">
        <span>Attempts: <strong>{attempts}</strong></span>
        <span>Time: <strong>{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</strong></span>
      </div>

      <Reorder.Group 
        axis="y" 
        values={events} 
        onReorder={(newEvents) => {
          playSound('move');
          setEvents(newEvents);
        }}
        className="space-y-3"
      >
        {events.map((event, index) => {
          const status = getPositionStatus(event, index);
          
          return (
            <Reorder.Item
              key={event.id}
              value={event}
              className={`relative cursor-grab active:cursor-grabbing ${isSubmitted ? 'pointer-events-none' : ''}`}
            >
              <motion.div
                layout
                className={`p-4 rounded-xl border-2 transition-colors ${
                  status === 'correct' 
                    ? 'bg-green-50 border-green-400' 
                    : status === 'incorrect'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-white border-muted hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    status === 'correct' 
                      ? 'bg-green-500 text-white' 
                      : status === 'incorrect'
                        ? 'bg-red-500 text-white'
                        : 'bg-muted'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold">{event.title}</h4>
                      {status === 'correct' && (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {event.image && (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                </div>

                {isSubmitted && status === 'incorrect' && (
                  <p className="text-xs text-red-600 mt-2 ml-12">
                    Should be position {event.correctOrder}
                  </p>
                )}
              </motion.div>

              {index < events.length - 1 && !isSubmitted && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
                </div>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <div className="flex justify-center gap-4 pt-4">
        {isSubmitted && !isComplete ? (
          <>
            <Button onClick={tryAgain} variant="outline">
              Rearrange
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {score === 100 ? 'Perfect!' : `${score}% correct - keep trying!`}
              </p>
            </div>
          </>
        ) : (
          <Button onClick={checkOrder} size="lg">
            Check My Order
          </Button>
        )}
      </div>
    </div>
  );
}
