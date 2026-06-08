import { useState, useEffect, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscSave, VscEdit, VscClose, VscFile } from "react-icons/vsc";
import type { FileContent } from "../types";
import { getFileContent, writeFile } from "../services/api";

interface CodeEditorProps {
  openTabs: string[];
  activeFile: string | null;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
}

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

export default function CodeEditor({
  openTabs,
  activeFile,
  onSelectTab,
  onCloseTab,
}: CodeEditorProps) {
  const [cache, setCache] = useState<Record<string, FileContent>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load the active file's content if we haven't cached it yet.
  useEffect(() => {
    if (!activeFile || cache[activeFile]) return;
    setLoading(true);
    getFileContent(activeFile)
      .then((data) => {
        setCache((c) => ({ ...c, [activeFile]: data }));
        setDrafts((d) => ({ ...d, [activeFile]: data.content }));
      })
      .catch(() => {
        setCache((c) => ({
          ...c,
          [activeFile]: { path: activeFile, content: "", language: "" },
        }));
      })
      .finally(() => setLoading(false));
  }, [activeFile, cache]);

  const file = activeFile ? cache[activeFile] : null;
  const isEditing = activeFile ? !!editing[activeFile] : false;
  const draft = activeFile ? drafts[activeFile] ?? "" : "";
  const dirty = !!file && isEditing && draft !== file.content;

  const handleSave = useCallback(async () => {
    if (!activeFile || !file) return;
    setSaving(true);
    try {
      const content = drafts[activeFile] ?? "";
      await writeFile(activeFile, content);
      setCache((c) => ({ ...c, [activeFile]: { ...file, content } }));
      setEditing((e) => ({ ...e, [activeFile]: false }));
    } catch {
      console.error("Failed to save file");
    } finally {
      setSaving(false);
    }
  }, [activeFile, file, drafts]);

  // Ctrl+S / Cmd+S saves the active file when editing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (activeFile && editing[activeFile]) {
          e.preventDefault();
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeFile, editing, handleSave]);

  const startEditing = () => {
    if (!activeFile || !file) return;
    setDrafts((d) => ({ ...d, [activeFile]: d[activeFile] ?? file.content }));
    setEditing((e) => ({ ...e, [activeFile]: true }));
  };

  if (openTabs.length === 0 || !activeFile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file open</p>
          <p className="text-sm">
            Select a file from the explorer, or press Ctrl+P to quick-open
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Tab bar */}
      <div className="flex items-stretch bg-gray-950 border-b border-gray-700 overflow-x-auto">
        {openTabs.map((path) => {
          const active = path === activeFile;
          const tabDirty = !!editing[path] && drafts[path] !== cache[path]?.content;
          return (
            <div
              key={path}
              onClick={() => onSelectTab(path)}
              title={path}
              className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-gray-700 whitespace-nowrap ${
                active
                  ? "bg-gray-900 text-gray-100"
                  : "bg-gray-950 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <VscFile className="flex-shrink-0 text-gray-500" />
              <span>{basename(path)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(path);
                }}
                aria-label={`Close ${basename(path)}`}
                className="ml-1 rounded hover:bg-gray-700 p-0.5"
              >
                {tabDirty ? (
                  <span className="block w-2 h-2 rounded-full bg-gray-300 group-hover:hidden" />
                ) : null}
                <VscClose
                  className={tabDirty ? "hidden group-hover:block" : "block"}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Header / actions */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{activeFile}</span>
          {file?.language && (
            <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
              {file.language}
            </span>
          )}
          {dirty && <span className="text-[10px] text-yellow-400">● unsaved</span>}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              <VscSave />
              {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <VscEdit />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading || !file ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        ) : isEditing ? (
          <textarea
            value={draft}
            onChange={(e) =>
              setDrafts((d) => ({ ...d, [activeFile]: e.target.value }))
            }
            className="w-full h-full bg-gray-950 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={file.language === "typescriptreact" ? "tsx" : file.language}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: "16px",
              background: "#0d1117",
              fontSize: "13px",
              minHeight: "100%",
            }}
          >
            {file.content}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
