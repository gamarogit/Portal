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
  // Inicializar con token desde localStorage (vacío si no existe)
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
