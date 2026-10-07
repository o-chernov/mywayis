from django.http import HttpResponse
from django.shortcuts import render


def page_not_found(request, exception=None):
    return render(request, "errors/404.html", status=404)


def server_error(request):
    return render(request, "errors/500.html", status=500)


def robots_txt(request) -> HttpResponse:
    """
    robots.txt. Админку и служебные адреса из индекса убираем, остальное открыто.
    """
    site_url = request.build_absolute_uri("/").rstrip("/")
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /i18n/",
        "",
        f"Sitemap: {site_url}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain; charset=utf-8")
