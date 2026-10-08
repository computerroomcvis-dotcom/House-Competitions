// 5-Format Newsletter Export Engine for Crestview International School
// Supports PDF, DOC, PNG, HTML, and JSON with complete oklch/modern CSS color support

import html2canvasPro from 'html2canvas-pro';
import jsPDF from 'jspdf';

export type ExportFormat = 'pdf' | 'doc' | 'png' | 'html' | 'json';

export interface ExportProgressState {
  isExporting: boolean;
  format?: ExportFormat;
  message?: string;
}

type ProgressListener = (state: ExportProgressState) => void;
const progressListeners: Set<ProgressListener> = new Set();

export const subscribeToExportProgress = (listener: ProgressListener) => {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
};

const notifyExportProgress = (state: ExportProgressState) => {
  progressListeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('Error in export progress listener:', e);
    }
  });
};

/**
 * Patches global window.html2pdf and window.html2canvas to utilize html2canvas-pro.
 * This fixes the classic "Attempting to parse an unsupported color function 'oklch'" error
 * caused by html2pdf's bundled legacy html2canvas encountering Tailwind CSS modern color spaces.
 */
export const patchHtml2pdfAndCanvas = (): void => {
  if (typeof window === 'undefined') return;
  const win = window as any;

  // 1. Ensure window.html2canvas points to html2canvas-pro (with native oklch support)
  win.html2canvas = html2canvasPro;

  // 2. Patch html2pdf's internal Worker prototype so its toCanvas step uses html2canvas-pro
  if (win.html2pdf && win.html2pdf.Worker && !win.html2pdf.__oklchPatched) {
    win.html2pdf.__oklchPatched = true;

    // Patch Worker toCanvas step
    win.html2pdf.Worker.prototype.toCanvas = function () {
      if (this.prop.canvas) {
        return this;
      }
      const self = this;
      const tasks = [
        function () {
          return document.body.contains(self.prop.container) || self.toContainer();
        },
      ];

      return self.thenList(tasks).then(async function () {
        const opt = Object.assign({}, self.opt.html2canvas);
        delete opt.onrendered;

        const userOnClone = opt.onclone;
        const canvas = await html2canvasPro(self.prop.container, {
          ...opt,
          scale: opt.scale || 2,
          useCORS: opt.useCORS ?? true,
          scrollX: opt.scrollX ?? 0,
          scrollY: opt.scrollY ?? 0,
          windowWidth: opt.windowWidth || 800,
          backgroundColor: opt.backgroundColor || '#0d1117',
          logging: false,
          onclone: (clonedDoc: Document) => {
            sanitizeClonedDoc(clonedDoc);
            if (typeof userOnClone === 'function') {
              try {
                userOnClone(clonedDoc);
              } catch (e) {
                console.warn('Custom onclone handler error:', e);
              }
            }
          },
        });
        return canvas;
      }).then(function (canvas: HTMLCanvasElement) {
        self.prop.canvas = canvas;
        self.prop.canvas.style.display = 'none';
        document.body.appendChild(self.prop.canvas);
        return canvas;
      });
    };
  }
};

// Immediately patch if window is already available
if (typeof window !== 'undefined') {
  patchHtml2pdfAndCanvas();
  window.addEventListener('DOMContentLoaded', patchHtml2pdfAndCanvas);
  window.addEventListener('load', patchHtml2pdfAndCanvas);
}

/**
 * Helper to convert any oklch color string to rgb/rgba using an offscreen canvas context.
 */
export const sanitizeOklchString = (str: string, doc: Document = document): string => {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) return str;
  try {
    const canvas = doc.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return str;

    return str.replace(/oklch\([^)]+\)/gi, (match) => {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = match;
        return ctx.fillStyle; // Browser converts oklch to rgb(), rgba(), or hex
      } catch {
        return '#f59e0b';
      }
    });
  } catch {
    return str.replace(/oklch\([^)]+\)/gi, '#f59e0b');
  }
};

/**
 * Sanitizes all elements and style tags in a cloned document to replace unsupported oklch functions with rgb/hex.
 */
