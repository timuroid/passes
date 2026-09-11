import asyncio
import json
from collections.abc import AsyncIterator
from collections.abc import Callable


class EventBroker:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[dict[str, object]]] = set()
        self._lock = asyncio.Lock()

    async def subscribe(self) -> asyncio.Queue[dict[str, object]]:
        queue: asyncio.Queue[dict[str, object]] = asyncio.Queue(maxsize=50)
        async with self._lock:
            self._subscribers.add(queue)
        return queue

    async def unsubscribe(self, queue: asyncio.Queue[dict[str, object]]) -> None:
        async with self._lock:
            self._subscribers.discard(queue)

    async def publish(self, event: dict[str, object]) -> None:
        async with self._lock:
            subscribers = tuple(self._subscribers)
        for queue in subscribers:
            if queue.full():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            queue.put_nowait(event)

    async def stream(
        self,
        queue: asyncio.Queue[dict[str, object]],
        is_authorized: Callable[[], bool] | None = None,
    ) -> AsyncIterator[str]:
        try:
            if is_authorized is not None and not is_authorized():
                return
            yield "event: ready\ndata: {}\n\n"
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                    if is_authorized is not None and not is_authorized():
                        yield "event: session-ended\ndata: {}\n\n"
                        break
                    payload = json.dumps(event, ensure_ascii=False)
                    yield f"event: refresh\ndata: {payload}\n\n"
                except TimeoutError:
                    if is_authorized is not None and not is_authorized():
                        yield "event: session-ended\ndata: {}\n\n"
                        break
                    yield ": keep-alive\n\n"
        finally:
            await self.unsubscribe(queue)
