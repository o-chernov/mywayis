import uuid
from datetime import datetime

from uuid6 import uuid7
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Uuid,
    func,
)

from app.core.db.database import Base


class RefreshSession(Base):
    """Одно звено цепочки ротации refresh-токена.

    Строка живёт до первого использования: на /auth/refresh она отзывается и
    рождается новая с тем же family_id. Предъявление уже отозванной строки
    означает, что копия токена гуляет на стороне — тогда гасится вся family.
    """

    __tablename__ = "refresh_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid7)

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # sha256 в hex от самого токена: утечка дампа не даёт доступа ни к одному
    # аккаунту. Медленный хеш (bcrypt) здесь не нужен — токен случайный,
    # перебирать нечего, а ротация происходит на каждом обновлении.
    token_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True)

    # Общий идентификатор всех звеньев одного входа. По нему гасится вся
    # цепочка при детекции переиспользования.
    family_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, nullable=False, index=True)

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False)

    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True)

    # Для списка активных сессий в настройках аккаунта. Заполняются с первого
    # дня: задним числом их к уже выданным сессиям не восстановить.
    user_agent: Mapped[str | None] = mapped_column(
        String(255), nullable=True)
    ip: Mapped[str | None] = mapped_column(INET, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
