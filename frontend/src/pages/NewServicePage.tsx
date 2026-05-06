import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import * as serviceApi from '../api/services';

const NewServicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: { nom: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await serviceApi.createService(data);
      setSuccess(true);
      setTimeout(() => navigate('/services'), 1500);
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0] as string[];
        setError(firstError?.[0] || 'Échec de la création du service');
      } else {
        setError(responseData?.message || 'Échec de la création du service');
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
          <p className="text-gray-700 font-medium">Service créé avec succès !</p>
          <p className="text-gray-500 text-sm mt-1">Redirection...</p>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Nouveau service</h1>
          <p className="text-gray-500 text-sm">Ajouter un nouveau microservice au système</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ServiceForm onSubmit={handleSubmit} loading={loading} submitLabel="Créer le service" />
      </div>
    </div>
  );
};

// Import the ServiceForm component
import ServiceForm from '../components/services/ServiceForm';

export default NewServicePage;
