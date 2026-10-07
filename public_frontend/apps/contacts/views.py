import logging

from django.core.mail import send_mail
from django.shortcuts import redirect, render
from django.utils.translation import get_language
from django.utils.translation import gettext as _
from django.views import View

from apps.core.antispam import hash_ip, rate_limit_exceeded
from apps.core.models import SiteSettings

from .forms import ContactForm

logger = logging.getLogger(__name__)

SENT_SESSION_KEY = "contact_request_sent"


class ContactsView(View):
    template_name = "pages/contacts.html"

    def get(self, request):
        sent = request.session.pop(SENT_SESSION_KEY, False)
        return render(request, self.template_name, {"form": ContactForm(), "sent": sent})

    def post(self, request):
        form = ContactForm(request.POST)

        if not form.is_valid():
            return render(request, self.template_name, {"form": form}, status=400)

        # Боту показываем тот же успех — см. комментарий в accounts.views.
        if form.looks_like_bot:
            logger.info("Контакты: обращение отброшено как автоматическое")
            request.session[SENT_SESSION_KEY] = True
            return redirect("contacts:contacts")

        if rate_limit_exceeded(request, scope="contacts"):
            return render(
                request,
                self.template_name,
                {
                    "form": form,
                    "form_error": _("Слишком много обращений подряд. Попробуйте через несколько минут."),
                },
                status=429,
            )

        contact_request = form.save(commit=False)
        contact_request.ip_hash = hash_ip(request)
        contact_request.language = get_language() or ""
        contact_request.save()

        self._notify(contact_request)

        request.session[SENT_SESSION_KEY] = True
        return redirect("contacts:contacts")

    @staticmethod
    def _notify(contact_request) -> None:
        """
        Письмо администратору. Падение почты не должно ронять отправку формы:
        обращение уже сохранено и видно в админке.
        """
        site_settings = SiteSettings.get()
        try:
            send_mail(
                subject=f"[MyWay] {contact_request.get_topic_display()} — {contact_request.name}",
                message=(
                    f"От: {contact_request.name} <{contact_request.email}>\n"
                    f"Тема: {contact_request.get_topic_display()}\n\n"
                    f"{contact_request.message}"
                ),
                from_email=None,
                recipient_list=[site_settings.contact_email],
                fail_silently=False,
            )
        except Exception:
            logger.exception("Не удалось отправить уведомление об обращении #%s", contact_request.pk)
