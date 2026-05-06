import type { Service } from './service';

export type CertificateStatus = 'actif' | 'expire' | 'expiring_soon' | 'revoque';

export interface Certificate {
  id: number;
  domain: string;
  service_id: number;
  service?: Service;
  certificat: string;
  date_creation: string;
  date_expiration: string;
  statut: CertificateStatus;
  days_until_expiration?: number;
  created_at: string;
  updated_at: string;
}

export interface CertificateFormData {
  service_id: number;
  domain: string;
  days: number;
}

export interface ExpirationSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
  revoked: number;
}

export interface CertificateFilters {
  service_id?: number;
  statut?: CertificateStatus;
  search?: string;
}
