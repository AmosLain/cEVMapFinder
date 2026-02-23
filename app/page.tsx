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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [geo, setGeo] = useState<GeoState>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // We reuse geoStatus as a general hint banner when not using geolocation
  const [geoStatus, setGeoStatus] = useState<string | null>(
    "Type a city/address (min 3 chars) to search worldwide, or click Find near me."
  );

  const [page, setPage] = useState(1);

  // Load stations: either by coordinates (Near Me) or by text search (global)
  const fetchStations = useCallback(async (opts?: { lat?: number; lng?: number; search?: string }) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("limit","200");
    if (opts?.lat != null && opts?.lng != null) {
      params.set("lat", String(opts.lat));
      params.set("lng", String(opts.lng));
      params.set("distanceKm", "15");
    } else if (opts?.search) {
      params.set("search", opts.search);
      params.set("distanceKm", "15");
    }

    const url = `/api/stations${params.size > 0 ? "?" + params.toString() : ""}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      if (data?.error?.message) {
        setAllStations([]);
        setError(data.error.message);
      } else {
        setAllStations(Array.isArray(data?.stations) ? data.stations : []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load stations";
      setAllStations([]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      setPage(1);
    }, 300);
  }, []);

  // Global search mode: if no geo, use debounced query to fetch stations around that place
  useEffect(() => {
    if (geo) return; // when we have geo, we do not refetch on every keystroke

    const q = debouncedQuery.trim();
    if (!q) {
      setAllStations([]);
      setError(null);
      setGeoStatus("Type a city/address (min 3 chars) to search worldwide, or click Find near me.");
      return;
    }

    if (q.length < 3) {
      setAllStations([]);
      setError(null);
      setGeoStatus("Type at least 3 characters to search worldwide.");
      return;
    }

    setGeoStatus(null);
    fetchStations({ search: q });
  }, [debouncedQuery, geo, fetchStations]);

  // Find Near Me (browser geolocation)
  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by this browser");
      return;
    }

    setGeoLoading(true);
    setGeoStatus("Requesting location permission…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeo({ lat, lng });
        setGeoStatus(null);
        setGeoLoading(false);
        setPage(1);
        fetchStations({ lat, lng });
      },
      (err) => {
        setGeo(null);
        setGeoLoading(false);
        setGeoStatus(err?.message || "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [fetchStations]);

  // Compute stations (filter + distance sort when geo is available)
  const processedStations = useMemo(() => {
    const q = query.trim().toLowerCase();

    const withDistance = allStations.map((s) => {
      const dist =
        geo && s.lat != null && s.lng != null
          ? haversineKm(geo.lat, geo.lng, s.lat, s.lng)
          : null;

      return { ...s, distance: dist ?? undefined };
    });

    const filtered =
      q.length === 0
        ? withDistance
        : withDistance.filter((s) => {
            const hay = `${s.name} ${s.address} ${s.city} ${s.country}`.toLowerCase();
            return hay.includes(q);
          });

    // sort by distance if geo
    if (geo) {
      filtered.sort((a, b) => {
        const da = a.distance ?? Number.POSITIVE_INFINITY;
        const db = b.distance ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }

    return filtered;
  }, [allStations, geo, query]);

  const total = processedStations.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageStations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedStations.slice(start, start + PAGE_SIZE);
  }, [processedStations, currentPage]);

  // If user changes filters and current page becomes invalid
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            EVMapFinder
          </h1>
          <p className="text-slate-400 mt-2">
            Global EV charging stations (search by place or use Near Me)
          </p>
        </header>

        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onFindNearMe={handleFindNearMe}
          geoLoading={geoLoading}
        />

        <div className="mt-4">
          <StatusBar
            loading={loading}
            error={error}
            total={total}
            geoStatus={geoStatus}
            hasLocation={!!geo}
          />
        </div>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageStations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </section>

        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </main>
  );
}
