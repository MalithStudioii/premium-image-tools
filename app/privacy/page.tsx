import React from 'react';
import { Shield, Lock, EyeOff, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Premium Image Tools',
  description: 'Privacy Policy for Premium Image Tools by Nexia. Learn how we protect your privacy with 100% client-side image processing.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700 mb-4 shadow-2xs">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Privacy-First Guarantee</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Last updated: August 1, 2026. Your privacy is our highest priority.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8 text-gray-700 leading-relaxed text-sm">
        
        {/* Highlight Banner */}
        <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-4">
          <Lock className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-emerald-900 text-base mb-1">
              Zero File Upload Guarantee
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              When you drop, select, or edit images in Premium Image Tools, your files are processed exclusively inside your web browser RAM using HTML5 Canvas, WebGL, and WebAssembly APIs. Your images are <strong>never transmitted, saved, or stored</strong> on any external server.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            1. Information We Do Not Collect
          </h2>
          <p>
            Because all image operations execute locally on your device:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
            <li>We do <strong>NOT</strong> collect, store, or analyze your uploaded photos or graphic assets.</li>
            <li>We do <strong>NOT</strong> store facial recognition data, EXIF metadata, or pixel contents.</li>
            <li>We do <strong>NOT</strong> create user profiles, account registrations, or require logins.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            2. Local Browser Storage
          </h2>
          <p>
            Our website may use browser <code>localStorage</code> or <code>sessionStorage</code> strictly for storing user UI preferences (such as selected color modes or active tool settings). This data remains locally on your browser and can be cleared at any time through your browser settings.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            3. Advertising & Cookies
          </h2>
          <p>
            To keep Premium Image Tools completely free for everyone, we display privacy-compliant advertisements provided by third-party advertising partners (such as Monetag). These ad networks may use standard cookies or device identifiers to serve relevant ads.
          </p>
          <p className="text-xs text-gray-500">
            You can manage or disable cookies through your web browser preferences at any time.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            4. AI Features & Server API Calls
          </h2>
          <p>
            Selected optional features (such as AI social caption generation) send lightweight text prompts or compressed image samples to secure AI API endpoints solely for requested text/tag generation. No image data is retained after the single request completes.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Contact & Inquiries</h2>
          <p className="text-xs text-gray-600">
            If you have questions about this Privacy Policy or our client-side processing architecture, feel free to reach out to the <strong>Nexia</strong> developer team.
          </p>
        </section>

      </div>
    </main>
  );
}
