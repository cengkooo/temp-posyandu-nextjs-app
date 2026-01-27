'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';

// Types
interface Schedule {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  subtitle?: string | null;
  duration?: string | null;
  full_address?: string | null;
  map_link?: string | null;
  capacity?: number | null;
  registered?: number | null;
  price?: string | null;
  price_note?: string | null;
  coordinator_name?: string | null;
  coordinator_role?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  requirements?: string[] | null;
  important_note_title?: string | null;
  important_note_message?: string | null;
  tags?: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function JadwalPosyanduPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const result = await response.json();
      if (result.data) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getScheduleStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total: schedules.length,
      thisMonth: schedules.filter(s => {
        const scheduleDate = new Date(s.date);
        return scheduleDate.getMonth() === now.getMonth() && 
               scheduleDate.getFullYear() === now.getFullYear();
      }).length,
      upcoming: schedules.filter(s => {
        const scheduleDate = new Date(s.date);
        return scheduleDate >= today;
      }).length,
      nextMonth: schedules.filter(s => {
        const scheduleDate = new Date(s.date);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        return scheduleDate >= nextMonthDate && scheduleDate <= endNextMonth;
      }).length,
    };
  };

  const stats = getScheduleStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Kegiatan Posyandu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola jadwal kegiatan dan layanan Posyandu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-linear-to-br from-teal-50 to-teal-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <CalendarDays className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Jadwal</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-linear-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-linear-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Akan Datang</p>
              <p className="text-xl font-bold text-gray-900">{stats.upcoming}</p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-linear-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <CalendarDays className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Bulan Depan</p>
              <p className="text-xl font-bold text-gray-900">{stats.nextMonth}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Daftar Jadwal</h3>
              <p className="text-sm text-gray-500">
                Kelola jadwal kegiatan Posyandu yang ditampilkan di website
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingSchedule(null);
                setShowScheduleModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Jadwal
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Memuat jadwal...</p>
            </div>
          )}

          {/* Calendar View */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border rounded-xl bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-lg flex flex-col items-center justify-center bg-teal-100">
                      <span className="text-xs font-medium text-teal-600">
                        {new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-xl font-bold text-teal-700">
                        {new Date(schedule.date).getDate()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setShowScheduleModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2 text-gray-900">
                    {schedule.title}
                  </h4>
                  <p className="text-sm mb-3 text-gray-600 line-clamp-2">
                    {schedule.description || 'Tidak ada deskripsi'}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {schedule.time || 'Waktu belum ditentukan'}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {schedule.location || 'Lokasi belum ditentukan'}
                    </div>
                  </div>
                </div>
              ))}

              {schedules.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada jadwal</p>
                  <p className="text-sm mt-1">Klik tombol &quot;Tambah Jadwal&quot; untuk membuat jadwal baru</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          schedule={editingSchedule}
          onClose={() => setShowScheduleModal(false)}
          onSave={async (data) => {
            try {
              console.log('Sending data:', data);
              
              if (editingSchedule) {
                // Update existing
                const response = await fetch(`/api/schedules/${editingSchedule.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                
                const result = await response.json();
                console.log('Update response:', result);
                
                if (response.ok) {
                  await fetchSchedules();
                  setShowScheduleModal(false);
                  alert('Jadwal berhasil diupdate!');
                } else {
                  alert(`Gagal update jadwal: ${result.error || result.details || 'Unknown error'}`);
                }
              } else {
                // Create new
                const response = await fetch('/api/schedules', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                
                const result = await response.json();
                console.log('Create response:', result);
                
                if (response.ok) {
                  await fetchSchedules();
                  setShowScheduleModal(false);
                  alert('Jadwal berhasil ditambahkan!');
                } else {
                  alert(`Gagal menyimpan jadwal: ${result.error || result.details || 'Unknown error'}`);
                }
              }
            } catch (error) {
              console.error('Error saving schedule:', error);
              alert('Terjadi kesalahan saat menyimpan jadwal. Cek console untuk detail.');
            }
          }}
        />
      )}
    </div>
  );
}

// Schedule Modal Component
function ScheduleModal({
  schedule,
  onClose,
  onSave,
}: {
  schedule: Schedule | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: schedule?.title || '',
    subtitle: schedule?.subtitle || '',
    description: schedule?.description || '',
    date: schedule?.date || '',
    time: schedule?.time || '08:00 - 12:00 WIB',
    duration: schedule?.duration || '4 Jam',
    location: schedule?.location || '',
    full_address: schedule?.full_address || '',
    map_link: schedule?.map_link || '#',
    capacity: schedule?.capacity || 50,
    price: schedule?.price || 'GRATIS',
    price_note: schedule?.price_note || 'Didukung oleh Pemerintah',
    coordinator_name: schedule?.coordinator_name || 'dr. Siti Nurhaliza',
    coordinator_role: schedule?.coordinator_role || 'Bidan Kepala',
    contact_phone: schedule?.contact_phone || '0812-3456-7890',
    contact_whatsapp: schedule?.contact_whatsapp || 'WhatsApp tersedia',
    requirements: schedule?.requirements?.join('\n') || 'Membawa kartu identitas (KTP/KK)\nDatang tepat waktu sesuai jadwal\nMengikuti protokol kesehatan yang berlaku',
    important_note_title: schedule?.important_note_title || 'Catatan Penting',
    important_note_message: schedule?.important_note_message || 'Jika memiliki kondisi kesehatan khusus, harap konsultasikan dengan petugas kesehatan terlebih dahulu.',
    tags: schedule?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert requirements and tags from string to array
    const dataToSave = {
      ...formData,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {schedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Lengkapi informasi kegiatan Posyandu</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Dasar</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Contoh: Posyandu Rutin Balita"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Program Layanan Posyandu"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Deskripsi lengkap kegiatan..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durasi</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="4 Jam"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waktu</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="08:00 - 12:00 WIB"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="Balai RW 05"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                <input
                  type="text"
                  value={formData.full_address}
                  onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                  placeholder="Jl. Kesehatan No. 45, Kec. Sukamaju"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Google Maps</label>
                <input
                  type="text"
                  value={formData.map_link}
                  onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Detail Tambahan</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Jumlah peserta yang dapat mengikuti kegiatan</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="GRATIS"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Biaya</label>
                <input
                  type="text"
                  value={formData.price_note}
                  onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                  placeholder="Didukung oleh Pemerintah"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penanggung Jawab</label>
                <input
                  type="text"
                  value={formData.coordinator_name}
                  onChange={(e) => setFormData({ ...formData, coordinator_name: e.target.value })}
                  placeholder="dr. Siti Nurhaliza"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                <input
                  type="text"
                  value={formData.coordinator_role}
                  onChange={(e) => setFormData({ ...formData, coordinator_role: e.target.value })}
                  placeholder="Bidan Kepala"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="0812-3456-7890"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={formData.contact_whatsapp}
                  onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                  placeholder="WhatsApp tersedia"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Imunisasi, Balita, Kesehatan"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Full Width Sections */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Syarat & Ketentuan (satu per baris)
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                placeholder="Membawa kartu identitas (KTP/KK)&#10;Datang tepat waktu sesuai jadwal&#10;Mengikuti protokol kesehatan"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Catatan Penting</label>
              <input
                type="text"
                value={formData.important_note_title}
                onChange={(e) => setFormData({ ...formData, important_note_title: e.target.value })}
                placeholder="Catatan Penting"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Isi Catatan Penting</label>
              <textarea
                value={formData.important_note_message}
                onChange={(e) => setFormData({ ...formData, important_note_message: e.target.value })}
                rows={3}
                placeholder="Jika memiliki kondisi kesehatan khusus..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
