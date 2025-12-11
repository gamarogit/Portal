import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { setAuthToken } from '@services/api';

type AuthContextValue = {
  token: string;
  updateToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue>({
  token: '',
  updateToken: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Procesar token de URL ANTES de inicializar el estado
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl) {
    console.log('[Activos Auth] Token detected in URL, saving to localStorage');
    localStorage.setItem('token', tokenFromUrl);
    setAuthToken(tokenFromUrl);
    // Limpiar el token de la URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Inicializar con token desde localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const value = useMemo(
    () => ({
      token,
      updateToken(newToken: string) {
        setToken(newToken);
        setAuthToken(newToken);
        localStorage.setItem('token', newToken);
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
