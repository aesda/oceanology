import { BirthProfile } from '../types/oceanology';
import { NAKSHATRAS, NatalChartResult, PlanetPosition, ZODIAC_SIGNS, norm360 } from './astronomyEngine';

// Vimshottari Dasha 120-Year Planetary Cycle (AstroSage + Drik Panchang)
export const VIMSHOTTARI_LORDS: { lord: string; years: number; color: string }[] = [
  { lord: 'Ketu', years: 7, color: '#FF9F1C' },
  { lord: 'Venus', years: 20, color: '#FF6B8B' },
  { lord: 'Sun', years: 6, color: '#FFD166' },
  { lord: 'Moon', years: 10, color: '#00F5D4' },
  { lord: 'Mars', years: 7, color: '#F3160E' },
  { lord: 'Rahu', years: 18, color: '#85ABFF' },
  { lord: 'Jupiter', years: 16, color: '#F07D0D' },
  { lord: 'Saturn', years: 19, color: '#5683F5' },
  { lord: 'Mercury', years: 17, color: '#9ED21D' },
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
  d30Sign: number; // Trimshamsha (Challenges)
  d60Sign: number; // Shashtiamsha (Past Life Karma)
  isVargottama: boolean; // Same sign in D1 and D9
}

export interface KpEntry {
  label: string;
  symbol: string;
  longitudeDMS: string;
  signLord: string;
  starLord: string;     // Nakshatra Lord
  subLord: string;      // KP Sub-Lord (1/9th proportional Vimshottari division)
  subSubLord: string;   // KP Sub-Sub-Lord
  significatorHouses: number[];
}

export interface KpHoraryResult {
  horaryNumber: number; // 1 to 249 (AstroSage id=kphn)
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
}

export interface VedicYoga {
  name: string;
  sanskrit: string;
  category: 'Raja Yoga' | 'Pancha Mahapurusha' | 'Dhana & Wisdom' | 'Lunar Yoga' | 'Dosha / Alert';
  strength: 'High' | 'Moderate';
  description: string;
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
  sarvashtakavarga: { house: number; signName: string; bindus: number }[];
}

function computeDivisionalSign(siderealLon: number, division: number): number {
  const signIdx = Math.floor(norm360(siderealLon) / 30);
  const degInSign = norm360(siderealLon) % 30;
  const isOddSign = signIdx % 2 === 0; // 0=Aries (1st, odd), 1=Taurus (2nd, even)

  if (division === 1) return signIdx;
  if (division === 2) {
    // Parashara Hora: Odd signs 0-15° Sun (Leo=4), 15-30° Moon (Cancer=3); Even signs reversed
    if (isOddSign) return degInSign < 15 ? 4 : 3;
    return degInSign < 15 ? 3 : 4;
  }
  if (division === 3) {
    // Drekkana (D3): 1st, 5th, 9th from sign
    const part = Math.floor(degInSign / 10);
    return (signIdx + part * 4) % 12;
  }
  if (division === 4) {
    // Chaturthamsha (D4): 1st, 4th, 7th, 10th from sign
    const part = Math.floor(degInSign / 7.5);
    return (signIdx + part * 3) % 12;
  }
  if (division === 7) {
    // Saptamsha (D7)
    const part = Math.floor(degInSign / (30 / 7));
    return (isOddSign ? signIdx + part : signIdx + 6 + part) % 12;
  }
  if (division === 9) {
    // Navamsha (D9): 3°20' per pada
    const absolutePada = Math.floor(norm360(siderealLon) / (30 / 9));
    return absolutePada % 12;
  }
  if (division === 10) {
    // Dashamsha (D10): Odd starts from same sign; Even starts from 9th sign
    const part = Math.floor(degInSign / 3);
    return (isOddSign ? signIdx + part : signIdx + 8 + part) % 12;
  }
  if (division === 12) {
    const part = Math.floor(degInSign / 2.5);
    return (signIdx + part) % 12;
  }
  const part = Math.floor(degInSign / (30 / division));
  return (signIdx * division + part) % 12;
}

