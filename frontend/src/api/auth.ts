import client from './client';
import type { ApiResponse } from './client';
import type { User, LoginRequest } from '../types/auth';

export interface LoginResult {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export const login = async (data: LoginRequest): Promise<LoginResult> => {
  const response = await client.post<ApiResponse<User>>('/api/login', data);
  return {
    success: response.data.success,
    message: response.data.message || '',
    user: response.data.data || response.data.user!,
    token: response.data.token!,
  };
};

export const logout = async (): Promise<void> => {
  await client.post('/api/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await client.get<ApiResponse<User>>('/api/user');
  return response.data.data || response.data.user!;
};
