import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscSave, VscEdit } from "react-icons/vsc";
import type { FileContent } from "../types";
import { getFileContent, writeFile } from "../services/api";

interface CodeEditorProps {
  filePath: string | null;
}

export default function CodeEditor({ filePath }: CodeEditorProps) {
  const [file, setFile] = useState<FileContent | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setFile(null);
      return;
    }
    setLoading(true);
    setEditing(false);
    getFileContent(filePath)
      .then((data) => {
        setFile(data);
        setEditContent(data.content);
      })
      .catch(() => {
        setFile(null);
      })
      .finally(() => setLoading(false));
  }, [filePath]);

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await writeFile(file.path, editContent);
      setFile({ ...file, content: editContent });
      setEditing(false);
    } catch {
      console.error("Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to view its contents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        Loading...
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-400">
        Failed to load file
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{file.path}</span>
          <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
            {file.language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {editing ? (
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
              onClick={() => setEditing(true)}
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
        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
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
