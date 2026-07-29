'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    triggerMonetagAd?: () => void;
  }
}

export default function MonetagAds() {
  useEffect(() => {
    // 1. Inject Monetag Vignette / Interstitial Script (Zone: 11453477)
    if (!document.querySelector('script[data-zone="11453477"]')) {
      try {
        const s = document.createElement('script');
        s.dataset.zone = '11453477';
        s.src = 'https://n6wxm.com/vignette.min.js';
        s.async = true;
        (document.head || document.documentElement).appendChild(s);
      } catch (err) {
        console.error('Monetag Vignette ad script load error:', err);
      }
    }

    // 2. Inject Monetag OnClick / Popunder Script (Zone: 11453486)
    if (!document.querySelector('script[data-zone="11453486"]')) {
      try {
        const s = document.createElement('script');
        s.dataset.zone = '11453486';
        s.src = 'https://al5sm.com/tag.min.js';
        s.async = true;
        (document.head || document.documentElement).appendChild(s);
      } catch (err) {
        console.error('Monetag Popunder ad script load error:', err);
      }
    }

    // 3. Inject Monetag In-Page Push (IPP) Script (Zone: 11453490)
    if (!document.querySelector('script[data-zone="11453490"]')) {
      try {
        const s = document.createElement('script');
        s.dataset.zone = '11453490';
        s.src = 'https://nap5k.com/tag.min.js';
        s.async = true;
        (document.head || document.documentElement).appendChild(s);
      } catch (err) {
        console.error('Monetag IPP ad script load error:', err);
      }
    }

    // Define window.triggerMonetagAd helper
    window.triggerMonetagAd = () => {
      try {
        const dummyClick = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        document.documentElement.dispatchEvent(dummyClick);
      } catch (e) {
        // silent catch
      }
    };
  }, []);

  return null;
}

export function triggerMonetagAd() {
  if (typeof window !== 'undefined' && window.triggerMonetagAd) {
    window.triggerMonetagAd();
  }
}
