import { useState, useCallback, useEffect } from "react";
import { VscRobot } from "react-icons/vsc";
import ChatPanel from "./ChatPanel";
import Sidebar from "./Sidebar";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import CommandPalette from "./CommandPalette";

export default function Layout() {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleFileChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openFile = useCallback((path: string) => {
    setOpenTabs((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]));
    setActiveFile(path);
  }, []);

  const closeTab = useCallback(
    (path: string) => {
      setOpenTabs((tabs) => {
        const idx = tabs.indexOf(path);
        const next = tabs.filter((t) => t !== path);
        setActiveFile((current) => {
          if (current !== path) return current;
          if (next.length === 0) return null;
          // Activate the neighbour (prefer the previous tab).
          return next[Math.max(0, idx - 1)];
        });
        return next;
      });
    },
    [],
  );

  // Ctrl+P / Cmd+P opens the quick-open command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <VscRobot className="text-blue-400 text-xl" />
        <h1 className="text-sm font-bold tracking-wide">AI CODER</h1>
        <span className="text-xs text-gray-500 ml-2">AI-Powered Coding Assistant</span>
        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-auto text-xs text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-2 py-0.5"
          title="Quick open (Ctrl+P)"
        >
          Quick Open <span className="text-gray-600">Ctrl+P</span>
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[380px] flex-shrink-0 border-r border-gray-700">
          <ChatPanel onFileChanged={handleFileChanged} />
        </div>

        {/* Center: Sidebar (files/search/git) + Editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar
              onSelectFile={openFile}
              selectedFile={activeFile ?? undefined}
              refreshKey={refreshKey}
              onTreeChanged={handleFileChanged}
            />
          </div>

          {/* Editor + Terminal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Code editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                openTabs={openTabs}
                activeFile={activeFile}
                onSelectTab={setActiveFile}
                onCloseTab={closeTab}
              />
            </div>
            {/* Terminal */}
            <div className="h-[200px] flex-shrink-0 border-t border-gray-700">
              <Terminal />
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        refreshKey={refreshKey}
        onClose={() => setPaletteOpen(false)}
        onSelect={(path) => {
          openFile(path);
          setPaletteOpen(false);
        }}
      />
    </div>
  );
}
