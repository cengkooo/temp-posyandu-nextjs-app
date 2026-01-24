'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Syringe, 
  Baby,
  Download,
  FileText,
  Printer
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
  Cell
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
import StatCard from '@/components/admin/ui/StatCard';

const COLORS = ['#14b8a6', '#f97316', '#3b82f6', '#8b5cf6'];

export default function LaporanPage() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'kunjungan' | 'imunisasi' | 'lengkap'>('kunjungan');
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

  const handleGenerate = () => {
    loadData();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
        <p className="text-gray-600 mt-1">Generate dan analisis laporan posyandu</p>
      </div>

      {/* Generate Laporan Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tipe Laporan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="kunjungan">Laporan Kunjungan</option>
              <option value="imunisasi">Laporan Imunisasi</option>
              <option value="lengkap">Laporan Lengkap</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
            disabled={!statistics}
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
            disabled={!statistics}
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="flex items-center gap-2"
            disabled={!statistics}
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Total Kunjungan"
            value={statistics.totalVisits}
            trend="up"
            trendValue={`+${statistics.totalVisitsTrend}%`}
            bgColor="bg-teal-50"
            iconColor="text-teal-600"
          />
          <StatCard
            icon={Users}
            title="Pasien Baru"
            value={statistics.newPatients}
            trend="up"
            trendValue={`+${statistics.newPatientsTrend}%`}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Syringe}
            title="Cakupan Imunisasi"
            value={`${statistics.immunizationCoverage}%`}
            trend="up"
            trendValue={`+${statistics.immunizationCoverageTrend}%`}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={Baby}
            title="Total Balita Dipantau"
            value={statistics.totalBalita}
            trend="up"
            trendValue={`+${statistics.totalBalitaTrend}`}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Kunjungan per Kategori */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Kunjungan per Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="balita" fill="#14b8a6" name="Balita" />
              <Bar dataKey="ibu_hamil" fill="#f97316" name="Ibu Hamil" />
              <Bar dataKey="lansia" fill="#3b82f6" name="Lansia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cakupan Imunisasi */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cakupan Imunisasi</h3>
          <div className="space-y-3">
            {immunizationCoverage.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.vaccine}</span>
                  <span className="text-sm font-semibold text-teal-600">{Math.round(item.percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribusi Status Gizi Balita */}
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
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                label={(entry) => `${entry.status}: ${Math.round(entry.percentage)}%`}
              >
                {nutritionalStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribusi Pasien */}
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
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {patientDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detail Breakdown Table */}
      {breakdown.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detail Breakdown</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                className="flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportPDF}
                className="flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah Pasien</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kunjungan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rata-rata/Bulan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{row.patientCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{row.visitCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{row.averagePerMonth}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        row.trend >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {row.trend > 0 ? '+' : ''}{row.trend}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
