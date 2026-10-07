from typing import Annotated, Callable

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.features.auth.errors import (
    InsufficientRole,
    InvalidToken,
    TokenMissing,
)
from app.features.auth.security.jwt import decode_access_token
from app.features.auth.service import ensure_can_act
from app.features.users.users import User

# auto_error=False обязателен: иначе HTTPBearer сам бросит HTTPException со
# своим текстом в обход наших машиночитаемых кодов.
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Токен валиден и пользователь существует.

    Состояние аккаунта не проверяет — это нужно ручкам, куда обязан попасть
    ещё не активированный пользователь: подтверждение email, онбординг.
    """
    if credentials is None:
        raise TokenMissing

    payload = decode_access_token(credentials.credentials)

    user = await db.get(User, payload.sub)
    if user is None:
        # Токен подписан нами, но пользователя уже нет — аккаунт удалён.
        raise InvalidToken

    return user


async def get_current_active_user(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """То, что вешается на 95% ручек."""
    ensure_can_act(user)
    return user


def require_roles(*roles: str) -> Callable:
    """Фабрика проверок роли.

    Появится модератор поддержки — допишешь require_roles("admin", "moderator")
    вместо ещё одной копии функции.
    """

    async def _check(
        user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        if user.role not in roles:
            raise InsufficientRole(required=list(roles))
        return user

    return _check


get_current_admin = require_roles("admin")
