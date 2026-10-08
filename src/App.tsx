import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  House,
  Student,
  TeacherUser,
  AdminUser,
  PointTransaction,
  SportsActivityEvent,
  CurrentUser,
  GradeLevel,
} from './types';
import {
  loadInitialData,
  saveHouses,
  saveStudents,
  saveTeachers,
  saveAdminUsers,
  saveTransactions,
  saveSportsEvents,
  saveCurrentUser,
  loadCurrentUser,
  resetAllToDefaults,
  computeStudentSummaries,
  computeHouseTotals,
} from './utils/storage';
import { Header } from './components/Header';
import { NavigationTabs, ActiveNavTab } from './components/NavigationTabs';
import { HouseLeaderboard } from './components/HouseLeaderboard';
import { SportsWeekSection } from './components/SportsWeekSection';
import { StudentTable } from './components/StudentTable';
import { PodiumView } from './components/PodiumView';
import { ActivityLogView } from './components/ActivityLogView';
import { HousesLeadershipView } from './components/HousesLeadershipView';
import { AddPointsModal } from './components/AddPointsModal';
import { LoginModal } from './components/LoginModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { AdminPanel } from './components/AdminPanel';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ShareModal } from './components/ShareModal';
import { HomePage } from './components/HomePage';
import { TeacherQuickAwardView } from './components/TeacherQuickAwardView';
import { AdvancedAwardView } from './components/AdvancedAwardView';
import { ExportModal } from './components/ExportModal';
import { EventScheduleMatchCenter } from './components/EventScheduleMatchCenter';
import { NewsletterPreview } from './components/NewsletterPreview';
import { ExportLoadingOverlay } from './components/ExportLoadingOverlay';
import { Trophy, GraduationCap, Shield } from 'lucide-react';

