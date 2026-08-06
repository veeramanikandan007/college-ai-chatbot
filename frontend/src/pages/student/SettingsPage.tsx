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
  ChevronRight,
  Search
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

  const isFaculty = user?.role === 'faculty';

  return (
    <div className={`w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans ${isFaculty ? 'faculty-ui' : ''}`}>
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">


        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Settings & Preferences
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Manage your account, security, notifications, appearance, AI parameters & privacy.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
            {user && (
              <div className="hidden xl:flex items-center gap-2">
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  <User size={15} />
                  {user?.name || 'Student User'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => showToast('Settings reset to system defaults.', 'info')}
                className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset Settings"
              >
                <span>Reset</span>
              </button>
              <button
                onClick={() => handleSaveGenericSetting('Global Settings')}
                className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                title="Save Changes"
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, 24px Gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          <div
            onClick={() => setActiveSection('profile')}
            className={`h-[88px] p-3.5 sm:p-[16px] rounded-[16px] border shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out cursor-pointer hover:-translate-y-[2px] ${
              activeSection === 'appearance'
                ? 'bg-[#111827] dark:bg-[#FAFAFA] border-[#111827] dark:border-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
            }`}
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className={`text-[12px] sm:text-[13px] font-[500] truncate ${activeSection === 'appearance' ? 'opacity-80' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                Appearance
              </p>
              <p className="text-[16px] sm:text-[17px] font-[600] leading-none truncate">Theme & Scale</p>
              <p className={`text-[11px] sm:text-[12px] font-[400] truncate pt-0.5 ${activeSection === 'appearance' ? 'opacity-70' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                Monochrome dark
              </p>
            </div>
            <div className={`w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] flex items-center justify-center shrink-0 ml-2 sm:ml-3 ${
              activeSection === 'appearance'
                ? 'bg-[#FFFFFF]/20 dark:bg-[#111111]/20 text-[#FFFFFF] dark:text-[#111111]'
                : 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
            }`}>
              <Sun size={18} />
            </div>
          </div>

          <div
            onClick={() => setActiveSection('ai_preferences')}
            className={`h-[88px] p-3.5 sm:p-[16px] rounded-[16px] border shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out cursor-pointer hover:-translate-y-[2px] ${
              activeSection === 'ai_preferences'
                ? 'bg-[#111827] dark:bg-[#FAFAFA] border-[#111827] dark:border-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
            }`}
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className={`text-[12px] sm:text-[13px] font-[500] truncate ${activeSection === 'ai_preferences' ? 'opacity-80' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                AI Preferences
              </p>
              <p className="text-[16px] sm:text-[17px] font-[600] leading-none truncate">Models & Memory</p>
              <p className={`text-[11px] sm:text-[12px] font-[400] truncate pt-0.5 ${activeSection === 'ai_preferences' ? 'opacity-70' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                GPT-4o & prompts
              </p>
            </div>
            <div className={`w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] flex items-center justify-center shrink-0 ml-2 sm:ml-3 ${
              activeSection === 'ai_preferences'
                ? 'bg-[#FFFFFF]/20 dark:bg-[#111111]/20 text-[#FFFFFF] dark:text-[#111111]'
                : 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
            }`}>
              <Brain size={18} />
            </div>
          </div>
        </div>

        {/* View Switcher & Filters Toolbar (Matching StudyPlanner view switcher) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-3 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 select-none">
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
            {SETTINGS_NAV.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveSection(nav.id)}
                className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSection === nav.id
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                {nav.icon}
                <span>{nav.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Top Search */}
            <div className="relative flex-1 lg:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search settings..."
                className="w-full h-[38px] sm:h-[40px] pl-9 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Main Section Content Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 md:p-8 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6 select-none">

          {/* 1. PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Profile Settings
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Manage avatar photo, student credentials, department & college profile
                  </p>
                </div>
              </div>

              {/* Profile Photo Card */}
              <div className="p-5 sm:p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-4">
                <span className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                  Student Profile Photo
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <UserAvatar user={user} size="lg" className="border-2 border-[#D1D5DB] dark:border-[#3F3F46]" />

                  <div className="flex-1 space-y-2.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[38px] px-4 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        <Upload size={14} />
                        <span>{user?.avatar_url ? 'Replace Photo' : 'Upload Photo'}</span>
                      </button>

                      {user?.avatar_url && (
                        <button
                          onClick={handleRemovePhoto}
                          className="h-[38px] px-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      Supported formats: JPG, PNG, WebP (Max 2MB). Automatically cropped to 1:1 ratio.
                    </p>

                    {uploadProgress !== null && (
                      <div className="w-full max-w-xs space-y-1 mx-auto sm:mx-0 pt-1">
                        <div className="flex justify-between text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">
                          <span>Uploading photo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E7EB] dark:bg-[#27272A] rounded-full overflow-hidden">
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

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Department / Specialization *
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science Engineering"
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
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
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. ACCOUNT SECTION */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Account Credentials & 2FA
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Manage login credentials, email authentication, password resets and two-factor options
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Primary Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>
              </div>

              {/* 2FA Card */}
              <div className="p-4 sm:p-5 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                    Add an extra layer of security to your account using an authenticator app.
                  </p>
                </div>
                <MonochromeSwitch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
              </div>

              {/* Change Password Card */}
              <div className="p-5 sm:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
                <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGenericSetting('Account')}
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>Save Account Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. APPEARANCE SECTION */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Sun size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Appearance & Display Theme
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Select monochrome light/dark modes, font scaling and high-density compact settings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
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
                        className={`p-5 rounded-[16px] border text-left flex flex-col justify-between transition cursor-pointer space-y-4 hover:-translate-y-[2px] ${
                          isSelected
                            ? 'bg-[#111827] dark:bg-[#FAFAFA] border-[#111827] dark:border-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                            : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
                        }`}
                      >
                        <Icon size={24} />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[14px] font-[500]">{t.label}</span>
                          {isSelected && <Check size={16} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Font Size Scaling
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>Small (13px)</option>
                    <option>Medium (14px Standard)</option>
                    <option>Large (16px)</option>
                  </select>
                </div>

                <div className="p-4 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">Compact Mode</p>
                    <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Reduce padding for high-density displays.</p>
                  </div>
                  <MonochromeSwitch checked={compactMode} onChange={setCompactMode} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGenericSetting('Appearance')}
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>Save Display Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Notification Preferences
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Control push notifications, email digests and academic deadline reminders
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Email Notifications', sub: 'Receive daily digests and important announcements via email.', state: emailNotifs, setState: setEmailNotifs },
                  { label: 'Browser Push Notifications', sub: 'Receive real-time push alerts on your desktop or phone.', state: pushNotifs, setState: setPushNotifs },
                  { label: 'Assignment Alerts', sub: 'Get notified 24 hours before assignment submission deadlines.', state: assignmentAlerts, setState: setAssignmentAlerts },
                  { label: 'Exam & Timetable Alerts', sub: 'Receive reminders for scheduled internal exams and lab sessions.', state: examAlerts, setState: setExamAlerts },
                  { label: 'Placement Hub Alerts', sub: 'Instant alerts when new campus recruitment drives are posted.', state: placementAlerts, setState: setPlacementAlerts },
                  { label: 'AI Nudge Notifications', sub: 'Personalized study suggestions generated by CollegeMate AI.', state: aiNotifs, setState: setAiNotifs },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{item.label}</p>
                      <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">{item.sub}</p>
                    </div>
                    <MonochromeSwitch checked={item.state} onChange={item.setState} />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGenericSetting('Notifications')}
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. PRIVACY SECTION */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Privacy & Data Controls
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Manage profile visibility, data export archives and account deletion
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>Public (Visible to Campus Recruiter & Faculty)</option>
                    <option>Internal (Visible only to Batchmates)</option>
                    <option>Private (Hidden)</option>
                  </select>
                </div>

                <div className="p-4 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">Anonymous Data Analytics Sharing</p>
                    <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Help improve AI study suggestions by sharing anonymized usage metrics.</p>
                  </div>
                  <MonochromeSwitch checked={dataSharing} onChange={setDataSharing} />
                </div>

                {/* Danger Zone Card */}
                <div className="p-5 sm:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#DC2626]/30 dark:border-[#EF4444]/30 shadow-xs space-y-3">
                  <h4 className="text-[16px] font-[700] text-[#DC2626] dark:text-[#EF4444] flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span>Danger Zone</span>
                  </h4>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                    Deleting your account will permanently purge all notes, study plans, OCR scans, and AI history.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to permanently delete your account?')) {
                        showToast('Account deletion request initiated.', 'error');
                      }
                    }}
                    className="h-[38px] px-4 rounded-[12px] bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-[700] text-[13px] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Trash2 size={14} />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. AI PREFERENCES SECTION */}
          {activeSection === 'ai_preferences' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    AI Assistant Preferences
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Configure default model intelligence, response lengths, creativity parameters, and chat memory
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Default AI Model
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>CollegeMate AI (GPT-4o Omnimodal)</option>
                    <option>CollegeMate Fast (Claude 3.5 Haiku)</option>
                    <option>CollegeMate Reasoning (o3-mini Academic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Response Detail & Length
                  </label>
                  <select
                    value={responseLength}
                    onChange={(e) => setResponseLength(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>Concise (Short summaries)</option>
                    <option>Balanced (Standard explanations)</option>
                    <option>Exhaustive (Step-by-step academic proofs)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGenericSetting('AI Preferences')}
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>Save AI Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. APPLICATION SECTION */}
          {activeSection === 'application' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Application Formats & Localization
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Set regional date formats, timezones, interface language and high-contrast accessibility options
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>DD/MM/YYYY (Standard)</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD (ISO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    System Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    <option>(GMT+05:30) India Standard Time</option>
                    <option>(GMT+00:00) UTC Universal Time</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGenericSetting('Application')}
                  className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <Check size={16} />
                  <span>Save Regional Formats</span>
                </button>
              </div>
            </div>
          )}

          {/* 8. SECURITY SECTION */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Active Devices & Login Sessions
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Review authentication logs, active browsers and connected mobile devices
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { device: 'Windows PC (Chrome 128)', loc: 'Chennai, Tamil Nadu, IN', time: 'Current Session (Active)', icon: Laptop, isCurrent: true },
                  { device: 'MacBook Pro (Safari 17)', loc: 'Bangalore, Karnataka, IN', time: 'Logged in 3 hours ago', icon: Laptop, isCurrent: false },
                  { device: 'iPhone 15 Pro (CollegeMate iOS)', loc: 'Chennai, Tamil Nadu, IN', time: 'Logged in Yesterday', icon: Smartphone, isCurrent: false },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="p-4 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{s.device}</p>
                            {s.isCurrent && (
                              <span className="h-[20px] inline-flex items-center rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] px-2 text-[11px] font-[400]">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">{s.loc} • {s.time}</p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={() => showToast(`Revoked session: ${s.device}`, 'info')}
                          className="h-[34px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-[400] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. STORAGE SECTION */}
          {activeSection === 'storage' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <HardDrive size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Storage Allocation & Usage
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Inspect disk allocation for documents, OCR scans, notes, and uploaded question papers
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-3">
                <div className="flex items-center justify-between text-[14px] font-[500]">
                  <span className="text-[#111827] dark:text-[#FAFAFA]">Used Capacity: 2.8 GB / 10 GB</span>
                  <span className="text-[#6B7280] dark:text-[#A1A1AA]">28% Used</span>
                </div>
                <div className="w-full h-2.5 bg-[#E5E7EB] dark:bg-[#27272A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
            </div>
          )}

          {/* 10. ABOUT SECTION */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    About CollegeMate AI
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    System version details, changelogs, privacy terms & customer support links
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">CollegeMate AI v2.4.0</h4>
                    <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Build #2026.08.03 • Premium Monochrome Edition</p>
                  </div>
                  <span className="h-[24px] inline-flex items-center rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] px-3 text-[12px] font-[400]">
                    Up to date
                  </span>
                </div>
              </div>
            </div>
          )}

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

