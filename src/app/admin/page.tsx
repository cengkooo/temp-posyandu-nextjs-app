'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Syringe,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '@/components/admin/ui/StatCard';
import LineChart from '@/components/admin/charts/LineChart';
import DonutChart from '@/components/admin/charts/DonutChart';
import DataTable from '@/components/admin/tables/DataTable';
import Card from '@/components/admin/ui/Card';
import type { NutritionalStatus, VisitTrend } from '@/types';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  const [_loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<NutritionalStatus[]>([]);
  const [visitTrends, setVisitTrends] = useState<VisitTrend[]>([]);
  const [recentVisits, setRecentVisits] = useState<Array<Record<string, unknown>>>([]);
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
      setLoadError(null);

      const months = Number.parseInt(selectedPeriod, 10) || 6;
      const params = new URLSearchParams({
        months: String(months),
        recentLimit: '5',
      });

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const json = (await res.json()) as {
        error?: string;
        summary?: {
          totalPatients: number;
          visitsThisMonth: number;
          immunizationsPending: number;
          balitaGiziBuruk: number;
        };
        nutrition?: NutritionalStatus[];
        visitTrends?: VisitTrend[];
        recentVisits?: Array<Record<string, unknown>>;
      };

      if (cancelled) return;

      if (!res.ok) {
        console.warn('Dashboard API error:', json);
        setLoadError(json.error || 'Gagal memuat dashboard');
        setLoading(false);
        return;
      }

      if (json.nutrition) setNutrition(json.nutrition);
      if (json.visitTrends) setVisitTrends(json.visitTrends);
      if (json.recentVisits) setRecentVisits(json.recentVisits);
      if (json.summary) setSummary(json.summary);

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
    const labels: string[] = ['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting'];
    const byStatus = new Map<string, number>(nutrition.map((n) => [n.status, n.count]));
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => byStatus.get(l) || 0),
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
      render: (value: unknown, row: Record<string, unknown>) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${row.typeColor as string}`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Tanggal',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('id-ID'),
    },
    { key: 'officer', label: 'Petugas' },
  ];

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Dashboard belum bisa memuat sebagian data. Cek Console untuk detail.
        </div>
      )}
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
            <Link
              href="/admin/kunjungan"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Lihat Semua
            </Link>
          </div>
          <DataTable columns={tableColumns} data={recentVisits} />
        </Card>
      </div>
    </div>
  );
}
