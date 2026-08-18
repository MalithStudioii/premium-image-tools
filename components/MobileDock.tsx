'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wand2, Minimize2, Crop, Scaling, EyeOff, Palette, Smile, Home 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileDock() {
  const pathname = usePathname();

  const dockItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Studio', href: '/photo-editor', icon: Wand2 },
    { name: 'Compress', href: '/compress', icon: Minimize2 },
    { name: 'Crop', href: '/crop', icon: Crop },
    { name: 'Resize', href: '/resize', icon: Scaling },
    { name: 'Blur', href: '/blur-sensitive', icon: EyeOff },
    { name: 'Colors', href: '/color-palette', icon: Palette },
    { name: 'Meme', href: '/meme-generator', icon: Smile },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md">
      <div className="backdrop-blur-xl bg-white/85 dark:bg-gray-900/85 border border-gray-200/80 dark:border-gray-800 shadow-2xl rounded-3xl p-1.5 flex items-center justify-around gap-1">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockBubble"
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[9px] mt-0.5 font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
