import React, { useState, useEffect } from 'react';
import {
  House,
  Student,
  TeacherUser,
  AdminUser,
  SportsActivityEvent,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  TabSettings,
  DEFAULT_TAB_SETTINGS,
} from '../types';
import { getDefaultHouseLogo } from '../data/defaultHouseLogos';
import { saveTabSettings } from '../utils/storage';
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
  Award,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Check,
  Upload,
  Sliders,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
  students: Student[];
  teachers: TeacherUser[];
  adminUsers: AdminUser[];
  sportsEvents: SportsActivityEvent[];
  tabSettings?: TabSettings;
  onUpdateHouses: (houses: House[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateTeachers: (teachers: TeacherUser[]) => void;
  onUpdateAdminUsers: (admins: AdminUser[]) => void;
  onUpdateSportsEvents: (events: SportsActivityEvent[]) => void;
  onUpdateTabSettings?: (settings: TabSettings) => void;
  onUpdateEventScores?: (
    eventId: string,
    houseScores: { houseId: string; points: number; placement?: 1 | 2 | 3 | 4 }[]
  ) => void;
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
  tabSettings,
  onUpdateHouses,
  onUpdateStudents,
  onUpdateTeachers,
  onUpdateAdminUsers,
  onUpdateSportsEvents,
  onUpdateTabSettings,
  onUpdateEventScores,
  onResetPointsOnly,
  onResetAllDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<
    'houses' | 'leadership' | 'students' | 'teachers' | 'sports' | 'settings' | 'data'
  >('houses');

  // Site Settings State
  const [localEventsEnabled, setLocalEventsEnabled] = useState<boolean>(
    tabSettings?.events_enabled ?? true
  );
  const [localOfflineMessage, setLocalOfflineMessage] = useState<string>(
    tabSettings?.events_disabled_message ?? DEFAULT_TAB_SETTINGS.events_disabled_message
  );
  const [localResultsEnabled, setLocalResultsEnabled] = useState<boolean>(
    tabSettings?.results_enabled ?? true
  );
  const [localResultsOfflineMessage, setLocalResultsOfflineMessage] = useState<string>(
    tabSettings?.results_disabled_message ?? DEFAULT_TAB_SETTINGS.results_disabled_message
  );
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<boolean>(false);

  useEffect(() => {
    if (tabSettings) {
      setLocalEventsEnabled(tabSettings.events_enabled);
      setLocalOfflineMessage(
        tabSettings.events_disabled_message || DEFAULT_TAB_SETTINGS.events_disabled_message
      );
      setLocalResultsEnabled(tabSettings.results_enabled ?? true);
      setLocalResultsOfflineMessage(
        tabSettings.results_disabled_message || DEFAULT_TAB_SETTINGS.results_disabled_message
      );
    }
  }, [tabSettings]);

  // Placement Scorer State (1st, 2nd, 3rd, 4th Place Boxes)
  const [placementScoringGame, setPlacementScoringGame] = useState<SportsActivityEvent | null>(null);
  const [deskSelectedGameId, setDeskSelectedGameId] = useState<string>('');
  const [placement1stHouse, setPlacement1stHouse] = useState<string>('');
  const [placement2ndHouse, setPlacement2ndHouse] = useState<string>('');
  const [placement3rdHouse, setPlacement3rdHouse] = useState<string>('');
  const [placement4thHouse, setPlacement4thHouse] = useState<string>('');
  const [placement1stPts, setPlacement1stPts] = useState<number>(75);
  const [placement2ndPts, setPlacement2ndPts] = useState<number>(50);
  const [placement3rdPts, setPlacement3rdPts] = useState<number>(30);
  const [placement4thPts, setPlacement4thPts] = useState<number>(20);
  const [placementSaveSuccess, setPlacementSaveSuccess] = useState<string | null>(null);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

  // In-app Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmButtonClass?: string;
    onConfirm: () => void;
  } | null>(null);

  // In-app Alert / Warning Banner State
  const [panelAlert, setPanelAlert] = useState<{
    message: string;
    type: 'error' | 'warning' | 'success';
  } | null>(null);

  // Animated Toasts State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const showPanelAlert = (message: string, type: 'error' | 'warning' | 'success' = 'warning') => {
    setPanelAlert({ message, type });
    addToast(message, type === 'error' ? 'error' : type === 'success' ? 'success' : 'warning');
    setTimeout(() => setPanelAlert(null), 4500);
  };

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = 'Delete',
    confirmButtonClass = 'bg-[#DC2626] hover:bg-rose-500 text-white'
  ) => {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.confirm === 'function' &&
        !window.confirm.toString().includes('[native code]')
      ) {
        if (window.confirm(message)) {
          onConfirm();
        }
        return;
      }
    } catch {
      // ignore
    }

    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmLabel,
      confirmButtonClass,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
    });
  };

  const handleOpenPlacementScorer = (game: SportsActivityEvent, openModal: boolean = false) => {
    setPlacementScoringGame(game);
    setDeskSelectedGameId(game.id);
    setPlacementSaveSuccess(null);

    const s1 = game.scores?.find((s) => s.placement === 1);
    const s2 = game.scores?.find((s) => s.placement === 2);
    const s3 = game.scores?.find((s) => s.placement === 3);
    const s4 = game.scores?.find((s) => s.placement === 4);

    setPlacement1stHouse(s1?.houseId || '');
    setPlacement2ndHouse(s2?.houseId || '');
    setPlacement3rdHouse(s3?.houseId || '');
    setPlacement4thHouse(s4?.houseId || '');

    setPlacement1stPts(s1?.points ?? game.scoringBreakdown?.firstPlace ?? 75);
    setPlacement2ndPts(s2?.points ?? game.scoringBreakdown?.secondPlace ?? 50);
    setPlacement3rdPts(s3?.points ?? game.scoringBreakdown?.thirdPlace ?? 30);
    setPlacement4thPts(s4?.points ?? game.scoringBreakdown?.fourthPlace ?? 20);

    if (openModal) {
      setIsPlacementModalOpen(true);
    }
  };

  const handleChooseHouseForPlace = (place: 1 | 2 | 3 | 4, houseId: string) => {
    if (place === 1) {
      if (placement1stHouse === houseId) {
        setPlacement1stHouse('');
        return;
      }
      if (placement2ndHouse === houseId) setPlacement2ndHouse('');
      if (placement3rdHouse === houseId) setPlacement3rdHouse('');
      if (placement4thHouse === houseId) setPlacement4thHouse('');
      setPlacement1stHouse(houseId);
    } else if (place === 2) {
      if (placement2ndHouse === houseId) {
        setPlacement2ndHouse('');
        return;
      }
      if (placement1stHouse === houseId) setPlacement1stHouse('');
      if (placement3rdHouse === houseId) setPlacement3rdHouse('');
      if (placement4thHouse === houseId) setPlacement4thHouse('');
      setPlacement2ndHouse(houseId);
    } else if (place === 3) {
      if (placement3rdHouse === houseId) {
        setPlacement3rdHouse('');
        return;
      }
      if (placement1stHouse === houseId) setPlacement1stHouse('');
      if (placement2ndHouse === houseId) setPlacement2ndHouse('');
      if (placement4thHouse === houseId) setPlacement4thHouse('');
      setPlacement3rdHouse(houseId);
    } else if (place === 4) {
      if (placement4thHouse === houseId) {
        setPlacement4thHouse('');
        return;
      }
      if (placement1stHouse === houseId) setPlacement1stHouse('');
      if (placement2ndHouse === houseId) setPlacement2ndHouse('');
      if (placement3rdHouse === houseId) setPlacement3rdHouse('');
      setPlacement4thHouse(houseId);
    }
  };

  const handleSavePlacements = () => {
    if (!placementScoringGame) return;

    const newScores: { houseId: string; points: number; placement?: 1 | 2 | 3 | 4 }[] = [];
    if (placement1stHouse) {
      newScores.push({ houseId: placement1stHouse, points: Number(placement1stPts) || 0, placement: 1 });
    }
    if (placement2ndHouse) {
      newScores.push({ houseId: placement2ndHouse, points: Number(placement2ndPts) || 0, placement: 2 });
    }
    if (placement3rdHouse) {
      newScores.push({ houseId: placement3rdHouse, points: Number(placement3rdPts) || 0, placement: 3 });
    }
    if (placement4thHouse) {
      newScores.push({ houseId: placement4thHouse, points: Number(placement4thPts) || 0, placement: 4 });
    }

    // Include other houses with 0 pts if unranked
    houses.forEach((h) => {
      if (!newScores.some((s) => s.houseId === h.id)) {
        newScores.push({ houseId: h.id, points: 0 });
      }
    });

    const updatedGame: SportsActivityEvent = {
      ...placementScoringGame,
      scores: newScores,
    };

    const updatedEvents = sportsEvents.map((e) =>
      e.id === placementScoringGame.id ? updatedGame : e
    );

    onUpdateSportsEvents(updatedEvents);
    if (onUpdateEventScores) {
      onUpdateEventScores(placementScoringGame.id, newScores);
    }

    setPlacementSaveSuccess(
      `Official placements for "${placementScoringGame.title}" saved and synced to House Cup!`
    );
    addToast(`Placements for "${placementScoringGame.title}" updated successfully!`, 'success');
    setTimeout(() => {
      setPlacementSaveSuccess(null);
      setIsPlacementModalOpen(false);
    }, 1800);
  };

  const handleClearPlacements = () => {
    if (!placementScoringGame) return;
    const clearedScores = houses.map((h) => ({ houseId: h.id, points: 0 }));
    const updatedGame: SportsActivityEvent = { ...placementScoringGame, scores: clearedScores };
    const updatedEvents = sportsEvents.map((e) =>
      e.id === placementScoringGame.id ? updatedGame : e
    );
    onUpdateSportsEvents(updatedEvents);
    if (onUpdateEventScores) {
      onUpdateEventScores(placementScoringGame.id, clearedScores);
    }
    setPlacement1stHouse('');
    setPlacement2ndHouse('');
    setPlacement3rdHouse('');
    setPlacement4thHouse('');
    setPlacementSaveSuccess(`Placements cleared for "${placementScoringGame.title}".`);
    addToast(`Placements cleared for "${placementScoringGame.title}".`, 'warning');
    setTimeout(() => {
      setPlacementSaveSuccess(null);
    }, 1500);
  };

  const renderPlaceBox = (
    place: 1 | 2 | 3 | 4,
    title: string,
    medal: string,
    chosenHouseId: string,
    points: number,
    onPointsChange: (val: number) => void,
    borderColor: string,
    bgColor: string,
    accentTextColor: string
  ) => {
    const chosenHouse = houses.find((h) => h.id === chosenHouseId);

    return (
      <div
        key={`place-box-${place}`}
        className={`rounded-xl border-2 p-4 transition-all flex flex-col justify-between space-y-3.5 shadow-sm ${
          chosenHouse ? 'ring-2' : ''
        } ${borderColor} ${bgColor}`}
        style={{
          boxShadow: chosenHouse ? `0 0 16px ${chosenHouse.color}25` : undefined,
          borderColor: chosenHouse ? chosenHouse.color : undefined,
        }}
      >
        <div>
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#30363d]">
            <div className="flex items-center gap-1.5">
              <span className="text-xl shrink-0">{medal}</span>
              <div>
                <span className={`text-xs font-black uppercase tracking-wider block ${accentTextColor}`}>
                  {title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {place === 1 ? 'Championship' : place === 2 ? 'Runner-Up' : place === 3 ? 'Bronze' : 'Participant'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363d] px-2 py-1 rounded-md shrink-0 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500">+</span>
              <input
                type="number"
                min="0"
                max="500"
                value={points}
                onChange={(e) => onPointsChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 text-xs font-black text-[#F0F6FC] bg-transparent text-center focus:outline-none"
                title="Points awarded for this placement"
              />
              <span className="text-[10px] font-bold text-slate-400">pts</span>
            </div>
          </div>

          {/* Winning House Indicator */}
          <div className="mt-3">
            {chosenHouse ? (
              <div
                className="p-3 rounded-xl text-white font-bold flex items-center justify-between gap-2 shadow-xs transition-transform transform active:scale-98"
                style={{ backgroundColor: chosenHouse.color }}
              >
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-black text-white/85 block">
                    {medal} Winner of {title}
                  </span>
                  <span className="text-sm font-black truncate block">
                    {chosenHouse.name}
                  </span>
                  <span className="text-[10px] text-white/95 block">
                    {chosenHouse.mascot} &bull; +{points} pts awarded
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleChooseHouseForPlace(place, '')}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center shrink-0 cursor-pointer"
                  title="Remove house selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-[#30363d] bg-[#0D1117]/40 text-center">
                <span className="text-xs text-slate-400 font-semibold block">
                  No house chosen yet
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Click a house below to assign {title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* House Chooser */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Choose House:
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            {houses.map((house) => {
              const isSelected = chosenHouseId === house.id;
              return (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => handleChooseHouseForPlace(place, house.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'text-white shadow-xs font-black'
                      : 'bg-[#161B22] hover:bg-[#21262d] text-slate-300 border-[#30363d]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? house.color : undefined,
                    borderColor: isSelected ? house.color : undefined,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : house.color }}
                  />
                  <span className="truncate text-[11px] leading-tight">
                    {house.name.replace('House of ', '')}
                  </span>
                  {isSelected && <Check className="w-3 h-3 ml-auto text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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
    addToast(`Game card "${saved.title}" saved successfully!`, 'success');
  };

  // Houses handlers
  const handleHouseFieldChange = (id: string, field: keyof House, val: string) => {
    setLocalHouses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleHouseLogoFileUpload = (houseId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      showPanelAlert('Please select a valid image file (PNG, JPG, SVG, WebP).', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showPanelAlert('Image file size must be less than 5MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        const updated = localHouses.map((h) =>
          h.id === houseId ? { ...h, logoUrl: dataUrl } : h
        );
        setLocalHouses(updated);
        onUpdateHouses(updated);
        setHouseSaveStatus(true);
        addToast('House logo uploaded successfully!', 'success');
        setTimeout(() => setHouseSaveStatus(false), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetHouseLogo = (houseId: string) => {
    const defaultLogo = getDefaultHouseLogo(houseId);
    const updated = localHouses.map((h) =>
      h.id === houseId ? { ...h, logoUrl: defaultLogo } : h
    );
    setLocalHouses(updated);
    onUpdateHouses(updated);
    setHouseSaveStatus(true);
    addToast('House logo reset to default handbook crest.', 'success');
    setTimeout(() => setHouseSaveStatus(false), 2000);
  };

  const handleSaveHouses = () => {
    onUpdateHouses(localHouses);
    setHouseSaveStatus(true);
    addToast('All House changes saved successfully!', 'success');
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
    addToast(`Leadership panel admin "${fullName}" added successfully!`, 'success');
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (adminUsers.length <= 1) {
      showPanelAlert('You must retain at least one administrator account.', 'warning');
      return;
    }
    requestConfirm(
      'Remove Administrator',
      `Remove administrator "${name}" from the House Leadership Panel?`,
      () => {
        onUpdateAdminUsers(adminUsers.filter((a) => a.id !== id));
        showPanelAlert(`Administrator "${name}" removed.`, 'success');
      },
      'Remove Administrator',
      'bg-[#DC2626] hover:bg-rose-500 text-white'
    );
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
    addToast(`Student "${newStudent.name}" enrolled successfully!`, 'success');
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
    addToast('Student details updated successfully.', 'success');
  };

  const handleDeleteStudent = (id: string, name: string) => {
    requestConfirm(
      'Remove Student',
      `Are you sure you want to remove student "${name}"?`,
      () => {
        onUpdateStudents(students.filter((s) => s.id !== id));
        showPanelAlert(`Student "${name}" removed.`, 'success');
      },
      'Remove Student',
      'bg-[#DC2626] hover:bg-rose-500 text-white'
    );
  };

  // Teacher handlers
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherPassword.trim()) {
      showPanelAlert('Please fill out Name and Password.', 'warning');
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
    addToast(`Faculty account for "${fullName}" created successfully!`, 'success');
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      showPanelAlert('You must keep at least one teacher account in the system.', 'warning');
      return;
    }
    requestConfirm(
      'Delete Teacher',
      `Are you sure you want to delete teacher login for "${name}"?`,
      () => {
        onUpdateTeachers(teachers.filter((t) => t.id !== id));
        showPanelAlert(`Teacher account "${name}" deleted.`, 'success');
      },
      'Delete Teacher',
      'bg-[#DC2626] hover:bg-rose-500 text-white'
    );
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
    addToast(`Game card "${newEvent.title}" created.`, 'success');
  };

  const handleToggleEventActive = (id: string, currentVal: boolean) => {
    const updated = sportsEvents.map((e) =>
      e.id === id ? { ...e, isActive: currentVal } : e
    );
    onUpdateSportsEvents(updated);
    addToast(`Game card status updated successfully.`, 'success');
  };

  const executeDeleteEvent = (id: string, title: string) => {
    const updated = sportsEvents.filter((e) => e.id !== id);
    localStorage.setItem('crestview_house_points_sports_events_v7', JSON.stringify(updated));
    onUpdateSportsEvents(updated);

    if (placementScoringGame?.id === id) {
      setPlacementScoringGame(null);
      setDeskSelectedGameId('');
    }
    setPlacementSaveSuccess(`Game card "${title}" deleted permanently.`);
    showPanelAlert(`Game card "${title}" deleted permanently.`, 'success');
    setTimeout(() => setPlacementSaveSuccess(null), 3000);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    requestConfirm(
      'Delete Game Card',
      'Are you sure you want to delete this game card?',
      () => executeDeleteEvent(id, title),
      'Delete Game Card',
      'bg-[#DC2626] hover:bg-rose-500 text-white'
    );
  };

  const handleSaveSiteSettings = () => {
    const newSettings: TabSettings = {
      events_enabled: localEventsEnabled,
      events_disabled_message:
        localOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.events_disabled_message,
      results_enabled: localResultsEnabled,
      results_disabled_message:
        localResultsOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.results_disabled_message,
    };
    if (onUpdateTabSettings) {
      onUpdateTabSettings(newSettings);
    }
    saveTabSettings(newSettings);
    setSettingsSaveStatus(true);
    addToast('Site Control settings updated.', 'success');
    setTimeout(() => setSettingsSaveStatus(false), 2500);
  };

  const handleToggleEventsActive = (newVal: boolean) => {
    setLocalEventsEnabled(newVal);
    const newSettings: TabSettings = {
      events_enabled: newVal,
      events_disabled_message:
        localOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.events_disabled_message,
      results_enabled: localResultsEnabled,
      results_disabled_message:
        localResultsOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.results_disabled_message,
    };
    if (onUpdateTabSettings) {
      onUpdateTabSettings(newSettings);
    }
    saveTabSettings(newSettings);
    setSettingsSaveStatus(true);
    addToast(
      newVal ? 'Public Events Tab is now LIVE!' : 'Public Events Tab is now OFFLINE.',
      newVal ? 'success' : 'warning'
    );
    setTimeout(() => setSettingsSaveStatus(false), 2500);
  };

  const handleToggleResultsActive = (newVal: boolean) => {
    setLocalResultsEnabled(newVal);
    const newSettings: TabSettings = {
      events_enabled: localEventsEnabled,
      events_disabled_message:
        localOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.events_disabled_message,
      results_enabled: newVal,
      results_disabled_message:
        localResultsOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.results_disabled_message,
    };
    if (onUpdateTabSettings) {
      onUpdateTabSettings(newSettings);
    }
    saveTabSettings(newSettings);
    setSettingsSaveStatus(true);
    addToast(
      newVal ? 'House Results Tab is now LIVE!' : 'House Results Tab is now OFFLINE.',
      newVal ? 'success' : 'warning'
    );
    setTimeout(() => setSettingsSaveStatus(false), 2500);
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    return s.name.toLowerCase().includes(studentSearch.toLowerCase());
  });

  if (!isOpen) return null;

  const activeGamesCount = sportsEvents.filter((e) => e.isActive).length;
  const liveStatus = localEventsEnabled ? 'Live' : 'Offline';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0d1117]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-right duration-200 ${
              toast.type === 'error'
                ? 'bg-[#1C161D] border-[#DC2626]/40 text-[#FFA7A6]'
                : toast.type === 'success'
                ? 'bg-[#141C15] border-[#10B981]/40 text-[#A6F7B1]'
                : 'bg-[#1C1A14] border-[#F59E0B]/40 text-[#FCD34D]'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-sm font-black leading-none opacity-60 hover:opacity-100 cursor-pointer"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div
        id="admin-panel-modal"
        className="bg-[#0D1117] text-[#F0F6FC] w-full max-w-6xl rounded-2xl shadow-2xl border border-[#30363d] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] max-h-[90vh] animate-in zoom-in-95 duration-200 font-['Plus_Jakarta_Sans',sans-serif]"
      >
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-72 bg-[#161B22] border-b md:border-b-0 md:border-r border-[#30363d] flex flex-col shrink-0">
          {/* Brand/Console Title */}
          <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black font-['Outfit'] text-[#F0F6FC] leading-tight">Crestview Console</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AY 2026-2027</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-[#F0F6FC] rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Options */}
          <nav className="flex-1 overflow-y-auto p-3 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar scroll-smooth shrink-0 md:shrink text-xs sm:text-sm font-semibold">
            <button
              id="admin-tab-houses"
              onClick={() => setActiveTab('houses')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'houses'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <Home className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>🏠 House Management</span>
            </button>

            <button
              id="admin-tab-sports"
              onClick={() => setActiveTab('sports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'sports'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>🎮 Game Cards Manager</span>
            </button>

            <button
              id="admin-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>⚙️ Site Controls</span>
            </button>

            <button
              id="admin-tab-leadership"
              onClick={() => setActiveTab('leadership')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'leadership'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <Shield className="w-4 h-4 text-rose-500" />
              <span>👥 Leadership Panel</span>
            </button>

            <button
              id="admin-tab-teachers"
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>🎓 Ambassadors &amp; Counselors</span>
            </button>

            <button
              id="admin-tab-students"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>👤 Students &amp; Grades</span>
            </button>

            <button
              id="admin-tab-data"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-[#21262d] text-white border-l-2 border-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#21262d]/40'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-violet-500" />
              <span>📊 Backup &amp; Reset</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="hidden md:flex p-4 border-t border-[#30363d] items-center justify-between text-xs text-slate-400">
            <span>Admin Active</span>
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#F0F6FC] rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Main Dashboard Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Quick Stat Header Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#161B22] border-b border-[#30363d] shrink-0 text-slate-300">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Game Cards</span>
              <span className="text-sm font-black text-[#F0F6FC] mt-0.5 tabular-nums">
                {activeGamesCount} <span className="text-[11px] text-slate-500 font-medium">/ {sportsEvents.length} Total</span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Public Tabs Status</span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs font-bold">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      localEventsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className={localEventsEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                    Events: {localEventsEnabled ? 'Live' : 'Off'}
                  </span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      localResultsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className={localResultsEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                    Results: {localResultsEnabled ? 'Live' : 'Off'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Configured Houses</span>
              <span className="text-sm font-black text-[#F0F6FC] mt-0.5">
                {houses.length} Active
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Students</span>
              <span className="text-sm font-black text-[#F0F6FC] mt-0.5 tabular-nums">
                {students.length} Total
              </span>
            </div>
          </div>

          {/* Scrollable Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {panelAlert && (
              <div
                className={`p-3.5 rounded-lg text-xs font-bold flex items-center justify-between gap-2 border transition-all ${
                  panelAlert.type === 'error'
                    ? 'bg-[#1C161D] border-[#DC2626]/40 text-[#FFA7A6]'
                    : panelAlert.type === 'success'
                    ? 'bg-[#141C15] border-[#10B981]/40 text-[#A6F7B1]'
                    : 'bg-[#1C1A14] border-[#F59E0B]/40 text-[#FCD34D]'
                }`}
              >
                <span>{panelAlert.message}</span>
                <button
                  type="button"
                  onClick={() => setPanelAlert(null)}
                  className="text-sm font-black leading-none opacity-60 hover:opacity-100 cursor-pointer px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* TAB 1: HOUSES & COLOURS */}
            {activeTab === 'houses' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
                  <div>
                    <h3 className="text-base font-bold text-[#F0F6FC]">
                      Society of the 4 Houses
                    </h3>
                    <p className="text-xs text-slate-400">
                      Customize Mascots, Mottos, Colors, and official Crest Logos
                    </p>
                  </div>
                  <button
                    id="save-houses-btn"
                    onClick={handleSaveHouses}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{houseSaveStatus ? 'Saved Successfully!' : 'Save House Changes'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {localHouses.map((house) => (
                    <div
                      key={house.id}
                      className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4 relative overflow-hidden transition-all hover:border-[#444c56]"
                    >
                      {/* Top Accent Line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: house.color }}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: house.color }}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{house.id}</span>
                        </div>
                        <span
                          className="text-xs font-black px-2.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: house.color }}
                        >
                          {house.name}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                            House Official Name
                          </label>
                          <input
                            type="text"
                            value={house.name}
                            onChange={(e) => handleHouseFieldChange(house.id, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                              Mascot
                            </label>
                            <input
                              type="text"
                              value={house.mascot}
                              onChange={(e) => handleHouseFieldChange(house.id, 'mascot', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                              Accent Hex Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={house.color}
                                onChange={(e) => handleHouseFieldChange(house.id, 'color', e.target.value)}
                                className="w-8 h-8 rounded border border-[#30363d] bg-transparent cursor-pointer shrink-0"
                              />
                              <input
                                type="text"
                                value={house.color}
                                onChange={(e) => handleHouseFieldChange(house.id, 'color', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs font-mono bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] uppercase focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Color Presets */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Quick Color Presets:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {COLOR_PRESETS.map((p) => (
                              <button
                                type="button"
                                key={p.hex}
                                onClick={() => handleHouseFieldChange(house.id, 'color', p.hex)}
                                className="w-5 h-5 rounded-full border border-[#30363d] hover:scale-110 transition-transform cursor-pointer"
                                style={{ backgroundColor: p.hex }}
                                title={p.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                            House Motto
                          </label>
                          <input
                            type="text"
                            value={house.motto}
                            onChange={(e) => handleHouseFieldChange(house.id, 'motto', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 italic"
                          />
                        </div>

                        {/* Circular Logo Upload & Config UI */}
                        <div className="pt-3.5 border-t border-[#30363d] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Logo Configuration
                            </label>
                            {house.logoUrl && (
                              <button
                                type="button"
                                onClick={() => handleResetHouseLogo(house.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-400 font-bold cursor-pointer transition-colors"
                              >
                                Reset to Default Crest
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Circular Thumbnail with Hover Upload Action */}
                            <div
                              className="relative group w-16 h-16 rounded-full border-2 flex items-center justify-center p-1.5 bg-[#0D1117] shrink-0 overflow-hidden shadow-md"
                              style={{ borderColor: house.color }}
                            >
                              {house.logoUrl ? (
                                <img
                                  src={house.logoUrl}
                                  alt={house.name}
                                  className="w-full h-full object-contain rounded-full"
                                />
                              ) : (
                                <Award className="w-6 h-6 text-slate-400" />
                              )}
                              {/* Change Logo Hover Overlay overlay */}
                              <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[9px] font-black text-white text-center p-1">
                                <Upload className="w-3.5 h-3.5 mb-0.5 text-white" />
                                <span>Change</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleHouseLogoFileUpload(house.id, file);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            <div className="flex-1 space-y-1.5 min-w-0">
                              <input
                                type="text"
                                value={house.logoUrl || ''}
                                onChange={(e) =>
                                  handleHouseFieldChange(house.id, 'logoUrl', e.target.value)
                                }
                                placeholder="Enter image URL (https://...)"
                                className="w-full px-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                              />
                              <p className="text-[9px] text-slate-500">
                                Click thumbnail to upload file or paste a direct image address above.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: HOUSE LEADERSHIP PANEL (ADMIN ACCOUNTS) */}
            {activeTab === 'leadership' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#F0F6FC] mb-4 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-rose-500" />
                    Add House Leadership Panel Account (Admin)
                  </h3>
                  <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Brooklyn Wheldon"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Login Username (Full Name)
                      </label>
                      <input
                        type="text"
                        placeholder="Defaults to Full Name"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. wheldon.b@crestview.ac.th"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Password
                      </label>
                      <input
                        type="text"
                        placeholder="admin"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Panel Role
                      </label>
                      <select
                        value={newAdminPanelRole}
                        onChange={(e) => setNewAdminPanelRole(e.target.value as any)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Co-Chair">Co-Chair</option>
                        <option value="Member">Leadership Panel Member</option>
                        <option value="Administrator">Administrator / Consultant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Section / Scope
                      </label>
                      <select
                        value={newAdminSection}
                        onChange={(e) => setNewAdminSection(e.target.value as any)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Preschool">Preschool</option>
                        <option value="Elementary">Elementary</option>
                        <option value="Schoolwide">Schoolwide</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Official Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Co-Chair [Preschool]"
                        value={newAdminRoleTitle}
                        onChange={(e) => setNewAdminRoleTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Leadership Panel Admin</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Leadership Panel Accounts List */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                    <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-500" />
                      <span>Admin Accounts &amp; Leadership Panel ({adminUsers.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className="p-4 rounded-xl border border-[#30363d] bg-[#0D1117] hover:border-[#444c56] transition-all flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#F0F6FC] text-xs sm:text-sm">
                              {admin.name}
                            </p>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                admin.panelRole === 'Co-Chair'
                                  ? 'bg-rose-950/40 text-rose-300 border border-rose-900/30'
                                  : admin.panelRole === 'Administrator'
                                  ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/30'
                                  : 'bg-[#21262d] text-slate-300 border border-[#30363d]'
                              }`}
                            >
                              {admin.panelRole}
                            </span>
                          </div>
                          <p className="text-xs text-rose-400 font-semibold mt-1">
                            {admin.roleTitle} {admin.section ? `• ${admin.section}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 font-mono">
                            User: <span className="font-bold text-[#F0F6FC]">{admin.username || admin.name}</span> · Pass: {admin.password}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer transition-colors"
                          title="Delete Admin Account"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEACHERS (AMBASSADORS & COUNSELORS) */}
            {activeTab === 'teachers' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Add Teacher Form */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#F0F6FC] mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-rose-600" />
                    Add House Ambassador or Counselor Account
                  </h3>
                  <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Teacher Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clarise Joyce Haguisan"
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Teacher Username (Full Name)
                      </label>
                      <input
                        type="text"
                        placeholder="Defaults to Full Name"
                        value={newTeacherUsername}
                        onChange={(e) => setNewTeacherUsername(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. haguisan.c@crestview.ac.th"
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Password
                      </label>
                      <input
                        type="text"
                        placeholder="teacher123"
                        value={newTeacherPassword}
                        onChange={(e) => setNewTeacherPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Assigned House
                      </label>
                      <select
                        value={newTeacherHouse}
                        onChange={(e) => setNewTeacherHouse(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {houses.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        House Responsibility
                      </label>
                      <select
                        value={newTeacherHouseRole}
                        onChange={(e) => setNewTeacherHouseRole(e.target.value as any)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="House Ambassador">House Ambassador</option>
                        <option value="House Counselor">House Counselor</option>
                        <option value="Teacher">General Teacher</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Subject / Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Early Years Counselor"
                        value={newTeacherSubject}
                        onChange={(e) => setNewTeacherSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        id="add-teacher-btn"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Faculty Account</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Teachers List */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#F0F6FC] pb-2 border-b border-[#30363d]">
                    Registered Faculty, Ambassadors &amp; Counselors ({teachers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teachers.map((t) => {
                      const house = houses.find((h) => h.id === t.houseId);
                      return (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl border border-[#30363d] bg-[#0D1117] hover:border-[#444c56] transition-all flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#F0F6FC] text-xs sm:text-sm truncate">
                                {t.name}
                              </p>
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: house?.color || '#64748B' }}
                              >
                                {t.houseRole || 'Teacher'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold mt-1" style={{ color: house?.color || '#94A3B8' }}>
                              {house?.name || 'General Faculty'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 font-mono">
                              User: <span className="font-bold text-[#F0F6FC]">{t.username || t.name}</span> · Pass: {t.password}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteTeacher(t.id, t.name)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
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
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Add New Student Form */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#F0F6FC] mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-rose-600" />
                    Add New Student (Grades TP – G5)
                  </h3>
                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pongnapat Supakiatbanchorn"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Grade Level
                      </label>
                      <select
                        value={newStudentGrade}
                        onChange={(e) => setNewStudentGrade(e.target.value as any)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {ALL_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {GRADE_LABELS[g]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Assigned House
                      </label>
                      <select
                        value={newStudentHouse}
                        onChange={(e) => setNewStudentHouse(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {houses.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 h-10">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStudentIsPrefect}
                          onChange={(e) => setNewStudentIsPrefect(e.target.checked)}
                          className="rounded bg-[#0D1117] border-[#30363d] text-rose-500 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>House Prefect</span>
                      </label>
                    </div>

                    <div className="sm:col-span-4 flex justify-end">
                      <button
                        type="submit"
                        id="submit-student-btn"
                        className="py-2 px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Student</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Search & Student List */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#30363d]">
                    <h3 className="text-sm font-bold text-[#F0F6FC]">
                      Enrolled Students ({filteredStudents.length} of {students.length})
                    </h3>
                    <input
                      type="text"
                      placeholder="Search by student name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363d] rounded-md w-full sm:w-64 text-[#F0F6FC] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="divide-y divide-[#30363d] max-h-[420px] overflow-y-auto pr-1">
                    {filteredStudents.map((s) => {
                      const house = houses.find((h) => h.id === s.houseId);
                      const isEditing = editingStudentId === s.id;

                      return (
                        <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          {!isEditing ? (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                                  style={{ backgroundColor: house?.color || '#64748B' }}
                                >
                                  {s.name.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-[#F0F6FC] text-xs sm:text-sm">
                                      {s.name}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#21262d] text-slate-300 border border-[#30363d]">
                                      {s.grade}
                                    </span>
                                    {s.isPrefect && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                                        Prefect
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] mt-1 font-semibold">
                                    <span style={{ color: house?.color }}>{house?.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                <button
                                  onClick={() => handleStartEditStudent(s)}
                                  className="p-1.5 text-slate-400 hover:text-white bg-[#21262d] border border-[#30363d] rounded-md cursor-pointer transition-colors"
                                  title="Edit Student"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s.id, s.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 bg-[#21262d] border border-[#30363d] rounded-md cursor-pointer transition-colors"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              </div>
                            </>
                          ) : (
                            /* Inline Edit */
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0D1117] p-3 rounded-lg border border-[#30363d] items-center">
                              <input
                                type="text"
                                value={editStudentName}
                                onChange={(e) => setEditStudentName(e.target.value)}
                                className="px-3 py-1.5 text-xs bg-[#161B22] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none"
                              />
                              <select
                                value={editStudentGrade}
                                onChange={(e) => setEditStudentGrade(e.target.value as any)}
                                className="px-2 py-1.5 text-xs bg-[#161B22] border border-[#30363d] rounded-md text-[#F0F6FC]"
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
                                className="px-2 py-1.5 text-xs bg-[#161B22] border border-[#30363d] rounded-md text-[#F0F6FC]"
                              >
                                {houses.map((h) => (
                                  <option key={h.id} value={h.id}>
                                    {h.name}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => handleSaveEditStudent(s.id)}
                                  className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingStudentId(null)}
                                  className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-slate-300 rounded-md cursor-pointer"
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

            {/* TAB 5: SPORTS & TOURNAMENT MANAGEMENT */}
            {activeTab === 'sports' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#161B22] to-[#21262d] rounded-xl p-5 border border-[#30363d] text-[#F0F6FC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                        Sports Week &amp; Inter-House
                      </span>
                      <span className="text-xs text-slate-400 font-bold tabular-nums">
                        {sportsEvents.length} Games Total
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-['Outfit'] text-[#F0F6FC]">
                      Sports Week Games &amp; Tournament Cards
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Configure complete game cards: time (when), venue (where), participating student rosters, and placements scoring criteria.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="admin-create-game-btn"
                    onClick={() => {
                      setAdminEditingGame(null);
                      setIsAdminGameModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-md flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Create Full Game Card</span>
                  </button>
                </div>

                {/* TOURNAMENT PLACEMENTS DESK */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-[#30363d]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                        <Trophy className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-[#F0F6FC] font-['Outfit']">
                            Official Tournament Placements Desk
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          Choose a game, assign placements (1st to 4th), and award scores.
                        </p>
                      </div>
                    </div>

                    {/* Quick Game Selector Dropdown */}
                    <div className="flex items-center gap-2.5 shrink-0 w-full xl:w-auto">
                      <label className="text-xs font-bold text-slate-400 whitespace-nowrap">
                        Select Game:
                      </label>
                      <select
                        value={deskSelectedGameId || placementScoringGame?.id || ''}
                        onChange={(e) => {
                          const gameId = e.target.value;
                          const found = sportsEvents.find((g) => g.id === gameId);
                          if (found) {
                            handleOpenPlacementScorer(found);
                          } else {
                            setPlacementScoringGame(null);
                            setDeskSelectedGameId('');
                          }
                        }}
                        className="px-3 py-2 text-xs font-bold bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] focus:outline-none focus:border-amber-500 cursor-pointer w-full xl:w-72 truncate"
                      >
                        <option value="">-- Choose a Game to Score ({sportsEvents.length}) --</option>
                        {sportsEvents.map((g) => {
                          const isScored = g.scores && g.scores.some((s) => s.points > 0);
                          return (
                            <option key={g.id} value={g.id}>
                              {isScored ? '🏆' : '⏳'} {g.title} ({g.category})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Success Notification Alert */}
                  {placementSaveSuccess && (
                    <div className="p-3 bg-[#141C15] border border-[#10B981]/40 text-[#A6F7B1] rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span>{placementSaveSuccess}</span>
                      </div>
                    </div>
                  )}

                  {/* If a game is selected, render the 4 Place Boxes */}
                  {placementScoringGame ? (
                    <div className="space-y-4 pt-1">
                      {/* Game Details Banner */}
                      <div className="bg-[#0D1117] border border-[#30363d] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {placementScoringGame.category}
                            </span>
                            <h4 className="font-extrabold text-sm text-[#F0F6FC] font-['Outfit']">
                              {placementScoringGame.title}
                            </h4>
                            {placementScoringGame.isActive && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                                Live In Progress
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 mt-1 font-medium">
                            {placementScoringGame.location && `Venue: ${placementScoringGame.location} • `}
                            Scoring: {placementScoringGame.scoringSystem}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleSavePlacements}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-md shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Publish Results</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleClearPlacements}
                            className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-bold rounded-md cursor-pointer transition-colors border border-[#30363d]"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* THE 4 PLACE BOXES */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderPlaceBox(
                          1,
                          '1st Place Box',
                          '🥇',
                          placement1stHouse,
                          placement1stPts,
                          (v) => setPlacement1stPts(v),
                          'border-amber-400/40',
                          'bg-[#1e1c12]',
                          'text-amber-300'
                        )}

                        {renderPlaceBox(
                          2,
                          '2nd Place Box',
                          '🥈',
                          placement2ndHouse,
                          placement2ndPts,
                          (v) => setPlacement2ndPts(v),
                          'border-slate-500/40',
                          'bg-[#191b22]',
                          'text-slate-300'
                        )}

                        {renderPlaceBox(
                          3,
                          '3rd Place Box',
                          '🥉',
                          placement3rdHouse,
                          placement3rdPts,
                          (v) => setPlacement3rdPts(v),
                          'border-amber-700/40',
                          'bg-[#1b1712]',
                          'text-amber-600'
                        )}

                        {renderPlaceBox(
                          4,
                          '4th Place Box',
                          '🎖️',
                          placement4thHouse,
                          placement4thPts,
                          (v) => setPlacement4thPts(v),
                          'border-indigo-500/40',
                          'bg-[#151722]',
                          'text-indigo-300'
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-[#0D1117] rounded-xl border border-dashed border-[#30363d]">
                      <Trophy className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">
                        No game currently selected for placement scoring
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Select a game from the dropdown above or click &ldquo;Score Placements&rdquo; on any card below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Existing Events List with Rich Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      All Game Cards ({sportsEvents.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sportsEvents.map((event) => {
                      const sortedScores = houses
                        .map((h) => {
                          const s = event.scores?.find((sc) => sc.houseId === h.id);
                          return {
                            house: h,
                            points: s?.points || 0,
                            placement: s?.placement,
                          };
                        })
                        .sort((a, b) => b.points - a.points);
                      const isScored = Boolean(event.scores && event.scores.some((s) => s.points > 0));

                      return (
                        <div
                          key={event.id}
                          className="bg-[#161B22] rounded-xl border border-[#30363d] p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:border-[#444c56] transition-all"
                        >
                          <div className="flex items-start gap-4">
                            {/* Image Thumbnail with fallback */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#0D1117] border border-[#30363d] shrink-0 flex items-center justify-center p-0.5">
                              {event.imageUrl ? (
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <Trophy className="w-6 h-6 text-slate-600" />
                              )}
                            </div>

                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                                  {event.category}
                                </span>
                                <h4 className="font-extrabold text-[#F0F6FC] text-sm sm:text-base">{event.title}</h4>
                                {isScored && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/40">
                                    🏆 Placements Synced
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">{event.description}</p>

                              {/* Placements Ribbon */}
                              {isScored && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                                  {sortedScores.map((sc, scIdx) => (
                                    <span
                                      key={sc.house.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black text-white shadow-sm"
                                      style={{ backgroundColor: sc.house.color }}
                                    >
                                      <span>{scIdx === 0 ? '🥇' : scIdx === 1 ? '🥈' : scIdx === 2 ? '🥉' : '🎖️'}</span>
                                      <span>{sc.house.name.replace('House of ', '')}: +{sc.points} pts</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-1 font-semibold">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  {event.date} {event.time && `· ${event.time}`}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                    {event.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-900/20">
                                  <Users className="w-3.5 h-3.5" />
                                  {event.participatingStudentIds?.length || 0} Athletes
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end xl:self-center shrink-0 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenPlacementScorer(event, true)}
                              className="px-3 py-1.5 text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                              title="Assign Placements"
                            >
                              <Trophy className="w-3.5 h-3.5 text-slate-950" />
                              <span>Score Placements</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAdminEditingGame(event);
                                setIsAdminGameModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-[#F0F6FC] bg-[#21262d] hover:bg-[#30363d] rounded-md border border-[#30363d] flex items-center gap-1 cursor-pointer transition-all hover:shadow-[0_0_8px_rgba(240,246,252,0.15)]"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleEventActive(event.id, !event.isActive)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border ${
                                event.isActive
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-950/60'
                                  : 'bg-[#21262d] text-slate-400 border-[#30363d] hover:text-slate-300'
                              }`}
                            >
                              {event.isActive ? 'Live' : 'Archived'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-[#2a171d] rounded-md border border-transparent hover:border-rose-900/30 cursor-pointer transition-all"
                              title="Delete Game"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SITE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
                  <div>
                    <h3 className="text-base font-bold text-[#F0F6FC]">
                      Site Settings &amp; Public Visibility
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure visibility controls and custom messages for the public events portal
                    </p>
                  </div>
                  <button
                    id="save-site-settings-btn"
                    onClick={handleSaveSiteSettings}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{settingsSaveStatus ? 'Settings Saved!' : 'Save Settings'}</span>
                  </button>
                </div>

                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#30363d]">
                    <Sliders className="w-5 h-5 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F6FC]">
                        House Competitions Events Tab Settings
                      </h4>
                      <p className="text-xs text-slate-400">
                        Toggle the public visibility of the Events tab and customize the offline status callout message
                      </p>
                    </div>
                  </div>

                  {/* ON / OFF Switch (Smooth iOS style slider toggle) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0D1117] rounded-xl border border-[#30363d]">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-[#F0F6FC] tracking-wider block">
                        Events Tab Active Visibility
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {localEventsEnabled
                          ? 'The Events tab and live game cards are currently visible to all student and teacher roles.'
                          : 'The Events tab is currently CLOSED/OFFLINE. Live game cards are hidden, and the custom offline message callout box is displayed.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          localEventsEnabled
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/40'
                        }`}
                      >
                        {localEventsEnabled ? 'ON (Active)' : 'OFF (Offline)'}
                      </span>

                      <button
                        type="button"
                        id="events-tab-toggle"
                        role="switch"
                        aria-checked={localEventsEnabled}
                        onClick={() => handleToggleEventsActive(!localEventsEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          localEventsEnabled ? 'bg-emerald-500' : 'bg-rose-500/30'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            localEventsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Custom Tab Offline Message Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="custom-offline-message"
                        className="block text-xs uppercase font-bold text-slate-400 tracking-wider"
                      >
                        Custom Tab Offline Message Display
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setLocalOfflineMessage(DEFAULT_TAB_SETTINGS.events_disabled_message)
                        }
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold cursor-pointer transition-colors"
                      >
                        Reset to Default Message
                      </button>
                    </div>
                    <textarea
                      id="custom-offline-message"
                      rows={3}
                      value={localOfflineMessage}
                      onChange={(e) => setLocalOfflineMessage(e.target.value)}
                      placeholder="Enter message displayed to users when Events tab is closed..."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  {/* Live Preview Box */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Offline Notice Callout Preview:
                    </span>
                    <div className="p-4 rounded-xl border border-amber-500/40 bg-[#211d12] text-slate-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Events Tab Offline
                        </span>
                        <span className="text-xs font-bold text-[#F0F6FC] font-['Outfit']">
                          House Competitions Notice
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed bg-[#0D1117]/80 p-3 rounded-md border border-amber-500/20">
                        {localOfflineMessage.trim() || DEFAULT_TAB_SETTINGS.events_disabled_message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* House Competition Results Tab Settings */}
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#30363d]">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F6FC]">
                        House Competition Results Tab Settings
                      </h4>
                      <p className="text-xs text-slate-400">
                        Toggle public visibility of the tournament results portal and customize the offline status callout message
                      </p>
                    </div>
                  </div>

                  {/* ON / OFF Switch (Smooth iOS style slider toggle) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0D1117] rounded-xl border border-[#30363d]">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-[#F0F6FC] tracking-wider block">
                        House Results Tab Active Visibility
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {localResultsEnabled
                          ? 'The House Results tab, top student athlete rankings, and final game results feed are currently visible to all student and teacher roles.'
                          : 'The House Results tab is currently CLOSED/OFFLINE. Match results and athlete podiums are hidden, and the custom offline message callout box is displayed.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          localResultsEnabled
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/40'
                        }`}
                      >
                        {localResultsEnabled ? 'ON (Active)' : 'OFF (Offline)'}
                      </span>

                      <button
                        type="button"
                        id="results-tab-toggle"
                        role="switch"
                        aria-checked={localResultsEnabled}
                        onClick={() => handleToggleResultsActive(!localResultsEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          localResultsEnabled ? 'bg-emerald-500' : 'bg-rose-500/30'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            localResultsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Custom Tab Offline Message Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="custom-results-offline-message"
                        className="block text-xs uppercase font-bold text-slate-400 tracking-wider"
                      >
                        Custom Results Offline Message Display
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setLocalResultsOfflineMessage(DEFAULT_TAB_SETTINGS.results_disabled_message)
                        }
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold cursor-pointer transition-colors"
                      >
                        Reset to Default Message
                      </button>
                    </div>
                    <textarea
                      id="custom-results-offline-message"
                      rows={3}
                      value={localResultsOfflineMessage}
                      onChange={(e) => setLocalResultsOfflineMessage(e.target.value)}
                      placeholder="Enter message displayed to users when Results tab is closed..."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#0D1117] border border-[#30363d] rounded-md text-[#F0F6FC] placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  {/* Live Preview Box */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Results Offline Notice Callout Preview:
                    </span>
                    <div className="p-4 rounded-xl border border-rose-500/40 bg-[#211216] text-slate-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Results Tab Offline
                        </span>
                        <span className="text-xs font-bold text-[#F0F6FC] font-['Outfit']">
                          House Competition Results Notice
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed bg-[#0D1117]/80 p-3 rounded-md border border-rose-500/20">
                        {localResultsOfflineMessage.trim() ||
                          DEFAULT_TAB_SETTINGS.results_disabled_message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: DATA BACKUP & RESET */}
            {activeTab === 'data' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-[#161B22] rounded-xl border border-[#30363d] p-5 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#F0F6FC]">
                    Data Backup &amp; Semester Maintenance
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Easily manage your Crestview Society of Houses points data, start a new semester by clearing points, or restore factory defaults.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#211d12] border border-[#F59E0B]/30 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-amber-300">New Term / Reset Points</h4>
                        <p className="text-xs text-slate-400">
                          Resets all merits, demerits, and event points to 0 while keeping student rosters and faculty accounts intact.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="admin-reset-term-points-btn"
                        onClick={() => {
                          requestConfirm(
                            'Reset Season Points',
                            'Start a new term? All student merits, demerits, and event scores will reset to zero.',
                            () => {
                              onResetPointsOnly();
                              showPanelAlert('House points have been reset for the new semester.', 'success');
                            },
                            'Reset Season Points',
                            'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          );
                        }}
                        className="w-full mt-2 py-2 px-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-950" />
                        <span>Reset Season Points</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#2a171d] border border-rose-900/30 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-rose-400">Factory Reset</h4>
                        <p className="text-xs text-slate-400">
                          Reverts all houses, students, teachers, and logs to the official Memorandum seed data.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="admin-factory-reset-btn"
                        onClick={() => {
                          requestConfirm(
                            'Restore Official Defaults',
                            'Restore official Crestview International School AY 2026-2027 defaults?',
                            () => {
                              onResetAllDefaults();
                              onClose();
                            },
                            'Restore Official Defaults',
                            'bg-rose-600 hover:bg-rose-500 text-white'
                          );
                        }}
                        className="w-full mt-2 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore Defaults</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {/* Dedicated Placement Scorer Modal for Admin */}
      {isPlacementModalOpen && placementScoringGame && (
        <div
          className="fixed inset-0 z-50 bg-[#0d1117]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setIsPlacementModalOpen(false)}
        >
          <div
            className="bg-[#161B22] text-[#F0F6FC] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#30363d] p-5 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#30363d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-50/20 text-rose-300 border border-rose-500/30">
                      {placementScoringGame.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#F0F6FC] font-['Outfit']">
                      Score Placements: {placementScoringGame.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assign the 1st, 2nd, 3rd, and 4th place boxes. Points are awarded directly to the official House Cup leaderboard.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPlacementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#21262d] hover:bg-[#30363d] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 border border-[#30363d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification alert */}
            {placementSaveSuccess && (
              <div className="p-3 bg-[#141C15] border border-[#10B981]/40 text-[#A6F7B1] rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{placementSaveSuccess}</span>
              </div>
            )}

            {/* Game details banner */}
            <div className="bg-[#0D1117] border border-[#30363d] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-amber-400">Scoring Matrix: </span>
                <span className="text-slate-300">{placementScoringGame.scoringSystem}</span>
              </div>
              {placementScoringGame.location && (
                <div className="text-slate-400 font-medium">
                  Venue: {placementScoringGame.location}
                </div>
              )}
            </div>

            {/* The 4 Place Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderPlaceBox(
                1,
                '1st Place Box',
                '🥇',
                placement1stHouse,
                placement1stPts,
                (v) => setPlacement1stPts(v),
                'border-amber-400/40',
                'bg-[#1e1c12]',
                'text-amber-300'
              )}

              {renderPlaceBox(
                2,
                '2nd Place Box',
                '🥈',
                placement2ndHouse,
                placement2ndPts,
                (v) => setPlacement2ndPts(v),
                'border-slate-500/40',
                'bg-[#191b22]',
                'text-slate-300'
              )}

              {renderPlaceBox(
                3,
                '3rd Place Box',
                '🥉',
                placement3rdHouse,
                placement3rdPts,
                (v) => setPlacement3rdPts(v),
                'border-amber-700/40',
                'bg-[#1b1712]',
                'text-amber-600'
              )}

              {renderPlaceBox(
                4,
                '4th Place Box',
                '🎖️',
                placement4thHouse,
                placement4thPts,
                (v) => setPlacement4thPts(v),
                'border-indigo-500/40',
                'bg-[#151722]',
                'text-indigo-300'
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearPlacements}
                className="px-3.5 py-2 text-xs font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 rounded-md cursor-pointer transition-colors"
              >
                Clear All Placements
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlacementModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#F0F6FC] rounded-md cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePlacements}
                  className="px-5 py-2 text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Placements Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div
          className="fixed inset-0 z-60 bg-[#0d1117]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-[#161B22] rounded-2xl max-w-md w-full shadow-2xl border border-[#30363d] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 id="confirm-dialog-title" className="text-base font-bold text-[#F0F6FC]">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-slate-400">Please confirm your action</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 bg-[#0D1117] p-3.5 rounded-xl border border-[#30363d] font-medium leading-relaxed">
                {confirmDialog.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="confirm-dialog-cancel-btn"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-bold text-[#F0F6FC] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-dialog-action-btn"
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 text-xs font-black rounded-md transition-all shadow-xs cursor-pointer ${
                    confirmDialog.confirmButtonClass || 'bg-[#DC2626] hover:bg-rose-500 text-white'
                  }`}
                >
                  {confirmDialog.confirmLabel || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
