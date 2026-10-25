import * as Astronomy from 'astronomy-engine';
import { CityLocation } from '../types/oceanology';
import { NAKSHATRAS, ZODIAC_SIGNS, getAyanamshaDegrees, norm360 } from './astronomyEngine';
import { STANDARD_27_NAKSHATRAS } from '../data/nakshatraCodex';

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

export const NEPALI_SOLAR_MONTHS = [
  'Baisakh (बैशाख)',
  'Jestha (जेठ)',
  'Ashadh (असार)',
  'Shrawan (साउन)',
  'Bhadra (भदौ)',
  'Ashwin (असोज)',
  'Kartik (कात्तिक)',
  'Mangsir (मंसिर)',
  'Poush (पुष)',
  'Magh (माघ)',
  'Falgun (फागुन)',
  'Chaitra (चैत)',
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
  { name: 'Ravivara (Sunday)', lord: 'Sun (Surya)', color: '#C88A2E' },
  { name: 'Somavara (Monday)', lord: 'Moon (Chandra)', color: '#2E6F7E' },
  { name: 'Mangalavara (Tuesday)', lord: 'Mars (Mangala)', color: '#B43E2F' },
  { name: 'Budhavara (Wednesday)', lord: 'Mercury (Budha)', color: '#3B7A57' },
  { name: 'Guruvara (Thursday)', lord: 'Jupiter (Brihaspati)', color: '#B87314' },
  { name: 'Shukravara (Friday)', lord: 'Venus (Shukra)', color: '#A34868' },
  { name: 'Shanivara (Saturday)', lord: 'Saturn (Shani)', color: '#3E547A' },
];

export type HoraiLordId =
  | 'Sun'
  | 'Venus'
  | 'Mercury'
  | 'Moon'
  | 'Saturn'
  | 'Jupiter'
  | 'Mars';

export const HORAI_SEQUENCE: HoraiLordId[] = [
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
  'Saturn',
  'Jupiter',
  'Mars',
];

export interface HoraiSacredFlower {
  name: string;
  sanskrit: string;
  variety: 'lotus' | 'marigold' | 'jasmine' | 'lily' | 'hibiscus' | 'parijata' | 'aparajita';
  primaryHex: string;
  secondaryHex: string;
}

export interface HoraiLordMetadata {
  id: HoraiLordId;
  horaiName: string;
  sanskritHora: string;
  tamilName: string;
  devanagariName: string;
  quality:
    | 'Supreme Shubha'
    | 'Shubha'
    | 'Madhyama (Authority)'
    | 'Ugra (Caution)'
    | 'Manda (Avoid New Starts)';
  tone: 'optimal' | 'favorable' | 'info' | 'mixed' | 'avoid';
  sacredFlower: HoraiSacredFlower;
  plainSummary: string;
  bestFor: string[];
  avoidFor: string[];
  classicalRule: string;
}

