import asyncio
import json
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from ..state import state_manager
from ..schemas import SSEEvent

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("/stream")
async def stream_events(request: Request):
    """
    Server-Sent Events (SSE) streaming endpoint.
    Feeds real-time FL updates, training progress, and aggregation steps to the dashboard.
    """
    queue = await state_manager.subscribe()

    async def event_generator():
        try:
            # Initial connection confirmation
            init_event = SSEEvent(
                type="connection_established",
                message="Connected to HealthSync real-time event pipeline."
            )
            yield {
                "event": "message",
                "data": json.dumps(init_event.model_dump())
            }

            while True:
                # If client disconnected, break
                if await request.is_disconnected():
                    break

                try:
                    # Wait for next event with a periodic keepalive
                    event: SSEEvent = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {
                        "event": "message",
                        "data": json.dumps(event.model_dump())
                    }
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat comment
                    yield {
                        "event": "ping",
                        "data": "keep-alive"
                    }
        except asyncio.CancelledError:
            pass
        finally:
            await state_manager.unsubscribe(queue)

    return EventSourceResponse(event_generator())
