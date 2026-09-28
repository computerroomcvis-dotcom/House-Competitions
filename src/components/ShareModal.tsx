import React, { useState } from 'react';
import { HouseTotalSummary } from '../utils/storage';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Users,
  Eye,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseTotals: HouseTotalSummary[];
  onSwitchToPublic: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  houseTotals,
  onSwitchToPublic,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const leader = houseTotals[0];

  const shareSummaryText = `🏆 School House Points Standings Update!
Current Leader: ${leader?.house.name} (${leader?.totalPoints} pts)
${houseTotals
  .map((h, i) => `${i + 1}. ${h.house.name}: ${h.totalPoints} pts`)
  .join('\n')}

Check your child's points and live house standings here: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(shareSummaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="share-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] leading-tight">
                Share with Parents &amp; Students
              </h2>
              <p className="text-xs text-slate-500">
                Public read-only portal for live standings and points checking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Info Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Eye className="w-4 h-4 text-indigo-600" />
              What can parents &amp; students see?
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] sm:text-xs">
              <li>Current House Cup leaderboard &amp; rank positions (1st - 4th)</li>
              <li>Live Sports Week &amp; Extra House Activity scores</li>
              <li>Individual student points table &amp; merit/demerit ledger</li>
              <li>Protected read-only access (no editing without staff login)</li>
            </ul>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1.5">
              Portal Website Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-700 select-all"
              />
              <button
                id="copy-share-url-btn"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-lg shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Message for WhatsApp / ClassDojo / Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider">
                Pre-formatted Announcement Text
              </label>
              <button
                onClick={handleCopySummary}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copied!' : 'Copy text'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={shareSummaryText}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700 resize-none select-all"
            />
          </div>

          {/* Switch to Public View Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onSwitchToPublic();
                onClose();
              }}
              className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Preview as Parent/Student</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
