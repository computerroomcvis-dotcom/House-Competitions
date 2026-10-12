import {
  House,
  Student,
  TeacherUser,
  AdminUser,
  PointTransaction,
  SportsActivityEvent,
} from '../types';
import { OFFICIAL_HANDBOOK_ACTIVITIES } from './sportsHandbookActivities';
import { FEATURED_SPORTS_GAMES } from './sportsScheduleData';
import { DEFAULT_HOUSE_LOGOS } from './defaultHouseLogos';

// The 4 Official Crestview Houses (Official Handbook Edition)
export const INITIAL_HOUSES: House[] = [
  {
    id: 'house-earthshakers',
    name: 'House of Earthshakers',
    color: '#12B76A', // Emerald Green (#12B76A)
    lightColor: '#ECFDF3',
    textColor: '#027A48',
    borderColor: '#12B76A',
    mascot: 'Mighty Elephant',
    motto: 'Wisdom, Patience, and Grace',
    iconName: 'Shield',
    logoUrl: DEFAULT_HOUSE_LOGOS['house-earthshakers'],
    officialColors: ['Green', 'Brown', 'Gray'],
    colorHexList: ['#12B76A', '#78350F', '#6B7280'],
    colorDescription:
      'Green represents connection to nature, growth, and harmony; brown signifies balance, stability, and reliability; gray showcases composure and patience during adversity.',
    animalDescription:
      'Embrace the wisdom and serenity of the mighty elephant in the House of Earthshakers, where wisdom, patience, and a deep bond with nature define your path. As an Earthshaker, your diplomatic prowess, intelligence, and grace will guide you through the complex tapestry of life.',
    flagDescription:
      'Green flag with central elephant crest framed by earthy brown and calm gray stripes.',
    themeVirtues: ['Wisdom', 'Patience', 'Grace', 'Diplomatic Prowess', 'Harmony'],
  },
  {
    id: 'house-mountainhearts',
    name: 'House of Mountainhearts',
    color: '#F76808', // Burnt Amber (#F76808)
    lightColor: '#FFF6ED',
    textColor: '#C4320A',
    borderColor: '#F76808',
    mascot: 'Agile Ibex',
    motto: 'Strength, Perseverance, and Unity',
    iconName: 'Flame',
    logoUrl: DEFAULT_HOUSE_LOGOS['house-mountainhearts'],
    officialColors: ['Orange', 'Yellow', 'White'],
    colorHexList: ['#F76808', '#EAB308', '#F8FAFC'],
    colorDescription:
      'Orange signifies determination, courage, and adventurous spirit; yellow highlights loyalty and camaraderie; white symbolizes pure strength and unyielding resolve to overcome any challenge.',
    animalDescription:
      "Discover the indomitable spirit of the agile ibex in the House of Mountainhearts, a house defined by strength, perseverance, and unity. As a Mountainheart, you'll form strong bonds and conquer the peaks of both physical and intellectual pursuits, embodying the unwavering spirit of these resilient creatures.",
    flagDescription:
      'Radiant warm orange field with golden yellow and white accents, centered by the leaping ibex crest.',
    themeVirtues: ['Strength', 'Perseverance', 'Unity', 'Courage', 'Loyalty'],
  },
  {
    id: 'house-stormchasers',
    name: 'House of Stormchasers',
    color: '#2E90FA', // Royal Blue (#2E90FA)
    lightColor: '#EFF8FF',
    textColor: '#175CD3',
    borderColor: '#2E90FA',
    mascot: 'Majestic Eagle',
    motto: 'Freedom, Vision, and Mastery',
    iconName: 'Zap',
    logoUrl: DEFAULT_HOUSE_LOGOS['house-stormchasers'],
    officialColors: ['Blue', 'Maroon', 'Black'],
    colorHexList: ['#2E90FA', '#881337', '#0F172A'],
    colorDescription:
      'Blue symbolizes clarity, vision, and tranquility; maroon emphasizes resourcefulness; black showcases mastery of the skies and ability to weather any storm.',
    animalDescription:
      "Soar high with the majestic eagle in the House of Stormchasers, where freedom, vision, and mastery of the skies are your guiding stars. As a Stormchaser, you'll harness your insight, strategic thinking, and elemental power to rise above the ordinary and achieve greatness.",
    flagDescription:
      'Sky-blue banner accented with vertical stripes of rich maroon and deep black, bearing the golden eagle crest.',
    themeVirtues: ['Freedom', 'Vision', 'Mastery', 'Strategic Thinking', 'Resourcefulness'],
  },
  {
    id: 'house-thunderhooves',
    name: 'House of Thunderhooves',
    color: '#7A5AF8', // Purple (#7A5AF8)
    lightColor: '#F4F3FF',
    textColor: '#5925DC',
    borderColor: '#7A5AF8',
    mascot: 'Spirited Horse',
    motto: 'Speed, Agility, and Adaptability',
    iconName: 'Crown',
    logoUrl: DEFAULT_HOUSE_LOGOS['house-thunderhooves'],
    officialColors: ['Purple', 'Pink', 'Cream'],
    colorHexList: ['#7A5AF8', '#EC4899', '#FEF3C7'],
    colorDescription:
      'Purple embodies nobility, adaptability, and resourcefulness; pink showcases warmth and compassion that binds them to their allies; cream signifies balance and grace when facing challenges and forging connections.',
    animalDescription:
      'Unleash your inner strength with the spirited horse in the House of Thunderhooves, where speed, agility, and adaptability set you on a thrilling adventure. As a Thunderhoof, your courage, resourcefulness, and unwavering support for your allies will lead you to victory in all your endeavors.',
    flagDescription:
      'Noble purple and vibrant pink flag accented with warm cream corners and the golden horse crest.',
    themeVirtues: ['Speed', 'Agility', 'Adaptability', 'Compassion', 'Nobility'],
  },
];

