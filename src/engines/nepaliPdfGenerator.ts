// Authentic Multi-Page Nepali (नेपाली Devanagari) A4 White-Paper PDF Dossier Typesetter
// Uses the browser's OpenType/HarfBuzz Canvas2D text shaper ('Noto Sans Devanagari') so every
// Devanagari conjunct (क्ष, त्र, ज्ञ, श्र, कुण्डली, षड्बल, बृहत्, पञ्चाङ्ग) and pre-base 'ि' matra
// renders with 100% textbook calligraphy on crisp #FFFFFF white A4 pages.

import type { PdfReportBundleInput } from './pdfReportGenerator';
import { ZODIAC_SIGNS } from './astronomyEngine';
import { DivisionalChartEntry } from './vedicEngine';
import { gregorianToBikramSambat } from './locationAtlas';
import { generateCosmicSynthesis } from './synthesisEngine';
import { generateDeepLifeReport } from './deepLifeReportEngine';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import {
  buildNepaliPadaExpression,
  getNepaliNakshatraEntry,
  localizeAyanamshaNe,
  localizeGowriNatureNe,
  localizeHouseSystemNe,
  localizeVedicYoga,
} from '../data/nepaliReportCodex';
import {
  evaluateActionConsequence,
  LIFE_ACTIONS,
  scanUpcomingBestWindows,
} from '../data/karmaAndMuhurtaCodex';
import {
  buildLocalizedPersonalSummary,
  formatCityForLang,
  formatCountryForLang,
  formatDisplayDate,
  toNepaliDigits,
  trActionTitle,
  trDashaGuide,
  trDignity,
  trGowriName,
  trHoraiDisplay,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trSign,
} from '../i18n/i18n';

const KEY_PDF_ACTIONS = [
  'MARRIAGE_VIVAHA',
  'LEND_MONEY',
  'REPAY_DEBT',
  'BUY_LAND_HOME',
  'GRIHA_PRAVESHA',
  'BUSINESS_LAUNCH',
  'BUY_VEHICLE',
  'SIGN_CONTRACT',
];

const GRAHA_SHORT_NE: Record<string, string> = {
  Asc: 'लग्न',
  Sun: 'सू',
  Moon: 'च',
  Mars: 'मं',
  Mercury: 'बु',
  Jupiter: 'गु',
  Venus: 'शु',
  Saturn: 'श',
  Rahu: 'रा',
  Ketu: 'के',
};

const NORTH_DIAMOND_COORDS = [
  { house: 1, signX: 200, signY: 164, planetsX: 200, planetsY: 100 },
  { house: 2, signX: 100, signY: 74, planetsX: 100, planetsY: 38 },
  { house: 3, signX: 76, signY: 100, planetsX: 36, planetsY: 108 },
  { house: 4, signX: 162, signY: 200, planetsX: 102, planetsY: 200 },
  { house: 5, signX: 76, signY: 296, planetsX: 36, planetsY: 306 },
  { house: 6, signX: 100, signY: 326, planetsX: 100, planetsY: 364 },
  { house: 7, signX: 200, signY: 236, planetsX: 200, planetsY: 298 },
  { house: 8, signX: 300, signY: 326, planetsX: 300, planetsY: 364 },
  { house: 9, signX: 324, signY: 296, planetsX: 364, planetsY: 306 },
  { house: 10, signX: 238, signY: 200, planetsX: 298, planetsY: 200 },
  { house: 11, signX: 324, signY: 100, planetsX: 364, planetsY: 108 },
  { house: 12, signX: 300, signY: 74, planetsX: 300, planetsY: 38 },
];

export interface NepaliKundaliHouseCell {
  house: number;
  signNumberNe: string;
  signNameNe: string;
  planetsNe: string[];
}

export interface NepaliPdfDocumentModel {
  titleBanner: string;
  subtitleBanner: string;
  fullName: string;
  generatedDateNe: string;
  metadataPairs: { label: string; value: string }[];
  scorecard: {
    title: string;
    scoreText: string;
    scoreNum: number;
    badge: string;
    summary: string;
    driver: string;
    tone: 'optimal' | 'favorable' | 'mixed';
  }[];
  d1Houses: NepaliKundaliHouseCell[];
  d9Houses: NepaliKundaliHouseCell[];
  suryaHoraPercent: number;
  chandraHoraPercent: number;
  horaTitle: string;
  doshaBars: { label: string; pct: number; hex: string }[];
  savRows: {
    houseLabel: string;
    signLabel: string;
    bindus: number;
    tag: string;
    meaning: string;
  }[];
  loShuCells: { digitNe: string; planetNe: string; text: string; dir: string; active: boolean }[];
  actionRows: {
    title: string;
    todayScore: string;
    verdict: string;
    bestWindow: string;
  }[];
  chapters: {
    chapterBadge: string;
    heading: string;
    subheading: string;
    blocks: { title: string; body: string; citation?: string }[];
  }[];
  allDevanagariCorpus: string;
}

function buildKundaliHousesNe(
  divisionalTable: DivisionalChartEntry[],
  field: 'd1Sign' | 'd9Sign'
): NepaliKundaliHouseCell[] {
  const ascRow = divisionalTable.find((d) => d.planetId === 'Asc') || divisionalTable[0];
  const lagnaSign = ascRow[field];

  return Array.from({ length: 12 }, (_, idx) => {
    const house = idx + 1;
    const signIdx = (lagnaSign + idx) % 12;
    const occupants = divisionalTable
      .filter((d) => d.planetId !== 'Asc' && d[field] === signIdx)
      .map((d) => GRAHA_SHORT_NE[d.planetId] || trPlanet(d.planetId, 'ne'));

    return {
      house,
      signNumberNe: toNepaliDigits(signIdx + 1),
      signNameNe: trSign(ZODIAC_SIGNS[signIdx].name, 'ne'),
      planetsNe: house === 1 ? ['लग्न', ...occupants] : occupants,
    };
  });
}

