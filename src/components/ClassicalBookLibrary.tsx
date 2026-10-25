import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Compass,
  Shield,
  HeartPulse,
  ScrollText,
  ArrowUpRight,
  Trees,
} from 'lucide-react';
import { NatalChartResult, ZODIAC_SIGNS } from '../engines/astronomyEngine';
import { VedicReport } from '../engines/vedicEngine';
import { HOUSE_TREATISES, PLANET_TREATISES } from '../data/classicalCompendium';
import { CLASSICAL_CANON_BOOKS, PLANET_IN_BHAVA_RULINGS } from '../data/canonAnthology';
import { STANDARD_27_NAKSHATRAS } from '../data/nakshatraCodex';
import {
  buildPersonalizedUpayaArchitecture,
  computePlanetVitalityMap,
  detectSaravaliConjunctions,
} from '../data/shadbalaVargaAndUpayaCodex';
import { SegmentedTabs, StatusBadge, WorkspacePageHeader } from './ui/DashboardPrimitives';
import {
  trDignity,
  trHouseGuide,
  trNakshatra,
  trPlanet,
  trSign,
  useLanguage,
} from '../i18n/i18n';

interface Props {
  chart: NatalChartResult;
  vedic: VedicReport;
  initialBookId?: string;
  onInspectNakshatra?: (nakIdx: number) => void;
}

type ReadingMode = 'PLANETS' | 'YOGAS_REMEDIES' | 'HOUSES' | 'CANON_BOOKS';

