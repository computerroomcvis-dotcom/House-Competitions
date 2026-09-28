import React, { useState } from 'react';
import { House, Student, SportsActivityEvent } from '../types';
import { HouseTotalSummary, StudentPointSummary } from '../utils/storage';
import {
  Trophy,
  Crown,
  Search,
  Users,
  Sparkles,
  Heart,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ViewerModeViewProps {
  houses: House[];
  students: Student[];
  houseTotals: HouseTotalSummary[];
  studentSummaries: Record<string, StudentPointSummary>;
  sportsEvents: SportsActivityEvent[];
  onLoginTeacher?: () => void;
  onLoginAdmin?: () => void;
}

export const ViewerModeView: React.FC<ViewerModeViewProps> = ({
  houses,
  students,
  houseTotals,
  studentSummaries,
  sportsEvents,
  onLoginTeacher,
  onLoginAdmin,
}) => {
  const [parentSearch, setParentSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');

  const leader = houseTotals[0];
  const second = houseTotals[1];
  const third = houseTotals[2];
  const fourth = houseTotals[3];

  const totalPoints = houseTotals.reduce((acc, curr) => acc + curr.totalPoints, 0);

  // Search filter for parents finding their child
  const matchingStudents = students.filter((s) => {
    if (!parentSearch.trim() && selectedGrade === 'all') return false;
    const matchesName = parentSearch.trim()
      ? s.name.toLowerCase().includes(parentSearch.toLowerCase().trim())
      : true;
    const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    return matchesName && matchesGrade;
  }).slice(0, 10);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#2563EB', '#DC2626', '#D97706', '#059669', '#F59E0B'],
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. FRIENDLY PARENT & GUARDIAN WELCOME BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Parent &amp; Guardian Viewer Mode</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white mb-2">
              Crestview House Cup Standings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Welcome! Students earn points for positive behavior, good deeds, sportsmanship, and teamwork. All points add directly to their House total!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={triggerCelebrate}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrate Leader</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FIND MY CHILD'S POINTS (Simple & Basic for Parents) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
              Find Your Child&apos;s House &amp; Points
            </h2>
            <p className="text-xs text-slate-500">
              Type your child&apos;s name or filter by grade level to see their house and merits
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Type student name (e.g., Liam, Emma, Mason)..."
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="all">All Grades (TP – G5)</option>
            <option value="Transition Primary">Transition Primary</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
          </select>
        </div>

        {/* Search Results */}
        {matchingStudents.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">Matching Students:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {matchingStudents.map((st) => {
                const house = houses.find((h) => h.id === st.houseId);
                const summary = studentSummaries[st.id] || { netPoints: 0, merits: 0, demerits: 0 };
                return (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: house?.color || '#64748B' }}
                      >
                        {st.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {st.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {st.grade} &bull;{' '}
                          <strong style={{ color: house?.color }}>{house?.name}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900 font-['Outfit'] block">
                        {summary.netPoints} pts
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        +{summary.merits} merits
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. STEPPED PODIUM (1st, 2nd, 3rd, 4th) - Simple visual */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">
              Official Stepped Podium
            </h2>
            <p className="text-xs text-slate-500">Live points across all primary students</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Total School: {totalPoints} pts
          </span>
        </div>

        {/* Podium Visualization */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 pt-8 pb-2 max-w-3xl mx-auto">
          {/* 2nd Place */}
          {second && (
            <div className="flex-1 max-w-[140px] sm:max-w-[180px] flex flex-col items-center order-1">
              <span className="text-lg sm:text-2xl mb-1">🥈</span>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm text-center truncate w-full">
                {second.house.name}
              </h3>
              <p className="text-xs font-black text-slate-700 mb-2">{second.totalPoints} pts</p>

              <div
                className="w-full h-28 sm:h-36 rounded-t-2xl p-2 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: second.house.color }}
              >
                <span className="font-black text-xl font-['Outfit']">2ND</span>
                <span className="text-[10px] font-medium">{second.house.mascot}</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {leader && (
            <div className="flex-1 max-w-[160px] sm:max-w-[210px] flex flex-col items-center order-2 -mt-4 sm:-mt-6">
              <Crown className="w-6 h-6 text-amber-500 mb-1 animate-bounce" />
              <h3 className="font-black text-amber-600 text-xs sm:text-base text-center truncate w-full">
                {leader.house.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-600 mb-2">
                {leader.totalPoints} pts
              </p>

              <div
                className="w-full h-36 sm:h-48 rounded-t-2xl p-3 flex flex-col items-center justify-between text-white shadow-lg relative"
                style={{ backgroundColor: leader.house.color }}
              >
                <span className="font-black text-2xl sm:text-3xl font-['Outfit']">1ST</span>
                <div className="text-center">
                  <p className="text-[11px] font-extrabold">Champions</p>
                  <p className="text-[10px] opacity-90">{leader.house.mascot}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex-1 max-w-[140px] sm:max-w-[180px] flex flex-col items-center order-3">
              <span className="text-lg sm:text-2xl mb-1">🥉</span>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm text-center truncate w-full">
                {third.house.name}
              </h3>
              <p className="text-xs font-black text-slate-700 mb-2">{third.totalPoints} pts</p>

              <div
                className="w-full h-22 sm:h-28 rounded-t-2xl p-2 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: third.house.color }}
              >
                <span className="font-black text-lg font-['Outfit']">3RD</span>
                <span className="text-[10px] font-medium">{third.house.mascot}</span>
              </div>
            </div>
          )}

          {/* 4th Place */}
          {fourth && (
            <div className="flex-1 max-w-[120px] sm:max-w-[160px] flex flex-col items-center order-4">
              <span className="text-sm sm:text-base font-bold text-slate-400 mb-1">4th</span>
              <h3 className="font-bold text-slate-800 text-[11px] sm:text-xs text-center truncate w-full">
                {fourth.house.name}
              </h3>
              <p className="text-xs font-black text-slate-600 mb-2">{fourth.totalPoints} pts</p>

              <div
                className="w-full h-16 sm:h-20 rounded-t-2xl p-2 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: fourth.house.color }}
              >
                <span className="font-black text-base font-['Outfit']">4TH</span>
                <span className="text-[9px] font-medium truncate">{fourth.house.mascot}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. THE 4 HOUSES CARDS - Easy to understand */}
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mb-3">
          The 4 School Houses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {houseTotals.map((item) => {
            const { house, totalPoints, rank } = item;
            return (
              <div
                key={house.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: house.color }}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-2xs"
                      style={{ backgroundColor: house.color }}
                    >
                      #{rank} Place
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {house.mascot}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 font-['Outfit']">
                    {house.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    &quot;{house.motto}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {totalPoints} <span className="text-xs font-bold text-slate-400">pts</span>
                  </span>
                  {house.officialColors && (
                    <div className="flex items-center -space-x-1">
                      {house.colorHexList?.map((hex, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: hex }}
                          title={house.officialColors?.[i]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
