from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import LegalDocument


@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "jurisdiction", "language", "version", "effective_date", "is_published")
    list_filter = ("jurisdiction", "language", "is_published", "show_in_footer")
    search_fields = ("title", "body")
    ordering = ("jurisdiction", "order", "title")
    list_editable = ("is_published",)

    fieldsets = (
        (
            None,
            {
                "fields": ("slug", "jurisdiction", "language", "title", "summary"),
                "description": _(
                    "Показывается только та юрисдикция, что выбрана в настройках сайта. "
                    "Один документ = одна пара «юрисдикция + язык»."
                ),
            },
        ),
        (_("Текст"), {"fields": ("body",)}),
        (
            _("Публикация"),
            {"fields": ("version", "effective_date", "is_published", "show_in_footer", "order")},
        ),
    )
