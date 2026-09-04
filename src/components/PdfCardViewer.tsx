import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { getVideoBlobUrl } from '../utils/videoStorage';
import { 
  extractPdfFirstPageThumbnail, 
  ensurePdfWorkerConfigured, 
  generateFallbackPdfCover,
  isCloudinaryPdfUrl,
  getCloudinaryPdfPageUrl,
  fetchCloudinaryPdfPageCount
} from '../utils/pdfThumbnail';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Building2, 
  BookOpen, 
  Share2,
  FileCheck,
  Sparkles,
  Layers,
  RotateCcw,
  Maximize2
} from 'lucide-react';

ensurePdfWorkerConfigured();

interface PdfCardViewerProps {
  post: {
    id?: string;
    mediaUrl?: string;
    pdfUrl?: string;
    title?: string;
    content?: string;
    user?: {
      id?: string;
      name?: string;
      businessName?: string;
      role?: string;
      isVerified?: boolean;
      avatarUrl?: string;
      city?: string;
      state?: string;
    };
    companyName?: string;
    thumbnailUrl?: string;
    createdAt?: any;
  };
  variant?: 'feed' | 'grid' | 'preview';
  onOpenModal?: () => void;
}

export const PdfCardViewer: React.FC<PdfCardViewerProps> = ({ post, variant = 'feed' }) => {
  const rawPdfUrl = post.mediaUrl || post.pdfUrl || '';
  const [effectivePdfUrl, setEffectivePdfUrl] = useState<string>(
    rawPdfUrl && !rawPdfUrl.startsWith('indexeddb:') ? rawPdfUrl : ''
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [hasCanvasRendered, setHasCanvasRendered] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<boolean>(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState<boolean>(false);
  
  const isCloudinary = isCloudinaryPdfUrl(rawPdfUrl || effectivePdfUrl);

  const initialThumb = (
    post.thumbnailUrl && 
    !post.thumbnailUrl.startsWith('data:application/pdf') && 
    !post.thumbnailUrl.includes('.pdf') && 
    !post.thumbnailUrl.match(/\.pdf(\?.*)?$/i) && 
    post.thumbnailUrl !== 'undefined' && 
    post.thumbnailUrl !== 'null' && 
    post.thumbnailUrl.trim() !== ''
  ) ? post.thumbnailUrl : (isCloudinary ? getCloudinaryPdfPageUrl(rawPdfUrl || effectivePdfUrl, 1) : '');

  const [coverThumbUrl, setCoverThumbUrl] = useState<string>(initialThumb);

  // Derived Company & Document Titles
  const companyName = 
    post.companyName || 
    post.user?.businessName || 
    post.user?.name || 
    'Official Trade Catalogue';

  const docTitle = 
    post.title || 
    post.content || 
    `${companyName} - Product Catalogue & Design Specs`;

  // Resolve Blob from IndexedDB if necessary
  useEffect(() => {
    let isCancelled = false;
    const resolveSource = async () => {
      if (rawPdfUrl && !rawPdfUrl.startsWith('indexeddb:')) {
        if (!isCancelled) setEffectivePdfUrl(rawPdfUrl);
        return;
      }
      
      let blobId = String(post.id);
      if (rawPdfUrl && rawPdfUrl.startsWith('indexeddb:')) {
        blobId = rawPdfUrl.replace('indexeddb:', '');
      }

      if (blobId) {
        const blobUrl = await getVideoBlobUrl(blobId);
        if (blobUrl && !isCancelled) {
          setEffectivePdfUrl(blobUrl);
          return;
        }
      }
      if (!isCancelled) setEffectivePdfUrl(rawPdfUrl || '');
    };
    resolveSource();
    return () => { isCancelled = true; };
  }, [rawPdfUrl, post.id]);

  useEffect(() => {
    if (post.thumbnailUrl && 
        !post.thumbnailUrl.startsWith('data:application/pdf') && 
        !post.thumbnailUrl.includes('.pdf') && 
        !post.thumbnailUrl.match(/\.pdf(\?.*)?$/i) && 
        post.thumbnailUrl !== 'undefined' && 
        post.thumbnailUrl !== 'null' && 
        post.thumbnailUrl.trim() !== '') {
      setCoverThumbUrl(post.thumbnailUrl);
    }
  }, [post.thumbnailUrl]);

  // Load and render Page 1 (Front Page) as crisp thumbnail image or canvas
  useEffect(() => {
    let isCancelled = false;

    if (!effectivePdfUrl || effectivePdfUrl.startsWith('indexeddb:')) {
      return;
    }

    const renderFirstPage = async () => {
      try {
        setIsRendering(true);
        setRenderError(false);

        // Native Cloudinary support: Instant cover and page count
        if (isCloudinaryPdfUrl(effectivePdfUrl)) {
          const thumb = getCloudinaryPdfPageUrl(effectivePdfUrl, 1, { width: 900 });
          setCoverThumbUrl(thumb);
          setIsRendering(false);
          setHasCanvasRendered(true);
          fetchCloudinaryPdfPageCount(effectivePdfUrl).then((count) => {
            if (!isCancelled && count > 0) {
              setNumPages(count);
            }
          });
          return;
        }

        // If we don't have a thumbnail image yet, extract directly
        if (!coverThumbUrl) {
          const { thumbnailUrl, numPages: count } = await extractPdfFirstPageThumbnail(effectivePdfUrl);
          if (isCancelled) return;

          if (count > 0) setNumPages(count);

          if (thumbnailUrl && !thumbnailUrl.startsWith('data:application/pdf')) {
            setCoverThumbUrl(thumbnailUrl);
            setIsRendering(false);
            return;
          }
        }

        // Direct in-canvas Page 1 render fallback
        ensurePdfWorkerConfigured();
        const pdfjsVer = pdfjsLib.version || '6.2.108';
        const cMapUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVer}/cmaps/`;

        let loadingTask: any;
        if (effectivePdfUrl.startsWith('http://') || effectivePdfUrl.startsWith('https://') || effectivePdfUrl.startsWith('blob:')) {
          try {
            const resp = await fetch(effectivePdfUrl);
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf), cMapUrl, cMapPacked: true });
            } else {
              loadingTask = pdfjsLib.getDocument({ url: effectivePdfUrl, cMapUrl, cMapPacked: true });
            }
          } catch {
            loadingTask = pdfjsLib.getDocument({ url: effectivePdfUrl, cMapUrl, cMapPacked: true });
          }
        } else {
          loadingTask = pdfjsLib.getDocument({ url: effectivePdfUrl, cMapUrl, cMapPacked: true });
        }

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);

        // Fetch Page 1
        const page = await pdf.getPage(1);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (canvas) {
          const unscaled = page.getViewport({ scale: 1 });
          const targetScale = Math.min(Math.max(900 / (unscaled.width || 600), 1.2), 2.2);
          const viewport = page.getViewport({ scale: targetScale });

          const context = canvas.getContext('2d', { alpha: false });
          if (context) {
            canvas.height = Math.floor(viewport.height);
            canvas.width = Math.floor(viewport.width);
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;

            if (!isCancelled) {
              setHasCanvasRendered(true);
              try {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
                if (dataUrl && dataUrl.length > 50) {
                  setCoverThumbUrl(dataUrl);
                }
              } catch {
                // Ignore canvas security errors on cross-origin taint
              }
            }
          }
        }
        setIsRendering(false);
      } catch (err) {
        if (!isCancelled) {
          console.warn('PDF First Page Canvas Render Note:', err);
          setRenderError(true);
          setIsRendering(false);
        }
      }
    };

    renderFirstPage();

    return () => {
      isCancelled = true;
    };
  }, [effectivePdfUrl, coverThumbUrl, docTitle, companyName]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadTarget = effectivePdfUrl || rawPdfUrl;
    if (!downloadTarget) return;
    const downloadUrl = isCloudinaryPdfUrl(downloadTarget)
      ? `/api/proxy-pdf?url=${encodeURIComponent(downloadTarget)}&download=1`
      : downloadTarget;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalogue.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareTarget = effectivePdfUrl || rawPdfUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: docTitle,
        text: `Check out ${companyName}'s official PDF catalogue on Vyapar Bridge!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareTarget);
      alert('📋 Catalogue link copied to clipboard!');
    }
  };

  // GRID / COMPACT VARIANT (for Explore Grid, Profile Grid & Saved List)
  if (variant === 'grid') {
    return (
      <>
        <div 
          onClick={() => setIsReaderModalOpen(true)}
          className="relative w-full h-full aspect-square bg-slate-900 overflow-hidden cursor-pointer group border border-emerald-500/30 rounded-xl shadow-sm"
        >
          {/* Custom Cover Thumbnail, Canvas, or Fallback Image */}
          {coverThumbUrl ? (
            <img 
              src={coverThumbUrl} 
              alt={docTitle} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              onError={() => {
                setCoverThumbUrl(generateFallbackPdfCover(docTitle, companyName));
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 p-1">
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-md rounded-sm" />
            </div>
          )}

          {/* Top PDF Indicator Tag */}
          <div className="absolute top-2 left-2 z-10 bg-emerald-600/95 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md border border-emerald-400/50">
            <FileCheck className="w-3 h-3 text-emerald-200" /> PDF CATALOGUE
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-3 text-center text-white z-20">
            <BookOpen className="w-6 h-6 text-emerald-400 mb-1.5 animate-bounce" />
            <p className="text-[11px] font-black line-clamp-2 uppercase text-emerald-300">{companyName}</p>
            <span className="mt-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-full font-bold shadow-md flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Read Catalogue
            </span>
          </div>
        </div>

        {/* Reader Modal */}
        {isReaderModalOpen && (
          <PdfReaderModal 
            pdfUrl={effectivePdfUrl || rawPdfUrl} 
            docTitle={docTitle} 
            companyName={companyName} 
            totalPageCount={numPages}
            onClose={() => setIsReaderModalOpen(false)} 
          />
        )}
      </>
    );
  }

  // FULL FEED WALL POSTCARD VARIANT
  return (
    <>
      <div 
        onClick={() => setIsReaderModalOpen(true)}
        className="relative w-full bg-slate-950 rounded-2xl overflow-hidden shadow-lg cursor-pointer group hover:border-emerald-500/50 transition-all duration-300 my-2 border border-slate-800"
      >
        {/* Top Front Page Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-4 py-2.5 flex items-center justify-between border-b border-emerald-500/20 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-400/30">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block truncate">
                📄 PDF CATALOGUE • FRONT COVER
              </span>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
              title="Share Catalogue"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* First Page / Front Cover Hero Canvas / Image */}
        <div className="relative w-full min-h-[340px] max-h-[82vh] flex items-center justify-center bg-slate-900/90 overflow-hidden p-2 sm:p-4">
          {coverThumbUrl ? (
            <div className="relative max-h-[76vh] flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-white">
              <img 
                src={coverThumbUrl} 
                alt={docTitle} 
                className="w-full h-auto max-h-[76vh] object-contain transition-transform duration-300 group-hover:scale-[1.01]" 
                onError={() => {
                  setCoverThumbUrl(generateFallbackPdfCover(docTitle, companyName));
                }}
              />
            </div>
          ) : (
            <div className="relative max-h-[76vh] flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-white">
              <canvas 
                ref={canvasRef} 
                className={`w-full h-auto max-h-[76vh] object-contain transition-transform duration-300 group-hover:scale-[1.01] ${
                  hasCanvasRendered ? 'block' : 'hidden'
                }`}
              />

              {!hasCanvasRendered && !isRendering && (
                  <div className="w-full min-h-[320px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 rounded-xl text-center flex flex-col items-center justify-center my-auto border border-emerald-500/20">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                      <FileText className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1 line-clamp-2 max-w-sm">
                      {companyName}
                    </h4>
                    <p className="text-xs text-emerald-300/90 font-semibold mb-4 max-w-sm line-clamp-2">
                      {docTitle}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg">
                      <BookOpen className="w-4 h-4" />
                      <span>Tap to Open Full Catalogue</span>
                    </div>
                  </div>
              )}
            </div>
          )}

          {/* Minimal Floating Page Count & Tap to Open Badge */}
          <div className="absolute bottom-4 right-4 bg-slate-950/90 hover:bg-black text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-tight flex items-center gap-2 shadow-xl border border-emerald-500/40 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>{numPages ? `${numPages} Pages` : 'PDF Brochure'} • Tap to Read</span>
          </div>

          {/* Loading Indicator */}
          {isRendering && !coverThumbUrl && !hasCanvasRendered && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2.5 text-emerald-400 font-bold text-xs z-20">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Loading PDF Front Page...
            </div>
          )}
        </div>

        {/* Bottom Bar Details */}
        <div className="px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 min-w-0">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300 truncate">
              {docTitle}
            </span>
          </div>

          <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-400/30 px-2.5 py-1 rounded-md shrink-0 ml-2">
            📖 Open Reader
          </span>
        </div>
      </div>

      {/* Reader Modal */}
      {isReaderModalOpen && (
        <PdfReaderModal 
          pdfUrl={effectivePdfUrl || rawPdfUrl} 
          docTitle={docTitle} 
          companyName={companyName} 
          totalPageCount={numPages}
          onClose={() => setIsReaderModalOpen(false)} 
        />
      )}
    </>
  );
};

// FULLSCREEN INTERACTIVE PDF READER MODAL
interface PdfReaderModalProps {
  pdfUrl: string;
  docTitle: string;
  companyName: string;
  totalPageCount?: number | null;
  onClose: () => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  pdfUrl,
  docTitle,
  companyName,
  totalPageCount,
  onClose,
}) => {
  const isCloudinary = isCloudinaryPdfUrl(pdfUrl);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(totalPageCount || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfError, setPdfError] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // 1. Cloudinary PDF: Resolve total page count and preload adjacent pages
  useEffect(() => {
    let isMounted = true;
    if (!isCloudinary) return;

    setLoading(true);
    fetchCloudinaryPdfPageCount(pdfUrl).then((count) => {
      if (isMounted && count > 0) {
        setTotalPages(count);
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, isCloudinary]);

  // Preload next and previous Cloudinary page images for instant transitions
  useEffect(() => {
    if (!isCloudinary || totalPages <= 1) return;

    if (currentPage < totalPages) {
      const nextImg = new Image();
      nextImg.src = getCloudinaryPdfPageUrl(pdfUrl, currentPage + 1, { width: 1400 });
    }
    if (currentPage > 1) {
      const prevImg = new Image();
      prevImg.src = getCloudinaryPdfPageUrl(pdfUrl, currentPage - 1, { width: 1400 });
    }
  }, [currentPage, totalPages, pdfUrl, isCloudinary]);

  // 2. Non-Cloudinary PDF: Load using pdfjs-dist
  useEffect(() => {
    let isMounted = true;
    if (isCloudinary || !pdfUrl) return;

    const loadPdfDoc = async () => {
      try {
        setLoading(true);
        setPdfError(false);
        ensurePdfWorkerConfigured();
        const pdfjsVer = pdfjsLib.version || '6.2.108';
        const cMapUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVer}/cmaps/`;

        let loadingTask: any;
        const isHttpUrl = pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://');
        
        if (pdfUrl.startsWith('blob:') || pdfUrl.startsWith('data:')) {
          try {
            const resp = await fetch(pdfUrl);
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf), cMapUrl, cMapPacked: true });
            } else {
              loadingTask = pdfjsLib.getDocument({ url: pdfUrl, cMapUrl, cMapPacked: true });
            }
          } catch {
            loadingTask = pdfjsLib.getDocument({ url: pdfUrl, cMapUrl, cMapPacked: true });
          }
        } else {
          const targetUrl = isHttpUrl ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}` : pdfUrl;
          loadingTask = pdfjsLib.getDocument({ url: targetUrl, cMapUrl, cMapPacked: true });
        }

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.warn('PDF Full Reader Load Error:', err);
        if (isMounted) {
          setLoading(false);
          setPdfError(true);
        }
      }
    };

    loadPdfDoc();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, isCloudinary]);

  // 3. Render non-Cloudinary page onto canvas
  useEffect(() => {
    let isCancelled = false;
    if (isCloudinary || !pdfDoc) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: scale * 1.5 });
        const canvas = modalCanvasRef.current;

        if (canvas) {
          const context = canvas.getContext('2d', { alpha: false });
          if (context) {
            canvas.height = Math.floor(viewport.height);
            canvas.width = Math.floor(viewport.width);
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
          }
        }
        setLoading(false);
      } catch (e) {
        console.warn('Modal Page Render Note:', e);
        setLoading(false);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, isCloudinary]);

  // 4. Keyboard Navigation (Arrow Keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, onClose]);

  // 5. Touch swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (diff > 60) {
      // Swipe Right -> Previous Page
      setCurrentPage(prev => Math.max(1, prev - 1));
    } else if (diff < -60) {
      // Swipe Left -> Next Page
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }
    setTouchStartX(null);
  };

  // 6. Download handler
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dlUrl = isCloudinary
        ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}&download=1`
        : pdfUrl;
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalogue.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => setIsDownloading(false), 3000);
    } catch {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between text-white shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate">
              {companyName}
            </h3>
            <p className="text-[10px] sm:text-xs text-emerald-300/90 truncate">
              {docTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Thumbnails Drawer Toggle Button */}
          {totalPages > 1 && (
            <button
              onClick={() => setShowThumbnails(prev => !prev)}
              className={`px-3 py-2 rounded-xl transition-all border text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md ${
                showThumbnails 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-zinc-300 border-slate-700'
              }`}
              title="All Pages Thumbnails"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Pages</span>
              <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {totalPages}
              </span>
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-2 bg-slate-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl transition-colors border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md disabled:opacity-50"
            title="Download PDF"
          >
            {isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Download</span>
              </>
            )}
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-colors border border-red-500/30 cursor-pointer ml-1"
            title="Close Reader (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Document Reading Area */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 w-full max-w-5xl my-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 sm:p-4 overflow-auto shadow-inner"
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-emerald-400 font-bold text-sm">
            <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Loading Page {currentPage} of {totalPages}...
          </div>
        )}

        {/* 1. Cloudinary Native High-Def Page Display */}
        {isCloudinary ? (
          <div className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-150">
            <img 
              key={`page-${currentPage}`}
              src={getCloudinaryPdfPageUrl(pdfUrl, currentPage, { width: Math.round(1400 * scale) })} 
              alt={`Page ${currentPage} of ${totalPages}`}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none pointer-events-auto transition-transform duration-150"
            />
          </div>
        ) : pdfError ? (
          /* 2. Non-Cloudinary Fallback Card (No broken Google Docs!) */
          <div className="flex flex-col items-center text-center p-6 max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Trade Catalogue Ready</h4>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              This document is ready to view. You can open the original PDF file directly in your browser or save it to your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </a>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Download
              </button>
            </div>
          </div>
        ) : (
          /* 3. Canvas rendering for non-Cloudinary PDFs */
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            <canvas 
              ref={modalCanvasRef} 
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10" 
            />
          </div>
        )}
      </div>

      {/* Thumbnail Bar (Expandable) */}
      {showThumbnails && totalPages > 1 && (
        <div className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 mb-2 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Jump to Page ({totalPages} Pages Total)
            </span>
            <button 
              onClick={() => setShowThumbnails(false)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-600">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  setLoading(true);
                }}
                className={`relative shrink-0 flex flex-col items-center rounded-xl p-1.5 transition-all border cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                {isCloudinary ? (
                  <img
                    src={getCloudinaryPdfPageUrl(pdfUrl, pageNum, { width: 140 })}
                    alt={`Thumb ${pageNum}`}
                    className="w-14 h-20 object-cover rounded-lg bg-slate-800 shadow"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-20 bg-slate-800 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-bold">
                    P.{pageNum}
                  </div>
                )}
                <span className={`text-[10px] font-mono mt-1 font-bold ${
                  currentPage === pageNum ? 'text-emerald-300' : 'text-zinc-400'
                }`}>
                  Page {pageNum}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between text-white shadow-2xl">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              setLoading(true);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-zinc-200 transition-colors border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-xs font-black tracking-wider text-emerald-300">
              Page {currentPage} of {totalPages}
            </span>
            {totalPages > 1 && (
              <select
                value={currentPage}
                onChange={(e) => {
                  setCurrentPage(Number(e.target.value));
                  setLoading(true);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono cursor-pointer ml-1"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Go to {num}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => {
              setCurrentPage(prev => Math.min(totalPages, prev + 1));
              setLoading(true);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-zinc-200 transition-colors border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(prev => Math.max(0.6, Number((prev - 0.15).toFixed(2))))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScale(1.0)}
            className="text-xs font-bold text-zinc-400 min-w-[50px] text-center hover:text-white cursor-pointer px-1 py-1 rounded bg-slate-950/60 border border-slate-800"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={() => setScale(prev => Math.min(2.5, Number((prev + 0.15).toFixed(2))))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
