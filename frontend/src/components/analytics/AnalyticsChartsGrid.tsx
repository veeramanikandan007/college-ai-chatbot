import React, { useRef, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  ClipboardList,
  UserRound,
  BookOpen,
} from 'lucide-react';
import type { AnalyticsChartsData, ChartDataPoint, SubjectPerformancePoint } from '../../api/studentAnalytics';

interface Props {
  charts: AnalyticsChartsData | null;
  loading: boolean;
}

// ── Inline SVG Bar Chart ──────────────────────────────────────────────────────

const BarChart: React.FC<{
  data: ChartDataPoint[];
  color: string;
  secondaryColor?: string;
  unit?: string;
  height?: number;
}> = ({ data, color, secondaryColor, unit = '', height = 120 }) => {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary_value ?? 0)), 1);
  const barW = Math.floor(100 / data.length);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${data.length * 40} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / max) * (height - 24), 2);
          const x = i * 40 + 6;
          const y = height - barHeight - 18;
          const secH = d.secondary_value !== undefined
            ? Math.max((d.secondary_value / max) * (height - 24), 2)
            : 0;
          const secX = x + 14;
          const secY = height - secH - 18;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={secondaryColor ? 12 : 28}
                height={barHeight}
                rx="3"
                fill={color}
                opacity="0.85"
              />
              {secondaryColor && d.secondary_value !== undefined && (
                <rect x={secX} y={secY} width={12} height={secH} rx="3" fill={secondaryColor} opacity="0.7" />
              )}
              <text
                x={i * 40 + 20}
                y={height - 4}
                textAnchor="middle"
                fill="currentColor"
                fontSize="8"
                className="fill-slate-400 dark:fill-slate-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Hover tooltip placeholder using title attribute is handled natively */}
    </div>
  );
};

// ── Inline SVG Line Chart ─────────────────────────────────────────────────────

const LineChart: React.FC<{ data: ChartDataPoint[]; color: string; height?: number }> = ({
  data,
  color,
  height = 120,
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.max(Math.min(...data.map((d) => d.value)) - 5, 0);
  const range = max - min || 1;
  const w = 400;
  const padT = 16;
  const padB = 20;
  const padX = 20;
  const innerW = w - padX * 2;
  const innerH = height - padT - padB;

  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padT + ((1 - (d.value - min) / range) * innerH),
    label: d.label,
    value: d.value,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill={`url(#grad_${color.replace('#', '')})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        ))}
        {/* X labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="8" fill="#94A3B8">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ── Subject Progress Horizontal Bars ─────────────────────────────────────────

const SubjectBars: React.FC<{ data: SubjectPerformancePoint[] }> = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, i) => (
      <div key={i}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{item.subject}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white ml-2">{item.quiz_score.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#60A5FA] transition-all duration-700"
            style={{ width: `${item.quiz_score}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-0.5">
          <span className="text-xs text-slate-400">Attendance: {item.attendance.toFixed(0)}%</span>
          <span className="text-xs text-slate-400">Assignments: {item.assignments.toFixed(0)}%</span>
        </div>
      </div>
    ))}
  </div>
);

// ── Chart Panel Wrapper ───────────────────────────────────────────────────────

const ChartPanel: React.FC<{ title: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode }> = ({
  title,
  icon,
  iconBg,
  children,
}) => (
  <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
      <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700" />
      <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-700" />
    </div>
    <div className="h-32 w-full rounded-lg bg-slate-100 dark:bg-slate-700" />
  </div>
);

export const AnalyticsChartsGrid: React.FC<Props> = ({ charts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <ChartSkeleton key={i} />)}
      </div>
    );
  }
  if (!charts) return null;

  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <ChartPanel
          title="Weekly Study Hours"
          icon={<BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
        >
          <BarChart data={charts.weekly_study_hours} color="#3B82F6" unit="h" />
          <p className="text-xs text-slate-400 mt-2 text-center">Hours per day (last 7 days)</p>
        </ChartPanel>

        <ChartPanel
          title="Monthly Study Hours"
          icon={<BarChart3 size={16} className="text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/30"
        >
          <BarChart data={charts.monthly_study_hours} color="#6366F1" unit="h" />
          <p className="text-xs text-slate-400 mt-2 text-center">Hours per week (last 4 weeks)</p>
        </ChartPanel>

        <ChartPanel
          title="Quiz Performance"
          icon={<BookOpen size={16} className="text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-50 dark:bg-purple-900/30"
        >
          <LineChart data={charts.quiz_performance} color="#9333EA" />
          <p className="text-xs text-slate-400 mt-2 text-center">Score % per quiz attempt</p>
        </ChartPanel>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <ChartPanel
          title="Attendance Trend"
          icon={<Activity size={16} className="text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
        >
          <LineChart data={charts.attendance_trend} color="#10B981" />
          <p className="text-xs text-slate-400 mt-2 text-center">Attendance % over months</p>
        </ChartPanel>

        <ChartPanel
          title="Assignment Completion"
          icon={<ClipboardList size={16} className="text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
        >
          <BarChart
            data={charts.assignment_completion}
            color="#F59E0B"
            secondaryColor="#FCD34D"
            unit="%"
          />
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="inline-block h-2 w-3 rounded-sm bg-amber-500" />
              Completion %
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="inline-block h-2 w-3 rounded-sm bg-yellow-300" />
              Count
            </span>
          </div>
        </ChartPanel>

        <ChartPanel
          title="Mock Interview Scores"
          icon={<UserRound size={16} className="text-cyan-600 dark:text-cyan-400" />}
          iconBg="bg-cyan-50 dark:bg-cyan-900/30"
        >
          <BarChart data={charts.interview_scores} color="#06B6D4" unit="%" />
          <p className="text-xs text-slate-400 mt-2 text-center">Score % per interview type</p>
        </ChartPanel>
      </div>

      {/* Subject Progress Full Width */}
      <ChartPanel
        title="Subject Performance Breakdown"
        icon={<TrendingUp size={16} className="text-[#0E2A6D] dark:text-[#60A5FA]" />}
        iconBg="bg-blue-50 dark:bg-blue-900/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {charts.subject_progress.slice(0, Math.ceil(charts.subject_progress.length / 2)).map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{item.subject}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">Quiz: {item.quiz_score.toFixed(0)}%</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.attendance.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex gap-1 h-2">
                <div
                  className="rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#60A5FA] transition-all duration-700"
                  style={{ width: `${(item.quiz_score / 100) * 60}%` }}
                />
                <div
                  className="rounded-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${(item.attendance / 100) * 25}%` }}
                />
                <div
                  className="rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${(item.assignments / 100) * 15}%` }}
                />
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="inline-block h-1.5 w-2.5 rounded-sm bg-[#60A5FA]" />
                  Quiz
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="inline-block h-1.5 w-2.5 rounded-sm bg-emerald-400" />
                  Attend
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="inline-block h-1.5 w-2.5 rounded-sm bg-amber-400" />
                  Assign
                </span>
              </div>
            </div>
          ))}
          {charts.subject_progress.slice(Math.ceil(charts.subject_progress.length / 2)).map((item, i) => (
            <div key={`r_${i}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{item.subject}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">Quiz: {item.quiz_score.toFixed(0)}%</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.attendance.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex gap-1 h-2">
                <div
                  className="rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#60A5FA] transition-all duration-700"
                  style={{ width: `${(item.quiz_score / 100) * 60}%` }}
                />
                <div
                  className="rounded-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${(item.attendance / 100) * 25}%` }}
                />
                <div
                  className="rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${(item.assignments / 100) * 15}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartPanel>
    </div>
  );
};
