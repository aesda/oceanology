import { BirthProfile } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { CosmicSynthesisReport } from '../engines/synthesisEngine';
import { getNakshatraTreatiseByIndex } from './nakshatraCodex';

export interface HousePlainMeaning {
  house: number;
  shortTitle: string;
  lifeAreas: string;
  plainDescription: string;
  whenStrong: string;
  whenLow: string;
}

export const HOUSE_PLAIN_GUIDE: Record<number, HousePlainMeaning> = {
  1: {
    house: 1,
    shortTitle: 'Self, Health & Presence',
    lifeAreas: 'Identity, physical vitality, confidence, first impressions, life direction',
    plainDescription:
      'How you show up in the world, your natural energy levels, resilience, and personal leadership.',
    whenStrong:
      'Natural charisma, strong physical recovery, and clear self-direction help you bounce back quickly.',
    whenLow:
      'Protect your sleep, avoid overcommitting your energy, and build steady daily health routines.',
  },
  2: {
    house: 2,
    shortTitle: 'Savings, Income & Family',
    lifeAreas: 'Personal savings, earned income, speech, food habits, close family values',
    plainDescription:
      'How you accumulate financial security, speak with authority, and maintain family stability.',
    whenStrong:
      'Steady wealth retention, persuasive communication, and supportive family foundations come naturally.',
    whenLow:
      'Automate your savings, budget deliberately, and speak gently during tense family conversations.',
  },
  3: {
    house: 3,
    shortTitle: 'Courage, Skills & Communication',
    lifeAreas: 'Initiative, writing, media, sales, siblings, short travel, hands-on skills',
    plainDescription:
      'Your everyday courage, curiosity, communication style, and ability to turn ideas into action.',
    whenStrong:
      'Bold initiative, persuasive writing or speaking, and practical skill-building open doors fast.',
    whenLow:
      'Break big projects into small daily steps and finish one task before starting three new ones.',
  },
  4: {
    house: 4,
    shortTitle: 'Home, Peace & Property',
    lifeAreas: 'Emotional security, home environment, real estate, vehicles, mother, inner calm',
    plainDescription:
      'Your inner sense of peace, domestic happiness, living space, property, and emotional roots.',
    whenStrong:
      'Real estate, a peaceful sanctuary at home, and deep emotional grounding support your whole life.',
    whenLow:
      'Declutter your home space, prioritize emotional rest, and inspect property paperwork twice.',
  },
  5: {
    house: 5,
    shortTitle: 'Creativity, Romance & Wisdom',
    lifeAreas: 'Creative talent, children, romance, learning, joy, strategic judgment',
    plainDescription:
      'How you express creativity, experience joy and romance, mentor others, and make smart choices.',
    whenStrong:
      'Strong creative intuition, rewarding mentorship or parenting, and clear decision-making shine.',
    whenLow:
      'Avoid speculative gambles; favor steady index-style investing and structured creative practice.',
  },
  6: {
    house: 6,
    shortTitle: 'Daily Work, Wellness & Service',
    lifeAreas: 'Daily routines, health habits, problem-solving, service, handling competition',
    plainDescription:
      'Your work ethic, everyday wellness habits, discipline, and ability to solve hard problems.',
    whenStrong:
      'High stamina for problem-solving, competitive resilience, and strong recovery from setbacks.',
    whenLow:
      'Guard digestion and stress levels, avoid unnecessary workplace friction, and clear debts early.',
  },
  7: {
    house: 7,
    shortTitle: 'Marriage, Love & Partnerships',
    lifeAreas: 'Spouse, long-term commitment, business partners, client contracts, diplomacy',
    plainDescription:
      'How you build committed relationships, attract life or business partners, and negotiate fairly.',
    whenStrong:
      'Supportive partnerships, loyal clients, and harmonious marriage/alliances elevate your life.',
    whenLow:
      'Communicate expectations explicitly in love and contracts rather than assuming others know.',
  },
  8: {
    house: 8,
    shortTitle: 'Shared Finances, Research & Renewal',
    lifeAreas: 'Joint assets, taxes, inheritance, deep research, psychology, life transformations',
    plainDescription:
      'How you navigate major life transitions, manage shared money, and uncover hidden truths.',
    whenStrong:
      'Deep research ability, psychological insight, and resilience during sudden life pivots.',
    whenLow:
      'Keep emergency reserves liquid, read joint financial terms carefully, and avoid secrecy.',
  },
  9: {
    house: 9,
    shortTitle: 'Luck, Higher Learning & Purpose',
    lifeAreas: 'Long-term fortune, mentors, higher education, ethics, philosophy, global travel',
    plainDescription:
      'Your bigger life philosophy, mentors, long-distance journeys, higher study, and natural grace.',
    whenStrong:
      'Timely mentors, international opportunities, and strong moral compass guide you upward.',
    whenLow:
      'Seek experienced advisors, keep learning actively, and rely on preparation alongside luck.',
  },
  10: {
    house: 10,
    shortTitle: 'Career, Reputation & Leadership',
    lifeAreas: 'Profession, public standing, authority, career achievements, visible impact',
    plainDescription:
      'Your public career path, professional reputation, leadership style, and lasting contribution.',
    whenStrong:
      'Strong career momentum, leadership recognition, and visible professional trust accumulate.',
    whenLow:
      'Build undeniable competence step-by-step; let consistent delivery speak louder than titles.',
  },
  11: {
    house: 11,
    shortTitle: 'Income Gains, Network & Big Goals',
    lifeAreas: 'Business profits, bonuses, communities, influential friends, long-term wishes',
    plainDescription:
      'How your hard work converts into financial rewards, supportive networks, and fulfilled goals.',
    whenStrong:
      'Strong network effects, community support, and compounding financial gains reward your efforts.',
    whenLow:
      'Invest in 3–5 genuine relationships rather than wide shallow networking; track cashflow.',
  },
  12: {
    house: 12,
    shortTitle: 'Rest, Spirituality & Foreign Horizons',
    lifeAreas: 'Sleep, meditation, retreat, international links, charity, subconscious healing',
    plainDescription:
      'How you recharge in solitude, connect spiritually, work across borders, and release old baggage.',
    whenStrong:
      'Rich intuition, peaceful sleep, global/remote opportunities, and spiritual clarity flourish.',
    whenLow:
      'Plug quiet expense leaks, protect bedtime from screens, and schedule intentional rest days.',
  },
};

