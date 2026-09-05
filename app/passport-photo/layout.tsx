import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passport & Visa ID Photo Maker - 2x2", 35x45mm & 4x6 Printable Sheets',
  description:
    'Free online biometric passport and visa photo maker. ICAO-compliant face guides, official plain backgrounds (White, Off-white, Blue), country presets (US, Sri Lanka, UK, Schengen, Canada, India), and instant 4x6" print sheet generator.',
  keywords: [
    'passport photo maker',
    'visa photo maker online',
    'us visa photo 2x2',
    'sri lanka passport photo 35x45',
    'schengen visa photo',
    'biometric id photo',
    'free passport photo print sheet',
    '4x6 passport photo template',
    'dv lottery photo tool',
    'white background photo editor',
  ],
  alternates: {
    canonical: '/passport-photo',
  },
  openGraph: {
    title: 'Passport & Visa ID Photo Maker | Premium Image Tools',
    description:
      'Create ICAO-compliant passport & visa photos online for free. Official country presets & 4x6" printable photo sheets.',
    url: '/passport-photo',
  },
};

export default function PassportPhotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
