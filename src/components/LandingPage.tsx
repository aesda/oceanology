import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Compass,
  MapPin,
  Scale,
  BookOpen,
  Globe,
  Sparkles,
  Sun,
  Moon,
  Calendar,
  Activity,
} from 'lucide-react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';
import { evaluateActionConsequence, scanUpcomingBestWindows } from '../data/karmaAndMuhurtaCodex';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { KpiStatCard, ScoreTrendChart, StatusBadge } from './ui/DashboardPrimitives';

export type WebsiteDestination =
  | 'HOME'
  | 'NAKSHATRAS'
  | 'WHAT_HAPPENS_IF'
  | 'OBSERVATORY'
  | 'CANON';

export type ObservatoryStudioTab =
  | 'SYNTHESIS'
  | 'WESTERN'
  | 'VEDIC_KP'
  | 'PANCHANG'
  | 'ASTROCARTOGRAPHY'
  | 'NUMEROLOGY'
  | 'SYNASTRY';

interface Props {
  profile: BirthProfile;
  onProfileChange: (profile: BirthProfile) => void;
  natalChart: NatalChartResult;
  vedicReport: VedicReport;
  panchangReport: PanchangReport;
  numerologyReport: NumerologyReport;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (
    dest: WebsiteDestination,
    subTarget?: {
      nakIdx?: number;
      actionId?: string;
      studioTab?: ObservatoryStudioTab;
      bookId?: string;
    }
  ) => void;
}

const HERO_PREVIEW_ACTIONS = [
  { id: 'SIGN_CONTRACT', label: 'Sign Contract' },
  { id: 'LEND_MONEY', label: 'Lend Money' },
  { id: 'REPAY_DEBT', label: 'Repay Debt' },
  { id: 'MARRIAGE_VIVAHA', label: 'Marriage' },
];

