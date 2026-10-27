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
import { useLanguage } from '../i18n/i18n';

interface Props {
  report: NumerologyReport;
  system: NumerologySystem;
  onSystemChange: (sys: NumerologySystem) => void;
}

type NumSubView = 'CORE_CHEIRO' | 'LOSHU_VEDIC' | 'COLORCHART' | 'PROPORTIONAL_TUNER';

export const DecozColorChart: React.FC<Props> = ({ report, system, onSystemChange }) => {
  const { lang, t } = useLanguage();
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
    {
      label: t('Life Path Number', 'मूलांक / जीवन मार्ग अंक'),
      sub: t('Primary Evolutionary Trajectory', 'मुख्य जीवन दिशा र कर्म पथ'),
      val: report.lifePath,
    },
    {
      label: t('Expression (Destiny)', 'भाग्यांक / अभिव्यक्ति अंक'),
      sub: t('Full Birth Name Potential', 'पूरा नामबाट प्राप्त क्षमता'),
      val: report.expression,
    },
    {
      label: t("Heart's Desire (Soul Urge)", 'आत्म-इच्छा अंक (स्वर)'),
      sub: t('Inner Vowel Motivation', 'भित्री प्रेरणा र भावना'),
      val: report.heartsDesire,
    },
    {
      label: t('Personality Vibration', 'व्यक्तित्व अंक (व्यञ्जन)'),
      sub: t('Outer Consonant Persona', 'बाहिरी प्रभाव र छवि'),
      val: report.personality,
    },
    {
      label: t('Maturity Number', 'परिपक्वता अंक'),
      sub: t('Second-Half Life Synthesis', 'उत्तरार्ध जीवनको लक्ष्य'),
      val: report.maturity,
    },
    {
      label: t('Birth Day Number', 'जन्म मिति अंक'),
      sub: t('Innate Sub-Path Talent', 'जन्मजात विशेष प्रतिभा'),
      val: report.birthDay,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ==================== CLEAN HEADER & SYSTEM SWITCHER ==================== */}
      <WorkspacePageHeader
        title={t('Numerology & 25-Year ColorChart', 'अंक ज्योतिष र २५-वर्षे कलर-चार्ट')}
        subtitle={
          <>
            {t('Birth Name:', 'जन्म नाम:')} <strong>{report.fullNameUsed}</strong> •{' '}
            {t('Active Name:', 'प्रचलित नाम:')} <strong>{report.currentNameUsed}</strong>
          </>
        }
        actions={
          <SegmentedTabs
            ariaLabel="Numerology calculation system"
            value={system}
            onChange={onSystemChange}
            items={[
              {
                id: 'PYTHAGOREAN',
                label: t('Pythagorean (Decoz)', 'पाइथागोरियन (डेकोज)'),
              },
              {
                id: 'CHALDEAN',
                label: t('Chaldean (Cheiro)', 'क्याल्डियन (चेइरो)'),
              },
            ]}
          />
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL KPI STAT CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label={t('Life Path Number', 'जीवन मार्ग अंक')}
          value={report.lifePath.final}
          subvalue={`(${report.lifePath.trail})`}
          benchmarkText={t('Core life direction', 'मुख्य जीवन मार्ग')}
          status={{ tone: 'info', label: system }}
          icon={<Hash className="w-4 h-4" />}
        />

        <KpiStatCard
          label={t('Expression (Destiny)', 'भाग्यांक (अभिव्यक्ति)')}
          value={report.expression.final}
          subvalue={`(${report.expression.trail})`}
          benchmarkText={`${t('Soul Urge:', 'आत्म-इच्छा:')} ${report.heartsDesire.final}`}
          status={{ tone: 'favorable', label: t('Full Name', 'पूरा नाम') }}
          icon={<Sparkles className="w-4 h-4" />}
        />

        <KpiStatCard
          label={t('Current Personal Year', 'हालको व्यक्तिगत वर्ष')}
          value={t(`Year ${report.personalYear.final}`, `वर्ष ${report.personalYear.final}`)}
          benchmarkText={
            lang === 'ne'
              ? '९-वर्षे व्यक्तिगत अंक चक्र'
              : DECOZ_COLORS[report.personalYear.singleDigit]?.keyword || '9-Year Cycle'
          }
          status={{
            tone: 'optimal',
            label: t(`${new Date().getFullYear()} Cycle`, `${new Date().getFullYear()} चक्र`),
          }}
          icon={<Calendar className="w-4 h-4" />}
          actionLabel={t('Open 25-year matrix', '२५-वर्षे तालिका खोल्नुहोस्')}
          onAction={() => setSubView('COLORCHART')}
        />

        <KpiStatCard
          label={t('Personal Month & Day', 'व्यक्तिगत महिना र दिन')}
          value={
            lang === 'ne'
              ? `महिना ${report.personalMonth.singleDigit} • दिन ${report.personalDay.singleDigit}`
              : `M${report.personalMonth.singleDigit} • D${report.personalDay.singleDigit}`
          }
          benchmarkText={
            report.karmicLessons.length > 0
              ? t(
                  `Missing digits: ${report.karmicLessons.join(', ')}`,
                  `छुटेका अंक: ${report.karmicLessons.join(', ')}`
                )
              : t('All 9 digits present', 'सबै ९ अंक उपस्थित')
          }
          status={{
            tone: report.karmicLessons.length === 0 ? 'optimal' : 'neutral',
            label: t(`Maturity #${report.maturity.final}`, `परिपक्वता #${report.maturity.final}`),
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
              {
                id: 'CORE_CHEIRO',
                label: t('Core Numbers & Compounds', 'मुख्य अंक र चेइरो संयुक्त अंक'),
                count: 6,
              },
              {
                id: 'LOSHU_VEDIC',
                label: t('3×3 Lo Shu Vedic Grid', '३×३ लो-शु वैदिक वर्ग'),
                count: 9,
              },
              {
                id: 'COLORCHART',
                label: t('25-Year ColorChart Matrix', '२५-वर्षे कलर-चार्ट तालिका'),
                count: report.colorChartYears.length,
              },
              {
                id: 'PROPORTIONAL_TUNER',
                label: t('1–9 Dominance & Name Tuner', '१–९ आवृत्ति र नाम परीक्षक'),
              },
            ]}
          />
        </div>

        {/* SUB-VIEW 1B: 3x3 LO SHU / VEDIC ANK-YANTRA MAGIC SQUARE & 8 PLANES */}
        {subView === 'LOSHU_VEDIC' && (() => {
          const ls = lang === 'ne' ? report.loShuGridNe : report.loShuGridEn;
          return (
            <div className="space-y-5">
              <div className="obs-panel p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                    {t(
                      'Navagraha Directional Magic Square (Every Row, Column & Diagonal = 15)',
                      'नवग्रह अष्ट-दिशा ३×३ जादुई वर्ग (प्रत्येक पंक्ति र विकर्णको योग = १५)'
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text)] mt-0.5">
                    {t(
                      `Mulank (Driver) #${ls.mulankDriver} • Bhagyank (Conductor) #${ls.bhagyankConductor}`,
                      `मूलांक (चालक) #${ls.mulankDriver} • भाग्यांक (संचालक) #${ls.bhagyankConductor}`
                    )}
                  </h3>
                </div>
                <StatusBadge
                  tone={ls.completedYogas.length > 0 ? 'optimal' : 'favorable'}
                  label={
                    ls.completedYogas.length > 0
                      ? t(
                          `${ls.completedYogas.length} Complete Raj Yoga / Plane(s)`,
                          `${ls.completedYogas.length} पूर्ण राजयोग / स्तम्भ`
                        )
                      : t('Balanced Developing Grid', 'सन्तुलित विकासशील वर्ग')
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 3x3 Grid */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                  {ls.cellsIn3x3Order.map((cell) => {
                    const active = cell.count > 0;
                    const colorHex = DECOZ_COLORS[cell.digit]?.hex || '#9780FF';
                    return (
                      <div
                        key={cell.digit}
                        className={`rounded-2xl border p-4 text-center space-y-1 transition ${
                          active
                            ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45 shadow-sm'
                            : 'border-[var(--border)] bg-[var(--surface-muted)] opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                          <span>#{cell.digit}</span>
                          <span>{cell.direction}</span>
                        </div>
                        <div
                          className="text-2xl font-extrabold tracking-widest tabular-nums py-1"
                          style={{ color: active ? colorHex : 'var(--text-muted)' }}
                        >
                          {cell.repeatedDigitsText}
                        </div>
                        <div className="text-xs font-bold text-[var(--text)] truncate">
                          {cell.planetRuler}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {cell.domainLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All 8 Planes / Arrows of Strength */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text)]">
                    {t(
                      '8 Planes & Diagonal Raj Yogas (4–5–6 Golden, 2–5–8 Silver, Horizontal & Vertical)',
                      '८ स्तर र राजयोग विकर्णहरू (४–५–६ स्वर्ण योग, २–५–८ रजत योग, तेर्सो र ठाडो स्तम्भ)'
                    )}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ls.planes.map((pl) => (
                      <div
                        key={pl.id}
                        className={`rounded-xl border p-3.5 space-y-1.5 ${
                          pl.isComplete
                            ? 'border-[var(--sage)] bg-[var(--sage-bg)]'
                            : 'border-[var(--border)] bg-[var(--surface)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--text)]">
                            {pl.nameLabel}
                          </span>
                          <StatusBadge tone={pl.tone} label={`${pl.completionCount}/3`} />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {pl.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {ls.missingDigits.length > 0 && (
                <div className="obs-panel p-4 space-y-2">
                  <div className="text-xs font-bold text-[var(--text)]">
                    {t(
                      'Practical Daily Habits for Unoccupied Lo Shu Cells',
                      'लो-शु वर्गमा खाली रहेका कोठाको सरल दैनिक सन्तुलन बानी'
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                    {ls.missingDigits.map((m) => (
                      <div key={m.digit} className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-2.5">
                        <strong className="text-[var(--accent)]">#{m.digit}:</strong> {m.remedyTip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-[var(--text-muted)]">{ls.sourceCitation}</div>
            </div>
          );
        })()}

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
