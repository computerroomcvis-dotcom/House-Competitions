import React from 'react';
import { HouseTotalSummary } from '../utils/storage';
import { Trophy, Crown, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from './AnimatedCounter';

interface PodiumViewProps {
  houseTotals: HouseTotalSummary[];
  onOpenAddPoints?: () => void;
  onFilterHouse?: (houseId: string) => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  houseTotals,
  onFilterHouse,
}) => {
  const leader = houseTotals[0];
  const second = houseTotals[1];
  const third = houseTotals[2];
  const fourth = houseTotals[3];

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#12B76A', '#F76808', '#2E90FA', '#7A5AF8', '#F59E0B'],
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#161B22] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Crestview House Championship</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
            House Cup &amp; Podium Standings
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Current standings across all primary grade levels (TP &ndash; G5)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerConfetti}
            className="btn-hover-scale px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Celebrate Leader</span>
          </button>
        </div>
      </div>

      {/* Podium Steps (2nd - 1st - 3rd - 4th) in Dark Theme Container */}
      <div className="bg-[#161B22] rounded-3xl border border-slate-800 p-4 sm:p-10 shadow-xl text-white">
        {/* Visual Stepped Podium - Responsive on mobile & desktop, no house name truncation */}
        <div className="flex flex-wrap sm:flex-nowrap items-end justify-center gap-2.5 sm:gap-6 pt-8 sm:pt-12 pb-4 max-w-4xl mx-auto">
          {/* 2nd Place (Silver) */}
          {second && (
            <div
              onClick={() => onFilterHouse && onFilterHouse(second.house.id)}
              className="flex-1 min-w-[125px] sm:min-w-[170px] max-w-[210px] flex flex-col items-center cursor-pointer order-2 sm:order-1 group transition-transform hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-600 text-slate-300 flex items-center justify-center font-black text-sm sm:text-xl shadow-md group-hover:scale-105 transition-transform mb-2">
                🥈
              </div>
              <h3 className="font-extrabold text-white text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                {second.house.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-slate-200 mb-2">
                <AnimatedCounter value={second.totalPoints} suffix=" pts" />
              </p>

              {/* Step */}
              <div
                className="w-full h-28 sm:h-36 rounded-t-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: second.house.color }}
              >
                <span className="font-black text-lg sm:text-2xl tracking-tight opacity-90 font-['Outfit']">
                  2ND
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/95 text-center">
                  +{second.studentMerits} merits
                </span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          {leader && (
            <div
              onClick={() => onFilterHouse && onFilterHouse(leader.house.id)}
              className="flex-1 min-w-[140px] sm:min-w-[190px] max-w-[240px] flex flex-col items-center cursor-pointer order-1 sm:order-2 group -mt-4 sm:-mt-8 transition-transform hover:-translate-y-1"
            >
              <div className="relative mb-2">
                <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400 absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-2 sm:border-4 border-amber-200 text-amber-950 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                  <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-950" />
                </div>
              </div>
              <h3 className="font-black text-amber-300 text-sm sm:text-base text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                {leader.house.name}
              </h3>
              <p className="text-sm sm:text-base font-black text-amber-400 mb-2">
                <AnimatedCounter value={leader.totalPoints} suffix=" pts" />
              </p>

              {/* Champion Step */}
              <div
                className="w-full h-40 sm:h-52 rounded-t-2xl p-3 sm:p-5 flex flex-col items-center justify-between text-white shadow-xl relative overflow-hidden"
                style={{ backgroundColor: leader.house.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 pointer-events-none" />
                <span className="font-black text-2xl sm:text-4xl tracking-tight font-['Outfit']">
                  1ST
                </span>
                <div className="text-center z-10">
                  <p className="text-xs sm:text-sm font-extrabold text-white">
                    Champions
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/95">
                    +{leader.studentMerits} / -{leader.studentDemerits}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {third && (
            <div
              onClick={() => onFilterHouse && onFilterHouse(third.house.id)}
              className="flex-1 min-w-[125px] sm:min-w-[170px] max-w-[210px] flex flex-col items-center cursor-pointer order-3 sm:order-3 group transition-transform hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/60 border-2 border-amber-800 text-amber-400 flex items-center justify-center font-black text-sm sm:text-xl shadow-md group-hover:scale-105 transition-transform mb-2">
                🥉
              </div>
              <h3 className="font-extrabold text-white text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                {third.house.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-slate-200 mb-2">
                <AnimatedCounter value={third.totalPoints} suffix=" pts" />
              </p>

              {/* Step */}
              <div
                className="w-full h-24 sm:h-30 rounded-t-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: third.house.color }}
              >
                <span className="font-black text-lg sm:text-2xl tracking-tight opacity-90 font-['Outfit']">
                  3RD
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/95 text-center">
                  +{third.studentMerits} merits
                </span>
              </div>
            </div>
          )}

          {/* 4th Place */}
          {fourth && (
            <div
              onClick={() => onFilterHouse && onFilterHouse(fourth.house.id)}
              className="flex-1 min-w-[115px] sm:min-w-[150px] max-w-[180px] flex flex-col items-center cursor-pointer order-4 sm:order-4 group transition-transform hover:-translate-y-1"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm group-hover:scale-105 transition-transform mb-2">
                4th
              </div>
              <h3 className="font-bold text-slate-300 text-xs sm:text-sm text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug break-words">
                {fourth.house.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-slate-300 mb-2">
                <AnimatedCounter value={fourth.totalPoints} suffix=" pts" />
              </p>

              {/* Step */}
              <div
                className="w-full h-18 sm:h-22 rounded-t-2xl p-2 sm:p-3 flex flex-col items-center justify-between text-white shadow-inner"
                style={{ backgroundColor: fourth.house.color }}
              >
                <span className="font-black text-base sm:text-xl tracking-tight opacity-90 font-['Outfit']">
                  4TH
                </span>
                <span className="text-[9px] sm:text-[10px] text-white/90 text-center">
                  +{fourth.studentMerits} merits
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
