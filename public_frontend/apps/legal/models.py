from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from apps.core.models import Jurisdiction


class DocumentSlug(models.TextChoices):
    """
    Идентификаторы документов. Слаги общие для обеих юрисдикций там, где
    документ по смыслу тот же — тогда ссылка из письма или из кассы
    не ломается при смене юрисдикции.
    """

    TERMS = "terms", _("Пользовательское соглашение")
    PRIVACY = "privacy", _("Политика конфиденциальности")
    CONSENT = "consent", _("Согласие на обработку персональных данных")
    COOKIES = "cookies", _("Политика в отношении cookie")
    OFFER = "offer", _("Публичная оферта")
    REFUND = "refund", _("Политика возврата средств")
    REQUISITES = "requisites", _("Реквизиты")
    AUP = "aup", _("Acceptable Use Policy")
    DMCA = "dmca", _("DMCA / Copyright Policy")


class LegalDocument(models.Model):
    """
    Юридический документ в конкретной юрисдикции и на конкретном языке.

    Набор документов зависит от активной юрисдикции (см. SiteSettings):
    в РФ нужны согласие на обработку ПДн и оферта, в США — AUP и DMCA.
    """

    slug = models.CharField(_("Идентификатор"), max_length=32, choices=DocumentSlug.choices)
    jurisdiction = models.CharField(
        _("Юрисдикция"), max_length=2, choices=Jurisdiction.choices, default=Jurisdiction.RU
    )
    language = models.CharField(
        _("Язык"), max_length=5, choices=[("ru", "Русский"), ("en", "English")], default="ru"
    )

    title = models.CharField(_("Заголовок"), max_length=255)
    summary = models.CharField(
        _("Краткое описание"),
        max_length=500,
        blank=True,
        help_text=_("Одна строка для списка документов."),
    )
    body = models.TextField(
        _("Текст"),
        help_text=_("Markdown: ## заголовки, списки, таблицы, **выделение**."),
    )

    version = models.CharField(_("Версия"), max_length=20, default="1.0")
    effective_date = models.DateField(_("Действует с"))
    is_published = models.BooleanField(_("Опубликован"), default=True)
    # Нужен ли документ в подвале — там место только для основных.
    show_in_footer = models.BooleanField(_("Показывать в подвале"), default=False)
    order = models.PositiveSmallIntegerField(_("Порядок"), default=100)

    created_at = models.DateTimeField(_("Создан"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлён"), auto_now=True)

    class Meta:
        verbose_name = _("Юридический документ")
        verbose_name_plural = _("Юридические документы")
        ordering = ("order", "title")
        constraints = [
            models.UniqueConstraint(
                fields=("slug", "jurisdiction", "language"),
                name="uq_legal_document_slug_jurisdiction_language",
            )
        ]

    def __str__(self) -> str:
        return f"{self.title} [{self.jurisdiction}/{self.language}]"

    def get_absolute_url(self) -> str:
        return reverse("legal:document", kwargs={"slug": self.slug})
