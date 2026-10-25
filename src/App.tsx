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
  buildPlainEnglishPersonalSummary,
  DASHA_PLAIN_GUIDE,
  HOUSE_PLAIN_GUIDE,
} from './data/plainEnglishGuide';
import {
  LandingPage,
  ObservatoryStudioTab,
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
} from './components/ui/DashboardPrimitives';
import {
  FloatingPetalsBackdrop,
  InteractivePetalBurst,
  SacredFlowerIcon,
} from './components/ui/FloralAnimations';

export function App() {
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
  const [darkMode, setDarkMode] = useState<boolean>(false);
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
      buildPlainEnglishPersonalSummary(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, synthesisReport]
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
        label: `H${h.house}`,
        sublabel: h.signName.slice(0, 3),
        value: h.bindus,
      })),
    [savByHouse]
  );

  const sunPlanet = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const atmakaraka = vedicReport.charaKarakas[0];

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

  // ==================== MODE 1: CLEAN MARKETING LANDING PAGE ====================
  if (activeDest === 'HOME') {
    return (
      <>
        <FloatingPetalsBackdrop enabled={floralMotion} />
        <InteractivePetalBurst enabled={floralMotion} />
        <LandingPage
          profile={profile}
          onProfileChange={setProfile}
          natalChart={natalChart}
          vedicReport={vedicReport}
          panchangReport={panchangReport}
          numerologyReport={numerologyReport}
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
      groupLabel: 'Personal Reading & Time',
      items: [
        {
          key: 'easy-report',
          label: 'Easy Report & PDF',
          icon: <FileText className="w-4 h-4" />,
          isActive: activeDest === 'FULL_REPORT',
          onClick: () => handleNavigate('FULL_REPORT'),
        },
        {
          key: 'horai-clock',
          label: 'Live Horai & Time',
          badgeText: panchangReport.activeHorai.lord,
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
          label: 'Dashboard Overview',
          icon: <Compass className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'SYNTHESIS',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' }),
        },
        {
          key: 'action-timing',
          label: 'Best Dates & Timing',
          icon: <Scale className="w-4 h-4" />,
          isActive: activeDest === 'WHAT_HAPPENS_IF',
          onClick: () => handleNavigate('WHAT_HAPPENS_IF'),
        },
        {
          key: 'panchang',
          label: 'Daily Panchang',
          icon: <Calendar className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'PANCHANG',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'PANCHANG' }),
        },
      ],
    },
    {
      groupLabel: 'Charts & Analytics',
      items: [
        {
          key: 'natal-wheel',
          label: 'Natal Sky & Planets',
          icon: <Sun className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'WESTERN',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'WESTERN' }),
        },
        {
          key: 'vedic-sav',
          label: 'Vedic Kundali & SAV',
          icon: <Moon className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'VEDIC_KP',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'VEDIC_KP' }),
        },
        {
          key: 'world-map',
          label: 'World Relocation',
          icon: <Globe className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'ASTROCARTOGRAPHY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' }),
        },
        {
          key: 'compatibility',
          label: 'Compatibility',
          icon: <HeartHandshake className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'SYNASTRY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'SYNASTRY' }),
        },
        {
          key: 'numerology',
          label: 'Numerology',
          icon: <Hash className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'NUMEROLOGY',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'NUMEROLOGY' }),
        },
      ],
    },
    {
      groupLabel: 'Reference Guides',
      items: [
        {
          key: 'nakshatras',
          label: '28 Birth Stars',
          icon: <Sparkles className="w-4 h-4" />,
          isActive: activeDest === 'NAKSHATRAS',
          onClick: () => handleNavigate('NAKSHATRAS'),
        },
        {
          key: 'library',
          label: 'Classical Library',
          icon: <BookOpen className="w-4 h-4" />,
          isActive: activeDest === 'CANON',
          onClick: () => handleNavigate('CANON'),
        },
      ],
    },
  ];

  const currentViewLabel =
    sidebarGroups.flatMap((g) => g.items).find((it) => it.isActive)?.label || 'Overview';

  const SidebarNavContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            onClick={() => handleNavigate('HOME')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <SacredFlowerIcon
                variety="lotus"
                primaryHex="#FDE68A"
                secondaryHex="#FFFFFF"
                size={21}
                animated={floralMotion}
              />
            </div>
            <div>
              <div className="font-display font-bold text-base tracking-tight text-[var(--text)] leading-none">
                Oceanology
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Horoscope &amp; Horai</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-5" aria-label="Workspace modules">
          {sidebarGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <div className="px-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group.groupLabel}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    item.isActive
                      ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeText && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-400/30">
                      {item.badgeText}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom Natal Card + PDF Quick Download + Back */}
      <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="w-full p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] text-left transition space-y-1"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-[var(--text)] truncate">
              {profile.firstName} {profile.lastName}
            </span>
            <Sliders className="w-4 h-4 text-[var(--accent)] shrink-0" />
          </div>
          <div className="text-xs font-mono text-[var(--text-muted)] truncate">
            {natalChart.ascendant.signName} Rising • {moonPlanet.nakshatraName}
          </div>
        </button>

        <button
          type="button"
          disabled={pdfExporting}
          onClick={handleGlobalDownloadPdf}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg btn-editorial-primary text-sm disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>{pdfExporting ? 'Building PDF…' : 'Download PDF Report'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('HOME')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Page</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-transparent text-[var(--text)] relative">
      <FloatingPetalsBackdrop enabled={floralMotion} />
      <InteractivePetalBurst enabled={floralMotion} />

      {/* ==================== DESKTOP LEFT SIDEBAR ==================== */}
      <aside className="hidden lg:block w-[268px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md sticky top-0 h-screen overflow-y-auto z-20">
        <SidebarNavContent />
      </aside>

      {/* ==================== MOBILE SLIDE-OVER SIDEBAR ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[276px] max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] h-full overflow-y-auto z-10">
            <SidebarNavContent />
          </aside>
        </div>
      )}

      {/* ==================== MAIN CONTENT COLUMN ==================== */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Sticky Global Context Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--surface)]/92 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base font-bold text-[var(--text)] truncate">
                {currentViewLabel}
              </span>
              <button
                type="button"
                onClick={() => handleNavigate('HORAI')}
                title="Open Live 24-Petal Horai Sacred Clock"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full floral-banner-glow border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] transition"
              >
                <SacredFlowerIcon
                  variety={panchangReport.activeHorai.sacredFlower.variety}
                  primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                  secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                  size={16}
                  animated={floralMotion}
                />
                <span>{panchangReport.activeHorai.horaiName}</span>
                <span className="font-mono text-[var(--accent)]">
                  • {panchangReport.activeHorai.minutesRemaining}m
                </span>
              </button>
              {isSampleProfile && (
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-semibold hover:underline"
                >
                  <span>Sample profile • Edit birth details</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Global Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] text-sm font-medium transition"
            >
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
              <span className="hidden md:inline text-[var(--text)]">
                {profile.firstName} • {profile.location.name.split(' ')[0]}
              </span>
              <span className="md:hidden text-[var(--text)]">Profile</span>
            </button>

            <select
              aria-label="Zodiac Ayanamsha mode"
              value={ayanamsha}
              onChange={(e) => setAyanamsha(e.target.value as AyanamshaMode)}
              className="obs-input py-1.5 px-2.5 text-sm font-mono hidden 2xl:block w-auto min-h-[38px]"
            >
              <option value="LAHIRI">Lahiri Sidereal</option>
              <option value="TROPICAL">Tropical (0°)</option>
              <option value="KP_NEW">KP New</option>
              <option value="KP_OLD">KP Old</option>
              <option value="RAMAN">B.V. Raman</option>
              <option value="KHULLAR">KP Khullar</option>
            </select>

            <button
              type="button"
              onClick={() => setFloralMotion(!floralMotion)}
              aria-label="Toggle sacred flower animations"
              title="Toggle Floating Flower Petals & Click Blooms"
              className={`px-2.5 py-2 rounded-lg border text-sm font-semibold transition inline-flex items-center gap-1.5 ${
                floralMotion
                  ? 'border-pink-400/50 bg-pink-500/10 text-pink-700 dark:text-pink-300'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              <SacredFlowerIcon
                variety="lotus"
                primaryHex="#EC4899"
                secondaryHex="#FBCFE8"
                size={16}
                animated={floralMotion}
              />
              <span className="hidden xl:inline">{floralMotion ? 'Bloom' : 'Calm'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              aria-label="Toggle larger text size"
              title="Toggle Larger Reading Text"
              className={`px-2.5 py-2 rounded-lg border text-sm font-semibold transition inline-flex items-center gap-1.5 ${
                largeText
                  ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">{largeText ? 'Large Text' : 'Aa'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              disabled={pdfExporting}
              onClick={handleGlobalDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-editorial-primary text-sm disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {pdfExporting ? 'Building…' : 'PDF Report'}
              </span>
            </button>
          </div>
        </header>

        {/* Workspace Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
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
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                        {profile.firstName} {profile.lastName} — Personal Overview
                      </h1>
                      <p className="text-base text-[var(--text-secondary)]">
                        {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName} Rising (
                        {natalChart.ascendant.formattedDMS}) • Birth Star:{' '}
                        {moonPlanet.nakshatraName} (Pada {moonPlanet.nakshatraPada}) • Nepali B.S.{' '}
                        {birthBsDate.formattedEn}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('FULL_REPORT')}
                        className="btn-editorial-primary text-sm inline-flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Read Easy Report &amp; PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('WHAT_HAPPENS_IF')}
                        className="btn-editorial-secondary text-sm inline-flex items-center gap-2"
                      >
                        <Scale className="w-4 h-4 text-[var(--accent)]" />
                        <span>Check Best Dates</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 1: 4 Contextual KPI Stat Cards with Plain-English Hints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="Overall Chart Alignment"
                      value={`${synthesisReport.overallResonanceScore}/100`}
                      plainHint="Combined harmony across Western, Vedic, Panchang & Numerology"
                      benchmarkText={synthesisReport.resonanceTier}
                      status={{
                        tone:
                          synthesisReport.overallResonanceScore >= 75 ? 'optimal' : 'favorable',
                        label: 'Strong Alignment',
                      }}
                      icon={<Activity className="w-4 h-4" />}
                    />

                    <KpiStatCard
                      label="Current Life Chapter (Dasha)"
                      value={`${vedicReport.activeMahadasha.lord} – ${vedicReport.activeAntardasha.lord}`}
                      plainHint={
                        DASHA_PLAIN_GUIDE[vedicReport.activeMahadasha.lord]?.chapterTitle ||
                        'Active planetary life period'
                      }
                      benchmarkText={`${vedicReport.activeMahadasha.progressPercent}% of ${vedicReport.activeMahadasha.years}y cycle`}
                      status={{ tone: 'info', label: `Until ${vedicReport.activeMahadasha.endDate}` }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel="Explore full life timeline"
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label="Strongest Life Area"
                      value={`House ${topSavHouse.house}`}
                      subvalue={`${topSavHouse.bindus} pts`}
                      plainHint={
                        HOUSE_PLAIN_GUIDE[topSavHouse.house]?.shortTitle || topSavHouse.signName
                      }
                      benchmarkText={`+${topSavHouse.bindus - 28} above 28 average`}
                      status={{ tone: 'optimal', label: topSavHouse.signName }}
                      icon={<Sparkles className="w-4 h-4" />}
                      actionLabel="See all 12 life areas"
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label="Personal Year & Life Path"
                      value={`Year ${numerologyReport.personalYear.final}`}
                      subvalue={`Life Path #${numerologyReport.lifePath.final}`}
                      plainHint={numerologyReport.personalYear.meaning.split('.')[0]}
                      benchmarkText={`Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`}
                      status={{ tone: 'favorable', label: numSystem }}
                      icon={<Hash className="w-4 h-4" />}
                      actionLabel="Open 25-year forecast"
                      onAction={() => setStudioTab('NUMEROLOGY')}
                    />
                  </div>

                  {/* Plain-English Personal Summary Card */}
                  <div className="obs-card p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                      <div>
                        <div className="text-sm font-semibold text-[var(--accent)]">
                          In Plain English — What Your Chart Means Right Now
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
                          { id: 'OVERVIEW', label: 'Summary & Charts' },
                          { id: 'TIMELINE_12YR', label: '12-Year Outlook', count: 12 },
                          {
                            id: 'DOSSIER_QA',
                            label: 'Common Questions',
                            count: synthesisReport.aiCopilotPrompts.length,
                          },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-base text-[var(--text-secondary)] leading-relaxed">
                      <div className="obs-panel p-4 space-y-1.5">
                        <div className="text-sm font-bold text-[var(--text)]">
                          Your Personality Blueprint
                        </div>
                        <p>{plainSummary.bigThreeParagraph}</p>
                      </div>
                      <div className="obs-panel p-4 space-y-1.5">
                        <div className="text-sm font-bold text-[var(--text)]">
                          Your Active Focus &amp; Today’s Best Window
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
                                360° Natal Sky Wheel
                              </h2>
                              <p className="text-sm text-[var(--text-muted)]">
                                {ayanamsha} zodiac • {houseSystem} houses
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('WESTERN')}
                              className="text-sm font-semibold text-[var(--accent)] hover:underline"
                            >
                              Planet table →
                            </button>
                          </div>
                          <NatalWheelSvg chart={natalChart} />
                        </div>

                        <div className="lg:col-span-5 obs-card p-5 sm:p-6 space-y-3">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                              <h2 className="text-lg font-bold text-[var(--text)]">
                                Vedic Divisional Kundali (D1–D60)
                              </h2>
                              <p className="text-sm text-[var(--text-muted)]">
                                Switch across Rashi (D1), Marriage (D9) &amp; Career (D10)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('VEDIC_KP')}
                              className="text-sm font-semibold text-[var(--accent)] hover:underline"
                            >
                              House scores →
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
                          12-Year Year-by-Year Personal Outlook
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          Combines your Vedic planetary periods, Personal Year numbers, and major
                          transits
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
                                <span className="text-[var(--text-muted)]">Age {item.age}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-slate-950 text-xs"
                                  style={{ backgroundColor: item.numerologyColor }}
                                >
                                  {item.numerologyPersonalYear}
                                </span>
                                <span className="text-[var(--text)] font-semibold">
                                  Personal Year {item.numerologyPersonalYear} • Pinnacle{' '}
                                  {item.numerologyPinnacle}
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
                          Common Personal Questions Answered from Your Chart
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          Synthesized directly from your birth positions, house strengths, and active
                          cycles
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
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                        Natal Sky Wheel, Planetary Positions &amp; Degree Meanings
                      </h1>
                      <p className="text-base text-[var(--text-secondary)]">
                        Exact planetary degrees, plain-English house meanings, birth-time
                        fine-tuning, and Sabian degree symbols.
                      </p>
                    </div>
                  </div>

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="Rising Sign (Ascendant)"
                      value={`${natalChart.ascendant.signSymbol} ${natalChart.ascendant.signName}`}
                      plainHint="How you approach life & first impressions"
                      benchmarkText={natalChart.ascendant.formattedDMS}
                      status={{ tone: 'info', label: houseSystem }}
                      icon={<Compass className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label="Natal Sun"
                      value={`${sunPlanet.signSymbol} ${sunPlanet.signName}`}
                      subvalue={`House ${sunPlanet.house}`}
                      plainHint={`Core drive in ${HOUSE_PLAIN_GUIDE[sunPlanet.house]?.shortTitle}`}
                      benchmarkText={`${sunPlanet.formattedDMS} • ${sunPlanet.nakshatraName}`}
                      status={{ tone: 'favorable', label: sunPlanet.dignity }}
                      icon={<Sun className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label="Natal Moon & Birth Star"
                      value={`${moonPlanet.signSymbol} ${moonPlanet.signName}`}
                      subvalue={`House ${moonPlanet.house}`}
                      plainHint="Emotional heart, instincts & inner comfort"
                      benchmarkText={`${moonPlanet.nakshatraName} Pada ${moonPlanet.nakshatraPada}`}
                      status={{ tone: 'optimal', label: 'Birth Star' }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel="Read Birth Star guide"
                      onAction={() =>
                        handleNavigate('NAKSHATRAS', { nakIdx: moonPlanet.nakshatraIndex })
                      }
                    />
                    <KpiStatCard
                      label="Planetary Aspects"
                      value={natalChart.aspects.length}
                      plainHint="Active geometric angles between your planets"
                      benchmarkText={`Time shift: ${
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
                          Interactive Wheel &amp; Birth-Time Slider
                        </h2>
                        {minuteShift !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMinuteShift(0)}
                            className="text-sm font-semibold text-[var(--accent)] hover:underline"
                          >
                            Reset 0m
                          </button>
                        )}
                      </div>

                      <div className="obs-panel p-3.5 flex items-center justify-between gap-3 text-sm">
                        <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">
                          Adjust birth time:
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
                          Planetary Positions &amp; Life Areas
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          Click any Birth Star (Nakshatra) to read its full meaning
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                              <th className="py-3 px-2.5">Planet</th>
                              <th className="py-3 px-2.5">Sign &amp; Degree</th>
                              <th className="py-3 px-2.5">Life Area (House)</th>
                              <th className="py-3 px-2.5">Star (Pada)</th>
                              <th className="py-3 px-2.5">Strength</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            <tr className="bg-[var(--bg-elevated)] font-semibold">
                              <td className="py-2.5 px-2.5 text-[var(--accent)]">
                                Rising (Ascendant)
                              </td>
                              <td className="py-2.5 px-2.5 font-mono text-[var(--text)]">
                                {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName}{' '}
                                {natalChart.ascendant.formattedDMS}
                              </td>
                              <td className="py-2.5 px-2.5">H1 — Self &amp; Vitality</td>
                              <td className="py-2.5 px-2.5 text-[var(--text-muted)]">—</td>
                              <td className="py-2.5 px-2.5 text-[var(--text-secondary)]">Angle</td>
                            </tr>
                            {natalChart.planets.map((p) => (
                              <tr key={p.id} className="hover:bg-[var(--bg-elevated)]/60">
                                <td className="py-3 px-2.5 font-semibold text-[var(--text)] whitespace-nowrap">
                                  <span className="mr-1.5" style={{ color: p.color }}>
                                    {p.symbol}
                                  </span>
                                  {p.name
                                    .replace('North Node (Rahu)', 'Rahu')
                                    .replace('South Node (Ketu)', 'Ketu')}
                                  {p.isRetrograde && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[var(--amber-bg)] text-[var(--amber)] text-xs font-mono">
                                      R
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2.5 font-mono text-[var(--text)] whitespace-nowrap">
                                  {p.signSymbol} {p.signName} {p.formattedDMS}
                                </td>
                                <td className="py-3 px-2.5 text-[var(--text-secondary)]">
                                  <strong className="text-[var(--accent)]">H{p.house}</strong> —{' '}
                                  {HOUSE_PLAIN_GUIDE[p.house]?.shortTitle}
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
                                      {p.nakshatraName} (P{p.nakshatraPada})
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
                                    label={p.dignity}
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
                            label: 'Planetary Aspects & Orbs',
                            count: natalChart.aspects.length,
                          },
                          {
                            id: 'SABIAN',
                            label: '360° Sabian Degree Symbols',
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
                                {asp.symbolA} {asp.planetA}
                              </span>{' '}
                              <span className="font-bold mx-1 text-[var(--accent)]">
                                {asp.aspectSymbol} {asp.aspectName}
                              </span>{' '}
                              <span className="font-semibold text-[var(--text)]">
                                {asp.symbolB} {asp.planetB}
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
                                {p.name} — {p.signName} {p.formattedDMS}
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
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                      Vedic Kundali, 12-House Strength Scores &amp; Life Periods
                    </h1>
                    <p className="text-base text-[var(--text-secondary)]">
                      Inspect your divisional Kundali charts (D1–D60), 12-house Ashtakavarga strength
                      scores, Vimshottari Dasha chapters, and KP sub-lords.
                    </p>
                  </div>

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="Current Life Chapter (Dasha)"
                      value={`${vedicReport.activeMahadasha.lord} – ${vedicReport.activeAntardasha.lord}`}
                      plainHint={DASHA_PLAIN_GUIDE[vedicReport.activeMahadasha.lord]?.chapterTitle}
                      benchmarkText={`Ends ${vedicReport.activeMahadasha.endDate}`}
                      status={{
                        tone: 'info',
                        label: `${vedicReport.activeMahadasha.progressPercent}% complete`,
                      }}
                      icon={<Clock className="w-4 h-4" />}
                    />

                    {atmakaraka && (
                      <KpiStatCard
                        label="Soul Indicator (Atmakaraka)"
                        value={`${atmakaraka.symbol} ${atmakaraka.planetName}`}
                        subvalue={atmakaraka.degreeInSign}
                        plainHint="Planet at highest degree—shows your deepest soul lesson"
                        benchmarkText={`D9 Sign: ${atmakaraka.navamshaSignName}`}
                        status={{ tone: 'optimal', label: 'Jaimini AK' }}
                        icon={<Sparkles className="w-4 h-4" />}
                      />
                    )}

                    <KpiStatCard
                      label="Strongest House (SAV)"
                      value={`House ${topSavHouse.house}`}
                      subvalue={`${topSavHouse.bindus} pts`}
                      plainHint={HOUSE_PLAIN_GUIDE[topSavHouse.house]?.shortTitle}
                      benchmarkText={`Total chart points: ${totalSavBindus}`}
                      status={{ tone: 'optimal', label: topSavHouse.signName }}
                      icon={<Activity className="w-4 h-4" />}
                    />

                    <KpiStatCard
                      label="Special Chart Yogas"
                      value={vedicReport.yogas.length}
                      plainHint="Notable planetary combinations active in your chart"
                      benchmarkText="Parashara & Phaladeepika"
                      status={{ tone: 'favorable', label: 'Active Combinations' }}
                      icon={<BookOpen className="w-4 h-4" />}
                      actionLabel="Read Yoga details"
                      onAction={() => handleNavigate('CANON')}
                    />
                  </div>

                  {/* Row 2: Visual Kundali + 12-House SAV Benchmark Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-5 obs-card p-5 sm:p-6 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          Divisional Kundali Charts (D1–D60)
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                          D1 = Root Life • D9 = Marriage &amp; Soul • D10 = Career
                        </p>
                      </div>
                      <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-bold text-[var(--text)]">
                            12-House Strength Scores vs. 28-Point Average
                          </h2>
                          <p className="text-sm text-[var(--text-muted)]">
                            Green bars (30+) indicate natural ease; red bars (&lt;25) indicate areas
                            that reward patience and steady habits.
                          </p>
                        </div>
                        <StatusBadge tone="info" label={`Total ${totalSavBindus} Points`} />
                      </div>

                      <BenchmarkBarChart
                        items={savBarItems}
                        benchmarkValue={28}
                        highThreshold={30}
                        lowThreshold={25}
                        benchmarkLabel="28 Avg Benchmark"
                        ariaLabel="12-house Sarvashtakavarga bindu comparison bar chart"
                      />

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--sage)] inline-block" />
                          30+ Points (Strong Natural Support)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--accent)] inline-block" />
                          25–29 Points (Balanced)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[var(--crimson)] inline-block" />
                          &lt;25 Points (Steady Effort Needed)
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
                            label: 'Life Chapters (Vimshottari Dashas)',
                            count: vedicReport.dashas.length,
                          },
                          {
                            id: 'ASHTAKAVARGA_JAIMINI',
                            label: 'Planet-by-Planet Scores & Soul Roles',
                            count: 7,
                          },
                          {
                            id: 'KP_SUBLORDS',
                            label: 'KP Sub-Lords & Horary (1–249)',
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
                          const plainGuide = DASHA_PLAIN_GUIDE[d.lord];
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
                                    {d.lord} Chapter ({d.years} Years)
                                  </span>
                                  {plainGuide && (
                                    <span className="text-[var(--text-secondary)]">
                                      — {plainGuide.chapterTitle}
                                    </span>
                                  )}
                                  {d.isCurrent && (
                                    <StatusBadge
                                      tone="optimal"
                                      label={`Active Now (${d.progressPercent}%)`}
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
                                        <strong>Best Focus:</strong> {plainGuide.bestFocus} •{' '}
                                        <strong>Watch Out For:</strong> {plainGuide.watchOutFor}
                                      </p>
                                      {dashaFruit && (
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
                                            {d.lord} – {antar.lord}
                                          </span>
                                          {antar.isCurrent && (
                                            <span className="text-xs font-mono font-bold">
                                              ACTIVE
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs font-mono opacity-85 mt-1">
                                          {antar.startDate} to {antar.endDate}
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
                                <th className="py-2.5 px-2 text-left font-sans">Planet BAV</th>
                                {ZODIAC_SIGNS.map((z) => (
                                  <th key={z.index} className="py-2.5 px-1.5" title={z.sanskrit}>
                                    <div>{z.symbol}</div>
                                    <div className="text-xs">{z.name.slice(0, 3)}</div>
                                  </th>
                                ))}
                                <th className="py-2.5 px-2 text-[var(--accent)]">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {Object.entries(vedicReport.bhinnashtakavarga).map(
                                ([planetName, arr]) => {
                                  const rowSum = arr.reduce((a, b) => a + b, 0);
                                  return (
                                    <tr key={planetName} className="hover:bg-[var(--bg-elevated)]">
                                      <td className="py-2.5 px-2 text-left font-sans font-semibold text-[var(--text)]">
                                        {planetName}
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
                                  Total SAV
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
                            Seven Jaimini Soul Significators (Chara Karakas)
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
                                  {ck.symbol} {ck.planetName} — {ck.karakaName}
                                </div>
                                <div className="text-xs font-mono text-[var(--text-secondary)]">
                                  D1: {ck.signName} • D9: <strong>{ck.navamshaSignName}</strong>
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
                                <th className="py-2.5 px-2">Planet</th>
                                <th className="py-2.5 px-2">Sidereal DMS</th>
                                <th className="py-2.5 px-2">Sign Lord</th>
                                <th className="py-2.5 px-2">Star Lord</th>
                                <th className="py-2.5 px-2 text-[var(--accent)]">KP Sub-Lord</th>
                                <th className="py-2.5 px-2">Sub-Sub</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {vedicReport.kpPlanets.map((row) => (
                                <tr key={row.label} className="hover:bg-[var(--bg-elevated)]">
                                  <td className="py-2.5 px-2 font-semibold text-[var(--text)]">
                                    {row.symbol} {row.label}
                                  </td>
                                  <td className="py-2.5 px-2 font-mono text-[var(--text-secondary)]">
                                    {row.longitudeDMS}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text-secondary)]">
                                    {row.signLord}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text)] font-medium">
                                    {row.starLord}
                                  </td>
                                  <td className="py-2.5 px-2 font-bold text-[var(--accent)]">
                                    {row.subLord}
                                  </td>
                                  <td className="py-2.5 px-2 text-[var(--text-muted)]">
                                    {row.subSubLord}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="lg:col-span-5 obs-panel p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[var(--text)]">
                              KP Horary Question (Pick 1–249)
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
                            Number #{vedicReport.kpHorary.horaryNumber} →{' '}
                            {vedicReport.kpHorary.ascendantSign} ({vedicReport.kpHorary.ascendantDMS}
                            )
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-mono">
                            <StatusBadge
                              tone="neutral"
                              label={`Sign: ${vedicReport.kpHorary.signLord}`}
                            />
                            <StatusBadge
                              tone="neutral"
                              label={`Star: ${vedicReport.kpHorary.starLord}`}
                            />
                            <StatusBadge
                              tone="info"
                              label={`Sub: ${vedicReport.kpHorary.subLord}`}
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
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto obs-card p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Birth Profile &amp; Calculation Settings
                </h2>
                <p className="text-sm text-[var(--text-muted)] font-mono mt-0.5">
                  Nepali Bikram Sambat: {birthBsDate.formattedEn} ({birthBsDate.formattedNp}) •{' '}
                  {formatUtcOffset(profile.location.timezoneOffsetHours)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  First name
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
                  Middle name
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
                  Last name
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
                  Birth date (YYYY / MM / DD)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="number"
                    value={profile.year}
                    onChange={(e) =>
                      setProfile({ ...profile, year: parseInt(e.target.value, 10) || 1996 })
                    }
                    className="obs-input font-mono"
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
                    className="obs-input font-mono"
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
                    className="obs-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)] font-medium block mb-1">
                  Birth time (24h HH : MM : SS)
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
                    className="obs-input font-mono disabled:opacity-40"
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
                    className="obs-input font-mono disabled:opacity-40"
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
                    className="obs-input font-mono disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <GlobalLocationPicker
              label="Birth city & coordinates (Nepal & global)"
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
                <span>Unknown exact birth time (Solar / Moon chart mode)</span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-[var(--text-secondary)] font-medium">House system:</span>
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
                <span>Apply &amp; Open Easy Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn-editorial-primary text-sm px-6"
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
