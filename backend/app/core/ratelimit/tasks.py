import asyncio
import logging
from datetime import timedelta

from app.celery_app import celery_app
from app.core.db.database import task_session
from app.core.ratelimit import counter

logger = logging.getLogger(__name__)

# Заметно больше самого длинного окна среди всех политик (сейчас час у
# LOGIN_EMAIL_RULE), чтобы уборка не сносила счётчики, которые ещё считают.
STALE_AFTER = timedelta(days=1)


async def _purge() -> int:
    async with task_session() as db:
        return await counter.drop_stale(db, older_than=STALE_AFTER)


@celery_app.task(name="ratelimit.purge_stale_counters")
def purge_stale_counters() -> None:
    """Чистит брошенные счётчики попыток.

    Идемпотентна: повторный запуск просто удалит ноль строк.
    """
    deleted = asyncio.run(_purge())
    logger.info("purged %s stale rate limit counters", deleted)
