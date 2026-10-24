import { BirthProfile } from '../types/oceanology';
import { NatalChartResult, ZODIAC_SIGNS, calculateNatalChart } from './astronomyEngine';
import { DECOZ_COLORS, NumerologyReport } from './numerologyEngine';
import { PanchangReport } from './panchangEngine';
import { VedicReport } from './vedicEngine';

export interface SynthesisPillar {
  domain: 'Western Transits' | 'Vedic Dasha & Jyotish' | 'Drik Panchang & Muhurat' | 'Decoz Numerology';
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

export function generateCosmicSynthesis(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedic: VedicReport,
  panchang: PanchangReport,
  numerology: NumerologyReport,
  referenceDate = new Date()
): CosmicSynthesisReport {
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

  const natalSun = natalChart.planets.find(p => p.id === 'Sun')!;
  const natalMoon = natalChart.planets.find(p => p.id === 'Moon')!;
  const transitJup = transitChart.planets.find(p => p.id === 'Jupiter')!;
  const transitSat = transitChart.planets.find(p => p.id === 'Saturn')!;

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

  const abhijit = panchang.muhurats.find(m => m.name === 'Abhijit Muhurat');
  const amritChog = panchang.dayChoghadiya.find(c => c.name === 'Amrit');
  const bestWindowToday = abhijit
    ? `${abhijit.startTime}–${abhijit.endTime} (Abhijit) & ${amritChog?.startTime || '10:30'}–${amritChog?.endTime || '12:00'} (Amrit)`
    : '11:45–12:35 Local Solar Zenith';

  const sortedElements = Object.entries(natalChart.elementBalance).sort((a, b) => b[1] - a[1]);
  const dominantElement = `${sortedElements[0][0]} (${sortedElements[0][1]} planets)`;

  const pillars: SynthesisPillar[] = [
    {
      domain: 'Western Transits',
      sourceInspiration: 'Astrodienst + Astro-Seek',
      headline: `Transit Jupiter in House ${jupHouse} (${transitJup.signName})`,
      subheadline: `Natal ${natalSun.signName} Sun • ${natalChart.ascendant.signName} Ascendant`,
      score: westernScore,
      badgeColor: '#00F5D4',
      keyInsight: `Jupiter transiting your ${jupHouse}th house expands opportunities in ${
        jupHouse === 10 ? 'career leadership' : jupHouse === 7 ? 'strategic partnerships' : jupHouse === 1 ? 'personal reinvention' : 'creative synthesis'
      }, while Saturn in ${transitSat.signName} anchors long-term discipline.`,
    },
    {
      domain: 'Vedic Dasha & Jyotish',
      sourceInspiration: 'AstroSage Engine',
      headline: `${vedic.activeMahadasha.lord} Mahadasha • ${vedic.activeAntardasha.lord} Antardasha`,
      subheadline: `Janma Nakshatra: ${vedic.moonNakshatra.name} (Pada ${vedic.moonPada})`,
      score: vedicScore,
      badgeColor: '#FFD166',
      keyInsight: `Active ${vedic.activeMahadasha.lord}–${vedic.activeAntardasha.lord} period (${vedic.activeMahadasha.progressPercent}% through Mahadasha) activates ${vedic.yogas[0]?.name || 'Raja Yoga'} potential.`,
    },
    {
      domain: 'Drik Panchang & Muhurat',
      sourceInspiration: 'Drik Panchang Engine',
      headline: `${panchang.personalTarabala.taraName.split(' ')[0]} Tara • ${panchang.tithi.name}`,
      subheadline: `Moon in House ${panchang.personalTarabala.chandrabalaHouse} from Natal Moon`,
      score: panchangScore,
      badgeColor: '#FF6B8B',
      keyInsight: panchang.personalTarabala.verdict,
    },
    {
      domain: 'Decoz Numerology',
      sourceInspiration: 'World Numerology Engine',
      headline: `Life Path ${numerology.lifePath.trail} • Personal Year ${py}`,
      subheadline: `Expression ${numerology.expression.trail} • Personal Day ${pd}`,
      score: numScore,
      badgeColor: DECOZ_COLORS[py]?.hex || '#9B5DE5',
      keyInsight: `Personal Year ${py} (${DECOZ_COLORS[py]?.keyword}) harmonizes with your Life Path ${numerology.lifePath.final} blueprint.`,
    },
  ];

  // Build Unified 12-Year Cross-System Timeline (Astrology + Vedic Dasha + Numerology)
  const unifiedTimeline: UnifiedTimelineYear[] = numerology.colorChartYears.slice(7, 19).map(cell => {
    const calYear = cell.calendarYear;
    const activeDashaForYear =
      vedic.dashas.find(d => {
        const sY = parseInt(d.startDate.slice(0, 4), 10);
        const eY = parseInt(d.endDate.slice(0, 4), 10);
        return calYear >= sY && calYear <= eY;
      })?.lord || vedic.activeMahadasha.lord;

    const age = cell.age;
    let westernTheme = `Jupiter in ${ZODIAC_SIGNS[(natalSun.signIndex + age) % 12].name} Cycle`;
    let isMajorPivot = false;

    if (age === 29 || age === 30 || age === 58 || age === 59) {
      westernTheme = '♄ Saturn Return (Structural Maturity)';
      isMajorPivot = true;
    } else if (age % 12 === 0 && age > 0) {
      westernTheme = '♃ Jupiter Return (12-Year Expansion Peak)';
      isMajorPivot = true;
    } else if (age === 36 - numerology.lifePath.singleDigit || age === 45 - numerology.lifePath.singleDigit) {
      westernTheme = '♅ Nodal & Pinnacle Transition';
      isMajorPivot = true;
    } else if (cell.personalYear === 1 || cell.personalYear === 9) {
      isMajorPivot = true;
    }

    const convergenceIntensity = isMajorPivot ? 94 : 68 + ((cell.personalYear * 3 + age) % 24);

    return {
      year: calYear,
      age,
      westernTransitTheme: westernTheme,
      vedicDashaLord: `${activeDashaForYear} Mahadasha`,
      numerologyPersonalYear: cell.personalYear,
      numerologyPinnacle: cell.pinnacle,
      numerologyColor: DECOZ_COLORS[cell.personalYear]?.hex || '#00F5D4',
      convergenceIntensity,
      isMajorPivot,
    };
  });

  const synthesisSummary = `${profile.firstName}, your ${natalSun.signName} Sun (${natalSun.formattedDMS}), ${natalMoon.signName} Moon in ${vedic.moonNakshatra.name} Nakshatra, and Life Path ${numerology.lifePath.trail} converge at an Oceanic Resonance of ${overallResonanceScore}/100. You are currently navigating the ${vedic.activeMahadasha.lord}–${vedic.activeAntardasha.lord} Vedic period alongside a Personal Year ${py} (${DECOZ_COLORS[py]?.keyword.split('•')[0].trim()}) numerological wave.`;

  const aiCopilotPrompts = [
    {
      question: 'How do my Western Big 3, Vedic Nakshatra, and Life Path work together?',
      groundedAnswer: `Your ${natalSun.signName} Sun (${natalSun.formattedDMS} in House ${natalSun.house}) drives your conscious identity, while your Moon in ${vedic.moonNakshatra.name} Nakshatra (ruled by ${vedic.moonNakshatra.ruler}, Pada ${vedic.moonPada}) shapes your instinctive emotional rhythm. Numerologically, your Life Path ${numerology.lifePath.trail} and Expression ${numerology.expression.trail} channel this energy into ${numerology.lifePath.meaning.toLowerCase()}.`,
    },
    {
      question: 'What is my overarching cosmic timing right now across all systems?',
      groundedAnswer: `In Vedic Jyotish, you are in ${vedic.activeMahadasha.lord} Mahadasha and ${vedic.activeAntardasha.lord} Antardasha (until ${vedic.activeAntardasha.endDate}). In Decoz Numerology, ${referenceDate.getFullYear()} is your Personal Year ${py} and Essence ${numerology.colorChartYears.find(c => c.calendarYear === referenceDate.getFullYear())?.essence || py}. Combined with Jupiter transiting your ${jupHouse}th house, this period favors ${DECOZ_COLORS[py]?.keyword.toLowerCase()}.`,
    },
    {
      question: 'When is my most auspicious window today according to Drik Panchang & Tarabala?',
      groundedAnswer: `Today is ${panchang.vara.name} with ${panchang.tithi.name} (${panchang.tithi.paksha}) and Moon in ${panchang.nakshatra.name}. For your natal ${vedic.moonNakshatra.name} Moon, today carries ${panchang.personalTarabala.taraName} and House ${panchang.personalTarabala.chandrabalaHouse} Chandrabala. Prioritize ${bestWindowToday} and avoid Rahu Kaal (${panchang.muhurats.find(m => m.name === 'Rahu Kaal')?.startTime}–${panchang.muhurats.find(m => m.name === 'Rahu Kaal')?.endTime}).`,
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
