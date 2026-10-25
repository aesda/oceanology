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
import { cleanCityName, gregorianToBikramSambat } from '../engines/locationAtlas';
import {
  DayTimelineBar,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
  SemanticTone,
  WorkspacePageHeader,
} from './ui/DashboardPrimitives';
import { SacredFlowerIcon } from './ui/FloralAnimations';

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
  const [activeTab, setActiveTab] = useState<PanchangTab>('HORAI_GOWRI');
  const [yr, mo, dy] = panchang.dateStr.split('-').map((n) => parseInt(n, 10));
  const bsDate = gregorianToBikramSambat(yr || 2026, mo || 10, dy || 25);

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
            <span>Daily Panchang &amp; Nepali Patro — {cleanCityName(panchang.location.name)}</span>
            <StatusBadge tone="info" label={`${bsDate.formattedEn} (${bsDate.formattedNp})`} />
          </span>
        }
        subtitle={`${panchang.vara.name} • Gregorian ${panchang.dateStr} • Solar Month: ${panchang.bikramSambat.monthName} • Elevation ${panchang.location.elevationMeters}m`}
        actions={
          <>
            <div className="obs-panel h-10 px-3.5 text-xs font-medium tabular-nums inline-flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">Vedic Clock:</span>
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
                <span>Test Action Today</span>
              </button>
            )}
          </>
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL KPI STAT CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label="Lunar Day (Tithi)"
          value={panchang.tithi.name}
          subvalue={panchang.tithi.paksha.split(' ')[0]}
          plainHint={
            panchang.tithi.isRikta
              ? 'Good for clearing debts/clutter; wait on major new starts'
              : 'Supportive lunar phase for constructive daily work'
          }
          benchmarkText={`${panchang.tithi.hoursRemaining} remaining (${panchang.tithi.progressPercent}%)`}
          status={{
            tone: panchang.tithi.isRikta ? 'mixed' : 'favorable',
            label: panchang.tithi.isRikta ? 'Rikta (Caution)' : panchang.tithi.group.split(' ')[0],
          }}
          icon={<Calendar className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Today’s Moon Star (Nakshatra)"
          value={panchang.nakshatra.name}
          subvalue={`Pada ${panchang.nakshatra.pada}`}
          plainHint={`Overall day temperament: ${panchang.nakshatra.natureGroup}`}
          benchmarkText={`${panchang.nakshatra.hoursRemaining} remaining`}
          status={{
            tone: 'info',
            label: panchang.nakshatra.natureGroup.split(' ')[0],
          }}
          icon={<Sparkles className="w-4 h-4" />}
          actionLabel={onInspectNakshatra ? 'Read about this star' : undefined}
          onAction={
            onInspectNakshatra ? () => onInspectNakshatra(panchang.nakshatra.zeroIndex) : undefined
          }
        />

        <KpiStatCard
          label="Your Star Harmony (Tarabala)"
          value={panchang.personalTarabala.isAuspicious ? 'Supportive' : 'Pace Carefully'}
          subvalue={`Tara #${panchang.personalTarabala.taraNumber}`}
          plainHint="How today’s Moon harmonizes with your Birth Star"
          benchmarkText={`Moon in House ${panchang.personalTarabala.chandrabalaHouse}`}
          status={{
            tone: panchang.personalTarabala.isChandrashtama
              ? 'avoid'
              : panchang.personalTarabala.isAuspicious
              ? 'optimal'
              : 'mixed',
            label: panchang.personalTarabala.isChandrashtama
              ? 'Moon in 8th (Rest)'
              : panchang.personalTarabala.isAuspicious
              ? 'Favorable'
              : 'Use Best Hours',
          }}
          icon={<Compass className="w-4 h-4" />}
        />

        <KpiStatCard
          label="Travel & Sky Caution"
          value={`Avoid ${panchang.dishashoola.forbiddenDirection}`}
          plainHint="Direction with extra travel friction today"
          benchmarkText={`Daylight: ${panchang.dinamanaHours}`}
          status={{
            tone: panchang.panchaka.isActive ? 'avoid' : 'favorable',
            label: panchang.panchaka.isActive ? 'Panchaka Active' : 'Sky Clear',
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
                Active Horai Right Now
              </span>
              <StatusBadge tone={panchang.activeHorai.tone} label={panchang.activeHorai.quality} />
              <span className="text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                {panchang.activeHorai.startTime}–{panchang.activeHorai.endTime} (
                {panchang.activeHorai.minutesRemaining}m left)
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[var(--text)] mt-0.5">
              {panchang.activeHorai.horaiName} ({panchang.activeHorai.lord}) • Active Gowri:{' '}
              {panchang.activeGowri.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] tabular-nums">
              Nalla Neram Today: <strong>{panchang.nallaNeram[0].startTime}–{panchang.nallaNeram[0].endTime}</strong>{' '}
              &amp; <strong>{panchang.nallaNeram[1].startTime}–{panchang.nallaNeram[1].endTime}</strong>
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
            <span>Open 24-Petal Horai Flower Clock</span>
          </button>
        )}
      </div>

      {/* ==================== ROW 2: VISUAL DAYLIGHT TIMELINE BAR ==================== */}
      <div className="obs-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">
              Daylight Auspicious &amp; Caution Windows
            </h2>
            <p className="text-xs text-[var(--text-muted)] tabular-nums">
              Proportional solar octants computed for {cleanCityName(panchang.location.name)} (
              {panchang.location.latitude.toFixed(2)}°N, {panchang.location.longitude.toFixed(2)}°E)
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Chandra: {panchang.moonSign} • Surya: {panchang.sunSign}
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
                label: '24h Horai & Gowri Time',
                count: 24,
              },
              {
                id: 'CHOGHADIYA',
                label: 'Muhurats & 16 Choghadiyas',
                count: panchang.muhurats.length,
              },
              {
                id: 'FIVE_ANGAS',
                label: 'Five Angas Breakdown',
                count: 5,
              },
              {
                id: 'ALERTS',
                label: 'Special Yogas, Panchaka & Remedies',
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
                  Daytime 12 Horai Planetary Hours ({panchang.sunriseTime} – {panchang.sunsetTime})
                </h3>
                {onOpenHoraiStudio && (
                  <button
                    type="button"
                    onClick={onOpenHoraiStudio}
                    className="text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    Interactive Night Horai + Flower Wheel →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {panchang.dayHorai.map((h) => (
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
                          {h.horaiName}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {h.quality}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap">
                      {h.startTime}–{h.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                Day Gowri Panchangam (8 Solar Octants)
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
                          {g.name} ({g.tamilLabel})
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
                Key Solar &amp; Lunar Muhurat Windows
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
                          label={m.category}
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
                  Day Choghadiya ({panchang.sunriseTime} – {panchang.sunsetTime})
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
                        <span className="text-[var(--text-secondary)]">{c.ruler}</span>
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
                  Night Choghadiya (Sunset – Next Sunrise)
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
                        <span className="text-[var(--text-secondary)]">{c.ruler}</span>
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
                <div className="text-xs font-medium text-[var(--text-muted)]">1. Tithi (Lunar Day)</div>
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
                <div className="text-xs font-medium text-[var(--text-muted)]">2. Nakshatra</div>
                <div className="text-lg font-bold text-[var(--text)]">
                  {panchang.nakshatra.name} (P{panchang.nakshatra.pada})
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Lord: {panchang.nakshatra.ruler} • {panchang.nakshatra.natureGroup}
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
                <div className="text-xs font-medium text-[var(--text-muted)]">3. Nitya Yoga</div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.yoga.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Yoga #{panchang.yoga.index} of 27
                </div>
                <StatusBadge
                  tone={panchang.yoga.isMaleficYoga ? 'mixed' : 'favorable'}
                  label={panchang.yoga.isMaleficYoga ? 'Sharp / Caution' : 'Benefic Yoga'}
                />
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {panchang.yoga.progressPercent}% elapsed
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  4. Karana (Half-Tithi)
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.karana.name}</div>
                <StatusBadge
                  tone={panchang.karana.isBhadraVishti ? 'avoid' : 'favorable'}
                  label={panchang.karana.isBhadraVishti ? 'Vishti Bhadra' : panchang.karana.nature}
                />
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                Daylight: {panchang.dinamanaHours}
              </div>
            </div>

            <div className="obs-panel p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-muted)]">5. Vara (Solar Day)</div>
                <div className="text-lg font-bold text-[var(--text)]">{panchang.vara.name}</div>
                <div className="text-xs text-[var(--accent)] font-medium">
                  Ruler: {panchang.vara.lord}
                </div>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                Moon: {panchang.moonSign}
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
                  Personal Star Harmony Verdict: Tara #{panchang.personalTarabala.taraNumber} (
                  {panchang.personalTarabala.taraName})
                </div>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {panchang.personalTarabala.verdict}
                </p>
              </div>
              <StatusBadge
                tone={panchang.personalTarabala.isAuspicious ? 'optimal' : 'mixed'}
                label={
                  panchang.personalTarabala.isAuspicious ? 'Supportive Today' : 'Use Best Hours'
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Special Vara-Nakshatra Yogas */}
              <div className="obs-panel p-4 space-y-2.5">
                <div className="text-xs font-bold text-[var(--text)]">
                  Vara-Nakshatra Special Yogas
                </div>
                {panchang.specialYogas.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    No rare Vara-Nakshatra Siddhi or Dagdha conjunctions are active today; rely on
                    primary Tithi, Tarabala, and Choghadiya windows.
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
                    Dhanishtha Panchaka Rule
                  </span>
                  <StatusBadge
                    tone={panchang.panchaka.isActive ? 'avoid' : 'optimal'}
                    label={panchang.panchaka.isActive ? 'Active' : 'Clear'}
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
                    Dishashoola Travel Rule
                  </span>
                  <StatusBadge
                    tone="mixed"
                    label={`Avoid ${panchang.dishashoola.forbiddenDirection}`}
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {panchang.dishashoola.consequenceIfIgnored}
                </p>
                <div className="pt-2 border-t border-[var(--border)] flex items-start gap-2 text-xs text-[var(--text)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0 mt-0.5" />
                  <span>
                    <strong>Parihara:</strong> {panchang.dishashoola.pariharaRemedy}
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
