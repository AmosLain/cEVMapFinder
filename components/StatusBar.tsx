interface StatusBarProps {
  loading: boolean;
  error: string | null;
  total: number;
  geoStatus: string | null;
  hasLocation: boolean;
}

export default function StatusBar({
  loading,
  error,
  total,
  geoStatus,
  hasLocation,
}: StatusBarProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
        <span className="inline-block w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        Loading stations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm py-2 bg-red-900/20 border border-red-800 rounded-lg px-4">
        <span>⚠️</span>
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="text-slate-300">
        <span className="text-green-400 font-semibold">{total}</span>{" "}
        station{total !== 1 ? "s" : ""} found
      </span>
      {hasLocation && (
        <span className="text-green-400 flex items-center gap-1">
          <span>✓</span> Sorted by distance
        </span>
      )}
      {geoStatus && !hasLocation && (
        <span className="text-yellow-400 flex items-center gap-1">
          <span>ℹ️</span> {geoStatus}
        </span>
      )}
    </div>
  );
}
