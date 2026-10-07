from django.conf import settings as django_settings

from .models import SiteSettings


def site(request):
    """Настройки сайта, внешние адреса и документы для подвала."""
    # Импорт внутри функции: apps.legal зависит от apps.core, и на верхнем
    # уровне это замкнулось бы в круг.
    from apps.legal.selectors import footer_documents

    return {
        "site_settings": SiteSettings.get(),
        "app_url": django_settings.APP_URL,
        "site_url": django_settings.SITE_URL,
        "footer_documents": footer_documents(),
    }
