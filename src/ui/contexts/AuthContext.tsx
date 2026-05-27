import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  AuthContextType,
  User,
  LoginDto,
  RegisterDto,
} from '../types/auth.types';
import { apiService, ApiError } from '../services/api.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'artemis_token';
const USER_KEY = 'artemis_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuthenticatedUser = (nextUser: User | null) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(USER_KEY);
  };

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          persistAuthenticatedUser(JSON.parse(storedUser));

          try {
            const profile = await apiService.getProfile(storedToken);
            persistAuthenticatedUser(profile);
          } catch (error) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            persistAuthenticatedUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      const response = await apiService.login(credentials);

      setToken(response.access_token);
      persistAuthenticatedUser(response.user);

      localStorage.setItem(TOKEN_KEY, response.access_token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to login');
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await apiService.register(data);

      setToken(response.access_token);
      persistAuthenticatedUser(response.user);

      localStorage.setItem(TOKEN_KEY, response.access_token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to register');
    }
  };

  const refreshProfile = async (): Promise<User | null> => {
    if (!token) return null;

    const profile = await apiService.getProfile(token);
    persistAuthenticatedUser(profile);
    return profile;
  };

  const updateAuthenticatedUser = (nextUser: User) => {
    persistAuthenticatedUser(nextUser);
  };

  const logout = () => {
    setToken(null);
    persistAuthenticatedUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    refreshProfile,
    updateAuthenticatedUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
