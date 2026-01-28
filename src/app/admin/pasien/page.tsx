'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { deletePatient } from '@/lib/api';
import type { Patient } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import { PatientTypeBadge, GenderBadge } from '@/components/admin/ui/PatientBadge';
import Pagination from '@/components/admin/ui/Pagination';
import SearchFilterBar from '@/components/admin/ui/SearchFilterBar';
import ExportImportActions from '@/components/admin/ui/ExportImportActions';
import { 
  calculateAge, 
  getPatientTypeLabel, 
  maskNIK,
  formatGender
} from '@/lib/patientUtils';
import { parsePatientExcel, exportToExcel } from '@/lib/excelUtils';
import { generatePrintHTML, printHTML } from '@/lib/printUtils';

export default function PasienPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPatients({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPatients = async (opts?: { page?: number; q?: string; type?: string; gender?: string }) => {
    const page = opts?.page ?? currentPage;
    const q = (opts?.q ?? searchQuery).trim();
    const type = (opts?.type ?? typeFilter).trim();
    const gender = (opts?.gender ?? genderFilter).trim();

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(itemsPerPage),
        sort: 'created_at',
        dir: 'desc',
      });
      if (q) params.set('q', q);
      if (type && type !== 'all') params.set('type', type);
      if (gender && gender !== 'all') params.set('gender', gender);

      const res = await fetch(`/api/patients?${params.toString()}`);
      const json = (await res.json()) as {
        data: Patient[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };

      if (!res.ok) {
        console.error('Failed to fetch patients:', json);
        setPatients([]);
        setTotal(0);
        return;
      }

      setPatients(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setCurrentPage(1);
      loadPatients({ page: 1 });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, genderFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPatients({ page });
  };

  const fetchAllFilteredPatients = async () => {
    const q = searchQuery.trim();
    const type = typeFilter.trim();
    const gender = genderFilter.trim();
    const maxRows = 5000;

    let page = 1;
    const limit = 200;
    let all: Patient[] = [];
    let totalItems: number | null = null;

    while (true) {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: 'created_at',
        dir: 'desc',
      });
      if (q) params.set('q', q);
      if (type && type !== 'all') params.set('type', type);
      if (gender && gender !== 'all') params.set('gender', gender);

      const res = await fetch(`/api/patients?${params.toString()}`);
      const json = (await res.json()) as {
        data: Patient[];
        total: number;
      };

      if (!res.ok) throw new Error((json as unknown as { error?: string }).error || 'Gagal memuat data');

      const chunk = json.data ?? [];
      totalItems = totalItems ?? (json.total ?? 0);
      all = all.concat(chunk);

      if (all.length >= (totalItems ?? 0)) break;
      if (chunk.length === 0) break;
      if (all.length >= maxRows) break;
      page += 1;
    }

    return all;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data pasien "${name}"?`)) {
      return;
    }
    
    const { error } = await deletePatient(id);
    if (!error) {
      alert('Data pasien berhasil dihapus');
      loadPatients({ page: 1 });
      setCurrentPage(1);
    } else {
      alert('Gagal menghapus data pasien');
    }
  };

  const handleExport = () => {
    (async () => {
      try {
        const allPatients = await fetchAllFilteredPatients();
        const exportData = allPatients.map((patient) => ({
          'Nama Lengkap': patient.full_name,
          'NIK': patient.nik || '-',
          'Umur': calculateAge(patient.date_of_birth),
          'J/K': formatGender(patient.gender),
          'Tipe': getPatientTypeLabel(patient.patient_type),
          'Orang Tua': patient.parent_name || '-',
          'Telepon': patient.phone || '-',
        }));

        exportToExcel(exportData, 'Data_Pasien', 'Data Pasien');
      } catch (error) {
        console.error('Error exporting:', error);
        alert(error instanceof Error ? error.message : 'Gagal mengekspor data');
      }
    })();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const { validData, invalidRows } = parsePatientExcel(data);

        if (validData.length === 0) {
          alert('Tidak ada data valid untuk diimpor. Pastikan semua kolom required terisi.');
          return;
        }

        // Show confirmation
        let confirmMessage = `Ditemukan ${validData.length} data valid`;
        if (invalidRows.length > 0) {
          confirmMessage += `\n${invalidRows.length} baris diabaikan (baris: ${invalidRows.join(', ')})`;
        }
        confirmMessage += '\n\nLanjutkan import?';

        if (!confirm(confirmMessage)) {
          return;
        }

        // Send to API
        setLoading(true);
        const response = await fetch('/api/patients/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patients: validData }),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message || `Berhasil mengimpor ${validData.length} pasien`);
          await loadPatients({ page: 1 });
          setCurrentPage(1);
        } else {
          throw new Error(result.error || 'Gagal mengimpor data');
        }
        
      } catch (error) {
        console.error('Error importing:', error);
        alert(error instanceof Error ? error.message : 'Gagal mengimpor data. Pastikan format file sesuai.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrint = () => {
    (async () => {
      try {
        const allPatients = await fetchAllFilteredPatients();
        const headers = ['No', 'Nama Lengkap', 'NIK', 'Umur', 'J/K', 'Tipe', 'Orang Tua', 'Telepon'];
        const rows = allPatients.map((patient, index) => [
          String(index + 1),
          patient.full_name,
          patient.nik || '-',
          calculateAge(patient.date_of_birth),
          formatGender(patient.gender),
          getPatientTypeLabel(patient.patient_type),
          patient.parent_name || '-',
          patient.phone || '-',
        ]);

        const html = generatePrintHTML(headers, rows, {
          title: 'Data Pasien Posyandu',
          subtitle: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          orientation: 'landscape',
        });

        printHTML(html);
      } catch (error) {
        console.error('Error printing:', error);
        alert(error instanceof Error ? error.message : 'Gagal mencetak data');
      }
    })();
  };

  // Pagination (server-side)
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = total === 0 ? 0 : startIndex + patients.length;
  const currentPatients = patients;

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
        <ExportImportActions
          onExport={handleExport}
          onImport={handleImport}
          onPrint={handlePrint}
        />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
        >
          <Link href="/admin/pasien/tambah">
            <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Tambah Pasien
            </Button>
          </Link>
        </SearchFilterBar>
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
                      {maskNIK(patient.nik)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {calculateAge(patient.date_of_birth)}
                    </td>
                    <td className="py-3 px-4"><GenderBadge gender={patient.gender} /></td>
                    <td className="py-3 px-4"><PatientTypeBadge type={patient.patient_type} /></td>
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
        {!loading && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </Card>
    </div>
  );
}
