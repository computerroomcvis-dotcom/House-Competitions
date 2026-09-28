import React, { useState, useMemo } from 'react';
import { Student, House, PointTransaction, CurrentUser } from '../types';
import {
  Award,
  Users,
  User,
  PlusCircle,
  MinusCircle,
  Search,
  CheckCircle2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdvancedAwardViewProps {
  students: Student[];
  houses: House[];
  currentUser: CurrentUser;
  onAwardPoints: (transactions: Omit<PointTransaction, 'id' | 'timestamp'>[]) => void;
}

const ALL_GRADES = ['TP', 'PK-3', 'PK-4', 'GK', 'G1', 'G2', 'G3', 'G4', 'G5'] as const;
const GRADE_LABELS: Record<string, string> = {
  TP: 'TP (Toddler Play)',
  'PK-3': 'PK-3 (Pre-K 3)',
  'PK-4': 'PK-4 (Pre-K 4)',
  GK: 'GK (Kindergarten)',
  G1: 'Grade 1',
  G2: 'Grade 2',
  G3: 'Grade 3',
  G4: 'Grade 4',
  G5: 'Grade 5',
};

const MERIT_PRESETS = [
  { label: 'Exemplary Homework & Diligence', points: 5 },
  { label: 'High Assessment Score', points: 10 },
  { label: 'Active Subject Participation', points: 3 },
  { label: 'Peer Tutoring & Helping Others', points: 5 },
  { label: 'Exceptional Kindness & Empathy', points: 5 },
  { label: 'Integrity & Honesty', points: 10 },
  { label: 'Sportsmanship & Team Fair Play', points: 5 },
  { label: 'Sports Event 1st Place Victory', points: 20 },
  { label: 'Sports Event 2nd Place Achievement', points: 15 },
  { label: 'House Spirit & Enthusiastic Cheering', points: 5 },
  { label: 'Campus Environmental Stewardship', points: 5 },
  { label: 'Leadership in Group Activity', points: 10 },
];

const DEMERIT_PRESETS = [
  { label: 'Missing / Late Homework', points: 2 },
  { label: 'Classroom Disruption / Off-task', points: 3 },
  { label: 'Unprepared for Lesson', points: 1 },
  { label: 'Disrespectful Language / Attitude', points: 5 },
  { label: 'Poor Sportsmanship / Arguing', points: 5 },
  { label: 'Littering Campus Grounds', points: 2 },
  { label: 'Late to Class without pass', points: 1 },
  { label: 'Inappropriate Uniform Violation', points: 1 },
];

export const AdvancedAwardView: React.FC<AdvancedAwardViewProps> = ({
  students,
  houses,
  currentUser,
  onAwardPoints,
}) => {
  // Mode: award entire class or multi-select individual students
  const [mode, setMode] = useState<'class' | 'student'>('class');

  // Class mode selection
  const [selectedGrade, setSelectedGrade] = useState<string>('PK-4');
  const [selectedStudentIdsInClass, setSelectedStudentIdsInClass] = useState<string[]>([]);

  // Multi-student mode selection
  const [studentSearch, setStudentSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterHouse, setFilterHouse] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Award details
  const [pointType, setPointType] = useState<'merit' | 'demerit'>('merit');
  const [amount, setAmount] = useState<number>(5);
  const [category, setCategory] = useState<string>('Exemplary Homework & Diligence');
  const [customReason, setCustomReason] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Derived students in class
  const studentsInClass = useMemo(() => {
    return students.filter((s) => s.grade === selectedGrade);
  }, [students, selectedGrade]);

  // Keep selection synced when grade changes
  React.useEffect(() => {
    setSelectedStudentIdsInClass(studentsInClass.map((s) => s.id));
  }, [selectedGrade, studentsInClass]);

  // Toggle single student in class
  const toggleStudentInClass = (id: string) => {
    setSelectedStudentIdsInClass((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllInClass = () => {
    setSelectedStudentIdsInClass(studentsInClass.map((s) => s.id));
  };

  const clearAllInClass = () => {
    setSelectedStudentIdsInClass([]);
  };

  // Filtered students for multi-student pick
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterGrade !== 'all' && s.grade !== filterGrade) return false;
      if (filterHouse !== 'all' && s.houseId !== filterHouse) return false;
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, filterGrade, filterHouse, studentSearch]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Preset Click
  const handlePresetClick = (presetLabel: string, presetPoints: number) => {
    setCategory(presetLabel);
    setAmount(presetPoints);
  };

  // Submit award
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetStudentIds = mode === 'class' ? selectedStudentIdsInClass : selectedStudentIds;

    if (targetStudentIds.length === 0) {
      alert('Please select at least one student to award points.');
      return;
    }

    const teacherName =
      currentUser.teacher?.name ||
      currentUser.adminUser?.name ||
      'Faculty Member';

    if (amount <= 0) {
      alert('Please enter a valid point amount (greater than 0).');
      return;
    }

    const txs: Omit<PointTransaction, 'id' | 'timestamp'>[] = targetStudentIds.map((id) => {
      const student = students.find((s) => s.id === id)!;
      return {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        houseId: student.houseId,
        type: pointType,
        amount,
        category,
        reason: customReason.trim() || undefined,
        awardedBy: teacherName,
        awardedByEmail: currentUser.teacher?.email,
        isClassAward: mode === 'class' && targetStudentIds.length > 1,
      };
    });

    onAwardPoints(txs);

    if (pointType === 'merit') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#12B76A', '#F76808', '#2E90FA', '#7A5AF8', '#F59E0B'],
      });
    }

    const countText = `${targetStudentIds.length} student${targetStudentIds.length > 1 ? 's' : ''}`;
    setSuccessToast(
      `Awarded ${pointType === 'merit' ? `+${amount}` : `-${amount}`} points to ${countText} for "${category}"!`
    );

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);

    if (mode === 'student') {
      setSelectedStudentIds([]);
    }
    setCustomReason('');
  };

  const currentPresets = pointType === 'merit' ? MERIT_PRESETS : DEMERIT_PRESETS;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white font-['Outfit'] tracking-tight">
              Advanced Point Awarding
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Award points to an entire class simultaneously or multi-select individual students across grades.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('class')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'class'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Award by Class</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'student'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Multi-Student Pick</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student / Class Selection (7 cols) */}
        <div className="lg:col-span-7 bg-[#161B22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-white">
          {mode === 'class' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Grade Level (Class)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedGrade === g
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {GRADE_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Students in Selected Grade */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    Students in {GRADE_LABELS[selectedGrade]} ({selectedStudentIdsInClass.length}/{studentsInClass.length} selected)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllInClass}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">&bull;</span>
                    <button
                      type="button"
                      onClick={clearAllInClass}
                      className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-900/80">
                  {studentsInClass.map((student) => {
                    const house = houses.find((h) => h.id === student.houseId);
                    const isSelected = selectedStudentIdsInClass.includes(student.id);

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudentInClass(student.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white text-xs truncate">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: house?.color || '#94a3b8' }}
                            />
                            <span className="text-[10px] text-slate-400 truncate">
                              {house?.name || 'House'}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Multi-Student Search & Filters */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Search &amp; Pick Students ({selectedStudentIds.length} selected)
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                  >
                    <option value="all">All Grades</option>
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {GRADE_LABELS[g]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterHouse}
                    onChange={(e) => setFilterHouse(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                  >
                    <option value="all">All Houses</option>
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtered Student List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-900/80">
                  {filteredStudents.slice(0, 40).map((student) => {
                    const house = houses.find((h) => h.id === student.houseId);
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white text-xs truncate">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {student.grade} &bull; {house?.name}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Points, Category & Submission (5 cols) */}
        <div className="lg:col-span-5 bg-[#161B22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-white">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Point Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPointType('merit')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  pointType === 'merit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Merit (Positive)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointType('demerit')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  pointType === 'demerit'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>- Demerit (Correction)</span>
              </button>
            </div>
          </div>

          {/* Amount Counter */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              3. Point Amount
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    amount === val
                      ? pointType === 'merit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pointType === 'merit' ? `+${val}` : `-${val}`}
                </button>
              ))}
            </div>
          </div>

          {/* Presets Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              4. Category &amp; Preset
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {currentPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetClick(p.label, p.points)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                    category === p.label
                      ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {p.label} ({pointType === 'merit' ? `+${p.points}` : `-${p.points}`})
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              5. Custom Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Science fair presentation, helping a peer..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn-hover-scale w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-white shadow-md transition-all cursor-pointer ${
              pointType === 'merit'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
            }`}
          >
            {pointType === 'merit' ? '✨ Award Merits' : '⚠️ Issue Demerits'} Now
          </button>
        </div>
      </form>
    </div>
  );
};
