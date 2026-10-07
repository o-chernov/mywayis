"""
Защита публичных форм без внешних зависимостей и без капчи.

Три уровня: honeypot (боты заполняют скрытое поле), время заполнения
(человек не отправит форму за секунду) и троттлинг по IP.
"""

from __future__ import annotations

import hashlib
import time

from django import forms
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import gettext_lazy as _


def hash_ip(request) -> str:
    """
    Хеш адреса вместо самого адреса.

    IP — персональные данные по 152-ФЗ. Для защиты от спама достаточно
    знать, что обращения приходят с одного адреса, сам адрес хранить незачем.
    """
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    ip = forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "")
    return hashlib.sha256(f"{settings.IP_HASH_SALT}:{ip}".encode()).hexdigest()[:32]


def rate_limit_exceeded(request, scope: str) -> bool:
    """
    Больше FORM_RATE_LIMIT попыток за окно — отказываем.

    Окно фиксированное и отсчитывается от первой попытки: `add` ставит ключ
    с временем жизни только если его ещё нет, дальше идёт голый `incr`,
    который срок не продлевает.
    """
    key = f"ratelimit:{scope}:{hash_ip(request)}"

    if cache.add(key, 1, settings.FORM_RATE_WINDOW_SECONDS):
        return False

    try:
        attempts = cache.incr(key)
    except ValueError:
        # Ключ истёк между add и incr — считаем попытку первой в новом окне.
        cache.set(key, 1, settings.FORM_RATE_WINDOW_SECONDS)
        return False

    return attempts > settings.FORM_RATE_LIMIT


class AntiSpamFormMixin(forms.Form):
    """
    Скрытые поля защиты. Подмешивается к любой публичной форме.

    `website` — honeypot: настоящий человек его не видит.
    `rendered_at` — метка времени отрисовки формы.
    """

    website = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={"tabindex": "-1", "autocomplete": "off"}),
        label="",
    )
    rendered_at = forms.CharField(required=False, widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.is_bound:
            self.fields["rendered_at"].initial = str(int(time.time()))

    @property
    def looks_like_bot(self) -> bool:
        """
        Заполнен honeypot или форма отправлена подозрительно быстро.

        Отдельно от clean(): на бота не показываем ошибку, а изображаем
        успех — иначе он подберёт обход.
        """
        if self.data.get("website"):
            return True

        raw = self.data.get("rendered_at") or ""
        if not raw.isdigit():
            return True

        elapsed = int(time.time()) - int(raw)
        return elapsed < settings.FORM_MIN_FILL_SECONDS

    def clean_website(self) -> str:
        # Значение не используем, но поле должно пройти валидацию.
        return ""
