import React, { useEffect, useMemo, useState } from 'react';
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countriesAtlas from 'world-atlas/countries-110m.json';
import { Globe, Heart, Home, Briefcase, MapPin, Info } from 'lucide-react';
import { AstrocartographyLine, NatalChartResult } from '../engines/astronomyEngine';
import { BirthProfile, CityLocation, WORLD_CITIES } from '../types/oceanology';
import { formatCoordPair } from '../engines/locationAtlas';
import {
  evaluateLocationAstrocartographyLocalized,
  LocalizedCityRelocationEvaluation,
  normalizeCountryKey,
} from '../engines/relocationEngine';
import { GlobalLocationPicker } from './GlobalLocationPicker';
import { KpiStatCard, SegmentedTabs, StatusBadge, WorkspacePageHeader } from './ui/DashboardPrimitives';
import {
  formatCityForLang,
  formatCountryForLang,
  toNepaliDigits,
  trPlanet,
  useLanguage,
} from '../i18n/i18n';

interface Props {
  profile: BirthProfile;
  chart: NatalChartResult;
}

type MapRegionId = 'WORLD' | 'OCEANIA' | 'NEPAL_ASIA' | 'EUROPE' | 'AMERICAS' | 'EAST_ASIA';
type RecommendationFilter = 'ALL_BEST' | 'MY_COUNTRY' | 'CAREER' | 'SANCTUARY' | 'LOVE';

const MAP_REGIONS: Record<
  MapRegionId,
  { labelEn: string; labelNe: string; center: [number, number]; scale: number }
> = {
  WORLD: { labelEn: 'Global', labelNe: 'विश्व', center: [15, 12], scale: 152 },
  OCEANIA: {
    labelEn: 'Australia & Oceania',
    labelNe: 'अष्ट्रेलिया र ओशिनिया',
    center: [138, -27],
    scale: 430,
  },
  NEPAL_ASIA: {
    labelEn: 'Nepal & South Asia',
    labelNe: 'नेपाल र दक्षिण एसिया',
    center: [84.1, 26.5],
    scale: 720,
  },
  EUROPE: { labelEn: 'Europe', labelNe: 'युरोप', center: [12, 47], scale: 520 },
  AMERICAS: { labelEn: 'Americas', labelNe: 'अमेरिका', center: [-82, 18], scale: 260 },
  EAST_ASIA: { labelEn: 'East Asia', labelNe: 'पूर्वी एसिया', center: [128, 25], scale: 360 },
};

const COUNTRY_ISO_NUMERIC: Record<string, string[]> = {
  nepal: ['524'],
  australia: ['036', '36'],
  india: ['356'],
  usa: ['840'],
  uk: ['826'],
  canada: ['124'],
  japan: ['392'],
  'new zealand': ['554'],
  'south korea': ['410'],
  france: ['250'],
  germany: ['276'],
  switzerland: ['756'],
  portugal: ['620'],
  czechia: ['203'],
  brazil: ['076', '76'],
  uae: ['784'],
  qatar: ['634'],
  bhutan: ['064', '64'],
  'sri lanka': ['144'],
};

function inferRegionForCity(city: CityLocation): MapRegionId {
  const key = normalizeCountryKey(city.country || '');
  if (['nepal', 'india', 'bhutan', 'sri lanka', 'bangladesh'].includes(key)) {
    return 'NEPAL_ASIA';
  }
  if (['australia', 'new zealand'].includes(key)) {
    return 'OCEANIA';
  }
  if (['uk', 'france', 'germany', 'switzerland', 'czechia', 'portugal', 'italy', 'greece'].includes(key)) {
    return 'EUROPE';
  }
  if (['usa', 'canada', 'brazil'].includes(key)) {
    return 'AMERICAS';
  }
  if (['japan', 'south korea', 'singapore', 'china', 'thailand'].includes(key)) {
    return 'EAST_ASIA';
  }
  return 'WORLD';
}

export function evaluateLocationAstrocartography(
  city: CityLocation,
  chart: NatalChartResult
): LocalizedCityRelocationEvaluation {
  return evaluateLocationAstrocartographyLocalized(city, chart, 'en');
}

