/**
 * Every fact on the site comes from this file, which mirrors the CV.
 * Edit here; components only render what is present.
 */

/**
 * @typedef {Object} Contact
 * @property {string} email
 * @property {string} phoneDisplay   Human-readable number
 * @property {string} phoneTel       tel: URI
 * @property {string} whatsapp       wa.me URL
 * @property {string} [linkedin]     Optional, render nothing when empty
 * @property {string} [github]       Optional, render nothing when empty
 * @property {string} [website]      Optional, render nothing when empty
 */

/**
 * @typedef {Object} Deed
 * @property {string} text
 * @property {'mask'|'letter'|'river'|'kamon'|'nobori'|'honor'|null} [glyph]  Ink emblem key
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} company
 * @property {string} city
 * @property {string} start
 * @property {string} end
 * @property {string} title
 * @property {string} type         Full time, Part time, Summer Intern
 * @property {string} [about]      About the company
 * @property {string} summary      Context of the role
 * @property {Deed[]} deeds
 * @property {boolean} [award]     Shows the 誉 hanko
 */

/**
 * @typedef {Object} Credential
 * @property {string} id
 * @property {string} kanji        Ornamental mark on the board
 * @property {string} name
 * @property {string} issuer
 * @property {string[]} dates
 * @property {string[]} lines      Detail lines, all taken from the CV
 * @property {string} [url]        Only when the CV carries a real link
 */

/**
 * @typedef {Object} ArsenalTier
 * @property {string} label
 * @property {string[]} items
 */

