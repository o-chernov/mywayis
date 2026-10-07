from django.core.cache import cache
from django.db import models
from django.utils.translation import gettext_lazy as _

SETTINGS_CACHE_KEY = "core.site_settings"
SETTINGS_CACHE_TTL = 300


class Jurisdiction(models.TextChoices):
    RU = "RU", _("Россия")
    US = "US", _("США")


class SiteSettings(models.Model):
    """
    Настройки публичного сайта. Синглтон: всегда одна запись с pk=1.

    Здесь живут решения, которые владелец меняет без деплоя — открыта ли
    регистрация, какой набор юридических документов показывать, куда писать.
    """

    # — Регистрация —
    registration_open = models.BooleanField(
        _("Регистрация открыта"),
        default=True,
        help_text=_(
            "Выключите, чтобы закрыть приём новых пользователей. "
            "Страница регистрации покажет сообщение ниже, кнопки в шапке скроются."
        ),
    )
    registration_closed_title = models.CharField(
        _("Заголовок при закрытой регистрации"),
        max_length=200,
        default="Регистрация временно закрыта",
    )
    registration_closed_message = models.TextField(
        _("Текст при закрытой регистрации"),
        default=(
            "Мы приостановили приём новых участников, чтобы спокойно довести "
            "сервис до ума. Напишите нам — сообщим, когда снова откроем."
        ),
    )

    # — Юрисдикция —
    legal_jurisdiction = models.CharField(
        _("Юрисдикция документов"),
        max_length=2,
        choices=Jurisdiction.choices,
        default=Jurisdiction.RU,
        help_text=_(
            "Определяет, какой набор юридических документов показывать. "
            "Смена перестраивает раздел «Документы» целиком."
        ),
    )

    # — Контакты —
    contact_email = models.EmailField(_("Email поддержки"), default="hello@mywayis.com")
    contact_telegram = models.CharField(
        _("Telegram"), max_length=100, blank=True, default="@mywayis"
    )
    support_hours = models.CharField(
        _("Время ответа"),
        max_length=200,
        blank=True,
        default="Отвечаем по будням с 10:00 до 19:00 МСК",
    )

    # — Реквизиты (для страницы документов и требований касс) —
    company_name = models.CharField(
        _("Наименование"), max_length=255, blank=True, default="ИП Чернов Олег"
    )
    company_inn = models.CharField(_("ИНН"), max_length=20, blank=True)
    company_ogrn = models.CharField(_("ОГРНИП / ОГРН"), max_length=20, blank=True)
    company_address = models.CharField(_("Адрес"), max_length=500, blank=True)

    # — Аналитика —
    analytics_enabled = models.BooleanField(
        _("Аналитика включена"),
        default=False,
        help_text=_("Пока выключено, счётчик не подключается и cookie не ставятся."),
    )
    metrika_id = models.CharField(_("ID Яндекс.Метрики"), max_length=32, blank=True)

    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)

    class Meta:
        verbose_name = _("Настройки сайта")
        verbose_name_plural = _("Настройки сайта")

    def __str__(self) -> str:
        return str(_("Настройки сайта"))

    def save(self, *args, **kwargs):
        # Синглтон: любая запись схлопывается в pk=1.
        self.pk = 1
        super().save(*args, **kwargs)
        cache.delete(SETTINGS_CACHE_KEY)

    def delete(self, *args, **kwargs):
        # Удалять настройки нечем — сайт без них не отрисуется.
        return None

    @classmethod
    def get(cls) -> "SiteSettings":
        """Настройки из кеша. Дёргается на каждой странице, поэтому кешируем."""
        settings_object = cache.get(SETTINGS_CACHE_KEY)
        if settings_object is None:
            settings_object, _created = cls.objects.get_or_create(pk=1)
            cache.set(SETTINGS_CACHE_KEY, settings_object, SETTINGS_CACHE_TTL)
        return settings_object