export const HORAI_LORD_META: Record<HoraiLordId, HoraiLordMetadata> = {
  Venus: {
    id: 'Venus',
    horaiName: 'Sukra Horai',
    sanskritHora: 'Shukra Hora',
    tamilName: 'சுக்கிர ஓரை',
    devanagariName: 'शुक्र होरा',
    quality: 'Supreme Shubha',
    tone: 'optimal',
    sacredFlower: {
      name: 'White Padma & Mallika Jasmine',
      sanskrit: 'श्वेत पद्म / मल्लिका',
      variety: 'jasmine',
      primaryHex: '#EC4899',
      secondaryHex: '#FBCFE8',
    },
    plainSummary:
      'Golden prosperity & harmony hour. Best time of day for wealth, gold/jewelry, love & marriage talks, vehicles, art, and welcoming comfort into the home.',
    bestFor: [
      'Buying gold, silver, gems, or clothes',
      'Marriage proposals, romance & family harmony',
      'Buying vehicles or entering a new home',
      'Financial inflows, luxury & creative launches',
    ],
    avoidFor: ['Harsh litigation', 'Demolition or confrontational disputes'],
    classicalRule:
      'Brihat Parashara & Kalaprakashika crown Shukra Hora for Lakshmi acquisition, Vivaha talks, ornaments, vehicles, and joyous travel.',
  },
  Jupiter: {
    id: 'Jupiter',
    horaiName: 'Guru Horai',
    sanskritHora: 'Guru Hora',
    tamilName: 'குரு ஓரை',
    devanagariName: 'गुरु होरा',
    quality: 'Supreme Shubha',
    tone: 'optimal',
    sacredFlower: {
      name: 'Golden Marigold & Swarna Champaka',
      sanskrit: 'स्वर्ण चम्पक / गेंदा',
      variety: 'marigold',
      primaryHex: '#F59E0B',
      secondaryHex: '#FDE68A',
    },
    plainSummary:
      'Supreme wisdom & growth hour. Unmatched for banking, business launches, major contracts, higher study, marriage ceremonies, and spiritual blessings.',
    bestFor: [
      'Opening bank accounts, investing & wealth deposits',
      'Launching businesses or signing major covenants',
      'Marriage rites, housewarming & temple worship',
      'Higher education, legal counsel & mentorship',
    ],
    avoidFor: ['Speculative gambling', 'Deceptive or unethical dealings'],
    classicalRule:
      'Guru Hora bestows Brihaspati’s protective grace (Dharma-Vriddhi), neutralizing minor blemishes for treasury, study, and auspicious beginnings.',
  },
  Mercury: {
    id: 'Mercury',
    horaiName: 'Budha Horai',
    sanskritHora: 'Budha Hora',
    tamilName: 'புதன் ஓரை',
    devanagariName: 'बुध होरा',
    quality: 'Shubha',
    tone: 'favorable',
    sacredFlower: {
      name: 'Parijata & Sacred Emerald Tulsi',
      sanskrit: 'पारिजात / तुलसी मंजरी',
      variety: 'parijata',
      primaryHex: '#10B981',
      secondaryHex: '#A7F3D0',
    },
    plainSummary:
      'Sharp intellect & commerce hour. Ideal for contracts, software/tech work, accounting, exams, writing, negotiations, and brisk trade.',
    bestFor: [
      'Signing commercial agreements & employment offers',
      'Software launches, coding, writing & publishing',
      'Studying new skills, exams & certifications',
      'Accounting, trading & medical consultations',
    ],
    avoidFor: ['Emotionally reactive arguments without clear documentation'],
    classicalRule:
      'Budha Hora sharpens Yukti (analytical discernment), favoring Vidya (learning), Vanijya (trade), and Sandhi-Patra (written treaties).',
  },
  Moon: {
    id: 'Moon',
    horaiName: 'Chandra Horai',
    sanskritHora: 'Chandra Hora',
    tamilName: 'சந்திர ஓரை',
    devanagariName: 'चन्द्र होरा',
    quality: 'Shubha',
    tone: 'favorable',
    sacredFlower: {
      name: 'Kumuda Night-Blooming Water Lily',
      sanskrit: 'कुमुद / श्वेत उत्पल',
      variety: 'lily',
      primaryHex: '#0EA5E9',
      secondaryHex: '#BAE6FD',
    },
    plainSummary:
      'Gentle nurturing & flow hour. Supportive for travel, family peace, hospitality, food/farming, healing remedies, and public goodwill.',
    bestFor: [
      'Starting pleasant journeys & coastal/water travel',
      'Starting medicine, healing & emotional reconciliation',
      'Gardening, agriculture, food & hospitality ventures',
      'Community outreach & customer relationships',
    ],
    avoidFor: ['Heavy iron/mining construction when Moon is deeply waning'],
    classicalRule:
      'Chandra Hora carries Soma-Amrita nourishment, especially potent during Shukla Paksha (waxing Moon) for health, travel, and public favor.',
  },
  Sun: {
    id: 'Sun',
    horaiName: 'Suriya Horai',
    sanskritHora: 'Surya Hora',
    tamilName: 'சூரிய ஓரை',
    devanagariName: 'सूर्य होरा',
    quality: 'Madhyama (Authority)',
    tone: 'info',
    sacredFlower: {
      name: 'Sahasrara Red-Gold Padma Lotus',
      sanskrit: 'रक्त कमल / पद्म',
      variety: 'lotus',
      primaryHex: '#EA580C',
      secondaryHex: '#FED7AA',
    },
    plainSummary:
      'Sovereign authority & leadership hour. Strong for government filings, meeting executives, taking office, and decisive leadership—too fiery for delicate domestic rites.',
    bestFor: [
      'Government petitions, permits & official filings',
      'Meeting executives, bosses, or institutional leaders',
      'Assuming leadership roles & public speaking',
      'Vitality practices & constitutional discipline',
    ],
    avoidFor: [
      'Entering a new house (Griha Pravesha)',
      'Delicate marriage talks or ego confrontations',
    ],
    classicalRule:
      'Surya Hora excels in Raja-Seva (statecraft and executive authority) while its solar heat (Pratapa) advises restraint in gentle domestic ceremonies.',
  },
  Mars: {
    id: 'Mars',
    horaiName: 'Sevvai Horai',
    sanskritHora: 'Mangala / Kuja Hora',
    tamilName: 'செவ்வாய் ஓரை',
    devanagariName: 'मङ्गल होरा',
    quality: 'Ugra (Caution)',
    tone: 'mixed',
    sacredFlower: {
      name: 'Crimson Japa Hibiscus',
      sanskrit: 'जपा पुष्प / रक्त मन्दार',
      variety: 'hibiscus',
      primaryHex: '#E11D48',
      secondaryHex: '#FECDD3',
    },
    plainSummary:
      'Fiery high-intensity caution hour. Avoid peaceful new starts, marriage, lending, or travel; reserve for repaying old debt, athletics, engineering, or bold defense.',
    bestFor: [
      'Repaying old debt principal (Rina-Mochana)',
      'Engineering, electrical/fire work & land survey',
      'Athletics, martial training & surgical precision',
      'Strategic legal defense or auditing',
    ],
    avoidFor: [
      'Marriage, partnerships & peaceful negotiations',
      'Lending or borrowing money (multiplies conflict)',
      'Starting auspicious journeys or housewarming',
    ],
    classicalRule:
      'Kuja Hora is Ugra (fierce): classical texts forbid Shubha-Karya (gentle beginnings) here, reserving it for Saahasa (valor), Agni-Karya, and debt destruction.',
  },
  Saturn: {
    id: 'Saturn',
    horaiName: 'Sani Horai',
    sanskritHora: 'Shani Hora',
    tamilName: 'சனி ஓரை',
    devanagariName: 'शनि होरा',
    quality: 'Manda (Avoid New Starts)',
    tone: 'avoid',
    sacredFlower: {
      name: 'Neelakamala & Blue Aparajita',
      sanskrit: 'नीलकमल / अपराजिता',
      variety: 'aparajita',
      primaryHex: '#4F46E5',
      secondaryHex: '#C7D2FE',
    },
    plainSummary:
      'Slow, heavy endurance hour. Pause fresh launches, borrowing, marriage, or travel; ideal instead for deep cleaning, clearing backlogs, machinery, meditation, and charity.',
    bestFor: [
      'Deep decluttering, auditing & finishing old backlogs',
      'Iron, steel, machinery, agriculture & storage work',
      'Meditation, Pranayama & serving elders/charity',
      'Long-haul endurance maintenance',
    ],
    avoidFor: [
      'Launching a new business or signing fresh loans',
      'Marriage ceremonies, housewarming & joyful travel',
      'Starting new medical treatments (prolongs recovery)',
    ],
    classicalRule:
      'Shani Hora is Manda (slow-moving): fresh ventures initiated here face heavy delays, whereas karma-yoga, discipline, ironwork, and Seva bear lasting fruit.',
  },
};

export interface HoraiSlot {
  slotNumber: number; // 1..24
  period: 'DAY' | 'NIGHT';
  hourIndexInPeriod: number; // 1..12
  lord: HoraiLordId;
  horaiName: string;
  sanskritHora: string;
  tamilName: string;
  devanagariName: string;
  quality: HoraiLordMetadata['quality'];
  tone: HoraiLordMetadata['tone'];
  sacredFlower: HoraiSacredFlower;
  startTime: string;
  endTime: string;
  equalStartTime: string;
  equalEndTime: string;
  startHourFloat: number;
  endHourFloat: number;
  durationMinutes: number;
  isActiveNow: boolean;
  minutesRemaining: number;
  progressPercent: number;
  plainSummary: string;
  bestFor: string[];
  avoidFor: string[];
  classicalRule: string;
  kalamConflictNote: string | null;
}

export type GowriName =
  | 'Amirtham'
  | 'Dhanam'
  | 'Labham'
  | 'Sugam'
  | 'Uthi'
  | 'Rogam'
  | 'Visham'
  | 'Kalaham';

export interface GowriSlot {
  slotIndex: number; // 1..8
  period: 'DAY' | 'NIGHT';
  name: GowriName;
  tamilLabel: string;
  nature: 'Most Auspicious' | 'Auspicious' | 'Good' | 'Avoid';
  tone: 'optimal' | 'favorable' | 'avoid';
  plainMeaning: string;
  startTime: string;
  endTime: string;
  isActiveNow: boolean;
  hasRahuOrYamaOverlap: boolean;
}

export interface NallaNeramWindow {
  periodLabel: string;
  startTime: string;
  endTime: string;
  gowriName: GowriName;
  note: string;
}

