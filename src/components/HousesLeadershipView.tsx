import React, { useState } from 'react';
import { House, Student, TeacherUser, AdminUser } from '../types';
import {
  Shield,
  Award,
  Users,
  UserCheck,
  Star,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface HousesLeadershipViewProps {
  houses: House[];
  students: Student[];
  teachers: TeacherUser[];
  adminUsers: AdminUser[];
  onSelectStudent?: (student: Student) => void;
}

export const HousesLeadershipView: React.FC<HousesLeadershipViewProps> = ({
  houses,
  students,
  teachers,
  adminUsers,
  onSelectStudent,
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string>(houses[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'houses' | 'panel'>('houses');

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) || houses[0];
  const houseStudents = students.filter((s) => s.houseId === selectedHouse?.id);
  const houseAmbassador = teachers.find(
    (t) => t.houseId === selectedHouse?.id && t.houseRole === 'House Ambassador'
  );
  const houseCounselors = teachers.filter(
    (t) => t.houseId === selectedHouse?.id && t.houseRole === 'House Counselor'
  );
  const housePrefects = houseStudents.filter((s) => s.isPrefect);

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#161B22] to-indigo-950 rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Crestview International School
              </span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                AY 2026-2027
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight text-white">
              Society of Houses &amp; Leadership Panel
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Official memorandum from the Office of the Director of Academics establishing the House system, Leadership Panel, Faculty Ambassadors, and student membership.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveSubTab('houses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'houses'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              The 4 Houses ({houses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('panel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'panel'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Leadership Panel ({adminUsers.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'houses' ? (
        <div className="space-y-6">
          {/* House Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {houses.map((house) => {
              const isSelected = house.id === selectedHouse?.id;
              const count = students.filter((s) => s.houseId === house.id).length;
              return (
                <button
                  key={house.id}
                  onClick={() => setSelectedHouseId(house.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative overflow-hidden shadow-md cursor-pointer ${
                    isSelected
                      ? 'border-2 shadow-lg ring-2 ring-amber-400/50 bg-[#161B22]'
                      : 'border-slate-800 bg-[#161B22]/70 hover:border-slate-700 hover:bg-[#161B22]'
                  }`}
                  style={{
                    borderColor: isSelected ? house.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs font-bold text-xs"
                      style={{ backgroundColor: house.color }}
                    >
                      {house.name.replace('House of ', '').charAt(0)}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? house.color : '#1E293B',
                        color: isSelected ? 'white' : '#94A3B8',
                      }}
                    >
                      {count} Students
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm leading-tight">
                    {house.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                    &quot;{house.motto}&quot;
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected House Deep Dive */}
          {selectedHouse && (
            <div className="bg-[#161B22] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              {/* House Header Banner */}
              <div
                className="p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: selectedHouse.color }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full">
                      Official House Handbook Profile
                    </span>
                    {selectedHouse.mascot && (
                      <span className="text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
                        🐾 Mascot: {selectedHouse.mascot}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] mt-1 text-white">
                    {selectedHouse.name}
                  </h3>
                  <p className="text-white/95 text-xs sm:text-sm italic mt-0.5 font-medium">
                    &quot;{selectedHouse.motto}&quot;
                  </p>
                </div>
                <div className="bg-black/25 backdrop-blur-xs rounded-xl p-3 border border-white/20 self-start sm:self-auto text-center min-w-[130px]">
                  <p className="text-2xl font-black text-white">{houseStudents.length}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                    Active Students
                  </p>
                </div>
              </div>

              {/* Official House Colors & Lore (Handbook Guide) */}
              <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Official Colors Swatch */}
                  <div className="bg-[#161B22] p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Official House Colors
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedHouse.officialColors?.map((cName, i) => {
                        const hex = selectedHouse.colorHexList?.[i] || selectedHouse.color;
                        return (
                          <div key={cName} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs font-bold text-white">{cName}</span>
                          </div>
                        );
                      }) || (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: selectedHouse.color }}
                          />
                          <span className="text-xs font-bold text-white">{selectedHouse.color}</span>
                        </div>
                      )}
                    </div>
                    {selectedHouse.colorDescription && (
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {selectedHouse.colorDescription}
                      </p>
                    )}
                  </div>

                  {/* Animal Spirit & Lore */}
                  <div className="bg-[#161B22] p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Animal Spirit &amp; Mascot
                    </span>
                    <p className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {selectedHouse.mascot}
                    </p>
                    {selectedHouse.animalDescription && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedHouse.animalDescription}
                      </p>
                    )}
                  </div>

                  {/* Flag & Theme Virtues */}
                  <div className="bg-[#161B22] p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Flag &amp; Core Virtues
                    </span>
                    {selectedHouse.flagDescription && (
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        <strong className="text-white">Flag:</strong> {selectedHouse.flagDescription}
                      </p>
                    )}
                    {selectedHouse.themeVirtues && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedHouse.themeVirtues.map((v) => (
                          <span
                            key={v}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* House Leadership & Staff */}
              <div className="p-5 sm:p-6 border-b border-slate-800 bg-[#161B22]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  House Faculty Leadership
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Ambassador */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white inline-block mb-1.5"
                      style={{ backgroundColor: selectedHouse.color }}
                    >
                      House Ambassador
                    </span>
                    <p className="font-bold text-white text-sm">
                      {houseAmbassador?.name || 'Assigned Ambassador'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Username: <span className="font-bold text-slate-200">{houseAmbassador?.username || houseAmbassador?.name}</span>
                    </p>
                  </div>

                  {/* Counselors */}
                  {houseCounselors.map((counselor, idx) => (
                    <div
                      key={counselor.id}
                      className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs"
                    >
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 inline-block mb-1.5">
                        House Counselor {idx + 1}
                      </span>
                      <p className="font-bold text-white text-sm">{counselor.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        Username: <span className="font-bold text-slate-200">{counselor.username || counselor.name}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prefects & Students */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#161B22]">
                {housePrefects.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Appointed House Prefects
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {housePrefects.map((prefect) => (
                        <div
                          key={prefect.id}
                          className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-white"
                        >
                          <div>
                            <p className="font-bold text-xs text-white">{prefect.name}</p>
                            <p className="text-[10px] text-amber-300">Grade: {prefect.grade}</p>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            Prefect
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      Roster of Students ({houseStudents.length})
                    </h4>
                    <span className="text-xs text-slate-500">
                      Transition Primary (TP) to Grade 5
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {houseStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => onSelectStudent && onSelectStudent(student)}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-xs cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white group-hover:text-amber-400 truncate">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded">
                              {student.grade}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LEADERSHIP PANEL VIEW */
        <div className="space-y-6">
          {/* Memorandum Summary Card */}
          <div className="bg-[#161B22] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 uppercase">
                    Memorandum 2026-2027.006
                  </span>
                  <span className="text-xs text-slate-400">Office of the Director of Academics</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  Creation of the Crestview House Leadership Panel
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  &quot;To oversee the planning, execution, and continuous enhancement of house-related activities, events, and initiatives across both Preschool and Elementary sections, thereby fostering school spirit, collaboration, healthy competition, and holistic student development.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Co-Chairs Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>House Leadership Panel Co-Chairs (Admin)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminUsers
                .filter((a) => a.panelRole === 'Co-Chair')
                .map((chair) => (
                  <div
                    key={chair.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        Co-Chair
                      </span>
                      <span className="text-xs font-bold text-rose-300 bg-rose-950/70 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        {chair.section} Section
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-white font-['Outfit']">
                      {chair.name}
                    </h4>
                    <p className="text-xs font-semibold text-rose-400 mt-0.5">
                      {chair.roleTitle}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-2">
                      Username: <span className="font-bold text-slate-200">{chair.username || chair.name}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Panel Members Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Leadership Panel Members (Admin Accounts)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminUsers
                .filter((a) => a.panelRole === 'Member')
                .map((member) => (
                  <div
                    key={member.id}
                    className="bg-[#161B22] border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Panel Member
                      </span>
                      <span className="text-[10px] text-slate-500">Admin</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{member.name}</h4>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">
                      {member.roleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                      Username: <span className="font-bold text-slate-200">{member.username || member.name}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Consultants & Oversight */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Consultants &amp; Academic Administration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {adminUsers
                .filter((a) => a.panelRole === 'Administrator')
                .map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-[#161B22] border border-slate-800 rounded-xl p-4 shadow-md flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                        Consultant
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{admin.name}</h4>
                      <p className="text-xs text-slate-400">{admin.roleTitle}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Username: <span className="font-bold text-slate-200">{admin.username || admin.name}</span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
