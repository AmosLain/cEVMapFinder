import { NextRequest, NextResponse } from "next/server";
import { demoStations } from "@/lib/demoStations";
import type { Station } from "@/lib/types";

const TIMEOUT_MS = 9000;

// ממיר את פורמט OCM לפורמט Station שלנו
function mapOcmToStation(item: Record<string, unknown>): Station {
  const ap = item.AddressInfo as Record<string, unknown> | undefined;
  const conns = item.Connections as Record<string, unknown>[] | undefined;

  // חישוב הספק מקסימלי מתוך Connections
  let power: string | undefined;
  if (conns && conns.length > 0) {
    const maxKw = conns
      .map((c) => Number(c.PowerKW ?? 0))
      .filter((n) => n > 0)
      .sort((a, b) => b - a)[0];
    if (maxKw) {
      const hasAC = conns.some((c) => Number(c.CurrentTypeID) === 1);
      const prefix = hasAC ? "AC" : "DC";
      power = `${prefix} ${maxKw}kW`;
    }
  }

  const op = item.OperatorInfo as Record<string, unknown> | undefined;

  return {
    id: String(item.ID ?? Math.random()),
    name: String(ap?.Title ?? "Unknown Station"),
    address: String(ap?.AddressLine1 ?? ""),
    city: String(ap?.Town ?? ""),
    country: String(
      (ap?.Country as Record<string, unknown>)?.Title ?? ""
    ),
    power,
    network: op?.Title ? String(op.Title) : undefined,
    lat: ap?.Latitude != null ? Number(ap.Latitude) : undefined,
    lng: ap?.Longitude != null ? Number(ap.Longitude) : undefined,
  };
}

async function fetchOcmStations(limit: number): Promise<Station[]> {
  const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY ?? "";
  const url = new URL("https://api.openchargemap.io/v3/poi/");
  url.searchParams.set("output", "json");
  url.searchParams.set("maxresults", String(limit));
  url.searchParams.set("compact", "false");
  url.searchParams.set("verbose", "false");
  if (apiKey) url.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`OCM returned ${res.status}`);
    const data = await res.json() as Record<string, unknown>[];
    return data.map(mapOcmToStation);
  } finally {
    clearTimeout(timerId);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.toLowerCase() ?? "";
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "500", 10),
      1000
    );

    const provider = process.env.STATIONS_PROVIDER ?? "demo";

    let stations: Station[] = [];

    if (provider === "ocm") {
      try {
        stations = await fetchOcmStations(limit);
      } catch {
        // Fallback לדמו אם OCM נכשל
        console.warn("OCM fetch failed, falling back to demo data");
        stations = demoStations;
      }
    } else {
      stations = demoStations;
    }

    if (q) {
      stations = stations.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.network?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ stations: stations.slice(0, limit) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}