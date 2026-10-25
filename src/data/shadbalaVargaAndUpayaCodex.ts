// Authentic Six-Fold Planetary Strength (Shadbala), Baladi Avasthas, Solar Combustion (Astangata),
// 7-Chart Shodashvarga Harmonic Life Synthesis (D3, D4, D7, D9, D10, D12, D24),
// Kalyanavarma's Saravali Planetary Conjunctions (Yuti), and Trikona-Safe Upaya + Vastu Compass Codex.
// Bilingual (English + नेपाली) — Grounded in BPHS (Ch. 6–7, 27, 45, 84), Surya Siddhanta (Ch. 9),
// Saravali (Ch. 15–19), Brihat Samhita (Ch. 53), and Jataka Parijata.

import { NatalChartResult, norm360, ZODIAC_SIGNS } from '../engines/astronomyEngine';
import { DivisionalChartEntry } from '../engines/vedicEngine';
import { AppLanguage, trPlanet, trSign } from '../i18n/i18n';

export interface PlanetVitalityAnalysis {
  planetId: string;
  shadbalaRupas: number;
  minRequiredRupas: number;
  ratioPercent: number;
  tierTone: 'optimal' | 'favorable' | 'mixed';
  tierLabel: string;
  sthanaVirupas: number;
  digVirupas: number;
  kalaVirupas: number;
  cheshtaVirupas: number;
  naisargikaVirupas: number;
  drikVirupas: number;
  avasthaCode: 'BALA' | 'KUMARA' | 'YUVA' | 'VRIDDHA' | 'MRITA';
  avasthaLabel: string;
  avasthaDeliveryNote: string;
  isCombust: boolean;
  combustOrbDeg: number | null;
  combustNote: string | null;
  inPlanetaryWar: boolean;
  warPartner: string | null;
}

export interface VargaHarmonicLifeMirror {
  vargaCode: 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12' | 'D24';
  sanskritTitle: string;
  domainTitle: string;
  vargaLagnaSign: string;
  vargaLagnaLord: string;
  lordD1House: number;
  strengthTone: 'optimal' | 'favorable' | 'mixed';
  strengthBadge: string;
  laymanSynthesis: string;
  classicalRuleRef: string;
}

export interface SaravaliConjunctionPortrait {
  house: number;
  signLabel: string;
  planetsJoined: string[];
  headline: string;
  classicalPortrait: string;
  laymanTakeaway: string;
  sourceRef: string;
}

export interface TrikonaGemRecommendation {
  houseRole: '1st Lord (Lagna)' | '5th Lord (Purva Punya)' | '9th Lord (Bhagya)';
  houseRoleLabel: string;
  planetId: string;
  planetLabel: string;
  primaryGem: string;
  affordableUpaRatna: string;
  metalAndFinger: string;
  wearingWindow: string;
  whySafeExplanation: string;
}

export interface PersonalizedUpayaArchitecture {
  ascendantSignLabel: string;
  trikonaSafeGems: TrikonaGemRecommendation[];
  avoidGemPlanetsWarning: string;
  activeDashaCharityTitle: string;
  activeDashaCharityAction: string;
  weakestHouseHabitTitle: string;
  weakestHouseHabitAction: string;
  vastuDeskDirection: string;
  vastuDeskWhy: string;
  vastuSleepHeadDirection: string;
  vastuSleepWhy: string;
  sourceCitation: string;
}

// Exact Deep Debilitation Degrees (BPHS Ch. 3: Sun 10° Libra=190°, Moon 3° Scorpio=213°,
// Mars 28° Cancer=118°, Mercury 15° Pisces=345°, Jupiter 5° Capricorn=275°, Venus 27° Virgo=177°, Saturn 20° Aries=20°)
const DEEP_DEBILITATION_DEG: Record<string, number> = {
  Sun: 190,
  Moon: 213,
  Mars: 118,
  Mercury: 345,
  Jupiter: 275,
  Venus: 177,
  Saturn: 20,
};

// Exact BPHS Ch. 27 Naisargika Bala (Natural Luminosity in Virupas / Shashtiamshas)
const NAISARGIKA_VIRUPAS: Record<string, number> = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
  Rahu: 22.0,
  Ketu: 22.0,
};

// Exact BPHS Ch. 27 Minimum Shadbala Requirements in Rupas (1 Rupa = 60 Virupas)
const MIN_REQUIRED_RUPAS: Record<string, number> = {
  Sun: 5.0,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
  Rahu: 5.0,
  Ketu: 5.0,
};

// Powerless Bhava Cusp for Dig Bala (Opposite to Peak Directional House:
// Sun/Mars peak H10 -> powerless H4; Jup/Merc peak H1 -> powerless H7;
// Moon/Venus peak H4 -> powerless H10; Saturn peak H7 -> powerless H1)
const DIGBALA_ZERO_HOUSE: Record<string, number> = {
  Sun: 4,
  Mars: 4,
  Jupiter: 7,
  Mercury: 7,
  Moon: 10,
  Venus: 10,
  Saturn: 1,
  Rahu: 1,
  Ketu: 7,
};

// Surya Siddhanta Ch. 9 Solar Combustion (Astangata) Orbs in Degrees
function getCombustionLimitDeg(planetId: string, isRetrograde: boolean): number | null {
  switch (planetId) {
    case 'Moon':
      return 12;
    case 'Mars':
      return 17;
    case 'Mercury':
      return isRetrograde ? 12 : 14;
    case 'Jupiter':
      return 11;
    case 'Venus':
      return isRetrograde ? 8 : 10;
    case 'Saturn':
      return 15;
    default:
      return null;
  }
}

function angularSeparation(lonA: number, lonB: number): number {
  const diff = Math.abs(norm360(lonA) - norm360(lonB));
  return diff > 180 ? 360 - diff : diff;
}

const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Venus', 'Saturn', 'Mercury'],
  Ketu: ['Mars', 'Jupiter', 'Venus'],
};

const PLANET_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon', 'Mars'],
  Ketu: ['Sun', 'Moon'],
};

function vargaSignScoreVirupas(planetId: string, signIdx: number): number {
  const ruler = ZODIAC_SIGNS[signIdx]?.ruler || 'Sun';
  if (ruler === planetId) return 30; // Swakshetra
  if (PLANET_FRIENDS[planetId]?.includes(ruler)) return 15; // Mitra
  if (PLANET_ENEMIES[planetId]?.includes(ruler)) return 3.75; // Shatru
  return 7.5; // Sama (Neutral)
}

