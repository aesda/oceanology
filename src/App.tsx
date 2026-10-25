import { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Sun,
  Moon,
  Calendar,
  Hash,
  Globe,
  Sliders,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  BookOpen,
  HeartHandshake,
  Scale,
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  ArrowLeft,
  Activity,
  Download,
  FileText,
  Type,
} from 'lucide-react';
import {
  AyanamshaMode,
  BirthProfile,
  DEFAULT_PROFILE,
  HouseSystem,
  NumerologySystem,
  PARTNER_DEFAULT_PROFILE,
} from './types/oceanology';
import { calculateNatalChart, ZODIAC_SIGNS } from './engines/astronomyEngine';
import { calculateVedicReport } from './engines/vedicEngine';
import { calculatePanchang } from './engines/panchangEngine';
import { calculateNumerology } from './engines/numerologyEngine';
import { generateCosmicSynthesis } from './engines/synthesisEngine';
import { gregorianToBikramSambat } from './engines/locationAtlas';
import { downloadDetailedPdfReport } from './engines/pdfReportGenerator';
import { PLANET_TREATISES } from './data/classicalCompendium';
import {
  AppLanguage,
  buildLocalizedPersonalSummary,
  formatCityForLang,
  LanguageProvider,
  LanguageSwitchButton,
  trDashaGuide,
  trDignity,
  trHoraiDisplay,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trSign,
  useLanguage,
} from './i18n/i18n';
import {
  LandingPage,
  ObservatoryStudioTab,
  SeedOfLifeMark,
  WebsiteDestination,
} from './components/LandingPage';
import { PersonalReportReader } from './components/PersonalReportReader';
import { HoraiAndTimeStudio } from './components/HoraiAndTimeStudio';
import { NakshatraEncyclopedia } from './components/NakshatraEncyclopedia';
import { ActionConsequenceLab } from './components/ActionConsequenceLab';
import { NatalWheelSvg } from './components/NatalWheelSvg';
import { VedicKundliSvg } from './components/VedicKundliSvg';
import { DecozColorChart } from './components/DecozColorChart';
import { PanchangDashboard } from './components/PanchangDashboard';
import { ResearchAndSynastryLab } from './components/ResearchAndSynastryLab';
import { GlobalLocationPicker } from './components/GlobalLocationPicker';
import { AstrocartographyWorldMap } from './components/AstrocartographyWorldMap';
import { ClassicalBookLibrary } from './components/ClassicalBookLibrary';
import {
  BenchmarkBarChart,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
  WorkspacePageHeader,
} from './components/ui/DashboardPrimitives';
import {
  FloatingPetalsBackdrop,
  InteractivePetalBurst,
  SacredFlowerIcon,
} from './components/ui/FloralAnimations';

export function App({ initialLang }: { initialLang?: AppLanguage } = {}) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <AppWorkspace />
    </LanguageProvider>
  );
}