export interface MuhuratSlot {
  name: string;
  category: 'Auspicious' | 'Inauspicious' | 'Neutral';
  startTime: string;
  endTime: string;
  startHourFloat: number;
  endHourFloat: number;
  isActiveNow?: boolean;
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

export interface SpecialPanchangYoga {
  name: string;
  sanskrit: string;
  nature: 'Supreme' | 'Auspicious' | 'Multiplier' | 'Inauspicious';
  consequence: string;
}

export interface PanchangReport {
  dateStr: string;
  bikramSambat: {
    year: number;
    monthName: string;
    ApproxGate: number;
    formatted: string;
  };
  location: CityLocation;
  sunriseTime: string;
  sunsetTime: string;
  dinamanaHours: string; // Day length
  weekdayIdx: number;    // 0=Sun..6=Sat
  vara: { name: string; lord: string; color: string };
  tithi: {
    index: number; // 1-30
    name: string;
    paksha: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
    group: 'Nanda (Joy — 1,6,11)' | 'Bhadra (Wellness — 2,7,12)' | 'Jaya (Victory — 3,8,13)' | 'Rikta (Empty Hands — 4,9,14)' | 'Purna (Fullness — 5,10,15,30)';
    isRikta: boolean;
    progressPercent: number;
    hoursRemaining: string;
  };
  nakshatra: {
    index: number; // 1-27
    zeroIndex: number; // 0-26
    name: string;
    pada: number;
    ruler: string;
    deity: string;
    natureGroup: string;
    mukhaGaze: string;
    lochanaEye: string;
    shaktiName: string;
    progressPercent: number;
    hoursRemaining: string;
  };
  yoga: {
    index: number;
    name: string;
    isMaleficYoga: boolean;
    progressPercent: number;
  };
  karana: {
    name: string;
    isBhadraVishti: boolean;
    nature: string;
  };
  panchaka: {
    isActive: boolean;
    type: string;
    consequence: string;
  };
  dishashoola: {
    forbiddenDirection: 'East' | 'West' | 'North' | 'South';
    sanskritDirection: string;
    consequenceIfIgnored: string;
    pariharaRemedy: string;
  };
  specialYogas: SpecialPanchangYoga[];
  moonSign: string;
  moonSiderealLongitude: number;
  sunSign: string;
  sunSiderealLongitude: number;
  vedicClock: {
    ghati: number;
    pal: number;
    vipal: number;
    formatted: string;
  };
  muhurats: MuhuratSlot[];
  dayChoghadiya: ChoghadiyaSlot[];
  nightChoghadiya: ChoghadiyaSlot[];
  dayHorai: HoraiSlot[];
  nightHorai: HoraiSlot[];
  allHorai: HoraiSlot[];
  activeHorai: HoraiSlot;
  nextShubhaHorai: HoraiSlot;
  dayGowri: GowriSlot[];
  nightGowri: GowriSlot[];
  activeGowri: GowriSlot;
  nallaNeram: NallaNeramWindow[];
  personalTarabala: {
    taraName: string;
    taraNumber: number;
    isAuspicious: boolean;
    chandrabalaHouse: number;
    chandrabalaAuspicious: boolean;
    isChandrashtama: boolean;
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

  // Bikram Sambat Sidereal Solar Calendar
  const sunSignIdx = Math.floor(sunSid / 30);
  const approxGate = Math.min(32, Math.floor(sunSid % 30) + 1);
  const gregYear = date.getUTCFullYear();
  const gregMonth = date.getUTCMonth() + 1;
  // Mesha Sankranti occurs mid-April (~month 4); if Sun is in Mesha..Kumbha or late Chaitra before Jan, adjust BS year
  const bsYear = (gregMonth > 4 || (gregMonth === 4 && sunSignIdx === 0)) ? gregYear + 57 : gregYear + 56;
  const bsMonthName = NEPALI_SOLAR_MONTHS[sunSignIdx];

  // 1. Tithi (12° Moon - Sun elongation)
  const diffLon = norm360(moonSid - sunSid);
  const tithiZeroIdx = Math.floor(diffLon / 12); // 0-29
  const tithiIndex = tithiZeroIdx + 1; // 1-30
  const tithiNum15 = ((tithiZeroIdx % 15) + 1); // 1-15
  const tithiProgress = ((diffLon % 12) / 12) * 100;
  const paksha = tithiZeroIdx < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  const hoursRemTithi = (((12 - (diffLon % 12)) / 12.19) * 24).toFixed(1);

  const tithiMod5 = tithiNum15 % 5;
  let tithiGroup: PanchangReport['tithi']['group'] = 'Purna (Fullness — 5,10,15,30)';
  if (tithiMod5 === 1) tithiGroup = 'Nanda (Joy — 1,6,11)';
  else if (tithiMod5 === 2) tithiGroup = 'Bhadra (Wellness — 2,7,12)';
  else if (tithiMod5 === 3) tithiGroup = 'Jaya (Victory — 3,8,13)';
  else if (tithiMod5 === 4) tithiGroup = 'Rikta (Empty Hands — 4,9,14)';
  const isRikta = tithiMod5 === 4;

  // 2. Nakshatra (13°20' Moon Sidereal)
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSid / nakSpan) % 27;
  const nakObj = NAKSHATRAS[nakIdx];
  const nakTreatise = STANDARD_27_NAKSHATRAS[nakIdx];
  const nakProgress = ((moonSid % nakSpan) / nakSpan) * 100;
  const nakPada = Math.floor((moonSid % nakSpan) / (nakSpan / 4)) + 1;
  const hoursRemNak = (((nakSpan - (moonSid % nakSpan)) / 13.176) * 24).toFixed(1);

  // 3. Yoga ((Sun + Moon) % 360 / 13°20')
  const yogaSum = norm360(sunSid + moonSid);
  const yogaIdx = Math.floor(yogaSum / nakSpan) % 27;
  const yogaProgress = ((yogaSum % nakSpan) / nakSpan) * 100;
  // Classical Malefic Nitya Yogas (Vishkumbha=0, Atiganda=5, Shula=8, Ganda=9, Vyaghata=12, Vajra=14, Vyatipata=16, Parigha=18, Vaidhriti=26)
  const isMaleficYoga = [0, 5, 8, 9, 12, 14, 16, 18, 26].includes(yogaIdx);

  // 4. Karana (6° half-tithi)
  const karanaHalfIdx = Math.floor(diffLon / 6); // 0-59
  let karanaName = 'Bava';
  if (karanaHalfIdx === 0) karanaName = 'Kimstughna';
  else if (karanaHalfIdx === 57) karanaName = 'Shakuni';
  else if (karanaHalfIdx === 58) karanaName = 'Chatushpada';
  else if (karanaHalfIdx === 59) karanaName = 'Naga';
  else karanaName = KARANA_MOVABLE[(karanaHalfIdx - 1) % 7];
  const isBhadraVishti = karanaName.includes('Vishti');

