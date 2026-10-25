import React, { createContext, useContext, useEffect, useState } from 'react';
import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { HoraiLordId, HoraiSlot, PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { CosmicSynthesisReport } from '../engines/synthesisEngine';
import { cleanCityName } from '../engines/locationAtlas';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import {
  buildPlainEnglishPersonalSummary,
  DASHA_PLAIN_GUIDE,
  HOUSE_PLAIN_GUIDE,
  HousePlainMeaning,
  PlainEnglishPersonalSummary,
  PLANET_PLAIN_ROLES,
} from '../data/plainEnglishGuide';
import { ActionCategory, LifeActionSpec } from '../data/karmaAndMuhurtaCodex';

export interface DashaPlainMeaning {
  chapterTitle: string;
  plainMeaning: string;
  bestFocus: string;
  watchOutFor: string;
}

export type AppLanguage = 'en' | 'ne';

const STORAGE_KEY = 'oceanology_lang';

/* ==================== 1. CITY & COUNTRY LOCALIZATION ==================== */
const GLOBAL_CITY_NE: Record<string, string> = {
  Varanasi: 'वाराणसी',
  'New Delhi': 'नयाँ दिल्ली',
  Mumbai: 'मुम्बई',
  Bengaluru: 'बैङ्गलोर',
  Kolkata: 'कोलकाता',
  Chennai: 'चेन्नई',
  Ujjain: 'उज्जैन',
  Ayodhya: 'अयोध्या',
  Haridwar: 'हरिद्वार',
  Lhasa: 'ल्हासा',
  Thimphu: 'थिम्पु',
  Dhaka: 'ढाका',
  Colombo: 'कोलम्बो',
  Bangkok: 'बैंकक',
  Singapore: 'सिङ्गापुर',
  Tokyo: 'टोकियो',
  Kyoto: 'क्योटो',
  Seoul: 'सोल',
  'Hong Kong': 'हङकङ',
  Dubai: 'दुबई',
  Doha: 'दोहा',
  London: 'लण्डन',
  Paris: 'पेरिस',
  Zurich: 'ज्यूरिख',
  'Zürich': 'ज्यूरिख',
  Prague: 'प्राग',
  Lisbon: 'लिस्बन',
  Berlin: 'बर्लिन',
  Rome: 'रोम',
  Athens: 'एथेन्स',
  Hyderabad: 'हैदराबाद',
  Darjeeling: 'दार्जिलिङ',
  'New York': 'न्युयोर्क',
  'New York City': 'न्युयोर्क',
  Boston: 'बोस्टन',
  Austin: 'अस्टिन',
  Seattle: 'सियाटल',
  'San Francisco': 'सान फ्रान्सिस्को',
  'Los Angeles': 'लस एन्जलस',
  Chicago: 'शिकागो',
  Toronto: 'टोरोन्टो',
  Vancouver: 'भ्यानकुभर',
  Sydney: 'सिडनी',
  Melbourne: 'मेलबर्न',
  Brisbane: 'ब्रिस्बेन',
  Auckland: 'अकल्याण्ड',
};

const COUNTRY_NE: Record<string, string> = {
  Nepal: 'नेपाल',
  India: 'भारत',
  'United Kingdom': 'बेलायत',
  'United States': 'अमेरिका',
  USA: 'अमेरिका',
  Japan: 'जापान',
  Australia: 'अष्ट्रेलिया',
  Canada: 'क्यानाडा',
  France: 'फ्रान्स',
  Germany: 'जर्मनी',
  Switzerland: 'स्विट्जरल्याण्ड',
  Singapore: 'सिङ्गापुर',
  Thailand: 'थाइल्याण्ड',
  UAE: 'युएई',
  'United Arab Emirates': 'युएई',
  Qatar: 'कतार',
  'South Korea': 'दक्षिण कोरिया',
  China: 'चीन',
  Tibet: 'तिब्बत',
  Bhutan: 'भुटान',
  Bangladesh: 'बङ्गलादेश',
  'Sri Lanka': 'श्रीलङ्का',
  Italy: 'इटाली',
  Greece: 'ग्रीस',
  'New Zealand': 'न्युजिल्याण्ड',
  'Custom Pin': 'कस्टम पिन',
};

export function formatCityForLang(rawName: string, lang: AppLanguage): string {
  if (lang === 'en') {
    return cleanCityName(rawName);
  }
  // Extract native Devanagari inside parentheses e.g. "Kathmandu (काठमाडौँ)" -> "काठमाडौँ"
  const parenMatch = rawName.match(/\(([^)]+)\)/);
  if (parenMatch && /[\u0900-\u097F]/.test(parenMatch[1])) {
    return parenMatch[1].trim();
  }
  const clean = cleanCityName(rawName);
  return GLOBAL_CITY_NE[clean] || clean;
}

export function formatCountryForLang(country: string, lang: AppLanguage): string {
  if (lang === 'en') return country;
  return COUNTRY_NE[country] || country;
}

export function toNepaliDigits(val: string | number): string {
  const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

/* ==================== 2. CORE JYOTISH ENTITIES IN NEPALI ==================== */
const SIGN_NE: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृष',
  Gemini: 'मिथुन',
  Cancer: 'कर्कट',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुम्भ',
  Pisces: 'मीन',
};

const PLANET_NE: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चन्द्र',
  Mars: 'मङ्गल',
  Mercury: 'बुध',
  Jupiter: 'बृहस्पति',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
  'North Node (Rahu)': 'राहु',
  'South Node (Ketu)': 'केतु',
  Uranus: 'अरुण',
  Neptune: 'वरुण',
  Pluto: 'यम',
  Ascendant: 'लग्न',
};

const DIGNITY_NE: Record<string, string> = {
  Exalted: 'उच्च',
  'Own Sign': 'स्वगृही',
  'Moolatrikona': 'मूलत्रिकोण',
  Friendly: 'मित्र',
  Neutral: 'सम',
  Enemy: 'शत्रु',
  Debilitated: 'नीच',
  Angle: 'केन्द्र',
};

