import React, { useState } from 'react';
import { NatalChartResult, PlanetPosition, ZODIAC_SIGNS } from '../engines/astronomyEngine';

interface Props {
  chart: NatalChartResult;
  partnerChart?: NatalChartResult | null;
  showBiWheel?: boolean;
}

export const NatalWheelSvg: React.FC<Props> = ({ chart, partnerChart, showBiWheel = false }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);
  const size = 560;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 256;
  const rZodiacInner = 214;
  const rHouseInner = showBiWheel ? 146 : 118;
  const rPlanetTrack = showBiWheel ? 186 : 172;
  const rPartnerTrack = 128;
  const rCore = 96;

  // Rotate wheel so Ascendant is on the left horizon (180°)
  const ascLon = chart.ascendant.longitude;
  const lonToSvgAngleDeg = (lon: number) => 180 - (lon - ascLon);

  const polarToXY = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArcSector = (startLon: number, endLon: number, rOut: number, rIn: number) => {
    const a1 = lonToSvgAngleDeg(startLon);
    const a2 = lonToSvgAngleDeg(endLon);
    const p1Out = polarToXY(a1, rOut);
    const p2Out = polarToXY(a2, rOut);
    const p2In = polarToXY(a2, rIn);
    const p1In = polarToXY(a1, rIn);
    return [
      `M ${p1Out.x} ${p1Out.y}`,
      `A ${rOut} ${rOut} 0 0 0 ${p2Out.x} ${p2Out.y}`,
      `L ${p2In.x} ${p2In.y}`,
      `A ${rIn} ${rIn} 0 0 1 ${p1In.x} ${p1In.y}`,
      'Z',
    ].join(' ');
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[530px] h-auto select-none"
      >
        {/* Outer Horological Brass Bezel */}
        <circle cx={cx} cy={cy} r={rOuter + 5} fill="none" stroke="var(--brass)" strokeOpacity={0.45} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={rOuter} fill="var(--chart-bg)" stroke="var(--border-strong)" strokeWidth={1.5} />

        {/* 12 Zodiac Sign Sectors */}
        {ZODIAC_SIGNS.map(sign => {
          const startLon = sign.index * 30;
          const endLon = startLon + 30;
          const midLon = startLon + 15;
          const labelPos = polarToXY(lonToSvgAngleDeg(midLon), (rOuter + rZodiacInner) / 2);

          return (
            <g key={sign.name}>
              <path
                d={describeArcSector(startLon, endLon, rOuter, rZodiacInner)}
                fill="var(--chart-ring)"
                stroke="var(--chart-grid)"
                strokeWidth={1}
              />
              {/* 5-degree engraved ticks */}
              {[5, 10, 15, 20, 25].map(deg => {
                const tickAngle = lonToSvgAngleDeg(startLon + deg);
                const t1 = polarToXY(tickAngle, rZodiacInner);
                const t2 = polarToXY(tickAngle, rZodiacInner + (deg === 15 ? 7 : 4));
                return (
                  <line
                    key={deg}
                    x1={t1.x}
                    y1={t1.y}
                    x2={t2.x}
                    y2={t2.y}
                    stroke="var(--text-muted)"
                    strokeOpacity={0.55}
                    strokeWidth={1}
                  />
                );
              })}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text)"
                fontSize="16"
                fontFamily="Cormorant Garamond, Georgia, serif"
                fontWeight="700"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Inner House Ring */}
        <circle cx={cx} cy={cy} r={rZodiacInner} fill="var(--chart-bg)" stroke="var(--border-strong)" strokeWidth={1.5} />
        {showBiWheel && (
          <circle cx={cx} cy={cy} r={rHouseInner} fill="none" stroke="var(--brass)" strokeDasharray="3 3" strokeOpacity={0.6} />
        )}
        <circle cx={cx} cy={cy} r={rCore} fill="var(--surface)" stroke="var(--chart-grid)" strokeWidth={1.2} />

        {/* 12 House Cusp Lines & Numbers */}
        {chart.houses.map((h, i) => {
          const nextH = chart.houses[(i + 1) % 12];
          const angle = lonToSvgAngleDeg(h.longitude);
          const isAxis = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
          const pOut = polarToXY(angle, rZodiacInner);
          const pIn = polarToXY(angle, rCore);

          let span = nextH.longitude - h.longitude;
          if (span < 0) span += 360;
          const midAngle = lonToSvgAngleDeg(h.longitude + span / 2);
          const numPos = polarToXY(midAngle, rCore + 13);

          return (
            <g key={h.house}>
              <line
                x1={pIn.x}
                y1={pIn.y}
                x2={pOut.x}
                y2={pOut.y}
                stroke={isAxis ? 'var(--brass)' : 'var(--chart-grid)'}
                strokeWidth={isAxis ? 1.8 : 1}
              />
              <text
                x={numPos.x}
                y={numPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {h.house}
              </text>
            </g>
          );
        })}

        {/* ASC / DSC / MC / IC Cardinal Labels */}
        {[
          { label: 'ASC', lon: chart.ascendant.longitude, color: 'var(--crimson)' },
          { label: 'DSC', lon: (chart.ascendant.longitude + 180) % 360, color: 'var(--text-secondary)' },
          { label: 'MC', lon: chart.midheaven.longitude, color: 'var(--brass)' },
          { label: 'IC', lon: (chart.midheaven.longitude + 180) % 360, color: 'var(--text-secondary)' },
        ].map(axis => {
          const pos = polarToXY(lonToSvgAngleDeg(axis.lon), rZodiacInner - 12);
          return (
            <text
              key={axis.label}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={axis.color}
              fontSize="10"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              {axis.label}
            </text>
          );
        })}

        {/* Aspect Chords Inside Core Circle */}
        {chart.aspects.map((asp, idx) => {
          const pA = chart.planets.find(p => p.name === asp.planetA);
          const pB = chart.planets.find(p => p.name === asp.planetB);
          if (!pA || !pB) return null;
          const posA = polarToXY(lonToSvgAngleDeg(pA.activeLongitude), rCore - 4);
          const posB = polarToXY(lonToSvgAngleDeg(pB.activeLongitude), rCore - 4);
          const isHighlighted =
            hoveredPlanet && (hoveredPlanet.name === pA.name || hoveredPlanet.name === pB.name);

          const strokeColor =
            asp.nature === 'Harmonious'
              ? 'var(--sage)'
              : asp.nature === 'Dynamic'
              ? 'var(--crimson)'
              : 'var(--brass)';

          return (
            <line
              key={idx}
              x1={posA.x}
              y1={posA.y}
              x2={posB.x}
              y2={posB.y}
              stroke={strokeColor}
              strokeWidth={isHighlighted ? 2.2 : 1}
              strokeOpacity={hoveredPlanet ? (isHighlighted ? 0.95 : 0.15) : 0.55}
            />
          );
        })}

        {/* Primary Natal Planets */}
        {chart.planets.map((p, idx) => {
          const nearbyBefore = chart.planets
            .slice(0, idx)
            .filter(other => Math.abs(other.activeLongitude - p.activeLongitude) < 5).length;
          const radius = rPlanetTrack - nearbyBefore * 17;
          const angle = lonToSvgAngleDeg(p.activeLongitude);
          const pos = polarToXY(angle, radius);
          const tickEdge = polarToXY(angle, rZodiacInner);

          return (
            <g
              key={p.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPlanet(p)}
              onMouseLeave={() => setHoveredPlanet(null)}
            >
              <line
                x1={pos.x}
                y1={pos.y}
                x2={tickEdge.x}
                y2={tickEdge.y}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={12}
                fill="var(--surface)"
                stroke={hoveredPlanet?.id === p.id ? 'var(--crimson)' : 'var(--brass)'}
                strokeWidth={hoveredPlanet?.id === p.id ? 2.2 : 1.3}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text)"
                fontSize="13"
                fontWeight="700"
              >
                {p.symbol}
              </text>
              {p.isRetrograde && (
                <text
                  x={pos.x + 11}
                  y={pos.y - 9}
                  fill="var(--crimson)"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  R
                </text>
              )}
            </g>
          );
        })}

        {/* Partner Bi-Wheel Planets */}
        {showBiWheel &&
          partnerChart &&
          partnerChart.planets.slice(0, 10).map((p, idx) => {
            const angle = lonToSvgAngleDeg(p.activeLongitude);
            const pos = polarToXY(angle, rPartnerTrack - (idx % 2) * 12);
            return (
              <g key={`partner-${p.id}`}>
                <circle cx={pos.x} cy={pos.y} r={10} fill="var(--surface)" stroke="var(--crimson)" strokeWidth={1.3} />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--crimson)"
                  fontSize="11"
                  fontWeight="700"
                >
                  {p.symbol}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Interactive Inspector Bar */}
      <div className="mt-3 min-h-[58px] w-full obs-panel px-4 py-2.5 text-xs flex items-center justify-between">
        {hoveredPlanet ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 font-semibold text-[var(--text)]">
              <span className="text-base text-[var(--brass)]">{hoveredPlanet.symbol}</span>
              <span>
                {hoveredPlanet.name} ({hoveredPlanet.sanskritName}) — {hoveredPlanet.signName} {hoveredPlanet.formattedDMS}
              </span>
              <span className="px-2 py-0.5 rounded obs-badge-brass font-mono">
                House {hoveredPlanet.house}
              </span>
              <span className="px-2 py-0.5 rounded obs-badge-sage">
                {hoveredPlanet.nakshatraName} (Pada {hoveredPlanet.nakshatraPada})
              </span>
            </div>
            <p className="text-[var(--text-secondary)] mt-1 italic">{hoveredPlanet.sabianSymbol}</p>
          </div>
        ) : (
          <div className="text-[var(--text-secondary)] flex flex-wrap items-center justify-between w-full gap-2">
            <span>
              Hover any celestial body on the astrolabe to inspect exact degree-minute-second, Nakshatra Pada, and Sabian degree.
            </span>
            <span className="font-mono text-[var(--brass)] font-medium">
              Ayanamsha: {chart.ayanamshaMode} ({chart.ayanamshaDegrees.toFixed(4)}°)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
