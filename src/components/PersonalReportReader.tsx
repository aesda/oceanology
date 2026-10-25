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
  buildLocalizedPersonalSummary,
  formatCityForLang,
  formatCountryForLang,
  trActionTitle,
  trDashaGuide,
  trGowriName,
  trHoraiDisplay,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trPlanetRole,
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
import { StatusBadge } from './ui/DashboardPrimitives';
import {
  BloomingLotusMandala,
  LotusVineDivider,
  SacredFlowerIcon,
} from './ui/FloralAnimations';

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
          'Opened full multi-page PDF report in a new tab.',
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-bloom-in">
      {/* ==================== TOP DOSSIER HERO & PDF EXPORT CARD ==================== */}
      <section className="obs-card floral-banner-glow p-6 sm:p-8 space-y-6 border-t-4 border-t-[var(--accent)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 opacity-25">
          <BloomingLotusMandala size={280} />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-bg)] text-[var(--accent)] text-xs sm:text-sm font-semibold border border-[var(--accent)]/20">
              <SacredFlowerIcon variety="lotus" primaryHex="#EC4899" secondaryHex="#FDE68A" size={17} />
              <span>
                {t(
                  'Easy-to-Read Personal Horoscope & Multi-Page PDF Dossier',
                  'सरल व्यक्तिगत जन्म कुण्डली फलादेश र बहु-पृष्ठ PDF रिपोर्ट'
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight leading-tight">
              {profile.firstName} {profile.middleName} {profile.lastName}
            </h1>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed tabular-nums">
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
                  {countryDisplay} (वि.सं. {bsBirth.formattedNp})
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
                  (Nepali B.S. {bsBirth.formattedEn})
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="btn-editorial-secondary inline-flex items-center gap-2 text-sm no-print"
          >
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <span>{t('Change Birth Details', 'जन्म विवरण सच्याउनुहोस्')}</span>
          </button>
        </div>

        {/* Prominent PDF Export Action Box */}
        <div className="obs-panel p-5 space-y-4 no-print">
          <div className="space-y-1">
            <div className="text-base font-bold text-[var(--text)]">
              {t(
                'Want a clean printable copy with all charts, tables & explanations?',
                'सबै कुण्डली चार्ट, तालिका र व्याख्यासहित प्रिन्ट वा PDF सेभ गर्न चाहनुहुन्छ?'
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {t(
                'Generates an 8-section vector PDF including your D1 & D9 Kundali diagrams, plain-English reading, planetary table, 12-house strengths, Dasha dates, and upcoming best days.',
                'लग्न र नवांश (D1/D9) कुण्डली चार्ट, ग्रह तालिका, १२ भावको बल, विंशोत्तरी दशा र शुभ मितिहरूसहित पूर्ण रिपोर्ट डाउनलोड वा प्रिन्ट गर्नुहोस्।'
              )}
            </p>
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
                  : t('Download Full PDF (.pdf)', 'पूर्ण PDF डाउनलोड (.pdf)')}
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
                  : t('View PDF in Browser', 'ब्राउजरमा PDF हेर्नुहोस्')}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintPage}
              className="btn-editorial-secondary inline-flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('Print Page', 'यो पृष्ठ प्रिन्ट / सेभ')}</span>
            </button>
          </div>
        </div>

        {pdfStatusMsg && (
          <div className="px-4 py-3 rounded-lg bg-[var(--sage-bg)] border border-[var(--sage)]/30 text-[var(--sage)] text-sm font-medium flex items-center gap-2 no-print">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pdfStatusMsg}</span>
          </div>
        )}

        {/* Quick Chapter Jump Links */}
        <nav
          aria-label="Report chapters"
          className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)] text-sm no-print"
        >
          {[
            { href: '#rep-takeaways', label: t('1. Key Takeaways', '१. मुख्य सारांश') },
            { href: '#rep-plain-reading', label: t('2. Plain-English Reading', '२. सरल फलादेश') },
            { href: '#rep-charts', label: t('3. Kundali & Natal Charts', '३. कुण्डली चार्टहरू') },
            { href: '#rep-planets', label: t('4. Your 9 Planets', '४. नवग्रह फल') },
            { href: '#rep-birthstar', label: t('5. Birth Star Guide', '५. जन्म नक्षत्र') },
            { href: '#rep-houses-dasha', label: t('6. Life Areas & Timeline', '६. १२ भाव र दशा') },
            { href: '#rep-timing', label: t('7. Best Dates & Remedies', '७. शुभ मिति र उपाय') },
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
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 1', 'अध्याय १')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your Chart at a Glance — 5 Key Takeaways',
              'एकै नजरमा तपाईंको कुण्डली — ५ मुख्य निष्कर्ष'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'If you only read one box today, start here. Every point translates your astronomical birth chart into clear everyday guidance.',
              'तपाईंको खगोलीय जन्म कुण्डलीका सबैभन्दा महत्त्वपूर्ण ५ आधारहरूलाई यहाँ सरल दैनिक मार्गदर्शनमा प्रस्तुत गरिएको छ।'
            )}
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

      {/* ==================== CHAPTER 2: PLAIN-LANGUAGE PERSONAL READING ==================== */}
      <section id="rep-plain-reading" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 2', 'अध्याय २')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {plainSummary.greetingHeadline}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'No Sanskrit dictionary needed—here is how your Rising sign, Sun, Moon, Birth Star, and active life cycle work together in plain language.',
              'जटिल शब्दावली बिना नै तपाईंको लग्न, सूर्य, चन्द्र राशि, जन्म नक्षत्र र हालको महादशाले जीवनमा पार्ने प्रभाव सरल भाषामा बुझ्नुहोस्।'
            )}
          </p>
        </div>

        <div className="space-y-5 text-base sm:text-[17px] leading-[1.75] text-[var(--text)]">
          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--accent)]" />
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
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
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
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
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

      {/* ==================== CHAPTER 3: VISUAL KUNDALI & NATAL WHEEL ==================== */}
      <section id="rep-charts" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 3', 'अध्याय ३')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your Visual Birth Charts (Vedic Kundali & Ecliptic Wheel)',
              'तपाईंको दृश्य जन्म कुण्डली र ३६०° ग्रह चक्र'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'Left: Your Vedic Divisional Kundali (switch between D1 Root Life Chart and D9 Marriage & Soul Chart). Right: Your 360° Astronomical Sky Wheel.',
              'बायाँ: तपाईंको वैदिक वर्ग कुण्डली (D1 जन्म लग्न र D9 नवांश कुण्डली)। दायाँ: ३६०° खगोलीय राशि चक्र।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="obs-panel p-4 space-y-3">
            <h3 className="text-base font-bold text-[var(--text)]">
              {t('Vedic Kundali (D1 Rashi & D9 Navamsha)', 'वैदिक कुण्डली (D1 लग्न र D9 नवांश)')}
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
      </section>

      {/* ==================== CHAPTER 4: YOUR PLANETS EXPLAINED SIMPLY ==================== */}
      <section id="rep-planets" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 4', 'अध्याय ४')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your Planets & What Each Placement Means for You',
              'तपाईंका नवग्रह र प्रत्येक ग्रह स्थितिको सरल अर्थ'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {t(
              'Each planet governs a specific part of human life—confidence, emotions, drive, intellect, growth, love, and discipline. Here is where each sits in your chart.',
              'प्रत्येक ग्रहले आत्मबल, मन, साहस, बुद्धि, ज्ञान, प्रेम वा अनुशासनको प्रतिनिधित्व गर्छ। तपाईंको कुण्डलीमा ती ग्रहहरूको स्थान र फल यसप्रकार छ।'
            )}
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
              const houseInfo = trHouseGuide(p.house, lang);
              const role = trPlanetRole(baseId, lang);
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
                          {lang === 'ne'
                            ? `${trPlanet(baseId, 'ne')} — ${trSign(p.signName, 'ne')} राशिमा (${p.formattedDMS})`
                            : `${shortName} in ${p.signName} (${p.formattedDMS})`}
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
                        label={
                          lang === 'ne'
                            ? `भाव ${p.house}: ${houseInfo.shortTitle}`
                            : `House ${p.house}: ${houseInfo.shortTitle}`
                        }
                      />
                      {p.isRetrograde && (
                        <StatusBadge
                          size="md"
                          tone="mixed"
                          label={t('Retrograde (Inward)', 'वक्री (अन्तर्मुखी बल)')}
                        />
                      )}
                    </div>
                  </div>

                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'ne' ? (
                      <>
                        यो ग्रह <strong className="text-[var(--text)]">भाव {p.house}</strong> (
                        {houseInfo.lifeAreas}) र{' '}
                        <button
                          type="button"
                          onClick={() => onInspectNakshatra(p.nakshatraIndex)}
                          className="text-[var(--accent)] font-semibold hover:underline"
                        >
                          {trNakshatra(p.nakshatraName, 'ne')} नक्षत्र, चरण {p.nakshatraPada}
                        </button>{' '}
                        मा अवस्थित छ। {houseInfo.plainDescription}
                      </>
                    ) : (
                      <>
                        Placed in <strong className="text-[var(--text)]">House {p.house}</strong> (
                        {houseInfo.lifeAreas.toLowerCase()}) and{' '}
                        <button
                          type="button"
                          onClick={() => onInspectNakshatra(p.nakshatraIndex)}
                          className="text-[var(--accent)] font-semibold hover:underline"
                        >
                          {p.nakshatraName} Star, Pada {p.nakshatraPada}
                        </button>
                        . {houseInfo.plainDescription}{' '}
                        {treatise ? `Growth lesson: ${treatise.vedicSoulLesson}` : ''}
                      </>
                    )}
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
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t('Chapter 5', 'अध्याय ५')}
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
              {t('Temperament:', 'स्वभाव समूह:')} <strong>{birthNak.natureGroup}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onInspectNakshatra(moonPlanet.nakshatraIndex)}
            className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
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
                `Your Exact Quarter — Pada ${birthPadaObj.pada} (${birthPadaObj.navamshaSign} Navamsha)`,
                `तपाईंको जन्म चरण — चरण ${birthPadaObj.pada} (${trSign(birthPadaObj.navamshaSign, 'ne')} नवांश)`
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

      {/* ==================== CHAPTER 6: 12 LIFE AREAS & UPCOMING TIMELINE ==================== */}
      <section id="rep-houses-dasha" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[var(--accent)]">
            {t('Chapter 6', 'अध्याय ६')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {t(
              'Your 12 Life Areas (Strength Scores) & Multi-Year Chapters',
              'तपाईंका १२ जीवन-क्षेत्र (भाव बल अंक) र महादशा कालखण्ड'
            )}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {lang === 'ne' ? (
              <>
                वैदिक सर्वाष्टकवर्गमा <strong>२८ बिन्दु</strong> औसत मानिन्छ।{' '}
                <strong className="text-[var(--sage)]">३०+ बिन्दु</strong> भएका भावहरूमा सहज सफलता मिल्छ
                भने <strong className="text-[var(--crimson)]">२५ भन्दा कम</strong> बिन्दु भएका भावमा धैर्य र
                निरन्तर अनुशासन आवश्यक पर्छ।
              </>
            ) : (
              <>
                In Vedic Ashtakavarga, <strong>28 points</strong> is average. Scores of{' '}
                <strong className="text-[var(--sage)]">30+</strong> mean easier natural support; scores
                below <strong className="text-[var(--crimson)]">25</strong> ask for steady discipline.
              </>
            )}
          </p>
        </div>

        <div className="space-y-3">
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
                ? t('Strong Tailwind', 'बलियो सहयोग')
                : h.bindus < 25
                ? t('Needs Patience', 'धैर्य आवश्यक')
                : t('Balanced', 'सन्तुलित');

            return (
              <div key={h.house} className="obs-panel p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-[var(--text)]">
                      {lang === 'ne' ? `भाव ${h.house}` : `House ${h.house}`}: {guide.shortTitle}
                    </span>{' '}
                    <span className="text-sm text-[var(--text-muted)]">
                      ({trSign(h.signName, lang)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[var(--text)]">
                      {h.bindus} {t('pts', 'बिन्दु')}
                    </span>
                    <StatusBadge tone={tone} label={tag} />
                  </div>
                </div>

                <div className="h-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                  <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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

        {/* Lifetime Major Chapters Summary */}
        <div className="pt-4 border-t border-[var(--border)] space-y-4">
          <h3 className="text-lg font-bold text-[var(--text)]">
            {t(
              'Your Major Life Chapters (Vimshottari Mahadashas)',
              'तपाईंको जीवनका प्रमुख महादशा अध्यायहरू (विंशोत्तरी दशा)'
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vedicReport.dashas.map((d) => {
              const info = trDashaGuide(d.lord, lang);
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
                      {t(
                        `${d.lord} Chapter (${d.years} yrs)`,
                        `${trPlanet(d.lord, 'ne')} महादशा (${d.years} वर्ष)`
                      )}
                    </span>
                    {d.isCurrent && (
                      <StatusBadge tone="optimal" label={t('Active Now', 'हाल सक्रिय')} />
                    )}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    {d.startDate} → {d.endDate}
                  </div>
                  <div className="text-sm font-semibold text-[var(--accent)]">
                    {info.chapterTitle}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {info.bestFocus}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LotusVineDivider
        label={t('Daily Horai, Best Dates & Remedies', 'दैनिक होरा समय, शुभ मिति र व्यावहारिक उपाय')}
      />

      {/* ==================== CHAPTER 7: DECISION TIMING & PRACTICAL REMEDIES ==================== */}
      <section id="rep-timing" className="obs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accent)]">
              {t('Chapter 7', 'अध्याय ७')}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {t(
                'Today’s Horai Time, Best Upcoming Dates & Practical Remedies',
                'आजको होरा समय, आगामी सर्वोत्तम मिति र सरल शास्त्रीय उपाय'
              )}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">
              {lang === 'ne' ? (
                <>
                  तपाईंको जन्म नक्षत्र ({trNakshatra(moonPlanet.nakshatraName, 'ne')}) र{' '}
                  {cityDisplay} को स्थानीय पञ्चाङ्ग अनुसार तयार पारिएको तालिका।{' '}
                  <strong>७०+ अंक</strong> भएका दिनहरू सर्वोत्तम शुभ मानिन्छन्।
                </>
              ) : (
                <>
                  Personalized for {cityDisplay} using your Birth Star ({moonPlanet.nakshatraName}).
                  Scores of <strong>70+</strong> mark strong green-light windows.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* Today's Horai, Gowri & Nalla Neram Box */}
        <div className="obs-panel floral-banner-glow p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <SacredFlowerIcon
                variety={panchangReport.activeHorai.sacredFlower.variety}
                primaryHex={panchangReport.activeHorai.sacredFlower.primaryHex}
                secondaryHex={panchangReport.activeHorai.sacredFlower.secondaryHex}
                size={26}
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
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {t('Active Gowri:', 'सक्रिय गौरी:')}{' '}
              {trGowriName(panchangReport.activeGowri.name, lang)} (
              {panchangReport.activeGowri.nature})
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--border-strong)] text-[var(--text-secondary)]">
                <th className="py-3 px-3 font-semibold">{t('Life Decision', 'जीवन निर्णय / कार्य')}</th>
                <th className="py-3 px-3 font-semibold">{t('Today’s Score', 'आजको अंक')}</th>
                <th className="py-3 px-3 font-semibold">
                  {t('Best Date in Next 12 Days', 'आगामी १२ दिनको सर्वोत्तम मिति')}
                </th>
                <th className="py-3 px-3 font-semibold text-right">{t('Explore', 'विस्तृत')}</th>
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
                  <td className="py-3.5 px-3 font-mono text-[var(--text-secondary)]">
                    {row.bestNext ? (
                      <span>
                        <strong className="text-[var(--text)]">{row.bestNext.dateStr}</strong> (
                        {row.bestNext.score}/100 •{' '}
                        {trNakshatra(row.bestNext.nakshatraName, lang)})
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
                      <span>{t('Details', 'विवरण')}</span>
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
            <span>
              {t(
                'Simple, Practical Daily Alignment & Classical Remedies',
                'सरल दैनिक जीवनशैली र शास्त्रीय उपायहरू'
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
                {t('Classical Mantra Support:', 'शास्त्रीय वैदिक मन्त्र:')}
              </strong>{' '}
              <span className="font-mono text-sm">{birthNak.vedicMantra}</span>
            </li>
          </ul>
        </div>

        {/* Bottom Download CTA */}
        <div className="obs-panel p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-base font-bold text-[var(--text)]">
              {t(
                'Save or share this complete report as a PDF',
                'यो सम्पूर्ण व्यक्तिगत रिपोर्ट PDF मा सुरक्षित वा प्रिन्ट गर्नुहोस्'
              )}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {t(
                'Includes full planetary degree tables, 12-year forecast, numerology profile, and vector Kundali charts.',
                'पूर्ण ग्रह स्पष्ट तालिका, १२-वर्षे पूर्वानुमान, अंक ज्योतिष र भेक्टर कुण्डली चार्ट समावेश।'
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
                  : t('Download Detailed PDF Report', 'विस्तृत PDF रिपोर्ट डाउनलोड')}
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