const NAKSHATRA_NE: Record<string, string> = {
  Ashwini: 'अश्विनी',
  Bharani: 'भरणी',
  Krittika: 'कृत्तिका',
  Rohini: 'रोहिणी',
  Mrigashira: 'मृगशिरा',
  Ardra: 'आर्द्रा',
  Punarvasu: 'पुनर्वसु',
  Pushya: 'पुष्य',
  Ashlesha: 'अश्लेषा',
  Magha: 'मघा',
  'Purva Phalguni': 'पूर्व फाल्गुनी',
  'Uttara Phalguni': 'उत्तर फाल्गुनी',
  Hasta: 'हस्त',
  Chitra: 'चित्रा',
  Swati: 'स्वाती',
  Vishakha: 'विशाखा',
  Anuradha: 'अनुराधा',
  Jyeshtha: 'ज्येष्ठा',
  Mula: 'मूल',
  'Purva Ashadha': 'पूर्वाषाढा',
  'Uttara Ashadha': 'उत्तराषाढा',
  Abhijit: 'अभिजित्',
  Shravana: 'श्रवण',
  Dhanishtha: 'धनिष्ठा',
  Shatabhisha: 'शतभिषा',
  'Purva Bhadrapada': 'पूर्व भाद्रपदा',
  'Uttara Bhadrapada': 'उत्तर भाद्रपदा',
  Revati: 'रेवती',
};

const VARA_NE: Record<string, string> = {
  Sunday: 'आइतबार',
  Monday: 'सोमबार',
  Tuesday: 'मङ्गलबार',
  Wednesday: 'बुधबार',
  Thursday: 'बिहीबार',
  Friday: 'शुक्रबार',
  Saturday: 'शनिबार',
};

export function trSign(signName: string, lang: AppLanguage): string {
  if (lang === 'en') return signName;
  return SIGN_NE[signName] || signName;
}

export function trPlanet(planetName: string, lang: AppLanguage): string {
  if (lang === 'en') return planetName;
  return PLANET_NE[planetName] || planetName;
}

export function trDignity(dignity: string, lang: AppLanguage): string {
  if (lang === 'en') return dignity;
  return DIGNITY_NE[dignity] || dignity;
}

export function trNakshatra(nakName: string, lang: AppLanguage): string {
  if (lang === 'en') return nakName;
  return NAKSHATRA_NE[nakName] || nakName;
}

export function trVara(varaFull: string, lang: AppLanguage): string {
  if (lang === 'en') return varaFull;
  const firstWord = varaFull.split(' ')[0];
  return VARA_NE[firstWord] || varaFull;
}

/* ==================== 3. HORAI & GOWRI NEPALI TRANSLATIONS ==================== */
interface NepaliHoraiMeta {
  horaiName: string;
  quality: string;
  flowerName: string;
  plainSummary: string;
  bestFor: string[];
  avoidFor: string[];
}

export const HORAI_NE_META: Record<HoraiLordId, NepaliHoraiMeta> = {
  Venus: {
    horaiName: 'शुक्र होरा',
    quality: 'सर्वोत्तम शुभ',
    flowerName: 'श्वेत चमेली / कमल',
    plainSummary:
      'लक्ष्मी कृपा, धन-सम्पत्ति, सुन-गरगहना खरिद, विवाह प्रस्ताव, सवारी साधन र पारिवारिक आनन्दका लागि उत्कृष्ट समय।',
    bestFor: ['सुन, चाँदी र रत्न खरिद', 'विवाह, प्रेम र पारिवारिक वार्ता', 'सवारी साधन र कलात्मक कार्य'],
    avoidFor: ['कठोर कानुनी विवाद', 'पुरानो संरचना भत्काउने काम'],
  },
  Jupiter: {
    horaiName: 'गुरु (बृहस्पति) होरा',
    quality: 'सर्वोत्तम शुभ',
    flowerName: 'स्वर्ण सयपत्री (गेंदा)',
    plainSummary:
      'ज्ञान, शुभ संस्कार, नयाँ व्यवसाय सुरुवात, बैंक/वित्तीय कार्य, विवाह, गृहप्रवेश र गुरुजनको आशीर्वादका लागि सर्वोत्तम होरा।',
    bestFor: ['नयाँ व्यापार, लगानी र बचत', 'विवाह, नामकरण र विद्यारम्भ', 'मन्त्र जप र उच्च निर्णय'],
    avoidFor: ['झै-झगडा वा छलकपटपूर्ण कार्य'],
  },
  Mercury: {
    horaiName: 'बुध होरा',
    quality: 'शुभ (बौद्धिक)',
    flowerName: 'पारिजात र तुलसी',
    plainSummary:
      'सम्झौता हस्ताक्षर, लेखन, अध्ययन, कोडिङ, व्यापारिक वार्ता, लेखापरीक्षण र तीव्र सञ्चारका लागि अत्यन्त अनुकूल समय।',
    bestFor: ['सम्झौता र कागजात हस्ताक्षर', 'अध्ययन, परीक्षा र सफ्टवेयर/अनुसन्धान', 'छोटो व्यापारिक यात्रा'],
    avoidFor: ['भावनात्मक आवेगमा निर्णय लिन'],
  },
  Moon: {
    horaiName: 'चन्द्र होरा',
    quality: 'शुभ (सौम्य)',
    flowerName: 'श्वेत कुमुद लिली',
    plainSummary:
      'यात्रा, औषधि उपचार, कृषि/बगैँचा, जनसम्पर्क, आतिथ्य र मनको शान्तिका लागि मधुर र पोषणदायी समय।',
    bestFor: ['यात्रा सुरुवात र जनसम्पर्क', 'औषधि सेवन र स्वास्थ्य लाभ', 'खाद्य, तरल पदार्थ र घरायसी कार्य'],
    avoidFor: ['कठोर दीर्घकालीन ऋण वा मुद्दा-मामिला'],
  },
  Sun: {
    horaiName: 'सूर्य होरा',
    quality: 'राजकीय / मध्यम',
    flowerName: 'रातो-स्वर्ण कमल',
    plainSummary:
      'सरकारी कामकाज, उच्च अधिकारी भेटघाट, नेतृत्व, पदभार ग्रहण र आत्मविश्वासपूर्ण प्रस्तुतिहरूका लागि बलियो समय।',
    bestFor: ['सरकारी निवेदन र प्रशासनिक भेट', 'पदभार ग्रहण र नेतृत्व निर्णय', 'पिता वा वरिष्ठसँग परामर्श'],
    avoidFor: ['गृहप्रवेश वा कोमल वैवाहिक वार्ता (अहंकार बढ्न सक्ने)'],
  },
  Mars: {
    horaiName: 'मङ्गल होरा',
    quality: 'उग्र (ऋण मोचन)',
    flowerName: 'रातो गुडहल (जवाकुसुम)',
    plainSummary:
      'तीव्र ऊर्जा र साहसको घडी—पुरानो ऋण तिर्न, शल्यक्रिया, जग्गा जाँच र प्राविधिक/साहसिक कार्यका लागि उत्तम; कोमल शुभ कार्यमा प्रतीक्षा गर्नुहोस्।',
    bestFor: ['पुरानो ऋण चुक्ता (ऋण मोचन)', 'खेतीपाती, इन्जिनियरिङ र व्यायाम', 'कानुनी प्रतिरक्षा र साहसिक कदम'],
    avoidFor: ['नयाँ ऋण लिने वा दिने', 'विवाह, यात्रा वा शान्ति वार्ता'],
  },
  Saturn: {
    horaiName: 'शनि होरा',
    quality: 'मन्द (सावधानी)',
    flowerName: 'नीलो अपराजिता',
    plainSummary:
      'धैर्य र अनुशासनको समय—पुराना अधुरा काम फत्ते गर्न, सरसफाइ, फलाम/मेसिनरी र ध्यानका लागि ठीक; नयाँ शुभ कार्य सुरु नगर्नुहोस्।',
    bestFor: ['पुरानो पेन्डिङ काम र अडिट पूरा गर्न', 'सरसफाइ, मर्मत र खनिज/मेसिनरी काम', 'ध्यान, सेवा र संयम'],
    avoidFor: ['नयाँ व्यवसाय, विवाह वा गृहप्रवेश सुरु गर्न', 'यात्रा वा नयाँ ऋण सम्झौता'],
  },
};

