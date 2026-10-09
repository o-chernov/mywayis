import re

from django import forms
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy

from apps.core.antispam import AntiSpamFormMixin

# Лимиты — часть контракта регистрации с API (см. README): username до 64 символов,
# email до 320. Схема пользователей в API должна их повторить.
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{1,62}[a-zA-Z0-9])?$")

RESERVED_USERNAMES = {
    "admin", "administrator", "root", "support", "help", "api", "www",
    "myway", "mywayis", "moderator", "system", "null", "undefined",
}


class RegistrationForm(AntiSpamFormMixin):
    """
    Форма регистрации. Ничего не сохраняет: валидирует ввод и передаёт его
    в клиент, который отправляет данные в FastAPI.
    """

    # pgettext, а не gettext: у Django есть собственный перевод msgid "Email"
    # («Адрес электронной почты»), и он перебивает наш. Контекст разводит записи.
    email = forms.EmailField(
        label=pgettext_lazy("подпись поля формы", "Email"),
        max_length=320,
        validators=[EmailValidator(message=_("Похоже, в адресе опечатка."))],
        widget=forms.EmailInput(
            attrs={
                "class": "input",
                "placeholder": "you@example.com",
                "autocomplete": "email",
                "autofocus": True,
            }
        ),
    )

    username = forms.CharField(
        label=pgettext_lazy("подпись поля формы", "Username"),
        max_length=64,
        min_length=2,
        help_text=_("Латиница, цифры, точка, дефис и подчёркивание. Его увидят в лидерборде."),
        widget=forms.TextInput(
            attrs={
                "class": "input",
                "placeholder": "kirill_dev",
                "autocomplete": "username",
                "spellcheck": "false",
            }
        ),
    )

    password = forms.CharField(
        label=_("Пароль"),
        min_length=8,
        max_length=128,
        help_text=_("Минимум 8 символов. Не используйте пароль от почты."),
        widget=forms.PasswordInput(
            attrs={"class": "input", "autocomplete": "new-password", "placeholder": "••••••••"}
        ),
    )

    agree = forms.BooleanField(
        label=_("Я принимаю условия"),
        error_messages={"required": _("Без согласия с условиями зарегистрироваться нельзя.")},
    )

    # Порядок важен: honeypot и метка времени идут последними в разметке.
    field_order = ["email", "username", "password", "agree", "website", "rendered_at"]

    def clean_email(self) -> str:
        # Нормализуем регистр: в базе email уникален, «Ivan@» и «ivan@» — один человек.
        return self.cleaned_data["email"].strip().lower()

    def clean_username(self) -> str:
        username = self.cleaned_data["username"].strip()

        if not USERNAME_PATTERN.match(username):
            raise ValidationError(
                _(
                    "Только латиница, цифры, точка, дефис и подчёркивание. "
                    "Начинаться и заканчиваться должен буквой или цифрой."
                )
            )

        if username.lower() in RESERVED_USERNAMES:
            raise ValidationError(_("Это имя зарезервировано, выберите другое."))

        return username

    def clean_password(self) -> str:
        password = self.cleaned_data["password"]
        # Стандартные проверки Django: длина, распространённость, «12345678».
        validate_password(password)
        return password

    def clean(self):
        cleaned = super().clean()
        email = cleaned.get("email")
        password = cleaned.get("password")

        if email and password and password.lower() == email.lower():
            self.add_error("password", _("Пароль не должен совпадать с email."))

        username = cleaned.get("username")
        if username and password and password.lower() == username.lower():
            self.add_error("password", _("Пароль не должен совпадать с username."))

        return cleaned
