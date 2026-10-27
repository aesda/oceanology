import React, { useState } from 'react';
import {
  Compass,
  ShieldAlert,
  Sparkles,
  Calendar,
  Clock,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { PanchangReport } from '../engines/panchangEngine';
import { formatCoordPair, gregorianToBikramSambat } from '../engines/locationAtlas';
import { computeSamvatsaraFromBsYear } from '../data/yoginiNadiVarshaphalCodex';
import {
  DayTimelineBar,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
  SemanticTone,
  WorkspacePageHeader,
} from './ui/DashboardPrimitives';
import { SacredFlowerIcon } from './ui/FloralAnimations';
import {
  formatCityForLang,
  trDirection,
  trGowriName,
  trHoraiDisplay,
  trHoursRemaining,
  trNakNature,
  trNakshatra,
  trPaksha,
  trPlanet,
  trSign,
  trTithi,
  trVara,
  useLanguage,
} from '../i18n/i18n';

interface Props {
  panchang: PanchangReport;
  onInspectNakshatra?: (nakIdx: number) => void;
  onOpenActionSimulator?: () => void;
  onOpenHoraiStudio?: () => void;
}

type PanchangTab = 'HORAI_GOWRI' | 'CHOGHADIYA' | 'FIVE_ANGAS' | 'ALERTS';

export const PanchangDashboard: React.FC<Props> = ({
  panchang,
  onInspectNakshatra,
  onOpenActionSimulator,
  onOpenHoraiStudio,
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<PanchangTab>('HORAI_GOWRI');
  const [yr, mo, dy] = panchang.dateStr.split('-').map((n) => parseInt(n, 10));
  const bsDate = gregorianToBikramSambat(yr || 2026, mo || 10, dy || 25);
  const todaySamvatsara = computeSamvatsaraFromBsYear(bsDate.bsYear, lang);
  const cityLabel = formatCityForLang(panchang.location.name, lang);
  const activeHoraiLoc = trHoraiDisplay(panchang.activeHorai, lang);

  const choghadiyaTone = (nature: string): SemanticTone => {
    if (nature.includes('Most Auspicious')) return 'optimal';
    if (nature.includes('Auspicious') || nature.includes('Good')) return 'favorable';
    if (nature.includes('Neutral')) return 'neutral';
    return 'avoid';
  };

  return (
    <div className="space-y-6">
      {/* ==================== CLEAN HEADER BAR ==================== */}
      <WorkspacePageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2.5">
            <span>
              {t(
                `Daily Panchang & Nepali Patro — ${cityLabel}`,
                `दैनिक पञ्चाङ्ग र नेपाली पात्रो — ${cityLabel}`
              )}
            </span>
            <StatusBadge
              tone="info"
              label={lang === 'ne' ? bsDate.formattedNp : bsDate.formattedEn}
            />
            <StatusBadge tone="optimal" label={todaySamvatsara.fullTitle} />
          </span>
        }
        subtitle={
          lang === 'ne'
            ? `${trVara(panchang.vara.name, 'ne')} • इ.सं. ${panchang.dateStr} • सौर महिना: ${bsDate.bsMonthNp} • ${todaySamvatsara.vimsatiRuler} (${todaySamvatsara.qualityLabel}) • उचाइ ${panchang.location.elevationMeters}m`
            : `${panchang.vara.name} • Gregorian ${panchang.dateStr} • Solar Month: ${panchang.bikramSambat.monthName} • ${todaySamvatsara.vimsatiRuler} (${todaySamvatsara.qualityLabel}) • Elevation ${panchang.location.elevationMeters}m`
        }
        actions={
          <>
            <div className="obs-panel h-9 px-3.5 text-xs font-medium tabular-nums inline-flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">
                {t('Vedic Clock:', 'वैदिक घडी:')}
              </span>
              <span className="font-semibold text-[var(--text)]">
                {panchang.vedicClock.formatted}
              </span>
            </div>
            {onOpenActionSimulator && (
              <button
                type="button"
                onClick={onOpenActionSimulator}
                className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-[var(--accent)]" />
                <span>{t('Test Action Today', 'आजको शुभ साइत जाँच')}</span>
              </button>
            )}
          </>
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL KPI STAT CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label={t('Lunar Day (Tithi)', 'तिथि (चन्द्र दिन)')}
          value={trTithi(panchang.tithi.name, lang)}
          subvalue={trPaksha(panchang.tithi.paksha, lang)}
          plainHint={
            panchang.tithi.isRikta
              ? t(
                  'Good for clearing debts/clutter; wait on major new starts',
                  'पुरानो ऋण/सरसफाइका लागि उत्तम; नयाँ ठूलो कार्यमा प्रतीक्षा गर्नुहोस्'
                )
              : t(
                  'Supportive lunar phase for constructive daily work',
                  'नियमित र रचनात्मक कामका लागि सहयोगी तिथि'
                )
          }
          benchmarkText={`${trHoursRemaining(panchang.tithi.hoursRemaining, lang)} (${panchang.tithi.progressPercent}%)`}
          status={{
            tone: panchang.tithi.isRikta ? 'mixed' : 'favorable',
            label: panchang.tithi.isRikta
              ? t('Rikta (Caution)', 'रिक्ता (सावधानी)')
              : lang === 'ne'
              ? 'शुभ तिथि'
              : panchang.tithi.group.split(' ')[0],
          }}
          icon={<Calendar className="w-4 h-4" />}
        />

        <KpiStatCard
          label={t('Today’s Moon Star (Nakshatra)', 'आजको चन्द्र नक्षत्र')}
          value={trNakshatra(panchang.nakshatra.name, lang)}
          subvalue={`${t('Pada', 'चरण')} ${panchang.nakshatra.pada}`}
          plainHint={t(
            `Overall day temperament: ${panchang.nakshatra.natureGroup}`,
            `नक्षत्र स्वभाव: ${trNakNature(panchang.nakshatra.natureGroup, 'ne')}`
          )}
          benchmarkText={trHoursRemaining(panchang.nakshatra.hoursRemaining, lang)}
          status={{
            tone: 'info',
            label: trNakNature(panchang.nakshatra.natureGroup, lang, true),
          }}
          icon={<Sparkles className="w-4 h-4" />}
          actionLabel={
            onInspectNakshatra
              ? t('Read about this star', 'यस नक्षत्रको विवरण')
              : undefined
          }
          onAction={
            onInspectNakshatra ? () => onInspectNakshatra(panchang.nakshatra.zeroIndex) : undefined
          }
        />

        <KpiStatCard
          label={t('Your Star Harmony (Tarabala)', 'व्यक्तिगत ताराबल')}
          value={
            panchang.personalTarabala.isAuspicious
              ? t('Supportive', 'अनुकूल / शुभ')
              : t('Pace Carefully', 'संयमित गति')
          }
          subvalue={`${t('Tara', 'तारा')} #${panchang.personalTarabala.taraNumber}`}
          plainHint={t(
            'How today’s Moon harmonizes with your Birth Star',
            'तपाईंको जन्म नक्षत्रसँग आजको चन्द्रमाको तालमेल'
          )}
          benchmarkText={t(
            `Moon in House ${panchang.personalTarabala.chandrabalaHouse}`,
            `चन्द्रबल भाव ${panchang.personalTarabala.chandrabalaHouse}`
          )}
          status={{
            tone: panchang.personalTarabala.isChandrashtama
              ? 'avoid'
              : panchang.personalTarabala.isAuspicious
              ? 'optimal'
              : 'mixed',
            label: panchang.personalTarabala.isChandrashtama
              ? t('Moon in 8th (Rest)', 'चन्द्राष्टम (विश्राम)')
              : panchang.personalTarabala.isAuspicious
              ? t('Favorable', 'सहयोगी')
              : t('Use Best Hours', 'शुभ होरा रोज्नुहोस्'),
          }}
          icon={<Compass className="w-4 h-4" />}
        />

        <KpiStatCard
          label={t('Travel & Sky Caution', 'यात्रा र दिशाशूल')}
          value={t(
            `Avoid ${panchang.dishashoola.forbiddenDirection}`,
            `${trDirection(panchang.dishashoola.forbiddenDirection, 'ne')} दिशा परहेज`
          )}
          plainHint={t(
            'Direction with extra travel friction today',
            'आज यात्रामा अतिरिक्त अवरोध हुन सक्ने दिशा'
          )}
          benchmarkText={t(
            `Daylight: ${panchang.dinamanaHours}`,
            `दिनमान: ${panchang.dinamanaHours}`
          )}
          status={{
            tone: panchang.panchaka.isActive ? 'avoid' : 'favorable',
            label: panchang.panchaka.isActive
              ? t('Panchaka Active', 'पञ्चक सक्रिय')
              : t('Sky Clear', 'शुद्ध आकाश'),
          }}
          icon={<ShieldAlert className="w-4 h-4" />}
        />
      </div>

      {/* ==================== LIVE HORAI & NALLA NERAM FLORAL BANNER ==================== */}
      <div className="obs-card floral-banner-glow p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-sm">
            <SacredFlowerIcon
              variety={panchang.activeHorai.sacredFlower.variety}
              primaryHex={panchang.activeHorai.sacredFlower.primaryHex}
              secondaryHex={panchang.activeHorai.sacredFlower.secondaryHex}
              size={34}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {t('Active Horai Right Now', 'अहिले चलिरहेको प्रत्यक्ष होरा')}
              </span>
              <StatusBadge tone={panchang.activeHorai.tone} label={activeHoraiLoc.quality} />
              <span className="text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                {panchang.activeHorai.startTime}–{panchang.activeHorai.endTime} (
                {panchang.activeHorai.minutesRemaining}
                {t('m left', ' मिनेट बाँकी')})
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[var(--text)] mt-0.5">
              {activeHoraiLoc.horaiName} ({activeHoraiLoc.lordLabel}) •{' '}
              {t('Active Gowri:', 'सक्रिय गौरी:')} {trGowriName(panchang.activeGowri.name, lang)}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] tabular-nums">
              {t('Nalla Neram Today:', 'आजको शुभ अमृत समय (नल्ल नेरम):')}{' '}
              <strong>
                {panchang.nallaNeram[0].startTime}–{panchang.nallaNeram[0].endTime}
              </strong>{' '}
              &amp;{' '}
              <strong>
                {panchang.nallaNeram[1].startTime}–{panchang.nallaNeram[1].endTime}
              </strong>
            </p>
          </div>
        </div>

        {onOpenHoraiStudio && (
          <button
            type="button"
            onClick={onOpenHoraiStudio}
            className="btn-editorial-primary text-sm inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>{t('Open 24-Petal Horai Flower Clock', '२४-पत्र होरा कमल घडी खोल्नुहोस्')}</span>
          </button>
        )}
      </div>

      {/* ==================== ROW 2: VISUAL DAYLIGHT TIMELINE BAR ==================== */}
      <div className="obs-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">
              {t('Daylight Auspicious & Caution Windows', 'दिवाकालीन शुभ मुहूर्त र राहुकाल समयरेखा')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] tabular-nums">
              {t(
                `Proportional solar octants computed for ${cityLabel} (${formatCoordPair(panchang.location.latitude, panchang.location.longitude)})`,
                `${cityLabel} (${formatCoordPair(panchang.location.latitude, panchang.location.longitude)}) को सूर्योदय–सूर्यास्त अनुपात अनुसार गणना`
              )}
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {t('Chandra:', 'चन्द्र राशि:')} {trSign(panchang.moonSign, lang)} •{' '}
            {t('Surya:', 'सूर्य राशि:')} {trSign(panchang.sunSign, lang)}
          </span>
        </div>

        <DayTimelineBar
          sunriseTime={panchang.sunriseTime}
          sunsetTime={panchang.sunsetTime}
          windows={panchang.muhurats}
        />
      </div>

      {/* ==================== ROW 3: PROGRESSIVE DISCLOSURE DETAIL TABS ==================== */}
      <div className="obs-card p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <SegmentedTabs
            ariaLabel="Panchang detail sections"
            value={activeTab}
            onChange={setActiveTab}
            items={[
              {
                id: 'HORAI_GOWRI',
                label: t('24h Horai & Gowri Time', 'होरा र गौरी पञ्चाङ्गम्'),
                count: 24,
              },
              {
                id: 'CHOGHADIYA',
                label: t('Muhurats & 16 Choghadiyas', 'मुहूर्त र १६ चौघडिया'),
                count: panchang.muhurats.length,
              },
              {
                id: 'FIVE_ANGAS',
                label: t('Five Angas Breakdown', 'पञ्चाङ्गका ५ अङ्ग'),
                count: 5,
              },
              {
                id: 'ALERTS',
                label: t('Special Yogas, Panchaka & Remedies', 'विशेष योग, पञ्चक र उपाय'),
                count: panchang.specialYogas.length + 2,
              },
            ]}
          />
        </div>

        {/* TAB 0: 24-HOUR HORAI & GOWRI PANCHANGAM */}
        {activeTab === 'HORAI_GOWRI' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {t(
                    `Daytime 12 Horai Planetary Hours (${panchang.sunriseTime} – ${panchang.sunsetTime})`,
                    `दिवाकालीन १२ ग्रह होरा (${panchang.sunriseTime} – ${panchang.sunsetTime})`
                  )}
                </h3>
                {onOpenHoraiStudio && (
                  <button
                    type="button"
                    onClick={onOpenHoraiStudio}
                    className="text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    {t(
                      'Interactive Night Horai + Flower Wheel →',
                      'रात्रि होरा र २४-पत्र कमल चक्र हेर्नुहोस् →'
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {panchang.dayHorai.map((h) => {
                  const hLoc = trHoraiDisplay(h, lang);
                  return (
                    <div
                      key={h.slotNumber}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                        h.isActiveNow
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)] ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface-muted)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <SacredFlowerIcon
                          variety={h.sacredFlower.variety}
                          primaryHex={h.sacredFlower.primaryHex}
                          secondaryHex={h.sacredFlower.secondaryHex}
                          size={24}
                          animated={h.isActiveNow}
                        />
                        <div>
                          <div className="text-sm font-bold text-[var(--text)]">
                            {hLoc.horaiName}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {hLoc.quality}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap">
                        {h.startTime}–{h.endTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                {t('Day Gowri Panchangam (8 Solar Octants)', 'दिवा गौरी पञ्चाङ्गम् (८ सौर खण्ड)')}
              </h3>
              <div className="space-y-2">
                {panchang.dayGowri.map((g) => (
                  <div
                    key={g.slotIndex}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      g.isActiveNow
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">
                          {trGowriName(g.name, lang)}
                        </span>
                        <StatusBadge tone={g.tone} label={g.nature} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {g.plainMeaning}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[var(--text)] whitespace-nowrap">
                      {g.startTime}–{g.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MUHURATS & CHOGHADIYA */}
        {activeTab === 'CHOGHADIYA' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Key Muhurat Slots */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                {t('Key Solar & Lunar Muhurat Windows', 'प्रमुख सौर र चन्द्र मुहूर्त समय')}
              </h3>
              <div className="space-y-2.5">
                {panchang.muhurats.map((m) => (
                  <div
                    key={m.name}
                    className="obs-panel p-3.5 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">{m.name}</span>
                        <StatusBadge
                          tone={
                            m.category === 'Auspicious'
                              ? 'optimal'
                              : m.category === 'Inauspicious'
                              ? 'avoid'
                              : 'info'
                          }
                          label={
                            m.category === 'Auspicious'
                              ? t('Auspicious', 'शुभ')
                              : m.category === 'Inauspicious'
                              ? t('Inauspicious', 'अशुभ / त्याज्य')
                              : m.category
                          }
                        />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[var(--text)] whitespace-nowrap bg-[var(--surface)] px-2.5 py-1 rounded border border-[var(--border)]">
                      {m.startTime}–{m.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day & Night Choghadiya */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {t(
                    `Day Choghadiya (${panchang.sunriseTime} – ${panchang.sunsetTime})`,
                    `दिवा चौघडिया (${panchang.sunriseTime} – ${panchang.sunsetTime})`
                  )}
                </h3>
                <div className="space-y-1.5">
                  {panchang.dayChoghadiya.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                        c.isActiveNow
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                          : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={choghadiyaTone(c.nature)} label={c.name} />
                        <span className="text-[var(--text-secondary)]">
                          {trPlanet(c.ruler, lang)}
                        </span>
                      </div>
                      <span className="font-mono text-[var(--text)] font-medium">
                        {c.startTime}–{c.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {t('Night Choghadiya (Sunset – Next Sunrise)', 'रात्रि चौघडिया (सूर्यास्त – अर्को सूर्योदय)')}
                </h3>
                <div className="space-y-1.5">
                  {panchang.nightChoghadiya.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                        c.isActiveNow
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                          : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={choghadiyaTone(c.nature)} label={c.name} />
                        <span className="text-[var(--text-secondary)]">
                          {trPlanet(c.ruler, lang)}
                        </span>
                      </div>
                      <span className="font-mono text-[var(--text)] font-medium">
                        {c.startTime}–{c.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIVE ANGAS */}
        {activeTab === 'FIVE_ANGAS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {t('1. Tithi (Lunar Day)', '१. तिथि')}
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.tithi.name}</div>
                <div className="text-xs text-[var(--accent)] font-medium">{panchang.tithi.paksha}</div>
                <div className="text-xs text-[var(--text-secondary)]">{panchang.tithi.group}</div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${panchang.tithi.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{panchang.tithi.progressPercent}%</span>
                  <span>{panchang.tithi.hoursRemaining}</span>
                </div>
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {t('2. Nakshatra', '२. नक्षत्र')}
                </div>
                <div className="text-lg font-bold text-[var(--text)]">
                  {trNakshatra(panchang.nakshatra.name, lang)} ({t('P', 'चरण ')}
                  {panchang.nakshatra.pada})
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t('Lord:', 'स्वामी:')} {trPlanet(panchang.nakshatra.ruler, lang)} •{' '}
                  {panchang.nakshatra.natureGroup}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {panchang.nakshatra.mukhaGaze}
                </div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--sage)]"
                    style={{ width: `${panchang.nakshatra.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{panchang.nakshatra.progressPercent}%</span>
                  <span>{panchang.nakshatra.hoursRemaining}</span>
                </div>
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {t('3. Nitya Yoga', '३. नित्य योग')}
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.yoga.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t(`Yoga #${panchang.yoga.index} of 27`, `योग #${panchang.yoga.index} / २७`)}
                </div>
                <StatusBadge
                  tone={panchang.yoga.isMaleficYoga ? 'mixed' : 'favorable'}
                  label={
                    panchang.yoga.isMaleficYoga
                      ? t('Sharp / Caution', 'तीक्ष्ण / सावधानी')
                      : t('Benefic Yoga', 'शुभ योग')
                  }
                />
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {panchang.yoga.progressPercent}% {t('elapsed', 'पूरा')}
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {t('4. Karana (Half-Tithi)', '४. करण (अर्ध-तिथि)')}
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.karana.name}</div>
                <StatusBadge
                  tone={panchang.karana.isBhadraVishti ? 'avoid' : 'favorable'}
                  label={
                    panchang.karana.isBhadraVishti
                      ? t('Vishti Bhadra', 'भद्रा (विष्टि)')
                      : panchang.karana.nature
                  }
                />
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {t('Daylight:', 'दिनमान:')} {panchang.dinamanaHours}
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {t('5. Vara (Solar Day)', '५. वार (सौर दिन)')}
                </div>
                <div className="text-lg font-bold text-[var(--text)]">
                  {trVara(panchang.vara.name, lang)}
                </div>
                <div className="text-xs text-[var(--accent)] font-medium">
                  {t('Ruler:', 'स्वामी:')} {trPlanet(panchang.vara.lord, lang)}
                </div>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {t('Moon:', 'चन्द्र राशि:')} {trSign(panchang.moonSign, lang)}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPECIAL YOGAS, TARABALA VERDICT, PANCHAKA & DISHASHOOLA REMEDY */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-4">
            {/* Personal Tarabala Full Verdict */}
            <div className="obs-panel p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="text-base font-bold text-[var(--text)]">
                  {t(
                    `Personal Star Harmony Verdict: Tara #${panchang.personalTarabala.taraNumber} (${panchang.personalTarabala.taraName})`,
                    `व्यक्तिगत ताराबल निर्णय: तारा #${panchang.personalTarabala.taraNumber} (${panchang.personalTarabala.taraName})`
                  )}
                </div>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {panchang.personalTarabala.verdict}
                </p>
              </div>
              <StatusBadge
                tone={panchang.personalTarabala.isAuspicious ? 'optimal' : 'mixed'}
                label={
                  panchang.personalTarabala.isAuspicious
                    ? t('Supportive Today', 'आज अनुकूल')
                    : t('Use Best Hours', 'शुभ होरा छान्नुहोस्')
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Special Vara-Nakshatra Yogas */}
              <div className="obs-panel p-4 space-y-2.5">
                <div className="text-xs font-bold text-[var(--text)]">
                  {t('Vara-Nakshatra Special Yogas', 'वार-नक्षत्र विशेष योग')}
                </div>
                {panchang.specialYogas.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t(
                      'No rare Vara-Nakshatra Siddhi or Dagdha conjunctions are active today; rely on primary Tithi, Tarabala, and Choghadiya windows.',
                      'आज कुनै विशेष सिद्धि वा दग्ध योग सक्रिय छैन; मुख्य तिथि, ताराबल र शुभ होराका आधारमा कार्य अघि बढाउनुहोस्।'
                    )}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {panchang.specialYogas.map((sy, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-md bg-[var(--surface)] border border-[var(--border)] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--text)]">{sy.name}</span>
                          <StatusBadge
                            tone={
                              sy.nature === 'Inauspicious'
                                ? 'avoid'
                                : sy.nature === 'Multiplier'
                                ? 'info'
                                : 'optimal'
                            }
                            label={sy.nature}
                          />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {sy.consequence}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dhanishtha Panchaka */}
              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--text)]">
                    {t('Dhanishtha Panchaka Rule', 'धनिष्ठा पञ्चक नियम')}
                  </span>
                  <StatusBadge
                    tone={panchang.panchaka.isActive ? 'avoid' : 'optimal'}
                    label={
                      panchang.panchaka.isActive
                        ? t('Active', 'सक्रिय')
                        : t('Clear', 'शुद्ध')
                    }
                  />
                </div>
                <div className="text-sm font-semibold text-[var(--text)]">
                  {panchang.panchaka.type}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {panchang.panchaka.consequence}
                </p>
              </div>

              {/* Dishashoola & Remedy */}
              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--text)]">
                    {t('Dishashoola Travel Rule', 'दिशाशूल यात्रा नियम')}
                  </span>
                  <StatusBadge
                    tone="mixed"
                    label={t(
                      `Avoid ${panchang.dishashoola.forbiddenDirection}`,
                      `${panchang.dishashoola.forbiddenDirection} परहेज`
                    )}
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {panchang.dishashoola.consequenceIfIgnored}
                </p>
                <div className="pt-2 border-t border-[var(--border)] flex items-start gap-2 text-xs text-[var(--text)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0 mt-0.5" />
                  <span>
                    <strong>{t('Parihara:', 'परिहार उपाय:')}</strong>{' '}
                    {panchang.dishashoola.pariharaRemedy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