// House Leadership Panel - Co-Chairs and Members (Admin Accounts with full name usernames)
export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-wheldon',
    name: 'Brooklyn Wheldon',
    username: 'Brooklyn Wheldon',
    email: 'wheldon.b@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Co-Chair [Preschool]',
    panelRole: 'Co-Chair',
    section: 'Preschool',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-manarondong',
    name: 'Princess Manarondong',
    username: 'Princess Manarondong',
    email: 'manarondong.p@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Co-Chair [Elementary]',
    panelRole: 'Co-Chair',
    section: 'Elementary',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-thiankaew',
    name: 'Intuon Thiankaew',
    username: 'Intuon Thiankaew',
    email: 'thiankaew.i@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-sawangsri',
    name: 'Chutima Sawangsri',
    username: 'Chutima Sawangsri',
    email: 'sawangsri.c@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-auysakul',
    name: 'Rattanaporn Auysakul',
    username: 'Rattanaporn Auysakul',
    email: 'auysakul.r@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member (KPI & Events)',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-faipetch',
    name: 'Uthumphorn Faipetch',
    username: 'Uthumphorn Faipetch',
    email: 'faipetch.u@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member (Counselor)',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-puakkong',
    name: 'Sarocha Puakkong',
    username: 'Sarocha Puakkong',
    email: 'puakkong.s@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-pimparn',
    name: 'Alisa Pimparn',
    username: 'Alisa Pimparn',
    email: 'pimparn.a@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-phosri',
    name: 'Engfah Phosri',
    username: 'Engfah Phosri',
    email: 'phosri.e@crestview.ac.th',
    password: 'admin',
    roleTitle: 'Leadership Panel Member',
    panelRole: 'Member',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'admin-sausa',
    name: 'Dr. Rehel Jemera Sausa',
    username: 'Dr. Rehel Jemera Sausa',
    email: 'academics@mail.crestview.ac.th',
    password: 'admin',
    roleTitle: 'Director of Academics (Consultant)',
    panelRole: 'Administrator',
    section: 'Schoolwide',
    createdAt: '2026-08-18T08:00:00Z',
  },
];

