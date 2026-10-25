import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Minus,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

export type SemanticTone = 'optimal' | 'favorable' | 'mixed' | 'avoid' | 'info' | 'neutral';

export const StatusBadge: React.FC<{
  tone: SemanticTone;
  label: string;
  size?: 'sm' | 'md';
}> = ({ tone, label, size = 'sm' }) => {
  const styles: Record<SemanticTone, string> = {
    optimal: 'obs-badge-sage',
    favorable: 'obs-badge-sage',
    mixed: 'obs-badge-amber',
    avoid: 'obs-badge-crimson',
    info: 'obs-badge-brass',
    neutral:
      'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] rounded-md',
  };

  const icons: Record<SemanticTone, React.ReactNode> = {
    optimal: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    favorable: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    mixed: <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    avoid: <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    info: <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    neutral: <Minus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs sm:text-[13px]'
      } ${styles[tone]}`}
    >
      {icons[tone]}
      <span>{label}</span>
    </span>
  );
};

export interface KpiStatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  benchmarkText: string;
  plainHint?: string;
  status?: { tone: SemanticTone; label: string };
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  label,
  value,
  subvalue,
  benchmarkText,
  plainHint,
  status,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="obs-card p-5 flex flex-col justify-between gap-3.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">{label}</span>
          {icon && <span className="text-[var(--accent)]">{icon}</span>}
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text)] tabular-nums leading-tight">
            {value}
          </span>
          {subvalue && (
            <span className="text-sm font-medium text-[var(--text-muted)] tabular-nums">
              {subvalue}
            </span>
          )}
        </div>

        {plainHint && (
          <p className="text-sm text-[var(--text-secondary)] leading-snug">{plainHint}</p>
        )}
      </div>

      <div className="space-y-2.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {status && <StatusBadge tone={status.tone} label={status.label} />}
          <span className="text-[13px] sm:text-sm text-[var(--text-muted)] tabular-nums">
            {benchmarkText}
          </span>
        </div>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="pt-2.5 border-t border-[var(--border)] w-full text-left text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center justify-between"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export interface TrendDataPoint {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
}

export const ScoreTrendChart: React.FC<{
  points: TrendDataPoint[];
  benchmarkValue?: number;
  benchmarkLabel?: string;
  maxValue?: number;
  selectedId?: string;
  onSelectPoint?: (id: string) => void;
  ariaLabel: string;
}> = ({
  points,
  benchmarkValue = 70,
  benchmarkLabel = '70+ Good Window',
  maxValue = 100,
  selectedId,
  onSelectPoint,
  ariaLabel,
}) => {
  if (!points.length) return null;

  const width = 680;
  const height = 228;
  const padLeft = 40;
  const padRight = 24;
  const padTop = 28;
  const padBottom = 48;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const getX = (i: number) =>
    points.length === 1 ? padLeft + innerW / 2 : padLeft + (i / (points.length - 1)) * innerW;
  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxValue, val));
    return padTop + innerH - (clamped / maxValue) * innerH;
  };

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.value).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const benchY = getY(benchmarkValue);
  const maxVal = Math.max(...points.map((p) => p.value));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[480px] h-auto select-none"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id="oceanTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal Reference Grid */}
        {[25, 50, 75, 100].map((tick) => {
          if (tick > maxValue) return null;
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11.5"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--text-muted)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Dashed Benchmark Line */}
        <line
          x1={padLeft}
          y1={benchY}
          x2={width - padRight}
          y2={benchY}
          stroke="var(--sage)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={width - padRight}
          y={benchY - 6}
          textAnchor="end"
          fontSize="11.5"
          fontWeight="700"
          fill="var(--sage)"
        >
          {benchmarkLabel}
        </text>

        {/* Area + Trend Line */}
        <path d={areaPath} fill="url(#oceanTrendFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points + Direct Value Labels */}
        {points.map((pt, i) => {
          const cx = getX(i);
          const cy = getY(pt.value);
          const isSelected = pt.id === selectedId;
          const isPeak = pt.value === maxVal && pt.value >= benchmarkValue;
          const isOptimal = pt.value >= benchmarkValue;
          const showTopValue =
            isSelected || isPeak || i === 0 || i === points.length - 1 || i % 2 === 0;

          return (
            <g
              key={pt.id}
              onClick={() => onSelectPoint?.(pt.id)}
              className={onSelectPoint ? 'cursor-pointer' : ''}
            >
              {isSelected && (
                <line
                  x1={cx}
                  y1={padTop}
                  x2={cx}
                  y2={padTop + innerH}
                  stroke="var(--accent)"
                  strokeOpacity="0.35"
                  strokeDasharray="2 2"
                />
              )}

              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 6.5 : 4.8}
                fill={isOptimal ? 'var(--sage)' : 'var(--surface)'}
                stroke={isOptimal ? 'var(--sage)' : 'var(--accent)'}
                strokeWidth={isSelected ? 2.8 : 2.2}
              />

              {showTopValue && (
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={isSelected || isPeak ? '700' : '600'}
                  fill={isOptimal ? 'var(--sage)' : 'var(--text)'}
                >
                  {pt.value}
                </text>
              )}

              <text
                x={cx}
                y={padTop + innerH + 18}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={isSelected ? '700' : '600'}
                fill={isSelected ? 'var(--accent)' : 'var(--text-secondary)'}
              >
                {pt.label}
              </text>
              {pt.sublabel && (
                <text
                  x={cx}
                  y={padTop + innerH + 33}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="var(--text-muted)"
                >
                  {pt.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export interface BenchmarkBarItem {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
}

export const BenchmarkBarChart: React.FC<{
  items: BenchmarkBarItem[];
  benchmarkValue: number;
  highThreshold: number;
  lowThreshold: number;
  benchmarkLabel: string;
  ariaLabel: string;
}> = ({
  items,
  benchmarkValue,
  highThreshold,
  lowThreshold,
  benchmarkLabel,
  ariaLabel,
}) => {
  if (!items.length) return null;
  const maxVal = Math.max(42, ...items.map((x) => x.value + 4));
  const width = 680;
  const height = 225;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 26;
  const padBottom = 46;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const slotW = innerW / items.length;
  const barW = Math.min(34, slotW * 0.62);
  const benchY = padTop + innerH - (benchmarkValue / maxVal) * innerH;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[480px] h-auto select-none"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Baseline */}
        <line
          x1={padLeft}
          y1={padTop + innerH}
          x2={width - padRight}
          y2={padTop + innerH}
          stroke="var(--border-strong)"
          strokeWidth="1.2"
        />

        {/* Bars */}
        {items.map((it, idx) => {
          const barH = (it.value / maxVal) * innerH;
          const x = padLeft + idx * slotW + (slotW - barW) / 2;
          const y = padTop + innerH - barH;
          const fill =
            it.value >= highThreshold
              ? 'var(--sage)'
              : it.value < lowThreshold
              ? 'var(--crimson)'
              : 'var(--accent)';
          const fillOpacity = it.value >= highThreshold || it.value < lowThreshold ? 0.9 : 0.78;

          return (
            <g key={it.id}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={fill}
                fillOpacity={fillOpacity}
              />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                fill="var(--text)"
              >
                {it.value}
              </text>
              <text
                x={x + barW / 2}
                y={padTop + innerH + 17}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="600"
                fill="var(--text-secondary)"
              >
                {it.label}
              </text>
              {it.sublabel && (
                <text
                  x={x + barW / 2}
                  y={padTop + innerH + 32}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="var(--text-muted)"
                >
                  {it.sublabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Benchmark Reference Line Drawn Over Bars */}
        <line
          x1={padLeft}
          y1={benchY}
          x2={width - padRight}
          y2={benchY}
          stroke="var(--text)"
          strokeOpacity="0.7"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
        <rect
          x={width - padRight - 134}
          y={benchY - 18}
          width={134}
          height={16}
          rx={3}
          fill="var(--surface)"
        />
        <text
          x={width - padRight - 4}
          y={benchY - 6}
          textAnchor="end"
          fontSize="11"
          fontWeight="700"
          fill="var(--text-secondary)"
        >
          {benchmarkLabel}
        </text>
      </svg>
    </div>
  );
};

export interface DayWindowSegment {
  name: string;
  category: 'Auspicious' | 'Inauspicious' | 'Neutral';
  startHourFloat: number;
  endHourFloat: number;
  startTime: string;
  endTime: string;
}

export const DayTimelineBar: React.FC<{
  sunriseTime: string;
  sunsetTime: string;
  windows: DayWindowSegment[];
}> = ({ sunriseTime, sunsetTime, windows }) => {
  const parseTime = (str: string) => {
    const [h, m] = str.split(':').map((n) => parseInt(n, 10) || 0);
    return h + m / 60;
  };

  const riseH = parseTime(sunriseTime) || 6;
  const setH = parseTime(sunsetTime) || 18;
  const span = Math.max(1, setH - riseH);

  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const nowPct = ((nowH - riseH) / span) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] font-mono">
        <span>☀ Sunrise {sunriseTime}</span>
        <span>Daylight Window Timeline</span>
        <span>🌇 Sunset {sunsetTime}</span>
      </div>

      <div className="relative h-11 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
        {windows.map((w) => {
          const left = Math.max(0, Math.min(100, ((w.startHourFloat - riseH) / span) * 100));
          const right = Math.max(0, Math.min(100, ((w.endHourFloat - riseH) / span) * 100));
          const widthPct = Math.max(2, right - left);
          if (right <= 0 || left >= 100) return null;

          const bg =
            w.category === 'Auspicious'
              ? 'bg-emerald-500/25 border-x border-emerald-500/50 text-[var(--sage)]'
              : w.category === 'Inauspicious'
              ? 'bg-rose-500/20 border-x border-rose-500/45 text-[var(--crimson)]'
              : 'bg-indigo-500/15 border-x border-indigo-500/35 text-[var(--accent)]';

          return (
            <div
              key={w.name}
              title={`${w.name}: ${w.startTime}–${w.endTime} (${w.category})`}
              style={{ left: `${left}%`, width: `${widthPct}%` }}
              className={`absolute inset-y-0 flex items-center justify-center px-1.5 text-xs font-semibold truncate ${bg}`}
            >
              {widthPct >= 8 ? w.name.split(' ')[0] : ''}
            </div>
          );
        })}

        {nowPct >= 0 && nowPct <= 100 && (
          <div
            style={{ left: `${nowPct}%` }}
            className="absolute inset-y-0 w-0.5 bg-[var(--text)] z-10"
            title="Current Local Time"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/55 inline-block" />
          Best Hours (Abhijit / Brahma)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-rose-500/55 inline-block" />
          Avoid Starting New Work (Rahu Kaal / Yamaganda)
        </span>
        {nowPct >= 0 && nowPct <= 100 && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[var(--text-muted)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--text)] inline-block" />
            Vertical line = Current local time
          </span>
        )}
      </div>
    </div>
  );
};

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition inline-flex items-center gap-1.5 min-h-[38px] ${
              active
                ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded text-xs tabular-nums ${
                  active
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-bold'
                    : 'bg-[var(--surface)] text-[var(--text-muted)]'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const EmptyStateCard: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="obs-card p-8 text-center max-w-md mx-auto space-y-3">
    <div className="text-lg font-semibold text-[var(--text)]">{title}</div>
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="btn-editorial-secondary inline-flex items-center gap-1.5 text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);
