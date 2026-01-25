'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Syringe, 
  Baby,
  Download,
  FileText,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  RefreshCw,
  Heart,
  AlertTriangle,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  getStatistics,
  getVisitTrends,
  getNutritionalStatus,
  getPatientDistribution,
  getDetailedBreakdown,
  getImmunizationCoverage
} from '@/lib/statisticsApi';
import { exportToExcel, exportToPDF, generatePrintableReport } from '@/lib/exportUtils';
import type { Statistics, VisitTrend, NutritionalStatus, BreakdownRow, ImmunizationCoverage } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';

// Patient Type Colors as per spec
const PATIENT_COLORS = {
  bayi: '#3B82F6',      // Blue
  balita: '#06B6D4',    // Cyan
  ibu_hamil: '#EC4899', // Pink
  remaja_dewasa: '#8B5CF6', // Purple
  lansia: '#F59E0B',    // Orange
};

const NUTRITION_COLORS = {
  'Gizi Baik': '#10B981',
  'Gizi Kurang': '#F59E0B',
  'Gizi Buruk': '#EF4444',
  'Stunting': '#F97316',
  'Wasting': '#DC2626',
};

const tabs: Tab[] = [
  { id: 'overview', label: 'Ringkasan', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'kunjungan', label: 'Kunjungan', icon: <Calendar className="w-4 h-4" /> },
  { id: 'gizi', label: 'Status Gizi', icon: <Activity className="w-4 h-4" /> },
  { id: 'imunisasi', label: 'Imunisasi', icon: <Syringe className="w-4 h-4" /> },
  { id: 'ibu_hamil', label: 'Ibu Hamil', icon: <Heart className="w-4 h-4" /> },
];

// Mock data for enhanced features
const mockMonthlyTrends = [
  { month: 'Jan', bayi: 45, balita: 62, ibu_hamil: 28, lansia: 35, total: 170 },
  { month: 'Feb', bayi: 52, balita: 58, ibu_hamil: 32, lansia: 38, total: 180 },
  { month: 'Mar', bayi: 48, balita: 65, ibu_hamil: 35, lansia: 42, total: 190 },
  { month: 'Apr', bayi: 55, balita: 70, ibu_hamil: 30, lansia: 45, total: 200 },
  { month: 'May', bayi: 60, balita: 68, ibu_hamil: 38, lansia: 40, total: 206 },
  { month: 'Jun', bayi: 58, balita: 72, ibu_hamil: 42, lansia: 48, total: 220 },
];

const mockNutritionData = [
  { status: 'Gizi Baik', count: 145, percentage: 72.5, color: '#10B981' },
  { status: 'Gizi Kurang', count: 35, percentage: 17.5, color: '#F59E0B' },
  { status: 'Gizi Buruk', count: 8, percentage: 4, color: '#EF4444' },
  { status: 'Stunting', count: 12, percentage: 6, color: '#F97316' },
];

const mockImmunizationData = [
  { vaccine: 'Hepatitis B (HB0)', target: 200, actual: 195, percentage: 97.5 },
  { vaccine: 'BCG', target: 200, actual: 188, percentage: 94 },
  { vaccine: 'Polio 1', target: 200, actual: 192, percentage: 96 },
  { vaccine: 'Polio 2', target: 180, actual: 168, percentage: 93.3 },
  { vaccine: 'Polio 3', target: 160, actual: 145, percentage: 90.6 },
  { vaccine: 'Polio 4', target: 140, actual: 118, percentage: 84.3 },
  { vaccine: 'DPT-HB-Hib 1', target: 180, actual: 172, percentage: 95.6 },
  { vaccine: 'DPT-HB-Hib 2', target: 160, actual: 148, percentage: 92.5 },
  { vaccine: 'DPT-HB-Hib 3', target: 140, actual: 125, percentage: 89.3 },
  { vaccine: 'Campak/MR', target: 120, actual: 102, percentage: 85 },
];

const mockIbuHamilData = {
  totalIbuHamil: 42,
  trimester1: 12,
  trimester2: 18,
  trimester3: 12,
  risikoTinggi: 5,
  kekRatio: 8.5, // % ibu hamil dengan KEK
  k4Coverage: 78.5, // % yang sudah K4
  ttLengkap: 85, // % TT lengkap
};

