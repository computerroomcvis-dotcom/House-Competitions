import { SportsActivityEvent, House, Student } from '../types';

export interface EnrolledAthleteInfo {
  studentId?: string;
  student_name: string;
  role: string;
  grade: string;
}

export interface HouseRosterGroupedByGrade {
  grade_level: string;
  athletes: {
    student_name: string;
    role: string;
    studentId?: string;
  }[];
}

export interface HouseEventParticipationRoster {
  house_id: string;
  house_name: string;
  house_color: string;
  total_athletes: number;
  roster_by_grade: HouseRosterGroupedByGrade[];
}

export interface CompiledGameCardNewsletterData {
  event_id: string;
  event_title: string;
  category: string;
  status: 'Live Now' | 'Upcoming' | 'Completed';
  scheduled_date: string;
  scheduled_time: string;
  location_venue: string;
  description: string;
  image_url?: string;
  rules: string[];
  points_value: {
    first_place: number;
    second_place: number;
    third_place: number;
    fourth_place: number;
    bonus_notes?: string;
  };
  participating_student_rosters_by_house: HouseEventParticipationRoster[];
}

export interface OfficialEventsNewsletterPayload {
  school_name: string;
  newsletter_edition: string;
  bulletin_date: string;
  source_tab: string;
  summary: {
    total_game_cards: number;
    total_participating_houses: number;
    school_motto: string;
  };
  game_cards: CompiledGameCardNewsletterData[];
  parent_announcement_message: string;
  official_footer: {
    department: string;
    contact: string;
    pillars: string;
  };
}

// Helper to extract student athletes for a house in an event
export const getEventHouseAthletes = (
  game: SportsActivityEvent,
  house: House,
  allStudents: Student[]
): EnrolledAthleteInfo[] => {
  // 1. From participatingStudentsWithRoles
  const withRoles = (game.participatingStudentsWithRoles || []).filter(
    (p) =>
      p.house.toLowerCase().includes(house.name.toLowerCase().replace('house of ', '').trim()) ||
      house.name.toLowerCase().includes(p.house.toLowerCase())
  );
  if (withRoles.length > 0) {
    return withRoles.map((p) => {
      const stObj = allStudents.find(
        (s) =>
          s.id === p.studentId ||
          s.name.toLowerCase().includes(p.student_name.toLowerCase().split(' ')[0])
      );
      return {
        studentId: p.studentId || stObj?.id,
        student_name: p.student_name,
        grade: stObj?.grade || 'Primary',
        role: p.role || 'Competitor',
      };
    });
  }

  // 2. From participatingStudentIds
  const withIds = (game.participatingStudentIds || [])
    .map((sId) => allStudents.find((s) => s.id === sId && s.houseId === house.id))
    .filter(Boolean);
  if (withIds.length > 0) {
    return withIds.map((s) => ({
      studentId: s!.id,
      student_name: s!.name,
      grade: s!.grade,
      role: 'Competitor',
    }));
  }

  // 3. Fallbacks per house for demo/default events
  if (house.id === 'house-stormchasers') {
    return [
      {
        studentId: 'stu-sc-pk4-1',
        student_name: 'Poomrapee W.',
        grade: 'PK-4',
        role: 'Anchor Performance',
      },
    ];
  } else if (house.id === 'house-earthshakers') {
    return [
      {
        studentId: 'stu-es-pk3-2',
        student_name: 'Thichanan L.',
        grade: 'PK-3',
        role: 'High Effort Lead',
      },
    ];
  } else if (house.id === 'house-mountainhearts') {
    return [
      {
        studentId: 'stu-mh-pk4-3',
        student_name: 'Linlada P.',
        grade: 'PK-4',
        role: 'Fastest Lap Anchor',
      },
    ];
  } else if (house.id === 'house-thunderhooves') {
    return [
      {
        studentId: 'stu-th-pk3-3',
        student_name: 'Kannisa T.',
        grade: 'PK-3',
        role: 'Great Sportsmanship',
      },
    ];
  }

  return [];
};

