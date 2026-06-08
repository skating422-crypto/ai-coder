"""Service for executing commands in a sandboxed environment."""

import asyncio
import logging
import os

from app.core.config import get_settings
from app.core.security import validate_command, validate_path

logger = logging.getLogger("ai_coder.executor_service")

# Pre-populate workspace with sample files
SAMPLE_FILES = {
    "main.py": (
        'def greet(name: str) -> str:\n    """Generate a greeting message."""\n'
        '    return f"Hello, {name}! Welcome to AI Coder."\n\n\n'
        "def fibonacci(n: int) -> list[int]:\n"
        '    """Generate the first n Fibonacci numbers."""\n'
        "    if n <= 0:\n        return []\n"
        "    if n == 1:\n        return [0]\n"
        "    fib = [0, 1]\n"
        "    for _ in range(2, n):\n"
        "        fib.append(fib[-1] + fib[-2])\n"
        "    return fib\n\n\n"
        'if __name__ == "__main__":\n'
        '    print(greet("Developer"))\n'
        '    print(f"Fibonacci(10): {fibonacci(10)}")\n'
    ),
    "utils/helpers.py": (
        "import os\nimport json\nfrom pathlib import Path\n\n\n"
        "def read_json(path: str) -> dict:\n"
        '    """Read and parse a JSON file."""\n'
        "    with open(path) as f:\n"
        "        return json.load(f)\n\n\n"
        "def ensure_dir(path: str) -> Path:\n"
        '    """Create directory if it doesn\'t exist."""\n'
        "    p = Path(path)\n"
        "    p.mkdir(parents=True, exist_ok=True)\n"
        "    return p\n"
    ),
    "README.md": "# My Project\n\nA sample project created with AI Coder.\n",
}


def get_workspace_dir() -> str:
    return get_settings().workspace_dir


def init_workspace() -> None:
    """Initialize workspace with sample files."""
    workspace_dir = get_workspace_dir()
    os.makedirs(workspace_dir, exist_ok=True)
    for rel_path, content in SAMPLE_FILES.items():
        full_path = os.path.join(workspace_dir, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if not os.path.exists(full_path):
            with open(full_path, "w") as f:
                f.write(content)


init_workspace()


async def execute_command(command: str, cwd: str = "/") -> dict:
    """Execute a command and return stdout, stderr, exit_code."""
    settings = get_settings()
    validate_command(command, settings.command_blacklist)

    workspace_dir = settings.workspace_dir
    work_dir = validate_path(workspace_dir, cwd)
    if not os.path.isdir(work_dir):
        work_dir = workspace_dir

    logger.info("Executing command: %s (cwd=%s)", command, work_dir)

    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=work_dir,
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=settings.command_timeout
        )
        result = {
            "stdout": stdout.decode(errors="replace"),
            "stderr": stderr.decode(errors="replace"),
            "exit_code": proc.returncode or 0,
        }
        logger.info("Command finished with exit_code=%d", result["exit_code"])
        return result
    except TimeoutError:
        logger.error("Command timed out after %d seconds: %s", settings.command_timeout, command)
        proc.kill()
        await proc.wait()
        return {
            "stdout": "",
            "stderr": f"Command timed out after {settings.command_timeout} seconds",
            "exit_code": 124,
        }
    except Exception as e:
        logger.error("Command execution error: %s", e)
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": 1,
        }
