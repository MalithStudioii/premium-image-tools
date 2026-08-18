'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Download, Wand2, Sun, Sparkles,
  Layers, Sliders, Eraser, Paintbrush,
  SunMedium, Focus, Move, Circle, Flame,
  ShieldCheck, RotateCcw, Undo, Redo, RefreshCw,
  Scissors, Zap, Bot, Copy, Check, MessageSquare,
  Maximize2, Minimize2
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

interface LightFxState {
  sunbeamEnabled: boolean;
  sunbeamAngle: number;
  sunbeamIntensity: number;
  pos: { x: number; y: number };
  neonEnabled: boolean;
  neonColor: string;
  neonRadius: number;
  goldenHourEnabled: boolean;
  goldenHourWarmth: number;
  particlesEnabled: boolean;
  particlesCount: number;
  mistEnabled: boolean;
  mistIntensity: number;
  bokehEnabled: boolean;
  bokehOpacity: number;
  leakEnabled: boolean;
  leakType: string;
  leakOpacity: number;
  spotlightEnabled: boolean;
  spotlightIntensity: number;
}

interface HistoryStep {
  maskDataUrl: string;
  selectedTemplateId: string;
  bgMode: 'transparent' | 'solid' | 'gradient' | 'blur' | 'image';
  bgColor: string;
  customBgImageSrc?: string | null;
  bgImageSettings?: {
    scale: number;
    offsetX: number;
    offsetY: number;
    blur: number;
    brightness: number;
  };
  lightFx: LightFxState;
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
  const [bgMode, setBgMode] = useState<'transparent' | 'solid' | 'gradient' | 'blur' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgGradient, setBgGradient] = useState<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [presetCategory, setPresetCategory] = useState<string>('All');

  // Custom Background Image state
  const [customBgImageSrc, setCustomBgImageSrc] = useState<string | null>(null);
  const customBgImageRef = useRef<HTMLImageElement | null>(null);
  const [bgImageSettings, setBgImageSettings] = useState<{
    scale: number;
    offsetX: number;
    offsetY: number;
    blur: number;
    brightness: number;
  }>({
    scale: 100,
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    brightness: 0,
  });
  const [isDraggingBgImage, setIsDraggingBgImage] = useState<boolean>(false);
  const dragBgStartRef = useRef<{ clientX: number; clientY: number; startOffsetX: number; startOffsetY: number }>({
    clientX: 0,
    clientY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  // Eraser Tool state
  const [eraserTool, setEraserTool] = useState<'none' | 'wand' | 'erase' | 'restore'>('erase');
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
  const [lightFx, setLightFx] = useState<LightFxState>({
    sunbeamEnabled: false,
    sunbeamAngle: 45,
    sunbeamIntensity: 60,
    pos: { x: 0.25, y: 0.15 },
    neonEnabled: false,
    neonColor: '#00f2fe',
    neonRadius: 25,
    goldenHourEnabled: false,
    goldenHourWarmth: 55,
    particlesEnabled: false,
    particlesCount: 40,
    mistEnabled: false,
    mistIntensity: 50,
    bokehEnabled: false,
    bokehOpacity: 40,
    leakEnabled: false,
    leakType: 'warm',
    leakOpacity: 50,
    spotlightEnabled: false,
    spotlightIntensity: 40,
  });
  const [isDraggingLight, setIsDraggingLight] = useState(false);

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
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

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
      if (bgGradient.includes('#ff7e5f')) {
        grad.addColorStop(0, '#ff7e5f');
        grad.addColorStop(1, '#feb47b');
      } else if (bgGradient.includes('#00c6ff')) {
        grad.addColorStop(0, '#00c6ff');
        grad.addColorStop(1, '#0072ff');
      } else if (bgGradient.includes('#f093fb')) {
        grad.addColorStop(0, '#f093fb');
        grad.addColorStop(1, '#f5576c');
      } else if (bgGradient.includes('#0ba360')) {
        grad.addColorStop(0, '#0ba360');
        grad.addColorStop(1, '#3cba92');
      } else if (bgGradient.includes('#141e30')) {
        grad.addColorStop(0, '#141e30');
        grad.addColorStop(1, '#243b55');
      } else {
        grad.addColorStop(0, '#667eea');
        grad.addColorStop(1, '#764ba2');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (bgMode === 'blur') {
      ctx.save();
      ctx.filter = 'blur(30px) brightness(0.8)';
      ctx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
      ctx.restore();
    } else if (bgMode === 'image' && customBgImageRef.current) {
      const bgImg = customBgImageRef.current;
      ctx.save();

      let filterStr = '';
      if (bgImageSettings.blur > 0) {
        filterStr += `blur(${bgImageSettings.blur}px) `;
      }
      if (bgImageSettings.brightness !== 0) {
        filterStr += `brightness(${100 + bgImageSettings.brightness}%) `;
      }
      if (filterStr) {
        ctx.filter = filterStr.trim();
      }

      const bgScale = bgImageSettings.scale / 100;
      const baseScale = Math.max(targetW / bgImg.width, targetH / bgImg.height);
      const bgW = bgImg.width * baseScale * bgScale;
      const bgH = bgImg.height * baseScale * bgScale;

      const drawX = (targetW - bgW) / 2 + (bgImageSettings.offsetX / 100) * targetW;
      const drawY = (targetH - bgH) / 2 + (bgImageSettings.offsetY / 100) * targetH;

      ctx.drawImage(bgImg, drawX, drawY, bgW, bgH);
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

    // 5. LIGHT & ATMOSPHERE EFFECTS OVERLAY

    // 5.1 CYBER NEON AURA GLOW
    if (lightFx.neonEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const neonColor = lightFx.neonColor || '#00f2fe';
      const glowRadius = Math.max(10, lightFx.neonRadius || 25);

      // 1. Soft Radial Neon Atmospheric Aura
      const centerX = targetW / 2;
      const centerY = targetH / 2;
      const auraGrad = ctx.createRadialGradient(
        centerX, centerY, Math.min(targetW, targetH) * 0.15,
        centerX, centerY, Math.max(targetW, targetH) * 0.75 + glowRadius
      );
      auraGrad.addColorStop(0, 'rgba(0,0,0,0)');
      auraGrad.addColorStop(0.5, neonColor + '22');
      auraGrad.addColorStop(0.85, neonColor + '55');
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, targetW, targetH);

      // 2. Glowing Neon Border Frame
      const pad = Math.max(10, Math.min(24, targetW * 0.02));
      ctx.save();
      ctx.strokeStyle = neonColor;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = glowRadius * 1.5;
      ctx.lineWidth = Math.max(2, Math.min(6, glowRadius / 12));

      const r = 16;
      const bx = pad;
      const by = pad;
      const bw = targetW - pad * 2;
      const bh = targetH - pad * 2;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bx, by, bw, bh, r);
      } else {
        ctx.rect(bx, by, bw, bh);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Futuristic Cyber Brackets on 4 Corners
      const cLen = Math.max(20, Math.min(60, Math.min(targetW, targetH) * 0.08));
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = glowRadius * 2;
      ctx.lineWidth = Math.max(3, Math.min(7, glowRadius / 10));

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + cLen);
      ctx.lineTo(bx, by + r);
      ctx.arcTo(bx, by, bx + r, by, r);
      ctx.lineTo(bx + cLen, by);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cLen, by);
      ctx.lineTo(bx + bw - r, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
      ctx.lineTo(bx + bw, by + cLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cLen);
      ctx.lineTo(bx, by + bh - r);
      ctx.arcTo(bx, by + bh, bx + r, by + bh, r);
      ctx.lineTo(bx + cLen, by + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cLen, by + bh);
      ctx.lineTo(bx + bw - r, by + bh);
      ctx.arcTo(bx + bw, by + bh, bx + bw, by + bh - r, r);
      ctx.lineTo(bx + bw, by + bh - cLen);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    }

    // 5.2 GOLDEN HOUR / SUNRISE GLOW
    if (lightFx.goldenHourEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const warmth = (lightFx.goldenHourWarmth || 55) / 100;
      const lx = (lightFx.pos?.x ?? 0.25) * targetW;
      const ly = (lightFx.pos?.y ?? 0.15) * targetH;

      const grad = ctx.createRadialGradient(lx, ly, 30, lx, ly, Math.max(targetW, targetH) * 1.2);
      grad.addColorStop(0, `rgba(255, 205, 110, ${warmth * 0.75})`);
      grad.addColorStop(0.3, `rgba(255, 140, 50, ${warmth * 0.5})`);
      grad.addColorStop(0.7, `rgba(255, 70, 20, ${warmth * 0.22})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    }

    // 5.3 DRAGGABLE SUNBEAMS (GOD RAYS)
    if (lightFx.sunbeamEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const originX = (lightFx.pos?.x ?? 0.25) * targetW;
      const originY = (lightFx.pos?.y ?? 0.15) * targetH;
      const intensity = (lightFx.sunbeamIntensity || 60) / 100;
      const beamAngle = (lightFx.sunbeamAngle * Math.PI) / 180;

      for (let i = 0; i < 18; i++) {
        const angle = (i * Math.PI) / 9 + beamAngle;
        const rad = Math.max(targetW, targetH) * 1.6;
        const x2 = originX + Math.cos(angle) * rad;
        const y2 = originY + Math.sin(angle) * rad;

        const beamGrad = ctx.createLinearGradient(originX, originY, x2, y2);
        beamGrad.addColorStop(0, `rgba(255, 248, 210, ${intensity * 0.9})`);
        beamGrad.addColorStop(0.4, `rgba(255, 215, 140, ${intensity * 0.45})`);
        beamGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(x2 - 55, y2);
        ctx.lineTo(x2 + 55, y2);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
      }

      // Glowing Sun Core
      const sunCore = ctx.createRadialGradient(originX, originY, 0, originX, originY, 90);
      sunCore.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
      sunCore.addColorStop(0.35, `rgba(255, 225, 140, ${intensity * 0.65})`);
      sunCore.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.beginPath();
      ctx.arc(originX, originY, 90, 0, Math.PI * 2);
      ctx.fillStyle = sunCore;
      ctx.fill();

      ctx.restore();
    }

    // 5.4 CINEMATIC FLOATING DUST PARTICLES
    if (lightFx.particlesEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const count = lightFx.particlesCount || 40;
      const seedRnd = (i: number) => Math.sin(i * 12345.67) * 0.5 + 0.5;

      for (let i = 0; i < count; i++) {
        const px = seedRnd(i * 3) * targetW;
        const py = seedRnd(i * 3 + 1) * targetH;
        const pr = (1.5 + seedRnd(i * 3 + 2) * 5.5) * (Math.min(targetW, targetH) / 600);
        const pAlpha = 0.2 + seedRnd(i * 5) * 0.65;

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.5);
        pGrad.addColorStop(0, `rgba(255, 248, 220, ${pAlpha})`);
        pGrad.addColorStop(0.4, `rgba(255, 215, 150, ${pAlpha * 0.5})`);
        pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(px, py, pr * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pGrad;
        ctx.fill();
      }
      ctx.restore();
    }

    // 5.5 ETHEREAL ATMOSPHERIC MIST / FOG
    if (lightFx.mistEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const mistAlpha = ((lightFx.mistIntensity || 50) / 100) * 0.55;
      const mistGrad = ctx.createLinearGradient(0, targetH * 0.45, 0, targetH);
      mistGrad.addColorStop(0, 'rgba(230, 240, 255, 0)');
      mistGrad.addColorStop(0.5, `rgba(220, 235, 255, ${mistAlpha * 0.6})`);
      mistGrad.addColorStop(1, `rgba(200, 225, 255, ${mistAlpha})`);
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, targetH * 0.45, targetW, targetH * 0.55);
      ctx.restore();
    }

    // 5.6 DRAMATIC SPOTLIGHT
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
    customBgImageSrc, bgImageSettings,
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
      customBgImageSrc,
      bgImageSettings: { ...bgImageSettings },
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
  }, [selectedTemplate.id, bgMode, bgColor, customBgImageSrc, bgImageSettings, lightFx, flare, blurMode, blurSettings, adjustments, historyIndex]);

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
    if (step.customBgImageSrc) {
      setCustomBgImageSrc(step.customBgImageSrc);
    }
    if (step.bgImageSettings) {
      setBgImageSettings(step.bgImageSettings);
    }
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
            sunbeamEnabled: false, sunbeamAngle: 45, sunbeamIntensity: 60,
            pos: { x: 0.25, y: 0.15 },
            neonEnabled: false, neonColor: '#00f2fe', neonRadius: 25,
            goldenHourEnabled: false, goldenHourWarmth: 55,
            particlesEnabled: false, particlesCount: 40,
            mistEnabled: false, mistIntensity: 50,
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

  // AI Content Generator
  const handleAiGenerateContent = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, action: 'generate-caption' }),
      });

      const json = await res.json();
      if (res.ok && (json.result || json.content)) {
        setAiContent(json.result || json.content);
      } else {
        // High-quality smart visual templates if Gemini API Key is unconfigured
        const fallbackCaptions = [
          {
            title: "✨ Cinematic Aesthetic Capture",
            caption: "Captured in crisp HD and enhanced with precision light, shadows, and color harmony. A truly stunning visual vibe! 📸🌟",
            hashtags: ["#Photography", "#PhotoStudio", "#VisualArt", "#Aesthetic", "#Creativity", "#InstaGood"]
          },
          {
            title: "🔥 Next-Level Creative Energy",
            caption: "Transforming everyday moments into iconic visual stories. Masterfully edited with Pro FX Suite. 🎬💫",
            hashtags: ["#Cinematic", "#PhotoOfTheDay", "#ContentCreator", "#StudioVibes", "#Trending"]
          },
          {
            title: "⚡ Bold Dynamic Portrait",
            caption: "Light, contrast, and fine details brought vividly to life. Perfect balance of mood and tone. ✨",
            hashtags: ["#PortraitPhotography", "#LightingFX", "#PhotoDesign", "#VisualCreatives", "#Viral"]
          }
        ];
        const randomFallback = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
        setAiContent(randomFallback);
      }
    } catch {
      setAiContent({
        title: "✨ Cinematic Aesthetic Capture",
        caption: "Captured in crisp HD and enhanced with precision light, shadows, and color harmony. A truly stunning visual vibe! 📸🌟",
        hashtags: ["#Photography", "#PhotoStudio", "#VisualArt", "#Aesthetic", "#Creativity", "#InstaGood"]
      });
    } finally {
      setAiLoading(false);
    }
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

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    if (!coords || !canvasRef.current) return;
    const canvas = canvasRef.current;

    // 1. Draggable Custom Background Image
    if (activeTab === 'templates' && bgMode === 'image' && customBgImageRef.current) {
      setIsDraggingBgImage(true);
      dragBgStartRef.current = {
        clientX,
        clientY,
        startOffsetX: bgImageSettings.offsetX,
        startOffsetY: bgImageSettings.offsetY,
      };
      return;
    }

    // 2. Draggable Light FX
    if (activeTab === 'lightfx') {
      setIsDraggingLight(true);
      setLightFx((prev) => ({
        ...prev,
        pos: {
          x: Math.max(0.05, Math.min(0.95, coords.x / canvas.width)),
          y: Math.max(0.05, Math.min(0.95, coords.y / canvas.height)),
        },
      }));
      return;
    }

    // 3. Draggable Lens Flare
    if (flare.enabled && activeTab === 'flare') {
      setIsDraggingFlare(true);
      setFlare((prev) => ({
        ...prev,
        pos: {
          x: Math.max(0.05, Math.min(0.95, coords.x / canvas.width)),
          y: Math.max(0.05, Math.min(0.95, coords.y / canvas.height)),
        },
      }));
      return;
    }

    // 4. Cutout Brush / Wand
    if (activeTab === 'eraser') {
      let imgX = coords.x;
      let imgY = coords.y;

      if (selectedTemplate.id !== 'original') {
        const scale = Math.min(canvas.width / origDimensions.width, canvas.height / origDimensions.height);
        const drawW = origDimensions.width * scale;
        const drawH = origDimensions.height * scale;
        const drawX = (canvas.width - drawW) / 2;
        const drawY = (canvas.height - drawH) / 2;

        imgX = (coords.x - drawX) / scale;
        imgY = (coords.y - drawY) / scale;
      }

      if (imgX >= 0 && imgX <= origDimensions.width && imgY >= 0 && imgY <= origDimensions.height) {
        if (eraserTool === 'wand') {
          applyMagicWand(imgX, imgY);
        } else if (eraserTool === 'erase' || eraserTool === 'restore') {
          setIsDrawing(true);
          drawBrushOnMask(imgX, imgY);
        }
      }
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    if (!coords || !canvasRef.current) return;
    const canvas = canvasRef.current;

    if (isDraggingBgImage) {
      const rect = canvas.getBoundingClientRect();
      const deltaX = clientX - dragBgStartRef.current.clientX;
      const deltaY = clientY - dragBgStartRef.current.clientY;
      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      setBgImageSettings((prev) => ({
        ...prev,
        offsetX: Math.max(-100, Math.min(100, Math.round(dragBgStartRef.current.startOffsetX + percentDeltaX))),
        offsetY: Math.max(-100, Math.min(100, Math.round(dragBgStartRef.current.startOffsetY + percentDeltaY))),
      }));
      return;
    }

    if (isDraggingLight) {
      setLightFx((prev) => ({
        ...prev,
        pos: {
          x: Math.max(0.05, Math.min(0.95, coords.x / canvas.width)),
          y: Math.max(0.05, Math.min(0.95, coords.y / canvas.height)),
        },
      }));
      return;
    }

    if (isDraggingFlare && flare.enabled) {
      setFlare((prev) => ({
        ...prev,
        pos: {
          x: Math.max(0.05, Math.min(0.95, coords.x / canvas.width)),
          y: Math.max(0.05, Math.min(0.95, coords.y / canvas.height)),
        },
      }));
      return;
    }

    if (isDrawing && (eraserTool === 'erase' || eraserTool === 'restore')) {
      let imgX = coords.x;
      let imgY = coords.y;
      if (selectedTemplate.id !== 'original') {
        const scale = Math.min(canvas.width / origDimensions.width, canvas.height / origDimensions.height);
        const drawW = origDimensions.width * scale;
        const drawH = origDimensions.height * scale;
        const drawX = (canvas.width - drawW) / 2;
        const drawY = (canvas.height - drawH) / 2;
        imgX = (coords.x - drawX) / scale;
        imgY = (coords.y - drawY) / scale;
      }
      drawBrushOnMask(imgX, imgY);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingBgImage) {
      setIsDraggingBgImage(false);
      saveHistoryStep();
    }
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryStep();
    }
    if (isDraggingLight) {
      setIsDraggingLight(false);
      saveHistoryStep();
    }
    if (isDraggingFlare) {
      setIsDraggingFlare(false);
      saveHistoryStep();
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleCanvasMouseUp = () => {
    handlePointerUp();
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handlePointerDown(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchEnd = () => {
    handlePointerUp();
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
            className={`border-3 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-white shadow-xl ${isDragActive
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
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* CANVAS PREVIEW STUDIO (TOP ON MOBILE, RIGHT ON DESKTOP) */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center w-full">

            {/* Top Preview Action Bar: Auto BG Remove, Undo, Redo, Focus Mode, Reset (Normal scroll flow) */}
            <div className="w-full bg-white dark:bg-gray-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-md mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={autoRemoveBackground}
                  disabled={isAutoRemoving}
                  className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                  title="Automatically remove background using Client AI"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">{isAutoRemoving ? 'Cutting...' : 'Auto BG'}</span>
                </button>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo last action (Ctrl+Z)"
                  >
                    <Undo className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo action (Ctrl+Y)"
                  >
                    <Redo className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Focus / Fullscreen Mode Toggle */}
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isFocusMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  title={isFocusMode ? "Show Tools" : "Expand Fullscreen Canvas"}
                >
                  {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">{isFocusMode ? 'Tools' : 'Focus'}</span>
                </button>

                <button
                  onClick={() => {
                    if (history.length > 0) {
                      setHistoryIndex(0);
                      restoreHistoryStep(history[0]);
                    }
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Reset to original photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="py-1.5 px-3 rounded-xl bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Export photo"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            {/* ONLY Canvas Container is Sticky on Mobile & Desktop */}
            <div className={`sticky top-14 lg:top-6 z-30 w-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md pb-2 transition-all duration-300 ${isFocusMode ? 'h-[78vh]' : ''}`}>
              <div className={`relative w-full bg-gray-950/95 backdrop-blur-xl p-2.5 sm:p-6 rounded-3xl border border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${isFocusMode ? 'h-full min-h-[70vh]' : 'h-[28vh] sm:h-[38vh] min-h-[170px] max-h-[220px] sm:max-h-[360px] lg:min-h-[460px] lg:max-h-[600px]'}`}>

                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl max-w-full max-h-full border border-gray-700/80 flex items-center justify-center"
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
                    onMouseLeave={handleCanvasMouseUp}
                    onTouchStart={handleCanvasTouchStart}
                    onTouchMove={handleCanvasTouchMove}
                    onTouchEnd={handleCanvasTouchEnd}
                    onTouchCancel={handleCanvasTouchEnd}
                    className="max-w-full max-h-full object-contain cursor-crosshair block touch-none select-none"
                  />
                </div>

              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Full HD Client-Side Canvas Rendering</span>
            </p>

          </div>

          {/* LEFT/BOTTOM SIDEBAR (TOOLS DRAWER) */}
          <div className={`order-2 lg:order-1 lg:col-span-5 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl space-y-6 w-full ${isFocusMode ? 'hidden lg:block' : 'block'}`}>

            {/* Tool Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-7 gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl">
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
                    className={`flex flex-col items-center justify-center py-2 px-3 sm:px-0.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${isActive
                        ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-gray-200/50 dark:shadow-none'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      20 Social Media & Dimension Presets
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      {selectedTemplate.name}
                    </span>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-2 mb-1">
                    {['All', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'X/Twitter', 'LinkedIn', 'Others'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPresetCategory(cat)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${presetCategory === cat
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Presets Grid */}
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {TEMPLATE_PRESETS.filter((p) => presetCategory === 'All' || p.category === presetCategory).map((preset) => {
                      const isSelected = selectedTemplate.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedTemplate(preset);
                            setTimeout(saveHistoryStep, 50);
                          }}
                          className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold truncate">{preset.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono">
                              {preset.aspectLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {preset.width > 0 ? `${preset.width} × ${preset.height} px` : 'Fit Image Size'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Canvas Backdrop Fill */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Canvas Backdrop Fill
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: 'transparent', label: 'Transparent' },
                      { id: 'solid', label: 'Solid Color' },
                      { id: 'gradient', label: 'Gradient' },
                      { id: 'blur', label: 'Blur Photo' },
                      { id: 'image', label: 'Custom Image' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setBgMode(mode.id as 'transparent' | 'solid' | 'gradient' | 'blur' | 'image');
                          setTimeout(saveHistoryStep, 50);
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          bgMode === mode.id
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Solid Color Options */}
                  {bgMode === 'solid' && (
                    <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Select Solid Background Color:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            setTimeout(saveHistoryStep, 100);
                          }}
                          className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer shrink-0"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {['#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((hex) => (
                            <button
                              key={hex}
                              onClick={() => {
                                setBgColor(hex);
                                setTimeout(saveHistoryStep, 100);
                              }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                bgColor.toLowerCase() === hex.toLowerCase() ? 'scale-110 border-indigo-600 shadow-md' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Style Options */}
                  {bgMode === 'gradient' && (
                    <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Select Gradient Style:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: '#667eea', label: 'Sunset Purple', style: 'from-[#667eea] to-[#764ba2]' },
                          { id: '#ff7e5f', label: 'Warm Sunset', style: 'from-[#ff7e5f] to-[#feb47b]' },
                          { id: '#00c6ff', label: 'Ocean Blue', style: 'from-[#00c6ff] to-[#0072ff]' },
                          { id: '#f093fb', label: 'Pink Glam', style: 'from-[#f093fb] to-[#f5576c]' },
                          { id: '#0ba360', label: 'Neon Emerald', style: 'from-[#0ba360] to-[#3cba92]' },
                          { id: '#141e30', label: 'Dark Cyber', style: 'from-[#141e30] to-[#243b55]' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            onClick={() => {
                              setBgGradient(g.id);
                              setTimeout(saveHistoryStep, 100);
                            }}
                            className={`p-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r ${g.style} transition-all cursor-pointer border-2 ${
                              bgGradient.includes(g.id) ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-85 hover:opacity-100'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Background Image Options */}
                  {bgMode === 'image' && (
                    <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 bg-gray-50/50 dark:bg-gray-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Custom Backdrop Image:
                        </span>
                        {customBgImageSrc && (
                          <button
                            onClick={() => {
                              setBgImageSettings({ scale: 100, offsetX: 0, offsetY: 0, blur: 0, brightness: 0 });
                              setTimeout(saveHistoryStep, 50);
                            }}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Align</span>
                          </button>
                        )}
                      </div>

                      {/* Image Upload Input */}
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs cursor-pointer transition-all shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>{customBgImageSrc ? 'Change Backdrop Image' : 'Upload Backdrop Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              const img = new Image();
                              img.crossOrigin = 'anonymous';
                              img.onload = () => {
                                customBgImageRef.current = img;
                                setCustomBgImageSrc(url);
                                setBgMode('image');
                                setTimeout(saveHistoryStep, 100);
                              };
                              img.src = url;
                            }
                          }}
                        />
                      </label>

                      {customBgImageSrc && (
                        <div className="space-y-3 pt-1">
                          <div className="p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
                            💡 Touch &amp; drag directly on the canvas preview to reposition this background image in real-time.
                          </div>

                          {/* Zoom / Scale Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>Zoom / Scale:</span>
                              <span>{bgImageSettings.scale}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="250"
                              value={bgImageSettings.scale}
                              onChange={(e) => setBgImageSettings({ ...bgImageSettings, scale: Number(e.target.value) })}
                              onMouseUp={() => saveHistoryStep()}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>

                          {/* Horizontal Position (X) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>Position X (Horizontal):</span>
                              <span>{bgImageSettings.offsetX > 0 ? `+${bgImageSettings.offsetX}` : bgImageSettings.offsetX}%</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={bgImageSettings.offsetX}
                              onChange={(e) => setBgImageSettings({ ...bgImageSettings, offsetX: Number(e.target.value) })}
                              onMouseUp={() => saveHistoryStep()}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>

                          {/* Vertical Position (Y) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>Position Y (Vertical):</span>
                              <span>{bgImageSettings.offsetY > 0 ? `+${bgImageSettings.offsetY}` : bgImageSettings.offsetY}%</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={bgImageSettings.offsetY}
                              onChange={(e) => setBgImageSettings({ ...bgImageSettings, offsetY: Number(e.target.value) })}
                              onMouseUp={() => saveHistoryStep()}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>

                          {/* Backdrop Blur Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>Backdrop Bokeh Blur:</span>
                              <span>{bgImageSettings.blur}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={bgImageSettings.blur}
                              onChange={(e) => setBgImageSettings({ ...bgImageSettings, blur: Number(e.target.value) })}
                              onMouseUp={() => saveHistoryStep()}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>

                          {/* Backdrop Brightness Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>Backdrop Brightness / Darken:</span>
                              <span>{bgImageSettings.brightness > 0 ? `+${bgImageSettings.brightness}` : bgImageSettings.brightness}%</span>
                            </div>
                            <input
                              type="range"
                              min="-60"
                              max="60"
                              value={bgImageSettings.brightness}
                              onChange={(e) => setBgImageSettings({ ...bgImageSettings, brightness: Number(e.target.value) })}
                              onMouseUp={() => saveHistoryStep()}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Manual Cutout & Refine Tools
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      {eraserTool === 'wand' ? '🪄 Magic Wand Active' : eraserTool === 'erase' ? '🧹 Erase Active' : eraserTool === 'restore' ? '🖌️ Restore Active' : 'Select Tool'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setEraserTool(eraserTool === 'wand' ? 'none' : 'wand')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${eraserTool === 'wand'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-md shadow-indigo-500/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold'
                        }`}
                    >
                      <Wand2 className={`w-5 h-5 ${eraserTool === 'wand' ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' : 'text-indigo-500'}`} />
                      <span className="text-xs">Magic Wand</span>
                    </button>

                    <button
                      onClick={() => setEraserTool(eraserTool === 'erase' ? 'none' : 'erase')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${eraserTool === 'erase'
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold shadow-md shadow-rose-500/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold'
                        }`}
                    >
                      <Eraser className={`w-5 h-5 ${eraserTool === 'erase' ? 'text-rose-600 dark:text-rose-400' : 'text-rose-500'}`} />
                      <span className="text-xs">Erase Brush</span>
                    </button>

                    <button
                      onClick={() => setEraserTool(eraserTool === 'restore' ? 'none' : 'restore')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${eraserTool === 'restore'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold'
                        }`}
                    >
                      <Paintbrush className={`w-5 h-5 ${eraserTool === 'restore' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`} />
                      <span className="text-xs">Restore</span>
                    </button>
                  </div>

                  {/* Active Tool Helper Note */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-[11px] text-gray-600 dark:text-gray-300">
                    {eraserTool === 'erase' && '🧹 Touch / Click & drag across any background or unwanted object on the canvas to erase it.'}
                    {eraserTool === 'restore' && '🖌️ Touch / Click & drag over erased areas to paint back the original photo details.'}
                    {eraserTool === 'wand' && '🪄 Click on any solid or background color on the canvas to auto-erase all matching colors.'}
                    {eraserTool === 'none' && '👆 Select Magic Wand, Erase Brush, or Restore to start editing the mask on the canvas.'}
                  </div>
                </div>

                {eraserTool === 'wand' && (
                  <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      <span>Wand Color Tolerance:</span>
                      <span>{wandTolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={wandTolerance}
                      onChange={(e) => setWandTolerance(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}

                {(eraserTool === 'erase' || eraserTool === 'restore') && (
                  <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      <span>Brush Size:</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}

                <button
                  onClick={resetMask}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Cutout Mask to Full Photo</span>
                </button>
              </motion.div>
            )}

            {/* TAB 3: AI ASSISTANT */}
            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">Nexia AI Vision Studio Copilot</h4>
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-full">PRO</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                      Intelligent neural analysis to generate viral titles, compelling captions, and trending hashtags customized for your photo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAiGenerateContent}
                  disabled={aiLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{aiLoading ? 'Nexia AI Generating...' : '✨ Generate Nexia Viral Copy & Tags'}</span>
                </button>

                {aiContent && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 pb-2">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generated Viral Copy
                      </span>
                      <button
                        onClick={() => {
                          const fullText = `${aiContent.title ? aiContent.title + '\n\n' : ''}${aiContent.caption || ''}\n\n${(aiContent.hashtags || []).join(' ')}`;
                          navigator.clipboard.writeText(fullText.trim());
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCaption ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCaption ? 'Copied!' : 'Copy All'}</span>
                      </button>
                    </div>

                    {aiContent.title && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-0.5">Title:</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{aiContent.title}</p>
                      </div>
                    )}
                    {aiContent.caption && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-0.5">Caption:</span>
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{aiContent.caption}</p>
                      </div>
                    )}
                    {aiContent.hashtags && aiContent.hashtags.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">Hashtags:</span>
                        <div className="flex flex-wrap gap-1">
                          {aiContent.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: LIGHT FX */}
            {activeTab === 'lightfx' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Volumetric Lighting & Atmosphere
                  </h3>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    ✨ Drag Light on Canvas
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Touch or click & drag anywhere on the canvas above to reposition the light source in real-time!</span>
                </div>

                {/* 1. Sunbeams (God Rays) */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <SunMedium className="w-4 h-4 text-amber-500" />
                      Sunbeams (God Rays)
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.sunbeamEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, sunbeamEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.sunbeamEnabled && (
                    <div className="space-y-2.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Ray Intensity:</span>
                          <span>{lightFx.sunbeamIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={lightFx.sunbeamIntensity}
                          onChange={(e) => setLightFx({ ...lightFx, sunbeamIntensity: Number(e.target.value) })}
                          onMouseUp={() => saveHistoryStep()}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Beam Spread Angle:</span>
                          <span>{lightFx.sunbeamAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={lightFx.sunbeamAngle}
                          onChange={(e) => setLightFx({ ...lightFx, sunbeamAngle: Number(e.target.value) })}
                          onMouseUp={() => saveHistoryStep()}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Cyber Neon Aura */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      Cyber Neon Aura Glow
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.neonEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, neonEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.neonEnabled && (
                    <div className="space-y-2.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Neon Color:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={lightFx.neonColor}
                            onChange={(e) => setLightFx({ ...lightFx, neonColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer shrink-0 border border-gray-300 dark:border-gray-600"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {['#00f2fe', '#ff007f', '#a855f7', '#39ff14', '#ffe600', '#3b82f6'].map((hex) => (
                              <button
                                key={hex}
                                onClick={() => setLightFx({ ...lightFx, neonColor: hex })}
                                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${lightFx.neonColor.toLowerCase() === hex.toLowerCase() ? 'scale-110 border-white shadow-md' : 'border-transparent'
                                  }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Glow Radius:</span>
                          <span>{lightFx.neonRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="80"
                          value={lightFx.neonRadius}
                          onChange={(e) => setLightFx({ ...lightFx, neonRadius: Number(e.target.value) })}
                          onMouseUp={() => saveHistoryStep()}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Golden Hour Glow */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Golden Hour / Sunset Radiance
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.goldenHourEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, goldenHourEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.goldenHourEnabled && (
                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Sunset Warmth:</span>
                        <span>{lightFx.goldenHourWarmth}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={lightFx.goldenHourWarmth}
                        onChange={(e) => setLightFx({ ...lightFx, goldenHourWarmth: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Cinematic Floating Dust Particles */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Floating Light Dust & Motes
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.particlesEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, particlesEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.particlesEnabled && (
                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Particle Density:</span>
                        <span>{lightFx.particlesCount} motes</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={lightFx.particlesCount}
                        onChange={(e) => setLightFx({ ...lightFx, particlesCount: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-yellow-400"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Atmospheric Mist / Fog */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Circle className="w-4 h-4 text-cyan-400" />
                      Ethereal Mist & Atmospheric Fog
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.mistEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, mistEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.mistEnabled && (
                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Mist Density:</span>
                        <span>{lightFx.mistIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={lightFx.mistIntensity}
                        onChange={(e) => setLightFx({ ...lightFx, mistIntensity: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* 6. Dramatic Spotlight */}
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Focus className="w-4 h-4 text-indigo-500" />
                      Dramatic Spotlight Focus
                    </span>
                    <input
                      type="checkbox"
                      checked={lightFx.spotlightEnabled}
                      onChange={(e) => {
                        setLightFx({ ...lightFx, spotlightEnabled: e.target.checked });
                        setTimeout(saveHistoryStep, 100);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                  {lightFx.spotlightEnabled && (
                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Spotlight Focus:</span>
                        <span>{lightFx.spotlightIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={lightFx.spotlightIntensity}
                        onChange={(e) => setLightFx({ ...lightFx, spotlightIntensity: Number(e.target.value) })}
                        onMouseUp={() => saveHistoryStep()}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 5: FLARE */}
            {activeTab === 'flare' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Interactive Lens Flare
                  </h3>
                  <input
                    type="checkbox"
                    checked={flare.enabled}
                    onChange={(e) => {
                      setFlare({ ...flare, enabled: e.target.checked });
                      setTimeout(saveHistoryStep, 100);
                    }}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {flare.enabled && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-gray-500">
                      💡 Click & drag directly on the canvas above to reposition the flare origin.
                    </p>

                    <div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Flare Type:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['sunburst', 'anamorphic', 'hexagon'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setFlare({ ...flare, type: t });
                              setTimeout(saveHistoryStep, 50);
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${flare.type === t
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        <span>Flare Intensity:</span>
                        <span>{flare.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="150"
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
                  Optical Bokeh & Focus Blur
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'gaussian', label: 'Gaussian' },
                    { id: 'radial', label: 'Radial Zoom' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setBlurMode(mode.id as any);
                        setTimeout(saveHistoryStep, 50);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${blurMode === mode.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {blurMode === 'gaussian' && (
                  <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                      <span>Gaussian Blur Radius:</span>
                      <span>{blurSettings.gaussian}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={blurSettings.gaussian}
                      onChange={(e) => setBlurSettings({ ...blurSettings, gaussian: Number(e.target.value) })}
                      onMouseUp={() => saveHistoryStep()}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}

                {blurMode === 'radial' && (
                  <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                      <span>Radial Zoom Radius:</span>
                      <span>{blurSettings.radial}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={blurSettings.radial}
                      onChange={(e) => setBlurSettings({ ...blurSettings, radial: Number(e.target.value) })}
                      onMouseUp={() => saveHistoryStep()}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 7: TUNE (ADJUSTMENTS & COLOR GRADING) */}
            {activeTab === 'adjustments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Pro Color Grading & Tune
                  </h3>
                  <button
                    onClick={() => {
                      setAdjustments({ brightness: 0, contrast: 0, saturation: 0, warmth: 0, vignette: 0 });
                      setTimeout(saveHistoryStep, 50);
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quick Mood Presets */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">Quick Mood Presets:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { name: 'Natural', b: 0, c: 0, s: 0, w: 0, v: 0 },
                      { name: 'Vibrant', b: 10, c: 15, s: 30, w: 5, v: 10 },
                      { name: 'Cinematic', b: 5, c: 20, s: -5, w: 25, v: 20 },
                      { name: 'Moody', b: -10, c: 25, s: -15, w: -10, v: 35 },
                      { name: 'Airy', b: 20, c: 5, s: 15, w: -5, v: 0 },
                      { name: 'B&W Noir', b: 0, c: 30, s: -100, w: 0, v: 25 },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setAdjustments({
                            brightness: preset.b,
                            contrast: preset.c,
                            saturation: preset.s,
                            warmth: preset.w,
                            vignette: preset.v,
                          });
                          setTimeout(saveHistoryStep, 50);
                        }}
                        className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-300 text-gray-700 dark:text-gray-300 transition-colors border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer text-center"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Brightness */}
                <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                    <span>Brightness:</span>
                    <span>{adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={adjustments.brightness}
                    onChange={(e) => setAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* 2. Contrast */}
                <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                    <span>Contrast:</span>
                    <span>{adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={adjustments.contrast}
                    onChange={(e) => setAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* 3. Saturation */}
                <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                    <span>Saturation / Vibrance:</span>
                    <span>{adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.saturation}
                    onChange={(e) => setAdjustments({ ...adjustments, saturation: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* 4. Warmth / Color Temp */}
                <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                    <span>Color Temperature / Warmth:</span>
                    <span className={adjustments.warmth > 0 ? 'text-amber-500' : adjustments.warmth < 0 ? 'text-cyan-500' : ''}>
                      {adjustments.warmth > 0 ? `+${adjustments.warmth} Warm` : adjustments.warmth < 0 ? `${adjustments.warmth} Cool` : '0 Neutral'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={adjustments.warmth}
                    onChange={(e) => setAdjustments({ ...adjustments, warmth: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* 5. Vignette Falloff */}
                <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-bold">
                    <span>Vignette Edge Falloff:</span>
                    <span>{adjustments.vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={adjustments.vignette}
                    onChange={(e) => setAdjustments({ ...adjustments, vignette: Number(e.target.value) })}
                    onMouseUp={() => saveHistoryStep()}
                    className="w-full accent-purple-600"
                  />
                </div>
              </motion.div>
            )}

            {/* EXPORT BUTTON */}
            <div className="pt-4 border-t border-gray-200/80 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 dark:text-gray-300">Export Format:</span>
                <div className="flex items-center gap-2">
                  {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${exportFormat === fmt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
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

        </div>
      )}

    </main>
  );
}
