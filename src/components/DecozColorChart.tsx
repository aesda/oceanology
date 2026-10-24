import React, { useState } from 'react';
import { DECOZ_COLORS, DecozYearCell, NumerologyReport, reduceNumber } from '../engines/numerologyEngine';
import { NumerologySystem } from '../types/oceanology';
import { CHEIRO_COMPOUND_MEANINGS } from '../data/classicalCompendium';

interface Props {
  report: NumerologyReport;
  system: NumerologySystem;
  onSystemChange: (sys: NumerologySystem) => void;
}

type NumSubView = 'CORE_CHEIRO' | 'COLORCHART' | 'PROPORTIONAL_TUNER';

export const DecozColorChart: React.FC<Props> = ({ report, system, onSystemChange }) => {
  const [subView, setSubView] = useState<NumSubView>('CORE_CHEIRO');
  const [selectedCell, setSelectedCell] = useState<DecozYearCell>(
    report.colorChartYears.find(c => c.calendarYear === new Date().getFullYear()) ||
      report.colorChartYears[10] ||
      report.colorChartYears[0]
  );
  const [sandboxName, setSandboxName] = useState(report.currentNameUsed);

  const sandboxSum = sandboxName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .reduce((acc, ch) => {
      const code = ch.charCodeAt(0) - 64;
      return acc + ((code - 1) % 9) + 1;
    }, 0);
  const sandboxReduced = reduceNumber(sandboxSum || 1, true);
  const sandboxCheiro = CHEIRO_COMPOUND_MEANINGS[sandboxReduced.compound] || CHEIRO_COMPOUND_MEANINGS[sandboxReduced.final];

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
      {/* Header & Focused Sub-View Bar */}
      <div className="obs-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
              World Numerology (Hans Decoz) &amp; Cheiro’s Book of Numbers
            </span>
            <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
              Numerology Architecture &amp; ColorChart Chronology
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Birth Name: <strong>{report.fullNameUsed}</strong> • Active Name: <strong>{report.currentNameUsed}</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 obs-panel p-1">
            <button
              onClick={() => onSystemChange('PYTHAGOREAN')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                system === 'PYTHAGOREAN'
                  ? 'bg-[var(--surface)] text-[var(--brass)] shadow-sm border border-[var(--border-strong)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Pythagorean (Decoz)
            </button>
            <button
              onClick={() => onSystemChange('CHALDEAN')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                system === 'CHALDEAN'
                  ? 'bg-[var(--surface)] text-[var(--brass)] shadow-sm border border-[var(--border-strong)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Chaldean (Cheiro Mystic)
            </button>
          </div>
        </div>

        {/* Focused Sub-View Switcher */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--border)] text-xs">
          {[
            { id: 'CORE_CHEIRO' as const, label: '1. Core Numbers & Cheiro Compound Lore' },
            { id: 'COLORCHART' as const, label: '2. Interactive 25-Year Decoz ColorChart' },
            { id: 'PROPORTIONAL_TUNER' as const, label: '3. Proportional Chart & Live Name Tuner' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id)}
              className={`px-3.5 py-1.5 rounded font-semibold transition ${
                subView === tab.id
                  ? 'obs-badge-brass shadow-sm'
                  : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-VIEW 1: CORE NUMBERS & CHEIRO COMPOUND LORE */}
      {subView === 'CORE_CHEIRO' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreCards.map(c => {
              const colorInfo =
                DECOZ_COLORS[c.val.final] || DECOZ_COLORS[c.val.singleDigit] || DECOZ_COLORS[1];
              const cheiroCompound =
                CHEIRO_COMPOUND_MEANINGS[c.val.compound] || CHEIRO_COMPOUND_MEANINGS[c.val.final];
              return (
                <div key={c.label} className="obs-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">{c.sub}</span>
                        <h3 className="text-lg font-serif font-bold text-[var(--text)]">{c.label}</h3>
                      </div>
                      <div
                        className="w-11 h-11 rounded flex items-center justify-center font-serif font-bold text-xl text-neutral-950 shrink-0"
                        style={{ backgroundColor: colorInfo.hex }}
                      >
                        {c.val.final}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="font-mono text-[var(--brass)] font-semibold">
                        Reduction: {c.val.trail}
                      </span>
                      <span className="text-[var(--text-secondary)] font-medium">{colorInfo.name}</span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      <strong>Decoz Keynote:</strong> {c.val.meaning}
                    </p>
                  </div>

                  {cheiroCompound && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] text-xs">
                      <div className="font-serif font-bold text-[var(--brass)]">
                        Cheiro Compound #{c.val.compound}: {cheiroCompound.title}
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
        </div>
      )}

      {/* SUB-VIEW 2: INTERACTIVE 25-YEAR DECOZ COLORCHART MATRIX */}
      {subView === 'COLORCHART' && (
        <div className="obs-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                Interactive 25-Year Decoz ColorChart Matrix
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Click any year column (Age {report.colorChartYears[0]?.age}–{report.colorChartYears.at(-1)?.age}) to inspect its Personal Year, Essence, Pinnacle, Challenge &amp; Letter Transits.
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded text-xs font-mono font-bold text-neutral-950"
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
                  {report.colorChartYears.map(cell => {
                    const isNow = cell.calendarYear === new Date().getFullYear();
                    const isSel = selectedCell?.calendarYear === cell.calendarYear;
                    return (
                      <th
                        key={cell.calendarYear}
                        onClick={() => setSelectedCell(cell)}
                        className={`py-1.5 px-1 cursor-pointer rounded-t transition ${
                          isSel
                            ? 'obs-badge-brass font-bold'
                            : isNow
                            ? 'bg-[var(--surface-muted)] text-[var(--text)]'
                            : 'hover:bg-[var(--surface-muted)]'
                        }`}
                      >
                        <div>{cell.calendarYear.toString().slice(-2)}</div>
                        <div className="text-xs opacity-75">A{cell.age}</div>
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
                  { label: 'Physical Transit', field: 'physicalTransit' as const, valField: 'physicalValue' as const },
                  { label: 'Mental Transit', field: 'mentalTransit' as const, valField: 'mentalValue' as const },
                  { label: 'Spiritual Transit', field: 'spiritualTransit' as const, valField: 'spiritualValue' as const },
                ].map(row => (
                  <tr key={row.label}>
                    <td className="py-2 px-2 text-left font-sans font-medium text-[var(--text-secondary)] whitespace-nowrap">
                      {row.label}
                    </td>
                    {report.colorChartYears.map(cell => {
                      const numVal = row.isNum ? (cell[row.field] as number) : cell[row.valField!];
                      const hex = DECOZ_COLORS[numVal]?.hex || '#C88A2E';
                      const display = row.isNum ? numVal : `${cell[row.field]}`;
                      return (
                        <td
                          key={cell.calendarYear}
                          onClick={() => setSelectedCell(cell)}
                          className="p-0.5 cursor-pointer"
                        >
                          <div
                            className="py-1.5 rounded font-bold text-neutral-950 transition-transform hover:scale-105"
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
            <div className="mt-4 obs-panel p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-[var(--brass)]">
                  TIMELINE YEAR: {selectedCell.calendarYear} (AGE {selectedCell.age})
                </span>
                <h4 className="text-lg font-serif font-bold text-[var(--text)] mt-0.5">
                  Personal Year {selectedCell.personalYear} ({DECOZ_COLORS[selectedCell.personalYear]?.keyword}) + Essence {selectedCell.essence}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Active Name Transits: Physical [{selectedCell.physicalTransit}={selectedCell.physicalValue}] • Mental [{selectedCell.mentalTransit}={selectedCell.mentalValue}] • Spiritual [{selectedCell.spiritualTransit}={selectedCell.spiritualValue}] • Pinnacle {selectedCell.pinnacle} • Challenge {selectedCell.challenge}
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="text-[var(--text-muted)]">Current Personal Month / Day</div>
                <div className="font-mono font-bold text-[var(--brass)] text-sm">
                  Month {report.personalMonth.singleDigit} • Day {report.personalDay.singleDigit}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: PROPORTIONAL CHART & LIVE NAME TUNER */}
      {subView === 'PROPORTIONAL_TUNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="obs-card p-5">
            <h3 className="text-xl font-serif font-bold text-[var(--text)]">
              The Proportional Numerology Chart (1–9 Dominance)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Weighted frequency of numbers 1 through 9 across core positions and birth name letters.
            </p>

            <div className="space-y-2.5">
              {report.proportionalBars.map(bar => (
                <div key={bar.digit} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--text)]">
                      Number {bar.digit} — <span className="text-[var(--text-secondary)] font-normal">{bar.label}</span>
                    </span>
                    <span className="font-mono font-bold text-[var(--text)]">{bar.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface-muted)] rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${Math.min(100, bar.percentage * 2.8)}%`, backgroundColor: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="obs-card p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                Live Name Vibration Tuner &amp; Cheiro Compound Audit
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Test any name, baby name, or brand spelling modification in real time.
              </p>

              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Test Name or Brand Vibration:
              </label>
              <div className="flex gap-2.5 items-center">
                <input
                  type="text"
                  value={sandboxName}
                  onChange={e => setSandboxName(e.target.value)}
                  className="flex-1 obs-input py-2 text-sm"
                  placeholder="Type any name..."
                />
                <div className="px-3.5 py-2 rounded font-mono font-bold text-xs obs-badge-brass whitespace-nowrap">
                  Vibration: {sandboxReduced.trail}
                </div>
              </div>
              <p className="text-xs text-[var(--brass)] mt-2 font-medium">
                Decoz Archetype: {sandboxReduced.meaning}
              </p>
              {sandboxCheiro && (
                <div className="mt-2 obs-panel p-3 text-xs">
                  <div className="font-serif font-bold text-[var(--text)]">
                    Cheiro Compound #{sandboxReduced.compound}: {sandboxCheiro.title}
                  </div>
                  <p className="text-[var(--text-secondary)] mt-0.5">{sandboxCheiro.meaning}</p>
                </div>
              )}

              <div className="mt-5">
                <div className="text-xs text-[var(--text-secondary)] mb-2">
                  Birth Name Letter Breakdown (<span className="text-[var(--brass)] font-semibold">Gold = Vowel / Soul Urge</span>, Neutral = Consonant):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {report.letterBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-10 rounded flex flex-col items-center justify-center text-xs font-mono ${
                        item.isVowel ? 'obs-badge-brass font-bold' : 'obs-panel text-[var(--text-secondary)]'
                      }`}
                    >
                      <span>{item.char}</span>
                      <span className="text-xs opacity-80">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Karmic Lessons (Missing Digits): </span>
                <span className="font-mono text-[var(--crimson)] font-semibold">
                  {report.karmicLessons.length > 0
                    ? report.karmicLessons.join(', ')
                    : 'None (All 9 Vibrations Present)'}
                </span>
              </div>
              <div className="font-mono text-[var(--text-muted)]">
                Planes: Phys {report.planesOfExpression.physical} • Ment {report.planesOfExpression.mental} • Emot {report.planesOfExpression.emotional} • Int {report.planesOfExpression.intuitive}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
