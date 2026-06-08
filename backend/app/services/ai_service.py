"""Mock AI service that simulates an AI coding assistant."""

import logging
import random

from app.models.schemas import ChatMessage

logger = logging.getLogger("ai_coder.ai_service")

# Predefined responses for different types of requests
CODE_RESPONSES = {
    "hello": {
        "content": "Hello! I'm AI Coder, your AI programming assistant. I can help you with:\n\n"
        "- **Writing code** — Tell me what you want to build\n"
        "- **Debugging** — Paste your code and describe the issue\n"
        "- **Explaining code** — I'll break down how it works\n"
        "- **File management** — I can create and edit project files\n\n"
        "What would you like to work on?",
        "files_changed": [],
    },
    "python": {
        "content": "I've created a Python script for you. Here's what it does:\n\n"
        '```python\ndef greet(name: str) -> str:\n    """Generate a greeting message."""\n'
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
        "```\n\n"
        "I've saved this to `main.py`. You can run it in the terminal with `python main.py`.",
        "files_changed": ["main.py"],
    },
    "react": {
        "content": "I've created a React component for you:\n\n"
        "```tsx\nimport { useState } from 'react';\n\n"
        "interface CounterProps {\n  initialValue?: number;\n}\n\n"
        "export function Counter({ initialValue = 0 }: CounterProps) {\n"
        "  const [count, setCount] = useState(initialValue);\n\n"
        "  return (\n"
        '    <div className="flex items-center gap-4 p-4">\n'
        "      <button\n"
        "        onClick={() => setCount(c => c - 1)}\n"
        '        className="px-3 py-1 bg-red-500 text-white rounded"\n'
        "      >\n        -\n      </button>\n"
        '      <span className="text-2xl font-bold">{count}</span>\n'
        "      <button\n"
        "        onClick={() => setCount(c => c + 1)}\n"
        '        className="px-3 py-1 bg-green-500 text-white rounded"\n'
        "      >\n        +\n      </button>\n"
        "    </div>\n  );\n}\n```\n\n"
        "I've saved this to `Counter.tsx`.",
        "files_changed": ["Counter.tsx"],
    },
    "api": {
        "content": "Here's a REST API endpoint:\n\n"
        "```python\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\n"
        "app = FastAPI()\n\n"
        "class Item(BaseModel):\n    name: str\n    price: float\n"
        '    description: str = ""\n\n'
        "items: dict[int, Item] = {}\n"
        "next_id = 1\n\n\n"
        '@app.post("/items", status_code=201)\n'
        "def create_item(item: Item):\n"
        "    global next_id\n"
        "    items[next_id] = item\n"
        '    result = {"id": next_id, **item.model_dump()}\n'
        "    next_id += 1\n"
        "    return result\n\n\n"
        '@app.get("/items/{item_id}")\n'
        "def get_item(item_id: int):\n"
        "    if item_id not in items:\n"
        '        raise HTTPException(404, "Item not found")\n'
        '    return {"id": item_id, **items[item_id].model_dump()}\n```\n\n'
        "I've saved this to `api.py`. Run with `uvicorn api:app --reload`.",
        "files_changed": ["api.py"],
    },
}

FALLBACK_RESPONSES = [
    "I understand you want to {task}. Let me work on that for you.\n\n"
    "I've analyzed your request and here's my approach:\n"
    "1. First, I'll set up the project structure\n"
    "2. Then implement the core logic\n"
    "3. Finally, add error handling and tests\n\n"
    "Would you like me to proceed with this plan?",
    "Great question! Here's how I'd approach this:\n\n"
    "```python\n# TODO: Implement {task}\n"
    "# This is a placeholder — in a real implementation,\n"
    "# I would generate actual code based on your request.\n```\n\n"
    "Want me to elaborate on any part of this?",
    "I'll help you with that! Let me think about the best approach...\n\n"
    "Based on your request, I recommend:\n"
    "- Using a modular architecture for maintainability\n"
    "- Adding type hints for better code quality\n"
    "- Including unit tests from the start\n\n"
    "Shall I start implementing?",
]


def detect_intent(message: str) -> str:
    """Detect the user's intent from their message."""
    msg = message.lower()
    if any(w in msg for w in ["hello", "hi", "hey", "你好", "help"]):
        return "hello"
    if any(w in msg for w in ["react", "component", "tsx", "jsx", "前端"]):
        return "react"
    if any(w in msg for w in ["api", "endpoint", "rest", "接口"]):
        return "api"
    if any(w in msg for w in ["python", "script", "函数", "function"]):
        return "python"
    return "fallback"


def generate_response(message: str, history: list[ChatMessage]) -> dict:
    """Generate a mock AI response based on the user's message."""
    intent = detect_intent(message)
    logger.info("Generating response for intent=%s (history_len=%d)", intent, len(history))

    if intent in CODE_RESPONSES:
        resp = CODE_RESPONSES[intent]
        return {
            "role": "assistant",
            "content": resp["content"],
            "files_changed": resp["files_changed"],
        }

    # Use a fallback response
    template = random.choice(FALLBACK_RESPONSES)
    task = message[:50] if len(message) > 50 else message
    return {
        "role": "assistant",
        "content": template.replace("{task}", task),
        "files_changed": [],
    }
