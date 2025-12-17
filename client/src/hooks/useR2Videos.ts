import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface R2Video {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
}

export interface R2VideoMetadata {
  id: number;
  r2Key: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export function useR2Videos() {
  return useQuery<R2Video[]>({
    queryKey: ["/api/r2/videos"],
    queryFn: async () => {
      const response = await fetch("/api/r2/videos", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch R2 videos");
      }
      return response.json();
    },
  });
}

export function useR2VideoMetadata() {
  return useQuery<R2VideoMetadata[]>({
    queryKey: ["/api/r2/metadata"],
    queryFn: async () => {
      const response = await fetch("/api/r2/metadata", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch R2 video metadata");
      }
      return response.json();
    },
  });
}

export function useR2VideoMetadataByKey(key: string | null) {
  return useQuery<R2VideoMetadata | null>({
    queryKey: ["/api/r2/metadata", key],
    enabled: !!key,
    queryFn: async () => {
      if (!key) return null;
      const response = await fetch(`/api/r2/metadata/${encodeURIComponent(key)}`, {
        credentials: "include",
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch R2 video metadata");
      }
      const data = await response.json();
      return data || null;
    },
  });
}

export function useSaveR2VideoMetadata() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { r2Key: string; title: string; description: string | null; category: string }) => {
      const response = await fetch("/api/r2/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to save video metadata");
      }
      return response.json() as Promise<R2VideoMetadata>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/r2/metadata"] });
      queryClient.invalidateQueries({ queryKey: ["/api/r2/metadata", data.r2Key] });
    },
  });
}

export function useR2VideoUrl(key: string | null) {
  return useQuery<{ url: string }>({
    queryKey: ["/api/r2/videos", key],
    enabled: !!key,
    queryFn: async () => {
      if (!key) throw new Error("No key provided");
      const response = await fetch(`/api/r2/videos/${encodeURIComponent(key)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to get video URL");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes (signed URLs last 1 hour)
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
  });
}
