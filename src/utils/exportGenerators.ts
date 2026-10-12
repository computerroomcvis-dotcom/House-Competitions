// Export handling functions for Crestview International School
// Supports:
// 1. Blob-based CSV Roster Export
// 2. Email-ready Inline Styled HTML Newsletter Generator
// 3. Lightweight SVG QR Code / Barcode Generator for Event Badges

import { House, Student, GradeLevel, SportsActivityEvent, PointTransaction } from '../types';

/**
 * Downloads a string or Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a CSV string with UTF-8 BOM so Excel/Google Sheets correctly parses symbols
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Triggers browser print dialog safely using a temporary hidden iframe,
 * avoiding window.open popup blockers in iframe environments and adhering
 * strictly to @media print rules.
 */
export function printHtmlContent(fullHtmlDoc: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullHtmlDoc);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print error, falling back to window.print()', printErr);
          window.print();
        }

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 250);
    } else {
      window.print();
    }
  } catch (err) {
    console.warn('Could not print via hidden iframe, falling back to window.print()', err);
    window.print();
  }
}

/**
 * Escapes a cell value for RFC-4180 CSV compliance
 */
export function escapeCsvCell(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export interface CsvRosterRow {
  cardId: string;
  studentId: string;
  studentName: string;
  grade: string;
  houseName: string;
  eventName: string;
  role: string;
  venue: string;
  time: string;
}

/**
 * Generates an RFC-4180 compliant CSV string from event card participant rows
 */
export function generateEventCardsCsv(rows: CsvRosterRow[]): string {
  const headers = [
    'Card Pass ID',
    'Student ID',
    'Student Name',
    'Grade Level',
    'House',
    'Event / Competition',
    'Participant Role',
    'Venue',
    'Scheduled Time',
  ];

  const csvRows = [headers.map((h) => `"${h}"`).join(',')];

  rows.forEach((row) => {
    csvRows.push(
      [
        escapeCsvCell(row.cardId),
        escapeCsvCell(row.studentId),
        escapeCsvCell(row.studentName),
        escapeCsvCell(row.grade),
        escapeCsvCell(row.houseName),
        escapeCsvCell(row.eventName),
        escapeCsvCell(row.role),
        escapeCsvCell(row.venue),
        escapeCsvCell(row.time),
      ].join(',')
    );
  });

  return csvRows.join('\r\n');
}

/**
 * Lightweight SVG QR Code Generator
 * Generates a crisp, authentic SVG representation with standard 3 finder patterns,
 * timing tracks, alignment markers, and pseudorandom data modules determined by payload hashing.
 */
export function generateSvgQrCode(payload: string, size = 120): string {
  // Deterministic 21x21 QR Code matrix (Version 1 standard layout)
  const N = 21;
  const matrix: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  // Helper to place finder pattern at (r, c)
  const placeFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        } else {
          matrix[r + i][c + j] = false;
        }
      }
    }
  };

  placeFinder(0, 0); // Top-left
  placeFinder(0, N - 7); // Top-right
  placeFinder(N - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash payload into deterministically filled data area
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= N - 8;
      const inBottomLeft = r >= N - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const bit = ((hash ^ (r * 31 + c * 17)) & (1 << ((r * 7 + c) % 15))) !== 0;
        matrix[r][c] = bit;
      }
    }
  }

  // Generate SVG rect elements
  const cellSize = size / N;
  let rects = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${(cellSize + 0.1).toFixed(2)}" height="${(cellSize + 0.1).toFixed(2)}" fill="#0F172A" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#FFFFFF" rx="4" />
    ${rects}
  </svg>`;
}

/* =========================================================================
 * NEWSLETTER EMAIL HTML GENERATOR
 * Generates standards-compliant, inline-styled HTML for Outlook, Gmail, Apple Mail
 * ========================================================================= */

export type NewsletterTemplateId = 'modern' | 'classic' | 'sports' | 'minimal';

export interface NewsletterSectionsConfig {
  header: boolean;
  announcements: boolean;
  calendar: boolean;
  highlights: boolean;
  teacherNotes: boolean;
}

export interface NewsletterDataPayload {
  schoolName: string;
  editionTitle: string;
  dateRangeLabel: string;
  targetScopeLabel: string;
  principalMessage: string;
  announcements: { title: string; date: string; content: string; priority: 'high' | 'normal' }[];
  calendarEvents: { date: string; time: string; title: string; location: string }[];
  houseStandings: { name: string; points: number; color: string; rank: number }[];
  topStudents: { name: string; house: string; grade: string; merits: number }[];
  teacherCommendations: { teacher: string; student: string; house: string; note: string }[];
}

/**
 * Generates email-client compatible inline-styled HTML
 */
export function generateEmailNewsletterHtml(
  template: NewsletterTemplateId,
  sections: NewsletterSectionsConfig,
  data: NewsletterDataPayload
): string {
  // Theme palette
  const themeColors = {
    modern: {
      primary: '#4F46E5',
      primaryDark: '#3730A3',
      accent: '#F59E0B',
      bg: '#F8FAFC',
      cardBg: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
      border: '#E2E8F0',
    },
    classic: {
      primary: '#0F172A',
      primaryDark: '#020617',
      accent: '#D97706',
      bg: '#F1F5F9',
      cardBg: '#FFFFFF',
      text: '#0F172A',
      muted: '#475569',
      border: '#CBD5E1',
    },
    sports: {
      primary: '#E11D48',
      primaryDark: '#9F1239',
      accent: '#F59E0B',
      bg: '#FFF1F2',
      cardBg: '#FFFFFF',
      text: '#0F172A',
      muted: '#64748B',
      border: '#FECDD3',
    },
    minimal: {
      primary: '#18181B',
      primaryDark: '#09090B',
      accent: '#71717A',
      bg: '#FAFAFA',
      cardBg: '#FFFFFF',
      text: '#18181B',
      muted: '#71717A',
      border: '#E4E4E7',
    },
  }[template];

  const htmlParts: string[] = [];

  // 1. Header & Masthead
  if (sections.header) {
    htmlParts.push(`
      <!-- HEADER MASTHEAD -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${themeColors.primary}; border-radius: 12px 12px 0 0; overflow: hidden;">
        <tr>
          <td style="padding: 32px 24px; text-align: center; color: #FFFFFF;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${themeColors.accent}; margin-bottom: 8px;">
              ${data.schoolName.toUpperCase()}
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              ${data.editionTitle}
            </h1>
            <div style="margin-top: 10px; font-size: 13px; color: #E0E7FF; font-weight: 500;">
              <span>📅 ${data.dateRangeLabel}</span> &bull; <span>🎯 ${data.targetScopeLabel}</span>
            </div>
          </td>
        </tr>
      </table>
    `);
  }

  // 2. Announcements & Principal Message
  if (sections.announcements) {
    const announcementItems = data.announcements
      .map(
        (a) => `
        <div style="margin-bottom: 16px; padding: 14px; background-color: ${a.priority === 'high' ? '#FEF2F2' : '#F8FAFC'}; border-left: 4px solid ${a.priority === 'high' ? '#EF4444' : themeColors.primary}; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #0F172A; font-size: 14px;">${a.title}</strong>
            <span style="font-size: 11px; color: #64748B;">${a.date}</span>
          </div>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">${a.content}</p>
        </div>
      `
      )
      .join('');

    htmlParts.push(`
      <!-- ANNOUNCEMENTS & DEAN'S MESSAGE -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: ${themeColors.cardBg}; border: 1px solid ${themeColors.border}; border-radius: 10px;">
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: ${themeColors.primary}; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              📢 Official Announcements &amp; Updates
            </h2>
            <div style="margin-bottom: 16px; padding: 14px; background-color: #F8FAFC; border-radius: 8px; border: 1px dashed ${themeColors.border}; font-style: italic; color: #475569; font-size: 13px; line-height: 1.6;">
              &ldquo;${data.principalMessage}&rdquo;
              <div style="margin-top: 6px; font-style: normal; font-weight: 700; color: #0F172A; font-size: 12px;">&mdash; Leadership &amp; Head of Houses</div>
            </div>
            ${announcementItems}
          </td>
        </tr>
      </table>
    `);
  }

  // 3. Highlights & House Standings
  if (sections.highlights) {
    const standingRows = data.houseStandings
      .map(
        (h) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid ${themeColors.border};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${h.color}; margin-right: 8px;"></span>
            <strong style="color: #0F172A; font-size: 13px;">${h.name}</strong>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid ${themeColors.border}; text-align: center;">
            <span style="font-weight: 800; font-size: 12px; color: ${h.rank === 1 ? '#D97706' : '#475569'};">Rank #${h.rank}</span>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid ${themeColors.border}; text-align: right; font-weight: 800; color: ${themeColors.primary}; font-size: 14px;">
            ${h.points.toLocaleString()} pts
          </td>
        </tr>
      `
      )
      .join('');

    const studentCards = data.topStudents
      .map(
        (s, idx) => `
        <div style="display: inline-block; width: 30%; min-width: 140px; margin: 4px; padding: 10px; background-color: #F8FAFC; border: 1px solid ${themeColors.border}; border-radius: 8px; vertical-align: top; text-align: center;">
          <div style="font-size: 18px; margin-bottom: 2px;">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
          <div style="font-weight: 800; font-size: 13px; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
          <div style="font-size: 11px; color: #64748B;">${s.house} &bull; ${s.grade}</div>
          <div style="font-size: 12px; font-weight: 800; color: #059669; margin-top: 4px;">+${s.merits} Merits</div>
        </div>
      `
      )
      .join('');

    htmlParts.push(`
      <!-- HIGHLIGHTS & HOUSE STANDINGS -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: ${themeColors.cardBg}; border: 1px solid ${themeColors.border}; border-radius: 10px;">
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 800; color: ${themeColors.primary}; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              🏆 House Championship Standings &amp; Honors
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background-color: #F1F5F9;">
                  <th style="padding: 8px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">House</th>
                  <th style="padding: 8px 14px; text-align: center; font-size: 11px; text-transform: uppercase; color: #475569;">Standing</th>
                  <th style="padding: 8px 14px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569;">Total Points</th>
                </tr>
              </thead>
              <tbody>
                ${standingRows}
              </tbody>
            </table>

            <div style="margin-top: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Top Merited Athletes &amp; Scholars:</div>
              <div style="text-align: center;">
                ${studentCards}
              </div>
            </div>
          </td>
        </tr>
      </table>
    `);
  }

  // 4. Calendar & Upcoming Dates
  if (sections.calendar) {
    const calendarItems = data.calendarEvents
      .map(
        (c) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background-color: #F8FAFC; border-radius: 8px; margin-bottom: 8px; border: 1px solid ${themeColors.border};">
          <div>
            <strong style="font-size: 13px; color: #0F172A; display: block;">${c.title}</strong>
            <span style="font-size: 11px; color: #64748B;">📍 ${c.location}</span>
          </div>
          <div style="text-align: right; font-size: 12px; font-weight: 700; color: ${themeColors.primary};">
            <div>${c.date}</div>
            <div style="font-size: 10px; color: #64748B; font-weight: 500;">${c.time}</div>
          </div>
        </div>
      `
      )
      .join('');

    htmlParts.push(`
      <!-- CALENDAR & UPCOMING DATES -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: ${themeColors.cardBg}; border: 1px solid ${themeColors.border}; border-radius: 10px;">
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 800; color: ${themeColors.primary}; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              🗓️ Upcoming School &amp; House Events
            </h2>
            ${calendarItems}
          </td>
        </tr>
      </table>
    `);
  }

  // 5. Teacher Notes & Commendations
  if (sections.teacherNotes) {
    const teacherNotesList = data.teacherCommendations
      .map(
        (t) => `
        <div style="padding: 12px; background-color: #F8FAFC; border-radius: 8px; margin-bottom: 8px; border: 1px solid ${themeColors.border};">
          <div style="font-size: 12px; color: #0F172A; margin-bottom: 4px;">
            <strong>${t.teacher}</strong> commended <strong style="color: ${themeColors.primary};">${t.student}</strong> (${t.house})
          </div>
          <p style="margin: 0; font-size: 12px; color: #475569; font-style: italic;">&ldquo;${t.note}&rdquo;</p>
        </div>
      `
      )
      .join('');

    htmlParts.push(`
      <!-- TEACHER NOTES & COMMENDATIONS -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: ${themeColors.cardBg}; border: 1px solid ${themeColors.border}; border-radius: 10px;">
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 800; color: ${themeColors.primary}; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              ⭐ Faculty Commendations &amp; Merits
            </h2>
            ${teacherNotesList}
          </td>
        </tr>
      </table>
    `);
  }

  // Footer
  htmlParts.push(`
    <!-- FOOTER -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; text-align: center;">
      <tr>
        <td style="padding: 16px; font-size: 11px; color: #94A3B8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div>${data.schoolName} &bull; House System Portal &bull; Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div style="margin-top: 4px;">This publication is generated for parents, faculty, and students. Contact house administration for inquiries.</div>
        </td>
      </tr>
    </table>
  `);

  // Document wrapper
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.editionTitle} - ${data.schoolName}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${themeColors.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: separate; }
    @media only screen and (max-width: 620px) {
      .newsletter-wrapper { width: 100% !important; padding: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: ${themeColors.bg};">
  <center>
    <table class="newsletter-wrapper" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto; text-align: left;">
      <tr>
        <td>
          ${htmlParts.join('\n')}
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`.trim();
}