// Helper to group house athletes by grade level
export const getHouseRosterGroupedByGrade = (
  athletes: EnrolledAthleteInfo[]
): HouseRosterGroupedByGrade[] => {
  const map: Record<string, { student_name: string; role: string; studentId?: string }[]> = {};

  athletes.forEach((a) => {
    const gr = a.grade || 'Primary';
    if (!map[gr]) map[gr] = [];
    map[gr].push({
      student_name: a.student_name,
      role: a.role,
      studentId: a.studentId,
    });
  });

  return Object.keys(map).map((grade_level) => ({
    grade_level,
    athletes: map[grade_level],
  }));
};

// 1. COMPILE STRUCTURED JSON PAYLOAD
export const compileEventsNewsletterJson = (
  sportsEvents: SportsActivityEvent[],
  houses: House[],
  students: Student[]
): OfficialEventsNewsletterPayload => {
  const monthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const gameCards: CompiledGameCardNewsletterData[] = sportsEvents.map((game) => {
    const isCompleted =
      game.notes?.toLowerCase().includes('completed') ||
      (!game.isActive && (game.scores?.some((s) => s.points > 0) ?? false));
    const status = game.isActive ? 'Live Now' : isCompleted ? 'Completed' : 'Upcoming';

    const rostersByHouse: HouseEventParticipationRoster[] = houses.map((house) => {
      const athletes = getEventHouseAthletes(game, house, students);
      const rosterByGrade = getHouseRosterGroupedByGrade(athletes);
      return {
        house_id: house.id,
        house_name: house.name,
        house_color: house.color,
        total_athletes: athletes.length,
        roster_by_grade: rosterByGrade,
      };
    });

    return {
      event_id: game.id,
      event_title: game.title,
      category: game.category || 'Athletics',
      status,
      scheduled_date: game.date || '2026-02-23',
      scheduled_time: game.time || 'Schedule TBA',
      location_venue: game.location || 'Main Athletics Track & Arena',
      description: game.description || 'Inter-house championship competition.',
      image_url: game.imageUrl,
      rules:
        game.rules && game.rules.length > 0
          ? game.rules
          : ['All points earned directly add to the cumulative Society of Houses Cup standings.'],
      points_value: {
        first_place: game.scoringBreakdown?.firstPlace ?? 75,
        second_place: game.scoringBreakdown?.secondPlace ?? 50,
        third_place: game.scoringBreakdown?.thirdPlace ?? 30,
        fourth_place: game.scoringBreakdown?.fourthPlace ?? 15,
        bonus_notes:
          game.scoringBreakdown?.bonusNotes ||
          '+15 Bonus points awarded for outstanding House chant & team spirit',
      },
      participating_student_rosters_by_house: rostersByHouse,
    };
  });

  return {
    school_name: 'Crestview International School',
    newsletter_edition: 'Official Parent Newsletter • House Competitions & Sports Day Bulletin',
    bulletin_date: `${monthYear} Official Parent Bulletin`,
    source_tab: 'House Competitions Events',
    summary: {
      total_game_cards: gameCards.length,
      total_participating_houses: houses.length,
      school_motto: 'Character • Scholarship • Community',
    },
    game_cards: gameCards,
    parent_announcement_message:
      'Dear Crestview Parents & Families, we are delighted to share the active game cards, schedules, rules, and participating student rosters for our upcoming House Competitions! Students from Early Years through Grade 5 represent their houses with pride, teamwork, and athletic dedication. Please review the rosters below to support your child during their scheduled events!',
    official_footer: {
      department: 'Office of Physical Education & House Masters • Crestview International School',
      contact: 'crestview.ac.th | athletics@crestview.ac.th',
      pillars: 'Character • Scholarship • Community',
    },
  };
};

