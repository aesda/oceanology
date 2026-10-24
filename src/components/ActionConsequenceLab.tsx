import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { CityLocation } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import {
  ActionCategory,
  BEHAVIORAL_KARMA_VIPAKA,
  evaluateActionConsequence,
  LIFE_ACTIONS,
  scanUpcomingBestWindows,
} from '../data/karmaAndMuhurtaCodex';

interface Props {
  chart: NatalChartResult;
  location: CityLocation;
  initialActionId?: string;
  onInspectNakshatra?: (nakIdx: number) => void;
}

const CATEGORIES: ActionCategory[] = [
  'Wealth & Debt',
  'Enterprise & Law',
  'Home & Construction',
  'Sacred Rites & Study',
  'Body, Surgery & Grooming',
  'Travel & Closure',
];

export const ActionConsequenceLab: React.FC<Props> = ({
  chart,
  location,
  initialActionId,
  onInspectNakshatra,
}) => {
  const [labTab, setLabTab] = useState<'MUHURTA_ORACLE' | 'BEHAVIORAL_KARMA'>('MUHURTA_ORACLE');
  const [selectedActionId, setSelectedActionId] = useState<string>(initialActionId || 'LEND_MONEY');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('10:30');
  const [selectedKarmaPlanet, setSelectedKarmaPlanet] = useState<string>('Saturn');

  useEffect(() => {
    if (initialActionId) {
      setSelectedActionId(initialActionId);
      setLabTab('MUHURTA_ORACLE');
    }
  }, [initialActionId]);

  const moonPlanet = chart.planets.find((p) => p.id === 'Moon') || chart.planets[0];
  const natalMoonSignIdx = Math.floor(moonPlanet.siderealLongitude / 30);

  const probeDate = useMemo(() => {
    const [yr, mo, dy] = selectedDateStr.split('-').map((n) => parseInt(n, 10));
    const [hr, mn] = selectedTimeStr.split(':').map((n) => parseInt(n, 10));
    const localUtcMs = Date.UTC(yr || 2026, (mo || 1) - 1, dy || 1, hr || 10, mn || 30, 0);
    return new Date(localUtcMs - location.timezoneOffsetHours * 3600000);
  }, [selectedDateStr, selectedTimeStr, location.timezoneOffsetHours]);

  const report = useMemo(
    () =>
      evaluateActionConsequence(
        selectedActionId,
        probeDate,
        location,
        moonPlanet.nakshatraIndex,
        natalMoonSignIdx
      ),
    [selectedActionId, probeDate, location, moonPlanet.nakshatraIndex, natalMoonSignIdx]
  );

  const bestWindows = useMemo(
    () =>
      scanUpcomingBestWindows(
        selectedActionId,
        probeDate,
        location,
        moonPlanet.nakshatraIndex,
        natalMoonSignIdx,
        12
      ),
    [selectedActionId, probeDate, location, moonPlanet.nakshatraIndex, natalMoonSignIdx]
  );

  const shiftDateByDays = (delta: number) => {
    const [yr, mo, dy] = selectedDateStr.split('-').map((n) => parseInt(n, 10));
    const d = new Date(Date.UTC(yr, mo - 1, dy + delta));
    setSelectedDateStr(d.toISOString().slice(0, 10));
  };

  const activeKarmaEntry =
    BEHAVIORAL_KARMA_VIPAKA.find((k) => k.planetId === selectedKarmaPlanet) ||
    BEHAVIORAL_KARMA_VIPAKA[0];
  const natalKarmaPlanet = chart.planets.find((p) => p.id === activeKarmaEntry.planetId);

  const tierTone = (tier: string) => {
    if (tier.includes('Supreme')) return 'text-[var(--sage)] border-[var(--sage)] bg-[var(--sage-bg)]';
    if (tier.includes('Auspicious')) return 'text-[var(--brass)] border-[var(--brass)] bg-[var(--brass-bg)]';
    if (tier.includes('Contraindicated')) return 'text-[var(--crimson)] border-[var(--crimson)] bg-[var(--crimson-bg)]';
    return 'text-[var(--text)] border-[var(--border-strong)] bg-[var(--surface-muted)]';
  };

  return (
    <div className="space-y-10">
      {/* Masthead */}
      <section className="border-b border-[var(--border)] pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="editorial-eyebrow">
              Muhurta Chintamani • Brihat Samhita • BPHS Karma-Vipaka
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[var(--text)] leading-[1.08]">
              Action, Timing &amp; Consequence Simulator
            </h1>
            <p className="literary-prose">
              In classical Jyotish, fate is never sealed in a vacuum: every earthly action interacts with two laws—<strong>Muhurta</strong> (what happens when an undertaking is initiated under a specific lunar star, tithi, weekday, karana, and direction) and <strong>Karma-Vipaka</strong> (what happens when daily ethical conduct nourishes or starves a natal Graha).
            </p>
          </div>

          {/* Chapter Switcher */}
          <div className="flex border border-[var(--border-strong)] bg-[var(--surface)]">
            <button
              onClick={() => setLabTab('MUHURTA_ORACLE')}
              className={`px-4 py-2.5 text-xs font-semibold transition flex items-center gap-2 ${
                labTab === 'MUHURTA_ORACLE'
                  ? 'bg-[var(--text)] text-[var(--surface)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>I. Electional "What Happens If..." (20 Actions)</span>
            </button>
            <button
              onClick={() => setLabTab('BEHAVIORAL_KARMA')}
              className={`px-4 py-2.5 text-xs font-semibold transition flex items-center gap-2 border-l border-[var(--border-strong)] ${
                labTab === 'BEHAVIORAL_KARMA'
                  ? 'bg-[var(--text)] text-[var(--surface)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>II. Behavioral Karma-Vipaka (9 Grahas)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER I: MUHURTA CONSEQUENCE SIMULATOR ==================== */}
      {labTab === 'MUHURTA_ORACLE' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column (4 cols): 20 Classical Life Actions Directory */}
          <aside className="xl:col-span-4 space-y-5">
            {/* Date & Time Bar */}
            <div className="obs-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass)]">
                  Test Moment &amp; Horizon
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {location.name}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="col-span-7 obs-input font-mono text-xs"
                />
                <input
                  type="time"
                  value={selectedTimeStr}
                  onChange={(e) => setSelectedTimeStr(e.target.value)}
                  className="col-span-5 obs-input font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => shiftDateByDays(-1)}
                  className="flex-1 py-1.5 border border-[var(--border)] hover:border-[var(--brass)] flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Day
                </button>
                <button
                  onClick={() => setSelectedDateStr(new Date().toISOString().slice(0, 10))}
                  className="px-3 py-1.5 border border-[var(--border)] hover:border-[var(--brass)] font-mono text-[11px]"
                >
                  Today
                </button>
                <button
                  onClick={() => shiftDateByDays(1)}
                  className="flex-1 py-1.5 border border-[var(--border)] hover:border-[var(--brass)] flex items-center justify-center gap-1"
                >
                  Next Day <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Grouped 20 Actions */}
            <div className="obs-card p-4 space-y-4 max-h-[680px] overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] pb-1">
                    {cat}
                  </div>
                  {LIFE_ACTIONS.filter((a) => a.category === cat).map((act) => {
                    const active = act.id === selectedActionId;
                    return (
                      <button
                        key={act.id}
                        onClick={() => setSelectedActionId(act.id)}
                        className={`w-full text-left px-3 py-2 text-xs transition border-l-2 ${
                          active
                            ? 'border-l-[var(--brass)] bg-[var(--brass-bg)] font-semibold text-[var(--text)]'
                            : 'border-l-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]/60 hover:text-[var(--text)]'
                        }`}
                      >
                        <div>{act.title}</div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                          {act.sanskritTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>

          {/* Right Column (8 cols): Live Shastra Evaluation Sheet */}
          <article className="xl:col-span-8 folio-sheet p-6 sm:p-10 space-y-8">
            {/* Header Verdict */}
            <header className="border-b border-[var(--border)] pb-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="editorial-eyebrow">
                    {report.action.category} • {report.action.sanskritTitle}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[var(--text)]">
                    {report.action.shortPrompt}
                  </h2>
                  <p className="font-mono text-xs text-[var(--text-muted)]">
                    Evaluated for {report.panchang.dateStr} ({report.panchang.bikramSambat.formatted}) •{' '}
                    {report.panchang.vara.name} • Moon in{' '}
                    <button
                      onClick={() => onInspectNakshatra?.(report.panchang.nakshatra.zeroIndex)}
                      className="underline text-[var(--brass)] hover:opacity-80 inline-flex items-center gap-0.5"
                    >
                      {report.panchang.nakshatra.name} P{report.panchang.nakshatra.pada}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>

                {/* Architectural Score Box */}
                <div className={`border px-5 py-4 text-center min-w-[160px] ${tierTone(report.verdictTier)}`}>
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                    Shastra Index
                  </div>
                  <div className="text-4xl font-serif font-bold tabular-nums my-0.5">
                    {report.score}
                    <span className="text-base font-normal opacity-70">/100</span>
                  </div>
                  <div className="font-mono text-[11px] font-semibold">
                    {report.verdictTier}
                  </div>
                </div>
              </div>
            </header>

            {/* Primary Consequence Narrative */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[var(--border)] p-5 bg-[var(--bg-elevated)] space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass)] font-semibold">
                  If Performed Under This Sky
                </div>
                <p className="literary-prose text-base text-[var(--text)]">
                  {report.whatHappensIfDoneNow}
                </p>
              </div>

              <div className="border border-[var(--border)] p-5 space-y-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Classical Treatise Principle ({report.action.classicalSource})
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                    {report.action.baseRuleSummary}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--border)]">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--sage)] font-semibold">
                    Strategic Timing Counsel
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                    {report.whatHappensIfDelayed}
                  </p>
                </div>
              </div>
            </section>

            {/* Itemized Panchang & Personal Factor Ledger */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
                <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                  Itemized Shastra Factor Ledger
                </h3>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {report.factors.length} Celestial &amp; Personal Rules Checked
                </span>
              </div>

              <div className="divide-y divide-[var(--border)] border border-[var(--border)]">
                {report.factors.map((f, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">
                      {f.status === 'Positive' && <CheckCircle2 className="w-4 h-4 text-[var(--sage)]" />}
                      {f.status === 'Neutral' && <Compass className="w-4 h-4 text-[var(--text-muted)]" />}
                      {f.status === 'Caution' && <AlertTriangle className="w-4 h-4 text-[var(--brass)]" />}
                      {f.status === 'Critical' && <XCircle className="w-4 h-4 text-[var(--crimson)]" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-[var(--text)]">{f.factor}</span>
                        <span className="font-mono text-[11px] text-[var(--brass)]">{f.ruleCited}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Classical Pariharas */}
            <section className="border-l-2 border-l-[var(--brass)] pl-5 space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass)] font-semibold">
                Classical Parihara Protocol (If Action Must Proceed Today)
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
                {report.pariharaRemedies.map((rem, i) => (
                  <li key={i}>{rem}</li>
                ))}
              </ul>
            </section>

            {/* 12-Day Upcoming Best Windows Scanner */}
            <section className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-[var(--text)]">
                    Best Upcoming Windows (Next 12 Days)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Click any candidate date below to load its full Panchang &amp; Tarabala breakdown
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-[var(--brass)]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {bestWindows.map((win) => (
                  <button
                    key={win.dateStr}
                    onClick={() => setSelectedDateStr(win.dateStr)}
                    className={`p-4 text-left border transition hover:border-[var(--brass)] ${
                      selectedDateStr === win.dateStr
                        ? 'border-[var(--brass)] bg-[var(--brass-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-semibold text-[var(--text)]">{win.dateStr}</span>
                      <span className="text-[var(--sage)] font-bold">{win.score}/100</span>
                    </div>
                    <div className="font-serif text-lg font-semibold text-[var(--text)] mt-1">
                      {win.weekdayName} • {win.nakshatraName}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                      {win.tithiName}
                    </div>
                    <div className="text-[11px] text-[var(--brass)] font-mono mt-2 pt-2 border-t border-[var(--border)]">
                      Peak: {win.bestWindowTime}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </article>
        </div>
      )}

      {/* ==================== CHAPTER II: BEHAVIORAL KARMA-VIPAKA ==================== */}
      {labTab === 'BEHAVIORAL_KARMA' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Planet Selector */}
          <div className="lg:col-span-4 obs-card divide-y divide-[var(--border)]">
            <div className="p-4 font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              Select Navagraha Force
            </div>
            {BEHAVIORAL_KARMA_VIPAKA.map((item) => {
              const pChart = chart.planets.find((p) => p.id === item.planetId);
              const isSelected = item.planetId === selectedKarmaPlanet;
              return (
                <button
                  key={item.planetId}
                  onClick={() => setSelectedKarmaPlanet(item.planetId)}
                  className={`w-full p-4 text-left flex items-center justify-between transition ${
                    isSelected ? 'bg-[var(--brass-bg)]' : 'hover:bg-[var(--surface-muted)]/60'
                  }`}
                >
                  <div>
                    <div className="font-serif text-lg font-semibold text-[var(--text)]">
                      {pChart?.symbol} {item.planetName}
                    </div>
                    {pChart && (
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">
                        Natal: {pChart.signName} • House {pChart.house} ({pChart.dignity})
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--brass)]" />
                </button>
              );
            })}
          </div>

          {/* Behavioral Cause-Effect Treatise */}
          <article className="lg:col-span-8 folio-sheet p-6 sm:p-10 space-y-8">
            <header className="border-b border-[var(--border)] pb-6 space-y-2">
              <div className="editorial-eyebrow">{activeKarmaEntry.sanskritTitle}</div>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[var(--text)]">
                {activeKarmaEntry.planetName}: Behavioral Cause &amp; Ripened Consequence
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                <strong>Governed Significations:</strong> {activeKarmaEntry.governedDomains}
              </p>
              {natalKarmaPlanet && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] font-mono text-xs text-[var(--brass)]">
                  In Your Natal Chart: {natalKarmaPlanet.symbol} {natalKarmaPlanet.name} stands in{' '}
                  {natalKarmaPlanet.signName} ({natalKarmaPlanet.formattedDMS}), House {natalKarmaPlanet.house},{' '}
                  Nakshatra {natalKarmaPlanet.nakshatraName} Pada {natalKarmaPlanet.nakshatraPada} — Dignity:{' '}
                  {natalKarmaPlanet.dignity}
                </div>
              )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Affliction Path */}
              <div className="border border-[var(--crimson)]/35 bg-[var(--crimson-bg)]/40 p-5 space-y-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--crimson)] font-semibold">
                  What Happens When Dishonored in Daily Conduct
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifDishonoredBehavior}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[var(--crimson)]/20">
                  <div className="font-mono text-[10px] uppercase text-[var(--crimson)]">
                    Ripened Warning Symptoms:
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
                    {activeKarmaEntry.consequenceSymptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Alignment Path */}
              <div className="border border-[var(--sage)]/35 bg-[var(--sage-bg)]/40 p-5 space-y-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--sage)] font-semibold">
                  What Happens When Honored Through Sattvic Action
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifAlignedBehavior}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[var(--sage)]/20">
                  <div className="font-mono text-[10px] uppercase text-[var(--sage)]">
                    Ripened Dharmic Fruits:
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
                    {activeKarmaEntry.alignedFruits.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-l-[var(--brass)] pl-5 py-1 space-y-1">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass)] font-semibold">
                Non-Superstitious Daily Practice (Living Upaya)
              </div>
              <p className="literary-prose text-base text-[var(--text)]">
                {activeKarmaEntry.livingDharmaPractice}
              </p>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
