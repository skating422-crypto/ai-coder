import type { ChatMessage, ExecuteResult, FileContent, FileNode } from "../types";

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
