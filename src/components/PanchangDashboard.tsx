import React, { useState } from 'react';
import { Compass, ShieldAlert, Sparkles, ArrowUpRight } from 'lucide-react';
import { PanchangReport } from '../engines/panchangEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';

interface Props {
  panchang: PanchangReport;
  onInspectNakshatra?: (nakIdx: number) => void;
  onOpenActionSimulator?: () => void;
}

type PanchangSubView = 'FIVE_ANGAS' | 'MUHURAT_CHOGHADIYA';

export const PanchangDashboard: React.FC<Props> = ({
  panchang,
  onInspectNakshatra,
  onOpenActionSimulator,
}) => {
  const [subView, setSubView] = useState<PanchangSubView>('FIVE_ANGAS');
  const [yr, mo, dy] = panchang.dateStr.split('-').map((n) => parseInt(n, 10));
  const bsDate = gregorianToBikramSambat(yr || 2026, mo || 10, dy || 25);

  return (
    <div className="space-y-6">
      {/* Editorial Nepali Patro & Elevation-Aware Horizon Masthead */}
      <div className="folio-sheet p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="editorial-eyebrow">
              Drik Siddhanta &amp; Nepali Patro (नेपाली पात्रो) • {bsDate.formattedEn} (
              {bsDate.formattedNp})
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)]">
              Daily Panchang, Panchaka, Dishashoola &amp; Choghadiya — {panchang.location.name}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              {panchang.location.latitude.toFixed(4)}°N, {panchang.location.longitude.toFixed(4)}°E
              • Elevation: {panchang.location.elevationMeters}m • Solar Month:{' '}
              {panchang.bikramSambat.monthName} • Gregorian: {panchang.dateStr}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="obs-panel px-4 py-2 text-xs">
              <div className="text-[var(--text-muted)] font-mono uppercase text-[10px]">
                Local Horizon Rise / Set
              </div>
              <div className="font-mono font-semibold text-[var(--text)] text-sm mt-0.5">
                ☀ {panchang.sunriseTime} — 🌇 {panchang.sunsetTime}
              </div>
            </div>
            <div className="obs-panel px-4 py-2 text-xs border-l-2 border-l-[var(--brass)]">
              <div className="text-[var(--text-muted)] font-mono uppercase text-[10px]">
                Vedic Ghati-Pal (Since Sunrise)
              </div>
              <div className="font-mono font-semibold text-[var(--brass)] text-sm mt-0.5">
                {panchang.vedicClock.formatted}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border)] text-xs font-mono">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubView('FIVE_ANGAS')}
              className={`px-3.5 py-2 border transition ${
                subView === 'FIVE_ANGAS'
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--surface)] font-semibold'
                  : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
              }`}
            >
              I. Five Angas, Special Yogas, Panchaka &amp; Dishashoola
            </button>
            <button
              onClick={() => setSubView('MUHURAT_CHOGHADIYA')}
              className={`px-3.5 py-2 border transition ${
                subView === 'MUHURAT_CHOGHADIYA'
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--surface)] font-semibold'
                  : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
              }`}
            >
              II. Muhurat Windows, Rahu Kaal &amp; 16 Choghadiyas
            </button>
          </div>

          {onOpenActionSimulator && (
            <button
              onClick={onOpenActionSimulator}
              className="text-[var(--brass)] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>Test Specific Action Against Today’s Panchang</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {subView === 'FIVE_ANGAS' && (
        <div className="space-y-6">
          {/* Personal Tarabala, Chandrabala & Chandrashtama Banner */}
          <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-[var(--brass)]">
            <div className="space-y-1 max-w-3xl">
              <div className="editorial-eyebrow">
                Personal Transit-to-Natal Muhurta (Tarabala &amp; Chandrabala)
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                Tara #{panchang.personalTarabala.taraNumber}: {panchang.personalTarabala.taraName}{' '}
                • Chandrabala House {panchang.personalTarabala.chandrabalaHouse}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {panchang.personalTarabala.verdict}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span
                className={`px-3 py-1.5 font-semibold ${
                  panchang.personalTarabala.isAuspicious ? 'obs-badge-sage' : 'obs-badge-crimson'
                }`}
              >
                {panchang.personalTarabala.isAuspicious
                  ? 'TARABALA: SHUBHA'
                  : 'TARABALA: PARIHARA ADVISED'}
              </span>
              {panchang.personalTarabala.isChandrashtama && (
                <span className="px-3 py-1.5 font-semibold obs-badge-crimson">
                  CHANDRASHTAMA (8TH MOON ALERT)
                </span>
              )}
            </div>
          </div>

          {/* The 5 Angas (Limbs of Vedic Time) Architectural Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Tithi */}
            <div className="obs-card p-4 flex flex-col justify-between">
              <div>
                <span className="editorial-eyebrow">1. Tithi (Lunar Day)</span>
                <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                  {panchang.tithi.name}
                </h4>
                <p className="text-xs text-[var(--brass)] font-medium">{panchang.tithi.paksha}</p>
                <p
                  className={`text-[11px] font-mono mt-1.5 ${
                    panchang.tithi.isRikta ? 'text-[var(--crimson)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {panchang.tithi.group}
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full h-1 bg-[var(--surface-muted)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--brass)]"
                    style={{ width: `${panchang.tithi.progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{panchang.tithi.progressPercent}%</span>
                  <span>{panchang.tithi.hoursRemaining}</span>
                </div>
              </div>
            </div>

            {/* 2. Nakshatra */}
            <div className="obs-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="editorial-eyebrow">2. Nakshatra</span>
                  {onInspectNakshatra && (
                    <button
                      onClick={() => onInspectNakshatra(panchang.nakshatra.zeroIndex)}
                      className="text-[11px] font-mono text-[var(--brass)] hover:underline"
                    >
                      Treatise →
                    </button>
                  )}
                </div>
                <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                  {panchang.nakshatra.name} (P{panchang.nakshatra.pada})
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Lord: {panchang.nakshatra.ruler} • {panchang.nakshatra.natureGroup.split(' ')[0]}
                </p>
                <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
                  {panchang.nakshatra.mukhaGaze.split(' ')[0]} • {panchang.nakshatra.shaktiName}
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full h-1 bg-[var(--surface-muted)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--sage)]"
                    style={{ width: `${panchang.nakshatra.progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{panchang.nakshatra.progressPercent}%</span>
                  <span>{panchang.nakshatra.hoursRemaining}</span>
                </div>
              </div>
            </div>

            {/* 3. Nitya Yoga */}
            <div className="obs-card p-4 flex flex-col justify-between">
              <div>
                <span className="editorial-eyebrow">3. Nitya Yoga</span>
                <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                  {panchang.yoga.name}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Yoga #{panchang.yoga.index} of 27
                </p>
                <p
                  className={`text-[11px] font-mono mt-1.5 ${
                    panchang.yoga.isMaleficYoga ? 'text-[var(--crimson)]' : 'text-[var(--sage)]'
                  }`}
                >
                  {panchang.yoga.isMaleficYoga
                    ? 'Caution: Sharp/Malefic Yoga'
                    : 'Benefic Nitya Alignment'}
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full h-1 bg-[var(--surface-muted)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--crimson)]"
                    style={{ width: `${panchang.yoga.progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[11px] font-mono text-[var(--text-muted)]">
                  {panchang.yoga.progressPercent}% completed
                </div>
              </div>
            </div>

            {/* 4. Karana */}
            <div className="obs-card p-4 flex flex-col justify-between">
              <div>
                <span className="editorial-eyebrow">4. Karana (Half-Tithi)</span>
                <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                  {panchang.karana.name}
                </h4>
                <p
                  className={`text-xs font-medium mt-1 ${
                    panchang.karana.isBhadraVishti ? 'text-[var(--crimson)]' : 'text-[var(--sage)]'
                  }`}
                >
                  {panchang.karana.nature}
                </p>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
                Dinamana: <span className="text-[var(--text)]">{panchang.dinamanaHours}</span>
              </p>
            </div>

            {/* 5. Vara */}
            <div className="obs-card p-4 flex flex-col justify-between">
              <div>
                <span className="editorial-eyebrow">5. Vara (Solar Day)</span>
                <h4 className="text-xl font-serif font-bold text-[var(--text)] mt-1">
                  {panchang.vara.name}
                </h4>
                <p className="text-xs text-[var(--brass)] font-medium mt-1">
                  Lord: {panchang.vara.lord}
                </p>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
                Chandra: <span className="text-[var(--text)]">{panchang.moonSign}</span> • Surya:{' '}
                <span className="text-[var(--text)]">{panchang.sunSign}</span>
              </p>
            </div>
          </div>

          {/* Classical Muhurta Chintamani Layer: Special Yogas, Dhanishtha Panchaka & Dishashoola */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Special Vara-Nakshatra-Tithi Yogas */}
            <div className="obs-card p-5 space-y-3">
              <div className="flex items-center gap-2 editorial-eyebrow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vara-Nakshatra Special Yogas</span>
              </div>
              {panchang.specialYogas.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  No rare Vara-Nakshatra Siddhi or Dagdha conjunctions are active today; rely on the
                  primary Five Angas, Tarabala, and Choghadiya windows.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {panchang.specialYogas.map((sy, i) => (
                    <div key={i} className="obs-panel p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-serif font-bold text-base text-[var(--text)]">
                          {sy.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] ${
                            sy.nature === 'Inauspicious'
                              ? 'obs-badge-crimson'
                              : sy.nature === 'Multiplier'
                              ? 'obs-badge-brass'
                              : 'obs-badge-sage'
                          }`}
                        >
                          {sy.nature}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {sy.consequence}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dhanishtha Panchaka Status */}
            <div className="obs-card p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="editorial-eyebrow flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Dhanishtha Panchaka Rule</span>
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-mono ${
                    panchang.panchaka.isActive ? 'obs-badge-crimson' : 'obs-badge-sage'
                  }`}
                >
                  {panchang.panchaka.isActive ? 'ACTIVE' : 'CLEAR'}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[var(--text)]">
                {panchang.panchaka.type}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {panchang.panchaka.consequence}
              </p>
            </div>

            {/* Dishashoola & Threshold Parihara */}
            <div className="obs-card p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="editorial-eyebrow flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Dishashoola (Travel Compass)</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono obs-badge-brass">
                  Avoid {panchang.dishashoola.forbiddenDirection}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[var(--text)]">
                {panchang.dishashoola.sanskritDirection} ({panchang.dishashoola.forbiddenDirection}{' '}
                Threshold Caution)
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {panchang.dishashoola.consequenceIfIgnored}
              </p>
              <div className="p-2.5 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--sage)] text-xs text-[var(--text)]">
                <strong>Classical Parihara:</strong> {panchang.dishashoola.pariharaRemedy}
              </div>
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
              Proportional octants computed for {panchang.location.name} solar horizon (
              {panchang.location.elevationMeters}m elevation).
            </p>

            <div className="space-y-2.5">
              {panchang.muhurats.map((m) => (
                <div
                  key={m.name}
                  className="obs-panel p-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{m.name}</span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 ${
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
              Eight Day and eight Night Vedic octants between Sunrise ({panchang.sunriseTime}) and
              Sunset ({panchang.sunsetTime}).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-mono text-[11px] font-semibold text-[var(--brass)] uppercase tracking-wider mb-2">
                  ☀ Day Choghadiya
                </div>
                <div className="space-y-1.5">
                  {panchang.dayChoghadiya.map((c, idx) => {
                    const isGood = c.nature.includes('Auspicious') || c.nature.includes('Good');
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 ${
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
                        <span className="font-mono">
                          {c.startTime}–{c.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="font-mono text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  🌙 Night Choghadiya
                </div>
                <div className="space-y-1.5">
                  {panchang.nightChoghadiya.map((c, idx) => {
                    const isGood = c.nature.includes('Auspicious') || c.nature.includes('Good');
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 ${
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
                        <span className="font-mono">
                          {c.startTime}–{c.endTime}
                        </span>
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
