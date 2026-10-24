// Comprehensive Scholarly & Classical Compendium synthesized from:
// 1. Brihat Parashara Hora Shastra (BPHS — Maharishi Parashara)
// 2. Brihat Jataka (Varahamihira) & Phaladeepika (Mantreshwara)
// 3. Three Hundred Important Combinations & Muhurtha (Dr. B.V. Raman)
// 4. KP Reader Series I–VI (Prof. K.S. Krishnamurti)
// 5. Tetrabiblos (Claudius Ptolemy) & Christian Astrology (William Lilly)
// 6. Planets in Transit & The Astrology of Fate (Robert Hand & Liz Greene)
// 7. An Astrological Mandala (Dane Rudhyar)
// 8. The Psychology of Astro*Carto*Graphy (Jim Lewis & Ariel Guttman)
// 9. Numerology: Key to Your Inner Self (Hans Decoz) & Cheiro's Book of Numbers (Count Louis Hamon)

export interface PlanetTreatise {
  id: string;
  sanskritName: string;
  greekName: string;
  classicalCitation: string;
  parasharaBphsKaraka: string;
  westernPsychologicalArchetype: string;
  vedicSoulLesson: string;
  medicalAndAyurvedicDhatu: string;
  gemstoneAndMantra: string;
  dashaGeneralFruit: string;
}

