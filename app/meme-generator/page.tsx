'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Smile, Upload, Download, Copy, Check, Type, Layers, Trash2, RotateCw, ZoomIn, Eye, Image as ImageIcon, Undo2, Redo2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ImageLayer {
  id: string;
  name: string;
  img: HTMLImageElement;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale: number; // 0.1 - 3.0
  rotation: number; // -180 to 180
  opacity: number; // 0.1 - 1.0
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
}

export interface HistorySnapshot {
  topText: string;
  bottomText: string;
  topStyle: TextStyle;
  bottomStyle: TextStyle;
  topTextPos: { x: number; y: number };
  bottomTextPos: { x: number; y: number };
  overlayLayersData: {
    id: string;
    name: string;
    imgSrc: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  }[];
  selectedEmoji: string | null;
  aspectRatio: 'original' | '1:1' | '16:9' | '4:5';
}

// Background Presets data URIs
const MEME_PRESETS = [
  {
    name: 'Synthwave Banner',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="m1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230f051d"/><stop offset="50%" stop-color="%23290942"/><stop offset="100%" stop-color="%23671268"/></linearGradient></defs><rect width="800" height="450" fill="url(%23m1)"/><circle cx="400" cy="225" r="140" fill="%23ff2a85" opacity="0.85"/><line x1="0" y1="300" x2="800" y2="300" stroke="%2300f5d4" stroke-width="3"/><line x1="0" y1="350" x2="800" y2="350" stroke="%2300f5d4" stroke-width="2"/><line x1="0" y1="400" x2="800" y2="400" stroke="%2300f5d4" stroke-width="1"/></svg>',
  },
  {
    name: 'Cyberpunk Neon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%230a0a12"/><circle cx="200" cy="150" r="180" fill="%237928ca" opacity="0.5" filter="blur(40px)"/><circle cx="600" cy="300" r="180" fill="%23ff0080" opacity="0.5" filter="blur(40px)"/></svg>',
  },
  {
    name: 'Modern Gradient',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="m3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233b82f6"/><stop offset="50%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="800" height="450" fill="url(%23m3)"/></svg>',
  },
];

// PNG Overlay Presets
const PRESET_OVERLAYS = [
  {
    name: 'Verified Badge',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="%231d9bf0"/><path d="M42 60l12 12 24-24" stroke="%23ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    name: 'Golden Crown',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100"><path d="M10 80h100l10-60-35 25-25-40-25 40-35-25z" fill="%23ffb703" stroke="%23fb8500" stroke-width="6"/><circle cx="10" cy="20" r="8" fill="%23d00000"/><circle cx="60" cy="5" r="8" fill="%23d00000"/><circle cx="110" cy="20" r="8" fill="%23d00000"/></svg>',
  },
  {
    name: 'Fire Badge',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><path d="M60 10c0 30-30 40-30 70a30 30 0 0 0 60 0c0-30-30-40-30-70z" fill="%23ff4800"/><path d="M60 40c0 20-20 25-20 45a20 20 0 0 0 40 0c0-20-20-25-20-45z" fill="%23ffb700"/></svg>',
  },
  {
    name: 'Thug Glasses',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70"><path d="M10 15h140v15H10z" fill="%23111"/><path d="M15 25c0 25 15 35 30 35s30-10 30-35zM85 25c0 25 15 35 30 35s30-10 30-35z" fill="%23111" stroke="%23333" stroke-width="4"/><path d="M25 30h20v5H25zM95 30h20v5H95z" fill="%23ffffff" opacity="0.6"/></svg>',
  },
];

const EMOJI_LIST = ['🔥', '😂', '🚀', '💯', '👑', '🎯', '✨', '⚡'];

