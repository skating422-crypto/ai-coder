from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Send a message to the AI assistant and get a response."""
    result = generate_response(request.message, request.history)
    return ChatResponse(**result)
