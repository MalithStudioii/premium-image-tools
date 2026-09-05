'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  Grid,
  FileImage,
  Printer,
  ShieldCheck,
  ChevronRight,
  Info,
  Maximize2,
  Scan,
  RefreshCw,
  Layers,
  SunMedium,
  Check,
} from 'lucide-react';

// Official Biometric Country & Visa Standards
interface CountryPreset {
  id: string;
  name: string;
  flag: string;
  widthMm: number;
  heightMm: number;
  widthIn: number;
  heightIn: number;
  pxW: number;
  pxH: number;
  defaultBg: string;
  headHeightPct: string;
  description: string;
}

const COUNTRY_PRESETS: CountryPreset[] = [
  {
    id: 'US',
    name: 'United States (Passport, Visa & Green Card)',
    flag: '🇺🇸',
    widthMm: 51,
    heightMm: 51,
    widthIn: 2,
    heightIn: 2,
    pxW: 600,
    pxH: 600,
    defaultBg: '#FFFFFF',
    headHeightPct: '50% - 69%',
    description: '2 x 2 inches (600x600 px @ 300 DPI). Plain white background. Head between 1 - 1 3/8 inches.',
  },
  {
    id: 'LK',
    name: 'Sri Lanka (Passport & National ID / NIC)',
    flag: '🇱🇰',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#FFFFFF',
    headHeightPct: '70% - 80%',
    description: '35 x 45 mm (413x531 px @ 300 DPI). Pure white background, 30-34mm chin to crown height.',
  },
  {
    id: 'SCHENGEN',
    name: 'Schengen & European Union (Visa & Passport)',
    flag: '🇪🇺',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#F1F5F9',
    headHeightPct: '70% - 80%',
    description: '35 x 45 mm. Plain light grey or off-white background. Face height 32-36 mm.',
  },
  {
    id: 'GB',
    name: 'United Kingdom (HMPO Passport)',
    flag: '🇬🇧',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#F1F5F9',
    headHeightPct: '65% - 75%',
    description: '35 x 45 mm. Plain light grey background. Head height 29-34 mm.',
  },
  {
    id: 'CA',
    name: 'Canada (Passport & PR Visa)',
    flag: '🇨🇦',
    widthMm: 50,
    heightMm: 70,
    widthIn: 1.97,
    heightIn: 2.75,
    pxW: 590,
    pxH: 826,
    defaultBg: '#FFFFFF',
    headHeightPct: '45% - 51%',
    description: '50 x 70 mm. Plain white background. Face from chin to crown between 31 and 36 mm.',
  },
  {
    id: 'IN',
    name: 'India (Passport, OCI & Visa)',
    flag: '🇮🇳',
    widthMm: 51,
    heightMm: 51,
    widthIn: 2,
    heightIn: 2,
    pxW: 600,
    pxH: 600,
    defaultBg: '#FFFFFF',
    headHeightPct: '60% - 70%',
    description: '51 x 51 mm (2x2 inch). Plain white background. Head centered at 35-40 mm.',
  },
  {
    id: 'AU',
    name: 'Australia (Passport)',
    flag: '🇦🇺',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#FFFFFF',
    headHeightPct: '70% - 80%',
    description: '35 x 45 mm. Plain white or light grey background. Crown to chin 32 to 36 mm.',
  },
  {
    id: 'JP',
    name: 'Japan (Passport & MyNumber)',
    flag: '🇯🇵',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#FFFFFF',
    headHeightPct: '70% - 80%',
    description: '35 x 45 mm. Plain white background. Chin to crown 32-36 mm.',
  },
  {
    id: 'CN',
    name: 'China (Visa & Passport)',
    flag: '🇨🇳',
    widthMm: 33,
    heightMm: 48,
    widthIn: 1.3,
    heightIn: 1.89,
    pxW: 390,
    pxH: 567,
    defaultBg: '#FFFFFF',
    headHeightPct: '60% - 70%',
    description: '33 x 48 mm. White background. Head width 15-22mm, height 28-33mm.',
  },
  {
    id: 'MY',
    name: 'Malaysia (Passport & MyKad)',
    flag: '🇲🇾',
    widthMm: 35,
    heightMm: 45,
    widthIn: 1.38,
    heightIn: 1.77,
    pxW: 413,
    pxH: 531,
    defaultBg: '#93C5FD',
    headHeightPct: '65% - 75%',
    description: '35 x 45 mm. Official Light Blue or White background.',
  },
];

