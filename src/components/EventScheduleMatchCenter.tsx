import React, { useState, useMemo } from 'react';
import {
  SportsActivityEvent,
  House,
  Student,
  CurrentUser,
  PointTransaction,
  EventScheduleItem,
  SportsEventHouseScore,
} from '../types';
import { DEFAULT_EVENT_SCHEDULE } from '../data/sportsScheduleData';
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Sparkles,
  Search,
  CheckCircle,
  Download,
  Check,
  ChevronRight,
  Radio,
  Zap,
  Star,
  Activity,
  Crown,
  Shield,
  Medal,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Info,
  Plus,
  Edit2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditSportsGameModal } from './EditSportsGameModal';

interface EventScheduleMatchCenterProps {
  sportsEvents: SportsActivityEvent[];
  houses: House[];
  students: Student[];
  currentUser: CurrentUser;
  transactions?: PointTransaction[];
  hideLiveTicker?: boolean;
  viewMode?: 'all' | 'overview' | 'cards';
  isReadOnly?: boolean;
  onNavigateToEvents?: () => void;
  onAwardGameScore?: (
    gameId: string,
    studentId: string,
    studentName: string,
    houseId: string,
    points: number,
    reason: string,
    gameTitle: string
  ) => void;
  onUpdateEventScores?: (
    eventId: string,
    houseScores: { houseId: string; points: number; placement?: 1 | 2 | 3 | 4 }[]
  ) => void;
  onToggleEventActive?: (eventId: string, isActive: boolean) => void;
  onUpdateSportsEvents?: (newEvents: SportsActivityEvent[]) => void;
  onOpenCreateEvent?: () => void;
  onOpenExportSports?: () => void;
}

export interface StudentAthleteStats {
  studentId: string;
  studentName: string;
  grade: string;
  houseId: string;
  houseName: string;
  houseColor: string;
  gamesPlayed: number;
  gamesWon: number;
  gameTitlesPlayed: string[];
  gameTitlesWon: string[];
}

