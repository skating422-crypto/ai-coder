import logging

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_response

logger = logging.getLogger("ai_coder.chat")

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Send a message to the AI assistant and get a response."""
    logger.info("Received chat message: %s", request.message[:80])
    result = generate_response(request.message, request.history)
    logger.info("Chat response generated (files_changed=%s)", result.get("files_changed", []))
    return ChatResponse(**result)
