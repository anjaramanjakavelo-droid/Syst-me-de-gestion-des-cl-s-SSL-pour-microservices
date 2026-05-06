import type { CertificateStatus, CertificateFilters as FilterType } from '../../types/certificate';
import type { Service } from '../../types/service';
import { Search, Filter, X } from 'lucide-react';

interface CertificateFiltersProps {
  filters: FilterType;
  services: Service[];
  onFilterChange: (filters: FilterType) => void;
}

const statusOptions: { value: CertificateStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actif' },
  { value: 'expiring_soon', label: 'Expiration proche' },
  { value: 'expire', label: 'Expiré' },
  { value: 'revoque', label: 'Révoqué' },
];

const CertificateFilters = ({ filters, services, onFilterChange }: CertificateFiltersProps) => {
  const hasActiveFilters = filters.statut || filters.service_id || filters.search;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par domaine..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filters.statut || ''}
          onChange={(e) => onFilterChange({ ...filters, statut: e.target.value as CertificateStatus || undefined })}
          className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Service Filter */}
      <select
        value={filters.service_id || ''}
        onChange={(e) => onFilterChange({ ...filters, service_id: e.target.value ? Number(e.target.value) : undefined })}
        className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="">Tous les services</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.nom}</option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => onFilterChange({})}
          className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Effacer
        </button>
      )}
    </div>
  );
};

export default CertificateFilters;
