import client from './client';
import type { ApiResponse } from './client';
import type { Service } from '../types/service';

export const listServices = async (): Promise<Service[]> => {
  const response = await client.get<ApiResponse<Service[]>>('/api/services');
  return response.data.data || [];
};

export const getService = async (id: number): Promise<Service> => {
  const response = await client.get<ApiResponse<Service>>(`/api/services/${id}`);
  return response.data.data!;
};

export const createService = async (data: { nom: string; description?: string }): Promise<Service> => {
  const response = await client.post<ApiResponse<Service>>('/api/services', data);
  return response.data.data!;
};

export const updateService = async (id: number, data: { nom: string; description?: string }): Promise<Service> => {
  const response = await client.put<ApiResponse<Service>>(`/api/services/${id}`, data);
  return response.data.data!;
};

export const deleteService = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await client.delete<ApiResponse<never>>(`/api/services/${id}`);
  return { success: response.data.success, message: response.data.message || '' };
};