const GOWRI_NE: Record<string, string> = {
  Amirtham: 'अमृतम्',
  Dhanam: 'धनम्',
  Labham: 'लाभम्',
  Sugam: 'सुखम्',
  Uthi: 'उद्योग (उति)',
  Rogam: 'रोगम्',
  Visham: 'विषम्',
  Kalaham: 'कलहम्',
};

export function trGowriName(name: string, lang: AppLanguage): string {
  if (lang === 'en') return name;
  return GOWRI_NE[name] || name;
}

export function trHoraiDisplay(slot: HoraiSlot, lang: AppLanguage) {
  if (lang === 'en') {
    return {
      horaiName: slot.horaiName,
      lordLabel: slot.lord,
      quality: slot.quality,
      flowerName: slot.sacredFlower.name,
      plainSummary: slot.plainSummary,
      bestFor: slot.bestFor,
      avoidFor: slot.avoidFor,
    };
  }
  const m = HORAI_NE_META[slot.lord];
  return {
    horaiName: m.horaiName,
    lordLabel: trPlanet(slot.lord, 'ne'),
    quality: m.quality,
    flowerName: m.flowerName,
    plainSummary: m.plainSummary,
    bestFor: m.bestFor,
    avoidFor: m.avoidFor,
  };
}

/* ==================== 4. 12 HOUSES & 9 DASHAS IN NEPALI ==================== */
const HOUSE_PLAIN_NE: Record<number, HousePlainMeaning> = {
  1: {
    house: 1,
    shortTitle: 'व्यक्तित्व, स्वास्थ्य र आत्मबल',
    lifeAreas: 'शारीरिक ऊर्जा, स्वभाव, प्रथम प्रभाव र जीवनशैली',
    plainDescription: 'तपाईं संसारमा कसरी प्रस्तुत हुनुहुन्छ र तपाईंको प्राकृतिक जीवन-ऊर्जा कस्तो छ भन्ने देखाउँछ।',
    whenStrong: 'बलियो आत्मविश्वास, छिटो स्वास्थ्य लाभ र स्पष्ट व्यक्तिगत पहिचान दिन्छ।',
    whenLow: 'दैनिक दिनचर्या, निद्रा र स्वास्थ्य अनुशासनमा विशेष ध्यान दिनुपर्छ।',
  },
  2: {
    house: 2,
    shortTitle: 'धन, बचत, वाणी र परिवार',
    lifeAreas: 'आम्दानी, बैंक बचत, बोलिवचन, खानपान र पारिवारिक संस्कार',
    plainDescription: 'तपाईं कसरी धन आर्जन र सञ्चय गर्नुहुन्छ तथा तपाईंको वाणीको प्रभाव कस्तो रहन्छ भन्ने जनाउँछ।',
    whenStrong: 'स्थिर आर्थिक बचत, मधुर तथा प्रभावशाली वाणी र पारिवारिक सहयोग मिल्छ।',
    whenLow: 'स्पष्ट बजेट योजना र संयमित बोलिवचनबाट आर्थिक स्थिरता बलियो बन्छ।',
  },
  3: {
    house: 3,
    shortTitle: 'साहस, सीप, सञ्चार र दाजुभाइ',
    lifeAreas: 'लेखन, मिडिया, हातको सीप, छोटो यात्रा र पराक्रम',
    plainDescription: 'तपाईंको पहल गर्ने क्षमता, सिकाइ र दैनिक परिश्रमको गति देखाउँछ।',
    whenStrong: 'तीक्ष्ण सञ्चार कला, व्यावहारिक सीप र आफ्नै मिहिनेतले प्रगति हुन्छ।',
    whenLow: 'एउटै काममा निरन्तर ध्यान केन्द्रित गर्दा छरिएको ऊर्जा सार्थक बन्छ।',
  },
  4: {
    house: 4,
    shortTitle: 'घर, आमा, जग्गा-जमिन र मानसिक शान्ति',
    lifeAreas: 'आवास, अचल सम्पत्ति, सवारी साधन, मातृसुख र भित्री सन्तोष',
    plainDescription: 'तपाईंको भावनात्मक सुरक्षा, घरायसी सुख र भित्री मनको शान्ति जनाउँछ।',
    whenStrong: 'सुखद् पारिवारिक वातावरण, घर-जग्गा लाभ र गहिरो मानसिक स्थिरता मिल्छ।',
    whenLow: 'शान्त घरायसी वातावरण र काम-आरामको सन्तुलन अति आवश्यक हुन्छ।',
  },
  5: {
    house: 5,
    shortTitle: 'बुद्धि, सिर्जनात्मकता, सन्तान र पूर्वपुण्य',
    lifeAreas: 'प्रतिभा, प्रेम, सन्तान सुख, अध्ययन र विवेकशील लगानी',
    plainDescription: 'तपाईंको मौलिक प्रतिभा, सिर्जनात्मक आनन्द र निर्णय क्षमता देखाउँछ।',
    whenStrong: 'तीक्ष्ण मेधा, सिर्जनात्मक सफलता र सन्तान तथा अध्ययनबाट सन्तोष मिल्छ।',
    whenLow: 'जोखिमपूर्ण सट्टाबाजीभन्दा दीर्घकालीन अध्ययन र योजनाबद्ध काम लाभदायी हुन्छ।',
  },
  6: {
    house: 6,
    shortTitle: 'दैनिक कार्य, सेवा, स्वास्थ्य र समस्या समाधान',
    lifeAreas: 'नियमित काम, अनुशासन, पाचन/स्वास्थ्य, ऋण र प्रतिस्पर्धा विजय',
    plainDescription: 'तपाईं दैनिक चुनौती, प्रतिस्पर्धा र स्वास्थ्य दिनचर्यालाई कसरी सम्हाल्नुहुन्छ भन्ने देखाउँछ।',
    whenStrong: 'कठिन समस्या समाधान गर्ने क्षमता, कार्यक्षेत्रमा विजय र बलियो सहनशक्ति दिन्छ।',
    whenLow: 'नियमित व्यायाम, सन्तुलित आहार र ऋण नियन्त्रणमा सजग रहनुपर्छ।',
  },
  7: {
    house: 7,
    shortTitle: 'विवाह, जीवनसाथी, साझेदारी र सम्झौता',
    lifeAreas: 'दाम्पत्य जीवन, व्यावसायिक साझेदारी, ग्राहक र कानुनी सम्झौता',
    plainDescription: 'तपाईंको वैवाहिक सम्बन्ध र एक-आपसको सहकार्य कस्तो रहन्छ भन्ने जनाउँछ।',
    whenStrong: 'विश्वसनीय जीवनसाथी, सफल साझेदारी र सामाजिक सद्भाव प्राप्त हुन्छ।',
    whenLow: 'स्पष्ट संवाद र धैर्यले सम्बन्धमा समझदारी अझ प्रगाढ बनाउँछ।',
  },
  8: {
    house: 8,
    shortTitle: 'गहिरो अनुसन्धान, रूपान्तरण र गुप्त ज्ञान',
    lifeAreas: 'संयुक्त धन, बीमा/कर, अनुसन्धान, ज्योतिष/योग र दीर्घायु',
    plainDescription: 'संकटबाट पुनः उठ्ने शक्ति र गहिरो रहस्य बुझ्ने क्षमता देखाउँछ।',
    whenStrong: 'अनुसन्धान, मनोविज्ञान, ज्योतिष र जटिल संकट व्यवस्थापनमा विशेष दक्षता दिन्छ।',
    whenLow: 'पारदर्शी आर्थिक व्यवहार र मानसिक शान्तिको अभ्यास लाभदायी हुन्छ।',
  },
  9: {
    house: 9,
    shortTitle: 'भाग्य, धर्म, उच्च शिक्षा र लामो यात्रा',
    lifeAreas: 'गुरु कृपा, दर्शन, उच्च अध्ययन, विदेश यात्रा र नैतिकता',
    plainDescription: 'तपाईंको जीवन-दर्शन, भाग्यको साथ र उच्च मार्गदर्शनलाई जनाउँछ।',
    whenStrong: 'उत्तम गुरु र मार्गदर्शकको साथ, उच्च शिक्षा र समयमै भाग्यको सहयोग मिल्छ।',
    whenLow: 'धैर्य, सत्कर्म र निरन्तर सिकाइबाट आफ्नै भाग्य निर्माण हुन्छ।',
  },
  10: {
    house: 10,
    shortTitle: 'करियर, कर्म, प्रतिष्ठा र नेतृत्व',
    lifeAreas: 'पेशा, पदोन्नति, सामाजिक सम्मान, अधिकार र जीवनको योगदान',
    plainDescription: 'तपाईंको सार्वजनिक कर्म, व्यावसायिक उचाइ र नेतृत्व क्षमता देखाउँछ।',
    whenStrong: 'उच्च व्यावसायिक प्रतिष्ठा, नेतृत्व अवसर र ठोस उपलब्धि दिलाउँछ।',
    whenLow: 'निरन्तर गुणस्तरीय काम र धैर्यले दीर्घकालीन सफलता सुनिश्चित गर्छ।',
  },
  11: {
    house: 11,
    shortTitle: 'लाभ, आम्दानी वृद्धि, मित्र र लक्ष्य प्राप्ति',
    lifeAreas: 'आर्थिक लाभ, नेटवर्क, समुदाय, ठूला सपना र दीर्घकालीन उपलब्धि',
    plainDescription: 'तपाईंको परिश्रमबाट प्राप्त हुने प्रतिफल र सहयोगी मित्रमण्डली जनाउँछ।',
    whenStrong: 'सहयोगी मित्र सञ्जाल, आम्दानीका बहु-स्रोत र मनोकांक्षा पूर्ति हुन्छ।',
    whenLow: 'धेरै छरिनुभन्दा थोरै तर इमानदार मित्र र स्पष्ट लक्ष्यमा केन्द्रित हुनुहोस्।',
  },
  12: {
    house: 12,
    shortTitle: 'आध्यात्मिकता, विदेश सम्बन्ध, विश्राम र त्याग',
    lifeAreas: 'ध्यान, निद्रा, एकान्त चिन्तन, वैदेशिक कार्य र दान-पुण्य',
    plainDescription: 'तपाईंको आन्तरिक शान्ति, ध्यान र बाह्य/वैदेशिक आयामलाई जनाउँछ।',
    whenStrong: 'गहिरो आध्यात्मिक अन्तर्दृष्टि, वैदेशिक सफलता र सृजनात्मक कल्पनाशक्ति दिन्छ।',
    whenLow: 'अनावश्यक खर्च नियन्त्रण र पर्याप्त निद्रा/विश्राममा ध्यान दिनुपर्छ।',
  },
};

