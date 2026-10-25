import React, { useEffect, useState } from 'react';
import { MapPin, Search, Navigation, Sliders } from 'lucide-react';
import { CityLocation } from '../types/oceanology';
import {
  NEPAL_AND_GLOBAL_CITIES,
  formatCoordPair,
  getOffsetFromIanaOrLon,
  resolveTimezoneOffsetAtDate,
  searchGlobalLocations,
} from '../engines/locationAtlas';
import { formatCityForLang, formatCountryForLang, useLanguage } from '../i18n/i18n';

interface Props {
  value: CityLocation;
  onChange: (city: CityLocation) => void;
  label?: string;
}

export const GlobalLocationPicker: React.FC<Props> = ({ value, onChange, label }) => {
  const { lang, t } = useLanguage();
  const effectiveLabel =
    label ?? t('Location & Observatory Coordinates', 'स्थान र खगोलीय अक्षांश/देशान्तर');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomCoords, setShowCustomCoords] = useState(false);

  const nepalQuickCities = NEPAL_AND_GLOBAL_CITIES.filter((c) => c.country === 'Nepal').slice(0, 6);
  const featuredGlobalIds = [
    'sydney-au',
    'melbourne-au',
    'london-uk',
    'new-york-us',
    'new-delhi-in',
    'varanasi-in',
    'tokyo-jp',
    'singapore-sg',
  ];
  const globalQuickCities = featuredGlobalIds
    .map((id) => NEPAL_AND_GLOBAL_CITIES.find((c) => c.id === id))
    .filter((c): c is CityLocation => Boolean(c));
  const activeUtcOffset = resolveTimezoneOffsetAtDate(value, new Date());

  useEffect(() => {
    let active = true;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const found = await searchGlobalLocations(query);
      if (active) {
        setResults(found);
        setIsSearching(false);
      }
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleUseMyGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = Math.round(pos.coords.latitude * 10000) / 10000;
      const lon = Math.round(pos.coords.longitude * 10000) / 10000;
      const alt = Math.round(pos.coords.altitude || 150);
      const iana = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const offset = -new Date().getTimezoneOffset() / 60;
      onChange({
        id: `gps-${lat}-${lon}`,
        name: 'Current GPS Observatory',
        state: iana,
        country: 'Local Horizon',
        latitude: lat,
        longitude: lon,
        elevationMeters: alt,
        timezoneOffsetHours: offset,
        ianaTimezone: iana,
      });
    });
  };

  const formatUtcOffset = (hrs: number) => {
    const sign = hrs >= 0 ? '+' : '-';
    const abs = Math.abs(hrs);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[var(--brass)]" />
          <span>{effectiveLabel}</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyGps}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium obs-panel hover:border-[var(--brass)] transition"
          >
            <Navigation className="w-3 h-3 text-[var(--brass)]" />
            <span>{t('Detect My GPS', 'मेरो GPS पत्ता लगाउनुहोस्')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCustomCoords(!showCustomCoords)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium obs-panel hover:border-[var(--brass)] transition"
          >
            <Sliders className="w-3 h-3 text-[var(--brass)]" />
            <span>
              {showCustomCoords
                ? t('Hide Coordinates', 'अक्षांश लुकाउनुहोस्')
                : t('Exact Lat/Lon/UTC', 'सटीक अक्षांश/देशान्तर')}
            </span>
          </button>
        </div>
      </div>

      {/* Selected Location Summary & Live Search Input */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        {/* Active City Display */}
        <div className="md:col-span-5 obs-panel px-3 py-2 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-[var(--text)]">
              {formatCityForLang(value.name, lang)},{' '}
              <span className="text-[var(--text-secondary)]">
                {formatCountryForLang(value.country, lang)}
              </span>
            </div>
            <div className="font-mono text-xs text-[var(--text-muted)]">
              {formatCoordPair(value.latitude, value.longitude)} • {value.elevationMeters}m •{' '}
              {formatUtcOffset(activeUtcOffset)}
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-mono obs-badge-brass">
            {value.country === 'Nepal' ? 'NPT' : formatUtcOffset(activeUtcOffset)}
          </span>
        </div>

        {/* Worldwide Live Search Box */}
        <div className="md:col-span-7 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              placeholder={t(
                'Search any city, town, or village worldwide (e.g. Sydney, Melbourne, Kathmandu, London)...',
                'विश्वको कुनै पनि सहर वा गाउँ खोज्नुहोस् (जस्तै: Sydney, Melbourne, Kathmandu, London)...'
              )}
              className="w-full obs-input pl-9 pr-3 py-2.5 text-sm"
            />
          </div>

          {showDropdown && (query.trim().length >= 2 || results.length > 0) && (
            <div className="absolute z-50 mt-1 w-full obs-card shadow-xl max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
              {isSearching && (
                <div className="px-3.5 py-2.5 text-xs text-[var(--text-muted)]">
                  {t('Searching worldwide astronomical gazetteer...', 'विश्वव्यापी स्थान खोजिँदैछ...')}
                </div>
              )}
              {!isSearching && results.length === 0 && (
                <div className="px-3.5 py-2.5 text-xs text-[var(--text-muted)]">
                  {t(
                    'No direct city match — use "Exact Lat/Lon/UTC" to enter custom coordinates.',
                    'सीधा सहर भेटिएन — कस्टम अक्षांश/देशान्तर प्रविष्ट गर्नुहोस्।'
                  )}
                </div>
              )}
              {results.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    setShowDropdown(false);
                    setQuery('');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[var(--surface-muted)] flex items-center justify-between text-xs transition"
                >
                  <div>
                    <span className="font-semibold text-[var(--text)]">
                      {formatCityForLang(city.name, lang)}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {' '}
                      — {city.state ? `${city.state}, ` : ''}
                      {formatCountryForLang(city.country, lang)}
                    </span>
                  </div>
                  <span className="font-mono text-[var(--text-muted)]">
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}° • {city.elevationMeters}m (
                    {formatUtcOffset(city.timezoneOffsetHours)})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick-Select Observatory Presets: Nepal (All 7 Provinces) + Global Hubs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-xs font-semibold text-[var(--brass)] mr-1">
          {t('Nepal (UTC+05:45):', 'नेपाल (UTC+05:45):')}
        </span>
        {nepalQuickCities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => onChange(city)}
            className={`px-2.5 py-1 rounded text-xs transition ${
              value.id === city.id
                ? 'obs-badge-brass font-semibold'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            {formatCityForLang(city.name, lang)}
          </button>
        ))}

        <span className="text-xs font-semibold text-[var(--text-muted)] ml-2 mr-1">
          {t('Global:', 'विश्व:')}
        </span>
        {globalQuickCities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => onChange(city)}
            className={`px-2.5 py-1 rounded text-xs transition ${
              value.id === city.id
                ? 'obs-badge-brass font-semibold'
                : 'obs-panel text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            {formatCityForLang(city.name, lang)}
          </button>
        ))}
      </div>

      {/* Manual Precision Coordinate & Timezone Override */}
      {showCustomCoords && (
        <div className="obs-panel p-3 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="text-[var(--text-muted)] block mb-1">
              {t('Custom Place Name', 'स्थानको नाम')}
            </label>
            <input
              type="text"
              value={formatCityForLang(value.name, lang)}
              onChange={(e) => onChange({ ...value, id: 'custom-loc', name: e.target.value })}
              className="w-full obs-input"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">
              {t('Latitude (-90 to +90)', 'अक्षांश (-90 देखि +90)')}
            </label>
            <input
              type="number"
              step="0.0001"
              value={value.latitude}
              onChange={(e) =>
                onChange({ ...value, id: 'custom-loc', latitude: parseFloat(e.target.value) || 0 })
              }
              className="w-full obs-input font-mono"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">
              {t('Longitude (-180 to +180)', 'देशान्तर (-180 देखि +180)')}
            </label>
            <input
              type="number"
              step="0.0001"
              value={value.longitude}
              onChange={(e) => {
                const lon = parseFloat(e.target.value) || 0;
                onChange({
                  ...value,
                  id: 'custom-loc',
                  longitude: lon,
                  timezoneOffsetHours: getOffsetFromIanaOrLon(undefined, lon),
                });
              }}
              className="w-full obs-input font-mono"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">
              {t('Elevation (Meters)', 'उचाइ (मिटर)')}
            </label>
            <input
              type="number"
              value={value.elevationMeters}
              onChange={(e) =>
                onChange({
                  ...value,
                  id: 'custom-loc',
                  elevationMeters: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full obs-input font-mono"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">
              {t('UTC Offset (e.g. 5.75)', 'समय अन्तर (जस्तै: 5.75)')}
            </label>
            <input
              type="number"
              step="0.25"
              value={value.timezoneOffsetHours}
              onChange={(e) =>
                onChange({
                  ...value,
                  id: 'custom-loc',
                  timezoneOffsetHours: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full obs-input font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};
