import React, { useMemo, useState } from 'react';
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countriesAtlas from 'world-atlas/countries-110m.json';
import { Globe, Heart, Home, Sparkles, Briefcase, MapPin, Info } from 'lucide-react';
import { AstrocartographyLine, NatalChartResult } from '../engines/astronomyEngine';
import { BirthProfile, CityLocation, WORLD_CITIES } from '../types/oceanology';
import { ACG_LINE_INTERPRETATIONS } from '../data/classicalCompendium';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { KpiStatCard, SegmentedTabs, StatusBadge, WorkspacePageHeader } from './ui/DashboardPrimitives';
import {
  formatCityForLang,
  formatCountryForLang,
  trPlanet,
  useLanguage,
} from '../i18n/i18n';

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
  WORLD: { label: 'Global', center: [15, 12], scale: 152 },
  NEPAL_ASIA: { label: 'Nepal & South Asia', center: [84.1, 26.5], scale: 720 },
  EUROPE: { label: 'Europe', center: [12, 47], scale: 520 },
  AMERICAS: { label: 'Americas', center: [-82, 18], scale: 260 },
  EAST_ASIA: { label: 'East Asia', center: [128, 25], scale: 360 },
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
    const planetObj = chart.planets.find((p) => p.name === line.planet);
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

  influences.sort(
    (a, b) => b.scoreContribution - a.scoreContribution || a.orbDegrees - b.orbDegrees
  );

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
    Math.round(
      Math.max(careerScore, sanctuaryScore, loveScore) * 0.65 +
        ((careerScore + sanctuaryScore + loveScore) / 3) * 0.35
    )
  );

  const topInf = influences[0];
  let primaryTag = 'Balanced Clear-Sky Zone';
  if (topInf) {
    if (topInf.domain === 'Career') primaryTag = 'Career & Prestige Line';
    else if (topInf.domain === 'Sanctuary') primaryTag = 'Home Sanctuary Line';
    else if (topInf.domain === 'Love') primaryTag = 'Partnership Line';
    else primaryTag = 'Personal Vitality Line';
  }

  const headlineVerdict = topInf
    ? `Anchored by your ${topInf.symbol} ${topInf.title} (${topInf.distanceKm} km / ${topInf.orbDegrees}° orb). ${topInf.summary}`
    : `Balanced meridian zone free from intense angular pressure—suited for steady, self-directed living.`;

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
  const { lang, t } = useLanguage();
  const [region, setRegion] = useState<MapRegionId>('WORLD');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('ALL');
  const [recFilter, setRecFilter] = useState<RecommendationFilter>('ALL_BEST');
  const [customCity, setCustomCity] = useState<CityLocation>(profile.location);
  const [activeCity, setActiveCity] = useState<CityLocation>(profile.location);

  const countriesGeo = useMemo(() => {
    const raw = countriesAtlas as any;
    return feature(raw, raw.objects.countries) as any;
  }, []);

  const graticuleGeo = useMemo(() => geoGraticule10(), []);

  const { projection, pathGenerator } = useMemo(() => {
    const cfg = MAP_REGIONS[region];
    const proj = geoEquirectangular()
      .center(cfg.center)
      .scale(cfg.scale)
      .translate([480, 230]);
    const pathGen = geoPath(proj);
    return { projection: proj, pathGenerator: pathGen };
  }, [region]);

  const allEvaluations = useMemo(() => {
    const map = new Map<string, CityLocation>();
    for (const c of WORLD_CITIES) map.set(c.id, c);
    map.set(profile.location.id, profile.location);
    map.set(customCity.id, customCity);

    return Array.from(map.values()).map((c) => evaluateLocationAstrocartography(c, chart));
  }, [chart, profile.location, customCity]);

  const activeEvaluation = useMemo(
    () => evaluateLocationAstrocartography(activeCity, chart),
    [activeCity, chart]
  );

  const topCareerCity = useMemo(
    () => [...allEvaluations].sort((a, b) => b.careerScore - a.careerScore)[0],
    [allEvaluations]
  );
  const topSanctuaryCity = useMemo(
    () => [...allEvaluations].sort((a, b) => b.sanctuaryScore - a.sanctuaryScore)[0],
    [allEvaluations]
  );
  const topLoveCity = useMemo(
    () => [...allEvaluations].sort((a, b) => b.loveScore - a.loveScore)[0],
    [allEvaluations]
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
          .filter((item) => item.city.country === 'Nepal')
          .sort((a, b) => b.overallScore - a.overallScore);
      case 'ALL_BEST':
      default:
        return list.sort((a, b) => b.overallScore - a.overallScore).slice(0, 9);
    }
  }, [allEvaluations, recFilter]);

  const buildProjectedCurveSegments = (curve: { lat: number; lon: number }[]) => {
    const segments: string[] = [];
    let currentPts: [number, number][] = [];

    for (let i = 0; i < curve.length; i++) {
      const pt = curve[i];
      if (i > 0 && Math.abs(pt.lon - curve[i - 1].lon) > 90) {
        if (currentPts.length > 1) {
          segments.push(
            currentPts
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
              .join(' ')
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
        currentPts
          .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
          .join(' ')
      );
    }
    return segments;
  };

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
        name: `Coordinate (${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(
          lon
        ).toFixed(1)}°${lon >= 0 ? 'E' : 'W'})`,
        country: 'Custom Pin',
        state: 'Map Coordinate',
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
        (l) => selectedPlanet === 'ALL' || l.planet === selectedPlanet
      ),
    [chart.astrocartography, selectedPlanet]
  );

  return (
    <div className="space-y-6">
      {/* ==================== PAGE HEADER & REGION LENS ==================== */}
      <WorkspacePageHeader
        title={t('World Astrocartography & Relocation Atlas', 'विश्व एस्ट्रोकार्टोग्राफी र स्थान चयन नक्सा')}
        subtitle={t(
          `Planetary MC/IC/ASC/DSC lines for ${profile.firstName} ${profile.lastName}. Click any city or map coordinate to evaluate livability.`,
          `${profile.firstName} ${profile.lastName} का ग्रह रेखाहरू (MC/IC/ASC/DSC)। कुनै पनि सहर वा नक्सामा क्लिक गरी बसोबास र करियर अनुकूलता हेर्नुहोस्।`
        )}
        actions={
          <SegmentedTabs
            ariaLabel="Map region zoom"
            value={region}
            onChange={setRegion}
            items={(Object.keys(MAP_REGIONS) as MapRegionId[]).map((rKey) => ({
              id: rKey,
              label:
                lang === 'ne'
                  ? rKey === 'WORLD'
                    ? 'विश्व'
                    : rKey === 'NEPAL_ASIA'
                    ? 'नेपाल र दक्षिण एसिया'
                    : rKey === 'EUROPE'
                    ? 'युरोप'
                    : rKey === 'AMERICAS'
                    ? 'अमेरिका'
                    : 'पूर्वी एसिया'
                  : MAP_REGIONS[rKey].label,
            }))}
          />
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL RELOCATION KPIs ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label={t('Selected Location Score', 'छानिएको स्थान अनुकूलता')}
          value={`${activeEvaluation.overallScore}%`}
          subvalue={formatCityForLang(activeCity.name, lang)}
          benchmarkText={activeEvaluation.primaryTag}
          status={{
            tone: activeEvaluation.overallScore >= 75 ? 'optimal' : 'favorable',
            label: formatCountryForLang(activeCity.country, lang),
          }}
          icon={<Globe className="w-4 h-4" />}
        />

        {topCareerCity && (
          <KpiStatCard
            label={t('Top Career Hub (MC)', 'सर्वोत्तम करियर सहर (MC)')}
            value={formatCityForLang(topCareerCity.city.name, lang)}
            subvalue={`${topCareerCity.careerScore}%`}
            benchmarkText={formatCountryForLang(topCareerCity.city.country, lang)}
            status={{ tone: 'optimal', label: t('Career Peak', 'करियर शिखर') }}
            icon={<Briefcase className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => setActiveCity(topCareerCity.city)}
          />
        )}

        {topSanctuaryCity && (
          <KpiStatCard
            label={t('Top Sanctuary Hub (IC)', 'सर्वोत्तम शान्ति र आवास (IC)')}
            value={formatCityForLang(topSanctuaryCity.city.name, lang)}
            subvalue={`${topSanctuaryCity.sanctuaryScore}%`}
            benchmarkText={formatCountryForLang(topSanctuaryCity.city.country, lang)}
            status={{ tone: 'favorable', label: t('Home & Peace', 'सुख र शान्ति') }}
            icon={<Home className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => setActiveCity(topSanctuaryCity.city)}
          />
        )}

        {topLoveCity && (
          <KpiStatCard
            label={t('Top Partnership Hub (DSC)', 'सर्वोत्तम सम्बन्ध सहर (DSC)')}
            value={formatCityForLang(topLoveCity.city.name, lang)}
            subvalue={`${topLoveCity.loveScore}%`}
            benchmarkText={formatCountryForLang(topLoveCity.city.country, lang)}
            status={{ tone: 'info', label: t('Love & Union', 'प्रेम र सहकार्य') }}
            icon={<Heart className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => setActiveCity(topLoveCity.city)}
          />
        )}
      </div>

      {/* ==================== ROW 2: WORLD MAP + LIVE PIN DOSSIER ==================== */}
      <div className="obs-card p-5 space-y-4">
        {/* Planet Filter Bar + Line Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)] text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPlanet('ALL')}
              className={`ui-chip ${selectedPlanet === 'ALL' ? 'ui-chip-active' : ''}`}
            >
              {t('All 10 Planets', 'सबै १० ग्रह')}
            </button>
            {chart.astrocartography.map((line) => (
              <button
                key={line.planet}
                type="button"
                onClick={() => setSelectedPlanet(line.planet)}
                className={`ui-chip ${selectedPlanet === line.planet ? 'ui-chip-active' : ''}`}
              >
                <span style={{ color: line.color }}>{line.symbol}</span>
                <span>{trPlanet(line.planet, lang)}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
            <span>Solid = MC / ASC</span>
            <span>•</span>
            <span>Dashed = IC</span>
            <span>•</span>
            <span>Dotted = DSC</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Interactive Map Canvas */}
          <div className="lg:col-span-8">
            <div className="rounded-lg overflow-hidden border border-[var(--border-strong)] bg-[var(--chart-bg)]">
              <svg
                viewBox="0 0 960 460"
                className="w-full h-auto cursor-crosshair select-none block"
                onClick={handleSvgMapClick}
                role="img"
                aria-label="Interactive astrocartography world map"
              >
                <defs>
                  <clipPath id="world-map-clip">
                    <rect x="0" y="0" width="960" height="460" />
                  </clipPath>
                </defs>

                <g clipPath="url(#world-map-clip)">
                  <rect x="0" y="0" width="960" height="460" fill="var(--chart-bg)" />

                  <path
                    d={pathGenerator(graticuleGeo) || ''}
                    fill="none"
                    stroke="var(--chart-grid)"
                    strokeWidth={0.5}
                    strokeOpacity={0.6}
                  />

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

                  {countriesGeo.features.map((feat: any, idx: number) => {
                    const isNepal = feat.id === '524' || feat.id === 524;
                    return (
                      <path
                        key={feat.id || idx}
                        d={pathGenerator(feat) || ''}
                        fill={isNepal ? 'var(--accent-bg)' : 'var(--chart-ring)'}
                        stroke={isNepal ? 'var(--accent)' : 'var(--border-strong)'}
                        strokeWidth={isNepal ? 1.3 : 0.65}
                      />
                    );
                  })}

                  {visibleLines.map((line) => {
                    const mcTop = projection([line.mcLongitude, 78]);
                    const mcBot = projection([line.mcLongitude, -78]);
                    const icTop = projection([line.icLongitude, 78]);
                    const icBot = projection([line.icLongitude, -78]);
                    const ascSegments = buildProjectedCurveSegments(line.ascCurve);
                    const dscSegments = buildProjectedCurveSegments(line.dscCurve);

                    return (
                      <g key={line.planet}>
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

                  {WORLD_CITIES.map((city) => {
                    const pt = projection([city.longitude, city.latitude]);
                    if (!pt) return null;
                    const [cx, cy] = pt;
                    if (cx < 0 || cx > 960 || cy < 0 || cy > 460) return null;

                    const isSelected = activeCity.id === city.id;
                    const isBirth = profile.location.id === city.id;
                    const isNepal = city.country === 'Nepal';

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
                      ].includes(city.id);

                    return (
                      <g
                        key={city.id}
                        className="cursor-pointer"
                        onClick={(ev) => {
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
                            stroke="var(--accent)"
                            strokeWidth={1.8}
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 4.8 : isBirth ? 4.2 : isNepal ? 3.4 : 2.8}
                          fill={
                            isSelected
                              ? 'var(--accent)'
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
                            fill={isSelected ? 'var(--accent)' : 'var(--text)'}
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
                            {formatCityForLang(city.name, lang)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              <div className="px-3.5 py-2 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>
                    {t(
                      'Click any city pin or map coordinate to inspect exact line distances.',
                      'ग्रह रेखाको सटीक दूरी हेर्न कुनै पनि सहर वा नक्सामा क्लिक गर्नुहोस्।'
                    )}
                  </span>
                </div>
                <span className="font-mono text-[var(--text-muted)]">
                  Pin: {activeCity.latitude.toFixed(2)}°N, {activeCity.longitude.toFixed(2)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Right Pin Inspector */}
          <div className="lg:col-span-4 obs-panel p-4 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <StatusBadge tone="info" label={activeEvaluation.primaryTag} />
                <h2 className="text-lg font-bold text-[var(--text)] mt-1.5">
                  {formatCityForLang(activeCity.name, lang)}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {formatCountryForLang(activeCity.country, lang)} • {activeCity.elevationMeters}m
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-[var(--text-muted)]">{t('Overall', 'कुल अंक')}</div>
                <div className="text-2xl font-bold text-[var(--accent)] tabular-nums">
                  {activeEvaluation.overallScore}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Career', 'करियर')}</div>
                <div className="font-mono font-bold text-sm text-[var(--accent)] mt-0.5 tabular-nums">
                  {activeEvaluation.careerScore}%
                </div>
              </div>
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Home', 'आवास')}</div>
                <div className="font-mono font-bold text-sm text-[var(--sage)] mt-0.5 tabular-nums">
                  {activeEvaluation.sanctuaryScore}%
                </div>
              </div>
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Love', 'प्रेम')}</div>
                <div className="font-mono font-bold text-sm text-[var(--crimson)] mt-0.5 tabular-nums">
                  {activeEvaluation.loveScore}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--text)]">
                {t('Nearest Planetary Lines (±9.5° Orb)', 'नजिकैका ग्रह रेखाहरू (±9.5°)')}
              </div>

              {activeEvaluation.influences.length === 0 ? (
                <div className="obs-card p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {t(
                    `No major angular lines cross within 850 km of ${formatCityForLang(activeCity.name, 'en')}. Clear-sky zones support steady autonomy without acute angular pressure.`,
                    `${formatCityForLang(activeCity.name, 'ne')} को ८५० कि.मि. भित्र कुनै तीव्र ग्रह रेखा परेको छैन—यो शान्त र सन्तुलित क्षेत्र हो।`
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {activeEvaluation.influences.slice(0, 4).map((inf, idx) => (
                    <div key={idx} className="obs-card p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
                          <span style={{ color: inf.color }} className="text-sm">
                            {inf.symbol}
                          </span>
                          <span>{inf.title}</span>
                        </span>
                        <span className="font-mono text-[var(--accent)] font-semibold">
                          {inf.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{inf.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <GlobalLocationPicker
                label={t('Search any city worldwide', 'विश्वको कुनै पनि सहर खोज्नुहोस्')}
                value={activeCity}
                onChange={(loc) => {
                  setCustomCity(loc);
                  setActiveCity(loc);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ROW 3: RANKED RELOCATION RECOMMENDATIONS ==================== */}
      <div className="obs-card p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              {t('Ranked Relocation Recommendations', 'शीर्ष बसोबास तथा करियर सहर सिफारिस')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(
                'Evaluated across global cities and all 7 provinces of Nepal from your natal angles',
                'तपाईंको जन्म लग्न र ग्रह कोण अनुसार नेपालका ७ वटै प्रदेश तथा विश्वका प्रमुख सहरहरूको मूल्याङ्कन'
              )}
            </p>
          </div>

          <SegmentedTabs
            ariaLabel="Relocation goal filter"
            value={recFilter}
            onChange={setRecFilter}
            items={[
              { id: 'ALL_BEST', label: t('Top Overall', 'सर्वोत्कृष्ट') },
              { id: 'CAREER', label: t('Career & Wealth', 'करियर र धन') },
              { id: 'SANCTUARY', label: t('Home & Peace', 'शान्ति र घर') },
              { id: 'LOVE', label: t('Love & Union', 'प्रेम र सम्बन्ध') },
              { id: 'NEPAL', label: t('Nepal Cities', 'नेपालका सहर') },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.map((item, rank) => {
            const isSel = activeCity.id === item.city.id;
            const topInf = item.influences[0];
            const scoreVal =
              recFilter === 'CAREER'
                ? item.careerScore
                : recFilter === 'SANCTUARY'
                ? item.sanctuaryScore
                : recFilter === 'LOVE'
                ? item.loveScore
                : item.overallScore;
            return (
              <div
                key={item.city.id}
                onClick={() => {
                  setActiveCity(item.city);
                  if (item.city.country === 'Nepal') setRegion('NEPAL_ASIA');
                }}
                className={`p-4 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isSel
                    ? 'border-[var(--accent)] bg-[var(--accent-bg)]/40'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                        #{rank + 1} • {item.primaryTag}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <span>{formatCityForLang(item.city.name, lang)}</span>
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.city.state}, {formatCountryForLang(item.city.country, lang)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={scoreVal >= 75 ? 'optimal' : 'favorable'}
                      label={`${scoreVal}%`}
                    />
                  </div>

                  {topInf && (
                    <div className="px-2.5 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs">
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

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.headlineVerdict}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>
                    C {item.careerScore}% • H {item.sanctuaryScore}% • L {item.loveScore}%
                  </span>
                  <span className="font-sans font-semibold text-[var(--accent)]">
                    Select →
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
