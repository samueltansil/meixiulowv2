import { useActivity } from "../hooks/useActivity";
import { BookOpen, Video, Gamepad2, Clock } from "lucide-react";

export function ActivityDisplay() {
  const { 
    formattedReading, 
    formattedWatching, 
    formattedPlaying, 
    formattedTotal,
    loading 
  } = useActivity();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <BookOpen className="w-5 h-5 text-blue-500" />
        <div>
          <div className="text-xs text-muted-foreground">Reading</div>
          <div className="font-semibold">{formattedReading}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
        <Video className="w-5 h-5 text-purple-500" />
        <div>
          <div className="text-xs text-muted-foreground">Videos</div>
          <div className="font-semibold">{formattedWatching}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
        <Gamepad2 className="w-5 h-5 text-green-500" />
        <div>
          <div className="text-xs text-muted-foreground">Games</div>
          <div className="font-semibold">{formattedPlaying}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
        <Clock className="w-5 h-5 text-orange-500" />
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-semibold">{formattedTotal}</div>
        </div>
      </div>
    </div>
  );
}
