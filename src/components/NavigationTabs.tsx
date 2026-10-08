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
  CalendarCheck,
} from 'lucide-react';

export type ActiveNavTab =
  | 'standings'
  | 'students'
  | 'podium'
  | 'houses'
  | 'award'
  | 'activity'
  | 'sports'
  | 'sports-events'
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

              {/* Tab 3: House Competitions Results */}
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
                <span>House Competitions Results</span>
                {isSportsActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Tab 4: House Competitions Events */}
              <button
                type="button"
                id="tab-viewer-sports-events"
                onClick={() => onTabChange('sports-events')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sports-events'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>House Competitions Events</span>
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

              {/* Tab 6: House Competitions Results */}
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
                <span>House Competitions Results</span>
                {isSportsActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Tab 7: House Competitions Events */}
              <button
                type="button"
                id="tab-teacher-sports-events"
                onClick={() => onTabChange('sports-events')}
                className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sports-events'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>House Competitions Events</span>
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

  // 3. ADMIN MODE - Matches Teacher Navigation layout plus Admin Console tab/button
  return (
    <div className="bg-[#161B22] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-2">
          <nav className="flex items-center gap-1.5" aria-label="Admin Navigation">
            {/* Tab 1: Quick Point Awarding (Default on open!) */}
            <button
              type="button"
              id="tab-admin-quick-award"
              onClick={() => onTabChange('award')}
              className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'award' || activeTab === 'standings'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 ${
                  activeTab === 'award' || activeTab === 'standings' ? 'text-slate-950' : 'text-amber-400'
                }`}
              />
              <span>Quick Point Awarding</span>
            </button>

            {/* Tab 2: Advanced Awarding */}
            <button
              type="button"
              id="tab-admin-advanced-award"
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
              id="tab-admin-students"
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

            {/* Tab 4: Houses & Leadership */}
            <button
              type="button"
              id="tab-admin-houses-leadership"
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

            {/* Tab 5: Activity Log */}
            <button
              type="button"
              id="tab-admin-activity-log"
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

            {/* Tab 6: House Competitions Results */}
            <button
              type="button"
              id="tab-admin-sports"
              onClick={() => onTabChange('sports')}
              className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sports'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>House Competitions Results</span>
              {isSportsActive && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Tab 7: House Competitions Events */}
            <button
              type="button"
              id="tab-admin-sports-events"
              onClick={() => onTabChange('sports-events')}
              className={`btn-hover-scale inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sports-events'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              <span>House Competitions Events</span>
            </button>

            {/* Tab 8: Admin Console */}
            <button
              type="button"
              id="tab-admin-console"
              onClick={() => onTabChange('admin')}
              className="btn-hover-scale inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 whitespace-nowrap transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
            </button>
          </nav>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Mode</span>
          </span>
        </div>
      </div>
    </div>
  );
};