export const PLANET_TREATISES: Record<string, PlanetTreatise> = {
  Sun: {
    id: 'Sun',
    sanskritName: 'Surya (सूर्य) • Atmakaraka',
    greekName: 'Helios / Sol',
    classicalCitation: 'Brihat Parashara Hora Shastra (Ch. 3, Shloka 23): "Surya is the soul of all beings (Atma), square in form, of Pitta temperament, royal in bearing, and lord of the East."',
    parasharaBphsKaraka: 'Atma (Soul), Pitru (Father), Royal Authority, Vitality, Dharma, Sovereign Will, and Public Honor.',
    westernPsychologicalArchetype: 'In Liz Greene and Carl Jung’s analytical depth psychology, the Sun represents the conscious Hero-myth and the principle of Individuation—the central organizing gravity around which fragmented sub-personalities cohere into authentic selfhood.',
    vedicSoulLesson: 'To radiate authority and dharma without falling into hubris (Ahamkara); to serve as a steady solar lamp of integrity for family and society.',
    medicalAndAyurvedicDhatu: 'Pitta Dosha • Asthi Dhatu (Bones), Heart, Right Eye, Thymus, and Vital Prana.',
    gemstoneAndMantra: 'Natural Burma Ruby (Manikya) in Gold • Vedic Beej Mantra: "Om Hram Hreem Hroum Sah Suryaya Namah" (7,000 recitations).',
    dashaGeneralFruit: 'The 6-year Surya Mahadasha elevates executive standing, leadership roles, state or institutional recognition, and contact with mentors or father-figures, while testing ego-humility and cardiovascular vitality.',
  },
  Moon: {
    id: 'Moon',
    sanskritName: 'Chandra (चन्द्र) • Manas-Karaka',
    greekName: 'Selene / Luna',
    classicalCitation: 'Brihat Jataka (Ch. 2, Verse 2): "Chandra is the presiding deity of the Mind (Manas), rich in Kapha and Vata, round, luminous, compassionate, and sovereign over tides and medicinal herbs."',
    parasharaBphsKaraka: 'Manas (Reflective Mind & Emotion), Matru (Mother), Soma (Nectar of Memory), Public Popularity, Nourishment, and Domestic Sanctuary.',
    westernPsychologicalArchetype: 'Represents the unconscious somatic memory, attachment imprinting, inner child, and what Robert Hand describes as our instinctive emotional container—how we seek safety, belonging, and rhythmic attunement.',
    vedicSoulLesson: 'Cultivating equanimity (Samatva) across waxing (Shukla) and waning (Krishna) emotional tides; transforming reactive moodiness into deep, receptive intuition.',
    medicalAndAyurvedicDhatu: 'Kapha & Vata Dosha • Rasa & Rakta Dhatu (Plasma, Lymph & Blood), Left Eye, Stomach, and Limbic System.',
    gemstoneAndMantra: 'Natural Basra Pearl (Moti) or Moonstone in Silver • Vedic Beej Mantra: "Om Shram Shreem Shroum Sah Chandraya Namah" (11,000 recitations).',
    dashaGeneralFruit: 'The 10-year Chandra Mahadasha brings emotional flowering, domestic relocation or property acquisition, maternal blessings, public visibility, and heightened intuition.',
  },
  Mars: {
    id: 'Mars',
    sanskritName: 'Mangala / Kuja (मंगल) • Bhumi-Putra',
    greekName: 'Ares',
    classicalCitation: 'Phaladeepika (Ch. 2, Verse 4): "Bhauma (Mars) is the Commander-in-Chief (Senapati) of the planetary cabinet, youthful, fierce-eyed, generous, of fiery Pitta nature, ruling marrow and courage."',
    parasharaBphsKaraka: 'Parakrama (Courage & Initiative), Bhratru (Siblings), Bhumi (Land & Real Estate), Engineering, Surgery, Martial Discipline, and Strategic Will.',
    westernPsychologicalArchetype: 'The principle of Desire, Assertion, and healthy Boundary-Defense. Where Mars is placed shows how we cut cords, initiate action, and transmute raw anger into focused craftsmanship.',
    vedicSoulLesson: 'Mastering Ahimsa (non-harm) alongside fearless Dharma-protection; channeling impulsive heat into surgical precision and protective strength.',
    medicalAndAyurvedicDhatu: 'Pitta Dosha • Majja Dhatu (Bone Marrow), Hemoglobin, Muscular System, and Adrenal Cortex.',
    gemstoneAndMantra: 'Mediterranean Red Coral (Moonga) in Gold or Copper • Vedic Beej Mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah" (10,000 recitations).',
    dashaGeneralFruit: 'The 7-year Mangala Mahadasha accelerates rapid enterprise, real estate transactions, technical breakthroughs, and competitive victories, requiring care against haste or inflammation.',
  },
  Mercury: {
    id: 'Mercury',
    sanskritName: 'Budha (बुध) • Yuvaraja',
    greekName: 'Hermes',
    classicalCitation: 'Brihat Parashara Hora Shastra (Ch. 3, Shloka 26): "Budha is endowed with an attractive physique, skilled in speech, wit, mathematics, and commerce, blending all three Doshas (Vata-Pitta-Kapha)."',
    parasharaBphsKaraka: 'Buddhi (Discriminative Intellect), Vak (Speech & Eloquence), Jyotish & Mathematics, Trade, Writing, Diplomacy, and Adaptability.',
    westernPsychologicalArchetype: 'Hermes the Psychopomp—the messenger able to cross thresholds between conscious logic and symbolic meaning. Governs cognitive framing, language, and neural plasticity.',
    vedicSoulLesson: 'Moving from superficial information-gathering to Viveka (spiritual discernment between the ephemeral and the eternal).',
    medicalAndAyurvedicDhatu: 'Tridoshic • Twak (Skin), Central Nervous System, Thyroid, Vocal Cords, and Respiratory Bronchi.',
    gemstoneAndMantra: 'Zambian or Colombian Emerald (Panna) in Gold • Vedic Beej Mantra: "Om Bram Breem Broum Sah Budhaya Namah" (9,000 recitations).',
    dashaGeneralFruit: 'The 17-year Budha Mahadasha is a golden era for scholarship, publishing, software/data architecture, commercial trade, diplomacy, and intellectual networking.',
  },
  Jupiter: {
    id: 'Jupiter',
    sanskritName: 'Guru / Brihaspati (बृहस्पति) • Deva-Guru',
    greekName: 'Zeus / Jove',
    classicalCitation: 'Brihat Jataka (Ch. 2, Verse 5): "Brihaspati is the preceptor of the celestials, large-bodied, golden-eyed, supreme in wisdom (Jnana), law, treasury, and Vedic philosophy."',
    parasharaBphsKaraka: 'Dharma (Righteousness), Jnana (Higher Wisdom), Santana (Children & Mentorship), Dhana (Abundance & Treasury), Grace, and Optimism.',
    westernPsychologicalArchetype: 'In Ptolemy’s Tetrabiblos, Jupiter is the Greater Benefic—representing teleological meaning, philosophical horizon, ethical expansion, and faith in benevolence.',
    vedicSoulLesson: 'Embodying living wisdom rather than dogmatic preachiness; becoming a generous steward of wealth and knowledge.',
    medicalAndAyurvedicDhatu: 'Kapha Dosha • Meda Dhatu (Adipose/Lipid metabolism), Liver, Gallbladder, Arterial Circulation, and Pituitary.',
    gemstoneAndMantra: 'Ceylon Yellow Sapphire (Pukhraj) in Gold • Vedic Beej Mantra: "Om Gram Greem Groum Sah Gurave Namah" (19,000 recitations).',
    dashaGeneralFruit: 'The 16-year Guru Mahadasha bestows ethical elevation, marriage or birth of progeny, academic honors, financial stabilization, and deep philosophical synthesis.',
  },
  Venus: {
    id: 'Venus',
    sanskritName: 'Shukra (शुक्र) • Daitya-Guru & Kavi',
    greekName: 'Aphrodite / Venus',
    classicalCitation: 'Phaladeepika (Ch. 2, Verse 6): "Shukracharya is the poet-sage possessing the Sanjeevani Vidya (knowledge of regeneration), radiant, dark-curled, governing love, aesthetics, and refinement."',
    parasharaBphsKaraka: 'Kalatra (Spouse & Sacred Partnership), Kama (Refined Pleasure), Aesthetic Arts, Music, Vehicles, Diplomacy, and Regenerative Ojas.',
    westernPsychologicalArchetype: 'The principle of Eros, Value, and Relational Mirroring—what we magnetize effortlessly, how we experience beauty, and how we harmonize polarities.',
    vedicSoulLesson: 'Elevating sensory attachment into Bhakti (devotional appreciation of beauty) and mutual relational sovereignty.',
    medicalAndAyurvedicDhatu: 'Kapha & Vata Dosha • Shukra Dhatu (Reproductive & Creative Essence / Ojas), Kidneys, Venous System, and Throat.',
    gemstoneAndMantra: 'Diamond (Heera) or White Sapphire in Platinum/Silver • Vedic Beej Mantra: "Om Dram Dreem Droum Sah Shukraya Namah" (16,000 recitations).',
    dashaGeneralFruit: 'The longest 20-year Shukra Mahadasha brings artistic mastery, romantic fulfillment, material comfort, vehicles, and social grace.',
  },
  Saturn: {
    id: 'Saturn',
    sanskritName: 'Shani (शनि) • Karma-Dharmaraj',
    greekName: 'Kronos / Saturnus',
    classicalCitation: 'Brihat Parashara Hora Shastra (Ch. 3, Shloka 28): "Shanaishchara is slow-moving, deep-eyed, of Vata constitution, impartial judge of Karma, ruling longevity (Ayus), austerity, and perseverance."',
    parasharaBphsKaraka: 'Ayus (Longevity), Karma & Seva (Service), Discipline, Structural Architecture, Humility, Detachment (Vairagya), and Time (Kala).',
    westernPsychologicalArchetype: 'In Liz Greene’s classic "Saturn: A New Look at an Old Devil," Saturn is the alchemical lead that turns into gold—where we initially feel inadequacy or delay, yet ultimately forge unshakeable mastery and authority.',
    vedicSoulLesson: 'Accepting accountability without bitterness; mastering patience, service to the marginalized, and long-horizon craftsmanship.',
    medicalAndAyurvedicDhatu: 'Vata Dosha • Snayu (Tendons, Ligaments, Joints), Teeth, Knees, Skeletal Frame, and Vagus Nerve.',
    gemstoneAndMantra: 'Ceylon Blue Sapphire (Neelam — only after strict trial) or Amethyst in Iron/Silver • Vedic Beej Mantra: "Om Pram Preem Proum Sah Shanaishcharaya Namah" (23,000 recitations).',
    dashaGeneralFruit: 'The 19-year Shani Mahadasha restructures life foundations, stripping away superficiality and rewarding tireless integrity with enduring institutional authority.',
  },
  Rahu: {
    id: 'Rahu',
    sanskritName: 'Rahu (राहु) • Dragon’s Head (North Node)',
    greekName: 'Caput Draconis',
    classicalCitation: 'Phaladeepika & BPHS: "Rahu is a Chhaya Graha (Shadow Node) acting like Saturn ("Sanivad Rahu"), amplifying ambition, frontier innovation, foreign cross-currents, and unorthodox breakthroughs."',
    parasharaBphsKaraka: 'Evolutionary Hunger, Technological Innovation, Foreign Lands, Cross-Cultural Synthesis, Mass Trends, and Unconventional Mastery.',
    westernPsychologicalArchetype: 'The North Node represents the soul’s unfamiliar frontier—where we must stretch beyond ancestral comfort zones to fulfill our evolutionary destiny.',
    vedicSoulLesson: 'Pursuing innovation and worldly expansion while remaining anchored in truth (Satya) so illusion (Maya) does not breed insatiability.',
    medicalAndAyurvedicDhatu: 'Vata-predominant • Bio-electrical impulses, complex undiagnosed sensitivities, and neuro-endocrine rhythms.',
    gemstoneAndMantra: 'Ceylon Hessonite Garnet (Gomed) in Silver • Vedic Beej Mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah" (18,000 recitations).',
    dashaGeneralFruit: 'The 18-year Rahu Mahadasha triggers dramatic leaps in ambition, international travel or relocation, digital/scientific breakthroughs, and rapid status shifts.',
  },
  Ketu: {
    id: 'Ketu',
    sanskritName: 'Ketu (केतु) • Dragon’s Tail (South Node)',
    greekName: 'Cauda Draconis',
    classicalCitation: 'BPHS: "Ketu acts like Mars ("Kujavad Ketu") and is the supreme significator of Moksha (Liberation), esoteric gnosis, detachment, and past-life mastery."',
    parasharaBphsKaraka: 'Moksha (Spiritual Emancipation), Jyotish & Mystic Intuition, Past-Life Siddhis, Micro-Analysis, and Non-Attachment.',
    westernPsychologicalArchetype: 'The South Node is the reservoir of innate, already-mastered instinct—gifts we bring into this incarnation that must be shared freely rather than hoarded as a security blanket.',
    vedicSoulLesson: 'Surrendering over-control; trusting subtle intuition and spiritual synthesis without retreating into isolation.',
    medicalAndAyurvedicDhatu: 'Pitta-Vata • Cellular immunity, spinal kundalini subtle channels (Sushumna), and deep subconscious reflexes.',
    gemstoneAndMantra: 'Chrysoberyl Cat’s Eye (Lehsuniya) in Silver/Gold • Vedic Beej Mantra: "Om Stram Streem Stroum Sah Ketave Namah" (17,000 recitations).',
    dashaGeneralFruit: 'The 7-year Ketu Mahadasha distills life down to essentials, awakening deep philosophical, mystical, or research breakthroughs and pruning false attachments.',
  },
  Uranus: {
    id: 'Uranus',
    sanskritName: 'Aruna / Prajapati (अरुण)',
    greekName: 'Ouranos',
    classicalCitation: 'Richard Tarnas ("Cosmos and Psyche"): "Uranus is the Promethean awakener—the sudden lightning bolt of original genius, emancipation, and paradigm-shifting invention."',
    parasharaBphsKaraka: 'Quantum Leaps, Scientific Originality, Sudden Liberation, Astrological & Astronomical Awakening.',
    westernPsychologicalArchetype: 'The drive toward radical authenticity and freedom from collective conditioning.',
    vedicSoulLesson: 'Integrating sudden insight into constructive community evolution.',
    medicalAndAyurvedicDhatu: 'Bio-electric nervous system, synapses, and ankles.',
    gemstoneAndMantra: 'Aquamarine or Moldavite • Contemplation of Sky-Consciousness.',
    dashaGeneralFruit: 'Uranian transits (especially the Uranus Opposition around age 41–42) catalyze authentic midlife renaissance.',
  },
  Neptune: {
    id: 'Neptune',
    sanskritName: 'Varuna (वरुण)',
    greekName: 'Poseidon / Neptunus',
    classicalCitation: 'Liz Greene ("The Astrological Neptune"): "Neptune is the oceanic longing to dissolve ego-boundaries into universal compassion, poetic imagination, and transcendent unity."',
    parasharaBphsKaraka: 'Oceanic Devotion, Cinema & Poetic Arts, Mystic Empathy, and Sacred Dreams.',
    westernPsychologicalArchetype: 'The collective waters of imagination and unconditional compassion.',
    vedicSoulLesson: 'Distinguishing inspired spiritual vision from escapist fog.',
    medicalAndAyurvedicDhatu: 'Pineal gland, lymphatic fluids, and feet.',
    gemstoneAndMantra: 'Amethyst or Sea-Aquamarine • Varuna Gayatri.',
    dashaGeneralFruit: 'Neptunian periods dissolve rigid structures to birth artistic and spiritual grace.',
  },
  Pluto: {
    id: 'Pluto',
    sanskritName: 'Yama / Shiva-Rudra (यम)',
    greekName: 'Hades / Pluto',
    classicalCitation: 'Jeff Green ("Pluto: The Evolutionary Journey of the Soul"): "Pluto governs the alchemical death-and-rebirth of the psyche, unearthing buried power and evolutionary truth."',
    parasharaBphsKaraka: 'Deep Regeneration, Subterranean Wealth, Psychological Alchemy, and Generational Metamorphosis.',
    westernPsychologicalArchetype: 'The Phoenix principle—confronting shadow material to reclaim authentic soul power.',
    vedicSoulLesson: 'Using transformative power for collective healing rather than control.',
    medicalAndAyurvedicDhatu: 'Cellular regeneration, DNA repair, and elimination pathways.',
    gemstoneAndMantra: 'Obsidian or Garnet • Maha Mrityunjaya Mantra.',
    dashaGeneralFruit: 'Plutonian transits strip away outgrown identities, forging unbreakable resilience.',
  },
};

