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
  Clock,
} from 'lucide-react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';
import { evaluateActionConsequence, scanUpcomingBestWindows } from '../data/karmaAndMuhurtaCodex';
import {
  formatCityForLang,
  formatCountryForLang,
  formatDisplayDate,
  LanguageSwitchButton,
  shortNakshatraLabel,
  trActionDynamicOutcome,
  trActionShort,
  trActionTitle,
  trGowriName,
  trHoraiDisplay,
  trHouseGuide,
  trHoursRemaining,
  trNakNature,
  trNakshatra,
  trPlanet,
  trSign,
  trTaraName,
  trVara,
  useLanguage,
} from '../i18n/i18n';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { KpiStatCard, ScoreTrendChart, StatusBadge } from './ui/DashboardPrimitives';
import { LotusVineDivider, SacredFlowerIcon } from './ui/FloralAnimations';

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
  const { lang, t } = useLanguage();
  const [previewActionId, setPreviewActionId] = useState<string>('SIGN_CONTRACT');
  const [showCitySearch, setShowCitySearch] = useState<boolean>(false);
  const [pdfDownloading, setPdfDownloading] = useState<boolean>(false);

  const sunPlanet = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
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
    const now = new Date();
    return Array.from({ length: 10 }).map((_, idx) => {
      if (idx === 0) {
        return {
          id: now.toISOString().slice(0, 10),
          label: lang === 'ne' ? 'आज' : 'Today',
          sublabel: shortNakshatraLabel(liveEval.panchang.nakshatra.name, lang),
          value: liveEval.score,
        };
      }
      const d = new Date(now.getTime() + idx * 86400000);
      d.setHours(10, 30, 0, 0);
      const rep = evaluateActionConsequence(
        previewActionId,
        d,
        profile.location,
        moonPlanet.nakshatraIndex,
        moonPlanet.signIndex
      );
      const dayIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const dateStr = formatDisplayDate(dayIso, lang, false, true);
      return {
        id: dayIso,
        label: dateStr,
        sublabel: shortNakshatraLabel(rep.panchang.nakshatra.name, lang),
        value: rep.score,
      };
    });
  }, [
    previewActionId,
    profile.location,
    moonPlanet.nakshatraIndex,
    moonPlanet.signIndex,
    liveEval,
    lang,
  ]);

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

  // Exactly 4 balanced cities so the preset grid sits on one clean row without orphan wrapping
  const quickCities = useMemo(() => {
    const wanted = ['Kathmandu', 'Pokhara', 'Varanasi', 'New York'];
    return NEPAL_AND_GLOBAL_CITIES.filter((c) =>
      wanted.some((w) => c.name.toLowerCase().includes(w.toLowerCase()))
    ).slice(0, 4);
  }, []);

  const topSavHouse = useMemo(() => {
    return [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0];
  }, [vedicReport.sarvashtakavarga]);

  const cityDisplay = useMemo(
    () => formatCityForLang(profile.location.name, lang),
    [profile.location.name, lang]
  );
  const countryDisplay = useMemo(
    () => formatCountryForLang(profile.location.country, lang),
    [profile.location.country, lang]
  );
  const activeHoraiDisp = useMemo(
    () => trHoraiDisplay(panchangReport.activeHorai, lang),
    [panchangReport.activeHorai, lang]
  );
  const liveOutcomeDisp = useMemo(
    () =>
      trActionDynamicOutcome(
        liveEval.score,
        liveEval.action,
        liveEval.panchang.nakshatra.name,
        liveEval.headlineVerdict,
        liveEval.whatHappensIfDoneNow,
        lang
      ),
    [liveEval, lang]
  );

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const birthDateIso = `${String(profile.year).padStart(4, '0')}-${pad2(profile.month)}-${pad2(
    profile.day
  )}`;
  const birthTimeIso = `${pad2(profile.hour)}:${pad2(profile.minute)}`;

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

  const horaiDotClasses =
    panchangReport.activeHorai.tone === 'optimal' ||
    panchangReport.activeHorai.tone === 'favorable'
      ? { ping: 'bg-emerald-400', dot: 'bg-emerald-500' }
      : panchangReport.activeHorai.tone === 'avoid'
      ? { ping: 'bg-rose-400', dot: 'bg-rose-500' }
      : { ping: 'bg-amber-400', dot: 'bg-amber-500' };

  const topHouseShort = trHouseGuide(topSavHouse.house, lang)
    .shortTitle.split(',')[0]
    .trim();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text)] relative z-10">
      {/* ==================== UNIFIED PRODUCT HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-3.5 sm:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 sm:gap-2.5 text-left shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-sm shrink-0">
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#FDE68A"
                  secondaryHex="#FFFFFF"
                  size={20}
                  animated={floralMotion}
                />
              </div>
              <span className="font-display font-bold text-sm sm:text-lg tracking-tight text-[var(--text)] whitespace-nowrap">
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
                {t('Personal Report', 'व्यक्तिगत रिपोर्ट')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('HORAI')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                {t('Horai Clock', 'होरा घडी')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('WHAT_HAPPENS_IF')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                {t('Best Dates', 'शुभ साइत')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' })}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                {t('Kundali & Charts', 'कुण्डली र चार्ट')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('NAKSHATRAS')}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
              >
                {t('28 Birth Stars', '२८ नक्षत्र')}
              </button>
            </nav>
          </div>

          {/* Right Global Controls — 100% Identical to Workspace Topbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitchButton />

            {onToggleFloralMotion && (
              <button
                type="button"
                onClick={onToggleFloralMotion}
                aria-label="Toggle sacred flower animations"
                title={t('Toggle flower animations', 'पुष्प एनिमेसन अन/अफ')}
                className={`hidden md:inline-flex ui-toolbar-icon-btn ${
                  floralMotion ? 'ui-toolbar-btn-active' : ''
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {onToggleLargeText && (
              <button
                type="button"
                onClick={onToggleLargeText}
                aria-label="Toggle larger reading text"
                title={t('Toggle larger reading text', 'ठूलो अक्षर आकार')}
                className={`hidden sm:inline-flex ui-toolbar-btn px-2.5 ${
                  largeText ? 'ui-toolbar-btn-active' : ''
                }`}
              >
                <span>{largeText ? t('Aa+', 'ठूलो') : 'Aa'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle color theme"
              title={t('Switch light and dark theme', 'उज्यालो / अँध्यारो मोड')}
              className="ui-toolbar-icon-btn"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('FULL_REPORT')}
              className="ui-toolbar-cta px-2.5 sm:px-3.5"
            >
              <span className="hidden sm:inline">{t('Read Report', 'रिपोर्ट पढ्नुहोस्')}</span>
              <span className="sm:hidden">{t('Report', 'रिपोर्ट')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LIVE HORAI STATUS BAR — Harmonized Slate Surface & Matched Status Dot */}
        <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)]/65">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px] tabular-nums">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 font-semibold text-[var(--text)]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${horaiDotClasses.ping}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${horaiDotClasses.dot}`}
                  />
                </span>
                <span>
                  {t(`Live in ${cityDisplay}:`, `${cityDisplay} मा प्रत्यक्ष समय:`)}{' '}
                  <strong className="font-bold">
                    {lang === 'ne'
                      ? `${activeHoraiDisp.horaiName} (${activeHoraiDisp.lordLabel})`
                      : `${activeHoraiDisp.lordLabel} Hora (${activeHoraiDisp.horaiName})`}
                  </strong>
                </span>
              </span>
              <StatusBadge
                tone={panchangReport.activeHorai.tone}
                label={t(
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining}m left)`,
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining} मिनेट बाँकी)`
                )}
              />
              <span className="hidden lg:inline text-[var(--text-secondary)]">
                •{' '}
                {t('Best Morning Window:', 'आजको शुभ अमृत वेला:')}{' '}
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
              <span>{t('Open 24-Hour Horai Clock', '२४-पत्रे होरा कमल घडी खोल्नुहोस्')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ==================== BALANCED, ALIGNED HERO SECTION ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 pb-14 lg:pt-7 lg:pb-16">
          {/* Unified Hero Lead Header */}
          <div className="max-w-4xl space-y-2 mb-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 obs-badge-brass text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t(
                  'Plain-English Horoscope • Live 24-Hour Horai • Printable PDF Dossier',
                  'सरल नेपाली फलादेश • प्रत्यक्ष २४-घण्टा होरा घडी • प्रिन्टयोग्य PDF रिपोर्ट'
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[var(--text)] leading-[1.18] tracking-tight">
              {t(
                'Understand your birth chart clearly—and know your best hours & days to act.',
                'आफ्नो जन्म कुण्डली सरल भाषामा बुझ्नुहोस् र हरेक कामको सर्वोत्तम शुभ समय थाहा पाउनुहोस्।'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {t(
                'Enter your birth details to read a plain-English personal horoscope, check today’s live planetary hours, or download a multi-page PDF Kundali & life report.',
                'आफ्नो जन्म विवरण प्रविष्ट गरी सरल नेपालीमा व्यक्तिगत कुण्डली फलादेश पढ्नुहोस्, प्रत्यक्ष होरा र गौरी पञ्चाङ्ग हेर्नुहोस्, वा बहु-पृष्ठ PDF रिपोर्ट डाउनलोड गर्नुहोस्।'
              )}
            </p>
          </div>

          {/* Symmetrical 12-Column Aligned Card Grid (Identical Card Chrome & Header Strips) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT (5 cols): Birth Profile Card */}
            <div className="lg:col-span-5 obs-card overflow-hidden flex flex-col justify-between">
              <div>
                {/* Matching Card Header Strip */}
                <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 min-h-[54px]">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span className="text-sm font-bold text-[var(--text)]">
                      {t('Enter Birth Details', 'जन्म विवरण प्रविष्ट गर्नुहोस्')}
                    </span>
                  </div>
                  <StatusBadge
                    tone="info"
                    label={
                      lang === 'ne'
                        ? `${trSign(natalChart.ascendant.signName, 'ne')} लग्न • ${trNakshatra(
                            moonPlanet.nakshatraName,
                            'ne'
                          )}`
                        : `${natalChart.ascendant.signName} Rising • ${moonPlanet.nakshatraName}`
                    }
                  />
                </div>

                {/* Symmetrical 2x2 Input Grid */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="hero-first-name"
                        className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >
                        {t('First name', 'पहिलो नाम')}
                      </label>
                      <input
                        id="hero-first-name"
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
                      <label
                        htmlFor="hero-last-name"
                        className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >
                        {t('Last name', 'थर')}
                      </label>
                      <input
                        id="hero-last-name"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="hero-birth-date"
                        className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >
                        {t('Birth date', 'जन्म मिति (ई.सं.)')}
                      </label>
                      <input
                        id="hero-birth-date"
                        type="date"
                        aria-label="Birth date"
                        value={birthDateIso}
                        onChange={(e) => {
                          const [yr, mo, dy] = e.target.value
                            .split('-')
                            .map((n) => parseInt(n, 10));
                          if (yr && mo && dy) {
                            onProfileChange({ ...profile, year: yr, month: mo, day: dy });
                          }
                        }}
                        className="w-full obs-input tabular-nums font-medium"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="hero-birth-time"
                        className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >
                        {t('Birth time (24h)', 'जन्म समय (२४ घण्टा)')}
                      </label>
                      <input
                        id="hero-birth-time"
                        type="time"
                        aria-label="Birth time"
                        value={birthTimeIso}
                        onChange={(e) => {
                          const [hr, mn] = e.target.value
                            .split(':')
                            .map((n) => parseInt(n, 10));
                          if (!Number.isNaN(hr) && !Number.isNaN(mn)) {
                            onProfileChange({ ...profile, hour: hr, minute: mn });
                          }
                        }}
                        className="w-full obs-input tabular-nums font-medium"
                      />
                    </div>
                  </div>

                  {/* Clean Single-Row Location Selector (4 Balanced Presets, Zero Orphan Row) */}
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[var(--text-secondary)] font-medium inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <span>
                          {cityDisplay}, {countryDisplay}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCitySearch(!showCitySearch)}
                        className="text-[var(--accent)] font-semibold hover:underline"
                      >
                        {showCitySearch
                          ? t('Done', 'बन्द गर्नुहोस्')
                          : t('Search all cities', 'अन्य सहर खोज्नुहोस्')}
                      </button>
                    </div>

                    {!showCitySearch ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {quickCities.map((city) => {
                          const active = city.id === profile.location.id;
                          return (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => onProfileChange({ ...profile, location: city })}
                              className={`ui-chip justify-center px-2 text-xs ${
                                active ? 'ui-chip-active' : ''
                              }`}
                            >
                              <span className="truncate">
                                {formatCityForLang(city.name, lang)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <GlobalLocationPicker
                        label={t('Search global & Nepal cities', 'नेपाल र विश्वका सहर खोज्नुहोस्')}
                        value={profile.location}
                        onChange={(loc) => {
                          onProfileChange({ ...profile, location: loc });
                          setShowCitySearch(false);
                        }}
                      />
                    )}
                  </div>

                  {/* Live Instant Chart Preview (Eliminates Empty Gap & Updates Reactively) */}
                  <div className="obs-panel p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <span>{t('Instant Chart Snapshot', 'तत्काल कुण्डली झलक')}</span>
                      <span className="text-[var(--accent)] tabular-nums">
                        {t(
                          `Life Path #${numerologyReport.lifePath.final} • Personal Year #${numerologyReport.personalYear.final}`,
                          `मूलांक #${numerologyReport.lifePath.final} • व्यक्तिगत वर्ष #${numerologyReport.personalYear.final}`
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-2.5 py-2">
                        <div className="text-[11px] font-medium text-[var(--text-muted)]">
                          {t('Sun Sign', 'सूर्य राशि')}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text)] truncate mt-0.5">
                          {trSign(sunPlanet.signName, lang)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-2.5 py-2">
                        <div className="text-[11px] font-medium text-[var(--text-muted)]">
                          {t('Moon Sign', 'चन्द्र राशि')}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text)] truncate mt-0.5">
                          {trSign(moonPlanet.signName, lang)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-2.5 py-2">
                        <div className="text-[11px] font-medium text-[var(--text-muted)]">
                          {t('Active Chapter', 'हालको दशा')}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text)] truncate mt-0.5">
                          {trPlanet(vedicReport.activeMahadasha.lord, lang)}–
                          {trPlanet(vedicReport.activeAntardasha.lord, lang)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="px-5 pb-5 pt-2 space-y-2.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/60">
                <button
                  type="button"
                  onClick={() => onNavigate('FULL_REPORT')}
                  className="w-full btn-editorial-primary flex items-center justify-center gap-2 text-sm sm:text-base mt-1"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>
                    {t('Read My Easy Personal Report', 'मेरो सरल व्यक्तिगत रिपोर्ट पढ्नुहोस्')}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={pdfDownloading}
                    onClick={handleQuickPdf}
                    className="btn-editorial-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                  >
                    <Download className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span>
                      {pdfDownloading
                        ? t('Building PDF…', 'PDF बन्दैछ…')
                        : t('Download PDF', 'PDF डाउनलोड')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                    className="btn-editorial-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Compass className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span>{t('Open Dashboard', 'ड्यासबोर्ड खोल्नुहोस्')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT (7 cols): Live Decision & 10-Day Forecast Card */}
            <div className="lg:col-span-7 obs-card overflow-hidden flex flex-col justify-between">
              {/* Matching Card Header Strip with Contained Segmented Tabs */}
              <div className="px-5 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 min-h-[54px]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="text-sm font-bold text-[var(--text)]">
                    {t(
                      `Today’s Timing — ${cityDisplay}`,
                      `आजको शुभ साइत — ${cityDisplay}`
                    )}
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label="Preview life decision"
                  className="inline-flex flex-wrap gap-1 p-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] max-w-full"
                >
                  {HERO_PREVIEW_ACTIONS.map((act) => {
                    const active = act.id === previewActionId;
                    return (
                      <button
                        key={act.id}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setPreviewActionId(act.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                          active
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                        }`}
                      >
                        {trActionShort(act.id, act.label, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
                {/* 3 Uniform Mini KPI Cards (Identical 3-Row Anatomy & Badge Footer) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="obs-panel p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                      {t('Today’s Score', 'आजको मुहूर्त अंक')}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold tabular-nums text-[var(--text)] leading-none">
                      {liveEval.score}
                      <span className="text-sm font-medium text-[var(--text-muted)]">/100</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
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
                            ? t('Green Light', 'उत्तम शुभ')
                            : liveEval.score >= 48
                            ? t('Mixed', 'मिश्रित')
                            : t('Wait', 'प्रतीक्षा')
                        }
                      />
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {t('70+ ideal', '७०+ उत्तम')}
                      </span>
                    </div>
                  </div>

                  <div className="obs-panel p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                      {t('Best Day (Next 10d)', 'आगामी १० दिनको उत्तम दिन')}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text)] tabular-nums leading-none">
                      {formatDisplayDate(
                        bestUpcoming?.dateStr || panchangReport.dateStr,
                        lang,
                        false
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                      <StatusBadge
                        tone="optimal"
                        label={`${bestUpcoming?.score ?? liveEval.score}/100`}
                      />
                      <span className="text-xs text-[var(--text-muted)] truncate">
                        {shortNakshatraLabel(
                          bestUpcoming?.nakshatraName || panchangReport.nakshatra.name,
                          lang
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="obs-panel p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                      {t('Strongest Chart Area', 'सबैभन्दा बलियो भाव')}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text)] tabular-nums leading-none">
                      {t(`House ${topSavHouse.house}`, `भाव ${topSavHouse.house}`)}
                      <span className="text-sm font-medium text-[var(--text-muted)]">
                        {' '}
                        · {topSavHouse.bindus} {t('pts', 'बिन्दु')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                      <StatusBadge tone="info" label={topHouseShort} />
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {t('28 avg', 'औसत २८')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synchronized 10-Day Trend Chart */}
                <div className="space-y-1.5">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      {t('10-Day Timing Forecast', '१०-दिने शुभ समय पूर्वानुमान')} —{' '}
                      {trActionTitle(liveEval.action.id, liveEval.action.title, lang)}
                    </h2>
                  </div>

                  <ScoreTrendChart
                    points={forecastPoints}
                    benchmarkValue={70}
                    benchmarkLabel={t('70+ Best Days', '७०+ उत्तम दिन')}
                    selectedId={forecastPoints[0]?.id}
                    onSelectPoint={() =>
                      onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })
                    }
                    headerAction={
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })
                        }
                        className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>
                          {t('Test all 20 life decisions →', 'सबै २० जीवन निर्णयहरू जाँच्नुहोस् →')}
                        </span>
                      </button>
                    }
                    ariaLabel={`10-day timing score forecast for ${liveEval.action.title}`}
                  />
                </div>

                {/* Plain-Language Action Takeaway */}
                <div className="obs-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="text-sm font-bold text-[var(--text)]">
                      {liveOutcomeDisp.headline}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {liveOutcomeDisp.consequence}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="btn-editorial-secondary text-sm shrink-0"
                  >
                    {t('See Full Timing', 'पूरा विवरण')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LotusVineDivider
          label={t(
            'Live Sky, Horai Planetary Hours & Sacred Time',
            'आजको आकाश, प्रत्यक्ष ग्रह होरा र शुभ पञ्चाङ्ग समय'
          )}
        />

        {/* ==================== TODAY'S LOCAL SKY SNAPSHOT ==================== */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)] py-14">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  {t(
                    `Today’s Sky & Horai in Plain English — ${cityDisplay}`,
                    `आजको पञ्चाङ्ग र प्रत्यक्ष होरा — ${cityDisplay}`
                  )}
                </h2>
                <p className="text-base text-[var(--text-secondary)] tabular-nums">
                  {t('Nepali B.S.:', 'विक्रम संवत्:')} {panchangReport.bikramSambat.formatted} •{' '}
                  {trVara(panchangReport.vara.name, lang)} • {t('Sunrise', 'सूर्योदय')}{' '}
                  {panchangReport.sunriseTime} – {t('Sunset', 'सूर्यास्त')}{' '}
                  {panchangReport.sunsetTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('HORAI')}
                className="text-sm sm:text-base font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
              >
                <span>
                  {t(
                    'Open 24-Petal Horai Flower Clock & Gowri',
                    '२४-पत्रे होरा कमल घडी र गौरी पञ्चाङ्ग खोल्नुहोस्'
                  )}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              <KpiStatCard
                label={t('Active Horai Right Now', 'अहिले चलिरहेको ग्रह होरा')}
                value={activeHoraiDisp.horaiName}
                subvalue={activeHoraiDisp.lordLabel}
                plainHint={t(
                  `Gowri: ${panchangReport.activeGowri.name} • Best Window ${panchangReport.nallaNeram[0].startTime}–${panchangReport.nallaNeram[0].endTime}`,
                  `गौरी: ${trGowriName(
                    panchangReport.activeGowri.name,
                    'ne'
                  )} • शुभ वेला ${panchangReport.nallaNeram[0].startTime}–${
                    panchangReport.nallaNeram[0].endTime
                  }`
                )}
                benchmarkText={t(
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime}`,
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime}`
                )}
                status={{
                  tone: panchangReport.activeHorai.tone,
                  label: activeHoraiDisp.quality,
                }}
                icon={
                  <SacredFlowerIcon
                    variety={panchangReport.activeHorai.sacredFlower.variety}
                    primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                    secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                    size={18}
                  />
                }
                actionLabel={t('Open 24h Horai Clock', '२४-घण्टा होरा घडी')}
                onAction={() => onNavigate('HORAI')}
              />

              <KpiStatCard
                label={t('Today’s Moon Star (Nakshatra)', 'आजको चन्द्र नक्षत्र')}
                value={trNakshatra(panchangReport.nakshatra.name, lang)}
                subvalue={t(
                  `Pada ${panchangReport.nakshatra.pada}`,
                  `चरण ${panchangReport.nakshatra.pada}`
                )}
                plainHint={t(
                  `Sets today’s overall mood: ${panchangReport.nakshatra.natureGroup}`,
                  `आजको नक्षत्र स्वभाव: ${trNakNature(
                    panchangReport.nakshatra.natureGroup,
                    'ne',
                    false
                  )}`
                )}
                benchmarkText={trHoursRemaining(panchangReport.nakshatra.hoursRemaining, lang)}
                status={{
                  tone: 'info',
                  label: trNakNature(panchangReport.nakshatra.natureGroup, lang, true),
                }}
                icon={<Sparkles className="w-4 h-4" />}
                actionLabel={t('Read about this star', 'यस नक्षत्रबारे पढ्नुहोस्')}
                onAction={() =>
                  onNavigate('NAKSHATRAS', { nakIdx: panchangReport.nakshatra.zeroIndex })
                }
              />

              <KpiStatCard
                label={t('Personal Star Harmony (Tarabala)', 'तपाईंको व्यक्तिगत ताराबल')}
                value={
                  panchangReport.personalTarabala.isAuspicious
                    ? t('Supportive', 'अनुकूल / शुभ')
                    : t('Pace Carefully', 'धैर्यपूर्वक चल्ने')
                }
                plainHint={t(
                  `How today’s Moon aligns with your Birth Star (${moonPlanet.nakshatraName})`,
                  `तपाईंको जन्म नक्षत्र (${trNakshatra(
                    moonPlanet.nakshatraName,
                    'ne'
                  )}) सँग आजको चन्द्रमाको तालमेल`
                )}
                benchmarkText={t(
                  `Moon in House ${panchangReport.personalTarabala.chandrabalaHouse}`,
                  `चन्द्रबल भाव ${panchangReport.personalTarabala.chandrabalaHouse}`
                )}
                status={{
                  tone: panchangReport.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                  label: trTaraName(
                    panchangReport.personalTarabala.taraName.split(' ')[0],
                    lang
                  ),
                }}
                icon={<Compass className="w-4 h-4" />}
                actionLabel={t('Check a decision today', 'आजको शुभ साइत जाँच्नुहोस्')}
                onAction={() => onNavigate('WHAT_HAPPENS_IF')}
              />

              <KpiStatCard
                label={t('Your Personal Year & Life Path', 'व्यक्तिगत अंक वर्ष र मूलांक')}
                value={t(
                  `Year ${numerologyReport.personalYear.final}`,
                  `वर्ष ${numerologyReport.personalYear.final}`
                )}
                subvalue={t(
                  `Life Path #${numerologyReport.lifePath.final}`,
                  `मूलांक #${numerologyReport.lifePath.final}`
                )}
                plainHint={
                  lang === 'ne'
                    ? `व्यक्तिगत वर्ष ${numerologyReport.personalYear.final} — सक्रिय उन्नति र लक्ष्य प्राप्ति`
                    : numerologyReport.personalYear.meaning.split('.')[0]
                }
                benchmarkText={t(
                  `Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`,
                  `महिना ${numerologyReport.personalMonth.singleDigit} • दिन ${numerologyReport.personalDay.singleDigit}`
                )}
                status={{
                  tone: 'info',
                  label:
                    lang === 'ne'
                      ? numerologyReport.system === 'CHALDEAN'
                        ? 'कल्डियन'
                        : 'पाइथागोरियन'
                      : 'Pythagorean',
                }}
                actionLabel={t('Open 25-year forecast', '२५-वर्षे अंक चक्र हेर्नुहोस्')}
                onAction={() => onNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' })}
              />
            </div>
          </div>
        </section>

        {/* ==================== CLEAN CAPABILITIES BENTO GRID ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
              {t(
                'Everything in one clean workspace—from plain-English readings to sacred timing',
                'सरल व्यक्तिगत फलादेशदेखि २४-घण्टा होरा र कुण्डली विश्लेषणसम्म एउटै स्वच्छ ड्यासबोर्डमा'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {t(
                'Start with your personal reading, interactive 24-petal Horai clock, and downloadable PDF report, or open any specialized studio below.',
                'आफ्नो सरल व्यक्तिगत फलादेश, २४-पत्रे होरा कमल घडी र PDF रिपोर्टबाट सुरु गर्नुहोस् वा तलका विशेष कुण्डली र मुहूर्त उपकरणहरू खोल्नुहोस्।'
              )}
            </p>
          </div>

          {/* Featured Full-Width Horai & Sacred Clock Card */}
          <div
            onClick={() => onNavigate('HORAI')}
            className="obs-card p-6 sm:p-8 hover:border-[var(--accent)] transition cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
          >
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 obs-badge-brass text-xs font-semibold">
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#6366F1"
                  secondaryHex="#E0E7FF"
                  size={15}
                  animated={floralMotion}
                />
                <span>
                  {t(
                    '24-Hour Graha Horai • Gowri Panchangam • Nalla Neram',
                    '२४-घण्टा ग्रह होरा • गौरी पञ्चाङ्ग • शुभ नल्ल नेरम'
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                {t(
                  'Interactive 24-Petal Horai Sacred Flower Clock',
                  'अन्तर्क्रियात्मक २४-पत्रे ग्रह होरा पवित्र कमल घडी'
                )}
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ne' ? (
                  <>
                    सूर्योदयदेखि भोलिपल्ट सूर्योदयसम्मका प्रत्येक ग्रह होरा—<strong>शुक्र</strong>,{' '}
                    <strong>गुरु</strong>, <strong>बुध</strong>, <strong>चन्द्र</strong>,{' '}
                    <strong>सूर्य</strong>, <strong>मङ्गल</strong> र <strong>शनि होरा</strong>—साथै दिन/रातको
                    ८-भाग <strong>गौरी पञ्चाङ्ग</strong>, बिहान/बेलुकाको <strong>शुभ वेला (नल्ल नेरम)</strong> र{' '}
                    <strong>राहुकाल</strong> प्रत्यक्ष हेर्नुहोस्।
                  </>
                ) : (
                  <>
                    Track every planetary hour from Sunrise to Sunrise—<strong>Sukra</strong>,{' '}
                    <strong>Guru</strong>, <strong>Budha</strong>, <strong>Chandra</strong>,{' '}
                    <strong>Suriya</strong>, <strong>Sevvai</strong> &amp; <strong>Sani Horai</strong>—plus
                    8-fold Day &amp; Night <strong>Gowri Panchangam</strong>, Morning/Evening{' '}
                    <strong>Nalla Neram</strong>, and <strong>Rahu Kalam</strong>.
                  </>
                )}
              </p>
            </div>
            <div className="shrink-0">
              <span className="btn-editorial-primary inline-flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{t('Explore Live Horai Clock', 'प्रत्यक्ष होरा घडी खोल्नुहोस्')}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: <FileText className="w-5 h-5 text-[var(--accent)]" />,
                badge: t('Plain-English + PDF', 'सरल भाषा + PDF'),
                title: t(
                  'Full Personal Reading & Printable PDF Report',
                  'पूर्ण व्यक्तिगत फलादेश र प्रिन्टयोग्य PDF रिपोर्ट'
                ),
                desc: t(
                  'Read your complete horoscope in clear, everyday language—covering personality, current life chapter, 12 life areas, D1/D9 Kundali charts, Horai windows, and best upcoming dates—and save it as a multi-page PDF.',
                  'तपाईंको व्यक्तित्व, हालको महादशा अध्याय, १२ जीवन-क्षेत्र, लग्न र नवांश (D1/D9) कुण्डली, शुभ होरा र आगामी उत्तम मितिहरू सरल भाषामा पढ्नुहोस् र PDF मा सुरक्षित गर्नुहोस्।'
                ),
                cta: t('Open Easy Report & PDF', 'सरल रिपोर्ट र PDF खोल्नुहोस्'),
                onClick: () => onNavigate('FULL_REPORT'),
              },
              {
                icon: <Scale className="w-5 h-5 text-[var(--accent)]" />,
                badge: t('20 Life Decisions + Horai', '२० जीवन निर्णय + होरा'),
                title: t(
                  'Best Days & Horai Hours to Sign, Invest, Marry or Travel',
                  'सम्झौता, लगानी, विवाह वा यात्राका लागि सर्वोत्तम दिन र होरा'
                ),
                desc: t(
                  'Check whether today is favorable for contracts, loans, debt repayment, marriage, property, or medical care—paired with exact daily Horai planetary hours and 12-day forecasts.',
                  'सम्झौता हस्ताक्षर, ऋण लेनदेन, विवाह, घर-जग्गा वा औषधोपचारका लागि आजको दिन कत्तिको अनुकूल छ भन्ने कुरा दैनिक होरा र १२-दिने पूर्वानुमानसहित जाँच्नुहोस्।'
                ),
                cta: t('Check Best Dates & Horais', 'शुभ मिति र होरा जाँच्नुहोस्'),
                onClick: () => onNavigate('WHAT_HAPPENS_IF'),
              },
              {
                icon: <Globe className="w-5 h-5 text-[var(--accent)]" />,
                badge: t('World Map + Matchmaking', 'विश्व नक्सा + गुण मिलान'),
                title: t(
                  'Best Cities for You & Relationship Compatibility',
                  'तपाईंका लागि फाप्ने विश्वका सहर र ३६-गुण विवाह मिलान'
                ),
                desc: t(
                  'Discover which cities worldwide support your career, peace of mind, and relationships, plus check 36-point Vedic marriage compatibility with a partner.',
                  'विश्वका कुन सहरहरू तपाईंको करियर, धन र मानसिक शान्तिका लागि उत्तम छन् पत्ता लगाउनुहोस् र जीवनसाथीसँग ३६-गुण अष्टकूट मिलान जाँच्नुहोस्।'
                ),
                cta: t('Explore World Map & Compatibility', 'विश्व नक्सा र गुण मिलान हेर्नुहोस्'),
                onClick: () => onNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
              },
              {
                icon: <BookOpen className="w-5 h-5 text-[var(--accent)]" />,
                badge: t('28 Stars & 9 Classics', '२८ नक्षत्र र ९ शास्त्रीय ग्रन्थ'),
                title: t(
                  '28 Birth Stars (Nakshatras) & Classical Library',
                  '२८ जन्म नक्षत्र विश्वकोश र शास्त्रीय ज्योतिष पुस्तकालय'
                ),
                desc: t(
                  'Explore readable guides to all 28 Vedic birth stars, 108 quarters (Padas), and personalized readings from 9 foundational astrology texts.',
                  'सबै २८ वैदिक नक्षत्र, १०८ चरण (पाद) र बृहत् पाराशर होरा शास्त्र लगायत ९ प्राचीन ग्रन्थहरूको व्यक्तिगत व्याख्या अध्ययन गर्नुहोस्।'
                ),
                cta: t('Browse Birth Stars & Books', 'नक्षत्र र ग्रन्थहरू पढ्नुहोस्'),
                onClick: () => onNavigate('NAKSHATRAS'),
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={card.onClick}
                className="obs-card p-6 hover:border-[var(--accent)] transition cursor-pointer flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center shrink-0">
                      {card.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
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

                <div className="text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1.5">
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ==================== CLEAN MINIMAL FOOTER ==================== */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 px-4 sm:px-8 text-sm text-[var(--text-muted)]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SacredFlowerIcon
              variety="lotus"
              primaryHex="#6366F1"
              secondaryHex="#E0E7FF"
              size={18}
              animated={false}
            />
            <span className="font-bold text-[var(--text)]">Oceanology</span>
            <span>•</span>
            <span>
              {t(
                'Easy-to-Read Horoscope, Live Horai Clock & Printable PDF Reports',
                'सरल कुण्डली फलादेश, प्रत्यक्ष होरा घडी र प्रिन्टयोग्य PDF रिपोर्ट'
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-medium">
            <button
              type="button"
              onClick={() => onNavigate('FULL_REPORT')}
              className="text-[var(--accent)] hover:underline"
            >
              {t('Full Report & PDF', 'पूर्ण रिपोर्ट र PDF')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('HORAI')}
              className="hover:text-[var(--text)]"
            >
              {t('Live Horai Clock', 'प्रत्यक्ष होरा घडी')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('OBSERVATORY')}
              className="hover:text-[var(--text)]"
            >
              {t('Dashboard', 'ड्यासबोर्ड')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('WHAT_HAPPENS_IF')}
              className="hover:text-[var(--text)]"
            >
              {t('Best Dates', 'शुभ साइत')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('NAKSHATRAS')}
              className="hover:text-[var(--text)]"
            >
              {t('28 Birth Stars', '२८ नक्षत्र')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
