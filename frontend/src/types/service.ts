import type { Certificate } from './certificate';

export interface Service {
  id: number;
  nom: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  certificats_count?: number;
  certificats?: Certificate[];
}

export interface ServiceFormData {
  nom: string;
  description?: string;
}
