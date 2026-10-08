// 5-Format Games & Events Export Engine for Crestview International School
// Strictly dedicated to exporting Sports Cards, Schedules, Rosters, and Match Podiums
// Supports PDF, DOC, PNG, HTML, and JSON with complete oklch/modern CSS color support

import jsPDF from 'jspdf';
import { renderElementToCanvas, sanitizeClonedDoc, downloadBlob } from './exportNewsletter';
import { SportsActivityEvent, House, Student } from '../types';

export type GamesExportFormat = 'pdf' | 'doc' | 'png' | 'html' | 'json';

export interface GamesExportProgressState {
  isExporting: boolean;
  format?: GamesExportFormat;
  message?: string;
}

type GamesProgressListener = (state: GamesExportProgressState) => void;
const gamesProgressListeners: Set<GamesProgressListener> = new Set();

export const subscribeToGamesExportProgress = (listener: GamesProgressListener) => {
  gamesProgressListeners.add(listener);
  return () => {
    gamesProgressListeners.delete(listener);
  };
};

const notifyGamesExportProgress = (state: GamesExportProgressState) => {
  gamesProgressListeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('Error in games export progress listener:', e);
    }
  });
};

export interface ExportGamesEventsOptions {
  filename?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  jsonData?: Record<string, unknown>;
  sportsEvents?: SportsActivityEvent[];
  houses?: House[];
  students?: Student[];
}

/**
 * Main 5-format Games & Events Exporter
 * Targets DOM element with id="games-events-preview"
 */
export const exportGamesEvents = async (
  format: GamesExportFormat,
  options?: ExportGamesEventsOptions
): Promise<void> => {
  const filenameBase = options?.filename || 'Crestview_Games_and_Events';

  options?.onStart?.();

  try {
    const targetElement = document.getElementById('games-events-preview');
    if (!targetElement && format !== 'json') {
      throw new Error(
        'Games preview DOM element (#games-events-preview) was not found. Please ensure the games preview is mounted.'
      );
    }

    if (format === 'pdf') {
      notifyGamesExportProgress({
        isExporting: true,
        format: 'pdf',
        message: 'Rendering print-ready Games & Podiums PDF...',
      });

      let pdfGenerated = false;

      // 1. Try html2pdf with sanitizeClonedDoc hook
      const html2pdfLib = (window as any).html2pdf;
      if (typeof html2pdfLib === 'function' && targetElement) {
        try {
          const opt = {
            margin: [8, 8, 8, 8],
            filename: `${filenameBase}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: '#0d1117',
              logging: false,
              onclone: (clonedDoc: Document) => sanitizeClonedDoc(clonedDoc),
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          };
          await html2pdfLib().set(opt).from(targetElement).save();
          pdfGenerated = true;
        } catch (pdfErr) {
          console.warn('html2pdf bundled render hit an error, executing fallback:', pdfErr);
        }
      }

      // 2. Fallback: html2canvas-pro + jsPDF
      if (!pdfGenerated && targetElement) {
        const canvas = await renderElementToCanvas(targetElement, 2, '#0d1117');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
          heightLeft -= pageHeight - margin * 2;
        }

        pdf.save(`${filenameBase}.pdf`);
      }
    } else if (format === 'png') {
      notifyGamesExportProgress({
        isExporting: true,
        format: 'png',
        message: 'Capturing high-resolution Sports Cards & Podiums Graphic at 2x DPI...',
      });

      if (!targetElement) throw new Error('Missing #games-events-preview element.');
      const canvas = await renderElementToCanvas(targetElement, 2, '#0d1117');

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            downloadBlob(blob, `${filenameBase}.png`);
            resolve();
          } else {
            reject(new Error('Failed to create PNG blob from canvas.'));
          }
        }, 'image/png');
      });
    } else if (format === 'doc') {
      notifyGamesExportProgress({
        isExporting: true,
        format: 'doc',
        message: 'Packaging Games & Events MS Word Document (.doc)...',
      });

      const contentHtml = targetElement ? targetElement.innerHTML : '';
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Crestview International School - Games &amp; Events</title>
          <style>
            body {
              font-family: 'Segoe UI', Calibri, Arial, sans-serif;
              background-color: #0d1117;
              color: #f0f6fc;
              padding: 24px;
              margin: 0;
            }
          </style>
        </head>
        <body style="background-color: #0d1117; color: #f0f6fc; font-family: 'Segoe UI', Calibri, Arial, sans-serif; padding: 20px;">
          ${contentHtml}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
      downloadBlob(blob, `${filenameBase}.doc`);
    } else if (format === 'html') {
      notifyGamesExportProgress({
        isExporting: true,
        format: 'html',
        message: 'Generating standalone Games & Events Web Page (.html)...',
      });

      const contentHtml = targetElement ? targetElement.innerHTML : '';
      const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crestview International School - Games &amp; Events Report</title>
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
  ${contentHtml}
</body>
</html>`;

      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${filenameBase}.html`);
    } else if (format === 'json') {
      notifyGamesExportProgress({
        isExporting: true,
        format: 'json',
        message: 'Exporting raw structured Games & Events JSON payload...',
      });

      let dataToExport = options?.jsonData;
      if (!dataToExport && targetElement) {
        const rawJsonAttr = targetElement.getAttribute('data-games-json');
        if (rawJsonAttr) {
          try {
            dataToExport = JSON.parse(rawJsonAttr);
          } catch {
            // ignore
          }
        }
      }

      const blob = new Blob([JSON.stringify(dataToExport || {}, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      downloadBlob(blob, `${filenameBase}.json`);
    }

    notifyGamesExportProgress({ isExporting: false });
    options?.onEnd?.();
  } catch (error: any) {
    notifyGamesExportProgress({ isExporting: false });
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Games export failed for format [${format}]:`, err);
    if (options?.onError) {
      options.onError(err);
    } else {
      alert(`Games Export error (${format.toUpperCase()}): ${err.message}`);
    }
  }
};
