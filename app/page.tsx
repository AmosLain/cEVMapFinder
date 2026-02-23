// ✅ NO "use client" here — this is a Server Component
// Google can now see all the content on first load!

import { Suspense } from "react";
import type { Station } from "@/lib/types";
import StationsClient from "./StationsClient";

// Fetch initial stations on the server (SSR) — Google will index this!
async function getInitialStations(): Promise<Station[]> {
  try {
    // In production, call the OCM API or your own DB directly here
    // (don't fetch your own /api route from a server component)
    const res = await fetch(
      "https://api.openchargemap.io/v3/poi/?output=json&countrycode=IL&maxresults=50&compact=true&verbose=false",
      { next: { revalidate: 3600 } } // cache for 1 hour
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

        {/* 
          ✅ Server-rendered content that Google CAN index:
          Show the initial stations as static HTML before any JS runs.
        */}
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

        {/* Interactive client component for search/filter */}
        <Suspense fallback={<p className="text-slate-400">Loading interactive map…</p>}>
          <StationsClient initialStations={initialStations} />
        </Suspense>
      </div>
    </main>
  );
}
