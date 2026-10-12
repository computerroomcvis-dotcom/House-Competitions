export type GradeLevel =
  | 'TP'
  | 'PK-3'
  | 'PK-4'
  | 'GK-Emerald'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5';

export const ALL_GRADES: GradeLevel[] = [
  'TP',
  'PK-3',
  'PK-4',
  'GK-Emerald',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
];

export const GRADE_LABELS: Record<GradeLevel, string> = {
  TP: 'Transition Primary (TP)',
  'PK-3': 'Pre-Kindergarten 3 (PK-3)',
  'PK-4': 'Pre-Kindergarten 4 (PK-4)',
  'GK-Emerald': 'Kindergarten (GK-Emerald)',
  'Grade 1': 'Grade 1',
  'Grade 2': 'Grade 2',
  'Grade 3': 'Grade 3',
  'Grade 4': 'Grade 4',
  'Grade 5': 'Grade 5',
};

export interface House {
  id: string;
  name: string;
  color: string; // Primary hex color
  lightColor: string; // Light tint for badges/cards
  textColor: string; // Accessible text color
  borderColor: string;
  mascot: string; // e.g. 'Mighty Elephant', 'Agile Ibex', 'Majestic Eagle', 'Spirited Horse'
  motto: string;
  iconName: 'Flame' | 'Shield' | 'Award' | 'Zap' | 'Crown' | 'Feather' | 'Star' | 'Compass';
  logoUrl?: string; // Custom uploaded or configured house logo
  officialColors?: string[]; // e.g. ['Green', 'Brown', 'Gray']
  colorHexList?: string[]; // Hex codes for the official colors
  colorDescription?: string; // Meaning of the colors from official handbook
  animalDescription?: string; // Official animal philosophy and lore
  flagDescription?: string;
  themeVirtues?: string[]; // Core virtues (e.g. ['Wisdom', 'Patience', 'Grace'])
}

export interface TabSettings {
  events_enabled: boolean;
  events_disabled_message: string;
  results_enabled: boolean;
  results_disabled_message: string;
}

export const DEFAULT_TAB_SETTINGS: TabSettings = {
  events_enabled: true,
  events_disabled_message:
    'The House Competitions Events tab is currently closed. Please check back soon for upcoming matches!',
  results_enabled: true,
  results_disabled_message:
    'The House Competition Results tab is currently closed. Please check back soon for tournament results and scores!',
};

export interface Student {
  id: string;
  name: string;
  grade: GradeLevel;
  houseId: string;
  avatarSeed?: string;
  isPrefect?: boolean;
}

export type PointType = 'merit' | 'demerit';

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName: string;
  grade: GradeLevel;
  houseId: string;
  type: PointType;
  amount: number; // positive number (e.g. 1, 2, 5)
  category: string;
  reason?: string;
  awardedBy: string; // Teacher name or 'Admin'
  awardedByEmail?: string;
  timestamp: string; // ISO string
  isClassAward?: boolean;
}

export interface TeacherUser {
  id: string;
  name: string;
  username: string; // Full name used for login
  email?: string;
  password: string; // Plaintext for school demo / changeable login
  houseId?: string; // Assigned house
  houseRole?: 'House Ambassador' | 'House Counselor' | 'Teacher';
  gradeAssigned?: GradeLevel | 'All';
  subject?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string; // Full name used for login
  email?: string;
  password: string;
  roleTitle: string; // e.g. "Co-Chair [Preschool]", "Co-Chair [Elementary]", "Leadership Panel Member"
  panelRole: 'Co-Chair' | 'Member' | 'Administrator';
  section?: 'Preschool' | 'Elementary' | 'Schoolwide';
  createdAt: string;
}

export interface SportsEventHouseScore {
  houseId: string;
  points: number;
  placement?: 1 | 2 | 3 | 4;
}

export interface SportsActivityScoring {
  firstPlace?: number;
  secondPlace?: number;
  thirdPlace?: number;
  fourthPlace?: number;
  bonusNotes?: string;
}

export interface ParticipatingStudentWithRole {
  student_name: string;
  house: string;
  role: string;
  studentId?: string;
}

export interface EventScheduleItem {
  id?: string;
  time: string;
  event_name: string;
  category: string;
  location: string;
  status: 'Completed' | 'Live Now' | 'Upcoming';
}

export interface LiveScoreTickerItem {
  id?: string;
  timestamp: string;
  game_title: string;
  student_name: string;
  house: string;
  points_added: number;
  reason: string;
}

export interface GameCardData {
  game_id: string;
  title: string;
  status: 'In Progress' | 'Scheduled' | 'Completed';
  participating_students: ParticipatingStudentWithRole[];
  current_scores: Record<string, number>;
}

export interface SportsActivityEvent {
  id: string;
  title: string;
  description: string;
  category:
    | 'Sports Week'
    | 'Swimming Gala'
    | 'Track & Field'
    | 'Spirit Week'
    | 'Quiz Bowl'
    | 'Academic Challenge'
    | 'Arts & Performance'
    | 'Adults & Parents'
    | 'Strength'
    | 'Athletics'
    | 'Academics'
    | 'General Activity'
    | string;
  date: string; // "When" - Date (e.g., '2026-02-23' or 'Monday, 23 February 2026')
  time?: string; // "When" - Time/Session (e.g., '9:50 – 10:50 AM')
  location?: string; // "Where" - Venue (e.g., 'Venue A5 (Canteen)', 'Venue D3-A (Oval)')
  venueCode?: string; // e.g. 'A5', 'D5', 'B6', 'D3-A', 'S1', 'S2', 'S3', 'S4'
  gameType?: 'STANDARD' | 'ROUND ROBIN' | 'FUN RUN/WALK' | 'SPECIAL GAMES';
  groupCategory?: string; // e.g. 'Group A & B', 'Group C', 'Female Adults', 'All Houses'
  targetPlayersCount?: number | string; // e.g. 7, 4, 2, '7 to 10', 'All'
  lessThanMinAllowed?: boolean;
  participatingStudentIds?: string[]; // IDs of participating students
  participatingStudentsWithRoles?: ParticipatingStudentWithRole[];
  scoringSystem?: string; // Summary string of points system
  scoringBreakdown?: SportsActivityScoring; // Structured breakdown
  rules?: string[]; // List of game rules & regulations
  imageUrl?: string; // Uploaded image data URL or sports photo
  isActive: boolean;
  scores: SportsEventHouseScore[];
  notes?: string;
}

export type UserRole = 'public' | 'teacher' | 'admin';

export interface CurrentUser {
  role: UserRole;
  teacher?: TeacherUser;
  adminUser?: AdminUser;
  isAdmin?: boolean;
}
