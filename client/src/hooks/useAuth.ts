import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

interface RegistrationStartResponse {
  success: boolean;
  message?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const currentUser = user || null;

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; parentEmail: string; password: string; confirmPassword: string; firstName?: string; lastName?: string; agreedToTerms?: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json() as Promise<RegistrationStartResponse>;
    },
    onSuccess: () => {},
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async (role: 'teacher' | 'student') => {
      const response = await apiRequest("PATCH", "/api/auth/role", { role });
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/request-verification", {});
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
    },
  });

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    setRole: setRoleMutation.mutateAsync,
    requestVerification: requestVerificationMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSettingRole: setRoleMutation.isPending,
    isRequestingVerification: requestVerificationMutation.isPending,
  };
}
