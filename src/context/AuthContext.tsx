// src/context/AuthContext.tsx (Updated import)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';  // 👈 Changed from 'react-router'

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Optional: You can add token verification here by calling a /verify endpoint if backend supports it.
      // For now, assume token is valid if present.
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Optional: Decode JWT to get user info if needed (e.g., role).
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/signin', { replace: true });
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// ProtectedRoute component for private routes
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <NavigateToSignIn />;
};

// RequireAuth component for public routes (e.g., redirect if already logged in)
interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}
export const RequireAuth: React.FC<RequireAuthProps> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (isAuthenticated) {
    navigate(redirectTo, { replace: true });
    return null;
  }
  return <>{children}</>;
};

// Helper component to navigate to signin
const NavigateToSignIn: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {  // 👈 Changed from React.useEffect to just useEffect (already imported)
    navigate('/signin', { replace: true });
  }, [navigate]);
  return null;
};