// 2. COMPILE HTML NEWSLETTER TEMPLATE
export const compileEventsNewsletterHtml = (
  sportsEvents: SportsActivityEvent[],
  houses: House[],
  students: Student[]
): string => {
  const payload = compileEventsNewsletterJson(sportsEvents, houses, students);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.newsletter_edition}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .masthead {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 32px 28px;
      border-bottom: 2px solid #f59e0b;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      margin-bottom: 12px;
    }
    .school-title {
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 6px 0;
    }
    .newsletter-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    .intro-box {
      padding: 24px 28px;
      background: #0f172a;
      border-bottom: 1px solid #1f2937;
      font-size: 13.5px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .cards-section {
      padding: 28px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 900;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 20px 0;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 8px;
    }
    .game-card {
      background: #161f30;
      border: 1px solid #334155;
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .card-header {
      padding: 16px 20px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 4px 0;
    }
    .card-meta {
      font-size: 12px;
      color: #94a3b8;
    }
    .card-body {
      padding: 20px;
    }
    .points-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .points-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 6px;
    }
    .points-pill {
      background: #1e293b;
      padding: 6px 8px;
      border-radius: 6px;
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      color: #fbbf24;
    }
    .rules-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 18px;
      font-size: 12px;
      color: #cbd5e1;
    }
    .rules-box ol {
      margin: 6px 0 0 0;
      padding-left: 18px;
    }
    .rules-box li {
      margin-bottom: 4px;
    }
    .roster-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .house-roster-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .house-header {
      font-size: 12px;
      font-weight: 900;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 4px;
      border-bottom: 1px solid #1e293b;
    }
    .grade-group {
      margin-bottom: 8px;
    }
    .grade-tag {
      display: inline-block;
      font-size: 9px;
      font-weight: bold;
      background: #1e293b;
      color: #a5b4fc;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .athlete-item {
      font-size: 11px;
      color: #f1f5f9;
      margin-bottom: 2px;
      padding-left: 6px;
    }
    .athlete-role {
      color: #f59e0b;
      font-style: italic;
      font-size: 10px;
    }
    .footer {
      background: #0a0e17;
      padding: 20px 28px;
      border-top: 1px solid #1f2937;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
    @media (max-width: 600px) {
      .roster-grid {
        grid-template-columns: 1fr;
      }
      .points-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="masthead">
      <span class="badge">Official Parent Newsletter Bulletin</span>
      <h1 class="school-title">${payload.school_name}</h1>
      <p class="newsletter-subtitle">${payload.newsletter_edition} &bull; ${payload.bulletin_date}</p>
    </div>

    <div class="intro-box">
      ${payload.parent_announcement_message}
    </div>

    <div class="cards-section">
      <h2 class="section-title">🏆 Active &amp; Upcoming House Competitions Game Cards (${payload.game_cards.length})</h2>

      ${payload.game_cards.map((game) => `
        <div class="game-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">${game.event_title}</h3>
              <div class="card-meta">
                <strong>Category:</strong> ${game.category} &bull;
                <strong>When:</strong> ${game.scheduled_date} &bull; ${game.scheduled_time} &bull;
                <strong>Where:</strong> ${game.location_venue}
              </div>
            </div>
            <span style="background: ${game.status === 'Live Now' ? '#ef4444' : '#22c55e'}; color: white; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 9999px;">
              ${game.status.toUpperCase()}
            </span>
          </div>

          <div class="card-body">
            <p style="font-size: 12.5px; color: #94a3b8; margin: 0 0 14px 0;">
              ${game.description}
            </p>

            <div class="points-box">
              <strong style="font-size: 11px; text-transform: uppercase; color: #f59e0b;">Official Points Value Breakdown:</strong>
              <div class="points-grid">
                <div class="points-pill">🥇 1st: +${game.points_value.first_place} pts</div>
                <div class="points-pill">🥈 2nd: +${game.points_value.second_place} pts</div>
                <div class="points-pill">🥉 3rd: +${game.points_value.third_place} pts</div>
                <div class="points-pill">🎖️ 4th: +${game.points_value.fourth_place} pts</div>
              </div>
              ${game.points_value.bonus_notes ? `<p style="font-size: 10.5px; color: #fbbf24; margin: 6px 0 0 0; font-style: italic;">* ${game.points_value.bonus_notes}</p>` : ''}
            </div>

            <div class="rules-box">
              <strong style="text-transform: uppercase; color: #10b981; font-size: 11px;">Official Rules &amp; Regulations:</strong>
              <ol>
                ${game.rules.map((r) => `<li>${r}</li>`).join('')}
              </ol>
            </div>

            <strong style="display: block; font-size: 12px; text-transform: uppercase; color: #cbd5e1; margin-bottom: 10px;">
              👥 Student Participation Rosters (Grouped by House &amp; Grade Level):
            </strong>

            <div class="roster-grid">
              ${game.participating_student_rosters_by_house.map((hRoster) => `
                <div class="house-roster-card" style="border-left: 3px solid ${hRoster.house_color};">
                  <div class="house-header" style="color: ${hRoster.house_color};">
                    <span>${hRoster.house_name}</span>
                    <span style="font-size: 10px; color: #94a3b8;">${hRoster.total_athletes} Athletes</span>
                  </div>

                  ${hRoster.roster_by_grade.length > 0 ? hRoster.roster_by_grade.map((grp) => `
                    <div class="grade-group">
                      <span class="grade-tag">${grp.grade_level}</span>
                      ${grp.athletes.map((ath) => `
                        <div class="athlete-item">
                          &bull; <strong>${ath.student_name}</strong> <span class="athlete-role">(${ath.role})</span>
                        </div>
                      `).join('')}
                    </div>
                  `).join('') : '<p style="font-size: 10px; color: #64748b; font-style: italic; margin: 4px 0;">No athletes currently enrolled</p>'}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>${payload.official_footer.department}</strong></p>
      <p style="margin: 0;">${payload.summary.school_motto} &bull; ${payload.official_footer.contact}</p>
    </div>
  </div>
</body>
</html>`;
};

// 3. COMPILE TEXT ANNOUNCEMENT
export const compileEventsNewsletterText = (
  sportsEvents: SportsActivityEvent[],
  houses: House[],
  students: Student[]
): string => {
  const payload = compileEventsNewsletterJson(sportsEvents, houses, students);

  let text = `📰 ${payload.school_name.toUpperCase()} • PARENT NEWSLETTER\n`;
  text += `HOUSE COMPETITIONS EVENTS & SPORTS DAY BULLETIN\n`;
  text += `${payload.bulletin_date.toUpperCase()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `${payload.parent_announcement_message}\n\n`;

  text += `🏆 ACTIVE & UPCOMING GAME CARDS (${payload.game_cards.length} EVENTS):\n`;
  text += `─────────────────────────────────────────────────────────────────\n\n`;

  payload.game_cards.forEach((game, idx) => {
    text += `${idx + 1}. ${game.event_title.toUpperCase()} [${game.status}]\n`;
    text += `   • Category: ${game.category}\n`;
    text += `   • Schedule: ${game.scheduled_date} at ${game.scheduled_time}\n`;
    text += `   • Venue: ${game.location_venue}\n`;
    text += `   • Points Breakdown: 1st (+${game.points_value.first_place} pts), 2nd (+${game.points_value.second_place} pts), 3rd (+${game.points_value.third_place} pts), 4th (+${game.points_value.fourth_place} pts)\n`;
    if (game.points_value.bonus_notes) {
      text += `   • Bonus: ${game.points_value.bonus_notes}\n`;
    }
    text += `   • Official Rules:\n`;
    game.rules.forEach((r, rIdx) => {
      text += `     ${rIdx + 1}. ${r}\n`;
    });

    text += `   • Participating Student Rosters (Grouped by House & Grade):\n`;
    game.participating_student_rosters_by_house.forEach((hRoster) => {
      text += `     ▫️ ${hRoster.house_name} (${hRoster.total_athletes} Athletes):\n`;
      if (hRoster.roster_by_grade.length === 0) {
        text += `        (Roster updating)\n`;
      } else {
        hRoster.roster_by_grade.forEach((grp) => {
          const names = grp.athletes.map((a) => `${a.student_name} (${a.role})`).join(', ');
          text += `        [${grp.grade_level}]: ${names}\n`;
        });
      }
    });
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `${payload.official_footer.department}\n`;
  text += `${payload.summary.school_motto}\n`;

  return text;
};
