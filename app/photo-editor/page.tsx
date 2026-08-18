'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, Download, Wand2, Sun, Sparkles, 
  Layers, Sliders, Eraser, Paintbrush, 
  SunMedium, Focus, Move, Circle, Flame,
  ShieldCheck, RotateCcw, Undo, Redo, RefreshCw,
  Scissors, Zap, Bot, Copy, Check, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Preset Templates Definition (20 Social Media & Dimension Presets) ---
interface PresetTemplate {
  id: string;
  name: string;
  category: 'TikTok' | 'Instagram' | 'Facebook' | 'YouTube' | 'X/Twitter' | 'LinkedIn' | 'Others';
  width: number;
  height: number;
  aspectLabel: string;
}

const TEMPLATE_PRESETS: PresetTemplate[] = [
  // Original / Custom
  { id: 'original', name: 'Original Size', category: 'Others', width: 0, height: 0, aspectLabel: 'Original' },
  // TikTok & Reels
  { id: 'tiktok-story', name: 'TikTok Video / Story', category: 'TikTok', width: 1080, height: 1920, aspectLabel: '9:16' },
  // Instagram
  { id: 'ig-square', name: 'Instagram Square Post', category: 'Instagram', width: 1080, height: 1080, aspectLabel: '1:1' },
  { id: 'ig-portrait', name: 'Instagram Portrait', category: 'Instagram', width: 1080, height: 1350, aspectLabel: '4:5' },
  { id: 'ig-story', name: 'Instagram Story / Reel', category: 'Instagram', width: 1080, height: 1920, aspectLabel: '9:16' },
  { id: 'ig-landscape', name: 'Instagram Landscape', category: 'Instagram', width: 1080, height: 566, aspectLabel: '1.91:1' },
  // Facebook
  { id: 'fb-post', name: 'Facebook Shared Post', category: 'Facebook', width: 1200, height: 630, aspectLabel: '1.91:1' },
  { id: 'fb-cover', name: 'Facebook Cover Photo', category: 'Facebook', width: 820, height: 312, aspectLabel: '16:9' },
  { id: 'fb-story', name: 'Facebook Story', category: 'Facebook', width: 1080, height: 1920, aspectLabel: '9:16' },
  // YouTube
  { id: 'yt-thumbnail', name: 'YouTube Thumbnail', category: 'YouTube', width: 1280, height: 720, aspectLabel: '16:9' },
  { id: 'yt-banner', name: 'YouTube Channel Banner', category: 'YouTube', width: 2560, height: 1440, aspectLabel: '16:9' },
  // X / Twitter
  { id: 'x-post', name: 'X / Twitter Post', category: 'X/Twitter', width: 1200, height: 675, aspectLabel: '16:9' },
  { id: 'x-header', name: 'X / Twitter Header', category: 'X/Twitter', width: 1500, height: 500, aspectLabel: '3:1' },
  // LinkedIn
  { id: 'li-post', name: 'LinkedIn Post', category: 'LinkedIn', width: 1200, height: 1000, aspectLabel: '1.2:1' },
  { id: 'li-cover', name: 'LinkedIn Banner', category: 'LinkedIn', width: 1584, height: 396, aspectLabel: '4:1' },
  // Others
  { id: 'pin-standard', name: 'Pinterest Standard Pin', category: 'Others', width: 1000, height: 1500, aspectLabel: '2:3' },
  { id: 'wa-status', name: 'WhatsApp Status', category: 'Others', width: 1080, height: 1920, aspectLabel: '9:16' },
  { id: 'sc-story', name: 'Snapchat Story', category: 'Others', width: 1080, height: 1920, aspectLabel: '9:16' },
  { id: 'tw-banner', name: 'Twitch Banner', category: 'Others', width: 1200, height: 480, aspectLabel: '16:9' },
  { id: 'pod-cover', name: 'Podcast Cover Art', category: 'Others', width: 3000, height: 3000, aspectLabel: '1:1' },
  { id: 'etsy-banner', name: 'Etsy Shop Banner', category: 'Others', width: 1200, height: 300, aspectLabel: '4:1' },
  { id: 'dt-wallpaper', name: 'Desktop HD Wallpaper', category: 'Others', width: 1920, height: 1080, aspectLabel: '16:9' }
];

interface HistoryStep {
  maskDataUrl: string;
  selectedTemplateId: string;
  bgMode: 'transparent' | 'solid' | 'gradient' | 'blur';
  bgColor: string;
  lightFx: {
    sunbeamEnabled: boolean;
    sunbeamAngle: number;
    sunbeamIntensity: number;
    neonEnabled: boolean;
    neonColor: string;
    neonRadius: number;
    bokehEnabled: boolean;
    bokehOpacity: number;
    leakEnabled: boolean;
    leakType: string;
    leakOpacity: number;
    spotlightEnabled: boolean;
    spotlightIntensity: number;
  };
  flare: {
    enabled: boolean;
    type: 'anamorphic' | 'sunburst' | 'hexagon';
    pos: { x: number; y: number };
    intensity: number;
    scale: number;
    color: string;
  };
  blurMode: 'none' | 'gaussian' | 'radial' | 'tilt_shift';
  blurSettings: {
    gaussian: number;
    radial: number;
    tiltShiftAmount: number;
    tiltShiftPos: number;
    tiltShiftBand: number;
  };
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    vignette: number;
  };
}

