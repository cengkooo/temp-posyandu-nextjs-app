'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';

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

  const filteredPatients = mockPatients.filter(patient => {
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
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100" padding="sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {mockPatients.filter(p => p.status === 'complete').length}
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
                {mockPatients.filter(p => p.status === 'on_track').length}
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
                {mockPatients.filter(p => p.status === 'overdue').length}
              </p>
              <p className="text-xs text-red-600">Terlambat</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100" padding="sm">
          <div className="flex items-center gap-3">
            <Baby className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-teal-700">{mockPatients.length}</p>
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
        <Button variant="primary" className="flex items-center gap-2">
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
                    onClick={() => setSelectedPatient(patient)}
                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
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
    </div>
  );

  const renderCoverageTab = () => (
    <div className="space-y-6">
      {/* Overall Coverage */}
      <Card className="bg-gradient-to-r from-teal-500 to-emerald-500">
        <div className="text-white">
          <p className="text-sm opacity-80">Cakupan Imunisasi Dasar Lengkap (IDL)</p>
          <p className="text-4xl font-bold mt-1">92%</p>
          <p className="text-sm mt-2 opacity-80">Target UCI (Universal Child Immunization): 95%</p>
          <div className="mt-4 w-full bg-white/30 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
      </Card>

      {/* Coverage by Vaccine */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cakupan per Jenis Vaksin</h3>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="secondary" className="flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

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
      </Card>
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
    </div>
  );
}
