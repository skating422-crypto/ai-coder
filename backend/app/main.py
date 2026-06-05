from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat, executor, files, git

app = FastAPI(
    title="AI Coder",
    description="AI-powered coding assistant API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(files.router)
app.include_router(executor.router)
app.include_router(git.router)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
