'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Smile, Upload, Download, Copy, Check, Type, Layers, Trash2, RotateCw, ZoomIn, Eye, Image as ImageIcon, Undo2, Redo2, X, Search, Sparkles, ChevronDown, ChevronUp, Sliders, Palette, LayoutTemplate, Maximize2, Minimize2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
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
  aspectRatio: 'original' | '1:1' | '16:9' | '9:16' | '4:5';
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

interface EmojiItem {
  symbol: string;
  name: string;
  keywords: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: EmojiItem[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smiley faces and expressions',
    icon: '😀',
    emojis: [
      { symbol: '😀', name: 'Grinning Face', keywords: 'happy smile joy' },
      { symbol: '😃', name: 'Grinning Face with Big Eyes', keywords: 'happy smile' },
      { symbol: '😄', name: 'Grinning Face with Smiling Eyes', keywords: 'happy smile' },
      { symbol: '😁', name: 'Beaming Face', keywords: 'grin teeth happy' },
      { symbol: '😆', name: 'Grinning Squinting Face', keywords: 'laugh XD' },
      { symbol: '😅', name: 'Grinning Face with Sweat', keywords: 'phew nervous' },
      { symbol: '🤣', name: 'ROFL', keywords: 'rolling laughing floor' },
      { symbol: '😂', name: 'Face with Tears of Joy', keywords: 'lol laugh cry' },
      { symbol: '🙂', name: 'Slightly Smiling Face', keywords: 'smile fine' },
      { symbol: '🙃', name: 'Upside Down Face', keywords: 'silly sarcasm' },
      { symbol: '😉', name: 'Winking Face', keywords: 'wink secret' },
      { symbol: '😊', name: 'Smiling Face with Smiling Eyes', keywords: 'blush happy' },
      { symbol: '😇', name: 'Halo Angel', keywords: 'innocent good' },
      { symbol: '🥰', name: 'Smiling Face with Hearts', keywords: 'love' },
      { symbol: '😍', name: 'Heart Eyes', keywords: 'love crusing' },
      { symbol: '🤩', name: 'Star Struck', keywords: 'wow amazed' },
      { symbol: '😘', name: 'Blowing Kiss', keywords: 'kiss love' },
      { symbol: '😋', name: 'Face Savoring Food', keywords: 'yum delicious' },
      { symbol: '😛', name: 'Face with Tongue', keywords: 'playful' },
      { symbol: '😜', name: 'Winking Face with Tongue', keywords: 'crazy playful' },
      { symbol: '🤪', name: 'Zany Face', keywords: 'goofy wild' },
      { symbol: '😝', name: 'Squinting Face with Tongue', keywords: 'mischievous' },
      { symbol: '🤑', name: 'Money Mouth Face', keywords: 'rich cash' },
      { symbol: '😎', name: 'Cool Shades', keywords: 'sunglasses boss' },
      { symbol: '🤓', name: 'Nerd Face', keywords: 'geek smart' },
      { symbol: '🧐', name: 'Monocle Face', keywords: 'inspect suspicious' },
      { symbol: '🤠', name: 'Cowboy Hat', keywords: 'yeehaw' },
      { symbol: '🥳', name: 'Party Face', keywords: 'celebrate hat party' },
      { symbol: '😏', name: 'Smirking Face', keywords: 'smug flirt' },
      { symbol: '😒', name: 'Unamused Face', keywords: 'meh annoyed' },
      { symbol: '🙄', name: 'Face with Rolling Eyes', keywords: 'whatever' },
      { symbol: '😬', name: 'Grimacing Face', keywords: 'awkward oops' },
      { symbol: '🤥', name: 'Lying Face', keywords: 'pinocchio lie' },
      { symbol: '😌', name: 'Relieved Face', keywords: 'calm peaceful' },
      { symbol: '😔', name: 'Pensive Face', keywords: 'sad' },
      { symbol: '😪', name: 'Sleepy Face', keywords: 'tired' },
      { symbol: '🤤', name: 'Drooling Face', keywords: 'hungry' },
      { symbol: '😴', name: 'Sleeping Face', keywords: 'zzz' },
      { symbol: '😷', name: 'Medical Mask Face', keywords: 'sick' },
      { symbol: '🤒', name: 'Thermometer Face', keywords: 'fever' },
      { symbol: '🤕', name: 'Head Bandage Face', keywords: 'hurt' },
      { symbol: '🤢', name: 'Nauseated Face', keywords: 'gross' },
      { symbol: '🤮', name: 'Vomiting Face', keywords: 'barf' },
      { symbol: '🤧', name: 'Sneezing Face', keywords: 'achoo' },
      { symbol: '🥵', name: 'Hot Face', keywords: 'heat summer' },
      { symbol: '🥶', name: 'Cold Ice Face', keywords: 'freezing' },
      { symbol: '🥴', name: 'Woozy Face', keywords: 'drunk dizzy' },
      { symbol: '😵', name: 'Dizzy Face', keywords: 'fainted' },
      { symbol: '🤯', name: 'Exploding Head', keywords: 'mind blown' },
      { symbol: '😈', name: 'Smiling Devil', keywords: 'evil horn' },
      { symbol: '👿', name: 'Angry Devil', keywords: 'demon' },
      { symbol: '💀', name: 'Skull', keywords: 'dead death laugh' },
      { symbol: '☠️', name: 'Skull and Crossbones', keywords: 'danger poison' },
      { symbol: '💩', name: 'Pile of Poop', keywords: 'shit funny' },
      { symbol: '🤡', name: 'Clown Face', keywords: 'joke' },
      { symbol: '👹', name: 'Ogre', keywords: 'monster' },
      { symbol: '👺', name: 'Goblin', keywords: 'red mask' },
      { symbol: '👻', name: 'Ghost', keywords: 'spooky halloween' },
      { symbol: '👽', name: 'Alien', keywords: 'ufo space' },
      { symbol: '👾', name: 'Alien Monster', keywords: 'game pixel' },
      { symbol: '🤖', name: 'Robot Face', keywords: 'bot tech' },
    ],
  },
  {
    id: 'trending',
    name: 'Badges and memes',
    icon: '🔥',
    emojis: [
      { symbol: '🔥', name: 'Fire', keywords: 'hot lit trend' },
      { symbol: '🚀', name: 'Rocket', keywords: 'moon fast crypto launch' },
      { symbol: '💯', name: '100 Points', keywords: 'hundred perfect score' },
      { symbol: '👑', name: 'Crown', keywords: 'king queen vip royal' },
      { symbol: '🎯', name: 'Bullseye Target', keywords: 'goal hit focus' },
      { symbol: '✨', name: 'Sparkles', keywords: 'magic shiny star' },
      { symbol: '⚡', name: 'High Voltage', keywords: 'lightning electric shock' },
      { symbol: '🗿', name: 'Moai Stone Head', keywords: 'sigma chad statue' },
      { symbol: '👀', name: 'Eyes', keywords: 'look see watching' },
      { symbol: '💪', name: 'Flexed Biceps', keywords: 'strong muscle power' },
      { symbol: '💰', name: 'Money Bag', keywords: 'cash rich dollar' },
      { symbol: '👍', name: 'Thumbs Up', keywords: 'like yes agree' },
      { symbol: '❤️', name: 'Red Heart', keywords: 'love passion' },
      { symbol: '🫡', name: 'Saluting Face', keywords: 'respect sir yes' },
      { symbol: '🐐', name: 'Goat', keywords: 'greatest of all time' },
      { symbol: '🏆', name: 'Trophy', keywords: 'winner champion first' },
      { symbol: '💎', name: 'Gem Stone', keywords: 'diamond luxury expensive' },
      { symbol: '⭐', name: 'Star', keywords: 'favorite gold' },
      { symbol: '🥇', name: '1st Place Medal', keywords: 'gold winner' },
      { symbol: '🎉', name: 'Party Popper', keywords: 'celebration yay' },
      { symbol: '💥', name: 'Collision Boom', keywords: 'explosion bang' },
      { symbol: '🍿', name: 'Popcorn', keywords: 'movie drama watch' },
      { symbol: '📢', name: 'Loudspeaker', keywords: 'announcement news' },
      { symbol: '📌', name: 'Pushpin', keywords: 'pin notice key' },
      { symbol: '🏷️', name: 'Label Tag', keywords: 'price tag sale' },
    ],
  },
  {
    id: 'animals',
    name: 'Animals and nature',
    icon: '🐱',
    emojis: [
      { symbol: '🐶', name: 'Dog Face', keywords: 'puppy pet' },
      { symbol: '🐱', name: 'Cat Face', keywords: 'kitty pet meow' },
      { symbol: '🐭', name: 'Mouse Face', keywords: 'rat' },
      { symbol: '🐹', name: 'Hamster Face', keywords: 'cute' },
      { symbol: '🐰', name: 'Rabbit Face', keywords: 'bunny' },
      { symbol: '🦊', name: 'Fox', keywords: 'sly red' },
      { symbol: '🐻', name: 'Bear', keywords: 'teddy' },
      { symbol: '🐼', name: 'Panda', keywords: 'bamboo' },
      { symbol: '🐨', name: 'Koala', keywords: 'eucalyptus' },
      { symbol: '🐯', name: 'Tiger Face', keywords: 'wild' },
      { symbol: '🦁', name: 'Lion', keywords: 'king' },
      { symbol: '🐮', name: 'Cow Face', keywords: 'moo' },
      { symbol: '🐷', name: 'Pig Face', keywords: 'oink' },
      { symbol: '🐸', name: 'Frog Face', keywords: 'pepe toad' },
      { symbol: '🐵', name: 'Monkey Face', keywords: 'ape' },
      { symbol: '🐔', name: 'Chicken', keywords: 'rooster' },
      { symbol: '🐧', name: 'Penguin', keywords: 'ice' },
      { symbol: '🐦', name: 'Bird', keywords: 'tweet' },
      { symbol: '🦅', name: 'Eagle', keywords: 'fly america' },
      { symbol: '🦉', name: 'Owl', keywords: 'wise night' },
      { symbol: '🦇', name: 'Bat', keywords: 'vampire' },
      { symbol: '🐺', name: 'Wolf', keywords: 'howl lone' },
      { symbol: '🦄', name: 'Unicorn', keywords: 'fantasy rainbow' },
      { symbol: '🐝', name: 'Honeybee', keywords: 'buzz honey' },
      { symbol: '🦋', name: 'Butterfly', keywords: 'beauty' },
      { symbol: '🐙', name: 'Octopus', keywords: 'tentacles' },
      { symbol: '🦈', name: 'Shark', keywords: 'jaw ocean' },
      { symbol: '🐊', name: 'Crocodile', keywords: 'gator' },
      { symbol: '🦍', name: 'Gorilla', keywords: 'harambe ape' },
    ],
  },
  {
    id: 'food',
    name: 'Food and drink',
    icon: '🍕',
    emojis: [
      { symbol: '🍕', name: 'Pizza', keywords: 'cheese Italian' },
      { symbol: '🍔', name: 'Hamburger', keywords: 'burger fast food' },
      { symbol: '🍟', name: 'French Fries', keywords: 'chips potato' },
      { symbol: '🌭', name: 'Hot Dog', keywords: 'sausage' },
      { symbol: '🍿', name: 'Popcorn', keywords: 'snack movie' },
      { symbol: '🥓', name: 'Bacon', keywords: 'pork breakfast' },
      { symbol: '🥩', name: 'Cut of Meat', keywords: 'steak' },
      { symbol: '🥞', name: 'Pancakes', keywords: 'syrup' },
      { symbol: '🧇', name: 'Waffle', keywords: 'breakfast' },
      { symbol: '🍩', name: 'Donut', keywords: 'sweet pastry' },
      { symbol: '🍦', name: 'Soft Ice Cream', keywords: 'cone dessert' },
      { symbol: '🍰', name: 'Shortcake', keywords: 'birthday cake' },
      { symbol: '🎂', name: 'Birthday Cake', keywords: 'candles party' },
      { symbol: '🍫', name: 'Chocolate Bar', keywords: 'sweet candy' },
      { symbol: '☕', name: 'Hot Beverage', keywords: 'coffee tea espresso' },
      { symbol: '🧋', name: 'Bubble Tea', keywords: 'boba milk tea' },
      { symbol: '🍺', name: 'Beer Mug', keywords: 'alcohol drink cheer' },
      { symbol: '🍻', name: 'Clinking Beer Mugs', keywords: 'cheers bar' },
      { symbol: '🥂', name: 'Clinking Glasses', keywords: 'toast champagne' },
      { symbol: '🍾', name: 'Bottle with Popping Cork', keywords: 'celebrate' },
    ],
  },
  {
    id: 'objects',
    name: 'Objects and symbols',
    icon: '🚗',
    emojis: [
      { symbol: '🚗', name: 'Automobile', keywords: 'car vehicle drive' },
      { symbol: '🏎️', name: 'Racing Car', keywords: 'f1 speed race' },
      { symbol: '🚓', name: 'Police Car', keywords: 'cop siren' },
      { symbol: '🚑', name: 'Ambulance', keywords: 'emergency hospital' },
      { symbol: '🚒', name: 'Fire Engine', keywords: 'truck rescue' },
      { symbol: '🏍️', name: 'Motorcycle', keywords: 'bike motor' },
      { symbol: '✈️', name: 'Airplane', keywords: 'flight travel plane' },
      { symbol: '🛸', name: 'Flying Saucer', keywords: 'ufo alien' },
      { symbol: '🎮', name: 'Video Game Controller', keywords: 'gamer joystick' },
      { symbol: '🎧', name: 'Headphones', keywords: 'music audio listen' },
      { symbol: '🎸', name: 'Guitar', keywords: 'rock music' },
      { symbol: '📱', name: 'Mobile Phone', keywords: 'smartphone' },
      { symbol: '💻', name: 'Laptop', keywords: 'computer code work' },
      { symbol: '📷', name: 'Camera', keywords: 'photo picture' },
      { symbol: '💡', name: 'Light Bulb', keywords: 'idea bright' },
      { symbol: '💣', name: 'Bomb', keywords: 'boom danger' },
      { symbol: '🎉', name: 'Party Popper', keywords: 'confetti' },
      { symbol: '🎁', name: 'Wrapped Gift', keywords: 'present birthday' },
    ],
  },
];

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
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  });

  const [bottomStyle, setBottomStyle] = useState<TextStyle>({
    fontSize: 48,
    fontFamily: 'Impact',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 6,
    isUppercase: true,
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  });

  const [selectedTextTarget, setSelectedTextTarget] = useState<'top' | 'bottom'>('top');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'original' | '1:1' | '16:9' | '9:16' | '4:5'>('16:9');
  
  // Feature 1: Photo Filters State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);

  // Feature 3: Solid & Gradient Background State
  const [bgType, setBgType] = useState<'photo' | 'solid' | 'gradient'>('photo');
  const [solidBgColor, setSolidBgColor] = useState<string>('#0f172a');
  const [gradientColor1, setGradientColor1] = useState<string>('#4f46e5');
  const [gradientColor2, setGradientColor2] = useState<string>('#9333ea');
  const [gradientAngle, setGradientAngle] = useState<number>(135);

  // Feature 4: Watermark / Brand Tag State
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('@MemeStudio');
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.7);
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');

  // Feature 5: Layout Mode State (Classic Meme vs Twitter Card)
  const [layoutMode, setLayoutMode] = useState<'standard' | 'twitter-card'>('standard');
  const [twitterName, setTwitterName] = useState<string>('Developer');
  const [twitterHandle, setTwitterHandle] = useState<string>('@dev_guy');

  // Accordion Drawers UI State (Smart Tool Collapsible Drawers)
  const [openSection, setOpenSection] = useState<'text' | 'layout' | 'emoji' | 'bg' | 'filters' | 'watermark' | 'layers'>('text');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const selectSection = (section: 'text' | 'layout' | 'emoji' | 'bg' | 'filters' | 'watermark' | 'layers') => {
    setOpenSection(section);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const toggleSection = (section: 'text' | 'layout' | 'emoji' | 'bg' | 'filters' | 'watermark' | 'layers') => {
    selectSection(section);
  };

  // Emoji Picker Modal Popover States
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('all');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState<string>('');
  const [emojiAddedToast, setEmojiAddedToast] = useState<string | null>(null);
  
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

  // Two-finger pinch-to-zoom gesture tracking ref
  const pinchRef = useRef<{
    initialDist: number;
    target: 'topText' | 'bottomText' | 'layer' | null;
    layerId: string | null;
    initialFontSize: number;
    initialScale: number;
  } | null>(null);

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
    } else if (aspectRatio === '9:16') {
      targetHeight = Math.round((targetWidth * 16) / 9);
    } else if (aspectRatio === '4:5') {
      targetHeight = Math.round((targetWidth * 5) / 4);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // 1. Clear & Draw background fill (Photo / Solid Color / Gradient) with Photo Filters
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    
    ctx.save();
    if (bgType === 'solid') {
      ctx.fillStyle = solidBgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (bgType === 'gradient') {
      const angleRad = (gradientAngle * Math.PI) / 180;
      const x2 = targetWidth * Math.cos(angleRad);
      const y2 = targetHeight * Math.sin(angleRad);
      const grad = ctx.createLinearGradient(0, 0, x2, y2);
      grad.addColorStop(0, gradientColor1);
      grad.addColorStop(1, gradientColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      // Photo Background with Filters
      const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${bgBlur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
      ctx.filter = filterStr;

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
    }
    ctx.restore();

    // Draw Twitter / Social Media Header Card if enabled
    if (layoutMode === 'twitter-card') {
      const headerH = Math.max(90, targetHeight * 0.22);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, headerH);

      // Draw Avatar circle
      const avatarR = 22;
      const avatarX = 36;
      const avatarY = headerH / 2;
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Initial Letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((twitterName.charAt(0) || 'D').toUpperCase(), avatarX, avatarY);

      // Twitter Name & Handle
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(twitterName, avatarX + avatarR + 12, avatarY - 8);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(twitterHandle, avatarX + avatarR + 12, avatarY + 10);

      // Divider border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerH);
      ctx.lineTo(targetWidth, headerH);
      ctx.stroke();

      ctx.restore();
    }

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

    // 3. Render Top Text with topStyle & Shadow Glow
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

      // Apply Text Shadow / Glow
      if (topStyle.shadowColor && (topStyle.shadowBlur > 0 || topStyle.shadowOffsetX !== 0 || topStyle.shadowOffsetY !== 0)) {
        ctx.shadowColor = topStyle.shadowColor;
        ctx.shadowBlur = topStyle.shadowBlur;
        ctx.shadowOffsetX = topStyle.shadowOffsetX;
        ctx.shadowOffsetY = topStyle.shadowOffsetY;
      }

      const tx = (targetWidth * topTextPos.x) / 100;
      const ty = (targetHeight * topTextPos.y) / 100;
      if (topStyle.strokeWidth > 0) ctx.strokeText(topStr, tx, ty);
      ctx.fillText(topStr, tx, ty);

      if (activeDragTarget === 'topText' || (selectedTextTarget === 'top' && !activeLayerId)) {
        const textWidth = ctx.measureText(topStr).width;
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(tx - textWidth / 2 - 10, ty - topStyle.fontSize / 2 - 6, textWidth + 20, topStyle.fontSize + 12);
      }
      ctx.restore();
    }

    // 4. Render Bottom Text with bottomStyle & Shadow Glow
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

      // Apply Text Shadow / Glow
      if (bottomStyle.shadowColor && (bottomStyle.shadowBlur > 0 || bottomStyle.shadowOffsetX !== 0 || bottomStyle.shadowOffsetY !== 0)) {
        ctx.shadowColor = bottomStyle.shadowColor;
        ctx.shadowBlur = bottomStyle.shadowBlur;
        ctx.shadowOffsetX = bottomStyle.shadowOffsetX;
        ctx.shadowOffsetY = bottomStyle.shadowOffsetY;
      }

      const bx = (targetWidth * bottomTextPos.x) / 100;
      const by = (targetHeight * bottomTextPos.y) / 100;
      if (bottomStyle.strokeWidth > 0) ctx.strokeText(bottomStr, bx, by);
      ctx.fillText(bottomStr, bx, by);

      if (activeDragTarget === 'bottomText' || (selectedTextTarget === 'bottom' && !activeLayerId)) {
        const textWidth = ctx.measureText(bottomStr).width;
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(bx - textWidth / 2 - 10, by - bottomStyle.fontSize / 2 - 6, textWidth + 20, bottomStyle.fontSize + 12);
      }
      ctx.restore();
    }

    // 5. Render Brand Watermark Tag
    if (watermarkEnabled && watermarkText.trim()) {
      ctx.save();
      ctx.globalAlpha = watermarkOpacity;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = watermarkColor;
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(watermarkText);
      const textW = metrics.width;
      const padX = 12;
      const boxW = textW + padX * 2;
      const boxH = 28;

      let wx = 16;
      let wy = 16;

      if (watermarkPosition === 'bottom-right') {
        wx = targetWidth - boxW - 16;
        wy = targetHeight - boxH - 16;
      } else if (watermarkPosition === 'bottom-left') {
        wx = 16;
        wy = targetHeight - boxH - 16;
      } else if (watermarkPosition === 'top-right') {
        wx = targetWidth - boxW - 16;
        wy = 16;
      } else if (watermarkPosition === 'top-left') {
        wx = 16;
        wy = 16;
      }

      // Background pill badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.fillRect(wx, wy, boxW, boxH);
      ctx.fill();

      // Watermark text
      ctx.fillStyle = watermarkColor;
      ctx.textAlign = 'left';
      ctx.fillText(watermarkText, wx + padX, wy + boxH / 2);
      ctx.restore();
    }

    // 5. Draw Sticker if selected
    if (selectedEmoji) {
      ctx.font = `48px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedEmoji, targetWidth * 0.88, targetHeight * 0.14);
    }
  }, [
    topText,
    bottomText,
    topStyle,
    bottomStyle,
    topTextPos,
    bottomTextPos,
    selectedTextTarget,
    selectedEmoji,
    aspectRatio,
    overlayLayers,
    activeLayerId,
    activeDragTarget,
    brightness,
    contrast,
    saturation,
    bgBlur,
    grayscale,
    sepia,
    bgType,
    solidBgColor,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    watermarkEnabled,
    watermarkText,
    watermarkPosition,
    watermarkOpacity,
    watermarkColor,
    layoutMode,
    twitterName,
    twitterHandle,
  ]);

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

  // Add Emoji Sticker as draggable & pinch-zoomable layer
  const addEmojiSticker = useCallback((emojiSymbol: string) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="160" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emojiSymbol}</text>
    </svg>`;
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

    const img = new Image();
    img.onload = () => {
      const newLayer: ImageLayer = {
        id: `emoji_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `Emoji Sticker ${emojiSymbol}`,
        img,
        x: 50,
        y: 50,
        scale: 0.8,
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

  // Helper to extract canvas relative coordinates from Mouse or Touch events
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { mouseX: 0, mouseY: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    return { mouseX, mouseY };
  };

  // Start dragging or pinch-zooming (Mouse / Touch)
  const startDrag = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle 2-finger touch pinch start
    if ('touches' in e && e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      let target: 'topText' | 'bottomText' | 'layer' | null = null;
      let layerId: string | null = activeLayerId;
      let initialScale = 1.0;
      let initialFontSize = 48;

      if (activeLayerId) {
        target = 'layer';
        const layer = overlayLayers.find((l) => l.id === activeLayerId);
        if (layer) initialScale = layer.scale;
      } else if (selectedTextTarget === 'top') {
        target = 'topText';
        initialFontSize = topStyle.fontSize;
      } else if (selectedTextTarget === 'bottom') {
        target = 'bottomText';
        initialFontSize = bottomStyle.fontSize;
      }

      pinchRef.current = {
        initialDist: dist,
        target,
        layerId,
        initialFontSize,
        initialScale,
      };

      setIsDraggingLayer(false);
      return;
    }

    const { mouseX, mouseY } = getCanvasCoords(e);

    // Check hit on Top Text
    if (topText.trim()) {
      const topStr = topStyle.isUppercase ? topText.toUpperCase() : topText;
      const tx = (canvas.width * topTextPos.x) / 100;
      const ty = (canvas.height * topTextPos.y) / 100;
      if (ctx) {
        ctx.font = `900 ${topStyle.fontSize}px "${topStyle.fontFamily}", sans-serif`;
        const tw = ctx.measureText(topStr).width;
        if (
          mouseX >= tx - tw / 2 - 18 &&
          mouseX <= tx + tw / 2 + 18 &&
          mouseY >= ty - topStyle.fontSize / 2 - 18 &&
          mouseY <= ty + topStyle.fontSize / 2 + 18
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
          mouseX >= bx - bw / 2 - 18 &&
          mouseX <= bx + bw / 2 + 18 &&
          mouseY >= by - bottomStyle.fontSize / 2 - 18 &&
          mouseY <= by + bottomStyle.fontSize / 2 + 18
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
        mouseX >= lx - w / 2 - 14 &&
        mouseX <= lx + w / 2 + 14 &&
        mouseY >= ly - h / 2 - 14 &&
        mouseY <= ly + h / 2 + 14
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

  // Move dragging or pinch-zooming (Mouse / Touch)
  const moveDrag = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Handle 2-finger touch pinch zoom move
    if ('touches' in e && e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (pinchRef.current.initialDist > 0) {
        const scaleFactor = currentDist / pinchRef.current.initialDist;
        const p = pinchRef.current;

        if (p.target === 'layer' && p.layerId) {
          const newScale = Math.max(0.1, Math.min(4.0, Number((p.initialScale * scaleFactor).toFixed(2))));
          setOverlayLayers((prev) =>
            prev.map((layer) => (layer.id === p.layerId ? { ...layer, scale: newScale } : layer))
          );
        } else if (p.target === 'topText') {
          const newFontSize = Math.max(14, Math.min(180, Math.round(p.initialFontSize * scaleFactor)));
          setTopStyle((prev) => ({ ...prev, fontSize: newFontSize }));
        } else if (p.target === 'bottomText') {
          const newFontSize = Math.max(14, Math.min(180, Math.round(p.initialFontSize * scaleFactor)));
          setBottomStyle((prev) => ({ ...prev, fontSize: newFontSize }));
        }
      }
      return;
    }

    if (!isDraggingLayer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { mouseX, mouseY } = getCanvasCoords(e);

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

  const endDrag = () => {
    if (pinchRef.current) {
      pinchRef.current = null;
      pushHistorySnapshot();
    }
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

  // Filtered Emojis for Modal Picker
  const filteredEmojiCategories = EMOJI_CATEGORIES.map((cat) => {
    if (activeEmojiCategory !== 'all' && cat.id !== activeEmojiCategory) {
      return null;
    }
    const filteredEmojis = cat.emojis.filter((e) => {
      if (!emojiSearchQuery.trim()) return true;
      const q = emojiSearchQuery.toLowerCase();
      return (
        e.symbol.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.keywords.toLowerCase().includes(q)
      );
    });
    if (filteredEmojis.length === 0) return null;
    return { ...cat, emojis: filteredEmojis };
  }).filter((cat): cat is EmojiCategory => cat !== null);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 w-full">
        
        {/* Left Column: Interactive Canvas Studio */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          
          {/* ONLY the Canvas Box is Sticky on Mobile & Desktop */}
          <div className={`sticky top-14 lg:top-6 z-30 w-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md pb-2 transition-all duration-300 ${isFocusMode ? 'h-[78vh]' : ''}`}>
            <div className={`relative w-full bg-slate-950/95 rounded-3xl p-2.5 sm:p-4 border border-slate-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${isFocusMode ? 'h-full min-h-[70vh]' : 'h-[28vh] sm:h-[38vh] min-h-[170px] max-h-[220px] sm:max-h-[360px] lg:min-h-[460px] lg:max-h-[520px]'}`}>
              
              {/* Floating Canvas Top Bar Controls */}
              <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                {/* Left: Undo & Redo quick floating pill */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-1 sm:p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-1 sm:p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Fullscreen Focus Mode Toggle & Quick Download */}
                <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
                  <button
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isFocusMode 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isFocusMode ? "Show Tools" : "Expand Fullscreen Canvas"}
                  >
                    {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{isFocusMode ? 'Tools' : 'Focus'}</span>
                  </button>
                  <button
                    onClick={() => downloadMeme('png')}
                    className="p-1 sm:p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                    title="Quick Download PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Canvas */}
              <canvas
                ref={canvasRef}
                className="touch-none select-none h-auto w-auto max-h-full max-w-full rounded-xl object-contain shadow-2xl cursor-grab active:cursor-grabbing"
                onMouseDown={startDrag}
                onMouseMove={moveDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={startDrag}
                onTouchMove={moveDrag}
                onTouchEnd={endDrag}
              />
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1 text-center">
            💡 Drag text/stickers • Pinch with 2 fingers to resize on mobile
          </p>

          {/* Hidden File Inputs */}
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

          {/* Action Toolbar (Normal scrollable flow) */}
          <div className="flex flex-wrap items-center justify-between gap-2 w-full mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">Upload BG</span>
              </button>

              <button
                onClick={() => overlayFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">+ Add PNG</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={() => downloadMeme('png')}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Single-Pane Tabbed Studio Panel */}
        <div id="meme-tool-panel" className={`lg:col-span-5 flex flex-col gap-3 ${isFocusMode ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Master Tool Switcher Tabs Bar */}
          <div className="w-full p-1.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-around overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'text', icon: '📝', label: 'Text' },
              { id: 'layout', icon: '📐', label: 'Layout' },
              { id: 'emoji', icon: '😀', label: 'Emoji' },
              { id: 'bg', icon: '🎨', label: 'Bg' },
              { id: 'filters', icon: '📷', label: 'Filters' },
              { id: 'watermark', icon: '🏷️', label: 'Tag' },
              { id: 'layers', icon: '✨', label: 'Presets' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setOpenSection(tool.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openSection === tool.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Active Overlay Layer Inspector (Always available if an overlay layer is selected) */}
          {activeLayer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-900 text-white p-4 rounded-2xl shadow-xl flex flex-col gap-3 border border-purple-800"
            >
              <div className="flex items-center justify-between border-b border-purple-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-300" />
                  <span className="font-bold text-xs">Selected Layer: {activeLayer.name}</span>
                </div>
                <button
                  onClick={deleteActiveLayer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-1">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Scale</span>
                    <span>{Math.round(activeLayer.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={activeLayer.scale}
                    onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-1">
                    <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Rotate</span>
                    <span>{activeLayer.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={activeLayer.rotation}
                    onChange={(e) => updateActiveLayer({ rotation: Number(e.target.value) })}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-1">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Opacity</span>
                    <span>{Math.round(activeLayer.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={activeLayer.opacity}
                    onChange={(e) => updateActiveLayer({ opacity: Number(e.target.value) })}
                    className="w-full accent-purple-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Dedicated In-Place Active Tool Body */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-md p-4 sm:p-5 transition-all">
            
            <AnimatePresence mode="wait">
              
              {/* 1. TEXT & TYPOGRAPHY PANEL */}
              {openSection === 'text' && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Type className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Text & Typography</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedTextTarget === 'top') setBottomStyle({ ...topStyle });
                          else setTopStyle({ ...bottomStyle });
                          pushHistorySnapshot();
                        }}
                        className="text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Sync Styles
                      </button>
                      <button
                        onClick={() => {
                          setTopTextPos({ x: 50, y: 12 });
                          setBottomTextPos({ x: 50, y: 88 });
                          pushHistorySnapshot();
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset Positions
                      </button>
                    </div>
                  </div>

                  {/* Top Text Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Top Text</label>
                      {topText.trim() && (
                        <button onClick={() => { setTopText(''); pushHistorySnapshot(); }} className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={topText}
                        onFocus={() => { setSelectedTextTarget('top'); setActiveLayerId(null); }}
                        onChange={(e) => setTopText(e.target.value)}
                        onBlur={() => pushHistorySnapshot()}
                        placeholder="Top caption..."
                        className={`w-full px-3.5 py-2.5 pr-8 rounded-xl border text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-hidden transition-all ${selectedTextTarget === 'top' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700'}`}
                      />
                      {topText.trim() && (
                        <button onClick={() => { setTopText(''); pushHistorySnapshot(); }} className="absolute right-2.5 p-1 text-gray-400 hover:text-rose-600 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Text Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Bottom Text</label>
                      {bottomText.trim() && (
                        <button onClick={() => { setBottomText(''); pushHistorySnapshot(); }} className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={bottomText}
                        onFocus={() => { setSelectedTextTarget('bottom'); setActiveLayerId(null); }}
                        onChange={(e) => setBottomText(e.target.value)}
                        onBlur={() => pushHistorySnapshot()}
                        placeholder="Bottom caption..."
                        className={`w-full px-3.5 py-2.5 pr-8 rounded-xl border text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-hidden transition-all ${selectedTextTarget === 'bottom' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700'}`}
                      />
                      {bottomText.trim() && (
                        <button onClick={() => { setBottomText(''); pushHistorySnapshot(); }} className="absolute right-2.5 p-1 text-gray-400 hover:text-rose-600 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Target Selection Selector Tabs */}
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                    <button
                      onClick={() => { setSelectedTextTarget('top'); setActiveLayerId(null); }}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedTextTarget === 'top' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Style Top Text
                    </button>
                    <button
                      onClick={() => { setSelectedTextTarget('bottom'); setActiveLayerId(null); }}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedTextTarget === 'bottom' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Style Bottom Text
                    </button>
                  </div>

                  {/* Font Family & Size */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Font Family</label>
                      <select
                        value={activeStyle.fontFamily}
                        onChange={(e) => { updateActiveTextStyle({ fontFamily: e.target.value }); pushHistorySnapshot(); }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800"
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
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Font Size: {activeStyle.fontSize}px</label>
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

                  {/* Text Color & Stroke Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeStyle.textColor}
                          onChange={(e) => { updateActiveTextStyle({ textColor: e.target.value }); pushHistorySnapshot(); }}
                          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                        />
                        <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{activeStyle.textColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Stroke Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeStyle.strokeColor}
                          onChange={(e) => { updateActiveTextStyle({ strokeColor: e.target.value }); pushHistorySnapshot(); }}
                          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                        />
                        <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{activeStyle.strokeColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stroke Width & Uppercase Toggle */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Stroke Width: {activeStyle.strokeWidth}px</label>
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
                        onChange={(e) => { updateActiveTextStyle({ isUppercase: e.target.checked }); pushHistorySnapshot(); }}
                        className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="uppercaseToggle" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        UPPERCASE
                      </label>
                    </div>
                  </div>

                  {/* Drop Shadow & Neon Glow */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Text Shadow / Outer Glow</span>
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Glow Color</label>
                        <input
                          type="color"
                          value={activeStyle.shadowColor}
                          onChange={(e) => { updateActiveTextStyle({ shadowColor: e.target.value }); pushHistorySnapshot(); }}
                          className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Blur Radius: {activeStyle.shadowBlur}px</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={activeStyle.shadowBlur}
                          onChange={(e) => updateActiveTextStyle({ shadowBlur: Number(e.target.value) })}
                          onMouseUp={() => pushHistorySnapshot()}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. LAYOUT & ASPECT RATIO PANEL */}
              {openSection === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Layout & Aspect Ratio</h3>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg">
                      {aspectRatio} • {layoutMode === 'standard' ? 'Classic' : 'Twitter'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Layout Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setLayoutMode('standard'); pushHistorySnapshot(); }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${layoutMode === 'standard' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        🖼️ Classic Meme
                      </button>
                      <button
                        onClick={() => { setLayoutMode('twitter-card'); pushHistorySnapshot(); }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${layoutMode === 'twitter-card' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        🐦 Twitter / X Card
                      </button>
                    </div>

                    {layoutMode === 'twitter-card' && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Author Name</label>
                          <input
                            type="text"
                            value={twitterName}
                            onChange={(e) => setTwitterName(e.target.value)}
                            onBlur={() => pushHistorySnapshot()}
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">@Handle</label>
                          <input
                            type="text"
                            value={twitterHandle}
                            onChange={(e) => setTwitterHandle(e.target.value)}
                            onBlur={() => pushHistorySnapshot()}
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aspect Ratio Presets */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Aspect Ratio Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: '16:9', label: '16:9 Header' },
                        { id: '9:16', label: '9:16 Story' },
                        { id: '1:1', label: '1:1 Square' },
                        { id: '4:5', label: '4:5 Portrait' },
                        { id: 'original', label: 'Original' },
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          onClick={() => { setAspectRatio(ratio.id as any); pushHistorySnapshot(); }}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${aspectRatio === ratio.id ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. EMOJI & STICKER PICKER PANEL */}
              {openSection === 'emoji' && (
                <motion.div
                  key="emoji"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Smile className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Emoji & Sticker Picker</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                      150+ Emojis
                    </span>
                  </div>

                  <div className="relative">
                    {/* Picker Toggle Button */}
                    <button
                      onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold text-xs shadow-md shadow-slate-900/10 hover:shadow-lg transition-all cursor-pointer border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-indigo-400" />
                        <span>Open Full Emoji Picker Library...</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg text-[11px] font-mono text-indigo-200">
                        <span>Win+. Style</span>
                      </div>
                    </button>

                    {/* Toast Notification */}
                    {emojiAddedToast && (
                      <div className="mt-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs">
                        ✨ Added {emojiAddedToast} sticker to canvas! (Drag or Pinch to resize)
                      </div>
                    )}

                    {/* Full Emoji Picker Popover */}
                    <AnimatePresence>
                      {isEmojiPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          className="mt-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col text-slate-100 max-h-[460px] w-full"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-200">Emoji Library</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                150+ Emojis
                              </span>
                            </div>
                            <button onClick={() => setIsEmojiPickerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-around px-2 py-1.5 border-b border-slate-800 bg-slate-900/90 overflow-x-auto no-scrollbar">
                            <button
                              onClick={() => setActiveEmojiCategory('all')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${activeEmojiCategory === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                            >
                              <span>🕒 All</span>
                            </button>
                            {EMOJI_CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setActiveEmojiCategory(cat.id)}
                                title={cat.name}
                                className={`px-3 py-1.5 rounded-xl text-sm transition-all flex items-center justify-center cursor-pointer ${activeEmojiCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                              >
                                <span>{cat.icon}</span>
                              </button>
                            ))}
                          </div>

                          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
                            <div className="relative flex items-center">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                              <input
                                type="text"
                                value={emojiSearchQuery}
                                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                                placeholder="Search emojis..."
                                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                              />
                              {emojiSearchQuery && (
                                <button onClick={() => setEmojiSearchQuery('')} className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="p-3 overflow-y-auto max-h-[260px] space-y-4 text-left custom-scrollbar">
                            {filteredEmojiCategories.length === 0 ? (
                              <div className="text-center py-8 text-slate-500 text-xs font-medium">
                                No emojis found matching "{emojiSearchQuery}"
                              </div>
                            ) : (
                              filteredEmojiCategories.map(
                                (cat) =>
                                  cat && (
                                    <div key={cat.id} className="space-y-2">
                                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                                        {cat.name}
                                      </h4>
                                      <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                                        {cat.emojis.map((item) => (
                                          <button
                                            key={item.symbol}
                                            onClick={() => {
                                              addEmojiSticker(item.symbol);
                                              setEmojiAddedToast(item.symbol);
                                              setTimeout(() => setEmojiAddedToast(null), 2500);
                                            }}
                                            title={item.name}
                                            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-indigo-600/40 hover:border-indigo-500/80 border border-slate-800 text-xl flex items-center justify-center transition-all hover:scale-115 cursor-pointer shadow-2xs active:scale-95"
                                          >
                                            {item.symbol}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Pick Emoji Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Quick Add:</span>
                      {['🔥', '😂', '🚀', '💯', '👑', '🎯', '✨', '⚡', '🗿', '👀', '💪', '💰', '👍', '❤️', '🐐'].map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => {
                            addEmojiSticker(symbol);
                            setEmojiAddedToast(symbol);
                            setTimeout(() => setEmojiAddedToast(null), 2500);
                          }}
                          className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-base flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 hover:scale-110 transition-all cursor-pointer shadow-2xs"
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. CANVAS BACKGROUND FILL PANEL */}
              {openSection === 'bg' && (
                <motion.div
                  key="bg"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Canvas Background Fill</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg uppercase">
                      {bgType}
                    </span>
                  </div>

                  <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                    {[
                      { id: 'photo', label: '📷 Photo' },
                      { id: 'solid', label: '🎨 Solid' },
                      { id: 'gradient', label: '🌈 Gradient' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setBgType(tab.id as any); pushHistorySnapshot(); }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${bgType === tab.id ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {bgType === 'solid' && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Solid Color</label>
                        <input
                          type="color"
                          value={solidBgColor}
                          onChange={(e) => { setSolidBgColor(e.target.value); pushHistorySnapshot(); }}
                          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['#0f172a', '#1e1b4b', '#831843', '#064e3b', '#451a03', '#ffffff', '#000000'].map((color) => (
                          <button
                            key={color}
                            onClick={() => { setSolidBgColor(color); pushHistorySnapshot(); }}
                            className="w-7 h-7 rounded-lg border border-black/10 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {bgType === 'gradient' && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Color 1</label>
                          <input
                            type="color"
                            value={gradientColor1}
                            onChange={(e) => { setGradientColor1(e.target.value); pushHistorySnapshot(); }}
                            className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Color 2</label>
                          <input
                            type="color"
                            value={gradientColor2}
                            onChange={(e) => { setGradientColor2(e.target.value); pushHistorySnapshot(); }}
                            className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { c1: '#4f46e5', c2: '#9333ea', name: 'Cyberpunk' },
                          { c1: '#ff4e50', c2: '#f9d423', name: 'Sunset' },
                          { c1: '#0f172a', c2: '#1e293b', name: 'Dark Slate' },
                          { c1: '#059669', c2: '#10b981', name: 'Emerald' },
                          { c1: '#ec4899', c2: '#8b5cf6', name: 'Neon Pink' },
                        ].map((g) => (
                          <button
                            key={g.name}
                            onClick={() => { setGradientColor1(g.c1); setGradientColor2(g.c2); pushHistorySnapshot(); }}
                            title={g.name}
                            className="w-8 h-8 rounded-xl border border-black/10 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                            style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 5. PHOTO FILTERS & EFFECTS PANEL */}
              {openSection === 'filters' && (
                <motion.div
                  key="filters"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Photo Filters & Effects</h3>
                    </div>
                    <button
                      onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setBgBlur(0); setGrayscale(0); setSepia(0); pushHistorySnapshot(); }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Dim BG', b: 60, c: 110, s: 100, blur: 4, g: 0, sep: 0 },
                      { label: 'Cinematic', b: 105, c: 125, s: 120, blur: 0, g: 0, sep: 0 },
                      { label: 'Vibrant', b: 110, c: 115, s: 150, blur: 0, g: 0, sep: 0 },
                      { label: 'B&W', b: 100, c: 120, s: 100, blur: 0, g: 100, sep: 0 },
                      { label: 'Vintage', b: 95, c: 105, s: 90, blur: 0, g: 0, sep: 80 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => { setBrightness(preset.b); setContrast(preset.c); setSaturation(preset.s); setBgBlur(preset.blur); setGrayscale(preset.g); setSepia(preset.sep); pushHistorySnapshot(); }}
                        className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300 pt-1">
                    <div>
                      <span>Brightness: {brightness}%</span>
                      <input type="range" min="30" max="180" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} onMouseUp={() => pushHistorySnapshot()} className="w-full accent-indigo-600 mt-1" />
                    </div>
                    <div>
                      <span>Contrast: {contrast}%</span>
                      <input type="range" min="40" max="180" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} onMouseUp={() => pushHistorySnapshot()} className="w-full accent-indigo-600 mt-1" />
                    </div>
                    <div>
                      <span>Blur BG: {bgBlur}px</span>
                      <input type="range" min="0" max="16" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} onMouseUp={() => pushHistorySnapshot()} className="w-full accent-indigo-600 mt-1" />
                    </div>
                    <div>
                      <span>Saturation: {saturation}%</span>
                      <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} onMouseUp={() => pushHistorySnapshot()} className="w-full accent-indigo-600 mt-1" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 6. BRAND WATERMARK TAG PANEL */}
              {openSection === 'watermark' && (
                <motion.div
                  key="watermark"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-pink-50 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 dark:text-pink-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Brand Watermark Tag</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${watermarkEnabled ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {watermarkEnabled ? watermarkText || 'Enabled' : 'Off'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Brand Watermark</span>
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={(e) => { setWatermarkEnabled(e.target.checked); pushHistorySnapshot(); }}
                      className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {watermarkEnabled && (
                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Watermark Text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          onBlur={() => pushHistorySnapshot()}
                          placeholder="@MyPageName"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Corner Position</label>
                          <select
                            value={watermarkPosition}
                            onChange={(e) => { setWatermarkPosition(e.target.value as any); pushHistorySnapshot(); }}
                            className="w-full px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                          >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                          <input
                            type="range"
                            min="0.2"
                            max="1.0"
                            step="0.1"
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                            onMouseUp={() => pushHistorySnapshot()}
                            className="w-full accent-indigo-600 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 7. PRESETS & OVERLAYS PANEL */}
              {openSection === 'layers' && (
                <motion.div
                  key="layers"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Preset PNG Overlays</h3>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg">
                      1-Tap Add
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">Click any badge to insert overlay directly on canvas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_OVERLAYS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => addOverlayLayer(preset.url, preset.name)}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-gray-200 dark:border-gray-700 hover:border-purple-300 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-purple-600 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-xs font-black text-purple-600">+</span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => overlayFileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/50 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Upload Custom PNG Overlay from Device</span>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

    </main>
  );
}
