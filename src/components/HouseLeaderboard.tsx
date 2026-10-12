import React from 'react';
import { HouseTotalSummary } from '../utils/storage';
import { House, SportsActivityEvent } from '../types';
import {
  Trophy,
  Crown,
  Flame,
  Shield,
  Star,
  Sparkles,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Activity,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from './AnimatedCounter';

interface HouseLeaderboardProps {
  houseTotals: HouseTotalSummary[];
  activeSportsEvent?: SportsActivityEvent;
  onSelectHouseFilter?: (houseId: string) => void;
  selectedHouseId?: string;
  onOpenAddPoints?: () => void;
  onViewSportsStandings?: () => void;
  canAddPoints?: boolean;
}

const HOUSE_ICON_MAP: Record<string, React.ElementType> = {
  Crown: Crown,
  Flame: Flame,
  Star: Star,
  Shield: Shield,
  Award: Award,
};

export const HouseLeaderboard: React.FC<HouseLeaderboardProps> = ({
  houseTotals,
  activeSportsEvent,
  onSelectHouseFilter,
  selectedHouseId,
  onOpenAddPoints,
  onViewSportsStandings,
  canAddPoints,
}) => {
  // Compute total school points
  const totalSchoolPoints = houseTotals.reduce(
    (acc, curr) => acc + curr.totalPoints,
    0
  );
  const leader = houseTotals[0];

  const handleCelebrate = (houseName: string, color: string) => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: [color, '#F59E0B', '#3B82F6', '#10B981', '#EC4899'],
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Midnight Leader Banner (matching screenshot) */}
      {leader && (
        <div
          id="term-leader-banner"
          className="relative bg-[#131738] rounded-2xl p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Pill: CURRENT TERM LEADER */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40 mb-3 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>CURRENT TERM LEADER</span>
            </div>

            {/* Leader House Name */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit'] tracking-tight text-white mb-2">
              {leader.house.name}
            </h2>

            {/* Subtitle with points */}
            <p className="text-sm sm:text-base text-slate-300">
              Currently holding 1st place with{' '}
              <strong className="text-amber-400 font-extrabold">
                {leader.totalPoints} points!
              </strong>{' '}
              Total across all 4 houses is{' '}
              <strong className="text-white font-bold">
                {totalSchoolPoints} points.
              </strong>
            </p>
          </div>

          {/* Action button on right: Award House Points */}
          <div className="relative z-10 flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              id="award-house-points-hero-btn"
              onClick={onOpenAddPoints}
              className="w-full sm:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Award House Points</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Live Sports Week Banner (matching screenshot) */}
      {activeSportsEvent && (
        <div
          id="sports-week-active-banner"
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {activeSportsEvent.imageUrl ? (
              <img
                src={activeSportsEvent.imageUrl}
                alt={activeSportsEvent.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border-2 border-white/40 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner text-amber-100">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            )}

            <div className="min-w-0">
              {/* Badges: LIVE EVENT ACTIVE and Date */}
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="bg-black/35 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs">
                  LIVE EVENT ACTIVE
                </span>
                <span className="text-white/95 text-xs font-semibold">
                  {activeSportsEvent.date}
                </span>
                {activeSportsEvent.time && (
                  <span className="text-amber-100 text-xs font-medium">
                    &bull; {activeSportsEvent.time}
                  </span>
                )}
                {activeSportsEvent.location && (
                  <span className="text-amber-100 text-xs font-medium hidden md:inline">
                    &bull; {activeSportsEvent.location}
                  </span>
                )}
              </div>

              {/* Event Title */}
              <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                {activeSportsEvent.title}
              </h3>

              {/* Event Subtitle */}
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 line-clamp-1">
                {activeSportsEvent.description}
              </p>
            </div>
          </div>

          {/* Right: View Sports Week Standings button */}
          <button
            id="view-sports-standings-btn"
            onClick={onViewSportsStandings}
            className="bg-white hover:bg-slate-50 active:scale-95 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
          >
            <span>View Full Game Cards</span>
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      )}

      {/* 3. Section Header: The 4 Houses Standings */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
            The 4 Houses Standings
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Live real-time totals from students TP – G5
        </p>
      </div>

      {/* 4. The 4 House Cards in 4 Columns (Dark Container Consistency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {houseTotals.map((item) => {
          const { house, totalPoints, rank, studentMerits, studentDemerits } =
            item;
          const isSelected = selectedHouseId === house.id;
          const IconComp = HOUSE_ICON_MAP[house.iconName] || Crown;

          // Percentage of all school points (e.g. 28%, 27%, 24%, 22%)
          const percentOfAll =
            totalSchoolPoints > 0
              ? Math.round((totalPoints / totalSchoolPoints) * 100)
              : 0;

          // Rank Badge styling
          const rankBadge =
            rank === 1 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-950" />
                1st Place
              </span>
            ) : rank === 2 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
                <Award className="w-3 h-3 text-slate-300" />
                2nd Place
              </span>
            ) : rank === 3 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-800 text-amber-200">
                <Award className="w-3 h-3 text-amber-300" />
                3rd Place
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                <Award className="w-3 h-3 text-slate-500" />
                4th Place
              </span>
            );

          return (
            <div
              key={house.id}
              id={`house-standing-card-${house.id}`}
              onClick={() => {
                handleCelebrate(house.name, house.color);
                if (onSelectHouseFilter) {
                  onSelectHouseFilter(isSelected ? 'all' : house.id);
                }
              }}
              className={`btn-hover-scale bg-[#161B22] rounded-2xl border transition-all duration-150 p-5 flex flex-col justify-between cursor-pointer hover:shadow-xl relative overflow-hidden ${
                isSelected
                  ? 'ring-2 ring-amber-400 shadow-xl border-amber-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Colored Accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: house.color }}
              />

              <div>
                {/* Header: Mascot Icon + Name + Rank Badge */}
                <div className="flex items-start justify-between gap-2 mt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden"
                      style={{ backgroundColor: house.color }}
                    >
                      {house.logoUrl ? (
                        <img
                          src={house.logoUrl}
                          alt={house.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <IconComp className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white leading-snug truncate">
                        {house.name}
                      </h3>
                      <p className="text-xs text-slate-400 italic line-clamp-1">
                        "{house.motto}"
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">{rankBadge}</div>
                </div>

                {/* Center Stat Container */}
                <div className="bg-slate-900/90 rounded-xl p-4 text-center mt-4 border border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-0.5">
                    TOTAL HOUSE POINTS
                  </span>
                  <div className="text-4xl font-black font-['Outfit'] text-white tracking-tight my-0.5">
                    <AnimatedCounter value={totalPoints} />
                  </div>
                  <span className="text-xs text-slate-400 block mb-3 font-medium">
                    {percentOfAll}% of all school points
                  </span>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(12, percentOfAll))}%`,
                        backgroundColor: house.color,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Row Metrics: Merits & Demerits */}
                <div className="grid grid-cols-2 gap-2 mt-3.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                    <span className="text-xs text-emerald-300 font-semibold block">
                      Total Merits
                    </span>
                    <span className="text-lg font-black text-emerald-400 font-['Outfit'] block mt-0.5">
                      +{studentMerits}
                    </span>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                    <span className="text-xs text-rose-300 font-semibold block">
                      Total Demerits
                    </span>
                    <span className="text-lg font-black text-rose-400 font-['Outfit'] block mt-0.5">
                      -{studentDemerits}
                    </span>
                  </div>
                </div>
              </div>

              {/* Click prompt */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.studentCount} students</span>
                <span className="text-amber-400 font-semibold">
                  {isSelected ? 'Selected' : 'Filter roster &rarr;'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
