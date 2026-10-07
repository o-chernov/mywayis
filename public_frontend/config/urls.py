from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path

from apps.core.sitemaps import SITEMAPS
from apps.core.views import robots_txt

# Без языкового префикса: служебные адреса не переводятся.
urlpatterns = [
    path("admin/", admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")),
    path("robots.txt", robots_txt, name="robots"),
    path("sitemap.xml", sitemap, {"sitemaps": SITEMAPS}, name="django.contrib.sitemaps.views.sitemap"),
]

# prefix_default_language=False: у русского чистые адреса (/tarify),
# у английского — с префиксом (/en/pricing).
urlpatterns += i18n_patterns(
    path("", include("apps.pages.urls")),
    path("", include("apps.accounts.urls")),
    path("", include("apps.contacts.urls")),
    path("", include("apps.legal.urls")),
    prefix_default_language=False,
)

handler404 = "apps.core.views.page_not_found"
handler500 = "apps.core.views.server_error"

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