export default function App() {
  // Load initial persistent storage
  const [data, setData] = useState(() => loadInitialData());
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() =>
    loadCurrentUser()
  );

  // Home Page Entrance State: starts true requiring choice (teacher, admin, or viewer)
  const [isHomePageActive, setIsHomePageActive] = useState<boolean>(true);

  // Active navigation tab (matching reference tab bar)
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('standings');

  // Modal open states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<'newsletter' | 'students'>('newsletter');
  const [exportInitialDivision, setExportInitialDivision] = useState<'TP-GK' | 'G1-G5'>('TP-GK');
  const [exportInitialClass, setExportInitialClass] = useState<GradeLevel>('Grade 1');

  const handleOpenExport = (
    tab: 'newsletter' | 'students' = 'newsletter',
    division?: 'TP-GK' | 'G1-G5',
    classLevel?: GradeLevel
  ) => {
    setExportInitialTab(tab);
    if (division) setExportInitialDivision(division);
    if (classLevel) setExportInitialClass(classLevel);
    setIsExportOpen(true);
  };

  // Selected student for detail history
  const [selectedStudentHistoryId, setSelectedStudentHistoryId] = useState<
    string | null
  >(null);

  // Preselected options for Add Points modal
  const [preselectedStudentId, setPreselectedStudentId] = useState<
    string | undefined
  >(undefined);
  const [preselectedGrade, setPreselectedGrade] = useState<
    GradeLevel | undefined
  >(undefined);

  // Filter state for student table synchronized with house cards
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('all');

  // Ref to sports section for smooth scroll
  const sportsSectionRef = useRef<HTMLDivElement>(null);

  // Compute live summaries
  const studentSummaries = useMemo(() => {
    return computeStudentSummaries(data.students, data.transactions);
  }, [data.students, data.transactions]);

  const houseTotals = useMemo(() => {
    return computeHouseTotals(
      data.houses,
      data.students,
      data.transactions,
      data.sportsEvents
    );
  }, [data.houses, data.students, data.transactions, data.sportsEvents]);

  // Active sports event (if any)
  const activeSportsEvent = data.sportsEvents.find((e) => e.isActive);

  // Persistence helpers
  const handleAwardPoints = (
    newTxs: Omit<PointTransaction, 'id' | 'timestamp'>[]
  ) => {
    const timestamp = new Date().toISOString();
    const created: PointTransaction[] = newTxs.map((tx, idx) => ({
      ...tx,
      id: `tx-${Date.now()}-${idx}`,
      timestamp,
    }));

    const updated = [...created, ...data.transactions];
    saveTransactions(updated);
    setData((prev) => ({ ...prev, transactions: updated }));
  };

  const handleDeleteTransaction = (txId: string) => {
    const updated = data.transactions.filter((tx) => tx.id !== txId);
    saveTransactions(updated);
    setData((prev) => ({ ...prev, transactions: updated }));
  };

  const handleUpdateHouses = (newHouses: House[]) => {
    saveHouses(newHouses);
    setData((prev) => ({ ...prev, houses: newHouses }));
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    saveStudents(newStudents);
    setData((prev) => ({ ...prev, students: newStudents }));
  };

  const handleUpdateTeachers = (newTeachers: TeacherUser[]) => {
    saveTeachers(newTeachers);
    setData((prev) => ({ ...prev, teachers: newTeachers }));
    if (currentUser.role === 'teacher' && currentUser.teacher) {
      const match = newTeachers.find((t) => t.id === currentUser.teacher?.id);
      if (match) {
        const updatedUser: CurrentUser = { role: 'teacher', teacher: match };
        setCurrentUser(updatedUser);
        saveCurrentUser(updatedUser);
      }
    }
  };

  const handleUpdateAdminUsers = (newAdmins: AdminUser[]) => {
    saveAdminUsers(newAdmins);
    setData((prev) => ({ ...prev, adminUsers: newAdmins }));
    if (currentUser.role === 'admin' && currentUser.adminUser) {
      const match = newAdmins.find((a) => a.id === currentUser.adminUser?.id);
      if (match) {
        const updatedUser: CurrentUser = { role: 'admin', adminUser: match, isAdmin: true };
        setCurrentUser(updatedUser);
        saveCurrentUser(updatedUser);
      }
    }
  };

  const handleUpdateSportsEvents = (newEvents: SportsActivityEvent[]) => {
    saveSportsEvents(newEvents);
    setData((prev) => ({ ...prev, sportsEvents: newEvents }));
  };

  const handleUpdateEventScores = (
    eventId: string,
    houseScores: { houseId: string; points: number; placement?: 1 | 2 | 3 | 4 }[]
  ) => {
    const updated = data.sportsEvents.map((evt) => {
      if (evt.id === eventId) {
        return {
          ...evt,
          scores: houseScores,
        };
      }
      return evt;
    });
    saveSportsEvents(updated);
    setData((prev) => ({ ...prev, sportsEvents: updated }));
  };

  const handleAwardGameScore = (
    gameId: string,
    studentId: string,
    studentName: string,
    houseId: string,
    points: number,
    reason: string,
    gameTitle: string
  ) => {
    // 1. Update the event's score for the specified house
    const updatedEvents = data.sportsEvents.map((evt) => {
      if (evt.id === gameId) {
        const currentScores = evt.scores || [];
        const existing = currentScores.find((s) => s.houseId === houseId);
        let newScores;
        if (existing) {
          newScores = currentScores.map((s) =>
            s.houseId === houseId ? { ...s, points: (s.points || 0) + points } : s
          );
        } else {
          newScores = [...currentScores, { houseId, points }];
        }
        return {
          ...evt,
          scores: newScores,
        };
      }
      return evt;
    });
    saveSportsEvents(updatedEvents);

    // 2. Find house name and student grade
    const houseObj = data.houses.find((h) => h.id === houseId);
    const houseName = houseObj?.name?.replace('House of ', '') || 'House';
    const stObj = data.students.find((s) => s.id === studentId);
    const grade = stObj?.grade || 'Grade 3';

    // 3. Format timestamp and log string according to requirement:
    // "[Time] - [Student Name] ([House]) earned +[Points] in [Game Title] for [Reason]"
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedReason = `${timeStr} - ${studentName} (${houseName}) earned +${points} in ${gameTitle} for ${reason}`;

    const newTx: PointTransaction = {
      id: `tx-game-${Date.now()}`,
      studentId,
      studentName,
      grade,
      houseId,
      type: 'merit',
      amount: points,
      category: 'Sports Week',
      reason: formattedReason,
      awardedBy:
        currentUser.role === 'teacher'
          ? currentUser.teacher?.name || 'Faculty'
          : currentUser.adminUser?.name || 'Sports Coordinator',
      timestamp: now.toISOString(),
    };

    const updatedTxs = [newTx, ...data.transactions];
    saveTransactions(updatedTxs);

    setData((prev) => ({
      ...prev,
      sportsEvents: updatedEvents,
      transactions: updatedTxs,
    }));
  };

  const handleToggleEventActive = (eventId: string, isActive: boolean) => {
    const updated = data.sportsEvents.map((evt) =>
      evt.id === eventId ? { ...evt, isActive } : evt
    );
    saveSportsEvents(updated);
    setData((prev) => ({ ...prev, sportsEvents: updated }));
  };

  const handleResetPointsOnly = () => {
    const resetEvents = data.sportsEvents.map((e) => ({
      ...e,
      scores: e.scores?.map((s) => ({ ...s, points: 0 })),
    }));
    saveTransactions([]);
    saveSportsEvents(resetEvents);
    setData((prev) => ({
      ...prev,
      transactions: [],
      sportsEvents: resetEvents,
    }));
  };

  const handleResetAllDefaults = () => {
    const seeded = resetAllToDefaults();
    setData(seeded);
    setCurrentUser({
      role: 'admin',
      adminUser: seeded.adminUsers[0],
      isAdmin: true,
    });
  };

  // Auth handlers
  const handleLoginTeacher = (teacher: TeacherUser) => {
    const user: CurrentUser = { role: 'teacher', teacher };
    setCurrentUser(user);
    saveCurrentUser(user);
    setActiveTab('award');
  };

  const handleLoginAdmin = (adminUser?: AdminUser) => {
    const chosenAdmin = adminUser || data.adminUsers?.[0];
    const user: CurrentUser = { role: 'admin', adminUser: chosenAdmin, isAdmin: true };
    setCurrentUser(user);
    saveCurrentUser(user);
    setActiveTab('award');
  };

  const handleLogout = () => {
    const user: CurrentUser = { role: 'public' };
    setCurrentUser(user);
    saveCurrentUser(user);
    setIsHomePageActive(true);
  };

  // Home Page Entrance Handlers
  const handleHomeTeacherLogin = (teacher: TeacherUser) => {
    handleLoginTeacher(teacher);
    setIsHomePageActive(false);
    setActiveTab('award');
  };

  const handleHomeAdminLogin = (adminUser?: AdminUser) => {
    handleLoginAdmin(adminUser);
    setIsHomePageActive(false);
    setActiveTab('award');
  };

  const handleQuickAwardStudent = (studentId: string) => {
    setPreselectedStudentId(studentId);
    setPreselectedGrade(undefined);
    setIsAddPointsOpen(true);
  };

  const handleOpenAddPointsModal = (grade?: GradeLevel, studentId?: string) => {
    setPreselectedStudentId(studentId);
    setPreselectedGrade(grade);
    setIsAddPointsOpen(true);
  };

  const handleNavTabChange = (tab: ActiveNavTab) => {
    if (tab === 'award') {
      if (currentUser.role === 'public') {
        setIsLoginOpen(true);
      } else {
        setActiveTab('award');
      }
      return;
    }

    if (tab === 'admin') {
      if (currentUser.role === 'admin') {
        setIsAdminOpen(true);
      } else {
        setIsLoginOpen(true);
      }
      return;
    }

    setActiveTab(tab);
  };

  const selectedStudentForHistory = useMemo(() => {
    if (!selectedStudentHistoryId) return null;
    return data.students.find((s) => s.id === selectedStudentHistoryId) || null;
  }, [selectedStudentHistoryId, data.students]);

  const selectedStudentHouse = useMemo(() => {
    if (!selectedStudentForHistory) return null;
    return (
      data.houses.find((h) => h.id === selectedStudentForHistory.houseId) || null
    );
  }, [selectedStudentForHistory, data.houses]);

  const leader = houseTotals[0];

  const totalSchoolPoints = useMemo(() => {
    return houseTotals.reduce((acc, curr) => acc + curr.totalPoints, 0);
  }, [houseTotals]);

  // If Welcome Home Page is active or user is not logged in as teacher/admin, display the House Cup Portal
  if (isHomePageActive || currentUser.role === 'public') {
    return (
      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <HomePage
          houses={data.houses}
          teachers={data.teachers}
          adminUsers={data.adminUsers}
          sportsEvents={data.sportsEvents}
          students={data.students}
          houseTotals={houseTotals}
          currentUser={currentUser}
          totalSchoolPoints={totalSchoolPoints}
          leadingHouse={leader?.house}
          leadingHousePoints={leader?.totalPoints}
          transactions={data.transactions}
          onAwardGameScore={handleAwardGameScore}
          onLoginTeacher={handleHomeTeacherLogin}
          onLoginAdmin={handleHomeAdminLogin}
          onOpenExport={() => handleOpenExport('newsletter')}
        />

        {/* Target DOM Element for 5-Format Newsletter Exporter (html2canvas, html2pdf, Word, HTML, JSON) */}
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '900px',
            maxWidth: '900px',
            zIndex: -1000,
            opacity: 1,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <NewsletterPreview
            id="newsletter-preview"
            students={data.students}
            houses={data.houses}
            studentSummaries={studentSummaries}
            sportsEvents={data.sportsEvents}
          />
        </div>

        {/* Global User Feedback: Loading Overlay for Image and PDF conversions */}
        <ExportLoadingOverlay />

        {isExportOpen && (
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            students={data.students}
            houses={data.houses}
            studentSummaries={studentSummaries}
            sportsEvents={data.sportsEvents}
            initialTab={exportInitialTab}
            initialDivision={exportInitialDivision}
            initialClass={exportInitialClass}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Main Header */}
      <Header
        currentUser={currentUser}
        totalSchoolPoints={totalSchoolPoints}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAddPoints={() => handleOpenAddPointsModal()}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenTeacherProfile={() => setIsTeacherProfileOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHomePage={() => setIsHomePageActive(true)}
        onOpenExport={() => handleOpenExport('newsletter')}
        leadingHouseName={leader?.house.name}
        leadingHousePoints={leader?.totalPoints}
        isSportsActive={!!activeSportsEvent}
        onScrollToSports={() => {
          setActiveTab('sports');
          sportsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={handleNavTabChange}
        isSportsActive={!!activeSportsEvent}
        currentUser={currentUser}
      />

      {/* 3. Main Dashboard Body (Restricted to Teacher and Admin) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        {/* ROLE 1: TEACHER MODE - Split cleanly into distinct tabs */}
        {currentUser.role === 'teacher' && (
          <>
            {/* TAB 1: QUICK POINT AWARDING (Default on open!) */}
            {(activeTab === 'standings' || activeTab === 'award') && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <TeacherQuickAwardView
                  houses={data.houses}
                  students={data.students}
                  houseTotals={houseTotals}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  onAwardPoints={handleAwardPoints}
                  onUndoTransaction={handleDeleteTransaction}
                  onOpenFullAwardModal={(hId, sId) => handleOpenAddPointsModal(undefined, sId)}
                  onOpenExport={() => handleOpenExport('students')}
                />
              </div>
            )}

            {/* TAB 2: ADVANCED AWARDING */}
            {activeTab === 'advanced-award' && (
              <div className="animate-in fade-in duration-150">
                <AdvancedAwardView
                  students={data.students}
                  houses={data.houses}
                  currentUser={currentUser}
                  onAwardPoints={handleAwardPoints}
                />
              </div>
            )}

            {/* TAB 3: STUDENT ROSTER */}
            {activeTab === 'students' && (
              <div className="animate-in fade-in duration-150">
                <StudentTable
                  students={data.students}
                  houses={data.houses}
                  studentSummaries={studentSummaries}
                  currentUser={currentUser}
                  onOpenStudentHistory={(id) => setSelectedStudentHistoryId(id)}
                  onQuickAwardStudent={handleQuickAwardStudent}
                  selectedHouseId={selectedHouseFilter}
                  onSelectHouseFilter={setSelectedHouseFilter}
                />
              </div>
            )}

            {/* TAB 4: HOUSES & LEADERSHIP */}
            {activeTab === 'houses' && (
              <div className="animate-in fade-in duration-150">
                <HousesLeadershipView
                  houses={data.houses}
                  students={data.students}
                  teachers={data.teachers}
                  adminUsers={data.adminUsers || []}
                  onSelectStudent={(student) => setSelectedStudentHistoryId(student.id)}
                />
              </div>
            )}

            {/* TAB 5: ACTIVITY LOG */}
            {activeTab === 'activity' && (
              <div className="animate-in fade-in duration-150">
                <ActivityLogView
                  transactions={data.transactions}
                  houses={data.houses}
                  currentUser={currentUser}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenAddPoints={() => handleOpenAddPointsModal()}
                />
              </div>
            )}

            {/* TAB 6: HOUSE COMPETITIONS RESULTS */}
            {activeTab === 'sports' && (
              <div ref={sportsSectionRef} className="animate-in fade-in duration-150">
                <EventScheduleMatchCenter
                  sportsEvents={data.sportsEvents}
                  houses={data.houses}
                  students={data.students}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  viewMode="overview"
                  onNavigateToEvents={() => setActiveTab('sports-events')}
                  onAwardGameScore={handleAwardGameScore}
                  onUpdateEventScores={handleUpdateEventScores}
                  onToggleEventActive={handleToggleEventActive}
                  onUpdateSportsEvents={handleUpdateSportsEvents}
                  onOpenCreateEvent={() => setIsAdminOpen(true)}
                  onOpenExportSports={() => handleOpenExport('newsletter')}
                />
              </div>
            )}

            {/* TAB 7: HOUSE COMPETITIONS EVENTS */}
            {activeTab === 'sports-events' && (
              <div className="animate-in fade-in duration-150">
                <EventScheduleMatchCenter
                  sportsEvents={data.sportsEvents}
                  houses={data.houses}
                  students={data.students}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  viewMode="cards"
                  onAwardGameScore={handleAwardGameScore}
                  onUpdateEventScores={handleUpdateEventScores}
                  onToggleEventActive={handleToggleEventActive}
                  onUpdateSportsEvents={handleUpdateSportsEvents}
                  onOpenCreateEvent={() => setIsAdminOpen(true)}
                  onOpenExportSports={() => handleOpenExport('newsletter')}
                />
              </div>
            )}
          </>
        )}

        {/* ROLE 2: ADMIN MODE - Matches Teacher Dashboard Layout */}
        {currentUser.role === 'admin' && (
          <>
            {/* TAB 1: QUICK POINT AWARDING (Default on open!) */}
            {(activeTab === 'standings' || activeTab === 'award') && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <TeacherQuickAwardView
                  houses={data.houses}
                  students={data.students}
                  houseTotals={houseTotals}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  onAwardPoints={handleAwardPoints}
                  onUndoTransaction={handleDeleteTransaction}
                  onOpenFullAwardModal={(hId, sId) => handleOpenAddPointsModal(undefined, sId)}
                  onOpenExport={() => handleOpenExport('students')}
                />
              </div>
            )}

            {/* TAB 2: ADVANCED AWARDING */}
            {activeTab === 'advanced-award' && (
              <div className="animate-in fade-in duration-150">
                <AdvancedAwardView
                  students={data.students}
                  houses={data.houses}
                  currentUser={currentUser}
                  onAwardPoints={handleAwardPoints}
                />
              </div>
            )}

            {/* TAB 3: STUDENT ROSTER */}
            {activeTab === 'students' && (
              <div className="animate-in fade-in duration-150">
                <StudentTable
                  students={data.students}
                  houses={data.houses}
                  studentSummaries={studentSummaries}
                  currentUser={currentUser}
                  onOpenStudentHistory={(id) => setSelectedStudentHistoryId(id)}
                  onQuickAwardStudent={handleQuickAwardStudent}
                  selectedHouseId={selectedHouseFilter}
                  onSelectHouseFilter={setSelectedHouseFilter}
                />
              </div>
            )}

            {/* TAB 4: HOUSES & LEADERSHIP */}
            {activeTab === 'houses' && (
              <div className="animate-in fade-in duration-150">
                <HousesLeadershipView
                  houses={data.houses}
                  students={data.students}
                  teachers={data.teachers}
                  adminUsers={data.adminUsers || []}
                  onSelectStudent={(student) => setSelectedStudentHistoryId(student.id)}
                />
              </div>
            )}

            {/* TAB 5: ACTIVITY LOG */}
            {activeTab === 'activity' && (
              <div className="animate-in fade-in duration-150">
                <ActivityLogView
                  transactions={data.transactions}
                  houses={data.houses}
                  currentUser={currentUser}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenAddPoints={() => handleOpenAddPointsModal()}
                />
              </div>
            )}

            {/* TAB 6: HOUSE COMPETITIONS RESULTS */}
            {activeTab === 'sports' && (
              <div ref={sportsSectionRef} className="animate-in fade-in duration-150">
                <EventScheduleMatchCenter
                  sportsEvents={data.sportsEvents}
                  houses={data.houses}
                  students={data.students}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  viewMode="overview"
                  onNavigateToEvents={() => setActiveTab('sports-events')}
                  onAwardGameScore={handleAwardGameScore}
                  onUpdateEventScores={handleUpdateEventScores}
                  onToggleEventActive={handleToggleEventActive}
                  onUpdateSportsEvents={handleUpdateSportsEvents}
                  onOpenCreateEvent={() => setIsAdminOpen(true)}
                  onOpenExportSports={() => handleOpenExport('newsletter')}
                />
              </div>
            )}

            {/* TAB 7: HOUSE COMPETITIONS EVENTS */}
            {activeTab === 'sports-events' && (
              <div className="animate-in fade-in duration-150">
                <EventScheduleMatchCenter
                  sportsEvents={data.sportsEvents}
                  houses={data.houses}
                  students={data.students}
                  currentUser={currentUser}
                  transactions={data.transactions}
                  viewMode="cards"
                  onAwardGameScore={handleAwardGameScore}
                  onUpdateEventScores={handleUpdateEventScores}
                  onToggleEventActive={handleToggleEventActive}
                  onUpdateSportsEvents={handleUpdateSportsEvents}
                  onOpenCreateEvent={() => setIsAdminOpen(true)}
                  onOpenExportSports={() => handleOpenExport('newsletter')}
                />
              </div>
            )}

            {/* TAB 8: PODIUM VIEW (Supported if navigated to) */}
            {activeTab === 'podium' && (
              <PodiumView
                houseTotals={houseTotals}
                onOpenAddPoints={() => handleOpenAddPointsModal()}
                onFilterHouse={(hId) => {
                  setSelectedHouseFilter(hId);
                  setActiveTab('students');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-700 font-['Outfit']">
              Crestview International School &bull; Society of Houses
            </span>
            <span>&bull; Grades TP through Grade 5</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Share Portal
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Staff Authentication
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                if (currentUser.role === 'admin') {
                  setIsAdminOpen(true);
                } else {
                  setIsLoginOpen(true);
                }
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Leadership Panel (Admin)
            </button>
          </div>
        </div>
      </footer>

      {/* All Application Modals */}
      {isAddPointsOpen && (
        <AddPointsModal
          isOpen={isAddPointsOpen}
          onClose={() => {
            setIsAddPointsOpen(false);
            setPreselectedStudentId(undefined);
            setPreselectedGrade(undefined);
          }}
          students={data.students}
          houses={data.houses}
          currentUser={currentUser}
          onAwardPoints={handleAwardPoints}
          onOpenLogin={() => {
            setIsAddPointsOpen(false);
            setIsLoginOpen(true);
          }}
          initialSelectedStudentId={preselectedStudentId}
          initialGrade={preselectedGrade}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          teachers={data.teachers}
          adminUsers={data.adminUsers || []}
          houses={data.houses}
          adminPassword={data.adminPassword}
          onLoginTeacher={handleLoginTeacher}
          onLoginAdmin={handleLoginAdmin}
        />
      )}

      {isTeacherProfileOpen && currentUser.role === 'teacher' && currentUser.teacher && (
        <TeacherProfileModal
          isOpen={isTeacherProfileOpen}
          onClose={() => setIsTeacherProfileOpen(false)}
          currentTeacher={currentUser.teacher}
          onUpdateTeacher={(updated) => {
            const list = data.teachers.map((t) =>
              t.id === updated.id ? updated : t
            );
            handleUpdateTeachers(list);
          }}
        />
      )}

      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          houses={data.houses}
          students={data.students}
          teachers={data.teachers}
          adminUsers={data.adminUsers || []}
          sportsEvents={data.sportsEvents}
          onUpdateHouses={handleUpdateHouses}
          onUpdateStudents={handleUpdateStudents}
          onUpdateTeachers={handleUpdateTeachers}
          onUpdateAdminUsers={handleUpdateAdminUsers}
          onUpdateSportsEvents={handleUpdateSportsEvents}
          onResetPointsOnly={handleResetPointsOnly}
          onResetAllDefaults={handleResetAllDefaults}
        />
      )}

      {selectedStudentForHistory && (
        <StudentDetailModal
          student={selectedStudentForHistory}
          house={selectedStudentHouse}
          transactions={data.transactions}
          currentUser={currentUser}
          onClose={() => setSelectedStudentHistoryId(null)}
          onDeleteTransaction={handleDeleteTransaction}
          onOpenAddPointsForStudent={(studentId) => {
            setSelectedStudentHistoryId(null);
            handleQuickAwardStudent(studentId);
          }}
        />
      )}

      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          houseTotals={houseTotals}
          onSwitchToPublic={handleLogout}
        />
      )}

      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          students={data.students}
          houses={data.houses}
          studentSummaries={studentSummaries}
          sportsEvents={data.sportsEvents}
          initialTab={exportInitialTab}
          initialDivision={exportInitialDivision}
          initialClass={exportInitialClass}
        />
      )}

      {/* Target DOM Element for 5-Format Newsletter Exporter (html2canvas, html2pdf, Word, HTML, JSON) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '900px',
          maxWidth: '900px',
          zIndex: -1000,
          opacity: 1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <NewsletterPreview
          id="newsletter-preview"
          students={data.students}
          houses={data.houses}
          studentSummaries={studentSummaries}
          sportsEvents={data.sportsEvents}
        />
      </div>

      {/* Global User Feedback: Loading Overlay for Image and PDF conversions */}
      <ExportLoadingOverlay />
    </div>
  );
}
