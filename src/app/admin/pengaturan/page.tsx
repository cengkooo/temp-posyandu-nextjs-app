'use client';

import { useState } from 'react';
import {
  User,
  Users,
  Building,
  Bell,
  Shield,
  Database,
  Save,
  Upload,
  Camera,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import TabNavigation, { Tab } from '@/components/admin/forms/TabNavigation';

const tabs: Tab[] = [
  { id: 'profil', label: 'Profil Posyandu', icon: <Building className="w-4 h-4" /> },
  { id: 'akun', label: 'Akun Saya', icon: <User className="w-4 h-4" /> },
  { id: 'users', label: 'Management User', icon: <Users className="w-4 h-4" /> },
  { id: 'notifikasi', label: 'Notifikasi', icon: <Bell className="w-4 h-4" /> },
  { id: 'keamanan', label: 'Keamanan', icon: <Shield className="w-4 h-4" /> },
  { id: 'data', label: 'Backup Data', icon: <Database className="w-4 h-4" /> },
];

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [_editingUser, setEditingUser] = useState<Record<string, unknown> | null>(null);

  // Profil Posyandu
  const [posyanduData, setPosyanduData] = useState({
    name: 'Posyandu Melati Sehat',
    code: 'PSY-001',
    address: 'Jl. Melati No. 10, RT 05/RW 03, Kelurahan Sukamaju',
    kelurahan: 'Sukamaju',
    kecamatan: 'Cilandak',
    kota: 'Jakarta Selatan',
    phone: '021-12345678',
    email: 'posyandu.melati@gmail.com',
    puskesmas: 'Puskesmas Cilandak',
    ketua: 'Ibu Siti Aminah',
    operationalDays: ['Senin', 'Kamis'],
    operationalHours: '08:00 - 12:00',
  });

  // Akun Saya
  const [userData, setUserData] = useState({
    name: 'Admin Posyandu',
    email: 'admin@posyandu-melati.com',
    phone: '081234567890',
    role: 'Admin',
  });

  // Notifikasi
  const [notifications, setNotifications] = useState({
    emailReminder: true,
    smsReminder: false,
    whatsappReminder: true,
    reminderDaysBefore: 3,
    newPatientAlert: true,
    overdueImmunizationAlert: true,
    visitSummary: true,
    summaryFrequency: 'weekly',
  });

  // Users list
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Admin Posyandu',
      email: 'admin@posyandu-melati.com',
      phone: '081234567890',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-01-25 14:30',
    },
    {
      id: '2',
      name: 'Bidan Sari',
      email: 'sari@posyandu-melati.com',
      phone: '081234567891',
      role: 'Bidan',
      status: 'active',
      lastLogin: '2025-01-24 10:15',
    },
    {
      id: '3',
      name: 'Kader Ani',
      email: 'ani@posyandu-melati.com',
      phone: '081234567892',
      role: 'Kader',
      status: 'active',
      lastLogin: '2025-01-23 09:00',
    },
    {
      id: '4',
      name: 'Kader Budi',
      email: 'budi@posyandu-melati.com',
      phone: '081234567893',
      role: 'Kader',
      status: 'inactive',
      lastLogin: '2025-01-10 11:30',
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Kader',
    password: '',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderProfilTab = () => (
    <div className="space-y-6">
      {/* Logo & Header */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
            <Building className="w-10 h-10 text-teal-600" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50">
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{posyanduData.name}</h3>
          <p className="text-sm text-gray-500">Kode: {posyanduData.code}</p>
          <p className="text-sm text-gray-500 mt-1">Puskesmas Induk: {posyanduData.puskesmas}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Posyandu</label>
          <input
            type="text"
            value={posyanduData.name}
            onChange={(e) => setPosyanduData({ ...posyanduData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kode Posyandu</label>
          <input
            type="text"
            value={posyanduData.code}
            onChange={(e) => setPosyanduData({ ...posyanduData, code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
        <textarea
          value={posyanduData.address}
          onChange={(e) => setPosyanduData({ ...posyanduData, address: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kelurahan</label>
          <input
            type="text"
            value={posyanduData.kelurahan}
            onChange={(e) => setPosyanduData({ ...posyanduData, kelurahan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
          <input
            type="text"
            value={posyanduData.kecamatan}
            onChange={(e) => setPosyanduData({ ...posyanduData, kecamatan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten</label>
          <input
            type="text"
            value={posyanduData.kota}
            onChange={(e) => setPosyanduData({ ...posyanduData, kota: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={posyanduData.phone}
              onChange={(e) => setPosyanduData({ ...posyanduData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={posyanduData.email}
              onChange={(e) => setPosyanduData({ ...posyanduData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ketua Posyandu</label>
          <input
            type="text"
            value={posyanduData.ketua}
            onChange={(e) => setPosyanduData({ ...posyanduData, ketua: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Puskesmas Induk</label>
          <input
            type="text"
            value={posyanduData.puskesmas}
            onChange={(e) => setPosyanduData({ ...posyanduData, puskesmas: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jam Operasional</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={posyanduData.operationalHours}
            onChange={(e) => setPosyanduData({ ...posyanduData, operationalHours: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAkunTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
            {userData.name.charAt(0)}
          </div>
          <button className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50">
            <Camera className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{userData.name}</h3>
          <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
            {userData.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
        <input
          type="tel"
          value={userData.phone}
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-md"
        />
      </div>
    </div>
  );

  const renderNotifikasiTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Pengingat Kunjungan</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Email Reminder</p>
              <p className="text-sm text-gray-500">Kirim pengingat via email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailReminder}
              onChange={(e) => setNotifications({ ...notifications, emailReminder: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">SMS Reminder</p>
              <p className="text-sm text-gray-500">Kirim pengingat via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsReminder}
              onChange={(e) => setNotifications({ ...notifications, smsReminder: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">WhatsApp Reminder</p>
              <p className="text-sm text-gray-500">Kirim pengingat via WhatsApp</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.whatsappReminder}
              onChange={(e) => setNotifications({ ...notifications, whatsappReminder: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          <div className="flex items-center justify-between pt-2">
            <p className="font-medium text-gray-700">Kirim pengingat sebelum</p>
            <select
              value={notifications.reminderDaysBefore}
              onChange={(e) => setNotifications({ ...notifications, reminderDaysBefore: parseInt(e.target.value) })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="1">1 hari</option>
              <option value="2">2 hari</option>
              <option value="3">3 hari</option>
              <option value="7">7 hari</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Notifikasi Sistem</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Pasien Baru</p>
              <p className="text-sm text-gray-500">Notifikasi saat ada pasien baru terdaftar</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newPatientAlert}
              onChange={(e) => setNotifications({ ...notifications, newPatientAlert: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Imunisasi Terlambat</p>
              <p className="text-sm text-gray-500">Notifikasi untuk imunisasi yang terlambat</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.overdueImmunizationAlert}
              onChange={(e) => setNotifications({ ...notifications, overdueImmunizationAlert: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
        </div>
      </Card>
    </div>
  );

  const renderKeamananTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Ubah Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button variant="primary">Ubah Password</Button>
        </div>
      </Card>

      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Sesi Aktif</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Chrome di Windows</p>
              <p className="text-sm text-gray-500">Jakarta, Indonesia • Saat ini aktif</p>
            </div>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Sesi ini
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500">Kelola akun pengguna yang dapat mengakses sistem</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      {/* User List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Telepon</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Login Terakhir</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Bidan' ? 'bg-pink-100 text-pink-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Permissions */}
      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Hak Akses per Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Admin</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Akses penuh ke semua fitur</li>
              <li>✓ Kelola pengguna</li>
              <li>✓ Kelola pengaturan</li>
              <li>✓ Backup & restore data</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">Bidan</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Kelola data pasien</li>
              <li>✓ Catat kunjungan</li>
              <li>✓ Lihat laporan</li>
              <li>✗ Kelola pengguna</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">Kader</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Lihat data pasien</li>
              <li>✓ Catat kunjungan</li>
              <li>✗ Edit data pasien</li>
              <li>✗ Kelola pengguna</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tambah User Baru</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Bidan">Bidan</option>
                  <option value="Kader">Kader</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Awal</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Minimal 8 karakter"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Add new user
                  setUsers([
                    ...users,
                    {
                      id: String(users.length + 1),
                      name: newUser.name,
                      email: newUser.email,
                      phone: newUser.phone,
                      role: newUser.role,
                      status: 'active',
                      lastLogin: '-',
                    },
                  ]);
                  setNewUser({ name: '', email: '', phone: '', role: 'Kader', password: '' });
                  setShowAddUserModal(false);
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Backup Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download backup seluruh data posyandu dalam format Excel atau JSON.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="primary" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backup ke Excel
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backup ke JSON
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Backup terakhir: 20 Januari 2025, 14:30 WIB
        </p>
      </Card>

      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Restore Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload file backup untuk memulihkan data.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Drag & drop file backup atau{' '}
            <button className="text-teal-600 hover:underline">browse</button>
          </p>
          <p className="text-xs text-gray-400 mt-2">Format: .xlsx atau .json</p>
        </div>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <h3 className="font-semibold text-red-900 mb-2">Zona Bahaya</h3>
        <p className="text-sm text-red-700 mb-4">
          Hapus semua data posyandu. Tindakan ini tidak dapat dibatalkan.
        </p>
        <Button variant="danger">Hapus Semua Data</Button>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-1">Kelola pengaturan posyandu dan akun</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Tersimpan!
            </>
          ) : saving ? (
            'Menyimpan...'
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        <div className="pt-2">
          {activeTab === 'profil' && renderProfilTab()}
          {activeTab === 'akun' && renderAkunTab()}
          {activeTab === 'users' && renderUserManagementTab()}
          {activeTab === 'notifikasi' && renderNotifikasiTab()}
          {activeTab === 'keamanan' && renderKeamananTab()}
          {activeTab === 'data' && renderDataTab()}
        </div>
      </Card>
    </div>
  );
}
