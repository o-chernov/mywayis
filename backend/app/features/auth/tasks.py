import asyncio
import logging

from app.celery_app import celery_app
from app.core.db.database import task_session
from app.features.auth import service

logger = logging.getLogger(__name__)


async def _purge() -> int:
    async with task_session() as db:
        return await service.purge_expired_sessions(db)


@celery_app.task(name="auth.purge_expired_sessions")
def purge_expired_sessions() -> None:
    """Чистит истёкшие refresh-сессии.

    Без неё таблица растёт линейно по числу входов: ротация создаёт новое
    звено на каждое обновление токена.
    """
    deleted = asyncio.run(_purge())
    logger.info("purged %s expired refresh sessions", deleted)
