'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'viewer' | 'creator' | 'admin';
  displayName?: string;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // UPDATE 1: Add displayName to the type definition here
  register: (email: string, password: string, role: string, displayName: string) => Promise<void>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleRedirect = (role: string) => {
    if (role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = data.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      handleRedirect(newUser.role);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  // UPDATE 2: Add displayName to arguments and payload
  const register = async (email: string, password: string, role: string, displayName: string) => {
    try {
      // Pass displayName to backend
      const { data } = await api.post('/auth/register', { 
        email, 
        password, 
        role, 
        displayName 
      });
      
      const { token: newToken, user: newUser } = data.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      handleRedirect(newUser.role);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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