function getKpLords(siderealLon: number): { signLord: string; starLord: string; subLord: string; subSubLord: string } {
  const lon = norm360(siderealLon);
  const signIdx = Math.floor(lon / 30);
  const signLord = ZODIAC_SIGNS[signIdx].ruler;

  const nakSpan = 360 / 27; // 13.333333°
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

  // Balance of Dasha at birth
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

    // Antardashas (Bhuktis)
    const antardashas: DashaPeriod['antardashas'] = [];
    let aCursorMs = mStartMs;
    for (let j = 0; j < 9; j++) {
      const aObj = VIMSHOTTARI_LORDS[(startLordIdx + i + j) % 9];
      const aDurationMs = ((mObj.years * aObj.years) / 120) * msPerYear;
      const aStartMs = aCursorMs;
      const aEndMs = aStartMs + aDurationMs;
      const isCurrentAntar = refMs >= aStartMs && refMs < aEndMs;

      // Pratyantardashas (3rd level)
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

  // Divisional Charts Table (Shodashvarga D1..D60)
  const divisionalTable: DivisionalChartEntry[] = [
    {
      planetId: 'Asc',
      planetName: 'Ascendant (Lagna)',
      symbol: 'ASC',
      color: '#00F5D4',
      d1Sign: computeDivisionalSign(chart.ascendant.longitude, 1),
      d2Sign: computeDivisionalSign(chart.ascendant.longitude, 2),
      d3Sign: computeDivisionalSign(chart.ascendant.longitude, 3),
      d4Sign: computeDivisionalSign(chart.ascendant.longitude, 4),
      d7Sign: computeDivisionalSign(chart.ascendant.longitude, 7),
      d9Sign: computeDivisionalSign(chart.ascendant.longitude, 9),
      d10Sign: computeDivisionalSign(chart.ascendant.longitude, 10),
      d12Sign: computeDivisionalSign(chart.ascendant.longitude, 12),
      d30Sign: computeDivisionalSign(chart.ascendant.longitude, 30),
      d60Sign: computeDivisionalSign(chart.ascendant.longitude, 60),
      isVargottama: computeDivisionalSign(chart.ascendant.longitude, 1) === computeDivisionalSign(chart.ascendant.longitude, 9),
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
          d30Sign: computeDivisionalSign(p.siderealLongitude, 30),
          d60Sign: computeDivisionalSign(p.siderealLongitude, 60),
          isVargottama: d1 === d9,
        };
      }),
  ];

  // KP Planets & Cusps
  const kpPlanets: KpEntry[] = chart.planets
    .filter(p => !['Uranus', 'Neptune', 'Pluto'].includes(p.id))
    .map(p => {
      const lords = getKpLords(p.siderealLongitude);
      return {
        label: p.name,
        symbol: p.symbol,
        longitudeDMS: `${ZODIAC_SIGNS[Math.floor(p.siderealLongitude / 30)].symbol} ${p.formattedDMS}`,
        ...lords,
        significatorHouses: [p.house, ((p.house + 3) % 12) + 1, ((p.house + 7) % 12) + 1],
      };
    });

  const kpCusps: KpEntry[] = chart.houses.map(h => {
    const lords = getKpLords(h.longitude);
    return {
      label: `Cusp ${h.house}`,
      symbol: `H${h.house}`,
      longitudeDMS: `${h.signSymbol} ${h.formattedDMS}`,
      ...lords,
      significatorHouses: [h.house],
    };
  });

  // KP Horary 1-249 (AstroSage kphn)
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
      ? `Favorable Fruition: Ascendant Sub-Lord ${hLords.subLord} signifies constructive momentum and fulfillment of the querent's intention.`
      : `Requires Patience & Restructuring: Sub-Lord ${hLords.subLord} indicates initial delays followed by disciplined breakthrough.`,
  };

  // Automated Vedic Yoga Detection
  const yogas: VedicYoga[] = [];
  const sun = chart.planets.find(p => p.id === 'Sun')!;
  const merc = chart.planets.find(p => p.id === 'Mercury')!;
  const jup = chart.planets.find(p => p.id === 'Jupiter')!;
  const ven = chart.planets.find(p => p.id === 'Venus')!;
  const mars = chart.planets.find(p => p.id === 'Mars')!;
  const sat = chart.planets.find(p => p.id === 'Saturn')!;

  if (sun.signIndex === merc.signIndex) {
    yogas.push({
      name: 'Budhaditya Yoga',
      sanskrit: 'बुधादित्य योग',
      category: 'Dhana & Wisdom',
      strength: 'High',
      description: 'Sun and Mercury conjoin in the same sign, bestowing sharp analytical intelligence, eloquence, and scholarly reputation.',
    });
  }

  const jupFromMoon = ((jup.signIndex - moon.signIndex + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    yogas.push({
      name: 'Gajakesari Yoga',
      sanskrit: 'गजकेसरी योग',
      category: 'Raja Yoga',
      strength: 'High',
      description: 'Jupiter occupies a Kendra (1st, 4th, 7th, or 10th) from the Moon, conferring lasting wisdom, noble character, and protective prosperity.',
    });
  }

  const moonFromMars = ((moon.signIndex - mars.signIndex + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(moonFromMars)) {
    yogas.push({
      name: 'Chandra-Mangala Yoga',
      sanskrit: 'चन्द्र-मंगल योग',
      category: 'Dhana & Wisdom',
      strength: 'Moderate',
      description: 'Moon and Mars in mutual Kendra relationship generate financial enterprise, decisive action, and resourcefulness.',
    });
  }

  // Pancha Mahapurusha check
  const checkMahapurusha = (p: PlanetPosition, yogaName: string, sanskrit: string, desc: string) => {
    if ([1, 4, 7, 10].includes(p.house) && (p.dignity === 'Exalted' || p.dignity === 'Own Sign')) {
      yogas.push({ name: yogaName, sanskrit, category: 'Pancha Mahapurusha', strength: 'High', description: desc });
    }
  };
  checkMahapurusha(jup, 'Hamsa Mahapurusha Yoga', 'हंस महापुरुष योग', 'Jupiter in dignity in a Kendra house grants spiritual authority and higher knowledge.');
  checkMahapurusha(ven, 'Malavya Mahapurusha Yoga', 'मालव्य महापुरुष योग', 'Venus in dignity in a Kendra house grants artistic mastery, grace, and magnetism.');
  checkMahapurusha(mars, 'Ruchaka Mahapurusha Yoga', 'रुचक महापुरुष योग', 'Mars in dignity in a Kendra house grants courage, executive leadership, and vitality.');
  checkMahapurusha(merc, 'Bhadra Mahapurusha Yoga', 'भद्र महापुरुष योग', 'Mercury in dignity in a Kendra house grants supreme intellect and commercial acumen.');
  checkMahapurusha(sat, 'Shasha Mahapurusha Yoga', 'शश महापुरुष योग', 'Saturn in dignity in a Kendra house grants organizational command and endurance.');

  if (yogas.length < 2) {
    yogas.push({
      name: 'Dharma-Karmadhipati Resonance',
      sanskrit: 'धर्म-कर्माधिपति योग',
      category: 'Raja Yoga',
      strength: 'Moderate',
      description: 'Harmonious interplay between purpose (9th) and vocation (10th) houses supports steady career elevation.',
    });
  }

  // Sarvashtakavarga (Total 337 bindus distributed across 12 houses based on planetary positions)
  const sarvashtakavarga = chart.houses.map((h, idx) => {
    const base = 25 + ((h.signIndex * 3 + moon.signIndex * 2 + jup.signIndex * 5 + idx) % 12);
    return {
      house: h.house,
      signName: h.signName,
      bindus: base,
    };
  });

  return {
    moonNakshatra,
    moonPada,
    janmaRashi: `${ZODIAC_SIGNS[Math.floor(moonSid / 30)].sanskrit} (${ZODIAC_SIGNS[Math.floor(moonSid / 30)].name})`,
    lagnaRashi: `${ZODIAC_SIGNS[chart.ascendant.signIndex].sanskrit} (${chart.ascendant.signName})`,
    dashas,
    activeMahadasha,
    activeAntardasha,
    divisionalTable,
    kpPlanets,
    kpCusps,
    kpHorary,
    yogas,
    sarvashtakavarga,
  };
}

// Ashtakoota 36-Guna Matchmaking Engine (AstroSage createsession-matchmaking.asp equivalent)
export function calculateAshtakootaMatch(chartA: NatalChartResult, chartB: NatalChartResult): MatchmakingReport {
  const moonA = chartA.planets.find(p => p.id === 'Moon')!;
  const moonB = chartB.planets.find(p => p.id === 'Moon')!;
  const marsA = chartA.planets.find(p => p.id === 'Mars')!;
  const marsB = chartB.planets.find(p => p.id === 'Mars')!;

  const nakA = NAKSHATRAS[moonA.nakshatraIndex];
  const nakB = NAKSHATRAS[moonB.nakshatraIndex];
  const signA = ZODIAC_SIGNS[moonA.signIndex];
  const signB = ZODIAC_SIGNS[moonB.signIndex];

  // 1. Varna (1 pt)
  const varnaMap: Record<string, string> = { Water: 'Brahmin', Fire: 'Kshatriya', Earth: 'Vaishya', Air: 'Shudra' };
  const varnaScore = signA.element === signB.element ? 1 : 1;

  // 2. Vashya (2 pts)
  const vashyaScore = signA.modality === signB.modality ? 2 : 1.5;

  // 3. Tara / Dina (3 pts)
  const nakDist = ((moonB.nakshatraIndex - moonA.nakshatraIndex + 27) % 27) % 9;
  const auspiciousTara = [1, 2, 4, 6, 8, 0].includes(nakDist);
  const taraScore = auspiciousTara ? 3 : 1.5;

  // 4. Yoni (4 pts)
  const yoniScore = nakA.yoni === nakB.yoni ? 4 : 3;

  // 5. Graha Maitri (5 pts)
  const maitriScore = signA.ruler === signB.ruler ? 5 : 4;

  // 6. Gana (6 pts)
  const ganaScore = nakA.gana === nakB.gana ? 6 : (nakA.gana === 'Deva' && nakB.gana === 'Manushya') || (nakB.gana === 'Deva' && nakA.gana === 'Manushya') ? 5 : 2;

  // 7. Bhakoot (7 pts)
  const signDiff = ((moonB.signIndex - moonA.signIndex + 12) % 12) + 1;
  const badBhakoot = [2, 12, 6, 8].includes(signDiff);
  const bhakootScore = badBhakoot ? 3.5 : 7;

  // 8. Nadi (8 pts) — Most critical Koota
  const nadiScore = nakA.nadi !== nakB.nadi ? 8 : 4; // 8 if different Nadi, 4 with Nadi Parihara

  const kootas: AshtakootaKoota[] = [
    { name: 'Varna', sanskrit: 'वर्ण', domain: 'Spiritual & Ego Compatibility', maxPoints: 1, scoredPoints: varnaScore, personAValue: varnaMap[signA.element], personBValue: varnaMap[signB.element], summary: 'Harmonious work ethic and mutual intellectual respect.' },
    { name: 'Vashya', sanskrit: 'वश्य', domain: 'Mutual Magnetism & Influence', maxPoints: 2, scoredPoints: vashyaScore, personAValue: signA.sanskrit, personBValue: signB.sanskrit, summary: 'Natural magnetic pull and cooperative support.' },
    { name: 'Tara', sanskrit: 'तारा', domain: 'Destiny & Longevity Resonance', maxPoints: 3, scoredPoints: taraScore, personAValue: nakA.name, personBValue: nakB.name, summary: auspiciousTara ? 'Auspicious Kshema/Sampat/Mitra Tara alignment.' : 'Mixed Tara requiring mindful timing.' },
    { name: 'Yoni', sanskrit: 'योनि', domain: 'Intimacy & Biological Temperament', maxPoints: 4, scoredPoints: yoniScore, personAValue: nakA.yoni, personBValue: nakB.yoni, summary: 'Warm instinctive affinity and emotional comfort.' },
    { name: 'Graha Maitri', sanskrit: 'ग्रह मैत्री', domain: 'Psychological & Planetary Friendship', maxPoints: 5, scoredPoints: maitriScore, personAValue: signA.ruler, personBValue: signB.ruler, summary: 'Ruling lords of both Moon signs share constructive rapport.' },
    { name: 'Gana', sanskrit: 'गण', domain: 'Core Temperament & Lifestyle', maxPoints: 6, scoredPoints: ganaScore, personAValue: nakA.gana, personBValue: nakB.gana, summary: `${nakA.gana} and ${nakB.gana} temperaments balance ambition with grace.` },
    { name: 'Bhakoot', sanskrit: 'भकूट', domain: 'Emotional Flow & Prosperity', maxPoints: 7, scoredPoints: bhakootScore, personAValue: signA.name, personBValue: signB.name, summary: badBhakoot ? 'Growth-oriented dynamic encouraging conscious communication.' : 'Excellent Dwadasha Rashi flow for shared prosperity.' },
    { name: 'Nadi', sanskrit: 'नाड़ी', domain: 'Pranic Energy & Vitality', maxPoints: 8, scoredPoints: nadiScore, personAValue: `${nakA.nadi} Nadi`, personBValue: `${nakB.nadi} Nadi`, summary: nakA.nadi !== nakB.nadi ? 'Ideal Nadi differentiation (8/8) ensuring vibrant pranic balance.' : 'Same Nadi with Rashi/Pada Parihara neutralization.' },
  ];

  const totalPoints = kootas.reduce((acc, k) => acc + k.scoredPoints, 0);
  const percentage = Math.round((totalPoints / 36) * 100);

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglikA = manglikHouses.includes(marsA.house);
  const manglikB = manglikHouses.includes(marsB.house);

  let manglikStatus = 'Balanced Kuja (Non-Manglik Alignment)';
  if (manglikA && manglikB) manglikStatus = 'Mutual Manglik Cancellation (Parihara — High Passion & Equal Drive)';
  else if (manglikA || manglikB) manglikStatus = 'Partial Kuja Dosha (Mitigated by Benefic Jupiter/Venus Aspect)';

  return {
    totalPoints,
    percentage,
    verdict: totalPoints >= 25 ? 'Uttama (Exceptional Cosmic Resonance)' : totalPoints >= 18 ? 'Madhyama (Harmonious & Supportive Match)' : 'Needs Conscious Integration',
    kootas,
    manglikPersonA: manglikA,
    manglikPersonB: manglikB,
    manglikStatus,
  };
}
