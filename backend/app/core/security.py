from pathlib import Path

from fastapi import HTTPException


def validate_path(workspace_dir: str, user_path: str) -> str:
    """Validate that the path does not escape the workspace. Returns the safe absolute path."""
    workspace = Path(workspace_dir).resolve()
    target = (workspace / user_path.lstrip("/")).resolve()
    if not str(target).startswith(str(workspace)):
        raise HTTPException(status_code=403, detail="Path traversal detected")
    return str(target)


def validate_command(command: str, blacklist: list[str]) -> None:
    """Check whether the command is blocked by the blacklist."""
    cmd_lower = command.lower().strip()
    for pattern in blacklist:
        if pattern in cmd_lower:
            raise HTTPException(
                status_code=403, detail=f"Command blocked for safety: contains '{pattern}'"
            )
