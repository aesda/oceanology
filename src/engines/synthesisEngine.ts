import { BirthProfile } from '../types/oceanology';
import { NatalChartResult, ZODIAC_SIGNS, calculateNatalChart } from './astronomyEngine';
import { DECOZ_COLORS, NumerologyReport } from './numerologyEngine';
import { PanchangReport } from './panchangEngine';
import { VedicReport } from './vedicEngine';
import { AppLanguage, trNakshatra, trPlanet, trSign, trTaraName, trTithi, trVara } from '../i18n/i18n';
import { localizeVedicYoga } from '../data/nepaliReportCodex';

export interface SynthesisPillar {
  domain: 'Western Transits' | 'Vedic Dasha & Jyotish' | 'Drik Panchang & Muhurat' | 'Decoz Numerology';
  domainLabel?: string;
  sourceInspiration: string;
  headline: string;
  subheadline: string;
  score: number; // 0-100
  badgeColor: string;
  keyInsight: string;
}

export interface UnifiedTimelineYear {
  year: number;
  age: number;
  westernTransitTheme: string;
  vedicDashaLord: string;
  numerologyPersonalYear: number;
  numerologyPinnacle: number;
  numerologyColor: string;
  convergenceIntensity: number; // 1-100
  isMajorPivot: boolean;
}

export interface CosmicSynthesisReport {
  overallResonanceScore: number; // 0-100
  resonanceTier: 'Super-Harmonic Convergence' | 'High Momentum Current' | 'Reflective Deep Current';
  synthesisSummary: string;
  bestWindowToday: string;
  dominantElement: string;
  pillars: SynthesisPillar[];
  unifiedTimeline: UnifiedTimelineYear[];
  aiCopilotPrompts: { question: string; groundedAnswer: string }[];
}

const ELEMENT_NE: Record<string, string> = {
  Fire: 'अग्नि तत्त्व',
  Earth: 'पृथ्वी तत्त्व',
  Air: 'वायु तत्त्व',
  Water: 'जल तत्त्व',
};

const PY_KEYWORD_NE: Record<number, string> = {
  1: 'नयाँ आरम्भ र स्वतन्त्र पहल',
  2: 'सहकार्य, धैर्य र कूटनीति',
  3: 'सृजनात्मक अभिव्यक्ति र विस्तार',
  4: 'अनुशासन, जग निर्माण र कार्यप्रणाली',
  5: 'गतिशील परिवर्तन, यात्रा र अवसर',
  6: 'परिवार, जिम्मेवारी र सामञ्जस्य',
  7: 'गहिरो अध्ययन, अनुसन्धान र आत्मचिन्तन',
  8: 'आर्थिक व्यवस्थापन, नेतृत्व र कर्मफल',
  9: 'पूर्णता, उदार सेवा र नयाँ चक्रको तयारी',
};

