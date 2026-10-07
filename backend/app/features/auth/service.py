import uuid
from datetime import timedelta
from typing import NamedTuple

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from uuid6 import uuid7

from app.core.ratelimit import counter
from app.core.ratelimit.counter import Rule
from app.core.settings import settings
from app.features.auth.errors import (
    AccountNotActive,
    EmailNotVerified,
    InvalidCredentials,
    SessionNotFound,
    SessionReuseDetected,
    TooManyAttempts,
)
from app.features.auth.models.refresh_session import RefreshSession
from app.features.auth.security.jwt import create_access_token, now_utc
from app.features.auth.security.passwords import (
    DUMMY_PASSWORD_HASH,
    verify_password,
)
from app.features.auth.security.refresh import (
    generate_refresh_token,
    hash_refresh_token,
)
from app.features.users.users import User

ACTIVE_STATUS = "active"

# Лимиты входа. Это доменная политика слайса, а не конфигурация деплоя, —
# менять её при выкатке не нужно, поэтому константы здесь, а не в .env.
#
# Ключ по IP душит перебор с одного хоста. Ключ по email нужен против
# распределённого перебора одного аккаунта и намеренно сделан заметно
# свободнее: чем он строже, тем проще посторонний заблокирует чужой вход,
# просто наспамив неверных паролей. Полностью эта дилемма снимается только
# капчей после N неудач.
LOGIN_IP_RULE = Rule(limit=10, window=timedelta(minutes=15))
LOGIN_EMAIL_RULE = Rule(limit=20, window=timedelta(hours=1))


class TokenPair(NamedTuple):
    access: str
    refresh: str


# --------- правила доступа ---------


def ensure_can_act(user: User) -> None:
    """Единственное место, где определено «пользователю можно работать».

    Эту же функцию вызывает get_current_active_user: правило не должно
    разъезжаться между входом и остальными ручками.
    """
    # Проверка email идёт первой намеренно. Свежезарегистрированный
    # пользователь одновременно и status="invited", и не подтверждён; если
    # сначала смотреть на статус, он получит ACCOUNT_NOT_ACTIVE и фронт не
    # покажет ему кнопку «отправить письмо повторно».
    if not user.is_email_verified:
        raise EmailNotVerified
    if user.status != ACTIVE_STATUS:
        raise AccountNotActive


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _login_keys(email: str, ip: str | None) -> list[tuple[str, Rule]]:
    keys = [(f"login:email:{email}", LOGIN_EMAIL_RULE)]
    if ip:
        keys.append((f"login:ip:{ip}", LOGIN_IP_RULE))
    return keys


async def authenticate(db: AsyncSession, *, email: str, password: str) -> User:
    """Проверяет только пару email+пароль. Состояние аккаунта — отдельно."""
    user = await db.scalar(
        select(User).where(User.email == _normalize_email(email))
    )

    if user is None or user.password_hash is None:
        # Считаем хеш вхолостую: без этого «нет такого email» отвечает за
        # миллисекунду, а «пароль не подошёл» — за сотни, и разницу видно.
        await verify_password(password, DUMMY_PASSWORD_HASH)
        raise InvalidCredentials

    if not await verify_password(password, user.password_hash):
        raise InvalidCredentials

    return user


# --------- сессии ---------


def _issue_session(
    db: AsyncSession,
    user: User,
    *,
    family_id: uuid.UUID | None = None,
    user_agent: str | None = None,
    ip: str | None = None,
) -> TokenPair:
    """Создаёт очередное звено цепочки.

    Без commit — транзакцию закрывает вызывающий сценарий, чтобы выдачу
    токенов можно было склеить с регистрацией в одной транзакции.
    """
    raw_refresh = generate_refresh_token()
    db.add(
        RefreshSession(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh),
            family_id=family_id or uuid7(),
            expires_at=now_utc()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=user_agent,
            ip=ip,
        )
    )
    return TokenPair(access=create_access_token(user.id), refresh=raw_refresh)


async def _revoke_family(db: AsyncSession, family_id: uuid.UUID) -> None:
    await db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.family_id == family_id,
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=now_utc())
    )


