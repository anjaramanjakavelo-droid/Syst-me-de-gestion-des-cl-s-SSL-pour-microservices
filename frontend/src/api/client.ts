import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';

// En développement, utilise l'URL relative pour profiter du proxy Vite
// En production, utilise VITE_API_BASE_URL ou l'URL par défaut
const baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - inject token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

// Helper to extract data from API response
export const extractData = <T>(response: AxiosResponse<T>): T => response.data;

// Type for paginated/standard API response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
}
