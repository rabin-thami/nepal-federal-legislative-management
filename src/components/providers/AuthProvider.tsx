'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { SessionUser, getSession, setSession, clearSession, DEMO_USERS } from '@/lib/auth';

interface AuthContextType {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
  switchRole: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => { },
  logout: () => { },
  switchRole: () => { },
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = (u: SessionUser) => {
    setSession(u);
    setUser(u);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const switchRole = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      login(found);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
