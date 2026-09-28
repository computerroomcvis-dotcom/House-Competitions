import React, { useState } from 'react';
import {
  House,
  Student,
  TeacherUser,
  AdminUser,
  SportsActivityEvent,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
} from '../types';
import { EditSportsGameModal } from './EditSportsGameModal';
import {
  X,
  Shield,
  Home,
  Users,
  UserCheck,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  RotateCcw,
  Palette,
  AlertCircle,
  Download,
  Award,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Trophy,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
  students: Student[];
  teachers: TeacherUser[];
  adminUsers: AdminUser[];
  sportsEvents: SportsActivityEvent[];
  onUpdateHouses: (houses: House[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateTeachers: (teachers: TeacherUser[]) => void;
  onUpdateAdminUsers: (admins: AdminUser[]) => void;
  onUpdateSportsEvents: (events: SportsActivityEvent[]) => void;
  onResetPointsOnly: () => void;
  onResetAllDefaults: () => void;
}

const COLOR_PRESETS = [
  { name: 'Sky / Storm Blue', hex: '#0284C7' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Mountain Crimson', hex: '#DC2626' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Teal Ocean', hex: '#0D9488' },
  { name: 'Purple Amethyst', hex: '#7C3AED' },
  { name: 'Rose Coral', hex: '#E11D48' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  houses,
  students,
  teachers,
  adminUsers,
  sportsEvents,
  onUpdateHouses,
  onUpdateStudents,
  onUpdateTeachers,
  onUpdateAdminUsers,
  onUpdateSportsEvents,
  onResetPointsOnly,
  onResetAllDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<
    'houses' | 'leadership' | 'students' | 'teachers' | 'sports' | 'data'
  >('houses');

  // Houses Edit State
  const [localHouses, setLocalHouses] = useState<House[]>([...houses]);
  const [houseSaveStatus, setHouseSaveStatus] = useState(false);

  // Leadership Panel Form State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('admin');
  const [newAdminRoleTitle, setNewAdminRoleTitle] = useState('Panel Member');
  const [newAdminPanelRole, setNewAdminPanelRole] = useState<'Co-Chair' | 'Member' | 'Administrator'>('Member');
  const [newAdminSection, setNewAdminSection] = useState<'Preschool' | 'Elementary' | 'Schoolwide'>('Schoolwide');

  // Student Form State
  const [studentSearch, setStudentSearch] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<GradeLevel>('Grade 1');
  const [newStudentHouse, setNewStudentHouse] = useState<string>(houses[0]?.id || '');
  const [newStudentIsPrefect, setNewStudentIsPrefect] = useState(false);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentGrade, setEditStudentGrade] = useState<GradeLevel>('Grade 1');
  const [editStudentHouse, setEditStudentHouse] = useState<string>('');
  const [editStudentIsPrefect, setEditStudentIsPrefect] = useState(false);

  // Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('teacher123');
  const [newTeacherHouse, setNewTeacherHouse] = useState<string>(houses[0]?.id || '');
  const [newTeacherHouseRole, setNewTeacherHouseRole] = useState<'House Ambassador' | 'House Counselor' | 'Teacher'>('House Counselor');
  const [newTeacherGrade, setNewTeacherGrade] = useState<GradeLevel | 'All'>('All');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');

  // Sports Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<any>('Sports Week');
  const [newEventDate, setNewEventDate] = useState('2026-08-25');
  const [newEventActive, setNewEventActive] = useState(true);

  // Full Game Card Modal State for Admin
  const [isAdminGameModalOpen, setIsAdminGameModalOpen] = useState(false);
  const [adminEditingGame, setAdminEditingGame] = useState<SportsActivityEvent | null>(null);

  const handleSaveAdminGame = (saved: SportsActivityEvent) => {
    const exists = sportsEvents.some((e) => e.id === saved.id);
    const updated = exists
      ? sportsEvents.map((e) => (e.id === saved.id ? saved : e))
      : [saved, ...sportsEvents];
    onUpdateSportsEvents(updated);
  };

  // Houses handlers
  const handleHouseFieldChange = (id: string, field: keyof House, val: string) => {
    setLocalHouses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleSaveHouses = () => {
    onUpdateHouses(localHouses);
    setHouseSaveStatus(true);
    setTimeout(() => setHouseSaveStatus(false), 2000);
  };

  // Leadership Panel Handlers
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;

    const fullName = newAdminName.trim();
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: fullName,
      username: newAdminUsername.trim() || fullName,
      email: newAdminEmail.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@crestview.ac.th`,
      password: newAdminPassword.trim() || 'admin',
      roleTitle: newAdminRoleTitle.trim() || 'Leadership Member',
      panelRole: newAdminPanelRole,
      section: newAdminSection,
      createdAt: new Date().toISOString(),
    };

    onUpdateAdminUsers([...adminUsers, newAdmin]);
    setNewAdminName('');
    setNewAdminUsername('');
    setNewAdminEmail('');
    setNewAdminPassword('admin');
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (adminUsers.length <= 1) {
      alert('You must retain at least one administrator account.');
      return;
    }
    if (confirm(`Remove administrator "${name}" from the House Leadership Panel?`)) {
      onUpdateAdminUsers(adminUsers.filter((a) => a.id !== id));
    }
  };

  // Student handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: newStudentName.trim(),
      grade: newStudentGrade,
      houseId: newStudentHouse || houses[0].id,
      isPrefect: newStudentIsPrefect,
    };

    onUpdateStudents([newStudent, ...students]);
    setNewStudentName('');
    setNewStudentIsPrefect(false);
  };

  const handleStartEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setEditStudentName(s.name);
    setEditStudentGrade(s.grade);
    setEditStudentHouse(s.houseId);
    setEditStudentIsPrefect(!!s.isPrefect);
  };

  const handleSaveEditStudent = (id: string) => {
    if (!editStudentName.trim()) return;
    const updated = students.map((s) =>
      s.id === id
        ? {
            ...s,
            name: editStudentName.trim(),
            grade: editStudentGrade,
            houseId: editStudentHouse,
            isPrefect: editStudentIsPrefect,
          }
        : s
    );
    onUpdateStudents(updated);
    setEditingStudentId(null);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove student "${name}"?`)) {
      onUpdateStudents(students.filter((s) => s.id !== id));
    }
  };

  // Teacher handlers
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherPassword.trim()) {
      alert('Please fill out Name and Password.');
      return;
    }

    const fullName = newTeacherName.trim();
    const newTeacher: TeacherUser = {
      id: `teach-${Date.now()}`,
      name: fullName,
      username: newTeacherUsername.trim() || fullName,
      email: newTeacherEmail.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@crestview.ac.th`,
      password: newTeacherPassword.trim(),
      houseId: newTeacherHouse,
      houseRole: newTeacherHouseRole,
      gradeAssigned: newTeacherGrade,
      subject: newTeacherSubject.trim() || `${newTeacherHouseRole} (${houses.find((h) => h.id === newTeacherHouse)?.name || 'House'})`,
      createdAt: new Date().toISOString(),
    };

    onUpdateTeachers([...teachers, newTeacher]);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherEmail('');
    setNewTeacherPassword('teacher123');
    setNewTeacherSubject('');
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      alert('You must keep at least one teacher account in the system.');
      return;
    }
    if (confirm(`Are you sure you want to delete teacher login for "${name}"?`)) {
      onUpdateTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  // Sports Events handlers
  const handleAddSportsEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const initialScores = houses.map((h) => ({ houseId: h.id, points: 0 }));

    const newEvent: SportsActivityEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      description: newEventDesc.trim() || 'Inter-house challenge activity',
      category: newEventCategory,
      date: newEventDate,
      isActive: newEventActive,
      scores: initialScores,
    };

    onUpdateSportsEvents([newEvent, ...sportsEvents]);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  const handleToggleEventActive = (id: string, isActive: boolean) => {
    const updated = sportsEvents.map((e) => (e.id === id ? { ...e, isActive } : e));
    onUpdateSportsEvents(updated);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Remove event "${title}"?`)) {
      onUpdateSportsEvents(sportsEvents.filter((e) => e.id !== id));
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    return s.name.toLowerCase().includes(studentSearch.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="admin-panel-modal"
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] flex items-center gap-2">
                <span>Crestview Administration Console</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-bold border border-rose-400/40">
                  AY 2026-2027
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage Society of Houses, Leadership Panel, Ambassadors, Counselors &amp; Students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 bg-slate-100 border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0 text-xs sm:text-sm font-semibold">
          <button
            id="admin-tab-houses"
            onClick={() => setActiveTab('houses')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'houses'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>4 Houses &amp; Colours</span>
          </button>

          <button
            id="admin-tab-leadership"
            onClick={() => setActiveTab('leadership')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'leadership'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Leadership Panel &amp; Admins ({adminUsers.length})</span>
            <span className="sm:hidden">Admins ({adminUsers.length})</span>
          </button>

          <button
            id="admin-tab-teachers"
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Ambassadors &amp; Counselors ({teachers.length})</span>
            <span className="sm:hidden">Teachers ({teachers.length})</span>
          </button>

          <button
            id="admin-tab-students"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Students &amp; Grades ({students.length})</span>
            <span className="sm:hidden">Students ({students.length})</span>
          </button>

          <button
            id="admin-tab-sports"
            onClick={() => setActiveTab('sports')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'sports'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Sports &amp; Spirit Weeks</span>
            <span className="sm:hidden">Events</span>
          </button>

          <button
            id="admin-tab-data"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'data'
                ? 'bg-white border-rose-600 text-rose-600 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Backup &amp; Reset</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: HOUSES & COLOURS */}
          {activeTab === 'houses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    The 4 Houses of Crestview International School
                  </h3>
                  <p className="text-xs text-slate-500">
                    House of Stormchasers, Mountainhearts, Thunderhooves, and Earthshakers
                  </p>
                </div>
                <button
                  id="save-houses-btn"
                  onClick={handleSaveHouses}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{houseSaveStatus ? 'Saved Successfully!' : 'Save House Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localHouses.map((house) => (
                  <div
                    key={house.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
                    style={{ borderTop: `4px solid ${house.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: house.color }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{house.id}</span>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: house.color }}
                      >
                        {house.name}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                        House Official Name
                      </label>
                      <input
                        type="text"
                        value={house.name}
                        onChange={(e) => handleHouseFieldChange(house.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                          Mascot
                        </label>
                        <input
                          type="text"
                          value={house.mascot}
                          onChange={(e) => handleHouseFieldChange(house.id, 'mascot', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                          Primary Hex Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={house.color}
                            onChange={(e) => handleHouseFieldChange(house.id, 'color', e.target.value)}
                            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={house.color}
                            onChange={(e) => handleHouseFieldChange(house.id, 'color', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Color Presets */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Preset Colors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map((p) => (
                          <button
                            type="button"
                            key={p.hex}
                            onClick={() => handleHouseFieldChange(house.id, 'color', p.hex)}
                            className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-600 tracking-wider mb-1">
                        House Motto
                      </label>
                      <input
                        type="text"
                        value={house.motto}
                        onChange={(e) => handleHouseFieldChange(house.id, 'motto', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg italic"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HOUSE LEADERSHIP PANEL (ADMIN ACCOUNTS) */}
          {activeTab === 'leadership' && (
            <div className="space-y-6">
              {/* Add New Admin Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-600" />
                  Add House Leadership Panel Account (Admin)
                </h3>
                <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Brooklyn Wheldon"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Login Username (Full Name)
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to Full Name"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. wheldon.b@crestview.ac.th"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      placeholder="admin"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Panel Role
                    </label>
                    <select
                      value={newAdminPanelRole}
                      onChange={(e) => setNewAdminPanelRole(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Co-Chair">Co-Chair</option>
                      <option value="Member">Leadership Panel Member</option>
                      <option value="Administrator">Administrator / Consultant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Section / Scope
                    </label>
                    <select
                      value={newAdminSection}
                      onChange={(e) => setNewAdminSection(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Preschool">Preschool</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Schoolwide">Schoolwide</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Official Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Co-Chair [Preschool]"
                      value={newAdminRoleTitle}
                      onChange={(e) => setNewAdminRoleTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Leadership Panel Admin</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Leadership Panel Accounts List */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span>House Leadership Panel Members &amp; Administrators ({adminUsers.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">Memorandum 2026-2027.006</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {admin.name}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              admin.panelRole === 'Co-Chair'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : admin.panelRole === 'Administrator'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {admin.panelRole}
                          </span>
                        </div>
                        <p className="text-xs text-rose-700 font-semibold mt-0.5">
                          {admin.roleTitle} {admin.section ? `• ${admin.section}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          Username: <span className="font-bold text-slate-800">{admin.username || admin.name}</span> • pass: {admin.password}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Admin Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHERS (AMBASSADORS & COUNSELORS) */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              {/* Add Teacher Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-rose-600" />
                  Add House Ambassador or Counselor Account
                </h3>
                <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Teacher Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clarise Joyce Haguisan"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Teacher Username (Full Name)
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to Full Name"
                      value={newTeacherUsername}
                      onChange={(e) => setNewTeacherUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. haguisan.c@crestview.ac.th"
                      value={newTeacherEmail}
                      onChange={(e) => setNewTeacherEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      placeholder="teacher123"
                      value={newTeacherPassword}
                      onChange={(e) => setNewTeacherPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Assigned House
                    </label>
                    <select
                      value={newTeacherHouse}
                      onChange={(e) => setNewTeacherHouse(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      House Responsibility
                    </label>
                    <select
                      value={newTeacherHouseRole}
                      onChange={(e) => setNewTeacherHouseRole(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="House Ambassador">House Ambassador</option>
                      <option value="House Counselor">House Counselor</option>
                      <option value="Teacher">General Teacher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Subject / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Early Years Counselor"
                      value={newTeacherSubject}
                      onChange={(e) => setNewTeacherSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      id="add-teacher-btn"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Faculty Account</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Teachers List */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  House Ambassadors &amp; Counselors ({teachers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teachers.map((t) => {
                    const house = houses.find((h) => h.id === t.houseId);
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {t.name}
                            </p>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: house?.color || '#64748B' }}
                            >
                              {t.houseRole || 'Teacher'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {house?.name || 'General Faculty'}
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                            Username: <span className="font-bold text-slate-800">{t.username || t.name}</span> • pass: {t.password}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteTeacher(t.id, t.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Teacher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDENTS & GRADES */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Add New Student Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-rose-600" />
                  Add New Student (Grades TP – G5)
                </h3>
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pongnapat Supakiatbanchorn"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Grade Level
                    </label>
                    <select
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {ALL_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {GRADE_LABELS[g]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Assigned House
                    </label>
                    <select
                      value={newStudentHouse}
                      onChange={(e) => setNewStudentHouse(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStudentIsPrefect}
                        onChange={(e) => setNewStudentIsPrefect(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <span>House Prefect</span>
                    </label>
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      id="submit-student-btn"
                      className="py-2 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Search & Student List */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Enrolled Students ({filteredStudents.length} of {students.length})
                  </h3>
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64"
                  />
                </div>

                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {filteredStudents.map((s) => {
                    const house = houses.find((h) => h.id === s.houseId);
                    const isEditing = editingStudentId === s.id;

                    return (
                      <div key={s.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {!isEditing ? (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                                style={{ backgroundColor: house?.color || '#64748B' }}
                              >
                                {s.name.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {s.name}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                    {s.grade}
                                  </span>
                                  {s.isPrefect && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                      Prefect
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span style={{ color: house?.color }}>{house?.name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => handleStartEditStudent(s)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(s.id, s.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Inline Edit */
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-300">
                            <input
                              type="text"
                              value={editStudentName}
                              onChange={(e) => setEditStudentName(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                            />
                            <select
                              value={editStudentGrade}
                              onChange={(e) => setEditStudentGrade(e.target.value as any)}
                              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                            >
                              {ALL_GRADES.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editStudentHouse}
                              onChange={(e) => setEditStudentHouse(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                            >
                              {houses.map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveEditStudent(s.id)}
                                className="px-2.5 py-1 text-xs bg-emerald-600 text-white font-bold rounded cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPORTS & SPIRIT ACTIVITIES */}
          {activeTab === 'sports' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-500 text-white uppercase tracking-wider">
                      Sports Week &amp; Inter-House
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {sportsEvents.length} Games Total
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-['Outfit'] text-white">
                    Sports Week Games &amp; Tournament Cards
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Configure complete game information cards: date &amp; time (when), venue (where), participating students, scoring breakdown, rules, and game photo uploads.
                  </p>
                </div>

                <button
                  type="button"
                  id="admin-create-game-btn"
                  onClick={() => {
                    setAdminEditingGame(null);
                    setIsAdminGameModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Create Full Game Card</span>
                </button>
              </div>

              {/* Existing Events List with Rich Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    All Game Cards ({sportsEvents.length})
                  </span>
                  <span className="text-xs text-slate-500">
                    Active games appear prominently on the live public portal
                  </span>
                </div>

                {sportsEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Trophy className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            {event.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {event.date} {event.time && `• ${event.time}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            <Users className="w-3.5 h-3.5" />
                            {event.participatingStudentIds?.length || 0} Athletes
                          </span>
                          <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Shield className="w-3.5 h-3.5" />
                            {event.rules?.length || 0} Rules
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminEditingGame(event);
                          setIsAdminGameModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleEventActive(event.id, !event.isActive)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          event.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {event.isActive ? 'Active (Live)' : 'Archived'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Delete Game"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DATA BACKUP & RESET */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Data Backup &amp; Semester Maintenance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Easily export your Crestview Society of Houses points data for records, start a new semester by clearing points, or restore factory defaults.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">Export Backup JSON</h4>
                    <p className="text-xs text-slate-500">
                      Download all houses, students, teachers, admins, and sports data into a file.
                    </p>
                    <button
                      onClick={() => {
                        const data = { houses, students, teachers, adminUsers, sportsEvents };
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `crestview-houses-backup-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                      }}
                      className="w-full mt-2 py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Backup</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <h4 className="text-sm font-bold text-amber-900">New Term / Reset Points</h4>
                    <p className="text-xs text-amber-700">
                      Resets all merits, demerits, and event points to 0 while keeping your student roster, teachers &amp; admins intact.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Start a new term? All student merits, demerits, and event scores will reset to zero.')) {
                          onResetPointsOnly();
                          alert('House points have been reset for the new semester.');
                        }
                      }}
                      className="w-full mt-2 py-2 px-3 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Season Points</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                    <h4 className="text-sm font-bold text-rose-900">Factory Reset</h4>
                    <p className="text-xs text-rose-700">
                      Reverts all houses, students, teachers, and logs to the official Memorandum seed data.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Restore official Crestview International School AY 2026-2027 defaults?')) {
                          onResetAllDefaults();
                          onClose();
                        }
                      }}
                      className="w-full mt-2 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restore Official Defaults</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Administrator Access Mode Active
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close Admin Panel
          </button>
        </div>
      </div>

      {/* Admin Game Card Creator / Editor Modal */}
      <EditSportsGameModal
        isOpen={isAdminGameModalOpen}
        onClose={() => setIsAdminGameModalOpen(false)}
        event={adminEditingGame}
        houses={houses}
        students={students}
        onSave={handleSaveAdminGame}
      />
    </div>
  );
};
