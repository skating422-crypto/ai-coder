import os

from fastapi import APIRouter, HTTPException

from app.models.schemas import FileContent, FileNode, FileWriteRequest
from app.services.executor_service import get_workspace_dir

router = APIRouter(prefix="/api/files", tags=["files"])

LANGUAGE_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".jsx": "javascriptreact",
    ".json": "json",
    ".md": "markdown",
    ".html": "html",
    ".css": "css",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".sh": "shellscript",
    ".rs": "rust",
    ".go": "go",
}


def build_file_tree(root: str, rel_prefix: str = "") -> list[FileNode]:
    """Recursively build a file tree from the workspace directory."""
    nodes: list[FileNode] = []
    try:
        entries = sorted(os.listdir(root))
    except PermissionError:
        return nodes

    dirs = []
    files = []
    for entry in entries:
        full = os.path.join(root, entry)
        if entry.startswith("."):
            continue
        if os.path.isdir(full):
            dirs.append(entry)
        else:
            files.append(entry)

    for d in dirs:
        rel = os.path.join(rel_prefix, d) if rel_prefix else d
        children = build_file_tree(os.path.join(root, d), rel)
        nodes.append(FileNode(name=d, path=rel, is_dir=True, children=children))

    for f in files:
        rel = os.path.join(rel_prefix, f) if rel_prefix else f
        nodes.append(FileNode(name=f, path=rel, is_dir=False))

    return nodes


@router.get("/tree", response_model=list[FileNode])
async def get_file_tree() -> list[FileNode]:
    """Get the project file tree."""
    workspace = get_workspace_dir()
    return build_file_tree(workspace)


@router.get("/content", response_model=FileContent)
async def get_file_content(path: str) -> FileContent:
    """Read file content by path."""
    workspace = get_workspace_dir()
    full_path = os.path.join(workspace, path.lstrip("/"))

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail=f"File not found: {path}")

    try:
        with open(full_path) as f:
            content = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    ext = os.path.splitext(path)[1]
    language = LANGUAGE_MAP.get(ext, "plaintext")

    return FileContent(path=path, content=content, language=language)


@router.post("/write")
async def write_file(request: FileWriteRequest) -> dict:
    """Write content to a file."""
    workspace = get_workspace_dir()
    full_path = os.path.join(workspace, request.path.lstrip("/"))

    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    try:
        with open(full_path, "w") as f:
            f.write(request.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "path": request.path}