const DASHA_PLAIN_NE: Record<string, DashaPlainMeaning> = {
  Sun: {
    chapterTitle: 'आत्मविश्वास, नेतृत्व र पहिचानको अध्याय',
    plainMeaning:
      'यस महादशाले तपाईंलाई अगाडि बढेर जिम्मेवारी लिन, नेतृत्व गर्न र आफ्नो वास्तविक परिचय स्थापित गर्न प्रेरित गर्छ।',
    bestFocus: 'करियरमा स्पष्ट लक्ष्य, नेतृत्वदायी भूमिका, स्वास्थ्य र पिता/वरिष्ठसँग सुमधुर सम्बन्ध।',
    watchOutFor: 'अहंकार, अनावश्यक रिस वा अत्यधिक थकानबाट जोगिनुहोस्।',
  },
  Moon: {
    chapterTitle: 'भावनात्मक सन्तुलन, घर-परिवार र जनसम्पर्कको अध्याय',
    plainMeaning:
      'यो कालखण्डमा मनको शान्ति, घरायसी सुख, मातृस्नेह र मानिसहरूसँगको आत्मीय सम्बन्ध प्रमुख बन्छ।',
    bestFocus: 'पारिवारिक सदभाव, आवास सुधार, सिर्जनात्मक कार्य र मानसिक स्वास्थ्य।',
    watchOutFor: 'मनको अस्थिरता र भावनामा बगेर छिटो निर्णय लिने बानी।',
  },
  Mars: {
    chapterTitle: 'साहस, ऊर्जा, कर्म र जग्गा/प्राविधिक प्रगतिको अध्याय',
    plainMeaning:
      'मङ्गलको दशाले तीव्र कार्यक्षमता, साहसिक पहल, ऋण मुक्ति र अचल सम्पत्ति वा प्राविधिक काममा गति दिन्छ।',
    bestFocus: 'सक्रिय परिश्रम, व्यायाम, जग्गा-जमिन वा प्राविधिक परियोजना र साहसी निर्णय।',
    watchOutFor: 'हतारो, वादविवाद वा चोटपटकबाट सतर्क रहनुहोस्।',
  },
  Rahu: {
    chapterTitle: 'महत्वाकांक्षा, नवीन प्रविधि र फड्को मार्ने अध्याय',
    plainMeaning:
      'राहु महादशाले परम्परागत सीमाभन्दा बाहिर निस्केर नयाँ प्रविधि, विदेश सम्बन्ध वा ठूलो व्यावसायिक विस्तारतर्फ लैजान्छ।',
    bestFocus: 'नयाँ सीप, डिजिटल/आधुनिक क्षेत्र, वैदेशिक अवसर र स्पष्ट नैतिक अनुशासन।',
    watchOutFor: 'भ्रम, छिटो धनी बन्ने प्रलोभन र अनिद्राबाट बच्नुहोस्।',
  },
  Jupiter: {
    chapterTitle: 'ज्ञान, समृद्धि, शुभ संस्कार र विस्तारको अध्याय',
    plainMeaning:
      'बृहस्पतिको दशाले शिक्षा, धर्म, आर्थिक उन्नति, विवाह/सन्तान सुख र समाजमा सम्मान विस्तार गर्छ।',
    bestFocus: 'उच्च अध्ययन, शिक्षण, दीर्घकालीन लगानी, विवाह/परिवार र सात्त्विक जीवनशैली।',
    watchOutFor: 'अति-आत्मविश्वास वा आलस्यले अवसर नगुमाउनुहोस्।',
  },
  Saturn: {
    chapterTitle: 'अनुशासन, परिश्रम र दिगो जग निर्माणको अध्याय',
    plainMeaning:
      'शनिको महादशाले सर्टकट होइन, इमानदार परिश्रम र धैर्यको परीक्षा लिँदै दीर्घकालीन र अटल सफलता प्रदान गर्छ।',
    bestFocus: 'नियमित अनुशासन, दीर्घकालीन करियर संरचना, सेवा र जिम्मेवारी बोध।',
    watchOutFor: 'निराशा, ढिलासुस्ती वा स्वास्थ्यको बेवास्ता नगर्नुहोस्।',
  },
  Mercury: {
    chapterTitle: 'बुद्धि, व्यापार, लेखन र सीप विकासको अध्याय',
    plainMeaning:
      'बुधको दशाले अध्ययन, वाणिज्य, सञ्चार, सफ्टवेयर/लेखन र व्यावसायिक नेटवर्किङलाई तीव्र बनाउँछ।',
    bestFocus: 'नयाँ सीप सिकाइ, व्यापार विस्तार, लेखन/सञ्चार र स्मार्ट सम्झौताहरू।',
    watchOutFor: 'एकैपटक धेरै काममा हात हाल्दा हुने मानसिक थकान।',
  },
  Ketu: {
    chapterTitle: 'आत्मचिन्तन, आध्यात्मिक बोध र अनावश्यक बोझ त्याग्ने अध्याय',
    plainMeaning:
      'केतुको दशाले बाहिरी तडकभडकभन्दा भित्री ज्ञान, अनुसन्धान, ध्यान र सूक्ष्म अन्तर्दृष्टिलाई जागृत गर्छ।',
    bestFocus: 'गहिरो अनुसन्धान, ध्यान/साधना, स्वास्थ्य र अनावश्यक झन्झटबाट मुक्ति।',
    watchOutFor: 'एक्लै पन्छिने बानी वा बिना-सल्लाह अचानक काम छोड्ने निर्णय।',
  },
  Venus: {
    chapterTitle: 'प्रेम, कला, सुख-सुविधा र आर्थिक प्रगतिको अध्याय',
    plainMeaning:
      'शुक्रको महादशाले दाम्पत्य/प्रेम सम्बन्ध, कला-सौन्दर्य, सवारी/आवास सुख र आर्थिक समृद्धिमा चमक ल्याउँछ।',
    bestFocus: 'सम्बन्ध सुदृढीकरण, सिर्जनात्मक कार्य, आर्थिक सञ्चय र सन्तुलित जीवनशैली।',
    watchOutFor: 'विलासितामा अनावश्यक खर्च वा आलस्य।',
  },
};

