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

export function App() {
  const [profile, setProfile] = useState<BirthProfile>(DEFAULT_PROFILE);
  const [partnerProfile, setPartnerProfile] = useState<BirthProfile>(PARTNER_DEFAULT_PROFILE);
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>('LAHIRI');
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('PLACIDUS');
  const [numSystem, setNumSystem] = useState<NumerologySystem>('PYTHAGOREAN');
  const [minuteShift, setMinuteShift] = useState<number>(0);

  // Primary Multi-Destination Website Route (Default: Grand Editorial HOME)
  const [activeDest, setActiveDest] = useState<WebsiteDestination>('HOME');
  const [studioTab, setStudioTab] = useState<ObservatoryStudioTab>('SYNTHESIS');

  // Deep-link states across portals
  const [targetNakIdx, setTargetNakIdx] = useState<number | undefined>(undefined);
  const [targetActionId, setTargetActionId] = useState<string | undefined>(undefined);
  const [targetBookId, setTargetBookId] = useState<string | undefined>(undefined);

  // Studio internal sub-tabs
  const [synthesisSubTab, setSynthesisSubTab] = useState<
    'OVERVIEW' | 'TIMELINE_12YR' | 'DOSSIER_QA'
  >('OVERVIEW');
  const [westernSubTab, setWesternSubTab] = useState<'WHEEL_EPHEMERIS' | 'ASPECTS_SABIAN'>(
    'WHEEL_EPHEMERIS'
  );
  const [vedicSubTab, setVedicSubTab] = useState<
    'KUNDALI_DASHA' | 'ASHTAKAVARGA_JAIMINI' | 'KP_SUBLORDS'
  >('KUNDALI_DASHA');

  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [expandedDashaLord, setExpandedDashaLord] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const formatUtcOffset = (hrs: number) => {
    const sign = hrs >= 0 ? '+' : '-';
    const abs = Math.abs(hrs);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const studioChapters: {
    id: ObservatoryStudioTab;
    label: string;
    icon: JSX.Element;
  }[] = [
    { id: 'SYNTHESIS', label: 'Overview & Concordance', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'WESTERN', label: 'Natal Wheel & 360°', icon: <Sun className="w-3.5 h-3.5" /> },
    {
      id: 'VEDIC_KP',
      label: 'Jyotish, Ashtakavarga & KP',
      icon: <Moon className="w-3.5 h-3.5" />,
    },
    {
      id: 'PANCHANG',
      label: 'Nepali Patro & Panchang',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    { id: 'ASTROCARTOGRAPHY', label: 'World Map', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'NUMEROLOGY', label: 'Decoz & Cheiro', icon: <Hash className="w-3.5 h-3.5" /> },
    { id: 'SYNASTRY', label: '36-Guna Synastry', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
  ];

  const totalSavBindus = useMemo(
    () => vedicReport.sarvashtakavarga.reduce((acc, s) => acc + s.bindus, 0),
    [vedicReport.sarvashtakavarga]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ==================== ARCHITECTURAL WEBSITE MASTHEAD ==================== */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur border-b border-[var(--border-strong)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Engraved Monograph Masthead + Primary Website Destinations */}
          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => handleNavigate('HOME')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 border border-[var(--text)] bg-[var(--bg-elevated)] flex items-center justify-center font-serif font-bold text-lg text-[var(--brass)] group-hover:bg-[var(--text)] group-hover:text-[var(--surface)] transition">
                ☉
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-tight text-[var(--text)] leading-none">
                  OCEANOLOGY
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-muted)] mt-0.5">
                  Celestial Monograph
                </div>
              </div>
            </button>

            {/* Primary Website Navigation Bar */}
            <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs font-medium">
              {[
                { id: 'HOME' as const, label: 'Home' },
                { id: 'NAKSHATRAS' as const, label: '28 Nakshatras' },
                { id: 'WHAT_HAPPENS_IF' as const, label: 'What Happens If...' },
                { id: 'OBSERVATORY' as const, label: 'Personal Observatory' },
                { id: 'CANON' as const, label: 'Sacred Canon' },
              ].map((nav) => {
                const active = activeDest === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => handleNavigate(nav.id)}
                    className={`px-3 py-1.5 transition border-b-2 ${
                      active
                        ? 'border-[var(--brass)] text-[var(--text)] font-semibold bg-[var(--brass-bg)]/50'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {nav.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Utility Cluster: Active Natal Anchor + Ayanamsha + Theme + Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className="flex items-center gap-2 px-3 py-1.5 obs-panel hover:border-[var(--brass)] text-xs transition"
              title="Edit Natal Birth Data & Horizon Coordinates"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--brass)]" />
              <div className="text-left hidden sm:block">
                <span className="font-semibold text-[var(--text)]">
                  {profile.firstName} {profile.lastName}
                </span>{' '}
                <span className="text-[var(--text-muted)] font-mono">
                  • {profile.location.name.split(' ')[0]}
                </span>
              </div>
              <Sliders className="w-3.5 h-3.5 text-[var(--brass)]" />
            </button>

            <select
              value={ayanamsha}
              onChange={(e) => setAyanamsha(e.target.value as AyanamshaMode)}
              className="obs-input py-1.5 text-xs font-mono"
              title="Select Zodiac / Ayanamsha System"
            >
              <option value="LAHIRI">Lahiri (Chitrapaksha)</option>
              <option value="TROPICAL">Tropical (Sayana 0°)</option>
              <option value="KP_NEW">KP New</option>
              <option value="KP_OLD">KP Old</option>
              <option value="RAMAN">B.V. Raman</option>
              <option value="KHULLAR">KP Khullar</option>
            </select>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2.5 py-1.5 obs-panel hover:border-[var(--brass)] text-xs font-mono flex items-center gap-1.5 transition"
              title="Toggle Parchment Light / Obsidian Dark Palette"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-[var(--brass)]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[var(--brass)]" />
              )}
              <span className="hidden md:inline">{darkMode ? 'Parchment' : 'Obsidian'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 obs-panel hover:border-[var(--brass)] text-[var(--text-secondary)] transition"
              title="Print Current Folio"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Universal Natal & Global Location Drawer */}
        {showProfileDrawer && (
          <div className="bg-[var(--surface)] border-t border-[var(--border-strong)] px-4 sm:px-8 py-5 shadow-md">
            <div className="max-w-[1400px] mx-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div>
                  <div className="editorial-eyebrow">Universal Natal &amp; Horizon Ledger</div>
                  <h3 className="text-lg font-serif font-bold text-[var(--text)]">
                    Birth Coordinates, Bikram Sambat Date &amp; House Geometry
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Bikram Sambat: <strong className="text-[var(--brass)]">{birthBsDate.formattedEn} ({birthBsDate.formattedNp})</strong> • Timezone: {formatUtcOffset(profile.location.timezoneOffsetHours)}
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="btn-editorial-primary py-1.5 px-4 text-xs"
                >
                  Apply &amp; Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">
                    First Name
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
                    Middle Name
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
                    Last Name
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
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">
                    Birth Date (YYYY / MM / DD)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
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
                    Birth Time (HH : MM : SS)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
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
                label="Birth Place & Elevation Gazetteer (All 7 Provinces of Nepal + Worldwide Search)"
                value={profile.location}
                onChange={(loc) => setProfile({ ...profile, location: loc })}
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border)] text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.unknownTime}
                      onChange={(e) => setProfile({ ...profile, unknownTime: e.target.checked })}
                      className="accent-[var(--brass)]"
                    />
                    <span>Unknown Birth Time (Chandra / Solar Kundali Mode)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">House System:</span>
                    <select
                      value={houseSystem}
                      onChange={(e) => setHouseSystem(e.target.value as HouseSystem)}
                      className="obs-input py-1"
                    >
                      <option value="PLACIDUS">Placidus</option>
                      <option value="WHOLE_SIGN">Whole Sign (Rashi)</option>
                      <option value="EQUAL">Equal House</option>
                      <option value="SRIPATI">Sripati Porphyry</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--brass)]" />
                  <span className="text-[var(--text-secondary)]">Rectification Shift:</span>
                  <input
                    type="range"
                    min={-120}
                    max={120}
                    value={minuteShift}
                    onChange={(e) => setMinuteShift(parseInt(e.target.value, 10))}
                    className="w-28 accent-[var(--brass)]"
                  />
                  <span className="font-mono text-[var(--brass)] font-bold w-14 text-right">
                    {minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== MAIN MULTI-DESTINATION WEBSITE CANVAS ==================== */}
      <main className="flex-1 w-full">
        {/* 1. HOME — GRAND EDITORIAL LANDING PAGE */}
        {activeDest === 'HOME' && (
          <LandingPage
            profile={profile}
            onProfileChange={setProfile}
            natalChart={natalChart}
            vedicReport={vedicReport}
            panchangReport={panchangReport}
            numerologyReport={numerologyReport}
            onNavigate={handleNavigate}
          />
        )}

        {/* 2. 28 NAKSHATRAS & 108 PADAS ENCYCLOPEDIA */}
        {activeDest === 'NAKSHATRAS' && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
            <NakshatraEncyclopedia
              chart={natalChart}
              initialNakshatraIndex={targetNakIdx}
              onOpenActionSimulator={() => handleNavigate('WHAT_HAPPENS_IF')}
            />
          </div>
        )}

        {/* 3. "WHAT HAPPENS IF..." ELECTIONAL & KARMA-VIPAKA SIMULATOR */}
        {activeDest === 'WHAT_HAPPENS_IF' && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
            <ActionConsequenceLab
              chart={natalChart}
              location={profile.location}
              initialActionId={targetActionId}
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          </div>
        )}

        {/* 4. SACRED CANON & PERSONAL BHAVA EXEGESIS */}
        {activeDest === 'CANON' && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
            <ClassicalBookLibrary
              chart={natalChart}
              vedic={vedicReport}
              initialBookId={targetBookId}
              onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
            />
          </div>
        )}

        {/* 5. PERSONAL OBSERVATORY STUDIO (FULL-WIDTH ARCHITECTURAL CHAMBERS) */}
        {activeDest === 'OBSERVATORY' && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-6">
            {/* Compact Natal Identity Ribbon + Horizontal Studio Chapter Bar */}
            <div className="folio-sheet p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="editorial-eyebrow">Personal Mathematical Observatory</div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                    {profile.firstName} {profile.lastName} — {natalChart.ascendant.signSymbol}{' '}
                    {natalChart.ascendant.signName} {natalChart.ascendant.formattedDMS} Lagna
                  </h2>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                    Janma Rashi: {natalChart.planets[1].sanskritSign} • Janma Star:{' '}
                    {natalChart.planets[1].nakshatraName} (P{natalChart.planets[1].nakshatraPada}) •
                    Dasha: {vedicReport.activeMahadasha.lord}–{vedicReport.activeAntardasha.lord} •
                    B.S.: {birthBsDate.formattedEn}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowProfileDrawer(true)}
                    className="btn-editorial-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[var(--brass)]" />
                    <span>Modify Birth Data</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('WHAT_HAPPENS_IF')}
                    className="btn-editorial-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5 text-[var(--brass)]" />
                    <span>Action Simulator</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Architectural Studio Tabs */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--border)] text-xs font-mono">
                {studioChapters.map((ch) => {
                  const active = studioTab === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setStudioTab(ch.id)}
                      className={`px-3 py-2 border inline-flex items-center gap-1.5 transition ${
                        active
                          ? 'border-[var(--text)] bg-[var(--text)] text-[var(--surface)] font-semibold'
                          : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
                      }`}
                    >
                      {ch.icon}
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STUDIO CHAMBER 1: SYNTHESIS & 4-SYSTEM CONCORDANCE */}
            {studioTab === 'SYNTHESIS' && (
              <div className="space-y-6">
                <div className="obs-card p-6 space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-9 space-y-2">
                      <div className="editorial-eyebrow">
                        {synthesisReport.resonanceTier} • {profile.location.name} (
                        {profile.location.elevationMeters}m)
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] leading-snug">
                        {synthesisReport.synthesisSummary}
                      </h3>
                      <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
                        <button
                          onClick={() => setStudioTab('ASTROCARTOGRAPHY')}
                          className="btn-editorial-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5 text-[var(--brass)]" />
                          <span>World Relocation Lines</span>
                        </button>
                        <button
                          onClick={() => handleNavigate('CANON')}
                          className="btn-editorial-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[var(--brass)]" />
                          <span>Personal 108-Bhava Rulings</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-3 obs-panel p-4 text-center">
                      <div className="editorial-eyebrow">Concordance</div>
                      <div className="text-4xl font-serif font-bold text-[var(--brass)] my-1 tabular-nums">
                        {synthesisReport.overallResonanceScore}
                        <span className="text-lg text-[var(--text-muted)]">/100</span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        4-Engine Alignment
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)] text-xs font-mono">
                    {[
                      { id: 'OVERVIEW' as const, label: 'I. Four Pillars & Dual Astrolabe' },
                      { id: 'TIMELINE_12YR' as const, label: 'II. 12-Year Synchronized Horizon' },
                      { id: 'DOSSIER_QA' as const, label: 'III. Grounded Synthesis Readings' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSynthesisSubTab(tab.id)}
                        className={`px-3.5 py-1.5 border transition ${
                          synthesisSubTab === tab.id
                            ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {synthesisSubTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {synthesisReport.pillars.map((p) => (
                        <div
                          key={p.domain}
                          className="obs-card p-5 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs font-mono mb-2">
                              <span className="text-[var(--text-muted)]">
                                {p.sourceInspiration}
                              </span>
                              <span className="px-2 py-0.5 obs-badge-brass font-bold">
                                {p.score}%
                              </span>
                            </div>
                            <div className="editorial-eyebrow">{p.domain}</div>
                            <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-0.5">
                              {p.headline}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {p.subheadline}
                            </p>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] pt-2.5 border-t border-[var(--border)]">
                            {p.keyInsight}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7 obs-card p-5">
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
                          <div>
                            <span className="editorial-eyebrow">Ecliptic Horizon Projection</span>
                            <h4 className="text-xl font-serif font-bold text-[var(--text)]">
                              Natal Astrolabe Wheel
                            </h4>
                          </div>
                          <button
                            onClick={() => setStudioTab('WESTERN')}
                            className="text-xs font-mono text-[var(--brass)] hover:underline"
                          >
                            Full Ephemeris →
                          </button>
                        </div>
                        <NatalWheelSvg chart={natalChart} />
                      </div>

                      <div className="lg:col-span-5 obs-card p-5">
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
                          <div>
                            <span className="editorial-eyebrow">Parashari Harmonics</span>
                            <h4 className="text-xl font-serif font-bold text-[var(--text)]">
                              Shodashvarga Divisional Kundali
                            </h4>
                          </div>
                          <button
                            onClick={() => setStudioTab('VEDIC_KP')}
                            className="text-xs font-mono text-[var(--brass)] hover:underline"
                          >
                            Ashtakavarga &amp; Dasha →
                          </button>
                        </div>
                        <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                      </div>
                    </div>
                  </div>
                )}

                {synthesisSubTab === 'TIMELINE_12YR' && (
                  <div className="obs-card p-6">
                    <div className="mb-4 border-b border-[var(--border)] pb-2.5">
                      <span className="editorial-eyebrow">Cross-Tradition Chronology</span>
                      <h4 className="text-xl font-serif font-bold text-[var(--text)]">
                        12-Year Synchronized Transit, Vimshottari Dasha &amp; Decoz Pinnacle Horizon
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                      {synthesisReport.unifiedTimeline.map((item) => {
                        const isCurrentYear = item.year === new Date().getFullYear();
                        return (
                          <div
                            key={item.year}
                            className={`p-4 transition ${
                              isCurrentYear
                                ? 'obs-card border-2 border-[var(--brass)]'
                                : 'obs-panel'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-[var(--text)] text-sm">
                                {item.year}
                              </span>
                              <span className="text-[var(--text-muted)]">Age {item.age}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span
                                className="w-5 h-5 flex items-center justify-center font-mono font-bold text-neutral-950 text-xs"
                                style={{ backgroundColor: item.numerologyColor }}
                              >
                                {item.numerologyPersonalYear}
                              </span>
                              <span className="text-[var(--text)] font-medium">
                                PY {item.numerologyPersonalYear} • Pin {item.numerologyPinnacle}
                              </span>
                            </div>
                            <div className="mt-1.5 text-xs text-[var(--brass)] font-semibold">
                              {item.vedicDashaLord}
                            </div>
                            <div className="mt-1 text-xs text-[var(--text-secondary)]">
                              {item.westernTransitTheme}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {synthesisSubTab === 'DOSSIER_QA' && (
                  <div className="obs-card p-6">
                    <span className="editorial-eyebrow">Mathematical Synthesis Exegesis</span>
                    <h4 className="text-xl font-serif font-bold text-[var(--text)] mb-4">
                      Cross-Verified Dossier Grounded in Computed Ephemeris State
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {synthesisReport.aiCopilotPrompts.map((item, i) => (
                        <div key={i} className="obs-panel p-4 space-y-1.5">
                          <h5 className="text-lg font-serif font-bold text-[var(--text)]">
                            {item.question}
                          </h5>
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

            {/* STUDIO CHAMBER 2: WESTERN WHEEL, EPHEMERIS & 360° SABIAN MANDALA */}
            {studioTab === 'WESTERN' && (
              <div className="space-y-6">
                <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="editorial-eyebrow">Precision Geocentric Ephemeris</span>
                    <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                      Ecliptic Natal Astrolabe, Speeds &amp; Authentic 360° Sabian Mandala
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <button
                      onClick={() => setWesternSubTab('WHEEL_EPHEMERIS')}
                      className={`px-3.5 py-1.5 border transition ${
                        westernSubTab === 'WHEEL_EPHEMERIS'
                          ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      I. Wheel &amp; Ephemeris Table
                    </button>
                    <button
                      onClick={() => setWesternSubTab('ASPECTS_SABIAN')}
                      className={`px-3.5 py-1.5 border transition ${
                        westernSubTab === 'ASPECTS_SABIAN'
                          ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      II. Aspect Orbs &amp; 360° Sabian Symbols
                    </button>
                  </div>
                </div>

                {westernSubTab === 'WHEEL_EPHEMERIS' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 obs-card p-5">
                      <h4 className="text-lg font-serif font-bold text-[var(--text)] mb-3">
                        Interactive Natal Wheel &amp; Rectification
                      </h4>
                      <div className="mb-4 obs-panel p-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">
                          Rectify:
                        </span>
                        <input
                          type="range"
                          min={-120}
                          max={120}
                          value={minuteShift}
                          onChange={(e) => setMinuteShift(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[var(--brass)]"
                        />
                        <span className="font-mono font-bold text-[var(--brass)] w-14 text-right">
                          {minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`}
                        </span>
                      </div>
                      <NatalWheelSvg chart={natalChart} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5">
                      <h4 className="text-lg font-serif font-bold text-[var(--text)] mb-1">
                        Planetary Ephemeris, Nakshatras &amp; Dignities
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mb-4">
                        Click any Nakshatra cell to open its full 4-Pada treatise in the Nakshatra
                        Encyclopedia.
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-mono">
                              <th className="py-2 px-2">Body</th>
                              <th className="py-2 px-2">Sign &amp; DMS</th>
                              <th className="py-2 px-2">House</th>
                              <th className="py-2 px-2">Nakshatra</th>
                              <th className="py-2 px-2">Speed</th>
                              <th className="py-2 px-2">Dignity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            <tr className="bg-[var(--surface-muted)]/60 font-semibold">
                              <td className="py-2 px-2 text-[var(--crimson)]">ASC (Lagna)</td>
                              <td className="py-2 px-2 font-mono text-[var(--text)]">
                                {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName}{' '}
                                {natalChart.ascendant.formattedDMS}
                              </td>
                              <td className="py-2 px-2 font-mono">H1</td>
                              <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                              <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                Horizon
                              </td>
                              <td className="py-2 px-2 text-[var(--brass)]">Angle</td>
                            </tr>
                            <tr className="bg-[var(--surface-muted)]/60 font-semibold">
                              <td className="py-2 px-2 text-[var(--brass)]">MC (Zenith)</td>
                              <td className="py-2 px-2 font-mono text-[var(--text)]">
                                {natalChart.midheaven.signSymbol} {natalChart.midheaven.signName}{' '}
                                {natalChart.midheaven.formattedDMS}
                              </td>
                              <td className="py-2 px-2 font-mono">H10</td>
                              <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                              <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                Meridian
                              </td>
                              <td className="py-2 px-2 text-[var(--brass)]">Zenith</td>
                            </tr>
                            {natalChart.planets.map((p) => (
                              <tr key={p.id} className="hover:bg-[var(--surface-muted)]/50">
                                <td className="py-2 px-2 font-semibold text-[var(--text)] whitespace-nowrap">
                                  <span className="mr-1.5 text-sm font-serif" style={{ color: p.color }}>
                                    {p.symbol}
                                  </span>
                                  {p.name}
                                  {p.isRetrograde && (
                                    <span className="ml-1 px-1.5 py-0.5 obs-badge-crimson text-[10px] font-mono">
                                      R
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-2 font-mono text-[var(--text)] whitespace-nowrap">
                                  {p.signSymbol} {p.signName} {p.formattedDMS}
                                </td>
                                <td className="py-2 px-2 font-mono text-[var(--brass)] font-semibold">
                                  H{p.house}
                                </td>
                                <td className="py-2 px-2">
                                  <button
                                    onClick={() =>
                                      handleNavigate('NAKSHATRAS', { nakIdx: p.nakshatraIndex })
                                    }
                                    className="text-[var(--brass)] hover:underline inline-flex items-center gap-0.5 font-medium"
                                  >
                                    <span>
                                      {p.nakshatraName} (P{p.nakshatraPada})
                                    </span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </td>
                                <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                  {p.speedDegPerDay >= 0
                                    ? `+${p.speedDegPerDay.toFixed(2)}°`
                                    : `${p.speedDegPerDay.toFixed(2)}°`}
                                </td>
                                <td className="py-2 px-2">
                                  <span
                                    className={`px-2 py-0.5 text-[11px] font-mono ${
                                      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                                        ? 'obs-badge-sage'
                                        : p.dignity === 'Debilitated'
                                        ? 'obs-badge-crimson'
                                        : 'obs-panel text-[var(--text-secondary)]'
                                    }`}
                                  >
                                    {p.dignity}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {westernSubTab === 'ASPECTS_SABIAN' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="obs-card p-5">
                      <h4 className="text-xl font-serif font-bold text-[var(--text)] mb-3">
                        Planetary Aspects &amp; Exact Orbs ({natalChart.aspects.length} Active)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {natalChart.aspects.map((asp, i) => (
                          <div
                            key={i}
                            className="obs-panel px-3 py-2 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-[var(--text)]">
                                {asp.symbolA} {asp.planetA}
                              </span>{' '}
                              <span className="font-bold mx-1 text-[var(--brass)]">
                                {asp.aspectSymbol} {asp.aspectName}
                              </span>{' '}
                              <span className="font-semibold text-[var(--text)]">
                                {asp.symbolB} {asp.planetB}
                              </span>
                            </div>
                            <span className="font-mono text-[var(--text-muted)]">
                              {asp.orb.toFixed(2)}° {asp.applying ? 'App' : 'Sep'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="obs-card p-5">
                      <h4 className="text-xl font-serif font-bold text-[var(--text)] mb-3">
                        Authentic 360° Sabian Mandala Degree Archetypes
                      </h4>
                      <div className="space-y-2.5 text-xs">
                        {natalChart.planets.map((p) => (
                          <div key={p.id} className="obs-panel p-3">
                            <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                              <span style={{ color: p.color }}>{p.symbol}</span>
                              <span>
                                {p.name} ({p.signName} {p.formattedDMS})
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] mt-1 font-serif italic text-sm">
                              {p.sabianSymbol}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STUDIO CHAMBER 3: VEDIC JYOTISH, 337-BINDU ASHTAKAVARGA, JAIMINI & KP */}
            {studioTab === 'VEDIC_KP' && (
              <div className="space-y-6">
                <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="editorial-eyebrow">
                      Parashara Hora Shastra • Jaimini Sutras • Krishnamurti Paddhati
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                      Shodashvarga, 337-Bindu Ashtakavarga, Jaimini Karakas &amp; KP Sub-Lords
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <button
                      onClick={() => setVedicSubTab('KUNDALI_DASHA')}
                      className={`px-3.5 py-1.5 border transition ${
                        vedicSubTab === 'KUNDALI_DASHA'
                          ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      I. 16-Varga Kundali &amp; Dasha
                    </button>
                    <button
                      onClick={() => setVedicSubTab('ASHTAKAVARGA_JAIMINI')}
                      className={`px-3.5 py-1.5 border transition ${
                        vedicSubTab === 'ASHTAKAVARGA_JAIMINI'
                          ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      II. 337-Bindu Ashtakavarga &amp; Jaimini
                    </button>
                    <button
                      onClick={() => setVedicSubTab('KP_SUBLORDS')}
                      className={`px-3.5 py-1.5 border transition ${
                        vedicSubTab === 'KP_SUBLORDS'
                          ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      III. KP Sub-Lords &amp; 1–249 Horary
                    </button>
                  </div>
                </div>

                {/* VEDIC SUB-TAB 1: DIVISIONAL KUNDALI & VIMSHOTTARI DASHA */}
                {vedicSubTab === 'KUNDALI_DASHA' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 obs-card p-5">
                      <h4 className="text-lg font-serif font-bold text-[var(--text)] mb-3">
                        Shodashvarga Divisional Kundali Explorer
                      </h4>
                      <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                    </div>

                    <div className="lg:col-span-7 obs-card p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                          <span className="editorial-eyebrow">120-Year Nakshatra Progression</span>
                          <h4 className="text-lg font-serif font-bold text-[var(--text)]">
                            Vimshottari Mahadasha &amp; Classical BPHS Fruits
                          </h4>
                        </div>
                        <div className="px-3 py-1 obs-badge-brass text-xs font-mono font-semibold">
                          Active: {vedicReport.activeMahadasha.lord} –{' '}
                          {vedicReport.activeAntardasha.lord}
                        </div>
                      </div>

                      <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                        {vedicReport.dashas.map((d) => {
                          const isOpen =
                            expandedDashaLord === d.lord ||
                            (expandedDashaLord === null && d.isCurrent);
                          const dashaFruit = PLANET_TREATISES[d.lord]?.dashaGeneralFruit;
                          return (
                            <div
                              key={d.lord}
                              className={`border transition ${
                                d.isCurrent ? 'obs-card border-[var(--brass)]' : 'obs-panel'
                              }`}
                            >
                              <button
                                onClick={() => setExpandedDashaLord(isOpen ? 'NONE' : d.lord)}
                                className="w-full px-4 py-3 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-[var(--brass)]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                  )}
                                  <span className="font-serif font-bold text-[var(--text)] text-base">
                                    {d.lord} Mahadasha ({d.years} Years)
                                  </span>
                                  {d.isCurrent && (
                                    <span className="px-2 py-0.5 obs-badge-brass font-mono font-semibold text-[11px]">
                                      CURRENT ({d.progressPercent}%)
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[var(--text-secondary)]">
                                  {d.startDate} → {d.endDate}
                                </span>
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-3 pt-2 border-t border-[var(--border)] space-y-3 text-xs">
                                  {dashaFruit && (
                                    <p className="text-[var(--text-secondary)] italic bg-[var(--surface)] p-2.5 border border-[var(--border)]">
                                      <strong>Classical BPHS Fruit:</strong> {dashaFruit}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {d.antardashas.map((antar) => (
                                      <div
                                        key={antar.lord}
                                        className={`p-2 ${
                                          antar.isCurrent
                                            ? 'obs-badge-brass font-semibold'
                                            : 'obs-card text-[var(--text-secondary)]'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>
                                            {d.lord} – {antar.lord}
                                          </span>
                                          {antar.isCurrent && (
                                            <span className="text-[10px] font-mono uppercase">
                                              Active
                                            </span>
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
                    </div>
                  </div>
                )}

                {/* VEDIC SUB-TAB 2: AUTHENTIC 337-BINDU ASHTAKAVARGA & JAIMINI CHARA KARAKAS */}
                {vedicSubTab === 'ASHTAKAVARGA_JAIMINI' && (
                  <div className="space-y-6">
                    {/* Complete 12-Sign Bhinnashtakavarga & Sarvashtakavarga Matrix */}
                    <div className="folio-sheet p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                        <div>
                          <div className="editorial-eyebrow">
                            Brihat Parashara Hora Shastra • Adhyaya 66
                          </div>
                          <h4 className="font-serif text-2xl font-bold text-[var(--text)]">
                            Bhinnashtakavarga &amp; Sarvashtakavarga Matrix
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Rashis scoring 30+ Bindus act as effortless Karmic tailwinds during
                            transits; Rashis below 25 require disciplined perseverance.
                          </p>
                        </div>
                        <span className="px-3 py-1.5 obs-badge-brass font-mono text-xs font-bold">
                          Canonical Total: {totalSavBindus} Bindus
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse text-center font-mono">
                          <thead>
                            <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)]">
                              <th className="py-2 px-2 text-left">Graha / Source</th>
                              {ZODIAC_SIGNS.map((z) => (
                                <th key={z.index} className="py-2 px-1.5" title={z.sanskrit}>
                                  <div>{z.symbol}</div>
                                  <div className="text-[10px]">{z.sanskrit.slice(0, 3)}</div>
                                </th>
                              ))}
                              <th className="py-2 px-2 text-[var(--brass)]">Sum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {Object.entries(vedicReport.bhinnashtakavarga).map(
                              ([planetName, arr]) => {
                                const rowSum = arr.reduce((a, b) => a + b, 0);
                                return (
                                  <tr key={planetName} className="hover:bg-[var(--surface-muted)]/50">
                                    <td className="py-2 px-2 text-left font-sans font-semibold text-[var(--text)]">
                                      {planetName} BAV
                                    </td>
                                    {arr.map((val, sIdx) => (
                                      <td
                                        key={sIdx}
                                        className={`py-2 px-1.5 ${
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
                                    <td className="py-2 px-2 font-bold text-[var(--text)]">
                                      {rowSum}
                                    </td>
                                  </tr>
                                );
                              }
                            )}

                            {/* Total Sarvashtakavarga Row */}
                            <tr className="bg-[var(--bg-elevated)] border-t-2 border-[var(--text)] font-bold">
                              <td className="py-2.5 px-2 text-left font-sans text-[var(--brass)]">
                                SARVASHTAKAVARGA (SAV)
                              </td>
                              {ZODIAC_SIGNS.map((z) => {
                                const savEntry = vedicReport.sarvashtakavarga.find(
                                  (s) => s.signIndex === z.index
                                );
                                const pts = savEntry?.bindus ?? 28;
                                return (
                                  <td
                                    key={z.index}
                                    className={`py-2.5 px-1.5 ${
                                      pts >= 30
                                        ? 'bg-[var(--sage-bg)] text-[var(--sage)]'
                                        : pts < 25
                                        ? 'bg-[var(--crimson-bg)] text-[var(--crimson)]'
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
                              <td className="py-2.5 px-2 text-[var(--brass)]">{totalSavBindus}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Jaimini Upadesha Sutras — 7 Chara Karakas */}
                    <div className="folio-sheet p-6 space-y-4">
                      <div className="border-b border-[var(--border)] pb-3">
                        <div className="editorial-eyebrow flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Maharishi Jaimini Upadesha Sutras</span>
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[var(--text)]">
                          Seven Chara Karakas (Soul &amp; Relational Significators)
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Ranked by exact longitudinal advancement within sign (0°–30°); the
                          Atmakaraka’s Navamsha sign is your <strong>Karakamsha</strong> soul throne.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {vedicReport.charaKarakas.map((ck) => (
                          <div
                            key={ck.karakaCode}
                            className={`p-4 border ${
                              ck.karakaCode === 'AK'
                                ? 'border-[var(--brass)] bg-[var(--brass-bg)]/30'
                                : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                            } space-y-1.5`}
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[var(--brass)] font-bold">{ck.karakaCode}</span>
                              <span className="text-[var(--text-muted)]">{ck.degreeInSign}</span>
                            </div>
                            <div className="font-serif text-lg font-bold text-[var(--text)]">
                              {ck.symbol} {ck.planetName} — {ck.karakaName}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                              Rashi: {ck.signName} • D9: <strong>{ck.navamshaSignName}</strong>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                              {ck.domain}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* VEDIC SUB-TAB 3: KP SUB-LORDS & 1-249 HORARY */}
                {vedicSubTab === 'KP_SUBLORDS' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 obs-card p-5">
                      <h4 className="text-xl font-serif font-bold text-[var(--text)] mb-1">
                        Krishnamurti Paddhati (KP) Star, Sub &amp; Sub-Sub Lords
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        Proportional 1/9th Vimshottari sub-divisions across the 27 Nakshatras (KP
                        Reader III).
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-mono">
                              <th className="py-2 px-2">Planet</th>
                              <th className="py-2 px-2">Sidereal DMS</th>
                              <th className="py-2 px-2">Sign Lord</th>
                              <th className="py-2 px-2">Star Lord</th>
                              <th className="py-2 px-2 text-[var(--brass)]">KP Sub-Lord</th>
                              <th className="py-2 px-2">Sub-Sub</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {vedicReport.kpPlanets.map((row) => (
                              <tr key={row.label} className="hover:bg-[var(--surface-muted)]/50">
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
                                <td className="py-2 px-2 font-bold text-[var(--brass)]">
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
                    </div>

                    <div className="lg:col-span-5 obs-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="editorial-eyebrow">KP Horary Prashna (1–249 Seed)</span>
                        <input
                          type="number"
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
                          className="w-20 obs-input py-1 font-mono font-bold text-center"
                        />
                      </div>
                      <h4 className="text-lg font-serif font-bold text-[var(--text)]">
                        Horary #{vedicReport.kpHorary.horaryNumber} →{' '}
                        {vedicReport.kpHorary.ascendantSign} ({vedicReport.kpHorary.ascendantDMS})
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 obs-panel">
                          Sign: {vedicReport.kpHorary.signLord}
                        </span>
                        <span className="px-2.5 py-1 obs-panel">
                          Star: {vedicReport.kpHorary.starLord}
                        </span>
                        <span className="px-2.5 py-1 obs-badge-brass font-bold">
                          Sub: {vedicReport.kpHorary.subLord}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {vedicReport.kpHorary.verdict}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STUDIO CHAMBER 4: NEPALI PATRO & DRIK PANCHANG */}
            {studioTab === 'PANCHANG' && (
              <PanchangDashboard
                panchang={panchangReport}
                onInspectNakshatra={(idx) => handleNavigate('NAKSHATRAS', { nakIdx: idx })}
                onOpenActionSimulator={() => handleNavigate('WHAT_HAPPENS_IF')}
              />
            )}

            {/* STUDIO CHAMBER 5: ASTROCARTOGRAPHY WORLD MAP */}
            {studioTab === 'ASTROCARTOGRAPHY' && (
              <AstrocartographyWorldMap profile={profile} chart={natalChart} />
            )}

            {/* STUDIO CHAMBER 6: DECOZ & CHEIRO NUMEROLOGY */}
            {studioTab === 'NUMEROLOGY' && (
              <DecozColorChart
                report={numerologyReport}
                system={numSystem}
                onSystemChange={setNumSystem}
              />
            )}

            {/* STUDIO CHAMBER 7: SYNASTRY & 36-GUNA MILAN */}
            {studioTab === 'SYNASTRY' && (
              <ResearchAndSynastryLab
                primaryProfile={profile}
                primaryChart={natalChart}
                partnerProfile={partnerProfile}
                partnerChart={partnerChart}
                onPartnerChange={setPartnerProfile}
              />
            )}
          </div>
        )}
      </main>

      {/* ==================== ARCHITECTURAL COLOPHON FOOTER ==================== */}
      <footer className="border-t-2 border-[var(--text)] bg-[var(--surface)] py-10 px-4 sm:px-8 text-xs text-[var(--text-secondary)] mt-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-2">
            <div className="font-serif text-xl font-bold text-[var(--text)]">
              ☉ OCEANOLOGY — Celestial Monograph &amp; Ephemeris
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
              Zero-telemetry, client-side astronomical calculations uniting Vedic Shruti
              (Taittiriya Brahmana), Parashari Hora, Muhurta Chintamani action-consequence rules,
              Nepali Bikram Sambat Patro, Astro*Carto*Graphy, and Chaldean/Pythagorean acoustics.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2">
            <div className="font-mono uppercase tracking-wider text-[var(--brass)] font-semibold">
              Monograph Portals
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNavigate('HOME')}
                className="text-left hover:text-[var(--brass)]"
              >
                Home Masthead
              </button>
              <button
                onClick={() => handleNavigate('NAKSHATRAS')}
                className="text-left hover:text-[var(--brass)]"
              >
                28 Nakshatras &amp; 108 Padas
              </button>
              <button
                onClick={() => handleNavigate('WHAT_HAPPENS_IF')}
                className="text-left hover:text-[var(--brass)]"
              >
                “What Happens If...” Lab
              </button>
              <button
                onClick={() => handleNavigate('OBSERVATORY')}
                className="text-left hover:text-[var(--brass)]"
              >
                Personal Observatory
              </button>
              <button
                onClick={() => handleNavigate('CANON')}
                className="text-left hover:text-[var(--brass)]"
              >
                9 Canonical Books
              </button>
              <button
                onClick={() =>
                  handleNavigate('OBSERVATORY', { studioTab: 'ASTROCARTOGRAPHY' })
                }
                className="text-left hover:text-[var(--brass)]"
              >
                World Relocation Atlas
              </button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5 font-mono text-[11px] text-[var(--text-muted)]">
            <div className="uppercase tracking-wider text-[var(--brass)] font-semibold">
              Active Horizon Telemetry
            </div>
            <div>
              {profile.location.name}, {profile.location.country} ({profile.location.elevationMeters}
              m)
            </div>
            <div>
              {profile.location.latitude.toFixed(4)}°N, {profile.location.longitude.toFixed(4)}°E
            </div>
            <div>
              Ayanamsha: {ayanamsha} ({natalChart.ayanamshaDegrees.toFixed(4)}°)
            </div>
            <div>SAV Total: {totalSavBindus} Parashari Bindus</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
