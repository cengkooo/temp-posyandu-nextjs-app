'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  CalendarCheck,
  Syringe,
  AlertTriangle,
  UserPlus,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';
import StatCard from '@/components/admin/ui/StatCard';
import LineChart from '@/components/admin/charts/LineChart';
import DonutChart from '@/components/admin/charts/DonutChart';
import DataTable from '@/components/admin/tables/DataTable';
import Button from '@/components/admin/forms/Button';
import Card from '@/components/admin/ui/Card';
import { getNutritionalStatus } from '@/lib/statisticsApi';
import { getAdminDashboardSummary, getDashboardVisitTrends, getRecentVisits } from '@/lib/dashboardApi';
import type { NutritionalStatus, VisitTrend } from '@/types';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<NutritionalStatus[]>([]);
  const [visitTrends, setVisitTrends] = useState<VisitTrend[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    visitsThisMonth: 0,
    immunizationsPending: 0,
    balitaGiziBuruk: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);

      const months = Number.parseInt(selectedPeriod, 10) || 6;
      const [nutritionRes, trendsRes, recentRes] = await Promise.all([
        getNutritionalStatus(),
        getDashboardVisitTrends(months),
        getRecentVisits(5),
      ]);

      const nutritionData = nutritionRes.data || [];
      const summaryRes = await getAdminDashboardSummary(nutritionData);

      if (cancelled) return;

      if (nutritionRes.data) setNutrition(nutritionRes.data);
      if (trendsRes.data) setVisitTrends(trendsRes.data);
      if (recentRes.data) setRecentVisits(recentRes.data);
      if (summaryRes.data) setSummary(summaryRes.data);

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedPeriod]);

  const lineChartData = useMemo(() => {
    return {
      labels: visitTrends.map((t) => t.month),
      datasets: [
        {
          label: 'Kunjungan',
          data: visitTrends.map((t) => t.total),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [visitTrends]);

  const donutChartData = useMemo(() => {
    const labels = ['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting'];
    const byStatus = new Map(nutrition.map((n) => [n.status, n.count]));
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => byStatus.get(l as any) || 0),
          backgroundColor: ['#10b981', '#fbbf24', '#f97316', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };
  }, [nutrition]);

  // Table columns configuration
  const tableColumns = [
    { key: 'name', label: 'Nama Pasien' },
    {
      key: 'type',
      label: 'Tipe',
      render: (value: string, row: any) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${row.typeColor}`}>
          {value}
        </span>
      ),
    },
    { key: 'date', label: 'Tanggal' },
    { key: 'officer', label: 'Petugas' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Pasien Aktif"
          value={summary.totalPatients}
          bgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          icon={CalendarCheck}
          title="Kunjungan Bulan Ini"
          value={summary.visitsThisMonth}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Syringe}
          title="Imunisasi Pending"
          value={summary.immunizationsPending}
          label="Perlu follow up"
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Balita Gizi Buruk"
          value={summary.balitaGiziBuruk}
          label="Perhatian khusus"
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <LineChart
          data={lineChartData}
          title="Grafik Kunjungan"
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          className="lg:col-span-2"
        />

        {/* Donut Chart */}
        <DonutChart
          data={donutChartData}
          title="Status Gizi Balita"
          labels={['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting']}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visits Table */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Kunjungan Terbaru</h2>
            <a
              href="/admin/kunjungan"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Lihat Semua
            </a>
          </div>
          <DataTable columns={tableColumns} data={recentVisits} />
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="space-y-3">
            <Button variant="primary" fullWidth className="flex items-center gap-3 justify-start">
              <UserPlus className="w-5 h-5" />
              <span className="text-sm font-medium">Tambah Pasien Baru</span>
            </Button>
            <Button variant="secondary" fullWidth className="flex items-center gap-3 justify-start">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-medium">Catat Kunjungan</span>
            </Button>
            <Button
              variant="outline"
              fullWidth
              className="flex items-center gap-3 justify-start border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Stethoscope className="w-5 h-5" />
              <span className="text-sm font-medium">Input Imunisasi</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
