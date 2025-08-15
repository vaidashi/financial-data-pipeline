import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import api, { tokenManager, endpoints } from '../lib/api';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const queryClient = useQueryClient();

    // Get current user
    const {
    data: userData,
    isLoading: isUserLoading,
    isError,
  } = useQuery(
    'currentUser',
    async () => {
      const response = await api.get<User>(endpoints.me);
      return response.data;
    },
    {
      enabled: !!tokenManager.getToken(),
      retry: false,
      onSuccess: (data: User) => {
        setUser(data);
        setIsInitialized(true);
      },
      onError: () => {
        tokenManager.clearAll();
        setUser(null);
        setIsInitialized(true);
      },
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>(endpoints.login, credentials);
      return response.data;
    },
    {
      onSuccess: (data: AuthResponse) => {
        const { user, accessToken, refreshToken } = data;
        tokenManager.setToken(accessToken);
        tokenManager.setRefreshToken(refreshToken);
        setUser(user);
        queryClient.setQueryData('currentUser', user);
        toast.success(`Welcome back, ${user.firstName || user.username}!`);
      },
      onError: (error: any) => {
        console.error('Login failed:', error);
        toast.error('Login failed. Please check your credentials.');
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>(endpoints.register, userData);
      return response.data;
    },
    {
      onSuccess: (data: AuthResponse) => {
        const { user, accessToken, refreshToken } = data;
        tokenManager.setToken(accessToken);
        tokenManager.setRefreshToken(refreshToken);
        setUser(user);
        queryClient.setQueryData('currentUser', user);
        toast.success(`Welcome to Financial Pipeline, ${user.firstName || user.username}!`);
      },
      onError: (error: any) => {
        console.error('Registration failed:', error);
        toast.error('Registration failed. Please try again.');
      },
    }
  );

  // Initialize auth state on mount
  useEffect(() => {
    const token = tokenManager.getToken();
    
    if (!token) {
      setIsInitialized(true);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = (): void => {
    tokenManager.clearAll();
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const refreshUser = (): void => {
    queryClient.invalidateQueries('currentUser');
  };

  const value: AuthContextType = {
    user,
    isLoading: !isInitialized || isUserLoading || loginMutation.isLoading || registerMutation.isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}