import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken, setAuthToken } from "@/lib/api-client";
import type { User, InsertUser } from "@shared/types";
import type { LoginCredentials } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: InsertUser) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; companyName?: string }) => Promise<boolean>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug token
  console.log('AuthProvider token:', token ? 'Present' : 'Missing');

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) {return null;}
      
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token is invalid, clear it
        setToken(null);
        setAuthToken(null);
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (data) => {
      const { token: newToken, user } = data;
      setToken(newToken);
      setAuthToken(newToken);

      // Update user data in cache
      queryClient.setQueryData(["/api/auth/me"], user);

      toast({
        title: "Welkom terug!",
        description: "U bent succesvol ingelogd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Inloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      return await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Account aangemaakt!",
        description: "Uw account is succesvol aangemaakt. U kunt nu inloggen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    },
    onSettled: () => {
      setToken(null);
      setAuthToken(null);
      queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();

      toast({
        title: "Uitgelogd",
        description: "U bent succesvol uitgelogd.",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { name: string; companyName?: string }) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Profiel bijgewerkt",
        description: "Uw profiel is succesvol bijgewerkt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wachtwoord gewijzigd",
        description: "Uw wachtwoord is succesvol gewijzigd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Wachtwoord wijziging mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update API request headers when token changes
  useEffect(() => {
    if (token) {
      // Set default authorization header for future requests
      const originalApiRequest = apiRequest;
    }
  }, [token]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(credentials);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (userData: InsertUser): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(userData);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const updateProfile = async (updates: { name: string; companyName?: string }): Promise<boolean> => {
    try {
      await updateProfileMutation.mutateAsync(updates);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<boolean> => {
    try {
      await changePasswordMutation.mutateAsync(passwordData);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
