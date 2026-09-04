import * as pdfjsLib from 'pdfjs-dist';
import { getVideoBlobUrl } from './videoStorage';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker URL robustly using local same-origin public file, bundle URL or fast CDN fallback
export function ensurePdfWorkerConfigured() {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF Worker setup note:', e);
  }
}

// Initialize on module load
ensurePdfWorkerConfigured();

/**
 * Creates a clean, attractive PDF Catalogue Cover Image (Data URL)
 * Used as an instant fallback when PDF parsing is in progress or unavailable.
 */
export function generateFallbackPdfCover(docTitle = 'Product Catalogue', companyName = 'Vyapar Bridge Member'): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 800, 1100);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.4, '#0f172a');
    grad.addColorStop(1, '#064e3b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1100);

    // Decorative geometric grid/accents
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.lineWidth = 1.5;
    for (let x = 50; x < 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1100);
      ctx.stroke();
    }
    for (let y = 50; y < 1100; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Outer Border Frame
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 740, 1040);

    // Top Header Badge
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(50, 50, 260, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('📄 PDF TRADE CATALOGUE', 75, 78);

    // Center Graphic Icon Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(260, 320, 280, 280, 32);
    ctx.fill();
    ctx.stroke();

    // Inner icon graphics
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', 400, 485);

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('FRONT COVER PREVIEW', 400, 545);

    // Company & Document Details
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    const shortCompany = companyName.length > 30 ? companyName.substring(0, 28) + '...' : companyName;
    ctx.fillText(shortCompany, 400, 680);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 20px sans-serif';
    const shortTitle = docTitle.length > 40 ? docTitle.substring(0, 38) + '...' : docTitle;
    ctx.fillText(shortTitle, 400, 730);

    // Bottom Action Pill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(220, 940, 360, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('📖 TAP TO VIEW CATALOGUE', 400, 978);

    return canvas.toDataURL('image/jpeg', 0.92);
  } catch {
    return '';
  }
}

/**
 * Detects if a URL is hosted on Cloudinary and represents a PDF or document
 */
export function isCloudinaryPdfUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') && (url.includes('.pdf') || url.includes('/image/upload/') || url.includes('/upload/'));
}

/**
 * Returns a high-definition image URL for a specific page of a Cloudinary PDF
 */
export function getCloudinaryPdfPageUrl(
  url: string, 
  pageNum = 1, 
  options: { width?: number; quality?: string | number } = {}
): string {
  if (!url || typeof url !== 'string') return '';
  const { width = 1400, quality = 'auto' } = options;
  let base = url.replace(/\.pdf(\?.*)?$/i, '.jpg');
  
  const transform = `pg_${pageNum},w_${width},c_limit,q_${quality}`;
  if (base.includes('/image/upload/')) {
    return base.replace('/image/upload/', `/image/upload/${transform}/`);
  } else if (base.includes('/upload/')) {
    return base.replace('/upload/', `/image/upload/${transform}/`);
  }
  return base;
}

// In-memory cache for page counts to avoid duplicate network lookups
const pageCountCache = new Map<string, number>();

/**
 * Queries total pages for a Cloudinary PDF document
 */
export async function fetchCloudinaryPdfPageCount(url: string): Promise<number> {
  if (!url || typeof url !== 'string') return 1;
  if (pageCountCache.has(url)) {
    return pageCountCache.get(url)!;
  }

  try {
    const res = await fetch(`/api/pdf-info?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.totalPages === 'number' && data.totalPages > 0) {
        pageCountCache.set(url, data.totalPages);
        return data.totalPages;
      }
    }
  } catch (err) {
    console.warn('Could not fetch PDF info from API:', err);
  }

  // Direct fast probe fallback
  try {
    const probeUrl = url.replace(/\.pdf(\?.*)?$/i, '.jpg').replace(/\/image\/upload\//, '/image/upload/pg_9999/');
    const res = await fetch(probeUrl, { method: 'GET' });
    const cldErr = res.headers.get('x-cld-error');
    if (cldErr) {
      const match = cldErr.match(/only has (\d+) pages/i);
      if (match && match[1]) {
        const count = parseInt(match[1], 10);
        pageCountCache.set(url, count);
        return count;
      }
    }
  } catch {}

  pageCountCache.set(url, 1);
  return 1;
}

/**
 * Extracts a high-definition JPEG/DataURL thumbnail from the first page of a PDF.
 * Works seamlessly with File, Blob, Uint8Array, ArrayBuffer, IndexedDB key, or URL strings.
 */
export async function extractPdfFirstPageThumbnail(
  source: File | Blob | ArrayBuffer | Uint8Array | string,
  maxWidth = 1200,
  maxHeight = 1600
): Promise<{ thumbnailUrl: string; numPages: number }> {
  try {
    // If source is a Cloudinary PDF URL, use native high-resolution page 1 image
    if (typeof source === 'string' && isCloudinaryPdfUrl(source)) {
      const thumb = getCloudinaryPdfPageUrl(source, 1, { width: maxWidth });
      const numPages = await fetchCloudinaryPdfPageCount(source);
      return { thumbnailUrl: thumb, numPages: numPages || 1 };
    }

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

    // If source is already an image data URL, return immediately
    if (typeof source === 'string' && source.startsWith('data:image/')) {
      return { thumbnailUrl: source, numPages: 1 };
    }

    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      source = `/api/proxy-pdf?url=${encodeURIComponent(source)}`;
    }

    // If source is a URL or Blob URL, attempt fetching ArrayBuffer first for optimal worker reliability
    if (typeof source === 'string' && (source.startsWith('blob:') || source.startsWith('/'))) {
      try {
        const response = await fetch(source);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          source = new Uint8Array(buffer);
        }
      } catch (fetchErr) {
        console.warn('PDF fetch pre-load notice, falling back to direct URL task:', fetchErr);
      }
    }

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

    // Set a 8-second timeout race to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout')), 8000);
    });

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    const numPages = pdf.numPages || 1;

    // Render first page onto an in-memory canvas
    const page = await pdf.getPage(1);
    const unscaledViewport = page.getViewport({ scale: 1 });

    // Calculate optimal scale for crisp high-DPI front page rendering
    const scale = Math.min(
      Math.max(maxWidth / (unscaledViewport.width || 600), 1.2),
      2.5
    );
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return { thumbnailUrl: generateFallbackPdfCover(), numPages };
    }

    // Fill crisp white background before rendering PDF page content
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.92);
    return { thumbnailUrl, numPages };
  } catch (error) {
    console.warn('PDF Cover Thumbnail Extraction Note:', error);
    return { thumbnailUrl: '', numPages: 1 };
  }
}
