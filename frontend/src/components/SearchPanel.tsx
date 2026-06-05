import { useState } from "react";
import { VscSearch } from "react-icons/vsc";
import type { SearchMatch } from "../types";
import { searchFiles } from "../services/api";

interface SearchPanelProps {
  onSelectFile: (path: string) => void;
}

export default function SearchPanel({ onSelectFile }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await searchFiles(q);
      setMatches(res.matches);
      setTruncated(res.truncated);
      setSearched(true);
    } catch {
      setMatches([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Search
        </span>
      </div>
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-600 rounded px-2 focus-within:border-blue-500">
          <VscSearch className="text-gray-500 text-sm flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search in files..."
            className="flex-1 bg-transparent py-1.5 text-xs text-gray-100 focus:outline-none placeholder-gray-600"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-xs text-gray-500">Searching...</div>
        ) : searched && matches.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-500">No results</div>
        ) : (
          <>
            {matches.length > 0 && (
              <div className="px-3 py-1.5 text-[11px] text-gray-500">
                {matches.length}
                {truncated ? "+" : ""} result
                {matches.length === 1 ? "" : "s"}
              </div>
            )}
            {matches.map((m, i) => (
              <button
                key={`${m.path}:${m.line}:${i}`}
                onClick={() => onSelectFile(m.path)}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-700 transition-colors border-b border-gray-800/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-blue-400 truncate">
                    {m.path}
                  </span>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">
                    :{m.line}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono truncate">
                  {m.text.trim()}
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