export const EventScheduleMatchCenter: React.FC<EventScheduleMatchCenterProps> = ({
  sportsEvents,
  houses,
  students,
  currentUser,
  transactions = [],
  hideLiveTicker = false,
  viewMode = 'all',
  isReadOnly = false,
  onNavigateToEvents,
  onUpdateEventScores,
  onToggleEventActive,
  onUpdateSportsEvents,
  onOpenCreateEvent,
  onOpenExportSports,
}) => {
  const canAward = !isReadOnly && currentUser.role === 'admin';

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Game Card Modal State
  const [isAdminGameModalOpen, setIsAdminGameModalOpen] = useState(false);
  const [adminEditingGame, setAdminEditingGame] = useState<SportsActivityEvent | null>(null);

  const handleSaveAdminGame = (saved: SportsActivityEvent) => {
    if (onUpdateSportsEvents) {
      const exists = sportsEvents.some((e) => e.id === saved.id);
      const updated = exists
        ? sportsEvents.map((e) => (e.id === saved.id ? saved : e))
        : [saved, ...sportsEvents];
      onUpdateSportsEvents(updated);
    }
  };

  // Selected game for the house placement modal
  const [selectedGameForScoring, setSelectedGameForScoring] = useState<SportsActivityEvent | null>(
    null
  );

  // Athlete Leaderboard State (replacing live feed)
  const [athleteHouseFilter, setAthleteHouseFilter] = useState<string>('all');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');

  // Helper for high quality event card photo
  const getEventImage = (game: SportsActivityEvent): string => {
    if (game.imageUrl) return game.imageUrl;
    const cat = (game.category || '').toLowerCase();
    const title = (game.title || '').toLowerCase();

    if (title.includes('tug') || cat.includes('strength')) {
      return 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80';
    }
    if (title.includes('sprint') || title.includes('relay') || cat.includes('athletics') || cat.includes('track')) {
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80';
    }
    if (title.includes('swim') || cat.includes('swimming')) {
      return 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80';
    }
    if (title.includes('trivia') || title.includes('quiz') || cat.includes('academic')) {
      return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';
    }
    if (title.includes('ball') || title.includes('soccer') || title.includes('football')) {
      return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80';
    }
    return 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80';
  };

  // Helper for human-friendly day / date
  const formatEventDay = (dateStr: string): string => {
    if (!dateStr) return 'Schedule TBA';
    if (
      dateStr.includes('Monday') ||
      dateStr.includes('Tuesday') ||
      dateStr.includes('Wednesday') ||
      dateStr.includes('Thursday') ||
      dateStr.includes('Friday') ||
      dateStr.includes('Saturday') ||
      dateStr.includes('Sunday')
    ) {
      return dateStr;
    }
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  // Helper to get game participants for a house
  const getGameParticipantsByHouse = (game: SportsActivityEvent, house: House) => {
    // 1. From participatingStudentsWithRoles
    const withRoles = (game.participatingStudentsWithRoles || []).filter(
      (p) =>
        p.house.toLowerCase().includes(house.name.toLowerCase().replace('house of ', '').trim()) ||
        house.name.toLowerCase().includes(p.house.toLowerCase())
    );
    if (withRoles.length > 0) {
      return withRoles.map((p) => {
        const stObj = students.find(
          (s) =>
            s.id === p.studentId ||
            s.name.toLowerCase().includes(p.student_name.toLowerCase().split(' ')[0])
        );
        return {
          studentId: p.studentId || stObj?.id || `p-${p.student_name}`,
          student_name: p.student_name,
          grade: stObj?.grade || 'Primary',
          role: p.role || 'Competitor',
        };
      });
    }

    // 2. From participatingStudentIds
    const withIds = (game.participatingStudentIds || [])
      .map((sId) => students.find((s) => s.id === sId && s.houseId === house.id))
      .filter(Boolean);
    if (withIds.length > 0) {
      return withIds.map((s) => ({
        studentId: s!.id,
        student_name: s!.name,
        grade: s!.grade,
        role: 'Relay Runner',
      }));
    }

    // 3. Fallbacks per house for official game cards
    if (house.id === 'house-stormchasers') {
      return [
        {
          studentId: 'stu-sc-pk4-1',
          student_name: 'Poomrapee W.',
          grade: 'PK-4',
          role: 'Anchor Performance',
        },
      ];
    } else if (house.id === 'house-earthshakers') {
      return [
        {
          studentId: 'stu-es-pk3-2',
          student_name: 'Thichanan L.',
          grade: 'PK-3',
          role: 'High Effort Lead',
        },
      ];
    } else if (house.id === 'house-mountainhearts') {
      return [
        {
          studentId: 'stu-mh-pk4-3',
          student_name: 'Linlada P.',
          grade: 'PK-4',
          role: 'Fastest Lap Anchor',
        },
      ];
    } else if (house.id === 'house-thunderhooves') {
      return [
        {
          studentId: 'stu-th-pk3-3',
          student_name: 'Kannisa T.',
          grade: 'PK-3',
          role: 'Great Sportsmanship',
        },
      ];
    }

    const houseStudents = students.filter((s) => s.houseId === house.id);
    if (houseStudents.length > 0) {
      return [
        {
          studentId: houseStudents[0].id,
          student_name: houseStudents[0].name,
          grade: houseStudents[0].grade,
          role: 'Participant',
        },
      ];
    }

    return [];
  };

  // Group game participants by grade level for a house
  const getGameParticipantsGroupedByGrade = (game: SportsActivityEvent, house: House) => {
    const participants = getGameParticipantsByHouse(game, house);
    const groups: Record<string, { studentId?: string; student_name: string; role: string; grade: string }[]> = {};

    participants.forEach((p) => {
      const st = students.find((s) => s.id === p.studentId || s.name.toLowerCase() === p.student_name.toLowerCase());
      const grade = st?.grade || p.grade || 'Primary';
      if (!groups[grade]) groups[grade] = [];
      groups[grade].push({
        studentId: p.studentId,
        student_name: p.student_name,
        role: p.role || 'Competitor',
        grade,
      });
    });

    return groups;
  };

  // Filter games that are completed or scored for the official log
  const completedGames = useMemo(() => {
    return sportsEvents.filter((game) => {
      const hasCompletedNote = game.notes?.toLowerCase().includes('completed') || false;
      const hasPlacements = (game.scores?.filter((s) => s.placement && s.placement > 0).length ?? 0) >= 1;
      const isInactiveWithPoints = !game.isActive && (game.scores?.some((s) => s.points > 0) ?? false);
      return hasCompletedNote || hasPlacements || isInactiveWithPoints;
    });
  }, [sportsEvents]);

  // Mini-podium resolver for a game (1st, 2nd, 3rd, 4th Place Finishes)
  const getGamePodium = (game: SportsActivityEvent) => {
    const list: {
      place: 1 | 2 | 3 | 4;
      house: House;
      points: number;
      students: { student_name: string; role: string; grade?: string }[];
    }[] = [];

    ([1, 2, 3, 4] as const).forEach((place) => {
      const scoreObj = game.scores?.find((s) => s.placement === place);
      if (scoreObj) {
        const house = houses.find((h) => h.id === scoreObj.houseId);
        if (house) {
          const participants = getGameParticipantsByHouse(game, house);
          list.push({
            place,
            house,
            points: scoreObj.points,
            students: participants,
          });
        }
      }
    });

    return list;
  };

  // Compute athlete participation and win stats across all sports events
  const athleteStatsMap = useMemo(() => {
    const stats: Record<string, StudentAthleteStats> = {};

    sportsEvents.forEach((game) => {
      // Determine winning house for this game (1st place)
      let winningHouseId: string | null = null;
      if (game.scores && game.scores.length > 0) {
        const firstPlaceScore = game.scores.find((s) => s.placement === 1);
        if (firstPlaceScore) {
          winningHouseId = firstPlaceScore.houseId;
        } else {
          // Fallback: highest points > 0
          const sortedScores = [...game.scores]
            .filter((s) => s.points > 0)
            .sort((a, b) => b.points - a.points);
          if (sortedScores.length > 0) {
            winningHouseId = sortedScores[0].houseId;
          }
        }
      }

      houses.forEach((h) => {
        const houseParticipants = getGameParticipantsByHouse(game, h);
        const didHouseWin = winningHouseId === h.id;

        houseParticipants.forEach((p) => {
          const key = p.studentId || p.student_name;
          if (!stats[key]) {
            stats[key] = {
              studentId: p.studentId,
              studentName: p.student_name,
              grade: p.grade,
              houseId: h.id,
              houseName: h.name.replace('House of ', ''),
              houseColor: h.color,
              gamesPlayed: 0,
              gamesWon: 0,
              gameTitlesPlayed: [],
              gameTitlesWon: [],
            };
          }

          if (!stats[key].gameTitlesPlayed.includes(game.title)) {
            stats[key].gamesPlayed += 1;
            stats[key].gameTitlesPlayed.push(game.title);
          }

          if (didHouseWin && !stats[key].gameTitlesWon.includes(game.title)) {
            stats[key].gamesWon += 1;
            stats[key].gameTitlesWon.push(game.title);
          }
        });
      });
    });

    return stats;
  }, [sportsEvents, houses, students]);

  // Top athletes by games played (filtered by house & search)
  const filteredParticipants = useMemo(() => {
    return Object.values(athleteStatsMap)
      .filter((a) => athleteHouseFilter === 'all' || a.houseId === athleteHouseFilter)
      .filter((a) => {
        if (!athleteSearchQuery.trim()) return true;
        const q = athleteSearchQuery.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(q) ||
          a.grade.toLowerCase().includes(q) ||
          a.houseName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.gamesWon - a.gamesWon);
  }, [athleteStatsMap, athleteHouseFilter, athleteSearchQuery]);

  // Top athletes by games won (filtered by house & search)
  const filteredWinners = useMemo(() => {
    return Object.values(athleteStatsMap)
      .filter((a) => athleteHouseFilter === 'all' || a.houseId === athleteHouseFilter)
      .filter((a) => a.gamesWon > 0)
      .filter((a) => {
        if (!athleteSearchQuery.trim()) return true;
        const q = athleteSearchQuery.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(q) ||
          a.grade.toLowerCase().includes(q) ||
          a.houseName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.gamesWon - a.gamesWon || b.gamesPlayed - a.gamesPlayed);
  }, [athleteStatsMap, athleteHouseFilter, athleteSearchQuery]);

  // Summary Metrics
  const totalAppearances = useMemo(() => {
    return Object.values(athleteStatsMap).reduce((sum, a) => sum + a.gamesPlayed, 0);
  }, [athleteStatsMap]);

  const topActiveStudent = filteredParticipants[0];
  const topWinningStudent = filteredWinners[0];

  // Placement points helper
  const getPlacementPoints = (game: SportsActivityEvent, place: 1 | 2 | 3 | 4): number => {
    if (place === 1) return game.scoringBreakdown?.firstPlace || 50;
    if (place === 2) return game.scoringBreakdown?.secondPlace || 30;
    if (place === 3) return game.scoringBreakdown?.thirdPlace || 20;
    if (place === 4) return game.scoringBreakdown?.fourthPlace || 10;
    return 0;
  };

  // Set placement for a house in a game card (NO individual student awarding)
  const handleSetHousePlacement = (
    game: SportsActivityEvent,
    houseId: string,
    placement: 1 | 2 | 3 | 4 | null
  ) => {
    if (!onUpdateEventScores) return;

    const currentScores: SportsEventHouseScore[] = game.scores ? [...game.scores] : [];
    let newScores: SportsEventHouseScore[];

    if (placement === null) {
      newScores = currentScores.filter((s) => s.houseId !== houseId);
    } else {
      const points = getPlacementPoints(game, placement);

      // If another house currently had this placement, clear it
      const existingOther = currentScores.find(
        (s) => s.placement === placement && s.houseId !== houseId
      );

      const filtered = currentScores.filter(
        (s) => s.houseId !== houseId && s.houseId !== existingOther?.houseId
      );

      newScores = [
        ...filtered,
        { houseId, points, placement },
      ];

      if (placement === 1) {
        const houseObj = houses.find((h) => h.id === houseId);
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.6 },
          colors: [houseObj?.color || '#F59E0B', '#F59E0B', '#10B981'],
        });
      }
    }

    onUpdateEventScores(game.id, newScores);
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    return sportsEvents.filter((game) => {
      const isCompleted =
        game.notes?.toLowerCase().includes('completed') ||
        (!game.isActive && game.scores?.some((s) => s.points > 0));
      const isLive = game.isActive;
      const isUpcoming = !game.isActive && !isCompleted;

      if (statusFilter === 'live' && !isLive) return false;
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'upcoming' && !isUpcoming) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          game.title.toLowerCase().includes(q) ||
          game.category?.toLowerCase().includes(q) ||
          (game.location && game.location.toLowerCase().includes(q)) ||
          (game.description && game.description.toLowerCase().includes(q)) ||
          (game.rules && game.rules.some((r) => r.toLowerCase().includes(q))) ||
          (game.participatingStudentsWithRoles &&
            game.participatingStudentsWithRoles.some(
              (p) =>
                p.student_name.toLowerCase().includes(q) ||
                p.house.toLowerCase().includes(q) ||
                p.role.toLowerCase().includes(q)
            ))
        );
      }
      return true;
    });
  }, [sportsEvents, statusFilter, searchQuery]);

  return (
    <div id="event-schedule-match-center" className="space-y-6">
      {/* SECTIONS 1, 2, 3: TOURNAMENT OVERVIEW & ATHLETE LEADERBOARD (when viewMode is 'all' or 'overview') */}
      {viewMode !== 'cards' && (
        <>
          {/* 1. HERO HEADER: HOUSE COMPETITIONS */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-500/25">
                    <Flame className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>SPORTS DAY &amp; HOUSE COMPETITIONS</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Radio className="w-3 h-3 text-rose-400 animate-ping" />
                    <span>LIVE UPDATES ACTIVE</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  House Competitions Results
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Official championship log of final game results, mini-podium finishes, and athlete leaderboards.
                </p>
              </div>

              {/* Quick Actions (Browse Cards, Export, Scoring) */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                {onNavigateToEvents && (
                  <button
                    type="button"
                    onClick={onNavigateToEvents}
                    className="btn-hover-scale inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4 text-amber-400" />
                    <span>Browse Activity Cards ({sportsEvents.length}) &rarr;</span>
                  </button>
                )}

                {canAward && (
                  <button
                    type="button"
                    id="btn-open-game-scoring"
                    onClick={() => setSelectedGameForScoring(sportsEvents[0] || null)}
                    className="btn-hover-scale inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-slate-950" />
                    <span>Score Game Placements</span>
                  </button>
                )}

                {!isReadOnly && onOpenExportSports && (
                  <button
                    type="button"
                    onClick={onOpenExportSports}
                    className="btn-hover-scale inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    <span>Export Scorecards</span>
                  </button>
                )}
              </div>
            </div>

        {/* 2. ATHLETE PARTICIPATION & WIN INDICATOR WIDGET (Replaces live feed ticker) */}
        {!hideLiveTicker && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4">
            {/* Widget Header & House Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <Activity className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                    <span>Tournament Athlete Leaderboard</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Participation &amp; Wins
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tracking students who played the most games and won the most games by house
                  </p>
                </div>
              </div>

              {/* House Filter Pills & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setAthleteHouseFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      athleteHouseFilter === 'all'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Houses
                  </button>
                  {houses.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setAthleteHouseFilter(h.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        athleteHouseFilter === h.id
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                      <span>{h.name.replace('House of ', '')}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Find athlete..."
                    value={athleteSearchQuery}
                    onChange={(e) => setAthleteSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary Metrics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Total Match Appearances
                  </span>
                  <span className="text-base font-black text-white font-['Outfit']">
                    {totalAppearances} Matches Played
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Most Active Athlete
                  </span>
                  <span className="text-sm font-black text-white truncate block font-['Outfit']">
                    {topActiveStudent ? `${topActiveStudent.studentName} (${topActiveStudent.gamesPlayed} games)` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Top Winning Athlete
                  </span>
                  <span className="text-sm font-black text-white truncate block font-['Outfit']">
                    {topWinningStudent ? `${topWinningStudent.studentName} (${topWinningStudent.gamesWon} wins)` : 'Awaiting results'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Ranking Cards (Side-by-Side: Most Games Played vs Most Games Won - Top 3 Only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Card A: Most Games Participated (Top 3) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏃</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        Most Games Participated
                      </h4>
                      <p className="text-[10px] text-slate-400">Top 3 athletes with highest match appearance counts</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    Top 3 Athletes
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredParticipants.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No athletes found matching this filter.
                    </div>
                  ) : (
                    filteredParticipants.slice(0, 3).map((athlete, idx) => (
                      <div
                        key={athlete.studentId || athlete.studentName}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950 shadow-sm'
                                : 'bg-amber-700 text-white shadow-sm'
                            }`}
                          >
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white truncate text-xs">
                                {athlete.studentName}
                              </span>
                              <span className="text-[10px] text-slate-400">({athlete.grade})</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: athlete.houseColor }}
                              />
                              <span className="text-[10px] font-semibold text-slate-300">
                                {athlete.houseName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Indicators: Games Played & Games Won */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <span>🎯</span>
                            <span>{athlete.gamesPlayed} Played</span>
                          </span>
                          {athlete.gamesWon > 0 && (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              🏆 {athlete.gamesWon}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card B: Most Games Won by House (Top 3) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        Most Games Won by House
                      </h4>
                      <p className="text-[10px] text-slate-400">Top 3 athletes with the most 1st-place match victories</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    Top 3 Winners
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredWinners.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No game wins recorded yet. Score 1st place on game cards below to see winners!
                    </div>
                  ) : (
                    filteredWinners.slice(0, 3).map((athlete, idx) => (
                      <div
                        key={athlete.studentId || athlete.studentName}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950 shadow-sm'
                                : 'bg-amber-700 text-white shadow-sm'
                            }`}
                          >
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white truncate text-xs">
                                {athlete.studentName}
                              </span>
                              <span className="text-[10px] text-slate-400">({athlete.grade})</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: athlete.houseColor }}
                              />
                              <span className="text-[10px] font-semibold text-slate-300">
                                {athlete.houseName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Indicators: Games Won & Games Played */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                            <span>🥇</span>
                            <span>{athlete.gamesWon} Won</span>
                          </span>
                          <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            {athlete.gamesPlayed} played
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. EVENT TIMELINE SCHEDULE STRIP */}
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Official Sports Day Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Monday, 23 February 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEFAULT_EVENT_SCHEDULE.map((item, idx) => {
            const isCompleted = item.status === 'Completed';
            const isLive = item.status === 'Live Now';
            return (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                  isLive
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-500/10'
                    : isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.time}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isLive
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white font-['Outfit']">{item.event_name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-semibold">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {item.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ALL-GAMES FINAL RESULTS FEED (Official Championship Log) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Trophy className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                <span>All-Games Final Results Feed</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official Log ({completedGames.length} Final Results Recorded)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official championship records with mini-podium finishes (1st through 4th place) and verified house points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canAward && (
              <button
                type="button"
                onClick={() => setSelectedGameForScoring(sportsEvents[0] || null)}
                className="btn-hover-scale inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm cursor-pointer font-black"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record / Update Results</span>
              </button>
            )}
          </div>
        </div>

        {completedGames.length === 0 ? (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Final Match Results Recorded Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Once games conclude and placements are recorded, official mini-podium finishes (1st through 4th place) will appear in this feed.
            </p>
            {canAward && (
              <button
                type="button"
                onClick={() => setSelectedGameForScoring(sportsEvents[0] || null)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl cursor-pointer"
              >
                Record First Game Result &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {completedGames.map((game) => {
              const podium = getGamePodium(game);
              return (
                <div
                  key={game.id}
                  className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700">
                          {game.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Final Result Recorded
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        {game.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        {game.time && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {game.time}
                          </span>
                        )}
                        {game.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            {game.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {canAward && (
                      <button
                        type="button"
                        onClick={() => setSelectedGameForScoring(game)}
                        className="self-start sm:self-auto text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Edit Placements &rarr;
                      </button>
                    )}
                  </div>

                  {/* Mini-Podium Badge Layout (1st, 2nd, 3rd, 4th Place Finishes) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official Mini-Podium Finishes:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {([1, 2, 3, 4] as const).map((place) => {
                        const podItem = podium.find((p) => p.place === place);
                        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🎖️';
                        const placeLabel = place === 1 ? '1st Place' : place === 2 ? '2nd Place' : place === 3 ? '3rd Place' : '4th Place';
                        const badgeBg =
                          place === 1
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : place === 2
                            ? 'bg-slate-300/10 border-slate-300/30 text-slate-200'
                            : place === 3
                            ? 'bg-amber-700/10 border-amber-700/30 text-amber-400'
                            : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300';

                        if (!podItem) {
                          return (
                            <div
                              key={place}
                              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-1 opacity-60"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">{medal} {placeLabel}</span>
                              </div>
                              <span className="text-xs text-slate-500 italic">Unassigned</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={place}
                            className={`rounded-xl p-3 flex flex-col justify-between gap-2 border transition-all ${badgeBg}`}
                            style={{ borderLeftColor: podItem.house.color, borderLeftWidth: '4px' }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black flex items-center gap-1">
                                <span>{medal}</span>
                                <span>{placeLabel}</span>
                              </span>
                              <span className="text-xs font-mono font-black px-1.5 py-0.5 rounded bg-slate-950 text-white border border-slate-800">
                                +{podItem.points} pts
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: podItem.house.color }}
                              />
                              <strong className="text-xs text-white truncate font-extrabold">
                                {podItem.house.name.replace('House of ', '')}
                              </strong>
                            </div>

                            {/* Athletes rostered for this finish */}
                            {podItem.students.length > 0 && (
                              <div className="text-[11px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800/60">
                                {podItem.students.slice(0, 2).map((st, sIdx) => (
                                  <div key={sIdx} className="flex items-center justify-between text-[10px]">
                                    <span className="truncate font-semibold">{st.student_name}</span>
                                    <span className="text-slate-400 truncate max-w-[80px]">({st.role})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {game.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                      &ldquo;{game.notes}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA BANNER TO JUMP TO EVENTS TAB (when in overview mode) */}
      {viewMode === 'overview' && onNavigateToEvents && (
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base font-black text-white font-['Outfit']">
                Looking for the actual Match Activity Cards?
              </h4>
              <p className="text-xs text-slate-400">
                Switch to the <span className="text-amber-400 font-bold">House Competitions Events</span> tab to view full cards, rosters, and award house placements.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToEvents}
            className="btn-hover-scale inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Open House Competitions Events</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
    </>
  )}

  {/* SECTIONS 4 & 5: THE ACTUAL HOUSE ACTIVITY CARDS (when viewMode is 'all' or 'cards') */}
  {viewMode !== 'overview' && (
    <>
      {/* DEDICATED HEADER FOR HOUSE COMPETITIONS EVENTS TAB */}
      {viewMode === 'cards' && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 rounded-3xl p-5 sm:p-7 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25">
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>HOUSE COMPETITIONS &amp; MATCH CARDS</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>ACTIVE / UPCOMING GAME CARD CENTER</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                House Competitions Events
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Official sports activity cards generated by Admin Game Card Creator with complete rules, points breakdowns, and participating student rosters grouped by House and Grade Level.
              </p>
            </div>

            {/* Quick Actions (Create Card, Export Newsletter) */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {canAward && (
                <button
                  type="button"
                  id="btn-header-create-card"
                  onClick={() => {
                    setAdminEditingGame(null);
                    setIsAdminGameModalOpen(true);
                  }}
                  className="btn-hover-scale inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>+ Create Game Card</span>
                </button>
              )}

              {!isReadOnly && onOpenExportSports && (
                <button
                  type="button"
                  id="btn-header-export-newsletter"
                  onClick={onOpenExportSports}
                  className="btn-hover-scale inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-rose-400" />
                  <span>Export Newsletter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {(['all', 'live', 'upcoming', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search game, category or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 5. INTERACTIVE GAME CARDS LIST (Active / Upcoming Game Card Center) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                Active &amp; Upcoming Game Cards ({filteredGames.length})
              </h3>
              <p className="text-xs text-slate-400">
                Generated by Admin Game Card Creator &bull; Primary export source for Parent Newsletters
              </p>
            </div>
          </div>

          {canAward && (
            <button
              type="button"
              onClick={() => {
                setAdminEditingGame(null);
                setIsAdminGameModalOpen(true);
              }}
              className="btn-hover-scale inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Create Game Card</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredGames.map((game) => {
            const isCompleted =
              game.notes?.toLowerCase().includes('completed') ||
              (!game.isActive && game.scores?.some((s) => s.points > 0));
            const cardImg = getEventImage(game);

            return (
              <div
                key={game.id}
                className="bg-[#161B22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group"
              >
                {/* Visual Banner Header */}
                <div className="relative aspect-video sm:aspect-21/9 max-h-60 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
                  <img
                    src={cardImg}
                    alt={game.title}
                    className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] via-[#161B22]/50 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-amber-400 border border-slate-700/80 backdrop-blur-xs">
                      {game.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {game.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>Live Now</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white border border-emerald-400 shadow-xs">
                          Completed
                        </span>
                      )}
                      {!game.isActive && !isCompleted && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] drop-shadow-md">
                      {game.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-slate-200 mt-1 flex-wrap drop-shadow-sm font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatEventDay(game.date)}</span>
                      </span>
                      {game.time && (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{game.time}</span>
                        </span>
                      )}
                      {game.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{game.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                  {/* Brief description if present */}
                  {game.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {game.description}
                    </p>
                  )}

                  {/* Section A: Rules & Points Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                    {/* Points Value Box */}
                    <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Points Breakdown (1st - 4th Place):
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-amber-300 block">🥇 1st</span>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            +{getPlacementPoints(game, 1)} pts
                          </span>
                        </div>
                        <div className="bg-slate-300/10 border border-slate-300/30 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-slate-200 block">🥈 2nd</span>
                          <span className="text-sm font-black text-slate-200 font-mono">
                            +{getPlacementPoints(game, 2)} pts
                          </span>
                        </div>
                        <div className="bg-amber-700/10 border border-amber-700/30 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-amber-400 block">🥉 3rd</span>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            +{getPlacementPoints(game, 3)} pts
                          </span>
                        </div>
                        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-indigo-300 block">🎖️ 4th</span>
                          <span className="text-sm font-black text-indigo-300 font-mono">
                            +{getPlacementPoints(game, 4)} pts
                          </span>
                        </div>
                      </div>

                      {game.scoringBreakdown?.bonusNotes && (
                        <p className="text-[10px] text-amber-300/90 italic pt-1 border-t border-slate-800">
                          {game.scoringBreakdown.bonusNotes}
                        </p>
                      )}
                    </div>

                    {/* Rules Box */}
                    <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          Official Game Rules ({game.rules?.length || 0}):
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {game.rules && game.rules.length > 0 ? (
                          game.rules.map((rule, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {rIdx + 1}
                              </span>
                              <span className="leading-tight">{rule}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">Standard competition guidelines apply.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section B: Complete Student Participation Rosters Grouped by House & Grade Level */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-400" />
                        Complete Student Participation Rosters (Grouped by House &amp; Grade Level):
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Registered Athlete Lineup
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {houses.map((house) => {
                        const groupedByGrade = getGameParticipantsGroupedByGrade(game, house);
                        const gradesPresent = Object.keys(groupedByGrade);
                        const totalAthletes = Object.values(groupedByGrade).reduce((sum, arr) => sum + arr.length, 0);

                        return (
                          <div
                            key={house.id}
                            className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                            style={{ borderLeftColor: house.color, borderLeftWidth: '4px' }}
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: house.color }}
                                />
                                <strong className="text-xs font-black text-white truncate">
                                  {house.name}
                                </strong>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                                {totalAthletes} Enrolled
                              </span>
                            </div>

                            {/* Grouped by Grade Level */}
                            <div className="space-y-2">
                              {gradesPresent.length > 0 ? (
                                gradesPresent.map((grade) => {
                                  const roster = groupedByGrade[grade];
                                  return (
                                    <div key={grade} className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                                          {grade}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                                        {roster.map((st, stIdx) => {
                                          const stats = athleteStatsMap[st.studentId || st.student_name];
                                          const played = stats?.gamesPlayed || 1;
                                          const won = stats?.gamesWon || 0;

                                          return (
                                            <div
                                              key={stIdx}
                                              className="bg-slate-900/90 border border-slate-800 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1 text-xs"
                                            >
                                              <div className="min-w-0">
                                                <span className="font-bold text-white block truncate text-[11px]">
                                                  {st.student_name}
                                                </span>
                                                <span className="text-[9px] text-amber-300 italic">
                                                  {st.role}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1 shrink-0 text-[9px] text-slate-400">
                                                <span>🎯{played}</span>
                                                {won > 0 && <span className="text-emerald-400">🏆{won}</span>}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-[10px] text-slate-500 italic py-1">
                                  No athletes currently enrolled for this house.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Admin Actions Bar */}
                  {canAward && (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminEditingGame(game);
                            setIsAdminGameModalOpen(true);
                          }}
                          className="btn-hover-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit Card in Creator</span>
                        </button>

                        {onToggleEventActive && (
                          <button
                            type="button"
                            onClick={() => onToggleEventActive(game.id, !game.isActive)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              game.isActive
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {game.isActive ? '🔴 Set Inactive' : '🟢 Push Live Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}

      {/* 6. DEDICATED HOUSE PLACEMENT SCORING MODAL (Pure House Placement) */}
      {selectedGameForScoring && viewMode !== 'cards' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    Score Game Placements
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click each house to set 1st, 2nd, 3rd, or 4th place
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGameForScoring(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Select Game Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">Active Game Event:</label>
              <select
                value={selectedGameForScoring.id}
                onChange={(e) => {
                  const match = sportsEvents.find((g) => g.id === e.target.value);
                  if (match) setSelectedGameForScoring(match);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              >
                {sportsEvents.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.time || 'Match Time'})
                  </option>
                ))}
              </select>
            </div>

            {/* 4 Houses Placement Selector in Modal */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white block">
                Assign Place to Each House:
              </label>

              <div className="space-y-2.5">
                {houses.map((h) => {
                  const scoreObj = selectedGameForScoring.scores?.find((s) => s.houseId === h.id);
                  const currentPlace = scoreObj?.placement;
                  const pts = scoreObj?.points || 0;

                  return (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: h.color }}
                        />
                        <div>
                          <strong className="text-white text-xs block font-extrabold truncate">
                            {h.name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            Current: <span className="font-bold text-amber-300">{pts} pts</span>
                          </span>
                        </div>
                      </div>

                      {/* 1st, 2nd, 3rd, 4th, Clear pills */}
                      <div className="flex items-center gap-1">
                        {([1, 2, 3, 4] as const).map((place) => {
                          const isSelected = currentPlace === place;
                          return (
                            <button
                              key={place}
                              type="button"
                              onClick={() => {
                                handleSetHousePlacement(
                                  selectedGameForScoring,
                                  h.id,
                                  isSelected ? null : place
                                );
                                // Re-read updated game
                                const refreshed = sportsEvents.find(
                                  (g) => g.id === selectedGameForScoring.id
                                );
                                if (refreshed) setSelectedGameForScoring(refreshed);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                isSelected
                                  ? place === 1
                                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                                    : place === 2
                                    ? 'bg-slate-300 text-slate-950 border-slate-300'
                                    : place === 3
                                    ? 'bg-amber-700 text-white border-amber-600'
                                    : 'bg-slate-700 text-white border-slate-600'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {place === 1
                                ? '🥇 1st'
                                : place === 2
                                ? '🥈 2nd'
                                : place === 3
                                ? '🥉 3rd'
                                : '4th'}
                            </button>
                          );
                        })}

                        {currentPlace && (
                          <button
                            type="button"
                            onClick={() => {
                              handleSetHousePlacement(selectedGameForScoring, h.id, null);
                              const refreshed = sportsEvents.find(
                                (g) => g.id === selectedGameForScoring.id
                              );
                              if (refreshed) setSelectedGameForScoring(refreshed);
                            }}
                            className="px-2 py-1 rounded-lg text-xs font-bold text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-950 border border-slate-800"
                            title="Clear placement"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedGameForScoring(null)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Game Card Creator / Editor Modal */}
      {isAdminGameModalOpen && (
        <EditSportsGameModal
          isOpen={isAdminGameModalOpen}
          onClose={() => {
            setIsAdminGameModalOpen(false);
            setAdminEditingGame(null);
          }}
          event={adminEditingGame}
          houses={houses}
          students={students}
          onSave={handleSaveAdminGame}
        />
      )}
    </div>
  );
};
