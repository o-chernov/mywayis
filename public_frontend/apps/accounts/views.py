import logging

from django.conf import settings
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import get_language
from django.utils.translation import gettext as _
from django.views import View

from apps.core.antispam import rate_limit_exceeded
from apps.core.models import SiteSettings

from .forms import RegistrationForm
from .services import RegistrationError, get_registration_client

logger = logging.getLogger(__name__)

# Ключ сессии: страница «готово» показывается только после реальной отправки,
# иначе на неё можно просто зайти по адресу.
DONE_SESSION_KEY = "registration_done_email"


class RegisterView(View):
    template_name = "accounts/register.html"

    def dispatch(self, request, *args, **kwargs):
        # Тумблер в админке: закрыли приём — форма недоступна целиком,
        # а не просто спрятана кнопка в шапке.
        if not SiteSettings.get().registration_open:
            return render(request, "accounts/register_closed.html", status=503)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        return render(request, self.template_name, {"form": RegistrationForm()})

    def post(self, request):
        form = RegistrationForm(request.POST)

        if not form.is_valid():
            return render(request, self.template_name, {"form": form}, status=400)

        # Боту показываем ровно тот же успех, что и человеку: если ответить
        # ошибкой, он поймёт, что попался, и подберёт обход.
        if form.looks_like_bot:
            logger.info("Регистрация: отброшена как автоматическая")
            request.session[DONE_SESSION_KEY] = form.cleaned_data["email"]
            return redirect("accounts:register_done")

        if rate_limit_exceeded(request, scope="register"):
            return render(
                request,
                self.template_name,
                {
                    "form": form,
                    "form_error": _(
                        "Слишком много попыток за короткое время. "
                        "Подождите несколько минут и попробуйте снова."
                    ),
                },
                status=429,
            )

        client = get_registration_client()
        try:
            result = client.register(
                email=form.cleaned_data["email"],
                username=form.cleaned_data["username"],
                password=form.cleaned_data["password"],
                locale=get_language() or "ru",
            )
        except RegistrationError as error:
            for field_name, message in error.field_errors.items():
                form.add_error(field_name, message)
            return render(
                request,
                self.template_name,
                {"form": form, "form_error": error.message or None},
                status=400,
            )

        request.session[DONE_SESSION_KEY] = result.email
        return redirect("accounts:register_done")


class RegisterDoneView(View):
    template_name = "accounts/register_done.html"

    def get(self, request):
        email = request.session.pop(DONE_SESSION_KEY, None)
        if not email:
            # Прямой заход на страницу без регистрации — возвращаем на форму.
            return redirect("accounts:register")

        login_url = f"{settings.APP_URL}/login?email={email}"
        return render(request, self.template_name, {"email": email, "login_url": login_url})


def register_redirect(request):
    """Короткий адрес /register — на него ведёт ссылка из личного кабинета."""
    return redirect(reverse("accounts:register"), permanent=False)
