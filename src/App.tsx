import React, { useEffect, useMemo, useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import {
  AyanamshaMode,
  BirthProfile,
  DEFAULT_PROFILE,
  HouseSystem,
  NumerologySystem,
  PARTNER_DEFAULT_PROFILE,
} from './types/oceanology';
import { calculateNatalChart } from './engines/astronomyEngine';
import { calculateVedicReport } from './engines/vedicEngine';
import { calculatePanchang } from './engines/panchangEngine';
import { calculateNumerology } from './engines/numerologyEngine';
import { generateCosmicSynthesis } from './engines/synthesisEngine';
import { gregorianToBikramSambat } from './engines/locationAtlas';
import { PLANET_TREATISES } from './data/classicalCompendium';
import { NatalWheelSvg } from './components/NatalWheelSvg';
import { VedicKundliSvg } from './components/VedicKundliSvg';
import { DecozColorChart } from './components/DecozColorChart';
import { PanchangDashboard } from './components/PanchangDashboard';
import { ResearchAndSynastryLab } from './components/ResearchAndSynastryLab';
import { GlobalLocationPicker } from './components/GlobalLocationPicker';
import { AstrocartographyWorldMap } from './components/AstrocartographyWorldMap';
import { ClassicalBookLibrary } from './components/ClassicalBookLibrary';

type ActiveWorkspace =
  | 'SYNTHESIS'
  | 'ASTROCARTOGRAPHY'
  | 'BOOK_FOLIO'
  | 'WESTERN'
  | 'VEDIC_KP'
  | 'PANCHANG'
  | 'NUMEROLOGY'
  | 'SYNASTRY';

export function App() {
  const [profile, setProfile] = useState<BirthProfile>(DEFAULT_PROFILE);
  const [partnerProfile, setPartnerProfile] = useState<BirthProfile>(PARTNER_DEFAULT_PROFILE);
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>('LAHIRI');
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('PLACIDUS');
  const [numSystem, setNumSystem] = useState<NumerologySystem>('PYTHAGOREAN');
  const [minuteShift, setMinuteShift] = useState<number>(0);

  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>('SYNTHESIS');
  const [synthesisSubTab, setSynthesisSubTab] = useState<'OVERVIEW' | 'TIMELINE_12YR' | 'DOSSIER_QA'>('OVERVIEW');
  const [westernSubTab, setWesternSubTab] = useState<'WHEEL_EPHEMERIS' | 'ASPECTS_SABIAN'>('WHEEL_EPHEMERIS');
  const [vedicSubTab, setVedicSubTab] = useState<'KUNDALI_DASHA' | 'KP_SUBLORDS'>('KUNDALI_DASHA');

  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [expandedDashaLord, setExpandedDashaLord] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

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
    const moon = natalChart.planets.find(p => p.id === 'Moon')!;
    return calculatePanchang(new Date(), profile.location, moon.nakshatraIndex, moon.signIndex);
  }, [profile.location, natalChart]);

  const numerologyReport = useMemo(
    () => calculateNumerology(profile, numSystem),
    [profile, numSystem]
  );

  const synthesisReport = useMemo(
    () => generateCosmicSynthesis(profile, natalChart, vedicReport, panchangReport, numerologyReport),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport]
  );

  const birthBsDate = useMemo(
    () => gregorianToBikramSambat(profile.year, profile.month, profile.day),
    [profile.year, profile.month, profile.day]
  );

  const navItems: {
    id: ActiveWorkspace;
    label: string;
    sub: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'SYNTHESIS',
      label: 'Observatory Overview',
      sub: '4-System Concordance',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'ASTROCARTOGRAPHY',
      label: 'World Map & Where to Live',
      sub: 'Relocation Atlas (Nepal & Global)',
      icon: <Globe className="w-4 h-4" />,
      badge: 'Map',
    },
    {
      id: 'BOOK_FOLIO',
      label: 'Classical Book Folio',
      sub: 'Parashara, Greene & Rudhyar',
      icon: <BookOpen className="w-4 h-4" />,
      badge: 'Texts',
    },
    {
      id: 'WESTERN',
      label: 'Natal Wheel & Ephemeris',
      sub: 'Astrodienst + Astro-Seek',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      id: 'VEDIC_KP',
      label: 'Jyotish Kundali, Dasha & KP',
      sub: 'AstroSage + Nepal Cheena',
      icon: <Moon className="w-4 h-4" />,
    },
    {
      id: 'PANCHANG',
      label: 'Panchang & Nepali Patro',
      sub: 'Drik + Bikram Sambat (B.S.)',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'NUMEROLOGY',
      label: 'Decoz & Cheiro Numerology',
      sub: 'ColorChart + Compound Lore',
      icon: <Hash className="w-4 h-4" />,
    },
    {
      id: 'SYNASTRY',
      label: 'Synastry & 36-Guna Milan',
      sub: 'Matchmaking + Aspect Search',
      icon: <HeartHandshake className="w-4 h-4" />,
    },
  ];

  const formatUtcOffset = (hrs: number) => {
    const sign = hrs >= 0 ? '+' : '-';
    const abs = Math.abs(hrs);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Clean Top Observatory Masthead */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[var(--brass)] bg-[var(--brass-bg)] flex items-center justify-center font-serif font-bold text-base text-[var(--brass)]">
              ☉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold tracking-tight text-[var(--text)] leading-none">
                  OCEANOLOGY
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded obs-badge-brass">
                  Observatory Folio
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] hidden md:block">
                Swiss Ephemeris • Parashari Jyotish &amp; KP • Nepali Patro (B.S.) • Astro*Carto*Graphy • Decoz &amp; Cheiro
              </p>
            </div>
          </div>

          {/* Right Controls: Active Chart Identity + Ayanamsha + Theme Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded obs-panel hover:border-[var(--brass)] text-xs transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--brass)]" />
              <div className="text-left">
                <div className="font-semibold text-[var(--text)]">
                  {profile.firstName} {profile.lastName} — {profile.location.name.split(' ')[0]}, {profile.location.country}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  {profile.year}-{profile.month.toString().padStart(2, '0')}-{profile.day.toString().padStart(2, '0')} ({birthBsDate.formattedEn}) • {formatUtcOffset(profile.location.timezoneOffsetHours)}
                </div>
              </div>
              <Sliders className="w-3.5 h-3.5 text-[var(--brass)] ml-1" />
            </button>

            <select
              value={ayanamsha}
              onChange={e => setAyanamsha(e.target.value as AyanamshaMode)}
              className="obs-input py-1.5 text-xs font-medium"
              title="Select Zodiac / Ayanamsha System"
            >
              <option value="LAHIRI">Sidereal: N.C. Lahiri (Chitrapaksha)</option>
              <option value="TROPICAL">Tropical: Western Sayana (0°)</option>
              <option value="KP_NEW">Sidereal: KP New (Krishnamurti)</option>
              <option value="KP_OLD">Sidereal: KP Old</option>
              <option value="RAMAN">Sidereal: B.V. Raman</option>
              <option value="KHULLAR">Sidereal: KP Khullar</option>
            </select>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2.5 py-1.5 rounded obs-panel hover:border-[var(--brass)] text-xs font-medium flex items-center gap-1.5 transition"
              title="Toggle Editorial Parchment Light / Obsidian Dark Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-[var(--brass)]" /> : <Moon className="w-3.5 h-3.5 text-[var(--brass)]" />}
              <span className="hidden sm:inline">{darkMode ? 'Parchment' : 'Obsidian'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded obs-panel hover:border-[var(--brass)] text-[var(--text-secondary)] transition"
              title="Print / Export Chart Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Universal Birth Data & Global/Nepal Location Drawer */}
        {showProfileDrawer && (
          <div className="bg-[var(--surface)] border-t border-[var(--border)] px-4 sm:px-6 py-4 shadow-lg">
            <div className="max-w-[1440px] mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div>
                  <h3 className="text-base font-serif font-bold text-[var(--text)]">
                    Universal Natal &amp; Observatory Data Entry (All 7 Provinces of Nepal &amp; Worldwide Gazetteer)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Bikram Sambat Birth Date: <strong className="text-[var(--brass)] font-mono">{birthBsDate.formattedEn} ({birthBsDate.formattedNp})</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="px-3 py-1 rounded obs-badge-brass text-xs font-semibold"
                >
                  Save &amp; Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">Birth First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={e => setProfile({ ...profile, firstName: e.target.value, currentFirstName: e.target.value })}
                    className="w-full obs-input"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">Birth Middle Name</label>
                  <input
                    type="text"
                    value={profile.middleName}
                    onChange={e => setProfile({ ...profile, middleName: e.target.value })}
                    className="w-full obs-input"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">Birth Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={e => setProfile({ ...profile, lastName: e.target.value, currentLastName: e.target.value })}
                    className="w-full obs-input"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">Birth Date (YYYY / MM / DD)</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      value={profile.year}
                      onChange={e => setProfile({ ...profile, year: parseInt(e.target.value, 10) || 1996 })}
                      className="obs-input font-mono"
                    />
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={profile.month}
                      onChange={e => setProfile({ ...profile, month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
                      className="obs-input font-mono"
                    />
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={profile.day}
                      onChange={e => setProfile({ ...profile, day: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
                      className="obs-input font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] font-medium block mb-1">Birth Time (HH : MM : SS)</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      disabled={profile.unknownTime}
                      value={profile.hour}
                      onChange={e => setProfile({ ...profile, hour: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                      className="obs-input font-mono disabled:opacity-40"
                    />
                    <input
                      type="number"
                      min={0}
                      max={59}
                      disabled={profile.unknownTime}
                      value={profile.minute}
                      onChange={e => setProfile({ ...profile, minute: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                      className="obs-input font-mono disabled:opacity-40"
                    />
                    <input
                      type="number"
                      min={0}
                      max={59}
                      disabled={profile.unknownTime}
                      value={profile.second}
                      onChange={e => setProfile({ ...profile, second: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                      className="obs-input font-mono disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <GlobalLocationPicker
                label="Birth Place & Elevation Gazetteer (All 7 Provinces of Nepal + Global Search)"
                value={profile.location}
                onChange={loc => setProfile({ ...profile, location: loc })}
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border)] text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.unknownTime}
                      onChange={e => setProfile({ ...profile, unknownTime: e.target.checked })}
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Unknown Birth Time (Chandra / Solar Kundali Mode)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">House System:</span>
                    <select
                      value={houseSystem}
                      onChange={e => setHouseSystem(e.target.value as HouseSystem)}
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
                  <span className="text-[var(--text-secondary)]">Rectification Time Shift:</span>
                  <input
                    type="range"
                    min={-120}
                    max={120}
                    value={minuteShift}
                    onChange={e => setMinuteShift(parseInt(e.target.value, 10))}
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

      {/* Main Architectural Shell: Left Navigation Rail + Focused Reading Canvas */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation Rail (3 cols on lg) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
          <div className="obs-card p-3 space-y-1">
            <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] mb-1">
              Observatory Modules
            </div>
            {navItems.map(item => {
              const active = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWorkspace(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-xs transition ${
                    active
                      ? 'obs-badge-brass font-bold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className={active ? 'text-[var(--brass)]' : 'text-[var(--text-muted)]'}>
                      {item.icon}
                    </span>
                    <div>
                      <div className="leading-snug text-[var(--text)]">{item.label}</div>
                      <div className="text-xs text-[var(--text-muted)] font-normal">{item.sub}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--brass)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compact Active Subject Summary Card in Sidebar */}
          <div className="obs-card p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-[var(--brass)]">
                Active Natal Anchor
              </span>
              <button
                onClick={() => setShowProfileDrawer(true)}
                className="text-[var(--brass)] font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Lagna (ASC):</span>
                <span className="font-semibold text-[var(--text)]">
                  {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName} {natalChart.ascendant.formattedDMS}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Janma Rashi:</span>
                <span className="font-semibold text-[var(--text)]">
                  {natalChart.planets[1].signSymbol} {natalChart.planets[1].sanskritSign}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Nakshatra:</span>
                <span className="font-semibold text-[var(--text)]">
                  {natalChart.planets[1].nakshatraName} (P{natalChart.planets[1].nakshatraPada})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Mahadasha:</span>
                <span className="font-semibold text-[var(--brass)]">
                  {vedicReport.activeMahadasha.lord} – {vedicReport.activeAntardasha.lord}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Life Path:</span>
                <span className="font-semibold text-[var(--text)]">
                  #{numerologyReport.lifePath.trail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Nepali Date:</span>
                <span className="font-semibold text-[var(--text)]">
                  {birthBsDate.formattedEn}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Focused Primary Workspace Canvas (9 cols on lg) */}
        <main className="lg:col-span-9 min-w-0">
          {/* ==================== WORKSPACE 1: OBSERVATORY OVERVIEW ==================== */}
          {activeWorkspace === 'SYNTHESIS' && (
            <div className="space-y-6">
              {/* Executive Synthesis Banner + Focused Sub-View Tabs */}
              <div className="obs-card p-6 border-t-4 border-t-[var(--brass)] space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-9 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--brass)]">
                      <span className="uppercase font-semibold">{synthesisReport.resonanceTier}</span>
                      <span>•</span>
                      <span>Bikram Sambat: {birthBsDate.formattedEn} ({birthBsDate.formattedNp})</span>
                      <span>•</span>
                      <span>{profile.location.name} ({profile.location.elevationMeters}m)</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] leading-snug">
                      {synthesisReport.synthesisSummary}
                    </h2>
                    <div className="flex flex-wrap gap-2.5 pt-2 text-xs">
                      <button
                        onClick={() => setActiveWorkspace('ASTROCARTOGRAPHY')}
                        className="obs-badge-brass px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Explore World Map &amp; Best Places to Live &rarr;</span>
                      </button>
                      <button
                        onClick={() => setActiveWorkspace('BOOK_FOLIO')}
                        className="obs-panel px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 hover:border-[var(--brass)] transition"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[var(--brass)]" />
                        <span>Read Classical BPHS &amp; Psychological Folio &rarr;</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-3 obs-panel p-4 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Concordance
                    </div>
                    <div className="text-4xl font-serif font-bold text-[var(--brass)] my-1 tabular-nums">
                      {synthesisReport.overallResonanceScore}
                      <span className="text-lg text-[var(--text-muted)]">/100</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      4-System Alignment
                    </div>
                  </div>
                </div>

                {/* Sub-View Switcher so we don't crowd everything on one screen */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)] text-xs">
                  {[
                    { id: 'OVERVIEW' as const, label: '1. Four-Pillar Concordance & Dual Astrolabe' },
                    { id: 'TIMELINE_12YR' as const, label: '2. 12-Year Synchronized Chronology' },
                    { id: 'DOSSIER_QA' as const, label: '3. Cross-Tradition Synthesis Readings' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSynthesisSubTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded font-semibold transition ${
                        synthesisSubTab === tab.id
                          ? 'obs-badge-brass shadow-sm'
                          : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUB-VIEW 1A: 4 PILLARS + SIDE-BY-SIDE CHARTS */}
              {synthesisSubTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {synthesisReport.pillars.map(p => (
                      <div key={p.domain} className="obs-card p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-mono text-[var(--text-muted)]">{p.sourceInspiration}</span>
                            <span className="px-2 py-0.5 rounded font-mono font-bold obs-badge-brass">
                              {p.score}%
                            </span>
                          </div>
                          <div className="text-xs uppercase font-semibold tracking-wider text-[var(--brass)]">
                            {p.domain}
                          </div>
                          <h3 className="text-lg font-serif font-bold text-[var(--text)] mt-0.5">{p.headline}</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{p.subheadline}</p>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-3 pt-2.5 border-t border-[var(--border)]">
                          {p.keyInsight}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 obs-card p-5">
                      <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                            Astrodienst + Astro-Seek Ephemeris
                          </span>
                          <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                            Ecliptic Natal Astrolabe Wheel
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveWorkspace('WESTERN')}
                          className="text-xs font-semibold text-[var(--brass)] hover:underline"
                        >
                          Full Ephemeris &rarr;
                        </button>
                      </div>
                      <NatalWheelSvg chart={natalChart} />
                    </div>

                    <div className="lg:col-span-5 obs-card p-5">
                      <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--crimson)]">
                            AstroSage + Nepal Cheena / Kundali
                          </span>
                          <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                            Shodashvarga Divisional Charts
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveWorkspace('VEDIC_KP')}
                          className="text-xs font-semibold text-[var(--brass)] hover:underline"
                        >
                          Dasha &amp; KP &rarr;
                        </button>
                      </div>
                      <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 1B: 12-YEAR SYNCHRONIZED CHRONOLOGY */}
              {synthesisSubTab === 'TIMELINE_12YR' && (
                <div className="obs-card p-5">
                  <div className="mb-4 border-b border-[var(--border)] pb-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                      Cross-Tradition Chronology
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                      12-Year Synchronized Transit, Vimshottari Dasha &amp; Decoz Pinnacle Horizon
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                    {synthesisReport.unifiedTimeline.map(item => {
                      const isCurrentYear = item.year === new Date().getFullYear();
                      return (
                        <div
                          key={item.year}
                          className={`p-3.5 rounded transition ${
                            isCurrentYear
                              ? 'obs-card border-2 border-[var(--brass)]'
                              : 'obs-panel'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-[var(--text)] text-sm">{item.year}</span>
                            <span className="text-[var(--text-muted)]">Age {item.age}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-neutral-950 text-xs"
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

              {/* SUB-VIEW 1C: CROSS-SYSTEM SYNTHESIS READINGS */}
              {synthesisSubTab === 'DOSSIER_QA' && (
                <div className="obs-card p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                    Mathematical Synthesis Readings
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[var(--text)] mb-4">
                    Cross-Verified Dossier (Strictly Grounded in Your Computed Ephemeris &amp; Numerology State)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {synthesisReport.aiCopilotPrompts.map((item, i) => (
                      <div key={i} className="obs-panel p-4 space-y-1.5">
                        <h4 className="text-base font-serif font-bold text-[var(--text)]">
                          {item.question}
                        </h4>
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

          {/* ==================== WORKSPACE 2: ASTROCARTOGRAPHY & RELOCATION ==================== */}
          {activeWorkspace === 'ASTROCARTOGRAPHY' && (
            <AstrocartographyWorldMap profile={profile} chart={natalChart} />
          )}

          {/* ==================== WORKSPACE 3: CLASSICAL BOOK FOLIO ==================== */}
          {activeWorkspace === 'BOOK_FOLIO' && (
            <ClassicalBookLibrary chart={natalChart} vedic={vedicReport} />
          )}

          {/* ==================== WORKSPACE 4: WESTERN & SWISS EPHEMERIS ==================== */}
          {activeWorkspace === 'WESTERN' && (
            <div className="space-y-6">
              <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                    Astrodienst + Astro-Seek Precision Ephemeris
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                    Ecliptic Natal Astrolabe, Planetary Speeds &amp; Sabian Degrees
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => setWesternSubTab('WHEEL_EPHEMERIS')}
                    className={`px-3.5 py-1.5 rounded font-semibold transition ${
                      westernSubTab === 'WHEEL_EPHEMERIS'
                        ? 'obs-badge-brass shadow-sm'
                        : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                    }`}
                  >
                    1. Natal Wheel &amp; Ephemeris Table
                  </button>
                  <button
                    onClick={() => setWesternSubTab('ASPECTS_SABIAN')}
                    className={`px-3.5 py-1.5 rounded font-semibold transition ${
                      westernSubTab === 'ASPECTS_SABIAN'
                        ? 'obs-badge-brass shadow-sm'
                        : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                    }`}
                  >
                    2. Aspect Orbs &amp; Sabian Symbols
                  </button>
                </div>
              </div>

              {westernSubTab === 'WHEEL_EPHEMERIS' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 obs-card p-5">
                    <h3 className="text-lg font-serif font-bold text-[var(--text)] mb-3">
                      Interactive Natal Wheel &amp; Rectification
                    </h3>
                    <div className="mb-4 obs-panel p-3 flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">Rectify:</span>
                      <input
                        type="range"
                        min={-120}
                        max={120}
                        value={minuteShift}
                        onChange={e => setMinuteShift(parseInt(e.target.value, 10))}
                        className="flex-1 accent-[var(--brass)]"
                      />
                      <span className="font-mono font-bold text-[var(--brass)] w-14 text-right">
                        {minuteShift >= 0 ? `+${minuteShift}m` : `${minuteShift}m`}
                      </span>
                    </div>
                    <NatalWheelSvg chart={natalChart} />
                  </div>

                  <div className="lg:col-span-7 obs-card p-5">
                    <h3 className="text-lg font-serif font-bold text-[var(--text)] mb-1">
                      Planetary Ephemeris, Nakshatras &amp; Dignities
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">
                      Exact degree-minute-second (DMS), daily speed (°/day), House, and Nakshatra Pada.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)]">
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
                              {natalChart.ascendant.signSymbol} {natalChart.ascendant.signName} {natalChart.ascendant.formattedDMS}
                            </td>
                            <td className="py-2 px-2 font-mono">H1</td>
                            <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                            <td className="py-2 px-2 font-mono text-[var(--text-muted)]">Horizon</td>
                            <td className="py-2 px-2 text-[var(--brass)]">Angle</td>
                          </tr>
                          <tr className="bg-[var(--surface-muted)]/60 font-semibold">
                            <td className="py-2 px-2 text-[var(--brass)]">MC (Zenith)</td>
                            <td className="py-2 px-2 font-mono text-[var(--text)]">
                              {natalChart.midheaven.signSymbol} {natalChart.midheaven.signName} {natalChart.midheaven.formattedDMS}
                            </td>
                            <td className="py-2 px-2 font-mono">H10</td>
                            <td className="py-2 px-2 text-[var(--text-muted)]">—</td>
                            <td className="py-2 px-2 font-mono text-[var(--text-muted)]">Meridian</td>
                            <td className="py-2 px-2 text-[var(--brass)]">Zenith</td>
                          </tr>
                          {natalChart.planets.map(p => (
                            <tr key={p.id} className="hover:bg-[var(--surface-muted)]/50">
                              <td className="py-2 px-2 font-semibold text-[var(--text)] whitespace-nowrap">
                                <span className="mr-1.5 text-sm" style={{ color: p.color }}>
                                  {p.symbol}
                                </span>
                                {p.name}
                                {p.isRetrograde && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded obs-badge-crimson text-xs font-mono">
                                    R
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2 font-mono text-[var(--text)] whitespace-nowrap">
                                {p.signSymbol} {p.signName} {p.formattedDMS}
                              </td>
                              <td className="py-2 px-2 font-mono text-[var(--brass)] font-semibold">H{p.house}</td>
                              <td className="py-2 px-2 text-[var(--text-secondary)]">
                                {p.nakshatraName} ({p.nakshatraPada})
                              </td>
                              <td className="py-2 px-2 font-mono text-[var(--text-muted)]">
                                {p.speedDegPerDay >= 0 ? `+${p.speedDegPerDay.toFixed(2)}°` : `${p.speedDegPerDay.toFixed(2)}°`}
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
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
                    <h3 className="text-xl font-serif font-bold text-[var(--text)] mb-3">
                      Planetary Aspects &amp; Exact Orbs ({natalChart.aspects.length} Active)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {natalChart.aspects.map((asp, i) => (
                        <div key={i} className="obs-panel px-3 py-2 flex items-center justify-between">
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
                    <h3 className="text-xl font-serif font-bold text-[var(--text)] mb-3">
                      Dane Rudhyar Sabian Symbol Degree Archetypes
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      {natalChart.planets.slice(0, 9).map(p => (
                        <div key={p.id} className="obs-panel p-3">
                          <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                            <span style={{ color: p.color }}>{p.symbol}</span>
                            <span>
                              {p.name} ({p.signName} {p.formattedDMS})
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)] mt-1 italic">{p.sabianSymbol}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== WORKSPACE 5: VEDIC JYOTISH & KP ==================== */}
          {activeWorkspace === 'VEDIC_KP' && (
            <div className="space-y-6">
              <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--crimson)]">
                    AstroSage + Nepal Cheena + Prof. K.S. Krishnamurti (KP)
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                    Shodashvarga Kundali, 120-Year Vimshottari Dasha &amp; KP Sub-Lords
                  </h2>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => setVedicSubTab('KUNDALI_DASHA')}
                    className={`px-3.5 py-1.5 rounded font-semibold transition ${
                      vedicSubTab === 'KUNDALI_DASHA'
                        ? 'obs-badge-brass shadow-sm'
                        : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                    }`}
                  >
                    1. Divisional Kundali &amp; Vimshottari Dasha
                  </button>
                  <button
                    onClick={() => setVedicSubTab('KP_SUBLORDS')}
                    className={`px-3.5 py-1.5 rounded font-semibold transition ${
                      vedicSubTab === 'KP_SUBLORDS'
                        ? 'obs-badge-brass shadow-sm'
                        : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                    }`}
                  >
                    2. KP Star/Sub-Lords &amp; 1–249 Horary Prashna
                  </button>
                </div>
              </div>

              {vedicSubTab === 'KUNDALI_DASHA' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 obs-card p-5">
                    <h3 className="text-lg font-serif font-bold text-[var(--text)] mb-3">
                      Shodashvarga Divisional Kundali Explorer
                    </h3>
                    <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
                  </div>

                  <div className="lg:col-span-7 obs-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                          120-Year Nakshatra Progression
                        </span>
                        <h3 className="text-lg font-serif font-bold text-[var(--text)]">
                          Vimshottari Mahadasha &amp; Classical BPHS Fruits
                        </h3>
                      </div>
                      <div className="px-3 py-1 rounded obs-badge-brass text-xs font-mono font-semibold">
                        Active: {vedicReport.activeMahadasha.lord} – {vedicReport.activeAntardasha.lord}
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                      {vedicReport.dashas.map(d => {
                        const isOpen =
                          expandedDashaLord === d.lord || (expandedDashaLord === null && d.isCurrent);
                        const dashaFruit = PLANET_TREATISES[d.lord]?.dashaGeneralFruit;
                        return (
                          <div
                            key={d.lord}
                            className={`rounded border transition ${
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
                                  <span className="px-2 py-0.5 rounded obs-badge-brass font-mono font-semibold text-xs">
                                    CURRENT ({d.progressPercent}%)
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[var(--text-secondary)]">
                                {d.startDate} &rarr; {d.endDate}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="px-4 pb-3 pt-2 border-t border-[var(--border)] space-y-3 text-xs">
                                {dashaFruit && (
                                  <p className="text-[var(--text-secondary)] italic bg-[var(--surface)] p-2.5 rounded border border-[var(--border)]">
                                    <strong>Classical BPHS Fruit:</strong> {dashaFruit}
                                  </p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {d.antardashas.map(antar => (
                                    <div
                                      key={antar.lord}
                                      className={`p-2 rounded ${
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
                                          <span className="text-xs font-mono uppercase">Active</span>
                                        )}
                                      </div>
                                      <div className="text-xs font-mono opacity-80 mt-0.5">
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

              {vedicSubTab === 'KP_SUBLORDS' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 obs-card p-5">
                    <h3 className="text-xl font-serif font-bold text-[var(--text)] mb-1">
                      Krishnamurti Paddhati (KP) Star, Sub &amp; Sub-Sub Lords
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">
                      Proportional 1/9th Vimshottari sub-divisions across the 27 Nakshatras (KP Reader III).
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)]">
                            <th className="py-2 px-2">Planet</th>
                            <th className="py-2 px-2">Sidereal DMS</th>
                            <th className="py-2 px-2">Sign Lord</th>
                            <th className="py-2 px-2">Star Lord</th>
                            <th className="py-2 px-2 text-[var(--brass)]">KP Sub-Lord</th>
                            <th className="py-2 px-2">Sub-Sub</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {vedicReport.kpPlanets.map(row => (
                            <tr key={row.label} className="hover:bg-[var(--surface-muted)]/50">
                              <td className="py-2 px-2 font-semibold text-[var(--text)]">
                                {row.symbol} {row.label}
                              </td>
                              <td className="py-2 px-2 font-mono text-[var(--text-secondary)]">{row.longitudeDMS}</td>
                              <td className="py-2 px-2 text-[var(--text-secondary)]">{row.signLord}</td>
                              <td className="py-2 px-2 text-[var(--text)] font-medium">{row.starLord}</td>
                              <td className="py-2 px-2 font-bold text-[var(--brass)]">{row.subLord}</td>
                              <td className="py-2 px-2 text-[var(--text-muted)]">{row.subSubLord}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="lg:col-span-5 obs-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                        KP Horary Prashna (1–249 Seed)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={249}
                        value={profile.kpHoraryNumber}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            kpHoraryNumber: Math.min(249, Math.max(1, parseInt(e.target.value, 10) || 108)),
                          })
                        }
                        className="w-20 obs-input py-1 font-mono font-bold text-center"
                      />
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[var(--text)]">
                      Horary #{vedicReport.kpHorary.horaryNumber} &rarr; {vedicReport.kpHorary.ascendantSign} ({vedicReport.kpHorary.ascendantDMS})
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded obs-panel">
                        Sign: {vedicReport.kpHorary.signLord}
                      </span>
                      <span className="px-2.5 py-1 rounded obs-panel">
                        Star: {vedicReport.kpHorary.starLord}
                      </span>
                      <span className="px-2.5 py-1 rounded obs-badge-brass font-bold">
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

          {/* ==================== WORKSPACE 6: PANCHANG & NEPALI PATRO ==================== */}
          {activeWorkspace === 'PANCHANG' && <PanchangDashboard panchang={panchangReport} />}

          {/* ==================== WORKSPACE 7: DECOZ & CHEIRO NUMEROLOGY ==================== */}
          {activeWorkspace === 'NUMEROLOGY' && (
            <DecozColorChart
              report={numerologyReport}
              system={numSystem}
              onSystemChange={setNumSystem}
            />
          )}

          {/* ==================== WORKSPACE 8: SYNASTRY & 36-GUNA MILAN ==================== */}
          {activeWorkspace === 'SYNASTRY' && (
            <ResearchAndSynastryLab
              primaryProfile={profile}
              primaryChart={natalChart}
              partnerProfile={partnerProfile}
              partnerChart={partnerChart}
              onPartnerChange={setPartnerProfile}
            />
          )}
        </main>
      </div>

      {/* Editorial Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-4 px-6 text-xs text-[var(--text-muted)]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="font-serif text-sm text-[var(--text)]">OCEANOLOGY OBSERVATORY</strong> — Swiss Ephemeris, BPHS Jyotish, Nepali Patro (Bikram Sambat), Jim Lewis Astro*Carto*Graphy &amp; Decoz/Cheiro Numerology
          </div>
          <div className="font-mono">
            Active Location: {profile.location.name}, {profile.location.country} ({profile.location.elevationMeters}m) • Ayanamsha: {ayanamsha} ({natalChart.ayanamshaDegrees.toFixed(4)}°)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