# --------- сценарии ---------


async def login(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    user_agent: str | None = None,
    ip: str | None = None,
) -> TokenPair:
    email = _normalize_email(email)
    keys = _login_keys(email, ip)

    # Проверка идёт ДО authenticate. Это главный смысл лимитера: заблокированная
    # попытка должна стоить один индексный SELECT, а не 250 мс bcrypt, иначе
    # перебор паролей сам по себе кладёт сервер.
    for key, rule in keys:
        wait = await counter.retry_after(db, key=key, rule=rule)
        if wait is not None:
            raise TooManyAttempts(retry_after=wait)

    try:
        user = await authenticate(db, email=email, password=password)
    except InvalidCredentials:
        for key, rule in keys:
            await counter.hit(db, key=key, window=rule.window)
        # Commit обязателен здесь: дальше сценарий бросает исключение, и без
        # него счётчик откатился бы вместе с транзакцией.
        await db.commit()
        raise

    # Строго после проверки пароля: иначе по коду ответа можно узнать,
    # существует ли аккаунт с таким email. Верный пароль при неактивном
    # аккаунте неудачной попыткой не считается — счётчик не трогаем.
    ensure_can_act(user)

    await counter.reset(db, keys=[key for key, _ in keys])
    user.last_login_at = now_utc()
    tokens = _issue_session(db, user, user_agent=user_agent, ip=ip)
    await db.commit()
    return tokens


async def rotate_session(
    db: AsyncSession,
    *,
    refresh_token: str,
    user_agent: str | None = None,
    ip: str | None = None,
) -> TokenPair:
    session = await db.scalar(
        select(RefreshSession)
        .where(RefreshSession.token_hash == hash_refresh_token(refresh_token))
        # Блокировка строки: два одновременных refresh не должны разойтись
        # и породить две живые ветки одной цепочки.
        .with_for_update()
    )
    if session is None:
        raise SessionNotFound

    if session.revoked_at is not None:
        # Звено уже отработало, но его предъявили снова — значит, копия токена
        # гуляет на стороне. Гасим всю цепочку: и вор, и владелец идут на логин.
        # Без этой ветки ротация не защищает, а лишь плодит строки в БД.
        await _revoke_family(db, session.family_id)
        await db.commit()
        raise SessionReuseDetected

    if session.expires_at <= now_utc():
        raise SessionNotFound

    user = await db.get(User, session.user_id)
    if user is None:
        raise SessionNotFound
    ensure_can_act(user)

    session.revoked_at = now_utc()
    tokens = _issue_session(
        db,
        user,
        family_id=session.family_id,
        user_agent=user_agent,
        ip=ip,
    )
    await db.commit()
    return tokens


async def logout(db: AsyncSession, *, refresh_token: str) -> None:
    """Гасит текущую сессию.

    Идемпотентен и молчит на неизвестный токен: выход из аккаунта не должен
    падать с ошибкой, что бы ни лежало в куке.
    """
    await db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.token_hash == hash_refresh_token(refresh_token),
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=now_utc())
    )
    await db.commit()


async def revoke_all_sessions(db: AsyncSession, *, user_id: uuid.UUID) -> None:
    """«Выйти на всех устройствах», а также бан и смена пароля."""
    await db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.user_id == user_id,
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=now_utc())
    )
    await db.commit()


async def purge_expired_sessions(db: AsyncSession) -> int:
    """Удаляет истёкшие звенья цепочек. Возвращает число удалённых строк.

    Условие только по expires_at, и это принципиально: отозванные, но ещё не
    истёкшие строки трогать нельзя — именно по ним работает детекция
    переиспользования. Если вычищать их «за ненадобностью», предъявленный
    краденый токен вернёт «сессия не найдена» вместо того, чтобы погасить всю
    цепочку, и защита тихо перестанет работать.
    """
    result = await db.execute(
        delete(RefreshSession).where(RefreshSession.expires_at < now_utc())
    )
    await db.commit()
    return result.rowcount
