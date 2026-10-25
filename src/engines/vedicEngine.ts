import { BirthProfile } from '../types/oceanology';
import { NAKSHATRAS, NatalChartResult, PlanetPosition, ZODIAC_SIGNS, norm360 } from './astronomyEngine';

// Vimshottari Dasha 120-Year Planetary Cycle
export const VIMSHOTTARI_LORDS: { lord: string; years: number; color: string }[] = [
  { lord: 'Ketu', years: 7, color: '#9E5A2B' },
  { lord: 'Venus', years: 20, color: '#A64B6B' },
  { lord: 'Sun', years: 6, color: '#C88A2E' },
  { lord: 'Moon', years: 10, color: '#2A7B88' },
  { lord: 'Mars', years: 7, color: '#B8432E' },
  { lord: 'Rahu', years: 18, color: '#4A648C' },
  { lord: 'Jupiter', years: 16, color: '#B87314' },
  { lord: 'Saturn', years: 19, color: '#395782' },
  { lord: 'Mercury', years: 17, color: '#3B7A57' },
];

export interface DashaPeriod {
  lord: string;
  years: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  progressPercent: number;
  color: string;
  antardashas: {
    lord: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    pratyantars: { lord: string; startDate: string; endDate: string; isCurrent: boolean }[];
  }[];
}

export interface DivisionalChartEntry {
  planetId: string;
  planetName: string;
  symbol: string;
  color: string;
  d1Sign: number;  // Rashi (Root Body)
  d2Sign: number;  // Hora (Wealth)
  d3Sign: number;  // Drekkana (Siblings & Courage)
  d4Sign: number;  // Chaturthamsha (Fortune & Property)
  d7Sign: number;  // Saptamsha (Progeny & Creativity)
  d9Sign: number;  // Navamsha (Marriage, Dharma & Soul Fruit)
  d10Sign: number; // Dashamsha (Career & Karma)
  d12Sign: number; // Dwadashamsha (Parents & Lineage)
  d24Sign: number; // Chaturvimshamsha / Siddhamsha (Higher Learning & Mastery)
  d30Sign: number; // Trimshamsha (Challenges)
  d60Sign: number; // Shashtiamsha (Past Life Karma)
  isVargottama: boolean;
}

export interface KpEntry {
  label: string;
  symbol: string;
  longitudeDMS: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  significatorHouses: number[];
}

export interface KpHoraryResult {
  horaryNumber: number; // 1 to 249
  ascendantSign: string;
  ascendantDMS: string;
  signLord: string;
  starLord: string;
  subLord: string;
  verdict: string;
}

export interface AshtakootaKoota {
  name: string;
  sanskrit: string;
  domain: string;
  maxPoints: number;
  scoredPoints: number;
  personAValue: string;
  personBValue: string;
  summary: string;
}

export interface MatchmakingReport {
  totalPoints: number; // Out of 36
  percentage: number;
  verdict: string;
  kootas: AshtakootaKoota[];
  manglikPersonA: boolean;
  manglikPersonB: boolean;
  manglikStatus: string;
  dashakootaPoruthams: {
    mahendra: { passed: boolean; starCount: number; summaryEn: string; summaryNe: string };
    streeDeergha: { passed: boolean; starCount: number; summaryEn: string; summaryNe: string };
    rajju: {
      zoneA: string;
      zoneB: string;
      hasConflict: boolean;
      summaryEn: string;
      summaryNe: string;
    };
    vedha: { hasVedha: boolean; summaryEn: string; summaryNe: string };
    coupleChemistry: {
      venusMarsHarmonyEn: string;
      venusMarsHarmonyNe: string;
      conflictRepairRuleEn: string;
      conflictRepairRuleNe: string;
    };
  };
}

export interface VedicYoga {
  name: string;
  sanskrit: string;
  category: 'Raja Yoga' | 'Pancha Mahapurusha' | 'Dhana & Wisdom' | 'Lunar Yoga' | 'Solar & Exchange' | 'Dosha / Alert';
  strength: 'High' | 'Moderate';
  sourceText?: string;
  description: string;
}

export interface JaiminiKaraka {
  karakaCode: string;
  karakaName: string;
  sanskrit: string;
  domain: string;
  planetName: string;
  symbol: string;
  degreeInSign: string;
  signName: string;
  navamshaSignName: string;
}

export interface VedicReport {
  moonNakshatra: (typeof NAKSHATRAS)[0];
  moonPada: number;
  janmaRashi: string;
  lagnaRashi: string;
  dashas: DashaPeriod[];
  activeMahadasha: DashaPeriod;
  activeAntardasha: DashaPeriod['antardashas'][0];
  divisionalTable: DivisionalChartEntry[];
  kpPlanets: KpEntry[];
  kpCusps: KpEntry[];
  kpHorary: KpHoraryResult;
  yogas: VedicYoga[];
  charaKarakas: JaiminiKaraka[];
  bhinnashtakavarga: Record<string, number[]>; // 7 planets x 12 signs (0..11)
  sarvashtakavarga: { house: number; signIndex: number; signName: string; bindus: number }[];
}

// Authentic Parashari Bhinnashtakavarga Tables (Brihat Parashara Hora Shastra, Ch. 66 — Exact 337 Bindus)
const BAV_TABLES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
};

function computeDivisionalSign(siderealLon: number, division: number): number {
  const signIdx = Math.floor(norm360(siderealLon) / 30);
  const degInSign = norm360(siderealLon) % 30;
  const isOddSign = signIdx % 2 === 0;

  if (division === 1) return signIdx;
  if (division === 2) {
    if (isOddSign) return degInSign < 15 ? 4 : 3;
    return degInSign < 15 ? 3 : 4;
  }
  if (division === 3) {
    const part = Math.floor(degInSign / 10);
    return (signIdx + part * 4) % 12;
  }
  if (division === 4) {
    const part = Math.floor(degInSign / 7.5);
    return (signIdx + part * 3) % 12;
  }
  if (division === 7) {
    const part = Math.floor(degInSign / (30 / 7));
    return (isOddSign ? signIdx + part : signIdx + 6 + part) % 12;
  }
  if (division === 9) {
    const absolutePada = Math.floor(norm360(siderealLon) / (30 / 9));
    return absolutePada % 12;
  }
  if (division === 10) {
    const part = Math.floor(degInSign / 3);
    return (isOddSign ? signIdx + part : signIdx + 8 + part) % 12;
  }
  if (division === 12) {
    const part = Math.floor(degInSign / 2.5);
    return (signIdx + part) % 12;
  }
  if (division === 24) {
    const part = Math.floor(degInSign / 1.25);
    return (isOddSign ? 4 + part : 3 + part) % 12;
  }
  const part = Math.floor(degInSign / (30 / division));
  return (signIdx * division + part) % 12;
}

