import { useState, useEffect, useCallback } from "react";
import { VscRefresh, VscGitCommit, VscSourceControl } from "react-icons/vsc";
import type { GitStatus } from "../types";
import {
  getGitStatus,
  gitInit,
  gitCommit,
  getGitDiff,
} from "../services/api";

interface GitPanelProps {
  refreshKey?: number;
  onChanged?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  M: "modified",
  A: "added",
  D: "deleted",
  R: "renamed",
  "??": "untracked",
};

export default function GitPanel({ refreshKey, onChanged }: GitPanelProps) {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [diff, setDiff] = useState<{ path: string; text: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getGitStatus());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const handleInit = async () => {
    setBusy(true);
    try {
      setStatus(await gitInit());
      setInfo("Repository initialized");
    } finally {
      setBusy(false);
    }
  };

  const handleCommit = async () => {
    const msg = message.trim();
    if (!msg) return;
    setBusy(true);
    try {
      const res = await gitCommit(msg);
      setInfo(res.committed ? "Committed successfully" : res.detail);
      if (res.committed) {
        setMessage("");
        setDiff(null);
        await refresh();
        onChanged?.();
      }
    } finally {
      setBusy(false);
    }
  };

  const showDiff = async (path: string) => {
    if (diff?.path === path) {
      setDiff(null);
      return;
    }
    const res = await getGitDiff(path);
    setDiff({ path, text: res.diff || "(no diff available)" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Source Control
        </span>
        <button
          onClick={refresh}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <VscRefresh className="text-sm" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
        ) : !status?.initialized ? (
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <VscSourceControl />
              <span>No Git repository in this workspace.</span>
            </div>
            <button
              onClick={handleInit}
              disabled={busy}
              className="w-full px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded transition-colors"
            >
              Initialize Repository
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-gray-400">
              <VscSourceControl className="text-green-400" />
              <span className="font-mono">{status.branch}</span>
            </div>

            <div className="space-y-1">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommit()}
                placeholder="Commit message"
                className="w-full bg-gray-950 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
              <button
                onClick={handleCommit}
                disabled={busy || !message.trim() || status.entries.length === 0}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
              >
                <VscGitCommit />
                Commit All ({status.entries.length})
              </button>
            </div>

            {info && (
              <div className="px-1 text-[11px] text-gray-500">{info}</div>
            )}

            <div className="pt-1">
              <div className="px-1 text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                Changes
              </div>
              {status.entries.length === 0 ? (
                <div className="px-1 text-[11px] text-gray-600">
                  No changes
                </div>
              ) : (
                status.entries.map((e) => (
                  <div key={e.path}>
                    <button
                      onClick={() => showDiff(e.path)}
                      className="w-full flex items-center justify-between gap-2 px-1 py-1 text-xs hover:bg-gray-700 rounded transition-colors"
                    >
                      <span className="truncate text-gray-300">{e.path}</span>
                      <span
                        className="text-[10px] flex-shrink-0 text-yellow-400"
                        title={STATUS_LABELS[e.status] ?? e.status}
                      >
                        {e.status}
                      </span>
                    </button>
                    {diff?.path === e.path && (
                      <pre className="text-[10px] font-mono bg-gray-950 text-gray-300 p-2 rounded my-1 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre">
                        {diff.text}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
