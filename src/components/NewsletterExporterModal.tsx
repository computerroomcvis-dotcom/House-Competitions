import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Calendar,
  FileText,
  Layers,
  Sparkles,
  Layout,
  Mail,
  Eye,
  Code,
  Download,
  Sliders,
  ChevronDown,
  Trophy,
  Award,
  Bell,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  House,
  Student,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  SportsActivityEvent,
  PointTransaction,
} from '../types';
import {
  generateEmailNewsletterHtml,
  printHtmlContent,
  NewsletterTemplateId,
  NewsletterSectionsConfig,
  NewsletterDataPayload,
} from '../utils/exportGenerators';

export interface NewsletterExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
  students: Student[];
  sportsEvents?: SportsActivityEvent[];
  transactions?: PointTransaction[];
}

export type ScopeMode = 'grade' | 'division';
export type DivisionOption = 'all' | 'early_years' | 'elementary';

export const NewsletterExporterModal: React.FC<NewsletterExporterModalProps> = ({
  isOpen,
  onClose,
  houses,
  students,
  sportsEvents = [],
  transactions = [],
}) => {
  // Modal Navigation & Output Mode
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'settings'>('preview');
  const [copiedHtml, setCopiedHtml] = useState(false);

  // 1. Scope Controls
  const [scopeMode, setScopeMode] = useState<ScopeMode>('division');
  const [selectedDivision, setSelectedDivision] = useState<DivisionOption>('all');
  const [selectedGrades, setSelectedGrades] = useState<GradeLevel[]>([...ALL_GRADES]);

  // 2. Date Range Controls
  const [datePreset, setDatePreset] = useState<'this_week' | 'this_month' | 'term' | 'sports_week'>('this_week');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // 3. Template Picker
  const [template, setTemplate] = useState<NewsletterTemplateId>('modern');

  // 4. Content Section Checkboxes
  const [sections, setSections] = useState<NewsletterSectionsConfig>({
    header: true,
    announcements: true,
    calendar: true,
    highlights: true,
    teacherNotes: true,
  });

  // Custom Editorial Title & Message
  const [editionTitle, setEditionTitle] = useState('Weekly House Championship Gazette');
  const [principalMessage, setPrincipalMessage] = useState(
    'Congratulations to all student scholars and athletes this week. Your dedication to academic perseverance, teamwork, and house spirit continues to inspire our school community.'
  );

  // Handle Preset Changes
  const handlePresetChange = (preset: 'this_week' | 'this_month' | 'term' | 'sports_week') => {
    setDatePreset(preset);
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    let start = end;

    if (preset === 'this_week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      start = d.toISOString().slice(0, 10);
    } else if (preset === 'this_month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = d.toISOString().slice(0, 10);
    } else if (preset === 'term') {
      const d = new Date(now.getFullYear(), 0, 15);
      start = d.toISOString().slice(0, 10);
    } else if (preset === 'sports_week') {
      start = '2026-02-23';
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Grade Multi-Select Toggles
  const toggleGrade = (grade: GradeLevel) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSelectAllGrades = () => setSelectedGrades([...ALL_GRADES]);
  const handleClearAllGrades = () => setSelectedGrades([]);

  // Filtered Students Based on Scope
  const filteredStudents = useMemo(() => {
    if (scopeMode === 'grade') {
      return students.filter((s) => selectedGrades.includes(s.grade));
    }
    if (selectedDivision === 'early_years') {
      return students.filter((s) => ['TP', 'PK-3', 'PK-4', 'GK-Emerald'].includes(s.grade));
    }
    if (selectedDivision === 'elementary') {
      return students.filter((s) => ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].includes(s.grade));
    }
    return students;
  }, [students, scopeMode, selectedDivision, selectedGrades]);

  // Compute House Standings from Transactions / Students
  const houseStandings = useMemo(() => {
    const studentIdSet = new Set(filteredStudents.map((s) => s.id));
    const scores: Record<string, number> = {};
    houses.forEach((h) => {
      scores[h.id] = 0;
    });

    transactions.forEach((tx) => {
      if (studentIdSet.has(tx.studentId)) {
        const delta = tx.type === 'merit' ? tx.amount : -tx.amount;
        scores[tx.houseId] = (scores[tx.houseId] || 0) + delta;
      }
    });

    // Provide baseline points if transactions are fresh
    const list = houses.map((h) => {
      const calculatedPoints = scores[h.id] || 0;
      // Default fallback mock points if empty
      const baseline = calculatedPoints > 0 ? calculatedPoints : (
        h.id === 'house-mountainhearts' ? 820 :
        h.id === 'house-stormchasers' ? 790 :
        h.id === 'house-windstriders' ? 745 : 710
      );
      return {
        id: h.id,
        name: h.name,
        color: h.color,
        points: baseline,
        rank: 1,
      };
    });

    list.sort((a, b) => b.points - a.points);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [houses, filteredStudents, transactions]);

  // Compute Top Students in Scope
  const topStudentsList = useMemo(() => {
    const meritMap: Record<string, number> = {};
    const filteredStudentIds = new Set(filteredStudents.map((s) => s.id));

    transactions.forEach((tx) => {
      if (tx.type === 'merit' && filteredStudentIds.has(tx.studentId)) {
        meritMap[tx.studentId] = (meritMap[tx.studentId] || 0) + tx.amount;
      }
    });

    const studentList = filteredStudents.map((s) => {
      const merits = meritMap[s.id] || (s.isPrefect ? 45 : 25 + (s.name.charCodeAt(0) % 20));
      const house = houses.find((h) => h.id === s.houseId);
      return {
        name: s.name,
        house: house?.name.replace('House of ', '') || 'House',
        grade: s.grade,
        merits,
      };
    });

    studentList.sort((a, b) => b.merits - a.merits);
    return studentList.slice(0, 6);
  }, [filteredStudents, transactions, houses]);

  // Target Scope Label
  const targetScopeLabel = useMemo(() => {
    if (scopeMode === 'grade') {
      if (selectedGrades.length === ALL_GRADES.length) return 'All School Grades (TP – Grade 5)';
      if (selectedGrades.length === 0) return 'No Grades Selected';
      if (selectedGrades.length <= 3) return selectedGrades.join(', ');
      return `${selectedGrades.length} Grades Selected`;
    }
    if (selectedDivision === 'early_years') return 'Early Years Division (TP to GK)';
    if (selectedDivision === 'elementary') return 'Elementary Division (Grades 1 to 5)';
    return 'Whole School Division (All Grades)';
  }, [scopeMode, selectedDivision, selectedGrades]);

  // Full Newsletter Data Payload
  const newsletterData: NewsletterDataPayload = useMemo(() => {
    return {
      schoolName: 'Crestview International School',
      editionTitle,
      dateRangeLabel: `${startDate} to ${endDate}`,
      targetScopeLabel,
      principalMessage,
      announcements: [
        {
          title: 'Sports Day Championship Finals Announced',
          date: 'Feb 26, 2026',
          content: 'The official sports day matches will conclude this Friday with the Grand House Relay and tug-of-war championship at Main Oval.',
          priority: 'high',
        },
        {
          title: 'Term 2 Prefect Leadership Assemblies',
          date: 'March 2, 2026',
          content: 'House prefects and captains will lead morning assemblies focusing on house virtues: Wisdom, Perseverance, Loyalty, and Respect.',
          priority: 'normal',
        },
      ],
      calendarEvents: (sportsEvents.length > 0 ? sportsEvents.slice(0, 4) : [
        { title: 'Tug of War Championship', date: 'Feb 25, 2026', time: '10:00 AM', location: 'Oval 1' },
        { title: 'Junior Obstacle Relay', date: 'Feb 26, 2026', time: '1:30 PM', location: 'Playfield' },
        { title: 'House Quiz Bowl', date: 'March 3, 2026', time: '9:00 AM', location: 'Auditorium' },
        { title: 'Swimming Gala Finals', date: 'March 6, 2026', time: '11:00 AM', location: 'Aquatics Center' },
      ]).map((ev: any) => ({
        title: ev.title,
        date: ev.date || 'Upcoming',
        time: ev.time || '10:00 AM',
        location: ev.location || 'Campus Grounds',
      })),
      houseStandings,
      topStudents: topStudentsList,
      teacherCommendations: [
        {
          teacher: 'Ms. Henderson',
          student: topStudentsList[0]?.name || 'Liam Chen',
          house: 'Mountainhearts',
          note: 'Outstanding demonstration of sportsmanship and mentoring younger peers during dodgeball practice.',
        },
        {
          teacher: 'Mr. Sterling',
          student: topStudentsList[1]?.name || 'Sophia Vance',
          house: 'Stormchasers',
          note: 'Consistently exhibiting academic curiosity and helping classmates organize science lab apparatus.',
        },
      ],
    };
  }, [
    editionTitle,
    startDate,
    endDate,
    targetScopeLabel,
    principalMessage,
    sportsEvents,
    houseStandings,
    topStudentsList,
  ]);

  // Generated Email HTML
  const emailHtml = useMemo(() => {
    return generateEmailNewsletterHtml(template, sections, newsletterData);
  }, [template, sections, newsletterData]);

  // Trigger Native Print with Custom Print Container
  const handlePrint = () => {
    const fullHtmlDoc = `<!DOCTYPE html>
<html>
  <head>
    <title>${editionTitle} - Printable Newsletter</title>
    <meta charset="utf-8" />
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
      .print-container { width: 100%; max-width: 800px; margin: 0 auto; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="print-container">
      ${emailHtml}
    </div>
  </body>
</html>`;
    printHtmlContent(fullHtmlDoc);
  };

  // Copy HTML to Clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch (err) {
      console.error('Failed to copy HTML: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0D1117] border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-800 bg-[#161B22]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  Grade &amp; Division Newsletter Exporter
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Dual Mode: Print &bull; HTML
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compose, filter by grade/division, and export print-ready PDFs or email-compatible HTML snippets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Print document or save as high-res PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyHtml}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                copiedHtml
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copy email-ready inline-styled HTML code"
            >
              {copiedHtml ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHtml ? 'Copied HTML!' : 'Copy Email HTML'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Controls & Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* LEFT PANEL: UI CONTROLS (4 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 p-5 overflow-y-auto space-y-6 bg-[#0D1117]/60">
            {/* CONTROL 1: SCOPE SELECTOR */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#161B22] border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Newsletter Scope</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredStudents.length} Students in Scope
                </span>
              </div>

              {/* Scope Mode Switch */}
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setScopeMode('division')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    scopeMode === 'division'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Division Level
                </button>
                <button
                  type="button"
                  onClick={() => setScopeMode('grade')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    scopeMode === 'grade'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Grade Multi-Select
                </button>
              </div>

              {/* Division Dropdown */}
              {scopeMode === 'division' ? (
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="division-select" className="text-[11px] font-semibold text-slate-400 block">
                    Select School Division:
                  </label>
                  <select
                    id="division-select"
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value as DivisionOption)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">Whole School (All Grades &bull; TP to Grade 5)</option>
                    <option value="early_years">Early Years Division (TP, PK-3, PK-4, GK-Emerald)</option>
                    <option value="elementary">Elementary Division (Grade 1, 2, 3, 4, 5)</option>
                  </select>
                </div>
              ) : (
                /* Grade Level Multi-Select */
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Select Included Grades:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllGrades}
                        className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        type="button"
                        onClick={handleClearAllGrades}
                        className="text-slate-400 hover:text-rose-400 font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {ALL_GRADES.map((grade) => {
                      const isSelected = selectedGrades.includes(grade);
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => toggleGrade(grade)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-center border transition-all cursor-pointer truncate ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-200'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title={GRADE_LABELS[grade]}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CONTROL 2: DATE RANGE SELECTOR */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Date Range &amp; Presets</span>
              </span>

              {/* Preset Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'this_week', label: 'This Week' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'term', label: 'Term 2' },
                    { id: 'sports_week', label: 'Sports Week' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetChange(p.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      datePreset === p.id
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <label htmlFor="start-date-input" className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Start Date
                  </label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset('this_week');
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label htmlFor="end-date-input" className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    End Date
                  </label>
                  <input
                    id="end-date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset('this_week');
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* CONTROL 3: TEMPLATE PICKER */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-rose-400" />
                <span>Document Template</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      id: 'modern',
                      title: 'Modern Editorial',
                      desc: 'Indigo & gradient badges',
                      border: 'hover:border-indigo-500',
                      badge: 'bg-indigo-500',
                    },
                    {
                      id: 'classic',
                      title: 'Classic Academic',
                      desc: 'Formal school masthead',
                      border: 'hover:border-slate-500',
                      badge: 'bg-slate-700',
                    },
                    {
                      id: 'sports',
                      title: 'Sports & Spirit',
                      desc: 'Rose flame & podiums',
                      border: 'hover:border-rose-500',
                      badge: 'bg-rose-500',
                    },
                    {
                      id: 'minimal',
                      title: 'Minimalist Clean',
                      desc: 'High contrast clean grid',
                      border: 'hover:border-zinc-500',
                      badge: 'bg-zinc-800',
                    },
                  ] as const
                ).map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                      template === tpl.id
                        ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 ' + tpl.border
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${tpl.badge}`} />
                      <strong className="text-xs font-bold text-white truncate">{tpl.title}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CONTROL 4: CONTENT SECTIONS CHECKBOXES */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Content Section Inclusions</span>
              </span>

              <div className="space-y-2">
                {[
                  { key: 'header', label: 'Header & School Masthead', desc: 'Coat of arms, date, and scope pill' },
                  { key: 'announcements', label: 'Announcements & Dean’s Message', desc: 'Principal message & alerts' },
                  { key: 'calendar', label: 'Calendar & Upcoming Dates', desc: 'Sports week schedule & locations' },
                  { key: 'highlights', label: 'Highlights & House Standings', desc: 'Rankings table & top scholars' },
                  { key: 'teacherNotes', label: 'Teacher Notes & Commendations', desc: 'Faculty praise & positive merits' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sections[item.key as keyof NewsletterSectionsConfig]}
                      onChange={(e) =>
                        setSections((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950 border-slate-700"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-200 block">{item.label}</strong>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Custom Masthead Title */}
            <div className="space-y-1.5">
              <label htmlFor="newsletter-title-input" className="text-[10px] uppercase font-bold text-slate-400 block">
                Custom Edition Title:
              </label>
              <input
                id="newsletter-title-input"
                type="text"
                value={editionTitle}
                onChange={(e) => setEditionTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* RIGHT PANEL: LIVE PREVIEW & HTML SNIPPET TABS (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#0A0D12] overflow-hidden">
            {/* View Mode Sub-tabs */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#161B22]/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Document View (Print Ready)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'html'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML Email Snippet</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Standard A4 Width</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-emerald-400 font-bold">@media print Ready</span>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950/80">
              {activeTab === 'preview' ? (
                /* LIVE DOCUMENT PRINT-READY PREVIEW */
                <div
                  id="newsletter-printable-document"
                  className="w-full max-w-[650px] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transition-all p-0"
                  style={{
                    fontFamily:
                      template === 'classic'
                        ? 'Georgia, serif'
                        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {/* Embedded Iframe Preview with actual inline-styled HTML */}
                  <iframe
                    title="Newsletter Preview"
                    srcDoc={emailHtml}
                    className="w-full h-[720px] border-none bg-slate-50"
                  />
                </div>
              ) : (
                /* RAW HTML SNIPPET WITH COPY BAR */
                <div className="w-full max-w-2xl space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-300">
                      <strong className="block text-white">Email Client HTML Snippet</strong>
                      <span>Ready to paste into Gmail, Outlook, Apple Mail, or Mailchimp campaigns</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
                    >
                      {copiedHtml ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedHtml ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed max-h-[600px] overflow-x-auto overflow-y-auto select-all shadow-inner">
                      {emailHtml}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Bar */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#161B22]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Scope: <strong className="text-white">{targetScopeLabel}</strong></span>
                <span className="text-slate-600">&bull;</span>
                <span>Template: <strong className="text-indigo-400 capitalize">{template}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Launch Print Dialog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
