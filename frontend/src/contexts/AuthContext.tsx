import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { loginUser, logoutUser, UserProfile } from '../services/authService';

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (studentId: string, password: string): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await loginUser(studentId, password);
      if (result.success && result.user) {
        if (result.token) {
          localStorage.setItem('collegemate_token', result.token);
        }
        setState({ isLoggedIn: true, user: result.user, isLoading: false, error: null });
        return true;
      } else {
        setState((s) => ({ ...s, isLoading: false, error: 'Invalid credentials' }));
        return false;
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: 'Login failed. Please try again.' }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    localStorage.removeItem('collegemate_token');
    setState({ isLoggedIn: false, user: null, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
