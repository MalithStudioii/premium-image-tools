import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions - Premium Image Tools',
  description: 'Terms and Conditions for using Premium Image Tools by Nexia.',
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200/80 text-xs font-bold text-purple-700 mb-4 shadow-2xs">
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Last updated: August 1, 2026. Please read these terms carefully before using our website.
        </p>
      </div>

      {/* Terms Content */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8 text-gray-700 leading-relaxed text-sm">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using <strong>Premium Image Tools by Nexia</strong> (&quot;the Service&quot;), you agree to be bound by these Terms & Conditions. If you do not agree to all terms, you may not access or use the web application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. Description of Service</h2>
          <p>
            Premium Image Tools provides online image processing utilities (including photo editing, compression, cropping, resizing, background removal, redacting, and color inspection) that execute directly within the user&apos;s web browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. User Responsibilities & Acceptable Use</h2>
          <p>
            You agree to use the Service solely for lawful purposes. You represent and warrant that you own or have the necessary rights to any images or graphic assets you process using the tools. You shall not use the Service to process unlawful, defamatory, or harmful content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. Intellectual Property</h2>
          <p>
            All original codebase, branding, UI components, logo designs, and source code of Premium Image Tools belong exclusively to <strong>Nexia</strong>. You retain 100% full ownership, rights, and copyright to any images or graphics processed through our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">5. Disclaimer of Warranties</h2>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we strive to ensure optimal browser compatibility and performance, Nexia does not guarantee uninterrupted or error-free processing.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">6. Limitation of Liability</h2>
          <p>
            In no event shall Nexia be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service or loss of data resulting from browser crashes or file corruption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the website following any changes constitutes acceptance of the updated terms.
          </p>
        </section>

      </div>
    </main>
  );
}