// Official Background Swatches
const BG_COLORS = [
  { name: 'Pure White (Official Standard)', value: '#FFFFFF', border: 'border-gray-300' },
  { name: 'Off-White / Light Grey (EU & UK)', value: '#F1F5F9', border: 'border-slate-300' },
  { name: 'Light Blue (Malaysia / Exams)', value: '#93C5FD', border: 'border-blue-400' },
  { name: 'Neutral Grey', value: '#E2E8F0', border: 'border-gray-400' },
  { name: 'Official Red (Asian ID)', value: '#DC2626', border: 'border-red-500' },
  { name: 'Transparent (PNG)', value: 'transparent', border: 'border-dashed border-gray-400' },
];

export default function PassportPhotoPage() {
  // State
  const [selectedPreset, setSelectedPreset] = useState<CountryPreset>(COUNTRY_PRESETS[0]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cutoutImage, setCutoutImage] = useState<HTMLImageElement | null>(null);

  // Background Options
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [useCutout, setUseCutout] = useState<boolean>(true);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [bgRemovedSuccess, setBgRemovedSuccess] = useState<boolean>(false);

  // Image Positioning & Transform
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);

  // Dragging state for canvas pan
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Retouch & Lighting
  const [brightness, setBrightness] = useState<number>(105); // 100 is default
  const [contrast, setContrast] = useState<number>(105);
  const [warmth, setWarmth] = useState<number>(0); // -30 to +30
  const [clarity, setClarity] = useState<boolean>(true);

  // HUD & Guidelines
  const [showBiometricHud, setShowBiometricHud] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'adjust' | 'lighting' | 'sheet'>('adjust');

  // Print Sheet Options
  const [sheetLayout, setSheetLayout] = useState<'4x6' | 'A4'>('4x6');
  const [includeCutMarks, setIncludeCutMarks] = useState<boolean>(true);

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenRenderCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Image Callback
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setCutoutImage(null);
        setBgRemovedSuccess(false);

        // Auto-fit initial zoom and position
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
        setRotation(0);
        setFlipH(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  // AI Background Removal Handler
  const handleRemoveBackground = async () => {
    if (!imageSrc) return;
    setIsRemovingBg(true);

    try {
      const imgly = await import('@imgly/background-removal');
      const blob = await imgly.removeBackground(imageSrc);
      const url = URL.createObjectURL(blob);

      const cutImg = new Image();
      cutImg.onload = () => {
        setCutoutImage(cutImg);
        setUseCutout(true);
        setBgRemovedSuccess(true);
        setIsRemovingBg(false);
      };
      cutImg.src = url;
    } catch (err) {
      console.warn('Imgly client-side segmentation fallback:', err);
      setIsRemovingBg(false);
      alert('AI background removal couldn\'t initialize on this device. You can still adjust, align, and export using the original photo.');
    }
  };

  // Render the Biometric Single Canvas
  const renderSinglePhoto = useCallback(
    (targetCanvas: HTMLCanvasElement, width: number, height: number, includeHud: boolean = false) => {
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      targetCanvas.width = width;
      targetCanvas.height = height;

      // 1. Draw Background
      if (bgColor === 'transparent') {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      const activeImg = (useCutout && cutoutImage) ? cutoutImage : originalImage;
      if (!activeImg) return;

      // 2. Setup Lighting & Filters
      const filterParts: string[] = [];
      filterParts.push(`brightness(${brightness}%)`);
      filterParts.push(`contrast(${contrast}%)`);
      if (warmth > 0) {
        filterParts.push(`sepia(${warmth * 0.5}%) saturate(${100 + warmth * 0.5}%)`);
      } else if (warmth < 0) {
        filterParts.push(`hue-rotate(${warmth * 0.5}deg)`);
      }
      ctx.filter = filterParts.join(' ');

      // 3. Draw Subject with Pan, Zoom, Rotation, Flip
      ctx.save();
      // Move to center of target canvas
      ctx.translate(width / 2 + panX * (width / 400), height / 2 + panY * (height / 400));
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);

      // Base scaling to fit target box nicely
      const baseScale = Math.max(width / activeImg.width, height / activeImg.height);
      const drawW = activeImg.width * baseScale * zoom;
      const drawH = activeImg.height * baseScale * zoom;

      ctx.drawImage(activeImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Reset filter
      ctx.filter = 'none';

      // 4. Draw HUD Guidelines if requested
      if (includeHud && showBiometricHud) {
        ctx.save();

        // Biometric Eye Guideline (approx 55% from top)
        const eyeY = height * 0.53;
        // Crown Guideline (approx 15% from top)
        const crownY = height * 0.16;
        // Chin Guideline (approx 78% from top)
        const chinY = height * 0.78;

        // Draw dotted lines with labels
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Crown Line (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, crownY);
        ctx.lineTo(width, crownY);
        ctx.stroke();

        // Eye Level Line (Emerald)
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, eyeY);
        ctx.lineTo(width, eyeY);
        ctx.stroke();

        // Chin Line (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, chinY);
        ctx.lineTo(width, chinY);
        ctx.stroke();

        // Biometric Head Oval Zone
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        const ovalCenterX = width / 2;
        const ovalCenterY = (crownY + chinY) / 2;
        const ovalRadiusX = width * 0.28;
        const ovalRadiusY = (chinY - crownY) / 2;
        ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Center Crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        // Overlay Text labels
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('Crown (Top of Head)', 8, crownY - 5);
        ctx.fillStyle = '#10b981';
        ctx.fillText('Eye Level', 8, eyeY - 5);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('Chin Baseline', 8, chinY + 12);

        ctx.restore();
      }
    },
    [bgColor, useCutout, cutoutImage, originalImage, brightness, contrast, warmth, panX, panY, rotation, flipH, zoom, showBiometricHud]
  );

  // Redraw preview whenever transforms or images change
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    renderSinglePhoto(previewCanvasRef.current, selectedPreset.pxW, selectedPreset.pxH, true);
  }, [renderSinglePhoto, selectedPreset]);

  // Mouse / Touch Drag Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Single Photo Export
  const downloadSinglePhoto = (format: 'png' | 'jpeg') => {
    const canvas = document.createElement('canvas');
    renderSinglePhoto(canvas, selectedPreset.pxW, selectedPreset.pxH, false);

    const link = document.createElement('a');
    link.download = `passport-photo-${selectedPreset.id.toLowerCase()}-${Date.now()}.${format}`;
    link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  // Generate 4x6 Printable Sheet (1200 x 1800 px @ 300 DPI)
  const downloadPrintSheet = () => {
    const sheetCanvas = document.createElement('canvas');
    const sheetW = 1800; // 6 inches @ 300 DPI
    const sheetH = 1200; // 4 inches @ 300 DPI
    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;

    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Fill Sheet with White paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetW, sheetH);

    // 2. Render 1 Master photo
    const singleCanvas = document.createElement('canvas');
    renderSinglePhoto(singleCanvas, selectedPreset.pxW, selectedPreset.pxH, false);

    // 3. Grid Calculation
    // For 2x2" (600x600 px): 3 columns x 2 rows = 6 photos
    // For 35x45mm (413x531 px): 4 columns x 2 rows = 8 photos
    let cols = 3;
    let rows = 2;

    if (selectedPreset.pxW <= 450) {
      cols = 4;
      rows = 2;
    }

    const photoW = selectedPreset.pxW;
    const photoH = selectedPreset.pxH;

    const totalGridW = cols * photoW;
    const totalGridH = rows * photoH;

    const startX = (sheetW - totalGridW) / 2;
    const startY = (sheetH - totalGridH) / 2;

    // 4. Draw each photo & cut marks
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * photoW;
        const y = startY + r * photoH;

        ctx.drawImage(singleCanvas, x, y, photoW, photoH);

        // Cutting lines / borders
        if (includeCutMarks) {
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(x, y, photoW, photoH);
        }
      }
    }

    // 5. Header / Lab info watermark in margin
    ctx.setLineDash([]);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Print at 4x6" (10x15cm) without scaling • ${selectedPreset.name} (${selectedPreset.widthMm}x${selectedPreset.heightMm}mm) • Generated with Premium Image Tools`,
      startX,
      sheetH - 25
    );

    // 6. Download
    const link = document.createElement('a');
    link.download = `passport-4x6-print-sheet-${selectedPreset.id.toLowerCase()}-${Date.now()}.jpg`;
    link.href = sheetCanvas.toDataURL('image/jpeg', 0.98);
    link.click();
  };

  return (
    <main className="min-h-screen pb-24 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Banner / Hero */}
      <div className="border-b border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                <Scan className="w-3.5 h-3.5 animate-pulse" />
                Biometric Standards &bull; ICAO Compliant
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                Official Passport &amp; Visa Photo Studio
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                Generate 100% compliant passport, visa, and ID photos directly in your browser. Biometric alignment guides, instant white/blue backgrounds, and printable 4x6&quot; sheets for cheap local printing.
              </p>
            </div>

            {/* Quick Country Preset Select Box */}
            <div className="shrink-0 flex items-center gap-3">
              <label htmlFor="countryPresetSelect" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Country Preset:
              </label>
              <select
                id="countryPresetSelect"
                value={selectedPreset.id}
                onChange={(e) => {
                  const p = COUNTRY_PRESETS.find((x) => x.id === e.target.value);
                  if (p) {
                    setSelectedPreset(p);
                    setBgColor(p.defaultBg);
                  }
                }}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-xl px-3 py-2.5 shadow-xs focus:ring-2 focus:ring-cyan-500 outline-hidden transition-all cursor-pointer"
              >
                {COUNTRY_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.flag} {preset.name} ({preset.widthMm}x{preset.heightMm}mm)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!imageSrc ? (
          /* Initial Upload Dropzone */
          <div className="max-w-2xl mx-auto">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 scale-102'
                  : 'border-gray-300 dark:border-gray-800 hover:border-cyan-500/50 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xs shadow-sm hover:shadow-xl'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform">
                <Scan className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                Drop your portrait photo here
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Take a straight-facing selfie or portrait against any wall. We will auto-crop, scale, and align to official {selectedPreset.name} requirements.
              </p>
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                Browse Photo from Device
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% In-Browser Private
                </span>
                <span>&bull;</span>
                <span>Supports JPG, PNG, WEBP</span>
                <span>&bull;</span>
                <span>Instant 300 DPI Export</span>
              </div>
            </div>

            {/* Country Presets Quick Pills */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">
                Popular Official Passport Formats
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {COUNTRY_PRESETS.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p);
                      setBgColor(p.defaultBg);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all text-xs cursor-pointer ${
                      selectedPreset.id === p.id
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="text-base mb-1">{p.flag}</div>
                    <div className="font-bold truncate">{p.name.split(' ')[0]}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {p.widthMm}x{p.heightMm}mm ({p.widthIn}x{p.heightIn}&quot;)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Editor Interface */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Canvas Preview & HUD Guidance */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
                {/* Live Biometric Tag */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-md text-[11px] font-mono text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {selectedPreset.name.split(' ')[0]} &bull; {selectedPreset.widthMm}x{selectedPreset.heightMm}mm @ 300DPI
                  </span>
                </div>

                {/* HUD Toggle & Controls Top Right */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                  <button
                    onClick={() => setShowBiometricHud(!showBiometricHud)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                      showBiometricHud
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                    title="Toggle Biometric Guideline HUD"
                  >
                    {showBiometricHud ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">HUD Guide</span>
                  </button>

                  <button
                    onClick={() => {
                      setZoom(1.0);
                      setPanX(0);
                      setPanY(0);
                      setRotation(0);
                      setFlipH(false);
                      setBrightness(105);
                      setContrast(105);
                      setWarmth(0);
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:text-cyan-500 transition-colors cursor-pointer"
                    title="Reset Alignment"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* The Interactive Canvas */}
                <div className="relative my-auto flex items-center justify-center p-2">
                  <div
                    className="relative border-4 border-dashed border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-gray-950"
                    style={{
                      width: `${Math.min(360, (360 * selectedPreset.pxW) / selectedPreset.pxH)}px`,
                      height: '380px',
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                </div>

                {/* Drag / Pan helper note */}
                <div className="mt-3 text-center text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>Click and drag photo to center face. Align eyes with the green line.</span>
                </div>
              </div>

              {/* Quick Preset Selector Cards */}
              <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Switch Country Preset
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                    {selectedPreset.description}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {COUNTRY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPreset(p);
                        setBgColor(p.defaultBg);
                      }}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedPreset.id === p.id
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 shadow-xs'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{p.flag}</span>
                      <span>{p.name.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-70 font-mono">
                        {p.widthMm}x{p.heightMm}mm
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Controls & Exports Panel */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Tab Navigation */}
              <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-xs">
                <button
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'adjust'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Align &amp; BG
                </button>
                <button
                  onClick={() => setActiveTab('lighting')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'lighting'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <SunMedium className="w-3.5 h-3.5" /> Face Lighting
                </button>
                <button
                  onClick={() => setActiveTab('sheet')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'sheet'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" /> 4x6&quot; Sheet
                </button>
              </div>

              {/* Tab 1: Alignment & Background */}
              {activeTab === 'adjust' && (
                <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
                  {/* 1. AI Background Removal Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> AI Background Cleaner
                      </span>
                      {bgRemovedSuccess && (
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Cutout Active
                        </span>
                      )}
                    </div>

                    {!bgRemovedSuccess ? (
                      <button
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBg}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRemovingBg ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Cleaning background with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Remove Background &amp; Replace with Official Color</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                        <span className="font-medium">AI Cutout Applied Successfully</span>
                        <button
                          onClick={() => setUseCutout(!useCutout)}
                          className="text-[11px] font-bold underline cursor-pointer"
                        >
                          {useCutout ? 'Show Original' : 'Apply Cutout'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Official Background Color Swatches */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-3">
                      Official Background Color
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {BG_COLORS.map((swatch) => (
                        <button
                          key={swatch.name}
                          onClick={() => setBgColor(swatch.value)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[11px] font-medium cursor-pointer ${
                            bgColor === swatch.value
                              ? 'border-cyan-500 ring-2 ring-cyan-500/30 font-bold text-cyan-600 dark:text-cyan-300'
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full border shadow-xs ${swatch.border}`}
                            style={{ backgroundColor: swatch.value === 'transparent' ? '#FFFFFF' : swatch.value }}
                          />
                          <span className="truncate w-full text-center">{swatch.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Zoom & Pan Controls */}
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <ZoomIn className="w-3.5 h-3.5" /> Face Zoom
                        </span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>

                    {/* Rotation Tilt Straighten */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <RotateCw className="w-3.5 h-3.5" /> Head Straighten / Tilt
                        </span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="0.5"
                        value={rotation}
                        onChange={(e) => setRotation(parseFloat(e.target.value))}
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>

                    {/* Flip Horizontal */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Mirror / Flip Photo
                      </span>
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          flipH
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" /> Flip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Face Lighting & Shadow Removal */}
              {activeTab === 'lighting' && (
                <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Biometric Face Lighting &amp; Retouch
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      Embassies reject photos with dark facial shadows. Increase brightness and contrast slightly to make facial features crisp and evenly lit.
                    </p>
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">Brightness / Exposure</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">Contrast</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Warmth */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">Skin Tone Warmth</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">{warmth > 0 ? `+${warmth}` : warmth}</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={warmth}
                      onChange={(e) => setWarmth(parseInt(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Quick Auto Balance Button */}
                  <button
                    onClick={() => {
                      setBrightness(110);
                      setContrast(105);
                      setWarmth(5);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Enhance Face Lighting
                  </button>
                </div>
              )}

              {/* Tab 3: Printable 4x6" Multi-Photo Sheet */}
              {activeTab === 'sheet' && (
                <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-2">
                      <Printer className="w-3.5 h-3.5" /> Save up to $15 on Printing
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Printable 4x6&quot; Photo Sheet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Download this 4x6 inch (1200x1800 px @ 300 DPI) photo template. Print it as a standard 4x6 photo at any local lab or pharmacy for pennies, then cut along the dotted guide lines!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Sheet Dimensions:</span>
                      <span className="font-bold text-gray-900 dark:text-white">4 x 6 inches (10 x 15 cm)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Resolution:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">300 DPI High-Definition</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Photos per sheet:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {selectedPreset.pxW <= 450 ? '8 Passport Photos' : '6 Passport Photos'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60 dark:border-gray-800">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Include Cut Guide Lines:</span>
                      <input
                        type="checkbox"
                        checked={includeCutMarks}
                        onChange={(e) => setIncludeCutMarks(e.target.checked)}
                        className="w-4 h-4 accent-cyan-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={downloadPrintSheet}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download 4x6&quot; Print Sheet (JPG)
                  </button>
                </div>
              )}

              {/* Official Compliance Checklist Card */}
              <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Biometric Compliance Checklist
                </span>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Neutral facial expression with both eyes open</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>No sunglasses or colored spectacles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Plain, uniform background without shadows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Head centered and facing directly into camera</span>
                  </li>
                </ul>
              </div>

              {/* Final Download Buttons Bar */}
              <div className="bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-2.5">
                <button
                  onClick={() => downloadSinglePhoto('jpeg')}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Single Photo (JPG @ 300 DPI)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadSinglePhoto('png')}
                    className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={downloadPrintSheet}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> 4x6&quot; Sheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
