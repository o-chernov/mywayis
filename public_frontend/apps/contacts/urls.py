from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "contacts"

urlpatterns = [
    path(_("kontakty/"), views.ContactsView.as_view(), name="contacts"),
]
