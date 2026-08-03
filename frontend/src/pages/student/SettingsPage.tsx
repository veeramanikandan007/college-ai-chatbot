import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Eye,
  Brain,
  Sliders,
  Lock,
  HardDrive,
  Info,
  LogOut,
  Upload,
  Trash2,
  Check,
  Moon,
  Sun,
  Laptop,
  KeyRound,
  Smartphone,
  History,
  FileText,
  Download,
  AlertTriangle,
  Globe,
  Clock,
  Sparkles,
  Database,
  HelpCircle,
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { fetchApi } from '../../lib/api';
import UserAvatar from '../../components/UserAvatar';
import AvatarCropperModal from '../../components/AvatarCropperModal';
import { validateAvatarFile, uploadAvatarImage } from '../../services/avatarService';

type SettingsSection =
  | 'profile'
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'ai_preferences'
  | 'application'
  | 'security'
  | 'storage'
  | 'about';

interface SectionItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SETTINGS_NAV: SectionItem[] = [
  { id: 'profile', label: 'Profile', description: 'Personal info & profile photo', icon: <User size={18} /> },
  { id: 'account', label: 'Account', description: 'Login details & authentication', icon: <Shield size={18} /> },
  { id: 'appearance', label: 'Appearance', description: 'Theme & display options', icon: <Sun size={18} /> },
  { id: 'notifications', label: 'Notifications', description: 'Alerts & email preferences', icon: <Bell size={18} /> },
  { id: 'privacy', label: 'Privacy', description: 'Data sharing & account data', icon: <Eye size={18} /> },
  { id: 'ai_preferences', label: 'AI Preferences', description: 'Model choices & behavior', icon: <Brain size={18} /> },
  { id: 'application', label: 'Application', description: 'Language, timezone & formats', icon: <Sliders size={18} /> },
  { id: 'security', label: 'Security', description: 'Sessions & active devices', icon: <Lock size={18} /> },
  { id: 'storage', label: 'Storage', description: 'Disk usage & uploads', icon: <HardDrive size={18} /> },
  { id: 'about', label: 'About', description: 'System version & legal docs', icon: <Info size={18} /> },
];