const PLANET_ROLE_NE: Record<string, string> = {
  Sun: 'आत्मा, आत्मविश्वास, नेतृत्व र जीवन-शक्ति',
  Moon: 'मन, भावना, मानसिक शान्ति र घरायसी सुख',
  Mars: 'साहस, ऊर्जा, कार्यक्षमता र सुरक्षा',
  Mercury: 'बुद्धि, वाणी, व्यापार र विश्लेषण क्षमता',
  Jupiter: 'ज्ञान, भाग्य, गुरु कृपा र समृद्धि',
  Venus: 'प्रेम, विवाह, कला, सौन्दर्य र वैभव',
  Saturn: 'अनुशासन, धैर्य, कर्म र दीर्घकालीन स्थायित्व',
  Rahu: 'महत्वाकांक्षा, नवीन प्रविधि र फड्को',
  Ketu: 'आध्यात्मिक बोध, वैराग्य र सूक्ष्म प्रज्ञा',
};

export function trHouseGuide(houseNum: number, lang: AppLanguage): HousePlainMeaning {
  if (lang === 'en') return HOUSE_PLAIN_GUIDE[houseNum] || HOUSE_PLAIN_GUIDE[1];
  return HOUSE_PLAIN_NE[houseNum] || HOUSE_PLAIN_NE[1];
}

