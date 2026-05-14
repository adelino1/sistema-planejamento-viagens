export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  preferred_lang: string;
  theme: string;
}
