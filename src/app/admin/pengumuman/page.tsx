'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Megaphone,
  MapPin,
  Clock,
  Users,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  CalendarDays,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';

// Types
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'schedule' | 'event' | 'warning';
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface Schedule {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  target_audience: string;
  is_recurring: boolean;
  recurrence_pattern: 'weekly' | 'monthly' | null;
  is_active: boolean;
  created_at: string;
}

// Dummy data
const dummyAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Jadwal Posyandu Bulan Februari',
    content: 'Posyandu bulan Februari akan dilaksanakan pada tanggal 10 Februari 2024 pukul 08.00-12.00 WIB.',
    type: 'schedule',
    is_active: true,
    start_date: '2024-02-01',
    end_date: '2024-02-28',
    created_at: '2024-01-25',
  },
  {
    id: '2',
    title: 'Pemberian Vitamin A Gratis',
    content: 'Program pemberian vitamin A gratis untuk balita usia 6-59 bulan pada bulan Februari dan Agustus.',
    type: 'event',
    is_active: true,
    start_date: '2024-02-01',
    end_date: '2024-02-28',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    title: 'Pemberitahuan Libur Hari Raya',
    content: 'Posyandu tidak beroperasi pada tanggal 1-7 April 2024 karena libur Hari Raya Idul Fitri.',
    type: 'info',
    is_active: false,
    start_date: '2024-03-25',
    end_date: '2024-04-10',
    created_at: '2024-01-15',
  },
];

const dummySchedules: Schedule[] = [
  {
    id: '1',
    title: 'Posyandu Rutin Balita',
    description: 'Penimbangan dan pemeriksaan kesehatan rutin balita',
    date: '2024-02-10',
    start_time: '08:00',
    end_time: '12:00',
    location: 'Balai RW 05',
    target_audience: 'Balita 0-5 tahun',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    title: 'Pemeriksaan Ibu Hamil',
    description: 'ANC dan konsultasi kehamilan',
    date: '2024-02-10',
    start_time: '08:00',
    end_time: '12:00',
    location: 'Balai RW 05',
    target_audience: 'Ibu Hamil',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '3',
    title: 'Posyandu Lansia',
    description: 'Pemeriksaan tekanan darah, gula darah, dan konsultasi kesehatan',
    date: '2024-02-17',
    start_time: '08:00',
    end_time: '11:00',
    location: 'Balai RW 05',
    target_audience: 'Lansia ≥60 tahun',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '4',
    title: 'Imunisasi Campak-Rubella',
    description: 'Imunisasi MR untuk anak usia 9 bulan - 15 tahun',
    date: '2024-02-24',
    start_time: '09:00',
    end_time: '14:00',
    location: 'Puskesmas Kelurahan',
    target_audience: 'Anak 9 bulan - 15 tahun',
    is_recurring: false,
    recurrence_pattern: null,
    is_active: true,
    created_at: '2024-01-20',
  },
];

const tabs: Tab[] = [
  { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'jadwal', label: 'Jadwal Posyandu', icon: <CalendarDays className="w-4 h-4" /> },
];

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Informasi' },
  schedule: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Jadwal' },
  event: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Acara' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Penting' },
};

