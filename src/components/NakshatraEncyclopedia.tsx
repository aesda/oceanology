import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Eye,
  ShieldAlert,
  Trees,
  CheckCircle2,
  XCircle,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NatalChartResult, norm360 } from '../engines/astronomyEngine';
import {
  ALL_NAKSHATRA_TREATISES,
  NakshatraTreatise,
  STANDARD_27_NAKSHATRAS,
} from '../data/nakshatraCodex';
import {
  EmptyStateCard,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
  SemanticTone,
} from './ui/DashboardPrimitives';

interface Props {
  chart: NatalChartResult;
  initialNakshatraIndex?: number;
  onOpenActionSimulator?: () => void;
}

type NatureFilter =
  | 'ALL'
  | 'MY_NATAL'
  | 'Dhruva'
  | 'Kshipra'
  | 'Mridu'
  | 'Chara'
  | 'Tikshna'
  | 'Ugra'
  | 'Mishra';

type StarDetailTab = 'OVERVIEW' | 'PADAS' | 'ACTIONS' | 'SHAKTI';

export const NakshatraEncyclopedia: React.FC<Props> = ({
  chart,
  initialNakshatraIndex,
  onOpenActionSimulator,
}) => {
  const moonPlanet = chart.planets.find((p) => p.id === 'Moon') || chart.planets[0];
  const [selectedIdx, setSelectedIdx] = useState<number>(
    initialNakshatraIndex !== undefined ? initialNakshatraIndex : moonPlanet.nakshatraIndex
  );
  const [natureFilter, setNatureFilter] = useState<NatureFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailTab, setDetailTab] = useState<StarDetailTab>('OVERVIEW');
  const [showStarWheel, setShowStarWheel] = useState<boolean>(false);

  useEffect(() => {
    if (initialNakshatraIndex !== undefined) {
      setSelectedIdx(initialNakshatraIndex);
    }
  }, [initialNakshatraIndex]);

  const natalOccupantsByNak = useMemo(() => {
    const map: Record<number, { label: string; symbol: string; pada: number }[]> = {};
    const ascSid =
      chart.ayanamshaMode === 'TROPICAL'
        ? norm360(chart.ascendant.longitude - 23.857)
        : chart.ascendant.longitude;
    const ascNakIdx = Math.floor(ascSid / (360 / 27)) % 27;
    const ascPada = Math.floor((ascSid % (360 / 27)) / (360 / 108)) + 1;
    map[ascNakIdx] = [{ label: 'Ascendant', symbol: 'ASC', pada: ascPada }];

    for (const p of chart.planets) {
      if (['Uranus', 'Neptune', 'Pluto'].includes(p.id)) continue;
      if (!map[p.nakshatraIndex]) map[p.nakshatraIndex] = [];
      map[p.nakshatraIndex].push({
        label: p.name.replace('North Node (Rahu)', 'Rahu').replace('South Node (Ketu)', 'Ketu'),
        symbol: p.symbol,
        pada: p.nakshatraPada,
      });
      if (p.siderealLongitude >= 276.6667 && p.siderealLongitude <= 280.8889) {
        if (!map[27]) map[27] = [];
        map[27].push({
          label: p.name,
          symbol: p.symbol,
          pada: 1,
        });
      }
    }
    return map;
  }, [chart]);

  const filteredNakshatras = useMemo(() => {
    return ALL_NAKSHATRA_TREATISES.filter((n) => {
      if (natureFilter === 'MY_NATAL' && !(natalOccupantsByNak[n.index]?.length > 0)) {
        return false;
      }
      if (
        natureFilter !== 'ALL' &&
        natureFilter !== 'MY_NATAL' &&
        !n.natureGroup.startsWith(natureFilter)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.name.toLowerCase().includes(q) ||
          n.sanskrit.includes(q) ||
          n.deity.toLowerCase().includes(q) ||
          n.ruler.toLowerCase().includes(q) ||
          n.shaktiName.toLowerCase().includes(q) ||
          n.astronomyStar.toLowerCase().includes(q) ||
          n.spanSign.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [natureFilter, searchQuery, natalOccupantsByNak]);

  const activeTreatise: NakshatraTreatise =
    ALL_NAKSHATRA_TREATISES[selectedIdx] || ALL_NAKSHATRA_TREATISES[0];
  const activeOccupants = natalOccupantsByNak[activeTreatise.index] || [];

  const verdictBadgeTone = (verdict: string): SemanticTone => {
    if (verdict === 'Supreme') return 'optimal';
    if (verdict === 'Favorable') return 'favorable';
    if (verdict === 'Avoid') return 'avoid';
    return 'mixed';
  };

  return (
    <div className="space-y-6">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            28 Nakshatras &amp; 108 Navamsha Padas
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Complete reference across all 27 sidereal mansions plus intercalary Abhijit, Padas,
            electional rules, and Taittiriya Shaktis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedIdx(moonPlanet.nakshatraIndex)}
            className="btn-editorial-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>
              My Birth Star: {moonPlanet.nakshatraName} (P{moonPlanet.nakshatraPada})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowStarWheel(!showStarWheel)}
            className="btn-editorial-secondary text-xs inline-flex items-center gap-1.5"
          >
            <span>{showStarWheel ? 'Hide Ecliptic Ring' : 'Show Ecliptic Ring'}</span>
            {showStarWheel ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Interactive 27-Star Ecliptic Wheel */}
      {showStarWheel && (
        <div className="obs-card p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5">
            <svg
              viewBox="0 0 360 360"
              className="w-full max-w-[290px] mx-auto block select-none"
              role="img"
              aria-label="27 Nakshatra sidereal ecliptic ring"
            >
              <circle
                cx={180}
                cy={180}
                r={168}
                fill="var(--chart-bg)"
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
              <circle
                cx={180}
                cy={180}
                r={124}
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.75}
              />
              <circle
                cx={180}
                cy={180}
                r={76}
                fill="var(--surface)"
                stroke="var(--border-strong)"
                strokeWidth={1}
              />

              {STANDARD_27_NAKSHATRAS.map((nak, i) => {
                const startDeg = -90 + i * (360 / 27);
                const endDeg = -90 + (i + 1) * (360 / 27);
                const midRad = (((startDeg + endDeg) / 2) * Math.PI) / 180;
                const rOut = 166;
                const rIn = 78;
                const sRad = (startDeg * Math.PI) / 180;
                const eRad = (endDeg * Math.PI) / 180;

                const x1 = 180 + rOut * Math.cos(sRad);
                const y1 = 180 + rOut * Math.sin(sRad);
                const x2 = 180 + rOut * Math.cos(eRad);
                const y2 = 180 + rOut * Math.sin(eRad);
                const x3 = 180 + rIn * Math.cos(eRad);
                const y3 = 180 + rIn * Math.sin(eRad);
                const x4 = 180 + rIn * Math.cos(sRad);
                const y4 = 180 + rIn * Math.sin(sRad);

                const isSelected = selectedIdx === i;
                const isNatalMoon = moonPlanet.nakshatraIndex === i;
                const hasAnyNatal = (natalOccupantsByNak[i]?.length || 0) > 0;

                const lx = 180 + 145 * Math.cos(midRad);
                const ly = 180 + 145 * Math.sin(midRad);
                const dx = 180 + 102 * Math.cos(midRad);
                const dy = 180 + 102 * Math.sin(midRad);

                return (
                  <g
                    key={nak.index}
                    onClick={() => setSelectedIdx(i)}
                    className="cursor-pointer transition-opacity hover:opacity-90"
                  >
                    <path
                      d={`M ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`}
                      fill={
                        isSelected
                          ? 'var(--accent-bg)'
                          : isNatalMoon
                          ? 'var(--sage-bg)'
                          : 'transparent'
                      }
                      stroke="var(--border)"
                      strokeWidth={isSelected ? 1.5 : 0.6}
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={isSelected || isNatalMoon ? '700' : '500'}
                      fill={isSelected ? 'var(--accent)' : 'var(--text-secondary)'}
                    >
                      {i + 1}
                    </text>
                    {hasAnyNatal && (
                      <circle
                        cx={dx}
                        cy={dy}
                        r={isNatalMoon ? 4 : 2.6}
                        fill={isNatalMoon ? 'var(--sage)' : 'var(--accent)'}
                      />
                    )}
                  </g>
                );
              })}

              <text
                x={180}
                y={168}
                textAnchor="middle"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--accent)"
              >
                #{String(activeTreatise.number).padStart(2, '0')}
              </text>
              <text
                x={180}
                y={186}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="var(--text)"
              >
                {activeTreatise.name}
              </text>
              <text x={180} y={203} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                {activeTreatise.sanskrit}
              </text>
            </svg>
          </div>

          <div className="md:col-span-7 space-y-3">
            <h2 className="text-base font-bold text-[var(--text)]">
              Interactive Sidereal Star Ring (0° Mesha – 360° Meena)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Click any of the 27 equal 13°20′ wedges to jump directly to that mansion, or inspect
              the 28th intercalary zenith star Abhijit (06°40′ – 10°53′20″ Capricorn). Green markers
              indicate your natal Moon; indigo markers indicate other natal planets.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedIdx(27)}
                className="btn-editorial-secondary text-xs py-1.5 px-3 min-h-[34px]"
              >
                Select #28 Abhijit (Zenith Star)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MASTER-DETAIL WORKSPACE ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT DIRECTORY RAIL (4 COLS) */}
        <aside className="xl:col-span-4 obs-card p-4 space-y-3.5 xl:sticky xl:top-20">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search Nakshatras"
              placeholder="Search name, deity, ruler, star..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full obs-input pl-9 text-xs"
            />
          </div>

          {/* Clean Nature Filter Select */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="nak-nature-filter"
              className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap"
            >
              Filter:
            </label>
            <select
              id="nak-nature-filter"
              value={natureFilter}
              onChange={(e) => setNatureFilter(e.target.value as NatureFilter)}
              className="w-full obs-input text-xs"
            >
              <option value="ALL">All 28 Mansions</option>
              <option value="MY_NATAL">My Natal Stars Only</option>
              <option value="Dhruva">Dhruva (Fixed / Permanent)</option>
              <option value="Kshipra">Kshipra (Swift / Light)</option>
              <option value="Mridu">Mridu (Soft / Tender)</option>
              <option value="Chara">Chara (Movable / Ephemeral)</option>
              <option value="Tikshna">Tikshna (Sharp / Cutting)</option>
              <option value="Ugra">Ugra (Fierce / Severe)</option>
              <option value="Mishra">Mishra (Mixed / Sharp-Soft)</option>
            </select>
          </div>

          {/* Directory List or Empty State */}
          {filteredNakshatras.length === 0 ? (
            <EmptyStateCard
              title="No matching Nakshatras"
              description="Try clearing your search query or switching the nature filter back to All 28 Mansions."
              actionLabel="Reset filters"
              onAction={() => {
                setSearchQuery('');
                setNatureFilter('ALL');
              }}
            />
          ) : (
            <div className="max-h-[560px] overflow-y-auto divide-y divide-[var(--border)] border-t border-[var(--border)] pt-1">
              {filteredNakshatras.map((nak) => {
                const isSelected = nak.index === selectedIdx;
                const occ = natalOccupantsByNak[nak.index] || [];
                return (
                  <button
                    key={nak.index}
                    type="button"
                    onClick={() => setSelectedIdx(nak.index)}
                    className={`w-full py-2.5 px-3 text-left flex items-center justify-between gap-2 rounded-md transition ${
                      isSelected
                        ? 'bg-[var(--accent-bg)] text-[var(--text)]'
                        : 'hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[var(--accent)]">
                          {String(nak.number).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-bold text-[var(--text)] truncate">
                          {nak.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] truncate">
                          {nak.sanskrit}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                        {nak.ruler} • {nak.natureGroup.split(' ')[0]} • {nak.spanSign}
                      </div>
                    </div>

                    {occ.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-1 shrink-0">
                        {occ.map((o, idx) => (
                          <span
                            key={idx}
                            title={`${o.label} in Pada ${o.pada}`}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--accent)]"
                          >
                            {o.symbol}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* RIGHT DETAIL WORKSPACE (8 COLS) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Star Summary Card */}
          <div className="obs-card p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[var(--accent)]">
                    Mansion #{String(activeTreatise.number).padStart(2, '0')} of 28
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">•</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {activeTreatise.spanSign} ({activeTreatise.spanDegrees})
                  </span>
                  {activeTreatise.isGandanta && (
                    <StatusBadge tone="avoid" label="Gandanta Junction" />
                  )}
                  {activeTreatise.isPanchaka && (
                    <StatusBadge tone="mixed" label="Dhanishtha Panchaka" />
                  )}
                </div>

                <h2 className="text-3xl font-bold text-[var(--text)] tracking-tight">
                  {activeTreatise.name}{' '}
                  <span className="text-xl font-normal text-[var(--text-muted)] ml-1">
                    {activeTreatise.sanskrit}
                  </span>
                </h2>
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  Symbol: {activeTreatise.symbol} • Yoga-Tara: {activeTreatise.astronomyStar}
                </p>
              </div>

              {onOpenActionSimulator && (
                <button
                  type="button"
                  onClick={onOpenActionSimulator}
                  className="btn-editorial-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Test Action Timing</span>
                </button>
              )}
            </div>

            {activeOccupants.length > 0 && (
              <div className="obs-panel px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-[var(--accent)]/30 bg-[var(--accent-bg)]/50">
                <span className="text-xs font-semibold text-[var(--text)]">
                  Active in Your Birth Chart:{' '}
                  <span className="font-mono text-[var(--accent)]">
                    {activeOccupants
                      .map((o) => `${o.symbol} ${o.label} (Pada ${o.pada})`)
                      .join(' • ')}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* 4 Contextual KPI Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiStatCard
              label="Vimshottari Lord"
              value={activeTreatise.ruler}
              benchmarkText={activeTreatise.purushartha}
              status={{ tone: 'info', label: activeTreatise.tattva }}
            />
            <KpiStatCard
              label="Presiding Deity"
              value={activeTreatise.deity.split('(')[0].trim()}
              benchmarkText={activeTreatise.deitySanskrit}
              status={{ tone: 'neutral', label: activeTreatise.gana }}
            />
            <KpiStatCard
              label="Nature & Gaze"
              value={activeTreatise.natureGroup.split(' ')[0]}
              benchmarkText={activeTreatise.mukhaGaze}
              status={{ tone: 'favorable', label: 'Muhurta Class' }}
            />
            <KpiStatCard
              label="Lost-Object Oracle"
              value={activeTreatise.lochanaEye.split('(')[0].trim()}
              benchmarkText={`Nadi: ${activeTreatise.nadi}`}
              status={{ tone: 'neutral', label: 'Lochana' }}
            />
          </div>

          {/* Progressive Disclosure Tabs */}
          <div className="obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4 flex flex-wrap items-center justify-between gap-3">
              <SegmentedTabs
                ariaLabel="Nakshatra sections"
                value={detailTab}
                onChange={setDetailTab}
                items={[
                  { id: 'OVERVIEW', label: 'Natal Portraits & Kutas' },
                  { id: 'PADAS', label: 'Navamsha Padas', count: activeTreatise.padas.length },
                  {
                    id: 'ACTIONS',
                    label: 'Action & Consequence',
                    count: activeTreatise.actionMatrix.length,
                  },
                  { id: 'SHAKTI', label: 'Taittiriya Shakti & Remedies' },
                ]}
              />
            </div>

            {/* TAB 1: OVERVIEW (NATAL PORTRAITS, KUTAS & ORACLE) */}
            {detailTab === 'OVERVIEW' && (
              <div className="space-y-5">
                <div className="obs-panel p-4 space-y-1.5">
                  <div className="text-xs font-bold text-[var(--accent)]">
                    Natal Moon in {activeTreatise.name} (Janma Chandra)
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed">
                    {activeTreatise.moonPortrait}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--text)]">
                      Ascendant (Lagna) Rising
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.ascendantPortrait}
                    </p>
                  </div>
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--text)]">
                      Natal Sun (Surya) Expression
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.sunPortrait}
                    </p>
                  </div>
                </div>

                {/* Gaze & Lost Object Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Directional Gaze: {activeTreatise.mukhaGaze}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.mukhaConsequence}
                    </p>
                  </div>

                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Lost-Object Prashna: {activeTreatise.lochanaEye}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.lostObjectVerdict}
                    </p>
                  </div>
                </div>

                {/* 6-Attribute Kuta Classification */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {[
                    ['Gana', activeTreatise.gana],
                    ['Yoni Animal', activeTreatise.yoni],
                    ['Ayurvedic Nadi', activeTreatise.nadi],
                    ['Marital Rajju', activeTreatise.rajju],
                    ['Purushartha', activeTreatise.purushartha],
                    ['Tattva', activeTreatise.tattva],
                  ].map(([k, v]) => (
                    <div key={k} className="obs-panel p-3">
                      <div className="text-[11px] text-[var(--text-muted)]">{k}</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Vocations & Shadow Trap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[var(--text)]">Aligned Vocations</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTreatise.vocations.map((v) => (
                        <span
                          key={v}
                          className="px-2.5 py-1 rounded-md text-xs bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="obs-panel p-3.5 space-y-1">
                    <div className="text-xs font-bold text-[var(--crimson)] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Evolutionary Shadow Trap</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.shadowTrap}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 4 NAVAMSHA PADAS */}
            {detailTab === 'PADAS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTreatise.padas.map((p) => (
                  <div key={p.pada} className="obs-panel p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-[var(--text)]">
                        Pada {p.pada} — {p.navamshaSign} Navamsha
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)] font-mono text-xs font-semibold">
                        Syllable: {p.bijaSound}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      <span>{p.degreeRange}</span>
                      <span>•</span>
                      <span>D9 Ruler: {p.navamshaRuler}</span>
                      {p.specialTag && <StatusBadge tone="info" label={p.specialTag} />}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {p.expression}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: ACTION & CONSEQUENCE MATRIX */}
            {detailTab === 'ACTIONS' && (
              <div className="space-y-5">
                <p className="text-xs text-[var(--text-secondary)]">
                  Classical electional rulings when initiating actions while the Moon transits{' '}
                  <strong>{activeTreatise.name}</strong> ({activeTreatise.natureExplanation}):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeTreatise.actionMatrix.map((ac) => (
                    <div key={ac.domain} className="obs-panel p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text)]">{ac.domain}</span>
                        <StatusBadge tone={verdictBadgeTone(ac.verdict)} label={ac.verdict} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {ac.ifPerformed}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                  <div className="obs-panel p-4 space-y-2">
                    <div className="text-xs font-bold text-[var(--sage)]">
                      Recommended Undertakings (Shubha Karya)
                    </div>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      {activeTreatise.auspiciousWorks.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="obs-panel p-4 space-y-2">
                    <div className="text-xs font-bold text-[var(--crimson)]">
                      Actions to Postpone (Varjya Karya)
                    </div>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      {activeTreatise.inauspiciousWorks.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="w-3.5 h-3.5 text-[var(--crimson)] shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TAITTIRIYA SHAKTI, MYTHOS & SACRED REMEDIES */}
            {detailTab === 'SHAKTI' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--text)]">
                      Taittiriya Brahmana Shakti &amp; Sacred Mythos
                    </h3>
                    <StatusBadge tone="info" label={activeTreatise.shaktiName} />
                  </div>
                  <p className="literary-prose text-sm">{activeTreatise.sacredMythos}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--accent)]">
                      Upari Shakti (Above)
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.upariShakti}
                    </p>
                  </div>
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--accent)]">
                      Adho Shakti (Below)
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeTreatise.adhoShakti}
                    </p>
                  </div>
                  <div className="obs-panel p-4 space-y-1.5">
                    <div className="text-xs font-bold text-[var(--sage)]">
                      Cosmic Phala (Result)
                    </div>
                    <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                      {activeTreatise.shaktiPhala}
                    </p>
                  </div>
                </div>

                <blockquote className="obs-panel p-4 border-l-4 border-l-[var(--accent)] italic font-serif text-sm text-[var(--text)]">
                  {activeTreatise.taittiriyaBoon}
                </blockquote>

                <div className="obs-panel p-4 space-y-2">
                  <div className="text-xs font-bold text-[var(--sage)] flex items-center gap-1.5">
                    <Trees className="w-4 h-4" />
                    <span>Sacred Botanical Tree, Mantra &amp; Daily Upaya</span>
                  </div>
                  <div className="text-xs text-[var(--text)] font-semibold">
                    Sacred Tree: {activeTreatise.sacredTree}
                  </div>
                  <div className="text-xs font-mono text-[var(--accent)]">
                    {activeTreatise.vedicMantra}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {activeTreatise.behavioralUpaya}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
