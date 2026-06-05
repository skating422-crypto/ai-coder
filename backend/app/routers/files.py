import os
import shutil

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CreateNodeRequest,
    DeleteRequest,
    FileContent,
    FileNode,
    FileWriteRequest,
    RenameRequest,
    SearchMatch,
    SearchResponse,
)
from app.services.executor_service import get_workspace_dir, resolve_in_workspace

router = APIRouter(prefix="/api/files", tags=["files"])

MAX_SEARCH_MATCHES = 200
MAX_SEARCH_FILE_BYTES = 1_000_000


def _safe_path(path: str) -> str:
    """Resolve a path inside the workspace or raise HTTP 400."""
    try:
        return resolve_in_workspace(path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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
    full_path = _safe_path(path)

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
    full_path = _safe_path(request.path)

    parent = os.path.dirname(full_path)
    if parent:
        os.makedirs(parent, exist_ok=True)

    try:
        with open(full_path, "w") as f:
            f.write(request.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "path": request.path}


@router.post("/create")
async def create_node(request: CreateNodeRequest) -> dict:
    """Create a new empty file or directory."""
    full_path = _safe_path(request.path)

    if os.path.exists(full_path):
        raise HTTPException(status_code=409, detail=f"Already exists: {request.path}")

    try:
        if request.is_dir:
            os.makedirs(full_path, exist_ok=False)
        else:
            parent = os.path.dirname(full_path)
            if parent:
                os.makedirs(parent, exist_ok=True)
            with open(full_path, "w") as f:
                f.write("")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "path": request.path, "is_dir": request.is_dir}


@router.post("/rename")
async def rename_node(request: RenameRequest) -> dict:
    """Rename or move a file or directory."""
    src = _safe_path(request.path)
    dst = _safe_path(request.new_path)

    if not os.path.exists(src):
        raise HTTPException(status_code=404, detail=f"Not found: {request.path}")
    if os.path.exists(dst):
        raise HTTPException(status_code=409, detail=f"Already exists: {request.new_path}")

    try:
        parent = os.path.dirname(dst)
        if parent:
            os.makedirs(parent, exist_ok=True)
        os.rename(src, dst)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "path": request.new_path}


@router.post("/delete")
async def delete_node(request: DeleteRequest) -> dict:
    """Delete a file or directory (recursively)."""
    full_path = _safe_path(request.path)

    if full_path == os.path.realpath(get_workspace_dir()):
        raise HTTPException(status_code=400, detail="Cannot delete the workspace root")
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"Not found: {request.path}")

    try:
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "path": request.path}


@router.get("/search", response_model=SearchResponse)
async def search_files(q: str, case_sensitive: bool = False) -> SearchResponse:
    """Search file contents across the workspace for a substring."""
    query = q.strip()
    if not query:
        return SearchResponse(query=q, matches=[], truncated=False)

    workspace = os.path.realpath(get_workspace_dir())
    needle = query if case_sensitive else query.lower()
    matches: list[SearchMatch] = []
    truncated = False

    for root, dirs, files in os.walk(workspace):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for name in sorted(files):
            if name.startswith("."):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, workspace)
            try:
                if os.path.getsize(full) > MAX_SEARCH_FILE_BYTES:
                    continue
                with open(full, encoding="utf-8", errors="strict") as fh:
                    lines = fh.readlines()
            except (OSError, UnicodeDecodeError):
                continue

            for lineno, line in enumerate(lines, start=1):
                haystack = line if case_sensitive else line.lower()
                if needle in haystack:
                    matches.append(
                        SearchMatch(path=rel, line=lineno, text=line.rstrip("\n")[:300])
                    )
                    if len(matches) >= MAX_SEARCH_MATCHES:
                        truncated = True
                        break
            if truncated:
                break
        if truncated:
            break

    return SearchResponse(query=query, matches=matches, truncated=truncated)
