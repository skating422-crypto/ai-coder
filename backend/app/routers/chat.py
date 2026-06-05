import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_response, stream_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Send a message to the AI assistant and get a response."""
    result = generate_response(request.message, request.history)
    return ChatResponse(**result)


@router.post("/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Stream the AI assistant response as Server-Sent Events."""

    async def event_generator() -> AsyncIterator[str]:
        async for event in stream_response(request.message, request.history):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