export default function SettingsPage() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const { themeMode, setThemeMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // 1. Profile State
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [college, setCollege] = useState('College of Engineering & Technology');
  const [year, setYear] = useState('Final Year (4th Year)');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar Upload States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // 2. Account State
  const [username, setUsername] = useState(user?.email?.split('@')[0] || 'student_user');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 3. Appearance State
  const [fontSize, setFontSize] = useState('Medium');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // 4. Notifications State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);
  const [placementAlerts, setPlacementAlerts] = useState(true);
  const [aiNotifs, setAiNotifs] = useState(false);

  // 5. Privacy State
  const [profileVisibility, setProfileVisibility] = useState('Public');
  const [dataSharing, setDataSharing] = useState(true);

  // 6. AI Preferences State
  const [aiModel, setAiModel] = useState('CollegeMate AI (GPT-4o)');
  const [responseLength, setResponseLength] = useState('Balanced');
  const [creativityLevel, setCreativityLevel] = useState('0.7 (Standard)');
  const [aiLanguage, setAiLanguage] = useState('English (US)');
  const [aiMemoryEnabled, setAiMemoryEnabled] = useState(true);
  const [chatHistorySaved, setChatHistorySaved] = useState(true);

  // 7. Application State
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12 Hours (AM/PM)');
  const [timezone, setTimezone] = useState('(GMT+05:30) India Standard Time');
  const [appLanguage, setAppLanguage] = useState('English');
  const [highContrastMode, setHighContrastMode] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || '');
      setEmail(user.email || '');
      setUsername(user.email?.split('@')[0] || 'student_user');
    }
  }, [user]);

  // Profile Save
  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
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
      setIsSavingProfile(false);
    }
  };

  // Avatar Upload Handlers
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

  const handleSaveGenericSetting = (sectionName: string) => {
    showToast(`${sectionName} preferences saved successfully!`, 'success');
  };

  // Custom Monochrome Switch Toggle
  const MonochromeSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out outline-none ${
        checked
          ? 'bg-[#111827] dark:bg-[#FAFAFA]'
          : 'bg-[#E5E7EB] dark:bg-[#2A2A2A]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#FFFFFF] dark:bg-[#111111] shadow-xs transition duration-150 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                Settings & Preferences
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Central Control Hub
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Configure your account, AI preferences, security, notifications, and application settings.
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-[14px] font-medium transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. SETTINGS LAYOUT (SIDEBAR NAVIGATION & MAIN CONTENT)                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar Menu */}
          <div className="lg:col-span-3 bg-[#FFFFFF] dark:bg-[#181818] p-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-1">
            {SETTINGS_NAV.map((nav) => {
              const isActive = activeSection === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveSection(nav.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-[8px] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#6B7280] dark:text-[#A3A3A3]'}>
                      {nav.icon}
                    </span>
                    <div className="text-left">
                      <p className="text-[14px] font-bold leading-none">{nav.label}</p>
                      <p className={`text-[12px] mt-1 line-clamp-1 ${isActive ? 'opacity-80' : 'text-[#6B7280] dark:text-[#A3A3A3]'}`}>
                        {nav.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={isActive ? 'opacity-100' : 'opacity-40'} />
                </button>
              );
            })}
          </div>

          {/* Main Settings Panel */}
          <div className="lg:col-span-9 bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">

            {/* --------------------------------------------------------------------- */}
            {/* 1. PROFILE SECTION                                                    */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Profile Settings</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Manage your avatar photo and student profile identification details.
                  </p>
                </div>

                {/* Profile Photo Uploader */}
                <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-4">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    Student Profile Photo
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <UserAvatar user={user} size="lg" className="border-2 border-[#D1D5DB] dark:border-[#3F3F46]" />

                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="h-9 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <Upload size={14} />
                          <span>{user?.avatar_url ? 'Replace Photo' : 'Upload Photo'}</span>
                        </button>

                        {user?.avatar_url && (
                          <button
                            onClick={handleRemovePhoto}
                            className="h-9 px-4 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                        Supported formats: JPG, PNG, WebP (Max 2MB). Automatically cropped to 1:1 ratio.
                      </p>

                      {uploadProgress !== null && (
                        <div className="w-full max-w-xs space-y-1">
                          <div className="flex justify-between text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                            <span>Uploading photo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#111827] dark:bg-[#FAFAFA] transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Department / Specialization *
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science Engineering"
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>1st Year (Freshman)</option>
                      <option>2nd Year (Sophomore)</option>
                      <option>3rd Year (Junior)</option>
                      <option>Final Year (4th Year)</option>
                      <option>Postgraduate / Alum</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isSavingProfile}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 2. ACCOUNT SECTION                                                    */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Account Credentials</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Manage your username, primary email, password, and two-factor authentication.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Primary Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>
                </div>

                {/* 2FA Card */}
                <div className="p-5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">Two-Factor Authentication (2FA)</p>
                    <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                      Add an extra layer of security to your CollegeMate account using an authenticator app.
                    </p>
                  </div>
                  <MonochromeSwitch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                </div>

                {/* Change Password Sub-form */}
                <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
                  <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">Change Account Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveGenericSetting('Account')}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Save Account Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 3. APPEARANCE SECTION                                                 */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Appearance & Display</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Customize CollegeMate AI interface themes, font size scaling, and animation density.
                  </p>
                </div>

                {/* Theme Mode Selector Cards */}
                <div className="space-y-3">
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    Interface Theme Mode
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light Mode', icon: Sun },
                      { id: 'dark', label: 'Dark Mode', icon: Moon },
                      { id: 'system', label: 'System Sync', icon: Laptop },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = themeMode === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setThemeMode(t.id as ThemeMode)}
                          className={`p-5 rounded-[12px] border text-left flex flex-col justify-between transition cursor-pointer space-y-4 ${
                            isSelected
                              ? 'bg-[#111827] dark:bg-[#FAFAFA] border-[#111827] dark:border-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                              : 'bg-[#FFFFFF] dark:bg-[#181818] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
                          }`}
                        >
                          <Icon size={24} />
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[14px] font-bold">{t.label}</span>
                            {isSelected && <Check size={16} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Font Size Scaling
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>Small (13px)</option>
                      <option>Medium (14px Standard)</option>
                      <option>Large (16px)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">Compact Mode</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Reduce padding for high-density displays.</p>
                    </div>
                    <MonochromeSwitch checked={compactMode} onChange={setCompactMode} />
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">UI Animations</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Enable smooth 150ms state transitions.</p>
                    </div>
                    <MonochromeSwitch checked={animationsEnabled} onChange={setAnimationsEnabled} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveGenericSetting('Appearance')}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Save Display Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 4. NOTIFICATIONS SECTION                                              */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Notification Preferences</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Control how and when CollegeMate AI sends alerts and reminders.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', sub: 'Receive daily digests and important announcements via email.', state: emailNotifs, setState: setEmailNotifs },
                    { label: 'Browser Push Notifications', sub: 'Receive real-time push alerts on your desktop or phone.', state: pushNotifs, setState: setPushNotifs },
                    { label: 'Assignment Alerts', sub: 'Get notified 24 hours before assignment submission deadlines.', state: assignmentAlerts, setState: setAssignmentAlerts },
                    { label: 'Exam & Timetable Alerts', sub: 'Receive reminders for scheduled internal exams and lab sessions.', state: examAlerts, setState: setExamAlerts },
                    { label: 'Placement Hub Alerts', sub: 'Instant alerts when new campus recruitment drives are posted.', state: placementAlerts, setState: setPlacementAlerts },
                    { label: 'AI Nudge Notifications', sub: 'Personalized study suggestions generated by CollegeMate AI.', state: aiNotifs, setState: setAiNotifs },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">{item.label}</p>
                        <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">{item.sub}</p>
                      </div>
                      <MonochromeSwitch checked={item.state} onChange={item.setState} />
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveGenericSetting('Notifications')}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Save Notification Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 5. PRIVACY SECTION                                                    */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Privacy & Data Control</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Manage visibility of your profile, data export, and account deletion options.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Profile Visibility
                    </label>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>Public (Visible to Campus Recruiter & Faculty)</option>
                      <option>Internal (Visible only to Batchmates)</option>
                      <option>Private (Hidden)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">Anonymous Data Analytics Sharing</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Help improve AI study suggestions by sharing anonymized usage metrics.</p>
                    </div>
                    <MonochromeSwitch checked={dataSharing} onChange={setDataSharing} />
                  </div>

                  <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">Export My Personal Data</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Download a ZIP archive containing all your notes, quiz logs, and OCR files.</p>
                    </div>
                    <button
                      onClick={() => showToast('Data export zip archive requested. Check your email shortly.', 'info')}
                      className="h-9 px-4 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download size={14} />
                      <span>Download Archive</span>
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-3">
                    <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Danger Zone
                    </h3>
                    <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
                      Deleting your account will permanently purge all notes, study plans, OCR scans, and AI history.
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete your CollegeMate AI account?')) {
                          showToast('Account deletion request initiated.', 'error');
                        }
                      }}
                      className="h-9 px-4 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 6. AI PREFERENCES SECTION                                            */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'ai_preferences' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">AI Assistant Preferences</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Configure default model intelligence, response lengths, creativity parameters, and chat memory.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Default AI Model
                    </label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>CollegeMate AI (GPT-4o Omnimodal)</option>
                      <option>CollegeMate Fast (Claude 3.5 Haiku)</option>
                      <option>CollegeMate Reasoning (o3-mini Academic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Response Detail & Length
                    </label>
                    <select
                      value={responseLength}
                      onChange={(e) => setResponseLength(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>Concise (Short summaries)</option>
                      <option>Balanced (Standard explanations)</option>
                      <option>Exhaustive (Step-by-step academic proofs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Creativity & Temperature
                    </label>
                    <select
                      value={creativityLevel}
                      onChange={(e) => setCreativityLevel(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>0.2 (Factual & Strict)</option>
                      <option>0.7 (Standard Academic)</option>
                      <option>1.0 (Creative Brainstorming)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Primary Response Language
                    </label>
                    <select
                      value={aiLanguage}
                      onChange={(e) => setAiLanguage(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>English (US)</option>
                      <option>Hindi (India)</option>
                      <option>Tamil (India)</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">AI Persistent Context Memory</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Allow AI to remember previous study sessions and project context.</p>
                    </div>
                    <MonochromeSwitch checked={aiMemoryEnabled} onChange={setAiMemoryEnabled} />
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">Auto-Save Chat History</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Automatically save conversation transcripts to Document Hub.</p>
                    </div>
                    <MonochromeSwitch checked={chatHistorySaved} onChange={setChatHistorySaved} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveGenericSetting('AI Preferences')}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Save AI Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 7. APPLICATION SECTION                                               */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'application' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Application Localization & Formats</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Set regional date formats, timezones, interface language, and accessibility features.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>DD/MM/YYYY (Standard)</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Time Format
                    </label>
                    <select
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>12 Hours (AM/PM)</option>
                      <option>24 Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      System Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>(GMT+05:30) India Standard Time</option>
                      <option>(GMT+00:00) UTC Universal Time</option>
                      <option>(GMT-05:00) Eastern Time (US)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                      Interface Language
                    </label>
                    <select
                      value={appLanguage}
                      onChange={(e) => setAppLanguage(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">High Contrast Accessibility Mode</p>
                    <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Enhance text borders and readability contrast.</p>
                  </div>
                  <MonochromeSwitch checked={highContrastMode} onChange={setHighContrastMode} />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveGenericSetting('Application')}
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Save Regional Formats</span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 8. SECURITY SECTION                                                   */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Security & Active Logins</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Review recent authentication activity, active devices, and current browser sessions.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <Smartphone size={18} />
                    Active Devices & Sessions
                  </h3>

                  <div className="space-y-3">
                    {[
                      { device: 'Windows PC (Chrome 128)', loc: 'Chennai, Tamil Nadu, IN', time: 'Current Session (Active)', icon: Laptop, isCurrent: true },
                      { device: 'MacBook Pro (Safari 17)', loc: 'Bangalore, Karnataka, IN', time: 'Logged in 3 hours ago', icon: Laptop, isCurrent: false },
                      { device: 'iPhone 15 Pro (CollegeMate iOS)', loc: 'Chennai, Tamil Nadu, IN', time: 'Logged in Yesterday', icon: Smartphone, isCurrent: false },
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <div key={idx} className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                              <Icon size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">{s.device}</p>
                                {s.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-[4px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[10px] font-bold uppercase tracking-wider">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">{s.loc} • {s.time}</p>
                            </div>
                          </div>

                          {!s.isCurrent && (
                            <button
                              onClick={() => showToast(`Revoked session: ${s.device}`, 'info')}
                              className="h-8 px-3 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 9. STORAGE SECTION                                                    */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'storage' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Storage Usage</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    Inspect disk allocation for documents, OCR scans, notes, and uploaded question papers.
                  </p>
                </div>

                {/* Storage Bar Card */}
                <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-4">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">Used Capacity: 2.8 GB / 10 GB</span>
                    <span className="font-bold text-[#6B7280] dark:text-[#A3A3A3]">28% Used</span>
                  </div>
                  <div className="w-full h-3 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Documents & PDFs', val: '1.4 GB', sub: '142 files' },
                    { label: 'OCR Image Scans', val: '950 MB', sub: '86 scans' },
                    { label: 'Notes & Transcripts', val: '450 MB', sub: '320 items' },
                  ].map((st, i) => (
                    <div key={i} className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-1">
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] uppercase tracking-wider">{st.label}</p>
                      <p className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA]">{st.val}</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">{st.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* 10. ABOUT SECTION                                                     */}
            {/* --------------------------------------------------------------------- */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">About CollegeMate AI</h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                    System version, release updates, support contacts, and legal policy documentation.
                  </p>
                </div>

                <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">CollegeMate AI v2.4.0</h3>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Build #2026.08.03 • Premium Monochrome Edition</p>
                    </div>
                    <span className="px-3 py-1 rounded-[6px] text-[12px] font-bold bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
                      Up to date
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Release Notes & Changelog', icon: FileText },
                    { label: 'Terms of Service', icon: FileText },
                    { label: 'Privacy Policy', icon: Shield },
                    { label: 'Contact Support Team', icon: Mail },
                  ].map((ab, idx) => {
                    const Icon = ab.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => showToast(`Navigating to ${ab.label}`, 'info')}
                        className="p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between text-left hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                          <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">{ab.label}</span>
                        </div>
                        <ExternalLink size={14} className="text-[#6B7280] dark:text-[#A3A3A3]" />
                      </button>
                    );
                  })}
                </div>
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
