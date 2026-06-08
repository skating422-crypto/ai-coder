from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import GlobalExceptionMiddleware
from app.core.logging import setup_logging
from app.routers import chat, executor, files

settings = get_settings()
setup_logging(settings.debug)

app = FastAPI(
    title="AI Coder",
    description="AI-powered coding assistant API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GlobalExceptionMiddleware)

app.include_router(chat.router)
app.include_router(files.router)
app.include_router(executor.router)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
