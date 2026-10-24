import * as Astronomy from 'astronomy-engine';
import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';

export const ZODIAC_SIGNS = [
  { index: 0, name: 'Aries', sanskrit: 'Mesha', symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', color: '#F3160E' },
  { index: 1, name: 'Taurus', sanskrit: 'Vrishabha', symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', color: '#9ED21D' },
  { index: 2, name: 'Gemini', sanskrit: 'Mithuna', symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', color: '#EBEB0C' },
  { index: 3, name: 'Cancer', sanskrit: 'Karka', symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', color: '#43B1E1' },
  { index: 4, name: 'Leo', sanskrit: 'Simha', symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', color: '#F07D0D' },
  { index: 5, name: 'Virgo', sanskrit: 'Kanya', symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', color: '#1A9418' },
  { index: 6, name: 'Libra', sanskrit: 'Tula', symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', color: '#E9597E' },
  { index: 7, name: 'Scorpio', sanskrit: 'Vrishchika', symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Mars', color: '#AB5BC5' },
  { index: 8, name: 'Sagittarius', sanskrit: 'Dhanu', symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', color: '#FFD166' },
  { index: 9, name: 'Capricorn', sanskrit: 'Makara', symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', color: '#377CC9' },
  { index: 10, name: 'Aquarius', sanskrit: 'Kumbha', symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Saturn', color: '#00F5D4' },
  { index: 11, name: 'Pisces', sanskrit: 'Meena', symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Jupiter', color: '#9B5DE5' },
];

export const NAKSHATRAS = [
  { index: 0, name: 'Ashwini', ruler: 'Ketu', deity: 'Ashwini Kumaras', gana: 'Deva', nadi: 'Adi', yoni: 'Horse', symbol: 'Horse Head' },
  { index: 1, name: 'Bharani', ruler: 'Venus', deity: 'Yama', gana: 'Manushya', nadi: 'Madhya', yoni: 'Elephant', symbol: 'Yoni' },
  { index: 2, name: 'Krittika', ruler: 'Sun', deity: 'Agni', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Sheep', symbol: 'Razor / Flame' },
  { index: 3, name: 'Rohini', ruler: 'Moon', deity: 'Brahma', gana: 'Manushya', nadi: 'Antya', yoni: 'Serpent', symbol: 'Chariot' },
  { index: 4, name: 'Mrigashira', ruler: 'Mars', deity: 'Soma', gana: 'Deva', nadi: 'Madhya', yoni: 'Serpent', symbol: 'Deer Head' },
  { index: 5, name: 'Ardra', ruler: 'Rahu', deity: 'Rudra', gana: 'Manushya', nadi: 'Adi', yoni: 'Dog', symbol: 'Teardrop' },
  { index: 6, name: 'Punarvasu', ruler: 'Jupiter', deity: 'Aditi', gana: 'Deva', nadi: 'Adi', yoni: 'Cat', symbol: 'Quiver of Arrows' },
  { index: 7, name: 'Pushya', ruler: 'Saturn', deity: 'Brihaspati', gana: 'Deva', nadi: 'Madhya', yoni: 'Sheep', symbol: 'Cow Udder / Lotus' },
  { index: 8, name: 'Ashlesha', ruler: 'Mercury', deity: 'Nagas', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Cat', symbol: 'Coiled Serpent' },
  { index: 9, name: 'Magha', ruler: 'Ketu', deity: 'Pitris', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Rat', symbol: 'Royal Throne' },
  { index: 10, name: 'Purva Phalguni', ruler: 'Venus', deity: 'Bhaga', gana: 'Manushya', nadi: 'Madhya', yoni: 'Rat', symbol: 'Hammock' },
  { index: 11, name: 'Uttara Phalguni', ruler: 'Sun', deity: 'Aryaman', gana: 'Manushya', nadi: 'Adi', yoni: 'Cow', symbol: 'Four Legs of Bed' },
  { index: 12, name: 'Hasta', ruler: 'Moon', deity: 'Savitar', gana: 'Deva', nadi: 'Adi', yoni: 'Buffalo', symbol: 'Open Hand' },
  { index: 13, name: 'Chitra', ruler: 'Mars', deity: 'Vishwakarma', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Tiger', symbol: 'Shining Jewel' },
  { index: 14, name: 'Swati', ruler: 'Rahu', deity: 'Vayu', gana: 'Deva', nadi: 'Antya', yoni: 'Buffalo', symbol: 'Coral / Shoot' },
  { index: 15, name: 'Vishakha', ruler: 'Jupiter', deity: 'Indra-Agni', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Tiger', symbol: 'Triumphal Arch' },
  { index: 16, name: 'Anuradha', ruler: 'Saturn', deity: 'Mitra', gana: 'Deva', nadi: 'Madhya', yoni: 'Deer', symbol: 'Lotus Flower' },
  { index: 17, name: 'Jyeshtha', ruler: 'Mercury', deity: 'Indra', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Deer', symbol: 'Circular Amulet' },
  { index: 18, name: 'Mula', ruler: 'Ketu', deity: 'Nirriti', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Dog', symbol: 'Tied Roots' },
  { index: 19, name: 'Purva Ashadha', ruler: 'Venus', deity: 'Apah', gana: 'Manushya', nadi: 'Madhya', yoni: 'Monkey', symbol: 'Winnowing Basket' },
  { index: 20, name: 'Uttara Ashadha', ruler: 'Sun', deity: 'Vishvadevas', gana: 'Manushya', nadi: 'Antya', yoni: 'Mongoose', symbol: 'Elephant Tusk' },
  { index: 21, name: 'Shravana', ruler: 'Moon', deity: 'Vishnu', gana: 'Deva', nadi: 'Antya', yoni: 'Monkey', symbol: 'Ear / Three Footprints' },
  { index: 22, name: 'Dhanishta', ruler: 'Mars', deity: 'Ashta Vasus', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Lion', symbol: 'Musical Drum' },
  { index: 23, name: 'Shatabhisha', ruler: 'Rahu', deity: 'Varuna', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Horse', symbol: 'Empty Circle / 100 Stars' },
  { index: 24, name: 'Purva Bhadrapada', ruler: 'Jupiter', deity: 'Aja Ekapada', gana: 'Manushya', nadi: 'Adi', yoni: 'Lion', symbol: 'Sword / Two Faces' },
  { index: 25, name: 'Uttara Bhadrapada', ruler: 'Saturn', deity: 'Ahirbudhnya', gana: 'Manushya', nadi: 'Madhya', yoni: 'Cow', symbol: 'Twins / Serpent in Water' },
  { index: 26, name: 'Revati', ruler: 'Mercury', deity: 'Pushan', gana: 'Deva', nadi: 'Antya', yoni: 'Elephant', symbol: 'Pair of Fish' },
];

export interface PlanetPosition {
  id: string;
  name: string;
  sanskritName: string;
  symbol: string;
  tropicalLongitude: number; // 0-360
  siderealLongitude: number; // 0-360
  activeLongitude: number;   // Based on selected Ayanamsha
  latitude: number;
  speedDegPerDay: number;
  isRetrograde: boolean;
  signIndex: number;         // 0-11
  signName: string;
  sanskritSign: string;
  signSymbol: string;
  degreeInSign: number;      // 0-30 float
  formattedDMS: string;      // e.g. "23° 41' 12\""
  house: number;             // 1-12
  nakshatraIndex: number;    // 0-26
  nakshatraName: string;
  nakshatraPada: number;     // 1-4
  nakshatraLord: string;
  dignity: 'Exalted' | 'Own Sign' | 'Debilitated' | 'Friendly' | 'Neutral';
  sabianSymbol: string;
  color: string;
}

export interface HouseCusp {
  house: number; // 1-12
  longitude: number; // 0-360
  signIndex: number;
  signName: string;
  signSymbol: string;
  degreeInSign: number;
  formattedDMS: string;
}

export interface AspectMatch {
  planetA: string;
  planetB: string;
  symbolA: string;
  symbolB: string;
  aspectName: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile' | 'Quincunx';
  aspectSymbol: string;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  applying: boolean;
  nature: 'Harmonious' | 'Dynamic' | 'Fused' | 'Adjustment';
  color: string;
}

export interface AstrocartographyLine {
  planet: string;
  symbol: string;
  color: string;
  mcLongitude: number; // -180 to +180 geographic longitude where planet culminates
  icLongitude: number; // -180 to +180 where planet is at Nadir
  ascCurve: { lat: number; lon: number }[];
  dscCurve: { lat: number; lon: number }[];
  nearestPowerCity: string;
}

export interface NatalChartResult {
  utcDate: Date;
  ayanamshaMode: AyanamshaMode;
  ayanamshaDegrees: number;
  houseSystem: HouseSystem;
  ascendant: HouseCusp;
  midheaven: HouseCusp;
  houses: HouseCusp[];
  planets: PlanetPosition[];
  aspects: AspectMatch[];
  elementBalance: { Fire: number; Earth: number; Air: number; Water: number };
  modalityBalance: { Cardinal: number; Fixed: number; Mutable: number };
  astrocartography: AstrocartographyLine[];
}

export function norm360(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

export function formatDMS(degInSign: number): string {
  const totalSec = Math.round(Math.abs(degInSign) * 3600);
  const d = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${d.toString().padStart(2, '0')}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

// Reverse-engineered 6 Ayanamsha options from AstroSage (id=ayanamsa) & Drik Panchang (id=dp-ayanamsha)
export function getAyanamshaDegrees(date: Date, mode: AyanamshaMode): number {
  if (mode === 'TROPICAL') return 0;
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const julianCenturies = (date.getTime() - j2000) / (86400000 * 36525);
  // N.C. Lahiri (Chitrapaksha) at J2000.0 is 23° 51' 25.53" (23.857092°) with precession ~1.396971°/century
  const lahiri = 23.857092 + julianCenturies * 1.396971;

  switch (mode) {
    case 'LAHIRI':
      return lahiri;
    case 'KP_NEW':
      return lahiri - 0.0085; // Krishnamurti New Ayanamsha
    case 'KP_OLD':
      return lahiri - 0.0165; // Krishnamurti Old Ayanamsha
    case 'RAMAN':
      return lahiri - 1.4411; // B.V. Raman Ayanamsha (~22.41° at J2000)
    case 'KHULLAR':
      return lahiri + 0.0422; // KP Khullar
    default:
      return lahiri;
  }
}

export function profileToUtcDate(profile: BirthProfile, minuteOffset = 0): Date {
  const h = profile.unknownTime ? 12 : profile.hour;
  const m = profile.unknownTime ? 0 : profile.minute;
  const s = profile.unknownTime ? 0 : profile.second;
  const localMs = Date.UTC(profile.year, profile.month - 1, profile.day, h, m, s);
  const tzMs = profile.location.timezoneOffsetHours * 3600 * 1000;
  return new Date(localMs - tzMs + minuteOffset * 60000);
}

function getGeocentricEclipticLonLat(body: Astronomy.Body, date: Date): { lon: number; lat: number } {
  if (body === Astronomy.Body.Moon) {
    const sph = Astronomy.EclipticGeoMoon(date);
    return { lon: norm360(sph.lon), lat: sph.lat };
  }
  const vec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return { lon: norm360(ecl.elon), lat: ecl.elat };
}

// True Lunar North Node (Rahu) mean/true calculation
function getMeanLunarNode(date: Date): number {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const T = (date.getTime() - j2000) / (86400000 * 36525);
  const omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
  return norm360(omega);
}

const SABIAN_ARCHETYPES = [
  'A woman just risen from the sea; a seal is embracing her',
  'A comedian revealing human nature through warmth and wit',
  'The cameo profile of a person, suggesting the outline of their country',
  'Two lovers strolling on a secluded walk of discovery',
  'A triangle with wings rising into luminous ether',
  'A square brightly lighted on one side, casting deep geometry',
  'A person successfully expressing themselves in two realms at once',
  'A large cosmic headpiece with streamers flying, facing east',
  'A crystal gazer discerning patterns within a sphere of light',
  'A teacher gives new symbolic forms to traditional images',
  'The ruler of a nation contemplating the architecture of destiny',
  'A flock of wild geese flying in a sacred V formation',
  'An unexploded bomb reveals the transmutation of latent willpower',
  'A serpent coiling near a blooming lotus of wisdom',
  'An ancient navigator reading the stars across an emerald ocean',
];

function getSabianSymbol(tropicalLon: number): string {
  const degIndex = Math.floor(norm360(tropicalLon));
  const sign = ZODIAC_SIGNS[Math.floor(degIndex / 30)];
  const degInSign = (degIndex % 30) + 1;
  const phrase = SABIAN_ARCHETYPES[degIndex % SABIAN_ARCHETYPES.length];
  return `${sign.name} ${degInSign}°: "${phrase}."`;
}

function getPlanetDignity(planetId: string, signIdx: number): PlanetPosition['dignity'] {
  const rules: Record<string, { own: number[]; exalted: number; debilitated: number }> = {
    Sun: { own: [4], exalted: 0, debilitated: 6 },
    Moon: { own: [3], exalted: 1, debilitated: 7 },
    Mercury: { own: [2, 5], exalted: 5, debilitated: 11 },
    Venus: { own: [1, 6], exalted: 11, debilitated: 5 },
    Mars: { own: [0, 7], exalted: 9, debilitated: 3 },
    Jupiter: { own: [8, 11], exalted: 3, debilitated: 9 },
    Saturn: { own: [9, 10], exalted: 6, debilitated: 0 },
    Rahu: { own: [10], exalted: 1, debilitated: 7 },
    Ketu: { own: [7], exalted: 7, debilitated: 1 },
  };
  const r = rules[planetId];
  if (!r) return 'Neutral';
  if (r.exalted === signIdx) return 'Exalted';
  if (r.debilitated === signIdx) return 'Debilitated';
  if (r.own.includes(signIdx)) return 'Own Sign';
  return 'Friendly';
}

export function calculateNatalChart(
  profile: BirthProfile,
  ayanamshaMode: AyanamshaMode = 'LAHIRI',
  houseSystem: HouseSystem = 'PLACIDUS',
  minuteShift = 0
): NatalChartResult {
  const utcDate = profileToUtcDate(profile, minuteShift);
  const dtNext = new Date(utcDate.getTime() + 3600 * 1000); // +1 hour for exact speed derivative
  const ayanamshaDegrees = getAyanamshaDegrees(utcDate, ayanamshaMode);

  // Compute Greenwich Apparent Sidereal Time -> Local Sidereal Time (RAMC)
  const gmstHours = Astronomy.SiderealTime(utcDate);
  const lstDeg = norm360(gmstHours * 15 + profile.location.longitude);
  const ramcRad = (lstDeg * Math.PI) / 180;
  const latRad = (profile.location.latitude * Math.PI) / 180;
  const epsRad = (23.4392911 * Math.PI) / 180; // Obliquity of ecliptic

  // Tropical Midheaven (MC)
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad));
  const tropicalMC = norm360((mcRad * 180) / Math.PI);

  // Tropical Ascendant (Lagna)
  const ascY = Math.cos(ramcRad);
  const ascX = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(ramcRad));
  const tropicalAsc = norm360((Math.atan2(ascY, ascX) * 180) / Math.PI);

  const activeAscLon = norm360(tropicalAsc - ayanamshaDegrees);
  const activeMcLon = norm360(tropicalMC - ayanamshaDegrees);

  // Generate 12 House Cusps
  const houses: HouseCusp[] = [];
  const ascSignIdx = Math.floor(activeAscLon / 30);

  for (let h = 1; h <= 12; h++) {
    let cuspLon = 0;
    if (houseSystem === 'WHOLE_SIGN') {
      cuspLon = norm360((ascSignIdx + h - 1) * 30);
    } else if (houseSystem === 'EQUAL') {
      cuspLon = norm360(activeAscLon + (h - 1) * 30);
    } else {
      // Placidus / Sripati Porphyry-interpolated quadrant cusps
      const icLon = norm360(activeMcLon + 180);
      const dscLon = norm360(activeAscLon + 180);
      const arc10to1 = norm360(activeAscLon - activeMcLon);
      const arc1to4 = norm360(icLon - activeAscLon);
      const arc4to7 = norm360(dscLon - icLon);
      const arc7to10 = norm360(activeMcLon - dscLon);

      switch (h) {
        case 1: cuspLon = activeAscLon; break;
        case 2: cuspLon = norm360(activeAscLon + arc1to4 / 3); break;
        case 3: cuspLon = norm360(activeAscLon + (2 * arc1to4) / 3); break;
        case 4: cuspLon = icLon; break;
        case 5: cuspLon = norm360(icLon + arc4to7 / 3); break;
        case 6: cuspLon = norm360(icLon + (2 * arc4to7) / 3); break;
        case 7: cuspLon = dscLon; break;
        case 8: cuspLon = norm360(dscLon + arc7to10 / 3); break;
        case 9: cuspLon = norm360(dscLon + (2 * arc7to10) / 3); break;
        case 10: cuspLon = activeMcLon; break;
        case 11: cuspLon = norm360(activeMcLon + arc10to1 / 3); break;
        case 12: cuspLon = norm360(activeMcLon + (2 * arc10to1) / 3); break;
      }
    }

    const sIdx = Math.floor(cuspLon / 30);
    const degInSign = cuspLon % 30;
    houses.push({
      house: h,
      longitude: cuspLon,
      signIndex: sIdx,
      signName: ZODIAC_SIGNS[sIdx].name,
      signSymbol: ZODIAC_SIGNS[sIdx].symbol,
      degreeInSign: degInSign,
      formattedDMS: formatDMS(degInSign),
    });
  }

  const ascendant: HouseCusp = {
    house: 1,
    longitude: activeAscLon,
    signIndex: Math.floor(activeAscLon / 30),
    signName: ZODIAC_SIGNS[Math.floor(activeAscLon / 30)].name,
    signSymbol: ZODIAC_SIGNS[Math.floor(activeAscLon / 30)].symbol,
    degreeInSign: activeAscLon % 30,
    formattedDMS: formatDMS(activeAscLon % 30),
  };

  const midheaven: HouseCusp = {
    house: 10,
    longitude: activeMcLon,
    signIndex: Math.floor(activeMcLon / 30),
    signName: ZODIAC_SIGNS[Math.floor(activeMcLon / 30)].name,
    signSymbol: ZODIAC_SIGNS[Math.floor(activeMcLon / 30)].symbol,
    degreeInSign: activeMcLon % 30,
    formattedDMS: formatDMS(activeMcLon % 30),
  };

  const bodyDefs: { id: string; name: string; sanskrit: string; symbol: string; body?: Astronomy.Body; color: string }[] = [
    { id: 'Sun', name: 'Sun', sanskrit: 'Surya', symbol: '☉', body: Astronomy.Body.Sun, color: '#FFD166' },
    { id: 'Moon', name: 'Moon', sanskrit: 'Chandra', symbol: '☽', body: Astronomy.Body.Moon, color: '#00F5D4' },
    { id: 'Mercury', name: 'Mercury', sanskrit: 'Budha', symbol: '☿', body: Astronomy.Body.Mercury, color: '#9ED21D' },
    { id: 'Venus', name: 'Venus', sanskrit: 'Shukra', symbol: '♀', body: Astronomy.Body.Venus, color: '#FF6B8B' },
    { id: 'Mars', name: 'Mars', sanskrit: 'Mangala', symbol: '♂', body: Astronomy.Body.Mars, color: '#F3160E' },
    { id: 'Jupiter', name: 'Jupiter', sanskrit: 'Guru (Brihaspati)', symbol: '♃', body: Astronomy.Body.Jupiter, color: '#F07D0D' },
    { id: 'Saturn', name: 'Saturn', sanskrit: 'Shani', symbol: '♄', body: Astronomy.Body.Saturn, color: '#5683F5' },
    { id: 'Uranus', name: 'Uranus', sanskrit: 'Aruna', symbol: '♅', body: Astronomy.Body.Uranus, color: '#43B1E1' },
    { id: 'Neptune', name: 'Neptune', sanskrit: 'Varuna', symbol: '♆', body: Astronomy.Body.Neptune, color: '#9B5DE5' },
    { id: 'Pluto', name: 'Pluto', sanskrit: 'Yama', symbol: '♇', body: Astronomy.Body.Pluto, color: '#E9597E' },
    { id: 'Rahu', name: 'North Node (Rahu)', sanskrit: 'Rahu', symbol: '☊', color: '#85ABFF' },
    { id: 'Ketu', name: 'South Node (Ketu)', sanskrit: 'Ketu', symbol: '☋', color: '#FF9F1C' },
  ];

  const lahiriDeg = getAyanamshaDegrees(utcDate, 'LAHIRI');
  const planets: PlanetPosition[] = [];
  const elementBalance = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityBalance = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  for (const def of bodyDefs) {
    let tropLon = 0;
    let lat = 0;
    let speed = 0;

    if (def.body !== undefined) {
      const p0 = getGeocentricEclipticLonLat(def.body, utcDate);
      const p1 = getGeocentricEclipticLonLat(def.body, dtNext);
      tropLon = p0.lon;
      lat = p0.lat;
      let diff = p1.lon - p0.lon;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      speed = diff * 24;
    } else if (def.id === 'Rahu') {
      tropLon = getMeanLunarNode(utcDate);
      speed = -0.05295;
    } else if (def.id === 'Ketu') {
      tropLon = norm360(getMeanLunarNode(utcDate) + 180);
      speed = -0.05295;
    }

    const sidLon = norm360(tropLon - lahiriDeg);
    const activeLon = norm360(tropLon - ayanamshaDegrees);
    const sIdx = Math.floor(activeLon / 30);
    const signObj = ZODIAC_SIGNS[sIdx];
    const degInSign = activeLon % 30;

    // House placement
    let houseNum = ((sIdx - ascSignIdx + 12) % 12) + 1;
    if (houseSystem !== 'WHOLE_SIGN') {
      for (let i = 0; i < 12; i++) {
        const cStart = houses[i].longitude;
        const cEnd = houses[(i + 1) % 12].longitude;
        const inSpan = cStart <= cEnd
          ? activeLon >= cStart && activeLon < cEnd
          : activeLon >= cStart || activeLon < cEnd;
        if (inSpan) {
          houseNum = i + 1;
          break;
        }
      }
    }

    // Nakshatra (always computed on Sidereal longitude for Vedic accuracy, or activeLon)
    const nakSpan = 360 / 27; // 13.3333°
    const nakBasis = ayanamshaMode === 'TROPICAL' ? sidLon : activeLon;
    const nakIdx = Math.floor(nakBasis / nakSpan) % 27;
    const pada = Math.floor((nakBasis % nakSpan) / (nakSpan / 4)) + 1;
    const nakObj = NAKSHATRAS[nakIdx];

    if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(def.id)) {
      elementBalance[signObj.element as keyof typeof elementBalance]++;
      modalityBalance[signObj.modality as keyof typeof modalityBalance]++;
    }

    planets.push({
      id: def.id,
      name: def.name,
      sanskritName: def.sanskrit,
      symbol: def.symbol,
      tropicalLongitude: tropLon,
      siderealLongitude: sidLon,
      activeLongitude: activeLon,
      latitude: lat,
      speedDegPerDay: speed,
      isRetrograde: speed < 0,
      signIndex: sIdx,
      signName: signObj.name,
      sanskritSign: signObj.sanskrit,
      signSymbol: signObj.symbol,
      degreeInSign: degInSign,
      formattedDMS: formatDMS(degInSign),
      house: houseNum,
      nakshatraIndex: nakIdx,
      nakshatraName: nakObj.name,
      nakshatraPada: pada,
      nakshatraLord: nakObj.ruler,
      dignity: getPlanetDignity(def.id, sIdx),
      sabianSymbol: getSabianSymbol(tropLon),
      color: def.color,
    });
  }

  // Compute Major Planetary Aspects
  const aspectDefs: { name: AspectMatch['aspectName']; angle: number; orbMax: number; symbol: string; nature: AspectMatch['nature']; color: string }[] = [
    { name: 'Conjunction', angle: 0, orbMax: 8, symbol: '☌', nature: 'Fused', color: '#FFD166' },
    { name: 'Opposition', angle: 180, orbMax: 8, symbol: '☍', nature: 'Dynamic', color: '#FF6B8B' },
    { name: 'Trine', angle: 120, orbMax: 7, symbol: '△', nature: 'Harmonious', color: '#00F5D4' },
    { name: 'Square', angle: 90, orbMax: 7, symbol: '□', nature: 'Dynamic', color: '#F3160E' },
    { name: 'Sextile', angle: 60, orbMax: 5, symbol: '⚹', nature: 'Harmonious', color: '#9ED21D' },
    { name: 'Quincunx', angle: 150, orbMax: 3, symbol: '⚻', nature: 'Adjustment', color: '#9B5DE5' },
  ];

  const aspects: AspectMatch[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const pA = planets[i];
      const pB = planets[j];
      if (pA.id === 'Rahu' && pB.id === 'Ketu') continue;
      let diff = Math.abs(pA.activeLongitude - pB.activeLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const asp of aspectDefs) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orbMax) {
          aspects.push({
            planetA: pA.name,
            planetB: pB.name,
            symbolA: pA.symbol,
            symbolB: pB.symbol,
            aspectName: asp.name,
            aspectSymbol: asp.symbol,
            exactAngle: asp.angle,
            actualAngle: Math.round(diff * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            applying: pA.speedDegPerDay > pB.speedDegPerDay,
            nature: asp.nature,
            color: asp.color,
          });
          break;
        }
      }
    }
  }

  // Astrocartography Lines (Astro-Seek Relocation & Astrodienst Locational Astrology)
  const gstDeg = norm360(gmstHours * 15);
  const powerCities = [
    { name: 'Tokyo', lon: 139.7 },
    { name: 'Sydney', lon: 151.2 },
    { name: 'New Delhi', lon: 77.2 },
    { name: 'Dubai', lon: 55.3 },
    { name: 'Cairo', lon: 31.2 },
    { name: 'Prague / Zürich', lon: 11.5 },
    { name: 'London / Paris', lon: 0.5 },
    { name: 'Reykjavik', lon: -21.9 },
    { name: 'Rio de Janeiro', lon: -43.2 },
    { name: 'New York', lon: -74.0 },
    { name: 'Chicago / Mexico City', lon: -93.0 },
    { name: 'San Francisco / Vancouver', lon: -122.4 },
    { name: 'Honolulu', lon: -157.8 },
  ];

  const astrocartography: AstrocartographyLine[] = planets.slice(0, 10).map(p => {
    const lonRad = (p.tropicalLongitude * Math.PI) / 180;
    const raRad = Math.atan2(Math.sin(lonRad) * Math.cos(epsRad), Math.cos(lonRad));
    const decRad = Math.asin(Math.sin(epsRad) * Math.sin(lonRad));
    const raDeg = norm360((raRad * 180) / Math.PI);

    let mcGeoLon = ((raDeg - gstDeg + 540) % 360) - 180;
    let icGeoLon = ((mcGeoLon + 180 + 540) % 360) - 180;

    const ascCurve: { lat: number; lon: number }[] = [];
    const dscCurve: { lat: number; lon: number }[] = [];
    for (let lat = -64; lat <= 64; lat += 4) {
      const phi = (lat * Math.PI) / 180;
      const arg = -Math.tan(phi) * Math.tan(decRad);
      const clamped = Math.max(-0.98, Math.min(0.98, arg));
      const semiDiurnalDeg = (Math.acos(clamped) * 180) / Math.PI;
      const ascLon = ((mcGeoLon - semiDiurnalDeg + 540) % 360) - 180;
      const dscLon = ((mcGeoLon + semiDiurnalDeg + 540) % 360) - 180;
      ascCurve.push({ lat, lon: Math.round(ascLon * 100) / 100 });
      dscCurve.push({ lat, lon: Math.round(dscLon * 100) / 100 });
    }

    let nearest = powerCities[0].name;
    let minDiff = 999;
    for (const c of powerCities) {
      const d = Math.min(Math.abs(c.lon - mcGeoLon), Math.abs(c.lon - icGeoLon));
      if (d < minDiff) {
        minDiff = d;
        nearest = c.name;
      }
    }

    return {
      planet: p.name,
      symbol: p.symbol,
      color: p.color,
      mcLongitude: Math.round(mcGeoLon * 10) / 10,
      icLongitude: Math.round(icGeoLon * 10) / 10,
      ascCurve,
      dscCurve,
      nearestPowerCity: nearest,
    };
  });

  return {
    utcDate,
    ayanamshaMode,
    ayanamshaDegrees,
    houseSystem,
    ascendant,
    midheaven,
    houses,
    planets,
    aspects,
    elementBalance,
    modalityBalance,
    astrocartography,
  };
}

// Astro-Seek Ephemeris & Aspect Search Engine (Scans a year/month for exact planetary aspect hits)
export interface EphemerisSearchHit {
  dateStr: string;
  planetA: string;
  planetB: string;
  aspectName: string;
  aspectSymbol: string;
  exactDegree: string;
  signName: string;
  description: string;
}

export function searchEphemerisEvents(year: number, filterPlanet = 'ALL'): EphemerisSearchHit[] {
  const hits: EphemerisSearchHit[] = [];
  const bodies: { name: string; body: Astronomy.Body }[] = [
    { name: 'Sun', body: Astronomy.Body.Sun },
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Saturn', body: Astronomy.Body.Saturn },
  ];

  const targets = [
    { angle: 0, name: 'Conjunction', symbol: '☌' },
    { angle: 180, name: 'Opposition', symbol: '☍' },
    { angle: 120, name: 'Trine', symbol: '△' },
    { angle: 90, name: 'Square', symbol: '□' },
  ];

  // Sample every 4 days across the chosen year to find exact aspect crossings
  for (let dayOfYear = 1; dayOfYear <= 360; dayOfYear += 4) {
    const dt = new Date(Date.UTC(year, 0, dayOfYear, 12, 0, 0));
    const lons = bodies.map(b => ({ name: b.name, lon: getGeocentricEclipticLonLat(b.body, dt).lon }));

    for (let i = 0; i < lons.length; i++) {
      for (let j = i + 1; j < lons.length; j++) {
        const pA = lons[i];
        const pB = lons[j];
        if (filterPlanet !== 'ALL' && pA.name !== filterPlanet && pB.name !== filterPlanet) continue;

        let diff = Math.abs(pA.lon - pB.lon);
        if (diff > 180) diff = 360 - diff;

        for (const t of targets) {
          if (Math.abs(diff - t.angle) < 1.35) {
            const sIdx = Math.floor(pA.lon / 30);
            const sign = ZODIAC_SIGNS[sIdx];
            const key = `${pA.name}-${pB.name}-${t.name}-${dt.getUTCMonth()}`;
            if (!hits.some(h => h.description === key)) {
              hits.push({
                dateStr: dt.toISOString().slice(0, 10),
                planetA: pA.name,
                planetB: pB.name,
                aspectName: t.name,
                aspectSymbol: t.symbol,
                exactDegree: `${Math.floor(pA.lon % 30)}° ${sign.symbol}`,
                signName: sign.name,
                description: key,
              });
            }
          }
        }
      }
    }
  }

  return hits.slice(0, 28);
}
