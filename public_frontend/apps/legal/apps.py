from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class LegalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.legal"
    label = "legal"
    verbose_name = _("Документы")

    def ready(self) -> None:
        from . import checks  # noqa: F401 — регистрация системной проверки
