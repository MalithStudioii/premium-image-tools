'use client';

import Script from 'next/script';

export default function MonetagAds() {
  return (
    <>
      {/* 1. Monetag Vignette / Interstitial Ad (Zone: 11453477) - High CPM on Download/Actions */}
      <Script
        id="monetag-vignette-11453477"
        src="https://n6wxm.com/vignette.min.js"
        data-zone="11453477"
        strategy="lazyOnload"
      />

      {/* 2. Monetag In-Page Push Ad (Zone: 11453490) - Clean Native Banner Ads */}
      <Script
        id="monetag-ipp-11453490"
        src="https://nap5k.com/tag.min.js"
        data-zone="11453490"
        strategy="lazyOnload"
      />

      {/* OnClick Popunder disabled to protect Mobile User Experience & Navigation */}
      {/* 
      <Script
        id="monetag-popunder-11453486"
        src="https://al5sm.com/tag.min.js"
        data-zone="11453486"
        strategy="lazyOnload"
      /> 
      */}
    </>
  );
}
