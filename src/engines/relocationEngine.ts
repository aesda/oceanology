import { NatalChartResult, ZODIAC_SIGNS } from './astronomyEngine';
import { VedicReport } from './vedicEngine';
import { BirthProfile, CityLocation, WORLD_CITIES } from '../types/oceanology';
import { ACG_LINE_INTERPRETATIONS } from '../data/classicalCompendium';
import {
  AppLanguage,
  formatCityForLang,
  formatCountryForLang,
  toNepaliDigits,
  trPlanet,
} from '../i18n/i18n';

export interface LocalizedLineInfluence {
  planet: string;
  planetLabel: string;
  symbol: string;
  color: string;
  angle: 'MC' | 'IC' | 'ASC' | 'DSC';
  angleLabel: string;
  orbDegrees: number;
  distanceKm: number;
  direction: 'East' | 'West';
  directionLabel: string;
  title: string;
  domain: 'Career' | 'Sanctuary' | 'Identity' | 'Love';
  summary: string;
  scoreContribution: number;
  planetDignity: string;
}

export interface LocalizedCityRelocationEvaluation {
  city: CityLocation;
  cityLabel: string;
  stateLabel: string;
  countryLabel: string;
  overallScore: number;
  careerScore: number;
  sanctuaryScore: number;
  loveScore: number;
  primaryTag: string;
  influences: LocalizedLineInfluence[];
  headlineVerdict: string;
}

export interface PersonalRelocationReport {
  currentLocation: LocalizedCityRelocationEvaluation;
  countryNameLabel: string;
  isSyntheticCountryCorridors: boolean;
  bestOverallInCountry: LocalizedCityRelocationEvaluation;
  bestCareerInCountry: LocalizedCityRelocationEvaluation;
  bestSanctuaryInCountry: LocalizedCityRelocationEvaluation;
  bestLoveInCountry: LocalizedCityRelocationEvaluation;
  rankedCountryCities: LocalizedCityRelocationEvaluation[];
  countrySummaryNarrative: string;
  topGlobalCareer: LocalizedCityRelocationEvaluation;
  topGlobalSanctuary: LocalizedCityRelocationEvaluation;
  topGlobalLove: LocalizedCityRelocationEvaluation;
  topInternationalCities: LocalizedCityRelocationEvaluation[];
  vedicDirectionHeadline: string;
  vedicDirectionNarrative: string;
  foreignYogaBadge: string;
  foreignYogaTone: 'optimal' | 'favorable' | 'info';
  foreignYogaNarrative: string;
  sourceCitation: string;
}

const ANGLE_META_NE: Record<'MC' | 'IC' | 'ASC' | 'DSC', { short: string; full: string }> = {
  MC: { short: 'दशम शिखर', full: 'दशम कर्म-शिखर रेखा' },
  IC: { short: 'चतुर्थ सुख', full: 'चतुर्थ आवास-शान्ति रेखा' },
  ASC: { short: 'लग्न उदय', full: 'लग्न आत्मबल रेखा' },
  DSC: { short: 'सप्तम मिलन', full: 'सप्तम सम्बन्ध-साझेदारी रेखा' },
};

