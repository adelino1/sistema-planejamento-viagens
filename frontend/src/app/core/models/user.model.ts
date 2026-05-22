export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatar?: string;
  phone?: string;
  country?: string;
  bio?: string;
  createdAt: string;
  isActive: boolean;
  preferences?: {
    theme: 'light' | 'dark';
    language: 'pt' | 'en';
    currency: string;
    notifications: boolean;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
