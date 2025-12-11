import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Procesar token de URL ANTES de inicializar el estado
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl) {
    console.log('[Gateway Auth] Token detected in URL, saving to localStorage');
    localStorage.setItem('token', tokenFromUrl);
    // Limpiar el token de la URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('[Gateway Auth] Initializing auth, token present:', token ? 'YES' : 'NO');
      
      if (token) {
        try {
          const userData = await authService.getProfile();
          console.log('[Gateway Auth] User profile loaded:', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error('[Gateway Auth] Error loading profile:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
