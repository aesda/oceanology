import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';
import { NatalChartResult, ZODIAC_SIGNS } from './astronomyEngine';
import { DivisionalChartEntry, VedicReport } from './vedicEngine';
import { PanchangReport } from './panchangEngine';
import { NumerologyReport } from './numerologyEngine';
import { CosmicSynthesisReport } from './synthesisEngine';
import { cleanCityName, gregorianToBikramSambat } from './locationAtlas';
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
  PLANET_PLAIN_ROLES,
} from '../data/plainEnglishGuide';

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
  const pageH = 297;
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
    ensureSpace(22);
    y += 3;
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.setDrawColor(199, 210, 254); // Indigo-200
    doc.roundedRect(marginX, y, contentW, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(cleanPdfText(numLabel.toUpperCase()), marginX + 4, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(cleanPdfText(title), marginX + 4, y + 10.8);

    y += 17;
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(cleanPdfText(subtitle), contentW);
      doc.text(lines, marginX, y);
      y += lines.length * 4.4 + 2.5;
    }
  };

  const drawParagraphBlock = (heading: string, body: string, accentBar = true) => {
    const cleanHead = cleanPdfText(heading);
    const cleanBody = cleanPdfText(body);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.2);
    const wrappedHead = doc.splitTextToSize(cleanHead, contentW - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    const wrappedBody = doc.splitTextToSize(cleanBody, contentW - 10);

    const headH = wrappedHead.length * 4.8;
    const bodyH = wrappedBody.length * 4.6;
    const boxH = 5.5 + headH + 1.8 + bodyH + 3.5;

    ensureSpace(boxH + 3);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y, contentW, boxH, 1.8, 1.8, 'FD');

    if (accentBar) {
      doc.setFillColor(79, 70, 229);
      doc.rect(marginX, y, 1.6, boxH, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.2);
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedHead, marginX + 4.8, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedBody, marginX + 4.8, y + 5.8 + headH + 1.4);

    y += boxH + 3.2;
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

    // Chart Background & Outer Square
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.45);
    doc.rect(x0, y0, sizeMm, sizeMm, 'FD');

    // Diagonals
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(x0, y0, x0 + sizeMm, y0 + sizeMm);
    doc.line(x0 + sizeMm, y0, x0, y0 + sizeMm);

    // Inner Diamond
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
        // Split into 2 short lines if >= 4 planets share a house
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

  // ==================== PAGE 1: COVER & EXECUTIVE SNAPSHOT ====================
  doc.setFillColor(15, 23, 42); // Slate-900 Header Banner
  doc.roundedRect(marginX, 12, contentW, 38, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(165, 180, 252); // Indigo-300
  doc.text('OCEANOLOGY | PERSONAL HOROSCOPE, VEDIC KUNDALI & LIFE TIMING DOSSIER', marginX + 6, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(fullName || 'Personal Horoscope Report', marginX + 6, 30.5);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const tzSign = profile.location.timezoneOffsetHours >= 0 ? '+' : '-';
  const tzAbs = Math.abs(profile.location.timezoneOffsetHours);
  const tzStr = `UTC${tzSign}${pad2(Math.floor(tzAbs))}:${pad2(Math.round((tzAbs % 1) * 60))}`;
  const birthLine1 = cleanPdfText(
    `Born: ${profile.year}-${pad2(profile.month)}-${pad2(profile.day)} at ${
      profile.unknownTime
        ? 'Solar Noon (Unknown Exact Time)'
        : `${pad2(profile.hour)}:${pad2(profile.minute)}:${pad2(profile.second)}`
    } (${tzStr})  |  Nepali Date: B.S. ${bsBirth.formattedEn}`
  );
  const birthLine2 = cleanPdfText(
    `Birthplace: ${cleanCityName(profile.location.name)}, ${profile.location.country} (${profile.location.latitude.toFixed(
      2
    )}°N, ${profile.location.longitude.toFixed(2)}°E)  |  Zodiac: ${ayanamsha}  |  Houses: ${houseSystem}`
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(226, 232, 240);
  doc.text(birthLine1, marginX + 6, 38.5);
  doc.text(birthLine2, marginX + 6, 44.2);

  y = 56;

  // 6-Card Executive Snapshot Grid (2 rows x 3 cols)
  const topSav = [...vedicReport.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0];
  const snapshotCards = [
    {
      label: 'RISING SIGN (ASCENDANT)',
      value: `${natalChart.ascendant.signName} (${natalChart.ascendant.formattedDMS})`,
      sub: 'Your outward style & physical vitality',
    },
    {
      label: 'SUN & MOON SIGNS',
      value: `${sunPlanet.signName} Sun / ${moonPlanet.signName} Moon`,
      sub: 'Inner purpose & emotional nature',
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
      label: 'STRONGEST LIFE AREA',
      value: `House ${topSav.house} (${topSav.bindus} pts)`,
      sub: HOUSE_PLAIN_GUIDE[topSav.house]?.shortTitle || topSav.signName,
    },
    {
      label: 'LIFE PATH & alignment',
      value: `Life Path #${numerologyReport.lifePath.final}  |  ${synthesisReport.overallResonanceScore}/100`,
      sub: `Personal Year ${numerologyReport.personalYear.final} (${numerologyReport.system})`,
    },
  ];

  const cardGap = 4;
  const cardW = (contentW - cardGap * 2) / 3;
  const cardH = 21;

  snapshotCards.forEach((c, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = marginX + col * (cardW + cardGap);
    const cy = y + row * (cardH + 3.5);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(79, 70, 229);
    doc.text(cleanPdfText(c.label), cx + 3.2, cy + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const valClipped = doc.splitTextToSize(cleanPdfText(c.value), cardW - 6)[0] || '';
    doc.text(valClipped, cx + 3.2, cy + 11.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    const subClipped = doc.splitTextToSize(cleanPdfText(c.sub), cardW - 6)[0] || '';
    doc.text(subClipped, cx + 3.2, cy + 17.2);
  });

  y += cardH * 2 + 11;

  // Quick Key Takeaways Box on Page 1
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208);
  const takeawayLines: { label: string; wrapped: string[] }[] = plainSummary.quickBulletTakeaways.map(
    (b) => ({
      label: cleanPdfText(b.label),
      wrapped: doc.splitTextToSize(cleanPdfText(b.text), contentW - 56),
    })
  );
  const takeawayH =
    11 + takeawayLines.reduce((acc, item) => acc + Math.max(1, item.wrapped.length) * 4.5 + 1.8, 0);
  doc.roundedRect(marginX, y, contentW, takeawayH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(6, 95, 70);
  doc.text('AT A GLANCE: YOUR 5 MOST IMPORTANT TAKEAWAYS', marginX + 4.5, y + 6.5);

  let ty = y + 12.2;
  for (const item of takeawayLines) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.label}:`, marginX + 4.5, ty);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(item.wrapped, marginX + 52, ty);
    ty += Math.max(1, item.wrapped.length) * 4.5 + 1.8;
  }

  y += takeawayH + 5;

  // ==================== SECTION 1: PLAIN-ENGLISH PERSONAL READING ====================
  drawSectionHeader(
    'Section 1 of 8',
    'Plain-English Personal Reading (What Your Chart Means)',
    'Written in everyday language so you can immediately understand your personality, current life chapter, natural strengths, and daily timing before diving into technical tables.'
  );

  drawParagraphBlock('1. Your Core Personality (Rising, Sun & Moon)', plainSummary.bigThreeParagraph);
  drawParagraphBlock('2. Your Vedic Birth Star Gift & Blind Spot', plainSummary.birthStarParagraph);
  drawParagraphBlock(
    `3. Current Life Chapter: ${plainSummary.currentChapterTitle}`,
    plainSummary.currentChapterParagraph
  );
  drawParagraphBlock('4. Where Life Flows Best for You', plainSummary.strengthsParagraph);
  drawParagraphBlock('5. Where Patience & Structure Pay Off', plainSummary.careAreaParagraph);
  drawParagraphBlock('6. Practical Guidance for Today', plainSummary.todayGuidanceParagraph);

  // 4-System Synthesis Pillars
  drawSectionHeader(
    'Section 2 of 8',
    'Four-System Concordance & Vedic Kundali Charts (D1 & D9)',
    'Visual North-Indian Rashi (D1) and Navamsha (D9) Kundali diagrams paired with your 4-system cross-tradition synthesis.'
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

  // Legend below Kundali charts
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

  // ==================== SECTION 3: PLANETARY EPHEMERIS & PLANET READINGS ====================
  drawSectionHeader(
    'Section 3 of 8',
    'Complete Planetary Positions & Plain-English Meanings',
    `Exact geocentric positions computed under ${ayanamsha} zodiac and ${houseSystem} houses, with plain-English house meanings.`
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

  // Individual Planet-by-Planet Personal Readings (9 Vedic Grahas)
  const coreNineIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  for (const pid of coreNineIds) {
    const p = natalChart.planets.find(
      (pl) => pl.id === pid || pl.name.toLowerCase().includes(pid.toLowerCase())
    );
    if (!p) continue;
    const hGuide = HOUSE_PLAIN_GUIDE[p.house];
    const treatise = PLANET_TREATISES[pid];
    const role = PLANET_PLAIN_ROLES[pid] || '';
    const detailText = `Governs: ${role}. Placed in ${p.signName} (${p.formattedDMS}) in House ${
      p.house
    } (${hGuide?.shortTitle || ''}), inside ${p.nakshatraName} Star (Pada ${p.nakshatraPada})${
      p.isRetrograde
        ? ' [Retrograde - internalized, reflective strength]'
        : ''
    }. In your life, ${pid} directs energy toward ${
      hGuide?.lifeAreas.toLowerCase() || 'this domain'
    }. ${treatise ? `Key lesson: ${treatise.vedicSoulLesson}` : ''}`;

    drawParagraphBlock(
      `${pid} in ${p.signName} (House ${p.house}: ${hGuide?.shortTitle || ''}) - ${p.dignity}`,
      detailText
    );
  }

  // ==================== SECTION 4: BIRTH STAR (JANMA NAKSHATRA) DEEP DIVE ====================
  drawSectionHeader(
    'Section 4 of 8',
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
    'Natural Career Strengths & Blind Spot to Watch',
    `Ideal Vocations: ${birthNakTreatise.vocations.join(', ')}. Shadow Tendency to Watch: ${birthNakTreatise.shadowTrap}`
  );
  drawParagraphBlock(
    'Best Activities vs. Activities to Avoid Under Your Birth Star',
    `Favorable for: ${birthNakTreatise.auspiciousWorks.join(', ')}. Avoid / Caution for: ${birthNakTreatise.inauspiciousWorks.join(', ')}.`
  );

  // ==================== SECTION 5: 12-HOUSE STRENGTHS, YOGAS & JAIMINI ====================
  drawSectionHeader(
    'Section 5 of 8',
    '12-House Life Strength Analysis (Sarvashtakavarga) & Active Yogas',
    '28 points is the baseline average per house. Houses with 30+ points flow naturally; houses below 25 ask for steady habits and patience.'
  );

  const savSortedByHouse = [...vedicReport.sarvashtakavarga].sort((a, b) => a.house - b.house);
  ensureSpace(12 * 8.2 + 12);

  savSortedByHouse.forEach((hRow) => {
    ensureSpace(8.5);
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
      doc.setFillColor(5, 150, 105); // Emerald
    } else if (hRow.bindus < 25) {
      doc.setFillColor(225, 29, 72); // Rose
    } else {
      doc.setFillColor(79, 70, 229); // Indigo
    }
    doc.roundedRect(barX, y + 1.2, Math.max(4, barMaxW * pct), 4.8, 1.2, 1.2, 'F');

    // 28 Benchmark tick
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

  // Jaimini Karakas Summary
  const jaiminiSummary = vedicReport.charaKarakas
    .map(
      (ck) =>
        `${ck.karakaName} (${ck.karakaCode}): ${ck.planetName} in ${ck.signName} (D9 ${ck.navamshaSignName}) - ${ck.domain}`
    )
    .join('  |  ');
  drawParagraphBlock('Seven Jaimini Soul Significators (Chara Karakas)', jaiminiSummary, false);

  // ==================== SECTION 6: VIMSHOTTARI DASHA & 12-YEAR FORECAST ====================
  drawSectionHeader(
    'Section 6 of 8',
    'Lifetime Planetary Chapters (Vimshottari Dasha) & 12-Year Horizon',
    'Your 120-year Vimshottari Mahadasha sequence alongside a year-by-year 12-year outlook.'
  );

  ensureSpace(24);
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

  // 12-Year Year-by-Year Horizon Table
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
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

  // ==================== SECTION 7: DAILY PANCHANG, HORAI TIME & 10-DECISION TIMING GUIDE ====================
  drawSectionHeader(
    'Section 7 of 8',
    `Daily Panchang, Horai Time & Decision Timing (${cleanCityName(profile.location.name)})`,
    `Computed for ${panchangReport.dateStr} (${panchangReport.vara.name})  |  Sunrise ${panchangReport.sunriseTime} - Sunset ${panchangReport.sunsetTime}`
  );

  const nallaSummary = panchangReport.nallaNeram
    .map((nn) => `${nn.periodLabel}: ${nn.startTime}-${nn.endTime} (${nn.gowriName})`)
    .join('  |  ');
  const panchangOverview = `Lunar Day (Tithi): ${panchangReport.tithi.name} (${panchangReport.tithi.paksha}). Transit Star: ${panchangReport.nakshatra.name} (Pada ${panchangReport.nakshatra.pada}). Yoga: ${panchangReport.yoga.name}. Karana: ${panchangReport.karana.name}. Active Horai: ${panchangReport.activeHorai.horaiName} (${panchangReport.activeHorai.startTime}-${panchangReport.activeHorai.endTime}). Active Gowri: ${panchangReport.activeGowri.name} (${panchangReport.activeGowri.nature}). ${nallaSummary}. Personal Star Harmony (Tarabala): Tara #${panchangReport.personalTarabala.taraNumber} (${panchangReport.personalTarabala.taraName}) - ${
    panchangReport.personalTarabala.isAuspicious ? 'Supportive' : 'Mixed / Pace carefully'
  }. Travel Caution Today: Avoid ${panchangReport.dishashoola.forbiddenDirection} (${panchangReport.dishashoola.pariharaRemedy}).`;
  drawParagraphBlock('Today’s Local Sky, Horai, Gowri & Nalla Neram Summary', panchangOverview);

  // Daytime 12-Horai Schedule Compact 2-Column Grid
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
      doc.text(
        `${hSlot.startTime}-${hSlot.endTime}`,
        cellX + colW - 2,
        y + 4.2,
        { align: 'right' }
      );
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
    doc.line(marginX, y + 7.5, marginX + contentW, y + rowHeightVal());

    function rowHeightVal() {
      return 7.5;
    }

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

  // ==================== SECTION 8: NUMEROLOGY & PRACTICAL REMEDIES ====================
  drawSectionHeader(
    'Section 8 of 8',
    `Numerology Blueprint (${numerologyReport.system}) & Practical Remedies`,
    'Core name & birth numbers paired with grounded classical and behavioral remedies (Upaya).'
  );

  const numItems = [
    { name: 'Life Path Number', val: numerologyReport.lifePath },
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

  // Synthesis Q&A Appendix
  if (synthesisReport.aiCopilotPrompts.length > 0) {
    drawSectionHeader(
      'Appendix',
      'Frequently Asked Personal Questions (Grounded in Your Chart)',
      'Direct answers synthesized from your birth chart, active Dasha, Ashtakavarga, and Personal Year.'
    );
    for (const qa of synthesisReport.aiCopilotPrompts) {
      drawParagraphBlock(qa.question, qa.groundedAnswer, false);
    }
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
      doc.text(`OCEANOLOGY PERSONAL DOSSIER  |  ${fullName}`, marginX, 11);
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
      `Generated ${generatedOn} at oceanology.vercel.app  |  100% Client-Side Ephemeris`,
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
    // Fallback to direct download if popup blocked
    const link = document.createElement('a');
    link.href = url;
    link.download = buildPdfFileName(input.profile);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
