import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
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

// Configure pdfjs worker source dynamically using matching pdfjsLib.version
try {
  const pdfjsVer = pdfjsLib.version || '6.2.108';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVer}/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF Worker Init note:', e);
}

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
  const pdfUrl = post.mediaUrl || post.pdfUrl || '';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<boolean>(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState<boolean>(false);

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

  const locationText = [post.user?.city, post.user?.state].filter(Boolean).join(', ');

  // Load and render Page 1 as thumbnail canvas
  useEffect(() => {
    let isCancelled = false;

    if (!pdfUrl) {
      setIsRendering(false);
      setRenderError(true);
      return;
    }

    const renderFirstPage = async () => {
      try {
        setIsRendering(true);
        setRenderError(false);

        // Load PDF Document
        const pdfjsVer = pdfjsLib.version || '6.2.108';
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
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
        setIsRendering(false);
      } catch (err) {
        if (!isCancelled) {
          console.warn('PDF Canvas Render Note (falling back to vector cover):', err);
          setRenderError(true);
          setIsRendering(false);
        }
      }
    };

    renderFirstPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalogue.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: docTitle,
        text: `Check out ${companyName}'s official PDF catalogue on Vyapar Bridge!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(pdfUrl || window.location.href);
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
          {post.thumbnailUrl ? (
            <img src={post.thumbnailUrl} alt={docTitle} className="w-full h-full object-cover" />
          ) : !renderError ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 p-1">
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-md rounded-sm" />
            </div>
          ) : (
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
            pdfUrl={pdfUrl} 
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
        className="w-full bg-slate-950 text-white rounded-xl overflow-hidden border border-slate-800 shadow-xl cursor-pointer group hover:border-emerald-500/50 transition-all duration-300 my-2"
      >
        {/* Header Ribbon - Company Identification */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white uppercase truncate">
                  {companyName}
                </span>
                {post.user?.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400/20" />
                )}
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium truncate flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                Official Company PDF Catalogue
                {locationText && <span className="opacity-60">• {locationText}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {numPages ? `${numPages} Pages` : 'PDF'}
            </span>
          </div>
        </div>

        {/* First Page Render / Custom Thumbnail Cover Area */}
        <div className="relative w-full min-h-[380px] max-h-[520px] bg-slate-900/90 flex items-center justify-center p-4 overflow-hidden group">
          {post.thumbnailUrl ? (
            <div className="relative max-h-[480px] w-full h-[400px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 border border-emerald-500/30">
              <img 
                src={post.thumbnailUrl} 
                alt={docTitle} 
                className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-300" 
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-emerald-400/40 z-10">
                <FileCheck className="w-3.5 h-3.5 text-emerald-200" /> CATALOGUE COVER
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : !renderError ? (
            <div className="relative max-h-[480px] w-auto max-w-full flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="max-h-[460px] max-w-full object-contain rounded-md shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-300"
              />
              {/* Subtle Document Gloss Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none rounded-md" />
            </div>
          ) : (
            // Styled Graphic Document Fallback
            <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-emerald-500/30 shadow-2xl text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
                <FileText className="w-10 h-10" />
              </div>
              <h4 className="text-base font-black text-white uppercase tracking-wider mb-1 line-clamp-2">
                {companyName}
              </h4>
              <p className="text-xs text-emerald-300/90 font-medium mb-4 line-clamp-2">
                {docTitle}
              </p>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Business Document
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Loading Catalogue Preview...
            </div>
          )}

          {/* Center Play/Read Hover Callout */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-full shadow-2xl border border-emerald-300/50 flex items-center gap-2 text-xs tracking-wide transform group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" /> Click to Open & Read PDF Online
            </div>
          </div>
        </div>

        {/* Footer Bar - Action Controls */}
        <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-zinc-200 truncate max-w-[220px] sm:max-w-[320px]">
              {docTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsReaderModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg border border-emerald-400/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read Online</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {isReaderModalOpen && (
        <PdfReaderModal 
          pdfUrl={pdfUrl} 
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
  const [viewMode, setViewMode] = useState<'canvas' | 'embed'>('canvas');

  useEffect(() => {
    let isMounted = true;
    if (!pdfUrl) return;

    const loadPdfDoc = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
        // Fallback to embed view inside modal
        setViewMode('embed');
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

        {viewMode === 'embed' || !pdfDoc ? (
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
