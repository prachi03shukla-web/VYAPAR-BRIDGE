import * as pdfjsLib from 'pdfjs-dist';
import { getVideoBlobUrl } from './videoStorage';

// Configure worker URL robustly using fast CDN
export function ensurePdfWorkerConfigured() {
  try {
    const version = pdfjsLib.version || '6.2.108';
    // Use unpkg or jsdelivr CDN for pdf.worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF Worker setup note:', e);
  }
}

// Initialize on module load
ensurePdfWorkerConfigured();

/**
 * Creates a clean, attractive PDF Catalogue Cover Image (Data URL)
 * Used as an instant fallback so cards never appear blank/white.
 */
export function generateFallbackPdfCover(docTitle = 'Product Catalogue', companyName = 'Vyapar Bridge Member'): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 600, 800);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#064e3b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Decorative geometric grid/accents
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 600; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 40; y < 800; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(600, y);
      ctx.stroke();
    }

    // Top Header Badge
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(40, 40, 220, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('📄 PDF CATALOGUE', 60, 63);

    // Center Graphic Icon Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(200, 220, 200, 200, 24);
    ctx.fill();
    ctx.stroke();

    // Inner icon graphics
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', 300, 345);

    // Company & Document Details
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    const shortCompany = companyName.length > 32 ? companyName.substring(0, 30) + '...' : companyName;
    ctx.fillText(shortCompany, 300, 480);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '16px sans-serif';
    const shortTitle = docTitle.length > 40 ? docTitle.substring(0, 38) + '...' : docTitle;
    ctx.fillText(shortTitle, 300, 520);

    // Bottom Action Pill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(160, 680, 280, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('📖 TAP TO VIEW CATALOGUE', 300, 710);

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    return '';
  }
}

/**
 * Extracts a high-definition JPEG/DataURL thumbnail from the first page of a PDF.
 * Works seamlessly with File, Blob, Uint8Array, ArrayBuffer, IndexedDB key, or URL strings.
 */
export async function extractPdfFirstPageThumbnail(
  source: File | Blob | ArrayBuffer | Uint8Array | string,
  maxWidth = 1000,
  maxHeight = 1400
): Promise<{ thumbnailUrl: string; numPages: number }> {
  try {
    ensurePdfWorkerConfigured();

    let loadingTask: any;

    if (typeof source === 'string' && source.startsWith('indexeddb:')) {
      const postId = source.replace('indexeddb:', '');
      const blobUrl = await getVideoBlobUrl(postId);
      if (blobUrl) {
        source = blobUrl;
      }
    }

    const version = pdfjsLib.version || '6.2.108';
    const cMapUrl = `https://unpkg.com/pdfjs-dist@${version}/cmaps/`;

    if (source instanceof Blob) {
      const buffer = await source.arrayBuffer();
      loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        cMapUrl,
        cMapPacked: true,
      });
    } else if (source instanceof ArrayBuffer) {
      loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(source),
        cMapUrl,
        cMapPacked: true,
      });
    } else if (source instanceof Uint8Array) {
      loadingTask = pdfjsLib.getDocument({
        data: source,
        cMapUrl,
        cMapPacked: true,
      });
    } else if (typeof source === 'string' && source.trim()) {
      if (source.startsWith('data:application/pdf;base64,')) {
        const base64Data = source.split(',')[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        loadingTask = pdfjsLib.getDocument({ data: bytes, cMapUrl, cMapPacked: true });
      } else if (source.startsWith('data:image/')) {
        // Already an image thumbnail
        return { thumbnailUrl: source, numPages: 1 };
      } else {
        loadingTask = pdfjsLib.getDocument({
          url: source,
          cMapUrl,
          cMapPacked: true,
        });
      }
    } else {
      return { thumbnailUrl: generateFallbackPdfCover(), numPages: 1 };
    }

    // Set a 6-second timeout race to prevent hanging on slow network or worker failure
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout')), 6000);
    });

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    const numPages = pdf.numPages || 1;

    // Render first page onto an in-memory canvas
    const page = await pdf.getPage(1);
    const unscaledViewport = page.getViewport({ scale: 1 });

    // Calculate optimal scale for crisp high-DPI rendering
    const scale = Math.min(
      maxWidth / unscaledViewport.width,
      maxHeight / unscaledViewport.height,
      2.0
    );
    const viewport = page.getViewport({ scale: Math.max(scale, 1.0) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return { thumbnailUrl: generateFallbackPdfCover(), numPages };
    }

    // Fill neutral white background before rendering PDF page content
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.88);
    return { thumbnailUrl, numPages };
  } catch (error) {
    console.warn('PDF Cover Thumbnail Extraction Note:', error);
    return { thumbnailUrl: generateFallbackPdfCover(), numPages: 1 };
  }
}
