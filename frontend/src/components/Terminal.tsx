import { useState, useRef, useEffect } from "react";
import { VscTerminal, VscClearAll } from "react-icons/vsc";
import { executeCommand } from "../services/api";

interface TerminalLine {
  type: "input" | "stdout" | "stderr" | "info";
  content: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "info", content: "AI Coder Terminal — Type commands to execute in the workspace." },
  ]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleRun = async () => {
    const cmd = input.trim();
    if (!cmd || running) return;

    setLines((prev) => [...prev, { type: "input", content: `$ ${cmd}` }]);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput("");
    setRunning(true);

    try {
      const result = await executeCommand(cmd);
      if (result.stdout) {
        setLines((prev) => [...prev, { type: "stdout", content: result.stdout }]);
      }
      if (result.stderr) {
        setLines((prev) => [...prev, { type: "stderr", content: result.stderr }]);
      }
      if (result.exit_code !== 0) {
        setLines((prev) => [
          ...prev,
          { type: "info", content: `Process exited with code ${result.exit_code}` },
        ]);
      }
    } catch {
      setLines((prev) => [
        ...prev,
        { type: "stderr", content: "Failed to execute command" },
      ]);
    } finally {
      setRunning(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRun();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <VscTerminal className="text-green-400" />
          <span className="text-xs font-semibold text-gray-400">TERMINAL</span>
        </div>
        <button
          onClick={() =>
            setLines([{ type: "info", content: "Terminal cleared." }])
          }
          className="text-gray-400 hover:text-white transition-colors"
          title="Clear"
        >
          <VscClearAll className="text-sm" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 font-mono text-xs"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap mb-0.5 ${
              line.type === "input"
                ? "text-green-400"
                : line.type === "stderr"
                  ? "text-red-400"
                  : line.type === "info"
                    ? "text-gray-500"
                    : "text-gray-300"
            }`}
          >
            {line.content}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-100 focus:outline-none"
            placeholder={running ? "Running..." : "Type a command..."}
            disabled={running}
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
