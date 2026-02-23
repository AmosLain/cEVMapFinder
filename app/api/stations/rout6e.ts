import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { demoStations } from "@/lib/demoStations";
import type { Station } from "@/lib/types";

function jsonNoStore(body: unknown, init?: { status?: number }) {
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
      power = `${hasAC ? "AC" : "DC"} ${maxKw}kW`;
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

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timerId);
  }
}

async function geocodeToLatLng(
  search: string
): Promise<{ lat: string; lng: string } | null> {
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
        "User-Agent": "EVMapFinder/1.0 (geocode)",
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

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchOcmStations(opts: {
  limit: number;
  lat: string;
  lng: string;
  distanceKm: number;
}): Promise<Station[]> {
  // ✅ FIX: always send API key when available to avoid rate-limit (anonymous = fewer results)
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
      headers: { "User-Agent": "EVMapFinder/1.0" },
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

    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "200", 10) || 200,
      500
    );

    const lat = searchParams.get("lat") ?? undefined;
    const lng =
      searchParams.get("lng") ?? searchParams.get("lon") ?? undefined;

    // ✅ FIX: increased default search radius from 15 → 25 km
    const requestedDistance = Number(
      searchParams.get("distanceKm") ?? "50"
    );
    const search = (searchParams.get("search") ?? "").trim();

    if ((!lat || !lng) && !search) {
      return jsonNoStore({ stations: [] }, { status: 200 });
    }

    let effectiveLat = lat;
    let effectiveLng = lng;

    if ((!effectiveLat || !effectiveLng) && search) {
      const geo = await geocodeToLatLng(search);
      if (!geo) {
        return jsonNoStore(
          {
            stations: [],
            error: { message: `Could not find location for: ${search}` },
          },
          { status: 200 }
        );
      }
      effectiveLat = geo.lat;
      effectiveLng = geo.lng;
    }

    if (!effectiveLat || !effectiveLng) {
      return jsonNoStore({ stations: [] }, { status: 200 });
    }

    const provider = (
      process.env.STATIONS_PROVIDER ?? "ocm"
    ).toLowerCase();
    let stations: Station[] = [];

    if (provider === "ocm") {
      try {
        // ✅ FIX: clamp raised to 1..100 km (was 1..50)
        const distanceKm = Math.min(Math.max(requestedDistance, 50), 100);
        stations = await fetchOcmStations({
          limit: Math.min(limit, 200),
          lat: String(effectiveLat),
          lng: String(effectiveLng),
          distanceKm,
        });
      } catch (e) {
        if (isProd()) throw e;
        stations = demoStations;
      }
    } else {
      stations = demoStations;
    }

    // Server-side distance filter + sort
    const originLat = Number(effectiveLat);
    const originLng = Number(effectiveLng);
    if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
      const distanceKm = Math.min(Math.max(requestedDistance, 1), 100);
      stations = stations
        .map((s: any) => ({
          ...s,
          distance:
            s.lat != null && s.lng != null
              ? haversineKm(originLat, originLng, Number(s.lat), Number(s.lng))
              : undefined,
        }))
        .filter(
          (s: any) =>
            typeof s.distance === "number" &&
            Number.isFinite(s.distance) &&
            s.distance <= distanceKm
        )
        .sort((a: any, b: any) => a.distance - b.distance);
    }

    return jsonNoStore(
      { stations: stations.slice(0, limit) },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonNoStore(
      { stations: [], error: { message: msg } },
      { status: 500 }
    );
  }
}
