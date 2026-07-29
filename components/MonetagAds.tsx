'use client';

import Script from 'next/script';

export default function MonetagAds() {
  return (
    <>
      {/* 1. Monetag Vignette / Interstitial Ad (Zone: 11453477) */}
      <Script
        id="monetag-vignette-11453477"
        src="https://n6wxm.com/vignette.min.js"
        data-zone="11453477"
        strategy="afterInteractive"
      />

      {/* 2. Monetag OnClick / Popunder Ad (Zone: 11453486) */}
      <Script
        id="monetag-popunder-11453486"
        src="https://al5sm.com/tag.min.js"
        data-zone="11453486"
        strategy="afterInteractive"
      />

      {/* 3. Monetag In-Page Push Ad (Zone: 11453490) */}
      <Script
        id="monetag-ipp-11453490"
        src="https://nap5k.com/tag.min.js"
        data-zone="11453490"
        strategy="afterInteractive"
      />
    </>
  );
}
