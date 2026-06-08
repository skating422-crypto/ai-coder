import logging

from fastapi import APIRouter

from app.models.schemas import ExecuteRequest, ExecuteResponse
from app.services.executor_service import execute_command

logger = logging.getLogger("ai_coder.executor")

router = APIRouter(prefix="/api/execute", tags=["executor"])


@router.post("", response_model=ExecuteResponse)
async def execute(request: ExecuteRequest) -> ExecuteResponse:
    """Execute a command in the workspace."""
    logger.info("Execute request: command=%s, cwd=%s", request.command, request.cwd)
    result = await execute_command(request.command, request.cwd)
    return ExecuteResponse(**result)
