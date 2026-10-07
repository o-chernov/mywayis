"""
Регистрация пользователя.

Публичный сайт не хранит пользователей и не пишет в базу бэкенда: единственный
владелец этих данных — FastAPI. Здесь только клиент к его эндпоинту.

Контракт, на который рассчитывает сайт:

    POST {API_BASE_URL}/auth/register
    {"email", "username", "password", "locale", "source"}

    201 → {"id", "email", "username", "status", "is_email_verified"}
    409 → {"detail": "email_taken"} | {"detail": "username_taken"}
    422 → стандартный формат ошибок FastAPI
    429 → слишком много попыток
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from typing import Protocol

import httpx
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

REGISTER_PATH = "/auth/register"


@dataclass
class RegistrationResult:
    email: str
    username: str
    user_id: str | None = None
    status: str = "invited"
    is_email_verified: bool = False


class RegistrationError(Exception):
    """
    Ошибка регистрации, пригодная для показа человеку.

    `field_errors` раскладываются под конкретные поля формы, `message` идёт
    в общую плашку над формой.
    """

    def __init__(self, message: str = "", field_errors: dict[str, str] | None = None):
        super().__init__(message)
        self.message = message
        self.field_errors = field_errors or {}


class RegistrationClient(Protocol):
    def register(self, *, email: str, username: str, password: str, locale: str) -> RegistrationResult:
        ...


class HttpRegistrationClient:
    """Реальный клиент: отдаёт регистрацию в FastAPI."""

    def __init__(self, base_url: str, timeout: float):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def register(self, *, email: str, username: str, password: str, locale: str) -> RegistrationResult:
        request_id = str(uuid.uuid4())
        url = f"{self.base_url}{REGISTER_PATH}"

        try:
            # Без ретраев: POST не идемпотентен, повтор после таймаута мог бы
            # создать второго пользователя с тем же адресом.
            response = httpx.post(
                url,
                json={
                    "email": email,
                    "username": username,
                    "password": password,
                    "locale": locale,
                    "source": "public_site",
                },
                headers={"X-Request-Id": request_id},
                timeout=self.timeout,
            )
        except httpx.TimeoutException:
            logger.warning("Регистрация: таймаут API, request_id=%s", request_id)
            raise RegistrationError(
                str(_("Сервис регистрации не ответил вовремя. Попробуйте ещё раз через минуту."))
            ) from None
        except httpx.HTTPError as error:
            logger.warning("Регистрация: сеть недоступна (%s), request_id=%s", type(error).__name__, request_id)
            raise RegistrationError(
                str(_("Сервис регистрации временно недоступен. Попробуйте позже или напишите нам."))
            ) from None

        if response.status_code == 201:
            payload = self._safe_json(response)
            return RegistrationResult(
                email=payload.get("email", email),
                username=payload.get("username", username),
                user_id=payload.get("id"),
                status=payload.get("status", "invited"),
                is_email_verified=bool(payload.get("is_email_verified", False)),
            )

        if response.status_code == 409:
            detail = self._safe_json(response).get("detail")
            if detail == "email_taken":
                raise RegistrationError(field_errors={"email": str(_("Такой email уже зарегистрирован."))})
            if detail == "username_taken":
                raise RegistrationError(field_errors={"username": str(_("Этот username уже занят."))})
            raise RegistrationError(str(_("Такой пользователь уже существует.")))

        if response.status_code == 422:
            field_errors = self._parse_validation(self._safe_json(response))
            if field_errors:
                raise RegistrationError(field_errors=field_errors)
            raise RegistrationError(str(_("Проверьте правильность заполнения полей.")))

        if response.status_code == 429:
            raise RegistrationError(
                str(_("Слишком много попыток. Подождите немного и попробуйте снова."))
            )

        logger.error(
            "Регистрация: неожиданный ответ API %s, request_id=%s",
            response.status_code,
            request_id,
        )
        raise RegistrationError(
            str(_("Сервис регистрации временно недоступен. Попробуйте позже или напишите нам."))
        )

    @staticmethod
    def _safe_json(response: httpx.Response) -> dict:
        try:
            payload = response.json()
        except ValueError:
            return {}
        return payload if isinstance(payload, dict) else {}

    @staticmethod
    def _parse_validation(payload: dict) -> dict[str, str]:
        """Разбирает стандартный 422 FastAPI: detail[].loc → имя поля."""
        detail = payload.get("detail")
        if not isinstance(detail, list):
            return {}

        known_fields = {"email", "username", "password"}
        errors: dict[str, str] = {}
        for item in detail:
            if not isinstance(item, dict):
                continue
            location = item.get("loc") or []
            name = next((part for part in reversed(location) if part in known_fields), None)
            if name and name not in errors:
                errors[name] = str(item.get("msg") or _("Некорректное значение."))
        return errors


@dataclass
class StubRegistrationClient:
    """
    Заглушка на время, пока эндпоинта в API нет.

    Ведёт себя как настоящий сервис: помнит уже занятые email и username в
    кеше, чтобы можно было проверить и успешный путь, и оба конфликта.
    Никуда ничего не отправляет и ничего не сохраняет.
    """

    cache_key: str = "accounts.stub_registrations"
    ttl: int = 3600
    # Занято с самого начала — чтобы конфликт можно было увидеть сразу.
    seeded: tuple[str, ...] = field(default=("taken@mywayis.com", "kirill_dev"))

    def register(self, *, email: str, username: str, password: str, locale: str) -> RegistrationResult:
        taken = set(cache.get(self.cache_key) or self.seeded)

        if email.lower() in {item.lower() for item in taken}:
            raise RegistrationError(field_errors={"email": str(_("Такой email уже зарегистрирован."))})
        if username.lower() in {item.lower() for item in taken}:
            raise RegistrationError(field_errors={"username": str(_("Этот username уже занят."))})

        taken.update({email, username})
        cache.set(self.cache_key, tuple(taken), self.ttl)

        # Пароль в лог не попадает: логируем только факт и username.
        logger.info("Регистрация (заглушка): создан пользователь %s, локаль %s", username, locale)

        return RegistrationResult(email=email, username=username, user_id=str(uuid.uuid4()))


def get_registration_client() -> RegistrationClient:
    if settings.REGISTRATION_BACKEND == "http":
        return HttpRegistrationClient(
            base_url=settings.API_BASE_URL,
            timeout=settings.REGISTRATION_TIMEOUT_SECONDS,
        )
    return StubRegistrationClient()
