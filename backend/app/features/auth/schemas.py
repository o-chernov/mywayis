from typing import Annotated

from pydantic import AfterValidator, BaseModel, EmailStr, Field

from app.features.auth.security.passwords import MAX_PASSWORD_BYTES


def _fits_bcrypt(value: str) -> str:
    if len(value.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"password must be at most {MAX_PASSWORD_BYTES} bytes")
    return value


# Ограничение bcrypt считается в БАЙТАХ, поэтому max_length у Field не годится:
# он считает символы, а кириллица занимает по два байта на символ.
# Схема регистрации должна переиспользовать этот же тип.
PasswordStr = Annotated[str, Field(min_length=1), AfterValidator(_fits_bcrypt)]


class LoginRequest(BaseModel):
    email: EmailStr
    # Политики сложности здесь нет и быть не должно: на входе надо принять то,
    # что когда-то было сохранено. Требования к паролю — дело слайса регистрации.
    password: PasswordStr


class TokenResponse(BaseModel):
    """Refresh сюда не попадает — он уходит только в httpOnly-куку."""

    access_token: str