export const ClassicalBookLibrary: React.FC<Props> = ({
  chart,
  vedic,
  initialBookId,
  onInspectNakshatra,
}) => {
  const { lang, t } = useLanguage();
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    initialBookId ? 'CANON_BOOKS' : 'PLANETS'
  );
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialBookId || CLASSICAL_CANON_BOOKS[0].id
  );
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('Sun');
  const [selectedHouseNum, setSelectedHouseNum] = useState<number>(1);

  useEffect(() => {
    if (initialBookId) {
      setSelectedBookId(initialBookId);
      setReadingMode('CANON_BOOKS');
    }
  }, [initialBookId]);

  const activeBook =
    CLASSICAL_CANON_BOOKS.find((b) => b.id === selectedBookId) || CLASSICAL_CANON_BOOKS[0];

  const activePlanet = chart.planets.find((p) => p.id === selectedPlanetId) || chart.planets[0];
  const treatise = PLANET_TREATISES[activePlanet.id] || PLANET_TREATISES.Sun;
  const planetHouseTreatise = HOUSE_TREATISES[activePlanet.house] || HOUSE_TREATISES[1];
  const exactBhavaRuling = PLANET_IN_BHAVA_RULINGS[activePlanet.id]?.[activePlanet.house];
  const activePlanetNak =
    STANDARD_27_NAKSHATRAS[activePlanet.nakshatraIndex] || STANDARD_27_NAKSHATRAS[0];

  const activeHouseCusp = chart.houses.find((h) => h.house === selectedHouseNum) || chart.houses[0];
  const activeHouseTreatise = HOUSE_TREATISES[selectedHouseNum] || HOUSE_TREATISES[1];
  const planetsInSelectedHouse = chart.planets.filter((p) => p.house === selectedHouseNum);

  const moonPlanet = chart.planets.find((p) => p.id === 'Moon') || chart.planets[0];
  const janmaNakTreatise =
    STANDARD_27_NAKSHATRAS[moonPlanet.nakshatraIndex] || STANDARD_27_NAKSHATRAS[0];

  const sunPlanet = chart.planets.find((p) => p.id === 'Sun') || chart.planets[0];
  const approxBirthHour = [7, 8, 9, 10, 11, 12].includes(sunPlanet.house) ? 12 : 22;
  const lowestSav = React.useMemo(
    () =>
      [...vedic.sarvashtakavarga].sort((a, b) => a.bindus - b.bindus)[0] || {
        house: 6,
        signName: 'Virgo',
        bindus: 24,
      },
    [vedic.sarvashtakavarga]
  );

  const planetVitalityMap = React.useMemo(
    () => computePlanetVitalityMap(chart, vedic.divisionalTable, approxBirthHour, lang),
    [chart, vedic.divisionalTable, approxBirthHour, lang]
  );
  const saravaliList = React.useMemo(
    () => detectSaravaliConjunctions(chart, lang),
    [chart, lang]
  );
  const upayaArch = React.useMemo(
    () =>
      buildPersonalizedUpayaArchitecture(
        chart,
        vedic.activeMahadasha.lord,
        lowestSav,
        lang
      ),
    [chart, vedic.activeMahadasha.lord, lowestSav, lang]
  );
  const activePlanetVit = planetVitalityMap[activePlanet.id];

  const getBookLiveConcordance = (bookId: string): string => {
    const ak = vedic.charaKarakas.find((c) => c.karakaCode === 'AK');
    const dk = vedic.charaKarakas.find((c) => c.karakaCode === 'DK');
    const ascDiv = vedic.divisionalTable.find((d) => d.planetId === 'Asc');
    const topSav = [...vedic.sarvashtakavarga].sort((a, b) => b.bindus - a.bindus)[0];
    const ascElement = ZODIAC_SIGNS[chart.ascendant.signIndex]?.element || 'Fire';
    const moonElement = ZODIAC_SIGNS[moonPlanet.signIndex]?.element || 'Water';
    switch (bookId) {
      case 'taittiriya-brahmana':
        return t(
          `Your Janma Nakshatra is ${janmaNakTreatise.name} (Pada ${moonPlanet.nakshatraPada}), ruled by Vedic Deity ${janmaNakTreatise.deity} and infused with "${janmaNakTreatise.shaktiName}" (${janmaNakTreatise.shaktiTranslation}).`,
          `तपाईंको जन्म नक्षत्र ${trNakshatra(janmaNakTreatise.name, 'ne')} (चरण ${moonPlanet.nakshatraPada}) हो, जसका वैदिक देवता ${janmaNakTreatise.deity} र शक्ति "${janmaNakTreatise.shaktiName}" हुन्।`
        );
      case 'bphs':
        return t(
          `Your Ascendant is ${chart.ascendant.signName} and your active Vimshottari chapter is ${vedic.activeMahadasha.lord}–${vedic.activeAntardasha.lord} (${vedic.activeMahadasha.progressPercent}% complete). Safe Trikona gemstones for your Lagna belong to ${upayaArch.trikonaSafeGems.map((g) => g.planetLabel).join(', ')}.`,
          `तपाईंको जन्म लग्न ${trSign(chart.ascendant.signName, 'ne')} हो र हाल ${trPlanet(vedic.activeMahadasha.lord, 'ne')}–${trPlanet(vedic.activeAntardasha.lord, 'ne')} दशा (${vedic.activeMahadasha.progressPercent}% पूरा) चलिरहेको छ।`
        );
      case 'muhurta-chintamani':
        return t(
          `Anchored to your natal ${moonPlanet.signName} Moon (${janmaNakTreatise.name}), auspicious Muhurta & Dashakoota matchmaking evaluate Tarabala, Chandrabala, Rajju, and Nakshatra Vedha directly from Star #${moonPlanet.nakshatraIndex + 1}.`,
          `तपाईंको ${trSign(moonPlanet.signName, 'ne')} चन्द्र राशि र ${trNakshatra(janmaNakTreatise.name, 'ne')} नक्षत्रका आधारमा ताराबल, चन्द्रबल, रज्जु र वेध शुभ मुहूर्त गणना गरिन्छ।`
        );
      case 'brihat-jataka-samhita':
        return t(
          `Varahamihira’s Vastu & Hora synthesis recommends facing ${upayaArch.vastuDeskDirection} for deep work and placing your head ${upayaArch.vastuSleepHeadDirection} during sleep.`,
          `वराहमिहिरको सिद्धान्त अनुसार अध्ययन/कार्यका लागि ${upayaArch.vastuDeskDirection} र निद्राका लागि ${upayaArch.vastuSleepHeadDirection} उत्तम मानिन्छ।`
        );
      case 'phaladeepika':
      case 'raman-300':
        return t(
          `Classical Yoga scanner detected ${vedic.yogas.length} notable combinations in your chart${vedic.yogas[0] ? ` (led by ${vedic.yogas[0].name})` : ''}, supported by House ${topSav?.house ?? 1} (${topSav?.bindus ?? 28} SAV Bindus).`,
          `शास्त्रीय योग इन्जिनले तपाईंको कुण्डलीमा ${vedic.yogas.length} प्रमुख योग र सर्वोच्च बली भाव ${topSav?.house ?? 1} (${topSav?.bindus ?? 28} बिन्दु) पहिचान गरेको छ।`
        );
      case 'kp-readers': {
        const kpAsc = vedic.kpPlanets.find((k) => k.label === 'Ascendant') || vedic.kpPlanets[0];
        const kp10 = vedic.kpPlanets.find((k) => k.label === 'MC (10th)') || vedic.kpPlanets[0];
        return t(
          `In Krishnamurti Paddhati, your Ascendant Sub-Lord is ${kpAsc?.subLord ?? 'Mercury'} (Star: ${kpAsc?.starLord ?? 'Moon'}) and your 10th Cusp Career Sub-Lord is ${kp10?.subLord ?? 'Jupiter'}.`,
          `कृष्णमूर्ति पद्धति अनुसार तपाईंको लग्न उप-स्वामी ${trPlanet(kpAsc?.subLord ?? 'Mercury', 'ne')} र दशम कर्म उप-स्वामी ${trPlanet(kp10?.subLord ?? 'Jupiter', 'ne')} हो।`
        );
      }
      case 'western-mandala':
        return t(
          `Your Sun degree (${sunPlanet.signName} ${sunPlanet.formattedDMS}) carries the Sabian symbol: "${sunPlanet.sabianSymbol}" across ${chart.aspects.length} active planetary aspects.`,
          `तपाईंको सूर्य (${trSign(sunPlanet.signName, 'ne')} ${sunPlanet.formattedDMS}) र ${chart.aspects.length} कोणीय दृष्टिहरू मनोवैज्ञानिक मण्डलमा सक्रिय छन्।`
        );
      case 'cheiro-decoz':
        return t(
          `Computed from UTC birth moment ${chart.utcDate.toISOString().slice(0, 10)}, Cheiro’s Chaldean vibration & Decoz’s 4 Life Pinnacles synchronize with your ${vedic.activeMahadasha.lord} planetary chapter.`,
          `जन्म मिति ${chart.utcDate.toISOString().slice(0, 10)} बाट गणना गरिएका कल्डियन अंक र ४ जीवन शिखरहरू हालको ${trPlanet(vedic.activeMahadasha.lord, 'ne')} दशासँग समन्वित छन्।`
        );
      case 'jaimini-upadesha-sutras':
        return t(
          `Your Jaimini Atmakaraka (Soul King) is ${ak?.planetName ?? 'Sun'} (${ak?.degreeInSign ?? ''}, Karakamsa D9 in ${ak?.navamshaSignName ?? ''}) and your Darakaraka (Spouse Significator) is ${dk?.planetName ?? 'Venus'} in ${dk?.signName ?? ''}.`,
          `तपाईंको जैमिनी आत्मकारक ${trPlanet(ak?.planetName ?? 'Sun', 'ne')} र दाराकारक (जीवनसाथी कारक) ${trPlanet(dk?.planetName ?? 'Venus', 'ne')} हो।`
        );
      case 'uttara-kalamrita':
        return t(
          `Kalidasa’s Sub-Period & Yoga-Karaka lens highlights your current ${vedic.activeAntardasha.lord} Antardasha inside ${vedic.activeMahadasha.lord} Mahadasha (${vedic.activeAntardasha.startDate} → ${vedic.activeAntardasha.endDate}).`,
          `कालिदासको उत्तर कालामृत अनुसार हाल ${trPlanet(vedic.activeMahadasha.lord, 'ne')} महादशाभित्र ${trPlanet(vedic.activeAntardasha.lord, 'ne')} अन्तर्दशा (${vedic.activeAntardasha.startDate} → ${vedic.activeAntardasha.endDate}) सक्रिय छ।`
        );
      case 'jataka-parijata':
        return t(
          `Vaidyanatha Dikshita’s Shodashvarga synthesis maps your D1 Lagna (${chart.ascendant.signName}), D9 Navamsha, D10 Career, and D24 Siddhamsha (Higher Learning sign: ${ZODIAC_SIGNS[ascDiv?.d24Sign ?? 0]?.name ?? 'Aries'}) into a unified life architecture.`,
          `वैद्यनाथ दीक्षितको षोडशवर्ग सूत्र अनुसार तपाईंको D1, D9, D10 र D24 (${trSign(ZODIAC_SIGNS[ascDiv?.d24Sign ?? 0]?.name ?? 'Aries', 'ne')}) वर्ग चार्ट एकीकृत गरिएको छ।`
        );
      case 'saravali':
        return saravaliList.length > 0
          ? t(
              `Kalyanavarma’s conjunction engine detected ${saravaliList.length} Yuti combination(s) in your chart — led by "${saravaliList[0].headline}" (${saravaliList[0].planetsJoined.join(' + ')}).`,
              `कल्याणवर्माको सारावली युति सूत्रले तपाईंको कुण्डलीमा ${saravaliList.length} ग्रह-युति पहिचान गरेको छ (${saravaliList[0].headline})।`
            )
          : t(
              `Every natal planet in your chart occupies its own distinct sign without multi-planet crowding, giving clean, unmixed house expression.`,
              `तपाईंको कुण्डलीमा ग्रहहरू छुट्टाछुट्टै भावमा स्पष्ट र स्वतन्त्र रूपमा स्थित छन्।`
            );
      case 'prashna-marga-ayurveda':
        return t(
          `Prashna Marga & Ashtanga Hridaya link your ${chart.ascendant.signName} Ascendant (${ascElement} element) and ${moonPlanet.signName} Moon (${moonElement} element) directly to daily constitutional balance and zero-cost Sattvic Upaya.`,
          `प्रश्नमार्ग र अष्टाङ्ग हृदयले तपाईंको ${trSign(chart.ascendant.signName, 'ne')} लग्न र ${trSign(moonPlanet.signName, 'ne')} चन्द्र राशिलाई दैनिक आयुर्वेदिक सन्तुलनसँग जोड्छ।`
        );
      default:
        return t(
          `Live chart concordance active for ${chart.ascendant.signName} Ascendant, ${chart.planets[0]?.signName} Sun, and ${moonPlanet.signName} Moon (${janmaNakTreatise.name} Pada ${moonPlanet.nakshatraPada}).`,
          `${trSign(chart.ascendant.signName, 'ne')} लग्न र ${trSign(moonPlanet.signName, 'ne')} राशिका लागि प्रत्यक्ष गणना सक्रिय छ।`
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================== CLEAN HEADER & SEGMENTED SWITCHER ==================== */}
      <WorkspacePageHeader
        title={t('Classical Source Library & Natal Readings', 'शास्त्रीय ग्रन्थ र जन्म फलित पुस्तकालय')}
        subtitle={t(
          `108 Planet-in-House rulings, Shadbala vitality, detected Parashari Yogas, 12 Bhava domains, and ${CLASSICAL_CANON_BOOKS.length} primary source texts.`,
          `१०८ ग्रह-भाव फल, षड्बल शक्ति, पाराशरी योग, १२ भाव विश्लेषण र ${CLASSICAL_CANON_BOOKS.length} मूल ज्योतिष ग्रन्थ।`
        )}
        actions={
          <SegmentedTabs
            ariaLabel="Library reading sections"
            value={readingMode}
            onChange={setReadingMode}
            items={[
              {
                id: 'PLANETS',
                label: t('Planet Readings', 'ग्रह फलित'),
                count: chart.planets.length,
              },
              {
                id: 'YOGAS_REMEDIES',
                label: t('Yogas & Remedies', 'योग र उपाय'),
                count: vedic.yogas.length,
              },
              { id: 'HOUSES', label: t('12 Houses', '१२ भाव'), count: 12 },
              {
                id: 'CANON_BOOKS',
                label: t('Source Books', 'मूल ग्रन्थ'),
                count: CLASSICAL_CANON_BOOKS.length,
              },
            ]}
          />
        }
      />

      {/* ==================== TAB 1: PLANET-IN-HOUSE READINGS ==================== */}
      {readingMode === 'PLANETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Planet Selector Rail */}
          <div className="lg:col-span-4 obs-card p-3 space-y-1">
            {chart.planets.map((p) => {
              const active = p.id === activePlanet.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanetId(p.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between text-xs transition ${
                    active ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold" style={{ color: p.color }}>
                      {p.symbol}
                    </span>
                    <div>
                      <div className="text-[var(--text)] font-semibold">
                        {trPlanet(p.id, lang)}{' '}
                        {lang === 'en' && (
                          <span className="text-[var(--text-muted)] font-normal">
                            ({p.sanskritName})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {p.signSymbol} {trSign(p.signName, lang)} {p.formattedDMS} •{' '}
                        {t('House', 'भाव')} {p.house}
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    tone={
                      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
                        ? 'optimal'
                        : p.dignity === 'Debilitated'
                        ? 'avoid'
                        : 'neutral'
                    }
                    label={trDignity(p.dignity, lang)}
                  />
                </button>
              );
            })}
          </div>

          {/* Planet Detail Card */}
          <div className="lg:col-span-8 obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                  {treatise.sanskritName} • {treatise.greekName}
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] mt-1">
                  {activePlanet.symbol}{' '}
                  {t(
                    `${activePlanet.name} in ${activePlanet.signName} — House ${activePlanet.house}`,
                    `${trSign(activePlanet.signName, 'ne')} राशिमा ${trPlanet(activePlanet.id, 'ne')} — भाव ${activePlanet.house} (${trHouseGuide(activePlanet.house, 'ne').shortTitle})`
                  )}
                </h2>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  {activePlanet.formattedDMS} • {trNakshatra(activePlanet.nakshatraName, lang)}{' '}
                  {t('Pada', 'चरण')} {activePlanet.nakshatraPada} ({t('Lord:', 'स्वामी:')}{' '}
                  {trPlanet(activePlanet.nakshatraLord, lang)})
                </p>
              </div>
              {activePlanet.isRetrograde && (
                <StatusBadge tone="mixed" label={t('Retrograde (Vakri)', 'वक्री')} />
              )}
            </div>

            {/* Live BPHS Shadbala & Baladi Avastha Strip */}
            {activePlanetVit && (
              <div className="obs-panel px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--text)]">
                    {t('BPHS Six-Fold Strength (Shadbala):', 'षड्बल शक्ति:')}
                  </span>
                  <span className="font-mono font-bold text-[var(--accent)]">
                    {activePlanetVit.shadbalaRupas} {t('Rupas', 'रूपा')}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    ({activePlanetVit.ratioPercent}% / min {activePlanetVit.minRequiredRupas})
                  </span>
                  <StatusBadge
                    tone={activePlanetVit.tierTone}
                    label={activePlanetVit.tierLabel}
                  />
                </div>
                <div className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text)]">{t('Avastha:', 'अवस्था:')}</strong>{' '}
                  {activePlanetVit.avasthaLabel}
                </div>
              </div>
            )}

            {/* Specific 1-of-108 Planet-in-House Ruling */}
            <div className="obs-panel p-5 space-y-2.5">
              <div className="text-sm font-bold text-[var(--accent)]">
                What {activePlanet.name} in House {activePlanet.house} Means for You
              </div>
              <p className="text-base text-[var(--text)] leading-relaxed">
                {exactBhavaRuling ||
                  `Occupying ${planetHouseTreatise.name} (${planetHouseTreatise.trikonaType}), ${activePlanet.name} channels its planetary archetype directly into ${planetHouseTreatise.bphsSummary}`}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-2.5 border-t border-[var(--border)]">
                <strong>Psychological Perspective:</strong> {planetHouseTreatise.westernDepth}
              </p>
            </div>

            {/* Nakshatra Bridge */}
            <div className="obs-panel p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="text-sm font-bold text-[var(--text)]">
                  Star Placement: {activePlanetNak.name} ({activePlanetNak.shaktiName})
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong>Pada {activePlanet.nakshatraPada}</strong> (
                  {activePlanetNak.padas[activePlanet.nakshatraPada - 1]?.navamshaSign} Navamsha):{' '}
                  {activePlanetNak.padas[activePlanet.nakshatraPada - 1]?.expression}
                </p>
              </div>
              {onInspectNakshatra && (
                <button
                  type="button"
                  onClick={() => onInspectNakshatra(activePlanet.nakshatraIndex)}
                  className="btn-editorial-secondary text-sm inline-flex items-center gap-1.5"
                >
                  <span>Read {activePlanetNak.name}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Parashara vs Psychological Synthesis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-5 space-y-2">
                <div className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-[var(--accent)]" />
                  <span>Life Areas &amp; Growth Lesson</span>
                </div>
                <p className="text-sm text-[var(--text)] leading-relaxed">
                  <strong>Governs:</strong> {treatise.parasharaBphsKaraka}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong>Growth Lesson:</strong> {treatise.vedicSoulLesson}
                </p>
              </div>

              <div className="obs-panel p-5 space-y-2">
                <div className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[var(--accent)]" />
                  <span>Inner Psychology</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {treatise.westernPsychologicalArchetype}
                </p>
              </div>
            </div>

            {/* Sabian Symbol & Mahadasha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>360° Sabian Degree Symbol</span>
                </div>
                <p className="text-sm font-serif italic text-[var(--text)] leading-relaxed">
                  {activePlanet.sabianSymbol}
                </p>
              </div>

              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Vimshottari Mahadasha Theme</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {treatise.dashaGeneralFruit}
                </p>
              </div>
            </div>

            {/* Classical Shloka & Ayurveda */}
            <blockquote className="obs-panel p-4 border-l-4 border-l-[var(--accent)] italic font-serif text-sm text-[var(--text)]">
              {treatise.classicalCitation}
            </blockquote>

            <div className="obs-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-[var(--sage)] flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Ayurvedic Dosha &amp; Dhatu</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.medicalAndAyurvedicDhatu}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--accent)]">
                  Traditional Ratna &amp; Mantra
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {treatise.gemstoneAndMantra}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ACTIVE YOGAS & REMEDIES ==================== */}
      {readingMode === 'YOGAS_REMEDIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 obs-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                Detected Classical Yogas ({vedic.yogas.length})
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Evaluated from Brihat Parashara Hora Shastra, Phaladeepika, and B.V. Raman
                combinations
              </p>
            </div>

            <div className="space-y-3">
              {vedic.yogas.map((y) => (
                <div key={y.name} className="obs-panel p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[var(--text)]">
                      {y.name}{' '}
                      <span className="text-xs font-mono text-[var(--text-muted)] font-normal">
                        ({y.sanskrit})
                      </span>
                    </h3>
                    <StatusBadge
                      tone={
                        y.category === 'Dosha / Alert'
                          ? 'avoid'
                          : y.strength === 'High'
                          ? 'optimal'
                          : 'info'
                      }
                      label={`${y.category} • ${y.strength}`}
                    />
                  </div>
                  {y.sourceText && (
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      Source: {y.sourceText}
                    </div>
                  )}
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {y.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 obs-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                Active Period &amp; Birth Star Remedies
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Practical alignment for your current Vimshottari Dasha and Janma Nakshatra
              </p>
            </div>

            <div className="obs-panel p-4 space-y-2">
              <div className="text-xs font-bold text-[var(--accent)]">
                Active Dasha: {vedic.activeMahadasha.lord} – {vedic.activeAntardasha.lord}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.dashaGeneralFruit}
              </p>
              <p className="text-xs text-[var(--text)] leading-relaxed pt-2 border-t border-[var(--border)]">
                <strong>Ratna &amp; Mantra:</strong>{' '}
                {PLANET_TREATISES[vedic.activeMahadasha.lord]?.gemstoneAndMantra}
              </p>
            </div>

            <div className="obs-panel p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--sage)] flex items-center gap-1.5">
                  <Trees className="w-4 h-4" />
                  <span>Birth Star Ecology: {janmaNakTreatise.name}</span>
                </span>
                {onInspectNakshatra && (
                  <button
                    type="button"
                    onClick={() => onInspectNakshatra(janmaNakTreatise.index)}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    Open Star →
                  </button>
                )}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                <strong>Sacred Tree:</strong> {janmaNakTreatise.sacredTree}
              </p>
              <p className="font-mono text-[var(--accent)]">{janmaNakTreatise.vedicMantra}</p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                <strong>Daily Practice:</strong> {janmaNakTreatise.behavioralUpaya}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: 12 HOUSES ==================== */}
      {readingMode === 'HOUSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 obs-card p-3 space-y-1">
            {chart.houses.map((h) => {
              const active = h.house === selectedHouseNum;
              const occ = chart.planets.filter((p) => p.house === h.house);
              return (
                <button
                  key={h.house}
                  type="button"
                  onClick={() => setSelectedHouseNum(h.house)}
                  className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between text-xs transition ${
                    active ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div>
                    <div className="text-[var(--text)] font-semibold">
                      House {h.house} — {HOUSE_TREATISES[h.house]?.sanskrit.split('•')[0]}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      Cusp: {h.signSymbol} {h.signName} {h.formattedDMS}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {occ.map((p) => (
                      <span key={p.id} style={{ color: p.color }} className="text-sm font-bold">
                        {p.symbol}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4">
              <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                {activeHouseTreatise.sanskrit} • {activeHouseTreatise.trikonaType}
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mt-1">
                {activeHouseTreatise.name} — Cusp in {activeHouseCusp.signSymbol}{' '}
                {activeHouseCusp.signName} ({activeHouseCusp.formattedDMS})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-bold text-[var(--text)]">Parashara Bhava Domain</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.bphsSummary}
                </p>
              </div>
              <div className="obs-panel p-4 space-y-1.5">
                <div className="text-xs font-bold text-[var(--text)]">
                  Depth Psychological Sphere
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeHouseTreatise.westernDepth}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                Natal Planets in House {selectedHouseNum}
              </h3>
              {planetsInSelectedHouse.length === 0 ? (
                <div className="obs-panel p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                  No natal planets occupy House {selectedHouseNum} directly; this house operates
                  through the placement and dignity of the ruler of{' '}
                  <strong>{activeHouseCusp.signName}</strong> and planetary aspects received.
                </div>
              ) : (
                <div className="space-y-3">
                  {planetsInSelectedHouse.map((p) => (
                    <div key={p.id} className="obs-panel p-4 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-bold text-[var(--text)]">
                          <span style={{ color: p.color }}>{p.symbol}</span> {p.name} in{' '}
                          {p.signName} ({p.formattedDMS})
                        </div>
                        <StatusBadge
                          tone="info"
                          label={`${p.dignity} • ${p.nakshatraName} P${p.nakshatraPada}`}
                        />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {PLANET_IN_BHAVA_RULINGS[p.id]?.[selectedHouseNum] ||
                          PLANET_TREATISES[p.id]?.parasharaBphsKaraka}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: 9 SOURCE BOOKS ==================== */}
      {readingMode === 'CANON_BOOKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 obs-card p-3 space-y-1">
            {CLASSICAL_CANON_BOOKS.map((book, index) => {
              const active = book.id === activeBook.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBookId(book.id)}
                  className={`w-full px-3 py-3 rounded-lg text-left transition ${
                    active ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--accent)]">
                    <span>#{index + 1}</span>
                    <span>{book.tradition}</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--text)] mt-0.5">{book.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{book.author}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 obs-card p-6 space-y-5">
            <div className="border-b border-[var(--border)] pb-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>{activeBook.eraAndLineage}</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)]">{activeBook.title}</h2>
              <div className="text-sm font-serif italic text-[var(--text-secondary)]">
                {activeBook.sanskritOrOriginal} — {activeBook.author}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[var(--text)]">Core Thesis</div>
              <p className="literary-prose text-sm">{activeBook.thesis}</p>
            </div>

            <div className="obs-panel p-4 space-y-1">
              <div className="text-xs font-bold text-[var(--accent)]">
                Computational Implementation in Oceanology
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeBook.engineIntegration}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--sage-bg)] border border-[var(--sage)]/30 p-4 space-y-1.5">
              <div className="text-xs font-bold text-[var(--sage)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {t(
                    'How This Canon Evaluates Your Active Birth Chart Right Now',
                    'यस ग्रन्थको सूत्र अनुसार तपाईंको सक्रिय जन्म कुण्डलीको निष्कर्ष'
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {getBookLiveConcordance(activeBook.id)}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                Key Sutras, Aphorisms &amp; Commentary
              </h3>
              {activeBook.sutras.map((sutra, idx) => (
                <div key={idx} className="obs-panel p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[var(--text)]">{sutra.title}</h4>
                    <span className="text-xs font-mono text-[var(--accent)]">
                      {sutra.chapterRef}
                    </span>
                  </div>
                  <blockquote className="font-serif italic text-sm text-[var(--text)] border-l-2 border-[var(--accent)] pl-3">
                    {sutra.aphorism}
                  </blockquote>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {sutra.commentary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
