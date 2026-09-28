import React, { useState, useRef } from 'react';
import { SportsActivityEvent, House, Student, CurrentUser } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  Users,
  Camera,
  Edit2,
  CheckCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Search,
  Maximize2,
  Trash2,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SportsGameCardProps {
  event: SportsActivityEvent;
  houses: House[];
  students: Student[];
  currentUser: CurrentUser;
  onUpdateEventScores: (eventId: string, houseScores: { houseId: string; points: number }[]) => void;
  onToggleEventActive: (eventId: string, isActive: boolean) => void;
  onEditGame: (event: SportsActivityEvent) => void;
  onDeleteGame?: (eventId: string, title: string) => void;
  onUpdateEventImage?: (eventId: string, imageUrl: string) => void;
}

export const SportsGameCard: React.FC<SportsGameCardProps> = ({
  event,
  houses,
  students,
  currentUser,
  onUpdateEventScores,
  onToggleEventActive,
  onEditGame,
  onDeleteGame,
  onUpdateEventImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canEdit = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // State
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [showAllRules, setShowAllRules] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantHouseFilter, setParticipantHouseFilter] = useState<string>('all');
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  // Initialize score inputs
  const startEditingScores = () => {
    const inputs: Record<string, number> = {};
    houses.forEach((h) => {
      const existing = event.scores?.find((s) => s.houseId === h.id);
      inputs[h.id] = existing ? existing.points : 0;
    });
    setScoreInputs(inputs);
    setIsEditingScores(true);
  };

  const handleSaveScores = () => {
    const formatted = Object.entries(scoreInputs).map(([houseId, points]) => ({
      houseId,
      points: Number(points) || 0,
    }));
    onUpdateEventScores(event.id, formatted);
    setIsEditingScores(false);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Quick image upload directly from card
  const handleDirectImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      alert('Image file size exceeds 6MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && onUpdateEventImage) {
        onUpdateEventImage(event.id, e.target.result as string);
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.5 },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Find participating students
  const participatingStudentList = students.filter((s) =>
    event.participatingStudentIds?.includes(s.id)
  );

  // Filter participants
  const filteredParticipants = participatingStudentList.filter((s) => {
    if (participantHouseFilter !== 'all' && s.houseId !== participantHouseFilter) return false;
    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate house distribution among participants
  const participantsByHouse = houses.map((h) => ({
    house: h,
    count: participatingStudentList.filter((s) => s.houseId === h.id).length,
  }));

  // Sort scores descending
  const houseScoreItems = houses
    .map((house) => {
      const scoreObj = event.scores?.find((s) => s.houseId === house.id);
      return {
        house,
        points: scoreObj ? scoreObj.points : 0,
      };
    })
    .sort((a, b) => b.points - a.points);

  const displayedRules = showAllRules ? event.rules || [] : (event.rules || []).slice(0, 3);
  const displayedParticipants = showAllParticipants
    ? filteredParticipants
    : filteredParticipants.slice(0, 8);

  return (
    <article
      id={`game-card-${event.id}`}
      className="bg-[#161B22] rounded-2xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all overflow-hidden flex flex-col text-white"
    >
      {/* 1. CARD HERO IMAGE WITH OVERLAYS */}
      <div className="relative w-full h-52 sm:h-64 bg-slate-900 overflow-hidden group">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950 text-white p-6 text-center">
            <Trophy className="w-12 h-12 text-amber-400 mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-300">Sports Week Game</p>
          </div>
        )}

        {/* Ambient Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                event.isActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-white/20'
              }`}
            >
              {event.isActive ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{event.isActive ? 'LIVE NOW' : 'SCHEDULED'}</span>
            </span>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
              {event.category}
            </span>
          </div>

          {/* Quick Image Upload & Lightbox controls */}
          <div className="flex items-center gap-1.5">
            {event.imageUrl && (
              <button
                type="button"
                onClick={() => setShowFullImageModal(true)}
                className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-colors cursor-pointer"
                title="View full-size photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {canEdit && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDirectImageUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-black/60 hover:bg-black/85 backdrop-blur-xs text-white transition-colors cursor-pointer shadow-xs"
                  title="Upload / Change Game Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload Photo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Hero Overlay Title */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {event.venueCode && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600/90 text-white shadow-xs">
                Venue {event.venueCode}
              </span>
            )}
            {event.groupCategory && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/20 backdrop-blur-xs text-white border border-white/25">
                {event.groupCategory}
              </span>
            )}
            {event.gameType && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/90 text-slate-950">
                {event.gameType}
              </span>
            )}
            {event.targetPlayersCount && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/40 text-slate-200">
                👥 {event.targetPlayersCount} Players
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight drop-shadow-sm line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-slate-200/90 line-clamp-1 mt-0.5">
            {event.description}
          </p>
        </div>
      </div>

      {/* 2. CARD BODY */}
      <div className="p-4 sm:p-6 space-y-5 flex-1">
        {/* WHEN & WHERE HIGHLIGHT BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                When (Date &amp; Time)
              </span>
              <p className="font-bold text-white">{event.date}</p>
              {event.time && (
                <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{event.time}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Where (Location / Venue)
              </span>
              <p className="font-bold text-white leading-snug">
                {event.location || 'Main Athletics Sports Arena & Field'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">All 4 Houses Competing</p>
            </div>
          </div>
        </div>

        {/* 3. THE SCORING SYSTEM */}
        <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-black">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  The Scoring System
                </h4>
                <p className="text-[11px] text-slate-400">
                  Points awarded directly to each house's overall House Cup leaderboard
                </p>
              </div>
            </div>

            {/* Staff Score Editor Button */}
            {canEdit && (
              <div>
                {!isEditingScores ? (
                  <button
                    type="button"
                    onClick={startEditingScores}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Enter / Edit Scores</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveScores}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save Points</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Placement Points Breakdown Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-[#161B22] border border-slate-800 rounded-lg p-2.5 text-center shadow-xs">
              <span className="text-[10px] font-black uppercase text-amber-400 block">
                🥇 1st Place
              </span>
              <span className="text-lg font-black font-['Outfit'] text-white">
                +{event.scoringBreakdown?.firstPlace ?? 150}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>

            <div className="bg-[#161B22] border border-slate-800 rounded-lg p-2.5 text-center shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-300 block">
                🥈 2nd Place
              </span>
              <span className="text-lg font-black font-['Outfit'] text-white">
                +{event.scoringBreakdown?.secondPlace ?? 120}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>

            <div className="bg-[#161B22] border border-slate-800 rounded-lg p-2.5 text-center shadow-xs">
              <span className="text-[10px] font-black uppercase text-amber-500 block">
                🥉 3rd Place
              </span>
              <span className="text-lg font-black font-['Outfit'] text-white">
                +{event.scoringBreakdown?.thirdPlace ?? 95}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>

            <div className="bg-[#161B22] border border-slate-800 rounded-lg p-2.5 text-center shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                🎖️ 4th Place
              </span>
              <span className="text-lg font-black font-['Outfit'] text-white">
                +{event.scoringBreakdown?.fourthPlace ?? 80}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>

          {event.scoringBreakdown?.bonusNotes && (
            <p className="text-[11px] text-amber-300 font-medium bg-amber-950/60 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{event.scoringBreakdown.bonusNotes}</span>
            </p>
          )}

          {/* Current / Live Event Scores */}
          {!isEditingScores ? (
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Live Game Points Earned:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {houseScoreItems.map((item, idx) => (
                  <div
                    key={item.house.id}
                    className="p-2.5 rounded-xl border border-slate-800 bg-[#161B22] flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                        style={{ backgroundColor: item.house.color }}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[80px]">
                        {item.house.name}
                      </span>
                    </div>
                    <span
                      className="text-base font-black font-['Outfit']"
                      style={{ color: item.house.color }}
                    >
                      +{item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Inline Score Input Editor */
            <div className="pt-2 space-y-3 bg-[#161B22] p-3 rounded-xl border border-amber-400/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {houses.map((h) => (
                  <div key={h.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {h.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={scoreInputs[h.id] ?? 0}
                        onChange={(e) =>
                          setScoreInputs({
                            ...scoreInputs,
                            [h.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm font-bold rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setScoreInputs({
                            ...scoreInputs,
                            [h.id]: (scoreInputs[h.id] || 0) + 10,
                          })
                        }
                        className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded text-amber-400 border border-slate-700"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingScores(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveScores}
                  className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                >
                  Save Points
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. THE RULES OF THE GAME */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Rules of the Game ({event.rules?.length || 0})</span>
            </h4>
            {(event.rules?.length || 0) > 3 && (
              <button
                type="button"
                onClick={() => setShowAllRules(!showAllRules)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showAllRules ? 'Show Less' : `View All ${event.rules?.length} Rules`}</span>
                {showAllRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {displayedRules.length > 0 ? (
            <div className="space-y-1.5">
              {displayedRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-900 p-2.5 rounded-lg border border-dashed border-slate-800">
              Standard inter-house sports rules apply.
            </p>
          )}
        </div>

        {/* 5. STUDENTS WHO ARE PARTICIPATING */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>
                  Students Participating ({participatingStudentList.length} Athletes)
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Selected competitors across early years and primary grades
              </p>
            </div>

            {/* Quick house counts breakdown */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {participantsByHouse.map(({ house, count }) => (
                <span
                  key={house.id}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                  style={{ backgroundColor: house.color }}
                  title={`${count} students from ${house.name}`}
                >
                  {house.name.replace('House of ', '')}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Optional Search / House filter when participants count is high */}
          {participatingStudentList.length > 6 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter participating students..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500"
                />
              </div>
              <select
                value={participantHouseFilter}
                onChange={(e) => setParticipantHouseFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
              >
                <option value="all">All Houses</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Participants Grouped by House with Students Names Underneath */}
          {filteredParticipants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {houses.map((h) => {
                const houseStudents = filteredParticipants.filter((s) => s.houseId === h.id);
                const scoreObj = event.scores?.find((s) => s.houseId === h.id);
                const housePts = scoreObj ? scoreObj.points : 0;
                if (houseStudents.length === 0 && participantHouseFilter !== 'all' && participantHouseFilter !== h.id) return null;

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
                        {housePts} pts
                      </span>
                    </div>

                    {/* Students Names Underneath */}
                    <div className="space-y-1">
                      {houseStudents.length > 0 ? (
                        houseStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between text-xs bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80"
                          >
                            <span className="font-extrabold text-white truncate block text-[11px]">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-semibold shrink-0 ml-1">
                              {student.grade}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 italic py-0.5">No registered students</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-lg border border-dashed border-slate-800 text-center">
              {participatingStudentList.length === 0
                ? 'No students assigned yet. Click "Edit Game Card" to select athletes.'
                : 'No participants matched the current filter.'}
            </p>
          )}

          {filteredParticipants.length > 8 && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllParticipants(!showAllParticipants)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {showAllParticipants
                    ? 'Show Fewer'
                    : `+ Show All ${filteredParticipants.length} Participating Students`}
                </span>
                {showAllParticipants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. CARD FOOTER CONTROLS */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onToggleEventActive(event.id, !event.isActive)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                event.isActive
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
              }`}
            >
              {event.isActive ? 'Conclude / Archive' : 'Activate Live'}
            </button>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditGame(event)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Game Card</span>
            </button>

            {onDeleteGame && (
              <button
                type="button"
                onClick={() => onDeleteGame(event.id, event.title)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                title="Delete this game"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {showFullImageModal && event.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullImageModal(false)}
        >
          <div className="max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between text-white">
              <div>
                <h4 className="font-bold text-base">{event.title}</h4>
                <p className="text-xs text-slate-300">{event.location} &bull; {event.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullImageModal(false)}
                className="px-4 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
