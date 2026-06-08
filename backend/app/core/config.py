from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "AI Coder"
    debug: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]

    # Workspace
    workspace_dir: str = ""

    # Executor
    command_timeout: int = 30
    command_blacklist: list[str] = ["rm -rf /", "mkfs", "dd ", ":(){ ", "fork bomb"]

    # AI Service
    ai_provider: str = "mock"
    openai_api_key: str = ""

    model_config = {"env_prefix": "AI_CODER_", "env_file": ".env"}


@lru_cache
def get_settings() -> Settings:
    import os
    import tempfile

    s = Settings()
    if not s.workspace_dir:
        s.workspace_dir = os.path.join(tempfile.gettempdir(), "ai-coder-workspace")
    return s
