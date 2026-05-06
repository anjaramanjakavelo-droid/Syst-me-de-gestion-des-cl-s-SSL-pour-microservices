import type { Certificate } from '../../types/certificate';
import { Link } from 'react-router-dom';
import { RefreshCw, XCircle, Trash2, Eye } from 'lucide-react';
import CertificateStatusBadge from './CertificateStatusBadge';
import { useAuth } from '../../store/authStore';

interface CertificateTableProps {
  certificates: Certificate[];
  onRenew: (id: number) => void;
  onRevoke: (id: number) => void;
  onDelete: (id: number) => void;
  renewing: number | null;
  revoking: number | null;
}

const CertificateTable = ({ certificates, onRenew, onRevoke, onDelete, renewing, revoking }: CertificateTableProps) => {
  const { isAdmin } = useAuth();

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun certificat trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Domaine</th>
            <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
            <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jours restants</th>
            {isAdmin && <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {certificates.map((cert) => (
            <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3.5">
                <Link to={`/certificates/${cert.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                  {cert.domain}
                </Link>
              </td>
              <td className="py-3.5">
                <span className="text-sm text-gray-600">{cert.service?.nom || `Service #${cert.service_id}`}</span>
              </td>
              <td className="py-3.5">
                <CertificateStatusBadge status={cert.statut} daysUntilExpiration={cert.days_until_expiration} />
              </td>
              <td className="py-3.5">
                <span className="text-sm text-gray-600">
                  {new Date(cert.date_expiration).toLocaleDateString()}
                </span>
              </td>
              <td className="py-3.5">
                <span className={`text-sm font-medium ${
                  cert.days_until_expiration !== undefined
                    ? cert.days_until_expiration <= 0 ? 'text-red-600'
                      : cert.days_until_expiration <= 30 ? 'text-yellow-600'
                      : 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  {cert.days_until_expiration !== undefined
                    ? cert.days_until_expiration <= 0 ? 'Expiré'
                      : `${cert.days_until_expiration} jours`
                    : 'N/D'}
                </span>
              </td>
              {isAdmin && (
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/certificates/${cert.id}`}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {cert.statut !== 'revoque' && cert.statut !== 'expire' && (
                      <button
                        onClick={() => onRenew(cert.id)}
                        disabled={renewing === cert.id}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                        title="Renouveler"
                      >
                        {renewing === cert.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {cert.statut !== 'revoque' && (
                      <button
                        onClick={() => onRevoke(cert.id)}
                        disabled={revoking === cert.id}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors disabled:opacity-50"
                        title="Révoquer"
                      >
                        {revoking === cert.id ? (
                          <XCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(cert.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificateTable;
