import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
  genderFilter?: string;
  onGenderFilterChange?: (gender: string) => void;
  children?: React.ReactNode;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  genderFilter,
  onGenderFilterChange,
  children,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama pasien..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Type Filter */}
      {onTypeFilterChange && (
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">Semua Tipe</option>
          <option value="bayi">Bayi</option>
          <option value="balita">Balita</option>
          <option value="ibu_hamil">Ibu Hamil</option>
          <option value="remaja_dewasa">Remaja/Dewasa</option>
          <option value="lansia">Lansia</option>
        </select>
      )}

      {/* Gender Filter */}
      {onGenderFilterChange && (
        <select
          value={genderFilter}
          onChange={(e) => onGenderFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">Semua Status</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      )}

      {/* Additional Actions (e.g., Add Button) */}
      {children}
    </div>
  );
};

export default SearchFilterBar;
