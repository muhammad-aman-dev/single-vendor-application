'use client';

import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rebelwatches.com";

export default function ContactPage() {
  // JSON-LD Structured Data Schema for ContactPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Rebel Watches",
    description: "Get in touch with Rebel Watches customer support and concierge.",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "Rebel Watches",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      email: "therebelwatches@gmail.com",
      telephone: "+92-303-6130778",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Blue Area, Jinnah Avenue",
        addressLocality: "Islamabad",
        addressRegion: "Federal",
        postalCode: "44000",
        addressCountry: "PK",
      },
    },
  };

  return (
    <>
      {/* Inject JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="w-full bg-neutral-950 text-neutral-200 min-h-screen selection:bg-neutral-800 selection:text-white font-sans flex flex-col justify-between">
        
        {/* Header Section */}
        <section className="relative w-full py-24 sm:py-32 overflow-hidden border-b border-neutral-900 bg-neutral-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 shadow-xl">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-300">
                Atelier Concierge
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Get in <span className="text-neutral-300 font-serif italic">Touch</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Whether you have questions regarding an order, need horological advice, or require bespoke support, our concierge team is at your disposal.
            </p>
          </div>
        </section>

        {/* Main Content Body */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="space-y-8">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Direct Channels
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Connect instantly with our team through any of the channels below. We are available around the clock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Email Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Email Us</h3>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">therebelwatches@gmail.com</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              {/* Phone / WhatsApp Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between gap-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Call & WhatsApp</h3>
                    <p className="text-sm sm:text-base font-semibold text-white mt-1">+92 303 6130778</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Available 24/7</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/923036130778"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Location Card (Islamabad) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Flagship Atelier</h3>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">Blue Area, Jinnah Avenue</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Islamabad, 44000</p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Hours of Operation</h3>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">24 Hours / 7 Days a Week</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Always at your service</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </>
  );
}
