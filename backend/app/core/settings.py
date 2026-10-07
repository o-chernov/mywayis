from typing import Annotated, Literal

from pydantic import BeforeValidator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ADMIN_FIRST_NAME: str
    # 🔑 JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    COOKIE_DOMAIN: str
    SECURE_COOKIES: bool
    # Значение из .env приводится к нижнему регистру один раз здесь,
    # а не нормализуется при каждой установке куки.
    SAMESITE_COOKIES: Annotated[
        Literal["lax", "strict", "none"], BeforeValidator(str.lower)
    ]
    REFRESH_COOKIE_NAME: str
    REFRESH_COOKIE_PATH: str
    JWT_LEEWAY_SECONDS: int
    EMAIL_TOKEN_TTL_MINUTES: int = 1440  # по умолчанию 24 ч
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 1
    JWT_ISSUER: str | None = None
    JWT_AUDIENCE: str | None = None
    ADMIN_TOKEN: str

    # 🗄️ PostgreSQL (используем полную строку подключения)
    SQLALCHEMY_DATABASE_URL: str
    ALEMBIC_SQLALCHEMY_DATABASE_URL: str

    # 📧 SMTP
    SMTP_USE_TLS: bool
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM: str

    # 🌐 CORS
    CORS_ALLOWED_ORIGINS: list[str]

    API_BASE_URL: str = "https://api.localhost"   # dev/stage/prod через .env
    ENVIRONMENT: str = "local"  # local | stage | production
    # Нужен, чтобы на проде не отдавать /docs и схему OpenAPI

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    FRONTEND_URL: str = "https://localhost:5173"  # для редиректов на фронт

    # 🐇 RabbitMQ (для Celery)
    RABBITMQ_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # pyright: ignore[reportCallIssue]
