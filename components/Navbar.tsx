'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Minimize2, Crop, Scaling, EyeOff, Palette, Smile, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Compressor',
      href: '/compress',
      icon: Minimize2,
      activeColor: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Cropper',
      href: '/crop',
      icon: Crop,
      activeColor: 'bg-purple-50 text-purple-600',
    },
    {
      name: 'Resizer',
      href: '/resize',
      icon: Scaling,
      activeColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      name: 'Blur & Redact',
      href: '/blur-sensitive',
      icon: EyeOff,
      activeColor: 'bg-rose-50 text-rose-600',
    },
    {
      name: 'Color Palette',
      href: '/color-palette',
      icon: Palette,
      activeColor: 'bg-amber-50 text-amber-600',
    },
    {
      name: 'Meme Studio',
      href: '/meme-generator',
      icon: Smile,
      activeColor: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
              Premium Image Tools
            </span>
            <span className="block text-[11px] text-gray-500 font-semibold tracking-wide">
              by <span className="font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nexia</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? item.activeColor + ' shadow-xs ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Privacy Badge */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Private (Client-side)</span>
        </div>

      </div>
    </header>
  );
}
