from app.core.errors.base import AppError


class AuthError(AppError):
    """База слайса auth — чтобы можно было поймать все его ошибки разом."""


# --------- вход ---------

class InvalidCredentials(AuthError):
    """Неверный email или пароль.

    Намеренно не различает «нет такого пользователя» и «пароль не подошёл»:
    иначе по разным ответам перебирается база зарегистрированных адресов.
    """

    code = "AUTH_INVALID_CREDENTIALS"
    status_code = 401


class TooManyAttempts(AuthError):
    """Слишком много неудачных попыток входа.

    В params уезжает retry_after в секундах — фронт показывает обратный отсчёт
    вместо бесполезного «попробуйте позже».
    """

    code = "AUTH_TOO_MANY_ATTEMPTS"
    status_code = 429


# --------- access-токен ---------

class TokenMissing(AuthError):
    """Заголовка Authorization нет вовсе — пользователь просто не залогинен."""

    code = "AUTH_TOKEN_MISSING"
    status_code = 401


class InvalidToken(AuthError):
    """Подпись не сошлась, тип не тот или payload битый. Только на логин."""

    code = "AUTH_TOKEN_INVALID"
    status_code = 401


class TokenExpired(AuthError):
    """Токен просрочен. Фронт по этому коду идёт на /auth/refresh,
    а не выкидывает пользователя на страницу входа."""

    code = "AUTH_TOKEN_EXPIRED"
    status_code = 401


# --------- refresh-сессии ---------

class SessionNotFound(AuthError):
    """Куки нет, токен не найден в refresh_sessions или срок вышел."""

    code = "AUTH_SESSION_NOT_FOUND"
    status_code = 401


class SessionReuseDetected(AuthError):
    """Предъявлен уже отозванный refresh — значит, копия токена гуляет на стороне.

    Вся family погашена, обоим участникам нужен полный повторный вход.
    Отдельный код нужен не столько фронту, сколько мониторингу: всплеск
    таких ошибок означает утечку.
    """

    code = "AUTH_SESSION_REUSE_DETECTED"
    status_code = 401


# --------- состояние аккаунта и права ---------

class EmailNotVerified(AuthError):
    """Фронт показывает кнопку «отправить письмо повторно»."""

    code = "AUTH_EMAIL_NOT_VERIFIED"
    status_code = 403


class AccountNotActive(AuthError):
    """Заблокирован или не завершил регистрацию. Фронт ведёт в поддержку."""

    code = "AUTH_ACCOUNT_NOT_ACTIVE"
    status_code = 403


class InsufficientRole(AuthError):
    """Не хватает роли для этой ручки — бросает require_roles."""

    code = "AUTH_INSUFFICIENT_ROLE"
    status_code = 403
