import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { subscribeToExportProgress, ExportProgressState } from '../utils/exportNewsletter';

export const ExportLoadingOverlay: React.FC = () => {
  const [state, setState] = useState<ExportProgressState>({ isExporting: false });

  useEffect(() => {
    const unsubscribe = subscribeToExportProgress((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  if (!state.isExporting) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-150"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-lg relative">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          {state.format === 'pdf' ? (
            <FileText className="w-4 h-4 text-rose-400 absolute bottom-2 right-2 animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300 absolute bottom-2 right-2 animate-pulse" />
          )}
        </div>

        <div>
          <h4 className="text-lg font-black text-white font-['Outfit'] tracking-tight">
            Generating Newsletter
          </h4>
          <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
            {state.message || 'Processing document conversion via high-res engine...'}
          </p>
        </div>

        {/* Progress Bar Animation */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 h-full w-2/3 animate-pulse rounded-full" />
        </div>

        <span className="text-[10px] text-slate-400 block font-mono">
          High-DPI rendering in progress &bull; Please wait...
        </span>
      </div>
    </div>
  );
};
