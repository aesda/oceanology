import React, { useEffect, useMemo, useState } from 'react';
import { HoraiSacredFlower, HoraiSlot } from '../../engines/panchangEngine';

/* ==================== 1. BESPOKE SACRED FLOWER SVG ICON ==================== */
interface SacredFlowerIconProps {
  variety?: HoraiSacredFlower['variety'];
  primaryHex?: string;
  secondaryHex?: string;
  size?: number;
  animated?: boolean;
  className?: string;
}

export const SacredFlowerIcon: React.FC<SacredFlowerIconProps> = ({
  variety = 'lotus',
  primaryHex = '#EC4899',
  secondaryHex = '#FBCFE8',
  size = 28,
  animated = true,
  className = '',
}) => {
  const petalCounts: Record<HoraiSacredFlower['variety'], number> = {
    lotus: 12,
    marigold: 16,
    jasmine: 7,
    lily: 10,
    hibiscus: 5,
    parijata: 6,
    aparajita: 8,
  };

  const count = petalCounts[variety] || 10;
  const angles = Array.from({ length: count }, (_, i) => (360 / count) * i);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-24 -24 48 48"
      aria-hidden="true"
      className={`inline-block shrink-0 ${animated ? 'animate-flower-sway' : ''} ${className}`}
    >
      {/* Outer Soft Petal Ring */}
      <g>
        {angles.map((deg) => (
          <path
            key={`outer-${deg}`}
            d={
              variety === 'hibiscus'
                ? 'M0,-2 C7,-9 10,-19 0,-21 C-10,-19 -7,-9 0,-2 Z'
                : variety === 'jasmine' || variety === 'parijata'
                ? 'M0,-2 C3.5,-9 3.8,-18 0,-21 C-3.8,-18 -3.5,-9 0,-2 Z'
                : 'M0,-2 C5.2,-8 6,-17 0,-21 C-6,-17 -5.2,-8 0,-2 Z'
            }
            fill={primaryHex}
            fillOpacity={0.86}
            stroke={secondaryHex}
            strokeWidth={0.7}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* Inner Offset Blooming Petals */}
      <g transform={`rotate(${180 / count}) scale(0.68)`}>
        {angles.map((deg) => (
          <path
            key={`inner-${deg}`}
            d="M0,-2 C4.8,-8 5.2,-16 0,-19.5 C-5.2,-16 -4.8,-8 0,-2 Z"
            fill={secondaryHex}
            fillOpacity={0.95}
            stroke={primaryHex}
            strokeWidth={0.7}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* Sacred Golden Pollen Heart */}
      <circle
        cx={0}
        cy={0}
        r={variety === 'parijata' ? 4.8 : 4.2}
        fill={variety === 'parijata' ? '#EA580C' : '#F59E0B'}
      />
      <circle cx={0} cy={0} r={2.1} fill="#FEF3C7" />
    </svg>
  );
};

/* ==================== 2. AMBIENT FLOATING FLOWER PETALS BACKDROP ==================== */
interface FloatingPetalSpec {
  id: number;
  leftPct: number;
  durationSec: number;
  delaySec: number;
  swayDurationSec: number;
  driftPx: number;
  swayPx: number;
  scale: number;
  opacity: number;
  primary: string;
  secondary: string;
  isFullFlower: boolean;
}

const PETAL_PALETTE = [
  { primary: '#F472B6', secondary: '#FBCFE8' }, // Padma Rose Lotus
  { primary: '#FBBF24', secondary: '#FEF08A' }, // Swarna Marigold
  { primary: '#818CF8', secondary: '#E0E7FF' }, // Neelakamala Indigo Lotus
  { primary: '#FB7185', secondary: '#FFE4E6' }, // Japa Coral Blossom
  { primary: '#34D399', secondary: '#D1FAE5' }, // Sacred Tulsi / Parijata Leaf
  { primary: '#F9A8D4', secondary: '#FDF2F8' }, // Mallika Soft Blossom
];

export const FloatingPetalsBackdrop: React.FC<{ enabled?: boolean }> = ({
  enabled = true,
}) => {
  const petals = useMemo<FloatingPetalSpec[]>(() => {
    return Array.from({ length: 26 }, (_, idx) => {
      const palette = PETAL_PALETTE[idx % PETAL_PALETTE.length];
      return {
        id: idx,
        leftPct: (idx * 3.85 + (idx % 3) * 2.1) % 98,
        durationSec: 15 + (idx % 7) * 2.8,
        delaySec: -((idx * 2.3) % 24),
        swayDurationSec: 3.6 + (idx % 5) * 0.9,
        driftPx: idx % 2 === 0 ? 45 + (idx % 4) * 16 : -(45 + (idx % 4) * 16),
        swayPx: idx % 2 === 0 ? 22 : -22,
        scale: 0.68 + (idx % 5) * 0.14,
        opacity: idx % 5 === 0 ? 0.56 : 0.42,
        primary: palette.primary,
        secondary: palette.secondary,
        isFullFlower: idx % 4 === 0,
      };
    });
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[5] no-print"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: 'absolute',
              top: '-5%',
              left: `${p.leftPct}%`,
              '--petal-drift': `${p.driftPx}px`,
              '--petal-sway': `${p.swayPx}px`,
              '--petal-scale': p.scale,
              '--petal-opacity': p.opacity,
              animation: `floralPetalFall ${p.durationSec}s linear ${p.delaySec}s infinite, floralBreezeSway ${p.swayDurationSec}s ease-in-out ${p.delaySec}s infinite`,
            } as React.CSSProperties
          }
        >
          {p.isFullFlower ? (
            <svg width="22" height="22" viewBox="-16 -16 32 32">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <path
                  key={deg}
                  d="M0,-1.5 C3.4,-6 3.8,-12 0,-14.5 C-3.8,-12 -3.4,-6 0,-1.5 Z"
                  fill={p.primary}
                  fillOpacity={0.85}
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2.8" fill="#FBBF24" />
            </svg>
          ) : (
            <svg width="16" height="20" viewBox="-10 -12 20 24">
              <path
                d="M0,10 C6,4 8,-5 0,-11 C-8,-5 -6,4 0,10 Z"
                fill={p.primary}
                stroke={p.secondary}
                strokeWidth="0.8"
              />
              <path
                d="M0,7 C2,2 2,-3 0,-7"
                stroke={p.secondary}
                strokeWidth="0.8"
                fill="none"
                opacity="0.75"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

/* ==================== 3. CLICK-TO-BLOOM FLOWER PETAL BURST ==================== */
interface BurstGroup {
  id: number;
  x: number;
  y: number;
}

export const InteractivePetalBurst: React.FC<{ enabled?: boolean }> = ({
  enabled = true,
}) => {
  const [bursts, setBursts] = useState<BurstGroup[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleDocClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, [data-bloom="true"], a');
      if (!interactive) return;
      if (ev.clientX === 0 && ev.clientY === 0) return;

      const burstId = Date.now() + Math.random();
      setBursts((prev) => [...prev.slice(-4), { id: burstId, x: ev.clientX, y: ev.clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 900);
    };

    window.addEventListener('click', handleDocClick, { passive: true });
    return () => window.removeEventListener('click', handleDocClick);
  }, [enabled]);

  if (!enabled || bursts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[70] overflow-hidden no-print"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          style={{ position: 'fixed', left: burst.x, top: burst.y }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angleRad = ((i * 30 + (i % 2) * 10) * Math.PI) / 180;
            const dist = 42 + (i % 3) * 18;
            const tx = Math.round(Math.cos(angleRad) * dist);
            const ty = Math.round(Math.sin(angleRad) * dist - 10);
            const rot = (i % 2 === 0 ? 1 : -1) * (120 + i * 22);
            const col = PETAL_PALETTE[i % PETAL_PALETTE.length];

            return (
              <svg
                key={i}
                width="14"
                height="16"
                viewBox="-8 -10 16 20"
                style={
                  {
                    position: 'absolute',
                    left: -7,
                    top: -8,
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                    '--rot': `${rot}deg`,
                    animation: 'burstPetalFly 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  } as React.CSSProperties
                }
              >
                <path
                  d="M0,8 C5,3 6.5,-4 0,-9 C-6.5,-4 -5,3 0,8 Z"
                  fill={col.primary}
                  stroke={col.secondary}
                  strokeWidth="0.7"
                />
              </svg>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ==================== 4. BLOOMING SACRED LOTUS MANDALA ==================== */
export const BloomingLotusMandala: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 340, className = '' }) => {
  const outer24 = Array.from({ length: 24 }, (_, i) => i * 15);
  const mid16 = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const inner8 = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-140 -140 280 280"
      aria-hidden="true"
      className={`select-none pointer-events-none ${className}`}
    >
      <defs>
        <radialGradient id="lotusAuraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
          <stop offset="48%" stopColor="#EC4899" stopOpacity="0.18" />
          <stop offset="82%" stopColor="#6366F1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="outerPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#EC4899" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="innerPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <circle cx="0" cy="0" r="134" fill="url(#lotusAuraGrad)" className="animate-lotus-breathe" />

      {/* 24-Petal Sahasrara Outer Ring */}
      <g className="animate-lotus-cw">
        {outer24.map((deg) => (
          <path
            key={`o24-${deg}`}
            d="M0,-62 C11,-85 13,-114 0,-128 C-13,-114 -11,-85 0,-62 Z"
            fill="url(#outerPetalGrad)"
            stroke="#F472B6"
            strokeOpacity="0.4"
            strokeWidth="0.9"
            transform={`rotate(${deg})`}
          />
        ))}
        <circle
          cx="0"
          cy="0"
          r="98"
          fill="none"
          stroke="#F59E0B"
          strokeOpacity="0.25"
          strokeDasharray="3 5"
        />
      </g>

      {/* 16-Petal Shodashadala Counter-Rotating Ring */}
      <g className="animate-lotus-ccw">
        {mid16.map((deg) => (
          <path
            key={`m16-${deg}`}
            d="M0,-34 C13,-56 15,-82 0,-96 C-15,-82 -13,-56 0,-34 Z"
            fill="url(#innerPetalGrad)"
            stroke="#FBBF24"
            strokeOpacity="0.5"
            strokeWidth="0.9"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* 8-Petal Ashtadala Sacred Heart */}
      <g className="animate-lotus-breathe">
        {inner8.map((deg) => (
          <path
            key={`i8-${deg}`}
            d="M0,-10 C12,-28 14,-48 0,-60 C-14,-48 -12,-28 0,-10 Z"
            fill="#F472B6"
            fillOpacity="0.55"
            stroke="#FEF3C7"
            strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="16" fill="#F59E0B" fillOpacity="0.85" />
        <circle cx="0" cy="0" r="8" fill="#FEF3C7" />
      </g>
    </svg>
  );
};

/* ==================== 5. FLORAL VINE SECTION DIVIDER ==================== */
export const LotusVineDivider: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-2 select-none" aria-hidden={!label}>
      <div className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent via-pink-400/50 to-amber-400/70" />
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <SacredFlowerIcon variety="marigold" primaryHex="#F59E0B" secondaryHex="#FDE68A" size={18} />
        {label ? (
          <span className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
            {label}
          </span>
        ) : (
          <SacredFlowerIcon variety="lotus" primaryHex="#EC4899" secondaryHex="#FBCFE8" size={22} />
        )}
        <SacredFlowerIcon variety="jasmine" primaryHex="#818CF8" secondaryHex="#E0E7FF" size={18} />
      </div>
      <div className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent via-indigo-400/50 to-amber-400/70" />
    </div>
  );
};

/* ==================== 6. CARD CORNER LOTUS WATERMARK ==================== */
export const CornerLotusDecor: React.FC<{
  primaryHex?: string;
  secondaryHex?: string;
}> = ({ primaryHex = '#EC4899', secondaryHex = '#FDE68A' }) => (
  <svg
    width="86"
    height="86"
    viewBox="-44 -44 88 88"
    aria-hidden="true"
    className="pointer-events-none absolute -right-5 -top-5 opacity-25 group-hover:opacity-55 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
  >
    {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
      <path
        key={deg}
        d="M0,-6 C7,-18 8,-32 0,-40 C-8,-32 -7,-18 0,-6 Z"
        fill={primaryHex}
        stroke={secondaryHex}
        strokeWidth="0.9"
        transform={`rotate(${deg})`}
      />
    ))}
    <circle cx="0" cy="0" r="7" fill="#F59E0B" />
  </svg>
);

/* ==================== 7. INTERACTIVE 24-PETAL HORAI LOTUS CLOCK WHEEL ==================== */
interface HoraiLotusClockWheelProps {
  dayHorai: HoraiSlot[];
  nightHorai: HoraiSlot[];
  selectedSlotNumber: number;
  onSelectSlot: (slotNumber: number) => void;
  useEqualHours?: boolean;
}

const TONE_PETAL_FILL: Record<HoraiSlot['tone'], { fill: string; stroke: string; badge: string }> = {
  optimal: { fill: '#10B981', stroke: '#A7F3D0', badge: 'Shubha+' },
  favorable: { fill: '#0EA5E9', stroke: '#BAE6FD', badge: 'Shubha' },
  info: { fill: '#F59E0B', stroke: '#FDE68A', badge: 'Raja' },
  mixed: { fill: '#F43F5E', stroke: '#FECDD3', badge: 'Ugra' },
  avoid: { fill: '#64748B', stroke: '#CBD5E1', badge: 'Manda' },
};

export const HoraiLotusClockWheel: React.FC<HoraiLotusClockWheelProps> = ({
  dayHorai,
  nightHorai,
  selectedSlotNumber,
  onSelectSlot,
  useEqualHours = false,
}) => {
  const all = [...dayHorai, ...nightHorai];
  const activeSlot = all.find((s) => s.isActiveNow) || dayHorai[0];
  const inspectedSlot = all.find((s) => s.slotNumber === selectedSlotNumber) || activeSlot;

  const planetShort: Record<string, string> = {
    Sun: 'Sun',
    Venus: 'Ven',
    Mercury: 'Mer',
    Moon: 'Moo',
    Saturn: 'Sat',
    Jupiter: 'Jup',
    Mars: 'Mar',
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="-215 -215 430 430"
        className="w-full max-w-[420px] h-auto overflow-visible select-none"
        role="img"
        aria-label="Interactive 24-Petal Horai Sacred Flower Clock"
      >
        <defs>
          <radialGradient id="horaiCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#EEF2FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle Botanical Ring Guides */}
        <circle
          cx="0"
          cy="0"
          r="196"
          fill="none"
          stroke="var(--border)"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="0"
          r="132"
          fill="none"
          stroke="var(--border)"
          strokeDasharray="2 4"
          strokeWidth="1"
        />

        {/* OUTER 12 SOLAR DAY PETALS (Slots 1..12) */}
        {dayHorai.map((slot, idx) => {
          const deg = idx * 30;
          const rad = ((deg - 90) * Math.PI) / 180;
          const labelR = 166;
          const lx = Math.cos(rad) * labelR;
          const ly = Math.sin(rad) * labelR;
          const isSelected = slot.slotNumber === selectedSlotNumber;
          const isLive = slot.isActiveNow;
          const colors = TONE_PETAL_FILL[slot.tone];

          return (
            <g
              key={`day-petal-${slot.slotNumber}`}
              onClick={() => onSelectSlot(slot.slotNumber)}
              data-bloom="true"
              className="cursor-pointer group"
            >
              <g transform={`rotate(${deg})`}>
                {isLive && (
                  <path
                    d="M0,-124 C22,-154 24,-192 0,-207 C-24,-192 -22,-154 0,-124 Z"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    className="animate-live-halo"
                  />
                )}
                <path
                  d="M0,-126 C19,-152 21,-186 0,-200 C-21,-186 -19,-152 0,-126 Z"
                  fill={colors.fill}
                  fillOpacity={isLive ? 0.96 : isSelected ? 0.88 : 0.68}
                  stroke={isLive ? '#FBBF24' : isSelected ? '#FFFFFF' : colors.stroke}
                  strokeWidth={isLive ? 2.6 : isSelected ? 2.2 : 1.1}
                  className="transition-all duration-300 hover:opacity-100"
                />
              </g>
              <text
                x={lx}
                y={ly - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize="10.5"
                fontWeight="700"
                className="pointer-events-none"
              >
                {planetShort[slot.lord]}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fillOpacity="0.92"
                fontSize="8.5"
                fontFamily="monospace"
                className="pointer-events-none"
              >
                {(useEqualHours ? slot.equalStartTime : slot.startTime).slice(0, 5)}
              </text>
            </g>
          );
        })}

        {/* INNER 12 LUNAR NIGHT PETALS (Slots 13..24, offset by 15 deg like real lotus layers!) */}
        {nightHorai.map((slot, idx) => {
          const deg = idx * 30 + 15;
          const rad = ((deg - 90) * Math.PI) / 180;
          const labelR = 102;
          const lx = Math.cos(rad) * labelR;
          const ly = Math.sin(rad) * labelR;
          const isSelected = slot.slotNumber === selectedSlotNumber;
          const isLive = slot.isActiveNow;
          const colors = TONE_PETAL_FILL[slot.tone];

          return (
            <g
              key={`night-petal-${slot.slotNumber}`}
              onClick={() => onSelectSlot(slot.slotNumber)}
              data-bloom="true"
              className="cursor-pointer"
            >
              <g transform={`rotate(${deg})`}>
                {isLive && (
                  <path
                    d="M0,-68 C16,-92 18,-120 0,-133 C-18,-120 -16,-92 0,-68 Z"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    className="animate-live-halo"
                  />
                )}
                <path
                  d="M0,-70 C14,-91 16,-116 0,-128 C-16,-116 -14,-91 0,-70 Z"
                  fill={colors.fill}
                  fillOpacity={isLive ? 0.94 : isSelected ? 0.85 : 0.52}
                  stroke={isLive ? '#FBBF24' : isSelected ? '#FFFFFF' : colors.stroke}
                  strokeWidth={isLive ? 2.4 : isSelected ? 2 : 1}
                  className="transition-all duration-300 hover:opacity-100"
                />
              </g>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize="9.2"
                fontWeight="700"
                className="pointer-events-none"
              >
                {planetShort[slot.lord]}
              </text>
            </g>
          );
        })}

        {/* SACRED LOTUS HEART MEDALLION */}
        <circle
          cx="0"
          cy="0"
          r="66"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        <circle
          cx="0"
          cy="0"
          r="60"
          fill="none"
          stroke={inspectedSlot.sacredFlower.primaryHex}
          strokeOpacity="0.45"
          strokeDasharray="3 3"
          className="animate-lotus-cw"
        />

        {/* Mini Flower Emblem in Center */}
        <g transform="translate(0, -24)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
            <path
              key={d}
              d="M0,-2 C3,-6 3.5,-11 0,-13.5 C-3.5,-11 -3,-6 0,-2 Z"
              fill={inspectedSlot.sacredFlower.primaryHex}
              transform={`rotate(${d})`}
            />
          ))}
          <circle cx="0" cy="0" r="3" fill="#F59E0B" />
        </g>

        <text
          x="0"
          y="3"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="12.5"
          fontWeight="800"
        >
          {inspectedSlot.horaiName}
        </text>
        <text
          x="0"
          y="18"
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize="10"
          fontFamily="monospace"
        >
          {useEqualHours
            ? `${inspectedSlot.equalStartTime}–${inspectedSlot.equalEndTime}`
            : `${inspectedSlot.startTime}–${inspectedSlot.endTime}`}
        </text>
        <text
          x="0"
          y="33"
          textAnchor="middle"
          fill={inspectedSlot.isActiveNow ? 'var(--sage)' : 'var(--accent)'}
          fontSize="9.5"
          fontWeight="700"
        >
          {inspectedSlot.isActiveNow
            ? `LIVE • ${inspectedSlot.minutesRemaining}m left`
            : `${inspectedSlot.period} #${inspectedSlot.hourIndexInPeriod}`}
        </text>
      </svg>

      {/* Compact Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-secondary)] mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Supreme Shubha (Sukra/Guru)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>Shubha (Budha/Chandra)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Authority (Suriya)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Ugra (Sevvai)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>Manda (Sani)</span>
        </span>
      </div>
    </div>
  );
};