export const SIGN_PLAIN_TRAITS: Record<
  string,
  { coreVibe: string; risingStyle: string; sunDrive: string; moonHeart: string }
> = {
  Aries: {
    coreVibe: 'Bold, pioneering, direct, action-first',
    risingStyle: 'You meet life head-on with candor, courage, and fast initiative.',
    sunDrive: 'You thrive when leading new ventures, solving urgent challenges, and moving independently.',
    moonHeart: 'Emotionally honest and spirited—you process feelings best through movement and action.',
  },
  Taurus: {
    coreVibe: 'Steady, grounded, loyal, quality-focused',
    risingStyle: 'You project calm reliability, patience, and an eye for lasting quality.',
    sunDrive: 'You build enduring wealth, craft, and comfort step-by-step without rushing.',
    moonHeart: 'Deeply steady and affectionate—you feel safest with consistency, nature, and peace.',
  },
  Gemini: {
    coreVibe: 'Curious, articulate, adaptable, quick-minded',
    risingStyle: 'You come across as approachable, observant, witty, and mentally agile.',
    sunDrive: 'You excel at connecting ideas, learning rapidly, writing, teaching, and negotiating.',
    moonHeart: 'You process emotions by talking, reading, journaling, and understanding the "why".',
  },
  Cancer: {
    coreVibe: 'Protective, intuitive, nurturing, emotionally wise',
    risingStyle: 'You radiate warmth, sensitivity, and protective care for people you trust.',
    sunDrive: 'You are driven to create security, meaningful belonging, and a lasting home or legacy.',
    moonHeart: 'Extraordinarily intuitive and empathetic—your home environment directly shapes your energy.',
  },
  Leo: {
    coreVibe: 'Warm-hearted, creative, dignified, inspiring',
    risingStyle: 'You carry natural presence, warmth, loyalty, and creative self-assurance.',
    sunDrive: 'You shine when given room to lead generously, create boldly, and inspire others.',
    moonHeart: 'Big-hearted and loyal—you need genuine appreciation, creative joy, and mutual respect.',
  },
  Virgo: {
    coreVibe: 'Thoughtful, precise, practical, service-minded',
    risingStyle: 'You appear observant, composed, capable, and attentive to details others miss.',
    sunDrive: 'You find purpose in mastery, refinement, problem-solving, wellness, and useful systems.',
    moonHeart: 'You feel calmest when life is organized, purposeful, and practically supportive.',
  },
  Libra: {
    coreVibe: 'Diplomatic, fair-minded, refined, relationship-oriented',
    risingStyle: 'You bring grace, fairness, aesthetic sense, and calm diplomacy into every room.',
    sunDrive: 'You excel at collaboration, design, strategy, justice, and bringing people into agreement.',
    moonHeart: 'Harmony matters deeply to you—harsh conflict drains you, while balanced partnership restores you.',
  },
  Scorpio: {
    coreVibe: 'Deep, focused, resilient, perceptive',
    risingStyle: 'You carry quiet intensity, strong boundaries, and X-ray perception of people’s motives.',
    sunDrive: 'You thrive in high-trust, high-depth work—research, strategy, finance, healing, or transformation.',
    moonHeart: 'You feel everything deeply and value absolute loyalty, privacy, and emotional honesty.',
  },
  Sagittarius: {
    coreVibe: 'Optimistic, visionary, principled, big-picture',
    risingStyle: 'You project open-minded enthusiasm, honesty, humor, and forward-looking vision.',
    sunDrive: 'You are energized by growth, wisdom, teaching, entrepreneurship, and exploring wide horizons.',
    moonHeart: 'Your spirit needs freedom, meaning, learning, and an inspiring vision for the future.',
  },
  Capricorn: {
    coreVibe: 'Disciplined, strategic, dependable, long-term builder',
    risingStyle: 'You come across as mature, capable, self-reliant, and quietly authoritative.',
    sunDrive: 'You play the long game—building institutions, mastery, and respected achievements over time.',
    moonHeart: 'You show care through reliability and action; earning self-respect brings you inner peace.',
  },
  Aquarius: {
    coreVibe: 'Independent, inventive, humanitarian, future-focused',
    risingStyle: 'You appear original, objective, friendly, and unafraid to think differently from the crowd.',
    sunDrive: 'You excel in systems thinking, technology, reform, community networks, and innovation.',
    moonHeart: 'You need mental breathing room, intellectual friendship, and a cause larger than yourself.',
  },
  Pisces: {
    coreVibe: 'Compassionate, imaginative, spiritually receptive, artistic',
    risingStyle: 'You carry gentle empathy, creative imagination, and receptive intuition.',
    sunDrive: 'You thrive when blending imagination, healing, spirituality, art, or compassionate service.',
    moonHeart: 'Deeply sensitive and soulful—quiet solitude, music, water, and rest recharge your spirit.',
  },
};

