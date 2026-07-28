import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { fetchApi } from '../../lib/api';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth(); // Auth context for user data
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [isSaving, setIsSaving] = useState(false);

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
        body: JSON.stringify({ name, department })
      });
      showToast('Profile updated successfully!', 'success');
      await refreshUser();
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="text-[#0A2A6A]" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account preferences and settings.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 p-4 space-y-1 bg-slate-50/50 dark:bg-slate-800/50">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white dark:bg-slate-700 text-[#0A2A6A] dark:text-white shadow-sm border border-slate-200 dark:border-slate-600' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#163D8C]' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Profile Information</h2>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#E8B24D] text-[#0A2A6A] flex items-center justify-center text-2xl font-black">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{user?.name}</h3>
                    <p className="text-sm text-slate-500">{user?.role === 'admin' ? 'Administrator' : 'Student'} • {user?.department || 'Not specified'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                    <input 
                      type="text" 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C]" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full md:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F1F5F9] dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#0A2A6A] hover:bg-[#163D8C] text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-70"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { title: 'Email Notifications', desc: 'Receive important alerts and updates via email.' },
                    { title: 'Push Notifications', desc: 'Receive real-time alerts on your device.' },
                    { title: 'Assignment Reminders', desc: 'Get reminded 24 hours before an assignment is due.' },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white text-sm">{setting.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0A2A6A]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full md:w-2/3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full md:w-2/3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C]" />
                  </div>
                  <div className="pt-2">
                    <button className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
