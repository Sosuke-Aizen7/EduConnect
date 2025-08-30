
import { useQuery } from "@tanstack/react-query";
import type { User } from "../types/user";

export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
