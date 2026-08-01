import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, BarChart3, Bell, RefreshCw, Trash2,
  CheckCircle2, XCircle, Upload, ShieldAlert, AlertCircle,
  Settings, GraduationCap, Sparkles, TrendingUp, MessageSquare,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ── Mock data ────────────────────────────────────────────────
const mockStats = [
  { label: 'Total Students', value: 128, icon: Users, color: 'from-[#0E2A6D] to-[#1E4DB7]', trend: '+12 this month' },
  { label: 'Chat Sessions', value: 3_842, icon: MessageSquare, color: 'from-[#22C55E] to-emerald-600', trend: '+234 this week' },
  { label: 'Documents Indexed', value: 47, icon: FileText, color: 'from-[#D9A441] to-amber-500', trend: '3 pending rebuild' },
  { label: 'Broadcasts Sent', value: 19, icon: Bell, color: 'from-[#1E4DB7] to-indigo-600', trend: 'Last: 2 days ago' },
];

const mockStudents = [
  { id: 1, name: 'Rahul Verma', email: 'rahul@college.edu', dept: 'CSE', active: true },
  { id: 2, name: 'Priya Sharma', email: 'priya@college.edu', dept: 'ECE', active: true },
  { id: 3, name: 'Ankit Patel', email: 'ankit@college.edu', dept: 'MECH', active: false },
];

const mockDocuments = [
  { name: 'college_regulations_2024.pdf', size: '1.2 MB', indexed: true },
  { name: 'library_handbook.pdf', size: '780 KB', indexed: true },
  { name: 'exam_schedule_oct2026.pdf', size: '320 KB', indexed: false },
];

type AdminTab = 'overview' | 'students' | 'documents' | 'rag' | 'broadcast' | 'analytics';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [students, setStudents] = useState(mockStudents);
  const [documents, setDocuments] = useState(mockDocuments);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'rag', label: 'RAG Engine', icon: RefreshCw },
    { id: 'broadcast', label: 'Broadcast', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const handleToggleActive = (id: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleRebuild = () => {
    setIsRebuilding(true);
    setTimeout(() => setIsRebuilding(false), 3000);
  };

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#334155] p-4 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white shadow-xs border border-[#D9A441]/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-nav tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">CollegeMate AI</h2>
            <div className="flex items-center gap-1 font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#EF4444]">
              <ShieldAlert className="h-3 w-3" />
              <span>Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-heading text-nav font-bold tracking-[0.02em] transition-colors ${
                  active
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#1E293B]'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-[#D9A441]' : 'text-[#64748B]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] dark:border-[#334155] pt-4 space-y-2">
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-heading text-nav font-bold tracking-[0.02em] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#1E293B] transition-colors"
          >
            <Sparkles className="h-4 w-4 text-[#D9A441]" />
            Student View
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-heading text-nav font-bold tracking-[0.02em] text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">Admin Dashboard</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Welcome back, <span className="font-semibold text-[#0E2A6D] dark:text-[#D9A441]">{user?.name}</span>. Here's your Mount Zion campus overview.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-10">
              {mockStats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.color} text-white p-6 shadow-xs relative overflow-hidden border border-[#D9A441]/30`}>
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="h-7 w-7 opacity-90" />
                    </div>
                    <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] opacity-80">{stat.label}</p>
                    <p className="font-heading text-hero font-extrabold mt-1">{stat.value.toLocaleString()}</p>
                    <p className="text-caption mt-2 opacity-90">{stat.trend}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick overview panels */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-4">System Health</h3>
                <div className="space-y-3 font-body text-small">
                  <div className="flex items-center justify-between p-3 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-xl">
                    <span className="font-semibold">RAG Vector Store</span>
                    <span className="text-[#22C55E] font-bold flex items-center gap-1"><CheckCircle2 size={16} /> Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-xl">
                    <span className="font-semibold">Chat API Service</span>
                    <span className="text-[#22C55E] font-bold flex items-center gap-1"><CheckCircle2 size={16} /> Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-xl">
                    <span className="font-semibold">TTS Voice Engine</span>
                    <span className="text-[#22C55E] font-bold flex items-center gap-1"><CheckCircle2 size={16} /> Operational</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-4">Recent Activity</h3>
                <div className="space-y-3 font-body text-small">
                  <div className="p-3 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-xl">
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Indexed 12 new handbook PDFs</p>
                    <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">2 hours ago</p>
                  </div>
                  <div className="p-3 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-xl">
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Sent broadcast notification: Exam Timetable</p>
                    <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">Student Management</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Manage active student accounts across departments.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
              <table className="w-full text-left text-body">
                <thead className="text-caption font-heading font-bold uppercase bg-[#F5F7FB] dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#334155]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]">
                      <td className="p-4 font-bold text-[#1F2937] dark:text-[#F8FAFC]">{s.name}</td>
                      <td className="p-4 text-[#64748B] dark:text-[#94A3B8]">{s.email}</td>
                      <td className="p-4 font-semibold">{s.dept}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-caption font-bold ${s.active ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                          {s.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleToggleActive(s.id)} className="px-3 py-1 bg-[#F5F7FB] dark:bg-[#0F172A] rounded-lg text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA]">
                          {s.active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDeleteStudent(s.id)} className="p-1.5 text-[#EF4444] hover:bg-rose-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">Knowledge Base Documents</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Upload and manage RAG index files.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155] mb-6">
              <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-xl p-8 text-center cursor-pointer hover:border-[#1E4DB7]">
                <Upload size={32} className="mx-auto text-[#0E2A6D] dark:text-[#60A5FA] mb-2" />
                <p className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Click to upload campus PDF documents</p>
                <p className="text-caption text-[#64748B] dark:text-[#94A3B8] mt-1">Syllabus, circulars, handbooks, timetables</p>
              </div>
            </div>
          </div>
        )}

        {/* RAG Engine Tab */}
        {activeTab === 'rag' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">RAG Vector Index</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Rebuild vector embeddings for Mount Zion database.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
              <button onClick={handleRebuild} disabled={isRebuilding} className="px-6 py-3 bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-btn rounded-xl shadow-xs flex items-center gap-2">
                <RefreshCw size={18} className={isRebuilding ? 'animate-spin' : ''} />
                <span>{isRebuilding ? 'Rebuilding Index...' : 'Rebuild RAG Vector Store'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">Campus Broadcast</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Send announcements to all registered students.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155] space-y-4 max-w-xl">
              <div>
                <label className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">Title</label>
                <input type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. Exam Schedule Release" className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body mt-1" />
              </div>
              <div>
                <label className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">Message</label>
                <textarea rows={4} value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder="Type announcement here..." className="w-full p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body mt-1" />
              </div>
              <button onClick={handleBroadcast} className="px-6 py-3 bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-btn rounded-xl shadow-xs">
                Send Announcement
              </button>
              {broadcastSent && <p className="text-small text-[#22C55E] font-bold">Broadcast successfully sent to all students!</p>}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-8">
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">Usage Analytics</h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Platform query trends and engagement metrics.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
              <p className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Total Queries Handled Today: 482</p>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-2">Most frequent categories: Attendance, Exam Timetables, Fee Receipts.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
