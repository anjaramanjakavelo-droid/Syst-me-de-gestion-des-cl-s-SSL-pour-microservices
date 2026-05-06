import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import type { Certificate } from '../types/certificate';
import type { Service } from '../types/service';
import * as certificateApi from '../api/certificates';
import * as serviceApi from '../api/services';
import { useAuth } from '../store/authStore';
import CertificateTable from '../components/certificates/CertificateTable';
import CertificateFilters from '../components/certificates/CertificateFilters';

type Filters = {
  service_id?: number;
  statut?: 'actif' | 'expire' | 'expiring_soon' | 'revoque';
  search?: string;
};

const CertificatesPage = () => {
  const { isAdmin } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [renewing, setRenewing] = useState<number | null>(null);
  const [revoking, setRevoking] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [certs, svcs] = await Promise.all([
        certificateApi.listCertificates(),
        serviceApi.listServices(),
      ]);
      setCertificates(certs);
      setServices(svcs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenew = async (id: number) => {
    if (!confirm('Renew this certificate? This will generate a new certificate with updated expiration.')) return;
    setRenewing(id);
    try {
      await certificateApi.renewCertificate(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du renouvellement du certificat');
    } finally {
      setRenewing(null);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Revoke this certificate? This action cannot be undone.')) return;
    setRevoking(id);
    try {
      await certificateApi.revokeCertificate(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la révocation du certificat');
    } finally {
      setRevoking(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await certificateApi.deleteCertificate(id);
      if (result.success) {
        setCertificates(certificates.filter((c) => c.id !== id));
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la suppression du certificat');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Apply client-side filters
  const filteredCerts = certificates.filter((cert) => {
    if (filters.service_id && cert.service_id !== filters.service_id) return false;
    if (filters.statut && cert.statut !== filters.statut) return false;
    if (filters.search && !cert.domain.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificats</h1>
          <p className="text-gray-500 mt-1">{filteredCerts.length} certificat(s) trouvé(s)</p>
        </div>
        {isAdmin && (
          <Link
            to="/certificates/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau certificat
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <CertificateFilters filters={filters} services={services} onFilterChange={setFilters} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <CertificateTable
          certificates={filteredCerts}
          onRenew={handleRenew}
          onRevoke={handleRevoke}
          onDelete={(id) => setDeleteConfirm(id)}
          renewing={renewing}
          revoking={revoking}
        />

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-700 mb-3">Supprimer ce certificat ? Cette action ne peut pas être annulée.</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
