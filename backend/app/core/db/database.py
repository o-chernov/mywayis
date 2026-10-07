from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.settings import settings
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.pool import NullPool

# Асинхронный движок
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    echo=True,  # В dev-режиме выводит SQL-запросы в консоль
)

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# Фабрика асинхронных сессий
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Зависимость для FastAPI (Dependency Injection)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


@asynccontextmanager
async def task_session() -> AsyncGenerator[AsyncSession, None]:
    """Сессия для Celery-воркера.

    Свой движок с NullPool на каждый запуск, а не общий engine выше. Celery
    синхронный, поэтому каждая задача поднимает свой event loop через
    asyncio.run(), а соединения asyncpg привязаны к тому loop, в котором были
    открыты: переиспользование общего пула из другого loop падает с
    «attached to a different loop», причём не сразу, а на втором запуске.
    """
    engine = create_async_engine(
        settings.SQLALCHEMY_DATABASE_URL,
        poolclass=NullPool,
    )
    session_maker = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False)
    try:
        async with session_maker() as session:
            yield session
    finally:
        await engine.dispose()
