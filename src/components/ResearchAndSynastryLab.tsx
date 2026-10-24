import React, { useState } from 'react';
import { NatalChartResult, searchEphemerisEvents } from '../engines/astronomyEngine';
import { calculateAshtakootaMatch } from '../engines/vedicEngine';
import { BirthProfile } from '../types/oceanology';
import { NatalWheelSvg } from './NatalWheelSvg';
import { GlobalLocationPicker } from './GlobalLocationPicker';

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

  return (
    <div className="space-y-6">
      {/* Top Bar with Sub-View Switcher */}
      <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
            Astro-Seek Bi-Wheel Synastry + AstroSage 36-Guna Ashtakoota Milan
          </span>
          <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
            Relationship Compatibility &amp; Multi-Century Ephemeris Search
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setSubView('SYNASTRY_MILAN')}
            className={`px-3.5 py-1.5 rounded font-semibold transition ${
              subView === 'SYNASTRY_MILAN'
                ? 'obs-badge-brass shadow-sm'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            1. Bi-Wheel Synastry &amp; 36-Guna Milan
          </button>
          <button
            onClick={() => setSubView('EPHEMERIS_SEARCH')}
            className={`px-3.5 py-1.5 rounded font-semibold transition ${
              subView === 'EPHEMERIS_SEARCH'
                ? 'obs-badge-brass shadow-sm'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            2. Ephemeris Aspect &amp; Ingress Finder
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: SYNASTRY & 36-GUNA ASHTAKOOTA MILAN */}
      {subView === 'SYNASTRY_MILAN' && (
        <div className="obs-card p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                {primaryProfile.firstName} &amp; {partnerProfile.firstName} — Vedic Ashtakoota &amp; Western Synastry
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Evaluating Lunar Nakshatra 8-Koota harmony alongside Kuja (Manglik) Dosha and ecliptic bi-wheel aspects.
              </p>
            </div>

            <div className="flex items-center gap-3 obs-panel px-4 py-2">
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">Ashtakoota Guna Score</div>
                <div className="text-xl font-serif font-bold text-[var(--brass)]">
                  {matchReport.totalPoints} / 36 ({matchReport.percentage}%)
                </div>
              </div>
              <span className="px-3 py-1 rounded obs-badge-sage text-xs font-semibold">
                {matchReport.verdict.split('(')[0].trim()}
              </span>
            </div>
          </div>

          {/* Partner Profile Editor with Global & Nepal Location Picker */}
          <div className="obs-panel p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-medium">Partner First Name</label>
                <input
                  type="text"
                  value={partnerProfile.firstName}
                  onChange={e => onPartnerChange({ ...partnerProfile, firstName: e.target.value })}
                  className="w-full obs-input"
                />
              </div>
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-medium">Partner Birth Year</label>
                <input
                  type="number"
                  value={partnerProfile.year}
                  onChange={e => onPartnerChange({ ...partnerProfile, year: parseInt(e.target.value, 10) || 1995 })}
                  className="w-full obs-input font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-medium">Birth Month (1–12)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={partnerProfile.month}
                  onChange={e =>
                    onPartnerChange({
                      ...partnerProfile,
                      month: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
                    })
                  }
                  className="w-full obs-input font-mono"
                />
              </div>
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-medium">Birth Day (1–31)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={partnerProfile.day}
                  onChange={e =>
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
              label="Partner Birth Location (Nepal & Worldwide)"
              value={partnerProfile.location}
              onChange={loc => onPartnerChange({ ...partnerProfile, location: loc })}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <div className="text-xs text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                <span>
                  Outer Ring: <strong>{primaryProfile.firstName}</strong> • Inner Ring:{' '}
                  <strong className="text-[var(--crimson)]">{partnerProfile.firstName}</strong>
                </span>
                <span className="font-mono text-[var(--brass)]">{matchReport.manglikStatus.split('(')[0]}</span>
              </div>
              <NatalWheelSvg chart={primaryChart} partnerChart={partnerChart} showBiWheel={true} />
            </div>

            <div className="space-y-2.5">
              <h4 className="text-lg font-serif font-bold text-[var(--text)] mb-2">
                8-Koota Ashtakoota Breakdown ({primaryProfile.firstName} &amp; {partnerProfile.firstName})
              </h4>
              {matchReport.kootas.map(k => (
                <div key={k.name} className="obs-panel p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[var(--text)]">
                        {k.name} ({k.sanskrit})
                      </span>{' '}
                      <span className="text-[var(--text-muted)]">— {k.domain}</span>
                    </div>
                    <span className="font-mono font-bold text-[var(--brass)]">
                      {k.scoredPoints} / {k.maxPoints} pts
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    {primaryProfile.firstName}: <strong>{k.personAValue}</strong> • {partnerProfile.firstName}:{' '}
                    <strong>{k.personBValue}</strong>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{k.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: EPHEMERIS ASPECT SEARCH ENGINE */}
      {subView === 'EPHEMERIS_SEARCH' && (
        <div className="obs-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                Astro-Seek Ephemeris &amp; Aspect Search Engine
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                Multi-Century Planetary Aspect &amp; Ingress Finder
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-[var(--text-secondary)]">Year:</label>
              <input
                type="number"
                value={searchYear}
                onChange={e => setSearchYear(parseInt(e.target.value, 10) || 2026)}
                className="w-24 obs-input font-mono"
              />
              <select
                value={filterPlanet}
                onChange={e => setFilterPlanet(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {ephemerisHits.map((hit, i) => (
              <div key={i} className="obs-panel px-3.5 py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text)]">
                    {hit.planetA} <span className="text-[var(--brass)]">{hit.aspectSymbol}</span> {hit.planetB}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {hit.aspectName} in {hit.signName} ({hit.exactDegree})
                  </div>
                </div>
                <span className="font-mono text-xs obs-badge-brass px-2 py-0.5 rounded">
                  {hit.dateStr}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
