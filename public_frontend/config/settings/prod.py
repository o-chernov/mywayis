"""Продакшен: строгие проверки и защита от того, чтобы туда уехала заглушка."""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

if not ALLOWED_HOSTS:  # noqa: F405
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS обязателен в продакшене")

if SECRET_KEY == "dev-insecure-key-change-me":  # noqa: F405
    raise ImproperlyConfigured("DJANGO_SECRET_KEY не задан")

# Заглушка регистрации создаёт видимость работающей формы, ничего не сохраняя.
# В продакшене это молчаливая потеря пользователей, поэтому падаем на старте.
if REGISTRATION_BACKEND != "http":  # noqa: F405
    raise ImproperlyConfigured(
        "REGISTRATION_BACKEND должен быть 'http' в продакшене: "
        "иначе регистрация никуда не отправляется"
    )

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
LANGUAGE_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if not host.startswith(".")]  # noqa: F405

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
