import React, { useState, useMemo } from 'react';
import {
  Student,
  House,
  CurrentUser,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  PointType,
  PointTransaction,
} from '../types';
import { MERIT_PRESETS, DEMERIT_PRESETS } from '../data/initialData';
import {
  X,
  PlusCircle,
  MinusCircle,
  Users,
  User,
  Search,
  Check,
  CheckCheck,
  Award,
  AlertTriangle,
  Sparkles,
  Info,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  houses: House[];
  currentUser: CurrentUser;
  onAwardPoints: (transactions: Omit<PointTransaction, 'id' | 'timestamp'>[]) => void;
  onOpenLogin: () => void;
  initialSelectedStudentId?: string;
  initialGrade?: GradeLevel;
}

export const AddPointsModal: React.FC<AddPointsModalProps> = ({
  isOpen,
  onClose,
  students,
  houses,
  currentUser,
  onAwardPoints,
  onOpenLogin,
  initialSelectedStudentId,
  initialGrade,
}) => {
  // Tabs: 'class' (pick by class) or 'student' (pick by student)
  const [activeTab, setActiveTab] = useState<'class' | 'student'>(
    initialSelectedStudentId ? 'student' : 'class'
  );

  // Point type: merit (+) or demerit (-)
  const [pointType, setPointType] = useState<PointType>('merit');

  // For Pick by Class
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(initialGrade || 'Grade 3');
  const [selectedStudentIdsInClass, setSelectedStudentIdsInClass] = useState<string[]>([]);

  // For Pick by Student
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialSelectedStudentId ? [initialSelectedStudentId] : []
  );
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterHouse, setFilterHouse] = useState<string>('all');

  // Point details
  const [amount, setAmount] = useState<number>(2);
  const [category, setCategory] = useState<string>('Academic Excellence');
  const [customReason, setCustomReason] = useState<string>('');

  // Fallback teacher name if not logged in
  const teacherName =
    currentUser.teacher?.name || (currentUser.role === 'admin' ? 'Admin Staff' : 'Duty Teacher');

  // Filter students by selected grade for "By Class"
  const studentsInClass = useMemo(() => {
    return students.filter((s) => s.grade === selectedGrade);
  }, [students, selectedGrade]);

  // Synchronize initial selection when grade changes
  React.useEffect(() => {
    if (activeTab === 'class') {
      // By default select all students in the class for convenient awarding
      setSelectedStudentIdsInClass(studentsInClass.map((s) => s.id));
    }
  }, [selectedGrade, studentsInClass, activeTab]);

  // Filter students for "By Student"
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase());
      const matchGrade = filterGrade === 'all' || s.grade === filterGrade;
      const matchHouse = filterHouse === 'all' || s.houseId === filterHouse;
      return matchSearch && matchGrade && matchHouse;
    });
  }, [students, studentSearch, filterGrade, filterHouse]);

  // Toggle student selection in Class tab
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

  // Toggle student selection in Student tab
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const clearAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const handlePresetClick = (presetLabel: string, presetPoints: number) => {
    setCategory(presetLabel);
    setAmount(presetPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetStudentIds = activeTab === 'class' ? selectedStudentIdsInClass : selectedStudentIds;

    if (targetStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }

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
        isClassAward: activeTab === 'class' && targetStudentIds.length > 1,
      };
    });

    onAwardPoints(txs);

    if (pointType === 'merit') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    onClose();
  };

  // Fast check: how many students are currently targeted
  const targetedCount =
    activeTab === 'class' ? selectedStudentIdsInClass.length : selectedStudentIds.length;

  const presets = pointType === 'merit' ? MERIT_PRESETS : DEMERIT_PRESETS;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="add-points-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                pointType === 'merit' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {pointType === 'merit' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit'] leading-tight">
                Award Points &amp; Infractions
              </h2>
              <p className="text-xs text-slate-500">
                Logged as: <strong className="text-slate-800">{teacherName}</strong>
                {currentUser.role === 'public' && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="ml-2 text-indigo-600 hover:underline font-semibold"
                  >
                    (Sign in as Teacher)
                  </button>
                )}
              </p>
            </div>
          </div>

          <button
            id="close-add-points-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Step 1: Mode Selector (By Class vs By Student) */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              1. How would you like to assign points?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                id="mode-class-tab"
                onClick={() => setActiveTab('class')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'class'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Pick by Class (Grade TP-G5)</span>
                <span className="sm:hidden">By Class</span>
              </button>

              <button
                type="button"
                id="mode-student-tab"
                onClick={() => setActiveTab('student')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Pick by Student</span>
                <span className="sm:hidden">By Student</span>
              </button>
            </div>
          </div>

          {/* Step 2: Student / Class Selection Area */}
          {activeTab === 'class' ? (
            /* Pick by Class */
            <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs uppercase font-bold text-slate-600 tracking-wider">
                  Select Grade Level:
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllInClass}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Select All ({studentsInClass.length})
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearAllInClass}
                    className="text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Grade Selector Pills - mobile horizontal scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3 -mx-1 px-1">
                {ALL_GRADES.map((grade) => (
                  <button
                    type="button"
                    key={grade}
                    id={`grade-pill-${grade}`}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                      selectedGrade === grade
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {grade} <span className="font-normal text-[10px] opacity-80">({students.filter((s) => s.grade === grade).length})</span>
                  </button>
                ))}
              </div>

              {/* List of students in selected grade */}
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-2">
                  Students in <strong>{GRADE_LABELS[selectedGrade]}</strong> ({selectedStudentIdsInClass.length} selected):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {studentsInClass.map((student) => {
                    const isChecked = selectedStudentIdsInClass.includes(student.id);
                    const house = houses.find((h) => h.id === student.houseId);
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleStudentInClass(student.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate">
                            {student.name}
                          </span>
                        </div>

                        {house && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                            style={{ backgroundColor: house.color }}
                          >
                            {house.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Pick by Student */
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    id="student-search-input"
                    placeholder="Search student by name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Grade Filter */}
                <select
                  id="filter-grade-select"
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="all">All Grades (TP-G5)</option>
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* House Filter */}
                <select
                  id="filter-house-select"
                  value={filterHouse}
                  onChange={(e) => setFilterHouse(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="all">All Houses</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selection Summary Controls */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing {filteredStudents.length} students &bull;{' '}
                  <strong className="text-indigo-600">{selectedStudentIds.length}</strong> selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Select All Matching
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={clearAllStudents}
                    className="text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  const house = houses.find((h) => h.id === student.houseId);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-semibold truncate">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {student.grade} &bull; {house?.name}
                          </p>
                        </div>
                      </div>

                      {house && (
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: house.color }}
                          title={house.name}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Points Type (Merit (+) vs Demerit (-)) */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              2. Point Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-type-merit"
                onClick={() => {
                  setPointType('merit');
                  setCategory('Academic Excellence');
                  setAmount(3);
                }}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  pointType === 'merit'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold leading-tight">Merits (+ Points)</p>
                  <p className="text-xs text-emerald-700">Add points for positive deeds</p>
                </div>
              </button>

              <button
                type="button"
                id="select-type-demerit"
                onClick={() => {
                  setPointType('demerit');
                  setCategory('Classroom Disruption');
                  setAmount(1);
                }}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  pointType === 'demerit'
                    ? 'border-rose-500 bg-rose-50/60 text-rose-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold leading-tight">Demerits (- Points)</p>
                  <p className="text-xs text-rose-700">Deduct points for infractions</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 4: Category Presets */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              3. Preset Reasons &amp; Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handlePresetClick(p.label, p.points)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    category === p.label
                      ? pointType === 'merit'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="opacity-80 font-bold">
                    ({pointType === 'merit' ? `+${p.points}` : `-${p.points}`})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Amount & Custom Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                Points Amount
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="points-amount-input"
                  min="1"
                  max="100"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
                <span
                  className={`text-lg font-black ${
                    pointType === 'merit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {pointType === 'merit' ? `+${amount}` : `-${amount}`}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                Optional Custom Note / Details
              </label>
              <input
                type="text"
                id="points-custom-reason-input"
                placeholder="e.g. Outstanding presentation in science class..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span>
              Target:{' '}
              <strong className="text-slate-900 font-bold">
                {targetedCount} {targetedCount === 1 ? 'student' : 'students'}
              </strong>
            </span>
            <span className="mx-2 text-slate-300">&bull;</span>
            <span>
              Effect:{' '}
              <strong
                className={pointType === 'merit' ? 'text-emerald-700' : 'text-rose-700'}
              >
                {pointType === 'merit' ? `+${amount * targetedCount}` : `-${amount * targetedCount}`} total house pts
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-award-points-btn"
              onClick={handleSubmit}
              disabled={targetedCount === 0}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
                pointType === 'merit'
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
                  : 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
              }`}
            >
              {pointType === 'merit' ? <Sparkles className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>
                {pointType === 'merit' ? 'Award Merits' : 'Apply Demerits'} ({targetedCount})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
