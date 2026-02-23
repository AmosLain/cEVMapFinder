import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6510652100353402"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}