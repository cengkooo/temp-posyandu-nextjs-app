'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Tag,
  Phone,
  Printer,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { getPatientById, getPatientVisits, deletePatient } from '@/lib/api';
import type { Patient, Visit } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

export default function DetailPasienPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kunjungan');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);

    const { data: patientData } = await getPatientById(patientId);
    if (patientData) {
      setPatient(patientData);
    }

    const { data: visitsData } = await getPatientVisits(patientId);
    if (visitsData) {
      setVisits(visitsData);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!patient) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus data pasien "${patient.full_name}"?`)) {
      return;
    }

    const { error } = await deletePatient(patientId);
    if (!error) {
      alert('Data pasien berhasil dihapus');
      router.push('/admin/pasien');
    } else {
      alert('Gagal menghapus data pasien');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 2) {
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + monthDiff;
      return `${months} bulan`;
    }

    return `${age} tahun ${monthDiff} bulan`;
  };

  const getPatientTypeLabel = (type: string) => {
    const labels = {
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      lansia: 'Lansia',
    };
    return labels[type as keyof typeof labels];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Data pasien tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
            <p className="text-sm text-gray-500">Detail data pasien</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/pasien/${patientId}/edit`)}
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Umur</p>
              <p className="text-lg font-bold text-gray-900">
                {calculateAge(patient.date_of_birth)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">NIK</p>
              <p className="text-lg font-bold text-gray-900">
                {patient.nik ? `***${patient.nik.slice(-4)}` : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg">
              <Tag className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Tipe</p>
              <p className="text-lg font-bold text-gray-900">
                {getPatientTypeLabel(patient.patient_type)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Telepon</p>
              <p className="text-lg font-bold text-gray-900">
                {patient.phone || '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('kunjungan')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'kunjungan'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Riwayat Kunjungan
            </button>
            <button
              onClick={() => setActiveTab('imunisasi')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'imunisasi'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Imunisasi
            </button>
            <button
              onClick={() => setActiveTab('grafik')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'grafik'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Grafik Pertumbuhan
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'kunjungan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Riwayat Kunjungan</h3>
                <Button
                  variant="primary"
                  className="flex items-center gap-2"
                  onClick={() => router.push(`/admin/kunjungan/tambah?patient_id=${patientId}`)}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kunjungan
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        BB (kg)
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        TB (cm)
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        LK (cm)
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Catatan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Petugas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Belum ada riwayat kunjungan
                        </td>
                      </tr>
                    ) : (
                      visits.map((visit) => (
                        <tr key={visit.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {formatDate(visit.visit_date)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {visit.weight || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {visit.height || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {visit.head_circumference || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {visit.notes || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {visit.created_by || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'imunisasi' && (
            <div className="text-center py-8 text-gray-500">
              Fitur imunisasi akan segera hadir
            </div>
          )}

          {activeTab === 'grafik' && (
            <div className="text-center py-8 text-gray-500">
              Fitur grafik pertumbuhan akan segera hadir
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
