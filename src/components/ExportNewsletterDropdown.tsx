import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  ChevronDown,
  FileText,
  Sparkles,
  Globe,
  Database,
  Sliders,
} from 'lucide-react';
import { exportNewsletter, ExportFormat } from '../utils/exportNewsletter';

interface ExportNewsletterDropdownProps {
  onOpenModal?: () => void;
  className?: string;
  buttonClassName?: string;
  idPrefix?: string;
}

export const ExportNewsletterDropdown: React.FC<ExportNewsletterDropdownProps> = ({
  onOpenModal,
  className = '',
  buttonClassName = '',
  idPrefix = 'header',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectFormat = (format: ExportFormat) => {
    setIsOpen(false);
    exportNewsletter(format);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Primary Trigger Button: "Export Newsletter" with chevron */}
      <button
        type="button"
        id={`${idPrefix}-export-newsletter-btn`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`btn-hover-scale inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-300 rounded-xl shadow-md shadow-amber-500/25 transition-all cursor-pointer select-none ${buttonClassName}`}
        title="Export Newsletter in 5 formats: PDF, DOC, PNG, HTML, JSON"
      >
        <Download className="w-4 h-4 text-slate-950 shrink-0" />
        <span>Export Newsletter</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-950 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 5-Option Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={`${idPrefix}-export-newsletter-btn`}
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#161B22] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-100"
        >
          <div className="px-3 py-2 border-b border-slate-800 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-['Outfit']">
              5-Format Export Engine
            </span>
            <span className="text-xs text-slate-400 block">
              Live House Competitions &amp; Star Achievers
            </span>
          </div>

          <div className="space-y-1">
            {/* 1. PDF */}
            <button
              type="button"
              id={`${idPrefix}-export-pdf-opt`}
              onClick={() => handleSelectFormat('pdf')}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-rose-950/40 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-extrabold block text-white">Export as PDF</span>
                  <span className="text-[10px] text-slate-400 block font-mono">.pdf (Print-ready)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">PDF</span>
            </button>

            {/* 2. Word Doc */}
            <button
              type="button"
              id={`${idPrefix}-export-doc-opt`}
              onClick={() => handleSelectFormat('doc')}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-blue-950/40 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-extrabold block text-white">Export as Word Doc</span>
                  <span className="text-[10px] text-slate-400 block font-mono">.doc (MS Word)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">DOC</span>
            </button>

            {/* 3. Image PNG */}
            <button
              type="button"
              id={`${idPrefix}-export-png-opt`}
              onClick={() => handleSelectFormat('png')}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-amber-950/40 hover:border-amber-500/30 border border-transparent transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-extrabold block text-white">Export as Image</span>
                  <span className="text-[10px] text-slate-400 block font-mono">.png (2x High DPI)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">PNG</span>
            </button>

            {/* 4. Web Page HTML */}
            <button
              type="button"
              id={`${idPrefix}-export-html-opt`}
              onClick={() => handleSelectFormat('html')}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-emerald-950/40 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-extrabold block text-white">Export as Web Page</span>
                  <span className="text-[10px] text-slate-400 block font-mono">.html (Standalone)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">HTML</span>
            </button>

            {/* 5. Raw Data JSON */}
            <button
              type="button"
              id={`${idPrefix}-export-json-opt`}
              onClick={() => handleSelectFormat('json')}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-indigo-950/40 hover:border-indigo-500/30 border border-transparent transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-extrabold block text-white">Export Raw Data</span>
                  <span className="text-[10px] text-slate-400 block font-mono">.json (Structured Tree)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">JSON</span>
            </button>
          </div>

          {/* Optional Divider & Open Full Export Center */}
          {onOpenModal && (
            <div className="pt-2 mt-2 border-t border-slate-800">
              <button
                type="button"
                id={`${idPrefix}-open-export-center-opt`}
                onClick={() => {
                  setIsOpen(false);
                  onOpenModal();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Open Full Export Center Dialog...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
