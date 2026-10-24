import * as Astronomy from 'astronomy-engine';
import { CityLocation } from '../types/oceanology';
import { NAKSHATRAS, ZODIAC_SIGNS, getAyanamshaDegrees, norm360 } from './astronomyEngine';

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

export const YOGA_NAMES = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

export const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];

export const VARA_DAYS = [
  { name: 'Ravivara (Sunday)', lord: 'Sun (Surya)', color: '#FFD166' },
  { name: 'Somavara (Monday)', lord: 'Moon (Chandra)', color: '#00F5D4' },
  { name: 'Mangalavara (Tuesday)', lord: 'Mars (Mangala)', color: '#F3160E' },
  { name: 'Budhavara (Wednesday)', lord: 'Mercury (Budha)', color: '#9ED21D' },
  { name: 'Guruvara (Thursday)', lord: 'Jupiter (Brihaspati)', color: '#F07D0D' },
  { name: 'Shukravara (Friday)', lord: 'Venus (Shukra)', color: '#FF6B8B' },
  { name: 'Shanivara (Saturday)', lord: 'Saturn (Shani)', color: '#5683F5' },
];

export interface MuhuratSlot {
  name: string;
  category: 'Auspicious' | 'Inauspicious' | 'Neutral';
  startTime: string;
  endTime: string;
  startHourFloat: number;
  endHourFloat: number;
  description: string;
}

export interface ChoghadiyaSlot {
  name: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Udveg' | 'Kaal' | 'Rog';
  ruler: string;
  nature: 'Most Auspicious' | 'Auspicious' | 'Good (Gain)' | 'Neutral (Travel)' | 'Inauspicious';
  startTime: string;
  endTime: string;
  isActiveNow: boolean;
}

export interface PanchangReport {
  dateStr: string;
  location: CityLocation;
  sunriseTime: string;
  sunsetTime: string;
  dinamanaHours: string; // Day length
  vara: { name: string; lord: string; color: string };
  tithi: {
    index: number; // 1-30
    name: string;
    paksha: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
    progressPercent: number;
    hoursRemaining: string;
  };
  nakshatra: {
    index: number;
    name: string;
    pada: number;
    ruler: string;
    deity: string;
    progressPercent: number;
    hoursRemaining: string;
  };
  yoga: {
    index: number;
    name: string;
    progressPercent: number;
  };
  karana: {
    name: string;
    nature: string;
  };
  moonSign: string;
  sunSign: string;
  vedicClock: {
    ghati: number;
    pal: number;
    vipal: number;
    formatted: string;
  };
  muhurats: MuhuratSlot[];
  dayChoghadiya: ChoghadiyaSlot[];
  nightChoghadiya: ChoghadiyaSlot[];
  personalTarabala: {
    taraName: string;
    taraNumber: number;
    isAuspicious: boolean;
    chandrabalaHouse: number;
    chandrabalaAuspicious: boolean;
    verdict: string;
  };
}