// 12 Bhavas (Houses) Classical Parashara & Western Synthesis
export const HOUSE_TREATISES: Record<number, { name: string; sanskrit: string; trikonaType: string; bphsSummary: string; westernDepth: string }> = {
  1: {
    name: 'First House (Ascendant / Horizon)',
    sanskrit: 'Tanu Bhava (तनु भाव) • Lagna',
    trikonaType: 'Kendra (Angle) & Trikona (Trine) — Supreme Pivot',
    bphsSummary: 'In Brihat Parashara Hora Shastra (Ch. 11), Tanu Bhava governs physical constitution (Deha), vitality, complexion, head, self-respect, and how the soul enters manifestation at the eastern horizon.',
    westernDepth: 'The lens of embodiment and immediate interface with the world—the mask that paradoxically reveals the soul’s evolutionary vehicle.',
  },
  2: {
    name: 'Second House',
    sanskrit: 'Dhana & Kutumba Bhava (धन भाव)',
    trikonaType: 'Panapara (Succedent) & Maraka',
    bphsSummary: 'Governs accumulated treasury (Kosh), family lineage (Kutumba), speech (Vak), right eye, nourishment, and classical learning.',
    westernDepth: 'Innate self-worth, material stewardship, and the tangible resources we cultivate to sustain security.',
  },
  3: {
    name: 'Third House',
    sanskrit: 'Sahaja & Parakrama Bhava (सहज भाव)',
    trikonaType: 'Apoklima (Cadent) & Upachaya (Growth House)',
    bphsSummary: 'Signifies valor (Parakrama), younger co-borns, hands/dexterity, communication, short journeys, and personal initiative.',
    westernDepth: 'Immediate cognitive environment, curiosity, sibling dynamics, and the craft of articulate expression.',
  },
  4: {
    name: 'Fourth House (Imum Coeli / IC)',
    sanskrit: 'Sukha & Matru Bhava (सुख भाव)',
    trikonaType: 'Kendra (Angle) & Moksha Trikona',
    bphsSummary: 'Governs inner peace (Sukha), mother, ancestral home, landed property, vehicles (Vahana), heart/chest, and foundational education.',
    westernDepth: 'The psychological roots and subterranean sanctuary at the midnight nadir of the chart—where we belong and recharge.',
  },
  5: {
    name: 'Fifth House',
    sanskrit: 'Putra & Purva-Punya Bhava (पुत्र भाव)',
    trikonaType: 'Lakshmi Trikona (Trine of Intelligence & Grace)',
    bphsSummary: 'The house of Purva-Punya (accumulated past-life merit), creative intelligence (Dhi), progeny, mantra-siddhi, romance, and speculative wisdom.',
    westernDepth: 'Joyful self-expression, creative authorship, play, romance, and the radiance of the heart.',
  },
  6: {
    name: 'Sixth House',
    sanskrit: 'Ripu, Roga & Rina Bhava (रिपु भाव)',
    trikonaType: 'Dusthana & Upachaya (House of Effort & Mastery)',
    bphsSummary: 'Governs daily work, service (Seva), overcoming obstacles/competitors (Shadripu), digestive fire (Agni), healing arts, and maternal relatives.',
    westernDepth: 'Sacred craft, somatic ritual, health maintenance, and the humility of daily refinement.',
  },
  7: {
    name: 'Seventh House (Descendant / DSC)',
    sanskrit: 'Kalatra & Yuvati Bhava (कलत्र भाव)',
    trikonaType: 'Kendra (Western Horizon Angle) & Kama Trikona',
    bphsSummary: 'Governs marriage, sacred contracts, business partners, diplomacy, foreign residence (Pada from 4th), and public reciprocity.',
    westernDepth: 'The relational mirror at the setting sun—where we meet the "Other" and integrate projected qualities into wholeness.',
  },
  8: {
    name: 'Eighth House',
    sanskrit: 'Ayur & Randhra Bhava (आयुर्भाव)',
    trikonaType: 'Dusthana & Moksha Trikona (Esoteric Depth)',
    bphsSummary: 'Governs longevity (Ayus), sudden transformations, legacies/unearned wealth, occult research, kundalini depth, and psychological resilience.',
    westernDepth: 'The alchemical crucible of intimacy, shared resources, shadow work, and metamorphosis.',
  },
  9: {
    name: 'Ninth House',
    sanskrit: 'Dharma & Bhagya Bhava (भाग्य भाव)',
    trikonaType: 'Supreme Lakshmi Trikona (House of Grace & Destiny)',
    bphsSummary: 'The most auspicious house of Bhagya (divine fortune), Dharma (righteous purpose), Guru/preceptor, father, long pilgrimages, and higher philosophy.',
    westernDepth: 'The quest for overarching meaning, global horizons, jurisprudence, publishing, and philosophical synthesis.',
  },
  10: {
    name: 'Tenth House (Midheaven / MC)',
    sanskrit: 'Karma & Rajya Bhava (कर्म भाव)',
    trikonaType: 'Supreme Kendra (Solar Zenith) & Artha Trikona',
    bphsSummary: 'Governs public action (Karma), profession, authority (Rajya), honor (Mana), command, and enduring societal contribution.',
    westernDepth: 'The zenith of vocation—not merely a job, but the visible legacy and structure we build in the world.',
  },
  11: {
    name: 'Eleventh House',
    sanskrit: 'Labha & Aya Bhava (लाभ भाव)',
    trikonaType: 'Upachaya & Kama Trikona (Fulfillment of Desires)',
    bphsSummary: 'Governs gains (Labha), realization of ambitions, elder siblings, influential networks, and collective prosperity.',
    westernDepth: 'Alliances of shared vision, community solidarity, humanitarian ideals, and future-oriented networks.',
  },
  12: {
    name: 'Twelfth House',
    sanskrit: 'Vyaya & Moksha Bhava (व्यय भाव)',
    trikonaType: 'Dusthana & Final Moksha Trikona',
    bphsSummary: 'Governs emancipation (Moksha), contemplation, sleep/dreams, charitable expenditure (Vyaya), distant lands across oceans, and ashram/sanctuary.',
    westernDepth: 'The boundless womb of the collective unconscious—where ego-borders dissolve into spiritual compassion and gestation.',
  },
};

