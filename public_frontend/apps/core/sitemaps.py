from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticPagesSitemap(Sitemap):
    """Статические страницы. Приоритет — по близости к конверсии."""

    protocol = "https"
    changefreq = "weekly"

    pages = {
        "pages:landing": 1.0,
        "accounts:register": 0.9,
        "pages:pricing": 0.8,
        "pages:features": 0.8,
        "pages:faq": 0.6,
        "pages:about": 0.5,
        "contacts:contacts": 0.5,
        "legal:index": 0.3,
    }

    def items(self) -> list[str]:
        return list(self.pages)

    def location(self, item: str) -> str:
        return reverse(item)

    def priority(self, item: str) -> float:
        return self.pages[item]


class LegalSitemap(Sitemap):
    protocol = "https"
    changefreq = "yearly"
    priority = 0.3

    def items(self):
        from apps.legal.selectors import published_documents

        return published_documents()

    def lastmod(self, item):
        return item.updated_at


SITEMAPS = {
    "pages": StaticPagesSitemap,
    "legal": LegalSitemap,
}