export function computePlanetVitalityMap(
  chart: NatalChartResult,
  divisionalTable: DivisionalChartEntry[],
  birthHourLocal: number,
  lang: AppLanguage
): Record<string, PlanetVitalityAnalysis> {
  const sun = chart.planets.find((p) => p.id === 'Sun') || chart.planets[0];
  const moon = chart.planets.find((p) => p.id === 'Moon') || chart.planets[0];
  const ascSid =
    chart.ayanamshaMode !== 'TROPICAL'
      ? chart.ascendant.longitude
      : norm360(
          chart.ascendant.longitude - norm360(sun.tropicalLongitude - sun.siderealLongitude)
        );

  const elongation = angularSeparation(sun.siderealLongitude, moon.siderealLongitude); // 0..180 (0=New, 180=Full)
  const isDayBirth = birthHourLocal >= 6 && birthHourLocal < 18;
  const benefics = new Set(['Jupiter', 'Venus', 'Moon', 'Mercury']);
  const warCandidates = chart.planets.filter((p) =>
    ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.id)
  );

  const out: Record<string, PlanetVitalityAnalysis> = {};

  for (const p of chart.planets) {
    if (['Uranus', 'Neptune', 'Pluto'].includes(p.id)) continue;

    const divRow = divisionalTable.find((d) => d.planetId === p.id);
    const signIdx = Math.floor(norm360(p.siderealLongitude) / 30);
    const degInSign = norm360(p.siderealLongitude) % 30;
    const isOddSign = signIdx % 2 === 0;

    // 1. Sthana Bala (Uchcha + Sapta-Vargaja + Kendradi + Drekkana + Ojhayugma)
    const debDeg = DEEP_DEBILITATION_DEG[p.id];
    const uchchaVirupas =
      debDeg !== undefined ? angularSeparation(p.siderealLongitude, debDeg) / 3 : 32;

    const vargaSigns = divRow
      ? [
          divRow.d1Sign,
          divRow.d2Sign,
          divRow.d3Sign,
          divRow.d7Sign,
          divRow.d9Sign,
          divRow.d12Sign,
          divRow.d30Sign,
        ]
      : [signIdx];
    const saptaVargajaVirupas = vargaSigns.reduce(
      (sum, sIdx) => sum + vargaSignScoreVirupas(p.id, sIdx),
      0
    );

    const kendraHouses = [1, 4, 7, 10];
    const panaparaHouses = [2, 5, 8, 11];
    const kendradiVirupas = kendraHouses.includes(p.house)
      ? 60
      : panaparaHouses.includes(p.house)
      ? 30
      : 15;

    const drekkanaPart = Math.floor(degInSign / 10); // 0, 1, 2
    const drekkanaVirupas =
      (['Sun', 'Mars', 'Jupiter'].includes(p.id) && drekkanaPart === 0) ||
      (['Mercury', 'Saturn'].includes(p.id) && drekkanaPart === 1) ||
      (['Moon', 'Venus'].includes(p.id) && drekkanaPart === 2)
        ? 15
        : 5;

    const ojhayugmaVirupas =
      (['Moon', 'Venus'].includes(p.id) && !isOddSign) ||
      (!['Moon', 'Venus'].includes(p.id) && isOddSign)
        ? 15
        : 5;

    const sthanaVirupas = Math.round(
      uchchaVirupas + saptaVargajaVirupas + kendradiVirupas + drekkanaVirupas + ojhayugmaVirupas
    );

    // 2. Dig Bala (Directional Strength from Powerless Cusp / 3 -> 0..60 Virupas)
    const zeroHouse = DIGBALA_ZERO_HOUSE[p.id] || 4;
    const zeroLon = norm360(ascSid + (zeroHouse - 1) * 30 + 15);
    const digVirupas = Math.round(angularSeparation(p.siderealLongitude, zeroLon) / 3);

    // 3. Kala Bala (Paksha + Nathonnatha Day/Night + Ayana/Tribhaga baseline)
    const pakshaVirupas = benefics.has(p.id) ? elongation / 3 : (180 - elongation) / 3;
    const nathonnathaVirupas =
      p.id === 'Mercury'
        ? 60
        : ['Sun', 'Jupiter', 'Venus'].includes(p.id)
        ? isDayBirth
          ? 48
          : 18
        : !isDayBirth
        ? 48
        : 18;
    const kalaVirupas = Math.round(pakshaVirupas + nathonnathaVirupas + 28);

    // 4. Cheshta Bala (Motional Strength: Retrograde Vakri = 60, Luminaries from Ayana/Paksha, Direct = 34..46)
    const cheshtaVirupas =
      p.id === 'Sun'
        ? Math.round(32 + uchchaVirupas * 0.45)
        : p.id === 'Moon'
        ? Math.round(pakshaVirupas)
        : p.isRetrograde
        ? 60
        : 36;

    // 5. Naisargika Bala
    const naisargikaVirupas = NAISARGIKA_VIRUPAS[p.id] || 25.71;

    // 6. Drik Bala (Benefic vs Malefic Whole-Sign / Opposition Aspect Balance)
    let drikAcc = 0;
    for (const other of chart.planets) {
      if (other.id === p.id || ['Uranus', 'Neptune', 'Pluto'].includes(other.id)) continue;
      const sep = angularSeparation(other.siderealLongitude, p.siderealLongitude);
      if (sep < 16 || Math.abs(sep - 120) < 12 || Math.abs(sep - 180) < 14) {
        drikAcc += benefics.has(other.id) ? 12 : -8;
      }
    }
    const drikVirupas = Math.max(-25, Math.min(35, drikAcc));

    const totalVirupas = Math.max(
      210,
      sthanaVirupas + digVirupas + kalaVirupas + cheshtaVirupas + naisargikaVirupas + drikVirupas
    );
    const shadbalaRupas = Math.round((totalVirupas / 60) * 100) / 100;
    const minRequiredRupas = MIN_REQUIRED_RUPAS[p.id] || 5.5;
    const ratioPercent = Math.round((shadbalaRupas / minRequiredRupas) * 100);

    const tierTone: 'optimal' | 'favorable' | 'mixed' =
      ratioPercent >= 115 ? 'optimal' : ratioPercent >= 95 ? 'favorable' : 'mixed';
    const tierLabel =
      lang === 'ne'
        ? ratioPercent >= 115
          ? 'उच्च षड्बल (प्रबल)'
          : ratioPercent >= 95
          ? 'सन्तुलित षड्बल'
          : 'सचेत अभ्यास आवश्यक'
        : ratioPercent >= 115
        ? 'High Shadbala'
        : ratioPercent >= 95
        ? 'Balanced Shadbala'
        : 'Needs Conscious Habit';

    // Baladi Avastha (BPHS Ch. 45 — 5 slices of 6° each; reversed in even signs!)
    const slice = Math.min(4, Math.floor(degInSign / 6)); // 0..4
    const oddOrder: ('BALA' | 'KUMARA' | 'YUVA' | 'VRIDDHA' | 'MRITA')[] = [
      'BALA',
      'KUMARA',
      'YUVA',
      'VRIDDHA',
      'MRITA',
    ];
    const avasthaCode = isOddSign ? oddOrder[slice] : oddOrder[4 - slice];

    const avasthaSpec: Record<
      typeof avasthaCode,
      { en: string; ne: string; noteEn: string; noteNe: string }
    > = {
      BALA: {
        en: 'Bala (Budding State)',
        ne: 'बाल अवस्था (अंकुरण)',
        noteEn:
          'Fresh, curious energy that blossoms best through mentorship, early experimentation, and patient skill-building.',
        noteNe:
          'नयाँ र जिज्ञासु ऊर्जा—गुरुको मार्गदर्शन र निरन्तर अभ्यासबाट विस्तारै पूर्ण फल दिन्छ।',
      },
      KUMARA: {
        en: 'Kumara (Rising Youth)',
        ne: 'कुमार अवस्था (उदीयमान)',
        noteEn:
          'Agile, fast-learning planetary alertness—delivers strong progress as confidence and discipline compound.',
        noteNe:
          'तीव्र सिकाइ र उत्साहपूर्ण अवस्था—आत्मविश्वास र अनुशासनसँगै राम्रो उन्नति दिन्छ।',
      },
      YUVA: {
        en: 'Yuva (Peak Prime Delivery)',
        ne: 'युवा अवस्था (पूर्ण फलदायी)',
        noteEn:
          'Peak classical alertness (100% Avastha expression)—delivers tangible, visible results during its periods.',
        noteNe:
          'सर्वोत्तम जाग्रत अवस्था—यस ग्रहको दशा र गोचरमा स्पष्ट र भरपर्दो परिणाम प्राप्त हुन्छ।',
      },
      VRIDDHA: {
        en: 'Vriddha (Seasoned Elder)',
        ne: 'वृद्ध अवस्था (परिपक्व प्रज्ञा)',
        noteEn:
          'Wise, reflective expression—excels in advisory, strategy, research, and long-horizon stewardship rather than haste.',
        noteNe:
          'गम्भीर र अनुभवी ऊर्जा—हतारभन्दा दीर्घकालीन रणनीति, परामर्श र गहन अध्ययनमा उत्कृष्ट फल दिन्छ।',
      },
      MRITA: {
        en: 'Mrita (Quiet Internalized Seed)',
        ne: 'शान्त बीज अवस्था (आन्तरिक)',
        noteEn:
          'Operates subtly inward rather than loudly outward—protect this life area with steady routines rather than impulsive risk.',
        noteNe:
          'बाहिरी तडकभडकभन्दा आन्तरिक एकाग्रतामा काम गर्छ—नियमित दिनचर्या र धैर्यबाट परिणाम सुरक्षित हुन्छ।',
      },
    };

    // Combustion (Astangata) Check
    const combLimit = getCombustionLimitDeg(p.id, p.isRetrograde);
    const sunDist = p.id === 'Sun' ? 999 : angularSeparation(p.siderealLongitude, sun.siderealLongitude);
    const isCombust = combLimit !== null && sunDist <= combLimit;
    const isCazimi = combLimit !== null && sunDist <= 0.5;
    const combustOrbDeg = isCombust ? Math.round(sunDist * 10) / 10 : null;
    const combustNote = !isCombust
      ? null
      : isCazimi
      ? lang === 'ne'
        ? `सूर्यको हृदय-केन्द्र (${combustOrbDeg}° काजिमी): असाधारण आन्तरिक एकाग्रता र विशेष प्रज्ञा।`
        : `Solar Heart Cazimi (${combustOrbDeg}° from Sun): rare laser-focused brilliance and inner authority.`
      : lang === 'ne'
      ? `सूर्य-समीप अस्त (${combustOrbDeg}° दूरी): यो ग्रह बाहिरी प्रशंसाभन्दा पर्दापछाडिको गहिरो मिहिनेत र आत्म-समीक्षाबाट बढी सफल हुन्छ।`
      : `Solar Proximity / Astangata (${combustOrbDeg}° from Sun): works with quiet inner intensity—thrives through substance and craft rather than external applause.`;

    // Planetary War (Graha Yuddha < 1.0° between Mars..Saturn)
    let inPlanetaryWar = false;
    let warPartner: string | null = null;
    if (['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.id)) {
      const rival = warCandidates.find(
        (w) => w.id !== p.id && angularSeparation(w.siderealLongitude, p.siderealLongitude) <= 1.0
      );
      if (rival) {
        inPlanetaryWar = true;
        warPartner = trPlanet(rival.id, lang);
      }
    }

    out[p.id] = {
      planetId: p.id,
      shadbalaRupas,
      minRequiredRupas,
      ratioPercent,
      tierTone,
      tierLabel,
      sthanaVirupas,
      digVirupas,
      kalaVirupas,
      cheshtaVirupas,
      naisargikaVirupas,
      drikVirupas,
      avasthaCode,
      avasthaLabel: lang === 'ne' ? avasthaSpec[avasthaCode].ne : avasthaSpec[avasthaCode].en,
      avasthaDeliveryNote:
        lang === 'ne' ? avasthaSpec[avasthaCode].noteNe : avasthaSpec[avasthaCode].noteEn,
      isCombust,
      combustOrbDeg,
      combustNote,
      inPlanetaryWar,
      warPartner,
    };
  }

  return out;
}