// House Ambassadors and Counselors (Teacher Accounts with full name usernames)
export const INITIAL_TEACHERS: TeacherUser[] = [
  // HOUSE OF MOUNTAINHEARTS
  {
    id: 'teach-mh-amb',
    name: 'Clarise Joyce Haguisan',
    username: 'Clarise Joyce Haguisan',
    email: 'haguisan.c@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-mountainhearts',
    houseRole: 'House Ambassador',
    gradeAssigned: 'All',
    subject: 'House Ambassador (Mountainhearts)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-mh-coun-1',
    name: 'Anna Krasteva',
    username: 'Anna Krasteva',
    email: 'krasteva.a@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-mountainhearts',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Mountainhearts)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-mh-coun-2',
    name: 'Saitong Rattanawong',
    username: 'Saitong Rattanawong',
    email: 'rattanawong.s@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-mountainhearts',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Mountainhearts)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-mh-coun-3',
    name: 'Anchaya Minwong',
    username: 'Anchaya Minwong',
    email: 'minwong.a@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-mountainhearts',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Mountainhearts)',
    createdAt: '2026-08-18T08:00:00Z',
  },

  // HOUSE OF EARTHSHAKERS
  {
    id: 'teach-es-amb',
    name: 'Olga Chugunova',
    username: 'Olga Chugunova',
    email: 'chugunova.o@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-earthshakers',
    houseRole: 'House Ambassador',
    gradeAssigned: 'All',
    subject: 'House Ambassador (Earthshakers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-es-coun-1',
    name: 'Meriem Choukri',
    username: 'Meriem Choukri',
    email: 'choukri.m@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-earthshakers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Earthshakers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-es-coun-2',
    name: 'Wandee Cunhom',
    username: 'Wandee Cunhom',
    email: 'cunhom.w@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-earthshakers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Earthshakers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-es-coun-3',
    name: 'Uthumphorn Faipetch',
    username: 'Uthumphorn Faipetch',
    email: 'faipetch.u@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-earthshakers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor & Leadership Member',
    createdAt: '2026-08-18T08:00:00Z',
  },

  // HOUSE OF THUNDERHOOVES
  {
    id: 'teach-th-amb',
    name: 'Novie Ann Gabut',
    username: 'Novie Ann Gabut',
    email: 'gabut.n@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-thunderhooves',
    houseRole: 'House Ambassador',
    gradeAssigned: 'All',
    subject: 'House Ambassador (Thunderhooves)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-th-coun-1',
    name: 'Nadchanok Kheawmanee',
    username: 'Nadchanok Kheawmanee',
    email: 'kheawmanee.n@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-thunderhooves',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Thunderhooves)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-th-coun-2',
    name: 'Neeracha Singking',
    username: 'Neeracha Singking',
    email: 'singking.n@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-thunderhooves',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Thunderhooves)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-th-coun-3',
    name: 'Maria Lucell Tano',
    username: 'Maria Lucell Tano',
    email: 'tano.m@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-thunderhooves',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Thunderhooves)',
    createdAt: '2026-08-18T08:00:00Z',
  },

  // HOUSE OF STORMCHASERS
  {
    id: 'teach-sc-amb',
    name: 'Veronica Tenencia',
    username: 'Veronica Tenencia',
    email: 'tenencia.v@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-stormchasers',
    houseRole: 'House Ambassador',
    gradeAssigned: 'All',
    subject: 'House Ambassador (Stormchasers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-sc-coun-1',
    name: 'Princess Wheldon',
    username: 'Princess Wheldon',
    email: 'wheldon.p@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-stormchasers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Stormchasers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-sc-coun-2',
    name: 'Tanaschaya Prasertpong',
    username: 'Tanaschaya Prasertpong',
    email: 'prasertpong.t@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-stormchasers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Stormchasers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 'teach-sc-coun-3',
    name: 'Baiboon Thiengtae',
    username: 'Baiboon Thiengtae',
    email: 'thiengtae.b@crestview.ac.th',
    password: 'teacher123',
    houseId: 'house-stormchasers',
    houseRole: 'House Counselor',
    gradeAssigned: 'All',
    subject: 'House Counselor (Stormchasers)',
    createdAt: '2026-08-18T08:00:00Z',
  },
];

