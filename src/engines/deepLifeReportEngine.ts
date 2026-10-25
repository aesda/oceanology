import { BirthProfile } from '../types/oceanology';
import {
  calculateNatalChart,
  NatalChartResult,
  norm360,
  ZODIAC_SIGNS,
} from './astronomyEngine';
import { VedicReport } from './vedicEngine';
import { PanchangReport } from './panchangEngine';
import { DECOZ_COLORS, NumerologyReport } from './numerologyEngine';
import { CosmicSynthesisReport } from './synthesisEngine';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import { PLANET_TREATISES } from '../data/classicalCompendium';
import { PLANET_IN_BHAVA_RULINGS } from '../data/canonAnthology';
import {
  ATMAKARAKA_SOUL_PATHS,
  AYURVEDIC_DOSHA_GUIDES,
  CHEIRO_COMPOUND_KEYNOTES,
  CORE_NUMEROLOGY_DEEP_GUIDE,
  DARAKARAKA_SPOUSE_PORTRAITS,
  DASHAMSHA_DIKPALAS,
  JUPITER_GOCHARA_FROM_MOON,
  PLANETARY_MATURITY_SPEC,
  RAHU_KETU_AXIS_GUIDE,
  REPORT_BOOK_BIBLIOGRAPHY,
  ReportBibliographyEntry,
  SATURN_GOCHARA_FROM_MOON,
  TENTH_LORD_IN_HOUSES,
} from '../data/deepReportBookCodex';
import {
  AppLanguage,
  trDashaGuide,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trPlanetRole,
  trSign,
} from '../i18n/i18n';

export interface LifeDomainScorecardItem {
  id: 'CAREER' | 'WEALTH' | 'RELATIONSHIPS' | 'VITALITY' | 'WISDOM';
  title: string;
  score: number; // 0-100
  verdictLabel: string;
  tone: 'optimal' | 'favorable' | 'mixed';
  summary: string;
  classicalDriver: string;
}

export interface PlanetaryMaturityMilestone {
  planetId: string;
  planetLabel: string;
  maturityAge: number;
  calendarYear: number;
  status: 'COMPLETED' | 'ACTIVE_NOW' | 'UPCOMING';
  houseOccupied: number;
  housesRuled: number[];
  headline: string;
  laymanMeaning: string;
  conjunctionNote: string | null;
  sourceRef: string;
}

export interface SubPeriodRoadmapItem {
  antarLordId: string;
  antarLordLabel: string;
  startDate: string;
  endDate: string;
  status: 'PAST' | 'ACTIVE' | 'UPCOMING';
  themeTitle: string;
  laymanGuidance: string;
}

export interface DeepPlanetReadingCard {
  planetId: string;
  planetLabel: string;
  symbol: string;
  color: string;
  signLabel: string;
  degreeDMS: string;
  house: number;
  houseTitle: string;
  housesRuled: number[];
  nakshatraLabel: string;
  nakshatraIndex: number;
  pada: number;
  dignity: string;
  isRetrograde: boolean;
  isVargottama: boolean;
  d9SignLabel: string;
  d10SignLabel: string;
  roleSubtitle: string;
  laymanSynthesis: string;
  classicalBphsRuling: string;
  growthLesson: string;
}

export interface DeepLifeReport {
  generatedDateIso: string;
  currentAge: number;
  unknownBirthTimeNote: string | null;
  domainScorecard: LifeDomainScorecardItem[];

  // 1. Soul Purpose, Arudha Public Image & Karmic Axis
  identityAndSoul: {
    arudhaLagnaSign: string;
    arudhaHouseFromLagna: number;
    innerVsOuterNarrative: string;
    atmakarakaPlanet: string;
    karakamshaSign: string;
    atmakarakaTitle: string;
    atmakarakaNarrative: string;
    rahuHouse: number;
    ketuHouse: number;
    ketuComfortGift: string;
    rahuGrowthEdge: string;
    ascendantSabian: string;
    sunSabian: string;
    sourceCitation: string;
  };

  // 2. Career, Calling & D10 Dashamsha Blueprint
  careerBlueprint: {
    tenthHouseSign: string;
    tenthLordPlanet: string;
    tenthLordHouse: number;
    headline: string;
    workStyleMode: string;
    laymanNarrative: string;
    amatyakarakaPlanet: string;
    amatyakarakaNote: string;
    dikpalaDeity: string;
    dikpalaDirection: string;
    dikpalaArchetype: string;
    dikpalaStyle: string;
    kpCusp10SubLord: string;
    kpCareerNote: string;
    recommendedLanes: string[];
    careerActionTip: string;
    sourceCitation: string;
  };

  // 3. Wealth Architecture, Indu Lagna & D2 Hora
  wealthBlueprint: {
    induLagnaSign: string;
    induHouseFromLagna: number;
    induKalasTrail: string;
    induStrengthTier: string;
    induNarrative: string;
    suryaHoraPercent: number;
    chandraHoraPercent: number;
    horaEarningStyleTitle: string;
    horaEarningNarrative: string;
    savingsBindusH2: number;
    gainsBindusH11: number;
    expenseBindusH12: number;
    cashflowVsRetentionAdvice: string;
    sourceCitation: string;
  };

  // 4. Love, Marriage, Partner Portrait & Upapada Lagna (UL)
  relationshipBlueprint: {
    seventhHouseSign: string;
    seventhLordPlanet: string;
    seventhLordHouse: number;
    upapadaLagnaSign: string;
    darakarakaPlanet: string;
    partnerArchetypeTitle: string;
    partnerPortraitNarrative: string;
    marriageEnvironmentNarrative: string;
    navamshaD9Note: string;
    marsBalanceHeadline: string;
    marsBalanceExplanation: string;
    goldenRelationshipRule: string;
    sourceCitation: string;
  };

  // 5. Health, Ayurvedic Constitution (Prakriti) & Daily Wellness
  wellnessBlueprint: {
    dominantDosha: string;
    vataPercent: number;
    pittaPercent: number;
    kaphaPercent: number;
    constitutionSummary: string;
    naturalStrength: string;
    stressSignalToWatch: string;
    foodAndHydrationTip: string;
    movementAndSleepTip: string;
    sixthHouseResilienceNote: string;
    sourceCitation: string;
  };

  // 6. Planetary Maturity Ages (16..48)
  maturityMilestones: PlanetaryMaturityMilestone[];

  // 7. Live Slow-Planet Gochara Transits & Active Antardasha Sub-Periods
  liveSkyAndSubPeriods: {
    saturnTransitSign: string;
    saturnHouseFromMoon: number;
    isSadeSati: boolean;
    saturnPhaseHeadline: string;
    saturnTone: 'optimal' | 'favorable' | 'mixed' | 'avoid';
    saturnGuidance: string;
    jupiterTransitSign: string;
    jupiterHouseFromMoon: number;
    hasGuruBala: boolean;
    jupiterHeadline: string;
    jupiterGuidance: string;
    rahuTransitSign: string;
    rahuHouseFromMoon: number;
    ketuTransitSign: string;
    ketuHouseFromMoon: number;
    nodalTransitNote: string;
    moorthiFormLabel: string;
    moorthiExplanation: string;
    activeMahadashaLabel: string;
    subPeriods: SubPeriodRoadmapItem[];
    sourceCitation: string;
  };

  // 8. Deep 9-Planet Synthesis Cards
  deepPlanetCards: DeepPlanetReadingCard[];

  // 9. Deep Numerology (Cheiro Compound + Decoz Pinnacles & Karmic Lessons)
  deepNumerology: {
    lifePathHeadline: string;
    lifePathDeepNarrative: string;
    compoundTitle: string;
    compoundNarrative: string;
    maturityNumberLabel: string;
    maturityNarrative: string;
    karmicLessonsTitle: string;
    karmicLessonsItems: string[];
    pinnacleRoadmap: {
      label: string;
      ageSpan: string;
      number: number;
      challenge: number;
      isCurrent: boolean;
      meaning: string;
    }[];
    sourceCitation: string;
  };

  // 10. Authoritative Book Bibliography
  bibliography: ReportBibliographyEntry[];
}

const INDU_KALAS: Record<string, number> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1,
};

function houseFrom(fromSignIdx: number, toSignIdx: number): number {
  return ((toSignIdx - fromSignIdx + 12) % 12) + 1;
}

function signRulerOf(signIdx: number): string {
  return ZODIAC_SIGNS[((signIdx % 12) + 12) % 12].ruler;
}

function clampScore(val: number): number {
  return Math.max(58, Math.min(97, Math.round(val)));
}

