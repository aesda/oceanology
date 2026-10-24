import React, { useState } from 'react';
import { ZODIAC_SIGNS } from '../engines/astronomyEngine';
import { DivisionalChartEntry } from '../engines/vedicEngine';

interface Props {
  divisionalTable: DivisionalChartEntry[];
  defaultStyle?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
}

type VargaKey = 'd1Sign' | 'd9Sign' | 'd10Sign' | 'd2Sign' | 'd3Sign' | 'd7Sign';

const VARGA_TABS: { key: VargaKey; code: string; title: string; subtitle: string }[] = [
  { key: 'd1Sign', code: 'D1', title: 'Rashi / Cheena', subtitle: 'Root Janma Kundali' },
  { key: 'd9Sign', code: 'D9', title: 'Navamsha', subtitle: 'Dharma, Marriage & Fruit' },
  { key: 'd10Sign', code: 'D10', title: 'Dashamsha', subtitle: 'Karma & Vocation' },
  { key: 'd2Sign', code: 'D2', title: 'Hora', subtitle: 'Sampatti (Wealth)' },
  { key: 'd3Sign', code: 'D3', title: 'Drekkana', subtitle: 'Parakrama (Courage)' },
  { key: 'd7Sign', code: 'D7', title: 'Saptamsha', subtitle: 'Santana (Progeny)' },
];

const NORTH_HOUSE_POS: { house: number; signX: number; signY: number; planetsX: number; planetsY: number }[] = [
  { house: 1, signX: 200, signY: 168, planetsX: 200, planetsY: 105 },
  { house: 2, signX: 100, signY: 75, planetsX: 100, planetsY: 42 },
  { house: 3, signX: 72, signY: 100, planetsX: 38, planetsY: 100 },
  { house: 4, signX: 165, signY: 200, planetsX: 102, planetsY: 200 },
  { house: 5, signX: 72, signY: 300, planetsX: 38, planetsY: 300 },
  { house: 6, signX: 100, signY: 325, planetsX: 100, planetsY: 360 },
  { house: 7, signX: 200, signY: 232, planetsX: 200, planetsY: 295 },
  { house: 8, signX: 300, signY: 325, planetsX: 300, planetsY: 360 },
  { house: 9, signX: 328, signY: 300, planetsX: 362, planetsY: 300 },
  { house: 10, signX: 235, signY: 200, planetsX: 298, planetsY: 200 },
  { house: 11, signX: 328, signY: 100, planetsX: 362, planetsY: 100 },
  { house: 12, signX: 300, signY: 75, planetsX: 300, planetsY: 42 },
];

const SOUTH_SIGN_BOXES: { signIndex: number; x: number; y: number }[] = [
  { signIndex: 11, x: 0, y: 0 },
  { signIndex: 0, x: 100, y: 0 },
  { signIndex: 1, x: 200, y: 0 },
  { signIndex: 2, x: 300, y: 0 },
  { signIndex: 3, x: 300, y: 100 },
  { signIndex: 4, x: 300, y: 200 },
  { signIndex: 5, x: 300, y: 300 },
  { signIndex: 6, x: 200, y: 300 },
  { signIndex: 7, x: 100, y: 300 },
  { signIndex: 8, x: 0, y: 300 },
  { signIndex: 9, x: 0, y: 200 },
  { signIndex: 10, x: 0, y: 100 },
];