export default function PengumumanJadwalPage() {
  const [activeTab, setActiveTab] = useState('pengumuman');
  const [announcements, setAnnouncements] = useState<Announcement[]>(dummyAnnouncements);
  const [schedules, setSchedules] = useState<Schedule[]>(dummySchedules);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.replace(':', '.');
  };

  const toggleAnnouncementActive = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, is_active: !a.is_active } : a
    ));
  };

  const toggleScheduleActive = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, is_active: !s.is_active } : s
    ));
  };

  const deleteAnnouncement = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const deleteSchedule = (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const renderAnnouncementsTab = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Daftar Pengumuman</h3>
          <p className="text-sm text-gray-500">
            Kelola pengumuman yang ditampilkan di halaman utama website
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAnnouncement(null);
            setShowAnnouncementModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengumuman
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`p-4 border rounded-lg ${
              announcement.is_active 
                ? 'bg-white border-gray-200' 
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[announcement.type].bg} ${typeColors[announcement.type].text}`}>
                    {typeColors[announcement.type].label}
                  </span>
                  {!announcement.is_active && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                      Nonaktif
                    </span>
                  )}
                </div>
                <h4 className={`font-semibold ${announcement.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {announcement.title}
                </h4>
                <p className={`text-sm mt-1 ${announcement.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
                  {announcement.content}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(announcement.start_date)}
                    {announcement.end_date && ` - ${formatDate(announcement.end_date)}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAnnouncementActive(announcement.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.is_active
                      ? 'text-teal-600 hover:bg-teal-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={announcement.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {announcement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingAnnouncement(announcement);
                    setShowAnnouncementModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada pengumuman</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Jadwal Posyandu</h3>
          <p className="text-sm text-gray-500">
            Kelola jadwal kegiatan Posyandu
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

      {/* Calendar View Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`p-4 border rounded-xl ${
              schedule.is_active 
                ? 'bg-white border-gray-200 shadow-sm' 
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                schedule.is_active ? 'bg-teal-100' : 'bg-gray-200'
              }`}>
                <span className={`text-xs font-medium ${schedule.is_active ? 'text-teal-600' : 'text-gray-500'}`}>
                  {new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                </span>
                <span className={`text-lg font-bold ${schedule.is_active ? 'text-teal-700' : 'text-gray-600'}`}>
                  {new Date(schedule.date).getDate()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {schedule.is_recurring && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {schedule.recurrence_pattern === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </span>
                )}
                {!schedule.is_active && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                    Nonaktif
                  </span>
                )}
              </div>
            </div>

            <h4 className={`font-semibold mb-2 ${schedule.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
              {schedule.title}
            </h4>
            <p className={`text-sm mb-3 ${schedule.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
              {schedule.description}
            </p>

            <div className={`space-y-1.5 text-xs ${schedule.is_active ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)} WIB
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {schedule.location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                {schedule.target_audience}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleScheduleActive(schedule.id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  schedule.is_active
                    ? 'text-teal-600 hover:bg-teal-50'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {schedule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                onClick={() => {
                  setEditingSchedule(schedule);
                  setShowScheduleModal(true);
                }}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteSchedule(schedule.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada jadwal</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengumuman & Jadwal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pengumuman dan jadwal kegiatan Posyandu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <Megaphone className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Pengumuman Aktif</p>
              <p className="text-xl font-bold text-gray-900">
                {announcements.filter(a => a.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Jadwal Aktif</p>
              <p className="text-xl font-bold text-gray-900">
                {schedules.filter(s => s.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Jadwal Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">
                {schedules.filter(s => {
                  const scheduleDate = new Date(s.date);
                  const now = new Date();
                  return scheduleDate.getMonth() === now.getMonth() && scheduleDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Pengumuman</p>
              <p className="text-xl font-bold text-gray-900">{announcements.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Content */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'pengumuman' && renderAnnouncementsTab()}
          {activeTab === 'jadwal' && renderSchedulesTab()}
        </div>
      </Card>

      {/* Modal placeholders - TODO: Implement actual modals */}
      {showAnnouncementModal && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => setShowAnnouncementModal(false)}
          onSave={(data) => {
            if (editingAnnouncement) {
              setAnnouncements(announcements.map(a => 
                a.id === editingAnnouncement.id ? { ...a, ...data } : a
              ));
            } else {
              setAnnouncements([
                { ...data, id: Date.now().toString(), created_at: new Date().toISOString().split('T')[0] } as Announcement,
                ...announcements,
              ]);
            }
            setShowAnnouncementModal(false);
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal
          schedule={editingSchedule}
          onClose={() => setShowScheduleModal(false)}
          onSave={(data) => {
            if (editingSchedule) {
              setSchedules(schedules.map(s => 
                s.id === editingSchedule.id ? { ...s, ...data } : s
              ));
            } else {
              setSchedules([
                { ...data, id: Date.now().toString(), created_at: new Date().toISOString().split('T')[0] } as Schedule,
                ...schedules,
              ]);
            }
            setShowScheduleModal(false);
          }}
        />
      )}
    </div>
  );
}

// Announcement Modal Component
function AnnouncementModal({
  announcement,
  onClose,
  onSave,
}: {
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (data: Partial<Announcement>) => void;
}) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    type: announcement?.type || 'info',
    start_date: announcement?.start_date || new Date().toISOString().split('T')[0],
    end_date: announcement?.end_date || '',
    is_active: announcement?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {announcement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi Pengumuman <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="info">Informasi</option>
              <option value="schedule">Jadwal</option>
              <option value="event">Acara</option>
              <option value="warning">Penting</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Aktifkan pengumuman
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan
            </Button>
          </div>
        </form>
      </div>
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
  onSave: (data: Partial<Schedule>) => void;
}) {
  const [formData, setFormData] = useState({
    title: schedule?.title || '',
    description: schedule?.description || '',
    date: schedule?.date || '',
    start_time: schedule?.start_time || '08:00',
    end_time: schedule?.end_time || '12:00',
    location: schedule?.location || '',
    target_audience: schedule?.target_audience || '',
    is_recurring: schedule?.is_recurring || false,
    recurrence_pattern: schedule?.recurrence_pattern || 'monthly',
    is_active: schedule?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {schedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Keterangan kegiatan..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              placeholder="Contoh: Balai RW 05"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sasaran</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="Contoh: Balita 0-5 tahun"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
              <label htmlFor="is_recurring" className="text-sm text-gray-700">
                Jadwal berulang
              </label>
            </div>

            {formData.is_recurring && (
              <select
                value={formData.recurrence_pattern}
                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as 'weekly' | 'monthly' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="weekly">Setiap Minggu</option>
                <option value="monthly">Setiap Bulan</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="schedule_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <label htmlFor="schedule_is_active" className="text-sm text-gray-700">
              Aktifkan jadwal
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
