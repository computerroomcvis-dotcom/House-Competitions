import React, { useState, useMemo } from 'react';
import {
  House,
  TeacherUser,
  AdminUser,
  SportsActivityEvent,
  CurrentUser,
  Student,
  PointTransaction,
  TabSettings,
} from '../types';
import { HouseTotalSummary } from '../utils/storage';
import {
  Trophy,
  GraduationCap,
  Shield,
  Flame,
  Crown,
  Sparkles,
  Award,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Radio,
  Clock,
  Calendar,
  Users,
  CalendarCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from './AnimatedCounter';
import { EventScheduleMatchCenter } from './EventScheduleMatchCenter';

interface HomePageProps {
  houses: House[];
  teachers: TeacherUser[];
  adminUsers: AdminUser[];
  sportsEvents: SportsActivityEvent[];
  students: Student[];
  houseTotals: HouseTotalSummary[];
  currentUser: CurrentUser;
  totalSchoolPoints: number;
  leadingHouse?: House;
  leadingHousePoints?: number;
  transactions?: PointTransaction[];
  tabSettings?: TabSettings;
  onAwardGameScore?: (
    gameId: string,
    studentId: string,
    studentName: string,
    houseId: string,
    points: number,
    reason: string,
    gameTitle: string
  ) => void;
  onLoginTeacher: (teacher: TeacherUser) => void;
  onLoginAdmin: (adminUser?: AdminUser) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  houses,
  teachers,
  adminUsers,
  sportsEvents,
  students,
  houseTotals,
  currentUser,
  totalSchoolPoints,
  leadingHouse,
  leadingHousePoints = 0,
  transactions = [],
  tabSettings,
  onAwardGameScore,
  onLoginTeacher,
  onLoginAdmin,
}) => {
  // Modal states for small buttons at top
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Teacher Form State
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');
  const [teacherError, setTeacherError] = useState('');
  const [selectedQuickTeacherId, setSelectedQuickTeacherId] = useState<string>('');

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Active sports event
  const activeSports = sportsEvents.find((e) => e.isActive);

  // Tabs for Home Screen: House Podium (default), House Standings, House Competitions, House Competitions Events
  const [homeTab, setHomeTab] = useState<'podium' | 'sports' | 'standings' | 'sports-events'>('podium');

  // Key Student Participants & Athletes by House (for House Cards)
  const getHouseAthletes = useMemo(() => {
    return (houseId: string) => {
      const list: { name: string; grade: string; role: string; points: number }[] = [];
      const seen = new Set<string>();

      sportsEvents.forEach((game) => {
        (game.participatingStudentsWithRoles || []).forEach((p) => {
          const targetHouse = houses.find((h) => h.id === houseId);
          const match =
            targetHouse &&
            (p.house.toLowerCase().includes(targetHouse.name.toLowerCase().replace('house of ', '').trim()) ||
              targetHouse.name.toLowerCase().includes(p.house.toLowerCase()));
          if (match && !seen.has(p.student_name)) {
            seen.add(p.student_name);
            const fullStudent = students.find((s) =>
              s.name.toLowerCase().includes(p.student_name.toLowerCase().split(' ')[0])
            );
            list.push({
              name: p.student_name,
              grade: fullStudent?.grade || 'Primary',
              role: p.role || 'Competitor',
              points: p.role?.includes('Anchor') ? 25 : p.role?.includes('Fastest') ? 20 : 15,
            });
          }
        });
      });

      // Supplementary pre-seeded prominent student athletes if needed
      if (list.length === 0) {
        if (houseId === 'house-stormchasers') {
          list.push(
            { name: 'Poomrapee W.', grade: 'PK-4', role: 'Anchor Performance', points: 25 },
            { name: 'Pongnapat S.', grade: 'TP', role: 'Team Lead', points: 15 }
          );
        } else if (houseId === 'house-earthshakers') {
          list.push(
            { name: 'Thichanan L.', grade: 'PK-3', role: 'High Effort Lead', points: 15 },
            { name: 'Nirin Ruangburop', grade: 'Grade 1', role: 'Relay Runner', points: 20 }
          );
        } else if (houseId === 'house-mountainhearts') {
          list.push(
            { name: 'Linlada P.', grade: 'PK-4', role: 'Fastest Lap Anchor', points: 20 },
            { name: 'Seerat Agarwal', grade: 'Grade 1', role: 'Anchor Finish', points: 20 }
          );
        } else if (houseId === 'house-thunderhooves') {
          list.push(
            { name: 'Kannisa T.', grade: 'PK-3', role: 'Great Sportsmanship', points: 15 },
            { name: 'Napat S.', grade: 'Grade 1', role: 'Sprinter', points: 15 }
          );
        }
      }

      return list;
    };
  }, [sportsEvents, houses, students]);

  // Top toggle selector for Dual Podium: Option A: "annual" (default) vs Option B: "competitions"
  const [podiumMode, setPodiumMode] = useState<'annual' | 'competitions'>('annual');

  // Filtered completed match results recorded in the House Competitions tab
  const completedCompetitionMatches = useMemo(() => {
    return sportsEvents.filter((game) => {
      const hasCompletedNote = game.notes?.toLowerCase().includes('completed') || false;
      const isInactiveWithPoints =
        !game.isActive &&
        (game.scores?.some((s) => (s.points || 0) > 0 || (s.placement || 0) > 0) ?? false);
      const hasRecordedPlacements =
        (game.scores?.filter((s) => s.placement && s.placement > 0).length ?? 0) >= 1;
      return hasCompletedNote || isInactiveWithPoints || hasRecordedPlacements;
    });
  }, [sportsEvents]);

  // House standings derived strictly from completed match results in House Competitions
  const competitionHouseTotals = useMemo(() => {
    const houseStats: Record<
      string,
      {
        house: House;
        totalPoints: number;
        completedMatchesCount: number;
        firstPlaceCount: number;
        secondPlaceCount: number;
        thirdPlaceCount: number;
        fourthPlaceCount: number;
        topMatchesWon: string[];
      }
    > = {};

    houses.forEach((h) => {
      houseStats[h.id] = {
        house: h,
        totalPoints: 0,
        completedMatchesCount: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
        fourthPlaceCount: 0,
        topMatchesWon: [],
      };
    });

    completedCompetitionMatches.forEach((game) => {
      (game.scores || []).forEach((sc) => {
        if (houseStats[sc.houseId]) {
          const pts = sc.points || 0;
          houseStats[sc.houseId].totalPoints += pts;
          if (pts > 0 || (sc.placement && sc.placement > 0)) {
            houseStats[sc.houseId].completedMatchesCount += 1;
          }
          if (sc.placement === 1) {
            houseStats[sc.houseId].firstPlaceCount += 1;
            houseStats[sc.houseId].topMatchesWon.push(game.title);
          } else if (sc.placement === 2) {
            houseStats[sc.houseId].secondPlaceCount += 1;
          } else if (sc.placement === 3) {
            houseStats[sc.houseId].thirdPlaceCount += 1;
          } else if (sc.placement === 4) {
            houseStats[sc.houseId].fourthPlaceCount += 1;
          }
        }
      });
    });

    const list = Object.values(houseStats);
    list.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.firstPlaceCount - a.firstPlaceCount;
    });

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [houses, completedCompetitionMatches]);

  // Unified dynamic podium standings based on active toggle
  const activePodiumStandings = useMemo(() => {
    if (podiumMode === 'annual') {
      return houseTotals.map((item) => ({
        house: item.house,
        totalPoints: item.totalPoints,
        rank: item.rank,
        primaryMetric: `+${item.studentMerits} merits`,
        secondaryMetric: `+${item.studentMerits} / -${item.studentDemerits}`,
        detailBadge: 'Annual Points',
        mascot: item.house.mascot,
        motto: item.house.motto,
      }));
    }

    // Option B: House Competitions Cup
    return competitionHouseTotals.map((item) => ({
      house: item.house,
      totalPoints: item.totalPoints,
      rank: item.rank,
      primaryMetric:
        item.firstPlaceCount > 0
          ? `${item.firstPlaceCount} Gold Win${item.firstPlaceCount > 1 ? 's' : ''}`
          : `${item.completedMatchesCount} Match${item.completedMatchesCount !== 1 ? 'es' : ''}`,
      secondaryMetric: `${item.completedMatchesCount} match results recorded`,
      detailBadge: 'Competitions Cup',
      mascot: item.house.mascot,
      motto: item.house.motto,
    }));
  }, [podiumMode, houseTotals, competitionHouseTotals]);

  // Dynamically re-ranked 1st, 2nd, 3rd, and 4th place standings
  const leader = activePodiumStandings[0];
  const second = activePodiumStandings[1];
  const third = activePodiumStandings[2];
  const fourth = activePodiumStandings[3];

  // Student net points map from point transactions
  const studentPointsMap = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      map[tx.studentId] =
        (map[tx.studentId] || 0) + (tx.type === 'merit' ? tx.amount : -tx.amount);
    });
    return map;
  }, [transactions]);

  // Preschool Division Achievers (TP, PK-3, PK-4, GK)
  const preschoolAchievers = useMemo(() => {
    const gradeDefs = [
      {
        code: 'TP',
        title: 'Transition Primary',
        matcher: (g: string) =>
          g.toUpperCase().includes('TP') || g.toLowerCase().includes('transition'),
        fallbackName: 'Pongnapat Supakiatbanchorn',
        fallbackHouseId: 'house-stormchasers',
        fallbackPoints: 15,
        fallbackMotto: 'Enthusiastic house participation & courteous collaboration',
        fallbackBadge: '',
      },
      {
        code: 'PK-3',
        title: 'Pre-Kindergarten 3',
        matcher: (g: string) =>
          g.toUpperCase().includes('PK-3') || g.toUpperCase().includes('PK 3'),
        fallbackName: 'Thichanan Luengthong',
        fallbackHouseId: 'house-earthshakers',
        fallbackPoints: 20,
        fallbackMotto: 'Patience in problem-solving & gracious kindness to classmates',
        fallbackBadge: 'House Star',
      },
      {
        code: 'PK-4',
        title: 'Pre-Kindergarten 4',
        matcher: (g: string) =>
          g.toUpperCase().includes('PK-4') || g.toUpperCase().includes('PK 4'),
        fallbackName: 'Poomrapee Worakanjanakul',
        fallbackHouseId: 'house-stormchasers',
        fallbackPoints: 25,
        fallbackMotto:
          'Exceptional academic initiative, active listening & peer mentorship',
        fallbackBadge: 'Prefect',
        isOverallScholar: true,
      },
      {
        code: 'GK',
        title: 'Kindergarten',
        matcher: (g: string) =>
          g.toUpperCase().includes('GK') || g.toLowerCase().includes('kindergarten'),
        fallbackName: 'Piyaphat Jaijaroen',
        fallbackHouseId: 'house-stormchasers',
        fallbackPoints: 20,
        fallbackMotto: 'Curiosity in discovery & spirited devotion to house teamwork',
        fallbackBadge: 'House Star',
      },
    ];

    return gradeDefs.map((def) => {
      const matching = students.filter((s) => def.matcher(s.grade));
      let bestStudent: Student | undefined = undefined;
      let bestPoints = def.fallbackPoints;

      for (const st of matching) {
        const pts = studentPointsMap[st.id] || 0;
        if (!bestStudent || pts > bestPoints || (pts === bestPoints && st.isPrefect)) {
          bestStudent = st;
          bestPoints = Math.max(pts, def.fallbackPoints);
        }
      }

      const chosenStudentName = bestStudent ? bestStudent.name : def.fallbackName;
      const chosenHouseId = bestStudent ? bestStudent.houseId : def.fallbackHouseId;
      const houseObj = houses.find((h) => h.id === chosenHouseId);

      return {
        gradeCode: def.code,
        gradeTitle: def.title,
        studentName: chosenStudentName,
        houseName: houseObj?.name || 'House of Stormchasers',
        houseId: chosenHouseId,
        houseColor: houseObj?.color || '#2E90FA',
        points: bestPoints,
        badge: bestStudent?.isPrefect ? 'Prefect' : def.fallbackBadge,
        mottoNote: def.fallbackMotto,
        isOverallScholar: def.isOverallScholar,
        house: houseObj,
      };
    });
  }, [students, houses, studentPointsMap]);

  // Elementary Division Achievers (Grade 1, Grade 2, Grade 3, Grade 4, Grade 5)
  const elementaryAchievers = useMemo(() => {
    const gradeDefs = [
      {
        code: 'G1',
        title: 'Grade 1',
        matcher: (g: string) =>
          g.toLowerCase().includes('grade 1') || g.toUpperCase() === 'G1',
        fallbackName: 'Nirin Ruangburop',
        fallbackHouseId: 'house-earthshakers',
        fallbackPoints: 20,
        fallbackMotto:
          'Exemplary sportsmanship, focus in reading & active classroom teamwork',
        fallbackBadge: 'Relay Star',
      },
      {
        code: 'G2',
        title: 'Grade 2',
        matcher: (g: string) =>
          g.toLowerCase().includes('grade 2') || g.toUpperCase() === 'G2',
        fallbackName: 'Supassara Angsuthornwilai',
        fallbackHouseId: 'house-stormchasers',
        fallbackPoints: 25,
        fallbackMotto:
          'Reliable student leadership, respectful demeanor & creative arts diligence',
        fallbackBadge: 'Prefect',
      },
      {
        code: 'G3',
        title: 'Grade 3',
        matcher: (g: string) =>
          g.toLowerCase().includes('grade 3') || g.toUpperCase() === 'G3',
        fallbackName: 'Theethat Sannamwong',
        fallbackHouseId: 'house-stormchasers',
        fallbackPoints: 20,
        fallbackMotto:
          'Inquisitive science inquiry, mathematical rigor & peer encouragement',
        fallbackBadge: 'Inquiry Scholar',
      },
      {
        code: 'G4',
        title: 'Grade 4',
        matcher: (g: string) =>
          g.toLowerCase().includes('grade 4') || g.toUpperCase() === 'G4',
        fallbackName: 'Pavika Vijitcharoenkul',
        fallbackHouseId: 'house-thunderhooves',
        fallbackPoints: 25,
        fallbackMotto:
          'Exemplary prefect duties, dependable assembly organization & house spirit',
        fallbackBadge: 'Prefect',
      },
      {
        code: 'G5',
        title: 'Grade 5',
        matcher: (g: string) =>
          g.toLowerCase().includes('grade 5') || g.toUpperCase() === 'G5',
        fallbackName: 'Thanadej Onsawai',
        fallbackHouseId: 'house-earthshakers',
        fallbackPoints: 25,
        fallbackMotto:
          'Outstanding leadership in inter-house competitions & academic focus',
        fallbackBadge: 'Prefect',
      },
    ];

    return gradeDefs.map((def) => {
      const matching = students.filter((s) => def.matcher(s.grade));
      let bestStudent: Student | undefined = undefined;
      let bestPoints = def.fallbackPoints;

      for (const st of matching) {
        const pts = studentPointsMap[st.id] || 0;
        if (!bestStudent || pts > bestPoints || (pts === bestPoints && st.isPrefect)) {
          bestStudent = st;
          bestPoints = Math.max(pts, def.fallbackPoints);
        }
      }

      const chosenStudentName = bestStudent ? bestStudent.name : def.fallbackName;
      const chosenHouseId = bestStudent ? bestStudent.houseId : def.fallbackHouseId;
      const houseObj = houses.find((h) => h.id === chosenHouseId);

      return {
        gradeCode: def.code,
        gradeTitle: def.title,
        studentName: chosenStudentName,
        houseName: houseObj?.name || 'House of Stormchasers',
        houseId: chosenHouseId,
        houseColor: houseObj?.color || '#2E90FA',
        points: bestPoints,
        badge: bestStudent?.isPrefect ? 'Prefect' : def.fallbackBadge,
        mottoNote: def.fallbackMotto,
        house: houseObj,
      };
    });
  }, [students, houses, studentPointsMap]);

  // Confetti celebrations
  const triggerConfetti = (colors?: string[]) => {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.55 },
      colors: colors || ['#2563EB', '#DC2626', '#D97706', '#059669', '#F59E0B', '#7E22CE'],
    });
  };

  // Handle Teacher Login Submit
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    const searchKey = teacherUsername.trim().toLowerCase();
    if (!searchKey) {
      setTeacherError('Please enter your full name as username.');
      return;
    }

    const matched = teachers.find(
      (t) =>
        (t.username?.trim().toLowerCase() === searchKey ||
          t.name.trim().toLowerCase() === searchKey ||
          (t.email && t.email.trim().toLowerCase() === searchKey)) &&
        t.password === teacherPassword
    );

    if (matched) {
      triggerConfetti();
      setShowTeacherModal(false);
      onLoginTeacher(matched);
    } else {
      setTeacherError(
        'Invalid teacher credentials. Use your Full Name (e.g., "Sarah Jenkins") and password "teacher123", or click a name below.'
      );
    }
  };

  // Quick Teacher 1-Click Select
  const handleQuickTeacherSelect = (teacher: TeacherUser) => {
    setTeacherUsername(teacher.name);
    setTeacherPassword(teacher.password || 'teacher123');
    setSelectedQuickTeacherId(teacher.id);
    triggerConfetti();
    setShowTeacherModal(false);
    onLoginTeacher(teacher);
  };

  // Handle Admin Login Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const searchKey = adminUsername.trim().toLowerCase();
    if (!searchKey) {
      setAdminError('Please enter your administrator username.');
      return;
    }

    const matchedAdmin = adminUsers.find(
      (a) =>
        (a.username?.trim().toLowerCase() === searchKey ||
          a.name.trim().toLowerCase() === searchKey) &&
        a.password === adminPassword
    );

    if (matchedAdmin) {
      triggerConfetti();
      setShowAdminModal(false);
      onLoginAdmin(matchedAdmin);
      return;
    }

    if (
      (searchKey === 'admin' || searchKey === 'administrator') &&
      adminPassword === 'admin'
    ) {
      triggerConfetti();
      setShowAdminModal(false);
      onLoginAdmin(adminUsers[0]);
      return;
    }

    setAdminError(
      'Invalid administrator credentials. Try username "admin" with password "admin" or select an administrator below.'
    );
  };

  // Quick Admin 1-Click Select
  const handleQuickAdminSelect = (admin: AdminUser) => {
    setAdminUsername(admin.name);
    setAdminPassword(admin.password || 'admin');
    triggerConfetti();
    setShowAdminModal(false);
    onLoginAdmin(admin);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER BAR WITH SMALL LOGIN BUTTONS */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* School Crest & Portal Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-amber-400 uppercase">
                Crestview International School
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Standings
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white font-['Outfit'] tracking-tight truncate">
              Society of Houses Cup Portal
            </h1>
          </div>
        </div>

        {/* Small Top Action Buttons (Teacher Login & Admin Login) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Celebrate Button */}
          <button
            type="button"
            onClick={() => triggerConfetti()}
            title="Celebrate House Cup"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Celebrate</span>
          </button>

          {/* Small Teacher Login Button */}
          <button
            type="button"
            id="portal-teacher-login-btn"
            onClick={() => {
              setTeacherError('');
              setShowTeacherModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Teacher Login</span>
          </button>

          {/* Small Admin Login Button */}
          <button
            type="button"
            id="portal-admin-login-btn"
            onClick={() => {
              setAdminError('');
              setShowAdminModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY: SPLIT INTO CLEAN TABS (Podium, House Standings, House Competitions) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* TABS BAR: House Podium (default), House Standings, House Competitions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: House Podium (Default on open!) */}
            <button
              type="button"
              id="home-tab-podium"
              onClick={() => setHomeTab('podium')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                homeTab === 'podium'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>House Podium</span>
            </button>

            {/* Tab 2: House Standings */}
            <button
              type="button"
              id="home-tab-standings"
              onClick={() => setHomeTab('standings')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                homeTab === 'standings'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span>House Standings</span>
            </button>

            {/* Tab 3: House Competitions Results */}
            <button
              type="button"
              id="home-tab-sports"
              onClick={() => setHomeTab('sports')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                homeTab === 'sports'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span>House Results</span>
              {tabSettings && !tabSettings.results_enabled ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/40">
                  Offline
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </button>

            {/* Tab 4: House Competitions Events */}
            <button
              type="button"
              id="home-tab-sports-events"
              onClick={() => setHomeTab('sports-events')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                homeTab === 'sports-events'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>House Events</span>
              {tabSettings && !tabSettings.events_enabled ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/40">
                  Offline
                </span>
              ) : (
                <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {sportsEvents.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-semibold">
              <span className="hidden lg:inline">Crestview School</span>
              <span className="hidden lg:inline">&bull;</span>
              <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                {totalSchoolPoints} Total Points
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: HOUSE PODIUM (Default on open!) */}
        {homeTab === 'podium' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 1. UNIFIED HIGH-IMPACT HERO PODIUM HEADER WITH DUAL LEADERBOARD TOGGLE */}
            <div
              id="hero-podium-header"
              className="relative bg-gradient-to-b from-[#131738] via-[#161B22] to-[#0D1117] rounded-3xl p-5 sm:p-8 text-white shadow-2xl border border-slate-800 overflow-hidden"
            >
              {/* Ambient glows */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Toggle Switch / Tab Selector: Option A (House Points 2026–2027) vs Option B (House Competitions Cup) */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Dual Leaderboard Selector
                  </span>
                </div>

                <div className="inline-flex p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner gap-1 self-start sm:self-auto">
                  {/* Option A: House Points 2026–2027 */}
                  <button
                    type="button"
                    id="toggle-podium-annual"
                    onClick={() => {
                      setPodiumMode('annual');
                      const annLeader = houseTotals[0];
                      if (annLeader) triggerConfetti([annLeader.house.color, '#F59E0B']);
                    }}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      podiumMode === 'annual'
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 font-black scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${podiumMode === 'annual' ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>House Points 2026–2027</span>
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        podiumMode === 'annual'
                          ? 'bg-slate-950/20 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Default
                    </span>
                  </button>

                  {/* Option B: House Competitions Cup */}
                  <button
                    type="button"
                    id="toggle-podium-competitions"
                    onClick={() => {
                      setPodiumMode('competitions');
                      const compLeader = competitionHouseTotals[0];
                      if (compLeader) triggerConfetti([compLeader.house.color, '#F59E0B']);
                    }}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      podiumMode === 'competitions'
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25 font-black scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${podiumMode === 'competitions' ? 'text-white animate-pulse' : 'text-rose-400'}`} />
                    <span>House Competitions Cup</span>
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        podiumMode === 'competitions'
                          ? 'bg-black/25 text-white font-black'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Matches Only
                    </span>
                  </button>
                </div>
              </div>

              {/* Combined Hero Bar: Championship Spotlight & Celebrate Action */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div className="max-w-2xl">
                  {/* Pills */}
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {podiumMode === 'annual'
                          ? 'CURRENT TERM LEADER • 2026–2027 HOUSE CUP'
                          : 'TOURNAMENT LEADER • HOUSE COMPETITIONS CUP'}
                      </span>
                    </span>
                    {leader && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        1st: {leader.house.name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit'] tracking-tight text-white mb-1.5">
                    {podiumMode === 'annual'
                      ? 'House Cup & Stepped Podium Standings'
                      : 'House Competitions Cup Standings'}
                  </h2>

                  {/* Leader details subtitle */}
                  {leader && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Holding 1st place with{' '}
                      <strong className="text-amber-400 font-extrabold">
                        {leader.totalPoints} points
                      </strong>{' '}
                      ({leader.primaryMetric}) &bull; Mascot:{' '}
                      <span className="text-white font-semibold">{leader.mascot}</span> &bull; Motto:{' '}
                      <span className="italic text-slate-200">&ldquo;{leader.motto}&rdquo;</span>.
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {podiumMode === 'annual'
                      ? 'Aggregates all points accumulated this school year across merits, academic awards, daily house points, and sports events.'
                      : 'Standings strictly derived from completed match results recorded in the House Competitions tab.'}
                  </p>
                </div>

                {/* Right: Celebrate Leader Action Button */}
                {leader && (
                  <div className="relative z-10 flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        triggerConfetti([leader.house.color, '#F59E0B', '#3B82F6', '#10B981'])
                      }
                      className="btn-hover-scale px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 text-xs sm:text-sm border border-amber-300 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Celebrate {leader.house.name.replace('House of ', '')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VISUAL STEPPED PODIUM (2nd, 1st Champion, 3rd, 4th) */}
              {/* Dynamically re-ranks 1st, 2nd, 3rd, and 4th place podium standings and total points */}
              <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-end justify-center gap-3 sm:gap-6 pt-10 sm:pt-14 pb-4 max-w-4xl mx-auto">
                {/* 2nd Place (Silver) */}
                {second && (
                  <div
                    onClick={() => triggerConfetti([second.house.color, '#94A3B8'])}
                    className="flex-1 min-w-[125px] sm:min-w-[170px] max-w-[210px] flex flex-col items-center cursor-pointer order-2 sm:order-1 group transition-transform hover:-translate-y-1"
                  >
                    <div className="relative mb-2">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-600 text-slate-300 flex items-center justify-center font-black text-sm sm:text-xl shadow-md group-hover:scale-105 transition-transform">
                        🥈
                      </div>
                      {second.house.logoUrl && (
                        <img
                          src={second.house.logoUrl}
                          alt={second.house.name}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover absolute -bottom-1.5 -right-1.5 border-2 border-slate-800 bg-white shadow-sm"
                        />
                      )}
                    </div>
                    {/* Full house name without truncation */}
                    <h4 className="font-extrabold text-white text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                      {second.house.name}
                    </h4>
                    <div className="text-xs sm:text-sm font-black text-slate-200 mb-2">
                      <AnimatedCounter value={second.totalPoints} suffix=" pts" />
                    </div>

                    {/* Step Bar */}
                    <div
                      className="w-full h-32 sm:h-40 rounded-t-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-white shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: second.house.color }}
                    >
                      <span className="font-black text-xl sm:text-2xl tracking-tight opacity-95 font-['Outfit']">
                        2ND
                      </span>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-semibold text-white/95">
                          {second.primaryMetric}
                        </p>
                        <p className="text-[10px] text-white/85 font-medium hidden sm:block">
                          {second.mascot}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {leader && (
                  <div
                    onClick={() => triggerConfetti([leader.house.color, '#F59E0B'])}
                    className="flex-1 min-w-[140px] sm:min-w-[190px] max-w-[240px] flex flex-col items-center cursor-pointer order-1 sm:order-2 group -mt-4 sm:-mt-8 transition-transform hover:-translate-y-1"
                  >
                    <div className="relative mb-2">
                      <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400 absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-2 sm:border-4 border-amber-200 text-amber-950 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                        <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-950" />
                      </div>
                      {leader.house.logoUrl && (
                        <img
                          src={leader.house.logoUrl}
                          alt={leader.house.name}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover absolute -bottom-2 -right-2 border-2 border-amber-400 bg-white shadow-md"
                        />
                      )}
                    </div>
                    {/* Full house name without truncation */}
                    <h4 className="font-black text-amber-300 text-sm sm:text-base text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                      {leader.house.name}
                    </h4>
                    <div className="text-sm sm:text-base font-black text-amber-400 mb-2">
                      <AnimatedCounter value={leader.totalPoints} suffix=" pts" />
                    </div>

                    {/* Champion Step Bar */}
                    <div
                      className="w-full h-44 sm:h-56 rounded-t-2xl p-3 sm:p-5 flex flex-col items-center justify-between text-white shadow-2xl relative overflow-hidden"
                      style={{ backgroundColor: leader.house.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 pointer-events-none" />
                      <span className="font-black text-2xl sm:text-4xl tracking-tight font-['Outfit']">
                        1ST
                      </span>
                      <div className="text-center z-10">
                        <p className="text-xs sm:text-sm font-extrabold text-white">
                          Champions
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/95">
                          {leader.primaryMetric}
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/85 hidden sm:block font-semibold">
                          {leader.mascot}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {third && (
                  <div
                    onClick={() => triggerConfetti([third.house.color, '#D97706'])}
                    className="flex-1 min-w-[125px] sm:min-w-[170px] max-w-[210px] flex flex-col items-center cursor-pointer order-3 sm:order-3 group transition-transform hover:-translate-y-1"
                  >
                    <div className="relative mb-2">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/60 border-2 border-amber-800 text-amber-400 flex items-center justify-center font-black text-sm sm:text-xl shadow-md group-hover:scale-105 transition-transform">
                        🥉
                      </div>
                      {third.house.logoUrl && (
                        <img
                          src={third.house.logoUrl}
                          alt={third.house.name}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover absolute -bottom-1.5 -right-1.5 border-2 border-amber-950 bg-white shadow-sm"
                        />
                      )}
                    </div>
                    {/* Full house name without truncation */}
                    <h4 className="font-extrabold text-white text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                      {third.house.name}
                    </h4>
                    <div className="text-xs sm:text-sm font-black text-slate-200 mb-2">
                      <AnimatedCounter value={third.totalPoints} suffix=" pts" />
                    </div>

                    {/* Step Bar */}
                    <div
                      className="w-full h-26 sm:h-32 rounded-t-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-white shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: third.house.color }}
                    >
                      <span className="font-black text-xl sm:text-2xl tracking-tight opacity-95 font-['Outfit']">
                        3RD
                      </span>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-semibold text-white/95">
                          {third.primaryMetric}
                        </p>
                        <p className="text-[10px] text-white/85 font-medium hidden sm:block">
                          {third.mascot}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4th Place */}
                {fourth && (
                  <div
                    onClick={() => triggerConfetti([fourth.house.color, '#64748B'])}
                    className="flex-1 min-w-[115px] sm:min-w-[150px] max-w-[180px] flex flex-col items-center cursor-pointer order-4 sm:order-4 group transition-transform hover:-translate-y-1"
                  >
                    <div className="relative mb-2">
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm group-hover:scale-105 transition-transform">
                        4th
                      </div>
                      {fourth.house.logoUrl && (
                        <img
                          src={fourth.house.logoUrl}
                          alt={fourth.house.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover absolute -bottom-1.5 -right-1.5 border-2 border-slate-800 bg-white shadow-sm"
                        />
                      )}
                    </div>
                    {/* Full house name without truncation */}
                    <h4 className="font-bold text-slate-300 text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                      {fourth.house.name}
                    </h4>
                    <div className="text-xs sm:text-sm font-black text-slate-300 mb-2">
                      <AnimatedCounter value={fourth.totalPoints} suffix=" pts" />
                    </div>

                    {/* Step Bar */}
                    <div
                      className="w-full h-20 sm:h-24 rounded-t-2xl p-2 sm:p-3 flex flex-col items-center justify-between text-white shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: fourth.house.color }}
                    >
                      <span className="font-black text-base sm:text-xl tracking-tight opacity-90 font-['Outfit']">
                        4TH
                      </span>
                      <div className="text-center">
                        <p className="text-[9px] sm:text-[10px] text-white/90">
                          {fourth.primaryMetric}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. SPLIT MONTHLY STAR ACHIEVERS (PRESCHOOL VS ELEMENTARY) */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
                      Monthly Star Achievers by Grade Level
                    </h3>
                    <p className="text-xs text-slate-400">
                      Preschool &amp; Elementary Divisions &bull; Official Faculty Commendation Bulletin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Academic Year 2026–2027 Bulletin</span>
                  </span>
                </div>
              </div>

              {/* Overall Star Scholar Spotlight Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 rounded-2xl p-4 sm:p-5 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
                    <Crown className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                      ⭐ Overall Star Scholar of the Month
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                      Poomrapee Worakanjanakul{' '}
                      <span className="text-xs font-bold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded-full ml-1.5">
                        Prefect
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      House of Stormchasers &bull; Grade PK-4 &bull; Recognized for top house point contribution (25 points).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerConfetti(['#2E90FA', '#F59E0B', '#10B981'])}
                  className="btn-hover-scale shrink-0 self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Commend Scholar</span>
                </button>
              </div>

              {/* DIVISION BLOCK 1: PRESCHOOL DIVISION (TP, PK-3, PK-4, GK) */}
              <div className="space-y-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-black">
                      🧸
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        Preschool Division Block
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Top student achievers for Transition Primary (TP), Pre-Kindergarten 3 (PK-3), Pre-Kindergarten 4 (PK-4), and Kindergarten (GK)
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    4 Grade Levels
                  </span>
                </div>

                {/* 4 Grade Level Cards (TP, PK-3, PK-4, GK) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {preschoolAchievers.map((achiever) => {
                    const houseColor = achiever.houseColor || '#2E90FA';
                    return (
                      <div
                        key={achiever.gradeCode}
                        onClick={() => triggerConfetti([houseColor, '#F59E0B'])}
                        className="card-hover-lift bg-[#161B22] rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all shadow-md hover:border-slate-700 cursor-pointer group"
                      >
                        {/* House Accent Top Line */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1.5"
                          style={{ backgroundColor: houseColor }}
                        />

                        <div>
                          {/* Header: Grade pill & Star/Prefect Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide text-white shadow-xs"
                              style={{ backgroundColor: houseColor }}
                            >
                              {achiever.gradeCode}
                            </span>
                            {achiever.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                {achiever.badge}
                              </span>
                            )}
                          </div>

                          {/* Student Name */}
                          <h5 className="text-sm sm:text-base font-black text-white font-['Outfit'] leading-snug group-hover:text-amber-300 transition-colors">
                            {achiever.studentName}
                          </h5>

                          {/* Grade Title */}
                          <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                            {achiever.gradeTitle}
                          </span>

                          {/* House Badge and Color / Logo */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-2">
                            {(() => {
                              const mHouse = achiever.house || houses.find((h) => h.id === achiever.houseId || h.name.toLowerCase().includes(achiever.houseName.toLowerCase()));
                              return mHouse?.logoUrl ? (
                                <img
                                  src={mHouse.logoUrl}
                                  alt={achiever.houseName}
                                  className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/30 bg-white"
                                />
                              ) : (
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: houseColor }}
                                />
                              );
                            })()}
                            <span className="truncate">{achiever.houseName}</span>
                          </div>

                          {/* Faculty Commendation Notes */}
                          <p className="text-[11px] text-slate-400 italic mt-2.5 line-clamp-2 leading-relaxed">
                            &ldquo;{achiever.mottoNote}&rdquo;
                          </p>
                        </div>

                        {/* Bottom: Earned Points Pill */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">
                            Earned Points:
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: houseColor }}
                          >
                            <AnimatedCounter value={achiever.points} suffix=" pts" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DIVISION BLOCK 2: ELEMENTARY DIVISION (Grade 1, Grade 2, Grade 3, Grade 4, Grade 5) */}
              <div className="space-y-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black">
                      🎒
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        Elementary Division Block
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Top student achievers for Grade 1 (G1), Grade 2 (G2), Grade 3 (G3), Grade 4 (G4), and Grade 5 (G5)
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    5 Grade Levels
                  </span>
                </div>

                {/* 5 Grade Level Cards (G1, G2, G3, G4, G5) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {elementaryAchievers.map((achiever) => {
                    const houseColor = achiever.houseColor || '#2E90FA';
                    return (
                      <div
                        key={achiever.gradeCode}
                        onClick={() => triggerConfetti([houseColor, '#F59E0B'])}
                        className="card-hover-lift bg-[#161B22] rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all shadow-md hover:border-slate-700 cursor-pointer group"
                      >
                        {/* House Accent Top Line */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1.5"
                          style={{ backgroundColor: houseColor }}
                        />

                        <div>
                          {/* Header: Grade pill & Star/Prefect Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide text-white shadow-xs"
                              style={{ backgroundColor: houseColor }}
                            >
                              {achiever.gradeCode}
                            </span>
                            {achiever.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                {achiever.badge}
                              </span>
                            )}
                          </div>

                          {/* Student Name */}
                          <h5 className="text-sm sm:text-base font-black text-white font-['Outfit'] leading-snug group-hover:text-amber-300 transition-colors">
                            {achiever.studentName}
                          </h5>

                          {/* Grade Title */}
                          <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                            {achiever.gradeTitle}
                          </span>

                          {/* House Badge and Color / Logo */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-2">
                            {(() => {
                              const mHouse = achiever.house || houses.find((h) => h.id === achiever.houseId || h.name.toLowerCase().includes(achiever.houseName.toLowerCase()));
                              return mHouse?.logoUrl ? (
                                <img
                                  src={mHouse.logoUrl}
                                  alt={achiever.houseName}
                                  className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/30 bg-white"
                                />
                              ) : (
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: houseColor }}
                                />
                              );
                            })()}
                            <span className="truncate">{achiever.houseName}</span>
                          </div>

                          {/* Faculty Commendation Notes */}
                          <p className="text-[11px] text-slate-400 italic mt-2.5 line-clamp-2 leading-relaxed">
                            &ldquo;{achiever.mottoNote}&rdquo;
                          </p>
                        </div>

                        {/* Bottom: Earned Points Pill */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">
                            Earned Points:
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: houseColor }}
                          >
                            <AnimatedCounter value={achiever.points} suffix=" pts" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

    {/* TAB 2: THE 4 HOUSES STANDINGS CARDS */}
    {homeTab === 'standings' && (
      <div className="space-y-4 pt-2 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
                The 4 Houses Standings
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Official Handbook Colors &bull; Live Real-Time Points
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houseTotals.map((item) => {
              const { house, totalPoints, rank, studentMerits, studentDemerits } = item;
              const percentOfAll =
                totalSchoolPoints > 0 ? Math.round((totalPoints / totalSchoolPoints) * 100) : 0;

              // Rank Badge styling
              const rankBadge =
                rank === 1 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-xs">
                    <Crown className="w-3 h-3 text-amber-950" />
                    1st Place
                  </span>
                ) : rank === 2 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-300 text-slate-900">
                    <Award className="w-3 h-3 text-slate-700" />
                    2nd Place
                  </span>
                ) : rank === 3 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-700 text-white">
                    <Award className="w-3 h-3 text-amber-200" />
                    3rd Place
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    <Award className="w-3 h-3 text-slate-500" />
                    4th Place
                  </span>
                );

              return (
                <div
                  key={house.id}
                  id={`portal-house-card-${house.id}`}
                  onClick={() => triggerConfetti([house.color, '#F59E0B'])}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-700 hover:shadow-lg relative overflow-hidden group cursor-pointer"
                >
                  {/* Color Accent Top Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: house.color }}
                  />

                  {/* Top: Rank Badge & Emblems */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {rankBadge}
                      <span
                        className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-black shadow-xs"
                        style={{ backgroundColor: house.color }}
                      >
                        #{rank}
                      </span>
                    </div>

                    {/* House Name & Mascot */}
                    <h4 className="text-lg font-black text-white font-['Outfit'] tracking-tight group-hover:text-amber-300 transition-colors">
                      {house.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      🐾 Mascot: <span className="text-slate-300 font-semibold">{house.mascot}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                      &quot;{house.motto}&quot;
                    </p>
                  </div>

                  {/* Middle: Big Points Display */}
                  <div className="my-4 py-3 border-y border-slate-800/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-white tracking-tight font-['Outfit']">
                        {totalPoints}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {percentOfAll}% of school
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentOfAll, 5)}%`,
                          backgroundColor: house.color,
                        }}
                      />
                    </div>

                    {/* Merits / Demerits Split */}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-2">
                      <span className="text-emerald-400">+{studentMerits} merits</span>
                      <span className="text-rose-400">-{studentDemerits} demerits</span>
                    </div>
                  </div>

                  {/* Bottom: Official Colors Swatches & Lore */}
                  {house.officialColors && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Handbook Colors
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {house.officialColors.map((cName, idx) => {
                          const hex = house.colorHexList?.[idx] || house.color;
                          return (
                            <div
                              key={cName}
                              className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-[10px] text-slate-300 font-medium">
                                {cName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Participating Students Underneath */}
                  <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" />
                      Participating Students &amp; Athletes:
                    </span>
                    <div className="space-y-1">
                      {getHouseAthletes(house.id).slice(0, 3).map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/70"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: house.color }}
                            />
                            <span className="font-bold text-white truncate">{st.name}</span>
                            <span className="text-[10px] text-slate-400">({st.grade})</span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                            {st.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HOUSE COMPETITIONS RESULTS */}
      {homeTab === 'sports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <EventScheduleMatchCenter
            sportsEvents={sportsEvents}
            houses={houses}
            students={students}
            currentUser={currentUser}
            transactions={transactions}
            tabSettings={tabSettings}
            hideLiveTicker={false}
            viewMode="overview"
            isReadOnly={true}
            onNavigateToEvents={() => setHomeTab('sports-events')}
          />
        </div>
      )}

      {/* TAB 4: HOUSE COMPETITIONS EVENTS */}
      {homeTab === 'sports-events' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <EventScheduleMatchCenter
            sportsEvents={sportsEvents}
            houses={houses}
            students={students}
            currentUser={currentUser}
            transactions={transactions}
            tabSettings={tabSettings}
            hideLiveTicker={false}
            viewMode="cards"
            isReadOnly={true}
          />
        </div>
      )}
      </main>

      {/* 3. MODAL: TEACHER LOGIN (Opened via small top button) */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowTeacherModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  Teacher Login
                </h3>
                <p className="text-xs text-slate-400">
                  Select your profile or enter your full name
                </p>
              </div>
            </div>

            {teacherError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{teacherError}</span>
              </div>
            )}

            {/* Quick 1-Click Teacher Selector */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1-Click Quick Select Teacher
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {teachers.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleQuickTeacherSelect(t)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 text-left transition-all text-xs"
                  >
                    <p className="font-bold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.houseId?.replace('house-', '') || 'Faculty'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleTeacherSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Full Name / Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="teacher123"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In as Teacher
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: ADMIN LOGIN (Opened via small top button) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  Administrator Login
                </h3>
                <p className="text-xs text-slate-400">
                  Access school settings, resets &amp; permissions
                </p>
              </div>
            </div>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Quick 1-Click Admin Selector */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1-Click Quick Select Admin
              </span>
              <div className="space-y-1.5">
                {adminUsers.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleQuickAdminSelect(a)}
                    className="w-full p-2.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/50 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.roleTitle || 'Administrator'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    placeholder="admin"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In as Administrator
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <p>
          Crestview International School House Points &amp; Tournament Portal &bull; AY 2026–2027 &bull; Transition Primary to Grade 5
        </p>
      </footer>
    </div>
  );
};
