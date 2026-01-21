'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { patientFormSchema, type PatientFormData } from '@/lib/validations';
import { createPatient } from '@/lib/api';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

export default function TambahPasienPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    if (!consentChecked) {
      alert('Anda harus menyetujui kebijakan privasi terlebih dahulu');
      return;
    }

    setLoading(true);

    // Prepare data for submission
    const patientData = {
      full_name: data.full_name,
      nik: data.nik || null,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      address: data.address || null,
      phone: data.phone || null,
      patient_type: data.patient_type,
      parent_name: data.parent_name || null,
    };

    const { data: result, error } = await createPatient(patientData);

    if (error) {
      alert('Gagal menambahkan pasien: ' + error.message);
      setLoading(false);
      return;
    }

    alert('Pasien berhasil ditambahkan!');
    router.push('/admin/pasien');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Pasien Baru</h1>
          <p className="text-sm text-gray-500">Lengkapi data untuk mendaftarkan pasien baru</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Data Pribadi */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Data Pribadi</h2>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.date_of_birth ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-500">{errors.date_of_birth.message}</p>
                )}
              </div>

              {/* Tipe Pasien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Pasien <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('patient_type')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.patient_type ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Pilih tipe pasien</option>
                  <option value="balita">Balita</option>
                  <option value="ibu_hamil">Ibu Hamil</option>
                  <option value="lansia">Lansia</option>
                </select>
                {errors.patient_type && (
                  <p className="mt-1 text-sm text-red-500">{errors.patient_type.message}</p>
                )}
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  {...register('address')}
                  placeholder="Masukkan alamat lengkap"
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Right Column - Data Kesehatan */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Data Kesehatan</h2>

              {/* NIK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIK (Opsional)
                </label>
                <input
                  type="text"
                  {...register('nik')}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.nik ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Data NIK akan dienkripsi untuk keamanan
                </p>
                {errors.nik && (
                  <p className="mt-1 text-sm text-red-500">{errors.nik.message}</p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register('gender')}
                      value="L"
                      className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register('gender')}
                      value="P"
                      className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Perempuan</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Nama Orang Tua / Wali */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  {...register('parent_name')}
                  placeholder="Masukkan nama orang tua/wali"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.parent_name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.parent_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.parent_name.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Consent */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-500 focus:ring-teal-500 rounded"
              />
              <span className="text-sm text-gray-700">
                Saya menyetujui data pasien ini disimpan dan diproses sesuai kebijakan privasi Posyandu
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !consentChecked}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
