from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            _("Регистрация"),
            {
                "fields": (
                    "registration_open",
                    "registration_closed_title",
                    "registration_closed_message",
                ),
                "description": _(
                    "Тумблер «Регистрация открыта» мгновенно закрывает приём новых "
                    "пользователей — деплой не нужен."
                ),
            },
        ),
        (_("Юридические документы"), {"fields": ("legal_jurisdiction",)}),
        (_("Контакты"), {"fields": ("contact_email", "contact_telegram", "support_hours")}),
        (
            _("Реквизиты"),
            {
                "fields": ("company_name", "company_inn", "company_ogrn", "company_address"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Аналитика"),
            {"fields": ("analytics_enabled", "metrika_id"), "classes": ("collapse",)},
        ),
    )
    readonly_fields = ()

    def has_add_permission(self, request) -> bool:
        # Запись ровно одна: кнопка «Добавить» только путала бы.
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