function formatHourFloat(hFloat: number): string {
  const norm = ((hFloat % 24) + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.round((norm - h) * 60) % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculatePanchang(
  date: Date,
  location: CityLocation,
  natalMoonNakshatraIdx = 0,
  natalMoonSignIdx = 0
): PanchangReport {
  const lahiri = getAyanamshaDegrees(date, 'LAHIRI');
  const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const sunEcl = Astronomy.Ecliptic(sunVec);
  const moonSph = Astronomy.EclipticGeoMoon(date);

  const sunSid = norm360(sunEcl.elon - lahiri);
  const moonSid = norm360(moonSph.lon - lahiri);

  // 1. Tithi (12° Moon - Sun elongation)
  const diffLon = norm360(moonSid - sunSid);
  const tithiZeroIdx = Math.floor(diffLon / 12); // 0-29
  const tithiProgress = ((diffLon % 12) / 12) * 100;
  const paksha = tithiZeroIdx < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  const hoursRemTithi = (((12 - (diffLon % 12)) / 12.19) * 24).toFixed(1);

  // 2. Nakshatra (13°20' Moon Sidereal)
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSid / nakSpan) % 27;
  const nakObj = NAKSHATRAS[nakIdx];
  const nakProgress = ((moonSid % nakSpan) / nakSpan) * 100;
  const nakPada = Math.floor((moonSid % nakSpan) / (nakSpan / 4)) + 1;
  const hoursRemNak = (((nakSpan - (moonSid % nakSpan)) / 13.176) * 24).toFixed(1);

  // 3. Yoga ((Sun + Moon) % 360 / 13°20')
  const yogaSum = norm360(sunSid + moonSid);
  const yogaIdx = Math.floor(yogaSum / nakSpan) % 27;
  const yogaProgress = ((yogaSum % nakSpan) / nakSpan) * 100;

  // 4. Karana (6° half-tithi)
  const karanaHalfIdx = Math.floor(diffLon / 6); // 0-59
  let karanaName = 'Bava';
  if (karanaHalfIdx === 0) karanaName = 'Kimstughna';
  else if (karanaHalfIdx === 57) karanaName = 'Shakuni';
  else if (karanaHalfIdx === 58) karanaName = 'Chatushpada';
  else if (karanaHalfIdx === 59) karanaName = 'Naga';
  else karanaName = KARANA_MOVABLE[(karanaHalfIdx - 1) % 7];

  // 5. Sunrise & Sunset (Elevation-adjusted solar declination + equation of time)
  const dayOfYear = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);
  const declRad = ((23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81))) * Math.PI) / 180;
  const latRad = (location.latitude * Math.PI) / 180;
  // Elevation dip correction from Drik Panchang (dp-elevation)
  const dipDeg = -0.833 - 0.0347 * Math.sqrt(Math.max(0, location.elevationMeters));
  const dipRad = (dipDeg * Math.PI) / 180;
  const cosH = (Math.sin(dipRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  const clampedCosH = Math.max(-0.95, Math.min(0.95, cosH));
  const halfDayHours = (Math.acos(clampedCosH) * 180) / (Math.PI * 15);

  const solarNoonLocal = 12 + location.timezoneOffsetHours - location.longitude / 15;
  const sunriseHour = solarNoonLocal - halfDayHours;
  const sunsetHour = solarNoonLocal + halfDayHours;
  const dayLenHours = sunsetHour - sunriseHour;
  const nightLenHours = 24 - dayLenHours;
  const eighthDay = dayLenHours / 8;

  // Local time float
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const localHourFloat = ((utcHours + location.timezoneOffsetHours) % 24 + 24) % 24;
  const weekdayIdx = new Date(date.getTime() + location.timezoneOffsetHours * 3600000).getUTCDay();
  const vara = VARA_DAYS[weekdayIdx];

  // Rahu Kaal, Yamaganda, Gulika Kaal 1/8th segments by weekday (Sun=0..Sat=6)
  // Rahu Kaal octant index (1-based): Sun:8, Mon:2, Tue:7, Wed:5, Thu:6, Fri:4, Sat:3
  const rahuOctants = [8, 2, 7, 5, 6, 4, 3];
  const yamaOctants = [5, 4, 3, 2, 1, 7, 6];
  const gulikaOctants = [7, 6, 5, 4, 3, 2, 1];

  const rStart = sunriseHour + (rahuOctants[weekdayIdx] - 1) * eighthDay;
  const yStart = sunriseHour + (yamaOctants[weekdayIdx] - 1) * eighthDay;
  const gStart = sunriseHour + (gulikaOctants[weekdayIdx] - 1) * eighthDay;
  const abhijitHalf = dayLenHours / 30;
  const brahmaStart = sunriseHour - 1.6;
  const brahmaEnd = sunriseHour - 0.8;

  const muhurats: MuhuratSlot[] = [
    {
      name: 'Brahma Muhurta',
      category: 'Auspicious',
      startTime: formatHourFloat(brahmaStart),
      endTime: formatHourFloat(brahmaEnd),
      startHourFloat: brahmaStart,
      endHourFloat: brahmaEnd,
      description: 'Supreme pre-dawn window for meditation, contemplation, and spiritual study.',
    },
    {
      name: 'Abhijit Muhurat',
      category: 'Auspicious',
      startTime: formatHourFloat(solarNoonLocal - abhijitHalf),
      endTime: formatHourFloat(solarNoonLocal + abhijitHalf),
      startHourFloat: solarNoonLocal - abhijitHalf,
      endHourFloat: solarNoonLocal + abhijitHalf,
      description: 'Victorious midday solar zenith window neutralizing general doshas for initiating key ventures.',
    },
    {
      name: 'Gulika Kaal',
      category: 'Neutral',
      startTime: formatHourFloat(gStart),
      endTime: formatHourFloat(gStart + eighthDay),
      startHourFloat: gStart,
      endHourFloat: gStart + eighthDay,
      description: 'ruled by Mandi/Gulika; activities initiated here tend to repeat and accumulate.',
    },
    {
      name: 'Yamaganda Kaal',
      category: 'Inauspicious',
      startTime: formatHourFloat(yStart),
      endTime: formatHourFloat(yStart + eighthDay),
      startHourFloat: yStart,
      endHourFloat: yStart + eighthDay,
      description: 'Inauspicious window for new beginnings or travel; suitable only for routine maintenance.',
    },
    {
      name: 'Rahu Kaal',
      category: 'Inauspicious',
      startTime: formatHourFloat(rStart),
      endTime: formatHourFloat(rStart + eighthDay),
      startHourFloat: rStart,
      endHourFloat: rStart + eighthDay,
      description: 'Shadow node window; avoid signing contracts, financial launches, or auspicious ceremonies.',
    },
  ];

  // Day & Night Choghadiya (Drik Panchang 8-part division)
  const chogMeta: Record<ChoghadiyaSlot['name'], { ruler: string; nature: ChoghadiyaSlot['nature'] }> = {
    Amrit: { ruler: 'Moon', nature: 'Most Auspicious' },
    Shubh: { ruler: 'Jupiter', nature: 'Auspicious' },
    Labh: { ruler: 'Mercury', nature: 'Good (Gain)' },
    Char: { ruler: 'Venus', nature: 'Neutral (Travel)' },
    Udveg: { ruler: 'Sun', nature: 'Inauspicious' },
    Kaal: { ruler: 'Saturn', nature: 'Inauspicious' },
    Rog: { ruler: 'Mars', nature: 'Inauspicious' },
  };

  const daySeqByWeekday: ChoghadiyaSlot['name'][][] = [
    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
    ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],   // Tue
    ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],  // Wed
    ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
    ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],  // Fri
    ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],  // Sat
  ];

  const nightSeqByWeekday: ChoghadiyaSlot['name'][][] = [
    ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
    ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],  // Mon
    ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],  // Tue
    ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed
    ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu
    ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],   // Fri
    ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],  // Sat
  ];

  const dayChoghadiya: ChoghadiyaSlot[] = daySeqByWeekday[weekdayIdx].map((name, i) => {
    const s = sunriseHour + i * eighthDay;
    const e = s + eighthDay;
    return {
      name,
      ruler: chogMeta[name].ruler,
      nature: chogMeta[name].nature,
      startTime: formatHourFloat(s),
      endTime: formatHourFloat(e),
      isActiveNow: localHourFloat >= s && localHourFloat < e,
    };
  });

  const eighthNight = nightLenHours / 8;
  const nightChoghadiya: ChoghadiyaSlot[] = nightSeqByWeekday[weekdayIdx].map((name, i) => {
    const s = sunsetHour + i * eighthNight;
    const e = s + eighthNight;
    return {
      name,
      ruler: chogMeta[name].ruler,
      nature: chogMeta[name].nature,
      startTime: formatHourFloat(s),
      endTime: formatHourFloat(e),
      isActiveNow: false,
    };
  });

  // Vedic Clock (Ghati / Pal / Vipal since Sunrise; 24 hours = 60 Ghatis)
  const hoursSinceSunrise = ((localHourFloat - sunriseHour) + 24) % 24;
  const totalGhatis = hoursSinceSunrise * 2.5;
  const ghati = Math.floor(totalGhatis);
  const totalPals = (totalGhatis - ghati) * 60;
  const pal = Math.floor(totalPals);
  const vipal = Math.floor((totalPals - pal) * 60);

  // Personal Tarabala & Chandrabala (comparing transit Nakshatra/Moon Sign with Natal Moon)
  const taraNames = [
    'Janma (Body / Alert)',
    'Sampat (Wealth & Prosperity)',
    'Vipat (Obstacles)',
    'Kshema (Well-being & Safety)',
    'Pratyak (Resistance)',
    'Sadhana (Achievement & Mastery)',
    'Naidhana (Caution)',
    'Mitra (Friendly Support)',
    'Parama Mitra (Supreme Harmony)',
  ];
  const distNak = (nakIdx - natalMoonNakshatraIdx + 27) % 27;
  const taraIdx = distNak % 9; // 0..8
  const taraAuspicious = [1, 3, 5, 7, 8].includes(taraIdx);

  const transitMoonSignIdx = Math.floor(moonSid / 30);
  const chandraHouse = ((transitMoonSignIdx - natalMoonSignIdx + 12) % 12) + 1;
  const chandraAuspicious = [1, 3, 6, 7, 10, 11].includes(chandraHouse);

  return {
    dateStr: date.toISOString().slice(0, 10),
    location,
    sunriseTime: formatHourFloat(sunriseHour),
    sunsetTime: formatHourFloat(sunsetHour),
    dinamanaHours: `${Math.floor(dayLenHours)}h ${Math.round((dayLenHours % 1) * 60)}m`,
    vara,
    tithi: {
      index: tithiZeroIdx + 1,
      name: TITHI_NAMES[tithiZeroIdx],
      paksha,
      progressPercent: Math.round(tithiProgress),
      hoursRemaining: `${hoursRemTithi}h left`,
    },
    nakshatra: {
      index: nakIdx + 1,
      name: nakObj.name,
      pada: nakPada,
      ruler: nakObj.ruler,
      deity: nakObj.deity,
      progressPercent: Math.round(nakProgress),
      hoursRemaining: `${hoursRemNak}h left`,
    },
    yoga: {
      index: yogaIdx + 1,
      name: YOGA_NAMES[yogaIdx],
      progressPercent: Math.round(yogaProgress),
    },
    karana: {
      name: karanaName,
      nature: karanaName.includes('Vishti') ? 'Bhadra (Caution)' : 'Constructive Action',
    },
    moonSign: `${ZODIAC_SIGNS[transitMoonSignIdx].sanskrit} (${ZODIAC_SIGNS[transitMoonSignIdx].name})`,
    sunSign: `${ZODIAC_SIGNS[Math.floor(sunSid / 30)].sanskrit} (${ZODIAC_SIGNS[Math.floor(sunSid / 30)].name})`,
    vedicClock: {
      ghati,
      pal,
      vipal,
      formatted: `${ghati.toString().padStart(2, '0')} Gh : ${pal.toString().padStart(2, '0')} Pa : ${vipal.toString().padStart(2, '0')} Vi`,
    },
    muhurats,
    dayChoghadiya,
    nightChoghadiya,
    personalTarabala: {
      taraName: taraNames[taraIdx],
      taraNumber: taraIdx + 1,
      isAuspicious: taraAuspicious,
      chandrabalaHouse: chandraHouse,
      chandrabalaAuspicious: chandraAuspicious,
      verdict:
        taraAuspicious && chandraAuspicious
          ? 'Double Siddha Alignment: Both Tarabala & Chandrabala strongly favor your birth chart today.'
          : taraAuspicious || chandraAuspicious
          ? 'Balanced Mixed Tide: Favorable for planned work; prioritize Abhijit or Amrit Choghadiya.'
          : 'Reflective Inward Tide: Rest, strategize, and avoid high-risk commitments today.',
    },
  };
}
