import React from 'react';
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
  color?: string;
  unit?: string;
  height?: number;
}> = ({ data, height = 140 }) => {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary_value ?? 0)), 1);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${data.length * 40} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / max) * (height - 28), 2);
          const x = i * 40 + 10;
          const y = height - barHeight - 20;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={20}
                height={barHeight}
                rx="4"
                className="fill-[#111827] dark:fill-[#FAFAFA]"
              />
              <text
                x={i * 40 + 20}
                y={height - 4}
                textAnchor="middle"
                fontSize="10"
                className="fill-[#6B7280] dark:fill-[#A3A3A3] font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Inline SVG Line Chart ─────────────────────────────────────────────────────

const LineChart: React.FC<{ data: ChartDataPoint[]; height?: number }> = ({
  data,
  height = 140,
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.max(Math.min(...data.map((d) => d.value)) - 5, 0);
  const range = max - min || 1;
  const w = 400;
  const padT = 16;
  const padB = 24;
  const padX = 20;
  const innerW = w - padX * 2;
  const innerH = height - padT - padB;

  const pts = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * innerW,
    y: padT + ((1 - (d.value - min) / range) * innerH),
    label: d.label,
    value: d.value,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Line */}
        <path d={pathD} fill="none" className="stroke-[#111827] dark:stroke-[#FAFAFA]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-[#111827] dark:fill-[#FAFAFA]" />
        ))}
        {/* X labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="10" className="fill-[#6B7280] dark:fill-[#A3A3A3] font-medium">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ── Subject Progress Horizontal Bars ─────────────────────────────────────────

const SubjectBars: React.FC<{ data: SubjectPerformancePoint[] }> = ({ data }) => (
  <div className="space-y-4">
    {data.map((item, i) => (
      <div key={i} className="space-y-1.5">
        <div className="flex items-center justify-between text-[14px]">
          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{item.subject}</span>
          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{item.quiz_score.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#E5E7EB] dark:bg-[#2A2A2A] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#111827] dark:bg-[#FAFAFA] transition-all duration-500"
            style={{ width: `${item.quiz_score}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
          <span>Attendance: {item.attendance.toFixed(0)}%</span>
          <span>Assignments: {item.assignments.toFixed(0)}%</span>
        </div>
      </div>
    ))}
  </div>
);

// ── Chart Panel Wrapper ───────────────────────────────────────────────────────

const ChartPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">{title}</h3>
    </div>
    {children}
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111]" />
      <div className="h-5 w-32 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
    </div>
    <div className="h-32 w-full bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
  </div>
);

export const AnalyticsChartsGrid: React.FC<Props> = ({ charts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <ChartSkeleton key={i} />)}
      </div>
    );
  }
  if (!charts) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChartPanel title="Weekly Study Hours" icon={<TrendingUp size={20} />}>
        <BarChart data={charts.weekly_study_hours || []} />
      </ChartPanel>

      <ChartPanel title="Quiz Performance" icon={<BarChart3 size={20} />}>
        <LineChart data={charts.quiz_performance || []} />
      </ChartPanel>

      <ChartPanel title="Attendance Log" icon={<Activity size={20} />}>
        <BarChart data={charts.attendance_trend || []} />
      </ChartPanel>

      <ChartPanel title="Assignment Completion" icon={<ClipboardList size={20} />}>
        <LineChart data={charts.assignment_completion || []} />
      </ChartPanel>

      <ChartPanel title="Subject Progress" icon={<BookOpen size={20} />}>
        <SubjectBars data={charts.subject_progress || []} />
      </ChartPanel>

      <ChartPanel title="Interview Score Trend" icon={<UserRound size={20} />}>
        <LineChart data={charts.interview_scores || []} />
      </ChartPanel>
    </div>
  );
};
