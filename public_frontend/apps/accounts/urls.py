from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "accounts"

urlpatterns = [
    path(_("registraciya/"), views.RegisterView.as_view(), name="register"),
    path(_("registraciya/gotovo/"), views.RegisterDoneView.as_view(), name="register_done"),
    # Личный кабинет ведёт людей на /register — адрес должен работать
    # независимо от языка и от перевода урла.
    path("register/", views.register_redirect, name="register_short"),
]
