from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy


class Topic(models.TextChoices):
    GENERAL = "general", _("Общий вопрос")
    SUPPORT = "support", _("Проблема с сервисом")
    BILLING = "billing", _("Оплата и подписка")
    PARTNERSHIP = "partnership", _("Сотрудничество")
    LEGAL = "legal", _("Юридический вопрос")


class ContactRequest(models.Model):
    """Обращение из формы на странице контактов."""

    name = models.CharField(_("Имя"), max_length=120)
    # См. комментарий в apps.accounts.forms — msgid "Email" занят Django.
    email = models.EmailField(pgettext_lazy("подпись поля формы", "Email"), max_length=320)
    topic = models.CharField(_("Тема"), max_length=20, choices=Topic.choices, default=Topic.GENERAL)
    message = models.TextField(_("Сообщение"))

    is_processed = models.BooleanField(_("Обработано"), default=False)
    # Адрес храним только в виде хеша — см. apps.core.antispam.hash_ip.
    ip_hash = models.CharField(_("Отпечаток адреса"), max_length=32, blank=True)
    language = models.CharField(_("Язык обращения"), max_length=5, blank=True)
    created_at = models.DateTimeField(_("Получено"), auto_now_add=True)

    class Meta:
        verbose_name = _("Обращение")
        verbose_name_plural = _("Обращения")
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("is_processed", "-created_at"))]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}> — {self.get_topic_display()}"