export default function MemeGeneratorPage() {
  const [topText, setTopText] = useState('WHEN YOUR CODE COMPILES');
  const [bottomText, setBottomText] = useState('ON THE FIRST TRY');

  // Independent Styling for Top Text and Bottom Text
  const [topStyle, setTopStyle] = useState<TextStyle>({
    fontSize: 48,
    fontFamily: 'Impact',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 6,
    isUppercase: true,
  });

  const [bottomStyle, setBottomStyle] = useState<TextStyle>({
    fontSize: 48,
    fontFamily: 'Impact',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 6,
    isUppercase: true,
  });

  const [selectedTextTarget, setSelectedTextTarget] = useState<'top' | 'bottom'>('top');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'original' | '1:1' | '16:9' | '4:5'>('16:9');
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Multi-layer overlay image & text position states
  const [topTextPos, setTopTextPos] = useState({ x: 50, y: 12 });
  const [bottomTextPos, setBottomTextPos] = useState({ x: 50, y: 88 });
  const [activeDragTarget, setActiveDragTarget] = useState<'topText' | 'bottomText' | 'layer' | null>(null);

  const [overlayLayers, setOverlayLayers] = useState<ImageLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ref-based Undo / Redo History Engine
  const historyRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isRestoringRef = useRef<boolean>(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const overlayFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Active text style helper
  const activeStyle = selectedTextTarget === 'top' ? topStyle : bottomStyle;

  const updateActiveTextStyle = (updates: Partial<TextStyle>) => {
    if (selectedTextTarget === 'top') {
      setTopStyle((prev) => ({ ...prev, ...updates }));
    } else {
      setBottomStyle((prev) => ({ ...prev, ...updates }));
    }
  };

  // Push Snapshot into History Stack safely using refs
  const pushHistorySnapshot = useCallback(() => {
    if (isRestoringRef.current) return;

    const snapshot: HistorySnapshot = {
      topText,
      bottomText,
      topStyle: { ...topStyle },
      bottomStyle: { ...bottomStyle },
      topTextPos: { ...topTextPos },
      bottomTextPos: { ...bottomTextPos },
      overlayLayersData: overlayLayers.map((l) => ({
        id: l.id,
        name: l.name,
        imgSrc: l.img.src,
        x: l.x,
        y: l.y,
        scale: l.scale,
        rotation: l.rotation,
        opacity: l.opacity,
      })),
      selectedEmoji,
      aspectRatio,
    };

    const currentIdx = historyIndexRef.current;
    const nextStack = historyRef.current.slice(0, currentIdx + 1);
    nextStack.push(snapshot);
    if (nextStack.length > 40) nextStack.shift();

    historyRef.current = nextStack;
    historyIndexRef.current = nextStack.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [topText, bottomText, topStyle, bottomStyle, topTextPos, bottomTextPos, overlayLayers, selectedEmoji, aspectRatio]);

  // Initial history snapshot load
  useEffect(() => {
    if (historyRef.current.length === 0 && imageSrc) {
      pushHistorySnapshot();
    }
  }, [imageSrc, pushHistorySnapshot]);

  // Restore Snapshot
  const restoreSnapshot = useCallback((snapshot: HistorySnapshot) => {
    isRestoringRef.current = true;

    setTopText(snapshot.topText);
    setBottomText(snapshot.bottomText);
    setTopStyle({ ...snapshot.topStyle });
    setBottomStyle({ ...snapshot.bottomStyle });
    setTopTextPos({ ...snapshot.topTextPos });
    setBottomTextPos({ ...snapshot.bottomTextPos });
    setSelectedEmoji(snapshot.selectedEmoji);
    setAspectRatio(snapshot.aspectRatio);

    if (snapshot.overlayLayersData.length === 0) {
      setOverlayLayers([]);
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
      return;
    }

    const rebuiltLayers: ImageLayer[] = [];
    let loadedCount = 0;

    snapshot.overlayLayersData.forEach((layerData) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        rebuiltLayers.push({
          id: layerData.id,
          name: layerData.name,
          img,
          x: layerData.x,
          y: layerData.y,
          scale: layerData.scale,
          rotation: layerData.rotation,
          opacity: layerData.opacity,
        });
        loadedCount++;
        if (loadedCount === snapshot.overlayLayersData.length) {
          setOverlayLayers(rebuiltLayers);
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        }
      };
      img.src = layerData.imgSrc;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      const targetIdx = historyIndexRef.current - 1;
      historyIndexRef.current = targetIdx;
      restoreSnapshot(historyRef.current[targetIdx]);
      setCanUndo(targetIdx > 0);
      setCanRedo(targetIdx < historyRef.current.length - 1);
    }
  }, [restoreSnapshot]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const targetIdx = historyIndexRef.current + 1;
      historyIndexRef.current = targetIdx;
      restoreSnapshot(historyRef.current[targetIdx]);
      setCanUndo(targetIdx > 0);
      setCanRedo(targetIdx < historyRef.current.length - 1);
    }
  }, [restoreSnapshot]);

  // Global Keyboard Shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA');

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Render canvas (Base photo + Image Overlay Layers + Independent Text Styling)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    if (!img) return;

    // Calculate canvas size based on aspect ratio
    let targetWidth = img.naturalWidth || 800;
    let targetHeight = img.naturalHeight || 450;

    if (aspectRatio === '1:1') {
      targetHeight = targetWidth;
    } else if (aspectRatio === '16:9') {
      targetHeight = Math.round((targetWidth * 9) / 16);
    } else if (aspectRatio === '4:5') {
      targetHeight = Math.round((targetWidth * 5) / 4);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // 1. Clear & Draw background cover fill
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = targetWidth / targetHeight;
    let drawW = targetWidth;
    let drawH = targetHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > targetRatio) {
      drawW = targetHeight * imgRatio;
      offsetX = (targetWidth - drawW) / 2;
    } else {
      drawH = targetWidth / imgRatio;
      offsetY = (targetHeight - drawH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

    // 2. Draw Multi-layer Overlay Images
    overlayLayers.forEach((layer) => {
      const lx = (targetWidth * layer.x) / 100;
      const ly = (targetHeight * layer.y) / 100;
      const baseW = layer.img.naturalWidth || 120;
      const baseH = layer.img.naturalHeight || 120;
      
      const baseFitScale = Math.min((targetWidth * 0.3) / baseW, (targetHeight * 0.3) / baseH, 1.0);
      const w = baseW * baseFitScale * layer.scale;
      const h = baseH * baseFitScale * layer.scale;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.img, -w / 2, -h / 2, w, h);

      // Draw dashed selection outline if active
      if (layer.id === activeLayerId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
      }
      ctx.restore();
    });

    // 3. Render Top Text with topStyle
    const topStr = topStyle.isUppercase ? topText.toUpperCase() : topText;
    if (topStr.trim()) {
      ctx.save();
      ctx.fillStyle = topStyle.textColor;
      ctx.strokeStyle = topStyle.strokeColor;
      ctx.lineWidth = topStyle.strokeWidth;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${topStyle.fontSize}px "${topStyle.fontFamily}", sans-serif`;

      const tx = (targetWidth * topTextPos.x) / 100;
      const ty = (targetHeight * topTextPos.y) / 100;
      if (topStyle.strokeWidth > 0) ctx.strokeText(topStr, tx, ty);
      ctx.fillText(topStr, tx, ty);

      if (activeDragTarget === 'topText' || (selectedTextTarget === 'top' && !activeLayerId)) {
        const textWidth = ctx.measureText(topStr).width;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(tx - textWidth / 2 - 10, ty - topStyle.fontSize / 2 - 6, textWidth + 20, topStyle.fontSize + 12);
      }
      ctx.restore();
    }

    // 4. Render Bottom Text with bottomStyle
    const bottomStr = bottomStyle.isUppercase ? bottomText.toUpperCase() : bottomText;
    if (bottomStr.trim()) {
      ctx.save();
      ctx.fillStyle = bottomStyle.textColor;
      ctx.strokeStyle = bottomStyle.strokeColor;
      ctx.lineWidth = bottomStyle.strokeWidth;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${bottomStyle.fontSize}px "${bottomStyle.fontFamily}", sans-serif`;

      const bx = (targetWidth * bottomTextPos.x) / 100;
      const by = (targetHeight * bottomTextPos.y) / 100;
      if (bottomStyle.strokeWidth > 0) ctx.strokeText(bottomStr, bx, by);
      ctx.fillText(bottomStr, bx, by);

      if (activeDragTarget === 'bottomText' || (selectedTextTarget === 'bottom' && !activeLayerId)) {
        const textWidth = ctx.measureText(bottomStr).width;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(bx - textWidth / 2 - 10, by - bottomStyle.fontSize / 2 - 6, textWidth + 20, bottomStyle.fontSize + 12);
      }
      ctx.restore();
    }

    // 5. Draw Sticker if selected
    if (selectedEmoji) {
      ctx.font = `48px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedEmoji, targetWidth * 0.88, targetHeight * 0.14);
    }
  }, [topText, bottomText, topStyle, bottomStyle, topTextPos, bottomTextPos, selectedTextTarget, selectedEmoji, aspectRatio, overlayLayers, activeLayerId, activeDragTarget]);

  // Load background image
  const loadBgImage = useCallback((src: string) => {
    setImageSrc(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
    img.src = src;
  }, [renderCanvas]);

  // Add overlay image layer
  const addOverlayLayer = useCallback((src: string, name: string = 'Overlay Image') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const newLayer: ImageLayer = {
        id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        img,
        x: 50,
        y: 50,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      };
      setOverlayLayers((prev) => [...prev, newLayer]);
      setActiveLayerId(newLayer.id);
      setActiveDragTarget('layer');
      setTimeout(() => pushHistorySnapshot(), 100);
    };
    img.src = src;
  }, [pushHistorySnapshot]);

  // Initial preset image load ON MOUNT ONLY
  useEffect(() => {
    loadBgImage(MEME_PRESETS[0].url);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render canvas on control / layer state changes
  useEffect(() => {
    if (imageObjRef.current) {
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          renderCanvas();
        });
      } else {
        renderCanvas();
      }
    }
  }, [renderCanvas]);

  // Mouse canvas hit test & drag handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check hit on Top Text
    if (topText.trim()) {
      const topStr = topStyle.isUppercase ? topText.toUpperCase() : topText;
      const tx = (canvas.width * topTextPos.x) / 100;
      const ty = (canvas.height * topTextPos.y) / 100;
      if (ctx) {
        ctx.font = `900 ${topStyle.fontSize}px "${topStyle.fontFamily}", sans-serif`;
        const tw = ctx.measureText(topStr).width;
        if (
          mouseX >= tx - tw / 2 - 12 &&
          mouseX <= tx + tw / 2 + 12 &&
          mouseY >= ty - topStyle.fontSize / 2 - 12 &&
          mouseY <= ty + topStyle.fontSize / 2 + 12
        ) {
          setSelectedTextTarget('top');
          setActiveDragTarget('topText');
          setActiveLayerId(null);
          setIsDraggingLayer(true);
          setDragOffset({ x: mouseX - tx, y: mouseY - ty });
          return;
        }
      }
    }

    // Check hit on Bottom Text
    if (bottomText.trim()) {
      const bottomStr = bottomStyle.isUppercase ? bottomText.toUpperCase() : bottomText;
      const bx = (canvas.width * bottomTextPos.x) / 100;
      const by = (canvas.height * bottomTextPos.y) / 100;
      if (ctx) {
        ctx.font = `900 ${bottomStyle.fontSize}px "${bottomStyle.fontFamily}", sans-serif`;
        const bw = ctx.measureText(bottomStr).width;
        if (
          mouseX >= bx - bw / 2 - 12 &&
          mouseX <= bx + bw / 2 + 12 &&
          mouseY >= by - bottomStyle.fontSize / 2 - 12 &&
          mouseY <= by + bottomStyle.fontSize / 2 + 12
        ) {
          setSelectedTextTarget('bottom');
          setActiveDragTarget('bottomText');
          setActiveLayerId(null);
          setIsDraggingLayer(true);
          setDragOffset({ x: mouseX - bx, y: mouseY - by });
          return;
        }
      }
    }

    // Check hit on overlay layers (from top to bottom)
    for (let i = overlayLayers.length - 1; i >= 0; i--) {
      const layer = overlayLayers[i];
      const lx = (canvas.width * layer.x) / 100;
      const ly = (canvas.height * layer.y) / 100;
      const baseW = layer.img.naturalWidth || 120;
      const baseH = layer.img.naturalHeight || 120;
      const baseFitScale = Math.min((canvas.width * 0.3) / baseW, (canvas.height * 0.3) / baseH, 1.0);
      const w = baseW * baseFitScale * layer.scale;
      const h = baseH * baseFitScale * layer.scale;

      if (
        mouseX >= lx - w / 2 &&
        mouseX <= lx + w / 2 &&
        mouseY >= ly - h / 2 &&
        mouseY <= ly + h / 2
      ) {
        setActiveLayerId(layer.id);
        setActiveDragTarget('layer');
        setIsDraggingLayer(true);
        setDragOffset({ x: mouseX - lx, y: mouseY - ly });
        return;
      }
    }

    // Clicked background space
    setActiveLayerId(null);
    setActiveDragTarget(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingLayer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const newLx = mouseX - dragOffset.x;
    const newLy = mouseY - dragOffset.y;

    const newXPct = Math.max(0, Math.min(100, (newLx / canvas.width) * 100));
    const newYPct = Math.max(0, Math.min(100, (newLy / canvas.height) * 100));

    if (activeDragTarget === 'topText') {
      setTopTextPos({ x: newXPct, y: newYPct });
    } else if (activeDragTarget === 'bottomText') {
      setBottomTextPos({ x: newXPct, y: newYPct });
    } else if (activeDragTarget === 'layer' && activeLayerId) {
      setOverlayLayers((prev) =>
        prev.map((layer) =>
          layer.id === activeLayerId ? { ...layer, x: newXPct, y: newYPct } : layer
        )
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingLayer) {
      setIsDraggingLayer(false);
      pushHistorySnapshot();
    }
  };

  // Update active layer properties
  const updateActiveLayer = (updates: Partial<ImageLayer>) => {
    if (!activeLayerId) return;
    setOverlayLayers((prev) =>
      prev.map((layer) => (layer.id === activeLayerId ? { ...layer, ...updates } : layer))
    );
    pushHistorySnapshot();
  };

  // Delete active layer
  const deleteActiveLayer = () => {
    if (!activeLayerId) return;
    setOverlayLayers((prev) => prev.filter((layer) => layer.id !== activeLayerId));
    setActiveLayerId(null);
    pushHistorySnapshot();
  };

  // Background Upload
  const handleBgFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        loadBgImage(e.target.result as string);
        pushHistorySnapshot();
      }
    };
    reader.readAsDataURL(file);
  };

  // Overlay Upload
  const handleOverlayFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addOverlayLayer(e.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Download meme
  const downloadMeme = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `meme-studio.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.95);
    link.click();
  };

  // Copy image
  const copyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob && navigator.clipboard?.write) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const activeLayer = overlayLayers.find((l) => l.id === activeLayerId);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center">
      
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 mb-4 shadow-2xs">
          <Smile className="w-4 h-4 text-indigo-600" />
          <span>Independent Text & Multi-Layer Studio</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Meme & Banner <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Studio</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
          Create viral memes, headers, & multi-layer graphics. Customize text styles independently, drag PNGs, & enjoy full Undo/Redo.
        </p>
      </motion.div>

      {/* Presets & Undo/Redo Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full mb-8 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Presets:</span>
          {MEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                loadBgImage(preset.url);
                pushHistorySnapshot();
              }}
              className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all shadow-2xs cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Undo & Redo Toolbar Buttons */}
        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 text-gray-800 font-bold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 text-gray-800 font-bold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Column: Interactive Canvas Studio */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl flex items-center justify-center min-h-[420px] overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-h-[480px] w-auto max-w-full rounded-xl object-contain shadow-2xl cursor-grab active:cursor-grabbing"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>

          <p className="text-[11px] font-semibold text-gray-400 mt-2">
            💡 Tip: Drag text or PNG overlays on canvas! Press <kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px]">Ctrl+Z</kbd> to Undo.
          </p>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Background</span>
              </button>

              <button
                onClick={() => overlayFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>+ Add Overlay PNG</span>
              </button>
            </div>

            <input
              ref={bgFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleBgFileUpload(e.target.files[0]);
              }}
            />

            <input
              ref={overlayFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleOverlayFileUpload(e.target.files[0]);
              }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={() => downloadMeme('png')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization & Overlay Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Preset PNG Overlay Badges */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-700 block mb-2">Quick Preset Overlay PNGs:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_OVERLAYS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => addOverlayLayer(preset.url, preset.name)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-xs font-bold text-gray-700 hover:text-purple-600 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-sm">+</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Overlay Layer Inspector */}
          {activeLayer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50/60 p-6 rounded-3xl border border-purple-200/80 shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs text-purple-900">
                    Selected Image Layer: <span className="text-purple-600 font-extrabold">{activeLayer.name}</span>
                  </span>
                </div>

                <button
                  onClick={deleteActiveLayer}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Layer</span>
                </button>
              </div>

              {/* Zoom / Scale Control */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-purple-600" />
                    Zoom / Scale
                  </span>
                  <span>{Math.round(activeLayer.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={activeLayer.scale}
                  onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rotation & Opacity Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-purple-600" />
                      Rotate
                    </span>
                    <span>{activeLayer.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={activeLayer.rotation}
                    onChange={(e) => updateActiveLayer({ rotation: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      Opacity
                    </span>
                    <span>{Math.round(activeLayer.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={activeLayer.opacity}
                    onChange={(e) => updateActiveLayer({ opacity: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Typography & Independent Text Styling Controls */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">Text & Typography</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedTextTarget === 'top') setBottomStyle({ ...topStyle });
                    else setTopStyle({ ...bottomStyle });
                    pushHistorySnapshot();
                  }}
                  className="text-[11px] font-bold text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Copy current style to the other text element"
                >
                  Sync Styles
                </button>

                <button
                  onClick={() => {
                    setTopTextPos({ x: 50, y: 12 });
                    setBottomTextPos({ x: 50, y: 88 });
                    pushHistorySnapshot();
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Positions
                </button>
              </div>
            </div>

            {/* Top Text Input & Clear Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">Top Text</label>
                {topText.trim() && (
                  <button
                    onClick={() => {
                      setTopText('');
                      pushHistorySnapshot();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={topText}
                  onFocus={() => {
                    setSelectedTextTarget('top');
                    setActiveLayerId(null);
                  }}
                  onChange={(e) => setTopText(e.target.value)}
                  onBlur={() => pushHistorySnapshot()}
                  placeholder="Top caption..."
                  className={`w-full px-3.5 py-2.5 pr-8 rounded-xl border text-xs font-bold text-gray-900 focus:outline-hidden transition-all ${
                    selectedTextTarget === 'top'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                      : 'border-gray-200'
                  }`}
                />
                {topText.trim() && (
                  <button
                    onClick={() => {
                      setTopText('');
                      pushHistorySnapshot();
                    }}
                    className="absolute right-2.5 p-1 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Text Input & Clear Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">Bottom Text</label>
                {bottomText.trim() && (
                  <button
                    onClick={() => {
                      setBottomText('');
                      pushHistorySnapshot();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={bottomText}
                  onFocus={() => {
                    setSelectedTextTarget('bottom');
                    setActiveLayerId(null);
                  }}
                  onChange={(e) => setBottomText(e.target.value)}
                  onBlur={() => pushHistorySnapshot()}
                  placeholder="Bottom caption..."
                  className={`w-full px-3.5 py-2.5 pr-8 rounded-xl border text-xs font-bold text-gray-900 focus:outline-hidden transition-all ${
                    selectedTextTarget === 'bottom'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                      : 'border-gray-200'
                  }`}
                />
                {bottomText.trim() && (
                  <button
                    onClick={() => {
                      setBottomText('');
                      pushHistorySnapshot();
                    }}
                    className="absolute right-2.5 p-1 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Target Selection Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
              <button
                onClick={() => {
                  setSelectedTextTarget('top');
                  setActiveLayerId(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTextTarget === 'top'
                    ? 'bg-white text-indigo-600 shadow-2xs ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style Top Text
              </button>
              <button
                onClick={() => {
                  setSelectedTextTarget('bottom');
                  setActiveLayerId(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTextTarget === 'bottom'
                    ? 'bg-white text-indigo-600 shadow-2xs ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style Bottom Text
              </button>
            </div>

            {/* Font Family & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Font Family</label>
                <select
                  value={activeStyle.fontFamily}
                  onChange={(e) => {
                    updateActiveTextStyle({ fontFamily: e.target.value });
                    pushHistorySnapshot();
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
                >
                  <optgroup label="English Fonts">
                    <option value="Impact">Impact (Classic Meme)</option>
                    <option value="Bebas Neue">Bebas Neue (Bold Display)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Cinzel">Cinzel (Luxury Serif)</option>
                    <option value="Pacifico">Pacifico (Handwritten Script)</option>
                    <option value="Inter">Inter (Sans)</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                  </optgroup>
                  <optgroup label="Sinhala Fonts (සිංහල)">
                    <option value="Gemunu Libre">ගැමුණු (Gemunu Libre Bold)</option>
                    <option value="Noto Sans Sinhala">නොටෝ (Noto Sans Sinhala)</option>
                    <option value="Abhaya Libre">අභය (Abhaya Libre Serif)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Font Size: {activeStyle.fontSize}px</label>
                <input
                  type="range"
                  min="24"
                  max="96"
                  value={activeStyle.fontSize}
                  onChange={(e) => updateActiveTextStyle({ fontSize: Number(e.target.value) })}
                  onMouseUp={() => pushHistorySnapshot()}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Text Color & Outline Stroke */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeStyle.textColor}
                    onChange={(e) => {
                      updateActiveTextStyle({ textColor: e.target.value });
                      pushHistorySnapshot();
                    }}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs font-bold text-gray-700">{activeStyle.textColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stroke Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeStyle.strokeColor}
                    onChange={(e) => {
                      updateActiveTextStyle({ strokeColor: e.target.value });
                      pushHistorySnapshot();
                    }}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs font-bold text-gray-700">{activeStyle.strokeColor}</span>
                </div>
              </div>
            </div>

            {/* Stroke Thickness & Uppercase */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stroke Width: {activeStyle.strokeWidth}px</label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={activeStyle.strokeWidth}
                  onChange={(e) => updateActiveTextStyle({ strokeWidth: Number(e.target.value) })}
                  onMouseUp={() => pushHistorySnapshot()}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="uppercaseToggle"
                  checked={activeStyle.isUppercase}
                  onChange={(e) => {
                    updateActiveTextStyle({ isUppercase: e.target.checked });
                    pushHistorySnapshot();
                  }}
                  className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="uppercaseToggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                  UPPERCASE
                </label>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '16:9', label: '16:9 Header' },
                  { id: '1:1', label: '1:1 Square' },
                  { id: '4:5', label: '4:5 Portrait' },
                  { id: 'original', label: 'Original' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => {
                      setAspectRatio(ratio.id as any);
                      pushHistorySnapshot();
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      aspectRatio === ratio.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Stickers */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Add Badge Sticker</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedEmoji(null);
                    pushHistorySnapshot();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    selectedEmoji === null
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  None
                </button>
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setSelectedEmoji(emoji);
                      pushHistorySnapshot();
                    }}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-transform cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
