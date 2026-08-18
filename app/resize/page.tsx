'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  Download,
  Sliders,
  Sparkles,
  Scaling,
  Link as LinkIcon,
  Unlink,
  FileImage,
  Loader2,
} from 'lucide-react';

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Resize Controls
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<string>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.9);

  // Output State
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedBytes, setResizedBytes] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // File size formatter
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setOriginalUrl(url);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setOriginalDimensions({ width: w, height: h });
        setTargetWidth(w);
        setTargetHeight(h);
        setAspectRatio(w / h);
      };
      img.src = url;
      setResizedUrl(null);
      setResizedBytes(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
    },
    multiple: false,
  });

  // Handle Width change
  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetHeight(Math.round(w / aspectRatio));
    }
  };

  // Handle Height change
  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetWidth(Math.round(h * aspectRatio));
    }
  };

  // Handle Percentage Presets
  const applyPercentagePreset = (pct: number) => {
    if (originalDimensions) {
      const newW = Math.round((originalDimensions.width * pct) / 100);
      const newH = Math.round((originalDimensions.height * pct) / 100);
      setTargetWidth(newW);
      setTargetHeight(newH);
    }
  };

  // Execute Canvas Resize
  const executeResize = useCallback(() => {
    if (!originalUrl || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL(exportFormat, exportQuality);
        setResizedUrl(dataUrl);

        // Estimate size from Base64 string length
        const base64Str = dataUrl.split(',')[1];
        if (base64Str) {
          const decodedLength = window.atob(base64Str).length;
          setResizedBytes(decodedLength);
        }
      }
      setIsProcessing(false);
    };
    img.src = originalUrl;
  }, [originalUrl, targetWidth, targetHeight, exportFormat, exportQuality]);

  // Debounced auto-resize on control updates
  useEffect(() => {
    if (originalUrl && targetWidth > 0 && targetHeight > 0) {
      const timer = setTimeout(() => {
        executeResize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetWidth, targetHeight, exportFormat, exportQuality, executeResize, originalUrl]);

  const resetAll = () => {
    setFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setOriginalDimensions(null);
    setResizedUrl(null);
    setResizedBytes(null);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Page Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> High Quality Image Resizing & Scaling
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Image <span className="text-emerald-600">Resizer</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-base">
          Resize image dimensions (width & height in pixels or percentage) while maintaining sharp quality.
        </p>
      </div>

      {!file || !originalDimensions ? (
        /* Upload Zone */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 bg-white/70 backdrop-blur-xs ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-emerald-400 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop your image here...' : 'Drag & drop an image to resize'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Supports PNG, JPG, WEBP and BMP
          </p>
          <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer">
            Select File from Device
          </button>
        </div>
      ) : (
        /* Workspace Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-gray-900 text-lg">Resize Options</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Percentage Quick Presets */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Quick Percentage Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => applyPercentagePreset(pct)}
                    className="py-2 text-xs font-bold rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 transition-all cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Pixel Inputs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Custom Dimensions (Pixels)
                </label>
                <button
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  title={lockAspectRatio ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    lockAspectRatio
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {lockAspectRatio ? (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" /> Locked
                    </>
                  ) : (
                    <>
                      <Unlink className="w-3.5 h-3.5" /> Unlocked
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-1">Width (px)</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-1">Height (px)</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'PNG', value: 'image/png' },
                  { label: 'JPG', value: 'image/jpeg' },
                  { label: 'WEBP', value: 'image/webp' },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setExportFormat(fmt.value)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      exportFormat === fmt.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Badge Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-extrabold text-lg mb-1">
                <Scaling className="w-5 h-5 text-emerald-600" />
                <span>{targetWidth} × {targetHeight} px</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Original: {originalDimensions.width} × {originalDimensions.height} px
              </p>
            </div>

            {/* Download Button */}
            {resizedUrl && (
              <a
                href={resizedUrl}
                download={`resized-${targetWidth}x${targetHeight}.${exportFormat.split('/')[1]}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
              >
                <Download className="w-5 h-5" /> Download Resized Image
              </a>
            )}

          </div>

          {/* Side-by-Side Preview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-emerald-600" /> Dimension Preview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
              
              {/* Original */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative border border-gray-200/80 mb-3 shadow-inner">
                  {originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Original
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              {/* Resized */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative border border-gray-200/80 mb-3 shadow-inner">
                  {isProcessing ? (
                    <div className="flex flex-col items-center text-emerald-600 gap-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-semibold text-gray-500">Resizing...</span>
                    </div>
                  ) : resizedUrl ? (
                    <img
                      src={resizedUrl}
                      alt="Resized"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                  
                  {!isProcessing && (
                    <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      Resized
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-600">
                    {targetWidth} × {targetHeight} px
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {resizedBytes ? formatBytes(resizedBytes) : 'Calculating...'}
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>Client-side HTML5 Canvas scaling</span>
              <button
                onClick={resetAll}
                className="text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                Upload another image
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
