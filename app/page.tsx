// ✅ NO "use client" here — this is a Server Component
// Google can now see all the content on first load!

import { Suspense } from "react";
import Link from "next/link";
import type { Station } from "@/lib/types";
import StationsClient from "./StationsClient";

// ─── City list for internal linking (helps Google discover all city pages) ────
const CITIES_BY_REGION: { region: string; cities: { slug: string; name: string }[] }[] = [
  {
    region: "Israel",
    cities: [
      { slug: "tel-aviv", name: "Tel Aviv" },
      { slug: "jerusalem", name: "Jerusalem" },
      { slug: "haifa", name: "Haifa" },
      { slug: "rishon-lezion", name: "Rishon LeZion" },
      { slug: "petah-tikva", name: "Petah Tikva" },
      { slug: "beer-sheva", name: "Be'er Sheva" },
      { slug: "netanya", name: "Netanya" },
      { slug: "ashdod", name: "Ashdod" },
      { slug: "eilat", name: "Eilat" },
    ],
  },
  {
    region: "United States",
    cities: [
      { slug: "new-york", name: "New York" },
      { slug: "los-angeles", name: "Los Angeles" },
      { slug: "san-francisco", name: "San Francisco" },
      { slug: "san-diego", name: "San Diego" },
      { slug: "seattle", name: "Seattle" },
      { slug: "austin", name: "Austin" },
      { slug: "chicago", name: "Chicago" },
      { slug: "miami", name: "Miami" },
    ],
  },
  {
    region: "Europe",
    cities: [
      { slug: "london", name: "London" },
      { slug: "paris", name: "Paris" },
      { slug: "berlin", name: "Berlin" },
      { slug: "amsterdam", name: "Amsterdam" },
      { slug: "madrid", name: "Madrid" },
      { slug: "barcelona", name: "Barcelona" },
      { slug: "rome", name: "Rome" },
      { slug: "milan", name: "Milan" },
      { slug: "munich", name: "Munich" },
      { slug: "vienna", name: "Vienna" },
      { slug: "zurich", name: "Zurich" },
      { slug: "oslo", name: "Oslo" },
      { slug: "stockholm", name: "Stockholm" },
      { slug: "copenhagen", name: "Copenhagen" },
      { slug: "brussels", name: "Brussels" },
      { slug: "lisbon", name: "Lisbon" },
      { slug: "dublin", name: "Dublin" },
      { slug: "warsaw", name: "Warsaw" },
      { slug: "prague", name: "Prague" },
      { slug: "helsinki", name: "Helsinki" },
    ],
  },
  {
    region: "Asia & Pacific",
    cities: [
      { slug: "tokyo", name: "Tokyo" },
      { slug: "osaka", name: "Osaka" },
      { slug: "seoul", name: "Seoul" },
      { slug: "singapore", name: "Singapore" },
      { slug: "hong-kong", name: "Hong Kong" },
      { slug: "shanghai", name: "Shanghai" },
      { slug: "beijing", name: "Beijing" },
      { slug: "dubai", name: "Dubai" },
      { slug: "sydney", name: "Sydney" },
      { slug: "melbourne", name: "Melbourne" },
    ],
  },
  {
    region: "Canada",
    cities: [
      { slug: "toronto", name: "Toronto" },
      { slug: "vancouver", name: "Vancouver" },
      { slug: "montreal", name: "Montreal" },
    ],
  },
];

// ─── Fetch initial stations (SSR) ─────────────────────────────────────────────
async function getInitialStations(): Promise<Station[]> {
  try {
    const res = await fetch(
      "https://api.openchargemap.io/v3/poi/?output=json&countrycode=IL&maxresults=50&compact=true&verbose=false",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, 50).map((item: any) => ({
      id: String(item.ID),
      name: String(item.AddressInfo?.Title ?? "Unknown Station"),
      address: String(item.AddressInfo?.AddressLine1 ?? ""),
      city: String(item.AddressInfo?.Town ?? ""),
      country: String(item.AddressInfo?.Country?.Title ?? ""),
      lat: item.AddressInfo?.Latitude,
      lng: item.AddressInfo?.Longitude,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const initialStations = await getInitialStations();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            EVMapFinder
          </h1>
          <p className="text-slate-400 mt-2">
            Global EV charging stations — search by city or use Near Me
          </p>
        </header>

        {/* Server-rendered stations — Google indexes this */}
        {initialStations.length > 0 && (
          <section aria-label="Featured EV Charging Stations">
            <h2 className="sr-only">EV Charging Stations</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {initialStations.map((station) => (
                <li key={station.id} className="bg-slate-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white">{station.name}</h3>
                  {station.address && (
                    <p className="text-slate-400 text-sm mt-1">{station.address}</p>
                  )}
                  {station.city && (
                    <p className="text-slate-400 text-sm">{station.city}, {station.country}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Interactive client component */}
        <Suspense fallback={<p className="text-slate-400">Loading interactive map…</p>}>
          <StationsClient initialStations={initialStations} />
        </Suspense>

        {/* ✅ SEO FIX: Internal links to all city pages
            This is the most important addition — Google crawls links, not just sitemaps.
            Without these links, Google may never discover or index the city pages. */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">
            EV Charging Stations by City
          </h2>
          <div className="space-y-8">
            {CITIES_BY_REGION.map(({ region, cities }) => (
              <div key={region}>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">
                  {region}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {cities.map(({ slug, name }) => (
                    <li key={slug}>
                      <Link
                        href={`/city/${slug}`}
                        className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
