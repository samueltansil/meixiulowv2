import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PointsResponse {
  points: number;
}

export function usePoints() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PointsResponse>({
    queryKey: ['points'],
    queryFn: async () => {
      const response = await fetch('/api/points', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }
      return response.json();
    },
  });

  const addPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      const response = await fetch('/api/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ points }),
      });
      if (!response.ok) {
        throw new Error('Failed to add points');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });

  return {
    points: data?.points ?? 0,
    isLoading,
    error,
    addPoints: addPointsMutation.mutate,
    isAddingPoints: addPointsMutation.isPending,
  };
}
