"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, api, auth } from "@/lib/api";

interface Role { id: string; code: string; name: string }
interface Dept { id: string; code: string; name: string }
interface Profile {
  id: string;
  employee_number: string | null;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  avatar: string | null;
  last_login_at: string | null;
  password_changed_at: string | null;
  must_change_password: boolean;
  is_active: boolean;
  roles?: Role[];
  departments?: Dept[];
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sed_token") : null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "", confirm_password: "" });

  const loadAvatar = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/users/me/avatar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) { setAvatarUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; }); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAvatarUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    } catch {
      setAvatarUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    }
  };

  const loadProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const p: Profile = res.data;
      setProfile(p);
      setForm({
        full_name: p.full_name || "",
        email: p.email || "",
        phone: p.phone || "",
      });
      if (typeof window !== "undefined") {
        const stored = auth.getUser();
        if (stored) {
          localStorage.setItem("sed_user", JSON.stringify({ ...stored, ...p }));
        }
      }
      await loadAvatar();
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    return () => { setAvatarUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await api.put("/users/me", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      const p: Profile = res.data;
      setProfile(p);
      if (typeof window !== "undefined") {
        const stored = auth.getUser();
        localStorage.setItem("sed_user", JSON.stringify({ ...(stored || {}), ...p }));
      }
      setSuccess("Profil berhasil diperbarui");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true); setError(""); setSuccess("");
    try {
      await api.put("/users/me/change-password", pwd);
      setPwd({ current_password: "", new_password: "", confirm_password: "" });
      setSuccess("Password berhasil diubah");
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password");
    } finally {
      setChangingPwd(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload("/users/me/avatar", fd);
      const p: Profile = res.data;
      setProfile(p);
      if (typeof window !== "undefined") {
        const stored = auth.getUser();
        localStorage.setItem("sed_user", JSON.stringify({ ...(stored || {}), ...p }));
      }
      await loadAvatar();
      setSuccess("Foto profil berhasil diperbarui");
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto profil");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Memuat profil...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-red-600">{error || "Profil tidak ditemukan"}</div>;
  }

  const initials = (profile.full_name || profile.username || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-600 mt-1">Kelola informasi akun, foto profil, dan keamanan.</p>
      </div>

      {error && <div className="mb-4 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 rounded bg-green-50 text-green-700 border border-green-100 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
            <div className="mx-auto w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold overflow-hidden mb-4">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            <p className="font-semibold text-slate-900">{profile.full_name}</p>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <label className="mt-4 inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium cursor-pointer transition-colors">
              {uploadingAvatar ? "Mengunggah..." : "Ubah Foto Profil"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
            <p className="text-xs text-slate-400 mt-2">Format gambar (jpg/png/webp/gif)</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Informasi Akun</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Username</dt><dd className="text-slate-900 font-medium">{profile.username}</dd></div>
              <div><dt className="text-slate-500">NIK / Employee No.</dt><dd className="text-slate-900">{profile.employee_number || "-"}</dd></div>
              <div><dt className="text-slate-500">Jabatan</dt><dd className="text-slate-900">{profile.job_title || "-"}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{profile.is_active ? "Aktif" : "Nonaktif"}</span></dd></div>
              <div><dt className="text-slate-500">Login terakhir</dt><dd className="text-slate-900">{profile.last_login_at ? new Date(profile.last_login_at).toLocaleString("id-ID") : "-"}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Akses & Aktivitas</h2>
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1">Role</p>
              <div className="flex flex-wrap gap-1">{(profile.roles || []).length ? (profile.roles || []).map(r => <span key={r.id} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{r.name || r.code}</span>) : <span className="text-sm text-slate-400">-</span>}</div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Departemen</p>
              <div className="flex flex-wrap gap-1">{(profile.departments || []).length ? (profile.departments || []).map(d => <span key={d.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{d.name || d.code}</span>) : <span className="text-sm text-slate-400">-</span>}</div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/favorites" className="text-blue-600 hover:text-blue-700">★ Dokumen Favorit</Link>
              <Link href="/recently-opened" className="text-blue-600 hover:text-blue-700">🕒 Terakhir Dibuka</Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ubah Profil</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium">
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ganti Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password Saat Ini</label>
                <input type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                  <input type="password" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                  <input type="password" value={pwd.confirm_password} onChange={(e) => setPwd({ ...pwd, confirm_password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                </div>
              </div>
              <button type="submit" disabled={changingPwd} className="px-5 py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-300 font-medium">
                {changingPwd ? "Memproses..." : "Ubah Password"}
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-3">Terakhir diubah: {profile.password_changed_at ? new Date(profile.password_changed_at).toLocaleString("id-ID") : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
