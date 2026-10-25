import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Scale,
  Sparkles,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { CityLocation } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { getRecommendedHoraisForAction } from '../engines/panchangEngine';
import {
  ActionCategory,
  BEHAVIORAL_KARMA_VIPAKA,
  evaluateActionConsequence,
  LIFE_ACTIONS,
  scanUpcomingBestWindows,
} from '../data/karmaAndMuhurtaCodex';
import {
  KpiStatCard,
  ScoreTrendChart,
  SegmentedTabs,
  StatusBadge,
  SemanticTone,
} from './ui/DashboardPrimitives';
import { SacredFlowerIcon } from './ui/FloralAnimations';

interface Props {
  chart: NatalChartResult;
  location: CityLocation;
  initialActionId?: string;
  onInspectNakshatra?: (nakIdx: number) => void;
}

const CATEGORIES: ('All' | ActionCategory)[] = [
  'All',
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
  const [selectedCategory, setSelectedCategory] = useState<'All' | ActionCategory>('All');
  const [selectedActionId, setSelectedActionId] = useState<string>(initialActionId || 'SIGN_CONTRACT');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('10:30');
  const [detailTab, setDetailTab] = useState<'FACTORS' | 'WINDOWS' | 'PARIHARA'>('FACTORS');
  const [selectedKarmaPlanet, setSelectedKarmaPlanet] = useState<string>('Saturn');

  useEffect(() => {
    if (initialActionId) {
      setSelectedActionId(initialActionId);
      setLabTab('MUHURTA_ORACLE');
    }
  }, [initialActionId]);

  const filteredActions = useMemo(() => {
    if (selectedCategory === 'All') return LIFE_ACTIONS;
    return LIFE_ACTIONS.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

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

  const horizonTrendPoints = useMemo(() => {
    const [yr, mo, dy] = selectedDateStr.split('-').map((n) => parseInt(n, 10));
    const [hr, mn] = selectedTimeStr.split(':').map((n) => parseInt(n, 10));
    return Array.from({ length: 12 }).map((_, idx) => {
      const localUtcMs = Date.UTC(yr || 2026, (mo || 1) - 1, (dy || 1) + idx, hr || 10, mn || 30, 0);
      const dt = new Date(localUtcMs - location.timezoneOffsetHours * 3600000);
      const dayIso = new Date(Date.UTC(yr || 2026, (mo || 1) - 1, (dy || 1) + idx))
        .toISOString()
        .slice(0, 10);
      const ev = evaluateActionConsequence(
        selectedActionId,
        dt,
        location,
        moonPlanet.nakshatraIndex,
        natalMoonSignIdx
      );
      const shortDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        id: dayIso,
        label: idx === 0 ? shortDate : shortDate,
        sublabel: ev.panchang.nakshatra.name.slice(0, 5),
        value: ev.score,
      };
    });
  }, [
    selectedActionId,
    selectedDateStr,
    selectedTimeStr,
    location,
    moonPlanet.nakshatraIndex,
    natalMoonSignIdx,
  ]);

  const shiftDateByDays = (delta: number) => {
    const [yr, mo, dy] = selectedDateStr.split('-').map((n) => parseInt(n, 10));
    const d = new Date(Date.UTC(yr, mo - 1, dy + delta));
    setSelectedDateStr(d.toISOString().slice(0, 10));
  };

  const activeKarmaEntry =
    BEHAVIORAL_KARMA_VIPAKA.find((k) => k.planetId === selectedKarmaPlanet) ||
    BEHAVIORAL_KARMA_VIPAKA[0];
  const natalKarmaPlanet = chart.planets.find((p) => p.id === activeKarmaEntry.planetId);

  const readinessStatus: { tone: SemanticTone; label: string } =
    report.score >= 70
      ? { tone: 'optimal', label: 'Optimal Window' }
      : report.score >= 48
      ? { tone: 'mixed', label: 'Mixed / Caution' }
      : { tone: 'avoid', label: 'Postpone' };

  const factorTone = (status: string): { tone: SemanticTone; label: string } => {
    if (status === 'Positive') return { tone: 'optimal', label: 'Supportive' };
    if (status === 'Caution') return { tone: 'mixed', label: 'Caution' };
    if (status === 'Critical') return { tone: 'avoid', label: 'Avoid' };
    return { tone: 'neutral', label: 'Neutral' };
  };

  return (
    <div className="space-y-6">
      {/* ==================== PAGE HEADER & MODE SWITCHER ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Action Timing &amp; Consequence Planner
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Evaluate 20 major life decisions against Muhurta electional rules, personal Tarabala, and
            planetary conduct.
          </p>
        </div>

        <SegmentedTabs
          ariaLabel="Action planner mode"
          value={labTab}
          onChange={setLabTab}
          items={[
            { id: 'MUHURTA_ORACLE', label: 'Action Timing', count: 20 },
            { id: 'BEHAVIORAL_KARMA', label: 'Planetary Karma-Vipaka', count: 9 },
          ]}
        />
      </div>

      {/* ==================== MODE 1: MUHURTA DECISION DASHBOARD ==================== */}
      {labTab === 'MUHURTA_ORACLE' && (
        <div className="space-y-6">
          {/* Global Control Bar (Action Filter + Date/Time Picker) */}
          <div className="obs-card p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const active = cat === selectedCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        if (cat !== 'All') {
                          const firstInCat = LIFE_ACTIONS.find((a) => a.category === cat);
                          if (firstInCat && report.action.category !== cat) {
                            setSelectedActionId(firstInCat.id);
                          }
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        active
                          ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-semibold border border-[var(--accent)]/30'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-[var(--text-muted)] font-mono">
                Location: {location.name}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1 border-t border-[var(--border)]">
              {/* Action Selector */}
              <div className="lg:col-span-6 flex items-center gap-2.5">
                <label
                  htmlFor="ocean-action-select"
                  className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"
                >
                  Action:
                </label>
                <select
                  id="ocean-action-select"
                  value={selectedActionId}
                  onChange={(e) => setSelectedActionId(e.target.value)}
                  className="w-full obs-input font-medium text-sm"
                >
                  {filteredActions.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.title} — ({act.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Controls */}
              <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2">
                <input
                  type="date"
                  aria-label="Evaluation date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="obs-input font-mono text-xs w-[142px]"
                />
                <input
                  type="time"
                  aria-label="Evaluation time"
                  value={selectedTimeStr}
                  onChange={(e) => setSelectedTimeStr(e.target.value)}
                  className="obs-input font-mono text-xs w-[108px]"
                />
                <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-0.5">
                  <button
                    type="button"
                    onClick={() => shiftDateByDays(-1)}
                    aria-label="Previous day"
                    className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateStr(new Date().toISOString().slice(0, 10))}
                    className="px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftDateByDays(1)}
                    aria-label="Next day"
                    className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] inline-flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 1: 4 CONTEXTUAL KPI STAT CARDS (Inverted Pyramid Top) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiStatCard
              label="Action Readiness Score"
              value={`${report.score}/100`}
              benchmarkText={
                report.score >= 70
                  ? `+${report.score - 70} pts vs 70 safe benchmark`
                  : `${70 - report.score} pts below 70 benchmark`
              }
              status={readinessStatus}
              icon={<Activity className="w-4 h-4" />}
            />

            <KpiStatCard
              label="Best Date (Next 12 Days)"
              value={bestWindows[0]?.dateStr || selectedDateStr}
              subvalue={bestWindows[0] ? `${bestWindows[0].score}/100` : undefined}
              benchmarkText={
                bestWindows[0]
                  ? `${bestWindows[0].weekdayName} • ${bestWindows[0].nakshatraName}`
                  : 'Current horizon'
              }
              status={{ tone: 'optimal', label: 'Peak Window' }}
              icon={<Calendar className="w-4 h-4" />}
              actionLabel={
                bestWindows[0] && bestWindows[0].dateStr !== selectedDateStr
                  ? 'Select peak date'
                  : undefined
              }
              onAction={
                bestWindows[0] ? () => setSelectedDateStr(bestWindows[0].dateStr) : undefined
              }
            />

            <KpiStatCard
              label="Transit Nakshatra"
              value={report.panchang.nakshatra.name}
              subvalue={`Pada ${report.panchang.nakshatra.pada}`}
              benchmarkText={`${report.panchang.nakshatra.hoursRemaining} remaining`}
              status={{
                tone: 'info',
                label: report.panchang.nakshatra.natureGroup.split(' ')[0],
              }}
              icon={<Sparkles className="w-4 h-4" />}
              actionLabel={onInspectNakshatra ? 'Inspect Nakshatra' : undefined}
              onAction={
                onInspectNakshatra
                  ? () => onInspectNakshatra(report.panchang.nakshatra.zeroIndex)
                  : undefined
              }
            />

            <KpiStatCard
              label="Personal Tarabala"
              value={`Tara #${report.panchang.personalTarabala.taraNumber}`}
              subvalue={report.panchang.personalTarabala.taraName.split(' ')[0]}
              benchmarkText={`Moon in House ${report.panchang.personalTarabala.chandrabalaHouse}`}
              status={{
                tone: report.panchang.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                label: report.panchang.personalTarabala.isAuspicious
                  ? 'Supportive'
                  : 'Needs Parihara',
              }}
              icon={<Compass className="w-4 h-4" />}
            />
          </div>

          {/* ROW 2: VISUAL FORECAST CHART + DECISION SUMMARY CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* 12-Day Score Trend Line Chart */}
            <div className="lg:col-span-7 obs-card p-5 flex flex-col justify-between space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">
                    12-Day Electional Score Horizon — {report.action.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Click any date point to inspect its exact Panchang, Tithi, and Tarabala factors
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {report.panchang.bikramSambat.formatted}
                </span>
              </div>

              <ScoreTrendChart
                points={horizonTrendPoints}
                benchmarkValue={70}
                benchmarkLabel="70+ Optimal window"
                selectedId={selectedDateStr}
                onSelectPoint={(dateIso) => setSelectedDateStr(dateIso)}
                ariaLabel={`12-day timing favorability trend for ${report.action.title}`}
              />
            </div>

            {/* Decision Verdict & Consequence Summary */}
            <div className="lg:col-span-5 obs-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone={readinessStatus.tone} label={report.verdictTier} size="md" />
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {report.action.sanskritTitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text)] leading-snug">
                  {report.action.shortPrompt}
                </h3>

                <div className="obs-panel p-4 space-y-1.5">
                  <div className="text-sm font-bold text-[var(--text)]">
                    What Happens If You Do This Today
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {report.whatHappensIfDoneNow}
                  </p>
                </div>

                <div className="obs-panel p-4 space-y-1.5">
                  <div className="text-sm font-bold text-[var(--sage)]">
                    Practical Timing Advice
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {report.whatHappensIfDelayed}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Source: {report.action.classicalSource}</span>
                <span>{report.panchang.vara.name}</span>
              </div>
            </div>
          </div>

          {/* RECOMMENDED HORAI PLANETARY HOURS FOR THIS ACTION */}
          {(() => {
            const rec = getRecommendedHoraisForAction(report.action.id);
            const matchingDayHorai = report.panchang.dayHorai.filter(
              (h) => rec.lords.includes(h.lord) && !h.kalamConflictNote
            );
            const slotsToShow =
              matchingDayHorai.length > 0
                ? matchingDayHorai
                : report.panchang.dayHorai.filter((h) => rec.lords.includes(h.lord));

            return (
              <div className="obs-card floral-banner-glow p-5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">
                      Best Horai Planetary Hours on {selectedDateStr} for {report.action.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{rec.rationale}</p>
                  </div>
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                    Click a Horai to set exact clock time
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {slotsToShow.slice(0, 4).map((slot) => (
                    <button
                      key={slot.slotNumber}
                      type="button"
                      onClick={() => setSelectedTimeStr(slot.startTime)}
                      className={`text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-2.5 bg-[var(--surface)] ${
                        selectedTimeStr === slot.startTime
                          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <SacredFlowerIcon
                          variety={slot.sacredFlower.variety}
                          primaryHex={slot.sacredFlower.primaryHex}
                          secondaryHex={slot.sacredFlower.secondaryHex}
                          size={26}
                        />
                        <div>
                          <div className="text-sm font-bold text-[var(--text)]">
                            {slot.horaiName}
                          </div>
                          <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                            {slot.startTime} – {slot.endTime}
                          </div>
                        </div>
                      </div>
                      <StatusBadge tone={slot.tone} label={slot.isActiveNow ? 'LIVE' : 'Pick'} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ROW 3: PROGRESSIVE DISCLOSURE DETAIL TABS */}
          <div className="obs-card p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <SegmentedTabs
                ariaLabel="Electional detail sections"
                value={detailTab}
                onChange={setDetailTab}
                items={[
                  {
                    id: 'FACTORS',
                    label: 'Rule-by-Rule Breakdown',
                    count: report.factors.length,
                  },
                  {
                    id: 'WINDOWS',
                    label: 'Top Upcoming Dates',
                    count: bestWindows.length,
                  },
                  {
                    id: 'PARIHARA',
                    label: 'Classical Principle & Remedies',
                    count: report.pariharaRemedies.length,
                  },
                ]}
              />

              <span className="text-xs text-[var(--text-muted)] font-mono">
                Evaluated at {selectedDateStr} {selectedTimeStr} ({location.name})
              </span>
            </div>

            {detailTab === 'FACTORS' && (
              <div className="divide-y divide-[var(--border)]">
                {report.factors.map((f, idx) => {
                  const st = factorTone(f.status);
                  return (
                    <div
                      key={idx}
                      className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
                    >
                      <div className="md:col-span-3 flex items-center gap-2.5">
                        <StatusBadge tone={st.tone} label={st.label} />
                        <span className="text-sm font-semibold text-[var(--text)]">{f.factor}</span>
                      </div>
                      <div className="md:col-span-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                        {f.detail}
                      </div>
                      <div className="md:col-span-3 md:text-right text-xs font-mono text-[var(--text-muted)]">
                        {f.ruleCited}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {detailTab === 'WINDOWS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {bestWindows.map((win) => {
                  const active = selectedDateStr === win.dateStr;
                  return (
                    <button
                      key={win.dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(win.dateStr)}
                      className={`p-4 rounded-lg text-left border transition ${
                        active
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                          : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--text)]">
                          {win.dateStr}
                        </span>
                        <StatusBadge
                          tone={win.score >= 70 ? 'optimal' : 'mixed'}
                          label={`${win.score}/100`}
                        />
                      </div>
                      <div className="text-sm font-bold text-[var(--text)] mt-2">
                        {win.weekdayName} • {win.nakshatraName}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {win.tithiName}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--accent)] mt-2.5 pt-2 border-t border-[var(--border)]">
                        Best window: {win.bestWindowTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {detailTab === 'PARIHARA' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="obs-panel p-4 space-y-2">
                  <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[var(--accent)]" />
                    <span>Classical Electional Rule ({report.action.classicalSource})</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {report.action.baseRuleSummary}
                  </p>
                </div>

                <div className="obs-panel p-4 space-y-2.5">
                  <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--sage)]" />
                    <span>Parihara Protocol (If Action Cannot Be Delayed)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {report.pariharaRemedies.map((rem, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0 mt-0.5" />
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODE 2: BEHAVIORAL KARMA-VIPAKA ==================== */}
      {labTab === 'BEHAVIORAL_KARMA' && (
        <div className="space-y-6">
          {/* 9-Graha Clean Selector Bar */}
          <div className="obs-card p-4 space-y-3">
            <div className="text-xs font-semibold text-[var(--text-secondary)]">
              Select Planetary Force (Navagraha)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {BEHAVIORAL_KARMA_VIPAKA.map((item) => {
                const pChart = chart.planets.find((p) => p.id === item.planetId);
                const isSelected = item.planetId === selectedKarmaPlanet;
                return (
                  <button
                    key={item.planetId}
                    type="button"
                    onClick={() => setSelectedKarmaPlanet(item.planetId)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[var(--text)] truncate">
                      {pChart?.symbol} {item.planetName.split(' ')[0]}
                    </div>
                    {pChart && (
                      <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                        H{pChart.house} • {pChart.signName.slice(0, 3)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Natal Context KPIs for Selected Planet */}
          {natalKarmaPlanet && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiStatCard
                label="Natal Sign & Longitude"
                value={`${natalKarmaPlanet.signSymbol} ${natalKarmaPlanet.signName}`}
                benchmarkText={natalKarmaPlanet.formattedDMS}
                status={{ tone: 'info', label: activeKarmaEntry.sanskritTitle }}
              />
              <KpiStatCard
                label="Natal Bhava (House)"
                value={`House ${natalKarmaPlanet.house}`}
                benchmarkText={natalKarmaPlanet.isRetrograde ? 'Retrograde (Vakri)' : 'Direct motion'}
                status={{
                  tone: [1, 4, 5, 7, 9, 10, 11].includes(natalKarmaPlanet.house)
                    ? 'favorable'
                    : 'neutral',
                  label: [1, 4, 7, 10].includes(natalKarmaPlanet.house)
                    ? 'Kendra'
                    : [5, 9].includes(natalKarmaPlanet.house)
                    ? 'Trikona'
                    : 'Bhava',
                }}
              />
              <KpiStatCard
                label="Natal Nakshatra"
                value={natalKarmaPlanet.nakshatraName}
                subvalue={`Pada ${natalKarmaPlanet.nakshatraPada}`}
                benchmarkText={`Lord: ${natalKarmaPlanet.nakshatraLord}`}
                actionLabel={onInspectNakshatra ? 'View Nakshatra' : undefined}
                onAction={
                  onInspectNakshatra
                    ? () => onInspectNakshatra(natalKarmaPlanet.nakshatraIndex)
                    : undefined
                }
              />
              <KpiStatCard
                label="Essential Dignity"
                value={natalKarmaPlanet.dignity}
                benchmarkText={`Speed: ${natalKarmaPlanet.speedDegPerDay.toFixed(2)}°/day`}
                status={{
                  tone:
                    natalKarmaPlanet.dignity === 'Exalted' || natalKarmaPlanet.dignity === 'Own Sign'
                      ? 'optimal'
                      : natalKarmaPlanet.dignity === 'Debilitated'
                      ? 'avoid'
                      : 'neutral',
                  label: natalKarmaPlanet.dignity,
                }}
              />
            </div>
          )}

          {/* 3-Column Cause, Effect & Daily Alignment */}
          <div className="obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4 space-y-1">
              <h2 className="text-xl font-bold text-[var(--text)]">
                {activeKarmaEntry.planetName} — Behavioral Cause &amp; Consequence
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                <strong>Governed Domains:</strong> {activeKarmaEntry.governedDomains}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1: Conduct That Strengthens */}
              <div className="obs-panel p-4 space-y-3 border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--sage)]">
                    Conduct That Strengthens
                  </span>
                  <StatusBadge tone="optimal" label="Sattvic Alignment" />
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifAlignedBehavior}
                </p>
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    Expected Positive Outcomes
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {activeKarmaEntry.alignedFruits.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 2: Conduct That Afflicts */}
              <div className="obs-panel p-4 space-y-3 border-rose-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--crimson)]">
                    Conduct That Afflicts
                  </span>
                  <StatusBadge tone="avoid" label="Friction Pattern" />
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifDishonoredBehavior}
                </p>
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    Early Warning Signs
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {activeKarmaEntry.consequenceSymptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-[var(--crimson)] shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 3: Practical Daily Habit */}
              <div className="obs-panel p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent)]">
                      Practical Daily Habit (Upaya)
                    </span>
                    <StatusBadge tone="info" label="Daily Practice" />
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed">
                    {activeKarmaEntry.livingDharmaPractice}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  Grounded in Brihat Parashara Hora Shastra behavioral remediation principles.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
