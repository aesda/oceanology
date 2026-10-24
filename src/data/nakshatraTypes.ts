// Classical Nakshatra & 108 Navamsha Pada Schema
// Grounded in Taittiriya Brahmana (I.5.1 & III.1.4), Muhurta Chintamani, Brihat Samhita,
// Brihat Jataka, Jataka Parijata, and Phaladeepika.

export type NakshatraNatureGroup =
  | 'Kshipra (Swift & Light)'
  | 'Dhruva (Fixed & Permanent)'
  | 'Ugra (Fierce & Severe)'
  | 'Mridu (Soft & Tender)'
  | 'Tikshna (Sharp & Piercing)'
  | 'Chara (Movable & Ephemeral)'
  | 'Mishra (Mixed Sharp-Soft)';

export type NakshatraMukhaGaze =
  | 'Urdhvamukha (Upward-Facing)'
  | 'Adhomukha (Downward-Facing)'
  | 'Tiryangmukha (Level / Forward-Facing)';

export type NakshatraLochanaEye =
  | 'Andha Lochana (Blind Eye)'
  | 'Manda Lochana (Slow Eye)'
  | 'Madhya Lochana (Middle Eye)'
  | 'Sulochana (Clear Eye)';

export interface NakshatraPadaDetail {
  pada: 1 | 2 | 3 | 4;
  degreeRange: string;
  navamshaSign: string;
  navamshaRuler: string;
  bijaSound: string;
  specialTag?: 'Vargottama' | 'Pushkara Navamsha' | 'Gandanta' | 'Vargottama & Pushkara' | 'Abhukta Mula';
  expression: string;
}

export interface NakshatraActionConsequence {
  domain: 'Vivaha & Relationships' | 'Wealth, Lending & Trade' | 'Construction & Land' | 'Healing & Body' | 'Travel & Movement' | 'Confrontation & Strategy';
  verdict: 'Supreme' | 'Favorable' | 'Conditional' | 'Avoid';
  ifPerformed: string;
}

export interface NakshatraTreatise {
  index: number; // 0-26 for standard 27, 27 for Abhijit
  number: number; // 1-28
  name: string;
  sanskrit: string;
  nepaliName: string;
  transliteration: string;
  spanSign: string;
  spanDegrees: string;
  astronomyStar: string;
  starCount: number;
  ruler: string;
  deity: string;
  deitySanskrit: string;
  symbol: string;
  secondarySymbols: string;
  // Taittiriya Brahmana Esoteric Shakti Architecture
  shaktiName: string;
  shaktiTranslation: string;
  upariShakti: string; // Upper / Heavenly impulse
  adhoShakti: string;  // Lower / Earthly grounding
  shaktiPhala: string; // Resulting cosmic fruit
  taittiriyaBoon: string; // Taittiriya Brahmana III.1.4 wish granted
  sacredMythos: string;
  // Classical Classification
  natureGroup: NakshatraNatureGroup;
  natureExplanation: string;
  mukhaGaze: NakshatraMukhaGaze;
  mukhaConsequence: string;
  lochanaEye: NakshatraLochanaEye;
  lostObjectVerdict: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi (Vata)' | 'Madhya (Pitta)' | 'Antya (Kapha)';
  rajju: 'Pada (Feet)' | 'Kati (Waist)' | 'Nabhi (Navel)' | 'Kantha (Neck)' | 'Shiro (Head)';
  purushartha: 'Dharma' | 'Artha' | 'Kama' | 'Moksha';
  tattva: 'Earth' | 'Water' | 'Fire' | 'Air' | 'Ether';
  casteVarna: string;
  isPanchaka: boolean;
  isGandanta: boolean;
  // Natal Portraits
  moonPortrait: string;
  ascendantPortrait: string;
  sunPortrait: string;
  vocations: string[];
  shadowTrap: string;
  // 4 Navamsha Padas
  padas: [NakshatraPadaDetail, NakshatraPadaDetail, NakshatraPadaDetail, NakshatraPadaDetail];
  // Action-Consequence Rules ("What happens if...")
  auspiciousWorks: string[];
  inauspiciousWorks: string[];
  actionMatrix: NakshatraActionConsequence[];
  // Remedies & Sacred Ecology
  sacredTree: string;
  vedicMantra: string;
  behavioralUpaya: string;
}