export const profile = {
  name: 'Andreas Jumaga',
  role: 'AI Engineer',
  company: 'PT. Indonesia Global Solusindo',
  location: 'Kabupaten Bandung, Indonesia',
  heroRoleLine: 'AI Engineer in Bandung, Indonesia',
  photo: '/assets/andreas.jpg',
  degree: 'Sarjana Informatika (Bachelor of Informatics), ITHB',

  objective:
    'I build and deploy intelligent systems, bringing strong analytical skills, clear communication, and expertise in Python, machine learning frameworks, and AI model development.',

  /** @type {Contact} */
  contact: {
    email: 'andreasjumagam@gmail.com',
    phoneDisplay: '0858-6100-2916',
    phoneTel: 'tel:+6285861002916',
    whatsapp: 'https://wa.me/6285861002916',
    linkedin: '',
    github: '',
    website: '',
  },

  /** @type {Job[]} */
  jobs: [
    {
      id: 'igs',
      company: 'PT. Indonesia Global Solusindo',
      city: 'Jakarta',
      start: 'December 2023',
      end: 'Present',
      title: 'AI Engineer',
      type: 'Full time',
      about: 'IT consultancy specializing in monitoring, automation, and AI solutions.',
      summary:
        'Works in the AI division, developing and implementing artificial intelligence solutions to improve operational efficiency.',
      award: true,
      deeds: [
        { glyph: 'mask', text: 'Developed a face-recognition-based prison visitation system for correctional facilities (LAPAS).' },
        { glyph: 'letter', text: 'Built AI-powered chatbot solutions integrated with knowledge bases and big data for BKPM and BSI.' },
        { glyph: 'river', text: 'Designed and implemented ETL pipelines for big-data processing, and created Tableau dashboards integrated with a React frontend for BRI staff nationwide.' },
        { glyph: 'kamon', text: "Developed a data-matching system to harmonize multi-source data for DUKCAPIL's national database." },
        { glyph: 'nobori', text: 'Created an interactive company profile website with enhanced user engagement features.' },
        { glyph: 'honor', text: "Received the company's Best Employee award." },
      ],
    },
    {
      id: 'mea-pt',
      company: 'PT. MEA Digital Marketing',
      city: 'Bandung',
      start: 'September 2022',
      end: 'March 2023',
      title: 'Back-End Developer',
      type: 'Part time',
      about:
        'Helps micro, small, and medium enterprises increase sales through digital marketing, via online learning and digital marketing services.',
      summary:
        "Developed komunitasmea.com and edukabis, the company's new ventures into online learning and e-commerce.",
      deeds: [
        { text: 'Migrated modules in komunitasmea.com.' },
        { text: 'Developed edukabis.' },
      ],
    },
    {
      id: 'mea-intern',
      company: 'PT. MEA Digital Marketing',
      city: 'Bandung',
      start: 'May 2022',
      end: 'August 2022',
      title: 'Back-End Developer and QA Testing',
      type: 'Summer Intern',
      summary:
        "Developed komunitasmea.com and edukabis, the company's new ventures into online learning and e-commerce, and migrated modules in komunitasmea.com.",
      deeds: [
        { text: 'Developed edukabis.' },
        { text: 'Developed automated tests for the Profile and User Payment modules.' },
        { text: 'Migrated the Rating, Product Selector, and Lesson modules in komunitasmea.com to Clean Architecture.' },
        { text: 'Developed the Wishlist and Storefront modules in edukabis.' },
        { text: 'Implemented Shipper (3PL) and Xendit in edukabis.' },
      ],
    },
  ],

  /** @type {Credential[]} */
  training: [
    {
      id: 'ithb',
      kanji: '学',
      name: 'Institut Teknologi Harapan Bangsa (ITHB)',
      issuer: 'Bandung, Indonesia',
      dates: ['September 2023'],
      lines: ['Sarjana Informatika (Bachelor of Informatics)', 'Concentration: AI Engineering', 'GPA 3.48'],
    },
    {
      id: 'gaipc',
      kanji: '創',
      name: 'Generative AI Professional Certification (GAIPC™)',
      issuer: 'CertiProf',
      dates: ['November 2024'],
      lines: ['Professional certification in generative AI technologies, prompt engineering, and responsible AI implementation.'],
      // The CV hyperlink on this title points to "http://#", so no certificate link is rendered.
      url: '',
    },
    {
      id: 'aws',
      kanji: '雲',
      name: 'AWS Academy Cloud Foundations (ACF)',
      issuer: 'AWS Academy, via ITHB Career Resource Center',
      dates: ['December 2022'],
      lines: [],
    },
    {
      id: 'sap',
      kanji: '盟',
      name: 'SAP University Alliance Program',
      issuer: 'via ITHB Career Resource Center',
      dates: ['December 2021', 'January 2022'],
      lines: ['Completed SAP S/4HANA Configuration'],
    },
    {
      id: 'toefl',
      kanji: '言',
      name: 'TOEFL',
      issuer: 'TBI',
      dates: ['2021'],
      lines: ['Score 557'],
    },
  ],

  /** @type {ArsenalTier[]} */
  arsenal: [
    { label: 'Programming languages', items: ['Java', 'Python', 'C++', 'PHP', 'Go', 'Kotlin', 'JavaScript', 'TypeScript'] },
    { label: 'Frameworks and libraries', items: ['Gin', 'Laravel', 'Flask', 'Spring Boot', 'React', 'Vue', 'Express', 'Svelte', 'FastAPI', 'LangChain', 'LlamaIndex'] },
    { label: 'Databases and vector stores', items: ['Oracle', 'MySQL', 'PostgreSQL', 'MariaDB', 'MongoDB', 'Qdrant', 'Weaviate', 'pgvector'] },
    { label: 'Operating systems', items: ['Windows', 'Windows Server', 'Unix', 'Linux'] },
    { label: 'Development tools', items: ['Visual Studio Code', 'DataGrip', 'IntelliJ', 'NetBeans'] },
    { label: 'Office suite', items: ['Microsoft Word', 'Microsoft Excel'] },
    { label: 'From the field', items: ['Tableau', 'AWS'] },
  ],
}

/** Chapter registry used by the nav, progress and audio scenes. */
export const chapters = [
  { id: 'prologue', nav: '序', kanji: '序章', title: 'Prologue', scene: 'prologue' },
  { id: 'creed', nav: '志', kanji: '第一章 志', title: 'The Creed', scene: 'creed' },
  { id: 'battles', nav: '戦', kanji: '第二章 戦歴', title: 'Battles', scene: 'battles' },
  { id: 'training', nav: '修', kanji: '第三章 修行', title: 'Training', scene: 'training' },
  { id: 'arsenal', nav: '武', kanji: '第四章 武器', title: 'Arsenal', scene: 'arsenal' },
  { id: 'epilogue', nav: '縁', kanji: '終章 縁', title: 'Epilogue', scene: 'epilogue' },
]
