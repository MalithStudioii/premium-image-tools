import { ImageResponse } from 'next/og';

export const alt = 'Premium Image Tools - Fast, Free & 100% Private Client-Side Image Editor';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent)',
          color: '#ffffff',
          padding: '40px 60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Privacy Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 24px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            color: '#a5b4fc',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '28px',
          }}
        >
          🔒 100% Client-Side Processing • Zero Server Uploads
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '60px',
            fontWeight: 900,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #ffffff, #c7d2fe, #818cf8)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Premium Image Tools
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          AI Cutout & Background Removal • Pro Photo Studio • Smart Compressor • Resizer & Privacy Blur
        </div>

        {/* Features badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
            }}
          >
            ⚡ Fast &amp; Free Forever
          </div>
          <div
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              backgroundColor: '#111827',
              border: '1px solid #374151',
              color: '#e2e8f0',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            🛡️ Safe for Private Photos
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
