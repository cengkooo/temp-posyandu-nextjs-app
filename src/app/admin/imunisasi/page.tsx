'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Syringe,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Baby,
  ChevronRight,
  Download,
  Printer,
  Eye,
  Loader2,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';
import { getImmunizationTracking, getImmunizationCoverage, deleteImmunization } from '@/lib/immunizationApi';

// Types
interface PatientImmunization {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_type: 'bayi' | 'balita';
  date_of_birth: string;
  age_months: number;
  completed: number;
  total: number;
  nextDue: string | null;
  nextVaccine: string | null;
  status: 'complete' | 'on_track' | 'overdue';
}

interface ImmunizationRecord {
  id: string;
  vaccine_name: string;
  vaccine_date: string;
  batch_number: string;
  administered_by: string;
  notes: string;
}

interface VaccineSchedule {
  vaccine: string;
  target_age: string;
  description: string;
}

// Vaccine schedule data
const vaccineSchedule: VaccineSchedule[] = [
  { vaccine: 'Hepatitis B (HB0)', target_age: '0-24 jam', description: 'Dosis pertama segera setelah lahir' },
  { vaccine: 'BCG', target_age: '0-1 bulan', description: 'Tuberkulosis' },
  { vaccine: 'Polio 1 (OPV)', target_age: '1 bulan', description: 'Polio oral' },
  { vaccine: 'DPT-HB-Hib 1', target_age: '2 bulan', description: 'Difteri, Pertusis, Tetanus, Hep B, Hib' },
  { vaccine: 'Polio 2 (OPV)', target_age: '2 bulan', description: 'Polio oral' },
  { vaccine: 'DPT-HB-Hib 2', target_age: '3 bulan', description: 'Difteri, Pertusis, Tetanus, Hep B, Hib' },
  { vaccine: 'Polio 3 (OPV)', target_age: '3 bulan', description: 'Polio oral' },
  { vaccine: 'DPT-HB-Hib 3', target_age: '4 bulan', description: 'Difteri, Pertusis, Tetanus, Hep B, Hib' },
  { vaccine: 'Polio 4 (OPV)', target_age: '4 bulan', description: 'Polio oral' },
  { vaccine: 'IPV', target_age: '4 bulan', description: 'Polio suntik' },
  { vaccine: 'Campak/MR', target_age: '9 bulan', description: 'Campak dan Rubella' },
  { vaccine: 'DPT-HB-Hib (Booster)', target_age: '18 bulan', description: 'Booster' },
  { vaccine: 'Campak/MR (Booster)', target_age: '18 bulan', description: 'Booster' },
];

// Mock data for patients immunization tracking
const mockPatients: PatientImmunization[] = [
  {
    id: '1',
    patient_id: 'P001',
    patient_name: 'Ahmad Rizky',
    patient_type: 'balita',
    date_of_birth: '2023-06-15',
    age_months: 19,
    completed: 10,
    total: 13,
    nextDue: '2025-01-15',
    nextVaccine: 'Campak/MR (Booster)',
    status: 'on_track',
  },
  {
    id: '2',
    patient_id: 'P002',
    patient_name: 'Siti Fatimah',
    patient_type: 'bayi',
    date_of_birth: '2024-03-20',
    age_months: 10,
    completed: 8,
    total: 13,
    nextDue: '2024-12-20',
    nextVaccine: 'Campak/MR',
    status: 'overdue',
  },
  {
    id: '3',
    patient_id: 'P003',
    patient_name: 'Muhammad Fauzi',
    patient_type: 'bayi',
    date_of_birth: '2024-08-10',
    age_months: 5,
    completed: 6,
    total: 13,
    nextDue: '2025-02-10',
    nextVaccine: 'DPT-HB-Hib 3',
    status: 'on_track',
  },
  {
    id: '4',
    patient_id: 'P004',
    patient_name: 'Aisyah Putri',
    patient_type: 'balita',
    date_of_birth: '2022-11-05',
    age_months: 26,
    completed: 13,
    total: 13,
    nextDue: null,
    nextVaccine: null,
    status: 'complete',
  },
  {
    id: '5',
    patient_id: 'P005',
    patient_name: 'Budi Santoso',
    patient_type: 'bayi',
    date_of_birth: '2024-06-25',
    age_months: 7,
    completed: 7,
    total: 13,
    nextDue: '2025-01-25',
    nextVaccine: 'IPV',
    status: 'on_track',
  },
];

