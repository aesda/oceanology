import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, ArrowUpRight, Compass, Eye, ShieldAlert, Trees } from 'lucide-react';
import { NatalChartResult, norm360 } from '../engines/astronomyEngine';
import {
  ALL_NAKSHATRA_TREATISES,
  NakshatraTreatise,
  STANDARD_27_NAKSHATRAS,
} from '../data/nakshatraCodex';

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

  useEffect(() => {
    if (initialNakshatraIndex !== undefined) {
      setSelectedIdx(initialNakshatraIndex);
    }
  }, [initialNakshatraIndex]);

  // Map which natal bodies occupy each of the 27 Nakshatras (+ Abhijit check)
  const natalOccupantsByNak = useMemo(() => {
    const map: Record<number, { label: string; symbol: string; pada: number }[]> = {};
    const ascSid =
      chart.ayanamshaMode === 'TROPICAL'
        ? norm360(chart.ascendant.longitude - 23.857)
        : chart.ascendant.longitude;
    const ascNakIdx = Math.floor(ascSid / (360 / 27)) % 27;
    const ascPada = Math.floor((ascSid % (360 / 27)) / (360 / 108)) + 1;
    map[ascNakIdx] = [{ label: 'Lagna', symbol: 'ASC', pada: ascPada }];

    for (const p of chart.planets) {
      if (['Uranus', 'Neptune', 'Pluto'].includes(p.id)) continue;
      if (!map[p.nakshatraIndex]) map[p.nakshatraIndex] = [];
      map[p.nakshatraIndex].push({
        label: p.name.replace('North Node (Rahu)', 'Rahu').replace('South Node (Ketu)', 'Ketu'),
        symbol: p.symbol,
        pada: p.nakshatraPada,
      });
      // Check if planet also falls inside Abhijit (276°40' to 280°53'20" Makara)
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

  const verdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'Supreme':
        return 'text-[var(--sage)] bg-[var(--sage-bg)] border-[var(--sage)]/30';
      case 'Favorable':
        return 'text-[var(--brass)] bg-[var(--brass-bg)] border-[var(--brass)]/30';
      case 'Avoid':
        return 'text-[var(--crimson)] bg-[var(--crimson-bg)] border-[var(--crimson)]/30';
      default:
        return 'text-[var(--text-secondary)] bg-[var(--surface-muted)] border-[var(--border-strong)]';
    }
  };

  return (
    <div className="space-y-10">
      {/* Monograph Masthead */}
      <section className="border-b border-[var(--border)] pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div className="editorial-eyebrow">
              Taittiriya Brahmana • Muhurta Chintamani • Brihat Samhita
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[var(--text)] leading-[1.08]">
              The Codex of 28 Lunar Mansions &amp; 108 Navamsha Padas
            </h1>
            <p className="literary-prose max-w-3xl">
              Long before solar-sign simplifications, Vedic astronomers mapped the Moon’s 27.32-day sidereal pilgrimage across twenty-seven starry inns—plus the zenith crown of <em>Abhijit</em>. Each mansion holds an esoteric <em>Shakti</em>, directional gaze, lost-object oracle, four 3°20′ Navamsha steps, and strict electional laws of action and consequence.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right space-y-2">
            <div className="inline-block text-left border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
                Your Janma Nakshatra (Birth Moon)
              </div>
              <button
                onClick={() => setSelectedIdx(moonPlanet.nakshatraIndex)}
                className="mt-1 text-lg font-serif font-semibold text-[var(--text)] hover:text-[var(--brass)] transition flex items-center gap-2"
              >
                <span>
                  ☽ {moonPlanet.nakshatraName} — Pada {moonPlanet.nakshatraPada}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--brass)]" />
              </button>
              <div className="font-mono text-xs text-[var(--text-muted)]">
                Ruler: {moonPlanet.nakshatraLord} • {moonPlanet.sanskritSign} {moonPlanet.formattedDMS}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Ecliptic Star Ring + Directory Navigation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols on xl): Interactive 27-Star Ecliptic Wheel + Search/Filter Index */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-20">
          {/* Interactive SVG 27-Spoke Star Ring */}
          <div className="obs-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
                Sidereal Ecliptic Ring (0° Mesha – 360° Meena)
              </span>
              <button
                onClick={() => setSelectedIdx(27)}
                className={`font-mono text-[11px] px-2 py-0.5 border transition ${
                  selectedIdx === 27
                    ? 'obs-badge-brass font-semibold'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
                }`}
              >
                ★ 28th Abhijit
              </button>
            </div>

            <svg viewBox="0 0 360 360" className="w-full max-w-[320px] mx-auto block select-none">
              <circle cx={180} cy={180} r={168} fill="var(--chart-bg)" stroke="var(--border-strong)" strokeWidth={1} />
              <circle cx={180} cy={180} r={124} fill="none" stroke="var(--border)" strokeWidth={0.75} />
              <circle cx={180} cy={180} r={76} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1} />

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

                const labelR = 145;
                const lx = 180 + labelR * Math.cos(midRad);
                const ly = 180 + labelR * Math.sin(midRad);

                const dotR = 102;
                const dx = 180 + dotR * Math.cos(midRad);
                const dy = 180 + dotR * Math.sin(midRad);

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
                          ? 'var(--brass-bg)'
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
                      fill={isSelected ? 'var(--brass)' : 'var(--text-secondary)'}
                    >
                      {i + 1}
                    </text>
                    {hasAnyNatal && (
                      <circle
                        cx={dx}
                        cy={dy}
                        r={isNatalMoon ? 4 : 2.6}
                        fill={isNatalMoon ? 'var(--sage)' : 'var(--brass)'}
                      />
                    )}
                  </g>
                );
              })}

              {/* Center Emblem */}
              <text
                x={180}
                y={166}
                textAnchor="middle"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--brass)"
              >
                NO. {String(activeTreatise.number).padStart(2, '0')}
              </text>
              <text
                x={180}
                y={185}
                textAnchor="middle"
                fontSize="16"
                fontFamily="Cormorant Garamond, serif"
                fontWeight="700"
                fill="var(--text)"
              >
                {activeTreatise.name}
              </text>
              <text
                x={180}
                y={202}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
              >
                {activeTreatise.sanskrit}
              </text>
            </svg>

            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--sage)] inline-block" /> Janma Moon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--brass)] inline-block" /> Natal Graha
              </span>
              <span>Click any wedge</span>
            </div>
          </div>

          {/* Search & Nature Group Filter */}
          <div className="obs-card p-4 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search star, deity, shakti, ruler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full obs-input pl-8 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {(
                [
                  ['ALL', 'All (28)'],
                  ['MY_NATAL', 'My Natal Stars'],
                  ['Dhruva', 'Dhruva (Fixed)'],
                  ['Kshipra', 'Kshipra (Swift)'],
                  ['Mridu', 'Mridu (Soft)'],
                  ['Chara', 'Chara (Movable)'],
                  ['Tikshna', 'Tikshna (Sharp)'],
                  ['Ugra', 'Ugra (Fierce)'],
                  ['Mishra', 'Mishra (Mixed)'],
                ] as [NatureFilter, string][]
              ).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setNatureFilter(code)}
                  className={`px-2.5 py-1 border transition ${
                    natureFilter === code
                      ? 'obs-badge-brass font-semibold'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable Index List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border)] border-t border-[var(--border)] pt-1">
              {filteredNakshatras.map((nak) => {
                const isSelected = nak.index === selectedIdx;
                const occ = natalOccupantsByNak[nak.index] || [];
                return (
                  <button
                    key={nak.index}
                    onClick={() => setSelectedIdx(nak.index)}
                    className={`w-full py-2.5 px-2.5 text-left flex items-center justify-between gap-2 transition ${
                      isSelected ? 'bg-[var(--brass-bg)]' : 'hover:bg-[var(--surface-muted)]/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[var(--brass)]">
                          {String(nak.number).padStart(2, '0')}
                        </span>
                        <span className="font-serif font-semibold text-base text-[var(--text)]">
                          {nak.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{nak.sanskrit}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {nak.ruler} • {nak.natureGroup.split(' ')[0]} • {nak.spanDegrees}
                      </div>
                    </div>
                    {occ.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-1">
                        {occ.map((o, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--brass)]/40 bg-[var(--surface)] text-[var(--brass)]"
                            title={`${o.label} in Pada ${o.pada}`}
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
          </div>
        </div>

        {/* Right Column (8 cols on xl): Complete Monograph Folio for Active Nakshatra */}
        <article className="xl:col-span-8 folio-sheet p-6 sm:p-10 space-y-10">
          {/* Monograph Title Block */}
          <header className="border-b border-[var(--border)] pb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="editorial-eyebrow">
                Mansion {String(activeTreatise.number).padStart(2, '0')} of 28 • {activeTreatise.spanSign} ({activeTreatise.spanDegrees})
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {activeTreatise.isGandanta && (
                  <span className="px-2.5 py-0.5 obs-badge-crimson">Gandanta Threshold</span>
                )}
                {activeTreatise.isPanchaka && (
                  <span className="px-2.5 py-0.5 obs-badge-crimson">Dhanishtha Panchaka Arc</span>
                )}
                {activeTreatise.index === 27 && (
                  <span className="px-2.5 py-0.5 obs-badge-brass">Intercalary 28th Zenith Star</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h2 className="text-4xl sm:text-5xl font-serif font-normal text-[var(--text)]">
                  {activeTreatise.name}{' '}
                  <span className="text-2xl sm:text-3xl text-[var(--brass)] font-normal ml-2">
                    {activeTreatise.sanskrit}
                  </span>
                </h2>
                <p className="text-sm text-[var(--text-muted)] font-mono mt-1">
                  Transliteration: {activeTreatise.transliteration} • Yoga-Tara: {activeTreatise.astronomyStar}
                </p>
              </div>
            </div>

            {/* Personal Chart Occupants Banner if user has planets here */}
            {activeOccupants.length > 0 && (
              <div className="bg-[var(--brass-bg)] border-l-2 border-l-[var(--brass)] px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono uppercase tracking-wider text-[var(--brass)] font-semibold mr-2">
                    Active in Your Natal Chart:
                  </span>
                  <span className="text-[var(--text)] font-medium">
                    {activeOccupants.map((o) => `${o.symbol} ${o.label} (Pada ${o.pada})`).join('  •  ')}
                  </span>
                </div>
              </div>
            )}

            {/* Primary Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)] text-xs">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Vimshottari Lord
                </div>
                <div className="font-serif text-lg font-semibold text-[var(--text)] mt-0.5">
                  {activeTreatise.ruler}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Presiding Devata
                </div>
                <div className="font-serif text-lg font-semibold text-[var(--text)] mt-0.5">
                  {activeTreatise.deity.split('(')[0]}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{activeTreatise.deitySanskrit}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Primary Emblem
                </div>
                <div className="font-medium text-[var(--text)] mt-0.5">{activeTreatise.symbol}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Functional Nature
                </div>
                <div className="font-medium text-[var(--brass)] mt-0.5">{activeTreatise.natureGroup}</div>
              </div>
            </div>
          </header>

          {/* SECTION I: TAITTIRIYA BRAHMANA SHAKTI & MYTHOS */}
          <section className="space-y-5">
            <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
              <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                I. Taittiriya Brahmana Shakti &amp; Sacred Mythos
              </h3>
              <span className="font-mono text-[11px] text-[var(--brass)]">{activeTreatise.shaktiName}</span>
            </div>

            <p className="literary-prose">{activeTreatise.sacredMythos}</p>

            {/* 3-Tier Shakti Architecture: Upari -> Adho -> Phala */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-[var(--border)] divide-y md:divide-y-0 md:divide-x divide-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="p-4 space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--brass)]">
                  1. Upari Shakti (Celestial Impulse)
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.upariShakti}
                </p>
              </div>
              <div className="p-4 space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--brass)]">
                  2. Adho Shakti (Earthly Grounding)
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.adhoShakti}
                </p>
              </div>
              <div className="p-4 space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage)]">
                  3. Cosmic Phala (Manifest Fruit)
                </div>
                <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                  {activeTreatise.shaktiPhala}
                </p>
              </div>
            </div>

            <blockquote className="border-l-2 border-l-[var(--brass)] pl-4 py-1 italic font-literary text-base text-[var(--text)]">
              {activeTreatise.taittiriyaBoon}
            </blockquote>
          </section>

          {/* SECTION II: DIRECTIONAL GAZE, LOST-OBJECT ORACLE & KUTA LEDGER */}
          <section className="space-y-5">
            <div className="border-b border-[var(--border)] pb-2">
              <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                II. Gaze (Mukha), Lost-Object Oracle (Lochana) &amp; Kuta Classification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-[var(--border)] p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--brass)]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{activeTreatise.mukhaGaze}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.mukhaConsequence}
                </p>
              </div>

              <div className="border border-[var(--border)] p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--brass)]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Nashta Prashna: {activeTreatise.lochanaEye}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.lostObjectVerdict}
                </p>
              </div>
            </div>

            {/* Compact Kuta Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-[var(--border)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] text-xs">
              {[
                ['Gana', activeTreatise.gana],
                ['Yoni Animal', activeTreatise.yoni],
                ['Ayurvedic Nadi', activeTreatise.nadi],
                ['Marital Rajju', activeTreatise.rajju],
                ['Purushartha', activeTreatise.purushartha],
                ['Tattva', activeTreatise.tattva],
              ].map(([k, v]) => (
                <div key={k} className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">{k}</div>
                  <div className="font-medium text-[var(--text)] mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION III: THE FOUR NAVAMSHA PADAS (3°20' QUANTA) */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between border-b border-[var(--border)] pb-2">
              <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                III. The Four Navamsha Padas (3°20′ Micro-Divisions)
              </h3>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                Sound Syllable (Nama-Akshara) &amp; D9 Harmonic Fruit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTreatise.padas.map((p) => (
                <div key={p.pada} className="border border-[var(--border)] p-4 space-y-2 bg-[var(--bg-elevated)]/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-serif text-lg font-semibold text-[var(--text)]">
                      Pada {p.pada} — {p.navamshaSign}
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 border border-[var(--border-strong)] text-[var(--brass)]">
                      {p.bijaSound}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
                    <span>{p.degreeRange}</span>
                    <span>•</span>
                    <span>D9 Lord: {p.navamshaRuler}</span>
                    {p.specialTag && (
                      <span className="px-1.5 py-0.5 obs-badge-brass font-semibold">
                        {p.specialTag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {p.expression}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION IV: WHAT HAPPENS IF AN ACTION IS PERFORMED IN THIS NAKSHATRA */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <div>
                <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                  IV. Action &amp; Consequence Matrix ("What Happens If...")
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Classical electional rulings when the Moon transits {activeTreatise.name} ({activeTreatise.natureExplanation})
                </p>
              </div>
              {onOpenActionSimulator && (
                <button
                  onClick={onOpenActionSimulator}
                  className="btn-editorial-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--brass)]" />
                  <span>Test Live Date in Simulator</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTreatise.actionMatrix.map((ac) => (
                <div key={ac.domain} className="border border-[var(--border)] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[var(--text)]">{ac.domain}</span>
                    <span className={`font-mono text-[11px] px-2 py-0.5 border font-semibold ${verdictStyle(ac.verdict)}`}>
                      {ac.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {ac.ifPerformed}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="border-l-2 border-l-[var(--sage)] pl-4 space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--sage)] font-semibold">
                  Sanctioned Undertakings (Shubha Karya)
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
                  {activeTreatise.auspiciousWorks.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="border-l-2 border-l-[var(--crimson)] pl-4 space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--crimson)] font-semibold">
                  Contraindicated Undertakings (Varjya Karya)
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
                  {activeTreatise.inauspiciousWorks.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION V: NATAL PORTRAITS, VOCATIONS & REMEDIAL UPAYA */}
          <section className="space-y-5 border-t border-[var(--border)] pt-6">
            <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
              V. Natal Portraits, Vocations &amp; Sacred Ecology
            </h3>

            <div className="space-y-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass)] mb-1">
                  Janma Chandra (Natal Moon in {activeTreatise.name})
                </div>
                <p className="literary-prose text-sm">{activeTreatise.moonPortrait}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Lagna (Ascendant Rising)
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {activeTreatise.ascendantPortrait}
                  </p>
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Natal Surya (Solar Expression)
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {activeTreatise.sunPortrait}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {activeTreatise.vocations.map((v) => (
                <span
                  key={v}
                  className="text-xs px-2.5 py-1 border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]"
                >
                  {v}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-[var(--border)] p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--crimson)]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Evolutionary Shadow Trap</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.shadowTrap}
                </p>
              </div>

              <div className="border border-[var(--border)] p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--sage)]">
                  <Trees className="w-3.5 h-3.5" />
                  <span>Aradhya Vriksha &amp; Living Upaya</span>
                </div>
                <p className="text-xs text-[var(--text)] font-medium">{activeTreatise.sacredTree}</p>
                <p className="font-mono text-[11px] text-[var(--brass)]">{activeTreatise.vedicMantra}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeTreatise.behavioralUpaya}
                </p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};
