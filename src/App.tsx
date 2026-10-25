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
  Printer,
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
import { PLANET_TREATISES } from './data/classicalCompendium';
import {
  LandingPage,
  ObservatoryStudioTab,
  WebsiteDestination,
} from './components/LandingPage';
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

  // UI Shell states
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [expandedDashaLord, setExpandedDashaLord] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  // Keyboard Escape handler for modal & mobile drawer (WCAG 2.1 AA)
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
    return calculatePanchang(new Date(), profile.location, moon.nakshatraIndex, moon.signIndex);
  }, [profile.location, natalChart]);

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

  // ==================== MODE 1: CLEAN MARKETING LANDING PAGE ====================
  if (activeDest === 'HOME') {
    return (
      <LandingPage
        profile={profile}
        onProfileChange={setProfile}
        natalChart={natalChart}
        vedicReport={vedicReport}
        panchangReport={panchangReport}
        numerologyReport={numerologyReport}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={handleNavigate}
      />
    );
  }

  // ==================== MODE 2: UNIFIED LEFT-SIDEBAR WORKSPACE SHELL ====================
  const sidebarGroups: {
    groupLabel: string;
    items: {
      key: string;
      label: string;
      icon: JSX.Element;
      isActive: boolean;
      onClick: () => void;
    }[];
  }[] = [
    {
      groupLabel: 'Decisions & Daily Sky',
      items: [
        {
          key: 'overview',
          label: 'Overview',
          icon: <Compass className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'SYNTHESIS',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' }),
        },
        {
          key: 'action-timing',
          label: 'Action Timing',
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
          label: 'Natal & Ephemeris',
          icon: <Sun className="w-4 h-4" />,
          isActive: activeDest === 'OBSERVATORY' && studioTab === 'WESTERN',
          onClick: () => handleNavigate('OBSERVATORY', { studioTab: 'WESTERN' }),
        },
        {
          key: 'vedic-sav',
          label: 'Vedic, SAV & KP',
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
      groupLabel: 'Classical Reference',
      items: [
        {
          key: 'nakshatras',
          label: '28 Nakshatras',
          icon: <Sparkles className="w-4 h-4" />,
          isActive: activeDest === 'NAKSHATRAS',
          onClick: () => handleNavigate('NAKSHATRAS'),
        },
        {
          key: 'library',
          label: 'Source Library',
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
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              ☉
            </div>
            <div>
              <div className="font-display font-bold text-base tracking-tight text-[var(--text)] leading-none">
                Oceanology
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Workspace</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-5" aria-label="Workspace modules">
          {sidebarGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <div className="px-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                {group.groupLabel}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    item.isActive
                      ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom Natal Card + Back to Landing */}
      <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="w-full p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] text-left transition space-y-1"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text)] truncate">
              {profile.firstName} {profile.lastName}
            </span>
            <Sliders className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
            {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName} Asc •{' '}
            {moonPlanet.nakshatraName}
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('HOME')}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* ==================== DESKTOP LEFT SIDEBAR ==================== */}
      <aside className="hidden lg:block w-[248px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen overflow-y-auto">
        <SidebarNavContent />
      </aside>

      {/* ==================== MOBILE SLIDE-OVER SIDEBAR ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[264px] max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] h-full overflow-y-auto z-10">
            <SidebarNavContent />
          </aside>
        </div>
      )}

      {/* ==================== MAIN CONTENT COLUMN ==================== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Global Context Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm font-bold text-[var(--text)] truncate">
                {currentViewLabel}
              </span>
              {isSampleProfile && (
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-medium hover:underline"
                >
                  <span>Sample profile • Set your birth data</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Global Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] text-xs font-medium transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden md:inline text-[var(--text)]">
                {profile.firstName} • {profile.location.name.split(' ')[0]}
              </span>
              <span className="md:hidden text-[var(--text)]">Profile</span>
            </button>

            <select
              aria-label="Zodiac Ayanamsha mode"
              value={ayanamsha}
              onChange={(e) => setAyanamsha(e.target.value as AyanamshaMode)}
              className="obs-input py-1.5 px-2.5 text-xs font-mono hidden sm:block w-auto"
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
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print current view"
              className="hidden sm:inline-flex p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] transition"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
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
                    <div>
                      <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                        {profile.firstName} {profile.lastName} — Personal Overview
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName}{' '}
                        {natalChart.ascendant.formattedDMS} Ascendant • Birth Star:{' '}
                        {moonPlanet.nakshatraName} (Pada {moonPlanet.nakshatraPada}) • B.S.{' '}
                        {birthBsDate.formattedEn}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleNavigate('WHAT_HAPPENS_IF')}
                        className="btn-editorial-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Check Action Timing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('CANON')}
                        className="btn-editorial-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Natal Readings</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 1: 4 Contextual KPI Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="4-System Concordance"
                      value={`${synthesisReport.overallResonanceScore}/100`}
                      benchmarkText={synthesisReport.resonanceTier}
                      status={{
                        tone:
                          synthesisReport.overallResonanceScore >= 75 ? 'optimal' : 'favorable',
                        label: 'Aligned',
                      }}
                      icon={<Activity className="w-4 h-4" />}
                    />

                    <KpiStatCard
                      label="Active Vimshottari Dasha"
                      value={`${vedicReport.activeMahadasha.lord} – ${vedicReport.activeAntardasha.lord}`}
                      benchmarkText={`${vedicReport.activeMahadasha.progressPercent}% of ${vedicReport.activeMahadasha.years}y cycle`}
                      status={{ tone: 'info', label: `Until ${vedicReport.activeMahadasha.endDate}` }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel="Explore Dasha timeline"
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label="Strongest SAV House"
                      value={`House ${topSavHouse.house}`}
                      subvalue={`${topSavHouse.bindus} bindus`}
                      benchmarkText={`+${topSavHouse.bindus - 28} vs 28 house average`}
                      status={{ tone: 'optimal', label: topSavHouse.signName }}
                      icon={<Sparkles className="w-4 h-4" />}
                      actionLabel="View 12-house SAV chart"
                      onAction={() => setStudioTab('VEDIC_KP')}
                    />

                    <KpiStatCard
                      label="Personal Year & Life Path"
                      value={`Year ${numerologyReport.personalYear.final}`}
                      subvalue={`LP #${numerologyReport.lifePath.final}`}
                      benchmarkText={`Month ${numerologyReport.personalMonth.singleDigit} • Day ${numerologyReport.personalDay.singleDigit}`}
                      status={{ tone: 'favorable', label: numSystem }}
                      icon={<Hash className="w-4 h-4" />}
                      actionLabel="25-year ColorChart"
                      onAction={() => setStudioTab('NUMEROLOGY')}
                    />
                  </div>

                  {/* Executive Summary Card */}
                  <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1 max-w-4xl">
                      <div className="text-xs font-semibold text-[var(--accent)]">
                        Cross-System Executive Summary
                      </div>
                      <p className="text-sm sm:text-base font-medium text-[var(--text)] leading-relaxed">
                        {synthesisReport.synthesisSummary}
                      </p>
                    </div>

                    <SegmentedTabs
                      ariaLabel="Overview sections"
                      value={synthesisSubTab}
                      onChange={setSynthesisSubTab}
                      items={[
                        { id: 'OVERVIEW', label: 'Charts & 4 Pillars' },
                        { id: 'TIMELINE_12YR', label: '12-Year Horizon', count: 12 },
                        {
                          id: 'DOSSIER_QA',
                          label: 'Synthesis Q&A',
                          count: synthesisReport.aiCopilotPrompts.length,
                        },
                      ]}
                    />
                  </div>

                  {synthesisSubTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                      {/* Dual Visual Charts Band */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 obs-card p-5 space-y-3">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                              <h2 className="text-base font-bold text-[var(--text)]">
                                Ecliptic Natal Wheel
                              </h2>
                              <p className="text-xs text-[var(--text-muted)]">
                                {ayanamsha} zodiac • {houseSystem} houses
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('WESTERN')}
                              className="text-xs font-semibold text-[var(--accent)] hover:underline"
                            >
                              Full ephemeris →
                            </button>
                          </div>
                          <NatalWheelSvg chart={natalChart} />
                        </div>

                        <div className="lg:col-span-5 obs-card p-5 space-y-3">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                              <h2 className="text-base font-bold text-[var(--text)]">
                                Divisional Kundali (D1–D60)
                              </h2>
                              <p className="text-xs text-[var(--text-muted)]">
                                Switch across 10 Parashari Vargas
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStudioTab('VEDIC_KP')}
                              className="text-xs font-semibold text-[var(--accent)] hover:underline"
                            >
                              SAV &amp; KP →
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
                            className="obs-card p-5 flex flex-col justify-between gap-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                  {p.domain}
                                </span>
                                <StatusBadge
                                  tone={p.score >= 75 ? 'optimal' : 'info'}
                                  label={`${p.score}%`}
                                />
                              </div>
                              <h3 className="text-base font-bold text-[var(--text)]">
                                {p.headline}
                              </h3>
                              <p className="text-xs text-[var(--text-secondary)]">{p.subheadline}</p>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] pt-2.5 border-t border-[var(--border)] leading-relaxed">
                              {p.keyInsight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {synthesisSubTab === 'TIMELINE_12YR' && (
                    <div className="obs-card p-5 space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-[var(--text)]">
                          12-Year Synchronized Dasha, Personal Year &amp; Transit Horizon
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          Combined annual outlook uniting Vimshottari Dasha lords, Decoz Personal
                          Years, and outer-planet transits
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                        {synthesisReport.unifiedTimeline.map((item) => {
                          const isCurrentYear = item.year === new Date().getFullYear();
                          return (
                            <div
                              key={item.year}
                              className={`p-4 rounded-lg border transition space-y-2 ${
                                isCurrentYear
                                  ? 'border-[var(--accent)] bg-[var(--accent-bg)]/40'
                                  : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                              }`}
                            >
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-bold text-[var(--text)] text-sm">
                                  {item.year}
                                </span>
                                <span className="text-[var(--text-muted)]">Age {item.age}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-slate-950 text-xs"
                                  style={{ backgroundColor: item.numerologyColor }}
                                >
                                  {item.numerologyPersonalYear}
                                </span>
                                <span className="text-[var(--text)] font-medium">
                                  PY {item.numerologyPersonalYear} • Pinnacle{' '}
                                  {item.numerologyPinnacle}
                                </span>
                              </div>
                              <div className="text-xs text-[var(--accent)] font-semibold">
                                {item.vedicDashaLord}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {item.westernTransitTheme}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {synthesisSubTab === 'DOSSIER_QA' && (
                    <div className="obs-card p-5 space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-[var(--text)]">
                          Grounded Synthesis Q&amp;A
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          Answers synthesized directly from your computed ephemeris, Ashtakavarga,
                          and numerology cycles
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {synthesisReport.aiCopilotPrompts.map((item, i) => (
                          <div key={i} className="obs-panel p-4 space-y-1.5">
                            <h3 className="text-sm font-bold text-[var(--text)]">
                              {item.question}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
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
                      <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                        Natal Wheel, Ephemeris &amp; 360° Sabian Symbols
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Geocentric longitudes, daily speeds, birth-time rectification, and exact
                        aspect orbs.
                      </p>
                    </div>
                  </div>

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="Ascendant (Lagna)"
                      value={`${natalChart.ascendant.signSymbol} ${natalChart.ascendant.signName}`}
                      benchmarkText={natalChart.ascendant.formattedDMS}
                      status={{ tone: 'info', label: houseSystem }}
                      icon={<Compass className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label="Natal Sun"
                      value={`${sunPlanet.signSymbol} ${sunPlanet.signName}`}
                      subvalue={`House ${sunPlanet.house}`}
                      benchmarkText={`${sunPlanet.formattedDMS} • ${sunPlanet.nakshatraName}`}
                      status={{ tone: 'favorable', label: sunPlanet.dignity }}
                      icon={<Sun className="w-4 h-4" />}
                    />
                    <KpiStatCard
                      label="Natal Moon"
                      value={`${moonPlanet.signSymbol} ${moonPlanet.signName}`}
                      subvalue={`House ${moonPlanet.house}`}
                      benchmarkText={`${moonPlanet.nakshatraName} Pada ${moonPlanet.nakshatraPada}`}
                      status={{ tone: 'optimal', label: 'Janma Star' }}
                      icon={<Moon className="w-4 h-4" />}
                      actionLabel="Inspect Moon star"
                      onAction={() =>
                        handleNavigate('NAKSHATRAS', { nakIdx: moonPlanet.nakshatraIndex })
                      }
                    />
                    <KpiStatCard
                      label="Active Aspects"
                      value={natalChart.aspects.length}
                      benchmarkText={`Rectification: ${
                        minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`
                      }`}
                      status={{ tone: 'neutral', label: ayanamsha }}
                    />
                  </div>

                  {/* Row 2: Wheel + Ephemeris Table */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 obs-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-[var(--text)]">
                          Interactive Wheel &amp; Rectification
                        </h2>
                        {minuteShift !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMinuteShift(0)}
                            className="text-xs font-semibold text-[var(--accent)] hover:underline"
                          >
                            Reset 0m
                          </button>
                        )}
                      </div>

                      <div className="obs-panel p-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">
                          Shift time:
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

                    <div className="lg:col-span-7 obs-card p-5 space-y-3">
                      <div>
                        <h2 className="text-base font-bold text-[var(--text)]">
                          Planetary Ephemeris Table
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          Click any Nakshatra link to inspect its 4 Navamsha Padas and action rules
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-mono">
                              <th className="py-2.5 px-2">Body</th>
                              <th className="py-2.5 px-2">Sign &amp; DMS</th>
                              <th className="py-2.5 px-2">House</th>
                              <th className="py-2.5 px-2">Nakshatra</th>
                              <th className="py-2.5 px-2">Speed</th>
                              <th className="py-2.5 px-2">Dignity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            <tr className="bg-[var(--bg-elevated)] font-semibold">
                              <td className="py-2 px-2 text-[var(--accent)]">ASC (Lagna)</td>
                              <td className="py-2 px-2 font-mono text-[var(--text)]">
                                {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName}{' '}
                                {natalChart.ascendant.formattedDMS}
                              </td>
                              <td className="py-2 px-2 font-mono">H1</td>
                              <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                              <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                Horizon
                              </td>
                              <td className="py-2 px-2 text-[var(--text-secondary)]">Angle</td>
                            </tr>
                            <tr className="bg-[var(--bg-elevated)] font-semibold">
                              <td className="py-2 px-2 text-[var(--accent)]">MC (Midheaven)</td>
                              <td className="py-2 px-2 font-mono text-[var(--text)]">
                                {natalChart.midheaven.signSymbol} {natalChart.midheaven.signName}{' '}
                                {natalChart.midheaven.formattedDMS}
                              </td>
                              <td className="py-2 px-2 font-mono">H10</td>
                              <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                              <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                Meridian
                              </td>
                              <td className="py-2 px-2 text-[var(--text-secondary)]">Zenith</td>
                            </tr>
                            {natalChart.planets.map((p) => (
                              <tr key={p.id} className="hover:bg-[var(--bg-elevated)]/60">
                                <td className="py-2.5 px-2 font-semibold text-[var(--text)] whitespace-nowrap">
                                  <span className="mr-1.5" style={{ color: p.color }}>
                                    {p.symbol}
                                  </span>
                                  {p.name}
                                  {p.isRetrograde && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[var(--amber-bg)] text-[var(--amber)] text-[10px] font-mono">
                                      R
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 font-mono text-[var(--text)] whitespace-nowrap">
                                  {p.signSymbol} {p.signName} {p.formattedDMS}
                                </td>
                                <td className="py-2.5 px-2 font-mono text-[var(--accent)] font-semibold">
                                  H{p.house}
                                </td>
                                <td className="py-2.5 px-2">
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
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 font-mono text-[var(--text-muted)] tabular-nums">
                                  {p.speedDegPerDay >= 0
                                    ? `+${p.speedDegPerDay.toFixed(2)}°`
                                    : `${p.speedDegPerDay.toFixed(2)}°`}
                                </td>
                                <td className="py-2.5 px-2">
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
                  <div className="obs-card p-5 space-y-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                        {natalChart.aspects.map((asp, i) => (
                          <div
                            key={i}
                            className="obs-panel px-3.5 py-2.5 flex items-center justify-between gap-2"
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
                            <span className="font-mono text-[var(--text-muted)] tabular-nums">
                              {asp.orb.toFixed(2)}° {asp.applying ? 'App' : 'Sep'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {westernSubTab === 'SABIAN' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {natalChart.planets.map((p) => (
                          <div key={p.id} className="obs-panel p-3.5 space-y-1">
                            <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                              <span style={{ color: p.color }}>{p.symbol}</span>
                              <span>
                                {p.name} — {p.signName} {p.formattedDMS}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] font-serif italic text-sm leading-relaxed">
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
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                      Vedic Kundali, Sarvashtakavarga &amp; KP Sub-Lords
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                      10 Shodashvarga harmonics, 337-bindu house strength benchmarks, Jaimini
                      Karakas, and Krishnamurti Paddhati.
                    </p>
                  </div>

                  {/* Row 1: 4 Contextual KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiStatCard
                      label="Active Vimshottari Period"
                      value={`${vedicReport.activeMahadasha.lord} – ${vedicReport.activeAntardasha.lord}`}
                      benchmarkText={`Ends ${vedicReport.activeMahadasha.endDate}`}
                      status={{
                        tone: 'info',
                        label: `${vedicReport.activeMahadasha.progressPercent}% elapsed`,
                      }}
                      icon={<Clock className="w-4 h-4" />}
                    />

                    {atmakaraka && (
                      <KpiStatCard
                        label="Atmakaraka (Soul Planet)"
                        value={`${atmakaraka.symbol} ${atmakaraka.planetName}`}
                        subvalue={atmakaraka.degreeInSign}
                        benchmarkText={`Karakamsha (D9): ${atmakaraka.navamshaSignName}`}
                        status={{ tone: 'optimal', label: 'Jaimini AK' }}
                        icon={<Sparkles className="w-4 h-4" />}
                      />
                    )}

                    <KpiStatCard
                      label="Peak SAV House"
                      value={`House ${topSavHouse.house}`}
                      subvalue={`${topSavHouse.bindus} bindus`}
                      benchmarkText={`Canonical total: ${totalSavBindus} bindus`}
                      status={{ tone: 'optimal', label: topSavHouse.signName }}
                      icon={<Activity className="w-4 h-4" />}
                    />

                    <KpiStatCard
                      label="Detected Classical Yogas"
                      value={vedicReport.yogas.length}
                      benchmarkText="Parashara & Phaladeepika"
                      status={{ tone: 'favorable', label: 'Active Combinations' }}
                      icon={<BookOpen className="w-4 h-4" />}
                      actionLabel="Read Yoga details"
                      onAction={() => handleNavigate('CANON')}
                    />
                  </div>

                  {/* Row 2: Visual Kundali + 12-House SAV Benchmark Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-5 obs-card p-5 space-y-3">
                      <div>
                        <h2 className="text-base font-bold text-[var(--text)]">
                          Shodashvarga Divisional Kundali
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          Inspect D1 Rashi, D9 Navamsha, D10 Dashamsha &amp; 7 more Vargas
                        </p>
                      </div>
                      <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5 flex flex-col justify-between space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-[var(--text)]">
                            12-House Sarvashtakavarga Strength vs 28-Bindu Benchmark
                          </h2>
                          <p className="text-xs text-[var(--text-muted)]">
                            Houses scoring 30+ bindus (green) carry strong transit support; houses
                            below 25 (red) require extra discipline.
                          </p>
                        </div>
                        <StatusBadge tone="info" label={`Total ${totalSavBindus} Bindus`} />
                      </div>

                      <BenchmarkBarChart
                        items={savBarItems}
                        benchmarkValue={28}
                        highThreshold={30}
                        lowThreshold={25}
                        benchmarkLabel="28 Avg Benchmark"
                        ariaLabel="12-house Sarvashtakavarga bindu comparison bar chart"
                      />

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--sage)] inline-block" />
                          30+ Bindus (High Tailwind)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)] inline-block" />
                          25–29 Bindus (Balanced)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--crimson)] inline-block" />
                          &lt;25 Bindus (High Effort)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Progressive Disclosure Tabs (Dashas | Full BAV & Jaimini | KP Sub-Lords) */}
                  <div className="obs-card p-5 space-y-5">
                    <div className="border-b border-[var(--border)] pb-4">
                      <SegmentedTabs
                        ariaLabel="Vedic detail tables"
                        value={vedicSubTab}
                        onChange={setVedicSubTab}
                        items={[
                          {
                            id: 'DASHA',
                            label: 'Vimshottari Dashas',
                            count: vedicReport.dashas.length,
                          },
                          {
                            id: 'ASHTAKAVARGA_JAIMINI',
                            label: '7-Planet BAV Matrix & Jaimini Karakas',
                            count: 7,
                          },
                          {
                            id: 'KP_SUBLORDS',
                            label: 'KP Sub-Lords & 1–249 Horary',
                          },
                        ]}
                      />
                    </div>

                    {vedicSubTab === 'DASHA' && (
                      <div className="space-y-2.5">
                        {vedicReport.dashas.map((d) => {
                          const isOpen =
                            expandedDashaLord === d.lord ||
                            (expandedDashaLord === null && d.isCurrent);
                          const dashaFruit = PLANET_TREATISES[d.lord]?.dashaGeneralFruit;
                          return (
                            <div
                              key={d.lord}
                              className={`rounded-lg border transition ${
                                d.isCurrent
                                  ? 'border-[var(--accent)] bg-[var(--accent-bg)]/25'
                                  : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setExpandedDashaLord(isOpen ? 'NONE' : d.lord)}
                                className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-[var(--accent)]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                  )}
                                  <span className="font-bold text-[var(--text)] text-sm">
                                    {d.lord} Mahadasha ({d.years} Years)
                                  </span>
                                  {d.isCurrent && (
                                    <StatusBadge
                                      tone="optimal"
                                      label={`Current (${d.progressPercent}%)`}
                                    />
                                  )}
                                </div>
                                <span className="font-mono text-[var(--text-secondary)]">
                                  {d.startDate} → {d.endDate}
                                </span>
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] space-y-3 text-xs">
                                  {dashaFruit && (
                                    <p className="text-[var(--text-secondary)] bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] leading-relaxed">
                                      <strong>Classical Period Theme:</strong> {dashaFruit}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {d.antardashas.map((antar) => (
                                      <div
                                        key={antar.lord}
                                        className={`p-2.5 rounded-lg border ${
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
                                            <span className="text-[10px] font-mono">ACTIVE</span>
                                          )}
                                        </div>
                                        <div className="text-[11px] font-mono opacity-80 mt-0.5">
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
                          <table className="w-full text-xs border-collapse text-center font-mono">
                            <thead>
                              <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)]">
                                <th className="py-2 px-2 text-left font-sans">Planet BAV</th>
                                {ZODIAC_SIGNS.map((z) => (
                                  <th key={z.index} className="py-2 px-1.5" title={z.sanskrit}>
                                    <div>{z.symbol}</div>
                                    <div className="text-[10px]">{z.name.slice(0, 3)}</div>
                                  </th>
                                ))}
                                <th className="py-2 px-2 text-[var(--accent)]">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {Object.entries(vedicReport.bhinnashtakavarga).map(
                                ([planetName, arr]) => {
                                  const rowSum = arr.reduce((a, b) => a + b, 0);
                                  return (
                                    <tr key={planetName} className="hover:bg-[var(--bg-elevated)]">
                                      <td className="py-2 px-2 text-left font-sans font-semibold text-[var(--text)]">
                                        {planetName}
                                      </td>
                                      {arr.map((val, sIdx) => (
                                        <td
                                          key={sIdx}
                                          className={`py-2 px-1.5 tabular-nums ${
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
                                      <td className="py-2 px-2 font-bold text-[var(--text)] tabular-nums">
                                        {rowSum}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}

                              <tr className="bg-[var(--bg-elevated)] border-t-2 border-[var(--border-strong)] font-bold">
                                <td className="py-2.5 px-2 text-left font-sans text-[var(--accent)]">
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
                                      className={`py-2.5 px-1.5 tabular-nums ${
                                        pts >= 30
                                          ? 'text-[var(--sage)]'
                                          : pts < 25
                                          ? 'text-[var(--crimson)]'
                                          : 'text-[var(--text)]'
                                      }`}
                                    >
                                      <div>{pts}</div>
                                      <div className="text-[9px] text-[var(--text-muted)]">
                                        H{savEntry?.house}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="py-2.5 px-2 text-[var(--accent)] tabular-nums">
                                  {totalSavBindus}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                          <h3 className="text-sm font-bold text-[var(--text)]">
                            Seven Jaimini Chara Karakas
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {vedicReport.charaKarakas.map((ck) => (
                              <div key={ck.karakaCode} className="obs-panel p-3.5 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <StatusBadge
                                    tone={ck.karakaCode === 'AK' ? 'optimal' : 'info'}
                                    label={ck.karakaCode}
                                  />
                                  <span className="text-[var(--text-muted)]">
                                    {ck.degreeInSign}
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-[var(--text)]">
                                  {ck.symbol} {ck.planetName} — {ck.karakaName}
                                </div>
                                <div className="text-xs font-mono text-[var(--text-secondary)]">
                                  D1: {ck.signName} • D9: <strong>{ck.navamshaSignName}</strong>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{ck.domain}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {vedicSubTab === 'KP_SUBLORDS' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-mono">
                                <th className="py-2 px-2">Planet</th>
                                <th className="py-2 px-2">Sidereal DMS</th>
                                <th className="py-2 px-2">Sign Lord</th>
                                <th className="py-2 px-2">Star Lord</th>
                                <th className="py-2 px-2 text-[var(--accent)]">KP Sub-Lord</th>
                                <th className="py-2 px-2">Sub-Sub</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {vedicReport.kpPlanets.map((row) => (
                                <tr key={row.label} className="hover:bg-[var(--bg-elevated)]">
                                  <td className="py-2 px-2 font-semibold text-[var(--text)]">
                                    {row.symbol} {row.label}
                                  </td>
                                  <td className="py-2 px-2 font-mono text-[var(--text-secondary)]">
                                    {row.longitudeDMS}
                                  </td>
                                  <td className="py-2 px-2 text-[var(--text-secondary)]">
                                    {row.signLord}
                                  </td>
                                  <td className="py-2 px-2 text-[var(--text)] font-medium">
                                    {row.starLord}
                                  </td>
                                  <td className="py-2 px-2 font-bold text-[var(--accent)]">
                                    {row.subLord}
                                  </td>
                                  <td className="py-2 px-2 text-[var(--text-muted)]">
                                    {row.subSubLord}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="lg:col-span-5 obs-panel p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[var(--text)]">
                              KP Horary Prashna (Seed 1–249)
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
                              className="w-20 obs-input py-1 font-mono font-bold text-center text-xs"
                            />
                          </div>
                          <div className="text-base font-bold text-[var(--text)]">
                            Horary #{vedicReport.kpHorary.horaryNumber} →{' '}
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
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
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
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto obs-card p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">
                  Birth Profile &amp; Horizon Settings
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  Bikram Sambat: {birthBsDate.formattedEn} ({birthBsDate.formattedNp}) •{' '}
                  {formatUtcOffset(profile.location.timezoneOffsetHours)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border)] text-xs">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.unknownTime}
                  onChange={(e) => setProfile({ ...profile, unknownTime: e.target.checked })}
                  className="accent-[var(--accent)]"
                />
                <span>Unknown birth time (Chandra / Solar chart mode)</span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-[var(--text-secondary)] font-medium">House system:</span>
                <select
                  value={houseSystem}
                  onChange={(e) => setHouseSystem(e.target.value as HouseSystem)}
                  className="obs-input py-1.5 text-xs w-auto"
                >
                  <option value="PLACIDUS">Placidus</option>
                  <option value="WHOLE_SIGN">Whole Sign (Rashi)</option>
                  <option value="EQUAL">Equal House</option>
                  <option value="SRIPATI">Sripati Porphyry</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn-editorial-primary text-xs px-5"
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
