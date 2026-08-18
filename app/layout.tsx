import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import MonetagAds from "@/components/MonetagAds";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalDropzone from "@/components/GlobalDropzone";
import MobileDock from "@/components/MobileDock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium Image Tools - Fast, Free & 100% Private",
  description: "Compress, crop, resize, and edit images directly in your browser with zero server uploads.",
  other: {
    monetag: "100e29890dd00794240cf66653783056",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="monetag" content="100e29890dd00794240cf66653783056" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const isDark = theme === 'dark' || (!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <GlobalDropzone>
            <MonetagAds />
            <Navbar />
            <div className="flex-1 pb-8 md:pb-0">{children}</div>
            <footer className="pt-8 pb-28 md:py-8 border-t border-gray-200/60 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xs text-xs text-gray-500 dark:text-gray-400">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <p className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                    © {new Date().getFullYear()} <span className="font-bold text-gray-900 dark:text-white">Premium Image Tools</span> by{' '}
                    <span className="font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-sm">
                      Nexia
                    </span>
                  </p>
                  <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    100% Client-Side Processing • Images stay safe in your browser
                  </p>
                </div>

                {/* Footer Legal & About Links */}
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    About Us
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </div>
              </div>
            </footer>
            <MobileDock />
          </GlobalDropzone>
        </ThemeProvider>
      </body>
    </html>
  );
}
