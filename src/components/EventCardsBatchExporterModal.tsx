import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Filter,
  Grid,
  Scissors,
  QrCode,
  Shield,
  Layers,
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Check,
  Eye,
  FileSpreadsheet,
  Users,
  Search,
} from 'lucide-react';
import {
  House,
  Student,
  GradeLevel,
  ALL_GRADES,
  GRADE_LABELS,
  SportsActivityEvent,
} from '../types';
import {
  downloadCsv,
  generateEventCardsCsv,
  generateSvgQrCode,
  printHtmlContent,
  CsvRosterRow,
} from '../utils/exportGenerators';

export interface EventCardsBatchExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportsEvents: SportsActivityEvent[];
  houses: House[];
  students: Student[];
}

export type GridPreset = '8up' | '6up' | '4up' | '9up';

export interface CardElementToggles {
  studentName: boolean;
  houseBadge: boolean;
  qrCode: boolean;
  eventName: boolean;
  metaDetails: boolean; // role, grade, venue, pass ID
}

export const EventCardsBatchExporterModal: React.FC<EventCardsBatchExporterModalProps> = ({
  isOpen,
  onClose,
  sportsEvents,
  houses,
  students,
}) => {
  // Modal View Mode (Print Grid Preview vs CSV Preview)
  const [activeTab, setActiveTab] = useState<'grid' | 'csv'>('grid');

  // 1. Event Dropdown Selector
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  // 2. House Filter
  const [selectedHouseId, setSelectedHouseId] = useState<string>('all');

  // 3. Grade Filter
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // 4. Card Layout Grid Config
  const [gridPreset, setGridPreset] = useState<GridPreset>('8up');
  const [showCutLines, setShowCutLines] = useState<boolean>(true);

  // 5. Card Element Toggles
  const [cardElements, setCardElements] = useState<CardElementToggles>({
    studentName: true,
    houseBadge: true,
    qrCode: true,
    eventName: true,
    metaDetails: true,
  });

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Event Object
  const currentEvent = useMemo(() => {
    if (selectedEventId === 'all') return null;
    return sportsEvents.find((e) => e.id === selectedEventId) || null;
  }, [sportsEvents, selectedEventId]);

  // Generate Participant Card Records based on filters
  const participantCards = useMemo(() => {
    const list: Array<{
      cardId: string;
      studentId: string;
      studentName: string;
      grade: string;
      house: House;
      eventTitle: string;
      role: string;
      venue: string;
      time: string;
      qrSvg: string;
    }> = [];

    // Events to process
    const targetEvents = currentEvent ? [currentEvent] : sportsEvents;

    targetEvents.forEach((ev) => {
      // Check if event has rostered students with roles
      const roster = ev.participatingStudentsWithRoles || [];

      if (roster.length > 0) {
        roster.forEach((p, idx) => {
          // Resolve student object
          const studentObj = students.find(
            (s) => s.id === p.studentId || s.name.toLowerCase() === p.student_name.toLowerCase()
          );

          // Resolve house
          const houseObj =
            houses.find((h) => h.id === studentObj?.houseId) ||
            houses.find((h) => h.name.toLowerCase().includes(p.house.toLowerCase())) ||
            houses[idx % houses.length];

          const grade = studentObj?.grade || 'Grade 3';
          const cardId = `CP-${ev.id.slice(0, 4)}-${p.student_name.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`;

          list.push({
            cardId,
            studentId: studentObj?.id || `ST-${idx + 100}`,
            studentName: p.student_name,
            grade,
            house: houseObj,
            eventTitle: ev.title,
            role: p.role || 'Athlete / Participant',
            venue: ev.location || 'Main Athletics Oval',
            time: ev.time || '10:00 AM',
            qrSvg: generateSvgQrCode(
              JSON.stringify({ cardId, student: p.student_name, house: houseObj.name, event: ev.title }),
              88
            ),
          });
        });
      } else {
        // Fallback: Generate cards for students assigned to this house
        students.slice(0, 8).forEach((st, sIdx) => {
          const houseObj = houses.find((h) => h.id === st.houseId) || houses[sIdx % houses.length];
          const cardId = `CP-${ev.id.slice(0, 4)}-${st.name.slice(0, 3).toUpperCase()}-${String(sIdx + 1).padStart(3, '0')}`;

          list.push({
            cardId,
            studentId: st.id,
            studentName: st.name,
            grade: st.grade,
            house: houseObj,
            eventTitle: ev.title,
            role: st.isPrefect ? 'House Captain / Prefect' : 'Participant Athlete',
            venue: ev.location || 'Campus Athletics Field',
            time: ev.time || '10:00 AM',
            qrSvg: generateSvgQrCode(
              JSON.stringify({ cardId, student: st.name, house: houseObj.name, event: ev.title }),
              88
            ),
          });
        });
      }
    });

    // Apply House & Grade Filters
    return list.filter((item) => {
      if (selectedHouseId !== 'all' && item.house.id !== selectedHouseId) {
        return false;
      }
      if (selectedGrade !== 'all' && item.grade !== selectedGrade) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.eventTitle.toLowerCase().includes(q) ||
          item.cardId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentEvent, sportsEvents, students, houses, selectedHouseId, selectedGrade, searchQuery]);

  // Grid Configuration details
  const gridConfig = useMemo(() => {
    switch (gridPreset) {
      case '8up':
        return { cols: 2, rows: 4, perPage: 8, label: '8-up (2×4 Grid &bull; Standard Badge)' };
      case '6up':
        return { cols: 2, rows: 3, perPage: 6, label: '6-up (2×3 Grid &bull; Lanyard Size)' };
      case '4up':
        return { cols: 2, rows: 2, perPage: 4, label: '4-up (2×2 Grid &bull; Jumbo Pass)' };
      case '9up':
        return { cols: 3, rows: 3, perPage: 9, label: '9-up (3×3 Grid &bull; Pocket Mini-Card)' };
    }
  }, [gridPreset]);

  // Chunk cards into print pages
  const pagedCards = useMemo(() => {
    const pages: (typeof participantCards)[] = [];
    for (let i = 0; i < participantCards.length; i += gridConfig.perPage) {
      pages.push(participantCards.slice(i, i + gridConfig.perPage));
    }
    return pages;
  }, [participantCards, gridConfig]);

  // CSV Rows representation
  const csvRows: CsvRosterRow[] = useMemo(() => {
    return participantCards.map((c) => ({
      cardId: c.cardId,
      studentId: c.studentId,
      studentName: c.studentName,
      grade: c.grade,
      houseName: c.house.name,
      eventName: c.eventTitle,
      role: c.role,
      venue: c.venue,
      time: c.time,
    }));
  }, [participantCards]);

  // Trigger CSV Download
  const handleDownloadCsv = () => {
    const csvContent = generateEventCardsCsv(csvRows);
    const filename = `Crestview_Event_Cards_Roster_${selectedHouseId}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csvContent, filename);
  };

  // Trigger Print Batch Grid PDF
  const handlePrintBatchGrid = () => {
    const cardsHtml = pagedCards
      .map((page, pageIndex) => {
        const cardItems = page
          .map(
            (c) => `
          <div class="event-card ${showCutLines ? 'with-cut-lines' : ''}" style="border-left: 6px solid ${c.house.color};">
            <div class="card-header">
              <div class="house-badge" style="background-color: ${c.house.color}15; color: ${c.house.color}; border: 1px solid ${c.house.color}40;">
                <span class="house-dot" style="background-color: ${c.house.color};"></span>
                <strong>${c.house.name.replace('House of ', '')}</strong>
              </div>
              <span class="card-id">${c.cardId}</span>
            </div>

            <div class="card-body">
              ${
                cardElements.studentName
                  ? `<div class="student-name">${c.studentName}</div>`
                  : ''
              }
              ${
                cardElements.metaDetails
                  ? `<div class="student-meta">${c.grade} &bull; ${c.role}</div>`
                  : ''
              }
              ${
                cardElements.eventName
                  ? `<div class="event-banner">
                      <strong>🏆 ${c.eventTitle}</strong>
                      <div class="event-venue">📍 ${c.venue} &bull; ⏰ ${c.time}</div>
                    </div>`
                  : ''
              }
            </div>

            <div class="card-footer">
              ${
                cardElements.qrCode
                  ? `<div class="qr-wrapper">${c.qrSvg}</div>`
                  : ''
              }
              <div class="security-seal">
                <div>CRESTVIEW SPORTS DAY</div>
                <div style="font-size: 8px; color: #64748B;">OFFICIAL VERIFIED BADGE</div>
              </div>
            </div>
          </div>
        `
          )
          .join('');

        return `
        <div class="print-page">
          <div class="page-meta">
            <span>Crestview International School &bull; Event Cards Batch Sheet (Page ${pageIndex + 1} of ${pagedCards.length})</span>
            <span>${page.length} Badges &bull; Cut along dashed borders</span>
          </div>
          <div class="grid-sheet grid-${gridPreset}">
            ${cardItems}
          </div>
        </div>
      `;
      })
      .join('');

    const fullHtmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Event Cards - Printable Sheet</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-page {
              page-break-after: always;
              height: 100%;
              box-sizing: border-box;
              margin-bottom: 20mm;
            }
            .page-meta {
              font-size: 9px;
              color: #94a3b8;
              font-weight: 700;
              display: flex;
              justify-content: space-between;
              padding-bottom: 4px;
              margin-bottom: 6px;
              border-bottom: 1px solid #e2e8f0;
              text-transform: uppercase;
            }
            .grid-sheet {
              display: grid;
              gap: 8mm;
              height: calc(100% - 15px);
            }
            .grid-8up { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, 1fr); }
            .grid-6up { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); }
            .grid-4up { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
            .grid-9up { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }

            .event-card {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 10px 14px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
              box-sizing: border-box;
              position: relative;
              page-break-inside: avoid;
            }
            .event-card.with-cut-lines {
              outline: 1px dashed #94a3b8;
              outline-offset: 3mm;
            }
            .card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .house-badge {
              font-size: 10px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 999px;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              text-transform: uppercase;
            }
            .house-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              display: inline-block;
            }
            .card-id {
              font-size: 9px;
              font-family: monospace;
              color: #64748b;
              font-weight: 700;
            }
            .student-name {
              font-size: 16px;
              font-weight: 900;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .student-meta {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
            }
            .event-banner {
              margin-top: 6px;
              padding: 6px 8px;
              background: #f8fafc;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              font-size: 11px;
            }
            .event-venue {
              font-size: 9px;
              color: #64748b;
              margin-top: 2px;
            }
            .card-footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 8px;
              padding-top: 6px;
              border-top: 1px solid #f1f5f9;
            }
            .qr-wrapper svg {
              width: 48px;
              height: 48px;
              border-radius: 4px;
            }
            .security-seal {
              text-align: right;
              font-size: 9px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          ${cardsHtml}
        </body>
      </html>`;
    printHtmlContent(fullHtmlDoc);
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Grid className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  House Event Cards Batch Exporter
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Dual Mode: Print Grid &bull; CSV
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate 8-up/6-up/4-up cuttable badge sheets with QR codes or download official roster CSV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintBatchGrid}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer font-black"
              title="Print batch card grid sheet or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Grid Sheet (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Download CSV roster file"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Download CSV ({participantCards.length})</span>
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
          {/* LEFT PANEL: FILTERS & CARD CONFIG (4 Cols) */}
          <div className="lg:col-span-4 border-r border-slate-800 p-5 overflow-y-auto space-y-5 bg-[#0D1117]/60">
            {/* CONTROL 1: EVENT SELECTOR */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#161B22] border border-slate-800">
              <label htmlFor="event-filter-select" className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Event / Activity</span>
              </label>
              <select
                id="event-filter-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Scheduled Competitions ({sportsEvents.length} Events)</option>
                {sportsEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.category})
                  </option>
                ))}
              </select>
            </div>

            {/* CONTROL 2: HOUSE & GRADE FILTERS */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                <span>House &amp; Grade Filters</span>
              </span>

              {/* House Filter Dropdown */}
              <div className="space-y-1">
                <label htmlFor="house-filter-select" className="text-[11px] font-semibold text-slate-400 block">
                  House Affiliation:
                </label>
                <select
                  id="house-filter-select"
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  <option value="all">All Houses (Combined Roster)</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Filter Dropdown */}
              <div className="space-y-1">
                <label htmlFor="grade-filter-select" className="text-[11px] font-semibold text-slate-400 block">
                  Grade Level:
                </label>
                <select
                  id="grade-filter-select"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  <option value="all">All Grades (Schoolwide)</option>
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search text input */}
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter student or card ID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* CONTROL 3: CARD LAYOUT GRID CONFIG */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sheet Grid Configuration</span>
              </span>

              {/* Grid Presets */}
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: '8up', label: '8-up (2×4)', note: 'Standard A4 Sheet' },
                    { id: '6up', label: '6-up (2×3)', note: 'Lanyard Badge' },
                    { id: '4up', label: '4-up (2×2)', note: 'Jumbo Pass' },
                    { id: '9up', label: '9-up (3×3)', note: 'Pocket Card' },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGridPreset(g.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      gridPreset === g.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{g.label}</div>
                    <div className="text-[10px] text-slate-400">{g.note}</div>
                  </button>
                ))}
              </div>

              {/* Toggleable Cut Lines */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <div className="text-xs">
                    <strong className="text-slate-200 block">Dashed Cut Lines</strong>
                    <span className="text-[10px] text-slate-400">Guillotine / scissor trimmer guides</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-950 border-slate-700"
                />
              </label>
            </div>

            {/* CONTROL 4: CARD ELEMENT TOGGLES */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#161B22] border border-slate-800">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Card Elements To Display</span>
              </span>

              <div className="space-y-2">
                {[
                  { key: 'studentName', label: 'Student Full Name' },
                  { key: 'houseBadge', label: 'House Crest Badge & Colors' },
                  { key: 'qrCode', label: 'Verification SVG QR Code' },
                  { key: 'eventName', label: 'Event Name & Match Info' },
                  { key: 'metaDetails', label: 'Role, Grade & Pass ID' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-300">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={cardElements[item.key as keyof CardElementToggles]}
                      onChange={(e) =>
                        setCardElements((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4 bg-slate-950 border-slate-700"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE SHEET PREVIEW OR CSV TABLE (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[#0A0D12] overflow-hidden">
            {/* View Mode Tabs */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#161B22]/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('grid')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'grid'
                      ? 'bg-amber-400 text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Batch Sheet Preview ({pagedCards.length} Pages)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('csv')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'csv'
                      ? 'bg-amber-400 text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV Roster Table ({csvRows.length} Records)</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{participantCards.length} Total Cards</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-amber-400 font-bold">{gridConfig.label.replace('&bull;', '•')}</span>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/80">
              {activeTab === 'grid' ? (
                /* LIVE BATCH GRID SHEET PREVIEW */
                <div className="space-y-8 max-w-4xl mx-auto">
                  {pagedCards.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-[#161B22] border border-slate-800 space-y-3">
                      <Grid className="w-10 h-10 text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-white">No Matching Cards Found</h4>
                      <p className="text-xs text-slate-400">
                        Try clearing or relaxing your House or Grade level filters.
                      </p>
                    </div>
                  ) : (
                    pagedCards.map((page, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-300 space-y-4"
                      >
                        {/* Print Page Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                          <span>
                            Crestview International School &bull; Sports Day Cards (Sheet {pIdx + 1} of {pagedCards.length})
                          </span>
                          <span>
                            {page.length} Cards &bull; {gridConfig.label.replace('&bull;', '•')}
                          </span>
                        </div>

                        {/* Card Grid Sheet */}
                        <div
                          className={`grid gap-4 ${
                            gridPreset === '8up'
                              ? 'grid-cols-2'
                              : gridPreset === '6up'
                              ? 'grid-cols-2'
                              : gridPreset === '4up'
                              ? 'grid-cols-2'
                              : 'grid-cols-3'
                          }`}
                        >
                          {page.map((card) => (
                            <div
                              key={card.cardId}
                              className={`rounded-xl p-3.5 bg-white border border-slate-200 flex flex-col justify-between transition-all relative overflow-hidden shadow-xs ${
                                showCutLines ? 'border-dashed border-slate-400' : ''
                              }`}
                              style={{ borderLeftColor: card.house.color, borderLeftWidth: '5px' }}
                            >
                              {/* Scissor cut indicators if cutlines enabled */}
                              {showCutLines && (
                                <Scissors className="w-3 h-3 text-slate-400 absolute top-1 right-1 opacity-40 pointer-events-none" />
                              )}

                              {/* Card Header */}
                              <div className="flex items-center justify-between gap-1 mb-2">
                                {cardElements.houseBadge && (
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5"
                                    style={{
                                      backgroundColor: `${card.house.color}15`,
                                      color: card.house.textColor,
                                      border: `1px solid ${card.house.color}35`,
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: card.house.color }}
                                    />
                                    <span>{card.house.name.replace('House of ', '')}</span>
                                  </span>
                                )}
                                {cardElements.metaDetails && (
                                  <span className="text-[9px] font-mono font-bold text-slate-400">
                                    {card.cardId}
                                  </span>
                                )}
                              </div>

                              {/* Card Body */}
                              <div className="space-y-1 my-1">
                                {cardElements.studentName && (
                                  <div className="text-sm font-black text-slate-900 truncate">
                                    {card.studentName}
                                  </div>
                                )}
                                {cardElements.metaDetails && (
                                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                                    {card.grade} &bull; {card.role}
                                  </div>
                                )}
                                {cardElements.eventName && (
                                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 mt-1">
                                    <div className="font-bold truncate">🏆 {card.eventTitle}</div>
                                    <div className="text-[9px] text-slate-500 truncate mt-0.5">
                                      📍 {card.venue} &bull; ⏰ {card.time}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer with QR Code */}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                                {cardElements.qrCode && (
                                  <div
                                    className="w-9 h-9 rounded bg-white p-0.5 border border-slate-200 shrink-0"
                                    dangerouslySetInnerHTML={{ __html: card.qrSvg }}
                                  />
                                )}
                                <div className="text-right text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                  <div>Crestview Sports</div>
                                  <div className="text-slate-600">Official Pass</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* CSV ROSTER PREVIEW TABLE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-300">
                      <strong className="block text-white">CSV Roster Export View</strong>
                      <span>Ready for Microsoft Excel, Apple Numbers, or Google Sheets</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer font-black"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span>Download Roster CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0D1117]">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#161B22] text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Pass ID</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">House</th>
                          <th className="py-2.5 px-3">Grade</th>
                          <th className="py-2.5 px-3">Event</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Venue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                        {csvRows.slice(0, 50).map((row) => (
                          <tr key={row.cardId} className="hover:bg-slate-900/60">
                            <td className="py-2 px-3 text-amber-400 font-bold">{row.cardId}</td>
                            <td className="py-2 px-3 font-sans font-bold text-white">{row.studentName}</td>
                            <td className="py-2 px-3 font-sans">{row.houseName}</td>
                            <td className="py-2 px-3 font-sans">{row.grade}</td>
                            <td className="py-2 px-3 font-sans truncate max-w-[150px]">{row.eventName}</td>
                            <td className="py-2 px-3 font-sans text-slate-400">{row.role}</td>
                            <td className="py-2 px-3 font-sans text-slate-400 truncate max-w-[120px]">{row.venue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvRows.length > 50 && (
                    <div className="text-center text-xs text-slate-500">
                      Showing first 50 rows of {csvRows.length} total rows. Complete set will be downloaded in CSV file.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Quick Bar */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#161B22]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>
                  Filtering: <strong className="text-white">{selectedHouseId === 'all' ? 'All Houses' : 'Filtered House'}</strong>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span>
                  Sheets: <strong className="text-amber-400">{pagedCards.length} Pages</strong> ({participantCards.length} Badges)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintBatchGrid}
                  className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Launch Print Batch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
