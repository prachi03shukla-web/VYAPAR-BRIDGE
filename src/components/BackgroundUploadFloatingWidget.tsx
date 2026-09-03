import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { backgroundUploader, UploadTask } from '../services/backgroundUploadManager';
import { CheckCircle2, AlertCircle, X, Loader2, CloudUpload } from 'lucide-react';

export const BackgroundUploadFloatingWidget: React.FC = () => {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  useEffect(() => {
    const unsub = backgroundUploader.subscribe((allTasks) => {
      setTasks(allTasks);
    });
    return () => unsub();
  }, []);

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-xs sm:max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {tasks.map((task) => {
          const radius = 18;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (task.progress / 100) * circumference;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl p-3 flex items-center gap-3 transition-all"
            >
              {/* Progress Ring with Thumbnail inside */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                {/* Background Track */}
                <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    className="text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    className={`transition-all duration-300 ease-out ${
                      task.status === 'completed'
                        ? 'text-emerald-500'
                        : task.status === 'error'
                        ? 'text-rose-500'
                        : 'text-blue-500'
                    }`}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                {/* Inner Content: Thumbnail or Icon */}
                <div className="absolute inset-1.5 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {task.previewUrl ? (
                    <img
                      src={task.previewUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <CloudUpload className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {task.type === 'story' ? 'Story / Reel' : 'Vyapar Post'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-400">
                    {task.status === 'completed' ? '100%' : `${task.progress}%`}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {task.status === 'uploading' && 'Uploading to Cloudinary CDN...'}
                  {task.status === 'syncing' && 'Publishing to Network...'}
                  {task.status === 'completed' && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 inline" /> Live on feed & profile!
                    </span>
                  )}
                  {task.status === 'error' && (
                    <span className="text-rose-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 inline" /> {task.errorMessage || 'Upload failed'}
                    </span>
                  )}
                </p>
              </div>

              {/* Dismiss / Close button */}
              <button
                type="button"
                onClick={() => backgroundUploader.removeTask(task.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
