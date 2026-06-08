import { useState, useEffect, useMemo, useRef } from "react";
import { VscSearch, VscFile } from "react-icons/vsc";
import type { FileNode } from "../types";
import { getFileTree } from "../services/api";

interface CommandPaletteProps {
  open: boolean;
  refreshKey: number;
  onClose: () => void;
  onSelect: (path: string) => void;
}

function flattenFiles(nodes: FileNode[]): string[] {
  const out: string[] = [];
  const walk = (list: FileNode[]) => {
    for (const node of list) {
      if (node.is_dir) {
        if (node.children) walk(node.children);
      } else {
        out.push(node.path);
      }
    }
  };
  walk(nodes);
  return out;
}

export default function CommandPalette({
  open,
  refreshKey,
  onClose,
  onSelect,
}: CommandPaletteProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the file list whenever the palette opens (or the tree changes).
  useEffect(() => {
    if (!open) return;
    getFileTree()
      .then((tree) => setFiles(flattenFiles(tree)))
      .catch(() => setFiles([]));
    setQuery("");
    setSelected(0);
    // Focus the input on open.
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open, refreshKey]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files.slice(0, 50);
    return files
      .filter((f) => f.toLowerCase().includes(q))
      .slice(0, 50);
  }, [files, query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  const choose = (path: string | undefined) => {
    if (path) onSelect(path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(matches[selected]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[90vw] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
          <VscSearch className="text-gray-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search files by name..."
            className="flex-1 bg-transparent text-sm text-gray-100 focus:outline-none placeholder-gray-500"
          />
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {matches.length === 0 ? (
            <div className="px-3 py-3 text-xs text-gray-500">No matching files</div>
          ) : (
            matches.map((path, i) => (
              <button
                key={path}
                onClick={() => choose(path)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm ${
                  i === selected
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <VscFile className="flex-shrink-0 text-gray-400" />
                <span className="truncate">{path}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
