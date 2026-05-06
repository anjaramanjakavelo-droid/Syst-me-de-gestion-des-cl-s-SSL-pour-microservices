import client from './client';
import type { ApiResponse } from './client';
import type { Certificate, CertificateFormData, ExpirationSummary, CertificateFilters } from '../types/certificate';

export const listCertificates = async (filters?: CertificateFilters): Promise<Certificate[]> => {
  const params: Record<string, string | number> = {};
  if (filters?.service_id) params.service_id = filters.service_id;
  if (filters?.statut) params.statut = filters.statut;
  if (filters?.search) params.search = filters.search;

  const response = await client.get<ApiResponse<Certificate[]>>('/api/certificats', { params });
  return response.data.data || [];
};

export const getCertificate = async (id: number): Promise<Certificate> => {
  const response = await client.get<ApiResponse<Certificate>>(`/api/certificats/${id}`);
  return response.data.data!;
};

export const createCertificate = async (data: CertificateFormData): Promise<Certificate> => {
  const response = await client.post<ApiResponse<Certificate>>('/api/certificats', data);
  return response.data.data!;
};

export const renewCertificate = async (id: number): Promise<Certificate> => {
  const response = await client.post<ApiResponse<Certificate>>(`/api/certificats/${id}/renew`);
  return response.data.data!;
};

export const revokeCertificate = async (id: number): Promise<Certificate> => {
  const response = await client.post<ApiResponse<Certificate>>(`/api/certificats/${id}/revoke`);
  return response.data.data!;
};

export const deleteCertificate = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await client.delete<ApiResponse<never>>(`/api/certificats/${id}`);
  return { success: response.data.success, message: response.data.message || '' };
};

export const downloadPrivateKey = async (id: number, domain: string): Promise<void> => {
  const response = await client.get(`/api/certificats/${id}/private-key`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${domain}.key`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const checkExpiration = async (): Promise<ExpirationSummary> => {
  const response = await client.get<ApiResponse<ExpirationSummary>>('/api/check-expiration');
  return response.data.data!;
};
