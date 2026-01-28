'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
} from 'lucide-react';
import { getAllVisits, deleteVisit } from '@/lib/api';
import type { Visit, Patient, Profile } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import VisitFormModal from '@/components/admin/forms/VisitFormModal';

type VisitWithRelations = Visit & {
  patient: Patient;
  profile?: Profile;
};

export default function KunjunganPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitWithRelations[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitWithRelations | null>(null);
  const itemsPerPage = 10;


  const loadVisits = async () => {
    setLoading(true);
    const { data, error: _error } = await getAllVisits();
    if (data) {
      setVisits(data as VisitWithRelations[]);
    }
    setLoading(false);
  };

  const filterVisits = () => {
    let filtered = [...visits];

    // Search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((visit) =>
        visit.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.visit_date.includes(searchQuery)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((visit) => visit.patient.patient_type === typeFilter);
    }

    setFilteredVisits(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, searchQuery, typeFilter]);

  const handleDelete = async (id: string, patientName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data kunjungan "${patientName}"?`)) {
      return;
    }

    const { error } = await deleteVisit(id);
    if (!error) {
      alert('Data kunjungan berhasil dihapus');
      loadVisits();
    } else {
      alert('Gagal menghapus data kunjungan');
    }
  };

  const handleEdit = (visit: VisitWithRelations) => {
    setEditingVisit(visit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVisit(null);
  };

  const handleSuccess = () => {
    loadVisits();
    handleCloseModal();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPatientTypeBadge = (type: string) => {
    const badges = {
      bayi: 'bg-blue-50 text-blue-600',
      balita: 'bg-cyan-50 text-cyan-600',
      ibu_hamil: 'bg-pink-50 text-pink-600',
      remaja_dewasa: 'bg-purple-50 text-purple-600',
      lansia: 'bg-orange-50 text-orange-600',
    };

    const labels = {
      bayi: 'Bayi',
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      remaja_dewasa: 'Remaja/Dewasa',
      lansia: 'Lansia',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges] || 'bg-gray-50 text-gray-600'}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisits = filteredVisits.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunjungan</h1>
          <p className="text-gray-600 mt-1">Kelola data kunjungan pasien posyandu</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pasien, data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Add Button */}
          <Button
            variant="primary"
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            Catat Kunjungan
          </Button>
        </div>
      </Card>

      {/* Kunjungan Terbaru */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kunjungan Terbaru</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : currentVisits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Tidak ada data kunjungan</div>
          ) : (
            currentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Patient Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <UserCircle2 className="w-6 h-6 text-teal-600" />
                  </div>
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{visit.patient.full_name}</h3>
                    {getPatientTypeBadge(visit.patient.patient_type)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      📅 {formatDate(visit.visit_date)}
                    </span>
                    {visit.weight && (
                      <span>BB: {visit.weight} kg</span>
                    )}
                    {visit.height && (
                      <span>TB: {visit.height} cm</span>
                    )}
                    {visit.blood_pressure && (
                      <span>TD: {visit.blood_pressure}</span>
                    )}
                  </div>
                </div>

                {/* Petugas */}
                <div className="hidden md:block text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Petugas:</div>
                  <div className="font-medium">
                    {visit.profile?.full_name || 'Ibu Sari'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/kunjungan/${visit.id}`)}
                    className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(visit)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(visit.id, visit.patient.full_name)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredVisits.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredVisits.length)} dari{' '}
              {filteredVisits.length} kunjungan
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-teal-500 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Visit Form Modal */}
      {showModal && (
        <VisitFormModal
          visit={editingVisit}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
