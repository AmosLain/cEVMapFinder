import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import ConsentScripts from "./components/ConsentScripts";

export const metadata: Metadata = {
  title: "EVMapFinder — Find EV Charging Stations Near You",
  description:
    "Search and discover electric vehicle charging stations worldwide. Filter by location, power type, and network. Find the nearest EV charger with one click.",
  alternates: {
    canonical: "https://www.evmapfinder.com",
  },
  openGraph: {
    title: "EVMapFinder — Find EV Charging Stations Near You",
    description:
      "Discover EV charging stations near you. Search by city, name, or network.",
    type: "website",
    url: "https://www.evmapfinder.com",
    images: [
      {
        url: "https://www.evmapfinder.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "EVMapFinder - EV Charging Stations Map",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EVMapFinder",
    url: "https://www.evmapfinder.com",
    description:
      "Find EV charging stations worldwide. Search by city, address, or use your current location.",
    applicationCategory: "TravelApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>

      <body className="min-h-screen bg-white text-slate-900 flex flex-col">

        {/* תוכן האתר */}
        <main className="flex-1">
          {children}
        </main>

        {/* פוטר גלובלי */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm">

            <div className="flex flex-wrap gap-6">
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:underline">
                Terms of Use
              </a>
              <a href="mailto:support@evmapfinder.com" className="hover:underline">
                Contact
              </a>
            </div>

            <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
              EV charging station data is provided by third-party sources and may
              not always be accurate or up to date. Always verify availability,
              compatibility, and access rules before relying on it.
            </p>

            <p className="mt-3 text-xs text-slate-500">
              © {new Date().getFullYear()} EVMapFinder
            </p>
          </div>
        </footer>

        {/* קוקיז + טעינת סקריפטים אחרי אישור */}
        <CookieBanner />
        <ConsentScripts />

      </body>
    </html>
  );
}