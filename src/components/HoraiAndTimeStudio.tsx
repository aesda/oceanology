import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scale,
  Compass,
} from 'lucide-react';
import { CityLocation } from '../types/oceanology';
import {
  calculatePanchang,
  HORAI_LORD_META,
  HoraiLordId,
  HoraiSlot,
} from '../engines/panchangEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';
import {
  DayTimelineBar,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
} from './ui/DashboardPrimitives';
import {
  BloomingLotusMandala,
  CornerLotusDecor,
  HoraiLotusClockWheel,
  LotusVineDivider,
  SacredFlowerIcon,
} from './ui/FloralAnimations';

interface HoraiAndTimeStudioProps {
  location: CityLocation;
  natalMoonNakshatraIdx: number;
  natalMoonSignIdx: number;
  onOpenActionSimulator?: (actionId?: string) => void;
  onInspectNakshatra?: (nakIdx: number) => void;
}

type StudioDetailTab = 'HORAI_24' | 'GOWRI_NALLA' | 'MUHURAT_KALAM' | 'SEVEN_LORDS';
type HoraiFilter = 'ALL' | 'WEALTH' | 'CONTRACTS' | 'HEALING' | 'DEBT';

export const HoraiAndTimeStudio: React.FC<HoraiAndTimeStudioProps> = ({
  location,
  natalMoonNakshatraIdx,
  natalMoonSignIdx,
  onOpenActionSimulator,
  onInspectNakshatra,
}) => {
  const [nowTick, setNowTick] = useState<Date>(() => new Date());
  const [dateOffsetDays, setDateOffsetDays] = useState<number>(0);
  const [useEqualHours, setUseEqualHours] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<StudioDetailTab>('HORAI_24');
  const [horaiFilter, setHoraiFilter] = useState<HoraiFilter>('ALL');
  const [selectedSlotNum, setSelectedSlotNum] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowTick(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetDate = useMemo(() => {
    return new Date(nowTick.getTime() + dateOffsetDays * 86400000);
  }, [nowTick, dateOffsetDays]);

  // Recompute astronomical Panchang once per minute (or when date/city changes) for crisp performance
  const minuteBucket = Math.floor(targetDate.getTime() / 60000);
  const livePanchang = useMemo(() => {
    return calculatePanchang(
      new Date(minuteBucket * 60000 + (nowTick.getTime() % 60000)),
      location,
      natalMoonNakshatraIdx,
      natalMoonSignIdx
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteBucket, location, natalMoonNakshatraIdx, natalMoonSignIdx]);

  // Exact local city clock HH:MM:SS
  const cityClockFormatted = useMemo(() => {
    const cityMs = nowTick.getTime() + location.timezoneOffsetHours * 3600000;
    const d = new Date(cityMs);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    const ss = d.getUTCSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }, [nowTick, location.timezoneOffsetHours]);

  const activeHorai = livePanchang.activeHorai;
  const activeSecondsPart = 59 - (Math.floor(nowTick.getTime() / 1000) % 60);
  const displayMinsLeft = Math.max(0, activeHorai.minutesRemaining - 1);

  const inspectedSlot: HoraiSlot = useMemo(() => {
    if (selectedSlotNum !== null) {
      return (
        livePanchang.allHorai.find((s) => s.slotNumber === selectedSlotNum) ||
        activeHorai
      );
    }
    return activeHorai;
  }, [selectedSlotNum, livePanchang.allHorai, activeHorai]);

  const [yr, mo, dy] = livePanchang.dateStr.split('-').map((n) => parseInt(n, 10));
  const bsDate = gregorianToBikramSambat(yr || 2026, mo || 10, dy || 25);

  const rahuSlot = livePanchang.muhurats.find((m) => m.name === 'Rahu Kaal');
  const activeChoghadiya =
    [...livePanchang.dayChoghadiya, ...livePanchang.nightChoghadiya].find(
      (c) => c.isActiveNow
    ) || livePanchang.dayChoghadiya[0];

  const filterMatches = (slot: HoraiSlot): boolean => {
    if (horaiFilter === 'ALL') return true;
    if (horaiFilter === 'WEALTH') return ['Venus', 'Jupiter'].includes(slot.lord);
    if (horaiFilter === 'CONTRACTS') return ['Mercury', 'Jupiter', 'Venus'].includes(slot.lord);
    if (horaiFilter === 'HEALING') return ['Moon', 'Jupiter', 'Sun'].includes(slot.lord);
    if (horaiFilter === 'DEBT') return ['Mars', 'Mercury'].includes(slot.lord);
    return true;
  };

  const slotTimeStr = (slot: HoraiSlot) =>
    useEqualHours
      ? `${slot.equalStartTime} – ${slot.equalEndTime}`
      : `${slot.startTime} – ${slot.endTime}`;

  return (
    <div className="space-y-6 animate-bloom-in">
      {/* ==================== TOP HEADER & DATE / CLOCK CONTROLS ==================== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <SacredFlowerIcon
              variety={activeHorai.sacredFlower.variety}
              primaryHex={activeHorai.sacredFlower.primaryHex}
              secondaryHex={activeHorai.sacredFlower.secondaryHex}
              size={30}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
              Live Horai Time, Gowri &amp; Sacred Clock
            </h1>
            <StatusBadge
              tone="optimal"
              label={`${location.name} • ${cityClockFormatted}`}
            />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {livePanchang.vara.name} • Gregorian {livePanchang.dateStr} • Nepali{' '}
            <strong>{bsDate.formattedEn}</strong> • Sunrise {livePanchang.sunriseTime} / Sunset{' '}
            {livePanchang.sunsetTime}
          </p>
        </div>

        {/* Date Switcher & Hora Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setDateOffsetDays((d) => d - 1);
                setSelectedSlotNum(null);
              }}
              aria-label="Previous day"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDateOffsetDays(0);
                setSelectedSlotNum(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dateOffsetDays === 0
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              {dateOffsetDays === 0
                ? 'Live Today'
                : dateOffsetDays > 0
                ? `+${dateOffsetDays}d (${livePanchang.dateStr})`
                : `${dateOffsetDays}d (${livePanchang.dateStr})`}
            </button>
            <button
              type="button"
              onClick={() => {
                setDateOffsetDays((d) => d + 1);
                setSelectedSlotNum(null);
              }}
              aria-label="Next day"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUseEqualHours(false)}
              className={`px-3 py-1.5 rounded-lg transition ${
                !useEqualHours
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Solar Hora
            </button>
            <button
              type="button"
              onClick={() => setUseEqualHours(true)}
              className={`px-3 py-1.5 rounded-lg transition ${
                useEqualHours
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              1-Hr Horai
            </button>
          </div>
        </div>
      </div>

      {/* ==================== HERO LIVE HORAI FLORAL BANNER ==================== */}
      <div className="obs-card floral-banner-glow p-6 sm:p-7 relative overflow-hidden group">
        <div className="pointer-events-none absolute -right-20 -bottom-24 opacity-30">
          <BloomingLotusMandala size={310} />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ACTIVE HORAI RIGHT NOW</span>
              </span>
              <StatusBadge tone={activeHorai.tone} label={activeHorai.quality} />
              <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--surface)]/80 px-2.5 py-1 rounded-md border border-[var(--border)]">
                {activeHorai.devanagariName} • {activeHorai.tamilName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md flex items-center justify-center shrink-0">
                <SacredFlowerIcon
                  variety={activeHorai.sacredFlower.variety}
                  primaryHex={activeHorai.sacredFlower.primaryHex}
                  secondaryHex={activeHorai.sacredFlower.secondaryHex}
                  size={44}
                />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                  {activeHorai.horaiName}{' '}
                  <span className="text-lg font-semibold text-[var(--text-secondary)]">
                    ({activeHorai.lord} Planetary Hour)
                  </span>
                </h2>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
                  Sacred Flower: <strong>{activeHorai.sacredFlower.name}</strong> • Window:{' '}
                  <strong className="font-mono">{slotTimeStr(activeHorai)}</strong>
                </p>
              </div>
            </div>

            <p className="text-base text-[var(--text)] leading-relaxed max-w-2xl">
              {activeHorai.plainSummary}
            </p>

            {activeHorai.kalamConflictNote ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--amber-bg)] border border-amber-500/30 text-sm font-semibold text-[var(--amber)]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Heads-up: {activeHorai.kalamConflictNote} — pause brand-new launches until the
                  overlap passes.
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--sage-bg)] border border-emerald-500/30 text-sm font-semibold text-[var(--sage)]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Clear of Rahu Kalam &amp; Yamagandam right now</span>
              </div>
            )}
          </div>

          {/* Right Live Countdown & Progress Card */}
          <div className="lg:col-span-5 bg-[var(--surface)]/95 backdrop-blur-md rounded-2xl border border-[var(--border)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Time Remaining in {activeHorai.horaiName}
              </span>
              <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                Vedic {livePanchang.vedicClock.formatted}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[var(--text)]">
                {dateOffsetDays === 0
                  ? `${displayMinsLeft.toString().padStart(2, '0')}m : ${activeSecondsPart
                      .toString()
                      .padStart(2, '0')}s`
                  : `${activeHorai.durationMinutes} min`}
              </div>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">
                {activeHorai.progressPercent}% elapsed
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(6, activeHorai.progressPercent)}%`,
                  background: `linear-gradient(90deg, ${activeHorai.sacredFlower.primaryHex}, #6366F1)`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="obs-panel p-2.5">
                <div className="text-[var(--text-muted)] font-medium">Next Pure Shubha Horai</div>
                <div className="font-bold text-[var(--text)] text-sm mt-0.5">
                  {livePanchang.nextShubhaHorai.horaiName}
                </div>
                <div className="font-mono text-[var(--accent)]">
                  {slotTimeStr(livePanchang.nextShubhaHorai)}
                </div>
              </div>
              <div className="obs-panel p-2.5">
                <div className="text-[var(--text-muted)] font-medium">Active Gowri &amp; Choghadiya</div>
                <div className="font-bold text-[var(--text)] text-sm mt-0.5">
                  {livePanchang.activeGowri.name} • {activeChoghadiya.name}
                </div>
                <div className="text-[var(--text-secondary)]">
                  {livePanchang.activeGowri.nature}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4 LIVE SACRED TIME KPI CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label="Morning Nalla Neram"
          value={`${livePanchang.nallaNeram[0].startTime} – ${livePanchang.nallaNeram[0].endTime}`}
          plainHint={`Pure ${livePanchang.nallaNeram[0].gowriName} morning window (no Rahu/Yama)`}
          benchmarkText={`Sunrise at ${livePanchang.sunriseTime}`}
          status={{ tone: 'optimal', label: 'Best Morning Slot' }}
          icon={<Sun className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Evening Nalla Neram"
          value={`${livePanchang.nallaNeram[1].startTime} – ${livePanchang.nallaNeram[1].endTime}`}
          plainHint={`Pure ${livePanchang.nallaNeram[1].gowriName} afternoon/evening window`}
          benchmarkText={`Sunset at ${livePanchang.sunsetTime}`}
          status={{ tone: 'favorable', label: 'Best Afternoon Slot' }}
          icon={<Sparkles className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Rahu Kalam Today"
          value={rahuSlot ? `${rahuSlot.startTime} – ${rahuSlot.endTime}` : '—'}
          plainHint="Avoid starting fresh contracts, loans, or marriage talks in this span"
          benchmarkText={rahuSlot?.isActiveNow ? 'Active right now — wait!' : 'Currently outside Rahu Kalam'}
          status={{
            tone: rahuSlot?.isActiveNow ? 'avoid' : 'info',
            label: rahuSlot?.isActiveNow ? 'Active Now' : 'Window to Avoid',
          }}
          icon={<Clock className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Today’s Moon Star & Harmony"
          value={livePanchang.nakshatra.name}
          subvalue={`Pada ${livePanchang.nakshatra.pada}`}
          plainHint={`Personal Tarabala: ${
            livePanchang.personalTarabala.isAuspicious ? 'Supportive' : 'Pace Carefully'
          }`}
          benchmarkText={`${livePanchang.tithi.name} (${livePanchang.tithi.paksha.split(' ')[0]})`}
          status={{
            tone: livePanchang.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
            label: `Tara #${livePanchang.personalTarabala.taraNumber}`,
          }}
          icon={<Compass className="w-4 h-4" />}
          actionLabel={onInspectNakshatra ? 'Open Star Guide' : undefined}
          onAction={
            onInspectNakshatra
              ? () => onInspectNakshatra(livePanchang.nakshatra.zeroIndex)
              : undefined
          }
        />
      </div>

      {/* ==================== INTERACTIVE 24-PETAL HORAI LOTUS WHEEL + INSPECTOR ==================== */}
      <div className="obs-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Interactive 24-Petal Horai Sacred Lotus Clock
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Outer 12 petals = Daytime Horais ({livePanchang.sunriseTime}–{livePanchang.sunsetTime}
              ) • Inner 12 petals = Nighttime Horais. Click any petal to inspect!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'All 24 Hours' },
                { id: 'WEALTH', label: 'Wealth & Gold (Sukra/Guru)' },
                { id: 'CONTRACTS', label: 'Contracts & Study' },
                { id: 'HEALING', label: 'Healing & Travel' },
                { id: 'DEBT', label: 'Repay Debt (Sevvai)' },
              ] as { id: HoraiFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHoraiFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  horaiFilter === f.id
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm'
                    : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: 24-Petal Flower Clock */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <HoraiLotusClockWheel
              dayHorai={livePanchang.dayHorai}
              nightHorai={livePanchang.nightHorai}
              selectedSlotNumber={inspectedSlot.slotNumber}
              onSelectSlot={(num) => setSelectedSlotNum(num)}
              useEqualHours={useEqualHours}
            />
          </div>

          {/* Right: Selected Petal Deep Inspector */}
          <div className="lg:col-span-6 obs-panel p-5 sm:p-6 relative overflow-hidden group space-y-4">
            <CornerLotusDecor
              primaryHex={inspectedSlot.sacredFlower.primaryHex}
              secondaryHex={inspectedSlot.sacredFlower.secondaryHex}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text)]">
                  {inspectedSlot.period} HOUR #{inspectedSlot.hourIndexInPeriod} (Slot{' '}
                  {inspectedSlot.slotNumber}/24)
                </span>
                {inspectedSlot.isActiveNow && (
                  <StatusBadge tone="optimal" label="LIVE NOW" />
                )}
              </div>
              {selectedSlotNum !== null && selectedSlotNum !== activeHorai.slotNumber && (
                <button
                  type="button"
                  onClick={() => setSelectedSlotNum(null)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Jump back to Live Hour
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <SacredFlowerIcon
                variety={inspectedSlot.sacredFlower.variety}
                primaryHex={inspectedSlot.sacredFlower.primaryHex}
                secondaryHex={inspectedSlot.sacredFlower.secondaryHex}
                size={42}
              />
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text)]">
                  {inspectedSlot.horaiName} — {slotTimeStr(inspectedSlot)}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {inspectedSlot.sanskritHora} • {inspectedSlot.tamilName} • Sacred Pushpa:{' '}
                  <strong>{inspectedSlot.sacredFlower.name}</strong>
                </p>
              </div>
            </div>

            <p className="text-base text-[var(--text)] leading-relaxed">
              {inspectedSlot.plainSummary}
            </p>

            {inspectedSlot.kalamConflictNote && (
              <div className="p-3 rounded-lg bg-[var(--amber-bg)] border border-amber-500/30 text-sm text-[var(--amber)] font-medium">
                <strong>Note:</strong> {inspectedSlot.kalamConflictNote}. Wait until the overlap
                clears before initiating major new commitments.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--sage)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Best Actions in This Horai</span>
                </div>
                <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                  {inspectedSlot.bestFor.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-[var(--sage)] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--crimson)]">
                  <XCircle className="w-4 h-4" />
                  <span>Avoid During This Horai</span>
                </div>
                <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                  {inspectedSlot.avoidFor.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-[var(--crimson)] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] italic max-w-md">
                {inspectedSlot.classicalRule}
              </p>
              {onOpenActionSimulator && (
                <button
                  type="button"
                  onClick={() => onOpenActionSimulator()}
                  className="btn-editorial-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Test Action Score</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <LotusVineDivider label="Complete Daily Sacred Time Tables" />

      {/* ==================== COMPLETE HORAI, GOWRI, MUHURAT & LORDS TABS ==================== */}
      <div className="obs-card p-5 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <SegmentedTabs
            ariaLabel="Sacred time schedules"
            value={detailTab}
            onChange={setDetailTab}
            items={[
              { id: 'HORAI_24', label: '24-Hour Horai Table', count: 24 },
              { id: 'GOWRI_NALLA', label: 'Gowri Panchangam & Nalla Neram', count: 16 },
              {
                id: 'MUHURAT_KALAM',
                label: 'Muhurats, Kalam & Choghadiya',
                count: livePanchang.muhurats.length,
              },
              { id: 'SEVEN_LORDS', label: '7 Horai Flowers & Meaning', count: 7 },
            ]}
          />
        </div>

        {/* TAB 1: FULL 24-HOUR DAY & NIGHT HORAI SCHEDULE */}
        {detailTab === 'HORAI_24' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Day Horai */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text)] inline-flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>
                    Daytime Horai (12 Hours: {livePanchang.sunriseTime} – {livePanchang.sunsetTime})
                  </span>
                </h3>
              </div>
              <div className="space-y-2">
                {livePanchang.dayHorai.filter(filterMatches).map((slot) => (
                  <button
                    key={slot.slotNumber}
                    type="button"
                    onClick={() => setSelectedSlotNum(slot.slotNumber)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      slot.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] ring-1 ring-[var(--accent)]'
                        : inspectedSlot.slotNumber === slot.slotNumber
                        ? 'border-[var(--accent)] bg-[var(--surface-muted)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <SacredFlowerIcon
                        variety={slot.sacredFlower.variety}
                        primaryHex={slot.sacredFlower.primaryHex}
                        secondaryHex={slot.sacredFlower.secondaryHex}
                        size={28}
                        animated={slot.isActiveNow}
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text)]">
                            #{slot.hourIndexInPeriod} {slot.horaiName}
                          </span>
                          <StatusBadge tone={slot.tone} label={slot.quality} />
                          {slot.isActiveNow && <StatusBadge tone="optimal" label="LIVE" />}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {slot.bestFor[0]} • {slot.tamilName}
                        </p>
                        {slot.kalamConflictNote && (
                          <p className="text-xs font-semibold text-[var(--amber)]">
                            ⚠ {slot.kalamConflictNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                      {slotTimeStr(slot)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Night Horai */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text)] inline-flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>
                    Nighttime Horai (12 Hours: {livePanchang.sunsetTime} – Next Sunrise)
                  </span>
                </h3>
              </div>
              <div className="space-y-2">
                {livePanchang.nightHorai.filter(filterMatches).map((slot) => (
                  <button
                    key={slot.slotNumber}
                    type="button"
                    onClick={() => setSelectedSlotNum(slot.slotNumber)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      slot.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] ring-1 ring-[var(--accent)]'
                        : inspectedSlot.slotNumber === slot.slotNumber
                        ? 'border-[var(--accent)] bg-[var(--surface-muted)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <SacredFlowerIcon
                        variety={slot.sacredFlower.variety}
                        primaryHex={slot.sacredFlower.primaryHex}
                        secondaryHex={slot.sacredFlower.secondaryHex}
                        size={28}
                        animated={slot.isActiveNow}
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text)]">
                            #{slot.hourIndexInPeriod} {slot.horaiName}
                          </span>
                          <StatusBadge tone={slot.tone} label={slot.quality} />
                          {slot.isActiveNow && <StatusBadge tone="optimal" label="LIVE" />}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {slot.bestFor[0]} • {slot.tamilName}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                      {slotTimeStr(slot)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOWRI PANCHANGAM & NALLA NERAM */}
        {detailTab === 'GOWRI_NALLA' && (
          <div className="space-y-6">
            {/* Nalla Neram Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {livePanchang.nallaNeram.map((nn) => (
                <div
                  key={nn.periodLabel}
                  className="obs-panel floral-banner-glow p-5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SacredFlowerIcon
                        variety="marigold"
                        primaryHex="#10B981"
                        secondaryHex="#A7F3D0"
                        size={24}
                      />
                      <span className="text-base font-bold text-[var(--text)]">
                        {nn.periodLabel}
                      </span>
                      <StatusBadge tone="optimal" label={nn.gowriName} />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{nn.note}</p>
                  </div>
                  <div className="font-mono text-lg font-extrabold text-[var(--sage)] bg-[var(--surface)] px-3.5 py-2 rounded-xl border border-[var(--border)] whitespace-nowrap">
                    {nn.startTime} – {nn.endTime}
                  </div>
                </div>
              ))}
            </div>

            {/* 8 Day + 8 Night Gowri Panchangam */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <h3 className="text-base font-bold text-[var(--text)]">
                  Day Gowri Panchangam (8 Solar Octants)
                </h3>
                {livePanchang.dayGowri.map((g) => (
                  <div
                    key={`dg-${g.slotIndex}`}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      g.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">
                          {g.name} ({g.tamilLabel})
                        </span>
                        <StatusBadge tone={g.tone} label={g.nature} />
                        {g.isActiveNow && <StatusBadge tone="optimal" label="LIVE" />}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{g.plainMeaning}</p>
                      {g.hasRahuOrYamaOverlap && (
                        <p className="text-xs font-semibold text-[var(--amber)]">
                          Note: Overlaps Rahu Kalam or Yamagandam
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap">
                      {g.startTime}–{g.endTime}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-base font-bold text-[var(--text)]">
                  Night Gowri Panchangam (8 Lunar Octants)
                </h3>
                {livePanchang.nightGowri.map((g) => (
                  <div
                    key={`ng-${g.slotIndex}`}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      g.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">
                          {g.name} ({g.tamilLabel})
                        </span>
                        <StatusBadge tone={g.tone} label={g.nature} />
                        {g.isActiveNow && <StatusBadge tone="optimal" label="LIVE" />}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{g.plainMeaning}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap">
                      {g.startTime}–{g.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALL MUHURATS, KALAMS & 16 CHOGHADIYAS */}
        {detailTab === 'MUHURAT_KALAM' && (
          <div className="space-y-6">
            <DayTimelineBar
              sunriseTime={livePanchang.sunriseTime}
              sunsetTime={livePanchang.sunsetTime}
              windows={livePanchang.muhurats}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-2.5">
                <h3 className="text-base font-bold text-[var(--text)]">
                  All Daily Sacred Muhurtas &amp; Caution Kalams
                </h3>
                {livePanchang.muhurats.map((m) => (
                  <div
                    key={m.name}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      m.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">{m.name}</span>
                        <StatusBadge
                          tone={
                            m.category === 'Auspicious'
                              ? 'optimal'
                              : m.category === 'Inauspicious'
                              ? 'avoid'
                              : 'info'
                          }
                          label={m.category}
                        />
                        {m.isActiveNow && <StatusBadge tone="optimal" label="ACTIVE NOW" />}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{m.description}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] bg-[var(--surface)] px-2.5 py-1 rounded border border-[var(--border)] whitespace-nowrap">
                      {m.startTime}–{m.endTime}
                    </span>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">Day Choghadiya</h3>
                  {livePanchang.dayChoghadiya.map((c, i) => (
                    <div
                      key={`dc-${i}`}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        c.isActiveNow
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface-muted)]'
                      }`}
                    >
                      <span>
                        <strong>{c.name}</strong> ({c.ruler})
                      </span>
                      <span className="font-mono">
                        {c.startTime}–{c.endTime}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">Night Choghadiya</h3>
                  {livePanchang.nightChoghadiya.map((c, i) => (
                    <div
                      key={`nc-${i}`}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        c.isActiveNow
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface-muted)]'
                      }`}
                    >
                      <span>
                        <strong>{c.name}</strong> ({c.ruler})
                      </span>
                      <span className="font-mono">
                        {c.startTime}–{c.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 7 HORAI LORDS & SACRED FLOWERS ENCYCLOPEDIA */}
        {detailTab === 'SEVEN_LORDS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              ['Venus', 'Jupiter', 'Mercury', 'Moon', 'Sun', 'Mars', 'Saturn'] as HoraiLordId[]
            ).map((lordId) => {
              const meta = HORAI_LORD_META[lordId];
              return (
                <div
                  key={lordId}
                  className="obs-panel p-5 relative overflow-hidden group space-y-3"
                >
                  <CornerLotusDecor
                    primaryHex={meta.sacredFlower.primaryHex}
                    secondaryHex={meta.sacredFlower.secondaryHex}
                  />
                  <div className="flex items-center gap-3">
                    <SacredFlowerIcon
                      variety={meta.sacredFlower.variety}
                      primaryHex={meta.sacredFlower.primaryHex}
                      secondaryHex={meta.sacredFlower.secondaryHex}
                      size={36}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-[var(--text)]">
                          {meta.horaiName} ({meta.id})
                        </h3>
                        <StatusBadge tone={meta.tone} label={meta.quality} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {meta.devanagariName} • {meta.tamilName} • Flower:{' '}
                        <strong>{meta.sacredFlower.name}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed">{meta.plainSummary}</p>
                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <div>
                      <strong className="text-[var(--sage)]">Do:</strong>{' '}
                      {meta.bestFor.join(' • ')}
                    </div>
                    <div>
                      <strong className="text-[var(--crimson)]">Avoid:</strong>{' '}
                      {meta.avoidFor.join(' • ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden quick-reference Calendar footer */}
      <div className="obs-panel p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <span>
            Want to find the single best day + Horai in the next 12 days for a specific decision?
          </span>
        </div>
        {onOpenActionSimulator && (
          <button
            type="button"
            onClick={() => onOpenActionSimulator('SIGN_CONTRACT')}
            className="btn-editorial-primary text-xs py-2 px-4"
          >
            Open Action &amp; Horai Timing Finder
          </button>
        )}
      </div>
    </div>
  );
};
