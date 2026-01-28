'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';
import { getPatientById, updatePatient } from '@/lib/api';
import type { Patient } from '@/types';

// Color schemes per patient type
const patientTypeColors: Record<string, { gradient: string; accent: string }> = {
  bayi: { gradient: 'from-blue-500 to-blue-600', accent: 'blue' },
  balita: { gradient: 'from-cyan-500 to-teal-500', accent: 'teal' },
  ibu_hamil: { gradient: 'from-pink-500 to-rose-500', accent: 'pink' },
  remaja_dewasa: { gradient: 'from-purple-500 to-violet-500', accent: 'purple' },
  lansia: { gradient: 'from-orange-500 to-amber-500', accent: 'orange' },
};

const patientTypeLabels: Record<string, string> = {
  bayi: 'Bayi',
  balita: 'Balita',
  ibu_hamil: 'Ibu Hamil',
  remaja_dewasa: 'Remaja/Dewasa',
  lansia: 'Lansia',
};

export default function EditPasienPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('identitas');

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    nik: '',
    date_of_birth: '',
    gender: 'L' as 'L' | 'P',
    address: '',
    phone: '',
    parent_name: '',
    blood_type: '',
    // Additional fields would be loaded from metadata
  });

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    setLoading(true);
    const { data, error } = await getPatientById(patientId);
    
    if (error || !data) {
      alert('Gagal memuat data pasien');
      router.push('/admin/pasien');
      return;
    }

    setPatient(data);
    setFormData({
      full_name: data.full_name || '',
      nik: data.nik || '',
      date_of_birth: data.date_of_birth || '',
      gender: data.gender || 'L',
      address: data.address || '',
      phone: data.phone || '',
      parent_name: data.parent_name || '',
      blood_type: (data as Patient & { blood_type?: string }).blood_type || '',
    });
    setLoading(false);
  };

  useEffect(() => {
    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      alert('Nama lengkap wajib diisi');
      return;
    }

    setSaving(true);
    
    const { error } = await updatePatient(patientId, {
      full_name: formData.full_name,
      nik: formData.nik || null,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      address: formData.address || null,
      phone: formData.phone || null,
      parent_name: formData.parent_name || null,
    });

    if (error) {
      alert('Gagal menyimpan data: ' + error.message);
      setSaving(false);
      return;
    }

    alert('Data pasien berhasil diperbarui!');
    router.push(`/admin/pasien/${patientId}`);
  };

  const getTabs = (): Tab[] => {
    const baseTabs: Tab[] = [
      { id: 'identitas', label: 'Data Diri' },
    ];

    if (patient?.patient_type === 'bayi' || patient?.patient_type === 'balita') {
      baseTabs.push(
        { id: 'orangtua', label: 'Data Orang Tua' },
        { id: 'kesehatan', label: 'Riwayat Kesehatan' }
      );
    } else if (patient?.patient_type === 'ibu_hamil') {
      baseTabs.push(
        { id: 'kehamilan', label: 'Data Kehamilan' },
        { id: 'kesehatan', label: 'Riwayat Kesehatan' }
      );
    } else if (patient?.patient_type === 'lansia') {
      baseTabs.push(
        { id: 'keluarga', label: 'Kontak Keluarga' },
        { id: 'kesehatan', label: 'Riwayat Kesehatan' }
      );
    } else {
      baseTabs.push({ id: 'kesehatan', label: 'Riwayat Kesehatan' });
    }

    return baseTabs;
  };

  const colors = patient?.patient_type ? patientTypeColors[patient.patient_type] : patientTypeColors.balita;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pasien tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-6 text-white`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Edit Pasien</h1>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {patientTypeLabels[patient.patient_type] || patient.patient_type}
              </span>
            </div>
            <p className="text-white/80 mt-1">{formData.full_name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <TabNavigation tabs={getTabs()} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        {/* Tab: Data Diri */}
        {activeTab === 'identitas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {(patient.patient_type === 'bayi' || patient.patient_type === 'balita') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah</label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => updateField('blood_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-xs"
                >
                  <option value="">Belum diketahui</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Tab: Data Orang Tua (for Bayi/Balita) */}
        {activeTab === 'orangtua' && (patient.patient_type === 'bayi' || patient.patient_type === 'balita') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ibu/Ayah</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => updateField('parent_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon Orang Tua</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Data Kehamilan (for Ibu Hamil) */}
        {activeTab === 'kehamilan' && patient.patient_type === 'ibu_hamil' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Data kehamilan dikelola melalui halaman Buku KIA Digital.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/kia')}
            >
              Buka Buku KIA Digital
            </Button>
          </div>
        )}

        {/* Tab: Kontak Keluarga (for Lansia) */}
        {activeTab === 'keluarga' && patient.patient_type === 'lansia' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Keluarga/Pendamping</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => updateField('parent_name', e.target.value)}
                  placeholder="Nama anak/keluarga yang menemani"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon Keluarga</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Riwayat Kesehatan */}
        {activeTab === 'kesehatan' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Riwayat kesehatan dapat dilihat dan dikelola melalui halaman Detail Pasien dan Catat Kunjungan.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push(`/admin/pasien/${patientId}`)}
            >
              Lihat Detail Pasien
            </Button>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