export default function PhotoEditorPage() {
  // Image Source state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('edited-photo');
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'templates' | 'eraser' | 'ai' | 'lightfx' | 'flare' | 'blur' | 'adjustments'>('templates');

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings: Preset & Canvas BG
  const [selectedTemplate, setSelectedTemplate] = useState<PresetTemplate>(TEMPLATE_PRESETS[0]);
  const [bgMode, setBgMode] = useState<'transparent' | 'solid' | 'gradient' | 'blur'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgGradient] = useState<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');

  // Eraser Tool state
  const [eraserTool, setEraserTool] = useState<'none' | 'wand' | 'erase' | 'restore'>('none');
  const [wandTolerance, setWandTolerance] = useState<number>(35);
  const [brushSize, setBrushSize] = useState<number>(25);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isAutoRemoving, setIsAutoRemoving] = useState<boolean>(false);

  // Gemini AI Assistant state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [aiContent, setAiContent] = useState<{ title?: string; caption?: string; hashtags?: string[] } | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Light FX state
  const [lightFx, setLightFx] = useState({
    sunbeamEnabled: false,
    sunbeamAngle: 45,
    sunbeamIntensity: 50,
    neonEnabled: false,
    neonColor: '#3b82f6',
    neonRadius: 20,
    bokehEnabled: false,
    bokehOpacity: 40,
    leakEnabled: false,
    leakType: 'warm',
    leakOpacity: 50,
    spotlightEnabled: false,
    spotlightIntensity: 40,
  });

  // Lens Flare state
  const [flare, setFlare] = useState({
    enabled: false,
    type: 'sunburst' as 'anamorphic' | 'sunburst' | 'hexagon',
    pos: { x: 0.35, y: 0.35 },
    intensity: 75,
    scale: 1.2,
    color: '#3b82f6',
  });
  const [isDraggingFlare, setIsDraggingFlare] = useState(false);

  // Blur & Focus state
  const [blurMode, setBlurMode] = useState<'none' | 'gaussian' | 'radial' | 'tilt_shift'>('none');
  const [blurSettings, setBlurSettings] = useState({
    gaussian: 15,
    radial: 20,
    tiltShiftAmount: 18,
    tiltShiftPos: 50,
    tiltShiftBand: 25,
  });

  // Image Adjustments state
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0,
  });

  // Undo / Redo History state
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Export settings
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality] = useState<number>(92);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // --- Main Canvas Renderer ---
  const renderStudioCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !maskCanvasRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetW = origDimensions.width;
    let targetH = origDimensions.height;

    if (selectedTemplate.id !== 'original' && selectedTemplate.width > 0) {
      targetW = selectedTemplate.width;
      targetH = selectedTemplate.height;
    }

    canvas.width = targetW;
    canvas.height = targetH;

    // 1. CLEAR & DRAW BACKGROUND
    ctx.clearRect(0, 0, targetW, targetH);

    if (bgMode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (bgMode === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, targetW, targetH);
      if (bgGradient.includes('#667eea')) {
        grad.addColorStop(0, '#667eea');
        grad.addColorStop(1, '#764ba2');
      } else if (bgGradient.includes('#ff7e5f')) {
        grad.addColorStop(0, '#ff7e5f');
        grad.addColorStop(1, '#feb47b');
      } else {
        grad.addColorStop(0, '#00c6ff');
        grad.addColorStop(1, '#0072ff');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (bgMode === 'blur') {
      ctx.save();
      ctx.filter = 'blur(30px) brightness(0.8)';
      ctx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
      ctx.restore();
    }

    // 2. PREPARE SUBJECT CANVAS WITH MASK & ADJUSTMENTS
    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = origDimensions.width;
    subjectCanvas.height = origDimensions.height;
    const sCtx = subjectCanvas.getContext('2d');

    if (sCtx) {
      let filterStr = `brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%)`;
      
      if (blurMode === 'gaussian' && blurSettings.gaussian > 0) {
        filterStr += ` blur(${blurSettings.gaussian}px)`;
      }

      sCtx.save();
      sCtx.filter = filterStr;
      sCtx.drawImage(img, 0, 0);
      sCtx.restore();

      if (adjustments.warmth !== 0) {
        sCtx.save();
        sCtx.globalCompositeOperation = adjustments.warmth > 0 ? 'overlay' : 'color';
        sCtx.fillStyle = adjustments.warmth > 0 ? `rgba(255, 160, 0, ${Math.abs(adjustments.warmth) / 250})` : `rgba(0, 150, 255, ${Math.abs(adjustments.warmth) / 250})`;
        sCtx.fillRect(0, 0, origDimensions.width, origDimensions.height);
        sCtx.restore();
      }

      sCtx.save();
      sCtx.globalCompositeOperation = 'destination-in';
      sCtx.drawImage(maskCanvasRef.current, 0, 0);
      sCtx.restore();
    }

    // 3. DRAW SUBJECT ONTO MAIN CANVAS
    let drawX = 0;
    let drawY = 0;
    let drawW = targetW;
    let drawH = targetH;

    if (selectedTemplate.id !== 'original') {
      const scale = Math.min(targetW / origDimensions.width, targetH / origDimensions.height);
      drawW = origDimensions.width * scale;
      drawH = origDimensions.height * scale;
      drawX = (targetW - drawW) / 2;
      drawY = (targetH - drawH) / 2;
    }

    if (lightFx.neonEnabled) {
      ctx.save();
      ctx.shadowColor = lightFx.neonColor;
      ctx.shadowBlur = lightFx.neonRadius * 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);
      }
      ctx.restore();
    }

    ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);

    // 4. SPECIAL BLUR MODES
    if (blurMode === 'radial' && blurSettings.radial > 0) {
      ctx.save();
      const centerX = targetW / 2;
      const centerY = targetH / 2;
      const maxRadius = Math.min(targetW, targetH) * 0.4;
      const mask = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, maxRadius);
      mask.addColorStop(0, 'rgba(0,0,0,0)');
      mask.addColorStop(1, 'rgba(0,0,0,1)');

      const blurLayer = document.createElement('canvas');
      blurLayer.width = targetW;
      blurLayer.height = targetH;
      const bCtx = blurLayer.getContext('2d');
      if (bCtx) {
        bCtx.filter = `blur(${blurSettings.radial}px)`;
        bCtx.drawImage(canvas, 0, 0);
        bCtx.globalCompositeOperation = 'destination-in';
        bCtx.fillStyle = mask;
        bCtx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(blurLayer, 0, 0);
      ctx.restore();
    } else if (blurMode === 'tilt_shift' && blurSettings.tiltShiftAmount > 0) {
      ctx.save();
      const focusY = (targetH * blurSettings.tiltShiftPos) / 100;
      const bandH = (targetH * blurSettings.tiltShiftBand) / 100;

      const grad = ctx.createLinearGradient(0, 0, 0, targetH);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(Math.max(0, (focusY - bandH) / targetH), 'rgba(0,0,0,0)');
      grad.addColorStop(Math.min(1, (focusY + bandH) / targetH), 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');

      const blurLayer = document.createElement('canvas');
      blurLayer.width = targetW;
      blurLayer.height = targetH;
      const bCtx = blurLayer.getContext('2d');
      if (bCtx) {
        bCtx.filter = `blur(${blurSettings.tiltShiftAmount}px)`;
        bCtx.drawImage(canvas, 0, 0);
        bCtx.globalCompositeOperation = 'destination-in';
        bCtx.fillStyle = grad;
        bCtx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(blurLayer, 0, 0);
      ctx.restore();
    }

    // 5. LIGHT EFFECTS OVERLAY
    if (lightFx.sunbeamEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beamAngle = (lightFx.sunbeamAngle * Math.PI) / 180;
      const originX = targetW / 2 + Math.cos(beamAngle) * targetW * 0.6;
      const originY = targetH / 2 + Math.sin(beamAngle) * targetH * 0.6;

      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8 + beamAngle;
        const rad = Math.max(targetW, targetH) * 1.5;
        const x2 = originX + Math.cos(angle) * rad;
        const y2 = originY + Math.sin(angle) * rad;

        const beamGrad = ctx.createLinearGradient(originX, originY, x2, y2);
        beamGrad.addColorStop(0, `rgba(255, 240, 200, ${lightFx.sunbeamIntensity / 100})`);
        beamGrad.addColorStop(1, 'rgba(255, 200, 150, 0)');

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(x2 - 40, y2);
        ctx.lineTo(x2 + 40, y2);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
      }
      ctx.restore();
    }

    if (lightFx.bokehEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const opacity = lightFx.bokehOpacity / 100;
      const seedRnd = (i: number) => Math.sin(i * 9999) * 0.5 + 0.5;

      for (let i = 0; i < 30; i++) {
        const bx = seedRnd(i) * targetW;
        const by = seedRnd(i + 1) * targetH;
        const br = 15 + seedRnd(i + 2) * 45;

        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.6})`);
        bGrad.addColorStop(0.7, `rgba(180, 220, 255, ${opacity * 0.3})`);
        bGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
      }
      ctx.restore();
    }

    if (lightFx.spotlightEnabled || adjustments.vignette > 0) {
      ctx.save();
      const intensity = Math.max(lightFx.spotlightIntensity, adjustments.vignette) / 100;
      const vGrad = ctx.createRadialGradient(
        targetW / 2, targetH / 2, Math.min(targetW, targetH) * 0.3,
        targetW / 2, targetH / 2, Math.max(targetW, targetH) * 0.75
      );
      vGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vGrad.addColorStop(1, `rgba(0,0,0,${intensity * 0.85})`);

      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    }

    // 6. LENS FLARE FX RENDERER
    if (flare.enabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const fx = flare.pos.x * targetW;
      const fy = flare.pos.y * targetH;
      const scale = flare.scale;
      const intensity = flare.intensity / 100;

      const centerX = targetW / 2;
      const centerY = targetH / 2;

      const dx = centerX - fx;
      const dy = centerY - fy;

      if (flare.type === 'anamorphic') {
        const streakGrad = ctx.createLinearGradient(fx - 400 * scale, fy, fx + 400 * scale, fy);
        streakGrad.addColorStop(0, 'rgba(0, 150, 255, 0)');
        streakGrad.addColorStop(0.4, `rgba(0, 180, 255, ${intensity * 0.5})`);
        streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.95})`);
        streakGrad.addColorStop(0.6, `rgba(0, 180, 255, ${intensity * 0.5})`);
        streakGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');

        ctx.fillStyle = streakGrad;
        ctx.fillRect(0, fy - 6 * scale, targetW, 12 * scale);

        const coreGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 60 * scale);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
        coreGrad.addColorStop(0.3, `rgba(0, 200, 255, ${intensity * 0.7})`);
        coreGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');
        ctx.beginPath();
        ctx.arc(fx, fy, 60 * scale, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

      } else if (flare.type === 'sunburst') {
        const sunGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 120 * scale);
        sunGrad.addColorStop(0, `rgba(255, 255, 240, ${intensity})`);
        sunGrad.addColorStop(0.25, `rgba(255, 200, 80, ${intensity * 0.8})`);
        sunGrad.addColorStop(0.6, `rgba(255, 120, 30, ${intensity * 0.4})`);
        sunGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');

        ctx.beginPath();
        ctx.arc(fx, fy, 120 * scale, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        for (let i = 0; i < 12; i++) {
          const rayAngle = (i * Math.PI) / 6;
          const rx = fx + Math.cos(rayAngle) * 200 * scale;
          const ry = fy + Math.sin(rayAngle) * 200 * scale;
          const rGrad = ctx.createLinearGradient(fx, fy, rx, ry);
          rGrad.addColorStop(0, `rgba(255, 220, 150, ${intensity * 0.6})`);
          rGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(rx, ry);
          ctx.lineWidth = 4 * scale;
          ctx.strokeStyle = rGrad;
          ctx.stroke();
        }

        [0.4, 0.75, 1.2, 1.6].forEach((factor, idx) => {
          const gx = fx + dx * factor;
          const gy = fy + dy * factor;
          const gr = (20 + idx * 15) * scale;

          const gGrad = ctx.createRadialGradient(gx, gy, gr * 0.6, gx, gy, gr);
          gGrad.addColorStop(0, 'rgba(0,0,0,0)');
          gGrad.addColorStop(0.8, `rgba(255, 150, 100, ${intensity * 0.35})`);
          gGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(gx, gy, gr, 0, Math.PI * 2);
          ctx.fillStyle = gGrad;
          ctx.fill();
        });

      } else if (flare.type === 'hexagon') {
        [0.2, 0.5, 0.85, 1.3].forEach((factor, idx) => {
          const hx = fx + dx * factor;
          const hy = fy + dy * factor;
          const hr = (25 + idx * 12) * scale;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = hx + Math.cos(angle) * hr;
            const py = hy + Math.sin(angle) * hr;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(180, 140, 255, ${intensity * (0.4 - idx * 0.08)})`;
          ctx.fill();
        });
      }

      ctx.restore();
    }

  }, [
    origDimensions, selectedTemplate, bgMode, bgColor, bgGradient, 
    lightFx, flare, blurMode, blurSettings, adjustments
  ]);

  useEffect(() => {
    if (imageSrc) {
      renderStudioCanvas();
    }
  }, [imageSrc, renderStudioCanvas]);

  // Save history snapshot
  const saveHistoryStep = useCallback(() => {
    const mCanvas = maskCanvasRef.current;
    if (!mCanvas) return;

    const dataUrl = mCanvas.toDataURL();
    const step: HistoryStep = {
      maskDataUrl: dataUrl,
      selectedTemplateId: selectedTemplate.id,
      bgMode,
      bgColor,
      lightFx: { ...lightFx },
      flare: { ...flare },
      blurMode,
      blurSettings: { ...blurSettings },
      adjustments: { ...adjustments },
    };

    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      updated.push(step);
      if (updated.length > 25) updated.shift();
      return updated;
    });
    setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, 24));
  }, [selectedTemplate.id, bgMode, bgColor, lightFx, flare, blurMode, blurSettings, adjustments, historyIndex]);

  // Restore history snapshot
  const restoreHistoryStep = useCallback((step: HistoryStep) => {
    const mCanvas = maskCanvasRef.current;
    if (mCanvas && step.maskDataUrl) {
      const img = new Image();
      img.onload = () => {
        const ctx = mCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, mCanvas.width, mCanvas.height);
          ctx.drawImage(img, 0, 0);
          renderStudioCanvas();
        }
      };
      img.src = step.maskDataUrl;
    }

    const t = TEMPLATE_PRESETS.find((p) => p.id === step.selectedTemplateId) || TEMPLATE_PRESETS[0];
    setSelectedTemplate(t);
    setBgMode(step.bgMode);
    setBgColor(step.bgColor);
    setLightFx(step.lightFx);
    setFlare(step.flare);
    setBlurMode(step.blurMode);
    setBlurSettings(step.blurSettings);
    setAdjustments(step.adjustments);
  }, [renderStudioCanvas]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      restoreHistoryStep(history[targetIndex]);
    }
  }, [history, historyIndex, restoreHistoryStep]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      restoreHistoryStep(history[targetIndex]);
    }
  }, [history, historyIndex, restoreHistoryStep]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // --- Secure Gemini Server API Calls ---
  const callGeminiApi = async (action: 'remove-background' | 'auto-enhance' | 'generate-caption' | 'prompt-edit', customPrompt?: string) => {
    if (!imageSrc) return null;
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc,
          action,
          userPrompt: customPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAiError(data.error || 'Failed to call Gemini AI Server Route.');
        setAiLoading(false);
        return null;
      }

      setAiLoading(false);
      return data.result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error connecting to AI Server.';
      setAiError(errorMessage);
      setAiLoading(false);
      return null;
    }
  };

  // Handle File Upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFileName(file.name.replace(/\.[^/.]+$/, ''));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        setOrigDimensions({ width: img.width, height: img.height });
        setImageSrc(url);

        const mCanvas = document.createElement('canvas');
        mCanvas.width = img.width;
        mCanvas.height = img.height;
        const ctx = mCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, img.width, img.height);
        }
        maskCanvasRef.current = mCanvas;

        const initialStep: HistoryStep = {
          maskDataUrl: mCanvas.toDataURL(),
          selectedTemplateId: 'original',
          bgMode: 'transparent',
          bgColor: '#ffffff',
          lightFx: {
            sunbeamEnabled: false, sunbeamAngle: 45, sunbeamIntensity: 50,
            neonEnabled: false, neonColor: '#3b82f6', neonRadius: 20,
            bokehEnabled: false, bokehOpacity: 40, leakEnabled: false, leakType: 'warm', leakOpacity: 50,
            spotlightEnabled: false, spotlightIntensity: 40,
          },
          flare: { enabled: false, type: 'sunburst', pos: { x: 0.35, y: 0.35 }, intensity: 75, scale: 1.2, color: '#3b82f6' },
          blurMode: 'none',
          blurSettings: { gaussian: 15, radial: 20, tiltShiftAmount: 18, tiltShiftPos: 50, tiltShiftBand: 25 },
          adjustments: { brightness: 0, contrast: 0, saturation: 0, warmth: 0, vignette: 0 },
        };
        setHistory([initialStep]);
        setHistoryIndex(0);
      };
      img.src = url;
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.svg'] },
    multiple: false,
  });

  // --- Auto Background Removal: Gemini AI Segmentation Mask ---
  const autoRemoveBackground = async () => {
    const img = imageRef.current;
    const mCanvas = maskCanvasRef.current;
    if (!img || !mCanvas) return;

    setIsAutoRemoving(true);

    const w = img.width;
    const h = img.height;
    const mCtx = mCanvas.getContext('2d');
    if (!mCtx) { setIsAutoRemoving(false); return; }

    // Step 1: High-precision client-side ML Segmentation (@imgly/background-removal)
    let maskApplied = false;

    try {
      const imgly = await import('@imgly/background-removal');
      const blob = await imgly.removeBackground(imageSrc || img.src);
      const bgRemovedUrl = URL.createObjectURL(blob);

      maskApplied = await new Promise<boolean>((resolve) => {
        const removedImg = new Image();
        removedImg.onload = () => {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = w;
          tempCanvas.height = h;
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) { resolve(false); return; }

          tempCtx.drawImage(removedImg, 0, 0, w, h);
          const tempImgData = tempCtx.getImageData(0, 0, w, h);
          const maskImgData = mCtx.getImageData(0, 0, w, h);

          for (let i = 0; i < w * h; i++) {
            maskImgData.data[i * 4 + 3] = tempImgData.data[i * 4 + 3];
          }

          mCtx.putImageData(maskImgData, 0, 0);
          URL.revokeObjectURL(bgRemovedUrl);
          resolve(true);
        };
        removedImg.onerror = () => resolve(false);
        removedImg.src = bgRemovedUrl;
      });
    } catch (err) {
      console.warn('Imgly client-side ML background removal failed:', err);
    }

    // Step 2: Gemini AI Segmentation Mask (Secondary Fallback)
    if (!maskApplied) {
      try {
        const preCanvas = document.createElement('canvas');
        preCanvas.width = w;
        preCanvas.height = h;
        const preCtx = preCanvas.getContext('2d');
        if (preCtx) {
          preCtx.drawImage(img, 0, 0);
          const imageBase64 = preCanvas.toDataURL('image/jpeg', 0.85);

          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64, action: 'segment-mask' }),
          });
          const json = await res.json();

          if (res.ok && json.maskImage) {
            maskApplied = await new Promise<boolean>((resolve) => {
              const maskImg = new Image();
              maskImg.onload = () => {
                const aiMaskCanvas = document.createElement('canvas');
                aiMaskCanvas.width = w;
                aiMaskCanvas.height = h;
                const aiCtx = aiMaskCanvas.getContext('2d');
                if (!aiCtx) { resolve(false); return; }

                aiCtx.drawImage(maskImg, 0, 0, w, h);
                const aiMaskData = aiCtx.getImageData(0, 0, w, h).data;

                const maskImgData = mCtx.getImageData(0, 0, w, h);
                const mData = maskImgData.data;

                for (let i = 0; i < w * h; i++) {
                  const mi = i * 4;
                  const brightness = (aiMaskData[mi] + aiMaskData[mi + 1] + aiMaskData[mi + 2]) / 3;
                  if (brightness < 128) {
                    mData[mi + 3] = 0;
                  } else {
                    mData[mi + 3] = 255;
                  }
                }

                mCtx.putImageData(maskImgData, 0, 0);
                resolve(true);
              };
              maskImg.onerror = () => resolve(false);
              maskImg.src = json.maskImage;
            });
          }
        }
      } catch {
        // Fall through
      }
    }

    // Step 4: Fallback — border BFS if Gemini mask failed (with seed color protection & center boundary check)
    if (!maskApplied) {
      const tempCanvas2 = document.createElement('canvas');
      tempCanvas2.width = w;
      tempCanvas2.height = h;
      const tCtx2 = tempCanvas2.getContext('2d');
      if (tCtx2) {
        tCtx2.drawImage(img, 0, 0);
        const imgData = tCtx2.getImageData(0, 0, w, h);
        const maskImgData = mCtx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const mData = maskImgData.data;

        // Sample initial border corner colors to set seed baseline
        const corners = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + w - 1) * 4];
        const seedColors = corners.map((ci) => ({ r: data[ci], g: data[ci + 1], b: data[ci + 2] }));

        const maxStepDelta = Math.max(18, wandTolerance * 0.5);
        const maxSeedDelta = Math.max(45, wandTolerance * 1.2);
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Seed 4 border edges
        for (let x = 0; x < w; x++) {
          visited[x] = 1; queue.push(x);
          const b = (h - 1) * w + x;
          visited[b] = 1; queue.push(b);
        }
        for (let y = 1; y < h - 1; y++) {
          const l = y * w;
          visited[l] = 1; queue.push(l);
          const r = y * w + (w - 1);
          visited[r] = 1; queue.push(r);
        }

        let head = 0;
        while (head < queue.length) {
          const idx = queue[head++];
          const di = idx * 4;
          mData[di + 3] = 0;
          const cr = data[di], cg = data[di + 1], cb = data[di + 2];
          const px = idx % w, py = Math.floor(idx / w);

          for (const nIdx of [idx - 1, idx + 1, idx - w, idx + w]) {
            if (nIdx < 0 || nIdx >= w * h) continue;
            const nx = nIdx % w;
            if (Math.abs(nx - px) > 1) continue;
            if (!visited[nIdx]) {
              const ndi = nIdx * 4;
              const nr = data[ndi], ng = data[ndi + 1], nb = data[ndi + 2];
              
              // Step distance to immediate neighbor
              const stepDist = Math.sqrt((cr - nr) ** 2 + (cg - ng) ** 2 + (cb - nb) ** 2);
              
              // Distance to closest corner seed color
              const seedDist = Math.min(...seedColors.map((sc) => Math.sqrt((sc.r - nr) ** 2 + (sc.g - ng) ** 2 + (sc.b - nb) ** 2)));

              if (stepDist <= maxStepDelta && seedDist <= maxSeedDelta) {
                visited[nIdx] = 1;
                queue.push(nIdx);
              }
            }
          }
        }

        mCtx.putImageData(maskImgData, 0, 0);
      }
    }

    renderStudioCanvas();
    saveHistoryStep();
    setIsAutoRemoving(false);
  };

  // Magic Wand Click
  const applyMagicWand = (clickX: number, clickY: number) => {
    const img = imageRef.current;
    const mCanvas = maskCanvasRef.current;
    if (!img || !mCanvas) return;

    const mCtx = mCanvas.getContext('2d');
    if (!mCtx) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(img, 0, 0);

    const startX = Math.floor(clickX);
    const startY = Math.floor(clickY);

    const fullImgData = tCtx.getImageData(0, 0, img.width, img.height);
    const maskImgData = mCtx.getImageData(0, 0, img.width, img.height);

    const data = fullImgData.data;
    const mData = maskImgData.data;
    const w = img.width;
    const h = img.height;

    const startIdx = startY * w + startX;
    const visited = new Uint8Array(w * h);
    const queue: number[] = [startIdx];
    visited[startIdx] = 1;

    const maxStepDelta = Math.max(16, wandTolerance * 0.7);

    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const px = idx % w;
      const py = Math.floor(idx / w);
      const dataIdx = idx * 4;

      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];

      mData[dataIdx + 3] = 0;

      const neighbors: number[] = [];
      if (px > 0) neighbors.push(idx - 1);
      if (px < w - 1) neighbors.push(idx + 1);
      if (py > 0) neighbors.push(idx - w);
      if (py < h - 1) neighbors.push(idx + w);

      for (let n = 0; n < neighbors.length; n++) {
        const nIdx = neighbors[n];
        if (!visited[nIdx]) {
          const nDataIdx = nIdx * 4;
          const nr = data[nDataIdx];
          const ng = data[nDataIdx + 1];
          const nb = data[nDataIdx + 2];

          const stepDelta = Math.sqrt((r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2);

          if (stepDelta <= maxStepDelta) {
            visited[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }
    }

    mCtx.putImageData(maskImgData, 0, 0);
    renderStudioCanvas();
    saveHistoryStep();
  };

  const drawBrushOnMask = (x: number, y: number) => {
    const mCanvas = maskCanvasRef.current;
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext('2d');
    if (!mCtx) return;

    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    mCtx.fillStyle = eraserTool === 'erase' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
    mCtx.globalCompositeOperation = eraserTool === 'erase' ? 'destination-out' : 'source-over';
    mCtx.fill();
    mCtx.restore();

    renderStudioCanvas();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    if (flare.enabled && activeTab === 'flare') {
      setIsDraggingFlare(true);
      setFlare((prev) => ({
        ...prev,
        pos: { x: canvasX / canvas.width, y: canvasY / canvas.height },
      }));
      return;
    }

    let imgX = canvasX;
    let imgY = canvasY;

    if (selectedTemplate.id !== 'original') {
      const scale = Math.min(canvas.width / origDimensions.width, canvas.height / origDimensions.height);
      const drawW = origDimensions.width * scale;
      const drawH = origDimensions.height * scale;
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;

      imgX = (canvasX - drawX) / scale;
      imgY = (canvasY - drawY) / scale;
    }

    if (imgX >= 0 && imgX <= origDimensions.width && imgY >= 0 && imgY <= origDimensions.height) {
      if (eraserTool === 'wand') {
        applyMagicWand(imgX, imgY);
      } else if (eraserTool === 'erase' || eraserTool === 'restore') {
        setIsDrawing(true);
        drawBrushOnMask(imgX, imgY);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    if (isDraggingFlare && flare.enabled) {
      setFlare((prev) => ({
        ...prev,
        pos: {
          x: Math.max(0, Math.min(1, canvasX / canvas.width)),
          y: Math.max(0, Math.min(1, canvasY / canvas.height)),
        },
      }));
      return;
    }

    if (isDrawing && (eraserTool === 'erase' || eraserTool === 'restore')) {
      let imgX = canvasX;
      let imgY = canvasY;
      if (selectedTemplate.id !== 'original') {
        const scale = Math.min(canvas.width / origDimensions.width, canvas.height / origDimensions.height);
        const drawW = origDimensions.width * scale;
        const drawH = origDimensions.height * scale;
        const drawX = (canvas.width - drawW) / 2;
        const drawY = (canvas.height - drawH) / 2;
        imgX = (canvasX - drawX) / scale;
        imgY = (canvasY - drawY) / scale;
      }
      drawBrushOnMask(imgX, imgY);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryStep();
    }
    if (isDraggingFlare) {
      setIsDraggingFlare(false);
      saveHistoryStep();
    }
  };

  const resetMask = () => {
    const mCanvas = maskCanvasRef.current;
    if (!mCanvas) return;
    const ctx = mCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, mCanvas.width, mCanvas.height);
      renderStudioCanvas();
      saveHistoryStep();
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);

    setTimeout(() => {
      const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, exportQuality / 100);

      const link = document.createElement('a');
      link.download = `${imageFileName}-${selectedTemplate.id}-edited.${exportFormat}`;
      link.href = dataUrl;
      link.click();

      setIsExporting(false);
    }, 200);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
      
      {/* Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/80 text-xs font-bold text-indigo-700 mb-4 shadow-2xs"
      >
        <Wand2 className="w-4 h-4 text-indigo-600 animate-pulse" />
        <span>Next-Gen Pro Photo Studio & FX Suite</span>
      </motion.div>

      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Photo Studio & <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Pro FX Suite</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-normal max-w-2xl mx-auto">
          20 Social Presets, AI Auto BG Removal, Volumetric Light, Lens Flares & AI Content Generator.
        </p>
      </div>

      {/* Workspace */}
      {!imageSrc ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl"
        >
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-white shadow-xl ${
              isDragActive
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50/80'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-md shadow-indigo-500/10">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Drop your image here to open Photo Studio
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Supports PNG, JPG, WEBP & SVG • 100% Client-Side Private Processing
            </p>
            <button className="py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
              Select Photo from Device
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xl space-y-6">
            
            {/* Tool Tabs Navigation */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 bg-gray-100/80 rounded-2xl">
              {[
                { id: 'templates', label: 'Presets', icon: Layers },
                { id: 'eraser', label: 'Eraser', icon: Eraser },
                { id: 'ai', label: 'AI', icon: Bot },
                { id: 'lightfx', label: 'Light FX', icon: Sun },
                { id: 'flare', label: 'Flare', icon: Sparkles },
                { id: 'blur', label: 'Blur', icon: Focus },
                { id: 'adjustments', label: 'Tune', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'templates' | 'eraser' | 'lightfx' | 'flare' | 'blur' | 'adjustments' | 'ai')}
                    className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-md shadow-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PRESETS */}
            {activeTab === 'templates' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    20 Social Media & Dimension Presets
                  </h3>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {TEMPLATE_PRESETS.map((preset) => {
                      const isSelected = selectedTemplate.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedTemplate(preset);
                            setTimeout(saveHistoryStep, 50);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold truncate">{preset.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-600 font-mono">
                              {preset.aspectLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {preset.width > 0 ? `${preset.width} × ${preset.height} px` : 'Fit Image Size'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Canvas Backdrop */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Canvas Backdrop Fill
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'transparent', label: 'Transparent' },
                      { id: 'solid', label: 'Solid Color' },
                      { id: 'gradient', label: 'Gradient' },
                      { id: 'blur', label: 'Blur Photo' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setBgMode(mode.id as 'transparent' | 'solid' | 'gradient' | 'blur');
                          setTimeout(saveHistoryStep, 50);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          bgMode === mode.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {bgMode === 'solid' && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs font-bold text-gray-700">Color:</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => {
                          setBgColor(e.target.value);
                          setTimeout(saveHistoryStep, 100);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: ERASER & AUTO BACKGROUND REMOVER */}
            {activeTab === 'eraser' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                
                {/* 1-CLICK AUTO REMOVE BACKGROUND BUTTON (POWERED BY AI & BFS) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      1-Click Auto Cutout
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                      Client-side AI Engine
                    </span>
                  </div>

                  <button
                    onClick={autoRemoveBackground}
                    disabled={isAutoRemoving}
                    className="w-full py-3 px-4 rounded-xl bg-white text-indigo-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Scissors className="w-4 h-4 text-indigo-600" />
                    <span>{isAutoRemoving ? 'Removing Background...' : 'Auto Remove Background'}</span>
                  </button>

                  <div className="space-y-1 pt-1 border-t border-white/10">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-100">
                      <span>Cutout Sensitivity:</span>
                      <span>{wandTolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="75"
                      value={wandTolerance}
                      onChange={(e) => setWandTolerance(Number(e.target.value))}
                      className="w-full accent-amber-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Manual Cutout & Refine Tools
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setEraserTool('wand')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        eraserTool === 'wand'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700 font-medium'
                      }`}
                    >
                      <Wand2 className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs">Magic Wand</span>
                    </button>
                    <button
                      onClick={() => setEraserTool('erase')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        eraserTool === 'erase'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700 font-medium'
                      }`}
                    >
                      <Eraser className="w-5 h-5 text-rose-600" />
                      <span className="text-xs">Erase Brush</span>
                    </button>
                    <button
                      onClick={() => setEraserTool('restore')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        eraserTool === 'restore'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700 font-medium'
                      }`}
                    >
                      <Paintbrush className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs">Restore</span>
                    </button>
                  </div>
                </div>

                {eraserTool === 'wand' && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>Wand Color Tolerance:</span>
                      <span>{wandTolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={wandTolerance}
                      onChange={(e) => setWandTolerance(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}

                {(eraserTool === 'erase' || eraserTool === 'restore') && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>Brush Radius:</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}

                <button
                  onClick={resetMask}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Cutout Mask</span>
                </button>
              </motion.div>
            )}

            {/* TAB 3: AI ASSISTANT */}
            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    Smart AI Assistant
                  </h3>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                    Secure Server Route
                  </span>
                </div>

                {aiError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {aiError}
                  </div>
                )}

                {/* 1-Click AI Auto Enhance */}
                <button
                  onClick={() => callGeminiApi('auto-enhance')}
                  disabled={aiLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiLoading ? 'Gemini AI Processing...' : '⚡ AI Smart Auto-Enhance'}</span>
                </button>

                {aiSummary && (
                  <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 font-medium">
                    💡 <strong>AI Analysis:</strong> {aiSummary}
                  </div>
                )}

                {/* AI Prompt Custom Style */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    AI Style Prompt
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Cinematic warm sunset vibe..."
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={() => callGeminiApi('prompt-edit', aiPromptInput)}
                      disabled={aiLoading || !aiPromptInput.trim()}
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* AI Social Caption Generator */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 space-y-2">
                  <button
                    onClick={() => callGeminiApi('generate-caption')}
                    disabled={aiLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Viral Captions & Hashtags</span>
                  </button>

                  {aiContent && (
                    <div className="space-y-2 pt-2 border-t border-purple-200/50 text-xs">
                      <p className="font-bold text-purple-900">{aiContent.title}</p>
                      <p className="text-gray-700 leading-relaxed bg-white p-2.5 rounded-xl border border-purple-100">
                        {aiContent.caption}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {aiContent.hashtags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const fullText = `${aiContent.title}\n\n${aiContent.caption}\n\n${aiContent.hashtags?.join(' ')}`;
                          navigator.clipboard.writeText(fullText);
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2000);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCaption ? 'Copy Post Content' : 'Copy Post Content'}</span>
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB 4: LIGHT FX */}
            {activeTab === 'lightfx' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Lighting & Volumetric Overlays
                </h3>

                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-2">
                      <SunMedium className="w-4 h-4 text-amber-600" />
                      Sunbeams / Volumetric Light
                    </label>
                    <input
                      type="checkbox"
                      checked={lightFx.sunbeamEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, sunbeamEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 50);
                      }}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.sunbeamEnabled && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/50">
                      <div className="flex justify-between text-xs text-amber-800">
                        <span>Light Beam Angle:</span>
                        <span>{lightFx.sunbeamAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={lightFx.sunbeamAngle}
                        onChange={(e) => setLightFx({ ...lightFx, sunbeamAngle: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-amber-600"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-blue-600" />
                      Neon Edge Glow
                    </label>
                    <input
                      type="checkbox"
                      checked={lightFx.neonEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, neonEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 50);
                      }}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.neonEnabled && (
                    <div className="flex items-center gap-3 pt-2 border-t border-blue-200/50">
                      <label className="text-xs text-blue-800 font-bold">Glow Color:</label>
                      <input
                        type="color"
                        value={lightFx.neonColor}
                        onChange={(e) => {
                          setLightFx({ ...lightFx, neonColor: e.target.value });
                          setTimeout(saveHistoryStep, 100);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLightFx({ ...lightFx, bokehEnabled: !lightFx.bokehEnabled });
                      setTimeout(saveHistoryStep, 50);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      lightFx.bokehEnabled ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-gray-200 text-gray-700 font-medium'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="text-xs">Bokeh Spheres</span>
                  </button>
                  <button
                    onClick={() => {
                      setLightFx({ ...lightFx, spotlightEnabled: !lightFx.spotlightEnabled });
                      setTimeout(saveHistoryStep, 50);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      lightFx.spotlightEnabled ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold' : 'border-gray-200 text-gray-700 font-medium'
                    }`}
                  >
                    <Circle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                    <span className="text-xs">Spotlight Focus</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 5: LENS FLARE */}
            {activeTab === 'flare' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Optical Lens Flare FX
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 cursor-pointer">
                    <span>Enable Flare</span>
                    <input
                      type="checkbox"
                      checked={flare.enabled}
                      onChange={(e) => {
                        setFlare({ ...flare, enabled: e.target.checked });
                        setTimeout(saveHistoryStep, 50);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  </label>
                </div>

                {flare.enabled && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-500 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Move className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Click or drag directly on the photo preview to position flare source!</span>
                    </p>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Flare Style:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sunburst', label: 'Sunburst' },
                          { id: 'anamorphic', label: 'Anamorphic' },
                          { id: 'hexagon', label: 'Hexagon' },
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => {
                              setFlare({ ...flare, type: style.id as 'anamorphic' | 'sunburst' | 'hexagon' });
                              setTimeout(saveHistoryStep, 50);
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              flare.type === style.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                        <span>Flare Intensity:</span>
                        <span>{flare.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={flare.intensity}
                        onChange={(e) => setFlare({ ...flare, intensity: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 6: BLUR */}
            {activeTab === 'blur' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Blur & Depth of Field Modes
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'No Blur' },
                    { id: 'gaussian', label: 'Gaussian Blur' },
                    { id: 'radial', label: 'Bokeh Radial' },
                    { id: 'tilt_shift', label: 'Tilt-Shift Focus' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setBlurMode(mode.id as 'none' | 'gaussian' | 'radial' | 'tilt_shift');
                        setTimeout(saveHistoryStep, 50);
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        blurMode === mode.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {blurMode === 'gaussian' && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>Blur Strength:</span>
                      <span>{blurSettings.gaussian}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={blurSettings.gaussian}
                      onChange={(e) => setBlurSettings({ ...blurSettings, gaussian: Number(e.target.value) })}
                      onMouseUp={() => saveHistoryStep()}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 7: ADJUSTMENTS */}
            {activeTab === 'adjustments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Brightness, Contrast & Tone
                </h3>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>Brightness:</span>
                    <span>{adjustments.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.brightness}
                    onChange={(e) => setAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>Contrast:</span>
                    <span>{adjustments.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.contrast}
                    onChange={(e) => setAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </motion.div>
            )}

            {/* EXPORT BUTTON */}
            <div className="pt-4 border-t border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Export Format:</span>
                <div className="flex items-center gap-2">
                  {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                        exportFormat === fmt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{isExporting ? 'Exporting HD Image...' : 'Download Edited Photo'}</span>
              </button>

              <button
                onClick={() => setImageSrc(null)}
                className="w-full py-2 text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors"
              >
                Upload Different Image
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: CANVAS PREVIEW WITH TOOLBAR & AUTO REMOVE QUICK BUTTON */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Top Preview Action Bar: Auto BG Remove, Undo, Redo, Reset */}
            <div className="w-full bg-white px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-md mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={autoRemoveBackground}
                  disabled={isAutoRemoving}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                  title="Automatically remove background using Gemini AI & BFS"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{isAutoRemoving ? 'Removing...' : 'Auto Remove BG'}</span>
                </button>

                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Undo last action (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4 text-indigo-600" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Redo action (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4 text-indigo-600" />
                  <span>Redo</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-500 hidden sm:inline">
                  Step {historyIndex + 1} of {history.length}
                </span>
                <button
                  onClick={() => {
                    if (history.length > 0) {
                      setHistoryIndex(0);
                      restoreHistoryStep(history[0]);
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset to original photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            <div className="relative w-full bg-gray-900/90 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl flex items-center justify-center min-h-[460px] overflow-hidden">
              
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl max-w-full max-h-[600px] border border-gray-700"
                style={{
                  backgroundImage: bgMode === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none',
                  backgroundSize: '16px 16px',
                  backgroundColor: bgMode === 'transparent' ? '#1f2937' : 'transparent',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="max-w-full max-h-[560px] object-contain cursor-crosshair block"
                />
              </div>

            </div>

            <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full Resolution High-Quality Client-Side Canvas Rendering</span>
            </p>

          </div>

        </div>
      )}

    </main>
  );
}
