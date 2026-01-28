'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Baby,
  Heart,
  Calendar,
  Download,
  Printer,
  Share2,
  ChevronRight,
  Activity,
  Syringe,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';
import StatusIndicatorBadge from '@/components/admin/forms/StatusIndicatorBadge';
import { generateKMSPDF } from '@/lib/pdfGenerator';

// Mock data - in real app this would come from API
const mockPatient = {
  id: '1',
  full_name: 'Ahmad Rizky',
  date_of_birth: '2023-06-15',
  gender: 'L' as const,
  parent_name: 'Siti Aminah',
  patient_type: 'balita',
};

const mockVisits = [
  { date: '2024-01-15', weight: 10.2, height: 78, head_circumference: 45, age_months: 19 },
  { date: '2023-12-10', weight: 9.8, height: 76, head_circumference: 44.5, age_months: 18 },
  { date: '2023-11-12', weight: 9.5, height: 75, head_circumference: 44, age_months: 17 },
  { date: '2023-10-08', weight: 9.2, height: 74, head_circumference: 43.5, age_months: 16 },
  { date: '2023-09-10', weight: 8.9, height: 73, head_circumference: 43, age_months: 15 },
  { date: '2023-08-13', weight: 8.5, height: 71, head_circumference: 42.5, age_months: 14 },
];

const mockImmunizations = [
  { name: 'Hepatitis B (HB0)', status: 'completed', date: '2023-06-15' },
  { name: 'BCG', status: 'completed', date: '2023-06-20' },
  { name: 'Polio 1', status: 'completed', date: '2023-07-15' },
  { name: 'Polio 2', status: 'completed', date: '2023-08-15' },
  { name: 'Polio 3', status: 'completed', date: '2023-09-15' },
  { name: 'Polio 4', status: 'completed', date: '2023-10-15' },
  { name: 'DPT-HB-Hib 1', status: 'completed', date: '2023-08-15' },
  { name: 'DPT-HB-Hib 2', status: 'completed', date: '2023-09-15' },
  { name: 'DPT-HB-Hib 3', status: 'completed', date: '2023-10-15' },
  { name: 'IPV', status: 'completed', date: '2023-10-15' },
  { name: 'Campak/MR', status: 'pending', date: null },
];

const tabs: Tab[] = [
  { id: 'overview', label: 'Ringkasan', icon: <Activity className="w-4 h-4" /> },
  { id: 'growth', label: 'Grafik Pertumbuhan', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'immunization', label: 'Imunisasi', icon: <Syringe className="w-4 h-4" /> },
  { id: 'history', label: 'Riwayat Kunjungan', icon: <Calendar className="w-4 h-4" /> },
];

// WHO Growth Standards (simplified - real implementation would use full WHO data)
// const _whoStandards = {
//   weight: {
//     male: [
//       { month: 0, median: 3.3, sd1: 3.9, sd2: 4.4, sd_1: 2.9, sd_2: 2.5 },
//       { month: 6, median: 7.9, sd1: 8.8, sd2: 9.8, sd_1: 7.1, sd_2: 6.4 },
//       { month: 12, median: 9.6, sd1: 10.8, sd2: 12.0, sd_1: 8.6, sd_2: 7.7 },
//       { month: 18, median: 10.9, sd1: 12.2, sd2: 13.7, sd_1: 9.8, sd_2: 8.8 },
//       { month: 24, median: 12.2, sd1: 13.6, sd2: 15.3, sd_1: 10.8, sd_2: 9.7 },
//     ],
//   },
//   height: {
//     male: [
//       { month: 0, median: 49.9, sd1: 51.8, sd2: 53.7, sd_1: 48.0, sd_2: 46.1 },
//       { month: 6, median: 67.6, sd1: 69.8, sd2: 71.9, sd_1: 65.4, sd_2: 63.3 },
//       { month: 12, median: 75.7, sd1: 78.0, sd2: 80.5, sd_1: 73.4, sd_2: 71.0 },
//       { month: 18, median: 82.3, sd1: 84.9, sd2: 87.7, sd_1: 79.6, sd_2: 76.9 },
//       { month: 24, median: 87.8, sd1: 90.7, sd2: 93.9, sd_1: 84.8, sd_2: 81.7 },
//     ],
//   },
// };