const ACG_SUMMARY_NE: Record<string, Record<'MC' | 'IC' | 'ASC' | 'DSC', string>> = {
  Sun: {
    MC: 'सूर्य दशम रेखामा रहँदा नेतृत्व, उच्च पद, सरकारी/संस्थागत सम्मान र सार्वजनिक प्रतिष्ठा तीव्र रूपमा बढ्छ।',
    IC: 'पारिवारिक गौरव, घर-जग्गा स्थायित्व र न्यानो आत्मविश्वासी घरायसी वातावरण निर्माण हुन्छ।',
    ASC: 'शारीरिक ऊर्जा, आत्मबल र स्वाभाविक व्यक्तित्व चमक बढेर तपाईंको उपस्थिति प्रभावशाली बन्छ।',
    DSC: 'सहयोगी, प्रभावशाली र उदार जीवनसाथी वा व्यावसायिक साझेदारहरूको साथ मिल्छ।',
  },
  Jupiter: {
    MC: 'करियर उन्नति, शिक्षा, कानुन, परामर्श, प्रकाशन र सामाजिक सम्मानका लागि सर्वोत्तम समृद्धि रेखा।',
    IC: 'घर खरिद, पारिवारिक सुख-शान्ति, सुरक्षा र दीर्घकालीन मानसिक सन्तुष्टिका लागि सर्वोत्कृष्ट स्थान।',
    ASC: 'सकारात्मक सोच, गुरुकृपा, सुरक्षा कवच र ज्ञान विस्तारको ऊर्जा प्राप्त हुन्छ।',
    DSC: 'सज्जन, विवेकी र समृद्ध जीवनसाथी तथा विश्वासिलो व्यावसायिक सहकार्य जुट्छ।',
  },
  Venus: {
    MC: 'कला, सौन्दर्य, कूटनीति, व्यापार र मधुर जनसम्पर्कबाट करियरमा लोकप्रियता र लाभ मिल्छ।',
    IC: 'सुन्दर, शान्त र प्रेमपूर्ण घरायसी वातावरण तथा भावनात्मक विश्राम प्राप्त हुन्छ।',
    ASC: 'आकर्षण, सामाजिक लोकप्रियता, सृजनात्मकता र सहज व्यवहार कुशलता बढ्छ।',
    DSC: 'प्रेम, विवाह र आत्मीय दाम्पत्य सुखका लागि स्थान-ज्योतिषको सर्वोत्तम शुभ रेखा।',
  },
  Mercury: {
    MC: 'वाणिज्य, प्रविधि, सफ्टवेयर, लेखन, सञ्चार र बौद्धिक पेशामा तीव्र प्रगति गराउँछ।',
    IC: 'घरबाटै अध्ययन, अनुसन्धान, लेखन र बौद्धिक कार्य गर्न अत्यन्त अनुकूल क्षेत्र।',
    ASC: 'तीक्ष्ण बुद्धि, भाषा कौशल, सञ्जाल विस्तार र छरितो निर्णय क्षमता बढाउँछ।',
    DSC: 'बौद्धिक, संवादशील र चतुर साझेदार तथा सहकर्मीहरूसँग फलदायी सहकार्य हुन्छ।',
  },
  Moon: {
    MC: 'जनसम्पर्क, सेवा, स्वास्थ्य, आतिथ्य र लोक-भावनासँग जोडिएका कार्यमा नाम र सफलता दिन्छ।',
    IC: 'आफ्नै घरजस्तो आत्मीयता, मानसिक शान्ति र भावनात्मक सुरक्षाको गहिरो अनुभूति गराउँछ।',
    ASC: 'अन्तर्ज्ञान, संवेदनशीलता र अरूको भावना बुझ्ने क्षमता प्रबल बनाउँछ।',
    DSC: 'स्नेही, हेरचाह गर्ने र पारिवारिक भावनायुक्त सम्बन्धलाई बलियो बनाउँछ।',
  },
  Mars: {
    MC: 'उद्यमशीलता, साहस, प्राविधिक/खेलकुद वा प्रतिस्पर्धात्मक काममा तीव्र गति दिन्छ; धैर्य कायम राख्नु उत्तम।',
    IC: 'भवन निर्माण वा सक्रिय घरायसी कार्यमा ऊर्जा दिन्छ; घरमा शान्त संवाद राख्नु हितकर हुन्छ।',
    ASC: 'साहस, शारीरिक स्फूर्ति र छिटो निर्णय लिने नेतृत्व क्षमता जगाउँछ।',
    DSC: 'ऊर्जाशील र सक्रिय साझेदारी दिन्छ, जहाँ आपसी धैर्य र स्पष्ट सीमा आवश्यक पर्छ।',
  },
  Saturn: {
    MC: 'अनुशासन, कडा परिश्रम र जिम्मेवारीमार्फत दीर्घकालीन संस्थागत उचाइ र स्थायी प्रतिष्ठा दिलाउँछ।',
    IC: 'शान्त, एकान्त र अनुशासित जीवनशैली तथा गहिरो एकाग्रताका लागि उपयुक्त क्षेत्र।',
    ASC: 'परिपक्वता, गम्भीर व्यक्तित्व र दीर्घकालीन सहनशक्ति निर्माण गर्छ।',
    DSC: 'सम्बन्ध र साझेदारीमा निष्ठा, कर्तव्यबोध र दीर्घकालीन प्रतिबद्धता सिकाउँछ।',
  },
  Uranus: {
    MC: 'नवीन प्रविधि, विज्ञान, मौलिक आविष्कार र स्वतन्त्र उद्यममा अप्रत्याशित फड्को दिलाउँछ।',
    IC: 'परम्परागत सीमाभन्दा माथि उठेर स्वतन्त्र र आधुनिक जीवनशैली सुरु गर्न प्रेरित गर्छ।',
    ASC: 'व्यक्तित्वमा मौलिकता, नवप्रवर्तन र स्वतन्त्र आत्म-पहिचान जागृत गर्छ।',
    DSC: 'प्रतिभाशाली, प्रगतिशील र प्रेरणादायी मित्र तथा साझेदारहरू भेटाउँछ।',
  },
  Neptune: {
    MC: 'संगीत, चलचित्र, कला, चिकित्सा, सेवा र आध्यात्मिक क्षेत्रमा प्रेरणादायी उचाइ दिन्छ।',
    IC: 'ध्यान, साधना, आश्रम वा तटीय/हिमाली शान्त वासका लागि अत्यन्त अनुकूल स्थान।',
    ASC: 'करुणा, कलात्मक संवेदना र आध्यात्मिक आभा वृद्धि गर्छ।',
    DSC: 'आध्यात्मिक र भावनात्मक रूपमा गहिरो आत्मीय सम्बन्ध विकास गराउँछ।',
  },
  Pluto: {
    MC: 'गहिरो रणनीति, अनुसन्धान, वित्त र रूपान्तरणकारी नेतृत्वमा विशेष प्रभाव दिन्छ।',
    IC: 'भित्री मनोबल पुनर्जागरण र मूल जरादेखिको आत्म-परिवर्तनमा सघाउँछ।',
    ASC: 'अटल आत्मविश्वास, संकट जित्ने शक्ति र प्रभावशाली व्यक्तित्व निर्माण गर्छ।',
    DSC: 'जीवनलाई गहिरो अर्थ दिने रूपान्तरणकारी सम्बन्ध र सहकार्य जुराउँछ।',
  },
};

