import React, { useState } from 'react';
import { HeartHandshake, Sparkles, Compass, Search } from 'lucide-react';
import { NatalChartResult, searchEphemerisEvents } from '../engines/astronomyEngine';
import { calculateAshtakootaMatch } from '../engines/vedicEngine';
import { BirthProfile } from '../types/oceanology';
import { NatalWheelSvg } from './NatalWheelSvg';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import {
  EmptyStateCard,
  KpiStatCard,
  SegmentedTabs,
  StatusBadge,
  WorkspacePageHeader,
} from './ui/DashboardPrimitives';

interface Props {
  primaryProfile: BirthProfile;
  primaryChart: NatalChartResult;
  partnerProfile: BirthProfile;
  partnerChart: NatalChartResult;
  onPartnerChange: (updated: BirthProfile) => void;
}

type SynastrySubView = 'SYNASTRY_MILAN' | 'EPHEMERIS_SEARCH';

export const ResearchAndSynastryLab: React.FC<Props> = ({
  primaryProfile,
  primaryChart,
  partnerProfile,
  partnerChart,
  onPartnerChange,
}) => {
  const [subView, setSubView] = useState<SynastrySubView>('SYNASTRY_MILAN');
  const [searchYear, setSearchYear] = useState(new Date().getFullYear());
  const [filterPlanet, setFilterPlanet] = useState('ALL');

  const matchReport = calculateAshtakootaMatch(primaryChart, partnerChart);
  const ephemerisHits = searchEphemerisEvents(searchYear, filterPlanet);

  const moonA = primaryChart.planets.find((p) => p.id === 'Moon') || primaryChart.planets[0];
  const moonB = partnerChart.planets.find((p) => p.id === 'Moon') || partnerChart.planets[0];

  return (
    <div className="space-y-6">
      {/* ==================== CLEAN HEADER & SUB-VIEW SWITCHER ==================== */}
      <WorkspacePageHeader
        title="Compatibility & Ephemeris Aspect Finder"
        subtitle="36-Guna Ashtakoota matchmaking, bi-wheel synastry aspects, and multi-century planetary aspect search."
        actions={
          <SegmentedTabs
            ariaLabel="Compatibility or ephemeris mode"
            value={subView}
            onChange={setSubView}
            items={[
              { id: 'SYNASTRY_MILAN', label: '36-Guna & Bi-Wheel' },
              {
                id: 'EPHEMERIS_SEARCH',
                label: 'Ephemeris Aspect Finder',
                count: ephemerisHits.length,
              },
            ]}
          />
        }
      />

      {/* ==================== SUB-VIEW 1: SYNASTRY & 36-GUNA MILAN ==================== */}
      {subView === 'SYNASTRY_MILAN' && (
        <div className="space-y-6">
          {/* Row 1: 4 Contextual KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiStatCard
              label="Ashtakoota Guna Score"
              value={`${matchReport.totalPoints} / 36`}
              subvalue={`${matchReport.percentage}%`}
              benchmarkText="18+ pts classical threshold"
              status={{
                tone:
                  matchReport.totalPoints >= 25
                    ? 'optimal'
                    : matchReport.totalPoints >= 18
                    ? 'favorable'
                    : 'mixed',
                label:
                  matchReport.totalPoints >= 25
                    ? 'Strong Match'
                    : matchReport.totalPoints >= 18
                    ? 'Compatible'
                    : 'Review Remedies',
              }}
              icon={<HeartHandshake className="w-4 h-4" />}
            />

            <KpiStatCard
              label="Match Verdict"
              value={matchReport.verdict.split('(')[0].trim()}
              benchmarkText={`${primaryProfile.firstName} & ${partnerProfile.firstName}`}
              status={{ tone: 'info', label: '8 Kootas' }}
              icon={<Sparkles className="w-4 h-4" />}
            />

            <KpiStatCard
              label="Kuja / Manglik Balance"
              value={matchReport.manglikStatus.split('(')[0].trim()}
              benchmarkText="Mars 1/2/4/7/8/12 check"
              status={{
                tone: matchReport.manglikStatus.toLowerCase().includes('balanced')
                  ? 'optimal'
                  : 'mixed',
                label: 'Dosha Check',
              }}
              icon={<Compass className="w-4 h-4" />}
            />

            <KpiStatCard
              label="Moon Nakshatra Pair"
              value={moonA.nakshatraName}
              subvalue={`↔ ${moonB.nakshatraName}`}
              benchmarkText={`${moonA.signName} ↔ ${moonB.signName}`}
              status={{ tone: 'neutral', label: 'Janma Stars' }}
            />
          </div>

          {/* Partner Birth Profile Control Card */}
          <div className="obs-card p-5 space-y-4">
            <div className="text-xs font-bold text-[var(--text)]">
              Partner Birth Profile ({partnerProfile.firstName})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 font-medium">
                  Partner first name
                </label>
                <input
                  type="text"
                  value={partnerProfile.firstName}
                  onChange={(e) =>
                    onPartnerChange({ ...partnerProfile, firstName: e.target.value })
                  }
                  className="w-full obs-input"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 font-medium">
                  Birth year
                </label>
                <input
                  type="number"
                  value={partnerProfile.year}
                  onChange={(e) =>
                    onPartnerChange({
                      ...partnerProfile,
                      year: parseInt(e.target.value, 10) || 1995,
                    })
                  }
                  className="w-full obs-input font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 font-medium">
                  Birth month (1–12)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={partnerProfile.month}
                  onChange={(e) =>
                    onPartnerChange({
                      ...partnerProfile,
                      month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
                    })
                  }
                  className="w-full obs-input font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 font-medium">
                  Birth day (1–31)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={partnerProfile.day}
                  onChange={(e) =>
                    onPartnerChange({
                      ...partnerProfile,
                      day: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)),
                    })
                  }
                  className="w-full obs-input font-mono"
                />
              </div>
            </div>

            <GlobalLocationPicker
              label="Partner birth city (Nepal & global)"
              value={partnerProfile.location}
              onChange={(loc) => onPartnerChange({ ...partnerProfile, location: loc })}
            />
          </div>

          {/* Bi-Wheel + 8-Koota Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 obs-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)]">
                  Bi-Wheel Synastry ({primaryProfile.firstName} Outer • {partnerProfile.firstName}{' '}
                  Inner)
                </span>
                <StatusBadge tone="info" label="Ecliptic Overlay" />
              </div>
              <NatalWheelSvg chart={primaryChart} partnerChart={partnerChart} showBiWheel={true} />
            </div>

            <div className="lg:col-span-6 obs-card p-5 space-y-3">
              <h2 className="text-base font-bold text-[var(--text)]">
                8-Koota Ashtakoota Breakdown
              </h2>
              <div className="space-y-2.5">
                {matchReport.kootas.map((k) => {
                  const ratio = k.maxPoints > 0 ? k.scoredPoints / k.maxPoints : 1;
                  return (
                    <div key={k.name} className="obs-panel p-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-[var(--text)]">
                            {k.name} ({k.sanskrit})
                          </span>{' '}
                          <span className="text-[var(--text-muted)]">— {k.domain}</span>
                        </div>
                        <StatusBadge
                          tone={ratio >= 0.7 ? 'optimal' : ratio >= 0.4 ? 'mixed' : 'avoid'}
                          label={`${k.scoredPoints} / ${k.maxPoints} pts`}
                        />
                      </div>
                      <div className="text-[var(--text-secondary)]">
                        {primaryProfile.firstName}: <strong>{k.personAValue}</strong> •{' '}
                        {partnerProfile.firstName}: <strong>{k.personBValue}</strong>
                      </div>
                      <p className="text-[var(--text-muted)] leading-relaxed">{k.summary}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-VIEW 2: EPHEMERIS ASPECT SEARCH ENGINE ==================== */}
      {subView === 'EPHEMERIS_SEARCH' && (
        <div className="obs-card p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  Planetary Aspect &amp; Ingress Finder
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Scan exact geocentric planetary aspects across any calendar year
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label htmlFor="eph-year-input" className="text-[var(--text-secondary)] font-medium">
                Year:
              </label>
              <input
                id="eph-year-input"
                type="number"
                value={searchYear}
                onChange={(e) => setSearchYear(parseInt(e.target.value, 10) || 2026)}
                className="w-24 obs-input font-mono"
              />
              <select
                aria-label="Filter planet"
                value={filterPlanet}
                onChange={(e) => setFilterPlanet(e.target.value)}
                className="obs-input"
              >
                <option value="ALL">All Major Planets</option>
                <option value="Sun">Sun Aspects</option>
                <option value="Venus">Venus Aspects</option>
                <option value="Mars">Mars Aspects</option>
                <option value="Jupiter">Jupiter Aspects</option>
                <option value="Saturn">Saturn Aspects</option>
              </select>
            </div>
          </div>

          {ephemerisHits.length === 0 ? (
            <EmptyStateCard
              title="No aspects matched this filter"
              description="Try selecting All Major Planets or testing a nearby calendar year."
              actionLabel="Reset filter"
              onAction={() => {
                setFilterPlanet('ALL');
                setSearchYear(new Date().getFullYear());
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {ephemerisHits.map((hit, i) => (
                <div
                  key={i}
                  className="obs-panel p-3.5 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-[var(--text)]">
                      {hit.planetA}{' '}
                      <span className="text-[var(--accent)]">{hit.aspectSymbol}</span>{' '}
                      {hit.planetB}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {hit.aspectName} in {hit.signName} ({hit.exactDegree})
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-[var(--surface)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text)]">
                    {hit.dateStr}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
