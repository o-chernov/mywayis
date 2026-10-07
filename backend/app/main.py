from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db.database import engine
from app.core.errors.handlers import register_error_handlers
from app.core.middleware import RequestIdMiddleware
from app.core.settings import settings
from app.features.auth.routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # startup - Этот код будет выполнен до того, как приложение начнет принимать HTTP-запросы, во время startup.
    yield
    # shutdown - Этот код будет выполнен после того, как приложение закончит обрабатывать HTTP-запросы, непосредственно перед shutdown.
    await engine.dispose()


app = FastAPI(
    title="MyWay API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-Request-Id"],
    max_age=600,
)

# Добавляется после CORS, поэтому оказывается снаружи него: request_id
# проставляется до всей остальной обработки запроса.
app.add_middleware(RequestIdMiddleware)

register_error_handlers(app)

app.include_router(auth_router)


@app.get("/health", tags=["service"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
