from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "pages"

# Адреса переводятся: у русской версии /tarify, у английской /en/pricing.
urlpatterns = [
    path("", views.LandingView.as_view(), name="landing"),
    path(_("vozmozhnosti/"), views.FeaturesView.as_view(), name="features"),
    path(_("tarify/"), views.PricingView.as_view(), name="pricing"),
    path(_("voprosy/"), views.FaqView.as_view(), name="faq"),
    path(_("o-proekte/"), views.AboutView.as_view(), name="about"),
]
