from django import forms
from django.utils.translation import gettext_lazy as _

from apps.core.antispam import AntiSpamFormMixin

from .models import ContactRequest, Topic


class ContactForm(AntiSpamFormMixin, forms.ModelForm):
    class Meta:
        model = ContactRequest
        fields = ("name", "email", "topic", "message")
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "input", "placeholder": _("Как к вам обращаться"), "autocomplete": "name"}
            ),
            "email": forms.EmailInput(
                attrs={"class": "input", "placeholder": "you@example.com", "autocomplete": "email"}
            ),
            "topic": forms.Select(attrs={"class": "input"}),
            "message": forms.Textarea(
                attrs={
                    "class": "input",
                    "rows": 6,
                    "placeholder": _("Опишите вопрос — чем подробнее, тем быстрее ответим"),
                }
            ),
        }

    field_order = ["name", "email", "topic", "message", "website", "rendered_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["topic"].choices = Topic.choices

    def clean_message(self) -> str:
        message = self.cleaned_data["message"].strip()
        if len(message) < 20:
            raise forms.ValidationError(
                _("Слишком коротко: напишите хотя бы пару предложений, иначе нам нечего ответить.")
            )
        return message
