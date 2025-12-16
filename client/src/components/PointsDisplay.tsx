import { usePoints } from "../hooks/usePoints";
import { Star } from "lucide-react";

interface PointsDisplayProps {
  className?: string;
  showLabel?: boolean;
}

export function PointsDisplay({ className = "", showLabel = true }: PointsDisplayProps) {
  const { points, loading } = usePoints();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      {loading ? (
        <span className="text-muted-foreground animate-pulse">...</span>
      ) : (
        <span className="font-bold text-yellow-600 dark:text-yellow-400">
          {points.toLocaleString()}
        </span>
      )}
      {showLabel && <span className="text-xs text-muted-foreground">pts</span>}
    </div>
  );
}
