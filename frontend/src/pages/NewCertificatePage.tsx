import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import type { Service } from '../types/service';
import * as serviceApi from '../api/services';
import * as certificateApi from '../api/certificates';

const NewCertificatePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [serviceId, setServiceId] = useState('');
  const [domain, setDomain] = useState('');
  const [days, setDays] = useState(365);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.listServices();
        setServices(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Échec du chargement des services');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await certificateApi.createCertificate({
        service_id: Number(serviceId),
        domain,
        days,
      });
      setSuccess(true);
      setTimeout(() => navigate('/certificates'), 1500);
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0] as string[];
        setError(firstError?.[0] || 'Échec de la création du certificat');
      } else {
        setError(responseData?.message || 'Échec de la création du certificat');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-64 fade-in">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Certificat créé avec succès !</p>
          <p className="text-gray-500 text-sm mt-1">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau certificat</h1>
          <p className="text-gray-500 text-sm">Générer un nouveau certificat SSL pour un domaine</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {loadingServices ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <select
                id="service"
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Sélectionner un service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de domaine *
              </label>
              <input
                id="domain"
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex : api.exemple.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                Valide pour (jours) *
              </label>
              <input
                id="days"
                type="number"
                required
                min={1}
                max={3650}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Période de validité du certificat (1 à 3650 jours)</p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !serviceId || !domain}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Générer le certificat
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewCertificatePage;
