import React, { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Calendar,
  Compass,
  BookOpen,
  Sliders,
  Scale,
  ArrowRight,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { CosmicSynthesisReport } from '../engines/synthesisEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import { PLANET_TREATISES } from '../data/classicalCompendium';
import {
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
import {
  buildPdfFileName,
  downloadDetailedPdfReport,
  openDetailedPdfInNewTab,
} from '../engines/pdfReportGenerator';
import { VedicKundliSvg } from './VedicKundliSvg';
import { NatalWheelSvg } from './NatalWheelSvg';
import { StatusBadge } from './ui/DashboardPrimitives';

interface Props {
  profile: BirthProfile;
  natalChart: NatalChartResult;
  vedicReport: VedicReport;
  panchangReport: PanchangReport;
  numerologyReport: NumerologyReport;
  synthesisReport: CosmicSynthesisReport;
  ayanamsha: AyanamshaMode;
  houseSystem: HouseSystem;
  onEditProfile: () => void;
  onOpenActionTiming: (actionId?: string) => void;
  onInspectNakshatra: (nakIdx: number) => void;
}

const KEY_REPORT_ACTIONS = [
  'SIGN_CONTRACT',
  'LAUNCH_BUSINESS',
  'LEND_MONEY',
  'REPAY_DEBT',
  'BUY_GOLD_WEALTH',
  'MARRIAGE_VIVAHA',
  'GRIHA_PRAVESHA',
  'BUY_VEHICLE',
];

export const PersonalReportReader: React.FC<Props> = ({
  profile,
  natalChart,
  vedicReport,
  panchangReport,
  numerologyReport,
  synthesisReport,
  ayanamsha,
  houseSystem,
  onEditProfile,
  onOpenActionTiming,
  onInspectNakshatra,
}) => {
  const [pdfBusy, setPdfBusy] = useState<'NONE' | 'DOWNLOAD' | 'PREVIEW'>('NONE');
  const [pdfStatusMsg, setPdfStatusMsg] = useState<string | null>(null);

  const bsBirth = useMemo(
    () => gregorianToBikramSambat(profile.year, profile.month, profile.day),
    [profile.year, profile.month, profile.day]
  );

  const plainSummary = useMemo(
    () =>
      buildPlainEnglishPersonalSummary(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, synthesisReport]
  );

  const moonPlanet = natalChart.planets.find((p) => p.id === 'Moon') || natalChart.planets[1];
  const birthNak = useMemo(
    () => getNakshatraTreatiseByIndex(moonPlanet.nakshatraIndex),
    [moonPlanet.nakshatraIndex]
  );
  const birthPadaObj =
    birthNak.padas.find((pd) => pd.pada === moonPlanet.nakshatraPada) || birthNak.padas[0];

  const savSortedByHouse = useMemo(
    () => [...vedicReport.sarvashtakavarga].sort((a, b) => a.house - b.house),
    [vedicReport.sarvashtakavarga]
  );

  const actionTimingRows = useMemo(() => {
    const now = new Date();
    const natalMoonSignIdx = Math.floor(moonPlanet.siderealLongitude / 30);
    return LIFE_ACTIONS.filter((a) => KEY_REPORT_ACTIONS.includes(a.id)).map((act) => {
      const todayEv = evaluateActionConsequence(
        act.id,
        now,
        profile.location,
        moonPlanet.nakshatraIndex,
        natalMoonSignIdx
      );
      const bestNext = scanUpcomingBestWindows(
        act.id,
        now,
        profile.location,
        moonPlanet.nakshatraIndex,
        natalMoonSignIdx,
        12
      )[0];
      return {
        action: act,
        todayScore: todayEv.score,
        whatHappens: todayEv.whatHappensIfDoneNow,
        bestNext,
      };
    });
  }, [profile.location, moonPlanet.nakshatraIndex, moonPlanet.siderealLongitude]);

  const handleDownloadPdf = async () => {
    try {
      setPdfBusy('DOWNLOAD');
      setPdfStatusMsg(null);
      await downloadDetailedPdfReport({
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        ayanamsha,
        houseSystem,
      });
      setPdfStatusMsg(`Downloaded ${buildPdfFileName(profile)}`);
    } finally {
      setPdfBusy('NONE');
    }
  };

  const handlePreviewPdf = async () => {
    try {
      setPdfBusy('PREVIEW');
      setPdfStatusMsg(null);
      await openDetailedPdfInNewTab({
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        ayanamsha,
        houseSystem,
      });
      setPdfStatusMsg('Opened full multi-page PDF report in a new tab.');
    } finally {
      setPdfBusy('NONE');
    }
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* ==================== TOP DOSSIER HERO & PDF EXPORT CARD ==================== */}
      <section className="obs-card p-6 sm:p-8 space-y-6 border-t-4 border-t-[var(--accent)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-sm font-semibold">
              <FileText className="w-4 h-4" />
              <span>Easy-to-Read Personal Horoscope &amp; Multi-Page PDF Dossier</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight leading-tight">
              {profile.firstName} {profile.middleName} {profile.lastName}
            </h1>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Born{' '}
              <strong className="text-[var(--text)]">
                {profile.year}-{pad2(profile.month)}-{pad2(profile.day)}
              </strong>{' '}
              at{' '}
              <strong className="text-[var(--text)]">
                {profile.unknownTime
                  ? 'Solar Noon (Unknown Birth Time)'
                  : `${pad2(profile.hour)}:${pad2(profile.minute)}`}
              </strong>{' '}
              in <strong className="text-[var(--text)]">{profile.location.name}</strong> (Nepali B.S.{' '}
              {bsBirth.formattedEn})
            </p>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="btn-editorial-secondary inline-flex items-center gap-2 text-sm"
          >
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <span>Change Birth Details</span>
          </button>
        </div>

        {/* Prominent PDF Export Action Box */}
        <div className="obs-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-base font-bold text-[var(--text)]">
              Want a clean printable copy with all charts, tables &amp; explanations?
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Generates an 8-section vector PDF including your D1 &amp; D9 Kundali diagrams, plain-English
              reading, planetary table, 12-house strengths, Dasha dates, and upcoming best days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={pdfBusy !== 'NONE'}
              onClick={handleDownloadPdf}
              className="btn-editorial-primary inline-flex items-center gap-2 text-sm px-5 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>
                {pdfBusy === 'DOWNLOAD' ? 'Building PDF…' : 'Download Full PDF (.pdf)'}
              </span>
            </button>

            <button
              type="button"
              disabled={pdfBusy !== 'NONE'}
              onClick={handlePreviewPdf}
              className="btn-editorial-secondary inline-flex items-center gap-2 text-sm disabled:opacity-60"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
              <span>{pdfBusy === 'PREVIEW' ? 'Opening…' : 'View PDF in Browser'}</span>
            </button>
          </div>
        </div>

        {pdfStatusMsg && (
          <div className="px-4 py-3 rounded-lg bg-[var(--sage-bg)] border border-[var(--sage)]/30 text-[var(--sage)] text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pdfStatusMsg}</span>
          </div>
        )}

        {/* Quick Chapter Jump Links */}
        <nav
          aria-label="Report chapters"
          className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)] text-sm"
        >
          {[
            { href: '#rep-takeaways', label: '1. Key Takeaways' },
            { href: '#rep-plain-reading', label: '2. Plain-English Reading' },
            { href: '#rep-charts', label: '3. Kundali & Natal Charts' },
            { href: '#rep-planets', label: '4. Your 9 Planets' },
            { href: '#rep-birthstar', label: '5. Birth Star Guide' },
            { href: '#rep-houses-dasha', label: '6. Life Areas & Timeline' },
            { href: '#rep-timing', label: '7. Best Dates & Remedies' },
          ].map((ch) => (
            <a
              key={ch.href}
              href={ch.href}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] text-[var(--text-secondary)] font-medium transition"
            >
              {ch.label}
            </a>
          ))}
        </nav>
      </section>

      {/* ==================== CHAPTER 1: 5 KEY TAKEAWAYS AT A GLANCE ==================== */}
      <section id="rep-takeaways" className="obs-card p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">Chapter 1</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            Your Chart at a Glance — 5 Key Takeaways
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            If you only read one box today, start here. Every point translates your astronomical birth
            chart into clear everyday guidance.
          </p>
        </div>

        <div className="space-y-3">
          {plainSummary.quickBulletTakeaways.map((item) => (
            <div
              key={item.label}
              className="obs-panel p-4 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-4"
            >
              <span className="text-sm font-bold text-[var(--accent)] sm:w-52 shrink-0">
                {item.label}
              </span>
              <span className="text-base text-[var(--text)] leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CHAPTER 2: PLAIN-ENGLISH PERSONAL READING ==================== */}
      <section id="rep-plain-reading" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">Chapter 2</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {plainSummary.greetingHeadline}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            No Sanskrit dictionary needed—here is how your Rising sign, Sun, Moon, Birth Star, and
            active life cycle work together in plain language.
          </p>
        </div>

        <div className="space-y-5 text-base sm:text-[17px] leading-[1.75] text-[var(--text)]">
          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--accent)]" />
              <span>Who You Are (Rising Sign, Sun &amp; Moon)</span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.bigThreeParagraph}</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <span>Your Birth Star Gift ({birthNak.name}, Pada {moonPlanet.nakshatraPada})</span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.birthStarParagraph}</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--accent-bg)]/50 border border-[var(--accent)]/30 space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
              <span>Your Current Life Chapter: {plainSummary.currentChapterTitle}</span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.currentChapterParagraph}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--sage-bg)] border border-[var(--sage)]/30 space-y-2">
              <h3 className="text-base font-bold text-[var(--sage)]">
                Where Life Flows Naturally (Your Top Strengths)
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {plainSummary.strengthsParagraph}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--amber-bg)] border border-[var(--amber)]/30 space-y-2">
              <h3 className="text-base font-bold text-[var(--amber)]">
                Where Steady Habits Pay Off Most
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {plainSummary.careAreaParagraph}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 3: VISUAL KUNDALI & NATAL WHEEL ==================== */}
      <section id="rep-charts" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">Chapter 3</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            Your Visual Birth Charts (Vedic Kundali &amp; Ecliptic Wheel)
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Left: Your Vedic Divisional Kundali (switch between D1 Root Life Chart and D9 Marriage &amp;
            Soul Chart). Right: Your 360° Astronomical Sky Wheel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="obs-panel p-4 space-y-3">
            <h3 className="text-base font-bold text-[var(--text)]">
              Vedic Kundali (D1 Rashi &amp; D9 Navamsha)
            </h3>
            <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
          </div>

          <div className="obs-panel p-4 space-y-3">
            <h3 className="text-base font-bold text-[var(--text)]">
              360° Ecliptic Sky Wheel ({ayanamsha})
            </h3>
            <NatalWheelSvg chart={natalChart} />
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 4: YOUR PLANETS EXPLAINED SIMPLY ==================== */}
      <section id="rep-planets" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">Chapter 4</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            Your Planets &amp; What Each Placement Means for You
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Each planet governs a specific part of human life—confidence, emotions, drive, intellect,
            growth, love, and discipline. Here is where each sits in your chart.
          </p>
        </div>

        <div className="space-y-4">
          {natalChart.planets
            .filter((p) => !['Uranus', 'Neptune', 'Pluto'].includes(p.id))
            .map((p) => {
              const shortName = p.name
                .replace('North Node (Rahu)', 'Rahu (North Node)')
                .replace('South Node (Ketu)', 'Ketu (South Node)');
              const baseId = p.name.includes('Rahu')
                ? 'Rahu'
                : p.name.includes('Ketu')
                ? 'Ketu'
                : p.id;
              const houseInfo = HOUSE_PLAIN_GUIDE[p.house];
              const role = PLANET_PLAIN_ROLES[baseId] || '';
              const treatise = PLANET_TREATISES[baseId];

              return (
                <div key={p.id} className="obs-panel p-5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-bold" style={{ color: p.color }}>
                        {p.symbol}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text)]">
                          {shortName} in {p.signName} ({p.formattedDMS})
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">{role}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        size="md"
                        tone={
                          p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                            ? 'optimal'
                            : p.dignity === 'Debilitated'
                            ? 'avoid'
                            : 'info'
                        }
                        label={`House ${p.house}: ${houseInfo?.shortTitle || ''}`}
                      />
                      {p.isRetrograde && (
                        <StatusBadge size="md" tone="mixed" label="Retrograde (Inward)" />
                      )}
                    </div>
                  </div>

                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    Placed in <strong className="text-[var(--text)]">House {p.house}</strong> (
                    {houseInfo?.lifeAreas.toLowerCase()}) and{' '}
                    <button
                      type="button"
                      onClick={() => onInspectNakshatra(p.nakshatraIndex)}
                      className="text-[var(--accent)] font-semibold hover:underline"
                    >
                      {p.nakshatraName} Star, Pada {p.nakshatraPada}
                    </button>
                    . {houseInfo?.plainDescription}{' '}
                    {treatise ? `Growth lesson: ${treatise.vedicSoulLesson}` : ''}
                  </p>
                </div>
              );
            })}
        </div>
      </section>

      {/* ==================== CHAPTER 5: BIRTH STAR (JANMA NAKSHATRA) GUIDE ==================== */}
      <section id="rep-birthstar" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">Chapter 5</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              Your Birth Star Deep Dive: {birthNak.name} (Pada {moonPlanet.nakshatraPada})
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              Ruled by <strong>{birthNak.ruler}</strong> • Presiding Deity:{' '}
              <strong>{birthNak.deity}</strong> • Symbol: <strong>{birthNak.symbol}</strong> •
              Temperament: <strong>{birthNak.natureGroup}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onInspectNakshatra(moonPlanet.nakshatraIndex)}
            className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-[var(--accent)]" />
            <span>Open Full 28-Star Codex</span>
          </button>
        </div>

        <div className="space-y-4 text-base leading-relaxed">
          <div className="obs-panel p-5 space-y-2">
            <h3 className="text-base font-bold text-[var(--text)]">
              Inner Nature &amp; Emotional Style
            </h3>
            <p className="text-[var(--text-secondary)]">{birthNak.moonPortrait}</p>
          </div>

          <div className="obs-panel p-5 space-y-2">
            <h3 className="text-base font-bold text-[var(--text)]">
              Your Exact Quarter — Pada {birthPadaObj.pada} ({birthPadaObj.navamshaSign} Navamsha)
            </h3>
            <p className="text-[var(--text-secondary)]">{birthPadaObj.expression}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--sage)]">
                Best Career &amp; Activity Fit
              </h3>
              <p className="text-sm font-semibold text-[var(--text)]">
                Careers: {birthNak.vocations.join(' • ')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Favorable activities: {birthNak.auspiciousWorks.join(', ')}.
              </p>
            </div>

            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--crimson)]">
                Blind Spot &amp; Activities to Pace Carefully
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">{birthNak.shadowTrap}</p>
              <p className="text-sm text-[var(--text-muted)]">
                Avoid under this star: {birthNak.inauspiciousWorks.join(', ')}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 6: 12 LIFE AREAS & UPCOMING TIMELINE ==================== */}
      <section id="rep-houses-dasha" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">Chapter 6</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            Your 12 Life Areas (Strength Scores) &amp; Multi-Year Chapters
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            In Vedic Ashtakavarga, <strong>28 points</strong> is average. Scores of{' '}
            <strong className="text-[var(--sage)]">30+</strong> mean easier natural support; scores
            below <strong className="text-[var(--crimson)]">25</strong> ask for steady discipline.
          </p>
        </div>

        <div className="space-y-3">
          {savSortedByHouse.map((h) => {
            const guide = HOUSE_PLAIN_GUIDE[h.house];
            const pct = Math.min(100, Math.round((h.bindus / 40) * 100));
            const barClass =
              h.bindus >= 30
                ? 'bg-[var(--sage)]'
                : h.bindus < 25
                ? 'bg-[var(--crimson)]'
                : 'bg-[var(--accent)]';
            const tone = h.bindus >= 30 ? 'optimal' : h.bindus < 25 ? 'avoid' : 'info';
            const tag =
              h.bindus >= 30 ? 'Strong Tailwind' : h.bindus < 25 ? 'Needs Patience' : 'Balanced';

            return (
              <div key={h.house} className="obs-panel p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-[var(--text)]">
                      House {h.house}: {guide?.shortTitle}
                    </span>{' '}
                    <span className="text-sm text-[var(--text-muted)]">({h.signName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[var(--text)]">
                      {h.bindus} pts
                    </span>
                    <StatusBadge tone={tone} label={tag} />
                  </div>
                </div>

                <div className="h-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                  <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {h.bindus >= 30
                    ? guide?.whenStrong
                    : h.bindus < 25
                    ? guide?.whenLow
                    : guide?.plainDescription}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lifetime Major Chapters Summary */}
        <div className="pt-4 border-t border-[var(--border)] space-y-4">
          <h3 className="text-lg font-bold text-[var(--text)]">
            Your Major Life Chapters (Vimshottari Mahadashas)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vedicReport.dashas.map((d) => {
              const info = DASHA_PLAIN_GUIDE[d.lord];
              return (
                <div
                  key={d.lord}
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    d.isCurrent
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-[var(--text)]">
                      {d.lord} Chapter ({d.years} yrs)
                    </span>
                    {d.isCurrent && <StatusBadge tone="optimal" label="Active Now" />}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    {d.startDate} → {d.endDate}
                  </div>
                  <div className="text-sm font-semibold text-[var(--accent)]">
                    {info?.chapterTitle}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {info?.bestFocus}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 7: DECISION TIMING & PRACTICAL REMEDIES ==================== */}
      <section id="rep-timing" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">Chapter 7</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              Best Upcoming Dates for Important Decisions &amp; Practical Remedies
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              Personalized for {profile.location.name} using your Birth Star ({moonPlanet.nakshatraName}
              ). Scores of <strong>70+</strong> mark strong green-light windows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenActionTiming()}
            className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4 text-[var(--accent)]" />
            <span>Test All 20 Actions</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                <th className="py-3 px-3 font-semibold">Life Decision</th>
                <th className="py-3 px-3 font-semibold">Today’s Score</th>
                <th className="py-3 px-3 font-semibold">Best Date in Next 12 Days</th>
                <th className="py-3 px-3 font-semibold text-right">Explore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {actionTimingRows.map((row) => (
                <tr key={row.action.id} className="hover:bg-[var(--bg-elevated)]/60">
                  <td className="py-3.5 px-3 font-semibold text-[var(--text)]">
                    {row.action.title}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge
                      size="md"
                      tone={
                        row.todayScore >= 70
                          ? 'optimal'
                          : row.todayScore >= 48
                          ? 'mixed'
                          : 'avoid'
                      }
                      label={`${row.todayScore}/100 Today`}
                    />
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[var(--text-secondary)]">
                    {row.bestNext ? (
                      <span>
                        <strong className="text-[var(--text)]">{row.bestNext.dateStr}</strong> (
                        {row.bestNext.score}/100 • {row.bestNext.nakshatraName})
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenActionTiming(row.action.id)}
                      className="text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grounded Remedies Box */}
        <div className="p-5 rounded-xl bg-[var(--sage-bg)] border border-[var(--sage)]/30 space-y-3">
          <h3 className="text-lg font-bold text-[var(--sage)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span>Simple, Practical Daily Alignment &amp; Classical Remedies</span>
          </h3>
          <ul className="space-y-2 text-base text-[var(--text-secondary)] list-disc pl-5 leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">Daily Timing Habit:</strong> Schedule key calls,
              contracts, and launches inside <strong>{synthesisReport.bestWindowToday}</strong>.
            </li>
            <li>
              <strong className="text-[var(--text)]">
                Birth Star Grounding ({birthNak.name}):
              </strong>{' '}
              {birthNak.behavioralUpaya} (Sacred tree: {birthNak.sacredTree}).
            </li>
            <li>
              <strong className="text-[var(--text)]">Classical Mantra Support:</strong>{' '}
              <span className="font-mono text-sm">{birthNak.vedicMantra}</span>
            </li>
          </ul>
        </div>

        {/* Bottom Download CTA */}
        <div className="obs-panel p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-base font-bold text-[var(--text)]">
              Save or share this complete report as a PDF
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Includes full planetary degree tables, 12-year forecast, numerology profile, and vector
              Kundali charts.
            </div>
          </div>

          <button
            type="button"
            disabled={pdfBusy !== 'NONE'}
            onClick={handleDownloadPdf}
            className="btn-editorial-primary inline-flex items-center gap-2 text-sm px-5"
          >
            <Download className="w-4 h-4" />
            <span>
              {pdfBusy === 'DOWNLOAD' ? 'Building PDF…' : 'Download Detailed PDF Report'}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
