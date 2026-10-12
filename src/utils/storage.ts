import {
  House,
  Student,
  TeacherUser,
  AdminUser,
  PointTransaction,
  SportsActivityEvent,
  CurrentUser,
  GradeLevel,
  TabSettings,
  DEFAULT_TAB_SETTINGS,
} from '../types';
import {
  INITIAL_HOUSES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_ADMINS,
  INITIAL_TRANSACTIONS,
  INITIAL_SPORTS_EVENTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  HOUSES: 'crestview_house_points_houses_v7',
  STUDENTS: 'crestview_house_points_students_v7',
  TEACHERS: 'crestview_house_points_teachers_v7',
  ADMINS: 'crestview_house_points_admins_v7',
  TRANSACTIONS: 'crestview_house_points_transactions_v7',
  SPORTS_EVENTS: 'crestview_house_points_sports_events_v7',
  EVENTS_TAB_GAME_CARDS: 'events_tab_game_cards',
  TAB_SETTINGS: 'tab_settings',
  CURRENT_USER: 'crestview_house_points_current_user_v7',
  ADMIN_PASSWORD: 'crestview_house_points_admin_password_v7',
};

export const DEFAULT_ADMIN_PASSWORD = 'admin';

export interface StorageData {
  houses: House[];
  students: Student[];
  teachers: TeacherUser[];
  adminUsers: AdminUser[];
  transactions: PointTransaction[];
  sportsEvents: SportsActivityEvent[];
  tabSettings: TabSettings;
  adminPassword: string;
}

export function loadTabSettings(): TabSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TAB_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        events_enabled:
          typeof parsed.events_enabled === 'boolean'
            ? parsed.events_enabled
            : DEFAULT_TAB_SETTINGS.events_enabled,
        events_disabled_message:
          typeof parsed.events_disabled_message === 'string' && parsed.events_disabled_message.trim()
            ? parsed.events_disabled_message
            : DEFAULT_TAB_SETTINGS.events_disabled_message,
        results_enabled:
          typeof parsed.results_enabled === 'boolean'
            ? parsed.results_enabled
            : DEFAULT_TAB_SETTINGS.results_enabled,
        results_disabled_message:
          typeof parsed.results_disabled_message === 'string' && parsed.results_disabled_message.trim()
            ? parsed.results_disabled_message
            : DEFAULT_TAB_SETTINGS.results_disabled_message,
      };
    }
  } catch (err) {
    console.warn('Error reading tab settings from localStorage:', err);
  }
  return { ...DEFAULT_TAB_SETTINGS };
}

export function saveTabSettings(settings: TabSettings): void {
  localStorage.setItem(STORAGE_KEYS.TAB_SETTINGS, JSON.stringify(settings));
}

