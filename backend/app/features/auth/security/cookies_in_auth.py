from fastapi import Response

from app.core.settings import settings

# Access-токен в куку не кладём: он уходит в теле ответа и живёт в памяти
# фронта. В куке только refresh — и только на пути REFRESH_COOKIE_PATH, чтобы
# браузер не прицеплял его к каждому запросу за графиками и сообщениями.


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite=settings.SAMESITE_COOKIES,
        # Пустая строка в .env означает «без домена» (нужно для localhost).
        domain=settings.COOKIE_DOMAIN or None,
        path=settings.REFRESH_COOKIE_PATH,
    )


def clear_refresh_cookie(response: Response) -> None:
    # domain и path обязаны совпадать с теми, что были при установке, иначе
    # браузер не найдёт что удалять и кука останется жить.
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite=settings.SAMESITE_COOKIES,
        domain=settings.COOKIE_DOMAIN or None,
        path=settings.REFRESH_COOKIE_PATH,
    )
