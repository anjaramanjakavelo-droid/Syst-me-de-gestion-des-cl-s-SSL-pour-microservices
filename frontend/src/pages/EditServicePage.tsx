import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { Service } from '../types/service';
import * as serviceApi from '../api/services';

const EditServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceApi.getService(Number(id));
        setService(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Échec du chargement du service');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchService();
  }, [id]);

  const handleSubmit = async (data: { nom: string; description?: string }) => {
    setSaving(true);
    setError(null);
    try {
      await serviceApi.updateService(Number(id), data);
      navigate('/services');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0] as string[];
        setError(firstError?.[0] || 'Échec de la mise à jour du service');
      } else {
        setError(responseData?.message || 'Échec de la mise à jour du service');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Service non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le service</h1>
          <p className="text-gray-500 text-sm">Mettre à jour les informations du service</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ServiceForm
          initialData={{ nom: service.nom, description: service.description || undefined }}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Mettre à jour le service"
        />
      </div>
    </div>
  );
};

// Import the ServiceForm component
import ServiceForm from '../components/services/ServiceForm';

export default EditServicePage;
