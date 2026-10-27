// Phase 5 — Multi-Tradition Classical, Tantric, Nadi, Tajika & Vedic Numerology Codex
// Synthesizing:
// 1. Rudrayamala Tantra & Nepali Cheena — 36-Year Ashta-Yogini Dasha + Antar-Yogini
// 2. Bhrigu Samhita & Bhrigu Nandi Nadi — Bhrigu Bindu (Rahu-Moon Midpoint) & Transit Triggers
// 3. Jataka Parijata & Chandra Kala Nadi — Pushkara Navamsha (24 Zones) & Pushkara Bhaga Degrees
// 4. Prashna Marga Ch. 14 — 64th Navamsha (Khara) & 22nd Drekkana (Chhidra) Protective Awareness
// 5. Tajika Neelakanthi — Astronomical Annual Solar Return (Varshaphala), Muntha, Varsheshwara & Sahams
// 6. Surya Siddhanta & Nepali Panchanga — All 60 Jovian Samvatsaras (Prabhava #1 to Akshaya #60)
// 7. Siddhar Agastya's Panchapakshi Shastra (5 Cosmic Birds) & 3x3 Lo Shu Vedic Numerology Grid

import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';
import {
  calculateNatalChart,
  formatDMS,
  NAKSHATRAS,
  NatalChartResult,
  norm360,
  ZODIAC_SIGNS,
} from '../engines/astronomyEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';
import { PanchangReport } from '../engines/panchangEngine';
import { AppLanguage, trNakshatra, trPlanet, trSign } from '../i18n/i18n';

// ==================== 1. 36-YEAR ASHTA-YOGINI DASHA (RUDRAYAMALA TANTRA & NEPALI CHEENA) ====================

export interface YoginiMeta {
  index: number; // 1..8
  id: 'Mangala' | 'Pingala' | 'Dhanya' | 'Bhramari' | 'Bhadrika' | 'Ulka' | 'Siddha' | 'Sankata';
  nameEn: string;
  nameNe: string;
  planetLord: string;
  years: number;
  tone: 'optimal' | 'favorable' | 'mixed' | 'info';
  natureEn: string;
  natureNe: string;
  fruitEn: string;
  fruitNe: string;
}

export const ASHTA_YOGINIS: YoginiMeta[] = [
  {
    index: 1,
    id: 'Mangala',
    nameEn: 'Mangala',
    nameNe: 'मङ्गला',
    planetLord: 'Moon',
    years: 1,
    tone: 'optimal',
    natureEn: 'Auspicious Purity & Emotional Renewal',
    natureNe: 'शुभता, मानसिक शान्ति र पवित्र सुरुवात',
    fruitEn:
      'Brings calm emotional clarity, family harmony, auspicious ceremonies, supportive friendships, and gentle recovery from prior stress.',
    fruitNe:
      'पारिवारिक सुख, मनको प्रसन्नता, धार्मिक/माङ्गलिक कार्य, मित्र सहयोग र स्वास्थ्यमा अनुकूल सुधार ल्याउँछ।',
  },
  {
    index: 2,
    id: 'Pingala',
    nameEn: 'Pingala',
    nameNe: 'पिङ्गला',
    planetLord: 'Sun',
    years: 2,
    tone: 'mixed',
    natureEn: 'Solar Fire, Ego Discipline & Authority Tests',
    natureNe: 'सूर्य तेज, अनुशासन र नेतृत्व परीक्षा',
    fruitEn:
      'Sharpens ambition and self-respect while testing patience with authority figures and heat/burnout; channel solar drive into disciplined craft.',
    fruitNe:
      'आत्मबल र कर्मठता बढाउँछ तर उच्च अधिकारीसँग संयम र पित्त/थकानको ख्याल राख्न सिकाउँछ।',
  },
  {
    index: 3,
    id: 'Dhanya',
    nameEn: 'Dhanya',
    nameNe: 'धान्या',
    planetLord: 'Jupiter',
    years: 3,
    tone: 'optimal',
    natureEn: 'Abundant Harvest, Treasury & Guru Grace',
    natureNe: 'धन-धान्य वृद्धि, प्रज्ञा र गुरु कृपा',
    fruitEn:
      'Classic prosperity chapter in Nepali Cheena: expands savings, higher learning, wise mentorship, ethical reputation, and household abundance.',
    fruitNe:
      'नेपाली चिना परम्परामा अत्यन्त शुभ मानिने कालखण्ड: धन-धान्य, उच्च शिक्षा, प्रतिष्ठा र गुरुजनको आशीर्वाद प्राप्त हुन्छ।',
  },
  {
    index: 4,
    id: 'Bhramari',
    nameEn: 'Bhramari',
    nameNe: 'भ्रामरी',
    planetLord: 'Mars',
    years: 4,
    tone: 'info',
    natureEn: 'Dynamic Movement, Travel & Courageous Pivots',
    natureNe: 'भ्रमण, स्थानान्तरण र साहसी निर्णय',
    fruitEn:
      'Named after the tireless bee: triggers frequent travel, relocation, entrepreneurial hustle, and independent initiative—thrives when energy is focused.',
    fruitNe:
      'भ्रमरा जस्तै गतिशील समय: यात्रा, कार्यस्थल परिवर्तन, स्वतन्त्र उद्यम र साहसी कदमका लागि सक्रिय बनाउँछ।',
  },
  {
    index: 5,
    id: 'Bhadrika',
    nameEn: 'Bhadrika',
    nameNe: 'भद्रिका',
    planetLord: 'Mercury',
    years: 5,
    tone: 'optimal',
    natureEn: 'Intellectual Brilliance, Commerce & Alliances',
    natureNe: 'बौद्धिक कौशल, व्यापार वृद्धि र सुमधुर सम्बन्ध',
    fruitEn:
      'Rewards skill mastery, writing, negotiations, technology, commercial partnerships, and gracious social standing.',
    fruitNe:
      'व्यापार, लेखन, प्रविधि, संवाद कला र मित्रजनको सहकार्यबाट सम्मान तथा आर्थिक उन्नति दिलाउँछ।',
  },
  {
    index: 6,
    id: 'Ulka',
    nameEn: 'Ulka',
    nameNe: 'उल्का',
    planetLord: 'Saturn',
    years: 6,
    tone: 'mixed',
    natureEn: 'Meteoric Restructuring, Vigilance & Endurance',
    natureNe: 'गहिरो कर्मशोधन, सतर्कता र धैर्य',
    fruitEn:
      'Clears out weak foundations through hard realism and workload accountability; steady routines, honest audits, and rest turn pressure into lasting grit.',
    fruitNe:
      'कमजोर आधारहरू हटाएर बलियो जग बसाल्ने समय; धैर्य, पारदर्शी हिसाब र नियमित दिनचर्याले कठिनाइलाई स्थायित्वमा बदल्छ।',
  },
  {
    index: 7,
    id: 'Siddha',
    nameEn: 'Siddha',
    nameNe: 'सिद्धा',
    planetLord: 'Venus',
    years: 7,
    tone: 'optimal',
    natureEn: 'Accomplishment, Marriage, Art & Fulfillment',
    natureNe: 'कार्य सिद्धि, सुख-वैभव, प्रेम र सफलता',
    fruitEn:
      'Crown jewel of the 36-year Yogini cycle: ripens long-held goals, career elevation, loving partnership, vehicles/home comfort, and creative mastery.',
    fruitNe:
      'योगिनी चक्रको सर्वोत्तम सिद्धिदायी समय: अधुरा लक्ष्य पूरा हुने, पदोन्नति, दाम्पत्य सुख, वाहन/गृह सुख र कलात्मक सफलता मिल्छ।',
  },
  {
    index: 8,
    id: 'Sankata',
    nameEn: 'Sankata',
    nameNe: 'सङ्कटा',
    planetLord: 'Rahu',
    years: 8,
    tone: 'mixed',
    natureEn: 'Deep Transformation, Detachment & Reinvention',
    natureNe: 'गहन रूपान्तरण, आत्म-संयम र नयाँ मोड',
    fruitEn:
      'Demands letting go of outgrown attachments, avoiding speculative shortcuts, and leaning into spiritual steadiness, research, and foreign/innovative craft.',
    fruitNe:
      'जटिल परिस्थितिलाई विवेकले पार लगाउने समय; हतारको जोखिम त्यागी अनुसन्धान, आध्यात्मिक संयम र प्रविधिमूलक सीपमा लाग्दा विशेष उपलब्धि हुन्छ।',
  },
];

