import { CityLocation } from '../types/oceanology';
import { calculatePanchang, PanchangReport } from '../engines/panchangEngine';
import { STANDARD_27_NAKSHATRAS } from './nakshatraCodex';

export type ActionCategory =
  | 'Wealth & Debt'
  | 'Enterprise & Law'
  | 'Home & Construction'
  | 'Sacred Rites & Study'
  | 'Body, Surgery & Grooming'
  | 'Travel & Closure';

export interface LifeActionSpec {
  id: string;
  title: string;
  sanskritTitle: string;
  category: ActionCategory;
  shortPrompt: string;
  classicalSource: string;
  idealNatureGroups: string[];
  avoidNatureGroups: string[];
  idealMukha?: 'Urdhvamukha' | 'Adhomukha' | 'Tiryangmukha';
  favoredWeekdays: number[];   // 0=Sun..6=Sat
  forbiddenWeekdays: number[];
  favoredNakshatras: number[]; // 0..26
  forbiddenNakshatras: number[];
  riktaAllowed: boolean;       // True for debt-repayment, surgery, demolition, confrontation!
  panchakaSensitive: boolean;
  travelDirection?: 'East' | 'West' | 'North' | 'South';
  baseRuleSummary: string;
  ifDoneInAuspiciousWindow: string;
  ifDoneInForbiddenWindow: string;
}

