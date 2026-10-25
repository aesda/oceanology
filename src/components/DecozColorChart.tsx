import React, { useState } from 'react';
import { Hash, Sparkles, Calendar, Activity } from 'lucide-react';
import {
  DECOZ_COLORS,
  DecozYearCell,
  NumerologyReport,
  reduceNumber,
} from '../engines/numerologyEngine';
import { NumerologySystem } from '../types/oceanology';
import { CHEIRO_COMPOUND_MEANINGS } from '../data/classicalCompendium';
import { KpiStatCard, SegmentedTabs, StatusBadge, WorkspacePageHeader } from './ui/DashboardPrimitives';

interface Props {
  report: NumerologyReport;
  system: NumerologySystem;
  onSystemChange: (sys: NumerologySystem) => void;
}

type NumSubView = 'CORE_CHEIRO' | 'COLORCHART' | 'PROPORTIONAL_TUNER';

export const DecozColorChart: React.FC<Props> = ({ report, system, onSystemChange }) => {
  const [subView, setSubView] = useState<NumSubView>('CORE_CHEIRO');
  const [selectedCell, setSelectedCell] = useState<DecozYearCell>(
    report.colorChartYears.find((c) => c.calendarYear === new Date().getFullYear()) ||
      report.colorChartYears[10] ||
      report.colorChartYears[0]
  );
  const [sandboxName, setSandboxName] = useState(report.currentNameUsed);

  const chaldeanTable: Record<string, number> = {
    A: 1,
    I: 1,
    J: 1,
    Q: 1,
    Y: 1,
    B: 2,
    K: 2,
    R: 2,
    C: 3,
    G: 3,
    L: 3,
    S: 3,
    D: 4,
    M: 4,
    T: 4,
    E: 5,
    H: 5,
    N: 5,
    X: 5,
    U: 6,
    V: 6,
    W: 6,
    O: 7,
    Z: 7,
    F: 8,
    P: 8,
  };

  const sandboxSum = sandboxName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .reduce((acc, ch) => {
      if (system === 'CHALDEAN') {
        return acc + (chaldeanTable[ch] || 1);
      }
      const code = ch.charCodeAt(0) - 64;
      return acc + ((code - 1) % 9) + 1;
    }, 0);
  const sandboxReduced = reduceNumber(sandboxSum || 1, true);
  const sandboxCheiro =
    CHEIRO_COMPOUND_MEANINGS[sandboxReduced.compound] ||
    CHEIRO_COMPOUND_MEANINGS[sandboxReduced.final];

  const coreCards = [
    { label: 'Life Path Number', sub: 'Primary Evolutionary Trajectory', val: report.lifePath },
    { label: 'Expression (Destiny)', sub: 'Full Birth Name Potential', val: report.expression },
    { label: "Heart's Desire (Soul Urge)", sub: 'Inner Vowel Motivation', val: report.heartsDesire },
    { label: 'Personality Vibration', sub: 'Outer Consonant Persona', val: report.personality },
    { label: 'Maturity Number', sub: 'Second-Half Life Synthesis', val: report.maturity },
    { label: 'Birth Day Number', sub: 'Innate Sub-Path Talent', val: report.birthDay },
  ];

  return (
    <div className="space-y-6">
      {/* ==================== CLEAN HEADER & SYSTEM SWITCHER ==================== */}
      <WorkspacePageHeader
        title="Numerology & 25-Year ColorChart"
        subtitle={
          <>
            Birth Name: <strong>{report.fullNameUsed}</strong> • Active Name:{' '}
            <strong>{report.currentNameUsed}</strong>
          </>
        }
        actions={
          <SegmentedTabs
            ariaLabel="Numerology calculation system"
            value={system}
            onChange={onSystemChange}
            items={[
              { id: 'PYTHAGOREAN', label: 'Pythagorean (Decoz)' },
              { id: 'CHALDEAN', label: 'Chaldean (Cheiro)' },
            ]}
          />
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL KPI STAT CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label="Life Path Number"
          value={report.lifePath.final}
          subvalue={`(${report.lifePath.trail})`}
          benchmarkText="Core life direction"
          status={{ tone: 'info', label: system }}
          icon={<Hash className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Expression (Destiny)"
          value={report.expression.final}
          subvalue={`(${report.expression.trail})`}
          benchmarkText={`Soul Urge: ${report.heartsDesire.final}`}
          status={{ tone: 'favorable', label: 'Full Name' }}
          icon={<Sparkles className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Current Personal Year"
          value={`Year ${report.personalYear.final}`}
          benchmarkText={DECOZ_COLORS[report.personalYear.singleDigit]?.keyword || '9-Year Cycle'}
          status={{ tone: 'optimal', label: `${new Date().getFullYear()} Cycle` }}
          icon={<Calendar className="w-4 h-4" />}
          actionLabel="Open 25-year matrix"
          onAction={() => setSubView('COLORCHART')}
        />

        <KpiStatCard
          label="Personal Month & Day"
          value={`M${report.personalMonth.singleDigit} • D${report.personalDay.singleDigit}`}
          benchmarkText={
            report.karmicLessons.length > 0
              ? `Missing digits: ${report.karmicLessons.join(', ')}`
              : 'All 9 digits present'
          }
          status={{
            tone: report.karmicLessons.length === 0 ? 'optimal' : 'neutral',
            label: `Maturity #${report.maturity.final}`,
          }}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* ==================== PROGRESSIVE DISCLOSURE SUB-VIEWS ==================== */}
      <div className="obs-card p-5 space-y-5">
        <div className="border-b border-[var(--border)] pb-4 flex flex-wrap items-center justify-between gap-3">
          <SegmentedTabs
            ariaLabel="Numerology sections"
            value={subView}
            onChange={setSubView}
            items={[
              { id: 'CORE_CHEIRO', label: 'Core Numbers & Compounds', count: 6 },
              {
                id: 'COLORCHART',
                label: '25-Year ColorChart Matrix',
                count: report.colorChartYears.length,
              },
              { id: 'PROPORTIONAL_TUNER', label: '1–9 Dominance & Name Tuner' },
            ]}
          />
        </div>

        {/* SUB-VIEW 1: CORE NUMBERS & CHEIRO COMPOUND LORE */}
        {subView === 'CORE_CHEIRO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreCards.map((c) => {
              const colorInfo =
                DECOZ_COLORS[c.val.final] || DECOZ_COLORS[c.val.singleDigit] || DECOZ_COLORS[1];
              const cheiroCompound =
                CHEIRO_COMPOUND_MEANINGS[c.val.compound] || CHEIRO_COMPOUND_MEANINGS[c.val.final];
              return (
                <div key={c.label} className="obs-panel p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">{c.sub}</span>
                        <h3 className="text-base font-bold text-[var(--text)] mt-0.5">{c.label}</h3>
                      </div>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-slate-950 shrink-0 tabular-nums"
                        style={{ backgroundColor: colorInfo.hex }}
                      >
                        {c.val.final}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="font-mono text-[var(--accent)] font-semibold">
                        Reduction: {c.val.trail}
                      </span>
                      <span className="text-[var(--text-secondary)] font-medium">
                        {colorInfo.name}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      <strong>Keynote:</strong> {c.val.meaning}
                    </p>
                  </div>

                  {cheiroCompound && (
                    <div className="pt-2.5 border-t border-[var(--border)] text-xs">
                      <div className="font-bold text-[var(--text)]">
                        Compound #{c.val.compound}: {cheiroCompound.title}
                      </div>
                      <p className="text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        {cheiroCompound.meaning}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUB-VIEW 2: INTERACTIVE 25-YEAR DECOZ COLORCHART MATRIX */}
        {subView === 'COLORCHART' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  Interactive 25-Year ColorChart Chronology
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Click any year column (Age {report.colorChartYears[0]?.age}–
                  {report.colorChartYears.at(-1)?.age}) to inspect its Personal Year, Essence,
                  Pinnacle, Challenge, and Name Transits.
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-950"
                    style={{ backgroundColor: DECOZ_COLORS[n].hex }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <table className="w-full min-w-[780px] text-center border-collapse text-xs font-mono">
                <thead>
                  <tr className="text-[var(--text-muted)] border-b border-[var(--border)]">
                    <th className="py-2 px-2 text-left font-sans">Cycle Layer</th>
                    {report.colorChartYears.map((cell) => {
                      const isNow = cell.calendarYear === new Date().getFullYear();
                      const isSel = selectedCell?.calendarYear === cell.calendarYear;
                      return (
                        <th
                          key={cell.calendarYear}
                          onClick={() => setSelectedCell(cell)}
                          className={`py-1.5 px-1 cursor-pointer rounded-t transition ${
                            isSel
                              ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-bold'
                              : isNow
                              ? 'bg-[var(--bg-elevated)] text-[var(--text)]'
                              : 'hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div>{cell.calendarYear.toString().slice(-2)}</div>
                          <div className="text-[11px] opacity-75">A{cell.age}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { label: 'Personal Year', field: 'personalYear' as const, isNum: true },
                    { label: 'Essence Cycle', field: 'essence' as const, isNum: true },
                    { label: 'Pinnacle', field: 'pinnacle' as const, isNum: true },
                    { label: 'Challenge', field: 'challenge' as const, isNum: true },
                    {
                      label: 'Physical Transit',
                      field: 'physicalTransit' as const,
                      valField: 'physicalValue' as const,
                    },
                    {
                      label: 'Mental Transit',
                      field: 'mentalTransit' as const,
                      valField: 'mentalValue' as const,
                    },
                    {
                      label: 'Spiritual Transit',
                      field: 'spiritualTransit' as const,
                      valField: 'spiritualValue' as const,
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-2 px-2 text-left font-sans font-medium text-[var(--text-secondary)] whitespace-nowrap">
                        {row.label}
                      </td>
                      {report.colorChartYears.map((cell) => {
                        const numVal = row.isNum
                          ? (cell[row.field] as number)
                          : cell[row.valField!];
                        const hex = DECOZ_COLORS[numVal]?.hex || '#818CF8';
                        const display = row.isNum ? numVal : `${cell[row.field]}`;
                        return (
                          <td
                            key={cell.calendarYear}
                            onClick={() => setSelectedCell(cell)}
                            className="p-0.5 cursor-pointer"
                          >
                            <div
                              className="py-1.5 rounded font-bold text-slate-950 transition-transform hover:scale-105"
                              style={{ backgroundColor: hex }}
                            >
                              {display}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCell && (
              <div className="obs-panel p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      tone="info"
                      label={`Year ${selectedCell.calendarYear} (Age ${selectedCell.age})`}
                    />
                    <span className="text-sm font-bold text-[var(--text)]">
                      Personal Year {selectedCell.personalYear} (
                      {DECOZ_COLORS[selectedCell.personalYear]?.keyword}) + Essence{' '}
                      {selectedCell.essence}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-mono">
                    Transits: Physical [{selectedCell.physicalTransit}={selectedCell.physicalValue}]
                    • Mental [{selectedCell.mentalTransit}={selectedCell.mentalValue}] • Spiritual [
                    {selectedCell.spiritualTransit}={selectedCell.spiritualValue}] • Pinnacle{' '}
                    {selectedCell.pinnacle} • Challenge {selectedCell.challenge}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 3: PROPORTIONAL CHART & LIVE NAME TUNER */}
        {subView === 'PROPORTIONAL_TUNER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="obs-panel p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text)]">
                  Proportional Digit Frequency (1–9)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Weighted distribution of digits 1 through 9 across core positions and birth name
                  letters.
                </p>
              </div>

              <div className="space-y-2.5">
                {report.proportionalBars.map((bar) => (
                  <div key={bar.digit} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">
                        Digit {bar.digit} —{' '}
                        <span className="text-[var(--text-secondary)] font-normal">
                          {bar.label}
                        </span>
                      </span>
                      <span className="font-mono font-bold text-[var(--text)] tabular-nums">
                        {bar.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, bar.percentage * 2.8)}%`,
                          backgroundColor: bar.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="obs-panel p-5 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Live Name &amp; Brand Vibration Tuner
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Test any personal name, baby name, or business spelling in real time.
                  </p>
                </div>

                <div className="flex gap-2.5 items-center">
                  <input
                    type="text"
                    aria-label="Test name vibration"
                    value={sandboxName}
                    onChange={(e) => setSandboxName(e.target.value)}
                    className="flex-1 obs-input text-sm"
                    placeholder="Type any name..."
                  />
                  <StatusBadge
                    tone="info"
                    size="md"
                    label={`Vibration: ${sandboxReduced.trail}`}
                  />
                </div>

                <p className="text-xs text-[var(--accent)] font-medium">
                  Keynote: {sandboxReduced.meaning}
                </p>

                {sandboxCheiro && (
                  <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
                    <div className="font-bold text-[var(--text)]">
                      Cheiro Compound #{sandboxReduced.compound}: {sandboxCheiro.title}
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {sandboxCheiro.meaning}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-[var(--text-secondary)]">
                    Birth Name Letter Breakdown (Highlighted = Vowel / Soul Urge):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.letterBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-10 rounded-md flex flex-col items-center justify-center text-xs font-mono border ${
                          item.isVowel
                            ? 'bg-[var(--accent-bg)] border-[var(--accent)]/40 text-[var(--accent)] font-bold'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{item.char}</span>
                        <span className="text-[11px] opacity-80">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)]">
                <span>
                  Planes: Phys {report.planesOfExpression.physical} • Ment{' '}
                  {report.planesOfExpression.mental} • Emot {report.planesOfExpression.emotional} •
                  Int {report.planesOfExpression.intuitive}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