export default function KMSDigitalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years < 1) return `${months} bulan`;
    return `${years} tahun ${remainingMonths} bulan`;
  };

  const latestVisit = mockVisits[0];
  
  // Calculate nutritional status
  const nutritionalStatus = useMemo(() => {
    const weight = latestVisit.weight;
    const _ageMonths = latestVisit.age_months;
    
    // Simplified Z-score calculation
    const medianWeight = 10.9; // Approximate for 18 months
    const sd = 1.3;
    const zScore = (weight - medianWeight) / sd;
    
    if (zScore < -3) return { status: 'Gizi Buruk', type: 'danger' as const, zScore };
    if (zScore < -2) return { status: 'Gizi Kurang', type: 'warning' as const, zScore };
    if (zScore <= 2) return { status: 'Gizi Baik', type: 'good' as const, zScore };
    return { status: 'Gizi Lebih', type: 'warning' as const, zScore };
  }, [latestVisit]);

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
      gender: mockPatient.gender,
      parent_name: mockPatient.parent_name,
    };

    const growthData = mockVisits.map((v) => ({
      date: v.date,
      age_months: v.age_months,
      weight: v.weight,
      height: v.height,
      head_circumference: v.head_circumference,
      status_bbu: 'Normal',
      status_tbu: 'Normal',
      status_bbtb: 'Gizi Baik',
    }));

    const immunizations = mockImmunizations.map((imm) => ({
      name: imm.name,
      date: imm.date,
      status: imm.status as 'completed' | 'pending' | 'overdue',
    }));

    generateKMSPDF(patientData, growthData, immunizations, []);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100" padding="sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Status Gizi</p>
              <StatusIndicatorBadge
                status={nutritionalStatus.type}
                label={nutritionalStatus.status}
                size="md"
              />
              <p className="text-xs text-gray-500 mt-2">
                Z-Score: {nutritionalStatus.zScore.toFixed(2)}
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100" padding="sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Berat Badan Terakhir</p>
              <p className="text-2xl font-bold text-gray-900">{latestVisit.weight} kg</p>
              <p className="text-xs text-gray-500 mt-1">
                Naik 0.4 kg dari bulan lalu
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100" padding="sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Tinggi Badan Terakhir</p>
              <p className="text-2xl font-bold text-gray-900">{latestVisit.height} cm</p>
              <p className="text-xs text-gray-500 mt-1">
                Naik 2 cm dari bulan lalu
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Immunization Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Status Imunisasi</h3>
            <button
              onClick={() => setActiveTab('immunization')}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lengkap</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(mockImmunizations.filter(i => i.status === 'completed').length / mockImmunizations.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {mockImmunizations.filter(i => i.status === 'completed').length}/{mockImmunizations.length}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Imunisasi Berikutnya</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Campak/MR - Jadwal usia 9-12 bulan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Visit Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Riwayat Kunjungan</h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {mockVisits.slice(0, 3).map((visit, index) => (
              <div key={visit.date} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-teal-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(visit.date)}</p>
                    <p className="text-xs text-gray-500">Usia {visit.age_months} bulan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{visit.weight} kg</p>
                  <p className="text-xs text-gray-500">{visit.height} cm</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Growth Trend Mini Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Trend Pertumbuhan</h3>
          <button
            onClick={() => setActiveTab('growth')}
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Lihat Grafik Lengkap <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="h-40 flex items-end justify-between gap-2 px-4">
          {mockVisits.slice(0, 6).reverse().map((visit, _index) => (
            <div key={visit.date} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-teal-500 rounded-t-sm transition-all hover:bg-teal-600"
                style={{ height: `${(visit.weight / 12) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{visit.age_months}bl</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400">Berat Badan (kg) per Usia (bulan)</span>
        </div>
      </Card>
    </div>
  );

  const renderGrowthTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight for Age Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">BB/U (Berat Badan menurut Umur)</h3>
          <div className="relative">
            {/* Chart Area */}
            <div className="h-64 bg-gradient-to-b from-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200 relative overflow-hidden">
              {/* Zone Labels */}
              <div className="absolute right-2 top-2 text-xs text-green-600 font-medium">+2 SD</div>
              <div className="absolute right-2 top-1/4 text-xs text-green-500">+1 SD</div>
              <div className="absolute right-2 top-1/2 text-xs text-gray-600 font-medium">Median</div>
              <div className="absolute right-2 top-3/4 text-xs text-yellow-600">-1 SD</div>
              <div className="absolute right-2 bottom-8 text-xs text-red-600 font-medium">-2 SD</div>
              
              {/* Horizontal Lines */}
              <div className="absolute w-full border-t border-dashed border-green-300" style={{ top: '20%' }} />
              <div className="absolute w-full border-t border-dashed border-gray-300" style={{ top: '50%' }} />
              <div className="absolute w-full border-t border-dashed border-yellow-300" style={{ top: '70%' }} />
              <div className="absolute w-full border-t border-dashed border-red-300" style={{ top: '85%' }} />
              
              {/* Data Points */}
              {mockVisits.slice(0, 6).reverse().map((visit, _index) => (
                <div
                  key={visit.date}
                  className="absolute w-3 h-3 bg-teal-600 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${10 + _index * 15}%`,
                    bottom: `${(visit.weight / 15) * 100}%`,
                  }}
                  title={`${visit.weight} kg - ${visit.age_months} bulan`}
                />
              ))}
              
              {/* Connecting Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  points={mockVisits.slice(0, 6).reverse().map((visit, index) => 
                    `${10 + index * 15}%,${100 - (visit.weight / 15) * 100}%`
                  ).join(' ')}
                />
              </svg>
            </div>
            
            {/* X-axis Labels */}
            <div className="flex justify-between mt-2 px-4">
              {mockVisits.slice(0, 6).reverse().map((visit) => (
                <span key={visit.date} className="text-xs text-gray-500">{visit.age_months}bl</span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status:</span>
              <StatusIndicatorBadge status="good" label="Normal" size="sm" />
            </div>
          </div>
        </Card>

        {/* Height for Age Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">TB/U (Tinggi Badan menurut Umur)</h3>
          <div className="relative">
            <div className="h-64 bg-gradient-to-b from-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200 relative overflow-hidden">
              {/* Zone Labels */}
              <div className="absolute right-2 top-2 text-xs text-green-600 font-medium">+2 SD</div>
              <div className="absolute right-2 top-1/2 text-xs text-gray-600 font-medium">Median</div>
              <div className="absolute right-2 bottom-8 text-xs text-red-600 font-medium">-2 SD</div>
              
              {/* Data Points */}
              {mockVisits.slice(0, 6).reverse().map((visit, index) => (
                <div
                  key={visit.date}
                  className="absolute w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${10 + index * 15}%`,
                    bottom: `${(visit.height / 100) * 100}%`,
                  }}
                  title={`${visit.height} cm - ${visit.age_months} bulan`}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-2 px-4">
              {mockVisits.slice(0, 6).reverse().map((visit) => (
                <span key={visit.date} className="text-xs text-gray-500">{visit.age_months}bl</span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status:</span>
              <StatusIndicatorBadge status="good" label="Normal" size="sm" />
            </div>
          </div>
        </Card>

        {/* Head Circumference Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">LK/U (Lingkar Kepala menurut Umur)</h3>
          <div className="relative">
            <div className="h-64 bg-gradient-to-b from-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200 relative overflow-hidden">
              {/* Data Points */}
              {mockVisits.slice(0, 6).reverse().map((visit, _index) => (
                <div
                  key={visit.date}
                  className="absolute w-3 h-3 bg-orange-600 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${10 + _index * 15}%`,
                    bottom: `${(visit.head_circumference / 55) * 100}%`,
                  }}
                  title={`${visit.head_circumference} cm - ${visit.age_months} bulan`}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-2 px-4">
              {mockVisits.slice(0, 6).reverse().map((visit) => (
                <span key={visit.date} className="text-xs text-gray-500">{visit.age_months}bl</span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status:</span>
              <StatusIndicatorBadge status="good" label="Normal" size="sm" />
            </div>
          </div>
        </Card>

        {/* Weight for Height Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">BB/TB (Berat Badan menurut Tinggi Badan)</h3>
          <div className="h-64 bg-gradient-to-b from-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <p className="text-sm text-gray-500">Scatter plot BB/TB</p>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status:</span>
              <StatusIndicatorBadge status="good" label="Normal" size="sm" />
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">Keterangan:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span>Normal (+2 SD s/d -2 SD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
            <span>Waspada (-2 SD s/d -3 SD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
            <span>Risiko (&lt;-3 SD)</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderImmunizationTab = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {mockImmunizations.filter(i => i.status === 'completed').length}
              </p>
              <p className="text-sm text-green-600">Imunisasi Lengkap</p>
            </div>
          </div>
        </Card>
        
        <Card padding="sm" className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {mockImmunizations.filter(i => i.status === 'pending').length}
              </p>
              <p className="text-sm text-yellow-600">Belum Diberikan</p>
            </div>
          </div>
        </Card>
        
        <Card padding="sm" className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Syringe className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{mockImmunizations.length}</p>
              <p className="text-sm text-blue-600">Total Imunisasi Dasar</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Immunization List */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Daftar Imunisasi</h3>
        <div className="space-y-3">
          {mockImmunizations.map((imm, _index) => (
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
      </Card>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Kunjungan & Pengukuran</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usia</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">BB (kg)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">TB (cm)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">LK (cm)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status Gizi</th>
              </tr>
            </thead>
            <tbody>
              {mockVisits.map((visit, index) => (
                <tr key={visit.date} className={`border-b border-gray-100 ${index === 0 ? 'bg-teal-50' : ''}`}>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {formatDate(visit.date)}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        Terakhir
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.age_months} bulan</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.weight}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.height}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{visit.head_circumference}</td>
                  <td className="py-3 px-4">
                    <StatusIndicatorBadge status="good" label="Normal" size="sm" showIcon={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
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
                <Baby className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">KMS Digital</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    Kartu Menuju Sehat
                  </span>
                </div>
                <p className="text-teal-100 mt-1">{mockPatient.full_name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-teal-100">
                  <span>{calculateAge(mockPatient.date_of_birth)}</span>
                  <span>•</span>
                  <span>{mockPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
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

      {/* Parent Info */}
      <Card padding="sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-xs text-gray-500">Nama Orang Tua</p>
              <p className="text-sm font-medium text-gray-900">{mockPatient.parent_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Tanggal Lahir</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(mockPatient.date_of_birth)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-xs text-gray-500">Total Kunjungan</p>
              <p className="text-sm font-medium text-gray-900">{mockVisits.length} kali</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'growth' && renderGrowthTab()}
          {activeTab === 'immunization' && renderImmunizationTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </Card>
    </div>
  );
}
