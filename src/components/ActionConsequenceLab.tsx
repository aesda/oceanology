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
  WorkspacePageHeader,
} from './ui/DashboardPrimitives';
import { SacredFlowerIcon } from './ui/FloralAnimations';
import {
  formatCityForLang,
  formatDisplayDate,
  shortNakshatraLabel,
  trActionCategory,
  trActionDynamicOutcome,
  trActionTitle,
  trDignity,
  trHoraiDisplay,
  trHoursRemaining,
  trNakNature,
  trNakshatra,
  trPlanet,
  trSign,
  trTaraName,
  trVara,
  useLanguage,
} from '../i18n/i18n';
import { gregorianToBikramSambat } from '../engines/locationAtlas';

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
  const { lang, t } = useLanguage();
  const cityLabel = formatCityForLang(location.name, lang);
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
      const shortDate = formatDisplayDate(dayIso, lang, false, true);
      return {
        id: dayIso,
        label: shortDate,
        sublabel: shortNakshatraLabel(ev.panchang.nakshatra.name, lang),
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
    lang,
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
      ? { tone: 'optimal', label: t('Optimal Window', 'सर्वोत्तम साइत') }
      : report.score >= 48
      ? { tone: 'mixed', label: t('Mixed / Caution', 'मिश्रित / सावधानी') }
      : { tone: 'avoid', label: t('Postpone', 'प्रतीक्षा उत्तम') };

  const factorTone = (status: string): { tone: SemanticTone; label: string } => {
    if (status === 'Positive') return { tone: 'optimal', label: t('Supportive', 'सहयोगी') };
    if (status === 'Caution') return { tone: 'mixed', label: t('Caution', 'सावधानी') };
    if (status === 'Critical') return { tone: 'avoid', label: t('Avoid', 'त्याज्य') };
    return { tone: 'neutral', label: t('Neutral', 'मध्यम') };
  };

  const localizedActionTitle = trActionTitle(report.action.id, report.action.title, lang);
  const localizedOutcome = trActionDynamicOutcome(
    report.score,
    report.action,
    report.panchang.nakshatra.name,
    report.action.shortPrompt,
    report.whatHappensIfDoneNow,
    lang
  );

  return (
    <div className="space-y-6">
      {/* ==================== PAGE HEADER & MODE SWITCHER ==================== */}
      <WorkspacePageHeader
        title={t('Action Timing & Consequence Planner', 'शुभ साइत र कर्म-फल विश्लेषक')}
        subtitle={t(
          'Evaluate 20 major life decisions against Muhurta electional rules, personal Tarabala, Horai planetary hours, and planetary conduct.',
          '२० प्रमुख जीवन निर्णयहरूको शास्त्रीय मुहूर्त, व्यक्तिगत ताराबल, ग्रह होरा र नवग्रह कर्म-विपाक मूल्याङ्कन।'
        )}
        actions={
          <SegmentedTabs
            ariaLabel="Action planner mode"
            value={labTab}
            onChange={setLabTab}
            items={[
              {
                id: 'MUHURTA_ORACLE',
                label: t('Action Timing', 'शुभ मुहूर्त जाँच'),
                count: 20,
              },
              {
                id: 'BEHAVIORAL_KARMA',
                label: t('Planetary Karma-Vipaka', 'नवग्रह कर्म-विपाक'),
                count: 9,
              },
            ]}
          />
        }
      />

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
                      className={`ui-chip ${active ? 'ui-chip-active' : ''}`}
                    >
                      {trActionCategory(cat, lang)}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-medium text-[var(--text-muted)]">
                {t('Location:', 'स्थान:')} {cityLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1 border-t border-[var(--border)]">
              {/* Action Selector */}
              <div className="lg:col-span-6 flex items-center gap-2.5">
                <label
                  htmlFor="ocean-action-select"
                  className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"
                >
                  {t('Action:', 'कार्य:')}
                </label>
                <select
                  id="ocean-action-select"
                  value={selectedActionId}
                  onChange={(e) => setSelectedActionId(e.target.value)}
                  className="w-full obs-input font-medium text-sm"
                >
                  {filteredActions.map((act) => (
                    <option key={act.id} value={act.id}>
                      {trActionTitle(act.id, act.title, lang)} — ({trActionCategory(act.category, lang)})
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
                    <span>{t('Prev', 'अघिल्लो')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateStr(new Date().toISOString().slice(0, 10))}
                    className="px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    {t('Today', 'आज')}
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftDateByDays(1)}
                    aria-label="Next day"
                    className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] inline-flex items-center gap-1"
                  >
                    <span>{t('Next', 'अर्को')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 1: 4 CONTEXTUAL KPI STAT CARDS (Inverted Pyramid Top) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiStatCard
              label={t('Action Readiness Score', 'कार्य अनुकूलता अंक')}
              value={`${report.score}/100`}
              benchmarkText={
                report.score >= 70
                  ? t(
                      `+${report.score - 70} pts vs 70 safe benchmark`,
                      `७० सुरक्षित मानकभन्दा +${report.score - 70} अंक माथि`
                    )
                  : t(
                      `${70 - report.score} pts below 70 benchmark`,
                      `७० शुभ मानकभन्दा ${70 - report.score} अंक कम`
                    )
              }
              status={readinessStatus}
              icon={<Activity className="w-4 h-4" />}
            />

            <KpiStatCard
              label={t('Best Date (Next 12 Days)', 'सर्वोत्तम मिति (आगामी १२ दिन)')}
              value={formatDisplayDate(bestWindows[0]?.dateStr || selectedDateStr, lang, false)}
              subvalue={bestWindows[0] ? `${bestWindows[0].score}/100` : undefined}
              benchmarkText={
                bestWindows[0]
                  ? `${trVara(bestWindows[0].weekdayName, lang)} • ${trNakshatra(bestWindows[0].nakshatraName, lang)}`
                  : t('Current horizon', 'हालको समयसीमा')
              }
              status={{ tone: 'optimal', label: t('Peak Window', 'उत्कृष्ट दिन') }}
              icon={<Calendar className="w-4 h-4" />}
              actionLabel={
                bestWindows[0] && bestWindows[0].dateStr !== selectedDateStr
                  ? t('Select peak date', 'यो शुभ मिति छान्नुहोस्')
                  : undefined
              }
              onAction={
                bestWindows[0] ? () => setSelectedDateStr(bestWindows[0].dateStr) : undefined
              }
            />

            <KpiStatCard
              label={t('Transit Nakshatra', 'गोचर नक्षत्र')}
              value={trNakshatra(report.panchang.nakshatra.name, lang)}
              subvalue={`${t('Pada', 'चरण')} ${report.panchang.nakshatra.pada}`}
              benchmarkText={trHoursRemaining(report.panchang.nakshatra.hoursRemaining, lang)}
              status={{
                tone: 'info',
                label: trNakNature(report.panchang.nakshatra.natureGroup, lang, true),
              }}
              icon={<Sparkles className="w-4 h-4" />}
              actionLabel={
                onInspectNakshatra
                  ? t('Inspect Nakshatra', 'नक्षत्र विवरण')
                  : undefined
              }
              onAction={
                onInspectNakshatra
                  ? () => onInspectNakshatra(report.panchang.nakshatra.zeroIndex)
                  : undefined
              }
            />

            <KpiStatCard
              label={t('Personal Tarabala', 'व्यक्तिगत ताराबल')}
              value={`${t('Tara', 'तारा')} #${report.panchang.personalTarabala.taraNumber}`}
              subvalue={trTaraName(report.panchang.personalTarabala.taraName.split(' ')[0], lang)}
              benchmarkText={t(
                `Moon in House ${report.panchang.personalTarabala.chandrabalaHouse}`,
                `चन्द्रबल भाव ${report.panchang.personalTarabala.chandrabalaHouse}`
              )}
              status={{
                tone: report.panchang.personalTarabala.isAuspicious ? 'optimal' : 'mixed',
                label: report.panchang.personalTarabala.isAuspicious
                  ? t('Supportive', 'सहयोगी')
                  : t('Needs Parihara', 'परिहार आवश्यक'),
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
                    {t(
                      `12-Day Electional Score Horizon — ${localizedActionTitle}`,
                      `१२-दिने शुभ मुहूर्त ग्राफ — ${localizedActionTitle}`
                    )}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t(
                      'Click any date point to inspect its exact Panchang, Tithi, and Tarabala factors',
                      'कुनै पनि मितिको बिन्दुमा क्लिक गरी त्यस दिनको पञ्चाङ्ग, तिथि र ताराबल हेर्नुहोस्'
                    )}
                  </p>
                </div>
                <span className="text-xs tabular-nums font-medium text-[var(--text-secondary)]">
                  {(() => {
                    const [y, m, d] = selectedDateStr.split('-').map((n) => parseInt(n, 10));
                    const bs = gregorianToBikramSambat(y || 2026, m || 10, d || 25);
                    return lang === 'ne' ? `वि.सं. ${bs.formattedNp}` : `B.S. ${bs.formattedEn}`;
                  })()}
                </span>
              </div>

              <ScoreTrendChart
                points={horizonTrendPoints}
                benchmarkValue={70}
                benchmarkLabel={t('70+ Optimal window', '७०+ सर्वोत्तम रेखा')}
                selectedId={selectedDateStr}
                onSelectPoint={(dateIso) => setSelectedDateStr(dateIso)}
                ariaLabel={`12-day timing favorability trend for ${localizedActionTitle}`}
              />
            </div>

            {/* Decision Verdict & Consequence Summary */}
            <div className="lg:col-span-5 obs-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    tone={readinessStatus.tone}
                    label={lang === 'ne' ? readinessStatus.label : report.verdictTier}
                    size="md"
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {lang === 'ne'
                      ? report.action.sanskritTitle.replace(/\s*\([^)]+\)/g, '')
                      : report.action.sanskritTitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text)] leading-snug">
                  {localizedOutcome.headline}
                </h3>

                <div className="obs-panel p-4 space-y-1.5">
                  <div className="text-sm font-bold text-[var(--text)]">
                    {t('What Happens If You Do This Today', 'आज यो कार्य गर्दा हुने परिणाम')}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {localizedOutcome.consequence}
                  </p>
                </div>

                <div className="obs-panel p-4 space-y-1.5">
                  <div className="text-sm font-bold text-[var(--sage)]">
                    {t('Practical Timing Advice', 'व्यावहारिक समय सल्लाह')}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'ne' && bestWindows[0]
                      ? `आगामी १२ दिनमा सर्वोच्च शुभ मिति ${bestWindows[0].dateStr} (${trVara(bestWindows[0].weekdayName, 'ne')}, ${trNakshatra(bestWindows[0].nakshatraName, 'ne')} नक्षत्र — अंक ${bestWindows[0].score}/100) रहेको छ।`
                      : report.whatHappensIfDelayed}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>
                  {t('Source:', 'शास्त्रीय स्रोत:')} {report.action.classicalSource}
                </span>
                <span>{trVara(report.panchang.vara.name, lang)}</span>
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
                      {t(
                        `Best Horai Planetary Hours on ${selectedDateStr} for ${localizedActionTitle}`,
                        `${selectedDateStr} मा '${localizedActionTitle}' का लागि सर्वोत्तम ग्रह होरा`
                      )}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{rec.rationale}</p>
                  </div>
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                    {t('Click a Horai to set exact clock time', 'घडी समय सेट गर्न होरा छान्नुहोस्')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {slotsToShow.slice(0, 4).map((slot) => {
                    const sLoc = trHoraiDisplay(slot, lang);
                    return (
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
                              {sLoc.horaiName}
                            </div>
                            <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                              {slot.startTime} – {slot.endTime}
                            </div>
                          </div>
                        </div>
                        <StatusBadge
                          tone={slot.tone}
                          label={slot.isActiveNow ? t('LIVE', 'प्रत्यक्ष') : t('Pick', 'छान्ने')}
                        />
                      </button>
                    );
                  })}
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
                    label: t('Rule-by-Rule Breakdown', 'नियमगत विस्तृत परीक्षण'),
                    count: report.factors.length,
                  },
                  {
                    id: 'WINDOWS',
                    label: t('Top Upcoming Dates', 'आगामी शुभ मितिहरू'),
                    count: bestWindows.length,
                  },
                  {
                    id: 'PARIHARA',
                    label: t('Classical Principle & Remedies', 'शास्त्रीय सिद्धान्त र परिहार उपाय'),
                    count: report.pariharaRemedies.length,
                  },
                ]}
              />

              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {t(
                  `Evaluated at ${selectedDateStr} ${selectedTimeStr} (${cityLabel})`,
                  `मूल्याङ्कन समय: ${selectedDateStr} ${selectedTimeStr} (${cityLabel})`
                )}
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
                        {trVara(win.weekdayName, lang)} • {trNakshatra(win.nakshatraName, lang)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {win.tithiName}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--accent)] mt-2.5 pt-2 border-t border-[var(--border)]">
                        {t('Best window:', 'उत्तम समय:')} {win.bestWindowTime}
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
                    <span>
                      {t(
                        `Classical Electional Rule (${report.action.classicalSource})`,
                        `शास्त्रीय मुहूर्त नियम (${report.action.classicalSource})`
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {report.action.baseRuleSummary}
                  </p>
                </div>

                <div className="obs-panel p-4 space-y-2.5">
                  <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--sage)]" />
                    <span>
                      {t(
                        'Parihara Protocol (If Action Cannot Be Delayed)',
                        'परिहार विधि (कार्य सार्न नमिल्ने अवस्थामा)'
                      )}
                    </span>
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
              {t('Select Planetary Force (Navagraha)', 'नवग्रह चयन गर्नुहोस्')}
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
                      {pChart?.symbol} {trPlanet(item.planetId, lang)}
                    </div>
                    {pChart && (
                      <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                        {t('H', 'भाव ')}
                        {pChart.house} •{' '}
                        {lang === 'ne' ? trSign(pChart.signName, 'ne') : pChart.signName.slice(0, 3)}
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
                label={t('Natal Sign & Longitude', 'जन्म राशि र अंश')}
                value={`${natalKarmaPlanet.signSymbol} ${trSign(natalKarmaPlanet.signName, lang)}`}
                benchmarkText={natalKarmaPlanet.formattedDMS}
                status={{ tone: 'info', label: activeKarmaEntry.sanskritTitle }}
              />
              <KpiStatCard
                label={t('Natal Bhava (House)', 'जन्म भाव')}
                value={t(`House ${natalKarmaPlanet.house}`, `भाव ${natalKarmaPlanet.house}`)}
                benchmarkText={
                  natalKarmaPlanet.isRetrograde
                    ? t('Retrograde (Vakri)', 'वक्री गति')
                    : t('Direct motion', 'मार्गी गति')
                }
                status={{
                  tone: [1, 4, 5, 7, 9, 10, 11].includes(natalKarmaPlanet.house)
                    ? 'favorable'
                    : 'neutral',
                  label: [1, 4, 7, 10].includes(natalKarmaPlanet.house)
                    ? t('Kendra', 'केन्द्र')
                    : [5, 9].includes(natalKarmaPlanet.house)
                    ? t('Trikona', 'त्रिकोण')
                    : t('Bhava', 'भाव'),
                }}
              />
              <KpiStatCard
                label={t('Natal Nakshatra', 'जन्म नक्षत्र')}
                value={trNakshatra(natalKarmaPlanet.nakshatraName, lang)}
                subvalue={`${t('Pada', 'चरण')} ${natalKarmaPlanet.nakshatraPada}`}
                benchmarkText={`${t('Lord:', 'स्वामी:')} ${trPlanet(natalKarmaPlanet.nakshatraLord, lang)}`}
                actionLabel={
                  onInspectNakshatra ? t('View Nakshatra', 'नक्षत्र हेर्नुहोस्') : undefined
                }
                onAction={
                  onInspectNakshatra
                    ? () => onInspectNakshatra(natalKarmaPlanet.nakshatraIndex)
                    : undefined
                }
              />
              <KpiStatCard
                label={t('Essential Dignity', 'ग्रह अवस्था (बल)')}
                value={trDignity(natalKarmaPlanet.dignity, lang)}
                benchmarkText={`${t('Speed:', 'गति:')} ${natalKarmaPlanet.speedDegPerDay.toFixed(2)}°/day`}
                status={{
                  tone:
                    natalKarmaPlanet.dignity === 'Exalted' || natalKarmaPlanet.dignity === 'Own Sign'
                      ? 'optimal'
                      : natalKarmaPlanet.dignity === 'Debilitated'
                      ? 'avoid'
                      : 'neutral',
                  label: trDignity(natalKarmaPlanet.dignity, lang),
                }}
              />
            </div>
          )}

          {/* 3-Column Cause, Effect & Daily Alignment */}
          <div className="obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4 space-y-1">
              <h2 className="text-xl font-bold text-[var(--text)]">
                {trPlanet(activeKarmaEntry.planetId, lang)} —{' '}
                {t('Behavioral Cause & Consequence', 'आचरण र कर्म-विपाक परिणाम')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                <strong>{t('Governed Domains:', 'शासित क्षेत्रहरू:')}</strong>{' '}
                {activeKarmaEntry.governedDomains}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1: Conduct That Strengthens */}
              <div className="obs-panel p-4 space-y-3 border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--sage)]">
                    {t('Conduct That Strengthens', 'ग्रह बलियो बनाउने आचरण')}
                  </span>
                  <StatusBadge tone="optimal" label={t('Sattvic Alignment', 'सात्त्विक आचरण')} />
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifAlignedBehavior}
                </p>
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {t('Expected Positive Outcomes', 'सकारात्मक शुभ फल')}
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
                    {t('Conduct That Afflicts', 'ग्रह पीडित बनाउने व्यवहार')}
                  </span>
                  <StatusBadge tone="avoid" label={t('Friction Pattern', 'अवरोध कारक')} />
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {activeKarmaEntry.ifDishonoredBehavior}
                </p>
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {t('Early Warning Signs', 'प्रारम्भिक चेतावनी लक्षण')}
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
                      {t('Practical Daily Habit (Upaya)', 'दैनिक व्यावहारिक उपाय')}
                    </span>
                    <StatusBadge tone="info" label={t('Daily Practice', 'दैनिक अभ्यास')} />
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed">
                    {activeKarmaEntry.livingDharmaPractice}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  {t(
                    'Grounded in Brihat Parashara Hora Shastra behavioral remediation principles.',
                    'बृहत् पाराशर होरा शास्त्रको कर्म-परिहार सिद्धान्तमा आधारित।'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
