import React, { useState, useRef, useMemo } from 'react';
import {
  SportsActivityEvent,
  House,
  Student,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  ParticipatingStudentWithRole,
} from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  Users,
  Plus,
  Trash2,
  Check,
  Search,
  Sparkles,
  Flame,
  Radio,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditSportsGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SportsActivityEvent | null; // null for creating a new game
  houses: House[];
  students: Student[];
  onSave: (savedEvent: SportsActivityEvent) => void;
}

// Built-in high-quality sports presets for instant selection
const SPORTS_IMAGE_PRESETS = [
  {
    label: 'Track & Sprint Relay',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Tug-of-War & Strength',
    url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Swimming Gala Freestyle',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'House Trivia & Quiz Bowl',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Obstacle Course & Pitch',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'House Spirit & Rally',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
  },
];

const PRESET_ROLES = ['Anchor', 'Lead', 'Relay Runner', 'Competitor', 'Strategist', 'Team Member'];

export const EditSportsGameModal: React.FC<EditSportsGameModalProps> = ({
  isOpen,
  onClose,
  event,
  houses,
  students,
  onSave,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Basic Fields
  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<string>(event?.category || 'Athletics');
  const [description, setDescription] = useState(
    event?.description || 'Official inter-house championship event.'
  );
  const [date, setDate] = useState(event?.date || '2026-02-23');
  const [time, setTime] = useState(event?.time || '10:30 AM');
  const [location, setLocation] = useState(event?.location || 'Central Field');

  // 2. Points Breakdown (1st-4th place points + bonus)
  const [firstPlace, setFirstPlace] = useState<number>(event?.scoringBreakdown?.firstPlace ?? 75);
  const [secondPlace, setSecondPlace] = useState<number>(event?.scoringBreakdown?.secondPlace ?? 50);
  const [thirdPlace, setThirdPlace] = useState<number>(event?.scoringBreakdown?.thirdPlace ?? 30);
  const [fourthPlace, setFourthPlace] = useState<number>(event?.scoringBreakdown?.fourthPlace ?? 15);
  const [bonusNotes, setBonusNotes] = useState(
    event?.scoringBreakdown?.bonusNotes || '+15 Fair Play & Outstanding Team Spirit'
  );

  // 3. Rules list
  const [rules, setRules] = useState<string[]>(
    event?.rules && event.rules.length > 0
      ? [...event.rules]
      : [
          'Mixed-gender representation required from enrolled grade divisions.',
          'Event begins strictly upon referee signal; proper sportsmanship enforced at all times.',
          'Official placements determine points added directly into Society of Houses Cup standings.',
        ]
  );
  const [newRuleInput, setNewRuleInput] = useState('');

  // 4. Image
  const [imageUrl, setImageUrl] = useState<string>(
    event?.imageUrl || SPORTS_IMAGE_PRESETS[0].url
  );

  // 5. Active / Live state
  const [isActive, setIsActive] = useState<boolean>(event?.isActive ?? true);

  // 6. Participating Student Enrollment per House
  // Map of studentId -> role
  const [enrolledStudentRoles, setEnrolledStudentRoles] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (event?.participatingStudentsWithRoles) {
      event.participatingStudentsWithRoles.forEach((p) => {
        if (p.studentId) map[p.studentId] = p.role || 'Competitor';
      });
    }
    if (event?.participatingStudentIds) {
      event.participatingStudentIds.forEach((id) => {
        if (!map[id]) map[id] = 'Competitor';
      });
    }
    return map;
  });

  const [activeHouseTab, setActiveHouseTab] = useState<string>(houses[0]?.id || 'house-earthshakers');
  const [studentSearch, setStudentSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Enrolled IDs list
  const participatingIds = useMemo(() => Object.keys(enrolledStudentRoles), [enrolledStudentRoles]);

  // Handle enrollment toggle
  const toggleEnrollStudent = (studentId: string, defaultRole: string = 'Competitor') => {
    setEnrolledStudentRoles((prev) => {
      const copy = { ...prev };
      if (copy[studentId]) {
        delete copy[studentId];
      } else {
        copy[studentId] = defaultRole;
      }
      return copy;
    });
  };

  const setStudentRole = (studentId: string, role: string) => {
    setEnrolledStudentRoles((prev) => ({
      ...prev,
      [studentId]: role,
    }));
  };

  // Rule management
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Handle image upload from computer
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save handler (with option to push live immediately)
  const handleFormSave = (pushLiveNow?: boolean) => {
    if (!title.trim()) {
      alert('Please enter an Event Name.');
      return;
    }

    const liveStatus = pushLiveNow !== undefined ? pushLiveNow : isActive;

    const scoringSummary = `1st: ${firstPlace} pts | 2nd: ${secondPlace} pts | 3rd: ${thirdPlace} pts | 4th: ${fourthPlace} pts`;

    // Retain existing scores or initialize with 0 for each house
    const existingScores =
      event?.scores && event.scores.length > 0
        ? event.scores
        : houses.map((h, i) => ({
            houseId: h.id,
            points: 0,
            placement: (i + 1) as 1 | 2 | 3 | 4,
          }));

    // Build complete participatingStudentsWithRoles roster
    const finalRolesRoster: ParticipatingStudentWithRole[] = [];

    // Map enrolled IDs to full objects
    participatingIds.forEach((sId) => {
      const st = students.find((s) => s.id === sId);
      if (st) {
        const h = houses.find((house) => house.id === st.houseId);
        finalRolesRoster.push({
          studentId: st.id,
          student_name: st.name,
          house: h?.name.replace('House of ', '') || 'House',
          role: enrolledStudentRoles[sId] || 'Competitor',
        });
      }
    });

    // If event had custom demo athletes not in student table, preserve them
    if (event?.participatingStudentsWithRoles) {
      event.participatingStudentsWithRoles.forEach((p) => {
        if (!finalRolesRoster.some((r) => r.student_name === p.student_name)) {
          finalRolesRoster.push(p);
        }
      });
    }

    const saved: SportsActivityEvent = {
      id: event?.id || `sports-game-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Athletics',
      description: description.trim() || 'Official inter-house championship event.',
      date: date.trim() || '2026-02-23',
      time: time.trim() || '10:30 AM',
      location: location.trim() || 'Central Field',
      participatingStudentIds: participatingIds,
      participatingStudentsWithRoles: finalRolesRoster,
      scoringSystem: scoringSummary,
      scoringBreakdown: {
        firstPlace,
        secondPlace,
        thirdPlace,
        fourthPlace,
        bonusNotes: bonusNotes.trim(),
      },
      rules: rules.filter((r) => r.trim().length > 0),
      imageUrl: imageUrl.trim() || SPORTS_IMAGE_PRESETS[0].url,
      isActive: liveStatus,
      scores: existingScores,
      notes: event?.notes,
    };

    if (liveStatus) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    }

    onSave(saved);
    onClose();
  };

  // Filter students for the active house tab
  const activeHouse = houses.find((h) => h.id === activeHouseTab) || houses[0];
  const activeHouseStudents = students.filter((s) => s.houseId === activeHouse?.id);

  const filteredHouseStudents = activeHouseStudents.filter((s) => {
    if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      return s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                  Admin Game Card Creator &amp; Editor
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Official Game Card
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure Event Name, Category, Location, Scheduled Time, Points Breakdown, and House Rosters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* SECTION 1: Core Event Details (Name, Category, Location, Date & Time) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                1. Core Event Information
              </span>
              <span className="text-[11px] text-slate-400">Renders on Game Cards and Newsletter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tug of War Championship, Sprint Relays..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-medium"
                >
                  <option value="Athletics">Athletics &amp; Track</option>
                  <option value="Strength">Strength &amp; Tug of War</option>
                  <option value="Swimming Gala">Swimming Gala</option>
                  <option value="Academics">Academics &amp; Quiz Bowl</option>
                  <option value="Sports Week">General Sports Week</option>
                  <option value="Spirit Week">Spirit Week &amp; Cheer</option>
                  <option value="Obstacle Course">Obstacle Course &amp; Field</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Location / Venue
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Central Field, Main Track, Aquatics Center..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Scheduled Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. 2026-02-23"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. 10:30 AM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Event Brief / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of matchup format, objectives, and division expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Points Breakdown (1st - 4th Place Points & Bonus) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                2. Points Breakdown (1st through 4th Place)
              </span>
              <span className="text-[11px] text-slate-400">Awarded to house totals upon placement</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 space-y-1">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <span>🥇</span>
                  <span>1st Place</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={firstPlace}
                    onChange={(e) => setFirstPlace(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-base font-black bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-mono"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-300/30 rounded-xl p-3 space-y-1">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                  <span>🥈</span>
                  <span>2nd Place</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={secondPlace}
                    onChange={(e) => setSecondPlace(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-base font-black bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-700/30 rounded-xl p-3 space-y-1">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <span>🥉</span>
                  <span>3rd Place</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={thirdPlace}
                    onChange={(e) => setThirdPlace(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-base font-black bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-mono"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-3 space-y-1">
                <span className="text-xs font-black text-indigo-300 flex items-center gap-1">
                  <span>🎖️</span>
                  <span>4th Place</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={fourthPlace}
                    onChange={(e) => setFourthPlace(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-base font-black bg-slate-950 border border-slate-800 rounded-lg text-indigo-300 font-mono"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Bonus &amp; Fair Play Scoring Notes
              </label>
              <input
                type="text"
                placeholder="e.g. +15 Bonus points awarded for outstanding House chant & team spirit"
                value={bonusNotes}
                onChange={(e) => setBonusNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* SECTION 3: Participating Student Enrollment per House */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  3. Participating Student Enrollment per House
                </span>
                <p className="text-[11px] text-slate-400">
                  Total Enrolled: <strong className="text-white">{participatingIds.length} Athletes</strong> across 4 houses. Grouped by House &amp; Grade in the Card.
                </p>
              </div>

              {/* Grade Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 w-36 sm:w-44 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  <option value="all">All Grades</option>
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 House Enrollment Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {houses.map((h) => {
                const houseEnrolledCount = activeHouseStudents
                  .filter((s) => s.houseId === h.id)
                  .filter((s) => participatingIds.includes(s.id)).length;
                const isSelected = activeHouseTab === h.id;

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveHouseTab(h.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 text-left">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="text-xs font-black text-white truncate">
                        {h.name.replace('House of ', '')}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        houseEnrolledCount > 0
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {houseEnrolledCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Students List for Active House */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeHouse?.color }}
                  />
                  <span>
                    Select athletes from <strong>{activeHouse?.name}</strong> to enroll in this game card:
                  </span>
                </span>
                <span className="text-[11px]">
                  Showing {filteredHouseStudents.length} students
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800 p-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredHouseStudents.map((st) => {
                  const isEnrolled = !!enrolledStudentRoles[st.id];
                  const currentRole = enrolledStudentRoles[st.id] || 'Competitor';

                  return (
                    <div
                      key={st.id}
                      className={`p-2 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
                        isEnrolled
                          ? 'bg-slate-900 border-amber-400/70 shadow-xs'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isEnrolled}
                            onChange={() => toggleEnrollStudent(st.id)}
                            className="rounded text-amber-400 focus:ring-amber-400 w-3.5 h-3.5 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate text-xs">
                              {st.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{st.grade}</span>
                          </div>
                        </label>

                        {isEnrolled && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Role Selector when enrolled */}
                      {isEnrolled && (
                        <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Role:</span>
                          <select
                            value={currentRole}
                            onChange={(e) => setStudentRole(st.id, e.target.value)}
                            className="text-[10px] font-bold bg-slate-950 border border-slate-700 text-amber-300 rounded px-1.5 py-0.5"
                          >
                            {PRESET_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredHouseStudents.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs text-slate-500">
                    No students found matching current filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Game Rules & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rules */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Official Rules ({rules.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-slate-200 text-[11px] truncate">{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Add game rule..."
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                  className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Cover Image Preset Picker */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Game Card Photo / Image
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-amber-300 font-bold hover:underline"
                >
                  Upload File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />

              <div className="grid grid-cols-3 gap-1.5">
                {SPORTS_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`rounded-lg overflow-hidden border aspect-video relative group transition-all ${
                      imageUrl === p.url
                        ? 'border-amber-400 ring-2 ring-amber-400/50'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-bold text-white px-1 py-0.5 truncate text-center">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: "Push Live" / Instant Activation & Save Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span>Mark as Live Event Now</span>
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleFormSave(false)}
              className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save as Scheduled
            </button>

            {/* Primary Action: Push Live & Instantly Render */}
            <button
              type="button"
              id="admin-push-live-btn"
              onClick={() => handleFormSave(true)}
              className="btn-hover-scale px-5 py-2 text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-slate-950" />
              <span>Push Event Live Instantly &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
