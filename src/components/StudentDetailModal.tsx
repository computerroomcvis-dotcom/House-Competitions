import React from 'react';
import { Student, House, PointTransaction, CurrentUser } from '../types';
import {
  X,
  Award,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  Clock,
  PlusCircle,
  Shield,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  house: House | null;
  transactions: PointTransaction[];
  currentUser: CurrentUser;
  onClose: () => void;
  onDeleteTransaction?: (txId: string) => void;
  onOpenAddPointsForStudent?: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  house,
  transactions,
  currentUser,
  onClose,
  onDeleteTransaction,
  onOpenAddPointsForStudent,
}) => {
  if (!student) return null;

  const studentTxs = transactions
    .filter((tx) => tx.studentId === student.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const merits = studentTxs
    .filter((t) => t.type === 'merit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const demerits = studentTxs
    .filter((t) => t.type === 'demerit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netPoints = merits - demerits;
  const canManage = currentUser.role === 'teacher' || currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="student-history-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Student Profile Banner */}
        <div
          className="p-5 text-white relative flex items-start justify-between"
          style={{ backgroundColor: house?.color || '#334155' }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-2xl font-black font-['Outfit'] border border-white/20 shadow-sm">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] leading-tight">
                  {student.name}
                </h2>
                <span className="bg-white/25 text-white px-2 py-0.5 rounded text-xs font-bold">
                  {student.grade}
                </span>
                {student.isPrefect && (
                  <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded text-xs font-black shadow-2xs">
                    House Prefect
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{house?.name || 'Unassigned House'}</span>
                {house?.mascot && <span>&bull; {house.mascot}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {house?.logoUrl && (
              <img
                src={house.logoUrl}
                alt={house.name}
                className="w-10 h-10 rounded-xl object-contain bg-white/20 p-1 border border-white/40 shadow-xs"
              />
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Points Summary Card */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Merits</span>
            <p className="text-lg sm:text-xl font-black text-emerald-600 font-['Outfit']">
              +{merits}
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-700">Demerits</span>
            <p className="text-lg sm:text-xl font-black text-rose-600 font-['Outfit']">
              -{demerits}
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-700">Net Points</span>
            <p className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">
              {netPoints}
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Point History Ledger ({studentTxs.length})
          </h3>

          {canManage && onOpenAddPointsForStudent && (
            <button
              onClick={() => {
                onClose();
                onOpenAddPointsForStudent(student.id);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Award Points to {student.name.split(' ')[0]}</span>
              <span className="sm:hidden">+ Award Points</span>
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {studentTxs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No merits or demerits recorded yet.</p>
            </div>
          ) : (
            studentTxs.map((tx) => {
              const isMerit = tx.type === 'merit';
              const dateStr = new Date(tx.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                    isMerit
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white ${
                        isMerit ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {isMerit ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {tx.category}
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            isMerit
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isMerit ? `+${tx.amount}` : `-${tx.amount}`}
                        </span>
                      </div>

                      {tx.reason && (
                        <p className="text-xs text-slate-700 italic">"{tx.reason}"</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {tx.awardedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManage && onDeleteTransaction && (
                    <button
                      onClick={() => {
                        try {
                          if (
                            typeof window !== 'undefined' &&
                            typeof window.confirm === 'function' &&
                            !window.confirm.toString().includes('[native code]')
                          ) {
                            if (!window.confirm(`Remove this point record (+${tx.amount} / -${tx.amount})?`)) {
                              return;
                            }
                          }
                        } catch {
                          // ignore
                        }
                        onDeleteTransaction(tx.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors cursor-pointer"
                      title="Undo / Delete point record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
