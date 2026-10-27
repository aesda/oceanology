import { BirthProfile, NumerologySystem } from '../types/oceanology';
import { computeLoShuVedicGrid, LoShuVedicGridResult } from '../data/yoginiNadiVarshaphalCodex';

// Exact 9-color spectrum extracted from World Numerology's CanvasJS customColorSet1 (ev_683787d26715b399a0fd4e3ef3139ddfaae3b250ac13bef2ba9fc75e569ba0db)
export const DECOZ_COLORS: Record<number, { hex: string; name: string; keyword: string; element: string }> = {
  1: { hex: '#F3160E', name: 'Crimson Red', keyword: 'Leadership • Initiative • Independence', element: 'Fire / Sun' },
  2: { hex: '#F07D0D', name: 'Tangerine Orange', keyword: 'Diplomacy • Harmony • Sensitivity', element: 'Water / Moon' },
  3: { hex: '#EBEB0C', name: 'Solar Yellow', keyword: 'Creativity • Expression • Joy', element: 'Fire / Jupiter' },
  4: { hex: '#9ED21D', name: 'Spring Green', keyword: 'Structure • Discipline • Foundation', element: 'Earth / Uranus' },
  5: { hex: '#43B1E1', name: 'Sky Cyan', keyword: 'Freedom • Adventure • Adaptability', element: 'Air / Mercury' },
  6: { hex: '#377CC9', name: 'Ocean Indigo', keyword: 'Nurture • Responsibility • Healing', element: 'Earth / Venus' },
  7: { hex: '#AB5BC5', name: 'Mystic Violet', keyword: 'Wisdom • Introspection • Analysis', element: 'Water / Neptune' },
  8: { hex: '#E9597E', name: 'Rose Magenta', keyword: 'Mastery • Abundance • Authority', element: 'Earth / Saturn' },
  9: { hex: '#1A9418', name: 'Forest Emerald', keyword: 'Humanitarianism • Completion • Compassion', element: 'Fire / Mars' },
  11: { hex: '#00F5D4', name: 'Bioluminescent Teal (Master 11/2)', keyword: 'Illumination • Intuition • Visionary', element: 'Ether / Uranus-Moon' },
  22: { hex: '#FFD166', name: 'Celestial Gold (Master 22/4)', keyword: 'Master Architect • Global Manifestation', element: 'Ether / Pluto-Saturn' },
  33: { hex: '#FF6B8B', name: 'Lotus Coral (Master 33/6)', keyword: 'Master Teacher • Altruistic Devotion', element: 'Ether / Neptune-Venus' },
};

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export interface NumberValue {
  final: number;         // Preserves 11, 22, 33 if master
  singleDigit: number;   // Strictly 1-9
  compound: number;      // Pre-reduction sum (e.g., 29, 14, 38)
  karmicDebt: number | null; // 13, 14, 16, 19
  isMaster: boolean;
  trail: string;         // e.g. "29/11/2" or "14/5 (Karmic Debt 14)"
  meaning: string;
}

export interface DecozYearCell {
  calendarYear: number;
  age: number;
  universalYear: number;
  personalYear: number;
  pinnacle: number;
  challenge: number;
  physicalTransit: string;
  physicalValue: number;
  mentalTransit: string;
  mentalValue: number;
  spiritualTransit: string;
  spiritualValue: number;
  essence: number;
}

export interface ProportionalBar {
  digit: number;
  percentage: number;
  rawWeight: number;
  color: string;
  label: string;
}

export interface NumerologyReport {
  system: NumerologySystem;
  fullNameUsed: string;
  currentNameUsed: string;
  lifePath: NumberValue;
  expression: NumberValue;
  heartsDesire: NumberValue;
  personality: NumberValue;
  birthDay: NumberValue;
  maturity: NumberValue;
  currentNameExpression: NumberValue;
  personalYear: NumberValue;
  personalMonth: NumberValue;
  personalDay: NumberValue;
  pinnacles: { number: number; startAge: number; endAge: number | string; label: string }[];
  challenges: { number: number; startAge: number; endAge: number | string; label: string }[];
  karmicLessons: number[];
  planesOfExpression: {
    physical: number;
    mental: number;
    emotional: number;
    intuitive: number;
  };
  colorChartYears: DecozYearCell[];
  proportionalBars: ProportionalBar[];
  letterBreakdown: { char: string; value: number; isVowel: boolean }[];
  loShuGridEn: LoShuVedicGridResult;
  loShuGridNe: LoShuVedicGridResult;
}

