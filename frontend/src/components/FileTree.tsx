import { useState, useEffect } from "react";
import { VscFolder, VscFolderOpened, VscFile, VscRefresh } from "react-icons/vsc";
import type { FileNode } from "../types";
import { getFileTree } from "../services/api";

interface FileTreeProps {
  onSelectFile: (path: string) => void;
  selectedFile?: string;
  refreshKey?: number;
}

function TreeNode({
  node,
  depth,
  onSelect,
  selectedFile,
}: {
  node: FileNode;
  depth: number;
  onSelect: (path: string) => void;
  selectedFile?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  const handleClick = () => {
    if (node.is_dir) {
      setExpanded(!expanded);
    } else {
      onSelect(node.path);
    }
  };

  const isSelected = node.path === selectedFile;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm hover:bg-gray-700 transition-colors ${
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
        <span className="truncate">{node.name}</span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ onSelectFile, selectedFile, refreshKey }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Explorer
        </span>
        <button
          onClick={fetchTree}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <VscRefresh className="text-sm" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
        ) : tree.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500">No files</div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              onSelect={onSelectFile}
              selectedFile={selectedFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