export const LIFE_ACTIONS: LifeActionSpec[] = [
  {
    id: 'LEND_MONEY',
    title: 'Lending Money or Extending Credit',
    sanskritTitle: 'ऋण दान (Rina Dana)',
    category: 'Wealth & Debt',
    shortPrompt: 'What happens if I lend capital or extend credit today?',
    classicalSource: 'Muhurta Chintamani (Shubhashubha Prakarana) & Sanketa Nidhi',
    idealNatureGroups: ['Chara', 'Kshipra'],
    avoidNatureGroups: ['Dhruva', 'Tikshna', 'Ugra'],
    favoredWeekdays: [1, 4, 5], // Mon, Thu, Fri
    forbiddenWeekdays: [2, 3, 6], // Tue, Wed, Sat
    favoredNakshatras: [0, 4, 6, 7, 12, 14, 16, 21, 26],
    forbiddenNakshatras: [1, 2, 3, 5, 8, 9, 11, 17, 18, 20, 24, 25], // Avoid Krittika, Ashlesha, Mula, Ugra, & Dhruva (locks capital!)
    riktaAllowed: false,
    panchakaSensitive: true,
    baseRuleSummary: 'Muhurta Chintamani warns never to lend money under Ashlesha, Krittika, Mula, Bharani, on Tuesdays/Wednesdays, during Bhadra (Vishti), or in Chora Panchaka. Paradoxically, Dhruva (Fixed) stars also freeze lent capital in immovable lockup, whereas Kshipra/Chara stars circulate it swiftly back to your hand.',
    ifDoneInAuspiciousWindow: 'Capital circulates cleanly, borrower honors repayment terms without rancor, and goodwill strengthens between both parties.',
    ifDoneInForbiddenWindow: 'Funds lent in Ashlesha, Krittika, Mula, Tuesday/Wednesday, or Chora Panchaka become entangled in excuses, fiery disputes, or permanent default.',
  },
  {
    id: 'BORROW_MONEY',
    title: 'Taking a Loan, Mortgage, or Debt',
    sanskritTitle: 'ऋण ग्रहण (Rina Grahana)',
    category: 'Wealth & Debt',
    shortPrompt: 'What happens if I sign a loan or borrow money today?',
    classicalSource: 'Muhurta Chintamani & Kalaprakashika',
    idealNatureGroups: ['Chara', 'Kshipra'],
    avoidNatureGroups: ['Dhruva', 'Ugra', 'Tikshna'],
    favoredWeekdays: [1, 3, 4, 5],
    forbiddenWeekdays: [0, 2, 6], // Strictly avoid Tuesday (Runa-Vriddhi) & Saturday (lifelong drag)
    favoredNakshatras: [0, 6, 7, 14, 16, 21],
    forbiddenNakshatras: [1, 2, 3, 8, 9, 11, 12, 18, 20, 22, 25], // Muhurta texts specifically forbid Hasta (12), Mula (18), & Dhruva stars for borrowing!
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Classical Shastra states that debt contracted on Tuesday (Mangalavara), Saturday, in Dhruva (Fixed) stars, Hasta, Mula, or during Tripushkara/Dwipushkara Yoga refuses to be cleared and multiplies through compounding interest.',
    ifDoneInAuspiciousWindow: 'The borrowed capital serves its productive purpose briskly and is retired ahead of schedule without crushing interest.',
    ifDoneInForbiddenWindow: 'Taking debt on Tuesday, Saturday, Dhruva stars, or Tripushkara creates "Runa-Bandhana"—one loan requiring three further loans to service.',
  },
  {
    id: 'REPAY_DEBT',
    title: 'Repaying Debt & Clearing Liabilities',
    sanskritTitle: 'ऋण मोचन (Rina Mochana)',
    category: 'Wealth & Debt',
    shortPrompt: 'What happens if I pay down a loan principal today?',
    classicalSource: 'Muhurta Chintamani & Brihat Samhita',
    idealNatureGroups: ['Kshipra', 'Mishra', 'Tikshna', 'Ugra'],
    avoidNatureGroups: ['Dhruva'],
    favoredWeekdays: [2, 3], // Tuesday (Runa-Mochaka Mangala!) & Wednesday
    forbiddenWeekdays: [6],
    favoredNakshatras: [0, 2, 6, 7, 18, 19], // Ashwini, Krittika (burns debt!), Punarvasu, Pushya, Mula (uproots debt!), Purva Ashadha
    forbiddenNakshatras: [3, 11, 20, 25],
    riktaAllowed: true, // Rikta ("Empty") Tithis 4, 9, 14 EMPTY out liabilities!
    panchakaSensitive: false,
    baseRuleSummary: 'The great inverse law of Muhurta: Tuesday (Mangalavara), Rikta Tithis (Chaturthi, Navami, Chaturdashi), Krittika (Agni’s Dahana Shakti), and Mula (Nirriti’s uprooting Shakti)—which ruin new loans—are SUPREME for paying off old debt so liability never regenerates!',
    ifDoneInAuspiciousWindow: 'Even a partial principal payment on Tuesday or Krittika/Ashwini/Rikta rapidly accelerates complete freedom from debt.',
    ifDoneInForbiddenWindow: 'Repaying on sluggish Saturday-Dhruva windows clears slowly, often followed by fresh incidental expenses.',
  },
  {
    id: 'BUY_GOLD_WEALTH',
    title: 'Buying Gold, Gems, or Treasury Assets',
    sanskritTitle: 'स्वर्ण-रत्न क्रय (Swarna Kraya)',
    category: 'Wealth & Debt',
    shortPrompt: 'What happens if I buy gold, bullion, or long-term investments today?',
    classicalSource: 'Muhurta Chintamani & Narada Purana',
    idealNatureGroups: ['Kshipra', 'Dhruva', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Tikshna'],
    idealMukha: 'Urdhvamukha',
    favoredWeekdays: [0, 1, 3, 4, 5],
    forbiddenWeekdays: [2, 6],
    favoredNakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 26], // Pushya (#1!), Rohini, Dhanishtha, Revati, Uttara stars
    forbiddenNakshatras: [1, 5, 8, 18, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Guru-Pushya (Thursday + Pushya), Ravi-Pushya, Rohini, Dhanishtha, Chitra, Revati, and Tripushkara/Dwipushkara Yogas multiply precious assets so they remain in the family treasury rather than being liquidated in emergencies.',
    ifDoneInAuspiciousWindow: 'Assets compound steadily, retain auspicious luster, and anchor household Lakshmi across market cycles.',
    ifDoneInForbiddenWindow: 'Gold or investments bought in Rikta, Rahu Kaal, or Ugra/Tikshna stars face distress-sale pressure later.',
  },
  {
    id: 'LAUNCH_BUSINESS',
    title: 'Launching a Business, Product, or Storefront',
    sanskritTitle: 'व्यापार आरम्भ (Vyapara Arambha)',
    category: 'Enterprise & Law',
    shortPrompt: 'What happens if I launch a venture, SaaS product, or shop today?',
    classicalSource: 'Muhurta Chintamani (Vyapara Prakarana) & Brihat Samhita',
    idealNatureGroups: ['Kshipra', 'Dhruva', 'Mridu', 'Chara'],
    avoidNatureGroups: ['Ugra', 'Tikshna'],
    idealMukha: 'Urdhvamukha',
    favoredWeekdays: [1, 3, 4, 5], // Mercury/Jupiter/Venus/Moon days
    forbiddenWeekdays: [2],
    favoredNakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 25, 26],
    forbiddenNakshatras: [1, 2, 5, 8, 9, 17, 18, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Kshipra stars (Ashwini, Pushya, Hasta) generate rapid initial customer velocity, while Dhruva stars (Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) build multi-decade brand permanence.',
    ifDoneInAuspiciousWindow: 'Strong early customer traction, clean cash conversion, and cohesive founding-team morale.',
    ifDoneInForbiddenWindow: 'Launching under Bhadra/Vishti, Rikta, Dagdha, or Ugra/Tikshna stars triggers partner disputes, buggy rollouts, or sluggish demand.',
  },
  {
    id: 'SIGN_CONTRACT',
    title: 'Signing Contracts, Leases, or Covenants',
    sanskritTitle: 'सन्धि पत्र हस्ताक्षर (Sandhi Patra)',
    category: 'Enterprise & Law',
    shortPrompt: 'What happens if I sign a binding agreement or employment offer today?',
    classicalSource: 'Muhurta Chintamani & Phaladeepika',
    idealNatureGroups: ['Dhruva', 'Mridu', 'Kshipra'],
    avoidNatureGroups: ['Tikshna', 'Ugra'],
    favoredWeekdays: [1, 3, 4, 5],
    forbiddenWeekdays: [2],
    favoredNakshatras: [3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 25, 26], // Uttara Phalguni (Aryaman — god of contracts!) is #1!
    forbiddenNakshatras: [1, 5, 8, 17, 18, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Uttara Phalguni (ruled by Aryaman, Vedic guardian of sacred contracts) and Anuradha (Mitra, guardian of treaties) ensure transparent good faith; signing during Rahu Kaal, Ashlesha, or Rikta hides costly fine-print traps.',
    ifDoneInAuspiciousWindow: 'Counterparties honor both letter and spirit of the covenant, creating long-term mutual gain.',
    ifDoneInForbiddenWindow: 'Hidden ambiguities, renegotiation friction, or breach-of-promise disputes emerge within months.',
  },
  {
    id: 'FILE_LITIGATION',
    title: 'Filing Litigation, Audits, or Strategic Defense',
    sanskritTitle: 'विवाद / संग्राम आरम्भ (Sangrama)',
    category: 'Enterprise & Law',
    shortPrompt: 'What happens if I initiate legal enforcement, an audit, or confrontation today?',
    classicalSource: 'Brihat Samhita (Yatra/Sangrama) & Muhurta Chintamani',
    idealNatureGroups: ['Ugra', 'Tikshna', 'Mishra'],
    avoidNatureGroups: ['Mridu'],
    favoredWeekdays: [0, 2, 6], // Sun, Mars, Saturn days command authority
    forbiddenWeekdays: [1, 5],
    favoredNakshatras: [1, 2, 5, 8, 9, 10, 15, 17, 18, 19, 20, 22, 24],
    forbiddenNakshatras: [4, 6, 16, 26], // Gentle Mridu peace stars weaken aggressive filings
    riktaAllowed: true, // Jaya (3,8,13) & Rikta (4,9,14) sharpen tactical edge!
    panchakaSensitive: false,
    baseRuleSummary: 'Unlike gentle ceremonies, legal enforcement and exposing fraud require Ugra, Tikshna, or Apradhrisya stars (Bharani, Krittika, Ashlesha, Magha, Vishakha, Jyeshtha, Mula, Purva/Uttara Ashadha) and Jaya Tithis (3, 8, 13), PROVIDED your personal Chandrabala is strong!',
    ifDoneInAuspiciousWindow: 'Commands evidentiary clarity, judicial gravitas, and decisive deterrence against dishonest adversaries.',
    ifDoneInForbiddenWindow: 'Filing during personal Chandrashtama (8th Moon) or weak Mridu windows hands tactical initiative to the opponent.',
  },
  {
    id: 'LAY_FOUNDATION',
    title: 'Excavating Land & Laying Foundations',
    sanskritTitle: 'भूमि पूजा / शिलान्यास (Shila Nyasa)',
    category: 'Home & Construction',
    shortPrompt: 'What happens if I break ground or lay a building foundation today?',
    classicalSource: 'Brihat Samhita (Vastu Vidya Ch. 53) & Muhurta Chintamani',
    idealNatureGroups: ['Dhruva', 'Mridu'],
    avoidNatureGroups: ['Chara', 'Tikshna'],
    idealMukha: 'Adhomukha', // Downward gaze for excavation, Dhruva for cornerstone!
    favoredWeekdays: [1, 3, 4, 5, 6], // Avoid Sunday & Tuesday (Agni-bhaya / fire hazard in Vastu!)
    forbiddenWeekdays: [0, 2],
    favoredNakshatras: [3, 4, 7, 11, 13, 16, 20, 21, 22, 25, 26],
    forbiddenNakshatras: [1, 2, 5, 8, 17, 18, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Brihat Samhita strictly forbids breaking ground for a home on Tuesday or Sunday (inviting fire/heat affliction) or in Chara/Tikshna stars; Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Pushya, and Anuradha anchor immovable Vastu stability.',
    ifDoneInAuspiciousWindow: 'Construction proceeds on budget without structural settling, labor strikes, or municipal stoppages.',
    ifDoneInForbiddenWindow: 'Breaking ground on Tuesday/Sunday or Rikta/Ashlesha invites cost overruns, boundary disputes, or plumbing/fire defects.',
  },
  {
    id: 'ROOFING_TIMBER',
    title: 'Roofing, Upper Beams, or Solar Installation',
    sanskritTitle: 'गृह आच्छादन (Griha Chhadana)',
    category: 'Home & Construction',
    shortPrompt: 'What happens if I lay a roof, timber beams, or upper structure today?',
    classicalSource: 'Muhurta Chintamani (Panchaka Prakarana)',
    idealNatureGroups: ['Dhruva', 'Kshipra', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Tikshna'],
    idealMukha: 'Urdhvamukha',
    favoredWeekdays: [1, 3, 4, 5],
    forbiddenWeekdays: [0, 2],
    favoredNakshatras: [0, 3, 6, 7, 11, 12, 13, 14, 16, 20, 21],
    forbiddenNakshatras: [1, 2, 5, 8, 18, 22, 23, 24, 25, 26], // ALL 5 Panchaka stars (Dhanishtha P3-4 to Revati) strictly forbidden!
    riktaAllowed: false,
    panchakaSensitive: true,
    baseRuleSummary: 'The #1 rule of Dhanishtha Panchaka in Muhurta Chintamani: NEVER erect a roof, gather timber/fuel, or weave beds while the Moon transits Aquarius and Pisces (Dhanishtha Pada 3 through Revati), especially on Tuesday (Agni Panchaka)!',
    ifDoneInAuspiciousWindow: 'Urdhvamukha + non-Panchaka alignment shelters the home with weatherproof longevity and domestic peace.',
    ifDoneInForbiddenWindow: 'Roofing during Dhanishtha Panchaka or Tuesday Agni-stars classically invites leaks, electrical/fire hazards, or repeated structural repairs.',
  },
  {
    id: 'GRIHA_PRAVESHA',
    title: 'Moving Into a New Home (Griha Pravesha)',
    sanskritTitle: 'गृह प्रवेश (Griha Pravesha)',
    category: 'Home & Construction',
    shortPrompt: 'What happens if I move into a new residence or sanctify a home today?',
    classicalSource: 'Muhurta Chintamani (Vastu-Pravesha) & Matsya Purana',
    idealNatureGroups: ['Dhruva', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Tikshna', 'Chara'],
    favoredWeekdays: [1, 3, 4, 5],
    forbiddenWeekdays: [0, 2, 6], // Avoid Sun, Tue, Sat for auspicious first entry
    favoredNakshatras: [3, 4, 7, 11, 13, 16, 20, 25, 26], // Rohini, Mrigashira, Uttara trio, Chitra, Anuradha, Revati
    forbiddenNakshatras: [0, 1, 2, 5, 8, 9, 15, 17, 18, 19, 24],
    riktaAllowed: false,
    panchakaSensitive: true,
    baseRuleSummary: 'Moving into a home under Dhruva or Mridu stars (Rohini, Anuradha, Revati, Uttara Phalguni/Ashadha/Bhadrapada) on Mon/Wed/Thu/Fri fills the rooms with serenity and prosperity; Chara stars cause frequent forced moves, and Ugra stars stir domestic quarrels.',
    ifDoneInAuspiciousWindow: 'Residents enjoy deep sleep, harmonious family meals, thriving health, and stable multi-year sanctuary.',
    ifDoneInForbiddenWindow: 'Entering on Tuesday, Rikta, Bhadra, or Ugra/Chara stars creates restlessness, sudden repairs, or early relocation.',
  },
  {
    id: 'MARRIAGE_VIVAHA',
    title: 'Marriage Ceremony, Engagement, or Proposal',
    sanskritTitle: 'विवाह संस्कार (Vivaha Samskara)',
    category: 'Sacred Rites & Study',
    shortPrompt: 'What happens if a wedding, engagement, or proposal is held today?',
    classicalSource: 'Muhurta Chintamani (Vivaha Prakarana) & Brihat Samhita',
    idealNatureGroups: ['Dhruva', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Tikshna', 'Kshipra'],
    favoredWeekdays: [1, 3, 4, 5],
    forbiddenWeekdays: [2, 6],
    favoredNakshatras: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26], // Classical 11 Vivaha stars: Rohini, Mrigashira, Magha, U.Phalguni, Hasta, Swati, Anuradha, Mula (P2-4), U.Ashadha, U.Bhadra, Revati! (Pushya #7 STRICTLY EXCLUDED!)
    forbiddenNakshatras: [0, 1, 2, 5, 6, 7, 8, 10, 15, 17, 19, 22, 23, 24], // Note index 7 Pushya forbidden!
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Only specific stars—led by Rohini, Uttara Phalguni, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Mrigashira, Hasta, Swati, and Revati—carry sacred marital longevity. Remember the famous classical paradox: Pushya is supreme for wealth, yet STRICTLY FORBIDDEN for Vivaha!',
    ifDoneInAuspiciousWindow: 'Deep mutual affection, resilient teamwork through life’s seasons, and family harmony.',
    ifDoneInForbiddenWindow: 'Marrying in Pushya, Rikta, Bhadra, Vishakha, Ashlesha, or Bharani invites coldness, ego power-struggles, or external interference.',
  },
  {
    id: 'MANTRA_DIKSHA',
    title: 'Spiritual Initiation, Mantra Japa, or Retreat',
    sanskritTitle: 'मन्त्र दीक्षा (Mantra Diksha)',
    category: 'Sacred Rites & Study',
    shortPrompt: 'What happens if I begin a 40-day Sadhana or Mantra initiation today?',
    classicalSource: 'Sharada Tilaka Tantra & Muhurta Chintamani',
    idealNatureGroups: ['Kshipra', 'Dhruva', 'Mridu'],
    avoidNatureGroups: [],
    idealMukha: 'Urdhvamukha',
    favoredWeekdays: [0, 1, 3, 4, 5],
    forbiddenWeekdays: [],
    favoredNakshatras: [0, 3, 4, 5, 6, 7, 11, 12, 14, 16, 18, 20, 21, 23, 25, 26],
    forbiddenNakshatras: [1],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Pushya (Brahmavarchasa Shakti), Shravana (Shruti listening), Punarvasu, Rohini, Anuradha, Uttara Bhadrapada, Purnima, Ekadashi, and Panchami rapidly awaken Mantra-Chaitanya (living resonance of sacred sound).',
    ifDoneInAuspiciousWindow: 'Concentration settles effortlessly, inner resistance melts, and the 40-day mandala completes unbroken.',
    ifDoneInForbiddenWindow: 'Starting in distracted Dagdha or Chandrashtama windows causes mental restlessness or interrupted vow-keeping.',
  },
  {
    id: 'VIDYARAMBHA',
    title: 'Starting Studies, Research, Coding, or Arts',
    sanskritTitle: 'विद्यारम्भ (Vidyarambha)',
    category: 'Sacred Rites & Study',
    shortPrompt: 'What happens if I start a major course, manuscript, or skill today?',
    classicalSource: 'Muhurta Chintamani (Samskara Prakarana)',
    idealNatureGroups: ['Kshipra', 'Chara', 'Mridu'],
    avoidNatureGroups: ['Ugra'],
    favoredWeekdays: [0, 1, 3, 4, 5], // Wed (Budha), Thu (Guru), Fri (Shukra) are supreme!
    forbiddenWeekdays: [2],
    favoredNakshatras: [0, 4, 5, 6, 7, 12, 13, 14, 16, 21, 23, 26], // Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Shravana, Revati!
    forbiddenNakshatras: [1, 8, 9, 19, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Kshipra stars (Ashwini, Pushya, Hasta) plus Saraswati-aligned Swati, Shravana, Punarvasu, Mrigashira, and Revati on Wednesday or Thursday accelerate neural retention and creative mastery.',
    ifDoneInAuspiciousWindow: 'Rapid comprehension, inspiring mentors, and sustained joy in mastering the craft.',
    ifDoneInForbiddenWindow: 'Starting on Rikta/Bhadra or Ugra Tuesday windows leads to abandoned courses or syllabus confusion.',
  },
  {
    id: 'START_MEDICINE',
    title: 'Taking First Dose of Medicine or Healing Therapy',
    sanskritTitle: 'औषध सेवन (Aushadha Sevana)',
    category: 'Body, Surgery & Grooming',
    shortPrompt: 'What happens if I begin a new prescription or Ayurvedic therapy today?',
    classicalSource: 'Muhurta Chintamani & Ashtanga Hridaya',
    idealNatureGroups: ['Kshipra', 'Chara', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Dhruva'], // Dhruva prolongs illness!
    favoredWeekdays: [0, 1, 3, 4, 5], // Mon, Wed, Thu, Fri, Sun best; avoid Tue/Sat for gentle medicine!
    forbiddenWeekdays: [2, 6],
    favoredNakshatras: [0, 4, 6, 7, 12, 13, 14, 16, 21, 23, 26], // #1 Ashwini (Ashwini Kumaras), #24 Shatabhisha (100 Physicians), Pushya, Hasta, Shravana!
    forbiddenNakshatras: [1, 2, 3, 8, 9, 11, 18, 20, 24, 25], // Avoid Dhruva stars (can make condition chronic/fixed!) & Ugra stars
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Crucial Ayurvedic Muhurta insight: Ashwini (Shighra Vyapani), Shatabhisha (Bheshaja — 100 Physicians), Pushya, Hasta, Punarvasu, and Shravana assimilate medicine swiftly; AVOID Dhruva (Fixed) stars and Saturday so the ailment itself does not become fixed/chronic!',
    ifDoneInAuspiciousWindow: 'High bioavailability, minimal side effects, accurate diagnosis, and swift convalescence.',
    ifDoneInForbiddenWindow: 'Starting medicine on Saturday, Rikta, or Ugra/Dhruva windows risks dosage adjustments or drawn-out recovery.',
  },
  {
    id: 'ELECTIVE_SURGERY',
    title: 'Elective Surgery, Dental Extraction, or Laser Care',
    sanskritTitle: 'शल्य चिकित्सा (Shalya Chikitsa)',
    category: 'Body, Surgery & Grooming',
    shortPrompt: 'What happens if I schedule an elective surgical or dental procedure today?',
    classicalSource: 'Sushruta Samhita, Brihat Samhita & Medical Jyotish',
    idealNatureGroups: ['Tikshna', 'Ugra', 'Mishra'],
    avoidNatureGroups: [],
    favoredWeekdays: [2, 6], // Mars (Surgeon) & Saturn days classically favored for clean incision!
    forbiddenWeekdays: [],
    favoredNakshatras: [0, 1, 2, 5, 8, 12, 13, 17, 18, 23], // Ardra, Ashlesha, Jyeshtha, Mula, Krittika, Ashwini, Hasta, Chitra, Shatabhisha
    forbiddenNakshatras: [3, 10, 24],
    riktaAllowed: true, // Rikta (excising pathology) acceptable if Purnima/Amavasya & Chandrashtama avoided!
    panchakaSensitive: true,
    baseRuleSummary: 'Unlike gentle medicine, Sushruta & Medical Jyotish favor Tuesday/Saturday and sharp Tikshna/precision stars (Ardra, Jyeshtha, Mula, Krittika, Ashwini, Hasta, Chitra) for clean surgical excision—while STRICTLY avoiding Full Moon (Purnima — excess bleeding/fluid pressure), Chandrashtama, and Mrityu Panchaka! (Always defer to urgent medical necessity first.)',
    ifDoneInAuspiciousWindow: 'Clean surgical precision, controlled hemostasis, and smooth tissue knitting.',
    ifDoneInForbiddenWindow: 'Elective procedures right on Purnima, Chandrashtama, or Mrityu Panchaka face higher inflammation, swelling, or slower recovery.',
  },
  {
    id: 'KSHAURAKARMA',
    title: 'Cutting Hair, Shaving, or Grooming (Kshaurakarma)',
    sanskritTitle: 'क्षौरकर्म (Kshaurakarma)',
    category: 'Body, Surgery & Grooming',
    shortPrompt: 'What happens if I cut my hair, shave, or trim nails today?',
    classicalSource: 'Muhurta Chintamani (Samskara), Brihat Samhita & Dharma Sindhu',
    idealNatureGroups: ['Kshipra', 'Mridu', 'Chara'],
    avoidNatureGroups: ['Ugra', 'Tikshna', 'Mishra'],
    favoredWeekdays: [1, 3, 5], // Wednesday (wealth!) & Friday (radiance/gain!) & Monday (Shukla)
    forbiddenWeekdays: [0, 2, 4, 6], // Classical Smriti: Sun drains Tejas, Tue drains Ayus, Thu drains Lakshmi/Guru-grace, Sat brings Vata heaviness!
    favoredNakshatras: [0, 4, 6, 7, 12, 13, 14, 17, 21, 22, 23, 26], // Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Jyeshtha, Shravana, Dhanishtha, Shatabhisha, Revati
    forbiddenNakshatras: [1, 2, 3, 5, 8, 9, 10, 11, 15, 16, 18, 19, 20, 24, 25],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Mahabharata (Anushasana Parva) & Muhurta Chintamani detail exact Kshaurakarma effects: Wednesday brings Lakshmi & clarity, Friday enhances charm & alliances; Tuesday agitates Mars/vitality, Thursday diminishes Guru-fortune, Saturday invites lethargy, and Rikta/Purnima/Amavasya/Ekadashi Tithis drain Ojas.',
    ifDoneInAuspiciousWindow: 'Refreshes pranic aura, brightens sensory clarity, and supports financial/social buoyancy (especially Wed & Fri).',
    ifDoneInForbiddenWindow: 'Cutting hair/nails on Tuesday, Thursday, Saturday, Amavasya, Purnima, Ekadashi, or Rikta Tithis leaves subtle somatic fatigue or irritates Pitta/Vata.',
  },
  {
    id: 'BUY_VEHICLE',
    title: 'Purchasing or Taking Delivery of a Vehicle',
    sanskritTitle: 'वाहन क्रय (Vahana Kraya)',
    category: 'Travel & Closure',
    shortPrompt: 'What happens if I take delivery of a car, bike, or aircraft today?',
    classicalSource: 'Muhurta Chintamani',
    idealNatureGroups: ['Chara', 'Kshipra', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Tikshna'],
    idealMukha: 'Tiryangmukha', // Forward-facing level gaze!
    favoredWeekdays: [1, 3, 4, 5], // Venus (Vahana-karaka Friday!) + Mon/Wed/Thu
    forbiddenWeekdays: [2, 6], // Avoid Mars (collision heat) & Saturn (mechanical drag) for first delivery
    favoredNakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26], // Punarvasu, Swati, Shravana, Ashwini, Rohini (Chariot!), Hasta, Revati
    forbiddenNakshatras: [1, 2, 5, 8, 9, 17, 18, 19, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    baseRuleSummary: 'Chara & Kshipra stars with Tiryangmukha (forward gaze)—especially Ashwini, Swati, Punarvasu, Shravana, Rohini, Hasta, and Revati on Friday, Wednesday, or Thursday—protect vehicles from breakdowns and accidents.',
    ifDoneInAuspiciousWindow: 'Smooth, reliable mileage, safe road protection, and joyful journeys.',
    ifDoneInForbiddenWindow: 'Taking vehicle delivery on Tuesday/Saturday, Rahu Kaal, Rikta, or Bharani/Krittika/Ardra invites frequent garage visits or fender-benders.',
  },
  {
    id: 'TRAVEL_EAST_NORTH',
    title: 'Commencing Travel Eastward or Northward',
    sanskritTitle: 'पूर्व / उत्तर यात्रा (Purva-Uttara Yatra)',
    category: 'Travel & Closure',
    shortPrompt: 'What happens if I depart on an Eastbound or Northbound trip today?',
    classicalSource: 'Brihat Samhita (Yogayatra) & Muhurta Chintamani (Yatra Prakarana)',
    idealNatureGroups: ['Kshipra', 'Chara', 'Mridu'],
    avoidNatureGroups: ['Ugra', 'Dhruva'],
    idealMukha: 'Tiryangmukha',
    favoredWeekdays: [0, 4, 5], // Avoid Mon/Sat (East Dishashoola) & Tue/Wed (North Dishashoola) unless Parihara taken!
    forbiddenWeekdays: [],
    favoredNakshatras: [0, 4, 6, 7, 12, 16, 18, 21, 22, 26], // Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Anuradha, Shravana, Dhanishtha, Revati (Pushan!)
    forbiddenNakshatras: [1, 2, 5, 8, 9, 10, 15, 19, 24],
    riktaAllowed: false,
    panchakaSensitive: false,
    travelDirection: 'East',
    baseRuleSummary: 'Ashwini, Hasta, Pushya, Mrigashira, Anuradha, Punarvasu, Shravana, and Revati bless travelers. Watch Dishashoola: Mon/Sat afflict Eastward starts, and Tue/Wed afflict Northward starts unless classical threshold Parihara is taken!',
    ifDoneInAuspiciousWindow: 'Timely connections, hospitable hosts, successful mission outcomes, and safe return home (Punarvasu/Revati grace).',
    ifDoneInForbiddenWindow: 'Departing in Bharani, Krittika, Ashlesha, Purva Bhadrapada, or unmitigated Dishashoola invites transit delays, lost luggage, or fruitless errands.',
  },
  {
    id: 'TRAVEL_SOUTH_WEST',
    title: 'Commencing Travel Southward or Westward',
    sanskritTitle: 'दक्षिण / पश्चिम यात्रा (Dakshina-Paschima Yatra)',
    category: 'Travel & Closure',
    shortPrompt: 'What happens if I depart on a Southbound or Westbound journey today?',
    classicalSource: 'Muhurta Chintamani (Yatra & Panchaka Prakarana)',
    idealNatureGroups: ['Kshipra', 'Chara', 'Mridu'],
    avoidNatureGroups: ['Ugra'],
    idealMukha: 'Tiryangmukha',
    favoredWeekdays: [1, 2, 3, 6], // Avoid Thu (South Dishashoola) & Sun/Fri (West Dishashoola) without Parihara
    forbiddenWeekdays: [],
    favoredNakshatras: [0, 4, 6, 7, 12, 16, 21],
    forbiddenNakshatras: [1, 2, 5, 8, 9, 15, 22, 23, 24, 25, 26], // South travel strictly cautioned in 5 Panchaka stars!
    riktaAllowed: false,
    panchakaSensitive: true,
    travelDirection: 'South',
    baseRuleSummary: 'Southbound travel carries a special classical alert during Dhanishtha Panchaka (Moon in Aquarius/Pisces — Yama’s direction) and on Thursdays (South Dishashoola); Westbound travel requires Parihara on Sundays and Fridays.',
    ifDoneInAuspiciousWindow: 'Smooth transit, protected health, and timely accomplishment of business or pilgrimage.',
    ifDoneInForbiddenWindow: 'Southward departure during Panchaka or Thursday Dishashoola without Parihara brings exhausting detours or stalled objectives.',
  },
  {
    id: 'SEVER_DEMOLISH',
    title: 'Demolition, Severing Toxic Ties, or Deep Purge',
    sanskritTitle: 'उच्छेदन / जीर्णोद्धार पूर्वकर्म (Ucchedana)',
    category: 'Travel & Closure',
    shortPrompt: 'What happens if I demolish an old structure, end a bad habit, or cut toxic cords today?',
    classicalSource: 'Muhurta Chintamani & Atharvana Jyotish',
    idealNatureGroups: ['Tikshna', 'Ugra', 'Mishra'],
    avoidNatureGroups: ['Dhruva', 'Mridu'],
    idealMukha: 'Adhomukha',
    favoredWeekdays: [0, 2, 6],
    forbiddenWeekdays: [4, 5],
    favoredNakshatras: [1, 2, 5, 8, 18, 19, 24], // Bharani, Krittika, Ardra, Ashlesha, Mula (#1 uprooter!), Purva Bhadrapada
    forbiddenNakshatras: [3, 6, 7, 11, 16, 20, 25, 26], // Never use Punarvasu ("returns again!") or Dhruva stars when trying to end something permanently!
    riktaAllowed: true,
    panchakaSensitive: true,
    baseRuleSummary: 'When you want an outgrown structure, addiction, or parasitic obligation GONE FOR GOOD, use Mula (Nirriti’s uprooting Barhana Shakti), Ardra, Krittika, or Bharani on Rikta Tithi—and NEVER use Punarvasu (which causes the severed thing to regenerate and return!).',
    ifDoneInAuspiciousWindow: 'Clean, irreversible closure—clearing rotten roots so fresh renewal can follow.',
    ifDoneInForbiddenWindow: 'Trying to end a toxic tie in Punarvasu or Dhruva stars causes repeated relapses and lingering entanglements.',
  },
];

export interface ActionEvaluationFactor {
  factor: string;
  status: 'Positive' | 'Neutral' | 'Caution' | 'Critical';
  ruleCited: string;
  detail: string;
}

export interface ActionConsequenceReport {
  action: LifeActionSpec;
  panchang: PanchangReport;
  score: number; // 0 to 100
  verdictTier: 'Supreme Siddha Window' | 'Auspicious & Supportive' | 'Mixed — Proceed With Parihara' | 'Contraindicated — Postpone';
  headlineVerdict: string;
  whatHappensIfDoneNow: string;
  whatHappensIfDelayed: string;
  factors: ActionEvaluationFactor[];
  pariharaRemedies: string[];
}

export function evaluateActionConsequence(
  actionId: string,
  date: Date,
  location: CityLocation,
  natalMoonNakIdx = 0,
  natalMoonSignIdx = 0
): ActionConsequenceReport {
  const action = LIFE_ACTIONS.find((a) => a.id === actionId) || LIFE_ACTIONS[0];
  const panchang = calculatePanchang(date, location, natalMoonNakIdx, natalMoonSignIdx);
  const nakIdx = panchang.nakshatra.zeroIndex;
  const nakTreatise = STANDARD_27_NAKSHATRAS[nakIdx];
  const weekday = panchang.weekdayIdx;

  let score = 62;
  const factors: ActionEvaluationFactor[] = [];
  const pariharaRemedies: string[] = [];

  // 1. Nakshatra Evaluation
  const isFavNak = action.favoredNakshatras.includes(nakIdx);
  const isForbNak = action.forbiddenNakshatras.includes(nakIdx);

  if (action.id === 'MARRIAGE_VIVAHA' && nakIdx === 7) {
    score -= 38;
    factors.push({
      factor: `Nakshatra: Pushya (${nakTreatise.sanskrit})`,
      status: 'Critical',
      ruleCited: 'Muhurta Chintamani — Pushya Vivaha Prohibition',
      detail: 'Classic Shastra exception: Although Pushya is the "King of Nakshatras" for wealth and gold, Brahma’s decree strictly forbids Pushya for Marriage (Vivaha), warning of marital coldness or separation.',
    });
  } else if (action.id === 'GRIHA_PRAVESHA' && nakIdx === 0 && weekday === 2) {
    score -= 30;
    factors.push({
      factor: 'Nakshatra + Vara: Ashwini on Tuesday',
      status: 'Critical',
      ruleCited: 'Muhurta Chintamani — Amrita Siddhi Exception',
      detail: 'Tuesday + Ashwini forms Amrita Siddhi for medicine and trade, yet classical Vastu texts strictly forbid Griha Pravesha under this pair due to Agni/restlessness risk.',
    });
  } else if (isFavNak) {
    score += 18;
    factors.push({
      factor: `Nakshatra: ${nakTreatise.name} (${nakTreatise.natureGroup.split(' ')[0]})`,
      status: 'Positive',
      ruleCited: `${nakTreatise.shaktiName} — ${nakTreatise.shaktiTranslation}`,
      detail: `${nakTreatise.name} directly empowers "${action.title}". ${nakTreatise.natureExplanation}`,
    });
  } else if (isForbNak) {
    score -= 24;
    factors.push({
      factor: `Nakshatra: ${nakTreatise.name} (${nakTreatise.natureGroup.split(' ')[0]})`,
      status: 'Critical',
      ruleCited: `Muhurta Chintamani — ${nakTreatise.natureGroup} Mismatch`,
      detail: `${nakTreatise.name} (${nakTreatise.shaktiName}) works against the intention of "${action.title}". ${action.ifDoneInForbiddenWindow}`,
    });
  } else {
    factors.push({
      factor: `Nakshatra: ${nakTreatise.name} (${nakTreatise.natureGroup.split(' ')[0]})`,
      status: 'Neutral',
      ruleCited: `${nakTreatise.mukhaGaze}`,
      detail: `Moderately neutral lunar mansion for this action; outcome leans heavily on Tithi, Vara, and Choghadiya.`,
    });
  }

  // 2. Mukha (Directional Gaze of Nakshatra)
  if (action.idealMukha) {
    if (nakTreatise.mukhaGaze.startsWith(action.idealMukha)) {
      score += 7;
      factors.push({
        factor: `Nakshatra Gaze: ${nakTreatise.mukhaGaze}`,
        status: 'Positive',
        ruleCited: 'Brihat Samhita — Nakshatra Mukha',
        detail: nakTreatise.mukhaConsequence,
      });
    } else {
      factors.push({
        factor: `Nakshatra Gaze: ${nakTreatise.mukhaGaze}`,
        status: 'Neutral',
        ruleCited: 'Brihat Samhita — Nakshatra Mukha',
        detail: `Action prefers ${action.idealMukha} stars; current star is ${nakTreatise.mukhaGaze.split(' ')[0]}.`,
      });
    }
  }

  // 3. Weekday (Vara)
  if (action.favoredWeekdays.includes(weekday)) {
    score += 10;
    factors.push({
      factor: `Weekday: ${panchang.vara.name}`,
      status: 'Positive',
      ruleCited: `Vara Lord ${panchang.vara.lord}`,
      detail: `${panchang.vara.name} naturally harmonizes with ${action.title}.`,
    });
  } else if (action.forbiddenWeekdays.includes(weekday)) {
    score -= 18;
    let varaNote = `${panchang.vara.name} creates planetary friction for ${action.title}.`;
    if (action.id === 'BORROW_MONEY' && weekday === 2) {
      varaNote = 'Mangalavara (Tuesday) triggers Runa-Vriddhi: loans contracted on Tuesday multiply relentlessly and resist payoff!';
    } else if (action.id === 'LEND_MONEY' && (weekday === 2 || weekday === 3)) {
      varaNote = 'Classical treasury rule: avoid lending money on Tuesday (conflict) or Wednesday (entangled recovery).';
    } else if (action.id === 'KSHAURAKARMA') {
      varaNote = 'Classical Dharma Sindhu & Mahabharata rule forbids cutting hair/nails on Sun, Tue, Thu (drains Guru/Lakshmi grace), and Sat.';
    }
    factors.push({
      factor: `Weekday: ${panchang.vara.name}`,
      status: 'Caution',
      ruleCited: 'Muhurta Chintamani — Vara Phala',
      detail: varaNote,
    });
  }

  // 4. Tithi Group & Special Tithis
  const tithiIdx = panchang.tithi.index; // 1..30
  if (panchang.tithi.isRikta && !action.riktaAllowed) {
    score -= 18;
    factors.push({
      factor: `Tithi: ${panchang.tithi.name} (${panchang.tithi.group})`,
      status: 'Caution',
      ruleCited: 'Rikta Tithi (4th, 9th, 14th — "Empty Hands")',
      detail: 'Rikta Tithis drain gentle, financial, and ceremonial beginnings—leaving endeavors "empty-handed" unless neutralized by Siddha Yoga.',
    });
    pariharaRemedies.push('Wait for the current Rikta Tithi to end, or restrict action strictly to the 48-minute midday Abhijit Muhurta (except Wednesday).');
  } else if (panchang.tithi.isRikta && action.riktaAllowed) {
    score += 12;
    factors.push({
      factor: `Tithi: ${panchang.tithi.name} (Rikta Tactical Alignment!)`,
      status: 'Positive',
      ruleCited: 'Inverse Rikta Law (Debt Clearance / Surgery / Demolition)',
      detail: 'Because Rikta means "to empty," it is classically auspicious for emptying out debt, excising pathology, or demolishing obsolete structures!',
    });
  } else if (tithiIdx === 30 && !['SEVER_DEMOLISH', 'REPAY_DEBT'].includes(action.id)) {
    score -= 16;
    factors.push({
      factor: 'Tithi: Amavasya (New Moon)',
      status: 'Caution',
      ruleCited: 'Pitri Tithi — Zero Lunar Illumination',
      detail: 'Amavasya turns pranic energy inward for ancestral Pitri Tarpanam and contemplation rather than outward worldly launches.',
    });
  } else if (action.id === 'ELECTIVE_SURGERY' && (tithiIdx === 15 || tithiIdx === 30)) {
    score -= 22;
    factors.push({
      factor: `Tithi: ${panchang.tithi.name}`,
      status: 'Critical',
      ruleCited: 'Sushruta & Medical Jyotish — Syzygy Fluid Tide',
      detail: 'Full Moon (Purnima) swells bodily fluids/bleeding risk, while Amavasya lowers somatic vitality; schedule elective procedures 3+ days away from syzygy.',
    });
  } else if (action.id === 'KSHAURAKARMA' && [1, 4, 6, 9, 11, 14, 15, 16, 19, 21, 24, 26, 29, 30].includes(tithiIdx)) {
    score -= 14;
    factors.push({
      factor: `Tithi: ${panchang.tithi.name}`,
      status: 'Caution',
      ruleCited: 'Smriti Kshaurakarma Tithi Rule',
      detail: 'Pratipada, Shashthi, Ekadashi, Rikta (4,9,14), Purnima, and Amavasya are avoided for hair/nail cutting.',
    });
  } else {
    score += 6;
    factors.push({
      factor: `Tithi: ${panchang.tithi.name} (${panchang.tithi.group})`,
      status: 'Positive',
      ruleCited: panchang.tithi.paksha,
      detail: `${panchang.tithi.group} supports constructive momentum (${panchang.tithi.hoursRemaining}).`,
    });
  }

  // 5. Karana (Vishti / Bhadra Check)
  if (panchang.karana.isBhadraVishti && !['SEVER_DEMOLISH', 'FILE_LITIGATION'].includes(action.id)) {
    score -= 20;
    factors.push({
      factor: 'Karana: Vishti (Bhadra)',
      status: 'Critical',
      ruleCited: 'Muhurta Chintamani — Bhadra Dosha',
      detail: 'Vishti (Bhadra) Karana is active for ~12 hours; classical texts pause auspicious ceremonies, lending, marriage, and travel until Bhadra passes.',
    });
    pariharaRemedies.push('Wait a few hours for the 6° half-tithi Vishti (Bhadra) Karana to finish before signing or departing.');
  }

  // 6. Dhanishtha Panchaka Check
  if (action.panchakaSensitive && panchang.panchaka.isActive) {
    const penalty = ['ROOFING_TIMBER', 'TRAVEL_SOUTH_WEST'].includes(action.id) ? 30 : 14;
    score -= penalty;
    factors.push({
      factor: `Panchaka Active: ${panchang.panchaka.type}`,
      status: penalty >= 25 ? 'Critical' : 'Caution',
      ruleCited: 'Brihat Samhita — Dhanishtha Panchaka',
      detail: panchang.panchaka.consequence,
    });
    pariharaRemedies.push('Wait until the Moon exits Revati into 0° Mesha (Ashwini) to clear Dhanishtha Panchaka.');
  }

  // 7. Dishashoola Check for Travel
  if (action.id === 'TRAVEL_EAST_NORTH') {
    if (['East', 'North'].includes(panchang.dishashoola.forbiddenDirection)) {
      score -= 10;
      factors.push({
        factor: `Dishashoola: ${panchang.dishashoola.forbiddenDirection} Thorn Today`,
        status: 'Caution',
        ruleCited: 'Muhurta Chintamani — Dishashoola',
        detail: panchang.dishashoola.consequenceIfIgnored,
      });
      pariharaRemedies.push(`Dishashoola Parihara: ${panchang.dishashoola.pariharaRemedy}`);
    }
  } else if (action.id === 'TRAVEL_SOUTH_WEST') {
    if (['South', 'West'].includes(panchang.dishashoola.forbiddenDirection)) {
      score -= 10;
      factors.push({
        factor: `Dishashoola: ${panchang.dishashoola.forbiddenDirection} Thorn Today`,
        status: 'Caution',
        ruleCited: 'Muhurta Chintamani — Dishashoola',
        detail: panchang.dishashoola.consequenceIfIgnored,
      });
      pariharaRemedies.push(`Dishashoola Parihara: ${panchang.dishashoola.pariharaRemedy}`);
    }
  }

  // 8. Special Vara-Nakshatra Yogas
  for (const sy of panchang.specialYogas) {
    if (sy.nature === 'Supreme' || sy.nature === 'Auspicious') {
      // Respect Guru-Pushya Vivaha exception
      if (!(action.id === 'MARRIAGE_VIVAHA' && nakIdx === 7)) {
        score += sy.nature === 'Supreme' ? 14 : 9;
        factors.push({
          factor: sy.name,
          status: 'Positive',
          ruleCited: sy.sanskrit,
          detail: sy.consequence,
        });
      }
    } else if (sy.nature === 'Multiplier') {
      if (['BUY_GOLD_WEALTH', 'LAUNCH_BUSINESS', 'LAY_FOUNDATION'].includes(action.id)) {
        score += 15;
        factors.push({
          factor: sy.name,
          status: 'Positive',
          ruleCited: sy.sanskrit,
          detail: sy.consequence,
        });
      } else if (['BORROW_MONEY', 'FILE_LITIGATION', 'ELECTIVE_SURGERY'].includes(action.id)) {
        score -= 22;
        factors.push({
          factor: sy.name,
          status: 'Critical',
          ruleCited: sy.sanskrit,
          detail: 'Taking debt, undergoing surgery, or starting disputes in Tripushkara/Dwipushkara causes the event to repeat 2×–3×!',
        });
      }
    } else if (sy.nature === 'Inauspicious') {
      score -= 16;
      factors.push({
        factor: sy.name,
        status: 'Caution',
        ruleCited: sy.sanskrit,
        detail: sy.consequence,
      });
    }
  }

  // 9. Personal Tarabala & Chandrashtama
  if (panchang.personalTarabala.isChandrashtama) {
    score -= 22;
    factors.push({
      factor: 'Personal Moon: Chandrashtama (8th House from Birth Moon)',
      status: 'Critical',
      ruleCited: 'Phaladeepika — Gochara Chandrashtama',
      detail: 'Transit Moon is traversing the 8th sign from your Natal Moon—heightening emotional fatigue and unexpected snags for ~54 hours.',
    });
    pariharaRemedies.push('Offer white flowers or milk/water mindfulness, avoid ego confrontations, and let the Moon move into your 9th Bhava (~2 days) before major launches.');
  } else if (panchang.personalTarabala.isAuspicious && panchang.personalTarabala.chandrabalaAuspicious) {
    score += 10;
    factors.push({
      factor: `Personal Tarabala: ${panchang.personalTarabala.taraName}`,
      status: 'Positive',
      ruleCited: `Chandrabala House ${panchang.personalTarabala.chandrabalaHouse}`,
      detail: 'Both personal Tarabala and Chandrabala harmonize strongly with your natal chart.',
    });
  } else if (!panchang.personalTarabala.isAuspicious) {
    score -= 6;
    factors.push({
      factor: `Personal Tarabala: ${panchang.personalTarabala.taraName}`,
      status: 'Caution',
      ruleCited: 'Janma / Vipat / Pratyak / Naidhana Tara',
      detail: 'Personal star resonance calls for extra mindfulness and avoiding Rahu Kaal.',
    });
  }

  // Always provide practical timing guidance if remedies are empty
  const abhijitSlot = panchang.muhurats.find((m) => m.name.includes('Abhijit'));
  const rahuSlot = panchang.muhurats.find((m) => m.name === 'Rahu Kaal');
  if (rahuSlot) {
    pariharaRemedies.push(`Strictly step around Rahu Kaal (${rahuSlot.startTime}–${rahuSlot.endTime} local time).`);
  }
  if (abhijitSlot && panchang.weekdayIdx !== 3) {
    pariharaRemedies.push(`If action cannot be postponed, anchor execution inside midday Abhijit Muhurta (${abhijitSlot.startTime}–${abhijitSlot.endTime}) or an Amrit/Shubh Choghadiya.`);
  }
  pariharaRemedies.push(`Nakshatra Upaya (${nakTreatise.name}): ${nakTreatise.behavioralUpaya}`);

  const clampedScore = Math.max(8, Math.min(99, Math.round(score)));

  let verdictTier: ActionConsequenceReport['verdictTier'] = 'Mixed — Proceed With Parihara';
  let headlineVerdict = '';
  let whatHappensIfDoneNow = '';
  let whatHappensIfDelayed = '';

  if (clampedScore >= 80) {
    verdictTier = 'Supreme Siddha Window';
    headlineVerdict = `Exceptional Shastra Alignment (${clampedScore}/100) — Proceed With Confidence`;
    whatHappensIfDoneNow = `${action.ifDoneInAuspiciousWindow} Under ${nakTreatise.name}’s ${nakTreatise.shaktiName} (${nakTreatise.shaktiTranslation.toLowerCase()}) and ${panchang.tithi.name}, cosmic tide and personal lunar resonance reinforce enduring fruition.`;
    whatHappensIfDelayed = 'No need to delay—windows of this caliber occur only a few days each lunar month. Simply avoid the daily Rahu Kaal octant.';
  } else if (clampedScore >= 63) {
    verdictTier = 'Auspicious & Supportive';
    headlineVerdict = `Constructive Muhurta (${clampedScore}/100) — Favorable Outside Rahu Kaal`;
    whatHappensIfDoneNow = `${action.ifDoneInAuspiciousWindow} Minor secondary nuances are easily harmonized by choosing an Amrit, Shubh, or Labh Choghadiya window during the day.`;
    whatHappensIfDelayed = 'Acting today yields solid, dependable results; waiting is only necessary if seeking a rare Guru-Pushya or Amrita Siddhi peak.';
  } else if (clampedScore >= 44) {
    verdictTier = 'Mixed — Proceed With Parihara';
    headlineVerdict = `Cross-Currents Active (${clampedScore}/100) — Apply Classical Parihara or Shift Window`;
    whatHappensIfDoneNow = `If performed impulsively today without remedial timing, expect initial friction, paperwork revisions, or slower momentum due to mixed Panchang signals. However, anchoring in Abhijit Muhurta and observing the listed Pariharas buffers most turbulence.`;
    whatHappensIfDelayed = 'Postponing to one of the high-scoring upcoming windows below removes unnecessary headwinds so your effort compounds effortlessly.';
  } else {
    verdictTier = 'Contraindicated — Postpone';
    headlineVerdict = `Shastra Contraindication (${clampedScore}/100) — Postpone If Non-Emergency`;
    whatHappensIfDoneNow = `${action.ifDoneInForbiddenWindow} Classical electional treatises (*Muhurta Chintamani* & *Brihat Samhita*) explicitly counsel against initiating "${action.title}" under this exact combination.`;
    whatHappensIfDelayed = 'Waiting even 24–72 hours for the Moon to enter a supportive Nakshatra and Tithi dramatically protects your treasury, vitality, and peace of mind.';
  }

  return {
    action,
    panchang,
    score: clampedScore,
    verdictTier,
    headlineVerdict,
    whatHappensIfDoneNow,
    whatHappensIfDelayed,
    factors,
    pariharaRemedies,
  };
}

export interface UpcomingWindowCandidate {
  dateStr: string;
  weekdayName: string;
  nakshatraName: string;
  tithiName: string;
  score: number;
  verdictTier: ActionConsequenceReport['verdictTier'];
  bestWindowTime: string;
}

export function scanUpcomingBestWindows(
  actionId: string,
  startDate: Date,
  location: CityLocation,
  natalMoonNakIdx = 0,
  natalMoonSignIdx = 0,
  daysToScan = 12
): UpcomingWindowCandidate[] {
  const candidates: UpcomingWindowCandidate[] = [];
  for (let d = 1; d <= daysToScan; d++) {
    const probeDate = new Date(startDate.getTime() + d * 86400000);
    const evalRep = evaluateActionConsequence(actionId, probeDate, location, natalMoonNakIdx, natalMoonSignIdx);
    const bestChog = evalRep.panchang.dayChoghadiya.find((c) => c.name === 'Amrit' || c.name === 'Shubh') || evalRep.panchang.dayChoghadiya[0];
    candidates.push({
      dateStr: evalRep.panchang.dateStr,
      weekdayName: evalRep.panchang.vara.name.split(' ')[0],
      nakshatraName: evalRep.panchang.nakshatra.name,
      tithiName: evalRep.panchang.tithi.name,
      score: evalRep.score,
      verdictTier: evalRep.verdictTier,
      bestWindowTime: `${bestChog.startTime}–${bestChog.endTime} (${bestChog.name})`,
    });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, 4);
}

// Behavioral Karma-Vipaka Codex (BPHS, Phaladeepika, Brihat Samhita & Classical Behavioral Cause-Effect)
export interface PlanetaryKarmaVipaka {
  planetId: string;
  planetName: string;
  sanskritTitle: string;
  governedDomains: string;
  ifDishonoredBehavior: string;
  consequenceSymptoms: string[];
  ifAlignedBehavior: string;
  alignedFruits: string[];
  livingDharmaPractice: string;
}

export const BEHAVIORAL_KARMA_VIPAKA: PlanetaryKarmaVipaka[] = [
  {
    planetId: 'Sun',
    planetName: 'Sun (Surya)',
    sanskritTitle: 'आत्म-धर्म कर्म विपाक • Sovereign Integrity',
    governedDomains: 'Vitality, eyesight, spine, father/mentors, executive authority, self-respect, and public trust.',
    ifDishonoredBehavior: 'Taking credit for subordinates’ labor, disrespecting one’s father or righteous elders, breaking civic trust in secret, or sleeping habitually well past sunrise in inertia.',
    consequenceSymptoms: [
      'Sudden erosion of institutional reputation or inexplicable clashes with superiors/regulators',
      'Chronic morning lethargy, low digestive fire, vitamin-D/bone depletion, or migraines',
      'Impostor syndrome alternating with brittle defensive pride',
    ],
    ifAlignedBehavior: 'Owning mistakes publicly without excuse, honoring elders and constitutional fairness, greeting the dawn sun, and standing upright as a reliable pillar for dependents.',
    alignedFruits: [
      'Natural gravitas—rooms quiet down when you speak without your needing to raise your voice',
      'Timely patronage from senior statespeople, executives, and mentors',
      'Radiant constitutional stamina and unclouded life direction',
    ],
    livingDharmaPractice: 'Rise before or at sunrise, offer water (Arghya) facing East, and ensure no person working under your authority feels humiliated.',
  },
  {
    planetId: 'Moon',
    planetName: 'Moon (Chandra)',
    sanskritTitle: 'मनः-सोम कर्म विपाक • Emotional & Maternal Nourishment',
    governedDomains: 'Mental peace (Manas), sleep, liquid cash flow, mother, hospitality, memory, and lymphatic immunity.',
    ifDishonoredBehavior: 'Speaking harshly to one’s mother or caregivers, wasting clean drinking water and cooked food, emotionally manipulating vulnerable people, or keeping erratic nocturnal sleep.',
    consequenceSymptoms: [
      'Persistent nocturnal anxiety, overthinking loops, and unrefreshing sleep',
      'Liquid cash slipping through fingers despite decent paper income',
      'Coldness in the home sanctuary or recurring fluid/sinus/stomach sensitivities',
    ],
    ifAlignedBehavior: 'Cherishing maternal figures, offering water or warm food to guests and animals, conserving water mindfully, and honoring natural waxing/waning rest rhythms.',
    alignedFruits: [
      'Deep emotional equanimity (Samatva) even amid external market or career storms',
      'Effortless public goodwill, loyal clientele, and steady liquid savings',
      'Clear intuitive foresight and restorative sleep',
    ],
    livingDharmaPractice: 'Never waste water in your home, speak gently to elders/caregivers, and spend 15 quiet minutes under the evening sky on Purnima.',
  },
  {
    planetId: 'Mars',
    planetName: 'Mars (Mangala)',
    sanskritTitle: 'पराक्रम-अहिंसा कर्म विपाक • Disciplined Valor & Brotherhood',
    governedDomains: 'Courage, blood/marrow, siblings, land & real estate, surgical/engineering craft, and healthy boundaries.',
    ifDishonoredBehavior: 'Cheating siblings in property division, erupting in kitchen/domestic rage while meals are prepared, bullying the weak, or leaving workouts and projects half-finished.',
    consequenceSymptoms: [
      'Inflammatory flare-ups, cuts, burns, blood-pressure spikes, or minor vehicular scrapes',
      'Bitter boundary litigation over land, neighbors, or co-founders',
      'Impulsive decisions that destroy months of patient work in five minutes of anger',
    ],
    ifAlignedBehavior: 'Training the physical body consistently, protecting younger siblings/peers fairly, eating meals in calm silence, and channeling heat into disciplined engineering or service.',
    alignedFruits: [
      'Fearless executive decisiveness under high-pressure deadlines',
      'Smooth acquisition and appreciation of land, homes, and technical assets',
      'Strong muscular/marrow vitality and loyal camaraderie',
    ],
    livingDharmaPractice: 'Never argue around the hearth or dining table, deal generously with siblings, and channel physical fire into daily movement or blood/humanitarian aid.',
  },
  {
    planetId: 'Mercury',
    planetName: 'Mercury (Budha)',
    sanskritTitle: 'वाक्-बुद्धि कर्म विपाक • Speech, Contracts & Truthful Wit',
    governedDomains: 'Nervous system, skin, speech, mathematics, software/commerce, contracts, maternal uncles, and learning.',
    ifDishonoredBehavior: 'Signing fine-print clauses in bad faith, using cleverness to deceive unsophisticated buyers, mocking others’ speech/intellect, or destroying green trees needlessly.',
    consequenceSymptoms: [
      'Nervous exhaustion, skin flare-ups, brain fog, or stammering under pressure',
      'Software outages, misrouted contracts, tax/accounting audits, and commercial misunderstandings',
      'Cleverness backfiring into reputational distrust',
    ],
    ifAlignedBehavior: 'Practicing precision and honesty in every invoice and message, nurturing green plants, lifelong study, and simplifying complex knowledge to empower students.',
    alignedFruits: [
      'Razor-sharp pattern recognition, eloquent persuasion, and profitable trade',
      'Clean legal agreements and resilient multi-stream income',
      'Youthful neural agility across decades',
    ],
    livingDharmaPractice: 'Audit your spoken and written words for 100% factual accuracy, care for living green plants, and gift books or education to eager learners.',
  },
  {
    planetId: 'Jupiter',
    planetName: 'Jupiter (Brihaspati)',
    sanskritTitle: 'गुरु-भाग्य कर्म विपाक • Sacred Wisdom & Ethical Stewardship',
    governedDomains: 'Divine grace (Bhagya), teachers, children, treasury compounding, jurisprudence, liver/metabolism, and optimism.',
    ifDishonoredBehavior: 'Scoffing at teachers or sacred traditions after extracting their knowledge, spiritual hypocrisy (preaching ethics while acting corruptly), or hoarding knowledge selfishly.',
    consequenceSymptoms: [
      'Mysterious "glass ceiling" where 95%-complete opportunities collapse at the eleventh hour',
      'Loss of wise counsel—making uncharacteristic blind-spot errors in judgment',
      'Liver/metabolic sluggishness or estrangement from mentors and children',
    ],
    ifAlignedBehavior: 'Expressing lifelong gratitude to teachers (Guru-Rina), mentoring the next generation freely, stewarding wealth ethically, and keeping faith anchored in lived virtue.',
    alignedFruits: [
      'Uncanny eleventh-hour protection ("Guru-Kripa") during life’s severest crises',
      'Generational compounding of treasury, scholarly respect, and joyful family continuity',
      'Expansive philosophical serenity',
    ],
    livingDharmaPractice: 'Honor every mentor who taught you a craft, share a percentage of gains with educational causes, and never weaponize philosophy for ego.',
  },
  {
    planetId: 'Venus',
    planetName: 'Venus (Shukra)',
    sanskritTitle: 'ओजस्-कलत्र कर्म विपाक • Sacred Eros, Artistry & Mutual Respect',
    governedDomains: 'Marriage/partnership, Ojas (reproductive/creative essence), vehicles, aesthetics, kidneys, luxury, and diplomacy.',
    ifDishonoredBehavior: 'Betraying or belittling a romantic partner, treating intimacy as disposable consumption, living in slovenly disorder, or exploiting artists and women.',
    consequenceSymptoms: [
      'Drainage of personal charisma/Ojas—feeling chronically uninspired and joyless even amid luxury',
      'Painful relational stalemates, costly divorces, or recurring vehicle/aesthetic losses',
      'Hormonal, renal, or glycemic imbalances',
    ],
    ifAlignedBehavior: 'Honoring your partner with genuine courtesy and fidelity, keeping your body and living space clean and harmonious, and patronizing beauty and music.',
    alignedFruits: [
      'Magnetic personal radiance, enduring marital tenderness, and creative fertility',
      'Refined material comfort, reliable vehicles, and diplomatic grace',
      'Regenerative vitality (Sanjeevani Ojas)',
    ],
    livingDharmaPractice: 'Keep your home sanctuary clean and fragrant, speak with genuine appreciation to your partner, and treat creative beauty as sacred.',
  },
  {
    planetId: 'Saturn',
    planetName: 'Saturn (Shani)',
    sanskritTitle: 'सेवा-न्याय कर्म विपाक • Impartial Justice, Labor & Time',
    governedDomains: 'Longevity, career architecture, manual laborers/staff, joints/teeth/nerves, discipline, and karmic reckoning.',
    ifDishonoredBehavior: 'Underpaying or delaying wages of laborers, drivers, or support staff; cutting structural corners; blaming fate while avoiding hard daily craftsmanship.',
    consequenceSymptoms: [
      'Relentless multi-year delays, regulatory penalties, and structural breakdowns',
      'Chronic Vata stiffness in knees, lower back, joints, or dental issues',
      'Crushing isolation and feeling blocked at every gate',
    ],
    ifAlignedBehavior: 'Paying every worker fairly and promptly, embracing patient unglamorous mastery, caring for the elderly and disabled, and owning 100% accountability.',
    alignedFruits: [
      'Unshakeable institutional authority that no competitor or downturn can topple',
      'Loyal teams, enduring real-estate/industrial assets, and remarkable longevity',
      'Calm stoic mastery during Sade Sati or Saturn transits',
    ],
    livingDharmaPractice: 'Pay service workers generously and on time, never despise humble labor, and commit to long-horizon mastery without shortcuts.',
  },
  {
    planetId: 'Rahu',
    planetName: 'Rahu (North Node)',
    sanskritTitle: 'माया-नवाचार कर्म विपाक • Conscious Innovation vs. Illusion',
    governedDomains: 'Frontier technology, foreign lands, mass media, unconventional breakthroughs, amplification, and neuro-electric balance.',
    ifDishonoredBehavior: 'Peddling smoke-and-mirrors hype, addictive doomscrolling/intoxicants,betraying host cultures abroad, or chasing shortcuts via fraud.',
    consequenceSymptoms: [
      'Free-floating insomnia, phantom anxieties, and obsessive compulsions',
      'Sudden viral scandals or boom-and-bust financial reversals',
      'Feeling perpetually dissatisfied no matter how much is acquired',
    ],
    ifAlignedBehavior: 'Pairing bold technological/cross-cultural innovation with radical grounding in truth (Satya), clean air/nature breaks, and ethical transparency.',
    alignedFruits: [
      'Breakthrough pioneer status across global markets and emerging fields',
      'Ability to bridge diverse cultures and spot paradigm shifts years early',
      'Grounded mastery over modern digital tools rather than enslavement to them',
    ],
    livingDharmaPractice: 'Maintain strict digital/dopamine hygiene after sunset, keep financial dealings 100% transparent, and ground ambitious vision in physical craft.',
  },
  {
    planetId: 'Ketu',
    planetName: 'Ketu (South Node)',
    sanskritTitle: 'मोक्ष-प्रज्ञा कर्म विपाक • Non-Attachment & Intuitive Gnosis',
    governedDomains: 'Moksha (liberation), research micro-precision, past-life gifts, Jyotish/meditation, dogs/stray animals, and spinal subtle energy.',
    ifDishonoredBehavior: 'Cynical escapism, ghosting responsibilities under the guise of "spirituality," Cruelty toward stray dogs/animals, or clinging rigidly to past identities.',
    consequenceSymptoms: [
      'Baffling hard-to-diagnose somatic sensitivities or sudden severances',
      'Directionless alienation—feeling disconnected from both world and spirit',
      'Self-sabotaging career peaks right before completion',
    ],
    ifAlignedBehavior: 'Practicing daily quiet contemplation, serving without needing your name on a plaque, caring kindly for stray dogs/creatures, and trusting intuitive synthesis.',
    alignedFruits: [
      'Effortless intuitive breakthroughs in mathematics, coding, medicine, or Jyotish',
      'Deep inner freedom unshaken by praise or blame',
      'Graceful protection from unseen hazards',
    ],
    livingDharmaPractice: 'Spend quiet daily time in non-conceptual stillness, care for stray dogs and animals, and release the need to control every outcome.',
  },
];
