import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Sparkles, Wand2, EyeOff, Layers } from 'lucide-react';

export const metadata = {
  title: 'About Us - Premium Image Tools by Nexia',
  description: 'Learn about Premium Image Tools by Nexia, our 100% client-side private image processing mission and features.',
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700 mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>About Premium Image Tools</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Redefining <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Image Editing</span> Privacy
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Fast, powerful, and 100% browser-based. We empower creators, designers, and everyday users to compress, edit, crop, and redact photos without sending a single byte to external servers.
        </p>
      </div>

      {/* Core Values / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">100% Private</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your photos never leave your device. All calculations, WebAssembly ML cutouts, and image filters execute inside your browser RAM.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Speed</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            No server upload queues, connection throttling, or processing delays. Edit high-resolution photos instantly at native GPU speeds.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Wand2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Pro Suite Tools</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            From social media presets and machine learning background removal to privacy redacting and color loupe extraction.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm mb-16 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Premium Image Tools</strong> was built by <span className="font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nexia</span> with a simple principle: software should respect user privacy. Traditional online image editors require you to upload personal photographs, sensitive ID documents, or client graphic assets to remote cloud servers—exposing your data to potential server breaches or third-party storage.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          By leveraging modern WebAssembly (WASM), WebGL, HTML5 Canvas, and modern Web APIs, we bring desktop-class photo editing tools directly into your browser interface. Whether you are cropping a portrait for Instagram, blurring sensitive data on a screenshot, or shrinking image file size by 90%, your files remain completely confidential.
        </p>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-center text-white shadow-xl flex flex-col items-center">
        <ShieldCheck className="w-12 h-12 mb-3 text-emerald-300" />
        <h3 className="text-2xl font-bold mb-2">Ready to edit photos privately?</h3>
        <p className="text-xs sm:text-sm text-indigo-100 mb-6 max-w-md">
          Explore our suite of photo editing, compression, cropping, and redaction tools today.
        </p>
        <Link
          href="/photo-editor"
          className="py-3 px-8 rounded-2xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-lg hover:bg-indigo-50 transition-all cursor-pointer"
        >
          Open Photo Studio
        </Link>
      </div>
    </main>
  );
}