export const DASHA_PLAIN_GUIDE: Record<
  string,
  {
    chapterTitle: string;
    plainMeaning: string;
    bestFocus: string;
    watchOutFor: string;
  }
> = {
  Sun: {
    chapterTitle: 'Stepping Into Visibility & Leadership',
    plainMeaning:
      'A 6-year chapter focused on confidence, career authority, self-respect, health vitality, and taking ownership of your direction.',
    bestFocus: 'Step forward into leadership, clarify your core purpose, and strengthen heart/bone vitality.',
    watchOutFor: 'Burnout from doing everything alone, or clashes with authority figures out of pride.',
  },
  Moon: {
    chapterTitle: 'Emotional Renewal, Home & Connection',
    plainMeaning:
      'A 10-year chapter highlighting inner peace, family life, home/property, public goodwill, and intuitive creativity.',
    bestFocus: 'Nurture your home base, deepen close relationships, trust your intuition, and care for sleep/hydration.',
    watchOutFor: 'Mood swings, overthinking, or Absorbing other people’s emotional stress.',
  },
  Mars: {
    chapterTitle: 'Action, Courage, Property & Execution',
    plainMeaning:
      'A high-energy 7-year chapter of decisive action, technical building, physical fitness, real estate, and bold initiative.',
    bestFocus: 'Execute ambitious projects, exercise regularly, clear lingering tasks, and defend healthy boundaries.',
    watchOutFor: 'Impatience, rushed decisions, heated arguments, or avoidable physical strain.',
  },
  Mercury: {
    chapterTitle: 'Learning, Business, Writing & Smart Strategy',
    plainMeaning:
      'A dynamic 17-year chapter favoring communication, commerce, software/analytics, education, networking, and skill mastery.',
    bestFocus: 'Upgrade skills, publish or negotiate, diversify income streams, and build smart systems.',
    watchOutFor: 'Mental scatter, analysis paralysis, or saying yes to too many side projects at once.',
  },
  Jupiter: {
    chapterTitle: 'Growth, Wisdom, Prosperity & Blessing',
    plainMeaning:
      'An expansive 16-year chapter supporting long-term wealth, mentors, marriage/family milestones, higher study, and ethical leadership.',
    bestFocus: 'Invest in long-term growth, teach or mentor, formalize commitments, and expand your horizon.',
    watchOutFor: 'Complacency, over-optimistic spending, or assuming things will work out without structure.',
  },
  Venus: {
    chapterTitle: 'Relationships, Comfort, Artistry & Harmony',
    plainMeaning:
      'A 20-year chapter centered on love, marriage, creative beauty, financial comfort, diplomacy, and enjoying the fruits of effort.',
    bestFocus: 'Cultivate loving partnerships, refine creative or design craft, and build sustainable wealth.',
    watchOutFor: 'Over-indulgence, people-pleasing at the cost of truth, or delaying hard conversations.',
  },
  Saturn: {
    chapterTitle: 'Deep Mastery, Discipline & Lasting Foundations',
    plainMeaning:
      'A 19-year chapter that rewards patience, integrity, hard work, and long-term structure—turning steady effort into unshakable results.',
    bestFocus: 'Commit to long-term craft, honor commitments, simplify routines, and build durable assets.',
    watchOutFor: 'Pessimism, chronic overwork without rest, or resisting necessary responsibility.',
  },
  Rahu: {
    chapterTitle: 'Ambitious Breakthroughs, Innovation & New Frontiers',
    plainMeaning:
      'An 18-year chapter of rapid growth, unconventional paths, modern technology, foreign/cross-cultural links, and bold reinvention.',
    bestFocus: 'Embrace modern tools, innovate boldly, expand globally, and stay grounded in honest ethics.',
    watchOutFor: 'Restlessness, chasing shortcuts or hype, sleep disruption, or anxiety about the future.',
  },
  Ketu: {
    chapterTitle: 'Inner Clarity, Spiritual Depth & Simplification',
    plainMeaning:
      'A 7-year chapter of cutting away what no longer fits, deepening spiritual or research insight, and relying on quiet mastery.',
    bestFocus: 'Simplify life, focus on deep specialized expertise, meditate, and release outdated attachments.',
    watchOutFor: 'Sudden detachment without a plan, isolation, or doubting your practical value.',
  },
};

