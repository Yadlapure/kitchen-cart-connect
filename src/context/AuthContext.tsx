
import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy credentials for testing
const dummyUsers: Record<string, User> = {
  'customer@test.com': {
    id: '1',
    username: 'customer@test.com',
    role: 'customer',
    name: 'John Customer'
  },
  'merchant@test.com': {
    id: '2',
    username: 'merchant@test.com',
    role: 'merchant',
    name: 'Jane Merchant'
  },
  'admin@test.com': {
    id: '3',
    username: 'admin@test.com',
    role: 'admin',
    name: 'Admin User'
  }
};

const dummyPasswords: Record<string, string> = {
  'customer@test.com': 'customer123',
  'merchant@test.com': 'merchant123',
  'admin@test.com': 'admin123'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    if (dummyUsers[username] && dummyPasswords[username] === password) {
      setUser(dummyUsers[username]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
