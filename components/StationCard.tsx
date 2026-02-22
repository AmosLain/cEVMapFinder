import type { Station } from "@/lib/types";

interface StationCardProps {
  station: Station;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getMapsUrl(station: Station): string {
  if (station.lat != null && station.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
  }
  const query = [station.name, station.address, station.city]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function StationCard({ station }: StationCardProps) {
  const mapsUrl = getMapsUrl(station);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-green-500 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-white font-semibold text-base leading-snug line-clamp-2">
          {station.name}
        </h2>
        {station.distance != null && (
          <span className="flex-shrink-0 text-green-400 text-sm font-medium bg-green-900/40 px-2 py-0.5 rounded-full">
            {formatDistance(station.distance)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm text-slate-400">
        {(station.address || station.city) && (
          <p className="flex items-center gap-1">
            <span>📍</span>
            <span>
              {[station.address, station.city, station.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
        )}
        {station.power && (
          <p className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-yellow-400 font-medium">{station.power}</span>
          </p>
        )}
        {station.network && (
          <p className="flex items-center gap-1">
            <span>🔌</span>
            <span>{station.network}</span>
          </p>
        )}
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <span>🗺️</span>
        Open in Google Maps
      </a>
    </div>
  );
}
