import React, { useState } from 'react';
import { PanchangReport } from '../engines/panchangEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';

interface Props {
  panchang: PanchangReport;
}

type PanchangSubView = 'FIVE_ANGAS' | 'MUHURAT_CHOGHADIYA';

export const PanchangDashboard: React.FC<Props> = ({ panchang }) => {
  const [subView, setSubView] = useState<PanchangSubView>('FIVE_ANGAS');
  const [yr, mo, dy] = panchang.dateStr.split('-').map(n => parseInt(n, 10));
  const bsDate = gregorianToBikramSambat(yr || 2026, mo || 10, dy || 24);

  return (
    <div className="space-y-6">
      {/* Observatory Header with Nepali Patro (Bikram Sambat) & Elevation-Aware Sunrise */}
      <div className="obs-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
              <span>Drik Siddhanta &amp; Nepali Patro (नेपाली पात्रो)</span>
              <span>•</span>
              <span className="font-mono obs-badge-brass px-2 py-0.5 rounded">
                {bsDate.formattedEn} ({bsDate.formattedNp})
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
              Daily Panchang, Muhurat &amp; Choghadiya — {panchang.location.name}, {panchang.location.country}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              Coordinates: {panchang.location.latitude.toFixed(4)}°N, {panchang.location.longitude.toFixed(4)}°E • Altitude: {panchang.location.elevationMeters}m • Gregorian: {panchang.dateStr}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="obs-panel px-4 py-2 text-xs">
              <div className="text-[var(--text-muted)]">Local Sunrise / Sunset</div>
              <div className="font-mono font-semibold text-[var(--text)] text-sm mt-0.5">
                ☀ {panchang.sunriseTime} — 🌇 {panchang.sunsetTime}
              </div>
            </div>
            <div className="obs-panel px-4 py-2 text-xs border-l-2 border-l-[var(--brass)]">
              <div className="text-[var(--text-muted)]">Vedic Ghati-Pal (Since Sunrise)</div>
              <div className="font-mono font-semibold text-[var(--brass)] text-sm mt-0.5">
                {panchang.vedicClock.formatted}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-View Switcher */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--border)] text-xs">
          <button
            onClick={() => setSubView('FIVE_ANGAS')}
            className={`px-3.5 py-1.5 rounded font-semibold transition ${
              subView === 'FIVE_ANGAS'
                ? 'obs-badge-brass shadow-sm'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            1. Five Angas (Tithi, Nakshatra, Yoga, Karana, Vara) &amp; Tarabala
          </button>
          <button
            onClick={() => setSubView('MUHURAT_CHOGHADIYA')}
            className={`px-3.5 py-1.5 rounded font-semibold transition ${
              subView === 'MUHURAT_CHOGHADIYA'
                ? 'obs-badge-brass shadow-sm'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            2. Auspicious Muhurats, Rahu Kaal &amp; Day/Night Choghadiya
          </button>
        </div>
      </div>

      {subView === 'FIVE_ANGAS' && (
        <div className="space-y-6">
          {/* Personal Tarabala & Chandrabala Banner */}
          <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-[var(--brass)]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Personal Transit-to-Natal Muhurat (Tarabala &amp; Chandrabala — B.V. Raman Muhurtha)
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--text)] mt-0.5">
                Tara #{panchang.personalTarabala.taraNumber}: {panchang.personalTarabala.taraName} • Chandrabala House {panchang.personalTarabala.chandrabalaHouse}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{panchang.personalTarabala.verdict}</p>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span
                className={`px-3 py-1.5 rounded font-semibold ${
                  panchang.personalTarabala.isAuspicious ? 'obs-badge-sage' : 'obs-badge-crimson'
                }`}
              >
                {panchang.personalTarabala.isAuspicious ? 'TARABALA: SHUBHA (AUSPICIOUS)' : 'TARABALA: PARIHARA ADVISED'}
              </span>
            </div>
          </div>

          {/* The 5 Angas (Limbs of Vedic Time) Architectural Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="obs-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">1. Tithi (Lunar Day)</span>
              <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">{panchang.tithi.name}</h4>
              <p className="text-xs text-[var(--brass)] font-medium">{panchang.tithi.paksha}</p>
              <div className="mt-3 w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--brass)]" style={{ width: `${panchang.tithi.progressPercent}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-xs font-mono text-[var(--text-muted)]">
                <span>{panchang.tithi.progressPercent}% elapsed</span>
                <span>{panchang.tithi.hoursRemaining}</span>
              </div>
            </div>

            <div className="obs-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">2. Nakshatra</span>
              <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                {panchang.nakshatra.name} (Pada {panchang.nakshatra.pada})
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">Lord: {panchang.nakshatra.ruler} • {panchang.nakshatra.deity}</p>
              <div className="mt-3 w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--sage)]" style={{ width: `${panchang.nakshatra.progressPercent}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-xs font-mono text-[var(--text-muted)]">
                <span>{panchang.nakshatra.progressPercent}% elapsed</span>
                <span>{panchang.nakshatra.hoursRemaining}</span>
              </div>
            </div>

            <div className="obs-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">3. Nitya Yoga</span>
              <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">{panchang.yoga.name}</h4>
              <p className="text-xs text-[var(--text-secondary)]">Yoga #{panchang.yoga.index} of 27</p>
              <div className="mt-3 w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--crimson)]" style={{ width: `${panchang.yoga.progressPercent}%` }} />
              </div>
              <div className="mt-1.5 text-xs font-mono text-[var(--text-muted)]">
                {panchang.yoga.progressPercent}% completed
              </div>
            </div>

            <div className="obs-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">4. Karana (Half-Tithi)</span>
              <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">{panchang.karana.name}</h4>
              <p className="text-xs text-[var(--sage)] font-medium mt-1">{panchang.karana.nature}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Dinamana: <span className="font-mono text-[var(--text)]">{panchang.dinamanaHours}</span>
              </p>
            </div>

            <div className="obs-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">5. Vara (Solar Day)</span>
              <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">{panchang.vara.name}</h4>
              <p className="text-xs text-[var(--brass)] font-medium mt-1">Lord: {panchang.vara.lord}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Chandra Rashi: <span className="text-[var(--text)] font-medium">{panchang.moonSign}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {subView === 'MUHURAT_CHOGHADIYA' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="obs-card p-5">
            <h3 className="text-xl font-serif font-bold text-[var(--text)]">
              Auspicious Muhurats &amp; Rahu Kaal Windows
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Calculated for {panchang.location.name} solar horizon ({panchang.location.elevationMeters}m elevation).
            </p>

            <div className="space-y-2.5">
              {panchang.muhurats.map(m => (
                <div
                  key={m.name}
                  className="obs-panel p-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{m.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          m.category === 'Auspicious'
                            ? 'obs-badge-sage'
                            : m.category === 'Inauspicious'
                            ? 'obs-badge-crimson'
                            : 'obs-badge-brass'
                        }`}
                      >
                        {m.category}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{m.description}</p>
                  </div>
                  <div className="font-mono text-xs font-semibold text-[var(--text)] whitespace-nowrap obs-card px-3 py-1.5">
                    {m.startTime} – {m.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="obs-card p-5">
            <h3 className="text-xl font-serif font-bold text-[var(--text)]">
              Day &amp; Night Choghadiya Table
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              8 Day and 8 Night Vedic time octants between Sunrise ({panchang.sunriseTime}) and Sunset ({panchang.sunsetTime}).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-[var(--brass)] uppercase tracking-wider mb-2">☀ Day Choghadiya</div>
                <div className="space-y-1.5">
                  {panchang.dayChoghadiya.map((c, idx) => {
                    const isGood = c.nature.includes('Auspicious') || c.nature.includes('Good');
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded ${
                          isGood
                            ? 'obs-badge-sage'
                            : c.nature.includes('Neutral')
                            ? 'obs-panel text-[var(--text)]'
                            : 'obs-badge-crimson'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{c.name}</span>{' '}
                          <span className="opacity-80">({c.ruler})</span>
                        </div>
                        <span className="font-mono">{c.startTime}–{c.endTime}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">🌙 Night Choghadiya</div>
                <div className="space-y-1.5">
                  {panchang.nightChoghadiya.map((c, idx) => {
                    const isGood = c.nature.includes('Auspicious') || c.nature.includes('Good');
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded ${
                          isGood
                            ? 'obs-badge-sage'
                            : c.nature.includes('Neutral')
                            ? 'obs-panel text-[var(--text)]'
                            : 'obs-badge-crimson'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{c.name}</span>{' '}
                          <span className="opacity-80">({c.ruler})</span>
                        </div>
                        <span className="font-mono">{c.startTime}–{c.endTime}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
