'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getPatients, deletePatient, searchPatients, filterPatients } from '@/lib/api';
import type { Patient } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

export default function PasienPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    const { data, error } = await getPatients();
    if (data) {
      setPatients(data);
    }
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadPatients();
      return;
    }
    
    setLoading(true);
    const { data } = await searchPatients(query);
    if (data) {
      setPatients(data);
    }
    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    const filters: any = {};
    
    if (typeFilter !== 'all') {
      filters.type = typeFilter;
    }
    
    if (genderFilter !== 'all') {
      filters.gender = genderFilter;
    }
    
    if (Object.keys(filters).length === 0) {
      loadPatients();
    } else {
      const { data } = await filterPatients(filters);
      if (data) {
        setPatients(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    handleFilter();
  }, [typeFilter, genderFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data pasien "${name}"?`)) {
      return;
    }
    
    const { error } = await deletePatient(id);
    if (!error) {
      alert('Data pasien berhasil dihapus');
      loadPatients();
    } else {
      alert('Gagal menghapus data pasien');
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // For children under 2 years, show months
    if (age < 2) {
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + monthDiff;
      return `${months} bulan`;
    }
    
    return `${age} tahun`;
  };

  const getPatientTypeBadge = (type: string) => {
    const badges = {
      balita: 'bg-teal-50 text-teal-600',
      ibu_hamil: 'bg-orange-50 text-orange-600',
      lansia: 'bg-blue-50 text-blue-600',
    };
    
    const labels = {
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      lansia: 'Lansia',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const getGenderBadge = (gender: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
      }`}>
        {gender}
      </span>
    );
  };

  // Pagination
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = patients.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pasien..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="balita">Balita</option>
            <option value="ibu_hamil">Ibu Hamil</option>
            <option value="lansia">Lansia</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Status</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>

          {/* Add Button */}
          <Link href="/admin/pasien/tambah">
            <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Tambah Pasien
            </Button>
          </Link>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Lengkap</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NIK</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Umur</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">J/K</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipe</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Orang Tua</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Telepon</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : currentPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Tidak ada data pasien
                  </td>
                </tr>
              ) : (
                currentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{patient.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.nik ? `***${patient.nik.slice(-4)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {calculateAge(patient.date_of_birth)}
                    </td>
                    <td className="py-3 px-4">{getGenderBadge(patient.gender)}</td>
                    <td className="py-3 px-4">{getPatientTypeBadge(patient.patient_type)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.parent_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.phone || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/pasien/${patient.id}`)}
                          className="p-1 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/pasien/${patient.id}/edit`)}
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id, patient.full_name)}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && patients.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, patients.length)} dari {patients.length} pasien
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg ${
                      currentPage === page
                        ? 'bg-teal-500 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
