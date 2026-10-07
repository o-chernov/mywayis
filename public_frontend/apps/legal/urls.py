from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "legal"

urlpatterns = [
    path(_("dokumenty/"), views.LegalIndexView.as_view(), name="index"),
    path(_("dokumenty/<slug:slug>/"), views.LegalDocumentView.as_view(), name="document"),
]
