'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Mail, Save, ArrowLeft, Eye, EyeOff, Camera } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface ProfileData {
  name: string;
  email: string;
  avatar_url?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        setProfile({
          name: user.user_metadata?.name || '',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  // Upload Avatar
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file tidak boleh lebih dari 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await refreshUser();
      router.refresh();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  // Validasi Profile
  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!profile.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (profile.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validasi Password
  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Password baru harus berbeda dengan password lama';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!validateProfileForm() || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          avatar_url: profile.avatar_url
        }
      });

      if (updateError) throw updateError;

      alert('Profil berhasil disimpan!');
      await refreshUser();
      router.refresh();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      alert('Password berhasil diubah!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Profil</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Password
          </button>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={14} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Klik ikon kamera untuk mengubah foto profil
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                      errors.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-purple-500 bg-white'
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Email tidak dapat diubah"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email tidak dapat diubah untuk keamanan akun
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })
                    }
                    className={`w-full pr-10 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                      errors.currentPassword
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-purple-500 bg-white'
                    }`}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })
                    }
                    className={`w-full pr-10 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                      errors.newPassword
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-purple-500 bg-white'
                    }`}
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                    className={`w-full pr-10 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-purple-500 bg-white'
                    }`}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Save Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}