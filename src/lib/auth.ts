"use client";

import { User, UserRole } from '@/types/auth';

export const authConfig = {
  storage: {
    tokenKey: 'meridian_auth_token',
    userKey: 'meridian_user_data'
  },
  routes: {
    login: '/login',
    admin: '/admin',
    manager: '/manager', 
    operator: '/operator'
  }
};

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(authConfig.storage.tokenKey);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(authConfig.storage.userKey);
  return userData ? JSON.parse(userData) : null;
}

export function setAuthData(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(authConfig.storage.tokenKey, token);
  localStorage.setItem(authConfig.storage.userKey, JSON.stringify(user));
}

export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(authConfig.storage.tokenKey);
  localStorage.removeItem(authConfig.storage.userKey);
}

export function getRoleBasedRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return authConfig.routes.admin;
    case 'manager':
      return authConfig.routes.manager;
    case 'operator':
      return authConfig.routes.operator;
    default:
      return authConfig.routes.login;
  }
}
