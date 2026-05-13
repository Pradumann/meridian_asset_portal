"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '@/types/auth';
import { authAPI } from '@/api/auth';
import { getStoredUser, setAuthData, clearAuthData, getRoleBasedRoute } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload.user, error: null };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, user: null, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login(credentials);
      const user = await authAPI.getCurrentUser();
      
      if (user) {
        setAuthData(response.token, user);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: user, token: response.token } });
        
        const redirectRoute = getRoleBasedRoute(user.role);
        router.push(redirectRoute);
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      dispatch({ type: 'LOGOUT' });
      router.push('/login');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authAPI.resetPassword(email);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset failed');
    }
  };

  const checkAuth = async (): Promise<void> => {
    const user = getStoredUser();

    if (!user) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      dispatch({ type: 'AUTH_START' });
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: currentUser, token: '' } });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      if (user) {
        setAuthData('', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: user, token: '' } });
      } else {
        clearAuthData();
        dispatch({ type: 'LOGOUT' });
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