export const PLANET_PLAIN_ROLES: Record<string, string> = {
  Sun: 'Core confidence, vitality, career authority & life purpose',
  Moon: 'Emotional peace, intuition, daily mindset & home comfort',
  Mars: 'Drive, courage, physical energy, property & decisive action',
  Mercury: 'Thinking style, speech, business acumen & learning speed',
  Jupiter: 'Wisdom, growth, good fortune, mentors & financial expansion',
  Venus: 'Love, marriage, harmony, artistic taste & material comfort',
  Saturn: 'Discipline, patience, career longevity & life lessons',
  Rahu: 'Ambitious growth, innovation, modern tech & bold leaps',
  Ketu: 'Spiritual intuition, detachment, research & past mastery',
  Uranus: 'Originality, breakthroughs & sudden awakenings',
  Neptune: 'Imagination, empathy, dreams & spiritual sensitivity',
  Pluto: 'Deep regeneration, resilience & transformational power',
};

export interface PlainEnglishPersonalSummary {
  greetingHeadline: string;
  bigThreeParagraph: string;
  birthStarParagraph: string;
  currentChapterTitle: string;
  currentChapterParagraph: string;
  strengthsParagraph: string;
  careAreaParagraph: string;
  todayGuidanceParagraph: string;
  quickBulletTakeaways: { label: string; text: string }[];
}

