import React, { useState } from 'react';
import { BookOpen, Sparkles, Compass, Shield, HeartPulse, ScrollText } from 'lucide-react';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { HOUSE_TREATISES, PLANET_TREATISES } from '../data/classicalCompendium';

interface Props {
  chart: NatalChartResult;
  vedic: VedicReport;
}

export const ClassicalBookLibrary: React.FC<Props> = ({ chart, vedic }) => {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('Sun');
  const [selectedHouseNum, setSelectedHouseNum] = useState<number>(1);
  const [readingMode, setReadingMode] = useState<'PLANETS' | 'HOUSES' | 'YOGAS_REMEDIES'>('PLANETS');

  const activePlanet = chart.planets.find(p => p.id === selectedPlanetId) || chart.planets[0];
  const treatise = PLANET_TREATISES[activePlanet.id] || PLANET_TREATISES.Sun;
  const planetHouseTreatise = HOUSE_TREATISES[activePlanet.house] || HOUSE_TREATISES[1];

  const activeHouseCusp = chart.houses.find(h => h.house === selectedHouseNum) || chart.houses[0];
  const activeHouseTreatise = HOUSE_TREATISES[selectedHouseNum] || HOUSE_TREATISES[1];
  const planetsInSelectedHouse = chart.planets.filter(p => p.house === selectedHouseNum);

  return (
    <div className="space-y-6">
      {/* Book Library Header & Mode Switcher */}
      <div className="obs-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Classical &amp; Modern Treatise Compendium</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
            Scholarly Interpretation Folio (Parashara, Varahamihira, Raman, Greene &amp; Rudhyar)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Synthesizing <em>Brihat Parashara Hora Shastra</em>, <em>Phaladeepika</em>, <em>Brihat Jataka</em>, Liz Greene’s Depth Psychology, and Dane Rudhyar’s Sabian Mandala for your exact chart.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 obs-panel p-1 text-xs">
          <button
            onClick={() => setReadingMode('PLANETS')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              readingMode === 'PLANETS'
                ? 'bg-[var(--surface)] text-[var(--brass)] shadow-sm border border-[var(--border-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            Nine Grahas &amp; Outer Planets
          </button>
          <button
            onClick={() => setReadingMode('HOUSES')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              readingMode === 'HOUSES'
                ? 'bg-[var(--surface)] text-[var(--brass)] shadow-sm border border-[var(--border-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            12 Bhavas (Houses) Treatise
          </button>
          <button
            onClick={() => setReadingMode('YOGAS_REMEDIES')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              readingMode === 'YOGAS_REMEDIES'
                ? 'bg-[var(--surface)] text-[var(--brass)] shadow-sm border border-[var(--border-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            B.V. Raman Yogas &amp; Vedic Remedies
          </button>
        </div>
      </div>

      {/* MODE 1: PLANETARY TREATISE READER */}
      {readingMode === 'PLANETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Spine: Planet Selector Index (4 cols) */}
          <div className="lg:col-span-4 obs-card p-4 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 pb-2 border-b border-[var(--border)]">
              Select Natal Graha / Planet
            </div>
            {chart.planets.map(p => {
              const active = p.id === activePlanet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanetId(p.id)}
                  className={`w-full px-3 py-2.5 rounded text-left flex items-center justify-between text-xs transition ${
                    active
                      ? 'obs-badge-brass font-bold shadow-sm'
                      : 'hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base" style={{ color: p.color }}>
                      {p.symbol}
                    </span>
                    <div>
                      <div className="text-[var(--text)] font-semibold">
                        {p.name} <span className="text-[var(--text-muted)] font-normal">({p.sanskritName})</span>
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)]">
                        {p.signSymbol} {p.signName} {p.formattedDMS} • House {p.house}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono ${
                      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                        ? 'obs-badge-sage'
                        : p.dignity === 'Debilitated'
                        ? 'obs-badge-crimson'
                        : 'obs-panel'
                    }`}
                  >
                    {p.dignity}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Folio: Editorial Book Chapter (8 cols) */}
          <div className="lg:col-span-8 obs-card p-6 space-y-6 border-t-4 border-t-[var(--brass)]">
            <div className="border-b border-[var(--border)] pb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase text-[var(--brass)] font-semibold">
                  {treatise.sanskritName} • {treatise.greekName}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] mt-1">
                  {activePlanet.symbol} {activePlanet.name} in {activePlanet.signName} ({activePlanet.sanskritSign}) — House {activePlanet.house}
                </h3>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  Exact Position: {activePlanet.formattedDMS} • Nakshatra: {activePlanet.nakshatraName} (Pada {activePlanet.nakshatraPada}, ruled by {activePlanet.nakshatraLord}) • Essential Dignity: {activePlanet.dignity}
                </p>
              </div>
              {activePlanet.isRetrograde && (
                <span className="px-3 py-1 rounded obs-badge-crimson text-xs font-mono font-bold">
                  RETROGRADE (VAKRI)
                </span>
              )}
            </div>

            {/* Classical Sanskrit Shloka Quote Box */}
            <blockquote className="obs-panel p-4 border-l-4 border-l-[var(--brass)] italic text-sm font-serif text-[var(--text)] leading-relaxed">
              {treatise.classicalCitation}
            </blockquote>

            {/* Two-Column Synthesis: Parashara Jyotish vs Western Depth Psychology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Parashara BPHS Karaka &amp; Soul Lesson</span>
                </div>
                <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                  <strong>Significations:</strong> {treatise.parasharaBphsKaraka}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Vedic Evolutionary Dharma:</strong> {treatise.vedicSoulLesson}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Jungian &amp; Liz Greene Depth Archetype</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {treatise.westernPsychologicalArchetype}
                </p>
              </div>
            </div>

            {/* Specific Natal House Placement Synthesis */}
            <div className="obs-panel p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                Placement in Your {planetHouseTreatise.name} ({planetHouseTreatise.sanskrit})
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Because your natal <strong>{activePlanet.name}</strong> occupies <strong>House {activePlanet.house}</strong> ({planetHouseTreatise.trikonaType}), its celestial energy directly shapes the domain of <em>{planetHouseTreatise.bphsSummary}</em> In Western psychological terms, this placement channels {activePlanet.name} into: {planetHouseTreatise.westernDepth}
              </p>
            </div>

            {/* Dane Rudhyar Sabian Symbol & Mahadasha Fruit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obs-panel p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dane Rudhyar Sabian Symbol</span>
                </div>
                <p className="text-xs font-serif italic text-[var(--text)] leading-relaxed">
                  {activePlanet.sabianSymbol}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Vimshottari Mahadasha &amp; Transit Fruit</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {treatise.dashaGeneralFruit}
                </p>
              </div>
            </div>

            {/* Medical Astrology (Ayurveda Dhatu) & Ratna/Mantra */}
            <div className="obs-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-t-[var(--sage)]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--sage)]">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Ayurvedic Dosha &amp; Dhatu Correspondence</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.medicalAndAyurvedicDhatu}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  Sacred Ratna (Gemstone) &amp; Beej Mantra
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.gemstoneAndMantra}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 12 BHAVAS (HOUSES) TREATISE */}
      {readingMode === 'HOUSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 obs-card p-4 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 pb-2 border-b border-[var(--border)]">
              Select Bhava (House 1–12)
            </div>
            {chart.houses.map(h => {
              const active = h.house === selectedHouseNum;
              const occ = chart.planets.filter(p => p.house === h.house);
              return (
                <button
                  key={h.house}
                  onClick={() => setSelectedHouseNum(h.house)}
                  className={`w-full px-3 py-2.5 rounded text-left flex items-center justify-between text-xs transition ${
                    active
                      ? 'obs-badge-brass font-bold shadow-sm'
                      : 'hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div>
                    <div className="text-[var(--text)] font-semibold">
                      House {h.house} — {HOUSE_TREATISES[h.house]?.sanskrit.split('•')[0]}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      Cusp: {h.signSymbol} {h.signName} {h.formattedDMS}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {occ.map(p => (
                      <span key={p.id} style={{ color: p.color }} className="text-sm">
                        {p.symbol}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 obs-card p-6 space-y-5 border-t-4 border-t-[var(--brass)]">
            <div className="border-b border-[var(--border)] pb-4">
              <span className="text-xs font-mono uppercase text-[var(--brass)] font-semibold">
                {activeHouseTreatise.sanskrit} • {activeHouseTreatise.trikonaType}
              </span>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                {activeHouseTreatise.name} — Cusp in {activeHouseCusp.signSymbol} {activeHouseCusp.signName} ({activeHouseCusp.formattedDMS})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  Parashara Hora Shastra Bhava Meaning
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.bphsSummary}
                </p>
              </div>
              <div className="obs-panel p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                  Modern Psychological &amp; Evolutionary Sphere
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.westernDepth}
                </p>
              </div>
            </div>

            <div className="obs-panel p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Natal Planets Occupying House {selectedHouseNum}
              </div>
              {planetsInSelectedHouse.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)]">
                  No natal planets occupy House {selectedHouseNum} directly; this house operates through its sign ruler (the planetary lord of <strong>{activeHouseCusp.signName}</strong>).
                </p>
              ) : (
                <div className="space-y-3">
                  {planetsInSelectedHouse.map(p => (
                    <div key={p.id} className="obs-card p-3 text-xs">
                      <div className="font-bold text-[var(--text)]">
                        {p.symbol} {p.name} in {p.signName} ({p.formattedDMS}) — {p.dignity}
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1">
                        {PLANET_TREATISES[p.id]?.parasharaBphsKaraka}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: B.V. RAMAN YOGAS & VEDIC REMEDIES */}
      {readingMode === 'YOGAS_REMEDIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="obs-card p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
                Dr. B.V. Raman ("Three Hundred Important Combinations")
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--text)] mt-0.5">
                Active Parashari &amp; Nabhasa Yogas in Your Chart
              </h3>
            </div>
            <div className="space-y-3">
              {vedic.yogas.map(y => (
                <div key={y.name} className="obs-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-[var(--text)]">
                      {y.name} <span className="text-xs font-mono text-[var(--brass)]">({y.sanskrit})</span>
                    </h4>
                    <span className="px-2.5 py-0.5 rounded obs-badge-brass text-xs font-semibold">
                      {y.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{y.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="obs-card p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sage)]">
                Brihat Parashara Remedial Upayas
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--text)] mt-0.5">
                Active Mahadasha &amp; Ascendant Harmonization Protocol
              </h3>
            </div>

            <div className="obs-panel p-4 space-y-2 border-l-4 border-l-[var(--brass)]">
              <div className="text-xs font-mono uppercase text-[var(--brass)] font-semibold">
                Current Active Mahadasha Lord: {vedic.activeMahadasha.lord}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.dashaGeneralFruit}
              </p>
              <p className="text-xs text-[var(--text)] font-medium mt-2">
                <strong>Recommended Mantra &amp; Ratna:</strong>{' '}
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.gemstoneAndMantra}
              </p>
            </div>

            <div className="obs-panel p-4 space-y-2 border-l-4 border-l-[var(--sage)]">
              <div className="text-xs font-mono uppercase text-[var(--sage)] font-semibold">
                Personal Nakshatra &amp; Lunar Equilibrium
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Your natal Moon resides in <strong>{chart.planets.find(p => p.id === 'Moon')?.nakshatraName}</strong>. Performing contemplation or charity on days when the Moon transits your Janma, Sampat, Kshema, Sadhana, or Mitra Taras amplifies mental serenity (Manas-Shanti) and material flow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
