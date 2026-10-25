// Deep Personal Report Book Codex
// Synthesizes authentic classical & modern astrological/numerological treatises into clear,
// compassionate everyday language for laymen alongside exact textual citations:
//   1. Brihat Parashara Hora Shastra (BPHS — Maharishi Parashara, Ch. 7, 11–26, 29, 32, 40, 66)
//   2. Jaimini Upadesha Sutras (Maharishi Jaimini — Chara Karakas, Arudha Lagna, Upapada Lagna, Karakamsha)
//   3. Uttara Kalamrita (Mahakavi Kalidasa, Khanda 4, Shloka 27 — Indu Lagna / Dhana Lagna Kalas)
//   4. Phaladeepika (Mantreshwara, Ch. 6, 7, 8, 26 — Yogas, Gochara Transits & Sade Sati)
//   5. Brihat Jataka & Brihat Samhita (Varahamihira — Lunar Yogas, Constitutional Temperament, Vastu)
//   6. Jataka Parijata (Vaidyanatha Dikshita — Graha Paripakvata / Planetary Maturity Ages)
//   7. KP Reader Series IV & V (Prof. K.S. Krishnamurti — Cusp Sub-Lords & House Groupings)
//   8. Ayurvedic Astrology: Self-Healing Through the Stars (Dr. David Frawley — Vata/Pitta/Kapha Prakriti)
//   9. An Astrological Mandala & The Astrology of Fate (Dane Rudhyar & Liz Greene)
//  10. Cheiro's Book of Numbers (Count Louis Hamon — Chaldean 10–52 Compound Vibrations)
//  11. Numerology: Key to Your Inner Self (Hans Decoz — Pinnacles, Challenges & Karmic Lessons)

export interface CareerLordHouseGuide {
  house: number;
  headlineEn: string;
  headlineNe: string;
  laymanMeaningEn: string;
  laymanMeaningNe: string;
  modernCareersEn: string[];
  modernCareersNe: string[];
  sourceRef: string;
}

