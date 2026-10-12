import React, { useState, useRef, useEffect } from 'react';
import { CurrentUser } from '../types';
import {
  LogOut,
  GraduationCap,
  Shield,
  Home,
  Trophy,
  Mail,
  Grid,
  ChevronDown,
  Download,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface HeaderProps {
  currentUser: CurrentUser;
  totalSchoolPoints?: number;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAddPoints?: () => void;
  onOpenShare?: () => void;
  onOpenTeacherProfile?: () => void;
  onOpenAdmin?: () => void;
  onOpenHomePage?: () => void;
  onOpenNewsletterExporter?: () => void;
  onOpenEventCardsExporter?: () => void;
  leadingHouseName?: string;
  leadingHousePoints?: number;
  isSportsActive?: boolean;
  onScrollToSports?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  totalSchoolPoints = 0,
  onOpenLogin,
  onLogout,
  onOpenTeacherProfile,
  onOpenAdmin,
  onOpenHomePage,
  onOpenNewsletterExporter,
  onOpenEventCardsExporter,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="bg-[#161B22] border-b border-slate-800 sticky top-0 z-30 shadow-lg text-slate-100">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Main Desktop & Mobile Top Bar */}
        <div className="flex items-center justify-between min-h-[3.75rem] sm:h-20 py-2 sm:py-0 gap-2 sm:gap-4">
          {/* Left: School Logo & School Name */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            {/* School Logo Crest */}
            <button
              type="button"
              onClick={onOpenHomePage}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-amber-400/50 shadow-md flex items-center justify-center shrink-0 cursor-pointer hover:border-amber-400 hover:scale-105 transition-all"
              title="Crestview International School - Return to Home"
            >
              <svg
                viewBox="0 0 40 40"
                className="w-7 h-7 sm:w-8 sm:h-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Shield background */}
                <path
                  d="M20 3L6 8V18C6 26.5 12 34.5 20 37C28 34.5 34 26.5 34 18V8L20 3Z"
                  fill="#0D1117"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                {/* Inner emblem */}
                <path
                  d="M20 7L10 11V18C10 24.5 14.5 30.5 20 32.5C25.5 30.5 30 24.5 30 18V11L20 7Z"
                  fill="#161B22"
                />
                {/* Open book / torch lines */}
                <path
                  d="M20 13V24M14 18C16 17 18 17 20 18C22 17 24 17 26 18M14 22C16 21 18 21 20 22C22 21 24 21 26 22"
                  stroke="#FCD34D"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="11" r="1.5" fill="#F59E0B" />
              </svg>
            </button>

            {/* School Name & Subtitle */}
            <div className="flex flex-col justify-center min-w-0">
              <button
                type="button"
                onClick={onOpenHomePage}
                className="text-left cursor-pointer hover:opacity-90 transition-opacity"
              >
                <h1 className="font-['Outfit'] font-extrabold text-white text-base sm:text-xl leading-tight tracking-tight truncate">
                  Crestview International School
                </h1>
              </button>
              <p className="text-xs text-slate-400 font-medium tracking-normal truncate">
                House Points System &bull; TP – Grade 5
              </p>
            </div>
          </div>

          {/* Center: Total School Points display (in top navigation header bar only) */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-300 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Total School Points:</span>
            <AnimatedCounter
              value={totalSchoolPoints}
              className="text-amber-400 font-black text-sm"
              suffix=" pts"
            />
          </div>

          {/* Right: Auth & Export Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Exporters Dropdown */}
            {(onOpenNewsletterExporter || onOpenEventCardsExporter) && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  id="header-exporters-btn"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
                  title="School Exporters (Newsletter & Event Cards)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Exporters</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isExportMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#161B22] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Export &amp; Print Tools
                    </div>

                    {onOpenNewsletterExporter && (
                      <button
                        type="button"
                        id="btn-open-newsletter-exporter"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          onOpenNewsletterExporter();
                        }}
                        className="w-full mt-1 flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs text-white block">Newsletter Exporter</strong>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Grade/Division &bull; PDF &bull; HTML
                          </span>
                        </div>
                      </button>
                    )}

                    {onOpenEventCardsExporter && (
                      <button
                        type="button"
                        id="btn-open-event-cards-exporter"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          onOpenEventCardsExporter();
                        }}
                        className="w-full mt-1 flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs text-white block">Event Cards Batch</strong>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Cuttable Grid Sheets &bull; CSV Roster
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 1. TEACHER LOGGED IN */}
            {currentUser.role === 'teacher' && currentUser.teacher && (
              <>
                {/* Teacher Profile Button */}
                <button
                  type="button"
                  id="header-teacher-name-btn"
                  onClick={onOpenTeacherProfile}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Click to view teacher credentials"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="max-w-[90px] sm:max-w-[140px] truncate">
                    {currentUser.teacher.name}
                  </span>
                </button>

                {/* Sign Out Button */}
                <button
                  type="button"
                  id="header-teacher-signout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-xl transition-all cursor-pointer"
                  title="Sign out of teacher account"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}

            {/* 2. ADMIN LOGGED IN */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  id="header-admin-name-btn"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-amber-300 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
                  title="Click to open Admin Console"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="max-w-[90px] sm:max-w-[140px] truncate">
                    {currentUser.adminUser ? currentUser.adminUser.name : 'Admin'}
                  </span>
                </button>

                <button
                  type="button"
                  id="header-admin-signout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-xl transition-all cursor-pointer"
                  title="Sign out of admin account"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}

            {/* 3. PUBLIC VIEWER */}
            {currentUser.role === 'public' && (
              <>
                <button
                  type="button"
                  id="header-teacher-login-btn"
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Teacher Sign In"
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>Teacher Login</span>
                </button>

                <button
                  type="button"
                  id="header-admin-login-btn"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                  title="Admin Sign In"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Admin</span>
                </button>
              </>
            )}

            {/* Home Portal Button */}
            {onOpenHomePage && (
              <button
                type="button"
                onClick={onOpenHomePage}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Return to Home Portal"
              >
                <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
