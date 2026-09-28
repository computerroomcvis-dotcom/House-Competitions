import React, { useState } from 'react';
import { PointTransaction, House, CurrentUser } from '../types';
import {
  Clock,
  Search,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';

interface ActivityLogViewProps {
  transactions: PointTransaction[];
  houses: House[];
  currentUser: CurrentUser;
  onDeleteTransaction?: (txId: string) => void;
  onOpenAddPoints?: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  transactions,
  houses,
  currentUser,
  onDeleteTransaction,
  onOpenAddPoints,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'merit' | 'demerit'>('all');
  const [houseFilter, setHouseFilter] = useState<string>('all');

  const houseMap = new Map(houses.map((h) => [h.id, h]));

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reason && tx.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.awardedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    const matchHouse = houseFilter === 'all' || tx.houseId === houseFilter;

    return matchSearch && matchType && matchHouse;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white tracking-tight">
              School Points Activity Log
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of all recorded merits, demerits, and recognitions across grades TP – G5
          </p>
        </div>

        {(currentUser.role === 'teacher' || currentUser.role === 'admin') && onOpenAddPoints && (
          <button
            onClick={onOpenAddPoints}
            className="btn-hover-scale px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            + Award Points
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, category, reason or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('merit')}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'merit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Merits
          </button>
          <button
            onClick={() => setTypeFilter('demerit')}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'demerit'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Demerits
          </button>
        </div>

        {/* House Filter */}
        <select
          value={houseFilter}
          onChange={(e) => setHouseFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl font-medium text-slate-300 focus:outline-hidden focus:border-amber-400"
        >
          <option value="all">All Houses</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No activity matches your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((tx) => {
              const house = houseMap.get(tx.houseId);
              const isMerit = tx.type === 'merit';
              const dateObj = new Date(tx.timestamp);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon Pill */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm border ${
                        isMerit
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-950/70 border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {isMerit ? (
                        <ArrowUp className="w-5 h-5" />
                      ) : (
                        <ArrowDown className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {tx.studentName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.grade}
                        </span>
                        {house && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold text-white shadow-2xs"
                            style={{ backgroundColor: house.color }}
                          >
                            {house.name}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-400">
                          &bull; {tx.category}
                        </span>
                      </div>

                      {tx.reason && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-1 italic">
                          &ldquo;{tx.reason}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>Awarded by <strong className="text-slate-400">{tx.awardedBy}</strong></span>
                        <span>&bull;</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge & Delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-base sm:text-lg font-black font-['Outfit'] px-3 py-1 rounded-xl border ${
                        isMerit
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isMerit ? `+${tx.amount}` : `-${tx.amount}`} pts
                    </span>

                    {(currentUser.role === 'admin' || currentUser.role === 'teacher') &&
                      onDeleteTransaction && (
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Undo / Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
