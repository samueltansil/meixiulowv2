import { useState, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, Clock, CheckCircle, GripVertical } from "lucide-react";
import type { TimelineGameConfig } from "@shared/schema";

interface TimelineBuilderProps {
  config: TimelineGameConfig;
  onComplete?: (points: number) => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  image?: string;
  order: number;
  currentOrder: number;
}

export function TimelineBuilder({ config, onComplete }: TimelineBuilderProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const shuffled = [...config.events].map((e, i) => ({
      ...e,
      currentOrder: i,
    }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempOrder = shuffled[i].currentOrder;
      shuffled[i].currentOrder = shuffled[j].currentOrder;
      shuffled[j].currentOrder = tempOrder;
    }
    return shuffled.sort((a, b) => a.currentOrder - b.currentOrder);
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const resetGame = useCallback(() => {
    const shuffled = [...config.events].map((e, i) => ({
      ...e,
      currentOrder: i,
    }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempOrder = shuffled[i].currentOrder;
      shuffled[i].currentOrder = shuffled[j].currentOrder;
      shuffled[j].currentOrder = tempOrder;
    }
    setEvents(shuffled.sort((a, b) => a.currentOrder - b.currentOrder));
    setIsChecking(false);
    setIsComplete(false);
    setAttempts(0);
  }, [config.events]);

  const handleReorder = (newOrder: TimelineEvent[]) => {
    if (isChecking || isComplete) return;
    const updated = newOrder.map((event, index) => ({
      ...event,
      currentOrder: index,
    }));
    setEvents(updated);
  };

  const checkOrder = () => {
    setIsChecking(true);
    setAttempts(a => a + 1);
    
    const sortedByCorrect = [...events].sort((a, b) => a.order - b.order);
    const isCorrect = events.every((event, index) => 
      event.id === sortedByCorrect[index].id
    );
    
    if (isCorrect) {
      setIsComplete(true);
      const basePoints = 100;
      const attemptPenalty = (attempts) * 10;
      onComplete?.(Math.max(50, basePoints - attemptPenalty));
    } else {
      setTimeout(() => {
        setIsChecking(false);
      }, 1500);
    }
  };

  const getEventStatus = (event: TimelineEvent, index: number): "correct" | "wrong" | "neutral" => {
    if (!isChecking) return "neutral";
    const sortedByCorrect = [...config.events].sort((a, b) => a.order - b.order);
    return event.id === sortedByCorrect[index].id ? "correct" : "wrong";
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="game-timeline-builder">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 font-fredoka text-teal-600">
          <Clock className="w-6 h-6" />
          Timeline Builder
        </CardTitle>
        <p className="text-sm text-gray-500 font-quicksand">
          Drag to arrange events in the correct order
        </p>
      </CardHeader>
      <CardContent>
        {!isComplete ? (
          <>
            <div className="mb-4 text-sm text-center text-gray-500">
              Attempts: {attempts}
            </div>
            
            <Reorder.Group
              axis="y"
              values={events}
              onReorder={handleReorder}
              className="space-y-2"
            >
              {events.map((event, index) => {
                const status = getEventStatus(event, index);
                return (
                  <Reorder.Item
                    key={event.id}
                    value={event}
                    data-testid={`timeline-event-${event.id}`}
                    className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-colors ${
                      status === "correct" 
                        ? "bg-green-100 border-green-400" 
                        : status === "wrong"
                        ? "bg-red-100 border-red-400"
                        : "bg-white border-gray-200 hover:border-teal-300"
                    }`}
                    whileDrag={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      {event.image && (
                        <img 
                          src={event.image} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-quicksand font-semibold text-gray-800 text-sm truncate">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {status === "correct" && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            <div className="flex justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={resetGame}
                data-testid="button-reset-timeline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={checkOrder}
                disabled={isChecking}
                className="bg-teal-500 hover:bg-teal-600"
                data-testid="button-check-timeline"
              >
                {isChecking ? "Checking..." : "Check Order"}
              </Button>
            </div>
            
            {isChecking && !isComplete && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-4 text-orange-600 font-quicksand"
              >
                Not quite right! Try again.
              </motion.p>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="font-fredoka text-2xl text-teal-600 mb-2">
              Perfect Timeline!
            </h2>
            <p className="font-quicksand text-gray-600 mb-4">
              {config.winMessage || "You got the order right!"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Completed in {attempts} attempt{attempts !== 1 ? "s" : ""}
            </p>
            
            <div className="space-y-2 mb-6">
              {[...config.events].sort((a, b) => a.order - b.order).map((event, index) => (
                <div 
                  key={event.id}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm font-quicksand text-gray-700">{event.title}</span>
                </div>
              ))}
            </div>
            
            <Button onClick={resetGame} data-testid="button-replay-timeline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