// All 96 Students assigned to their official Houses and Grade levels (just Name, Grade, House, Prefect)
export const INITIAL_STUDENTS: Student[] = [
  // ==========================================
  // 1. HOUSE OF MOUNTAINHEARTS (25 Students)
  // ==========================================
  // TP (1)
  {
    id: 'stu-mh-tp-1',
    name: 'Pongnapat Supakiatbanchorn',
    grade: 'TP',
    houseId: 'house-mountainhearts',
  },

  // PK-3 (3)
  {
    id: 'stu-mh-pk3-1',
    name: 'Tanyapas Isarasenarak',
    grade: 'PK-3',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk3-2',
    name: 'Neo',
    grade: 'PK-3',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk3-3',
    name: 'Hashem Masodi',
    grade: 'PK-3',
    houseId: 'house-mountainhearts',
  },

  // PK-4 (5)
  {
    id: 'stu-mh-pk4-1',
    name: 'Pimlaphat Prayoonkrod',
    grade: 'PK-4',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk4-2',
    name: 'Lanlalin Prayoonkrod',
    grade: 'PK-4',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk4-3',
    name: 'Linlada Puteera',
    grade: 'PK-4',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk4-4',
    name: 'Theema Dangsurisri',
    grade: 'PK-4',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-pk4-5',
    name: 'Kunchaya Sudsawat',
    grade: 'PK-4',
    houseId: 'house-mountainhearts',
  },

  // GK-Emerald (3)
  {
    id: 'stu-mh-gk-1',
    name: 'Rujipas Isarasenarak',
    grade: 'GK-Emerald',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-gk-2',
    name: 'Nicharat Petcharat',
    grade: 'GK-Emerald',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-gk-3',
    name: 'Kolanya Panich',
    grade: 'GK-Emerald',
    houseId: 'house-mountainhearts',
  },

  // Grade 1 (3)
  {
    id: 'stu-mh-g1-1',
    name: 'Seerat Agarwal',
    grade: 'Grade 1',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g1-2',
    name: 'Thammachat Apinun',
    grade: 'Grade 1',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g1-3',
    name: 'Thanphitcha Paige Bauer',
    grade: 'Grade 1',
    houseId: 'house-mountainhearts',
  },

  // Grade 2 (5)
  {
    id: 'stu-mh-g2-1',
    name: 'Jidapa Atthasiripanya',
    grade: 'Grade 2',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g2-2',
    name: 'Sittha Sudsawat',
    grade: 'Grade 2',
    houseId: 'house-mountainhearts',
    isPrefect: true,
  },
  {
    id: 'stu-mh-g2-3',
    name: 'Tharitthimut Thongdee',
    grade: 'Grade 2',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g2-4',
    name: 'Palika Panich',
    grade: 'Grade 2',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g2-5',
    name: 'Phutthimate Apinan',
    grade: 'Grade 2',
    houseId: 'house-mountainhearts',
    isPrefect: true,
  },

  // Grade 3 (1)
  {
    id: 'stu-mh-g3-1',
    name: 'Chanasit Buaphan',
    grade: 'Grade 3',
    houseId: 'house-mountainhearts',
  },

  // Grade 4 (2)
  {
    id: 'stu-mh-g4-1',
    name: 'Ramon Panmapapa',
    grade: 'Grade 4',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g4-2',
    name: 'Pol Thongsansra',
    grade: 'Grade 4',
    houseId: 'house-mountainhearts',
  },

  // Grade 5 (2)
  {
    id: 'stu-mh-g5-1',
    name: 'Alisha Nadeem Chumpathong',
    grade: 'Grade 5',
    houseId: 'house-mountainhearts',
  },
  {
    id: 'stu-mh-g5-2',
    name: 'Threeratam Vongprathart',
    grade: 'Grade 5',
    houseId: 'house-mountainhearts',
  },

  // ==========================================
  // 2. HOUSE OF EARTHSHAKERS (23 Students)
  // ==========================================
  // TP (1)
  {
    id: 'stu-es-tp-1',
    name: 'Khemupsorn Karoonyasiri',
    grade: 'TP',
    houseId: 'house-earthshakers',
  },

  // PK-3 (5)
  {
    id: 'stu-es-pk3-1',
    name: 'Pinsararom Tangkanjanasri',
    grade: 'PK-3',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk3-2',
    name: 'Thichanan Luengthong',
    grade: 'PK-3',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk3-3',
    name: 'Itthipong Rungsrithong',
    grade: 'PK-3',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk3-4',
    name: 'Pannapat Thanapituk',
    grade: 'PK-3',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk3-5',
    name: 'Kawee Srimueng',
    grade: 'PK-3',
    houseId: 'house-earthshakers',
  },

  // PK-4 (6)
  {
    id: 'stu-es-pk4-1',
    name: 'Schatzi Chatchaisiri',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk4-2',
    name: 'Pincha Wongkawee',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk4-3',
    name: 'Wawa Chomworawong',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk4-4',
    name: 'Ratchanon Weerasai',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk4-5',
    name: 'Achiranon Sasakul',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-pk4-6',
    name: 'Tanyapat Panpiw',
    grade: 'PK-4',
    houseId: 'house-earthshakers',
  },

  // GK-Emerald (3)
  {
    id: 'stu-es-gk-1',
    name: 'Siripaksorn Raktai',
    grade: 'GK-Emerald',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-gk-2',
    name: 'Evarin Nittayanantawech',
    grade: 'GK-Emerald',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-gk-3',
    name: 'Charita Sripalin',
    grade: 'GK-Emerald',
    houseId: 'house-earthshakers',
  },

  // Grade 1 (3)
  {
    id: 'stu-es-g1-1',
    name: 'Nirin Ruangburop',
    grade: 'Grade 1',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-g1-2',
    name: 'Miranda Kittipot',
    grade: 'Grade 1',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-g1-3',
    name: 'Jin Wongkawee',
    grade: 'Grade 1',
    houseId: 'house-earthshakers',
  },

  // Grade 2 (3)
  {
    id: 'stu-es-g2-1',
    name: 'Apiruk Phanphiw',
    grade: 'Grade 2',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-g2-2',
    name: 'Kannaphat Karoonyasiri',
    grade: 'Grade 2',
    houseId: 'house-earthshakers',
  },
  {
    id: 'stu-es-g2-3',
    name: 'Nathaphong Jongchidkrang',
    grade: 'Grade 2',
    houseId: 'house-earthshakers',
  },

  // Grade 4 (1)
  {
    id: 'stu-es-g4-1',
    name: 'Nutthakamon Pinthong',
    grade: 'Grade 4',
    houseId: 'house-earthshakers',
  },

  // Grade 5 (1)
  {
    id: 'stu-es-g5-1',
    name: 'Thanadej Onsawai',
    grade: 'Grade 5',
    houseId: 'house-earthshakers',
    isPrefect: true,
  },

  // ==========================================
  // 3. HOUSE OF THUNDERHOOVES (25 Students)
  // ==========================================
  // TP (1)
  {
    id: 'stu-th-tp-1',
    name: 'Parin Waithayayothin',
    grade: 'TP',
    houseId: 'house-thunderhooves',
  },

  // PK-3 (4)
  {
    id: 'stu-th-pk3-1',
    name: 'Lida Wongklang',
    grade: 'PK-3',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-pk3-2',
    name: 'Phacharamon Inurai',
    grade: 'PK-3',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-pk3-3',
    name: 'Kannisa Thongta',
    grade: 'PK-3',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-pk3-4',
    name: 'Benyapat Thamboonsuk',
    grade: 'PK-3',
    houseId: 'house-thunderhooves',
  },

  // PK-4 (3)
  {
    id: 'stu-th-pk4-1',
    name: 'Napapach Klibngern',
    grade: 'PK-4',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-pk4-2',
    name: 'Akira Manee-in',
    grade: 'PK-4',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-pk4-3',
    name: 'Natthanicha Kitjawan',
    grade: 'PK-4',
    houseId: 'house-thunderhooves',
  },

  // GK-Emerald (6)
  {
    id: 'stu-th-gk-1',
    name: 'Piyawat Jaijaroen',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-gk-2',
    name: 'Piyaphat Jaijaroen',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-gk-3',
    name: 'Saranphat Khamkhun',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-gk-4',
    name: 'Nutpisit Srisuthep',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-gk-5',
    name: 'Phichayut Rakseethong',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-gk-6',
    name: 'Natthanan Rattanasakda',
    grade: 'GK-Emerald',
    houseId: 'house-thunderhooves',
  },

  // Grade 1 (3)
  {
    id: 'stu-th-g1-1',
    name: 'Akira Ratanasermpong',
    grade: 'Grade 1',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g1-2',
    name: 'Thanabodi Morarit',
    grade: 'Grade 1',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g1-3',
    name: 'Rukchalid Kitjawan',
    grade: 'Grade 1',
    houseId: 'house-thunderhooves',
  },

  // Grade 2 (2)
  {
    id: 'stu-th-g2-1',
    name: 'Poonnapat Phuakphong',
    grade: 'Grade 2',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g2-2',
    name: 'Chanthanun Thongsa-ard',
    grade: 'Grade 2',
    houseId: 'house-thunderhooves',
  },

  // Grade 3 (2)
  {
    id: 'stu-th-g3-1',
    name: 'Saran Sharman',
    grade: 'Grade 3',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g3-2',
    name: 'Pimmada Morarit',
    grade: 'Grade 3',
    houseId: 'house-thunderhooves',
    isPrefect: true,
  },

  // Grade 4 (2)
  {
    id: 'stu-th-g4-1',
    name: 'Preuk Thanlek',
    grade: 'Grade 4',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g4-2',
    name: 'Pavika Vijitcharoenkul',
    grade: 'Grade 4',
    houseId: 'house-thunderhooves',
    isPrefect: true,
  },

  // Grade 5 (2)
  {
    id: 'stu-th-g5-1',
    name: 'Tekari Rakwong',
    grade: 'Grade 5',
    houseId: 'house-thunderhooves',
  },
  {
    id: 'stu-th-g5-2',
    name: 'Natthaputthiya Thongsa-ard',
    grade: 'Grade 5',
    houseId: 'house-thunderhooves',
  },

  // ==========================================
  // 4. HOUSE OF STORMCHASERS (23 Students)
  // ==========================================
  // TP (1)
  {
    id: 'stu-sc-tp-1',
    name: 'Kirinthorn Worakanjanakul',
    grade: 'TP',
    houseId: 'house-stormchasers',
  },

  // PK-3 (6)
  {
    id: 'stu-sc-pk3-1',
    name: 'Supassorn Angsuthornwilai',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk3-2',
    name: 'Jetgavin Avarun',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk3-3',
    name: 'Sasinapat Jorawong',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk3-4',
    name: 'Thanakrit Buabanjong',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk3-5',
    name: 'Kritphumphit Tungjaroenpol',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk3-6',
    name: 'Nuttarut Paibul',
    grade: 'PK-3',
    houseId: 'house-stormchasers',
  },

  // PK-4 (5)
  {
    id: 'stu-sc-pk4-1',
    name: 'Nattanont Rattanaprapai',
    grade: 'PK-4',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk4-2',
    name: 'Poomrapee Worakanjanakul',
    grade: 'PK-4',
    houseId: 'house-stormchasers',
    isPrefect: true,
  },
  {
    id: 'stu-sc-pk4-3',
    name: 'Pichayapa Punyatrong',
    grade: 'PK-4',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk4-4',
    name: 'Thanawin Prichanukun',
    grade: 'PK-4',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-pk4-5',
    name: 'Atthayasaidee Phadungwiang',
    grade: 'PK-4',
    houseId: 'house-stormchasers',
  },

  // GK-Emerald / GK (3)
  {
    id: 'stu-sc-gk-1',
    name: 'Glenda Chatrungsan',
    grade: 'GK-Emerald',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-gk-2',
    name: 'Sappawat Siripanichgon',
    grade: 'GK-Emerald',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-gk-3',
    name: 'Nitikul Plyjun',
    grade: 'GK-Emerald',
    houseId: 'house-stormchasers',
  },

  // Grade 1 (3)
  {
    id: 'stu-sc-g1-1',
    name: 'Natdanai Rattanaprapai',
    grade: 'Grade 1',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-g1-2',
    name: 'Artisha Thamsamerdee',
    grade: 'Grade 1',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-g1-3',
    name: 'Trinanan Tangphisitphaibun',
    grade: 'Grade 1',
    houseId: 'house-stormchasers',
  },

  // Grade 2 (1)
  {
    id: 'stu-sc-g2-1',
    name: 'Supassara Angsuthornwilai',
    grade: 'Grade 2',
    houseId: 'house-stormchasers',
    isPrefect: true,
  },

  // Grade 3 (3)
  {
    id: 'stu-sc-g3-1',
    name: 'Theethat Sannamwong',
    grade: 'Grade 3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-g3-2',
    name: 'Pintip Supboon',
    grade: 'Grade 3',
    houseId: 'house-stormchasers',
  },
  {
    id: 'stu-sc-g3-3',
    name: 'Wiratai Seanapong',
    grade: 'Grade 3',
    houseId: 'house-stormchasers',
  },

  // Grade 5 (1)
  {
    id: 'stu-sc-g5-1',
    name: 'Sira Supboon',
    grade: 'Grade 5',
    houseId: 'house-stormchasers',
  },
];