const STATE_NE: Record<string, string> = {
  'Bagmati Province': 'बागमती प्रदेश',
  'Gandaki Province': 'गण्डकी प्रदेश',
  'Koshi Province': 'कोशी प्रदेश',
  'Lumbini Province': 'लुम्बिनी प्रदेश',
  'Madhesh Province': 'मधेश प्रदेश',
  'Karnali Province': 'कर्णाली प्रदेश',
  'Sudurpashchim Province': 'सुदूरपश्चिम प्रदेश',
  NSW: 'न्यु साउथ वेल्स',
  VIC: 'भिक्टोरिया',
  QLD: 'क्विन्सल्याण्ड',
  WA: 'वेस्टर्न अष्ट्रेलिया',
  SA: 'साउथ अष्ट्रेलिया',
  ACT: 'अष्ट्रेलियन क्यापिटल टेरिटोरी',
  TAS: 'तास्मानिया',
  NT: 'नर्दर्न टेरिटोरी',
  England: 'इङ्गल्याण्ड',
  Scotland: 'स्कटल्याण्ड',
  Ontario: 'ओन्टारियो',
  Quebec: 'क्युबेक',
  Alberta: 'अल्बर्टा',
  BC: 'ब्रिटिश कोलम्बिया',
  NY: 'न्युयोर्क राज्य',
  CA: 'क्यालिफोर्निया',
  Washington: 'वाशिङ्गटन',
  IL: 'इलिनोइस',
  TX: 'टेक्सास',
  FL: 'फ्लोरिडा',
  Delhi: 'दिल्ली',
  Maharashtra: 'महाराष्ट्र',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  'Madhya Pradesh': 'मध्य प्रदेश',
  Karnataka: 'कर्नाटक',
  'West Bengal': 'पश्चिम बङ्गाल',
  'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलङ्गाना',
  Kanto: 'कान्तो',
  Central: 'मध्य क्षेत्र',
  Dubai: 'दुबई',
  'Ad Dawhah': 'दोहा',
  Auckland: 'अकल्याण्ड',
  Seoul: 'सोल',
  Zürich: 'ज्यूरिख',
  Bohemia: 'बोहेमिया',
  'Île-de-France': 'पेरिस क्षेत्र',
  Berlin: 'बर्लिन',
  Estremadura: 'लिस्बन क्षेत्र',
  SP: 'साओ पाउलो',
  Thimphu: 'थिम्पु',
  Western: 'पश्चिमी प्रदेश',
};

const VEDIC_PLANET_DIRECTIONS: Record<
  string,
  { en: string; ne: string; detailEn: string; detailNe: string }
> = {
  Sun: {
    en: 'East (Purva)',
    ne: 'पूर्व दिशा',
    detailEn: 'favoring capital hubs, executive headquarters, and sunlit eastern corridors',
    detailNe: 'राजधानी, प्रशासनिक केन्द्र र पूर्वी सहरहरूमा विशेष उन्नति र प्रतिष्ठा प्राप्त हुन्छ',
  },
  Venus: {
    en: 'Southeast (Agneya)',
    ne: 'आग्नेय (दक्षिण-पूर्व) दिशा',
    detailEn: 'favoring vibrant commercial, creative, hospitality, and design centers',
    detailNe: 'व्यापारिक, कलात्मक र जीवन्त आर्थिक सहरहरूमा धन तथा लोकप्रियता बढ्छ',
  },
  Mars: {
    en: 'South (Dakshina)',
    ne: 'दक्षिण दिशा',
    detailEn: 'favoring industrial, engineering, technical, and high-growth entrepreneurial hubs',
    detailNe: 'प्राविधिक, औद्योगिक र उद्यमशील दक्षिणी क्षेत्रहरूमा कर्मबल र साहस फस्टाउँछ',
  },
  Rahu: {
    en: 'Southwest (Nairitya) & Overseas',
    ne: 'नैऋत्य (दक्षिण-पश्चिम) तथा वैदेशिक क्षेत्र',
    detailEn: 'favoring international metropolises, aviation/tech corridors, and cross-border work',
    detailNe: 'अन्तर्राष्ट्रिय महानगर, प्रविधि क्षेत्र र वैदेशिक अवसरहरूबाट तीव्र प्रगति हुन्छ',
  },
  Saturn: {
    en: 'West (Pashchima)',
    ne: 'पश्चिम दिशा',
    detailEn: 'favoring established institutional cities, infrastructure, and steady long-term wealth',
    detailNe: 'स्थापित औद्योगिक/संस्थागत सहर र पश्चिमी क्षेत्रमा दिगो स्थायित्व र सम्पत्ति बन्छ',
  },
  Moon: {
    en: 'Northwest (Vayavya) & Coastal/Riverine Zones',
    ne: 'वायव्य (उत्तर-पश्चिम) तथा जल-तटीय क्षेत्र',
    detailEn: 'favoring coastal cities, travel/trade hubs, healthcare, and public-facing work',
    detailNe: 'समुद्री तट, नदी किनार वा उत्तर-पश्चिमी सहरहरूमा मानसिक शान्ति र जनसम्पर्क बढ्छ',
  },
  Mercury: {
    en: 'North (Uttara)',
    ne: 'उत्तर दिशा',
    detailEn: 'favoring financial districts, universities, software hubs, and intellectual centers',
    detailNe: 'शैक्षिक, वित्तीय, व्यापारिक र बौद्धिक उत्तरी केन्द्रहरूमा विशेष लाभ मिल्छ',
  },
  Jupiter: {
    en: 'Northeast (Ishanya)',
    ne: 'ईशान (उत्तर-पूर्व) दिशा',
    detailEn: 'favoring academic, legal, advisory, spiritual, and peaceful sanctuary cities',
    detailNe: 'ज्ञान, परामर्श, शिक्षा र शान्त ईशान क्षेत्रहरूमा भाग्योदय र सम्मान मिल्छ',
  },
  Ketu: {
    en: 'Northeast & Spiritual/Research Sanctuaries',
    ne: 'ईशान तथा अनुसन्धान/आध्यात्मिक क्षेत्र',
    detailEn: 'favoring quiet research campuses, healing centers, and contemplative towns',
    detailNe: 'शान्त अनुसन्धान केन्द्र, उच्च प्रविधि वा आध्यात्मिक स्थलमा सूक्ष्म प्रज्ञा खुल्छ',
  },
};