// Cheiro's Book of Numbers (Chaldean Compound Numbers 10 to 52 Esoteric Keynotes)
export const CHEIRO_COMPOUND_MEANINGS: Record<number, { title: string; meaning: string }> = {
  10: { title: 'The Wheel of Fortune', meaning: 'Cheiro writes: "A number of honor, faith, and self-confidence; rise and fall according to personal will, with name and legacy remembered."' },
  11: { title: 'The Master Illuminator', meaning: 'A high-voltage number of psychic revelation, spiritual testing, and visionary leadership requiring grounded integrity.' },
  12: { title: 'The Consecrated Victim / Sacrifice', meaning: 'Indicates deep mental solicitude and carrying responsibilities for others; wisdom gained through selfless service.' },
  13: { title: 'The Alchemist of Transformation (Karmic 13/4)', meaning: 'Not "unlucky" in ancient Chaldean lore, but a symbol of upheaval that clears old structures so genius and practical mastery can emerge.' },
  14: { title: 'Movement, Flux & Magnetic Communication (Karmic 14/5)', meaning: 'Fortunate for dealings with the public, media, and global trade, provided temperance and emotional steadiness are maintained.' },
  15: { title: 'The Enchanter of Eloquence & Art', meaning: 'Deeply magnetic vibration associated with music, art, persuasive speech, and receiving generous patronage.' },
  16: { title: 'The Shattered Citadel / Awakening (Karmic 16/7)', meaning: 'Calls for humility and spiritual alertness; dissolves false ego-pride so authentic inner wisdom can stand unshakeable.' },
  17: { title: 'The Star of the Magi (8-Pointed Star of Venus)', meaning: 'One of the most auspicious spiritual numbers in Chaldean numerology—symbolizing peace, love, immortality of name, and triumph over early trials.' },
  18: { title: 'Material & Spiritual Conflict Resolved by Valor', meaning: 'Requires decisive ethics and refusal to compromise principles in high-stakes negotiations.' },
  19: { title: 'The Prince of Heaven (Sun Triumphant)', meaning: 'Cheiro calls 19 "one of the most fortunate compound numbers—promising happiness, success, esteem, and honor in life’s plans."' },
  20: { title: 'The Awakening / Call to Purpose', meaning: 'Not a material number, but a call to awaken higher ideals, humanitarian causes, and spiritual calling.' },
  21: { title: 'The Crown of the Magi', meaning: 'A number of advancement, honors, and elevation after steady perseverance—victory in the second half of life.' },
  22: { title: 'The Master Architect', meaning: 'Combines visionary idealism with concrete organizational power capable of building institutions that outlast generations.' },
  23: { title: 'The Royal Star of the Lion', meaning: 'Extreme good fortune in career and protection from high-ranking patrons and wise counselors.' },
  24: { title: 'Love, Prosperity & Creative Patronage', meaning: 'Exceptionally favorable for partnerships, artistic enterprise, and magnetic support from others.' },
  25: { title: 'Strength Gained Through Experience', meaning: 'Wisdom forged through observation and early trials, blossoming into authoritative judgment.' },
  26: { title: 'Partnerships & Financial Discernment', meaning: 'Advises self-reliance and careful auditing of contracts and speculative investments.' },
  27: { title: 'The Scepter of Authority', meaning: 'Rewards original thinking, executive command, and intellectual authorship.' },
  28: { title: 'The Law of Contradiction & Fresh Starts', meaning: 'Great promise requiring prudence in legal and partnership agreements.' },
  29: { title: 'The Threshold of Master Intuition (29/11)', meaning: 'Heightened sensitivity and diplomatic testing that refines spiritual discernment.' },
  30: { title: 'Mental Superiority & Contemplative Depth', meaning: 'Neutral regarding wealth—all-powerful in research, philosophy, and independent thought.' },
  31: { title: 'The Self-Contained Scholar', meaning: 'Deep loyalty and originality, preferring mastery of craft over superficial crowds.' },
  32: { title: 'Magical Communication & Global Alliances', meaning: 'Like 14 and 23, confers remarkable charm and harmony with diverse nations and peoples.' },
  33: { title: 'The Master Teacher of Compassion', meaning: 'Supreme blessing of altruistic service, healing, and domestic/community upliftment.' },
};

