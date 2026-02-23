import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { demoStations } from "@/lib/demoStations";
import type { Station } from "@/lib/types";


function jsonNoStore(body: any, init?: { status?: number }) {
  const res = NextResponse.json(body, { status: init?.status ?? 200 });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
const TIMEOUT_MS = 12000;

function mapOcmToStation(item: Record<string, unknown>): Station {
  const ap = item.AddressInfo as Record<string, unknown> | undefined;
  const conns = item.Connections as Record<string, unknown>[] | undefined;
  const op = item.OperatorInfo as Record<string, unknown> | undefined;

  let power: string | undefined;
  if (conns && conns.length > 0) {
    const maxKw = conns
      .map((c) => Number((c as any).PowerKW ?? 0))
      .filter((n) => n > 0)
      .sort((a, b) => b - a)[0];

    if (maxKw) {
      const hasAC = conns.some((c) => Number((c as any).CurrentTypeID) === 1);
      const prefix = hasAC ? "AC" : "DC";
      power = `${prefix} ${maxKw}kW`;
    }
  }

  return {
    id: String((item as any).ID ?? Math.random()),
    name: String(ap?.Title ?? "Unknown Station"),
    address: String(ap?.AddressLine1 ?? ""),
    city: String(ap?.Town ?? ""),
    country: String(((ap?.Country as any)?.Title) ?? ""),
    power,
    network: op?.Title ? String(op.Title) : undefined,
    lat: ap?.Latitude != null ? Number(ap.Latitude) : undefined,
    lng: ap?.Longitude != null ? Number(ap.Longitude) : undefined,
  };
}

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Geocode a free-text place query to lat/lng using OpenStreetMap Nominatim.
 * Enables global search without defaulting to Israel.
 */
async function geocodeToLatLng(search: string): Promise<{ lat: string; lng: string } | null> {
  const q = search.trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);

  return await withTimeout(async (signal) => {
    const res = await fetch(url.toString(), {
      signal,
      cache: "no-store",
      headers: {
        "User-Agent": "cEVMapFinder/1.0 (geocode; demo)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data?.[0];
    if (!first?.lat || !first?.lon) return null;
    return { lat: String(first.lat), lng: String(first.lon) };
  });
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchOcmStations(opts: {
  limit: number;
  lat: string;
  lng: string;
  distanceKm: number;
}): Promise<Station[]> {
  const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY ?? "";
  const url = new URL("https://api.openchargemap.io/v3/poi/");
  url.searchParams.set("output", "json");
  url.searchParams.set("maxresults", String(opts.limit));
  url.searchParams.set("compact", "false");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("latitude", opts.lat);
  url.searchParams.set("longitude", opts.lng);
  url.searchParams.set("distance", String(opts.distanceKm));
  url.searchParams.set("distanceunit", "KM");
  if (apiKey) url.searchParams.set("key", apiKey);

  return await withTimeout(async (signal) => {
    const res = await fetch(url.toString(), {
      signal,
      cache: "no-store",
      headers: { "User-Agent": "cEVMapFinder/1.0 (Vercel)" },
    });
    if (!res.ok) throw new Error(`OCM returned ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>[];
    return data.map(mapOcmToStation);
  });
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Hard cap to avoid huge payloads
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 500);

    const lat = searchParams.get("lat") ?? undefined;
    const lng = searchParams.get("lng") ?? searchParams.get("lon") ?? undefined;

    // Client can request a radius, but we also do smart widening.
    const requestedDistance = Number(searchParams.get("distanceKm") ?? "15");
    const search = (searchParams.get("search") ?? "").trim();

    // If nothing provided, do not guess a country. Return empty (global site).
    if ((!lat || !lng) && !search) {
      return jsonNoStore({ stations: [] }, { status: 200 });
    }

    let effectiveLat = lat;
    let effectiveLng = lng;

    if ((!effectiveLat || !effectiveLng) && search) {
      const geo = await geocodeToLatLng(search);
      if (!geo) {
        return jsonNoStore(
          { stations: [], error: { message: `Could not find location for: ${search}` } },
          { status: 200 }
        );
      }
      effectiveLat = geo.lat;
      effectiveLng = geo.lng;
    }

    // If still missing (shouldn't), return empty
    if (!effectiveLat || !effectiveLng) {
      return jsonNoStore({ stations: [] }, { status: 200 });
    }

    const provider = (process.env.STATIONS_PROVIDER ?? "ocm").toLowerCase();
    let stations: Station[] = [];

    if (provider === "ocm") {
      try {
        // Fetch within requested radius only (no widening). This keeps results truly "near me".
        const distanceKm = Math.min(Math.max(requestedDistance, 1), 50); // clamp 1..50km
        stations = await fetchOcmStations({
          limit: Math.min(limit, 200),
          lat: String(effectiveLat),
          lng: String(effectiveLng),
          distanceKm,
        });
      } catch (e) {
        // In production, don't silently fall back to Israel demo data.
        if (isProd()) throw e;
        stations = demoStations;
      }
    } else {
      stations = demoStations;
    }

    // Server-side distance compute + sort when lat/lng were provided (GPS or geocoded)
    const originLat = Number(effectiveLat);
    const originLng = Number(effectiveLng);
    if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
      const distanceKm = Math.min(Math.max(requestedDistance, 1), 50);
      const withDistance = stations
        .map((s: any) => {
          const d =
            s.lat != null && s.lng != null
              ? haversineKm(originLat, originLng, Number(s.lat), Number(s.lng))
              : undefined;
          return { ...s, distance: d };
        })
        .filter((s: any) => typeof s.distance === "number" && Number.isFinite(s.distance))
        .filter((s: any) => (s.distance as number) <= distanceKm)
        .sort((a: any, b: any) => (a.distance as number) - (b.distance as number));

      stations = withDistance;
    }

    return jsonNoStore({ stations: stations.slice(0, limit) }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonNoStore({ stations: [], error: { message: msg } }, { status: 500 });
  }
}
