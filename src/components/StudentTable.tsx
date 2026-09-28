import React, { useState, useMemo } from 'react';
import { Student, House, GradeLevel, ALL_GRADES, CurrentUser } from '../types';
import { StudentPointSummary } from '../utils/storage';
import {
  Search,
  Users,
  Filter,
  ArrowUpDown,
  History,
  PlusCircle,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  LayoutGrid,
  List,
} from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  houses: House[];
  studentSummaries: Record<string, StudentPointSummary>;
  currentUser: CurrentUser;
  onOpenStudentHistory: (studentId: string) => void;
  onQuickAwardStudent?: (studentId: string) => void;
  selectedHouseId?: string;
  onSelectHouseFilter?: (houseId: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  houses,
  studentSummaries,
  currentUser,
  onOpenStudentHistory,
  onQuickAwardStudent,
  selectedHouseId = 'all',
  onSelectHouseFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'points_desc' | 'points_asc' | 'name_asc' | 'grade'>('points_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const pageSize = 15;

  const canAward = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let list = students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
      const matchesHouse = selectedHouseId === 'all' || s.houseId === selectedHouseId;
      return matchesSearch && matchesGrade && matchesHouse;
    });

    list.sort((a, b) => {
      const summaryA = studentSummaries[a.id] || { netPoints: 0, merits: 0, demerits: 0 };
      const summaryB = studentSummaries[b.id] || { netPoints: 0, merits: 0, demerits: 0 };

      if (sortBy === 'points_desc') {
        return summaryB.netPoints - summaryA.netPoints;
      } else if (sortBy === 'points_asc') {
        return summaryA.netPoints - summaryB.netPoints;
      } else if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'grade') {
        return ALL_GRADES.indexOf(a.grade) - ALL_GRADES.indexOf(b.grade);
      }
      return 0;
    });

    return list;
  }, [students, searchTerm, selectedGrade, selectedHouseId, sortBy, studentSummaries]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedStudents.slice(start, start + pageSize);
  }, [filteredAndSortedStudents, currentPage, pageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade, selectedHouseId, sortBy]);

  return (
    <section className="bg-[#161B22] rounded-2xl border border-slate-800 shadow-xl p-3.5 sm:p-7 text-white">
      {/* Table Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Individual Student Points
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse all student merits, demerits, and net contributions from TP through Grade 5.
          </p>
        </div>

        {/* Search bar & Mobile layout toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
            <input
              type="text"
              id="table-student-search"
              placeholder="Search student by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 sm:top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile view toggle (cards vs table) */}
          <div className="sm:hidden flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`p-1.5 rounded-md ${
                mobileViewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`p-1.5 rounded-md ${
                mobileViewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bars - with mobile horizontal scroll */}
      <div className="py-3 space-y-2.5">
        {/* Grade Filters */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <span className="font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Grade:
          </span>
          <button
            id="filter-grade-all"
            onClick={() => setSelectedGrade('all')}
            className={`btn-hover-scale px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap shrink-0 transition-all ${
              selectedGrade === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            All Grades
          </button>
          {ALL_GRADES.map((grade) => (
            <button
              key={grade}
              id={`filter-grade-btn-${grade}`}
              onClick={() => setSelectedGrade(grade)}
              className={`btn-hover-scale px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap shrink-0 transition-all ${
                selectedGrade === grade
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* House Filters & Sort Select */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Shield className="w-3 h-3" /> House:
            </span>
            <button
              id="filter-house-all"
              onClick={() => onSelectHouseFilter && onSelectHouseFilter('all')}
              className={`btn-hover-scale px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap shrink-0 transition-all ${
                selectedHouseId === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Houses
            </button>
            {houses.map((h) => (
              <button
                key={h.id}
                id={`filter-house-btn-${h.id}`}
                onClick={() => onSelectHouseFilter && onSelectHouseFilter(h.id)}
                className={`btn-hover-scale px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  selectedHouseId === h.id
                    ? 'text-white shadow-xs ring-2 ring-white/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
                style={{
                  backgroundColor: selectedHouseId === h.id ? h.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: h.color }}
                />
                <span>{h.name}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              id="table-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 focus:outline-hidden"
            >
              <option value="points_desc">Highest Points</option>
              <option value="points_asc">Lowest Points</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="grade">Grade (TP &rarr; G5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards View (Phones - default) */}
      <div className={`space-y-2.5 ${mobileViewMode === 'cards' ? 'block sm:hidden' : 'hidden'}`}>
        {paginatedStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No students found matching your search or filters.
          </div>
        ) : (
          paginatedStudents.map((student, idx) => {
            const globalRank = (currentPage - 1) * pageSize + idx + 1;
            const summary = studentSummaries[student.id] || {
              merits: 0,
              demerits: 0,
              netPoints: 0,
              transactionCount: 0,
            };
            const house = houses.find((h) => h.id === student.houseId);

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-colors"
              >
                {/* Top Row: Rank, Avatar, Name, Grade & House */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">
                      #{globalRank}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: house?.color || '#64748B' }}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm truncate">
                          {student.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {student.grade}
                        </span>
                        {student.isPrefect && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            Prefect
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {house && (
                          <span
                            className="inline-block text-[10px] font-semibold text-white px-1.5 py-0.2 rounded-sm"
                            style={{ backgroundColor: house.color }}
                          >
                            {house.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Net Points display */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-lg font-black font-['Outfit'] ${
                        summary.netPoints >= 0 ? 'text-white' : 'text-rose-400'
                      }`}
                    >
                      {summary.netPoints} <span className="text-[10px] font-bold text-slate-400">pts</span>
                    </div>
                    <div className="text-[10px] font-semibold flex items-center justify-end gap-1">
                      <span className="text-emerald-400">+{summary.merits}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-rose-400">-{summary.demerits}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Action Buttons */}
                <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenStudentHistory(student.id)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Log ({summary.transactionCount})</span>
                  </button>

                  {canAward && onQuickAwardStudent && (
                    <button
                      onClick={() => onQuickAwardStudent(student.id)}
                      className="flex-1 py-1.5 px-2 text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+ Award</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Full Table (Desktop / Tablet, or toggled on mobile) */}
      <div className={`overflow-x-auto rounded-xl border border-slate-800 ${mobileViewMode === 'table' ? 'block' : 'hidden sm:block'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-3">Grade</th>
              <th className="py-3 px-4">House</th>
              <th className="py-3 px-3 text-right">Merits</th>
              <th className="py-3 px-3 text-right">Demerits</th>
              <th className="py-3 px-4 text-right">Net Points</th>
              <th className="py-3 px-4 text-center">History / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No students found matching your search or filters.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, idx) => {
                const globalRank = (currentPage - 1) * pageSize + idx + 1;
                const summary = studentSummaries[student.id] || {
                  merits: 0,
                  demerits: 0,
                  netPoints: 0,
                  transactionCount: 0,
                };
                const house = houses.find((h) => h.id === student.houseId);

                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-bold text-slate-500 group-hover:text-slate-300">
                      {globalRank}
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: house?.color || '#64748B' }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{student.name}</span>
                            {student.isPrefect && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                                Prefect
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {student.grade}
                      </span>
                    </td>

                    {/* House */}
                    <td className="py-3 px-4">
                      {house ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                          style={{ backgroundColor: house.color }}
                        >
                          <span className="truncate">{house.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* Merits */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      +{summary.merits}
                    </td>

                    {/* Demerits */}
                    <td className="py-3 px-3 text-right font-bold text-rose-400">
                      {summary.demerits > 0 ? `-${summary.demerits}` : '0'}
                    </td>

                    {/* Net Points */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-sm sm:text-base font-black font-['Outfit'] ${
                          summary.netPoints >= 0 ? 'text-white' : 'text-rose-400'
                        }`}
                      >
                        {summary.netPoints}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`view-history-${student.id}`}
                          onClick={() => onOpenStudentHistory(student.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="View points log"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Log ({summary.transactionCount})</span>
                        </button>

                        {canAward && onQuickAwardStudent && (
                          <button
                            id={`quick-award-${student.id}`}
                            onClick={() => onQuickAwardStudent(student.id)}
                            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-950/50 rounded-md transition-colors cursor-pointer"
                            title="Award points to this student"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Award</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Showing{' '}
          <strong className="text-white">
            {filteredAndSortedStudents.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-white">
            {Math.min(currentPage * pageSize, filteredAndSortedStudents.length)}
          </strong>{' '}
          of <strong className="text-white">{filteredAndSortedStudents.length}</strong> students
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
