"""
Системная проверка: документы не должны публиковаться с пустыми реквизитами.

Документ с прочерком вместо ИНН формально недействителен, а заметить это
глазами трудно — текстов много. Проверка выводит предупреждение в
`manage.py check` и в логе запуска.
"""

from django.core.checks import Warning as CheckWarning
from django.core.checks import register


@register("legal")
def check_legal_placeholders(app_configs, **kwargs):
    # Импорт внутри функции: проверки регистрируются до готовности приложений.
    from django.db.utils import OperationalError, ProgrammingError

    from apps.core.models import SiteSettings

    from .models import LegalDocument
    from .selectors import PLACEHOLDERS

    try:
        site_settings = SiteSettings.get()
        published = list(
            LegalDocument.objects.filter(
                is_published=True, jurisdiction=site_settings.legal_jurisdiction
            ).values_list("slug", "body")
        )
    except (OperationalError, ProgrammingError):
        # База ещё не создана — это нормально до первой миграции.
        return []

    missing: dict[str, set[str]] = {}
    for token, attribute in PLACEHOLDERS.items():
        if getattr(site_settings, attribute, ""):
            continue
        for slug, body in published:
            if token in body:
                missing.setdefault(token, set()).add(slug)

    if not missing:
        return []

    details = "; ".join(
        f"{token} → {', '.join(sorted(slugs))}" for token, slugs in sorted(missing.items())
    )
    return [
        CheckWarning(
            "Опубликованные юридические документы содержат незаполненные реквизиты.",
            hint=(
                "Заполните поля в админке: Сайт → Настройки сайта → Реквизиты. "
                f"Незаполнено: {details}"
            ),
            id="legal.W001",
        )
    ]