export const sanitizeClonedDoc = (clonedDoc: Document): void => {
  try {
    const win = clonedDoc.defaultView || window;

    // 1. Sanitize all <style> tags
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
        styleTag.textContent = sanitizeOklchString(styleTag.textContent, clonedDoc);
      }
    });

    // 2. Sanitize inline styles & computed styles on elements
    const colorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'boxShadow',
      'textShadow',
    ];

    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((el) => {
      if (!(el instanceof (clonedDoc.defaultView?.HTMLElement || HTMLElement))) return;
      try {
        const computed = win.getComputedStyle(el);
        colorProps.forEach((prop) => {
          const val = (computed as any)[prop];
          if (val && typeof val === 'string' && val.includes('oklch')) {
            (el.style as any)[prop] = sanitizeOklchString(val, clonedDoc);
          }
        });
      } catch {
        // continue
      }

      const styleAttr = el.getAttribute('style');
      if (styleAttr && styleAttr.includes('oklch')) {
        el.setAttribute('style', sanitizeOklchString(styleAttr, clonedDoc));
      }
    });
  } catch (err) {
    console.warn('Error sanitizing cloned document colors:', err);
  }
};

/**
 * Triggers automatic browser file download for a given Blob and filename.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 250);
};

// Global registration so window.downloadBlob is available
if (typeof window !== 'undefined') {
  (window as any).downloadBlob = downloadBlob;
}

export interface ExportNewsletterOptions {
  filename?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  jsonData?: Record<string, unknown>;
}

/**
 * Temporary Export Container Sizing (A4 Standard: 794px @ 96 DPI)
 * Temporarily applies exact export dimensions and styling to #newsletter-preview
 * to prevent horizontal clipping, ensure crisp A4 scaling, and avoid text margin issues.
 */
export const withExportContainerStyling = async <T>(
  element: HTMLElement,
  callback: (el: HTMLElement) => Promise<T>
): Promise<T> => {
  // Store original element styles
  const prevWidth = element.style.width;
  const prevMaxWidth = element.style.maxWidth;
  const prevMinWidth = element.style.minWidth;
  const prevPadding = element.style.padding;
  const prevBoxSizing = element.style.boxSizing;
  const prevOverflow = element.style.overflow;
  const prevWordBreak = element.style.wordBreak;

  // Track modified child elements to restore their inline styles
  const modifiedChildren: { el: HTMLElement; prevBoxSizing: string; prevWordBreak: string; prevOverflow: string }[] = [];

  try {
    // 1. Temporary export dimensions and styles on container element
    element.classList.add('newsletter-export-active');
    element.style.width = '794px';
    element.style.maxWidth = '794px';
    element.style.minWidth = '794px';
    element.style.padding = '24px';
    element.style.boxSizing = 'border-box';
    element.style.overflow = 'visible';
    element.style.wordBreak = 'break-word';

    // 2. Apply word-break: break-word, overflow: visible, and box-sizing: border-box across children
    const childNodes = element.querySelectorAll<HTMLElement>('*');
    childNodes.forEach((child) => {
      modifiedChildren.push({
        el: child,
        prevBoxSizing: child.style.boxSizing,
        prevWordBreak: child.style.wordBreak,
        prevOverflow: child.style.overflow,
      });
      child.style.boxSizing = 'border-box';
      child.style.wordBreak = 'break-word';
      if (child.style.overflow === 'hidden') {
        child.style.overflow = 'visible';
      }
    });

    // Small delay to allow layout recalculation
    await new Promise((resolve) => setTimeout(resolve, 60));

    return await callback(element);
  } finally {
    // Restore child inline styles
    modifiedChildren.forEach(({ el, prevBoxSizing, prevWordBreak, prevOverflow }) => {
      el.style.boxSizing = prevBoxSizing;
      el.style.wordBreak = prevWordBreak;
      el.style.overflow = prevOverflow;
    });

    // Restore container element styles
    element.classList.remove('newsletter-export-active');
    element.style.width = prevWidth;
    element.style.maxWidth = prevMaxWidth;
    element.style.minWidth = prevMinWidth;
    element.style.padding = prevPadding;
    element.style.boxSizing = prevBoxSizing;
    element.style.overflow = prevOverflow;
    element.style.wordBreak = prevWordBreak;
  }
};

/**
 * Robust canvas renderer that supports modern CSS and oklch colors.
 * Uses html2canvas-pro with high DPI (scale: 2).
 */
export const renderElementToCanvas = async (
  element: HTMLElement,
  scale: number = 2,
  backgroundColor: string = '#0d1117'
): Promise<HTMLCanvasElement> => {
  patchHtml2pdfAndCanvas();
  try {
    return await html2canvasPro(element, {
      scale,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
      backgroundColor,
      logging: false,
      onclone: (clonedDoc) => sanitizeClonedDoc(clonedDoc),
    });
  } catch (proErr) {
    console.warn('html2canvas-pro direct render had an issue, falling back:', proErr);
    const winHtml2canvas = (window as any).html2canvas;
    if (typeof winHtml2canvas === 'function' && winHtml2canvas !== html2canvasPro) {
      return await winHtml2canvas(element, {
        scale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        backgroundColor,
        logging: false,
        onclone: (clonedDoc: Document) => sanitizeClonedDoc(clonedDoc),
      });
    }
    throw proErr;
  }
};

