from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.core.settings import settings
from app.features.auth import service
from app.features.auth.errors import SessionNotFound
from app.features.auth.schemas import LoginRequest, TokenResponse
from app.features.auth.security.cookies_in_auth import (
    clear_refresh_cookie,
    set_refresh_cookie,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_meta(request: Request) -> tuple[str | None, str | None]:
    """User-Agent и IP для списка активных сессий и для лимитера."""
    user_agent = request.headers.get("user-agent")
    return (
        # Ровно ширина колонки user_agent: заголовок присылает клиент,
        # и без обрезки длинная строка уронит INSERT.
        user_agent[:255] if user_agent else None,
        request.client.host if request.client else None,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    user_agent, ip = _client_meta(request)
    tokens = await service.login(
        db,
        email=payload.email,
        password=payload.password,
        user_agent=user_agent,
        ip=ip,
    )
    set_refresh_cookie(response, tokens.refresh)
    return TokenResponse(access_token=tokens.access)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Обновление пары токенов.

    Метод обязан быть POST: при SameSite=lax браузер не отправляет куку на
    кросс-сайтовый POST, и это закрывает CSRF без отдельного токена.
    На GET кука ушла бы.
    """
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise SessionNotFound

    user_agent, ip = _client_meta(request)
    tokens = await service.rotate_session(
        db,
        refresh_token=refresh_token,
        user_agent=user_agent,
        ip=ip,
    )
    set_refresh_cookie(response, tokens.refresh)
    return TokenResponse(access_token=tokens.access)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Намеренно без проверки access-токена.

    Выйти из аккаунта должно быть можно и с протухшим токеном, иначе
    пользователь останется с живой сессией в БД. Идемпотентен: куки нет —
    просто чистим её на клиенте.
    """
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if refresh_token:
        await service.logout(db, refresh_token=refresh_token)

    clear_refresh_cookie(response)
