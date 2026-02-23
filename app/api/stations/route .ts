import { NextRequest, NextResponse } from "next/server";
import { demoStations } from "@/lib/demoStations";
import israelStationsJson from "@/lib/israelStations.json";
import type { Station } from "@/lib/types";

const israelStations = israelStationsJson as Station[];

const TIMEOUT_MS = 12000;

function mapOcmToStation(item: Record<string, unknown>): Station {
  const ap = item.AddressInfo as Record<string, unknown> | undefined;
  const conns = item.Connections as Record<string, unknown>[] | undefined;
  const op = item.OperatorInfo as Record<string, unknown> | undefined;

  let power: string | undefined;
  if (conns && conns.length > 0) {
    const maxKw = conns
      .map((c) => Number((c as Record<string, unknown>).PowerKW ?? 0))
      .filter((n) => n > 0)
      .sort((a, b) => b - a)[0];
    if (maxKw) {
      const hasAC = conns.some(
        (c) => Number((c as Record<string, unknown>).CurrentTypeID) === 1
      );
      power = `${hasAC ? "AC" : "DC"} ${maxKw}kW`;
    }
  }

  return {
    id: String((item as Record<string, unknown>).ID ?? Math.random()),
    name: String(ap?.Title ?? "Unknown Station"),
    address: String(ap?.AddressLine1 ?? ""),
    city: String(ap?.Town ?? ""),
    country: String(((ap?.Country as Record<string, unknown>)?.Title) ?? ""),
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

function isInIsrael(lat: number, lng: number): boolean {
  return lat >= 29.4 && lat <= 33.4 && lng >= 34.2 && lng <= 35.9;
}

async function geocodePlace(query: string): Promise<{ lat: string; lng: string } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query.trim());

  try {
    return await withTimeout(async (signal) => {
      const res = await fetch(url.toString(), {
        signal,
        cache: "no-store",
        headers: {
          "User-Agent": "EVMapFinder/1.0 (non-commercial)",
          "Accept-Language": "en",
        },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      const first = data?.[0];
      if (!first?.lat || !first?.lon) return null;
      return { lat: first.lat, lng: first.lon };
    });
  } catch {
    return null;
  }
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
      headers: { "User-Agent": "EVMapFinder/1.0" },
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
    const distanceKm = Number(searchParams.get("distanceKm") ?? "35");
    const search = (searchParams.get("search") ?? "").trim();
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng") ?? searchParams.get("lon");
    const provider = (process.env.STATIONS_PROVIDER ?? "ocm").toLowerCase();

    // Nothing provided → return empty
    if (!latParam && !lngParam && !search) {
      return NextResponse.json({ stations: [] });
    }

    // Resolve coordinates
    let effectiveLat: number | null = latParam ? parseFloat(latParam) : null;
    let effectiveLng: number | null = lngParam ? parseFloat(lngParam) : null;

    if ((effectiveLat == null || effectiveLng == null) && search) {
      const geo = await geocodePlace(search);
      if (!geo) {
        return NextResponse.json({
          stations: [],
          error: { message: `Could not find location for: "${search}"` },
        });
      }
      effectiveLat = parseFloat(geo.lat);
      effectiveLng = parseFloat(geo.lng);
    }

    if (effectiveLat == null || effectiveLng == null) {
      return NextResponse.json({ stations: [] });
    }

    // User in Israel → use local dataset
    if (provider === "ocm" && isInIsrael(effectiveLat, effectiveLng)) {
      return NextResponse.json({ stations: israelStations.slice(0, limit) });
    }

    // User outside Israel → use OCM
    if (provider === "ocm") {
      try {
        const stations = await fetchOcmStations({
          limit,
          lat: String(effectiveLat),
          lng: String(effectiveLng),
          distanceKm: Number.isFinite(distanceKm) ? distanceKm : 35,
        });
        return NextResponse.json({ stations });
      } catch {
        console.warn("OCM failed, falling back to demo");
        return NextResponse.json({ stations: demoStations });
      }
    }

    return NextResponse.json({ stations: demoStations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ stations: [], error: { message: msg } }, { status: 500 });
  }
}
