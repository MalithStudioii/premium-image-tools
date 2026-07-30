'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  EyeOff,
  Square,
  Sparkle,
  Undo2,
  Trash2,
  CheckCircle2,
  FileImage,
  ShieldAlert,
} from 'lucide-react';

interface BlurRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mode: 'blur' | 'blackout';
  blurRadius: number;
}

export default function BlurSensitivePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Controls
  const [mode, setMode] = useState<'blur' | 'blackout'>('blur');
  const [blurRadius, setBlurRadius] = useState<number>(15);
  const [exportFormat, setExportFormat] = useState<string>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.9);

  // Regions State
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        setImageSrc(src);

        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          setRegions([]);
        };
        img.src = src;
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
    },
    multiple: false,
  });

  // Render Redacted Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageDimensions) return;

    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Original Base Image
    ctx.drawImage(img, 0, 0);

    // Apply Saved Regions
    regions.forEach((r) => {
      if (r.mode === 'blackout') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(r.x, r.y, r.width, r.height);
      } else if (r.mode === 'blur') {
        // Pixelate blur technique
        const factor = Math.max(2, r.blurRadius);
        const sampleW = Math.max(1, Math.floor(r.width / factor));
        const sampleH = Math.max(1, Math.floor(r.height / factor));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = sampleW;
        offCanvas.height = sampleH;
        const offCtx = offCanvas.getContext('2d');

        if (offCtx) {
          offCtx.imageSmoothingEnabled = false;
          offCtx.drawImage(img, r.x, r.y, r.width, r.height, 0, 0, sampleW, sampleH);

          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offCanvas, 0, 0, sampleW, sampleH, r.x, r.y, r.width, r.height);
        }
      }
    });

    // Draw Current Active Dragging Rectangle Preview
    if (currentRect && isDrawing) {
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = mode === 'blackout' ? '#ef4444' : '#3b82f6';
      ctx.fillStyle = mode === 'blackout' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  }, [imageDimensions, regions, currentRect, isDrawing, mode]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Canvas Mouse & Touch Event Handlers
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    setStartPos(coords);
    setIsDrawing(true);
    setCurrentRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };

  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !startPos) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const x = Math.min(startPos.x, coords.x);
    const y = Math.min(startPos.y, coords.y);
    const width = Math.abs(coords.x - startPos.x);
    const height = Math.abs(coords.y - startPos.y);

    setCurrentRect({ x, y, width, height });
  };

  const handleEnd = () => {
    if (isDrawing && currentRect && currentRect.width > 5 && currentRect.height > 5) {
      const newRegion: BlurRegion = {
        id: Date.now().toString(),
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.width,
        height: currentRect.height,
        mode: mode,
        blurRadius: blurRadius,
      };
      setRegions((prev) => [...prev, newRegion]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  // Actions
  const handleUndo = () => {
    setRegions((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setRegions([]);
  };

  const resetAll = () => {
    setFile(null);
    setImageSrc(null);
    setImageDimensions(null);
    setRegions([]);
  };

  // Download Output
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL(exportFormat, exportQuality);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `redacted-image.${exportFormat.split('/')[1]}`;
    link.click();
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-700 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> Privacy Censorship & Selective Blur
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Blur & <span className="text-rose-600">Redact</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-base">
          Blur sensitive info (faces, phone numbers, ID cards, addresses) or apply solid black redaction bars.
        </p>
      </div>

      {!imageSrc ? (
        /* Upload Zone */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 bg-white/70 backdrop-blur-xs ${
            isDragActive
              ? 'border-rose-500 bg-rose-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-rose-400 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop your image here...' : 'Drag & drop an image to blur'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Supports PNG, JPG, WEBP and BMP
          </p>
          <button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl shadow-md shadow-rose-500/20 transition-all duration-200 cursor-pointer">
            Select File from Device
          </button>
        </div>
      ) : (
        /* Processing Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-600" />
                <h2 className="font-bold text-gray-900 text-lg">Redact Tools</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Censorship Mode */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Redaction Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('blur')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'blur'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <EyeOff className="w-4 h-4" /> Pixelate Blur
                </button>
                <button
                  onClick={() => setMode('blackout')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'blackout'
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Square className="w-4 h-4" /> Blackout
                </button>
              </div>
            </div>

            {/* Blur Intensity Slider */}
            {mode === 'blur' && (
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2 text-gray-700">
                  <span>Blur Intensity</span>
                  <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                    {blurRadius} px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            )}

            {/* Region History Controls */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleUndo}
                disabled={regions.length === 0}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Undo2 className="w-4 h-4" /> Undo ({regions.length})
              </button>
              <button
                onClick={handleClearAll}
                disabled={regions.length === 0}
                className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
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
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Box */}
            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-800 space-y-1">
              <span className="font-bold flex items-center gap-1">
                💡 How to use:
              </span>
              <p>Click or touch & drag over any area on the image canvas to apply blur or blackout redaction.</p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition-all duration-200 cursor-pointer"
            >
              <Download className="w-5 h-5" /> Download Redacted Image
            </button>

          </div>

          {/* Drawing Canvas */}
          <div className="lg:col-span-2 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="relative w-full max-h-[550px] overflow-auto rounded-2xl bg-gray-900 flex items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onTouchCancel={handleEnd}
                className="max-w-full max-h-[500px] object-contain cursor-crosshair rounded-lg shadow-lg touch-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium text-center">
              Drag mouse or finger on image to draw redaction box • {regions.length} region(s) applied
            </p>
          </div>

        </div>
      )}

    </main>
  );
}
