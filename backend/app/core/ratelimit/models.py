from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, Integer, String

from app.core.db.database import Base


class RateLimitCounter(Base):
    """Счётчик попыток в фиксированном окне.

    Домена здесь нет: это инфраструктурный примитив, счётчик по непрозрачному
    ключу. Смысл ключу придаёт слайс, который его формирует ("login:ip:..."),
    он же владеет лимитами. Своего слайса-владельца у таблицы нет — её будут
    делить регистрация, сброс пароля и повторная отправка письма, — поэтому
    она живёт в core.
    """

    __tablename__ = "rate_limit_counters"

    # sha256 от ключа: фиксированная ширина независимо от длины email
    # и никаких адресов с IP, продублированных ещё в одну таблицу.
    key_hash: Mapped[str] = mapped_column(String(64), primary_key=True)

    attempts: Mapped[int] = mapped_column(Integer, nullable=False)

    window_started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False)
