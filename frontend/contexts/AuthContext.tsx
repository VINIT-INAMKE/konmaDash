'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'stall';
  fullName?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Verify token with backend
  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Token is invalid or expired
        clearAuth();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }

      // Store token and user
      const { token: newToken, user: newUser } = data.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  // Logout function
  const logout = () => {
    // Call logout endpoint (optional - JWT is stateless)
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => console.error('Logout API error:', err));
    }

    clearAuth();
  };

  // Clear auth state
  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
