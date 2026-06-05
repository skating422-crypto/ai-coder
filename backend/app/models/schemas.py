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
