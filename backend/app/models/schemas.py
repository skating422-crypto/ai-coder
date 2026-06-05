from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    role: str
    content: str
    files_changed: list[str] = []


class FileNode(BaseModel):
    name: str
    path: str
    is_dir: bool
    children: list["FileNode"] = []


class FileContent(BaseModel):
    path: str
    content: str
    language: str = ""


class FileWriteRequest(BaseModel):
    path: str
    content: str


class ExecuteRequest(BaseModel):
    command: str
    cwd: str = "/"


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int


class CreateNodeRequest(BaseModel):
    path: str
    is_dir: bool = False


class RenameRequest(BaseModel):
    path: str
    new_path: str


class DeleteRequest(BaseModel):
    path: str


class SearchMatch(BaseModel):
    path: str
    line: int
    text: str


class SearchResponse(BaseModel):
    query: str
    matches: list[SearchMatch] = []
    truncated: bool = False


class GitStatusEntry(BaseModel):
    path: str
    status: str  # e.g. "M", "A", "D", "??"


class GitStatusResponse(BaseModel):
    initialized: bool
    branch: str = ""
    entries: list[GitStatusEntry] = []


class GitDiffResponse(BaseModel):
    path: str
    diff: str


class GitCommitRequest(BaseModel):
    message: str


class GitCommitResponse(BaseModel):
    committed: bool
    detail: str = ""
