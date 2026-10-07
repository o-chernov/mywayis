# --------- JWT helpers (вспомогательные функции для access-токена) ---------
import uuid
from datetime import datetime, timedelta, timezone

# Абсолютный импорт: это PyJWT, а не соседний модуль с тем же именем.
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from pydantic import BaseModel, ValidationError

from app.core.settings import settings
from app.features.auth.errors import InvalidToken, TokenExpired

ACCESS_TOKEN_TYPE = "access"


class TokenPayload(BaseModel):
    sub: uuid.UUID
    type: str


def now_utc() -> datetime:
    """Возвращает текущее время в UTC."""
    return datetime.now(timezone.utc)


def create_access_token(user_id: uuid.UUID) -> str:
    now = now_utc()
    payload = {
        "sub": str(user_id),          # по спецификации JWT sub — строка
        "type": ACCESS_TOKEN_TYPE,
        "iat": now,                   # PyJWT сам приведёт datetime к timestamp
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenPayload:
    """Проверяет подпись, срок и тип. Бросает доменные ошибки, не HTTP."""
    try:
        raw = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            leeway=settings.JWT_LEEWAY_SECONDS,
        )
        payload = TokenPayload.model_validate(raw)
    except ExpiredSignatureError:          # обязан идти первым:
        raise TokenExpired                 # это подкласс InvalidTokenError
    except (InvalidTokenError, ValidationError):
        raise InvalidToken

    # Тем же SECRET_KEY будут подписаны токены подтверждения email и сброса
    # пароля. Без этой проверки ссылкой из письма можно было бы ходить
    # по всему API как обычным access-токеном.
    if payload.type != ACCESS_TOKEN_TYPE:
        raise InvalidToken
    return payload
