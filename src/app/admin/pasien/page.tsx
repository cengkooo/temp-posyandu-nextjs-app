'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Printer,
} from 'lucide-react';
import { getPatients, deletePatient, searchPatients, filterPatients } from '@/lib/api';
import type { Patient } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

export default function PasienPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleExport = () => {
    try {
      const exportData = patients.map(patient => ({
        'Nama Lengkap': patient.full_name,
        'NIK': patient.nik || '-',
        'Umur': calculateAge(patient.date_of_birth),
        'J/K': patient.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tipe': getPatientTypeLabel(patient.patient_type),
        'Orang Tua': patient.parent_name || '-',
        'Telepon': patient.phone || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Pasien');

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Data_Pasien_${date}.xlsx`);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Gagal mengekspor data');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and process data
        const validData: any[] = [];
        const invalidRows: number[] = [];
        
        for (let i = 0; i < (jsonData as any[]).length; i++) {
          const row = (jsonData as any[])[i];
          
          // Validate required fields
          if (row['Nama Lengkap'] && row['NIK'] && row['Tipe'] && row['Umur'] && row['J/K']) {
            validData.push({
              full_name: row['Nama Lengkap'],
              nik: row['NIK'],
              date_of_birth: calculateDateOfBirth(row['Umur']),
              gender: row['J/K'] === 'Laki-laki' ? 'L' : 'P',
              patient_type: getPatientTypeFromLabel(row['Tipe']),
              parent_name: row['Orang Tua'] && row['Orang Tua'] !== '-' ? row['Orang Tua'] : null,
              phone: row['Telepon'] && row['Telepon'] !== '-' ? row['Telepon'] : null,
              address: null,
            });
          } else {
            invalidRows.push(i + 2); // +2 because Excel rows start at 1 and has header
          }
        }

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
          await loadPatients(); // Reload data
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
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Data Pasien - Posyandu</title>
          <style>
            @media print {
              @page { 
                size: A4 landscape;
                margin: 1.5cm; 
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              color: #0d9488;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #0d9488;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Data Pasien Posyandu</h1>
          <div class="subtitle">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>NIK</th>
                <th>Umur</th>
                <th>J/K</th>
                <th>Tipe</th>
                <th>Orang Tua</th>
                <th>Telepon</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map((patient, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${patient.full_name}</td>
                  <td>${patient.nik || '-'}</td>
                  <td>${calculateAge(patient.date_of_birth)}</td>
                  <td>${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td>${getPatientTypeLabel(patient.patient_type)}</td>
                  <td>${patient.parent_name || '-'}</td>
                  <td>${patient.phone || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <p>Total Pasien: ${patients.length}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getPatientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bayi: 'Bayi',
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      remaja_dewasa: 'Remaja/Dewasa',
      lansia: 'Lansia',
    };
    return labels[type] || type;
  };

  const getPatientTypeFromLabel = (label: string) => {
    const types: Record<string, string> = {
      'Bayi': 'bayi',
      'Balita': 'balita',
      'Ibu Hamil': 'ibu_hamil',
      'Remaja/Dewasa': 'remaja_dewasa',
      'Lansia': 'lansia',
    };
    return types[label] || 'balita';
  };

  const calculateDateOfBirth = (ageString: string) => {
    // Simple calculation - convert age to approximate date of birth
    const today = new Date();
    if (ageString.includes('bulan')) {
      const months = parseInt(ageString);
      today.setMonth(today.getMonth() - months);
    } else {
      const years = parseInt(ageString);
      today.setFullYear(today.getFullYear() - years);
    }
    return today.toISOString().split('T')[0];
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
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Ekspor
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Impor
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
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
