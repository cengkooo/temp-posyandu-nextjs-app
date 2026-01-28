'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Calendar,
  Download,
  Printer,
  Share2,
  ChevronRight,
  Activity,
  Syringe,
  Baby,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BookOpen,
  TrendingUp,
  Pill,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';
import StatusIndicatorBadge from '@/components/admin/forms/StatusIndicatorBadge';
import { generateBukuKIAPDF } from '@/lib/pdfGenerator';

// Mock data
const mockPatient = {
  id: '1',
  full_name: 'Siti Aminah',
  date_of_birth: '1995-03-20',
  patient_type: 'ibu_hamil',
  phone: '081234567890',
  address: 'Jl. Melati No. 10, RT 05/RW 03',
};

const mockPregnancyData = {
  gravida: 2, // Kehamilan ke-
  para: 1, // Persalinan normal
  abortus: 0, // Keguguran
  hpht: '2023-09-15', // Hari Pertama Haid Terakhir
  hpl: '2024-06-22', // Hari Perkiraan Lahir
  initial_weight: 55, // BB sebelum hamil
  initial_height: 158, // TB
  blood_type: 'O',
  rhesus: '+',
};

const mockANCVisits = [
  {
    date: '2024-01-20',
    visit_number: 'K4',
    pregnancy_weeks: 18,
    weight: 60.5,
    blood_pressure: '110/70',
    lila: 26,
    fundal_height: 18,
    fetal_heart_rate: 145,
    presentation: 'Belum teraba',
    edema: false,
    protein_urine: 'negatif',
    ttd_given: 30,
    notes: 'Kehamilan normal, ibu dan janin sehat',
  },
  {
    date: '2023-12-23',
    visit_number: 'K3',
    pregnancy_weeks: 14,
    weight: 59.2,
    blood_pressure: '115/75',
    lila: 26,
    fundal_height: 14,
    fetal_heart_rate: 150,
    presentation: 'Belum teraba',
    edema: false,
    protein_urine: 'negatif',
    ttd_given: 30,
    notes: 'Kehamilan normal',
  },
  {
    date: '2023-11-18',
    visit_number: 'K2',
    pregnancy_weeks: 9,
    weight: 57.5,
    blood_pressure: '110/70',
    lila: 25.5,
    fundal_height: null,
    fetal_heart_rate: 155,
    presentation: null,
    edema: false,
    protein_urine: 'negatif',
    ttd_given: 30,
    notes: 'USG: janin sesuai usia kehamilan',
  },
  {
    date: '2023-10-21',
    visit_number: 'K1',
    pregnancy_weeks: 5,
    weight: 56,
    blood_pressure: '110/70',
    lila: 25,
    fundal_height: null,
    fetal_heart_rate: null,
    presentation: null,
    edema: false,
    protein_urine: 'negatif',
    ttd_given: 30,
    notes: 'Kunjungan pertama, konfirmasi kehamilan',
  },
];

const mockImmunizationTT = [
  { name: 'TT1', status: 'completed', date: '2023-10-21' },
  { name: 'TT2', status: 'completed', date: '2023-11-18' },
  { name: 'TT3', status: 'pending', date: null },
  { name: 'TT4', status: 'pending', date: null },
  { name: 'TT5', status: 'pending', date: null },
];

const mockCounseling = [
  { topic: 'Gizi Ibu Hamil', completed: true, date: '2023-10-21' },
  { topic: 'Tanda Bahaya Kehamilan', completed: true, date: '2023-10-21' },
  { topic: 'Persiapan Persalinan', completed: true, date: '2023-12-23' },
  { topic: 'ASI Eksklusif', completed: true, date: '2024-01-20' },
  { topic: 'KB Pasca Persalinan', completed: false, date: null },
  { topic: 'Perawatan Bayi Baru Lahir', completed: false, date: null },
];

const tabs: Tab[] = [
  { id: 'overview', label: 'Ringkasan', icon: <Activity className="w-4 h-4" /> },
  { id: 'anc', label: 'Riwayat ANC', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'trend', label: 'Trend Kesehatan', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'immunization', label: 'Imunisasi TT', icon: <Syringe className="w-4 h-4" /> },
  { id: 'education', label: 'Edukasi', icon: <BookOpen className="w-4 h-4" /> },
];

