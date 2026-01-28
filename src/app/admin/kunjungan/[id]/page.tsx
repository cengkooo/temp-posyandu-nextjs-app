'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Activity, FileText, AlertCircle, Stethoscope } from 'lucide-react';
import type { Visit, Patient, Profile } from '@/types';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

type VisitWithRelations = Visit & {
  patient: Patient;
  profile?: Profile;
  complaints?: string;
  recommendations?: string;
};

export default function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [visit, setVisit] = useState<VisitWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVisit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/${id}`);
      const json = (await res.json()) as { data?: VisitWithRelations };
      if (res.ok && json.data) {
        setVisit(json.data);
      } else {
        setVisit(null);
      }
    } finally {
      // noop
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPatientTypeBadge = (type: string) => {
    const badges = {
      balita: 'bg-teal-50 text-teal-600',
      ibu_hamil: 'bg-orange-50 text-orange-600',
      lansia: 'bg-blue-50 text-blue-600',
    };

    const labels = {
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      lansia: 'Lansia',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[type as keyof typeof badges]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">Data kunjungan tidak ditemukan</div>
        <Button variant="primary" onClick={() => router.push('/admin/kunjungan')}>
          Kembali ke Daftar Kunjungan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/kunjungan')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Kunjungan</h1>
          <p className="text-gray-600 mt-1">Informasi lengkap kunjungan pasien</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{visit.patient.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getPatientTypeBadge(visit.patient.patient_type)}
                <span className="text-sm text-gray-600">
                  {visit.patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(visit.visit_date)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-sm text-gray-500">NIK</div>
            <div className="font-medium text-gray-900">
              {visit.patient.nik ? `***${visit.patient.nik.slice(-4)}` : '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tanggal Lahir</div>
            <div className="font-medium text-gray-900">
              {new Date(visit.patient.date_of_birth).toLocaleDateString('id-ID')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Telepon</div>
            <div className="font-medium text-gray-900">{visit.patient.phone || '-'}</div>
          </div>
        </div>
      </Card>

      {/* Measurements Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pengukuran</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visit.weight && (
            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="text-sm text-teal-600 font-medium">Berat Badan</div>
              <div className="text-2xl font-bold text-teal-900 mt-1">{visit.weight} kg</div>
            </div>
          )}

          {visit.height && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Tinggi Badan</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{visit.height} cm</div>
            </div>
          )}

          {visit.head_circumference && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Lingkar Kepala</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">{visit.head_circumference} cm</div>
            </div>
          )}

          {visit.arm_circumference && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Lingkar Lengan</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">{visit.arm_circumference} cm</div>
            </div>
          )}

          {visit.blood_pressure && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Tekanan Darah</div>
              <div className="text-2xl font-bold text-red-900 mt-1">{visit.blood_pressure}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Notes and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Catatan Pemeriksaan */}
        {visit.notes && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Catatan Pemeriksaan</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
          </Card>
        )}

        {/* Keluhan */}
        {visit.complaints && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Keluhan</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{visit.complaints}</p>
          </Card>
        )}

        {/* Tindakan/Rekomendasi */}
        {visit.recommendations && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tindakan/Rekomendasi</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{visit.recommendations}</p>
          </Card>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Petugas</div>
            <div className="font-medium text-gray-900">
              {visit.profile?.full_name || 'Ibu Sari'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Dibuat Pada</div>
            <div className="font-medium text-gray-900">{formatDateTime(visit.created_at)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Terakhir Diperbarui</div>
            <div className="font-medium text-gray-900">{formatDateTime(visit.updated_at)}</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push('/admin/kunjungan')}>
          Kembali
        </Button>
        <Button variant="primary" onClick={() => router.push(`/admin/pasien/${visit.patient.id}`)}>
          Lihat Profil Pasien
        </Button>
      </div>
    </div>
  );
}
