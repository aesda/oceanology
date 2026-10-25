import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  MapPin,
  Scale,
  BookOpen,
  Globe,
  Sparkles,
  Activity,
  Download,
  FileText,
  Clock,
  HeartHandshake,
  Hash,
  Layers,
} from 'lucide-react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { CosmicSynthesisReport, generateCosmicSynthesis } from '../engines/synthesisEngine';
import { generateDeepLifeReport } from '../engines/deepLifeReportEngine';
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
  trNakshatra,
  trPlanet,
  trSign,
  trVara,
  useLanguage,
} from '../i18n/i18n';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { ScoreTrendChart, StatusBadge } from './ui/DashboardPrimitives';

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
  synthesisReport?: CosmicSynthesisReport;
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

/* ==================== SACRED GEOMETRY & COSMIC ART PRIMITIVES ==================== */

const SeedOfLifeMark: React.FC<{ size?: number; animated?: boolean; className?: string }> = ({
  size = 32,
  animated = false,
  className = '',
}) => {
  const r = 10;
  const ringAngles = [0, 60, 120, 180, 240, 300];
  return (
    <svg
      width={size}
      height={size}
      viewBox="-26 -26 52 52"
      aria-hidden="true"
      className={`inline-block shrink-0 ${animated ? 'sc-animate-orbit' : ''} ${className}`}
    >
      <circle cx="0" cy="0" r="23" fill="none" stroke="rgba(221,181,252,0.35)" strokeWidth="1" />
      <circle cx="0" cy="0" r={r} fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="1.05" />
      {ringAngles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = Math.cos(rad) * r;
        const cy = Math.sin(rad) * r;
        return (
          <circle
            key={deg}
            cx={cx.toFixed(2)}
            cy={cy.toFixed(2)}
            r={r}
            fill="none"
            stroke="rgba(237,197,252,0.82)"
            strokeWidth="0.95"
          />
        );
      })}
    </svg>
  );
};

const InlineOrbitalPill: React.FC<{ variant: 'torus' | 'infinity' | 'starburst' }> = ({
  variant,
}) => (
  <span
    aria-hidden="true"
    className="sc-inline-pill align-middle mx-1.5 sm:mx-3 w-[68px] h-[38px] sm:w-[112px] sm:h-[60px] lg:w-[132px] lg:h-[68px]"
  >
    {variant === 'torus' && (
      <svg viewBox="-36 -24 72 48" className="w-11 sm:w-16 lg:w-20 h-auto">
        <ellipse cx="0" cy="0" rx="22" ry="11" fill="none" stroke="#EDC5FC" strokeWidth="0.9" strokeOpacity="0.85" />
        <ellipse cx="0" cy="0" rx="11" ry="19" fill="none" stroke="#9780FF" strokeWidth="0.9" strokeOpacity="0.85" />
        <ellipse cx="0" cy="0" rx="16" ry="16" fill="none" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.55" />
      </svg>
    )}
    {variant === 'infinity' && (
      <svg viewBox="-36 -24 72 48" className="w-11 sm:w-16 lg:w-20 h-auto">
        <circle cx="-9" cy="0" r="12" fill="none" stroke="#EDC5FC" strokeWidth="1" strokeOpacity="0.88" />
        <circle cx="9" cy="0" r="12" fill="none" stroke="#9780FF" strokeWidth="1" strokeOpacity="0.88" />
        <circle cx="0" cy="0" r="5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.65" />
      </svg>
    )}
    {variant === 'starburst' && (
      <svg viewBox="-36 -24 72 48" className="w-11 sm:w-16 lg:w-20 h-auto">
        <ellipse cx="0" cy="0" rx="25" ry="5" fill="none" stroke="#EDC5FC" strokeWidth="0.9" strokeOpacity="0.88" />
        <ellipse cx="0" cy="0" rx="5" ry="19" fill="none" stroke="#9780FF" strokeWidth="0.9" strokeOpacity="0.88" />
        <circle cx="0" cy="0" r="2.6" fill="#FFFFFF" />
      </svg>
    )}
  </span>
);

const ConstellationWireframe: React.FC = () => (
  <svg
    viewBox="0 0 180 180"
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-5 -right-5 w-44 h-44 opacity-[0.16]"
  >
    <path
      d="M90 10 L122 158 L14 58 L166 58 L58 158 Z"
      fill="none"
      stroke="#DDB5FC"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <circle cx="90" cy="90" r="58" fill="none" stroke="#9780FF" strokeWidth="0.8" strokeDasharray="3 4" />
  </svg>
);

const CosmicMeshOrbSvg: React.FC = () => (
  <svg
    viewBox="0 0 520 520"
    aria-hidden="true"
    className="pointer-events-none select-none w-[310px] sm:w-[440px] lg:w-[510px] h-auto drop-shadow-[0_0_85px_rgba(123,92,224,0.52)]"
  >
    <defs>
      <radialGradient id="scOrbBody" cx="38%" cy="28%" r="68%">
        <stop offset="0%" stopColor="#F5DCFF" stopOpacity="0.96" />
        <stop offset="26%" stopColor="#9780FF" stopOpacity="0.92" />
        <stop offset="58%" stopColor="#4700D6" stopOpacity="0.88" />
        <stop offset="86%" stopColor="#1A0E38" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#0C0B0C" stopOpacity="0" />
      </radialGradient>
      <pattern id="scMeshDots" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.05" fill="#EDC5FC" fillOpacity="0.28" />
        <circle cx="8" cy="8" r="0.85" fill="#FFFFFF" fillOpacity="0.18" />
      </pattern>
      <clipPath id="scBlobClip">
        <path d="M262,48 C342,42 426,92 448,168 C470,244 454,344 394,404 C334,464 228,478 152,432 C76,386 42,296 58,208 C74,120 182,54 262,48 Z" />
      </clipPath>
    </defs>

    <g clipPath="url(#scBlobClip)">
      <rect width="520" height="520" fill="url(#scOrbBody)" />
      <rect width="520" height="520" fill="url(#scMeshDots)" />
      {[120, 175, 230, 285, 340, 395].map((ry, i) => (
        <ellipse
          key={ry}
          cx="260"
          cy="260"
          rx={220 - i * 16}
          ry={ry * 0.55}
          transform={`rotate(${-22 + i * 9} 260 260)`}
          fill="none"
          stroke="#EDC5FC"
          strokeOpacity="0.16"
          strokeWidth="1.1"
        />
      ))}
    </g>
  </svg>
);

