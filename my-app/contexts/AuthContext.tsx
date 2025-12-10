import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'guest' | null;

interface AuthContextType {
  userRole: UserRole;
  parentId: number | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [parentId, setParentId] = useState<number | null>(null);

  const login = (username: string, password: string): boolean => {
    // Hardkodet innlogging
    if (username === 'Admin' && password === 'Admin') {
      setUserRole('admin');
      setParentId(null);
      return true;
    } else if (username === 'Gjest' && password === 'Gjest') {
      setUserRole('guest');
      setParentId(1); // Kari Hansen (har barn med ID 1 og 6)
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole(null);
    setParentId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        parentId,
        login,
        logout,
        isAuthenticated: userRole !== null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
