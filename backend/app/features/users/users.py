import uuid
from uuid6 import uuid7
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date
from sqlalchemy import String
from app.core.db.database import Base
from sqlalchemy import (
    String,
    Uuid,
    func,
    Boolean,
    DateTime,
    text,
    false
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(
        String(320), unique=True, index=True, nullable=False)

    username: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True)
    role: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'user'"))

    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="invited")

    is_email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=false()
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True)

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
