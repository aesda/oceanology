import { NakshatraTreatise } from './nakshatraTypes';
import { NAKSHATRA_PART_1A } from './nakshatraCodexPart1A';
import { NAKSHATRA_PART_1B } from './nakshatraCodexPart1B';
import { NAKSHATRA_PART_2A } from './nakshatraCodexPart2A';
import { NAKSHATRA_PART_2B } from './nakshatraCodexPart2B';

export * from './nakshatraTypes';

// Complete 28-Nakshatra Classical Codex (27 Standard Lunar Mansions + Intercalary 28th Abhijit)
export const ALL_NAKSHATRA_TREATISES: NakshatraTreatise[] = [
  ...NAKSHATRA_PART_1A,
  ...NAKSHATRA_PART_1B,
  ...NAKSHATRA_PART_2A,
  ...NAKSHATRA_PART_2B,
];

export const STANDARD_27_NAKSHATRAS: NakshatraTreatise[] = ALL_NAKSHATRA_TREATISES.slice(0, 27);
export const ABHIJIT_TREATISE: NakshatraTreatise = ALL_NAKSHATRA_TREATISES[27];

export function getNakshatraTreatiseByIndex(index: number): NakshatraTreatise {
  const safeIdx = ((index % 28) + 28) % 28;
  return ALL_NAKSHATRA_TREATISES[safeIdx] ?? ALL_NAKSHATRA_TREATISES[0];
}

export function getNakshatraTreatiseByName(name: string): NakshatraTreatise {
  const normalized = name.trim().toLowerCase();
  const exact = ALL_NAKSHATRA_TREATISES.find(
    (n) =>
      n.name.toLowerCase() === normalized ||
      n.transliteration.toLowerCase() === normalized ||
      n.sanskrit === name.trim()
  );
  if (exact) return exact;

  // Handle alternate spellings (e.g., Dhanishta vs Dhanishtha, Mrigashirsha vs Mrigashira)
  const fuzzy = ALL_NAKSHATRA_TREATISES.find((n) => {
    const cleanTarget = n.name.toLowerCase().replace(/h/g, '');
    const cleanQuery = normalized.replace(/h/g, '');
    return cleanTarget === cleanQuery || cleanTarget.startsWith(cleanQuery.slice(0, 5));
  });
  return fuzzy ?? ALL_NAKSHATRA_TREATISES[0];
}

export function getNakshatraTreatiseBySiderealLongitude(siderealLon: number): {
  standard: NakshatraTreatise;
  pada: 1 | 2 | 3 | 4;
  isWithinAbhijit: boolean;
} {
  const norm = ((siderealLon % 360) + 360) % 360;
  const nakSpan = 360 / 27; // 13.333333°
  const idx = Math.min(26, Math.floor(norm / nakSpan));
  const posInNak = norm - idx * nakSpan;
  const pada = (Math.min(3, Math.floor(posInNak / (nakSpan / 4))) + 1) as 1 | 2 | 3 | 4;

  // Abhijit spans 06°40′ Makara (276.6667°) to 10°53′20″ Makara (280.8889°)
  const isWithinAbhijit = norm >= 276 + 40 / 60 && norm <= 280 + 53 / 60 + 20 / 3600;

  return {
    standard: STANDARD_27_NAKSHATRAS[idx],
    pada,
    isWithinAbhijit,
  };
}
