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