export const LandingPage: React.FC<Props> = ({
  profile,
  onProfileChange,
  natalChart,
  vedicReport,
  panchangReport,
  numerologyReport,
  synthesisReport,
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

  const resolvedSynthesis = useMemo(
    () =>
      synthesisReport ??
      generateCosmicSynthesis(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport
      ),
    [synthesisReport, profile, natalChart, vedicReport, panchangReport, numerologyReport]
  );

  const deepReport = useMemo(
    () =>
      generateDeepLifeReport(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        resolvedSynthesis,
        lang
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, resolvedSynthesis, lang]
  );

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

  const scrollToSection = (id: string) => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const horaiDotClasses =
    panchangReport.activeHorai.tone === 'optimal' ||
    panchangReport.activeHorai.tone === 'favorable'
      ? { ping: 'bg-emerald-400', dot: 'bg-emerald-400' }
      : panchangReport.activeHorai.tone === 'avoid'
      ? { ping: 'bg-rose-400', dot: 'bg-rose-400' }
      : { ping: 'bg-amber-400', dot: 'bg-amber-400' };

  const topHouseShort = trHouseGuide(topSavHouse.house, lang)
    .shortTitle.split(',')[0]
    .trim();

  const nextMaturityMilestone = useMemo(
    () =>
      deepReport.maturityMilestones.find((m) => m.status === 'ACTIVE_NOW') ||
      deepReport.maturityMilestones.find((m) => m.status === 'UPCOMING') ||
      deepReport.maturityMilestones[0],
    [deepReport.maturityMilestones]
  );

  return (
    <div
      className={`sc-landing min-h-screen flex flex-col relative z-10 ${
        floralMotion ? '' : 'sc-motion-off'
      }`}
    >
      {/* ==================== 0. FLOATING CENTER-PILL FROSTED GLASS NAVBAR ==================== */}
      <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="sc-nav-pill pointer-events-auto max-w-[96vw] w-fit mx-auto rounded-2xl px-2.5 sm:px-4 py-2 flex items-center gap-2 sm:gap-5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-left shrink-0 group"
            aria-label="Oceanology Home"
          >
            <SeedOfLifeMark size={28} animated={floralMotion} />
            <span className="hidden sm:inline font-scDisplay font-semibold text-base tracking-[-0.03em] text-white group-hover:text-[#EDC5FC] transition">
              oceanology
            </span>
          </button>

          <nav
            aria-label="Cosmic landing sections"
            className="hidden lg:flex items-center gap-1 text-[13.5px] font-medium text-white/75"
          >
            <button
              type="button"
              onClick={() => scrollToSection('sc-studio')}
              className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.07] transition whitespace-nowrap"
            >
              {t('Live Studio', 'प्रत्यक्ष स्टुडियो')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sc-how')}
              className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.07] transition whitespace-nowrap"
            >
              {t('How it Works', 'कसरी काम गर्छ')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sc-features')}
              className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.07] transition whitespace-nowrap"
            >
              {t('Sacred Timing', 'होरा र मुहूर्त')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sc-dossier')}
              className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.07] transition whitespace-nowrap"
            >
              {t('10-Ch. Dossier', '१०-अध्याय रिपोर्ट')}
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitchButton />

            {onToggleFloralMotion && (
              <button
                type="button"
                onClick={onToggleFloralMotion}
                aria-label="Toggle cosmic orbital motion"
                title={t('Toggle cosmic motion', 'कस्मिक एनिमेसन अन/अफ')}
                className={`hidden xl:inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs transition ${
                  floralMotion
                    ? 'border-[#DDB5FC]/45 bg-[#9780FF]/20 text-[#EDC5FC]'
                    : 'border-white/15 bg-white/[0.05] text-white/65'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleLargeText && (
              <button
                type="button"
                onClick={onToggleLargeText}
                aria-label="Toggle larger reading text"
                title={t('Toggle larger reading text', 'ठूलो अक्षर आकार')}
                className={`hidden md:inline-flex items-center justify-center h-8 px-2.5 rounded-lg border text-xs font-semibold transition ${
                  largeText
                    ? 'border-[#DDB5FC]/55 bg-[#9780FF]/20 text-white'
                    : 'border-white/15 bg-white/[0.05] text-white/75 hover:text-white'
                }`}
              >
                {largeText ? t('Aa+', 'ठूलो') : 'Aa'}
              </button>
            )}

            <button
              type="button"
              data-testid="landing-read-report"
              onClick={() => onNavigate('FULL_REPORT')}
              className="bg-white text-[#0C0B0C] hover:bg-[#F5EBFF] font-semibold text-xs sm:text-[13px] px-3 sm:px-4 h-[34px] rounded-xl inline-flex items-center gap-1.5 whitespace-nowrap shadow-[0_4px_18px_rgba(255,255,255,0.2)] transition"
            >
              <span className="hidden sm:inline">{t('Read Report', 'रिपोर्ट पढ्नुहोस्')}</span>
              <span className="sm:hidden">{t('Report', 'रिपोर्ट')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ==================== 1. COSMIC NEBULA HERO & 3D INTERACTIVE DEVICE ==================== */}
        <section className="relative sc-starfield sc-nebula-hero pt-6 sm:pt-9 pb-14 sm:pb-16 px-4 sm:px-8 overflow-hidden">
          <div className="max-w-[1320px] mx-auto relative">
            {/* Monumental Brand Wordmark & Subtitle */}
            <div className="text-center max-w-4xl mx-auto space-y-2.5 sm:space-y-3.5 relative z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#DDB5FC]/35 bg-white/[0.05] text-[11px] sm:text-xs font-medium text-[#EDC5FC] tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EDC5FC] animate-pulse" />
                <span>
                  {t(
                    '8 Classical Canons • 24h Graha Horai • 17-Page Printable Dossier',
                    '८ शास्त्रीय ग्रन्थ • प्रत्यक्ष २४-घण्टा होरा • १७-पृष्ठ PDF जीवन दर्पण'
                  )}
                </span>
              </div>

              <h1 className="font-scDisplay font-medium text-[clamp(3rem,8.8vw,6.5rem)] leading-[0.96] tracking-[-0.055em] text-white select-none">
                oceanology
              </h1>

              <p className="text-base sm:text-xl font-medium text-white/85 tracking-[-0.015em] max-w-2xl mx-auto">
                {t(
                  'The Cosmic Timing, Horai & Personal Life Dossier',
                  'प्रत्यक्ष ग्रह होरा, शुभ साइत र सरल १०-अध्याय जीवन कुण्डली दर्पण'
                )}
              </p>
            </div>

            {/* Centerpiece Stage: Sculptural Cosmic Orb + 3D-Tilted Interactive Phone */}
            <div className="relative mt-5 sm:mt-6 min-h-[490px] sm:min-h-[536px] flex items-center justify-center">
              {/* Glowing 3D Lattice Nebula Orb */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <CosmicMeshOrbSvg />
              </div>

              {/* 3D-Tilted Interactive Cosmic Phone Mockup */}
              <div className="relative z-20 sc-animate-float w-[280px] sm:w-[318px] rounded-[42px] p-[9px] bg-gradient-to-b from-[#695B86] via-[#272235] to-[#121018] shadow-[0_38px_95px_rgba(0,0,0,0.88),0_0_50px_rgba(123,92,224,0.3)] border border-white/20">
                <div className="rounded-[34px] bg-gradient-to-b from-[#0E0B16] via-[#130E24] to-[#0A090F] px-4 pt-3 pb-4 text-white relative overflow-hidden">
                  {/* Dynamic Island + Status Row */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/80 mb-3 tabular-nums">
                    <span>{panchangReport.sunriseTime}</span>
                    <div className="w-20 h-4 rounded-full bg-black border border-white/10" />
                    <span className="inline-flex items-center gap-1 text-[#EDC5FC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t('LIVE', 'प्रत्यक्ष')}
                    </span>
                  </div>

                  {/* Personalized Greeting */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EDC5FC] via-[#9780FF] to-[#4700D6] p-[1.5px] shrink-0">
                        <div className="w-full h-full rounded-full bg-[#130F21] flex items-center justify-center text-xs font-bold text-[#EDC5FC]">
                          {(profile.firstName || 'A').slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-white/60 leading-tight">
                          {t('Welcome Back', 'स्वागतम्')}
                        </div>
                        <div className="text-sm font-semibold text-white truncate">
                          {profile.firstName} {profile.lastName}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToSection('sc-studio')}
                      title={t('Customize Birth Profile', 'जन्म विवरण बदल्नुहोस्')}
                      className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition shrink-0"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Glowing Violet-Orchid Frequency / Readiness Ring */}
                  <div className="relative my-3 py-3 flex items-center justify-center">
                    <div className="absolute w-44 h-44 rounded-full bg-[#7B5CE0]/35 blur-2xl pointer-events-none" />
                    <div className="relative w-40 h-40 rounded-full border border-[#EDC5FC]/65 shadow-[0_0_34px_rgba(151,128,255,0.55),inset_0_0_26px_rgba(237,197,252,0.28)] flex flex-col items-center justify-center text-center px-3 bg-radial from-[#26184B]/80 to-[#0E0B17]/90">
                      <div className="absolute inset-2 rounded-full border border-[#9780FF]/35 pointer-events-none" />
                      <span className="text-[10px] uppercase tracking-wider text-[#EDC5FC]/85 font-medium">
                        {t('Today’s Alignment', 'आजको मुहूर्त अंक')}
                      </span>
                      <div className="text-3xl font-bold tracking-tight text-white tabular-nums mt-0.5">
                        {liveEval.score}
                        <span className="text-sm font-normal text-white/65">/100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('HORAI')}
                        className="mt-2 px-3 py-0.5 rounded-full text-[10.5px] font-semibold bg-white/10 hover:bg-white/20 border border-[#EDC5FC]/45 text-[#EDC5FC] transition"
                      >
                        {activeHoraiDisp.horaiName}
                      </button>
                    </div>
                  </div>

                  {/* Birth Signature Pill */}
                  <div className="text-center text-[11px] text-white/70 mb-3 truncate">
                    {lang === 'ne'
                      ? `${trSign(natalChart.ascendant.signName, 'ne')} लग्न • ${trNakshatra(
                          moonPlanet.nakshatraName,
                          'ne'
                        )}`
                      : `${natalChart.ascendant.signName} Rising • ${moonPlanet.nakshatraName}`}
                  </div>

                  {/* Activation Card Inside Phone */}
                  <div className="relative rounded-2xl bg-white/[0.06] border border-white/12 p-3.5 overflow-hidden">
                    <ConstellationWireframe />
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-white leading-snug">
                          {t(
                            'Your 10-Chapter Life Dossier',
                            'तपाईंको १०-अध्याय जीवन दर्पण'
                          )}
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#9780FF] text-[#0C0B0C] text-[10px] font-bold flex items-center justify-center shrink-0">
                          10
                        </span>
                      </div>
                      <p className="text-[10.5px] text-white/65 leading-relaxed">
                        {t(
                          `${vedicReport.activeMahadasha.lord}–${vedicReport.activeAntardasha.lord} period • Career, Wealth, Marriage & Prakriti`,
                          `${trPlanet(vedicReport.activeMahadasha.lord, 'ne')}–${trPlanet(
                            vedicReport.activeAntardasha.lord,
                            'ne'
                          )} दशा • करियर, धन, विवाह र स्वास्थ्य`
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('FULL_REPORT')}
                        className="mt-1 px-3.5 py-1.5 rounded-full bg-white text-[#0C0B0C] text-[11px] font-bold hover:bg-[#F4E8FF] transition inline-flex items-center gap-1"
                      >
                        <span>{t('Start Reading', 'अध्ययन सुरु गर्नुहोस्')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom App Dock Inside Phone */}
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-around text-[10px] text-white/65">
                    <button
                      type="button"
                      onClick={() => onNavigate('HORAI')}
                      className="flex flex-col items-center gap-0.5 hover:text-white transition"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#EDC5FC]" />
                      <span>{t('Horai', 'होरा')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('WHAT_HAPPENS_IF')}
                      className="flex flex-col items-center gap-0.5 hover:text-white transition"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{t('Dates', 'साइत')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('sc-studio')}
                      aria-label="Jump to interactive birth studio"
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4700D6] via-[#9780FF] to-[#EDC5FC] flex items-center justify-center shadow-[0_0_16px_rgba(151,128,255,0.7)]"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' })}
                      className="flex flex-col items-center gap-0.5 hover:text-white transition"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t('Kundali', 'कुण्डली')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hero Floating Pods (Flanking on XL, Cleanly Stacked Below on Mobile/Tablet) */}
            <div className="mt-8 xl:mt-0 xl:absolute xl:bottom-0 xl:inset-x-0 z-30 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 pointer-events-none">
              {/* Left Pod: Live Planetary Hora & Nalla Neram */}
              <div className="sc-dock-pod pointer-events-auto p-4 sm:px-5 sm:py-4 max-w-md w-full md:w-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-white tabular-nums">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${horaiDotClasses.ping}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${horaiDotClasses.dot}`}
                    />
                  </span>
                  <span className="text-white/75">
                    {t(`Live in ${cityDisplay}:`, `${cityDisplay} मा प्रत्यक्ष होरा:`)}
                  </span>
                  <span className="text-[#EDC5FC] font-bold">
                    {lang === 'ne'
                      ? `${activeHoraiDisp.horaiName} (${activeHoraiDisp.lordLabel})`
                      : `${activeHoraiDisp.lordLabel} Hora (${activeHoraiDisp.horaiName})`}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/65 tabular-nums">
                  <span>
                    {panchangReport.activeHorai.startTime}–{panchangReport.activeHorai.endTime} (
                    {panchangReport.activeHorai.minutesRemaining}
                    {t('m left', ' मि. बाँकी')})
                  </span>
                  <span>•</span>
                  <span>
                    {t('Amrit Window:', 'शुभ वेला:')} {panchangReport.nallaNeram[0].startTime}–
                    {panchangReport.nallaNeram[0].endTime}
                  </span>
                </div>
              </div>

              {/* Right Pod: Signature Superconscious Floating CTA Pod */}
              <div className="sc-dock-pod pointer-events-auto p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-lg w-full md:w-auto">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-semibold text-white tracking-[-0.01em]">
                    {t(
                      '10-Chapter Book-Backed Dossier',
                      '१०-अध्याय शास्त्रीय जीवन रिपोर्ट'
                    )}
                  </div>
                  <div className="text-xs sm:text-[13px] text-white/65">
                    {t(
                      'Plain-English reading + 17-page printable PDF',
                      'सरल नेपाली व्याख्या + १७-पृष्ठ प्रिन्टयोग्य PDF'
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('FULL_REPORT')}
                  className="sc-btn-white text-sm whitespace-nowrap shrink-0"
                >
                  <span>{t('Generate Dossier', 'रिपोर्ट खोल्नुहोस्')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. SACRED GEOMETRY & 3-LINE INLINE-PILL MANIFESTO ==================== */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
          <div className="max-w-[1080px] mx-auto text-center space-y-10 sm:space-y-12">
            <div className="flex justify-center">
              <div className="p-3.5 rounded-full bg-white/[0.03] border border-white/10 shadow-[0_0_40px_rgba(151,128,255,0.18)]">
                <SeedOfLifeMark size={52} animated={floralMotion} />
              </div>
            </div>

            {/* 3-Line Monumental Inline-Pill Display Statement */}
            <h2 className="font-scDisplay font-medium text-[clamp(2rem,5.6vw,4.6rem)] leading-[1.14] tracking-[-0.04em] text-white">
              <span className="block">
                {t('Decode', 'पढ्नुहोस्')}
                <InlineOrbitalPill variant="torus" />
                {t('Your', 'आफ्नो')}
              </span>
              <span className="block mt-1.5 sm:mt-2">
                {t('Stars', 'नक्षत्र')}
                <InlineOrbitalPill variant="infinity" />
                <span className="font-scSerif italic font-normal text-[#EDC5FC]">
                  {t('Master', 'चिनौं')}
                </span>
              </span>
              <span className="block mt-1.5 sm:mt-2">
                {t('Your', 'आफ्नो')}
                <InlineOrbitalPill variant="starburst" />
                {t('Timing', 'शुभ समय')}
              </span>
            </h2>

            {/* Progressive-Luminance Editorial Narrative */}
            <p className="max-w-2xl mx-auto text-base sm:text-xl leading-[1.68] text-left sm:text-center font-normal">
              <span className="text-white">
                {t(
                  'Every turning point in your career, wealth, relationships, and vitality leaves a signature in the sky. ',
                  'तपाईंको करियर, धन-सम्पत्ति, विवाह र स्वास्थ्यको हरेक मोड आकाशको ग्रह-स्थितिमा अंकित हुन्छ। '
                )}
              </span>
              <span className="text-white/65">
                {t(
                  'Oceanology unites high-precision Moshier astronomical ephemeris with eight foundational Sanskrit & modern canons—translating complex D1/D9/D10 charts, Indu Lagna wealth indicators, and 24-hour Graha Horai windows into crystal-clear everyday guidance.',
                  'ओसियोलोजीले सूक्ष्म खगोलीय इफेमेरिस र बृहत् पाराशर होरा शास्त्र लगायत ८ प्रामाणिक ग्रन्थहरूलाई जोडेर लग्न/नवांश/दशमांश कुण्डली, इन्दु लग्न धन योग र २४-घण्टा ग्रह होरालाई जो-कसैले सजिलै बुझ्ने सरल भाषामा प्रस्तुत गर्दछ।'
                )}
              </span>
            </p>
          </div>
        </section>

        {/* ==================== 3. INTERACTIVE LIVE BIRTH & COSMIC TIMING STUDIO ==================== */}
        <section id="sc-studio" className="scroll-mt-24 py-8 sm:py-14 px-4 sm:px-8">
          <div className="max-w-[1280px] mx-auto sc-card-iridescent p-5 sm:p-8 lg:p-10 relative overflow-hidden">
            {/* Ambient Nebula Corner Glow */}
            <div className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#7B5CE0]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-24 w-96 h-96 rounded-full bg-[#E73825]/12 blur-3xl" />

            <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
              <div className="space-y-1.5 max-w-2xl">
                <div className="text-xs sm:text-sm font-semibold text-[#9780FF] tracking-wide uppercase">
                  {t(
                    'Interactive Cosmic Studio • Live Calculation',
                    'प्रत्यक्ष जन्म कुण्डली र शुभ साइत स्टुडियो'
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-white">
                  {t(
                    'Personalize your birth coordinates & test today’s sky',
                    'आफ्नो जन्म विवरण राख्नुहोस् र आजको शुभ साइत जाँच्नुहोस्'
                  )}
                </h2>
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

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* LEFT (5 cols): Birth Profile Editor & Instant Signature */}
              <div className="lg:col-span-5 rounded-2xl bg-white/[0.035] border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <span className="text-sm font-semibold text-white inline-flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#DDB5FC]" />
                      {t('Birth Coordinates', 'जन्म विवरण')}
                    </span>
                    <span className="text-xs text-[#DDB5FC] tabular-nums">
                      {t(
                        `Life Path #${numerologyReport.lifePath.final} • Year #${numerologyReport.personalYear.final}`,
                        `मूलांक #${numerologyReport.lifePath.final} • व्यक्तिगत वर्ष #${numerologyReport.personalYear.final}`
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="hero-first-name"
                        className="block text-xs font-medium text-white/75 mb-1"
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
                        className="w-full sc-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="hero-last-name"
                        className="block text-xs font-medium text-white/75 mb-1"
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
                        className="w-full sc-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="hero-birth-date"
                        className="block text-xs font-medium text-white/75 mb-1"
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
                        className="w-full sc-input tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="hero-birth-time"
                        className="block text-xs font-medium text-white/75 mb-1"
                      >
                        {t('Birth time (24h)', 'जन्म समय (२४ घण्टा)')}
                      </label>
                      <input
                        id="hero-birth-time"
                        type="time"
                        aria-label="Birth time"
                        disabled={Boolean(profile.unknownTime)}
                        value={birthTimeIso}
                        onChange={(e) => {
                          const [hr, mn] = e.target.value
                            .split(':')
                            .map((n) => parseInt(n, 10));
                          if (!Number.isNaN(hr) && !Number.isNaN(mn)) {
                            onProfileChange({ ...profile, hour: hr, minute: mn });
                          }
                        }}
                        className="w-full sc-input tabular-nums disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(profile.unknownTime)}
                      onChange={(e) =>
                        onProfileChange({ ...profile, unknownTime: e.target.checked })
                      }
                      className="rounded border-white/25 bg-[#121018] text-[#9780FF] focus:ring-[#9780FF]"
                    />
                    <span>
                      {t(
                        'Exact birth time unknown (use Sunrise / Chandra Lagna mode)',
                        'जन्मको ठीक घण्टा थाहा छैन (चन्द्र लग्न मोड प्रयोग गर्नुहोस्)'
                      )}
                    </span>
                  </label>

                  {/* City Selector (4 Balanced Quick Cities + Global Search) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-white/80 font-medium inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#DDB5FC] shrink-0" />
                        <span>
                          {cityDisplay}, {countryDisplay}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCitySearch(!showCitySearch)}
                        className="text-[#DDB5FC] font-semibold hover:underline"
                      >
                        {showCitySearch
                          ? t('Done', 'बन्द गर्नुहोस्')
                          : t('Search 80+ cities', 'अन्य सहर खोज्नुहोस्')}
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
                              className={`h-8 px-2 rounded-lg text-xs font-medium transition truncate border ${
                                active
                                  ? 'bg-[#9780FF]/25 border-[#DDB5FC]/65 text-white font-semibold'
                                  : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/25'
                              }`}
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

                  {/* Live 3-Column Natal Snapshot */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="rounded-xl bg-black/35 border border-white/10 px-3 py-2.5">
                      <div className="text-[11px] text-white/55">{t('Sun Sign', 'सूर्य राशि')}</div>
                      <div className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                        {trSign(sunPlanet.signName, lang)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-black/35 border border-white/10 px-3 py-2.5">
                      <div className="text-[11px] text-white/55">{t('Moon Sign', 'चन्द्र राशि')}</div>
                      <div className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                        {trSign(moonPlanet.signName, lang)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-black/35 border border-white/10 px-3 py-2.5">
                      <div className="text-[11px] text-white/55">{t('Active Dasha', 'हालको दशा')}</div>
                      <div className="text-xs sm:text-sm font-semibold text-[#EDC5FC] truncate mt-0.5">
                        {trPlanet(vedicReport.activeMahadasha.lord, lang)}–
                        {trPlanet(vedicReport.activeAntardasha.lord, lang)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary & Secondary Studio Actions */}
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onNavigate('FULL_REPORT')}
                    className="sc-btn-white w-full text-sm sm:text-[15px]"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>
                      {t('Open My 10-Chapter Life Report', 'मेरो १०-अध्याय जीवन रिपोर्ट पढ्नुहोस्')}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={pdfDownloading}
                      onClick={handleQuickPdf}
                      className="sc-btn-glass text-xs sm:text-sm disabled:opacity-60"
                    >
                      <Download className="w-4 h-4 text-[#EDC5FC] shrink-0" />
                      <span>
                        {pdfDownloading
                          ? t('Building PDF…', 'PDF बन्दैछ…')
                          : t('Download 17p PDF', '१७-पृष्ठ PDF डाउनलोड')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                      className="sc-btn-glass text-xs sm:text-sm"
                    >
                      <Layers className="w-4 h-4 text-[#EDC5FC] shrink-0" />
                      <span>{t('Open Full Workspace', 'पूर्ण ड्यासबोर्ड')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT (7 cols): Live Decision Score & 10-Day Readiness Curve */}
              <div className="lg:col-span-7 rounded-2xl bg-white/[0.035] border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#DDB5FC] shrink-0" />
                    <span className="text-sm font-semibold text-white">
                      {t(`Today’s Timing — ${cityDisplay}`, `आजको शुभ साइत — ${cityDisplay}`)}
                    </span>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Preview life decision"
                    className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-black/40 border border-white/10 max-w-full"
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            active
                              ? 'bg-white text-[#0C0B0C]'
                              : 'text-white/70 hover:text-white'
                          }`}
                        >
                          {trActionShort(act.id, act.label, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3 Cosmic KPI Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-black/35 border border-white/10 p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs text-white/65">
                      {t('Today’s Readiness', 'आजको मुहूर्त अंक')}
                    </div>
                    <div className="text-2xl font-bold tabular-nums text-white leading-none">
                      {liveEval.score}
                      <span className="text-sm font-normal text-white/50">/100</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
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
                      <span className="text-[11px] text-white/50 tabular-nums">
                        {t('70+ ideal', '७०+ उत्तम')}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/35 border border-white/10 p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs text-white/65">
                      {t('Best Day (Next 10d)', 'आगामी १० दिनको उत्तम दिन')}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                      {formatDisplayDate(
                        bestUpcoming?.dateStr || panchangReport.dateStr,
                        lang,
                        false
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <StatusBadge
                        tone="optimal"
                        label={`${bestUpcoming?.score ?? liveEval.score}/100`}
                      />
                      <span className="text-[11px] text-white/55 truncate">
                        {shortNakshatraLabel(
                          bestUpcoming?.nakshatraName || panchangReport.nakshatra.name,
                          lang
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/35 border border-white/10 p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs text-white/65">
                      {t('Peak Chart House', 'सबैभन्दा बलियो भाव')}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                      {t(`House ${topSavHouse.house}`, `भाव ${topSavHouse.house}`)}
                      <span className="text-xs font-normal text-white/55">
                        {' '}
                        · {topSavHouse.bindus} {t('pts', 'बिन्दु')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <StatusBadge tone="info" label={topHouseShort} />
                      <span className="text-[11px] text-white/50 tabular-nums">
                        {t('28 avg', 'औसत २८')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live 10-Day Score Trend Chart */}
                <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 sm:p-4 space-y-2">
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    {t('10-Day Cosmic Timing Curve', '१०-दिने शुभ समय रेखा')} —{' '}
                    <span className="text-[#EDC5FC]">
                      {trActionTitle(liveEval.action.id, liveEval.action.title, lang)}
                    </span>
                  </div>
                  <ScoreTrendChart
                    points={forecastPoints}
                    benchmarkValue={70}
                    benchmarkLabel={t('70+ Optimal', '७०+ उत्तम दिन')}
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
                        className="text-xs font-semibold text-[#DDB5FC] hover:underline inline-flex items-center gap-1"
                      >
                        <span>
                          {t('Test all 20 life decisions →', 'सबै २० जीवन निर्णयहरू जाँच्नुहोस् →')}
                        </span>
                      </button>
                    }
                    ariaLabel={`10-day timing score forecast for ${liveEval.action.title}`}
                  />
                </div>

                {/* Plain-Language Action Verdict Strip */}
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="text-sm font-semibold text-white">
                      {liveOutcomeDisp.headline}
                    </div>
                    <p className="text-xs sm:text-[13px] text-white/65 leading-relaxed">
                      {liveOutcomeDisp.consequence}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: previewActionId })}
                    className="sc-btn-glass text-xs sm:text-sm whitespace-nowrap shrink-0"
                  >
                    <span>{t('See Full Timing', 'पूरा विवरण')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 4. MONUMENTAL BACKDROP + 4 STAGGERED CONSTELLATION CARDS ==================== */}
        <section id="sc-how" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto relative">
            {/* Monumental Backdrop Typography */}
            <div className="text-center mb-12 sm:mb-16 select-none">
              <div className="font-scDisplay font-semibold text-[clamp(2.6rem,8.4vw,6.8rem)] leading-[0.98] tracking-[-0.05em] text-white">
                {t('Decode Your', 'कुण्डलीको')}
              </div>
              <div className="font-scSerif italic font-normal text-[clamp(2.3rem,7.2vw,5.8rem)] leading-[1.06] text-[#9A93B0] mt-1">
                {t('Destiny', 'गहिरो रहस्य')}
              </div>
            </div>

            {/* 4 Staggered Lavender-Bordered Constellation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
              {[
                {
                  step: '01',
                  pill: t('0.01° Arc Precision', '०.०१° सूक्ष्म गणना'),
                  title: t(
                    'Astronomical Ephemeris Meets Sidereal Jyotish',
                    'सूक्ष्म खगोलीय गणना र वैदिक सिद्धान्तको संगम'
                  ),
                  desc: t(
                    'Your birth moment is computed directly in your browser using Swiss-grade Moshier planetary series—generating exact Lahiri Sidereal D1, Navamsha D9, Dashamsha D10, and Chara Karaka degrees with zero server tracking.',
                    'तपाईंको जन्म मिति, समय र सहरका आधारमा ब्राउजरभित्रै सूक्ष्म ग्रह-गणितबाट लग्न (D1), नवांश (D9), दशमांश (D10) र जैमिनी आत्मकारक अंशहरू शतप्रतिशत गोपनीयताका साथ तयार हुन्छन्।'
                  ),
                  offset: false,
                  action: () => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' }),
                  cta: t('Explore Vedic & D9 Charts', 'लग्न र नवांश चार्ट हेर्नुहोस्'),
                },
                {
                  step: '02',
                  pill: t('8 Classical Canons', '८ प्रामाणिक ग्रन्थ'),
                  title: t(
                    'Synthesized from 8 Classical & Modern Books',
                    '८ प्राचीन र आधुनिक ग्रन्थबाट सरल संश्लेषण'
                  ),
                  desc: t(
                    'Instead of generic one-liners, Oceanology cross-examines Brihat Parashara Hora Shastra, Phaladeepika, Saravali, Jaimini Sutras, Ayurvedic Prakriti, and Cheiro/Decoz numerology—with a 1-click Plain vs Classical toggle.',
                    'बृहत् पाराशर होरा शास्त्र, फलदीपिका, सारावली, जैमिनी सूत्र, आयुर्वेदिक त्रिदोष र अंक ज्योतिषलाई जोडेर सामान्य पाठक र अध्येता दुवैका लागि स्पष्ट फलादेश प्रस्तुत गरिन्छ।'
                  ),
                  offset: true,
                  action: () => onNavigate('FULL_REPORT'),
                  cta: t('Read 10-Chapter Dossier', '१०-अध्याय रिपोर्ट पढ्नुहोस्'),
                },
                {
                  step: '03',
                  pill: t(`↑ ${liveEval.score}/100 Live`, `↑ ${liveEval.score}/१०० प्रत्यक्ष`),
                  title: t(
                    'Align Daily Decisions with Graha Horai & Tarabala',
                    'प्रत्यक्ष ग्रह होरा र ताराबलअनुसार सही निर्णय'
                  ),
                  desc: t(
                    'Track Sunrise-to-Sunrise planetary hours (Sukra, Guru, Budha, Suriya), 8-fold Gowri Panchangam, Rahu Kalam, and 20-action Muhurta curves so you know precisely when to sign, invest, travel, or rest.',
                    'सूर्योदयदेखि सूर्योदयसम्मका २४ ग्रह होरा, गौरी पञ्चाङ्ग, राहुकाल र २० जीवन-निर्णयको शुभ साइत हेरेर सम्झौता, लगानी वा यात्राको सर्वोत्तम घडी छान्नुहोस्।'
                  ),
                  offset: false,
                  action: () => onNavigate('HORAI'),
                  cta: t('Open 24h Horai Clock', '२४-घण्टा होरा घडी खोल्नुहोस्'),
                },
                {
                  step: '04',
                  pill: t('17-Page Vector PDF', '१७-पृष्ठ PDF दर्पण'),
                  title: t(
                    'Keep or Share Your 17-Page Printable Life Dossier',
                    '१७-पृष्ठको व्यावसायिक PDF रिपोर्ट सुरक्षित गर्नुहोस्'
                  ),
                  desc: t(
                    'Export a publication-grade 17-page vector PDF complete with North & South Indian Kundalis, 5-Domain Scorecard, Turning-Point Ages (16–48), Gochara transits, and Classical Remedies.',
                    'उत्तर र दक्षिण भारतीय कुण्डली, ५-क्षेत्र स्कोरकार्ड, १६ देखि ४८ वर्षका निर्णायक मोड, शनि/गुरु गोचर र वैदिक उपायहरूसहितको १७-पृष्ठ PDF तुरुन्त डाउनलोड गर्नुहोस्।'
                  ),
                  offset: true,
                  action: handleQuickPdf,
                  cta: t('Export Printable PDF', 'PDF रिपोर्ट डाउनलोड गर्नुहोस्'),
                },
              ].map((card, i) => (
                <div
                  key={card.step}
                  onClick={card.action}
                  className={`sc-card-lavender relative overflow-hidden p-7 sm:p-9 cursor-pointer group ${
                    card.offset ? 'md:mt-16' : ''
                  }`}
                >
                  <ConstellationWireframe />

                  <div className="relative z-10 flex items-center justify-between gap-3 mb-7">
                    {/* Lavender Sacred Geometry Circle Badge */}
                    <div className="w-12 h-12 rounded-full border border-[#DDB5FC]/55 bg-[#9780FF]/10 flex items-center justify-center text-[#EDC5FC]">
                      {i === 0 && (
                        <svg viewBox="-16 -16 32 32" className="w-6 h-6">
                          <polygon points="0,-11 9.5,5.5 -9.5,5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <polygon points="0,11 9.5,-5.5 -9.5,-5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      )}
                      {i === 1 && <SeedOfLifeMark size={24} />}
                      {i === 2 && (
                        <svg viewBox="-16 -16 32 32" className="w-6 h-6">
                          <circle cx="0" cy="-4" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="-4.5" cy="4" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="4.5" cy="4" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      )}
                      {i === 3 && (
                        <svg viewBox="-16 -16 32 32" className="w-6 h-6">
                          <polygon points="0,-12 10,0 0,12 -10,0" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="0" cy="0" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      )}
                    </div>

                    {/* Floating Metric Pill */}
                    <span className="px-3 py-1 rounded-full bg-white text-[#0C0B0C] text-xs font-semibold shadow-sm">
                      {card.pill}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.02em] text-white group-hover:text-[#EDC5FC] transition leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-white/65 leading-relaxed">
                      {card.desc}
                    </p>
                    <div className="pt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#DDB5FC]">
                      <span>{card.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 5. 3-COLUMN HAIRLINE-DIVIDED INTERACTIVE BENTO ==================== */}
        <section id="sc-features" className="scroll-mt-24 border-y border-white/10 bg-[#0D0C10]">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* COLUMN 1: Concentric Horai Frequency Rings */}
            <div
              onClick={() => onNavigate('HORAI')}
              className="p-7 sm:p-10 flex flex-col items-center justify-between gap-8 text-center cursor-pointer group"
            >
              <div className="relative w-full max-w-[280px] rounded-3xl bg-[#17151E] border border-white/[0.08] p-6 pt-8 flex flex-col items-center">
                {/* Top-Left Mini Frequency Badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#1C1926] border border-[#DDB5FC]/45 flex items-center justify-center text-[#EDC5FC]">
                  <Activity className="w-4 h-4" />
                </div>

                {/* Concentric Lavender Ellipses */}
                <svg viewBox="0 0 200 130" className="w-44 h-auto" aria-hidden="true">
                  <ellipse cx="100" cy="62" rx="76" ry="48" fill="none" stroke="#DDB5FC" strokeOpacity="0.32" strokeWidth="1" />
                  <ellipse cx="100" cy="70" rx="54" ry="34" fill="none" stroke="#DDB5FC" strokeOpacity="0.52" strokeWidth="1" />
                  <ellipse cx="100" cy="78" rx="34" ry="21" fill="none" stroke="#EDC5FC" strokeOpacity="0.78" strokeWidth="1.2" />
                </svg>

                <div className="-mt-6 w-9 h-9 rounded-full bg-[#DDB5FC] text-[#0C0B0C] flex items-center justify-center font-bold text-xs shadow-[0_0_24px_rgba(221,181,252,0.55)]">
                  ✦
                </div>

                {/* Floating White Result Pill */}
                <div className="mt-3 px-3 py-1 rounded-full bg-white text-[#0C0B0C] text-[11px] font-bold shadow-md tabular-nums">
                  ↑ {activeHoraiDisp.horaiName} • {panchangReport.activeHorai.minutesRemaining}m
                </div>

                <div className="mt-3 text-xs text-white/65">
                  {t('Sunrise to Sunrise • Live Hora', 'सूर्योदयदेखि सूर्योदय • प्रत्यक्ष होरा')}
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl sm:text-2xl font-medium text-white group-hover:text-[#EDC5FC] transition">
                  {t('24-Hour Graha Horai Sessions', '२४-पत्रे ग्रह होरा र गौरी घडी')}
                </h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  {t(
                    `Tap into your city’s live planetary hour (${activeHoraiDisp.lordLabel}) & ${trGowriName(
                      panchangReport.activeGowri.name,
                      'en'
                    )} Gowri window.`,
                    `${cityDisplay} को प्रत्यक्ष ग्रह होरा (${activeHoraiDisp.lordLabel}) र ${trGowriName(
                      panchangReport.activeGowri.name,
                      'ne'
                    )} गौरी पञ्चाङ्ग तुरुन्त हेर्नुहोस्।`
                  )}
                </p>
              </div>
            </div>

            {/* COLUMN 2: Concentric Iridescent Coral-to-Violet Portal Rings */}
            <div className="p-7 sm:p-10 flex flex-col items-center justify-between gap-8 text-center">
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl sm:text-2xl font-medium text-white">
                  {t('Deep Life Activations', '१०-अध्याय जीवन कुण्डली दर्पण')}
                </h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  {t(
                    'Book-grounded chapters on Career, Indu Lagna Wealth, Partner Portrait, Prakriti & Remedies',
                    'करियर, इन्दु लग्न धन, जीवनसाथी चित्रण, आयुर्वेदिक प्रकृति र वैदिक उपायहरूको पूर्ण अध्ययन'
                  )}
                </p>
              </div>

              {/* Multi-Ring Iridescent Portal */}
              <div className="relative py-4 flex items-center justify-center w-full max-w-[300px]">
                <div className="w-full rounded-[56px] p-[1px] bg-gradient-to-r from-[#E73825]/65 via-[#7B5CE0]/70 to-[#DDB5FC]/45">
                  <div className="rounded-[55px] bg-[#0D0C10] p-3.5">
                    <div className="rounded-[44px] p-[1px] bg-gradient-to-r from-[#E73825]/55 via-[#7B5CE0]/65 to-[#9780FF]/45">
                      <div className="rounded-[43px] bg-[#0D0C10] p-3.5">
                        <div className="rounded-[34px] p-[1px] bg-gradient-to-r from-[#E73825]/45 to-[#9780FF]/65">
                          <div className="rounded-[33px] bg-[#14121A] px-5 py-4 flex items-center justify-center relative">
                            <button
                              type="button"
                              onClick={() => onNavigate('FULL_REPORT')}
                              className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-[#0C0B0C] text-white text-xs sm:text-sm font-semibold border border-white/15 transition shadow-[0_0_24px_rgba(123,92,224,0.3)]"
                            >
                              {t('Start Full Reading', 'पूर्ण रिपोर्ट खोल्नुहोस्')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orbiting Sacred Vector Nodes */}
                <span
                  aria-hidden="true"
                  className="absolute -top-1 left-7 w-8 h-8 rounded-full bg-[#241F2E] border border-white/15 flex items-center justify-center text-[#EDC5FC]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -translate-y-1/2 right-4 w-9 h-9 rounded-full bg-[#DDB5FC] text-[#0C0B0C] flex items-center justify-center shadow-lg"
                >
                  <Compass className="w-4 h-4" />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#221D2B] border border-[#DDB5FC]/40 flex items-center justify-center text-[#EDC5FC]"
                >
                  <SeedOfLifeMark size={18} />
                </span>
              </div>
            </div>

            {/* COLUMN 3: Split Top (Lavender Spline Forecast) & Bottom (Daily Patro Card) */}
            <div className="divide-y divide-white/10 flex flex-col justify-between">
              {/* Top Cell */}
              <div
                onClick={() => onNavigate('WHAT_HAPPENS_IF')}
                className="p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 cursor-pointer group"
              >
                <div className="relative w-full sm:w-44 shrink-0 rounded-2xl bg-[#15131C] border border-white/[0.08] p-3.5">
                  <span className="w-8 h-8 rounded-full bg-[#DDB5FC] text-[#0C0B0C] flex items-center justify-center mb-2">
                    <Scale className="w-4 h-4" />
                  </span>
                  <svg viewBox="0 0 160 82" className="w-full h-auto" aria-hidden="true">
                    {[18, 46, 74, 102, 130].map((x, idx) => {
                      const h = [34, 48, 42, 62, 54][idx];
                      return (
                        <rect
                          key={x}
                          x={x}
                          y={76 - h}
                          width="18"
                          height={h}
                          rx="5"
                          fill="rgba(255,255,255,0.07)"
                        />
                      );
                    })}
                    <path
                      d="M 10 64 Q 44 38, 72 44 T 148 16"
                      fill="none"
                      stroke="#9780FF"
                      strokeWidth="2"
                    />
                    <path
                      d="M 10 70 C 48 52, 86 58, 148 24"
                      fill="none"
                      stroke="#EDC5FC"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-medium text-white group-hover:text-[#EDC5FC] transition">
                    {t('20-Decision Muhurta Intelligence', '२० जीवन-निर्णय र शुभ साइत')}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed">
                    {t(
                      'Test contracts, investments, debt repayment, marriage, and travel across 12-day & 12-year curves.',
                      'सम्झौता, लगानी, ऋण मोचन, विवाह वा यात्राको १२-दिने र १२-वर्षे फलित रेखा जाँच्नुहोस्।'
                    )}
                  </p>
                </div>
              </div>

              {/* Bottom Cell */}
              <div
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'PANCHANG' })}
                className="p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 cursor-pointer group"
              >
                <div className="relative w-full sm:w-44 shrink-0 rounded-2xl bg-[#17151F] border border-white/[0.08] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold text-white tabular-nums leading-none">
                      {panchangReport.bikramSambat.ApproxGate}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#DDB5FC] text-[#0C0B0C] text-[10px] font-bold">
                      {t('B.S.', 'वि.सं.')}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/75 truncate">
                    {panchangReport.bikramSambat.formatted}
                  </div>
                  <div className="text-[11px] text-[#EDC5FC] font-medium truncate">
                    {trNakshatra(panchangReport.nakshatra.name, lang)} •{' '}
                    {trVara(panchangReport.vara.name, lang)}
                  </div>
                  <div className="pt-1 flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-full border border-[#DDB5FC]/45 text-[10px] text-[#EDC5FC]">
                      {panchangReport.sunriseTime}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      ● {t('Active', 'सक्रिय')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-medium text-white group-hover:text-[#EDC5FC] transition">
                    {t('Daily Nepali Patro & 28 Stars', 'दैनिक नेपाली पञ्चाङ्ग र २८ नक्षत्र')}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed">
                    {t(
                      'Live Bikram Sambat Tithi, Yoga, Karana, Rahu Kalam, and all 28 Nakshatras & 108 Padas.',
                      'विक्रम संवत् तिथि, नक्षत्र, योग, करण, राहुकाल र २८ नक्षत्रका १०८ चरणहरूको पूर्ण विवरण।'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6. DUAL IRIDESCENT COSMIC PRODUCT SHOWCASES ==================== */}
        <section id="sc-dossier" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-8 space-y-10 sm:space-y-14">
          {/* SHOWCASE 1: For Individuals — Live 5-Domain Life Blueprint Preview */}
          <div className="max-w-[1280px] mx-auto sc-card-iridescent sc-starfield p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            {/* Diagonal Cosmic Violet Beam */}
            <div className="pointer-events-none absolute -right-20 top-0 bottom-0 w-[440px] bg-gradient-to-tr from-[#4700D6]/35 via-[#7B5CE0]/25 to-transparent blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="text-sm font-medium text-[#9780FF]">
                  {t(
                    'For Individuals • 10-Chapter Commercial Life Dossier',
                    'व्यक्तिगत प्रयोजनका लागि • १०-अध्याय बृहत् जीवन दर्पण'
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-[-0.035em] text-white leading-[1.1]">
                  {t(
                    'Understand Your Complete Life Blueprint',
                    'आफ्नो सम्पूर्ण जीवन-नक्सा स्पष्ट र गहिराइमा बुझ्नुहोस्'
                  )}
                </h2>

                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {t(
                    'Go far beyond sun-sign horoscopes. Read plain-English + classical analyses of your Atmakaraka soul purpose, Dashamsha (D10) career authority, Indu Lagna wealth retention, Upapada & Darakaraka spouse portrait, Ayurvedic Prakriti constitution, Turning-Point Maturity Ages (16–48), live Saturn/Jupiter transits, and Vedic remedies.',
                    'सामान्य राशिफलभन्दा धेरै गहिरो अध्ययन: आत्मकारक जीवन-उद्देश्य, दशमांश (D10) करियर अधिकार, इन्दु लग्न र धन योग, उपपद लग्न र दाराकारक जीवनसाथी चित्रण, आयुर्वेदिक वात-पित्त-कफ प्रकृति, १६–४८ वर्षका ग्रह परिपक्वता मोड र वैदिक उपायहरू सरल भाषामा पढ्नुहोस्।'
                  )}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('FULL_REPORT')}
                    className="sc-btn-white text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('Read 10-Chapter Report', '१०-अध्याय रिपोर्ट पढ्नुहोस्')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pdfDownloading}
                    onClick={handleQuickPdf}
                    className="sc-btn-glass text-sm disabled:opacity-60"
                  >
                    <Download className="w-4 h-4 text-[#EDC5FC]" />
                    <span>
                      {pdfDownloading
                        ? t('Exporting PDF…', 'PDF बन्दैछ…')
                        : t('Download 17-Page PDF', '१७-पृष्ठ PDF डाउनलोड')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Live 5-Domain Scorecard Interactive Preview */}
              <div className="lg:col-span-6 rounded-3xl bg-[#12101A]/90 border border-white/15 p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.65)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#EDC5FC] font-semibold">
                      {t('Live 5-Domain Scorecard', 'तपाईंको ५-क्षेत्र जीवन स्कोरकार्ड')}
                    </div>
                    <div className="text-base font-semibold text-white">
                      {profile.firstName} {profile.lastName} •{' '}
                      <span className="text-white/65 text-sm font-normal">
                        {deepReport.wellnessBlueprint.dominantDosha}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#9780FF]/20 border border-[#DDB5FC]/40 text-xs font-semibold text-[#EDC5FC] tabular-nums">
                    {t(
                      `Age ${nextMaturityMilestone.maturityAge} (${nextMaturityMilestone.calendarYear})`,
                      `उमेर ${nextMaturityMilestone.maturityAge} (${nextMaturityMilestone.calendarYear})`
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  {deepReport.domainScorecard.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-medium text-white truncate">{item.title}</span>
                        <span className="font-bold text-[#EDC5FC] tabular-nums shrink-0">
                          {item.score}/100 · {item.verdictLabel}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          style={{ width: `${item.score}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#7B5CE0] via-[#9780FF] to-[#EDC5FC]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65 border-t border-white/10">
                  <span>
                    {t('Spouse Archetype:', 'दाराकारक ग्रह:')}{' '}
                    <strong className="text-white">
                      {deepReport.relationshipBlueprint.darakarakaPlanet}
                    </strong>{' '}
                    • {t('Wealth Sign:', 'इन्दु लग्न:')}{' '}
                    <strong className="text-white">
                      {deepReport.wealthBlueprint.induLagnaSign}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('FULL_REPORT')}
                    className="text-[#EDC5FC] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t('Inspect all 10 chapters', 'सबै १० अध्याय हेर्नुहोस्')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SHOWCASE 2: For Deep Seekers & Couples — 11-Module Observatory */}
          <div className="max-w-[1280px] mx-auto sc-card-iridescent sc-starfield p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            <div className="pointer-events-none absolute -left-20 top-0 bottom-0 w-[420px] bg-gradient-to-br from-[#E73825]/15 via-[#7B5CE0]/22 to-transparent blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-sm font-medium text-[#DDB5FC]">
                  {t(
                    'For Deep Seekers & Couples • Complete Observatory',
                    'गहिरो अध्ययन र जोडी मिलान • ११ विशेष स्टुडियो'
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.035em] text-white leading-[1.12]">
                  {t(
                    'Every Classical & Global Studio in One Place',
                    'कुण्डली मिलान, विश्व नक्सा र शास्त्रीय पुस्तकालय'
                  )}
                </h2>

                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {t(
                    'Switch effortlessly into the full sidebar Observatory to compare 36-Guna Ashtakoota partner compatibility, map your planetary lines across 80+ global cities, inspect 249 KP sub-lords, or read 9 classical treatises.',
                    '३६-गुण अष्टकूट विवाह मिलान, ८०+ विश्व सहरहरूको एस्ट्रोकार्टोग्राफी नक्सा, २५-वर्षे अंक-कलर चार्ट, २४९ केपी सब-लर्ड र ९ शास्त्रीय ग्रन्थहरू एउटै कार्यशालामा अध्ययन गर्नुहोस्।'
                  )}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                    className="sc-btn-white text-sm"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t('Launch Observatory', 'वेधशाला खोल्नुहोस्')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNASTRY' })}
                    className="sc-btn-glass text-sm"
                  >
                    <HeartHandshake className="w-4 h-4 text-[#EDC5FC]" />
                    <span>{t('36-Guna Compatibility', '३६-गुण विवाह मिलान')}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: <Compass className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('Vedic Kundali, D9 & SAV', 'वैदिक कुण्डली, नवांश र अष्टकवर्ग'),
                    sub: t('North/South styles + 337 bindu chart', 'उत्तर/दक्षिण शैली र ३३७ बिन्दु'),
                    onClick: () => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' }),
                  },
                  {
                    icon: <HeartHandshake className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('36-Guna Partner Synastry', '३६-गुण अष्टकूट विवाह मिलान'),
                    sub: t('8-Koota compatibility + dual wheel', '८-कूट गुण मिलान र द्वि-चक्र'),
                    onClick: () => onNavigate('OBSERVATORY', { studioTab: 'SYNASTRY' }),
                  },
                  {
                    icon: <Globe className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('World Relocation Map', 'विश्व एस्ट्रोकार्टोग्राफी नक्सा'),
                    sub: t('Career, wealth & peace lines worldwide', 'तपाईंका लागि फाप्ने विश्वका सहर'),
                    onClick: () => onNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
                  },
                  {
                    icon: <Hash className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('25-Year Color Numerology', '२५-वर्षे अंक र कलर चार्ट'),
                    sub: t('Pythagorean & Chaldean cycles', 'मूलांक, भाग्यांक र व्यक्तिगत वर्ष'),
                    onClick: () => onNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' }),
                  },
                  {
                    icon: <Sparkles className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('28 Birth Stars & 108 Padas', '२८ जन्म नक्षत्र र १०८ चरण'),
                    sub: t('Deities, Shaktis, remedies & padas', 'देवता, शक्ति, मन्त्र र चरण फल'),
                    onClick: () => onNavigate('NAKSHATRAS'),
                  },
                  {
                    icon: <BookOpen className="w-4 h-4 text-[#EDC5FC]" />,
                    title: t('9 Classical Astrology Books', '९ शास्त्रीय ज्योतिष ग्रन्थ'),
                    sub: t('BPHS, Phaladeepika, Saravali & more', 'पाराशर, फलदीपिका र सारावली'),
                    onClick: () => onNavigate('CANON'),
                  },
                ].map((tile) => (
                  <button
                    key={tile.title}
                    type="button"
                    onClick={tile.onClick}
                    className="text-left rounded-2xl bg-[#14121C]/90 hover:bg-[#1D1929] border border-white/12 hover:border-[#DDB5FC]/50 p-4 transition flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#9780FF]/15 border border-[#DDB5FC]/30 flex items-center justify-center shrink-0">
                          {tile.icon}
                        </span>
                        <span className="text-sm font-semibold text-white group-hover:text-[#EDC5FC] transition truncate">
                          {tile.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 pl-9">{tile.sub}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#EDC5FC] shrink-0 mt-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== 7. MONUMENTAL STARFIELD CLOSING CTA & NEBULA FOOTER ==================== */}
      <footer className="sc-starfield sc-nebula-footer border-t border-white/10 pt-16 sm:pt-20 pb-10 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto space-y-12 relative z-10">
          {/* Top Split Closing CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium text-white/55">
                {t(
                  'Live Consciously • Act on Sacred Time',
                  'सचेत जीवन • शुभ समयमा सही कदम'
                )}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('FULL_REPORT')}
                className="text-2xl sm:text-4xl font-scDisplay font-medium tracking-[-0.03em] text-white/85 hover:text-white transition text-left"
              >
                {t('Read your 10-chapter dossier →', 'आफ्नो १०-अध्याय जीवन दर्पण पढ्नुहोस् →')}
              </button>
            </div>

            <div className="space-y-3 lg:text-right">
              <div className="text-base sm:text-lg font-medium text-white/85">
                {t('Upgrade Your Cosmic Clarity', 'आफ्नो जीवन-दिशा स्पष्ट पार्नुहोस्')}
              </div>
              <div className="flex flex-wrap lg:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('FULL_REPORT')}
                  className="sc-btn-white text-sm"
                >
                  <span>{t('Open Personal Report', 'व्यक्तिगत रिपोर्ट')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('HORAI')}
                  className="sc-btn-glass text-sm"
                >
                  <span>{t('24h Horai Clock', '२४-घण्टा होरा घडी')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clean Navigation Row */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-white/65">
            <button
              type="button"
              onClick={() => onNavigate('FULL_REPORT')}
              className="hover:text-white transition"
            >
              {t('10-Chapter Report & PDF', '१०-अध्याय रिपोर्ट र PDF')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('HORAI')}
              className="hover:text-white transition"
            >
              {t('24-Petal Horai Clock', '२४-पत्रे होरा घडी')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('WHAT_HAPPENS_IF')}
              className="hover:text-white transition"
            >
              {t('20-Decision Best Dates', '२० जीवन-निर्णय शुभ साइत')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' })}
              className="hover:text-white transition"
            >
              {t('Vedic Kundali & SAV', 'वैदिक कुण्डली र अष्टकवर्ग')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('NAKSHATRAS')}
              className="hover:text-white transition"
            >
              {t('28 Birth Stars', '२८ जन्म नक्षत्र')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('CANON')}
              className="hover:text-white transition"
            >
              {t('9 Classical Books', '९ शास्त्रीय ग्रन्थ')}
            </button>
          </div>

          {/* Monumental Edge-to-Edge Uppercase Horizon Wordmark */}
          <div className="pt-4 border-t border-white/10 text-center select-none">
            <div className="font-scDisplay font-semibold text-[clamp(2.6rem,11.5vw,9.8rem)] leading-[0.88] tracking-[-0.04em] bg-gradient-to-b from-white/70 via-white/40 to-white/10 bg-clip-text text-transparent">
              OCEANOLOGY
            </div>
          </div>

          {/* Bottom Legal / Privacy Trust Line */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
            <span>
              © {new Date().getFullYear()} Oceanology •{' '}
              {t(
                '100% Client-Side Ephemeris & Private Birth Calculations',
                '१००% ब्राउजरभित्रै सुरक्षित र गोप्य कुण्डली गणना'
              )}
            </span>
            <span>
              {t(
                'Lahiri Sidereal • Tropical • Graha Horai • 8 Classical Canons',
                'लाहिरी निरयन • सायन • ग्रह होरा • ८ शास्त्रीय ग्रन्थ'
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
