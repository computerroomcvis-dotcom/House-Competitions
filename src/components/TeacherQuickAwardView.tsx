import React, { useState, useMemo } from 'react';
import {
  House,
  Student,
  PointTransaction,
  CurrentUser,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  SportsActivityEvent,
} from '../types';
import { HouseTotalSummary } from '../utils/storage';
import {
  Sparkles,
  Trophy,
  Plus,
  CheckCircle2,
  Users,
  GraduationCap,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from './AnimatedCounter';

interface TeacherQuickAwardViewProps {
  houses: House[];
  students: Student[];
  houseTotals: HouseTotalSummary[];
  currentUser: CurrentUser;
  transactions?: PointTransaction[];
  sportsEvents?: SportsActivityEvent[];
  onAwardPoints: (txs: Omit<PointTransaction, 'id' | 'timestamp'>[]) => void;
  onAwardGameScore?: (
    gameId: string,
    studentId: string,
    studentName: string,
    houseId: string,
    points: number,
    reason: string,
    gameTitle: string
  ) => void;
  onUndoTransaction?: (txId: string) => void;
  onOpenFullAwardModal: (preselectedHouseId?: string, preselectedStudentId?: string) => void;
  onOpenExport?: () => void;
}

const COMMON_REASONS = [
  'Academic Effort & Excellence',
  'Kindness & Helping Others',
  'Sportsmanship & Teamwork',
  'House Spirit & Participation',
  'Classroom Leadership',
  'Polite Manners & Respect',
];

export const TeacherQuickAwardView: React.FC<TeacherQuickAwardViewProps> = ({
  houses,
  students,
  houseTotals,
  currentUser,
  transactions = [],
  sportsEvents = [],
  onAwardPoints,
  onAwardGameScore,
  onUndoTransaction,
  onOpenFullAwardModal,
}) => {
  // Award Target Mode: 'house' | 'class' | 'game' (Sports Match Scoring Mode)
  const [awardTarget, setAwardTarget] = useState<'house' | 'class' | 'game'>('house');

  // Selected Target: House
  const [selectedHouseId, setSelectedHouseId] = useState<string>(houses[0]?.id || '');

  // Selected Target: Class (Grade Level)
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('PK-4');
  const [classHouseFilter, setClassHouseFilter] = useState<string>('all');

  // Points configuration (House / Class)
  const [pointsAmount, setPointsAmount] = useState<number>(5);
  const [isNegative, setIsNegative] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [undoMessage, setUndoMessage] = useState<string>('');

  // Game Scoring Mode State
  const [selectedGameId, setSelectedGameId] = useState<string>(sportsEvents[0]?.id || 'game-01');
  const [selectedGameParticipantId, setSelectedGameParticipantId] = useState<string>('');
  const [gamePoints, setGamePoints] = useState<number>(25);
  const [gameReason, setGameReason] = useState<string>('Anchor Performance');
  const [customGameReason, setCustomGameReason] = useState<string>('');

  // Recent Point History Drawer state (default open)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(true);

  const teacherName = currentUser.teacher?.name || currentUser.adminUser?.name || 'Teacher';

  const selectedHouse = houses.find((h) => h.id === selectedHouseId);

  // Active game for game scoring
  const activeSelectedGame = useMemo(() => {
    return sportsEvents.find((g) => g.id === selectedGameId) || sportsEvents[0];
  }, [sportsEvents, selectedGameId]);

  // Athletes roster for active game
  const gameRoster = useMemo(() => {
    if (!activeSelectedGame) return [];

    if (activeSelectedGame.participatingStudentsWithRoles && activeSelectedGame.participatingStudentsWithRoles.length > 0) {
      return activeSelectedGame.participatingStudentsWithRoles.map((p) => {
        const fullStudent = students.find(
          (s) => s.id === p.studentId || s.name.toLowerCase().includes(p.student_name.toLowerCase().split(' ')[0])
        );
        const houseObj = houses.find(
          (h) => h.name.toLowerCase().includes(p.house.toLowerCase()) || h.id === fullStudent?.houseId
        );
        return {
          id: fullStudent?.id || `participant-${p.student_name}`,
          name: p.student_name,
          houseName: houseObj?.name?.replace('House of ', '') || p.house,
          houseId: houseObj?.id || 'house-stormchasers',
          houseColor: houseObj?.color || '#2E90FA',
          role: p.role || 'Member',
          grade: fullStudent?.grade || 'Primary',
        };
      });
    }

    if (activeSelectedGame.participatingStudentIds && activeSelectedGame.participatingStudentIds.length > 0) {
      return activeSelectedGame.participatingStudentIds
        .map((sId) => students.find((s) => s.id === sId))
        .filter(Boolean)
        .map((s) => {
          const houseObj = houses.find((h) => h.id === s!.houseId);
          return {
            id: s!.id,
            name: s!.name,
            houseName: houseObj?.name?.replace('House of ', '') || 'House',
            houseId: s!.houseId,
            houseColor: houseObj?.color || '#2E90FA',
            role: 'Participant',
            grade: s!.grade,
          };
        });
    }

    return houses.map((h) => {
      const rep = students.find((s) => s.houseId === h.id);
      return {
        id: rep?.id || `rep-${h.id}`,
        name: rep?.name || `${h.name.split(' ')[0]} Athlete`,
        houseName: h.name.replace('House of ', ''),
        houseId: h.id,
        houseColor: h.color,
        role: 'Team Captain',
        grade: rep?.grade || 'Grade 3',
      };
    });
  }, [activeSelectedGame, students, houses]);

  React.useEffect(() => {
    if (gameRoster.length > 0 && !selectedGameParticipantId) {
      setSelectedGameParticipantId(gameRoster[0].id);
    }
  }, [gameRoster, selectedGameParticipantId]);

  // Filtered students for class awarding
  const studentsInSelectedClass = students.filter((s) => s.grade === selectedGrade);
  const targetClassStudents = classHouseFilter === 'all'
    ? studentsInSelectedClass
    : studentsInSelectedClass.filter((s) => s.houseId === classHouseFilter);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. GAME SCORING MODE (Simplified 4-step sports scoring)
    if (awardTarget === 'game') {
      if (!activeSelectedGame) return;
      const part = gameRoster.find((p) => p.id === selectedGameParticipantId) || gameRoster[0];
      if (!part) return;

      const pts = gamePoints;
      const res = customGameReason.trim() || gameReason || 'Outstanding Match Performance';

      if (onAwardGameScore) {
        onAwardGameScore(
          activeSelectedGame.id,
          part.id,
          part.name,
          part.houseId,
          pts,
          res,
          activeSelectedGame.title
        );
      } else {
        onAwardPoints([
          {
            studentId: part.id,
            studentName: part.name,
            grade: (part.grade as any) || 'PK-4',
            houseId: part.houseId,
            type: 'merit',
            amount: pts,
            reason: `${part.name} (${part.houseName}) earned +${pts} in ${activeSelectedGame.title} for ${res}`,
            category: 'Sports Week',
            awardedBy: teacherName,
          },
        ]);
      }

      setSuccessMessage(
        `Scored +${pts} points to ${part.name} (${part.houseName}) in ${activeSelectedGame.title}!`
      );

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: [part.houseColor, '#F59E0B', '#10B981'],
      });
      return;
    }

    const reasonText = customReason.trim() || selectedReason;

    if (awardTarget === 'house') {
      if (!selectedHouseId) return;
      const houseObj = houses.find((h) => h.id === selectedHouseId);
      const houseName = houseObj?.name || 'House';
      const repStudent = students.find((s) => s.houseId === selectedHouseId);

      onAwardPoints([
        {
          studentId: repStudent?.id || `house-award-${selectedHouseId}`,
          studentName: `${houseName} (House Award)`,
          grade: repStudent?.grade || 'PK-4',
          houseId: selectedHouseId,
          type: isNegative ? 'demerit' : 'merit',
          amount: Math.abs(pointsAmount),
          reason: reasonText,
          category: 'House Spirit & Commendation',
          awardedBy: teacherName,
          isClassAward: true,
        },
      ]);

      setSuccessMessage(
        `Awarded ${isNegative ? `-${pointsAmount}` : `+${pointsAmount}`} points to ${houseName}!`
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [houseObj?.color || '#F59E0B', '#F59E0B', '#10B981'],
      });
    } else {
      // Award by Class / Grade Level
      if (targetClassStudents.length === 0) {
        alert(`No students found in ${GRADE_LABELS[selectedGrade]}. Please select another class.`);
        return;
      }

      const txs: Omit<PointTransaction, 'id' | 'timestamp'>[] = targetClassStudents.map((st) => ({
        studentId: st.id,
        studentName: st.name,
        grade: st.grade,
        houseId: st.houseId,
        type: isNegative ? 'demerit' : 'merit',
        amount: Math.abs(pointsAmount),
        reason: reasonText,
        category: 'Class Commendation',
        awardedBy: teacherName,
        isClassAward: true,
      }));

      onAwardPoints(txs);

      const targetHouseLabel = classHouseFilter === 'all'
        ? 'all students'
        : `${houses.find((h) => h.id === classHouseFilter)?.name || 'House'} students`;

      setSuccessMessage(
        `Awarded ${isNegative ? `-${pointsAmount}` : `+${pointsAmount}`} points to ${targetClassStudents.length} ${targetHouseLabel} in ${GRADE_LABELS[selectedGrade]}!`
      );

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#12B76A', '#F76808', '#2E90FA', '#7A5AF8', '#F59E0B'],
      });
    }

    setTimeout(() => {
      setSuccessMessage('');
    }, 4500);
  };

  const handleUndo = (txId: string, description: string) => {
    if (onUndoTransaction) {
      onUndoTransaction(txId);
      setUndoMessage(`Undone: ${description} has been reverted.`);
      setTimeout(() => {
        setUndoMessage('');
      }, 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. TEACHER QUICK AWARD WIZARD PANEL (Streamlined 4-Step Vertical Card Wizard: By House or By Class) */}
      <div className="bg-[#161B22] rounded-3xl p-5 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white">
                Quick Point Awarding Wizard
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Logged in as <strong className="text-amber-300">{teacherName}</strong> &bull; Quick awarding by <span className="text-white font-bold">House</span> or <span className="text-white font-bold">Class</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenFullAwardModal()}
              className="btn-hover-scale text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Advanced Award Form &rarr;</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-in fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Undo Alert */}
        {undoMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-sm font-bold flex items-center gap-3 animate-in fade-in shadow-lg">
            <RotateCcw className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{undoMessage}</span>
          </div>
        )}

        <form onSubmit={handleQuickSubmit} className="space-y-8 relative z-10">
          {/* STEP 1: Select Award Mode (By House or By Class) */}
          <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                Select Awarding Mode
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
              {/* Option A: Award by House */}
              <button
                type="button"
                id="quick-award-mode-house"
                onClick={() => setAwardTarget('house')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  awardTarget === 'house'
                    ? 'ring-2 ring-amber-400 bg-amber-400/15 border-amber-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      awardTarget === 'house' ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm sm:text-base text-white">Award by House</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Adds points directly to House Cup standings
                    </p>
                  </div>
                </div>
                {awardTarget === 'house' && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Option B: Award by Class */}
              <button
                type="button"
                id="quick-award-mode-class"
                onClick={() => setAwardTarget('class')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  awardTarget === 'class'
                    ? 'ring-2 ring-amber-400 bg-amber-400/15 border-amber-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      awardTarget === 'class' ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm sm:text-base text-white">Award by Class</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Commend an entire grade level (TP &ndash; G5)
                    </p>
                  </div>
                </div>
                {awardTarget === 'class' && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Option C: Game Scoring Mode */}
              <button
                type="button"
                id="quick-award-mode-game"
                onClick={() => setAwardTarget('game')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  awardTarget === 'game'
                    ? 'ring-2 ring-amber-400 bg-amber-400/15 border-amber-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      awardTarget === 'game' ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Flame className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm sm:text-base text-white">Game Scoring Mode</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Award participating match athletes
                    </p>
                  </div>
                </div>
                {awardTarget === 'game' && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {awardTarget === 'game' ? (
            /* SIMPLIFIED GAME SCORING MODE (4 Steps) */
            <div className="space-y-6">
              {/* 1. Select Game Card */}
              <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                    1. Select Game Card
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sportsEvents.slice(0, 6).map((g) => {
                    const isSelected = selectedGameId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGameId(g.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'ring-2 ring-amber-400 bg-amber-400/15 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-amber-400">{g.time || 'Match'}</span>
                          <span className="text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {g.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white font-['Outfit'] truncate">{g.title}</h4>
                        <span className="text-[10px] text-slate-400 truncate">{g.location || 'Central Field'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Select Participating Student from House Roster */}
              <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                    2. Select Participating Student from House Roster
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {gameRoster.map((p) => {
                    const isSelected = selectedGameParticipantId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedGameParticipantId(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'ring-2 ring-amber-400 bg-amber-400/20 border-amber-400 text-white font-bold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: p.houseColor }}
                            />
                            <span className="font-bold text-white text-xs truncate">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {p.houseName} &bull; <strong className="text-amber-300">{p.role}</strong>
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Select Points (+5, +10, +25, +50) */}
              <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                    3. Select Points &amp; Performance Reason
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                  {[5, 10, 25, 50].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setGamePoints(pts)}
                      className={`py-3 rounded-xl font-black text-base transition-all cursor-pointer border text-center ${
                        gamePoints === pts
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      +{pts} pts
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 max-w-xl">
                  <label className="text-xs font-bold text-slate-300 block">Performance Highlight Reason:</label>
                  <select
                    value={gameReason}
                    onChange={(e) => setGameReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400 mb-2"
                  >
                    <option value="Won Round 2 Pull">Won Round 2 Pull</option>
                    <option value="Anchor Performance">Anchor Performance</option>
                    <option value="Fastest Lap Anchor Finish">Fastest Lap Anchor Finish</option>
                    <option value="High Effort Lead">High Effort Lead</option>
                    <option value="Great Sportsmanship">Great Sportsmanship</option>
                    <option value="Baton Transition Mastery">Baton Transition Mastery</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Or enter custom performance highlight..."
                    value={customGameReason}
                    onChange={(e) => setCustomGameReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* 4. Tap Submit Score */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-hover-scale px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 cursor-pointer flex items-center gap-2 border border-amber-300"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Submit Score to Home Portal Feed &amp; Podium</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 2: Choose House OR Choose Class */}
              <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                {awardTarget === 'house' ? 'Choose House' : 'Choose Grade Level & Class'}
              </h3>
            </div>

            {awardTarget === 'house' ? (
              /* THE 4 HOUSE CARDS SELECTION */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {houses.map((h) => {
                  const isSelected = selectedHouseId === h.id;
                  const houseStudentCount = students.filter((s) => s.houseId === h.id).length;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHouseId(h.id)}
                      className={`btn-hover-scale p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-amber-400 bg-slate-800 border-amber-400 shadow-xl'
                          : 'bg-slate-850/90 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.95)' : undefined,
                      }}
                    >
                      {/* Accent color top bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: h.color }}
                      />

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: h.color }}
                          />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                            {h.name.replace('House of ', '')}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-xs">
                            Selected
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                          {h.name}
                        </h4>
                        {/* High contrast mascot subtitle */}
                        <p className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                          <span>🐾</span>
                          <span className="text-slate-200 font-bold">{h.mascot}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {houseStudentCount} Enrolled Students
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* CLASS / GRADE LEVEL SELECTION GRID */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {ALL_GRADES.map((grade) => {
                    const isSelected = selectedGrade === grade;
                    const gradeStudents = students.filter((s) => s.grade === grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSelectedGrade(grade)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'ring-2 ring-amber-400 bg-amber-400/20 border-amber-400 text-white shadow-lg'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-black ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-white'
                            }`}
                          >
                            {grade}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {gradeStudents.length} std
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-white leading-snug">
                          {GRADE_LABELS[grade]}
                        </p>
                        {/* House presence dots */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {houses.map((h) => {
                            const hasHouseStudents = gradeStudents.some((s) => s.houseId === h.id);
                            if (!hasHouseStudents) return null;
                            return (
                              <span
                                key={h.id}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: h.color }}
                                title={`${h.name} students present`}
                              />
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Class Roster & House Scope Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        Selected: <strong className="text-amber-300">{GRADE_LABELS[selectedGrade]}</strong> ({targetClassStudents.length} Students Included)
                      </span>
                    </div>

                    {/* Optional House Filter within Class */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Award Scope:</span>
                      <select
                        value={classHouseFilter}
                        onChange={(e) => setClassHouseFilter(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-400"
                      >
                        <option value="all">All Houses in Class ({studentsInSelectedClass.length})</option>
                        {houses.map((h) => {
                          const count = studentsInSelectedClass.filter((s) => s.houseId === h.id).length;
                          return (
                            <option key={h.id} value={h.id}>
                              {h.name} only ({count})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Student list preview chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                    {targetClassStudents.map((st) => {
                      const h = houses.find((house) => house.id === st.houseId);
                      return (
                        <span
                          key={st.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-200 shadow-xs"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: h?.color || '#94A3B8' }}
                          />
                          <span className="font-semibold text-white">{st.name}</span>
                          <span className="text-[10px] text-slate-400">
                            ({h?.name.replace('House of ', '')})
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Configure Points Amount */}
          <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  Point Amount &amp; Merit Type
                </h3>
              </div>

              {/* Positive Merit vs Demerit Switch */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNegative(false)}
                  className={`btn-hover-scale px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    !isNegative
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Merit
                </button>
                <button
                  type="button"
                  onClick={() => setIsNegative(true)}
                  className={`btn-hover-scale px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isNegative
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  - Demerit
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {[1, 2, 5, 10, 20, 50].map((amt) => {
                const isSelected = pointsAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPointsAmount(amt)}
                    className={`btn-hover-scale px-4 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer ${
                      isSelected
                        ? isNegative
                          ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-400 scale-105'
                          : 'bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isNegative ? `-${amt}` : `+${amt}`}
                  </button>
                );
              })}

              <div className="flex items-center gap-1.5 bg-slate-950 rounded-xl px-3 py-1.5 border border-slate-700">
                <span className="text-xs text-slate-400 font-bold">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-transparent text-center font-black text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Choose Commendation Reason */}
          <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                Commendation Reason &amp; Virtues
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-3">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedReason(r);
                    setCustomReason('');
                  }}
                  className={`btn-hover-scale px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedReason === r && !customReason
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or write a custom commendation reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full max-w-xl px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          {/* AWARD SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn-hover-scale w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 border border-amber-300 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>
                {isNegative ? 'Deduct' : 'Award'}{' '}
                <strong>{isNegative ? `-${pointsAmount}` : `+${pointsAmount}`} Points</strong>{' '}
                {awardTarget === 'house'
                  ? `to ${selectedHouse?.name || 'House'}`
                  : `to Class ${GRADE_LABELS[selectedGrade]} (${targetClassStudents.length} Students)`}
              </span>
            </button>
          </div>
            </>
          )}
        </form>

        {/* RECENT POINT HISTORY DRAWER (Directly below the award button with Instant Undo) */}
        <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
              className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Recent Point History (Last 5 Transactions)</span>
              {isHistoryDrawerOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Accidental entry? Click &quot;Undo&quot; to revert instantly.
            </span>
          </div>

          {isHistoryDrawerOpen && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {recentTransactions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  No point awards recorded yet this session. Award points above to see recent history.
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const houseObj = houses.find((h) => h.id === tx.houseId);
                  const isDemerit = tx.type === 'demerit';
                  const txTime = new Date(tx.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={tx.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Points badge */}
                        <span
                          className={`px-2.5 py-1 rounded-lg font-black text-xs shrink-0 ${
                            isDemerit
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isDemerit ? `-${tx.amount}` : `+${tx.amount}`} pts
                        </span>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                              {tx.studentName}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${houseObj?.color}20`,
                                color: houseObj?.color || '#CBD5E1',
                              }}
                            >
                              {houseObj?.name.replace('House of ', '')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {tx.awardedBy} &bull; {txTime}
                            </span>
                          </div>
                          {tx.reason && (
                            <p className="text-[11px] text-slate-300 italic truncate mt-0.5">
                              &ldquo;{tx.reason}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Instant Undo Button */}
                      {onUndoTransaction && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUndo(
                              tx.id,
                              `${tx.studentName} (${isDemerit ? `-${tx.amount}` : `+${tx.amount}`} pts)`
                            )
                          }
                          className="btn-hover-scale shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all cursor-pointer"
                          title="Undo this transaction and revert points"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                          <span>Undo</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. THE 4 HOUSE CARDS (Dark Theme Container Consistency - No white wrappers!) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
              House Standings Overview
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Click &quot;+ Add Points&quot; on any card to award directly to that house
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {houseTotals.map((item) => {
            const { house, totalPoints, rank, studentMerits, studentDemerits } = item;
            return (
              <div
                key={house.id}
                className="card-hover-lift bg-[#161B22] rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden transition-all text-white"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: house.color }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-xs"
                      style={{ backgroundColor: house.color }}
                    >
                      #{rank} Place
                    </span>
                    {/* High contrast mascot subtitle */}
                    <span className="text-xs text-slate-200 font-bold">
                      {house.mascot}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-white font-['Outfit'] truncate">
                    {house.name}
                  </h4>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-['Outfit'] flex items-baseline gap-1.5">
                    <AnimatedCounter value={totalPoints} />
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs mt-1.5 font-semibold text-slate-300">
                    <span className="text-emerald-400">+{studentMerits}</span>
                    <span>&bull;</span>
                    <span className="text-rose-400">-{studentDemerits}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedHouseId(house.id);
                    setAwardTarget('house');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-hover-scale w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Add Points to {house.name.replace('House of ', '')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
