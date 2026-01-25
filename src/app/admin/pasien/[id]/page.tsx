'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Tag,
  Phone,
  Printer,
  Pencil,
  Trash2,
  Plus,
  User,
  MapPin,
  TrendingUp,
  Syringe,
  Baby,
  HeartPulse,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { getPatientById, getPatientVisits, deletePatient } from '@/lib/api';
import type { Patient, Visit } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';
import StatusIndicatorBadge from '@/components/admin/forms/StatusIndicatorBadge';
import { formatAge, calculateAgeInMonths, calculateBBU, calculateTBU, calculateIMT, getIMTStatus } from '@/lib/nutritionCalculator';

// Tab configurations per patient type
const getTabsForPatientType = (patientType: string): Tab[] => {
  const commonTabs: Tab[] = [
    { id: 'kunjungan', label: 'Riwayat Kunjungan', icon: <Clock className="w-4 h-4" /> },
  ];

  switch (patientType) {
    case 'bayi':
    case 'balita':
      return [
        ...commonTabs,
        { id: 'grafik', label: 'Grafik Pertumbuhan', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'imunisasi', label: 'Imunisasi', icon: <Syringe className="w-4 h-4" /> },
        { id: 'asi', label: 'ASI & MP-ASI', icon: <Baby className="w-4 h-4" /> },
        { id: 'riwayat_sakit', label: 'Riwayat Sakit', icon: <AlertTriangle className="w-4 h-4" /> },
      ];
    case 'ibu_hamil':
      return [
        ...commonTabs,
        { id: 'kehamilan', label: 'Data Kehamilan', icon: <HeartPulse className="w-4 h-4" /> },
        { id: 'anc', label: 'Riwayat ANC', icon: <Activity className="w-4 h-4" /> },
        { id: 'imunisasi_tt', label: 'Imunisasi TT', icon: <Syringe className="w-4 h-4" /> },
        { id: 'edukasi', label: 'Edukasi', icon: <CheckCircle className="w-4 h-4" /> },
      ];
    case 'remaja_dewasa':
      return [
        ...commonTabs,
        { id: 'trend', label: 'Trend Antropometri', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'risiko_ptm', label: 'Faktor Risiko PTM', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'lab', label: 'Hasil Lab', icon: <Activity className="w-4 h-4" /> },
        { id: 'konseling', label: 'Konseling', icon: <CheckCircle className="w-4 h-4" /> },
      ];
    case 'lansia':
      return [
        ...commonTabs,
        { id: 'trend', label: 'Trend Kesehatan', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'fungsional', label: 'Status Fungsional', icon: <Activity className="w-4 h-4" /> },
        { id: 'penyakit', label: 'Penyakit & Obat', icon: <Pill className="w-4 h-4" /> },
        { id: 'rujukan', label: 'Rujukan & Follow-up', icon: <Clock className="w-4 h-4" /> },
      ];
    default:
      return commonTabs;
  }
};

