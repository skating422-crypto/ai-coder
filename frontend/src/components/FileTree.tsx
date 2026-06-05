import { useState, useEffect } from "react";
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscRefresh,
  VscNewFile,
  VscNewFolder,
  VscEdit,
  VscTrash,
} from "react-icons/vsc";
import type { FileNode } from "../types";
import {
  getFileTree,
  createNode,
  renameNode,
  deleteNode,
} from "../services/api";

interface FileTreeProps {
  onSelectFile: (path: string) => void;
  selectedFile?: string;
  refreshKey?: number;
  onTreeChanged?: () => void;
}

function TreeNode({
  node,
  depth,
  onSelect,
  selectedFile,
  onRename,
  onDelete,
}: {
  node: FileNode;
  depth: number;
  onSelect: (path: string) => void;
  selectedFile?: string;
  onRename: (path: string, newPath: string) => void;
  onDelete: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(node.name);

  const handleClick = () => {
    if (renaming) return;
    if (node.is_dir) {
      setExpanded(!expanded);
    } else {
      onSelect(node.path);
    }
  };

  const submitRename = () => {
    const trimmed = draft.trim();
    setRenaming(false);
    if (!trimmed || trimmed === node.name) return;
    const parent = node.path.includes("/")
      ? node.path.slice(0, node.path.lastIndexOf("/") + 1)
      : "";
    onRename(node.path, parent + trimmed);
  };

  const isSelected = node.path === selectedFile;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`group flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm hover:bg-gray-700 transition-colors ${
          isSelected ? "bg-gray-700 text-blue-400" : "text-gray-300"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.is_dir ? (
          expanded ? (
            <VscFolderOpened className="text-yellow-400 flex-shrink-0" />
          ) : (
            <VscFolder className="text-yellow-400 flex-shrink-0" />
          )
        ) : (
          <VscFile className="text-gray-400 flex-shrink-0" />
        )}
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            onBlur={submitRename}
            className="flex-1 bg-gray-950 border border-blue-500 rounded px-1 text-xs text-gray-100 focus:outline-none"
          />
        ) : (
          <>
            <span className="truncate flex-1">{node.name}</span>
            <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
              <button
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  setDraft(node.name);
                  setRenaming(true);
                }}
                className="text-gray-400 hover:text-white"
              >
                <VscEdit className="text-xs" />
              </button>
              <button
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.path);
                }}
                className="text-gray-400 hover:text-red-400"
              >
                <VscTrash className="text-xs" />
              </button>
            </div>
          </>
        )}
      </div>
      {node.is_dir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedFile={selectedFile}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  onSelectFile,
  selectedFile,
  refreshKey,
  onTreeChanged,
}: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<null | { isDir: boolean }>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const fetchTree = async () => {
    setLoading(true);
    try {
      const data = await getFileTree();
      setTree(data);
    } catch {
      console.error("Failed to load file tree");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [refreshKey]);

  const refreshAll = async () => {
    await fetchTree();
    onTreeChanged?.();
  };

  const submitCreate = async () => {
    const path = draft.trim();
    const isDir = creating?.isDir ?? false;
    setCreating(null);
    setDraft("");
    if (!path) return;
    try {
      await createNode(path, isDir);
      setError("");
      await refreshAll();
      if (!isDir) onSelectFile(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  };

  const handleRename = async (path: string, newPath: string) => {
    try {
      await renameNode(path, newPath);
      setError("");
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rename failed");
    }
  };

  const handleDelete = async (path: string) => {
    if (!window.confirm(`Delete "${path}"?`)) return;
    try {
      await deleteNode(path);
      setError("");
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const startCreate = (isDir: boolean) => {
    setDraft("");
    setCreating({ isDir });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Explorer
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startCreate(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            <VscNewFile className="text-sm" />
          </button>
          <button
            onClick={() => startCreate(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="New Folder"
          >
            <VscNewFolder className="text-sm" />
          </button>
          <button
            onClick={fetchTree}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <VscRefresh className="text-sm" />
          </button>
        </div>
      </div>
      {error && (
        <div className="px-3 py-1.5 text-xs text-red-400 bg-red-950/40 border-b border-red-900">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-1">
        {creating && (
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{ paddingLeft: "8px" }}
          >
            {creating.isDir ? (
              <VscFolder className="text-yellow-400 flex-shrink-0" />
            ) : (
              <VscFile className="text-gray-400 flex-shrink-0" />
            )}
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitCreate();
                if (e.key === "Escape") {
                  setCreating(null);
                  setDraft("");
                }
              }}
              onBlur={submitCreate}
              placeholder={creating.isDir ? "folder name" : "file name"}
              className="flex-1 bg-gray-950 border border-blue-500 rounded px-1 text-xs text-gray-100 focus:outline-none placeholder-gray-600"
            />
          </div>
        )}
        {loading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
        ) : tree.length === 0 && !creating ? (
          <div className="px-3 py-2 text-sm text-gray-500">No files</div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              onSelect={onSelectFile}
              selectedFile={selectedFile}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