export function trDashaGuide(lord: string, lang: AppLanguage): DashaPlainMeaning {
  if (lang === 'en') return DASHA_PLAIN_GUIDE[lord] || DASHA_PLAIN_GUIDE.Jupiter;
  return DASHA_PLAIN_NE[lord] || DASHA_PLAIN_NE.Jupiter;
}

export function trPlanetRole(planetId: string, lang: AppLanguage): string {
  if (lang === 'en') return PLANET_PLAIN_ROLES[planetId] || 'Planetary influence';
  return PLANET_ROLE_NE[planetId] || 'ग्रह प्रभाव';
}

/* ==================== 5. 20 LIFE ACTIONS & CATEGORIES IN NEPALI ==================== */
const ACTION_CAT_NE: Record<string, string> = {
  All: 'सबै कार्य',
  'Wealth & Debt': 'धन र ऋण',
  'Enterprise & Law': 'व्यापार र कानुन',
  'Home & Construction': 'घर र निर्माण',
  'Sacred Rites & Study': 'संस्कार र अध्ययन',
  'Body, Surgery & Grooming': 'स्वास्थ्य र शृङ्गार',
  'Travel & Closure': 'यात्रा र समापन',
};

const ACTION_TITLE_NE: Record<string, { title: string; shortLabel: string }> = {
  LEND_MONEY: { title: 'अरूलाई ऋण वा सापटी दिने (ऋण दान)', shortLabel: 'सापटी दिने' },
  BORROW_MONEY: { title: 'ऋण वा कर्जा लिने (ऋण ग्रहण)', shortLabel: 'ऋण लिने' },
  REPAY_DEBT: { title: 'पुरानो ऋण चुक्ता गर्ने (ऋण मोचन)', shortLabel: 'ऋण तिर्ने' },
  BUY_GOLD_WEALTH: { title: 'सुन, रत्न वा दीर्घकालीन सम्पत्ति खरिद', shortLabel: 'सुन/सम्पत्ति खरिद' },
  LAUNCH_BUSINESS: { title: 'नयाँ व्यवसाय वा पसल शुभारम्भ', shortLabel: 'व्यवसाय सुरु' },
  SIGN_CONTRACT: { title: 'सम्झौता वा कागजातमा हस्ताक्षर', shortLabel: 'सम्झौता हस्ताक्षर' },
  FILE_LITIGATION: { title: 'कानुनी निवेदन, अडिट वा प्रतिरक्षा', shortLabel: 'कानुनी कार्य' },
  LAY_FOUNDATION: { title: 'जग्गा खन्ने र जग शिलान्यास', shortLabel: 'जग शिलान्यास' },
  ROOFING_TIMBER: { title: 'छाना हाल्ने वा माथिल्लो संरचना', shortLabel: 'छाना हाल्ने' },
  GRIHA_PRAVESHA: { title: 'नयाँ घर सर्ने (गृह प्रवेश)', shortLabel: 'गृह प्रवेश' },
  MARRIAGE_VIVAHA: { title: 'विवाह, मगनी वा शुभ प्रस्ताव', shortLabel: 'विवाह / मगनी' },
  MANTRA_DIKSHA: { title: 'मन्त्र दीक्षा, जप वा आध्यात्मिक साधना', shortLabel: 'मन्त्र दीक्षा' },
  VIDYARAMBHA: { title: 'अध्ययन, अनुसन्धान वा कोडिङ सुरुवात', shortLabel: 'अध्ययन सुरु' },
  START_MEDICINE: { title: 'औषधि सेवन वा उपचार सुरुवात', shortLabel: 'औषधि उपचार' },
  ELECTIVE_SURGERY: { title: 'नियोजित शल्यक्रिया वा दन्त उपचार', shortLabel: 'शल्यक्रिया' },
  KSHAURAKARMA: { title: 'कपाल वा नङ काट्ने (क्षौरकर्म)', shortLabel: 'कपाल/नङ काट्ने' },
  BUY_VEHICLE: { title: 'गाडी वा सवारी साधन खरिद', shortLabel: 'सवारी खरिद' },
  TRAVEL_EAST_NORTH: { title: 'पूर्व वा उत्तर दिशातर्फ यात्रा', shortLabel: 'पूर्व/उत्तर यात्रा' },
  TRAVEL_SOUTH_WEST: { title: 'दक्षिण वा पश्चिम दिशातर्फ यात्रा', shortLabel: 'दक्षिण/पश्चिम यात्रा' },
  SEVER_DEMOLISH: { title: 'पुरानो संरचना भत्काउने वा कुलत त्याग्ने', shortLabel: 'पुरानो त्याग्ने' },
};