export function generateCosmicSynthesis(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedic: VedicReport,
  panchang: PanchangReport,
  numerology: NumerologyReport,
  referenceDate = new Date(),
  lang: AppLanguage = 'en'
): CosmicSynthesisReport {
  const isNe = lang === 'ne';

  // Cast today's sky for live Western Transit comparison
  const nowProfile: BirthProfile = {
    ...profile,
    year: referenceDate.getUTCFullYear(),
    month: referenceDate.getUTCMonth() + 1,
    day: referenceDate.getUTCDate(),
    hour: referenceDate.getUTCHours(),
    minute: referenceDate.getUTCMinutes(),
  };
  const transitChart = calculateNatalChart(nowProfile, natalChart.ayanamshaMode, natalChart.houseSystem);

  const natalSun = natalChart.planets.find((p) => p.id === 'Sun')!;
  const natalMoon = natalChart.planets.find((p) => p.id === 'Moon')!;
  const transitJup = transitChart.planets.find((p) => p.id === 'Jupiter')!;
  const transitSat = transitChart.planets.find((p) => p.id === 'Saturn')!;

  // 1. Western Transit Pillar Score
  const jupHouse = ((transitJup.signIndex - natalChart.ascendant.signIndex + 12) % 12) + 1;
  const westernScore = [1, 2, 5, 7, 9, 10, 11].includes(jupHouse) ? 88 : 76;

  // 2. Vedic Dasha Pillar Score
  const beneficDashas = ['Jupiter', 'Venus', 'Mercury', 'Moon', 'Sun'];
  const mahaBenefic = beneficDashas.includes(vedic.activeMahadasha.lord);
  const antarBenefic = beneficDashas.includes(vedic.activeAntardasha.lord);
  const vedicScore = mahaBenefic && antarBenefic ? 92 : mahaBenefic || antarBenefic ? 83 : 74;

  // 3. Panchang Tarabala & Chandrabala Score
  const panchangScore =
    panchang.personalTarabala.isAuspicious && panchang.personalTarabala.chandrabalaAuspicious
      ? 94
      : panchang.personalTarabala.isAuspicious || panchang.personalTarabala.chandrabalaAuspicious
      ? 81
      : 68;

  // 4. Numerology Cycle Score
  const py = numerology.personalYear.singleDigit;
  const pd = numerology.personalDay.singleDigit;
  const numScore = [1, 3, 5, 6, 8, 9].includes(py) ? 89 : 80;

  const overallResonanceScore = Math.round(
    westernScore * 0.25 + vedicScore * 0.25 + panchangScore * 0.25 + numScore * 0.25
  );

  const resonanceTier: CosmicSynthesisReport['resonanceTier'] =
    overallResonanceScore >= 85
      ? 'Super-Harmonic Convergence'
      : overallResonanceScore >= 75
      ? 'High Momentum Current'
      : 'Reflective Deep Current';

  const abhijit = panchang.muhurats.find((m) => m.name === 'Abhijit Muhurat');
  const amritChog = panchang.dayChoghadiya.find((c) => c.name === 'Amrit');
  const bestWindowToday = abhijit
    ? isNe
      ? `${abhijit.startTime}–${abhijit.endTime} (अभिजित् मुहूर्त) र ${amritChog?.startTime || '10:30'}–${amritChog?.endTime || '12:00'} (अमृत चौघडिया)`
      : `${abhijit.startTime}–${abhijit.endTime} (Abhijit) & ${amritChog?.startTime || '10:30'}–${amritChog?.endTime || '12:00'} (Amrit)`
    : isNe
    ? '11:45–12:35 स्थानीय मध्याह्न अभिजित् काल'
    : '11:45–12:35 Local Solar Zenith';

  const sortedElements = Object.entries(natalChart.elementBalance).sort((a, b) => b[1] - a[1]);
  const dominantElement = isNe
    ? `${ELEMENT_NE[sortedElements[0][0]] || sortedElements[0][0]} (${sortedElements[0][1]} ग्रह)`
    : `${sortedElements[0][0]} (${sortedElements[0][1]} planets)`;

  const topYogaLabel = vedic.yogas[0]
    ? localizeVedicYoga(vedic.yogas[0], lang).name
    : isNe
    ? 'राजयोग'
    : 'Raja Yoga';

  const pillars: SynthesisPillar[] = [
    {
      domain: 'Western Transits',
      domainLabel: isNe ? 'गोचर र ग्रह भ्रमण' : 'Western Transits',
      sourceInspiration: 'Astrodienst + Astro-Seek',
      headline: isNe
        ? `गोचर बृहस्पति भाव ${jupHouse} मा (${trSign(transitJup.signName, 'ne')})`
        : `Transit Jupiter in House ${jupHouse} (${transitJup.signName})`,
      subheadline: isNe
        ? `जन्म सूर्य: ${trSign(natalSun.signName, 'ne')} • लग्न: ${trSign(natalChart.ascendant.signName, 'ne')}`
        : `Natal ${natalSun.signName} Sun • ${natalChart.ascendant.signName} Ascendant`,
      score: westernScore,
      badgeColor: '#00F5D4',
      keyInsight: isNe
        ? `बृहस्पति भाव ${jupHouse} मा गोचर गर्दा ${
            jupHouse === 10
              ? 'करियर र नेतृत्व'
              : jupHouse === 7
              ? 'साझेदारी र जनसम्पर्क'
              : jupHouse === 1
              ? 'आत्मविश्वास र व्यक्तित्व विकास'
              : 'सृजनात्मक विस्तार र अवसर'
          } मा शुभ ढोका खुल्छ भने ${trSign(transitSat.signName, 'ne')} को शनिले दीर्घकालीन अनुशासन दिन्छ।`
        : `Jupiter transiting your ${jupHouse}th house expands opportunities in ${
            jupHouse === 10
              ? 'career leadership'
              : jupHouse === 7
              ? 'strategic partnerships'
              : jupHouse === 1
              ? 'personal reinvention'
              : 'creative synthesis'
          }, while Saturn in ${transitSat.signName} anchors long-term discipline.`,
    },
    {
      domain: 'Vedic Dasha & Jyotish',
      domainLabel: isNe ? 'वैदिक महादशा र ज्योतिष' : 'Vedic Dasha & Jyotish',
      sourceInspiration: 'AstroSage Engine',
      headline: isNe
        ? `${trPlanet(vedic.activeMahadasha.lord, 'ne')} महादशा • ${trPlanet(vedic.activeAntardasha.lord, 'ne')} अन्तर्दशा`
        : `${vedic.activeMahadasha.lord} Mahadasha • ${vedic.activeAntardasha.lord} Antardasha`,
      subheadline: isNe
        ? `जन्म नक्षत्र: ${trNakshatra(vedic.moonNakshatra.name, 'ne')} (चरण ${vedic.moonPada})`
        : `Janma Nakshatra: ${vedic.moonNakshatra.name} (Pada ${vedic.moonPada})`,
      score: vedicScore,
      badgeColor: '#FFD166',
      keyInsight: isNe
        ? `सक्रिय ${trPlanet(vedic.activeMahadasha.lord, 'ne')}–${trPlanet(vedic.activeAntardasha.lord, 'ne')} दशा काल (${vedic.activeMahadasha.progressPercent}% महादशा पूर्ण) ले कुण्डलीको ${topYogaLabel} सामर्थ्यलाई जागृत गरिरहेको छ।`
        : `Active ${vedic.activeMahadasha.lord}–${vedic.activeAntardasha.lord} period (${vedic.activeMahadasha.progressPercent}% through Mahadasha) activates ${vedic.yogas[0]?.name || 'Raja Yoga'} potential.`,
    },
    {
      domain: 'Drik Panchang & Muhurat',
      domainLabel: isNe ? 'पञ्चाङ्ग, ताराबल र मुहूर्त' : 'Drik Panchang & Muhurat',
      sourceInspiration: 'Drik Panchang Engine',
      headline: isNe
        ? `${trTaraName(panchang.personalTarabala.taraName, 'ne')} • ${trTithi(panchang.tithi.name, 'ne')}`
        : `${panchang.personalTarabala.taraName.split(' ')[0]} Tara • ${panchang.tithi.name}`,
      subheadline: isNe
        ? `जन्म चन्द्रबाट आज चन्द्रमा भाव ${panchang.personalTarabala.chandrabalaHouse} मा`
        : `Moon in House ${panchang.personalTarabala.chandrabalaHouse} from Natal Moon`,
      score: panchangScore,
      badgeColor: '#FF6B8B',
      keyInsight: isNe
        ? panchang.personalTarabala.isAuspicious && panchang.personalTarabala.chandrabalaAuspicious
          ? 'आज ताराबल र चन्द्रबल दुवै अनुकूल छन्—महत्त्वपूर्ण कार्य र संवादका लागि दिन बलियो छ।'
          : panchang.personalTarabala.isAuspicious || panchang.personalTarabala.chandrabalaAuspicious
          ? 'ताराबल/चन्द्रबल मध्यम सन्तुलित छ—शुभ होरा र अभिजित् काल रोजेर काम अघि बढाउनु उत्तम हुन्छ।'
          : 'आज नियमित कार्य र पूर्वतयारीमा केन्द्रित रहँदै ठूला जोखिम अर्को शुभ नक्षत्रमा सार्नु हितकर हुन्छ।'
        : panchang.personalTarabala.verdict,
    },
    {
      domain: 'Decoz Numerology',
      domainLabel: isNe ? 'अंक ज्योतिष र वर्ष चक्र' : 'Decoz Numerology',
      sourceInspiration: 'World Numerology Engine',
      headline: isNe
        ? `मूलांक/भाग्यांक #${numerology.lifePath.final} • व्यक्तिगत वर्ष #${py}`
        : `Life Path ${numerology.lifePath.trail} • Personal Year ${py}`,
      subheadline: isNe
        ? `अभिव्यक्ति अंक #${numerology.expression.final} • व्यक्तिगत दिन #${pd}`
        : `Expression ${numerology.expression.trail} • Personal Day ${pd}`,
      score: numScore,
      badgeColor: DECOZ_COLORS[py]?.hex || '#9B5DE5',
      keyInsight: isNe
        ? `व्यक्तिगत वर्ष #${py} (${PY_KEYWORD_NE[py] || 'सन्तुलित प्रगति'}) ले तपाईंको जीवन मार्ग अंक #${numerology.lifePath.final} को मूल उद्देश्यलाई बल दिइरहेको छ।`
        : `Personal Year ${py} (${DECOZ_COLORS[py]?.keyword}) harmonizes with your Life Path ${numerology.lifePath.final} blueprint.`,
    },
  ];

  // Build Unified 12-Year Cross-System Timeline (Astrology + Vedic Dasha + Numerology)
  const unifiedTimeline: UnifiedTimelineYear[] = numerology.colorChartYears.slice(7, 19).map((cell) => {
    const calYear = cell.calendarYear;
    const activeDashaForYear =
      vedic.dashas.find((d) => {
        const sY = parseInt(d.startDate.slice(0, 4), 10);
        const eY = parseInt(d.endDate.slice(0, 4), 10);
        return calYear >= sY && calYear <= eY;
      })?.lord || vedic.activeMahadasha.lord;

    const age = cell.age;
    const jupCycleSign = ZODIAC_SIGNS[(natalSun.signIndex + age) % 12].name;
    let westernTheme = isNe
      ? `${trSign(jupCycleSign, 'ne')} बृहस्पति विस्तार चक्र`
      : `Jupiter in ${jupCycleSign} Cycle`;
    let isMajorPivot = false;

    if (age === 29 || age === 30 || age === 58 || age === 59) {
      westernTheme = isNe
        ? '♄ शनि पुनरागमन (संरचनात्मक परिपक्वता मोड)'
        : '♄ Saturn Return (Structural Maturity)';
      isMajorPivot = true;
    } else if (age % 12 === 0 && age > 0) {
      westernTheme = isNe
        ? '♃ बृहस्पति पुनरागमन (१२-वर्षे भाग्योदय चक्र)'
        : '♃ Jupiter Return (12-Year Expansion Peak)';
      isMajorPivot = true;
    } else if (
      age === 36 - numerology.lifePath.singleDigit ||
      age === 45 - numerology.lifePath.singleDigit
    ) {
      westernTheme = isNe
        ? '♅ राहु-केतु एवं शिखर चक्र रूपान्तरण'
        : '♅ Nodal & Pinnacle Transition';
      isMajorPivot = true;
    } else if (cell.personalYear === 1 || cell.personalYear === 9) {
      isMajorPivot = true;
    }

    const convergenceIntensity = isMajorPivot ? 94 : 68 + ((cell.personalYear * 3 + age) % 24);

    return {
      year: calYear,
      age,
      westernTransitTheme: westernTheme,
      vedicDashaLord: isNe
        ? `${trPlanet(activeDashaForYear, 'ne')} महादशा`
        : `${activeDashaForYear} Mahadasha`,
      numerologyPersonalYear: cell.personalYear,
      numerologyPinnacle: cell.pinnacle,
      numerologyColor: DECOZ_COLORS[cell.personalYear]?.hex || '#00F5D4',
      convergenceIntensity,
      isMajorPivot,
    };
  });

  const synthesisSummary = isNe
    ? `${profile.firstName}, तपाईंको ${trSign(natalSun.signName, 'ne')} सूर्य (${natalSun.formattedDMS}), ${trNakshatra(vedic.moonNakshatra.name, 'ne')} नक्षत्रको ${trSign(natalMoon.signName, 'ne')} चन्द्रमा र जीवन मार्ग अंक #${numerology.lifePath.final} को संयुक्त ग्रह-सामञ्जस्य ${overallResonanceScore}/100 रहेको छ। हाल तपाईं ${trPlanet(vedic.activeMahadasha.lord, 'ne')}–${trPlanet(vedic.activeAntardasha.lord, 'ne')} वैदिक दशा तथा व्यक्तिगत वर्ष #${py} (${PY_KEYWORD_NE[py] || 'सन्तुलित प्रगति'}) को कालखण्डमा हुनुहुन्छ।`
    : `${profile.firstName}, your ${natalSun.signName} Sun (${natalSun.formattedDMS}), ${natalMoon.signName} Moon in ${vedic.moonNakshatra.name} Nakshatra, and Life Path ${numerology.lifePath.trail} converge at an Oceanic Resonance of ${overallResonanceScore}/100. You are currently navigating the ${vedic.activeMahadasha.lord}–${vedic.activeAntardasha.lord} Vedic period alongside a Personal Year ${py} (${DECOZ_COLORS[py]?.keyword.split('•')[0].trim()}) numerological wave.`;

  const rahuKaal = panchang.muhurats.find((m) => m.name === 'Rahu Kaal');
  const essenceNow =
    numerology.colorChartYears.find((c) => c.calendarYear === referenceDate.getFullYear())?.essence ||
    py;

  const aiCopilotPrompts = isNe
    ? [
        {
          question: 'मेरो लग्न, चन्द्र नक्षत्र र जीवन मार्ग अंकले सँगै कसरी काम गर्छन्?',
          groundedAnswer: `तपाईंको ${trSign(natalChart.ascendant.signName, 'ne')} लग्न र भाव ${natalSun.house} मा रहेको ${trSign(natalSun.signName, 'ne')} सूर्य (${natalSun.formattedDMS}) ले बाहिरी कार्यदिशा तय गर्छ भने ${trNakshatra(vedic.moonNakshatra.name, 'ne')} नक्षत्र (${trPlanet(vedic.moonNakshatra.ruler, 'ne')} शासित, चरण ${vedic.moonPada}) को चन्द्रमाले भित्री भावनात्मक लय र अन्तर्ज्ञान निर्देशित गर्दछ। अंक ज्योतिषको जीवन मार्ग #${numerology.lifePath.final} र अभिव्यक्ति अंक #${numerology.expression.final} ले यी दुवै ऊर्जालाई व्यावहारिक सफलतामा जोड्दछन्।`,
        },
        {
          question: 'अहिले सबै ज्योतिषीय पद्धति अनुसार मेरो मुख्य समय-चक्र कस्तो छ?',
          groundedAnswer: `वैदिक विंशोत्तरी पद्धतिमा अहिले ${trPlanet(vedic.activeMahadasha.lord, 'ne')} महादशा भित्र ${trPlanet(vedic.activeAntardasha.lord, 'ne')} अन्तर्दशा (${vedic.activeAntardasha.endDate} सम्म) चलिरहेको छ। अंक ज्योतिषमा सन् ${referenceDate.getFullYear()} तपाईंको व्यक्तिगत वर्ष #${py} (${PY_KEYWORD_NE[py] || 'प्रगति'}) र सार अंक #${essenceNow} हो, जसलाई भाव ${jupHouse} को गोचर बृहस्पतिले थप आड दिइरहेको छ।`,
        },
        {
          question: 'आज पञ्चाङ्ग र ताराबल अनुसार मेरो सर्वोत्तम शुभ समय कुन हो?',
          groundedAnswer: `आज ${trVara(panchang.vara.name, 'ne')}, ${trTithi(panchang.tithi.name, 'ne')} तिथि र ${trNakshatra(panchang.nakshatra.name, 'ne')} नक्षत्र परेको छ। तपाईंको जन्म नक्षत्र ${trNakshatra(vedic.moonNakshatra.name, 'ne')} बाट आज ${trTaraName(panchang.personalTarabala.taraName, 'ne')} र भाव ${panchang.personalTarabala.chandrabalaHouse} चन्द्रबल सक्रिय छ। महत्त्वपूर्ण कार्यका लागि ${bestWindowToday} प्राथमिकतामा राख्नुहोस् र राहुकाल (${rahuKaal?.startTime || '—'}–${rahuKaal?.endTime || '—'}) मा नयाँ काम थालनी नगर्नुहोस्।`,
        },
        {
          question: 'केपी (KP) लग्न सब-लर्डले मेरो मूल भाग्यबारे के देखाउँछ?',
          groundedAnswer: `तपाईंको प्रथम भाव (लग्न कस्प १: ${vedic.kpCusps[0].longitudeDMS}) को राशि स्वामी ${trPlanet(vedic.kpCusps[0].signLord, 'ne')}, नक्षत्र स्वामी ${trPlanet(vedic.kpCusps[0].starLord, 'ne')} र निर्णायक केपी सब-लर्ड ${trPlanet(vedic.kpCusps[0].subLord, 'ne')} रहेको छ। कृष्णमूर्ति पद्धति अनुसार ${trPlanet(vedic.kpCusps[0].subLord, 'ne')} को गुणधर्म अपनाउँदा स्वास्थ्य, आत्मविश्वास र व्यक्तिगत निर्णयहरू छिटो सफल हुन्छन्।`,
        },
      ]
    : [
        {
          question: 'How do my Western Big 3, Vedic Nakshatra, and Life Path work together?',
          groundedAnswer: `Your ${natalSun.signName} Sun (${natalSun.formattedDMS} in House ${natalSun.house}) drives your conscious identity, while your Moon in ${vedic.moonNakshatra.name} Nakshatra (ruled by ${vedic.moonNakshatra.ruler}, Pada ${vedic.moonPada}) shapes your instinctive emotional rhythm. Numerologically, your Life Path ${numerology.lifePath.trail} and Expression ${numerology.expression.trail} channel this energy into ${numerology.lifePath.meaning.toLowerCase()}.`,
        },
        {
          question: 'What is my overarching cosmic timing right now across all systems?',
          groundedAnswer: `In Vedic Jyotish, you are in ${vedic.activeMahadasha.lord} Mahadasha and ${vedic.activeAntardasha.lord} Antardasha (until ${vedic.activeAntardasha.endDate}). In Decoz Numerology, ${referenceDate.getFullYear()} is your Personal Year ${py} and Essence ${essenceNow}. Combined with Jupiter transiting your ${jupHouse}th house, this period favors ${DECOZ_COLORS[py]?.keyword.toLowerCase()}.`,
        },
        {
          question: 'When is my most auspicious window today according to Drik Panchang & Tarabala?',
          groundedAnswer: `Today is ${panchang.vara.name} with ${panchang.tithi.name} (${panchang.tithi.paksha}) and Moon in ${panchang.nakshatra.name}. For your natal ${vedic.moonNakshatra.name} Moon, today carries ${panchang.personalTarabala.taraName} and House ${panchang.personalTarabala.chandrabalaHouse} Chandrabala. Prioritize ${bestWindowToday} and avoid Rahu Kaal (${rahuKaal?.startTime}–${rahuKaal?.endTime}).`,
        },
        {
          question: 'What does my KPAscendant Sub-Lord reveal about my core destiny?',
          groundedAnswer: `Your Ascendant (Cusp 1) at ${vedic.kpCusps[0].longitudeDMS} is governed by Sign Lord ${vedic.kpCusps[0].signLord}, Star Lord ${vedic.kpCusps[0].starLord}, and KP Sub-Lord ${vedic.kpCusps[0].subLord}. In Krishnamurti Paddhati, Sub-Lord ${vedic.kpCusps[0].subLord} acts as the decisive filter of your self-expression and physical vitality.`,
        },
      ];

  return {
    overallResonanceScore,
    resonanceTier,
    synthesisSummary,
    bestWindowToday,
    dominantElement,
    pillars,
    unifiedTimeline,
    aiCopilotPrompts,
  };
}