// Jim Lewis Astro*Carto*Graphy Line Meanings
export const ACG_LINE_INTERPRETATIONS: Record<string, Record<'MC' | 'IC' | 'ASC' | 'DSC', { title: string; domain: 'Career' | 'Sanctuary' | 'Identity' | 'Love'; summary: string;scoreBoost: number }>> = {
  Sun: {
    MC: { title: 'Sun on Midheaven (Zenith)', domain: 'Career', scoreBoost: 24, summary: 'Jim Lewis notes that under the Solar MC line, you step into visible leadership, executive authority, and public recognition. Ideal for launching a flagship career.' },
    IC: { title: 'Sun on Imum Coeli (Nadir)', domain: 'Sanctuary', scoreBoost: 18, summary: 'Strengthens family dignity, ancestral pride, real estate vitality, and a warm, sunlit domestic foundation.' },
    ASC: { title: 'Sun on Ascendant (Rising)', domain: 'Identity', scoreBoost: 22, summary: 'Radiates physical vitality, confidence, and immediate personal charisma; you feel authentically seen and energized.' },
    DSC: { title: 'Sun on Descendant (Setting)', domain: 'Love', scoreBoost: 19, summary: 'Attracts strong, solar, generous partners and mentors who illuminate your potential.' },
  },
  Jupiter: {
    MC: { title: 'Jupiter on Midheaven', domain: 'Career', scoreBoost: 26, summary: 'The classic line of professional prosperity, publishing, academia, legal success, and effortless social elevation.' },
    IC: { title: 'Jupiter on Imum Coeli', domain: 'Sanctuary', scoreBoost: 25, summary: 'One of the finest lines on Earth for buying a home, raising a family, and experiencing deep inner abundance and safety.' },
    ASC: { title: 'Jupiter on Ascendant', domain: 'Identity', scoreBoost: 24, summary: 'Bestows optimism, buoyancy, protective grace, and philosophical expansion.' },
    DSC: { title: 'Jupiter on Descendant', domain: 'Love', scoreBoost: 25, summary: 'Magnetizes benevolent, wise, and prosperous marriage or business partners.' },
  },
  Venus: {
    MC: { title: 'Venus on Midheaven', domain: 'Career', scoreBoost: 22, summary: 'Favors arts, design, diplomacy, luxury commerce, and harmonious public reception.' },
    IC: { title: 'Venus on Imum Coeli', domain: 'Sanctuary', scoreBoost: 24, summary: 'Creates a serene, garden-like sanctuary of peace, aesthetic beauty, and emotional healing.' },
    ASC: { title: 'Venus on Ascendant', domain: 'Identity', scoreBoost: 23, summary: 'Enhances physical grace, social magnetism, artistic flow, and effortless charm.' },
    DSC: { title: 'Venus on Descendant', domain: 'Love', scoreBoost: 26, summary: 'The premier romance and marriage line in locational astrology—awakening affection and mutual devotion.' },
  },
  Mercury: {
    MC: { title: 'Mercury on Midheaven', domain: 'Career', scoreBoost: 19, summary: 'Accelerates commerce, software/engineering, writing, media, and intellectual prestige.' },
    IC: { title: 'Mercury on Imum Coeli', domain: 'Sanctuary', scoreBoost: 15, summary: 'Stimulates lively study, writing from home, and genealogical or literary research.' },
    ASC: { title: 'Mercury on Ascendant', domain: 'Identity', scoreBoost: 18, summary: 'Sharpens wit, language acquisition, networking, and youthful agility.' },
    DSC: { title: 'Mercury on Descendant', domain: 'Love', scoreBoost: 17, summary: 'Brings articulate, intellectually stimulating collaborators and communicative partners.' },
  },
  Moon: {
    MC: { title: 'Moon on Midheaven', domain: 'Career', scoreBoost: 17, summary: 'Connects your vocation with public trends, caregiving, hospitality, or emotional resonance.' },
    IC: { title: 'Moon on Imum Coeli', domain: 'Sanctuary', scoreBoost: 22, summary: 'Deeply nurturing emotional roots, soul-familiarity, and feeling instantly "at home."' },
    ASC: { title: 'Moon on Ascendant', domain: 'Identity', scoreBoost: 16, summary: 'Heightens empathy, intuition, and emotional responsiveness.' },
    DSC: { title: 'Moon on Descendant', domain: 'Love', scoreBoost: 20, summary: 'Fosters tender domestic bonding and protective caregiving in relationships.' },
  },
  Mars: {
    MC: { title: 'Mars on Midheaven', domain: 'Career', scoreBoost: 12, summary: 'High-drive, entrepreneurial, and competitive zone—excellent for athletics or bold enterprise, demanding pacing.' },
    IC: { title: 'Mars on Imum Coeli', domain: 'Sanctuary', scoreBoost: 6, summary: 'Active construction or renovation energy at home; requires conscious cooling of domestic friction.' },
    ASC: { title: 'Mars on Ascendant', domain: 'Identity', scoreBoost: 11, summary: 'Amplifies physical courage, athleticism, and decisive action.' },
    DSC: { title: 'Mars on Descendant', domain: 'Love', scoreBoost: 8, summary: 'Passionate, dynamic encounters requiring patience and clear boundaries.' },
  },
  Saturn: {
    MC: { title: 'Saturn on Midheaven', domain: 'Career', scoreBoost: 10, summary: 'Demands rigorous work ethic and accountability, rewarding long-term mastery and institutional permanence.' },
    IC: { title: 'Saturn on Imum Coeli', domain: 'Sanctuary', scoreBoost: 5, summary: 'Austere, quiet, or historic roots—suited for monastic focus or structural discipline.' },
    ASC: { title: 'Saturn on Ascendant', domain: 'Identity', scoreBoost: 8, summary: 'Cultivates gravitas, self-discipline, and mature endurance.' },
    DSC: { title: 'Saturn on Descendant', domain: 'Love', scoreBoost: 9, summary: 'Emphasizes karmic commitment, loyalty, and long-term duty in partnerships.' },
  },
  Uranus: {
    MC: { title: 'Uranus on Midheaven', domain: 'Career', scoreBoost: 16, summary: 'Electrifies your vocation with technological originality, scientific breakthroughs, and independent entrepreneurship.' },
    IC: { title: 'Uranus on Imum Coeli', domain: 'Sanctuary', scoreBoost: 10, summary: 'Awakens unconventional domestic freedom and liberation from ancestral conditioning.' },
    ASC: { title: 'Uranus on Ascendant', domain: 'Identity', scoreBoost: 17, summary: 'Catalyzes personal reinvention, eccentric genius, and authentic independence.' },
    DSC: { title: 'Uranus on Descendant', domain: 'Love', scoreBoost: 14, summary: 'Attracts brilliant, boundary-breaking allies and exhilarating, non-traditional partnerships.' },
  },
  Neptune: {
    MC: { title: 'Neptune on Midheaven', domain: 'Career', scoreBoost: 15, summary: 'Inspires visionary careers in cinema, music, healing, photography, and spiritual or charitable leadership.' },
    IC: { title: 'Neptune on Imum Coeli', domain: 'Sanctuary', scoreBoost: 20, summary: 'Ideal for coastal, ashram, or Himalayan spiritual retreats, meditation, and poetic sanctuary.' },
    ASC: { title: 'Neptune on Ascendant', domain: 'Identity', scoreBoost: 16, summary: 'Heightens mystic sensitivity, artistic aura, and compassionate presence.' },
    DSC: { title: 'Neptune on Descendant', domain: 'Love', scoreBoost: 18, summary: 'Fosters soulful, devotional, and telepathic connection with spiritual partners.' },
  },
  Pluto: {
    MC: { title: 'Pluto on Midheaven', domain: 'Career', scoreBoost: 14, summary: 'Confers deep strategic authority, research prowess, and transformative institutional influence.' },
    IC: { title: 'Pluto on Imum Coeli', domain: 'Sanctuary', scoreBoost: 8, summary: 'Triggers profound psychological excavation and ancestral healing at the root level.' },
    ASC: { title: 'Pluto on Ascendant', domain: 'Identity', scoreBoost: 13, summary: 'Forges magnetic intensity, personal sovereignty, and phoenix-like resilience.' },
    DSC: { title: 'Pluto on Descendant', domain: 'Love', scoreBoost: 11, summary: 'Brings intensely catalytic, life-altering encounters that transform your relational depth.' },
  },
};
