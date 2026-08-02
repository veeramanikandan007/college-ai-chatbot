import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Download,
  Brain,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Stethoscope,
  BarChart3,
  Sliders,
  Bell,
  RefreshCw,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface SubjectAnalytics {
  id: number;
  subject_name: string;
  subject_code: string;
  faculty_name: string;
  department: string;
  semester: number;
  classes_attended: number;
  classes_missed: number;
  classes_late: number;
  medical_leave: number;
  total_classes: number;
  effective_attended: number;
  attendance_percentage: number;
  required_percentage: number;
  risk_level: 'Safe' | 'Warning' | 'Critical';
  status_color: 'Green' | 'Yellow' | 'Red';
  classes_required_to_reach_75: number;
  max_safe_missable_classes: number;
  ai_suggestion: string;
}

interface MonthlyTrendItem {
  month: string;
  percentage: number;
}

interface WeeklyLogItem {
  day: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  subject: string;
}

interface NotificationItem {
  id: string;
  type: string;
  subject: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}

interface DashboardData {
  department: string;
  semester: number;
  academic_year: string;
  overall_percentage: number;
  required_percentage: number;
  current_month_percentage: number;
  todays_status: string;
  overall_risk_level: 'Safe' | 'Warning' | 'Critical';
  total_classes_held: number;
  total_effective_attended: number;
  total_missed: number;
  total_late: number;
  total_medical_leave: number;
  risk_counts: {
    safe: number;
    warning: number;
    critical: number;
  };
  subjects: SubjectAnalytics[];
  monthly_trend: MonthlyTrendItem[];
  weekly_log: WeeklyLogItem[];
  ai_insights: string[];
  notifications: NotificationItem[];
}

