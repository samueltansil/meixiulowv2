import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

type ActivityType = 'reading' | 'watching' | 'playing';

export function useActivityTracker(activityType: ActivityType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const trackMutation = useMutation({
    mutationFn: async (seconds: number) => {
      const response = await fetch('/api/activity/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ activityType, seconds }),
      });
      if (!response.ok) throw new Error('Failed to track activity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity/today'] });
    },
  });

  useEffect(() => {
    if (!user) return;

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= 30) {
          trackMutation.mutate(elapsed);
          startTimeRef.current = Date.now();
        }
      }
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (startTimeRef.current && user) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= 5) {
          trackMutation.mutate(elapsed);
        }
      }
    };
  }, [user, activityType]);
}
