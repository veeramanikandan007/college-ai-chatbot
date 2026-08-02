import React, { useState, useEffect, useRef } from 'react';
import { Settings, User, Bell, Shield, LogOut, Loader2, Camera, Trash2, Upload, Eye, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { fetchApi } from '../../lib/api';
import UserAvatar from '../../components/UserAvatar';
import AvatarCropperModal from '../../components/AvatarCropperModal';
import { validateAvatarFile, uploadAvatarImage } from '../../services/avatarService';

export default function SettingsPage() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload states
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await fetchApi('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name, department }),
      });
      showToast('Profile updated successfully!', 'success');
      await refreshUser();
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setUploadProgress(20);
    try {
      setTimeout(() => setUploadProgress(60), 150);
      const publicUrl = await uploadAvatarImage(croppedDataUrl);
      setUploadProgress(100);
      setTimeout(() => {
        updateUser({ avatar_url: publicUrl });
        setUploadProgress(null);
        showToast('Profile photo updated!', 'success');
      }, 300);
    } catch (err) {
      setUploadProgress(null);
      showToast('Could not save profile photo.', 'error');
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ avatar_url: undefined });
    showToast('Profile photo removed.', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body transition-colors duration-300">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
            <Settings className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
            Settings
          </h1>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Manage your account preferences and profile photo.</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E2E8F0] dark:border-[#334155] p-4 space-y-1.5 bg-[#F5F7FB]/50 dark:bg-[#111827]/50">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-heading text-nav font-bold tracking-[0.02em] transition-all duration-180 ${
                    isActive
                      ? 'bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#60A5FA] shadow-xs border border-[#E2E8F0] dark:border-[#334155]'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#0E2A6D] dark:text-[#60A5FA]' : 'text-[#64748B]'} />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-heading text-nav font-bold tracking-[0.02em] text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  Profile Information
                </h2>

                {/* Profile Photo Uploader Section */}
                <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] space-y-3">
                  <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">
                    Student Profile Photo
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <UserAvatar user={user} size="lg" className="border-2 border-[#0E2A6D] dark:border-[#D9A441]" />

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-[38px] px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-heading text-caption font-bold flex items-center gap-2 transition"
                        >
                          <Upload size={14} />
                          <span>{user?.avatar_url ? 'Replace Photo' : 'Upload Photo'}</span>
                        </button>

                        {user?.avatar_url && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="h-[38px] px-3 rounded-xl border border-[#EF4444]/30 bg-rose-50 dark:bg-rose-900/20 text-[#EF4444] font-heading text-caption font-bold flex items-center gap-1.5 hover:bg-rose-100 transition"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">
                        Allowed formats: JPG, PNG, WebP (Max 2MB). Auto 1:1 cropping.
                      </p>

                      {/* Progress Bar */}
                      {uploadProgress !== null && (
                        <div className="w-full max-w-xs space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-[#0E2A6D] dark:text-[#60A5FA]">
                            <span>Uploading photo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#334155] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0E2A6D] dark:bg-[#60A5FA] transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3.5 text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3.5 text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="h-11 px-6 bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-btn rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  Notification Preferences
                </h2>
                <p className="text-body text-[#64748B] dark:text-[#94A3B8]">Configure email and push notification alerts for campus updates.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  Security Settings
                </h2>
                <p className="text-body text-[#64748B] dark:text-[#94A3B8]">Manage your password, active sessions, and multi-factor authentication.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Avatar Cropper Modal */}
        {rawImageSrc && (
          <AvatarCropperModal
            isOpen={isCropperOpen}
            onClose={() => {
              setIsCropperOpen(false);
              setRawImageSrc(null);
            }}
            imageSrc={rawImageSrc}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </div>
  );
}