function sumDigits(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

export function reduceNumber(raw: number, allowMaster = true): NumberValue {
  let curr = Math.abs(raw);
  const steps: number[] = [curr];
  let karmicDebt: number | null = null;

  if ([13, 14, 16, 19].includes(curr)) {
    karmicDebt = curr;
  }

  while (curr > 9 && !(allowMaster && (curr === 11 || curr === 22 || curr === 33))) {
    curr = sumDigits(curr);
    steps.push(curr);
    if ([13, 14, 16, 19].includes(curr)) {
      karmicDebt = curr;
    }
  }

  const isMaster = curr === 11 || curr === 22 || curr === 33;
  const singleDigit = isMaster ? sumDigits(curr) : curr || 1;
  const compound = steps[0];
  const trail =
    isMaster
      ? `${compound}/${curr}/${singleDigit}`
      : steps.length > 1
      ? steps.join('/')
      : `${curr}`;

  const info = DECOZ_COLORS[curr] || DECOZ_COLORS[singleDigit] || DECOZ_COLORS[1];
  return {
    final: curr || 1,
    singleDigit,
    compound,
    karmicDebt,
    isMaster,
    trail: karmicDebt ? `${trail} (Karmic Debt ${karmicDebt})` : trail,
    meaning: info.keyword,
  };
}

function isSmartVowel(word: string, idx: number): boolean {
  const ch = word[idx];
  if ('AEIOU'.includes(ch)) return true;
  if (ch === 'Y') {
    // Decoz rule: Y is a vowel when there is no other vowel in the syllable / adjacent
    const prev = idx > 0 ? word[idx - 1] : '';
    const next = idx < word.length - 1 ? word[idx + 1] : '';
    if (!'AEIOU'.includes(prev) && !'AEIOU'.includes(next)) {
      return true;
    }
  }
  return false;
}

function getLetterVal(ch: string, system: NumerologySystem): number {
  const upper = ch.toUpperCase();
  return system === 'CHALDEAN' ? (CHALDEAN_MAP[upper] || 0) : (PYTHAGOREAN_MAP[upper] || 0);
}

function expandNameTransitStream(namePart: string, system: NumerologySystem, totalYears = 90): { letter: string; val: number }[] {
  const clean = namePart.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
  const stream: { letter: string; val: number }[] = [];
  let idx = 0;
  while (stream.length < totalYears + 10) {
    const ch = clean[idx % clean.length];
    const val = getLetterVal(ch, system) || 1;
    for (let repeat = 0; repeat < val; repeat++) {
      stream.push({ letter: ch, val });
    }
    idx++;
  }
  return stream;
}

export function calculateNumerology(profile: BirthProfile, system: NumerologySystem = 'PYTHAGOREAN', referenceDate = new Date()): NumerologyReport {
  const words = [profile.firstName, profile.middleName, profile.lastName]
    .map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
    .filter(Boolean);

  const fullNameUsed = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ');
  const currentNameUsed = [profile.currentFirstName || profile.firstName, profile.currentLastName || profile.lastName].filter(Boolean).join(' ');

  // 1. Life Path (Method: reduce Month, Day, Year separately then sum, preserving master numbers)
  const mReduced = reduceNumber(profile.month, true);
  const dReduced = reduceNumber(profile.day, true);
  const yReduced = reduceNumber(sumDigits(profile.year), true);
  const lifePath = reduceNumber(mReduced.final + dReduced.final + yReduced.final, true);

  // 2. Expression, Heart's Desire (Vowels), Personality (Consonants)
  const letterBreakdown: { char: string; value: number; isVowel: boolean }[] = [];
  let wordExpSums = 0;
  let wordSoulSums = 0;
  let wordPersSums = 0;
  const presentDigits = new Set<number>();
  const planes = { physical: 0, mental: 0, emotional: 0, intuitive: 0 };

  for (const word of words) {
    let wAll = 0;
    let wVow = 0;
    let wCon = 0;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const val = getLetterVal(ch, system);
      const vow = isSmartVowel(word, i);
      letterBreakdown.push({ char: ch, value: val, isVowel: vow });
      presentDigits.add(val);
      wAll += val;
      if (vow) wVow += val;
      else wCon += val;

      // Planes of Expression classification
      if ('DMWT'.includes(ch) || val === 4 || val === 5) planes.physical++;
      else if ('AGHJNP'.includes(ch) || val === 1 || val === 8) planes.mental++;
      else if ('BIORSTXZ'.includes(ch) || val === 2 || val === 3 || val === 6) planes.emotional++;
      else planes.intuitive++;
    }
    wordExpSums += reduceNumber(wAll, true).final;
    wordSoulSums += reduceNumber(wVow, true).final;
    wordPersSums += reduceNumber(wCon, true).final;
  }

  const expression = reduceNumber(wordExpSums, true);
  const heartsDesire = reduceNumber(wordSoulSums, true);
  const personality = reduceNumber(wordPersSums, true);
  const birthDay = reduceNumber(profile.day, true);
  const maturity = reduceNumber(lifePath.final + expression.final, true);

  // Current Name Expression
  const currentLetters = currentNameUsed.toUpperCase().replace(/[^A-Z]/g, '');
  let currSum = 0;
  for (const ch of currentLetters) currSum += getLetterVal(ch, system);
  const currentNameExpression = reduceNumber(currSum, true);

  // Karmic Lessons (Missing numbers 1-9 in birth name)
  const karmicLessons: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (!presentDigits.has(d)) karmicLessons.push(d);
  }

  // Personal Year, Month, Day for referenceDate
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();
  const personalYear = reduceNumber(profile.month + profile.day + sumDigits(refYear), false);
  const personalMonth = reduceNumber(personalYear.singleDigit + refMonth, false);
  const personalDay = reduceNumber(personalMonth.singleDigit + refDay, false);

  // 4 Pinnacles & 4 Challenges
  const mSingle = mReduced.singleDigit;
  const dSingle = dReduced.singleDigit;
  const ySingle = yReduced.singleDigit;

  const pin1 = reduceNumber(mSingle + dSingle, true).final;
  const pin2 = reduceNumber(dSingle + ySingle, true).final;
  const pin3 = reduceNumber(pin1 + pin2, true).final;
  const pin4 = reduceNumber(mSingle + ySingle, true).final;

  const p1End = 36 - lifePath.singleDigit;
  const p2End = p1End + 9;
  const p3End = p2End + 9;

  const pinnacles = [
    { number: pin1, startAge: 0, endAge: p1End, label: 'First Pinnacle (Youth & Foundation)' },
    { number: pin2, startAge: p1End + 1, endAge: p2End, label: 'Second Pinnacle (Productivity & Family)' },
    { number: pin3, startAge: p2End + 1, endAge: p3End, label: 'Third Pinnacle (Integration & Mastery)' },
    { number: pin4, startAge: p3End + 1, endAge: 'Life', label: 'Fourth Pinnacle (Legacy & Wisdom)' },
  ];

  const ch1 = Math.abs(mSingle - dSingle);
  const ch2 = Math.abs(dSingle - ySingle);
  const ch3 = Math.abs(ch1 - ch2);
  const ch4 = Math.abs(mSingle - ySingle);

  const challenges = [
    { number: ch1, startAge: 0, endAge: p1End, label: 'First Challenge' },
    { number: ch2, startAge: p1End + 1, endAge: p2End, label: 'Second Challenge' },
    { number: ch3, startAge: p2End + 1, endAge: p3End, label: 'Third (Main) Challenge' },
    { number: ch4, startAge: p3End + 1, endAge: 'Life', label: 'Fourth Challenge' },
  ];

  // Reverse-engineered updateStartAge() from World Numerology: currentAge - 10 (clamped >= 0)
  const currentAge = Math.max(0, refYear - profile.year);
  const startAge = profile.startAgeOverride !== undefined
    ? Math.max(0, profile.startAgeOverride)
    : Math.max(0, currentAge - 10);

  // Build 30-Year Decoz ColorChart Timeline
  const physStream = expandNameTransitStream(profile.firstName || 'A', system, startAge + 40);
  const mentStream = expandNameTransitStream(profile.middleName || profile.lastName || 'A', system, startAge + 40);
  const spirStream = expandNameTransitStream(profile.lastName || profile.firstName || 'A', system, startAge + 40);

  const colorChartYears: DecozYearCell[] = [];
  for (let offset = 0; offset < 25; offset++) {
    const age = startAge + offset;
    const calYear = profile.year + age;
    const univYear = reduceNumber(sumDigits(calYear), false).singleDigit;
    const persYear = reduceNumber(mSingle + dSingle + univYear, false).singleDigit;
    const activePin = age <= p1End ? pin1 : age <= p2End ? pin2 : age <= p3End ? pin3 : pin4;
    const activeCh = age <= p1End ? ch1 : age <= p2End ? ch2 : age <= p3End ? ch3 : ch4;
    const pT = physStream[age] || { letter: 'A', val: 1 };
    const mT = mentStream[age] || { letter: 'A', val: 1 };
    const sT = spirStream[age] || { letter: 'A', val: 1 };
    const essence = reduceNumber(pT.val + mT.val + sT.val, false).singleDigit;

    colorChartYears.push({
      calendarYear: calYear,
      age,
      universalYear: univYear,
      personalYear: persYear,
      pinnacle: reduceNumber(activePin, false).singleDigit,
      challenge: activeCh || 1,
      physicalTransit: pT.letter,
      physicalValue: pT.val,
      mentalTransit: mT.letter,
      mentalValue: mT.val,
      spiritualTransit: sT.letter,
      spiritualValue: sT.val,
      essence,
    });
  }

  // Proportional Numerology Chart (World Numerology prochartbackend.php equivalent)
  // Weights: LifePath (25), Expression (20), Heart's Desire (15), Personality (10), BirthDay (10), Maturity (8), Name letters (1 each)
  const weights: Record<number, number> = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2 };
  weights[lifePath.singleDigit] += 25;
  weights[expression.singleDigit] += 20;
  weights[heartsDesire.singleDigit] += 15;
  weights[personality.singleDigit] += 10;
  weights[birthDay.singleDigit] += 10;
  weights[maturity.singleDigit] += 8;
  weights[personalYear.singleDigit] += 5;

  for (const item of letterBreakdown) {
    if (item.value >= 1 && item.value <= 9) {
      weights[item.value] += 1.5;
    }
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const proportionalBars: ProportionalBar[] = [];
  for (let d = 1; d <= 9; d++) {
    const pct = Math.round((weights[d] / totalWeight) * 1000) / 10;
    proportionalBars.push({
      digit: d,
      percentage: pct,
      rawWeight: weights[d],
      color: DECOZ_COLORS[d].hex,
      label: DECOZ_COLORS[d].keyword.split('•')[0].trim(),
    });
  }

  return {
    system,
    fullNameUsed,
    currentNameUsed,
    lifePath,
    expression,
    heartsDesire,
    personality,
    birthDay,
    maturity,
    currentNameExpression,
    personalYear,
    personalMonth,
    personalDay,
    pinnacles,
    challenges,
    karmicLessons,
    planesOfExpression: planes,
    colorChartYears,
    proportionalBars,
    letterBreakdown,
    loShuGridEn: computeLoShuVedicGrid(profile, lifePath.singleDigit, birthDay.singleDigit, 'en'),
    loShuGridNe: computeLoShuVedicGrid(profile, lifePath.singleDigit, birthDay.singleDigit, 'ne'),
  };
}