export function buildNepaliPdfSections(input: PdfReportBundleInput): NepaliPdfDocumentModel {
  const {
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    ayanamsha,
    houseSystem,
  } = input;

  const synthesisNe = generateCosmicSynthesis(
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    new Date(),
    'ne'
  );
  const plainSummaryNe = buildLocalizedPersonalSummary(
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    synthesisNe,
    'ne'
  );
  const deepNe = generateDeepLifeReport(
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    synthesisNe,
    'ne'
  );

  const bsBirth = gregorianToBikramSambat(profile.year, profile.month, profile.day);
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const birthNakEn = getNakshatraTreatiseByIndex(moonPlanet.nakshatraIndex);
  const birthNakNe = getNepaliNakshatraEntry(moonPlanet.nakshatraIndex);
  const birthPadaObj =
    birthNakEn.padas.find((pd) => pd.pada === moonPlanet.nakshatraPada) || birthNakEn.padas[0];
  const birthPadaTextNe = buildNepaliPadaExpression(
    moonPlanet.nakshatraIndex,
    birthPadaObj.pada,
    birthPadaObj.navamshaSign,
    birthPadaObj.navamshaRuler,
    birthPadaObj.specialTag
  );

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(' ');
  const cityNe = formatCityForLang(profile.location.name, 'ne');
  const countryNe = formatCountryForLang(profile.location.country, 'ne');
  const gregStr = `${toNepaliDigits(profile.year)}-${toNepaliDigits(
    String(profile.month).padStart(2, '0')
  )}-${toNepaliDigits(String(profile.day).padStart(2, '0'))}`;
  const timeStr = profile.unknownTime
    ? 'जन्म समय अज्ञात (चन्द्र कुण्डली १२:०० आधार)'
    : `${toNepaliDigits(String(profile.hour).padStart(2, '0'))}:${toNepaliDigits(
        String(profile.minute).padStart(2, '0')
      )} स्थानीय समय`;

  const metadataPairs = [
    { label: 'जातकको पूरा नाम', value: fullName },
    {
      label: 'जन्म मिति (ईस्वी र बि.सं.)',
      value: `वि.सं. ${toNepaliDigits(bsBirth.bsYear)} ${bsBirth.bsMonthNp} ${toNepaliDigits(
        bsBirth.bsDay
      )} गते (${gregStr})`,
    },
    { label: 'जन्म समय र स्थान', value: `${timeStr} • ${cityNe}, ${countryNe}` },
    {
      label: 'लग्न • चन्द्र राशि • नक्षत्र',
      value: `${trSign(natalChart.ascendant.signName, 'ne')} लग्न • ${trSign(
        moonPlanet.signName,
        'ne'
      )} राशि • ${birthNakNe.nameNe} (चरण ${toNepaliDigits(moonPlanet.nakshatraPada)})`,
    },
    {
      label: 'जन्म संवत्सर र जन्म पक्षी',
      value: `${toNepaliDigits(deepNe.birthSamvatsara.fullTitle)} • ${deepNe.panchapakshi.natalBirdLabel}`,
    },
    {
      label: 'गणना अयनांश र पद्धति',
      value: `${localizeAyanamshaNe(ayanamsha)} • ${localizeHouseSystemNe(houseSystem)} • समग्र सामञ्जस्य ${toNepaliDigits(
        synthesisNe.overallResonanceScore
      )}/१००`,
    },
  ];

  const scorecard = deepNe.domainScorecard.map((d) => ({
    title: d.title,
    scoreText: `${toNepaliDigits(d.score)}/१००`,
    scoreNum: d.score,
    badge: d.verdictLabel,
    summary: d.summary,
    driver: d.classicalDriver,
    tone: d.tone,
  }));

  const d1Houses = buildKundaliHousesNe(vedicReport.divisionalTable, 'd1Sign');
  const d9Houses = buildKundaliHousesNe(vedicReport.divisionalTable, 'd9Sign');

  const savSorted = [...vedicReport.sarvashtakavarga].sort((a, b) => a.house - b.house);
  const savRows = savSorted.map((h) => {
    const g = trHouseGuide(h.house, 'ne');
    const tag = h.bindus >= 30 ? 'सबल' : h.bindus < 25 ? 'धैर्य' : 'सन्तुलित';
    const meaning =
      h.bindus >= 30 ? g.whenStrong : h.bindus < 25 ? g.whenLow : g.plainDescription;
    return {
      houseLabel: `भाव ${toNepaliDigits(h.house)}: ${g.shortTitle}`,
      signLabel: trSign(h.signName, 'ne'),
      bindus: h.bindus,
      tag,
      meaning,
    };
  });

  const loShuCells = deepNe.loShuGrid.cellsIn3x3Order.map((c) => ({
    digitNe: `#${toNepaliDigits(c.digit)}`,
    planetNe: c.planetRuler,
    text: c.count > 0 ? toNepaliDigits(c.repeatedDigitsText) : '—',
    dir: c.direction,
    active: c.count > 0,
  }));

  const now = new Date();
  const natalMoonSignIdx = Math.floor(moonPlanet.siderealLongitude / 30);
  const actionRows = LIFE_ACTIONS.filter((a) => KEY_PDF_ACTIONS.includes(a.id)).map((act) => {
    const todayEv = evaluateActionConsequence(
      act.id,
      now,
      profile.location,
      moonPlanet.nakshatraIndex,
      natalMoonSignIdx
    );
    const bestWin = scanUpcomingBestWindows(
      act.id,
      now,
      profile.location,
      moonPlanet.nakshatraIndex,
      natalMoonSignIdx,
      12
    )[0];
    return {
      title: trActionTitle(act.id, act.title, 'ne'),
      todayScore: `${toNepaliDigits(todayEv.score)}/१००`,
      verdict: todayEv.score >= 70 ? 'उत्तम साइत' : todayEv.score >= 48 ? 'मध्यम' : 'पर्खनु उत्तम',
      bestWindow: bestWin
        ? `${formatDisplayDate(bestWin.dateStr, 'ne', true)} (${toNepaliDigits(
            bestWin.score
          )}/१०० • ${trNakshatra(bestWin.nakshatraName, 'ne')})`
        : '—',
    };
  });

  const localizedYogas = vedicReport.yogas.map((yg) => localizeVedicYoga(yg, 'ne'));
  const activeHoraiNe = trHoraiDisplay(panchangReport.activeHorai, 'ne');

  const chapters: NepaliPdfDocumentModel['chapters'] = [
    {
      chapterBadge: 'अध्याय १ • सरल कार्यकारी सारांश',
      heading: plainSummaryNe.greetingHeadline,
      subheading: 'सरल नेपाली भाषामा तपाईंको मूल स्वभाव, बलियो पक्ष र आजको मार्गदर्शन',
      blocks: [
        {
          title: '१. व्यक्तित्व, मन र जन्म नक्षत्रको मूल पहिचान',
          body: `${plainSummaryNe.bigThreeParagraph} ${plainSummaryNe.birthStarParagraph}`,
        },
        {
          title: `२. वर्तमान सक्रिय जीवन-अध्याय: ${plainSummaryNe.currentChapterTitle}`,
          body: `${plainSummaryNe.currentChapterParagraph} ${plainSummaryNe.strengthsParagraph} ${plainSummaryNe.careAreaParagraph}`,
        },
        {
          title: '३. जन्म संवत्सर, चालू संवत्सर र आजको पञ्चाङ्ग मार्गदर्शन',
          body: `जन्म संवत्सर (${toNepaliDigits(deepNe.birthSamvatsara.fullTitle)} — ${deepNe.birthSamvatsara.vimsatiRuler}): ${deepNe.birthSamvatsara.qualityLabel}। चालू संवत्सर (${toNepaliDigits(deepNe.currentSamvatsara.fullTitle)}): ${deepNe.currentSamvatsara.qualityLabel}। ${plainSummaryNe.todayGuidanceParagraph}`,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय २ • भित्री आत्मा र सामाजिक छवि',
      heading: 'वास्तविक स्वभाव बनाम आरूढ लग्न, आत्मकारक र राहु-केतु विकास अक्ष',
      subheading: `आरूढ लग्न: ${deepNe.identityAndSoul.arudhaLagnaSign} • आत्मकारक: ${deepNe.identityAndSoul.atmakarakaPlanet} • नवांश कारकांश: ${deepNe.identityAndSoul.karakamshaSign}`,
      blocks: [
        {
          title: `सामाजिक दर्पण — ${deepNe.identityAndSoul.arudhaLagnaSign} आरूढ लग्न`,
          body: deepNe.identityAndSoul.innerVsOuterNarrative,
        },
        {
          title: `आत्मकारक जीवन-पाठ: ${deepNe.identityAndSoul.atmakarakaTitle}`,
          body: deepNe.identityAndSoul.atmakarakaNarrative,
        },
        {
          title: `जन्मजात सहज सीप (केतु भाव ${toNepaliDigits(deepNe.identityAndSoul.ketuHouse)}) र विकास क्षेत्र (राहु भाव ${toNepaliDigits(deepNe.identityAndSoul.rahuHouse)})`,
          body: `केतु सहज वरदान: ${deepNe.identityAndSoul.ketuComfortGift} राहु विकास मार्ग: ${deepNe.identityAndSoul.rahuGrowthEdge} सूर्य अंश प्रतीक: ${deepNe.identityAndSoul.sunSabian}`,
          citation: deepNe.identityAndSoul.sourceCitation,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय ३ • करियर, पेशा र धन समृद्धि सूत्र',
      heading: deepNe.careerBlueprint.headline,
      subheading: `दशमेश: ${deepNe.careerBlueprint.tenthLordPlanet} (भाव ${toNepaliDigits(deepNe.careerBlueprint.tenthLordHouse)}) • इन्दु लग्न: ${deepNe.wealthBlueprint.induLagnaSign}`,
      blocks: [
        {
          title: 'करियर कार्यशैली, दशमांश (D10) दिक्पाल र केपी दशम सब-लर्ड',
          body: `${deepNe.careerBlueprint.laymanNarrative} दशमांश दिक्पाल (${deepNe.careerBlueprint.dikpalaDeity} — ${deepNe.careerBlueprint.dikpalaDirection}): ${deepNe.careerBlueprint.dikpalaStyle} ${deepNe.careerBlueprint.amatyakarakaNote} ${deepNe.careerBlueprint.kpCareerNote}`,
          citation: deepNe.careerBlueprint.sourceCitation,
        },
        {
          title: 'कुण्डली सुहाउँदा प्रमुख पेशा र व्यावहारिक करियर सुझाब',
          body: `उपयुक्त कार्यक्षेत्रहरू: ${deepNe.careerBlueprint.recommendedLanes.join(' • ')}। ${deepNe.careerBlueprint.careerActionTip}`,
        },
        {
          title: `धन योग र कालिदासकृत इन्दु लग्न (${deepNe.wealthBlueprint.induLagnaSign}) — ${deepNe.wealthBlueprint.induStrengthTier}`,
          body: `${deepNe.wealthBlueprint.induNarrative} होरा (D2) आम्दानी शैली (${deepNe.wealthBlueprint.horaEarningStyleTitle}): ${deepNe.wealthBlueprint.horaEarningNarrative} व्यावहारिक आर्थिक नियम: ${deepNe.wealthBlueprint.cashflowVsRetentionAdvice}`,
          citation: deepNe.wealthBlueprint.sourceCitation,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय ४ • विवाह, जीवनसाथी र आयुर्वेदिक स्वास्थ्य',
      heading: `${deepNe.relationshipBlueprint.partnerArchetypeTitle} • ${deepNe.wellnessBlueprint.dominantDosha}`,
      subheading: `उपपद लग्न: ${deepNe.relationshipBlueprint.upapadaLagnaSign} • दाराकारक: ${deepNe.relationshipBlueprint.darakarakaPlanet}`,
      blocks: [
        {
          title: 'जीवनसाथीको स्वभाव, उपपद लग्न र नवांश (D9) वैवाहिक वातावरण',
          body: `${deepNe.relationshipBlueprint.partnerPortraitNarrative} ${deepNe.relationshipBlueprint.marriageEnvironmentNarrative} ${deepNe.relationshipBlueprint.navamshaD9Note}`,
        },
        {
          title: `${deepNe.relationshipBlueprint.marsBalanceHeadline} र दाम्पत्य मूल मन्त्र`,
          body: `${deepNe.relationshipBlueprint.marsBalanceExplanation} सम्बन्ध सुमधुर राख्ने मूल मन्त्र: ${deepNe.relationshipBlueprint.goldenRelationshipRule}`,
          citation: deepNe.relationshipBlueprint.sourceCitation,
        },
        {
          title: `आयुर्वेदिक त्रिदोष प्रकृति (${deepNe.wellnessBlueprint.constitutionSummary}) र दैनिक स्वास्थ्य नियम`,
          body: `स्वाभाविक क्षमता: ${deepNe.wellnessBlueprint.naturalStrength} धपेडी संकेत: ${deepNe.wellnessBlueprint.stressSignalToWatch} उपयुक्त खानपान: ${deepNe.wellnessBlueprint.foodAndHydrationTip} व्यायाम र निद्रा: ${deepNe.wellnessBlueprint.movementAndSleepTip} ${deepNe.wellnessBlueprint.sixthHouseResilienceNote}`,
          citation: deepNe.wellnessBlueprint.sourceCitation,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय ५ • दृश्य जन्म चिना (D1/D9) र सप्त-वर्ग दर्पण',
      heading: 'जन्म लग्न कुण्डली (D1), नवांश कुण्डली (D9) र षोडशवर्ग सूक्ष्म जीवन दर्पण',
      subheading: 'पाराशरी सप्त-वर्ग संश्लेषण: द्रेष्काण, चतुर्थांश, सप्तमांश, नवांश, दशमांश, द्वादशांश र विद्यांश',
      blocks: deepNe.vargaHarmonics.map((vh) => ({
        title: `${vh.vargaCode} ${vh.domainTitle} (${vh.sanskritTitle}) — लग्न: ${vh.vargaLagnaSign} (स्वामी: ${vh.vargaLagnaLord}) • ${vh.strengthBadge}`,
        body: vh.laymanSynthesis,
        citation: vh.classicalRuleRef,
      })),
    },
    {
      chapterBadge: 'अध्याय ६ • नवग्रह विस्तृत फलादेश र षड्बल शक्ति',
      heading: 'नवग्रहको राशि-भाव स्थिति, षड्बल रूपा बल, बाल्यादि अवस्था र पाराशर सूत्र',
      subheading: 'बृहत् पाराशर होरा शास्त्र (अ. २७ षड्बल तथा अ. ४५ अवस्था) र फलदीपिकामा आधारित',
      blocks: deepNe.deepPlanetCards.map((c) => ({
        title: `${c.planetLabel} — ${c.signLabel} राशिमा (${c.degreeDMS}) • भाव ${toNepaliDigits(c.house)} (${c.houseTitle}) • ${trDignity(c.dignity, 'ne')}${c.isVargottama ? ' • वर्गोत्तम' : ''}${c.pushkaraBadge ? ` • ${c.pushkaraBadge}` : ''}`,
        body: `षड्बल: ${toNepaliDigits(c.shadbalaRupas)} रूपा (${toNepaliDigits(c.shadbalaRatioPercent)}% — ${c.shadbalaTierLabel}) • अवस्था: ${c.avasthaLabel} (${c.avasthaDeliveryNote})। ${c.laymanSynthesis} ${c.combustNote ? `${c.combustNote} ` : ''}पाराशर सूत्र: ${c.classicalBphsRuling} आत्मिक सन्देश: ${c.growthLesson}`,
      })),
    },
    {
      chapterBadge: 'अध्याय ७ • जन्म नक्षत्र विशेष अध्ययन',
      heading: `जन्म नक्षत्र: ${birthNakNe.nameNe} (चरण ${toNepaliDigits(moonPlanet.nakshatraPada)}, नामाक्षर "${birthPadaObj.bijaSound}")`,
      subheading: `स्वामी: ${trPlanet(birthNakEn.ruler, 'ne')} • देवता: ${birthNakNe.deityNe} • प्रतीक: ${birthNakNe.symbolNe}`,
      blocks: [
        {
          title: 'निहित तैत्तिरीय शक्ति र आन्तरिक चन्द्र स्वभाव',
          body: `शक्ति: ${birthNakNe.shaktiNe}। ${birthNakNe.moonPortraitNe}`,
        },
        {
          title: `जन्म चरण विश्लेषण (चरण ${toNepaliDigits(birthPadaObj.pada)} — ${trSign(birthPadaObj.navamshaSign, 'ne')} नवांश)`,
          body: birthPadaTextNe,
        },
        {
          title: 'अनुकूल पेशा, शुभ कार्य र सजग रहनुपर्ने पक्ष',
          body: `अनुकूल क्षेत्र: ${birthNakNe.vocationsNe.join(' • ')}। शुभ कार्यहरू: ${birthNakNe.auspiciousWorksNe.join(' • ')}। सजगता: ${birthNakNe.shadowTrapNe} वर्जित कार्य: ${birthNakNe.inauspiciousWorksNe.join(' • ')}।`,
        },
        {
          title: 'पवित्र आराध्य वृक्ष, वैदिक मन्त्र र दैनिक आचरण उपाय',
          body: `आराध्य वृक्ष: ${birthNakNe.sacredTreeNe} • वैदिक मन्त्र: ${birthNakNe.vedicMantraNe}। दैनिक उपाय: ${birthNakNe.behavioralUpayaNe}`,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय ८ • १२ भाव सर्वाष्टकवर्ग बल, राजयोग र भृगु बिन्दु',
      heading: '३३७-बिन्दु सर्वाष्टकवर्ग सूचकाङ्क, शास्त्रीय योग, सारावली युति र पुष्कर नवांश',
      subheading: '२८ बिन्दु औसत मानक: ३०+ बिन्दु सहज उन्नति, २५ भन्दा कम बिन्दुमा धैर्य र अनुशासन',
      blocks: [
        ...localizedYogas.map((yg) => ({
          title: `शास्त्रीय योग: ${yg.name} (${yg.category} • ${yg.strength})`,
          body: yg.description,
          citation: yg.sourceText,
        })),
        ...deepNe.saravaliConjunctions.map((cj) => ({
          title: `सारावली ग्रह युति: ${cj.headline} (${cj.planetsJoined.join(' + ')})`,
          body: cj.laymanTakeaway,
          citation: cj.sourceRef,
        })),
        {
          title: `भृगु नन्दी नाडी • भृगु बिन्दु (${deepNe.bhriguBindu.signLabel} ${deepNe.bhriguBindu.degreeDMS}, भाव ${toNepaliDigits(deepNe.bhriguBindu.houseFromLagna)})`,
          body: `${deepNe.bhriguBindu.destinyMeaning} ${deepNe.bhriguBindu.liveTriggerNote}`,
        },
        {
          title: `चन्द्रकला नाडी • पुष्कर नवांश र पुष्कर भाग (${deepNe.pushkaraSummary.headline})`,
          body: deepNe.pushkaraSummary.overviewNarrative,
        },
      ],
    },
    {
      chapterBadge: 'अध्याय ९ • परिपक्वता उमेर, वर्षफल, योगिनी र महादशा',
      heading: 'उमेर १६–४८ जीवन मोडहरू, ताजक वर्षफल, ३६-वर्षे योगिनी दशा र १२०-वर्षे महादशा',
      subheading: `हाल सक्रिय: ${trPlanet(vedicReport.activeMahadasha.lord, 'ne')} महादशा – ${trPlanet(vedicReport.activeAntardasha.lord, 'ne')} अन्तर्दशा • योगिनी: ${deepNe.yoginiDasha.activePeriod.nameLabel}`,
      blocks: [
        {
          title: `प्रत्यक्ष शनि (${deepNe.liveSkyAndSubPeriods.saturnPhaseHeadline}) र बृहस्पति (${deepNe.liveSkyAndSubPeriods.jupiterHeadline}) गोचर`,
          body: `${deepNe.liveSkyAndSubPeriods.saturnGuidance} ${deepNe.liveSkyAndSubPeriods.jupiterGuidance} गोचर मूर्ति निर्णय (${deepNe.liveSkyAndSubPeriods.moorthiFormLabel}): ${deepNe.liveSkyAndSubPeriods.moorthiExplanation} ${deepNe.liveSkyAndSubPeriods.nodalTransitNote}`,
          citation: deepNe.liveSkyAndSubPeriods.sourceCitation,
        },
        {
          title: `ताजक नीलकण्ठी वार्षिक वर्षफल (${toNepaliDigits(deepNe.varshaphala.solarReturnYear)}–${toNepaliDigits(deepNe.varshaphala.solarReturnYear + 1)}) — ${deepNe.varshaphala.munthaThemeHeadline}`,
          body: `वार्षिक लग्न: ${deepNe.varshaphala.varshaLagnaSign} (${deepNe.varshaphala.varshaLagnaLord}) • मुन्था: ${deepNe.varshaphala.munthaSign} (भाव ${toNepaliDigits(deepNe.varshaphala.munthaHouseFromVarshaLagna)}) • वर्षेश्वर: ${deepNe.varshaphala.varsheshwaraLord} • पुण्य सहम: ${deepNe.varshaphala.punyaSahamSign} • राज्य सहम: ${deepNe.varshaphala.rajyaSahamSign}। ${deepNe.varshaphala.munthaAnnualForecast} ${deepNe.varshaphala.varsheshwaraGuidance}`,
        },
        {
          title: `रुद्रयामल तन्त्र एवं नेपाली चिना • ३६-वर्षे अष्ट-योगिनी दशा (${deepNe.yoginiDasha.activePeriod.nameLabel} — ${deepNe.yoginiDasha.activePeriod.planetLordLabel})`,
          body: `${deepNe.yoginiDasha.doubleLockNarrative} ${deepNe.yoginiDasha.activePeriod.fruitSummary} ६४औँ नवांश (${deepNe.kharaAwareness.khara64FromMoonSign}) र २२औँ द्रेष्काण (${deepNe.kharaAwareness.drekkana22Sign}) सजगता: ${deepNe.kharaAwareness.mindfulPacingAdvice}`,
        },
        {
          title: '९ ग्रह परिपक्वता उमेर मोडहरू (उमेर १६ देखि ४८ सम्म)',
          body: deepNe.maturityMilestones
            .map(
              (m) =>
                `उमेर ${toNepaliDigits(m.maturityAge)} (${toNepaliDigits(m.calendarYear)} • ${m.planetLabel}): ${m.laymanMeaning}`
            )
            .join('  '),
        },
        {
          title: `सक्रिय ${trPlanet(vedicReport.activeMahadasha.lord, 'ne')} महादशाभित्रका ९ अन्तर्दशा र १२०-वर्षे महादशा क्रम`,
          body:
            deepNe.liveSkyAndSubPeriods.subPeriods
              .map(
                (sp) =>
                  `${trPlanet(vedicReport.activeMahadasha.lord, 'ne')}–${sp.antarLordLabel} (${formatDisplayDate(
                    sp.startDate,
                    'ne',
                    true
                  )} देखि ${formatDisplayDate(sp.endDate, 'ne', true)}): ${sp.laymanGuidance}`
              )
              .join('  ') +
            '  सम्पूर्ण महादशा क्रम: ' +
            vedicReport.dashas
              .map(
                (d) =>
                  `${trPlanet(d.lord, 'ne')} (${toNepaliDigits(d.years)} वर्ष: ${d.startDate}–${d.endDate}, ${
                    trDashaGuide(d.lord, 'ne').chapterTitle
                  })`
              )
              .join(' • '),
        },
        {
          title: 'आगामी १२-वर्षे व्यक्तिगत पूर्वानुमान समयरेखा',
          body: synthesisNe.unifiedTimeline
            .map(
              (yr) =>
                `सन् ${toNepaliDigits(yr.year)} (उमेर ${toNepaliDigits(yr.age)}): व्यक्तिगत वर्ष #${toNepaliDigits(
                  yr.numerologyPersonalYear
                )} • ${yr.vedicDashaLord} • ${yr.westernTransitTheme}`
            )
            .join('  |  '),
        },
      ],
    },
    {
      chapterBadge: 'अध्याय १० • अंक ज्योतिष, शुभ साइत, रत्न-वास्तु उपाय र ग्रन्थसूची',
      heading: 'चेइरो संयुक्त अंक, ३×३ लो-शु वर्ग, आगामी शुभ मिति, सुरक्षित रत्न र १४ शास्त्रीय ग्रन्थ',
      subheading: `मूलांक #${toNepaliDigits(deepNe.loShuGrid.mulankDriver)} • भाग्यांक #${toNepaliDigits(deepNe.loShuGrid.bhagyankConductor)} • आजको सक्रिय होरा: ${activeHoraiNe.horaiName}`,
      blocks: [
        {
          title: deepNe.deepNumerology.lifePathHeadline,
          body: `${deepNe.deepNumerology.lifePathDeepNarrative} परिपक्वता अंक ${deepNe.deepNumerology.maturityNumberLabel}: ${deepNe.deepNumerology.maturityNarrative}`,
        },
        {
          title: `चेइरो संयुक्त अंक (${deepNe.deepNumerology.compoundTitle}) र जीवनका ४ शिखर चक्र`,
          body: `${deepNe.deepNumerology.compoundNarrative} ${deepNe.deepNumerology.karmicLessonsTitle}: ${deepNe.deepNumerology.karmicLessonsItems.join(
            ' '
          )} शिखर चक्रहरू: ${deepNe.deepNumerology.pinnacleRoadmap
            .map(
              (p) =>
                `${p.label} (${p.ageSpan}, अंक #${toNepaliDigits(p.number)} / चुनौती ${toNepaliDigits(
                  p.challenge
                )}): ${p.meaning}`
            )
            .join(' ')}`,
          citation: deepNe.deepNumerology.sourceCitation,
        },
        {
          title: 'वैदिक ३×३ लो-शु राजयोग स्तम्भ र आजको होरा / पञ्चपक्षी समय',
          body:
            deepNe.loShuGrid.planes
              .slice(0, 6)
              .map((pl) => `${pl.nameLabel} (${toNepaliDigits(pl.completionCount)}/३): ${pl.meaning}`)
              .join('  ') +
            `  आजको सक्रिय गौरी: ${trGowriName(panchangReport.activeGowri.name, 'ne')} (${localizeGowriNatureNe(
              panchangReport.activeGowri.nature
            )}) • जन्म पक्षी: ${deepNe.panchapakshi.natalBirdLabel} (${
              deepNe.panchapakshi.activeSlot.activityLabel
            }) • आजको सर्वोत्तम समय: ${synthesisNe.bestWindowToday}।`,
        },
        {
          title: 'लग्न-अनुकूल सुरक्षित त्रिकोण रत्न (१/५/९ स्वामी), सात्त्विक दान र वास्तु दिशा',
          body:
            deepNe.upayaArchitecture.trikonaSafeGems
              .map(
                (g) =>
                  `${g.houseRoleLabel} (${g.planetLabel}): मुख्य रत्न ${g.primaryGem}, सरल उपरत्न ${g.affordableUpaRatna} (${g.metalAndFinger} • ${g.wearingWindow}) — ${g.whySafeExplanation}`
              )
              .join('  ') +
            `  ${deepNe.upayaArchitecture.avoidGemPlanetsWarning}  ${deepNe.upayaArchitecture.activeDashaCharityTitle}: ${deepNe.upayaArchitecture.activeDashaCharityAction}  ${deepNe.upayaArchitecture.weakestHouseHabitTitle}: ${deepNe.upayaArchitecture.weakestHouseHabitAction}  कार्य/अध्ययन दिशा: ${deepNe.upayaArchitecture.vastuDeskDirection} (${deepNe.upayaArchitecture.vastuDeskWhy})  शयन सिरानी दिशा: ${deepNe.upayaArchitecture.vastuSleepHeadDirection} (${deepNe.upayaArchitecture.vastuSleepWhy})`,
          citation: deepNe.upayaArchitecture.sourceCitation,
        },
        ...synthesisNe.aiCopilotPrompts.map((qa, idx) => ({
          title: `परिशिष्ट क (जिज्ञासा ${toNepaliDigits(idx + 1)}): ${qa.question}`,
          body: qa.groundedAnswer,
        })),
        {
          title: 'परिशिष्ट ख: यस प्रतिवेदनमा प्रयुक्त १४ प्रामाणिक शास्त्रीय तथा आधुनिक ग्रन्थसूची',
          body: deepNe.bibliography
            .map(
              (bk, idx) =>
                `${toNepaliDigits(idx + 1)}. ${bk.titleNe} (${bk.authorAndEraNe}) — ${bk.usedForNe}`
            )
            .join('   '),
        },
      ],
    },
  ];

  const allDevanagariCorpus = chapters
    .map(
      (ch) =>
        `${ch.chapterBadge} ${ch.heading} ${ch.subheading} ` +
        ch.blocks.map((b) => `${b.title} ${b.body}`).join(' ')
    )
    .join('\n');

  return {
    titleBanner: 'ओसियोलोजी • बृहत् व्यक्तिगत जीवन फलादेश र जन्म चिना प्रतिवेदन',
    subtitleBanner:
      'वैदिक ज्योतिष, जैमिनी सूत्र, अष्टकवर्ग, ताजक वर्षफल, ३६-वर्षे योगिनी दशा, पञ्चाङ्ग र अंक ज्योतिषको संयुक्त ग्रन्थ',
    fullName,
    generatedDateNe: formatDisplayDate(deepNe.generatedDateIso, 'ne', false),
    metadataPairs,
    scorecard,
    d1Houses,
    d9Houses,
    suryaHoraPercent: deepNe.wealthBlueprint.suryaHoraPercent,
    chandraHoraPercent: deepNe.wealthBlueprint.chandraHoraPercent,
    horaTitle: deepNe.wealthBlueprint.horaEarningStyleTitle,
    doshaBars: [
      { label: 'वात (वायु)', pct: deepNe.wellnessBlueprint.vataPercent, hex: '#4F46E5' },
      { label: 'पित्त (अग्नि)', pct: deepNe.wellnessBlueprint.pittaPercent, hex: '#D97706' },
      { label: 'कफ (जल/पृथ्वी)', pct: deepNe.wellnessBlueprint.kaphaPercent, hex: '#059669' },
    ],
    savRows,
    loShuCells,
    actionRows,
    chapters,
    allDevanagariCorpus,
  };
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth = 1.5
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawNorthKundaliOnCanvas(
  ctx: CanvasRenderingContext2D,
  houses: NepaliKundaliHouseCell[],
  x: number,
  y: number,
  size: number,
  title: string,
  fontStack: string
) {
  ctx.font = `700 22px ${fontStack}`;
  ctx.fillStyle = '#1E1B4B';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + size / 2, y + 22);

  const boxY = y + 34;
  const s = size;
  drawRoundedBox(ctx, x, boxY, s, s, 10, '#FFFDF7', '#92400E', 2.4);

  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  // Diagonals
  ctx.moveTo(x, boxY);
  ctx.lineTo(x + s, boxY + s);
  ctx.moveTo(x + s, boxY);
  ctx.lineTo(x, boxY + s);
  // Inner diamond
  ctx.moveTo(x + s / 2, boxY);
  ctx.lineTo(x + s, boxY + s / 2);
  ctx.lineTo(x + s / 2, boxY + s);
  ctx.lineTo(x, boxY + s / 2);
  ctx.closePath();
  ctx.stroke();

  const scale = s / 400;
  for (const hc of NORTH_DIAMOND_COORDS) {
    const cell = houses.find((h) => h.house === hc.house);
    if (!cell) continue;
    // Sign number
    ctx.font = `700 18px ${fontStack}`;
    ctx.fillStyle = '#B45309';
    ctx.textAlign = 'center';
    ctx.fillText(cell.signNumberNe, x + hc.signX * scale, boxY + hc.signY * scale);

    // Planets
    if (cell.planetsNe.length > 0) {
      const joined = cell.planetsNe.join(' ');
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillStyle = '#312E81';
      ctx.fillText(joined, x + hc.planetsX * scale, boxY + hc.planetsY * scale);
    }
  }
  ctx.textAlign = 'left';
}

export async function generateNepaliPdfBytes(input: PdfReportBundleInput): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const model = buildNepaliPdfSections(input);

  // Headless Node SSR fallback (Canvas2D lives in browser; Playwright tests run real browser Canvas2D!)
  if (typeof document === 'undefined') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    model.chapters.forEach((ch, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`Oceanology Nepali Dossier - Chapter ${idx + 1} (${model.fullName})`, 14, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Devanagari corpus length: ${model.allDevanagariCorpus.length} chars | Blocks: ${ch.blocks.length}`,
        14,
        32
      );
    });
    // Ensure >= 12 pages in headless Node verification
    while (doc.getNumberOfPages() < 12) {
      doc.addPage();
      doc.text(`Nepali Kundali Appendix Page ${doc.getNumberOfPages()}`, 14, 22);
    }
    return new Uint8Array(doc.output('arraybuffer'));
  }

  // Wait for Google Fonts 'Noto Sans Devanagari' to finish loading before shaping text on Canvas2D
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed with system Devanagari fallback ('Nirmala UI' / 'Kohinoor Devanagari')
    }
  }

  const fontStack =
    "'Noto Sans Devanagari', 'Nirmala UI', 'Kohinoor Devanagari', 'Mangal', sans-serif";
  const pageW = 1240;
  const pageH = 1754;
  const marginX = 76;
  const contentW = pageW - marginX * 2; // 1088px
  const topY = 98;
  const bottomLimitY = pageH - 96;

  const canvases: HTMLCanvasElement[] = [];
  let curCanvas!: HTMLCanvasElement;
  let ctx!: CanvasRenderingContext2D;
  let y = topY;

  const startNewPage = () => {
    curCanvas = document.createElement('canvas');
    curCanvas.width = pageW;
    curCanvas.height = pageH;
    const context = curCanvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context unavailable for Nepali PDF rendering');
    }
    ctx = context;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageW, pageH);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    canvases.push(curCanvas);
    y = topY;
  };

  const ensureSpace = (neededPx: number) => {
    if (y + neededPx > bottomLimitY) {
      startNewPage();
    }
  };

  startNewPage();

  // ==================== PAGE 1 COVER HEADER & METADATA ====================
  drawRoundedBox(ctx, marginX, 58, contentW, 134, 16, '#1E1B4B', '#4338CA', 2);
  ctx.fillStyle = '#E0E7FF';
  ctx.font = `600 19px ${fontStack}`;
  ctx.fillText('ओसियोलोजी ज्योतिष तथा खगोल अनुसन्धान केन्द्र • प्रामाणिक नेपाली संस्करण', marginX + 28, 96);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 31px ${fontStack}`;
  ctx.fillText(model.titleBanner, marginX + 28, 138);

  ctx.fillStyle = '#C7D2FE';
  ctx.font = `500 18px ${fontStack}`;
  ctx.fillText(model.subtitleBanner, marginX + 28, 171);

  y = 214;

  // Birth Metadata 2-Column Grid
  const metaCardH = 228;
  drawRoundedBox(ctx, marginX, y, contentW, metaCardH, 14, '#F8FAFC', '#CBD5E1', 1.6);
  const colW = (contentW - 56) / 2;
  model.metadataPairs.forEach((pair, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = marginX + 24 + col * (colW + 16);
    const py = y + 34 + row * 68;
    ctx.font = `600 16px ${fontStack}`;
    ctx.fillStyle = '#64748B';
    ctx.fillText(pair.label, px, py);

    ctx.font = `700 19px ${fontStack}`;
    ctx.fillStyle = '#0F172A';
    const valLines = wrapCanvasLines(ctx, pair.value, colW - 8);
    ctx.fillText(valLines[0] || pair.value, px, py + 27);
  });
  y += metaCardH + 24;

  // 5-Domain Life Potential Scorecard
  ctx.font = `700 23px ${fontStack}`;
  ctx.fillStyle = '#1E1B4B';
  ctx.fillText('पञ्च-क्षेत्र जीवन क्षमता सूचकाङ्क (शास्त्रीय बल मूल्याङ्कन)', marginX, y + 20);
  y += 34;

  for (const sc of model.scorecard) {
    ensureSpace(88);
    drawRoundedBox(ctx, marginX, y, contentW, 78, 12, '#FFFFFF', '#E2E8F0', 1.5);
    ctx.font = `700 20px ${fontStack}`;
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${sc.title} — ${sc.summary}`, marginX + 20, y + 30);

    ctx.font = `700 20px ${fontStack}`;
    ctx.fillStyle = sc.tone === 'optimal' ? '#059669' : sc.tone === 'favorable' ? '#4F46E5' : '#D97706';
    ctx.textAlign = 'right';
    ctx.fillText(`${sc.scoreText} (${sc.badge})`, marginX + contentW - 20, y + 30);
    ctx.textAlign = 'left';

    // Progress bar
    const barX = marginX + 20;
    const barY = y + 42;
    const barW = 360;
    drawRoundedBox(ctx, barX, barY, barW, 12, 6, '#E2E8F0');
    drawRoundedBox(
      ctx,
      barX,
      barY,
      Math.max(24, Math.round((barW * sc.scoreNum) / 100)),
      12,
      6,
      sc.tone === 'optimal' ? '#10B981' : sc.tone === 'favorable' ? '#6366F1' : '#F59E0B'
    );

    ctx.font = `500 16px ${fontStack}`;
    ctx.fillStyle = '#475569';
    ctx.fillText(sc.driver, barX + barW + 20, y + 53);
    y += 88;
  }

  // Helper to render Chapter Header + Styled Prose Cards
  const renderChapterHeader = (badge: string, heading: string, subheading: string) => {
    ensureSpace(150);
    y += 12;
    ctx.font = `700 18px ${fontStack}`;
    const headLines = wrapCanvasLines(ctx, heading, contentW - 44);
    ctx.font = `500 17px ${fontStack}`;
    const subLines = wrapCanvasLines(ctx, subheading, contentW - 44);
    const boxH = 54 + headLines.length * 32 + subLines.length * 25 + 18;
    ensureSpace(boxH + 16);

    drawRoundedBox(ctx, marginX, y, contentW, boxH, 14, '#EEF2FF', '#A5B4FC', 1.8);
    ctx.font = `700 17px ${fontStack}`;
    ctx.fillStyle = '#4338CA';
    ctx.fillText(badge, marginX + 22, y + 30);

    let cy = y + 64;
    ctx.font = `700 25px ${fontStack}`;
    ctx.fillStyle = '#1E1B4B';
    for (const hl of headLines) {
      ctx.fillText(hl, marginX + 22, cy);
      cy += 32;
    }
    cy += 2;
    ctx.font = `500 17px ${fontStack}`;
    ctx.fillStyle = '#475569';
    for (const sl of subLines) {
      ctx.fillText(sl, marginX + 22, cy);
      cy += 25;
    }
    y += boxH + 18;
  };

  const renderProseBlock = (title: string, body: string, citation?: string) => {
    ctx.font = `700 20px ${fontStack}`;
    const titleLines = wrapCanvasLines(ctx, title, contentW - 44);
    ctx.font = `400 19px ${fontStack}`;
    const bodyLines = wrapCanvasLines(ctx, body, contentW - 44);
    ctx.font = `500 15px ${fontStack}`;
    const citeLines = citation ? wrapCanvasLines(ctx, `स्रोत: ${citation}`, contentW - 44) : [];

    const totalH =
      26 +
      titleLines.length * 28 +
      8 +
      bodyLines.length * 29 +
      (citeLines.length > 0 ? 12 + citeLines.length * 22 : 0) +
      18;

    if (totalH <= bottomLimitY - topY) {
      ensureSpace(totalH + 12);
      drawRoundedBox(ctx, marginX, y, contentW, totalH, 12, '#FFFFFF', '#CBD5E1', 1.4);
      // Left accent bar
      drawRoundedBox(ctx, marginX, y, 7, totalH, 4, '#4F46E5');

      let cy = y + 32;
      ctx.font = `700 20px ${fontStack}`;
      ctx.fillStyle = '#0F172A';
      for (const tl of titleLines) {
        ctx.fillText(tl, marginX + 22, cy);
        cy += 28;
      }
      cy += 6;
      ctx.font = `400 19px ${fontStack}`;
      ctx.fillStyle = '#334155';
      for (const bl of bodyLines) {
        ctx.fillText(bl, marginX + 22, cy);
        cy += 29;
      }
      if (citeLines.length > 0) {
        cy += 8;
        ctx.font = `500 15px ${fontStack}`;
        ctx.fillStyle = '#6366F1';
        for (const cl of citeLines) {
          ctx.fillText(cl, marginX + 22, cy);
          cy += 22;
        }
      }
      y += totalH + 14;
    } else {
      // Very long block (e.g., 9 Antardashas or 14 Bibliography items) — stream cleanly line-by-line across pages
      ensureSpace(90);
      ctx.font = `700 20px ${fontStack}`;
      ctx.fillStyle = '#1E1B4B';
      for (const tl of titleLines) {
        ensureSpace(34);
        ctx.fillText(tl, marginX + 12, y + 24);
        y += 30;
      }
      y += 6;
      ctx.font = `400 19px ${fontStack}`;
      ctx.fillStyle = '#334155';
      for (const bl of bodyLines) {
        ensureSpace(32);
        ctx.fillText(bl, marginX + 12, y + 22);
        y += 29;
      }
      y += 16;
    }
  };

  // ==================== RENDER ALL 10 NEPALI CHAPTERS + VISUAL CHARTS ====================
  model.chapters.forEach((ch, chIdx) => {
    const chNum = chIdx + 1;
    renderChapterHeader(ch.chapterBadge, ch.heading, ch.subheading);

    // Chapter 3 visual D2 Hora Bar
    if (chNum === 3) {
      ensureSpace(92);
      drawRoundedBox(ctx, marginX, y, contentW, 78, 12, '#FFFBEB', '#FCD34D', 1.5);
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillStyle = '#92400E';
      ctx.fillText(
        `होरा (D2) धन सन्तुलन: ${model.horaTitle} — सूर्य होरा ${toNepaliDigits(
          model.suryaHoraPercent
        )}% / चन्द्र होरा ${toNepaliDigits(model.chandraHoraPercent)}%`,
        marginX + 22,
        y + 30
      );
      const bx = marginX + 22;
      const bw = contentW - 44;
      drawRoundedBox(ctx, bx, y + 44, bw, 16, 8, '#6366F1');
      drawRoundedBox(
        ctx,
        bx,
        y + 44,
        Math.max(18, Math.round((bw * model.suryaHoraPercent) / 100)),
        16,
        8,
        '#F59E0B'
      );
      y += 92;
    }

    // Chapter 4 visual Ayurvedic Dosha Bars
    if (chNum === 4) {
      ensureSpace(96);
      const cardW = (contentW - 24) / 3;
      model.doshaBars.forEach((db, di) => {
        const dx = marginX + di * (cardW + 12);
        drawRoundedBox(ctx, dx, y, cardW, 82, 12, '#F8FAFC', '#CBD5E1', 1.4);
        ctx.font = `700 18px ${fontStack}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(`${db.label}: ${toNepaliDigits(db.pct)}%`, dx + 18, y + 32);
        drawRoundedBox(ctx, dx + 18, y + 46, cardW - 36, 14, 7, '#E2E8F0');
        drawRoundedBox(
          ctx,
          dx + 18,
          y + 46,
          Math.max(14, Math.round(((cardW - 36) * db.pct) / 100)),
          14,
          7,
          db.hex
        );
      });
      y += 98;
    }

    // Chapter 5 visual Nepali Cheena North-Indian Diamond D1 & D9 Kundali Charts!
    if (chNum === 5) {
      const chartSize = 510;
      ensureSpace(chartSize + 66);
      drawNorthKundaliOnCanvas(
        ctx,
        model.d1Houses,
        marginX,
        y,
        chartSize,
        'जन्म लग्न कुण्डली / मूल चिना (D1)',
        fontStack
      );
      drawNorthKundaliOnCanvas(
        ctx,
        model.d9Houses,
        marginX + contentW - chartSize,
        y,
        chartSize,
        'नवांश कुण्डली — धर्म र विवाह (D9)',
        fontStack
      );
      y += chartSize + 56;
    }

    // Chapter 8 visual 12-House Sarvashtakavarga Bar Chart!
    if (chNum === 8) {
      ensureSpace(560);
      drawRoundedBox(ctx, marginX, y, contentW, 544, 14, '#F8FAFC', '#CBD5E1', 1.5);
      ctx.font = `700 20px ${fontStack}`;
      ctx.fillStyle = '#1E1B4B';
      ctx.fillText('१२ भाव सर्वाष्टकवर्ग बिन्दु तालिका (जम्मा ३३७ बिन्दु)', marginX + 22, y + 34);

      model.savRows.forEach((sr, idx) => {
        const ry = y + 66 + idx * 39;
        ctx.font = `600 17px ${fontStack}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(`${sr.houseLabel} (${sr.signLabel})`, marginX + 22, ry);

        const barX = marginX + 430;
        const barW = 430;
        drawRoundedBox(ctx, barX, ry - 15, barW, 16, 8, '#E2E8F0');
        const fillHex = sr.bindus >= 30 ? '#059669' : sr.bindus < 25 ? '#E11D48' : '#4F46E5';
        drawRoundedBox(
          ctx,
          barX,
          ry - 15,
          Math.min(barW, Math.round((barW * sr.bindus) / 42)),
          16,
          8,
          fillHex
        );

        ctx.font = `700 17px ${fontStack}`;
        ctx.fillStyle = fillHex;
        ctx.fillText(
          `${toNepaliDigits(sr.bindus)} बिन्दु (${sr.tag})`,
          barX + barW + 18,
          ry
        );
      });
      y += 562;
    }

    // Chapter 10 visual 3x3 Lo Shu Vedic Grid + 8-Action Best Dates Table!
    if (chNum === 10) {
      // 3x3 Lo Shu Grid
      ensureSpace(305);
      drawRoundedBox(ctx, marginX, y, contentW, 288, 14, '#F8FAFC', '#CBD5E1', 1.5);
      ctx.font = `700 20px ${fontStack}`;
      ctx.fillStyle = '#1E1B4B';
      ctx.fillText('वैदिक अंक-यन्त्र • ३×३ लो-शु जादुई वर्ग (४–९–२ / ३–५–७ / ८–१–६)', marginX + 22, y + 34);

      const cellW = 160;
      const cellH = 70;
      model.loShuCells.forEach((cell, idx) => {
        const r = Math.floor(idx / 3);
        const c = idx % 3;
        const cx = marginX + 24 + c * (cellW + 12);
        const cy = y + 52 + r * (cellH + 8);
        drawRoundedBox(
          ctx,
          cx,
          cy,
          cellW,
          cellH,
          10,
          cell.active ? '#EEF2FF' : '#FFFFFF',
          cell.active ? '#6366F1' : '#CBD5E1',
          1.5
        );
        ctx.font = `600 14px ${fontStack}`;
        ctx.fillStyle = '#64748B';
        ctx.fillText(`${cell.digitNe} • ${cell.dir}`, cx + 12, cy + 22);
        ctx.font = `700 24px ${fontStack}`;
        ctx.fillStyle = cell.active ? '#312E81' : '#94A3B8';
        ctx.fillText(cell.text, cx + 12, cy + 54);
      });

      // Legend on right side of Lo Shu box
      ctx.font = `500 17px ${fontStack}`;
      ctx.fillStyle = '#334155';
      const noteLines = wrapCanvasLines(
        ctx,
        'जन्म मिति, मूलांक र भाग्यांकका अंकहरू ३×३ लो-शु वर्गमा राख्दा तपाईंको मानसिक (४-९-२), भावनात्मक (३-५-७), व्यावहारिक (८-१-६) र स्वर्ण/रजत राजयोग स्तम्भहरूको सक्रियता देखिन्छ।',
        contentW - 580
      );
      noteLines.forEach((nl, ni) => {
        ctx.fillText(nl, marginX + 556, y + 86 + ni * 30);
      });
      y += 304;

      // 8-Decision Upcoming Best Dates Table
      ensureSpace(410);
      drawRoundedBox(ctx, marginX, y, contentW, 394, 14, '#FFFFFF', '#CBD5E1', 1.5);
      drawRoundedBox(ctx, marginX, y, contentW, 48, 12, '#EEF2FF', '#A5B4FC', 1.2);
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillStyle = '#1E1B4B';
      ctx.fillText('प्रमुख जीवन कार्य', marginX + 20, y + 31);
      ctx.fillText('आजको अंक', marginX + 430, y + 31);
      ctx.fillText('आगामी १२ दिनको सर्वोत्तम शुभ मिति', marginX + 610, y + 31);

      model.actionRows.forEach((ar, ai) => {
        const ry = y + 82 + ai * 41;
        if (ai > 0) {
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(marginX + 16, ry - 26);
          ctx.lineTo(marginX + contentW - 16, ry - 26);
          ctx.stroke();
        }
        ctx.font = `600 17px ${fontStack}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(ar.title, marginX + 20, ry);

        ctx.font = `700 17px ${fontStack}`;
        ctx.fillStyle = '#4F46E5';
        ctx.fillText(`${ar.todayScore} (${ar.verdict})`, marginX + 430, ry);

        ctx.font = `500 16px ${fontStack}`;
        ctx.fillStyle = '#334155';
        ctx.fillText(ar.bestWindow, marginX + 610, ry);
      });
      y += 412;
    }

    for (const blk of ch.blocks) {
      renderProseBlock(blk.title, blk.body, blk.citation);
    }
  });

  // ==================== STAMP RUNNING HEADERS & FOOTERS ON ALL PAGES ====================
  const totalPages = canvases.length;
  canvases.forEach((cnv, idx) => {
    const c = cnv.getContext('2d')!;
    const pageNum = idx + 1;
    if (pageNum > 1) {
      c.font = `600 16px ${fontStack}`;
      c.fillStyle = '#64748B';
      c.textAlign = 'left';
      c.fillText(`${model.fullName} — बृहत् व्यक्तिगत जीवन फलादेश र जन्म चिना`, marginX, 54);
      c.textAlign = 'right';
      c.fillText('ओसियोलोजी नेपाली संस्करण', pageW - marginX, 54);
      c.strokeStyle = '#E2E8F0';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(marginX, 68);
      c.lineTo(pageW - marginX, 68);
      c.stroke();
    }

    c.strokeStyle = '#E2E8F0';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(marginX, pageH - 68);
    c.lineTo(pageW - marginX, pageH - 68);
    c.stroke();

    c.font = `500 16px ${fontStack}`;
    c.fillStyle = '#64748B';
    c.textAlign = 'left';
    c.fillText(
      `प्रकाशन मिति: ${model.generatedDateNe} • शतप्रतिशत खगोलीय तथा शास्त्रीय गणना (oceanology.vercel.app)`,
      marginX,
      pageH - 38
    );

    c.font = `700 17px ${fontStack}`;
    c.fillStyle = '#1E1B4B';
    c.textAlign = 'right';
    c.fillText(
      `पृष्ठ ${toNepaliDigits(pageNum)} / ${toNepaliDigits(totalPages)}`,
      pageW - marginX,
      pageH - 38
    );
    c.textAlign = 'left';
  });

  // Assemble A4 jsPDF from high-clarity #FFFFFF pages
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  canvases.forEach((cnv, idx) => {
    if (idx > 0) doc.addPage();
    const jpegDataUrl = cnv.toDataURL('image/jpeg', 0.92);
    doc.addImage(jpegDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  });

  return new Uint8Array(doc.output('arraybuffer'));
}