function getKpLords(siderealLon: number): { signLord: string; starLord: string; subLord: string; subSubLord: string } {
  const lon = norm360(siderealLon);
  const signIdx = Math.floor(lon / 30);
  const signLord = ZODIAC_SIGNS[signIdx].ruler;

  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(lon / nakSpan) % 27;
  const starLordIdx = nakIdx % 9;
  const starLord = VIMSHOTTARI_LORDS[starLordIdx].lord;

  const offsetInNak = lon - nakIdx * nakSpan;
  let accDeg = 0;
  let subLord = starLord;
  let subLordIdx = starLordIdx;
  let offsetInSub = 0;
  let subSpan = nakSpan;

  for (let i = 0; i < 9; i++) {
    const idx = (starLordIdx + i) % 9;
    const span = (VIMSHOTTARI_LORDS[idx].years / 120) * nakSpan;
    if (offsetInNak <= accDeg + span || i === 8) {
      subLord = VIMSHOTTARI_LORDS[idx].lord;
      subLordIdx = idx;
      offsetInSub = Math.max(0, offsetInNak - accDeg);
      subSpan = span;
      break;
    }
    accDeg += span;
  }

  let accSub = 0;
  let subSubLord = subLord;
  for (let j = 0; j < 9; j++) {
    const idx = (subLordIdx + j) % 9;
    const span = (VIMSHOTTARI_LORDS[idx].years / 120) * subSpan;
    if (offsetInSub <= accSub + span || j === 8) {
      subSubLord = VIMSHOTTARI_LORDS[idx].lord;
      break;
    }
    accSub += span;
  }

  return { signLord, starLord, subLord, subSubLord };
}

