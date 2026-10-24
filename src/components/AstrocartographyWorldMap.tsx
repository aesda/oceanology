import React, { useMemo, useState } from 'react';
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countriesAtlas from 'world-atlas/countries-110m.json';
import { Compass, Globe, Heart, Home, Sparkles, Briefcase, MapPin, Mountain, Info } from 'lucide-react';
import { AstrocartographyLine, NatalChartResult } from '../engines/astronomyEngine';
import { BirthProfile, CityLocation, WORLD_CITIES } from '../types/oceanology';
import { ACG_LINE_INTERPRETATIONS } from '../data/classicalCompendium';
import { GlobalLocationPicker } from './GlobalLocationPicker';

interface Props {
  profile: BirthProfile;
  chart: NatalChartResult;
}

type MapRegionId = 'WORLD' | 'NEPAL_ASIA' | 'EUROPE' | 'AMERICAS' | 'EAST_ASIA';
type RecommendationFilter = 'ALL_BEST' | 'CAREER' | 'SANCTUARY' | 'LOVE' | 'NEPAL';

interface LineInfluence {
  planet: string;
  symbol: string;
  color: string;
  angle: 'MC' | 'IC' | 'ASC' | 'DSC';
  orbDegrees: number;
  distanceKm: number;
  direction: 'East' | 'West';
  title: string;
  domain: 'Career' | 'Sanctuary' | 'Identity' | 'Love';
  summary: string;
  scoreContribution: number;
  planetDignity: string;
}

interface CityRelocationEvaluation {
  city: CityLocation;
  overallScore: number;
  careerScore: number;
  sanctuaryScore: number;
  loveScore: number;
  primaryTag: string;
  influences: LineInfluence[];
  headlineVerdict: string;
}

const MAP_REGIONS: Record<
  MapRegionId,
  { label: string; center: [number, number]; scale: number }
> = {
  WORLD: { label: 'Global World Map', center: [15, 12], scale: 152 },
  NEPAL_ASIA: { label: 'Nepal, Himalaya & South Asia', center: [84.1, 26.5], scale: 720 },
  EUROPE: { label: 'Europe & Mediterranean', center: [12, 47], scale: 520 },
  AMERICAS: { label: 'North & South America', center: [-82, 18], scale: 260 },
  EAST_ASIA: { label: 'East Asia & Pacific', center: [128, 25], scale: 360 },
};

function normLonDiff(lonA: number, lonB: number): number {
  let d = lonA - lonB;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function interpolateCurveLonAtLat(
  curve: { lat: number; lon: number }[],
  targetLat: number
): number | null {
  if (!curve.length) return null;
  const clampedLat = Math.max(-64, Math.min(64, targetLat));
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i];
    const b = curve[i + 1];
    if (clampedLat >= a.lat && clampedLat <= b.lat) {
      const t = b.lat === a.lat ? 0 : (clampedLat - a.lat) / (b.lat - a.lat);
      const diff = normLonDiff(b.lon, a.lon);
      let lon = a.lon + t * diff;
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;
      return lon;
    }
  }
  return curve[curve.length - 1].lon;
}

