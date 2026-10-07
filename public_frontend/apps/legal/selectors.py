from django.utils import translation

from apps.core.models import SiteSettings

from .models import LegalDocument

# Если документа нет на текущем языке, показываем его на языке, который
# для юрисдикции считается основным. Пустая страница хуже чужого языка.
FALLBACK_LANGUAGE = {"RU": "ru", "US": "en"}


def active_jurisdiction() -> str:
    return SiteSettings.get().legal_jurisdiction


def published_documents():
    """Все документы активной юрисдикции на подходящем языке."""
    jurisdiction = active_jurisdiction()
    language = translation.get_language() or "ru"
    fallback = FALLBACK_LANGUAGE.get(jurisdiction, "ru")

    documents = LegalDocument.objects.filter(jurisdiction=jurisdiction, is_published=True)

    # Один документ = один слаг. Берём версию на текущем языке, иначе на
    # основном для юрисдикции.
    by_slug: dict[str, LegalDocument] = {}
    for document in documents:
        current = by_slug.get(document.slug)
        if current is None:
            by_slug[document.slug] = document
            continue
        if current.language != language and document.language == language:
            by_slug[document.slug] = document
        elif current.language not in (language, fallback) and document.language == fallback:
            by_slug[document.slug] = document

    return sorted(by_slug.values(), key=lambda item: (item.order, item.title))


def get_document(slug: str) -> LegalDocument | None:
    """Документ по слагу с тем же разрешением языка."""
    return next((item for item in published_documents() if item.slug == slug), None)


def footer_documents():
    return [item for item in published_documents() if item.show_in_footer]


# Плейсхолдеры в текстах: реквизиты меняются, а документов много — держать
# их в одном месте (настройках сайта) надёжнее, чем править каждый текст.
PLACEHOLDERS = {
    "{{COMPANY_NAME}}": "company_name",
    "{{COMPANY_INN}}": "company_inn",
    "{{COMPANY_OGRN}}": "company_ogrn",
    "{{COMPANY_ADDRESS}}": "company_address",
    "{{CONTACT_EMAIL}}": "contact_email",
}

# Пустой реквизит показываем прочерком, а не сырым плейсхолдером: «{{COMPANY_INN}}»
# в опубликованном документе выглядит как поломка. О незаполненных полях
# предупреждает системная проверка (см. apps/legal/checks.py).
EMPTY_PLACEHOLDER = "—"


def fill_placeholders(text: str) -> str:
    site_settings = SiteSettings.get()
    result = text
    for token, attribute in PLACEHOLDERS.items():
        value = getattr(site_settings, attribute, "") or EMPTY_PLACEHOLDER
        result = result.replace(token, str(value))
    return result