  // 5. Sunrise & Sunset (Elevation-adjusted solar declination)
  const dayOfYear = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);
  const declRad = ((23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81))) * Math.PI) / 180;
  const latRad = (location.latitude * Math.PI) / 180;
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

  // Local time float & Weekday
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const localHourFloat = ((utcHours + location.timezoneOffsetHours) % 24 + 24) % 24;
  const weekdayIdx = new Date(date.getTime() + location.timezoneOffsetHours * 3600000).getUTCDay();
  const vara = VARA_DAYS[weekdayIdx];

  // 6. Dhanishtha Panchaka Check (Moon in Kumbha or Meena: 300° <= moonSid < 360°)
  const isPanchakaActive = moonSid >= 300;
  let panchakaType = 'None (Clear of Panchaka)';
  let panchakaConsequence = 'Moon is outside the Kumbha–Meena Panchaka arc; timber roofing, fuel storage, cots, and Southward travel face no Panchaka restriction.';
  if (isPanchakaActive) {
    const panchakaMap: Record<number, { type: string; desc: string }> = {
      0: { type: 'Roga Panchaka (Sunday)', desc: 'Heightens physical fatigue if overexerted; avoid laying wooden roofs, buying beds, or Southward travel.' },
      1: { type: 'Raja Panchaka (Monday)', desc: 'Favorable for state/administrative filings and property paperwork, while still avoiding timber roofing and South travel.' },
      2: { type: 'Agni Panchaka (Tuesday)', desc: 'High fire/electrical volatility! Strictly avoid roofing, storing fuel/timber, or Southward travel; suited for court or demolition work.' },
      3: { type: 'Dosh-Mukta / Sadharana Panchaka (Wednesday)', desc: 'Mildest Panchaka window; routine business flows well, avoiding only the 5 classic Panchaka taboos (roofing, fuel, bed-weaving, South travel).' },
      4: { type: 'Guru / Sadharana Panchaka (Thursday)', desc: 'Gentle Panchaka window; auspicious rituals succeed, avoiding only the 5 specific Panchaka taboos.' },
      5: { type: 'Chora Panchaka (Friday)', desc: 'Financial leakage & theft alert! Avoid starting journeys, lending valuables, or leaving assets unguarded.' },
      6: { type: 'Mrityu Panchaka (Saturday)', desc: 'Severest Panchaka caution! Avoid elective surgery, high-risk ventures, roofing, litigation, and Southward travel.' },
    };
    panchakaType = panchakaMap[weekdayIdx].type;
    panchakaConsequence = panchakaMap[weekdayIdx].desc;
  }

  // 7. Dishashoola (Directional Travel Thorn) & Classical Parihara
  const dishaTable: Record<number, PanchangReport['dishashoola']> = {
    0: {
      forbiddenDirection: 'West',
      sanskritDirection: 'Paschima (पश्चिम)',
      consequenceIfIgnored: 'Unassisted Westward departure on Sunday invites ego friction, heat exhaustion, or stalled meetings.',
      pariharaRemedy: 'Take pure Ghee, Daliya (porridge), or Betel leaf (Paan) before crossing your home threshold.',
    },
    1: {
      forbiddenDirection: 'East',
      sanskritDirection: 'Purva (पूर्व)',
      consequenceIfIgnored: 'Unmitigated Eastward departure on Monday triggers emotional delays or missed connections.',
      pariharaRemedy: 'Gaze calmly at your reflection in a mirror or sip fresh milk before stepping outside.',
    },
    2: {
      forbiddenDirection: 'North',
      sanskritDirection: 'Uttara (उत्तर)',
      consequenceIfIgnored: 'Unmitigated Northward travel on Tuesday risks mechanical/vehicular heat or sharp disputes.',
      pariharaRemedy: 'Eat a small piece of Jaggery (Gud) before leaving the house.',
    },
    3: {
      forbiddenDirection: 'North',
      sanskritDirection: 'Uttara (उत्तर)',
      consequenceIfIgnored: 'Northward travel on Wednesday without remedy invites miscommunication or paperwork snags.',
      pariharaRemedy: 'Chew a few Coriander seeds (Dhaniya) or Sesame (Til) before departure.',
    },
    4: {
      forbiddenDirection: 'South',
      sanskritDirection: 'Dakshina (दक्षिण)',
      consequenceIfIgnored: 'Southward departure on Thursday slows institutional approvals and drains vitality.',
      pariharaRemedy: 'Take fresh Curd (Dahi) or Cumin/Mustard seeds before stepping out.',
    },
    5: {
      forbiddenDirection: 'West',
      sanskritDirection: 'Paschima (पश्चिम)',
      consequenceIfIgnored: 'Westward travel on Friday invites unexpected expenses or itinerary changes.',
      pariharaRemedy: 'Take sweet Curd (Dahi-Mishri) or Barley before crossing the threshold.',
    },
    6: {
      forbiddenDirection: 'East',
      sanskritDirection: 'Purva (पूर्व)',
      consequenceIfIgnored: 'Eastward travel on Saturday encounters sluggish bottlenecks and heavy transit delays.',
      pariharaRemedy: 'Take fresh Ginger (Adrak) or Black Sesame / Urad before starting the journey.',
    },
  };
  const dishashoola = dishaTable[weekdayIdx];

  // 8. Special Vara-Nakshatra-Tithi Yogas (Muhurta Chintamani)
  const specialYogas: SpecialPanchangYoga[] = [];

  // Amrita Siddhi Yoga
  const amritaPairs: Record<number, number> = { 0: 12, 1: 4, 2: 0, 3: 16, 4: 7, 5: 26, 6: 3 };
  if (amritaPairs[weekdayIdx] === nakIdx) {
    let caveat = 'Grants nectar-like success across enterprises, travel, and commitments.';
    if (weekdayIdx === 4 && nakIdx === 7) caveat = 'Supreme Guru-Pushya Amrita Siddhi! Unrivaled for buying gold, wealth, Diksha, and business—strictly avoid Marriage (Vivaha).';
    if (weekdayIdx === 2 && nakIdx === 0) caveat = 'Amrita Siddhi accelerates healing, vehicles, and trade—strictly avoid Griha Pravesha (housewarming) on Tuesday!';
    if (weekdayIdx === 6 && nakIdx === 3) caveat = 'Endows monumental permanence to foundations and commerce—avoid long-distance travel.';
    specialYogas.push({
      name: weekdayIdx === 4 && nakIdx === 7 ? 'Guru-Pushya Amrita Siddhi Yoga' : 'Amrita Siddhi Yoga',
      sanskrit: 'अमृत सिद्धि योग',
      nature: 'Supreme',
      consequence: caveat,
    });
  }

  // Ravi-Pushya Yoga
  if (weekdayIdx === 0 && nakIdx === 7) {
    specialYogas.push({
      name: 'Ravi-Pushya Yoga',
      sanskrit: 'रवि-पुष्य योग',
      nature: 'Supreme',
      consequence: 'Solar-Brihaspati treasury alignment: auspicious for bullion, sovereign filings, Mantra Siddhi, and Ayurvedic remedies (except Vivaha).',
    });
  }

  // Sarvartha Siddhi Yoga
  const sarvarthaMap: Record<number, number[]> = {
    0: [0, 7, 11, 12, 18, 20, 25],
    1: [3, 4, 7, 16, 21],
    2: [0, 2, 8, 25],
    3: [2, 3, 4, 12, 16],
    4: [0, 6, 7, 16, 26],
    5: [0, 6, 16, 21, 26],
    6: [3, 14, 21],
  };
  if (sarvarthaMap[weekdayIdx]?.includes(nakIdx)) {
    specialYogas.push({
      name: 'Sarvartha Siddhi Yoga',
      sanskrit: 'सर्वार्थ सिद्धि योग',
      nature: 'Auspicious',
      consequence: 'Neutralizes minor Panchang blemishes and supports fulfillment of purposeful undertakings.',
    });
  }

  // Tripushkara & Dwipushkara Yogas (Sun/Tue/Sat + Bhadra Tithi 2,7,12 + specific stars)
  if ([0, 2, 6].includes(weekdayIdx) && [2, 7, 12].includes(tithiNum15)) {
    if ([2, 6, 11, 15, 20, 24].includes(nakIdx)) {
      specialYogas.push({
        name: 'Tripushkara Yoga (3× Multiplier)',
        sanskrit: 'त्रिपुष्कर योग',
        nature: 'Multiplier',
        consequence: 'Whatever is done today repeats THREE TIMES! Extraordinary for buying gold, depositing savings, or acquiring property; strictly avoid taking loans, lawsuits, or loss!',
      });
    } else if ([4, 13, 22].includes(nakIdx)) {
      specialYogas.push({
        name: 'Dwipushkara Yoga (2× Multiplier)',
        sanskrit: 'द्विपुष्कर योग',
        nature: 'Multiplier',
        consequence: 'Whatever is initiated today repeats TWICE! Excellent for asset acquisition and revenue; avoid debt or disputes.',
      });
    }
  }

  // Vara-Nakshatra Dagdha ("Scorched") Yoga
  const dagdhaNakMap: Record<number, number> = { 0: 1, 1: 13, 2: 20, 3: 22, 4: 11, 5: 17, 6: 26 };
  const dagdhaTithiMap: Record<number, number> = { 0: 12, 1: 11, 2: 5, 3: 3, 4: 6, 5: 8, 6: 9 };
  if (dagdhaNakMap[weekdayIdx] === nakIdx || dagdhaTithiMap[weekdayIdx] === tithiNum15) {
    specialYogas.push({
      name: 'Dagdha Yoga (Scorched Window)',
      sanskrit: 'दग्ध योग',
      nature: 'Inauspicious',
      consequence: 'Vara-Nakshatra/Tithi friction scorches delicate new beginnings (marriage, travel, lending); keep to routine work or use Abhijit Muhurta if urgent.',
    });
  }

  // Rahu Kaal, Yamaganda, Gulika Kaal 1/8th segments by weekday (Sun=0..Sat=6)
  const rahuOctants = [8, 2, 7, 5, 6, 4, 3];
  const yamaOctants = [5, 4, 3, 2, 1, 7, 6];
  const gulikaOctants = [7, 6, 5, 4, 3, 2, 1];

  const hoursSinceSunrise = ((localHourFloat - sunriseHour) + 24) % 24;

  const rStart = sunriseHour + (rahuOctants[weekdayIdx] - 1) * eighthDay;
  const rEnd = rStart + eighthDay;
  const yStart = sunriseHour + (yamaOctants[weekdayIdx] - 1) * eighthDay;
  const yEnd = yStart + eighthDay;
  const gStart = sunriseHour + (gulikaOctants[weekdayIdx] - 1) * eighthDay;
  const gEnd = gStart + eighthDay;
  const abhijitHalf = dayLenHours / 30;
  const brahmaStart = sunriseHour - 1.6;
  const brahmaEnd = sunriseHour - 0.8;
  const godhuliStart = sunsetHour - 0.2;
  const godhuliEnd = sunsetHour + 0.2;
  const pradoshaStart = sunsetHour;
  const pradoshaEnd = sunsetHour + 1.5;
  const solarMidnight = sunsetHour + nightLenHours / 2;
  const nishitaStart = solarMidnight - 0.4;
  const nishitaEnd = solarMidnight + 0.4;

  // Classical Durmuhurtam (1/15th daytime solar Muhurtas per weekday: 1-indexed)
  const fifteenthDay = dayLenHours / 15;
  const durmuhurtaMap: Record<number, number[]> = {
    0: [14],        // Sunday: 14th Muhurta
    1: [9, 12],     // Monday: 9th & 12th Muhurtas
    2: [4],         // Tuesday: 4th daytime Muhurta
    3: [8],         // Wednesday: 8th Muhurta
    4: [6, 12],     // Thursday: 6th & 12th Muhurtas
    5: [4, 9],      // Friday: 4th & 9th Muhurtas
    6: [1, 2],      // Saturday: 1st & 2nd Muhurtas
  };
  const durSlots = durmuhurtaMap[weekdayIdx] || [8];
  const durStart = sunriseHour + (durSlots[0] - 1) * fifteenthDay;
  const durEnd =
    durSlots.length === 2 && durSlots[1] === durSlots[0] + 1
      ? sunriseHour + durSlots[1] * fifteenthDay
      : durStart + fifteenthDay;
  const secondDurText =
    durSlots.length === 2 && durSlots[1] !== durSlots[0] + 1
      ? ` (2nd window: ${formatHourFloat(
          sunriseHour + (durSlots[1] - 1) * fifteenthDay
        )}–${formatHourFloat(sunriseHour + durSlots[1] * fifteenthDay)})`
      : '';

  const isSlotActive = (sHour: number, eHour: number) => {
    const relS = ((sHour - sunriseHour) + 24) % 24;
    const relE = ((eHour - sunriseHour) + 24) % 24;
    if (relE > relS) {
      return hoursSinceSunrise >= relS && hoursSinceSunrise < relE;
    }
    return hoursSinceSunrise >= relS || hoursSinceSunrise < relE;
  };

  const muhurats: MuhuratSlot[] = [
    {
      name: 'Brahma Muhurta',
      category: 'Auspicious',
      startTime: formatHourFloat(brahmaStart),
      endTime: formatHourFloat(brahmaEnd),
      startHourFloat: brahmaStart,
      endHourFloat: brahmaEnd,
      isActiveNow: isSlotActive(brahmaStart, brahmaEnd),
      description: 'Supreme pre-dawn nectar window (96–48 min before sunrise) for meditation, pranayama, and sacred study.',
    },
    {
      name: weekdayIdx === 3 ? 'Abhijit Span (Avoid on Wed)' : 'Abhijit Muhurat',
      category: weekdayIdx === 3 ? 'Neutral' : 'Auspicious',
      startTime: formatHourFloat(solarNoonLocal - abhijitHalf),
      endTime: formatHourFloat(solarNoonLocal + abhijitHalf),
      startHourFloat: solarNoonLocal - abhijitHalf,
      endHourFloat: solarNoonLocal + abhijitHalf,
      isActiveNow: isSlotActive(solarNoonLocal - abhijitHalf, solarNoonLocal + abhijitHalf),
      description:
        weekdayIdx === 3
          ? 'Classical texts exclude Wednesday’s midday window from Abhijit protection; use Labh/Amrit Choghadiya or Guru/Sukra Horai instead.'
          : 'Victorious midday solar zenith window neutralizing minor directional & Panchang doshas for urgent righteous action.',
    },
    {
      name: 'Godhuli Muhurta',
      category: 'Auspicious',
      startTime: formatHourFloat(godhuliStart),
      endTime: formatHourFloat(godhuliEnd),
      startHourFloat: godhuliStart,
      endHourFloat: godhuliEnd,
      isActiveNow: isSlotActive(godhuliStart, godhuliEnd),
      description: 'Golden sunset twilight ("cow-dust hour") cherished for homecoming, lamps, Vivaha transitions, and auspicious prayers.',
    },
    {
      name: 'Pradosha Kalam',
      category: 'Auspicious',
      startTime: formatHourFloat(pradoshaStart),
      endTime: formatHourFloat(pradoshaEnd),
      startHourFloat: pradoshaStart,
      endHourFloat: pradoshaEnd,
      isActiveNow: isSlotActive(pradoshaStart, pradoshaEnd),
      description: 'Sacred 90-minute post-sunset Shiva twilight window—ideal for releasing karmic friction, forgiveness, and evening Sadhana.',
    },
    {
      name: 'Nishita Muhurta',
      category: 'Auspicious',
      startTime: formatHourFloat(nishitaStart),
      endTime: formatHourFloat(nishitaEnd),
      startHourFloat: nishitaStart,
      endHourFloat: nishitaEnd,
      isActiveNow: isSlotActive(nishitaStart, nishitaEnd),
      description: 'Silent solar-midnight spiritual stillness window (48 minutes centered on true local midnight).',
    },
    {
      name: 'Gulika (Kuligai) Kaal',
      category: 'Neutral',
      startTime: formatHourFloat(gStart),
      endTime: formatHourFloat(gEnd),
      startHourFloat: gStart,
      endHourFloat: gEnd,
      isActiveNow: isSlotActive(gStart, gEnd),
      description: 'Ruled by Mandi/Kuligai: actions done here repeat—great for buying gold, saving money, or repaying debt; avoid borrowing or funerals.',
    },
    {
      name: 'Durmuhurtam',
      category: 'Inauspicious',
      startTime: formatHourFloat(durStart),
      endTime: formatHourFloat(durEnd),
      startHourFloat: durStart,
      endHourFloat: durEnd,
      isActiveNow: isSlotActive(durStart, durEnd),
      description: `Sharp solar-fifteenth caution window${secondDurText}; pause signing new agreements or departing on journeys during this brief span.`,
    },
    {
      name: 'Yamaganda Kaal',
      category: 'Inauspicious',
      startTime: formatHourFloat(yStart),
      endTime: formatHourFloat(yEnd),
      startHourFloat: yStart,
      endHourFloat: yEnd,
      isActiveNow: isSlotActive(yStart, yEnd),
      description: 'Inauspicious for travel, surgery, or auspicious launches; suitable for routine maintenance, auditing, or ancestral rites.',
    },
    {
      name: 'Rahu Kaal',
      category: 'Inauspicious',
      startTime: formatHourFloat(rStart),
      endTime: formatHourFloat(rEnd),
      startHourFloat: rStart,
      endHourFloat: rEnd,
      isActiveNow: isSlotActive(rStart, rEnd),
      description: 'Shadow node window; avoid signing new contracts, lending money, Vivaha, or initiating fresh ventures.',
    },
  ];

  // ==================== 24-HOUR GRAHA HORAI (12 DAY + 12 NIGHT PLANETARY HOURS) ====================
  // Weekday starting Hora indices in HORAI_SEQUENCE ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars']:
  const weekdayFirstHoraiSeqIdx = [0, 3, 6, 2, 5, 1, 4];
  const baseHoraiSeqIdx = weekdayFirstHoraiSeqIdx[weekdayIdx];
  const dayHoraLen = dayLenHours / 12;
  const nightHoraLen = nightLenHours / 12;

  const overlapsInterval = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
    Math.max(aStart, bStart) < Math.min(aEnd, bEnd) - 0.01;

  const allHorai: HoraiSlot[] = Array.from({ length: 24 }).map((_, idx) => {
    const isDay = idx < 12;
    const idxInPeriod = isDay ? idx : idx - 12;
    const lord = HORAI_SEQUENCE[(baseHoraiSeqIdx + idx) % 7];
    const meta = HORAI_LORD_META[lord];

    const relStart = isDay ? idxInPeriod * dayHoraLen : dayLenHours + idxInPeriod * nightHoraLen;
    const relEnd = isDay
      ? (idxInPeriod + 1) * dayHoraLen
      : dayLenHours + (idxInPeriod + 1) * nightHoraLen;

    const absStart = sunriseHour + relStart;
    const absEnd = sunriseHour + relEnd;
    const eqStart = sunriseHour + idx;
    const eqEnd = sunriseHour + idx + 1;

    const active = hoursSinceSunrise >= relStart && hoursSinceSunrise < relEnd;
    const slotSpanHours = relEnd - relStart;
    const durationMinutes = Math.max(1, Math.round(slotSpanHours * 60));
    const minutesRemaining = active
      ? Math.max(1, Math.ceil((relEnd - hoursSinceSunrise) * 60))
      : durationMinutes;
    const progressPercent = active
      ? Math.min(100, Math.max(0, Math.round(((hoursSinceSunrise - relStart) / slotSpanHours) * 100)))
      : 0;

    let kalamConflictNote: string | null = null;
    if (isDay) {
      if (overlapsInterval(absStart, absEnd, rStart, rEnd)) {
        kalamConflictNote = `Overlaps Rahu Kaal (${formatHourFloat(rStart)}–${formatHourFloat(rEnd)})`;
      } else if (overlapsInterval(absStart, absEnd, yStart, yEnd)) {
        kalamConflictNote = `Overlaps Yamaganda (${formatHourFloat(yStart)}–${formatHourFloat(yEnd)})`;
      }
    }

    return {
      slotNumber: idx + 1,
      period: isDay ? 'DAY' : 'NIGHT',
      hourIndexInPeriod: idxInPeriod + 1,
      lord,
      horaiName: meta.horaiName,
      sanskritHora: meta.sanskritHora,
      tamilName: meta.tamilName,
      devanagariName: meta.devanagariName,
      quality: meta.quality,
      tone: meta.tone,
      sacredFlower: meta.sacredFlower,
      startTime: formatHourFloat(absStart),
      endTime: formatHourFloat(absEnd),
      equalStartTime: formatHourFloat(eqStart),
      equalEndTime: formatHourFloat(eqEnd),
      startHourFloat: absStart,
      endHourFloat: absEnd,
      durationMinutes,
      isActiveNow: active,
      minutesRemaining,
      progressPercent,
      plainSummary: meta.plainSummary,
      bestFor: meta.bestFor,
      avoidFor: meta.avoidFor,
      classicalRule: meta.classicalRule,
      kalamConflictNote,
    };
  });

  const dayHorai = allHorai.slice(0, 12);
  const nightHorai = allHorai.slice(12, 24);
  const activeHorai = allHorai.find((h) => h.isActiveNow) || allHorai[0];
  const activeIdx = activeHorai.slotNumber - 1;
  const shubhaLords: HoraiLordId[] = ['Venus', 'Jupiter', 'Mercury', 'Moon'];
  let nextShubhaHorai = allHorai[(activeIdx + 1) % 24];
  for (let step = 1; step <= 24; step++) {
    const candidate = allHorai[(activeIdx + step) % 24];
    if (shubhaLords.includes(candidate.lord) && !candidate.kalamConflictNote) {
      nextShubhaHorai = candidate;
      break;
    }
  }

  // ==================== GOWRI PANCHANGAM (8 DAY + 8 NIGHT SLOTS) & NALLA NERAM ====================
  const gowriMeta: Record<
    GowriName,
    {
      tamilLabel: string;
      nature: GowriSlot['nature'];
      tone: GowriSlot['tone'];
      plainMeaning: string;
    }
  > = {
    Amirtham: {
      tamilLabel: 'அமிர்தம்',
      nature: 'Most Auspicious',
      tone: 'optimal',
      plainMeaning: 'Nectar flow — supreme window for lasting prosperity, ceremonies & launches.',
    },
    Dhanam: {
      tamilLabel: 'தனம்',
      nature: 'Auspicious',
      tone: 'optimal',
      plainMeaning: 'Treasury & wealth flow — excellent for deposits, purchases, gold & commerce.',
    },
    Labham: {
      tamilLabel: 'லாபம்',
      nature: 'Auspicious',
      tone: 'favorable',
      plainMeaning: 'Gain & fruitful return — supportive for trade, negotiations & investments.',
    },
    Sugam: {
      tamilLabel: 'சுகம்',
      nature: 'Auspicious',
      tone: 'favorable',
      plainMeaning: 'Harmony & comfort — favorable for family peace, healing, travel & home.',
    },
    Uthi: {
      tamilLabel: 'உத்தி',
      nature: 'Good',
      tone: 'favorable',
      plainMeaning: 'Elevation & steady rise — good for career initiative, study & official filings.',
    },
    Rogam: {
      tamilLabel: 'ரோகம்',
      nature: 'Avoid',
      tone: 'avoid',
      plainMeaning: 'Vitality strain — avoid new beginnings or elective treatments; rest or do routine tasks.',
    },
    Visham: {
      tamilLabel: 'விஷம் (சோரகம்)',
      nature: 'Avoid',
      tone: 'avoid',
      plainMeaning: 'Friction window — pause delicate agreements, lending, or important departures.',
    },
    Kalaham: {
      tamilLabel: 'கலகம்',
      nature: 'Avoid',
      tone: 'avoid',
      plainMeaning: 'Dispute tendency — avoid sensitive confrontations, partnerships, or contracts.',
    },
  };

  const gowriBaseRing: GowriName[] = [
    'Uthi',
    'Amirtham',
    'Rogam',
    'Labham',
    'Dhanam',
    'Sugam',
    'Visham',
    'Kalaham',
  ];
  const nightGowriStartOffset = [5, 6, 7, 0, 1, 2, 3]; // Sun=Sugam(5), Mon=Visham(6), Tue=Kalaham(7), Wed=Uthi(0), Thu=Amirtham(1), Fri=Rogam(2), Sat=Labham(3)

  const eighthNight = nightLenHours / 8;

  const dayGowri: GowriSlot[] = Array.from({ length: 8 }).map((_, i) => {
    const name = gowriBaseRing[(weekdayIdx + i) % 8];
    const meta = gowriMeta[name];
    const relS = i * eighthDay;
    const relE = (i + 1) * eighthDay;
    const absS = sunriseHour + relS;
    const absE = sunriseHour + relE;
    const hasConflict =
      i + 1 === rahuOctants[weekdayIdx] || i + 1 === yamaOctants[weekdayIdx];
    return {
      slotIndex: i + 1,
      period: 'DAY',
      name,
      tamilLabel: meta.tamilLabel,
      nature: meta.nature,
      tone: meta.tone,
      plainMeaning: meta.plainMeaning,
      startTime: formatHourFloat(absS),
      endTime: formatHourFloat(absE),
      isActiveNow: hoursSinceSunrise >= relS && hoursSinceSunrise < relE,
      hasRahuOrYamaOverlap: hasConflict,
    };
  });

  const nightGowri: GowriSlot[] = Array.from({ length: 8 }).map((_, i) => {
    const name = gowriBaseRing[(nightGowriStartOffset[weekdayIdx] + i) % 8];
    const meta = gowriMeta[name];
    const relS = dayLenHours + i * eighthNight;
    const relE = dayLenHours + (i + 1) * eighthNight;
    const absS = sunriseHour + relS;
    const absE = sunriseHour + relE;
    return {
      slotIndex: i + 1,
      period: 'NIGHT',
      name,
      tamilLabel: meta.tamilLabel,
      nature: meta.nature,
      tone: meta.tone,
      plainMeaning: meta.plainMeaning,
      startTime: formatHourFloat(absS),
      endTime: formatHourFloat(absE),
      isActiveNow: hoursSinceSunrise >= relS && hoursSinceSunrise < relE,
      hasRahuOrYamaOverlap: false,
    };
  });

  const activeGowri =
    [...dayGowri, ...nightGowri].find((g) => g.isActiveNow) || dayGowri[0];

  // Nalla Neram: Cleanest Morning & Afternoon/Evening Gowri octants strictly free of Rahu, Yamaganda & Kuligai
  const cleanDayOctants = dayGowri.filter(
    (g) =>
      g.tone !== 'avoid' &&
      !g.hasRahuOrYamaOverlap &&
      g.slotIndex !== gulikaOctants[weekdayIdx]
  );
  const morningClean =
    cleanDayOctants.find((g) => g.slotIndex <= 4) ||
    dayGowri.find((g) => g.slotIndex <= 4 && !g.hasRahuOrYamaOverlap) ||
    dayGowri[0];
  const eveningClean =
    [...cleanDayOctants].reverse().find((g) => g.slotIndex >= 5) ||
    [...dayGowri].reverse().find((g) => g.slotIndex >= 5 && !g.hasRahuOrYamaOverlap) ||
    dayGowri[dayGowri.length - 1];

  const nallaNeram: NallaNeramWindow[] = [
    {
      periodLabel: 'Morning Nalla Neram',
      startTime: morningClean.startTime,
      endTime: morningClean.endTime,
      gowriName: morningClean.name,
      note: `Pure ${morningClean.name} window — free of Rahu Kalam & Yamagandam.`,
    },
    {
      periodLabel: 'Afternoon / Evening Nalla Neram',
      startTime: eveningClean.startTime,
      endTime: eveningClean.endTime,
      gowriName: eveningClean.name,
      note: `Pure ${eveningClean.name} window — favorable for evening agreements & worship.`,
    },
  ];

  // Day & Night Choghadiya
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
    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
    ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
    ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
    ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
    ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
    ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
  ];

  const nightSeqByWeekday: ChoghadiyaSlot['name'][][] = [
    ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
    ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
    ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],
    ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
    ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
    ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],
    ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
  ];

  const dayChoghadiya: ChoghadiyaSlot[] = daySeqByWeekday[weekdayIdx].map((name, i) => {
    const relS = i * eighthDay;
    const relE = (i + 1) * eighthDay;
    const s = sunriseHour + relS;
    const e = sunriseHour + relE;
    return {
      name,
      ruler: chogMeta[name].ruler,
      nature: chogMeta[name].nature,
      startTime: formatHourFloat(s),
      endTime: formatHourFloat(e),
      isActiveNow: hoursSinceSunrise >= relS && hoursSinceSunrise < relE,
    };
  });

  const nightChoghadiya: ChoghadiyaSlot[] = nightSeqByWeekday[weekdayIdx].map((name, i) => {
    const relS = dayLenHours + i * eighthNight;
    const relE = dayLenHours + (i + 1) * eighthNight;
    const s = sunriseHour + relS;
    const e = sunriseHour + relE;
    return {
      name,
      ruler: chogMeta[name].ruler,
      nature: chogMeta[name].nature,
      startTime: formatHourFloat(s),
      endTime: formatHourFloat(e),
      isActiveNow: hoursSinceSunrise >= relS && hoursSinceSunrise < relE,
    };
  });

  // Vedic Clock (Ghati / Pal / Vipal since Sunrise)
  const totalGhatis = hoursSinceSunrise * 2.5;
  const ghati = Math.floor(totalGhatis);
  const totalPals = (totalGhatis - ghati) * 60;
  const pal = Math.floor(totalPals);
  const vipal = Math.floor((totalPals - pal) * 60);

  // Personal Tarabala & Chandrabala
  const taraNames = [
    'Janma (Body / Somatic Sensitivity)',
    'Sampat (Wealth & Prosperity)',
    'Vipat (Sudden Obstacles)',
    'Kshema (Safety & Well-Being)',
    'Pratyak (Headwinds & Resistance)',
    'Sadhana (Mastery & Realization)',
    'Naidhana (Peril / Deep Caution)',
    'Mitra (Friendly Alliance)',
    'Parama Mitra (Supreme Harmony)',
  ];
  const distNak = (nakIdx - natalMoonNakshatraIdx + 27) % 27;
  const taraIdx = distNak % 9;
  const taraAuspicious = [1, 3, 5, 7, 8].includes(taraIdx);

  const transitMoonSignIdx = Math.floor(moonSid / 30);
  const chandraHouse = ((transitMoonSignIdx - natalMoonSignIdx + 12) % 12) + 1;
  const chandraAuspicious = [1, 3, 6, 7, 10, 11].includes(chandraHouse);
  const isChandrashtama = chandraHouse === 8;

  return {
    dateStr: date.toISOString().slice(0, 10),
    bikramSambat: {
      year: bsYear,
      monthName: bsMonthName,
      ApproxGate: approxGate,
      formatted: `BS ${bsYear} ${bsMonthName.split(' ')[0]} ~${approxGate}`,
    },
    location,
    sunriseTime: formatHourFloat(sunriseHour),
    sunsetTime: formatHourFloat(sunsetHour),
    dinamanaHours: `${Math.floor(dayLenHours)}h ${Math.round((dayLenHours % 1) * 60)}m`,
    weekdayIdx,
    vara,
    tithi: {
      index: tithiIndex,
      name: TITHI_NAMES[tithiZeroIdx],
      paksha,
      group: tithiGroup,
      isRikta,
      progressPercent: Math.round(tithiProgress),
      hoursRemaining: `${hoursRemTithi}h left`,
    },
    nakshatra: {
      index: nakIdx + 1,
      zeroIndex: nakIdx,
      name: nakObj.name,
      pada: nakPada,
      ruler: nakObj.ruler,
      deity: nakObj.deity,
      natureGroup: nakTreatise.natureGroup,
      mukhaGaze: nakTreatise.mukhaGaze,
      lochanaEye: nakTreatise.lochanaEye,
      shaktiName: nakTreatise.shaktiName,
      progressPercent: Math.round(nakProgress),
      hoursRemaining: `${hoursRemNak}h left`,
    },
    yoga: {
      index: yogaIdx + 1,
      name: YOGA_NAMES[yogaIdx],
      isMaleficYoga,
      progressPercent: Math.round(yogaProgress),
    },
    karana: {
      name: karanaName,
      isBhadraVishti,
      nature: isBhadraVishti ? 'Bhadra / Vishti (Pause Auspicious Launches)' : 'Constructive Action',
    },
    panchaka: {
      isActive: isPanchakaActive,
      type: panchakaType,
      consequence: panchakaConsequence,
    },
    dishashoola,
    specialYogas,
    moonSign: `${ZODIAC_SIGNS[transitMoonSignIdx].sanskrit} (${ZODIAC_SIGNS[transitMoonSignIdx].name})`,
    moonSiderealLongitude: moonSid,
    sunSign: `${ZODIAC_SIGNS[sunSignIdx].sanskrit} (${ZODIAC_SIGNS[sunSignIdx].name})`,
    sunSiderealLongitude: sunSid,
    vedicClock: {
      ghati,
      pal,
      vipal,
      formatted: `${ghati.toString().padStart(2, '0')} Gh : ${pal.toString().padStart(2, '0')} Pa : ${vipal.toString().padStart(2, '0')} Vi`,
    },
    muhurats,
    dayChoghadiya,
    nightChoghadiya,
    dayHorai,
    nightHorai,
    allHorai,
    activeHorai,
    nextShubhaHorai,
    dayGowri,
    nightGowri,
    activeGowri,
    nallaNeram,
    personalTarabala: {
      taraName: taraNames[taraIdx],
      taraNumber: taraIdx + 1,
      isAuspicious: taraAuspicious,
      chandrabalaHouse: chandraHouse,
      chandrabalaAuspicious: chandraAuspicious,
      isChandrashtama,
      verdict: isChandrashtama
        ? 'Chandrashtama Alert (8th-House Moon): Emotional & pranic tide is inward—postpone high-stakes launches, surgery, or confrontations for 2.25 days.'
        : taraAuspicious && chandraAuspicious
        ? 'Double Siddha Alignment: Both Tarabala & Chandrabala strongly reinforce your natal Moon today.'
        : taraAuspicious || chandraAuspicious
        ? 'Balanced Mixed Tide: Favorable for planned work; anchor key actions inside Abhijit, Nalla Neram, or Guru/Sukra Horai.'
        : 'Reflective Inward Tide: Prioritize research, rest, and preparation rather than high-risk commitments.',
    },
  };
}

