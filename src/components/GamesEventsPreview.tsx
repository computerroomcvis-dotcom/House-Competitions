import React, { useMemo } from 'react';
import { House, Student, SportsActivityEvent } from '../types';
import { Trophy, CalendarCheck, MapPin, Users, Award, Shield } from 'lucide-react';

interface GamesEventsPreviewProps {
  id?: string;
  sportsEvents: SportsActivityEvent[];
  houses: House[];
  students: Student[];
  className?: string;
  style?: React.CSSProperties;
}

export const GamesEventsPreview: React.FC<GamesEventsPreviewProps> = ({
  id = 'games-events-preview',
  sportsEvents,
  houses,
  students,
  className = '',
  style = {},
}) => {
  // Extract student rosters grouped by house and grade level from a sports event
  const getEventCardHouseRosters = (game: SportsActivityEvent, house: House) => {
    const houseShortName = house.name.replace('House of ', '').trim().toLowerCase();
    const houseFullName = house.name.trim().toLowerCase();

    const matchingAthletes: {
      studentId?: string;
      studentName: string;
      grade: string;
      role: string;
    }[] = [];

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

  // Structured JSON export for raw data
  const gamesJson = useMemo(() => {
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
        edition: 'Official Sports Cards & Match Podiums Report',
        date: `${monthYear}`,
        published_on: todayFormatted,
        total_events: sportsEvents.length,
      },
      sports_events: sportsEvents.map((game) => {
        const houseRosters = houses.map((house) => {
          const rosterData = getEventCardHouseRosters(game, house);
          return {
            house_id: house.id,
            house_name: house.name,
            theme_color: house.color,
            total_athletes: rosterData.totalAthletes,
            rosters_by_grade: Object.entries(rosterData.rostersByGrade).map(
              ([grade, athleteList]) => ({
                grade_level: grade,
                athlete_count: athleteList.length,
                students: athleteList.map((a) => ({
                  name: a.studentName,
                  grade: a.grade,
                  role: a.role,
                })),
              })
            ),
          };
        });

        return {
          event_id: game.id,
          event_title: game.title,
          category: game.category,
          schedule: `${game.date}${game.time ? ` • ${game.time}` : ''}`,
          venue: game.location || (game.venueCode ? `Venue ${game.venueCode}` : 'Main Campus Field'),
          status: game.isActive ? 'LIVE_NOW' : 'SCHEDULED',
          rules: game.rules || ['Standard house championship rules apply.'],
          scores: game.scores || [],
          scoring_breakdown: game.scoringBreakdown || {
            firstPlace: 75,
            secondPlace: 50,
            thirdPlace: 25,
            fourthPlace: 10,
          },
          rosters_by_house: houseRosters,
        };
      }),
    };
  }, [sportsEvents, houses, students]);

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
      data-games-json={JSON.stringify(gamesJson)}
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
      {/* 1. Header Banner */}
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
            <Trophy className="w-6 h-6" style={{ color: '#F59E0B' }} />
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
              House Competitions &amp; Sports Events
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
              Official Game Cards, Scheduled Times, Venues, Rules, Rosters &amp; Match Podiums
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
            {monthYear} Competitions
          </span>
          <span className="block text-[11px] mt-1 font-medium" style={{ color: '#8B949E' }}>
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* 2. Match Cards & Podiums List */}
      <div className="space-y-6">
        {sportsEvents.map((game, index) => {
          return (
            <div
              key={game.id || index}
              className="rounded-2xl p-5 space-y-4"
              style={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
              }}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3" style={{ borderBottom: '1px solid #21262D' }}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                    style={{ backgroundColor: '#F59E0B', color: '#0D1117' }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: '#FFFFFF' }}>{game.title}</h3>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: '#8B949E' }}>
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        {game.date} {game.time ? `• ${game.time}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" style={{ color: '#2E90FA' }} />
                        {game.location || (game.venueCode ? `Venue ${game.venueCode}` : 'Campus Field')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: game.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      color: game.isActive ? '#EF4444' : '#60A5FA',
                      border: `1px solid ${game.isActive ? '#EF4444' : '#3B82F6'}`,
                    }}
                  >
                    {game.isActive ? '🔴 LIVE NOW' : 'SCHEDULED'}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: '#21262D', color: '#CBD5E1' }}
                  >
                    {game.category}
                  </span>
                </div>
              </div>

              {/* Match Podiums & Placements (if scored) */}
              {game.scores && game.scores.length > 0 && (
                <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1117', border: '1px solid #30363D' }}>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Award className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#F59E0B' }}>
                      Match Podiums &amp; Awarded Points
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {game.scores
                      .slice()
                      .sort((a, b) => (a.placement || 99) - (b.placement || 99))
                      .map((sc) => {
                        const h = houses.find((house) => house.id === sc.houseId);
                        const placeLabel =
                          sc.placement === 1
                            ? '🥇 1st Place'
                            : sc.placement === 2
                            ? '🥈 2nd Place'
                            : sc.placement === 3
                            ? '🥉 3rd Place'
                            : '4th Place';

                        return (
                          <div
                            key={sc.houseId}
                            className="p-2.5 rounded-lg text-center"
                            style={{
                              backgroundColor: '#161B22',
                              border: `1px solid ${h?.color || '#30363D'}`,
                            }}
                          >
                            <span className="text-[10px] font-black block" style={{ color: '#F59E0B' }}>
                              {placeLabel}
                            </span>
                            <span className="text-xs font-bold block mt-0.5" style={{ color: h?.color || '#FFFFFF' }}>
                              {h?.name || 'House'}
                            </span>
                            <span className="text-xs font-black block font-mono mt-1" style={{ color: '#FFFFFF' }}>
                              +{sc.points} pts
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Rules & Points Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#0D1117', border: '1px solid #21262D' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider block mb-1" style={{ color: '#8B949E' }}>
                    Rules &amp; Regulations
                  </span>
                  <ul className="text-xs space-y-1" style={{ color: '#CBD5E1' }}>
                    {(game.rules || ['Standard house championship rules apply.']).map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: '#F59E0B' }}>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl" style={{ backgroundColor: '#0D1117', border: '1px solid #21262D' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider block mb-1" style={{ color: '#8B949E' }}>
                    Points Matrix
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div style={{ color: '#FBBF24' }}>🥇 1st: {game.scoringBreakdown?.firstPlace ?? 75} pts</div>
                    <div style={{ color: '#E2E8F0' }}>🥈 2nd: {game.scoringBreakdown?.secondPlace ?? 50} pts</div>
                    <div style={{ color: '#F97316' }}>🥉 3rd: {game.scoringBreakdown?.thirdPlace ?? 25} pts</div>
                    <div style={{ color: '#94A3B8' }}>4th: {game.scoringBreakdown?.fourthPlace ?? 10} pts</div>
                  </div>
                </div>
              </div>

              {/* Rosters by House */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Users className="w-4 h-4" style={{ color: '#F59E0B' }} />
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                    Participating Athletes &amp; Lineups by House
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {houses.map((house) => {
                    const rosterData = getEventCardHouseRosters(game, house);
                    return (
                      <div
                        key={house.id}
                        className="p-3 rounded-xl text-left"
                        style={{
                          backgroundColor: '#0D1117',
                          border: `1px solid ${house.color}40`,
                          borderLeft: `4px solid ${house.color}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black" style={{ color: house.color }}>
                            {house.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${house.color}20`, color: house.color }}
                          >
                            {rosterData.totalAthletes} Athletes
                          </span>
                        </div>
                        {rosterData.totalAthletes === 0 ? (
                          <span className="text-[11px] italic" style={{ color: '#6E7681' }}>
                            Lineup designated by House Master
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {rosterData.athletes.slice(0, 5).map((ath, aIdx) => (
                              <div key={aIdx} className="flex items-center justify-between text-[11px]">
                                <span style={{ color: '#F0F6FC' }}>{ath.studentName}</span>
                                <span style={{ color: '#8B949E' }}>{ath.grade}</span>
                              </div>
                            ))}
                            {rosterData.athletes.length > 5 && (
                              <span className="text-[10px] block" style={{ color: '#8B949E' }}>
                                +{rosterData.athletes.length - 5} more competitors
                              </span>
                            )}
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
  );
};
