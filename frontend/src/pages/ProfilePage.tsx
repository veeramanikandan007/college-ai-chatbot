import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Camera,
  Trash2,
  Eye,
  X,
  Upload,
  User,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  Award,
  BookOpen,
  Building2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* Profile Avatar with Hover Upload Action */}
            <div className="relative group shrink-0">
              <UserAvatar user={user} size="xl" className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-[16px] shadow-sm border border-[#D1D5DB] dark:border-[#3F3F46]" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-[#111827]/80 dark:bg-[#0A0A0A]/85 rounded-[16px] flex flex-col items-center justify-center text-[#FFFFFF] opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Change profile picture"
              >
                <Camera size={20} />
                <span className="text-[10px] font-[700] mt-0.5">Edit</span>
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-[400] px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
                  Student Profile
                </span>
                {user?.avatar_url && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="font-[700] text-[#111827] dark:text-[#FAFAFA] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <span className="text-[#9CA3AF]">•</span>
                    <button
                      onClick={handleRemovePhoto}
                      className="font-[700] text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2]">
                {user?.name || 'Ariana Patel'}
              </h1>
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                {user?.department || 'Computer Science & Engineering'} • {user?.role === 'admin' ? 'Administrator' : '3rd Year Student'}
              </p>

              {/* Quick Upload Action */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 h-[34px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Upload size={14} />
                <span>{user?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shrink-0"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Overview Cards Banner (88px Height matching AI Study Planner) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Student ID</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">STU23911</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Verified Registration</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <User size={16} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Semester</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">6th Semester</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Academic Year 2026</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <GraduationCap size={16} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Attendance</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">94%</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Good Standing</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">CGPA</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">8.9 / 10</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">First Class Distinction</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Award size={16} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Section</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">Section A</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Morning Batch</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Building2 size={16} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Status</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">Active</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Personalized AI Tutor</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Sparkles size={16} />
            </div>
          </div>
        </div>

        {/* Profile Information Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
            <h2 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <User size={18} />
              <span>Contact Information</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                <Mail size={16} className="text-[#6B7280] dark:text-[#A1A1AA] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-[400] uppercase text-[#6B7280] dark:text-[#A1A1AA]">Email Address</p>
                  <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">
                    {user?.email || 'student@mountzion.ac.in'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                <Phone size={16} className="text-[#6B7280] dark:text-[#A1A1AA] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-[400] uppercase text-[#6B7280] dark:text-[#A1A1AA]">Phone Number</p>
                  <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">
                    +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
            <h2 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <BookOpen size={18} />
              <span>Academic Details</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                <Building2 size={16} className="text-[#6B7280] dark:text-[#A1A1AA] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-[400] uppercase text-[#6B7280] dark:text-[#A1A1AA]">Department</p>
                  <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">
                    {user?.department || 'Computer Science & Engineering'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                <GraduationCap size={16} className="text-[#6B7280] dark:text-[#A1A1AA] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-[400] uppercase text-[#6B7280] dark:text-[#A1A1AA]">Role & Standing</p>
                  <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">
                    {user?.role === 'admin' ? 'Administrator' : '3rd Year Undergraduate'}
                  </p>
                </div>
              </div>
            </div>
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

        {/* Full Size Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && user?.avatar_url && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPreviewOpen(false)}
                className="absolute inset-0 bg-[#000000]/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 p-2 bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-lg shadow-2xl border border-[#D1D5DB] dark:border-[#3F3F46]"
              >
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full max-h-[70vh] object-contain rounded-[12px]"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

