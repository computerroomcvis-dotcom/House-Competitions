import React, { useState, useRef, useMemo } from 'react';
import { House, Student, SportsActivityEvent, GradeLevel, ALL_GRADES, GRADE_LABELS } from '../types';
import { StudentPointSummary } from '../utils/storage';
import {
  X,
  Download,
  Copy,
  Check,
  Trophy,
  Crown,
  Flame,
  FileText,
  FileCode,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  School,
  ChevronLeft,
  ChevronRight,
  Columns,
  Presentation,
  Award,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { toPng, toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  houses: House[];
  studentSummaries: Record<string, StudentPointSummary>;
  sportsEvents: SportsActivityEvent[];
  initialTab?: 'students' | 'sports';
  initialDivision?: 'TP-GK' | 'G1-G5';
  initialClass?: GradeLevel;
}

const TP_GK_GRADES: GradeLevel[] = ['TP', 'PK-3', 'PK-4', 'GK-Emerald'];
const G1_G5_GRADES: GradeLevel[] = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  students,
  houses,
  studentSummaries,
  sportsEvents,
  initialTab = 'students',
  initialDivision = 'TP-GK',
  initialClass = 'Grade 1',
}) => {
  // Tabs: 'students' (Top Students Graphic & Text) or 'sports' (Sports Week Cards PDF)
  const [activeTab, setActiveTab] = useState<'students' | 'sports'>(initialTab);

  // Filter mode for students: 'division' vs 'class'
  const [filterMode, setFilterMode] = useState<'division' | 'class'>('division');
  const [selectedDivision, setSelectedDivision] = useState<'TP-GK' | 'G1-G5'>(initialDivision);
  const [selectedClass, setSelectedClass] = useState<GradeLevel>(initialClass);

  // Layout presentation mode: 'side-by-side' or 'slideshow'
  const [displayMode, setDisplayMode] = useState<'side-by-side' | 'slideshow'>('side-by-side');
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Sports Week Filter
  const [sportsFilter, setSportsFilter] = useState<'all' | 'live'>('all');

  // Copy feedback states
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Official Sports & Event Games Highlights HTML for Newsletter
  const newsletterSportsHtml = `<!-- EVENT & GAME CARDS NEWSLETTER SECTION -->
<div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-top: 20px; color: white;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 10px;">
    <h3 style="margin: 0; color: #f79009; font-size: 16px;">🏆 House Cup Sports & Event Games Highlights</h3>
    <span style="background: #2e90fa; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 12px;">OFFICIAL SCORECARD</span>
  </div>

  <!-- GAME CARDS GRID -->
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px;">
    
    <!-- GAME CARD 1 -->
    <div style="background: #0d1117; border: 1px solid #21262d; padding: 12px; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8b949e;">
        <span>🤼 TUG OF WAR CHAMPIONSHIP</span>
        <span style="color: #12b76a; font-weight: bold;">COMPLETED</span>
      </div>
      <h4 style="margin: 6px 0 10px 0; color: #f0f6fc; font-size: 14px;">Winner: House of Stormchasers (75 pts)</h4>
      
      <p style="font-size: 11px; color: #8b949e; margin: 0 0 6px 0;">Key Student Participants:</p>
      <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #c9d1d9;">
        <li><strong>Poomrapee W.</strong> (Stormchasers) — Anchor Performance (+25 pts)</li>
        <li><strong>Thichanan L.</strong> (Earthshakers) — High Effort Lead (+15 pts)</li>
      </ul>
    </div>

    <!-- GAME CARD 2 -->
    <div style="background: #0d1117; border: 1px solid #21262d; padding: 12px; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #8b949e;">
        <span>🏃 SPRINT RELAYS (4x100m)</span>
        <span style="color: #12b76a; font-weight: bold;">COMPLETED</span>
      </div>
      <h4 style="margin: 6px 0 10px 0; color: #f0f6fc; font-size: 14px;">Winner: House of Earthshakers (60 pts)</h4>
      
      <p style="font-size: 11px; color: #8b949e; margin: 0 0 6px 0;">Key Student Participants:</p>
      <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #c9d1d9;">
        <li><strong>Linlada P.</strong> (Mountainhearts) — Fastest Lap (+20 pts)</li>
        <li><strong>Kannisa T.</strong> (Thunderhooves) — Great Sportsmanship (+15 pts)</li>
      </ul>
    </div>

  </div>
</div>`;

  // Graphic DOM ref for html2canvas
  const graphicRef = useRef<HTMLDivElement>(null);
  const sportsCardsRef = useRef<HTMLDivElement>(null);

  // 1. Determine active grades based on division or class mode
  const activeGrades = useMemo(() => {
    if (filterMode === 'class') {
      return [selectedClass];
    }
    return selectedDivision === 'TP-GK' ? TP_GK_GRADES : G1_G5_GRADES;
  }, [filterMode, selectedDivision, selectedClass]);

  // Filter students within the active grades
  const filteredStudents = useMemo(() => {
    return students.filter((s) => activeGrades.includes(s.grade));
  }, [students, activeGrades]);

  // 2. Top student of EACH HOUSE in this division/class
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

  // 3. Top student of EACH LEVEL/GRADE (for division mode)
  const topStudentsByGrade = useMemo(() => {
    if (filterMode !== 'division') return [];
    return activeGrades.map((grade) => {
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
    }).filter((item) => item.student !== undefined);
  }, [filterMode, activeGrades, filteredStudents, houses, studentSummaries]);

  // 4. Overall Top Performer in this scope
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

  // 5. Build the exact structured JSON report requested for newsletters
  const structuredReportData = useMemo(() => {
    const monthYear = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const divisionLabel =
      filterMode === 'class'
        ? `${GRADE_LABELS[selectedClass]} Class`
        : selectedDivision === 'TP-GK'
        ? 'Early Years (TP - GK)'
        : 'Primary Division (G1 - G5)';

    return {
      header: {
        school_name: 'Crestview International School',
        edition: 'Parent Newsletter Edition',
        title: 'Monthly House Cup Star Achievers',
        subtitle: 'Official faculty commendation recognizing academic diligence, kindness & house spirit',
        division: divisionLabel,
        bulletin_date: `${monthYear} Bulletin`,
      },
      house_star_achievers: topStudentsByHouse.map(({ house, student, totalPoints, merits }) => ({
        house_name: house.name,
        mascot_motto: house.mascot,
        student_name: student ? student.name : 'Standings updating',
        grade_level: student ? student.grade : '',
        badge: student?.isPrefect ? 'Prefect' : '',
        net_points: totalPoints,
        merits: `+${merits} merits`,
        theme_color: house.color,
      })),
      grade_level_achievers: topStudentsByGrade.map(({ grade, student, house, summary }) => ({
        grade,
        student_name: student?.name || 'TBD',
        house: house?.name || 'House System',
        points: summary?.netPoints ?? 0,
      })),
      overall_star_scholar: {
        student_name: overallTopStudent?.student?.name || 'Pending',
        house: overallTopStudent?.house?.name || 'House System',
        total_house_points: overallTopStudent?.summary?.netPoints ?? 0,
      },
      sports_games_breakdown: [
        {
          game_title: 'TUG OF WAR CHAMPIONSHIP',
          status: 'COMPLETED',
          winner: 'House of Stormchasers (75 pts)',
          key_participants: [
            { student_name: 'Poomrapee W.', house: 'Stormchasers', role_highlight: 'Anchor Performance (+25 pts)' },
            { student_name: 'Thichanan L.', house: 'Earthshakers', role_highlight: 'High Effort Lead (+15 pts)' },
          ],
        },
        {
          game_title: 'SPRINT RELAYS (4x100m)',
          status: 'COMPLETED',
          winner: 'House of Earthshakers (60 pts)',
          key_participants: [
            { student_name: 'Linlada P.', house: 'Mountainhearts', role_highlight: 'Fastest Lap (+20 pts)' },
            { student_name: 'Kannisa T.', house: 'Thunderhooves', role_highlight: 'Great Sportsmanship (+15 pts)' },
          ],
        },
      ],
      faculty_commendation: {
        title: 'Monthly Parent Newsletter Bulletin • Faculty Commendations',
        tagline: 'Crestview House System • Celebrating character, teamwork, and curiosity',
        message:
          'Dear Crestview Parents & Families, we are delighted to honor our top House achievers for this month! Our house system nurtures curiosity, integrity, and mutual respect. These outstanding students have distinguished themselves through their daily commitment, kindness to peers, and positive participation in school life. Thank you parents for your continued partnership at home in encouraging our young scholars!',
        edition_tag: `${monthYear} Parent Edition`,
      },
      footer: {
        department: 'Office of Student Affairs & House Masters • Crestview International School',
        pillars: 'Character • Scholarship • Community',
      },
    };
  }, [filterMode, selectedClass, selectedDivision, topStudentsByHouse, topStudentsByGrade, overallTopStudent]);

  // 6. Generate Text Announcement for Copying
  const generatedTextAnnouncement = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const monthYear = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const scopeTitle =
      filterMode === 'class'
        ? `${GRADE_LABELS[selectedClass]} Class`
        : selectedDivision === 'TP-GK'
        ? 'Early Years Division (TP – GK)'
        : 'Primary Division (Grade 1 – Grade 5)';

    let text = `📰 CRESTVIEW INTERNATIONAL SCHOOL • MONTHLY PARENT NEWSLETTER\n`;
    text += `HOUSE CUP STAR ACHIEVERS BULLETIN — ${monthYear.toUpperCase()}\n`;
    text += `Division / Scope: ${scopeTitle}\n`;
    text += `Date: ${today}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Dear Crestview Parents & Families,\n\n`;
    text += `We are delighted to present this month's top House achievers! Our students have shown remarkable enthusiasm, positive character, and academic diligence across all activities. Please join us in celebrating their accomplishments:\n\n`;

    topStudentsByHouse.forEach(({ house, student, totalPoints, merits }) => {
      const houseEmoji =
        house.name.includes('Earth')
          ? '🐘'
          : house.name.includes('Mountain')
          ? '🐐'
          : house.name.includes('Storm')
          ? '🦅'
          : '🐎';
      if (student) {
        text += `${houseEmoji} ${house.name} (${house.mascot}):\n`;
        text += `   • Student: ${student.name}${student.isPrefect ? ' [Prefect]' : ''}\n`;
        text += `   • Grade: ${student.grade}\n`;
        text += `   • Performance: ${totalPoints} Net Points (+${merits} Merits earned)\n\n`;
      } else {
        text += `${houseEmoji} ${house.name}: Standings updating soon for this category.\n\n`;
      }
    });

    if (filterMode === 'division' && topStudentsByGrade.length > 0) {
      text += `🌟 TOP ACHIEVER BY GRADE LEVEL:\n`;
      topStudentsByGrade.forEach(({ grade, student, house, summary }) => {
        if (student && house) {
          text += `   • ${grade}: ${student.name} (${house.name}) — ${summary?.netPoints ?? 0} pts\n`;
        }
      });
      text += `\n`;
    }

    if (overallTopStudent?.student && overallTopStudent.house) {
      text += `👑 OVERALL MONTHLY STAR SCHOLAR: ${overallTopStudent.student.name} (${overallTopStudent.student.grade} • ${overallTopStudent.house.name}) with an outstanding ${overallTopStudent.summary?.netPoints ?? 0} total points!\n\n`;
    }

    text += `🏆 HOUSE CUP SPORTS & EVENT GAMES HIGHLIGHTS:\n`;
    text += `   • 🤼 TUG OF WAR CHAMPIONSHIP [COMPLETED]: Winner House of Stormchasers (75 pts)\n`;
    text += `     - Poomrapee W. (Stormchasers) — Anchor Performance (+25 pts)\n`;
    text += `     - Thichanan L. (Earthshakers) — High Effort Lead (+15 pts)\n\n`;
    text += `   • 🏃 SPRINT RELAYS (4x100m) [COMPLETED]: Winner House of Earthshakers (60 pts)\n`;
    text += `     - Linlada P. (Mountainhearts) — Fastest Lap (+20 pts)\n`;
    text += `     - Kannisa T. (Thunderhooves) — Great Sportsmanship (+15 pts)\n\n`;

    text += `Thank you, dear parents, for your continued support and encouragement at home. Together, we celebrate our children's growth, leadership, and kindness.\n\n`;
    text += `Warm regards,\n`;
    text += `The Faculty, House Masters & Administration\n`;
    text += `Crestview International School • "Character • Scholarship • Community"`;

    return text;
  }, [filterMode, selectedDivision, selectedClass, topStudentsByHouse, topStudentsByGrade, overallTopStudent]);

  // Copy text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedTextAnnouncement);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(structuredReportData, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    }
  };

  // Copy Newsletter HTML Code to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(newsletterSportsHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    } catch {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    }
  };

  // Download JSON
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(structuredReportData, null, 2));
    const link = document.createElement('a');
    const suffix = filterMode === 'class' ? selectedClass.replace(/\s+/g, '-').toLowerCase() : selectedDivision.toLowerCase();
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `crestview-monthly-house-cup-${suffix}.json`);
    link.click();
  };

  // Download DOC format (Microsoft Word compatible)
  const handleDownloadGraphicDOC = () => {
    const data = structuredReportData;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${data.header.title}</title>
        <style>
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 40px; color: #1e293b; background: #ffffff; }
          .masthead { border-bottom: 3px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px; }
          .school-name { font-size: 11pt; font-weight: bold; color: #d97706; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
          .title { font-size: 24pt; font-weight: bold; color: #0f172a; margin: 6px 0; }
          .subtitle { font-size: 11pt; color: #64748b; margin-bottom: 12px; }
          .tag { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 10px; font-weight: bold; border-radius: 4px; font-size: 10pt; }
          h2 { font-size: 15pt; color: #0f172a; border-left: 4px solid #f59e0b; padding-left: 10px; margin-top: 24px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 24px; }
          th { background-color: #0f172a; color: #ffffff; padding: 10px 12px; text-align: left; font-size: 10.5pt; font-weight: bold; border: 1px solid #334155; }
          td { border: 1px solid #cbd5e1; padding: 9px 12px; font-size: 10pt; }
          .star-box { background-color: #fffbeb; border: 2px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0; }
          .commendation { background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin-top: 24px; font-size: 10.5pt; line-height: 1.6; }
          .footer { margin-top: 40px; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class='masthead'>
          <p class='school-name'>${data.header.school_name} &bull; ${data.header.edition}</p>
          <h1 class='title'>${data.header.title}</h1>
          <p class='subtitle'>${data.header.subtitle}</p>
          <p><span class='tag'>${data.header.division}</span> &nbsp; <strong>${data.header.bulletin_date}</strong></p>
        </div>

        <h2>Top of House: Star Achievers</h2>
        <table>
          <thead>
            <tr>
              <th>House Name</th>
              <th>Mascot / Motto</th>
              <th>Star Student</th>
              <th>Grade</th>
              <th>Badge</th>
              <th>Net Points</th>
              <th>Merits</th>
            </tr>
          </thead>
          <tbody>
            ${data.house_star_achievers.map((h) => `
              <tr>
                <td style='color: ${h.theme_color}; font-weight: bold;'>${h.house_name}</td>
                <td>${h.mascot_motto}</td>
                <td><strong>${h.student_name}</strong></td>
                <td>${h.grade_level}</td>
                <td>${h.badge || '-'}</td>
                <td style='font-weight: bold;'>${h.net_points}</td>
                <td style='color: #16a34a; font-weight: bold;'>${h.merits}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Top of Grades: Star Achievers</h2>
        <table>
          <thead>
            <tr>
              <th>Grade Level</th>
              <th>Student Name</th>
              <th>House Affiliation</th>
              <th>Points Earned</th>
            </tr>
          </thead>
          <tbody>
            ${data.grade_level_achievers.map((g) => `
              <tr>
                <td><strong>${g.grade}</strong></td>
                <td>${g.student_name}</td>
                <td>${g.house}</td>
                <td style='font-weight: bold;'>${g.points} pts</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class='star-box'>
          <p style='margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #b45309;'>👑 Overall Star Scholar of the Month</p>
          <p style='margin: 6px 0; font-size: 16pt; font-weight: bold; color: #0f172a;'>${data.overall_star_scholar.student_name}</p>
          <p style='margin: 0; color: #64748b;'>House: <strong>${data.overall_star_scholar.house}</strong> &bull; Total Points: <strong>${data.overall_star_scholar.total_house_points}</strong></p>
        </div>

        ${newsletterSportsHtml}

        <div class='commendation'>
          <h4 style='margin: 0 0 6px 0; color: #1e40af; font-size: 11pt;'>${data.faculty_commendation.title}</h4>
          <p style='margin: 0 0 8px 0; font-size: 9.5pt; color: #64748b;'>${data.faculty_commendation.tagline}</p>
          <p style='margin: 0; color: #334155;'>${data.faculty_commendation.message}</p>
        </div>

        <div class='footer'>
          <p style='margin: 0;'>${data.footer.department}</p>
          <p style='margin: 4px 0 0 0; font-weight: bold; color: #64748b;'>${data.footer.pillars}</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const suffix = filterMode === 'class' ? selectedClass.replace(/\s+/g, '-').toLowerCase() : selectedDivision.toLowerCase();
    link.href = url;
    link.download = `crestview-monthly-house-cup-${suffix}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Robust DOM capture helper supporting modern CSS / Tailwind v4
  const captureElementToCanvas = async (
    element: HTMLElement,
    scale: number = 2,
    backgroundColor: string = '#0b0f19'
  ): Promise<HTMLCanvasElement> => {
    try {
      return await toCanvas(element, {
        pixelRatio: scale,
        backgroundColor,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });
    } catch (toCanvasErr) {
      console.warn('html-to-image toCanvas failed, trying html2canvas-pro fallback:', toCanvasErr);
      return await html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor,
        logging: false,
      });
    }
  };

  const captureElementToDataUrl = async (
    element: HTMLElement,
    scale: number = 2.5,
    backgroundColor: string = '#0b0f19'
  ): Promise<string> => {
    try {
      return await toPng(element, {
        pixelRatio: scale,
        backgroundColor,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });
    } catch (toPngErr) {
      console.warn('html-to-image toPng failed, trying html2canvas-pro fallback:', toPngErr);
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    }
  };

  // 7. Export Graphic as PNG
  const handleDownloadGraphicPNG = async () => {
    if (!graphicRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating publication-quality PNG graphic with School Logo & Side Show...');
    try {
      const dataUrl = await captureElementToDataUrl(graphicRef.current, 2.5, '#0b0f19');
      const filenameSuffix =
        filterMode === 'class' ? selectedClass.replace(/\s+/g, '-').toLowerCase() : selectedDivision.toLowerCase();
      const link = document.createElement('a');
      link.download = `crestview-house-cup-report-${filenameSuffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to export PNG:', err);
      alert(`Could not export PNG graphic: ${errorMsg}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  // 8. Export Graphic as PDF
  const handleDownloadGraphicPDF = async () => {
    if (!graphicRef.current) return;
    setIsExporting(true);
    setExportMessage('Preparing newsletter PDF with School Logo & Side Show layout...');
    try {
      const canvas = await captureElementToCanvas(graphicRef.current, 2, '#0b0f19');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let imgWidth = pageWidth - 16;
      let imgHeight = imgWidth / ratio;
      if (imgHeight > pageHeight - 16) {
        imgHeight = pageHeight - 16;
        imgWidth = imgHeight * ratio;
      }
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      const filenameSuffix =
        filterMode === 'class' ? selectedClass.replace(/\s+/g, '-').toLowerCase() : selectedDivision.toLowerCase();
      pdf.save(`crestview-house-cup-report-${filenameSuffix}.pdf`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to export graphic PDF:', err);
      alert(`Could not export graphic PDF: ${errorMsg}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  // 9. Filter Sports Events
  const filteredSportsEvents = useMemo(() => {
    if (sportsFilter === 'live') {
      return sportsEvents.filter((e) => e.isActive);
    }
    return sportsEvents;
  }, [sportsEvents, sportsFilter]);

  // 10. Export Sports Week Cards PDF
  const handleDownloadSportsPDF = async () => {
    if (!sportsCardsRef.current) return;
    setIsExporting(true);
    setExportMessage('Rendering Sports Week cards into printable PDF...');
    try {
      const canvas = await captureElementToCanvas(sportsCardsRef.current, 2, '#0f172a');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 16;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 8;

      pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`crestview-sports-week-cards-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to export Sports PDF:', err);
      alert(`Could not export Sports PDF: ${errorMsg}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-6xl my-6 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-8 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <img
                src="/school_crest_logo.jpg"
                alt="School Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                  Newsletter &amp; Monthly House Cup Export Center
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  PNG • PDF • DOC • JSON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Crestview newsletter layout with School Logo, Side Show of Top of House &amp; Top of Grades
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Tabs: Top Students Graphic vs Sports Week Cards */}
        <div className="px-5 sm:px-8 pt-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Monthly House Cup Report (PNG, PDF, DOC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sports')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'sports'
                ? 'border-rose-500 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Sports Week Cards (PDF)</span>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
              {sportsEvents.length} Games
            </span>
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TOP STUDENTS GRAPHIC & TEXT */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Filter Controls: Scope & Side Show / Layout Toggle */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Mode Selector */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Scope:
                    </span>
                    <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFilterMode('division')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterMode === 'division'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        By Division
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('class')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterMode === 'class'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        By Class
                      </button>
                    </div>
                  </div>

                  {/* Sub-Selection: Division Buttons OR Class Dropdown */}
                  {filterMode === 'division' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDivision('TP-GK')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          selectedDivision === 'TP-GK'
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        🌟 Early Years (TP – GK)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDivision('G1-G5')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          selectedDivision === 'G1-G5'
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        🏆 Primary (G1 – G5)
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value as GradeLevel)}
                        className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {ALL_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {GRADE_LABELS[g]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Side Show Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    View Mode:
                  </span>
                  <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('side-by-side')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        displayMode === 'side-by-side'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Side by side layout of top house and top grades"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Side-by-Side</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('slideshow')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        displayMode === 'slideshow'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Slide show showcase view"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Slide Show</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Toolbar for PNG, PDF, DOC, JSON, Text */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    Export Formats:
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    {filterMode === 'division'
                      ? selectedDivision === 'TP-GK'
                        ? 'Early Years (TP – GK)'
                        : 'Primary (G1 – G5)'
                      : `${selectedClass} Class`}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* PNG Button */}
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadGraphicPNG}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>Download PNG</span>
                  </button>

                  {/* PDF Button */}
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadGraphicPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span>Download PDF</span>
                  </button>

                  {/* DOC Button */}
                  <button
                    type="button"
                    onClick={handleDownloadGraphicDOC}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span>Download DOC</span>
                  </button>

                  {/* JSON Button */}
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 border border-slate-700 transition-all cursor-pointer"
                    title="Download structured JSON"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>JSON</span>
                  </button>

                  {/* Copy JSON */}
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                    title="Copy structured JSON to clipboard"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">JSON Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>

                  {/* Copy Text */}
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Text Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  {/* Copy Newsletter Scorecard HTML */}
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 border border-slate-700 transition-all cursor-pointer"
                    title="Copy newsletter scorecard HTML snippet"
                  >
                    {copiedHtml ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">HTML Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy HTML</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Message while generating export */}
              {isExporting && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{exportMessage}</span>
                </div>
              )}

              {/* SLIDESHOW CONTROLS (Active if user selected Slide Show mode) */}
              {displayMode === 'slideshow' && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Slide {currentSlide + 1} of 3:
                    </span>
                    <span className="text-xs text-white font-medium">
                      {currentSlide === 0
                        ? '🏆 Top of House (4 House Star Achievers)'
                        : currentSlide === 1
                        ? '🌟 Top of Grades (Grade Level Achievers)'
                        : '👑 Overall Star Scholar & Faculty Letter'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 2))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentSlide === idx
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentSlide((prev) => (prev < 2 ? prev + 1 : 0))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* THE SLEEK GRAPHIC CARD PREVIEW (Exported to PNG & PDF!) */}
              <div className="rounded-3xl p-1 bg-gradient-to-br from-amber-500/40 via-indigo-600/30 to-rose-600/40 shadow-2xl">
                <div
                  ref={graphicRef}
                  id="top-students-export-graphic"
                  className="bg-[#0b0f19] text-white p-6 sm:p-9 rounded-[22px] relative overflow-hidden space-y-7 border border-slate-800"
                >
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                  {/* Graphic Header: Official School Newsletter Masthead with Logo */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-800/90">
                    <div className="flex items-center gap-4.5">
                      {/* SCHOOL LOGO */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/80 p-1 flex items-center justify-center shrink-0 shadow-xl shadow-amber-400/15 overflow-hidden">
                        <img
                          src="/school_crest_logo.jpg"
                          alt="Crestview International School Crest"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
                            Crestview International School
                          </span>
                          <span className="text-slate-600 font-bold">&bull;</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/90 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded">
                            Parent Newsletter Edition
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight mt-1">
                          Monthly House Cup Star Achievers
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                          Official faculty commendation recognizing academic diligence, kindness &amp; house spirit
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {filterMode === 'division'
                            ? selectedDivision === 'TP-GK'
                              ? 'Early Years (TP – GK)'
                              : 'Primary (G1 – G5)'
                            : `${GRADE_LABELS[selectedClass]} Class`}
                        </span>
                      </span>
                      <span className="text-[11px] sm:text-xs text-amber-300/90 font-bold mt-2">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Bulletin
                      </span>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE OR SIDE SHOW PRESENTATION: TOP OF HOUSE & TOP OF GRADES */}
                  <div
                    className={
                      displayMode === 'side-by-side'
                        ? 'relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6'
                        : 'relative z-10 space-y-6'
                    }
                  >
                    {/* SECTION 1: TOP OF HOUSE (House Star Achievers) */}
                    {(displayMode === 'side-by-side' || currentSlide === 0) && (
                      <div className={displayMode === 'side-by-side' ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>Top of House &bull; Star Achievers</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            4 House Champions
                          </span>
                        </div>

                        {/* 4 Houses Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {topStudentsByHouse.map(({ house, student, totalPoints, merits }) => (
                            <div
                              key={house.id}
                              className="bg-slate-900/95 rounded-2xl border border-slate-800 p-4.5 flex flex-col justify-between relative overflow-hidden group shadow-lg"
                            >
                              {/* House Color Accent Bar */}
                              <div
                                className="absolute top-0 left-0 right-0 h-1.5"
                                style={{ backgroundColor: house.color }}
                              />

                              <div>
                                {/* House Header */}
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  <span
                                    className="px-2.5 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider shadow-2xs"
                                    style={{ backgroundColor: house.color }}
                                  >
                                    {house.name}
                                  </span>
                                  <span className="text-[11px] text-slate-300 font-bold truncate">
                                    {house.mascot}
                                  </span>
                                </div>

                                {/* Student Details */}
                                {student ? (
                                  <div className="space-y-2 mt-2">
                                    <div className="flex items-start gap-2.5">
                                      <div
                                        className="w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-inner shrink-0 mt-0.5"
                                        style={{ backgroundColor: house.color }}
                                      >
                                        {student.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h5 className="text-sm sm:text-base font-black text-white break-words leading-tight group-hover:text-amber-300 transition-colors">
                                          {student.name}
                                        </h5>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                          <span className="text-xs font-semibold text-slate-300">
                                            {student.grade}
                                          </span>
                                          {student.isPrefect && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                              Prefect
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-6 text-center text-xs text-slate-400 italic">
                                    Standings updating for this level
                                  </div>
                                )}
                              </div>

                              {/* Points Footer */}
                              {student && (
                                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-baseline justify-between gap-2">
                                  <div>
                                    <span className="text-xl font-black text-white font-['Outfit']">
                                      {totalPoints}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-1 font-bold">pts</span>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    +{merits} merits
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: TOP OF GRADES (Side Show Column) */}
                    {(displayMode === 'side-by-side' || currentSlide === 1) && (
                      <div className={displayMode === 'side-by-side' ? 'lg:col-span-5 space-y-4' : 'space-y-4'}>
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>Top of Grades &bull; Star Achievers</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            By Grade Level
                          </span>
                        </div>

                        {/* Top of Grades Cards Stack */}
                        <div className="space-y-2.5">
                          {topStudentsByGrade.length > 0 ? (
                            topStudentsByGrade.map(({ grade, student, house, summary }) => (
                              <div
                                key={grade}
                                className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-11 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                                    {grade}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-black text-white truncate">
                                      {student?.name || 'TBD'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: house?.color }}
                                      />
                                      <span className="font-semibold text-slate-300 truncate">
                                        {house?.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-sm font-black text-amber-400 font-['Outfit'] block">
                                    {summary?.netPoints ?? 0}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-bold block uppercase">
                                    points
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
                              Selected class view active
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OVERALL STAR SCHOLAR BANNER */}
                  {(displayMode === 'side-by-side' || currentSlide === 2) && overallTopStudent?.student && overallTopStudent.house && (
                    <div className="relative z-10 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-transparent border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-400/20">
                          <Crown className="w-6 h-6 text-amber-950" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                            Overall Star Scholar of the Month
                          </span>
                          <h4 className="text-base sm:text-xl font-black text-white break-words leading-tight mt-0.5">
                            {overallTopStudent.student.name}
                          </h4>
                          <span className="text-xs text-amber-200/90 font-medium block mt-0.5">
                            {overallTopStudent.student.grade} &bull; {overallTopStudent.house.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-amber-500/30">
                        <span className="text-2xl sm:text-3xl font-black text-amber-300 font-['Outfit'] block leading-none">
                          {overallTopStudent.summary?.netPoints ?? 0}
                        </span>
                        <span className="text-[10px] text-amber-200 font-bold block mt-1">
                          Total House Points
                        </span>
                      </div>
                    </div>
                  )}

                  {/* EVENT & GAME CARDS NEWSLETTER SECTION (Official Scorecard) */}
                  {(displayMode === 'side-by-side' || currentSlide === 2) && (
                    <div style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', marginTop: '20px', color: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, color: '#f79009', fontSize: '16px' }}>🏆 House Cup Sports &amp; Event Games Highlights</h3>
                        <span style={{ background: '#2e90fa', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>OFFICIAL SCORECARD</span>
                      </div>

                      {/* GAME CARDS GRID */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '15px' }}>
                        
                        {/* GAME CARD 1 */}
                        <div style={{ background: '#0d1117', border: '1px solid #21262d', padding: '12px', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e' }}>
                            <span>🤼 TUG OF WAR CHAMPIONSHIP</span>
                            <span style={{ color: '#12b76a', fontWeight: 'bold' }}>COMPLETED</span>
                          </div>
                          <h4 style={{ margin: '6px 0 10px 0', color: '#f0f6fc', fontSize: '14px' }}>Winner: House of Stormchasers (75 pts)</h4>
                          
                          <p style={{ fontSize: '11px', color: '#8b949e', margin: '0 0 6px 0' }}>Key Student Participants:</p>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#c9d1d9' }}>
                            <li><strong>Poomrapee W.</strong> (Stormchasers) — Anchor Performance (+25 pts)</li>
                            <li><strong>Thichanan L.</strong> (Earthshakers) — High Effort Lead (+15 pts)</li>
                          </ul>
                        </div>

                        {/* GAME CARD 2 */}
                        <div style={{ background: '#0d1117', border: '1px solid #21262d', padding: '12px', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e' }}>
                            <span>🏃 SPRINT RELAYS (4x100m)</span>
                            <span style={{ color: '#12b76a', fontWeight: 'bold' }}>COMPLETED</span>
                          </div>
                          <h4 style={{ margin: '6px 0 10px 0', color: '#f0f6fc', fontSize: '14px' }}>Winner: House of Earthshakers (60 pts)</h4>
                          
                          <p style={{ fontSize: '11px', color: '#8b949e', margin: '0 0 6px 0' }}>Key Student Participants:</p>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#c9d1d9' }}>
                            <li><strong>Linlada P.</strong> (Mountainhearts) — Fastest Lap (+20 pts)</li>
                            <li><strong>Kannisa T.</strong> (Thunderhooves) — Great Sportsmanship (+15 pts)</li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* FACULTY COMMENDATIONS NOTE & OFFICIAL FOOTER */}
                  {(displayMode === 'side-by-side' || currentSlide === 2) && (
                    <div className="relative z-10 bg-slate-900/90 rounded-2xl border border-amber-500/25 p-5 sm:p-6 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                            <FileText className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 font-['Outfit']">
                              Monthly Parent Newsletter Bulletin &bull; Faculty Commendations
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              Crestview House System &bull; Celebrating character, teamwork, and curiosity
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700/80 self-start sm:self-auto">
                          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Parent Edition
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        Dear Crestview Parents &amp; Families, we are delighted to honor our top House achievers for this month! Our house system nurtures curiosity, integrity, and mutual respect. These outstanding students have distinguished themselves through their daily commitment, kindness to peers, and positive participation in school life. Thank you parents for your continued partnership at home in encouraging our young scholars!
                      </p>

                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                        <span>Office of Student Affairs &amp; House Masters &bull; Crestview International School</span>
                        <span className="italic text-amber-400/90 font-medium">
                          Character &bull; Scholarship &bull; Community
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ready-to-Copy Structured JSON, Announcement Text & Newsletter HTML Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Structured JSON Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">
                        Structured Report JSON
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
                      >
                        {copiedJson ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-slate-950" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-950" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    rows={8}
                    value={JSON.stringify(structuredReportData, null, 2)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300/90 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Formatted JSON payload for division newsletters and automated school bulletins.
                  </p>
                </div>

                {/* 2. Announcement Text Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">
                        Formatted Newsletter Text
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    readOnly
                    rows={8}
                    value={generatedTextAnnouncement}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ready to copy and paste directly into parent communications or email newsletters.
                  </p>
                </div>

                {/* 3. Newsletter Scorecard HTML Code Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-rose-400" />
                      <h4 className="text-sm font-bold text-white">
                        Newsletter Scorecard HTML
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                    >
                      {copiedHtml ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy HTML</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    readOnly
                    rows={8}
                    value={newsletterSportsHtml}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300/90 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Embeddable HTML code for official school division newsletter bulletins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPORTS WEEK CARDS PDF EXPORT */}
          {activeTab === 'sports' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Controls */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Sports Week Games in Little Card Format
                    </h3>
                    <p className="text-xs text-slate-400">
                      All event details, rules, house scores, and participating athletes formatted as cards
                    </p>
                  </div>
                </div>

                {/* Filter and Download Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSportsFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sportsFilter === 'all'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Events ({sportsEvents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSportsFilter('live')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sportsFilter === 'live'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Only ({sportsEvents.filter((e) => e.isActive).length})
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isExporting || filteredSportsEvents.length === 0}
                    onClick={handleDownloadSportsPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Status Message while generating export */}
              {isExporting && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>{exportMessage}</span>
                </div>
              )}

              {/* CONTAINER CAPTURED FOR PDF: Little Card Format */}
              <div
                ref={sportsCardsRef}
                id="sports-week-pdf-container"
                className="bg-[#0f172a] p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6"
              >
                {/* Header for PDF */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">
                        Crestview International School &bull; 2026 Sports Week
                      </span>
                      <h3 className="text-xl font-black text-white font-['Outfit']">
                        Official Games &amp; Events Fixtures
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">
                      Generated on {new Date().toLocaleDateString()}
                    </span>
                    <p className="text-[11px] text-amber-400 font-bold">
                      Points directly credit House Cup Standings
                    </p>
                  </div>
                </div>

                {/* Grid of Little Cards */}
                {filteredSportsEvents.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No sports events matching the selected filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSportsEvents.map((event) => {
                      const participantStudents = (event.participatingStudentIds || [])
                        .map((id) => students.find((s) => s.id === id))
                        .filter(Boolean) as Student[];

                      return (
                        <div
                          key={event.id}
                          className="bg-slate-900 rounded-2xl border border-slate-800 p-4.5 flex flex-col justify-between space-y-3.5 shadow-md relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    event.isActive
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {event.isActive ? '🔥 Live Event' : '📅 Scheduled'}
                                </span>

                                {event.venueCode && (
                                  <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-rose-400" />
                                    Venue {event.venueCode}
                                  </span>
                                )}

                                <span className="text-[10px] text-slate-400 font-medium">
                                  {event.date} {event.time ? `• ${event.time}` : ''}
                                </span>
                              </div>

                              <h4 className="text-base font-extrabold text-white font-['Outfit'] tracking-tight">
                                {event.title}
                              </h4>
                            </div>

                            {event.category && (
                              <span className="text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md shrink-0">
                                {event.category}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>

                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                              House Points Allocated:
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {houses.map((house) => {
                                const scoreObj = event.scores?.find((s) => s.houseId === house.id);
                                const pts = scoreObj ? scoreObj.points : 0;
                                return (
                                  <div
                                    key={house.id}
                                    className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-center"
                                  >
                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                      <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: house.color }}
                                      />
                                      <span className="text-[10px] font-bold text-slate-300 truncate">
                                        {house.name.split(' ')[0]}
                                      </span>
                                    </div>
                                    <span className="text-xs font-black text-white font-['Outfit']">
                                      {pts}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {participantStudents.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                Athletes ({participantStudents.length}):
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {participantStudents.slice(0, 6).map((student) => {
                                  const sHouse = houses.find((h) => h.id === student.houseId);
                                  return (
                                    <span
                                      key={student.id}
                                      className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1"
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: sHouse?.color }}
                                      />
                                      {student.name} ({student.grade})
                                    </span>
                                  );
                                })}
                                {participantStudents.length > 6 && (
                                  <span className="text-[10px] text-slate-500 font-bold">
                                    +{participantStudents.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Crestview International School House Points System</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
