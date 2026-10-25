import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';
import { NatalChartResult } from './astronomyEngine';
import { DivisionalChartEntry, VedicReport } from './vedicEngine';
import { PanchangReport } from './panchangEngine';
import { NumerologyReport } from './numerologyEngine';
import { CosmicSynthesisReport } from './synthesisEngine';
import { cleanCityName, formatCoordPair, gregorianToBikramSambat } from './locationAtlas';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import { PLANET_TREATISES } from '../data/classicalCompendium';
import {
  BEHAVIORAL_KARMA_VIPAKA,
  evaluateActionConsequence,
  LIFE_ACTIONS,
  scanUpcomingBestWindows,
} from '../data/karmaAndMuhurtaCodex';
import {
  buildPlainEnglishPersonalSummary,
  DASHA_PLAIN_GUIDE,
  HOUSE_PLAIN_GUIDE,
} from '../data/plainEnglishGuide';
import { generateDeepLifeReport } from './deepLifeReportEngine';

export interface PdfReportBundleInput {
  profile: BirthProfile;
  natalChart: NatalChartResult;
  vedicReport: VedicReport;
  panchangReport: PanchangReport;
  numerologyReport: NumerologyReport;
  synthesisReport: CosmicSynthesisReport;
  ayanamsha: AyanamshaMode;
  houseSystem: HouseSystem;
}

/**
 * Normalizes Unicode punctuation & strips non-Latin-1 scripts so standard PDF
 * Helvetica/Times fonts render 100% crisp text with zero garbled glyphs.
 */
export function cleanPdfText(raw: string | number | undefined | null): string {
  if (raw === undefined || raw === null) return '';
  return String(raw)
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\u2022/g, '|')
    .replace(/\u2192/g, '->')
    .replace(/\u2194/g, '<->')
    .replace(/\u2026/g, '...')
    .replace(/\u2212/g, '-')
    .replace(/\u00A0/g, ' ')
    // Strip parenthetical non-Latin scripts like "(बैशाख)" while keeping English
    .replace(/\(\s*[^\x00-\xFF]+\s*\)/g, '')
    // Replace any remaining >255 codepoints cleanly
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const PLANET_SHORT: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
  Uranus: 'Ur',
  Neptune: 'Ne',
  Pluto: 'Pl',
};

const NORTH_KUNDLI_COORDS = [
  { house: 1, signX: 200, signY: 166, planetsX: 200, planetsY: 102 },
  { house: 2, signX: 100, signY: 76, planetsX: 100, planetsY: 38 },
  { house: 3, signX: 82, signY: 96, planetsX: 34, planetsY: 112 },
  { house: 4, signX: 164, signY: 200, planetsX: 102, planetsY: 200 },
  { house: 5, signX: 82, signY: 292, planetsX: 34, planetsY: 308 },
  { house: 6, signX: 100, signY: 324, planetsX: 100, planetsY: 364 },
  { house: 7, signX: 200, signY: 234, planetsX: 200, planetsY: 298 },
  { house: 8, signX: 300, signY: 324, planetsX: 300, planetsY: 364 },
  { house: 9, signX: 318, signY: 292, planetsX: 364, planetsY: 308 },
  { house: 10, signX: 236, signY: 200, planetsX: 298, planetsY: 200 },
  { house: 11, signX: 318, signY: 96, planetsX: 364, planetsY: 112 },
  { house: 12, signX: 300, signY: 76, planetsX: 300, planetsY: 38 },
];

