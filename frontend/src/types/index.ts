export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  files_changed?: string[];
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface SearchMatch {
  path: string;
  line: number;
  text: string;
}

export interface SearchResponse {
  query: string;
  matches: SearchMatch[];
  truncated: boolean;
}

export interface GitStatusEntry {
  path: string;
  status: string;
}

export interface GitStatus {
  initialized: boolean;
  branch: string;
  entries: GitStatusEntry[];
}

export interface GitDiff {
  path: string;
  diff: string;
}

export interface GitCommitResult {
  committed: boolean;
  detail: string;
}

export interface GitCommit {
  hash: string;
  short_hash: string;
  author: string;
  date: string;
  subject: string;
}

export interface GitLog {
  initialized: boolean;
  commits: GitCommit[];
}

export interface GitShow {
  ref: string;
  diff: string;
}