// Mock coverage data
const coverageData = [
  { vaccine: 'HB0', target: 200, actual: 195, percentage: 97.5 },
  { vaccine: 'BCG', target: 200, actual: 188, percentage: 94.0 },
  { vaccine: 'Polio 1', target: 200, actual: 192, percentage: 96.0 },
  { vaccine: 'DPT-HB-Hib 1', target: 180, actual: 172, percentage: 95.6 },
  { vaccine: 'Polio 2', target: 180, actual: 168, percentage: 93.3 },
  { vaccine: 'DPT-HB-Hib 2', target: 160, actual: 148, percentage: 92.5 },
  { vaccine: 'Polio 3', target: 160, actual: 145, percentage: 90.6 },
  { vaccine: 'DPT-HB-Hib 3', target: 140, actual: 125, percentage: 89.3 },
  { vaccine: 'Polio 4', target: 140, actual: 118, percentage: 84.3 },
  { vaccine: 'IPV', target: 140, actual: 130, percentage: 92.9 },
  { vaccine: 'Campak/MR', target: 120, actual: 102, percentage: 85.0 },
];

const tabs: Tab[] = [
  { id: 'tracking', label: 'Tracking Imunisasi', icon: <Syringe className="w-4 h-4" /> },
  { id: 'coverage', label: 'Cakupan', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'schedule', label: 'Jadwal Imunisasi', icon: <Calendar className="w-4 h-4" /> },
];

