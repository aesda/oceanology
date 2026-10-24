import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  MapPin,
  Scale,
  BookOpen,
  Globe,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult, ZODIAC_SIGNS } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { gregorianToBikramSambat, NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';
import { ALL_NAKSHATRA_TREATISES, STANDARD_27_NAKSHATRAS } from '../data/nakshatraCodex';
import { evaluateActionConsequence } from '../data/karmaAndMuhurtaCodex';
import { CLASSICAL_CANON_BOOKS } from '../data/canonAnthology';
import { GlobalLocationPicker } from './GlobalLocationPicker';

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

const FEATURED_HOME_ACTIONS = [
  'LEND_MONEY',
  'BORROW_MONEY',
  'REPAY_DEBT',
  'SIGN_CONTRACT',
  'MARRIAGE_VIVAHA',
  'KSHAURAKARMA',
];

export const LandingPage: React.FC<Props> = ({
  profile,
  onProfileChange,
  natalChart,
  vedicReport,
  panchangReport,
  numerologyReport,
  onNavigate,
}) => {
  const [selectedActionId, setSelectedActionId] = useState<string>('LEND_MONEY');
  const [showFullGazetteer, setShowFullGazetteer] = useState<boolean>(false);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);

  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[0];
  const birthBs = useMemo(
    () => gregorianToBikramSambat(profile.year, profile.month, profile.day),
    [profile.year, profile.month, profile.day]
  );

  const transitTreatise =
    STANDARD_27_NAKSHATRAS[panchangReport.nakshatra.zeroIndex] || STANDARD_27_NAKSHATRAS[0];
  const natalTreatise =
    STANDARD_27_NAKSHATRAS[moonPlanet.nakshatraIndex] || STANDARD_27_NAKSHATRAS[0];

  const featuredEvaluations = useMemo(() => {
    const now = new Date();
    return FEATURED_HOME_ACTIONS.map((id) =>
      evaluateActionConsequence(
        id,
        now,
        profile.location,
        moonPlanet.nakshatraIndex,
        moonPlanet.signIndex
      )
    );
  }, [profile.location, moonPlanet.nakshatraIndex, moonPlanet.signIndex]);

  const activeEvaluation =
    featuredEvaluations.find((e) => e.action.id === selectedActionId) || featuredEvaluations[0];

  const quickCities = useMemo(() => {
    const wanted = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Varanasi', 'London', 'New York'];
    return NEPAL_AND_GLOBAL_CITIES.filter((c) =>
      wanted.some((w) => c.name.toLowerCase().includes(w.toLowerCase()))
    ).slice(0, 6);
  }, []);

  const hoveredPlanet =
    natalChart.planets.find((p) => p.id === hoveredPlanetId) || moonPlanet;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-20">
      {/* ==================== TOP LIVE HORIZON EPHEMERIS DATELINE ==================== */}
      <div className="border-b border-[var(--border-strong)] py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-xs font-mono text-[var(--text-secondary)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[var(--brass)] font-semibold uppercase tracking-wider">
            Live Horizon Ephemeris
          </span>
          <span className="text-[var(--border-strong)]">|</span>
          <span>
            {panchangReport.bikramSambat.formatted} • {panchangReport.dateStr}
          </span>
          <span className="text-[var(--border-strong)]">|</span>
          <span>
            {panchangReport.vara.name} • {panchangReport.tithi.name} ({panchangReport.tithi.paksha.split(' ')[0]})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            Transit Moon:{' '}
            <strong className="text-[var(--text)]">
              {panchangReport.nakshatra.name} P{panchangReport.nakshatra.pada}
            </strong>{' '}
            ({panchangReport.moonSign})
          </span>
          <span className="text-[var(--border-strong)]">|</span>
          <span>
            ☀ {panchangReport.sunriseTime} – {panchangReport.sunsetTime} ({profile.location.name})
          </span>
        </div>
      </div>

      {/* ==================== HERO MONOGRAPH SPREAD ==================== */}
      <section className="py-10 lg:py-14 border-b-2 border-[var(--text)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (7 cols): Literary Masthead & Architectural Manifesto */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-4">
              <div className="editorial-eyebrow">
                Vol. I • Astronomical Monograph, Vedic Shruti &amp; Muhurta Jurisprudence
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.65rem] font-semibold text-[var(--text)] leading-[1.06] tracking-tight">
                Where Stellar Longitude, Sacred Time &amp; Consequence Converge.
              </h1>
              <p className="literary-prose max-w-2xl pt-1">
                Oceanology is an uncompromising celestial reference and mathematical observatory.
                Grounded directly in the <em>Taittiriya Brahmana</em>, Maharishi Parashara’s{' '}
                <em>Brihat Parashara Hora Shastra</em>, Ramadaivajna’s <em>Muhurta Chintamani</em>,
                Krishnamurti Paddhati, Ptolemy’s <em>Tetrabiblos</em>, and Rudhyar’s 360° Mandala,
                every planetary vector, Nakshatra Pada, and electional consequence is computed locally
                to arc-second precision.
              </p>
            </div>

            {/* Primary Editorial Navigation Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                className="btn-editorial-primary inline-flex items-center gap-2"
              >
                <span>Open Personal Observatory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('NAKSHATRAS', { nakIdx: moonPlanet.nakshatraIndex })}
                className="btn-editorial-secondary inline-flex items-center gap-2"
              >
                <span>28 Nakshatras &amp; 108 Padas</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brass)]" />
              </button>
              <button
                onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: 'LEND_MONEY' })}
                className="btn-editorial-secondary inline-flex items-center gap-2"
              >
                <Scale className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>“What Happens If...” Oracle</span>
              </button>
            </div>

            {/* Ruled 4-Column Mathematical Colophon Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-b border-[var(--border-strong)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] pt-0">
              <div className="py-4 sm:pr-4">
                <div className="font-serif text-3xl font-bold text-[var(--text)] tabular-nums">
                  28 <span className="text-lg font-normal text-[var(--brass)]">/ 108</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Lunar Mansions (incl. Abhijit) &amp; Navamsha Padas
                </div>
              </div>
              <div className="py-4 sm:px-4">
                <div className="font-serif text-3xl font-bold text-[var(--text)] tabular-nums">
                  20 <span className="text-lg font-normal text-[var(--brass)]">Rules</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Live Muhurta Action-Consequence Verdicts
                </div>
              </div>
              <div className="py-4 sm:px-4">
                <div className="font-serif text-3xl font-bold text-[var(--text)] tabular-nums">
                  337 <span className="text-lg font-normal text-[var(--brass)]">Bindus</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Exact BPHS Ch. 66 Ashtakavarga &amp; 16 Vargas
                </div>
              </div>
              <div className="py-4 sm:pl-4">
                <div className="font-serif text-3xl font-bold text-[var(--text)] tabular-nums">
                  360° <span className="text-lg font-normal text-[var(--brass)]">Canon</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Authentic Sabian Degrees &amp; 9 Classical Books
                </div>
              </div>
            </div>

            {/* Active Natal Folio Readout Bar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="editorial-eyebrow">Currently Cast Natal Anchor</div>
                <div className="font-serif text-xl font-bold text-[var(--text)]">
                  {profile.firstName} {profile.lastName} — { natalChart.ascendant.signSymbol }{' '}
                  {natalChart.ascendant.signName} Lagna • {moonPlanet.nakshatraName} (Pada{' '}
                  {moonPlanet.nakshatraPada})
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)]">
                  Born {birthBs.formattedEn} ({profile.year}-{String(profile.month).padStart(2, '0')}-
                  {String(profile.day).padStart(2, '0')}) • Active Vimshottari:{' '}
                  <span className="text-[var(--brass)] font-semibold">
                    {vedicReport.activeMahadasha.lord}–{vedicReport.activeAntardasha.lord}
                  </span>{' '}
                  • Life Path #{numerologyReport.lifePath.trail}
                </div>
              </div>
              <button
                onClick={() => onNavigate('CANON')}
                className="text-xs font-mono uppercase tracking-wider text-[var(--brass)] hover:underline inline-flex items-center gap-1"
              >
                <span>Read Natal Folio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Engraved Celestial Armillary + Instant Natal Casting Ledger */}
          <div className="lg:col-span-5 folio-sheet p-5 sm:p-6 space-y-5">
            {/* Engraved Interactive Celestial Ecliptic Instrument */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <div className="editorial-eyebrow">Interactive Ecliptic Plate</div>
                <h2 className="font-serif text-xl font-bold text-[var(--text)]">
                  Sidereal Rashi &amp; 27-Nakshatra Ring
                </h2>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Ayanamsha {natalChart.ayanamshaDegrees.toFixed(2)}°
              </span>
            </div>

            <div className="relative flex flex-col items-center">
              <svg
                viewBox="0 0 340 340"
                className="w-full max-w-[300px] h-auto select-none"
                aria-label="Interactive Celestial Ecliptic Plate"
              >
                <circle
                  cx={170}
                  cy={170}
                  r={160}
                  fill="var(--chart-bg)"
                  stroke="var(--border-strong)"
                  strokeWidth={1.2}
                />
                {/* Outer 27 Nakshatra Spokes */}
                <g className="animate-celestial-slow" style={{ transformOrigin: '170px 170px' }}>
                  {Array.from({ length: 27 }).map((_, i) => {
                    const deg = i * (360 / 27) - 90;
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 170 + 148 * Math.cos(rad);
                    const y1 = 170 + 148 * Math.sin(rad);
                    const x2 = 170 + 160 * Math.cos(rad);
                    const y2 = 170 + 160 * Math.sin(rad);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="var(--brass)"
                        strokeOpacity={0.5}
                        strokeWidth={0.9}
                      />
                    );
                  })}
                </g>

                <circle
                  cx={170}
                  cy={170}
                  r={148}
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth={0.9}
                />
                <circle
                  cx={170}
                  cy={170}
                  r={118}
                  fill="none"
                  stroke="var(--chart-grid)"
                  strokeWidth={0.8}
                />
                <circle
                  cx={170}
                  cy={170}
                  r={66}
                  fill="var(--surface)"
                  stroke="var(--border)"
                  strokeWidth={0.9}
                />

                {/* 12 Zodiac Sign Divisions & Glyphs */}
                {ZODIAC_SIGNS.map((z, idx) => {
                  const startDeg = idx * 30 - 90;
                  const midDeg = startDeg + 15;
                  const sRad = (startDeg * Math.PI) / 180;
                  const mRad = (midDeg * Math.PI) / 180;
                  return (
                    <g key={z.name}>
                      <line
                        x1={170 + 118 * Math.cos(sRad)}
                        y1={170 + 118 * Math.sin(sRad)}
                        x2={170 + 148 * Math.cos(sRad)}
                        y2={170 + 148 * Math.sin(sRad)}
                        stroke="var(--chart-grid)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={170 + 133 * Math.cos(mRad)}
                        y={170 + 133 * Math.sin(mRad) + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--text-secondary)"
                        fontFamily="serif"
                      >
                        {z.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* Ascendant Axis */}
                {(() => {
                  const ascRad = ((natalChart.ascendant.longitude - 90) * Math.PI) / 180;
                  return (
                    <line
                      x1={170 + 66 * Math.cos(ascRad)}
                      y1={170 + 66 * Math.sin(ascRad)}
                      x2={170 + 148 * Math.cos(ascRad)}
                      y2={170 + 148 * Math.sin(ascRad)}
                      stroke="var(--crimson)"
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  );
                })()}

                {/* Natal Planetary Markers */}
                {natalChart.planets.slice(0, 9).map((p, i) => {
                  const angleRad = ((p.activeLongitude - 90) * Math.PI) / 180;
                  const ringR = i % 2 === 0 ? 100 : 84;
                  const px = 170 + ringR * Math.cos(angleRad);
                  const py = 170 + ringR * Math.sin(angleRad);
                  const isActive = hoveredPlanet.id === p.id;
                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPlanetId(p.id)}
                      onClick={() => onNavigate('NAKSHATRAS', { nakIdx: p.nakshatraIndex })}
                    >
                      <circle
                        cx={px}
                        cy={py}
                        r={isActive ? 11 : 9}
                        fill="var(--surface)"
                        stroke={isActive ? 'var(--brass)' : p.color}
                        strokeWidth={isActive ? 1.8 : 1.1}
                      />
                      <text
                        x={px}
                        y={py + 4}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="bold"
                        fill={p.color}
                      >
                        {p.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* Center Readout */}
                <text
                  x={170}
                  y={162}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--brass)"
                >
                  {hoveredPlanet.symbol} {hoveredPlanet.name.toUpperCase()}
                </text>
                <text
                  x={170}
                  y={176}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontFamily="Cormorant Garamond, serif"
                  fontWeight="bold"
                  fill="var(--text)"
                >
                  {hoveredPlanet.nakshatraName} P{hoveredPlanet.nakshatraPada}
                </text>
                <text
                  x={170}
                  y={189}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--text-muted)"
                >
                  {hoveredPlanet.signName} {hoveredPlanet.formattedDMS}
                </text>
              </svg>
              <div className="text-[11px] font-mono text-[var(--text-muted)] text-center mt-1">
                Hover any Graha to inspect longitude • Click to open its Nakshatra treatise
              </div>
            </div>

            {/* Inline Natal Folio Casting Ledger */}
            <div className="border-t border-[var(--border-strong)] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="editorial-eyebrow">Cast Your Natal Folio</span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  100% Client-Side Ephemeris
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    First Name
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
                    className="w-full obs-input py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Last Name
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
                    className="w-full obs-input py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Birth Date (YYYY / MM / DD)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      value={profile.year}
                      onChange={(e) =>
                        onProfileChange({ ...profile, year: parseInt(e.target.value, 10) || 1996 })
                      }
                      className="obs-input py-1.5 font-mono text-xs"
                    />
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={profile.month}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
                        })
                      }
                      className="obs-input py-1.5 font-mono text-xs"
                    />
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={profile.day}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          day: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)),
                        })
                      }
                      className="obs-input py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Birth Time (24h HH : MM)
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={profile.hour}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          hour: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      className="obs-input py-1.5 font-mono text-xs"
                    />
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={profile.minute}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          minute: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      className="obs-input py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Horizon Presets + Expandable Global Search */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)] font-medium inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--brass)]" />
                    {profile.location.name}, {profile.location.country} ({profile.location.elevationMeters}m)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullGazetteer(!showFullGazetteer)}
                    className="font-mono text-[var(--brass)] hover:underline"
                  >
                    {showFullGazetteer ? 'Close Search' : 'Search Any City'}
                  </button>
                </div>

                {!showFullGazetteer ? (
                  <div className="flex flex-wrap gap-1">
                    {quickCities.map((city) => {
                      const active = city.id === profile.location.id;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => onProfileChange({ ...profile, location: city })}
                          className={`px-2 py-0.5 text-[11px] font-mono border transition ${
                            active
                              ? 'border-[var(--brass)] bg-[var(--brass-bg)] text-[var(--brass)] font-semibold'
                              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {city.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-1">
                    <GlobalLocationPicker
                      label="Worldwide & Nepal 7-Province Gazetteer"
                      value={profile.location}
                      onChange={(loc) => {
                        onProfileChange({ ...profile, location: loc });
                        setShowFullGazetteer(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('OBSERVATORY', { studioTab: 'SYNTHESIS' })}
                className="w-full btn-editorial-primary flex items-center justify-center gap-2"
              >
                <span>Examine Complete Natal Chart &amp; Vargas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER I: "WHAT HAPPENS IF..." LIVE CONSEQUENCE ORACLE ==================== */}
      <section className="py-14 border-b border-[var(--border-strong)] space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="editorial-eyebrow">
              Chapter I • Electional Cause &amp; Consequence (Muhurta Chintamani)
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
              What Happens If You Perform an Action Under Today’s Sky?
            </h2>
            <p className="literary-prose">
              In Vedic astronomy, time is neither blank nor uniform. Lending capital in{' '}
              <em>Ashlesha</em> or fixed <em>Dhruva</em> stars locks recovery; marrying in{' '}
              <em>Pushya</em>—though supreme for gold—violates Vivaha Shastra; repaying debt on{' '}
              <em>Mangalavara</em> or <em>Rikta Tithi</em> permanently dissolves liability. Select
              any act below to inspect its live ruling for {profile.location.name} right now.
            </p>
          </div>
          <button
            onClick={() => onNavigate('WHAT_HAPPENS_IF', { actionId: activeEvaluation.action.id })}
            className="btn-editorial-secondary inline-flex items-center gap-2"
          >
            <span>Open Full 20-Action Simulator &amp; 12-Day Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 6 Signature Life Actions Evaluated Live */}
          <div className="lg:col-span-5 border-t border-[var(--border-strong)] divide-y divide-[var(--border)]">
            {featuredEvaluations.map((ev) => {
              const isSelected = ev.action.id === activeEvaluation.action.id;
              return (
                <button
                  key={ev.action.id}
                  onClick={() => setSelectedActionId(ev.action.id)}
                  className={`w-full py-3.5 px-3 text-left flex items-center justify-between gap-3 transition ${
                    isSelected
                      ? 'bg-[var(--surface)] border-l-2 border-l-[var(--brass)]'
                      : 'hover:bg-[var(--surface)]/60'
                  }`}
                >
                  <div>
                    <div className="font-serif text-lg font-bold text-[var(--text)] leading-snug">
                      {ev.action.title}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      {ev.action.sanskritTitle} • {ev.action.category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-sm font-bold tabular-nums ${
                        ev.score >= 70
                          ? 'text-[var(--sage)]'
                          : ev.score >= 48
                          ? 'text-[var(--brass)]'
                          : 'text-[var(--crimson)]'
                      }`}
                    >
                      {ev.score}/100
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      {ev.score >= 70 ? 'Auspicious' : ev.score >= 48 ? 'Mixed' : 'Postpone'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Live Consequence Verdict Sheet */}
          <div className="lg:col-span-7 folio-sheet p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <div className="editorial-eyebrow">{activeEvaluation.action.classicalSource}</div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                  {activeEvaluation.action.shortPrompt}
                </h3>
              </div>
              <div
                className={`px-3 py-1.5 font-mono text-xs font-semibold flex items-center gap-1.5 ${
                  activeEvaluation.score >= 70
                    ? 'obs-badge-sage'
                    : activeEvaluation.score >= 48
                    ? 'obs-badge-brass'
                    : 'obs-badge-crimson'
                }`}
              >
                {activeEvaluation.score >= 70 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : activeEvaluation.score >= 48 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {activeEvaluation.verdictTier} ({activeEvaluation.score}/100)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-serif text-lg font-semibold text-[var(--text)]">
                {activeEvaluation.headlineVerdict}
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {activeEvaluation.whatHappensIfDoneNow}
              </p>
            </div>

            {/* Classical Contrast: Auspicious vs Forbidden Consequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--sage)] font-semibold">
                  If Done in Siddha / Favored Window
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeEvaluation.action.ifDoneInAuspiciousWindow}
                </p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--crimson)] font-semibold">
                  If Forced in Contraindicated Window
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeEvaluation.action.ifDoneInForbiddenWindow}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)] text-xs">
              <span className="font-mono text-[var(--text-muted)]">
                Evaluated against {panchangReport.nakshatra.name}, {panchangReport.tithi.name},{' '}
                {panchangReport.vara.name.split(' ')[0]} &amp; Tarabala #{panchangReport.personalTarabala.taraNumber}
              </span>
              <button
                onClick={() =>
                  onNavigate('WHAT_HAPPENS_IF', { actionId: activeEvaluation.action.id })
                }
                className="font-mono uppercase tracking-wider text-[var(--brass)] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Scan Best Upcoming Dates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER II: THE 28 LUNAR MANSIONS (NAKSHATRA SUKTA) ==================== */}
      <section className="py-14 border-b border-[var(--border-strong)] space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="editorial-eyebrow">
              Chapter II • Complete 28-Nakshatra &amp; 108-Pada Monograph
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
              Every Lunar Mansion, Shakti, Gaze &amp; Lost-Object Oracle
            </h2>
            <p className="literary-prose">
              Explore all 27 classical ecliptic mansions (13°20′ each) plus the intercalary{' '}
              <strong>28th mansion Abhijit</strong> (06°40′–10°53′20″ Makara), complete with{' '}
              <em>Taittiriya Brahmana</em> Upari/Adho/Phala Shaktis, <em>Mukha</em> directional
              gazes, <em>Lochana</em> lost-article verdicts, and all four Navamsha Padas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('NAKSHATRAS', { nakIdx: moonPlanet.nakshatraIndex })}
            className="btn-editorial-primary inline-flex items-center gap-2"
          >
            <span>Open Interactive 28-Star Wheel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Spotlight: Today's Transit Mansion vs. Your Natal Janma Mansion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              badge: `Today’s Sky Transit • Pada ${panchangReport.nakshatra.pada}`,
              star: transitTreatise,
            },
            {
              badge: `Your Natal Janma Star (${profile.firstName}) • Pada ${moonPlanet.nakshatraPada}`,
              star: natalTreatise,
            },
          ].map(({ badge, star }, idx) => (
            <div key={idx} className="folio-sheet p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div>
                  <div className="editorial-eyebrow">{badge}</div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                    #{star.number} {star.name}{' '}
                    <span className="font-normal text-[var(--text-muted)]">({star.sanskrit})</span>
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    {star.spanDegrees} {star.spanSign} • Lord: {star.ruler} • Deity: {star.deity}
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono obs-badge-brass">
                  {star.natureGroup.split(' ')[0]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[var(--bg-elevated)] p-3.5 border border-[var(--border)]">
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--brass)]">
                    Taittiriya Shakti
                  </div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">{star.shaktiName}</div>
                  <div className="text-[var(--text-muted)] mt-0.5">{star.shaktiTranslation}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--brass)]">
                    Mukha Gaze
                  </div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">
                    {star.mukhaGaze.split(' ')[0]}
                  </div>
                  <div className="text-[var(--text-muted)] mt-0.5">
                    {star.lochanaEye.split(' (')[0]}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--brass)]">
                    Manifest Phala
                  </div>
                  <div className="text-[var(--text-secondary)] mt-0.5 line-clamp-3">
                    {star.shaktiPhala}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {star.moonPortrait}
              </p>

              <button
                onClick={() => onNavigate('NAKSHATRAS', { nakIdx: star.index })}
                className="text-xs font-mono uppercase tracking-wider text-[var(--brass)] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Read All 4 Padas &amp; Action Matrix for {star.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Complete 28-Mansion Direct Index */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Direct Index of All 28 Lunar Mansions (Click Any Mansion to Read Treatise)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border-t border-l border-[var(--border)]">
            {ALL_NAKSHATRA_TREATISES.map((nak) => {
              const isNatal = nak.index === moonPlanet.nakshatraIndex;
              const isTransit = nak.index === panchangReport.nakshatra.zeroIndex;
              return (
                <button
                  key={nak.number}
                  onClick={() => onNavigate('NAKSHATRAS', { nakIdx: nak.index })}
                  className={`p-3 text-left border-r border-b border-[var(--border)] transition hover:bg-[var(--brass-bg)] ${
                    isNatal
                      ? 'bg-[var(--surface)] ring-1 ring-inset ring-[var(--brass)]'
                      : 'bg-[var(--surface)]/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>#{String(nak.number).padStart(2, '0')}</span>
                    <span>
                      {isNatal ? '★ Natal' : isTransit ? '☽ Today' : nak.ruler.slice(0, 3)}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-base text-[var(--text)] mt-0.5 truncate">
                    {nak.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    {nak.sanskrit} • {nak.natureGroup.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER III: FOUR MATHEMATICAL CHAMBERS ==================== */}
      <section className="py-14 border-b border-[var(--border-strong)] space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="editorial-eyebrow">Chapter III • Multi-System Observatory Chambers</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
            Four Independent Mathematical Engines, Cross-Verified
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-t-2 border-[var(--text)] border-l border-[var(--border)]">
          {[
            {
              num: '01',
              title: 'Parashari Jyotish, 16 Vargas, Jaimini & 337-Bindu Ashtakavarga',
              sub: 'BPHS Ch. 6–66 • Krishnamurti Paddhati (1–249) • 22+ Classical Yogas',
              desc: 'Inspect North/South Indian Shodashvarga harmonics (D1–D60), 3-tier Vimshottari Dashas, Jaimini 7 Chara Karakas, exact 337-bindu Sarvashtakavarga strength tables, and KP cuspal sub-lords.',
              cta: 'Open Jyotish & Ashtakavarga Chamber',
              tab: 'VEDIC_KP' as ObservatoryStudioTab,
              icon: <Sparkles className="w-4 h-4 text-[var(--brass)]" />,
            },
            {
              num: '02',
              title: 'Ecliptic Natal Astrolabe & Authentic 360° Sabian Mandala',
              sub: 'VSOP87 / Astronomy-Engine • Placidus, Sripati & Whole Sign • Rectification',
              desc: 'High-precision geocentric longitudes, daily angular speeds, retrograde stations, applying/separating aspect orbs, ±120m birth-time rectification, and all 360 authentic degree symbols.',
              cta: 'Open Ecliptic Wheel & Ephemeris',
              tab: 'WESTERN' as ObservatoryStudioTab,
              icon: <Compass className="w-4 h-4 text-[var(--brass)]" />,
            },
            {
              num: '03',
              title: 'Global Astro*Carto*Graphy & Himalayan Bikram Sambat Patro',
              sub: '48 Planetary Horizon/Meridian Lines • Nepal 7-Province Elevation Panchang',
              desc: 'Project rising, setting, zenith, and nadir planetary lines across a live world vector atlas, paired with elevation-aware Sunrise/Sunset, Vedic Ghati-Pal, Panchaka, and Dishashoola.',
              cta: 'Explore World Relocation Atlas',
              tab: 'ASTROCARTOGRAPHY' as ObservatoryStudioTab,
              icon: <Globe className="w-4 h-4 text-[var(--brass)]" />,
            },
            {
              num: '04',
              title: 'Chaldean/Pythagorean Chromatics & 36-Guna Synastry Lab',
              sub: 'Hans Decoz 50-Year Matrix • Cheiro Compound Lore • Ashtakoota Matchmaking',
              desc: 'Compare Pythagorean and Chaldean acoustic name frequencies alongside authentic 8-Koota (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi) relational compatibility.',
              cta: 'Open Numerology & Synastry Chambers',
              tab: 'NUMEROLOGY' as ObservatoryStudioTab,
              icon: <Hash className="w-4 h-4 text-[var(--brass)]" />,
            },
          ].map((chamber) => (
            <div
              key={chamber.num}
              className="p-6 sm:p-8 bg-[var(--surface)] border-r border-b border-[var(--border)] flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--brass)] font-semibold">
                    CHAMBER {chamber.num}
                  </span>
                  {chamber.icon}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[var(--text)] leading-snug">
                  {chamber.title}
                </h3>
                <div className="text-xs font-mono text-[var(--text-muted)]">{chamber.sub}</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                  {chamber.desc}
                </p>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('OBSERVATORY', { studioTab: chamber.tab })}
                  className="text-xs font-mono uppercase tracking-wider text-[var(--text)] font-semibold border-b border-[var(--text)] pb-0.5 hover:text-[var(--brass)] hover:border-[var(--brass)] inline-flex items-center gap-1.5 transition"
                >
                  <span>{chamber.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CHAPTER IV: THE NINE CLASSICAL & MODERN BOOKS ==================== */}
      <section className="pt-14 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="editorial-eyebrow">
              Chapter IV • Primary Textual Lineage &amp; Source Sutras
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
              The Nine Foundational Books Encoded Into Oceanology
            </h2>
            <p className="literary-prose">
              Every algorithm and interpretive treatise in this platform traces back to primary
              Sanskrit, Hellenistic, and modern psychological texts. Select any volume to study its
              original aphorisms, commentaries, and Personalized Natal Bhava Rulings.
            </p>
          </div>
          <button
            onClick={() => onNavigate('CANON')}
            className="btn-editorial-secondary inline-flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--brass)]" />
            <span>Open Complete Sacred Canon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--border-strong)]">
          {CLASSICAL_CANON_BOOKS.map((book) => (
            <button
              key={book.id}
              onClick={() => onNavigate('CANON', { bookId: book.id })}
              className="p-6 text-left bg-[var(--surface)] border-r border-b border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--brass)] font-bold">VOL. {book.number}</span>
                  <span className="text-[var(--text-muted)]">{book.tradition}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--text)] group-hover:text-[var(--brass)] transition">
                  {book.title}
                </h3>
                <div className="text-xs font-serif italic text-[var(--text-secondary)]">
                  {book.sanskritOrOriginal}
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  {book.author} • {book.eraAndLineage}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1 line-clamp-4">
                  {book.thesis}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--brass)]">
                <span>Read {book.sutras.length} Sutras &amp; Commentary</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