export const LandingPage: React.FC<Props> = ({
  profile,
  onProfileChange,
  natalChart,
  vedicReport,
  panchangReport,
  numerologyReport,
  darkMode,
  onToggleDarkMode,
  onNavigate,
}) => {
  const [previewActionId, setPreviewActionId] = useState<string>('SIGN_CONTRACT');
  const [showCitySearch, setShowCitySearch] = useState<boolean>(false);

  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[0];

  const liveEval = useMemo(
    () =>
      evaluateActionConsequence(
        previewActionId,
        new Date(),
        profile.location,
        moonPlanet.nakshatraIndex,
        moonPlanet.signIndex
      ),
    [previewActionId, profile.location, moonPlanet.nakshatraIndex, moonPlanet.signIndex]
  );

  const forecastPoints = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 10 }).map((_, idx) => {
      const d = new Date(start.getTime() + idx * 86400000);
      d.setHours(10, 30, 0, 0);
      const rep = evaluateActionConsequence(
        previewActionId,
        d,
        profile.location,
        moonPlanet.nakshatraIndex,
        moonPlanet.signIndex
      );
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        id: d.toISOString().slice(0, 10),
        label: idx === 0 ? 'Today' : dateStr,
        sublabel: rep.panchang.nakshatra.name.slice(0, 6),
        value: rep.score,
      };
    });
  }, [previewActionId, profile.location, moonPlanet.nakshatraIndex, moonPlanet.signIndex]);

  const bestUpcoming = useMemo(
    () =>
      scanUpcomingBestWindows(
        previewActionId,
        new Date(),
        profile.location,
        moonPlanet.nakshatraIndex,
        moonPlanet.signIndex,
        10
      )[0],
    [previewActionId, profile.location, moonPlanet.nakshatraIndex, moonPlanet.signIndex]
  );

  const quickCities = useMemo(() => {
    const wanted = ['Kathmandu', 'Pokhara', 'Varanasi', 'London', 'New York'];
    return NEPAL_AND_GLOBAL_CITIES.filter((c) =>
      wanted.some((w) => c.name.toLowerCase().includes(w.toLowerCase()))
    ).slice(0, 5);
  }, []);

  const topSavHouse = useMemo(() => {
    return [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0];
  }, [vedicReport.sarvashtakavarga]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ==================== CLEAN PRODUCT NAVBAR ==================== */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                ☉
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-[var(--text)]">
                Oceanology
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={() => onNavigate('WHAT_HAPPENS_IF')}
                className="hover:text-[var(--text)] transition"
              >
                Action Timing
              </button>
              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' })}
                className="hover:text-[var(--text)] transition"
              >
                Charts &amp; Ashtakavarga
              </button>
              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' })}
                className="hover:text-[var(--text)] transition"
              >
                World Relocation
              </button>
              <button
                type="button"
                onClick={() => onNavigate('NAKSHATRAS')}
                className="hover:text-[var(--text)] transition"
              >
                28 Nakshatras
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)] transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
              className="btn-editorial-primary inline-flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ==================== 5-SECOND TEST SPLIT HERO ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left (5 cols): Clear Value Prop + Instant Birth Profile Launcher */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>100% Client-Side Ephemeris • Zero Telemetry</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--text)] leading-[1.12] tracking-tight">
                  Know when to act, where you thrive, and how your sky aligns.
                </h1>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  Decision-driven astrology, Vedic Kundali, Nepali Patro, and global relocation
                  powered by real geocentric astronomy—clear summaries upfront, classical depth on
                  demand.
                </p>
              </div>

              {/* Clean Birth Profile Launcher Card */}
              <div className="obs-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    Personalize Your Workspace
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName} Asc •{' '}
                    {moonPlanet.nakshatraName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          firstName: e.target.value,
                          currentFirstName: e.target.value,
                        })
                      }
                      className="w-full obs-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          lastName: e.target.value,
                          currentLastName: e.target.value,
                        })
                      }
                      className="w-full obs-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Birth date (YYYY / MM / DD)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="number"
                        aria-label="Birth year"
                        value={profile.year}
                        onChange={(e) =>
                          onProfileChange({
                            ...profile,
                            year: parseInt(e.target.value, 10) || 1996,
                          })
                        }
                        className="obs-input font-mono text-xs px-2"
                      />
                      <input
                        type="number"
                        aria-label="Birth month"
                        min={1}
                        max={12}
                        value={profile.month}
                        onChange={(e) =>
                          onProfileChange({
                            ...profile,
                            month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
                          })
                        }
                        className="obs-input font-mono text-xs px-2"
                      />
                      <input
                        type="number"
                        aria-label="Birth day"
                        min={1}
                        max={31}
                        value={profile.day}
                        onChange={(e) =>
                          onProfileChange({
                            ...profile,
                            day: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)),
                          })
                        }
                        className="obs-input font-mono text-xs px-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Birth time (24h HH : MM)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="number"
                        aria-label="Birth hour"
                        min={0}
                        max={23}
                        value={profile.hour}
                        onChange={(e) =>
                          onProfileChange({
                            ...profile,
                            hour: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)),
                          })
                        }
                        className="obs-input font-mono text-xs"
                      />
                      <input
                        type="number"
                        aria-label="Birth minute"
                        min={0}
                        max={59}
                        value={profile.minute}
                        onChange={(e) =>
                          onProfileChange({
                            ...profile,
                            minute: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                          })
                        }
                        className="obs-input font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Clean Location Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {profile.location.name}, {profile.location.country}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCitySearch(!showCitySearch)}
                      className="text-[var(--accent)] font-medium hover:underline"
                    >
                      {showCitySearch ? 'Done' : 'Change city'}
                    </button>
                  </div>

                  {!showCitySearch ? (
                    <div className="flex flex-wrap gap-1.5">
                      {quickCities.map((city) => {
                        const active = city.id === profile.location.id;
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => onProfileChange({ ...profile, location: city })}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                              active
                                ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30'
                                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                            }`}
                          >
                            {city.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <GlobalLocationPicker
                      label="Search global & Nepal cities"
                      value={profile.location}
                      onChange={(loc) => {
                        onProfileChange({ ...profile, location: loc });
                        setShowCitySearch(false);
                      }}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                    className="btn-editorial-primary flex items-center justify-center gap-2"
                  >
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="btn-editorial-secondary flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4 text-[var(--accent)]" />
                    <span>Check Action Timing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right (7 cols): Live Interactive Decision & Forecast Preview Window */}
            <div className="lg:col-span-7 obs-card overflow-hidden shadow-sm">
              {/* Window Top Context Strip */}
              <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-semibold text-[var(--text)]">
                    Live Decision Timing Preview — {profile.location.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {HERO_PREVIEW_ACTIONS.map((act) => {
                    const active = act.id === previewActionId;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setPreviewActionId(act.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          active
                            ? 'bg-[var(--surface)] text-[var(--accent)] font-semibold shadow-sm border border-[var(--border)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                        }`}
                      >
                        {act.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                {/* 3 Focused Contextual Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="obs-panel p-3.5 space-y-1.5">
                    <div className="text-xs text-[var(--text-secondary)]">Today’s Readiness</div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xl font-bold tabular-nums text-[var(--text)]">
                        {liveEval.score}
                        <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                      </span>
                      <StatusBadge
                        tone={
                          liveEval.score >= 70
                            ? 'optimal'
                            : liveEval.score >= 48
                            ? 'mixed'
                            : 'avoid'
                        }
                        label={
                          liveEval.score >= 70
                            ? 'Optimal'
                            : liveEval.score >= 48
                            ? 'Mixed'
                            : 'Postpone'
                        }
                      />
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] tabular-nums">
                      {liveEval.score >= 70
                        ? `+${liveEval.score - 70} pts above safe threshold`
                        : `${70 - liveEval.score} pts below 70 threshold`}
                    </div>
                  </div>

                  <div className="obs-panel p-3.5 space-y-1.5">
                    <div className="text-xs text-[var(--text-secondary)]">Best Date in 10 Days</div>
                    <div className="text-lg font-bold text-[var(--text)] tabular-nums">
                      {bestUpcoming?.dateStr || panchangReport.dateStr}
                    </div>
                    <div className="text-[11px] text-[var(--sage)] font-medium tabular-nums">
                      Peak score {bestUpcoming?.score ?? liveEval.score}/100 •{' '}
                      {bestUpcoming?.nakshatraName}
                    </div>
                  </div>

                  <div className="obs-panel p-3.5 space-y-1.5">
                    <div className="text-xs text-[var(--text-secondary)]">Active Life Period</div>
                    <div className="text-lg font-bold text-[var(--text)]">
                      {vedicReport.activeMahadasha.lord} – {vedicReport.activeAntardasha.lord}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] tabular-nums">
                      Peak SAV: House {topSavHouse.house} ({topSavHouse.bindus} bindus)
                    </div>
                  </div>
                </div>

                {/* Visual 10-Day Trend Line Chart (Passes Hover Test) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--text)]">
                        10-Day Electional Favorability Forecast — {liveEval.action.title}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        Computed across Nakshatra nature, Tithi group, Vara, Panchaka &amp; personal
                        Tarabala
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                      className="text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                    >
                      All 20 actions →
                    </button>
                  </div>

                  <ScoreTrendChart
                    points={forecastPoints}
                    benchmarkValue={70}
                    benchmarkLabel="70+ Optimal window"
                    selectedId={forecastPoints[0]?.id}
                    onSelectPoint={() =>
                      onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })
                    }
                    ariaLabel={`10-day timing score forecast for ${liveEval.action.title}`}
                  />
                </div>

                {/* Concise Action Takeaway */}
                <div className="obs-panel p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="text-xs font-semibold text-[var(--text)]">
                      {liveEval.headlineVerdict}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {liveEval.whatHappensIfDoneNow}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="btn-editorial-secondary py-1.5 px-3 text-xs min-h-[34px]"
                  >
                    Inspect Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== TODAY'S LOCAL SKY SNAPSHOT (4 KPI CARDS MAX) ==================== */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)]/60 py-12">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                  Today’s Sky at a Glance — {profile.location.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {panchangReport.bikramSambat.formatted} • {panchangReport.vara.name} • Sunrise{' '}
                  {panchangReport.sunriseTime} – Sunset {panchangReport.sunsetTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'PANCHANG' })}
                className="text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Daily Panchang &amp; Choghadiya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiStatCard
                label="Transit Nakshatra"
                value={panchangReport.nakshatra.name}
                subvalue={`Pada ${panchangReport.nakshatra.pada}`}
                benchmarkText={`${panchangReport.nakshatra.hoursRemaining} left`}
                status={{
                  tone: 'info',
                  label: panchangReport.nakshatra.natureGroup.split(' ')[0],
                }}
                icon={<Sparkles className="w-4 h-4" />}
                actionLabel="Read Nakshatra profile"
                onAction={() =>
                  onNavigate('NAKSHATRAS', { nakIdx: panchangReport.nakshatra.zeroIndex })
                }
              />

              <KpiStatCard
                label="Lunar Tithi & Paksha"
                value={panchangReport.tithi.name}
                benchmarkText={`${panchangReport.tithi.progressPercent}% elapsed`}
                status={{
                  tone: panchangReport.tithi.isRikta ? 'mixed' : 'favorable',
                  label: panchangReport.tithi.isRikta
                    ? 'Rikta (Caution)'
                    : panchangReport.tithi.paksha.split(' ')[0],
                }}
                icon={<Calendar className="w-4 h-4" />}
                actionLabel="View Muhurat timeline"
                onAction={() => onNavigate('OBSERVATORY', { studioTab: 'PANCHANG' })}
              />

              <KpiStatCard
                label="Personal Tarabala"
                value={`Tara #${panchangReport.personalTarabala.taraNumber}`}
                subvalue={panchangReport.personalTarabala.taraName.split(' ')[0]}
                benchmarkText={`Moon in House ${panchangReport.personalTarabala.chandrabalaHouse}`}
                status={{
                  tone: panchangReport.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                  label: panchangReport.personalTarabala.isAuspicious
                    ? 'Supportive'
                    : 'Use Parihara',
                }}
                icon={<Compass className="w-4 h-4" />}
                actionLabel="Test an action today"
                onAction={() => onNavigate('WHAT_HAPPENS_IF')}
              />

              <KpiStatCard
                label="Personal Year & Life Path"
                value={`Year ${numerologyReport.personalYear.final}`}
                subvalue={`LP #${numerologyReport.lifePath.final}`}
                benchmarkText={`Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`}
                status={{ tone: 'info', label: numerologyReport.system }}
                actionLabel="Open 25-year ColorChart"
                onAction={() => onNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' })}
              />
            </div>
          </div>
        </section>

        {/* ==================== 4-MODULE CAPABILITIES BENTO GRID ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
              Built around the decisions you actually make
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Every module surfaces high-signal metrics and visual charts first, while keeping full
              classical treatises, sutras, and tables one click away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: <Scale className="w-5 h-5 text-[var(--accent)]" />,
                badge: '20 Life Actions',
                title: 'Muhurta Action & Consequence Planner',
                desc: 'Test lending, contracts, debt repayment, marriage, surgery, property, or travel against any date—with 12-day optimal score curves and behavioral Karma-Vipaka.',
                cta: 'Open Action Timing',
                onClick: () => onNavigate('WHAT_HAPPENS_IF'),
              },
              {
                icon: <Compass className="w-5 h-5 text-[var(--accent)]" />,
                badge: '10 Vargas + 337 Bindus',
                title: 'Natal Ephemeris, Vedic Kundali & KP',
                desc: 'Interactive ecliptic wheel, ±120m rectification, 10 Shodashvarga charts, 12-house Sarvashtakavarga benchmark bars, Jaimini Karakas, and KP 1–249 Horary.',
                cta: 'Explore Charts & SAV',
                onClick: () => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' }),
              },
              {
                icon: <Globe className="w-5 h-5 text-[var(--accent)]" />,
                badge: '48 Planetary Lines',
                title: 'World Astrocartography & Compatibility',
                desc: 'Rank global and Himalayan cities for Career, Home Sanctuary, and Love across MC/IC/ASC/DSC lines, paired with 36-Guna Ashtakoota matchmaking.',
                cta: 'Open World Relocation Map',
                onClick: () => onNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
              },
              {
                icon: <BookOpen className="w-5 h-5 text-[var(--accent)]" />,
                badge: '28 Stars & 9 Books',
                title: '28 Nakshatras & Classical Source Library',
                desc: 'Clean master-detail reference for all 28 lunar mansions, 108 Navamsha Padas, 360° Sabian symbols, 108 Planet-in-House rulings, and 9 foundational texts.',
                cta: 'Browse Nakshatras & Library',
                onClick: () => onNavigate('NAKSHATRAS'),
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={card.onClick}
                className="obs-card p-6 hover:border-[var(--accent)] transition cursor-pointer flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center">
                      {card.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-secondary)]">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5">
                  <span>{card.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ==================== CLEAN MINIMAL FOOTER ==================== */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 px-4 sm:px-8 text-xs text-[var(--text-muted)]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text)]">Oceanology</span>
            <span>•</span>
            <span>Client-side Astronomical Ephemeris, Jyotish &amp; Decision Timing</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => onNavigate('OBSERVATORY')}
              className="hover:text-[var(--text)]"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('WHAT_HAPPENS_IF')}
              className="hover:text-[var(--text)]"
            >
              Action Timing
            </button>
            <button
              type="button"
              onClick={() => onNavigate('NAKSHATRAS')}
              className="hover:text-[var(--text)]"
            >
              28 Nakshatras
            </button>
            <button
              type="button"
              onClick={() => onNavigate('CANON')}
              className="hover:text-[var(--text)]"
            >
              Classical Texts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
