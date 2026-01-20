'use client';

import { useState } from 'react';
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

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  // Line Chart Data
  const lineChartData = {
    labels: ['Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Kunjungan',
        data: [200, 290, 200, 300, 280, 290],
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Donut Chart Data
  const donutChartData = {
    labels: ['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting'],
    datasets: [
      {
        data: [850, 250, 100, 47],
        backgroundColor: ['#14b8a6', '#fbbf24', '#ef4444', '#f97316'],
        borderWidth: 0,
      },
    ],
  };

  // Recent visits data
  const recentVisits = [
    {
      name: 'Budi Santoso',
      type: 'Balita',
      date: '17 Jan 2024',
      officer: 'Ibu Sari',
      typeColor: 'text-teal-600 bg-teal-50',
    },
    {
      name: 'Ani Rahayu',
      type: 'Ibu Hamil',
      date: '17 Jan 2024',
      officer: 'Ibu Dewi',
      typeColor: 'text-orange-600 bg-orange-50',
    },
    {
      name: 'Pak Joko',
      type: 'Lansia',
      date: '16 Jan 2024',
      officer: 'Ibu Sari',
      typeColor: 'text-blue-600 bg-blue-50',
    },
    {
      name: 'Maya Putri',
      type: 'Balita',
      date: '16 Jan 2024',
      officer: 'Ibu Dewi',
      typeColor: 'text-teal-600 bg-teal-50',
    },
    {
      name: 'Siti Aminah',
      type: 'Ibu Hamil',
      date: '15 Jan 2024',
      officer: 'Ibu Sari',
      typeColor: 'text-orange-600 bg-orange-50',
    },
  ];

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
          value={1247}
          trend="up"
          trendValue="+5%"
          bgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          icon={CalendarCheck}
          title="Kunjungan Bulan Ini"
          value={342}
          trend="up"
          trendValue="+12%"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Syringe}
          title="Imunisasi Pending"
          value={23}
          label="Perlu follow up"
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Balita Gizi Buruk"
          value={8}
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
