import { NextRequest, NextResponse } from "next/server";
import { demoStations } from "@/lib/demoStations";
import type { Station } from "@/lib/types";

const TIMEOUT_MS = 12000;

// Convert OpenChargeMap POI to our Station shape
function mapOcmToStation(item: Record<string, unknown>): Station {
  const ap = item.AddressInfo as Record<string, unknown> | undefined;
  const conns = item.Connections as Record<string, unknown>[] | undefined;
  const op = item.OperatorInfo as Record<string, unknown> | undefined;

  // Derive a "best" power label from Connections
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
 * This enables global search without forcing a default country.
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
        // Nominatim requires a descriptive User-Agent
        "User-Agent": "cEVMapFinder/1.0 (geocode; non-commercial demo)",
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const limit = Math.min(parseInt(searchParams.get("limit") ?? "300", 10) || 300, 1000);

    // Coordinates from client (near-me mode)
    const lat = searchParams.get("lat") ?? undefined;
    const lng = searchParams.get("lng") ?? searchParams.get("lon") ?? undefined;
    const distanceKm = Number(searchParams.get("distanceKm") ?? "35");

    // Global text search (no IP fallback, no default country)
    const search = (searchParams.get("search") ?? "").trim();

    const provider = (process.env.STATIONS_PROVIDER ?? "ocm").toLowerCase();

    // If nothing provided, do not guess a country. Return empty.
    if (!lat || !lng) {
      if (!search) {
        return NextResponse.json({ stations: [] }, { status: 200 });
      }
    }

    let effectiveLat = lat;
    let effectiveLng = lng;

    if ((!effectiveLat || !effectiveLng) && search) {
      const geo = await geocodeToLatLng(search);
      if (!geo) {
        return NextResponse.json(
          { stations: [], error: { message: `Could not find location for: ${search}` } },
          { status: 200 }
        );
      }
      effectiveLat = geo.lat;
      effectiveLng = geo.lng;
    }

    let stations: Station[] = [];

    if (provider === "ocm") {
      try {
        stations = await fetchOcmStations({
          limit,
          lat: String(effectiveLat),
          lng: String(effectiveLng),
          distanceKm: Number.isFinite(distanceKm) ? distanceKm : 35,
        });
      } catch (e) {
        // fallback to demo if OCM fails (helps dev mode)
        stations = demoStations;
      }
    } else {
      stations = demoStations;
    }

    return NextResponse.json({ stations }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ stations: [], error: { message: msg } }, { status: 500 });
  }
}
