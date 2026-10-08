import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  House,
  Student,
  SportsActivityEvent,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
} from '../types';
import { StudentPointSummary } from '../utils/storage';
import {
  X,
  Download,
  Copy,
  Check,
  Trophy,
  Crown,
  FileText,
  FileCode,
  Sparkles,
  Award,
  CalendarCheck,
  Loader2,
  Globe,
  Database,
  Printer,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { toPng, toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';
import { renderElementToCanvas, withExportContainerStyling } from '../utils/exportNewsletter';

export type ExportModalTab = 'newsletter' | 'students';
export type ExportActionFormat = 'pdf' | 'doc' | 'png' | 'html' | 'json';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  houses: House[];
  studentSummaries: Record<string, StudentPointSummary>;
  sportsEvents?: SportsActivityEvent[];
  initialTab?: ExportModalTab;
  initialDivision?: 'TP-GK' | 'G1-G5';
  initialClass?: GradeLevel;
  initialAction?: ExportActionFormat;
}

const TP_GK_GRADES: GradeLevel[] = ['TP', 'PK-3', 'PK-4', 'GK-Emerald'];
const G1_G5_GRADES: GradeLevel[] = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  students,
  houses,
  studentSummaries,
  initialTab = 'newsletter',
  initialDivision = 'TP-GK',
  initialClass = 'Grade 1',
  initialAction,
}) => {
  const [activeTab, setActiveTab] = useState<ExportModalTab>(initialTab);

  // Filter mode for students
  const [filterMode, setFilterMode] = useState<'division' | 'class'>('division');
  const [selectedDivision, setSelectedDivision] = useState<'TP-GK' | 'G1-G5'>(initialDivision);
  const [selectedClass, setSelectedClass] = useState<GradeLevel>(initialClass);

  // Copy feedback states
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Loading spinner & progress overlay state
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [lastExportedFormat, setLastExportedFormat] = useState<string | null>(null);

  // DOM refs for capture
  const newsletterContainerRef = useRef<HTMLDivElement>(null);
  const graphicRef = useRef<HTMLDivElement>(null);

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

  // 5. OFFICIAL PARENT NEWSLETTER DATA TEMPLATE (JSON)
  // Clean Monthly Star Achievers & Academic House Standings (Sports week cards removed)
  const officialNewsletterJson = useMemo(() => {
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

    const divisionLabel =
      filterMode === 'class'
        ? `${GRADE_LABELS[selectedClass]} Class`
        : selectedDivision === 'TP-GK'
        ? 'Early Years (TP - GK)'
        : 'Primary Division (G1 - G5)';

    return {
      school_info: {
        school_name: 'Crestview International School',
        edition: 'Official Parent Newsletter & House Cup Bulletin',
        bulletin_date: `${monthYear} Bulletin`,
        published_on: todayFormatted,
        scope: divisionLabel,
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
      faculty_commendation: {
        title: 'Monthly Parent Newsletter • Faculty Commendation',
        message:
          'Dear Crestview Parents & Families, we are delighted to honor our top House achievers and dedicated scholars! Our house system nurtures curiosity, integrity, and mutual respect. Thank you parents for your continued partnership at home in encouraging our young learners.',
        department: 'Office of Student Affairs & House Masters • Crestview International School',
      },
    };
  }, [filterMode, selectedClass, selectedDivision, topStudentsByHouse, topStudentsByGrade, overallTopStudent]);

  // 6. OFFICIAL EMBEDDABLE HTML TEMPLATE (Preserves #0D1117 / #161B22 dark styling)
  const officialNewsletterHtml = useMemo(() => {
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

    // Generate Star Achievers HTML
    let starAchieversHtml = '';
    topStudentsByHouse.forEach(({ house, student, totalPoints, merits }) => {
      starAchieversHtml += `
        <div style="background-color: #161b22; border: 1px solid #30363d; border-top: 4px solid ${house.color}; border-radius: 10px; padding: 14px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #f0f6fc;">${house.name}</span>
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${house.color}; display: inline-block;"></span>
          </div>
          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #ffffff;">${student ? student.name : 'Standings updating'}</h4>
          <p style="margin: 3px 0 8px 0; font-size: 11px; color: #8b949e;">${student ? student.grade : ''} • ${house.mascot}</p>
          <div style="border-top: 1px solid #21262d; padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #f59e0b; font-weight: 800;">${totalPoints} Net pts</span>
            <span style="color: #10b981; font-weight: 800;">+${merits} merits</span>
          </div>
        </div>
      `;
    });

    // Grade Level Achievers HTML
    let gradeLevelAchieversHtml = '';
    if (topStudentsByGrade.length > 0) {
      const items = topStudentsByGrade
        .map(
          ({ gradeLabel, student, house, summary }) => `
        <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 10px; font-weight: bold; color: #f59e0b; text-transform: uppercase;">${gradeLabel}</span>
            <h5 style="margin: 2px 0 0 0; font-size: 12px; font-weight: bold; color: #ffffff;">${student?.name || 'TBD'}</h5>
            <span style="font-size: 10px; color: #8b949e;">${house?.name || ''}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 12px; font-weight: 800; color: #f59e0b; font-family: monospace;">${summary?.netPoints ?? 0} pts</span>
          </div>
        </div>
      `
        )
        .join('');

      gradeLevelAchieversHtml = `
        <div style="margin-top: 18px;">
          <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">
            🌟 Grade-Level Top Scholars
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
            ${items}
          </div>
        </div>
      `;
    }

    return `<!-- CRESTVIEW INTERNATIONAL SCHOOL - OFFICIAL NEWSLETTER -->
<div style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #f0f6fc; max-width: 900px; margin: 0 auto; border-radius: 16px; border: 1px solid #30363d;">
  <!-- HEADER BANNER -->
  <div style="border-bottom: 2px solid #30363d; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span style="font-size: 11px; font-weight: 900; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Crestview International School</span>
      <h1 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.025em;">Parent Newsletter: House Cup Star Achievers</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #8b949e;">Monthly Star Achievers &bull; Academic Diligence &bull; Character &bull; Merits</p>
    </div>
    <div style="text-align: right;">
      <span style="display: inline-block; background: #f59e0b20; border: 1px solid #f59e0b50; color: #fbbf24; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">${monthYear} Edition</span>
      <span style="display: block; font-size: 10px; color: #6e7681; margin-top: 4px;">${todayFormatted}</span>
    </div>
  </div>

  <!-- SECTION: MONTHLY STAR ACHIEVERS -->
  <div style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
      <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #f59e0b; display: flex; align-items: center; gap: 6px;">
        🌟 Monthly House Cup Star Achievers
      </h2>
      <span style="font-size: 11px; color: #8b949e;">Academic diligence &amp; house spirit</span>
    </div>

    <!-- Overall Star Scholar Highlight -->
    ${
      overallTopStudent?.student
        ? `<div style="background-color: #161b22; border: 1px solid #f59e0b50; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 10px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">👑 Overall Star Scholar of the Month</span>
              <h3 style="margin: 2px 0 0 0; font-size: 16px; font-weight: 900; color: #ffffff;">${overallTopStudent.student.name} (${overallTopStudent.student.grade} • ${overallTopStudent.house?.name})</h3>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 15px; font-weight: 900; color: #f59e0b;">${overallTopStudent.summary?.netPoints ?? 0} pts</span>
              <span style="display: block; font-size: 11px; color: #10b981; font-weight: bold;">+${overallTopStudent.summary?.merits ?? 0} Merits</span>
            </div>
          </div>`
        : ''
    }

    <!-- 4 Houses Grid -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      ${starAchieversHtml}
    </div>

    ${gradeLevelAchieversHtml}
  </div>

  <!-- FACULTY COMMENDATION MESSAGE -->
  <div style="background-color: #161b22; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
    <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #fde68a;">Dear Crestview Parents &amp; Families,</h4>
    <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.6;">
      We celebrate our outstanding students for their academic effort, character, and teamwork across our house system! We thank all parents for your wonderful encouragement and partnership at home in inspiring our young learners.
    </p>
  </div>

  <!-- FOOTER -->
  <div style="border-top: 1px solid #21262d; padding-top: 14px; display: flex; justify-content: space-between; font-size: 10px; color: #6e7681;">
    <span>Office of Student Affairs &amp; House Masters &bull; Crestview International School</span>
    <span style="font-weight: bold; color: #f59e0b;">Character • Scholarship • Community</span>
  </div>
</div>`;
  }, [topStudentsByHouse, topStudentsByGrade, overallTopStudent]);

  // 7. Generate Plain Text Newsletter Announcement for Copying
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

    let text = `📰 CRESTVIEW INTERNATIONAL SCHOOL • OFFICIAL PARENT NEWSLETTER\n`;
    text += `HOUSE CUP & MONTHLY STAR ACHIEVERS BULLETIN — ${monthYear.toUpperCase()}\n`;
    text += `Date: ${today}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Star Achievers
    text += `🌟 MONTHLY STAR ACHIEVERS HIGHLIGHTS:\n`;
    if (overallTopStudent?.student) {
      text += `👑 Overall Star Scholar: ${overallTopStudent.student.name} (${overallTopStudent.student.grade} • ${overallTopStudent.house?.name}) — ${overallTopStudent.summary?.netPoints ?? 0} pts (+${overallTopStudent.summary?.merits ?? 0} merits)\n\n`;
    }
    topStudentsByHouse.forEach(({ house, student, totalPoints, merits }) => {
      text += `   • ${house.name} (${house.mascot}): ${student ? student.name : 'Standings updating'} (${student ? student.grade : ''}) — ${totalPoints} Net pts (+${merits} merits)\n`;
    });

    if (topStudentsByGrade.length > 0) {
      text += `\n🏅 GRADE-LEVEL TOP SCHOLARS:\n`;
      topStudentsByGrade.forEach(({ gradeLabel, student, house, summary }) => {
        text += `   • ${gradeLabel}: ${student?.name || 'TBD'} (${house?.name || ''}) — ${summary?.netPoints ?? 0} pts\n`;
      });
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Warm regards,\n`;
    text += `Faculty & House Masters • Crestview International School\n`;
    text += `"Character • Scholarship • Community"`;

    return text;
  }, [topStudentsByHouse, topStudentsByGrade, overallTopStudent]);

  // Copy helpers
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

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(officialNewsletterJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(officialNewsletterHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    } catch {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    }
  };

  // Robust DOM capture helper (Scale: 2x, background #0D1117)
  const captureElementToCanvas = async (
    element: HTMLElement,
    scale: number = 2,
    backgroundColor: string = '#0d1117'
  ): Promise<HTMLCanvasElement> => {
    return await renderElementToCanvas(element, scale, backgroundColor);
  };

  const captureElementToDataUrl = async (
    element: HTMLElement,
    scale: number = 2,
    backgroundColor: string = '#0d1117'
  ): Promise<string> => {
    const canvas = await renderElementToCanvas(element, scale, backgroundColor);
    return canvas.toDataURL('image/png');
  };

  // 1. EXPORT AS PDF (.pdf) -> Crestview_Newsletter.pdf
  const handleExportPDF = async () => {
    if (!newsletterContainerRef.current) return;
    setIsExporting(true);
    setExportMessage('Rendering high-res document into print-ready PDF...');
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Crestview_Newsletter_${timestamp}.pdf`;
      const opt = {
        margin: [10, 10, 10, 10], // 10mm margins on all sides
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800,
          backgroundColor: '#0d1117',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await withExportContainerStyling(newsletterContainerRef.current, async (styledElement) => {
        let pdfDone = false;
        const html2pdfLib = (window as any).html2pdf;

        if (typeof html2pdfLib === 'function') {
          try {
            await html2pdfLib().set(opt).from(styledElement).save();
            pdfDone = true;
          } catch (elementErr) {
            console.warn('html2pdf direct element capture had an issue, trying pre-rendered canvas:', elementErr);
            try {
              const canvas = await captureElementToCanvas(styledElement, 2, '#0d1117');
              await html2pdfLib().set(opt).from(canvas).save();
              pdfDone = true;
            } catch (canvasErr) {
              console.warn('html2pdf from(canvas) had an issue, using direct jsPDF engine:', canvasErr);
            }
          }
        }

        if (!pdfDone) {
          const canvas = await captureElementToCanvas(styledElement, 2, '#0d1117');
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10;
          const imgWidth = pageWidth - margin * 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = margin;

          pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - margin * 2);

          while (heightLeft > 0) {
            position = heightLeft - imgHeight + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - margin * 2);
          }

          pdf.save(filename);
        }
      });

      setLastExportedFormat('PDF');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to export PDF:', err);
      alert(`Could not export PDF document: ${errorMsg}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  // 2. EXPORT AS WORD DOC (.doc) -> Crestview_Newsletter.doc
  const handleExportDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Crestview International School - Newsletter</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Segoe UI', Calibri, Arial, sans-serif;
            background-color: #0d1117;
            color: #f0f6fc;
            padding: 24px;
            margin: 0;
          }
          h1, h2, h3, h4 {
            font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          }
        </style>
      </head>
      <body style="background-color: #0d1117; color: #f0f6fc; font-family: 'Segoe UI', Calibri, Arial, sans-serif; padding: 20px;">
        ${officialNewsletterHtml}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Crestview_Newsletter.doc';
    link.click();
    URL.revokeObjectURL(url);
    setLastExportedFormat('Word Doc');
  };

  // 3. EXPORT AS PNG IMAGE (.png) -> Crestview_Newsletter.png
  const handleExportPNG = async () => {
    if (!newsletterContainerRef.current) return;
    setIsExporting(true);
    setExportMessage('Rendering high-res document at 2x DPI...');
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Crestview_Newsletter_${timestamp}.png`;
      await withExportContainerStyling(newsletterContainerRef.current, async (styledElement) => {
        const dataUrl = await captureElementToDataUrl(styledElement, 2, '#0d1117');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      });
      setLastExportedFormat('PNG Image');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to export PNG:', err);
      alert(`Could not export PNG image: ${errorMsg}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  // 4. EXPORT AS WEB PAGE (.html) -> Crestview_Newsletter.html
  const handleExportHTML = () => {
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crestview International School - Parent Newsletter</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background-color: #0d1117;
      color: #f0f6fc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
    }
  </style>
</head>
<body style="background-color: #0d1117; color: #f0f6fc; margin: 0; padding: 24px;">
  ${officialNewsletterHtml}
</body>
</html>`;
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Crestview_Newsletter.html';
    link.click();
    URL.revokeObjectURL(url);
    setLastExportedFormat('HTML Web Page');
  };

  // 5. EXPORT AS RAW DATA (.json) -> Crestview_Newsletter.json
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(officialNewsletterJson, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Crestview_Newsletter.json';
    link.click();
    URL.revokeObjectURL(url);
    setLastExportedFormat('Raw JSON Data');
  };

  // Trigger initial format action if specified
  useEffect(() => {
    if (isOpen && initialAction) {
      const timer = setTimeout(() => {
        if (initialAction === 'pdf') handleExportPDF();
        else if (initialAction === 'doc') handleExportDoc();
        else if (initialAction === 'png') handleExportPNG();
        else if (initialAction === 'html') handleExportHTML();
        else if (initialAction === 'json') handleExportJSON();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      {/* LOADING SPINNER & PROGRESS OVERLAY */}
      {isExporting && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white font-['Outfit']">Rendering Export</h4>
              <p className="text-xs text-slate-300 mt-1 font-medium">{exportMessage || 'Rendering high-res document...'}</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Preserving dark-mode styling (#0D1117 / #161B22) &amp; house accent colors
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#0D1117] border border-slate-800 rounded-3xl w-full max-w-6xl my-6 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-5 sm:px-8 py-4 border-b border-slate-800 flex items-center justify-between bg-[#161B22] shrink-0">
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                  Crestview Export Center
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400/20 to-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  5 Supported Formats: PDF • DOC • PNG • HTML • JSON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Parent Newsletter &amp; Monthly Star Achievers Report &bull; Academic Diligence &bull; Character &bull; Merits
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

        {/* UNIFIED 5-FORMAT MULTI-EXPORT ACTION BAR */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Select File Format to Download:</span>
            </span>
            {lastExportedFormat && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded {lastExportedFormat}!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. PDF */}
            <button
              type="button"
              id="export-action-pdf"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="btn-hover-scale flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/60 transition-all cursor-pointer group text-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all flex items-center justify-center mb-1.5">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white">Export as PDF</span>
              <span className="text-[10px] text-slate-400 font-mono">.pdf (Print-ready)</span>
            </button>

            {/* 2. Word Doc */}
            <button
              type="button"
              id="export-action-doc"
              onClick={handleExportDoc}
              disabled={isExporting}
              className="btn-hover-scale flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 transition-all cursor-pointer group text-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all flex items-center justify-center mb-1.5">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white">Export as Word Doc</span>
              <span className="text-[10px] text-slate-400 font-mono">.doc (MS Word)</span>
            </button>

            {/* 3. PNG Image */}
            <button
              type="button"
              id="export-action-png"
              onClick={handleExportPNG}
              disabled={isExporting}
              className="btn-hover-scale flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 hover:bg-amber-950/40 border border-slate-700/80 hover:border-amber-500/60 transition-all cursor-pointer group text-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all flex items-center justify-center mb-1.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white">Export as PNG Image</span>
              <span className="text-[10px] text-slate-400 font-mono">.png (2x High DPI)</span>
            </button>

            {/* 4. HTML Web Page */}
            <button
              type="button"
              id="export-action-html"
              onClick={handleExportHTML}
              disabled={isExporting}
              className="btn-hover-scale flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 transition-all cursor-pointer group text-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all flex items-center justify-center mb-1.5">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white">Export as Web Page</span>
              <span className="text-[10px] text-slate-400 font-mono">.html (Standalone)</span>
            </button>

            {/* 5. Raw JSON Data */}
            <button
              type="button"
              id="export-action-json"
              onClick={handleExportJSON}
              disabled={isExporting}
              className="btn-hover-scale flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-700/80 hover:border-indigo-500/60 transition-all cursor-pointer group text-center shadow-xs col-span-2 sm:col-span-1"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all flex items-center justify-center mb-1.5">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white">Export as Raw Data</span>
              <span className="text-[10px] text-slate-400 font-mono">.json (Structured Tree)</span>
            </button>
          </div>
        </div>

        {/* Modal Secondary Navigation: Combined Newsletter Preview vs Quick Copy Snippets */}
        <div className="px-5 sm:px-8 pt-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('newsletter')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
                activeTab === 'newsletter'
                  ? 'border-amber-400 text-amber-300 bg-[#0D1117]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Full Newsletter Preview &amp; Download</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-300 bg-[#0D1117]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span>Monthly Star Achievers Graphic</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Data Sync</span>
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: COMBINED FULL NEWSLETTER (Direct Target for PDF, DOC, PNG, HTML, JSON) */}
          {activeTab === 'newsletter' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Quick Copy Snippets Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Raw JSON Data Block */}
                <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black uppercase text-white">JSON Data Tree</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3 h-3 text-slate-950" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-950" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={4}
                    value={JSON.stringify(officialNewsletterJson, null, 2)}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-amber-300/90 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Includes star achievers &amp; merit totals</span>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Download .json &rarr;
                    </button>
                  </div>
                </div>

                {/* 2. Embedded HTML Code */}
                <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black uppercase text-white">Standalone HTML Code</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    >
                      {copiedHtml ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-white" />
                          <span>Copy HTML</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={4}
                    value={officialNewsletterHtml}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-emerald-300/90 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Fully inline CSS dark mode styling</span>
                    <button
                      type="button"
                      onClick={handleExportHTML}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Download .html &rarr;
                    </button>
                  </div>
                </div>

                {/* 3. Plaintext Announcement */}
                <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-black uppercase text-white">Announcement Text</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-white" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={4}
                    value={generatedTextAnnouncement}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Formatted for WhatsApp &amp; Parent SMS</span>
                    <button
                      type="button"
                      onClick={handleExportDoc}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Download .doc &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* RENDERED DARK-MODE NEWSLETTER CANVAS (Captured for PDF and PNG) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white font-['Outfit']">
                      Print &amp; Digital Document Preview (Dark Mode Palette #0D1117 / #161B22)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Print-Ready Canvas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print PDF</span>
                    </button>
                    <span className="text-slate-600">&bull;</span>
                    <button
                      type="button"
                      onClick={handleExportPNG}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG 2x</span>
                    </button>
                  </div>
                </div>

                {/* THE CAPTURE TARGET ELEMENT */}
                <div
                  ref={newsletterContainerRef}
                  id="crestview-newsletter-container"
                  className="bg-[#0D1117] text-[#F0F6FC] rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
                  style={{
                    backgroundColor: '#0D1117',
                    color: '#F0F6FC',
                  }}
                >
                  {/* Visual Watermark & Corner Highlights */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* 1. School Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
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
                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block font-['Outfit']">
                          Crestview International School
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                          Parent Newsletter: House Cup Star Achievers
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Honoring Monthly Star Achievers across all Houses and Grade Divisions
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Bulletin
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-1 font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* 2. SECTION: MONTHLY STAR ACHIEVERS SPOTLIGHT */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h3 className="text-base font-black text-white font-['Outfit']">
                          Monthly House Cup Star Achievers
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Academic Diligence &bull; Character &bull; Merits
                      </span>
                    </div>

                    {/* Overall Star Scholar Spotlight Banner */}
                    {overallTopStudent?.student && (
                      <div className="bg-[#161B22] border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                            <Crown className="w-5 h-5 text-slate-950" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                              👑 Overall Monthly Star Scholar
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                              {overallTopStudent.student.name}
                            </h4>
                            <span className="text-xs text-slate-300">
                              {overallTopStudent.student.grade} &bull; {overallTopStudent.house?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right self-end sm:self-auto">
                          <div>
                            <span className="text-sm sm:text-base font-black text-amber-400 block font-mono">
                              {overallTopStudent.summary?.netPoints ?? 0} pts
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
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
                          className="bg-[#161B22] border border-slate-800 rounded-xl p-3.5 space-y-2 relative overflow-hidden"
                          style={{ borderTopColor: house.color, borderTopWidth: '4px' }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{house.name}</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: house.color }}
                            />
                          </div>

                          <div>
                            <h5 className="text-sm font-extrabold text-white font-['Outfit']">
                              {student ? student.name : 'Standings updating'}
                            </h5>
                            <span className="text-[10px] text-slate-400 block">
                              {student ? student.grade : ''} &bull; {house.mascot}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-amber-400">{totalPoints} pts</span>
                            <span className="font-bold text-emerald-400">+{merits} merits</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grade-Level Honor Roll */}
                    {topStudentsByGrade.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Grade-Level Star Scholars:</span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                          {topStudentsByGrade.map(({ grade, gradeLabel, student, house, summary }) => (
                            <div
                              key={grade}
                              className="bg-[#161B22] border border-slate-800 rounded-xl p-2.5 space-y-1 relative overflow-hidden"
                              style={{ borderLeftColor: house?.color || '#F59E0B', borderLeftWidth: '3.5px' }}
                            >
                              <span className="text-[9px] font-bold text-amber-400 uppercase block">
                                {gradeLabel}
                              </span>
                              <h6 className="text-xs font-black text-white truncate">
                                {student?.name || 'TBD'}
                              </h6>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                                <span className="truncate">{house?.name.replace('House of ', '') || ''}</span>
                                <span className="font-bold text-amber-400 font-mono">
                                  {summary?.netPoints ?? 0} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Faculty Commendations Note & Official Pillars Footer */}
                  <div className="bg-[#161B22] rounded-2xl border border-amber-400/30 p-5 space-y-3 shadow-md">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-['Outfit']">
                        Faculty &amp; House Masters Commendation
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Dear Crestview Parents &amp; Families, we celebrate our outstanding students for their academic effort, character, and teamwork across our house community! We thank all parents for your wonderful encouragement and partnership at home in inspiring our young scholars.
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
                      <span>Office of Student Affairs &amp; House Masters &bull; Crestview International School</span>
                      <span className="font-bold text-amber-400">Character &bull; Scholarship &bull; Community</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY HOUSE CUP ACADEMIC REPORT (Dedicated Graphic View) */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Report Scope:
                    </span>
                    <div className="inline-flex p-1 bg-[#0D1117] border border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFilterMode('division')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterMode === 'division'
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Division Level
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('class')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterMode === 'class'
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Individual Class
                      </button>
                    </div>
                  </div>

                  {filterMode === 'division' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDivision('TP-GK')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedDivision === 'TP-GK'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-[#0D1117] border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Early Years (TP – GK)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDivision('G1-G5')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedDivision === 'G1-G5'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-[#0D1117] border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Primary (G1 – G5)
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value as GradeLevel)}
                        aria-label="Select Class Level"
                        className="bg-[#0D1117] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
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

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportPNG}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer font-black"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Graphic container for Top Students */}
              <div
                ref={graphicRef}
                id="newsletter-graphic-container"
                className="bg-[#0D1117] p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <Trophy className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        Crestview International School
                      </span>
                      <h3 className="text-xl font-black text-white font-['Outfit']">
                        Monthly House Cup Star Achievers
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-bold bg-[#161B22] border border-slate-800 px-3 py-1 rounded-lg">
                    {filterMode === 'class'
                      ? GRADE_LABELS[selectedClass]
                      : selectedDivision === 'TP-GK'
                      ? 'Early Years (TP - GK)'
                      : 'Primary (G1 - G5)'}
                  </span>
                </div>

                {/* Top student by house cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topStudentsByHouse.map(({ house, student, totalPoints, merits }) => (
                    <div
                      key={house.id}
                      className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 space-y-3"
                      style={{ borderTopColor: house.color, borderTopWidth: '4px' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{house.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: house.color }}
                        />
                      </div>

                      {student ? (
                        <div>
                          <h4 className="text-base font-extrabold text-white font-['Outfit']">
                            {student.name}
                          </h4>
                          <span className="text-xs text-slate-400">{student.grade}</span>
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-400">{totalPoints} pts</span>
                            <span className="text-emerald-400 font-bold">+{merits} merits</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No points recorded yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-800 bg-[#161B22] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Crestview Multi-Format Export Engine &bull; PDF, DOC, PNG, HTML, JSON</span>
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