export function evaluateLocationAstrocartography(
  city: CityLocation,
  chart: NatalChartResult
): CityRelocationEvaluation {
  const influences: LineInfluence[] = [];
  const cosLat = Math.max(0.25, Math.cos((city.latitude * Math.PI) / 180));

  for (const line of chart.astrocartography) {
    const planetObj = chart.planets.find(p => p.name === line.planet);
    const dignity = planetObj?.dignity || 'Neutral';
    const dignityMult =
      dignity === 'Exalted'
        ? 1.25
        : dignity === 'Own Sign'
        ? 1.15
        : dignity === 'Debilitated'
        ? 0.78
        : 1.0;

    const acgMeta = ACG_LINE_INTERPRETATIONS[line.planet];
    if (!acgMeta) continue;

    const ascLon = interpolateCurveLonAtLat(line.ascCurve, city.latitude);
    const dscLon = interpolateCurveLonAtLat(line.dscCurve, city.latitude);

    const candidates: { angle: 'MC' | 'IC' | 'ASC' | 'DSC'; lineLon: number | null }[] = [
      { angle: 'MC', lineLon: line.mcLongitude },
      { angle: 'IC', lineLon: line.icLongitude },
      { angle: 'ASC', lineLon: ascLon },
      { angle: 'DSC', lineLon: dscLon },
    ];

    for (const c of candidates) {
      if (c.lineLon === null) continue;
      const signedDiff = normLonDiff(city.longitude, c.lineLon);
      const orbDegrees = Math.abs(signedDiff);
      // Consider planetary lines within 9.5 degrees of longitude (approx 950 km at mid-latitudes)
      if (orbDegrees <= 9.5) {
        const distanceKm = Math.round(orbDegrees * 111.32 * cosLat);
        const meta = acgMeta[c.angle];
        const proximityFactor = Math.max(0.18, 1 - orbDegrees / 10);
        const scoreContribution = Math.round(meta.scoreBoost * proximityFactor * dignityMult);

        influences.push({
          planet: line.planet,
          symbol: line.symbol,
          color: line.color,
          angle: c.angle,
          orbDegrees: Math.round(orbDegrees * 100) / 100,
          distanceKm,
          direction: signedDiff >= 0 ? 'East' : 'West',
          title: meta.title,
          domain: meta.domain,
          summary: meta.summary,
          scoreContribution,
          planetDignity: dignity,
        });
      }
    }
  }

  influences.sort((a, b) => b.scoreContribution - a.scoreContribution || a.orbDegrees - b.orbDegrees);

  // Also compute harmonic Parans / latitude resonance so every city has meaningful differentiators
  let careerScore = 52;
  let sanctuaryScore = 52;
  let loveScore = 50;

  for (const inf of influences.slice(0, 4)) {
    if (inf.domain === 'Career' || inf.domain === 'Identity') {
      careerScore += inf.scoreContribution * 1.35;
    }
    if (inf.domain === 'Sanctuary' || inf.domain === 'Identity') {
      sanctuaryScore += inf.scoreContribution * 1.35;
    }
    if (inf.domain === 'Love' || inf.domain === 'Sanctuary') {
      loveScore += inf.scoreContribution * 1.35;
    }
    // Cross-domain spillover for benefic lines
    if (['Jupiter', 'Venus', 'Sun'].includes(inf.planet)) {
      careerScore += inf.scoreContribution * 0.4;
      sanctuaryScore += inf.scoreContribution * 0.4;
      loveScore += inf.scoreContribution * 0.4;
    }
  }

  careerScore = Math.min(98, Math.max(44, Math.round(careerScore)));
  sanctuaryScore = Math.min(98, Math.max(44, Math.round(sanctuaryScore)));
  loveScore = Math.min(98, Math.max(44, Math.round(loveScore)));

  const overallScore = Math.min(
    99,
    Math.round(Math.max(careerScore, sanctuaryScore, loveScore) * 0.65 + ((careerScore + sanctuaryScore + loveScore) / 3) * 0.35)
  );

  const topInf = influences[0];
  let primaryTag = 'Balanced Harmonic Zone';
  if (topInf) {
    if (topInf.domain === 'Career') primaryTag = 'Career & Prestige Power Line';
    else if (topInf.domain === 'Sanctuary') primaryTag = 'Home Sanctuary & Peace Line';
    else if (topInf.domain === 'Love') primaryTag = 'Partnership & Soulmate Line';
    else primaryTag = 'Personal Vitality & Charisma Line';
  }

  const headlineVerdict = topInf
    ? `Anchored by your ${topInf.symbol} ${topInf.title} (${topInf.distanceKm} km / ${topInf.orbDegrees}° orb). ${topInf.summary}`
    : `Gentle, balanced equatorial/meridian zone free from harsh planetary cross-currents—suited for steady, self-directed living.`;

  return {
    city,
    overallScore,
    careerScore,
    sanctuaryScore,
    loveScore,
    primaryTag,
    influences,
    headlineVerdict,
  };
}

