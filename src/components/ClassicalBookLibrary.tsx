import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Compass,
  Shield,
  HeartPulse,
  ScrollText,
  ArrowUpRight,
  Trees,
} from 'lucide-react';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { HOUSE_TREATISES, PLANET_TREATISES } from '../data/classicalCompendium';
import { CLASSICAL_CANON_BOOKS, PLANET_IN_BHAVA_RULINGS } from '../data/canonAnthology';
import { STANDARD_27_NAKSHATRAS } from '../data/nakshatraCodex';

interface Props {
  chart: NatalChartResult;
  vedic: VedicReport;
  initialBookId?: string;
  onInspectNakshatra?: (nakIdx: number) => void;
}

type ReadingMode = 'CANON_BOOKS' | 'PLANETS' | 'HOUSES' | 'YOGAS_REMEDIES';

export const ClassicalBookLibrary: React.FC<Props> = ({
  chart,
  vedic,
  initialBookId,
  onInspectNakshatra,
}) => {
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    initialBookId ? 'CANON_BOOKS' : 'CANON_BOOKS'
  );
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialBookId || CLASSICAL_CANON_BOOKS[0].id
  );
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('Sun');
  const [selectedHouseNum, setSelectedHouseNum] = useState<number>(1);

  useEffect(() => {
    if (initialBookId) {
      setSelectedBookId(initialBookId);
      setReadingMode('CANON_BOOKS');
    }
  }, [initialBookId]);

  const activeBook =
    CLASSICAL_CANON_BOOKS.find((b) => b.id === selectedBookId) || CLASSICAL_CANON_BOOKS[0];

  const activePlanet = chart.planets.find((p) => p.id === selectedPlanetId) || chart.planets[0];
  const treatise = PLANET_TREATISES[activePlanet.id] || PLANET_TREATISES.Sun;
  const planetHouseTreatise = HOUSE_TREATISES[activePlanet.house] || HOUSE_TREATISES[1];
  const exactBhavaRuling = PLANET_IN_BHAVA_RULINGS[activePlanet.id]?.[activePlanet.house];
  const activePlanetNak =
    STANDARD_27_NAKSHATRAS[activePlanet.nakshatraIndex] || STANDARD_27_NAKSHATRAS[0];

  const activeHouseCusp = chart.houses.find((h) => h.house === selectedHouseNum) || chart.houses[0];
  const activeHouseTreatise = HOUSE_TREATISES[selectedHouseNum] || HOUSE_TREATISES[1];
  const planetsInSelectedHouse = chart.planets.filter((p) => p.house === selectedHouseNum);

  const moonPlanet = chart.planets.find((p) => p.id === 'Moon') || chart.planets[0];
  const janmaNakTreatise =
    STANDARD_27_NAKSHATRAS[moonPlanet.nakshatraIndex] || STANDARD_27_NAKSHATRAS[0];

  return (
    <div className="space-y-8">
      {/* Monograph Header & Chapter Bar */}
      <div className="folio-sheet p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-1.5">
            <div className="editorial-eyebrow flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sacred &amp; Classical Source Anthology • Personal Chart Exegesis</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
              The Nine Canonical Volumes &amp; Personal Folio
            </h2>
            <p className="literary-prose">
              Study the primary Sanskrit, Hellenistic, and depth-psychological texts encoded into
              Oceanology alongside your exact 108 Planet-in-Bhava rulings, Parashari Yogas, and
              living Nakshatra Upayas.
            </p>
          </div>
        </div>

        {/* 4 Clean Monograph Chapter Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)] text-xs font-mono">
          {[
            { id: 'CANON_BOOKS' as const, label: 'I. Nine Canonical Books & Sutras' },
            { id: 'PLANETS' as const, label: 'II. Personal Graha & Bhava Rulings' },
            { id: 'HOUSES' as const, label: 'III. Twelve Bhavas Architecture' },
            {
              id: 'YOGAS_REMEDIES' as const,
              label: `IV. Active Yogas (${vedic.yogas.length}) & Upayas`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReadingMode(tab.id)}
              className={`px-3.5 py-2 border transition ${
                readingMode === tab.id
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--surface)] font-semibold'
                  : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brass)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== CHAPTER I: NINE CANONICAL BOOKS ==================== */}
      {readingMode === 'CANON_BOOKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Bibliographic Spine (4 cols) */}
          <div className="lg:col-span-4 obs-card divide-y divide-[var(--border)]">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Select Canonical Volume (I – IX)
            </div>
            {CLASSICAL_CANON_BOOKS.map((book) => {
              const active = book.id === activeBook.id;
              return (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`w-full px-4 py-3.5 text-left transition flex items-start justify-between gap-3 ${
                    active
                      ? 'bg-[var(--brass-bg)] border-l-2 border-l-[var(--brass)]'
                      : 'hover:bg-[var(--surface-muted)]/60'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-mono text-[var(--brass)] font-semibold">
                      VOL. {book.number} • {book.tradition}
                    </div>
                    <div className="font-serif text-lg font-bold text-[var(--text)] leading-snug mt-0.5">
                      {book.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{book.author}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Book Manuscript Reader (8 cols) */}
          <div className="lg:col-span-8 folio-sheet p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border)] pb-5 space-y-2">
              <div className="editorial-eyebrow">
                Volume {activeBook.number} • {activeBook.eraAndLineage}
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)]">
                {activeBook.title}
              </h3>
              <div className="font-serif italic text-lg text-[var(--brass)]">
                {activeBook.sanskritOrOriginal}
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                Authorship &amp; Transmission: {activeBook.author}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Central Doctrinal Thesis
              </div>
              <p className="literary-prose">{activeBook.thesis}</p>
            </div>

            <div className="p-4 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--brass)] text-xs space-y-1">
              <div className="font-mono uppercase tracking-wider text-[var(--brass)] font-semibold">
                How This Text Is Computed in Oceanology
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {activeBook.engineIntegration}
              </p>
            </div>

            {/* Key Sutras & Commentaries */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
                Foundational Sutras, Aphorisms &amp; Exegesis
              </div>
              {activeBook.sutras.map((sutra, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-[var(--border)] bg-[var(--bg-elevated)]/60 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif text-xl font-bold text-[var(--text)]">
                      {sutra.title}
                    </h4>
                    <span className="text-[11px] font-mono text-[var(--brass)]">
                      {sutra.chapterRef}
                    </span>
                  </div>
                  <blockquote className="font-serif italic text-base text-[var(--text)] border-l-2 border-[var(--brass)] pl-3.5 py-0.5">
                    {sutra.aphorism}
                  </blockquote>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {sutra.commentary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER II: PERSONAL GRAHA & 108 BHAVA RULINGS ==================== */}
      {readingMode === 'PLANETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Spine: Planet Selector Index (4 cols) */}
          <div className="lg:col-span-4 obs-card divide-y divide-[var(--border)]">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Select Natal Graha / Planet
            </div>
            {chart.planets.map((p) => {
              const active = p.id === activePlanet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanetId(p.id)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between text-xs transition ${
                    active
                      ? 'bg-[var(--brass-bg)] border-l-2 border-l-[var(--brass)]'
                      : 'hover:bg-[var(--surface-muted)]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-serif" style={{ color: p.color }}>
                      {p.symbol}
                    </span>
                    <div>
                      <div className="text-[var(--text)] font-semibold">
                        {p.name}{' '}
                        <span className="text-[var(--text-muted)] font-normal">
                          ({p.sanskritName})
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {p.signSymbol} {p.signName} {p.formattedDMS} • House {p.house}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-mono ${
                      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                        ? 'obs-badge-sage'
                        : p.dignity === 'Debilitated'
                        ? 'obs-badge-crimson'
                        : 'obs-panel text-[var(--text-secondary)]'
                    }`}
                  >
                    {p.dignity}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Folio: Editorial Planet & Specific Bhava Ruling (8 cols) */}
          <div className="lg:col-span-8 folio-sheet p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border)] pb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="editorial-eyebrow">
                  {treatise.sanskritName} • {treatise.greekName}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] mt-1">
                  {activePlanet.symbol} {activePlanet.name} in {activePlanet.signName} (
                  {activePlanet.sanskritSign}) — House {activePlanet.house}
                </h3>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  Position: {activePlanet.formattedDMS} • Nakshatra: {activePlanet.nakshatraName}{' '}
                  (Pada {activePlanet.nakshatraPada}, Lord {activePlanet.nakshatraLord}) • Dignity:{' '}
                  {activePlanet.dignity}
                </p>
              </div>
              {activePlanet.isRetrograde && (
                <span className="px-3 py-1 obs-badge-crimson text-xs font-mono font-bold">
                  RETROGRADE (VAKRI)
                </span>
              )}
            </div>

            {/* Classical Sanskrit Shloka Quote */}
            <blockquote className="p-4 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--brass)] italic text-base font-serif text-[var(--text)] leading-relaxed">
              {treatise.classicalCitation}
            </blockquote>

            {/* Specific 1-of-108 Classical Planet-in-Bhava Ruling */}
            <div className="p-5 border border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-2">
              <div className="editorial-eyebrow">
                Specific Classical Ruling — {activePlanet.name} in House {activePlanet.house} (
                {planetHouseTreatise.sanskrit.split('•')[0].trim()})
              </div>
              <p className="literary-prose text-[var(--text)]">
                {exactBhavaRuling ||
                  `Occupying ${planetHouseTreatise.name} (${planetHouseTreatise.trikonaType}), ${activePlanet.name} channels its planetary archetype directly into ${planetHouseTreatise.bphsSummary}`}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border)]">
                <strong>Psychological Expression ({planetHouseTreatise.name}):</strong>{' '}
                {planetHouseTreatise.westernDepth}
              </p>
            </div>

            {/* Nakshatra Shakti Bridge */}
            <div className="p-4 border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="text-xs font-mono uppercase text-[var(--brass)] font-semibold">
                  Stellar Root: {activePlanetNak.name} ({activePlanetNak.shaktiName})
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Pada {activePlanet.nakshatraPada}</strong> (
                  {activePlanetNak.padas[activePlanet.nakshatraPada - 1]?.navamshaSign} Navamsha):{' '}
                  {activePlanetNak.padas[activePlanet.nakshatraPada - 1]?.expression}
                </p>
              </div>
              {onInspectNakshatra && (
                <button
                  onClick={() => onInspectNakshatra(activePlanet.nakshatraIndex)}
                  className="btn-editorial-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <span>Open {activePlanetNak.name} Treatise</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brass)]" />
                </button>
              )}
            </div>

            {/* Two-Column Synthesis: Parashara Jyotish vs Depth Psychology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Parashara BPHS Karaka &amp; Dharma</span>
                </div>
                <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                  <strong>Significations:</strong> {treatise.parasharaBphsKaraka}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Evolutionary Lesson:</strong> {treatise.vedicSoulLesson}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Liz Greene &amp; Jungian Archetype</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {treatise.westernPsychologicalArchetype}
                </p>
              </div>
            </div>

            {/* Authentic 360° Sabian Symbol & Mahadasha Fruit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obs-panel p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Authentic 360° Sabian Mandala</span>
                </div>
                <p className="text-sm font-serif italic text-[var(--text)] leading-relaxed">
                  {activePlanet.sabianSymbol}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Vimshottari Mahadasha &amp; Transit Fruit</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {treatise.dashaGeneralFruit}
                </p>
              </div>
            </div>

            {/* Ayurveda Dhatu & Ratna/Mantra */}
            <div className="obs-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-t-[var(--sage)]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--sage)]">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Ayurvedic Dosha &amp; Dhatu</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.medicalAndAyurvedicDhatu}
                </p>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  Sacred Ratna &amp; Beej Mantra
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.gemstoneAndMantra}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER III: 12 BHAVAS TREATISE ==================== */}
      {readingMode === 'HOUSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 obs-card divide-y divide-[var(--border)]">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Select Bhava (House 1 – 12)
            </div>
            {chart.houses.map((h) => {
              const active = h.house === selectedHouseNum;
              const occ = chart.planets.filter((p) => p.house === h.house);
              return (
                <button
                  key={h.house}
                  onClick={() => setSelectedHouseNum(h.house)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between text-xs transition ${
                    active
                      ? 'bg-[var(--brass-bg)] border-l-2 border-l-[var(--brass)]'
                      : 'hover:bg-[var(--surface-muted)]/60'
                  }`}
                >
                  <div>
                    <div className="text-[var(--text)] font-semibold">
                      House {h.house} — {HOUSE_TREATISES[h.house]?.sanskrit.split('•')[0]}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      Cusp: {h.signSymbol} {h.signName} {h.formattedDMS}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {occ.map((p) => (
                      <span key={p.id} style={{ color: p.color }} className="text-sm font-serif">
                        {p.symbol}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 folio-sheet p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border)] pb-4">
              <div className="editorial-eyebrow">
                {activeHouseTreatise.sanskrit} • {activeHouseTreatise.trikonaType}
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] mt-1">
                {activeHouseTreatise.name} — Cusp in {activeHouseCusp.signSymbol}{' '}
                {activeHouseCusp.signName} ({activeHouseCusp.formattedDMS})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obs-panel p-4 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  Parashara Hora Shastra Bhava Domain
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.bphsSummary}
                </p>
              </div>
              <div className="obs-panel p-4 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--brass)]">
                  Depth Psychological Sphere
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.westernDepth}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
                Natal Grahas Occupying House {selectedHouseNum}
              </div>
              {planetsInSelectedHouse.length === 0 ? (
                <div className="obs-panel p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                  No natal planets occupy House {selectedHouseNum} directly; in Parashari Jyotish
                  this Bhava expresses its karma through the placement and dignity of the lord of{' '}
                  <strong>{activeHouseCusp.signName}</strong> and aspects cast upon it.
                </div>
              ) : (
                <div className="space-y-3">
                  {planetsInSelectedHouse.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-serif text-lg font-bold text-[var(--text)]">
                          <span style={{ color: p.color }}>{p.symbol}</span> {p.name} in{' '}
                          {p.signName} ({p.formattedDMS})
                        </div>
                        <span className="text-xs font-mono obs-badge-brass px-2 py-0.5">
                          {p.dignity} • {p.nakshatraName} P{p.nakshatraPada}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {PLANET_IN_BHAVA_RULINGS[p.id]?.[selectedHouseNum] ||
                          PLANET_TREATISES[p.id]?.parasharaBphsKaraka}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER IV: CLASSICAL YOGAS & LIVING UPAYAS ==================== */}
      {readingMode === 'YOGAS_REMEDIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 folio-sheet p-6 sm:p-7 space-y-5">
            <div className="border-b border-[var(--border)] pb-3">
              <div className="editorial-eyebrow">
                BPHS, Phaladeepika &amp; B.V. Raman’s 300 Important Combinations
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                Active Classical Yogas Detected in Your Kundali ({vedic.yogas.length})
              </h3>
            </div>

            <div className="space-y-3.5">
              {vedic.yogas.map((y) => (
                <div
                  key={y.name}
                  className="p-4 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif font-bold text-lg text-[var(--text)]">
                      {y.name}{' '}
                      <span className="text-xs font-mono text-[var(--brass)] font-normal">
                        ({y.sanskrit})
                      </span>
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-mono ${
                        y.category === 'Dosha / Alert'
                          ? 'obs-badge-crimson'
                          : y.strength === 'High'
                          ? 'obs-badge-sage'
                          : 'obs-badge-brass'
                      }`}
                    >
                      {y.category} • {y.strength}
                    </span>
                  </div>
                  {y.sourceText && (
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      Citation: {y.sourceText}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {y.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 folio-sheet p-6 sm:p-7 space-y-5">
            <div className="border-b border-[var(--border)] pb-3">
              <div className="editorial-eyebrow">Sattvic Harmonization &amp; Sacred Ecology</div>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                Mahadasha &amp; Janma Nakshatra Upayas
              </h3>
            </div>

            <div className="p-4 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--brass)] space-y-2">
              <div className="text-xs font-mono uppercase text-[var(--brass)] font-semibold">
                Active Mahadasha Lord: {vedic.activeMahadasha.lord} (Antardasha:{' '}
                {vedic.activeAntardasha.lord})
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.dashaGeneralFruit}
              </p>
              <p className="text-xs text-[var(--text)] leading-relaxed pt-1 border-t border-[var(--border)]">
                <strong>Classical Ratna &amp; Mantra:</strong>{' '}
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.gemstoneAndMantra}
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--sage)] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase text-[var(--sage)] font-semibold flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5" />
                  <span>Janma Star Ecology: {janmaNakTreatise.name}</span>
                </span>
                {onInspectNakshatra && (
                  <button
                    onClick={() => onInspectNakshatra(janmaNakTreatise.index)}
                    className="font-mono text-[var(--brass)] hover:underline"
                  >
                    Full Star →
                  </button>
                )}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                <strong>Aradhya Vriksha (Sacred Botanical Ally):</strong>{' '}
                {janmaNakTreatise.sacredTree}
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                <strong>Taittiriya / Vedic Mantra:</strong>{' '}
                <em className="font-serif text-sm text-[var(--text)]">
                  {janmaNakTreatise.vedicMantra}
                </em>
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                <strong>Behavioral Dharma Upaya:</strong> {janmaNakTreatise.behavioralUpaya}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