/**
 * Main 5-format newsletter exporter
 * Targets DOM element with id="newsletter-preview"
 */
export const exportNewsletter = async (
  format: ExportFormat,
  options?: ExportNewsletterOptions
): Promise<void> => {
  const filenameBase = options?.filename || 'Crestview_Newsletter';

  options?.onStart?.();
  patchHtml2pdfAndCanvas();

  try {
    const targetElement = document.getElementById('newsletter-preview');
    if (!targetElement && format !== 'json') {
      throw new Error(
        'Newsletter preview DOM element (#newsletter-preview) was not found. Please ensure the newsletter preview is mounted.'
      );
    }

    if (format === 'pdf') {
      notifyExportProgress({
        isExporting: true,
        format: 'pdf',
        message: 'Rendering print-ready vector/image PDF via html2pdf...',
      });

      if (!targetElement) throw new Error('Missing #newsletter-preview element.');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = options?.filename ? `${options.filename}.pdf` : `Crestview_Newsletter_${timestamp}.pdf`;

      // HTML2PDF.JS Configuration Override per specifications
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

      await withExportContainerStyling(targetElement, async (styledElement) => {
        let pdfGenerated = false;
        const html2pdfLib = (window as any).html2pdf;

        // 1. Try html2pdf with the element first (our patched Worker toCanvas executes html2canvas-pro & oklch sanitizer)
        if (typeof html2pdfLib === 'function') {
          try {
            await html2pdfLib().set(opt).from(styledElement).save();
            pdfGenerated = true;
          } catch (elementErr) {
            console.warn('html2pdf direct element capture had an issue, trying pre-rendered canvas:', elementErr);
            try {
              const canvas = await renderElementToCanvas(styledElement, 2, '#0d1117');
              await html2pdfLib().set(opt).from(canvas).save();
              pdfGenerated = true;
            } catch (canvasErr) {
              console.warn('html2pdf from(canvas) failed, falling back to direct jsPDF multi-page engine:', canvasErr);
            }
          }
        }

        // 2. High-Fidelity multi-page jsPDF engine fallback
        if (!pdfGenerated) {
          const canvas = await renderElementToCanvas(styledElement, 2, '#0d1117');
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10; // 10mm margins
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
    } else if (format === 'png') {
      notifyExportProgress({
        isExporting: true,
        format: 'png',
        message: 'Capturing high-resolution newsletter graphic at 2x DPI...',
      });

      if (!targetElement) throw new Error('Missing #newsletter-preview element.');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = options?.filename ? `${options.filename}.png` : `Crestview_Newsletter_${timestamp}.png`;

      await withExportContainerStyling(targetElement, async (styledElement) => {
        const canvas = await renderElementToCanvas(styledElement, 2, '#0d1117');
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              downloadBlob(blob, filename);
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob from canvas.'));
            }
          }, 'image/png');
        });
      });
    } else if (format === 'doc') {
      notifyExportProgress({
        isExporting: true,
        format: 'doc',
        message: 'Packaging MS Word Document (.doc)...',
      });

      const contentHtml = targetElement ? targetElement.innerHTML : '';
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
            h1, h2, h3, h4, h5 {
              font-family: 'Segoe UI', Calibri, Arial, sans-serif;
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
      notifyExportProgress({
        isExporting: true,
        format: 'html',
        message: 'Generating standalone Web Page (.html)...',
      });

      const contentHtml = targetElement ? targetElement.innerHTML : '';
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
  ${contentHtml}
</body>
</html>`;

      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${filenameBase}.html`);
    } else if (format === 'json') {
      notifyExportProgress({
        isExporting: true,
        format: 'json',
        message: 'Exporting raw structured JSON payload...',
      });

      let dataToExport = options?.jsonData;
      if (!dataToExport && targetElement) {
        const rawJsonAttr = targetElement.getAttribute('data-newsletter-json');
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

    notifyExportProgress({ isExporting: false });
    options?.onEnd?.();
  } catch (error: any) {
    notifyExportProgress({ isExporting: false });
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Export failed for format [${format}]:`, err);
    if (options?.onError) {
      options.onError(err);
    } else {
      alert(`Export error (${format.toUpperCase()}): ${err.message}`);
    }
  }
};

// Global registration so window.exportNewsletter is available
if (typeof window !== 'undefined') {
  (window as any).exportNewsletter = exportNewsletter;
}
