export type UserRole = 'admin' | 'manager' | 'operator';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
