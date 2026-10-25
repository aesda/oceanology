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
  ShieldCheck,
  Printer,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Award,
  Layers,
  Clock,
} from 'lucide-react';
import { AyanamshaMode, BirthProfile, HouseSystem } from '../types/oceanology';
import { NatalChartResult } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { PanchangReport } from '../engines/panchangEngine';
import { NumerologyReport } from '../engines/numerologyEngine';
import { CosmicSynthesisReport } from '../engines/synthesisEngine';
import { gregorianToBikramSambat } from '../engines/locationAtlas';
import { getNakshatraTreatiseByIndex } from '../data/nakshatraCodex';
import {
  evaluateActionConsequence,
  LIFE_ACTIONS,
  scanUpcomingBestWindows,
} from '../data/karmaAndMuhurtaCodex';
import { generateDeepLifeReport } from '../engines/deepLifeReportEngine';
import {
  buildLocalizedPersonalSummary,
  formatCityForLang,
  formatCountryForLang,
  formatDisplayDate,
  trActionTitle,
  trDashaGuide,
  trDignity,
  trGowriName,
  trHoraiDisplay,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trSign,
  useLanguage,
} from '../i18n/i18n';
import {
  buildPdfFileName,
  downloadDetailedPdfReport,
  openDetailedPdfInNewTab,
} from '../engines/pdfReportGenerator';
import { VedicKundliSvg } from './VedicKundliSvg';
import { NatalWheelSvg } from './NatalWheelSvg';
import { SeedOfLifeMark } from './LandingPage';
import { StatusBadge } from './ui/DashboardPrimitives';
import { LotusVineDivider, SacredFlowerIcon } from './ui/FloralAnimations';

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
  onOpenHoraiStudio?: () => void;
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
  onOpenHoraiStudio,
  onInspectNakshatra,
}) => {
  const { lang, t } = useLanguage();
  const [pdfBusy, setPdfBusy] = useState<'NONE' | 'DOWNLOAD' | 'PREVIEW'>('NONE');
  const [pdfStatusMsg, setPdfStatusMsg] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState<'FULL' | 'SUMMARY'>('FULL');

  const bsBirth = useMemo(
    () => gregorianToBikramSambat(profile.year, profile.month, profile.day),
    [profile.year, profile.month, profile.day]
  );

  const plainSummary = useMemo(
    () =>
      buildLocalizedPersonalSummary(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        lang
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, synthesisReport, lang]
  );

  const deepReport = useMemo(
    () =>
      generateDeepLifeReport(
        profile,
        natalChart,
        vedicReport,
        panchangReport,
        numerologyReport,
        synthesisReport,
        lang
      ),
    [profile, natalChart, vedicReport, panchangReport, numerologyReport, synthesisReport, lang]
  );

  const cityDisplay = useMemo(
    () => formatCityForLang(profile.location.name, lang),
    [profile.location.name, lang]
  );
  const countryDisplay = useMemo(
    () => formatCountryForLang(profile.location.country, lang),
    [profile.location.country, lang]
  );
  const activeHoraiDisp = useMemo(
    () => trHoraiDisplay(panchangReport.activeHorai, lang),
    [panchangReport.activeHorai, lang]
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
      setPdfStatusMsg(
        t(
          `Downloaded ${buildPdfFileName(profile)}`,
          `${buildPdfFileName(profile)} सफलतापूर्वक डाउनलोड भयो।`
        )
      );
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
      setPdfStatusMsg(
        t(
          'Opened full multi-page PDF dossier in a new tab.',
          'नयाँ ट्याबमा बहु-पृष्ठ PDF रिपोर्ट खोलियो।'
        )
      );
    } finally {
      setPdfBusy('NONE');
    }
  };

  const handlePrintPage = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const isFull = readingMode === 'FULL';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-14 animate-bloom-in">
      {/* ==================== TOP PRODUCT DOSSIER HERO & SCORECARD ==================== */}
      <section className="sc-hero-card p-5 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--border-strong)] text-[var(--accent)] text-xs font-semibold">
              <SeedOfLifeMark size={16} tone="adaptive" />
              <span>
                {t(
                  'Comprehensive Personal Life Dossier • Classical Jyotish + Numerology',
                  'बृहत् व्यक्तिगत जीवन फलादेश • शास्त्रीय ज्योतिष र अंक विज्ञान'
                )}
              </span>
            </div>

            <h1 className="font-scDisplay text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-[-0.03em] leading-tight">
              {profile.firstName} {profile.middleName} {profile.lastName}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed tabular-nums">
              {lang === 'ne' ? (
                <>
                  जन्म मिति:{' '}
                  <strong className="text-[var(--text)]">
                    {profile.year}-{pad2(profile.month)}-{pad2(profile.day)}
                  </strong>{' '}
                  • समय:{' '}
                  <strong className="text-[var(--text)]">
                    {profile.unknownTime
                      ? 'सूर्य मध्याह्न (समय अज्ञात)'
                      : `${pad2(profile.hour)}:${pad2(profile.minute)}`}
                  </strong>{' '}
                  • स्थान: <strong className="text-[var(--text)]">{cityDisplay}</strong>,{' '}
                  {countryDisplay} ({bsBirth.formattedNp}) • उमेर:{' '}
                  <strong className="text-[var(--text)]">{deepReport.currentAge} वर्ष</strong>
                </>
              ) : (
                <>
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
                  in <strong className="text-[var(--text)]">{cityDisplay}</strong>, {countryDisplay}{' '}
                  ({bsBirth.formattedEn}) • Age{' '}
                  <strong className="text-[var(--text)]">{deepReport.currentAge}</strong>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="btn-editorial-secondary inline-flex items-center gap-2 text-sm no-print shrink-0"
          >
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <span>{t('Change Birth Details', 'जन्म विवरण सच्याउनुहोस्')}</span>
          </button>
        </div>

        {deepReport.unknownBirthTimeNote && (
          <div className="p-4 rounded-xl bg-[var(--amber-bg)] border border-[var(--amber)]/30 text-sm text-[var(--text)] leading-relaxed">
            <strong className="text-[var(--amber)]">
              {t('Note on Unknown Birth Time:', 'जन्म समय सम्बन्धी जानकारी:')}
            </strong>{' '}
            {deepReport.unknownBirthTimeNote}
          </div>
        )}

        {/* 5-Domain Life Readiness Scorecard */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t(
                'Five-Domain Life Blueprint Scorecard (Synthesized from BPHS, Jaimini & Uttara Kalamrita)',
                'पञ्च-क्षेत्र जीवन क्षमता सूचकाङ्क (पाराशर, जैमिनी र उत्तरकालामृत सूत्रमा आधारित)'
              )}
            </h2>
            <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
              {t(
                `Overall Chart Harmony: ${synthesisReport.overallResonanceScore}/100`,
                `समग्र कुण्डली सामञ्जस्य: ${synthesisReport.overallResonanceScore}/100`
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {deepReport.domainScorecard.map((dom) => (
              <div
                key={dom.id}
                className="obs-panel p-3.5 flex flex-col justify-between gap-2.5 min-w-0"
              >
                <div className="space-y-2 min-w-0">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] truncate">
                    {dom.title}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-scDisplay text-2xl font-bold text-[var(--text)] tabular-nums leading-none">
                      {dom.score}
                      <span className="text-xs font-medium text-[var(--text-muted)]">/100</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dom.tone === 'optimal'
                          ? 'bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#A7F3D0]'
                          : dom.tone === 'favorable'
                          ? 'bg-gradient-to-r from-[#7B5CE0] via-[#9780FF] to-[#EDC5FC]'
                          : 'bg-gradient-to-r from-[#D97706] via-[#FBBF24] to-[#FDE68A]'
                      }`}
                      style={{ width: `${dom.score}%` }}
                    />
                  </div>
                  <div>
                    <StatusBadge tone={dom.tone} label={dom.verdictLabel} />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-snug line-clamp-2">
                  {dom.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Export & Reading Depth Controls */}
        <div className="obs-panel p-4 sm:p-5 space-y-4 no-print">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-2xl min-w-0">
              <div className="text-base font-bold text-[var(--text)]">
                {t(
                  'Download Your Complete Multi-Page Product Dossier (.PDF) or Choose Reading Depth',
                  'पूर्ण बहु-पृष्ठ PDF पुस्तक डाउनलोड गर्नुहोस् वा अध्ययन मोड छान्नुहोस्'
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t(
                  'Includes all 10 chapters: Career & D10 Dikpala, Indu Lagna Wealth, Upapada Marriage & Spouse Portrait, Ayurvedic Constitution, Turning-Point Ages (16–48), Live Sade Sati / Guru Transits, Cheiro Numerology, and Vector Kundali Charts.',
                  'करियर र D10, इन्दु लग्न धन योग, विवाह र दाराकारक, आयुर्वेदिक प्रकृति, उमेर १६–४८ का मोडहरू, साढेसाती/गुरु गोचर र कुण्डली चार्टसहित पूर्ण प्रतिवेदन।'
                )}
              </p>
            </div>

            {/* Reading Depth Toggle */}
            <div
              role="group"
              aria-label="Reading depth selector"
              className="flex flex-wrap p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] max-w-full"
            >
              <button
                type="button"
                onClick={() => setReadingMode('FULL')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  isFull
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {t('Full 10-Chapter Dossier', 'पूर्ण १०-अध्याय रिपोर्ट')}
              </button>
              <button
                type="button"
                onClick={() => setReadingMode('SUMMARY')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  !isFull
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {t('5-Min Layman Summary', '५-मिनेट सरल सारांश')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={pdfBusy !== 'NONE'}
              onClick={handleDownloadPdf}
              className="btn-editorial-primary inline-flex items-center gap-2 text-sm px-5 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>
                {pdfBusy === 'DOWNLOAD'
                  ? t('Building PDF…', 'PDF बन्दैछ…')
                  : t('Download Full PDF Dossier (.pdf)', 'पूर्ण PDF रिपोर्ट डाउनलोड (.pdf)')}
              </span>
            </button>

            <button
              type="button"
              disabled={pdfBusy !== 'NONE'}
              onClick={handlePreviewPdf}
              className="btn-editorial-secondary inline-flex items-center gap-2 text-sm disabled:opacity-60"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
              <span>
                {pdfBusy === 'PREVIEW'
                  ? t('Opening…', 'खुल्दैछ…')
                  : t('Preview PDF in Browser', 'ब्राउजरमा PDF हेर्नुहोस्')}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintPage}
              className="btn-editorial-secondary inline-flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('Print Dossier', 'यो पृष्ठ प्रिन्ट / सेभ')}</span>
            </button>
          </div>
        </div>

        {pdfStatusMsg && (
          <div className="px-4 py-3 rounded-lg bg-[var(--sage-bg)] border border-[var(--sage)]/30 text-[var(--sage)] text-sm font-medium flex items-center gap-2 no-print">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pdfStatusMsg}</span>
          </div>
        )}

        {/* Chapter Table of Contents Jump Bar */}
        <nav
          aria-label="Report chapters"
          className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)] text-xs sm:text-sm no-print"
        >
          {[
            { href: '#rep-takeaways', label: t('1. Executive Summary', '१. मुख्य सारांश'), show: true },
            { href: '#rep-soul', label: t('2. Soul & Public Image', '२. आत्मा र सामाजिक छवि'), show: isFull },
            { href: '#rep-career-wealth', label: t('3. Career & Wealth', '३. करियर र धन योग'), show: true },
            { href: '#rep-love-health', label: t('4. Marriage & Health', '४. विवाह र स्वास्थ्य'), show: true },
            { href: '#rep-charts', label: t('5. Kundali Charts', '५. कुण्डली चार्ट'), show: isFull },
            { href: '#rep-planets', label: t('6. Deep 9 Planets', '६. नवग्रह गहन फल'), show: isFull },
            { href: '#rep-birthstar', label: t('7. Birth Star', '७. जन्म नक्षत्र'), show: isFull },
            { href: '#rep-houses', label: t('8. 12 Houses & Yogas', '८. १२ भाव र राजयोग'), show: isFull },
            { href: '#rep-maturity-transits', label: t('9. Ages 16–48 & Live Transits', '९. उमेर मोड र गोचर'), show: true },
            { href: '#rep-numerology-timing', label: t('10. Numerology, Dates & Books', '१०. अंक, साइत र ग्रन्थ'), show: true },
          ]
            .filter((c) => c.show)
            .map((ch) => (
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

      {/* ==================== CHAPTER 1: EXECUTIVE SUMMARY & PLAIN-ENGLISH READING ==================== */}
      <section id="rep-takeaways" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 1 • Plain-Language Executive Overview', 'अध्याय १ • सरल कार्यकारी सारांश')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {plainSummary.greetingHeadline}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'Zero astrology jargon required—start here to understand your core personality, current life chapter, biggest natural advantages, and where steady patience pays off most.',
              'कुनै जटिल ज्योतिषीय शब्दकोश बिना नै आफ्नो मूल स्वभाव, हालको जीवन कालखण्ड, प्रमुख सबल पक्ष र ध्यान दिनुपर्ने क्षेत्रहरू सरल भाषामा बुझ्नुहोस्।'
            )}
          </p>
        </div>

        <div className="space-y-2.5">
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

        <div className="space-y-4 text-base leading-[1.75] text-[var(--text)] pt-2">
          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>
                {t(
                  'Who You Are (Rising Sign, Sun & Moon)',
                  'तपाईंको मूल व्यक्तित्व (लग्न, सूर्य र चन्द्र राशि)'
                )}
              </span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.bigThreeParagraph}</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>
                {t(
                  `Your Birth Star Gift (${birthNak.name}, Pada ${moonPlanet.nakshatraPada})`,
                  `तपाईंको जन्म नक्षत्र विशेषता (${trNakshatra(birthNak.name, 'ne')}, चरण ${moonPlanet.nakshatraPada})`
                )}
              </span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.birthStarParagraph}</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--accent-bg)]/50 border border-[var(--accent)]/30 space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>
                {t('Your Current Life Chapter:', 'हालको जीवन अध्याय:')}{' '}
                {plainSummary.currentChapterTitle}
              </span>
            </h3>
            <p className="text-[var(--text-secondary)]">{plainSummary.currentChapterParagraph}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--sage-bg)] border border-[var(--sage)]/30 space-y-2">
              <h3 className="text-base font-bold text-[var(--sage)]">
                {t(
                  'Where Life Flows Naturally (Your Top Strengths)',
                  'सहजै प्रगति हुने क्षेत्र (तपाईंका प्रमुख सबल पक्ष)'
                )}
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {plainSummary.strengthsParagraph}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--amber-bg)] border border-[var(--amber)]/30 space-y-2">
              <h3 className="text-base font-bold text-[var(--amber)]">
                {t(
                  'Where Steady Habits Pay Off Most',
                  'धैर्य र नियमित अनुशासनले लाभ दिने क्षेत्र'
                )}
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {plainSummary.careAreaParagraph}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 2: SOUL PURPOSE, ARUDHA PUBLIC IMAGE & KARMIC AXIS ==================== */}
      {isFull && (
        <section id="rep-soul" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--accent)]">
                {t('Chapter 2 • Beyond the Surface', 'अध्याय २ • भित्री आत्मा र बाहिरी छवि')}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                {t(
                  'Inner Truth vs. Public Reputation & Your Soul’s Growth Axis',
                  'वास्तविक स्वभाव बनाम सामाजिक छवि (आरूढ लग्न) र आत्मिक विकास मार्ग'
                )}
              </h2>
              <p className="text-base text-[var(--text-secondary)]">
                {t(
                  'Why do people sometimes perceive you differently from how you feel inside? Classical Jaimini astrology answers this through your Arudha Lagna, Soul King (Atmakaraka), and Rahu–Ketu growth axis.',
                  'तपाईं आफूलाई भित्र जस्तो अनुभव गर्नुहुन्छ, समाजले किन कहिलेकाहीँ फरक रूपले हेर्छ? जैमिनी सूत्रको आरूढ लग्न, आत्मकारक र राहु-केतु अक्षले यसको स्पष्ट उत्तर दिन्छ।'
                )}
              </p>
            </div>
            <StatusBadge
              tone="info"
              label={`AL: ${deepReport.identityAndSoul.arudhaLagnaSign} • AK: ${deepReport.identityAndSoul.atmakarakaPlanet}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t(
                  `Public Mirror — Arudha Lagna in ${deepReport.identityAndSoul.arudhaLagnaSign}`,
                  `सामाजिक दर्पण — ${deepReport.identityAndSoul.arudhaLagnaSign} आरूढ लग्न`
                )}
              </h3>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {deepReport.identityAndSoul.innerVsOuterNarrative}
              </p>
            </div>

            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t(
                  `Soul Compass (Atmakaraka): ${deepReport.identityAndSoul.atmakarakaTitle}`,
                  `आत्मकारक जीवन-पाठ: ${deepReport.identityAndSoul.atmakarakaTitle}`
                )}
              </h3>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {deepReport.identityAndSoul.atmakarakaNarrative}{' '}
                <span className="text-[var(--text-muted)] text-sm">
                  ({t('Karakamsha in D9:', 'नवांश कारकांश:')}{' '}
                  <strong>{deepReport.identityAndSoul.karakamshaSign}</strong>)
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t(
                  `Innate Past Mastery (Ketu in House ${deepReport.identityAndSoul.ketuHouse})`,
                  `जन्मजात सहज सीप (केतु — भाव ${deepReport.identityAndSoul.ketuHouse})`
                )}
              </div>
              <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed">
                {deepReport.identityAndSoul.ketuComfortGift}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--accent-bg)]/45 border border-[var(--accent)]/30 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {t(
                  `This-Life Growth Frontier (Rahu in House ${deepReport.identityAndSoul.rahuHouse})`,
                  `यस जीवनको मुख्य विकास क्षेत्र (राहु — भाव ${deepReport.identityAndSoul.rahuHouse})`
                )}
              </div>
              <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed">
                {deepReport.identityAndSoul.rahuGrowthEdge}
              </p>
            </div>
          </div>

          <div className="obs-panel p-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>
              <strong>{t('Sun Degree Sabian Image:', 'सूर्य अंश प्रतीक:')}</strong> “
              {deepReport.identityAndSoul.sunSabian}”
            </span>
            <span>
              {t('Book Lineage:', 'शास्त्रीय आधार:')} {deepReport.identityAndSoul.sourceCitation}
            </span>
          </div>
        </section>
      )}

      {/* ==================== CHAPTER 3: CAREER CALLING & WEALTH ARCHITECTURE ==================== */}
      <section id="rep-career-wealth" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t(
              'Chapter 3 • Career, Calling & Financial Blueprint',
              'अध्याय ३ • करियर, पेशागत दिशा र आर्थिक समृद्धि सूत्र'
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'How You Best Work, Lead & Build Lasting Wealth',
              'तपाईंको सर्वोत्तम कार्यशैली, उपयुक्त पेशा र दिगो धन निर्माण मार्ग'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'Combines your 10th House Career Ruler, D10 Dashamsha Directional Guardian, KP Cusp 10 Sub-Lord, Kalidasa’s Indu Lagna (Wealth Ascendant), and D2 Hora earning style.',
              'दशमेश, दशमांश (D10) दिक्पाल, केपी दशम सब-लर्ड, कालिदासको इन्दु लग्न र होरा (D2) कुण्डलीको संयुक्त व्यावहारिक विश्लेषण।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Column */}
          <div className="obs-panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{t('Career & Vocation DNA', 'करियर र कर्म पहिचान')}</span>
                </div>
                <StatusBadge
                  tone="optimal"
                  label={`${deepReport.careerBlueprint.tenthLordPlanet} → H${deepReport.careerBlueprint.tenthLordHouse}`}
                />
              </div>

              <h3 className="text-lg font-bold text-[var(--text)]">
                {deepReport.careerBlueprint.headline}
              </h3>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {deepReport.careerBlueprint.laymanNarrative}
              </p>

              <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-3.5 space-y-1.5 text-sm">
                <div className="font-semibold text-[var(--text)]">
                  {t('D10 Career Guardian (Dikpala):', 'दशमांश (D10) दिक्पाल:')}{' '}
                  <span className="text-[var(--accent)]">
                    {deepReport.careerBlueprint.dikpalaDeity} (
                    {deepReport.careerBlueprint.dikpalaDirection}) —{' '}
                    {deepReport.careerBlueprint.dikpalaArchetype}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">
                  {deepReport.careerBlueprint.dikpalaStyle}
                </p>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {deepReport.careerBlueprint.amatyakarakaNote}{' '}
                {isFull ? deepReport.careerBlueprint.kpCareerNote : ''}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t('Strongest Career Lanes for Your Chart', 'तपाईंको कुण्डली सुहाउँदा प्रमुख पेशाहरू')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deepReport.careerBlueprint.recommendedLanes.map((lane) => (
                    <span
                      key={lane}
                      className="px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
                    >
                      {lane}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              {deepReport.careerBlueprint.sourceCitation}
            </div>
          </div>

          {/* Wealth Column */}
          <div className="obs-panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--sage)]">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>{t('Wealth & Money Psychology', 'धनार्जन र बचत मनोविज्ञान')}</span>
                </div>
                <StatusBadge
                  tone="optimal"
                  label={`Indu Lagna: ${deepReport.wealthBlueprint.induLagnaSign}`}
                />
              </div>

              <h3 className="text-lg font-bold text-[var(--text)]">
                {deepReport.wealthBlueprint.induStrengthTier}
              </h3>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {deepReport.wealthBlueprint.induNarrative}
              </p>

              {/* Surya vs Chandra Hora Bar */}
              <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-[var(--text)]">
                  <span>{deepReport.wealthBlueprint.horaEarningStyleTitle}</span>
                  <span className="tabular-nums text-[var(--accent)] whitespace-nowrap shrink-0">
                    {deepReport.wealthBlueprint.suryaHoraPercent}% /{' '}
                    {deepReport.wealthBlueprint.chandraHoraPercent}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex">
                  <div
                    className="h-full bg-[var(--amber)]"
                    style={{ width: `${deepReport.wealthBlueprint.suryaHoraPercent}%` }}
                    title="Surya Hora"
                  />
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${deepReport.wealthBlueprint.chandraHoraPercent}%` }}
                    title="Chandra Hora"
                  />
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.wealthBlueprint.horaEarningNarrative}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--sage-bg)] border border-[var(--sage)]/25 text-sm text-[var(--text)] leading-relaxed">
                <strong className="text-[var(--sage)]">
                  {t('Practical Money Rule:', 'व्यावहारिक आर्थिक नियम:')}
                </strong>{' '}
                {deepReport.wealthBlueprint.cashflowVsRetentionAdvice}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              {deepReport.wealthBlueprint.sourceCitation}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 4: LOVE, SPOUSE PORTRAIT & AYURVEDIC HEALTH ==================== */}
      <section id="rep-love-health" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t(
              'Chapter 4 • Love, Marriage & Mind-Body Constitution',
              'अध्याय ४ • प्रेम, वैवाहिक जीवनसाथी र आयुर्वेदिक स्वास्थ्य प्रकृति'
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your Partner Portrait, Relationship Harmony & Daily Wellness Guide',
              'तपाईंको जीवनसाथीको स्वभाव, दाम्पत्य सामञ्जस्य र दैनिक स्वास्थ्य सूत्र'
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Love & Marriage */}
          <div className="obs-panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  <Heart className="w-4 h-4 shrink-0" />
                  <span>{t('Spouse & Partnership Blueprint', 'जीवनसाथी र साझेदारी दर्पण')}</span>
                </div>
                <StatusBadge
                  tone="info"
                  label={`UL: ${deepReport.relationshipBlueprint.upapadaLagnaSign} • DK: ${deepReport.relationshipBlueprint.darakarakaPlanet}`}
                />
              </div>

              <h3 className="text-lg font-bold text-[var(--text)]">
                {deepReport.relationshipBlueprint.partnerArchetypeTitle}
              </h3>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {deepReport.relationshipBlueprint.partnerPortraitNarrative}
              </p>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {deepReport.relationshipBlueprint.marriageEnvironmentNarrative}{' '}
                {deepReport.relationshipBlueprint.navamshaD9Note}
              </p>

              <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-3.5 space-y-1">
                <div className="text-xs font-bold text-[var(--text)]">
                  {deepReport.relationshipBlueprint.marsBalanceHeadline}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.relationshipBlueprint.marsBalanceExplanation}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--accent-bg)]/45 border border-[var(--accent)]/30 text-sm text-[var(--text)]">
                <strong className="text-[var(--accent)]">
                  {t('Golden Relationship Habit:', 'सम्बन्ध सुमधुर राख्ने मूल मन्त्र:')}
                </strong>{' '}
                {deepReport.relationshipBlueprint.goldenRelationshipRule}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              {deepReport.relationshipBlueprint.sourceCitation}
            </div>
          </div>

          {/* Health & Ayurvedic Prakriti */}
          <div className="obs-panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--sage)]">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>{t('Ayurvedic Constitution & Vitality', 'आयुर्वेदिक त्रिदोष प्रकृति र ऊर्जा')}</span>
                </div>
                <StatusBadge tone="optimal" label={deepReport.wellnessBlueprint.dominantDosha} />
              </div>

              <h3 className="text-lg font-bold text-[var(--text)]">
                {deepReport.wellnessBlueprint.constitutionSummary}
              </h3>

              {/* Vata / Pitta / Kapha Bars */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: t('Vata (Air)', 'वात (वायु)'),
                    pct: deepReport.wellnessBlueprint.vataPercent,
                    bar: 'bg-[var(--accent)]',
                  },
                  {
                    label: t('Pitta (Fire)', 'पित्त (अग्नि)'),
                    pct: deepReport.wellnessBlueprint.pittaPercent,
                    bar: 'bg-[var(--amber)]',
                  },
                  {
                    label: t('Kapha (Earth)', 'कफ (जल/पृथ्वी)'),
                    pct: deepReport.wellnessBlueprint.kaphaPercent,
                    bar: 'bg-[var(--sage)]',
                  },
                ].map((d) => (
                  <div
                    key={d.label}
                    className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
                      <span className="truncate">{d.label}</span>
                      <span className="tabular-nums font-bold">{d.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  <strong className="text-[var(--text)]">
                    {t('Natural Gift:', 'स्वाभाविक क्षमता:')}
                  </strong>{' '}
                  {deepReport.wellnessBlueprint.naturalStrength}
                </p>
                <p>
                  <strong className="text-[var(--amber)]">
                    {t('Early Overwork Signal:', 'धपेडी हुँदा देखिने संकेत:')}
                  </strong>{' '}
                  {deepReport.wellnessBlueprint.stressSignalToWatch}
                </p>
                <p>
                  <strong className="text-[var(--sage)]">
                    {t('Nourishment & Hydration:', 'उपयुक्त खानपान:')}
                  </strong>{' '}
                  {deepReport.wellnessBlueprint.foodAndHydrationTip}
                </p>
                <p>
                  <strong className="text-[var(--accent)]">
                    {t('Sleep & Movement:', 'व्यायाम र विश्राम:')}
                  </strong>{' '}
                  {deepReport.wellnessBlueprint.movementAndSleepTip}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              {deepReport.wellnessBlueprint.sourceCitation}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CHAPTER 5: VISUAL KUNDALI & NATAL WHEEL ==================== */}
      {isFull && (
        <section id="rep-charts" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t('Chapter 5 • Visual Celestial Geometry', 'अध्याय ५ • दृश्य जन्म कुण्डली र राशि चक्र')}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {t(
                'Your Visual Birth Charts (Vedic Kundali & 360° Sky Wheel)',
                'तपाईंको दृश्य जन्म कुण्डली (D1/D9) र ३६०° खगोलीय ग्रह चक्र'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {t(
                'Left: Switch across your D1 Rashi, D9 Marriage, D10 Career, D24 Higher Learning, and Shodashvarga charts. Right: Your exact 360° ecliptic wheel.',
                'बायाँ: जन्म लग्न (D1), नवांश (D9), दशमांश (D10), चतुर्विंशांश विद्या (D24) र षोडशवर्ग कुण्डली। दायाँ: ३६०° क्रान्तिवृत्त राशि चक्र।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="obs-panel p-4 space-y-3">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t('Vedic Divisional Kundali (D1–D60 + D24 Vidya)', 'वैदिक षोडशवर्ग कुण्डली (D1–D60 + D24 विद्या)')}
              </h3>
              <VedicKundliSvg divisionalTable={vedicReport.divisionalTable} />
            </div>

            <div className="obs-panel p-4 space-y-3">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t(`360° Ecliptic Sky Wheel (${ayanamsha})`, `३६०° क्रान्तिवृत्त ग्रह चक्र (${ayanamsha})`)}
              </h3>
              <NatalWheelSvg chart={natalChart} />
            </div>
          </div>

          {/* 7-Chart Shodashvarga Harmonic Life Mirrors (BPHS Ch. 6-7) */}
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {t(
                  '7-Chart Harmonic Life Mirrors (Shodashvarga Synthesis — BPHS Ch. 6–7)',
                  'सप्त-वर्ग जीवन दर्पण (षोडशवर्ग सूक्ष्म संश्लेषण — बृहत् पाराशर अ. ६–७)'
                )}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t(
                  'While your D1 Birth Chart shows physical circumstances, these 7 divisional harmonics zoom into courage, property, legacy, marriage, career, lineage, and higher education.',
                  'जन्म कुण्डली (D1) ले बाह्य परिस्थिति देखाउँछ भने यी ७ सूक्ष्म वर्ग चार्टले साहस, भूमि, सन्तान, विवाह, करियर, कुल-वंश र उच्च शिक्षाको भित्री बल देखाउँछन्।'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {deepReport.vargaHarmonics.map((vh) => (
                <div key={vh.vargaCode} className="obs-panel p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--accent-bg)] text-[var(--accent)] font-mono text-xs font-bold">
                        {vh.vargaCode}
                      </span>
                      <span className="text-sm font-bold text-[var(--text)]">{vh.domainTitle}</span>
                    </div>
                    <StatusBadge tone={vh.strengthTone} label={vh.strengthBadge} />
                  </div>
                  <div className="text-xs font-medium text-[var(--accent)]">
                    {vh.sanskritTitle} • {t('Rising:', 'लग्न:')} <strong>{vh.vargaLagnaSign}</strong> (
                    {t('Lord:', 'स्वामी:')} {vh.vargaLagnaLord})
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {vh.laymanSynthesis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CHAPTER 6: DEEP 9-PLANET SYNTHESIS CARDS ==================== */}
      {isFull && (
        <section id="rep-planets" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t(
                'Chapter 6 • Planet-by-Planet Classical & Layman Synthesis',
                'अध्याय ६ • नवग्रहको विस्तृत शास्त्रीय र व्यावहारिक फलादेश'
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {t(
                'All 9 Vedic Planets: Shadbala Strength, Avastha, BPHS Sutra & Harmonics',
                'नवग्रह स्थिति: षड्बल शक्ति, बाल्यादि अवस्था, पाराशर सूत्र र सूक्ष्म वर्ग बल'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {t(
                'Every card pairs everyday meaning with BPHS Ch. 27 Six-Fold Strength (Shadbala in Rupas), Baladi Avastha delivery capacity, Surya Siddhanta combustion checks, and D9/D10/D24 confirmation.',
                'प्रत्येक ग्रहको दैनिक प्रभावसँगै बृहत् पाराशर होरा शास्त्र अ. २७ को षड्बल (रूपा बल), बाल्यादि अवस्था, अस्त परीक्षण र D9/D10/D24 स्थितिको पूर्ण विवरण।'
              )}
            </p>
          </div>

          <div className="space-y-4">
            {deepReport.deepPlanetCards.map((card) => (
              <div key={card.planetId} className="obs-panel p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-bold" style={{ color: card.color }}>
                      {card.symbol}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)]">
                        {lang === 'ne'
                          ? `${card.planetLabel} — ${card.signLabel} राशिमा (${card.degreeDMS})`
                          : `${card.planetLabel} in ${card.signLabel} (${card.degreeDMS})`}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">{card.roleSubtitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      size="md"
                      tone={
                        card.dignity === 'Exalted' || card.dignity === 'Own Sign'
                          ? 'optimal'
                          : card.dignity === 'Debilitated'
                          ? 'mixed'
                          : 'info'
                      }
                      label={
                        lang === 'ne'
                          ? `भाव ${card.house}: ${card.houseTitle} • ${trDignity(card.dignity, 'ne')}`
                          : `H${card.house}: ${card.houseTitle} • ${card.dignity}`
                      }
                    />
                    {card.isVargottama && (
                      <StatusBadge
                        size="md"
                        tone="optimal"
                        label={t('Vargottama (Extra Strong)', 'वर्गोत्तम (विशेष बली)')}
                      />
                    )}
                    {card.isRetrograde && (
                      <StatusBadge
                        size="md"
                        tone="mixed"
                        label={t('Retrograde', 'वक्री')}
                      />
                    )}
                    {card.isCombust && (
                      <StatusBadge
                        size="md"
                        tone="mixed"
                        label={t('Solar Proximity (Astangata)', 'अस्त (सूर्य समीप)')}
                      />
                    )}
                  </div>
                </div>

                {/* BPHS Ch. 27 Shadbala & Ch. 45 Baladi Avastha Strip */}
                <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">
                      {t('Six-Fold Strength (Shadbala):', 'षड्बल शक्ति:')}
                    </span>
                    <span className="font-mono font-bold text-[var(--accent)]">
                      {card.shadbalaRupas} {t('Rupas', 'रूपा')}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      ({card.shadbalaRatioPercent}% {t(`of ${card.minRequiredRupas} min`, `/ न्यूनतम ${card.minRequiredRupas}`)})
                    </span>
                    <StatusBadge tone={card.shadbalaTierTone} label={card.shadbalaTierLabel} />
                  </div>
                  <div className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text)]">{t('Avastha:', 'अवस्था:')}</strong>{' '}
                    {card.avasthaLabel} — <span className="text-[var(--text-muted)]">{card.avasthaDeliveryNote}</span>
                  </div>
                </div>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {card.laymanSynthesis}
                </p>

                {(card.combustNote || card.inPlanetaryWar) && (
                  <div className="rounded-lg bg-[var(--amber-bg)] border border-[var(--amber)]/30 p-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.combustNote && <p>{card.combustNote}</p>}
                    {card.inPlanetaryWar && card.warPartner && (
                      <p className="mt-1">
                        <strong className="text-[var(--text)]">
                          {t('Planetary War (Graha Yuddha < 1°):', 'ग्रह युद्ध (< १°):')}
                        </strong>{' '}
                        {t(
                          `Closely aligned within 1° of ${card.warPartner} — merging both planetary drives into intense, single-pointed focus.`,
                          `${card.warPartner} सँग १° भित्र अत्यन्त नजिक — दुवै ग्रहको ऊर्जा एकै लक्ष्यमा तीव्र रूपले केन्द्रित हुन्छ।`
                        )}
                      </p>
                    )}
                  </div>
                )}

                {lang === 'en' && (
                  <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-3.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text)]">Classical BPHS / Phaladeepika Ruling:</strong>{' '}
                    {card.classicalBphsRuling}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[var(--text-muted)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onInspectNakshatra(card.nakshatraIndex)}
                      className="text-[var(--accent)] font-semibold hover:underline no-print"
                    >
                      {t(
                        `Birth Star: ${card.nakshatraLabel} (Pada ${card.pada}) →`,
                        `नक्षत्र: ${card.nakshatraLabel} (चरण ${card.pada}) →`
                      )}
                    </button>
                    <span>
                      D9: <strong>{card.d9SignLabel}</strong> • D10:{' '}
                      <strong>{card.d10SignLabel}</strong> • D24 ({t('Vidya', 'विद्या')}):{' '}
                      <strong>{card.d24SignLabel}</strong>
                    </span>
                  </div>
                  {lang === 'en' && (
                    <span className="italic">Soul lesson: {card.growthLesson}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== CHAPTER 7: BIRTH STAR (JANMA NAKSHATRA) DEEP DIVE ==================== */}
      {isFull && (
        <section id="rep-birthstar" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--accent)]">
                {t('Chapter 7 • Lunar Mansion Treatise', 'अध्याय ७ • जन्म नक्षत्र विशेष अध्ययन')}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                {t(
                  `Your Birth Star Deep Dive: ${birthNak.name} (Pada ${moonPlanet.nakshatraPada})`,
                  `तपाईंको जन्म नक्षत्र विशेष अध्ययन: ${trNakshatra(birthNak.name, 'ne')} (चरण ${moonPlanet.nakshatraPada})`
                )}
              </h2>
              <p className="text-base text-[var(--text-secondary)]">
                {t('Ruled by', 'नक्षत्र स्वामी:')} <strong>{trPlanet(birthNak.ruler, lang)}</strong> •{' '}
                {t('Presiding Deity:', 'अधिष्ठातृ देवता:')} <strong>{birthNak.deity}</strong> •{' '}
                {t('Symbol:', 'प्रतीक:')} <strong>{birthNak.symbol}</strong> •{' '}
                {t('Shakti Power:', 'निहित शक्ति:')} <strong>{birthNak.shaktiTranslation}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onInspectNakshatra(moonPlanet.nakshatraIndex)}
              className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5 no-print"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('Open Full 28-Star Codex', '२८ नक्षत्र विश्वकोश खोल्नुहोस्')}</span>
            </button>
          </div>

          <div className="space-y-4 text-base leading-relaxed">
            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t('Inner Nature & Emotional Style', 'आन्तरिक स्वभाव र भावनात्मक शैली')}
              </h3>
              <p className="text-[var(--text-secondary)]">{birthNak.moonPortrait}</p>
            </div>

            <div className="obs-panel p-5 space-y-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                {t(
                  `Your Exact Quarter — Pada ${birthPadaObj.pada} (${birthPadaObj.navamshaSign} Navamsha, Sound "${birthPadaObj.bijaSound}")`,
                  `तपाईंको जन्म चरण — चरण ${birthPadaObj.pada} (${trSign(birthPadaObj.navamshaSign, 'ne')} नवांश, नामाक्षर "${birthPadaObj.bijaSound}")`
                )}
              </h3>
              <p className="text-[var(--text-secondary)]">{birthPadaObj.expression}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-5 space-y-2">
                <h3 className="text-base font-bold text-[var(--sage)]">
                  {t('Best Career & Activity Fit', 'अनुकूल पेशा र शुभ कार्यहरू')}
                </h3>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {t('Careers:', 'उपयुक्त क्षेत्र:')} {birthNak.vocations.join(' • ')}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('Favorable activities:', 'शुभ कार्य:')} {birthNak.auspiciousWorks.join(', ')}.
                </p>
              </div>

              <div className="obs-panel p-5 space-y-2">
                <h3 className="text-base font-bold text-[var(--crimson)]">
                  {t('Blind Spot & Activities to Pace Carefully', 'सजग रहनुपर्ने पक्ष र सावधानी')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">{birthNak.shadowTrap}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {t('Avoid under this star:', 'यस नक्षत्रमा वर्जित कार्य:')}{' '}
                  {birthNak.inauspiciousWorks.join(', ')}.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== CHAPTER 8: 12 LIFE AREAS & ACTIVE CLASSICAL YOGAS ==================== */}
      {isFull && (
        <section id="rep-houses" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t(
                'Chapter 8 • 337-Point Ashtakavarga & Classical Yogas',
                'अध्याय ८ • १२ जीवन-क्षेत्र (अष्टकवर्ग बल) र सक्रिय शास्त्रीय योगहरू'
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {t(
                'Your 12 Life Areas (Strength Scores) & Special Chart Combinations',
                'तपाईंका १२ भावको बल सूचकाङ्क र विशेष राजयोग / धनयोगहरू'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {t(
                'In Brihat Parashara Hora Shastra (Ch. 66), 28 points is average. 30+ points indicate effortless support; under 25 points indicates areas where steady habits beat shortcuts.',
                'वैदिक सर्वाष्टकवर्गमा २८ बिन्दु औसत मानिन्छ। ३०+ बिन्दु भएका भावमा सहज प्रगति हुन्छ भने २५ भन्दा कम बिन्दु भएका भावमा धैर्य र अनुशासनले सफलता दिन्छ।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savSortedByHouse.map((h) => {
              const guide = trHouseGuide(h.house, lang);
              const pct = Math.min(100, Math.round((h.bindus / 40) * 100));
              const barClass =
                h.bindus >= 30
                  ? 'bg-[var(--sage)]'
                  : h.bindus < 25
                  ? 'bg-[var(--crimson)]'
                  : 'bg-[var(--accent)]';
              const tone = h.bindus >= 30 ? 'optimal' : h.bindus < 25 ? 'avoid' : 'info';
              const tag =
                h.bindus >= 30
                  ? t('Strong', 'सबल')
                  : h.bindus < 25
                  ? t('Patience', 'धैर्य')
                  : t('Balanced', 'सन्तुलित');

              return (
                <div key={h.house} className="obs-panel p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-[var(--text)]">
                        {lang === 'ne' ? `भाव ${h.house}` : `H${h.house}`}: {guide.shortTitle}
                      </span>{' '}
                      <span className="text-xs text-[var(--text-muted)]">
                        ({trSign(h.signName, lang)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-bold text-sm text-[var(--text)]">
                        {h.bindus} {t('pts', 'बिन्दु')}
                      </span>
                      <StatusBadge tone={tone} label={tag} />
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {h.bindus >= 30
                      ? guide.whenStrong
                      : h.bindus < 25
                      ? guide.whenLow
                      : guide.plainDescription}
                  </p>
                </div>
              );
            })}
          </div>

          {vedicReport.yogas.length > 0 && (
            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--accent)]" />
                <span>
                  {t(
                    `Active Classical Yogas Detected in Your Chart (${vedicReport.yogas.length})`,
                    `तपाईंको कुण्डलीमा बनेका प्रमुख शास्त्रीय योगहरू (${vedicReport.yogas.length})`
                  )}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vedicReport.yogas.map((yg) => (
                  <div key={yg.name} className="obs-panel p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--text)]">{yg.name}</span>
                      <StatusBadge
                        tone={yg.strength === 'High' ? 'optimal' : 'favorable'}
                        label={`${yg.category} • ${yg.strength}`}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {yg.description}
                    </p>
                    {yg.sourceText && (
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {t('Source:', 'स्रोत:')} {yg.sourceText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saravali Ch. 15-19 Planetary Conjunction Portraits (Yuti Chemistry) */}
          {deepReport.saravaliConjunctions.length > 0 && (
            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <span>
                    {t(
                      `Planetary Conjunction Chemistry (Saravali Yuti — ${deepReport.saravaliConjunctions.length})`,
                      `एउटै भावमा बसेका ग्रहहरूको युति प्रभाव (सारावली — ${deepReport.saravaliConjunctions.length})`
                    )}
                  </span>
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t(
                    'When two or more planets share the same house, their energies blend into a single psychological and vocational signature (Kalyanavarma’s Saravali, Ch. 15–19).',
                    'दुई वा बढी ग्रह एउटै भावमा बस्दा तिनको ऊर्जा मिलेर विशेष व्यक्तित्व र कर्म शैली निर्माण हुन्छ (कल्याणवर्माकृत सारावली अ. १५–१९)।'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {deepReport.saravaliConjunctions.map((conj) => (
                  <div
                    key={`${conj.house}-${conj.planetsJoined.join('-')}`}
                    className="obs-panel p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--text)]">{conj.headline}</span>
                      <StatusBadge
                        tone="favorable"
                        label={conj.planetsJoined.join(' + ')}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {conj.laymanTakeaway}
                    </p>
                    {lang === 'en' && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-2">
                        <strong className="text-[var(--text-secondary)]">Saravali Portrait:</strong>{' '}
                        {conj.classicalPortrait}
                      </p>
                    )}
                    <div className="text-[11px] font-mono text-[var(--accent)]">
                      {conj.sourceRef}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== CHAPTER 9: AGE MILESTONES (16-48), LIVE GOCHARA TRANSITS & SUB-PERIODS ==================== */}
      <section id="rep-maturity-transits" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t(
              'Chapter 9 • Life Milestones, Live Transits & Multi-Year Roadmap',
              'अध्याय ९ • जीवनका परिपक्वता उमेर (१६–४८), प्रत्यक्ष गोचर र अन्तर्दशा समयरेखा'
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your Turning-Point Ages, Live Saturn/Jupiter Sky Weather & Sub-Periods',
              'तपाईंको भाग्योदय उमेर मोडहरू, हालको शनि/गुरु गोचर र आगामी अन्तर्दशा फल'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'Shows what is happening in the sky right now relative to your Natal Moon (Sade Sati, Guru Bala & Moorthi Nirnaya) plus the exact ages when each planet in your chart matures.',
              'तपाईंको जन्म चन्द्र राशिबाट हालको शनि (साढेसाती/ढैया), बृहस्पति गुरुबल र मूर्ति निर्णयको अवस्था तथा उमेर १६ देखि ४८ सम्मका विशेष मोडहरू।'
            )}
          </p>
        </div>

        {/* Live Slow-Planet Gochara Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="obs-panel p-5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('Live Saturn Transit (Sade Sati Check)', 'प्रत्यक्ष शनि गोचर र साढेसाती जाँच')}
              </span>
              <StatusBadge
                tone={deepReport.liveSkyAndSubPeriods.saturnTone}
                label={
                  deepReport.liveSkyAndSubPeriods.isSadeSati
                    ? t('Sade Sati Active', 'साढेसाती सक्रिय')
                    : t(
                        `Saturn in ${deepReport.liveSkyAndSubPeriods.saturnTransitSign} (H${deepReport.liveSkyAndSubPeriods.saturnHouseFromMoon} from Moon)`,
                        `शनि: ${deepReport.liveSkyAndSubPeriods.saturnTransitSign} (चन्द्रबाट ${deepReport.liveSkyAndSubPeriods.saturnHouseFromMoon})`
                      )
                }
              />
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">
              {deepReport.liveSkyAndSubPeriods.saturnPhaseHeadline}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {deepReport.liveSkyAndSubPeriods.saturnGuidance}
            </p>
          </div>

          <div className="obs-panel p-5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('Live Jupiter Transit (Guru Bala Check)', 'प्रत्यक्ष बृहस्पति गोचर र गुरुबल')}
              </span>
              <StatusBadge
                tone={deepReport.liveSkyAndSubPeriods.hasGuruBala ? 'optimal' : 'info'}
                label={
                  deepReport.liveSkyAndSubPeriods.hasGuruBala
                    ? t('Strong Guru Bala Blessing', 'प्रबल गुरुबल प्राप्त')
                    : t(
                        `Jupiter in ${deepReport.liveSkyAndSubPeriods.jupiterTransitSign}`,
                        `गुरु: ${deepReport.liveSkyAndSubPeriods.jupiterTransitSign}`
                      )
                }
              />
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">
              {deepReport.liveSkyAndSubPeriods.jupiterHeadline}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {deepReport.liveSkyAndSubPeriods.jupiterGuidance}
            </p>
          </div>
        </div>

        <div className="obs-panel p-4 space-y-1.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-[var(--text)]">
              {t('Lunar Moorthi Nirnaya:', 'गोचर मूर्ति निर्णय:')}{' '}
              <span className="text-[var(--accent)]">
                {deepReport.liveSkyAndSubPeriods.moorthiFormLabel}
              </span>
            </strong>
            <span className="text-xs text-[var(--text-muted)]">
              {deepReport.liveSkyAndSubPeriods.sourceCitation}
            </span>
          </div>
          <p className="text-[var(--text-secondary)]">
            {deepReport.liveSkyAndSubPeriods.moorthiExplanation}{' '}
            {deepReport.liveSkyAndSubPeriods.nodalTransitNote}
          </p>
        </div>

        {/* Planetary Maturity Ages (16..48) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent)]" />
            <span>
              {t(
                'Your 9 Turning-Point Ages (Graha Paripakvata — Ages 16 to 48)',
                'तपाईंका ९ ग्रह परिपक्वता उमेर र जीवन मोडहरू (उमेर १६ देखि ४८)'
              )}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {deepReport.maturityMilestones.map((ms) => (
              <div
                key={ms.planetId}
                className={`rounded-xl border p-4 space-y-1.5 ${
                  ms.status === 'ACTIVE_NOW'
                    ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--text)] tabular-nums">
                    {t(`Age ${ms.maturityAge}`, `उमेर ${ms.maturityAge}`)} ({ms.calendarYear}) •{' '}
                    {ms.planetLabel}
                  </span>
                  <StatusBadge
                    tone={
                      ms.status === 'ACTIVE_NOW'
                        ? 'optimal'
                        : ms.status === 'COMPLETED'
                        ? 'info'
                        : 'favorable'
                    }
                    label={
                      ms.status === 'ACTIVE_NOW'
                        ? t('Now', 'अहिले')
                        : ms.status === 'COMPLETED'
                        ? t('Unlocked', 'पार भइसक्यो')
                        : t('Upcoming', 'आगामी')
                    }
                  />
                </div>
                <div className="text-xs font-semibold text-[var(--accent)]">{ms.headline}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {ms.laymanMeaning}
                </p>
                {ms.conjunctionNote && (
                  <p className="text-[11px] text-[var(--amber)] font-medium">
                    {ms.conjunctionNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Mahadasha's 9 Sub-Periods (Antardashas) + Lifetime Mahadashas */}
        {isFull && (
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {t(
                  `Sub-Chapter Roadmap Inside Your Active ${vedicReport.activeMahadasha.lord} Major Chapter`,
                  `सक्रिय ${trPlanet(vedicReport.activeMahadasha.lord, 'ne')} महादशाभित्रका ९ अन्तर्दशा उप-अध्यायहरू`
                )}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t(
                  'While a Major Chapter sets the 6-to-20 year theme, these shorter Antardasha sub-periods show the exact month-to-month shifts.',
                  'महादशाले लामो कालखण्डको मूल दिशा तय गर्छ भने यी अन्तर्दशाहरूले महिना-महिना र वर्ष-वर्षको प्रत्यक्ष फलादेश देखाउँछन्।'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deepReport.liveSkyAndSubPeriods.subPeriods.map((sp) => (
                <div
                  key={`${sp.antarLordId}-${sp.startDate}`}
                  className={`rounded-xl border p-3.5 space-y-1.5 ${
                    sp.status === 'ACTIVE'
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[var(--text)]">
                      {trPlanet(vedicReport.activeMahadasha.lord, lang)} – {sp.antarLordLabel}
                    </span>
                    {sp.status === 'ACTIVE' && (
                      <StatusBadge tone="optimal" label={t('Active Now', 'हाल सक्रिय')} />
                    )}
                  </div>
                  <div className="text-xs tabular-nums text-[var(--text-muted)]">
                    {formatDisplayDate(sp.startDate, lang, true)} →{' '}
                    {formatDisplayDate(sp.endDate, lang, true)}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {sp.laymanGuidance}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-base font-bold text-[var(--text)] pt-2">
              {t(
                'Full 120-Year Vimshottari Mahadasha Sequence',
                'सम्पूूर्ण १२०-वर्षे विंशोत्तरी महादशा क्रम'
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vedicReport.dashas.map((d) => {
                const info = trDashaGuide(d.lord, lang);
                return (
                  <div
                    key={d.lord}
                    className={`p-3.5 rounded-xl border space-y-1 ${
                      d.isCurrent
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text)]">
                        {t(
                          `${d.lord} (${d.years} yrs)`,
                          `${trPlanet(d.lord, 'ne')} (${d.years} वर्ष)`
                        )}
                      </span>
                      {d.isCurrent && (
                        <StatusBadge tone="optimal" label={t('Current', 'सक्रिय')} />
                      )}
                    </div>
                    <div className="text-xs tabular-nums text-[var(--text-muted)]">
                      {d.startDate} → {d.endDate}
                    </div>
                    <div className="text-xs font-semibold text-[var(--accent)]">
                      {info.chapterTitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <LotusVineDivider
        label={t(
          'Deep Numerology, Best Dates, Remedies & Classical Sources',
          'गहन अंक विज्ञान, शुभ मिति, व्यावहारिक उपाय र शास्त्रीय ग्रन्थसूची'
        )}
      />

      {/* ==================== CHAPTER 10: DEEP NUMEROLOGY, DECISION TIMING, REMEDIES & BIBLIOGRAPHY ==================== */}
      <section id="rep-numerology-timing" className="obs-card p-5 sm:p-8 space-y-6 scroll-mt-24">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t(
                'Chapter 10 • Numerology, Decision Timing & Practical Remedies',
                'अध्याय १० • गहन अंक ज्योतिष, आगामी शुभ साइत र व्यावहारिक उपाय'
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {t(
                'Cheiro Compound Numbers, 4 Life Pinnacles, Best Dates & Daily Alignment',
                'चेइरो संयुक्त अंक, जीवनका ४ शिखर चक्र, शुभ मिति र शास्त्रीय उपायहरू'
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            {onOpenHoraiStudio && (
              <button
                type="button"
                onClick={onOpenHoraiStudio}
                className="btn-editorial-primary text-sm inline-flex items-center gap-1.5"
              >
                <span>{t('Open 24h Horai Clock', '२४-घण्टा होरा घडी खोल्नुहोस्')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenActionTiming()}
              className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('Test All 20 Actions', 'सबै २० कार्य जाँच्नुहोस्')}</span>
            </button>
          </div>
        </div>

        {/* Deep Numerology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="obs-panel p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {deepReport.deepNumerology.lifePathHeadline}
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {deepReport.deepNumerology.lifePathDeepNarrative}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] pt-1">
              <strong className="text-[var(--text)]">
                {t('Post-35 Maturity Number:', '३५ वर्षपछिको परिपक्वता अंक:')}{' '}
                {deepReport.deepNumerology.maturityNumberLabel}
              </strong>{' '}
              — {deepReport.deepNumerology.maturityNarrative}
            </p>
          </div>

          <div className="obs-panel p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {t('Cheiro Esoteric Compound Current:', 'चेइरो गुप्त संयुक्त अंक कम्पन:')}{' '}
              {deepReport.deepNumerology.compoundTitle}
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {deepReport.deepNumerology.compoundNarrative}
            </p>
            <div className="pt-1 space-y-1">
              <div className="text-xs font-bold text-[var(--text)]">
                {deepReport.deepNumerology.karmicLessonsTitle}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {deepReport.deepNumerology.karmicLessonsItems.slice(0, 2).join(' ')}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Life Pinnacles */}
        {isFull && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {deepReport.deepNumerology.pinnacleRoadmap.map((pin) => (
              <div
                key={pin.label}
                className={`rounded-xl border p-3.5 space-y-1.5 ${
                  pin.isCurrent
                    ? 'border-[var(--accent)] bg-[var(--accent-bg)]/45'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--accent)] tabular-nums">
                    {pin.ageSpan}
                  </span>
                  <StatusBadge
                    tone={pin.isCurrent ? 'optimal' : 'info'}
                    label={`#${pin.number} / Ch ${pin.challenge}`}
                  />
                </div>
                <div className="text-xs font-bold text-[var(--text)]">{pin.label}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {pin.meaning}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Today's Horai, Gowri & Nalla Neram Box */}
        <div className="obs-panel floral-banner-glow p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SacredFlowerIcon
                variety={panchangReport.activeHorai.sacredFlower.variety}
                primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                size={24}
              />
              <span className="text-base font-bold text-[var(--text)]">
                {t('Active Horai Right Now:', 'अहिलेको सक्रिय होरा:')}{' '}
                {activeHoraiDisp.horaiName} ({panchangReport.activeHorai.startTime}–
                {panchangReport.activeHorai.endTime})
              </span>
              <StatusBadge
                tone={panchangReport.activeHorai.tone}
                label={activeHoraiDisp.quality}
              />
            </div>
            <span className="text-xs tabular-nums text-[var(--text-secondary)]">
              {t('Active Gowri:', 'सक्रिय गौरी:')}{' '}
              {trGowriName(panchangReport.activeGowri.name, lang)} (
              {panchangReport.activeGowri.nature})
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong>{t('Today’s Nalla Neram (Pure Good Time):', 'आजको शुभ वेला (नल्ल नेरम):')}</strong>{' '}
            {panchangReport.nallaNeram[0].startTime}–{panchangReport.nallaNeram[0].endTime} (
            {trGowriName(panchangReport.nallaNeram[0].gowriName, lang)}) &amp;{' '}
            {panchangReport.nallaNeram[1].startTime}–{panchangReport.nallaNeram[1].endTime} (
            {trGowriName(panchangReport.nallaNeram[1].gowriName, lang)}).{' '}
            <strong>{t('Best Daytime Shubha Horais Today:', 'आज दिउँसोका सर्वोत्तम शुभ होराहरू:')}</strong>{' '}
            {panchangReport.dayHorai
              .filter((h) => ['Venus', 'Jupiter', 'Mercury'].includes(h.lord) && !h.kalamConflictNote)
              .slice(0, 4)
              .map((h) => `${trHoraiDisplay(h, lang).horaiName} (${h.startTime}–${h.endTime})`)
              .join(', ')}
            .
          </p>
        </div>

        {/* 8-Decision Upcoming Best Dates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                <th className="py-3 px-3 font-semibold">{t('Life Decision', 'जीवन निर्णय / कार्य')}</th>
                <th className="py-3 px-3 font-semibold">{t('Today’s Score', 'आजको अंक')}</th>
                <th className="py-3 px-3 font-semibold">
                  {t('Best Date in Next 12 Days', 'आगामी १२ दिनको सर्वोत्तम मिति')}
                </th>
                <th className="py-3 px-3 font-semibold text-right no-print">
                  {t('Explore', 'विस्तृत')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {actionTimingRows.map((row) => (
                <tr key={row.action.id} className="hover:bg-[var(--bg-elevated)]/60">
                  <td className="py-3.5 px-3 font-semibold text-[var(--text)]">
                    {trActionTitle(row.action.id, row.action.title, lang)}
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
                      label={t(`${row.todayScore}/100 Today`, `आज ${row.todayScore}/100`)}
                    />
                  </td>
                  <td className="py-3.5 px-3 tabular-nums text-[var(--text-secondary)]">
                    {row.bestNext ? (
                      <span>
                        <strong className="text-[var(--text)]">
                          {formatDisplayDate(row.bestNext.dateStr, lang, true)}
                        </strong>{' '}
                        ({row.bestNext.score}/100 • {trNakshatra(row.bestNext.nakshatraName, lang)})
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right no-print">
                    <button
                      type="button"
                      onClick={() => onOpenActionTiming(row.action.id)}
                      className="text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t('Details', 'विवरण')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Personalized Parashari Upaya, Safe Gemstones & Vastu Architecture */}
        {isFull && (
          <div className="pt-4 border-t border-[var(--border)] space-y-5">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--accent)]">
                {t(
                  'Personalized Upaya Architecture • Safe Trikona Gems, Sattvic Dana & Vastu',
                  'व्यक्तिगत शास्त्रीय उपाय • सुरक्षित त्रिकोण रत्न, सात्त्विक दान र वास्तु दिशा'
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text)]">
                {t(
                  'Lagna-Safe Gemstones (1st/5th/9th Lords), Zero-Cost Charity & Vastu Compass',
                  'लग्न-अनुकूल सुरक्षित रत्न (१/५/९ स्वामी), नि:शुल्क सात्त्विक दान र वास्तु कम्पास'
                )}
              </h3>
            </div>

            {/* 3 Trikona-Safe Gemstone & Upa-Ratna Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {deepReport.upayaArchitecture.trikonaSafeGems.map((gem) => (
                <div key={gem.houseRoleLabel} className="obs-panel p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[var(--accent)]">
                      {gem.houseRoleLabel}
                    </span>
                    <StatusBadge tone="optimal" label={gem.planetLabel} />
                  </div>
                  <div className="text-sm font-bold text-[var(--text)]">{gem.primaryGem}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <strong>{t('Budget / Gentle Alternative:', 'सरल उप-रत्न:')}</strong>{' '}
                    {gem.affordableUpaRatna}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {gem.metalAndFinger} • {gem.wearingWindow}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-2">
                    {gem.whySafeExplanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Explicit Dusthana Gemstone Safeguard */}
            <div className="rounded-xl bg-[var(--amber-bg)] border border-[var(--amber)]/35 p-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {deepReport.upayaArchitecture.avoidGemPlanetsWarning}
            </div>

            {/* Zero-Cost Sattvic Dana + Weakest SAV Habit + Brihat Samhita Vastu Compass */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-sm font-bold text-[var(--text)]">
                  {deepReport.upayaArchitecture.activeDashaCharityTitle}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.upayaArchitecture.activeDashaCharityAction}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-sm font-bold text-[var(--text)]">
                  {deepReport.upayaArchitecture.weakestHouseHabitTitle}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.upayaArchitecture.weakestHouseHabitAction}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                  {t('Brihat Samhita Ch. 53 • Desk & Deep-Work Facing', 'बृहत् संहिता अ. ५३ • कार्य र अध्ययन दिशा')}
                </div>
                <div className="text-sm font-bold text-[var(--text)]">
                  {deepReport.upayaArchitecture.vastuDeskDirection}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.upayaArchitecture.vastuDeskWhy}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                  {t('Vastu & Biomagnetic Rest • Sleep Head Direction', 'वास्तु निद्रा नियम • सुत्दा शिर राख्ने दिशा')}
                </div>
                <div className="text-sm font-bold text-[var(--text)]">
                  {deepReport.upayaArchitecture.vastuSleepHeadDirection}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {deepReport.upayaArchitecture.vastuSleepWhy}
                </p>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] italic">
              {deepReport.upayaArchitecture.sourceCitation}
            </div>
          </div>
        )}

        {/* Grounded Remedies Box */}
        <div className="p-5 rounded-xl bg-[var(--sage-bg)] border border-[var(--sage)]/30 space-y-3">
          <h3 className="text-lg font-bold text-[var(--sage)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              {t(
                'Simple, Practical Daily Alignment & Classical Remedies (Upaya)',
                'सरल दैनिक जीवनशैली र शास्त्रीय उपायहरू (उपाय)'
              )}
            </span>
          </h3>
          <ul className="space-y-2 text-base text-[var(--text-secondary)] list-disc pl-5 leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">
                {t('Daily Timing Habit:', 'दैनिक शुभ समय अभ्यास:')}
              </strong>{' '}
              {t(
                'Schedule key calls, contracts, and launches inside',
                'महत्त्वपूर्ण संवाद, सम्झौता र शुभ कार्य यस समयभित्र गर्नुहोस्:'
              )}{' '}
              <strong>{synthesisReport.bestWindowToday}</strong>.
            </li>
            <li>
              <strong className="text-[var(--text)]">
                {t(
                  `Birth Star Grounding (${birthNak.name}):`,
                  `जन्म नक्षत्र सन्तुलन (${trNakshatra(birthNak.name, 'ne')}):`
                )}
              </strong>{' '}
              {birthNak.behavioralUpaya} ({t('Sacred tree:', 'पवित्र वृक्ष:')} {birthNak.sacredTree}).
            </li>
            <li>
              <strong className="text-[var(--text)]">
                {t('Ayurvedic Daily Reset:', 'आयुर्वेदिक दैनिक सन्तुलन:')}
              </strong>{' '}
              {deepReport.wellnessBlueprint.foodAndHydrationTip}
            </li>
            <li>
              <strong className="text-[var(--text)]">
                {t('Classical Mantra Support:', 'शास्त्रीय वैदिक मन्त्र:')}
              </strong>{' '}
              <span className="text-sm font-medium">{birthNak.vedicMantra}</span>
            </li>
          </ul>
        </div>

        {/* Authoritative Classical & Modern Book Bibliography */}
        {isFull && (
          <div id="rep-sources" className="pt-4 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="text-lg font-bold text-[var(--text)]">
                {t(
                  'Classical & Scholarly Source Lineage Behind Your Dossier',
                  'यस प्रतिवेदनमा प्रयोग गरिएका प्रामाणिक शास्त्रीय तथा आधुनिक ग्रन्थहरू'
                )}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deepReport.bibliography.map((bk) => (
                <div
                  key={bk.id}
                  className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 space-y-1"
                >
                  <div className="text-sm font-bold text-[var(--text)]">{bk.title}</div>
                  <div className="text-xs text-[var(--accent)] font-medium">{bk.authorAndEra}</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'ne' ? bk.usedForNe : bk.usedForEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Download CTA */}
        <div className="obs-panel p-5 flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <div className="text-base font-bold text-[var(--text)]">
              {t(
                'Save or share your complete 10-section Personal Life Dossier (.PDF)',
                'यो सम्पूर्ण १०-खण्ड व्यक्तिगत जीवन प्रतिवेदन PDF मा सुरक्षित वा प्रिन्ट गर्नुहोस्'
              )}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {t(
                'Vector A4 layout with D1/D9 Kundali diagrams, Career & Indu Lagna Wealth, Spouse Portrait, Ayurveda, Age 16–48 Milestones, Transits & Numerology.',
                'भेक्टर कुण्डली चार्ट, करियर, इन्दु लग्न धन योग, जीवनसाथी, आयुर्वेद, उमेर मोड र अंक ज्योतिष समावेश।'
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={pdfBusy !== 'NONE'}
              onClick={handleDownloadPdf}
              className="btn-editorial-primary inline-flex items-center gap-2 text-sm px-5"
            >
              <Download className="w-4 h-4" />
              <span>
                {pdfBusy === 'DOWNLOAD'
                  ? t('Building PDF…', 'PDF बन्दैछ…')
                  : t('Download Full PDF Dossier', 'विस्तृत PDF रिपोर्ट डाउनलोड')}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePrintPage}
              className="btn-editorial-secondary inline-flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('Print / Save Page', 'पृष्ठ प्रिन्ट / सेभ')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
