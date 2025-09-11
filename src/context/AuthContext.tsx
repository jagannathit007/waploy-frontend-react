import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { apiCall } from '../services/api/auth'; // Import apiCall from your auth service

interface UserProfile {
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  role: 'admin' | 'team_member';
}

interface AuthContextType {
  token: string | null;
  profile: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token); // Start loading if token exists
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await apiCall('/get-profile', { method: 'POST' }, token);
          if (response.data) {
            // Store profile in localStorage and state
            localStorage.setItem('profile', JSON.stringify(response.data));
            setProfile(response.data);
          } else {
            // No profile found, clear localStorage and reset state
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            setToken(null);
            setProfile(null);
            navigate('/signin', { replace: true });
          }
        } catch (error) {
          // API call failed, assume token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('profile');
          setToken(null);
          setProfile(null);
          navigate('/signin', { replace: true });
        }
      } else {
        // No token, clear profile and ensure not loading
        localStorage.removeItem('profile');
        setProfile(null);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token, navigate]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoading(true); // Trigger profile fetch
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    setToken(null);
    setProfile(null);
    navigate('/signin', { replace: true });
  };

  const isAuthenticated = !!token && !!profile;

  return (
    <AuthContext.Provider value={{ token, profile, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// LoadingSpinner component
// const LoadingSpinner: React.FC = () => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
//       <div className="w-12 h-12 border-4 border-t-brand-500 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
//     </div>
//   );
// };

// ProtectedRoute component for private routes
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // You can replace with a proper loading spinner
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

// RequireAuth component for public routes (e.g., redirect if already logged in)
interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}
export const RequireAuth: React.FC<RequireAuthProps> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>; // You can replace with a proper loading spinner
  }

  if (isAuthenticated) {
    navigate(redirectTo, { replace: true });
    return null;
  }
  return <>{children}</>;
};