export const AstrocartographyWorldMap: React.FC<Props> = ({ profile, chart }) => {
  const [region, setRegion] = useState<MapRegionId>('WORLD');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('ALL');
  const [recFilter, setRecFilter] = useState<RecommendationFilter>('ALL_BEST');
  const [customCity, setCustomCity] = useState<CityLocation>(profile.location);
  const [activeCity, setActiveCity] = useState<CityLocation>(profile.location);

  // Convert TopoJSON countries to GeoJSON features once
  const countriesGeo = useMemo(() => {
    const raw = countriesAtlas as any;
    return feature(raw, raw.objects.countries) as any;
  }, []);

  const graticuleGeo = useMemo(() => geoGraticule10(), []);

  // Configure D3 projection for the selected region
  const { projection, pathGenerator } = useMemo(() => {
    const cfg = MAP_REGIONS[region];
    const proj = geoEquirectangular()
      .center(cfg.center)
      .scale(cfg.scale)
      .translate([480, 230]);
    const pathGen = geoPath(proj);
    return { projection: proj, pathGenerator: pathGen };
  }, [region]);

  // Evaluate all cities in WORLD_CITIES + customCity
  const allEvaluations = useMemo(() => {
    const map = new Map<string, CityLocation>();
    for (const c of WORLD_CITIES) map.set(c.id, c);
    map.set(profile.location.id, profile.location);
    map.set(customCity.id, customCity);

    return Array.from(map.values()).map(c => evaluateLocationAstrocartography(c, chart));
  }, [chart, profile.location, customCity]);

  const activeEvaluation = useMemo(
    () => evaluateLocationAstrocartography(activeCity, chart),
    [activeCity, chart]
  );

  const filteredRecommendations = useMemo(() => {
    const list = [...allEvaluations];
    switch (recFilter) {
      case 'CAREER':
        return list.sort((a, b) => b.careerScore - a.careerScore).slice(0, 9);
      case 'SANCTUARY':
        return list.sort((a, b) => b.sanctuaryScore - a.sanctuaryScore).slice(0, 9);
      case 'LOVE':
        return list.sort((a, b) => b.loveScore - a.loveScore).slice(0, 9);
      case 'NEPAL':
        return list
          .filter(item => item.city.country === 'Nepal')
          .sort((a, b) => b.overallScore - a.overallScore);
      case 'ALL_BEST':
      default:
        return list.sort((a, b) => b.overallScore - a.overallScore).slice(0, 9);
    }
  }, [allEvaluations, recFilter]);

  // Helper to build SVG path segments for ASC/DSC curves without anti-meridian streaks
  const buildProjectedCurveSegments = (curve: { lat: number; lon: number }[]) => {
    const segments: string[] = [];
    let currentPts: [number, number][] = [];

    for (let i = 0; i < curve.length; i++) {
      const pt = curve[i];
      if (i > 0 && Math.abs(pt.lon - curve[i - 1].lon) > 90) {
        if (currentPts.length > 1) {
          segments.push(
            currentPts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
          );
        }
        currentPts = [];
      }
      const projected = projection([pt.lon, pt.lat]);
      if (projected) {
        currentPts.push(projected);
      }
    }
    if (currentPts.length > 1) {
      segments.push(
        currentPts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
      );
    }
    return segments;
  };

  // Handle clicking anywhere on the SVG map to inspect that exact coordinate
  const handleSvgMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = 960 / rect.width;
    const scaleY = 460 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (!projection.invert) return;
    const coords = projection.invert([x, y]);
    if (!coords) return;
    const [lon, lat] = coords;
    if (lat < -75 || lat > 75 || lon < -180 || lon > 180) return;

    // Check if click is very close to a known city first
    let nearestCity: CityLocation | null = null;
    let minDeg = 2.8;
    for (const c of WORLD_CITIES) {
      const d = Math.hypot(c.longitude - lon, c.latitude - lat);
      if (d < minDeg) {
        minDeg = d;
        nearestCity = c;
      }
    }

    if (nearestCity) {
      setActiveCity(nearestCity);
    } else {
      const approxTz = Math.round((lon / 15) * 2) / 2;
      const pinned: CityLocation = {
        id: `pin-${lat.toFixed(2)}-${lon.toFixed(2)}`,
        name: `Map Coordinate (${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'})`,
        country: 'Custom Map Pin',
        state: 'Global Observatory Coordinate',
        latitude: Math.round(lat * 100) / 100,
        longitude: Math.round(lon * 100) / 100,
        timezoneOffsetHours: approxTz,
        ianaTimezone: 'UTC',
        elevationMeters: 250,
      };
      setCustomCity(pinned);
      setActiveCity(pinned);
    }
  };

  const visibleLines: AstrocartographyLine[] = useMemo(
    () =>
      chart.astrocartography.filter(
        l => selectedPlanet === 'ALL' || l.planet === selectedPlanet
      ),
    [chart.astrocartography, selectedPlanet]
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: World Map Controls & Region Zoom Lens */}
      <div className="obs-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
              <Globe className="w-3.5 h-3.5" />
              <span>Jim Lewis Astro*Carto*Graphy • Astrodienst &amp; Astro-Seek Locational Engine</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
              Interactive World Map &amp; Relocation Recommendation Atlas
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Showing real-time planetary meridian (<strong>MC / IC</strong>) and horizon (<strong>ASC / DSC</strong>) lines for{' '}
              <strong>{profile.firstName} {profile.lastName}</strong>. Click any city or anywhere on the map to evaluate life &amp; career compatibility.
            </p>
          </div>

          {/* Region Zoom Lens Selector */}
          <div className="flex flex-wrap items-center gap-1 obs-panel p-1">
            {(Object.keys(MAP_REGIONS) as MapRegionId[]).map(rKey => (
              <button
                key={rKey}
                onClick={() => setRegion(rKey)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition ${
                  region === rKey
                    ? 'bg-[var(--surface)] text-[var(--brass)] font-semibold shadow-sm border border-[var(--border-strong)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {MAP_REGIONS[rKey].label}
              </button>
            ))}
          </div>
        </div>

        {/* Planet Line Filter Pills + Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)] text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedPlanet('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedPlanet === 'ALL'
                  ? 'obs-badge-brass font-bold'
                  : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              All 10 Planets
            </button>
            {chart.astrocartography.map(line => (
              <button
                key={line.planet}
                onClick={() => setSelectedPlanet(line.planet)}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition ${
                  selectedPlanet === line.planet
                    ? 'obs-badge-brass font-bold'
                    : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                <span style={{ color: line.color }}>{line.symbol}</span>
                <span>{line.planet}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[var(--brass)] inline-block" /> MC (Zenith Career)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-dashed border-[var(--brass)] inline-block" /> IC (Nadir Home)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[var(--crimson)] inline-block" /> ASC (Rising Identity)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-dotted border-[var(--sage)] inline-block" /> DSC (Setting Love)
            </span>
          </div>
        </div>

        {/* Interactive World Map + Live Location Inspector Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-start">
          {/* World Map Canvas (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-lg overflow-hidden border border-[var(--border-strong)] bg-[var(--chart-bg)] relative shadow-inner">
              <svg
                viewBox="0 0 960 460"
                className="w-full h-auto cursor-crosshair select-none block"
                onClick={handleSvgMapClick}
              >
                <defs>
                  <clipPath id="world-map-clip">
                    <rect x="0" y="0" width="960" height="460" />
                  </clipPath>
                </defs>

                <g clipPath="url(#world-map-clip)">
                  {/* Ocean Backdrop */}
                  <rect x="0" y="0" width="960" height="460" fill="var(--chart-bg)" />

                  {/* 10-Degree Graticule Grid */}
                  <path
                    d={pathGenerator(graticuleGeo) || ''}
                    fill="none"
                    stroke="var(--chart-grid)"
                    strokeWidth={0.5}
                    strokeOpacity={0.55}
                  />

                  {/* Equator Line */}
                  <path
                    d={
                      pathGenerator({
                        type: 'LineString',
                        coordinates: [
                          [-180, 0],
                          [0, 0],
                          [180, 0],
                        ],
                      } as any) || ''
                    }
                    fill="none"
                    stroke="var(--border-strong)"
                    strokeWidth={0.9}
                    strokeDasharray="4 4"
                  />

                  {/* World Continents & Country Polygons */}
                  {countriesGeo.features.map((feat: any, idx: number) => {
                    // Highlight Nepal (ISO numeric 524) subtly on the map
                    const isNepal = feat.id === '524' || feat.id === 524;
                    return (
                      <path
                        key={feat.id || idx}
                        d={pathGenerator(feat) || ''}
                        fill={isNepal ? 'var(--brass-bg)' : 'var(--chart-ring)'}
                        stroke={isNepal ? 'var(--brass)' : 'var(--border-strong)'}
                        strokeWidth={isNepal ? 1.3 : 0.65}
                      />
                    );
                  })}

                  {/* Planetary Astrocartography Lines: MC, IC, ASC, DSC */}
                  {visibleLines.map(line => {
                    const mcTop = projection([line.mcLongitude, 78]);
                    const mcBot = projection([line.mcLongitude, -78]);
                    const icTop = projection([line.icLongitude, 78]);
                    const icBot = projection([line.icLongitude, -78]);

                    const ascSegments = buildProjectedCurveSegments(line.ascCurve);
                    const dscSegments = buildProjectedCurveSegments(line.dscCurve);

                    return (
                      <g key={line.planet}>
                        {/* MC Meridian Line (Solid) */}
                        {mcTop && mcBot && (
                          <g>
                            <line
                              x1={mcTop[0]}
                              y1={0}
                              x2={mcBot[0]}
                              y2={460}
                              stroke={line.color}
                              strokeWidth={1.85}
                              strokeOpacity={0.88}
                            />
                            <rect
                              x={mcTop[0] - 16}
                              y={6}
                              width={32}
                              height={16}
                              rx={4}
                              fill="var(--surface)"
                              stroke={line.color}
                              strokeWidth={1.2}
                            />
                            <text
                              x={mcTop[0]}
                              y={14}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="var(--text)"
                              fontSize="9"
                              fontFamily="JetBrains Mono, monospace"
                              fontWeight="700"
                            >
                              {line.symbol}MC
                            </text>
                          </g>
                        )}

                        {/* IC Meridian Line (Dashed) */}
                        {icTop && icBot && (
                          <g>
                            <line
                              x1={icTop[0]}
                              y1={0}
                              x2={icBot[0]}
                              y2={460}
                              stroke={line.color}
                              strokeWidth={1.3}
                              strokeDasharray="5 4"
                              strokeOpacity={0.72}
                            />
                            <rect
                              x={icBot[0] - 15}
                              y={438}
                              width={30}
                              height={15}
                              rx={3}
                              fill="var(--surface)"
                              stroke={line.color}
                              strokeWidth={1}
                            />
                            <text
                              x={icBot[0]}
                              y={445.5}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="var(--text-secondary)"
                              fontSize="8.5"
                              fontFamily="JetBrains Mono, monospace"
                              fontWeight="600"
                            >
                              {line.symbol}IC
                            </text>
                          </g>
                        )}

                        {/* ASC Horizon Curve (Solid Curved) */}
                        {ascSegments.map((seg, idx) => (
                          <path
                            key={`asc-${idx}`}
                            d={seg}
                            fill="none"
                            stroke={line.color}
                            strokeWidth={1.65}
                            strokeOpacity={0.82}
                          />
                        ))}

                        {/* DSC Horizon Curve (Dotted Curved) */}
                        {dscSegments.map((seg, idx) => (
                          <path
                            key={`dsc-${idx}`}
                            d={seg}
                            fill="none"
                            stroke={line.color}
                            strokeWidth={1.35}
                            strokeDasharray="3 3"
                            strokeOpacity={0.7}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* City Pins from Gazetteer */}
                  {WORLD_CITIES.map(city => {
                    const pt = projection([city.longitude, city.latitude]);
                    if (!pt) return null;
                    const [cx, cy] = pt;
                    if (cx < 0 || cx > 960 || cy < 0 || cy > 460) return null;

                    const isSelected = activeCity.id === city.id;
                    const isBirth = profile.location.id === city.id;
                    const isNepal = city.country === 'Nepal';

                    // Avoid label crowding in global view by showing major cities + Nepal hubs
                    const showLabel =
                      region !== 'WORLD' ||
                      isSelected ||
                      isBirth ||
                      [
                        'np-kathmandu',
                        'np-pokhara',
                        'in-delhi',
                        'gb-london',
                        'ch-zurich',
                        'us-newyork',
                        'us-sfo',
                        'jp-tokyo',
                        'au-sydney',
                        'ae-dubai',
                        'sg-singapore',
                        'br-saopaulo',
                        'eg-cairo',
                      ].includes(city.id);

                    return (
                      <g
                        key={city.id}
                        className="cursor-pointer"
                        onClick={ev => {
                          ev.stopPropagation();
                          setActiveCity(city);
                        }}
                      >
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={9}
                            fill="none"
                            stroke="var(--brass)"
                            strokeWidth={1.8}
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 4.8 : isBirth ? 4.2 : isNepal ? 3.4 : 2.8}
                          fill={
                            isSelected
                              ? 'var(--brass)'
                              : isBirth
                              ? 'var(--crimson)'
                              : isNepal
                              ? 'var(--sage)'
                              : 'var(--text)'
                          }
                          stroke="var(--surface)"
                          strokeWidth={1}
                        />
                        {showLabel && (
                          <text
                            x={cx + 6}
                            y={cy + 3}
                            fill={isSelected ? 'var(--brass)' : 'var(--text)'}
                            fontSize={isSelected ? '10.5' : '9'}
                            fontWeight={isSelected || isBirth ? '700' : '500'}
                            style={{
                              paintOrder: 'stroke',
                              stroke: 'var(--surface)',
                              strokeWidth: '2.5px',
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                            }}
                          >
                            {city.name.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Active Custom Pin if not in WORLD_CITIES */}
                  {!WORLD_CITIES.some(c => c.id === activeCity.id) && (() => {
                    const pt = projection([activeCity.longitude, activeCity.latitude]);
                    if (!pt) return null;
                    return (
                      <g>
                        <circle cx={pt[0]} cy={pt[1]} r={9} fill="none" stroke="var(--crimson)" strokeWidth={2} />
                        <circle cx={pt[0]} cy={pt[1]} r={4.5} fill="var(--crimson)" stroke="var(--surface)" strokeWidth={1.2} />
                        <text
                          x={pt[0] + 8}
                          y={pt[1] + 3}
                          fill="var(--crimson)"
                          fontSize="10"
                          fontWeight="700"
                          style={{ paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: '2.5px' }}
                        >
                          {activeCity.name.split('(')[0].trim()}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              </svg>

              <div className="px-3.5 py-2 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[var(--brass)]" />
                  <span>
                    <strong>Interactive Map Tip:</strong> Click any city pin or click anywhere on the continents/oceans to inspect exact planetary lines at that coordinate.
                  </span>
                </div>
                <span className="font-mono text-[var(--text-muted)]">
                  Active Pin: {activeCity.latitude.toFixed(2)}°N, {activeCity.longitude.toFixed(2)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Selected Location Relocation Dossier (4 cols) */}
          <div className="lg:col-span-4 obs-panel p-4 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-xs font-mono uppercase font-semibold text-[var(--brass)]">
                  {activeEvaluation.primaryTag}
                </span>
                <h3 className="text-xl font-serif font-bold text-[var(--text)] mt-0.5">
                  {activeCity.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {activeCity.country} • {activeCity.latitude.toFixed(2)}°N, {activeCity.longitude.toFixed(2)}°E • {activeCity.elevationMeters}m
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-[var(--text-muted)]">Livability</div>
                <div className="text-2xl font-serif font-bold text-[var(--brass)]">
                  {activeEvaluation.overallScore}%
                </div>
              </div>
            </div>

            {/* 3 Domain Sub-Scores */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="obs-card p-2">
                <div className="text-[var(--text-muted)]">Career (MC)</div>
                <div className="font-mono font-bold text-sm text-[var(--brass)] mt-0.5">
                  {activeEvaluation.careerScore}%
                </div>
              </div>
              <div className="obs-card p-2">
                <div className="text-[var(--text-muted)]">Home (IC)</div>
                <div className="font-mono font-bold text-sm text-[var(--sage)] mt-0.5">
                  {activeEvaluation.sanctuaryScore}%
                </div>
              </div>
              <div className="obs-card p-2">
                <div className="text-[var(--text-muted)]">Love (DSC)</div>
                <div className="font-mono font-bold text-sm text-[var(--crimson)] mt-0.5">
                  {activeEvaluation.loveScore}%
                </div>
              </div>
            </div>

            {/* Active Planetary Lines Near This Location */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Nearest Planetary Lines (Within ±9.5° Orb)
              </div>

              {activeEvaluation.influences.length === 0 ? (
                <div className="obs-card p-3 text-xs text-[var(--text-secondary)]">
                  No major angular lines cross within 850 km of {activeCity.name}. In Jim Lewis’s Astro*Carto*Graphy tradition, "clear-sky" zones offer peaceful autonomy without intense planetary pressure.
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {activeEvaluation.influences.slice(0, 4).map((inf, idx) => (
                    <div key={idx} className="obs-card p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
                          <span style={{ color: inf.color }} className="text-sm">
                            {inf.symbol}
                          </span>
                          <span>{inf.title}</span>
                        </span>
                        <span className="font-mono text-[var(--brass)] font-semibold">
                          {inf.distanceKm} km ({inf.orbDegrees}°)
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">
                        Domain: {inf.domain} • Natal Dignity: {inf.planetDignity}
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{inf.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Any Custom City Worldwide to Test Relocation */}
            <div className="pt-2 border-t border-[var(--border)]">
              <GlobalLocationPicker
                label="Test Any City Worldwide or in Nepal for Relocation"
                value={activeCity}
                onChange={loc => {
                  setCustomCity(loc);
                  setActiveCity(loc);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: "Where Should I Live & Thrive?" — Ranked Recommendations */}
      <div className="obs-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brass)]">
              Personalized Relocation Recommendation Engine • Jim Lewis &amp; BPHS Digbala Synthesis
            </span>
            <h3 className="text-xl font-serif font-bold text-[var(--text)] mt-0.5">
              Recommended Places to Live, Build Wealth, Find Love &amp; Cultivate Peace
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Ranked across 42 global &amp; Nepal observatories based on your exact natal planetary lines and dignities.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'ALL_BEST' as const, label: 'Top Overall to Live', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'CAREER' as const, label: 'Career & Wealth (MC/ASC)', icon: <Briefcase className="w-3.5 h-3.5" /> },
              { id: 'SANCTUARY' as const, label: 'Home & Peace (IC)', icon: <Home className="w-3.5 h-3.5" /> },
              { id: 'LOVE' as const, label: 'Love & Marriage (DSC)', icon: <Heart className="w-3.5 h-3.5" /> },
              { id: 'NEPAL' as const, label: 'Nepal 7-Province Guide', icon: <Mountain className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRecFilter(tab.id)}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition ${
                  recFilter === tab.id
                    ? 'obs-badge-brass font-bold shadow-sm'
                    : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.map((item, rank) => {
            const isSel = activeCity.id === item.city.id;
            const topInf = item.influences[0];
            return (
              <div
                key={item.city.id}
                onClick={() => {
                  setActiveCity(item.city);
                  if (item.city.country === 'Nepal') setRegion('NEPAL_ASIA');
                }}
                className={`p-4 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                  isSel
                    ? 'obs-card border-2 border-[var(--brass)] shadow-sm'
                    : 'obs-panel hover:border-[var(--brass)]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-[var(--brass)] font-semibold">
                        #{rank + 1} • {item.primaryTag}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--brass)] shrink-0" />
                        <span>{item.city.name}</span>
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.city.state}, {item.city.country} ({item.city.elevationMeters}m)
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded obs-badge-brass font-mono font-bold text-sm">
                      {recFilter === 'CAREER'
                        ? `${item.careerScore}%`
                        : recFilter === 'SANCTUARY'
                        ? `${item.sanctuaryScore}%`
                        : recFilter === 'LOVE'
                        ? `${item.loveScore}%`
                        : `${item.overallScore}%`}
                    </div>
                  </div>

                  {topInf && (
                    <div className="mt-3 px-2.5 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">
                        <span style={{ color: topInf.color }} className="mr-1">
                          {topInf.symbol}
                        </span>
                        {topInf.title}
                      </span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {topInf.distanceKm} km {topInf.direction}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                    {item.headlineVerdict}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>
                    Career {item.careerScore}% • Home {item.sanctuaryScore}% • Love {item.loveScore}%
                  </span>
                  <span className="text-[var(--brass)] font-sans font-semibold">
                    View on Map &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
