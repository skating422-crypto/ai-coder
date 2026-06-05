import type {
  ChatMessage,
  ExecuteResult,
  FileContent,
  FileNode,
  GitCommitResult,
  GitDiff,
  GitStatus,
  SearchResponse,
} from "../types";

const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function sendMessage(
  message: string,
  history: ChatMessage[],
): Promise<ChatMessage> {
  return request<ChatMessage>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function getFileTree(): Promise<FileNode[]> {
  return request<FileNode[]>("/files/tree");
}

export async function getFileContent(path: string): Promise<FileContent> {
  return request<FileContent>(`/files/content?path=${encodeURIComponent(path)}`);
}

export async function writeFile(path: string, content: string): Promise<void> {
  await request("/files/write", {
    method: "POST",
    body: JSON.stringify({ path, content }),
  });
}

export async function executeCommand(
  command: string,
  cwd: string = "/",
): Promise<ExecuteResult> {
  return request<ExecuteResult>("/execute", {
    method: "POST",
    body: JSON.stringify({ command, cwd }),
  });
}

export async function createNode(path: string, isDir: boolean): Promise<void> {
  await request("/files/create", {
    method: "POST",
    body: JSON.stringify({ path, is_dir: isDir }),
  });
}

export async function renameNode(path: string, newPath: string): Promise<void> {
  await request("/files/rename", {
    method: "POST",
    body: JSON.stringify({ path, new_path: newPath }),
  });
}

export async function deleteNode(path: string): Promise<void> {
  await request("/files/delete", {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}

export async function searchFiles(query: string): Promise<SearchResponse> {
  return request<SearchResponse>(
    `/files/search?q=${encodeURIComponent(query)}`,
  );
}

export async function getGitStatus(): Promise<GitStatus> {
  return request<GitStatus>("/git/status");
}

export async function gitInit(): Promise<GitStatus> {
  return request<GitStatus>("/git/init", { method: "POST" });
}

export async function getGitDiff(path: string = ""): Promise<GitDiff> {
  return request<GitDiff>(`/git/diff?path=${encodeURIComponent(path)}`);
}

export async function gitCommit(message: string): Promise<GitCommitResult> {
  return request<GitCommitResult>("/git/commit", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (filesChanged: string[]) => void;
  onError: (error: Error) => void;
}

export async function streamMessage(
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`API error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        const data = JSON.parse(payload) as {
          type: string;
          content?: string;
          files_changed?: string[];
        };
        if (data.type === "chunk" && data.content) {
          callbacks.onChunk(data.content);
        } else if (data.type === "done") {
          callbacks.onDone(data.files_changed ?? []);
        }
      }
    }
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