export interface YoginiAntarItem {
  yoginiId: YoginiMeta['id'];
  nameLabel: string;
  lordLabel: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface YoginiDashaPeriod {
  cycleNumber: number; // 1, 2, or 3
  yoginiId: YoginiMeta['id'];
  nameLabel: string;
  planetLord: string;
  planetLordLabel: string;
  years: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  progressPercent: number;
  tone: YoginiMeta['tone'];
  natureLabel: string;
  fruitSummary: string;
  antars: YoginiAntarItem[];
}

export interface YoginiDashaSystemResult {
  birthYoginiLabel: string;
  activePeriod: YoginiDashaPeriod;
  activeAntar: YoginiAntarItem;
  doubleLockNarrative: string;
  periods: YoginiDashaPeriod[]; // 24 periods (3 x 36y = 108 years)
  sourceCitation: string;
}

const MS_PER_YEAR = 365.2425 * 86400 * 1000;

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function computeYoginiDashaSystem(
  natalChart: NatalChartResult,
  activeVimshottariLord: string,
  lang: AppLanguage = 'en',
  referenceDate = new Date()
): YoginiDashaSystemResult {
  const isNe = lang === 'ne';
  const moon = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const nakSpan = 360 / 27;
  const nakZeroIdx = Math.min(26, Math.max(0, Math.floor(norm360(moon.siderealLongitude) / nakSpan)));
  const nakNumber = nakZeroIdx + 1; // 1..27
  const degIntoNak = norm360(moon.siderealLongitude) - nakZeroIdx * nakSpan;
  const fracRemaining = Math.max(0.02, Math.min(1, 1 - degIntoNak / nakSpan));

  // Rudrayamala formula: (NakshatraNumber + 3) mod 8 (0 -> 8)
  const rem = (nakNumber + 3) % 8;
  const startIdx0 = (rem === 0 ? 8 : rem) - 1; // 0..7 in ASHTA_YOGINIS

  const birthMs = natalChart.utcDate.getTime();
  const refMs = referenceDate.getTime();
  const periods: YoginiDashaPeriod[] = [];
  let cursorMs = birthMs;

  // Generate 24 sequential Yogini periods (~105–108 years from birth)
  for (let step = 0; step < 24; step++) {
    const meta = ASHTA_YOGINIS[(startIdx0 + step) % 8];
    const fullDurationMs = meta.years * MS_PER_YEAR;
    const periodStartMs =
      step === 0 ? birthMs - fullDurationMs * (1 - fracRemaining) : cursorMs;
    const periodEndMs = step === 0 ? birthMs + fullDurationMs * fracRemaining : cursorMs + fullDurationMs;

    // 8 Antar-Yoginis inside the canonical full span, clipped cleanly to birth on step 0
    const antars: YoginiAntarItem[] = [];
    let antarCursor = periodStartMs;
    for (let j = 0; j < 8; j++) {
      const subMeta = ASHTA_YOGINIS[(startIdx0 + step + j) % 8];
      const subSpanMs = ((meta.years * subMeta.years) / 36) * MS_PER_YEAR;
      const rawStart = antarCursor;
      const rawEnd = antarCursor + subSpanMs;
      antarCursor = rawEnd;
      if (rawEnd <= birthMs) continue;
      const clippedStart = Math.max(birthMs, rawStart);
      const isAntarCurrent = refMs >= clippedStart && refMs < rawEnd;
      antars.push({
        yoginiId: subMeta.id,
        nameLabel: isNe ? subMeta.nameNe : subMeta.nameEn,
        lordLabel: trPlanet(subMeta.planetLord, lang),
        startDate: isoDate(clippedStart),
        endDate: isoDate(rawEnd),
        isCurrent: isAntarCurrent,
      });
    }

    const displayStartMs = Math.max(birthMs, periodStartMs);
    const isCurrent = refMs >= displayStartMs && refMs < periodEndMs;
    const progressPercent = isCurrent
      ? Math.max(
          1,
          Math.min(
            99,
            Math.round(((refMs - displayStartMs) / Math.max(1, periodEndMs - displayStartMs)) * 100)
          )
        )
      : refMs >= periodEndMs
      ? 100
      : 0;

    periods.push({
      cycleNumber: Math.floor(step / 8) + 1,
      yoginiId: meta.id,
      nameLabel: isNe ? meta.nameNe : meta.nameEn,
      planetLord: meta.planetLord,
      planetLordLabel: trPlanet(meta.planetLord, lang),
      years: meta.years,
      startDate: isoDate(displayStartMs),
      endDate: isoDate(periodEndMs),
      isCurrent,
      progressPercent,
      tone: meta.tone,
      natureLabel: isNe ? meta.natureNe : meta.natureEn,
      fruitSummary: isNe ? meta.fruitNe : meta.fruitEn,
      antars,
    });

    cursorMs = periodEndMs;
  }

  const activePeriod = periods.find((p) => p.isCurrent) || periods[0];
  const activeAntar =
    activePeriod.antars.find((a) => a.isCurrent) ||
    activePeriod.antars[0] || {
      yoginiId: activePeriod.yoginiId,
      nameLabel: activePeriod.nameLabel,
      lordLabel: activePeriod.planetLordLabel,
      startDate: activePeriod.startDate,
      endDate: activePeriod.endDate,
      isCurrent: true,
    };

  const birthMeta = ASHTA_YOGINIS[startIdx0];
  const sameRuler = activePeriod.planetLord === activeVimshottariLord;

  const doubleLockNarrative = isNe
    ? sameRuler
      ? `दुई-प्रणाली एकल तालाबन्दी (Double-Lock): तपाईंको विंशोत्तरी महादशा (${trPlanet(activeVimshottariLord, 'ne')}) र नेपाली चिनाको ३६-वर्षे योगिनी दशा (${activePeriod.nameLabel} — स्वामी ${activePeriod.planetLordLabel}) दुवै एउटै ग्रहको अधीनमा छन्! यसले ${activePeriod.planetLordLabel} सम्बन्धी फललाई दोब्बर स्पष्टता र तीव्रताका साथ प्रकट गर्छ।`
      : `नेपाली चिना द्वैध-दशा समन्वय: दीर्घकालीन १२०-वर्षे विंशोत्तरी महादशा (${trPlanet(activeVimshottariLord, 'ne')}) ले मुख्य जीवन अध्याय तय गरिरहेको छ भने ३६-वर्षे तान्त्रिक योगिनी दशा (${activePeriod.nameLabel} – ${activeAntar.nameLabel}, स्वामी ${activePeriod.planetLordLabel}) ले तात्कालिक व्यावहारिक गति र मनोदशा निर्देशित गरिरहेको छ।`
    : sameRuler
    ? `Rare Double-Lock Convergence: Both your 120-year Parashari Vimshottari Mahadasha (${activeVimshottariLord}) AND your 36-year Himalayan Yogini Dasha (${activePeriod.nameLabel}, ruled by ${activePeriod.planetLord}) are governed by the exact same planet right now—amplifying ${activePeriod.planetLord}’s themes with unmistakable clarity.`
    : `Himalayan Dual-Dasha Cross-Check: While your 120-year Vimshottari Mahadasha (${activeVimshottariLord}) sets the macro background architecture, your faster 36-year Yogini Dasha is currently in ${activePeriod.nameLabel} (${activePeriod.planetLord}-ruled, ${activePeriod.startDate} to ${activePeriod.endDate}; sub-period ${activeAntar.nameLabel}), coloring your immediate year-to-year momentum with ${activePeriod.natureLabel.toLowerCase()}.`;

  return {
    birthYoginiLabel: isNe
      ? `${birthMeta.nameNe} (${trPlanet(birthMeta.planetLord, 'ne')})`
      : `${birthMeta.nameEn} (${birthMeta.planetLord})`,
    activePeriod,
    activeAntar,
    doubleLockNarrative,
    periods,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: रुद्रयामल तन्त्र एवं परम्परागत नेपाली जन्मपत्रिका (चिना) अष्ट-योगिनी दशा विधि'
      : 'Classical Source: Rudrayamala Tantra & Traditional Nepali Janma-Patrika (Cheena) 36-Year Ashta-Yogini Dasha',
  };
}

// ==================== 2. BHRIGU BINDU (RAHU-MOON DESTINY MIDPOINT) & PUSHKARA BLESSINGS ====================

export interface BhriguBinduProfile {
  longitude: number;
  signIndex: number;
  signLabel: string;
  degreeDMS: string;
  nakshatraLabel: string;
  pada: number;
  houseFromLagna: number;
  houseFromMoon: number;
  isActivatedNow: boolean;
  activationBadge: string;
  activationTone: 'optimal' | 'favorable' | 'info';
  destinyMeaning: string;
  liveTriggerNote: string;
  sourceCitation: string;
}

const BHRIGU_HOUSE_MEANINGS_EN: Record<number, string> = {
  1: 'Self-invention, physical vitality, personal brand, and stepping boldly into leadership.',
  2: 'Family stewardship, accumulated savings, authoritative speech, and tangible financial security.',
  3: 'Entrepreneurial courage, media/publishing, skill mastery, and decisive short-range initiatives.',
  4: 'Sanctuary, real estate/land, vehicles, emotional peace, and deep ancestral roots.',
  5: 'Creative authorship, children/mentorship, intellectual breakthroughs, and past-life merit.',
  6: 'Diagnostic mastery, healing service, competitive victory, and clearing systemic obligations.',
  7: 'Pivotal marriage/partnership covenants, public contracts, and diplomatic alliances.',
  8: 'Deep research, shared capital/legacies, psychological rebirth, and intuitive breakthroughs.',
  9: 'Higher wisdom, global travel, dharma, publishing, and mentorship from authentic teachers.',
  10: 'Public career authority, institutional reputation, executive responsibility, and legacy work.',
  11: 'High-trust networks, scalable income gains, elder allies, and realization of long-held ambitions.',
  12: 'Cross-border horizons, contemplative retreats, quiet philanthropy, and spiritual freedom.',
};

const BHRIGU_HOUSE_MEANINGS_NE: Record<number, string> = {
  1: 'आत्म-पहिचान, व्यक्तित्व विकास, स्वास्थ्य र स्वतन्त्र नेतृत्व क्षमता।',
  2: 'पारिवारिक दायित्व, बचत कोष, प्रभावकारी वाणी र स्थायी आर्थिक सुरक्षा।',
  3: 'उद्यमशील साहस, लेखन/सञ्चार, प्राविधिक सीप र निर्णायक पहलकदमी।',
  4: 'भूमि/भवन सुख, वाहन, पारिवारिक शान्ति र आन्तरिक मानसिक सन्तुष्टि।',
  5: 'सिर्जनात्मक प्रतिभा, सन्तान/शिष्य सुख, उच्च विवेक र पूर्वपुण्यको फल।',
  6: 'प्रतिस्पर्धामा विजय, सेवा/चिकित्सा कौशल र ऋण तथा बाधाहरूको व्यवस्थित समाधान।',
  7: 'विवाह, दीर्घकालीन साझेदारी, सार्वजनिक सम्झौता र कूटनीतिक सम्बन्ध।',
  8: 'गहिरो अनुसन्धान, संयुक्त पुँजी, आकस्मिक रूपान्तरण र आन्तरिक अन्वेषण।',
  9: 'भाग्योदय, उच्च अध्ययन, वैदेशिक/तीर्थ यात्रा र गुरुजनको मार्गदर्शन।',
  10: 'करियर उचाइ, संस्थागत नेतृत्व, सामाजिक प्रतिष्ठा र कर्मसिद्धि।',
  11: 'आम्दानी विस्तार, प्रभावशाली मित्र सञ्जाल र दीर्घकालीन लक्ष्य प्राप्ति।',
  12: 'वैदेशिक सम्बन्ध, एकान्त साधना, परोपकार र आध्यात्मिक स्वतन्त्रता।',
};

function shortestAngularDiff(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

export function computeBhriguBinduProfile(
  natalChart: NatalChartResult,
  liveSkyChart: NatalChartResult,
  lang: AppLanguage = 'en'
): BhriguBinduProfile {
  const isNe = lang === 'ne';
  const moon = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const rahu = natalChart.planets.find((p) => p.id === 'Rahu') || natalChart.planets[7];

  // Bhrigu Nandi Nadi arc from Rahu forward to Moon divided by 2
  const arcRahuToMoon = norm360(moon.siderealLongitude - rahu.siderealLongitude);
  const bbLon = norm360(rahu.siderealLongitude + arcRahuToMoon / 2);
  const bbSignIdx = Math.floor(bbLon / 30);
  const bbDegInSign = bbLon - bbSignIdx * 30;
  const nakSpan = 360 / 27;
  const bbNakIdx = Math.min(26, Math.floor(bbLon / nakSpan));
  const bbPada = Math.min(4, Math.floor((bbLon - bbNakIdx * nakSpan) / (nakSpan / 4)) + 1);

  const ascSignIdx = natalChart.ascendant.signIndex;
  const houseFromLagna = ((bbSignIdx - ascSignIdx + 12) % 12) + 1;
  const houseFromMoon = ((bbSignIdx - moon.signIndex + 12) % 12) + 1;

  const liveJup = liveSkyChart.planets.find((p) => p.id === 'Jupiter')!;
  const liveSat = liveSkyChart.planets.find((p) => p.id === 'Saturn')!;
  const liveRahu = liveSkyChart.planets.find((p) => p.id === 'Rahu')!;
  const liveKetu = liveSkyChart.planets.find((p) => p.id === 'Ketu')!;

  const jupOrb = shortestAngularDiff(liveJup.siderealLongitude, bbLon);
  const satOrb = shortestAngularDiff(liveSat.siderealLongitude, bbLon);
  const rahuOrb = shortestAngularDiff(liveRahu.siderealLongitude, bbLon);
  const ketuOrb = shortestAngularDiff(liveKetu.siderealLongitude, bbLon);

  const jupHouseRel = ((bbSignIdx - liveJup.signIndex + 12) % 12) + 1;
  const jupTrineOrConj = [1, 5, 7, 9].includes(jupHouseRel) || jupOrb <= 9;
  const satConj = liveSat.signIndex === bbSignIdx || satOrb <= 7;
  const nodeConj = liveRahu.signIndex === bbSignIdx || liveKetu.signIndex === bbSignIdx || rahuOrb <= 7 || ketuOrb <= 7;

  const isActivatedNow = jupTrineOrConj || satConj || nodeConj;
  const signNameEn = ZODIAC_SIGNS[bbSignIdx].name;
  const signLabel = trSign(signNameEn, lang);
  const nakLabel = trNakshatra(NAKSHATRAS[bbNakIdx].name, lang);

  let activationBadge = isNe ? 'शान्त बीजारोपण चरण' : 'Steady Seeding Window';
  let activationTone: 'optimal' | 'favorable' | 'info' = 'info';
  let liveTriggerNote = isNe
    ? `जब गोचरको बृहस्पति वा शनि ${signLabel} राशिमा प्रवेश गर्छ वा दृष्टि दिन्छ, भाव ${houseFromLagna} मा उल्लेख्य प्रगति र भाग्य-मोड सक्रिय हुन्छ।`
    : `Whenever transiting Jupiter or Saturn enters or aspects ${signLabel}, fated milestones in House ${houseFromLagna} accelerate noticeably.`;

  if (jupTrineOrConj && satConj) {
    activationBadge = isNe ? 'गुरु + शनि दोहोरो भृगु सक्रियता!' : 'Double Guru + Shani Bhrigu Activation!';
    activationTone = 'optimal';
    liveTriggerNote = isNe
      ? `असाधारण गोचर संयोग: बृहस्पति र शनि दुवैले अहिले तपाईंको भृगु बिन्दु (${signLabel} — भाव ${houseFromLagna}) लाई सक्रिय बनाइरहेका छन्, जसले स्थायी र निर्णायक जीवन उपलब्धि दिन्छ।`
      : `Rare Dharma-Karma trigger: Both transiting Jupiter and Saturn are simultaneously engaging your Bhrigu Bindu (${signLabel}, House ${houseFromLagna})—marking a landmark year of lasting structural reward.`;
  } else if (jupTrineOrConj) {
    activationBadge = isNe ? 'गुरु दृष्टि सक्रिय (शुभ विस्तार)' : 'Jupiter Bhrigu Blessing Active';
    activationTone = 'optimal';
    liveTriggerNote = isNe
      ? `गोचर बृहस्पतिले अहिले तपाईंको भृगु बिन्दु (${signLabel}, भाव ${houseFromLagna}) मा शुभ प्रभाव पारिरहेको छ—अवसर, सल्लाहकार सहयोग र प्रगतिका लागि उत्तम समय!`
      : `Transiting Jupiter (${trSign(liveJup.signName, 'en')}) is actively illuminating your Bhrigu Bindu in ${signLabel} (House ${houseFromLagna})—opening doors, helpful mentors, and constructive expansion.`;
  } else if (satConj) {
    activationBadge = isNe ? 'शनि कर्म-निर्माण सक्रिय' : 'Saturn Foundation Transit Active';
    activationTone = 'favorable';
    liveTriggerNote = isNe
      ? `गोचर शनि अहिले तपाईंको भृगु बिन्दु (${signLabel}, भाव ${houseFromLagna}) नजिक छ—धैर्य र अनुशासित परिश्रमले दीर्घकालीन जग निर्माण हुन्छ।`
      : `Transiting Saturn is crossing your Bhrigu Bindu in ${signLabel} (House ${houseFromLagna})—demanding patience and high standards that forge rock-solid long-term foundations.`;
  } else if (nodeConj) {
    activationBadge = isNe ? 'राहु-केतु रूपान्तरण सक्रिय' : 'Nodal Catalyst Active';
    activationTone = 'favorable';
    liveTriggerNote = isNe
      ? `गोचर राहु/केतु अक्षले तपाईंको भृगु बिन्दु (${signLabel}, भाव ${houseFromLagna}) छुँदैछ—नयाँ सोच र अप्रत्याशित अवसरहरू प्रति सजग रहनुहोस्।`
      : `The transiting Rahu–Ketu axis is sweeping across your Bhrigu Bindu in ${signLabel} (House ${houseFromLagna})—sparking rapid shifts and fresh strategic directions.`;
  }

  const houseFocus = isNe
    ? BHRIGU_HOUSE_MEANINGS_NE[houseFromLagna]
    : BHRIGU_HOUSE_MEANINGS_EN[houseFromLagna];

  return {
    longitude: bbLon,
    signIndex: bbSignIdx,
    signLabel,
    degreeDMS: formatDMS(bbDegInSign),
    nakshatraLabel: nakLabel,
    pada: bbPada,
    houseFromLagna,
    houseFromMoon,
    isActivatedNow,
    activationBadge,
    activationTone,
    destinyMeaning: isNe
      ? `राहु (भविष्यको आकांक्षा) र चन्द्रमा (मन/संस्कार) बीचको मध्य-बिन्दु तपाईंको कुण्डलीको भाव ${houseFromLagna} (${signLabel} ${formatDMS(bbDegInSign)}, ${nakLabel} चरण ${bbPada}) मा पर्छ। मुख्य जीवन क्षेत्र: ${houseFocus}`
      : `The mathematical midpoint between natal Rahu (future destiny hunger) and Moon (emotional memory) lands in House ${houseFromLagna} (${signLabel} ${formatDMS(bbDegInSign)}, ${nakLabel} Pada ${bbPada}). Core manifestation arena: ${houseFocus}`,
    liveTriggerNote,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: भृगु संहिता, चन्द्रकला नाडी र भृगु नन्दी नाडी मध्य-बिन्दु सिद्धान्त'
      : 'Classical Source: Bhrigu Samhita, Chandra Kala Nadi & Bhrigu Nandi Nadi Midpoint Doctrine',
  };
}

// ==================== 3. PUSHKARA NAVAMSHA & PUSHKARA BHAGA BLESSING DETECTOR ====================

export interface PushkaraPlanetTag {
  bodyId: string;
  bodyLabel: string;
  signLabel: string;
  degreeDMS: string;
  house: number;
  isPushkaraNavamsha: boolean;
  isPushkaraBhaga: boolean;
  badgeLabel: string;
  blessingNote: string;
}

export interface PushkaraChartSummary {
  byBodyId: Record<string, PushkaraPlanetTag>;
  blessedBodies: PushkaraPlanetTag[];
  headline: string;
  overviewNarrative: string;
}

function checkPushkaraDegree(signIndex: number, degInSign: number): {
  isPushkaraNavamsha: boolean;
  isPushkaraBhaga: boolean;
} {
  const elem = ZODIAC_SIGNS[((signIndex % 12) + 12) % 12].element; // Fire, Earth, Air, Water
  let isPN = false;
  let bhagaCenter = 21;

  if (elem === 'Fire') {
    isPN = (degInSign >= 20 && degInSign < 23 + 20 / 60) || (degInSign >= 26 + 40 / 60 && degInSign <= 30);
    bhagaCenter = 21;
  } else if (elem === 'Earth') {
    isPN = (degInSign >= 6 + 40 / 60 && degInSign < 10) || (degInSign >= 13 + 20 / 60 && degInSign < 16 + 40 / 60);
    bhagaCenter = 14;
  } else if (elem === 'Air') {
    isPN = (degInSign >= 16 + 40 / 60 && degInSign < 20) || (degInSign >= 23 + 20 / 60 && degInSign < 26 + 40 / 60);
    bhagaCenter = 24;
  } else {
    // Water
    isPN = (degInSign >= 0 && degInSign < 3 + 20 / 60) || (degInSign >= 6 + 40 / 60 && degInSign < 10);
    bhagaCenter = 7;
  }

  const isPB = Math.abs(degInSign - bhagaCenter) <= 1.0;
  return { isPushkaraNavamsha: isPN, isPushkaraBhaga: isPB };
}

export function detectPushkaraBlessings(
  natalChart: NatalChartResult,
  lang: AppLanguage = 'en'
): PushkaraChartSummary {
  const isNe = lang === 'ne';
  const byBodyId: Record<string, PushkaraPlanetTag> = {};
  const blessedBodies: PushkaraPlanetTag[] = [];

  // Check Ascendant
  const ascCheck = checkPushkaraDegree(natalChart.ascendant.signIndex, natalChart.ascendant.degreeInSign);
  if (ascCheck.isPushkaraNavamsha || ascCheck.isPushkaraBhaga) {
    const tag: PushkaraPlanetTag = {
      bodyId: 'Ascendant',
      bodyLabel: isNe ? 'जन्म लग्न' : 'Ascendant (Lagna)',
      signLabel: trSign(natalChart.ascendant.signName, lang),
      degreeDMS: natalChart.ascendant.formattedDMS,
      house: 1,
      isPushkaraNavamsha: ascCheck.isPushkaraNavamsha,
      isPushkaraBhaga: ascCheck.isPushkaraBhaga,
      badgeLabel: ascCheck.isPushkaraBhaga
        ? isNe
          ? 'पुष्कर भाग (परम शुभ अंश)'
          : 'Pushkara Bhaga (Supreme Lotus Degree)'
        : isNe
        ? 'पुष्कर नवांश'
        : 'Pushkara Navamsha',
      blessingNote: isNe
        ? 'तपाईंको लग्न स्वयं पवित्र पुष्कर अंशमा छ—जसले संकटबाट छिटो पुनरुत्थान हुने र जीवनभर प्राकृतिक संरक्षण प्राप्त हुने योग बनाउँछ।'
        : 'Your Ascendant itself sits in a sacred Pushkara lotus zone—bestowing lifelong resilience, graceful recovery from setbacks, and quiet protective fortune.',
    };
    byBodyId.Ascendant = tag;
    blessedBodies.push(tag);
  }

  // Check 9 Planets
  for (const p of natalChart.planets) {
    const chk = checkPushkaraDegree(p.signIndex, p.degreeInSign);
    if (!chk.isPushkaraNavamsha && !chk.isPushkaraBhaga) continue;
    const pClean = p.name.replace('North Node (Rahu)', 'Rahu').replace('South Node (Ketu)', 'Ketu');
    const pLabel = trPlanet(pClean, lang);
    const tag: PushkaraPlanetTag = {
      bodyId: p.id,
      bodyLabel: pLabel,
      signLabel: trSign(p.signName, lang),
      degreeDMS: p.formattedDMS,
      house: p.house,
      isPushkaraNavamsha: chk.isPushkaraNavamsha,
      isPushkaraBhaga: chk.isPushkaraBhaga,
      badgeLabel: chk.isPushkaraBhaga
        ? isNe
          ? 'पुष्कर भाग ★'
          : 'Pushkara Bhaga ★'
        : isNe
        ? 'पुष्कर नवांश'
        : 'Pushkara Navamsha',
      blessingNote: isNe
        ? `${pLabel} पवित्र पुष्कर अंशमा स्थित छ (जातक पारिजात)—भाव ${p.house} का फलहरूमा आन्तरिक पोषण, समृद्धि र सुरक्षात्मक अनुग्रह थपिन्छ।`
        : `${pLabel} occupies a sacred Pushkara nourishing zone (Jataka Parijata)—replenishing House ${p.house} outcomes with steady grace even during demanding transits.`,
    };
    byBodyId[p.id] = tag;
    blessedBodies.push(tag);
  }

  const count = blessedBodies.length;
  const headline =
    count > 0
      ? isNe
        ? `${count} ग्रह/लग्न पवित्र पुष्कर नवांशमा प्रतिष्ठित`
        : `${count} Natal Placement${count > 1 ? 's' : ''} Blessed in Pushkara Navamsha`
      : isNe
      ? 'चन्द्र र गुरुको दृष्टिबाट पोषण सक्रिय'
      : 'Standard Navamsha Distribution (Supported by Benefic Vargas)';

  const overviewNarrative =
    count > 0
      ? isNe
        ? `"पुष्कर" को अर्थ पवित्र कमल-सरोवर वा पोषण हो। तपाईंको कुण्डलीमा ${blessedBodies.map((b) => `${b.bodyLabel} (${b.signLabel} ${b.degreeDMS})`).join(', ')} शुभ नवांश क्षेत्रभित्र पर्दछन्, जसले ती ग्रहको महादशा/अन्तर्दशामा विशेष उन्नति र संरक्षण प्रदान गर्छ।`
        : `"Pushkara" means a sacred lotus pond of nourishment. In your chart, ${blessedBodies.map((b) => `${b.bodyLabel} (${b.signLabel} ${b.degreeDMS})`).join(', ')} fall inside one of the 24 benefic-ruled Pushkara zones—acting as self-healing reservoirs of luck during their Dasha periods.`
      : isNe
      ? 'कुनै ग्रह प्रत्यक्ष पुष्कर ३°२०′ खण्डमा नभए पनि षोडशवर्ग र शुभ त्रिकोण स्वामीहरूले कुण्डलीको आन्तरिक बल कायम राख्छन्।'
      : 'While no natal planet lands inside the narrow 3°20′ Pushkara slices, your chart draws steady nourishment through its Vargottama and Trikona-lord placements.';

  return {
    byBodyId,
    blessedBodies,
    headline,
    overviewNarrative,
  };
}

// ==================== 4. PRASHNA MARGA 64TH NAVAMSHA & 22ND DREKKANA MINDFUL AWARENESS ====================

export interface KharaChhidraAwareness {
  khara64FromMoonSign: string;
  khara64FromMoonLord: string;
  khara64FromLagnaSign: string;
  khara64FromLagnaLord: string;
  drekkana22Sign: string;
  drekkana22Lord: string;
  isTransitTouchingSensitiveZone: boolean;
  mindfulPacingAdvice: string;
  sourceCitation: string;
}

function calcParashariD9Sign(signIndex: number, degInSign: number): number {
  const pada0 = Math.min(8, Math.floor(degInSign / (30 / 9)));
  const mod = signIndex % 4;
  const startSign = mod === 0 ? 0 : mod === 1 ? 9 : mod === 2 ? 6 : 3;
  return (startSign + pada0) % 12;
}

function calcParashariD3Sign(signIndex: number, degInSign: number): number {
  const part = Math.min(2, Math.floor(degInSign / 10)); // 0, 1, 2
  return (signIndex + part * 4) % 12;
}

export function computeKharaAndChhidraAwareness(
  natalChart: NatalChartResult,
  liveSkyChart: NatalChartResult,
  lang: AppLanguage = 'en'
): KharaChhidraAwareness {
  const isNe = lang === 'ne';
  const moon = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];

  const moonD9 = calcParashariD9Sign(moon.signIndex, moon.degreeInSign);
  const lagnaD9 = calcParashariD9Sign(
    natalChart.ascendant.signIndex,
    natalChart.ascendant.degreeInSign
  );
  const lagnaD3 = calcParashariD3Sign(
    natalChart.ascendant.signIndex,
    natalChart.ascendant.degreeInSign
  );

  // 64th Navamsha = 4th sign from reference D9 sign; 22nd Drekkana = 8th sign from Lagna D3 sign
  const kharaMoonSignIdx = (moonD9 + 3) % 12;
  const kharaLagnaSignIdx = (lagnaD9 + 3) % 12;
  const drek22SignIdx = (lagnaD3 + 7) % 12;

  const kharaMoonSignObj = ZODIAC_SIGNS[kharaMoonSignIdx];
  const kharaLagnaSignObj = ZODIAC_SIGNS[kharaLagnaSignIdx];
  const drek22SignObj = ZODIAC_SIGNS[drek22SignIdx];

  const liveSatSign = liveSkyChart.planets.find((p) => p.id === 'Saturn')?.signIndex ?? -1;
  const liveRahuSign = liveSkyChart.planets.find((p) => p.id === 'Rahu')?.signIndex ?? -1;
  const sensitiveSet = new Set([kharaMoonSignIdx, kharaLagnaSignIdx, drek22SignIdx]);
  const isTouching = sensitiveSet.has(liveSatSign) || sensitiveSet.has(liveRahuSign);

  const khara64FromMoonSign = trSign(kharaMoonSignObj.name, lang);
  const khara64FromMoonLord = trPlanet(kharaMoonSignObj.ruler, lang);
  const khara64FromLagnaSign = trSign(kharaLagnaSignObj.name, lang);
  const khara64FromLagnaLord = trPlanet(kharaLagnaSignObj.ruler, lang);
  const drekkana22Sign = trSign(drek22SignObj.name, lang);
  const drekkana22Lord = trPlanet(drek22SignObj.ruler, lang);

  const mindfulPacingAdvice = isNe
    ? isTouching
      ? `सजग विश्राम सङ्केत: गोचर शनि वा राहु अहिले तपाईंको संवेदनशील ६४औँ नवांश (${khara64FromMoonSign}/${khara64FromLagnaSign}) वा २२औँ द्रेष्काण (${drekkana22Sign}) राशिमा भ्रमण गरिरहेको छ। डराउनु पर्दैन—केवल पर्याप्त निद्रा, नियमित स्वास्थ्य जाँच, संयमित यात्रा र कागजी सम्झौतामा दोहोरो अध्ययन अपनाउनुहोस्।`
      : `हाल शनि र राहु दुवै तपाईंको ६४औँ नवांश (${khara64FromMoonSign}, स्वामी ${khara64FromMoonLord}) र २२औँ द्रेष्काण (${drekkana22Sign}, स्वामी ${drekkana22Lord}) बाट टाढा छन्। भविष्यमा ती राशिमा गोचर हुँदा विश्राम र स्वास्थ्य सन्तुलनलाई प्राथमिकता दिनु उत्तम हुन्छ।`
    : isTouching
    ? `Active Mindful-Pacing Window: Transiting Saturn or Rahu is currently passing through one of your classical sensitive checkpoints (${khara64FromMoonSign} / ${khara64FromLagnaSign} / ${drekkana22Sign}). Zero need for alarm—simply prioritize sleep recovery, preventive checkups, unhurried travel, and careful contract review.`
    : `Clear Horizon Right Now: Neither Saturn nor Rahu currently occupies your 64th Navamsha (${khara64FromMoonSign}, Lord ${khara64FromMoonLord}) or 22nd Drekkana (${drekkana22Sign}, Lord ${drekkana22Lord}). Keep these signs in mind simply as periodic rest-and-maintenance checkpoints.`;

  return {
    khara64FromMoonSign,
    khara64FromMoonLord,
    khara64FromLagnaSign,
    khara64FromLagnaLord,
    drekkana22Sign,
    drekkana22Lord,
    isTransitTouchingSensitiveZone: isTouching,
    mindfulPacingAdvice,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: प्रश्नमार्ग (अध्याय १४) — ६४औँ खर नवांश र २२औँ द्रेष्काण सजगता सूत्र'
      : 'Classical Source: Prashna Marga (Ch. 14) — 64th Navamsha & 22nd Drekkana Preventive Pacing',
  };
}

// ==================== 5. TAJIKA VARSHAPHALA (SOLAR RETURN, MUNTHA, YEAR LORD & SAHAMS) ====================

export interface TajikaVarshaphalaProfile {
  solarReturnYear: number;
  completedAge: number;
  varshaPraveshDateIso: string;
  varshaPraveshUtcTime: string;
  varshaLagnaSign: string;
  varshaLagnaLord: string;
  munthaSign: string;
  munthaLord: string;
  munthaHouseFromVarshaLagna: number;
  munthaHouseFromNatalLagna: number;
  munthaTone: 'optimal' | 'favorable' | 'mixed';
  munthaThemeHeadline: string;
  munthaAnnualForecast: string;
  varsheshwaraLord: string;
  varsheshwaraGuidance: string;
  punyaSahamSign: string;
  punyaSahamDegreeDMS: string;
  punyaSahamHouse: number;
  rajyaSahamSign: string;
  rajyaSahamDegreeDMS: string;
  rajyaSahamHouse: number;
  sourceCitation: string;
}

const MUNTHA_HOUSE_FORECAST_EN: Record<
  number,
  { tone: 'optimal' | 'favorable' | 'mixed'; headline: string; forecast: string }
> = {
  1: {
    tone: 'optimal',
    headline: 'Personal Renewal & Executive Initiative (Muntha in 1st)',
    forecast:
      'Strong personal agency, fresh confidence, visibility, and victory through direct initiative this solar year.',
  },
  2: {
    tone: 'favorable',
    headline: 'Treasury & Resource Stewardship (Muntha in 2nd)',
    forecast:
      'Focuses the year on earning power, family responsibilities, disciplined budgeting, and skilled speech.',
  },
  3: {
    tone: 'optimal',
    headline: 'Bold Ventures, Skills & Strategic Courage (Muntha in 3rd)',
    forecast:
      'Highly productive Tajika placement: favors launches, short travels, sibling/team synergy, and decisive execution.',
  },
  4: {
    tone: 'favorable',
    headline: 'Home Sanctuary, Property & Inner Anchoring (Muntha in 4th)',
    forecast:
      'Highlights real estate, home upgrades, family elders, and protecting emotional calm amidst busy duties.',
  },
  5: {
    tone: 'optimal',
    headline: 'Creative Brilliance, Merit & Recognition (Muntha in 5th)',
    forecast:
      'Auspicious year for intellectual breakthroughs, teaching/learning, children, and sound strategic judgment.',
  },
  6: {
    tone: 'mixed',
    headline: 'Routine Discipline, Service & Stamina Care (Muntha in 6th)',
    forecast:
      'Rewards structured daily health habits, clearing old obligations, and pacing work to prevent burnout.',
  },
  7: {
    tone: 'favorable',
    headline: 'Contracts, Partnerships & Public Negotiations (Muntha in 7th)',
    forecast:
      'Centers the year on key one-on-one agreements, spouse/partner teamwork, and patient win-win diplomacy.',
  },
  8: {
    tone: 'mixed',
    headline: 'Deep Restructuring, Audits & Quiet Research (Muntha in 8th)',
    forecast:
      'Calls for conservative risk management, thorough health/financial checkups, and deep behind-the-scenes study.',
  },
  9: {
    tone: 'optimal',
    headline: 'Supreme Bhagya Opening & Long-Range Fortune (Muntha in 9th)',
    forecast:
      'Celebrated in Tajika Neelakanthi as a premier fortune year: expands travel, higher wisdom, mentors, and ethical success.',
  },
  10: {
    tone: 'optimal',
    headline: 'Career Elevation & Institutional Authority (Muntha in 10th)',
    forecast:
      'Peak professional year in Varshaphala: promotes leadership roles, public delivery, and visible career milestones.',
  },
  11: {
    tone: 'optimal',
    headline: 'Abundant Gains, Networks & Goal Fruition (Muntha in 11th)',
    forecast:
      'Harvest year for income growth, supportive alliances, community influence, and realizing multi-year goals.',
  },
  12: {
    tone: 'mixed',
    headline: 'Intentional Investment, Foreign Links & Rest (Muntha in 12th)',
    forecast:
      'Channel expenses consciously toward education, global travel, or charity while guarding sleep and quiet recovery.',
  },
};

const MUNTHA_HOUSE_FORECAST_NE: Record<
  number,
  { tone: 'optimal' | 'favorable' | 'mixed'; headline: string; forecast: string }
> = {
  1: {
    tone: 'optimal',
    headline: 'आत्मबल र नेतृत्व पुनर्जागरण (प्रथम भावमा मुन्था)',
    forecast: 'यो वर्ष व्यक्तिगत पहलकदमी, आत्मविश्वास, प्रतिष्ठा र स्वास्थ्यमा सकारात्मक ऊर्जा प्राप्त हुन्छ।',
  },
  2: {
    tone: 'favorable',
    headline: 'आर्थिक व्यवस्थापन र पारिवारिक दायित्व (द्वितीय भावमा मुन्था)',
    forecast: 'बचत वृद्धि, पारिवारिक समन्वय र प्रभावकारी संवादमा ध्यान केन्द्रित गर्दा राम्रो लाभ मिल्छ।',
  },
  3: {
    tone: 'optimal',
    headline: 'साहसी कदम र सीप विस्तार (तृतीय भावमा मुन्था)',
    forecast: 'ताजक शास्त्रमा अति शुभ: नयाँ कार्यारम्भ, छोटो यात्रा, सञ्चार र सहकार्यबाट छिटो प्रगति हुन्छ।',
  },
  4: {
    tone: 'favorable',
    headline: 'गृह-वाहन र मानसिक शान्ति (चतुर्थ भावमा मुन्था)',
    forecast: 'घर-जग्गा, पारिवारिक सुख र आन्तरिक सन्तुलनलाई बलियो बनाउने वर्ष।',
  },
  5: {
    tone: 'optimal',
    headline: 'बौद्धिक प्रज्ञा र सिर्जनात्मक सफलता (पञ्चम भावमा मुन्था)',
    forecast: 'अध्ययन, अनुसन्धान, सन्तान सुख र दूरदर्शी निर्णयका लागि अत्यन्त फलदायी वर्ष।',
  },
  6: {
    tone: 'mixed',
    headline: 'स्वास्थ्य अनुशासन र कार्य व्यवस्थापन (षष्ठ भावमा मुन्था)',
    forecast: 'नियमित व्यायाम, सन्तुलित आहार र पुराना दायित्व फछ्र्योटमा ध्यान दिँदा अवरोध सहजै पार हुन्छ।',
  },
  7: {
    tone: 'favorable',
    headline: 'साझेदारी र सम्झौता सन्तुलन (सप्तम भावमा मुन्था)',
    forecast: 'जीवनसाथी र व्यावसायिक साझेदारसँग पारदर्शी संवाद र सहकार्यले सफलता दिलाउँछ।',
  },
  8: {
    tone: 'mixed',
    headline: 'गहिरो आत्म-समीक्षा र सावधानी (अष्टम भावमा मुन्था)',
    forecast: 'हतारको आर्थिक जोखिम नलिई स्वास्थ्य जाँच, अनुसन्धान र दीर्घकालीन योजनामा केन्द्रित हुनुहोस्।',
  },
  9: {
    tone: 'optimal',
    headline: 'भाग्योदय र उच्च मार्गदर्शन (नवम भावमा मुन्था)',
    forecast: 'ताजक नीलकण्ठी अनुसार सर्वोत्तम भाग्य वर्ष: यात्रा, उच्च ज्ञान, गुरु कृपा र प्रतिष्ठा बढ्छ।',
  },
  10: {
    tone: 'optimal',
    headline: 'राज्य-सम्मान र करियर शिखर (दशम भावमा मुन्था)',
    forecast: 'पदोन्नति, नेतृत्व जिम्मेवारी र व्यावसायिक उपलब्धि हासिल हुने प्रमुख कर्म-वर्ष।',
  },
  11: {
    tone: 'optimal',
    headline: 'आय वृद्धि र लक्ष्य सिद्धि (एकादश भावमा मुन्था)',
    forecast: 'आर्थिक लाभ, प्रभावशाली मित्र सञ्जाल र पुराना मनोकांक्षा पूरा हुने उत्कृष्ट वर्ष।',
  },
  12: {
    tone: 'mixed',
    headline: 'नियोजित खर्च, वैदेशिक कार्य र विश्राम (द्वादश भावमा मुन्था)',
    forecast: 'अनावश्यक खर्च रोकी शिक्षा, यात्रा वा दानमा सदुपयोग गर्नुहोस् र पर्याप्त विश्राम लिनुहोस्।',
  },
};

function signedSolarDiffDeg(targetLon: number, candidateLon: number): number {
  let diff = norm360(candidateLon) - norm360(targetLon);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function computeTajikaVarshaphala(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  ayanamsha: AyanamshaMode = 'LAHIRI',
  houseSystem: HouseSystem = 'PLACIDUS',
  lang: AppLanguage = 'en',
  referenceDate = new Date()
): TajikaVarshaphalaProfile {
  const isNe = lang === 'ne';
  const natalSun = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];

  // Determine the active Solar Return year (most recent birthday solar return <= referenceDate)
  const refYear = referenceDate.getUTCFullYear();
  const approxBirthdayThisYear = Date.UTC(
    refYear,
    Math.max(0, profile.month - 1),
    Math.min(28, profile.day),
    profile.hour,
    profile.minute
  );
  const solarReturnYear =
    referenceDate.getTime() >= approxBirthdayThisYear - 2 * 86400000 ? refYear : refYear - 1;
  const completedAge = Math.max(0, solarReturnYear - profile.year);

  // Binary search within ±2.5 days around approximate solar return to match natal sidereal Sun longitude
  let loMs =
    Date.UTC(
      solarReturnYear,
      Math.max(0, profile.month - 1),
      Math.max(1, Math.min(28, profile.day)),
      profile.hour,
      profile.minute
    ) -
    3 * 86400000;
  let hiMs = loMs + 6 * 86400000;

  const evalChartAtUtcMs = (ms: number): NatalChartResult => {
    // Shift UTC ms into location's nominal timezoneOffsetHours so calculateNatalChart reconstructs exact UTC
    const localMs = ms + profile.location.timezoneOffsetHours * 3600000;
    const d = new Date(localMs);
    const varshaProf: BirthProfile = {
      ...profile,
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
      unknownTime: false,
    };
    const vedicAya: AyanamshaMode = ayanamsha === 'TROPICAL' ? 'LAHIRI' : ayanamsha;
    return calculateNatalChart(varshaProf, vedicAya, houseSystem, 0);
  };

  let midChart = evalChartAtUtcMs((loMs + hiMs) / 2);
  for (let iter = 0; iter < 14; iter++) {
    const midMs = 0.5 * (loMs + hiMs);
    midChart = evalChartAtUtcMs(midMs);
    const sunLon = midChart.planets.find((p) => p.id === 'Sun')!.siderealLongitude;
    const diff = signedSolarDiffDeg(natalSun.siderealLongitude, sunLon);
    if (Math.abs(diff) < 0.0008) break;
    if (diff < 0) loMs = midMs;
    else hiMs = midMs;
  }

  const varshaChart = midChart;
  const varshaLagnaIdx = varshaChart.ascendant.signIndex;
  const varshaLagnaObj = ZODIAC_SIGNS[varshaLagnaIdx];

  // Muntha progresses 1 sign per completed year from Natal Ascendant
  const munthaSignIdx = (natalChart.ascendant.signIndex + completedAge) % 12;
  const munthaSignObj = ZODIAC_SIGNS[munthaSignIdx];
  const munthaHouseFromVarsha = ((munthaSignIdx - varshaLagnaIdx + 12) % 12) + 1;
  const munthaHouseFromNatal = ((munthaSignIdx - natalChart.ascendant.signIndex + 12) % 12) + 1;

  const munthaSpec = isNe
    ? MUNTHA_HOUSE_FORECAST_NE[munthaHouseFromVarsha]
    : MUNTHA_HOUSE_FORECAST_EN[munthaHouseFromVarsha];

  // Day vs Night Varsha Pravesh (Sun in Houses 7..12 = Day above horizon)
  const vSun = varshaChart.planets.find((p) => p.id === 'Sun')!;
  const vMoon = varshaChart.planets.find((p) => p.id === 'Moon')!;
  const vSat = varshaChart.planets.find((p) => p.id === 'Saturn')!;
  const isDayReturn = vSun.house >= 7 && vSun.house <= 12;
  const vAscLon = varshaChart.ascendant.longitude;

  // Tajika Neelakanthi Saham formulas
  const punyaRaw = isDayReturn
    ? norm360(vMoon.siderealLongitude - vSun.siderealLongitude + vAscLon)
    : norm360(vSun.siderealLongitude - vMoon.siderealLongitude + vAscLon);
  const rajyaRaw = isDayReturn
    ? norm360(vSat.siderealLongitude - vSun.siderealLongitude + vAscLon)
    : norm360(vSun.siderealLongitude - vSat.siderealLongitude + vAscLon);

  const punyaSignIdx = Math.floor(punyaRaw / 30);
  const rajyaSignIdx = Math.floor(rajyaRaw / 30);
  const punyaHouse = ((punyaSignIdx - varshaLagnaIdx + 12) % 12) + 1;
  const rajyaHouse = ((rajyaSignIdx - varshaLagnaIdx + 12) % 12) + 1;

  // Select Varsheshwara (Year Lord) among Natal Lagna Lord, Varsha Lagna Lord, Muntha Lord, Day/Night Sun/Moon Lord
  const officeCandidates = Array.from(
    new Set([
      ZODIAC_SIGNS[natalChart.ascendant.signIndex].ruler,
      varshaLagnaObj.ruler,
      munthaSignObj.ruler,
      isDayReturn ? ZODIAC_SIGNS[vSun.signIndex].ruler : ZODIAC_SIGNS[vMoon.signIndex].ruler,
    ])
  );

  let bestLord = varshaLagnaObj.ruler;
  let bestScore = -999;
  for (const cand of officeCandidates) {
    const vp = varshaChart.planets.find((p) => p.id === cand);
    if (!vp) continue;
    let sc = 0;
    if ([1, 4, 7, 10, 5, 9, 11].includes(vp.house)) sc += 25;
    if (vp.dignity === 'Exalted') sc += 30;
    else if (vp.dignity === 'Own Sign') sc += 22;
    else if (vp.dignity === 'Debilitated') sc -= 15;
    if (cand === munthaSignObj.ruler) sc += 10;
    if (cand === varshaLagnaObj.ruler) sc += 12;
    if (sc > bestScore) {
      bestScore = sc;
      bestLord = cand;
    }
  }

  const varsheshwaraPlanetInVarsha = varshaChart.planets.find((p) => p.id === bestLord);
  const vLordLabel = trPlanet(bestLord, lang);
  const vLordSign = trSign(varsheshwaraPlanetInVarsha?.signName || varshaLagnaObj.name, lang);
  const vLordHouse = varsheshwaraPlanetInVarsha?.house || 1;

  const varsheshwaraGuidance = isNe
    ? `वर्षेश्वर (Year Lord) ${vLordLabel} वार्षिक कुण्डलीको भाव ${vLordHouse} (${vLordSign}) मा स्थित छ—यो वर्ष ${vLordLabel} को कारकत्व (अनुशासन, विवेक र सन्तुलित संवाद) अपनाउँदा वार्षिक लक्ष्यहरू सहजै सफल हुन्छन्।`
    : `Your Varsheshwara (Solar Return Year Lord) is ${vLordLabel}, placed in Annual House ${vLordHouse} (${vLordSign})—leaning into ${vLordLabel}’s constructive qualities unlocks the smoothest breakthroughs of your ${solarReturnYear}–${solarReturnYear + 1} solar year.`;

  const utcIso = varshaChart.utcDate.toISOString();

  return {
    solarReturnYear,
    completedAge,
    varshaPraveshDateIso: utcIso.slice(0, 10),
    varshaPraveshUtcTime: `${utcIso.slice(11, 16)} UTC`,
    varshaLagnaSign: trSign(varshaLagnaObj.name, lang),
    varshaLagnaLord: trPlanet(varshaLagnaObj.ruler, lang),
    munthaSign: trSign(munthaSignObj.name, lang),
    munthaLord: trPlanet(munthaSignObj.ruler, lang),
    munthaHouseFromVarshaLagna: munthaHouseFromVarsha,
    munthaHouseFromNatalLagna: munthaHouseFromNatal,
    munthaTone: munthaSpec.tone,
    munthaThemeHeadline: munthaSpec.headline,
    munthaAnnualForecast: munthaSpec.forecast,
    varsheshwaraLord: vLordLabel,
    varsheshwaraGuidance,
    punyaSahamSign: trSign(ZODIAC_SIGNS[punyaSignIdx].name, lang),
    punyaSahamDegreeDMS: formatDMS(punyaRaw - punyaSignIdx * 30),
    punyaSahamHouse: punyaHouse,
    rajyaSahamSign: trSign(ZODIAC_SIGNS[rajyaSignIdx].name, lang),
    rajyaSahamDegreeDMS: formatDMS(rajyaRaw - rajyaSignIdx * 30),
    rajyaSahamHouse: rajyaHouse,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: आचार्य नीलकण्ठ रचित ताजक नीलकण्ठी (सन् १५८७) — वर्षप्रवेश, मुन्था, पञ्चाधिकारी वर्षेश्वर र सहम सूत्र'
      : 'Classical Source: Acharya Neelakantha’s Tajika Neelakanthi (1587 CE) — Exact Solar Return (Varsha Pravesh), Muntha, Varsheshwara & Sahams',
  };
}

// ==================== 6. 60 JOVIAN SAMVATSARAS (PRABHAVA #1 TO AKSHAYA #60) ====================

export const SIXTY_SAMVATSARAS: {
  num: number;
  en: string;
  ne: string;
  qualityEn: string;
  qualityNe: string;
}[] = [
  { num: 1, en: 'Prabhava', ne: 'प्रभव', qualityEn: 'Creative Genesis & Fresh Foundations', qualityNe: 'नयाँ सिर्जना र शुभ कार्यको थालनी' },
  { num: 2, en: 'Vibhava', ne: 'विभव', qualityEn: 'Expansion, Splendor & Resource Growth', qualityNe: 'वैभव विस्तार र स्रोत-साधन वृद्धि' },
  { num: 3, en: 'Shukla', ne: 'शुक्ल', qualityEn: 'Radiant Clarity, Truth & Pure Reputation', qualityNe: 'निर्मल यश, सत्य र स्वच्छ प्रगति' },
  { num: 4, en: 'Pramodoota', ne: 'प्रमोदूत', qualityEn: 'Joyful Enthusiasm & Community Harmony', qualityNe: 'हर्ष, उत्साह र सामाजिक सद्भाव' },
  { num: 5, en: 'Prajapati', ne: 'प्रजापति', qualityEn: 'Stewardship, Organization & Civic Duty', qualityNe: 'नेतृत्व, संरक्षण र संगठनात्मक कौशल' },
  { num: 6, en: 'Angirasa', ne: 'आङ्गिरस', qualityEn: 'Luminous Wisdom & Scholarly Fire', qualityNe: 'तेजस्वी ज्ञान र अनुसन्धानमूलक प्रज्ञा' },
  { num: 7, en: 'Shrimukha', ne: 'श्रीमुख', qualityEn: 'Auspicious Grace, Beauty & Prosperity', qualityNe: 'लक्ष्मी कृपा, आकर्षण र समृद्धि' },
  { num: 8, en: 'Bhava', ne: 'भाव', qualityEn: 'Sincere Intention & Constructive Manifestation', qualityNe: 'सद्भावना र रचनात्मक कार्य सिद्धि' },
  { num: 9, en: 'Yuva', ne: 'युव', qualityEn: 'Youthful Vigor, Courage & Adaptability', qualityNe: 'नवीन ऊर्जा, साहस र गतिशीलता' },
  { num: 10, en: 'Dhatri', ne: 'धातृ', qualityEn: 'Sustaining Order, Healing & Support', qualityNe: 'धारणा शक्ति, सेवा र पोषण' },
  { num: 11, en: 'Ishwara', ne: 'ईश्वर', qualityEn: 'Sovereign Dignity, Calm & Leadership', qualityNe: 'आत्म-मर्यादा, शान्ति र उच्च नेतृत्व' },
  { num: 12, en: 'Bahudhanya', ne: 'बहुधान्य', qualityEn: 'Bountiful Harvest & Agricultural/Trade Wealth', qualityNe: 'प्रचुर अन्न-धन र व्यापारिक सम्वृद्धि' },
  { num: 13, en: 'Pramathi', ne: 'प्रमाथी', qualityEn: 'Churning Innovation & Bold Reform', qualityNe: 'मन्थनबाट नवीन आविष्कार र सुधार' },
  { num: 14, en: 'Vikrama', ne: 'विक्रम', qualityEn: 'Heroic Initiative & Decisive Achievement', qualityNe: 'पराक्रम, आत्मविश्वास र विजय' },
  { num: 15, en: 'Vrisha', ne: 'वृष', qualityEn: 'Dharmic Endurance & Steady Accumulation', qualityNe: 'धर्मनिष्ठा, सहनशीलता र स्थायित्व' },
  { num: 16, en: 'Chitrabhanu', ne: 'चित्रभानु', qualityEn: 'Many-Splendored Art, Brilliance & Vision', qualityNe: 'बहुआयामिक प्रतिभा र कलात्मक चमक' },
  { num: 17, en: 'Svabhanu', ne: 'स्वभानु', qualityEn: 'Self-Luminous Independence & Integrity', qualityNe: 'आत्मनिर्भरता र स्वाभिमानी तेज' },
  { num: 18, en: 'Tarana', ne: 'तारण', qualityEn: 'Crossing Obstacles & Guiding Others', qualityNe: 'संकट पार लगाउने र मार्गदर्शक क्षमता' },
  { num: 19, en: 'Parthiva', ne: 'पार्थिव', qualityEn: 'Grounded Earthly Mastery & Landed Stability', qualityNe: 'व्यावहारिक दक्षता र भूमि/सम्पत्ति स्थिरता' },
  { num: 20, en: 'Vyaya', ne: 'व्यय', qualityEn: 'Generous Release, Philanthropy & Travel', qualityNe: 'उदार दान, वैदेशिक यात्रा र सदुपयोग' },
  { num: 21, en: 'Sarvajit', ne: 'सर्वजित्', qualityEn: 'All-Conquering Skill & Ethical Mastery', qualityNe: 'सीप र विवेकद्वारा सर्वतोमुखी सफलता' },
  { num: 22, en: 'Sarvadhari', ne: 'सर्वधारी', qualityEn: 'All-Sustaining Stability & Broad Support', qualityNe: 'सबैलाई समेट्ने स्थायित्व र सन्तुलन' },
  { num: 23, en: 'Virodhi', ne: 'विरोधि', qualityEn: 'Independent Discernment & Standing Firm', qualityNe: 'स्वतन्त्र विवेक र सत्यका पक्षमा दृढता' },
  { num: 24, en: 'Vikrita', ne: 'विकृत', qualityEn: 'Unconventional Pivots & Creative Adaptation', qualityNe: 'परिवर्तनशील परिस्थितिमा नवीन समायोजन' },
  { num: 25, en: 'Khara', ne: 'खर', qualityEn: 'Sharp Precision, Grit & Unflinching Focus', qualityNe: 'तीक्ष्ण एकाग्रता र परिश्रमी स्वभाव' },
  { num: 26, en: 'Nandana', ne: 'नन्दन', qualityEn: 'Garden of Delight, Warmth & Family Joy', qualityNe: 'आनन्द, पारिवारिक प्रफुल्लता र स्नेह' },
  { num: 27, en: 'Vijaya', ne: 'विजय', qualityEn: 'Earned Victory, Excellence & Honor', qualityNe: 'परिश्रमजन्य विजय, सम्मान र उत्कृष्टता' },
  { num: 28, en: 'Jaya', ne: 'जय', qualityEn: 'Triumphant Momentum & Clear Purpose', qualityNe: 'सफलताको निरन्तर गति र स्पष्ट लक्ष्य' },
  { num: 29, en: 'Manmatha', ne: 'मन्मथ', qualityEn: 'Charisma, Poetic Aesthetics & Passion', qualityNe: 'सौन्दर्यचेत, आकर्षण र सिर्जनात्मक प्रेम' },
  { num: 30, en: 'Durmukhi', ne: 'दुर्मुखि', qualityEn: 'Candid Truth-Speaking & Tough-Minded Realism', qualityNe: 'स्पष्टवक्ता स्वभाव र यथार्थपरक दृष्टि' },
  { num: 31, en: 'Hemalamba', ne: 'हेमलम्ब', qualityEn: 'Golden Abundance & Long-Horizon Wealth', qualityNe: 'स्वर्णिम समृद्धि र दीर्घकालीन संचय' },
  { num: 32, en: 'Vilambi', ne: 'विलम्बि', qualityEn: 'Patient Deliberation & Unhurried Perfection', qualityNe: 'धैर्यपूर्ण तयारी र परिपक्व परिणाम' },
  { num: 33, en: 'Vikari', ne: 'विकारि', qualityEn: 'Transformative Evolution & System Upgrades', qualityNe: 'रूपानान्तरण र प्रणालीगत परिमार्जन' },
  { num: 34, en: 'Sharvari', ne: 'शर्वरी', qualityEn: 'Starlit Intuition, Contemplation & Rest', qualityNe: 'गहिरो अन्तर्दृष्टि र शान्त मनन' },
  { num: 35, en: 'Plava', ne: 'प्लव', qualityEn: 'Buoyant Crossing, Mobility & Diplomacy', qualityNe: 'लचकता, यात्रा र कूटनीतिक कौशल' },
  { num: 36, en: 'Shubhakrita', ne: 'शुभकृत्', qualityEn: 'Benevolent Works, Merit & Civic Good', qualityNe: 'कल्याणकारी कर्म, पुण्य र सुयश' },
  { num: 37, en: 'Shobhana', ne: 'शोभन', qualityEn: 'Graceful Refinement, Harmony & Honor', qualityNe: 'सुन्दर आचरण, गरिमा र सौन्दर्य' },
  { num: 38, en: 'Krodhi', ne: 'क्रोधि', qualityEn: 'Fierce Drive to Correct Injustice', qualityNe: 'अन्याय विरुद्ध दृढ सङ्कल्प र सुधार' },
  { num: 39, en: 'Vishvavasu', ne: 'विश्वावसु', qualityEn: 'Universal Prosperity & Shared Commonwealth', qualityNe: 'विश्वकल्याण र सामूहिक आर्थिक उन्नति' },
  { num: 40, en: 'Parabhava', ne: 'पराभव', qualityEn: 'Humility, Ego-Checking & Inner Resilience', qualityNe: 'विनम्रता, आत्म-समीक्षा र आन्तरिक बल' },
  { num: 41, en: 'Plavanga', ne: 'प्लवङ्ग', qualityEn: 'Agile Leaps, Problem-Solving & Versatility', qualityNe: 'तीव्र समस्या समाधान र बहुमुखी फुर्ती' },
  { num: 42, en: 'Kilaka', ne: 'कीलक', qualityEn: 'Anchoring Pillar, Commitment & Precision', qualityNe: 'अटल प्रतिबद्धता र सुदृढ स्तम्भ' },
  { num: 43, en: 'Saumya', ne: 'सौम्य', qualityEn: 'Gentle Diplomacy, Scholarly Peace & Kindness', qualityNe: 'सौम्य वाणी, विद्वत्ता र शीतल स्वभाव' },
  { num: 44, en: 'Sadharana', ne: 'साधारण', qualityEn: 'Balanced Equanimity & Accessible Wisdom', qualityNe: 'सरलता, समभाव र व्यावहारिक सन्तुलन' },
  { num: 45, en: 'Virodhikrita', ne: 'विरोधिकृत्', qualityEn: 'Critical Synthesis & Resolving Polarities', qualityNe: 'विपरीत विचारबीच समन्वय खोज्ने क्षमता' },
  { num: 46, en: 'Paridhavi', ne: 'परिधावि', qualityEn: 'Protective Vigilance & Foresight', qualityNe: 'दूरदर्शी सतर्कता र परिवार संरक्षण' },
  { num: 47, en: 'Pramadi', ne: 'प्रमादि', qualityEn: 'Lesson in Mindful Focus Over Distraction', qualityNe: 'अवधान र सजगताको अभ्यासबाट सफलता' },
  { num: 48, en: 'Ananda', ne: 'आनन्द', qualityEn: 'Spiritual Joy, Contentment & Celebration', qualityNe: 'आत्मानन्द, सन्तुष्टि र उत्सवमय जीवन' },
  { num: 49, en: 'Rakshasa', ne: 'राक्षस', qualityEn: 'Unstoppable Raw Stamina & Fearless Execution', qualityNe: 'अदम्य साहस र कठिन कार्य सम्पन्न गर्ने ऊर्जा' },
  { num: 50, en: 'Nala', ne: 'नल', qualityEn: 'Refined Craftsmanship & Transformative Fire', qualityNe: 'शिल्पकौशल र परिष्कारक अग्नि-ऊर्जा' },
  { num: 51, en: 'Pingala', ne: 'पिङ्गल', qualityEn: 'Golden Solar Vitality & Determined Drive', qualityNe: 'सूर्य-तुल्य उज्यालो उत्साह र दृढ संकल्प' },
  { num: 52, en: 'Kalayukta', ne: 'कालयुक्त', qualityEn: 'Mastery of Timing, Strategy & Epoch Shifts', qualityNe: 'समय-चक्र पहिचान गर्ने रणनीतिक प्रज्ञा' },
  { num: 53, en: 'Siddharthi', ne: 'सिद्धार्थी', qualityEn: 'Fulfillment of Purpose & Accomplished Goals', qualityNe: 'मनोरथ सिद्धि र लक्ष्य पूर्णता' },
  { num: 54, en: 'Raudra', ne: 'रौद्र', qualityEn: 'Cathartic Clearing of Stagnant Structures', qualityNe: 'पुराना अवरोध पन्छाएर नयाँ बाटो खोल्ने शक्ति' },
  { num: 55, en: 'Durmati', ne: 'दुर्मति', qualityEn: 'Testing Discernment Through Independent Logic', qualityNe: 'गहिरो परीक्षणपछि मात्र निर्णय लिने विवेक' },
  { num: 56, en: 'Dundubhi', ne: 'दुन्दुभि', qualityEn: 'Resonant Proclamation, Music & Public Reach', qualityNe: 'विजय-ध्वनि, सञ्चार प्रभाव र प्रतिष्ठा' },
  { num: 57, en: 'Rudhirodgari', ne: 'रुधिरोद्गारि', qualityEn: 'Intense Life-Force, Surgery/Healing & Grit', qualityNe: 'तीव्र जीवनशक्ति र संकटमोचन साहस' },
  { num: 58, en: 'Raktakshi', ne: 'रक्ताक्षि', qualityEn: 'Passionate Vigilance & Protective Justice', qualityNe: 'न्यायप्रिय सजगता र कर्मनिष्ठा' },
  { num: 59, en: 'Krodhana', ne: 'क्रोधन', qualityEn: 'Disciplined Intensity & Breakthrough Will', qualityNe: 'अनुशासित ऊर्जा र निर्णायक इच्छाशक्ति' },
  { num: 60, en: 'Akshaya', ne: 'अक्षय', qualityEn: 'Inexhaustible Merit & Imperishable Legacy', qualityNe: 'अक्षय पुण्य, स्थायी कीर्ति र पूर्णता' },
];

export interface SamvatsaraEntry {
  number: number; // 1..60
  nameEn: string;
  nameNe: string;
  vimsatiRuler: string;
  qualityLabel: string;
  fullTitle: string;
}

export function computeSamvatsaraFromBsYear(
  bsYear: number,
  lang: AppLanguage = 'en'
): SamvatsaraEntry {
  const isNe = lang === 'ne';
  // Standard Nepali Panchang / Saka-Bikram alignment (e.g. 2081 BS = Krodhi #38, 2082 BS = Vishvavasu #39, 2083 BS = Parabhava #40)
  // Check: (2082 + 17) % 60 = 2099 % 60 = 59? Wait: 34 * 60 = 2040; 2082 - 2040 = 42; 42 - 3 = 39!
  // Let's verify: (2081 - 3) % 60 = 2078 % 60 = 38 (Krodhi)! (2082 - 3) % 60 = 39 (Vishvavasu)! (2083 - 3) % 60 = 40 (Parabhava)!
  const rawRem = (((bsYear - 3) % 60) + 60) % 60;
  const number = rawRem === 0 ? 60 : rawRem;
  const item = SIXTY_SAMVATSARAS[number - 1];

  const vimsatiRuler =
    number <= 20
      ? isNe
        ? 'ब्रह्मा विंशति (सृष्टि चक्र १–२०)'
        : 'Brahma Vimsati (Creation Cycle 1–20)'
      : number <= 40
      ? isNe
        ? 'विष्णु विंशति (पालन चक्र २१–४०)'
        : 'Vishnu Vimsati (Preservation Cycle 21–40)'
      : isNe
      ? 'रुद्र/शिव विंशति (रूपान्तरण चक्र ४१–६०)'
      : 'Rudra-Shiva Vimsati (Transformation Cycle 41–60)';

  const qualityLabel = isNe ? item.qualityNe : item.qualityEn;
  const fullTitle = isNe
    ? `${item.ne} संवत्सर (#${number}/६०)`
    : `${item.en} Samvatsara (#${number}/60)`;

  return {
    number,
    nameEn: item.en,
    nameNe: item.ne,
    vimsatiRuler,
    qualityLabel,
    fullTitle,
  };
}

// ==================== 7. PANCHAPAKSHI SHASTRA (5 SACRED COSMIC BIRDS) ====================

export type PakshiBirdId = 'Vulture' | 'Owl' | 'Crow' | 'Cock' | 'Peacock';
export type PakshiActivityId = 'Ruling' | 'Eating' | 'Walking' | 'Sleeping' | 'Dying';

export interface PakshiYamaSlot {
  periodType: 'DAY' | 'NIGHT';
  yamaIndex: number; // 1..5
  startTime: string;
  endTime: string;
  activity: PakshiActivityId;
  activityLabel: string;
  sanskritState: string;
  powerPercent: number;
  tone: 'optimal' | 'favorable' | 'info' | 'mixed' | 'avoid';
  guidance: string;
  isCurrent: boolean;
}

export interface PanchapakshiSchedule {
  natalBirdId: PakshiBirdId;
  natalBirdLabel: string;
  natalBirdSanskrit: string;
  natalBirdTamil: string;
  natalPakshaLabel: string;
  birdArchetypeNote: string;
  activeSlot: PakshiYamaSlot;
  daySlots: PakshiYamaSlot[];
  nightSlots: PakshiYamaSlot[];
  bestSlotsTodaySummary: string;
  sourceCitation: string;
}

const BIRD_META: Record<
  PakshiBirdId,
  { en: string; ne: string; sanskrit: string; tamil: string; noteEn: string; noteNe: string }
> = {
  Vulture: {
    en: 'Vulture / Royal Hawk',
    ne: 'गृध्र / गरुड-बाज',
    sanskrit: 'गृध्र (Gridhra)',
    tamil: 'வல்லூறு (Valluru)',
    noteEn: 'High-altitude strategic vision, decisive authority, and spiritual perception.',
    noteNe: 'उच्च दूरदृष्टि, रणनीतिक निर्णय क्षमता र आध्यात्मिक एकाग्रता।',
  },
  Owl: {
    en: 'Sacred Owl',
    ne: 'उलूक (लाटोकोसेरो)',
    sanskrit: 'उलूक (Uluka)',
    tamil: 'ஆந்தை (Aanthai)',
    noteEn: 'Quiet night-vision wisdom, treasury intuition, research depth, and calm discernment.',
    noteNe: 'गहिरो अनुसन्धान प्रज्ञा, मौन दूरदर्शिता र अर्थ-व्यवस्थापन कौशल।',
  },
  Crow: {
    en: 'Messenger Crow',
    ne: 'काक (काग)',
    sanskrit: 'काक (Kaka)',
    tamil: 'காகம் (Kaakam)',
    noteEn: 'Social intelligence, swift communication, ancestral protection, and adaptability.',
    noteNe: 'तीव्र संवाद कला, सामाजिक सजगता र परिस्थितिअनुसार छिटो घुलमिल हुने गुण।',
  },
  Cock: {
    en: 'Solar Rooster',
    ne: 'कुक्कुट (भाले)',
    sanskrit: 'कुक्कुट (Kukkuta)',
    tamil: 'கோழி (Kozhi)',
    noteEn: 'Dawn-herald courage, punctual discipline, protective vigilance, and bold initiative.',
    noteNe: 'प्रभातकालीन उत्साह, समयनिष्ठ अनुशासन र निडर कार्य-तत्परता।',
  },
  Peacock: {
    en: 'Royal Peacock',
    ne: 'मयूर (मुजुर)',
    sanskrit: 'मयूर (Mayura)',
    tamil: 'மயில் (Mayil)',
    noteEn: 'Diplomatic grace, creative magnetism, transmuting poison into beauty, and harmony.',
    noteNe: 'सौन्दर्य, कूटनीतिक माधुर्य, सिर्जनात्मक आकर्षण र नकारात्मकतालाई रूपान्तरण गर्ने शक्ति।',
  },
};

const ACTIVITY_META: Record<
  PakshiActivityId,
  {
    en: string;
    ne: string;
    sanskrit: string;
    pct: number;
    tone: 'optimal' | 'favorable' | 'info' | 'mixed' | 'avoid';
    guideEn: string;
    guideNe: string;
  }
> = {
  Ruling: {
    en: 'Ruling (Rajya)',
    ne: 'राज्य (शिखर बल)',
    sanskrit: 'राज्य',
    pct: 100,
    tone: 'optimal',
    guideEn: 'Peak command window — launch key contracts, negotiations, and high-stakes decisions.',
    guideNe: 'सर्वोच्च सफलताको याम — महत्त्वपूर्ण सम्झौता, वार्ता र मुख्य कार्य थालनीका लागि सर्वोत्तम।',
  },
  Eating: {
    en: 'Eating (Bhojana)',
    ne: 'भोजन (पोषण/लाभ)',
    sanskrit: 'भोजन',
    pct: 80,
    tone: 'favorable',
    guideEn: 'Nourishing growth window — ideal for wealth, study, meetings, and steady progress.',
    guideNe: 'लाभ र पोषणको याम — आर्थिक कारोबार, अध्ययन, भेटघाट र सन्तुलित प्रगतिका लागि शुभ।',
  },
  Walking: {
    en: 'Walking (Gamana)',
    ne: 'गमन (मध्यम गति)',
    sanskrit: 'गमन',
    pct: 55,
    tone: 'info',
    guideEn: 'Balanced movement — good for travel, follow-ups, errands, and routine execution.',
    guideNe: 'मध्यम क्रियाशील याम — यात्रा, नियमित कामकाज र फलो-अपका लागि उपयुक्त।',
  },
  Sleeping: {
    en: 'Sleeping (Nidra)',
    ne: 'निद्रा (विश्राम याम)',
    sanskrit: 'निद्रा',
    pct: 25,
    tone: 'mixed',
    guideEn: 'Low outward momentum — favor rest, reading, planning, and quiet preparation.',
    guideNe: 'कम बाह्य ऊर्जा — नयाँ जोखिम नलिई अध्ययन, योजना र विश्राममा समय दिनुहोस्।',
  },
  Dying: {
    en: 'Dying / Depleted (Marana)',
    ne: 'मरण/क्षीण (मौन सावधानी)',
    sanskrit: 'मरण',
    pct: 10,
    tone: 'avoid',
    guideEn: 'Pause major new starts, lending, or confrontations; keep duties light and calm.',
    guideNe: 'नयाँ ठूलो सुरुवात, ऋण वा विवाद नगर्नुहोस्; हल्का नियमित काम र शान्त ध्यानमा रहनुहोस्।',
  },
};

const SHUKLA_BIRD_ORDER: PakshiBirdId[] = ['Vulture', 'Owl', 'Crow', 'Cock', 'Peacock'];
const KRISHNA_BIRD_ORDER: PakshiBirdId[] = ['Vulture', 'Crow', 'Peacock', 'Owl', 'Cock'];

// Weekday starting Ruling Bird [Sun=0 .. Sat=6]
const SHUKLA_DAY_START: PakshiBirdId[] = ['Vulture', 'Owl', 'Vulture', 'Owl', 'Crow', 'Vulture', 'Owl'];
const SHUKLA_NIGHT_START: PakshiBirdId[] = ['Crow', 'Crow', 'Crow', 'Peacock', 'Cock', 'Peacock', 'Vulture'];
const KRISHNA_DAY_START: PakshiBirdId[] = ['Vulture', 'Owl', 'Cock', 'Crow', 'Peacock', 'Vulture', 'Cock'];
const KRISHNA_NIGHT_START: PakshiBirdId[] = ['Cock', 'Peacock', 'Vulture', 'Owl', 'Crow', 'Peacock', 'Vulture'];

const SHUKLA_ACT_FLOW: PakshiActivityId[] = ['Eating', 'Walking', 'Ruling', 'Sleeping', 'Dying'];
const KRISHNA_ACT_FLOW: PakshiActivityId[] = ['Eating', 'Dying', 'Sleeping', 'Ruling', 'Walking'];

export function resolveNatalPakshiBird(
  nakshatraZeroIdx: number,
  isShuklaPaksha: boolean
): PakshiBirdId {
  const n = Math.min(27, Math.max(1, nakshatraZeroIdx + 1)); // 1..27
  if (n <= 5) return isShuklaPaksha ? 'Vulture' : 'Peacock';
  if (n <= 11) return isShuklaPaksha ? 'Owl' : 'Cock';
  if (n <= 16) return 'Crow';
  if (n <= 21) return isShuklaPaksha ? 'Cock' : 'Owl';
  return isShuklaPaksha ? 'Peacock' : 'Vulture';
}

function parseHHMMToMin(hhmm: string, fallback: number): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm.trim());
  if (!m) return fallback;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function minToHHMM(totalMin: number): string {
  const norm = (((Math.round(totalMin) % 1440) + 1440) % 1440);
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function computePanchapakshiSchedule(
  natalMoonNakIdx: number,
  isNatalShuklaPaksha: boolean,
  panchang: PanchangReport,
  lang: AppLanguage = 'en'
): PanchapakshiSchedule {
  const isNe = lang === 'ne';
  const natalBirdId = resolveNatalPakshiBird(natalMoonNakIdx, isNatalShuklaPaksha);
  const bMeta = BIRD_META[natalBirdId];

  const isTodayShukla = panchang.tithi.paksha.toLowerCase().includes('shukla');
  const [yr, mo, dy] = panchang.dateStr.split('-').map((x) => parseInt(x, 10));
  const weekday = new Date(Date.UTC(yr || 2026, (mo || 1) - 1, dy || 1)).getUTCDay(); // 0..6

  const sunriseMin = parseHHMMToMin(panchang.sunriseTime, 375);
  const sunsetMin = parseHHMMToMin(panchang.sunsetTime, 1110);
  const daySpan = Math.max(300, sunsetMin - sunriseMin);
  const nightSpan = 1440 - daySpan;

  // Approximate current local minute from activeHorai window + minutesRemaining
  const activeStart = parseHHMMToMin(panchang.activeHorai.startTime, sunriseMin);
  const activeEnd = parseHHMMToMin(panchang.activeHorai.endTime, sunriseMin + 60);
  const horaiLen = ((activeEnd - activeStart + 1440) % 1440) || 60;
  const nowLocalMin =
    (activeStart + Math.max(0, horaiLen - panchang.activeHorai.minutesRemaining)) % 1440;

  const birdOrder = isTodayShukla ? SHUKLA_BIRD_ORDER : KRISHNA_BIRD_ORDER;
  const actFlow = isTodayShukla ? SHUKLA_ACT_FLOW : KRISHNA_ACT_FLOW;
  const dayStartBird = isTodayShukla ? SHUKLA_DAY_START[weekday] : KRISHNA_DAY_START[weekday];
  const nightStartBird = isTodayShukla ? SHUKLA_NIGHT_START[weekday] : KRISHNA_NIGHT_START[weekday];

  const birdPos = birdOrder.indexOf(natalBirdId);
  const dayStartPos = birdOrder.indexOf(dayStartBird);
  const nightStartPos = birdOrder.indexOf(nightStartBird);

  const buildSlots = (
    periodType: 'DAY' | 'NIGHT',
    baseStartMin: number,
    totalSpanMin: number,
    startBirdIdx: number
  ): PakshiYamaSlot[] => {
    const stepMin = totalSpanMin / 5;
    const slots: PakshiYamaSlot[] = [];
    // Find which Yama gives Ruling to startBirdIdx on Yama 0 -> offset
    const rulingIdxInFlow = actFlow.indexOf('Ruling');
    const birdOffset = (birdPos - startBirdIdx + 5) % 5;

    for (let y = 0; y < 5; y++) {
      const sMin = baseStartMin + y * stepMin;
      const eMin = baseStartMin + (y + 1) * stepMin;
      const act = actFlow[(rulingIdxInFlow + y - birdOffset + 10) % 5];
      const aMeta = ACTIVITY_META[act];

      const normNow =
        periodType === 'NIGHT' && nowLocalMin < sunriseMin ? nowLocalMin + 1440 : nowLocalMin;
      const isCurrent = normNow >= sMin && normNow < eMin;

      slots.push({
        periodType,
        yamaIndex: y + 1,
        startTime: minToHHMM(sMin),
        endTime: minToHHMM(eMin),
        activity: act,
        activityLabel: isNe ? aMeta.ne : aMeta.en,
        sanskritState: aMeta.sanskrit,
        powerPercent: aMeta.pct,
        tone: aMeta.tone,
        guidance: isNe ? aMeta.guideNe : aMeta.guideEn,
        isCurrent,
      });
    }
    return slots;
  };

  const daySlots = buildSlots('DAY', sunriseMin, daySpan, dayStartPos);
  const nightSlots = buildSlots('NIGHT', sunsetMin, nightSpan, nightStartPos);
  const allSlots = [...daySlots, ...nightSlots];
  const activeSlot = allSlots.find((s) => s.isCurrent) || daySlots[0];

  const peakDaySlots = daySlots.filter((s) => s.activity === 'Ruling' || s.activity === 'Eating');
  const bestSlotsTodaySummary = peakDaySlots
    .map((s) => `${s.startTime}–${s.endTime} (${s.activityLabel})`)
    .join('  •  ');

  return {
    natalBirdId,
    natalBirdLabel: isNe ? bMeta.ne : bMeta.en,
    natalBirdSanskrit: bMeta.sanskrit,
    natalBirdTamil: bMeta.tamil,
    natalPakshaLabel: isNatalShuklaPaksha
      ? isNe
        ? 'शुक्ल पक्ष जन्म'
        : 'Shukla Paksha (Waxing Moon Birth)'
      : isNe
      ? 'कृष्ण पक्ष जन्म'
      : 'Krishna Paksha (Waning Moon Birth)',
    birdArchetypeNote: isNe ? bMeta.noteNe : bMeta.noteEn,
    activeSlot,
    daySlots,
    nightSlots,
    bestSlotsTodaySummary,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: महर्षि अगस्त्य प्रणीत पञ्चपक्षी शास्त्र (५ याम जैविक-ऊर्जा चक्र)'
      : 'Classical Source: Siddhar Agastya’s Panchapakshi Shastra (5-Bird Biorhythm & Yama Muhurta)',
  };
}

// ==================== 8. 3x3 LO SHU / VEDIC NUMEROLOGY MAGIC SQUARE & 8 PLANES ====================

export interface LoShuCell {
  digit: number; // 1..9 in [4,9,2, 3,5,7, 8,1,6]
  count: number;
  repeatedDigitsText: string;
  planetRuler: string;
  direction: string;
  element: string;
  domainLabel: string;
}

export interface LoShuArrowPlane {
  id: string;
  digits: [number, number, number];
  nameLabel: string;
  category: 'Horizontal' | 'Vertical' | 'Yoga Diagonal';
  completionCount: number; // 0..3 present
  isComplete: boolean;
  tone: 'optimal' | 'favorable' | 'neutral';
  meaning: string;
}

export interface LoShuVedicGridResult {
  mulankDriver: number;
  bhagyankConductor: number;
  cellsIn3x3Order: LoShuCell[]; // [4, 9, 2, 3, 5, 7, 8, 1, 6]
  planes: LoShuArrowPlane[];
  completedYogas: LoShuArrowPlane[];
  missingDigits: { digit: number; remedyTip: string }[];
  sourceCitation: string;
}

const LOSHU_CELL_META: Record<
  number,
  {
    planetEn: string;
    planetNe: string;
    dirEn: string;
    dirNe: string;
    elemEn: string;
    elemNe: string;
    domEn: string;
    domNe: string;
    missingTipEn: string;
    missingTipNe: string;
  }
> = {
  1: {
    planetEn: 'Sun (Surya)',
    planetNe: 'सूर्य',
    dirEn: 'North',
    dirNe: 'उत्तर',
    elemEn: 'Water',
    elemNe: 'जल',
    domEn: 'Career Voice & Leadership',
    domNe: 'नेतृत्व र आत्म-अभिव्यक्ति',
    missingTipEn: 'Practice speaking your ideas clearly in meetings and hydrate well each morning.',
    missingTipNe: 'आफ्ना विचार आत्मविश्वासका साथ राख्ने अभ्यास गर्नुहोस् र बिहान पर्याप्त पानी पिउनुहोस्।',
  },
  2: {
    planetEn: 'Moon (Chandra)',
    planetNe: 'चन्द्रमा',
    dirEn: 'South-West',
    dirNe: 'नैऋत्य',
    elemEn: 'Earth',
    elemNe: 'पृथ्वी',
    domEn: 'Partnership & Empathy',
    domNe: 'सहकार्य र संवेदनशीलता',
    missingTipEn: 'Cultivate patient active listening in partnerships and keep the South-West corner tidy.',
    missingTipNe: 'सम्बन्धमा धैर्यपूर्वक सुन्ने बानी बसाल्नुहोस् र नैऋत्य कोण स्वच्छ राख्नुहोस्।',
  },
  3: {
    planetEn: 'Jupiter (Guru)',
    planetNe: 'बृहस्पति',
    dirEn: 'East',
    dirNe: 'पूर्व',
    elemEn: 'Wood / Growth',
    elemNe: 'काष्ठ / वृद्धि',
    domEn: 'Wisdom, Planning & Mentor Grace',
    domNe: 'ज्ञान, कल्पना र गुरु कृपा',
    missingTipEn: 'Commit to continuous reading/mentorship and welcome morning sunlight from the East.',
    missingTipNe: 'नियमित अध्ययन/अनुसन्धानमा जोड दिनुहोस् र बिहानको पूर्वी घाम ग्रहण गर्नुहोस्।',
  },
  4: {
    planetEn: 'Rahu (Uranus)',
    planetNe: 'राहु',
    dirEn: 'South-East',
    dirNe: 'आग्नेय',
    elemEn: 'Wood / Order',
    elemNe: 'काष्ठ / व्यवस्था',
    domEn: 'Systems, Discipline & Wealth Order',
    domNe: 'अनुशासन, व्यवस्था र आर्थिक नियम',
    missingTipEn: 'Use written checklists and automated savings systems to anchor daily organization.',
    missingTipNe: 'लिखित कार्यसूची र नियमित बचत प्रणाली अपनाएर कार्यमा अनुशासन ल्याउनुहोस्।',
  },
  5: {
    planetEn: 'Mercury (Budha)',
    planetNe: 'बुध',
    dirEn: 'Center (Brahmasthana)',
    dirNe: 'केन्द्र (ब्रह्मस्थान)',
    elemEn: 'Earth',
    elemNe: 'पृथ्वी',
    domEn: 'Core Balance, Stability & Communication',
    domNe: 'केन्द्रीय सन्तुलन र संवाद',
    missingTipEn: 'Keep the center of your home uncluttered and take daily grounding walks outdoors.',
    missingTipNe: 'घरको मध्यभाग खुला/सफा राख्नुहोस् र दैनिक प्रकृतिको सान्निध्यमा हिँड्नुहोस्।',
  },
  6: {
    planetEn: 'Venus (Shukra)',
    planetNe: 'शुक्र',
    dirEn: 'North-West',
    dirNe: 'वायव्य',
    elemEn: 'Metal',
    elemNe: 'धातु',
    domEn: 'Home Harmony, Allies & Comfort',
    domNe: 'पारिवारिक सुख, मित्र र वैभव',
    missingTipEn: 'Nurture warm family rituals and express gratitude openly to mentors and allies.',
    missingTipNe: 'परिवार र सहयोगी मित्रहरूप्रति कृतज्ञता व्यक्त गर्ने नियमित संस्मरण राख्नुहोस्।',
  },
  7: {
    planetEn: 'Ketu (Neptune)',
    planetNe: 'केतु',
    dirEn: 'West',
    dirNe: 'पश्चिम',
    elemEn: 'Metal',
    elemNe: 'धातु',
    domEn: 'Research, Intuition & Spiritual Trust',
    domNe: 'अन्तर्दृष्टि, अनुसन्धान र अध्यात्म',
    missingTipEn: 'Protect 15 minutes of quiet journaling or meditation daily and trust verified inner insight.',
    missingTipNe: 'दैनिक १५ मिनेट शान्त ध्यान वा आत्म-चिन्तनका लागि छुट्याउनुहोस्।',
  },
  8: {
    planetEn: 'Saturn (Shani)',
    planetNe: 'शनि',
    dirEn: 'North-East',
    dirNe: 'ईशान',
    elemEn: 'Earth',
    elemNe: 'पृथ्वी',
    domEn: 'Financial Wisdom, Grit & Accountability',
    domNe: 'वित्तीय विवेक, परिश्रम र न्याय',
    missingTipEn: 'Review long-term budgets monthly and practice steady, unhurried follow-through.',
    missingTipNe: 'दीर्घकालीन आर्थिक हिसाब-किताब स्पष्ट राख्नुहोस् र धैर्यपूर्वक काम पूरा गर्नुहोस्।',
  },
  9: {
    planetEn: 'Mars (Mangala)',
    planetNe: 'मङ्गल',
    dirEn: 'South',
    dirNe: 'दक्षिण',
    elemEn: 'Fire',
    elemNe: 'अग्नि',
    domEn: 'Courage, Ambition & Humanitarian Zeal',
    domNe: 'साहस, उत्साह र परोपकारी ऊर्जा',
    missingTipEn: 'Engage in regular physical exercise and channel passion into tangible service goals.',
    missingTipNe: 'नियमित शारीरिक व्यायाम गर्नुहोस् र आफ्नो ऊर्जालाई समाजोपयोगी लक्ष्यमा जोड्नुहोस्।',
  },
};

export function computeLoShuVedicGrid(
  profile: BirthProfile,
  lifePathSingle: number,
  birthDaySingle: number,
  lang: AppLanguage = 'en'
): LoShuVedicGridResult {
  const isNe = lang === 'ne';
  const rawDateDigits = `${profile.year}${String(profile.month).padStart(2, '0')}${String(
    profile.day
  ).padStart(2, '0')}`
    .split('')
    .map((d) => parseInt(d, 10))
    .filter((d) => d >= 1 && d <= 9);

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of rawDateDigits) counts[d] = (counts[d] || 0) + 1;

  // Include Mulank (Driver) & Bhagyank (Conductor) per Vedic Lo Shu standard
  if (birthDaySingle >= 1 && birthDaySingle <= 9) counts[birthDaySingle] += 1;
  if (lifePathSingle >= 1 && lifePathSingle <= 9) counts[lifePathSingle] += 1;

  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const cellsIn3x3Order: LoShuCell[] = gridOrder.map((digit) => {
    const c = counts[digit] || 0;
    const m = LOSHU_CELL_META[digit];
    return {
      digit,
      count: c,
      repeatedDigitsText: c > 0 ? String(digit).repeat(c) : '—',
      planetRuler: isNe ? m.planetNe : m.planetEn,
      direction: isNe ? m.dirNe : m.dirEn,
      element: isNe ? m.elemNe : m.elemEn,
      domainLabel: isNe ? m.domNe : m.domEn,
    };
  });

  const planeSpecs: {
    id: string;
    digits: [number, number, number];
    cat: LoShuArrowPlane['category'];
    en: string;
    ne: string;
    meanEn: string;
    meanNe: string;
  }[] = [
    {
      id: 'GOLDEN_YOG',
      digits: [4, 5, 6],
      cat: 'Yoga Diagonal',
      en: 'Golden Raj Yoga Diagonal (4–5–6)',
      ne: 'स्वर्ण राजयोग विकर्ण (४–५–६)',
      meanEn: 'Celebrated prosperity & leadership alignment combining order (4), balance (5), and Venusian grace (6).',
      meanNe: 'अनुशासन (४), सन्तुलन (५) र शुक्र वैभव (६) को दुर्लभ संयोग—समृद्धि र उच्च सम्मान सूचक।',
    },
    {
      id: 'SILVER_YOG',
      digits: [2, 5, 8],
      cat: 'Yoga Diagonal',
      en: 'Silver Rajat Yoga Diagonal (2–5–8)',
      ne: 'रजत स्थिरता योग विकर्ण (२–५–८)',
      meanEn: 'Grounded property, real-estate, and emotional resilience alignment uniting Moon (2), Mercury (5), and Saturn (8).',
      meanNe: 'भूमि/भवन, पारिवारिक स्थायित्व र धैर्यपूर्ण आर्थिक निर्माण दिने बलियो विकर्ण।',
    },
    {
      id: 'MENTAL',
      digits: [4, 9, 2],
      cat: 'Horizontal',
      en: 'Mental & Analytical Plane (4–9–2)',
      ne: 'मानसिक तथा बौद्धिक स्तर (४–९–२)',
      meanEn: 'Sharp memory, conceptual architecture, and fast strategic synthesis.',
      meanNe: 'तीक्ष्ण स्मरणशक्ति, तार्किक विश्लेषण र द्रुत वैचारिक स्पष्टता।',
    },
    {
      id: 'EMOTIONAL',
      digits: [3, 5, 7],
      cat: 'Horizontal',
      en: 'Emotional & Intuitive Plane (3–5–7)',
      ne: 'भावनात्मक तथा आध्यात्मिक स्तर (३–५–७)',
      meanEn: 'Heart-centered empathy, counseling warmth, and trustworthy inner intuition.',
      meanNe: 'सहानुभूति, आध्यात्मिक संवेदना र गहिरो आन्तरिक बोध।',
    },
    {
      id: 'PRACTICAL',
      digits: [8, 1, 6],
      cat: 'Horizontal',
      en: 'Practical & Material Plane (8–1–6)',
      ne: 'व्यावहारिक तथा भौतिक स्तर (८–१–६)',
      meanEn: 'Hands-on commercial execution, financial prudence, and organizational delivery.',
      meanNe: 'यथार्थपरक कार्यान्वयन, व्यावसायिक दक्षता र भौतिक स्थायित्व।',
    },
    {
      id: 'THOUGHT',
      digits: [4, 3, 8],
      cat: 'Vertical',
      en: 'Strategic Thought Column (4–3–8)',
      ne: 'दूरदर्शी विचार स्तम्भ (४–३–८)',
      meanEn: 'Long-range planning, policy architecture, and seeing three moves ahead.',
      meanNe: 'दीर्घकालीन योजना निर्माण र दूरदर्शी रणनीतिक सोच।',
    },
    {
      id: 'WILLPOWER',
      digits: [9, 5, 1],
      cat: 'Vertical',
      en: 'Unbreakable Willpower Column (9–5–1)',
      ne: 'अटल इच्छाशक्ति स्तम्भ (९–५–१)',
      meanEn: 'Core spine of determination—finishing what you start despite setbacks.',
      meanNe: 'कुनै पनि अवरोधका बाबजुद लक्ष्य पूरा गरिछाड्ने दृढ संकल्प।',
    },
    {
      id: 'ACTION',
      digits: [2, 7, 6],
      cat: 'Vertical',
      en: 'Swift Action & Implementation Column (2–7–6)',
      ne: 'क्रियाशील कार्यान्वयन स्तम्भ (२–७–६)',
      meanEn: 'Turning ideas rapidly into real-world prototypes, service, and tangible results.',
      meanNe: 'योजनालाई तुरुन्तै व्यवहार र परिणाममा उतार्ने कार्यकुशलता।',
    },
  ];

  const planes: LoShuArrowPlane[] = planeSpecs.map((sp) => {
    const presentCount = sp.digits.filter((d) => (counts[d] || 0) > 0).length;
    const isComplete = presentCount === 3;
    return {
      id: sp.id,
      digits: sp.digits,
      nameLabel: isNe ? sp.ne : sp.en,
      category: sp.cat,
      completionCount: presentCount,
      isComplete,
      tone: isComplete ? 'optimal' : presentCount === 2 ? 'favorable' : 'neutral',
      meaning: isNe ? sp.meanNe : sp.meanEn,
    };
  });

  const completedYogas = planes.filter((pl) => pl.isComplete);
  const missingDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter((d) => (counts[d] || 0) === 0)
    .map((d) => ({
      digit: d,
      remedyTip: isNe ? LOSHU_CELL_META[d].missingTipNe : LOSHU_CELL_META[d].missingTipEn,
    }));

  return {
    mulankDriver: birthDaySingle,
    bhagyankConductor: lifePathSingle,
    cellsIn3x3Order,
    planes,
    completedYogas,
    missingDigits,
    sourceCitation: isNe
      ? 'शास्त्रीय स्रोत: वैदिक अंक-यन्त्र एवं लो-शु ३×३ जादुई वर्ग (मूलांक + भाग्यांक अष्ट-दिशा सूत्र)'
      : 'Classical Source: Vedic Ank-Yantra & 3×3 Lo Shu Magic Square (Birth Date + Mulank + Bhagyank 8-Plane Synthesis)',
  };
}

// Helper for Bikram Sambat Birth & Live Samvatsara bundle
export function buildSamvatsaraPair(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  referenceDate = new Date(),
  lang: AppLanguage = 'en'
): { birthSamvatsara: SamvatsaraEntry; currentSamvatsara: SamvatsaraEntry } {
  const birthBs = gregorianToBikramSambat(birthYear, birthMonth, birthDay);
  const currBs = gregorianToBikramSambat(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth() + 1,
    referenceDate.getUTCDate()
  );
  return {
    birthSamvatsara: computeSamvatsaraFromBsYear(birthBs.bsYear, lang),
    currentSamvatsara: computeSamvatsaraFromBsYear(currBs.bsYear, lang),
  };
}