export function buildPlainEnglishPersonalSummary(
  profile: BirthProfile,
  natalChart: NatalChartResult,
  vedicReport: VedicReport,
  panchangReport: PanchangReport,
  numerologyReport: NumerologyReport,
  synthesisReport: CosmicSynthesisReport
): PlainEnglishPersonalSummary {
  const ascSign = natalChart.ascendant.signName;
  const sun = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moon = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const birthNak = getNakshatraTreatiseByIndex(moon.nakshatraIndex);

  const ascTraits = SIGN_PLAIN_TRAITS[ascSign] || SIGN_PLAIN_TRAITS.Aries;
  const sunTraits = SIGN_PLAIN_TRAITS[sun.signName] || SIGN_PLAIN_TRAITS.Aries;
  const moonTraits = SIGN_PLAIN_TRAITS[moon.signName] || SIGN_PLAIN_TRAITS.Aries;

  const mahaLord = vedicReport.activeMahadasha.lord;
  const antarLord = vedicReport.activeAntardasha.lord;
  const mahaGuide = DASHA_PLAIN_GUIDE[mahaLord] || DASHA_PLAIN_GUIDE.Jupiter;
  const antarGuide = DASHA_PLAIN_GUIDE[antarLord] || DASHA_PLAIN_GUIDE.Mercury;

  const sortedHouses = [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus);
  const top1 = sortedHouses[0];
  const top2 = sortedHouses[1];
  const lowest = sortedHouses[sortedHouses.length - 1];

  const top1Guide = HOUSE_PLAIN_GUIDE[top1.house];
  const top2Guide = HOUSE_PLAIN_GUIDE[top2.house];
  const lowGuide = HOUSE_PLAIN_GUIDE[lowest.house];

  const rahuSlot = panchangReport.muhurats.find((m) => m.name.toLowerCase().includes('rahu'));

  const greetingHeadline = `${profile.firstName} ${profile.lastName}’s Personal Reading in Plain English`;

  const bigThreeParagraph = `You were born with ${ascSign} Rising (Ascendant), your Sun in ${sun.signName} (${HOUSE_PLAIN_GUIDE[sun.house]?.shortTitle || `House ${sun.house}`}), and your Moon in ${moon.signName} (${HOUSE_PLAIN_GUIDE[moon.house]?.shortTitle || `House ${moon.house}`}). In everyday life: ${ascTraits.risingStyle} ${sunTraits.sunDrive} ${moonTraits.moonHeart}`;

  const birthStarParagraph = `Your Vedic Birth Star (Janma Nakshatra) is ${birthNak.name}, Quarter (Pada) ${moon.nakshatraPada}, ruled by ${birthNak.ruler} and symbolized by the ${birthNak.symbol}. Its core gift is "${birthNak.shaktiTranslation}" — giving you natural strength in ${birthNak.vocations.slice(0, 3).join(', ')}. Your main blind spot to watch is: ${birthNak.shadowTrap}`;

  const currentChapterTitle = `${mahaLord} Major Chapter (${mahaGuide.chapterTitle}) with ${antarLord} Sub-Chapter`;

  const currentChapterParagraph = `Right now, you are ${vedicReport.activeMahadasha.progressPercent}% through your ${vedicReport.activeMahadasha.years}-year ${mahaLord} life chapter (active until ${vedicReport.activeMahadasha.endDate}), paired with a focused ${antarLord} sub-period (until ${vedicReport.activeAntardasha.endDate}) and Numerology Personal Year ${numerologyReport.personalYear.final}. ${mahaGuide.plainMeaning} Best focus now: ${mahaGuide.bestFocus} Meanwhile, your ${antarLord} sub-chapter adds emphasis on: ${antarGuide.bestFocus.toLowerCase()}`;

  const strengthsParagraph = `Your strongest natural life areas are House ${top1.house} (${top1Guide.shortTitle} — ${top1.bindus} strength points vs. 28 average) and House ${top2.house} (${top2Guide.shortTitle} — ${top2.bindus} points). ${top1Guide.whenStrong} ${top2Guide.whenStrong}`;

  const careAreaParagraph = `The life area asking for the most patience and deliberate structure is House ${lowest.house} (${lowGuide.shortTitle} — ${lowest.bindus} points). This is not "bad luck"—it simply means results here come from steady habits rather than shortcuts: ${lowGuide.whenLow}`;

  const todayGuidanceParagraph = `For ${profile.location.name} today (${panchangReport.vara.name}, ${panchangReport.tithi.name}, Moon in ${panchangReport.nakshatra.name}): your personal star harmony (Tarabala) is ${panchangReport.personalTarabala.isAuspicious ? 'supportive for constructive steps' : 'mixed—pace major commitments carefully'}. Your best window today is ${synthesisReport.bestWindowToday}${rahuSlot ? `, while ${rahuSlot.startTime}–${rahuSlot.endTime} (Rahu Kaal) is best reserved for routine work rather than brand-new launches` : ''}.`;

  const quickBulletTakeaways = [
    {
      label: 'Core Identity',
      text: `${ascSign} Rising • ${sun.signName} Sun • ${moon.signName} Moon (${birthNak.name} Star, Pada ${moon.nakshatraPada})`,
    },
    {
      label: 'Current Life Chapter',
      text: `${mahaLord}–${antarLord} Period (until ${vedicReport.activeAntardasha.endDate}) — ${mahaGuide.chapterTitle}`,
    },
    {
      label: 'Biggest Natural Advantage',
      text: `House ${top1.house}: ${top1Guide.shortTitle} (${top1.bindus} pts — well above the 28-pt average)`,
    },
    {
      label: 'Life Path & Yearly Cycle',
      text: `Life Path #${numerologyReport.lifePath.final} (${numerologyReport.lifePath.meaning.split('.')[0]}) • Personal Year ${numerologyReport.personalYear.final}`,
    },
    {
      label: 'Best Window Today',
      text: `${synthesisReport.bestWindowToday}${rahuSlot ? ` • Avoid major starts ${rahuSlot.startTime}–${rahuSlot.endTime}` : ''}`,
    },
  ];

  return {
    greetingHeadline,
    bigThreeParagraph,
    birthStarParagraph,
    currentChapterTitle,
    currentChapterParagraph,
    strengthsParagraph,
    careAreaParagraph,
    todayGuidanceParagraph,
    quickBulletTakeaways,
  };
}
