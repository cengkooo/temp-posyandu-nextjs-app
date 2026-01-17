'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Syringe, 
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ClipboardList,
  Stethoscope
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Stats Card Component
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendValue, 
  bgColor, 
  iconColor,
  label 
}: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-teal-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        )}
        {label && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            label.includes('follow up') ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
          }`}>
            {label}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
}

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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#666',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          stepSize: 50,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Donut Chart Data
  const donutChartData = {
    labels: ['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting'],
    datasets: [
      {
        data: [850, 250, 100, 47],
        backgroundColor: [
          '#14b8a6',
          '#fbbf24',
          '#ef4444',
          '#f97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  // Recent visits data
  const recentVisits = [
    { name: 'Budi Santoso', type: 'Balita', date: '17 Jan 2024', officer: 'Ibu Sari', typeColor: 'text-teal-600 bg-teal-50' },
    { name: 'Ani Rahayu', type: 'Ibu Hamil', date: '17 Jan 2024', officer: 'Ibu Dewi', typeColor: 'text-orange-600 bg-orange-50' },
    { name: 'Pak Joko', type: 'Lansia', date: '16 Jan 2024', officer: 'Ibu Sari', typeColor: 'text-blue-600 bg-blue-50' },
    { name: 'Maya Putri', type: 'Balita', date: '16 Jan 2024', officer: 'Ibu Dewi', typeColor: 'text-teal-600 bg-teal-50' },
    { name: 'Siti Aminah', type: 'Ibu Hamil', date: '15 Jan 2024', officer: 'Ibu Sari', typeColor: 'text-orange-600 bg-orange-50' },
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
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Grafik Kunjungan</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="6">6 Bulan Terakhir</option>
              <option value="3">3 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold text-teal-600">Sep</span>: Kunjungan - 290
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Status Gizi Balita</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={donutChartData} options={donutChartOptions} />
          </div>
          <div className="mt-6 space-y-2">
            {['Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting'].map((label, index) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: donutChartData.datasets[0].backgroundColor[index],
                    }}
                  ></div>
                  <span className="text-gray-700">{label}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {donutChartData.datasets[0].data[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visits Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Kunjungan Terbaru</h2>
            <a href="/admin/kunjungan" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              Lihat Semua
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Pasien</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipe</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900">{visit.name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${visit.typeColor}`}>
                        {visit.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{visit.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{visit.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              <UserPlus className="w-5 h-5" />
              <span className="text-sm font-medium">Tambah Pasien Baru</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-medium">Catat Kunjungan</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
              <Stethoscope className="w-5 h-5" />
              <span className="text-sm font-medium">Input Imunisasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
