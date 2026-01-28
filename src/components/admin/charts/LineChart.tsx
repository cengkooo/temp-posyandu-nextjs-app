'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
    }>;
  };
  title: string;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
}

export default function LineChart({
  data,
  title,
  selectedPeriod = '6',
  onPeriodChange,
  className = '',
}: LineChartProps) {
  const options = {
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

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {onPeriodChange && (
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="6">6 Bulan Terakhir</option>
            <option value="3">3 Bulan Terakhir</option>
            <option value="12">12 Bulan Terakhir</option>
          </select>
        )}
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
