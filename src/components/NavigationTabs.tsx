import React from 'react';
import { CurrentUser } from '../types';
import {
  Trophy,
  Users,
  Award,
  Clock,
  Flame,
  Shield,
  Sparkles,
  BookOpen,
  Search,
} from 'lucide-react';

export type ActiveNavTab =
  | 'standings'
  | 'students'
  | 'podium'
  | 'houses'
  | 'award'
  | 'activity'
  | 'sports'
  | 'admin'
  | 'advanced-award';

interface NavigationTabsProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  isSportsActive?: boolean;
  currentUser?: CurrentUser;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  isSportsActive = true,
  currentUser,
}) => {
  const role = currentUser?.role || 'public';

  // 1. VIEWER MODE (Parents / Guardians)
  if (role === 'public') {
    return (
      <div className="bg-[#161B22] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-2">
            <nav className="flex items-center gap-1.5" aria-label="Viewer Navigation">
              {/* Tab 1: House Standings */}
              <button
                type="button"
                id="tab-viewer-standings"
                onClick={() => onTabChange('standings')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'standings' || activeTab === 'podium'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>House Standings &amp; Podium</span>
              </button>

              {/* Tab 2: Find Student Points */}
              <button
                type="button"
                id="tab-viewer-students"
                onClick={() => onTabChange('students')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Find Student Points</span>
              </button>

              {/* Tab 3: Sports Schedule & Match Center */}
              <button
                type="button"
                id="tab-viewer-sports"
                onClick={() => onTabChange('sports')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sports'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Event Schedule &amp; Match Center</span>
                {isSportsActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </nav>

            <span className="hidden md:inline-flex text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg">
              Parent &amp; Guardian View
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEACHER MODE - Quick Award, Advanced Award, Student Roster, Houses & Leadership, Activity Log, Sports Week
  if (role === 'teacher') {
    return (
      <div className="bg-[#161B22] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-2">
            <nav className="flex items-center gap-1.5" aria-label="Teacher Navigation">
              {/* Tab 1: Quick Point Awarding (Default on open!) */}
              <button
                type="button"
                id="tab-teacher-quick-award"
                onClick={() => onTabChange('award')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'award' || activeTab === 'standings'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'award' || activeTab === 'standings' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>Quick Point Awarding</span>
              </button>

              {/* Tab 2: Advanced Awarding */}
              <button
                type="button"
                id="tab-teacher-advanced-award"
                onClick={() => onTabChange('advanced-award')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'advanced-award'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Advanced Awarding</span>
              </button>

              {/* Tab 3: Student Roster */}
              <button
                type="button"
                id="tab-teacher-students"
                onClick={() => onTabChange('students')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Student Roster</span>
              </button>

              {/* Tab 4: Houses & Leadership (Same as Admin) */}
              <button
                type="button"
                id="tab-teacher-houses-leadership"
                onClick={() => onTabChange('houses')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'houses'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Houses &amp; Leadership</span>
              </button>

              {/* Tab 5: Activity Log (Same as Admin) */}
              <button
                type="button"
                id="tab-teacher-activity-log"
                onClick={() => onTabChange('activity')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'activity'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Activity Log</span>
              </button>

              {/* Tab 6: Event Schedule & Match Center */}
              <button
                type="button"
                id="tab-teacher-sports"
                onClick={() => onTabChange('sports')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sports'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Event Schedule &amp; Match Center</span>
                {isSportsActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </nav>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              Teacher Mode
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN MODE - Full 8 tabs in dark slate style
  return (
    <div className="bg-[#161B22] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="relative">
          <nav
            className="flex items-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
            aria-label="Main Navigation"
          >
            {/* Tab 1: House Standings */}
            <button
              id="tab-house-standings"
              onClick={() => onTabChange('standings')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'standings'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>
                <span className="sm:hidden">Standings</span>
                <span className="hidden sm:inline">House Standings</span>
              </span>
            </button>

            {/* Tab 2: Student Points (TP-G5) */}
            <button
              id="tab-student-points"
              onClick={() => onTabChange('students')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span>
                <span className="sm:hidden">Students</span>
                <span className="hidden sm:inline">Student Points (TP-G5)</span>
              </span>
            </button>

            {/* Tab 3: House Cup & Podium */}
            <button
              id="tab-house-podium"
              onClick={() => onTabChange('podium')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'podium'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>
                <span className="sm:hidden">Podium</span>
                <span className="hidden sm:inline">House Cup &amp; Podium</span>
              </span>
            </button>

            {/* Tab 4: Houses & Leadership */}
            <button
              id="tab-houses-leadership"
              onClick={() => onTabChange('houses')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'houses'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <span>
                <span className="sm:hidden">Leadership</span>
                <span className="hidden sm:inline">Houses &amp; Leadership</span>
              </span>
            </button>

            {/* Tab 5: Award Points */}
            <button
              id="tab-award-points"
              onClick={() => onTabChange('award')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'award'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>
                <span className="sm:hidden">Award</span>
                <span className="hidden sm:inline">Award Points</span>
              </span>
            </button>

            {/* Tab 6: Activity Log */}
            <button
              id="tab-activity-log"
              onClick={() => onTabChange('activity')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span>
                <span className="sm:hidden">Activity</span>
                <span className="hidden sm:inline">Activity Log</span>
              </span>
            </button>

            {/* Tab 7: Event Schedule & Match Center */}
            <button
              id="tab-sports-week"
              onClick={() => onTabChange('sports')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'sports'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span>
                <span className="sm:hidden">Match Center</span>
                <span className="hidden sm:inline">Event Schedule &amp; Match Center</span>
              </span>
              {isSportsActive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </button>

            {/* Tab 8: Admin Console */}
            <button
              id="tab-admin-console"
              onClick={() => onTabChange('admin')}
              className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/30 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>
                <span className="sm:hidden">Admin</span>
                <span className="hidden sm:inline">Admin Console</span>
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