export function generateDeepLifeReport(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedicReport: VedicReport,
  panchangReport: PanchangReport,
  numerologyReport: NumerologyReport,
  synthesisReport: CosmicSynthesisReport,
  lang: AppLanguage = 'en',
  referenceDate = new Date()
): DeepLifeReport {
  const isNe = lang === 'ne';
  const t = (en: string, ne: string) => (isNe ? ne : en);

  const generatedDateIso = referenceDate.toISOString().slice(0, 10);
  const currentAge = Math.max(0, referenceDate.getFullYear() - profile.year);

  const ascDiv =
    vedicReport.divisionalTable.find((d) => d.planetId === 'Asc') || vedicReport.divisionalTable[0];
  const lagnaSignIdx = ascDiv.d1Sign;

  const getDivEntry = (pid: string) =>
    vedicReport.divisionalTable.find(
      (d) => d.planetId === pid || d.planetName.toLowerCase().includes(pid.toLowerCase())
    );

  const getD1Sign = (pid: string): number => {
    const entry = getDivEntry(pid);
    if (entry) return entry.d1Sign;
    const pl = natalChart.planets.find(
      (p) => p.id === pid || p.name.toLowerCase().includes(pid.toLowerCase())
    );
    return pl ? Math.floor(norm360(pl.siderealLongitude) / 30) : 0;
  };

  // Map houses ruled by each classical planet from Sidereal Lagna
  const housesRuledByPlanet: Record<string, number[]> = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (lagnaSignIdx + h - 1) % 12;
    const r = signRulerOf(sIdx);
    if (!housesRuledByPlanet[r]) housesRuledByPlanet[r] = [];
    housesRuledByPlanet[r].push(h);
  }

  // Arudha Pada helper (Jaimini Swasthe Dasha exception: 1st or 7th -> 10th from raw pada)
  const computeArudhaSign = (baseSignIdx: number): number => {
    const lord = signRulerOf(baseSignIdx);
    const lordSign = getD1Sign(lord);
    const dist = (lordSign - baseSignIdx + 12) % 12;
    let pada = (lordSign + dist) % 12;
    if (pada === baseSignIdx || pada === (baseSignIdx + 6) % 12) {
      pada = (pada + 9) % 12;
    }
    return pada;
  };

  const arudhaLagnaIdx = computeArudhaSign(lagnaSignIdx);
  const arudhaHouseFromLagna = houseFrom(lagnaSignIdx, arudhaLagnaIdx);
  const upapadaLagnaIdx = computeArudhaSign((lagnaSignIdx + 11) % 12);

  const moonSignIdx = getD1Sign('Moon');
  const sunPlanet = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];

  const unknownBirthTimeNote = profile.unknownTime
    ? t(
        'Birth time is marked Unknown (computed for 12:00 Solar Noon). Moon Sign, Birth Star (Nakshatra), Indu Lagna from Moon, Planetary Transits, and Numerology remain highly accurate; Ascendant & House numbers may shift once exact birth time is known.',
        'जन्म समय अज्ञात चिन्हित भएकाले मध्याह्न १२:०० को आधार लिइएको छ। चन्द्र राशि, जन्म नक्षत्र, गोचर फल र अंक ज्योतिष स्थिर रहन्छन् भने लग्न र भाव संख्या समय अनुसार बदलिने सम्भावना रहन्छ।'
      )
    : null;

  // ==================== 1. IDENTITY, ARUDHA LAGNA & KARMIC AXIS ====================
  const akKaraka =
    vedicReport.charaKarakas.find((c) => c.karakaCode === 'AK') || vedicReport.charaKarakas[0];
  const akBaseId = akKaraka.planetName.split(' ')[0];
  const akDiv = getDivEntry(akBaseId);
  const karakamshaIdx = akDiv ? akDiv.d9Sign : lagnaSignIdx;
  const akPath = ATMAKARAKA_SOUL_PATHS[akBaseId] || ATMAKARAKA_SOUL_PATHS.Sun;

  const rahuHouse = houseFrom(lagnaSignIdx, getD1Sign('Rahu'));
  const ketuHouse = houseFrom(lagnaSignIdx, getD1Sign('Ketu'));
  const axisGuide = RAHU_KETU_AXIS_GUIDE[rahuHouse] || RAHU_KETU_AXIS_GUIDE[1];

  const lagnaSignLabel = trSign(ZODIAC_SIGNS[lagnaSignIdx].name, lang);
  const arudhaSignLabel = trSign(ZODIAC_SIGNS[arudhaLagnaIdx].name, lang);
  const arudhaHouseGuide = trHouseGuide(arudhaHouseFromLagna, lang);

  const innerVsOuterNarrative = isNe
    ? `तपाईंको वास्तविक भित्री स्वभाव ${lagnaSignLabel} लग्नबाट निर्देशित छ, तर समाज र कार्यक्षेत्रले तपाईंलाई आरूढ लग्न (${arudhaSignLabel} राशि — भाव ${arudhaHouseFromLagna}: ${arudhaHouseGuide.shortTitle}) को दर्पणबाट चिन्दछ। जब तपाईंले आफ्नो भित्री निष्ठा र बाहिरी सामाजिक भूमिकालाई सन्तुलनमा राख्नुहुन्छ, प्रतिष्ठा र आत्मसन्तुष्टि दुवै एकसाथ मिल्छ।`
    : `Inside, your true constitution runs on ${lagnaSignLabel} Ascendant, while the outer world perceives your reputation through your Arudha Lagna in ${arudhaSignLabel} (House ${arudhaHouseFromLagna}: ${arudhaHouseGuide.shortTitle}). Aligning your private values with this public role makes recognition feel authentic rather than exhausting.`;

  const ascSabianPlanet =
    natalChart.planets.find((p) => p.signIndex === natalChart.ascendant.signIndex) || sunPlanet;

  // ==================== 2. CAREER & D10 DASHAMSHA BLUEPRINT ====================
  const tenthSignIdx = (lagnaSignIdx + 9) % 12;
  const tenthLordId = signRulerOf(tenthSignIdx);
  const tenthLordHouse = houseFrom(lagnaSignIdx, getD1Sign(tenthLordId));
  const tenthLordGuide = TENTH_LORD_IN_HOUSES[tenthLordHouse] || TENTH_LORD_IN_HOUSES[10];

  const tenthLordPlanetObj =
    natalChart.planets.find((p) => p.id === tenthLordId) || sunPlanet;
  const degInSidSign = norm360(tenthLordPlanetObj.siderealLongitude) % 30;
  const d10Part = Math.min(9, Math.max(0, Math.floor(degInSidSign / 3)));
  const isOddSign = getD1Sign(tenthLordId) % 2 === 0;
  const dikpalaIdx = isOddSign ? d10Part : 9 - d10Part;
  const dikpala = DASHAMSHA_DIKPALAS[dikpalaIdx] || DASHAMSHA_DIKPALAS[0];

  const amkKaraka =
    vedicReport.charaKarakas.find((c) => c.karakaCode === 'AmK') || vedicReport.charaKarakas[1];
  const amkBaseId = amkKaraka.planetName.split(' ')[0];
  const kpCusp10 = vedicReport.kpCusps[9] || vedicReport.kpCusps[0];

  const h10Bindus =
    vedicReport.sarvashtakavarga.find((s) => s.house === 10)?.bindus ?? 28;
  const h6Bindus =
    vedicReport.sarvashtakavarga.find((s) => s.house === 6)?.bindus ?? 28;
  const h7Bindus =
    vedicReport.sarvashtakavarga.find((s) => s.house === 7)?.bindus ?? 28;

  const workStyleMode =
    [1, 3, 5, 11].includes(tenthLordHouse) || h10Bindus >= h6Bindus + 3
      ? t(
          'High-Autonomy Builder, Leadership & Initiative',
          'स्वतन्त्र पहल, नेतृत्व र उद्यमशील कार्यशैली'
        )
      : [7, 2, 9].includes(tenthLordHouse) || h7Bindus >= 31
      ? t(
          'Advisory, Partnership & Strategic Deal-Making',
          'परामर्श, साझेदारी र रणनीतिक समन्वय कार्यशैली'
        )
      : t(
          'Institutional Mastery, Specialized Craft & Systems',
          'विशेषज्ञ सीप, संस्थागत नेतृत्व र प्रणालीगत दक्षता'
        );

  const birthNak = getNakshatraTreatiseByIndex(moonPlanet.nakshatraIndex);
  const mergedCareers = Array.from(
    new Set([
      ...(isNe ? tenthLordGuide.modernCareersNe : tenthLordGuide.modernCareersEn),
      ...(isNe ? [] : birthNak.vocations.slice(0, 2)),
    ])
  ).slice(0, 6);

  // ==================== 3. WEALTH, INDU LAGNA & D2 HORA ====================
  const ninthLagnaLord = signRulerOf((lagnaSignIdx + 8) % 12);
  const ninthMoonLord = signRulerOf((moonSignIdx + 8) % 12);
  const kalaA = INDU_KALAS[ninthLagnaLord] || 10;
  const kalaB = INDU_KALAS[ninthMoonLord] || 10;
  const totalKalas = kalaA + kalaB;
  const remKalas = totalKalas % 12 === 0 ? 12 : totalKalas % 12;
  const induSignIdx = (moonSignIdx + remKalas - 1) % 12;
  const induHouseFromLagna = houseFrom(lagnaSignIdx, induSignIdx);
  const induSignLabel = trSign(ZODIAC_SIGNS[induSignIdx].name, lang);

  const core9Divs = vedicReport.divisionalTable.filter((d) => d.planetId !== 'Asc');
  const induOccupants = core9Divs.filter((d) => d.d1Sign === induSignIdx);
  const indu7thAspectors = core9Divs.filter((d) => d.d1Sign === (induSignIdx + 6) % 12);
  const beneficSet = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
  const beneficOnIndu = [...induOccupants, ...indu7thAspectors].filter((d) =>
    beneficSet.has(d.planetId)
  );

  const induStrengthTier =
    beneficOnIndu.length >= 2
      ? t('High Natural Wealth Magnetism', 'उच्च प्राकृतिक धन आकर्षण योग')
      : beneficOnIndu.length === 1
      ? t('Steady Compounding Prosperity', 'क्रमिक र दिगो सम्पत्ति वृद्धि योग')
      : t('Self-Earned Disciplined Wealth', 'स्व-परिश्रम र अनुशासनबाट आर्जित समृद्धि');

  const induOccupantNames =
    induOccupants.length > 0
      ? induOccupants.map((o) => trPlanet(o.planetId, lang)).join(', ')
      : t('unoccupied (guided by its ruler ', 'ग्रह-रहित (स्वामी ') +
        trPlanet(signRulerOf(induSignIdx), lang) +
        ')';

  const induNarrative = isNe
    ? `कालिदासको 'उत्तरकालामृत' (खण्ड ४, श्लोक २७) अनुसार तपाईंको नवमेश (${trPlanet(ninthLagnaLord, 'ne')} = ${kalaA} कला) र चन्द्र-नवमेश (${trPlanet(ninthMoonLord, 'ne')} = ${kalaB} कला) जोड्दा जम्मा ${totalKalas} कला भई तपाईंको 'इन्दु लग्न' (धन लग्न) ${induSignLabel} राशि (भाव ${induHouseFromLagna}) मा पर्दछ, जहाँ ${induOccupantNames} को प्रभाव छ। महादशा वा अन्तर्दशामा ${induSignLabel} वा यसका स्वामी सक्रिय हुँदा आर्थिक फड्को मारिने प्रबल योग बन्छ।`
    : `By Kalidasa’s Uttara Kalamrita formula, summing your 9th Lord from Ascendant (${ninthLagnaLord}: ${kalaA} Kalas) and 9th Lord from Moon (${ninthMoonLord}: ${kalaB} Kalas) yields ${totalKalas} Kalas—placing your Indu Lagna (Wealth Ascendant) in ${induSignLabel} (House ${induHouseFromLagna}), influenced by ${induOccupantNames}. Periods activating ${induSignLabel} or its ruler (${signRulerOf(induSignIdx)}) mark your strongest wealth-building chapters.`;

  const suryaHoraCount = vedicReport.divisionalTable.filter((d) => d.d2Sign === 4).length;
  const totalHoraBodies = vedicReport.divisionalTable.length || 10;
  const suryaHoraPercent = Math.round((suryaHoraCount / totalHoraBodies) * 100);
  const chandraHoraPercent = 100 - suryaHoraPercent;

  const horaEarningStyleTitle =
    suryaHoraPercent >= 60
      ? t('Surya Hora Dominant — Ownership & Self-Directed Wealth', 'सूर्य होरा प्रधान — स्वामित्व र स्व-निर्णयबाट धनार्जन')
      : chandraHoraPercent >= 60
      ? t('Chandra Hora Dominant — Client, Public & Collaborative Wealth', 'चन्द्र होरा प्रधान — जनसम्पर्क, सेवा र सहकार्यबाट धनार्जन')
      : t('Balanced Surya–Chandra Hora — Dual Engine of Authority & Rapport', 'सन्तुलित सूर्य-चन्द्र होरा — नेतृत्व र जनसम्पर्क दुवैबाट समृद्धि');

  const horaEarningNarrative = isNe
    ? `बृहत् पाराशर होरा शास्त्रको D2 (होरा) कुण्डली अनुसार तपाईंका ${suryaHoraPercent}% ग्रह सूर्य होरामा र ${chandraHoraPercent}% ग्रह चन्द्र होरामा छन्। ${
        suryaHoraPercent >= chandraHoraPercent
          ? 'सूर्य होरा बलियो भएकाले आफ्नै निर्णय, नेतृत्व, इक्विटी/स्वामित्व र स्पष्ट जिम्मेवारी हुने कामबाट धन छिटो बढ्छ।'
          : 'चन्द्र होरा बलियो भएकाले ग्राहक सेवा, व्यापारिक सम्बन्ध, परामर्श, तरल सम्पत्ति र सामूहिक सहकार्यबाट सहज आम्दानी हुन्छ।'
      }`
    : `In your BPHS D2 Hora wealth chart, ${suryaHoraPercent}% of placements fall in Surya Hora (Sun’s authoritative half) and ${chandraHoraPercent}% in Chandra Hora (Moon’s relational half). ${
        suryaHoraPercent >= chandraHoraPercent
          ? 'You build wealth fastest when you hold clear ownership, equity, or leadership authority rather than passive roles.'
          : 'Money flows most smoothly through client trust, recurring relationships, public-facing products, and collaborative alliances.'
      }`;

  const savingsBindusH2 =
    vedicReport.sarvashtakavarga.find((s) => s.house === 2)?.bindus ?? 28;
  const gainsBindusH11 =
    vedicReport.sarvashtakavarga.find((s) => s.house === 11)?.bindus ?? 28;
  const expenseBindusH12 =
    vedicReport.sarvashtakavarga.find((s) => s.house === 12)?.bindus ?? 28;

  const cashflowVsRetentionAdvice = isNe
    ? gainsBindusH11 >= savingsBindusH2 + 2
      ? `तपाईंको एकादश आम्दानी बल (${gainsBindusH11} बिन्दु) बचत भाव (${savingsBindusH2} बिन्दु) भन्दा उच्च छ—अर्थात् पैसा कमाउने क्षमता राम्रो छ तर आम्दानी हुनासाथ स्वचालित बचत वा घर/दीर्घकालीन सम्पत्तिमा सार्ने नियम बनाउँदा धन टिकिरहन्छ।`
      : savingsBindusH2 >= gainsBindusH11 + 2
      ? `तपाईंको बचत भाव (${savingsBindusH2} बिन्दु) बलियो छ—तपाईं कमाएको धन जोगाउन र संकलन गर्न निपुण हुनुहुन्छ; आम्दानीका नयाँ स्रोत (भाव ११: ${gainsBindusH11} बिन्दु) थप्न सञ्जाल विस्तार गर्नुहोस्।`
      : `तपाईंको आम्दानी (भाव ११: ${gainsBindusH11} बिन्दु) र बचत (भाव २: ${savingsBindusH2} बिन्दु) सन्तुलित छन्${
          expenseBindusH12 >= 30
            ? `—द्वादश भाव (${expenseBindusH12} बिन्दु) सक्रिय भएकाले अनावश्यक खर्चको सट्टा यात्रा, शिक्षा वा योजनाबद्ध लगानीमा बजेट छुट्याउनुहोस्।`
            : '—नियमित दीर्घकालीन लगानीले आर्थिक सुरक्षा मजबुत बनाउँछ।'
        }`
    : gainsBindusH11 >= savingsBindusH2 + 2
    ? `Your Income House (H11: ${gainsBindusH11} pts) outpaces your Savings House (H2: ${savingsBindusH2} pts)—meaning you earn well, so automating transfers into index funds, gold, or property on payday ensures high cashflow turns into lasting net worth.`
    : savingsBindusH2 >= gainsBindusH11 + 2
    ? `Your Asset-Retention House (H2: ${savingsBindusH2} pts) is stronger than H11 (${gainsBindusH11} pts)—you naturally preserve capital well; focus on widening distribution and network pricing to grow top-line income.`
    : `Your Earning (H11: ${gainsBindusH11} pts) and Saving (H2: ${savingsBindusH2} pts) engines are well balanced${
        expenseBindusH12 >= 30
          ? `—since H12 (${expenseBindusH12} pts) is also active, channel outflows intentionally into global investments, learning, or planned travel rather than impulse spending.`
          : '—steady monthly compounding builds durable financial freedom.'
      }`;

  // ==================== 4. LOVE, MARRIAGE, UPAPADA & DARAKARAKA ====================
  const seventhSignIdx = (lagnaSignIdx + 6) % 12;
  const seventhLordId = signRulerOf(seventhSignIdx);
  const seventhLordHouse = houseFrom(lagnaSignIdx, getD1Sign(seventhLordId));

  const dkKaraka =
    vedicReport.charaKarakas.find((c) => c.karakaCode === 'DK') ||
    vedicReport.charaKarakas[vedicReport.charaKarakas.length - 1];
  const dkBaseId = dkKaraka.planetName.split(' ')[0];
  const dkPortrait =
    DARAKARAKA_SPOUSE_PORTRAITS[dkBaseId] || DARAKARAKA_SPOUSE_PORTRAITS.Venus;

  const ulSignLabel = trSign(ZODIAC_SIGNS[upapadaLagnaIdx].name, lang);
  const ulLordId = signRulerOf(upapadaLagnaIdx);
  const d9AscIdx = ascDiv.d9Sign;
  const d9SeventhIdx = (d9AscIdx + 6) % 12;

  const marriageEnvironmentNarrative = isNe
    ? `तपाईंको सप्तमेश ${trPlanet(seventhLordId, 'ne')} भाव ${seventhLordHouse} मा छ र जैमिनी उपपद लग्न (UL) ${ulSignLabel} राशिमा पर्दछ (स्वामी: ${trPlanet(ulLordId, 'ne')})। यसले वैवाहिक जीवन र दीर्घकालीन साझेदारीमा ${trHouseGuide(seventhLordHouse, 'ne').shortTitle} को भूमिका महत्त्वपूर्ण रहने देखाउँछ।`
    : `Your 7th House ruler (${seventhLordId}) sits in House ${seventhLordHouse} (${trHouseGuide(seventhLordHouse, 'en').shortTitle}), while your Jaimini Upapada Lagna (UL — marriage sanctuary) falls in ${ulSignLabel} ruled by ${ulLordId}. Relationships flourish when shared goals around ${trHouseGuide(seventhLordHouse, 'en').lifeAreas.toLowerCase()} are honored openly.`;

  const navamshaD9Note = isNe
    ? `नवांश कुण्डली (D9) मा लग्न ${trSign(ZODIAC_SIGNS[d9AscIdx].name, 'ne')} र सप्तम भाव ${trSign(ZODIAC_SIGNS[d9SeventhIdx].name, 'ne')} राशिमा छ—उमेर र अनुभवसँगै सम्बन्धमा गहिरो आत्मीयता र आपसी सम्मान थपिँदै जान्छ।`
    : `In your D9 Navamsha (marriage & soul-fruit chart), the partnership axis spans ${ZODIAC_SIGNS[d9AscIdx].name}–${ZODIAC_SIGNS[d9SeventhIdx].name}, indicating that emotional maturity and mutual respect deepen noticeably after initial adjustment.`;

  // Balanced, non-fearmongering Mars / Kuja energy check
  const marsSignIdx = getD1Sign('Mars');
  const marsHouseLagna = houseFrom(lagnaSignIdx, marsSignIdx);
  const marsHouseMoon = houseFrom(moonSignIdx, marsSignIdx);
  const kujaHouses = [1, 2, 4, 7, 8, 12];
  const rawKujaLagna = kujaHouses.includes(marsHouseLagna);
  const jupSignIdx = getD1Sign('Jupiter');
  const marsCancelledByDignity = [0, 7, 9, 3, 4, 10].includes(marsSignIdx);
  const marsCancelledByJupiter =
    jupSignIdx === marsSignIdx ||
    [4, 6, 8].includes((marsSignIdx - jupSignIdx + 12) % 12);
  const marsMaturedByAge = currentAge >= 28;

  let marsBalanceHeadline = '';
  let marsBalanceExplanation = '';
  if (!rawKujaLagna) {
    marsBalanceHeadline = t(
      'Calm Mars Placement — Naturally Balanced Partnership Energy',
      'सन्तुलित मङ्गल स्थिति — सहज वैवाहिक समन्वय (मङ्गल दोष रहित)'
    );
    marsBalanceExplanation = isNe
      ? `मङ्गल ग्रह भाव ${marsHouseLagna} मा अवस्थित भएकाले लग्न कुण्डलीमा माङ्गलिक उग्रता देखिएको छैन (चन्द्रबाट भाव ${marsHouseMoon})। सम्बन्धमा स्वाभाविक सहजता र सन्तुलन रहन्छ।`
      : `Mars sits in House ${marsHouseLagna} from your Ascendant (House ${marsHouseMoon} from Moon), outside the high-friction Kuja houses—supporting steady, cooperative partnership energy.`;
  } else if (marsCancelledByDignity || marsCancelledByJupiter || marsMaturedByAge) {
    marsBalanceHeadline = t(
      'High-Drive Mars With Built-In Classical Harmonization (Parihara)',
      'सक्रिय मङ्गल ऊर्जा तर शास्त्रीय परिहारद्वारा सन्तुलित'
    );
    marsBalanceExplanation = isNe
      ? `मङ्गल भाव ${marsHouseLagna} मा रहे पनि राशि बल, गुरु दृष्टि वा २८ वर्षपछिको परिपक्वताका कारण शास्त्रीय परिहार प्राप्त छ—यसलाई डरको रूपमा नलिई स्पष्ट संवाद र सक्रिय सहकार्यमा लगाउँदा दाम्पत्य जीवन सुदृढ रहन्छ।`
      : `Although Mars occupies House ${marsHouseLagna}, classical texts (Phaladeepika & Dr. B.V. Raman) note strong built-in neutralization (${
          marsCancelledByDignity
            ? 'sign dignity'
            : marsCancelledByJupiter
            ? 'Jupiter’s protective aspect'
            : 'post-age-28 Mars maturity'
        }). Simply practice calm, unhurried listening rather than superstitious worry.`;
  } else {
    marsBalanceHeadline = t(
      'Passionate Mars Energy — Thrives on Patience & Active Shared Goals',
      'उत्साही मङ्गल प्रभाव — धैर्य र खुला संवादले सम्बन्ध बलियो बन्ने'
    );
    marsBalanceExplanation = isNe
      ? `मङ्गल भाव ${marsHouseLagna} मा सक्रिय रहेकाले तपाईं सम्बन्धमा इमानदारी र जाँगर चाहनुहुन्छ; आवेशमा छिटो प्रतिक्रिया नदिने बानी र २८ वर्षपछिको परिपक्वताले उच्च सामञ्जस्य दिन्छ।`
      : `Mars in House ${marsHouseLagna} brings high candor and passion to close bonds—choosing an equally active partner, avoiding rushed arguments, and allowing Mars to mature around age 28 turns fiery energy into fierce loyalty.`;
  }

  // ==================== 5. HEALTH & AYURVEDIC CONSTITUTION (PRAKRITI) ====================
  const addDoshaForSign = (
    sIdx: number,
    weight: number,
    acc: { vata: number; pitta: number; kapha: number }
  ) => {
    if ([0, 4, 8].includes(sIdx)) acc.pitta += weight;
    else if ([2, 6, 10].includes(sIdx)) acc.vata += weight;
    else if ([3, 11].includes(sIdx)) acc.kapha += weight;
    else if (sIdx === 1) {
      acc.kapha += weight * 0.75;
      acc.pitta += weight * 0.25;
    } else if (sIdx === 7) {
      acc.pitta += weight * 0.55;
      acc.kapha += weight * 0.45;
    } else if (sIdx === 5) {
      acc.vata += weight * 0.65;
      acc.pitta += weight * 0.35;
    } else {
      acc.vata += weight * 0.65;
      acc.kapha += weight * 0.35;
    }
  };

  const doshaAcc = { vata: 0, pitta: 0, kapha: 0 };
  addDoshaForSign(lagnaSignIdx, 42, doshaAcc);
  addDoshaForSign(moonSignIdx, 36, doshaAcc);
  addDoshaForSign(getD1Sign('Sun'), 22, doshaAcc);

  const vataPercent = Math.round(doshaAcc.vata);
  const pittaPercent = Math.round(doshaAcc.pitta);
  const kaphaPercent = Math.max(0, 100 - vataPercent - pittaPercent);

  const doshaCandidates: { key: 'Vata' | 'Pitta' | 'Kapha'; val: number }[] = [
    { key: 'Vata', val: vataPercent },
    { key: 'Pitta', val: pittaPercent },
    { key: 'Kapha', val: kaphaPercent },
  ];
  const sortedDoshas = [...doshaCandidates].sort((a, b) => b.val - a.val);

  const primaryDosha = sortedDoshas[0].key;
  const secondaryDosha = sortedDoshas[1].key;
  const doshaNameNe: Record<'Vata' | 'Pitta' | 'Kapha', string> = {
    Vata: 'वात',
    Pitta: 'पित्त',
    Kapha: 'कफ',
  };

  const dominantDosha =
    sortedDoshas[0].val - sortedDoshas[1].val <= 14
      ? isNe
        ? `${doshaNameNe[primaryDosha]}–${doshaNameNe[secondaryDosha]} द्वि-प्रकृति`
        : `${primaryDosha}–${secondaryDosha} Dual Constitution`
      : isNe
      ? `${doshaNameNe[primaryDosha]} प्रधान प्रकृति`
      : `${primaryDosha}-Dominant Constitution`;

  const dGuide = AYURVEDIC_DOSHA_GUIDES[primaryDosha];
  const sixthLordId = signRulerOf((lagnaSignIdx + 5) % 12);
  const sixthLordTreatise = PLANET_TREATISES[sixthLordId];

  const sixthHouseResilienceNote = isNe
    ? `तपाईंको षष्ठ भावमा ${h6Bindus} सर्वाष्टकवर्ग बिन्दु छ (स्वामी: ${trPlanet(sixthLordId, 'ne')})। कार्यबोझ बढ्दा शरीरलाई समयमै विश्राम, पानी र सन्तुलित आहार दिनु नै सर्वोत्तम दीर्घायु सूत्र हो।`
    : `Your 6th House of Daily Recovery carries ${h6Bindus} Ashtakavarga points (ruled by ${sixthLordId}${
        sixthLordTreatise ? ` — linked to ${sixthLordTreatise.medicalAndAyurvedicDhatu.split('•')[1]?.trim() || 'systemic balance'}` : ''
      }). Steady daily routines protect your energy far better than extreme crash regimens.`;

  // ==================== 6. PLANETARY MATURITY AGES (16..48) ====================
  const coreNinePlanets = natalChart.planets.filter(
    (p) => !['Uranus', 'Neptune', 'Pluto'].includes(p.id)
  );

  const maturityMilestones: PlanetaryMaturityMilestone[] = PLANETARY_MATURITY_SPEC.map((spec) => {
    const pObj =
      coreNinePlanets.find(
        (pl) => pl.id === spec.planetId || pl.name.includes(spec.planetId)
      ) || sunPlanet;
    const pD1Sign = getD1Sign(spec.planetId);
    const pHouse = houseFrom(lagnaSignIdx, pD1Sign);
    const ruled = housesRuledByPlanet[spec.planetId] || [];
    const calYear = profile.year + spec.maturityAge;

    const status: PlanetaryMaturityMilestone['status'] =
      Math.abs(currentAge - spec.maturityAge) <= 1
        ? 'ACTIVE_NOW'
        : currentAge > spec.maturityAge
        ? 'COMPLETED'
        : 'UPCOMING';

    // Check conjunction with slower-maturing planet within 12 deg sidereal
    let conjunctionNote: string | null = null;
    for (const otherSpec of PLANETARY_MATURITY_SPEC) {
      if (otherSpec.maturityAge <= spec.maturityAge) continue;
      const otherPl = coreNinePlanets.find(
        (pl) => pl.id === otherSpec.planetId || pl.name.includes(otherSpec.planetId)
      );
      if (!otherPl) continue;
      const diff = Math.abs(norm360(pObj.siderealLongitude - otherPl.siderealLongitude));
      const angDist = diff > 180 ? 360 - diff : diff;
      if (angDist <= 12) {
        conjunctionNote = isNe
          ? `${trPlanet(otherSpec.planetId, 'ne')} सँग नजिकको युति भएकाले यसको दोस्रो पूर्ण फल उमेर ${otherSpec.maturityAge} मा अझ प्रखर हुन्छ।`
          : `Closely conjunct ${otherSpec.planetId} (${angDist.toFixed(1)}° orb)—its fullest second wave ripens around age ${otherSpec.maturityAge}.`;
        break;
      }
    }

    const hGuide = trHouseGuide(pHouse, lang);
    const ruledLabels = ruled
      .map((rh) => (isNe ? `भाव ${rh}` : `H${rh}`))
      .join(' & ');

    const laymanMeaning = isNe
      ? `तपाईंको कुण्डलीमा ${trPlanet(spec.planetId, 'ne')} भाव ${pHouse} (${hGuide.shortTitle}) मा बसी ${
          ruledLabels ? `${ruledLabels} को स्वामित्व सम्हाल्छ` : 'विशेष भूमिका खेल्छ'
        }। उमेर ${spec.maturityAge} (${calYear}) वरिपरि यस क्षेत्रका अनुभवहरू परिपक्व भई ठोस उपलब्धि दिन थाल्छन्।`
      : `In your chart, ${spec.planetId} sits in House ${pHouse} (${hGuide.shortTitle})${
          ruledLabels ? ` and rules ${ruledLabels}` : ''
        }—so age ${spec.maturityAge} (${calYear}) marks a natural turning point where ${hGuide.lifeAreas.toLowerCase()} stabilizes on mature footing.`;

    return {
      planetId: spec.planetId,
      planetLabel: trPlanet(spec.planetId, lang),
      maturityAge: spec.maturityAge,
      calendarYear: calYear,
      status,
      houseOccupied: pHouse,
      housesRuled: ruled,
      headline: isNe ? spec.themeNe : spec.themeEn,
      laymanMeaning,
      conjunctionNote,
      sourceRef: spec.sourceRef,
    };
  });

  // ==================== 7. LIVE SLOW-PLANET GOCHARA TRANSITS & SUB-PERIODS ====================
  const nowProfile: BirthProfile = {
    ...profile,
    year: referenceDate.getUTCFullYear(),
    month: referenceDate.getUTCMonth() + 1,
    day: referenceDate.getUTCDate(),
    hour: referenceDate.getUTCHours(),
    minute: referenceDate.getUTCMinutes(),
  };
  const liveSkyChart = calculateNatalChart(
    nowProfile,
    natalChart.ayanamshaMode,
    natalChart.houseSystem
  );

  const getTransitSign = (pid: string): number => {
    const tp = liveSkyChart.planets.find(
      (p) => p.id === pid || p.name.toLowerCase().includes(pid.toLowerCase())
    );
    return tp ? Math.floor(norm360(tp.siderealLongitude) / 30) : 0;
  };

  const satSign = getTransitSign('Saturn');
  const jupSign = getTransitSign('Jupiter');
  const rahSign = getTransitSign('Rahu');
  const ketSign = getTransitSign('Ketu');

  const satFromMoon = houseFrom(moonSignIdx, satSign);
  const jupFromMoon = houseFrom(moonSignIdx, jupSign);
  const rahFromMoon = houseFrom(moonSignIdx, rahSign);
  const ketFromMoon = houseFrom(moonSignIdx, ketSign);

  const satInfo = SATURN_GOCHARA_FROM_MOON[satFromMoon] || SATURN_GOCHARA_FROM_MOON[3];
  const jupInfo = JUPITER_GOCHARA_FROM_MOON[jupFromMoon] || JUPITER_GOCHARA_FROM_MOON[2];
  const isSadeSati = [12, 1, 2].includes(satFromMoon);

  const chandrabalaH = panchangReport.personalTarabala.chandrabalaHouse;
  let moorthiFormLabel = '';
  let moorthiExplanation = '';
  if ([1, 6, 11].includes(chandrabalaH)) {
    moorthiFormLabel = t('Swarna Moorti (Golden Form)', 'स्वर्ण मूर्ति (सुनको पाउ — अति शुभ)');
    moorthiExplanation = t(
      'Today’s lunar alignment carries Swarna (Golden) resonance—amplifying constructive transit blessings and cushioning friction.',
      'चन्द्रबल १/६/११ मा रहँदा स्वर्ण मूर्ति प्रभाव सक्रिय छ, जसले शुभ गोचरको फल बढाउँछ र कठिनाइलाई सहज बनाउँछ।'
    );
  } else if ([2, 5, 9].includes(chandrabalaH)) {
    moorthiFormLabel = t('Rajata Moorti (Silver Form)', 'रजत मूर्ति (चाँदीको पाउ — शुभ)');
    moorthiExplanation = t(
      'Silver-form lunar harmony supports steady financial progress, goodwill, and clear-headed decisions.',
      'रजत मूर्ति प्रभावले आर्थिक प्रगति, मानसिक शान्ति र शुभ परिणामलाई बल दिन्छ।'
    );
  } else if ([3, 7, 10].includes(chandrabalaH)) {
    moorthiFormLabel = t('Tamra Moorti (Copper Form)', 'ताम्र मूर्ति (तामाको पाउ — मध्यम/परिश्रम)');
    moorthiExplanation = t(
      'Copper-form alignment rewards practical effort and follow-through—results arrive steadily through active work.',
      'ताम्र मूर्तिमा निरन्तर मिहिनेत र व्यावहारिक कार्ययोजनाबाट सन्तोषजनक प्रतिफल मिल्छ।'
    );
  } else {
    moorthiFormLabel = t('Loha Moorti (Iron Form)', 'लोह मूर्ति (फलामको पाउ — संयम आवश्यक)');
    moorthiExplanation = t(
      'Iron-form alignment advises unhurried patience, extra rest, and sticking to well-tested plans rather than impulsive risks.',
      'लोह मूर्तिमा हतार नगरी धैर्य, विश्राम र सावधानीपूर्वक काम गर्दा अनावश्यक तनाव टर्छ।'
    );
  }

  const nodalTransitNote = isNe
    ? `हाल गोचरमा राहु ${trSign(ZODIAC_SIGNS[rahSign].name, 'ne')} राशि (चन्द्रबाट भाव ${rahFromMoon}: ${trHouseGuide(rahFromMoon, 'ne').shortTitle}) र केतु ${trSign(ZODIAC_SIGNS[ketSign].name, 'ne')} राशि (चन्द्रबाट भाव ${ketFromMoon}: ${trHouseGuide(ketFromMoon, 'ne').shortTitle}) मा भ्रमण गर्दैछन्—जसले आगामी १८ महिनासम्म ${trHouseGuide(rahFromMoon, 'ne').shortTitle} क्षेत्रमा नयाँ सिकाइ र विस्तारको अवसर खोल्छ।`
    : `Right now, transiting Rahu crosses ${ZODIAC_SIGNS[rahSign].name} (House ${rahFromMoon} from your Moon: ${trHouseGuide(rahFromMoon, 'en').shortTitle}) while Ketu crosses ${ZODIAC_SIGNS[ketSign].name} (House ${ketFromMoon}: ${trHouseGuide(ketFromMoon, 'en').shortTitle})—spotlighting fresh growth in ${trHouseGuide(rahFromMoon, 'en').lifeAreas.toLowerCase()} while simplifying old attachments in ${trHouseGuide(ketFromMoon, 'en').shortTitle.toLowerCase()}.`;

  const mahaLordId = vedicReport.activeMahadasha.lord;
  const mahaLabel = trPlanet(mahaLordId, lang);
  const subPeriods: SubPeriodRoadmapItem[] = vedicReport.activeMahadasha.antardashas.map((ad) => {
    const antarGuide = trDashaGuide(ad.lord, lang);
    const antarD1House = houseFrom(lagnaSignIdx, getD1Sign(ad.lord));
    const antarHouseGuide = trHouseGuide(antarD1House, lang);
    const status: SubPeriodRoadmapItem['status'] = ad.isCurrent
      ? 'ACTIVE'
      : ad.endDate < generatedDateIso
      ? 'PAST'
      : 'UPCOMING';

    const laymanGuidance = isNe
      ? `${mahaLabel} महादशाभित्र ${trPlanet(ad.lord, 'ne')} अन्तर्दशाले कुण्डलीको भाव ${antarD1House} (${antarHouseGuide.shortTitle}) सक्रिय पार्छ। ध्यान दिनुहोस्: ${antarGuide.bestFocus}`
      : `Inside your ${mahaLordId} Major Chapter, this ${ad.lord} sub-period activates House ${antarD1House} (${antarHouseGuide.shortTitle}). Focus on: ${antarGuide.bestFocus}`;

    return {
      antarLordId: ad.lord,
      antarLordLabel: trPlanet(ad.lord, lang),
      startDate: ad.startDate,
      endDate: ad.endDate,
      status,
      themeTitle: antarGuide.chapterTitle,
      laymanGuidance,
    };
  });

  // ==================== 8. DEEP 9-PLANET READING CARDS ====================
  const deepPlanetCards: DeepPlanetReadingCard[] = coreNinePlanets.map((p) => {
    const baseId = p.name.includes('Rahu')
      ? 'Rahu'
      : p.name.includes('Ketu')
      ? 'Ketu'
      : p.id;
    const div = getDivEntry(baseId);
    const d1SignIdx = div ? div.d1Sign : Math.floor(norm360(p.siderealLongitude) / 30);
    const d9Idx = div ? div.d9Sign : d1SignIdx;
    const d10Idx = div ? div.d10Sign : d1SignIdx;
    const isVargottama = Boolean(div?.isVargottama);
    const houseNum = p.house;
    const hGuide = trHouseGuide(houseNum, lang);
    const ruled = housesRuledByPlanet[baseId] || [];
    const treatise = PLANET_TREATISES[baseId];
    const bphsRuling =
      PLANET_IN_BHAVA_RULINGS[baseId]?.[houseNum] || hGuide.plainDescription;

    const ruledTextEn =
      ruled.length > 0
        ? `, carrying the stewardship of House ${ruled.join(' & ')} into House ${houseNum}`
        : '';
    const ruledTextNe =
      ruled.length > 0
        ? ` र भाव ${ruled.join(' तथा ')} को स्वामित्व बोकेर भाव ${houseNum} सँग जोडिन्छ`
        : '';

    const laymanSynthesis = isNe
      ? `${trPlanet(baseId, 'ne')} ग्रह ${trSign(p.signName, 'ne')} राशि (${p.formattedDMS}) र ${trNakshatra(p.nakshatraName, 'ne')} नक्षत्र (चरण ${p.nakshatraPada}) मा बसी भाव ${houseNum} (${hGuide.shortTitle}) लाई सक्रिय बनाउँछ${ruledTextNe}। ${hGuide.plainDescription}${
          isVargottama
            ? ' यो ग्रह वर्गोत्तम (D1 र D9 दुवैमा एउटै राशि) भएकाले जीवनभर अतिरिक्त आन्तरिक बल प्रदान गर्दछ।'
            : ''
        }`
      : `${baseId} sits in ${p.signName} (${p.formattedDMS}) inside ${p.nakshatraName} Star (Pada ${p.nakshatraPada})${ruledTextEn}. In everyday life, it channels your ${trPlanetRole(baseId, 'en').toLowerCase()} directly into ${hGuide.lifeAreas.toLowerCase()}.${
          isVargottama
            ? ' Because it is Vargottama (occupying the exact same sign in both D1 and D9 Navamsha), its positive promise grows remarkably steady with age.'
            : ''
        }`;

    return {
      planetId: baseId,
      planetLabel: trPlanet(baseId, lang),
      symbol: p.symbol,
      color: p.color,
      signLabel: trSign(p.signName, lang),
      degreeDMS: p.formattedDMS,
      house: houseNum,
      houseTitle: hGuide.shortTitle,
      housesRuled: ruled,
      nakshatraLabel: trNakshatra(p.nakshatraName, lang),
      nakshatraIndex: p.nakshatraIndex,
      pada: p.nakshatraPada,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
      isVargottama,
      d9SignLabel: trSign(ZODIAC_SIGNS[d9Idx].name, lang),
      d10SignLabel: trSign(ZODIAC_SIGNS[d10Idx].name, lang),
      roleSubtitle: trPlanetRole(baseId, lang),
      laymanSynthesis,
      classicalBphsRuling: bphsRuling,
      growthLesson: treatise?.vedicSoulLesson || hGuide.whenStrong,
    };
  });

  // ==================== 9. DEEP NUMEROLOGY (CHEIRO + DECOZ) ====================
  const lpFinal = numerologyReport.lifePath.final;
  const lpGuide =
    CORE_NUMEROLOGY_DEEP_GUIDE[lpFinal] ||
    CORE_NUMEROLOGY_DEEP_GUIDE[numerologyReport.lifePath.singleDigit] ||
    CORE_NUMEROLOGY_DEEP_GUIDE[1];

  const expCompound = numerologyReport.expression.compound;
  const lpCompound = numerologyReport.lifePath.compound;
  const reduceToCheiro = (n: number): number => {
    let v = n;
    while (v > 52) {
      v = String(v)
        .split('')
        .reduce((a, d) => a + parseInt(d, 10), 0);
    }
    return v;
  };
  const cheiroTarget =
    CHEIRO_COMPOUND_KEYNOTES[reduceToCheiro(lpCompound)] ||
    CHEIRO_COMPOUND_KEYNOTES[reduceToCheiro(expCompound)] ||
    CHEIRO_COMPOUND_KEYNOTES[10 + numerologyReport.lifePath.singleDigit] ||
    CHEIRO_COMPOUND_KEYNOTES[19];

  const matGuide =
    CORE_NUMEROLOGY_DEEP_GUIDE[numerologyReport.maturity.final] ||
    CORE_NUMEROLOGY_DEEP_GUIDE[numerologyReport.maturity.singleDigit] ||
    CORE_NUMEROLOGY_DEEP_GUIDE[1];

  const karmicLessonsItems =
    numerologyReport.karmicLessons.length > 0
      ? numerologyReport.karmicLessons
          .map((d) => {
            const g = CORE_NUMEROLOGY_DEEP_GUIDE[d];
            if (!g) return '';
            return isNe ? g.karmicLessonNe : g.karmicLessonEn;
          })
          .filter(Boolean)
      : [
          t(
            'Full 1–9 Spectrum Present: Every single digit 1 through 9 appears in your birth name—granting unusually well-rounded adaptability across life.',
            'पूर्ण १–९ अक्षर सन्तुलन: तपाईंको जन्म नाममा १ देखि ९ सम्मका सबै अंकको उपस्थिति रहेकाले बहुमुखी सन्तुलन प्राप्त छ।'
          ),
        ];

  const pinnacleRoadmap = numerologyReport.pinnacles.map((pin, idx) => {
    const ch = numerologyReport.challenges[idx];
    const endAgeNum = typeof pin.endAge === 'number' ? pin.endAge : 120;
    const isCurrent = currentAge >= pin.startAge && currentAge <= endAgeNum;
    const pinGuide =
      CORE_NUMEROLOGY_DEEP_GUIDE[pin.number] ||
      CORE_NUMEROLOGY_DEEP_GUIDE[pin.number % 9 || 9] ||
      CORE_NUMEROLOGY_DEEP_GUIDE[1];
    const ageSpan =
      pin.endAge === 'Life'
        ? t(`Age ${pin.startAge}+`, `उमेर ${pin.startAge}+`)
        : t(`Ages ${pin.startAge}–${pin.endAge}`, `उमेर ${pin.startAge}–${pin.endAge}`);
    return {
      label: pin.label,
      ageSpan,
      number: pin.number,
      challenge: ch?.number ?? 0,
      isCurrent,
      meaning: isNe ? pinGuide.deepMeaningNe : pinGuide.deepMeaningEn,
    };
  });

  // ==================== 10. 5-DOMAIN SCORECARD ====================
  const h1Bindus = vedicReport.sarvashtakavarga.find((s) => s.house === 1)?.bindus ?? 28;
  const h4Bindus = vedicReport.sarvashtakavarga.find((s) => s.house === 4)?.bindus ?? 28;
  const h5Bindus = vedicReport.sarvashtakavarga.find((s) => s.house === 5)?.bindus ?? 28;
  const h9Bindus = vedicReport.sarvashtakavarga.find((s) => s.house === 9)?.bindus ?? 28;

  const careerScore = clampScore(58 + (h10Bindus - 22) * 1.9 + (vedicReport.yogas.length > 1 ? 6 : 2));
  const wealthScore = clampScore(
    58 + ((savingsBindusH2 + gainsBindusH11) / 2 - 22) * 1.8 + beneficOnIndu.length * 4
  );
  const relScore = clampScore(59 + (h7Bindus - 22) * 1.8 + (jupInfo.isGuruBala ? 5 : 2));
  const vitScore = clampScore(60 + ((h1Bindus + h6Bindus) / 2 - 22) * 1.8);
  const wisScore = clampScore(61 + ((h5Bindus + h9Bindus + h4Bindus) / 3 - 22) * 1.9);

  const scoreBadge = (sc: number): { label: string; tone: 'optimal' | 'favorable' | 'mixed' } => {
    if (sc >= 82)
      return { label: t('Strong Tailwind', 'उच्च सबल'), tone: 'optimal' };
    if (sc >= 72)
      return { label: t('Steady Growth', 'सन्तुलित प्रगति'), tone: 'favorable' };
    return { label: t('Structured Effort', 'धैर्यपूर्ण उन्नति'), tone: 'mixed' };
  };

  const domainScorecard: LifeDomainScorecardItem[] = [
    {
      id: 'CAREER',
      title: t('Career & Authority', 'करियर र नेतृत्व'),
      score: careerScore,
      verdictLabel: scoreBadge(careerScore).label,
      tone: scoreBadge(careerScore).tone,
      summary: isNe ? tenthLordGuide.headlineNe : tenthLordGuide.headlineEn,
      classicalDriver: isNe
        ? `दशमेश ${trPlanet(tenthLordId, 'ne')} भाव ${tenthLordHouse} • D10 ${dikpala.deity} • दशम ${h10Bindus} अंक`
        : `10th Lord ${trPlanet(tenthLordId, lang)} in H${tenthLordHouse} • D10 ${dikpala.deity} • H10 ${h10Bindus} pts`,
    },
    {
      id: 'WEALTH',
      title: t('Wealth & Assets', 'धन र सम्पत्ति'),
      score: wealthScore,
      verdictLabel: scoreBadge(wealthScore).label,
      tone: scoreBadge(wealthScore).tone,
      summary: induStrengthTier,
      classicalDriver: isNe
        ? `इन्दु लग्न ${induSignLabel} • बचत ${savingsBindusH2} / लाभ ${gainsBindusH11} अंक`
        : `Indu Lagna ${induSignLabel} • H2 ${savingsBindusH2} / H11 ${gainsBindusH11} pts`,
    },
    {
      id: 'RELATIONSHIPS',
      title: t('Love & Partnerships', 'प्रेम र साझेदारी'),
      score: relScore,
      verdictLabel: scoreBadge(relScore).label,
      tone: scoreBadge(relScore).tone,
      summary: isNe ? dkPortrait.archetypeNe : dkPortrait.archetypeEn,
      classicalDriver: isNe
        ? `उपपद ${ulSignLabel} • दाराकारक ${trPlanet(dkBaseId, 'ne')} • सप्तम ${h7Bindus} अंक`
        : `UL ${ulSignLabel} • DK ${trPlanet(dkBaseId, lang)} • H7 ${h7Bindus} pts`,
    },
    {
      id: 'VITALITY',
      title: t('Health & Stamina', 'स्वास्थ्य र ऊर्जा'),
      score: vitScore,
      verdictLabel: scoreBadge(vitScore).label,
      tone: scoreBadge(vitScore).tone,
      summary: isNe
        ? `${dominantDosha} — नियमित दिनचर्या र जीवनशक्ति`
        : `${dominantDosha} — Daily Rhythm & Stamina`,
      classicalDriver: isNe
        ? `वात ${vataPercent}% / पित्त ${pittaPercent}% / कफ ${kaphaPercent}% • लग्न ${h1Bindus} अंक`
        : `Vata ${vataPercent}% / Pitta ${pittaPercent}% / Kapha ${kaphaPercent}% • H1 ${h1Bindus} pts`,
    },
    {
      id: 'WISDOM',
      title: t('Purpose & Inner Peace', 'प्रज्ञा र मानसिक शान्ति'),
      score: wisScore,
      verdictLabel: scoreBadge(wisScore).label,
      tone: scoreBadge(wisScore).tone,
      summary: isNe ? akPath.titleNe : akPath.titleEn,
      classicalDriver: isNe
        ? `आत्मकारक ${trPlanet(akBaseId, 'ne')} • कारकांश ${trSign(ZODIAC_SIGNS[karakamshaIdx].name, 'ne')} • नवम ${h9Bindus} अंक`
        : `AK ${trPlanet(akBaseId, lang)} • Karakamsha ${trSign(ZODIAC_SIGNS[karakamshaIdx].name, lang)} • H9 ${h9Bindus} pts`,
    },
  ];

  return {
    generatedDateIso,
    currentAge,
    unknownBirthTimeNote,
    domainScorecard,
    identityAndSoul: {
      arudhaLagnaSign: arudhaSignLabel,
      arudhaHouseFromLagna,
      innerVsOuterNarrative,
      atmakarakaPlanet: `${trPlanet(akBaseId, lang)} (${akKaraka.degreeInSign})`,
      karakamshaSign: trSign(ZODIAC_SIGNS[karakamshaIdx].name, lang),
      atmakarakaTitle: isNe ? akPath.titleNe : akPath.titleEn,
      atmakarakaNarrative: isNe ? akPath.lessonNe : akPath.lessonEn,
      rahuHouse,
      ketuHouse,
      ketuComfortGift: isNe ? axisGuide.ketuGiftNe : axisGuide.ketuGiftEn,
      rahuGrowthEdge: isNe ? axisGuide.rahuGrowthNe : axisGuide.rahuGrowthEn,
      ascendantSabian: ascSabianPlanet.sabianSymbol,
      sunSabian: sunPlanet.sabianSymbol,
      sourceCitation: 'Jaimini Upadesha Sutras (Adhyaya 1) • BPHS Ch. 29 & 32 • Dane Rudhyar Sabian Mandala',
    },
    careerBlueprint: {
      tenthHouseSign: trSign(ZODIAC_SIGNS[tenthSignIdx].name, lang),
      tenthLordPlanet: trPlanet(tenthLordId, lang),
      tenthLordHouse,
      headline: isNe ? tenthLordGuide.headlineNe : tenthLordGuide.headlineEn,
      workStyleMode,
      laymanNarrative: isNe ? tenthLordGuide.laymanMeaningNe : tenthLordGuide.laymanMeaningEn,
      amatyakarakaPlanet: `${trPlanet(amkBaseId, lang)} (${amkKaraka.degreeInSign})`,
      amatyakarakaNote: isNe
        ? `जैमिनी अमात्यकारक ग्रह ${trPlanet(amkBaseId, 'ne')} ले पेशागत निर्णयमा ${trPlanetRole(amkBaseId, 'ne')} जोड्दा छिटो पदोन्नति र विश्वास दिलाउँछ।`
        : `Your Jaimini Career Minister (Amatyakaraka) is ${amkBaseId}, adding ${trPlanetRole(amkBaseId, 'en').toLowerCase()} to how you win professional trust.`,
      dikpalaDeity: dikpala.deity,
      dikpalaDirection: isNe ? dikpala.directionNe : dikpala.directionEn,
      dikpalaArchetype: isNe ? dikpala.archetypeNe : dikpala.archetypeEn,
      dikpalaStyle: isNe ? dikpala.laymanCareerStyleNe : dikpala.laymanCareerStyleEn,
      kpCusp10SubLord: trPlanet(kpCusp10.subLord, lang),
      kpCareerNote: isNe
        ? `केपी ज्योतिष अनुसार दशम भावको सब-लर्ड ${trPlanet(kpCusp10.subLord, 'ne')} (${trPlanet(kpCusp10.starLord, 'ne')} नक्षत्र) रहेकाले ${trPlanetRole(kpCusp10.subLord, 'ne')} सँग जोडिएका कामबाट ठोस परिणाम निस्कन्छ।`
        : `In KP Stellar Astrology (KP Reader IV), your 10th Cusp Sub-Lord is ${kpCusp10.subLord} (in ${kpCusp10.starLord}’s star)—confirming tangible career breakthroughs through ${trPlanetRole(kpCusp10.subLord, 'en').toLowerCase()}.`,
      recommendedLanes: mergedCareers,
      careerActionTip: isNe
        ? `आफ्नो मुख्य कार्यक्षेत्रमा ${trHouseGuide(tenthLordHouse, 'ne').shortTitle} सँग जोडिएको सीपलाई प्राथमिकता दिनुहोस् र महत्त्वपूर्ण करियर सम्झौता ${synthesisReport.bestWindowToday} भित्र अघि बढाउनुहोस्।`
        : `Lean deliberately into roles combining ${tenthLordGuide.modernCareersEn[0]} and ${tenthLordGuide.modernCareersEn[1]}—your chart rewards depth of ownership over generic job-hopping.`,
      sourceCitation: `${tenthLordGuide.sourceRef} • BPHS Ch. 7 (Dashamsha Dikpalas) • KP Reader IV`,
    },
    wealthBlueprint: {
      induLagnaSign: induSignLabel,
      induHouseFromLagna,
      induKalasTrail: `${ninthLagnaLord} (${kalaA}) + ${ninthMoonLord} (${kalaB}) = ${totalKalas} -> #${remKalas} from Moon`,
      induStrengthTier,
      induNarrative,
      suryaHoraPercent,
      chandraHoraPercent,
      horaEarningStyleTitle,
      horaEarningNarrative,
      savingsBindusH2,
      gainsBindusH11,
      expenseBindusH12,
      cashflowVsRetentionAdvice,
      sourceCitation: 'Kalidasa’s Uttara Kalamrita (Khanda 4, Shloka 27) • BPHS Ch. 7 (D2 Hora) & Ch. 66 (Ashtakavarga)',
    },
    relationshipBlueprint: {
      seventhHouseSign: trSign(ZODIAC_SIGNS[seventhSignIdx].name, lang),
      seventhLordPlanet: trPlanet(seventhLordId, lang),
      seventhLordHouse,
      upapadaLagnaSign: ulSignLabel,
      darakarakaPlanet: `${trPlanet(dkBaseId, lang)} (${dkKaraka.degreeInSign})`,
      partnerArchetypeTitle: isNe ? dkPortrait.archetypeNe : dkPortrait.archetypeEn,
      partnerPortraitNarrative: isNe ? dkPortrait.partnerQualitiesNe : dkPortrait.partnerQualitiesEn,
      marriageEnvironmentNarrative,
      navamshaD9Note,
      marsBalanceHeadline,
      marsBalanceExplanation,
      goldenRelationshipRule: isNe ? dkPortrait.relationshipAdviceNe : dkPortrait.relationshipAdviceEn,
      sourceCitation: 'Jaimini Upadesha Sutras (Upapada & Darakaraka) • BPHS Ch. 24 • Phaladeepika Ch. 7 & 8',
    },
    wellnessBlueprint: {
      dominantDosha,
      vataPercent,
      pittaPercent,
      kaphaPercent,
      constitutionSummary: isNe ? dGuide.elementNe : dGuide.elementEn,
      naturalStrength: isNe ? dGuide.giftNe : dGuide.giftEn,
      stressSignalToWatch: isNe ? dGuide.whenStressedNe : dGuide.whenStressedEn,
      foodAndHydrationTip: isNe ? dGuide.dailyFoodHabitNe : dGuide.dailyFoodHabitEn,
      movementAndSleepTip: isNe ? dGuide.movementAndSleepNe : dGuide.movementAndSleepEn,
      sixthHouseResilienceNote,
      sourceCitation: 'Dr. David Frawley (Ayurvedic Astrology) • Varahamihira’s Brihat Jataka Ch. 1 & 2',
    },
    maturityMilestones,
    liveSkyAndSubPeriods: {
      saturnTransitSign: trSign(ZODIAC_SIGNS[satSign].name, lang),
      saturnHouseFromMoon: satFromMoon,
      isSadeSati,
      saturnPhaseHeadline: isNe ? satInfo.phaseNameNe : satInfo.phaseNameEn,
      saturnTone: satInfo.tone,
      saturnGuidance: isNe ? satInfo.summaryNe : satInfo.summaryEn,
      jupiterTransitSign: trSign(ZODIAC_SIGNS[jupSign].name, lang),
      jupiterHouseFromMoon: jupFromMoon,
      hasGuruBala: jupInfo.isGuruBala,
      jupiterHeadline: isNe ? jupInfo.headlineNe : jupInfo.headlineEn,
      jupiterGuidance: isNe ? jupInfo.noteNe : jupInfo.noteEn,
      rahuTransitSign: trSign(ZODIAC_SIGNS[rahSign].name, lang),
      rahuHouseFromMoon: rahFromMoon,
      ketuTransitSign: trSign(ZODIAC_SIGNS[ketSign].name, lang),
      ketuHouseFromMoon: ketFromMoon,
      nodalTransitNote,
      moorthiFormLabel,
      moorthiExplanation,
      activeMahadashaLabel: `${mahaLabel} (${vedicReport.activeMahadasha.startDate} -> ${vedicReport.activeMahadasha.endDate})`,
      subPeriods,
      sourceCitation: 'Mantreshwara’s Phaladeepika (Ch. 26 Gochara) • Traditional Moorthi Nirnaya • BPHS Vimshottari',
    },
    deepPlanetCards,
    deepNumerology: {
      lifePathHeadline: `Life Path #${lpFinal} (${numerologyReport.lifePath.trail}) — ${
        isNe ? lpGuide.titleNe : lpGuide.titleEn
      }`,
      lifePathDeepNarrative: isNe ? lpGuide.deepMeaningNe : lpGuide.deepMeaningEn,
      compoundTitle: cheiroTarget.titleEn,
      compoundNarrative: isNe ? cheiroTarget.meaningNe : cheiroTarget.meaningEn,
      maturityNumberLabel: `#${numerologyReport.maturity.final} (${
        isNe ? matGuide.titleNe : matGuide.titleEn
      })`,
      maturityNarrative: isNe
        ? `परिपक्वता अंक #${numerologyReport.maturity.final} उमेर ३५–४० पछि क्रमशः सक्रिय हुन्छ: ${matGuide.deepMeaningNe}`
        : `Your Maturity Number #${numerologyReport.maturity.final} blossoms increasingly from age 35 onward—blending your birth path and name into ${matGuide.deepMeaningEn.toLowerCase()}`,
      karmicLessonsTitle:
        numerologyReport.karmicLessons.length > 0
          ? t(
              `Missing-Digit Growth Lessons (${numerologyReport.karmicLessons.map((n) => `#${n}`).join(', ')})`,
              `जन्म नाममा अनुपस्थित अंकका विकास पाठ (${numerologyReport.karmicLessons.map((n) => `#${n}`).join(', ')})`
            )
          : t('Complete 1–9 Name Spectrum', 'पूर्ण १–९ नाम-अंक सन्तुलन'),
      karmicLessonsItems,
      pinnacleRoadmap,
      sourceCitation: `Cheiro’s Book of Numbers (Ch. 3 Compound Keynotes) • Hans Decoz (${
        DECOZ_COLORS[numerologyReport.personalYear.singleDigit]?.name || 'World Numerology'
      })`,
    },
    bibliography: REPORT_BOOK_BIBLIOGRAPHY,
  };
}