export default function ImunisasiPage() {
  const [activeTab, setActiveTab] = useState('tracking');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'on_track' | 'overdue'>('all');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientImmunization | null>(null);
  const [showSelectPatientModal, setShowSelectPatientModal] = useState(false);
  
  // State for data from database
  const [patients, setPatients] = useState<PatientImmunization[]>([]);
  const [summary, setSummary] = useState({ complete: 0, on_track: 0, overdue: 0, total: 0 });
  const [coverageData, setCoverageData] = useState<any[]>([]);
  const [overallCoverage, setOverallCoverage] = useState<any>({ percentage: 0, complete: 0, total: 0, target: 95 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    vaccine_name: '',
    vaccine_date: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

  // Fetch tracking data
  useEffect(() => {
    if (activeTab === 'tracking') {
      fetchTrackingData();
    } else if (activeTab === 'coverage') {
      fetchCoverageData();
    }
  }, [activeTab]);

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getImmunizationTracking();
      setPatients(result.data || []);
      setSummary(result.summary || { complete: 0, on_track: 0, overdue: 0, total: 0 });
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data tracking imunisasi';
      setError(errorMessage);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoverageData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getImmunizationCoverage();
      setCoverageData(result.coverage || []);
      setOverallCoverage(result.overall || { percentage: 0, complete: 0, total: 0, target: 95 });
    } catch (err) {
      console.error('Error fetching coverage data:', err);
      setError('Gagal memuat data coverage imunisasi');
      setCoverageData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitImmunization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) return;
    
    // Validasi
    if (!formData.vaccine_name || !formData.vaccine_date) {
      alert('Jenis vaksin dan tanggal pemberian wajib diisi!');
      return;
    }

    try {
      setIsSaving(true);
      
      const url = editingRecord 
        ? '/api/immunizations' 
        : '/api/immunizations';
      
      const method = editingRecord ? 'PUT' : 'POST';
      
      const body = editingRecord 
        ? {
            id: editingRecord.id,
            patient_id: selectedPatient.patient_id,
            vaccine_name: formData.vaccine_name,
            vaccine_date: formData.vaccine_date,
            notes: formData.notes || null,
          }
        : {
            patient_id: selectedPatient.patient_id,
            vaccine_name: formData.vaccine_name,
            vaccine_date: formData.vaccine_date,
            notes: formData.notes || null,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data imunisasi');
      }

      // Reset form dan tutup modal
      setFormData({
        vaccine_name: '',
        vaccine_date: '',
        notes: '',
      });
      setEditingRecord(null);
      setShowRecordModal(false);
      
      // Refresh data
      fetchTrackingData();
      if (selectedPatient) {
        fetchPatientHistory(selectedPatient.patient_id);
      }
      
      alert(editingRecord ? 'Data imunisasi berhasil diupdate!' : 'Data imunisasi berhasil disimpan!');
    } catch (err) {
      console.error('Error saving immunization:', err);
      alert('Gagal menyimpan data imunisasi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchPatientHistory = async (patientId: string) => {
    try {
      const response = await fetch(`/api/immunizations?patient_id=${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient history');
      }
      const result = await response.json();
      setPatientHistory(result.data || []);
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setPatientHistory([]);
    }
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setFormData({
      vaccine_name: record.vaccine_name,
      vaccine_date: record.vaccine_date,
      notes: record.notes || '',
    });
    setShowRecordModal(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data imunisasi ini?')) {
      return;
    }

    try {
      await deleteImmunization(recordId);
      alert('Data imunisasi berhasil dihapus!');
      
      // Refresh patient history
      if (selectedPatient) {
        await fetchPatientHistory(selectedPatient.patient_id);
      }
      
      // Refresh tracking data
      await fetchTrackingData();
    } catch (error) {
      console.error('Error deleting immunization:', error);
      alert('Gagal menghapus data imunisasi');
    }
  };

  const handleExportExcel = async () => {
    try {
      // Vaccine list in order
      const vaccineList = [
        'Hepatitis B (HB0)',
        'BCG',
        'Polio 1',
        'DPT-HB-Hib 1',
        'Polio 2',
        'DPT-HB-Hib 2',
        'Polio 3',
        'DPT-HB-Hib 3',
        'Polio 4',
        'IPV',
        'Campak/MR',
        'DPT-HB-Hib Booster',
        'Campak/MR Booster'
      ];

      // Get all patients immunization data
      const exportData = await Promise.all(
        patients.map(async (patient) => {
          const response = await fetch(`/api/immunizations?patient_id=${patient.patient_id}`);
          const result = await response.json();
          const immunizations = result.data || [];
          
          // Create vaccine status object
          const vaccineStatus: any = {};
          vaccineList.forEach(vaccine => {
            const hasVaccine = immunizations.some((imm: any) => imm.vaccine_name === vaccine);
            vaccineStatus[vaccine] = hasVaccine ? 'Sudah' : 'Belum';
          });

          return {
            'Nama': patient.patient_name,
            'Tanggal Lahir': new Date(patient.date_of_birth).toLocaleDateString('id-ID'),
            'Usia (bulan)': patient.age_months,
            'Jenis': patient.patient_type === 'bayi' ? 'Bayi' : 'Balita',
            'Status': patient.status === 'complete' ? 'Lengkap' : 
                      patient.status === 'on_track' ? 'Sesuai Jadwal' : 'Terlambat',
            'Progress': `${patient.completed}/${patient.total}`,
            ...vaccineStatus
          };
        })
      );

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tracking Imunisasi');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `Tracking_Imunisasi_${date}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor data ke Excel');
    }
  };

  const handlePrint = async () => {
    try {
      // Vaccine list in order
      const vaccineList = [
        'Hepatitis B (HB0)',
        'BCG',
        'Polio 1',
        'DPT-HB-Hib 1',
        'Polio 2',
        'DPT-HB-Hib 2',
        'Polio 3',
        'DPT-HB-Hib 3',
        'Polio 4',
        'IPV',
        'Campak/MR',
        'DPT-HB-Hib Booster',
        'Campak/MR Booster'
      ];

      // Get all patients immunization data
      const printData = await Promise.all(
        patients.map(async (patient) => {
          const response = await fetch(`/api/immunizations?patient_id=${patient.patient_id}`);
          const result = await response.json();
          const immunizations = result.data || [];
          
          // Create vaccine status object
          const vaccineStatus: { [key: string]: string } = {};
          vaccineList.forEach(vaccine => {
            const hasVaccine = immunizations.some((imm: any) => imm.vaccine_name === vaccine);
            vaccineStatus[vaccine] = hasVaccine ? 'Sudah' : 'Belum';
          });

          return {
            patient,
            vaccineStatus
          };
        })
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tracking Imunisasi - Posyandu</title>
            <style>
              @media print {
                @page { 
                  size: landscape;
                  margin: 1cm; 
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
                font-size: 9px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 6px 4px;
                text-align: center;
              }
              th {
                background-color: #0d9488;
                color: white;
                font-weight: bold;
                font-size: 8px;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .summary {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f0fdfa;
                border-left: 4px solid #0d9488;
              }
              .summary-item {
                display: inline-block;
                margin-right: 30px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .status-sudah {
                color: #059669;
                font-weight: bold;
              }
              .status-belum {
                color: #dc2626;
              }
            </style>
          </head>
          <body>
            <h1>Laporan Tracking Imunisasi</h1>
            <div class="subtitle">Posyandu - ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            
            <div class="summary">
              <div class="summary-item"><strong>Total Anak:</strong> ${summary.total}</div>
              <div class="summary-item"><strong>Lengkap:</strong> ${summary.complete}</div>
              <div class="summary-item"><strong>Sesuai Jadwal:</strong> ${summary.on_track}</div>
              <div class="summary-item"><strong>Terlambat:</strong> ${summary.overdue}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th rowspan="2">Nama</th>
                  <th rowspan="2">Tanggal<br/>Lahir</th>
                  <th rowspan="2">Usia<br/>(bulan)</th>
                  <th rowspan="2">Jenis</th>
                  <th rowspan="2">Status</th>
                  <th rowspan="2">Progress</th>
                  <th colspan="13">Vaksin</th>
                </tr>
                <tr>
                  ${vaccineList.map(vaccine => `<th>${vaccine}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${printData.map(({ patient, vaccineStatus }) => `
                  <tr>
                    <td style="text-align: left;">${patient.patient_name}</td>
                    <td>${new Date(patient.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td>${patient.age_months}</td>
                    <td>${patient.patient_type === 'bayi' ? 'Bayi' : 'Balita'}</td>
                    <td>${patient.status === 'complete' ? 'Lengkap' : patient.status === 'on_track' ? 'Sesuai Jadwal' : 'Terlambat'}</td>
                    <td>${patient.completed}/${patient.total}</td>
                    ${vaccineList.map(vaccine => 
                      `<td class="${vaccineStatus[vaccine] === 'Sudah' ? 'status-sudah' : 'status-belum'}">${vaccineStatus[vaccine]}</td>`
                    ).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
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
    } catch (error) {
      console.error('Error printing:', error);
      alert('Gagal mencetak data');
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" /> Lengkap
          </span>
        );
      case 'on_track':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" /> Sesuai Jadwal
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" /> Terlambat
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderTrackingTab = () => (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={fetchTrackingData}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100" padding="sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {summary.complete}
                  </p>
                  <p className="text-xs text-green-600">Imunisasi Lengkap</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100" padding="sm">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {summary.on_track}
                  </p>
                  <p className="text-xs text-blue-600">Sesuai Jadwal</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100" padding="sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {summary.overdue}
                  </p>
                  <p className="text-xs text-red-600">Terlambat</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100" padding="sm">
              <div className="flex items-center gap-3">
                <Baby className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="text-2xl font-bold text-teal-700">{summary.total}</p>
                  <p className="text-xs text-teal-600">Total Anak</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama anak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Status</option>
                <option value="complete">Lengkap</option>
                <option value="on_track">Sesuai Jadwal</option>
                <option value="overdue">Terlambat</option>
              </select>
            </div>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={() => setShowSelectPatientModal(true)}
            >
              <Plus className="w-4 h-4" />
              Catat Imunisasi
            </Button>
          </div>

          {/* Patient List */}
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      patient.patient_type === 'bayi' ? 'bg-blue-100' : 'bg-cyan-100'
                    }`}>
                      <Baby className={`w-6 h-6 ${
                        patient.patient_type === 'bayi' ? 'text-blue-600' : 'text-cyan-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{patient.patient_name}</h3>
                        {getStatusBadge(patient.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {patient.age_months} bulan • {patient.patient_type === 'bayi' ? 'Bayi' : 'Balita'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Progress */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              patient.status === 'complete'
                                ? 'bg-green-500'
                                : patient.status === 'overdue'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${(patient.completed / patient.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {patient.completed}/{patient.total}
                        </span>
                      </div>
                      {patient.nextVaccine && (
                        <p className="text-xs text-gray-500 mt-1">
                          Berikutnya: {patient.nextVaccine}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          fetchPatientHistory(patient.patient_id);
                        }}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowRecordModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Catat Imunisasi"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada data yang sesuai filter</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCoverageTab = () => (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={fetchCoverageData}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Overall Coverage */}
          <Card className="bg-gradient-to-r from-teal-500 to-emerald-500">
            <div className="text-white">
              <p className="text-sm opacity-80">Cakupan Imunisasi Dasar Lengkap (IDL)</p>
              <p className="text-4xl font-bold mt-1">{overallCoverage.percentage}%</p>
              <p className="text-sm mt-2 opacity-80">Target UCI (Universal Child Immunization): {overallCoverage.target}%</p>
              <p className="text-sm mt-1 opacity-80">{overallCoverage.complete} dari {overallCoverage.total} anak</p>
              <div className="mt-4 w-full bg-white/30 rounded-full h-3">
                <div className="bg-white h-3 rounded-full" style={{ width: `${Math.min(overallCoverage.percentage, 100)}%` }} />
              </div>
            </div>
          </Card>

          {/* Coverage by Vaccine */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cakupan per Jenis Vaksin</h3>
            </div>

            {coverageData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada data cakupan imunisasi</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {coverageData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.vaccine}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {item.actual}/{item.target}
                          </span>
                          <span className={`text-sm font-semibold ${
                            item.percentage >= 95 ? 'text-green-600' :
                            item.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            item.percentage >= 95 ? 'bg-green-500' :
                            item.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>≥95% (Tercapai)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>80-94% (Hampir)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>&lt;80% (Perlu Perhatian)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jadwal Imunisasi Dasar Lengkap</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vaksin</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usia Target</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {vaccineSchedule.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-medium text-gray-900">{item.vaccine}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                      {item.target_age}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Catatan Penting</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Imunisasi dasar lengkap wajib diberikan sebelum anak berusia 1 tahun</li>
              <li>• Jika terlambat, segera berikan imunisasi catch-up</li>
              <li>• Vaksin dapat diberikan bersamaan di lokasi berbeda</li>
              <li>• Catat batch number dan tanggal kadaluarsa vaksin</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Imunisasi</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau imunisasi anak</p>
      </div>

      {/* Tabs */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'tracking' && renderTrackingTab()}
          {activeTab === 'coverage' && renderCoverageTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
        </div>
      </Card>

      {/* Detail Patient Modal */}
      {selectedPatient && !showRecordModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detail Imunisasi</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedPatient.patient_name}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientHistory([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-400">&times;</span>
                </button>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Nama</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Usia</p>
                  <p className="font-medium text-gray-900">{selectedPatient.age_months} bulan</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal Lahir</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedPatient.date_of_birth).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Progress</p>
                  <p className="font-medium text-gray-900">
                    {selectedPatient.completed}/{selectedPatient.total} ({Math.round((selectedPatient.completed / selectedPatient.total) * 100)}%)
                  </p>
                </div>
              </div>

              {/* Vaccine List */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Riwayat Imunisasi</h3>
                {patientHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">
                    Belum ada data imunisasi untuk pasien ini
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientHistory.map((record, index) => (
                      <div key={record.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{record.vaccine_name}</span>
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                                #{index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(record.vaccine_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                            {record.notes && (
                              <p className="text-xs text-gray-600 mt-1 italic">{record.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedPatient(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setShowRecordModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Catat Imunisasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Patient Modal */}
      {showSelectPatientModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pilih Pasien</h2>
                  <p className="text-sm text-gray-600 mt-1">Pilih pasien untuk mencatat imunisasi</p>
                </div>
                <button
                  onClick={() => setShowSelectPatientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-400">&times;</span>
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama pasien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowSelectPatientModal(false);
                      setShowRecordModal(true);
                    }}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.patient_type === 'bayi' ? 'bg-blue-100' : 'bg-cyan-100'
                        }`}>
                          <Baby className={`w-5 h-5 ${
                            patient.patient_type === 'bayi' ? 'text-blue-600' : 'text-cyan-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.patient_name}</h3>
                          <p className="text-sm text-gray-500">
                            {patient.age_months} bulan • {patient.patient_type === 'bayi' ? 'Bayi' : 'Balita'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {patient.completed}/{patient.total}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((patient.completed / patient.total) * 100)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Baby className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada pasien ditemukan</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowSelectPatientModal(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Immunization Modal */}
      {showRecordModal && selectedPatient && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRecord ? 'Edit Imunisasi' : 'Catat Imunisasi'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedPatient.patient_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRecordModal(false);
                    setEditingRecord(null);
                    setFormData({
                      vaccine_name: '',
                      vaccine_date: '',
                      notes: '',
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-400">&times;</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitImmunization} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Vaksin *
                  </label>
                  <select 
                    value={formData.vaccine_name}
                    onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Pilih Vaksin</option>
                    <option value="Hepatitis B (HB0)">Hepatitis B (HB0)</option>
                    <option value="BCG">BCG</option>
                    <option value="Polio 1">Polio 1</option>
                    <option value="DPT-HB-Hib 1">DPT-HB-Hib 1</option>
                    <option value="Polio 2">Polio 2</option>
                    <option value="DPT-HB-Hib 2">DPT-HB-Hib 2</option>
                    <option value="Polio 3">Polio 3</option>
                    <option value="DPT-HB-Hib 3">DPT-HB-Hib 3</option>
                    <option value="Polio 4">Polio 4</option>
                    <option value="IPV">IPV</option>
                    <option value="Campak/MR">Campak/MR</option>
                    <option value="DPT-HB-Hib Booster">DPT-HB-Hib Booster</option>
                    <option value="Campak/MR Booster">Campak/MR Booster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pemberian *
                  </label>
                  <input
                    type="date"
                    value={formData.vaccine_date}
                    onChange={(e) => setFormData({ ...formData, vaccine_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Tambahkan catatan (opsional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowRecordModal(false);
                      setSelectedPatient(null);
                      setFormData({
                        vaccine_name: '',
                        vaccine_date: '',
                        notes: '',
                      });
                    }}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
