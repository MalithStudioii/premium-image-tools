'use client';

import Link from 'next/link';
import { Minimize2, Crop, Scaling, EyeOff, Palette, Smile, Sparkles, Shield, Zap, Lock, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/TypewriterText';

export default function Home() {
  const features = [
    { icon: Zap, title: 'Instant Processing', desc: 'No upload queues or processing delays.' },
    { icon: Lock, title: '100% Private', desc: 'Images stay in your browser RAM.' },
    { icon: Shield, title: 'Zero File Limits', desc: 'Process unlimited images for free.' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center">
      
      {/* Hero Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 via-purple-50 to-rose-50 border border-gray-200/80 text-xs font-semibold text-gray-800 mb-6 shadow-xs"
      >
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span>Next-Gen Client-Side Image Suite</span>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          Premium <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Image Tools</span>
        </h1>
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed text-center grid">
            <span className="invisible select-none col-start-1 row-start-1 pointer-events-none" aria-hidden="true">
              Fast, secure, and completely free online image processing. Compress, crop, resize, and blur sensitive data directly in your browser.
            </span>
            <span className="col-start-1 row-start-1">
              <TypewriterText 
                text="Fast, secure, and completely free online image processing. Compress, crop, resize, and blur sensitive data directly in your browser."
                speed={80}
                delay={600}
                cursorClassName="bg-indigo-600"
              />
            </span>
          </p>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-20">
        
        {/* Compressor Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Minimize2 className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Optimization
            </span>

            <h2 className="text-lg font-bold text-gray-900 mt-2 mb-2">
              Image Compressor
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Shrink JPG, PNG, and WEBP file size up to 90% without visible quality loss.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Custom Quality & Cap
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Side-by-side Preview
              </li>
            </ul>
          </div>

          <Link
            href="/compress"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all cursor-pointer"
          >
            <span>Open Compressor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Cropper Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Crop className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Editing
            </span>

            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
              Image Cropper
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Crop, rotate, and flip photos with aspect ratio presets for social media.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Presets (1:1, 16:9, 9:16)
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Rotate & Flip Controls
              </li>
            </ul>
          </div>

          <Link
            href="/crop"
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all cursor-pointer"
          >
            <span>Open Cropper</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Resizer Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Scaling className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Dimensioning
            </span>

            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
              Image Resizer
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Resize pixel dimensions or scaling percentage with aspect ratio lock.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Custom Pixels & Aspect Lock
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Percentage Presets
              </li>
            </ul>
          </div>

          <Link
            href="/resize"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <span>Open Resizer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Blur & Redact Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <EyeOff className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              Privacy
            </span>

            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
              Blur & Redact
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Censor sensitive info (faces, phone numbers, ID cards) with blur or blackout bars.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Pixelate & Blackout Bars
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Drag Selection & Undo
              </li>
            </ul>
          </div>

          <Link
            href="/blur-sensitive"
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-all cursor-pointer"
          >
            <span>Open Redact Tool</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Color Palette Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Palette className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Colors
            </span>

            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
              Color Palette
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Inspect pixel colors with magnifying eyedropper & extract dominant palettes.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Pixel Magnifier Loupe
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> HEX, RGB, HSL & CSS Export
              </li>
            </ul>
          </div>

          <Link
            href="/color-palette"
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <span>Open Color Tool</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Meme Studio Card */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative bg-white p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 border border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Smile className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Creativity
            </span>

            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
              Meme Studio
            </h2>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Create viral memes, custom posters, and social headers with typography & stroke outlines.
            </p>

            <ul className="space-y-2 mb-6 text-xs font-medium text-gray-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Classic Impact Font & Strokes
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 16:9, 1:1, 4:5 Aspect Presets
              </li>
            </ul>
          </div>

          <Link
            href="/meme-generator"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <span>Open Meme Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8 border-t border-gray-200/60">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className="flex items-center gap-3 bg-white/60 p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-gray-100 text-gray-800">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">{feat.title}</h4>
                <p className="text-[11px] text-gray-500">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </main>
  );
}