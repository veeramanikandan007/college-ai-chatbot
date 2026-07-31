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
  { label: 'Total Students', value: 128, icon: Users, color: 'from-[#0A2A6A] to-[#163D8C]', trend: '+12 this month' },
  { label: 'Chat Sessions', value: 3_842, icon: MessageSquare, color: 'from-emerald-600 to-emerald-500', trend: '+234 this week' },
  { label: 'Documents Indexed', value: 47, icon: FileText, color: 'from-[#E8B24D] to-amber-400', trend: '3 pending rebuild' },
  { label: 'Broadcasts Sent', value: 19, icon: Bell, color: 'from-violet-600 to-purple-500', trend: 'Last: 2 days ago' },
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#0A2A6A] dark:text-white">CollegeMate</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-500">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0A2A6A] text-white shadow-md shadow-[#0A2A6A]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-[#E8B24D]' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-slate-400" />
            Student View
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Welcome back, <span className="font-semibold text-[#163D8C]">{user?.name}</span>. Here's your campus overview.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-10">
              {mockStats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} text-white p-6 shadow-md relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="h-7 w-7 opacity-90" />
                    </div>
                    <p className="text-4xl font-black mb-1">{stat.value.toLocaleString()}</p>
                    <p className="text-sm font-medium opacity-90">{stat.label}</p>
                    <p className="text-xs opacity-60 mt-1">{stat.trend}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Students</h3>
                <div className="space-y-3">
                  {students.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#163D8C] text-white flex items-center justify-center text-xs font-bold">{s.name[0]}</div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.dept}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                        {s.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Manage Students', icon: Users, tab: 'students' },
                    { label: 'Upload Document', icon: Upload, tab: 'documents' },
                    { label: 'Rebuild Index', icon: RefreshCw, tab: 'rag' },
                    { label: 'Send Broadcast', icon: Bell, tab: 'broadcast' },
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => setActiveTab(action.tab as AdminTab)}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#0A2A6A] hover:text-white dark:hover:bg-[#0A2A6A] transition-colors group"
                      >
                        <Icon className="h-5 w-5 text-[#163D8C] group-hover:text-[#E8B24D] transition-colors" />
                        <span className="text-center text-xs">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Student Management</h1>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#163D8C] text-white flex items-center justify-center font-bold">{s.name[0]}</div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{s.dept}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                          {s.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {s.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${s.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                          >
                            {s.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Document Management</h1>
            <div className="mb-6 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-slate-800 hover:border-[#163D8C] transition-colors cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-[#163D8C]/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-[#163D8C]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Upload a new PDF</h3>
                <p className="text-sm text-slate-500 mt-1">Click to browse, or drag and drop your PDF here.</p>
              </div>
              <button className="bg-[#0A2A6A] hover:bg-[#163D8C] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm">
                Choose File
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 dark:text-white">Indexed Documents ({documents.length})</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.size}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${doc.indexed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                      {doc.indexed ? '✓ Indexed' : '⏳ Pending'}
                    </span>
                    <button className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RAG Engine */}
        {activeTab === 'rag' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">RAG Engine Control</h1>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isRebuilding ? 'bg-amber-100' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                  <RefreshCw className={`h-8 w-8 ${isRebuilding ? 'text-amber-500 animate-spin' : 'text-emerald-600'}`} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">
                  {isRebuilding ? 'Rebuilding Index…' : 'Rebuild RAG Index'}
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  Re-processes all uploaded PDF documents and rebuilds the ChromaDB vector store. This may take a few minutes.
                </p>
                <button
                  onClick={handleRebuild}
                  disabled={isRebuilding}
                  className="bg-[#0A2A6A] hover:bg-[#163D8C] text-white font-bold px-8 py-3 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRebuilding ? 'Processing…' : 'Start Rebuild'}
                </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Index Status</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Documents', value: '47 PDFs', color: 'text-[#163D8C]' },
                    { label: 'Total Chunks', value: '12,381', color: 'text-emerald-600' },
                    { label: 'Embedding Model', value: 'models/embedding-001', color: 'text-violet-600' },
                    { label: 'Vector Store', value: 'ChromaDB (local)', color: 'text-amber-600' },
                    { label: 'Last Rebuilt', value: '2 hours ago', color: 'text-slate-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color} dark:opacity-80`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast */}
        {activeTab === 'broadcast' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Send Broadcast</h1>
            <div className="max-w-2xl">
              {broadcastSent && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Broadcast sent to all active students!</span>
                </div>
              )}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notification Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Exam Schedule Updated"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    rows={5}
                    placeholder="Write your message to all students here…"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#163D8C] transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>This notification will be sent to <strong>all 128 active students</strong>.</span>
                </div>
                <button
                  onClick={handleBroadcast}
                  disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                  className="flex items-center gap-2 bg-[#0A2A6A] hover:bg-[#163D8C] text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Bell size={18} />
                  Send to All Students
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Analytics</h1>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {[
                { label: 'Avg. Sessions / Day', value: '54', delta: '+8%' },
                { label: 'Avg. Msgs / Session', value: '6.4', delta: '+2%' },
                { label: 'RAG Hit Rate', value: '87%', delta: '+3%' },
              ].map(stat => (
                <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                  <h3 className="text-sm text-slate-500 mb-1">{stat.label}</h3>
                  <p className="text-4xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-2 inline-block">
                    {stat.delta} this week
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Daily Chat Sessions — Last 7 Days</h3>
              <div className="flex items-end gap-3 h-40">
                {[38, 52, 47, 61, 55, 70, 54].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#163D8C] dark:bg-[#0A2A6A] rounded-t-lg transition-all hover:bg-[#E8B24D] dark:hover:bg-[#E8B24D]"
                      style={{ height: `${(val / 70) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
