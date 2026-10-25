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
  Activity,
  Download,
  FileText,
  Type,
  Clock,
} from 'lucide-react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { cleanCityName, NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';
import { evaluateActionConsequence, scanUpcomingBestWindows } from '../data/karmaAndMuhurtaCodex';
import { HOUSE_PLAIN_GUIDE } from '../data/plainEnglishGuide';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { KpiStatCard, ScoreTrendChart, StatusBadge } from './ui/DashboardPrimitives';
import {
  BloomingLotusMandala,
  CornerLotusDecor,
  LotusVineDivider,
  SacredFlowerIcon,
} from './ui/FloralAnimations';

export type WebsiteDestination =
  | 'HOME'
  | 'FULL_REPORT'
  | 'HORAI'
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
  largeText?: boolean;
  onToggleLargeText?: () => void;
  floralMotion?: boolean;
  onToggleFloralMotion?: () => void;
  onDownloadPdf?: () => Promise<void>;
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
  largeText = false,
  onToggleLargeText,
  floralMotion = true,
  onToggleFloralMotion,
  onDownloadPdf,
  onNavigate,
}) => {
  const [previewActionId, setPreviewActionId] = useState<string>('SIGN_CONTRACT');
  const [showCitySearch, setShowCitySearch] = useState<boolean>(false);
  const [pdfDownloading, setPdfDownloading] = useState<boolean>(false);

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

  const cityDisplay = useMemo(
    () => cleanCityName(profile.location.name),
    [profile.location.name]
  );

  const handleQuickPdf = async () => {
    if (!onDownloadPdf) {
      onNavigate('FULL_REPORT');
      return;
    }
    try {
      setPdfDownloading(true);
      await onDownloadPdf();
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text)] relative z-10">
      {/* ==================== UNIFIED PRODUCT NAVBAR ==================== */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-sm shrink-0">
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#FDE68A"
                  secondaryHex="#FFFFFF"
                  size={21}
                  animated={floralMotion}
                />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-[var(--text)] whitespace-nowrap">
                Oceanology
              </span>
            </button>

            <nav
              aria-label="Primary sections"
              className="hidden xl:flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]"
            >
              <button
                type="button"
                onClick={() => onNavigate('FULL_REPORT')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                Personal Report
              </button>
              <button
                type="button"
                onClick={() => onNavigate('HORAI')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                Horai Clock
              </button>
              <button
                type="button"
                onClick={() => onNavigate('WHAT_HAPPENS_IF')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                Best Dates
              </button>
              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' })}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                Kundali &amp; Charts
              </button>
              <button
                type="button"
                onClick={() => onNavigate('NAKSHATRAS')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                28 Birth Stars
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleFloralMotion && (
              <button
                type="button"
                onClick={onToggleFloralMotion}
                aria-label="Toggle sacred flower animations"
                title="Toggle ambient sacred flower animations"
                className={`ui-toolbar-btn ${floralMotion ? 'ui-toolbar-btn-active' : ''}`}
              >
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#EC4899"
                  secondaryHex="#FBCFE8"
                  size={16}
                  animated={floralMotion}
                />
                <span className="hidden md:inline">Bloom</span>
              </button>
            )}

            {onToggleLargeText && (
              <button
                type="button"
                onClick={onToggleLargeText}
                aria-label="Toggle larger reading text"
                title="Switch between Standard and Large comfortable reading text"
                className={`ui-toolbar-btn ${largeText ? 'ui-toolbar-btn-active' : ''}`}
              >
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">{largeText ? 'Large' : 'Aa'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle color theme"
              title="Switch light and dark theme"
              className="ui-toolbar-icon-btn"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('FULL_REPORT')}
              className="ui-toolbar-cta"
            >
              <span>Read Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LIVE HORAI & SACRED TIME TICKER RIBBON */}
        <div className="border-t border-[var(--border)] floral-banner-glow">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm tabular-nums">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <SacredFlowerIcon
                  variety={panchangReport.activeHorai.sacredFlower.variety}
                  primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                  secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                  size={17}
                  animated={floralMotion}
                />
                <span>
                  Live in {cityDisplay}:{' '}
                  <strong className="font-bold">{panchangReport.activeHorai.horaiName}</strong> (
                  {panchangReport.activeHorai.lord})
                </span>
              </span>
              <StatusBadge
                tone={panchangReport.activeHorai.tone}
                label={`${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining}m left)`}
              />
              <span className="hidden lg:inline text-[var(--text-secondary)]">
                • Gowri: <strong className="text-[var(--text)]">{panchangReport.activeGowri.name}</strong> •
                Nalla Neram:{' '}
                <strong className="text-[var(--text)] tabular-nums">
                  {panchangReport.nallaNeram[0].startTime}–{panchangReport.nallaNeram[0].endTime}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('HORAI')}
              className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Open 24-Petal Horai Clock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ==================== 5-SECOND TEST SPLIT HERO ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-16 lg:pt-12 lg:pb-18 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start animate-bloom-in">
            {/* Left (5 cols): Clear Value Prop + Instant Birth Profile & PDF Launcher */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-bg)] text-[var(--accent)] text-xs sm:text-sm font-semibold border border-[var(--accent)]/20">
                  <SacredFlowerIcon
                    variety="marigold"
                    primaryHex="#F59E0B"
                    secondaryHex="#FDE68A"
                    size={17}
                    animated={floralMotion}
                  />
                  <span>Plain-English Readings • Live Horai Clock • Full PDF Report</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[var(--text)] leading-[1.16] tracking-tight">
                  Understand your birth chart clearly—and know your best hours &amp; days to act.
                </h1>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  Enter your birth details below to read a clear, plain-English personal horoscope,
                  track live <strong className="text-[var(--text)]">Horai &amp; Gowri</strong>{' '}
                  planetary hours, or download your detailed multi-page{' '}
                  <strong className="text-[var(--text)]">PDF Kundali &amp; Life Report</strong>.
                </p>
              </div>

              {/* Clean Birth Profile Launcher Card */}
              <div className="obs-card p-6 space-y-4 relative overflow-hidden group">
                <CornerLotusDecor primaryHex="#EC4899" secondaryHex="#FDE68A" />
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span className="text-base font-bold text-[var(--text)]">
                    Enter Birth Details
                  </span>
                  <span className="text-sm text-[var(--accent)] font-semibold">
                    {natalChart.ascendant.signName} Rising • {moonPlanet.nakshatraName} Star
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
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
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
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
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
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
                        className="obs-input tabular-nums font-medium px-2.5"
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
                        className="obs-input tabular-nums font-medium px-2.5"
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
                        className="obs-input tabular-nums font-medium px-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
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
                        className="obs-input tabular-nums font-medium"
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
                        className="obs-input tabular-nums font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Clean Location Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] font-medium inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span>
                        {cityDisplay}, {profile.location.country}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCitySearch(!showCitySearch)}
                      className="text-[var(--accent)] font-semibold hover:underline"
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
                            className={`ui-chip ${active ? 'ui-chip-active' : ''}`}
                          >
                            {cleanCityName(city.name)}
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

                {/* Primary Actions: Easy Report + Direct PDF Download */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('FULL_REPORT')}
                    className="w-full btn-editorial-primary flex items-center justify-center gap-2 text-base"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Read My Easy Personal Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={pdfDownloading}
                      onClick={handleQuickPdf}
                      className="btn-editorial-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                    >
                      <Download className="w-4 h-4 text-[var(--accent)]" />
                      <span>{pdfDownloading ? 'Building PDF…' : 'Download Detailed PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                      className="btn-editorial-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Compass className="w-4 h-4 text-[var(--accent)]" />
                      <span>Interactive Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right (7 cols): Live Interactive Decision & Forecast Preview Window */}
            <div className="lg:col-span-7 obs-card overflow-hidden">
              {/* Window Top Context Strip */}
              <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="text-sm font-bold text-[var(--text)]">
                    Should You Do It Today? — {cityDisplay}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {HERO_PREVIEW_ACTIONS.map((act) => {
                    const active = act.id === previewActionId;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setPreviewActionId(act.id)}
                        className={`ui-chip ${
                          active ? 'ui-chip-active bg-[var(--surface)] shadow-xs' : 'bg-[var(--surface)]/65'
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                      Today’s Score
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xl font-bold tabular-nums text-[var(--text)]">
                        {liveEval.score}
                        <span className="text-sm font-normal text-[var(--text-muted)]">/100</span>
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
                            ? 'Good Day'
                            : liveEval.score >= 48
                            ? 'Mixed'
                            : 'Wait'
                        }
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                      70+ is an ideal green-light day
                    </div>
                  </div>

                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                      Best Day in Next 10 Days
                    </div>
                    <div className="text-xl font-bold text-[var(--text)] tabular-nums">
                      {bestUpcoming?.dateStr || panchangReport.dateStr}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--sage)] font-semibold tabular-nums">
                      Score {bestUpcoming?.score ?? liveEval.score}/100 ({bestUpcoming?.nakshatraName})
                    </div>
                  </div>

                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                      Your Strongest Life Area
                    </div>
                    <div className="text-lg font-bold text-[var(--text)] leading-snug">
                      {HOUSE_PLAIN_GUIDE[topSavHouse.house]?.shortTitle || `House ${topSavHouse.house}`}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-muted)] tabular-nums">
                      House {topSavHouse.house} ({topSavHouse.bindus} pts vs 28 avg)
                    </div>
                  </div>
                </div>

                {/* Visual 10-Day Trend Line Chart */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--text)]">
                        10-Day Timing Forecast — {liveEval.action.title}
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        Green dots (70+) show the easiest, most supportive days to act
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                      className="text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                    >
                      Test all 20 life decisions →
                    </button>
                  </div>

                  <ScoreTrendChart
                    points={forecastPoints}
                    benchmarkValue={70}
                    benchmarkLabel="70+ Best Days"
                    selectedId={forecastPoints[0]?.id}
                    onSelectPoint={() =>
                      onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })
                    }
                    ariaLabel={`10-day timing score forecast for ${liveEval.action.title}`}
                  />
                </div>

                {/* Plain-English Action Takeaway */}
                <div className="obs-panel p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="text-sm font-bold text-[var(--text)]">
                      {liveEval.headlineVerdict}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {liveEval.whatHappensIfDoneNow}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="btn-editorial-secondary text-sm shrink-0"
                  >
                    See Full Explanation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LotusVineDivider label="Live Sky, Horai Planetary Hours & Sacred Time" />

        {/* ==================== TODAY'S LOCAL SKY SNAPSHOT ==================== */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)]/75 backdrop-blur-sm py-14">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Today’s Sky &amp; Horai in Plain English — {cityDisplay}
                </h2>
                <p className="text-base text-[var(--text-secondary)] tabular-nums">
                  Nepali Date: {panchangReport.bikramSambat.formatted} • {panchangReport.vara.name} •
                  Sunrise {panchangReport.sunriseTime} – Sunset {panchangReport.sunsetTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('HORAI')}
                className="text-base font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
              >
                <span>Open 24-Petal Horai Flower Clock &amp; Gowri</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiStatCard
                label="Active Horai Right Now"
                value={panchangReport.activeHorai.horaiName}
                subvalue={panchangReport.activeHorai.lord}
                plainHint={`Gowri: ${panchangReport.activeGowri.name} • Nalla Neram ${panchangReport.nallaNeram[0].startTime}–${panchangReport.nallaNeram[0].endTime}`}
                benchmarkText={`${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining}m left)`}
                status={{
                  tone: panchangReport.activeHorai.tone,
                  label: panchangReport.activeHorai.quality,
                }}
                icon={
                  <SacredFlowerIcon
                    variety={panchangReport.activeHorai.sacredFlower.variety}
                    primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                    secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                    size={18}
                  />
                }
                actionLabel="Open 24h Horai Clock"
                onAction={() => onNavigate('HORAI')}
              />

              <KpiStatCard
                label="Today’s Moon Star (Nakshatra)"
                value={panchangReport.nakshatra.name}
                subvalue={`Pada ${panchangReport.nakshatra.pada}`}
                plainHint={`Sets today’s overall mood: ${panchangReport.nakshatra.natureGroup}`}
                benchmarkText={`${panchangReport.nakshatra.hoursRemaining} left`}
                status={{
                  tone: 'info',
                  label: panchangReport.nakshatra.natureGroup.split(' ')[0],
                }}
                icon={<Sparkles className="w-4 h-4" />}
                actionLabel="Read about this star"
                onAction={() =>
                  onNavigate('NAKSHATRAS', { nakIdx: panchangReport.nakshatra.zeroIndex })
                }
              />

              <KpiStatCard
                label="Personal Star Harmony (Tarabala)"
                value={
                  panchangReport.personalTarabala.isAuspicious ? 'Supportive' : 'Pace Carefully'
                }
                plainHint={`How today’s Moon aligns with your Birth Star (${moonPlanet.nakshatraName})`}
                benchmarkText={`Moon in House ${panchangReport.personalTarabala.chandrabalaHouse}`}
                status={{
                  tone: panchangReport.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                  label: panchangReport.personalTarabala.taraName.split(' ')[0],
                }}
                icon={<Compass className="w-4 h-4" />}
                actionLabel="Check a decision today"
                onAction={() => onNavigate('WHAT_HAPPENS_IF')}
              />

              <KpiStatCard
                label="Your Personal Year & Life Path"
                value={`Year ${numerologyReport.personalYear.final}`}
                subvalue={`Life Path #${numerologyReport.lifePath.final}`}
                plainHint={numerologyReport.personalYear.meaning.split('.')[0]}
                benchmarkText={`Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`}
                status={{ tone: 'info', label: numerologyReport.system }}
                actionLabel="Open 25-year forecast"
                onAction={() => onNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' })}
              />
            </div>
          </div>
        </section>

        {/* ==================== CAPABILITIES BENTO GRID WITH FLORAL BLOOMS ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
              Easy to read, lively to explore—with full sacred timing depth
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              Start with your plain-English personal reading, live 24-petal Horai flower clock, and
              downloadable PDF report, or dive into any specialized chart below.
            </p>
          </div>

          {/* Featured Full-Width Horai & Sacred Clock Floral Card */}
          <div
            onClick={() => onNavigate('HORAI')}
            className="obs-card floral-banner-glow p-6 sm:p-8 hover:border-[var(--accent)] transition cursor-pointer relative overflow-hidden group flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="pointer-events-none absolute -right-16 -bottom-24 opacity-35 dark:opacity-45">
              <BloomingLotusMandala size={290} />
            </div>
            <CornerLotusDecor primaryHex="#F59E0B" secondaryHex="#FBCFE8" />
            <div className="space-y-2.5 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--accent)]">
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#EC4899"
                  secondaryHex="#FDE68A"
                  size={16}
                />
                <span>NEW • 24-HOUR GRAHA HORAI, GOWRI PANCHANGAM &amp; NALLA NERAM</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                Interactive 24-Petal Horai Sacred Flower Clock
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                Track every planetary hour from Sunrise to Sunrise—<strong>Sukra</strong>,{' '}
                <strong>Guru</strong>, <strong>Budha</strong>, <strong>Chandra</strong>,{' '}
                <strong>Suriya</strong>, <strong>Sevvai</strong> &amp; <strong>Sani Horai</strong>—plus
                8-fold Day &amp; Night <strong>Gowri Panchangam</strong>, Morning/Evening{' '}
                <strong>Nalla Neram</strong>, <strong>Rahu Kalam</strong>, and sacred planetary flowers.
              </p>
            </div>
            <div className="shrink-0 relative z-10">
              <span className="btn-editorial-primary inline-flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Explore Live Horai Clock</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: <FileText className="w-5 h-5 text-[var(--accent)]" />,
                flowerHex: '#EC4899',
                badge: 'Plain-English + PDF',
                title: 'Full Personal Reading & Printable PDF Report',
                desc: 'Read your complete horoscope in clear, everyday language—covering personality, current life chapter, 12 life areas, D1/D9 Kundali charts, Horai windows, and best upcoming dates—and save it as a multi-page PDF.',
                cta: 'Open Easy Report & PDF',
                onClick: () => onNavigate('FULL_REPORT'),
              },
              {
                icon: <Scale className="w-5 h-5 text-[var(--accent)]" />,
                flowerHex: '#F59E0B',
                badge: '20 Life Decisions + Horai',
                title: 'Best Days & Horai Hours to Sign, Invest, Marry or Travel',
                desc: 'Check whether today is favorable for contracts, loans, debt repayment, marriage, property, or medical care—paired with exact daily Horai planetary hours and 12-day forecasts.',
                cta: 'Check Best Dates & Horais',
                onClick: () => onNavigate('WHAT_HAPPENS_IF'),
              },
              {
                icon: <Globe className="w-5 h-5 text-[var(--accent)]" />,
                flowerHex: '#10B981',
                badge: 'World Map + Matchmaking',
                title: 'Best Cities for You & Relationship Compatibility',
                desc: 'Discover which cities worldwide support your career, peace of mind, and relationships, plus check 36-point Vedic marriage compatibility with a partner.',
                cta: 'Explore World Map & Compatibility',
                onClick: () => onNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
              },
              {
                icon: <BookOpen className="w-5 h-5 text-[var(--accent)]" />,
                flowerHex: '#6366F1',
                badge: '28 Stars & 9 Classics',
                title: '28 Birth Stars (Nakshatras) & Classical Library',
                desc: 'Explore readable guides to all 28 Vedic birth stars, 108 quarters (Padas), and personalized readings from 9 foundational astrology texts.',
                cta: 'Browse Birth Stars & Books',
                onClick: () => onNavigate('NAKSHATRAS'),
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={card.onClick}
                className="obs-card p-6 sm:p-7 hover:border-[var(--accent)] transition cursor-pointer flex flex-col justify-between gap-5 group relative overflow-hidden"
              >
                <CornerLotusDecor primaryHex={card.flowerHex} secondaryHex="#FDE68A" />
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center">
                      {card.icon}
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-secondary)]">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                    {card.title}
                  </h3>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 relative z-10">
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ==================== CLEAN MINIMAL FOOTER ==================== */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/95 py-8 px-4 sm:px-8 text-sm text-[var(--text-muted)]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SacredFlowerIcon variety="lotus" primaryHex="#EC4899" secondaryHex="#FDE68A" size={18} />
            <span className="font-bold text-[var(--text)]">Oceanology</span>
            <span>•</span>
            <span>Easy-to-Read Horoscope, Live Horai Clock &amp; Printable PDF Reports</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-medium">
            <button
              type="button"
              onClick={() => onNavigate('FULL_REPORT')}
              className="text-[var(--accent)] hover:underline"
            >
              Full Report &amp; PDF
            </button>
            <button
              type="button"
              onClick={() => onNavigate('HORAI')}
              className="hover:text-[var(--text)]"
            >
              Live Horai Clock
            </button>
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
              Best Dates
            </button>
            <button
              type="button"
              onClick={() => onNavigate('NAKSHATRAS')}
              className="hover:text-[var(--text)]"
            >
              28 Birth Stars
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
