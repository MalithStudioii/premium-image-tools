'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, Upload, Pipette, Copy, Check, Sparkles, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorSwatch {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
}

// Sample presets generated as data URLs for instant testing without external network requests
const SAMPLE_PRESETS = [
  {
    name: 'Cyberpunk Neon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ff007f"/><stop offset="50%" stop-color="%237b2cbf"/><stop offset="100%" stop-color="%2300f5d4"/></linearGradient><circle id="c1" cx="300" cy="200" r="120" fill="%23fee440"/></defs><rect width="600" height="400" fill="url(%23g1)"/><use href="%23c1" opacity="0.85"/></svg>',
  },
  {
    name: 'Sunset Gradient',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23ff4e50"/><stop offset="40%" stop-color="%23f9d423"/><stop offset="80%" stop-color="%23240b36"/><stop offset="100%" stop-color="%231a002c"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g2)"/></svg>',
  },
  {
    name: 'Emerald Forest',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="35%" stop-color="%23059669"/><stop offset="70%" stop-color="%2334d399"/><stop offset="100%" stop-color="%23a7f3d0"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g3)"/></svg>',
  },
];

export default function ColorPalettePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<ColorSwatch[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setIsEyeDropperSupported(true);
    }
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Helper RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Helper RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  // Process image & extract dominant colors using quantization
  const extractPalette = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorCounts: { [key: string]: { count: number; r: number; g: number; b: number } } = {};
    const step = Math.max(1, Math.floor((imageData.length / 4) / 10000)); // Sample ~10k pixels

    for (let i = 0; i < imageData.length; i += 4 * step) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 128) continue; // Skip transparent

      // Quantize colors (bucket to nearest 24)
      const qR = Math.round(r / 24) * 24;
      const qG = Math.round(g / 24) * 24;
      const qB = Math.round(b / 24) * 24;
      const key = `${qR},${qG},${qB}`;

      if (!colorCounts[key]) {
        colorCounts[key] = { count: 0, r, g, b };
      }
      colorCounts[key].count++;
    }

    const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    const totalSamples = sorted.reduce((acc, curr) => acc + curr.count, 0) || 1;

    // Filter distinct colors (Euclidean distance threshold)
    const distinct: ColorSwatch[] = [];
    for (const item of sorted) {
      if (distinct.length >= 8) break;
      const isFarEnough = distinct.every(d => {
        const hex = d.hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const dist = Math.sqrt(Math.pow(item.r - r, 2) + Math.pow(item.g - g, 2) + Math.pow(item.b - b, 2));
        return dist > 45;
      });

      if (isFarEnough || distinct.length === 0) {
        const hex = rgbToHex(item.r, item.g, item.b);
        distinct.push({
          hex,
          rgb: `rgb(${item.r}, ${item.g}, ${item.b})`,
          hsl: rgbToHsl(item.r, item.g, item.b),
          percentage: Math.round((item.count / totalSamples) * 100),
        });
      }
    }

    setSwatches(distinct);
    if (distinct.length > 0) {
      setSelectedColor(distinct[0].hex);
    }
  }, []);

  // Handle image load
  const handleImageSrc = useCallback((src: string) => {
    setImageSrc(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      extractPalette(img);
    };
    img.src = src;
  }, [extractPalette]);

  // Load initial preset
  useEffect(() => {
    handleImageSrc(SAMPLE_PRESETS[0].url);
  }, [handleImageSrc]);

  // File upload handler
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas Mouse Move (Loupe Zoom + Pixel Inspection)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setHoverColor(hex);

      // Render Magnifier Loupe Canvas
      const zoomCanvas = zoomCanvasRef.current;
      if (zoomCanvas) {
        const zoomCtx = zoomCanvas.getContext('2d');
        if (zoomCtx) {
          zoomCtx.imageSmoothingEnabled = false;
          zoomCtx.clearRect(0, 0, 110, 110);
          zoomCtx.drawImage(
            canvas,
            Math.max(0, x - 10),
            Math.max(0, y - 10),
            20, 20,
            0, 0,
            110, 110
          );
          // Target pixel crosshair box in center
          zoomCtx.strokeStyle = '#ffffff';
          zoomCtx.lineWidth = 2;
          zoomCtx.strokeRect(50, 50, 10, 10);
          zoomCtx.strokeStyle = '#000000';
          zoomCtx.lineWidth = 1;
          zoomCtx.strokeRect(49, 49, 12, 12);
        }
      }
    }
  };

  // Click Canvas to pick color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoverColor) {
      setSelectedColor(hoverColor);
    }
  };

  // Browser Native EyeDropper API fallback
  const handleNativeEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-expect-error EyeDropper is supported in modern browsers
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setSelectedColor(result.sRGBHex.toUpperCase());
        }
      } catch {
        // User cancelled or failed
      }
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, formatLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatLabel);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Export palette JSON
  const downloadPaletteJSON = () => {
    const data = JSON.stringify(swatches, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center">
      
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-700 mb-4 shadow-2xs">
          <Palette className="w-4 h-4 text-amber-600" />
          <span>Client-Side Eyedropper & Palette Extractor</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Color Palette <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Extractor</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
          Hover over any pixel to inspect exact colors, or instantly extract dominant color palettes from photos.
        </p>
      </motion.div>

      {/* Preset Sample Selector */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Try Samples:</span>
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleImageSrc(preset.url)}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all shadow-2xs cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Column: Image Canvas & Loupe */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            className="relative w-full bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl overflow-hidden flex items-center justify-center min-h-[380px]"
            onMouseEnter={() => setIsHoveringCanvas(true)}
            onMouseLeave={() => setIsHoveringCanvas(false)}
          >
            {/* Hidden canvas for pixel reading */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rendered Display Canvas */}
            {imageSrc ? (
              <div className="relative cursor-crosshair group flex items-center justify-center max-h-[480px]">
                <img
                  src={imageSrc}
                  alt="Color Inspector target"
                  className="max-h-[450px] w-auto max-w-full rounded-xl object-contain shadow-md touch-none"
                  onMouseMove={(e) => {
                    const img = e.currentTarget;
                    const rect = img.getBoundingClientRect();
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    const x = Math.floor((e.clientX - rect.left) * scaleX);
                    const y = Math.floor((e.clientY - rect.top) * scaleY);

                    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (!ctx) return;

                    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                      const pixel = ctx.getImageData(x, y, 1, 1).data;
                      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
                      setHoverColor(hex);

                      // Update Loupe Canvas
                      const zoomCanvas = zoomCanvasRef.current;
                      if (zoomCanvas) {
                        const zoomCtx = zoomCanvas.getContext('2d');
                        if (zoomCtx) {
                          zoomCtx.imageSmoothingEnabled = false;
                          zoomCtx.clearRect(0, 0, 110, 110);
                          zoomCtx.drawImage(
                            canvas,
                            Math.max(0, x - 10),
                            Math.max(0, y - 10),
                            20, 20,
                            0, 0,
                            110, 110
                          );
                          zoomCtx.strokeStyle = '#ffffff';
                          zoomCtx.lineWidth = 2;
                          zoomCtx.strokeRect(50, 50, 10, 10);
                        }
                      }
                    }
                  }}
                  onTouchStart={(e) => {
                    setIsHoveringCanvas(true);
                    if (e.touches.length === 0) return;
                    const touch = e.touches[0];
                    const img = e.currentTarget;
                    const rect = img.getBoundingClientRect();
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    const x = Math.floor((touch.clientX - rect.left) * scaleX);
                    const y = Math.floor((touch.clientY - rect.top) * scaleY);

                    setMousePos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });

                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (!ctx) return;

                    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                      const pixel = ctx.getImageData(x, y, 1, 1).data;
                      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
                      setHoverColor(hex);
                      setSelectedColor(hex);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length === 0) return;
                    const touch = e.touches[0];
                    const img = e.currentTarget;
                    const rect = img.getBoundingClientRect();
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    const x = Math.floor((touch.clientX - rect.left) * scaleX);
                    const y = Math.floor((touch.clientY - rect.top) * scaleY);

                    setMousePos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });

                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (!ctx) return;

                    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                      const pixel = ctx.getImageData(x, y, 1, 1).data;
                      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
                      setHoverColor(hex);
                      setSelectedColor(hex);

                      // Update Loupe Canvas
                      const zoomCanvas = zoomCanvasRef.current;
                      if (zoomCanvas) {
                        const zoomCtx = zoomCanvas.getContext('2d');
                        if (zoomCtx) {
                          zoomCtx.imageSmoothingEnabled = false;
                          zoomCtx.clearRect(0, 0, 110, 110);
                          zoomCtx.drawImage(
                            canvas,
                            Math.max(0, x - 10),
                            Math.max(0, y - 10),
                            20, 20,
                            0, 0,
                            110, 110
                          );
                          zoomCtx.strokeStyle = '#ffffff';
                          zoomCtx.lineWidth = 2;
                          zoomCtx.strokeRect(50, 50, 10, 10);
                        }
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    setIsHoveringCanvas(false);
                  }}
                  onClick={() => {
                    if (hoverColor) setSelectedColor(hoverColor);
                  }}
                />

                {/* Magnifier Loupe Floating Box */}
                {isHoveringCanvas && hoverColor && (
                  <div
                    className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-4 flex flex-col items-center bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl transition-opacity"
                    style={{ left: mousePos.x, top: mousePos.y }}
                  >
                    <canvas
                      ref={zoomCanvasRef}
                      width={110}
                      height={110}
                      className="rounded-xl border border-slate-700 bg-black"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-2xs"
                        style={{ backgroundColor: hoverColor }}
                      />
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {hoverColor}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">Upload an image to start picking colors</p>
              </div>
            )}
          </div>

          {/* Action Toolbar below Canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />

            {isEyeDropperSupported && (
              <button
                onClick={handleNativeEyeDropper}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Pipette className="w-4 h-4 text-amber-400" />
                <span>Screen Eyedropper</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dominant Swatches & Copy Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Dominant Palette Swatches */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-sm">Dominant Palette</h3>
              </div>
              <button
                onClick={downloadPaletteJSON}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {swatches.map((swatch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(swatch.hex)}
                  className={`group relative flex flex-col items-center rounded-2xl p-2 transition-all cursor-pointer border ${
                    selectedColor === swatch.hex
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 scale-105'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div
                    className="w-full h-12 rounded-xl shadow-inner border border-black/10 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="font-mono text-[10px] font-bold text-gray-700 mt-2 tracking-tighter">
                    {swatch.hex}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">
                    {swatch.percentage}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Inspector Card */}
          {selectedColor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl border border-black/10 shadow-md shrink-0 transition-colors"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Active Color
                  </span>
                  <h2 className="font-mono text-2xl font-black text-gray-900 mt-1">
                    {selectedColor}
                  </h2>
                </div>
              </div>

              {/* Format Copy Rows */}
              <div className="space-y-2.5">
                {[
                  { label: 'HEX', value: selectedColor },
                  {
                    label: 'RGB',
                    value: `rgb(${parseInt(selectedColor.slice(1, 3), 16)}, ${parseInt(
                      selectedColor.slice(3, 5),
                      16
                    )}, ${parseInt(selectedColor.slice(5, 7), 16)})`,
                  },
                  {
                    label: 'HSL',
                    value: rgbToHsl(
                      parseInt(selectedColor.slice(1, 3), 16),
                      parseInt(selectedColor.slice(3, 5), 16),
                      parseInt(selectedColor.slice(5, 7), 16)
                    ),
                  },
                  { label: 'Tailwind', value: `bg-[${selectedColor.toLowerCase()}]` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-gray-400 uppercase w-14">
                        {item.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-800">
                        {item.value}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(item.value, item.label)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-white transition-all cursor-pointer shadow-2xs"
                      title={`Copy ${item.label}`}
                    >
                      {copiedFormat === item.label ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Copy CSS Variables block */}
              <button
                onClick={() => {
                  const cssVars = swatches
                    .map((s, idx) => `--color-${idx + 1}: ${s.hex};`)
                    .join('\n');
                  copyToClipboard(cssVars, 'CSS Vars');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {copiedFormat === 'CSS Vars' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied CSS Variables!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy All Palette CSS Variables</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

        </div>

      </div>

    </main>
  );
}