export const VedicKundliSvg: React.FC<Props> = ({ divisionalTable, defaultStyle = 'NORTH_INDIAN' }) => {
  const [varga, setVarga] = useState<VargaKey>('d1Sign');
  const [style, setStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>(defaultStyle);

  const ascEntry = divisionalTable.find(e => e.planetId === 'Asc') || divisionalTable[0];
  const ascSignIdx = ascEntry[varga];
  const activeVargaMeta = VARGA_TABS.find(t => t.key === varga)!;

  return (
    <div className="flex flex-col gap-3">
      {/* Varga Tabs + North/South Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {VARGA_TABS.map(t => (
            <button
              key={t.code}
              onClick={() => setVarga(t.key)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                varga === t.key
                  ? 'obs-badge-brass font-semibold'
                  : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              {t.code} • {t.title}
            </button>
          ))}
        </div>

        <div className="flex rounded obs-panel p-0.5 text-xs">
          <button
            onClick={() => setStyle('NORTH_INDIAN')}
            className={`px-2.5 py-1 rounded transition ${
              style === 'NORTH_INDIAN'
                ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-sm'
                : 'text-[var(--text-muted)]'
            }`}
          >
            North / Nepal Diamond
          </button>
          <button
            onClick={() => setStyle('SOUTH_INDIAN')}
            className={`px-2.5 py-1 rounded transition ${
              style === 'SOUTH_INDIAN'
                ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-sm'
                : 'text-[var(--text-muted)]'
            }`}
          >
            South Chakra
          </button>
        </div>
      </div>

      {/* Kundli SVG Container */}
      <div className="flex flex-col items-center obs-panel p-4">
        <div className="text-xs text-[var(--text-secondary)] mb-2.5 flex items-center justify-between w-full px-1">
          <span className="font-semibold text-[var(--text)]">
            {activeVargaMeta.code}: {activeVargaMeta.title} ({activeVargaMeta.subtitle})
          </span>
          <span className="font-mono text-[var(--brass)] font-semibold">
            Lagna: {ZODIAC_SIGNS[ascSignIdx].sanskrit} ({ZODIAC_SIGNS[ascSignIdx].name})
          </span>
        </div>

        {style === 'NORTH_INDIAN' ? (
          <svg viewBox="0 0 400 400" className="w-full max-w-[375px] h-auto">
            {/* Traditional Vermilion & Brass Frame */}
            <rect x="4" y="4" width="392" height="392" rx="4" fill="var(--chart-bg)" stroke="var(--crimson)" strokeWidth="2" />
            <rect x="10" y="10" width="380" height="380" rx="2" fill="none" stroke="var(--brass)" strokeWidth="1" strokeOpacity="0.6" />
            {/* Diagonals */}
            <line x1="10" y1="10" x2="390" y2="390" stroke="var(--brass)" strokeWidth="1.2" />
            <line x1="390" y1="10" x2="10" y2="390" stroke="var(--brass)" strokeWidth="1.2" />
            {/* Inner Diamond */}
            <polygon
              points="200,10 390,200 200,390 10,200"
              fill="none"
              stroke="var(--crimson)"
              strokeWidth="1.5"
            />

            {NORTH_HOUSE_POS.map(pos => {
              const signIdx = (ascSignIdx + pos.house - 1) % 12;
              const occupants = divisionalTable.filter(
                p => p.planetId !== 'Asc' && p[varga] === signIdx
              );

              return (
                <g key={pos.house}>
                  {/* Rashi Number (1-12) */}
                  <text
                    x={pos.signX}
                    y={pos.signY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--crimson)"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    {signIdx + 1}
                  </text>

                  {/* Occupant Planets */}
                  {occupants.map((p, idx) => {
                    const row = Math.floor(idx / 2);
                    const col = idx % 2;
                    const offsetX = occupants.length === 1 ? 0 : (col === 0 ? -17 : 17);
                    const offsetY = (row - (Math.ceil(occupants.length / 2) - 1) / 2) * 16;
                    return (
                      <text
                        key={p.planetId}
                        x={pos.planetsX + offsetX}
                        y={pos.planetsY + offsetY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--text)"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {p.symbol}{p.planetId.slice(0, 2)}
                      </text>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        ) : (
          <svg viewBox="0 0 400 400" className="w-full max-w-[375px] h-auto">
            <rect x="2" y="2" width="396" height="396" rx="4" fill="var(--chart-bg)" stroke="var(--crimson)" strokeWidth="2" />
            <rect x="100" y="100" width="200" height="200" fill="var(--surface)" stroke="var(--brass)" strokeWidth="1.4" />
            <text
              x="200"
              y="182"
              textAnchor="middle"
              fill="var(--text)"
              fontSize="18"
              fontFamily="Cormorant Garamond, Georgia, serif"
              fontWeight="700"
            >
              {activeVargaMeta.code} • {activeVargaMeta.title}
            </text>
            <text x="200" y="205" textAnchor="middle" fill="var(--brass)" fontSize="12">
              South Indian Rashi Chakra
            </text>
            <text x="200" y="226" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">
              Lagna: {ZODIAC_SIGNS[ascSignIdx].sanskrit}
            </text>

            {SOUTH_SIGN_BOXES.map(box => {
              const sign = ZODIAC_SIGNS[box.signIndex];
              const isAsc = box.signIndex === ascSignIdx;
              const occupants = divisionalTable.filter(
                p => p.planetId !== 'Asc' && p[varga] === box.signIndex
              );

              return (
                <g key={box.signIndex}>
                  <rect
                    x={box.x}
                    y={box.y}
                    width="100"
                    height="100"
                    fill={isAsc ? 'var(--brass-bg)' : 'none'}
                    stroke="var(--chart-grid)"
                    strokeWidth="1.2"
                  />
                  <text
                    x={box.x + 8}
                    y={box.y + 16}
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {sign.symbol} {sign.sanskrit}
                  </text>
                  {isAsc && (
                    <text
                      x={box.x + 82}
                      y={box.y + 16}
                      textAnchor="middle"
                      fill="var(--crimson)"
                      fontSize="10"
                      fontWeight="700"
                    >
                      LAG
                    </text>
                  )}
                  {occupants.map((p, idx) => {
                    const r = Math.floor(idx / 2);
                    const c = idx % 2;
                    return (
                      <text
                        key={p.planetId}
                        x={box.x + 28 + c * 42}
                        y={box.y + 44 + r * 18}
                        textAnchor="middle"
                        fill="var(--text)"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {p.symbol}{p.planetId.slice(0, 2)}
                      </text>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
