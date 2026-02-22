"use client";

import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFindNearMe: () => void;
  geoLoading: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onFindNearMe,
  geoLoading,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount (client only)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, address, city…"
        className="flex-1 bg-slate-800 border border-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
      />
      <button
        onClick={onFindNearMe}
        disabled={geoLoading}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-wait text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
      >
        {geoLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Locating…
          </>
        ) : (
          <>
            <span>📍</span>
            Find near me
          </>
        )}
      </button>
    </div>
  );
}
