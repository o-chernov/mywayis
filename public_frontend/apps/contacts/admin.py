from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import ContactRequest


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "email", "topic", "is_processed")
    list_filter = ("is_processed", "topic", "created_at")
    search_fields = ("name", "email", "message")
    date_hierarchy = "created_at"
    actions = ("mark_processed",)
    # Обращение приходит от человека — править его содержимое нельзя,
    # меняется только отметка «обработано».
    readonly_fields = ("name", "email", "topic", "message", "ip_hash", "language", "created_at")

    @admin.action(description=_("Отметить как обработанные"))
    def mark_processed(self, request, queryset):
        updated = queryset.update(is_processed=True)
        self.message_user(request, _("Обработано обращений: %(count)s") % {"count": updated})

    def has_add_permission(self, request) -> bool:
        return False