export const AstrocartographyWorldMap: React.FC<Props> = ({ profile, chart }) => {
  const { lang, t } = useLanguage();
  const [region, setRegion] = useState<MapRegionId>(() => inferRegionForCity(profile.location));
  const [selectedPlanet, setSelectedPlanet] = useState<string>('ALL');
  const [recFilter, setRecFilter] = useState<RecommendationFilter>('MY_COUNTRY');
  const [customCity, setCustomCity] = useState<CityLocation>(profile.location);
  const [activeCity, setActiveCity] = useState<CityLocation>(profile.location);

  // Sync activeCity, customCity, and regional zoom whenever profile.location changes
  useEffect(() => {
    setActiveCity(profile.location);
    setCustomCity(profile.location);
    setRegion(inferRegionForCity(profile.location));
  }, [
    profile.location.id,
    profile.location.name,
    profile.location.country,
    profile.location.latitude,
    profile.location.longitude,
  ]);

  const fmtNum = (v: number | string) => (lang === 'ne' ? toNepaliDigits(v) : String(v));
  const userCountryKey = normalizeCountryKey(profile.location.country || 'Australia');
  const userCountryDisplay = formatCountryForLang(profile.location.country, lang);
  const highlightedIsoIds = COUNTRY_ISO_NUMERIC[userCountryKey] || [];

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

  const mapCities = useMemo(() => {
    const map = new Map<string, CityLocation>();
    for (const c of WORLD_CITIES) map.set(c.id, c);
    map.set(profile.location.id, profile.location);
    map.set(customCity.id, customCity);
    map.set(activeCity.id, activeCity);
    return Array.from(map.values());
  }, [profile.location, customCity, activeCity]);

  const allEvaluations = useMemo(() => {
    return mapCities.map((c) => evaluateLocationAstrocartographyLocalized(c, chart, lang));
  }, [mapCities, chart, lang]);

  const activeEvaluation = useMemo(
    () => evaluateLocationAstrocartographyLocalized(activeCity, chart, lang),
    [activeCity, chart, lang]
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
      case 'MY_COUNTRY': {
        const domestic = list
          .filter((item) => normalizeCountryKey(item.city.country) === userCountryKey)
          .sort((a, b) => b.overallScore - a.overallScore);
        return domestic.length > 0
          ? domestic.slice(0, 9)
          : list.sort((a, b) => b.overallScore - a.overallScore).slice(0, 9);
      }
      case 'CAREER':
        return list.sort((a, b) => b.careerScore - a.careerScore).slice(0, 9);
      case 'SANCTUARY':
        return list.sort((a, b) => b.sanctuaryScore - a.sanctuaryScore).slice(0, 9);
      case 'LOVE':
        return list.sort((a, b) => b.loveScore - a.loveScore).slice(0, 9);
      case 'ALL_BEST':
      default:
        return list.sort((a, b) => b.overallScore - a.overallScore).slice(0, 9);
    }
  }, [allEvaluations, recFilter, userCountryKey]);

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
    let minDeg = 2.4;
    for (const c of mapCities) {
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
        name:
          lang === 'ne'
            ? `कस्टम निर्देशांक (${toNepaliDigits(Math.abs(lat).toFixed(1))}°${
                lat >= 0 ? 'उ' : 'द'
              }, ${toNepaliDigits(Math.abs(lon).toFixed(1))}°${lon >= 0 ? 'पू' : 'प'})`
            : `Coordinate (${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(
                lon
              ).toFixed(1)}°${lon >= 0 ? 'E' : 'W'})`,
        country: 'Custom Pin',
        state: lang === 'ne' ? 'नक्सा निर्देशांक' : 'Map Coordinate',
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
        title={t(
          'World Astrocartography & Relocation Atlas',
          'विश्व एस्ट्रोकार्टोग्राफी र स्थान चयन नक्सा'
        )}
        subtitle={t(
          `Planetary MC/IC/ASC/DSC lines for ${profile.firstName} ${profile.lastName} (${formatCityForLang(
            profile.location.name,
            'en'
          )}, ${profile.location.country}). Click any city or map coordinate to evaluate livability.`,
          `${profile.firstName} ${profile.lastName} (${formatCityForLang(
            profile.location.name,
            'ne'
          )}, ${userCountryDisplay}) का ग्रह रेखाहरू। कुनै पनि सहर वा नक्सामा क्लिक गरी बसोबास र करियर अनुकूलता हेर्नुहोस्।`
        )}
        actions={
          <SegmentedTabs
            ariaLabel="Map region zoom"
            value={region}
            onChange={setRegion}
            items={(Object.keys(MAP_REGIONS) as MapRegionId[]).map((rKey) => ({
              id: rKey,
              label: lang === 'ne' ? MAP_REGIONS[rKey].labelNe : MAP_REGIONS[rKey].labelEn,
            }))}
          />
        }
      />

      {/* ==================== ROW 1: 4 CONTEXTUAL RELOCATION KPIs ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label={t('Selected Location Score', 'छानिएको स्थान अनुकूलता')}
          value={`${fmtNum(activeEvaluation.overallScore)}%`}
          subvalue={activeEvaluation.cityLabel}
          benchmarkText={activeEvaluation.primaryTag}
          status={{
            tone: activeEvaluation.overallScore >= 75 ? 'optimal' : 'favorable',
            label: activeEvaluation.countryLabel,
          }}
          icon={<Globe className="w-4 h-4" />}
        />

        {topCareerCity && (
          <KpiStatCard
            label={t('Top Career Hub (MC)', 'सर्वोत्तम करियर सहर (दशम)')}
            value={topCareerCity.cityLabel}
            subvalue={`${fmtNum(topCareerCity.careerScore)}%`}
            benchmarkText={topCareerCity.countryLabel}
            status={{ tone: 'optimal', label: t('Career Peak', 'करियर शिखर') }}
            icon={<Briefcase className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => {
              setActiveCity(topCareerCity.city);
              setRegion(inferRegionForCity(topCareerCity.city));
            }}
          />
        )}

        {topSanctuaryCity && (
          <KpiStatCard
            label={t('Top Sanctuary Hub (IC)', 'सर्वोत्तम शान्ति र आवास (चतुर्थ)')}
            value={topSanctuaryCity.cityLabel}
            subvalue={`${fmtNum(topSanctuaryCity.sanctuaryScore)}%`}
            benchmarkText={topSanctuaryCity.countryLabel}
            status={{ tone: 'favorable', label: t('Home & Peace', 'सुख र शान्ति') }}
            icon={<Home className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => {
              setActiveCity(topSanctuaryCity.city);
              setRegion(inferRegionForCity(topSanctuaryCity.city));
            }}
          />
        )}

        {topLoveCity && (
          <KpiStatCard
            label={t('Top Partnership Hub (DSC)', 'सर्वोत्तम सम्बन्ध सहर (सप्तम)')}
            value={topLoveCity.cityLabel}
            subvalue={`${fmtNum(topLoveCity.loveScore)}%`}
            benchmarkText={topLoveCity.countryLabel}
            status={{ tone: 'info', label: t('Love & Union', 'प्रेम र सहकार्य') }}
            icon={<Heart className="w-4 h-4" />}
            actionLabel={t('Inspect on map', 'नक्सामा हेर्नुहोस्')}
            onAction={() => {
              setActiveCity(topLoveCity.city);
              setRegion(inferRegionForCity(topLoveCity.city));
            }}
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

          <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums text-[var(--text-muted)]">
            <span>{t('Solid = MC / ASC', 'सीधा रेखा = दशम / लग्न')}</span>
            <span>•</span>
            <span>{t('Dashed = IC', 'तुर्के रेखा = चतुर्थ (आवास)')}</span>
            <span>•</span>
            <span>{t('Dotted = DSC', 'थोप्ले रेखा = सप्तम (सम्बन्ध)')}</span>
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
                    const featIdStr = String(feat.id ?? '');
                    const isUserCountry = highlightedIsoIds.includes(featIdStr);
                    return (
                      <path
                        key={feat.id || idx}
                        d={pathGenerator(feat) || ''}
                        fill={isUserCountry ? 'var(--accent-bg)' : 'var(--chart-ring)'}
                        stroke={isUserCountry ? 'var(--accent)' : 'var(--border-strong)'}
                        strokeWidth={isUserCountry ? 1.35 : 0.65}
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

                  {mapCities.map((city) => {
                    const pt = projection([city.longitude, city.latitude]);
                    if (!pt) return null;
                    const [cx, cy] = pt;
                    if (cx < 0 || cx > 960 || cy < 0 || cy > 460) return null;

                    const isSelected = activeCity.id === city.id;
                    const isBirth = profile.location.id === city.id;
                    const isUserCountryCity = normalizeCountryKey(city.country) === userCountryKey;

                    const isMajorWorldAnchor = [
                      'kathmandu-np',
                      'new-delhi-in',
                      'london-uk',
                      'zurich-ch',
                      'new-york-us',
                      'san-francisco-us',
                      'tokyo-jp',
                      'sydney-au',
                      'dubai-ae',
                      'singapore-sg',
                    ].includes(city.id);

                    const isRegionalNonOverlappingLabel =
                      region !== 'WORLD' &&
                      [
                        'kathmandu-np',
                        'pokhara-np',
                        'biratnagar-np',
                        'dhangadhi-np',
                        'new-delhi-in',
                        'mumbai-in',
                        'varanasi-in',
                        'ujjain-in',
                        'kolkata-in',
                        'bengaluru-in',
                        'hyderabad-in',
                        'colombo-lk',
                        'thimphu-bt',
                        'sydney-au',
                        'melbourne-au',
                        'brisbane-au',
                        'perth-au',
                        'adelaide-au',
                        'darwin-au',
                        'hobart-au',
                        'auckland-nz',
                        'london-uk',
                        'edinburgh-uk',
                        'paris-fr',
                        'berlin-de',
                        'zurich-ch',
                        'prague-cz',
                        'lisbon-pt',
                        'new-york-us',
                        'san-francisco-us',
                        'los-angeles-us',
                        'seattle-us',
                        'chicago-us',
                        'dallas-us',
                        'miami-us',
                        'toronto-ca',
                        'vancouver-ca',
                        'calgary-ca',
                        'sao-paulo-br',
                        'tokyo-jp',
                        'seoul-kr',
                        'singapore-sg',
                        'dubai-ae',
                        'doha-qa',
                      ].includes(city.id);

                    const showLabel =
                      isSelected || isBirth || isMajorWorldAnchor || isRegionalNonOverlappingLabel;

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
                          r={isSelected ? 4.8 : isBirth ? 4.2 : isUserCountryCity ? 3.5 : 2.8}
                          fill={
                            isSelected
                              ? 'var(--accent)'
                              : isBirth
                              ? 'var(--crimson)'
                              : isUserCountryCity
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
                  {t('Pin:', 'पिन:')} {formatCoordPair(activeCity.latitude, activeCity.longitude)}
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
                  {activeEvaluation.cityLabel}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {activeEvaluation.countryLabel} • {fmtNum(activeCity.elevationMeters)}
                  {t('m', ' मिटर')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-[var(--text-muted)]">{t('Overall', 'कुल अंक')}</div>
                <div className="text-2xl font-bold text-[var(--accent)] tabular-nums">
                  {fmtNum(activeEvaluation.overallScore)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Career', 'करियर')}</div>
                <div className="font-mono font-bold text-sm text-[var(--accent)] mt-0.5 tabular-nums">
                  {fmtNum(activeEvaluation.careerScore)}%
                </div>
              </div>
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Home', 'आवास')}</div>
                <div className="font-mono font-bold text-sm text-[var(--sage)] mt-0.5 tabular-nums">
                  {fmtNum(activeEvaluation.sanctuaryScore)}%
                </div>
              </div>
              <div className="obs-card p-2.5">
                <div className="text-[var(--text-muted)]">{t('Love', 'प्रेम')}</div>
                <div className="font-mono font-bold text-sm text-[var(--crimson)] mt-0.5 tabular-nums">
                  {fmtNum(activeEvaluation.loveScore)}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--text)]">
                {t('Nearest Planetary Lines (±9.5° Orb)', 'नजिकैका ग्रह रेखाहरू (±९.५°)')}
              </div>

              {activeEvaluation.influences.length === 0 ? (
                <div className="obs-card p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeEvaluation.headlineVerdict}
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
                        <span className="font-mono text-[var(--accent)] font-semibold shrink-0">
                          {fmtNum(inf.distanceKm)} {t('km', 'कि.मि.')}
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
                  setRegion(inferRegionForCity(loc));
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
                `Evaluated across ${userCountryDisplay} and global cities from your natal planetary angles`,
                `तपाईंको जन्म लग्न र ग्रह कोण अनुसार ${userCountryDisplay} तथा विश्वका प्रमुख सहरहरूको मूल्याङ्कन`
              )}
            </p>
          </div>

          <SegmentedTabs
            ariaLabel="Relocation goal filter"
            value={recFilter}
            onChange={setRecFilter}
            items={[
              {
                id: 'MY_COUNTRY',
                label: t(`${userCountryDisplay} Cities`, `${userCountryDisplay} का सहर`),
              },
              { id: 'ALL_BEST', label: t('Global Best', 'विश्व सर्वोत्कृष्ट') },
              { id: 'CAREER', label: t('Career & Wealth', 'करियर र धन') },
              { id: 'SANCTUARY', label: t('Home & Peace', 'शान्ति र घर') },
              { id: 'LOVE', label: t('Love & Union', 'प्रेम र सम्बन्ध') },
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
                  setRegion(inferRegionForCity(item.city));
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
                        #{fmtNum(rank + 1)} • {item.primaryTag}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <span>{item.cityLabel}</span>
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.stateLabel}, {item.countryLabel}
                      </p>
                    </div>
                    <StatusBadge
                      tone={scoreVal >= 75 ? 'optimal' : 'favorable'}
                      label={`${fmtNum(scoreVal)}%`}
                    />
                  </div>

                  {topInf && (
                    <div className="px-2.5 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-[var(--text)] truncate">
                        <span style={{ color: topInf.color }} className="mr-1">
                          {topInf.symbol}
                        </span>
                        {topInf.title}
                      </span>
                      <span className="font-mono text-[var(--text-muted)] shrink-0">
                        {fmtNum(topInf.distanceKm)} {t('km', 'कि.मि.')} {topInf.directionLabel}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.headlineVerdict}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>
                    {t('Career', 'करियर')} {fmtNum(item.careerScore)}% •{' '}
                    {t('Home', 'आवास')} {fmtNum(item.sanctuaryScore)}% •{' '}
                    {t('Love', 'प्रेम')} {fmtNum(item.loveScore)}%
                  </span>
                  <span className="font-sans font-semibold text-[var(--accent)]">
                    {t('Select →', 'छान्नुहोस् →')}
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
