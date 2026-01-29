'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Users,
  Building,
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
  { id: 'data', label: 'Backup Data', icon: <Database className="w-4 h-4" /> },
];

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  type DbRole = 'admin' | 'bidan' | 'kader';
  type UserStatus = 'active' | 'inactive';
  type ManagedUser = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: DbRole;
    status: UserStatus;
    lastLogin: string | null;
  };

  type RoleLabel = 'Admin' | 'Bidan' | 'User';
  function roleToLabel(role: DbRole): RoleLabel {
    if (role === 'admin') return 'Admin';
    if (role === 'bidan') return 'Bidan';
    return 'User';
  }
  function labelToRole(label: string): DbRole {
    if (label === 'Admin') return 'admin';
    if (label === 'Bidan') return 'bidan';
    return 'kader';
  }

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

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/posyandu', { cache: 'no-store' });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) return;
        const data =
          json && typeof json === 'object' && 'data' in json
            ? (json as Record<string, unknown>).data
            : null;
        if (!data || cancelled) return;

        const dataRec = typeof data === 'object' && data ? (data as Record<string, unknown>) : null;

        const operationalDaysRaw = dataRec?.operational_days;
        const operationalDays = Array.isArray(operationalDaysRaw)
          ? operationalDaysRaw.filter((d): d is string => typeof d === 'string')
          : null;

        setPosyanduData((prev) => ({
          ...prev,
          name: typeof dataRec?.name === 'string' ? dataRec.name : prev.name,
          code: typeof dataRec?.code === 'string' ? dataRec.code : prev.code,
          address: typeof dataRec?.address === 'string' ? dataRec.address : '',
          kelurahan: typeof dataRec?.kelurahan === 'string' ? dataRec.kelurahan : '',
          kecamatan: typeof dataRec?.kecamatan === 'string' ? dataRec.kecamatan : '',
          kota: typeof dataRec?.kota === 'string' ? dataRec.kota : '',
          phone: typeof dataRec?.phone === 'string' ? dataRec.phone : '',
          email: typeof dataRec?.email === 'string' ? dataRec.email : '',
          puskesmas: typeof dataRec?.puskesmas === 'string' ? dataRec.puskesmas : '',
          ketua: typeof dataRec?.ketua === 'string' ? dataRec.ketua : '',
          operationalDays: operationalDays ?? prev.operationalDays,
          operationalHours:
            typeof dataRec?.operational_hours === 'string' ? dataRec.operational_hours : '',
        }));
      } catch {
        // ignore
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('posyandu_last_backup_at');
      if (stored) setLastBackupAt(stored);
    } catch {
      // ignore
    }
  }, []);

  function formatLastBackup(value: string | null) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getFilenameFromContentDisposition(header: string | null) {
    if (!header) return null;
    const match = header.match(/filename\*=UTF-8''([^;]+)|filename="?([^;\"]+)"?/i);
    const raw = (match?.[1] ?? match?.[2])?.trim();
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  async function downloadBackup(format: 'excel' | 'json') {
    setDataError(null);
    setDataMessage(null);
    setBackupLoading(true);
    try {
      const url = format === 'excel' ? '/api/admin/backup/excel' : '/api/admin/backup/json';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(String(msg?.message ?? msg?.error ?? 'Gagal download backup'));
      }

      const blob = await res.blob();
      const filenameFromHeader = getFilenameFromContentDisposition(res.headers.get('content-disposition'));
      const fallback =
        format === 'excel'
          ? `posyandu_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
          : `posyandu_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const filename = filenameFromHeader ?? fallback;

      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);

      const now = new Date().toISOString();
      setLastBackupAt(now);
      try {
        window.localStorage.setItem('posyandu_last_backup_at', now);
      } catch {
        // ignore
      }
      setDataMessage('Backup berhasil diunduh.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal download backup';
      setDataError(message);
    } finally {
      setBackupLoading(false);
    }
  }

  async function restoreBackupFile(file: File) {
    setDataError(null);
    setDataMessage(null);
    setRestoreLoading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      form.set('mode', restoreMode);

      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(String(json?.message ?? json?.error ?? 'Gagal restore data'));
      }

      setDataMessage(
        restoreMode === 'replace'
          ? 'Restore berhasil (mode replace: data lama dihapus lalu diisi ulang).'
          : 'Restore berhasil (mode merge: data digabung/upsert).'
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal restore data';
      setDataError(message);
    } finally {
      setRestoreLoading(false);
    }
  }

  async function wipeAllData() {
    setDataError(null);
    setDataMessage(null);
    const confirm = window.prompt('Ketik HAPUS untuk konfirmasi hapus semua data posyandu:');
    if (confirm !== 'HAPUS') return;

    setWipeLoading(true);
    try {
      const res = await fetch('/api/admin/backup/wipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'HAPUS' }),
        credentials: 'include',
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(String(json?.message ?? json?.error ?? 'Gagal menghapus semua data'));
      }

      setDataMessage('Semua data posyandu berhasil dihapus.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menghapus semua data';
      setDataError(message);
    } finally {
      setWipeLoading(false);
    }
  }

  // Akun Saya
  const [userData, setUserData] = useState({
    name: 'Admin Posyandu',
    email: 'admin@posyandu-melati.com',
    phone: '081234567890',
    role: 'Admin',
  });

  // Users list
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'User',
    password: '',
  });

  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: RoleLabel;
    password: string;
  } | null>(null);

  const canManageUsers = useMemo(() => {
    return activeTab === 'users';
  }, [activeTab]);

  const loadUsers = useCallback(async () => {
    setUsersError(null);
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store', credentials: 'include' });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object'
            ? (json as Record<string, unknown>).hint ??
              (json as Record<string, unknown>).message ??
              (json as Record<string, unknown>).error
            : null;
        setUsersError(String(msg ?? 'Gagal memuat user'));
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      const dataRaw =
        json && typeof json === 'object' && 'data' in json
          ? (json as Record<string, unknown>).data
          : null;
      const currentIdRaw =
        json && typeof json === 'object' && 'currentUserId' in json
          ? (json as Record<string, unknown>).currentUserId
          : null;

      setCurrentUserId(typeof currentIdRaw === 'string' ? currentIdRaw : null);

      if (!Array.isArray(dataRaw)) {
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      const parsedUsers: ManagedUser[] = dataRaw
        .map((u) => {
          if (!u || typeof u !== 'object') return null;
          const rec = u as Record<string, unknown>;
          const role = rec.role;
          if (role !== 'admin' && role !== 'bidan' && role !== 'kader') return null;
          const status = rec.status === 'inactive' ? 'inactive' : 'active';
          return {
            id: String(rec.id ?? ''),
            name: typeof rec.name === 'string' ? rec.name : '-',
            email: typeof rec.email === 'string' ? rec.email : null,
            phone: typeof rec.phone === 'string' ? rec.phone : null,
            role,
            status,
            lastLogin: typeof rec.lastLogin === 'string' ? rec.lastLogin : null,
          };
        })
        .filter((x): x is ManagedUser => !!x && x.id.length > 0);

      setUsers(parsedUsers);
      setUsersLoading(false);
    } catch {
      setUsersError('Gagal memuat user');
      setUsers([]);
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManageUsers) return;
    void loadUsers();
  }, [canManageUsers, loadUsers]);

  const handleCreateUser = async () => {
    setUsersError(null);
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: labelToRole(newUser.role),
        password: newUser.password,
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object'
            ? (json as Record<string, unknown>).hint ??
              (json as Record<string, unknown>).message ??
              (json as Record<string, unknown>).error
            : null;
        setUsersError(String(msg ?? 'Gagal membuat user'));
        return;
      }

      setNewUser({ name: '', email: '', phone: '', role: 'User', password: '' });
      setShowAddUserModal(false);
      await loadUsers();
    } catch {
      setUsersError('Gagal membuat user');
    }
  };

  const handleDevBootstrapAdmin = async () => {
    setUsersError(null);
    try {
      const res = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object'
            ? (json as Record<string, unknown>).hint ??
              (json as Record<string, unknown>).message ??
              (json as Record<string, unknown>).error
            : null;
        setUsersError(String(msg ?? 'Gagal bootstrap admin'));
        return;
      }

      await loadUsers();
    } catch {
      setUsersError('Gagal bootstrap admin');
    }
  };

  const handleOpenEdit = (u: ManagedUser) => {
    setEditingUser({
      id: u.id,
      name: u.name,
      email: u.email ?? '',
      phone: u.phone ?? '',
      role: roleToLabel(u.role),
      password: '',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setUsersError(null);
    try {
      const payload: Record<string, unknown> = {
        name: editingUser.name,
        phone: editingUser.phone,
        role: labelToRole(editingUser.role),
      };
      if (editingUser.email.trim().length > 0) payload.email = editingUser.email.trim();
      if (editingUser.password.trim().length > 0) payload.password = editingUser.password.trim();

      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object'
            ? (json as Record<string, unknown>).hint ??
              (json as Record<string, unknown>).message ??
              (json as Record<string, unknown>).error
            : null;
        setUsersError(String(msg ?? 'Gagal update user'));
        return;
      }

      setShowEditUserModal(false);
      setEditingUser(null);
      await loadUsers();
    } catch {
      setUsersError('Gagal update user');
    }
  };

  const handleDeleteUser = async (u: ManagedUser) => {
    setUsersError(null);
    if (currentUserId && u.id === currentUserId) {
      setUsersError('Tidak bisa menghapus akun yang sedang dipakai.');
      return;
    }
    const ok = window.confirm(`Hapus user "${u.name}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object'
            ? (json as Record<string, unknown>).hint ??
              (json as Record<string, unknown>).message ??
              (json as Record<string, unknown>).error
            : null;
        setUsersError(String(msg ?? 'Gagal menghapus user'));
        return;
      }

      await loadUsers();
    } catch {
      setUsersError('Gagal menghapus user');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    // Persist only Profil Posyandu for now.
    if (activeTab === 'profil') {
      try {
        const res = await fetch('/api/settings/posyandu', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(posyanduData),
        });

        if (!res.ok) {
          const json: unknown = await res.json().catch(() => null);
          const msg =
            json && typeof json === 'object'
              ? (json as Record<string, unknown>).hint ??
                (json as Record<string, unknown>).message ??
                (json as Record<string, unknown>).error
              : null;
          setSaveError(String(msg));
          setSaving(false);
          return;
        }

        const json: unknown = await res.json().catch(() => null);
        const data =
          json && typeof json === 'object' && 'data' in json
            ? (json as Record<string, unknown>).data
            : null;

        const dataRec = typeof data === 'object' && data ? (data as Record<string, unknown>) : null;
        if (dataRec) {
          const operationalDaysRaw = dataRec.operational_days;
          const operationalDays = Array.isArray(operationalDaysRaw)
            ? operationalDaysRaw.filter((d): d is string => typeof d === 'string')
            : null;

          setPosyanduData((prev) => ({
            ...prev,
            name: typeof dataRec.name === 'string' ? dataRec.name : prev.name,
            code: typeof dataRec.code === 'string' ? dataRec.code : prev.code,
            address: typeof dataRec.address === 'string' ? dataRec.address : '',
            kelurahan: typeof dataRec.kelurahan === 'string' ? dataRec.kelurahan : '',
            kecamatan: typeof dataRec.kecamatan === 'string' ? dataRec.kecamatan : '',
            kota: typeof dataRec.kota === 'string' ? dataRec.kota : '',
            phone: typeof dataRec.phone === 'string' ? dataRec.phone : '',
            email: typeof dataRec.email === 'string' ? dataRec.email : '',
            puskesmas: typeof dataRec.puskesmas === 'string' ? dataRec.puskesmas : '',
            ketua: typeof dataRec.ketua === 'string' ? dataRec.ketua : '',
            operationalDays: operationalDays ?? prev.operationalDays,
            operationalHours:
              typeof dataRec.operational_hours === 'string' ? dataRec.operational_hours : '',
          }));
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        return;
      } catch {
        setSaveError('Gagal menyimpan pengaturan');
        setSaving(false);
        return;
      }
    }

    // Fallback for other tabs (mock behavior).
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderProfilTab = () => (
    <div className="space-y-6">
      {/* Logo & Header */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-xl bg-linear-to-br from-teal-100 to-teal-200 flex items-center justify-center">
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
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
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


  const renderUserManagementTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500">Kelola akun pengguna yang dapat mengakses sistem</p>
          {usersError && <p className="text-sm text-red-600 mt-2">{usersError}</p>}

          {usersError &&
            typeof window !== 'undefined' &&
            window.location.hostname === 'localhost' &&
            (usersError.toLowerCase().includes('bukan admin') || usersError.toLowerCase().includes('forbidden')) && (
              <button
                type="button"
                onClick={handleDevBootstrapAdmin}
                className="mt-3 text-xs text-teal-700 hover:text-teal-800 underline"
              >
                Jadikan akun saya Admin (dev)
              </button>
            )}
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
        {usersLoading ? (
          <div className="p-6 text-sm text-gray-600">Memuat user...</div>
        ) : (
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
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email ?? '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.phone ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'bidan' ? 'bg-pink-100 text-pink-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>
                      {roleToLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
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
        )}
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
              <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">User</span>
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
                  <option value="User">User</option>
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

              {usersError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {usersError}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateUser}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500 mt-1">ID: {editingUser.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as RoleLabel })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Bidan">Bidan</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru (opsional)</label>
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Kosongkan jika tidak diubah"
                />
              </div>

              {usersError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {usersError}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
              >
                Batal
              </Button>
              <Button variant="primary" onClick={handleUpdateUser}>
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
          <Button
            variant="primary"
            className="flex items-center gap-2"
            disabled={backupLoading || restoreLoading || wipeLoading}
            onClick={() => downloadBackup('excel')}
          >
            <Database className="w-4 h-4" />
            {backupLoading ? 'Menyiapkan...' : 'Backup ke Excel'}
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            disabled={backupLoading || restoreLoading || wipeLoading}
            onClick={() => downloadBackup('json')}
          >
            <Database className="w-4 h-4" />
            {backupLoading ? 'Menyiapkan...' : 'Backup ke JSON'}
          </Button>
        </div>

        {formatLastBackup(lastBackupAt) && (
          <p className="text-xs text-gray-500 mt-3">Backup terakhir: {formatLastBackup(lastBackupAt)}</p>
        )}

        {(dataError || dataMessage) && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              dataError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {dataError ?? dataMessage}
          </div>
        )}
      </Card>

      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Restore Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload file backup untuk memulihkan data.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-700">Mode restore:</label>
          <select
            value={restoreMode}
            onChange={(e) => setRestoreMode(e.target.value === 'replace' ? 'replace' : 'merge')}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
            disabled={backupLoading || restoreLoading || wipeLoading}
          >
            <option value="merge">Merge (Upsert)</option>
            <option value="replace">Replace (Hapus lalu restore)</option>
          </select>
        </div>

        <input
          ref={restoreFileInputRef}
          type="file"
          accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void restoreBackupFile(file);
            e.target.value = '';
          }}
          disabled={backupLoading || restoreLoading || wipeLoading}
        />

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            void restoreBackupFile(file);
          }}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Drag & drop file backup atau{' '}
            <button
              type="button"
              className="text-teal-600 hover:underline"
              onClick={() => restoreFileInputRef.current?.click()}
              disabled={backupLoading || restoreLoading || wipeLoading}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400 mt-2">Format: .xlsx atau .json</p>
          {restoreLoading && <p className="text-xs text-gray-500 mt-3">Memulihkan data...</p>}
        </div>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <h3 className="font-semibold text-red-900 mb-2">Zona Bahaya</h3>
        <p className="text-sm text-red-700 mb-4">
          Hapus semua data posyandu. Tindakan ini tidak dapat dibatalkan.
        </p>
        <Button
          variant="danger"
          disabled={backupLoading || restoreLoading || wipeLoading}
          onClick={() => void wipeAllData()}
        >
          {wipeLoading ? 'Menghapus...' : 'Hapus Semua Data'}
        </Button>
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
          {saveError && (
            <p className="text-sm text-red-600 mt-2">{saveError}</p>
          )}
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
          {activeTab === 'data' && renderDataTab()}
        </div>
      </Card>
    </div>
  );
}
