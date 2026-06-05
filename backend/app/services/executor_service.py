"""Service for executing commands in a sandboxed environment."""

import asyncio
import os
import tempfile

# Workspace directory for user files
WORKSPACE_DIR = os.path.join(tempfile.gettempdir(), "ai-coder-workspace")
os.makedirs(WORKSPACE_DIR, exist_ok=True)

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


def init_workspace() -> None:
    """Initialize workspace with sample files."""
    for rel_path, content in SAMPLE_FILES.items():
        full_path = os.path.join(WORKSPACE_DIR, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if not os.path.exists(full_path):
            with open(full_path, "w") as f:
                f.write(content)


init_workspace()


async def execute_command(command: str, cwd: str = "/") -> dict:
    """Execute a command and return stdout, stderr, exit_code."""
    work_dir = os.path.join(WORKSPACE_DIR, cwd.lstrip("/"))
    if not os.path.isdir(work_dir):
        work_dir = WORKSPACE_DIR

    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=work_dir,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
        return {
            "stdout": stdout.decode(errors="replace"),
            "stderr": stderr.decode(errors="replace"),
            "exit_code": proc.returncode or 0,
        }
    except asyncio.TimeoutError:
        return {
            "stdout": "",
            "stderr": "Command timed out after 30 seconds",
            "exit_code": 124,
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": 1,
        }


def get_workspace_dir() -> str:
    return WORKSPACE_DIR
