'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getPatients, createVisit, updateVisit } from '@/lib/api';
import type { Patient, Visit } from '@/types';
import Button from './Button';

interface VisitFormModalProps {
  visit?: Visit & { patient: Patient } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VisitFormModal({ visit, onClose, onSuccess }: VisitFormModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    patient_id: visit?.patient_id || '',
    visit_date: visit?.visit_date || new Date().toISOString().split('T')[0],
    weight: visit?.weight?.toString() || '',
    height: visit?.height?.toString() || '',
    head_circumference: visit?.head_circumference?.toString() || '',
    arm_circumference: visit?.arm_circumference?.toString() || '',
    blood_pressure: visit?.blood_pressure || '',
    notes: visit?.notes || '',
    complaints: (visit as any)?.complaints || '',
    recommendations: (visit as any)?.recommendations || '',
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    visit?.patient || null
  );

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data } = await getPatients();
    if (data) {
      setPatients(data);
    }
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patient_id: patientId });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Pilih pasien terlebih dahulu';
    }

    if (!formData.visit_date) {
      newErrors.visit_date = 'Tanggal kunjungan wajib diisi';
    } else {
      const visitDate = new Date(formData.visit_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (visitDate > today) {
        newErrors.visit_date = 'Tanggal kunjungan tidak boleh di masa depan';
      }
    }

    if (formData.weight && (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 500)) {
      newErrors.weight = 'Berat badan harus antara 0-500 kg';
    }

    if (formData.height && (parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 300)) {
      newErrors.height = 'Tinggi badan harus antara 0-300 cm';
    }

    if (formData.head_circumference && (parseFloat(formData.head_circumference) <= 0 || parseFloat(formData.head_circumference) > 100)) {
      newErrors.head_circumference = 'Lingkar kepala harus antara 0-100 cm';
    }

    if (formData.arm_circumference && (parseFloat(formData.arm_circumference) <= 0 || parseFloat(formData.arm_circumference) > 100)) {
      newErrors.arm_circumference = 'Lingkar lengan harus antara 0-100 cm';
    }

    if (formData.blood_pressure && !/^\d{2,3}\/\d{2,3}$/.test(formData.blood_pressure)) {
      newErrors.blood_pressure = 'Format tekanan darah harus xxx/xx (contoh: 120/80)';
    }

    if (formData.notes && formData.notes.length < 10) {
      newErrors.notes = 'Catatan pemeriksaan minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const visitData = {
      patient_id: formData.patient_id,
      visit_date: formData.visit_date,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      head_circumference: formData.head_circumference ? parseFloat(formData.head_circumference) : null,
      arm_circumference: formData.arm_circumference ? parseFloat(formData.arm_circumference) : null,
      blood_pressure: formData.blood_pressure || null,
      notes: formData.notes || null,
      complaints: formData.complaints || null,
      recommendations: formData.recommendations || null,
    };

    let result;
    if (visit) {
      result = await updateVisit(visit.id, visitData);
    } else {
      result = await createVisit(visitData as any);
    }

    setLoading(false);

    if (result.error) {
      alert('Gagal menyimpan data kunjungan: ' + result.error.message);
    } else {
      alert(visit ? 'Data kunjungan berhasil diperbarui' : 'Data kunjungan berhasil disimpan');
      onSuccess();
    }
  };

  const isBalita = selectedPatient?.patient_type === 'balita';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {visit ? 'Edit Kunjungan' : 'Catat Kunjungan'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pilih Pasien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari dan pilih pasien... <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => handlePatientChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.patient_id ? 'border-red-500' : 'border-gray-200'
              }`}
              disabled={!!visit}
            >
              <option value="">Cari dan pilih pasien...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.patient_type === 'balita' ? 'Balita' : patient.patient_type === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>
            )}
          </div>

          {/* Tanggal Kunjungan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kunjungan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.visit_date ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.visit_date && (
              <p className="text-red-500 text-sm mt-1">{errors.visit_date}</p>
            )}
          </div>

          {/* Pengukuran */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pengukuran</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Berat Badan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.weight ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                )}
              </div>

              {/* Tinggi Badan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.height ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                )}
              </div>

              {/* Lingkar Kepala - Only for Balita */}
              {isBalita && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lingkar Kepala (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={formData.head_circumference}
                    onChange={(e) => setFormData({ ...formData, head_circumference: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.head_circumference ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.head_circumference && (
                    <p className="text-red-500 text-sm mt-1">{errors.head_circumference}</p>
                  )}
                </div>
              )}

              {/* Lingkar Lengan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lingkar Lengan (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={formData.arm_circumference}
                  onChange={(e) => setFormData({ ...formData, arm_circumference: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.arm_circumference ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.arm_circumference && (
                  <p className="text-red-500 text-sm mt-1">{errors.arm_circumference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tekanan Darah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tekanan Darah
            </label>
            <input
              type="text"
              placeholder="120/80"
              value={formData.blood_pressure}
              onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.blood_pressure ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.blood_pressure && (
              <p className="text-red-500 text-sm mt-1">{errors.blood_pressure}</p>
            )}
          </div>

          {/* Catatan Pemeriksaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Pemeriksaan
            </label>
            <textarea
              rows={3}
              placeholder="Catatan hasil pemeriksaan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                errors.notes ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Keluhan (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keluhan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Keluhan pasien..."
              value={formData.complaints}
              onChange={(e) => setFormData({ ...formData, complaints: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Tindakan/Rekomendasi (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tindakan/Rekomendasi (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tindakan yang diberikan atau rekomendasi..."
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
