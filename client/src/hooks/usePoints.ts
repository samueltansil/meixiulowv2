import { useState, useCallback, useEffect } from "react";
import { pointsApi, gameApi } from "../lib/api";

export function usePoints() {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pointsApi.get();
      setPoints(data.points);
      setError(null);
    } catch (err) {
      setError("Failed to fetch points");
      console.error("Error fetching points:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeGame = useCallback(async (gameId: number, score: number) => {
    try {
      const result = await gameApi.complete(gameId, score);
      setPoints(result.totalPoints);
      return result;
    } catch (err) {
      console.error("Error completing game:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return {
    points,
    loading,
    error,
    refetch: fetchPoints,
    completeGame,
  };
}
