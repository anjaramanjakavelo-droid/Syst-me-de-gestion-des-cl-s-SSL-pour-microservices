import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, XCircle, Trash2, Download, AlertTriangle, AlertOctagon, Copy, Check } from 'lucide-react';
import type { Certificate } from '../types/certificate';
import * as certificateApi from '../api/certificates';
import { useAuth } from '../store/authStore';
import CertificateStatusBadge from '../components/certificates/CertificateStatusBadge';

const CertificateDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCert = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await certificateApi.getCertificate(Number(id));
      setCertificate(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du chargement du certificat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCert();
  }, [id]);

  const handleRenew = async () => {
    if (!confirm('Renouveler ce certificat ? Cela générera un nouveau certificat.') || !id) return;
    setActionLoading(true);
    try {
      await certificateApi.renewCertificate(Number(id));
      fetchCert();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du renouvellement du certificat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Révoquer ce certificat ? Cette action ne peut pas être annulée.') || !id) return;
    setActionLoading(true);
    try {
      await certificateApi.revokeCertificate(Number(id));
      fetchCert();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la révocation du certificat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce certificat ? Cette action ne peut pas être annulée.') || !id) return;
    try {
      await certificateApi.deleteCertificate(Number(id));
      navigate('/certificates');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la suppression du certificat');
    }
  };

  const handleDownloadKey = async () => {
    if (!id || !certificate) return;
    setActionLoading(true);
    try {
      await certificateApi.downloadPrivateKey(Number(id), certificate.domain);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du téléchargement de la clé privée');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Certificat non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{certificate.domain}</h1>
            <p className="text-gray-500 text-sm">
              Délivré à {certificate.service?.nom || `Service #${certificate.service_id}`}
            </p>
          </div>
        </div>
        <CertificateStatusBadge
          status={certificate.statut}
          daysUntilExpiration={certificate.days_until_expiration}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du certificat</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Domaine</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{certificate.domain}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Service</p>
                <Link
                  to={`/services/${certificate.service_id}`}
                  className="text-sm font-medium text-blue-600 hover:underline mt-1 block"
                >
                  {certificate.service?.nom || `#${certificate.service_id}`}
                </Link>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Créé le</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(certificate.date_creation).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Expiration</p>
                <p className={`text-sm font-medium mt-1 ${
                  certificate.days_until_expiration !== undefined
                    ? certificate.days_until_expiration <= 0 ? 'text-red-600'
                      : certificate.days_until_expiration <= 30 ? 'text-yellow-600'
                      : 'text-green-600'
                    : ''
                }`}>
                  {new Date(certificate.date_expiration).toLocaleString()}
                  {certificate.days_until_expiration !== undefined && (
                    <span className="ml-2">
                      ({certificate.days_until_expiration <= 0 ? 'Expiré' : `${certificate.days_until_expiration} jours restants`})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Statut</p>
                <div className="mt-1">
                  <CertificateStatusBadge status={certificate.statut} />
                </div>
              </div>
            </div>
          </div>

          {/* PEM Certificate */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Certificat PEM</h2>
              <button
                onClick={() => copyToClipboard(certificate.certificat)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs font-mono text-gray-700 max-h-64 overflow-y-auto">
              {certificate.certificat}
            </pre>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {isAdmin && certificate.statut !== 'revoque' && certificate.statut !== 'expire' && (
                <button
                  onClick={handleRenew}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                  Renouveler le certificat
                </button>
              )}

              {isAdmin && certificate.statut !== 'revoque' && (
                <button
                  onClick={handleRevoke}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Révoquer le certificat
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleDownloadKey}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Télécharger la clé privée
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer le certificat
                </button>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations de statut</h3>
            <div className="space-y-3">
              {certificate.statut === 'actif' && certificate.days_until_expiration !== undefined && certificate.days_until_expiration <= 30 && certificate.days_until_expiration > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Ce certificat expire dans {certificate.days_until_expiration} jours. Envisagez de le renouveler bientôt.
                  </p>
                </div>
              )}
              {certificate.statut === 'expire' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    Ce certificat a expiré. Veuillez le renouveler immédiatement.
                  </p>
                </div>
              )}
              {certificate.statut === 'revoque' && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Ce certificat a été révoqué et n'est plus valide.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailsPage;
