import { useState } from "react";
import { VscFiles, VscSearch, VscSourceControl } from "react-icons/vsc";
import FileTree from "./FileTree";
import SearchPanel from "./SearchPanel";
import GitPanel from "./GitPanel";

type View = "files" | "search" | "git";

interface SidebarProps {
  onSelectFile: (path: string) => void;
  selectedFile?: string;
  refreshKey: number;
  onTreeChanged: () => void;
}

const TABS: { id: View; icon: typeof VscFiles; label: string }[] = [
  { id: "files", icon: VscFiles, label: "Explorer" },
  { id: "search", icon: VscSearch, label: "Search" },
  { id: "git", icon: VscSourceControl, label: "Source Control" },
];

export default function Sidebar({
  onSelectFile,
  selectedFile,
  refreshKey,
  onTreeChanged,
}: SidebarProps) {
  const [view, setView] = useState<View>("files");

  return (
    <div className="flex h-full">
      {/* Activity bar */}
      <div className="flex flex-col items-center gap-1 py-2 w-11 flex-shrink-0 bg-gray-950 border-r border-gray-700">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            title={label}
            aria-label={label}
            className={`p-2 rounded transition-colors ${
              view === id
                ? "text-white bg-gray-700"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="text-lg" />
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="w-[220px] flex-shrink-0 border-r border-gray-700">
        {view === "files" && (
          <FileTree
            onSelectFile={onSelectFile}
            selectedFile={selectedFile}
            refreshKey={refreshKey}
            onTreeChanged={onTreeChanged}
          />
        )}
        {view === "search" && <SearchPanel onSelectFile={onSelectFile} />}
        {view === "git" && (
          <GitPanel refreshKey={refreshKey} onChanged={onTreeChanged} />
        )}
      </div>
    </div>
  );
}
