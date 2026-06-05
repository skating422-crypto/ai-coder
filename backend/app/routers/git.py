from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    GitCommitRequest,
    GitCommitResponse,
    GitDiffResponse,
    GitStatusEntry,
    GitStatusResponse,
)
from app.services import git_service

router = APIRouter(prefix="/api/git", tags=["git"])


@router.get("/status", response_model=GitStatusResponse)
async def status() -> GitStatusResponse:
    """Get the workspace git status."""
    data = await git_service.get_status()
    return GitStatusResponse(
        initialized=data["initialized"],
        branch=data["branch"],
        entries=[GitStatusEntry(**e) for e in data["entries"]],
    )


@router.post("/init", response_model=GitStatusResponse)
async def init() -> GitStatusResponse:
    """Initialize a git repository in the workspace."""
    ok, detail = await git_service.init_repo()
    if not ok:
        raise HTTPException(status_code=500, detail=detail)
    data = await git_service.get_status()
    return GitStatusResponse(
        initialized=data["initialized"],
        branch=data["branch"],
        entries=[GitStatusEntry(**e) for e in data["entries"]],
    )


@router.get("/diff", response_model=GitDiffResponse)
async def diff(path: str = "") -> GitDiffResponse:
    """Get the diff for the workspace or a single file."""
    text = await git_service.get_diff(path)
    return GitDiffResponse(path=path, diff=text)


@router.post("/commit", response_model=GitCommitResponse)
async def commit(request: GitCommitRequest) -> GitCommitResponse:
    """Stage all changes and commit them."""
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Commit message is required")
    ok, detail = await git_service.commit_all(message)
    return GitCommitResponse(committed=ok, detail=detail)
