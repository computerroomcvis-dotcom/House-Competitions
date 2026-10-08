import React, { useMemo } from 'react';
import {
  House,
  Student,
  SportsActivityEvent,
  GradeLevel,
  GRADE_LABELS,
} from '../types';
import { StudentPointSummary } from '../utils/storage';
import {
  Trophy,
  Crown,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';

interface NewsletterPreviewProps {
  id?: string;
  students: Student[];
  houses: House[];
  studentSummaries: Record<string, StudentPointSummary>;
  sportsEvents: SportsActivityEvent[];
  selectedDivision?: 'TP-GK' | 'G1-G5';
  className?: string;
  style?: React.CSSProperties;
}

const TP_GK_GRADES: GradeLevel[] = ['TP', 'PK-3', 'PK-4', 'GK-Emerald'];
const G1_G5_GRADES: GradeLevel[] = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

export const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({
  id = 'newsletter-preview',
  students,
  houses,
  studentSummaries,
  sportsEvents,
  selectedDivision = 'G1-G5',
  className = '',
  style = {},
}) => {
  // Helper to extract student rosters grouped by house and grade level from a sports event
  const getEventCardHouseRosters = (game: SportsActivityEvent, house: House) => {
    const houseShortName = house.name.replace('House of ', '').trim().toLowerCase();
    const houseFullName = house.name.trim().toLowerCase();

    const matchingAthletes: {
      studentId?: string;
      studentName: string;
      grade: string;
      role: string;
    }[] = [];

    // 1. Check participatingStudentsWithRoles first (configured via Admin Game Card Creator)
    if (game.participatingStudentsWithRoles && game.participatingStudentsWithRoles.length > 0) {
      game.participatingStudentsWithRoles.forEach((p) => {
        const pRoleHouse = (p.house || '').trim().toLowerCase();
        if (
          pRoleHouse === houseShortName ||
          pRoleHouse === houseFullName ||
          p.house === house.name ||
          pRoleHouse.includes(houseShortName)
        ) {
          const sMatch = students.find(
            (s) => s.id === p.studentId || s.name.toLowerCase() === p.student_name.toLowerCase()
          );
          matchingAthletes.push({
            studentId: p.studentId || sMatch?.id,
            studentName: p.student_name,
            grade: sMatch?.grade || 'Competitor',
            role: p.role || 'Competitor',
          });
        }
      });
    }

    // 2. Also check participatingStudentIds for any students belonging to this house not already added
    if (game.participatingStudentIds && game.participatingStudentIds.length > 0) {
      game.participatingStudentIds.forEach((sId) => {
        const st = students.find((s) => s.id === sId && s.houseId === house.id);
        if (
          st &&
          !matchingAthletes.some(
            (a) => a.studentId === st.id || a.studentName.toLowerCase() === st.name.toLowerCase()
          )
        ) {
          matchingAthletes.push({
            studentId: st.id,
            studentName: st.name,
            grade: st.grade,
            role: 'Competitor',
          });
        }
      });
    }

    // Group athletes by grade level
    const rostersByGrade: Record<string, typeof matchingAthletes> = {};
    matchingAthletes.forEach((a) => {
      const g = a.grade || 'General';
      if (!rostersByGrade[g]) {
        rostersByGrade[g] = [];
      }
      rostersByGrade[g].push(a);
    });

    return {
      houseName: house.name,
      houseColor: house.color,
      totalAthletes: matchingAthletes.length,
      athletes: matchingAthletes,
      rostersByGrade,
    };
  };

  // Determine active grades
  const activeGrades = useMemo(() => {
    return selectedDivision === 'TP-GK' ? TP_GK_GRADES : G1_G5_GRADES;
  }, [selectedDivision]);

  // Filter students within the active grades
  const filteredStudents = useMemo(() => {
    return students.filter((s) => activeGrades.includes(s.grade));
  }, [students, activeGrades]);

  // Top student of EACH HOUSE
  const topStudentsByHouse = useMemo(() => {
    return houses.map((house) => {
      const houseStudents = filteredStudents.filter((s) => s.houseId === house.id);
      const sorted = [...houseStudents].sort((a, b) => {
        const ptsA = studentSummaries[a.id]?.netPoints ?? 0;
        const ptsB = studentSummaries[b.id]?.netPoints ?? 0;
        return ptsB - ptsA;
      });
      const topStudent = sorted[0];
      const summary = topStudent ? studentSummaries[topStudent.id] : undefined;
      return {
        house,
        student: topStudent,
        summary,
        totalPoints: summary?.netPoints ?? 0,
        merits: summary?.merits ?? 0,
      };
    });
  }, [houses, filteredStudents, studentSummaries]);

  // Top student of EACH GRADE LEVEL
  const topStudentsByGrade = useMemo(() => {
    return activeGrades
      .map((grade) => {
        const gradeStudents = filteredStudents.filter((s) => s.grade === grade);
        const sorted = [...gradeStudents].sort((a, b) => {
          const ptsA = studentSummaries[a.id]?.netPoints ?? 0;
          const ptsB = studentSummaries[b.id]?.netPoints ?? 0;
          return ptsB - ptsA;
        });
        const top = sorted[0];
        const house = top ? houses.find((h) => h.id === top.houseId) : undefined;
        return {
          grade,
          gradeLabel: GRADE_LABELS[grade],
          student: top,
          house,
          summary: top ? studentSummaries[top.id] : undefined,
        };
      })
      .filter((item) => item.student !== undefined);
  }, [activeGrades, filteredStudents, houses, studentSummaries]);

  // Overall Top Performer
  const overallTopStudent = useMemo(() => {
    const sorted = [...filteredStudents].sort((a, b) => {
      const ptsA = studentSummaries[a.id]?.netPoints ?? 0;
      const ptsB = studentSummaries[b.id]?.netPoints ?? 0;
      return ptsB - ptsA;
    });
    const top = sorted[0];
    if (!top) return null;
    const house = houses.find((h) => h.id === top.houseId);
    return {
      student: top,
      house,
      summary: studentSummaries[top.id],
    };
  }, [filteredStudents, houses, studentSummaries]);

  // JSON representation of live combined data
  const newsletterJson = useMemo(() => {
    const monthYear = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      school_info: {
        school_name: 'Crestview International School',
        edition: 'Official Parent Newsletter & Sports Week Bulletin',
        bulletin_date: `${monthYear} Bulletin`,
        published_on: todayFormatted,
        scope: selectedDivision === 'TP-GK' ? 'Early Years (TP - GK)' : 'Primary Division (G1 - G5)',
        core_values: 'Character • Scholarship • Community',
        office: 'Office of Student Affairs & House Masters',
      },
      monthly_star_achievers: {
        overall_star_scholar: {
          student_name: overallTopStudent?.student?.name || 'In Progress',
          grade: overallTopStudent?.student?.grade || '',
          house: overallTopStudent?.house?.name || 'Society of Houses',
          net_points: overallTopStudent?.summary?.netPoints ?? 0,
          merits: overallTopStudent?.summary?.merits ?? 0,
        },
        house_star_achievers: topStudentsByHouse.map(({ house, student, totalPoints, merits }) => ({
          house_name: house.name,
          mascot: house.mascot,
          motto: house.motto,
          top_student: student ? student.name : 'Standings updating',
          grade_level: student ? student.grade : '',
          is_prefect: student?.isPrefect || false,
          net_points: totalPoints,
          merits,
          theme_color: house.color,
        })),
        grade_level_achievers: topStudentsByGrade.map(({ grade, student, house, summary }) => ({
          grade,
          grade_label: GRADE_LABELS[grade],
          student_name: student?.name || 'TBD',
          house_name: house?.name || 'House System',
          theme_color: house?.color || '#F59E0B',
          points: summary?.netPoints ?? 0,
        })),
      },
      house_competitions_events: sportsEvents.map((game) => {
        const houseRosters = houses.map((house) => {
          const rosterData = getEventCardHouseRosters(game, house);
          return {
            house_id: house.id,
            house_name: house.name,
            theme_color: house.color,
            total_enrolled_athletes: rosterData.totalAthletes,
            rosters_by_grade_level: Object.entries(rosterData.rostersByGrade).map(
              ([grade, athleteList]) => ({
                grade_level: grade,
                athlete_count: athleteList.length,
                students: athleteList.map((a) => ({
                  name: a.studentName,
                  grade: a.grade,
                  assigned_role: a.role,
                })),
              })
            ),
          };
        });

        return {
          event_id: game.id,
          event_title: game.title,
          category: game.category,
          scheduled_date_time: `${game.date}${game.time ? ` • ${game.time}` : ''}`,
          venue_location: game.location || (game.venueCode ? `Venue ${game.venueCode}` : 'Main Campus Field'),
          status: game.isActive ? 'LIVE_NOW' : 'SCHEDULED',
          rules:
            game.rules && game.rules.length > 0
              ? game.rules
              : ['Standard house championship rules apply.'],
          points_breakdown: {
            first_place: game.scoringBreakdown?.firstPlace ?? 75,
            second_place: game.scoringBreakdown?.secondPlace ?? 50,
            third_place: game.scoringBreakdown?.thirdPlace ?? 25,
            fourth_place: game.scoringBreakdown?.fourthPlace ?? 10,
            bonus_notes: game.scoringBreakdown?.bonusNotes || '',
          },
          student_participation_rosters_by_house: houseRosters,
        };
      }),
      faculty_commendation: {
        title: 'Monthly Parent Newsletter • Faculty Commendation',
        message:
          'Dear Crestview Parents & Families, we are delighted to honor our top House achievers and active tournament athletes! Our house system nurtures curiosity, integrity, and mutual respect. Thank you parents for your continued partnership at home.',
        department: 'Office of Student Affairs & House Masters • Crestview International School',
      },
    };
  }, [selectedDivision, overallTopStudent, topStudentsByHouse, topStudentsByGrade, sportsEvents, houses, students]);

  const monthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={id}
      data-newsletter-json={JSON.stringify(newsletterJson)}
      className={`rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] ${className}`}
      style={{
        backgroundColor: '#0D1117',
        color: '#F0F6FC',
        border: '1px solid #30363D',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Visual Watermark & Corner Highlights */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'rgba(245, 158, 11, 0.04)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
      />

      {/* 1. School Header Banner */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6"
        style={{ borderBottom: '1px solid #30363D' }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <img
              src="/school_crest_logo.jpg"
              alt="Crestview Crest"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <span
              className="text-[11px] font-black uppercase tracking-widest block font-['Outfit']"
              style={{ color: '#F59E0B' }}
            >
              Crestview International School
            </span>
            <h1
              className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight"
              style={{ color: '#FFFFFF' }}
            >
              Parent Newsletter: House Cup &amp; Sports Week
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
              Live data: Monthly Star Achievers combined with House Competitions Events
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#FBBF24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            {monthYear} Bulletin
          </span>
          <span className="block text-[11px] mt-1 font-medium" style={{ color: '#8B949E' }}>
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* 2. SECTION A: MONTHLY STAR ACHIEVERS SPOTLIGHT */}
      <div className="space-y-4">
        <div
          className="flex items-center justify-between pb-2"
          style={{ borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <h3 className="text-base font-black font-['Outfit']" style={{ color: '#FFFFFF' }}>
              Monthly House Cup Star Achievers
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#8B949E' }}>
            Academic Diligence &bull; Character &bull; Merits
          </span>
        </div>

        {/* Overall Star Scholar Spotlight Banner */}
        {overallTopStudent?.student && (
          <div
            className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: '#161B22',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0"
                style={{ backgroundColor: '#F59E0B', color: '#0D1117' }}
              >
                <Crown className="w-5 h-5" style={{ color: '#0D1117' }} />
              </div>
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-wider block"
                  style={{ color: '#F59E0B' }}
                >
                  👑 Overall Monthly Star Scholar
                </span>
                <h4 className="text-base sm:text-lg font-black font-['Outfit']" style={{ color: '#FFFFFF' }}>
                  {overallTopStudent.student.name}
                </h4>
                <span className="text-xs" style={{ color: '#CBD5E1' }}>
                  {overallTopStudent.student.grade} &bull; {overallTopStudent.house?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right self-end sm:self-auto">
              <div>
                <span
                  className="text-sm sm:text-base font-black block font-mono"
                  style={{ color: '#F59E0B' }}
                >
                  {overallTopStudent.summary?.netPoints ?? 0} pts
                </span>
                <span className="text-[10px] font-bold block" style={{ color: '#10B981' }}>
                  +{overallTopStudent.summary?.merits ?? 0} Merits Earned
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top of Each House Cards (4 Houses) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topStudentsByHouse.map(({ house, student, totalPoints, merits }) => (
            <div
              key={house.id}
              className="rounded-xl p-3.5 space-y-2 relative overflow-hidden"
              style={{
                backgroundColor: '#161B22',
                border: '1px solid #21262D',
                borderTop: `4px solid ${house.color}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black" style={{ color: '#FFFFFF' }}>
                  {house.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: house.color }}
                />
              </div>

              <div>
                <h5 className="text-sm font-extrabold font-['Outfit']" style={{ color: '#FFFFFF' }}>
                  {student ? student.name : 'Standings updating'}
                </h5>
                <span className="text-[10px] block" style={{ color: '#8B949E' }}>
                  {student ? student.grade : ''} &bull; {house.mascot}
                </span>
              </div>

              <div
                className="pt-2 flex items-center justify-between text-xs"
                style={{ borderTop: '1px solid #21262D' }}
              >
                <span className="font-mono font-bold" style={{ color: '#F59E0B' }}>
                  {totalPoints} pts
                </span>
                <span className="font-bold" style={{ color: '#10B981' }}>
                  +{merits} merits
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Grade-Level Honor Roll */}
        {topStudentsByGrade.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {topStudentsByGrade.map(({ grade, gradeLabel, student, house, summary }) => (
                <div
                  key={grade}
                  className="rounded-xl p-2.5 space-y-1 relative overflow-hidden"
                  style={{
                    backgroundColor: '#161B22',
                    border: '1px solid #21262D',
                    borderLeft: `3px solid ${house?.color || '#F59E0B'}`,
                  }}
                >
                  <span className="text-[9px] font-bold uppercase block" style={{ color: '#F59E0B' }}>
                    {gradeLabel}
                  </span>
                  <h6 className="text-xs font-bold truncate" style={{ color: '#FFFFFF' }}>
                    {student?.name || 'TBD'}
                  </h6>
                  <div
                    className="flex items-center justify-between text-[10px] pt-1"
                    style={{ borderTop: '1px solid #21262D', color: '#8B949E' }}
                  >
                    <span className="truncate">{house?.name.replace('House of ', '') || ''}</span>
                    <span className="font-bold font-mono" style={{ color: '#F59E0B' }}>
                      {summary?.netPoints ?? 0} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SECTION B: HOUSE COMPETITIONS EVENTS (Game Cards, Schedules, Rules & Rosters) */}
      <div className="space-y-4 pt-2">
        <div
          className="flex items-center justify-between pb-2"
          style={{ borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" style={{ color: '#EF4444' }} />
            <h3 className="text-base font-black font-['Outfit']" style={{ color: '#FFFFFF' }}>
              House Competitions &amp; Sports Week Activity Cards
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#8B949E' }}>
            Live Source: {sportsEvents.length} Active Games
          </span>
        </div>

        {/* Game Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {sportsEvents.map((game) => {
            const firstPts = game.scoringBreakdown?.firstPlace ?? 75;
            const secondPts = game.scoringBreakdown?.secondPlace ?? 50;
            const thirdPts = game.scoringBreakdown?.thirdPlace ?? 25;
            const fourthPts = game.scoringBreakdown?.fourthPlace ?? 10;

            return (
              <div
                key={game.id}
                className="rounded-2xl p-5 space-y-4"
                style={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3"
                  style={{ borderBottom: '1px solid #21262D' }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          color: '#A5B4FC',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        {game.category}
                      </span>
                      {game.isActive && (
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black font-['Outfit']" style={{ color: '#FFFFFF' }}>
                      {game.title}
                    </h4>
                    <div
                      className="flex items-center gap-3 text-xs mt-1 flex-wrap font-medium"
                      style={{ color: '#8B949E' }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        <span>{game.date}</span>
                      </span>
                      {game.time && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                          <span>{game.time}</span>
                        </span>
                      )}
                      {game.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                          <span>{game.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="self-start sm:self-auto rounded-xl px-3 py-1.5 text-right"
                    style={{
                      backgroundColor: 'rgba(13, 17, 23, 0.8)',
                      border: '1px solid #30363D',
                    }}
                  >
                    <span className="text-[9px] uppercase font-bold block" style={{ color: '#8B949E' }}>
                      Top Placements
                    </span>
                    <span className="text-xs font-black" style={{ color: '#F59E0B' }}>
                      +{firstPts} pts (1st)
                    </span>
                  </div>
                </div>

                {/* Points Breakdown & Rules Grid */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl"
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid #21262D',
                  }}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase block mb-1.5" style={{ color: '#F59E0B' }}>
                      Points Breakdown:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono font-bold">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: '#161B22',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#FDE68A',
                        }}
                      >
                        🥇 +{firstPts}
                      </div>
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: '#161B22',
                          border: '1px solid #30363D',
                          color: '#F1F5F9',
                        }}
                      >
                        🥈 +{secondPts}
                      </div>
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: '#161B22',
                          border: '1px solid rgba(217, 119, 6, 0.4)',
                          color: '#FED7AA',
                        }}
                      >
                        🥉 +{thirdPts}
                      </div>
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: '#161B22',
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                          color: '#C7D2FE',
                        }}
                      >
                        🎖️ +{fourthPts}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase block mb-1" style={{ color: '#10B981' }}>
                      Official Game Rules:
                    </span>
                    <div
                      className="space-y-1 max-h-24 overflow-y-auto pr-1 text-[11px]"
                      style={{ color: '#CBD5E1' }}
                    >
                      {game.rules && game.rules.length > 0 ? (
                        game.rules.map((rule, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <span className="font-bold" style={{ color: '#10B981' }}>
                              &bull;
                            </span>
                            <span>{rule}</span>
                          </div>
                        ))
                      ) : (
                        <span className="italic" style={{ color: '#64748B' }}>
                          Standard competition guidelines apply.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Participation Rosters Grouped by House & Grade Level */}
                <div className="space-y-2">
                  <span
                    className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: '#F0F6FC' }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                    <span>Complete Student Participation Rosters:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {houses.map((house) => {
                      const rosterData = getEventCardHouseRosters(game, house);
                      const grades = Object.keys(rosterData.rostersByGrade);

                      return (
                        <div
                          key={house.id}
                          className="rounded-xl p-2.5 space-y-1.5"
                          style={{
                            backgroundColor: '#0D1117',
                            border: '1px solid #21262D',
                            borderLeft: `3.5px solid ${house.color}`,
                          }}
                        >
                          <div
                            className="flex items-center justify-between pb-1"
                            style={{ borderBottom: '1px solid #21262D' }}
                          >
                            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                              {house.name}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: '#38BDF8' }}>
                              {rosterData.totalAthletes} Enrolled
                            </span>
                          </div>

                          {grades.length === 0 ? (
                            <span className="text-[10px] italic" style={{ color: '#64748B' }}>
                              Roster enrolling soon.
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {grades.map((grade) => (
                                <div key={grade} className="text-[10px]">
                                  <span className="font-bold uppercase" style={{ color: '#8B949E' }}>
                                    {grade}:{' '}
                                  </span>
                                  <span style={{ color: '#E2E8F0' }}>
                                    {rosterData.rostersByGrade[grade]
                                      .map((a) => `${a.studentName} [${a.role}]`)
                                      .join(', ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Faculty Commendations Note & Official Pillars Footer */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          backgroundColor: '#161B22',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #21262D' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#F59E0B' }} />
          <h4
            className="text-xs font-black uppercase tracking-wider font-['Outfit']"
            style={{ color: '#FDE68A' }}
          >
            Faculty &amp; House Masters Commendation
          </h4>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#CBD5E1' }}>
          Dear Crestview Parents &amp; Families, we are delighted to honor our top House achievers and active sports competition athletes! Our house system nurtures curiosity, integrity, and mutual respect. Thank you parents for your continued partnership at home in encouraging our young scholars!
        </p>
        <div
          className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
          style={{ borderTop: '1px solid #21262D', color: '#8B949E' }}
        >
          <span>Office of Student Affairs &amp; House Masters &bull; Crestview International School</span>
          <span className="font-bold" style={{ color: '#F59E0B' }}>
            Character &bull; Scholarship &bull; Community
          </span>
        </div>
      </div>
    </div>
  );
};
