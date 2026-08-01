'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Minimize2, Crop, Scaling, EyeOff, Palette, Smile, Wand2, ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Photo Studio',
      href: '/photo-editor',
      icon: Wand2,
      activeColor: 'bg-violet-50 text-violet-600 border-violet-200',
    },
    {
      name: 'Compressor',
      href: '/compress',
      icon: Minimize2,
      activeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      name: 'Cropper',
      href: '/crop',
      icon: Crop,
      activeColor: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      name: 'Resizer',
      href: '/resize',
      icon: Scaling,
      activeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      name: 'Blur & Redact',
      href: '/blur-sensitive',
      icon: EyeOff,
      activeColor: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      name: 'Color Palette',
      href: '/color-palette',
      icon: Palette,
      activeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      name: 'Meme Studio',
      href: '/meme-generator',
      icon: Smile,
      activeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors whitespace-nowrap">
              Premium Image Tools
            </span>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wide leading-none">
              by <span className="font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nexia</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? `${item.activeColor} shadow-2xs font-bold`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compact Nav for Large Screens (1024px to 1279px) */}
        <nav className="hidden lg:flex xl:hidden items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? `${item.activeColor} shadow-2xs font-bold`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Privacy Badge & Mobile Menu Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden 2xl:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/80 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Private (Client-side)</span>
          </div>

          <div className="hidden lg:flex 2xl:hidden items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200/80 whitespace-nowrap" title="100% Private Client-Side Processing">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px]">Private</span>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-b border-gray-200/80 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? `${item.activeColor} shadow-2xs`
                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-2 mt-2 border-t border-gray-100 flex items-center gap-2 text-emerald-700 text-xs font-semibold px-2 py-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Private (Client-side Processing)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
