import { useState, useCallback } from "react";
import { VscRobot } from "react-icons/vsc";
import ChatPanel from "./ChatPanel";
import FileTree from "./FileTree";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";

export default function Layout() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <VscRobot className="text-blue-400 text-xl" />
        <h1 className="text-sm font-bold tracking-wide">AI CODER</h1>
        <span className="text-xs text-gray-500 ml-2">AI-Powered Coding Assistant</span>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[380px] flex-shrink-0 border-r border-gray-700">
          <ChatPanel onFileChanged={handleFileChanged} />
        </div>

        {/* Center: File tree + Editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* File tree */}
          <div className="w-[200px] flex-shrink-0 border-r border-gray-700">
            <FileTree
              onSelectFile={setSelectedFile}
              selectedFile={selectedFile ?? undefined}
              refreshKey={refreshKey}
            />
          </div>

          {/* Editor + Terminal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Code editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor filePath={selectedFile} />
            </div>
            {/* Terminal */}
            <div className="h-[200px] flex-shrink-0 border-t border-gray-700">
              <Terminal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
