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
import { differenceInMonths } from 'date-fns';
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
  getImmunizationCoverage,
  getIbuHamilStats
} from '@/lib/statisticsApi';
import { exportToExcel, exportToPDF, generatePrintableReport } from '@/lib/exportUtils';
import type { Statistics, VisitTrend, NutritionalStatus, BreakdownRow, ImmunizationCoverage, IbuHamilStats } from '@/types';
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
  const [ibuHamilStats, setIbuHamilStats] = useState<IbuHamilStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [statsRes, trendsRes, nutritionRes, distRes, breakdownRes, immuneRes, ibuRes] = await Promise.all([
      getStatistics(startDate, endDate),
      getVisitTrends(startDate, endDate),
      getNutritionalStatus(),
      getPatientDistribution(),
      getDetailedBreakdown(startDate, endDate),
      getImmunizationCoverage(),
      getIbuHamilStats()
    ]);

    if (statsRes.data) setStatistics(statsRes.data);
    if (trendsRes.data) setVisitTrends(trendsRes.data);
    if (nutritionRes.data) setNutritionalStatus(nutritionRes.data);
    if (distRes.data) setPatientDistribution(distRes.data);
    if (breakdownRes.data) setBreakdown(breakdownRes.data);
    if (immuneRes.data) setImmunizationCoverage(immuneRes.data);
    if (ibuRes.data) setIbuHamilStats(ibuRes.data);

    setLoading(false);
  };

  const monthsDiff = Math.max(1, differenceInMonths(new Date(endDate), new Date(startDate)) || 1);
  const totalPatientsInBreakdown = breakdown.reduce((sum, row) => sum + (row.patientCount || 0), 0);
  const totalNutrition = nutritionalStatus.reduce((sum, row) => sum + (row.count || 0), 0);
  const nutritionByStatus = (status: NutritionalStatus['status']) => nutritionalStatus.find((s) => s.status === status);

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
          statistics?.totalVisits || 0,
          statistics?.totalVisitsTrend,
          'bg-gradient-to-br from-teal-50 to-teal-100',
          'bg-white',
          'text-teal-600'
        )}
        {renderStatCard(
          <Users className="w-5 h-5" />,
          'Pasien Baru (Periode)',
          statistics?.newPatients || 0,
          statistics?.newPatientsTrend,
          'bg-gradient-to-br from-blue-50 to-blue-100',
          'bg-white',
          'text-blue-600'
        )}
        {renderStatCard(
          <Baby className="w-5 h-5" />,
          'Balita Dipantau',
          statistics?.totalBalita || 0,
          statistics?.totalBalitaTrend,
          'bg-gradient-to-br from-cyan-50 to-cyan-100',
          'bg-white',
          'text-cyan-600'
        )}
        {renderStatCard(
          <Heart className="w-5 h-5" />,
          'Ibu Hamil Aktif',
          ibuHamilStats?.totalIbuHamil || 0,
          undefined,
          'bg-gradient-to-br from-pink-50 to-pink-100',
          'bg-white',
          'text-pink-600'
        )}
        {renderStatCard(
          <Syringe className="w-5 h-5" />,
          'Cakupan Imunisasi',
          `${statistics?.immunizationCoverage ?? 0}%`,
          statistics?.immunizationCoverageTrend,
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
            <AreaChart data={visitTrends}>
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
                data={patientDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {patientDistribution.map((entry: any, index: number) => (
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
          <BarChart data={visitTrends}>
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
            <Bar dataKey="remaja_dewasa" fill={PATIENT_COLORS.remaja_dewasa} name="Remaja/Dewasa" radius={[4, 4, 0, 0]} />
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
        {renderStatCard(<Calendar className="w-5 h-5" />, 'Total Kunjungan', statistics?.totalVisits || 0, statistics?.totalVisitsTrend, 'bg-teal-50', 'bg-white', 'text-teal-600')}
        {renderStatCard(<Users className="w-5 h-5" />, 'Total Pasien', totalPatientsInBreakdown, undefined, 'bg-blue-50', 'bg-white', 'text-blue-600')}
        {renderStatCard(<Activity className="w-5 h-5" />, 'Rata-rata/Bulan', Math.round((statistics?.totalVisits || 0) / monthsDiff), undefined, 'bg-green-50', 'bg-white', 'text-green-600')}
        {renderStatCard(<TrendingUp className="w-5 h-5" />, 'Kategori Tercatat', breakdown.length, undefined, 'bg-purple-50', 'bg-white', 'text-purple-600')}
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
              {breakdown.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            row.category === 'Bayi'
                              ? PATIENT_COLORS.bayi
                              : row.category === 'Balita'
                                ? PATIENT_COLORS.balita
                                : row.category === 'Ibu Hamil'
                                  ? PATIENT_COLORS.ibu_hamil
                                  : row.category === 'Remaja/Dewasa'
                                    ? PATIENT_COLORS.remaja_dewasa
                                    : PATIENT_COLORS.lansia,
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">{row.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.patientCount}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.visitCount}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.averagePerMonth}</td>
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
              <p className="text-2xl font-bold text-green-700">{nutritionByStatus('Gizi Baik')?.count || 0}</p>
              <p className="text-sm text-green-600">Gizi Baik</p>
              <p className="text-xs text-green-500">{(nutritionByStatus('Gizi Baik')?.percentage || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50" padding="sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{nutritionByStatus('Gizi Kurang')?.count || 0}</p>
              <p className="text-sm text-yellow-600">Gizi Kurang</p>
              <p className="text-xs text-yellow-500">{(nutritionByStatus('Gizi Kurang')?.percentage || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50" padding="sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{nutritionByStatus('Gizi Buruk')?.count || 0}</p>
              <p className="text-sm text-red-600">Gizi Buruk</p>
              <p className="text-xs text-red-500">{(nutritionByStatus('Gizi Buruk')?.percentage || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-50" padding="sm">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{nutritionByStatus('Stunting')?.count || 0}</p>
              <p className="text-sm text-orange-600">Stunting</p>
              <p className="text-xs text-orange-500">{(nutritionByStatus('Stunting')?.percentage || 0).toFixed(1)}%</p>
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
                data={nutritionalStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="count"
                label={(entry: any) => `${entry.status}: ${(entry.percentage || 0).toFixed(1)}%`}
              >
                {nutritionalStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || NUTRITION_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Status Gizi</h3>
          <p className="text-sm text-gray-600">
            Trend bulanan per status gizi belum tersedia (butuh histori klasifikasi per kunjungan).
          </p>
          <p className="text-xs text-gray-500 mt-2">Total data terklasifikasi: {totalNutrition}</p>
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
          <p className="text-4xl font-bold mt-1">{statistics?.immunizationCoverage ?? 0}%</p>
          <p className="text-sm mt-2 opacity-80">Target UCI (Universal Child Immunization): 95%</p>
          <div className="mt-4 w-full bg-white/30 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: `${Math.min(statistics?.immunizationCoverage ?? 0, 100)}%` }} />
          </div>
        </div>
      </Card>

      {/* Immunization Coverage Bars */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cakupan per Jenis Vaksin</h3>
        <div className="space-y-4">
          {immunizationCoverage.length === 0 && (
            <p className="text-sm text-gray-600">Belum ada data imunisasi untuk ditampilkan.</p>
          )}
          {immunizationCoverage.map((item, index) => (
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
            <p className="text-2xl font-bold text-pink-700">{ibuHamilStats?.totalIbuHamil ?? 0}</p>
            <p className="text-sm text-pink-600">Total Ibu Hamil</p>
          </div>
        </Card>
        <Card className="bg-green-50" padding="sm">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">-</p>
            <p className="text-sm text-green-600">Cakupan K4 (Belum tersedia)</p>
          </div>
        </Card>
        <Card className="bg-orange-50" padding="sm">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{ibuHamilStats?.risikoTinggi ?? 0}</p>
            <p className="text-sm text-orange-600">Risiko Tinggi</p>
          </div>
        </Card>
        <Card className="bg-red-50" padding="sm">
          <div className="text-center">
            <Activity className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">-</p>
            <p className="text-sm text-red-600">KEK (Belum tersedia)</p>
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
                  { name: 'Trimester 1', value: ibuHamilStats?.trimester1 ?? 0, color: '#93C5FD' },
                  { name: 'Trimester 2', value: ibuHamilStats?.trimester2 ?? 0, color: '#F9A8D4' },
                  { name: 'Trimester 3', value: ibuHamilStats?.trimester3 ?? 0, color: '#FCA5A5' },
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
          <p className="text-sm text-gray-600">Belum tersedia (butuh data kunjungan ANC terstruktur).</p>
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
