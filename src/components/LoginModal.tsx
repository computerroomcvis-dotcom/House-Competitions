import React, { useState } from 'react';
import { TeacherUser, AdminUser, House } from '../types';
import {
  X,
  Lock,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Info,
  Award,
  Zap,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherUser[];
  adminUsers?: AdminUser[];
  houses?: House[];
  adminPassword?: string;
  onLoginTeacher: (teacher: TeacherUser) => void;
  onLoginAdmin: (adminUser?: AdminUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  teachers,
  adminUsers = [],
  houses = [],
  adminPassword = 'admin',
  onLoginTeacher,
  onLoginAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'admin'>('admin');

  // Teacher Form
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('all');

  // Admin Form
  const [adminUsername, setAdminUsername] = useState('');
  const [enteredAdminPass, setEnteredAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    const searchKey = teacherUsername.trim().toLowerCase();
    const matched = teachers.find(
      (t) =>
        (t.username?.trim().toLowerCase() === searchKey ||
          t.name.trim().toLowerCase() === searchKey ||
          (t.email && t.email.trim().toLowerCase() === searchKey)) &&
        t.password === teacherPassword
    );

    if (matched) {
      onLoginTeacher(matched);
      onClose();
    } else {
      setTeacherError('Invalid teacher username or password. Please enter your Full Name as your username (or select a 1-click account below).');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    // Check if matching specific admin user by username / full name & password
    if (adminUsername.trim()) {
      const searchKey = adminUsername.trim().toLowerCase();
      const matchedAdmin = adminUsers.find(
        (a) =>
          (a.username?.trim().toLowerCase() === searchKey ||
            a.name.trim().toLowerCase() === searchKey ||
            (a.email && a.email.trim().toLowerCase() === searchKey)) &&
          (a.password === enteredAdminPass || enteredAdminPass === adminPassword || enteredAdminPass === 'admin123')
      );

      if (matchedAdmin) {
        onLoginAdmin(matchedAdmin);
        onClose();
        return;
      }
    }

    // Check master admin password
    if (enteredAdminPass.trim() === adminPassword.trim() || enteredAdminPass.trim() === 'admin123') {
      const fallbackAdmin = adminUsers[0];
      onLoginAdmin(fallbackAdmin);
      onClose();
    } else {
      setAdminError('Incorrect administrator credentials. (Default password is "admin" or select a Leadership Panel account below)');
    }
  };

  const handleQuickTeacher = (teacher: TeacherUser) => {
    onLoginTeacher(teacher);
    onClose();
  };

  const handleQuickAdmin = (adminUser: AdminUser) => {
    onLoginAdmin(adminUser);
    onClose();
  };

  const filteredTeachers = teachers.filter((t) => {
    if (selectedHouseFilter === 'all') return true;
    return t.houseId === selectedHouseFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="login-modal"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] leading-tight">
                Crestview Staff Authentication
              </h2>
              <p className="text-xs text-slate-500">
                House Leadership Panel, Ambassadors &amp; Counselors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 shrink-0">
          <button
            id="tab-admin-login"
            onClick={() => {
              setActiveTab('admin');
              setAdminError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Leadership Panel (Admin)</span>
          </button>

          <button
            id="tab-teacher-login"
            onClick={() => {
              setActiveTab('teacher');
              setTeacherError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Ambassadors &amp; Counselors</span>
          </button>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'admin' ? (
            /* Admin / Leadership Panel Form */
            <div className="space-y-4">
              <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3 text-xs text-rose-950 leading-relaxed flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-rose-900 font-bold mb-0.5">
                    House Leadership Panel Admin Portal
                  </strong>
                  Admin accounts have full authority to manage houses, award points, edit student &amp; teacher records, and oversee sports events. Log in with your Leadership account below.
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                      Admin Username (Full Name)
                    </label>
                    <input
                      type="text"
                      id="admin-username-input"
                      placeholder="e.g. Brooklyn Wheldon"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                      Password (or Master: &quot;admin&quot;)
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        id="admin-password-input"
                        placeholder="Default is admin"
                        value={enteredAdminPass}
                        onChange={(e) => setEnteredAdminPass(e.target.value)}
                        className="w-full px-3 py-2 pr-9 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-admin-login"
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Authenticate Admin Access</span>
                </button>
              </form>

              {/* 1-Click Leadership Panel Admin Accounts */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-extrabold text-slate-700 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>House Leadership Panel Accounts (1-Click Login):</span>
                  </p>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    AY 2026-2027
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Co-Chairs */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Co-Chairs
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {adminUsers
                        .filter((a) => a.panelRole === 'Co-Chair')
                        .map((admin) => (
                          <button
                            key={admin.id}
                            type="button"
                            onClick={() => handleQuickAdmin(admin)}
                            className="p-2.5 text-left bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 border border-rose-200 rounded-xl transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-black text-xs text-rose-950 group-hover:text-rose-700">
                                {admin.name}
                              </p>
                              <span className="text-[10px] font-bold bg-rose-200/80 text-rose-800 px-1.5 py-0.5 rounded">
                                {admin.section}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-rose-700 mt-0.5">
                              {admin.roleTitle}
                            </p>
                            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                              Username: <span className="font-bold text-rose-900">{admin.username || admin.name}</span>
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Panel Members */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Panel Members
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {adminUsers
                        .filter((a) => a.panelRole === 'Member')
                        .map((admin) => (
                          <button
                            key={admin.id}
                            type="button"
                            onClick={() => handleQuickAdmin(admin)}
                            className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all text-xs cursor-pointer group"
                          >
                            <p className="font-bold text-slate-900 text-xs truncate group-hover:text-rose-700">
                              {admin.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {admin.roleTitle}
                            </p>
                            <p className="text-[9px] text-slate-600 truncate font-medium">
                              User: {admin.username || admin.name}
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Consultant / Director */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Director of Academics &amp; Administration
                    </p>
                    {adminUsers
                      .filter((a) => a.panelRole === 'Administrator')
                      .map((admin) => (
                        <button
                          key={admin.id}
                          type="button"
                          onClick={() => handleQuickAdmin(admin)}
                          className="w-full p-2.5 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{admin.name}</p>
                            <p className="text-[11px] text-slate-500">{admin.roleTitle}</p>
                            <p className="text-[10px] text-slate-600 font-medium">
                              Username: <span className="font-bold text-indigo-900">{admin.username || admin.name}</span>
                            </p>
                          </div>
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            Consultant
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Teacher Form (Ambassadors & Counselors) */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  House Ambassadors and Counselors can award merits and demerits to their house and all students across preschool &amp; elementary using their full name username.
                </span>
              </div>

              {teacherError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {teacherError}
                </div>
              )}

              <form onSubmit={handleTeacherSubmit} className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                      Teacher Username (Full Name)
                    </label>
                    <input
                      type="text"
                      id="teacher-username-input"
                      placeholder="e.g. Clarise Joyce Haguisan"
                      value={teacherUsername}
                      onChange={(e) => setTeacherUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                      Password (Default: &quot;teacher123&quot;)
                    </label>
                    <input
                      type="password"
                      id="teacher-password-input"
                      placeholder="teacher123"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-teacher-login"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Log In with Username</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Click Teacher Accounts grouped by House */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                  <p className="text-xs uppercase font-extrabold text-slate-700 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>House Ambassadors &amp; Counselors (1-Click):</span>
                  </p>
                  {/* House Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setSelectedHouseFilter('all')}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        selectedHouseFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({teachers.length})
                    </button>
                    {houses.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setSelectedHouseFilter(h.id)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          selectedHouseFilter === h.id
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        style={{
                          backgroundColor: selectedHouseFilter === h.id ? h.color : undefined,
                        }}
                      >
                        {h.name.replace('House of ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredTeachers.map((teacher) => {
                    const house = houses.find((h) => h.id === teacher.houseId);
                    return (
                      <button
                        type="button"
                        key={teacher.id}
                        onClick={() => handleQuickTeacher(teacher)}
                        className="p-2.5 text-left bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-700">
                            {teacher.name}
                          </p>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
                            style={{ backgroundColor: house?.color || '#64748B' }}
                          >
                            {teacher.houseRole === 'House Ambassador' ? 'Ambassador' : 'Counselor'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {house?.name || 'Faculty'}
                        </p>
                        <p className="text-[10px] text-slate-600 truncate mt-0.5">
                          Username: <span className="font-bold text-indigo-700">{teacher.username || teacher.name}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
