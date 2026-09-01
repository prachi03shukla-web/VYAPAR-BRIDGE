import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { getVideoBlobUrl } from '../utils/videoStorage';
import { extractPdfFirstPageThumbnail, ensurePdfWorkerConfigured } from '../utils/pdfThumbnail';
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
  CheckCircle, 
  BookOpen, 
  Share2,
  Sparkles,
  ShieldCheck,
  FileCheck
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
  const [coverThumbUrl, setCoverThumbUrl] = useState<string>(
    (post.thumbnailUrl && 
     !post.thumbnailUrl.startsWith('data:application/pdf') && 
     !post.thumbnailUrl.startsWith('blob:') && 
     !post.thumbnailUrl.includes('.pdf') && 
     !post.thumbnailUrl.match(/\.pdf(\?.*)?$/i) && 
     post.thumbnailUrl !== 'undefined' && 
     post.thumbnailUrl !== 'null' && 
     post.thumbnailUrl.trim() !== '') 
      ? post.thumbnailUrl 
      : ''
  );

  // Derived Company & Document Titles
  const companyName = 
    post.companyName || 
    post.user?.businessName || 
    post.user?.name || 
    'Official Business Catalogue';

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
      if (post.id) {
        const blobUrl = await getVideoBlobUrl(String(post.id));
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
        !post.thumbnailUrl.startsWith('blob:') && 
        !post.thumbnailUrl.includes('.pdf') && 
        !post.thumbnailUrl.match(/\.pdf(\?.*)?$/i) && 
        post.thumbnailUrl !== 'undefined' && 
        post.thumbnailUrl !== 'null' && 
        post.thumbnailUrl.trim() !== '') {
      setCoverThumbUrl(post.thumbnailUrl);
      setIsRendering(false);
      setRenderError(false);
    }
  }, [post.thumbnailUrl]);

  // Load and render Page 1 as thumbnail canvas or extracted image
  useEffect(() => {
    let isCancelled = false;

    if (coverThumbUrl) {
      setIsRendering(false);
      return;
    }

    if (!effectivePdfUrl || effectivePdfUrl.startsWith('indexeddb:')) {
      setIsRendering(false);
      return;
    }

    const renderFirstPage = async () => {
      try {
        setIsRendering(true);
        setRenderError(false);

        // 1. Try extracting thumbnail via pdfThumbnail utility first
        const { thumbnailUrl, numPages: count } = await extractPdfFirstPageThumbnail(effectivePdfUrl);
        if (isCancelled) return;

        if (count > 0) setNumPages(count);
        if (thumbnailUrl && !thumbnailUrl.startsWith('data:application/pdf')) {
          setCoverThumbUrl(thumbnailUrl);
          setIsRendering(false);
          return;
        }

        // 2. Direct Canvas Render fallback
        const pdfjsVer = pdfjsLib.version || '6.2.108';
        const loadingTask = pdfjsLib.getDocument({
          url: effectivePdfUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVer}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);

        // Fetch Page 1
        const page = await pdf.getPage(1);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;

        if (canvas) {
          const context = canvas.getContext('2d', { alpha: false });
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            if (!isCancelled) {
              setHasCanvasRendered(true);
            }
          }
        }
        setIsRendering(false);
      } catch (err) {
        if (!isCancelled) {
          console.warn('PDF Canvas Render Note:', err);
          setRenderError(true);
          setIsRendering(false);
        }
      }
    };

    renderFirstPage();

    return () => {
      isCancelled = true;
    };
  }, [effectivePdfUrl, coverThumbUrl]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadTarget = effectivePdfUrl || rawPdfUrl;
    if (!downloadTarget) return;
    const a = document.createElement('a');
    a.href = downloadTarget;
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
          className="relative w-full h-full aspect-square bg-slate-900 overflow-hidden cursor-pointer group border border-emerald-500/20 rounded-lg shadow-sm"
        >
          {/* Custom Cover Thumbnail, Canvas, or Fallback Image */}
          {coverThumbUrl ? (
            <img 
              src={coverThumbUrl} 
              alt={docTitle} 
              className="w-full h-full object-cover" 
              onError={() => {
                console.warn('PDF Cover Thumbnail load failed, falling back...');
                setCoverThumbUrl('');
              }}
            />
          ) : (
            <>
              {/* Always preserve the same canvas DOM node so its rendered pixels are not lost */}
              <div className={`w-full h-full flex items-center justify-center bg-slate-950 p-1 ${
                hasCanvasRendered ? 'flex' : 'hidden'
              }`}>
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-md rounded-sm" />
              </div>

              {!hasCanvasRendered && (
                <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-3 flex flex-col items-center justify-between text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-emerald-400/30 text-emerald-300 mt-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="my-auto">
                    <p className="text-[10px] font-black text-white line-clamp-2 uppercase tracking-wide">
                      {companyName}
                    </p>
                    <p className="text-[8px] text-emerald-300 font-semibold line-clamp-1 mt-0.5">
                      {docTitle}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Top PDF Indicator Tag */}
          <div className="absolute top-1.5 left-1.5 z-10 bg-emerald-600/90 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[8.5px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md border border-emerald-400/40">
            <FileCheck className="w-3 h-3 text-emerald-200" /> PDF CATALOGUE
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-2 text-center text-white z-20">
            <BookOpen className="w-6 h-6 text-emerald-400 mb-1 animate-bounce" />
            <p className="text-[10px] font-black line-clamp-2 uppercase text-emerald-300">{companyName}</p>
            <span className="mt-2 text-[9px] bg-emerald-600 px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> Read Catalogue
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

  // FULL FEED WALL VARIANT
  return (
    <>
      <div 
        onClick={() => setIsReaderModalOpen(true)}
        className="relative w-full bg-slate-900/95 dark:bg-black/95 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-98 transition-all duration-200 my-1.5 flex items-center justify-center border border-slate-200/40 dark:border-zinc-800"
      >
        {/* First Page Render / Cover Thumbnail */}
        <div className="relative w-full min-h-[300px] max-h-[85vh] flex items-center justify-center bg-zinc-950 overflow-hidden">
          {coverThumbUrl && !coverThumbUrl.startsWith('data:application/pdf') ? (
            <img 
              src={coverThumbUrl} 
              alt={docTitle} 
              className="w-full h-auto max-h-[85vh] object-contain transition-transform duration-300 group-hover:scale-[1.008]" 
              onError={() => {
                console.warn('PDF Cover Thumbnail load failed in Feed, falling back to Canvas/Design Cover...');
                setCoverThumbUrl('');
              }}
            />
          ) : (
            <>
              {/* Maintain the exact same canvas element so its printed buffer state isn't lost on state change */}
              <canvas 
                ref={canvasRef} 
                className={`w-full h-auto max-h-[85vh] object-contain transition-transform duration-300 group-hover:scale-[1.008] ${
                  hasCanvasRendered ? 'block' : 'hidden'
                }`}
              />

              {!hasCanvasRendered && (
                <div className="w-full min-h-[320px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 rounded-2xl text-center flex flex-col items-center justify-center my-auto border border-emerald-500/20">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                    <FileText className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1 line-clamp-2 max-w-sm">
                    {companyName}
                  </h4>
                  <p className="text-xs text-emerald-300/90 font-semibold mb-3 max-w-sm line-clamp-2">
                    {docTitle}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tap to Open Full Catalogue</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Minimal Page Count Tag in Corner */}
          <div className="absolute bottom-3 right-3 bg-black/80 hover:bg-black/95 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-tight flex items-center gap-1.5 shadow-lg border border-white/20 pointer-events-none z-10">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{numPages ? `${numPages} Pages` : 'PDF'} • Tap to View</span>
          </div>

          {/* Loading Indicator */}
          {isRendering && !coverThumbUrl && !hasCanvasRendered && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-white font-medium text-xs z-20">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Loading PDF Catalogue...
            </div>
          )}
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
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(totalPageCount || 1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfError, setPdfError] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'embed'>('canvas');

  useEffect(() => {
    let isMounted = true;
    if (!pdfUrl) return;

    const loadPdfDoc = async () => {
      try {
        setLoading(true);
        setPdfError(false);
        const pdfjsVer = pdfjsLib.version || '6.2.108';
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVer}/cmaps/`,
          cMapPacked: true,
        });

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
          setViewMode('embed');
        }
      }
    };

    loadPdfDoc();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Render current page when page or scale changes
  useEffect(() => {
    let isCancelled = false;
    if (!pdfDoc) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = modalCanvasRef.current;

        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

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
  }, [pdfDoc, currentPage, scale]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between text-white shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate">
              {companyName}
            </h3>
            <p className="text-[10px] text-emerald-300/80 truncate">
              {docTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs mr-2">
            <button 
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${viewMode === 'canvas' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              📄 Page View
            </button>
            <button 
              onClick={() => setViewMode('embed')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${viewMode === 'embed' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              📱 Full Document
            </button>
          </div>

          <a 
            href={pdfUrl} 
            download={`${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalogue.pdf`}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Download</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors border border-red-500/30 cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Page Canvas or Embedded Frame Display */}
      <div className="relative flex-1 w-full max-w-5xl my-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 sm:p-4 overflow-hidden shadow-inner">
        {loading && viewMode === 'canvas' && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-emerald-400 font-bold text-sm">
            <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Rendering PDF Page {currentPage}...
          </div>
        )}

        {pdfError && !pdfUrl.startsWith('data:') ? (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 border border-amber-500/30 rounded-2xl max-w-md my-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
              {companyName}
            </h3>
            <p className="text-xs text-amber-300 font-bold mb-3">
              📄 Catalogue PDF File Unavailable on Server
            </p>
            <p className="text-[11px] text-zinc-300 mb-5 leading-relaxed">
              This catalogue file was saved locally on the previous server session. All new uploaded PDFs are now saved permanently as Base64 Data URLs so they never expire!
            </p>
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Close & Re-upload Catalogue
            </button>
          </div>
        ) : viewMode === 'embed' || !pdfDoc ? (
          <iframe 
            src={pdfUrl.startsWith('data:') ? pdfUrl : (pdfUrl.startsWith('http') ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` : pdfUrl)} 
            className="w-full h-full rounded-xl border border-slate-800 bg-white" 
            title="In-App PDF Reader"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            <canvas 
              ref={modalCanvasRef} 
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-white/10" 
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-white shadow-2xl">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-black tracking-wider px-2 text-emerald-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(prev => Math.max(0.6, prev - 0.2))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-zinc-400 min-w-[45px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale(prev => Math.min(3.0, prev + 0.2))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-zinc-200 transition-colors border border-slate-700 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
