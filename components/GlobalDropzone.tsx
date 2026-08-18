'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, Sparkles, Wand2, Minimize2, Crop, Scaling, EyeOff, Palette, Smile, X, FileImage 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalDropzone({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setDroppedFile(file);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  const launchTool = (route: string) => {
    if (droppedFile) {
      // Save temp file data in sessionStorage or URL if needed
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            sessionStorage.setItem('global_dropped_image', e.target.result as string);
          } catch (err) {
            console.warn('File too large for sessionStorage fallback', err);
          }
        }
        setDroppedFile(null);
        router.push(route);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      router.push(route);
    }
  };

  const tools = [
    { name: 'Photo Studio', route: '/photo-editor', icon: Wand2, color: 'from-violet-500 to-purple-600', badge: 'Pro FX' },
    { name: 'Compressor', route: '/compress', icon: Minimize2, color: 'from-blue-500 to-indigo-600', badge: 'Fast' },
    { name: 'Cropper', route: '/crop', icon: Crop, color: 'from-purple-500 to-pink-600', badge: 'Presets' },
    { name: 'Resizer', route: '/resize', icon: Scaling, color: 'from-emerald-500 to-teal-600', badge: 'HD Quality' },
    { name: 'Blur & Redact', route: '/blur-sensitive', icon: EyeOff, color: 'from-rose-500 to-red-600', badge: 'Privacy' },
    { name: 'Color Palette', route: '/color-palette', icon: Palette, color: 'from-amber-500 to-orange-600', badge: 'HEX/RGB' },
    { name: 'Meme Studio', route: '/meme-generator', icon: Smile, color: 'from-indigo-500 to-blue-600', badge: 'Text' },
  ];

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Dragging Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-md bg-gray-950/80 border-4 border-dashed border-indigo-500/80 flex flex-col items-center justify-center p-6 text-white"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center text-center max-w-md pointer-events-none"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 animate-pulse">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Drop Image Anywhere</h2>
              <p className="text-gray-300 text-sm">Release your image to select a processing tool instantly</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Tool Selection Modal after drop */}
      <AnimatePresence>
        {droppedFile && (
          <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setDroppedFile(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileImage className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Image Uploaded Successfully</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-sm">
                    {droppedFile.name} ({(droppedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Select which tool you want to launch with this image:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {tools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.route}
                      onClick={() => launchTool(t.route)}
                      className="group flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-gray-800 dark:text-gray-200 hover:text-white transition-all duration-200 text-left border border-gray-200/60 dark:border-gray-700/60 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block group-hover:text-white">{t.name}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-indigo-100 block">{t.badge}</span>
                        </div>
                      </div>
                      <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
