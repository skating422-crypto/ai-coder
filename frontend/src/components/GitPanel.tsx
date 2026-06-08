import { useState, useEffect, useCallback } from "react";
import { VscRefresh, VscGitCommit, VscSourceControl, VscHistory } from "react-icons/vsc";
import type { GitStatus, GitCommit } from "../types";
import {
  getGitStatus,
  gitInit,
  gitCommit,
  getGitDiff,
  getGitLog,
  getCommitDiff,
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
  const [tab, setTab] = useState<"changes" | "history">("changes");
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [commitDiff, setCommitDiff] = useState<{ ref: string; text: string } | null>(
    null,
  );

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

  const loadLog = useCallback(async () => {
    try {
      const res = await getGitLog();
      setCommits(res.commits);
    } catch {
      setCommits([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    if (tab === "history" && status?.initialized) {
      loadLog();
    }
  }, [tab, status?.initialized, refreshKey, loadLog]);

  const showCommit = async (ref: string) => {
    if (commitDiff?.ref === ref) {
      setCommitDiff(null);
      return;
    }
    const res = await getCommitDiff(ref);
    setCommitDiff({ ref, text: res.diff || "(no diff available)" });
  };

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
        await loadLog();
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

            {/* Changes / History tab switcher */}
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setTab("changes")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  tab === "changes"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <VscGitCommit /> Changes
              </button>
              <button
                onClick={() => setTab("history")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  tab === "history"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <VscHistory /> History
              </button>
            </div>

            {tab === "changes" ? (
              <>
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
              </>
            ) : (
              <div className="pt-1">
                <div className="px-1 text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  History
                </div>
                {commits.length === 0 ? (
                  <div className="px-1 text-[11px] text-gray-600">
                    No commits yet
                  </div>
                ) : (
                  commits.map((c) => (
                    <div key={c.hash}>
                      <button
                        onClick={() => showCommit(c.hash)}
                        className="w-full flex flex-col items-start gap-0.5 px-1 py-1 text-xs hover:bg-gray-700 rounded transition-colors text-left"
                      >
                        <span className="truncate w-full text-gray-200">
                          {c.subject}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          <span className="font-mono text-blue-400">
                            {c.short_hash}
                          </span>{" "}
                          · {c.author} · {c.date}
                        </span>
                      </button>
                      {commitDiff?.ref === c.hash && (
                        <pre className="text-[10px] font-mono bg-gray-950 text-gray-300 p-2 rounded my-1 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre">
                          {commitDiff.text}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