const getPatientTypeColor = (type: string) => {
  switch (type) {
    case 'bayi':
      return { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-100' };
    case 'balita':
      return { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-100' };
    case 'ibu_hamil':
      return { bg: 'from-pink-500 to-pink-600', text: 'text-pink-600', light: 'bg-pink-100' };
    case 'remaja_dewasa':
      return { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-100' };
    case 'lansia':
      return { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', light: 'bg-orange-100' };
    default:
      return { bg: 'from-gray-500 to-gray-600', text: 'text-gray-600', light: 'bg-gray-100' };
  }
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

export default function DetailPasienPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kunjungan');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);

    const { data: patientData } = await getPatientById(patientId);
    if (patientData) {
      setPatient(patientData);
    }

    const { data: visitsData } = await getPatientVisits(patientId);
    if (visitsData) {
      setVisits(visitsData);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!patient) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus data pasien "${patient.full_name}"?`)) {
      return;
    }

    const { error } = await deletePatient(patientId);
    if (!error) {
      alert('Data pasien berhasil dihapus');
      router.push('/admin/pasien');
    } else {
      alert('Gagal menghapus data pasien');
    }
  };

  // Get tabs based on patient type
  const tabs = useMemo(() => {
    if (!patient) return [];
    return getTabsForPatientType(patient.patient_type);
  }, [patient?.patient_type]);

  const typeColors = useMemo(() => {
    if (!patient) return getPatientTypeColor('');
    return getPatientTypeColor(patient.patient_type);
  }, [patient?.patient_type]);

  // Get latest visit stats
  const latestVisit = useMemo(() => {
    if (visits.length === 0) return null;
    return visits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0];
  }, [visits]);

  // Calculate nutritional status for latest visit
  const nutritionalStatus = useMemo(() => {
    if (!patient || !latestVisit?.weight) return null;
    
    const ageMonths = calculateAgeInMonths(patient.date_of_birth);
    
    if (patient.patient_type === 'bayi' || patient.patient_type === 'balita') {
      if (!latestVisit.height) return null;
      const bbu = calculateBBU(latestVisit.weight, ageMonths, patient.gender as 'L' | 'P');
      const tbu = calculateTBU(latestVisit.height, ageMonths, patient.gender as 'L' | 'P');
      return { bbu, tbu };
    }

    if (patient.patient_type === 'remaja_dewasa' || patient.patient_type === 'lansia') {
      if (!latestVisit.height) return null;
      const imt = calculateIMT(latestVisit.weight, latestVisit.height);
      return { imt: getIMTStatus(imt) };
    }

    return null;
  }, [patient, latestVisit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <User className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-lg font-medium">Data pasien tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  const renderKunjunganTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Riwayat Kunjungan</h3>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => router.push(`/admin/kunjungan?patient_id=${patientId}`)}
        >
          <Plus className="w-4 h-4" />
          Tambah Kunjungan
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">BB (kg)</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">TB/PB (cm)</th>
              {(patient.patient_type === 'bayi' || patient.patient_type === 'balita') && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">LK (cm)</th>
              )}
              {(patient.patient_type === 'ibu_hamil' || patient.patient_type === 'remaja_dewasa' || patient.patient_type === 'lansia') && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">TD</th>
              )}
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catatan</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada riwayat kunjungan</p>
                </td>
              </tr>
            ) : (
              visits.map((visit, index) => (
                <tr
                  key={visit.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${index === 0 ? 'bg-teal-50/50' : ''}`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {formatDate(visit.visit_date)}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        Terakhir
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.weight || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.height || '-'}</td>
                  {(patient.patient_type === 'bayi' || patient.patient_type === 'balita') && (
                    <td className="py-3 px-4 text-sm text-gray-600">{visit.head_circumference || '-'}</td>
                  )}
                  {(patient.patient_type === 'ibu_hamil' || patient.patient_type === 'remaja_dewasa' || patient.patient_type === 'lansia') && (
                    <td className="py-3 px-4 text-sm text-gray-600">{visit.blood_pressure || '-'}</td>
                  )}
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{visit.notes || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      onClick={() => {
                        // TODO: Open visit detail/edit modal
                      }}
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGrafikTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Grafik Pertumbuhan</h3>
      
      {visits.length < 2 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Minimal 2 kunjungan diperlukan untuk menampilkan grafik</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BB/U Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">BB/U (Berat Badan menurut Umur)</h4>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400">Chart BB/U akan ditampilkan di sini</p>
            </div>
          </div>

          {/* TB/U Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              {patient.patient_type === 'bayi' ? 'PB/U' : 'TB/U'} (Tinggi Badan menurut Umur)
            </h4>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400">Chart TB/U akan ditampilkan di sini</p>
            </div>
          </div>

          {/* LK/U Chart for Bayi */}
          {patient.patient_type === 'bayi' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">LK/U (Lingkar Kepala menurut Umur)</h4>
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400">Chart LK/U akan ditampilkan di sini</p>
              </div>
            </div>
          )}

          {/* Data Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Data</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Kunjungan</span>
                <span className="font-semibold text-gray-900">{visits.length} kali</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">BB Terakhir</span>
                <span className="font-semibold text-gray-900">{latestVisit?.weight || '-'} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">TB/PB Terakhir</span>
                <span className="font-semibold text-gray-900">{latestVisit?.height || '-'} cm</span>
              </div>
              {latestVisit?.head_circumference && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LK Terakhir</span>
                  <span className="font-semibold text-gray-900">{latestVisit.head_circumference} cm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderImunisasiTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Status Imunisasi</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Hepatitis B (HB0)', status: 'completed', date: '2024-01-15' },
          { name: 'BCG', status: 'completed', date: '2024-01-20' },
          { name: 'Polio 1', status: 'completed', date: '2024-02-15' },
          { name: 'Polio 2', status: 'pending', date: null },
          { name: 'Polio 3', status: 'pending', date: null },
          { name: 'Polio 4', status: 'pending', date: null },
          { name: 'DPT-HB-Hib 1', status: 'completed', date: '2024-02-15' },
          { name: 'DPT-HB-Hib 2', status: 'pending', date: null },
          { name: 'DPT-HB-Hib 3', status: 'pending', date: null },
          { name: 'IPV', status: 'pending', date: null },
          { name: 'Campak/MR', status: 'pending', date: null },
        ].map((item) => (
          <div
            key={item.name}
            className={`p-4 rounded-lg border ${
              item.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`font-medium ${item.status === 'completed' ? 'text-green-800' : 'text-gray-700'}`}>
                  {item.name}
                </p>
                {item.date && (
                  <p className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</p>
                )}
              </div>
              {item.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 italic">
        * Data imunisasi ini adalah contoh. Data sebenarnya akan diambil dari database.
      </p>
    </div>
  );

  const renderStatusFungsionalTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Status Fungsional (ADL)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ADL Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Kemandirian Aktivitas</h4>
          <div className="space-y-3">
            {[
              { name: 'Makan', status: 'Mandiri' },
              { name: 'Berpakaian', status: 'Mandiri' },
              { name: 'Mandi', status: 'Bantuan' },
              { name: 'Toileting', status: 'Mandiri' },
              { name: 'Mobilitas', status: 'Alat Bantu' },
            ].map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.name}</span>
                <StatusIndicatorBadge
                  status={item.status === 'Mandiri' ? 'good' : item.status === 'Bantuan' ? 'warning' : 'info'}
                  label={item.status}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Penilaian Risiko</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risiko Jatuh</span>
              <StatusIndicatorBadge status="warning" label="Sedang" size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status Mental</span>
              <StatusIndicatorBadge status="good" label="Baik" size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Skala Nyeri</span>
              <span className="text-sm font-medium text-gray-900">3/10</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 italic">
        * Data status fungsional ini adalah contoh. Data sebenarnya akan diambil dari kunjungan terakhir.
      </p>
    </div>
  );

  const renderPlaceholderTab = (title: string, description: string) => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'kunjungan':
        return renderKunjunganTab();
      case 'grafik':
      case 'trend':
        return renderGrafikTab();
      case 'imunisasi':
        return renderImunisasiTab();
      case 'fungsional':
        return renderStatusFungsionalTab();
      case 'asi':
        return renderPlaceholderTab('Riwayat ASI & MP-ASI', 'History pemberian ASI dan MP-ASI akan ditampilkan di sini');
      case 'riwayat_sakit':
        return renderPlaceholderTab('Riwayat Sakit', 'Log ISPA, diare, dan penyakit lainnya');
      case 'kehamilan':
        return renderPlaceholderTab('Data Kehamilan', 'Summary GPA, usia kehamilan, dan HPL');
      case 'anc':
        return renderPlaceholderTab('Riwayat ANC', 'Timeline kunjungan K1-K6 dan grafik kenaikan BB');
      case 'imunisasi_tt':
        return renderPlaceholderTab('Imunisasi TT', 'Checklist imunisasi TT dengan tanggal');
      case 'edukasi':
        return renderPlaceholderTab('Edukasi & Konseling', 'Log edukasi yang sudah diberikan');
      case 'risiko_ptm':
        return renderPlaceholderTab('Faktor Risiko PTM', 'Traffic light indicator untuk setiap faktor risiko');
      case 'lab':
        return renderPlaceholderTab('Hasil Lab', 'Table hasil laboratorium dengan tanggal');
      case 'konseling':
        return renderPlaceholderTab('Konseling', 'Log konseling & tindak lanjut');
      case 'penyakit':
        return renderPlaceholderTab('Penyakit & Obat', 'List penyakit kronis dan daftar obat rutin');
      case 'rujukan':
        return renderPlaceholderTab('Rujukan & Follow-up', 'History rujukan dan jadwal kontrol berikutnya');
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${typeColors.bg} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                <div className="flex items-center gap-3 mt-1 text-white/90">
                  <span className="text-sm">{formatAge(patient.date_of_birth)}</span>
                  <span className="text-white/50">•</span>
                  <span className="text-sm">{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span className="text-white/50">•</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                    {getPatientTypeLabel(patient.patient_type)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center gap-2 !border-white/50 !text-white hover:!bg-white/20"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/pasien/${patientId}/edit`)}
              className="flex items-center gap-2 !border-white/50 !text-white hover:!bg-white/20"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 !border-red-300 !text-red-100 hover:!bg-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-white" padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
              <Calendar className={`w-5 h-5 ${typeColors.text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tanggal Lahir</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(patient.date_of_birth)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white" padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
              <CreditCard className={`w-5 h-5 ${typeColors.text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">NIK</p>
              <p className="text-sm font-semibold text-gray-900">
                {patient.nik ? `***${patient.nik.slice(-4)}` : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white" padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
              <Phone className={`w-5 h-5 ${typeColors.text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Telepon</p>
              <p className="text-sm font-semibold text-gray-900">{patient.phone || '-'}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white" padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
              <Tag className={`w-5 h-5 ${typeColors.text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Kunjungan</p>
              <p className="text-sm font-semibold text-gray-900">{visits.length} kali</p>
            </div>
          </div>
        </Card>

        {nutritionalStatus?.bbu && (
          <Card className="bg-white" padding="sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
                <TrendingUp className={`w-5 h-5 ${typeColors.text}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status Gizi</p>
                <StatusIndicatorBadge
                  status={nutritionalStatus.bbu.type}
                  label={nutritionalStatus.bbu.label}
                  size="sm"
                  showIcon={false}
                />
              </div>
            </div>
          </Card>
        )}

        {nutritionalStatus?.imt && (
          <Card className="bg-white" padding="sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${typeColors.light} rounded-lg`}>
                <TrendingUp className={`w-5 h-5 ${typeColors.text}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">IMT</p>
                <StatusIndicatorBadge
                  status={nutritionalStatus.imt.type}
                  label={`${nutritionalStatus.imt.value.toFixed(1)} - ${nutritionalStatus.imt.label}`}
                  size="sm"
                  showIcon={false}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Address */}
      {patient.address && (
        <Card padding="sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Alamat</p>
              <p className="text-sm text-gray-900">{patient.address}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs Content */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">{renderTabContent()}</div>
      </Card>
    </div>
  );
}
