import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blur Sensitive Areas & Pixelate Images',
  description:
    'Protect privacy by blurring or pixelating faces, license plates, addresses, and sensitive details on images directly in your browser.',
  keywords: [
    'blur image',
    'blur faces',
    'pixelate image online',
    'hide sensitive information image',
    'censor picture free',
  ],
  alternates: {
    canonical: '/blur-sensitive',
  },
  openGraph: {
    title: 'Blur Sensitive Areas & Pixelate Images | Premium Image Tools',
    description:
      'Protect privacy by blurring or pixelating sensitive details on images directly in your browser.',
    url: '/blur-sensitive',
  },
};

export default function BlurSensitiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
