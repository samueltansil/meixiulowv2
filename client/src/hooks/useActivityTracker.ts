import { useRef, useCallback, useEffect } from "react";
import { activityApi } from "../lib/api";

type ActivityType = "reading" | "watching" | "playing";

export function useActivityTracker(activityType: ActivityType) {
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSecondsRef = useRef(0);

  const sendActivity = useCallback(async (seconds: number) => {
    if (seconds <= 0) return;
    try {
      await activityApi.track(activityType, seconds);
      console.log(`Tracked ${seconds}s of ${activityType}`);
    } catch (error) {
      console.error(`Failed to track ${activityType}:`, error);
    }
  }, [activityType]);

  const startTracking = useCallback(() => {
    if (startTimeRef.current !== null) return;
    
    startTimeRef.current = Date.now();
    accumulatedSecondsRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const toSend = elapsed - accumulatedSecondsRef.current;
        if (toSend >= 30) {
          sendActivity(toSend);
          accumulatedSecondsRef.current = elapsed;
        }
      }
    }, 30000);
  }, [sendActivity]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = elapsed - accumulatedSecondsRef.current;
      if (remaining > 0) {
        sendActivity(remaining);
      }
      startTimeRef.current = null;
      accumulatedSecondsRef.current = 0;
    }
  }, [sendActivity]);

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    startTracking,
    stopTracking,
    getElapsedSeconds,
    isTracking: startTimeRef.current !== null,
  };
}

export function useReadingTracker() {
  return useActivityTracker("reading");
}

export function useGameTracker() {
  return useActivityTracker("playing");
}

export function useVideoTracker() {
  return useActivityTracker("watching");
}