export function loadInitialData(): StorageData {
  try {
    const rawHouses = localStorage.getItem(STORAGE_KEYS.HOUSES);
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const rawAdmins = localStorage.getItem(STORAGE_KEYS.ADMINS);
    const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const rawSports =
      localStorage.getItem(STORAGE_KEYS.EVENTS_TAB_GAME_CARDS) ||
      localStorage.getItem(STORAGE_KEYS.SPORTS_EVENTS);
    const rawAdminPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    const loadedTabSettings = loadTabSettings();

    // Ensure house colors, mottos, mascots, logos, and handbook descriptions are always synchronized
    let loadedHouses: House[] = INITIAL_HOUSES;
    if (rawHouses) {
      try {
        const parsed = JSON.parse(rawHouses) as House[];
        loadedHouses = INITIAL_HOUSES.map((initH) => {
          const stored = parsed.find((p) => p.id === initH.id);
          return {
            ...initH,
            ...stored,
            // Preserve user-updated house logoUrl or fallback to official default
            logoUrl: stored?.logoUrl || initH.logoUrl,
            // Strictly enforce official handbook colors and attributes
            color: initH.color,
            lightColor: initH.lightColor,
            textColor: initH.textColor,
            borderColor: initH.borderColor,
            mascot: initH.mascot,
            motto: initH.motto,
            iconName: initH.iconName,
            officialColors: initH.officialColors,
            colorHexList: initH.colorHexList,
            colorDescription: initH.colorDescription,
            animalDescription: initH.animalDescription,
            flagDescription: initH.flagDescription,
            themeVirtues: initH.themeVirtues,
          };
        });
      } catch {
        loadedHouses = INITIAL_HOUSES;
      }
    }

    let loadedSports: SportsActivityEvent[] = INITIAL_SPORTS_EVENTS;
    if (rawSports) {
      try {
        const stored = JSON.parse(rawSports) as SportsActivityEvent[];
        if (Array.isArray(stored)) {
          loadedSports = stored;
        }
      } catch {
        loadedSports = INITIAL_SPORTS_EVENTS;
      }
    }

    const loadedStudents: Student[] = rawStudents
      ? (JSON.parse(rawStudents) as any[]).map((s) => ({
          id: s.id,
          name: s.name,
          grade: s.grade,
          houseId: s.houseId,
          isPrefect: s.isPrefect,
          avatarSeed: s.avatarSeed,
        }))
      : INITIAL_STUDENTS;

    const loadedTeachers: TeacherUser[] = rawTeachers
      ? (JSON.parse(rawTeachers) as any[]).map((t) => ({
          ...t,
          username: t.username || t.name,
        }))
      : INITIAL_TEACHERS;

    const loadedAdmins: AdminUser[] = rawAdmins
      ? (JSON.parse(rawAdmins) as any[]).map((a) => ({
          ...a,
          username: a.username || a.name,
        }))
      : INITIAL_ADMINS;

    return {
      houses: loadedHouses,
      students: loadedStudents,
      teachers: loadedTeachers,
      adminUsers: loadedAdmins,
      transactions: rawTransactions ? JSON.parse(rawTransactions) : INITIAL_TRANSACTIONS,
      sportsEvents: loadedSports,
      tabSettings: loadedTabSettings,
      adminPassword: rawAdminPass || DEFAULT_ADMIN_PASSWORD,
    };
  } catch (err) {
    console.warn('Error reading from localStorage, using initial defaults:', err);
    return {
      houses: INITIAL_HOUSES,
      students: INITIAL_STUDENTS,
      teachers: INITIAL_TEACHERS,
      adminUsers: INITIAL_ADMINS,
      transactions: INITIAL_TRANSACTIONS,
      sportsEvents: INITIAL_SPORTS_EVENTS,
      tabSettings: { ...DEFAULT_TAB_SETTINGS },
      adminPassword: DEFAULT_ADMIN_PASSWORD,
    };
  }
}

export function saveHouses(houses: House[]): void {
  localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses));
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function saveTeachers(teachers: TeacherUser[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
}

export function saveAdminUsers(admins: AdminUser[]): void {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
}

export function saveTransactions(transactions: PointTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function saveSportsEvents(events: SportsActivityEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.SPORTS_EVENTS, JSON.stringify(events));
  localStorage.setItem(STORAGE_KEYS.EVENTS_TAB_GAME_CARDS, JSON.stringify(events));
}

export function saveAdminPassword(password: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
}

export function loadCurrentUser(): CurrentUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  // Default to Brooklyn Wheldon (Co-Chair, Admin)
  return {
    role: 'admin',
    adminUser: INITIAL_ADMINS[0],
    isAdmin: true,
  };
}

