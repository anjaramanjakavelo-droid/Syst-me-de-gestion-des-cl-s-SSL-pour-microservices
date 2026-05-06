import { useState, useEffect } from 'react';
import { LayoutDashboard, Server, ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight, RefreshCw } from 'lucide-react';
import type { ExpirationSummary } from '../types/certificate';
import type { Service } from '../types/service';
import * as certificateApi from '../api/certificates';
import * as serviceApi from '../api/services';
import { useAuth } from '../store/authStore';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<ExpirationSummary | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expirationData, servicesData] = await Promise.all([
        certificateApi.checkExpiration(),
        serviceApi.listServices(),
      ]);
      setStats(expirationData);
      setServices(servicesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total des services',
      value: services.length,
      icon: Server,
      color: 'blue',
      link: '/services',
    },
    {
      title: 'Certificats actifs',
      value: stats?.active || 0,
      icon: ShieldCheck,
      color: 'green',
      link: '/certificates?status=actif',
    },
    {
      title: 'Expiration proche',
      value: stats?.expiring_soon || 0,
      icon: AlertTriangle,
      color: 'yellow',
      link: '/certificates?status=expiring_soon',
    },
    {
      title: 'Expirés',
      value: stats?.expired || 0,
      icon: AlertOctagon,
      color: 'red',
      link: '/certificates?status=expire',
    },
  ];

  const colorMap: Record<string, Record<string, string>> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: 'text-green-500' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', icon: 'text-yellow-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: 'text-red-500' },
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Aperçu de votre infrastructure de certificats SSL</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Alerts */}
      {(stats?.expired || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 slide-in">
          <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-800">
              {stats?.expired} certificat{stats?.expired !== 1 ? 's' : ''} expiré{stats?.expired !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-600">Action immédiate requise pour renouveler les certificats expirés.</p>
          </div>
          <Link to="/certificates?status=expire" className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
            Voir
          </Link>
        </div>
      )}

      {(stats?.expiring_soon || 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4 slide-in">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">
              {stats?.expiring_soon} certificat{stats?.expiring_soon !== 1 ? 's' : ''} expire{stats?.expiring_soon !== 1 ? 'nt' : ''} bientôt
            </p>
            <p className="text-sm text-yellow-600">Envisagez de renouveler les certificats qui expirent dans les 30 jours.</p>
          </div>
          <Link to="/certificates?status=expiring_soon" className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
            Voir
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const colors = colorMap[card.color];
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link} className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${colors.icon}`} />
                <ArrowRight className={`w-4 h-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className={`text-sm ${colors.text} mt-1`}>{card.title}</p>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution - Simple Bar Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">État des certificats</h3>
            <div className="space-y-4">
              {[
                { label: 'Actif', value: stats.active, color: 'bg-green-500', textColor: 'text-green-600' },
                { label: 'Expiration proche', value: stats.expiring_soon, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                { label: 'Expiré', value: stats.expired, color: 'bg-red-500', textColor: 'text-red-600' },
                { label: 'Révoqué', value: stats.revoked, color: 'bg-gray-500', textColor: 'text-gray-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                  <span className="flex-1 text-sm text-gray-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.textColor}`}>{item.value}</span>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
            <div className="space-y-3">
              {isAdmin && (
                <>
                  <Link to="/certificates/new" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 group-hover:underline">Créer un nouveau certificat</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
                  </Link>
                  <Link to="/services/new" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                    <Server className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 group-hover:underline">Ajouter un nouveau service</span>
                    <ArrowRight className="w-4 h-4 text-green-600 ml-auto" />
                  </Link>
                </>
              )}
              <Link to="/certificates" className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                <LayoutDashboard className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 group-hover:underline">Voir tous les certificats</span>
                <ArrowRight className="w-4 h-4 text-purple-600 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Services */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Services récents</h3>
          <Link to="/services" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {services.slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.nom}</p>
                  {service.description && (
                    <p className="text-xs text-gray-500">{service.description}</p>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500">{service.certificats_count || 0} certificat(s)</span>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-center text-gray-500 py-4">Aucun service trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
