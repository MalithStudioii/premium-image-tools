import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import MonetagAds from "@/components/MonetagAds";

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
    >
      <head>
        <meta name="monetag" content="100e29890dd00794240cf66653783056" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50/50 text-gray-900 font-sans">
        <MonetagAds />
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="py-8 border-t border-gray-200/60 bg-white/70 backdrop-blur-xs text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="flex items-center justify-center gap-1 font-medium">
              © {new Date().getFullYear()} <span className="font-bold text-gray-800">Premium Image Tools</span> from{' '}
              <span className="font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-sm">
                Nexia
              </span>
            </p>
            <p className="text-gray-400 text-[11px]">
              100% Client-Side Processing • All images stay safe in your browser
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
