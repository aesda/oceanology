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
import { NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';
import { evaluateActionConsequence, scanUpcomingBestWindows } from '../data/karmaAndMuhurtaCodex';
import {
  formatCityForLang,
  formatCountryForLang,
  LanguageSwitchButton,
  trActionDynamicOutcome,
  trActionShort,
  trActionTitle,
  trGowriName,
  trHoraiDisplay,
  trHouseGuide,
  trNakshatra,
  trSign,
  trVara,
  useLanguage,
} from '../i18n/i18n';
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
  const { lang, t } = useLanguage();
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
      const nakLabel =
        lang === 'ne'
          ? trNakshatra(rep.panchang.nakshatra.name, 'ne')
          : rep.panchang.nakshatra.name.slice(0, 6);
      return {
        id: d.toISOString().slice(0, 10),
        label: idx === 0 ? (lang === 'ne' ? 'आज' : 'Today') : dateStr,
        sublabel: nakLabel,
        value: rep.score,
      };
    });
  }, [previewActionId, profile.location, moonPlanet.nakshatraIndex, moonPlanet.signIndex, lang]);

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

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitchButton />

            {onToggleFloralMotion && (
              <button
                type="button"
                onClick={onToggleFloralMotion}
                aria-label="Toggle sacred flower animations"
                title="Toggle ambient sacred flower animations"
                className={`hidden md:inline-flex ui-toolbar-btn ${floralMotion ? 'ui-toolbar-btn-active' : ''}`}
              >
                <SacredFlowerIcon
                  variety="lotus"
                  primaryHex="#EC4899"
                  secondaryHex="#FBCFE8"
                  size={16}
                  animated={floralMotion}
                />
                <span className="hidden lg:inline">{t('Bloom', 'पुष्प')}</span>
              </button>
            )}

            {onToggleLargeText && (
              <button
                type="button"
                onClick={onToggleLargeText}
                aria-label="Toggle larger reading text"
                title="Switch between Standard and Large comfortable reading text"
                className={`hidden sm:inline-flex ui-toolbar-btn ${largeText ? 'ui-toolbar-btn-active' : ''}`}
              >
                <Type className="w-4 h-4" />
                <span className="hidden lg:inline">
                  {largeText ? t('Large', 'ठूलो अक्षर') : 'Aa'}
                </span>
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
              className="ui-toolbar-cta px-2.5 sm:px-3.5"
            >
              <span className="hidden sm:inline">{t('Read Report', 'रिपोर्ट पढ्नुहोस्')}</span>
              <span className="sm:hidden">{t('Report', 'रिपोर्ट')}</span>
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
                  {t(`Live in ${cityDisplay}:`, `${cityDisplay} मा प्रत्यक्ष समय:`)}{' '}
                  <strong className="font-bold">{activeHoraiDisp.horaiName}</strong> (
                  {activeHoraiDisp.lordLabel})
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
                • {t('Gowri:', 'गौरी पञ्चाङ्ग:')}{' '}
                <strong className="text-[var(--text)]">
                  {trGowriName(panchangReport.activeGowri.name, lang)}
                </strong>{' '}
                • {t('Nalla Neram:', 'शुभ वेला (नल्ल नेरम):')}{' '}
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
              <span>{t('Open 24-Petal Horai Clock', '२४-पत्रे होरा कमल घडी खोल्नुहोस्')}</span>
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
                  <span>
                    {t(
                      'Plain-English Readings • Live Horai Clock • Full PDF Report',
                      'सरल नेपाली फलादेश • प्रत्यक्ष होरा घडी • पूर्ण PDF रिपोर्ट'
                    )}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[var(--text)] leading-[1.16] tracking-tight">
                  {t(
                    'Understand your birth chart clearly—and know your best hours & days to act.',
                    'आफ्नो जन्म कुण्डली सरल भाषामा बुझ्नुहोस् र हरेक कामको सर्वोत्तम शुभ समय थाहा पाउनुहोस्।'
                  )}
                </h1>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'ne' ? (
                    <>
                      तल आफ्नो जन्म विवरण भर्नुहोस् र सरल नेपाली भाषामा व्यक्तिगत कुण्डली फलादेश
                      पढ्नुहोस्, प्रत्यक्ष <strong className="text-[var(--text)]">होरा र गौरी पञ्चाङ्ग</strong>{' '}
                      हेर्नुहोस्, वा बहु-पृष्ठ{' '}
                      <strong className="text-[var(--text)]">PDF कुण्डली र जीवन रिपोर्ट</strong> डाउनलोड गर्नुहोस्।
                    </>
                  ) : (
                    <>
                      Enter your birth details below to read a clear, plain-English personal horoscope,
                      track live <strong className="text-[var(--text)]">Horai &amp; Gowri</strong>{' '}
                      planetary hours, or download your detailed multi-page{' '}
                      <strong className="text-[var(--text)]">PDF Kundali &amp; Life Report</strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Clean Birth Profile Launcher Card */}
              <div className="obs-card p-6 space-y-4 relative overflow-hidden group">
                <CornerLotusDecor primaryHex="#EC4899" secondaryHex="#FDE68A" />
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span className="text-base font-bold text-[var(--text)]">
                    {t('Enter Birth Details', 'जन्म विवरण प्रविष्ट गर्नुहोस्')}
                  </span>
                  <span className="text-sm text-[var(--accent)] font-semibold">
                    {lang === 'ne'
                      ? `${trSign(natalChart.ascendant.signName, 'ne')} लग्न • ${trNakshatra(moonPlanet.nakshatraName, 'ne')} नक्षत्र`
                      : `${natalChart.ascendant.signName} Rising • ${moonPlanet.nakshatraName} Star`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      {t('First name', 'पहिलो नाम')}
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
                      {t('Last name', 'थर')}
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
                      {t('Birth date (YYYY / MM / DD)', 'जन्म मिति (ई.सं. वर्ष / महिना / गते)')}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
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
                        className="col-span-2 obs-input tabular-nums font-medium px-2.5 text-center"
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
                        className="obs-input tabular-nums font-medium px-2 text-center"
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
                        className="obs-input tabular-nums font-medium px-2 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      {t('Birth time (24h HH : MM)', 'जन्म समय (२४ घण्टा HH : MM)')}
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
                        {cityDisplay}, {countryDisplay}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCitySearch(!showCitySearch)}
                      className="text-[var(--accent)] font-semibold hover:underline"
                    >
                      {showCitySearch ? t('Done', 'बन्द गर्नुहोस्') : t('Change city', 'सहर बदल्नुहोस्')}
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
                            {formatCityForLang(city.name, lang)}
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

                {/* Primary Actions: Easy Report + Direct PDF Download */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('FULL_REPORT')}
                    className="w-full btn-editorial-primary flex items-center justify-center gap-2 text-base"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('Read My Easy Personal Report', 'मेरो सरल व्यक्तिगत रिपोर्ट पढ्नुहोस्')}</span>
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
                      <span>
                        {pdfDownloading
                          ? t('Building PDF…', 'PDF बन्दैछ…')
                          : t('Download Detailed PDF', 'विस्तृत PDF डाउनलोड')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                      className="btn-editorial-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Compass className="w-4 h-4 text-[var(--accent)]" />
                      <span>{t('Interactive Dashboard', 'अन्तर्क्रियात्मक ड्यासबोर्ड')}</span>
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
                    {t(
                      `Should You Do It Today? — ${cityDisplay}`,
                      `के आज यो काम गर्नु शुभ छ? — ${cityDisplay}`
                    )}
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
                        {trActionShort(act.id, act.label, lang)}
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
                      {t('Today’s Score', 'आजको मुहूर्त अंक')}
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
                            ? t('Good Day', 'उत्तम शुभ')
                            : liveEval.score >= 48
                            ? t('Mixed', 'मिश्रित')
                            : t('Wait', 'प्रतीक्षा')
                        }
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                      {t('70+ is an ideal green-light day', '७०+ अंक सर्वोत्तम शुभ मानिन्छ')}
                    </div>
                  </div>

                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                      {t('Best Day in Next 10 Days', 'आगामी १० दिनको सर्वोत्तम दिन')}
                    </div>
                    <div className="text-xl font-bold text-[var(--text)] tabular-nums">
                      {bestUpcoming?.dateStr || panchangReport.dateStr}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--sage)] font-semibold tabular-nums">
                      {t('Score', 'अंक')} {bestUpcoming?.score ?? liveEval.score}/100 (
                      {trNakshatra(bestUpcoming?.nakshatraName || panchangReport.nakshatra.name, lang)})
                    </div>
                  </div>

                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                      {t('Your Strongest Life Area', 'तपाईंको सबैभन्दा बलियो जीवन-क्षेत्र')}
                    </div>
                    <div className="text-lg font-bold text-[var(--text)] leading-snug">
                      {trHouseGuide(topSavHouse.house, lang).shortTitle}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-muted)] tabular-nums">
                      {t(
                        `House ${topSavHouse.house} (${topSavHouse.bindus} pts vs 28 avg)`,
                        `भाव ${topSavHouse.house} (${topSavHouse.bindus} बिन्दु, औसत २८)`
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual 10-Day Trend Line Chart */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--text)]">
                        {t('10-Day Timing Forecast', '१०-दिने शुभ समय पूर्वानुमान')} —{' '}
                        {trActionTitle(liveEval.action.id, liveEval.action.title, lang)}
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        {t(
                          'Green dots (70+) show the easiest, most supportive days to act',
                          'हरियो थोप्ला (७०+) ले काम सुरु गर्न सबैभन्दा सहज र शुभ दिनहरू देखाउँछ'
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                      className="text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                    >
                      {t('Test all 20 life decisions →', 'सबै २० जीवन निर्णयहरू जाँच्नुहोस् →')}
                    </button>
                  </div>

                  <ScoreTrendChart
                    points={forecastPoints}
                    benchmarkValue={70}
                    benchmarkLabel={t('70+ Best Days', '७०+ उत्तम दिन')}
                    selectedId={forecastPoints[0]?.id}
                    onSelectPoint={() =>
                      onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })
                    }
                    ariaLabel={`10-day timing score forecast for ${liveEval.action.title}`}
                  />
                </div>

                {/* Plain-English / Nepali Action Takeaway */}
                <div className="obs-panel p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="text-sm font-bold text-[var(--text)]">
                      {liveOutcomeDisp.headline}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {liveOutcomeDisp.consequence}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="btn-editorial-secondary text-sm shrink-0"
                  >
                    {t('See Full Explanation', 'पूरा विवरण हेर्नुहोस्')}
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
        <section className="border-y border-[var(--border)] bg-[var(--surface)]/75 backdrop-blur-sm py-14">
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
                  {t('Nepali Date:', 'विक्रम संवत्:')} {panchangReport.bikramSambat.formatted} •{' '}
                  {trVara(panchangReport.vara.name, lang)} • {t('Sunrise', 'सूर्योदय')}{' '}
                  {panchangReport.sunriseTime} – {t('Sunset', 'सूर्यास्त')} {panchangReport.sunsetTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('HORAI')}
                className="text-base font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiStatCard
                label={t('Active Horai Right Now', 'अहिले चलिरहेको ग्रह होरा')}
                value={activeHoraiDisp.horaiName}
                subvalue={activeHoraiDisp.lordLabel}
                plainHint={t(
                  `Gowri: ${panchangReport.activeGowri.name} • Nalla Neram ${panchangReport.nallaNeram[0].startTime}–${panchangReport.nallaNeram[0].endTime}`,
                  `गौरी: ${trGowriName(panchangReport.activeGowri.name, 'ne')} • शुभ वेला ${panchangReport.nallaNeram[0].startTime}–${panchangReport.nallaNeram[0].endTime}`
                )}
                benchmarkText={t(
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining}m left)`,
                  `${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime} (${panchangReport.activeHorai.minutesRemaining} मि. बाँकी)`
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
                  `आजको प्रकृति समूह: ${panchangReport.nakshatra.natureGroup}`
                )}
                benchmarkText={t(
                  `${panchangReport.nakshatra.hoursRemaining} left`,
                  `बाँकी समय: ${panchangReport.nakshatra.hoursRemaining}`
                )}
                status={{
                  tone: 'info',
                  label: panchangReport.nakshatra.natureGroup.split(' ')[0],
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
                    ? t('Supportive', 'सकारात्मक र शुभ')
                    : t('Pace Carefully', 'धैर्यपूर्वक चल्ने')
                }
                plainHint={t(
                  `How today’s Moon aligns with your Birth Star (${moonPlanet.nakshatraName})`,
                  `तपाईंको जन्म नक्षत्र (${trNakshatra(moonPlanet.nakshatraName, 'ne')}) सँग आजको चन्द्रमाको तालमेल`
                )}
                benchmarkText={t(
                  `Moon in House ${panchangReport.personalTarabala.chandrabalaHouse}`,
                  `चन्द्रबल: राशिबाट ${panchangReport.personalTarabala.chandrabalaHouse}औँ भाव`
                )}
                status={{
                  tone: panchangReport.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                  label: panchangReport.personalTarabala.taraName.split(' ')[0],
                }}
                icon={<Compass className="w-4 h-4" />}
                actionLabel={t('Check a decision today', 'आजको शुभ साइत जाँच्नुहोस्')}
                onAction={() => onNavigate('WHAT_HAPPENS_IF')}
              />

              <KpiStatCard
                label={t('Your Personal Year & Life Path', 'व्यक्तिगत अंक वर्ष र मूलांक')}
                value={t(
                  `Year ${numerologyReport.personalYear.final}`,
                  `वर्ष अंक ${numerologyReport.personalYear.final}`
                )}
                subvalue={t(
                  `Life Path #${numerologyReport.lifePath.final}`,
                  `जीवन मार्ग #${numerologyReport.lifePath.final}`
                )}
                plainHint={numerologyReport.personalYear.meaning.split('.')[0]}
                benchmarkText={t(
                  `Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`,
                  `महिना ${numerologyReport.personalMonth.singleDigit} • दिन ${numerologyReport.personalDay.singleDigit}`
                )}
                status={{ tone: 'info', label: numerologyReport.system }}
                actionLabel={t('Open 25-year forecast', '२५-वर्षे अंक चक्र हेर्नुहोस्')}
                onAction={() => onNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' })}
              />
            </div>
          </div>
        </section>

        {/* ==================== CAPABILITIES BENTO GRID WITH FLORAL BLOOMS ==================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
              {t(
                'Easy to read, lively to explore—with full sacred timing depth',
                'पढ्न अत्यन्त सरल, हेर्न जीवन्त—र पूर्ण वैदिक ज्योतिषीय गहिराइयुक्त'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {t(
                'Start with your plain-English personal reading, live 24-petal Horai flower clock, and downloadable PDF report, or dive into any specialized chart below.',
                'आफ्नो सरल व्यक्तिगत फलादेश, २४-पत्रे होरा कमल घडी र PDF रिपोर्टबाट सुरु गर्नुहोस् वा तलका विशेष कुण्डली र मुहूर्त उपकरणहरू खोल्नुहोस्।'
              )}
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
                <span>
                  {t(
                    'NEW • 24-HOUR GRAHA HORAI, GOWRI PANCHANGAM & NALLA NERAM',
                    'नयाँ • २४-घण्टा ग्रह होरा, गौरी पञ्चाङ्ग र शुभ नल्ल नेरम'
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text)] group-hover:text-[var(--accent)] transition">
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
                    ८-भाग <strong>गौरी पञ्चाङ्ग</strong>, बिहान/बेलुकाको <strong>शुभ वेला (नल्ल नेरम)</strong>,{' '}
                    <strong>राहुकाल</strong> र सात ग्रहका पवित्र पुष्पहरू प्रत्यक्ष हेर्नुहोस्।
                  </>
                ) : (
                  <>
                    Track every planetary hour from Sunrise to Sunrise—<strong>Sukra</strong>,{' '}
                    <strong>Guru</strong>, <strong>Budha</strong>, <strong>Chandra</strong>,{' '}
                    <strong>Suriya</strong>, <strong>Sevvai</strong> &amp; <strong>Sani Horai</strong>—plus
                    8-fold Day &amp; Night <strong>Gowri Panchangam</strong>, Morning/Evening{' '}
                    <strong>Nalla Neram</strong>, <strong>Rahu Kalam</strong>, and sacred planetary flowers.
                  </>
                )}
              </p>
            </div>
            <div className="shrink-0 relative z-10">
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
                flowerHex: '#EC4899',
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
                flowerHex: '#F59E0B',
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
                flowerHex: '#10B981',
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
                flowerHex: '#6366F1',
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
