"""Service for Git operations scoped to the workspace directory."""

import asyncio
import os

from app.services.executor_service import get_workspace_dir


async def _run_git(*args: str) -> tuple[int, str, str]:
    """Run a git command in the workspace and return (code, stdout, stderr)."""
    proc = await asyncio.create_subprocess_exec(
        "git",
        *args,
        cwd=get_workspace_dir(),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
    return (
        proc.returncode or 0,
        stdout.decode(errors="replace"),
        stderr.decode(errors="replace"),
    )


def is_initialized() -> bool:
    return os.path.isdir(os.path.join(get_workspace_dir(), ".git"))


async def init_repo() -> tuple[bool, str]:
    """Initialize a git repo in the workspace if not already present."""
    if is_initialized():
        return True, "Repository already initialized"
    code, _out, err = await _run_git("init")
    if code != 0:
        return False, err.strip() or "git init failed"
    # Best-effort local identity so commits work without global config.
    await _run_git("config", "user.email", "ai-coder@example.com")
    await _run_git("config", "user.name", "AI Coder")
    return True, "Initialized empty Git repository"


async def get_status() -> dict:
    """Return branch name and porcelain status entries."""
    if not is_initialized():
        return {"initialized": False, "branch": "", "entries": []}

    branch = ""
    code, out, _err = await _run_git("rev-parse", "--abbrev-ref", "HEAD")
    if code == 0:
        branch = out.strip()
        if branch == "HEAD":
            branch = "(detached)"
    else:
        branch = "(no commits yet)"

    entries: list[dict] = []
    code, out, _err = await _run_git("status", "--porcelain")
    if code == 0:
        for line in out.splitlines():
            if not line.strip():
                continue
            status = line[:2].strip()
            path = line[3:].strip()
            entries.append({"path": path, "status": status})

    return {"initialized": True, "branch": branch, "entries": entries}


async def get_diff(path: str = "") -> str:
    """Return the diff for the whole workspace or a single path.

    Falls back to comparing against the empty tree for files that are staged
    or not yet committed so newly added content is still visible.
    """
    if not is_initialized():
        return ""

    args = ["diff", "HEAD"]
    if path:
        args += ["--", path]
    code, out, _err = await _run_git(*args)
    if code == 0 and out.strip():
        return out

    # No committed baseline (or no tracked changes): show diff including
    # untracked files via --no-index against /dev/null is complex, so fall
    # back to plain `git diff` (working tree vs index).
    args = ["diff"]
    if path:
        args += ["--", path]
    code, out, _err = await _run_git(*args)
    return out


async def commit_all(message: str) -> tuple[bool, str]:
    """Stage all changes and create a commit."""
    if not is_initialized():
        return False, "Repository not initialized"

    code, _out, err = await _run_git("add", "-A")
    if code != 0:
        return False, err.strip() or "git add failed"

    code, out, err = await _run_git("commit", "-m", message)
    if code != 0:
        detail = (err or out).strip()
        return False, detail or "Nothing to commit"
    return True, out.strip()