function normLonDiff(lonA: number, lonB: number): number {
  let d = lonA - lonB;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function interpolateCurveLonAtLat(
  curve: { lat: number; lon: number }[],
  targetLat: number
): number | null {
  if (!curve.length) return null;
  const clampedLat = Math.max(-64, Math.min(64, targetLat));
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i];
    const b = curve[i + 1];
    if (clampedLat >= a.lat && clampedLat <= b.lat) {
      const t = b.lat === a.lat ? 0 : (clampedLat - a.lat) / (b.lat - a.lat);
      const diff = normLonDiff(b.lon, a.lon);
      let lon = a.lon + t * diff;
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;
      return lon;
    }
  }
  return curve[curve.length - 1].lon;
}

export function normalizeCountryKey(country: string): string {
  const c = country.trim().toLowerCase();
  if (c === 'united states' || c === 'usa' || c === 'u.s.a.' || c === 'us') return 'usa';
  if (c === 'united kingdom' || c === 'uk' || c === 'great britain' || c === 'england') return 'uk';
  if (c === 'united arab emirates' || c === 'uae') return 'uae';
  return c;
}

export function evaluateLocationAstrocartographyLocalized(
  city: CityLocation,
  chart: NatalChartResult,
  lang: AppLanguage = 'en'
): LocalizedCityRelocationEvaluation {
  const isNe = lang === 'ne';
  const influences: LocalizedLineInfluence[] = [];
  const cosLat = Math.max(0.25, Math.cos((city.latitude * Math.PI) / 180));

  for (const line of chart.astrocartography) {
    const planetObj = chart.planets.find((p) => p.name === line.planet);
    const dignity = planetObj?.dignity || 'Neutral';
    const dignityMult =
      dignity === 'Exalted'
        ? 1.25
        : dignity === 'Own Sign'
        ? 1.15
        : dignity === 'Debilitated'
        ? 0.78
        : 1.0;

    const acgMeta = ACG_LINE_INTERPRETATIONS[line.planet];
    if (!acgMeta) continue;

    const ascLon = interpolateCurveLonAtLat(line.ascCurve, city.latitude);
    const dscLon = interpolateCurveLonAtLat(line.dscCurve, city.latitude);

    const candidates: { angle: 'MC' | 'IC' | 'ASC' | 'DSC'; lineLon: number | null }[] = [
      { angle: 'MC', lineLon: line.mcLongitude },
      { angle: 'IC', lineLon: line.icLongitude },
      { angle: 'ASC', lineLon: ascLon },
      { angle: 'DSC', lineLon: dscLon },
    ];

    for (const c of candidates) {
      if (c.lineLon === null) continue;
      const signedDiff = normLonDiff(city.longitude, c.lineLon);
      const orbDegrees = Math.abs(signedDiff);
      if (orbDegrees <= 9.5) {
        const distanceKm = Math.round(orbDegrees * 111.32 * cosLat);
        const meta = acgMeta[c.angle];
        const proximityFactor = Math.max(0.18, 1 - orbDegrees / 10);
        const scoreContribution = Math.round(meta.scoreBoost * proximityFactor * dignityMult);
        const dir: 'East' | 'West' = signedDiff >= 0 ? 'East' : 'West';
        const planetLabel = trPlanet(line.planet, lang);
        const angleNe = ANGLE_META_NE[c.angle];

        influences.push({
          planet: line.planet,
          planetLabel,
          symbol: line.symbol,
          color: line.color,
          angle: c.angle,
          angleLabel: isNe ? angleNe.short : c.angle,
          orbDegrees: Math.round(orbDegrees * 100) / 100,
          distanceKm,
          direction: dir,
          directionLabel: isNe ? (dir === 'East' ? 'पूर्व' : 'पश्चिम') : dir,
          title: isNe ? `${planetLabel} — ${angleNe.full}` : meta.title,
          domain: meta.domain,
          summary: isNe
            ? ACG_SUMMARY_NE[line.planet]?.[c.angle] || meta.summary
            : meta.summary,
          scoreContribution,
          planetDignity: dignity,
        });
      }
    }
  }

  influences.sort(
    (a, b) => b.scoreContribution - a.scoreContribution || a.orbDegrees - b.orbDegrees
  );

  let careerScore = 52;
  let sanctuaryScore = 52;
  let loveScore = 50;

  for (const inf of influences.slice(0, 4)) {
    if (inf.domain === 'Career' || inf.domain === 'Identity') {
      careerScore += inf.scoreContribution * 1.35;
    }
    if (inf.domain === 'Sanctuary' || inf.domain === 'Identity') {
      sanctuaryScore += inf.scoreContribution * 1.35;
    }
    if (inf.domain === 'Love' || inf.domain === 'Sanctuary') {
      loveScore += inf.scoreContribution * 1.35;
    }
    if (['Jupiter', 'Venus', 'Sun'].includes(inf.planet)) {
      careerScore += inf.scoreContribution * 0.4;
      sanctuaryScore += inf.scoreContribution * 0.4;
      loveScore += inf.scoreContribution * 0.4;
    }
  }

  careerScore = Math.min(98, Math.max(44, Math.round(careerScore)));
  sanctuaryScore = Math.min(98, Math.max(44, Math.round(sanctuaryScore)));
  loveScore = Math.min(98, Math.max(44, Math.round(loveScore)));

  const overallScore = Math.min(
    99,
    Math.round(
      Math.max(careerScore, sanctuaryScore, loveScore) * 0.65 +
        ((careerScore + sanctuaryScore + loveScore) / 3) * 0.35
    )
  );

  const topInf = influences[0];
  let primaryTag = isNe ? 'सन्तुलित शान्त आकाश क्षेत्र' : 'Balanced Clear-Sky Zone';
  if (topInf) {
    if (topInf.domain === 'Career') {
      primaryTag = isNe ? 'करियर र प्रतिष्ठा रेखा' : 'Career & Prestige Line';
    } else if (topInf.domain === 'Sanctuary') {
      primaryTag = isNe ? 'शान्ति र आवास रेखा' : 'Home Sanctuary Line';
    } else if (topInf.domain === 'Love') {
      primaryTag = isNe ? 'प्रेम र सहकार्य रेखा' : 'Partnership Line';
    } else {
      primaryTag = isNe ? 'व्यक्तिगत आत्मबल रेखा' : 'Personal Vitality Line';
    }
  }

  const cityLabel = formatCityForLang(city.name, lang);
  const countryLabel = formatCountryForLang(city.country, lang);
  const stateLabel = isNe
    ? city.state === 'WA' && normalizeCountryKey(city.country) === 'usa'
      ? 'वाशिङ्गटन'
      : STATE_NE[city.state] || countryLabel
    : city.state || city.country;

  const headlineVerdict = topInf
    ? isNe
      ? `${topInf.title} (${toNepaliDigits(topInf.distanceKm)} कि.मि. / ${toNepaliDigits(
          topInf.orbDegrees
        )}° दूरी) को प्रभाव क्षेत्र। ${topInf.summary}`
      : `Anchored by your ${topInf.symbol} ${topInf.title} (${topInf.distanceKm} km / ${topInf.orbDegrees}° orb). ${topInf.summary}`
    : isNe
    ? 'तीव्र ग्रह-कोणको दबाबबाट मुक्त शान्त र सन्तुलित क्षेत्र — स्वतन्त्र र स्थिर जीवनशैलीका लागि उपयुक्त।'
    : 'Balanced meridian zone free from intense angular pressure—suited for steady, self-directed living.';

  return {
    city,
    cityLabel,
    stateLabel,
    countryLabel,
    overallScore,
    careerScore,
    sanctuaryScore,
    loveScore,
    primaryTag,
    influences,
    headlineVerdict,
  };
}