export default function BukuKIAPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const pregnancyWeeks = useMemo(() => {
    const hpht = new Date(mockPregnancyData.hpht);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hpht.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }, []);

  const trimester = useMemo(() => {
    if (pregnancyWeeks <= 12) return 1;
    if (pregnancyWeeks <= 27) return 2;
    return 3;
  }, [pregnancyWeeks]);

  const latestVisit = mockANCVisits[0];
  const weightGain = latestVisit.weight - mockPregnancyData.initial_weight;
  
  // LILA status
  const lilaStatus = useMemo(() => {
    const lila = latestVisit.lila;
    if (lila >= 23.5) return { status: 'Normal', type: 'good' as const };
    return { status: 'Risiko KEK', type: 'danger' as const };
  }, [latestVisit.lila]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownloadPDF = () => {
    const patientData = {
      full_name: mockPatient.full_name,
      date_of_birth: mockPatient.date_of_birth,
      gender: 'P' as const,
    };

    const pregnancyData = {
      hpht: mockPregnancyData.hpht,
      hpl: mockPregnancyData.hpl,
      gravida: mockPregnancyData.gravida,
      para: mockPregnancyData.para,
      abortus: mockPregnancyData.abortus,
      initial_weight: mockPregnancyData.initial_weight,
      initial_height: mockPregnancyData.initial_height,
      blood_type: mockPregnancyData.blood_type,
      rhesus: mockPregnancyData.rhesus,
    };

    const ancVisits = mockANCVisits.map(v => ({
      date: v.date,
      visit_number: v.visit_number,
      pregnancy_weeks: v.pregnancy_weeks,
      weight: v.weight,
      blood_pressure: v.blood_pressure,
      lila: v.lila,
      fundal_height: v.fundal_height,
      fetal_heart_rate: v.fetal_heart_rate,
      ttd_given: v.ttd_given,
      notes: v.notes,
    }));

    const ttImmunizations = mockImmunizationTT.map(imm => ({
      name: imm.name,
      date: imm.date,
      status: imm.status as 'completed' | 'pending',
    }));

    generateBukuKIAPDF(patientData, pregnancyData, ancVisits, ttImmunizations);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Pregnancy Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100" padding="sm">
          <p className="text-xs text-gray-600 mb-1">Usia Kehamilan</p>
          <p className="text-2xl font-bold text-gray-900">{pregnancyWeeks} minggu</p>
          <p className="text-xs text-pink-600 mt-1">Trimester {trimester}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100" padding="sm">
          <p className="text-xs text-gray-600 mb-1">Hari Perkiraan Lahir</p>
          <p className="text-lg font-bold text-gray-900">{formatDate(mockPregnancyData.hpl)}</p>
          <p className="text-xs text-purple-600 mt-1">
            {Math.ceil((new Date(mockPregnancyData.hpl).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari lagi
          </p>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100" padding="sm">
          <p className="text-xs text-gray-600 mb-1">Kenaikan Berat Badan</p>
          <p className="text-2xl font-bold text-gray-900">+{weightGain.toFixed(1)} kg</p>
          <StatusIndicatorBadge 
            status={weightGain >= 8 && weightGain <= 16 ? 'good' : 'warning'} 
            label={weightGain >= 8 && weightGain <= 16 ? 'Normal' : 'Perlu Perhatian'} 
            size="sm" 
          />
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100" padding="sm">
          <p className="text-xs text-gray-600 mb-1">Status LILA</p>
          <p className="text-2xl font-bold text-gray-900">{latestVisit.lila} cm</p>
          <StatusIndicatorBadge status={lilaStatus.type} label={lilaStatus.status} size="sm" />
        </Card>
      </div>

      {/* Pregnancy History GPA */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Kehamilan (GPA)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-3xl font-bold text-pink-600">G{mockPregnancyData.gravida}</p>
            <p className="text-sm text-gray-600">Gravida</p>
            <p className="text-xs text-gray-400">Kehamilan ke-{mockPregnancyData.gravida}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">P{mockPregnancyData.para}</p>
            <p className="text-sm text-gray-600">Para</p>
            <p className="text-xs text-gray-400">Persalinan: {mockPregnancyData.para}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-600">A{mockPregnancyData.abortus}</p>
            <p className="text-sm text-gray-600">Abortus</p>
            <p className="text-xs text-gray-400">Keguguran: {mockPregnancyData.abortus}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ANC Progress */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progress Kunjungan ANC</h3>
            <button
              onClick={() => setActiveTab('anc')}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {['K1', 'K2', 'K3', 'K4', 'K5', 'K6'].map((k, _index) => {
              const visitExists = mockANCVisits.find(v => v.visit_number === k);
              return (
                <div
                  key={k}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    visitExists
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {k}
                </div>
              );
            })}
          </div>
          
          <p className="text-sm text-gray-600">
            {mockANCVisits.length} dari 6 kunjungan ANC telah dilakukan
          </p>
        </Card>

        {/* Latest Visit Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Pemeriksaan Terakhir</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium">{formatDate(latestVisit.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tekanan Darah</span>
              <span className="font-medium">{latestVisit.blood_pressure} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">TFU</span>
              <span className="font-medium">{latestVisit.fundal_height || '-'} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">DJJ</span>
              <span className="font-medium">{latestVisit.fetal_heart_rate || '-'} x/menit</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Warnings/Alerts */}
      {latestVisit.lila < 23.5 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Perhatian: Risiko KEK</p>
              <p className="text-sm text-red-700 mt-1">
                LILA {latestVisit.lila} cm (di bawah 23.5 cm). Ibu hamil berisiko Kurang Energi Kronis.
                Konseling gizi dan PMT direkomendasikan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderANCTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Kunjungan ANC</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kunjungan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">UK</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">BB (kg)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TD</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">LILA</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TFU</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">DJJ</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TTD</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {mockANCVisits.map((visit, index) => (
                <tr key={visit.date} className={`border-b border-gray-100 ${index === 0 ? 'bg-pink-50' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {visit.visit_number}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                        Terakhir
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(visit.date)}</td>
                  <td className="py-3 px-4 text-gray-600">{visit.pregnancy_weeks} mg</td>
                  <td className="py-3 px-4 text-gray-600">{visit.weight}</td>
                  <td className="py-3 px-4 text-gray-600">{visit.blood_pressure}</td>
                  <td className="py-3 px-4 text-gray-600">{visit.lila} cm</td>
                  <td className="py-3 px-4 text-gray-600">{visit.fundal_height || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{visit.fetal_heart_rate || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{visit.ttd_given} tablet</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs">{visit.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTrendTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Trend */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Trend Berat Badan</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-4">
            {mockANCVisits.slice(0, 4).reverse().map((visit) => (
              <div key={visit.date} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-pink-500 rounded-t-sm"
                  style={{ height: `${((visit.weight - 50) / 15) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{visit.visit_number}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
            Kenaikan total: +{weightGain.toFixed(1)} kg
          </div>
        </Card>

        {/* Blood Pressure Trend */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Trend Tekanan Darah</h3>
          <div className="space-y-3">
            {mockANCVisits.slice(0, 4).map((visit, _index) => (
              <div key={visit.date} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-8">{visit.visit_number}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(parseInt(visit.blood_pressure.split('/')[0]) / 150) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-20">{visit.blood_pressure}</span>
                </div>
                <StatusIndicatorBadge status="good" label="Normal" size="sm" showIcon={false} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderImmunizationTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Status Imunisasi TT (Tetanus Toxoid)</h3>
        <div className="space-y-3">
          {mockImmunizationTT.map((imm) => (
            <div
              key={imm.name}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                imm.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  imm.status === 'completed' ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {imm.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${imm.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}>
                    {imm.name}
                  </p>
                  {imm.date && (
                    <p className="text-xs text-gray-500">{formatDate(imm.date)}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                imm.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {imm.status === 'completed' ? 'Lengkap' : 'Belum'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Imunisasi TT melindungi ibu dan bayi dari tetanus. 
            Status TT lengkap minimal TT2 sebelum persalinan untuk perlindungan optimal.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderEducationTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Edukasi & Konseling yang Diberikan</h3>
        <div className="space-y-3">
          {mockCounseling.map((item) => (
            <div
              key={item.topic}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.completed ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.topic}
                  </p>
                  {item.date && (
                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.completed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {item.completed ? 'Selesai' : 'Belum'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* TTD Summary */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg">
            <Pill className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Total Tablet Tambah Darah</h3>
            <p className="text-2xl font-bold text-red-600">
              {mockANCVisits.reduce((sum, v) => sum + v.ttd_given, 0)} tablet
            </p>
            <p className="text-xs text-gray-600">
              Diberikan selama {mockANCVisits.length} kunjungan ANC
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Buku KIA Digital</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    Ibu Hamil
                  </span>
                </div>
                <p className="text-pink-100 mt-1">{mockPatient.full_name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-pink-100">
                  <span>G{mockPregnancyData.gravida}P{mockPregnancyData.para}A{mockPregnancyData.abortus}</span>
                  <span>•</span>
                  <span>UK {pregnancyWeeks} minggu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="!border-white/50 !text-white hover:!bg-white/20 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </Button>
            <Button
              variant="outline"
              className="!border-white/50 !text-white hover:!bg-white/20 flex items-center gap-2"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4" />
              Unduh PDF
            </Button>
            <Button
              variant="outline"
              className="!border-white/50 !text-white hover:!bg-white/20 flex items-center gap-2"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Cetak
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <Card padding="sm">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-xs text-gray-500">HPHT</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(mockPregnancyData.hpht)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Baby className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-xs text-gray-500">HPL</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(mockPregnancyData.hpl)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-xs text-gray-500">Golongan Darah</p>
              <p className="text-sm font-medium text-gray-900">{mockPregnancyData.blood_type}{mockPregnancyData.rhesus}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-xs text-gray-500">Kunjungan ANC</p>
              <p className="text-sm font-medium text-gray-900">{mockANCVisits.length} kali</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'anc' && renderANCTab()}
          {activeTab === 'trend' && renderTrendTab()}
          {activeTab === 'immunization' && renderImmunizationTab()}
          {activeTab === 'education' && renderEducationTab()}
        </div>
      </Card>
    </div>
  );
}
