import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVMapFinder — Find EV Charging Stations Near You",
  description:
    "Search and discover electric vehicle charging stations. Filter by location, power type, and network. Find the nearest EV charger with one click.",
  openGraph: {
    title: "EVMapFinder — Find EV Charging Stations Near You",
    description:
      "Discover EV charging stations near you. Search by city, name, or network.",
    type: "website",
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
      <body>{children}</body>
    </html>
  );
}
