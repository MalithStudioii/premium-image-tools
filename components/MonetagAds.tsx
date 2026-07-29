'use client';

import { useEffect } from 'react';

export default function MonetagAds() {
  useEffect(() => {
    // Inject Monetag Vignette / Interstitial Script (Zone: 11453477)
    if (!document.querySelector('script[data-zone="11453477"]')) {
      try {
        const s = document.createElement('script');
        s.dataset.zone = '11453477';
        s.src = 'https://n6wxm.com/vignette.min.js';
        s.async = true;
        (document.head || document.documentElement).appendChild(s);
      } catch (err) {
        console.error('Monetag ad script load error:', err);
      }
    }
  }, []);

  return null;
}