export function calculateVedicReport(profile: BirthProfile, chart: NatalChartResult, referenceDate = new Date()): VedicReport {
  const moon = chart.planets.find(p => p.id === 'Moon') || chart.planets[0];
  const nakSpan = 360 / 27;
  const moonSid = moon.siderealLongitude;
  const nakIdx = Math.floor(moonSid / nakSpan) % 27;
  const moonNakshatra = NAKSHATRAS[nakIdx];
  const moonPada = Math.floor((moonSid % nakSpan) / (nakSpan / 4)) + 1;

  // Balance of Vimshottari Dasha at birth
  const fractionRemaining = 1 - (moonSid % nakSpan) / nakSpan;
  const startLordIdx = nakIdx % 9;
  const birthMs = chart.utcDate.getTime();
  const refMs = referenceDate.getTime();
  const msPerYear = 365.2425 * 86400000;

  const dashas: DashaPeriod[] = [];
  let cursorMs = birthMs - (1 - fractionRemaining) * VIMSHOTTARI_LORDS[startLordIdx].years * msPerYear;

  for (let i = 0; i < 9; i++) {
    const mObj = VIMSHOTTARI_LORDS[(startLordIdx + i) % 9];
    const mDurationMs = mObj.years * msPerYear;
    const mStartMs = cursorMs;
    const mEndMs = mStartMs + mDurationMs;
    const isCurrentMaha = refMs >= mStartMs && refMs < mEndMs;
    const progressPercent = isCurrentMaha
      ? Math.min(100, Math.max(0, Math.round(((refMs - mStartMs) / mDurationMs) * 100)))
      : refMs >= mEndMs
      ? 100
      : 0;

    const antardashas: DashaPeriod['antardashas'] = [];
    let aCursorMs = mStartMs;
    for (let j = 0; j < 9; j++) {
      const aObj = VIMSHOTTARI_LORDS[(startLordIdx + i + j) % 9];
      const aDurationMs = ((mObj.years * aObj.years) / 120) * msPerYear;
      const aStartMs = aCursorMs;
      const aEndMs = aStartMs + aDurationMs;
      const isCurrentAntar = refMs >= aStartMs && refMs < aEndMs;

      const pratyantars: DashaPeriod['antardashas'][0]['pratyantars'] = [];
      let pCursorMs = aStartMs;
      for (let k = 0; k < 9; k++) {
        const pObj = VIMSHOTTARI_LORDS[(startLordIdx + i + j + k) % 9];
        const pDurationMs = (pObj.years / 120) * aDurationMs;
        const pStartMs = pCursorMs;
        const pEndMs = pStartMs + pDurationMs;
        pratyantars.push({
          lord: pObj.lord,
          startDate: new Date(pStartMs).toISOString().slice(0, 10),
          endDate: new Date(pEndMs).toISOString().slice(0, 10),
          isCurrent: refMs >= pStartMs && refMs < pEndMs,
        });
        pCursorMs = pEndMs;
      }

      antardashas.push({
        lord: aObj.lord,
        startDate: new Date(aStartMs).toISOString().slice(0, 10),
        endDate: new Date(aEndMs).toISOString().slice(0, 10),
        isCurrent: isCurrentAntar,
        pratyantars,
      });
      aCursorMs = aEndMs;
    }

    dashas.push({
      lord: mObj.lord,
      years: mObj.years,
      startDate: new Date(Math.max(birthMs, mStartMs)).toISOString().slice(0, 10),
      endDate: new Date(mEndMs).toISOString().slice(0, 10),
      isCurrent: isCurrentMaha,
      progressPercent,
      color: mObj.color,
      antardashas,
    });

    cursorMs = mEndMs;
  }

  const activeMahadasha = dashas.find(d => d.isCurrent) || dashas[0];
  const activeAntardasha = activeMahadasha.antardashas.find(a => a.isCurrent) || activeMahadasha.antardashas[0];

  // SiderealAscendant for pure Vedic D1/Varga/Yoga calculations
  const ascSid = ayanamshaSafeSiderealAsc(chart);
  const lagnaSignIdx = Math.floor(ascSid / 30);

  // Divisional Charts Table (Shodashvarga D1..D60)
  const divisionalTable: DivisionalChartEntry[] = [
    {
      planetId: 'Asc',
      planetName: 'Ascendant (Lagna)',
      symbol: 'ASC',
      color: '#2A7B88',
      d1Sign: computeDivisionalSign(ascSid, 1),
      d2Sign: computeDivisionalSign(ascSid, 2),
      d3Sign: computeDivisionalSign(ascSid, 3),
      d4Sign: computeDivisionalSign(ascSid, 4),
      d7Sign: computeDivisionalSign(ascSid, 7),
      d9Sign: computeDivisionalSign(ascSid, 9),
      d10Sign: computeDivisionalSign(ascSid, 10),
      d12Sign: computeDivisionalSign(ascSid, 12),
      d24Sign: computeDivisionalSign(ascSid, 24),
      d30Sign: computeDivisionalSign(ascSid, 30),
      d60Sign: computeDivisionalSign(ascSid, 60),
      isVargottama: computeDivisionalSign(ascSid, 1) === computeDivisionalSign(ascSid, 9),
    },
    ...chart.planets
      .filter(p => !['Uranus', 'Neptune', 'Pluto'].includes(p.id))
      .map(p => {
        const d1 = computeDivisionalSign(p.siderealLongitude, 1);
        const d9 = computeDivisionalSign(p.siderealLongitude, 9);
        return {
          planetId: p.id,
          planetName: p.name,
          symbol: p.symbol,
          color: p.color,
          d1Sign: d1,
          d2Sign: computeDivisionalSign(p.siderealLongitude, 2),
          d3Sign: computeDivisionalSign(p.siderealLongitude, 3),
          d4Sign: computeDivisionalSign(p.siderealLongitude, 4),
          d7Sign: computeDivisionalSign(p.siderealLongitude, 7),
          d9Sign: d9,
          d10Sign: computeDivisionalSign(p.siderealLongitude, 10),
          d12Sign: computeDivisionalSign(p.siderealLongitude, 12),
          d24Sign: computeDivisionalSign(p.siderealLongitude, 24),
          d30Sign: computeDivisionalSign(p.siderealLongitude, 30),
          d60Sign: computeDivisionalSign(p.siderealLongitude, 60),
          isVargottama: d1 === d9,
        };
      }),
  ];

  // KP Planets & Cusps (4-step Sign / Star / Sub / Sub-Sub + true House Lordships)
  const navagraha = chart.planets.filter(p => !['Uranus', 'Neptune', 'Pluto'].includes(p.id));
  const houseSignRulers: Record<string, number[]> = {};
  for (let h = 1; h <= 12; h++) {
    const cSign = chart.houses[h - 1].signIndex;
    const r = ZODIAC_SIGNS[cSign].ruler;
    if (!houseSignRulers[r]) houseSignRulers[r] = [];
    houseSignRulers[r].push(h);
  }

  const kpPlanets: KpEntry[] = navagraha.map(p => {
    const lords = getKpLords(p.siderealLongitude);
    const starPlanet = navagraha.find(pl => pl.id === lords.starLord || pl.name.includes(lords.starLord));
    const sigSet = new Set<number>([
      ...(starPlanet ? [starPlanet.house, ...(houseSignRulers[starPlanet.id] || [])] : []),
      p.house,
      ...(houseSignRulers[p.id] || []),
    ]);
    return {
      label: p.name,
      symbol: p.symbol,
      longitudeDMS: `${ZODIAC_SIGNS[Math.floor(p.siderealLongitude / 30)].symbol} ${p.formattedDMS}`,
      ...lords,
      significatorHouses: Array.from(sigSet).sort((a, b) => a - b),
    };
  });

  const kpCusps: KpEntry[] = chart.houses.map(h => {
    const cSid = chart.ayanamshaMode === 'TROPICAL' ? norm360(h.longitude - 23.857) : h.longitude;
    const lords = getKpLords(cSid);
    return {
      label: `Cusp ${h.house}`,
      symbol: `H${h.house}`,
      longitudeDMS: `${h.signSymbol} ${h.formattedDMS}`,
      ...lords,
      significatorHouses: [h.house],
    };
  });

  const kphn = Math.max(1, Math.min(249, profile.kpHoraryNumber || 108));
  const horaryLon = ((kphn - 1) / 249) * 360;
  const hSignIdx = Math.floor(horaryLon / 30);
  const hLords = getKpLords(horaryLon);
  const beneficSubs = ['Jupiter', 'Venus', 'Mercury', 'Moon', 'Sun'];
  const kpHorary: KpHoraryResult = {
    horaryNumber: kphn,
    ascendantSign: ZODIAC_SIGNS[hSignIdx].name,
    ascendantDMS: `${ZODIAC_SIGNS[hSignIdx].symbol} ${(horaryLon % 30).toFixed(2)}°`,
    signLord: hLords.signLord,
    starLord: hLords.starLord,
    subLord: hLords.subLord,
    verdict: beneficSubs.includes(hLords.subLord)
      ? `Favorable Fruition: Ascendant Sub-Lord ${hLords.subLord} (in ${hLords.starLord}'s star) signifies constructive momentum and fulfillment of the querent's intention.`
      : `Requires Patience & Restructuring: Sub-Lord ${hLords.subLord} indicates initial structural delays followed by disciplined breakthrough.`,
  };

  // Jaimini 7 Chara Karakas (Sorted descending by sidereal degree inside sign)
  const sevenPlanets = chart.planets.filter(p =>
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.id)
  );
  const sortedByDeg = [...sevenPlanets].sort((a, b) => (b.siderealLongitude % 30) - (a.siderealLongitude % 30));
  const karakaDefs = [
    { code: 'AK', name: 'Atmakaraka', sanskrit: 'आत्मकारक', domain: 'Soul King, Primary Evolutionary Axis &Karakamsha' },
    { code: 'AmK', name: 'Amatyakaraka', sanskrit: 'अमात्यकारक', domain: 'Prime Minister, Vocation, Counsel & Career Path' },
    { code: 'BK', name: 'Bhratrikaraka', sanskrit: 'भ्रातृकारक', domain: 'Guru/Preceptor, Siblings, Courage & Initiative' },
    { code: 'MK', name: 'Matrikaraka', sanskrit: 'मातृकारक', domain: 'Mother, Homeland, Emotional Sanctuary & Nourishment' },
    { code: 'PK', name: 'Putrakaraka', sanskrit: 'पुत्रकारक', domain: 'Creative Intelligence, Progeny, Merit & Authorship' },
    { code: 'GK', name: 'Jnatikaraka', sanskrit: 'ज्ञातिकारक', domain: 'Competitors, Acute Challenges, Healing & Kin' },
    { code: 'DK', name: 'Darakaraka', sanskrit: 'दाराकारक', domain: 'Sacred Spouse, Partnerships & Mirror of Desire' },
  ];
  const charaKarakas: JaiminiKaraka[] = sortedByDeg.map((p, idx) => {
    const sidSign = Math.floor(p.siderealLongitude / 30);
    const d9Sign = computeDivisionalSign(p.siderealLongitude, 9);
    return {
      karakaCode: karakaDefs[idx].code,
      karakaName: karakaDefs[idx].name,
      sanskrit: karakaDefs[idx].sanskrit,
      domain: karakaDefs[idx].domain,
      planetName: p.name,
      symbol: p.symbol,
      degreeInSign: `${(p.siderealLongitude % 30).toFixed(2)}°`,
      signName: `${ZODIAC_SIGNS[sidSign].sanskrit} (${ZODIAC_SIGNS[sidSign].name})`,
      navamshaSignName: `${ZODIAC_SIGNS[d9Sign].sanskrit} (${ZODIAC_SIGNS[d9Sign].name})`,
    };
  });

  // Comprehensive Classical Yoga Detection (22+ Yogas across BPHS, Phaladeepika, Brihat Jataka & 300 Important Combinations)
  const yogas: VedicYoga[] = [];
  const getSidSign = (id: string) => Math.floor((chart.planets.find(p => p.id === id)?.siderealLongitude ?? 0) / 30);
  const getSidHouse = (id: string) => ((getSidSign(id) - lagnaSignIdx + 12) % 12) + 1;
  const houseFrom = (fromSign: number, toSign: number) => ((toSign - fromSign + 12) % 12) + 1;

  const sunS = getSidSign('Sun');
  const moonS = getSidSign('Moon');
  const marsS = getSidSign('Mars');
  const mercS = getSidSign('Mercury');
  const jupS = getSidSign('Jupiter');
  const venS = getSidSign('Venus');
  const satS = getSidSign('Saturn');
  const rahuS = getSidSign('Rahu');
  const ketuS = getSidSign('Ketu');

  // 1. Budhaditya Nipuna Yoga
  if (sunS === mercS) {
    const sep = Math.abs(
      (chart.planets.find(p => p.id === 'Sun')!.siderealLongitude -
        chart.planets.find(p => p.id === 'Mercury')!.siderealLongitude +
        540) %
        360 -
        180
    );
    yogas.push({
      name: 'Budhaditya (Nipuna) Yoga',
      sanskrit: 'बुधादित्य निपुण योग',
      category: 'Dhana & Wisdom',
      strength: sep > 4 ? 'High' : 'Moderate',
      sourceText: 'Brihat Jataka Ch. 14',
      description: 'Sun and Mercury unite in the same Rashi, bestowing analytical acuity, mathematical/scholarly skill, and respected speech.',
    });
  }

  // 2. Gajakesari Yoga
  const jupFromMoon = houseFrom(moonS, jupS);
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    yogas.push({
      name: 'Gajakesari Yoga',
      sanskrit: 'गजकेसरी योग',
      category: 'Raja Yoga',
      strength: 'High',
      sourceText: 'BPHS & Phaladeepika Ch. 6',
      description: 'Brihaspati occupies a Kendra from Chandra—conferring lion-like dignity, lasting public esteem, eloquence, and protective grace.',
    });
  }

  // 3. Pancha Mahapurusha Yogas (from Lagna or Chandra Kendra in Own/Exalted Rashi)
  const mahapurushaSpecs: { id: string; s: number; ownExalt: number[]; name: string; skt: string; desc: string }[] = [
    { id: 'Jupiter', s: jupS, ownExalt: [3, 8, 11], name: 'Hamsa Mahapurusha Yoga', skt: 'हंस महापुरुष योग', desc: 'Jupiter in Own/Exalted sign in Kendra bestows sacred wisdom, ethical authority, and swan-like discernment.' },
    { id: 'Venus', s: venS, ownExalt: [1, 6, 11], name: 'Malavya Mahapurusha Yoga', skt: 'मालव्य महापुरुष योग', desc: 'Venus in Own/Exalted sign in Kendra bestows aesthetic genius, magnetic grace, vehicles, and marital prosperity.' },
    { id: 'Mars', s: marsS, ownExalt: [0, 7, 9], name: 'Ruchaka Mahapurusha Yoga', skt: 'रुचक महापुरुष योग', desc: 'Mars in Own/Exalted sign in Kendra bestows fearless executive command, physical stamina, and victory over rivals.' },
    { id: 'Mercury', s: mercS, ownExalt: [2, 5], name: 'Bhadra Mahapurusha Yoga', skt: 'भद्र महापुरुष योग', desc: 'Mercury in Own/Exalted sign in Kendra bestows polymathic intellect, eloquence, and commercial mastery.' },
    { id: 'Saturn', s: satS, ownExalt: [6, 9, 10], name: 'Shasha Mahapurusha Yoga', skt: 'शश महापुरुष योग', desc: 'Saturn in Own/Exalted sign in Kendra bestows institutional authority, organizational endurance, and stewardship.' },
  ];
  for (const mp of mahapurushaSpecs) {
    const inLagnaKendra = [1, 4, 7, 10].includes(houseFrom(lagnaSignIdx, mp.s));
    const inMoonKendra = [1, 4, 7, 10].includes(houseFrom(moonS, mp.s));
    if (mp.ownExalt.includes(mp.s) && (inLagnaKendra || inMoonKendra)) {
      yogas.push({
        name: mp.name,
        sanskrit: mp.skt,
        category: 'Pancha Mahapurusha',
        strength: inLagnaKendra ? 'High' : 'Moderate',
        sourceText: 'Phaladeepika Ch. 6 (Verses 1–4)',
        description: `${mp.desc} (${inLagnaKendra ? 'Anchored from Lagna Kendra' : 'Anchored from Chandra Kendra'}).`,
      });
    }
  }

  // 4. Lunar Flanking Yogas: Sunapha, Anapha, Durudhara, Kemadruma (& Kemadruma Bhanga)
  const fiveNonLum = [
    { name: 'Mars', s: marsS },
    { name: 'Mercury', s: mercS },
    { name: 'Jupiter', s: jupS },
    { name: 'Venus', s: venS },
    { name: 'Saturn', s: satS },
  ];
  const in2ndFromMoon = fiveNonLum.filter(p => houseFrom(moonS, p.s) === 2);
  const in12thFromMoon = fiveNonLum.filter(p => houseFrom(moonS, p.s) === 12);

  if (in2ndFromMoon.length > 0 && in12thFromMoon.length > 0) {
    yogas.push({
      name: 'Durudhara Yoga',
      sanskrit: 'दुरुधरा योग',
      category: 'Lunar Yoga',
      strength: 'High',
      sourceText: 'Brihat Jataka Ch. 13',
      description: `Moon is flanked on both sides (${in12thFromMoon.map(p => p.name).join(', ')} in 12th; ${in2ndFromMoon.map(p => p.name).join(', ')} in 2nd)—granting balanced wealth, vehicles, and emotional resilience.`,
    });
  } else if (in2ndFromMoon.length > 0) {
    yogas.push({
      name: 'Sunapha Yoga',
      sanskrit: 'सुनफा योग',
      category: 'Lunar Yoga',
      strength: 'High',
      sourceText: 'Brihat Jataka Ch. 13',
      description: `${in2ndFromMoon.map(p => p.name).join(' & ')} in the 2nd sign from Moon confers self-made wealth, intelligence, and earned reputation.`,
    });
  } else if (in12thFromMoon.length > 0) {
    yogas.push({
      name: 'Anapha Yoga',
      sanskrit: 'अनफा योग',
      category: 'Lunar Yoga',
      strength: 'High',
      sourceText: 'Brihat Jataka Ch. 13',
      description: `${in12thFromMoon.map(p => p.name).join(' & ')} in the 12th sign from Moon bestows dignified poise, sensory refinement, and spiritual depth.`,
    });
  } else {
    const anyInKendraFromLagnaOrMoon = fiveNonLum.some(
      p => [1, 4, 7, 10].includes(houseFrom(lagnaSignIdx, p.s)) || [1, 4, 7, 10].includes(houseFrom(moonS, p.s))
    );
    if (anyInKendraFromLagnaOrMoon) {
      yogas.push({
        name: 'Kemadruma Bhanga (Kalpadruma Cancellation)',
        sanskrit: 'केमद्रुम भङ्ग राजयोग',
        category: 'Lunar Yoga',
        strength: 'Moderate',
        sourceText: 'Phaladeepika Ch. 6',
        description: 'Though 2nd and 12th from Moon are unoccupied, planets in Kendra cancel isolation—forging self-reliant mastery after early independence.',
      });
    } else {
      yogas.push({
        name: 'Kemadruma Alert',
        sanskrit: 'केमद्रुम योग',
        category: 'Dosha / Alert',
        strength: 'Moderate',
        sourceText: 'Brihat Jataka Ch. 13',
        description: 'Unflanked Moon calls for conscious emotional community, steady cash reserves, and Chandra-strengthening mindfulness.',
      });
    }
  }

  // 5. Solar Flanking Yogas: Vesi, Vasi, Ubhayachari
  const in2ndFromSun = fiveNonLum.filter(p => houseFrom(sunS, p.s) === 2);
  const in12thFromSun = fiveNonLum.filter(p => houseFrom(sunS, p.s) === 12);
  if (in2ndFromSun.length > 0 && in12thFromSun.length > 0) {
    yogas.push({
      name: 'Ubhayachari Yoga',
      sanskrit: 'उभयचारी योग',
      category: 'Solar & Exchange',
      strength: 'High',
      sourceText: 'BPHS Ch. 38',
      description: 'Planets flank Surya in both the 2nd and 12th signs—conferring royal composure, broad shoulders of responsibility, and executive support.',
    });
  } else if (in2ndFromSun.length > 0) {
    yogas.push({
      name: 'Vesi Yoga',
      sanskrit: 'वेशी योग',
      category: 'Solar & Exchange',
      strength: 'Moderate',
      sourceText: 'BPHS Ch. 38',
      description: `${in2ndFromSun.map(p => p.name).join(', ')} in 2nd from Sun grants truthful speech, balanced judgment, and steady livelihood.`,
    });
  } else if (in12thFromSun.length > 0) {
    yogas.push({
      name: 'Vasi Yoga',
      sanskrit: 'वाशी योग',
      category: 'Solar & Exchange',
      strength: 'Moderate',
      sourceText: 'BPHS Ch. 38',
      description: `${in12thFromSun.map(p => p.name).join(', ')} in 12th from Sun confers specialized memory, contemplation, and behind-the-scenes influence.`,
    });
  }

  // 6. Chandra-Adhi & Lagna-Adhi Yoga (Benefics Merc, Jup, Ven in 6, 7, 8)
  const benefics = [mercS, jupS, venS];
  const adhiFromMoon = benefics.filter(s => [6, 7, 8].includes(houseFrom(moonS, s)));
  if (adhiFromMoon.length >= 2) {
    yogas.push({
      name: 'Chandra Adhi Yoga',
      sanskrit: 'चन्द्र अधियोग',
      category: 'Raja Yoga',
      strength: adhiFromMoon.length === 3 ? 'High' : 'Moderate',
      sourceText: 'Brihat Jataka & Phaladeepika',
      description: 'Natural benefics arrayed across the 6th, 7th, and 8th from Moon bestow ministerial leadership, longevity, and triumph over opposition.',
    });
  }

  // 7. Amala (Spotless Fame) Yoga — Natural benefic in 10th from Lagna or Moon
  const beneficsIn10 = [
    ...(houseFrom(lagnaSignIdx, jupS) === 10 || houseFrom(moonS, jupS) === 10 ? ['Jupiter'] : []),
    ...(houseFrom(lagnaSignIdx, venS) === 10 || houseFrom(moonS, venS) === 10 ? ['Venus'] : []),
    ...(houseFrom(lagnaSignIdx, mercS) === 10 || houseFrom(moonS, mercS) === 10 ? ['Mercury'] : []),
  ];
  if (beneficsIn10.length > 0) {
    yogas.push({
      name: 'Amala Kirti Yoga',
      sanskrit: 'अमला कीर्ति योग',
      category: 'Dhana & Wisdom',
      strength: 'High',
      sourceText: 'Phaladeepika Ch. 6, Verse 12',
      description: `${beneficsIn10.join(' / ')} in the 10th zenith from Lagna/Moon confers unblemished ethical reputation and charitable legacy.`,
    });
  }

  // 8. Chandra-Mangala Dhana Yoga
  if (moonS === marsS || houseFrom(moonS, marsS) === 7) {
    yogas.push({
      name: 'Chandra-Mangala Yoga',
      sanskrit: 'चन्द्र-मंगल धन योग',
      category: 'Dhana & Wisdom',
      strength: 'High',
      sourceText: '300 Important Combinations',
      description: 'Moon-Mars conjunction or mutual 7th gaze generates brisk financial enterprise, real-estate acumen, and decisive courage.',
    });
  }

  // 9. House Lord Map for Dharma-Karmadhipati, Viparita Raja Yogas & Parivartana
  const lordOfHouse = (h: number) => ZODIAC_SIGNS[(lagnaSignIdx + h - 1) % 12].ruler;
  const houseOfPlanetName = (rName: string) => getSidHouse(rName);

  const lord9 = lordOfHouse(9);
  const lord10 = lordOfHouse(10);
  if (lord9 === lord10 || getSidSign(lord9) === getSidSign(lord10)) {
    yogas.push({
      name: 'Dharma-Karmadhipati Raja Yoga',
      sanskrit: 'धर्म-कर्माधिपति राजयोग',
      category: 'Raja Yoga',
      strength: 'High',
      sourceText: 'BPHS Ch. 40',
      description: `Lords of the 9th Bhava (${lord9}) and 10th Bhava (${lord10}) unite—aligning highest life purpose directly with public career authority.`,
    });
  }

  // Viparita Raja Yogas: Harsha (6L in 6/8/12), Sarala (8L in 6/8/12), Vimala (12L in 6/8/12)
  const lord6 = lordOfHouse(6);
  const lord8 = lordOfHouse(8);
  const lord12 = lordOfHouse(12);
  if ([6, 8, 12].includes(houseOfPlanetName(lord6))) {
    yogas.push({
      name: 'Harsha Viparita Raja Yoga',
      sanskrit: 'हर्ष विपरीत राजयोग',
      category: 'Raja Yoga',
      strength: 'High',
      sourceText: 'Phaladeepika Ch. 6, Verse 63',
      description: `6th lord (${lord6}) placed in a Dusthana (${houseOfPlanetName(lord6)}th) neutralizes enemies and turns crisis into resilience and acclaim.`,
    });
  }
  if ([6, 8, 12].includes(houseOfPlanetName(lord8))) {
    yogas.push({
      name: 'Sarala Viparita Raja Yoga',
      sanskrit: 'सरल विपरीत राजयोग',
      category: 'Raja Yoga',
      strength: 'High',
      sourceText: 'Phaladeepika Ch. 6, Verse 65',
      description: `8th lord (${lord8}) in the ${houseOfPlanetName(lord8)}th Bhava bestows fearlessness in upheaval, scholarly longevity, and sudden turnarounds.`,
    });
  }
  if ([6, 8, 12].includes(houseOfPlanetName(lord12))) {
    yogas.push({
      name: 'Vimala Viparita Raja Yoga',
      sanskrit: 'विमल विपरीत राजयोग',
      category: 'Raja Yoga',
      strength: 'Moderate',
      sourceText: 'Phaladeepika Ch. 6, Verse 69',
      description: `12th lord (${lord12}) in the ${houseOfPlanetName(lord12)}th Bhava protects savings, fosters independent integrity, and deepens spiritual liberation.`,
    });
  }

  // 10. Parivartana (Mutual Sign Exchange) Check
  const planetSignPairs = sevenPlanets.map(p => ({ id: p.id, sign: getSidSign(p.id), rulerOfOccupied: ZODIAC_SIGNS[getSidSign(p.id)].ruler }));
  for (let i = 0; i < planetSignPairs.length; i++) {
    for (let j = i + 1; j < planetSignPairs.length; j++) {
      const a = planetSignPairs[i];
      const b = planetSignPairs[j];
      if (a.rulerOfOccupied === b.id && b.rulerOfOccupied === a.id && a.sign !== b.sign) {
        const hA = ((a.sign - lagnaSignIdx + 12) % 12) + 1;
        const hB = ((b.sign - lagnaSignIdx + 12) % 12) + 1;
        const isMaha = ![6, 8, 12].includes(hA) && ![6, 8, 12].includes(hB);
        yogas.push({
          name: isMaha ? 'Maha Parivartana Yoga' : 'Parivartana Exchange Yoga',
          sanskrit: 'परिवर्तन योग',
          category: 'Solar & Exchange',
          strength: isMaha ? 'High' : 'Moderate',
          sourceText: 'Phaladeepika Ch. 6, Verse 32',
          description: `${a.id} and ${b.id} exchange own signs across Bhavas ${hA} and ${hB}—creating a powerful lifelong circuit between both domains.`,
        });
      }
    }
  }

  // 11. Neecha Bhanga Raja Yoga (Debilitated planet cancelled by Kendra placement of dispositor or exaltation lord)
  const debilMap: Record<string, { debSign: number; disp: string; exaltLord: string }> = {
    Sun: { debSign: 6, disp: 'Venus', exaltLord: 'Saturn' },
    Moon: { debSign: 7, disp: 'Mars', exaltLord: 'Mars' }, // Moon has no planet exalted in Scorpio, dispositor Mars rules
    Mars: { debSign: 3, disp: 'Moon', exaltLord: 'Jupiter' },
    Mercury: { debSign: 11, disp: 'Jupiter', exaltLord: 'Venus' },
    Jupiter: { debSign: 9, disp: 'Saturn', exaltLord: 'Mars' },
    Venus: { debSign: 5, disp: 'Mercury', exaltLord: 'Mercury' },
    Saturn: { debSign: 0, disp: 'Mars', exaltLord: 'Sun' },
  };
  for (const [pId, rule] of Object.entries(debilMap)) {
    const pSign = getSidSign(pId);
    if (pSign === rule.debSign) {
      const dispSign = getSidSign(rule.disp);
      const exSign = getSidSign(rule.exaltLord);
      const cancelled =
        [1, 4, 7, 10].includes(houseFrom(lagnaSignIdx, dispSign)) ||
        [1, 4, 7, 10].includes(houseFrom(moonS, dispSign)) ||
        [1, 4, 7, 10].includes(houseFrom(lagnaSignIdx, exSign)) ||
        [1, 4, 7, 10].includes(houseFrom(moonS, exSign));
      if (cancelled) {
        yogas.push({
          name: `Neecha Bhanga Raja Yoga (${pId})`,
          sanskrit: 'नीचभङ्ग राजयोग',
          category: 'Raja Yoga',
          strength: 'High',
          sourceText: 'Phaladeepika Ch. 7, Verses 26–30',
          description: `${pId}’s debilitation is alchemically cancelled by Kendra support—turning early-life humility or adversity into extraordinary mature mastery.`,
        });
      }
    }
  }

  // 12. Saraswati Yoga (Mercury, Venus, Jupiter in Kendras/Trikonas/2nd)
  const goodSaraswatiHouses = [1, 2, 4, 5, 7, 9, 10];
  if (
    goodSaraswatiHouses.includes(getSidHouse('Jupiter')) &&
    goodSaraswatiHouses.includes(getSidHouse('Venus')) &&
    goodSaraswatiHouses.includes(getSidHouse('Mercury'))
  ) {
    yogas.push({
      name: 'Saraswati Yoga',
      sanskrit: 'सरस्वती योग',
      category: 'Dhana & Wisdom',
      strength: 'High',
      sourceText: 'Phaladeepika Ch. 6, Verse 24',
      description: 'Jupiter, Venus, and Mercury all occupy auspicious Kendra/Trikona/2nd Bhavas—bestowing poetic, scientific, and artistic brilliance.',
    });
  }

  // 13. Kala Sarpa / Kala Amrita Check
  const rahuLon = chart.planets.find(p => p.id === 'Rahu')!.siderealLongitude;
  const ketuLon = chart.planets.find(p => p.id === 'Ketu')!.siderealLongitude;
  const allInArcA = sevenPlanets.every(p => norm360(p.siderealLongitude - rahuLon) < 180);
  const allInArcB = sevenPlanets.every(p => norm360(p.siderealLongitude - ketuLon) < 180);
  if (allInArcA || allInArcB) {
    yogas.push({
      name: allInArcA ? 'Kala Amrita Nodal Axis' : 'Kala Sarpa Nodal Axis',
      sanskrit: 'कालसर्प / कालामृत योग',
      category: 'Dosha / Alert',
      strength: 'High',
      sourceText: 'Classical Nodal Tradition',
      description: 'All seven visible Grahas cluster within one hemisphere of the Rahu–Ketu axis—creating a high-destiny, catalytic life trajectory requiring spiritual grounding.',
    });
  }

  // Authentic Parashari Bhinnashtakavarga & Sarvashtakavarga (Exact 337 Total Bindus!)
  const refSignMap: Record<string, number> = {
    Sun: sunS,
    Moon: moonS,
    Mars: marsS,
    Mercury: mercS,
    Jupiter: jupS,
    Venus: venS,
    Saturn: satS,
    Lagna: lagnaSignIdx,
  };

  const bhinnashtakavarga: Record<string, number[]> = {};
  const savBySign = new Array(12).fill(0);

  for (const [planetKey, contributorRules] of Object.entries(BAV_TABLES)) {
    const row = new Array(12).fill(0);
    for (const [contributor, offsets] of Object.entries(contributorRules)) {
      const baseSign = refSignMap[contributor];
      for (const offset1Based of offsets) {
        const targetSign = (baseSign + offset1Based - 1) % 12;
        row[targetSign] += 1;
        savBySign[targetSign] += 1;
      }
    }
    bhinnashtakavarga[planetKey] = row;
  }

  const sarvashtakavarga = Array.from({ length: 12 }, (_, idx) => {
    const signIndex = (lagnaSignIdx + idx) % 12;
    return {
      house: idx + 1,
      signIndex,
      signName: ZODIAC_SIGNS[signIndex].name,
      bindus: savBySign[signIndex],
    };
  });

  return {
    moonNakshatra,
    moonPada,
    janmaRashi: `${ZODIAC_SIGNS[Math.floor(moonSid / 30)].sanskrit} (${ZODIAC_SIGNS[Math.floor(moonSid / 30)].name})`,
    lagnaRashi: `${ZODIAC_SIGNS[lagnaSignIdx].sanskrit} (${ZODIAC_SIGNS[lagnaSignIdx].name})`,
    dashas,
    activeMahadasha,
    activeAntardasha,
    divisionalTable,
    kpPlanets,
    kpCusps,
    kpHorary,
    yogas,
    charaKarakas,
    bhinnashtakavarga,
    sarvashtakavarga,
  };
}

