import type { CertificateStatus } from '../../types/certificate';
import { ShieldCheck, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: CertificateStatus;
  daysUntilExpiration?: number;
}

const statusConfig: Record<CertificateStatus, { label: string; color: string; icon: typeof ShieldCheck }> = {
  actif: { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-200', icon: ShieldCheck },
  expire: { label: 'Expiré', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertOctagon },
  expiring_soon: { label: 'Expiration proche', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
  revoque: { label: 'Révoqué', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
};

const CertificateStatusBadge = ({ status, daysUntilExpiration }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
      {daysUntilExpiration !== undefined && status === 'actif' && (
        <span className="ml-1">({daysUntilExpiration}j)</span>
      )}
    </span>
  );
};

export default CertificateStatusBadge;