export function getRecommendedHoraisForAction(actionId: string): {
  lords: HoraiLordId[];
  rationale: string;
} {
  switch (actionId) {
    case 'BUY_GOLD_WEALTH':
      return {
        lords: ['Venus', 'Jupiter'],
        rationale: 'Sukra & Guru Horai multiply treasury assets, gold luster, and household Lakshmi.',
      };
    case 'LEND_MONEY':
    case 'BORROW_MONEY':
      return {
        lords: ['Jupiter', 'Venus', 'Mercury'],
        rationale: 'Guru, Sukra & Budha Horai protect clean repayment terms and fair financial circulation.',
      };
    case 'REPAY_DEBT':
      return {
        lords: ['Mars', 'Mercury', 'Jupiter'],
        rationale: 'Sevvai (Mars) Horai severs old debt principal (Rina-Mochana), while Budha/Guru clear accounts cleanly.',
      };
    case 'SIGN_CONTRACT':
    case 'LAUNCH_BUSINESS':
      return {
        lords: ['Jupiter', 'Mercury', 'Venus'],
        rationale: 'Guru & Budha Horai sharpen contract clarity and commercial velocity; Sukra builds client goodwill.',
      };
    case 'FILE_LITIGATION':
      return {
        lords: ['Mars', 'Sun'],
        rationale: 'Sevvai & Suriya Horai empower decisive enforcement, audits, and sovereign authority.',
      };
    case 'MARRIAGE_VIVAHA':
    case 'GRIHA_PRAVESHA':
    case 'BUY_VEHICLE':
      return {
        lords: ['Venus', 'Jupiter', 'Moon'],
        rationale: 'Sukra, Guru & Chandra Horai bestow domestic harmony, safe conveyance, and auspicious warmth.',
      };
    case 'START_MEDICINE':
      return {
        lords: ['Moon', 'Jupiter', 'Sun'],
        rationale: 'Chandra (Soma nectar), Guru (protective grace) & Suriya (vitality) accelerate healing.',
      };
    default:
      return {
        lords: ['Jupiter', 'Venus', 'Mercury'],
        rationale: 'Guru, Sukra & Budha Horai are the classical Shubha planetary hours for constructive action.',
      };
  }
}