export function trActionCategory(cat: 'All' | ActionCategory, lang: AppLanguage): string {
  if (lang === 'en') return cat;
  return ACTION_CAT_NE[cat] || cat;
}

export function trActionTitle(actionId: string, fallbackTitle: string, lang: AppLanguage): string {
  if (lang === 'en') return fallbackTitle;
  return ACTION_TITLE_NE[actionId]?.title || fallbackTitle;
}

export function trActionShort(actionId: string, fallbackShort: string, lang: AppLanguage): string {
  if (lang === 'en') return fallbackShort;
  return ACTION_TITLE_NE[actionId]?.shortLabel || fallbackShort;
}

export function trActionDynamicOutcome(
  score: number,
  action: LifeActionSpec,
  nakName: string,
  enHeadline: string,
  enWhatHappens: string,
  lang: AppLanguage
): { headline: string; consequence: string } {
  if (lang === 'en') {
    return { headline: enHeadline, consequence: enWhatHappens };
  }
  const neAction = trActionTitle(action.id, action.title, 'ne');
  const neNak = trNakshatra(nakName, 'ne');
  if (score >= 70) {
    return {
      headline: `उत्तम शुभ समय (${score}/100) — ${neAction} का लागि अनुकूल दिन`,
      consequence: `आज ${neNak} नक्षत्र र तपाईंको व्यक्तिगत ताराबल अनुकूल रहेकाले यो कार्य गर्दा काम सहजै सफल हुने, दिगो लाभ मिल्ने र अनावश्यक अवरोध नआउने प्रबल योग छ।`,
    };
  }
  if (score >= 48) {
    return {
      headline: `मिश्रित समय (${score}/100) — शुभ होरा र अभिजित मुहूर्त छान्नुहोस्`,
      consequence: `आज ${neNak} नक्षत्रमा मिश्रित प्रभाव देखिएकाले राहुकाल छलेर शुभ होरा वा अभिजित मुहूर्तभित्र मात्र ${neAction} अगाडि बढाउनु बुद्धिमानी हुनेछ।`,
    };
  }
  return {
    headline: `प्रतीक्षा गर्नु उत्तम (${score}/100) — अर्को शुभ दिन छान्नुहोस्`,
    consequence: `शास्त्रीय मुहूर्त नियम अनुसार आज ${neAction} सुरु गर्दा ढिलाइ वा अतिरिक्त झन्झट आउन सक्ने भएकाले अत्यावश्यक नभए आगामी ७०+ अंकको शुभ मिति पर्खनु उत्तम हुन्छ।`,
  };
}

