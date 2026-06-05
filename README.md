# AI Coder

An AI-powered coding assistant — a web-based IDE with chat, file management, code editing, and terminal capabilities.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Python FastAPI
- **AI**: Pluggable LLM integration (mock by default, OpenAI-ready)

## Features

- 💬 Chat with AI to generate and edit code
- 📁 Virtual file system with project tree
- ✏️ Code editor with syntax highlighting
- 🖥️ Terminal emulator for command execution
- 🔄 Real-time streaming responses

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

## Future Enhancements

- OpenAI / Anthropic API integration
- Docker sandbox for safe code execution
- Git integration
- Multi-file project support
- Collaborative editing