// Seed realistic starter transactions to showcase live leaderboards
function generateSeedTransactions(): PointTransaction[] {
  return [];
}

export const INITIAL_TRANSACTIONS: PointTransaction[] = [];

export const MERIT_PRESETS = [
  { label: 'Exemplary Effort & Participation', points: 5 },
  { label: 'Academic Achievement', points: 10 },
  { label: 'Respect, Kindness & Empathy', points: 5 },
  { label: 'Leadership & Prefect Duty', points: 15 },
  { label: 'House Spirit & Sportsmanship', points: 10 },
  { label: 'Perseverance & Resilience', points: 5 },
  { label: 'Environmental / Campus Care', points: 5 },
  { label: 'Creativity & Arts Excellence', points: 10 },
];

export const DEMERIT_PRESETS = [
  { label: 'Classroom Disruption', points: 2 },
  { label: 'Incomplete Assigned Work', points: 3 },
  { label: 'Lack of Respect / Disregard', points: 5 },
  { label: 'Uniform / Dress Code Infraction', points: 1 },
  { label: 'Unpunctuality to Class/Assembly', points: 2 },
];

export const INITIAL_SPORTS_EVENTS: SportsActivityEvent[] = [
  ...FEATURED_SPORTS_GAMES,
  ...OFFICIAL_HANDBOOK_ACTIVITIES,
];