const mockANCCoverage = [
  { kunjungan: 'K1', target: 42, actual: 42, percentage: 100 },
  { kunjungan: 'K2', target: 42, actual: 40, percentage: 95.2 },
  { kunjungan: 'K3', target: 42, actual: 36, percentage: 85.7 },
  { kunjungan: 'K4', target: 42, actual: 33, percentage: 78.6 },
  { kunjungan: 'K5', target: 30, actual: 22, percentage: 73.3 },
  { kunjungan: 'K6', target: 20, actual: 12, percentage: 60 },
];

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'kunjungan' | 'imunisasi' | 'lengkap'>('lengkap');
  const [loading, setLoading] = useState(false);

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [visitTrends, setVisitTrends] = useState<VisitTrend[]>([]);
  const [nutritionalStatus, setNutritionalStatus] = useState<NutritionalStatus[]>([]);
  const [patientDistribution, setPatientDistribution] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([]);
  const [immunizationCoverage, setImmunizationCoverage] = useState<ImmunizationCoverage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [statsRes, trendsRes, nutritionRes, distRes, breakdownRes, immuneRes] = await Promise.all([
      getStatistics(startDate, endDate),
      getVisitTrends(startDate, endDate),
      getNutritionalStatus(),
      getPatientDistribution(),
      getDetailedBreakdown(startDate, endDate),
      getImmunizationCoverage()
    ]);

    if (statsRes.data) setStatistics(statsRes.data);
    if (trendsRes.data) setVisitTrends(trendsRes.data);
    if (nutritionRes.data) setNutritionalStatus(nutritionRes.data);
    if (distRes.data) setPatientDistribution(distRes.data);
    if (breakdownRes.data) setBreakdown(breakdownRes.data);
    if (immuneRes.data) setImmunizationCoverage(immuneRes.data);

    setLoading(false);
  };

  const handleExportExcel = () => {
    const filename = `laporan-${reportType}-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToExcel(
      {
        statistics: statistics || undefined,
        breakdown: breakdown,
        visitTrends: visitTrends
      },
      filename,
      reportType
    );
  };

  const handleExportPDF = () => {
    const filename = `laporan-${reportType}-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToPDF(
      {
        statistics: statistics || undefined,
        breakdown: breakdown,
        dateRange: { start: startDate, end: endDate }
      },
      filename,
      reportType
    );
  };

  const handlePrint = () => {
    generatePrintableReport(
      {
        statistics: statistics || undefined,
        breakdown: breakdown,
        dateRange: { start: startDate, end: endDate }
      },
      reportType
    );
  };

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    trend?: number,
    bgColor: string = 'bg-white',
    iconBg: string = 'bg-teal-100',
    iconColor: string = 'text-teal-600'
  ) => (
    <Card className={bgColor} padding="sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${iconBg} rounded-lg`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend > 0 ? '+' : ''}{trend}% dari periode lalu
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {renderStatCard(
          <Activity className="w-5 h-5" />,
          'Total Kunjungan',
          statistics?.totalVisits || mockMonthlyTrends.reduce((sum, m) => sum + m.total, 0),
          statistics?.totalVisitsTrend || 12,
          'bg-gradient-to-br from-teal-50 to-teal-100',
          'bg-white',
          'text-teal-600'
        )}
        {renderStatCard(
          <Users className="w-5 h-5" />,
          'Pasien Terdaftar',
          statistics?.newPatients || 485,
          statistics?.newPatientsTrend || 8,
          'bg-gradient-to-br from-blue-50 to-blue-100',
          'bg-white',
          'text-blue-600'
        )}
        {renderStatCard(
          <Baby className="w-5 h-5" />,
          'Balita Dipantau',
          statistics?.totalBalita || 200,
          statistics?.totalBalitaTrend || 15,
          'bg-gradient-to-br from-cyan-50 to-cyan-100',
          'bg-white',
          'text-cyan-600'
        )}
        {renderStatCard(
          <Heart className="w-5 h-5" />,
          'Ibu Hamil Aktif',
          mockIbuHamilData.totalIbuHamil,
          5,
          'bg-gradient-to-br from-pink-50 to-pink-100',
          'bg-white',
          'text-pink-600'
        )}
        {renderStatCard(
          <Syringe className="w-5 h-5" />,
          'Cakupan Imunisasi',
          `${statistics?.immunizationCoverage || 92}%`,
          statistics?.immunizationCoverageTrend || 3,
          'bg-gradient-to-br from-orange-50 to-orange-100',
          'bg-white',
          'text-orange-600'
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Trend Line Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Kunjungan Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockMonthlyTrends}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area type="monotone" dataKey="total" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Patient Distribution Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Pasien</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Bayi', value: 85, color: PATIENT_COLORS.bayi },
                  { name: 'Balita', value: 115, color: PATIENT_COLORS.balita },
                  { name: 'Ibu Hamil', value: 42, color: PATIENT_COLORS.ibu_hamil },
                  { name: 'Remaja/Dewasa', value: 128, color: PATIENT_COLORS.remaja_dewasa },
                  { name: 'Lansia', value: 115, color: PATIENT_COLORS.lansia },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {[
                  { name: 'Bayi', value: 85, color: PATIENT_COLORS.bayi },
                  { name: 'Balita', value: 115, color: PATIENT_COLORS.balita },
                  { name: 'Ibu Hamil', value: 42, color: PATIENT_COLORS.ibu_hamil },
                  { name: 'Remaja/Dewasa', value: 128, color: PATIENT_COLORS.remaja_dewasa },
                  { name: 'Lansia', value: 115, color: PATIENT_COLORS.lansia },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Kunjungan per Kategori */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunjungan per Kategori Pasien</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockMonthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="bayi" fill={PATIENT_COLORS.bayi} name="Bayi" radius={[4, 4, 0, 0]} />
            <Bar dataKey="balita" fill={PATIENT_COLORS.balita} name="Balita" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ibu_hamil" fill={PATIENT_COLORS.ibu_hamil} name="Ibu Hamil" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lansia" fill={PATIENT_COLORS.lansia} name="Lansia" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderKunjunganTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderStatCard(<Calendar className="w-5 h-5" />, 'Total Kunjungan', 1166, 12, 'bg-teal-50', 'bg-white', 'text-teal-600')}
        {renderStatCard(<UserCheck className="w-5 h-5" />, 'Kunjungan Baru', 234, 8, 'bg-blue-50', 'bg-white', 'text-blue-600')}
        {renderStatCard(<Activity className="w-5 h-5" />, 'Kunjungan Ulang', 932, 15, 'bg-green-50', 'bg-white', 'text-green-600')}
        {renderStatCard(<TrendingUp className="w-5 h-5" />, 'Rata-rata/Hari', 38, 5, 'bg-purple-50', 'bg-white', 'text-purple-600')}
      </div>

      {/* Detailed Breakdown Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Kunjungan per Kategori</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah Pasien</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Kunjungan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rata-rata/Bulan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: 'Bayi (0-11 bulan)', patients: 85, visits: 318, avg: 53, trend: 15, color: PATIENT_COLORS.bayi },
                { category: 'Balita (1-5 tahun)', patients: 115, visits: 395, avg: 66, trend: 12, color: PATIENT_COLORS.balita },
                { category: 'Ibu Hamil', patients: 42, visits: 205, avg: 34, trend: 8, color: PATIENT_COLORS.ibu_hamil },
                { category: 'Remaja/Dewasa', patients: 128, visits: 156, avg: 26, trend: -3, color: PATIENT_COLORS.remaja_dewasa },
                { category: 'Lansia (≥60 tahun)', patients: 115, visits: 248, avg: 41, trend: 10, color: PATIENT_COLORS.lansia },
              ].map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-sm font-medium text-gray-900">{row.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.patients}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.visits}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.avg}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${row.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {row.trend > 0 ? '+' : ''}{row.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderGiziTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50" padding="sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{mockNutritionData[0].count}</p>
              <p className="text-sm text-green-600">Gizi Baik</p>
              <p className="text-xs text-green-500">{mockNutritionData[0].percentage}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50" padding="sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{mockNutritionData[1].count}</p>
              <p className="text-sm text-yellow-600">Gizi Kurang</p>
              <p className="text-xs text-yellow-500">{mockNutritionData[1].percentage}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50" padding="sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{mockNutritionData[2].count}</p>
              <p className="text-sm text-red-600">Gizi Buruk</p>
              <p className="text-xs text-red-500">{mockNutritionData[2].percentage}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-50" padding="sm">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{mockNutritionData[3].count}</p>
              <p className="text-sm text-orange-600">Stunting</p>
              <p className="text-xs text-orange-500">{mockNutritionData[3].percentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Gizi Balita</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockNutritionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="count"
                label={(entry) => `${entry.status}: ${entry.percentage}%`}
              >
                {mockNutritionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend by Month */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Status Gizi (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', giziBaik: 140, giziKurang: 38, giziBuruk: 10, stunting: 12 },
              { month: 'Feb', giziBaik: 142, giziKurang: 36, giziBuruk: 9, stunting: 13 },
              { month: 'Mar', giziBaik: 143, giziKurang: 35, giziBuruk: 10, stunting: 12 },
              { month: 'Apr', giziBaik: 144, giziKurang: 36, giziBuruk: 8, stunting: 12 },
              { month: 'May', giziBaik: 144, giziKurang: 35, giziBuruk: 9, stunting: 12 },
              { month: 'Jun', giziBaik: 145, giziKurang: 35, giziBuruk: 8, stunting: 12 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="giziBaik" stroke="#10B981" name="Gizi Baik" strokeWidth={2} />
              <Line type="monotone" dataKey="giziKurang" stroke="#F59E0B" name="Gizi Kurang" strokeWidth={2} />
              <Line type="monotone" dataKey="giziBuruk" stroke="#EF4444" name="Gizi Buruk" strokeWidth={2} />
              <Line type="monotone" dataKey="stunting" stroke="#F97316" name="Stunting" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  const renderImunisasiTab = () => (
    <div className="space-y-6">
      {/* Overall Coverage */}
      <Card className="bg-gradient-to-r from-teal-500 to-emerald-500">
        <div className="text-white">
          <p className="text-sm opacity-80">Cakupan Imunisasi Dasar Lengkap</p>
          <p className="text-4xl font-bold mt-1">92%</p>
          <p className="text-sm mt-2 opacity-80">Target UCI (Universal Child Immunization): 95%</p>
          <div className="mt-4 w-full bg-white/30 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
      </Card>

      {/* Immunization Coverage Bars */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cakupan per Jenis Vaksin</h3>
        <div className="space-y-4">
          {mockImmunizationData.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.vaccine}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.actual}/{item.target}</span>
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
          <div className="flex items-center gap-6 text-xs">
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

  const renderIbuHamilTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-pink-50" padding="sm">
          <div className="text-center">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-700">{mockIbuHamilData.totalIbuHamil}</p>
            <p className="text-sm text-pink-600">Total Ibu Hamil</p>
          </div>
        </Card>
        <Card className="bg-green-50" padding="sm">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{mockIbuHamilData.k4Coverage}%</p>
            <p className="text-sm text-green-600">Cakupan K4</p>
          </div>
        </Card>
        <Card className="bg-orange-50" padding="sm">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{mockIbuHamilData.risikoTinggi}</p>
            <p className="text-sm text-orange-600">Risiko Tinggi</p>
          </div>
        </Card>
        <Card className="bg-red-50" padding="sm">
          <div className="text-center">
            <Activity className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{mockIbuHamilData.kekRatio}%</p>
            <p className="text-sm text-red-600">KEK (LILA &lt;23.5)</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trimester Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi per Trimester</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Trimester 1', value: mockIbuHamilData.trimester1, color: '#93C5FD' },
                  { name: 'Trimester 2', value: mockIbuHamilData.trimester2, color: '#F9A8D4' },
                  { name: 'Trimester 3', value: mockIbuHamilData.trimester3, color: '#FCA5A5' },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {[
                  { color: '#93C5FD' },
                  { color: '#F9A8D4' },
                  { color: '#FCA5A5' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* ANC Coverage */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cakupan Kunjungan ANC</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockANCCoverage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="kunjungan" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="percentage" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
          <p className="text-gray-600 mt-1">Analisis data dan generate laporan posyandu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportExcel} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button variant="secondary" onClick={handleExportPDF} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div>
            <label className="text-xs text-gray-500">Dari</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Sampai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button 
            variant="primary" 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Update'}
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'kunjungan' && renderKunjunganTab()}
          {activeTab === 'gizi' && renderGiziTab()}
          {activeTab === 'imunisasi' && renderImunisasiTab()}
          {activeTab === 'ibu_hamil' && renderIbuHamilTab()}
        </div>
      </Card>
    </div>
  );
}
