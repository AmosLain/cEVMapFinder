"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Station } from "@/lib/types";
import { haversineKm } from "@/lib/haversine";
import StationCard from "@/components/StationCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import StatusBar from "@/components/StatusBar";

const PAGE_SIZE = 12;

type GeoState = {
  lat: number;
  lng: number;
} | null;

export default function HomePage() {
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [geo, setGeo] = useState<GeoState>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  // פונקציה לטעינת תחנות — עם או בלי מיקום
  const fetchStations = useCallback(
    async (userLat?: number, userLng?: number) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userLat != null && userLng != null) {
        params.set("lat", String(userLat));
        params.set("lng", String(userLng));
      }

      const url = `/api/stations${params.size > 0 ? "?" + params.toString() : ""}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (data?.error?.message) {
          setError(data.error.message);
        } else {
          setAllStations(
            Array.isArray(data?.stations) ? data.stations : []
          );
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load stations";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // טעינה ראשונה — ללא מיקום
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Debounce חיפוש
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      setPage(1);
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Find Near Me
  const handleFindNearMe = useCallback(() => {
    if (!navigator?.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeo({ lat: latitude, lng: longitude });
        setPage(1);
        setGeoLoading(false);
        // שלח מחדש ל-API עם המיקום של המשתמש
        fetchStations(latitude, longitude);
      },
      (posError) => {
        let msg = "Could not get your location.";
        if (posError.code === posError.PERMISSION_DENIED) {
          msg = "Location access denied. Please allow location in your browser.";
        } else if (posError.code === posError.TIMEOUT) {
          msg = "Location request timed out. Try again.";
        }
        setGeoStatus(msg);
        setGeoLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchStations]);

  // חישוב מרחקים + פילטור + מיון + pagination
  const { filteredStations, totalPages } = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    let list = allStations.map((s): Station => {
      if (geo != null && s.lat != null && s.lng != null) {
        return {
          ...s,
          distance: haversineKm(geo.lat, geo.lng, s.lat, s.lng),
        };
      }
      return { ...s, distance: undefined };
    });

    if (q) {
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.power?.toLowerCase().includes(q) ||
          s.network?.toLowerCase().includes(q)
      );
    }

    if (geo != null) {
      list.sort((a, b) => {
        const da = a.distance ?? Infinity;
        const db = b.distance ?? Infinity;
        return da - db;
      });
    }

    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    return { filteredStations: list, totalPages: pages };
  }, [allStations, debouncedQuery, geo]);

  const currentPage = useMemo(
    () =>
      filteredStations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredStations, page]
  );

  const handlePrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    []
  );
  const handleNext = useCallback(
    () => setPage((p) => Math.min(totalPages, p + 1)),
    [totalPages]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold text-white tracking-tight">
            EVMapFinder
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Hero */}
        <section className="text-center flex flex-col gap-2 pb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Find EV Charging Stations
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Search thousands of charging points worldwide. Click{" "}
            <span className="text-green-400 font-medium">Find near me</span>{" "}
            to see stations closest to you.
          </p>
        </section>

        {/* Search */}
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onFindNearMe={handleFindNearMe}
          geoLoading={geoLoading}
        />

        {/* Status */}
        <StatusBar
          loading={loading}
          error={error}
          total={filteredStations.length}
          geoStatus={geoStatus}
          hasLocation={geo != null}
        />

        {/* Grid */}
        {!loading && !error && (
          <>
            {currentPage.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
                <span className="text-5xl">🔍</span>
                <p className="text-lg font-medium text-slate-300">
                  No stations found
                </p>
                <p className="text-sm text-center max-w-xs">
                  Try a different search term, or clear the search to see
                  all stations.
                </p>
                {debouncedQuery && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setDebouncedQuery("");
                      setPage(1);
                    }}
                    className="mt-2 text-green-400 underline text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentPage.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-slate-500 text-sm">
        <p>EVMapFinder — Helping drivers find charge, everywhere.</p>
      </footer>
    </div>
  );
}