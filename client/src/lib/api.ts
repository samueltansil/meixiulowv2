const API_BASE = "";

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const activityApi = {
  getToday: () => apiRequest("/api/activity/today"),
  
  track: (activityType: "reading" | "watching" | "playing", seconds: number) =>
    apiRequest("/api/activity/track", {
      method: "POST",
      body: JSON.stringify({ activityType, seconds }),
    }),
  
  getHistory: (days = 7) => apiRequest(`/api/activity/history?days=${days}`),
};

export const pointsApi = {
  get: () => apiRequest("/api/points"),
  
  getHistory: (limit = 20) => apiRequest(`/api/points/history?limit=${limit}`),
};

export const gameApi = {
  complete: (gameId: number, score: number) =>
    apiRequest(`/api/games/${gameId}/complete`, {
      method: "POST",
      body: JSON.stringify({ score }),
    }),
};
