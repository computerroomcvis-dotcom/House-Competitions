import React, { useState } from 'react';
import { SportsActivityEvent, House, Student, CurrentUser } from '../types';
import { SportsGameCard } from './SportsGameCard';
import { EditSportsGameModal } from './EditSportsGameModal';
import {
  Trophy,
  Flame,
  Calendar,
  PlusCircle,
  Sparkles,
  Info,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SportsWeekSectionProps {
  sportsEvents: SportsActivityEvent[];
  houses: House[];
  students: Student[];
  currentUser: CurrentUser;
  onUpdateEventScores: (eventId: string, houseScores: { houseId: string; points: number }[]) => void;
  onToggleEventActive: (eventId: string, isActive: boolean) => void;
  onUpdateSportsEvents: (newEvents: SportsActivityEvent[]) => void;
  onOpenCreateEvent?: () => void;
}

export const SportsWeekSection: React.FC<SportsWeekSectionProps> = ({
  sportsEvents,
  houses,
  students,
  currentUser,
  onUpdateEventScores,
  onToggleEventActive,
  onUpdateSportsEvents,
}) => {
  const canEdit = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Filters & State
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scheduled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHandbookGuide, setShowHandbookGuide] = useState(false);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<SportsActivityEvent | null>(null);

  const activeEvents = sportsEvents.filter((e) => e.isActive);
  const scheduledEvents = sportsEvents.filter((e) => !e.isActive);

  // Total participating unique students across all games
  const totalAthletesCount = new Set(
    sportsEvents.flatMap((e) => e.participatingStudentIds || [])
  ).size;

  // Save new or edited event
  const handleSaveEvent = (savedEvent: SportsActivityEvent) => {
    const exists = sportsEvents.some((e) => e.id === savedEvent.id);
    let updated: SportsActivityEvent[];
    if (exists) {
      updated = sportsEvents.map((e) => (e.id === savedEvent.id ? savedEvent : e));
    } else {
      updated = [savedEvent, ...sportsEvents];
    }
    onUpdateSportsEvents(updated);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Delete event
  const handleDeleteEvent = (eventId: string, title: string) => {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.confirm === 'function' &&
        !window.confirm.toString().includes('[native code]')
      ) {
        if (!window.confirm(`Are you sure you want to delete the game "${title}"?`)) {
          return;
        }
      }
    } catch {
      // ignore
    }
    const updated = sportsEvents.filter((e) => e.id !== eventId);
    onUpdateSportsEvents(updated);
  };

  // Direct image update on card
  const handleUpdateEventImage = (eventId: string, imageUrl: string) => {
    const updated = sportsEvents.map((e) => (e.id === eventId ? { ...e, imageUrl } : e));
    onUpdateSportsEvents(updated);
  };

  const handleOpenCreateModal = () => {
    setSelectedEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: SportsActivityEvent) => {
    setSelectedEventToEdit(event);
    setIsModalOpen(true);
  };

  // Filtered games
  const filteredEvents = sportsEvents.filter((e) => {
    if (filterStatus === 'live' && !e.isActive) return false;
    if (filterStatus === 'scheduled' && e.isActive) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (dayFilter !== 'all' && !e.date.includes(dayFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.venueCode && e.venueCode.toLowerCase().includes(q)) ||
        (e.groupCategory && e.groupCategory.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section id="sports-week-section" className="space-y-6">
      {/* 1. SPORTS WEEK HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                <span>SPORTS &amp; SPIRIT WEEKS</span>
              </span>
              {activeEvents.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {activeEvents.length} Live Game{activeEvents.length > 1 ? 's' : ''} in Progress
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white">
              Crestview Sports Week Games &amp; Tournaments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore full game cards with competition schedules, venues, rules, participating student athletes, scoring matrices, and photo galleries. Points contribute directly to the House Cup!
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            {canEdit && (
              <button
                type="button"
                id="create-sports-game-btn"
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-slate-950" />
                <span>Create New Game Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Games</span>
            <span className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {sportsEvents.length}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase text-rose-300 block">Active Live</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-['Outfit']">
              {activeEvents.length}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled / Upcoming</span>
            <span className="text-xl sm:text-2xl font-black text-slate-200 font-['Outfit']">
              {scheduledEvents.length}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase text-amber-300 block">Student Athletes</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">
              {totalAthletesCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DIRECT HOUSE POINTS & HANDBOOK THEME NOTICE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 text-xs text-amber-300 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-sm">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Direct House Cup Integration:</strong> All game scores directly add to each House's cumulative leaderboard total in real-time.
          </span>
        </div>

        <div className="flex items-center justify-between gap-2.5 text-xs text-indigo-300 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">
              <strong>Official 2026 Theme:</strong> Rise Together: Strength in Unity. Power in Purpose.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHandbookGuide(!showHandbookGuide)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shrink-0 cursor-pointer"
          >
            {showHandbookGuide ? 'Hide Guide' : 'Handbook Guide'}
          </button>
        </div>
      </div>

      {/* EXPANDABLE OFFICIAL HANDBOOK GUIDE DRAWER */}
      {showHandbookGuide && (
        <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                Official Rules &amp; Schedule Reference
              </span>
              <h3 className="text-lg font-black text-white font-['Outfit'] mt-1">
                House Competitions 2026 Official Handbook Guide
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              23–27 February 2026 • Campus &amp; Lopburi Stadium
            </span>
          </div>

          {/* Points Allocation Reference Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Official Points Allocation System (Page 21)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-300 font-bold text-[11px] uppercase">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">1st Place</th>
                    <th className="p-2.5">2nd Place</th>
                    <th className="p-2.5">3rd Place</th>
                    <th className="p-2.5">4th Place</th>
                    <th className="p-2.5">Participation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="bg-[#161B22]">
                    <td className="p-2.5 font-bold text-white">Standard Games (Most Events)</td>
                    <td className="p-2.5 font-black text-amber-400">Tier (20–70 pts)</td>
                    <td className="p-2.5 text-slate-300">-5 pts</td>
                    <td className="p-2.5 text-slate-300">-10 pts</td>
                    <td className="p-2.5 text-slate-400">2 pts</td>
                    <td className="p-2.5 font-medium text-emerald-400">2 pts</td>
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="p-2.5 font-bold text-white">Round Robin Games (Relay B, Tug of War)</td>
                    <td className="p-2.5 font-black text-amber-400">Rank 1 (45–75 pts)</td>
                    <td className="p-2.5 text-slate-300">-5 pts</td>
                    <td className="p-2.5 text-slate-300">-10 pts</td>
                    <td className="p-2.5 text-slate-400">3 pts</td>
                    <td className="p-2.5 font-medium text-emerald-400">3 pts (1 pt/win)</td>
                  </tr>
                  <tr className="bg-[#161B22]">
                    <td className="p-2.5 font-bold text-white">Special Games (Paired Amazing Race)</td>
                    <td className="p-2.5 font-black text-indigo-400">80 pts</td>
                    <td className="p-2.5 text-slate-300">75 pts</td>
                    <td className="p-2.5 text-slate-300">70 pts</td>
                    <td className="p-2.5 text-slate-300">65 pts</td>
                    <td className="p-2.5 font-medium text-slate-400">Tier points awarded</td>
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="p-2.5 font-bold text-white">House Chants Championship</td>
                    <td className="p-2.5 font-black text-rose-400">350 pts</td>
                    <td className="p-2.5 text-slate-300">300 pts</td>
                    <td className="p-2.5 text-slate-300">250 pts</td>
                    <td className="p-2.5 text-slate-300">200 pts</td>
                    <td className="p-2.5 font-medium text-slate-400">Ranked only</td>
                  </tr>
                  <tr className="bg-[#161B22]">
                    <td className="p-2.5 font-bold text-white">House Decorations Championship</td>
                    <td className="p-2.5 font-black text-purple-400">250 pts</td>
                    <td className="p-2.5 text-slate-300">200 pts</td>
                    <td className="p-2.5 text-slate-300">150 pts</td>
                    <td className="p-2.5 text-slate-300">100 pts</td>
                    <td className="p-2.5 font-medium text-slate-400">Ranked only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Venues Directory */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Official Competition Venues (Campus &amp; Lopburi Stadium)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400 block">Venue A4 / A5</span>
                <span className="text-slate-400 text-[11px]">Computer Lab / Canteen Hall</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400 block">Venue B5 / B6</span>
                <span className="text-slate-400 text-[11px]">Library / Soft Gym</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400 block">Venue D1 / D2 / D3-A / D5</span>
                <span className="text-slate-400 text-[11px]">Parking Course / Pool / Oval / Court</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-500/40">
                <span className="font-bold text-indigo-300 block">Lopburi Stadium (S1–S4)</span>
                <span className="text-indigo-200 text-[11px]">Friday Grand Championship</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTROLS & FILTER BAR */}
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
        {/* Day / Schedule Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Day:
          </span>
          {[
            { id: 'all', label: 'All Days (23–27 Feb)' },
            { id: '2026-02-23', label: 'Mon 23 Feb (Campus)' },
            { id: '2026-02-24', label: 'Tue 24 Feb (Campus)' },
            { id: '2026-02-25', label: 'Wed 25 Feb (Campus)' },
            { id: '2026-02-26', label: 'Thu 26 Feb (Campus)' },
            { id: '2026-02-27', label: 'Fri 27 Feb (Stadium)' },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDayFilter(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                dayFilter === d.id
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Status, Search & Category Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status ({sportsEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('live')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'live'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Live ({activeEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('scheduled')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'scheduled'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Scheduled ({scheduledEvents.length})
            </button>
          </div>

          {/* Category & Search Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search game, venue code, group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-hidden focus:border-amber-400 text-slate-200 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Sports Week">Sports Week</option>
              <option value="Track & Field">Track &amp; Field</option>
              <option value="Academic Challenge">Academic Challenge</option>
              <option value="Arts & Performance">Arts &amp; Performance</option>
              <option value="Adults & Parents">Adults &amp; Parents</option>
              <option value="Swimming Gala">Swimming Gala</option>
              <option value="Spirit Week">Spirit Week</option>
              <option value="Special Games">Special Games</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. FULL GAME INFORMATION CARDS GRID */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <SportsGameCard
              key={event.id}
              event={event}
              houses={houses}
              students={students}
              currentUser={currentUser}
              onUpdateEventScores={onUpdateEventScores}
              onToggleEventActive={onToggleEventActive}
              onEditGame={handleOpenEditModal}
              onDeleteGame={canEdit ? handleDeleteEvent : undefined}
              onUpdateEventImage={canEdit ? handleUpdateEventImage : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#161B22] rounded-2xl border border-dashed border-slate-800 p-12 text-center max-w-lg mx-auto text-white">
          <div className="w-14 h-14 bg-slate-900 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-800">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Game Cards Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {sportsEvents.length === 0
              ? 'No sports week games have been created yet.'
              : 'No games match your current filter or search criteria.'}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Game Card</span>
            </button>
          )}
        </div>
      )}

      {/* 5. CREATE / EDIT MODAL */}
      <EditSportsGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEventToEdit}
        houses={houses}
        students={students}
        onSave={handleSaveEvent}
      />
    </section>
  );
};
