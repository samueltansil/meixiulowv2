import { useState, useCallback, useEffect } from "react";
import { activityApi } from "../lib/api";

interface TodayActivity {
  readingSeconds: number;
  watchingSeconds: number;
  playSeconds: number;
}

export function useActivity() {
  const [activity, setActivity] = useState<TodayActivity>({
    readingSeconds: 0,
    watchingSeconds: 0,
    playSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await activityApi.getToday();
      setActivity({
        readingSeconds: data.readingSeconds ?? 0,
        watchingSeconds: data.watchingSeconds ?? 0,
        playSeconds: data.playSeconds ?? 0,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch activity");
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    activity,
    loading,
    error,
    refetch: fetchActivity,
    formattedReading: formatTime(activity.readingSeconds),
    formattedWatching: formatTime(activity.watchingSeconds),
    formattedPlaying: formatTime(activity.playSeconds),
    totalSeconds: activity.readingSeconds + activity.watchingSeconds + activity.playSeconds,
    formattedTotal: formatTime(activity.readingSeconds + activity.watchingSeconds + activity.playSeconds),
  };
}