export const TENTH_LORD_IN_HOUSES: Record<number, CareerLordHouseGuide> = {
  1: {
    house: 1,
    headlineEn: 'Self-Made Builder & Personal Brand Leader',
    headlineNe: 'स्व-निर्मित नेतृत्व र स्वतन्त्र पहिचान',
    laymanMeaningEn:
      'Your career ruler sits directly in your 1st House of Self. Your name, reputation, and personal integrity ARE your profession—you thrive when you have autonomy, lead from the front, or build a founder/independent practice rather than hiding in bureaucracy.',
    laymanMeaningNe:
      'दशमेश प्रथम भावमा हुँदा तपाईंको व्यक्तित्व, इमानदारी र कार्यशैली नै करियरको मुख्य आधार बन्छ। स्वतन्त्र निर्णय, संस्थापक भूमिका वा प्रत्यक्ष नेतृत्वमा तपाईं सर्वाधिक सफल हुनुहुन्छ।',
    modernCareersEn: ['Founder / Entrepreneur', 'Executive Leadership', 'Independent Consulting', 'Medicine & Wellness', 'Public Representation'],
    modernCareersNe: ['उद्यमी / संस्थापक', 'कार्यकारी नेतृत्व', 'स्वतन्त्र परामर्श', 'स्वास्थ्य र चिकित्सा', 'सार्वजनिक नेतृत्व'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 109',
  },
  2: {
    house: 2,
    headlineEn: 'Wealth Stewardship, Voice & High-Trust Advisory',
    headlineNe: 'वित्त व्यवस्थापन, वाणी र विश्वसनीय परामर्श',
    laymanMeaningEn:
      'Your career ruler links directly to your 2nd House of Treasury and Speech (forming a classical Dhana-Karma link). You earn best through financial acumen, authoritative communication, family/heritage enterprises, banking, or high-value domain expertise.',
    laymanMeaningNe:
      'दशमेश धन र वाणीको द्वितीय भावमा रहँदा वाक्-कला, बैंकिङ, वित्त व्यवस्थापन, पारिवारिक व्यवसाय वा विशेषज्ञ परामर्शबाट दिगो धन र प्रतिष्ठा आर्जन हुन्छ।',
    modernCareersEn: ['Finance, Banking & Treasury', 'Law & Persuasive Advocacy', 'Education & Speaking', 'Food / Hospitality / Luxury', 'Family Enterprise'],
    modernCareersNe: ['बैंकिङ र वित्त व्यवस्थापन', 'कानुन र वकालत', 'शिक्षण र प्रशिक्षण', 'आतिथ्य र खाद्य उद्यम', 'पारिवारिक व्यापार'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 110',
  },
  3: {
    house: 3,
    headlineEn: 'Communicator, Media Strategist & Agile Initiator',
    headlineNe: 'सञ्चार, प्रविधि र साहसी पहलकर्ता',
    laymanMeaningEn:
      'Your career ruler sits in the 3rd House of Courage, Media, and Hands-On Skill. Career breakthroughs come when you write, publish, sell, code, market, or launch bold initiatives—and often involve short travel, digital platforms, or sibling/peer alliances.',
    laymanMeaningNe:
      'दशमेश पराक्रम र सञ्चारको तृतीय भावमा हुँदा लेखन, मिडिया, सफ्टवेयर, मार्केटिङ, बिक्री कला र आफ्नै साहसी प्रयासबाट करियरमा फड्को मारिन्छ।',
    modernCareersEn: ['Software, Product & Digital Media', 'Marketing, Sales & Journalism', 'Design & Craftsmanship', 'Logistics & Aviation', 'Startup Operations'],
    modernCareersNe: ['सफ्टवेयर र डिजिटल प्रविधि', 'पत्रकारिता र मार्केटिङ', 'डिजाइन र सीपमूलक कार्य', 'यातायात र आपूर्ति', 'व्यापार विस्तार'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 111',
  },
  4: {
    house: 4,
    headlineEn: 'Architect of Foundations, Real Estate & Institutional Roots',
    headlineNe: 'घर-जग्गा, पूर्वाधार, शिक्षा र स्थायित्वको निर्माण',
    laymanMeaningEn:
      'Your career ruler anchors the 4th House of Home, Land, Vehicles, and Education. People naturally trust your calm stability—making you gifted in real estate, architecture, infrastructure, academia, agriculture, or working from a strong home/institutional base.',
    laymanMeaningNe:
      'दशमेश चतुर्थ भावमा रहँदा भूमि, घर-जग्गा, निर्माण, कृषि, शैक्षिक संस्था, सवारी वा जनकल्याणकारी प्रशासनमा उच्च सम्मान र स्थिर सफलता प्राप्त हुन्छ।',
    modernCareersEn: ['Real Estate & Architecture', 'Civil / Systems Infrastructure', 'Higher Academia & Psychology', 'Automotive & Clean Energy', 'Public Welfare'],
    modernCareersNe: ['घर-जग्गा र वास्तुकला', 'पूर्वाधार र इन्जिनियरिङ', 'शिक्षा र मनोविज्ञान', 'सवारी र ऊर्जा क्षेत्र', 'सामुदायिक सेवा'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 112',
  },
  5: {
    house: 5,
    headlineEn: 'Strategic Thinker, Creator & Intellectual Mentor (Raja Yoga)',
    headlineNe: 'सृजनात्मक प्रज्ञा, रणनीति र परामर्श (राजयोग कारक)',
    laymanMeaningEn:
      'A classic Kendra-Trikona Raja Yoga placement: your 10th Lord in the 5th House blends career action with sharp creative intelligence. You excel where judgment, strategy, product creation, investments, authorship, or mentoring younger minds matters more than routine labor.',
    laymanMeaningNe:
      'दशमेश पञ्चम त्रिकोणमा रहनु उच्च राजयोगको लक्षण हो। बौद्धिक रणनीति, लगानी विश्लेषण, सृजनात्मक लेखन/निर्माण, अनुसन्धान र शिक्षणमा तपाईंको विशेष दक्षता रहन्छ।',
    modernCareersEn: ['Investment Strategy & Analytics', 'Product / Creative Direction', 'Teaching, Coaching & Authorship', 'AI, Data & Research', 'Entertainment & Arts'],
    modernCareersNe: ['लगानी र वित्तीय विश्लेषण', 'उत्पादन र सृजनात्मक निर्देशन', 'प्राध्यापन र लेखन', 'डाटा विज्ञान र अनुसन्धान', 'कला र संस्कृति'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 113',
  },
  6: {
    house: 6,
    headlineEn: 'Master Problem-Solver, Healer & Precision Specialist',
    headlineNe: 'समस्या समाधान, चिकित्सा, न्याय र सेवा दक्षता',
    laymanMeaningEn:
      'Your career ruler sits in the 6th House of Diagnostics, Service, and Overcoming Obstacles. You shine brightest when things are complex or broken—medicine, law, engineering debugging, auditing, public service, or operations where precision defeats chaos.',
    laymanMeaningNe:
      'दशमेश षष्ठ भावमा हुँदा जटिल समस्या सुल्झाउने काम—चिकित्सा, कानुन, लेखापरीक्षण, प्रशासनिक सेवा वा प्राविधिक परीक्षणमा प्रतिस्पर्धीभन्दा अगाडि रहिन्नछ।',
    modernCareersEn: ['Medicine, Nursing & Diagnostics', 'Litigation, Compliance & Auditing', 'Cybersecurity & QA Engineering', 'Civil / Defense Service', 'Operations Management'],
    modernCareersNe: ['चिकित्सा र स्वास्थ्य सेवा', 'कानुन र लेखापरीक्षण', 'साइबर सुरक्षा र प्रविधि', 'निजामती वा सुरक्षा सेवा', 'सञ्चालन व्यवस्थापन'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 114',
  },
  7: {
    house: 7,
    headlineEn: 'Deal-Maker, Client Diplomat & Partnership Builder',
    headlineNe: 'साझेदारी, व्यापार सम्झौता र कूटनीतिक नेतृत्व',
    laymanMeaningEn:
      'Your career ruler occupies the 7th House of Partnerships, Trade, and Public Relations. Your professional ascent multiplies through high-trust alliances, B2B commerce, legal/client advisory, international trade, or co-building alongside strong partners.',
    laymanMeaningNe:
      'दशमेश सप्तम केन्द्रमा हुँदा व्यापारिक साझेदारी, वाणिज्य, कूटनीति, ग्राहक सम्बन्ध र अन्तर्राष्ट्रिय व्यापारबाट करियरको उचाइ प्राप्त हुन्छ।',
    modernCareersEn: ['Business Partnerships & Trade', 'Management / Legal Consulting', 'Diplomacy & Client Relations', 'Retail & E-Commerce', 'Marriage / Organizational Advisory'],
    modernCareersNe: ['व्यापार र वाणिज्य साझेदारी', 'व्यवस्थापन र कानुनी परामर्श', 'कूटनीति र जनसम्पर्क', 'आयात-निर्यात र ई-कमर्स', 'संस्थागत समन्वय'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 115',
  },
  8: {
    house: 8,
    headlineEn: 'Deep Researcher, Risk Strategist & Turnaround Specialist',
    headlineNe: 'गहिरो अनुसन्धान, जोखिम व्यवस्थापन र रूपान्तरण विशेषज्ञ',
    laymanMeaningEn:
      'Your career ruler sits in the 8th House of Hidden Systems, Research, and Shared Capital. Conventional surface jobs bore you—you thrive in R&D, insurance/tax/actuarial finance, psychology, surgery, crisis turnarounds, or uncovering insights others miss. Career often pivots into its true groove after age 30–34.',
    laymanMeaningNe:
      'दशमेश अष्टम भावमा हुँदा सतही कामभन्दा गहिरो अनुसन्धान, बीमा, कर/वित्त, मनोविज्ञान, खनिज वा संकट व्यवस्थापनमा विशेष सफलता मिल्छ; ३० वर्षपछि करियरले बलियो मोड लिन्छ।',
    modernCareersEn: ['Scientific / Deep-Tech R&D', 'Insurance, Tax & Risk Finance', 'Psychology & Investigative Work', 'Surgical / Regenerative Medicine', 'Turnaround Strategy'],
    modernCareersNe: ['वैज्ञानिक र प्राविधिक अनुसन्धान', 'बीमा, कर र जोखिम विश्लेषण', 'मनोविज्ञान र अन्वेषण', 'शल्यचिकित्सा र उपचार', 'पुनर्संरचना रणनीति'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 116',
  },
  9: {
    house: 9,
    headlineEn: 'Visionary Educator, Global Strategist & Ethical Leader (Dharma-Karma Yoga)',
    headlineNe: 'धर्म-कर्माधिपति योग — उच्च ज्ञान, अन्तर्राष्ट्रिय क्षितिज र नीति नेतृत्व',
    laymanMeaningEn:
      'One of Vedic astrology’s highest blessings (Dharma-Karmadhipati Yoga): your 10th Lord in the 9th House aligns daily work with higher purpose, mentors, ethics, law, universities, publishing, or cross-border ventures.',
    laymanMeaningNe:
      'दशमेश नवम भाग्य भावमा रहनु उच्च धर्म-कर्माधिपति राजयोग हो। उच्च शिक्षा, नीति निर्माण, न्याय, प्रकाशन, अन्तर्राष्ट्रिय सहकार्य र गुरुजनको आशीर्वादबाट कीर्ति बढ्छ।',
    modernCareersEn: ['Higher Education & Thought Leadership', 'International Business & Law', 'Policy, Ethics & Governance', 'Publishing & Philosophy', 'Advisory & Mentorship'],
    modernCareersNe: ['उच्च शिक्षा र प्राध्यापन', 'अन्तर्राष्ट्रिय व्यापार र कानुन', 'नीति निर्माण र सुशासन', 'प्रकाशन र दर्शन', 'मार्गदर्शन र परामर्श'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 117 & Ch. 40',
  },
  10: {
    house: 10,
    headlineEn: 'Natural Pillar of Authority & Institutional Command',
    headlineNe: 'स्वगृही कर्म बल — उच्च पद, संस्थागत प्रतिष्ठा र स्थायी उपलब्धि',
    laymanMeaningEn:
      'Your career ruler sits directly in its own 10th House of Zenith and Reputation. You carry unmistakable professional gravity—earning respect through competence, building lasting institutions, and rising steadily into executive or civic leadership.',
    laymanMeaningNe:
      'दशमेश दशम भावमै रहँदा कर्मबल अत्यन्त सुदृढ हुन्छ। कार्यदक्षता, प्रशासनिक नेतृत्व र दिगो संस्था निर्माणबाट समाजमा उच्च प्रतिष्ठा स्थापित हुन्छ।',
    modernCareersEn: ['C-Suite / Institutional Leadership', 'Public Administration & Policy', 'Engineering & Enterprise Architecture', 'Corporate Governance', 'Industry Standard-Bearer'],
    modernCareersNe: ['उच्च कार्यकारी नेतृत्व', 'सार्वजनिक प्रशासन र नीति', 'इन्जिनियरिङ र संस्थागत निर्माण', 'संस्थागत सुशासन', 'उद्योग नेतृत्व'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 118',
  },
  11: {
    house: 11,
    headlineEn: 'Network Multiplier, Scalable Enterprise & Compounding Gains',
    headlineNe: 'सञ्जाल विस्तार, व्यापारिक लाभ र बृहत् लक्ष्य प्राप्ति',
    laymanMeaningEn:
      'Your career ruler sits in the 11th House of Gains, Communities, and Big Ambitions. Your work naturally scales across large networks, platforms, organizations, or multi-stream businesses—turning professional reputation directly into financial abundance and loyal allies.',
    laymanMeaningNe:
      'दशमेश एकादश लाभ भावमा हुँदा ठूला सञ्जाल, प्लेटफर्म व्यवसाय, सामूहिक परियोजना र बहु-स्रोत आम्दानीबाट करियर र धन दुवै फस्टाउँछन्।',
    modernCareersEn: ['Scalable Tech & Platform Business', 'Venture / Growth Leadership', 'Community & Industry Associations', 'Commercial Trade & Distribution', ' FinTech & Networks'],
    modernCareersNe: ['प्रविधि र प्लेटफर्म उद्यम', 'व्यापार विस्तार र लगानी', 'सामुदायिक तथा व्यावसायिक सञ्जाल', 'वाणिज्य र वितरण', 'बहु-आयामिक व्यवसाय'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 119',
  },
  12: {
    house: 12,
    headlineEn: 'Global / Cross-Border Specialist & Behind-the-Scenes Architect',
    headlineNe: 'वैदेशिक क्षेत्र, अनुसन्धान र नेपथ्यको उच्च विशेषज्ञता',
    laymanMeaningEn:
      'Your career ruler sits in the 12th House of Distant Horizons, Global Links, Retreat, and Healing Institutions. You often achieve your biggest career breakthroughs abroad, working remotely with international teams, or inside research labs, hospitals, creative studios, and spiritual/humanitarian organizations.',
    laymanMeaningNe:
      'दशमेश द्वादश भावमा रहँदा वैदेशिक रोजगारी/व्यापार, बहुराष्ट्रिय सहकार्य, अस्पताल/चिकित्सा, अनुसन्धान प्रयोगशाला वा आध्यात्मिक-मानवीय संस्थामा विशेष प्रगति हुन्छ।',
    modernCareersEn: ['Global / Multinational Remote Work', 'Hospitals, Healing & Wellness Retreats', 'Export-Import & Aviation', 'Deep Research, Film & Studio Arts', 'Philanthropy & NGOs'],
    modernCareersNe: ['वैदेशिक तथा अन्तर्राष्ट्रिय कार्य', 'अस्पताल र स्वास्थ्य सेवा', 'आयात-निर्यात र उड्डयन', 'अनुसन्धान र स्टुडियो कला', 'परोपकारी तथा सामाजिक संस्था'],
    sourceRef: 'Brihat Parashara Hora Shastra, Ch. 24, Shloka 120',
  },
};

export interface DashamshaDikpalaInfo {
  index: number; // 0..9
  deity: string;
  directionEn: string;
  directionNe: string;
  archetypeEn: string;
  archetypeNe: string;
  laymanCareerStyleEn: string;
  laymanCareerStyleNe: string;
}

// BPHS Ch. 7: 10 Directional Guardians (Dikpalas) of the D10 Dashamsha Career Chart
export const DASHAMSHA_DIKPALAS: DashamshaDikpalaInfo[] = [
  {
    index: 0,
    deity: 'Indra',
    directionEn: 'East',
    directionNe: 'पूर्व',
    archetypeEn: 'Executive Command & Sovereign Leadership',
    archetypeNe: 'कार्यकारी नेतृत्व र निर्णय क्षमता',
    laymanCareerStyleEn: 'Natural authority to lead teams, set vision, and take decisive responsibility under pressure.',
    laymanCareerStyleNe: 'टोलीको नेतृत्व गर्ने, स्पष्ट दृष्टिकोण राख्ने र जिम्मेवारी लिने स्वाभाविक क्षमता।',
  },
  {
    index: 1,
    deity: 'Agni',
    directionEn: 'Southeast',
    directionNe: 'आग्नेय (दक्षिण-पूर्व)',
    archetypeEn: 'Technical Innovation, Engineering & Transformation',
    archetypeNe: 'प्रविधि, इन्जिनियरिङ र नवप्रवर्तन',
    laymanCareerStyleEn: 'Thrives in engineering, software, energy, metallurgy, culinary/chemical craft, and rapid problem-forging.',
    laymanCareerStyleNe: 'प्रविधि, इन्जिनियरिङ, ऊर्जा र सृजनात्मक रूपान्तरणका क्षेत्रमा तीक्ष्ण दक्षता।',
  },
  {
    index: 2,
    deity: 'Yama',
    directionEn: 'South',
    directionNe: 'दक्षिण',
    archetypeEn: 'Law, Auditing, Standards & Ethical Order',
    archetypeNe: 'न्याय, अनुशासन, लेखापरीक्षण र गुणस्तर',
    laymanCareerStyleEn: 'Unmatched integrity in law, compliance, medicine, governance, operations, and upholding rigorous standards.',
    laymanCareerStyleNe: 'कानुन, प्रशासन, गुणस्तर नियन्त्रण र निष्पक्ष न्यायिक कार्यमा उच्च निष्ठा।',
  },
  {
    index: 3,
    deity: 'Nirriti',
    directionEn: 'Southwest',
    directionNe: 'नैऋत्य (दक्षिण-पश्चिम)',
    archetypeEn: 'Crisis Turnaround, Security & Disruptive Breakthroughs',
    archetypeNe: 'संकट समाधान, सुरक्षा र गहिरो रूपान्तरण',
    laymanCareerStyleEn: 'Fearless at fixing legacy bottlenecks, cybersecurity, investigative research, and unconventional industries.',
    laymanCareerStyleNe: 'जटिल संकट सुल्झाउने, अनुसन्धान र अपरम्परागत क्षेत्रमा साहसिक सफलता।',
  },
  {
    index: 4,
    deity: 'Varuna',
    directionEn: 'West',
    directionNe: 'पश्चिम',
    archetypeEn: 'Global Commerce, Diplomacy & Public Trust',
    archetypeNe: 'अन्तर्राष्ट्रिय वाणिज्य, कूटनीति र जनविश्वास',
    laymanCareerStyleEn: 'Excels in international trade, maritime/global networks, diplomacy, hospitality, and long-term contracts.',
    laymanCareerStyleNe: 'अन्तर्राष्ट्रिय व्यापार, कूटनीति र दीर्घकालीन सम्झौताहरूमा विश्वसनीय छवि।',
  },
  {
    index: 5,
    deity: 'Vayu',
    directionEn: 'Northwest',
    directionNe: 'वायव्य (उत्तर-पश्चिम)',
    archetypeEn: 'Communications, Media, Mobility & Agile Networks',
    archetypeNe: 'सञ्चार, मिडिया, गतिशीलता र सञ्जाल',
    laymanCareerStyleEn: 'Built for fast-moving information, digital platforms, aviation/logistics, consulting, and connecting markets.',
    laymanCareerStyleNe: 'सञ्चार, डिजिटल माध्यम, परामर्श र तीव्र समन्वयमा विशेष निपुणता।',
  },
  {
    index: 6,
    deity: 'Kubera',
    directionEn: 'North',
    directionNe: 'उत्तर',
    archetypeEn: 'Treasury, Banking, Capital Allocation & Commerce',
    archetypeNe: 'कोष, बैंकिङ, पुँजी व्यवस्थापन र समृद्धि',
    laymanCareerStyleEn: 'Strong instinct for capital stewardship, FinTech, asset management, profitable trade, and sustainable wealth.',
    laymanCareerStyleNe: 'वित्त, बैंकिङ, लगानी र दिगो सम्पत्ति निर्माणमा स्वाभाविक सुझबुझ।',
  },
  {
    index: 7,
    deity: 'Ishana',
    directionEn: 'Northeast',
    directionNe: 'ईशान (उत्तर-पूर्व)',
    archetypeEn: 'Wisdom, Healing, Academia & Ethical Advisory',
    archetypeNe: 'ज्ञान, चिकित्सा, प्राध्यापन र नैतिक मार्गदर्शन',
    laymanCareerStyleEn: 'Brings clarity as a teacher, physician, counselor, researcher, or trusted advisor guided by conscience.',
    laymanCareerStyleNe: 'शिक्षण, चिकित्सा, अनुसन्धान र सात्त्विक परामर्शबाट समाजमा उच्च आदर।',
  },
  {
    index: 8,
    deity: 'Brahma',
    directionEn: 'Zenith',
    directionNe: 'ऊर्ध्व (आकाश)',
    archetypeEn: 'Original Architecture, Design & System Creation',
    archetypeNe: 'मौलिक सिर्जना, प्रणाली निर्माण र वास्तुकला',
    laymanCareerStyleEn: 'Gifted at conceiving original products, books, architectures, and institutions from a blank page.',
    laymanCareerStyleNe: 'शून्यबाट नयाँ प्रणाली, पुस्तक, डिजाइन वा संस्था खडा गर्ने मौलिक प्रतिभा।',
  },
  {
    index: 9,
    deity: 'Ananta',
    directionEn: 'Nadir',
    directionNe: 'अधो (आधार)',
    archetypeEn: 'Foundational Infrastructure, Land & Long-Horizon Preservation',
    archetypeNe: 'आधारभूत संरचना, भूमि र दीर्घकालीन स्थायित्व',
    laymanCareerStyleEn: 'Sustains bedrock systems—real estate, earth sciences, heritage preservation, database/core infrastructure.',
    laymanCareerStyleNe: 'भूमि, खनिज, डेटाबेस वा दीर्घकालीन आधारशिला जोगाउने र धान्ने क्षमता।',
  },
];

// Jaimini Upadesha Sutras: Darakaraka (Lowest-Degree Planet) Spouse & Partnership Portrait
export const DARAKARAKA_SPOUSE_PORTRAITS: Record<
  string,
  {
    archetypeEn: string;
    archetypeNe: string;
    partnerQualitiesEn: string;
    partnerQualitiesNe: string;
    relationshipAdviceEn: string;
    relationshipAdviceNe: string;
  }
> = {
  Sun: {
    archetypeEn: 'Dignified, Self-Respecting & Protective Partner',
    archetypeNe: 'स्वाभिमानी, भरपर्दो र नेतृत्वदायी जीवनसाथी',
    partnerQualitiesEn:
      'In Jaimini Sutras, Sun as Darakaraka attracts a partner with strong backbone, moral clarity, leadership presence, and family pride—someone reliable who takes commitments seriously.',
    partnerQualitiesNe:
      'जैमिनी सूत्र अनुसार सूर्य दाराकारक हुँदा आत्मविश्वासी, स्पष्ट विचार भएको, जिम्मेवार र स्वाभिमानी जीवनसाथी प्राप्त हुने योग बन्छ।',
    relationshipAdviceEn:
      'Give each other visible respect in public and never turn minor disagreements into ego contests.',
    relationshipAdviceNe:
      'एक-अर्काको आत्मसम्मानको कदर गर्नुहोस् र साना कुरामा अहंकारको टकराव हुन नदिनुहोस्।',
  },
  Moon: {
    archetypeEn: 'Empathetic, Nurturing & Emotionally Attuned Partner',
    archetypeNe: 'संवेदनशील, स्नेही र घरेलु शान्ति प्रेमी जीवनसाथी',
    partnerQualitiesEn:
      'Moon as Darakaraka draws a caring, intuitive, family-hearted partner who values emotional closeness, shared meals, a peaceful home, and genuine tenderness.',
    partnerQualitiesNe:
      'चन्द्रमा दाराकारक हुँदा कोमल मन भएको, पारिवारिक आत्मीयता रुचाउने र भावनात्मक रूपले बुझ्ने जीवनसाथीको साथ मिल्छ।',
    relationshipAdviceEn:
      'Consistent emotional reassurance and quality unhurried time at home keep your bond deeply secure.',
    relationshipAdviceNe:
      'नियमित आत्मीय संवाद र घरको शान्त वातावरणले सम्बन्धलाई सदा प्रगाढ राख्छ।',
  },
  Mars: {
    archetypeEn: 'Energetic, Direct, Courageous & Action-Oriented Partner',
    archetypeNe: 'ऊर्जावान्, स्पष्टवक्ता र साहसी जीवनसाथी',
    partnerQualitiesEn:
      'Mars as Darakaraka attracts an active, forthright, protective partner with strong drive and loyalty—someone who acts decisively rather than speaking in riddles.',
    partnerQualitiesNe:
      'मङ्गल दाराकारक हुँदा उत्साही, निडर, स्पष्ट बोल्ने र संकटमा ढाल बनेर उभिने कर्मशील जीवनसाथीतर्फ आकर्षण हुन्छ।',
    relationshipAdviceEn:
      'Channel shared energy into travel, fitness, or building projects together, and pause 10 seconds before replying in heated moments.',
    relationshipAdviceNe:
      'साझा लक्ष्य र सक्रिय कार्यमा ऊर्जा जोड्नुहोस्; आवेशको क्षणमा धैर्यपूर्वक संवाद गर्नुहोस्।',
  },
  Mercury: {
    archetypeEn: 'Witty, Articulate, Curious & Youthful Partner',
    archetypeNe: 'बौद्धिक, मिलनसार र संवादप्रेमी जीवनसाथी',
    partnerQualitiesEn:
      'Mercury as Darakaraka points to an intelligent, conversational, adaptable partner—friendship, humor, shared learning, and mental chemistry form the heart of your romance.',
    partnerQualitiesNe:
      'बुध दाराकारक हुँदा चतुर, मित्रवत्, अध्ययनशील र हास्यचेत भएको बौद्धिक जीवनसाथीसँग गहिरो मित्रतापूर्ण सम्बन्ध बन्छ।',
    relationshipAdviceEn:
      'Keep curiosity alive through deep conversations and shared trips, while ensuring feelings are felt—not just over-analyzed.',
    relationshipAdviceNe:
      'खुला संवाद र मित्रतालाई जीवित राख्नुहोस्, र भावनालाई तर्कले मात्र नतौलनुहोस्।',
  },
  Jupiter: {
    archetypeEn: 'Wise, Principled, Generous & Growth-Minded Partner',
    archetypeNe: 'विवेकी, संस्कारयुक्त र मार्गदर्शक स्वभावको जीवनसाथी',
    partnerQualitiesEn:
      'Jupiter as Darakaraka is celebrated in classical Jyotish for bringing a sincere, ethical, broad-minded partner who uplifts your wisdom, family values, and long-term prosperity.',
    partnerQualitiesNe:
      'बृहस्पति दाराकारक हुनु शुभ मानिन्छ—यसले उदार, नैतिकवान्, ज्ञानी र परिवारलाई जोड्ने संस्कारयुक्त जीवनसाथीको संकेत गर्छ।',
    relationshipAdviceEn:
      'Share inspiring long-term goals, learning, or community values, and appreciate your partner as an equal teammate rather than a lecturer.',
    relationshipAdviceNe:
      'साझा जीवन-दर्शन र दीर्घकालीन लक्ष्य बनाउनुहोस् तथा परस्पर आदरभाव कायम राख्नुहोस्।',
  },
  Venus: {
    archetypeEn: 'Affectionate, Refined, Artistic & Harmonious Partner',
    archetypeNe: 'कलाप्रेमी, मधुर भाषी र सौन्दर्यचेत भएको जीवनसाथी',
    partnerQualitiesEn:
      'Venus as Darakaraka attracts a charming, warm, aesthetically refined partner who values romance, grace, beauty, comfort, and peaceful diplomacy.',
    partnerQualitiesNe:
      'शुक्र दाराकारक हुँदा आकर्षक, प्रेमिल, कला र सौन्दर्य प्रेमी तथा शान्तिपूर्ण व्यवहार रुचाउने जीवनसाथी प्राप्त हुन्छ।',
    relationshipAdviceEn:
      'Keep romance, small gestures of appreciation, and beauty alive in daily life—and address hard topics gently rather than sweeping them under the rug.',
    relationshipAdviceNe:
      'दैनिक जीवनमा स्नेह र कृतज्ञता व्यक्त गरिरहनुहोस् र आवश्यक कुरा स्पष्ट तर नम्रतापूर्वक राख्नुहोस्।',
  },
  Saturn: {
    archetypeEn: 'Loyal, Mature, Steadfast & Rock-Solid Lifelong Partner',
    archetypeNe: 'परिपक्व, निष्ठावान् र दीर्घकालीन साथ दिने जीवनसाथी',
    partnerQualitiesEn:
      'Saturn as Darakaraka favors serious, enduring commitment over fleeting infatuation—attracting a mature, hardworking, deeply loyal partner whose devotion grows stronger decade after decade.',
    partnerQualitiesNe:
      'शनि दाराकारक हुँदा सतही आकर्षणभन्दा गहिरो कर्तव्यबोध, परिपक्वता र जीवनभर अटल साथ दिने विश्वासी जीवनसाथी मिल्छ।',
    relationshipAdviceEn:
      'Balance duty and work schedules with intentional warmth, playfulness, and verbal affection so love never feels purely transactional.',
    relationshipAdviceNe:
      'जिम्मेवारी र कामकाजको बीचमा स्नेह, मुस्कान र आत्मीय समय निकाल्न नबिर्सनुहोस्।',
  },
};

// Jaimini Atmakaraka (Highest-Degree Planet) Soul Lesson
export const ATMAKARAKA_SOUL_PATHS: Record<
  string,
  { titleEn: string; titleNe: string; lessonEn: string; lessonNe: string }
> = {
  Sun: {
    titleEn: 'Authentic Leadership Without Ego',
    titleNe: 'अहंकाररहित सात्त्विक नेतृत्व',
    lessonEn:
      'With Sun as your Soul Significator (Atmakaraka — BPHS Ch. 32), your deepest growth comes from leading with quiet integrity and generosity while learning humility when delegating or accepting help.',
    lessonNe:
      'सूर्य आत्मकारक हुँदा विनम्रतापूर्वक साँचो नेतृत्व गर्नु र अरूको योगदानलाई सम्मान गर्नु तपाईंको आत्माको मुख्य पाठ हो।',
  },
  Moon: {
    titleEn: 'Compassion, Emotional Wisdom & Nurturing',
    titleNe: 'करुणा, मानसिक समता र आत्मीयता',
    lessonEn:
      'With Moon as your Atmakaraka, your soul thrives through empathy, caring for family and community, and keeping calm inner poise without absorbing everyone else’s turbulence.',
    lessonNe:
      'चन्द्रमा आत्मकारक हुँदा करुणा, पारिवारिक स्नेह र मनको शान्त समता कायम राख्नु जीवनको परम उद्देश्य बन्छ।',
  },
  Mars: {
    titleEn: 'Principled Courage & Non-Reactive Strength',
    titleNe: 'संयमित साहस र अहिंसात्मक शक्ति',
    lessonEn:
      'With Mars as your Atmakaraka, your life school teaches turning raw drive and impatience into disciplined mastery, protective courage, and calm restraint under provocation.',
    lessonNe:
      'मङ्गल आत्मकारक हुँदा आवेगलाई अनुशासित कर्मशक्ति र धैर्यपूर्ण साहसमा रूपान्तरण गर्नु मुख्य साधना हो।',
  },
  Mercury: {
    titleEn: 'Truthful Speech & Applied Wisdom',
    titleNe: 'सत्य वाणी र विवेकपूर्ण ज्ञान',
    lessonEn:
      'With Mercury as your Atmakaraka, your words carry karmic weight—speaking truthfully, simplifying complexity for others, and turning cleverness into genuine wisdom elevates your whole life.',
    lessonNe:
      'बुध आत्मकारक हुँदा सत्य, हितकर र स्पष्ट वाणी बोल्नु तथा ज्ञानलाई व्यवहारमा उतार्नु जीवनको मूल मार्ग हो।',
  },
  Jupiter: {
    titleEn: 'Living Ethics, Mentorship & Stewardship',
    titleNe: 'धर्म, गुरुत्व र उदार मार्गदर्शन',
    lessonEn:
      'With Jupiter as your Atmakaraka, you are here to embody ethical generosity, respect mentors and children, and walk your talk rather than merely preaching ideals.',
    lessonNe:
      'बृहस्पति आत्मकारक हुँदा नैतिक आचरण, गुरु एवं सन्तानप्रतिको कर्तव्य र ज्ञानको उदार साझेदारीले जीवन सार्थक बन्छ।',
  },
  Venus: {
    titleEn: 'Pure Devotion, Integrity in Love & Creative Grace',
    titleNe: 'पवित्र प्रेम, निष्ठा र सृजनात्मक सौन्दर्य',
    lessonEn:
      'With Venus as your Atmakaraka, relationships and beauty are your spiritual mirror—honoring loyalty, emotional honesty, and creative refinement unlocks lasting joy.',
    lessonNe:
      'शुक्र आत्मकारक हुँदा सम्बन्धमा निष्ठा, पवित्र स्नेह र कलात्मक सिर्जनाबाट आत्मिक आनन्द प्राप्त हुन्छ।',
  },
  Saturn: {
    titleEn: 'Resilient Service, Patience & Quiet Mastery',
    titleNe: 'सेवाभाव, धैर्य र अटल कर्मयोग',
    lessonEn:
      'With Saturn as your Atmakaraka, you carry deep empathy for real-world struggle—never cutting ethical corners and lifting others up as you build enduring structures.',
    lessonNe:
      'शनि आत्मकारक हुँदा दुःख बुझ्ने संवेदना, इमानदार परिश्रम र दीर्घकालीन सेवाभाव नै सर्वोच्च उन्नतिको आधार हो।',
  },
};

// Rahu-Ketu House Axis (1..12 where Rahu sits; Ketu sits opposite)
export const RAHU_KETU_AXIS_GUIDE: Record<
  number,
  { rahuGrowthEn: string; ketuGiftEn: string; rahuGrowthNe: string; ketuGiftNe: string }
> = {
  1: {
    ketuGiftEn: 'Natural diplomat who easily reads partners and puts others first (Ketu in H7).',
    rahuGrowthEn: 'This life asks you to claim your own voice, healthy independence, and bold self-definition (Rahu in H1).',
    ketuGiftNe: 'अरूको भावना बुझ्ने र समन्वय गर्ने सहज गुण (सप्तम केतु)।',
    rahuGrowthNe: 'यस जीवनमा आफ्नै स्वतन्त्र पहिचान, आत्मबल र अग्रसरता विकास गर्नु मुख्य लक्ष्य हो (प्रथम राहु)।',
  },
  2: {
    ketuGiftEn: 'Instinctive crisis radar and psychological depth under pressure (Ketu in H8).',
    rahuGrowthEn: 'Build calm, transparent personal savings, steady family roots, and grounded speech (Rahu in H2).',
    ketuGiftNe: 'गहिरो अनुसन्धान र संकट बुझ्ने जन्मजात क्षमता (अष्टम केतु)।',
    rahuGrowthNe: 'पारदर्शी बचत, स्थिर पारिवारिक आधार र मधुर वाणी निर्माणमा ध्यान दिनुहोस् (द्वितीय राहु)।',
  },
  3: {
    ketuGiftEn: 'Innate philosophical intuition and big-picture wisdom (Ketu in H9).',
    rahuGrowthEn: 'Turn philosophy into daily hands-on execution, writing, communication, and courageous action (Rahu in H3).',
    ketuGiftNe: 'दार्शनिक सोच र उच्च नैतिक बोधको सहज गुण (नवम केतु)।',
    rahuGrowthNe: 'सोचलाई व्यावहारिक सीप, सञ्चार र दैनिक साहसिक कदममा उतार्दा ठूलो सफलता मिल्छ (तृतीय राहु)।',
  },
  4: {
    ketuGiftEn: 'Natural comfort with public duty, career responsibility, and achievement (Ketu in H10).',
    rahuGrowthEn: 'Remember to build a peaceful inner sanctuary, emotional warmth, and true home life alongside ambition (Rahu in H4).',
    ketuGiftNe: 'कार्यक्षेत्र र सामाजिक जिम्मेवारी निभाउने सहज बानी (दशम केतु)।',
    rahuGrowthNe: 'बाहिरी दौडधूपसँगै मनको शान्ति, घरपरिवार र भावनात्मक सन्तुलन बसाउनु आवश्यक छ (चतुर्थ राहु)।',
  },
  5: {
    ketuGiftEn: 'Easy awareness of collective trends, networks, and group dynamics (Ketu in H11).',
    rahuGrowthEn: 'Step out of the crowd to express your own original creativity, heart-led joy, and mentorship (Rahu in H5).',
    ketuGiftNe: 'सामूहिक सञ्जाल र समाजको प्रवाह बुझ्ने सहज क्षमता (एकादश केतु)।',
    rahuGrowthNe: 'आफ्नै मौलिक सृजनात्मकता, बौद्धिक निर्णय र आत्मिक खुसीलाई प्राथमिकता दिनुहोस् (पञ्चम राहु)।',
  },
  6: {
    ketuGiftEn: 'Rich imagination, spiritual sensitivity, and contemplative empathy (Ketu in H12).',
    rahuGrowthEn: 'Anchor your vision in crisp daily routines, practical craft, physical wellness, and problem-solving (Rahu in H6).',
    ketuGiftNe: 'कल्पनाशीलता र आध्यात्मिक संवेदनशीलताको गहिरो गुण (द्वादश केतु)।',
    rahuGrowthNe: 'नियमित दिनचर्या, स्वास्थ्य अनुशासन र व्यावहारिक समस्या समाधानमा जुट्दा चमत्कारिक प्रगति हुन्छ (षष्ठ राहु)।',
  },
  7: {
    ketuGiftEn: 'Strong self-reliance, independence, and private inner resolve (Ketu in H1).',
    rahuGrowthEn: 'Growth comes through trusting collaboration, open heartedness in marriage, and win-win partnerships (Rahu in H7).',
    ketuGiftNe: 'आत्मनिर्भरता र आफ्नै बलबुतामा उभिने स्वाभाविक बानी (प्रथम केतु)।',
    rahuGrowthNe: 'साझेदारी, विश्वास र सहकार्यको कला सिक्दा जीवन र व्यवसाय दुवै फराकिलो बन्छन् (सप्तम राहु)।',
  },
  8: {
    ketuGiftEn: 'Love of predictability, tangible assets, and familiar security (Ketu in H2).',
    rahuGrowthEn: 'Embrace deep research, psychological renewal, shared trust, and graceful adaptability during life pivots (Rahu in H8).',
    ketuGiftNe: 'स्थिरता र परिचित सुरक्षा घेरा रुचाउने स्वभाव (द्वितीय केतु)।',
    rahuGrowthNe: 'परिवर्तनलाई स्वीकार गर्दै गहिरो अनुसन्धान र आन्तरिक रूपान्तरणबाट असाधारण बल मिल्छ (अष्टम राहु)।',
  },
  9: {
    ketuGiftEn: 'Tactical cleverness, hands-on hustle, and quick local problem-solving (Ketu in H3).',
    rahuGrowthEn: 'Lift your gaze from daily firefighting to a larger life philosophy, global horizons, and trusted mentors (Rahu in H9).',
    ketuGiftNe: 'तत्काल काम फत्ते गर्ने व्यावहारिक चतुर्याइँ (तृतीय केतु)।',
    rahuGrowthNe: 'दीर्घकालीन दृष्टिकोण, उच्च अध्ययन र व्यापक विश्व-क्षितिजतर्फ कदम बढाउनुहोस् (नवम राहु)।',
  },
  10: {
    ketuGiftEn: 'Deep attachment to private comfort, emotional safety, and staying behind the scenes (Ketu in H4).',
    rahuGrowthEn: 'Step visibly onto the professional stage, accept leadership impact, and build an enduring public contribution (Rahu in H10).',
    ketuGiftNe: 'निजी सुख र सुरक्षित घेराभित्र रमाउने स्वभाव (चतुर्थ केतु)।',
    rahuGrowthNe: 'सार्वजनिक कर्मक्षेत्रमा निडर भई नेतृत्व र उल्लेखनीय योगदान दिनु यस जीवनको माग हो (दशम राहु)।',
  },
  11: {
    ketuGiftEn: 'Strong solo creative pride and perfectionist individual standards (Ketu in H5).',
    rahuGrowthEn: 'Multiply your impact by collaborating with communities, ecosystems, and shared humanitarian or commercial missions (Rahu in H11).',
    ketuGiftNe: 'व्यक्तिगत प्रतिभा र एकल सृजनामा निपुणता (पञ्चम केतु)।',
    rahuGrowthNe: 'समुदाय, टोली र बृहत् सञ्जालसँग जोडिँदा आम्दानी र प्रभाव कैयौँ गुणा बढ्छ (एकादश राहु)।',
  },
  12: {
    ketuGiftEn: 'Tireless workhorse discipline, analytical critique, and fixing every detail (Ketu in H6).',
    rahuGrowthEn: 'Balance hard work with rest, meditation, global/cross-border horizons, and letting go of perfectionist worry (Rahu in H12).',
    ketuGiftNe: 'कठोर परिश्रम र सूक्ष्म विश्लेषण गर्ने सहज बानी (षष्ठ केतु)।',
    rahuGrowthNe: 'अत्यधिक चिन्ता त्यागी विश्राम, ध्यान र अन्तर्राष्ट्रिय क्षितिजलाई अँगाल्दा मन शान्त र सफल हुन्छ (द्वादश राहु)।',
  },
};

// Planetary Maturity Ages (Graha Paripakvata — BPHS & Jataka Parijata)
export const PLANETARY_MATURITY_SPEC: {
  planetId: string;
  maturityAge: number;
  themeEn: string;
  themeNe: string;
  sourceRef: string;
}[] = [
  {
    planetId: 'Jupiter',
    maturityAge: 16,
    themeEn: 'Worldview, Higher Learning & Moral Compass Awakening',
    themeNe: 'ज्ञान, जीवन-दृष्टिकोण र उच्च अध्ययनको जागरण',
    sourceRef: 'Jataka Parijata & BPHS Graha Pakva Vayas',
  },
  {
    planetId: 'Sun',
    maturityAge: 22,
    themeEn: 'Core Identity, Adult Independence & Career Direction',
    themeNe: 'आत्मपहिचान, स्वावलम्बन र करियर दिशाको उदय',
    sourceRef: 'BPHS & Parashari Maturity Canon',
  },
  {
    planetId: 'Moon',
    maturityAge: 24,
    themeEn: 'Emotional Equilibrium, Inner Peace & Domestic Clarity',
    themeNe: 'भावनात्मक परिपक्वता र मानसिक स्थिरता',
    sourceRef: 'BPHS & Parashari Maturity Canon',
  },
  {
    planetId: 'Venus',
    maturityAge: 25,
    themeEn: 'Relationship Wisdom, Partner Values & Material Grace',
    themeNe: 'प्रेम, वैवाहिक समझदारी र सौन्दर्य/सुखको परिपक्वता',
    sourceRef: 'BPHS & Parashari Maturity Canon',
  },
  {
    planetId: 'Mars',
    maturityAge: 28,
    themeEn: 'Focused Ambition, Courage, Property & Tempered Drive',
    themeNe: 'संयमित साहस, भूमि/सम्पत्ति र लक्ष्यप्रतिको दृढता',
    sourceRef: 'BPHS (Also softens youthful Kuja/Mars impulsiveness)',
  },
  {
    planetId: 'Mercury',
    maturityAge: 32,
    themeEn: 'Commercial Mastery, Strategic Voice & Intellectual Peak',
    themeNe: 'व्यावसायिक दक्षता, वाणी र बौद्धिक परिपक्वता',
    sourceRef: 'BPHS & Jataka Parijata',
  },
  {
    planetId: 'Saturn',
    maturityAge: 36,
    themeEn: 'Structural Stability, Earned Authority & Long-Term Wealth',
    themeNe: 'दिगो स्थायित्व, कर्मको प्रतिफल र संस्थागत अधिकार',
    sourceRef: 'BPHS Karma-Pakva Milestone (Age 36 Pivot)',
  },
  {
    planetId: 'Rahu',
    maturityAge: 42,
    themeEn: 'Worldly Consolidation, Unconventional Mastery & Clarity Over Hype',
    themeNe: 'भ्रमको अन्त्य, व्यावहारिक परिपक्वता र विशेष उपलब्धि',
    sourceRef: 'Parashari Nodal Maturity Canon',
  },
  {
    planetId: 'Ketu',
    maturityAge: 48,
    themeEn: 'Spiritual Freedom, Deep Intuition & Legacy Wisdom',
    themeNe: 'आध्यात्मिक प्रज्ञा, सहज अन्तर्ज्ञान र निस्सारताबाट मुक्ति',
    sourceRef: 'Parashari Nodal Maturity Canon',
  },
];

// Phaladeepika Ch. 26 Gochara (Slow Planet Transits from Natal Moon)
export const SATURN_GOCHARA_FROM_MOON: Record<
  number,
  {
    phaseNameEn: string;
    phaseNameNe: string;
    tone: 'optimal' | 'favorable' | 'mixed' | 'avoid';
    summaryEn: string;
    summaryNe: string;
  }
> = {
  1: {
    phaseNameEn: 'Sade Sati — Peak Phase (Janma Shani, 1st from Moon)',
    phaseNameNe: 'साढेसाती — मध्य चरण (जन्म राशिमा शनि)',
    tone: 'mixed',
    summaryEn:
      'Saturn is crossing your Natal Moon sign—a classic 2.5-year restructuring crucible that strips away outgrown habits and builds lifelong resilience. Prioritize sleep, steady routines, and honest long-term commitments rather than impulsive leaps.',
    summaryNe:
      'शनि हाल तपाईंको जन्म राशिमा गोचर गर्दैछ (मध्य साढेसाती)। यो डराउने समय होइन, बरु अनुशासन, धैर्य र स्वास्थ्य दिनचर्या बलियो बनाएर जीवनको दिगो जग बसाउने घडी हो।',
  },
  2: {
    phaseNameEn: 'Sade Sati — Setting Phase (2nd from Moon)',
    phaseNameNe: 'साढेसाती — अन्तिम चरण (द्वितीय भावमा शनि)',
    tone: 'mixed',
    summaryEn:
      'You are in the final stabilizing leg of Sade Sati—consolidating family responsibilities, budgeting wisely, and speaking calmly as heavy pressure gradually lifts.',
    summaryNe:
      'तपाईं साढेसातीको अन्तिम (उतरती) चरणमा हुनुहुन्छ। बचतमा अनुशासन र पारिवारिक संवादमा मधुरता राख्दा अब क्रमिक रूपमा सहजता र स्थायित्व बढ्दै जान्छ।',
  },
  3: {
    phaseNameEn: 'Golden Courage & Breakthrough Transit (3rd from Moon)',
    phaseNameNe: 'स्वर्णिम पराक्रम गोचर (चन्द्रबाट तृतीय शनि — अति शुभ)',
    tone: 'optimal',
    summaryEn:
      'Phaladeepika Ch. 26 celebrates Saturn in the 3rd from Moon as one of life’s strongest productivity windows—stamina rises, obstacles clear, and bold new ventures gain durable traction.',
    summaryNe:
      'फलदीपिका (अध्याय २६) अनुसार चन्द्रमाबाट तेस्रो शनि अत्यन्त शुभ मानिन्छ—साहस बढ्ने, बाधा हट्ने र नयाँ काममा दिगो सफलता मिल्ने उत्तम समय छ।',
  },
  4: {
    phaseNameEn: 'Kantaka / Ardha-Ashtama Shani (4th from Moon)',
    phaseNameNe: 'अर्धाष्टम / ढैया शनि (चन्द्रबाट चतुर्थ शनि)',
    tone: 'mixed',
    summaryEn:
      'Saturn in the 4th from Moon asks you to declutter home/work obligations, care for emotional rest and elders, and double-check property paperwork.',
    summaryNe:
      'चन्द्रमाबाट चौथो शनिले घरायसी र कार्यबोझ व्यवस्थित गर्न, आमाबुबाको स्वास्थ्यमा ध्यान दिन र मनलाई पर्याप्त विश्राम दिन सुझाउँछ।',
  },
  5: {
    phaseNameEn: 'Structured Strategy & Discernment Transit (5th from Moon)',
    phaseNameNe: 'गम्भीर चिन्तन र दीर्घकालीन योजना गोचर (पञ्चम शनि)',
    tone: 'mixed',
    summaryEn:
      'Favors patient skill-building and long-term index/value investing while discouraging speculative shortcuts or emotional overthinking.',
    summaryNe:
      'छोटो बाटो वा सट्टाबाजी त्यागेर गहिरो अध्ययन र दीर्घकालीन लगानीमा लाग्दा प्रतिफल मिल्ने समय छ।',
  },
  6: {
    phaseNameEn: 'Peak Victory Over Obstacles Transit (6th from Moon)',
    phaseNameNe: 'शत्रु र बाधा विजय गोचर (चन्द्रबाट षष्ठ शनि — अति शुभ)',
    tone: 'optimal',
    summaryEn:
      'One of Saturn’s top three transits (Phaladeepika Ch. 26): exceptional stamina to clear debts, outperform competition, resolve lingering issues, and strengthen daily work systems.',
    summaryNe:
      'चन्द्रमाबाट छैटौँ शनि परम शुभ मानिन्छ—पुरानो ऋण वा उल्झन सुल्झाउन, प्रतिस्पर्धा जित्न र कार्यक्षमता बढाउन यो बलियो समय हो।',
  },
  7: {
    phaseNameEn: 'Kantaka Shani — Partnership & Contract Accountability (7th from Moon)',
    phaseNameNe: 'सप्तम कण्टक शनि — साझेदारी र जिम्मेवारी परीक्षण',
    tone: 'mixed',
    summaryEn:
      'Tests patience and fairness in marriage, client alliances, and travel—clear expectations and reliable follow-through turn pressure into rock-solid trust.',
    summaryNe:
      'वैवाहिक तथा व्यावसायिक साझेदारीमा धैर्य र पारदर्शिता राख्दा सम्बन्ध अझ परिपक्व र विश्वासिलो बन्छ।',
  },
  8: {
    phaseNameEn: 'Ashtama Shani — Deep Reset & Longevity Care (8th from Moon)',
    phaseNameNe: 'अष्टम शनि (ढैया) — आत्मसमीक्षा र स्वास्थ्य अनुशासन',
    tone: 'mixed',
    summaryEn:
      'A classic 2.5-year inward maintenance phase: keep emergency reserves liquid, prioritize preventive health checkups, and focus on steady craft rather than high-risk gambles.',
    summaryNe:
      'चन्द्रमाबाट आठौँ शनिको अवधिमा जोखिमपूर्ण लगानी नगरी स्वास्थ्य, नियमित दिनचर्या र आकस्मिक बचतमा ध्यान दिनु बुद्धिमानी हुन्छ।',
  },
  9: {
    phaseNameEn: 'Earned Wisdom & Foundation Building (9th from Moon)',
    phaseNameNe: 'कर्तव्यनिष्ठ धर्म र दीर्घकालीन आधार गोचर (नवम शनि)',
    tone: 'favorable',
    summaryEn:
      'Prepares the runway for your next major career peak (10th/11th transit)—steady learning, ethical conduct, and institutional patience pay off.',
    summaryNe:
      'आगामी कर्म र लाभको शिखरका लागि जग तयार गर्ने समय—निरन्तर अध्ययन र इमानदार प्रयासले भाग्य बलियो बनाउँछ।',
  },
  10: {
    phaseNameEn: 'High-Responsibility Career Grind (10th from Moon)',
    phaseNameNe: 'उच्च कार्यभार र कर्म-निष्ठा गोचर (दशम शनि)',
    tone: 'favorable',
    summaryEn:
      'Heavy professional accountability and visibility—delivering thorough, uncomplaining craftsmanship right now sets up abundant rewards when Saturn enters your 11th house next.',
    summaryNe:
      'कार्यक्षेत्रमा जिम्मेवारी बढ्ने समय—अहिले गरिएको निष्ठापूर्वक परिश्रमले आगामी एकादश गोचरमा ठूलो प्रतिफल दिनेछ।',
  },
  11: {
    phaseNameEn: 'Abundant Harvest & Compounding Gains Transit (11th from Moon)',
    phaseNameNe: 'सर्वोत्तम लाभ र उपलब्धि गोचर (चन्द्रबाट एकादश शनि — अति शुभ)',
    tone: 'optimal',
    summaryEn:
      'Saturn’s richest harvest transit (Phaladeepika Ch. 26): years of patient effort crystallize into financial gains, promotions, property, and respected standing.',
    summaryNe:
      'चन्द्रमाबाट एघारौँ शनि सर्वाधिक फलदायी मानिन्छ—विगतका वर्षहरूको मिहिनेतले अब धनलाभ, पदोन्नति र सामाजिक सम्मान दिलाउँछ।',
  },
  12: {
    phaseNameEn: 'Sade Sati — Rising Phase (12th from Moon)',
    phaseNameNe: 'साढेसाती — प्रथम चरण (द्वादश भावमा शनि)',
    tone: 'mixed',
    summaryEn:
      'The opening phase of Sade Sati clears clutter—plug quiet expense leaks, protect deep sleep, and release obligations that no longer serve your next decade.',
    summaryNe:
      'साढेसातीको सुरुवाती चरण—अनावश्यक खर्च नियन्त्रण गर्ने, पर्याप्त निद्रा लिने र पुराना बोझ हटाएर मन हलुका बनाउने समय हो।',
  },
};

export const JUPITER_GOCHARA_FROM_MOON: Record<
  number,
  { isGuruBala: boolean; headlineEn: string; headlineNe: string; noteEn: string; noteNe: string }
> = {
  1: {
    isGuruBala: false,
    headlineEn: 'New 12-Year Seed Planting (1st from Moon)',
    headlineNe: 'नयाँ १२-वर्षे चक्रको बीजारोपण (जन्म राशिमा गुरु)',
    noteEn: 'Brings inner maturation and fresh responsibilities before financial harvest arrives next year in the 2nd.',
    noteNe: 'आगामी वर्षको धनलाभअघि आत्मविकास र नयाँ जिम्मेवारीको जग बसाल्ने समय।',
  },
  2: {
    isGuruBala: true,
    headlineEn: 'Strong Guru Bala — Wealth, Speech & Family Blessing (2nd from Moon)',
    headlineNe: 'प्रबल गुरुबल — धन, वाणी र पारिवारिक सुख (द्वितीय गुरु)',
    noteEn: 'Classic Phaladeepika blessing for savings growth, harmonious family milestones, and persuasive wisdom.',
    noteNe: 'बचत वृद्धि, पारिवारिक माङ्गलिक कार्य र प्रभावकारी संवादका लागि अत्यन्त शुभ गोचर।',
  },
  3: {
    isGuruBala: false,
    headlineEn: 'Skill Stretching & Initiative Effort (3rd from Moon)',
    headlineNe: 'सीप परिमार्जन र स्वावलम्बी प्रयास (तृतीय गुरु)',
    noteEn: 'Progress comes through your own initiative, travel, and upgrading communication skills rather than passive luck.',
    noteNe: 'भाग्यको भरभन्दा आफ्नै सीप, संवाद र सक्रिय प्रयासबाट नतिजा निस्कने समय।',
  },
  4: {
    isGuruBala: false,
    headlineEn: 'Inner Sanctuary & Domestic Reorganization (4th from Moon)',
    headlineNe: 'घरायसी व्यवस्थापन र आन्तरिक शान्ति अभ्यास (चतुर्थ गुरु)',
    noteEn: 'Focuses energy on home improvements, emotional grounding, and steady preparation.',
    noteNe: 'घर-परिवारको सुधार, भावनात्मक स्थिरता र शान्त तयारीमा केन्द्रित हुने अवधि।',
  },
  5: {
    isGuruBala: true,
    headlineEn: 'Supreme Guru Bala — Creativity, Wisdom, Romance & Recognition (5th from Moon)',
    headlineNe: 'सर्वश्रेष्ठ गुरुबल — प्रज्ञा, सृजना, सन्तान र उन्नति (पञ्चम गुरु)',
    noteEn: 'One of Jupiter’s most auspicious transits—clears confusion, elevates career judgment, and blesses love/progeny/study.',
    noteNe: 'बुद्धि प्रखर हुने, सही निर्णय लिइने, अध्ययन/सन्तान र करियरमा उच्च सहयोग मिल्ने परम शुभ गोचर।',
  },
  6: {
    isGuruBala: false,
    headlineEn: 'Service, Wellness & Process Refinement (6th from Moon)',
    headlineNe: 'स्वास्थ्य सजगता र कार्यप्रणाली सुधार (षष्ठ गुरु)',
    noteEn: 'Keep liver/metabolic habits clean, avoid lending money casually, and refine daily workflows.',
    noteNe: 'खानपान र स्वास्थ्यमा सन्तुलन राख्ने तथा बिनाकागजात सापटी नदिने समय।',
  },
  7: {
    isGuruBala: true,
    headlineEn: 'Strong Guru Bala — Marriage, Alliances & Public Goodwill (7th from Moon)',
    headlineNe: 'प्रबल गुरुबल — विवाह, साझेदारी र सामाजिक प्रतिष्ठा (सप्तम गुरु)',
    noteEn: 'Directly aspects your Moon—supporting marriage/commitment, trustworthy business partners, and fruitful travel.',
    noteNe: 'चन्द्रमामा पूर्ण शुभ दृष्टि पर्नाले विवाह, व्यापारिक साझेदारी र जनसम्पर्कमा उल्लेखनीय लाभ मिल्छ।',
  },
  8: {
    isGuruBala: false,
    headlineEn: 'Quiet Research, Tax/Asset Hygiene & Spiritual Depth (8th from Moon)',
    headlineNe: 'गहिरो अध्ययन, वित्तीय सतर्कता र आध्यात्मिक चिन्तन (अष्टम गुरु)',
    noteEn: 'Favors behind-the-scenes study and insurance/legacy planning while pacing major external risks.',
    noteNe: 'ठूलो बाहिरी जोखिमभन्दा अनुसन्धान, आध्यात्मिक साधना र दीर्घकालीन सुरक्षा योजनामा लाग्नु उत्तम।',
  },
  9: {
    isGuruBala: true,
    headlineEn: 'Supreme Guru Bala — Grace, Mentors, Fortune & Global Horizons (9th from Moon)',
    headlineNe: 'भाग्योदय गुरुबल — धर्म, गुरुकृपा र दूरगामी उन्नति (नवम गुरु)',
    noteEn: 'Opens doors through mentors, higher education, international links, and protective tailwinds.',
    noteNe: 'गुरुजनको सहयोग, उच्च शिक्षा, वैदेशिक अवसर र भाग्यको प्रत्यक्ष साथ मिल्ने स्वर्णिम समय।',
  },
  10: {
    isGuruBala: false,
    headlineEn: 'Role Evolution & Professional Repositioning (10th from Moon)',
    headlineNe: 'पेशागत जिम्मेवारी परिवर्तन र विस्तार (दशम गुरु)',
    noteEn: 'Often shifts job scope or responsibilities so you can step into wider gains next year.',
    noteNe: 'कार्यक्षेत्रमा भूमिका वा जिम्मेवारी परिमार्जन भई आगामी लाभको बाटो खुल्ने समय।',
  },
  11: {
    isGuruBala: true,
    headlineEn: 'Strong Guru Bala — Financial Gains, Honors & Fulfilled Goals (11th from Moon)',
    headlineNe: 'प्रबल गुरुबल — आर्थिक लाभ, सम्मान र मनोकांक्षा पूर्ति (एकादश गुरु)',
    noteEn: 'Converts past effort into tangible income growth, supportive networks, and milestone celebrations.',
    noteNe: 'आम्दानी वृद्धि, मित्र सहयोग र रोकिएका लक्ष्यहरू पूरा हुने अत्यन्त अनुकूल समय।',
  },
  12: {
    isGuruBala: false,
    headlineEn: 'Charitable Investing, Retreat & Clearing Space (12th from Moon)',
    headlineNe: 'सत्कार्यमा खर्च, विश्राम र नयाँ चक्रको तयारी (द्वादश गुरु)',
    noteEn: 'Good for purposeful education/travel/charity investments and spiritual renewal ahead of a new 12-year cycle.',
    noteNe: 'शिक्षा, यात्रा वा शुभ कार्यमा सार्थक लगानी हुने र मनलाई शान्त बनाउने समय।',
  },
};

// Ayurvedic Dosha Layman Guides (Dr. David Frawley & Brihat Jataka)
export const AYURVEDIC_DOSHA_GUIDES: Record<
  'Vata' | 'Pitta' | 'Kapha',
  {
    elementEn: string;
    elementNe: string;
    giftEn: string;
    giftNe: string;
    whenStressedEn: string;
    whenStressedNe: string;
    dailyFoodHabitEn: string;
    dailyFoodHabitNe: string;
    movementAndSleepEn: string;
    movementAndSleepNe: string;
  }
> = {
  Vata: {
    elementEn: 'Air & Space (Quick Mind, Creative Agility)',
    elementNe: 'वायु र आकाश तत्त्व (तीक्ष्ण कल्पना र गतिशीलता)',
    giftEn: 'Fast learner, inventive thinker, enthusiastic communicator, and adaptable spirit.',
    giftNe: 'छिटो सिक्ने क्षमता, मौलिक सोच, उत्साह र परिस्थितिसँग घुलमिल हुने लचकता।',
    whenStressedEn: 'Racing thoughts at night, dry skin/joints, irregular appetite, or feeling scattered.',
    whenStressedNe: 'राति निद्रामा चञ्चलता, अत्यधिक सोच, जोर्नीमा सुक्खापन वा अनियमित भोक।',
    dailyFoodHabitEn: 'Favor warm, cooked, nourishing meals with healthy oils/ghee, soups, and warm herbal tea over cold raw snacks.',
    dailyFoodHabitNe: 'चिसो र सुक्खा खाजाभन्दा तातो, ताजा पकाएको पोषिलो खाना, झोलपदार्थ र मनतातो पानी उपयुक्त हुन्छ।',
    movementAndSleepEn: 'Keep a consistent bedtime (wind down screens 45m early) and favor grounding walks, yoga, or strength training.',
    movementAndSleepNe: 'सुत्ने र उठ्ने निश्चित तालिका राख्नुहोस्; हल्का योग, प्राणायाम र नियमित पैदल यात्राले स्नायु प्रणाली शान्त राख्छ।',
  },
  Pitta: {
    elementEn: 'Fire & Water (Focused Drive, Sharp Digestion & Leadership)',
    elementNe: 'अग्नि र जल तत्त्व (तीक्ष्ण बुद्धि, साहस र नेतृत्व)',
    giftEn: 'Decisive focus, strong metabolism, courageous execution, and natural clarity under pressure.',
    giftNe: 'स्पष्ट निर्णय क्षमता, बलियो पाचनशक्ति, लक्ष्यप्रतिको निष्ठा र स्वाभाविक नेतृत्व।',
    whenStressedEn: 'Irritability, perfectionist burnout, acidity/inflammation, tension headaches, or overheating.',
    whenStressedNe: 'चिडचिडाहट, कार्यधपेडी, अम्लपित्त (एसिडिटी), टाउको भारी हुने वा शरीरमा गर्मी बढ्ने।',
    dailyFoodHabitEn: 'Never skip meals when working hard; balance spicy/acidic/caffeinated foods with cooling greens, sweet fruits, coriander/fennel, and pure water.',
    dailyFoodHabitNe: 'भोकै बसेर काम नगर्नुहोस्; अत्यधिक पिरो/अमिलो र कफी कम गरी शीतल फलफूल, हरियो सागपात र पर्याप्त पानी लिनुहोस्।',
    movementAndSleepEn: 'Unplug from competitive work in the evening; swim, walk near water/trees, and practice cooling breathwork.',
    movementAndSleepNe: 'साँझपख कामको तनाव त्यागी प्रकृति/हरियालीमा टहल्ने, पौडी वा शीतली प्राणायाम गर्ने बानी बसाल्नुहोस्।',
  },
  Kapha: {
    elementEn: 'Earth & Water (Endurance, Calm Loyalty & Strong Immunity)',
    elementNe: 'पृथ्वी र जल तत्त्व (स्थिरता, सहनशीलता र बलियो रोगप्रतिरोधक क्षमता)',
    giftEn: 'Deep stamina, calm emotional steadiness, loyal heart, restful sleep, and long-term patience.',
    giftNe: 'गहिरो धैर्य, शान्त स्वभाव, दिगो आत्मीयता र बलियो शारीरिक सहनशक्ति।',
    whenStressedEn: 'Sluggishness, procrastination, holding onto past hurt, water retention, or sinus heaviness.',
    whenStressedNe: 'आलस्य, काम सार्ने बानी, पुराना कुरा मनमा राख्ने वा कफ/सर्दीको भारीपन।',
    dailyFoodHabitEn: 'Favor light, warm, vibrant meals with ginger, black pepper, turmeric, and greens; keep late-night heavy sweets/dairy light.',
    dailyFoodHabitNe: 'अदुवा, मरिच, बेसार र ताजा तरकारीयुक्त हलुका तातो भोजन लिनुहोस्; राति ढिलो गरी गह्रौँ गुलियो खाना कम गर्नुहोस्।',
    movementAndSleepEn: 'Start mornings with brisk movement/sunlight before 7:30 AM—early momentum unlocks energy all day.',
    movementAndSleepNe: 'बिहान घाम झुल्केलगत्तै छिटो हिँड्ने वा व्यायाम गर्ने बानीले दिनभरि शरीर र मनमा स्फूर्ति जगाउँछ।',
  },
};

// Cheiro's Book of Numbers (Compound Vibrations 10–33+ reduced into 10–52 range) & Core 1–9/11/22/33 Guides
export const CORE_NUMEROLOGY_DEEP_GUIDE: Record<
  number,
  {
    titleEn: string;
    titleNe: string;
    deepMeaningEn: string;
    deepMeaningNe: string;
    karmicLessonEn: string;
    karmicLessonNe: string;
  }
> = {
  1: {
    titleEn: 'The Pioneer & Independent Originator',
    titleNe: 'अग्रणी नेतृत्व र स्वतन्त्र स्रष्टा (#१)',
    deepMeaningEn:
      'You are wired to blaze your own trail, trust your original instincts, and lead by example rather than waiting for permission.',
    deepMeaningNe:
      'तपाईंमा आफ्नै बाटो कोर्ने मौलिक सोच, आत्मनिर्भरता र अरूलाई बाटो देखाउने स्वाभाविक नेतृत्व क्षमता छ।',
    karmicLessonEn: 'Missing #1 in birth name: Practice asserting your own preferences early without waiting for external validation.',
    karmicLessonNe: 'नाममा अंक १ को कमी: अरूको स्वीकृति नपर्खी आफ्नो विचार र आत्मविश्वास स्पष्ट राख्न सिक्नुहोस्।',
  },
  2: {
    titleEn: 'The Peacemaker, Tactician & Bridge-Builder',
    titleNe: 'शान्तिदूत, समन्वयकर्ता र संवेदनशील सहयात्री (#२)',
    deepMeaningEn:
      'Your superpower is emotional intelligence, timing, and bringing opposing people into quiet, durable agreement.',
    deepMeaningNe:
      'सूक्ष्म संवेदना, धैर्य र फरक विचारका मानिसहरूलाई मिलाएर लैजाने कूटनीतिक क्षमता तपाईंको विशेष शक्ति हो।',
    karmicLessonEn: 'Missing #2 in birth name: Cultivate patience with details, active listening, and collaborative teamwork.',
    karmicLessonNe: 'नाममा अंक २ को कमी: धैर्यपूर्वक सुन्ने र सहकार्यमा विश्वास गर्ने बानी बलियो बनाउनुहोस्।',
  },
  3: {
    titleEn: 'The Expressive Communicator & Catalyst of Joy',
    titleNe: 'सृजनशील अभिव्यक्ति र उत्साहका संवाहक (#३)',
    deepMeaningEn:
      'You uplift rooms through words, design, storytelling, teaching, and imaginative synthesis—when focused, your voice opens every door.',
    deepMeaningNe:
      'बोली, लेखन, कला वा शिक्षणमार्फत अरूमा उत्साह भर्ने र जटिल कुरालाई रोचक बनाउने प्रतिभा तपाईंमा छ।',
    karmicLessonEn: 'Missing #3 in birth name: Share your ideas visibly instead of hiding behind self-criticism.',
    karmicLessonNe: 'नाममा अंक ३ को कमी: संकोच वा आत्म-आलोचना त्यागेर आफ्ना विचार र सृजना खुलेर प्रस्तुत गर्नुहोस्।',
  },
  4: {
    titleEn: 'The Master Builder of Systems & Enduring Trust',
    titleNe: 'अनुशासन, प्रणाली र दिगो आधारका निर्माता (#४)',
    deepMeaningEn:
      'You turn abstract dreams into rock-solid reality through step-by-step craft, honesty, and dependable structure.',
    deepMeaningNe:
      'योजनाबद्ध परिश्रम, इमानदारी र बलियो कार्यप्रणालीद्वारा दिगो उपलब्धि खडा गर्ने क्षमता तपाईंको जग हो।',
    karmicLessonEn: 'Missing #4 in birth name: Build daily checklists, financial order, and follow-through on mundane steps.',
    karmicLessonNe: 'नाममा अंक ४ को कमी: दैनिक समयतालिका, बजेट अनुशासन र नियमित कार्यान्वयनमा विशेष जोड दिनुहोस्।',
  },
  5: {
    titleEn: 'The Dynamic Explorer & Catalyst of Change',
    titleNe: 'परिवर्तनशील ऊर्जा, स्वतन्त्रता र बहुमुखी प्रतिभा (#५)',
    deepMeaningEn:
      'Curious, resourceful, and fearless around change—you thrive across languages, markets, travel, and evolving technologies when anchored by healthy focus.',
    deepMeaningNe:
      'नयाँ परिवेश, यात्रा, प्रविधि र बहुआयामिक अवसरलाई छिटो आत्मसात् गर्ने गतिशील क्षमता तपाईंमा छ।',
    karmicLessonEn: 'Missing #5 in birth name: Embrace healthy adaptability when plans change instead of clinging rigidly.',
    karmicLessonNe: 'नाममा अंक ५ को कमी: नयाँ परिवर्तन र अवसरप्रति लचकदार तथा खुला रहन अभ्यास गर्नुहोस्।',
  },
  6: {
    titleEn: 'The Steward of Harmony, Family & Responsible Care',
    titleNe: 'पारिवारिक स्नेह, सेवा र सन्तुलित जिम्मेवारी (#६)',
    deepMeaningEn:
      'People naturally lean on your warmth, aesthetic sense, and counsel—you flourish when nurturing family, community, healing, or quality craft without over-carrying others’ duties.',
    deepMeaningNe:
      'परिवार, समाज, सौन्दर्य र न्यायोचित जिम्मेवारी निभाउने न्यानो अभिभावकीय गुण तपाईंको पहिचान हो।',
    karmicLessonEn: 'Missing #6 in birth name: Show up consistently in domestic commitments and vulnerable close bonds.',
    karmicLessonNe: 'नाममा अंक ६ को कमी: घरायसी तथा आत्मीय सम्बन्धमा भावनात्मक उपस्थिति र प्रतिबद्धता बढाउनुहोस्।',
  },
  7: {
    titleEn: 'The Seeker of Truth, Research & Deep Mastery',
    titleNe: 'गहिरो अनुसन्धान, सत्यको खोजी र अन्तर्प्रज्ञा (#७)',
    deepMeaningEn:
      'Surface answers never satisfy you—your mind combines analytical rigor with quiet intuition, excelling in specialized mastery, science, strategy, and spiritual philosophy.',
    deepMeaningNe:
      'सतही कुरामा चित्त नबुझाई गहिरो अध्ययन, वैज्ञानिक विश्लेषण र आध्यात्मिक चिन्तनबाट सत्य पत्ता लगाउने तपाईंको स्वभाव हो।',
    karmicLessonEn: 'Missing #7 in birth name: Schedule quiet contemplation and verify deeper principles behind events.',
    karmicLessonNe: 'नाममा अंक ७ को कमी: एकान्त स्वाध्याय, आत्मचिन्तन र गहिरो विशेषज्ञता विकासमा समय छुट्याउनुहोस्।',
  },
  8: {
    titleEn: 'The Executive Architect of Material & Ethical Impact',
    titleNe: 'प्रशासनिक दक्षता, आर्थिक सन्तुलन र कर्मबल (#८)',
    deepMeaningEn:
      'You carry executive capacity to organize capital, teams, and large-scale enterprises—prospering most when financial ambition stays paired with ethical fairness.',
    deepMeaningNe:
      'ठूला परियोजना, पुँजी व्यवस्थापन र संस्थागत नेतृत्व सम्हाल्ने क्षमता तपाईंमा छ; नैतिक पारदर्शिताले यसलाई अटल बनाउँछ।',
    karmicLessonEn: 'Missing #8 in birth name: Build confident financial literacy, pricing clarity, and comfort with authority.',
    karmicLessonNe: 'नाममा अंक ८ को कमी: वित्तीय साक्षरता, बचत व्यवस्थापन र नेतृत्वदायी आत्मविश्वास सुदृढ पार्नुहोस्।',
  },
  9: {
    titleEn: 'The Broad-Hearted Visionary & Humanitarian Mentor',
    titleNe: 'विश्वबन्धुत्व, उदार दृष्टिकोण र परोपकारी प्रज्ञा (#९)',
    deepMeaningEn:
      'You see the human story from a wide, compassionate lens—inspiring others through art, teaching, leadership, and generous contribution while learning graceful closure.',
    deepMeaningNe:
      'फराकिलो सोच, मानवीय करुणा, कला वा शिक्षणमार्फत समाजमा अर्थपूर्ण योगदान दिने उच्च भावना तपाईंमा निहित छ।',
    karmicLessonEn: 'Missing #9 in birth name: Practice broad-minded forgiveness and seeing beyond narrow personal interest.',
    karmicLessonNe: 'नाममा अंक ९ को कमी: क्षमाशीलता र फराकिलो सामाजिक दृष्टिकोण अपनाउँदा मन हलुका र सफल हुन्छ।',
  },
  11: {
    titleEn: 'Master 11/2 — The Intuitive Illuminator & Inspiring Voice',
    titleNe: 'मास्टर अंक ११/२ — उच्च अन्तर्ज्ञान र प्रेरणादायी दृष्टा',
    deepMeaningEn:
      'Blends electric intuitive insight (11) with diplomatic sensitivity (2)—capable of inspiring wide audiences once nervous energy is grounded in steady daily craft.',
    deepMeaningNe:
      'तीक्ष्ण अन्तर्ज्ञान र संवेदनशील कूटनीतिको अद्भुत संगम—नियमित अभ्यासमा जोडिँदा अरूलाई प्रेरित गर्ने विशेष क्षमता प्रकट हुन्छ।',
    karmicLessonEn: '',
    karmicLessonNe: '',
  },
  22: {
    titleEn: 'Master 22/4 — The Master Architect of Lasting Institutions',
    titleNe: 'मास्टर अंक २२/४ — दूरदर्शी निर्माता र संस्थागत शिल्पी',
    deepMeaningEn:
      'Unites high visionary ideals (11×2) with practical four-square execution (4)—capable of building systems, enterprises, or works that serve thousands.',
    deepMeaningNe:
      'ठूलो सपनालाई ठोस धरातलमा उतार्ने दुर्लभ क्षमता—दीर्घकालीन संस्था वा जनहितकारी संरचना निर्माणमा विशेष सिद्धि मिल्छ।',
    karmicLessonEn: '',
    karmicLessonNe: '',
  },
  33: {
    titleEn: 'Master 33/6 — The Compassionate Teacher & Healer',
    titleNe: 'मास्टर अंक ३३/६ — निस्वार्थ मार्गदर्शक र उपचारात्मक स्नेह',
    deepMeaningEn:
      'Elevates nurturing responsibility into uplifting teaching, counseling, creative healing, and community stewardship.',
    deepMeaningNe:
      'करुणा, शिक्षण र सृजनात्मक सेवामार्फत परिवार तथा समुदायलाई बाटो देखाउने उच्च आध्यात्मिक ऊर्जा।',
    karmicLessonEn: '',
    karmicLessonNe: '',
  },
};

export const CHEIRO_COMPOUND_KEYNOTES: Record<
  number,
  { titleEn: string; meaningEn: string; meaningNe: string }
> = {
  10: {
    titleEn: '10 — The Wheel of Rise & Self-Confidence',
    meaningEn: 'Cheiro calls 10 the number of honor and self-confidence—your name/birth current rises cleanly whenever you act with clear, decisive intent.',
    meaningNe: 'चेइरोका अनुसार १० आत्मविश्वास र सम्मानको अंक हो—स्पष्ट संकल्पसाथ अघि बढ्दा उच्च सफलता मिल्छ।',
  },
  11: {
    titleEn: '11 — High Voltage Intuition & Discernment',
    meaningEn: 'Heightened psychic sensitivity; keep priorities transparent so hidden confusion or divided loyalties never scatter your focus.',
    meaningNe: 'तीक्ष्ण अन्तर्बोधको अंक—स्पष्ट लक्ष्य र पारदर्शी व्यवहार राख्दा द्वविधा स्वतः हट्छ।',
  },
  12: {
    titleEn: '12 — Conscientious Service Without Over-Sacrifice',
    meaningEn: 'Deep care for collective plans—set healthy boundaries so you never carry other people’s unexamined burdens.',
    meaningNe: 'सेवाभावको अंक—अरूको भार मात्र नबोकी आफ्नो स्वाभिमान र सीमा पनि सुरक्षित राख्नुहोस्।',
  },
  13: {
    titleEn: '13/4 — Karmic Transformation Through Brick-by-Brick Mastery',
    meaningEn: 'Combines Cheiro’s "transformative renewal" with Pythagorean Karmic Debt 13: shortcuts stall, whereas patient daily structure unlocks extraordinary breakthroughs.',
    meaningNe: 'निरन्तर परिश्रम र अनुशासनको अंक (१३/४)—छोटो बाटो त्यागेर इँटा-इँटा जोड्दै अघि बढ्दा असाधारण स्थायित्व मिल्छ।',
  },
  14: {
    titleEn: '14/5 — Dynamic Commerce & Grounded Moderation',
    meaningEn: 'Strong magnetism in media, movement, and finance (Cheiro), paired with Karmic Debt 14’s lesson: anchor freedom in steady routines and sober risk management.',
    meaningNe: 'सञ्चार, व्यापार र गतिको अंक (१४/५)—संयम, सन्तुलित दिनचर्या र सोचविचारपूर्ण निर्णयले दिगो लाभ दिन्छ।',
  },
  15: {
    titleEn: '15/6 — Magnetic Eloquence, Artistry & Goodwill',
    meaningEn: 'Celebrated by Cheiro for persuasive charm, artistic grace, and attracting helpful resources through warmth and ethical diplomacy.',
    meaningNe: 'मधुर वाणी, कलात्मक आकर्षण र सद्भावबाट सहयोग एवं समृद्धि जुटाउने शुभ अंक।',
  },
  16: {
    titleEn: '16/7 — Ego Humility & Authentic Inner Awakening',
    meaningEn: 'Karmic Debt 16 ("The Tower / Awakening"): life periodically prunes false pride or rigid plans so wiser, humble, unshakable authenticity emerges.',
    meaningNe: 'आत्मजागरण र विनम्रताको अंक (१६/७)—अहंकार त्यागी सत्य र आन्तरिक प्रज्ञामा अडिग रहँदा जीवन सुरक्षित र उज्यालो बन्छ।',
  },
  17: {
    titleEn: '17/8 — "The Star of the Magi" (Enduring Legacy)',
    meaningEn: 'Praised in Cheiro’s Book of Numbers as a deeply spiritual-yet-resilient vibration promising lasting respect after early testing.',
    meaningNe: 'चेइरोद्वारा प्रशंसित "तारा" अंक—प्रारम्भिक परीक्षापछि दिगो नाम, शान्ति र सम्मान दिलाउने शुभ कम्पन।',
  },
  18: {
    titleEn: '18/9 — High-Energy Resolve Paired With Calm Counsel',
    meaningEn: 'Strong executive stamina in complex environments—verify contracts carefully and resolve family/partner tensions with calm diplomacy.',
    meaningNe: 'बलियो कार्यक्षमताको अंक—कागजात राम्रोसँग जाँच्ने र शान्त संवाद रोज्ने बानीले विवादबाट जोगाउँछ।',
  },
  19: {
    titleEn: '19/1 — "The Prince of Heaven" (Solar Victory & Self-Reliance)',
    meaningEn: 'Cheiro hails 19 as the fortunate number of the Sun bringing honor and fulfillment; Karmic Debt 19 adds one key rule—lead generously and share credit openly.',
    meaningNe: 'सूर्यको तेजस्वी अंक (१९/१)—आत्मनिर्भरतासँगै अरूको सहयोग स्वीकार्ने र श्रेय बाँड्ने उदारताले उच्च सफलता दिलाउँछ।',
  },
  20: {
    titleEn: '20/2 — The Awakening of Higher Purpose',
    meaningEn: 'Calls forth new plans, counseling, and purposeful second chapters that ripen through patience rather than force.',
    meaningNe: 'नयाँ उद्देश्य र जागरणको अंक—हतार नगरी धैर्य र सहकार्यबाट अघि बढ्दा लक्ष्य साकार हुन्छ।',
  },
  21: {
    titleEn: '21/3 — "The Crown of the Magi" (Advancement After Effort)',
    meaningEn: 'One of Cheiro’s classic numbers of advancement—promises honored standing and creative success earned through steady perseverance.',
    meaningNe: 'निरन्तर प्रयासपछि सम्मान, पदोन्नति र सृजनात्मक विजय दिलाउने अत्यन्त शुभ अंक।',
  },
  23: {
    titleEn: '23/5 — "The Royal Star of the Lion" (Mentors & Protection)',
    meaningEn: 'Renowned in Cheiro’s canon for attracting timely help from mentors, senior decision-makers, and versatile communication skill.',
    meaningNe: '"रोयल स्टार अफ द लायन"—वरिष्ठ तथा गुरुजनको सहयोग, कार्यकुशलता र सुरक्षा दिलाउने विशेष शुभ अंक।',
  },
  24: {
    titleEn: '24/6 — Fortunate Alliances & Domestic Prosperity',
    meaningEn: 'Strongly favors constructive partnerships, loyal collaborators, artistic craft, and steady family wealth.',
    meaningNe: 'प्रेम, विश्वसनीय साझेदारी र पारिवारिक सुख-समृद्धिका लागि अत्यन्त अनुकूल अंक।',
  },
  25: {
    titleEn: '25/7 — Wisdom Forged Through Experience',
    meaningEn: 'Grants sharp observational judgment—early life teaches discernment, turning your 30s and beyond into a period of respected authority.',
    meaningNe: 'अनुभव र सूक्ष्म अवलोकनबाट खारिएको प्रज्ञा—उमेर बढ्दै जाँदा विशेष सम्मान र स्थायित्व प्राप्त हुन्छ।',
  },
  26: {
    titleEn: '26/8 — Careful Partnership & Independent Verification',
    meaningEn: 'Strong material potential provided you audit joint ventures, read legal fine print yourself, and save conservatively.',
    meaningNe: 'आर्थिक अनुशासनको अंक—साझेदारी र लगानीमा आफैँ कागजात जाँचेर सतर्कता अपनाउँदा सुरक्षित उन्नति हुन्छ।',
  },
  27: {
    titleEn: '27/9 — "The Scepter" (Intellectual & Creative Command)',
    meaningEn: 'Rewards original ideas, authorship, and principled leadership—trust your own researched insights over crowd opinions.',
    meaningNe: 'मौलिक विचार र बौद्धिक नेतृत्वको अंक—आफ्नै विवेक र अनुसन्धानमा भरोसा गर्दा श्रेष्ठ फल मिल्छ।',
  },
  28: {
    titleEn: '28/1 — High Promise Requiring Clear Legal & Financial Guardrails',
    meaningEn: 'Gifted initiator who should formalize agreements in writing rather than relying on informal handshakes.',
    meaningNe: 'उच्च सम्भावना बोकेको अंक—मौखिक भरमा नपरी लिखित सम्झौता र स्पष्ट नियम राख्दा नोक्सानीबाट बचिन्छ।',
  },
  32: {
    titleEn: '32/5 — Magnetic Communication & Independent Strategy',
    meaningEn: 'Like 23, harmonizes people and ideas effortlessly when you hold true to your own well-tested judgment.',
    meaningNe: 'प्रभावकारी संवाद र जनसम्पर्कको शुभ अंक—आफ्नो सुझबुझमा अडिग रहँदा निरन्तर प्रगति हुन्छ।',
  },
};

export interface ReportBibliographyEntry {
  id: string;
  title: string;
  authorAndEra: string;
  usedForEn: string;
  usedForNe: string;
}

export const REPORT_BOOK_BIBLIOGRAPHY: ReportBibliographyEntry[] = [
  {
    id: 'bphs',
    title: 'Brihat Parashara Hora Shastra (BPHS)',
    authorAndEra: 'Maharishi Parashara • Foundational Hora Canon (Ch. 7, 11–26, 29, 32, 40, 66)',
    usedForEn: 'D1/D2/D9/D10 divisional charts, 108 Planet-in-House rulings, House Lordships, 120-yr Vimshottari Dasha & 337-pt Ashtakavarga.',
    usedForNe: 'लग्न/होरा/नवांश/दशमांश वर्ग कुण्डली, भाव फल, विंशोत्तरी दशा र ३३७-बिन्दु अष्टकवर्ग गणना।',
  },
  {
    id: 'jaimini',
    title: 'Jaimini Upadesha Sutras',
    authorAndEra: 'Maharishi Jaimini • Classical Sutra Lineage (Adhyaya 1 & 2)',
    usedForEn: '7 Chara Karakas (Atmakaraka Soul King, Amatyakaraka Career, Darakaraka Spouse), Arudha Lagna (AL) & Upapada Lagna (UL).',
    usedForNe: 'आत्मकारक, अमात्यकारक, दाराकारक (जीवनसाथी), आरूढ लग्न र उपपद लग्न विश्लेषण।',
  },
  {
    id: 'uttara-kalamrita',
    title: 'Uttara Kalamrita',
    authorAndEra: 'Mahakavi Kalidasa • Classical South Indian Treatise (Khanda 4, Shloka 27)',
    usedForEn: 'Indu Lagna (Wealth Ascendant) computed from the 9th Lords of Lagna and Moon using exact planetary Kala units.',
    usedForNe: 'लग्न र चन्द्रबाट नवमेशको कला जोडी धन क्षमता हेर्ने इन्दु लग्न (धन लग्न) सूत्र।',
  },
  {
    id: 'phaladeepika',
    title: 'Phaladeepika',
    authorAndEra: 'Mantreshwara • 13th–16th Century CE (Ch. 6, 7, 8, 26)',
    usedForEn: 'Pancha Mahapurusha & Neecha Bhanga Yogas, live Saturn Sade Sati / Ashtama Shani & Jupiter Gochara transit rulings.',
    usedForNe: 'पञ्चमहापुरुष र नीचभङ्ग राजयोग तथा शनिको साढेसाती/ढैया र बृहस्पति गोचर फल।',
  },
  {
    id: 'brihat-jataka-samhita',
    title: 'Brihat Jataka & Brihat Samhita',
    authorAndEra: 'Varahamihira of Ujjain • 6th Century CE',
    usedForEn: 'Lunar Sunapha/Anapha/Durudhara Yogas, Birth Star temperaments, sacred tree ecology, and directional harmony.',
    usedForNe: 'चन्द्र योगहरू, नक्षत्र स्वभाव, पवित्र वृक्ष र दिशा सन्तुलन।',
  },
  {
    id: 'jataka-parijata',
    title: 'Jataka Parijata & Graha Pakva Canon',
    authorAndEra: 'Vaidyanatha Dikshita • 15th Century CE',
    usedForEn: 'Planetary Maturity Ages (16, 22, 24, 25, 28, 32, 36, 42, 48) and conjunction maturation timing.',
    usedForNe: 'ग्रह परिपक्वता उमेर (१६ देखि ४८ वर्षसम्मका जीवन मोडहरू) र युति प्रभाव।',
  },
  {
    id: 'muhurta-chintamani',
    title: 'Muhurta Chintamani & Taittiriya Brahmana',
    authorAndEra: 'Acharya Ramadaivajna (1600 CE) & Krishna Yajurveda Nakshatra Sukta',
    usedForEn: '28 Nakshatra Shaktis, Tarabala, Graha Horai, Gowri Panchangam, and 20-Action Decision Timing scores.',
    usedForNe: 'नक्षत्र शक्ति, ताराबल, २४-घण्टा होरा, गौरी पञ्चाङ्ग र शुभ कार्य मुहूर्त मूल्याङ्कन।',
  },
  {
    id: 'kp-ayurveda-modern',
    title: 'KP Reader IV, Ayurvedic Astrology & Cheiro / Hans Decoz Numerology',
    authorAndEra: 'Prof. K.S. Krishnamurti • Dr. David Frawley • Cheiro • Hans Decoz',
    usedForEn: 'KP Cusp 10/7 Sub-Lords, Vata-Pitta-Kapha wellness guide, 10–52 Compound Numbers, 4 Pinnacles & Karmic Lessons.',
    usedForNe: 'केपी सब-लर्ड, वात-पित्त-कफ स्वास्थ्य सन्तुलन, चेइरो संयुक्त अंक र जीवनका ४ शिखर चक्र।',
  },
];
