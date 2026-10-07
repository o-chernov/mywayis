"""
Общие настройки публичного сайта mywayis.com.

Сайт ничего не знает о пользователях: регистрация уходит в FastAPI, а собственная
база (SQLite) хранит только админку, тексты страниц, юридические документы и заявки
из формы обратной связи.
"""

from pathlib import Path

from dotenv import load_dotenv

import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

# — Внешние адреса —
# Куда уходит регистрация и куда отправляем человека после неё.
API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8001").rstrip("/")
APP_URL = os.getenv("APP_URL", "http://localhost:5173").rstrip("/")
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000").rstrip("/")

# stub — форма работает на заглушке, http — реальный запрос в FastAPI.
REGISTRATION_BACKEND = os.getenv("REGISTRATION_BACKEND", "stub")
REGISTRATION_TIMEOUT_SECONDS = float(os.getenv("REGISTRATION_TIMEOUT_SECONDS", "5"))

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.sitemaps",
    "django.contrib.staticfiles",
    "apps.core",
    "apps.pages",
    "apps.accounts",
    "apps.legal",
    "apps.contacts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # LocaleMiddleware обязан идти после сессий и до CommonMiddleware.
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.template.context_processors.i18n",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "apps.core.context_processors.site",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Единственная база — своя. В myway_db (PostgreSQL бэкенда) сайт не ходит вообще.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# — Языки —
# Исходные строки в коде на русском: команда русскоязычная, и шаблоны должны
# читаться без перевода. Переводится только каталог en, русский отдаётся как msgid.
LANGUAGE_CODE = "ru"
LANGUAGES = [
    ("ru", "Русский"),
    ("en", "English"),
]
LOCALE_PATHS = [BASE_DIR / "locale"]
USE_I18N = True
USE_TZ = True
TIME_ZONE = "Europe/Moscow"

LANGUAGE_COOKIE_NAME = "myway_language"
LANGUAGE_COOKIE_SAMESITE = "Lax"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# — Почта —
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.getenv("SMTP_HOST", "")
EMAIL_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_HOST_USER = os.getenv("SMTP_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_USE_TLS = env_bool("SMTP_USE_TLS", True)
DEFAULT_FROM_EMAIL = os.getenv("SMTP_FROM", "noreply@mywayis.com")

# — Защита форм —
# Троттлинг живёт в стандартном кеше: внешних зависимостей ради пяти попыток не нужно.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "myway-public-site",
    }
}
FORM_RATE_LIMIT = int(os.getenv("FORM_RATE_LIMIT", "5"))
FORM_RATE_WINDOW_SECONDS = int(os.getenv("FORM_RATE_WINDOW_SECONDS", "600"))
# Минимальное время заполнения формы: быстрее этого её заполняют только боты.
FORM_MIN_FILL_SECONDS = int(os.getenv("FORM_MIN_FILL_SECONDS", "3"))
# Соль для хеширования IP — адреса в открытом виде не храним.
IP_HASH_SALT = os.getenv("IP_HASH_SALT", SECRET_KEY)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        # Пароль не должен попасть в логи ни при каком стечении обстоятельств.
        "scrub_secrets": {"()": "apps.core.logging_filters.ScrubSecretsFilter"},
    },
    "formatters": {
        "simple": {"format": "{levelname} {asctime} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "filters": ["scrub_secrets"],
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
