import { useQuery } from "@tanstack/react-query";
import { Book, Play, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface ActivityData {
  readingTimeSeconds: number;
  watchingTimeSeconds: number;
  playingTimeSeconds: number;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

export function ActivityTracker() {
  const { user } = useAuth();

  const { data: activity } = useQuery<ActivityData>({
    queryKey: ['/api/activity/today'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!user) return null;

  const stats = [
    {
      id: 'reading',
      label: "Today's Reading Time",
      value: activity?.readingTimeSeconds || 0,
      icon: Book,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      id: 'watching',
      label: "Today's Watching Time",
      value: activity?.watchingTimeSeconds || 0,
      icon: Tv,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'playing',
      label: "Today's Play Time",
      value: activity?.playingTimeSeconds || 0,
      icon: Play,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4" data-testid="activity-tracker">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${stat.bgColor} rounded-xl p-2 flex items-center gap-2 shadow-sm border border-white/50`}
            data-testid={`stat-${stat.id}`}
          >
            <div className={`${stat.color} p-1.5 rounded-lg shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className={`text-base font-bold ${stat.textColor}`} data-testid={`value-${stat.id}`}>
                {formatTime(stat.value)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
