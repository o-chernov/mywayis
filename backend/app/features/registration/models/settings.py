from app.core.db.database import Base
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.core.db.database import Base
from sqlalchemy import (
    func,
    Boolean,
    DateTime,
    CheckConstraint,
    Integer,
    true,
)


class RegistrationSettings(Base):
    """Настройки регистрации. Singleton: всегда ровно одна строка с id=1."""
    __tablename__ = "registration_settings"
    __table_args__ = (CheckConstraint("id = 1", name="single_row"), )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    is_registration_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=true())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now())
