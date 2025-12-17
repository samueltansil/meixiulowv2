import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface AuthResponse {
  success: boolean;
  user: User;
  needsRoleSelection?: boolean;
  message?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: replitUser, isLoading: replitLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: emailUser, isLoading: emailLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const currentUser = replitUser || emailUser || null;
  const isLoading = replitLoading || emailLoading;

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; confirmPassword: string; firstName?: string; lastName?: string; agreedToTerms?: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async (role: 'teacher' | 'student') => {
      const response = await apiRequest("PATCH", "/api/auth/role", { role });
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/request-verification", {});
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
    },
  });

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    needsRoleSelection: currentUser && !currentUser.userRole,
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
