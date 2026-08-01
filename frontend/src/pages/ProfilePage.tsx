import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Trash2, Eye, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import AvatarCropperModal from '../components/AvatarCropperModal';
import { validateAvatarFile, uploadAvatarImage } from '../services/avatarService';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
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
    try {
      const publicUrl = await uploadAvatarImage(croppedDataUrl);
      updateUser({ avatar_url: publicUrl });
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile photo.');
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ avatar_url: undefined });
    toast.success('Profile photo removed.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body transition-colors duration-300">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              {/* Profile Avatar with Hover Upload Action */}
              <div className="relative group shrink-0">
                <UserAvatar user={user} size="xl" className="shadow-md border-2 border-[#0E2A6D] dark:border-[#D9A441]" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-[#0E2A6D]/70 dark:bg-[#0F172A]/80 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  title="Change profile picture"
                >
                  <Camera size={20} strokeWidth={1.75} />
                  <span className="text-[10px] font-bold mt-0.5">Edit</span>
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Student Profile</p>
                  {user?.avatar_url && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="text-caption text-[#1E4DB7] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <span className="text-[#64748B]">•</span>
                      <button
                        onClick={handleRemovePhoto}
                        className="text-caption text-[#EF4444] hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="mt-1 font-heading text-page font-bold text-[#1F2937] dark:text-[#F8FAFC]">{user?.name || 'Ariana Patel'}</h2>
                <p className="text-small text-[#64748B] dark:text-[#94A3B8]">{user?.department || 'Computer Science'} • {user?.role === 'admin' ? 'Administrator' : '3rd Year Student'}</p>

                {/* Quick Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] transition"
                >
                  <Upload size={14} />
                  <span>{user?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
              </div>
            </div>

            <Link to="/dashboard" className="rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] px-5 py-2.5 font-heading text-nav font-bold text-white shadow-sm transition-colors text-center">
              Back to chat
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Student ID</p>
              <p className="mt-2 font-heading text-card font-bold text-[#1F2937] dark:text-[#F8FAFC]">STU23911</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Email</p>
              <p className="mt-2 font-heading text-card font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate">{user?.email || 'student@mountzion.ac.in'}</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Phone</p>
              <p className="mt-2 font-heading text-card font-bold text-[#1F2937] dark:text-[#F8FAFC]">+91 98765 43210</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Attendance</p>
              <p className="mt-2 font-heading text-card font-bold text-[#22C55E]">94%</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">CGPA</p>
              <p className="mt-2 font-heading text-card font-bold text-[#1F2937] dark:text-[#F8FAFC]">8.9 / 10</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] p-5">
              <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">Semester</p>
              <p className="mt-2 font-heading text-card font-bold text-[#1F2937] dark:text-[#F8FAFC]">6th Semester</p>
            </div>
          </div>
        </motion.div>

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

        {/* Full Size Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && user?.avatar_url && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPreviewOpen(false)}
                className="absolute inset-0 bg-[#0E2A6D]/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 p-2 bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg shadow-2xl border border-[#E2E8F0] dark:border-[#334155]"
              >
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                >
                  <X size={18} />
                </button>
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full max-h-[70vh] object-contain rounded-xl"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