function AppWorkspace() {
  const { lang, t } = useLanguage();
  const [profile, setProfile] = useState<BirthProfile>(DEFAULT_PROFILE);
  const [partnerProfile, setPartnerProfile] = useState<BirthProfile>(PARTNER_DEFAULT_PROFILE);
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>('LAHIRI');
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('PLACIDUS');
  const [numSystem, setNumSystem] = useState<NumerologySystem>('PYTHAGOREAN');
  const [minuteShift, setMinuteShift] = useState<number>(0);

  // Primary Route (HOME = Landing Page; others = Left-Sidebar Workspace)
  const [activeDest, setActiveDest] = useState<WebsiteDestination>('HOME');
  const [studioTab, setStudioTab] = useState<ObservatoryStudioTab>('SYNTHESIS');

  // Deep-link states
  const [targetNakIdx, setTargetNakIdx] = useState<number | undefined>(undefined);
  const [targetActionId, setTargetActionId] = useState<string | undefined>(undefined);
  const [targetBookId, setTargetBookId] = useState<string | undefined>(undefined);

  // Progressive disclosure tabs inside Overview, Natal & Vedic views
  const [synthesisSubTab, setSynthesisSubTab] = useState<
    'OVERVIEW' | 'TIMELINE_12YR' | 'DOSSIER_QA'
  >('OVERVIEW');
  const [westernSubTab, setWesternSubTab] = useState<'ASPECTS' | 'SABIAN'>('ASPECTS');
  const [vedicSubTab, setVedicSubTab] = useState<
    'DASHA' | 'ASHTAKAVARGA_JAIMINI' | 'KP_SUBLORDS'
  >('DASHA');

  // UI Shell, Floral Animations & Reading Comfort states
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [expandedDashaLord, setExpandedDashaLord] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('oceanology_dark_mode');
        return window.localStorage.getItem('oceanology_cosmic_theme_v2') !== 'daylight';
      } catch {
        return true;
      }
    }
    return true;
  });
  const [floralMotion, setFloralMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem('oceanology_floral_motion') !== '0';
      } catch {
        return true;
      }
    }
    return true;
  });
  const [liveClockDate, setLiveClockDate] = useState<Date>(() => new Date());
  const [largeText, setLargeText] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem('oceanology_large_text') === '1';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [pdfExporting, setPdfExporting] = useState<boolean>(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveClockDate(new Date());
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('oceanology_floral_motion', floralMotion ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  }, [floralMotion]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      window.localStorage.removeItem('oceanology_dark_mode');
      window.localStorage.setItem('oceanology_cosmic_theme_v2', darkMode ? 'cosmic' : 'daylight');
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) root.classList.add('font-large');
    else root.classList.remove('font-large');
    try {
      window.localStorage.setItem('oceanology_large_text', largeText ? '1' : '0');
    } catch {
      // ignore storage errors in private mode
    }
  }, [largeText]);

  // Keyboard Escape handler for modal & mobile drawer
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setShowProfileModal(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavigate = (
    dest: WebsiteDestination,
    subTarget?: {
      nakIdx?: number;
      actionId?: string;
      studioTab?: ObservatoryStudioTab;
      bookId?: string;
    }
  ) => {
    if (subTarget?.nakIdx !== undefined) setTargetNakIdx(subTarget.nakIdx);
    if (subTarget?.actionId !== undefined) setTargetActionId(subTarget.actionId);
    if (subTarget?.studioTab !== undefined) setStudioTab(subTarget.studioTab);
    if (subTarget?.bookId !== undefined) setTargetBookId(subTarget.bookId);
    setActiveDest(dest);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const natalChart = useMemo(
    () => calculateNatalChart(profile, ayanamsha, houseSystem, minuteShift),
    [profile, ayanamsha, houseSystem, minuteShift]
  );

  const partnerChart = useMemo(
    () => calculateNatalChart(partnerProfile, ayanamsha, houseSystem, 0),
    [partnerProfile, ayanamsha, houseSystem]
  );

  const vedicReport = useMemo(
    () => calculateVedicReport(profile, natalChart),
    [profile, natalChart]
  );

  const panchangReport = useMemo(() => {
    const moon = natalChart.planets.find((p) => p.id === 'Moon')!;
    return calculatePanchang(liveClockDate, profile.location, moon.nakshatraIndex, moon.signIndex);
  }, [liveClockDate, profile.location, natalChart]);

  const numerologyReport = useMemo(
    () => calculateNumerology(profile, numSystem),
    [profile, numSystem]
  );

  const synthesisReport = useMemo(
    () =>
      generateCosmicSynthesis(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport]
  );

  const plainSummary = useMemo(
    () =>
      buildLocalizedPersonalSummary(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        lang
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, synthesisReport, lang]
  );

  const birthBsDate = useMemo(
    () => gregorianToBikramSambat(profile.year, profile.month, profile.day),
    [profile.year, profile.month, profile.day]
  );

  const totalSavBindus = useMemo(
    () => vedicReport.sarvashtakavarga.reduce((acc, s) => acc + s.bindus, 0),
    [vedicReport.sarvashtakavarga]
  );

  const savByHouse = useMemo(
    () => [...vedicReport.sarvashtakavarga].sort((a, b) => a.house - b.house),
    [vedicReport.sarvashtakavarga]
  );

  const topSavHouse = useMemo(
    () => [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0],
    [vedicReport.sarvashtakavarga]
  );

  const savBarItems = useMemo(
    () =>
      savByHouse.map((h) => ({
        id: `H${h.house}`,
        label: lang === 'ne' ? `भा${h.house}` : `H${h.house}`,
        sublabel: lang === 'ne' ? trSign(h.signName, 'ne') : h.signName.slice(0, 3),
        value: h.bindus,
      })),
    [savByHouse, lang]
  );

  const sunPlanet = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const atmakaraka = vedicReport.charaKarakas[0];
  const activeHoraiDisp = useMemo(
    () => trHoraiDisplay(panchangReport.activeHorai, lang),
    [panchangReport.activeHorai, lang]
  );
  const cityDisplay = useMemo(
    () => formatCityForLang(profile.location.name, lang),
    [profile.location.name, lang]
  );

  const isSampleProfile =
    profile.firstName === DEFAULT_PROFILE.firstName &&
    profile.lastName === DEFAULT_PROFILE.lastName &&
    profile.year === DEFAULT_PROFILE.year;

  const formatUtcOffset = (hrs: number) => {
    const sign = hrs >= 0 ? '+' : '-';
    const abs = Math.abs(hrs);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleGlobalDownloadPdf = async () => {
    try {
      setPdfExporting(true);
      await downloadDetailedPdfReport({
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        ayanamsha,
        houseSystem,
      });
    } finally {
      setPdfExporting(false);
    }
  };

  // ==================== MODE 1: COSMIC SUPERCONSCIOUS LANDING PAGE ====================
  if (activeDest === 'HOME') {
    return (
      <>
        <InteractivePetalBurst enabled={floralMotion} />
        <LandingPage
          profile={profile}
          onProfileChange={setProfile}
          natalChart={natalChart}
          vedicReport={vedicReport}
          panchangReport={panchangReport}
          numerologyReport={numerologyReport}
          synthesisReport={synthesisReport}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          largeText={largeText}
          onToggleLargeText={() => setLargeText(!largeText)}
          floralMotion={floralMotion}
          onToggleFloralMotion={() => setFloralMotion(!floralMotion)}
          onDownloadPdf={handleGlobalDownloadPdf}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // ==================== MODE 2: UNIFIED LEFT-SIDEBAR WORKSPACE SHELL ====================
  const sidebarGroups: {
    groupLabel: string;
    items: {
      key: string;
      label: string;
      badgeText?: string;
      icon: JSX.Element;
      isActive: boolean;
      onClick: () => void;
    }[];
  }[] = [
    {
      groupLabel: t('Personal Reading & Time', 'व्यक्तिगत फलादेश र समय'),
      items: [
        {
          key: 'easy-report',
          label: t('Easy Report & PDF', 'सरल रिपोर्ट र PDF'),
          icon: <FileText className="w-4 h-4" />,
          isActive: activeDest === 'FULL_REPORT',
          onClick: () => handleNavigate('FULL_REPORT'),
        },
        {
          key: 'horai-clock',
          label: t('Live Horai & Time', 'प्रत्यक्ष होरा र समय'),
          badgeText: activeHoraiDisp.lordLabel,
          icon: (
            <SacredFlowerIcon
              variety={panchangReport.activeHorai.sacredFlower.variety}
              primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
              secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
              size={17}
              animated={floralMotion}
            />
          ),
          isActive: activeDest === 'HORAI',
          onClick: () => handleNavigate('HORAI'),
        },
        {
          key: 'overview',
          label: t('Dashboard Overview', 'ड्यासबोर्ड सारांश'),
          icon: <Compass className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'SYNTHESIS',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' }),
        },
        {
          key: 'action-timing',
          label: t('Best Dates & Timing', 'शुभ मिति र साइत'),
          icon: <Scale className="w-4 h-4" />,
          isActive: activeDest === 'WHAT_HAPPENS_IF',
          onClick: () => handleNavigate('WHAT_HAPPENS_IF'),
        },
        {
          key: 'panchang',
          label: t('Daily Panchang', 'दैनिक पञ्चाङ्ग र पात्रो'),
          icon: <Calendar className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'PANCHANG',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'PANCHANG' }),
        },
      ],
    },
    {
      groupLabel: t('Charts & Analytics', 'कुण्डली र विश्लेषण'),
      items: [
        {
          key: 'natal-wheel',
          label: t('Natal Sky & Planets', 'जन्म आकाश र ग्रह स्थिति'),
          icon: <Sun className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'WESTERN',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'WESTERN' }),
        },
        {
          key: 'vedic-sav',
          label: t('Vedic Kundali & SAV', 'वैदिक कुण्डली र अष्टकवर्ग'),
          icon: <Moon className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'VEDIC_KP',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' }),
        },
        {
          key: 'world-map',
          label: t('World Relocation', 'विश्व स्थान र नक्सा'),
          icon: <Globe className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'ASTROCARTOGRAPHY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
        },
        {
          key: 'compatibility',
          label: t('Compatibility', 'विवाह गुण मिलान'),
          icon: <HeartHandshake className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'SYNASTRY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'SYNASTRY' }),
        },
        {
          key: 'numerology',
          label: t('Numerology', 'अंक ज्योतिष र रङ्ग'),
          icon: <Hash className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'NUMEROLOGY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' }),
        },
      ],
    },
    {
      groupLabel: t('Reference Guides', 'सन्दर्भ ग्रन्थ र विश्वकोश'),
      items: [
        {
          key: 'nakshatras',
          label: t('28 Birth Stars', '२८ जन्म नक्षत्र'),
          icon: <Sparkles className="w-4 h-4" />,
          isActive: activeDest === 'NAKSHATRAS',
          onClick: () => handleNavigate('NAKSHATRAS'),
        },
        {
          key: 'library',
          label: t('Classical Library', 'शास्त्रीय ग्रन्थ पुस्तकालय'),
          icon: <BookOpen className="w-4 h-4" />,
          isActive: activeDest === 'CANON',
          onClick: () => handleNavigate('CANON'),
        },
      ],
    },
  ];

  const allWorkspaceModules = sidebarGroups.flatMap((g) => g.items);
  const currentViewLabel =
    allWorkspaceModules.find((it) => it.isActive)?.label || t('Overview', 'सारांश');

  const MobileDrawerNavContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-5">
        {/* Brand Header — Unified Superconscious Seed-of-Life & Wordmark */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            onClick={() => handleNavigate('HOME')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--accent-bg)] border border-[var(--border-strong)] flex items-center justify-center shadow-[0_0_20px_rgba(151,128,255,0.22)] shrink-0">
              <SeedOfLifeMark size={24} animated={floralMotion} tone="adaptive" />
            </div>
            <div>
              <div className="font-scDisplay font-semibold text-[18px] tracking-[-0.04em] text-[var(--text)] leading-none">
                oceanology
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 tracking-tight">
                {t('Cosmic Jyotish & Horai', 'ज्योतिष र होरा')}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="ui-toolbar-icon-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Quick Language & Reading Comfort Controls inside Drawer */}
        <div className="px-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {t('Language', 'भाषा छनोट')}
            </span>
            <LanguageSwitchButton />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFloralMotion(!floralMotion)}
              className={`flex-1 ui-toolbar-btn ${floralMotion ? 'ui-toolbar-btn-active' : ''}`}
            >
              <SacredFlowerIcon
                variety="lotus"
                primaryHex="#EC4899"
                secondaryHex="#FBCFE8"
                size={15}
                animated={floralMotion}
              />
              <span>{t('Cosmic Motion', 'कस्मिक गति')}</span>
            </button>
            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              className={`flex-1 ui-toolbar-btn ${largeText ? 'ui-toolbar-btn-active' : ''}`}
            >
              <Type className="w-4 h-4" />
              <span>{largeText ? t('Large On', 'ठूलो अक्षर') : t('Large Text', 'अक्षर आकार')}</span>
            </button>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <nav data-workspace-nav="drawer" className="space-y-4" aria-label="Mobile workspace modules">
          {sidebarGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <div className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {group.groupLabel}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13.5px] font-medium border transition ${
                    item.isActive
                      ? 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--border-strong)] font-semibold shadow-[0_0_20px_rgba(123,92,224,0.18)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeText && (
                    <span className="px-1.5 py-0.5 obs-badge-brass text-[10.5px] font-semibold shrink-0">
                      {item.badgeText}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Drawer Bottom Natal Card + PDF Quick Download + Back */}
      <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setShowProfileModal(true);
          }}
          className="w-full p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] text-left transition space-y-1"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-[var(--text)] truncate">
              {profile.firstName} {profile.lastName}
            </span>
            <Sliders className="w-4 h-4 text-[var(--accent)] shrink-0" />
          </div>
          <div className="text-xs text-[var(--text-muted)] truncate">
            {lang === 'ne'
              ? `${trSign(natalChart.ascendant.signName, 'ne')} लग्न • ${trNakshatra(moonPlanet.nakshatraName, 'ne')}`
              : `${natalChart.ascendant.signName} Rising • ${moonPlanet.nakshatraName}`}
          </div>
        </button>

        <button
          type="button"
          disabled={pdfExporting}
          onClick={handleGlobalDownloadPdf}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl btn-editorial-primary text-sm disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>
            {pdfExporting
              ? t('Building PDF…', 'PDF बन्दैछ…')
              : t('Download PDF Report', 'PDF रिपोर्ट डाउनलोड')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('HOME')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Cosmic Home', 'मुख्य पृष्ठमा फर्कनुहोस्')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`sc-workspace-shell min-h-screen flex flex-col text-[var(--text)] relative ${
        floralMotion ? '' : 'sc-motion-off'
      }`}
    >
      <FloatingPetalsBackdrop enabled={floralMotion && !darkMode} />
      <InteractivePetalBurst enabled={floralMotion} />

      {/* ==================== MOBILE / COMPACT SLIDE-OVER COSMIC DRAWER ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[290px] max-w-[86vw] bg-[var(--bg-elevated)]/95 backdrop-blur-2xl border-r border-[var(--border-strong)] h-full overflow-y-auto z-10 shadow-[0_24px_64px_rgba(0,0,0,0.75)]">
            <MobileDrawerNavContent />
          </aside>
        </div>
      )}

      {/* ==================== FLOATING CENTER-PILL FROSTED GLASS NAVBAR (1:1 WITH LANDING) ==================== */}
      <header className="sticky top-3 sm:top-5 z-40 px-3 sm:px-6 pointer-events-none no-print">
        <div className="sc-workspace-pill pointer-events-auto max-w-[96vw] w-fit mx-auto rounded-2xl px-2.5 sm:px-4 py-2 flex items-center gap-2 sm:gap-3.5">
          {/* Left: Mobile Drawer Button + Seed-of-Life Home Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden ui-toolbar-icon-btn w-[34px] h-[34px] rounded-xl shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('HOME')}
              className="flex items-center gap-2 text-left shrink-0 group"
              aria-label="Back to Oceanology Cosmic Home"
              title={t('Back to Cosmic Landing Page', 'मुख्य पृष्ठमा फर्कनुहोस्')}
            >
              <SeedOfLifeMark size={28} animated={floralMotion} tone="adaptive" />
              <span className="hidden sm:inline font-scDisplay font-semibold text-base tracking-[-0.03em] text-[var(--text)] group-hover:text-[var(--accent)] transition">
                oceanology
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] font-medium text-[var(--text-secondary)] group-hover:border-[var(--border-strong)] group-hover:text-[var(--text)] transition">
                <ArrowLeft className="w-3 h-3" />
                <span>{t('Home', 'गृह')}</span>
              </span>
            </button>
          </div>

          {/* Center: Live Horai Pill + Birth Profile & Sydney Observatory Pill */}
          <div className="hidden lg:flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => handleNavigate('HORAI')}
              title={t('Open Live 24-Petal Horai Sacred Clock', 'प्रत्यक्ष २४-घण्टा होरा चक्र खोल्नुहोस्')}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-xl bg-[var(--accent-bg)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition tabular-nums whitespace-nowrap shrink-0"
            >
              <SacredFlowerIcon
                variety={panchangReport.activeHorai.sacredFlower.variety}
                primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                size={15}
                animated={floralMotion}
              />
              <span>{activeHoraiDisp.horaiName}</span>
              <span className="text-[var(--accent)] font-bold tabular-nums">
                • {panchangReport.activeHorai.minutesRemaining}
                {t('m', ' मि.')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              aria-label="Edit birth profile and location"
              title={t('Edit birth profile and location', 'जन्म विवरण र स्थान सच्याउनुहोस्')}
              className="ui-toolbar-btn h-[34px] rounded-xl px-2.5 sm:px-3"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="text-[var(--text)]">
                {profile.firstName} • {cityDisplay}
              </span>
              {isSampleProfile && (
                <span className="hidden 2xl:inline text-[11px] text-[var(--accent)] font-semibold">
                  • {t('Edit', 'सच्याउनुहोस्')}
                </span>
              )}
            </button>

            <select
              aria-label="Zodiac Ayanamsha mode"
              value={ayanamsha}
              onChange={(e) => setAyanamsha(e.target.value as AyanamshaMode)}
              className="hidden 2xl:block h-[34px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition cursor-pointer"
            >
              <option value="LAHIRI">Lahiri Sidereal</option>
              <option value="TROPICAL">Tropical (0°)</option>
              <option value="KP_NEW">KP New</option>
              <option value="KP_OLD">KP Old</option>
              <option value="RAMAN">B.V. Raman</option>
              <option value="KHULLAR">KP Khullar</option>
            </select>
          </div>

          {/* Right: Bilingual Switch, Motion, Aa, Theme & White Pill PDF CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitchButton />

            <button
              type="button"
              onClick={() => setFloralMotion(!floralMotion)}
              aria-label="Toggle cosmic orbital motion"
              title={t('Toggle cosmic animations', 'कस्मिक एनिमेसन अन/अफ')}
              className={`hidden xl:inline-flex ui-toolbar-icon-btn w-[34px] h-[34px] rounded-xl ${
                floralMotion ? 'ui-toolbar-btn-active' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              aria-label="Toggle larger text size"
              title={t('Toggle larger reading text', 'ठूलो अक्षर आकार')}
              className={`hidden md:inline-flex ui-toolbar-btn h-[34px] rounded-xl px-2.5 ${
                largeText ? 'ui-toolbar-btn-active' : ''
              }`}
            >
              <span>{largeText ? t('Aa+', 'ठूलो') : 'Aa'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle color theme"
              title={t('Switch Cosmic Dark and Daylight reading theme', 'डार्क र लाइट मोड बदल्नुहोस्')}
              className="ui-toolbar-icon-btn w-[34px] h-[34px] rounded-xl"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              disabled={pdfExporting}
              onClick={handleGlobalDownloadPdf}
              aria-label="Download PDF Report"
              className="ui-toolbar-cta h-[34px] rounded-xl px-2.5 sm:px-3.5 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {pdfExporting ? t('Building…', 'बन्दैछ…') : t('PDF Report', 'PDF रिपोर्ट')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== CENTERED FLOATING COSMIC MODULE DOCK ==================== */}
      <div className="hidden lg:block px-4 sm:px-6 pt-3.5 relative z-20 no-print">
        <nav
          data-workspace-nav="desktop"
          aria-label="Workspace modules"
          className="sc-module-dock max-w-[1180px] mx-auto rounded-2xl p-2 flex flex-wrap items-center justify-center gap-1.5"
        >
          {allWorkspaceModules.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              aria-current={item.isActive ? 'page' : undefined}
              className={`sc-module-pill ${item.isActive ? 'sc-module-pill-active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badgeText && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--border-strong)] text-[10px] font-semibold text-[var(--accent)] leading-none">
                  {item.badgeText}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Compact Mobile / Tablet Active Module Switcher Pill */}
      <div className="lg:hidden px-3 sm:px-6 pt-2.5 relative z-20 no-print">
        <div className="sc-module-dock max-w-[96vw] mx-auto rounded-2xl px-3 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleNavigate('HOME')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('Home', 'गृह')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] truncate"
          >
            <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0" />
            <span className="truncate">{cityDisplay}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--accent)] min-w-0 max-w-[56%]"
          >
            <span className="truncate">{currentViewLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* ==================== CHOREOGRAPHED CENTERED COSMIC STAGE ==================== */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <main
          key={`${activeDest}-${studioTab}`}
          className="sc-view-enter flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 max-w-[1240px] w-full mx-auto"
        >
          {/* ==================== ROUTE: EASY PERSONAL REPORT & PDF ==================== */}
          {activeDest === 'FULL_REPORT' && (
            <PersonalReportReader
              profile={profile}
              natalChart={natalChart}
              vedicReport={vedicReport}
              panchangReport={panchangReport}
              numerologyReport={numerologyReport}
              synthesisReport={synthesisReport}
              ayanamsha={ayanamsha}
              houseSystem={houseSystem}
              onEditProfile={() => setShowProfileModal(true)}
              onOpenActionTiming={(actId) =>
                handleNavigate('WHAT_HAPPENS_IF', actId ? { actionId: actId } : undefined)
              }
              onOpenHoraiStudio={() => handleNavigate('HORAI')}
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          )}

          {/* ==================== ROUTE: LIVE HORAI & SACRED CLOCK ==================== */}
          {activeDest === 'HORAI' && (
            <HoraiAndTimeStudio
              location={profile.location}
              natalMoonNakshatraIdx={moonPlanet.nakshatraIndex}
              natalMoonSignIdx={moonPlanet.signIndex}
              onOpenActionSimulator={(actId) =>
                handleNavigate('WHAT_HAPPENS_IF', actId ? { actionId: actId } : undefined)
              }
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          )}

          {/* ==================== ROUTE: 28 NAKSHATRAS ==================== */}
          {activeDest === 'NAKSHATRAS' && (
            <NakshatraEncyclopedia
              chart={natalChart}
              initialNakshatraIndex={targetNakIdx}
              onOpenActionSimulator={() => handleNavigate('WHAT_HAPPENS_IF')}
            />
          )}

          {/* ==================== ROUTE: ACTION TIMING ==================== */}
          {activeDest === 'WHAT_HAPPENS_IF' && (
            <ActionConsequenceLab
              chart={natalChart}
              location={profile.location}
              initialActionId={targetActionId}
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          )}

          {/* ==================== ROUTE: SOURCE LIBRARY ==================== */}
          {activeDest === 'CANON' && (
            <ClassicalBookLibrary
              chart={natalChart}
              vedic={vedicReport}
              initialBookId={targetBookId}
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          )}

          {/* ==================== ROUTE: OBSERVATORY MODULES ==================== */}
          {activeDest === 'OBSERVATORY' && (
            <>
              {/* 1. OVERVIEW & CONCORDANCE */}
              {studioTab === 'SYNTHESIS' && (
                <div className="space-y-6">
                  {/* Page Header */}
                  <WorkspacePageHeader
                    title={t(
                      `${profile.firstName} ${profile.lastName} — Personal Overview`,
                      `${profile.firstName} ${profile.lastName} — व्यक्तिगत कुण्डली सारांश`
                    )}
                    subtitle={
                      lang === 'ne'
                        ? `${natalChart.ascendant.signSymbol} ${trSign(natalChart.ascendant.signName, 'ne')} लग्न (${natalChart.ascendant.formattedDMS}) • जन्म नक्षत्र: ${trNakshatra(moonPlanet.nakshatraName, 'ne')} (चरण ${moonPlanet.nakshatraPada}) • वि.सं. ${birthBsDate.formattedNp}`
                        : `${natalChart.ascendant.signSymbol} ${natalChart.ascendant.signName} Rising (${natalChart.ascendant.formattedDMS}) • Birth Star: ${moonPlanet.nakshatraName} (Pada ${moonPlanet.nakshatraPada}) • Nepali B.S. ${birthBsDate.formattedEn}`
                    }
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => handleNavigate('FULL_REPORT')}
                          className="btn-editorial-primary text-sm inline-flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{t('Read Easy Report & PDF', 'सरल रिपोर्ट र PDF पढ्नुहोस्')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNavigate('WHAT_HAPPENS_IF')}
                          className="btn-editorial-secondary text-sm inline-flex items-center gap-2"
                        >
                          <Scale className="w-4 h-4 text-[var(--accent)]" />
                          <span>{t('Check Best Dates', 'शुभ साइत जाँच्नुहोस्')}</span>
                        </button>
                      </>
                    }
                  />

                  {/* Row 1: 4 Contextual KPI Stat Cards with Plain-English / Nepali Hints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label={t('Overall Chart Alignment', 'समग्र कुण्डली सामञ्जस्य')}
                      value={`${synthesisReport.overallResonanceScore}/100`}
                      plainHint={t(
                        'Combined harmony across Western, Vedic, Panchang & Numerology',
                        'वैदिक, पाश्चात्य, पञ्चाङ्ग र अंक ज्योतिषको संयुक्त तालमेल'
                      )}
                      benchmarkText={
                        lang === 'ne'
                          ? synthesisReport.overallResonanceScore >= 75
                            ? 'उच्च ग्रह सामञ्जस्य'
                            : 'सन्तुलित ग्रह सामञ्जस्य'
                          : synthesisReport.resonanceTier
                      }
                      status={{
                        tone:
                          synthesisReport.overallResonanceScore >= 75 ? 'optimal' : 'favorable',
                        label: t('Strong Alignment', 'उच्च तालमेल'),
                      }}
                      icon={<Activity className="w-4 h-4" />}
                      actionLabel={t('Read full personal report', 'पूर्ण रिपोर्ट पढ्नुहोस्')}
                      onAction={() => handleNavigate('FULL_REPORT')}
                    />

                    <KpiStatCard
                      label={t('Current Life Chapter (Dasha)', 'हालको जीवन दशा अध्याय')}
                      value={`${trPlanet(vedicReport.activeMahadasha.lord, lang)} – ${trPlanet(vedicReport.activeAntardasha.lord, lang)}`}
                      plainHint={trDashaGuide(vedicReport.activeMahadasha.lord, lang).chapterTitle}
                      benchmarkText={t(
                        `${vedicReport.activeMahadasha.progressPercent}% of ${vedicReport.activeMahadasha.years}y cycle`,
                        `${vedicReport.activeMahadasha.years}-वर्षे चक्रको ${vedicReport.activeMahadasha.progressPercent}% पूरा`
                      )}
                      status={{
                        tone: 'info',
                        label: t(
                          `Until ${vedicReport.activeMahadasha.endDate}`,
                          `${vedicReport.activeMahadasha.endDate} सम्म`
                        ),
                      }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel={t('Explore full life timeline', 'दशा समयरेखा हेर्नुहोस्')}
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label={t('Strongest Life Area', 'सबैभन्दा बलियो भाव')}
                      value={t(`House ${topSavHouse.house}`, `भाव ${topSavHouse.house}`)}
                      subvalue={t(`${topSavHouse.bindus} pts`, `${topSavHouse.bindus} बिन्दु`)}
                      plainHint={trHouseGuide(topSavHouse.house, lang).shortTitle}
                      benchmarkText={t(
                        `+${topSavHouse.bindus - 28} above 28 average`,
                        `औसत २८ भन्दा +${topSavHouse.bindus - 28} बढी`
                      )}
                      status={{ tone: 'optimal', label: trSign(topSavHouse.signName, lang) }}
                      icon={<Sparkles className="w-4 h-4" />}
                      actionLabel={t('See all 12 life areas', 'सबै १२ भाव हेर्नुहोस्')}
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label={t('Personal Year & Life Path', 'व्यक्तिगत अंक वर्ष र मूलांक')}
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
                        tone: 'favorable',
                        label:
                          lang === 'ne'
                            ? numSystem === 'CHALDEAN'
                              ? 'कल्डियन'
                              : 'पाइथागोरियन'
                            : numSystem === 'CHALDEAN'
                            ? 'Chaldean'
                            : 'Pythagorean',
                      }}
                      icon={<Hash className="w-4 h-4" />}
                      actionLabel={t('Open 25-year forecast', '२५-वर्षे अंक चक्र')}
                      onAction={() => setStudioTab('NUMEROLOGY')}
                    />
                  </div>

                  {/* Plain-Language Personal Summary Card */}
                  <div className="sc-hero-card p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                      <div>
                        <div className="text-sm font-semibold text-[var(--accent)]">
                          {t(
                            'In Plain English — What Your Chart Means Right Now',
                            'सरल नेपाली भाषामा — अहिले तपाईंको कुण्डलीले के भन्छ'
                          )}
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mt-0.5">
                          {plainSummary.currentChapterTitle}
                        </h2>
                      </div>

                      <SegmentedTabs
                        ariaLabel="Overview sections"
                        value={synthesisSubTab}
                        onChange={setSynthesisSubTab}
                        items={[
                          { id: 'OVERVIEW', label: t('Summary & Charts', 'सारांश र चार्ट') },
                          {
                            id: 'TIMELINE_12YR',
                            label: t('12-Year Outlook', '१२-वर्षे पूर्वानुमान'),
                            count: 12,
                          },
                          {
                            id: 'DOSSIER_QA',
                            label: t('Common Questions', 'जिज्ञासा र उत्तर'),
                            count: synthesisReport.aiCopilotPrompts.length,
                          },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-base text-[var(--text-secondary)] leading-relaxed">
                      <div className="obs-panel p-4 space-y-1.5">
                        <div className="text-sm font-bold text-[var(--text)]">
                          {t('Your Personality Blueprint', 'तपाईंको व्यक्तित्व र मूल स्वभाव')}
                        </div>
                        <p>{plainSummary.bigThreeParagraph}</p>
                      </div>
                      <div className="obs-panel p-4 space-y-1.5">
                        <div className="text-sm font-bold text-[var(--text)]">
                          {t(
                            'Your Active Focus & Today’s Best Window',
                            'आजको पञ्चाङ्ग र शुभ होरा मार्गदर्शन'
                          )}
                        </div>
                        <p>{plainSummary.todayGuidanceParagraph}</p>
                      </div>
                    </div>
                  </div>

                  {synthesisSubTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                      {/* Dual Visual Charts Band */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 obs-card p-5 sm:p-6 space-y-3">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                              <h2 className="text-lg font-bold text-[var(--text)]">
                                {t('360° Natal Sky Wheel', '३६०° जन्म आकाश ग्रह चक्र')}
                              </h2>
                              <p className="text-sm text-[var(--text-muted)]">
                                {lang === 'ne'
                                  ? `${ayanamsha === 'LAHIRI' ? 'लाहिरी' : ayanamsha} अयनांश • ${
                                      houseSystem === 'PLACIDUS' ? 'प्लासिडस' : houseSystem
                                    } भाव प्रणाली`
                                  : `${ayanamsha} zodiac • ${houseSystem} houses`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('WESTERN')}
                              className="text-sm font-semibold text-[var(--accent)] hover:underline"
                            >
                              {t('Planet table →', 'ग्रह तालिका →')}
                            </button>
                          </div>
                          <NatalWheelSvg chart={natalChart} />
                        </div>

                        <div className="lg:col-span-5 obs-card p-5 sm:p-6 space-y-3">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                              <h2 className="text-lg font-bold text-[var(--text)]">
                                {t(
                                  'Vedic Divisional Kundali (D1–D60)',
                                  'वैदिक वर्ग कुण्डली (D1–D60)'
                                )}
                              </h2>
                              <p className="text-sm text-[var(--text-muted)]">
                                {t(
                                  'Switch across Rashi (D1), Marriage (D9) & Career (D10)',
                                  'राशि (D1), नवांश विवाह (D9) र दशमांश करियर (D10) हेर्नुहोस्'
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('VEDIC_KP')}
                              className="text-sm font-semibold text-[var(--accent)] hover:underline"
                            >
                              {t('House scores →', 'भाव बल अंक →')}
                            </button>
                          </div>
                          <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                        </div>
                      </div>

                      {/* 4 Domain Pillar Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {synthesisReport.pillars.map((p) => (
                          <div
                            key={p.domain}
                            className="obs-card p-5 flex flex-col justify-between gap-3.5"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-[var(--text-muted)]">
                                  {p.domain}
                                </span>
                                <StatusBadge
                                  tone={p.score >= 75 ? 'optimal' : 'info'}
                                  label={`${p.score}%`}
                                />
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">
                                {p.headline}
                              </h3>
                              <p className="text-sm text-[var(--text-secondary)]">{p.subheadline}</p>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] pt-3 border-t border-[var(--border)] leading-relaxed">
                              {p.keyInsight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {synthesisSubTab === 'TIMELINE_12YR' && (
                    <div className="obs-card p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          {t(
                            '12-Year Year-by-Year Personal Outlook',
                            'आगामी १२ वर्षको वार्षिक व्यक्तिगत पूर्वानुमान'
                          )}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(
                            'Combines your Vedic planetary periods, Personal Year numbers, and major transits',
                            'वैदिक महादशा, व्यक्तिगत अंक वर्ष र प्रमुख गोचरहरूको संयुक्त विश्लेषण'
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {synthesisReport.unifiedTimeline.map((item) => {
                          const isCurrentYear = item.year === new Date().getFullYear();
                          return (
                            <div
                              key={item.year}
                              className={`p-5 rounded-xl border transition space-y-2.5 ${
                                isCurrentYear
                                  ? 'border-[var(--accent)] bg-[var(--accent-bg)]/40'
                                  : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                              }`}
                            >
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-bold text-[var(--text)] text-base">
                                  {item.year}
                                </span>
                                <span className="text-[var(--text-muted)]">
                                  {t(`Age ${item.age}`, `उमेर ${item.age}`)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-slate-950 text-xs"
                                  style={{ backgroundColor: item.numerologyColor }}
                                >
                                  {item.numerologyPersonalYear}
                                </span>
                                <span className="text-[var(--text)] font-semibold">
                                  {t(
                                    `Personal Year ${item.numerologyPersonalYear} • Pinnacle ${item.numerologyPinnacle}`,
                                    `व्यक्तिगत वर्ष ${item.numerologyPersonalYear} • शिखर ${item.numerologyPinnacle}`
                                  )}
                                </span>
                              </div>
                              <div className="text-sm text-[var(--accent)] font-semibold">
                                {item.vedicDashaLord}
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {item.westernTransitTheme}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {synthesisSubTab === 'DOSSIER_QA' && (
                    <div className="obs-card p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          {t(
                            'Common Personal Questions Answered from Your Chart',
                            'तपाईंको कुण्डलीमा आधारित प्रमुख जीवन प्रश्न र उत्तर'
                          )}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(
                            'Synthesized directly from your birth positions, house strengths, and active cycles',
                            'जन्म ग्रह स्थिति, अष्टकवर्ग बल र सक्रिय दशामा आधारित विश्लेषण'
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {synthesisReport.aiCopilotPrompts.map((item, i) => (
                          <div key={i} className="obs-panel p-5 space-y-2">
                            <h3 className="text-base font-bold text-[var(--text)]">
                              {item.question}
                            </h3>
                            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                              {item.groundedAnswer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. NATAL WHEEL, EPHEMERIS & 360° SABIAN */}
              {studioTab === 'WESTERN' && (
                <div className="space-y-6">
                  <WorkspacePageHeader
                    title={t(
                      'Natal Sky Wheel, Planetary Positions & Degree Meanings',
                      'जन्म आकाश चक्र, ग्रह स्पष्ट डिग्री र भाव फलादेश'
                    )}
                    subtitle={t(
                      'Exact planetary degrees, plain-English house meanings, birth-time fine-tuning, and Sabian degree symbols.',
                      'प्रत्येक ग्रहको सटीक अंश-कला, १२ भावको सरल अर्थ, जन्म-समय समायोजन र डिग्री प्रतीकहरू।'
                    )}
                  />

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label={t('Rising Sign (Ascendant)', 'जन्म लग्न (Ascendant)')}
                      value={`${natalChart.ascendant.signSymbol} ${trSign(natalChart.ascendant.signName, lang)}`}
                      plainHint={t(
                        'How you approach life & first impressions',
                        'व्यक्तित्व, स्वास्थ्य र जीवनप्रतिको दृष्टिकोण'
                      )}
                      benchmarkText={natalChart.ascendant.formattedDMS}
                      status={{ tone: 'info', label: houseSystem }}
                      icon={<Compass className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label={t('Natal Sun', 'जन्म सूर्य')}
                      value={`${sunPlanet.signSymbol} ${trSign(sunPlanet.signName, lang)}`}
                      subvalue={t(`House ${sunPlanet.house}`, `भाव ${sunPlanet.house}`)}
                      plainHint={trHouseGuide(sunPlanet.house, lang).shortTitle}
                      benchmarkText={`${sunPlanet.formattedDMS} • ${trNakshatra(sunPlanet.nakshatraName, lang)}`}
                      status={{ tone: 'favorable', label: trDignity(sunPlanet.dignity, lang) }}
                      icon={<Sun className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label={t('Natal Moon & Birth Star', 'जन्म चन्द्र राशि र नक्षत्र')}
                      value={`${moonPlanet.signSymbol} ${trSign(moonPlanet.signName, lang)}`}
                      subvalue={t(`House ${moonPlanet.house}`, `भाव ${moonPlanet.house}`)}
                      plainHint={t(
                        'Emotional heart, instincts & inner comfort',
                        'मन, भावना र मानसिक शान्तिको केन्द्र'
                      )}
                      benchmarkText={`${trNakshatra(moonPlanet.nakshatraName, lang)} (${t('Pada', 'चरण')} ${moonPlanet.nakshatraPada})`}
                      status={{ tone: 'optimal', label: t('Birth Star', 'जन्म नक्षत्र') }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel={t('Read Birth Star guide', 'नक्षत्र विवरण पढ्नुहोस्')}
                      onAction={() =>
                        handleNavigate('NAKSHATRAS', { nakIdx: moonPlanet.nakshatraIndex })
                      }
                    />
                    <KpiStatCard
                      label={t('Planetary Aspects', 'ग्रह दृष्टि र कोण')}
                      value={natalChart.aspects.length}
                      plainHint={t(
                        'Active geometric angles between your planets',
                        'ग्रहहरू बीचको सक्रिय ज्यामितीय सम्बन्ध'
                      )}
                      benchmarkText={`${t('Time shift:', 'समय समायोजन:')} ${
                        minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`
                      }`}
                      status={{ tone: 'neutral', label: ayanamsha }}
                    />
                  </div>

                  {/* Row 2: Wheel + Ephemeris Table */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 obs-card p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          {t(
                            'Interactive Wheel & Birth-Time Slider',
                            'अन्तर्क्रियात्मक ग्रह चक्र र जन्म-समय स्लाइडर'
                          )}
                        </h2>
                        {minuteShift !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMinuteShift(0)}
                            className="text-sm font-semibold text-[var(--accent)] hover:underline"
                          >
                            {t('Reset 0m', '० मि. रिसेट')}
                          </button>
                        )}
                      </div>

                      <div className="obs-panel p-3.5 flex items-center justify-between gap-3 text-sm">
                        <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">
                          {t('Adjust birth time:', 'जन्म समय मिलान:')}
                        </span>
                        <input
                          type="range"
                          aria-label="Birth time rectification minutes"
                          min={-120}
                          max={120}
                          value={minuteShift}
                          onChange={(e) => setMinuteShift(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[var(--accent)]"
                        />
                        <span className="font-mono font-bold text-[var(--accent)] w-14 text-right tabular-nums">
                          {minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`}
                        </span>
                      </div>

                      <NatalWheelSvg chart={natalChart} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5 sm:p-6 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          {t('Planetary Positions & Life Areas', 'ग्रह स्पष्ट तालिका र जीवन-क्षेत्र')}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(
                            'Click any Birth Star (Nakshatra) to read its full meaning',
                            'कुनै पनि नक्षत्रमा क्लिक गरी विस्तृत फल पढ्नुहोस्'
                          )}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                              <th className="py-3 px-2.5">{t('Planet', 'ग्रह')}</th>
                              <th className="py-3 px-2.5">{t('Sign & Degree', 'राशि र अंश')}</th>
                              <th className="py-3 px-2.5">{t('Life Area (House)', 'जीवन-क्षेत्र (भाव)')}</th>
                              <th className="py-3 px-2.5">{t('Star (Pada)', 'नक्षत्र (चरण)')}</th>
                              <th className="py-3 px-2.5">{t('Strength', 'अवस्था')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            <tr className="bg-[var(--bg-elevated)] font-semibold">
                              <td className="py-2.5 px-2.5 text-[var(--accent)]">
                                {t('Rising (Ascendant)', 'लग्न (Ascendant)')}
                              </td>
                              <td className="py-2.5 px-2.5 font-mono text-[var(--text)]">
                                {natalChart.ascendant.signSymbol}{' '}
                                {trSign(natalChart.ascendant.signName, lang)}{' '}
                                {natalChart.ascendant.formattedDMS}
                              </td>
                              <td className="py-2.5 px-2.5">
                                {lang === 'ne'
                                  ? `भाव १ — ${trHouseGuide(1, 'ne').shortTitle}`
                                  : 'H1 — Self & Vitality'}
                              </td>
                              <td className="py-2.5 px-2.5 text-[var(--text-muted)]">—</td>
                              <td className="py-2.5 px-2.5 text-[var(--text-secondary)]">
                                {trDignity('Angle', lang)}
                              </td>
                            </tr>
                            {natalChart.planets.map((p) => (
                              <tr key={p.id} className="hover:bg-[var(--bg-elevated)]/60">
                                <td className="py-3 px-2.5 font-semibold text-[var(--text)] whitespace-nowrap">
                                  <span className="mr-1.5" style={{ color: p.color }}>
                                    {p.symbol}
                                  </span>
                                  {trPlanet(
                                    p.name
                                      .replace('North Node (Rahu)', 'Rahu')
                                      .replace('South Node (Ketu)', 'Ketu'),
                                    lang
                                  )}
                                  {p.isRetrograde && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[var(--amber-bg)] text-[var(--amber)] text-xs font-mono">
                                      {t('R', 'वक्री')}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2.5 font-mono text-[var(--text)] whitespace-nowrap">
                                  {p.signSymbol} {trSign(p.signName, lang)} {p.formattedDMS}
                                </td>
                                <td className="py-3 px-2.5 text-[var(--text-secondary)]">
                                  <strong className="text-[var(--accent)]">
                                    {lang === 'ne' ? `भाव ${p.house}` : `H${p.house}`}
                                  </strong>{' '}
                                  — {trHouseGuide(p.house, lang).shortTitle}
                                </td>
                                <td className="py-3 px-2.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleNavigate('NAKSHATRAS', { nakIdx: p.nakshatraIndex })
                                    }
                                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5 font-medium"
                                  >
                                    <span>
                                      {trNakshatra(p.nakshatraName, lang)} (
                                      {lang === 'ne' ? `च${p.nakshatraPada}` : `P${p.nakshatraPada}`})
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                                <td className="py-3 px-2.5">
                                  <StatusBadge
                                    tone={
                                      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                                        ? 'optimal'
                                        : p.dignity === 'Debilitated'
                                        ? 'avoid'
                                        : 'neutral'
                                    }
                                    label={trDignity(p.dignity, lang)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Progressive Disclosure (Aspects vs 360° Sabian Symbols) */}
                  <div className="obs-card p-6 space-y-4">
                    <div className="border-b border-[var(--border)] pb-4">
                      <SegmentedTabs
                        ariaLabel="Aspects and Sabian symbols"
                        value={westernSubTab}
                        onChange={setWesternSubTab}
                        items={[
                          {
                            id: 'ASPECTS',
                            label: t('Planetary Aspects & Orbs', 'ग्रह दृष्टि र कोणीय दूरी'),
                            count: natalChart.aspects.length,
                          },
                          {
                            id: 'SABIAN',
                            label: t('360° Sabian Degree Symbols', '३६०° डिग्री प्रतीक अर्थ'),
                            count: natalChart.planets.length,
                          },
                        ]}
                      />
                    </div>

                    {westernSubTab === 'ASPECTS' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {natalChart.aspects.map((asp, i) => (
                          <div
                            key={i}
                            className="obs-panel px-4 py-3 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-semibold text-[var(--text)]">
                                {asp.symbolA} {trPlanet(asp.planetA, lang)}
                              </span>{' '}
                              <span className="font-bold mx-1 text-[var(--accent)]">
                                {asp.aspectSymbol} {asp.aspectName}
                              </span>{' '}
                              <span className="font-semibold text-[var(--text)]">
                                {asp.symbolB} {trPlanet(asp.planetB, lang)}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                              {asp.orb.toFixed(2)}°
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {westernSubTab === 'SABIAN' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                        {natalChart.planets.map((p) => (
                          <div key={p.id} className="obs-panel p-4 space-y-1.5">
                            <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                              <span style={{ color: p.color }}>{p.symbol}</span>
                              <span>
                                {trPlanet(p.name, lang)} — {trSign(p.signName, lang)} {p.formattedDMS}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] font-serif italic text-base leading-relaxed">
                              {p.sabianSymbol}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. VEDIC JYOTISH, SARVASHTAKAVARGA & KP */}
              {studioTab === 'VEDIC_KP' && (
                <div className="space-y-6">
                  <WorkspacePageHeader
                    title={t(
                      'Vedic Kundali, 12-House Strength Scores & Life Periods',
                      'वैदिक वर्ग कुण्डली, १२-भाव अष्टकवर्ग बल र विंशोत्तरी दशा'
                    )}
                    subtitle={t(
                      'Inspect your divisional Kundali charts (D1–D60), 12-house Ashtakavarga strength scores, Vimshottari Dasha chapters, and KP sub-lords.',
                      'षोडशवर्ग कुण्डली (D1–D60), १२ भावको सर्वाष्टकवर्ग बिन्दु बल, विंशोत्तरी महादशा/अन्तर्दशा र KP सब-लर्ड तालिका।'
                    )}
                  />

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label={t('Current Life Chapter (Dasha)', 'हालको विंशोत्तरी दशा')}
                      value={`${trPlanet(vedicReport.activeMahadasha.lord, lang)} – ${trPlanet(vedicReport.activeAntardasha.lord, lang)}`}
                      plainHint={trDashaGuide(vedicReport.activeMahadasha.lord, lang).chapterTitle}
                      benchmarkText={t(
                        `Ends ${vedicReport.activeMahadasha.endDate}`,
                        `समाप्ति: ${vedicReport.activeMahadasha.endDate}`
                      )}
                      status={{
                        tone: 'info',
                        label: t(
                          `${vedicReport.activeMahadasha.progressPercent}% complete`,
                          `${vedicReport.activeMahadasha.progressPercent}% पूरा`
                        ),
                      }}
                      icon={<Clock className="w-4 h-4" />}
                    />

                    {atmakaraka && (
                      <KpiStatCard
                        label={t('Soul Indicator (Atmakaraka)', 'आत्मकारक ग्रह (जैमिनी)')}
                        value={`${atmakaraka.symbol} ${trPlanet(atmakaraka.planetName, lang)}`}
                        subvalue={atmakaraka.degreeInSign}
                        plainHint={t(
                          'Planet at highest degree—shows your deepest soul lesson',
                          'सबैभन्दा बढी अंश भएको ग्रह—आत्माको मुख्य उद्देश्य'
                        )}
                        benchmarkText={t(
                          `D9 Sign: ${atmakaraka.navamshaSignName}`,
                          `नवांश राशि: ${trSign(atmakaraka.navamshaSignName, 'ne')}`
                        )}
                        status={{ tone: 'optimal', label: t('Jaimini AK', 'जैमिनी AK') }}
                        icon={<Sparkles className="w-4 h-4" />}
                      />
                    )}

                    <KpiStatCard
                      label={t('Strongest House (SAV)', 'सर्वोच्च बली भाव (SAV)')}
                      value={t(`House ${topSavHouse.house}`, `भाव ${topSavHouse.house}`)}
                      subvalue={t(`${topSavHouse.bindus} pts`, `${topSavHouse.bindus} बिन्दु`)}
                      plainHint={trHouseGuide(topSavHouse.house, lang).shortTitle}
                      benchmarkText={t(
                        `Total chart points: ${totalSavBindus}`,
                        `कुल सर्वाष्टकवर्ग बिन्दु: ${totalSavBindus}`
                      )}
                      status={{ tone: 'optimal', label: trSign(topSavHouse.signName, lang) }}
                      icon={<Activity className="w-4 h-4" />}
                    />

                    <KpiStatCard
                      label={t('Special Chart Yogas', 'कुण्डलीका विशेष योगहरू')}
                      value={vedicReport.yogas.length}
                      plainHint={t(
                        'Notable planetary combinations active in your chart',
                        'कुण्डलीमा सक्रिय प्रमुख शास्त्रीय ग्रह योगहरू'
                      )}
                      benchmarkText={t('Parashara & Phaladeepika', 'पराशर र फलदीपिका')}
                      status={{ tone: 'favorable', label: t('Active Combinations', 'सक्रिय योग') }}
                      icon={<BookOpen className="w-4 h-4" />}
                      actionLabel={t('Read Yoga details', 'योग विवरण पढ्नुहोस्')}
                      onAction={() => handleNavigate('CANON')}
                    />
                  </div>

                  {/* Row 2: Visual Kundali + 12-House SAV Benchmark Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-5 obs-card p-5 sm:p-6 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          {t(
                            'Divisional Kundali Charts (D1–D60)',
                            'षोडशवर्ग कुण्डली चार्ट (D1–D60)'
                          )}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(
                            'D1 = Root Life • D9 = Marriage & Soul • D10 = Career',
                            'D1 = जन्म लग्न • D9 = विवाह र धर्म • D10 = कर्म र करियर'
                          )}
                        </p>
                      </div>
                      <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-bold text-[var(--text)]">
                            {t(
                              '12-House Strength Scores vs. 28-Point Average',
                              '१२ भावको सर्वाष्टकवर्ग बल (औसत २८ बिन्दुसँग तुलना)'
                            )}
                          </h2>
                          <p className="text-sm text-[var(--text-muted)]">
                            {t(
                              'Green bars (30+) indicate natural ease; red bars (<25) indicate areas that reward patience and steady habits.',
                              'हरियो स्तम्भ (३०+) ले सहज सफलता र रातो (<२५) ले धैर्य तथा निरन्तर मिहिनेत चाहिने भाव देखाउँछ।'
                            )}
                          </p>
                        </div>
                        <StatusBadge
                          tone="info"
                          label={t(`Total ${totalSavBindus} Points`, `कुल ${totalSavBindus} बिन्दु`)}
                        />
                      </div>

                      <BenchmarkBarChart
                        items={savBarItems}
                        benchmarkValue={28}
                        highThreshold={30}
                        lowThreshold={25}
                        benchmarkLabel={t('28 Avg Benchmark', '२८ औसत बिन्दु')}
                        ariaLabel="12-house Sarvashtakavarga bindu comparison bar chart"
                      />

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--sage)] inline-block" />
                          {t('30+ Points (Strong Natural Support)', '३०+ बिन्दु (बलियो र सहज भाव)')}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--accent)] inline-block" />
                          {t('25–29 Points (Balanced)', '२५–२९ बिन्दु (सन्तुलित)')}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--crimson)] inline-block" />
                          {t('<25 Points (Steady Effort Needed)', '<२५ बिन्दु (निरन्तर परिश्रम आवश्यक)')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Progressive Disclosure Tabs */}
                  <div className="obs-card p-5 sm:p-6 space-y-5">
                    <div className="border-b border-[var(--border)] pb-4">
                      <SegmentedTabs
                        ariaLabel="Vedic detail tables"
                        value={vedicSubTab}
                        onChange={setVedicSubTab}
                        items={[
                          {
                            id: 'DASHA',
                            label: t(
                              'Life Chapters (Vimshottari Dashas)',
                              'विंशोत्तरी महादशा र अन्तर्दशा'
                            ),
                            count: vedicReport.dashas.length,
                          },
                          {
                            id: 'ASHTAKAVARGA_JAIMINI',
                            label: t(
                              'Planet-by-Planet Scores & Soul Roles',
                              'भिन्नाष्टकवर्ग र जैमिनी कारक'
                            ),
                            count: 7,
                          },
                          {
                            id: 'KP_SUBLORDS',
                            label: t('KP Sub-Lords & Horary (1–249)', 'KP सब-लर्ड र प्रश्न संख्या (१–२४९)'),
                          },
                        ]}
                      />
                    </div>

                    {vedicSubTab === 'DASHA' && (
                      <div className="space-y-3">
                        {vedicReport.dashas.map((d) => {
                          const isOpen =
                            expandedDashaLord === d.lord ||
                            (expandedDashaLord === null && d.isCurrent);
                          const plainGuide = trDashaGuide(d.lord, lang);
                          const dashaFruit = PLANET_TREATISES[d.lord]?.dashaGeneralFruit;
                          return (
                            <div
                              key={d.lord}
                              className={`rounded-xl border transition ${
                                d.isCurrent
                                  ? 'border-[var(--accent)] bg-[var(--accent-bg)]/25'
                                  : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setExpandedDashaLord(isOpen ? 'NONE' : d.lord)}
                                className="w-full px-4 py-3.5 flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <div className="flex flex-wrap items-center gap-2.5 text-left">
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-[var(--accent)]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                  )}
                                  <span className="font-bold text-[var(--text)] text-base">
                                    {t(
                                      `${d.lord} Chapter (${d.years} Years)`,
                                      `${trPlanet(d.lord, 'ne')} महादशा (${d.years} वर्ष)`
                                    )}
                                  </span>
                                  {plainGuide && (
                                    <span className="text-[var(--text-secondary)]">
                                      — {plainGuide.chapterTitle}
                                    </span>
                                  )}
                                  {d.isCurrent && (
                                    <StatusBadge
                                      tone="optimal"
                                      label={t(
                                        `Active Now (${d.progressPercent}%)`,
                                        `सक्रिय (${d.progressPercent}%)`
                                      )}
                                    />
                                  )}
                                </div>
                                <span className="font-mono text-sm text-[var(--text-secondary)]">
                                  {d.startDate} → {d.endDate}
                                </span>
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-3 border-t border-[var(--border)] space-y-3 text-sm">
                                  {plainGuide && (
                                    <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)] space-y-1.5 leading-relaxed">
                                      <p className="text-[var(--text)] font-medium">
                                        {plainGuide.plainMeaning}
                                      </p>
                                      <p className="text-[var(--text-secondary)]">
                                        <strong>{t('Best Focus:', 'मुख्य ध्यान:')}</strong>{' '}
                                        {plainGuide.bestFocus} •{' '}
                                        <strong>{t('Watch Out For:', 'सावधानी:')}</strong>{' '}
                                        {plainGuide.watchOutFor}
                                      </p>
                                      {dashaFruit && lang === 'en' && (
                                        <p className="text-[var(--text-muted)] text-xs pt-1">
                                          Classical Note: {dashaFruit}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {d.antardashas.map((antar) => (
                                      <div
                                        key={antar.lord}
                                        className={`p-3 rounded-lg border ${
                                          antar.isCurrent
                                            ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)] font-semibold'
                                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>
                                            {trPlanet(d.lord, lang)} – {trPlanet(antar.lord, lang)}
                                          </span>
                                          {antar.isCurrent && (
                                            <span className="text-xs font-mono font-bold">
                                              {t('ACTIVE', 'सक्रिय')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs font-mono opacity-85 mt-1">
                                          {antar.startDate} → {antar.endDate}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {vedicSubTab === 'ASHTAKAVARGA_JAIMINI' && (
                      <div className="space-y-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse text-center font-mono">
                            <thead>
                              <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                                <th className="py-2.5 px-2 text-left font-sans">
                                  {t('Planet BAV', 'ग्रह BAV')}
                                </th>
                                {ZODIAC_SIGNS.map((z) => (
                                  <th key={z.index} className="py-2.5 px-1.5" title={z.sanskrit}>
                                    <div>{z.symbol}</div>
                                    <div className="text-xs">
                                      {lang === 'ne' ? trSign(z.name, 'ne') : z.name.slice(0, 3)}
                                    </div>
                                  </th>
                                ))}
                                <th className="py-2.5 px-2 text-[var(--accent)]">
                                  {t('Total', 'जम्मा')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {Object.entries(vedicReport.bhinnashtakavarga).map(
                                ([planetName, arr]) => {
                                  const rowSum = arr.reduce((a, b) => a + b, 0);
                                  return (
                                    <tr key={planetName} className="hover:bg-[var(--bg-elevated)]">
                                      <td className="py-2.5 px-2 text-left font-sans font-semibold text-[var(--text)]">
                                        {trPlanet(planetName, lang)}
                                      </td>
                                      {arr.map((val, sIdx) => (
                                        <td
                                          key={sIdx}
                                          className={`py-2.5 px-1.5 tabular-nums ${
                                            val >= 5
                                              ? 'text-[var(--sage)] font-bold'
                                              : val <= 2
                                              ? 'text-[var(--crimson)]'
                                              : 'text-[var(--text-secondary)]'
                                          }`}
                                        >
                                          {val}
                                        </td>
                                      ))}
                                      <td className="py-2.5 px-2 font-bold text-[var(--text)] tabular-nums">
                                        {rowSum}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}

                              <tr className="bg-[var(--bg-elevated)] border-t-2 border-[var(--border-strong)] font-bold">
                                <td className="py-3 px-2 text-left font-sans text-[var(--accent)]">
                                  {t('Total SAV', 'कुल SAV')}
                                </td>
                                {ZODIAC_SIGNS.map((z) => {
                                  const savEntry = vedicReport.sarvashtakavarga.find(
                                    (s) => s.signIndex === z.index
                                  );
                                  const pts = savEntry?.bindus ?? 28;
                                  return (
                                    <td
                                      key={z.index}
                                      className={`py-3 px-1.5 tabular-nums ${
                                        pts >= 30
                                          ? 'text-[var(--sage)]'
                                          : pts < 25
                                          ? 'text-[var(--crimson)]'
                                          : 'text-[var(--text)]'
                                      }`}
                                    >
                                      <div>{pts}</div>
                                      <div className="text-[11px] text-[var(--text-muted)]">
                                        H{savEntry?.house}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="py-3 px-2 text-[var(--accent)] tabular-nums">
                                  {totalSavBindus}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                          <h3 className="text-base font-bold text-[var(--text)]">
                            {t(
                              'Seven Jaimini Soul Significators (Chara Karakas)',
                              'सप्त जैमिनी चर कारकहरू'
                            )}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {vedicReport.charaKarakas.map((ck) => (
                              <div key={ck.karakaCode} className="obs-panel p-4 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <StatusBadge
                                    tone={ck.karakaCode === 'AK' ? 'optimal' : 'info'}
                                    label={ck.karakaCode}
                                  />
                                  <span className="text-[var(--text-muted)]">
                                    {ck.degreeInSign}
                                  </span>
                                </div>
                                <div className="text-base font-bold text-[var(--text)]">
                                  {ck.symbol} {trPlanet(ck.planetName, lang)} — {ck.karakaName}
                                </div>
                                <div className="text-xs font-mono text-[var(--text-secondary)]">
                                  D1: {trSign(ck.signName, lang)} • D9:{' '}
                                  <strong>{trSign(ck.navamshaSignName, lang)}</strong>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{ck.domain}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {vedicSubTab === 'KP_SUBLORDS' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)] font-mono">
                                <th className="py-2.5 px-2">{t('Planet', 'ग्रह / भाव')}</th>
                                <th className="py-2.5 px-2">{t('Sidereal DMS', 'स्पष्ट अंश')}</th>
                                <th className="py-2.5 px-2">{t('Sign Lord', 'राशि स्वामी')}</th>
                                <th className="py-2.5 px-2">{t('Star Lord', 'नक्षत्र स्वामी')}</th>
                                <th className="py-2.5 px-2 text-[var(--accent)]">
                                  {t('KP Sub-Lord', 'KP उप-स्वामी')}
                                </th>
                                <th className="py-2.5 px-2">{t('Sub-Sub', 'उप-उप')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {vedicReport.kpPlanets.map((row) => (
                                <tr key={row.label} className="hover:bg-[var(--bg-elevated)]">
                                  <td className="py-2.5 px-2 font-semibold text-[var(--text)]">
                                    {row.symbol} {trPlanet(row.label, lang)}
                                  </td>
                                  <td className="py-2.5 px-2 font-mono text-[var(--text-secondary)]">
                                    {row.longitudeDMS}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text-secondary)]">
                                    {trPlanet(row.signLord, lang)}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text)] font-medium">
                                    {trPlanet(row.starLord, lang)}
                                  </td>
                                  <td className="py-2.5 px-2 font-bold text-[var(--accent)]">
                                    {trPlanet(row.subLord, lang)}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text-muted)]">
                                    {trPlanet(row.subSubLord, lang)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="lg:col-span-5 obs-panel p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[var(--text)]">
                              {t('KP Horary Question (Pick 1–249)', 'KP प्रश्न संख्या (१–२४९ छान्नुहोस्)')}
                            </span>
                            <input
                              type="number"
                              aria-label="KP Horary number 1 to 249"
                              min={1}
                              max={249}
                              value={profile.kpHoraryNumber}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  kpHoraryNumber: Math.min(
                                    249,
                                    Math.max(1, parseInt(e.target.value, 10) || 108)
                                  ),
                                })
                              }
                              className="w-24 obs-input py-1 font-mono font-bold text-center text-sm"
                            />
                          </div>
                          <div className="text-lg font-bold text-[var(--text)]">
                            {t('Number', 'प्रश्न अंक')} #{vedicReport.kpHorary.horaryNumber} →{' '}
                            {trSign(vedicReport.kpHorary.ascendantSign, lang)} (
                            {vedicReport.kpHorary.ascendantDMS})
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-mono">
                            <StatusBadge
                              tone="neutral"
                              label={`${t('Sign:', 'राशि:')} ${trPlanet(vedicReport.kpHorary.signLord, lang)}`}
                            />
                            <StatusBadge
                              tone="neutral"
                              label={`${t('Star:', 'नक्षत्र:')} ${trPlanet(vedicReport.kpHorary.starLord, lang)}`}
                            />
                            <StatusBadge
                              tone="info"
                              label={`${t('Sub:', 'उप-स्वामी:')} ${trPlanet(vedicReport.kpHorary.subLord, lang)}`}
                            />
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {vedicReport.kpHorary.verdict}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. DAILY PANCHANG & NEPALI PATRO */}
              {studioTab === 'PANCHANG' && (
                <PanchangDashboard
                  panchang={panchangReport}
                  onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
                  onOpenActionSimulator={() => handleNavigate('WHAT_HAPPENS_IF')}
                  onOpenHoraiStudio={() => handleNavigate('HORAI')}
                />
              )}

              {/* 5. WORLD RELOCATION ASTROCARTOGRAPHY */}
              {studioTab === 'ASTROCARTOGRAPHY' && (
                <AstrocartographyWorldMap profile={profile} chart={natalChart} />
              )}

              {/* 6. NUMEROLOGY & COLORCHART */}
              {studioTab === 'NUMEROLOGY' && (
                <DecozColorChart
                  report={numerologyReport}
                  system={numSystem}
                  onSystemChange={setNumSystem}
                />
              )}

              {/* 7. COMPATIBILITY & EPHEMERIS FINDER */}
              {studioTab === 'SYNASTRY' && (
                <ResearchAndSynastryLab
                  primaryProfile={profile}
                  primaryChart={natalChart}
                  partnerProfile={partnerProfile}
                  partnerChart={partnerChart}
                  onPartnerChange={setPartnerProfile}
                />
              )}
            </>
          )}
        </main>

        <footer className="no-print px-4 sm:px-6 pb-8 pt-2 max-w-[1240px] w-full mx-auto">
          <div className="sc-module-dock rounded-2xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <button
              type="button"
              onClick={() => handleNavigate('HOME')}
              className="inline-flex items-center gap-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
              <SeedOfLifeMark size={18} animated={floralMotion} tone="adaptive" />
              <span className="font-scDisplay font-semibold tracking-[-0.02em] text-[var(--text)]">
                oceanology
              </span>
              <span>• {t('Return to Cosmic Landing', 'मुख्य कस्मिक पृष्ठमा फर्कनुहोस्')}</span>
            </button>
            <div className="flex flex-wrap items-center gap-3 tabular-nums">
              <span>
                {t(
                  `14 Classical Canons • ${cityDisplay} Observatory`,
                  `१४ शास्त्रीय ग्रन्थ • ${cityDisplay} वेधशाला`
                )}
              </span>
              <button
                type="button"
                onClick={handleGlobalDownloadPdf}
                disabled={pdfExporting}
                className="font-semibold text-[var(--accent)] hover:underline disabled:opacity-60"
              >
                {t('19-Page PDF Dossier ↗', '१९-पृष्ठ PDF रिपोर्ट ↗')}
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ==================== ACCESSIBLE BIRTH PROFILE MODAL ==================== */}
      {showProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit birth profile and coordinates"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto sc-hero-card p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text)]">
                  {t('Birth Profile & Calculation Settings', 'जन्म विवरण र गणना सेटिङ')}
                </h2>
                <p className="text-sm text-[var(--text-muted)] tabular-nums mt-0.5">
                  {t('Nepali Bikram Sambat:', 'विक्रम संवत्:')} {birthBsDate.formattedEn} (
                  {birthBsDate.formattedNp}) • {formatUtcOffset(profile.location.timezoneOffsetHours)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close modal"
                className="ui-toolbar-icon-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  {t('First name', 'पहिलो नाम')}
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      firstName: e.target.value,
                      currentFirstName: e.target.value,
                    })
                  }
                  className="w-full obs-input"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  {t('Middle name', 'बीचको नाम')}
                </label>
                <input
                  type="text"
                  value={profile.middleName}
                  onChange={(e) => setProfile({ ...profile, middleName: e.target.value })}
                  className="w-full obs-input"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  {t('Last name', 'थर')}
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      lastName: e.target.value,
                      currentLastName: e.target.value,
                    })
                  }
                  className="w-full obs-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  {t('Birth date (YYYY / MM / DD)', 'जन्म मिति (ई.सं. वर्ष / महिना / गते)')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="number"
                    value={profile.year}
                    onChange={(e) =>
                      setProfile({ ...profile, year: parseInt(e.target.value, 10) || 1996 })
                    }
                    className="obs-input tabular-nums font-medium"
                  />
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={profile.month}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
                      })
                    }
                    className="obs-input tabular-nums font-medium"
                  />
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={profile.day}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        day: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)),
                      })
                    }
                    className="obs-input tabular-nums font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  {t('Birth time (24h HH : MM : SS)', 'जन्म समय (२४ घण्टा HH : MM : SS)')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    disabled={profile.unknownTime}
                    value={profile.hour}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        hour: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      })
                    }
                    className="obs-input tabular-nums font-medium disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    disabled={profile.unknownTime}
                    value={profile.minute}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        minute: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      })
                    }
                    className="obs-input tabular-nums font-medium disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    disabled={profile.unknownTime}
                    value={profile.second}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        second: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      })
                    }
                    className="obs-input tabular-nums font-medium disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <GlobalLocationPicker
              label={t(
                'Birth city & coordinates (Nepal & global)',
                'जन्म सहर र भौगोलिक निर्देशांक (नेपाल र विश्व)'
              )}
              value={profile.location}
              onChange={(loc) => setProfile({ ...profile, location: loc })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border)] text-sm">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.unknownTime}
                  onChange={(e) => setProfile({ ...profile, unknownTime: e.target.checked })}
                  className="accent-[var(--accent)] w-4 h-4"
                />
                <span>
                  {t(
                    'Unknown exact birth time (Solar / Moon chart mode)',
                    'जन्म समय थाहा छैन (सूर्य / चन्द्र कुण्डली मोड)'
                  )}
                </span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-[var(--text-secondary)] font-medium">
                  {t('House system:', 'भाव प्रणाली:')}
                </span>
                <select
                  value={houseSystem}
                  onChange={(e) => setHouseSystem(e.target.value as HouseSystem)}
                  className="obs-input py-1.5 text-sm w-auto"
                >
                  <option value="PLACIDUS">Placidus</option>
                  <option value="WHOLE_SIGN">Whole Sign (Rashi)</option>
                  <option value="EQUAL">Equal House</option>
                  <option value="SRIPATI">Sripati Porphyry</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  handleNavigate('FULL_REPORT');
                }}
                className="btn-editorial-secondary text-sm inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <span>{t('Apply & Open Easy Report', 'लागू गरी सरल रिपोर्ट खोल्नुहोस्')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn-editorial-primary text-sm px-6"
              >
                {t('Save & Apply', 'सेभ र लागू गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
