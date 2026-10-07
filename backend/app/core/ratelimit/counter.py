import hashlib
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import case, delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ratelimit.models import RateLimitCounter


@dataclass(frozen=True)
class Rule:
    """Сколько попыток разрешено и за какое окно."""

    limit: int
    window: timedelta


def _hash(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


async def retry_after(
    db: AsyncSession, *, key: str, rule: Rule
) -> int | None:
    """Сколько секунд ждать до следующей попытки, или None — можно сейчас.

    Читает без блокировки: две одновременные попытки на границе лимита могут
    обе пройти. Для лимитера это допустимо, а расплачиваться блокировкой
    строки на каждом входе — нет.
    """
    row = await db.get(RateLimitCounter, _hash(key))
    if row is None or row.attempts < rule.limit:
        return None

    unblocks_at = row.window_started_at + rule.window
    now = datetime.now(timezone.utc)
    if unblocks_at <= now:
        return None  # окно истекло, счётчик обнулится следующей попыткой

    return int((unblocks_at - now).total_seconds()) + 1


async def hit(db: AsyncSession, *, key: str, window: timedelta) -> None:
    """Атомарно увеличивает счётчик, начиная новое окно, если старое истекло.

    Без commit: его делает сценарий. Но помни, что на неудачной попытке
    сценарий бросает исключение — commit там нужен явный, иначе счётчик
    откатится вместе с транзакцией и лимитер не сработает никогда.
    """
    now = datetime.now(timezone.utc)
    expired = RateLimitCounter.window_started_at < now - window

    stmt = insert(RateLimitCounter).values(
        key_hash=_hash(key), attempts=1, window_started_at=now
    )
    await db.execute(
        stmt.on_conflict_do_update(
            index_elements=[RateLimitCounter.key_hash],
            set_={
                "attempts": case((expired, 1), else_=RateLimitCounter.attempts + 1),
                "window_started_at": case(
                    (expired, now), else_=RateLimitCounter.window_started_at
                ),
            },
        )
    )


async def reset(db: AsyncSession, *, keys: Sequence[str]) -> None:
    """Успешная попытка обнуляет счётчики. Без commit — его делает сценарий."""
    await db.execute(
        delete(RateLimitCounter).where(
            RateLimitCounter.key_hash.in_([_hash(k) for k in keys])
        )
    )


async def drop_stale(db: AsyncSession, *, older_than: timedelta) -> int:
    """Уборка брошенных ключей. Дёргается периодической задачей.

    Коммитит сама: это самостоятельная операция обслуживания, а не часть
    чужого сценария. Возвращает число удалённых строк — для лога.
    """
    result = await db.execute(
        delete(RateLimitCounter).where(
            RateLimitCounter.window_started_at
            < datetime.now(timezone.utc) - older_than
        )
    )
    await db.commit()
    return result.rowcount