// ==================== 7-CHART SHODASHVARGA HARMONIC LIFE SYNTHESIS ====================

export function buildShodashvargaHarmonicSynthesis(
  chart: NatalChartResult,
  divisionalTable: DivisionalChartEntry[],
  lang: AppLanguage
): VargaHarmonicLifeMirror[] {
  const ascRow = divisionalTable.find((d) => d.planetId === 'Asc') || divisionalTable[0];

  const specs: {
    code: VargaHarmonicLifeMirror['vargaCode'];
    signIdx: number;
    sanskritEn: string;
    sanskritNe: string;
    domainEn: string;
    domainNe: string;
    refEn: string;
    refNe: string;
    meaningFn: (lagnaSign: string, lordName: string, lordH: number, ne: boolean) => string;
  }[] = [
    {
      code: 'D3',
      signIdx: ascRow.d3Sign,
      sanskritEn: 'Drekkana (D3)',
      sanskritNe: 'द्रेष्काण (D3)',
      domainEn: 'Courage, Initiative, Siblings & Co-Founders',
      domainNe: 'साहस, पराक्रम, भ्रातृत्व र सह-संस्थापक तालमेल',
      refEn: 'BPHS Ch. 6–7 • Parashara Drekkana',
      refNe: 'बृहत् पाराशर होरा शास्त्र अ. ६–७',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D3 लग्न ${ls} (स्वामी ${lr}, जन्म कुण्डलीको भाव ${lh} मा) ले देखाउँछ कि तपाईं दबाबको घडीमा आत्तिनुको सट्टा योजनाबद्ध साहस देखाउनुहुन्छ र साना कदमबाट ठूला काम सम्पन्न गर्नुहुन्छ।`
          : `With ${ls} rising in D3 and its ruler ${lr} anchored in natal House ${lh}, your courage activates when taking concrete initiative, backing teammates, and turning ideas into prototypes.`,
    },
    {
      code: 'D4',
      signIdx: ascRow.d4Sign,
      sanskritEn: 'Chaturthamsha (D4)',
      sanskritNe: 'चतुर्थांश / तुर्यांश (D4)',
      domainEn: 'Real Estate, Home Sanctuary & Fixed Assets',
      domainNe: 'घर-जग्गा, स्थायी सम्पत्ति र आन्तरिक सुख (तुर्यांश)',
      refEn: 'BPHS Ch. 7 • Bhagyamsha / Turyamsha',
      refNe: 'पाराशर चतुर्थांश सूत्र',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D4 लग्न ${ls} र स्वामी ${lr} (भाव ${lh}) ले भूमि, आवास र दीर्घकालीन स्थिर सम्पत्ति निर्माणमा क्रमिक र सुरक्षित उन्नति इङ्गित गर्छ।`
          : `${ls} rising in D4 (ruled by ${lr} in natal House ${lh}) governs how you build residential peace, land/property equity, and emotional grounding over decades.`,
    },
    {
      code: 'D7',
      signIdx: ascRow.d7Sign,
      sanskritEn: 'Saptamsha (D7)',
      sanskritNe: 'सप्तांश (D7)',
      domainEn: 'Progeny, Mentorship & Creative Legacy',
      domainNe: 'सन्तान, शिष्य परम्परा र सिर्जनात्मक उत्तराधिकार',
      refEn: 'BPHS Ch. 7 • Saptamsha Phala',
      refNe: 'पाराशर सप्तांश फल',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D7 लग्न ${ls} (स्वामी ${lr}, भाव ${lh}) ले भावी पुस्ता, विद्यार्थी वा मौलिक सिर्जनामार्फत दीर्घकालीन सकारात्मक छाप छोड्ने क्षमता देखाउँछ।`
          : `${ls} on the D7 ascendant (${lr} in natal House ${lh}) shapes your generative legacy—mentoring younger minds, parenting with intention, and shipping enduring creative work.`,
    },
    {
      code: 'D9',
      signIdx: ascRow.d9Sign,
      sanskritEn: 'Navamsha (D9)',
      sanskritNe: 'नवांश (D9)',
      domainEn: 'Inner Dharma, Second-Half Fruit & Marriage Core',
      domainNe: 'आन्तरिक धर्म, उत्तरार्ध भाग्य र दाम्पत्य आत्मा',
      refEn: 'BPHS Ch. 7 & Jaimini Karakamsha',
      refNe: 'पाराशर नवांश एवं जैमिनी सूत्र',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `राशि कुण्डली वृक्ष हो भने नवांश (${ls} लग्न, स्वामी ${lr} भाव ${lh} मा) त्यसको फल हो—उमेर ३२ पछि र साझेदारीमा तपाईंको वास्तविक परिपक्वता यहीँबाट खुल्छ।`
          : `If D1 is the tree, D9 (${ls} rising, ${lr} in House ${lh}) is the fruit—revealing how your character ripens after age 32 and what sustains sacred trust in marriage.`,
    },
    {
      code: 'D10',
      signIdx: ascRow.d10Sign,
      sanskritEn: 'Dashamsha (D10)',
      sanskritNe: 'दशमांश (D10)',
      domainEn: 'Public Authority, Career Ceiling & Impact',
      domainNe: 'व्यावसायिक प्रतिष्ठा, पदोन्नति र कर्म-प्रभाव',
      refEn: 'BPHS Ch. 7 • Maha-Phala Dashamsha',
      refNe: 'पाराशर दशमांश महाफल',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D10 लग्न ${ls} र स्वामी ${lr} (भाव ${lh}) ले समाजमा तपाईंको व्यावसायिक पहिचान, नेतृत्व शैली र दीर्घकालीन करियर उचाइ निर्धारण गर्छ।`
          : `${ls} rising in D10 with ${lr} placed in natal House ${lh} defines your executive ceiling—how institutions trust your competence when stakes are high.`,
    },
    {
      code: 'D12',
      signIdx: ascRow.d12Sign,
      sanskritEn: 'Dwadashamsha (D12)',
      sanskritNe: 'द्वादशांश (D12)',
      domainEn: 'Parents, Ancestral Lineage & Inherited Grit',
      domainNe: 'माता-पिता, कुल परम्परा र पैतृक सहनशीलता',
      refEn: 'BPHS Ch. 7 • Matri-Pitri Chintana',
      refNe: 'पाराशर द्वादशांश सूत्र',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D12 लग्न ${ls} (स्वामी ${lr}, भाव ${lh}) ले पुर्खाबाट प्राप्त संस्कार, नैतिक बल र पारिवारिक जिम्मेवारीलाई सन्तुलनमा राख्ने बाटो देखाउँछ।`
          : `${ls} on your D12 axis (${lr} in natal House ${lh}) reflects ancestral resilience—honoring family roots while consciously upgrading old generational patterns.`,
    },
    {
      code: 'D24',
      signIdx: ascRow.d24Sign,
      sanskritEn: 'Chaturvimshamsha / Siddhamsha (D24)',
      sanskritNe: 'चतुर्विंशांश / सिद्धांश (D24)',
      domainEn: 'Higher Education, Deep Technical Mastery & Vidya',
      domainNe: 'उच्च शिक्षा, प्राविधिक निपुणता, अनुसन्धान र विद्या-सिद्धि',
      refEn: 'BPHS Ch. 6–7 • Siddhamsha Vidya-Phala',
      refNe: 'पाराशर सिद्धांश विद्या-फल',
      meaningFn: (ls, lr, lh, ne) =>
        ne
          ? `D24 सिद्धांश लग्न ${ls} र स्वामी ${lr} (भाव ${lh}) ले गहिरो अध्ययन, अनुसन्धान, प्राविधिक/बौद्धिक सीप र शास्त्र-ज्ञानमा एकाग्र अभ्यासबाट प्राप्त हुने सिद्धि देखाउँछ।`
          : `${ls} rising in D24 Siddhamsha (ruled by ${lr} in natal House ${lh}) governs how you absorb complex frameworks—degrees, engineering/analytical mastery, and contemplative wisdom.`,
    },
  ];

  return specs.map((sp) => {
    const signObj = ZODIAC_SIGNS[sp.signIdx] || ZODIAC_SIGNS[0];
    const lordPlanet = chart.planets.find((p) => p.id === signObj.ruler) || chart.planets[0];
    const goodHouses = [1, 2, 4, 5, 7, 9, 10, 11];
    const isExaltedOrOwn =
      lordPlanet.dignity === 'Exalted' || lordPlanet.dignity === 'Own Sign';

    const strengthTone: 'optimal' | 'favorable' | 'mixed' =
      isExaltedOrOwn && goodHouses.includes(lordPlanet.house)
        ? 'optimal'
        : goodHouses.includes(lordPlanet.house)
        ? 'favorable'
        : 'mixed';

    const strengthBadge =
      lang === 'ne'
        ? strengthTone === 'optimal'
          ? 'प्रबल वर्ग-बल'
          : strengthTone === 'favorable'
          ? 'सबल आधार'
          : 'धैर्यपूर्ण विकास'
        : strengthTone === 'optimal'
        ? 'Peak Harmonic'
        : strengthTone === 'favorable'
        ? 'Supportive Varga'
        : 'Gradual Mastery';

    const lsLabel = trSign(signObj.name, lang);
    const lrLabel = trPlanet(signObj.ruler, lang);

    return {
      vargaCode: sp.code,
      sanskritTitle: lang === 'ne' ? sp.sanskritNe : sp.sanskritEn,
      domainTitle: lang === 'ne' ? sp.domainNe : sp.domainEn,
      vargaLagnaSign: lsLabel,
      vargaLagnaLord: lrLabel,
      lordD1House: lordPlanet.house,
      strengthTone,
      strengthBadge,
      laymanSynthesis: sp.meaningFn(lsLabel, lrLabel, lordPlanet.house, lang === 'ne'),
      classicalRuleRef: lang === 'ne' ? sp.refNe : sp.refEn,
    };
  });
}

// ==================== KALYANAVARMA'S SARAVALI PLANETARY CONJUNCTION (YUTI) PORTRAITS ====================

const PAIR_PORTRAITS: Record<
  string,
  { titleEn: string; titleNe: string; saravaliEn: string; laymanEn: string; laymanNe: string }
> = {
  'Mercury+Sun': {
    titleEn: 'Budhaditya Intellectual Clarity',
    titleNe: 'बुधादित्य बौद्धिक तेज योग',
    saravaliEn:
      'Saravali Ch. 15: Sun–Mercury conjunction bestows mathematical acuity, respected speech, administrative skill, and scholarly reputation.',
    laymanEn:
      'Blends executive purpose with analytical communication—you explain complex ideas persuasively and thrive in leadership, code, writing, or advisory roles.',
    laymanNe:
      'नेतृत्व क्षमता र तीक्ष्ण विश्लेषण शक्तिको सुन्दर संगम—जटिल विषयलाई सरल र प्रभावकारी ढङ्गले प्रस्तुत गर्न विशेष दक्षता दिन्छ।',
  },
  'Moon+Sun': {
    titleEn: 'Amavasya Focused Craftsmanship',
    titleNe: 'सूर्य–चन्द्र एकाग्र शिल्प योग',
    saravaliEn:
      'Saravali Ch. 15: Sun–Moon union forges self-contained determination, technical mastery, and resolute inner focus.',
    laymanEn:
      'Your conscious willpower (Sun) and emotional instincts (Moon) point toward the same life arena—giving single-minded dedication once committed.',
    laymanNe:
      'आत्मबल (सूर्य) र भावना (चन्द्र) एकै भावमा केन्द्रित हुँदा जुनसुकै लक्ष्यमा पूर्ण निष्ठा र गहिरो शिल्प-दक्षता प्राप्त हुन्छ।',
  },
  'Mars+Moon': {
    titleEn: 'Chandra–Mangala Resourceful Drive',
    titleNe: 'चन्द्र–मङ्गल कर्मशील अर्थ योग',
    saravaliEn:
      'Saravali Ch. 16: Moon–Mars union generates enterprising courage, practical resourcefulness, and decisive financial action.',
    laymanEn:
      'Pairs emotional intuition with bold execution—excellent for entrepreneurship, rapid problem-solving, and tangible asset building when impatience is paced.',
    laymanNe:
      'भावनात्मक समझ र साहसी कदमको संयोग—उद्यमशीलता, छिटो निर्णय र आर्थिक निर्माणमा बलियो ऊर्जा दिन्छ (आवेगमा संयम राख्नु शुभ)।',
  },
  'Jupiter+Moon': {
    titleEn: 'Gajakesari Noble Stewardship',
    titleNe: 'गजकेसरी प्रज्ञा एवं प्रतिष्ठा योग',
    saravaliEn:
      'Saravali Ch. 16: Moon–Jupiter union confers enduring goodwill, ethical generosity, lucid counsel, and lasting community respect.',
    laymanEn:
      'People naturally trust your warmth and fair judgment—creating protective goodwill in career, teaching, family, and public life.',
    laymanNe:
      'सद्भाव, नैतिक निर्णय र उदारताको योग—समाज, करियर र परिवारमा स्वाभाविक विश्वास र दीर्घकालीन प्रतिष्ठा दिलाउँछ।',
  },
  'Jupiter+Saturn': {
    titleEn: 'Dharma–Karma Institutional Architect',
    titleNe: 'गुरु–शनि धर्म-कर्म संस्थापक योग',
    saravaliEn:
      'Saravali Ch. 19: Jupiter–Saturn union merges long-horizon vision with stoic structural discipline, crowning institutional builders.',
    laymanEn:
      'Balances big-picture optimism (Jupiter) with realistic execution (Saturn)—ideal for building organizations, policy, engineering, or enduring wealth.',
    laymanNe:
      'दूरदृष्टि (गुरु) र कठोर अनुशासन (शनि) को मिलन—दीर्घकालीन संस्था, नीति वा स्थायी संरचना निर्माणमा अद्वितीय सफलता दिन्छ।',
  },
  'Mercury+Venus': {
    titleEn: 'Lakshmi–Narayana Aesthetic & Commercial Wit',
    titleNe: 'बुध–शुक्र कला एवं वाणिज्य कौशल योग',
    saravaliEn:
      'Saravali Ch. 18: Mercury–Venus union bestows eloquent charm, design/musical sensibility, diplomacy, and commercial grace.',
    laymanEn:
      'Unites crisp logic with refined aesthetics—superb for product design, negotiation, media, finance, hospitality, and harmonious client partnerships.',
    laymanNe:
      'तर्कशक्ति र सौन्दर्यबोधको संगम—डिजाइन, व्यापार सम्झौता, कूटनीति, सञ्चार र सृजनात्मक क्षेत्रमा विशेष आकर्षण र सफलता दिन्छ।',
  },
  'Mars+Venus': {
    titleEn: 'Dynamic Creative & Relational Magnetism',
    titleNe: 'मङ्गल–शुक्र उत्साही सृजना एवं आकर्षण योग',
    saravaliEn:
      'Saravali Ch. 17: Mars–Venus union sparks passionate artistry, charismatic ambition, athletic/design verve, and vivid relationships.',
    laymanEn:
      'High creative voltage—channel this passionate energy into ambitious projects, design, fitness, and shared adventures with your partner.',
    laymanNe:
      'उच्च सिर्जनात्मक उत्साह र आकर्षण—यो ऊर्जालाई कला, उद्यम, स्वास्थ्य र जोडीसँगको साझा लक्ष्यमा लगाउँदा उत्कृष्ट फल मिल्छ।',
  },
  'Saturn+Venus': {
    titleEn: 'Enduring Craft & Loyal Covenant',
    titleNe: 'शुक्र–शनि स्थायी शिल्प एवं निष्ठा योग',
    saravaliEn:
      'Saravali Ch. 19: Venus–Saturn union refines taste into timeless craftsmanship, patient wealth accumulation, and loyal maturity.',
    laymanEn:
      'Prefers quality over hype—rewards architecture, fine craft, long-term investing, and relationships built on proven loyalty.',
    laymanNe:
      'क्षणिक आकर्षणभन्दा दीर्घकालीन गुणस्तर र निष्ठामा विश्वास—स्थायी कला, लगानी र परिपक्व सम्बन्धमा शुभ फल दिन्छ।',
  },
};

export function detectSaravaliConjunctions(
  chart: NatalChartResult,
  lang: AppLanguage
): SaravaliConjunctionPortrait[] {
  const byHouse = new Map<number, typeof chart.planets>();
  for (const p of chart.planets) {
    if (['Uranus', 'Neptune', 'Pluto'].includes(p.id)) continue;
    const arr = byHouse.get(p.house) || [];
    arr.push(p);
    byHouse.set(p.house, arr);
  }

  const results: SaravaliConjunctionPortrait[] = [];
  for (const [house, group] of Array.from(byHouse.entries()).sort((a, b) => a[0] - b[0])) {
    if (group.length < 2) continue;
    const signLabel = trSign(group[0].signName, lang);
    const planetLabels = group.map((g) => trPlanet(g.id, lang));

    // Check if any classical named pair exists in this house cluster
    let matchedSpec: (typeof PAIR_PORTRAITS)[string] | null = null;
    for (let i = 0; i < group.length && !matchedSpec; i++) {
      for (let j = i + 1; j < group.length && !matchedSpec; j++) {
        const key = [group[i].id, group[j].id].sort().join('+');
        if (PAIR_PORTRAITS[key]) matchedSpec = PAIR_PORTRAITS[key];
      }
    }

    if (matchedSpec && group.length === 2) {
      results.push({
        house,
        signLabel,
        planetsJoined: planetLabels,
        headline: lang === 'ne' ? matchedSpec.titleNe : matchedSpec.titleEn,
        classicalPortrait: matchedSpec.saravaliEn,
        laymanTakeaway: lang === 'ne' ? matchedSpec.laymanNe : matchedSpec.laymanEn,
        sourceRef:
          lang === 'ne'
            ? `कल्याणवर्माकृत सारावली (अध्याय १५–१९) • भाव ${house}`
            : `Kalyanavarma’s Saravali (Ch. 15–19) • Natal House ${house}`,
      });
    } else {
      const hasNode = group.some((g) => g.id === 'Rahu' || g.id === 'Ketu');
      const headline =
        group.length >= 3
          ? lang === 'ne'
            ? `${ group.length }-ग्रह समूह योग (भाव ${house} • ${signLabel})`
            : `${group.length}-Planet Stellium Concentration (House ${house} • ${signLabel})`
          : hasNode
          ? lang === 'ne'
            ? `छाया-ग्रह कर्म संयोग (${planetLabels.join(' + ')})`
            : `Nodal Karmic Intensifier (${planetLabels.join(' + ')})`
          : lang === 'ne'
          ? `द्वि-ग्रह युति योग (${planetLabels.join(' + ')})`
          : `Dual-Graha Synthesis (${planetLabels.join(' + ')})`;

      const classicalPortrait =
        group.length >= 3
          ? `Saravali Ch. 19 (Bahugraha Yuti): Concentrating ${group.map((g) => g.id).join(', ')} in House ${house} makes this life domain a primary gravitational hub of your biography.`
          : `Saravali Ch. 15–18: ${group.map((g) => g.id).join(' & ')} co-inhabit ${group[0].signName} in House ${house}, fusing their significations whenever either planet’s Dasha or transit activates.`;

      const laymanTakeaway =
        lang === 'ne'
          ? `भाव ${house} (${signLabel}) मा ${planetLabels.join(', ')} सँगै बस्दा तपाईंको जीवनको मुख्य ऊर्जा यही क्षेत्रमा केन्द्रित हुन्छ—एउटा ग्रह सक्रिय हुँदा अर्को ग्रहले पनि तुरुन्त साथ दिन्छ।`
          : `Because ${planetLabels.join(', ')} share House ${house} (${signLabel}), decisions in this area trigger a linked chain reaction—conscious discipline here unlocks outsized rewards across your whole chart.`;

      results.push({
        house,
        signLabel,
        planetsJoined: planetLabels,
        headline,
        classicalPortrait,
        laymanTakeaway,
        sourceRef:
          lang === 'ne'
            ? `कल्याणवर्माकृत सारावली (बहुग्रह युति अध्याय) • भाव ${house}`
            : `Kalyanavarma’s Saravali (Conjunction Chapters) • House ${house}`,
      });
    }
  }

  return results;
}

// ==================== TRIKONA-SAFE GEMSTONE, SATTVIC DANA & BRIHAT SAMHITA VASTU COMPASS ====================

const GEM_CATALOG: Record<
  string,
  {
    gemEn: string;
    gemNe: string;
    upaEn: string;
    upaNe: string;
    fingerEn: string;
    fingerNe: string;
    windowEn: string;
    windowNe: string;
  }
> = {
  Sun: {
    gemEn: 'Natural Ruby (Manikya)',
    gemNe: 'माणिक्य (Ruby)',
    upaEn: 'Red Garnet or Sunstone',
    upaNe: 'रातो गार्नेट वा सनस्टोन',
    fingerEn: 'Gold or Copper • Ring Finger',
    fingerNe: 'सुन वा तामा • अनामिका (साइँली औँला)',
    windowEn: 'Sunday morning during Surya Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको आइतबार बिहान सूर्य होरामा',
  },
  Moon: {
    gemEn: 'Natural Pearl (Mukta)',
    gemNe: 'मोती (Pearl)',
    upaEn: 'Natural Moonstone (Chandrakanta)',
    upaNe: 'चन्द्रकान्त मणि (Moonstone)',
    fingerEn: 'Silver • Little Finger',
    fingerNe: 'चाँदी • कान्छी औँला',
    windowEn: 'Monday morning during Chandra Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको सोमबार बिहान चन्द्र होरामा',
  },
  Mars: {
    gemEn: 'Red Coral (Moonga)',
    gemNe: 'मुगा (Red Coral)',
    upaEn: 'Carnelian or Red Jasper',
    upaNe: 'कार्नेलियन (रातो उपरत्न)',
    fingerEn: 'Copper or Gold • Ring Finger',
    fingerNe: 'तामा वा सुन • अनामिका औँला',
    windowEn: 'Tuesday morning during Kuja Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको मङ्गलबार बिहान मङ्गल होरामा',
  },
  Mercury: {
    gemEn: 'Natural Emerald (Panna)',
    gemNe: 'पन्ना (Emerald)',
    upaEn: 'Peridot or Green Tourmaline',
    upaNe: 'पेरिडोट वा हरियो टुर्मलिन',
    fingerEn: 'Gold or Silver • Little Finger',
    fingerNe: 'सुन वा चाँदी • कान्छी औँला',
    windowEn: 'Wednesday morning during Budha Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको बुधबार बिहान बुध होरामा',
  },
  Jupiter: {
    gemEn: 'Yellow Sapphire (Pukhraj)',
    gemNe: 'पुखराज (Yellow Sapphire)',
    upaEn: 'Natural Citrine (Sunela)',
    upaNe: 'सुनेला / सिट्रिन (Citrine)',
    fingerEn: 'Gold or Brass • Index Finger',
    fingerNe: 'सुन वा पित्तल • तर्जनी (चोर औँला)',
    windowEn: 'Thursday morning during Guru Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको बिहीबार बिहान गुरु होरामा',
  },
  Venus: {
    gemEn: 'Diamond or White Sapphire (Heera)',
    gemNe: 'हीरा वा सेतो पुखराज',
    upaEn: 'Clear Quartz / White Zircon (Sphatika)',
    upaNe: 'स्फटिक वा सेतो जिरकन',
    fingerEn: 'Silver or Platinum • Middle or Ring Finger',
    fingerNe: 'चाँदी वा प्लाटिनम • माझी वा साइँली औँला',
    windowEn: 'Friday morning during Sukra Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको शुक्रबार बिहान शुक्र होरामा',
  },
  Saturn: {
    gemEn: 'Blue Sapphire (Neelam — trial 3 days first)',
    gemNe: 'नीलम (पहिले ३ दिन परीक्षण गरेर मात्र)',
    upaEn: 'Amethyst (Jamuniya) or Lapis Lazuli',
    upaNe: 'कटेला / एमेथिस्ट (Amethyst)',
    fingerEn: 'Silver or Panchadhatu • Middle Finger',
    fingerNe: 'चाँदी वा पञ्चधातु • माझी औँला',
    windowEn: 'Saturday evening during Shani Horai (Shukla Paksha)',
    windowNe: 'शुक्ल पक्षको शनिबार साँझ शनि होरामा',
  },
};

const SATTVIC_DANA_BY_PLANET: Record<string, { en: string; ne: string }> = {
  Sun: {
    en: 'Support eyesight clinics, clean solar/water initiatives, or honor elders and mentors on Sundays without seeking credit.',
    ne: 'आइतबार आँखा उपचार, स्वच्छ ऊर्जा वा ज्येष्ठ नागरिक/गुरुजनको सम्मानमा निस्वार्थ सहयोग गर्नुहोस्।',
  },
  Moon: {
    en: 'Offer clean drinking water, nourishing rice/milk meals, or emotional support to mothers and caregivers on Mondays.',
    ne: 'सोमबार स्वच्छ पिउने पानी, पौष्टिक भोजन वा आमाबुवा र असहायको सेवामा सहयोग गर्नुहोस्।',
  },
  Mars: {
    en: 'Donate blood when healthy, support emergency responders/athletes, or plant thorny/protective boundary trees on Tuesdays.',
    ne: 'मङ्गलबार रक्तदान, विपद् उद्धारकर्मीलाई सहयोग वा वृक्षारोपण जस्ता साहसी सेवामा सहभागी हुनुहोस्।',
  },
  Mercury: {
    en: 'Donate notebooks, textbooks, coding/literacy tools, or free tutoring to students in need on Wednesdays.',
    ne: 'बुधबार विद्यार्थीहरूलाई पुस्तक, कापी, प्रविधि वा नि:शुल्क शिक्षा/परामर्श दान गर्नुहोस्।',
  },
  Jupiter: {
    en: 'Support teachers, libraries, scholarships, or plant Peepal/fruit-bearing trees on Thursdays during Guru Horai.',
    ne: 'बिहीबार गुरु होरामा विद्यालय, पुस्तकालय, छात्रवृत्ति वा फलफूल/पीपल रोपणमा सहयोग गर्नुहोस्।',
  },
  Venus: {
    en: 'Support women’s welfare, artisans, music/arts education, or donate clean white garments/sweets on Fridays.',
    ne: 'शुक्रबार महिला सशक्तीकरण, कलाकार, सङ्गीत/कला शिक्षा वा स्वच्छ वस्त्र दानमा सहभागी हुनुहोस्।',
  },
  Saturn: {
    en: 'Treat workers and support staff with utmost dignity, help the elderly/disabled, or feed crows/street animals on Saturdays.',
    ne: 'शनिबार श्रमिक वर्गप्रति उच्च सम्मान, वृद्ध/अशक्त सेवा र पशुपन्छीलाई आहार दान गर्नुहोस्।',
  },
  Rahu: {
    en: 'Support sanitation workers, stray-animal shelters, or digital-safety education while keeping finances 100% transparent.',
    ne: 'सरसफाइकर्मी सहयोग, आश्रयविहीन प्राणी सेवा र पूर्ण आर्थिक पारदर्शिता राख्नु राहुको सर्वोत्तम शान्ति हो।',
  },
  Ketu: {
    en: 'Practice 12 minutes of silent breathwork daily, support spiritual/medical retreats, and feed street dogs.',
    ne: 'दैनिक १२ मिनेट मौन ध्यान/प्राणायाम, आध्यात्मिक/स्वास्थ्य सेवा र कुकुरलाई भोजन दिनु केतुको उत्तम उपाय हो।',
  },
};

export function buildPersonalizedUpayaArchitecture(
  chart: NatalChartResult,
  activeMahadashaLord: string,
  lowestSavHouse: { house: number; signName: string; bindus: number },
  lang: AppLanguage
): PersonalizedUpayaArchitecture {
  const sun = chart.planets.find((p) => p.id === 'Sun') || chart.planets[0];
  const ascSid =
    chart.ayanamshaMode !== 'TROPICAL'
      ? chart.ascendant.longitude
      : norm360(
          chart.ascendant.longitude - norm360(sun.tropicalLongitude - sun.siderealLongitude)
        );
  const lagnaIdx = Math.floor(ascSid / 30);
  const lagnaSign = ZODIAC_SIGNS[lagnaIdx];

  const h1Sign = ZODIAC_SIGNS[lagnaIdx];
  const h5Sign = ZODIAC_SIGNS[(lagnaIdx + 4) % 12];
  const h9Sign = ZODIAC_SIGNS[(lagnaIdx + 8) % 12];
  const h6Lord = ZODIAC_SIGNS[(lagnaIdx + 5) % 12].ruler;
  const h8Lord = ZODIAC_SIGNS[(lagnaIdx + 7) % 12].ruler;
  const h12Lord = ZODIAC_SIGNS[(lagnaIdx + 11) % 12].ruler;

  const trikonaRoles: {
    role: TrikonaGemRecommendation['houseRole'];
    labelEn: string;
    labelNe: string;
    lord: string;
    signName: string;
  }[] = [
    {
      role: '1st Lord (Lagna)',
      labelEn: '1st Lord (Lagna — Vitality & Self)',
      labelNe: 'लग्नेश (प्रथम भाव — स्वास्थ्य र व्यक्तित्व)',
      lord: h1Sign.ruler,
      signName: h1Sign.name,
    },
    {
      role: '5th Lord (Purva Punya)',
      labelEn: '5th Lord (Intellect & Creative Grace)',
      labelNe: 'पञ्चमेश (प्रज्ञा, विद्या र पूर्वपुण्य)',
      lord: h5Sign.ruler,
      signName: h5Sign.name,
    },
    {
      role: '9th Lord (Bhagya)',
      labelEn: '9th Lord (Dharma, Fortune & Protection)',
      labelNe: 'भाग्येश (नवम भाव — धर्म, भाग्य र रक्षा)',
      lord: h9Sign.ruler,
      signName: h9Sign.name,
    },
  ];

  const seenLords = new Set<string>();
  const trikonaSafeGems: TrikonaGemRecommendation[] = [];

  for (const tr of trikonaRoles) {
    if (seenLords.has(tr.lord)) continue;
    seenLords.add(tr.lord);
    const cat = GEM_CATALOG[tr.lord] || GEM_CATALOG.Jupiter;
    trikonaSafeGems.push({
      houseRole: tr.role,
      houseRoleLabel: lang === 'ne' ? tr.labelNe : tr.labelEn,
      planetId: tr.lord,
      planetLabel: trPlanet(tr.lord, lang),
      primaryGem: lang === 'ne' ? cat.gemNe : cat.gemEn,
      affordableUpaRatna: lang === 'ne' ? cat.upaNe : cat.upaEn,
      metalAndFinger: lang === 'ne' ? cat.fingerNe : cat.fingerEn,
      wearingWindow: lang === 'ne' ? cat.windowNe : cat.windowEn,
      whySafeExplanation:
        lang === 'ne'
          ? `${trSign(lagnaSign.name, 'ne')} लग्नका लागि ${trPlanet(tr.lord, 'ne')} त्रिकोण स्वामी (${trSign(tr.signName, 'ne')}) भएकाले आजीवन शुभ र सुरक्षित मानिन्छ।`
          : `For ${lagnaSign.name} Rising, ${tr.lord} rules the auspicious ${tr.signName} Trikona pillar—making its gem/upa-ratna functionally supportive rather than disruptive.`,
    });
  }

  const pureDusthanaLords = Array.from(new Set([h6Lord, h8Lord, h12Lord])).filter(
    (l) => !seenLords.has(l)
  );
  const avoidListStr = pureDusthanaLords.map((l) => trPlanet(l, lang)).join(', ');

  const avoidGemPlanetsWarning =
    lang === 'ne'
      ? `शास्त्रीय रत्न सावधानी (${trSign(lagnaSign.name, 'ne')} लग्न): ६/८/१२ दुःस्थान स्वामी (${avoidListStr}) को मुख्य रत्न बिना परीक्षण नलगाउनुहोस्—तिनका लागि मन्त्र र सात्त्विक दान नै सर्वोत्तम उपाय हो।`
      : `Classical Functional-Benefic Safeguard (${lagnaSign.name} Rising): Avoid wearing primary gemstones of pure 6th/8th/12th Dusthana lords (${avoidListStr}); harmonize those planets via Sattvic charity (Dana) and discipline instead.`;

  const dashaDana = SATTVIC_DANA_BY_PLANET[activeMahadashaLord] || SATTVIC_DANA_BY_PLANET.Jupiter;

  // Brihat Samhita Ch. 53 Elemental Vastu Compass for Desk & Sleep
  const elem = lagnaSign.element; // Fire, Earth, Air, Water
  const deskCompassMap: Record<
    string,
    { dirEn: string; dirNe: string; whyEn: string; whyNe: string }
  > = {
    Fire: {
      dirEn: 'East or North-East (Ishanya)',
      dirNe: 'पूर्व वा उत्तर-पूर्व (ईशान कोण)',
      whyEn:
        'Aligns your fiery Lagna vitality with solar dawn clarity—sharpening executive decisions without overheating stress.',
      whyNe:
        'अग्नि तत्त्व लग्नलाई प्रातःकालीन सूर्य-दिशासँग जोड्दा निर्णय क्षमता तीक्ष्ण र सन्तुलित रहन्छ।',
    },
    Earth: {
      dirEn: 'North (Kubera Axis) or East',
      dirNe: 'उत्तर (कुबेर दिशा) वा पूर्व',
      whyEn:
        'Activates Mercury/Kubera commercial flow alongside grounded Earth-sign persistence for steady wealth & focus.',
      whyNe:
        'पृथ्वी तत्त्वको स्थिरतालाई उत्तर (कुबेर) दिशासँग जोड्दा आर्थिक एकाग्रता र कार्य-सम्पन्नता बढ्छ।',
    },
    Air: {
      dirEn: 'East or North-West (Vayavya)',
      dirNe: 'पूर्व वा उत्तर-आग्नेय / उत्तर',
      whyEn:
        'Grounds agile Air-sign ideation into structured intellectual output, writing, software, and calm dialogue.',
      whyNe:
        'वायु तत्त्वको कल्पनाशीलतालाई व्यवस्थित लेखन, प्रविधि र स्पष्ट संवादमा रूपान्तरण गर्छ।',
    },
    Water: {
      dirEn: 'North-East (Ishanya) or North',
      dirNe: 'उत्तर-पूर्व (ईशान) वा उत्तर',
      whyEn:
        'Harmonizes intuitive Water-sign depth with serene Jupiterian clarity (Ishanya) for research and creative flow.',
      whyNe:
        'जल तत्त्वको गहिरो अन्तर्ज्ञानलाई ईशान कोणको सात्त्विक ऊर्जासँग जोड्दा मानसिक शान्ति र सिर्जनात्मकता बढ्छ।',
    },
  };

  const vSpec = deskCompassMap[elem] || deskCompassMap.Earth;

  return {
    ascendantSignLabel: trSign(lagnaSign.name, lang),
    trikonaSafeGems,
    avoidGemPlanetsWarning,
    activeDashaCharityTitle:
      lang === 'ne'
        ? `सक्रिय ${trPlanet(activeMahadashaLord, 'ne')} महादशा सात्त्विक सेवा (दान उपाय)`
        : `Active ${activeMahadashaLord} Mahadasha Sattvic Service (Zero-Cost Dana)`,
    activeDashaCharityAction: lang === 'ne' ? dashaDana.ne : dashaDana.en,
    weakestHouseHabitTitle:
      lang === 'ne'
        ? `भाव ${lowestSavHouse.house} (${lowestSavHouse.bindus} बिन्दु) सुदृढीकरण बानी`
        : `House ${lowestSavHouse.house} (${lowestSavHouse.bindus} Bindus) Habit Reinforcement`,
    weakestHouseHabitAction:
      lang === 'ne'
        ? `तपाईंको सर्वाष्टकवर्गमा भाव ${lowestSavHouse.house} मा तुलनात्मक कम बिन्दु (${lowestSavHouse.bindus}) भएकाले यस क्षेत्रमा आकस्मिक जोखिम नलिई लिखित योजना र साना दैनिक बानी अपनाउनुहोस्।`
        : `Because House ${lowestSavHouse.house} carries your leanest Ashtakavarga cushion (${lowestSavHouse.bindus} pts vs. 28 avg), replace rushed bets in this life area with written checklists and unhurried consistency.`,
    vastuDeskDirection: lang === 'ne' ? vSpec.dirNe : vSpec.dirEn,
    vastuDeskWhy: lang === 'ne' ? vSpec.whyNe : vSpec.whyEn,
    vastuSleepHeadDirection:
      lang === 'ne' ? 'पूर्व (विद्या/प्रज्ञा) वा दक्षिण (गहिरो विश्राम)' : 'East (Clarity & Study) or South (Deep Restorative Sleep)',
    vastuSleepWhy:
      lang === 'ne'
        ? 'बृहत् संहिता र मार्कण्डेय पुराण अनुसार सिरानी पूर्व वा दक्षिण राख्दा स्नायु प्रणाली शान्त भई गहिरो निद्रा र ऊर्जा पुनर्जागरण हुन्छ (उत्तर सिरानी वर्जित)।'
        : 'Per Varahamihira’s Brihat Samhita & Markandeya Purana, sleeping with your head toward South or East (never due North) supports calm cardiovascular and nervous-system recovery.',
    sourceCitation:
      lang === 'ne'
        ? 'स्रोत: बृहत् पाराशर होरा शास्त्र (अ. ८४–९७), वराहमिहिरकृत बृहत् संहिता (वास्तु अ. ५३) र प्रश्नमार्ग।'
        : 'Sources: Brihat Parashara Hora Shastra (Ch. 84–97), Varahamihira’s Brihat Samhita (Vastu Ch. 53) & Prashna Marga.',
  };
}
