import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, getMe } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => {},
  refreshUser: async () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await getMe();
        // Preserve local avatar override if present in localStorage
        const storedAvatar = localStorage.getItem('user_avatar_url');
        if (storedAvatar && !userData.avatar_url) {
          userData.avatar_url = storedAvatar;
        }
        setUser(userData);
      } catch (error) {
        console.error('Failed to authenticate:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (token: string): Promise<User | null> => {
    localStorage.setItem('token', token);
    setLoading(true);
    try {
      const userData = await getMe();
      const storedAvatar = localStorage.getItem('user_avatar_url');
      if (storedAvatar && !userData.avatar_url) {
        userData.avatar_url = storedAvatar;
      }
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to authenticate:', error);
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_avatar_url');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      if (fields.avatar_url !== undefined) {
        if (fields.avatar_url) {
          localStorage.setItem('user_avatar_url', fields.avatar_url);
        } else {
          localStorage.removeItem('user_avatar_url');
        }
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
