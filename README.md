# AI Coder

An AI-powered coding assistant — a web-based IDE with chat, file management, code editing, and terminal capabilities.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Python FastAPI
- **AI**: Pluggable LLM integration (mock by default, OpenAI-ready)

## Features

- 💬 Chat with AI to generate and edit code
- 🔄 Real-time streaming responses (Server-Sent Events)
- 📁 Virtual file system with project tree
- 🗂️ File management — create, rename, and delete files & folders
- 🔍 Global workspace search across file contents
- 🌿 Git integration — init, status, diff, commit, and commit history in the workspace
- 📑 Multi-tab editor — open several files at once, with `Ctrl+S` to save
- ⚡ Command palette — `Ctrl+P` to fuzzy-find and quick-open files
- ✏️ Code editor with syntax highlighting
- 🖥️ Terminal emulator for command execution

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend at `http://localhost:8000`.

## Project Structure

```
ai-coder/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic
│   │   └── models/          # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/chat` — non-streaming chat response
- `POST /api/chat/stream` — streaming chat response (SSE)
- `GET  /api/files/tree` — workspace file tree
- `GET  /api/files/content` — read a file
- `POST /api/files/write` — write a file
- `POST /api/files/create` — create a file or folder
- `POST /api/files/rename` — rename/move a file or folder
- `POST /api/files/delete` — delete a file or folder
- `GET  /api/files/search` — search file contents
- `GET  /api/git/status` — workspace git status
- `POST /api/git/init` — initialize a git repo
- `GET  /api/git/diff` — diff for the workspace or a file
- `GET  /api/git/log` — recent commit history
- `GET  /api/git/show` — patch for a single commit
- `POST /api/git/commit` — stage all and commit
- `POST /api/execute` — run a shell command

## Future Enhancements

- OpenAI / Anthropic API integration
- Docker sandbox for safe code execution
- Multi-file project support
- Collaborative editing