export function saveCurrentUser(user: CurrentUser): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function resetAllToDefaults(): StorageData {
  saveHouses(INITIAL_HOUSES);
  saveStudents(INITIAL_STUDENTS);
  saveTeachers(INITIAL_TEACHERS);
  saveAdminUsers(INITIAL_ADMINS);
  saveTransactions(INITIAL_TRANSACTIONS);
  saveSportsEvents(INITIAL_SPORTS_EVENTS);
  saveTabSettings(DEFAULT_TAB_SETTINGS);
  saveAdminPassword(DEFAULT_ADMIN_PASSWORD);
  saveCurrentUser({
    role: 'admin',
    adminUser: INITIAL_ADMINS[0],
    isAdmin: true,
  });
  return {
    houses: INITIAL_HOUSES,
    students: INITIAL_STUDENTS,
    teachers: INITIAL_TEACHERS,
    adminUsers: INITIAL_ADMINS,
    transactions: INITIAL_TRANSACTIONS,
    sportsEvents: INITIAL_SPORTS_EVENTS,
    tabSettings: { ...DEFAULT_TAB_SETTINGS },
    adminPassword: DEFAULT_ADMIN_PASSWORD,
  };
}

// Calculations
export interface StudentPointSummary {
  student: Student;
  merits: number;
  demerits: number;
  netPoints: number;
  transactionCount: number;
}

export function computeStudentSummaries(
  students: Student[],
  transactions: PointTransaction[]
): Record<string, StudentPointSummary> {
  const summary: Record<string, StudentPointSummary> = {};

  students.forEach((s) => {
    summary[s.id] = {
      student: s,
      merits: 0,
      demerits: 0,
      netPoints: 0,
      transactionCount: 0,
    };
  });

  transactions.forEach((tx) => {
    if (!summary[tx.studentId]) return;
    summary[tx.studentId].transactionCount += 1;
    if (tx.type === 'merit') {
      summary[tx.studentId].merits += tx.amount;
      summary[tx.studentId].netPoints += tx.amount;
    } else {
      summary[tx.studentId].demerits += tx.amount;
      summary[tx.studentId].netPoints -= tx.amount;
    }
  });

  return summary;
}

export interface HouseTotalSummary {
  house: House;
  studentMerits: number;
  studentDemerits: number;
  sportsAndActivityPoints: number;
  totalPoints: number;
  rank: number;
  studentCount: number;
}

export function computeHouseTotals(
  houses: House[],
  students: Student[],
  transactions: PointTransaction[],
  sportsEvents: SportsActivityEvent[]
): HouseTotalSummary[] {
  // 1. Calculate student points per house
  const houseMap: Record<
    string,
    { studentMerits: number; studentDemerits: number; sportsPoints: number; studentCount: number }
  > = {};

  houses.forEach((h) => {
    houseMap[h.id] = {
      studentMerits: 0,
      studentDemerits: 0,
      sportsPoints: 0,
      studentCount: 0,
    };
  });

  students.forEach((s) => {
    if (houseMap[s.houseId]) {
      houseMap[s.houseId].studentCount += 1;
    }
  });

  transactions.forEach((tx) => {
    if (houseMap[tx.houseId]) {
      if (tx.type === 'merit') {
        houseMap[tx.houseId].studentMerits += tx.amount;
      } else {
        houseMap[tx.houseId].studentDemerits += tx.amount;
      }
    }
  });

  // 2. Add sports and extra activities points
  sportsEvents.forEach((event) => {
    if (event.scores && event.scores.length > 0) {
      event.scores.forEach((sc) => {
        if (houseMap[sc.houseId]) {
          houseMap[sc.houseId].sportsPoints += sc.points || 0;
        }
      });
    }
  });

  const totals: HouseTotalSummary[] = houses.map((house) => {
    const data = houseMap[house.id] || {
      studentMerits: 0,
      studentDemerits: 0,
      sportsPoints: 0,
      studentCount: 0,
    };
    const totalPoints = data.studentMerits - data.studentDemerits + data.sportsPoints;
    return {
      house,
      studentMerits: data.studentMerits,
      studentDemerits: data.studentDemerits,
      sportsAndActivityPoints: data.sportsPoints,
      totalPoints,
      rank: 0,
      studentCount: data.studentCount,
    };
  });

  // Sort by totalPoints descending
  totals.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks
  totals.forEach((item, index) => {
    item.rank = index + 1;
  });

  return totals;
}
