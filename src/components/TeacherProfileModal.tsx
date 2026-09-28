import React, { useState } from 'react';
import { TeacherUser, GradeLevel, ALL_GRADES } from '../types';
import { X, User, Mail, Lock, CheckCircle, Shield } from 'lucide-react';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: TeacherUser;
  onUpdateTeacher: (updated: TeacherUser) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  onUpdateTeacher,
}) => {
  const [name, setName] = useState(currentTeacher.name);
  const [username, setUsername] = useState(currentTeacher.username || currentTeacher.name);
  const [email, setEmail] = useState(currentTeacher.email || '');
  const [password, setPassword] = useState(currentTeacher.password);
  const [gradeAssigned, setGradeAssigned] = useState<GradeLevel | 'All'>(
    currentTeacher.gradeAssigned || 'All'
  );
  const [subject, setSubject] = useState(currentTeacher.subject || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !password.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const updated: TeacherUser = {
      ...currentTeacher,
      name: name.trim(),
      username: username.trim() || name.trim(),
      email: email.trim() || undefined,
      password: password.trim(),
      gradeAssigned,
      subject: subject.trim(),
    };

    onUpdateTeacher(updated);
    setSuccessMsg('Your login credentials and profile have been updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="teacher-profile-modal"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] leading-tight">
                Teacher Profile &amp; Login Settings
              </h2>
              <p className="text-xs text-slate-500">
                Change your name, login email, and password
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

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
              Teacher Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="edit-teacher-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (username === name) {
                    setUsername(e.target.value);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
              Login Username (Full Name)
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="edit-teacher-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Use your full name to log into the system.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                id="edit-teacher-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
              Change Login Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="edit-teacher-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              You will use this password next time you log in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                Assigned Grade
              </label>
              <select
                value={gradeAssigned}
                onChange={(e) => setGradeAssigned(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
              >
                <option value="All">All Grades (General)</option>
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                Department / Role
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science / Lead"
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-teacher-profile-btn"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