export default function AttendancePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Safe' | 'Warning' | 'Critical'>('All');

  // Simulator State
  const [simSubjectId, setSimSubjectId] = useState<number | null>(null);
  const [simAddAttended, setSimAddAttended] = useState<number>(0);
  const [simAddMissed, setSimAddMissed] = useState<number>(0);

  // Fetch Attendance Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/attendance/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.subjects && json.subjects.length > 0 && !simSubjectId) {
          setSimSubjectId(json.subjects[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered Subject Cards
  const filteredSubjects = useMemo(() => {
    if (!data?.subjects) return [];
    return data.subjects.filter((sub) => {
      const matchesSearch =
        sub.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.faculty_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || sub.risk_level === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Selected Simulation Subject Calculation
  const currentSimSubject = useMemo(() => {
    if (!data?.subjects || !simSubjectId) return null;
    return data.subjects.find((s) => s.id === simSubjectId) || null;
  }, [data, simSubjectId]);

  const simResult = useMemo(() => {
    if (!currentSimSubject) return null;
    const newAttended = currentSimSubject.effective_attended + simAddAttended;
    const newTotal = currentSimSubject.total_classes + simAddAttended + simAddMissed;
    const newPct = newTotal > 0 ? round((newAttended / newTotal) * 100, 1) : 100;

    let newRisk: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    if (newPct < 75) newRisk = 'Critical';
    else if (newPct < 80) newRisk = 'Warning';

    return {
      newPct,
      newTotal,
      newAttended,
      newRisk,
      delta: round(newPct - currentSimSubject.attendance_percentage, 1),
    };
  }, [currentSimSubject, simAddAttended, simAddMissed]);

  function round(val: number, decimals: number) {
    return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
  }

  // Print / Export PDF function
  const handleExportPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E2A6D] border-t-transparent dark:border-[#D9A441]" />
          <p className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Loading Smart Attendance Analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F8FAFC] p-4 md:p-8 font-body transition-colors duration-300 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* HEADER BAR                                                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs print:border-none print:shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-md border border-[#D9A441]/30 shrink-0">
              <Award size={30} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white tracking-wide">
                  Smart Attendance Dashboard
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] font-bold border border-[#1E4DB7]/20">
                  AI Analytics
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {data.department} • Semester {data.semester} ({data.academic_year})
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-white transition"
              title="Refresh Analytics"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              Export PDF Report
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP METRICS & STATS CARDS GRID (6 Cards)                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card 1: Overall Percentage Radial Gauge (Span 2) */}
          <div className="sm:col-span-2 bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white p-6 rounded-2xl shadow-md border border-[#D9A441]/30 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                Overall Attendance
              </span>
              <div className="text-4xl md:text-5xl font-extrabold font-heading text-white">
                {data.overall_percentage}%
              </div>
              <p className="text-xs text-slate-200">
                Mandatory Threshold: <strong className="text-[#D9A441]">{data.required_percentage}%</strong>
              </p>
            </div>

            {/* SVG Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#D9A441"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * data.overall_percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-sm text-[#D9A441]">
                {data.overall_risk_level === 'Safe' ? '🟢 Safe' : data.overall_risk_level === 'Warning' ? '🟡 Warning' : '🔴 Critical'}
              </div>
            </div>
          </div>

          {/* Card 2: Today's Status */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Today's Status
            </div>
            <div className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 flex items-center gap-2 my-1">
              <CheckCircle2 size={22} />
              {data.todays_status}
            </div>
            <div className="text-[11px] text-[#64748B]">Recorded for Aug 01</div>
          </div>

          {/* Card 3: Present Count */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Classes Attended
            </div>
            <div className="text-2xl font-extrabold font-heading text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-2 my-1">
              <UserCheck size={24} />
              {data.total_effective_attended}
            </div>
            <div className="text-[11px] text-[#64748B]">out of {data.total_classes_held} held</div>
          </div>

          {/* Card 4: Absent Count */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Classes Missed
            </div>
            <div className="text-2xl font-extrabold font-heading text-rose-500 flex items-center gap-2 my-1">
              <UserX size={24} />
              {data.total_missed}
            </div>
            <div className="text-[11px] text-[#64748B]">Unexcused absences</div>
          </div>

          {/* Card 5: Late & Leave */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Late / Medical Leave
            </div>
            <div className="text-2xl font-extrabold font-heading text-amber-500 flex items-center gap-2 my-1">
              <Stethoscope size={24} />
              {data.total_late + data.total_medical_leave}
            </div>
            <div className="text-[11px] text-[#64748B]">Late: {data.total_late} | Leave: {data.total_medical_leave}</div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE AI PREDICTOR & SIMULATOR WIDGET                               */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441]">
                <Brain size={22} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white flex items-center gap-2">
                  AI Attendance Predictor & Simulator
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Simulate future attendance outcomes: See how attending or missing classes impacts your percentage & risk badge.
                </p>
              </div>
            </div>

            {/* Subject Dropdown */}
            <select
              value={simSubjectId || ''}
              onChange={(e) => {
                setSimSubjectId(Number(e.target.value));
                setSimAddAttended(0);
                setSimAddMissed(0);
              }}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0E2A6D] dark:text-white outline-none cursor-pointer"
            >
              {data.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subject_name} ({sub.attendance_percentage}%)
                </option>
              ))}
            </select>
          </div>

          {currentSimSubject && simResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Sliders Area (8 Cols) */}
              <div className="lg:col-span-8 space-y-4 bg-[#F8FAFC] dark:bg-[#1E293B]/40 p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                {/* Attended Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      If I attend next <strong>{simAddAttended}</strong> classes:
                    </span>
                    <span>+{simAddAttended} Classes</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={simAddAttended}
                    onChange={(e) => setSimAddAttended(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Missed Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-rose-500">
                      If I miss next <strong>{simAddMissed}</strong> classes:
                    </span>
                    <span>+{simAddMissed} Missed</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={simAddMissed}
                    onChange={(e) => setSimAddMissed(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] pt-2">
                  <button
                    onClick={() => {
                      setSimAddAttended(0);
                      setSimAddMissed(0);
                    }}
                    className="text-xs text-[#1E4DB7] dark:text-[#60A5FA] font-bold hover:underline"
                  >
                    Reset Simulator
                  </button>
                  <span>Current: {currentSimSubject.effective_attended} / {currentSimSubject.total_classes} Classes</span>
                </div>
              </div>

              {/* Simulation Outcome Card (4 Cols) */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white p-5 rounded-xl shadow-sm border border-[#D9A441]/30 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    Predicted Outcome
                  </span>
                  <div className="text-3xl font-extrabold font-heading text-white flex items-center gap-2">
                    {simResult.newPct}%
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        simResult.delta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {simResult.delta >= 0 ? `+${simResult.delta}%` : `${simResult.delta}%`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
                  <span>Predicted Risk Badge:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                      simResult.newRisk === 'Safe'
                        ? 'bg-emerald-500 text-white'
                        : simResult.newRisk === 'Warning'
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {simResult.newRisk}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* GRAPH VISUALIZATIONS SECTION (Monthly Trend & Subject Comparison)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Monthly Trend Area Chart (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[#1E4DB7]" />
                Monthly Attendance Trend
              </h2>
              <span className="text-xs text-[#64748B]">Jan - Aug 2026</span>
            </div>

            {/* Custom SVG Bezier Area Chart */}
            <div className="h-48 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E4DB7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1E4DB7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 75% Threshold Line */}
                <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="440" y="32" fill="#F59E0B" fontSize="10" fontWeight="bold">75% Threshold</text>

                {/* Area path */}
                <path
                  d="M 0,22 L 62,36 L 125,44 L 187,31 L 250,47 L 312,39 L 375,49 L 437,42 L 500,42 L 500,150 L 0,150 Z"
                  fill="url(#trendGrad)"
                />

                {/* Line path */}
                <path
                  d="M 0,22 L 62,36 L 125,44 L 187,31 L 250,47 L 312,39 L 375,49 L 500,42"
                  fill="none"
                  stroke="#1E4DB7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {data.monthly_trend.map((m, i) => {
                  const x = (i / (data.monthly_trend.length - 1)) * 500;
                  const y = 150 - (m.percentage / 100) * 150;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#0E2A6D" stroke="#D9A441" strokeWidth="2" />
                      <text x={x} y={145} fill="#64748B" fontSize="10" textAnchor="middle">
                        {m.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Subject Comparison Bar Chart (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-[#D9A441]" />
                Subject Breakdown
              </h2>
              <span className="text-xs text-[#64748B]">Target 75%</span>
            </div>

            <div className="space-y-3 pt-1">
              {data.subjects.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold truncate max-w-[180px] text-[#1E293B] dark:text-white">
                      {sub.subject_name}
                    </span>
                    <span
                      className={`font-extrabold ${
                        sub.risk_level === 'Safe'
                          ? 'text-emerald-600'
                          : sub.risk_level === 'Warning'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {sub.attendance_percentage}%
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    {/* 75% Marker */}
                    <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-amber-400 z-10" title="75% Minimum Required" />
                    <div
                      className={`h-full transition-all duration-700 ${
                        sub.risk_level === 'Safe'
                          ? 'bg-emerald-500'
                          : sub.risk_level === 'Warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${sub.attendance_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* AI INSIGHTS & ALERT NOTIFICATIONS BOX                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Suggestions List (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#D9A441]" />
              AI Personalized Suggestions
            </h2>
            <div className="space-y-3">
              {data.ai_insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/15 border border-[#1E4DB7]/20 text-xs text-[#1E293B] dark:text-[#CBD5E1] flex items-start gap-3"
                >
                  <Brain size={16} className="text-[#1E4DB7] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Alerts & Notifications (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-rose-500" />
              Attendance Risk Alerts
            </h2>
            <div className="space-y-3">
              {data.notifications.length === 0 ? (
                <p className="text-xs text-[#64748B]">No critical alerts. All subjects in safe margin!</p>
              ) : (
                data.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                      notif.priority === 'high'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">{notif.type} - {notif.subject}</span>
                      <p className="leading-tight opacity-90">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SUBJECT CARDS GRID WITH LIVE SEARCH & FILTER                               */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          
          {/* Toolbar: Search + Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-3 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or faculty..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold text-[#1E293B] dark:text-white outline-none focus:border-[#1E4DB7]"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'Safe', 'Warning', 'Critical'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? st === 'Safe'
                        ? 'bg-emerald-600 text-white'
                        : st === 'Warning'
                        ? 'bg-amber-500 text-white'
                        : st === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#0E2A6D] text-white'
                      : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
                  }`}
                >
                  {st === 'All' ? 'All Subjects' : `${st} Status`}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((sub) => (
              <motion.div
                key={sub.id}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-2xl border bg-white dark:bg-[#111827] shadow-xs flex flex-col justify-between space-y-4 ${
                  sub.risk_level === 'Safe'
                    ? 'border-emerald-500/30'
                    : sub.risk_level === 'Warning'
                    ? 'border-amber-500/30'
                    : 'border-rose-500/30'
                }`}
              >
                {/* Top header */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white leading-snug">
                      {sub.subject_name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        sub.risk_level === 'Safe'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : sub.risk_level === 'Warning'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {sub.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {sub.subject_code} • Faculty: {sub.faculty_name}
                  </p>
                </div>

                {/* Percentage & Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-heading text-[#1E293B] dark:text-white">
                      {sub.attendance_percentage}%
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {sub.effective_attended} / {sub.total_classes} Classes
                    </span>
                  </div>

                  <div className="relative w-full h-2.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        sub.risk_level === 'Safe'
                          ? 'bg-emerald-500'
                          : sub.risk_level === 'Warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${sub.attendance_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Actionable AI Prediction Note */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] space-y-1">
                  {sub.risk_level === 'Critical' ? (
                    <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle size={15} />
                      Must attend next {sub.classes_required_to_reach_75} consecutive classes to reach 75%!
                    </div>
                  ) : (
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck size={15} />
                      Can safely miss up to {sub.max_safe_missable_classes} classes.
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