export function computePersonalRelocationReport(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedicReport: VedicReport,
  lang: AppLanguage = 'en'
): PersonalRelocationReport {
  const isNe = lang === 'ne';
  const userCountryKey = normalizeCountryKey(profile.location.country || 'Australia');
  const countryNameLabel = formatCountryForLang(profile.location.country, lang);

  // Build deduplicated pool of all global cities + user's exact profile.location
  const cityPoolMap = new Map<string, CityLocation>();
  for (const c of WORLD_CITIES) {
    cityPoolMap.set(c.id, c);
  }
  const cleanUserCity = formatCityForLang(profile.location.name, 'en').toLowerCase();
  const existingMatch = Array.from(cityPoolMap.values()).find(
    (c) =>
      normalizeCountryKey(c.country) === userCountryKey &&
      formatCityForLang(c.name, 'en').toLowerCase() === cleanUserCity
  );
  if (!existingMatch) {
    cityPoolMap.set(profile.location.id || 'user-current-loc', profile.location);
  }

  // Filter cities in user's country
  let domesticCities = Array.from(cityPoolMap.values()).filter(
    (c) => normalizeCountryKey(c.country) === userCountryKey
  );

  // If user selected a smaller country via geocoding with < 4 preloaded cities, synthesize 4 cardinal corridors around their location
  let isSyntheticCountryCorridors = false;
  if (domesticCities.length < 4) {
    isSyntheticCountryCorridors = true;
    const base = profile.location;
    const offsets: { id: string; en: string; ne: string; dLat: number; dLon: number }[] = [
      {
        id: 'north-corridor',
        en: `Northern ${base.country} Corridor`,
        ne: `उत्तरी ${countryNameLabel} क्षेत्र`,
        dLat: 2.4,
        dLon: 0,
      },
      {
        id: 'east-corridor',
        en: `Eastern ${base.country} Corridor`,
        ne: `पूर्वी ${countryNameLabel} क्षेत्र`,
        dLat: 0,
        dLon: 2.8,
      },
      {
        id: 'south-corridor',
        en: `Southern ${base.country} Corridor`,
        ne: `दक्षिणी ${countryNameLabel} क्षेत्र`,
        dLat: -2.4,
        dLon: 0,
      },
      {
        id: 'west-corridor',
        en: `Western ${base.country} Corridor`,
        ne: `पश्चिमी ${countryNameLabel} क्षेत्र`,
        dLat: 0,
        dLon: -2.8,
      },
    ];
    for (const off of offsets) {
      domesticCities.push({
        id: `syn-${off.id}`,
        name: `${off.en} (${off.ne})`,
        state: base.country,
        country: base.country,
        latitude: Math.max(-62, Math.min(62, base.latitude + off.dLat)),
        longitude: ((base.longitude + off.dLon + 540) % 360) - 180,
        elevationMeters: base.elevationMeters,
        timezoneOffsetHours: base.timezoneOffsetHours,
        ianaTimezone: base.ianaTimezone,
      });
    }
  }

  const currentLocation = evaluateLocationAstrocartographyLocalized(
    existingMatch || profile.location,
    natalChart,
    lang
  );

  const domesticEvals = domesticCities.map((c) =>
    evaluateLocationAstrocartographyLocalized(c, natalChart, lang)
  );
  const rankedCountryCities = [...domesticEvals]
    .sort((a, b) => b.overallScore - a.overallScore || b.careerScore - a.careerScore)
    .slice(0, 6);

  const bestOverallInCountry = rankedCountryCities[0] || currentLocation;
  const bestCareerInCountry =
    [...domesticEvals].sort((a, b) => b.careerScore - a.careerScore)[0] || currentLocation;
  const bestSanctuaryInCountry =
    [...domesticEvals].sort((a, b) => b.sanctuaryScore - a.sanctuaryScore)[0] || currentLocation;
  const bestLoveInCountry =
    [...domesticEvals].sort((a, b) => b.loveScore - a.loveScore)[0] || currentLocation;

  // Global evaluations
  const allGlobalEvals = Array.from(cityPoolMap.values()).map((c) =>
    evaluateLocationAstrocartographyLocalized(c, natalChart, lang)
  );
  const topGlobalCareer =
    [...allGlobalEvals].sort((a, b) => b.careerScore - a.careerScore)[0] || currentLocation;
  const topGlobalSanctuary =
    [...allGlobalEvals].sort((a, b) => b.sanctuaryScore - a.sanctuaryScore)[0] || currentLocation;
  const topGlobalLove =
    [...allGlobalEvals].sort((a, b) => b.loveScore - a.loveScore)[0] || currentLocation;

  const topInternationalCities = allGlobalEvals
    .filter((e) => normalizeCountryKey(e.city.country) !== userCountryKey)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 4);

  // Classical Vedic Bhagyodaya Direction (10th & 9th House Lords) + Videsha (Foreign Settlement) Yoga
  const ascSignIdx = natalChart.ascendant.signIndex;
  const tenthSignIdx = (ascSignIdx + 9) % 12;
  const ninthSignIdx = (ascSignIdx + 8) % 12;
  const twelfthSignIdx = (ascSignIdx + 11) % 12;
  const fourthSignIdx = (ascSignIdx + 3) % 12;

  const tenthLordName = ZODIAC_SIGNS[tenthSignIdx].ruler;
  const ninthLordName = ZODIAC_SIGNS[ninthSignIdx].ruler;
  const twelfthLordName = ZODIAC_SIGNS[twelfthSignIdx].ruler;

  const dirSpec = VEDIC_PLANET_DIRECTIONS[tenthLordName] || VEDIC_PLANET_DIRECTIONS.Sun;
  const dharmaDirSpec = VEDIC_PLANET_DIRECTIONS[ninthLordName] || VEDIC_PLANET_DIRECTIONS.Jupiter;

  const tenthLordNe = trPlanet(tenthLordName, 'ne');
  const ninthLordNe = trPlanet(ninthLordName, 'ne');

  const vedicDirectionHeadline = isNe
    ? `शास्त्रीय भाग्योदय दिशा: ${dirSpec.ne} (कर्मेश ${tenthLordNe}) र ${dharmaDirSpec.ne} (भाग्येश ${ninthLordNe})`
    : `Vedic Bhagyodaya Direction: ${dirSpec.en} (10th Lord ${tenthLordName}) & ${dharmaDirSpec.en} (9th Lord ${ninthLordName})`;

  const vedicDirectionNarrative = isNe
    ? `बृहत् पाराशर होरा शास्त्र र प्रश्नमार्गको दिग्बल सिद्धान्त अनुसार तपाईंको दशमेश ${tenthLordNe} ले ${dirSpec.ne} तर्फ इङ्गित गर्दछ — जहाँ ${dirSpec.detailNe}। साथै नवमेश ${ninthLordNe} ले ${dharmaDirSpec.ne} बाट भाग्य र उच्च मार्गदर्शन जुराउँछ।`
    : `According to Parashari and Prashna Marga directional astrology (Dig-Chakra), your 10th Career Lord (${tenthLordName}) points toward the ${dirSpec.en}—${dirSpec.detailEn}—while your 9th Fortune Lord (${ninthLordName}) activates mentorship and luck toward the ${dharmaDirSpec.en}.`;

  // Foreign Travel & Settlement (Videsha Yoga) check:
  // Chara (Movable) Ascendant/Moon (0,3,6,9), Rahu in 1/4/7/9/10/12, Planets in 9th/12th, or 12th lord in Kendra/Trikona
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const rahuPlanet = natalChart.planets.find((p) => p.id === 'Rahu');
  const twelfthLordPlanet = natalChart.planets.find((p) => p.name === twelfthLordName);
  const planetsIn12th = natalChart.planets.filter(
    (p) => !['Uranus', 'Neptune', 'Pluto'].includes(p.id) && p.signIndex === twelfthSignIdx
  );
  const planetsIn9th = natalChart.planets.filter(
    (p) => !['Uranus', 'Neptune', 'Pluto'].includes(p.id) && p.signIndex === ninthSignIdx
  );

  let foreignPoints = 0;
  if ([0, 3, 6, 9].includes(ascSignIdx)) foreignPoints += 2;
  if ([0, 3, 6, 9].includes(moonPlanet.signIndex)) foreignPoints += 1;
  if (rahuPlanet && [1, 4, 7, 9, 10, 12].includes(rahuPlanet.house)) foreignPoints += 2;
  if (planetsIn12th.length > 0) foreignPoints += 2;
  if (planetsIn9th.length >= 2) foreignPoints += 1;
  if (twelfthLordPlanet && [1, 4, 5, 7, 9, 10].includes(twelfthLordPlanet.house)) foreignPoints += 2;
  // Check SAV of 12th vs 4th house
  const sav4 = vedicReport.sarvashtakavarga.find((s) => s.signIndex === fourthSignIdx)?.bindus ?? 28;
  const sav12 = vedicReport.sarvashtakavarga.find((s) => s.signIndex === twelfthSignIdx)?.bindus ?? 28;
  if (sav12 >= sav4) foreignPoints += 1;

  let foreignYogaBadge: string;
  let foreignYogaTone: 'optimal' | 'favorable' | 'info';
  let foreignYogaNarrative: string;

  if (foreignPoints >= 6) {
    foreignYogaBadge = isNe ? 'प्रबल विदेश एवं अन्तर्राष्ट्रिय योग' : 'Strong Global Mobility (Videsha Yoga)';
    foreignYogaTone = 'optimal';
    foreignYogaNarrative = isNe
      ? `तपाईंको कुण्डलीमा नवम/द्वादश भाव, चर राशि र राहुको स्थितिले प्रबल 'विदेश यात्रा तथा अन्तर्राष्ट्रिय कर्म योग' देखाउँछ (चतुर्थ गृहनगर बल ${toNepaliDigits(
          sav4
        )} बिन्दु बनाम द्वादश बाह्य बल ${toNepaliDigits(
          sav12
        )} बिन्दु)। जन्मस्थानबाहिरको सहर, बहुराष्ट्रिय संस्था वा वैदेशिक भूमिमा अध्ययन, व्यापार र बसोबासबाट उल्लेखनीय उन्नति हुने योग छ।`
      : `Your 9th/12th house dynamics, movable sign emphasis, and nodal placement form a strong classical Videsha Yoga (Home 4th SAV: ${sav4} pts vs. Distant-Lands 12th SAV: ${sav12} pts). Studying, consulting, or relocating outside your birthplace—or working with international markets—unlocks major career and wealth acceleration.`;
  } else if (foreignPoints >= 4) {
    foreignYogaBadge = isNe ? 'स्वदेश र विदेश दुवैमा सन्तुलित अवसर' : 'Dual Homeland & International Bridge';
    foreignYogaTone = 'favorable';
    foreignYogaNarrative = isNe
      ? `कुण्डलीमा स्वदेशको चतुर्थ भाव (${toNepaliDigits(
          sav4
        )} बिन्दु) र बाह्य द्वादश भाव (${toNepaliDigits(
          sav12
        )} बिन्दु) बीच राम्रो सन्तुलन छ। तपाईं ${countryNameLabel} भित्रका प्रमुख सहरमा बसेरै अन्तर्राष्ट्रिय सञ्जाल, वैदेशिक व्यापार वा आवधिक विदेश यात्राबाट दुवै तर्फको लाभ लिन सक्नुहुन्छ।`
      : `Your chart balances domestic roots (4th House SAV: ${sav4} pts) with cross-border reach (12th House SAV: ${sav12} pts). You thrive either in major hubs within ${countryNameLabel} connected to global clients, or through periodic international study and project stints.`;
  } else {
    foreignYogaBadge = isNe ? 'स्वदेश एवं मातृभूमिमा सुदृढ जरा' : 'Strong Homeland & Domestic Mastery';
    foreignYogaTone = 'info';
    foreignYogaNarrative = isNe
      ? `कुण्डलीको चतुर्थ सुख भाव (${toNepaliDigits(
          sav4
        )} बिन्दु) सुदृढ भएकाले दीर्घकालीन शान्ति, अचल सम्पत्ति र प्रतिष्ठा आफ्नै देश (${countryNameLabel}) भित्रका अनुकूल सहरहरूमा अझ बलियो र स्थिर रहन्छ; विदेश यात्रालाई छोटो भ्रमण वा व्यापार विस्तारमा प्रयोग गर्नु उत्तम हुन्छ।`
      : `With strong 4th-house domestic anchorage (${sav4} SAV bindus), your deepest wealth retention, real-estate stability, and community prestige flourish within ${countryNameLabel}, using international travel selectively for leisure and strategic partnerships.`;
  }

  const countrySummaryNarrative = isNe
    ? `तपाईंको हालको स्थान ${currentLocation.cityLabel} (${countryNameLabel}) को समग्र स्थान-अनुकूलता ${toNepaliDigits(
        currentLocation.overallScore
      )}% छ (करियर ${toNepaliDigits(currentLocation.careerScore)}% • आवास शान्ति ${toNepaliDigits(
        currentLocation.sanctuaryScore
      )}% • सम्बन्ध ${toNepaliDigits(
        currentLocation.loveScore
      )}%)। ${countryNameLabel} भित्र तपाईंको जन्म कुण्डलीका ग्रह रेखा अनुसार करियरका लागि '${
        bestCareerInCountry.cityLabel
      }' (${toNepaliDigits(
        bestCareerInCountry.careerScore
      )}%), पारिवारिक सुख-शान्तिका लागि '${bestSanctuaryInCountry.cityLabel}' (${toNepaliDigits(
        bestSanctuaryInCountry.sanctuaryScore
      )}%) र दाम्पत्य/साझेदारीका लागि '${bestLoveInCountry.cityLabel}' (${toNepaliDigits(
        bestLoveInCountry.loveScore
      )}%) सर्वाधिक अनुकूल देखिएका छन्।`
    : `Your current location ${currentLocation.cityLabel} (${countryNameLabel}) carries a ${currentLocation.overallScore}% astrocartography alignment (Career ${currentLocation.careerScore}% • Home Sanctuary ${currentLocation.sanctuaryScore}% • Love ${currentLocation.loveScore}%). Across ${countryNameLabel}, your planetary meridian/horizon lines peak for career in ${bestCareerInCountry.cityLabel} (${bestCareerInCountry.careerScore}%), for peaceful home life in ${bestSanctuaryInCountry.cityLabel} (${bestSanctuaryInCountry.sanctuaryScore}%), and for relationships in ${bestLoveInCountry.cityLabel} (${bestLoveInCountry.loveScore}%).`;

  const sourceCitation = isNe
    ? 'शास्त्रीय तथा खगोलीय आधार: बृहत् पाराशर होरा शास्त्र (अ. २०, २३ विदेश र दिग्बल), प्रश्नमार्ग र जिम लुइस एस्ट्रोकार्टोग्राफी (दशम/चतुर्थ/लग्न/सप्तम कोण रेखा)'
    : 'Lineage: Brihat Parashara Hora Shastra (Ch. 20 & 23 Dig-Bala & Videsha Yoga), Prashna Marga & Jim Lewis Astro*Carto*Graphy (MC/IC/ASC/DSC)';

  return {
    currentLocation,
    countryNameLabel,
    isSyntheticCountryCorridors,
    bestOverallInCountry,
    bestCareerInCountry,
    bestSanctuaryInCountry,
    bestLoveInCountry,
    rankedCountryCities,
    countrySummaryNarrative,
    topGlobalCareer,
    topGlobalSanctuary,
    topGlobalLove,
    topInternationalCities,
    vedicDirectionHeadline,
    vedicDirectionNarrative,
    foreignYogaBadge,
    foreignYogaTone,
    foreignYogaNarrative,
    sourceCitation,
  };
}
