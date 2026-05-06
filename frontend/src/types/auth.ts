export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'service';
  email_verified_at: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}
