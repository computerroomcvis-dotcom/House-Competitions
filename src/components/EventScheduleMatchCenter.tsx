import React, { useState, useMemo } from 'react';
import {
  SportsActivityEvent,
  House,
  Student,
  CurrentUser,
  PointTransaction,
  EventScheduleItem,
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
  PlusCircle,
  Filter,
  Download,
  Check,
  ChevronRight,
  Radio,
  Zap,
  Star,
  Activity,
  Crown,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventScheduleMatchCenterProps {
  sportsEvents: SportsActivityEvent[];
  houses: House[];
  students: Student[];
  currentUser: CurrentUser;
  transactions?: PointTransaction[];
  hideLiveTicker?: boolean;
  onAwardGameScore: (
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
    houseScores: { houseId: string; points: number }[]
  ) => void;
  onToggleEventActive?: (eventId: string, isActive: boolean) => void;
  onUpdateSportsEvents?: (newEvents: SportsActivityEvent[]) => void;
  onOpenCreateEvent?: () => void;
  onOpenExportSports?: () => void;
}

export const EventScheduleMatchCenter: React.FC<EventScheduleMatchCenterProps> = ({
  sportsEvents,
  houses,
  students,
  currentUser,
  transactions = [],
  hideLiveTicker = false,
  onAwardGameScore,
  onUpdateEventScores,
  onToggleEventActive,
  onOpenExportSports,
}) => {
  const canAward = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForScoring, setSelectedGameForScoring] = useState<SportsActivityEvent | null>(
    null
  );

  // Simplified Game Scoring Mode State
  const [scoringGameId, setScoringGameId] = useState<string>(
    sportsEvents[0]?.id || 'game-01'
  );
  const [scoringStudentId, setScoringStudentId] = useState<string>('');
  const [scoringPoints, setScoringPoints] = useState<number>(25);
  const [scoringReason, setScoringReason] = useState<string>('Anchor Performance');
  const [customReason, setCustomReason] = useState<string>('');
  const [isScoringSubmitting, setIsScoringSubmitting] = useState(false);
  const [scoringSuccessMessage, setScoringSuccessMessage] = useState('');

  // Pre-seed default student if none selected
  const activeGame = useMemo(() => {
    return sportsEvents.find((g) => g.id === scoringGameId) || sportsEvents[0];
  }, [sportsEvents, scoringGameId]);

  // Participating students for the selected game
  const availableParticipants = useMemo(() => {
    if (!activeGame) return [];

    // First, check participatingStudentsWithRoles
    if (activeGame.participatingStudentsWithRoles && activeGame.participatingStudentsWithRoles.length > 0) {
      return activeGame.participatingStudentsWithRoles.map((p) => {
        const fullStudent = students.find(
          (s) => s.id === p.studentId || s.name.toLowerCase().includes(p.student_name.toLowerCase().split(' ')[0])
        );
        const houseObj = houses.find(
          (h) => h.name.toLowerCase().includes(p.house.toLowerCase()) || h.id === fullStudent?.houseId
        );
        return {
          id: fullStudent?.id || `participant-${p.student_name}`,
          name: p.student_name,
          houseName: houseObj?.name || p.house,
          houseId: houseObj?.id || 'house-stormchasers',
          houseColor: houseObj?.color || '#2E90FA',
          role: p.role || 'Competitor',
          grade: fullStudent?.grade || 'Primary',
        };
      });
    }

    // Second, check participatingStudentIds
    if (activeGame.participatingStudentIds && activeGame.participatingStudentIds.length > 0) {
      return activeGame.participatingStudentIds
        .map((sId) => students.find((s) => s.id === sId))
        .filter(Boolean)
        .map((s) => {
          const houseObj = houses.find((h) => h.id === s!.houseId);
          return {
            id: s!.id,
            name: s!.name,
            houseName: houseObj?.name || 'House',
            houseId: s!.houseId,
            houseColor: houseObj?.color || '#2E90FA',
            role: 'Participant',
            grade: s!.grade,
          };
        });
    }

    // Default fallback: sample representatives from each house
    return houses.map((h) => {
      const rep = students.find((s) => s.houseId === h.id);
      return {
        id: rep?.id || `rep-${h.id}`,
        name: rep?.name || `${h.name.split(' ')[0]} Athlete`,
        houseName: h.name,
        houseId: h.id,
        houseColor: h.color,
        role: 'Team Captain',
        grade: rep?.grade || 'Grade 3',
      };
    });
  }, [activeGame, students, houses]);

  // Set default student when game changes
  React.useEffect(() => {
    if (availableParticipants.length > 0 && !scoringStudentId) {
      setScoringStudentId(availableParticipants[0].id);
    }
  }, [availableParticipants, scoringStudentId]);

  // Handle open simplified scoring modal for a specific card
  const handleOpenQuickScoring = (game: SportsActivityEvent) => {
    setSelectedGameForScoring(game);
    setScoringGameId(game.id);
    const gameParticipants = game.participatingStudentsWithRoles || [];
    if (gameParticipants.length > 0) {
      const first = gameParticipants[0];
      const match = students.find((s) => s.name.toLowerCase().includes(first.student_name.toLowerCase().split(' ')[0]));
      setScoringStudentId(match?.id || `participant-${first.student_name}`);
    }
  };

  // Submit Simplified Game Scoring
  const handleSubmitGameScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGame) return;

    const studentObj = availableParticipants.find((p) => p.id === scoringStudentId) || availableParticipants[0];
    if (!studentObj) return;

    const finalReason = customReason.trim() || scoringReason || 'Outstanding Match Performance';

    setIsScoringSubmitting(true);

    onAwardGameScore(
      activeGame.id,
      studentObj.id,
      studentObj.name,
      studentObj.houseId,
      scoringPoints,
      finalReason,
      activeGame.title
    );

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [studentObj.houseColor, '#F59E0B', '#10B981'],
    });

    setScoringSuccessMessage(
      `+${scoringPoints} points credited to ${studentObj.name} (${studentObj.houseName}) for ${activeGame.title}!`
    );

    setTimeout(() => {
      setScoringSuccessMessage('');
      setIsScoringSubmitting(false);
      setSelectedGameForScoring(null);
    }, 2400);
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    return sportsEvents.filter((game) => {
      // Status filtering
      const isCompleted = game.notes?.toLowerCase().includes('completed') || (!game.isActive && game.scores?.some((s) => s.points > 0));
      const isLive = game.isActive;
      const isUpcoming = !game.isActive && !isCompleted;

      if (statusFilter === 'live' && !isLive) return false;
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'upcoming' && !isUpcoming) return false;

      // Query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.category?.toLowerCase().includes(q) ||
          (game.location && game.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sportsEvents, statusFilter, searchQuery]);

  // Group participating students by House for each game event
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
          points: p.role?.toLowerCase().includes('anchor')
            ? 25
            : p.role?.toLowerCase().includes('fastest')
            ? 20
            : p.role?.toLowerCase().includes('lead')
            ? 15
            : 15,
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
        points: 20,
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
          points: 25,
        },
      ];
    } else if (house.id === 'house-earthshakers') {
      return [
        {
          studentId: 'stu-es-pk3-2',
          student_name: 'Thichanan L.',
          grade: 'PK-3',
          role: 'High Effort Lead',
          points: 15,
        },
      ];
    } else if (house.id === 'house-mountainhearts') {
      return [
        {
          studentId: 'stu-mh-pk4-3',
          student_name: 'Linlada P.',
          grade: 'PK-4',
          role: 'Fastest Lap Anchor',
          points: 20,
        },
      ];
    } else if (house.id === 'house-thunderhooves') {
      return [
        {
          studentId: 'stu-th-pk3-3',
          student_name: 'Kannisa T.',
          grade: 'PK-3',
          role: 'Great Sportsmanship',
          points: 15,
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
          points: 15,
        },
      ];
    }

    return [];
  };

  // Quick 1-click trigger to award points to a specific student in a game
  const handleAwardStudentInGame = (
    game: SportsActivityEvent,
    house: House,
    student: { studentId: string; student_name: string; role: string; points: number }
  ) => {
    setSelectedGameForScoring(game);
    setScoringGameId(game.id);
    setScoringStudentId(student.studentId);
    setScoringPoints(student.points || 15);
    setScoringReason(student.role || 'Outstanding Performance');
  };

  // Live Score Ticker Items (sports and game specific updates)
  const sportsTickerItems = useMemo(() => {
    // 1. Transactions filtered to sports/games
    const sportsTxs = transactions.filter(
      (tx) =>
        tx.category === 'Sports Week' ||
        tx.category === 'House Spirit' ||
        tx.reason?.includes('Pull') ||
        tx.reason?.includes('Relays') ||
        tx.reason?.includes('Tug of War')
    );

    if (sportsTxs.length > 0) {
      return sportsTxs.slice(0, 8).map((tx) => {
        const houseObj = houses.find((h) => h.id === tx.houseId);
        const timeStr = new Date(tx.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          id: tx.id,
          time: timeStr,
          studentName: tx.studentName,
          houseName: houseObj?.name?.replace('House of ', '') || 'House',
          houseColor: houseObj?.color || '#2E90FA',
          points: tx.amount,
          gameTitle: tx.reason?.includes('Tug of War')
            ? 'Tug of War Championship'
            : tx.reason?.includes('Relay')
            ? 'Sprint Relays'
            : 'Match Event',
          reason: tx.reason || 'Event Performance',
        };
      });
    }

    // Default ticker items matching user specification
    return [
      {
        id: 'tick-1',
        time: '10:42 AM',
        studentName: 'Poomrapee W.',
        houseName: 'Stormchasers',
        houseColor: '#2E90FA',
        points: 15,
        gameTitle: 'Tug of War Championship',
        reason: 'Won Round 2 Pull',
      },
      {
        id: 'tick-2',
        time: '09:45 AM',
        studentName: 'Linlada P.',
        houseName: 'Mountainhearts',
        houseColor: '#F76808',
        points: 20,
        gameTitle: 'Sprint Relays (4x100m)',
        reason: 'Fastest Lap Anchor Finish',
      },
      {
        id: 'tick-3',
        time: '09:20 AM',
        studentName: 'Thichanan L.',
        houseName: 'Earthshakers',
        houseColor: '#12B76A',
        points: 15,
        gameTitle: 'Tug of War Championship',
        reason: 'High Effort Lead Stance',
      },
      {
        id: 'tick-4',
        time: '09:05 AM',
        studentName: 'Kannisa T.',
        houseName: 'Thunderhooves',
        houseColor: '#7A5AF8',
        points: 15,
        gameTitle: 'Sprint Relays',
        reason: 'Great Sportsmanship Baton Handover',
      },
    ];
  }, [transactions, houses]);

  return (
    <div id="event-schedule-match-center" className="space-y-6">
      {/* 1. HERO HEADER: EVENT SCHEDULE & MATCH CENTER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-500/25">
                <Flame className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>SPORTS DAY &amp; COMPETITION MATCH CENTER</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Radio className="w-3 h-3 text-rose-400 animate-ping" />
                <span>LIVE UPDATES ACTIVE</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
              Event Schedule &amp; Match Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Official school house games schedule, live rosters grouped by house and grade, real-time score tallies, and referee awarding controls.
            </p>
          </div>

          {/* Quick Actions (Export, Scoring) */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {canAward && (
              <button
                type="button"
                id="btn-open-game-scoring"
                onClick={() => setSelectedGameForScoring(sportsEvents[0] || null)}
                className="btn-hover-scale inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Game Scoring Mode</span>
              </button>
            )}

            {onOpenExportSports && (
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

        {/* 2. REAL-TIME LIVE SCORE TICKER BANNER (Hidden on Home Portal) */}
        {!hideLiveTicker && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-slate-950/70 border border-slate-800 p-2 sm:p-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>LIVE FEED</span>
              </div>

              <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs">
                {sportsTickerItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 whitespace-nowrap text-slate-300 shrink-0 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800"
                  >
                    <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    <span className="font-bold text-white">{item.studentName}</span>
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor: `${item.houseColor}25`,
                        color: item.houseColor,
                      }}
                    >
                      {item.houseName}
                    </span>
                    <span className="text-emerald-400 font-black">+{item.points} pts</span>
                    <span className="text-slate-400 text-[11px]">in {item.gameTitle}</span>
                    <span className="text-amber-300 text-[11px] italic">({item.reason})</span>
                  </div>
                ))}
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

      {/* 4. CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {(['all', 'live', 'upcoming', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All Games' : filter === 'live' ? '🔥 Live Now' : filter}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games, venues, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 5. HOUSE COMPETITION CARDS (Games & Events with Participants Grouped by House) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>House Competition Cards ({filteredGames.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Featured match games &amp; events &bull; Structured by Game Title &bull; House Scoring &bull; Participants by House &bull; Students Names
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">
            Official Competition Scorecards
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredGames.map((game) => {
            const isCompleted =
              game.notes?.toLowerCase().includes('completed') ||
              (!game.isActive && game.scores?.some((s) => s.points > 0));
            const isLive = game.isActive;
            const statusTag = isLive ? 'LIVE NOW' : isCompleted ? 'Completed' : 'Upcoming';

            const sortedScores = [...(game.scores || [])].sort((a, b) => b.points - a.points);
            const winnerScore = sortedScores[0];
            const winnerHouse = houses.find((h) => h.id === winnerScore?.houseId);

            return (
              <div
                key={game.id}
                className="bg-[#161B22] rounded-2xl border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-slate-700 transition-all text-white relative overflow-hidden"
              >
                {/* 1. GAME TITLE & DETAILS */}
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isLive
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {statusTag}
                        </span>

                        <span className="text-xs text-slate-400 font-mono font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {game.time || '10:30 AM'}
                        </span>

                        {game.location && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {game.location}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                        {game.title}
                      </h4>
                    </div>

                    {game.category && (
                      <span className="text-[10px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md shrink-0">
                        {game.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* 2. HOUSE SCORING */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      House Scoring:
                    </span>
                    {winnerScore && winnerScore.points > 0 && (
                      <span className="text-amber-300 font-extrabold flex items-center gap-1 text-[11px] bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                        <Crown className="w-3 h-3 text-amber-400" />
                        Winner: {winnerHouse?.name?.replace('House of ', '')} ({winnerScore.points} pts)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {houses.map((house) => {
                      const scoreItem = game.scores?.find((s) => s.houseId === house.id);
                      const pts = scoreItem?.points || 0;
                      const isWinner = winnerScore && winnerScore.houseId === house.id && pts > 0;
                      return (
                        <div
                          key={house.id}
                          className={`p-2 rounded-lg text-center transition-all ${
                            isWinner
                              ? 'bg-amber-400/10 border-2 border-amber-400/60 shadow-xs'
                              : 'bg-slate-900 border border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: house.color }}
                            />
                            <span className="text-[10px] font-bold text-slate-300 truncate">
                              {house.name.replace('House of ', '')}
                            </span>
                          </div>
                          <span className="text-base font-black text-white font-['Outfit'] block leading-none my-0.5">
                            {pts}
                          </span>
                          <span className="text-[8px] text-slate-500 uppercase font-semibold">pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. PARTICIPANTS BY HOUSE | STUDENTS NAMES */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Participants by House &bull; Students Names:
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Athletes Grouped Under Houses
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {houses.map((h) => {
                      const houseParticipants = getGameParticipantsByHouse(game, h);
                      const houseScore =
                        game.scores?.find((s) => s.houseId === h.id)?.points || 0;

                      return (
                        <div
                          key={h.id}
                          className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5 hover:border-slate-700 transition-all"
                        >
                          {/* House Header */}
                          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: h.color }}
                              />
                              <span className="text-xs font-black text-white truncate">
                                {h.name}
                              </span>
                            </div>
                            <span
                              className="text-[9px] font-black px-1.5 py-0.2 rounded shrink-0"
                              style={{
                                backgroundColor: `${h.color}25`,
                                color: h.color,
                                border: `1px solid ${h.color}40`,
                              }}
                            >
                              {houseScore} pts
                            </span>
                          </div>

                          {/* Students Names Underneath */}
                          <div className="space-y-1">
                            {houseParticipants.length > 0 ? (
                              houseParticipants.map((student, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between text-xs bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800/80"
                                >
                                  <div className="min-w-0 pr-1">
                                    <strong className="text-white font-extrabold truncate block text-[11px]">
                                      {student.student_name}
                                    </strong>
                                    <span className="text-[9px] text-slate-400">
                                      ({student.grade}) &bull;{' '}
                                      <span className="text-amber-300 italic">{student.role}</span>
                                    </span>
                                  </div>

                                  {canAward && (
                                    <button
                                      type="button"
                                      onClick={() => handleAwardStudentInGame(game, h, student)}
                                      className="btn-hover-scale px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shrink-0 ml-1 cursor-pointer shadow-xs"
                                      title={`Award points to ${student.student_name}`}
                                    >
                                      + Award
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-500 italic py-0.5">No athletes registered</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. FOOTER: REFEREE ACTION */}
                {canAward && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Referee Action:</span>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickScoring(game)}
                      className="btn-hover-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Award Points to Game Participant</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. SIMPLIFIED GAME SCORING MODE MODAL (Teacher & Admin Dashboard) */}
      {selectedGameForScoring && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    Simplified Game Scoring Mode
                  </h3>
                  <p className="text-xs text-slate-400">
                    Push instant updates to Game Cards, Home Feed &amp; Podium
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGameForScoring(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {scoringSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{scoringSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitGameScore} className="space-y-4 text-xs">
                {/* Step 1: Select Game Card */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">
                    1. Select Game Card:
                  </label>
                  <select
                    value={scoringGameId}
                    onChange={(e) => setScoringGameId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    {sportsEvents.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({g.time || 'Match Time'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Participating Student from the house roster */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">
                    2. Select Participating Student from House Roster:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    {availableParticipants.map((p) => {
                      const isSelected = scoringStudentId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setScoringStudentId(p.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-400/20 border-amber-400 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: p.houseColor }}
                              />
                              <span className="font-bold text-white truncate">{p.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {p.houseName} &bull; {p.role}
                            </span>
                          </div>

                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Select Points (+5, +10, +25, +50) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">
                    3. Select Points:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 25, 50].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setScoringPoints(pts)}
                        className={`py-2 rounded-xl text-center font-black text-sm transition-all cursor-pointer border ${
                          scoringPoints === pts
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        +{pts}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    Reason / Performance Highlight:
                  </label>
                  <select
                    value={scoringReason}
                    onChange={(e) => setScoringReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-hidden focus:border-amber-400 mb-1"
                  >
                    <option value="Won Round 2 Pull">Won Round 2 Pull</option>
                    <option value="Fastest Lap Anchor Finish">Fastest Lap Anchor Finish</option>
                    <option value="Anchor Performance">Anchor Performance</option>
                    <option value="High Effort Lead">High Effort Lead</option>
                    <option value="Great Sportsmanship">Great Sportsmanship</option>
                    <option value="Baton Transition Mastery">Baton Transition Mastery</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Or enter custom reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Step 4: Submit Score */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGameForScoring(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isScoringSubmitting}
                    className="btn-hover-scale px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isScoringSubmitting ? 'Submitting...' : 'Submit Score & Push Live'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