function ayanamshaSafeSiderealAsc(chart: NatalChartResult): number {
  if (chart.ayanamshaMode !== 'TROPICAL') return chart.ascendant.longitude;
  const sun = chart.planets.find(p => p.id === 'Sun');
  const approxLahiri = sun ? norm360(sun.tropicalLongitude - sun.siderealLongitude) : 23.857;
  return norm360(chart.ascendant.longitude - approxLahiri);
}

// Ashtakoota 36-Guna Matchmaking Engine
export function calculateAshtakootaMatch(chartA: NatalChartResult, chartB: NatalChartResult): MatchmakingReport {
  const moonA = chartA.planets.find(p => p.id === 'Moon')!;
  const moonB = chartB.planets.find(p => p.id === 'Moon')!;
  const marsA = chartA.planets.find(p => p.id === 'Mars')!;
  const marsB = chartB.planets.find(p => p.id === 'Mars')!;

  const nakA = NAKSHATRAS[moonA.nakshatraIndex];
  const nakB = NAKSHATRAS[moonB.nakshatraIndex];
  const signA = ZODIAC_SIGNS[Math.floor(moonA.siderealLongitude / 30)];
  const signB = ZODIAC_SIGNS[Math.floor(moonB.siderealLongitude / 30)];

  // 1. Varna (1 pt)
  const varnaOrder: Record<string, number> = { Water: 4, Fire: 3, Earth: 2, Air: 1 };
  const varnaNames: Record<string, string> = { Water: 'Brahmin', Fire: 'Kshatriya', Earth: 'Vaishya', Air: 'Shudra' };
  const varnaScore = varnaOrder[signA.element] >= varnaOrder[signB.element] ? 1 : 0.5;

  // 2. Vashya (2 pts)
  const vashyaScore = signA.index === signB.index ? 2 : signA.modality === signB.modality ? 1.5 : 1;

  // 3. Tara / Dina (3 pts)
  const nakDistA = ((moonB.nakshatraIndex - moonA.nakshatraIndex + 27) % 27) % 9;
  const nakDistB = ((moonA.nakshatraIndex - moonB.nakshatraIndex + 27) % 27) % 9;
  const goodA = [0, 1, 3, 5, 7, 8].includes(nakDistA);
  const goodB = [0, 1, 3, 5, 7, 8].includes(nakDistB);
  const taraScore = goodA && goodB ? 3 : goodA || goodB ? 1.5 : 0;

  // 4. Yoni (4 pts)
  const enemyYonis: [string, string][] = [
    ['Cow', 'Tiger'], ['Elephant', 'Lion'], ['Horse', 'Buffalo'],
    ['Dog', 'Deer'], ['Serpent', 'Mongoose'], ['Monkey', 'Sheep'], ['Cat', 'Rat'],
  ];
  const isEnemyYoni = enemyYonis.some(
    ([x, y]) => (nakA.yoni === x && nakB.yoni === y) || (nakA.yoni === y && nakB.yoni === x)
  );
  const yoniScore = nakA.yoni === nakB.yoni ? 4 : isEnemyYoni ? 1 : 3;

  // 5. Graha Maitri (5 pts)
  const friends: Record<string, string[]> = {
    Sun: ['Moon', 'Mars', 'Jupiter'],
    Moon: ['Sun', 'Mercury', 'Jupiter'],
    Mars: ['Sun', 'Moon', 'Jupiter'],
    Mercury: ['Sun', 'Venus', 'Saturn'],
    Jupiter: ['Sun', 'Moon', 'Mars'],
    Venus: ['Mercury', 'Saturn'],
    Saturn: ['Mercury', 'Venus'],
  };
  const rA = signA.ruler;
  const rB = signB.ruler;
  const maitriScore =
    rA === rB
      ? 5
      : friends[rA]?.includes(rB) && friends[rB]?.includes(rA)
      ? 5
      : friends[rA]?.includes(rB) || friends[rB]?.includes(rA)
      ? 4
      : 2;

  // 6. Gana (6 pts)
  const ganaScore =
    nakA.gana === nakB.gana
      ? 6
      : (nakA.gana === 'Deva' && nakB.gana === 'Manushya') || (nakB.gana === 'Deva' && nakA.gana === 'Manushya')
      ? 5
      : 1;

  // 7. Bhakoot (7 pts)
  const signDiff = ((signB.index - signA.index + 12) % 12) + 1;
  const badBhakoot = [2, 12, 6, 8].includes(signDiff);
  const bhakootScore = badBhakoot ? (rA === rB ? 7 : 0) : 7;

  // 8. Nadi (8 pts)
  const sameNadi = nakA.nadi === nakB.nadi;
  const nadiParihara = sameNadi && (signA.index !== signB.index || moonA.nakshatraIndex !== moonB.nakshatraIndex);
  const nadiScore = !sameNadi ? 8 : nadiParihara ? 4 : 0;

  const kootas: AshtakootaKoota[] = [
    { name: 'Varna', sanskrit: 'वर्ण', domain: 'Dharmic & Intellectual Ethos', maxPoints: 1, scoredPoints: varnaScore, personAValue: varnaNames[signA.element], personBValue: varnaNames[signB.element], summary: 'Mutual respect in work ethic and spiritual temperament.' },
    { name: 'Vashya', sanskrit: 'वश्य', domain: 'Magnetic Affinity & Support', maxPoints: 2, scoredPoints: vashyaScore, personAValue: signA.sanskrit, personBValue: signB.sanskrit, summary: 'Natural responsiveness and cooperative rhythm.' },
    { name: 'Tara', sanskrit: 'तारा', domain: 'Nakshatra Destiny & Well-Being', maxPoints: 3, scoredPoints: taraScore, personAValue: nakA.name, personBValue: nakB.name, summary: taraScore >= 1.5 ? 'Supportive Sampat/Kshema/Mitra star resonance.' : 'Calls for conscious patience during stressful transits.' },
    { name: 'Yoni', sanskrit: 'योनि', domain: 'Somatic & Intimate Chemistry', maxPoints: 4, scoredPoints: yoniScore, personAValue: nakA.yoni, personBValue: nakB.yoni, summary: yoniScore >= 3 ? 'Warm biological and instinctive comfort.' : 'Contrasting instincts requiring tender communication.' },
    { name: 'Graha Maitri', sanskrit: 'ग्रह मैत्री', domain: 'Psychological & Planetary Amity', maxPoints: 5, scoredPoints: maitriScore, personAValue: rA, personBValue: rB, summary: `Moon sign lords (${rA} & ${rB}) govern mental rapport.` },
    { name: 'Gana', sanskrit: 'गण', domain: 'Lifestyle & Temperament', maxPoints: 6, scoredPoints: ganaScore, personAValue: nakA.gana, personBValue: nakB.gana, summary: `${nakA.gana} and ${nakB.gana} archetypes shape daily household atmosphere.` },
    { name: 'Bhakoot', sanskrit: 'भकूट', domain: 'Prosperity & Emotional Growth', maxPoints: 7, scoredPoints: bhakootScore, personAValue: signA.name, personBValue: signB.name, summary: bhakootScore === 7 ? 'Harmonious Rashi geometry supporting shared abundance.' : 'Shadashtaka/Dwirdwadasha growth axis—strengthened via shared goals.' },
    { name: 'Nadi', sanskrit: 'नाड़ी', domain: 'Pranic Vitality & Constitutional Health', maxPoints: 8, scoredPoints: nadiScore, personAValue: `${nakA.nadi} Nadi`, personBValue: `${nakB.nadi} Nadi`, summary: !sameNadi ? 'Optimal Nadi polarity (8/8) ensuring vibrant pranic balance.' : 'Same Nadi tempered by Rashi/Nakshatra Parihara.' },
  ];

  const totalPoints = Math.round(kootas.reduce((acc, k) => acc + k.scoredPoints, 0) * 10) / 10;
  const percentage = Math.round((totalPoints / 36) * 100);

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglikA = manglikHouses.includes(marsA.house);
  const manglikB = manglikHouses.includes(marsB.house);

  let manglikStatus = 'Balanced Kuja (Clear of Manglik Dosha)';
  if (manglikA && manglikB) manglikStatus = 'Mutual Kuja Cancellation (Sama-Manglik Parihara — Balanced Drive)';
  else if (manglikA || manglikB) manglikStatus = 'Single-Chart Kuja Presence (Check Jupiter/Venus Aspect & Age-28 Maturity)';

  // Authentic South-Indian & Muhurta Chintamani Dashakoota (10-Porutham) Checks
  const starCountAB = ((moonB.nakshatraIndex - moonA.nakshatraIndex + 27) % 27) + 1;
  const mahendraPassed = [4, 7, 10, 13, 16, 19, 22, 25].includes(starCountAB);
  const streeDeerghaPassed = starCountAB > 13;

  // Exact 5-Zone Aroha/Avaroha Rajju Koota Mapping (0..26)
  const getRajjuZone = (idx: number): 'Pada (Foot)' | 'Kati (Waist)' | 'Nabhi (Navel)' | 'Kantha (Neck)' | 'Siro (Crown)' => {
    const posInTriad = idx % 9; // 0..8
    if (posInTriad === 0 || posInTriad === 8) return 'Pada (Foot)';
    if (posInTriad === 1 || posInTriad === 7) return 'Kati (Waist)';
    if (posInTriad === 2 || posInTriad === 6) return 'Nabhi (Navel)';
    if (posInTriad === 3 || posInTriad === 5) return 'Kantha (Neck)';
    return 'Siro (Crown)';
  };
  const rajjuZoneA = getRajjuZone(moonA.nakshatraIndex);
  const rajjuZoneB = getRajjuZone(moonB.nakshatraIndex);
  const rajjuConflict = rajjuZoneA === rajjuZoneB && moonA.nakshatraIndex !== moonB.nakshatraIndex;

  // Exact 13 Classical Nakshatra Vedha (Mutual Obstruction) Pairs + Kuja Triad (4, 13, 22)
  const vedhaPairs: [number, number][] = [
    [0, 17],  // Ashwini - Jyeshtha
    [1, 16],  // Bharani - Anuradha
    [2, 15],  // Krittika - Vishakha
    [3, 14],  // Rohini - Swati
    [5, 21],  // Ardra - Shravana
    [6, 20],  // Punarvasu - Uttara Ashadha
    [7, 19],  // Pushya - Purva Ashadha
    [8, 18],  // Ashlesha - Mula
    [9, 26],  // Magha - Revati
    [10, 25], // Purva Phalguni - Uttara Bhadrapada
    [11, 24], // Uttara Phalguni - Purva Bhadrapada
    [12, 23], // Hasta - Shatabhisha
    [4, 13],  // Mrigashira - Chitra
    [13, 22], // Chitra - Dhanishtha
    [4, 22],  // Mrigashira - Dhanishtha
  ];
  const hasVedha = vedhaPairs.some(
    ([x, y]) =>
      (moonA.nakshatraIndex === x && moonB.nakshatraIndex === y) ||
      (moonA.nakshatraIndex === y && moonB.nakshatraIndex === x)
  );

  // Venus–Mars & Lunar Element Relational Chemistry
  const venusA = chartA.planets.find((p) => p.id === 'Venus') || moonA;
  const venusB = chartB.planets.find((p) => p.id === 'Venus') || moonB;
  const vSignA = ZODIAC_SIGNS[Math.floor(venusA.siderealLongitude / 30)];
  const vSignB = ZODIAC_SIGNS[Math.floor(venusB.siderealLongitude / 30)];
  const marsSignB = ZODIAC_SIGNS[Math.floor(marsB.siderealLongitude / 30)];
  const friendlyElem =
    (vSignA.element === marsSignB.element) ||
    (['Fire', 'Air'].includes(vSignA.element) && ['Fire', 'Air'].includes(marsSignB.element)) ||
    (['Earth', 'Water'].includes(vSignA.element) && ['Earth', 'Water'].includes(marsSignB.element));

  return {
    totalPoints,
    percentage,
    verdict:
      totalPoints >= 25
        ? 'Uttama (Exceptional Shastra Resonance)'
        : totalPoints >= 18
        ? 'Madhyama (Supportive & Marriageable Alignment)'
        : 'Requires Deep Planetary & Navamsha Synthesis',
    kootas,
    manglikPersonA: manglikA,
    manglikPersonB: manglikB,
    manglikStatus,
    dashakootaPoruthams: {
      mahendra: {
        passed: mahendraPassed,
        starCount: starCountAB,
        summaryEn: mahendraPassed
          ? `Star count #${starCountAB} passes Mahendra Porutham—supporting long-term resilience, family continuity, and mutual protection.`
          : `Star count #${starCountAB} is neutral for Mahendra—rely on Graha Maitri (${maitriScore}/5) and shared life goals.`,
        summaryNe: mahendraPassed
          ? `नक्षत्र गणना #${starCountAB} मा महेन्द्र पोरुथम शुभ छ—दीर्घकालीन सुरक्षा, पारिवारिक उन्नति र आपसी बल प्रदान गर्छ।`
          : `नक्षत्र गणना #${starCountAB} मा महेन्द्र सामान्य छ—ग्रह मैत्री (${maitriScore}/5) र आपसी समझदारीले सन्तुलन दिन्छ।`,
      },
      streeDeergha: {
        passed: streeDeerghaPassed,
        starCount: starCountAB,
        summaryEn: streeDeerghaPassed
          ? `Distance of ${starCountAB} stars (>13) fulfills Stree Deergha—amplifying domestic comfort and compounding household prosperity.`
          : `Distance of ${starCountAB} stars (<14)—consciously prioritize transparent budgeting and emotional appreciation.`,
        summaryNe: streeDeerghaPassed
          ? `${starCountAB} नक्षत्र दूरी (>१३) ले स्त्री-दीर्घ शुभ योग बनाउँछ—घरेलु सुख र दिगो समृद्धिमा सहयोग पुर्याउँछ।`
          : `${starCountAB} नक्षत्र दूरी—स्पष्ट आर्थिक योजना र भावनात्मक सम्मानलाई प्राथमिकता दिनु शुभ हुन्छ।`,
      },
      rajju: {
        zoneA: rajjuZoneA,
        zoneB: rajjuZoneB,
        hasConflict: rajjuConflict,
        summaryEn: !rajjuConflict
          ? `Clear Rajju Match (${rajjuZoneA} ↔ ${rajjuZoneB}): distinct cosmic rope zones protect lifelong partnership stability.`
          : `Shared ${rajjuZoneA} Rajju—mitigated when Rashi lords (${rA} & ${rB}) or Navamsha Lagnas are harmonious.`,
        summaryNe: !rajjuConflict
          ? `शुभ रज्जु मिलान (${rajjuZoneA} ↔ ${rajjuZoneB}): भिन्न रज्जु क्षेत्रले दाम्पत्य स्थायित्व र दीर्घायुको रक्षा गर्छ।`
          : `समान ${rajjuZoneA} रज्जु—राशि स्वामी (${rA} र ${rB}) मैत्री वा नवांश बलले परिहार गर्छ।`,
      },
      vedha: {
        hasVedha,
        summaryEn: !hasVedha
          ? `Zero Nakshatra Vedha: ${nakA.name} and ${nakB.name} flow without classical mutual star obstruction.`
          : `Nakshatra Vedha noted between ${nakA.name} & ${nakB.name}—pace major joint decisions during auspicious Guru/Sukra Horai.`,
        summaryNe: !hasVedha
          ? `नक्षत्र वेध दोष मुक्त: ${nakA.name} र ${nakB.name} बीच कुनै शास्त्रीय नक्षत्र अवरोध छैन।`
          : `${nakA.name} र ${nakB.name} बीच वेध देखिएकोले महत्त्वपूर्ण साझा निर्णय शुभ गुरु/शुक्र होरामा लिनु उत्तम।`,
      },
      coupleChemistry: {
        venusMarsHarmonyEn: friendlyElem
          ? `Natural Spark: Venus in ${vSignA.name} (${vSignA.element}) harmonizes effortlessly with Partner’s Mars in ${marsSignB.name} & Venus in ${vSignB.name}.`
          : `Complementary Contrast: Venus in ${vSignA.name} (${vSignA.element}) and Partner’s Venus in ${vSignB.name} (${vSignB.element}) bring different love languages that enrich each other when named openly.`,
        venusMarsHarmonyNe: friendlyElem
          ? `सहज आकर्षण: ${vSignA.name} शुक्र र जोडीको ${marsSignB.name} मङ्गल / ${vSignB.name} शुक्रबीच स्वाभाविक स्नेह र उत्साहको तालमेल छ।`
          : `पूरक स्वभाव: ${vSignA.name} शुक्र र जोडीको ${vSignB.name} शुक्रको भिन्न प्रेम-शैलीलाई खुला संवादले अझ समृद्ध बनाउँछ।`,
        conflictRepairRuleEn:
          signA.element === signB.element
            ? `Shared ${signA.element} Moon Rhythm: you process emotions at the same speed—take a 20-minute walk before debating practical logistics.`
            : `${signA.element} Moon ↔ ${signB.element} Moon Repair Rule: one partner seeks emotional reassurance while the other seeks solutions—validate feelings for 2 minutes first before problem-solving.`,
        conflictRepairRuleNe:
          signA.element === signB.element
            ? `समान ${signA.element} चन्द्र लय: दुवैको भावनात्मक गति मिल्दोजुल्दो छ—तनावमा २० मिनेट शान्त विश्राम लिएर संवाद गर्नुहोस्।`
            : `${signA.element} चन्द्र ↔ ${signB.element} चन्द्र नियम: समस्याको प्राविधिक समाधान खोज्नुअघि २ मिनेट एक-अर्काको भावनालाई ध्यानपूर्वक सुन्नुहोस्।`,
      },
    },
  };
}
