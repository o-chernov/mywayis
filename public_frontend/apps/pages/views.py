from django.views.generic import TemplateView


class LandingView(TemplateView):
    template_name = "pages/landing.html"


class FeaturesView(TemplateView):
    template_name = "pages/features.html"


class PricingView(TemplateView):
    template_name = "pages/pricing.html"


class FaqView(TemplateView):
    template_name = "pages/faq.html"


class AboutView(TemplateView):
    template_name = "pages/about.html"