export async function generateDetailedPdfBytes(input: PdfReportBundleInput): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const {
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    synthesisReport,
    ayanamsha,
    houseSystem,
  } = input;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageW = 210;
  const marginX = 14;
  const contentW = pageW - marginX * 2; // 182mm
  const topY = 18;
  const bottomLimitY = 279;

  let y = topY;

  const fullName = cleanPdfText(
    [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')
  );
  const bsBirth = gregorianToBikramSambat(profile.year, profile.month, profile.day);
  const plainSummary = buildPlainEnglishPersonalSummary(
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    synthesisReport
  );
  const deepReport = generateDeepLifeReport(
    profile,
    natalChart,
    vedicReport,
    panchangReport,
    numerologyReport,
    synthesisReport,
    'en'
  );

  const sunPlanet = natalChart.planets.find((p) => p.id === 'Sun') || natalChart.planets[0];
  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const birthNakTreatise = getNakshatraTreatiseByIndex(moonPlanet.nakshatraIndex);

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimitY) {
      doc.addPage();
      y = topY + 4;
    }
  };

  const drawSectionHeader = (numLabel: string, title: string, subtitle: string) => {
    ensureSpace(24);
    y += 3;
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.setDrawColor(199, 210, 254); // Indigo-200
    doc.roundedRect(marginX, y, contentW, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(cleanPdfText(numLabel.toUpperCase()), marginX + 4, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.6);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(cleanPdfText(title), marginX + 4, y + 10.8);

    y += 17;
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(cleanPdfText(subtitle), contentW);
      doc.text(lines, marginX, y);
      y += lines.length * 4.3 + 2.5;
    }
  };

  const drawParagraphBlock = (
    heading: string,
    body: string,
    accentBar = true,
    accentRgb: [number, number, number] = [79, 70, 229]
  ) => {
    const cleanHead = cleanPdfText(heading);
    const cleanBody = cleanPdfText(body);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const wrappedHead = doc.splitTextToSize(cleanHead, contentW - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const wrappedBody = doc.splitTextToSize(cleanBody, contentW - 10);

    const headH = wrappedHead.length * 4.7;
    const bodyH = wrappedBody.length * 4.4;
    const boxH = 5.2 + headH + 1.6 + bodyH + 3.4;

    ensureSpace(boxH + 3);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y, contentW, boxH, 1.8, 1.8, 'FD');

    if (accentBar) {
      doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.rect(marginX, y, 1.6, boxH, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedHead, marginX + 4.8, y + 5.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedBody, marginX + 4.8, y + 5.6 + headH + 1.3);

    y += boxH + 3;
  };

  const drawCitationNote = (citation: string) => {
    const cleanCite = cleanPdfText(`Classical & Scholarly Sources: ${citation}`);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.2);
    const lines = doc.splitTextToSize(cleanCite, contentW - 4);
    ensureSpace(lines.length * 3.8 + 3);
    doc.setTextColor(100, 116, 139);
    doc.text(lines, marginX + 2, y + 3);
    y += lines.length * 3.8 + 2.5;
  };

  const drawNorthIndianKundli = (
    x0: number,
    y0: number,
    sizeMm: number,
    divTable: DivisionalChartEntry[],
    vargaKey: 'd1Sign' | 'd9Sign',
    chartTitle: string,
    chartSub: string
  ) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanPdfText(chartTitle), x0, y0 - 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(100, 116, 139);
    doc.text(cleanPdfText(chartSub), x0, y0 - 1.5);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.45);
    doc.rect(x0, y0, sizeMm, sizeMm, 'FD');

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(x0, y0, x0 + sizeMm, y0 + sizeMm);
    doc.line(x0 + sizeMm, y0, x0, y0 + sizeMm);

    const mid = sizeMm / 2;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.38);
    doc.line(x0 + mid, y0, x0 + sizeMm, y0 + mid);
    doc.line(x0 + sizeMm, y0 + mid, x0 + mid, y0 + sizeMm);
    doc.line(x0 + mid, y0 + sizeMm, x0, y0 + mid);
    doc.line(x0, y0 + mid, x0 + mid, y0);

    const ascEntry = divTable.find((e) => e.planetId === 'Asc') || divTable[0];
    const ascSignIdx = ascEntry ? ascEntry[vargaKey] : 0;

    for (const hPos of NORTH_KUNDLI_COORDS) {
      const houseSignIdx = (ascSignIdx + hPos.house - 1) % 12;
      const signNumStr = String(houseSignIdx + 1);
      const sx = x0 + (hPos.signX / 400) * sizeMm;
      const sy = y0 + (hPos.signY / 400) * sizeMm;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229);
      doc.text(signNumStr, sx, sy, { align: 'center' });

      const occupants = divTable.filter(
        (p) => p.planetId !== 'Asc' && p[vargaKey] === houseSignIdx
      );
      if (occupants.length > 0) {
        const px = x0 + (hPos.planetsX / 400) * sizeMm;
        const py = y0 + (hPos.planetsY / 400) * sizeMm;
        const labels = occupants.map((o) => PLANET_SHORT[o.planetId] || o.planetName.slice(0, 2));
        const line1 = labels.slice(0, 3).join(' ');
        const line2 = labels.slice(3).join(' ');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.setTextColor(15, 23, 42);
        if (line2) {
          doc.text(line1, px, py - 1.5, { align: 'center' });
          doc.text(line2, px, py + 2.2, { align: 'center' });
        } else {
          doc.text(line1, px, py + 0.8, { align: 'center' });
        }
      }
    }
  };

  // ==================== PAGE 1: COVER, SNAPSHOT & 5-DOMAIN LIFE SCORECARD ====================
  doc.setFillColor(15, 23, 42); // Slate-900 Header Banner
  doc.roundedRect(marginX, 12, contentW, 38, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(165, 180, 252); // Indigo-300
  doc.text(
    'OCEANOLOGY | PERSONAL LIFE DOSSIER, VEDIC KUNDALI & NUMEROLOGY EDITION',
    marginX + 6,
    20
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19.5);
  doc.setTextColor(255, 255, 255);
  doc.text(fullName || 'Personal Horoscope Dossier', marginX + 6, 30.5);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const tzSign = profile.location.timezoneOffsetHours >= 0 ? '+' : '-';
  const tzAbs = Math.abs(profile.location.timezoneOffsetHours);
  const tzStr = `UTC${tzSign}${pad2(Math.floor(tzAbs))}:${pad2(Math.round((tzAbs % 1) * 60))}`;
  const birthLine1 = cleanPdfText(
    `Born: ${profile.year}-${pad2(profile.month)}-${pad2(profile.day)} at ${
      profile.unknownTime
        ? 'Solar Noon (Unknown Exact Birth Time)'
        : `${pad2(profile.hour)}:${pad2(profile.minute)}:${pad2(profile.second)}`
    } (${tzStr})  |  Nepali Date: ${bsBirth.formattedEn}  |  Age: ${deepReport.currentAge}`
  );
  const birthLine2 = cleanPdfText(
    `Birthplace: ${cleanCityName(profile.location.name)}, ${profile.location.country} (${formatCoordPair(
      profile.location.latitude,
      profile.location.longitude,
      true
    )})  |  Zodiac: ${ayanamsha}  |  Houses: ${houseSystem}`
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(birthLine1, marginX + 6, 38.5);
  doc.text(birthLine2, marginX + 6, 44.2);

  y = 55;

  // 6-Card Executive Snapshot Grid (2 rows x 3 cols)
  const topSav = [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0];
  const snapshotCards = [
    {
      label: 'RISING SIGN (ASCENDANT)',
      value: `${natalChart.ascendant.signName} (${natalChart.ascendant.formattedDMS})`,
      sub: `Public Image (AL): ${deepReport.identityAndSoul.arudhaLagnaSign}`,
    },
    {
      label: 'SUN & MOON SIGNS',
      value: `${sunPlanet.signName} Sun / ${moonPlanet.signName} Moon`,
      sub: `Soul Planet (AK): ${deepReport.identityAndSoul.atmakarakaPlanet}`,
    },
    {
      label: 'VEDIC BIRTH STAR',
      value: `${moonPlanet.nakshatraName} (Pada ${moonPlanet.nakshatraPada})`,
      sub: `Ruled by ${moonPlanet.nakshatraLord} | ${birthNakTreatise.deity}`,
    },
    {
      label: 'CURRENT LIFE CHAPTER',
      value: `${vedicReport.activeMahadasha.lord} - ${vedicReport.activeAntardasha.lord}`,
      sub: `Active until ${vedicReport.activeAntardasha.endDate}`,
    },
    {
      label: 'WEALTH & STRONGEST HOUSE',
      value: `Indu: ${deepReport.wealthBlueprint.induLagnaSign} | H${topSav.house} (${topSav.bindus}pt)`,
      sub: HOUSE_PLAIN_GUIDE[topSav.house]?.shortTitle || topSav.signName,
    },
    {
      label: 'LIFE PATH & ALIGNMENT',
      value: `Life Path #${numerologyReport.lifePath.final}  |  ${synthesisReport.overallResonanceScore}/100`,
      sub: `Personal Year ${numerologyReport.personalYear.final} (${numerologyReport.system})`,
    },
  ];

  const cardGap = 4;
  const cardW = (contentW - cardGap * 2) / 3;
  const cardH = 20;

  snapshotCards.forEach((c, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = marginX + col * (cardW + cardGap);
    const cy = y + row * (cardH + 3);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text(cleanPdfText(c.label), cx + 3, cy + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const valClipped = doc.splitTextToSize(cleanPdfText(c.value), cardW - 5.5)[0] || '';
    doc.text(valClipped, cx + 3, cy + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(100, 116, 139);
    const subClipped = doc.splitTextToSize(cleanPdfText(c.sub), cardW - 5.5)[0] || '';
    doc.text(subClipped, cx + 3, cy + 16.5);
  });

  y += cardH * 2 + 8;

  // 5-Domain Life Blueprint Scorecard Strip
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(15, 23, 42);
  doc.text('5-DOMAIN LIFE BLUEPRINT SCORECARD (CAREER, WEALTH, LOVE, VITALITY, WISDOM)', marginX, y + 3.5);
  y += 5.5;

  const scGap = 2.5;
  const scW = (contentW - scGap * 4) / 5;
  const scH = 23;
  deepReport.domainScorecard.forEach((sc, idx) => {
    const sx = marginX + idx * (scW + scGap);
    const isOpt = sc.tone === 'optimal';
    const isFav = sc.tone === 'favorable';

    doc.setFillColor(isOpt ? 236 : isFav ? 238 : 254, isOpt ? 253 : isFav ? 242 : 252, isOpt ? 245 : isFav ? 255 : 232);
    doc.setDrawColor(isOpt ? 167 : isFav ? 199 : 253, isOpt ? 243 : isFav ? 210 : 230, isOpt ? 208 : isFav ? 254 : 138);
    doc.roundedRect(sx, y, scW, scH, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    const shortTitle = doc.splitTextToSize(cleanPdfText(sc.title.toUpperCase()), scW - 4)[0] || sc.id;
    doc.text(shortTitle, sx + 2.2, y + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    if (isOpt) doc.setTextColor(5, 150, 105);
    else if (isFav) doc.setTextColor(79, 70, 229);
    else doc.setTextColor(180, 83, 9);
    doc.text(`${sc.score}/100`, sx + 2.2, y + 12.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const vClip = doc.splitTextToSize(cleanPdfText(sc.verdictLabel), scW - 4)[0] || '';
    doc.text(vClip, sx + 2.2, y + 17.2);

    // Mini progress bar
    const barW = scW - 4.4;
    doc.setFillColor(226, 232, 240);
    doc.rect(sx + 2.2, y + 19.2, barW, 1.8, 'F');
    if (isOpt) doc.setFillColor(5, 150, 105);
    else if (isFav) doc.setFillColor(79, 70, 229);
    else doc.setFillColor(217, 119, 6);
    doc.rect(sx + 2.2, y + 19.2, barW * (sc.score / 100), 1.8, 'F');
  });

  y += scH + 5;

  if (deepReport.unknownBirthTimeNote) {
    drawParagraphBlock(
      'Note on Solar-Noon Birth Time Safeguard',
      deepReport.unknownBirthTimeNote,
      true,
      [217, 119, 6]
    );
  }

  // Quick Key Takeaways Box on Page 1
  const takeawayLines: { label: string; wrapped: string[] }[] = plainSummary.quickBulletTakeaways.map(
    (b) => ({
      label: cleanPdfText(b.label),
      wrapped: doc.splitTextToSize(cleanPdfText(b.text), contentW - 56),
    })
  );
  const takeawayH =
    10.5 + takeawayLines.reduce((acc, item) => acc + Math.max(1, item.wrapped.length) * 4.3 + 1.6, 0);
  ensureSpace(takeawayH + 4);
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(marginX, y, contentW, takeawayH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70);
  doc.text('AT A GLANCE: YOUR 5 MOST IMPORTANT TAKEAWAYS', marginX + 4.5, y + 6.2);

  let ty = y + 11.6;
  for (const item of takeawayLines) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.label}:`, marginX + 4.5, ty);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    doc.text(item.wrapped, marginX + 52, ty);
    ty += Math.max(1, item.wrapped.length) * 4.3 + 1.6;
  }

  y += takeawayH + 5;

  // ==================== SECTION 1 OF 10: PLAIN-ENGLISH READING, PUBLIC IMAGE & SOUL PURPOSE ====================
  drawSectionHeader(
    'Section 1 of 10',
    'Executive Personal Reading, Public Image (Arudha) & Soul Purpose',
    'Everyday zero-jargon guidance paired with your Jaimini Arudha Lagna (how the world perceives you), Atmakaraka soul compass, and Rahu-Ketu growth axis.'
  );

  drawParagraphBlock('1. Your Core Personality (Rising, Sun & Moon)', plainSummary.bigThreeParagraph);
  drawParagraphBlock('2. Your Vedic Birth Star Gift & Blind Spot', plainSummary.birthStarParagraph);
  drawParagraphBlock(
    `3. Current Life Chapter: ${plainSummary.currentChapterTitle}`,
    plainSummary.currentChapterParagraph
  );
  drawParagraphBlock('4. Where Life Flows Best vs. Where Patience Pays Off', `${plainSummary.strengthsParagraph} ${plainSummary.careAreaParagraph}`);
  drawParagraphBlock(
    `5. Inner Truth vs. Public Image (Arudha Lagna in ${deepReport.identityAndSoul.arudhaLagnaSign})`,
    deepReport.identityAndSoul.innerVsOuterNarrative
  );
  drawParagraphBlock(
    `6. Soul Compass: ${deepReport.identityAndSoul.atmakarakaPlanet} as Atmakaraka (${deepReport.identityAndSoul.atmakarakaTitle})`,
    deepReport.identityAndSoul.atmakarakaNarrative
  );
  drawParagraphBlock(
    `7. Karmic Comfort Zone vs. Growth Edge (Ketu H${deepReport.identityAndSoul.ketuHouse} -> Rahu H${deepReport.identityAndSoul.rahuHouse})`,
    `Past Instinct & Natural Gift (Ketu): ${deepReport.identityAndSoul.ketuComfortGift}   |   Lifetime Growth Edge (Rahu): ${deepReport.identityAndSoul.rahuGrowthEdge}   |   Degree Symbols: Ascendant "${deepReport.identityAndSoul.ascendantSabian}"; Sun "${deepReport.identityAndSoul.sunSabian}".`
  );
  drawCitationNote(deepReport.identityAndSoul.sourceCitation);

  // ==================== SECTION 2 OF 10: CAREER, CALLING & D10 DASHAMSHA BLUEPRINT ====================
  drawSectionHeader(
    'Section 2 of 10',
    'Career, Calling & D10 Dashamsha Professional Blueprint',
    'Synthesizes your 10th House Lord placement (BPHS Ch. 24), D10 Dashamsha Directional Guardian (Dikpala), Jaimini Amatyakaraka, and KP 10th Cusp Sub-Lord.'
  );

  drawParagraphBlock(
    `${deepReport.careerBlueprint.headline}  [${deepReport.careerBlueprint.workStyleMode}]`,
    deepReport.careerBlueprint.laymanNarrative
  );
  drawParagraphBlock(
    `D10 Dashamsha Directional Guardian (Dikpala: ${deepReport.careerBlueprint.dikpalaDeity} - ${deepReport.careerBlueprint.dikpalaDirection})`,
    `${deepReport.careerBlueprint.dikpalaArchetype}: ${deepReport.careerBlueprint.dikpalaStyle}`
  );
  drawParagraphBlock(
    `Career Minister (Amatyakaraka: ${deepReport.careerBlueprint.amatyakarakaPlanet}) & KP 10th Cusp Sub-Lord (${deepReport.careerBlueprint.kpCusp10SubLord})`,
    `${deepReport.careerBlueprint.amatyakarakaNote}   |   ${deepReport.careerBlueprint.kpCareerNote}`
  );
  drawParagraphBlock(
    'High-Fit Career Lanes & Practical Career Rule',
    `Recommended Professional Lanes: ${deepReport.careerBlueprint.recommendedLanes.join('  |  ')}.   Actionable Career Habit: ${deepReport.careerBlueprint.careerActionTip}`,
    true,
    [5, 150, 105]
  );
  drawCitationNote(deepReport.careerBlueprint.sourceCitation);

  // ==================== SECTION 3 OF 10: WEALTH ARCHITECTURE, INDU LAGNA & D2 HORA ====================
  drawSectionHeader(
    'Section 3 of 10',
    'Wealth Architecture, Kalidasa Indu Lagna & D2 Hora Strategy',
    'Evaluates how money arrives, whether you earn best via solo enterprise or collaborative trust (D2 Hora), and how to retain surplus (H2 vs. H11 vs. H12).'
  );

  drawParagraphBlock(
    `Wealth Ascendant (Indu Lagna): ${deepReport.wealthBlueprint.induLagnaSign} (House ${deepReport.wealthBlueprint.induHouseFromLagna}) - ${deepReport.wealthBlueprint.induStrengthTier}`,
    `${deepReport.wealthBlueprint.induNarrative}  [Kalas Calculation: ${deepReport.wealthBlueprint.induKalasTrail}]`
  );

  // Visual D2 Hora Split Bar in PDF
  ensureSpace(22);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, contentW, 18, 1.8, 1.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    cleanPdfText(`D2 Hora Wealth Split: ${deepReport.wealthBlueprint.horaEarningStyleTitle}`),
    marginX + 4,
    y + 5.2
  );

  const horaBarX = marginX + 4;
  const horaBarW = contentW - 8;
  const suryaW = Math.max(8, horaBarW * (deepReport.wealthBlueprint.suryaHoraPercent / 100));
  doc.setFillColor(217, 119, 6); // Amber for Surya Hora
  doc.rect(horaBarX, y + 7.5, suryaW, 4.5, 'F');
  doc.setFillColor(79, 70, 229); // Indigo for Chandra Hora
  doc.rect(horaBarX + suryaW, y + 7.5, Math.max(4, horaBarW - suryaW), 4.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(180, 83, 9);
  doc.text(
    `Solar / Self-Built Hora: ${deepReport.wealthBlueprint.suryaHoraPercent}%`,
    horaBarX,
    y + 15.8
  );
  doc.setTextColor(67, 56, 202);
  doc.text(
    `Lunar / Collaborative Hora: ${deepReport.wealthBlueprint.chandraHoraPercent}%`,
    horaBarX + horaBarW,
    y + 15.8,
    { align: 'right' }
  );
  y += 21;

  drawParagraphBlock('D2 Hora Earning Mechanics', deepReport.wealthBlueprint.horaEarningNarrative);
  drawParagraphBlock(
    `Cashflow vs. Savings Retention (H2 Savings: ${deepReport.wealthBlueprint.savingsBindusH2} pts | H11 Gains: ${deepReport.wealthBlueprint.gainsBindusH11} pts | H12 Outflow: ${deepReport.wealthBlueprint.expenseBindusH12} pts)`,
    deepReport.wealthBlueprint.cashflowVsRetentionAdvice,
    true,
    [5, 150, 105]
  );
  drawCitationNote(deepReport.wealthBlueprint.sourceCitation);

  // ==================== SECTION 4 OF 10: LOVE, MARRIAGE & AYURVEDIC CONSTITUTION ====================
  drawSectionHeader(
    'Section 4 of 10',
    'Love, Marriage Portrait (Upapada & Darakaraka) & Ayurvedic Vitality',
    'Partner temperament, real-world marriage environment, rational Mars/Kuja balance, and your Ayurvedic Vata-Pitta-Kapha wellness blueprint.'
  );

  drawParagraphBlock(
    `Partner Archetype (Darakaraka ${deepReport.relationshipBlueprint.darakarakaPlanet}): ${deepReport.relationshipBlueprint.partnerArchetypeTitle}`,
    deepReport.relationshipBlueprint.partnerPortraitNarrative
  );
  drawParagraphBlock(
    `Marriage Institution (Upapada Lagna in ${deepReport.relationshipBlueprint.upapadaLagnaSign}) & 7th House (${deepReport.relationshipBlueprint.seventhHouseSign})`,
    `${deepReport.relationshipBlueprint.marriageEnvironmentNarrative}   |   ${deepReport.relationshipBlueprint.navamshaD9Note}`
  );
  drawParagraphBlock(
    `Temperament & Mars Balance Check: ${deepReport.relationshipBlueprint.marsBalanceHeadline}`,
    `${deepReport.relationshipBlueprint.marsBalanceExplanation}   |   Golden Relationship Habit: ${deepReport.relationshipBlueprint.goldenRelationshipRule}`
  );
  drawCitationNote(deepReport.relationshipBlueprint.sourceCitation);

  // Ayurvedic Tridosha Visual Bars
  ensureSpace(32);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, contentW, 27, 1.8, 1.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    cleanPdfText(`Ayurvedic Constitutional Balance (Dominant Tendency: ${deepReport.wellnessBlueprint.dominantDosha})`),
    marginX + 4,
    y + 5.5
  );

  const doshaRows: { label: string; pct: number; rgb: [number, number, number] }[] = [
    { label: 'Vata (Air + Ether - Nervous System & Creativity)', pct: deepReport.wellnessBlueprint.vataPercent, rgb: [79, 70, 229] },
    { label: 'Pitta (Fire + Water - Metabolism & Drive)', pct: deepReport.wellnessBlueprint.pittaPercent, rgb: [217, 119, 6] },
    { label: 'Kapha (Earth + Water - Stamina & Immunity)', pct: deepReport.wellnessBlueprint.kaphaPercent, rgb: [5, 150, 105] },
  ];

  doshaRows.forEach((dr, idx) => {
    const ry = y + 9.2 + idx * 5.6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(dr.label, marginX + 4, ry + 3);

    const bx = marginX + 86;
    const bw = 76;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(bx, ry, bw, 3.6, 1, 1, 'F');
    doc.setFillColor(dr.rgb[0], dr.rgb[1], dr.rgb[2]);
    doc.roundedRect(bx, ry, Math.max(3, bw * (dr.pct / 100)), 3.6, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${dr.pct}%`, marginX + contentW - 4, ry + 3, { align: 'right' });
  });
  y += 30;

  drawParagraphBlock(
    'Constitutional Strengths & Early Stress Signals',
    `${deepReport.wellnessBlueprint.constitutionSummary}  Natural Strength: ${deepReport.wellnessBlueprint.naturalStrength}  Stress Signal to Watch: ${deepReport.wellnessBlueprint.stressSignalToWatch}`
  );
  drawParagraphBlock(
    'Daily Food, Sleep, Movement & 6th-House Recovery Protocol',
    `Food & Hydration: ${deepReport.wellnessBlueprint.foodAndHydrationTip}   |   Movement & Sleep: ${deepReport.wellnessBlueprint.movementAndSleepTip}   |   ${deepReport.wellnessBlueprint.sixthHouseResilienceNote}`,
    true,
    [5, 150, 105]
  );
  drawCitationNote(deepReport.wellnessBlueprint.sourceCitation);

  // ==================== SECTION 5 OF 10: VEDIC KUNDALI CHARTS (D1 & D9) & 4-SYSTEM CONCORDANCE ====================
  drawSectionHeader(
    'Section 5 of 10',
    'Visual Vedic Kundali Charts (D1 & D9) & Four-System Concordance',
    'North-Indian Rashi (D1) and Navamsha (D9) Kundali diagrams paired with your 4-system cross-tradition synthesis.'
  );

  ensureSpace(96);
  y += 6;
  const kundliSize = 84;
  drawNorthIndianKundli(
    marginX + 2,
    y,
    kundliSize,
    vedicReport.divisionalTable,
    'd1Sign',
    'Lagna / Rashi Kundali (D1)',
    'Root chart of physical life, career & vitality'
  );
  drawNorthIndianKundli(
    marginX + contentW - kundliSize - 2,
    y,
    kundliSize,
    vedicReport.divisionalTable,
    'd9Sign',
    'Navamsha Kundali (D9)',
    'Marriage, inner dharma & long-term fruit'
  );
  y += kundliSize + 6;

  const vargottamaList = vedicReport.divisionalTable
    .filter((d) => d.planetId !== 'Asc' && d.isVargottama)
    .map((d) => d.planetName);
  const kundliNote = `How to read these charts: Numbers 1-12 indicate Zodiac Signs (1=Aries, 2=Taurus, 3=Gemini, 4=Cancer, 5=Leo, 6=Virgo, 7=Libra, 8=Scorpio, 9=Sagittarius, 10=Capricorn, 11=Aquarius, 12=Pisces). Top center diamond is always House 1 (Self/Ascendant), counting counter-clockwise.${
    vargottamaList.length > 0
      ? ` Vargottama Planets (occupying the exact same sign in D1 & D9, extra strong): ${vargottamaList.join(', ')}.`
      : ''
  }`;
  drawParagraphBlock('Reading Your D1 & D9 Kundali Charts', kundliNote, false);

  for (const pillar of synthesisReport.pillars) {
    drawParagraphBlock(
      `${pillar.domain} (${pillar.score}% Alignment) - ${pillar.headline}`,
      `${pillar.subheadline}. ${pillar.keyInsight}`
    );
  }

  // 7-Chart Shodashvarga Harmonic Life Synthesis (D3, D4, D7, D9, D10, D12, D24)
  const vargaOverviewBody = deepReport.vargaHarmonics
    .map(
      (vh) =>
        `${vh.vargaCode} ${vh.domainTitle} (${vh.sanskritTitle} - Rising ${vh.vargaLagnaSign}, Lord ${vh.vargaLagnaLord} [${vh.strengthBadge}]): ${vh.laymanSynthesis}`
    )
    .join('   |   ');
  drawParagraphBlock(
    'Seven-Chart Shodashvarga Harmonic Life Synthesis (D3, D4, D7, D9, D10, D12 & D24)',
    vargaOverviewBody
  );

  // ==================== SECTION 6 OF 10: EPHEMERIS & DEEP 9-PLANET BPHS READINGS ====================
  drawSectionHeader(
    'Section 6 of 10',
    'Complete Planetary Positions & Deep 9-Planet Classical Synthesis',
    `Exact geocentric positions computed under ${ayanamsha} zodiac and ${houseSystem} houses, followed by layman + Brihat Parashara Hora Shastra Ch. 24 rulings.`
  );

  const drawPlanetTableHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, y, contentW, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    doc.text('Body', marginX + 2.5, y + 5);
    doc.text('Sign & Degree', marginX + 34, y + 5);
    doc.text('House & Life Area', marginX + 76, y + 5);
    doc.text('Birth Star (Pada)', marginX + 128, y + 5);
    doc.text('Status', marginX + 162, y + 5);
    y += 7.5;
  };

  ensureSpace(24);
  drawPlanetTableHeader();

  const angleRows = [
    {
      body: 'Ascendant (Lagna)',
      signDeg: `${natalChart.ascendant.signName} ${natalChart.ascendant.formattedDMS}`,
      houseArea: 'H1 - Self & Vitality',
      star: 'Rising Horizon',
      status: 'Chart Ruler',
    },
    {
      body: 'Midheaven (MC)',
      signDeg: `${natalChart.midheaven.signName} ${natalChart.midheaven.formattedDMS}`,
      houseArea: 'H10 - Career Peak',
      star: 'Meridian Zenith',
      status: 'Public Role',
    },
  ];

  const allPlanetRows = [
    ...angleRows,
    ...natalChart.planets.map((p) => ({
      body: `${p.name.replace('North Node (Rahu)', 'Rahu').replace('South Node (Ketu)', 'Ketu')}${
        p.isRetrograde ? ' (R)' : ''
      }`,
      signDeg: `${p.signName} ${p.formattedDMS}`,
      houseArea: `H${p.house} - ${HOUSE_PLAIN_GUIDE[p.house]?.shortTitle || ''}`,
      star: `${p.nakshatraName} (P${p.nakshatraPada})`,
      status: p.dignity,
    })),
  ];

  allPlanetRows.forEach((r, idx) => {
    if (y + 7.2 > bottomLimitY) {
      doc.addPage();
      y = topY + 4;
      drawPlanetTableHeader();
    }
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, 7, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + 7, marginX + contentW, y + 7);

    doc.setFont('helvetica', idx < 2 ? 'bold' : 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanPdfText(r.body), marginX + 2.5, y + 4.8);
    doc.text(cleanPdfText(r.signDeg), marginX + 34, y + 4.8);
    doc.text(
      doc.splitTextToSize(cleanPdfText(r.houseArea), 49)[0] || '',
      marginX + 76,
      y + 4.8
    );
    doc.text(cleanPdfText(r.star), marginX + 128, y + 4.8);
    doc.text(cleanPdfText(r.status), marginX + 162, y + 4.8);
    y += 7;
  });

  y += 5;

  for (const pc of deepReport.deepPlanetCards) {
    const shadbalaMeta = `Shadbala: ${pc.shadbalaRupas} Rupas (${pc.shadbalaRatioPercent}% of ${pc.minRequiredRupas} min - ${pc.shadbalaTierLabel}) | State: ${pc.avasthaLabel} (${pc.avasthaDeliveryNote})`;
    const vargaBadges = `D9 Navamsha: ${pc.d9SignLabel} | D10 Career: ${pc.d10SignLabel} | D24 Learning: ${pc.d24SignLabel}${
      pc.isVargottama ? ' | VARGOTTAMA (Double-Reinforced)' : ''
    }${pc.isRetrograde ? ' | Retrograde' : ''}${pc.isCombust ? ' | Solar Proximity (Astangata)' : ''}`;
    const combustExtra = pc.combustNote ? `  ${pc.combustNote}` : '';
    const bodyText = `[${shadbalaMeta}]  ${pc.laymanSynthesis}${combustExtra}  [${vargaBadges}]  Classical BPHS House Ruling: ${pc.classicalBphsRuling}  Growth Lesson: ${pc.growthLesson}`;
    drawParagraphBlock(
      `${pc.planetLabel} in ${pc.signLabel} (${pc.degreeDMS}) - House ${pc.house} (${pc.houseTitle}) | ${pc.dignity}`,
      bodyText
    );
  }

  // ==================== SECTION 7 OF 10: BIRTH STAR (JANMA NAKSHATRA) DEEP DIVE ====================
  drawSectionHeader(
    'Section 7 of 10',
    `Your Birth Star Deep Dive: ${birthNakTreatise.name} (Pada ${moonPlanet.nakshatraPada})`,
    `Ruler: ${birthNakTreatise.ruler}  |  Deity: ${birthNakTreatise.deity}  |  Symbol: ${birthNakTreatise.symbol}  |  Nature: ${birthNakTreatise.natureGroup}`
  );

  const activePadaObj =
    birthNakTreatise.padas.find((pd) => pd.pada === moonPlanet.nakshatraPada) ||
    birthNakTreatise.padas[0];

  drawParagraphBlock('Emotional & Psychological Portrait (Moon in Birth Star)', birthNakTreatise.moonPortrait);
  drawParagraphBlock(
    `Your Specific Quarter: Pada ${activePadaObj.pada} (${activePadaObj.navamshaSign} Navamsha, Sound "${activePadaObj.bijaSound}")`,
    `${activePadaObj.expression}${activePadaObj.specialTag ? ` [Special Distinction: ${activePadaObj.specialTag}]` : ''}`
  );
  drawParagraphBlock(
    `Spiritual Power (Shakti): ${birthNakTreatise.shaktiName} - "${birthNakTreatise.shaktiTranslation}"`,
    `${birthNakTreatise.shaktiPhala} Classical Boon: ${birthNakTreatise.taittiriyaBoon}`
  );
  drawParagraphBlock(
    'Natural Career Strengths, Blind Spot & Favorable Works',
    `Ideal Vocations: ${birthNakTreatise.vocations.join(', ')}. Shadow Tendency to Watch: ${birthNakTreatise.shadowTrap}  |  Favorable for: ${birthNakTreatise.auspiciousWorks.join(', ')}. Caution for: ${birthNakTreatise.inauspiciousWorks.join(', ')}.`
  );

  // ==================== SECTION 8 OF 10: 12-HOUSE STRENGTHS, YOGAS & JAIMINI ====================
  drawSectionHeader(
    'Section 8 of 10',
    '12-House Life Strength Analysis (Sarvashtakavarga), Yogas & Jaimini',
    '28 points is the baseline average per house. Houses with 30+ points flow naturally; houses below 25 ask for steady habits and patience.'
  );

  const savSortedByHouse = [...vedicReport.sarvashtakavarga].sort((a, b) => a.house - b.house);
  ensureSpace(12 * 8 + 10);

  savSortedByHouse.forEach((hRow) => {
    ensureSpace(8.2);
    const guide = HOUSE_PLAIN_GUIDE[hRow.house];
    const labelStr = `H${hRow.house}: ${guide?.shortTitle || ''} (${hRow.signName})`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanPdfText(labelStr), marginX, y + 4.8);

    const barX = marginX + 83;
    const barMaxW = 63;
    const pct = Math.min(1, hRow.bindus / 42);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barX, y + 1.2, barMaxW, 4.8, 1.2, 1.2, 'F');

    if (hRow.bindus >= 30) {
      doc.setFillColor(5, 150, 105);
    } else if (hRow.bindus < 25) {
      doc.setFillColor(225, 29, 72);
    } else {
      doc.setFillColor(79, 70, 229);
    }
    doc.roundedRect(barX, y + 1.2, Math.max(4, barMaxW * pct), 4.8, 1.2, 1.2, 'F');

    const benchX = barX + (28 / 42) * barMaxW;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.35);
    doc.line(benchX, y + 0.6, benchX, y + 6.6);

    const verdict =
      hRow.bindus >= 30 ? 'Strong Tailwind' : hRow.bindus < 25 ? 'Steady Effort' : 'Balanced';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    doc.text(`${hRow.bindus} pts (${verdict})`, barX + barMaxW + 3, y + 4.8);

    y += 7.8;
  });

  y += 4;

  if (vedicReport.yogas.length > 0) {
    for (const yg of vedicReport.yogas) {
      drawParagraphBlock(
        `Classical Yoga: ${yg.name} (${yg.category} - ${yg.strength} Strength)`,
        `${yg.description}${yg.sourceText ? ` [Source: ${yg.sourceText}]` : ''}`
      );
    }
  }

  if (deepReport.saravaliConjunctions.length > 0) {
    for (const conj of deepReport.saravaliConjunctions) {
      drawParagraphBlock(
        `Planetary Conjunction (Yuti): ${conj.headline} [${conj.planetsJoined.join(' + ')}]`,
        `${conj.laymanTakeaway}  Saravali Portrait: ${conj.classicalPortrait} [${conj.sourceRef}]`
      );
    }
  }

  const jaiminiSummary = vedicReport.charaKarakas
    .map(
      (ck) =>
        `${ck.karakaName} (${ck.karakaCode}): ${ck.planetName} in ${ck.signName} (D9 ${ck.navamshaSignName}) - ${ck.domain}`
    )
    .join('  |  ');
  drawParagraphBlock('Seven Jaimini Soul Significators (Chara Karakas)', jaiminiSummary, false);

  // ==================== SECTION 9 OF 10: MATURITY AGES (16-48), LIVE GOCHARA, ANTARDASHAS & 12-YR HORIZON ====================
  drawSectionHeader(
    'Section 9 of 10',
    'Turning-Point Ages (16-48), Live Sky Transits & Planetary Chapters',
    'Combines Planetary Maturity Ages (Graha Paripakvata), live Saturn Sade Sati / Jupiter Guru Bala / Moorthi Nirnaya transits, active Antardasha sub-periods, and your 12-year outlook.'
  );

  // 9A: Planetary Maturity Ages Table (16 -> 48)
  ensureSpace(22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Planetary Maturity Milestones (Graha Paripakvata - Ages 16 to 48)', marginX, y + 4);
  y += 6.5;

  const drawMaturityHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, y, contentW, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Age (Year)', marginX + 2, y + 5);
    doc.text('Planet & Houses', marginX + 27, y + 5);
    doc.text('Status', marginX + 64, y + 5);
    doc.text('Real-Life Turning Point Meaning', marginX + 86, y + 5);
    y += 7.5;
  };

  drawMaturityHeader();
  deepReport.maturityMilestones.forEach((ms, idx) => {
    const meaningStr = cleanPdfText(
      `${ms.headline}: ${ms.laymanMeaning}${ms.conjunctionNote ? ` (${ms.conjunctionNote})` : ''}`
    );
    const wrappedM = doc.splitTextToSize(meaningStr, 93);
    const rowH = Math.max(7.5, wrappedM.length * 4 + 2.8);
    if (y + rowH > bottomLimitY) {
      doc.addPage();
      y = topY + 4;
      drawMaturityHeader();
    }
    if (ms.status === 'ACTIVE_NOW') {
      doc.setFillColor(238, 242, 255);
      doc.rect(marginX, y, contentW, rowH, 'F');
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + rowH, marginX + contentW, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`Age ${ms.maturityAge} (${ms.calendarYear})`, marginX + 2, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const hRuled = ms.housesRuled.length > 0 ? `R:H${ms.housesRuled.join(',')}` : 'Node';
    doc.text(cleanPdfText(`${ms.planetLabel} (H${ms.houseOccupied}, ${hRuled})`), marginX + 27, y + 4.8);

    doc.setFont('helvetica', 'bold');
    if (ms.status === 'ACTIVE_NOW') doc.setTextColor(79, 70, 229);
    else if (ms.status === 'COMPLETED') doc.setTextColor(5, 150, 105);
    else doc.setTextColor(100, 116, 139);
    const stTag = ms.status === 'ACTIVE_NOW' ? 'ACTIVE' : ms.status === 'COMPLETED' ? 'DONE' : 'UPCOMING';
    doc.text(stTag, marginX + 64, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedM, marginX + 86, y + 4.8);
    y += rowH;
  });

  y += 5;

  // 9B: Live Slow-Planet Gochara Transits from Natal Moon
  drawParagraphBlock(
    `Live Saturn Transit (${deepReport.liveSkyAndSubPeriods.saturnTransitSign} - ${deepReport.liveSkyAndSubPeriods.saturnHouseFromMoon}th from Moon): ${deepReport.liveSkyAndSubPeriods.saturnPhaseHeadline}`,
    deepReport.liveSkyAndSubPeriods.saturnGuidance,
    true,
    deepReport.liveSkyAndSubPeriods.isSadeSati ? [217, 119, 6] : [5, 150, 105]
  );
  drawParagraphBlock(
    `Live Jupiter Transit (${deepReport.liveSkyAndSubPeriods.jupiterTransitSign} - ${deepReport.liveSkyAndSubPeriods.jupiterHouseFromMoon}th from Moon): ${deepReport.liveSkyAndSubPeriods.jupiterHeadline}`,
    deepReport.liveSkyAndSubPeriods.jupiterGuidance
  );
  drawParagraphBlock(
    `Live Nodal Axis & Moorthi Nirnaya (${deepReport.liveSkyAndSubPeriods.moorthiFormLabel})`,
    `${deepReport.liveSkyAndSubPeriods.nodalTransitNote}   |   ${deepReport.liveSkyAndSubPeriods.moorthiExplanation}`
  );
  drawCitationNote(deepReport.liveSkyAndSubPeriods.sourceCitation);

  // 9C: Active Mahadasha's 9 Antardasha Sub-Periods
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    cleanPdfText(`Sub-Chapters Inside Your Active ${deepReport.liveSkyAndSubPeriods.activeMahadashaLabel} Mahadasha (Antardashas)`),
    marginX,
    y + 4
  );
  y += 6.5;

  const drawAntarHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, y, contentW, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Sub-Period', marginX + 2.5, y + 5);
    doc.text('Date Window', marginX + 38, y + 5);
    doc.text('Plain-English Focus & Guidance', marginX + 82, y + 5);
    y += 7.5;
  };

  drawAntarHeader();
  deepReport.liveSkyAndSubPeriods.subPeriods.forEach((sp, idx) => {
    const wrappedG = doc.splitTextToSize(cleanPdfText(`${sp.themeTitle} - ${sp.laymanGuidance}`), 97);
    const rowH = Math.max(7.2, wrappedG.length * 4 + 2.6);
    if (y + rowH > bottomLimitY) {
      doc.addPage();
      y = topY + 4;
      drawAntarHeader();
    }
    if (sp.status === 'ACTIVE') {
      doc.setFillColor(238, 242, 255);
      doc.rect(marginX, y, contentW, rowH, 'F');
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + rowH, marginX + contentW, y + rowH);

    doc.setFont('helvetica', sp.status === 'ACTIVE' ? 'bold' : 'normal');
    doc.setFontSize(8.1);
    doc.setTextColor(sp.status === 'ACTIVE' ? 79 : 15, sp.status === 'ACTIVE' ? 70 : 23, sp.status === 'ACTIVE' ? 229 : 42);
    doc.text(
      cleanPdfText(`${sp.antarLordLabel}${sp.status === 'ACTIVE' ? ' [NOW]' : ''}`),
      marginX + 2.5,
      y + 4.8
    );
    doc.setTextColor(51, 65, 85);
    doc.text(cleanPdfText(`${sp.startDate} -> ${sp.endDate}`), marginX + 38, y + 4.8);
    doc.text(wrappedG, marginX + 82, y + 4.8);
    y += rowH;
  });

  y += 5;

  // 9D: Lifetime Mahadashas Table
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('120-Year Lifetime Vimshottari Mahadasha Sequence', marginX, y + 4);
  y += 6.5;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, y, contentW, 7.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  doc.text('Major Chapter (Mahadasha)', marginX + 2.5, y + 5);
  doc.text('Dates', marginX + 48, y + 5);
  doc.text('Plain-English Life Theme', marginX + 94, y + 5);
  y += 7.5;

  vedicReport.dashas.forEach((d, idx) => {
    ensureSpace(8);
    if (d.isCurrent) {
      doc.setFillColor(238, 242, 255);
      doc.rect(marginX, y, contentW, 7.5, 'F');
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, 7.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + 7.5, marginX + contentW, y + 7.5);

    doc.setFont('helvetica', d.isCurrent ? 'bold' : 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(d.isCurrent ? 79 : 15, d.isCurrent ? 70 : 23, d.isCurrent ? 229 : 42);
    doc.text(
      cleanPdfText(`${d.lord} (${d.years}y)${d.isCurrent ? ' [ACTIVE]' : ''}`),
      marginX + 2.5,
      y + 5
    );
    doc.setTextColor(51, 65, 85);
    doc.text(cleanPdfText(`${d.startDate} to ${d.endDate}`), marginX + 48, y + 5);
    const theme = DASHA_PLAIN_GUIDE[d.lord]?.chapterTitle || '';
    doc.text(doc.splitTextToSize(cleanPdfText(theme), 85)[0] || '', marginX + 94, y + 5);
    y += 7.5;
  });

  y += 6;

  // 9E: 12-Year Year-by-Year Horizon Table
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('12-Year Annual Forecast (Vedic Dasha + Personal Year + Transits)', marginX, y);
  y += 4;

  const draw12YrHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, y, contentW, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    doc.text('Year (Age)', marginX + 2.5, y + 5);
    doc.text('Dasha Period', marginX + 28, y + 5);
    doc.text('Personal Yr', marginX + 64, y + 5);
    doc.text('Annual Transit & Focus Theme', marginX + 88, y + 5);
    y += 7.5;
  };

  draw12YrHeader();
  synthesisReport.unifiedTimeline.forEach((yrRow, idx) => {
    const wrappedTheme = doc.splitTextToSize(cleanPdfText(yrRow.westernTransitTheme), 91);
    const rowH = Math.max(7.2, wrappedTheme.length * 4.2 + 2.5);
    if (y + rowH > bottomLimitY) {
      doc.addPage();
      y = topY + 4;
      draw12YrHeader();
    }
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + rowH, marginX + contentW, y + rowH);

    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(15, 23, 42);
    doc.text(`${yrRow.year} (${yrRow.age})`, marginX + 2.5, y + 4.8);
    doc.text(cleanPdfText(yrRow.vedicDashaLord), marginX + 28, y + 4.8);
    doc.text(`PY #${yrRow.numerologyPersonalYear}`, marginX + 64, y + 4.8);
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedTheme, marginX + 88, y + 4.8);
    y += rowH;
  });

  y += 5;

  // ==================== SECTION 10 OF 10: DEEP NUMEROLOGY, PANCHANG HORAI, REMEDIES & BIBLIOGRAPHY ====================
  drawSectionHeader(
    'Section 10 of 10',
    `Deep Numerology (${numerologyReport.system}), Daily Timing, Remedies & Bibliography`,
    'Cheiro compound vibration, Decoz 4 Life Pinnacles, today’s local Horai & 10-decision timing matrix, practical remedies, and classical book references.'
  );

  drawParagraphBlock(
    deepReport.deepNumerology.lifePathHeadline,
    deepReport.deepNumerology.lifePathDeepNarrative
  );
  drawParagraphBlock(
    deepReport.deepNumerology.compoundTitle,
    deepReport.deepNumerology.compoundNarrative
  );
  drawParagraphBlock(
    deepReport.deepNumerology.maturityNumberLabel,
    deepReport.deepNumerology.maturityNarrative
  );

  const pinnacleLines = deepReport.deepNumerology.pinnacleRoadmap
    .map(
      (p) =>
        `${p.label} (${p.ageSpan})${p.isCurrent ? ' [ACTIVE SEASON]' : ''}: Pinnacle #${p.number}, Challenge #${p.challenge} - ${p.meaning}`
    )
    .join('   |   ');
  drawParagraphBlock('Four Life Pinnacles & Challenges Roadmap', pinnacleLines);
  drawParagraphBlock(
    deepReport.deepNumerology.karmicLessonsTitle,
    deepReport.deepNumerology.karmicLessonsItems.join('   |   ')
  );

  const numItems = [
    { name: 'Expression / Destiny Number', val: numerologyReport.expression },
    { name: "Heart's Desire (Soul Urge)", val: numerologyReport.heartsDesire },
    { name: 'Outer Personality Number', val: numerologyReport.personality },
    { name: 'Personal Year Cycle', val: numerologyReport.personalYear },
  ];
  for (const ni of numItems) {
    drawParagraphBlock(
      `${ni.name}: #${ni.val.final} (Calculation ${ni.val.trail})`,
      ni.val.meaning
    );
  }
  drawCitationNote(deepReport.deepNumerology.sourceCitation);

  // Daily Panchang, 12 Horais & 10-Decision Matrix
  const nallaSummary = panchangReport.nallaNeram
    .map((nn) => `${nn.periodLabel}: ${nn.startTime}-${nn.endTime} (${nn.gowriName})`)
    .join('  |  ');
  const panchangOverview = `Computed for ${cleanCityName(profile.location.name)} on ${panchangReport.dateStr} (${panchangReport.vara.name}), Sunrise ${panchangReport.sunriseTime} - Sunset ${panchangReport.sunsetTime}. Lunar Day (Tithi): ${panchangReport.tithi.name} (${panchangReport.tithi.paksha}). Transit Star: ${panchangReport.nakshatra.name} (Pada ${panchangReport.nakshatra.pada}). Yoga: ${panchangReport.yoga.name}. Karana: ${panchangReport.karana.name}. Active Horai: ${panchangReport.activeHorai.horaiName} (${panchangReport.activeHorai.startTime}-${panchangReport.activeHorai.endTime}). ${nallaSummary}. Personal Star Harmony (Tarabala): Tara #${panchangReport.personalTarabala.taraNumber} (${panchangReport.personalTarabala.taraName}).`;
  drawParagraphBlock('Today’s Local Panchang, Horai & Nalla Neram Summary', panchangOverview);

  ensureSpace(46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    cleanPdfText(
      `Today’s 12 Daytime Horai Planetary Hours (${panchangReport.sunriseTime} - ${panchangReport.sunsetTime})`
    ),
    marginX,
    y + 4
  );
  y += 6.5;

  const colW = (contentW - 4) / 2;
  for (let row = 0; row < 6; row++) {
    ensureSpace(7);
    const leftH = panchangReport.dayHorai[row];
    const rightH = panchangReport.dayHorai[row + 6];
    [leftH, rightH].forEach((hSlot, cIdx) => {
      if (!hSlot) return;
      const cellX = marginX + cIdx * (colW + 4);
      doc.setFillColor(
        hSlot.tone === 'optimal'
          ? 236
          : hSlot.tone === 'favorable'
          ? 240
          : hSlot.tone === 'avoid'
          ? 255
          : 248,
        hSlot.tone === 'optimal'
          ? 253
          : hSlot.tone === 'favorable'
          ? 249
          : hSlot.tone === 'avoid'
          ? 241
          : 250,
        hSlot.tone === 'optimal'
          ? 245
          : hSlot.tone === 'favorable'
          ? 255
          : hSlot.tone === 'avoid'
          ? 242
          : 252
      );
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(cellX, y, colW, 6.2, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(15, 23, 42);
      doc.text(
        cleanPdfText(`#${hSlot.hourIndexInPeriod} ${hSlot.horaiName}`),
        cellX + 2,
        y + 4.2
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.4);
      doc.setTextColor(71, 85, 105);
      doc.text(cleanPdfText(hSlot.quality), cellX + 34, y + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text(`${hSlot.startTime}-${hSlot.endTime}`, cellX + colW - 2, y + 4.2, {
        align: 'right',
      });
    });
    y += 7;
  }
  y += 3;

  const keyActionIds = [
    'SIGN_CONTRACT',
    'LAUNCH_BUSINESS',
    'LEND_MONEY',
    'BORROW_MONEY',
    'REPAY_DEBT',
    'BUY_GOLD_WEALTH',
    'MARRIAGE_VIVAHA',
    'GRIHA_PRAVESHA',
    'START_MEDICINE',
    'BUY_VEHICLE',
  ];
  const natalMoonSignIdx = Math.floor(moonPlanet.siderealLongitude / 30);
  const selectedActions = LIFE_ACTIONS.filter((a) => keyActionIds.includes(a.id));
  const actionListToRender =
    selectedActions.length >= 6 ? selectedActions : LIFE_ACTIONS.slice(0, 10);

  ensureSpace(22);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, y, contentW, 7.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  doc.text('Life Decision / Action', marginX + 2.5, y + 5);
  doc.text('Today Score', marginX + 74, y + 5);
  doc.text('Today Verdict', marginX + 98, y + 5);
  doc.text('Best Date (Next 12 Days)', marginX + 130, y + 5);
  y += 7.5;

  const nowDate = new Date();
  actionListToRender.forEach((act, idx) => {
    ensureSpace(8);
    const todayEv = evaluateActionConsequence(
      act.id,
      nowDate,
      profile.location,
      moonPlanet.nakshatraIndex,
      natalMoonSignIdx
    );
    const bestWin = scanUpcomingBestWindows(
      act.id,
      nowDate,
      profile.location,
      moonPlanet.nakshatraIndex,
      natalMoonSignIdx,
      12
    )[0];

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentW, 7.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + 7.5, marginX + contentW, y + 7.5);

    const verdictLabel =
      todayEv.score >= 70 ? 'Optimal' : todayEv.score >= 48 ? 'Mixed / Caution' : 'Wait / Postpone';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(cleanPdfText(act.title), 68)[0] || '', marginX + 2.5, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(`${todayEv.score}/100`, marginX + 74, y + 5);

    if (todayEv.score >= 70) doc.setTextColor(5, 150, 105);
    else if (todayEv.score < 48) doc.setTextColor(225, 29, 72);
    else doc.setTextColor(180, 83, 9);
    doc.text(verdictLabel, marginX + 98, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(
      bestWin ? `${bestWin.dateStr} (${bestWin.score}/100, ${bestWin.nakshatraName})` : '-',
      marginX + 130,
      y + 5
    );
    y += 7.5;
  });

  y += 5;

  // Grounded Classical & Behavioral Remedies
  const activeDashaTreatise = PLANET_TREATISES[vedicReport.activeMahadasha.lord];
  const activeKarma = BEHAVIORAL_KARMA_VIPAKA.find(
    (k) => k.planetId === vedicReport.activeMahadasha.lord
  );

  const remedyBody = [
    `1. Birth Star Sacred Ecology & Upaya (${birthNakTreatise.name}): Sacred Tree: ${birthNakTreatise.sacredTree}. Practical Habit: ${birthNakTreatise.behavioralUpaya}. Mantra: ${birthNakTreatise.vedicMantra}`,
    activeDashaTreatise
      ? `2. Active ${vedicReport.activeMahadasha.lord} Chapter Support: ${activeDashaTreatise.gemstoneAndMantra}`
      : '',
    activeKarma
      ? `3. Daily Behavioral Alignment (${vedicReport.activeMahadasha.lord}): ${activeKarma.livingDharmaPractice}`
      : '',
  ]
    .filter(Boolean)
    .join('   ');

  drawParagraphBlock('Personalized Remedies & Daily Alignment Habits (Parihara)', remedyBody);

  // Personalized Trikona-Safe Gemstones, Sattvic Dana & Brihat Samhita Vastu Compass
  const safeGemSummary = deepReport.upayaArchitecture.trikonaSafeGems
    .map(
      (g) =>
        `${g.houseRoleLabel} (${g.planetLabel}): Primary ${g.primaryGem} | Gentle Upa-Ratna: ${g.affordableUpaRatna} (${g.metalAndFinger}, ${g.wearingWindow}) - ${g.whySafeExplanation}`
    )
    .join('   ||   ');
  drawParagraphBlock(
    'Lagna-Safe Trikona Gemstone & Upa-Ratna Guide (1st, 5th & 9th Functional Benefics)',
    `${safeGemSummary}   [${deepReport.upayaArchitecture.avoidGemPlanetsWarning}]`
  );

  drawParagraphBlock(
    'Zero-Cost Sattvic Charity (Dana) & Lowest-SAV House Habit Reinforcement',
    `${deepReport.upayaArchitecture.activeDashaCharityTitle}: ${deepReport.upayaArchitecture.activeDashaCharityAction}   ||   ${deepReport.upayaArchitecture.weakestHouseHabitTitle}: ${deepReport.upayaArchitecture.weakestHouseHabitAction}`
  );

  drawParagraphBlock(
    'Personalized Vastu Workspace & Sleep Compass (Brihat Samhita Ch. 53)',
    `Desk & Study Facing (${deepReport.upayaArchitecture.vastuDeskDirection}): ${deepReport.upayaArchitecture.vastuDeskWhy}   ||   Sleep Head Direction (${deepReport.upayaArchitecture.vastuSleepHeadDirection}): ${deepReport.upayaArchitecture.vastuSleepWhy}`
  );
  drawCitationNote(deepReport.upayaArchitecture.sourceCitation);

  // Synthesis Q&A + Authoritative Bibliography Appendix
  if (synthesisReport.aiCopilotPrompts.length > 0) {
    drawSectionHeader(
      'Appendix A',
      'Frequently Asked Personal Questions (Grounded in Your Chart)',
      'Direct answers synthesized from your birth chart, active Dasha, Ashtakavarga, and Personal Year.'
    );
    for (const qa of synthesisReport.aiCopilotPrompts) {
      drawParagraphBlock(qa.question, qa.groundedAnswer, false);
    }
  }

  drawSectionHeader(
    'Appendix B',
    'Authoritative Classical & Modern Book Bibliography',
    'Every formula and layman synthesis in this dossier is mathematically derived from these primary canons.'
  );
  for (const bib of deepReport.bibliography) {
    drawParagraphBlock(
      `${bib.title} (${bib.authorAndEra})`,
      bib.usedForEn,
      false
    );
  }

  // ==================== RUNNING HEADERS & PAGE FOOTERS ON ALL PAGES ====================
  const totalPages = doc.getNumberOfPages();
  const generatedOn = new Date().toISOString().slice(0, 10);

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`OCEANOLOGY PERSONAL LIFE DOSSIER  |  ${fullName}`, marginX, 11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${ayanamsha} / ${houseSystem}`, pageW - marginX, 11, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(marginX, 13, pageW - marginX, 13);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginX, 284, pageW - marginX, 284);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated ${generatedOn} at oceanology.vercel.app  |  100% Client-Side Ephemeris & Book-Grounded Engine`,
      marginX,
      289
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${p} of ${totalPages}`, pageW - marginX, 289, { align: 'right' });
  }

  const arrayBuf = doc.output('arraybuffer');
  return new Uint8Array(arrayBuf);
}

export function buildPdfFileName(profile: BirthProfile): string {
  const safeFirst = (profile.firstName || 'Personal').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeLast = (profile.lastName || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `Oceanology_Detailed_Report_${safeFirst}_${safeLast}.pdf`;
}

export async function downloadDetailedPdfReport(input: PdfReportBundleInput): Promise<void> {
  const bytes = await generateDetailedPdfBytes(input);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildPdfFileName(input.profile);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function openDetailedPdfInNewTab(input: PdfReportBundleInput): Promise<void> {
  const bytes = await generateDetailedPdfBytes(input);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    const link = document.createElement('a');
    link.href = url;
    link.download = buildPdfFileName(input.profile);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