/* ==================== 6. BILINGUAL PERSONAL SUMMARY BUILDER ==================== */
export function buildLocalizedPersonalSummary(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedicReport: VedicReport,
  panchangReport: PanchangReport,
  numerologyReport: NumerologyReport,
  synthesisReport: CosmicSynthesisReport,
  lang: AppLanguage
): PlainEnglishPersonalSummary {
  if (lang === 'en') {
    return buildPlainEnglishPersonalSummary(
      profile,
      natalChart,
      vedicReport,
      panchangReport,
      numerologyReport,
      synthesisReport
    );
  }

  const sun = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moon = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const birthNak = getNakshatraTreatiseByIndex(moon.nakshatraIndex);

  const ascSignNe = trSign(natalChart.ascendant.signName, 'ne');
  const sunSignNe = trSign(sun.signName, 'ne');
  const moonSignNe = trSign(moon.signName, 'ne');
  const nakNe = trNakshatra(birthNak.name, 'ne');
  const nakRulerNe = trPlanet(birthNak.ruler, 'ne');

  const mahaLord = vedicReport.activeMahadasha.lord;
  const antarLord = vedicReport.activeAntardasha.lord;
  const mahaNe = trPlanet(mahaLord, 'ne');
  const antarNe = trPlanet(antarLord, 'ne');
  const mahaGuide = trDashaGuide(mahaLord, 'ne');
  const antarGuide = trDashaGuide(antarLord, 'ne');

  const sortedSav = [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus);
  const top1 = sortedSav[0];
  const top2 = sortedSav[1];
  const lowest = sortedSav[sortedSav.length - 1];

  const top1Guide = trHouseGuide(top1.house, 'ne');
  const top2Guide = trHouseGuide(top2.house, 'ne');
  const lowGuide = trHouseGuide(lowest.house, 'ne');

  const rahuSlot = panchangReport.muhurats.find((m) => m.name === 'Rahu Kaal');
  const cityNe = formatCityForLang(profile.location.name, 'ne');
  const varaNe = trVara(panchangReport.vara.name, 'ne');
  const transitNakNe = trNakshatra(panchangReport.nakshatra.name, 'ne');
  const activeHoraiNe = HORAI_NE_META[panchangReport.activeHorai.lord].horaiName;

  return {
    greetingHeadline: `${profile.firstName} ${profile.lastName} — सरल नेपाली व्यक्तिगत कुण्डली सार`,
    bigThreeParagraph: `तपाईंको जन्म ${ascSignNe} लग्न, ${sunSignNe} राशिको सूर्य (${trHouseGuide(sun.house, 'ne').shortTitle}) र ${moonSignNe} राशिको चन्द्रमा (${trHouseGuide(moon.house, 'ne').shortTitle}) मा भएको हो। लग्नले तपाईंको बाहिरी व्यक्तित्व र जीवनशैली निर्धारण गर्छ, सूर्यले भित्री आत्मबल र करियरको दिशा दिन्छ भने चन्द्रमाले मनको भावना र मानसिक शान्तिलाई निर्देशित गर्छ।`,
    birthStarParagraph: `तपाईंको जन्म नक्षत्र '${nakNe}' (चरण ${moon.nakshatraPada}) हो, जसको स्वामी ${nakRulerNe} ग्रह हो। यस नक्षत्रले तपाईंलाई स्वाभाविक मौलिकता, तीक्ष्ण बोध र कर्मशील क्षमता प्रदान गर्दछ।`,
    currentChapterTitle: `${mahaNe} महादशा र ${antarNe} अन्तर्दशा — ${mahaGuide.chapterTitle}`,
    currentChapterParagraph: `हाल तपाईं ${vedicReport.activeMahadasha.years}-वर्षे ${mahaNe} महादशा (${vedicReport.activeMahadasha.endDate} सम्म, ${vedicReport.activeMahadasha.progressPercent}% पूरा) र ${antarNe} अन्तर्दशा (${vedicReport.activeAntardasha.endDate} सम्म) तथा व्यक्तिगत अंक वर्ष ${numerologyReport.personalYear.final} मा हुनुहुन्छ। ${mahaGuide.plainMeaning} मुख्य ध्यान दिनुपर्ने क्षेत्र: ${mahaGuide.bestFocus} साथै ${antarNe} उप-अवधिले थप्ने जोड: ${antarGuide.bestFocus}`,
    strengthsParagraph: `तपाईंको कुण्डलीमा सबैभन्दा बलियो जीवन-क्षेत्र भाव ${top1.house} (${top1Guide.shortTitle} — ${top1.bindus} सर्वाष्टकवर्ग बिन्दु, औसत २८) र भाव ${top2.house} (${top2Guide.shortTitle} — ${top2.bindus} बिन्दु) हुन्। ${top1Guide.whenStrong} ${top2Guide.whenStrong}`,
    careAreaParagraph: `धैर्य र नियमित अनुशासन आवश्यक पर्ने क्षेत्र भाव ${lowest.house} (${lowGuide.shortTitle} — ${lowest.bindus} बिन्दु) हो। यसको अर्थ अशुभ होइन, बरु यस क्षेत्रमा हतारो नगरी निरन्तर मिहिनेत गर्दा दिगो सफलता मिल्छ: ${lowGuide.whenLow}`,
    todayGuidanceParagraph: `${cityNe} को आजको पञ्चाङ्ग अनुसार (${varaNe}, ${panchangReport.tithi.name}, चन्द्र नक्षत्र: ${transitNakNe}): तपाईंको व्यक्तिगत ताराबल आज ${panchangReport.personalTarabala.isAuspicious ? 'सकारात्मक र सहयोगी' : 'मिश्रित (सोचविचार गरी कदम चाल्ने)'} छ। हाल ${activeHoraiNe} (${panchangReport.activeHorai.startTime}–${panchangReport.activeHorai.endTime}) चलिरहेको छ${rahuSlot ? ` भने राहुकाल (${rahuSlot.startTime}–${rahuSlot.endTime}) मा नयाँ शुभ कार्यको सट्टा नियमित काम गर्नु उत्तम हुन्छ` : ''}।`,
    quickBulletTakeaways: [
      {
        label: 'मुख्य परिचय (लग्न र राशि)',
        text: `${ascSignNe} लग्न • ${sunSignNe} सूर्य • ${moonSignNe} चन्द्र राशि (${nakNe} नक्षत्र, चरण ${moon.nakshatraPada})`,
      },
      {
        label: 'हालको दशा कालखण्ड',
        text: `${mahaNe} महादशा – ${antarNe} अन्तर्दशा (${vedicReport.activeAntardasha.endDate} सम्म) — ${mahaGuide.chapterTitle}`,
      },
      {
        label: 'सबैभन्दा बलियो भाव',
        text: `भाव ${top1.house}: ${top1Guide.shortTitle} (${top1.bindus} बिन्दु — सहज प्रगतिको क्षेत्र)`,
      },
      {
        label: 'अंक ज्योतिष मार्ग',
        text: `मूलांक / जीवन मार्ग #${numerologyReport.lifePath.final} • व्यक्तिगत वर्ष #${numerologyReport.personalYear.final}`,
      },
      {
        label: 'धैर्य चाहिने क्षेत्र',
        text: `भाव ${lowest.house}: ${lowGuide.shortTitle} (${lowest.bindus} बिन्दु — नियमित बानीबाट लाभ)`,
      },
    ],
  };
}

/* ==================== 7. REACT CONTEXT & TOOLBAR SWITCHER ==================== */
interface LanguageContextValue {
  lang: AppLanguage;
  isNe: boolean;
  hasProvider?: boolean;
  setLang: (next: AppLanguage) => void;
  toggleLang: () => void;
  t: (en: string, ne: string) => string;
}

const defaultCtx: LanguageContextValue = {
  lang: 'en',
  isNe: false,
  hasProvider: false,
  setLang: () => {},
  toggleLang: () => {},
  t: (en: string) => en,
};

const LanguageContext = createContext<LanguageContextValue>(defaultCtx);

export const LanguageProvider: React.FC<{
  initialLang?: AppLanguage;
  children: React.ReactNode;
}> = ({ initialLang, children }) => {
  const parentCtx = useContext(LanguageContext);
  const [lang, setLangState] = useState<AppLanguage>(() => {
    if (initialLang) return initialLang;
    if (parentCtx.hasProvider) return parentCtx.lang;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'ne' || saved === 'en') return saved;
      } catch {
        // ignore storage errors
      }
    }
    return 'en';
  });

  useEffect(() => {
    if (parentCtx.hasProvider && !initialLang) return;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore storage errors
      }
    }
  }, [lang, parentCtx.hasProvider, initialLang]);

  if (parentCtx.hasProvider && !initialLang) {
    return <>{children}</>;
  }

  const setLang = (next: AppLanguage) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'en' ? 'ne' : 'en'));
  const t = (en: string, ne: string) => (lang === 'ne' ? ne : en);

  return (
    <LanguageContext.Provider
      value={{ lang, isNe: lang === 'ne', hasProvider: true, setLang, toggleLang, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export const LanguageSwitchButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selector (English or Nepali)"
      className={`ui-lang-switch ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="Switch language to English"
        className={`ui-lang-option ${lang === 'en' ? 'ui-lang-option-active' : ''}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ne')}
        aria-pressed={lang === 'ne'}
        title="नेपाली भाषामा हेर्नुहोस् (Switch to Nepali)"
        className={`ui-lang-option ${lang === 'ne' ? 'ui-lang-option-active' : ''}`}
      >
        नेपाली
      </button>
    </div>
  );
};
